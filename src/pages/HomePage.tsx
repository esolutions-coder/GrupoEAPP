import React from 'react';
import { ArrowRight, CheckCircle2, Users2, Award, Clock4, MessageCircle, Mail, User, Phone, MapPin, Briefcase, Building2, Eye } from 'lucide-react';
import ClientsBanner from '../components/ClientsBanner';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const stats = [
    { icon: Users2, value: '500+', label: 'Proyectos Completados' },
    { icon: Award, value: '20+', label: 'Años de Experiencia' },
    { icon: CheckCircle2, value: '100%', label: 'Satisfacción Cliente' },
    { icon: Clock4, value: '24/7', label: 'Soporte Técnico' }
  ];

  const services = [
    {
      title: 'Obra Civil',
      description: 'Construcción de infraestructuras, carreteras, puentes y obras públicas.',
      image: 'https://images.pexels.com/photos/1117452/pexels-photo-1117452.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      title: 'Edificación',
      description: 'Construcción residencial, comercial e industrial con los más altos estándares.',
      image: 'https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      title: 'Movimientos de Tierras',
      description: 'Excavaciones, nivelaciones y preparación de terrenos para construcción.',
      image: 'https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-corporate-gray-900 to-corporate-gray-800 text-white">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Construimos
              <span className="text-corporate-blue-400"> Tu Futuro</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-gray-200">
              Especialistas en obra civil, edificación y movimientos de tierras. 
              Mano de obra cualificada para tus proyectos más ambiciosos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onNavigate('services')}
                className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <span>Ver Servicios</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => window.open('https://wa.me/34658936651?text=Hola, me gustaría información sobre sus servicios de construcción', '_blank')}
                className="border-2 border-white text-white hover:bg-white hover:text-corporate-gray-900 px-8 py-4 rounded-lg font-semibold transition-colors"
              >
                Contactar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-corporate-gray-900 mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ofrecemos soluciones integrales en construcción con mano de obra especializada 
              y equipos de última generación.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-corporate-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <button
                    onClick={() => onNavigate('services')}
                    className="text-corporate-blue-600 hover:text-corporate-blue-700 font-semibold flex items-center space-x-1"
                  >
                    <span>Saber más</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-12 w-12 text-corporate-gray-700" />
                </div>
                <div className="text-3xl font-bold text-corporate-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients Banner */}
      <ClientsBanner />

      {/* Quick Access Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-corporate-gray-900 mb-4">
              Acceso Rápido
            </h2>
            <p className="text-xl text-gray-600">
              Explora nuestros proyectos realizados y únete a nuestro equipo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Proyectos Card */}
            <div className="bg-gradient-to-br from-corporate-blue-50 to-corporate-blue-100 rounded-xl p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                 onClick={() => onNavigate('projects')}>
              <div className="flex items-center justify-center w-16 h-16 bg-corporate-blue-600 rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-corporate-gray-900 mb-4 text-center">
                Nuestros Proyectos
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Descubre los proyectos más destacados que hemos realizado en obra civil, 
                edificación y movimientos de tierras por toda España.
              </p>
              <div className="flex items-center justify-center space-x-2 text-corporate-blue-600 font-semibold group-hover:text-corporate-blue-700">
                <Eye className="h-5 w-5" />
                <span>Ver Proyectos</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Ofertas de Trabajo Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                 onClick={() => onNavigate('job-offers')}>
              <div className="flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-corporate-gray-900 mb-4 text-center">
                Ofertas de Trabajo
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Únete a nuestro equipo de profesionales. Encuentra oportunidades 
                de empleo en construcción en toda la Comunidad Valenciana.
              </p>
              <div className="flex items-center justify-center space-x-2 text-green-600 font-semibold group-hover:text-green-700">
                <Users2 className="h-5 w-5" />
                <span>Ver Ofertas</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-corporate-blue-600 text-white" id="trabajo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            ¿Buscas Trabajo en Construcción?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Únete a nuestro equipo de profesionales. Buscamos operarios cualificados 
            para proyectos en toda la Comunidad Valenciana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('job-offers')}
              className="bg-white text-corporate-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Ver Ofertas de Trabajo
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="border-2 border-white text-white hover:bg-white hover:text-corporate-blue-600 px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Contactar RRHH
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;