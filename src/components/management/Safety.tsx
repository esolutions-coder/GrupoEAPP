import React from 'react';
import { Shield, Plus, AlertTriangle, CheckCircle, Users, FileText, Calendar, TrendingUp } from 'lucide-react';
import { handleCRUDOperation, showSuccessNotification } from '../../utils/modalUtils';

const Safety: React.FC = () => {
  // Funciones de acción
  const handleNewIncident = () => {
    handleCRUDOperation('create', 'Incidente');
    showSuccessNotification('Creando nuevo incidente');
  };

  const handleScheduleTraining = () => {
    handleCRUDOperation('create', 'Formación');
    showSuccessNotification('Programando nueva formación');
  };

  const safetyStats = [
    { label: 'Días sin incidentes', value: '127', trend: '+5', color: 'text-green-600' },
    { label: 'Trabajadores certificados PRL', value: '235/247', trend: '95%', color: 'text-blue-600' },
    { label: 'Inspecciones realizadas', value: '18', trend: '+3', color: 'text-purple-600' },
    { label: 'Incidentes este mes', value: '2', trend: '-1', color: 'text-red-600' }
  ];

  const recentIncidents = [
    {
      id: 1,
      type: 'Leve',
      description: 'Corte menor en mano por herramienta',
      worker: 'Juan García',
      project: 'Autopista A-7 Valencia',
      date: '2024-01-28',
      status: 'Cerrado'
    },
    {
      id: 2,
      type: 'Medio',
      description: 'Caída desde andamio (2m altura)',
      worker: 'Carlos Ruiz',
      project: 'Edificio Marina',
      date: '2024-01-25',
      status: 'Investigando'
    }
  ];

  const upcomingTraining = [
    {
      id: 1,
      title: 'PRL Trabajos en Altura',
      date: '2024-02-15',
      duration: '8 horas',
      participants: 15,
      instructor: 'Ana Martínez'
    },
    {
      id: 2,
      title: 'Manejo Seguro de Maquinaria',
      date: '2024-02-20',
      duration: '6 horas',
      participants: 12,
      instructor: 'Miguel Torres'
    }
  ];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Seguridad</h2>
          <p className="text-gray-600">Control de seguridad laboral y prevención de riesgos</p>
        </div>
        <div className="flex space-x-3">
          <button type="button" onClick={handleNewIncident}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Nuevo Incidente</span>
          </button>
          <button type="button" onClick={handleScheduleTraining}
            className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Programar Formación</span>
          </button>
        </div>
      </div>

      {/* Safety Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {safetyStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${stat.color}`}>{stat.trend}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Incidents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Incidentes Recientes</h3>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Incidente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trabajador</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{incident.description}</div>
                      <div className="text-xs text-gray-500">{incident.date}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{incident.worker}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{incident.project}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        incident.type === 'Leve' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : incident.type === 'Medio'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {incident.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        incident.status === 'Cerrado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {incident.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Training */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Próximas Formaciones</h3>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formación</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Duración</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Participantes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {upcomingTraining.map((training) => (
                  <tr key={training.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{training.title}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">{training.date}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">{training.duration}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-blue-600">{training.participants}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{training.instructor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Safety Protocols */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Protocolos de Seguridad Activos</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'PRL Básico 20 Horas',
              'Trabajos en Altura',
              'Espacios Confinados',
              'Manejo de Maquinaria',
              'Soldadura Segura',
              'Primeros Auxilios'
            ].map((protocol, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{protocol}</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Safety;