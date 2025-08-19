import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

interface HeroSlide {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  order: number;
}

const HeroSlider: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000); // Auto-slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [slides.length]);

  const fetchSlides = async () => {
    try {
      const response = await api.get('/slides');
      setSlides(response.data.data);
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="relative h-[600px] bg-gradient-to-r from-kanzey-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-kanzey-yellow"></div>
      </div>
    );
  }

  if (slides.length === 0) {
    // Default hero section if no slides
    return (
      <section className="relative bg-gradient-to-r from-kanzey-black via-gray-900 to-kanzey-black py-20 min-h-[600px] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
              <span className="text-kanzey-yellow">Kanzey</span>.CO
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto animate-slide-up">
              La première plateforme de billetterie événementielle du Sénégal. 
              Découvrez, réservez et vivez des expériences inoubliables.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-bounce-in">
              <Link
                to="/events"
                className="bg-kanzey-yellow text-kanzey-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors inline-flex items-center justify-center"
              >
                Découvrir les événements
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                to="/register"
                className="border-2 border-kanzey-yellow text-kanzey-yellow px-8 py-4 rounded-lg font-bold text-lg hover:bg-kanzey-yellow hover:text-kanzey-black transition-colors inline-flex items-center justify-center"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[600px] overflow-hidden">
      {/* Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide._id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(http://localhost:5000${slide.image})`
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-3xl">
                  <h2 className="text-sm md:text-base text-kanzey-yellow font-semibold mb-4 uppercase tracking-wider animate-fade-in">
                    {slide.subtitle}
                  </h2>
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight animate-slide-up">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed animate-slide-up">
                    {slide.description}
                  </p>
                  <div className="animate-bounce-in">
                    <Link
                      to={slide.buttonLink}
                      className="bg-kanzey-yellow text-kanzey-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors inline-flex items-center"
                    >
                      {slide.buttonText}
                      <ArrowRight className="ml-2" size={20} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all z-10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all z-10"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-kanzey-yellow scale-125'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSlider;