import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
<Link 
  to="/" 
  className="flex items-center space-x-2 text-2xl font-bold text-yellow-500 hover:text-black transition-colors"
>
  <img
    src="https://media.licdn.com/dms/image/v2/D4E0BAQGxslywrNmsDg/company-logo_200_200/company-logo_200_200/0/1728349948225/kanzeyco_logo?e=2147483647&v=beta&t=ntKRMfCJ-1lM9EGS3kUN2y_SqrDgtWLPxOEL9Gf1DAM"
    alt="Kanzey.co Logo"
    className="w-15 h-16 rounded-lg"
  />
  <span className="text-yellow-500 hover:text-black">Kanzey.CO</span>
</Link>


          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium transition-colors hover:text-kanzey-yellow ${
                isActive('/') ? 'text-kanzey-yellow' : 'text-kanzey-black'
              }`}
            >
              Accueil
            </Link>
            <Link
              to="/events"
              className={`font-medium transition-colors hover:text-kanzey-yellow ${
                isActive('/events') ? 'text-kanzey-yellow' : 'text-kanzey-black'
              }`}
            >
              Événements
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="bg-kanzey-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 bg-kanzey-yellow text-kanzey-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                  >
                    <User size={18} />
                    <span>{user.firstName}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <User size={16} />
                          <span>Mon Profil</span>
                        </div>
                      </Link>
                      <Link
                        to="/my-tickets"
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-2">
                          <Ticket size={16} />
                          <span>Mes Billets</span>
                        </div>
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <LogOut size={16} />
                          <span>Déconnexion</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-kanzey-black font-medium hover:text-kanzey-yellow transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-kanzey-yellow text-kanzey-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-kanzey-black hover:text-kanzey-yellow transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t py-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className={`font-medium transition-colors hover:text-kanzey-yellow ${
                  isActive('/') ? 'text-kanzey-yellow' : 'text-kanzey-black'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to="/events"
                className={`font-medium transition-colors hover:text-kanzey-yellow ${
                  isActive('/events') ? 'text-kanzey-yellow' : 'text-kanzey-black'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Événements
              </Link>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="text-kanzey-black font-medium hover:text-kanzey-yellow transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mon Profil
                  </Link>
                  <Link
                    to="/my-tickets"
                    className="text-kanzey-black font-medium hover:text-kanzey-yellow transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mes Billets
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-kanzey-black font-medium hover:text-kanzey-yellow transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Administration
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-left text-red-600 font-medium"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-kanzey-black font-medium hover:text-kanzey-yellow transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="bg-kanzey-yellow text-kanzey-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors inline-block text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;