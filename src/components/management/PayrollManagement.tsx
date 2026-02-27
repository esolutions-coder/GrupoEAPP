import React, { useState } from 'react';
import { 
  DollarSign, Plus, Search, Calendar, Download, FileText, 
  CheckCircle, Clock, AlertTriangle, User, Building2, 
  Calculator, Euro, TrendingUp, Edit, Eye, Send, Filter
} from 'lucide-react';
import { Payroll } from '../../types/construction';

interface PayrollManagementProps {
  selectedProject?: any;
}

const PayrollManagement: React.FC<PayrollManagementProps> = ({ selectedProject: propSelectedProject }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01');
  const [internalSelectedProject, setInternalSelectedProject] = useState(propSelectedProject?.id || 'all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [showCalculationModal, setShowCalculationModal] = useState(false);

  const [payrolls] = useState<Payroll[]>([
    {
      id: '1',
      workerId: '1',
      workerName: 'Juan García Martínez',
      workerCategory: 'Oficial',
      period: '2024-01',
      projectId: '1',
      projectName: 'Autopista A-7 Valencia',
      regularHours: 160,
      overtimeHours: 8,
      nightHours: 0,
      holidayHours: 0,
      bonusHours: 0,
      absences: [],
      permits: [],
      hourlyRate: 18.50,
      overtimeRate: 27.75,
      nightRate: 22.20,
      holidayRate: 37.00,
      grossSalary: 3182,
      deductions: [
        {
          id: '1',
          type: 'irpf',
          description: 'IRPF (15%)',
          amount: 477.30,
          percentage: 15,
          reference: 'IRPF-2024-01',
          justification: 'Retención fiscal obligatoria'
        },
        {
          id: '2',
          type: 'social_security',
          description: 'Seguridad Social (6.35%)',
          amount: 202.06,
          percentage: 6.35,
          reference: 'SS-2024-01',
          justification: 'Cotización trabajador'
        }
      ],
      additions: [
        {
          id: '1',
          type: 'overtime',
          description: 'Horas extra',
          amount: 222,
          reference: 'HE-2024-01',
          justification: '8 horas extra a tarifa 1.5x'
        }
      ],
      netSalary: 2502.64,
      status: 'calculated',
      calculatedDate: '2024-01-31',
      workReportIds: ['1', '2', '3'],
      createdBy: 'Ana Martínez',
      createdDate: '2024-01-31',
      lastModified: '2024-01-31',
      modifiedBy: 'Ana Martínez',
      version: 1
    },
    {
      id: '2',
      workerId: '2',
      workerName: 'María López Fernández',
      workerCategory: 'Maquinista',
      period: '2024-01',
      projectId: '2',
      projectName: 'Edificio Residencial Marina',
      regularHours: 168,
      overtimeHours: 12,
      nightHours: 0,
      holidayHours: 0,
      bonusHours: 0,
      absences: [],
      permits: [],
      hourlyRate: 22.00,
      overtimeRate: 33.00,
      nightRate: 26.40,
      holidayRate: 44.00,
      grossSalary: 4092,
      deductions: [
        {
          id: '1',
          type: 'irpf',
          description: 'IRPF (18%)',
          amount: 736.56,
          percentage: 18,
          reference: 'IRPF-2024-01',
          justification: 'Retención fiscal obligatoria'
        },
        {
          id: '2',
          type: 'social_security',
          description: 'Seguridad Social (6.35%)',
          amount: 259.84,
          percentage: 6.35,
          reference: 'SS-2024-01',
          justification: 'Cotización trabajador'
        }
      ],
      additions: [
        {
          id: '1',
          type: 'overtime',
          description: 'Horas extra',
          amount: 396,
          reference: 'HE-2024-01',
          justification: '12 horas extra a tarifa 1.5x'
        }
      ],
      netSalary: 3095.60,
      status: 'approved',
      calculatedDate: '2024-01-31',
      approvedBy: 'Carlos Ruiz',
      approvedDate: '2024-02-01',
      workReportIds: ['4', '5', '6'],
      createdBy: 'Ana Martínez',
      createdDate: '2024-01-31',
      lastModified: '2024-02-01',
      modifiedBy: 'Carlos Ruiz',
      version: 2
    }
  ]);

  const filteredPayrolls = payrolls.filter(payroll => {
    const matchesPeriod = payroll.period === selectedPeriod;
    const matchesProject = internalSelectedProject === 'all' || payroll.projectId === internalSelectedProject;
    const matchesStatus = selectedStatus === 'all' || payroll.status === selectedStatus;
    const matchesSearch = payroll.workerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesPeriod && matchesProject && matchesStatus && matchesSearch;
  });

  const stats = [
    { 
      label: 'Liquidaciones Totales', 
      value: filteredPayrolls.length.toString(), 
      icon: Calculator, 
      color: 'text-blue-600' 
    },
    { 
      label: 'Calculadas', 
      value: filteredPayrolls.filter(p => p.status === 'calculated').length.toString(), 
      icon: CheckCircle, 
      color: 'text-yellow-600' 
    },
    { 
      label: 'Aprobadas', 
      value: filteredPayrolls.filter(p => p.status === 'approved').length.toString(), 
      icon: CheckCircle, 
      color: 'text-green-600' 
    },
    { 
      label: 'Total Neto', 
      value: `€${filteredPayrolls.reduce((sum, p) => sum + p.netSalary, 0).toLocaleString()}`, 
      icon: Euro, 
      color: 'text-purple-600' 
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'calculated': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'calculated': return 'Calculada';
      case 'approved': return 'Aprobada';
      case 'paid': return 'Pagada';
      default: return status;
    }
  };

  const handleExportPayrolls = () => {
    console.log('Exportando liquidaciones del período:', selectedPeriod);
    // Aquí iría la lógica de exportación
  };

  const handleCalculatePayroll = (payrollId: string) => {
    console.log('Calculando liquidación:', payrollId);
    // Aquí iría la lógica de cálculo
  };

  const handleApprovePayroll = (payrollId: string) => {
    console.log('Aprobando liquidación:', payrollId);
    // Aquí iría la lógica de aprobación
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Liquidaciones</h2>
          <p className="text-gray-600">Cálculo y gestión de nóminas basado en partes de trabajo</p>
        </div>
        <div className="flex space-x-3">
          <button type="button" onClick={handleExportPayrolls}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Período</span>
          </button>
          <button type="button" onClick={() => setShowCalculationModal(true)}
            className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Calculator className="h-4 w-4" />
            <span>Calcular Nóminas</span>
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proyecto</label>
            <select
              value={internalSelectedProject}
              onChange={(e) => setInternalSelectedProject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
              disabled={!!propSelectedProject}
            >
              {propSelectedProject ? (
                <option value={propSelectedProject.id}>{propSelectedProject.name}</option>
              ) : (
                <>
                  <option value="all">Todos los proyectos</option>
                  <option value="1">Autopista A-7 Valencia</option>
                  <option value="2">Edificio Residencial Marina</option>
                  <option value="3">Polígono Industrial Norte</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="calculated">Calculada</option>
              <option value="approved">Aprobada</option>
              <option value="paid">Pagada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar operario..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payrolls Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Liquidaciones - {selectedPeriod} ({filteredPayrolls.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Horas</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Salario Bruto</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Deducciones</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Salario Neto</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayrolls.map((payroll) => (
                <tr key={payroll.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-corporate-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-corporate-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{payroll.workerName}</div>
                        <div className="text-sm text-gray-500">{payroll.workerCategory}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payroll.projectName}</div>
                    <div className="text-sm text-gray-500">{payroll.period}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {payroll.regularHours + payroll.overtimeHours}h
                    </div>
                    <div className="text-sm text-gray-500">
                      {payroll.regularHours}h + {payroll.overtimeHours}h extra
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">
                      €{payroll.grossSalary.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-red-600">
                      -€{payroll.deductions.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-green-600">
                      €{payroll.netSalary.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payroll.status)}`}>
                      {getStatusLabel(payroll.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button type="button" onClick={() => setSelectedPayroll(payroll)}
                        className="text-corporate-blue-600 hover:text-corporate-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleCalculatePayroll(payroll.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Recalcular"
                      >
                        <Calculator className="h-4 w-4" />
                      </button>
                      {payroll.status === 'calculated' && (
                        <button type="button" onClick={() => handleApprovePayroll(payroll.id)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Aprobar"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="text-red-600 hover:text-red-900"
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

      {/* Summary by Project */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumen por Proyecto - {selectedPeriod}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Autopista A-7 Valencia', 'Edificio Residencial Marina', 'Polígono Industrial Norte'].map((project, index) => {
            const projectPayrolls = filteredPayrolls.filter(p => p.projectName === project);
            const totalCost = projectPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
            const totalHours = projectPayrolls.reduce((sum, p) => sum + p.regularHours + p.overtimeHours, 0);
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">{project}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Operarios:</span>
                    <span className="font-medium">{projectPayrolls.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total horas:</span>
                    <span className="font-medium">{totalHours}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coste total:</span>
                    <span className="font-medium text-green-600">€{totalCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payroll Details Modal */}
      {selectedPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Liquidación - {selectedPayroll.workerName}
                </h2>
                <button type="button" onClick={() => setSelectedPayroll(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Información General */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Período:</strong> {selectedPayroll.period}</div>
                    <div><strong>Proyecto:</strong> {selectedPayroll.projectName}</div>
                    <div><strong>Categoría:</strong> {selectedPayroll.workerCategory}</div>
                    <div><strong>Estado:</strong> {getStatusLabel(selectedPayroll.status)}</div>
                    <div><strong>Calculado:</strong> {selectedPayroll.calculatedDate}</div>
                    {selectedPayroll.approvedDate && (
                      <div><strong>Aprobado:</strong> {selectedPayroll.approvedDate}</div>
                    )}
                  </div>
                </div>

                {/* Resumen de Horas */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Horas</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Horas regulares:</span>
                      <span className="font-medium">{selectedPayroll.regularHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Horas extra:</span>
                      <span className="font-medium text-yellow-600">{selectedPayroll.overtimeHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Horas nocturnas:</span>
                      <span className="font-medium">{selectedPayroll.nightHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Horas festivas:</span>
                      <span className="font-medium">{selectedPayroll.holidayHours}h</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Total horas:</span>
                      <span className="font-bold">{selectedPayroll.regularHours + selectedPayroll.overtimeHours + selectedPayroll.nightHours + selectedPayroll.holidayHours}h</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cálculo Salarial */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cálculo Salarial</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Salario Base */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Salario Base</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tarifa regular:</span>
                        <span>€{selectedPayroll.hourlyRate}/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tarifa extra:</span>
                        <span>€{selectedPayroll.overtimeRate}/h</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Salario bruto:</span>
                        <span className="font-bold text-blue-600">€{selectedPayroll.grossSalary.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Deducciones */}
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Deducciones</h4>
                    <div className="space-y-2 text-sm">
                      {selectedPayroll.deductions.map((deduction) => (
                        <div key={deduction.id} className="flex justify-between">
                          <span>{deduction.description}:</span>
                          <span className="text-red-600">-€{deduction.amount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Total deducciones:</span>
                        <span className="font-bold text-red-600">
                          -€{selectedPayroll.deductions.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Salario Neto */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Resultado Final</h4>
                    <div className="space-y-2 text-sm">
                      {selectedPayroll.additions.map((addition) => (
                        <div key={addition.id} className="flex justify-between">
                          <span>{addition.description}:</span>
                          <span className="text-green-600">+€{addition.amount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Salario neto:</span>
                        <span className="font-bold text-green-600 text-lg">€{selectedPayroll.netSalary.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Partes de Trabajo Vinculados */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Partes de Trabajo Vinculados</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Esta liquidación está basada en {selectedPayroll.workReportIds.length} partes de trabajo del período {selectedPayroll.period}.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPayroll.workReportIds.map((reportId, index) => (
                      <span key={reportId} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        Parte #{reportId}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculation Modal */}
      {showCalculationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Calcular Nóminas</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período a Calcular
                  </label>
                  <input
                    type="month"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proyecto (opcional)
                  </label>
                  <select
                    value={internalSelectedProject}
                    onChange={(e) => setInternalSelectedProject(e.target.value)}
                    disabled={!!propSelectedProject}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                  >
                    {propSelectedProject ? (
                      <option value={propSelectedProject.id}>{propSelectedProject.name}</option>
                    ) : (
                      <>
                        <option value="all">Todos los proyectos</option>
                        <option value="1">Autopista A-7 Valencia</option>
                        <option value="2">Edificio Residencial Marina</option>
                        <option value="3">Polígono Industrial Norte</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Información del Cálculo</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Se calcularán las nóminas basadas en los partes de trabajo aprobados</li>
                    <li>• Se aplicarán las tarifas por categoría y tipo de hora</li>
                    <li>• Se incluirán deducciones fiscales y de seguridad social</li>
                    <li>• Los cálculos quedarán pendientes de aprobación</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button type="button" onClick={() => setShowCalculationModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button type="button" onClick={() => {
                  console.log('Calculando nóminas para período:', selectedPeriod, 'proyecto:', internalSelectedProject);
                  setShowCalculationModal(false);
                }}
                className="px-6 py-2 bg-corporate-blue-600 text-white rounded-lg hover:bg-corporate-blue-700 flex items-center space-x-2"
              >
                <Calculator className="h-4 w-4" />
                <span>Calcular Nóminas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollManagement;