import React, { useState, useEffect } from 'react';
import { Cookie, X, Settings, Check } from 'lucide-react';

const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Siempre true, no se puede desactivar
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Verificar si ya se han aceptado las cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(cookieConsent);
      setPreferences(savedPreferences);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptSelected = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);
  };

  const rejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    setPreferences(onlyNecessary);
    localStorage.setItem('cookieConsent', JSON.stringify(onlyNecessary));
    setShowBanner(false);
    setShowSettings(false);
  };

  const handlePreferenceChange = (type: keyof typeof preferences) => {
    if (type === 'necessary') return; // No se puede desactivar
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
      
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-corporate-blue-600 shadow-2xl z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {!showSettings ? (
            // Banner Principal
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-start space-x-4 flex-1">
                <Cookie className="h-8 w-8 text-corporate-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-corporate-gray-900 mb-2">
                    🍪 Utilizamos cookies
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Utilizamos cookies propias y de terceros para mejorar nuestros servicios, 
                    personalizar contenido y analizar el tráfico web. Puedes aceptar todas las cookies, 
                    configurar tus preferencias o rechazar las no esenciales.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Al continuar navegando, aceptas nuestra{' '}
                    <button className="text-corporate-blue-600 hover:underline">
                      Política de Cookies
                    </button>
                    {' '}y{' '}
                    <button className="text-corporate-blue-600 hover:underline">
                      Política de Privacidad
                    </button>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Configurar</span>
                </button>
                <button
                  onClick={rejectAll}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Rechazar
                </button>
                <button
                  onClick={acceptAll}
                  className="px-6 py-2 bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Aceptar Todas
                </button>
              </div>
            </div>
          ) : (
            // Panel de Configuración
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-corporate-gray-900">
                  Configuración de Cookies
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Cookies Necesarias */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-corporate-gray-900 mb-1">
                      Cookies Necesarias
                    </h4>
                    <p className="text-sm text-gray-600">
                      Esenciales para el funcionamiento básico del sitio web. 
                      No se pueden desactivar.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-corporate-blue-600 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Cookies Analíticas */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-corporate-gray-900 mb-1">
                      Cookies Analíticas
                    </h4>
                    <p className="text-sm text-gray-600">
                      Nos ayudan a entender cómo interactúas con el sitio web 
                      para mejorarlo.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('analytics')}
                      className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                        preferences.analytics 
                          ? 'bg-corporate-blue-600 justify-end' 
                          : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>

                {/* Cookies de Marketing */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-corporate-gray-900 mb-1">
                      Cookies de Marketing
                    </h4>
                    <p className="text-sm text-gray-600">
                      Utilizadas para mostrar anuncios relevantes y medir 
                      la efectividad de campañas.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('marketing')}
                      className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                        preferences.marketing 
                          ? 'bg-corporate-blue-600 justify-end' 
                          : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>

                {/* Cookies Funcionales */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-corporate-gray-900 mb-1">
                      Cookies Funcionales
                    </h4>
                    <p className="text-sm text-gray-600">
                      Permiten funcionalidades avanzadas como chat en vivo 
                      y personalización.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => handlePreferenceChange('functional')}
                      className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                        preferences.functional 
                          ? 'bg-corporate-blue-600 justify-end' 
                          : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={rejectAll}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Rechazar Todas
                </button>
                <button
                  onClick={acceptSelected}
                  className="flex items-center justify-center space-x-2 px-6 py-2 bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <Check className="h-4 w-4" />
                  <span>Guardar Preferencias</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CookieBanner;