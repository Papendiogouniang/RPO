import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Search, 
  Filter, 
  Eye, 
  Check, 
  X,
  Calendar,
  User,
  CreditCard,
  Download
} from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

interface TicketData {
  _id: string;
  ticketNumber: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentReference: string;
  isUsed: boolean;
  usedAt?: string;
  createdAt: string;
  event: {
    _id: string;
    title: string;
    date: string;
    time: string;
    location: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

const AdminTickets: React.FC = () => {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchTickets();
    fetchEvents();
  }, [searchTerm, statusFilter, eventFilter, currentPage]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (eventFilter !== 'all') params.append('eventId', eventFilter);
      params.append('page', currentPage.toString());
      params.append('limit', '20');

      const response = await api.get(`/tickets?${params}`);
      setTickets(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Erreur lors de la récupération des billets');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events?limit=100');
      setEvents(response.data.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const validateTicket = async (ticketId: string) => {
    try {
      await api.patch(`/tickets/${ticketId}/validate`);
      toast.success('Billet validé avec succès');
      fetchTickets();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erreur lors de la validation';
      toast.error(message);
    }
  };

  const getStatusIcon = (status: string, isUsed: boolean) => {
    if (isUsed) {
      return <Check className="text-green-500" size={16} />;
    }
    
    switch (status) {
      case 'completed':
        return <Check className="text-green-500" size={16} />;
      case 'pending':
        return <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>;
      case 'failed':
        return <X className="text-red-500" size={16} />;
      case 'refunded':
        return <div className="w-4 h-4 bg-blue-500 rounded-full"></div>;
      default:
        return <div className="w-4 h-4 bg-gray-500 rounded-full"></div>;
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
      case 'refunded':
        return { text: 'Remboursé', color: 'text-blue-600' };
      default:
        return { text: 'Inconnu', color: 'text-gray-600' };
    }
  };

  const exportTickets = () => {
    const csvContent = [
      // Header
      ['Numéro', 'Événement', 'Client', 'Email', 'Quantité', 'Montant', 'Statut', 'Date'].join(','),
      // Data
      ...tickets.map(ticket => [
        ticket.ticketNumber,
        ticket.event.title,
        `${ticket.user.firstName} ${ticket.user.lastName}`,
        ticket.user.email,
        ticket.quantity,
        ticket.totalAmount,
        ticket.paymentStatus,
        new Date(ticket.createdAt).toLocaleDateString('fr-FR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billets-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Export terminé');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-kanzey-black">Gestion des billets</h1>
            <p className="text-gray-600 mt-2">Gérez tous les billets vendus sur la plateforme</p>
          </div>
          
          <button
            onClick={exportTickets}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors inline-flex items-center"
          >
            <Download className="mr-2" size={20} />
            Exporter CSV
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Numéro de billet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
              />
            </div>
            
            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
              >
                <option value="all">Tous les statuts</option>
                <option value="completed">Confirmés</option>
                <option value="pending">En attente</option>
                <option value="failed">Échoués</option>
                <option value="refunded">Remboursés</option>
              </select>
            </div>

            {/* Event Filter */}
            <div className="lg:col-span-2">
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
              >
                <option value="all">Tous les événements</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title} - {new Date(event.date).toLocaleDateString('fr-FR')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total billets</p>
                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
              </div>
              <Ticket className="text-kanzey-yellow" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Confirmés</p>
                <p className="text-2xl font-bold text-green-600">
                  {tickets.filter(t => t.paymentStatus === 'completed').length}
                </p>
              </div>
              <Check className="text-green-500" size={32} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tickets.filter(t => t.paymentStatus === 'pending').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Utilisés</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tickets.filter(t => t.isUsed).length}
                </p>
              </div>
              <Eye className="text-blue-500" size={32} />
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kanzey-yellow mx-auto"></div>
            </div>
          ) : tickets.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Billet
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Événement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tickets.map((ticket) => {
                      const status = getStatusText(ticket.paymentStatus, ticket.isUsed);
                      return (
                        <tr key={ticket._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                #{ticket.ticketNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                Qté: {ticket.quantity}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                {ticket.event.title}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Calendar className="mr-1" size={12} />
                                {new Date(ticket.event.date).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {ticket.user.firstName} {ticket.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {ticket.user.email}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900">
                              {ticket.totalAmount.toLocaleString()} FCFA
                            </div>
                            {ticket.paymentReference && (
                              <div className="text-xs text-gray-500">
                                Réf: {ticket.paymentReference.slice(-8)}
                              </div>
                            )}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(ticket.paymentStatus, ticket.isUsed)}
                              <span className={`ml-2 text-sm font-medium ${status.color}`}>
                                {status.text}
                              </span>
                            </div>
                            {ticket.isUsed && ticket.usedAt && (
                              <div className="text-xs text-gray-500">
                                Utilisé le {new Date(ticket.usedAt).toLocaleDateString('fr-FR')}
                              </div>
                            )}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {ticket.paymentStatus === 'completed' && !ticket.isUsed && (
                              <button
                                onClick={() => validateTicket(ticket._id)}
                                className="bg-green-100 text-green-600 px-3 py-1 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                              >
                                Valider
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Précédent
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Suivant
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Page <span className="font-medium">{currentPage}</span> sur{' '}
                          <span className="font-medium">{totalPages}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  pageNum === currentPage
                                    ? 'z-10 bg-kanzey-yellow border-kanzey-yellow text-kanzey-black'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <Ticket size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucun billet trouvé
              </h3>
              <p className="text-gray-500">
                Aucun billet ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTickets;