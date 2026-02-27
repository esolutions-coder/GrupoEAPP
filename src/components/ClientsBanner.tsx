import React from 'react';

const ClientsBanner: React.FC = () => {
  const clients = [
    {
      name: 'ABALA INFRAESTRUCTURAS',
      logo: '/abala-infraestructuras-2021.png'
    },
    {
      name: 'BERTOLIN',
      logo: '/BERTOLIN LOGO.png'
    },
    {
      name: 'BECSA',
      logo: '/BECSA LOGO.png'
    },
    {
      name: 'BINARIA',
      logo: '/binaria_compaia_general_de_construcciones_sl_logo.jpeg'
    },
    {
      name: 'URBAMED',
      logo: '/cropped-logo_urbamed_negro.png'
    },
    {
      name: 'CONSTRUCCIONES',
      logo: '/download.jpg'
    },
    {
      name: 'ELECNOR',
      logo: '/elecnor-logo2.png'
    },
    {
      name: 'PAVASAL',
      logo: '/Imagen-Pavasal.png'
    },
    {
      name: 'GUEROLA',
      logo: '/GUEROLA.png'
    },
    {
      name: 'GRUPO TRAGSA',
      logo: '/GrupoTragsa RGB.jpg'
    },
    {
      name: 'EDICOVER',
      logo: '/EDICOVER LOGO.jpg'
    },
    {
      name: 'OCIDE',
      logo: '/OCIDE.png'
    }
  ];

  return (
    <section className="py-16 bg-gray-50 border-t border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-corporate-gray-900 mb-2">
            Confían en nosotros:
          </h2>
          <p className="text-gray-600">Empresas líderes que han elegido nuestros servicios</p>
        </div>

        {/* Grid de logos */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center justify-items-center">
          {clients.map((client, index) => (
            <div
              key={client.name}
              className="group relative w-28 h-16 flex items-center justify-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up"
              style={{
                animationDelay: `${index * 80}ms`,
                animationFillMode: 'both'
              }}
            >
              <img
                src={client.logo}
                alt={`Logo ${client.name}`}
                className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 group-hover:scale-105"
                onError={(e) => {
                  // Fallback si la imagen no carga
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<div class="text-corporate-gray-700 font-bold text-sm text-center">${client.name}</div>`;
                  }
                }}
              />
            </div>
          ))}
        </div>

        {/* Texto adicional */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Más de 500 proyectos completados con éxito trabajando con las principales constructoras de España
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </section>
  );
};

export default ClientsBanner;