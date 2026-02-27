import React, { useState } from 'react';
import { 
  Truck, Plus, Search, Wrench, AlertTriangle, CheckCircle, Clock, MapPin, 
  Calendar, Edit, Eye, Trash2, Download, FileText, User, Fuel, Settings,
  BarChart3, DollarSign, TrendingUp, Filter, Save, X
} from 'lucide-react';
import { Machine, MachineAlert, MaintenanceRecord, MachineUsage } from '../../types/machinery';
import { machineTypes, machineCategories } from '../../data/machineTypes';
import { exportToPDF, exportToExcel, formatDataForExport, getExportHeaders } from '../../utils/exportUtils';
import { handleCRUDOperation, showSuccessNotification, showErrorNotification } from '../../utils/modalUtils';

const Machinery: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editForm, setEditForm] = useState<Partial<Machine>>({});
  const [maintenanceForm, setMaintenanceForm] = useState({
    type: 'preventive',
    description: '',
    laborHours: 0,
    totalCost: 0,
    performedBy: '',
    observations: ''
  });

  const [machines] = useState<Machine[]>([
    {
      id: '1',
      code: 'EXC-001',
      name: 'Excavadora CAT 320D',
      type: machineTypes[0],
      brand: 'Caterpillar',
      model: '320D',
      serialNumber: 'CAT320D2024001',
      registrationNumber: 'V-1234-ABC',
      purchaseDate: '2022-03-15',
      purchasePrice: 185000,
      currentValue: 145000,
      status: 'operational',
      condition: 'good',
      currentLocation: 'Autopista A-7 Valencia',
      assignedProject: 'Autopista A-7 Valencia',
      assignedOperator: 'María López Fernández',
      totalHours: 2450,
      hoursThisMonth: 168,
      fuelLevel: 85,
      fuelCapacity: 400,
      fuelType: 'diesel',
      lastMaintenance: '2024-01-15',
      nextMaintenance: '2024-04-15',
      maintenanceInterval: 250,
      maintenanceHistory: [
        {
          id: '1',
          machineId: '1',
          date: '2024-01-15',
          type: 'preventive',
          description: 'Mantenimiento preventivo trimestral',
          partsReplaced: [
            {
              id: '1',
              name: 'Filtro de aceite',
              partNumber: 'CAT-OF-001',
              quantity: 2,
              unitCost: 45.50,
              totalCost: 91.00,
              supplier: 'Caterpillar España',
              warranty: 6
            }
          ],
          laborHours: 4,
          totalCost: 320.50,
          performedBy: 'Taller Maquinaria Levante',
          nextMaintenanceHours: 2700,
          observations: 'Mantenimiento completado sin incidencias',
          photos: [],
          invoices: []
        }
      ],
      insurance: {
        company: 'Mapfre Empresas',
        policyNumber: 'MAP-2024-001',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        coverage: 200000,
        premium: 2400,
        isActive: true
      },
      technicalInspection: {
        lastInspection: '2024-01-10',
        nextInspection: '2025-01-10',
        result: 'passed',
        inspector: 'ITV Valencia Norte',
        observations: 'Inspección superada sin observaciones',
        certificateNumber: 'ITV-2024-001'
      },
      operatorLicense: 'Carnet de maquinista pesada',
      manuals: [
        {
          id: '1',
          name: 'Manual de operación CAT 320D',
          type: 'manual',
          url: '#',
          uploadDate: '2022-03-15',
          uploadedBy: 'Ana Martínez'
        }
      ],
      photos: [
        'https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      operatingCostPerHour: 45.50,
      maintenanceCostTotal: 8500,
      createdBy: 'Ana Martínez',
      createdDate: '2022-03-15',
      lastModified: '2024-01-31',
      modifiedBy: 'Pedro González'
    },
    {
      id: '2',
      code: 'GRU-001',
      name: 'Grúa Torre Liebherr',
      type: machineTypes[1],
      brand: 'Liebherr',
      model: '132 EC-H',
      serialNumber: 'LIE132ECH2023001',
      purchaseDate: '2023-01-20',
      purchasePrice: 320000,
      currentValue: 285000,
      status: 'operational',
      condition: 'excellent',
      currentLocation: 'Edificio Residencial Marina',
      assignedProject: 'Edificio Residencial Marina',
      assignedOperator: 'Antonio Ruiz García',
      totalHours: 1250,
      hoursThisMonth: 145,
      fuelLevel: 92,
      fuelCapacity: 300,
      fuelType: 'diesel',
      lastMaintenance: '2024-02-01',
      nextMaintenance: '2024-05-01',
      maintenanceInterval: 500,
      maintenanceHistory: [],
      insurance: {
        company: 'Allianz Seguros',
        policyNumber: 'ALL-2024-002',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        coverage: 350000,
        premium: 4200,
        isActive: true
      },
      technicalInspection: {
        lastInspection: '2024-01-15',
        nextInspection: '2025-01-15',
        result: 'passed',
        inspector: 'ITV Alicante',
        observations: 'Inspección superada',
        certificateNumber: 'ITV-2024-002'
      },
      operatorLicense: 'Carnet de gruista',
      manuals: [],
      photos: [
        'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      operatingCostPerHour: 65.00,
      maintenanceCostTotal: 3200,
      createdBy: 'Pedro González',
      createdDate: '2023-01-20',
      lastModified: '2024-02-01',
      modifiedBy: 'Ana Martínez'
    },
    {
      id: '3',
      code: 'BUL-001',
      name: 'Bulldozer Komatsu D65',
      type: machineTypes[2],
      brand: 'Komatsu',
      model: 'D65PX',
      serialNumber: 'KOM65PX2021001',
      purchaseDate: '2021-06-10',
      purchasePrice: 165000,
      currentValue: 125000,
      status: 'maintenance',
      condition: 'fair',
      currentLocation: 'Taller Central Valencia',
      assignedProject: 'Polígono Industrial Norte',
      assignedOperator: 'Sin asignar',
      totalHours: 3850,
      hoursThisMonth: 0,
      fuelLevel: 15,
      fuelCapacity: 350,
      fuelType: 'diesel',
      lastMaintenance: '2024-01-30',
      nextMaintenance: '2024-02-15',
      maintenanceInterval: 300,
      maintenanceHistory: [
        {
          id: '1',
          machineId: '3',
          date: '2024-01-30',
          type: 'corrective',
          description: 'Reparación sistema hidráulico',
          partsReplaced: [
            {
              id: '1',
              name: 'Bomba hidráulica',
              partNumber: 'KOM-HYD-001',
              quantity: 1,
              unitCost: 1250.00,
              totalCost: 1250.00,
              supplier: 'Komatsu España',
              warranty: 12
            }
          ],
          laborHours: 8,
          totalCost: 1650.00,
          performedBy: 'Taller Autorizado Komatsu',
          nextMaintenanceHours: 4150,
          observations: 'Reparación mayor del sistema hidráulico',
          photos: [],
          invoices: []
        }
      ],
      insurance: {
        company: 'AXA Seguros',
        policyNumber: 'AXA-2024-003',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        coverage: 180000,
        premium: 2100,
        isActive: true
      },
      technicalInspection: {
        lastInspection: '2024-01-05',
        nextInspection: '2025-01-05',
        result: 'conditional',
        inspector: 'ITV Valencia Sur',
        observations: 'Pendiente reparación sistema hidráulico',
        certificateNumber: 'ITV-2024-003'
      },
      operatorLicense: 'Carnet de maquinista pesada',
      manuals: [],
      photos: [],
      operatingCostPerHour: 52.00,
      maintenanceCostTotal: 12500,
      createdBy: 'Carlos Ruiz',
      createdDate: '2021-06-10',
      lastModified: '2024-01-30',
      modifiedBy: 'Taller Komatsu'
    }
  ]);

  const [alerts] = useState<MachineAlert[]>([
    {
      id: '1',
      machineId: '3',
      machineName: 'Bulldozer Komatsu D65',
      type: 'maintenance_due',
      severity: 'high',
      message: 'Mantenimiento vencido hace 5 días',
      dueDate: '2024-01-25',
      createdDate: '2024-01-30',
      resolved: false
    },
    {
      id: '2',
      machineId: '1',
      machineName: 'Excavadora CAT 320D',
      type: 'fuel_low',
      severity: 'medium',
      message: 'Nivel de combustible bajo (15%)',
      threshold: 20,
      currentValue: 15,
      createdDate: '2024-01-31',
      resolved: false
    }
  ]);

  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || machine.type.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || machine.status === selectedStatus;
    const matchesLocation = selectedLocation === 'all' || machine.currentLocation.includes(selectedLocation);
    
    return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
  });

  const stats = [
    { label: 'Total Maquinaria', value: '45', icon: Truck, color: 'text-blue-600' },
    { label: 'Operativas', value: '38', icon: CheckCircle, color: 'text-green-600' },
    { label: 'En Mantenimiento', value: '5', icon: Wrench, color: 'text-yellow-600' },
    { label: 'Fuera de Servicio', value: '2', icon: AlertTriangle, color: 'text-red-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'repair': return 'bg-orange-100 text-orange-800';
      case 'out_of_service': return 'bg-red-100 text-red-800';
      case 'rented': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'operational': return 'Operativa';
      case 'maintenance': return 'Mantenimiento';
      case 'repair': return 'Reparación';
      case 'out_of_service': return 'Fuera de Servicio';
      case 'rented': return 'Alquilada';
      default: return status;
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bueno';
      case 'fair': return 'Regular';
      case 'poor': return 'Malo';
      default: return condition;
    }
  };

  const getFuelLevelColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDaysUntilMaintenance = (nextMaintenance: string) => {
    const today = new Date();
    const maintenance = new Date(nextMaintenance);
    const diffTime = maintenance.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Funciones de acción
  const handleView = async (machine: Machine) => {
    setSelectedMachine(machine);
    setShowViewModal(true);
    await handleCRUDOperation('read', 'Maquinaria', machine, machine.id);
  };

  const handleEdit = (machine: Machine) => {
    setSelectedMachine(machine);
    setEditForm(machine);
    setShowEditModal(true);
  };

  const handleDelete = async (machine: Machine) => {
    const success = await handleCRUDOperation('delete', 'Maquinaria', machine, machine.id);
    if (success) {
      showSuccessNotification(`Maquinaria ${machine.name} eliminada correctamente`);
    }
  };

  const handleCreate = () => {
    setEditForm({
      code: '',
      name: '',
      type: machineTypes[0],
      brand: '',
      model: '',
      serialNumber: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchasePrice: 0,
      currentValue: 0,
      status: 'operational',
      condition: 'excellent',
      currentLocation: '',
      totalHours: 0,
      hoursThisMonth: 0,
      fuelLevel: 100,
      fuelCapacity: 400,
      fuelType: 'diesel',
      maintenanceInterval: 250,
      operatingCostPerHour: 0,
      maintenanceCostTotal: 0
    });
    setShowCreateModal(true);
  };

  const handleMaintenance = (machine: Machine) => {
    setSelectedMachine(machine);
    setMaintenanceForm({
      type: 'preventive',
      description: '',
      laborHours: 0,
      totalCost: 0,
      performedBy: '',
      observations: ''
    });
    setShowMaintenanceModal(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (showCreateModal) {
        await handleCRUDOperation('create', 'Maquinaria', editForm);
        showSuccessNotification('Maquinaria creada correctamente');
        setShowCreateModal(false);
      } else if (showEditModal) {
        await handleCRUDOperation('update', 'Maquinaria', editForm, selectedMachine?.id);
        showSuccessNotification('Maquinaria actualizada correctamente');
        setShowEditModal(false);
      }
      setEditForm({});
      setSelectedMachine(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaintenanceSave = async () => {
    setIsLoading(true);
    try {
      await handleCRUDOperation('create', 'Mantenimiento', {
        ...maintenanceForm,
        machineId: selectedMachine?.id,
        machineName: selectedMachine?.name
      });
      showSuccessNotification('Mantenimiento registrado correctamente');
      setShowMaintenanceModal(false);
      setMaintenanceForm({
        type: 'preventive',
        description: '',
        laborHours: 0,
        totalCost: 0,
        performedBy: '',
        observations: ''
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setIsLoading(true);
    try {
      const exportData = {
        title: 'Parque de Maquinaria - Grupo EA',
        headers: ['Código', 'Nombre', 'Marca/Modelo', 'Estado', 'Ubicación', 'Operador', 'Horas Totales', 'Próximo Mantenimiento'],
        data: filteredMachines.map(machine => [
          machine.code,
          machine.name,
          `${machine.brand} ${machine.model}`,
          getStatusLabel(machine.status),
          machine.currentLocation,
          machine.assignedOperator || 'Sin asignar',
          `${machine.totalHours}h`,
          new Date(machine.nextMaintenance).toLocaleDateString('es-ES')
        ]),
        filename: `maquinaria_${new Date().toISOString().split('T')[0]}`
      };
      
      const result = exportToPDF(exportData);
      if (result.success) {
        showSuccessNotification('PDF de maquinaria generado correctamente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setIsLoading(true);
    try {
      const exportData = {
        title: 'Parque de Maquinaria - Grupo EA',
        headers: ['Código', 'Nombre', 'Marca/Modelo', 'Estado', 'Ubicación', 'Operador', 'Horas Totales', 'Próximo Mantenimiento'],
        data: filteredMachines.map(machine => [
          machine.code,
          machine.name,
          `${machine.brand} ${machine.model}`,
          getStatusLabel(machine.status),
          machine.currentLocation,
          machine.assignedOperator || 'Sin asignar',
          `${machine.totalHours}h`,
          new Date(machine.nextMaintenance).toLocaleDateString('es-ES')
        ]),
        filename: `maquinaria_${new Date().toISOString().split('T')[0]}`
      };
      
      const result = exportToExcel(exportData);
      if (result.success) {
        showSuccessNotification('Excel de maquinaria generado correctamente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const tableElement = document.querySelector('#machinery-table') as HTMLElement;
    if (tableElement) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Parque de Maquinaria - Grupo EA</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #1e40af; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #1e40af; color: white; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .print-date { font-size: 12px; color: #666; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <h1>Parque de Maquinaria - Grupo EA</h1>
              <div class="print-date">Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}</div>
              ${tableElement.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
        showSuccessNotification('Impresión iniciada');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Maquinaria</h2>
          <p className="text-gray-600">Control y mantenimiento del parque de maquinaria</p>
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
          <button type="button" onClick={handlePrint}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Imprimir</span>
          </button>
          <button type="button" onClick={handleCreate}
            className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Máquina</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
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
                placeholder="Nombre, código, marca..."
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
              {machineCategories.map(category => (
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
              <option value="all">Todos los estados</option>
              <option value="operational">Operativa</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="repair">Reparación</option>
              <option value="out_of_service">Fuera de Servicio</option>
              <option value="rented">Alquilada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las ubicaciones</option>
              <option value="Valencia">Valencia</option>
              <option value="Alicante">Alicante</option>
              <option value="Castellón">Castellón</option>
              <option value="Taller">Taller Central</option>
            </select>
          </div>
        </div>
      </div>

      {/* Machinery Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Parque de Maquinaria ({filteredMachines.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table id="machinery-table" className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Máquina
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asignación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horas
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Combustible
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mantenimiento
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
              {filteredMachines.map((machine) => {
                const daysUntilMaintenance = getDaysUntilMaintenance(machine.nextMaintenance);
                const isMaintenanceDue = daysUntilMaintenance <= 0;
                const isMaintenanceSoon = daysUntilMaintenance <= 7 && daysUntilMaintenance > 0;

                return (
                  <tr key={machine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-corporate-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">{machine.type.icon}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{machine.name}</div>
                          <div className="text-sm text-gray-500">{machine.brand} {machine.model}</div>
                          <div className="text-xs text-gray-400">Código: {machine.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{machine.assignedOperator || 'Sin asignar'}</div>
                        <div className="text-gray-500">{machine.assignedProject || 'Sin proyecto'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{machine.currentLocation}</div>
                      <div className="text-xs text-gray-500">
                        Valor: €{machine.currentValue.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-bold text-blue-600">{machine.totalHours}h</div>
                      <div className="text-xs text-gray-500">Este mes: {machine.hoursThisMonth}h</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className={`text-sm font-bold ${getFuelLevelColor(machine.fuelLevel)}`}>
                        {machine.fuelLevel}%
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1 mx-auto">
                        <div 
                          className={`h-2 rounded-full ${
                            machine.fuelLevel > 50 ? 'bg-green-500' : 
                            machine.fuelLevel > 25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${machine.fuelLevel}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {machine.fuelCapacity}L cap.
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Último: {new Date(machine.lastMaintenance).toLocaleDateString('es-ES')}</div>
                        <div className={`${isMaintenanceDue ? 'text-red-600 font-medium' : isMaintenanceSoon ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
                          Próximo: {new Date(machine.nextMaintenance).toLocaleDateString('es-ES')}
                        </div>
                        {isMaintenanceDue && (
                          <div className="text-xs text-red-600 font-medium">VENCIDO</div>
                        )}
                        {isMaintenanceSoon && (
                          <div className="text-xs text-yellow-600">{daysUntilMaintenance} días</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(machine.status)}`}>
                        {getStatusLabel(machine.status)}
                      </span>
                      <div className="mt-1">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getConditionColor(machine.condition)}`}>
                          {getConditionLabel(machine.condition)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button type="button" onClick={() => handleView(machine)}
                          className="text-corporate-blue-600 hover:text-corporate-blue-900" 
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleEdit(machine)}
                          className="text-green-600 hover:text-green-900" 
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleMaintenance(machine)}
                          className="text-orange-600 hover:text-orange-900" 
                          title="Mantenimiento"
                        >
                          <Wrench className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(machine)}
                          className="text-red-600 hover:text-red-900" 
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas de Maquinaria</h3>
        <div className="space-y-3">
          {alerts.filter(a => !a.resolved).map((alert) => (
            <div key={alert.id} className={`flex items-center justify-between p-4 rounded-lg border ${
              alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
              alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
              alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center space-x-3">
                <AlertTriangle className={`h-5 w-5 ${
                  alert.severity === 'critical' ? 'text-red-600' :
                  alert.severity === 'high' ? 'text-orange-600' :
                  alert.severity === 'medium' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                <div>
                  <div className="text-sm font-medium text-gray-900">{alert.message}</div>
                  <div className="text-sm text-gray-500">
                    {alert.machineName} • {alert.dueDate && `Vence: ${new Date(alert.dueDate).toLocaleDateString('es-ES')}`}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button type="button" onClick={() => {
                    const machine = machines.find(m => m.id === alert.machineId);
                    if (machine) handleMaintenance(machine);
                  }}
                  className="px-3 py-1 text-sm bg-corporate-blue-600 text-white rounded hover:bg-corporate-blue-700"
                >
                  Gestionar
                </button>
                <button type="button" onClick={() => showSuccessNotification('Alerta marcada como resuelta')}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Resolver
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Machine Modal */}
      {showViewModal && selectedMachine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedMachine.name}</h2>
                <button type="button" onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Código:</strong> {selectedMachine.code}</div>
                    <div><strong>Marca/Modelo:</strong> {selectedMachine.brand} {selectedMachine.model}</div>
                    <div><strong>Número Serie:</strong> {selectedMachine.serialNumber}</div>
                    <div><strong>Matrícula:</strong> {selectedMachine.registrationNumber || 'N/A'}</div>
                    <div><strong>Fecha Compra:</strong> {new Date(selectedMachine.purchaseDate).toLocaleDateString('es-ES')}</div>
                    <div><strong>Precio Compra:</strong> €{selectedMachine.purchasePrice.toLocaleString()}</div>
                    <div><strong>Valor Actual:</strong> €{selectedMachine.currentValue.toLocaleString()}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado Operativo</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Estado:</strong> {getStatusLabel(selectedMachine.status)}</div>
                    <div><strong>Condición:</strong> {getConditionLabel(selectedMachine.condition)}</div>
                    <div><strong>Ubicación:</strong> {selectedMachine.currentLocation}</div>
                    <div><strong>Proyecto:</strong> {selectedMachine.assignedProject || 'Sin asignar'}</div>
                    <div><strong>Operador:</strong> {selectedMachine.assignedOperator || 'Sin asignar'}</div>
                    <div><strong>Horas Totales:</strong> {selectedMachine.totalHours}h</div>
                    <div><strong>Coste/Hora:</strong> €{selectedMachine.operatingCostPerHour}</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mantenimiento</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Último:</strong> {new Date(selectedMachine.lastMaintenance).toLocaleDateString('es-ES')}</div>
                    <div><strong>Próximo:</strong> {new Date(selectedMachine.nextMaintenance).toLocaleDateString('es-ES')}</div>
                    <div><strong>Intervalo:</strong> {selectedMachine.maintenanceInterval}h</div>
                    <div><strong>Coste Total:</strong> €{selectedMachine.maintenanceCostTotal.toLocaleString()}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Seguro e ITV</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Aseguradora:</strong> {selectedMachine.insurance.company}</div>
                    <div><strong>Póliza:</strong> {selectedMachine.insurance.policyNumber}</div>
                    <div><strong>Vence:</strong> {new Date(selectedMachine.insurance.endDate).toLocaleDateString('es-ES')}</div>
                    <div><strong>ITV:</strong> {new Date(selectedMachine.technicalInspection.nextInspection).toLocaleDateString('es-ES')}</div>
                  </div>
                </div>
              </div>

              {selectedMachine.maintenanceHistory.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Mantenimiento</h3>
                  <div className="space-y-3">
                    {selectedMachine.maintenanceHistory.map((maintenance) => (
                      <div key={maintenance.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{maintenance.description}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            maintenance.type === 'preventive' ? 'bg-green-100 text-green-800' :
                            maintenance.type === 'corrective' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {maintenance.type === 'preventive' ? 'Preventivo' :
                             maintenance.type === 'corrective' ? 'Correctivo' : 'Emergencia'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>Fecha: {new Date(maintenance.date).toLocaleDateString('es-ES')}</div>
                          <div>Coste: €{maintenance.totalCost.toLocaleString()}</div>
                          <div>Horas trabajo: {maintenance.laborHours}h</div>
                          <div>Realizado por: {maintenance.performedBy}</div>
                        </div>
                        {maintenance.observations && (
                          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {maintenance.observations}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Machine Modal */}
      {showEditModal && selectedMachine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Editar Maquinaria</h2>
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
                    <input
                      type="text"
                      value={editForm.code || ''}
                      onChange={(e) => setEditForm({...editForm, code: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marca *</label>
                    <input
                      type="text"
                      value={editForm.brand || ''}
                      onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Modelo *</label>
                    <input
                      type="text"
                      value={editForm.model || ''}
                      onChange={(e) => setEditForm({...editForm, model: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
                    <select
                      value={editForm.status || 'operational'}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value as any})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    >
                      <option value="operational">Operativa</option>
                      <option value="maintenance">Mantenimiento</option>
                      <option value="repair">Reparación</option>
                      <option value="out_of_service">Fuera de Servicio</option>
                      <option value="rented">Alquilada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación Actual *</label>
                    <input
                      type="text"
                      value={editForm.currentLocation || ''}
                      onChange={(e) => setEditForm({...editForm, currentLocation: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>{isLoading ? 'Guardando...' : 'Guardar Cambios'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Machine Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Nueva Maquinaria</h2>
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
                    <input
                      type="text"
                      value={editForm.code || ''}
                      onChange={(e) => setEditForm({...editForm, code: e.target.value})}
                      placeholder="EXC-001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      placeholder="Excavadora CAT 320D"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                    <select
                      value={editForm.type?.id || machineTypes[0].id}
                      onChange={(e) => {
                        const selectedType = machineTypes.find(t => t.id === e.target.value);
                        setEditForm({...editForm, type: selectedType});
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    >
                      {machineTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.icon} {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marca *</label>
                    <input
                      type="text"
                      value={editForm.brand || ''}
                      onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                      placeholder="Caterpillar"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Modelo *</label>
                    <input
                      type="text"
                      value={editForm.model || ''}
                      onChange={(e) => setEditForm({...editForm, model: e.target.value})}
                      placeholder="320D"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación Actual *</label>
                    <input
                      type="text"
                      value={editForm.currentLocation || ''}
                      onChange={(e) => setEditForm({...editForm, currentLocation: e.target.value})}
                      placeholder="Obra/Taller"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>{isLoading ? 'Creando...' : 'Crear Maquinaria'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && selectedMachine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Registrar Mantenimiento - {selectedMachine.name}
                </h2>
                <button type="button" onClick={() => setShowMaintenanceModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Mantenimiento *</label>
                  <select
                    value={maintenanceForm.type}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, type: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  >
                    <option value="preventive">Preventivo</option>
                    <option value="corrective">Correctivo</option>
                    <option value="emergency">Emergencia</option>
                    <option value="inspection">Inspección</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
                  <textarea
                    rows={3}
                    value={maintenanceForm.description}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, description: e.target.value})}
                    placeholder="Describe el mantenimiento realizado..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Horas de Trabajo</label>
                    <input
                      type="number"
                      value={maintenanceForm.laborHours}
                      onChange={(e) => setMaintenanceForm({...maintenanceForm, laborHours: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coste Total (€)</label>
                    <input
                      type="number"
                      value={maintenanceForm.totalCost}
                      onChange={(e) => setMaintenanceForm({...maintenanceForm, totalCost: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Realizado por *</label>
                  <input
                    type="text"
                    value={maintenanceForm.performedBy}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, performedBy: e.target.value})}
                    placeholder="Taller o técnico responsable"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                  <textarea
                    rows={3}
                    value={maintenanceForm.observations}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, observations: e.target.value})}
                    placeholder="Observaciones adicionales..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowMaintenanceModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleMaintenanceSave}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Wrench className="h-5 w-5" />
                    <span>{isLoading ? 'Registrando...' : 'Registrar Mantenimiento'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Machinery;