import React, { useState } from 'react';
import { 
  DollarSign, Plus, Search, Edit, Trash2, Eye, Calendar, TrendingUp,
  ArrowUpCircle, ArrowDownCircle, Filter, Download, FileText, CreditCard,
  Building2, User, AlertTriangle, CheckCircle
} from 'lucide-react';
import { CashMovement, LiquidityPosition, FinancialKPI } from '../../types/treasury';
import { movementCategories, paymentMethods } from '../../data/treasuryCategories';
import { exportToPDF, exportToExcel, printTable, formatDataForExport, getExportHeaders } from '../../utils/exportUtils';
import { handleCRUDOperation, showSuccessNotification, showErrorNotification } from '../../utils/modalUtils';
import { formatCurrency } from '../../utils/formatUtils';

const TreasuryModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01');
  const [selectedMovement, setSelectedMovement] = useState<CashMovement | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [movements] = useState<CashMovement[]>([
    {
      id: '1',
      date: '2024-01-31',
      type: 'income',
      category: movementCategories.find(c => c.id === 'certifications')!,
      projectId: '1',
      projectName: 'Autopista A-7 Valencia',
      description: 'Certificación enero - Movimiento de tierras',
      amount: 125000,
      paymentMethod: paymentMethods.find(p => p.id === 'bank_transfer')!,
      status: 'confirmed',
      reference: 'CERT-A7-001-2024',
      dueDate: '2024-02-29',
      createdBy: 'Ana Martínez',
      createdDate: '2024-01-31',
      lastModified: '2024-01-31',
      modifiedBy: 'Ana Martínez',
      tags: ['Certificación', 'Obra Civil'],
      attachments: []
    },
    {
      id: '2',
      date: '2024-01-30',
      type: 'expense',
      category: movementCategories.find(c => c.id === 'payroll')!,
      projectId: '1',
      projectName: 'Autopista A-7 Valencia',
      description: 'Nóminas enero - Equipo A-7',
      amount: 45000,
      paymentMethod: paymentMethods.find(p => p.id === 'bank_transfer')!,
      status: 'confirmed',
      reference: 'NOM-2024-01-A7',
      createdBy: 'Carlos Ruiz',
      createdDate: '2024-01-30',
      lastModified: '2024-01-30',
      modifiedBy: 'Carlos Ruiz',
      tags: ['Nóminas', 'Personal'],
      attachments: []
    },
    {
      id: '3',
      date: '2024-01-28',
      type: 'expense',
      category: movementCategories.find(c => c.id === 'materials')!,
      projectId: '2',
      projectName: 'Edificio Residencial Marina',
      description: 'Compra hormigón HA-25 - 350m³',
      amount: 28000,
      paymentMethod: paymentMethods.find(p => p.id === 'bank_transfer')!,
      status: 'pending',
      reference: 'FAC-HOR-2024-001',
      supplier: 'Hormigones del Mediterráneo',
      dueDate: '2024-02-27',
      createdBy: 'Pedro González',
      createdDate: '2024-01-28',
      lastModified: '2024-01-28',
      modifiedBy: 'Pedro González',
      tags: ['Materiales', 'Hormigón'],
      attachments: []
    },
    {
      id: '4',
      date: '2024-01-25',
      type: 'expense',
      category: movementCategories.find(c => c.id === 'machinery')!,
      projectId: '3',
      projectName: 'Polígono Industrial Norte',
      description: 'Alquiler excavadora CAT 320D - Enero',
      amount: 15000,
      paymentMethod: paymentMethods.find(p => p.id === 'bank_transfer')!,
      status: 'confirmed',
      reference: 'ALQ-MAQ-2024-001',
      supplier: 'Maquinaria Levante',
      createdBy: 'Laura Jiménez',
      createdDate: '2024-01-25',
      lastModified: '2024-01-25',
      modifiedBy: 'Laura Jiménez',
      tags: ['Maquinaria', 'Alquiler'],
      attachments: []
    }
  ]);

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || movement.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || movement.category.id === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || movement.status === selectedStatus;
    const matchesPeriod = movement.date.startsWith(selectedPeriod);
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus && matchesPeriod;
  });

  const totalIncome = filteredMovements
    .filter(m => m.type === 'income')
    .reduce((sum, m) => sum + m.amount, 0);

  const totalExpenses = filteredMovements
    .filter(m => m.type === 'expense')
    .reduce((sum, m) => sum + m.amount, 0);

  const netCashFlow = totalIncome - totalExpenses;

  const stats = [
    { label: 'Ingresos', value: `€${(totalIncome / 1000).toFixed(0)}K`, icon: ArrowUpCircle, color: 'text-green-600' },
    { label: 'Gastos', value: `€${(totalExpenses / 1000).toFixed(0)}K`, icon: ArrowDownCircle, color: 'text-red-600' },
    { label: 'Flujo Neto', value: `€${(netCashFlow / 1000).toFixed(0)}K`, icon: TrendingUp, color: netCashFlow >= 0 ? 'text-green-600' : 'text-red-600' },
    { label: 'Movimientos', value: filteredMovements.length.toString(), icon: DollarSign, color: 'text-blue-600' }
  ];

  const getTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendiente';
      case 'planned': return 'Planificado';
      default: return status;
    }
  };

  // Funciones de acción
  const handleView = async (movement: CashMovement) => {
    setSelectedMovement(movement);
    setShowViewModal(true);
    await handleCRUDOperation('read', 'Movimiento', movement, movement.id);
  };

  const handleEdit = (movement: CashMovement) => {
    console.log('Editando movimiento:', movement.id);
    showSuccessNotification('Función de edición activada');
  };

  const handleDelete = async (movement: CashMovement) => {
    const success = await handleCRUDOperation('delete', 'Movimiento', movement, movement.id);
    if (success) {
      console.log('Movimiento eliminado:', movement.id);
    }
  };

  const handleExportPDF = async () => {
    setIsLoading(true);
    try {
      const exportData = {
        title: `Movimientos de Tesorería - ${selectedPeriod}`,
        headers: getExportHeaders('treasury'),
        data: formatDataForExport(filteredMovements, 'treasury'),
        filename: `tesoreria_${selectedPeriod}`
      };
      
      const result = exportToPDF(exportData);
      if (result.success) {
        showSuccessNotification('PDF de tesorería generado correctamente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setIsLoading(true);
    try {
      const exportData = {
        title: `Movimientos de Tesorería - ${selectedPeriod}`,
        headers: getExportHeaders('treasury'),
        data: formatDataForExport(filteredMovements, 'treasury'),
        filename: `tesoreria_${selectedPeriod}`
      };
      
      const result = exportToExcel(exportData);
      if (result.success) {
        showSuccessNotification('Excel de tesorería generado correctamente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tesorería y Flujo de Caja</h2>
          <p className="text-gray-600">Control de ingresos, gastos y liquidez empresarial</p>
        </div>
        <div className="flex space-x-3">
          <button type="button" onClick={handleExportPDF}
            disabled={isLoading}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>{isLoading ? 'Generando...' : 'PDF'}</span>
          </button>
          <button type="button" onClick={handleExportExcel}
            disabled={isLoading}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Excel</span>
          </button>
          <button type="button" onClick={() => handleCRUDOperation('create', 'Movimiento')}
            className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Movimiento</span>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Descripción, referencia..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
              />
            </div>
          </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            >
              <option value="all">Todas</option>
              {movementCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="confirmed">Confirmado</option>
              <option value="pending">Pendiente</option>
              <option value="planned">Planificado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Movimientos de Tesorería - {selectedPeriod} ({filteredMovements.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Importe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método Pago
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
              {filteredMovements.map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(movement.date).toLocaleDateString('es-ES')}
                    </div>
                    {movement.dueDate && (
                      <div className="text-xs text-gray-500">
                        Vence: {new Date(movement.dueDate).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{movement.description}</div>
                    {movement.reference && (
                      <div className="text-sm text-gray-500">Ref: {movement.reference}</div>
                    )}
                    {movement.supplier && (
                      <div className="text-xs text-gray-400">Proveedor: {movement.supplier}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{movement.category.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{movement.category.name}</div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${movement.category.color}`}>
                          {movement.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {movement.projectName ? (
                      <div>
                        <div className="text-sm text-gray-900">{movement.projectName}</div>
                        <div className="text-xs text-gray-500">ID: {movement.projectId}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">General</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-bold ${getTypeColor(movement.type)}`}>
                      {movement.type === 'income' ? '+' : '-'}{formatCurrency(movement.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{movement.paymentMethod.name}</div>
                    {movement.paymentMethod.account && (
                      <div className="text-xs text-gray-500">
                        {movement.paymentMethod.account.slice(-4)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(movement.status)}`}>
                      {getStatusLabel(movement.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button type="button" onClick={() => handleView(movement)}
                        className="text-corporate-blue-600 hover:text-corporate-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleEdit(movement)}
                        className="text-green-600 hover:text-green-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-purple-600 hover:text-purple-900"
                        title="Documentos"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      {movement.status === 'pending' && (
                        <button 
                          className="text-orange-600 hover:text-orange-900"
                          title="Procesar pago"
                        >
                          <CreditCard className="h-4 w-4" />
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

      {/* Cash Flow Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Resumen de Flujo de Caja - {selectedPeriod}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <ArrowUpCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-green-600">€{totalIncome.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Ingresos</div>
          </div>
          <div className="text-center p-6 bg-red-50 rounded-lg">
            <ArrowDownCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
            <div className="text-2xl font-bold text-red-600">€{totalExpenses.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Gastos</div>
          </div>
          <div className={`text-center p-6 rounded-lg ${netCashFlow >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <TrendingUp className={`h-12 w-12 mx-auto mb-3 ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{netCashFlow.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Flujo Neto</div>
          </div>
        </div>
      </div>

      {/* View Movement Modal */}
      {showViewModal && selectedMovement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Detalle del Movimiento</h2>
                <button type="button" onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Fecha:</strong> {new Date(selectedMovement.date).toLocaleDateString('es-ES')}</div>
                    <div><strong>Descripción:</strong> {selectedMovement.description}</div>
                    <div><strong>Categoría:</strong> {selectedMovement.category.name}</div>
                    <div><strong>Tipo:</strong> {selectedMovement.type === 'income' ? 'Ingreso' : 'Gasto'}</div>
                    <div><strong>Importe:</strong> €{selectedMovement.amount.toLocaleString()}</div>
                    <div><strong>Estado:</strong> {getStatusLabel(selectedMovement.status)}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles Adicionales</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Proyecto:</strong> {selectedMovement.projectName || 'General'}</div>
                    <div><strong>Método Pago:</strong> {selectedMovement.paymentMethod.name}</div>
                    <div><strong>Referencia:</strong> {selectedMovement.reference || 'N/A'}</div>
                    <div><strong>Creado por:</strong> {selectedMovement.createdBy}</div>
                    <div><strong>Fecha Creación:</strong> {new Date(selectedMovement.createdDate).toLocaleDateString('es-ES')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreasuryModule;