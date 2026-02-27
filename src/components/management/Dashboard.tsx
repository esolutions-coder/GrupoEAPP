import React from 'react';
import { 
  Users, 
  Building2, 
  Truck, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  BarChart3,
  Calendar,
  FileText,
  Shield,
  Briefcase
} from 'lucide-react';

interface DashboardProps {
  setCurrentModule: (module: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentModule }) => {
  const stats = [
    {
      title: 'Trabajadores Activos',
      value: '247',
      change: '+12',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Proyectos en Curso',
      value: '18',
      change: '+3',
      changeType: 'positive',
      icon: Building2,
      color: 'bg-green-500'
    },
    {
      title: 'Maquinaria Operativa',
      value: '45',
      change: '-2',
      changeType: 'negative',
      icon: Truck,
      color: 'bg-orange-500'
    },
    {
      title: 'Ingresos del Mes',
      value: '€2.4M',
      change: '+8.2%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-purple-500'
    }
  ];

  const recentProjects = [
    {
      name: 'Autopista A-7 Valencia',
      status: 'En progreso',
      progress: 75,
      deadline: '2024-06-15',
      team: 45
    },
    {
      name: 'Edificio Residencial Marina',
      status: 'En progreso',
      progress: 60,
      deadline: '2024-08-20',
      team: 32
    },
    {
      name: 'Polígono Industrial Norte',
      status: 'Planificación',
      progress: 25,
      deadline: '2024-09-10',
      team: 28
    }
  ];

  const alerts = [
    {
      type: 'warning',
      message: 'Revisión de seguridad pendiente en Proyecto Marina',
      time: 'Hace 2 horas'
    },
    {
      type: 'info',
      message: 'Nueva certificación PRL disponible para el equipo',
      time: 'Hace 4 horas'
    },
    {
      type: 'success',
      message: 'Proyecto A-7 superó el 75% de avance',
      time: 'Hace 6 horas'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-corporate-blue-600 to-corporate-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">¡Bienvenido al Sistema de Gestión!</h2>
        <p className="text-corporate-blue-100">
          Gestiona todos los aspectos de Grupo EA desde un solo lugar. 
          Aquí tienes un resumen de la actividad actual.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Proyectos Recientes</h3>
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentProjects.map((project, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'En progreso' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progreso</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-corporate-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{project.team} trabajadores</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(project.deadline).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Alertas y Notificaciones</h3>
              <AlertTriangle className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className={`p-1 rounded-full ${
                    alert.type === 'warning' ? 'bg-yellow-100' :
                    alert.type === 'info' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                    {alert.type === 'info' && <FileText className="h-4 w-4 text-blue-600" />}
                    {alert.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button type="button" onClick={() => setCurrentModule('workers')}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-corporate-blue-300 hover:bg-corporate-blue-50 transition-colors"
          >
            <Users className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Trabajadores</span>
          </button>
          <button type="button" onClick={() => setCurrentModule('crm')}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-corporate-blue-300 hover:bg-corporate-blue-50 transition-colors"
          >
            <Building2 className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">CRM Clientes</span>
          </button>
          <button type="button" onClick={() => setCurrentModule('machinery')}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-corporate-blue-300 hover:bg-corporate-blue-50 transition-colors"
          >
            <Truck className="h-8 w-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Maquinaria</span>
          </button>
          <button type="button" onClick={() => setCurrentModule('reports')}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-corporate-blue-300 hover:bg-corporate-blue-50 transition-colors"
          >
            <FileText className="h-8 w-8 text-red-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Informes</span>
          </button>
          <button type="button" onClick={() => setCurrentModule('safety')}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-corporate-blue-300 hover:bg-corporate-blue-50 transition-colors"
          >
            <Shield className="h-8 w-8 text-red-500 mb-2" />
            <span className="text-sm font-medium text-gray-700">Seguridad</span>
          </button>
          <button type="button" onClick={() => setCurrentModule('project-gallery')}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-corporate-blue-300 hover:bg-corporate-blue-50 transition-colors"
          >
            <Building2 className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Galería Proyectos</span>
          </button>
          <button type="button" onClick={() => setCurrentModule('job-manager')}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-corporate-blue-300 hover:bg-corporate-blue-50 transition-colors"
          >
            <Briefcase className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Gestión Ofertas</span>
          </button>
          <button type="button" onClick={() => setCurrentModule('treasury')}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-corporate-blue-300 hover:bg-corporate-blue-50 transition-colors"
          >
            <DollarSign className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Tesorería</span>
          </button>
          <button type="button" onClick={() => setCurrentModule('cost-control')}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-corporate-blue-300 hover:bg-corporate-blue-50 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-red-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Control Costes</span>
          </button>
          <button type="button" onClick={() => setCurrentModule('crews')}
            className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-corporate-blue-300 hover:bg-corporate-blue-50 transition-colors"
          >
            <Users className="h-8 w-8 text-teal-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Cuadrillas</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;