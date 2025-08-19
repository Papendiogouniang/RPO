import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Ticket, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

interface TicketData {
  _id: string;
  ticketNumber: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentReference: string;
  qrCode?: string;
  event: {
    title: string;
    date: string;
    time: string;
    location: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const PaymentStatus: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (ticketId) {
      checkPaymentStatus();
      
      // Set up polling for pending payments
      const interval = setInterval(() => {
        if (ticket?.paymentStatus === 'pending') {
          checkPaymentStatus();
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [ticketId, ticket?.paymentStatus]);

  const checkPaymentStatus = async () => {
    try {
      setChecking(true);
      const response = await api.get(`/payment/status/${ticketId}`);
      setTicket(response.data.data.ticket);
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error('Erreur lors de la vérification du statut');
    } finally {
      setLoading(false);
      setChecking(false);
    }
  };

  const handleRefresh = () => {
    checkPaymentStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-kanzey-yellow mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Vérification du statut de paiement...
          </h2>
          <p className="text-gray-600">
            Veuillez patienter pendant que nous vérifions votre paiement.
          </p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Billet non trouvé
          </h1>
          <p className="text-gray-600 mb-6">
            Impossible de trouver les informations de ce billet.
          </p>
          <Link
            to="/events"
            className="w-full bg-kanzey-yellow text-kanzey-black py-3 px-4 rounded-lg font-medium hover:bg-yellow-400 transition-colors inline-block"
          >
            Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  const getStatusDisplay = () => {
    switch (ticket.paymentStatus) {
      case 'completed':
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />,
          title: 'Paiement réussi !',
          message: 'Votre billet a été confirmé et envoyé par email.',
          color: 'text-green-600'
        };
      case 'pending':
        return {
          icon: <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-pulse" />,
          title: 'Paiement en cours...',
          message: 'Veuillez compléter le paiement sur votre téléphone mobile.',
          color: 'text-yellow-600'
        };
      case 'failed':
        return {
          icon: <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />,
          title: 'Paiement échoué',
          message: 'Une erreur s\'est produite lors du paiement. Veuillez réessayer.',
          color: 'text-red-600'
        };
      default:
        return {
          icon: <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />,
          title: 'Statut inconnu',
          message: 'Statut de paiement non reconnu.',
          color: 'text-gray-600'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {statusDisplay.icon}
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {statusDisplay.title}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {statusDisplay.message}
        </p>

        {/* Ticket Details */}
        <div className="bg-kanzey-yellow rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-kanzey-black mb-2">
            Détails du billet
          </h3>
          <div className="text-sm text-kanzey-black space-y-1">
            <p><strong>Événement:</strong> {ticket.event.title}</p>
            <p><strong>Numéro:</strong> {ticket.ticketNumber}</p>
            <p><strong>Quantité:</strong> {ticket.quantity}</p>
            <p><strong>Montant:</strong> {ticket.totalAmount.toLocaleString()} FCFA</p>
            <p><strong>Date:</strong> {new Date(ticket.event.date).toLocaleDateString('fr-FR')}</p>
            <p><strong>Heure:</strong> {ticket.event.time}</p>
            <p><strong>Lieu:</strong> {ticket.event.location}</p>
          </div>
        </div>

        {/* Status-specific actions */}
        <div className="space-y-3">
          {ticket.paymentStatus === 'completed' && (
            <>
              <Link
                to="/my-tickets"
                className="w-full bg-kanzey-yellow text-kanzey-black py-3 px-4 rounded-lg font-medium hover:bg-yellow-400 transition-colors inline-flex items-center justify-center"
              >
                <Ticket className="mr-2" size={20} />
                Voir mes billets
              </Link>
              
              <Link
                to="/events"
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
              >
                Découvrir d'autres événements
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </>
          )}

          {ticket.paymentStatus === 'pending' && (
            <>
              <button
                onClick={handleRefresh}
                disabled={checking}
                className="w-full bg-kanzey-yellow text-kanzey-black py-3 px-4 rounded-lg font-medium hover:bg-yellow-400 transition-colors inline-flex items-center justify-center disabled:opacity-50"
              >
                {checking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-kanzey-black mr-2"></div>
                    Vérification...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2" size={20} />
                    Actualiser le statut
                  </>
                )}
              </button>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Instructions:</strong><br />
                  1. Vérifiez votre téléphone mobile<br />
                  2. Suivez les instructions de paiement<br />
                  3. Confirmez la transaction<br />
                  4. Cette page se mettra à jour automatiquement
                </p>
              </div>
            </>
          )}

          {ticket.paymentStatus === 'failed' && (
            <>
              <button
                onClick={() => navigate(`/events/${ticket.event._id || ''}`)}
                className="w-full bg-kanzey-yellow text-kanzey-black py-3 px-4 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
              >
                Réessayer le paiement
              </button>
              
              <Link
                to="/events"
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors inline-block"
              >
                Retour aux événements
              </Link>
            </>
          )}
        </div>

        {/* Payment Reference */}
        {ticket.paymentReference && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Référence: {ticket.paymentReference}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;