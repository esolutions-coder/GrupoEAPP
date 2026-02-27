import React from 'react';
import { Building2, Construction, Mountain, Users2, CheckCircle2, ArrowRight } from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (page: string) => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const services = [
    {
      icon: Construction,
      title: 'Obra Civil',
      description: 'Construcción de infraestructuras públicas y privadas',
      features: [
        'Carreteras y autopistas',
        'Puentes y viaductos',
        'Túneles y pasos subterráneos',
        'Obras hidráulicas',
        'Infraestructuras ferroviarias',
        'Obras portuarias'
      ],
      image: 'https://images.pexels.com/photos/1117452/pexels-photo-1117452.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: Building2,
      title: 'Edificación',
      description: 'Construcción residencial, comercial e industrial',
      features: [
        'Viviendas unifamiliares',
        'Edificios residenciales',
        'Centros comerciales',
        'Naves industriales',
        'Oficinas corporativas',
        'Instalaciones deportivas'
      ],
      image: 'https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: Mountain,
      title: 'Movimientos de Tierras',
      description: 'Preparación y acondicionamiento de terrenos',
      features: [
        'Excavaciones profundas',
        'Nivelación de terrenos',
        'Demoliciones controladas',
        'Desbroces y limpiezas',
        'Rellenos y compactaciones',
        'Drenajes y saneamientos'
      ],
      image: 'https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=600'
    }
  ];

  const advantages = [
    'Mano de obra altamente cualificada',
    'Equipos y maquinaria de última generación',
    'Cumplimiento estricto de plazos',
    'Formación continua en PRL',
    'Seguros de responsabilidad civil',
    'Atención personalizada 24/7'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-corporate-gray-900 mb-6">
              Nuestros Servicios
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ofrecemos soluciones integrales en construcción con más de 15 años de experiencia 
              en el sector. Mano de obra especializada para proyectos de cualquier envergadura.
            </p>
          </div>
        </div>
      </section>

      {/* Services Detail */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {services.map((service, index) => (
              <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-6">
                    <service.icon className="h-10 w-10 text-corporate-gray-700" />
                    <h2 className="text-3xl font-bold text-corporate-gray-900">{service.title}</h2>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">{service.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {service.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => window.open('https://wa.me/34658936651?text=Hola, me gustaría información sobre ' + service.title, '_blank')}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                  >
                    <span>Consultar por WhatsApp</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-80 object-cover rounded-lg shadow-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-corporate-gray-900 mb-4">
              ¿Por Qué Elegirnos?
            </h2>
            <p className="text-xl text-gray-600">
              Nuestras ventajas competitivas nos posicionan como líderes en el sector
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((advantage, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-corporate-gray-700 flex-shrink-0" />
                <span className="text-gray-800 font-medium">{advantage}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-corporate-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users2 className="h-16 w-16 text-corporate-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            ¿Necesitas Mano de Obra Especializada?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Contamos con un equipo de más de 200 operarios cualificados listos para 
            trabajar en tu próximo proyecto en la Comunidad Valenciana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('contact')}
              className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Contactar Ahora
            </button>
            <button
              onClick={() => onNavigate('projects')}
              className="border-2 border-white text-white hover:bg-white hover:text-corporate-gray-900 px-8 py-4 rounded-lg font-semibold transition-colors"
            >
              Ver Proyectos
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;