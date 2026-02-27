import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { validateContactForm, checkRateLimit, sanitizeText } from '../utils/formValidation';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    message: '',
    honeypot: '' // Campo oculto para detectar bots
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);
    
    // Verificar rate limiting (máximo 3 envíos por hora)
    if (!checkRateLimit('contact_form', 3, 60 * 60 * 1000)) {
      setErrors(['Has excedido el límite de envíos. Inténtalo más tarde.']);
      setIsSubmitting(false);
      return;
    }
    
    // Validar formulario
    const validation = validateContactForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }
    
    // Sanitizar datos antes del envío
    const sanitizedData = {
      ...formData,
      name: sanitizeText(formData.name),
      company: sanitizeText(formData.company),
      message: sanitizeText(formData.message)
    };
    
    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sanitizedData)
    })
    .then(response => response.json())
    .then(data => {
      setIsSubmitting(false);
      if (data.success) {
        setSubmitted(true);
        // Resetear formulario
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          service: '',
          message: '',
          honeypot: ''
        });
      } else {
        setErrors([data.message || 'Error al enviar la consulta']);
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
          <h2 className="text-2xl font-bold text-corporate-gray-900 mb-4">¡Mensaje Enviado!</h2>
          <p className="text-gray-600 mb-6">
            Hemos recibido tu consulta correctamente. Nuestro equipo se pondrá en contacto 
            contigo en un plazo máximo de 24 horas.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Enviar Otro Mensaje
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
              Contacta con Nosotros
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Estamos aquí para ayudarte. Contacta con nuestro equipo de expertos 
              para cualquier consulta sobre nuestros servicios de construcción.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-corporate-gray-900 mb-8">Información de Contacto</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-corporate-blue-100 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-corporate-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-corporate-gray-900 mb-1">Dirección</h3>
                  <p className="text-gray-600">
                    Calle Jacomar 64<br />
                    46019 Valencia, España
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-corporate-blue-100 p-3 rounded-lg">
                  <Phone className="h-6 w-6 text-corporate-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-corporate-gray-900 mb-1">Teléfono</h3>
                  <p className="text-gray-600">+34 960 22 54 69</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-corporate-blue-100 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-corporate-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-corporate-gray-900 mb-1">Email</h3>
                  <p className="text-gray-600">grupoea@grupoea.es</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-corporate-blue-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-corporate-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-corporate-gray-900 mb-1">Horarios de Atención</h3>
                  <div className="text-gray-600 space-y-1">
                    <p>Lunes - Viernes: 8:00 - 18:00</p>
                    <p>Sábados: Cerrado</p>
                    <p>Domingos: Cerrado</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-8">
              <h3 className="font-semibold text-corporate-gray-900 mb-4">Ubicación</h3>
              <div className="h-64 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3080.284747!2d-0.376300!3d39.469900!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd604f4cf0efb06b%3A0x40640c0c2b8b7c0!2sCalle%20Jacomar%2064%2C%2046019%20Valencia%2C%20Spain!5e0!3m2!1sen!2ses!4v1635789012345!5m2!1sen!2ses"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Grupo EA"
                ></iframe>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-corporate-blue-50 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-corporate-gray-900 mb-4">¿Necesitas Información?</h2>
              <p className="text-gray-700 mb-6">
                Ponte en contacto con nosotros a través de cualquiera de nuestros canales de comunicación. 
                Estaremos encantados de atenderte y resolver todas tus dudas.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="tel:+34960225469"
                  className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Phone className="h-5 w-5" />
                  <span>Llamar Ahora</span>
                </a>
                <a
                  href="mailto:grupoea@grupoea.es"
                  className="border-2 border-corporate-blue-600 text-corporate-blue-600 hover:bg-corporate-blue-600 hover:text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Mail className="h-5 w-5" />
                  <span>Enviar Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;