import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Download, QrCode, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

interface Ticket {
  _id: string;
  ticketNumber: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  qrCode: string;
  isUsed: boolean;
  usedAt?: string;
  createdAt: string;
  event: {
    title: string;
    date: string;
    time: string;
    location: string;
    image: string;
  };
}

const MyTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'used'>('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets/my-tickets');
      setTickets(response.data.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Erreur lors de la récupération des billets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, isUsed: boolean) => {
    if (isUsed) {
      return <CheckCircle className="text-green-500" size={20} />;
    }
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'pending':
        return <ClockIcon className="text-yellow-500" size={20} />;
      case 'failed':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <ClockIcon className="text-gray-500" size={20} />;
    }
  };

  const getStatusText = (status: string, isUsed: boolean) => {
    if (isUsed) {
      return { text: 'Utilisé', color: 'text-green-600' };
    }
    
    switch (status) {
      case 'completed':
        return { text: 'Confirmé', color: 'text-green-600' };
      case 'pending':
        return { text: 'En attente', color: 'text-yellow-600' };
      case 'failed':
        return { text: 'Échoué', color: 'text-red-600' };
      default:
        return { text: 'Inconnu', color: 'text-gray-600' };
    }
  };

  const downloadTicket = (ticket: Ticket) => {
    // Create a simple ticket PDF/image download
    const ticketContent = `
      KANZEY.CO - BILLET ÉLECTRONIQUE
      
      Événement: ${ticket.event.title}
      Date: ${new Date(ticket.event.date).toLocaleDateString('fr-FR')}
      Heure: ${ticket.event.time}
      Lieu: ${ticket.event.location}
      
      Numéro de billet: ${ticket.ticketNumber}
      Quantité: ${ticket.quantity}
      Montant: ${ticket.totalAmount.toLocaleString()} FCFA
      
      Code QR: ${ticket.qrCode ? 'Disponible' : 'Non disponible'}
      
      Conservez ce billet jusqu'à l'événement.
    `;

    const blob = new Blob([ticketContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billet-${ticket.ticketNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Billet téléchargé');
  };

  const filteredTickets = tickets.filter(ticket => {
    switch (filter) {
      case 'completed':
        return ticket.paymentStatus === 'completed' && !ticket.isUsed;
      case 'pending':
        return ticket.paymentStatus === 'pending';
      case 'used':
        return ticket.isUsed;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-kanzey-yellow"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-kanzey-black">Mes Billets</h1>
          <p className="text-gray-600 mt-2">Gérez tous vos billets d'événements</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Tous' },
              { key: 'completed', label: 'Confirmés' },
              { key: 'pending', label: 'En attente' },
              { key: 'used', label: 'Utilisés' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-kanzey-yellow text-kanzey-black'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => {
              const status = getStatusText(ticket.paymentStatus, ticket.isUsed);
              const isEventPassed = new Date(ticket.event.date) < new Date();
              
              return (
                <div
                  key={ticket._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Event Image */}
                  <div className="relative">
                    {ticket.event.image ? (
                      <img
                        src={`http://localhost:5000${ticket.event.image}`}
                        alt={ticket.event.title}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-r from-kanzey-yellow to-yellow-400 flex items-center justify-center">
                        <Calendar size={40} className="text-kanzey-black" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 flex items-center space-x-1 bg-white px-2 py-1 rounded-full">
                      {getStatusIcon(ticket.paymentStatus, ticket.isUsed)}
                      <span className={`text-sm font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-kanzey-black mb-3 line-clamp-2">
                      {ticket.event.title}
                    </h3>

                    {/* Event Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="mr-2 text-kanzey-yellow" size={16} />
                        <span className="text-sm">
                          {new Date(ticket.event.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="mr-2 text-kanzey-yellow" size={16} />
                        <span className="text-sm">{ticket.event.time}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="mr-2 text-kanzey-yellow" size={16} />
                        <span className="text-sm">{ticket.event.location}</span>
                      </div>
                    </div>

                    {/* Ticket Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 text-sm">Numéro de billet</span>
                        <span className="font-mono text-sm font-medium">{ticket.ticketNumber}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 text-sm">Quantité</span>
                        <span className="font-medium">{ticket.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 text-sm">Montant</span>
                        <span className="font-bold text-kanzey-black">
                          {ticket.totalAmount.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadTicket(ticket)}
                        disabled={ticket.paymentStatus !== 'completed'}
                        className="flex-1 bg-kanzey-yellow text-kanzey-black py-2 px-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <Download size={16} className="mr-1" />
                        Télécharger
                      </button>
                      
                      {ticket.qrCode && ticket.paymentStatus === 'completed' && (
                        <button
                          onClick={() => {
                            // Show QR code modal or navigate to QR display
                            window.open(ticket.qrCode, '_blank');
                          }}
                          className="bg-kanzey-black text-white py-2 px-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
                        >
                          <QrCode size={16} />
                        </button>
                      )}
                    </div>

                    {/* Additional Info */}
                    {ticket.isUsed && ticket.usedAt && (
                      <div className="mt-3 text-center">
                        <p className="text-xs text-gray-500">
                          Utilisé le {new Date(ticket.usedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )}
                    
                    {!ticket.isUsed && isEventPassed && ticket.paymentStatus === 'completed' && (
                      <div className="mt-3 text-center">
                        <p className="text-xs text-orange-600">
                          Événement passé - Billet non utilisé
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Aucun billet trouvé
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Vous n\'avez pas encore acheté de billets.'
                : `Aucun billet ${filter === 'completed' ? 'confirmé' : filter === 'pending' ? 'en attente' : 'utilisé'} trouvé.`
              }
            </p>
            <a
              href="/events"
              className="bg-kanzey-yellow text-kanzey-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors inline-block"
            >
              Découvrir les événements
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;