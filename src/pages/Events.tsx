import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Search, Filter, Star } from 'lucide-react';
import { api } from '../utils/api';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  category: string;
  image: string;
  isFeatured: boolean;
  availableTickets: number;
  capacity: number;
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'concert', label: 'Concerts' },
    { value: 'conference', label: 'Conférences' },
    { value: 'formation', label: 'Formations' },
    { value: 'spectacle', label: 'Spectacles' },
    { value: 'sport', label: 'Sports' },
    { value: 'autre', label: 'Autres' }
  ];

  useEffect(() => {
    fetchEvents();
  }, [searchTerm, selectedCategory]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      params.append('limit', '20');

      const response = await api.get(`/events?${params}`);
      setEvents(response.data.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-kanzey-black mb-4">
            Découvrez nos événements
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Trouvez l'événement parfait pour vous parmi notre sélection d'expériences exceptionnelles au Sénégal
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
              />
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-kanzey-yellow focus:border-kanzey-yellow"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden bg-kanzey-yellow text-kanzey-black px-4 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors flex items-center justify-center"
            >
              <Filter size={20} className="mr-2" />
              Filtres
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Chargement...' : `${events.length} événement(s) trouvé(s)`}
          </p>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
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
                    <div className="absolute top-4 left-4 bg-kanzey-yellow text-kanzey-black px-3 py-1 rounded-full text-sm font-bold flex items-center">
                      <Star size={14} className="mr-1" />
                      À la une
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4 bg-white text-kanzey-black px-2 py-1 rounded-full text-xs font-medium">
                    {event.category}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-xl text-kanzey-black mb-3 line-clamp-2 group-hover:text-kanzey-yellow transition-colors">
                    {event.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="mr-3 text-kanzey-yellow" size={16} />
                      <span className="text-sm font-medium">
                        {new Date(event.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="mr-3 text-kanzey-yellow" size={16} />
                      <span className="text-sm font-medium">{event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="mr-3 text-kanzey-yellow" size={16} />
                      <span className="text-sm font-medium">{event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-kanzey-black">
                        {event.price.toLocaleString()} FCFA
                      </div>
                      <div className="text-xs text-gray-500">
                        {event.availableTickets} places restantes
                      </div>
                    </div>
                    
                    <Link
                      to={`/events/${event._id}`}
                      className="bg-kanzey-yellow text-kanzey-black px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
                    >
                      Réserver
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-gray-500">
              Essayez de modifier vos critères de recherche ou parcourez toutes les catégories.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;