import React, { useState } from 'react';
import { 
  BarChart3, Plus, Search, Calendar, FileText, Download, TrendingUp,
  DollarSign, Users, Building2, Filter, Eye, Settings
} from 'lucide-react';
import { Report, ReportParameters } from '../../types/construction';

const ReportsManagement: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [reportType, setReportType] = useState('budget_vs_actual');

  const [reports] = useState<Report[]>([
    {
      id: '1',
      type: 'budget_vs_actual',
      title: 'Presupuesto vs Costes Reales - Enero 2024',
      parameters: {
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        projectIds: ['1', '2'],
        filters: { includeIndirectCosts: true }
      },
      data: {
        budgetedAmount: 450000,
        actualAmount: 425000,
        variance: -25000,
        variancePercentage: -5.6,
        projects: [
          { name: 'Autopista A-7', budgeted: 300000, actual: 285000, variance: -15000 },
          { name: 'Edificio Marina', budgeted: 150000, actual: 140000, variance: -10000 }
        ]
      },
      generatedDate: '2024-02-01',
      generatedBy: 'Ana Martínez',
      format: 'pdf'
    },
    {
      id: '2',
      type: 'profitability',
      title: 'Análisis de Rentabilidad por Proyecto',
      parameters: {
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        projectIds: ['1', '2', '3'],
        filters: { minProfitability: 10 }
      },
      data: {
        averageProfitability: 18.5,
        totalRevenue: 2400000,
        totalCosts: 1956000,
        totalProfit: 444000,
        projects: [
          { name: 'Autopista A-7', profitability: 15.0, revenue: 1200000, profit: 180000 },
          { name: 'Edificio Marina', profitability: 22.0, revenue: 800000, profit: 176000 }
        ]
      },
      generatedDate: '2024-02-01',
      generatedBy: 'Carlos Ruiz',
      format: 'excel'
    }
  ]);

  const reportTypes = [
    { 
      id: 'budget_vs_actual', 
      name: 'Presupuesto vs Costes Reales',
      description: 'Comparativa entre presupuesto inicial y costes reales ejecutados',
      icon: BarChart3,
      color: 'text-blue-600'
    },
    { 
      id: 'profitability', 
      name: 'Análisis de Rentabilidad',
      description: 'Rentabilidad por proyecto y análisis de márgenes',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    { 
      id: 'worker_performance', 
      name: 'Rendimiento de Trabajadores',
      description: 'Productividad y rendimiento del personal por categorías',
      icon: Users,
      color: 'text-purple-600'
    },
    { 
      id: 'project_status', 
      name: 'Estado de Proyectos',
      description: 'Avance, cronograma y estado actual de todos los proyectos',
      icon: Building2,
      color: 'text-orange-600'
    },
    { 
      id: 'financial', 
      name: 'Informe Financiero',
      description: 'Estado financiero general, ingresos, gastos y flujo de caja',
      icon: DollarSign,
      color: 'text-red-600'
    }
  ];

  const stats = [
    { label: 'Informes Generados', value: '156', icon: FileText, color: 'text-blue-600' },
    { label: 'Este Mes', value: '24', icon: Calendar, color: 'text-green-600' },
    { label: 'Programados', value: '8', icon: Settings, color: 'text-yellow-600' },
    { label: 'Descargas', value: '342', icon: Download, color: 'text-purple-600' }
  ];

  const getReportTypeInfo = (type: string) => {
    return reportTypes.find(rt => rt.id === type) || reportTypes[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Informes y Análisis</h2>
          <p className="text-gray-600">Generación de informes avanzados con KPIs y análisis</p>
        </div>
        <div className="flex space-x-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Programar Informe</span>
          </button>
          <button type="button" onClick={() => setIsCreatingReport(true)}
            className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Informe</span>
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

      {/* Report Types */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Tipos de Informes Disponibles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((type) => (
            <div key={type.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => {
                   setReportType(type.id);
                   setIsCreatingReport(true);
                 }}>
              <div className="flex items-center mb-4">
                <div className="bg-gray-100 p-3 rounded-lg mr-4">
                  <type.icon className={`h-6 w-6 ${type.color}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{type.name}</h4>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{type.description}</p>
              <button className="w-full bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Generar Informe
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Informes Recientes</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {reports.map((report) => {
              const typeInfo = getReportTypeInfo(report.type);
              return (
                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white p-2 rounded">
                      <typeInfo.icon className={`h-5 w-5 ${typeInfo.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{report.title}</h4>
                      <p className="text-sm text-gray-500">
                        {report.format.toUpperCase()} • {report.generatedDate} • Por {report.generatedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button type="button" onClick={() => setSelectedReport(report)}
                      className="text-corporate-blue-600 hover:text-corporate-blue-700"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-700"
                      title="Descargar"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
                <button type="button" onClick={() => setSelectedReport(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {selectedReport.type === 'budget_vs_actual' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        €{selectedReport.data.budgetedAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Presupuestado</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        €{selectedReport.data.actualAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Real</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {selectedReport.data.variancePercentage}%
                      </div>
                      <div className="text-sm text-gray-600">Desviación</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Desglose por Proyecto</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Presupuestado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Real</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Desviación</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedReport.data.projects.map((project: any, index: number) => (
                            <tr key={index}>
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{project.name}</td>
                              <td className="px-6 py-4 text-sm text-right text-gray-900">
                                €{project.budgeted.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-right text-gray-900">
                                €{project.actual.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-right">
                                <span className={`font-medium ${
                                  project.variance < 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  €{project.variance.toLocaleString()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {selectedReport.type === 'profitability' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedReport.data.averageProfitability}%
                      </div>
                      <div className="text-sm text-gray-600">Rentabilidad Media</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        €{(selectedReport.data.totalRevenue / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-gray-600">Ingresos Totales</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        €{(selectedReport.data.totalCosts / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-gray-600">Costes Totales</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        €{(selectedReport.data.totalProfit / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-sm text-gray-600">Beneficio Total</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Rentabilidad por Proyecto</h3>
                    <div className="space-y-4">
                      {selectedReport.data.projects.map((project: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{project.name}</h4>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                              project.profitability >= 20 ? 'bg-green-100 text-green-800' :
                              project.profitability >= 15 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {project.profitability}% rentabilidad
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Ingresos:</span>
                              <div className="font-semibold">€{project.revenue.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Beneficio:</span>
                              <div className="font-semibold text-green-600">€{project.profit.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Margen:</span>
                              <div className="font-semibold">{((project.profit / project.revenue) * 100).toFixed(1)}%</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {isCreatingReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Generar Nuevo Informe</h2>
                <button type="button" onClick={() => setIsCreatingReport(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Tipo de Informe */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Informe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportTypes.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => setReportType(type.id)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                          reportType === type.id 
                            ? 'border-corporate-blue-500 bg-corporate-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <type.icon className={`h-5 w-5 ${type.color} mr-2`} />
                          <h4 className="font-medium text-gray-900">{type.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Parámetros */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Parámetros del Informe</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
                      <input
                        type="date"
                        defaultValue="2024-01-01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
                      <input
                        type="date"
                        defaultValue="2024-01-31"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Proyectos</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500">
                        <option value="all">Todos los proyectos</option>
                        <option value="1">Autopista A-7 Valencia</option>
                        <option value="2">Edificio Residencial Marina</option>
                        <option value="3">Polígono Industrial Norte</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Formato</label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500">
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filtros Avanzados */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros Avanzados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="includeIndirect" className="rounded" />
                      <label htmlFor="includeIndirect" className="text-sm text-gray-700">
                        Incluir costes indirectos
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="includeGraphs" className="rounded" />
                      <label htmlFor="includeGraphs" className="text-sm text-gray-700">
                        Incluir gráficos
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="detailedBreakdown" className="rounded" />
                      <label htmlFor="detailedBreakdown" className="text-sm text-gray-700">
                        Desglose detallado
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="includeKPIs" className="rounded" />
                      <label htmlFor="includeKPIs" className="text-sm text-gray-700">
                        Incluir KPIs
                      </label>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex space-x-4 pt-6 border-t">
                  <button type="button" onClick={() => setIsCreatingReport(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Vista Previa
                  </button>
                  <button className="px-6 py-3 bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white rounded-lg font-semibold">
                    Generar Informe
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

export default ReportsManagement;