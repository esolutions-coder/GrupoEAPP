import React, { useState } from 'react';
import { 
  Calendar, Plus, Search, User, CheckCircle, Clock, X, AlertTriangle, 
  MapPin, Filter, Download, Eye, Edit, FileText, Send
} from 'lucide-react';
import { VacationRequest, VacationBalance, VacationCalendar } from '../../types/vacation';
import { handleCRUDOperation, showSuccessNotification, showErrorNotification } from '../../utils/modalUtils';

interface VacationsIntegratedProps {
  workerId?: string; // Si se pasa, muestra solo las vacaciones de ese operario
  isWorkerView?: boolean; // Vista para operario vs administrador
}

const VacationsIntegrated: React.FC<VacationsIntegratedProps> = ({ 
  workerId, 
  isWorkerView = false 
}) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('2024-02');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VacationRequest | null>(null);

  // Funciones de acción
  const handleApprove = async (request: VacationRequest) => {
    const success = await handleCRUDOperation('update', 'Solicitud Vacaciones', { ...request, status: 'approved' }, request.id);
    if (success) {
      showSuccessNotification('Solicitud aprobada correctamente');
    }
  };

  const handleReject = async (request: VacationRequest) => {
    const success = await handleCRUDOperation('update', 'Solicitud Vacaciones', { ...request, status: 'rejected' }, request.id);
    if (success) {
      showSuccessNotification('Solicitud rechazada');
    }
  };

  const [requestForm, setRequestForm] = useState({
    startDate: '',
    endDate: '',
    type: 'annual',
    reason: '',
    coverageArrangements: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const [vacationRequests] = useState<VacationRequest[]>([
    {
      id: '1',
      workerId: '1',
      workerName: 'Juan García Martínez',
      workerCategory: 'Oficial',
      workerCrew: 'Cuadrilla A',
      startDate: '2024-02-15',
      endDate: '2024-02-29',
      totalDays: 15,
      type: 'annual',
      reason: 'Vacaciones familiares programadas',
      requestDate: '2024-01-20',
      status: 'approved',
      approvedBy: 'Ana Martínez',
      approvalDate: '2024-01-22',
      coverageArrangements: 'Pedro López cubrirá las tareas',
      emergencyContact: 'María García',
      emergencyPhone: '+34 666 111 222',
      comments: 'Vacaciones aprobadas sin problemas'
    },
    {
      id: '2',
      workerId: '2',
      workerName: 'María López Fernández',
      workerCategory: 'Maquinista',
      workerCrew: 'Cuadrilla B',
      startDate: '2024-02-10',
      endDate: '2024-02-12',
      totalDays: 3,
      type: 'personal',
      reason: 'Trámites médicos familiares',
      requestDate: '2024-02-05',
      status: 'pending',
      coverageArrangements: 'Carlos Ruiz operará la excavadora',
      emergencyContact: 'Antonio López',
      emergencyPhone: '+34 666 333 444',
      comments: 'Pendiente de aprobación'
    },
    {
      id: '3',
      workerId: '1',
      workerName: 'Juan García Martínez',
      workerCategory: 'Oficial',
      workerCrew: 'Cuadrilla A',
      startDate: '2024-03-01',
      endDate: '2024-03-15',
      totalDays: 15,
      type: 'annual',
      reason: 'Vacaciones de primavera',
      requestDate: '2024-01-15',
      status: 'approved',
      approvedBy: 'Pedro González',
      approvalDate: '2024-01-18',
      coverageArrangements: 'Equipo completo disponible',
      emergencyContact: 'María García',
      emergencyPhone: '+34 666 111 222',
      comments: 'Aprobado para marzo'
    }
  ]);

  const [vacationBalances] = useState<VacationBalance[]>([
    {
      workerId: '1',
      workerName: 'Juan García Martínez',
      year: 2024,
      totalDays: 30,
      usedDays: 15,
      pendingDays: 0,
      approvedDays: 15,
      remainingDays: 15,
      carryOverDays: 0,
      earnedDays: 30,
      lastUpdated: '2024-01-31'
    },
    {
      workerId: '2',
      workerName: 'María López Fernández',
      year: 2024,
      totalDays: 30,
      usedDays: 8,
      pendingDays: 3,
      approvedDays: 0,
      remainingDays: 22,
      carryOverDays: 0,
      earnedDays: 30,
      lastUpdated: '2024-02-05'
    }
  ]);

  // Filtrar datos según el contexto (operario específico o todos)
  const filteredRequests = vacationRequests.filter(request => {
    const matchesWorker = !workerId || request.workerId === workerId;
    const matchesFilter = selectedFilter === 'all' || request.status === selectedFilter;
    return matchesWorker && matchesFilter;
  });

  const filteredBalances = vacationBalances.filter(balance => 
    !workerId || balance.workerId === workerId
  );

  const stats = [
    { 
      label: 'Solicitudes Totales', 
      value: filteredRequests.length.toString(), 
      icon: Calendar, 
      color: 'text-blue-600' 
    },
    { 
      label: 'Pendientes Aprobación', 
      value: filteredRequests.filter(r => r.status === 'pending').length.toString(), 
      icon: Clock, 
      color: 'text-yellow-600' 
    },
    { 
      label: 'Aprobadas', 
      value: filteredRequests.filter(r => r.status === 'approved').length.toString(), 
      icon: CheckCircle, 
      color: 'text-green-600' 
    },
    { 
      label: 'Días Totales', 
      value: filteredRequests.reduce((sum, r) => sum + r.totalDays, 0).toString(), 
      icon: Calendar, 
      color: 'text-purple-600' 
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'annual': return 'bg-blue-100 text-blue-800';
      case 'personal': return 'bg-purple-100 text-purple-800';
      case 'medical': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar la solicitud
    console.log('Solicitud de vacaciones:', requestForm);
    setShowRequestModal(false);
    // Reset form
    setRequestForm({
      startDate: '',
      endDate: '',
      type: 'annual',
      reason: '',
      coverageArrangements: '',
      emergencyContact: '',
      emergencyPhone: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isWorkerView ? 'Mis Vacaciones' : 'Gestión de Vacaciones'}
          </h2>
          <p className="text-gray-600">
            {isWorkerView 
              ? 'Consulta tu balance y solicita vacaciones' 
              : 'Control de solicitudes y balance de días de vacaciones'
            }
          </p>
        </div>
        <div className="flex space-x-3">
          {!isWorkerView && (
            <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          )}
          <button type="button" onClick={() => setShowRequestModal(true)}
            className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{isWorkerView ? 'Solicitar Vacaciones' : 'Nueva Solicitud'}</span>
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

      {/* Vacation Balance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {isWorkerView ? 'Mi Balance de Vacaciones 2024' : 'Balance de Vacaciones 2024'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBalances.map((balance) => (
            <div key={balance.workerId} className="border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">{balance.workerName}</h4>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total días:</span>
                  <span className="font-medium">{balance.totalDays}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Días usados:</span>
                  <span className="font-medium text-red-600">{balance.usedDays}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Días pendientes:</span>
                  <span className="font-medium text-yellow-600">{balance.pendingDays}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Días restantes:</span>
                  <span className="font-medium text-green-600">{balance.remainingDays}</span>
                </div>
              </div>

              <div className="mt-4">
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

      {/* Filters */}
      {!isWorkerView && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar operarios..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las solicitudes</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Vacation Requests */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {isWorkerView ? 'Mis Solicitudes' : 'Solicitudes de Vacaciones'}
          </h3>
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
                      <h4 className="font-medium text-gray-900">{request.workerName}</h4>
                      <p className="text-sm text-gray-500">{request.workerCategory} • {request.workerCrew}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(request.type)}`}>
                      {request.type === 'annual' ? 'Anuales' :
                       request.type === 'personal' ? 'Personales' :
                       request.type === 'medical' ? 'Médicas' : request.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status === 'approved' ? 'Aprobado' :
                       request.status === 'pending' ? 'Pendiente' :
                       request.status === 'rejected' ? 'Rechazado' : 'Cancelado'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Fechas:</span>
                    <div>{new Date(request.startDate).toLocaleDateString('es-ES')} - {new Date(request.endDate).toLocaleDateString('es-ES')}</div>
                  </div>
                  <div>
                    <span className="font-medium">Días solicitados:</span>
                    <div>{request.totalDays} días</div>
                  </div>
                  <div>
                    <span className="font-medium">Solicitado:</span>
                    <div>{new Date(request.requestDate).toLocaleDateString('es-ES')}</div>
                  </div>
                  <div>
                    <span className="font-medium">Contacto emergencia:</span>
                    <div>{request.emergencyContact}</div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Motivo:</span> {request.reason}
                </div>

                {request.coverageArrangements && (
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Cobertura:</span> {request.coverageArrangements}
                  </div>
                )}

                {!isWorkerView && request.status === 'pending' && (
                  <div className="flex space-x-2 pt-3 border-t border-gray-200">
                    <button type="button" onClick={() => handleApprove(request)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      Aprobar
                    </button>
                    <button type="button" onClick={() => handleReject(request)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      Rechazar
                    </button>
                  </div>
                )}

                {request.approvedBy && (
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                    {request.status === 'approved' ? 'Aprobado' : 'Rechazado'} por: {request.approvedBy}
                    {request.approvalDate && ` el ${new Date(request.approvalDate).toLocaleDateString('es-ES')}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {isWorkerView ? 'Solicitar Vacaciones' : 'Nueva Solicitud de Vacaciones'}
                </h2>
                <button type="button" onClick={() => setShowRequestModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={async (e) => {
                e.preventDefault();
                showSuccessNotification('Solicitud de vacaciones enviada correctamente');
                await handleCRUDOperation('create', 'Solicitud Vacaciones', requestForm);
                setShowRequestModal(false);
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      required
                      value={requestForm.startDate}
                      onChange={(e) => setRequestForm({...requestForm, startDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Fin *
                    </label>
                    <input
                      type="date"
                      required
                      value={requestForm.endDate}
                      onChange={(e) => setRequestForm({...requestForm, endDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Vacaciones *
                  </label>
                  <select
                    required
                    value={requestForm.type}
                    onChange={(e) => setRequestForm({...requestForm, type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  >
                    <option value="annual">Vacaciones Anuales</option>
                    <option value="personal">Asuntos Personales</option>
                    <option value="medical">Permiso Médico</option>
                    <option value="other">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={requestForm.reason}
                    onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                    placeholder="Explica el motivo de la solicitud..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arreglos de Cobertura
                  </label>
                  <textarea
                    rows={2}
                    value={requestForm.coverageArrangements}
                    onChange={(e) => setRequestForm({...requestForm, coverageArrangements: e.target.value})}
                    placeholder="¿Quién cubrirá tus tareas durante tu ausencia?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contacto de Emergencia *
                    </label>
                    <input
                      type="text"
                      required
                      value={requestForm.emergencyContact}
                      onChange={(e) => setRequestForm({...requestForm, emergencyContact: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono de Emergencia *
                    </label>
                    <input
                      type="tel"
                      required
                      value={requestForm.emergencyPhone}
                      onChange={(e) => setRequestForm({...requestForm, emergencyPhone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send className="h-5 w-5" />
                    <span>Enviar Solicitud</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacationsIntegrated;