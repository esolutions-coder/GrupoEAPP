import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Plus, Search, Filter, Edit, Trash2, Eye, Phone, Mail, MapPin,
  Calendar, Award, AlertCircle, CheckCircle, Download, FileText, Shield,
  User, Building2, Clock, Settings, X, Upload
} from 'lucide-react';
import { Worker } from '../../types/construction';
import { supabase } from '../../lib/supabase';
import { exportToPDF, exportToExcel, printTable, formatDataForExport, getExportHeaders, parseExcelFile } from '../../utils/exportUtils';
import { handleCRUDOperation, showConfirmation, showSuccessNotification, showErrorNotification, confirmationConfigs } from '../../utils/modalUtils';
import CrewsManagement from './CrewsManagement';

const WorkersModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workers' | 'crews'>('workers');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    workerCode: '',
    firstName: '',
    lastName: '',
    dni: '',
    dniExpiryDate: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    emergencyContact: '',
    emergencyPhone: '',
    hasDriverLicense: false,
    hasOwnVehicle: false,
    category: 'Peón' as const,
    prlType: '',
    prlTraining: [] as string[],
    prlExpiryDate: '',
    medicalCheckDate: '',
    medicalCheckExpiry: '',
    epiDeliveryDate: '',
    contractType: 'hourly' as const,
    hourlyRate: 0,
    overtimeRate: 0,
    hireDate: '',
    vacationTotalDays: 30,
    vacationUsedDays: 0,
    vacationPendingDays: 0,
    contractSigned: false,
    bankAccount: '',
    digitalAccessUsername: '',
    digitalAccessPassword: '',
    status: 'active' as const
  });

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedWorkers: Worker[] = (data || []).map((w: any) => ({
        id: w.id,
        workerCode: w.worker_code,
        personalData: {
          firstName: w.first_name,
          lastName: w.last_name,
          dni: w.dni,
          dniExpiryDate: w.dni_expiry_date,
          address: w.address || '',
          city: w.city || '',
          postalCode: w.postal_code || '',
          phone: w.phone || '',
          email: w.email || '',
          emergencyContact: w.emergency_contact || '',
          emergencyPhone: w.emergency_phone || '',
          hasDriverLicense: w.has_driver_license,
          hasOwnVehicle: w.has_own_vehicle
        },
        professionalData: {
          category: w.category,
          prlType: w.prl_type || '',
          prlTraining: Array.isArray(w.prl_training) ? w.prl_training : [],
          prlExpiryDate: w.prl_expiry_date || '',
          medicalCheckDate: w.medical_check_date || '',
          medicalCheckExpiry: w.medical_check_expiry || '',
          epiDeliveryDate: w.epi_delivery_date || ''
        },
        contract: {
          type: w.contract_type,
          hourlyRate: w.hourly_rate,
          monthlyRate: w.monthly_rate,
          overtimeRate: w.overtime_rate,
          hireDate: w.hire_date,
          terminationDate: w.termination_date
        },
        vacations: {
          totalDays: w.vacation_total_days || 30,
          usedDays: w.vacation_used_days || 0,
          pendingDays: w.vacation_pending_days || 0,
          remainingDays: (w.vacation_total_days || 30) - (w.vacation_used_days || 0) - (w.vacation_pending_days || 0),
          year: w.vacation_year || new Date().getFullYear()
        },
        documents: {
          dniExpiry: w.dni_expiry_date || '',
          contractSigned: w.contract_signed || false,
          bankAccount: w.bank_account || '',
          digitalAccess: w.digital_access_username ? {
            username: w.digital_access_username,
            password: w.digital_access_password || '',
            hasAccess: w.digital_access_has_access || false,
            lastLogin: w.digital_access_last_login || ''
          } : undefined
        },
        status: w.status,
        workHistory: []
      }));

      setWorkers(transformedWorkers);
    } catch (error) {
      console.error('Error loading workers:', error);
      alert('Error al cargar operarios');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      workerCode: '',
      firstName: '',
      lastName: '',
      dni: '',
      dniExpiryDate: '',
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      email: '',
      emergencyContact: '',
      emergencyPhone: '',
      hasDriverLicense: false,
      hasOwnVehicle: false,
      category: 'Peón',
      prlType: '',
      prlTraining: [],
      prlExpiryDate: '',
      medicalCheckDate: '',
      medicalCheckExpiry: '',
      epiDeliveryDate: '',
      contractType: 'hourly',
      hourlyRate: 0,
      overtimeRate: 0,
      hireDate: '',
      vacationTotalDays: 30,
      vacationUsedDays: 0,
      vacationPendingDays: 0,
      contractSigned: false,
      bankAccount: '',
      digitalAccessUsername: '',
      digitalAccessPassword: '',
      status: 'active'
    });
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('workers')
        .insert([{
          worker_code: formData.workerCode,
          first_name: formData.firstName,
          last_name: formData.lastName,
          dni: formData.dni,
          dni_expiry_date: formData.dniExpiryDate || null,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          phone: formData.phone,
          email: formData.email,
          emergency_contact: formData.emergencyContact,
          emergency_phone: formData.emergencyPhone,
          has_driver_license: formData.hasDriverLicense,
          has_own_vehicle: formData.hasOwnVehicle,
          category: formData.category,
          prl_type: formData.prlType,
          prl_training: formData.prlTraining,
          prl_expiry_date: formData.prlExpiryDate || null,
          medical_check_date: formData.medicalCheckDate || null,
          medical_check_expiry: formData.medicalCheckExpiry || null,
          epi_delivery_date: formData.epiDeliveryDate || null,
          contract_type: formData.contractType,
          hourly_rate: formData.hourlyRate,
          overtime_rate: formData.overtimeRate,
          hire_date: formData.hireDate,
          vacation_total_days: formData.vacationTotalDays,
          vacation_used_days: formData.vacationUsedDays,
          vacation_pending_days: formData.vacationPendingDays,
          contract_signed: formData.contractSigned,
          bank_account: formData.bankAccount,
          digital_access_username: formData.digitalAccessUsername,
          digital_access_password: formData.digitalAccessPassword,
          status: formData.status
        }]);

      if (error) throw error;

      alert('Operario creado exitosamente');
      setShowCreateModal(false);
      resetForm();
      loadWorkers();
    } catch (error: any) {
      console.error('Error creating worker:', error);
      alert(`Error al crear operario: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('workers')
        .update({
          worker_code: formData.workerCode,
          first_name: formData.firstName,
          last_name: formData.lastName,
          dni: formData.dni,
          dni_expiry_date: formData.dniExpiryDate || null,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          phone: formData.phone,
          email: formData.email,
          emergency_contact: formData.emergencyContact,
          emergency_phone: formData.emergencyPhone,
          has_driver_license: formData.hasDriverLicense,
          has_own_vehicle: formData.hasOwnVehicle,
          category: formData.category,
          prl_type: formData.prlType,
          prl_training: formData.prlTraining,
          prl_expiry_date: formData.prlExpiryDate || null,
          medical_check_date: formData.medicalCheckDate || null,
          medical_check_expiry: formData.medicalCheckExpiry || null,
          epi_delivery_date: formData.epiDeliveryDate || null,
          contract_type: formData.contractType,
          hourly_rate: formData.hourlyRate,
          overtime_rate: formData.overtimeRate,
          hire_date: formData.hireDate,
          vacation_total_days: formData.vacationTotalDays,
          vacation_used_days: formData.vacationUsedDays,
          vacation_pending_days: formData.vacationPendingDays,
          contract_signed: formData.contractSigned,
          bank_account: formData.bankAccount,
          digital_access_username: formData.digitalAccessUsername,
          digital_access_password: formData.digitalAccessPassword,
          status: formData.status
        })
        .eq('id', selectedWorker.id);

      if (error) throw error;

      alert('Operario actualizado exitosamente');
      setShowEditModal(false);
      resetForm();
      loadWorkers();
    } catch (error: any) {
      console.error('Error updating worker:', error);
      alert(`Error al actualizar operario: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorker = async (worker: Worker) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar a ${worker.personalData.firstName} ${worker.personalData.lastName}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', worker.id);

      if (error) throw error;

      alert('Operario eliminado exitosamente');
      loadWorkers();
    } catch (error: any) {
      console.error('Error deleting worker:', error);
      alert(`Error al eliminar operario: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWorkers = workers.filter(worker => {
    const fullName = `${worker.personalData.firstName} ${worker.personalData.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         worker.workerCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.personalData.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || worker.professionalData.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || worker.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = [
    { label: 'Total Operarios', value: workers.length.toString(), icon: Users, color: 'text-blue-600' },
    { label: 'Activos', value: workers.filter(w => w.status === 'active').length.toString(), icon: CheckCircle, color: 'text-green-600' },
    { label: 'De Vacaciones', value: workers.filter(w => w.status === 'vacation').length.toString(), icon: Calendar, color: 'text-yellow-600' },
    { label: 'Bajas Médicas', value: workers.filter(w => w.status === 'sick').length.toString(), icon: AlertCircle, color: 'text-red-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'vacation': return 'bg-yellow-100 text-yellow-800';
      case 'sick': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'vacation': return 'Vacaciones';
      case 'sick': return 'Baja Médica';
      case 'inactive': return 'Inactivo';
      default: return status;
    }
  };

  const handleView = (worker: Worker) => {
    setSelectedWorker(worker);
    setShowViewModal(true);
  };

  const handleEdit = (worker: Worker) => {
    setSelectedWorker(worker);
    setFormData({
      workerCode: worker.workerCode,
      firstName: worker.personalData.firstName,
      lastName: worker.personalData.lastName,
      dni: worker.personalData.dni,
      dniExpiryDate: worker.personalData.dniExpiryDate,
      address: worker.personalData.address,
      city: worker.personalData.city,
      postalCode: worker.personalData.postalCode,
      phone: worker.personalData.phone,
      email: worker.personalData.email,
      emergencyContact: worker.personalData.emergencyContact,
      emergencyPhone: worker.personalData.emergencyPhone,
      hasDriverLicense: worker.personalData.hasDriverLicense,
      hasOwnVehicle: worker.personalData.hasOwnVehicle,
      category: worker.professionalData.category,
      prlType: worker.professionalData.prlType,
      prlTraining: worker.professionalData.prlTraining,
      prlExpiryDate: worker.professionalData.prlExpiryDate,
      medicalCheckDate: worker.professionalData.medicalCheckDate,
      medicalCheckExpiry: worker.professionalData.medicalCheckExpiry,
      epiDeliveryDate: worker.professionalData.epiDeliveryDate,
      contractType: worker.contract.type,
      hourlyRate: worker.contract.hourlyRate || 0,
      overtimeRate: worker.contract.overtimeRate || 0,
      hireDate: worker.contract.hireDate,
      vacationTotalDays: worker.vacations.totalDays,
      vacationUsedDays: worker.vacations.usedDays,
      vacationPendingDays: worker.vacations.pendingDays,
      contractSigned: worker.documents.contractSigned,
      bankAccount: worker.documents.bankAccount,
      digitalAccessUsername: worker.documents.digitalAccess?.username || '',
      digitalAccessPassword: worker.documents.digitalAccess?.password || '',
      status: worker.status
    });
    setShowEditModal(true);
  };

  const handleCreate = () => {
    setSelectedWorker(null);
    resetForm();
    setShowCreateModal(true);
  };

  const handleExportPDF = async () => {
    setIsLoading(true);
    try {
      const exportData = {
        title: 'Listado de Operarios - Grupo EA',
        headers: getExportHeaders('workers'),
        data: formatDataForExport(filteredWorkers, 'workers'),
        filename: `operarios_${new Date().toISOString().split('T')[0]}`
      };
      
      const result = exportToPDF(exportData);
      if (result.success) {
        showSuccessNotification('PDF generado correctamente');
      } else {
        showErrorNotification(result.message);
      }
    } catch (error) {
      showErrorNotification('Error al generar PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setIsLoading(true);
    try {
      const exportData = {
        title: 'Listado de Operarios - Grupo EA',
        headers: getExportHeaders('workers'),
        data: formatDataForExport(filteredWorkers, 'workers'),
        filename: `operarios_${new Date().toISOString().split('T')[0]}`
      };
      
      const result = exportToExcel(exportData);
      if (result.success) {
        showSuccessNotification('Excel generado correctamente');
      } else {
        showErrorNotification(result.message);
      }
    } catch (error) {
      showErrorNotification('Error al generar Excel');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const exportData = {
      title: 'Listado de Operarios - Grupo EA',
      headers: getExportHeaders('workers'),
      data: formatDataForExport(filteredWorkers, 'workers'),
      filename: `operarios_${new Date().toISOString().split('T')[0]}`
    };
    printTable(exportData);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setIsLoading(true);

    try {
      const result = await parseExcelFile(file);

      if (result.success && result.data) {
        setImportPreview(result.data);
        if (result.errors && result.errors.length > 0) {
          alert(`Advertencias:\n${result.errors.join('\n')}`);
        }
      } else {
        alert(result.message);
        setImportFile(null);
      }
    } catch (error) {
      alert('Error al leer el archivo');
      setImportFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportWorkers = async () => {
    if (!importPreview || importPreview.length === 0) {
      alert('No hay datos para importar');
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      for (const row of importPreview) {
        try {
          const workerData = {
            worker_code: row['Código'] || row['Codigo'] || `OP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            first_name: row['Nombre'] || '',
            last_name: row['Apellidos'] || '',
            dni: row['DNI'] || row['DNI/NIE'] || '',
            dni_expiry_date: row['Fecha Caducidad DNI'] || null,
            phone: row['Teléfono'] || row['Telefono'] || '',
            email: row['Email'] || '',
            city: row['Ciudad'] || '',
            postal_code: row['Código Postal'] || row['Codigo Postal'] || '',
            category: row['Categoría'] || row['Categoria'] || 'Peón',
            prl_type: row['Tipo PRL'] || '',
            prl_expiry_date: row['Fecha Vencimiento PRL'] || null,
            medical_check_date: row['Reconocimiento Médico'] || row['Reconocimiento Medico'] || null,
            contract_type: (row['Tipo Contrato'] || 'hourly') === 'Por Horas' ? 'hourly' : 'monthly',
            hourly_rate: parseFloat(row['Tarifa por Hora'] || row['Tarifa/Hora'] || '0'),
            overtime_rate: parseFloat(row['Tarifa Extra'] || '0'),
            hire_date: row['Fecha Alta'] || new Date().toISOString().split('T')[0],
            bank_account: row['Cuenta Bancaria'] || '',
            status: row['Estado'] === 'Activo' || row['Estado'] === 'active' ? 'active' : 'inactive'
          };

          const { error } = await supabase
            .from('workers')
            .insert([workerData]);

          if (error) {
            errorCount++;
            errors.push(`${row['Nombre']} ${row['Apellidos']}: ${error.message}`);
          } else {
            successCount++;
          }
        } catch (err: any) {
          errorCount++;
          errors.push(`${row['Nombre']} ${row['Apellidos']}: ${err.message || 'Error desconocido'}`);
        }
      }

      let message = `Importación completada:\n${successCount} operarios importados correctamente`;
      if (errorCount > 0) {
        message += `\n${errorCount} errores encontrados`;
        if (errors.length > 0) {
          message += `\n\nPrimeros errores:\n${errors.slice(0, 5).join('\n')}`;
        }
      }

      alert(message);
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview([]);
      loadWorkers();
    } catch (error: any) {
      alert(`Error durante la importación: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = {
      title: 'Plantilla de Importación - Operarios',
      headers: ['Código', 'Nombre', 'Apellidos', 'DNI/NIE', 'Fecha Caducidad DNI', 'Teléfono', 'Email', 'Ciudad', 'Código Postal', 'Categoría', 'Tipo PRL', 'Fecha Vencimiento PRL', 'Reconocimiento Médico', 'Tipo Contrato', 'Tarifa por Hora', 'Tarifa Extra', 'Fecha Alta', 'Cuenta Bancaria', 'Estado'],
      data: [
        ['OP-001', 'Juan', 'García', '12345678A', '2030-12-31', '+34 666 123 456', 'juan@email.com', 'Valencia', '46001', 'Oficial', 'PRL 20 Horas', '2025-06-15', '2024-01-15', 'Por Horas', '18.50', '27.75', '2023-01-15', 'ES76 2100 0813 1234 5678 9012', 'Activo']
      ],
      filename: 'plantilla_operarios'
    };
    exportToExcel(templateData);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Operarios</h2>
          <p className="text-gray-600">Administra el personal y sus asignaciones</p>
        </div>
        {activeTab === 'workers' && (
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isLoading}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{isLoading ? 'Generando...' : 'PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              disabled={isLoading}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Excel</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Importar</span>
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Operario</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('workers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'workers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>Operarios</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('crews')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'crews'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Cuadrillas Destajistas</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'crews' ? (
        <CrewsManagement />
      ) : (
        <>
          {/* Rest of the workers content */}

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
                placeholder="Nombre, código, email..."
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
              <option value="Oficial">Oficial</option>
              <option value="Ayudante">Ayudante</option>
              <option value="Peón">Peón</option>
              <option value="Maquinista">Maquinista</option>
              <option value="Especialista">Especialista</option>
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
              <option value="vacation">Vacaciones</option>
              <option value="sick">Baja médica</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proyecto</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los proyectos</option>
              <option value="1">Autopista A-7 Valencia</option>
              <option value="2">Edificio Residencial Marina</option>
              <option value="3">Polígono Industrial Norte</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Lista de Operarios ({filteredWorkers.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table id="workers-table" className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PRL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contrato
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
              {filteredWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-corporate-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-corporate-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {worker.personalData.firstName} {worker.personalData.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {worker.workerCode} • DNI: {worker.personalData.dni}
                        </div>
                        <div className="text-xs text-gray-400">
                          Desde: {new Date(worker.contract.hireDate).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{worker.professionalData.category}</div>
                    <div className="text-sm text-gray-500">
                      €{worker.contract.hourlyRate}/hora
                    </div>
                    <div className="text-xs text-gray-400">
                      Extra: €{worker.contract.overtimeRate}/h
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-1 mb-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{worker.personalData.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1 mb-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span className="truncate">{worker.personalData.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{worker.personalData.city}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{worker.professionalData.prlType}</div>
                    <div className="text-sm text-gray-500">
                      Vence: {new Date(worker.professionalData.prlExpiryDate).toLocaleDateString('es-ES')}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {worker.professionalData.prlTraining.slice(0, 2).map((training, index) => (
                        <span key={index} className="px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                          {training}
                        </span>
                      ))}
                      {worker.professionalData.prlTraining.length > 2 && (
                        <span className="px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          +{worker.professionalData.prlTraining.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {worker.contract.type === 'hourly' ? 'Por Horas' : 'Mensual'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Cuenta: {worker.documents.bankAccount.slice(-4)}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      {worker.documents.digitalAccess?.hasAccess ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                      <span className="text-xs text-gray-500">
                        {worker.documents.digitalAccess?.hasAccess ? 'Acceso Digital' : 'Sin Acceso'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(worker.status)}`}>
                      {getStatusLabel(worker.status)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Vacaciones: {worker.vacations.remainingDays}/{worker.vacations.totalDays}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button type="button" onClick={() => handleView(worker)}
                        className="text-corporate-blue-600 hover:text-corporate-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleEdit(worker)}
                        className="text-green-600 hover:text-green-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDeleteWorker(worker)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Worker Modal */}
      {showViewModal && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedWorker.personalData.firstName} {selectedWorker.personalData.lastName}
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Código:</strong> {selectedWorker.workerCode}</div>
                    <div><strong>DNI:</strong> {selectedWorker.personalData.dni}</div>
                    <div><strong>Teléfono:</strong> {selectedWorker.personalData.phone}</div>
                    <div><strong>Email:</strong> {selectedWorker.personalData.email}</div>
                    <div><strong>Dirección:</strong> {selectedWorker.personalData.address}</div>
                    <div><strong>Ciudad:</strong> {selectedWorker.personalData.city}</div>
                    <div><strong>Contacto Emergencia:</strong> {selectedWorker.personalData.emergencyContact}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Profesional</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Categoría:</strong> {selectedWorker.professionalData.category}</div>
                    <div><strong>PRL:</strong> {selectedWorker.professionalData.prlType}</div>
                    <div><strong>Tarifa/Hora:</strong> €{selectedWorker.contract.hourlyRate}</div>
                    <div><strong>Fecha Alta:</strong> {new Date(selectedWorker.contract.hireDate).toLocaleDateString('es-ES')}</div>
                    <div><strong>Estado:</strong> {getStatusLabel(selectedWorker.status)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Worker Modal */}
      {showEditModal && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Editar Operario</h2>
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateWorker} className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Personales</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                      <input
                        type="text"
                        required
                        value={formData.workerCode}
                        onChange={(e) => setFormData({...formData, workerCode: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Activo</option>
                        <option value="vacation">Vacaciones</option>
                        <option value="sick">Baja médica</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DNI/NIE *</label>
                      <input
                        type="text"
                        required
                        value={formData.dni}
                        onChange={(e) => setFormData({...formData, dni: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Caducidad DNI</label>
                      <input
                        type="date"
                        value={formData.dniExpiryDate}
                        onChange={(e) => setFormData({...formData, dniExpiryDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Profesionales</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Peón">Peón</option>
                        <option value="Ayudante">Ayudante</option>
                        <option value="Oficial">Oficial</option>
                        <option value="Maquinista">Maquinista</option>
                        <option value="Especialista">Especialista</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo PRL</label>
                      <input
                        type="text"
                        value={formData.prlType}
                        onChange={(e) => setFormData({...formData, prlType: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="PRL 20 Horas"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Vencimiento PRL</label>
                      <input
                        type="date"
                        value={formData.prlExpiryDate}
                        onChange={(e) => setFormData({...formData, prlExpiryDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reconocimiento Médico</label>
                      <input
                        type="date"
                        value={formData.medicalCheckDate}
                        onChange={(e) => setFormData({...formData, medicalCheckDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Contrato</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Contrato *</label>
                      <select
                        required
                        value={formData.contractType}
                        onChange={(e) => setFormData({...formData, contractType: e.target.value as any})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="hourly">Por Horas</option>
                        <option value="monthly">Mensual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa por Hora (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa Extra (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.overtimeRate}
                        onChange={(e) => setFormData({...formData, overtimeRate: parseFloat(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Alta *</label>
                      <input
                        type="date"
                        required
                        value={formData.hireDate}
                        onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta Bancaria (IBAN)</label>
                      <input
                        type="text"
                        value={formData.bankAccount}
                        onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="ES00 0000 0000 0000 0000 0000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-6 border-t mt-6">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Worker Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Nuevo Operario</h2>
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateWorker} className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Personales</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                      <input
                        type="text"
                        required
                        value={formData.workerCode}
                        onChange={(e) => setFormData({...formData, workerCode: e.target.value})}
                        placeholder="OP-001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="active">Activo</option>
                        <option value="vacation">Vacaciones</option>
                        <option value="sick">Baja médica</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DNI/NIE *</label>
                      <input
                        type="text"
                        required
                        value={formData.dni}
                        onChange={(e) => setFormData({...formData, dni: e.target.value})}
                        placeholder="12345678A"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Caducidad DNI</label>
                      <input
                        type="date"
                        value={formData.dniExpiryDate}
                        onChange={(e) => setFormData({...formData, dniExpiryDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+34 600 000 000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="operario@grupoea.es"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Profesionales</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Peón">Peón</option>
                        <option value="Ayudante">Ayudante</option>
                        <option value="Oficial">Oficial</option>
                        <option value="Maquinista">Maquinista</option>
                        <option value="Especialista">Especialista</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo PRL</label>
                      <input
                        type="text"
                        value={formData.prlType}
                        onChange={(e) => setFormData({...formData, prlType: e.target.value})}
                        placeholder="PRL 20 Horas"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Vencimiento PRL</label>
                      <input
                        type="date"
                        value={formData.prlExpiryDate}
                        onChange={(e) => setFormData({...formData, prlExpiryDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reconocimiento Médico</label>
                      <input
                        type="date"
                        value={formData.medicalCheckDate}
                        onChange={(e) => setFormData({...formData, medicalCheckDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Datos Contrato</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Contrato *</label>
                      <select
                        required
                        value={formData.contractType}
                        onChange={(e) => setFormData({...formData, contractType: e.target.value as any})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="hourly">Por Horas</option>
                        <option value="monthly">Mensual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa por Hora (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({...formData, hourlyRate: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa Extra (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.overtimeRate}
                        onChange={(e) => setFormData({...formData, overtimeRate: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Alta *</label>
                      <input
                        type="date"
                        required
                        value={formData.hireDate}
                        onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta Bancaria (IBAN)</label>
                      <input
                        type="text"
                        value={formData.bankAccount}
                        onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                        placeholder="ES00 0000 0000 0000 0000 0000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-6 border-t mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  {isLoading ? 'Creando...' : 'Crear Operario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Workers Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Importar Operarios desde Excel</h2>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportPreview([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Instrucciones</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  <li>Descarga la plantilla de Excel haciendo clic en el botón inferior</li>
                  <li>Completa la plantilla con los datos de tus operarios</li>
                  <li>Guarda el archivo como CSV (delimitado por punto y coma)</li>
                  <li>Selecciona el archivo y haz clic en "Importar"</li>
                </ol>
              </div>

              <div className="mb-6">
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center space-x-2 text-gray-700"
                >
                  <Download className="h-5 w-5" />
                  <span>Descargar Plantilla Excel</span>
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar archivo CSV
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {importPreview.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Vista Previa ({importPreview.length} registros)
                  </h3>
                  <div className="max-h-64 overflow-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left">Código</th>
                          <th className="px-4 py-2 text-left">Nombre</th>
                          <th className="px-4 py-2 text-left">Apellidos</th>
                          <th className="px-4 py-2 text-left">DNI</th>
                          <th className="px-4 py-2 text-left">Categoría</th>
                          <th className="px-4 py-2 text-left">Email</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {importPreview.slice(0, 10).map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2">{row['Código'] || row['Codigo'] || '-'}</td>
                            <td className="px-4 py-2">{row['Nombre'] || '-'}</td>
                            <td className="px-4 py-2">{row['Apellidos'] || '-'}</td>
                            <td className="px-4 py-2">{row['DNI'] || row['DNI/NIE'] || '-'}</td>
                            <td className="px-4 py-2">{row['Categoría'] || row['Categoria'] || '-'}</td>
                            <td className="px-4 py-2">{row['Email'] || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importPreview.length > 10 && (
                      <div className="p-2 text-center text-sm text-gray-500 bg-gray-50">
                        ... y {importPreview.length - 10} registros más
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportPreview([]);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleImportWorkers}
                  disabled={isLoading || importPreview.length === 0}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Importando...' : `Importar ${importPreview.length} Operarios`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default WorkersModule;