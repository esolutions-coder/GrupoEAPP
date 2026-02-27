import React, { useState } from 'react';
import { X, Upload, Send, User, Mail, Phone, FileText, AlertTriangle } from 'lucide-react';
import { JobOffer } from '../types/jobOffers';
import { validateJobApplicationForm, checkRateLimit, sanitizeText } from '../utils/formValidation';

interface JobApplicationModalProps {
  job: JobOffer | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (applicationData: any) => void;
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({ job, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    coverLetter: '',
    experience: '',
    availability: '',
    honeypot: ''
  });

  const [files, setFiles] = useState<{[key: string]: File | null}>({
    cv: null
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFiles({
      ...files,
      cv: file
    });
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setErrors([]);
    setIsSubmitting(true);

    // Rate limiting - máximo 3 aplicaciones por día
    if (!checkRateLimit(`job_application_${job.id}`, 3, 24 * 60 * 60 * 1000)) {
      setErrors(['Has excedido el límite de aplicaciones para esta oferta. Inténtalo mañana.']);
      setIsSubmitting(false);
      return;
    }

    // Validación básica
    const validationErrors: string[] = [];
    
    if (!formData.firstName.trim()) validationErrors.push('El nombre es obligatorio');
    if (!formData.lastName.trim()) validationErrors.push('Los apellidos son obligatorios');
    if (!formData.email.trim()) validationErrors.push('El email es obligatorio');
    if (!formData.phone.trim()) validationErrors.push('El teléfono es obligatorio');
    if (!formData.coverLetter.trim() || formData.coverLetter.length < 50) {
      validationErrors.push('La carta de presentación debe tener al menos 50 caracteres');
    }
    if (!files.cv) validationErrors.push('El CV es obligatorio');

    // Validar archivo CV
    if (files.cv) {
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + files.cv.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        validationErrors.push('El CV debe ser un archivo PDF, DOC o DOCX');
      }
      if (files.cv.size > 10 * 1024 * 1024) {
        validationErrors.push('El CV no puede superar los 10MB');
      }
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    // Preparar datos para envío
    const applicationData = {
      jobId: job.id,
      jobTitle: job.title,
      applicantName: `${sanitizeText(formData.firstName)} ${sanitizeText(formData.lastName)}`,
      applicantEmail: formData.email,
      applicantPhone: formData.phone,
      coverLetter: sanitizeText(formData.coverLetter),
      experience: formData.experience,
      availability: formData.availability,
      cv: files.cv,
      appliedDate: new Date().toISOString()
    };

    // Simular envío (en producción iría al backend)
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(applicationData);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        coverLetter: '',
        experience: '',
        availability: '',
        honeypot: ''
      });
      setFiles({ cv: null });
      onClose();
    }, 2000);
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-corporate-gray-900">Inscribirse en la Oferta</h2>
              <p className="text-corporate-blue-600 font-medium mt-1">{job.title}</p>
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
          {/* Job Summary */}
          <div className="bg-corporate-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-corporate-gray-900 mb-2">Resumen de la Oferta:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Ubicación:</strong> {job.location}</div>
              <div><strong>Experiencia:</strong> {job.experience}</div>
              <div><strong>Tipo:</strong> {job.type}</div>
              {job.salary && (
                <div><strong>Salario:</strong> {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} EUR</div>
              )}
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo honeypot */}
            <input
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={handleInputChange}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Errores */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-red-800 font-semibold mb-2">Por favor, corrige los siguientes errores:</h4>
                <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-semibold text-corporate-gray-900 mb-4 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Información Personal</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Información Profesional */}
            <div>
              <h3 className="text-lg font-semibold text-corporate-gray-900 mb-4">Información Profesional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Años de Experiencia
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecciona experiencia</option>
                    <option value="0-1">0-1 años</option>
                    <option value="2-3">2-3 años</option>
                    <option value="4-5">4-5 años</option>
                    <option value="6-10">6-10 años</option>
                    <option value="10+">Más de 10 años</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disponibilidad
                  </label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecciona disponibilidad</option>
                    <option value="inmediata">Inmediata</option>
                    <option value="1-semana">En 1 semana</option>
                    <option value="2-semanas">En 2 semanas</option>
                    <option value="1-mes">En 1 mes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CV Upload */}
            <div>
              <h3 className="text-lg font-semibold text-corporate-gray-900 mb-4 flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Currículum Vitae</span>
              </h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-corporate-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="cv-upload"
                  required
                />
                <label htmlFor="cv-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {files.cv ? files.cv.name : 'Subir Currículum Vitae *'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Formatos permitidos: PDF, DOC, DOCX (máx. 10MB)
                  </p>
                </label>
              </div>
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carta de Presentación *
              </label>
              <textarea
                name="coverLetter"
                rows={6}
                required
                value={formData.coverLetter}
                onChange={handleInputChange}
                placeholder="Explica por qué eres el candidato ideal para este puesto. Menciona tu experiencia relevante, motivación y qué puedes aportar a Grupo EA..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Mínimo 50 caracteres ({formData.coverLetter.length}/50)
              </p>
            </div>

            {/* Legal Notice */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-corporate-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-600">
                  <p className="mb-2">
                    Al enviar esta solicitud, aceptas que tus datos personales sean tratados conforme 
                    a nuestra política de privacidad para procesos de selección.
                  </p>
                  <p className="font-medium text-corporate-blue-600">
                    📧 Tu solicitud será enviada a: recursoshumanos@grupoea.es
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-corporate-blue-600 hover:bg-corporate-blue-700'
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Enviar Solicitud</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationModal;