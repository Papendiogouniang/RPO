import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Ticket, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const ticketId = searchParams.get('ticketId');
      const paymentStatus = searchParams.get('status');
      const reference = searchParams.get('reference');

      if (!ticketId) {
        setStatus('failed');
        return;
      }

      try {
        // Update payment status
        const response = await api.patch(`/tickets/${ticketId}/payment`, {
          status: paymentStatus === 'success' ? 'completed' : 'failed',
          reference
        });

        if (paymentStatus === 'success') {
          setStatus('success');
          setTicket(response.data.data);
        } else {
          setStatus('failed');
        }
      } catch (error) {
        console.error('Payment callback error:', error);
        setStatus('failed');
      }
    };

    handleCallback();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-kanzey-yellow mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Vérification du paiement...
          </h2>
          <p className="text-gray-600">
            Veuillez patienter pendant que nous vérifions votre paiement.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement réussi !
          </h1>
          
          <p className="text-gray-600 mb-6">
            Votre billet a été confirmé et envoyé par email.
          </p>

          {ticket && (
            <div className="bg-kanzey-yellow rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-kanzey-black mb-2">
                Détails du billet
              </h3>
              <div className="text-sm text-kanzey-black space-y-1">
                <p><strong>Événement:</strong> {ticket.event.title}</p>
                <p><strong>Numéro:</strong> {ticket.ticketNumber}</p>
                <p><strong>Quantité:</strong> {ticket.quantity}</p>
                <p><strong>Montant:</strong> {ticket.totalAmount.toLocaleString()} FCFA</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Paiement échoué
        </h1>
        
        <p className="text-gray-600 mb-6">
          Une erreur s'est produite lors du traitement de votre paiement. Veuillez réessayer.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
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
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;