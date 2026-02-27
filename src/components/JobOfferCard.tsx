import React from 'react';
import { MapPin, Clock, Users, Euro, Calendar, AlertCircle, Briefcase } from 'lucide-react';
import { JobOffer } from '../types/jobOffers';

interface JobOfferCardProps {
  job: JobOffer;
  onApply: (jobId: string) => void;
  onViewDetails: (jobId: string) => void;
}

const JobOfferCard: React.FC<JobOfferCardProps> = ({ job, onApply, onViewDetails }) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
    <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{getCategoryEmoji(job.category)}</div>
            <div>
              <h3 className="text-xl font-bold text-corporate-gray-900 mb-1">{job.title}</h3>
              <p className="text-corporate-blue-600 font-medium">{job.department}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(job.urgency)}`}>
            {job.urgency === 'high' && '🔥 Urgente'}
            {job.urgency === 'medium' && '⚡ Prioridad'}
            {job.urgency === 'low' && '✅ Normal'}
          </div>
        </div>

        {/* Job Info */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-corporate-blue-500" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Briefcase className="h-4 w-4 text-corporate-blue-500" />
            <span>{getTypeLabel(job.type)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-corporate-blue-500" />
            <span>Exp: {job.experience}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-corporate-blue-500" />
            <span>{job.applicationsCount} candidatos</span>
          </div>
        </div>

        {/* Salary */}
        {job.salary && (
          <div className="mt-3 flex items-center space-x-2 text-corporate-gray-900 font-semibold">
            <Euro className="h-4 w-4 text-green-600" />
            <span>{job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} {job.salary.currency}/mes</span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="p-6">
        <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>

        {/* Key Requirements Preview */}
        <div className="mb-4">
          <h4 className="font-semibold text-corporate-gray-900 mb-2">Requisitos principales:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {job.requirements.slice(0, 2).map((req, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-corporate-blue-500 mt-1">•</span>
                <span>{req}</span>
              </li>
            ))}
            {job.requirements.length > 2 && (
              <li className="text-corporate-blue-600 font-medium">
                +{job.requirements.length - 2} requisitos más...
              </li>
            )}
          </ul>
        </div>

        {/* Benefits Preview */}
        <div className="mb-6">
          <h4 className="font-semibold text-corporate-gray-900 mb-2">Beneficios destacados:</h4>
          <div className="flex flex-wrap gap-2">
            {job.benefits.slice(0, 3).map((benefit, index) => (
              <span key={index} className="px-3 py-1 bg-corporate-blue-50 text-corporate-blue-700 rounded-full text-xs font-medium">
                {benefit}
              </span>
            ))}
            {job.benefits.length > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                +{job.benefits.length - 3} más
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>
              {daysUntilExpiry > 0 
                ? `${daysUntilExpiry} días restantes`
                : 'Oferta expirada'
              }
            </span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => onViewDetails(job.id)}
              className="px-4 py-2 border border-corporate-blue-600 text-corporate-blue-600 rounded-lg hover:bg-corporate-blue-50 transition-colors font-medium"
            >
              Ver Detalles
            </button>
            <button
              onClick={() => onApply(job.id)}
              disabled={daysUntilExpiry <= 0}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                daysUntilExpiry > 0
                  ? 'bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {daysUntilExpiry > 0 ? 'Inscribirse' : 'Expirada'}
            </button>
          </div>
        </div>
      </div>

      {/* Urgency Warning */}
      {job.urgency === 'high' && daysUntilExpiry <= 3 && daysUntilExpiry > 0 && (
        <div className="bg-red-50 border-t border-red-200 p-3">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              ¡Últimos días para aplicar! Solo quedan {daysUntilExpiry} días.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobOfferCard;