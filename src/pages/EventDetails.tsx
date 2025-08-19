import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Ticket, ArrowLeft, Star, Share2 } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  address: string;
  price: number;
  category: string;
  image: string;
  isFeatured: boolean;
  availableTickets: number;
  capacity: number;
  organizer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/events/${id}`);
      setEvent(response.data.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Événement non trouvé');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour acheter un billet');
      navigate('/login');
      return;
    }

    if (quantity > event!.availableTickets) {
      toast.error('Quantité non disponible');
      return;
    }

    setPurchasing(true);

    try {
      // Initialize payment
      const response = await api.post('/payment/intouch/init', {
        eventId: id,
        quantity
      });

      const paymentData = response.data.data;

      // Redirect to payment status page
      navigate(`/payment/status/${paymentData.ticketId}`);

    } catch (error: unknown) {
      console.error('Payment initialization error:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError.response?.data?.message || 'Erreur lors de l\'initialisation du paiement';
      
      // Provide more specific error messages
      if (message.includes('Profil utilisateur incomplet')) {
        toast.error('Veuillez compléter votre profil avant de continuer');
        navigate('/profile');
      } else if (message.includes('Configuration de paiement')) {
        toast.error('Configuration de paiement incomplète. Contactez l\'administrateur.');
      } else if (message.includes('Billets non disponibles')) {
        toast.error(message);
      } else {
        toast.error(message);
      }
      
      setPurchasing(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: `Découvrez cet événement sur Kanzey.CO: ${event?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-kanzey-yellow"></div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const totalPrice = event.price * quantity;
  const isEventPassed = new Date(event.date) < new Date();
  const isSoldOut = event.availableTickets === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-kanzey-yellow transition-colors mb-6"
        >
          <ArrowLeft className="mr-2" size={20} />
          Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Event Image */}
          <div className="relative">
            {event.image ? (
              <img
                src={`http://localhost:5000${event.image}`}
                alt={event.title}
                className="w-full h-96 lg:h-[500px] object-cover rounded-xl shadow-lg"
              />
            ) : (
              <div className="w-full h-96 lg:h-[500px] bg-gradient-to-r from-kanzey-yellow to-yellow-400 flex items-center justify-center rounded-xl shadow-lg">
                <Calendar size={80} className="text-kanzey-black" />
              </div>
            )}
            
            {event.isFeatured && (
              <div className="absolute top-6 left-6 bg-kanzey-yellow text-kanzey-black px-4 py-2 rounded-full font-bold flex items-center">
                <Star size={16} className="mr-2" />
                À la une
              </div>
            )}

            <button
              onClick={handleShare}
              className="absolute top-6 right-6 bg-white text-kanzey-black p-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <Share2 size={20} />
            </button>
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <div>
              <div className="inline-block bg-kanzey-yellow text-kanzey-black px-3 py-1 rounded-full text-sm font-medium mb-4">
                {event.category}
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-kanzey-black mb-4">
                {event.title}
              </h1>
              
              <p className="text-gray-600 text-lg leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Event Info */}
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <Calendar className="mr-4 text-kanzey-yellow" size={24} />
                <div>
                  <div className="font-semibold">
                    {new Date(event.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <Clock className="mr-4 text-kanzey-yellow" size={24} />
                <div>
                  <div className="font-semibold">{event.time}</div>
                </div>
              </div>

              <div className="flex items-start text-gray-700">
                <MapPin className="mr-4 text-kanzey-yellow mt-1" size={24} />
                <div>
                  <div className="font-semibold">{event.location}</div>
                  <div className="text-sm text-gray-500">{event.address}</div>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <Users className="mr-4 text-kanzey-yellow" size={24} />
                <div>
                  <div className="font-semibold">
                    {event.availableTickets} places disponibles
                  </div>
                  <div className="text-sm text-gray-500">
                    sur {event.capacity} places au total
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-lg text-kanzey-black mb-4">
                Organisé par
              </h3>
              <div className="flex items-center space-x-4">
                <div className="bg-kanzey-yellow text-kanzey-black w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                  {event.organizer.firstName.charAt(0)}{event.organizer.lastName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-kanzey-black">
                    {event.organizer.firstName} {event.organizer.lastName}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {event.organizer.email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Section */}
        <div className="mt-12 bg-white rounded-xl p-8 shadow-lg">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="text-3xl font-bold text-kanzey-black mb-2">
                {event.price.toLocaleString()} FCFA
              </div>
              <p className="text-gray-600">par billet</p>
            </div>

            <div className="flex items-center gap-6">
              {!isEventPassed && !isSoldOut && (
                <>
                  <div className="flex items-center gap-3">
                    <label className="text-gray-700 font-medium">Quantité:</label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-4 py-2 border-l border-r border-gray-300 min-w-[60px] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(event.availableTickets, quantity + 1))}
                        className="px-3 py-2 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-kanzey-black">
                      Total: {totalPrice.toLocaleString()} FCFA
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={handlePurchase}
                disabled={purchasing || isEventPassed || isSoldOut || !user}
                className={`px-8 py-4 rounded-lg font-bold text-lg flex items-center transition-colors ${
                  isEventPassed || isSoldOut
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : !user
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-kanzey-yellow text-kanzey-black hover:bg-yellow-400'
                }`}
              >
                {purchasing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-kanzey-black mr-2"></div>
                    Traitement...
                  </>
                ) : isEventPassed ? (
                  'Événement passé'
                ) : isSoldOut ? (
                  'Complet'
                ) : !user ? (
                  'Connectez-vous pour réserver'
                ) : (
                  <>
                    <Ticket className="mr-2" size={20} />
                    Acheter maintenant
                  </>
                )}
              </button>
            </div>
          </div>

          {!user && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                <strong>Vous devez être connecté</strong> pour acheter des billets.{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-kanzey-yellow hover:underline font-medium"
                >
                  Se connecter
                </button>
                {' ou '}
                <button
                  onClick={() => navigate('/register')}
                  className="text-kanzey-yellow hover:underline font-medium"
                >
                  créer un compte
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;