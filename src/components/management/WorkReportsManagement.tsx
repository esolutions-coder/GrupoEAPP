import React, { useState } from 'react';
import { ClipboardList, Plus, Search, Calendar, Clock, User, MapPin, CheckCircle, AlertTriangle, FileText, Download, Edit, FileSignature as Signature, Users, Building2 } from 'lucide-react';
import { WorkReport, WorkReportWorker, Crew } from '../../types/construction';

const WorkReportsManagement: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('2024-01-31');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedReport, setSelectedReport] = useState<WorkReport | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [workReports] = useState<WorkReport[]>([
    {
      id: '1',
      projectId: '1',
      date: '2024-01-31',
      responsible: 'Ana Martínez Torres',
      activities: [
        'Excavación en zona norte',
        'Colocación de encofrado',
        'Vertido de hormigón H-25'
      ],
      workers: [
        {
          workerId: '1',
          workerName: 'Juan García',
          category: 'Oficial',
          hourType: 'admin',
          regularHours: 8,
          overtimeHours: 0,
          nightHours: 0,
          holidayHours: 0,
          observations: 'Trabajo completado según planificación'
        },
        {
          workerId: '2',
          workerName: 'María López',
          category: 'Maquinista',
          hourType: 'admin',
          regularHours: 8,
          overtimeHours: 1,
          nightHours: 0,
          holidayHours: 0,
          observations: 'Hora extra por finalización de tarea'
        }
      ],
      signature: 'Ana Martínez Torres',
      status: 'approved',
      submissionDate: '2024-01-31',
      approvalDate: '2024-02-01'
    }
  ]);

  const [crews] = useState<Crew[]>([
    {
      id: '1',
      name: 'Cuadrilla Albañilería A',
      leaderId: '1',
      leaderName: 'Juan García',
      members: ['2', '3', '4'],
      memberNames: ['Pedro López', 'Carlos Ruiz', 'Antonio Vega'],
      status: 'active',
      specialization: 'Albañilería y Estructura',
      currentProject: 'Autopista A-7 Valencia'
    },
    {
      id: '2',
      name: 'Cuadrilla Movimiento Tierras',
      leaderId: '2',
      leaderName: 'María López',
      members: ['5', '6'],
      memberNames: ['Francisco Gil', 'Rosa Jiménez'],
      status: 'active',
      specialization: 'Excavación y Movimientos',
      currentProject: 'Polígono Industrial Norte'
    }
  ]);

  const filteredReports = workReports.filter(report => {
    const matchesDate = report.date === selectedDate;
    const matchesProject = selectedProject === 'all' || report.projectId === selectedProject;
    return matchesDate && matchesProject;
  });

  const stats = [
    { label: 'Partes del Día', value: filteredReports.length.toString(), icon: ClipboardList, color: 'text-blue-600' },
    { label: 'Horas Totales', value: filteredReports.reduce((sum, r) => sum + r.workers.reduce((s, w) => s + w.regularHours + w.overtimeHours, 0), 0).toString(), icon: Clock, color: 'text-green-600' },
    { label: 'Trabajadores', value: filteredReports.reduce((sum, r) => sum + r.workers.length, 0).toString(), icon: Users, color: 'text-purple-600' },
    { label: 'Aprobados', value: filteredReports.filter(r => r.status === 'approved').length.toString(), icon: CheckCircle, color: 'text-green-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'submitted': return 'Enviado';
      case 'draft': return 'Borrador';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Partes de Trabajo</h2>
          <p className="text-gray-600">Registro diario de actividades y control de horas</p>
        </div>
        <div className="flex space-x-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exportar Mes</span>
          </button>
          <button type="button" onClick={() => setIsCreating(true)}
            className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Parte</span>
          </button>
        </div>
      </div>

      {/* Date and Project Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto:</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
              >
                <option value="all">Todos los proyectos</option>
                <option value="1">Autopista A-7 Valencia</option>
                <option value="2">Edificio Residencial Marina</option>
                <option value="3">Polígono Industrial Norte</option>
              </select>
            </div>
          </div>
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

      {/* Work Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Partes de Trabajo - {new Date(selectedDate).toLocaleDateString('es-ES')} ({filteredReports.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actividades
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trabajadores
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas Totales
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-corporate-blue-100 rounded-full flex items-center justify-center">
                        <ClipboardList className="h-5 w-5 text-corporate-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{report.responsible}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(report.date).toLocaleDateString('es-ES')}
                        </div>
                        {report.signature && (
                          <div className="text-xs text-gray-400">Firmado</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Proyecto #{report.projectId}</div>
                    {report.submissionDate && (
                      <div className="text-xs text-gray-500">
                        Enviado: {new Date(report.submissionDate).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {report.activities.slice(0, 2).map((activity, index) => (
                        <div key={index} className="truncate">{activity}</div>
                      ))}
                      {report.activities.length > 2 && (
                        <div className="text-xs text-gray-500">+{report.activities.length - 2} más...</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-medium text-blue-600">
                      {report.workers.length}
                    </div>
                    <div className="text-xs text-gray-500">operarios</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-bold text-gray-900">
                      {report.workers.reduce((sum, w) => sum + w.regularHours + w.overtimeHours, 0)}h
                    </div>
                    <div className="text-xs text-gray-500">
                      {report.workers.reduce((sum, w) => sum + w.overtimeHours, 0)}h extra
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button type="button" onClick={() => setSelectedReport(report)}
                        className="text-corporate-blue-600 hover:text-corporate-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-purple-600 hover:text-purple-900"
                        title="Descargar PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crews Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Cuadrillas Destajistas</h3>
          <button className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nueva Cuadrilla</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {crews.map((crew) => (
            <div key={crew.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{crew.name}</h4>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  crew.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {crew.status === 'active' ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Jefe: {crew.leaderName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Miembros: {crew.members.length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Especialización: {crew.specialization}</span>
                </div>
                {crew.currentProject && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Proyecto: {crew.currentProject}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-3">
                <h5 className="text-xs font-medium text-gray-700 mb-2">Miembros:</h5>
                <div className="flex flex-wrap gap-1">
                  {crew.memberNames.map((member, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {member}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-gray-200 mt-3">
                <div className="flex space-x-2">
                  <button className="text-green-600 hover:text-green-900">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <AlertTriangle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Work Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Parte de Trabajo - {selectedReport.date}
                </h2>
                <button type="button" onClick={() => setSelectedReport(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Fecha:</strong> {selectedReport.date}</div>
                    <div><strong>Responsable:</strong> {selectedReport.responsible}</div>
                    <div><strong>Estado:</strong> {getStatusLabel(selectedReport.status)}</div>
                    {selectedReport.submissionDate && (
                      <div><strong>Enviado:</strong> {selectedReport.submissionDate}</div>
                    )}
                    {selectedReport.approvalDate && (
                      <div><strong>Aprobado:</strong> {selectedReport.approvalDate}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Horas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Horas Normales:</span>
                      <span className="font-medium">
                        {selectedReport.workers.reduce((sum, w) => sum + w.regularHours, 0)}h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Horas Extra:</span>
                      <span className="font-medium text-yellow-600">
                        {selectedReport.workers.reduce((sum, w) => sum + w.overtimeHours, 0)}h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Trabajadores:</span>
                      <span className="font-medium">{selectedReport.workers.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividades</h3>
                <ul className="space-y-2">
                  {selectedReport.activities.map((activity, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <span className="text-corporate-blue-500 mt-1">•</span>
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle de Trabajadores</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Trabajador</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Categoría</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Tipo</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">H. Normales</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">H. Extra</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedReport.workers.map((worker, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{worker.workerName}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{worker.category}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              worker.hourType === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {worker.hourType === 'admin' ? 'Admin' : 'Destajo'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-900">{worker.regularHours}h</td>
                          <td className="px-4 py-3 text-center">
                            {worker.overtimeHours > 0 ? (
                              <span className="text-yellow-600 font-medium">{worker.overtimeHours}h</span>
                            ) : (
                              <span className="text-gray-400">0h</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{worker.observations}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Work Report Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Nuevo Parte de Trabajo</h2>
                <button type="button" onClick={() => setIsCreating(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Cabecera */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Obra *</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500">
                        <option value="">Seleccionar obra</option>
                        <option value="1">Autopista A-7 Valencia</option>
                        <option value="2">Edificio Residencial Marina</option>
                        <option value="3">Polígono Industrial Norte</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                      <input
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Responsable *</label>
                      <input
                        type="text"
                        placeholder="Nombre del responsable"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Actividades */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividades Realizadas</h3>
                  <textarea
                    rows={4}
                    placeholder="Describe las actividades realizadas durante la jornada..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                  />
                </div>

                {/* Trabajadores */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Trabajadores</h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-gray-700">Agregar trabajadores al parte</span>
                      <button className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-3 py-1 rounded text-sm">
                        + Agregar Trabajador
                      </button>
                    </div>
                    <div className="text-center text-gray-500 py-8">
                      No hay trabajadores agregados
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex space-x-4 pt-6 border-t">
                  <button type="button" onClick={() => setIsCreating(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Guardar Borrador
                  </button>
                  <button className="px-6 py-3 bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white rounded-lg font-semibold">
                    Enviar Parte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkReportsManagement;