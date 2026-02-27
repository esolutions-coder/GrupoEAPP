import React from 'react';
import { Shield, Eye, Lock, FileText } from 'lucide-react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="h-16 w-16 text-corporate-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl lg:text-5xl font-bold text-corporate-gray-900 mb-6">
              Política de Privacidad
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              En Grupo EA respetamos tu privacidad y nos comprometemos a proteger tus datos personales.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
            
            {/* Información General */}
            <div>
              <div className="flex items-center mb-4">
                <FileText className="h-6 w-6 text-corporate-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-corporate-gray-900">1. Información General</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  <strong>Responsable del tratamiento:</strong> Grupo EA Obras y Servicios S.L.<br />
                  <strong>Dirección:</strong> Calle Jacomart 36, Valencia, España<br />
                  <strong>Email:</strong> grupoea@grupoea.es<br />
                  <strong>Teléfono:</strong> +34 635 90 14 88
                </p>
                <p>
                  Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos 
                  la información personal que nos proporcionas a través de nuestro sitio web y servicios.
                </p>
              </div>
            </div>

            {/* Datos que Recopilamos */}
            <div>
              <div className="flex items-center mb-4">
                <Eye className="h-6 w-6 text-corporate-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-corporate-gray-900">2. Datos que Recopilamos</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <h3 className="text-lg font-semibold text-corporate-gray-900">2.1 Datos de Contacto</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nombre y apellidos</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Número de teléfono</li>
                  <li>Dirección postal</li>
                  <li>Empresa (si aplica)</li>
                </ul>

                <h3 className="text-lg font-semibold text-corporate-gray-900">2.2 Datos Profesionales (Solicitudes de Empleo)</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Currículum vitae</li>
                  <li>Experiencia laboral</li>
                  <li>Formación académica</li>
                  <li>Certificaciones profesionales</li>
                  <li>Documentos de identificación (DNI/NIE)</li>
                  <li>Carnet de conducir</li>
                </ul>

                <h3 className="text-lg font-semibold text-corporate-gray-900">2.3 Datos de Navegación</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Dirección IP</li>
                  <li>Tipo de navegador</li>
                  <li>Páginas visitadas</li>
                  <li>Tiempo de permanencia</li>
                </ul>
              </div>
            </div>

            {/* Finalidad del Tratamiento */}
            <div>
              <div className="flex items-center mb-4">
                <Lock className="h-6 w-6 text-corporate-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-corporate-gray-900">3. Finalidad del Tratamiento</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <h3 className="text-lg font-semibold text-corporate-gray-900">3.1 Consultas y Presupuestos</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Responder a consultas comerciales</li>
                  <li>Elaborar presupuestos personalizados</li>
                  <li>Mantener comunicación comercial</li>
                </ul>

                <h3 className="text-lg font-semibold text-corporate-gray-900">3.2 Procesos de Selección</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Evaluar candidaturas para puestos de trabajo</li>
                  <li>Realizar entrevistas y pruebas de selección</li>
                  <li>Gestionar la contratación de personal</li>
                  <li>Mantener una base de datos de candidatos</li>
                </ul>

                <h3 className="text-lg font-semibold text-corporate-gray-900">3.3 Mejora de Servicios</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Analizar el uso del sitio web</li>
                  <li>Mejorar la experiencia del usuario</li>
                  <li>Desarrollar nuevos servicios</li>
                </ul>
              </div>
            </div>

            {/* Base Legal */}
            <div>
              <h2 className="text-2xl font-bold text-corporate-gray-900 mb-4">4. Base Legal</h2>
              <div className="space-y-4 text-gray-600">
                <p>El tratamiento de tus datos personales se basa en:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Consentimiento:</strong> Para el envío de comunicaciones comerciales</li>
                  <li><strong>Ejecución contractual:</strong> Para la prestación de servicios solicitados</li>
                  <li><strong>Interés legítimo:</strong> Para la mejora de nuestros servicios</li>
                  <li><strong>Cumplimiento legal:</strong> Para el cumplimiento de obligaciones fiscales y laborales</li>
                </ul>
              </div>
            </div>

            {/* Conservación de Datos */}
            <div>
              <h2 className="text-2xl font-bold text-corporate-gray-900 mb-4">5. Conservación de Datos</h2>
              <div className="space-y-4 text-gray-600">
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Consultas comerciales:</strong> 3 años desde el último contacto</li>
                  <li><strong>Candidatos no seleccionados:</strong> 2 años para futuras oportunidades</li>
                  <li><strong>Empleados:</strong> Durante la relación laboral + 4 años</li>
                  <li><strong>Datos de navegación:</strong> 2 años máximo</li>
                </ul>
              </div>
            </div>

            {/* Derechos del Usuario */}
            <div>
              <h2 className="text-2xl font-bold text-corporate-gray-900 mb-4">6. Tus Derechos</h2>
              <div className="space-y-4 text-gray-600">
                <p>Tienes derecho a:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Acceso:</strong> Conocer qué datos tenemos sobre ti</li>
                  <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
                  <li><strong>Supresión:</strong> Solicitar la eliminación de tus datos</li>
                  <li><strong>Limitación:</strong> Restringir el tratamiento</li>
                  <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
                  <li><strong>Oposición:</strong> Oponerte al tratamiento</li>
                </ul>
                <p>
                  Para ejercer estos derechos, contacta con nosotros en: 
                  <strong> grupoea@grupoea.es</strong>
                </p>
              </div>
            </div>

            {/* Seguridad */}
            <div>
              <h2 className="text-2xl font-bold text-corporate-gray-900 mb-4">7. Seguridad</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Implementamos medidas técnicas y organizativas apropiadas para proteger 
                  tus datos personales contra el acceso no autorizado, alteración, divulgación o destrucción.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Cifrado de datos sensibles</li>
                  <li>Acceso restringido al personal autorizado</li>
                  <li>Copias de seguridad regulares</li>
                  <li>Auditorías de seguridad periódicas</li>
                </ul>
              </div>
            </div>

            {/* Cookies */}
            <div>
              <h2 className="text-2xl font-bold text-corporate-gray-900 mb-4">8. Cookies</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Utilizamos cookies técnicas necesarias para el funcionamiento del sitio web. 
                  No utilizamos cookies de seguimiento o publicitarias sin tu consentimiento expreso.
                </p>
              </div>
            </div>

            {/* AEPD */}
            <div>
              <h2 className="text-2xl font-bold text-corporate-gray-900 mb-4">9. Autoridad de Control</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Si consideras que el tratamiento de tus datos personales vulnera la normativa, 
                  puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD):
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>AEPD:</strong> www.aepd.es</p>
                  <p><strong>Sede electrónica:</strong> sedeagpd.gob.es</p>
                  <p><strong>Dirección:</strong> C/ Jorge Juan, 6, 28001 Madrid</p>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h2 className="text-2xl font-bold text-corporate-gray-900 mb-4">10. Contacto</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Si tienes preguntas sobre esta Política de Privacidad o sobre el tratamiento 
                  de tus datos personales, puedes contactarnos:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Email:</strong> grupoea@grupoea.es</p>
                  <p><strong>Teléfono:</strong> +34 635 90 14 88</p>
                  <p><strong>Dirección:</strong> Calle Jacomart 36, Valencia, España</p>
                </div>
              </div>
            </div>

            {/* Fecha de Actualización */}
            <div className="border-t pt-6">
              <p className="text-sm text-gray-500">
                <strong>Última actualización:</strong> 31 de enero de 2025
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;