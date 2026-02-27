import React, { useState } from 'react';
import { Menu, X, Building2, Phone, Mail } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Inicio' },
    { id: 'about', label: 'Quiénes Somos' },
    { id: 'services', label: 'Servicios' },
    { id: 'contact', label: 'Contacto' },
    { id: 'worker-login', label: 'Operarios' },
    { id: 'login', label: 'Acceder' }
  ];

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <Building2 className="h-8 w-8 text-corporate-gray-700" />
            <div>
              <h1 className="text-xl font-bold text-corporate-gray-900">Grupo EA</h1>
              <p className="text-xs text-gray-600">Soluciones en Construcción</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? 'text-corporate-blue-600 bg-corporate-blue-50'
                    : 'text-gray-700 hover:text-corporate-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Contact Info */}
          <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <a 
                href="tel:+34960225469" 
                className="hover:text-corporate-blue-600 transition-colors cursor-pointer"
                title="Llamar ahora"
              >
                +34 960 22 54 69
              </a>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <a 
                href="mailto:grupoea@grupoea.es" 
                className="hover:text-corporate-blue-600 transition-colors cursor-pointer"
                title="Enviar email"
              >
                grupoea@grupoea.es
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-corporate-blue-600 hover:bg-gray-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-md text-left text-sm font-medium transition-colors ${
                    currentPage === item.id
                      ? 'text-corporate-blue-600 bg-corporate-blue-50'
                      : 'text-gray-700 hover:text-corporate-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <a 
                  href="tel:+34960225469" 
                  className="hover:text-corporate-blue-600 transition-colors"
                  title="Llamar ahora"
                >
                  +34 960 22 54 69
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <a 
                  href="mailto:grupoea@grupoea.es" 
                  className="hover:text-corporate-blue-600 transition-colors"
                  title="Enviar email"
                >
                  grupoea@grupoea.es
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;