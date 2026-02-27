import React, { useState, useMemo } from 'react';
import { 
  Clock, Calendar, Building2, TrendingUp, User, LogOut, 
  BarChart3, FileText, CheckCircle, AlertTriangle, Euro,
  MapPin, Award, Bell, Settings, Download, Filter, Package
} from 'lucide-react';
import { WorkerSummary, WorkerWorkReport, WorkerProject, WorkerProfile } from '../types/workerPanel';
import VacationsIntegrated from '../components/management/VacationsIntegrated';

interface WorkerPanelPageProps {
  workerId: string;
  onNavigate: (page: string) => void;
}

const WorkerPanelPage: React.FC<WorkerPanelPageProps> = ({ workerId, onNavigate }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedTab, setSelectedTab] = useState<'summary' | 'reports' | 'projects' | 'vacations' | 'epis' | 'profile'>('summary');

  // Datos del operario (simulados)
  const workerProfile: WorkerProfile = {
    id: workerId,
    personalData: {
      firstName: workerId === '1' ? 'Juan' : 'María',
      lastName: workerId === '1' ? 'García Martínez' : 'López Fernández',
      dni: workerId === '1' ? '12345678A' : '87654321B',
      phone: workerId === '1' ? '+34 666 123 456' : '+34 666 789 012',
      email: workerId === '1' ? 'juan.garcia@grupoea.es' : 'maria.lopez@grupoea.es',
      address: workerId === '1' ? 'Calle Mayor 123' : 'Avenida del Puerto 45',
      city: workerId === '1' ? 'Valencia' : 'Alicante'
    },
    professionalData: {
      category: workerId === '1' ? 'Oficial' : 'Maquinista',
      crew: workerId === '1' ? 'Cuadrilla A' : 'Cuadrilla B',
      startDate: workerId === '1' ? '2023-01-15' : '2022-08-20',
      prlCertifications: workerId === '1' ? ['PRL 20H', 'Trabajos en Altura'] : ['PRL Maquinaria', 'Operador Excavadora'],
      prlExpiryDate: workerId === '1' ? '2025-06-15' : '2025-08-20'
    },
    currentProject: {
      id: workerId === '1' ? '1' : '2',
      name: workerId === '1' ? 'Autopista A-7 Valencia' : 'Edificio Residencial Marina',
      role: workerId === '1' ? 'Oficial Albañilería' : 'Operadora Excavadora',
      startDate: '2024-01-15'
    }
  };

  // Resumen mensual
  const monthlySummary: WorkerSummary = {
    workerId,
    workerName: `${workerProfile.personalData.firstName} ${workerProfile.personalData.lastName}`,
    period: selectedPeriod,
    totalHours: 168,
    regularHours: 160,
    overtimeHours: 8,
    totalProjects: 1,
    totalEarnings: workerId === '1' ? 3080 : 3520,
    workDays: 21
  };

  // Partes de trabajo
  const workReports: WorkerWorkReport[] = [
    {
      id: '1',
      date: '2024-01-31',
      projectId: workerId === '1' ? '1' : '2',
      projectName: workerId === '1' ? 'Autopista A-7 Valencia' : 'Edificio Residencial Marina',
      regularHours: 8,
      overtimeHours: 0,
      nightHours: 0,
      holidayHours: 0,
      totalHours: 8,
      activities: workerId === '1' ? [
        'Colocación de encofrado en muro de contención',
        'Vertido de hormigón H-25',
        'Desencofrado y acabados'
      ] : [
        'Excavación para cimentación bloque B',
        'Movimiento de tierras a vertedero',
        'Limpieza de zanjas'
      ],
      observations: 'Trabajo completado según planificación',
      status: 'approved',
      approvedBy: 'Ana Martínez',
      approvalDate: '2024-02-01'
    },
    {
      id: '2',
      date: '2024-01-30',
      projectId: workerId === '1' ? '1' : '2',
      projectName: workerId === '1' ? 'Autopista A-7 Valencia' : 'Edificio Residencial Marina',
      regularHours: 8,
      overtimeHours: 1,
      nightHours: 0,
      holidayHours: 0,
      totalHours: 9,
      activities: workerId === '1' ? [
        'Preparación de superficie para hormigonado',
        'Colocación de armadura',
        'Revisión de niveles'
      ] : [
        'Excavación zona sur',
        'Carga de material sobrante',
        'Mantenimiento preventivo excavadora'
      ],
      observations: 'Hora extra por finalización de tarea urgente',
      status: 'approved',
      approvedBy: 'Ana Martínez',
      approvalDate: '2024-01-31'
    }
  ];

  // Proyectos del operario
  const workerProjects: WorkerProject[] = [
    {
      id: workerId === '1' ? '1' : '2',
      name: workerId === '1' ? 'Autopista A-7 Valencia' : 'Edificio Residencial Marina',
      location: workerId === '1' ? 'Valencia, España' : 'Alicante, España',
      startDate: '2024-01-15',
      totalHours: 168,
      role: workerId === '1' ? 'Oficial Albañilería' : 'Operadora Excavadora',
      status: 'active'
    }
  ];

  const filteredReports = useMemo(() => {
    return workReports.filter(report => {
      const matchesPeriod = report.date.startsWith(selectedPeriod);
      const matchesProject = selectedProject === 'all' || report.projectId === selectedProject;
      return matchesPeriod && matchesProject;
    });
  }, [selectedPeriod, selectedProject, workReports]);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      onNavigate('home');
    }
  };

  const renderSummaryTab = () => (
    <div className="space-y-6">
      {/* Resumen Mensual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Horas Totales</p>
              <p className="text-2xl font-bold text-gray-900">{monthlySummary.totalHours}h</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Horas Extra</p>
              <p className="text-2xl font-bold text-yellow-600">{monthlySummary.overtimeHours}h</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Días Trabajados</p>
              <p className="text-2xl font-bold text-green-600">{monthlySummary.workDays}</p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Estimados</p>
              <p className="text-2xl font-bold text-purple-600">€{monthlySummary.totalEarnings.toLocaleString()}</p>
            </div>
            <Euro className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Proyecto Actual */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Proyecto Actual</h3>
        {workerProfile.currentProject && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-medium text-gray-900">{workerProfile.currentProject.name}</h4>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                Activo
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Rol: {workerProfile.currentProject.role}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Inicio: {workerProfile.currentProject.startDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Horas acumuladas: {monthlySummary.totalHours}h</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gráfico de Horas (Placeholder) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolución de Horas - {selectedPeriod}</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
            <p>Gráfico de evolución de horas trabajadas</p>
            <p className="text-sm">(Funcionalidad en desarrollo)</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proyecto</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los proyectos</option>
              {workerProjects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button className="px-4 py-2 bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white rounded-lg flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Partes de Trabajo */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{report.projectName}</h3>
                <p className="text-sm text-gray-600">{new Date(report.date).toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                report.status === 'approved' ? 'bg-green-100 text-green-800' :
                report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {report.status === 'approved' ? 'Aprobado' :
                 report.status === 'pending' ? 'Pendiente' : 'Rechazado'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{report.regularHours}h</div>
                <div className="text-sm text-gray-600">Horas Normales</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">{report.overtimeHours}h</div>
                <div className="text-sm text-gray-600">Horas Extra</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{report.totalHours}h</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  €{(report.totalHours * (workerId === '1' ? 18.5 : 22.0)).toFixed(0)}
                </div>
                <div className="text-sm text-gray-600">Ingresos</div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Actividades Realizadas:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                {report.activities.map((activity, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-corporate-blue-500 mt-1">•</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {report.observations && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">Observaciones:</h4>
                <p className="text-sm text-gray-600">{report.observations}</p>
              </div>
            )}

            {report.status === 'approved' && report.approvedBy && (
              <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                Aprobado por {report.approvedBy} el {new Date(report.approvalDate!).toLocaleDateString('es-ES')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderProjectsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {workerProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                <p className="text-gray-600">{project.role}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {project.status === 'active' ? 'Activo' : 'Completado'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Inicio: {project.startDate}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Total: {project.totalHours}h</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Resumen de Participación:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Horas trabajadas:</span>
                  <div className="font-semibold text-gray-900">{project.totalHours}h</div>
                </div>
                <div>
                  <span className="text-gray-600">Ingresos generados:</span>
                  <div className="font-semibold text-green-600">
                    €{(project.totalHours * (workerId === '1' ? 18.5 : 22.0)).toFixed(0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVacationsTab = () => (
    <VacationsIntegrated workerId={workerId} isWorkerView={true} />
  );

  const renderEPIsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis EPIs Asignados</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">⛑️</span>
              <div>
                <h4 className="font-medium text-gray-900">Casco de Seguridad</h4>
                <p className="text-sm text-gray-600">MSA V-Gard</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Entregado:</span>
                <span>15/01/2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Caduca:</span>
                <span className="text-green-600">15/01/2027</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Activo</span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">🦺</span>
              <div>
                <h4 className="font-medium text-gray-900">Chaleco Reflectante</h4>
                <p className="text-sm text-gray-600">Portwest Hi-Vis</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Entregado:</span>
                <span>15/01/2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Caduca:</span>
                <span className="text-yellow-600">15/01/2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Próximo a caducar</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Bell className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h4 className="font-medium text-yellow-800">Recordatorio</h4>
              <p className="text-sm text-yellow-700">
                Tu chaleco reflectante caduca en 45 días. Solicita reposición a tu supervisor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
          <div className="space-y-3 text-sm">
            <div><strong>Nombre:</strong> {workerProfile.personalData.firstName} {workerProfile.personalData.lastName}</div>
            <div><strong>DNI:</strong> {workerProfile.personalData.dni}</div>
            <div><strong>Teléfono:</strong> {workerProfile.personalData.phone}</div>
            <div><strong>Email:</strong> {workerProfile.personalData.email}</div>
            <div><strong>Dirección:</strong> {workerProfile.personalData.address}</div>
            <div><strong>Ciudad:</strong> {workerProfile.personalData.city}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Profesional</h3>
          <div className="space-y-3 text-sm">
            <div><strong>Categoría:</strong> {workerProfile.professionalData.category}</div>
            <div><strong>Cuadrilla:</strong> {workerProfile.professionalData.crew}</div>
            <div><strong>Fecha de Inicio:</strong> {new Date(workerProfile.professionalData.startDate).toLocaleDateString('es-ES')}</div>
            <div><strong>PRL Vencimiento:</strong> {new Date(workerProfile.professionalData.prlExpiryDate).toLocaleDateString('es-ES')}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificaciones PRL</h3>
        <div className="flex flex-wrap gap-2">
          {workerProfile.professionalData.prlCertifications.map((cert, index) => (
            <span key={index} className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full flex items-center space-x-1">
              <Award className="h-3 w-3" />
              <span>{cert}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-corporate-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-corporate-gray-900">Panel Personal</h1>
                  <p className="text-sm text-gray-600">
                    {workerProfile.personalData.firstName} {workerProfile.personalData.lastName}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('es-ES')}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'summary', label: 'Resumen', icon: BarChart3 },
              { id: 'reports', label: 'Mis Partes', icon: FileText },
              { id: 'projects', label: 'Proyectos', icon: Building2 },
              { id: 'vacations', label: 'Vacaciones', icon: Calendar },
              { id: 'epis', label: 'Mis EPIs', icon: Package },
              { id: 'profile', label: 'Mi Perfil', icon: User }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-corporate-blue-500 text-corporate-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'summary' && renderSummaryTab()}
        {selectedTab === 'reports' && renderReportsTab()}
        {selectedTab === 'projects' && renderProjectsTab()}
        {selectedTab === 'vacations' && renderVacationsTab()}
        {selectedTab === 'epis' && renderEPIsTab()}
        {selectedTab === 'profile' && renderProfileTab()}
      </main>
    </div>
  );
};

export default WorkerPanelPage;