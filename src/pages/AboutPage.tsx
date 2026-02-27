import React from 'react';
import { Building2, Users2, Award, Calendar, Target, Shield, Wrench } from 'lucide-react';

const AboutPage: React.FC = () => {
  const milestones = [
    {
      year: '2004',
      title: 'Fundación de Grupo EA',
      description: 'Inicio de operaciones especializándonos en mano de obra para construcción'
    },
    {
      year: '2008',
      title: 'Expansión Regional',
      description: 'Ampliación de servicios a toda la Comunidad Valenciana'
    },
    {
      year: '2012',
      title: 'Consolidación Regional',
      description: 'Fortalecimiento de nuestra posición en la Comunidad Valenciana'
    },
    {
      year: '2016',
      title: 'Expansión de Servicios',
      description: 'Ampliación de nuestra cartera de servicios especializados'
    },
    {
      year: '2020',
      title: 'Modernización Digital',
      description: 'Implementación de tecnologías avanzadas en gestión de proyectos'
    },
    {
      year: '2024',
      title: 'Liderazgo Sectorial',
      description: 'Consolidación como referente en suministro de mano de obra especializada'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Seguridad',
      description: 'Priorizamos la seguridad laboral con formación continua en PRL y equipos de protección de última generación.'
    },
    {
      icon: Award,
      title: 'Calidad',
      description: 'Mantenemos los más altos estándares de calidad en todos nuestros servicios y proyectos.'
    },
    {
      icon: Users2,
      title: 'Compromiso',
      description: 'Nos comprometemos con nuestros clientes y trabajadores para alcanzar la excelencia en cada proyecto.'
    },
    {
      icon: Target,
      title: 'Eficiencia',
      description: 'Optimizamos recursos y tiempos para entregar resultados excepcionales dentro de los plazos establecidos.'
    }
  ];

  const stats = [
    { number: '20+', label: 'Años de Experiencia' },
    { number: '500+', label: 'Proyectos Completados' },
    { number: '200+', label: 'Operarios Cualificados' },
    { number: '100%', label: 'Satisfacción Cliente' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-corporate-gray-900 mb-6">
              Quiénes Somos
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conoce la historia, valores y compromiso de Grupo EA, tu socio de confianza 
              en el sector de la construcción desde 2004.
            </p>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-corporate-gray-900 mb-6">
                Nuestra Historia
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Grupo EA nació en 2004 con una visión clara: proporcionar mano de obra 
                especializada y de calidad para el sector de la construcción. Durante más 
                de 20 años, hemos crecido hasta convertirnos en un referente nacional en 
                Comunidad Valenciana en suministro de personal cualificado.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Desde nuestras oficinas en Valencia, coordinamos proyectos en toda la Comunidad Valenciana, 
                especializándonos en obra civil, edificación y movimientos de tierras. 
                Nuestro equipo de más de 200 operarios cualificados garantiza la excelencia 
                en cada proyecto.
              </p>
              <p className="text-lg text-gray-600">
                La confianza de nuestros clientes y el compromiso de nuestro equipo nos han 
                permitido participar en algunos de los proyectos de construcción más 
                importantes de la región, manteniendo siempre nuestros valores de seguridad, 
                calidad y eficiencia.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Equipo Grupo EA"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-orange-600 bg-opacity-10 rounded-lg"></div>
              <div className="absolute inset-0 bg-corporate-blue-600 bg-opacity-10 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-corporate-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-corporate-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-corporate-gray-900 mb-4">
              Nuestros Valores
            </h2>
            <p className="text-xl text-gray-600">
              Los principios que guían nuestro trabajo diario
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-corporate-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-corporate-gray-700" />
                </div>
                <h3 className="text-xl font-semibold text-corporate-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-corporate-gray-900 mb-4">
              Nuestra Trayectoria
            </h2>
            <p className="text-xl text-gray-600">
              20 años de crecimiento y evolución constante
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-corporate-blue-200"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                      <div className="text-2xl font-bold text-corporate-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-corporate-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="w-4 h-4 bg-corporate-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-gray-50 p-8 rounded-lg">
              <div className="flex items-center mb-6">
                <Target className="h-8 w-8 text-corporate-gray-700 mr-3" />
                <h3 className="text-2xl font-bold text-corporate-gray-900">Nuestra Misión</h3>
              </div>
              <p className="text-gray-600 text-lg">
                Proporcionar mano de obra especializada y servicios de construcción de la más 
                alta calidad, garantizando la seguridad, eficiencia y satisfacción de nuestros 
                clientes en cada proyecto que emprendemos.
              </p>
            </div>

            <div className="bg-corporate-blue-50 p-8 rounded-lg">
              <div className="flex items-center mb-6">
                <Wrench className="h-8 w-8 text-corporate-gray-700 mr-3" />
                <h3 className="text-2xl font-bold text-corporate-gray-900">Nuestra Visión</h3>
              </div>
              <p className="text-gray-600 text-lg">
                Ser la empresa líder en la Comunidad Valenciana en suministro de mano de obra para construcción, 
                reconocida por nuestra excelencia operativa, innovación tecnológica y compromiso 
                con el desarrollo sostenible del sector.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;