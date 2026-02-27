import React from 'react';
import { FileText, Scale, AlertTriangle, CheckCircle } from 'lucide-react';

const TermsConditionsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Scale className="h-16 w-16 text-corporate-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl lg:text-5xl font-bold text-corporate-gray-900 mb-6">
              Términos y Condiciones
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Condiciones generales de uso del sitio web y servicios de Grupo EA.
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
                  Los presentes Términos y Condiciones regulan el uso del sitio web 
                  <strong> grupoea.es</strong> (en adelante, "el Sitio Web") y los servicios 
                  ofrecidos por Grupo EA Obras y Servicios S.L.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Titular:</strong> Grupo EA Obras y Servicios S.L.</p>
                  <p><strong>Dirección:</strong> Calle Jacomart 36, Valencia, España</p>
                  <p><strong>Email:</strong> grupoea@grupoea.es</p>
                  <p><strong>Teléfono:</strong> +34 635 90 14 88</p>
                </div>
              </div>
            </div>

            {/* Objeto y Ámbito */}
            <div>
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-corporate-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-corporate-gray-900">2. Objeto del Sitio Web</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <p>
                  El presente sitio web tiene por objeto ofrecer información sobre los servicios 
                  de construcción de Grupo EA y facilitar el contacto entre la empresa y sus 
                  potenciales clientes y colaboradores.
                </p>
                <p>
                  Los servicios ofrecidos incluyen:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Información corporativa y de servicios</li>
                  <li>Formularios de contacto para consultas comerciales</li>
                  <li>Portal de empleo y solicitudes de trabajo</li>
                  <li>Galería de proyectos realizados</li>
                </ul>
                <p>
                  El acceso y uso del Sitio Web implica la aceptación expresa y sin reservas 
                  de estos Términos y Condiciones.
                </p>
              </div>
            </div>

            {/* Propiedad Intelectual */}
            <div>
              <h2 className="text-2xl font-bold text-corporate-gray-900 mb-4">3. Propiedad Intelectual</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Todos los contenidos del Sitio Web, incluyendo pero no limitándose a textos, 
                  imágenes, logotipos, diseños, estructura, selección y disposición de contenidos, 
                  programas, aplicaciones, y cualquier otro elemento, son propiedad de Grupo EA 
                  Obras y Servicios S.L. o de terceros que han autorizado su uso.
                </p>
                <p>
                  Queda expresamente prohibida la reproducción, distribución, comunicación pública, 
                  transformación o cualquier otra actividad que pueda realizarse con los contenidos 
                  del Sitio Web sin la autorización expresa y por escrito de Grupo EA.
                </p>
                <p>
                  La marca "Grupo EA" y todos los signos distintivos relacionados están protegidos 
                  por las leyes de propiedad intelectual e industrial.
                </p>
              </div>
            </div>

            {/* Responsabilidad Limitada */}
            <div>
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-corporate-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-corporate-gray-900">4. Responsabilidad Limitada</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <h3 className="text-lg font-semibold text-corporate-gray-900">4.1 Disponibilidad del Servicio</h3>
                <p>
                  Grupo EA no garantiza la disponibilidad y continuidad del funcionamiento del 
                  Sitio Web. No se hace responsable de los daños que puedan derivarse de la 
                  falta de disponibilidad o de fallos en el acceso al Sitio Web.
                </p>

                <h3 className="text-lg font-semibold text-corporate-gray-900">4.2 Exactitud de la Información</h3>
                <p>
                  Aunque nos esforzamos por mantener la información actualizada y precisa, 
                  no garantizamos la exactitud, integridad o actualidad de la información 
                  contenida en el Sitio Web.
                </p>

                <h3 className="text-lg font-semibold text-corporate-gray-900">4.3 Errores Técnicos</h3>
                <p>
                  Grupo EA no se hace responsable de los posibles errores técnicos, 
                  interrupciones del servicio, virus informáticos o cualquier otro 
                  elemento dañino que pueda afectar al sistema informático del usuario.
                </p>
              </div>
            </div>

            {/* Enlaces Externos */}
            <div>
              <h2 className="text-2xl font-bold text-corporate-gray-900 mb-4">5. Enlaces Externos</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  El Sitio Web puede contener enlaces a sitios web de terceros. Estos enlaces 
                  se proporcionan únicamente para conveniencia del usuario.
                </p>
                <p>
                  Grupo EA no controla ni es responsable del contenido de los sitios web 
                  enlazados. La inclusión de cualquier enlace no implica aprobación, 
                  patrocinio o recomendación por parte de Grupo EA.
                </p>
                <p>
                  El usuario accede a estos sitios externos bajo su propia responsabilidad 
                  y debe revisar los términos y condiciones y políticas de privacidad 
                  aplicables a dichos sitios.
                </p>
              </div>
            </div>

            {/* Uso Aceptable */}
            <div>
              <h2 className="text-2xl font-bold text-corporate-gray-900 mb-4">6. Uso Aceptable</h2>
              <div className="space-y-4 text-gray-600">
                <p>El usuario se compromete a utilizar el Sitio Web de conformidad con la ley y estos Términos.</p>
                
                <h3 className="text-lg font-semibold text-corporate-gray-900">Está prohibido:</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Utilizar el Sitio Web para fines ilícitos o no autorizados</li>
                  <li>Introducir virus, malware o código malicioso</li>
                  <li>Intentar acceder a áreas restringidas del sistema</li>
                  <li>Realizar ingeniería inversa del Sitio Web</li>
                  <li>Enviar información falsa o engañosa</li>
                  <li>Interferir con el funcionamiento normal del Sitio Web</li>
                </ul>
              </div>
            </div>

            {/* Modificaciones */}
            <div>
              <h2 className="text-2xl font-bold text-corporate-gray-900 mb-4">7. Modificaciones</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Grupo EA se reserva el derecho a modificar estos Términos y Condiciones, 
                  así como el contenido del Sitio Web, en cualquier momento y sin previo aviso.
                </p>
                <p>
                  Las modificaciones serán efectivas desde su publicación en el Sitio Web. 
                  Se recomienda revisar periódicamente estos términos para estar informado 
                  de posibles cambios.
                </p>
                <p>
                  El uso continuado del Sitio Web después de la publicación de las 
                  modificaciones constituirá la aceptación de las mismas.
                </p>
              </div>
            </div>

            {/* Legislación Aplicable */}
            <div>
              <h2 className="text-2xl font-bold text-corporate-gray-900 mb-4">8. Legislación Aplicable y Jurisdicción</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Estos Términos y Condiciones se rigen por la legislación española.
                </p>
                <p>
                  Para la resolución de cualquier controversia que pueda surgir en relación 
                  con el uso del Sitio Web o la interpretación de estos términos, las partes 
                  se someten expresamente a la jurisdicción de los Juzgados y Tribunales de Valencia, España.
                </p>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h2 className="text-2xl font-bold text-corporate-gray-900 mb-4">9. Contacto</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Para cualquier consulta sobre estos Términos y Condiciones, 
                  puedes contactarnos:
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

export default TermsConditionsPage;