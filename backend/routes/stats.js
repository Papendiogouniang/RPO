import express from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics (Admin only)
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const [
      totalEvents,
      totalUsers,
      totalTickets,
      totalRevenue,
      recentEvents,
      recentTickets,
      monthlyStats
    ] = await Promise.all([
      // Total counts
      Event.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Ticket.countDocuments({ paymentStatus: 'completed' }),
      
      // Total revenue
      Ticket.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      
      // Recent events
      Event.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title date location createdAt')
        .lean(),
      
      // Recent tickets
      Ticket.find({ paymentStatus: 'completed' })
        .populate('event', 'title')
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      
      // Monthly statistics
      Ticket.aggregate([
        {
          $match: {
            paymentStatus: 'completed',
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalEvents,
          totalUsers,
          totalTickets,
          totalRevenue: revenue
        },
        recentEvents,
        recentTickets,
        monthlyStats: monthlyStats.map(stat => ({
          month: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`,
          tickets: stat.count,
          revenue: stat.revenue
        }))
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// Get event statistics (Admin only)
router.get('/events', protect, adminOnly, async (req, res) => {
  try {
    const eventStats = await Event.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: 'tickets',
          localField: '_id',
          foreignField: 'event',
          as: 'tickets'
        }
      },
      {
        $addFields: {
          soldTickets: {
            $size: {
              $filter: {
                input: '$tickets',
                cond: { $eq: ['$$this.paymentStatus', 'completed'] }
              }
            }
          },
          revenue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$tickets',
                    cond: { $eq: ['$$this.paymentStatus', 'completed'] }
                  }
                },
                as: 'ticket',
                in: '$$ticket.totalAmount'
              }
            }
          }
        }
      },
      {
        $project: {
          title: 1,
          date: 1,
          location: 1,
          capacity: 1,
          soldTickets: 1,
          availableTickets: 1,
          revenue: 1,
          price: 1,
          isFeatured: 1
        }
      },
      { $sort: { date: -1 } }
    ]);

    res.json({
      success: true,
      data: eventStats
    });
  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques d\'événements'
    });
  }
});

// Get sales analytics (Admin only)
router.get('/sales', protect, adminOnly, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let matchStage = {
      paymentStatus: 'completed'
    };
    
    // Set date range based on period
    const now = new Date();
    if (period === 'week') {
      matchStage.createdAt = {
        $gte: new Date(now.setDate(now.getDate() - 7))
      };
    } else if (period === 'month') {
      matchStage.createdAt = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1)
      };
    } else if (period === 'year') {
      matchStage.createdAt = {
        $gte: new Date(now.getFullYear(), 0, 1)
      };
    }

    const salesData = await Ticket.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'week' ? '%Y-%m-%d' : period === 'month' ? '%Y-%m-%d' : '%Y-%m',
              date: '$createdAt'
            }
          },
          totalSales: { $sum: '$totalAmount' },
          ticketsSold: { $sum: '$quantity' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true,
      data: salesData
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données de vente'
    });
  }
});

export default router;