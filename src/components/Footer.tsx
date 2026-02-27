import React from 'react';
import { Building2, MapPin, Phone, Mail, Clock } from 'lucide-react';
import SocialMediaLinks from './SocialMediaLinks';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="h-8 w-8 text-corporate-blue-400" />
              <div>
                <h3 className="text-xl font-bold">Grupo EA</h3>
                <p className="text-sm text-gray-400">Soluciones en Construcción</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Especialistas en obra civil, edificación y movimientos de tierras. 
              Más de 20 años de experiencia en el sector de la construcción desde 2004.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Nuestros Servicios</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Obra Civil</li>
              <li>• Edificación</li>
              <li>• Movimientos de Tierras</li>
              <li>• Mano de Obra Especializada</li>
              <li>• Consultoría Técnica</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 text-corporate-blue-400" />
                <span>Calle Jacomar 64<br />46019 Valencia, España</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-corporate-blue-400" />
                <span>+34 960 22 54 69</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-corporate-blue-400" />
                <span>grupoea@grupoea.es</span>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Horarios</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-corporate-blue-400" />
                <span>Lun - Vie: 8:00 - 18:00</span>
              </div>
              <div className="ml-6">
                <span>Sáb: Cerrado</span>
              </div>
              <div className="ml-6">
                <span>Dom: Cerrado</span>
              </div>
              
              {/* Redes Sociales */}
              <div className="pt-4">
                <h5 className="text-sm font-semibold mb-3 text-white">Síguenos:</h5>
                <SocialMediaLinks variant="horizontal" size="md" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p>&copy; 2024 Grupo EA. Todos los derechos reservados.</p>
            <div className="flex space-x-4">
              <button
                onClick={() => onNavigate('privacy')}
                className="hover:text-white transition-colors"
              >
                Política de Privacidad
              </button>
              <span>|</span>
              <button
                onClick={() => onNavigate('terms')}
                className="hover:text-white transition-colors"
              >
                Términos y Condiciones
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;