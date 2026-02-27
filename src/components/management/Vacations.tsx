import React, { useState } from 'react';
import { Calendar, Plus, Search, User, CheckCircle, Clock, X, AlertTriangle, MapPin } from 'lucide-react';

const Vacations: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const vacationRequests = [
    {
      id: 1,
      worker: 'Juan García Martínez',
      position: 'Oficial de Albañilería',
      project: 'Autopista A-7 Valencia',
      startDate: '2024-02-15',
      endDate: '2024-02-29',
      days: 15,
      type: 'Vacaciones anuales',
      status: 'Aprobado',
      requestDate: '2024-01-20',
      approvedBy: 'Ana Martínez',
      reason: 'Vacaciones familiares programadas'
    },
    {
      id: 2,
      worker: 'María López Fernández',
      position: 'Operadora de Excavadora',
      project: 'Edificio Residencial Marina',
      startDate: '2024-02-10',
      endDate: '2024-02-12',
      days: 3,
      type: 'Asuntos personales',
      status: 'Pendiente',
      requestDate: '2024-02-05',
      approvedBy: null,
      reason: 'Trámites médicos familiares'
    },
    {
      id: 3,
      worker: 'Carlos Ruiz Sánchez',
      position: 'Soldador Especializado',
      project: 'Polígono Industrial Norte',
      startDate: '2024-03-01',
      endDate: '2024-03-15',
      days: 15,
      type: 'Vacaciones anuales',
      status: 'Aprobado',
      requestDate: '2024-01-15',
      approvedBy: 'Pedro González',
      reason: 'Vacaciones de primavera'
    },
    {
      id: 4,
      worker: 'Ana Torres Vega',
      position: 'Coordinadora de Seguridad',
      project: 'Múltiples proyectos',
      startDate: '2024-02-20',
      endDate: '2024-02-22',
      days: 3,
      type: 'Permiso médico',
      status: 'Rechazado',
      requestDate: '2024-02-18',
      approvedBy: 'Director RRHH',
      reason: 'Consulta médica especializada'
    },
    {
      id: 5,
      worker: 'Pedro González Ruiz',
      position: 'Gruista',
      project: 'Autopista A-7 Valencia',
      startDate: '2024-04-01',
      endDate: '2024-04-14',
      days: 14,
      type: 'Vacaciones anuales',
      status: 'Pendiente',
      requestDate: '2024-02-01',
      approvedBy: null,
      reason: 'Vacaciones de Semana Santa'
    }
  ];

  const vacationBalance = [
    { worker: 'Juan García Martínez', totalDays: 30, usedDays: 15, remainingDays: 15, year: 2024 },
    { worker: 'María López Fernández', totalDays: 30, usedDays: 8, remainingDays: 22, year: 2024 },
    { worker: 'Carlos Ruiz Sánchez', totalDays: 30, usedDays: 15, remainingDays: 15, year: 2024 },
    { worker: 'Ana Torres Vega', totalDays: 30, usedDays: 12, remainingDays: 18, year: 2024 },
    { worker: 'Pedro González Ruiz', totalDays: 30, usedDays: 6, remainingDays: 24, year: 2024 }
  ];

  const filteredRequests = selectedFilter === 'all' 
    ? vacationRequests 
    : vacationRequests.filter(request => {
        if (selectedFilter === 'pendiente') return request.status === 'Pendiente';
        if (selectedFilter === 'aprobado') return request.status === 'Aprobado';
        if (selectedFilter === 'rechazado') return request.status === 'Rechazado';
        return true;
      });

  const stats = [
    { label: 'Solicitudes Totales', value: '89', icon: Calendar, color: 'text-blue-600' },
    { label: 'Pendientes Aprobación', value: '12', icon: Clock, color: 'text-yellow-600' },
    { label: 'Aprobadas', value: '68', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Rechazadas', value: '9', icon: X, color: 'text-red-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprobado': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Rechazado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Vacaciones anuales': return 'bg-blue-100 text-blue-800';
      case 'Asuntos personales': return 'bg-purple-100 text-purple-800';
      case 'Permiso médico': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Vacaciones</h2>
          <p className="text-gray-600">Control de solicitudes y balance de días de vacaciones</p>
        </div>
        <div className="flex space-x-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Calendario Vacaciones</span>
          </button>
          <button className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nueva Solicitud</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vacation Requests */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Solicitudes de Vacaciones</h3>
                <div className="flex space-x-2">
                  {[
                    { id: 'all', label: 'Todas' },
                    { id: 'pendiente', label: 'Pendientes' },
                    { id: 'aprobado', label: 'Aprobadas' },
                    { id: 'rechazado', label: 'Rechazadas' }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setSelectedFilter(filter.id)}
                      className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                        selectedFilter === filter.id
                          ? 'bg-corporate-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-corporate-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-corporate-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{request.worker}</h4>
                          <p className="text-sm text-gray-500">{request.position}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(request.type)}`}>
                          {request.type}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Fechas:</span>
                        <div>{request.startDate} - {request.endDate}</div>
                      </div>
                      <div>
                        <span className="font-medium">Días solicitados:</span>
                        <div>{request.days} días</div>
                      </div>
                      <div>
                        <span className="font-medium">Proyecto:</span>
                        <div>{request.project}</div>
                      </div>
                      <div>
                        <span className="font-medium">Solicitado:</span>
                        <div>{request.requestDate}</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Motivo:</span> {request.reason}
                    </div>

                    {request.status === 'Pendiente' && (
                      <div className="flex space-x-2 pt-3 border-t border-gray-200">
                        <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium">
                          Aprobar
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium">
                          Rechazar
                        </button>
                      </div>
                    )}

                    {request.approvedBy && (
                      <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                        {request.status === 'Aprobado' ? 'Aprobado' : 'Rechazado'} por: {request.approvedBy}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vacation Balance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Balance de Vacaciones 2024</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {vacationBalance.map((balance, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{balance.worker}</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total días:</span>
                      <span className="font-medium">{balance.totalDays}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Días usados:</span>
                      <span className="font-medium text-red-600">{balance.usedDays}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Días restantes:</span>
                      <span className="font-medium text-green-600">{balance.remainingDays}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-corporate-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(balance.usedDays / balance.totalDays) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((balance.usedDays / balance.totalDays) * 100)}% utilizado
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vacations;