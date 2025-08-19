import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Star, ArrowRight, Ticket, Users, Award } from 'lucide-react';
import { api } from '../utils/api';
import HeroSlider from '../components/HeroSlider';

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
}

const Home: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, upcomingRes] = await Promise.all([
          api.get('/events/featured'),
          api.get('/events?limit=6')
        ]);

        setFeaturedEvents(featuredRes.data.data);
        setUpcomingEvents(upcomingRes.data.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Featured Event Banner */}
      {featuredEvents.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-kanzey-black mb-4">
                ⭐ Événement à la une
              </h2>
            </div>
            
            <div className="relative bg-gradient-to-r from-kanzey-yellow to-yellow-400 rounded-2xl overflow-hidden shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <h3 className="text-3xl lg:text-4xl font-bold text-kanzey-black mb-4">
                    {featuredEvents[0].title}
                  </h3>
                  <p className="text-kanzey-black mb-6 text-lg leading-relaxed">
                    {featuredEvents[0].description.substring(0, 200)}...
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-kanzey-black">
                      <Calendar className="mr-3" size={20} />
                      <span className="font-medium">
                        {new Date(featuredEvents[0].date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-kanzey-black">
                      <Clock className="mr-3" size={20} />
                      <span className="font-medium">{featuredEvents[0].time}</span>
                    </div>
                    <div className="flex items-center text-kanzey-black">
                      <MapPin className="mr-3" size={20} />
                      <span className="font-medium">{featuredEvents[0].location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-kanzey-black">
                      {featuredEvents[0].price.toLocaleString()} FCFA
                    </div>
                    <Link
                      to={`/events/${featuredEvents[0]._id}`}
                      className="bg-kanzey-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors inline-flex items-center"
                    >
                      Réserver maintenant
                      <Ticket className="ml-2" size={20} />
                    </Link>
                  </div>
                </div>

                <div className="relative">
                  {featuredEvents[0].image ? (
                    <img
                      src={`http://localhost:5000${featuredEvents[0].image}`}
                      alt={featuredEvents[0].title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-kanzey-black to-gray-800 flex items-center justify-center">
                      <Star size={60} className="text-kanzey-yellow" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-kanzey-yellow rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Ticket className="text-kanzey-black" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-kanzey-black mb-2">1000+</h3>
              <p className="text-gray-600">Billets vendus</p>
            </div>
            
            <div className="text-center">
              <div className="bg-kanzey-yellow rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="text-kanzey-black" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-kanzey-black mb-2">500+</h3>
              <p className="text-gray-600">Utilisateurs satisfaits</p>
            </div>
            
            <div className="text-center">
              <div className="bg-kanzey-yellow rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Award className="text-kanzey-black" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-kanzey-black mb-2">50+</h3>
              <p className="text-gray-600">Événements organisés</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-kanzey-black mb-4">
              Événements à venir
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Ne manquez pas les prochains événements exceptionnels au Sénégal
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-200 rounded-xl h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                >
                  <div className="relative">
                    {event.image ? (
                      <img
                        src={`http://localhost:5000${event.image}`}
                        alt={event.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-r from-kanzey-yellow to-yellow-400 flex items-center justify-center">
                        <Calendar size={40} className="text-kanzey-black" />
                      </div>
                    )}
                    {event.isFeatured && (
                      <div className="absolute top-4 left-4 bg-kanzey-yellow text-kanzey-black px-3 py-1 rounded-full text-sm font-bold">
                        ⭐ À la une
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-bold text-xl text-kanzey-black mb-2 line-clamp-2">
                      {event.title}
                    </h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="mr-2" size={16} />
                        <span className="text-sm">
                          {new Date(event.date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="mr-2" size={16} />
                        <span className="text-sm">{event.time}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="mr-2" size={16} />
                        <span className="text-sm">{event.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-kanzey-black">
                        {event.price.toLocaleString()} FCFA
                      </div>
                      <Link
                        to={`/events/${event._id}`}
                        className="bg-kanzey-yellow text-kanzey-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                      >
                        Voir détails
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/events"
              className="bg-kanzey-black text-white px-8 py-4 rounded-lg font-bold hover:bg-gray-800 transition-colors inline-flex items-center"
            >
              Voir tous les événements
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-kanzey-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Pourquoi choisir <span className="text-kanzey-yellow">Kanzey.CO</span> ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-kanzey-yellow rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Ticket className="text-kanzey-black" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Achat facile</h3>
              <p className="text-gray-300">
                Réservez vos billets en quelques clics avec un processus simple et sécurisé
              </p>
            </div>

            <div className="text-center">
              <div className="bg-kanzey-yellow rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="text-kanzey-black" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Paiement sécurisé</h3>
              <p className="text-gray-300">
                Paiement 100% sécurisé avec Intouch, la solution de paiement de référence au Sénégal
              </p>
            </div>

            <div className="text-center">
              <div className="bg-kanzey-yellow rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="text-kanzey-black" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4">Support client</h3>
              <p className="text-gray-300">
                Notre équipe est là pour vous aider 7j/7 pour toutes vos questions
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;