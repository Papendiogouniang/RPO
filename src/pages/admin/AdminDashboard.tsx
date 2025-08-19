import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Ticket, 
  DollarSign,
  TrendingUp,
  Eye,
  BarChart3,
  Activity
} from 'lucide-react';
import { api } from '../../utils/api';

interface DashboardStats {
  summary: {
    totalEvents: number;
    totalUsers: number;
    totalTickets: number;
    totalRevenue: number;
  };
  recentEvents: Array<{
    _id: string;
    title: string;
    date: string;
    location: string;
    createdAt: string;
  }>;
  recentTickets: Array<{
    _id: string;
    ticketNumber: string;
    totalAmount: number;
    createdAt: string;
    event: { title: string };
    user: { firstName: string; lastName: string };
  }>;
  monthlyStats: Array<{
    month: string;
    tickets: number;
    revenue: number;
  }>;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/stats/dashboard');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-kanzey-yellow"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Événements',
      value: stats?.summary.totalEvents || 0,
      icon: Calendar,
      color: 'bg-blue-500',
      link: '/admin/events'
    },
    {
      title: 'Utilisateurs',
      value: stats?.summary.totalUsers || 0,
      icon: Users,
      color: 'bg-green-500',
      link: '/admin/users'
    },
    {
      title: 'Billets vendus',
      value: stats?.summary.totalTickets || 0,
      icon: Ticket,
      color: 'bg-purple-500',
      link: '/admin/tickets'
    },
    {
      title: 'Revenus',
      value: `${(stats?.summary.totalRevenue || 0).toLocaleString()} FCFA`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      link: '/admin/tickets'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-kanzey-black">Tableau de bord administrateur</h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble de la plateforme Kanzey.CO</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.title}
                to={stat.link}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg text-white group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Events */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Calendar className="mr-2 text-kanzey-yellow" size={24} />
                Événements récents
              </h2>
              <Link
                to="/admin/events"
                className="text-kanzey-yellow hover:text-yellow-600 font-medium flex items-center"
              >
                <Eye className="mr-1" size={16} />
                Voir tout
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats?.recentEvents.map((event) => (
                <div key={event._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(event.date).toLocaleDateString('fr-FR')} • {event.location}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(event.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">Aucun événement récent</p>
              )}
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Ticket className="mr-2 text-kanzey-yellow" size={24} />
                Ventes récentes
              </h2>
              <Link
                to="/admin/tickets"
                className="text-kanzey-yellow hover:text-yellow-600 font-medium flex items-center"
              >
                <Eye className="mr-1" size={16} />
                Voir tout
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats?.recentTickets.map((ticket) => (
                <div key={ticket._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">#{ticket.ticketNumber}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{ticket.event.title}</p>
                    <p className="text-xs text-gray-500">
                      {ticket.user.firstName} {ticket.user.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {ticket.totalAmount.toLocaleString()} FCFA
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">Aucune vente récente</p>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Stats Chart */}
        {stats?.monthlyStats && stats.monthlyStats.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <BarChart3 className="mr-2 text-kanzey-yellow" size={24} />
              Statistiques mensuelles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Revenue Chart */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Revenus par mois</h3>
                <div className="space-y-2">
                  {stats.monthlyStats.slice(-6).map((stat) => (
                    <div key={stat.month} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(stat.month + '-01').toLocaleDateString('fr-FR', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="bg-kanzey-yellow h-2 rounded"
                          style={{ 
                            width: `${Math.max(10, (stat.revenue / Math.max(...stats.monthlyStats.map(s => s.revenue))) * 100)}px` 
                          }}
                        ></div>
                        <span className="text-sm font-medium">
                          {stat.revenue.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tickets Chart */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-4">Billets vendus par mois</h3>
                <div className="space-y-2">
                  {stats.monthlyStats.slice(-6).map((stat) => (
                    <div key={stat.month} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(stat.month + '-01').toLocaleDateString('fr-FR', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="bg-green-500 h-2 rounded"
                          style={{ 
                            width: `${Math.max(10, (stat.tickets / Math.max(...stats.monthlyStats.map(s => s.tickets))) * 100)}px` 
                          }}
                        ></div>
                        <span className="text-sm font-medium">
                          {stat.tickets} billets
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <Activity className="mr-2 text-kanzey-yellow" size={24} />
            Actions rapides
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Link
              to="/admin/events"
              className="bg-kanzey-yellow text-kanzey-black p-4 rounded-lg font-medium hover:bg-yellow-400 transition-colors text-center"
            >
              <Calendar className="mx-auto mb-2" size={24} />
              Gérer les événements
            </Link>
            
            <Link
              to="/admin/users"
              className="bg-green-500 text-white p-4 rounded-lg font-medium hover:bg-green-600 transition-colors text-center"
            >
              <Users className="mx-auto mb-2" size={24} />
              Gérer les utilisateurs
            </Link>
            
            <Link
              to="/admin/tickets"
              className="bg-purple-500 text-white p-4 rounded-lg font-medium hover:bg-purple-600 transition-colors text-center"
            >
              <Ticket className="mx-auto mb-2" size={24} />
              Voir les billets
            </Link>
            
            <Link
              to="/admin/slides"
              className="bg-blue-500 text-white p-4 rounded-lg font-medium hover:bg-blue-600 transition-colors text-center"
            >
              <TrendingUp className="mx-auto mb-2" size={24} />
              Gérer les slides
            </Link>
            
            <Link
              to="/admin/settings"
              className="bg-gray-500 text-white p-4 rounded-lg font-medium hover:bg-gray-600 transition-colors text-center"
            >
              <TrendingUp className="mx-auto mb-2" size={24} />
              Paramètres
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;