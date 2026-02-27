import React, { useState, useMemo } from 'react';
import { Search, Filter, MapPin, Briefcase, Clock, Users, CheckCircle } from 'lucide-react';
import { jobOffers, jobCategories } from '../data/jobOffers';
import { JobOffer } from '../types/jobOffers';
import JobOfferCard from '../components/JobOfferCard';
import JobDetailsModal from '../components/JobDetailsModal';
import JobApplicationModal from '../components/JobApplicationModal';

const JobOffersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Modals
  const [selectedJobForDetails, setSelectedJobForDetails] = useState<JobOffer | null>(null);
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<JobOffer | null>(null);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  // Filtros únicos basados en los datos
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(jobOffers.map(job => job.location))];
    return uniqueLocations.sort();
  }, []);

  const types = [
    { value: 'full-time', label: 'Tiempo Completo' },
    { value: 'part-time', label: 'Tiempo Parcial' },
    { value: 'contract', label: 'Contrato' },
    { value: 'temporary', label: 'Temporal' }
  ];

  const experiences = [
    { value: '0-2 años', label: '0-2 años' },
    { value: '2-5 años', label: '2-5 años' },
    { value: '3+ años', label: '3+ años' },
    { value: '4+ años', label: '4+ años' },
    { value: '5+ años', label: '5+ años' }
  ];

  // Filtrar ofertas
  const filteredJobs = useMemo(() => {
    return jobOffers.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
      const matchesLocation = selectedLocation === 'all' || job.location === selectedLocation;
      const matchesType = selectedType === 'all' || job.type === selectedType;
      const matchesExperience = selectedExperience === 'all' || job.experience === selectedExperience;
      
      return matchesSearch && matchesCategory && matchesLocation && matchesType && matchesExperience && job.isActive;
    });
  }, [searchTerm, selectedCategory, selectedLocation, selectedType, selectedExperience]);

  const handleViewDetails = (jobId: string) => {
    const job = jobOffers.find(j => j.id === jobId);
    if (job) {
      setSelectedJobForDetails(job);
    }
  };

  const handleApply = (jobId: string) => {
    const job = jobOffers.find(j => j.id === jobId);
    if (job) {
      setSelectedJobForApplication(job);
    }
  };

  const handleApplicationSubmit = (applicationData: any) => {
    console.log('Application submitted:', applicationData);
    // Aquí iría la lógica para enviar al backend
    setApplicationSuccess(true);
    setTimeout(() => setApplicationSuccess(false), 5000);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedType('all');
    setSelectedExperience('all');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-corporate-gray-900 mb-6">
              Ofertas de Trabajo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Únete a nuestro equipo de profesionales. Encuentra la oportunidad perfecta 
              para desarrollar tu carrera en el sector de la construcción.
            </p>
          </div>
        </div>
      </section>

      {/* Success Message */}
      {applicationSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>¡Solicitud enviada correctamente!</span>
        </div>
      )}

      {/* Stats */}
      <section className="py-8 bg-corporate-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-corporate-blue-600">{jobOffers.filter(j => j.isActive).length}</div>
              <div className="text-sm text-gray-600">Ofertas Activas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-corporate-blue-600">{jobCategories.length}</div>
              <div className="text-sm text-gray-600">Categorías</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-corporate-blue-600">{locations.length}</div>
              <div className="text-sm text-gray-600">Ubicaciones</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-corporate-blue-600">
                {jobOffers.reduce((sum, job) => sum + job.applicationsCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Candidatos Inscritos</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-corporate-gray-900">Filtros</h2>
                <button
                  onClick={clearFilters}
                  className="text-corporate-blue-600 hover:text-corporate-blue-700 text-sm font-medium"
                >
                  Limpiar
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Título, descripción..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas las categorías</option>
                  {jobCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name} ({category.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                >
                  <option value="all">Todas las ubicaciones</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Contrato
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los tipos</option>
                  {types.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Experience */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experiencia
                </label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                >
                  <option value="all">Cualquier experiencia</option>
                  {experiences.map(exp => (
                    <option key={exp.value} value={exp.value}>{exp.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-corporate-gray-900">
                  {filteredJobs.length} Ofertas Encontradas
                </h2>
                <p className="text-gray-600">
                  {searchTerm && `Resultados para "${searchTerm}"`}
                </p>
              </div>
            </div>

            {/* Job Cards */}
            {filteredJobs.length > 0 ? (
              <div className="space-y-6">
                {filteredJobs.map(job => (
                  <JobOfferCard
                    key={job.id}
                    job={job}
                    onApply={handleApply}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron ofertas
                </h3>
                <p className="text-gray-600 mb-4">
                  Intenta ajustar los filtros o buscar con otros términos.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <JobDetailsModal
        job={selectedJobForDetails}
        isOpen={!!selectedJobForDetails}
        onClose={() => setSelectedJobForDetails(null)}
        onApply={handleApply}
      />

      <JobApplicationModal
        job={selectedJobForApplication}
        isOpen={!!selectedJobForApplication}
        onClose={() => setSelectedJobForApplication(null)}
        onSubmit={handleApplicationSubmit}
      />
    </div>
  );
};

export default JobOffersPage;