import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, User, Mail, Phone, MapPin, AlertTriangle } from 'lucide-react';
import { validateJobApplicationForm, checkRateLimit, sanitizeText } from '../utils/formValidation';

const RecruitmentPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    position: '',
    experience: '',
    availability: '',
    hasLicense: '',
    hasVehicle: '',
    message: '',
    prlTraining: '',
    honeypot: '' // Campo oculto para detectar bots
  });

  const [files, setFiles] = useState<{[key: string]: File | null}>({
    cv: null,
    dni: null,
    license: null,
    certificates: null
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const positions = [
    'Peón de Construcción',
    'Oficial de Albañilería',
    'Operador de Maquinaria',
    'Soldador',
    'Electricista',
    'Fontanero',
    'Carpintero',
    'Ferrallista',
    'Encofrador',
    'Gruista',
    'Conductor de Camión',
    'Capataz',
    'Jefe de Obra'
  ];

  const prlOptions = [
    'PRL 20 HORAS',
    'PRL MOVIMIENTO DE TIERRAS',
    'PRL APARATOS ELEVADORES',
    'PRL TRABAJOS EN ALTURA',
    'PRL ESPACIOS CONFINADOS',
    'PRL SOLDADURA',
    'PRL ELECTRICIDAD',
    'PRL DEMOLICIONES',
    'PRL EXCAVACIONES',
    'PRL HORMIGÓN',
    'PRL COORDINADOR DE SEGURIDAD'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar errores al escribir
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files?.[0] || null;
    setFiles({
      ...files,
      [fileType]: file
    });
    // Limpiar errores al cambiar archivos
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);
    
    // Verificar rate limiting (máximo 2 envíos por día)
    if (!checkRateLimit('job_application', 2, 24 * 60 * 60 * 1000)) {
      setErrors(['Has excedido el límite de solicitudes diarias. Inténtalo mañana.']);
      setIsSubmitting(false);
      return;
    }
    
    // Validar formulario y archivos
    const validation = validateJobApplicationForm(formData, files);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }
    
    // Crear FormData para enviar al backend
    const formDataToSend = new FormData();
    
    // Sanitizar datos de texto antes del envío
    Object.keys(formData).forEach(key => {
      const value = formData[key as keyof typeof formData];
      if (typeof value === 'string') {
        formDataToSend.append(key, sanitizeText(value));
      } else {
        formDataToSend.append(key, value);
      }
    });
    
    Object.keys(files).forEach(fileType => {
      if (files[fileType]) {
        formDataToSend.append(fileType, files[fileType]!);
      }
    });
    
    // Enviar al backend
    fetch('/api/submit-application', {
      method: 'POST',
      body: formDataToSend
    })
    .then(response => response.json())
    .then(data => {
      setIsSubmitting(false);
      if (data.success) {
        setSubmitted(true);
        // Resetear formulario
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          postalCode: '',
          position: '',
          experience: '',
          availability: '',
          hasLicense: '',
          hasVehicle: '',
          message: '',
          prlTraining: '',
          honeypot: ''
        });
        setFiles({
          cv: null,
          dni: null,
          license: null,
          certificates: null
        });
      } else {
        setErrors([data.message || 'Error al enviar la solicitud']);
      }
    })
    .catch(error => {
      setIsSubmitting(false);
      console.error('Error:', error);
      setErrors(['Error de conexión. Por favor, inténtalo de nuevo.']);
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-corporate-gray-900 mb-4">¡Solicitud Enviada!</h2>
          <p className="text-gray-600 mb-6">
            Hemos recibido tu solicitud correctamente. Nuestro equipo de recursos humanos 
            (recursoshumanos@grupoea.es) la revisará y se pondrá en contacto contigo en un plazo máximo de 48 horas.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Enviar Otra Solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-corporate-gray-900 mb-6">
              Únete a Nuestro Equipo
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Buscamos profesionales comprometidos para formar parte de nuestros proyectos. 
              Completa el formulario y adjunta tu documentación.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-corporate-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-corporate-gray-900 mb-8">
            ¿Por Qué Trabajar con Nosotros?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-corporate-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-corporate-gray-700" />
              </div>
              <h3 className="font-semibold text-corporate-gray-900 mb-2">Salarios Competitivos</h3>
              <p className="text-gray-600">Ofrecemos remuneraciones acordes al mercado y experiencia</p>
            </div>
            <div className="text-center">
              <div className="bg-corporate-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-corporate-gray-700" />
              </div>
              <h3 className="font-semibold text-corporate-gray-900 mb-2">Formación Continua</h3>
              <p className="text-gray-600">Programas de capacitación y desarrollo profesional</p>
            </div>
            <div className="text-center">
              <div className="bg-corporate-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-corporate-gray-700" />
              </div>
              <h3 className="font-semibold text-corporate-gray-900 mb-2">Proyectos Variados</h3>
              <p className="text-gray-600">Trabaja en diferentes tipos de obras por toda la Comunidad Valenciana</p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-corporate-gray-900 mb-8">Formulario de Solicitud</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo honeypot (oculto) */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={handleInputChange}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Mostrar errores */}
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

              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-corporate-gray-900 mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold text-corporate-gray-900 mb-4">Información Profesional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Puesto Deseado *
                    </label>
                    <select
                      name="position"
                      required
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecciona un puesto</option>
                      {positions.map((position) => (
                        <option key={position} value={position}>{position}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Años de Experiencia *
                    </label>
                    <select
                      name="experience"
                      required
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecciona experiencia</option>
                      <option value="0-1">0-1 años</option>
                      <option value="2-5">2-5 años</option>
                      <option value="6-10">6-10 años</option>
                      <option value="10+">Más de 10 años</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Disponibilidad *
                    </label>
                    <select
                      name="availability"
                      required
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ¿Tienes carnet de conducir? *
                    </label>
                    <select
                      name="hasLicense"
                      required
                      value={formData.hasLicense}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="si">Sí</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ¿Tienes vehículo propio? *
                    </label>
                    <select
                      name="hasVehicle"
                      required
                      value={formData.hasVehicle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecciona una opción</option>
                      <option value="si">Sí</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formación en PRL *
                  </label>
                  <select
                    name="prlTraining"
                    required
                    value={formData.prlTraining || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecciona tu formación PRL</option>
                    {prlOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Uploads */}
              <div>
                <h3 className="text-lg font-semibold text-corporate-gray-900 mb-4">Documentación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currículum Vitae * (PDF, DOC, DOCX)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-corporate-blue-500 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, 'cv')}
                        className="hidden"
                        id="cv-upload"
                        required
                      />
                      <label htmlFor="cv-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {files.cv ? files.cv.name : 'Haz clic para subir tu CV'}
                        </p>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DNI/NIE * (PDF, JPG, PNG)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-corporate-blue-500 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'dni')}
                        className="hidden"
                        id="dni-upload"
                        required
                      />
                      <label htmlFor="dni-upload" className="cursor-pointer">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {files.dni ? files.dni.name : 'Haz clic para subir tu DNI/NIE'}
                        </p>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Carnet de Conducir (PDF, JPG, PNG)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-corporate-blue-500 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'license')}
                        className="hidden"
                        id="license-upload"
                      />
                      <label htmlFor="license-upload" className="cursor-pointer">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {files.license ? files.license.name : 'Haz clic para subir tu carnet'}
                        </p>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certificados/Títulos (PDF, JPG, PNG)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-corporate-blue-500 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'certificates')}
                        className="hidden"
                        id="certificates-upload"
                      />
                      <label htmlFor="certificates-upload" className="cursor-pointer">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {files.certificates ? files.certificates.name : 'Haz clic para subir certificados'}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje Adicional
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Cuéntanos por qué quieres trabajar con nosotros..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                ></textarea>
              </div>

              {/* Legal Notice */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-corporate-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">
                      Al enviar este formulario, aceptas que tus datos personales y documentos sean enviados 
                      a recursoshumanos@grupoea.es y tratados conforme a nuestra política de privacidad para procesos de selección.
                    </p>
                    <p>
                      Los campos marcados con * son obligatorios.
                    </p>
                    <p className="mt-2 font-medium text-corporate-blue-600">
                      📧 Destino: recursoshumanos@grupoea.es
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-corporate-blue-600 hover:bg-corporate-blue-700'
                  } text-white`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    'Enviar Solicitud'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RecruitmentPage;