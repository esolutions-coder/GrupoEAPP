import React, { useState } from 'react';
import { 
  Shield, Plus, Search, Edit, Trash2, Eye, Calendar, AlertTriangle, 
  CheckCircle, User, Package, Download, FileText, Clock, Award
} from 'lucide-react';
import { EPI, EPIAlert } from '../../types/epi';
import { epiTypes } from '../../data/epiTypes';
import { exportToPDF, exportToExcel, printTable, formatDataForExport, getExportHeaders } from '../../utils/exportUtils';
import { handleCRUDOperation, showSuccessNotification, showErrorNotification } from '../../utils/modalUtils';

const EPIManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState('all');
  const [selectedEPI, setSelectedEPI] = useState<EPI | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [epis] = useState<EPI[]>([
    {
      id: '1',
      workerId: '1',
      workerName: 'Juan García Martínez',
      type: epiTypes[0], // Casco de Seguridad
      brand: 'MSA',
      model: 'V-Gard',
      size: 'Talla Única',
      batchNumber: 'MSA-2024-001',
      deliveryDate: '2024-01-15',
      expiryDate: '2027-01-15',
      status: 'active',
      condition: 'good',
      deliveredBy: 'Ana Martínez',
      observations: 'Entregado en perfecto estado',
      cost: 45.50,
      supplier: 'Suministros Industriales Valencia',
      certifications: ['CE', 'EN 397'],
      photos: []
    },
    {
      id: '2',
      workerId: '1',
      workerName: 'Juan García Martínez',
      type: epiTypes[1], // Chaleco Reflectante
      brand: 'Portwest',
      model: 'Hi-Vis Executive',
      size: 'L',
      batchNumber: 'PW-2024-002',
      deliveryDate: '2024-01-15',
      expiryDate: '2025-01-15',
      status: 'active',
      condition: 'worn',
      deliveredBy: 'Ana Martínez',
      observations: 'Próximo a reposición por desgaste',
      cost: 28.90,
      supplier: 'Equipos de Protección Mediterráneo',
      certifications: ['CE', 'EN ISO 20471'],
      photos: []
    },
    {
      id: '3',
      workerId: '2',
      workerName: 'María López Fernández',
      type: epiTypes[2], // Botas de Seguridad
      brand: 'Cofra',
      model: 'New Volga',
      size: '39',
      batchNumber: 'CF-2024-003',
      deliveryDate: '2024-01-10',
      expiryDate: '2025-01-10',
      status: 'active',
      condition: 'good',
      deliveredBy: 'Pedro González',
      observations: 'Botas específicas para operadora de maquinaria',
      cost: 89.50,
      supplier: 'Calzado Industrial Levante',
      certifications: ['CE', 'EN ISO 20345'],
      photos: []
    },
    {
      id: '4',
      workerId: '3',
      workerName: 'Carlos Ruiz Sánchez',
      type: epiTypes[7], // Arnés de Seguridad
      brand: 'Petzl',
      model: 'Newton',
      size: 'L',
      batchNumber: 'PZ-2024-004',
      deliveryDate: '2024-01-05',
      expiryDate: '2029-01-05',
      status: 'active',
      condition: 'new',
      deliveredBy: 'Ana Martínez',
      observations: 'Arnés para trabajos en altura especializados',
      cost: 156.75,
      supplier: 'Equipos Verticales España',
      certifications: ['CE', 'EN 361', 'EN 358'],
      photos: []
    }
  ]);

  const [alerts] = useState<EPIAlert[]>([
    {
      id: '1',
      workerId: '1',
      workerName: 'Juan García Martínez',
      epiId: '2',
      epiType: 'Chaleco Reflectante',
      alertType: 'expiry_warning',
      daysUntilExpiry: 45,
      priority: 'medium',
      message: 'El chaleco reflectante caduca en 45 días',
      createdDate: '2024-01-31',
      resolved: false
    }
  ]);

  const filteredEPIs = epis.filter(epi => {
    const matchesSearch = epi.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         epi.type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         epi.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || epi.type.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || epi.status === selectedStatus;
    const matchesWorker = selectedWorker === 'all' || epi.workerId === selectedWorker;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesWorker;
  });

  const stats = [
    { label: 'EPIs Totales', value: '1,247', icon: Shield, color: 'text-blue-600' },
    { label: 'Activos', value: '1,156', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Próximos a Caducar', value: '28', icon: Clock, color: 'text-yellow-600' },
    { label: 'Alertas Pendientes', value: '12', icon: AlertTriangle, color: 'text-red-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'replaced': return 'bg-blue-100 text-blue-800';
      case 'lost': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'worn': return 'bg-yellow-100 text-yellow-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'expired': return 'Caducado';
      case 'replaced': return 'Reemplazado';
      case 'lost': return 'Perdido';
      default: return status;
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'new': return 'Nuevo';
      case 'good': return 'Bueno';
      case 'worn': return 'Desgastado';
      case 'damaged': return 'Dañado';
      default: return condition;
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Funciones de acción
  const handleView = async (epi: EPI) => {
    setSelectedEPI(epi);
    setShowViewModal(true);
    await handleCRUDOperation('read', 'EPI', epi, epi.id);
  };

  const handleEdit = (epi: EPI) => {
    console.log('Editando EPI:', epi.id);
    showSuccessNotification('Función de edición activada');
  };

  const handleReplace = (epi: EPI) => {
    console.log('Reemplazando EPI:', epi.id);
    showSuccessNotification('Proceso de reemplazo iniciado');
  };

  const handleExportPDF = async () => {
    setIsLoading(true);
    try {
      const exportData = {
        title: 'Control de EPIs - Grupo EA',
        headers: getExportHeaders('epis'),
        data: formatDataForExport(filteredEPIs, 'epis'),
        filename: `epis_${new Date().toISOString().split('T')[0]}`
      };
      
      const result = exportToPDF(exportData);
      if (result.success) {
        showSuccessNotification('PDF de EPIs generado correctamente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setIsLoading(true);
    try {
      const exportData = {
        title: 'Control de EPIs - Grupo EA',
        headers: getExportHeaders('epis'),
        data: formatDataForExport(filteredEPIs, 'epis'),
        filename: `epis_${new Date().toISOString().split('T')[0]}`
      };
      
      const result = exportToExcel(exportData);
      if (result.success) {
        showSuccessNotification('Excel de EPIs generado correctamente');
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
          <h2 className="text-2xl font-bold text-gray-900">Gestión de EPIs</h2>
          <p className="text-gray-600">Control de equipos de protección individual</p>
        </div>
        <div className="flex space-x-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            onClick={handleExportPDF}
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
          <button type="button" onClick={() => handleCRUDOperation('create', 'EPI')}
            className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Entregar EPI</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Operario, EPI, marca..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              <option value="head">Protección Cabeza</option>
              <option value="body">Protección Cuerpo</option>
              <option value="hands">Protección Manos</option>
              <option value="feet">Protección Pies</option>
              <option value="respiratory">Protección Respiratoria</option>
              <option value="fall_protection">Protección Caídas</option>
              <option value="visibility">Alta Visibilidad</option>
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
              <option value="active">Activo</option>
              <option value="expired">Caducado</option>
              <option value="replaced">Reemplazado</option>
              <option value="lost">Perdido</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Operario</label>
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los operarios</option>
              <option value="1">Juan García Martínez</option>
              <option value="2">María López Fernández</option>
              <option value="3">Carlos Ruiz Sánchez</option>
            </select>
          </div>
        </div>
      </div>

      {/* View EPI Modal */}
      {showViewModal && selectedEPI && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedEPI.type.name} - {selectedEPI.workerName}
                </h2>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del EPI</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Tipo:</strong> {selectedEPI.type.name}</div>
                    <div><strong>Marca:</strong> {selectedEPI.brand}</div>
                    <div><strong>Modelo:</strong> {selectedEPI.model}</div>
                    <div><strong>Talla:</strong> {selectedEPI.size}</div>
                    <div><strong>Lote:</strong> {selectedEPI.batchNumber}</div>
                    <div><strong>Coste:</strong> €{selectedEPI.cost.toFixed(2)}</div>
                    <div><strong>Proveedor:</strong> {selectedEPI.supplier}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado y Fechas</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Entregado:</strong> {new Date(selectedEPI.deliveryDate).toLocaleDateString('es-ES')}</div>
                    <div><strong>Caduca:</strong> {new Date(selectedEPI.expiryDate).toLocaleDateString('es-ES')}</div>
                    <div><strong>Estado:</strong> {getStatusLabel(selectedEPI.status)}</div>
                    <div><strong>Condición:</strong> {getConditionLabel(selectedEPI.condition)}</div>
                    <div><strong>Entregado por:</strong> {selectedEPI.deliveredBy}</div>
                    <div><strong>Observaciones:</strong> {selectedEPI.observations}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EPIs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Equipos de Protección Individual ({filteredEPIs.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EPI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marca/Modelo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coste
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condición
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
              {filteredEPIs.map((epi) => {
                const daysUntilExpiry = getDaysUntilExpiry(epi.expiryDate);
                const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;
                const isExpired = daysUntilExpiry <= 0;

                return (
                  <tr key={epi.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-corporate-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-corporate-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{epi.workerName}</div>
                          <div className="text-sm text-gray-500">ID: {epi.workerId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{epi.type.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{epi.type.name}</div>
                          <div className="text-sm text-gray-500">Talla: {epi.size}</div>
                          <div className="text-xs text-gray-400">Lote: {epi.batchNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{epi.brand}</div>
                        <div className="text-gray-500">{epi.model}</div>
                        <div className="text-xs text-gray-400">
                          Proveedor: {epi.supplier}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Entregado: {new Date(epi.deliveryDate).toLocaleDateString('es-ES')}</div>
                        <div className={`${isExpired ? 'text-red-600 font-medium' : isExpiringSoon ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
                          Caduca: {new Date(epi.expiryDate).toLocaleDateString('es-ES')}
                        </div>
                        {(isExpired || isExpiringSoon) && (
                          <div className="text-xs">
                            {isExpired ? 'CADUCADO' : `${daysUntilExpiry} días restantes`}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">€{epi.cost.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">Por: {epi.deliveredBy}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getConditionColor(epi.condition)}`}>
                        {getConditionLabel(epi.condition)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(epi.status)}`}>
                        {getStatusLabel(epi.status)}
                      </span>
                      {(isExpired || isExpiringSoon) && (
                        <div className="mt-1">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mx-auto" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button type="button" onClick={() => handleView(epi)}
                          className="text-corporate-blue-600 hover:text-corporate-blue-900"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleEdit(epi)}
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleReplace(epi)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Reemplazar"
                        >
                          <Package className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-orange-600 hover:text-orange-900"
                          title="Documentos"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Activas</h3>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{alert.message}</div>
                  <div className="text-sm text-gray-500">
                    {alert.workerName} - {alert.epiType}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700">
                  Gestionar
                </button>
                <button className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">
                  Marcar Resuelto
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EPIManagement;