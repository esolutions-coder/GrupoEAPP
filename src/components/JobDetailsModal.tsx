import React from 'react';
import { X, MapPin, Clock, Euro, Users, Calendar, CheckCircle, Star, Briefcase } from 'lucide-react';
import { JobOffer } from '../types/jobOffers';

interface JobDetailsModalProps {
  job: JobOffer | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (jobId: string) => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, isOpen, onClose, onApply }) => {
  if (!isOpen || !job) return null;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'full-time': return 'Tiempo Completo';
      case 'part-time': return 'Tiempo Parcial';
      case 'contract': return 'Contrato';
      case 'temporary': return 'Temporal';
      default: return type;
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'construction': return '🏗️';
      case 'machinery': return '🚜';
      case 'management': return '👔';
      case 'technical': return '⚙️';
      case 'safety': return '🦺';
      default: return '💼';
    }
  };

  const daysUntilExpiry = Math.ceil(
    (new Date(job.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{getCategoryEmoji(job.category)}</div>
              <div>
                <h2 className="text-3xl font-bold text-corporate-gray-900 mb-2">{job.title}</h2>
                <div className="flex items-center space-x-4 text-gray-600">
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{job.department}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{getTypeLabel(job.type)}</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Key Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-corporate-blue-50 rounded-lg p-4 text-center">
              <Euro className="h-8 w-8 text-corporate-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-corporate-gray-900">
                {job.salary 
                  ? `${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} EUR`
                  : 'Salario a convenir'
                }
              </div>
              <div className="text-sm text-gray-600">Salario mensual</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-corporate-gray-900">{job.applicationsCount}</div>
              <div className="text-sm text-gray-600">Candidatos inscritos</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="font-semibold text-corporate-gray-900">
                {daysUntilExpiry > 0 ? `${daysUntilExpiry} días` : 'Expirada'}
              </div>
              <div className="text-sm text-gray-600">Tiempo restante</div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-corporate-gray-900 mb-4">Descripción del Puesto</h3>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Requirements */}
            <div>
              <h3 className="text-xl font-bold text-corporate-gray-900 mb-4 flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-corporate-blue-600" />
                <span>Requisitos</span>
              </h3>
              <ul className="space-y-3">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-corporate-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Responsibilities */}
            <div>
              <h3 className="text-xl font-bold text-corporate-gray-900 mb-4 flex items-center space-x-2">
                <Briefcase className="h-6 w-6 text-corporate-blue-600" />
                <span>Responsabilidades</span>
              </h3>
              <ul className="space-y-3">
                {job.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Benefits */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-corporate-gray-900 mb-4 flex items-center space-x-2">
              <Star className="h-6 w-6 text-corporate-blue-600" />
              <span>Beneficios y Ventajas</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {job.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Company Info */}
          <div className="mt-8 bg-corporate-blue-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-corporate-gray-900 mb-4">Sobre Grupo EA</h3>
            <p className="text-gray-700 mb-4">
              Grupo EA es una empresa líder en el sector de la construcción con más de 20 años de experiencia. 
              Nos especializamos en obra civil, edificación y movimientos de tierras, ofreciendo soluciones 
              integrales para proyectos de cualquier envergadura.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="font-bold text-2xl text-corporate-blue-600">20+</div>
                <div className="text-sm text-gray-600">Años de experiencia</div>
              </div>
              <div>
                <div className="font-bold text-2xl text-corporate-blue-600">500+</div>
                <div className="text-sm text-gray-600">Proyectos completados</div>
              </div>
              <div>
                <div className="font-bold text-2xl text-corporate-blue-600">200+</div>
                <div className="text-sm text-gray-600">Empleados</div>
              </div>
              <div>
                <div className="font-bold text-2xl text-corporate-blue-600">100%</div>
                <div className="text-sm text-gray-600">Satisfacción cliente</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                onApply(job.id);
                onClose();
              }}
              disabled={daysUntilExpiry <= 0}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                daysUntilExpiry > 0
                  ? 'bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {daysUntilExpiry > 0 ? 'Inscribirse en esta Oferta' : 'Oferta Expirada'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;