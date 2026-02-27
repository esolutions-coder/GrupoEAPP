import React, { useState } from 'react';
import { BarChart3, Plus, Search, Calendar, TrendingUp, DollarSign, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Project } from '../../types/construction';

interface MeasurementsProps {
  selectedProject?: Project | null;
}

const Measurements: React.FC<MeasurementsProps> = ({ selectedProject: propSelectedProject }) => {
  const [internalSelectedProject, setInternalSelectedProject] = useState(propSelectedProject?.id || 'all');
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01');

  const measurements = [
    {
      id: 1,
      project: 'Autopista A-7 Valencia',
      period: '2024-01',
      chapter: 'Movimiento de Tierras',
      unit: 'Excavación en terreno natural',
      quantity: 15420,
      unitMeasure: 'm³',
      unitPrice: 8.50,
      totalAmount: 131070,
      previousQuantity: 12850,
      accumulatedQuantity: 28270,
      percentageComplete: 75,
      status: 'Certificado',
      certificationDate: '2024-01-31',
      approvedBy: 'Dirección Facultativa'
    },
    {
      id: 2,
      project: 'Autopista A-7 Valencia',
      period: '2024-01',
      chapter: 'Firmes y Pavimentos',
      unit: 'Mezcla bituminosa AC-22 surf',
      quantity: 2850,
      unitMeasure: 't',
      unitPrice: 65.00,
      totalAmount: 185250,
      previousQuantity: 1950,
      accumulatedQuantity: 4800,
      percentageComplete: 60,
      status: 'Pendiente',
      certificationDate: null,
      approvedBy: null
    },
    {
      id: 3,
      project: 'Edificio Residencial Marina',
      period: '2024-01',
      chapter: 'Estructura',
      unit: 'Hormigón HA-25 en cimentación',
      quantity: 450,
      unitMeasure: 'm³',
      unitPrice: 95.00,
      totalAmount: 42750,
      previousQuantity: 320,
      accumulatedQuantity: 770,
      percentageComplete: 85,
      status: 'Certificado',
      certificationDate: '2024-01-28',
      approvedBy: 'Dirección de Obra'
    },
    {
      id: 4,
      project: 'Edificio Residencial Marina',
      period: '2024-01',
      chapter: 'Albañilería',
      unit: 'Fábrica de ladrillo perforado',
      quantity: 1250,
      unitMeasure: 'm²',
      unitPrice: 28.50,
      totalAmount: 35625,
      previousQuantity: 850,
      accumulatedQuantity: 2100,
      percentageComplete: 70,
      status: 'Revisión',
      certificationDate: null,
      approvedBy: null
    },
    {
      id: 5,
      project: 'Polígono Industrial Norte',
      period: '2024-01',
      chapter: 'Urbanización',
      unit: 'Pavimento de hormigón HM-20',
      quantity: 3200,
      unitMeasure: 'm²',
      unitPrice: 22.00,
      totalAmount: 70400,
      previousQuantity: 2100,
      accumulatedQuantity: 5300,
      percentageComplete: 45,
      status: 'Pendiente',
      certificationDate: null,
      approvedBy: null
    }
  ];

  const projects = [
    { id: 'all', name: 'Todos los Proyectos' },
    { id: 'Autopista A-7 Valencia', name: 'Autopista A-7 Valencia' },
    { id: 'Edificio Residencial Marina', name: 'Edificio Residencial Marina' },
    { id: 'Polígono Industrial Norte', name: 'Polígono Industrial Norte' }
  ];

  const filteredMeasurements = internalSelectedProject === 'all' 
    ? measurements.filter(m => m.period === selectedPeriod)
    : measurements.filter(m => m.project === internalSelectedProject && m.period === selectedPeriod);

  const totalAmount = filteredMeasurements.reduce((sum, m) => sum + m.totalAmount, 0);
  const certifiedAmount = filteredMeasurements
    .filter(m => m.status === 'Certificado')
    .reduce((sum, m) => sum + m.totalAmount, 0);
  const pendingAmount = filteredMeasurements
    .filter(m => m.status === 'Pendiente')
    .reduce((sum, m) => sum + m.totalAmount, 0);

  const stats = [
    { label: 'Importe Total', value: `€${totalAmount.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600' },
    { label: 'Certificado', value: `€${certifiedAmount.toLocaleString()}`, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Pendiente', value: `€${pendingAmount.toLocaleString()}`, icon: Clock, color: 'text-yellow-600' },
    { label: 'Mediciones', value: filteredMeasurements.length.toString(), icon: BarChart3, color: 'text-purple-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Certificado': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Revisión': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mediciones y Certificaciones</h2>
          <p className="text-gray-600">Control de mediciones mensuales y certificaciones de obra</p>
        </div>
        <div className="flex space-x-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Generar Certificación</span>
          </button>
          <button className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nueva Medición</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Proyecto</label>
            <select
              value={internalSelectedProject}
              onChange={(e) => setInternalSelectedProject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
              disabled={!!propSelectedProject}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            />
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

      {/* Measurements Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Mediciones - {selectedPeriod} 
              {internalSelectedProject !== 'all' && propSelectedProject && ` - ${propSelectedProject.name}`}
            </h3>
            <div className="text-sm text-gray-500">
              Total: €{totalAmount.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proyecto / Capítulo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unidad de Obra
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Unit.
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Importe
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % Avance
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
              {filteredMeasurements.map((measurement) => (
                <tr key={measurement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{measurement.project}</div>
                      <div className="text-sm text-gray-500">{measurement.chapter}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{measurement.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {measurement.quantity.toLocaleString()} {measurement.unitMeasure}
                    </div>
                    <div className="text-xs text-gray-500">
                      Acum: {measurement.accumulatedQuantity.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    €{measurement.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      €{measurement.totalAmount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-corporate-blue-600 h-2 rounded-full"
                          style={{ width: `${measurement.percentageComplete}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{measurement.percentageComplete}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(measurement.status)}`}>
                      {measurement.status}
                    </span>
                    {measurement.certificationDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        {measurement.certificationDate}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      <button className="text-corporate-blue-600 hover:text-corporate-blue-900">
                        <FileText className="h-4 w-4" />
                      </button>
                      {measurement.status === 'Pendiente' && (
                        <button className="text-green-600 hover:text-green-900">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {measurement.status === 'Revisión' && (
                        <button className="text-yellow-600 hover:text-yellow-900">
                          <AlertTriangle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary by Project */}
      {internalSelectedProject === 'all' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen por Proyecto - {selectedPeriod}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Autopista A-7 Valencia', 'Edificio Residencial Marina', 'Polígono Industrial Norte'].map((project, index) => {
              const projectMeasurements = measurements.filter(m => m.project === project && m.period === selectedPeriod);
              const projectTotal = projectMeasurements.reduce((sum, m) => sum + m.totalAmount, 0);
              const projectCertified = projectMeasurements
                .filter(m => m.status === 'Certificado')
                .reduce((sum, m) => sum + m.totalAmount, 0);
              const certificationRate = projectTotal > 0 ? (projectCertified / projectTotal) * 100 : 0;

              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{project}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total medido:</span>
                      <span className="font-medium">€{projectTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Certificado:</span>
                      <span className="font-medium text-green-600">€{projectCertified.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">% Certificación:</span>
                      <span className="font-medium">{certificationRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${certificationRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Measurements;