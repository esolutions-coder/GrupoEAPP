import React, { useState } from 'react';
import { 
  Building2, Plus, Search, Edit, Trash2, Eye, Phone, Mail, MapPin, 
  Star, TrendingUp, DollarSign, Calendar, User, FileText, Download,
  CheckCircle, AlertTriangle, Filter, Users, Euro
} from 'lucide-react';
import { Client } from '../../types/crm';
import { exportToPDF, exportToExcel, printTable, formatDataForExport, getExportHeaders } from '../../utils/exportUtils';
import { handleCRUDOperation, showSuccessNotification, showErrorNotification } from '../../utils/modalUtils';

const CRMModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [clients] = useState<Client[]>([
    {
      id: '1',
      nombreComercial: 'Ministerio de Transportes',
      razonSocial: 'Ministerio de Transportes, Movilidad y Agenda Urbana',
      cifNif: 'S2800568D',
      personaContacto: 'Director Técnico Regional',
      cargoContacto: 'Director',
      emailContacto: 'direccion.tecnica@mitma.es',
      telefonoContacto: '+34 915 123 456',
      direccionFiscal: 'Paseo de la Castellana 67, Madrid',
      ubicacionesObra: ['Valencia', 'Alicante', 'Castellón'],
      fechaAlta: '2023-12-01',
      estadoCliente: 'activo',
      necesidadesEspecificas: 'Infraestructuras de gran envergadura, cumplimiento normativo estricto',
      objetivosAcordados: ['Finalización en plazo', 'Calidad certificada', 'Seguridad máxima'],
      satisfaccionPromedio: 4.8,
      valorTotal: 4500000,
      proyectosActivos: 2,
      ultimoContacto: '2024-01-28',
      proximaAccion: 'Reunión seguimiento A-7',
      fechaProximaAccion: '2024-02-15',
      responsableComercial: 'Ana Martínez',
      etiquetas: ['Público', 'Infraestructuras', 'VIP'],
      prioridad: 'alta',
      origen: 'referido',
      observaciones: 'Cliente estratégico con múltiples proyectos en cartera'
    },
    {
      id: '2',
      nombreComercial: 'Inmobiliaria Mediterránea',
      razonSocial: 'Inmobiliaria Mediterránea S.L.',
      cifNif: 'B46123456',
      personaContacto: 'Ana García Ruiz',
      cargoContacto: 'Directora General',
      emailContacto: 'ana.garcia@inmo-med.es',
      telefonoContacto: '+34 963 456 789',
      direccionFiscal: 'Avenida del Puerto 123, Valencia',
      ubicacionesObra: ['Valencia', 'Alicante'],
      fechaAlta: '2023-11-15',
      estadoCliente: 'activo',
      necesidadesEspecificas: 'Edificación residencial de calidad, plazos ajustados',
      objetivosAcordados: ['Calidad premium', 'Entrega puntual', 'Coste controlado'],
      satisfaccionPromedio: 4.6,
      valorTotal: 2800000,
      proyectosActivos: 1,
      ultimoContacto: '2024-01-30',
      proximaAccion: 'Presentación nuevo proyecto',
      fechaProximaAccion: '2024-02-20',
      responsableComercial: 'Pedro González',
      etiquetas: ['Privado', 'Residencial', 'Recurrente'],
      prioridad: 'media',
      origen: 'web',
      observaciones: 'Cliente fiel con potencial de crecimiento'
    },
    {
      id: '3',
      nombreComercial: 'Ayuntamiento de Valencia',
      razonSocial: 'Excmo. Ayuntamiento de Valencia',
      cifNif: 'P4601300A',
      personaContacto: 'Concejalía de Urbanismo',
      cargoContacto: 'Concejal',
      emailContacto: 'urbanismo@valencia.es',
      telefonoContacto: '+34 963 525 478',
      direccionFiscal: 'Plaza del Ayuntamiento 1, Valencia',
      ubicacionesObra: ['Valencia'],
      fechaAlta: '2022-05-10',
      estadoCliente: 'activo',
      necesidadesEspecificas: 'Obras públicas, urbanización, cumplimiento administrativo',
      objetivosAcordados: ['Transparencia', 'Calidad técnica', 'Impacto social positivo'],
      satisfaccionPromedio: 4.4,
      valorTotal: 3200000,
      proyectosActivos: 1,
      ultimoContacto: '2024-01-25',
      proximaAccion: 'Revisión proyecto polígono',
      fechaProximaAccion: '2024-02-10',
      responsableComercial: 'Carlos Ruiz',
      etiquetas: ['Público', 'Municipal', 'Urbanización'],
      prioridad: 'alta',
      origen: 'comercial',
      observaciones: 'Relación institucional sólida, múltiples proyectos futuros'
    }
  ]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.personaContacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.cifNif.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || 
                       (selectedType === 'publico' && client.etiquetas.includes('Público')) ||
                       (selectedType === 'privado' && client.etiquetas.includes('Privado'));
    
    const matchesStatus = selectedStatus === 'all' || client.estadoCliente === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || client.prioridad === selectedPriority;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const stats = [
    { label: 'Total Clientes', value: '127', icon: Building2, color: 'text-blue-600' },
    { label: 'Clientes Activos', value: '118', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Facturación Total', value: '€12.4M', icon: Euro, color: 'text-purple-600' },
    { label: 'Satisfacción Media', value: '4.6/5', icon: Star, color: 'text-yellow-600' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-gray-100 text-gray-800';
      case 'potencial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Funciones de acción
  const handleView = async (client: Client) => {
    setSelectedClient(client);
    setShowViewModal(true);
    await handleCRUDOperation('read', 'Cliente', client, client.id);
  };

  const handleEdit = (client: Client) => {
    console.log('Editando cliente:', client.id);
    showSuccessNotification('Función de edición activada');
  };

  const handleDelete = async (client: Client) => {
    const success = await handleCRUDOperation('delete', 'Cliente', client, client.id);
    if (success) {
      console.log('Cliente eliminado:', client.id);
    }
  };

  const handleExportPDF = async () => {
    setIsLoading(true);
    try {
      const exportData = {
        title: 'Cartera de Clientes CRM - Grupo EA',
        headers: getExportHeaders('clients'),
        data: formatDataForExport(filteredClients, 'clients'),
        filename: `clientes_crm_${new Date().toISOString().split('T')[0]}`
      };
      
      const result = exportToPDF(exportData);
      if (result.success) {
        showSuccessNotification('PDF de clientes generado correctamente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setIsLoading(true);
    try {
      const exportData = {
        title: 'Cartera de Clientes CRM - Grupo EA',
        headers: getExportHeaders('clients'),
        data: formatDataForExport(filteredClients, 'clients'),
        filename: `clientes_crm_${new Date().toISOString().split('T')[0]}`
      };
      
      const result = exportToExcel(exportData);
      if (result.success) {
        showSuccessNotification('Excel de clientes generado correctamente');
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
          <h2 className="text-2xl font-bold text-gray-900">CRM - Gestión de Clientes</h2>
          <p className="text-gray-600">Sistema integral de gestión de relaciones con clientes</p>
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
          <button type="button" onClick={() => handleCRUDOperation('create', 'Cliente')}
            className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Cliente</span>
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
                placeholder="Nombre, contacto, CIF..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los tipos</option>
              <option value="publico">Público</option>
              <option value="privado">Privado</option>
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
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="potencial">Potencial</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Cartera de Clientes ({filteredClients.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto Principal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proyectos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Próxima Acción
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prioridad
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
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-corporate-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-corporate-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{client.nombreComercial}</div>
                        <div className="text-sm text-gray-500">CIF: {client.cifNif}</div>
                        <div className="text-xs text-gray-400">
                          Cliente desde: {new Date(client.fechaAlta).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{client.personaContacto}</div>
                      <div className="text-gray-500">{client.cargoContacto}</div>
                      <div className="flex items-center space-x-1 mt-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span className="text-xs">{client.telefonoContacto}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="text-xs truncate">{client.emailContacto}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium text-green-600">{client.proyectosActivos} activos</div>
                      <div className="text-gray-500">Ubicaciones:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {client.ubicacionesObra.slice(0, 2).map((ubicacion, index) => (
                          <span key={index} className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            {ubicacion}
                          </span>
                        ))}
                        {client.ubicacionesObra.length > 2 && (
                          <span className="px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            +{client.ubicacionesObra.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-purple-600">
                      €{(client.valorTotal / 1000000).toFixed(1)}M
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-500">{client.satisfaccionPromedio}/5</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Comercial: {client.responsableComercial}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.proximaAccion}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(client.fechaProximaAccion).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-xs text-gray-400">
                      Último contacto: {new Date(client.ultimoContacto).toLocaleDateString('es-ES')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(client.prioridad)}`}>
                      {client.prioridad.charAt(0).toUpperCase() + client.prioridad.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(client.estadoCliente)}`}>
                      {client.estadoCliente.charAt(0).toUpperCase() + client.estadoCliente.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button type="button" onClick={() => handleView(client)}
                        className="text-corporate-blue-600 hover:text-corporate-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleEdit(client)}
                        className="text-green-600 hover:text-green-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-purple-600 hover:text-purple-900"
                        title="Comunicaciones"
                      >
                        <Mail className="h-4 w-4" />
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Client Modal */}
      {showViewModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedClient.nombreComercial}</h2>
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
                    <div><strong>Razón Social:</strong> {selectedClient.razonSocial}</div>
                    <div><strong>CIF/NIF:</strong> {selectedClient.cifNif}</div>
                    <div><strong>Dirección:</strong> {selectedClient.direccionFiscal}</div>
                    <div><strong>Contacto:</strong> {selectedClient.personaContacto}</div>
                    <div><strong>Cargo:</strong> {selectedClient.cargoContacto}</div>
                    <div><strong>Teléfono:</strong> {selectedClient.telefonoContacto}</div>
                    <div><strong>Email:</strong> {selectedClient.emailContacto}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Comercial</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Proyectos Activos:</strong> {selectedClient.proyectosActivos}</div>
                    <div><strong>Valor Total:</strong> €{selectedClient.valorTotal.toLocaleString()}</div>
                    <div><strong>Satisfacción:</strong> {selectedClient.satisfaccionPromedio}/5</div>
                    <div><strong>Responsable:</strong> {selectedClient.responsableComercial}</div>
                    <div><strong>Próxima Acción:</strong> {selectedClient.proximaAccion}</div>
                    <div><strong>Fecha:</strong> {new Date(selectedClient.fechaProximaAccion).toLocaleDateString('es-ES')}</div>
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

export default CRMModule;