import React from 'react';
import { FileText, Download, Calendar, TrendingUp, Users, DollarSign, Building2, BarChart3 } from 'lucide-react';

const Reports: React.FC = () => {
  const reportTypes = [
    {
      id: 1,
      title: 'Informe de Productividad Mensual',
      description: 'Análisis detallado del rendimiento de trabajadores y proyectos',
      icon: TrendingUp,
      color: 'bg-blue-500',
      lastGenerated: '2024-01-30',
      frequency: 'Mensual'
    },
    {
      id: 2,
      title: 'Reporte Financiero',
      description: 'Estado financiero de proyectos, ingresos y gastos',
      icon: DollarSign,
      color: 'bg-green-500',
      lastGenerated: '2024-01-28',
      frequency: 'Semanal'
    },
    {
      id: 3,
      title: 'Análisis de Proyectos',
      description: 'Progreso, presupuestos y cronogramas de proyectos activos',
      icon: Building2,
      color: 'bg-purple-500',
      lastGenerated: '2024-01-29',
      frequency: 'Quincenal'
    },
    {
      id: 4,
      title: 'Estadísticas de Personal',
      description: 'Asistencia, rendimiento y distribución de trabajadores',
      icon: Users,
      color: 'bg-orange-500',
      lastGenerated: '2024-01-31',
      frequency: 'Semanal'
    },
    {
      id: 5,
      title: 'Informe de Seguridad',
      description: 'Incidentes, formación PRL y cumplimiento normativo',
      icon: FileText,
      color: 'bg-red-500',
      lastGenerated: '2024-01-25',
      frequency: 'Mensual'
    },
    {
      id: 6,
      title: 'Análisis de Maquinaria',
      description: 'Uso, mantenimiento y eficiencia del parque de maquinaria',
      icon: BarChart3,
      color: 'bg-yellow-500',
      lastGenerated: '2024-01-27',
      frequency: 'Mensual'
    }
  ];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Informes y Reportes</h2>
          <p className="text-gray-600">Genera y descarga informes detallados de la empresa</p>
        </div>
        <div className="flex space-x-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Programar Informe</span>
          </button>
          <button className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Informe Personalizado</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Informes Generados</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Este Mes</p>
              <p className="text-2xl font-bold text-green-600">24</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Programados</p>
              <p className="text-2xl font-bold text-yellow-600">8</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Descargas</p>
              <p className="text-2xl font-bold text-purple-600">342</p>
            </div>
            <Download className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`${report.color} p-3 rounded-lg mr-4`}>
                  <report.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-500">{report.frequency}</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{report.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Último generado:</span>
                <span className="font-medium">{report.lastGenerated}</span>
              </div>
              
              <div className="flex space-x-2">
                <button className="flex-1 bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>Generar</span>
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Informes Recientes</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              { name: 'Productividad Enero 2024', type: 'PDF', size: '2.4 MB', date: '2024-01-30', status: 'Completado' },
              { name: 'Reporte Financiero S4', type: 'Excel', size: '1.8 MB', date: '2024-01-28', status: 'Completado' },
              { name: 'Análisis Proyectos Q1', type: 'PDF', size: '3.2 MB', date: '2024-01-25', status: 'Procesando' },
              { name: 'Estadísticas Personal', type: 'PDF', size: '1.5 MB', date: '2024-01-22', status: 'Completado' }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-corporate-blue-100 p-2 rounded">
                    <FileText className="h-5 w-5 text-corporate-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{report.name}</h4>
                    <p className="text-sm text-gray-500">{report.type} • {report.size} • {report.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    report.status === 'Completado' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                  {report.status === 'Completado' && (
                    <button className="text-corporate-blue-600 hover:text-corporate-blue-700">
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;