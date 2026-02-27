import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const phoneNumber = '+34658936651';
  
  const quickResponses = [
    {
      id: 'presupuesto',
      title: 'Solicitar Presupuesto',
      message: 'Hola, me gustaría solicitar un presupuesto para un proyecto de construcción. ¿Podrían contactarme?'
    },
    {
      id: 'servicios',
      title: 'Información de Servicios',
      message: 'Buenos días, necesito información sobre sus servicios de obra civil, edificación y movimientos de tierras.'
    },
    {
      id: 'trabajo',
      title: 'Oportunidades de Trabajo',
      message: 'Hola, estoy interesado en trabajar con ustedes. ¿Tienen vacantes disponibles? Mi CV puede ser enviado a recursoshumanos@grupoea.es'
    },
    {
      id: 'urgente',
      title: 'Consulta Urgente',
      message: 'Tengo una consulta urgente sobre un proyecto. ¿Podrían atenderme lo antes posible?'
    },
    {
      id: 'general',
      title: 'Consulta General',
      message: 'Hola, tengo algunas preguntas sobre Grupo EA y sus servicios.'
    }
  ];

  const sendWhatsAppMessage = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\s+/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
    setSelectedOption(null);
  };

  return (
    <>
      {/* WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Abrir chat de WhatsApp"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-2xl z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-green-500 text-white p-4 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Grupo EA</h3>
                <p className="text-sm opacity-90">Respuesta rápida garantizada</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {!selectedOption ? (
              <>
                <div className="mb-4">
                  <p className="text-gray-700 text-sm mb-3">
                    ¡Hola! 👋 Somos Grupo EA. Selecciona el tipo de consulta que necesitas:
                  </p>
                </div>
                <div className="space-y-2">
                  {quickResponses.map((response) => (
                    <button
                      key={response.id}
                      onClick={() => setSelectedOption(response.id)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-corporate-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-corporate-blue-300"
                    >
                      <span className="text-sm font-medium text-corporate-gray-800">
                        {response.title}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <button
                    onClick={() => setSelectedOption(null)}
                    className="text-corporate-blue-600 text-sm hover:underline mb-3"
                  >
                    ← Volver a opciones
                  </button>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      {quickResponses.find(r => r.id === selectedOption)?.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => sendWhatsAppMessage(
                    quickResponses.find(r => r.id === selectedOption)?.message || ''
                  )}
                  className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Enviar por WhatsApp</span>
                </button>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <p className="text-xs text-gray-500 text-center">
              Horario: Lun-Vie 8:00-18:00 | Respuesta en menos de 1 hora
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppButton;