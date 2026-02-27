import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar, MapPin, Building2, User } from 'lucide-react';

const ProjectsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const categories = [
    { id: 'all', label: 'Todos los Proyectos' },
    { id: 'civil', label: 'Obra Civil' },
    { id: 'building', label: 'Edificación' },
    { id: 'earthworks', label: 'Movimientos de Tierras' },
    { id: 'canalizaciones', label: 'Canalizaciones' }
  ];

  const projects = [
    {
      id: 1,
      title: 'Construcción Autopista A-7 Tramo Málaga-Estepona',
      category: 'civil',
      status: 'completed',
      location: 'Málaga, España',
      year: '2023',
      client: 'Ministerio de Transportes',
      image: 'https://images.pexels.com/photos/1117452/pexels-photo-1117452.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Construcción de 15km de autopista con 3 carriles por sentido, incluyendo 2 viaductos de 200m cada uno y sistema de drenaje integral.',
      technicalDetails: 'Movimiento de tierras: 850.000 m³, Hormigón: 45.000 m³, Asfalto: 120.000 m²'
    },
    {
      id: 2,
      title: 'Complejo Residencial Las Torres del Mar',
      category: 'building',
      status: 'completed',
      location: 'Valencia, España',
      year: '2023',
      client: 'Inmobiliaria Mediterránea S.L.',
      image: 'https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: '120 viviendas distribuidas en 4 torres de 15 plantas cada una, con garaje subterráneo de 3 niveles y zonas comunes.',
      technicalDetails: 'Superficie construida: 28.500 m², Cimentación: Pilotes de 18m, Estructura: Hormigón armado'
    },
    {
      id: 3,
      title: 'Excavación Centro Comercial Aqua Multiespacio',
      category: 'earthworks',
      status: 'in-progress',
      location: 'Alicante, España',
      year: '2024',
      client: 'Grupo Inmobiliario Costa Blanca',
      image: 'https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Excavación de 50.000m³ para cimentación de centro comercial de 3 plantas subterráneas y sistema de contención.',
      technicalDetails: 'Profundidad: 12m, Muros pantalla: 1.200 m², Sistema de achique: 8 pozos'
    },
    {
      id: 4,
      title: 'Puente sobre Río Guadalquivir - Acceso Norte',
      category: 'civil',
      status: 'completed',
      location: 'Sevilla, España',
      year: '2022',
      client: 'Junta de Andalucía',
      image: 'https://images.pexels.com/photos/1116302/pexels-photo-1116302.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Puente de 200m de longitud con estructura de hormigón pretensado, 4 carriles de circulación y carril bici.',
      technicalDetails: 'Luz principal: 80m, Altura: 25m, Carga de diseño: HL-93, Vida útil: 100 años'
    },
    {
      id: 5,
      title: 'Nave Industrial Logística Amazon',
      category: 'building',
      status: 'in-progress',
      location: 'Barcelona, España',
      year: '2024',
      client: 'Amazon Logistics Spain',
      image: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Nave de 15.000m² para centro logístico automatizado con sistema de clasificación robotizado y 50 muelles de carga.',
      technicalDetails: 'Altura libre: 12m, Estructura metálica, Pavimento industrial, Sistema contra incendios'
    },
    {
      id: 6,
      title: 'Urbanización Residencial Montecarlo Hills',
      category: 'earthworks',
      status: 'completed',
      location: 'Castellón, España',
      year: '2023',
      client: 'Desarrollos Inmobiliarios del Mediterráneo',
      image: 'https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Movimiento de tierras para 200 parcelas residenciales, incluyendo viales, redes de servicios y zonas verdes.',
      technicalDetails: 'Superficie: 45 hectáreas, Viales: 8km, Red de saneamiento: 12km, Red eléctrica: 15km'
    },
    {
      id: 7,
      title: 'Canalización Fibra Óptica Corredor Mediterráneo',
      category: 'canalizaciones',
      status: 'completed',
      location: 'Valencia-Alicante, España',
      year: '2023',
      client: 'Telefónica Infraestructuras',
      image: 'https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Instalación de 85km de canalización subterránea para fibra óptica, incluyendo 45 arquetas de registro.',
      technicalDetails: 'Profundidad: 0,8-1,2m, Tubería: PVC 110mm, Arquetas: Hormigón prefabricado'
    },
    {
      id: 8,
      title: 'Red de Saneamiento Polígono Industrial Norte',
      category: 'canalizaciones',
      status: 'in-progress',
      location: 'Valencia, España',
      year: '2024',
      client: 'Ayuntamiento de Valencia',
      image: 'https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Construcción de 12km de red de saneamiento para polígono industrial, incluyendo estación de bombeo.',
      technicalDetails: 'Colectores: Ø300-800mm, Pozos: 120 unidades, Estación bombeo: 500 l/s'
    }
  ];

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredProjects.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? filteredProjects.length - 1 : selectedImage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-corporate-gray-900 mb-6">
              Proyectos Realizados
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre algunos de nuestros proyectos más destacados en obra civil, 
              edificación, movimientos de tierras y canalizaciones.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-corporate-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-64 object-cover cursor-pointer"
                    onClick={() => setSelectedImage(index)}
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {project.status === 'completed' ? 'Completado' : 'En Ejecución'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{project.year}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{project.client}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Detalles Técnicos:</h4>
                    <p className="text-sm text-gray-600">{project.technicalDetails}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal for Image Viewer */}
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>
            
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronRight className="h-8 w-8" />
            </button>

            <img 
              src={filteredProjects[selectedImage].image} 
              alt={filteredProjects[selectedImage].title}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{filteredProjects[selectedImage].title}</h3>
              <p className="text-gray-200 mb-2">{filteredProjects[selectedImage].description}</p>
              <div className="flex items-center space-x-4 text-sm mb-2">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{filteredProjects[selectedImage].location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{filteredProjects[selectedImage].year}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{filteredProjects[selectedImage].client}</span>
                </div>
              </div>
              <div className="text-sm">
                <strong>Detalles Técnicos:</strong> {filteredProjects[selectedImage].technicalDetails}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;