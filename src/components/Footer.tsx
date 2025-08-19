import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-kanzey-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-kanzey-yellow text-kanzey-black px-3 py-1 rounded-lg font-black">
                KZ
              </div>
              <span className="text-xl font-bold">Kanzey.CO</span>
            </div>
            <p className="text-gray-300 mb-4">
              La première plateforme de billetterie événementielle du Sénégal. 
              Découvrez et réservez vos événements préférés en toute simplicité.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-kanzey-yellow transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-kanzey-yellow transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-kanzey-yellow transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-4 text-kanzey-yellow">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-300 hover:text-white transition-colors">
                  Événements
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Connexion
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
                  Inscription
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-4 text-kanzey-yellow">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Centre d'aide
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Politique de confidentialité
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="font-semibold mb-4 text-kanzey-yellow">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-kanzey-yellow" />
                <span className="text-gray-300">support@kanzey.co</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} className="text-kanzey-yellow" />
                <span className="text-gray-300">+221 XX XXX XX XX</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin size={16} className="text-kanzey-yellow mt-1" />
                <span className="text-gray-300">Dakar, Sénégal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Kanzey.CO. Tous droits réservés.
            </p>
            <p className="text-gray-400 text-sm">
              Fait avec ❤️ au Sénégal
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;