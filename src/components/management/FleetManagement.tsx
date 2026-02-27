import React, { useState, useEffect } from 'react';
import {
  Truck, Construction, FileText, Wrench, AlertTriangle, BarChart3,
  Plus, Search, Filter, Download, Eye, Edit, Trash2, CheckCircle, X,
  Save, RefreshCw, Calendar, DollarSign, Users, Package, Clock, TrendingUp,
  Calculator, Building
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatUtils';
import { showSuccessNotification, showErrorNotification } from '../../utils/modalUtils';
import * as XLSX from 'xlsx';
import MachineryProfitabilityModule from './MachineryProfitabilityModule';
import SupplierPaymentsModule from './SupplierPaymentsModule';
import type {
  Machinery,
  FleetVehicle,
  MachineryMaintenance,
  VehicleMaintenance,
  VehicleAlert,
  FleetDashboardKPI,
  MachineryFormData,
  VehicleFormData
} from '../../types/fleet';

const FleetManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [machinery, setMachinery] = useState<Machinery[]>([]);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [machineryMaintenance, setMachineryMaintenance] = useState<MachineryMaintenance[]>([]);
  const [vehicleMaintenance, setVehicleMaintenance] = useState<VehicleMaintenance[]>([]);
  const [alerts, setAlerts] = useState<VehicleAlert[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [kpis, setKpis] = useState<FleetDashboardKPI>({
    total_machinery: 0,
    active_machinery: 0,
    maintenance_machinery: 0,
    total_vehicles: 0,
    active_vehicles: 0,
    pending_alerts: 0,
    total_daily_reports: 0,
    monthly_machinery_cost: 0,
    monthly_vehicle_cost: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);

      const [
        machineryRes,
        vehiclesRes,
        machineryMaintenanceRes,
        vehicleMaintenanceRes,
        alertsRes,
        workersRes,
        projectsRes,
        suppliersRes
      ] = await Promise.all([
        supabase.from('machinery').select('*').order('name'),
        supabase.from('fleet_vehicles').select('*').order('license_plate'),
        supabase.from('machinery_maintenance')
          .select('*, machinery(*)')
          .order('maintenance_date', { ascending: false }),
        supabase.from('vehicle_maintenance')
          .select('*, fleet_vehicles(*)')
          .order('maintenance_date', { ascending: false }),
        supabase.from('vehicle_alerts')
          .select('*, fleet_vehicles(*), workers(*)')
          .eq('status', 'pending')
          .order('alert_date', { ascending: false }),
        supabase.from('workers').select('id, first_name, last_name').order('first_name'),
        supabase.from('projects').select('id, name, code').eq('status', 'active').order('name'),
        supabase.from('suppliers').select('id, commercial_name').eq('status', 'active').order('commercial_name')
      ]);

      if (machineryRes.data) setMachinery(machineryRes.data);
      if (vehiclesRes.data) setVehicles(vehiclesRes.data);
      if (machineryMaintenanceRes.data) setMachineryMaintenance(machineryMaintenanceRes.data);
      if (vehicleMaintenanceRes.data) setVehicleMaintenance(vehicleMaintenanceRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
      if (workersRes.data) setWorkers(workersRes.data);
      if (projectsRes.data) setProjects(projectsRes.data);
      if (suppliersRes.data) setSuppliers(suppliersRes.data);

      calculateKPIs(
        machineryRes.data || [],
        vehiclesRes.data || [],
        machineryMaintenanceRes.data || [],
        vehicleMaintenanceRes.data || [],
        alertsRes.data || []
      );
    } catch (error: any) {
      showErrorNotification('Error al cargar datos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateKPIs = (
    machinery: Machinery[],
    vehicles: FleetVehicle[],
    machineryMaint: MachineryMaintenance[],
    vehicleMaint: VehicleMaintenance[],
    alerts: VehicleAlert[]
  ) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthlyMachineryCost = machineryMaint
      .filter(m => new Date(m.maintenance_date) >= firstDayOfMonth)
      .reduce((sum, m) => sum + Number(m.cost || 0), 0);

    const monthlyVehicleCost = vehicleMaint
      .filter(m => new Date(m.maintenance_date) >= firstDayOfMonth)
      .reduce((sum, m) => sum + Number(m.cost || 0), 0);

    setKpis({
      total_machinery: machinery.length,
      active_machinery: machinery.filter(m => m.status === 'active').length,
      maintenance_machinery: machinery.filter(m => m.status === 'maintenance').length,
      total_vehicles: vehicles.length,
      active_vehicles: vehicles.filter(v => v.status === 'active').length,
      pending_alerts: alerts.length,
      total_daily_reports: 0,
      monthly_machinery_cost: monthlyMachineryCost,
      monthly_vehicle_cost: monthlyVehicleCost
    });
  };

  const openModal = (type: string, item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item || getEmptyFormData(type));
    setShowModal(true);
  };

  const getEmptyFormData = (type: string) => {
    switch (type) {
      case 'machinery':
        return {
          machinery_code: '',
          name: '',
          category: 'excavator',
          brand: '',
          model: '',
          serial_number: '',
          license_plate: '',
          purchase_date: '',
          purchase_price: 0,
          current_value: 0,
          hourly_cost: 0,
          status: 'active',
          location: '',
          requires_operator_license: false,
          fuel_type: 'diesel',
          fuel_capacity: 0,
          max_hours_before_maintenance: 250,
          ownership_type: 'owned',
          supplier_id: '',
          monthly_rental_cost: 0,
          rental_start_date: '',
          rental_end_date: '',
          operator_monthly_cost: 0,
          insurance_monthly_cost: 0,
          maintenance_monthly_budget: 0,
          notes: ''
        };
      case 'vehicle':
        return {
          vehicle_code: '',
          license_plate: '',
          vehicle_type: 'van',
          brand: '',
          model: '',
          year: new Date().getFullYear(),
          fuel_type: 'diesel',
          fuel_capacity: 0,
          purchase_date: '',
          purchase_price: 0,
          status: 'active',
          assigned_to_worker_id: '',
          monthly_km_limit: 2000,
          insurance_company: '',
          insurance_policy: '',
          insurance_expiry: '',
          itv_expiry: '',
          notes: ''
        };
      case 'machinery_maintenance':
        return {
          machinery_id: '',
          maintenance_date: new Date().toISOString().split('T')[0],
          maintenance_type: 'preventive',
          description: '',
          hours_at_maintenance: 0,
          cost: 0,
          performed_by: '',
          next_maintenance_date: '',
          next_maintenance_hours: 0,
          downtime_hours: 0,
          parts_replaced: '',
          notes: ''
        };
      case 'vehicle_maintenance':
        return {
          vehicle_id: '',
          maintenance_date: new Date().toISOString().split('T')[0],
          maintenance_type: 'oil_change',
          description: '',
          odometer_at_maintenance: 0,
          cost: 0,
          workshop: '',
          invoice_number: '',
          next_maintenance_date: '',
          next_maintenance_km: 0,
          parts_replaced: '',
          notes: ''
        };
      default:
        return {};
    }
  };

  const handleSave = async () => {
    try {
      let data: any = { ...formData };
      let table = '';

      switch (modalType) {
        case 'machinery':
          table = 'machinery';
          data.purchase_price = data.purchase_price ? Number(data.purchase_price) : null;
          data.current_value = data.current_value ? Number(data.current_value) : null;
          data.hourly_cost = Number(data.hourly_cost);
          data.fuel_capacity = data.fuel_capacity ? Number(data.fuel_capacity) : null;
          data.max_hours_before_maintenance = Number(data.max_hours_before_maintenance);
          data.monthly_rental_cost = data.monthly_rental_cost ? Number(data.monthly_rental_cost) : 0;
          data.operator_monthly_cost = data.operator_monthly_cost ? Number(data.operator_monthly_cost) : 0;
          data.insurance_monthly_cost = data.insurance_monthly_cost ? Number(data.insurance_monthly_cost) : 0;
          data.maintenance_monthly_budget = data.maintenance_monthly_budget ? Number(data.maintenance_monthly_budget) : 0;
          data.supplier_id = data.supplier_id || null;
          if (!editingItem) data.current_hours = 0;
          break;
        case 'vehicle':
          table = 'fleet_vehicles';
          data.year = data.year ? Number(data.year) : null;
          data.fuel_capacity = data.fuel_capacity ? Number(data.fuel_capacity) : null;
          data.purchase_price = data.purchase_price ? Number(data.purchase_price) : null;
          data.monthly_km_limit = Number(data.monthly_km_limit);
          data.assigned_to_worker_id = data.assigned_to_worker_id || null;
          if (!editingItem) data.current_odometer = 0;
          break;
        case 'machinery_maintenance':
          table = 'machinery_maintenance';
          data.hours_at_maintenance = data.hours_at_maintenance ? Number(data.hours_at_maintenance) : null;
          data.cost = data.cost ? Number(data.cost) : null;
          data.next_maintenance_hours = data.next_maintenance_hours ? Number(data.next_maintenance_hours) : null;
          data.downtime_hours = data.downtime_hours ? Number(data.downtime_hours) : null;
          break;
        case 'vehicle_maintenance':
          table = 'vehicle_maintenance';
          data.odometer_at_maintenance = data.odometer_at_maintenance ? Number(data.odometer_at_maintenance) : null;
          data.cost = data.cost ? Number(data.cost) : null;
          data.next_maintenance_km = data.next_maintenance_km ? Number(data.next_maintenance_km) : null;
          break;
      }

      if (editingItem) {
        const { error } = await supabase.from(table).update(data).eq('id', editingItem.id);
        if (error) throw error;
        showSuccessNotification('Registro actualizado correctamente');
      } else {
        const { error } = await supabase.from(table).insert([data]);
        if (error) throw error;
        showSuccessNotification('Registro creado correctamente');
      }

      setShowModal(false);
      setEditingItem(null);
      setFormData({});
      loadAllData();
    } catch (error: any) {
      showErrorNotification(error.message);
    }
  };

  const handleDelete = async (table: string, id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      showSuccessNotification('Registro eliminado correctamente');
      loadAllData();
    } catch (error: any) {
      showErrorNotification(error.message);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('vehicle_alerts')
        .update({
          status: 'resolved',
          reviewed_by: 'Admin',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
      showSuccessNotification('Alerta resuelta correctamente');
      loadAllData();
    } catch (error: any) {
      showErrorNotification(error.message);
    }
  };

  const exportToExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'machinery', label: 'Maquinaria', icon: Construction },
    { id: 'vehicles', label: 'Vehículos', icon: Truck },
    { id: 'machinery_maintenance', label: 'Mant. Maquinaria', icon: Wrench },
    { id: 'vehicle_maintenance', label: 'Mant. Vehículos', icon: Wrench },
    { id: 'profitability', label: 'Rentabilidad', icon: Calculator },
    { id: 'suppliers', label: 'Proveedores', icon: Building },
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle }
  ];

  const filtered = {
    machinery: machinery.filter(m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.machinery_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    vehicles: vehicles.filter(v =>
      v.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vehicle_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    machineryMaintenance: machineryMaintenance.filter(m =>
      m.description.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    vehicleMaintenance: vehicleMaintenance.filter(m =>
      m.description.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    alerts: alerts.filter(a =>
      a.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Flota y Maquinaria</h1>
          <p className="mt-2 text-gray-600">Control integrado de maquinaria, vehículos y producción</p>
        </div>
        <button
          onClick={loadAllData}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                className={`
                  group inline-flex items-center py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'dashboard' && (
        <DashboardView kpis={kpis} machinery={machinery} vehicles={vehicles} alerts={alerts} setActiveTab={setActiveTab} />
      )}

      {activeTab === 'machinery' && (
        <GenericTable
          title="Maquinaria"
          data={filtered.machinery}
          onAdd={() => openModal('machinery')}
          onEdit={(item) => openModal('machinery', item)}
          onDelete={(id) => handleDelete('machinery', id)}
          onExport={() => exportToExcel(machinery, 'maquinaria')}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          columns={[
            { key: 'machinery_code', label: 'Código', icon: Package },
            { key: 'name', label: 'Nombre' },
            { key: 'category', label: 'Categoría' },
            { key: 'brand', label: 'Marca' },
            { key: 'model', label: 'Modelo' },
            { key: 'current_hours', label: 'Horas' },
            { key: 'hourly_cost', label: 'Coste/Hora', type: 'currency' },
            { key: 'status', label: 'Estado', type: 'status' }
          ]}
        />
      )}

      {activeTab === 'vehicles' && (
        <GenericTable
          title="Vehículos"
          data={filtered.vehicles}
          onAdd={() => openModal('vehicle')}
          onEdit={(item) => openModal('vehicle', item)}
          onDelete={(id) => handleDelete('fleet_vehicles', id)}
          onExport={() => exportToExcel(vehicles, 'vehiculos')}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          columns={[
            { key: 'license_plate', label: 'Matrícula', icon: Truck },
            { key: 'vehicle_code', label: 'Código' },
            { key: 'vehicle_type', label: 'Tipo' },
            { key: 'brand', label: 'Marca' },
            { key: 'model', label: 'Modelo' },
            { key: 'current_odometer', label: 'Km' },
            { key: 'monthly_km_limit', label: 'Límite Mensual' },
            { key: 'status', label: 'Estado', type: 'status' }
          ]}
        />
      )}

      {activeTab === 'machinery_maintenance' && (
        <GenericTable
          title="Mantenimientos de Maquinaria"
          data={filtered.machineryMaintenance}
          onAdd={() => openModal('machinery_maintenance')}
          onEdit={(item) => openModal('machinery_maintenance', item)}
          onDelete={(id) => handleDelete('machinery_maintenance', id)}
          onExport={() => exportToExcel(machineryMaintenance, 'mantenimientos_maquinaria')}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          columns={[
            { key: 'maintenance_date', label: 'Fecha', type: 'date', icon: Calendar },
            { key: 'machinery.name', label: 'Maquinaria' },
            { key: 'maintenance_type', label: 'Tipo' },
            { key: 'description', label: 'Descripción' },
            { key: 'hours_at_maintenance', label: 'Horas' },
            { key: 'cost', label: 'Coste', type: 'currency' },
            { key: 'performed_by', label: 'Realizado Por' }
          ]}
        />
      )}

      {activeTab === 'vehicle_maintenance' && (
        <GenericTable
          title="Mantenimientos de Vehículos"
          data={filtered.vehicleMaintenance}
          onAdd={() => openModal('vehicle_maintenance')}
          onEdit={(item) => openModal('vehicle_maintenance', item)}
          onDelete={(id) => handleDelete('vehicle_maintenance', id)}
          onExport={() => exportToExcel(vehicleMaintenance, 'mantenimientos_vehiculos')}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          columns={[
            { key: 'maintenance_date', label: 'Fecha', type: 'date', icon: Calendar },
            { key: 'fleet_vehicles.license_plate', label: 'Vehículo' },
            { key: 'maintenance_type', label: 'Tipo' },
            { key: 'description', label: 'Descripción' },
            { key: 'odometer_at_maintenance', label: 'Km' },
            { key: 'cost', label: 'Coste', type: 'currency' },
            { key: 'workshop', label: 'Taller' }
          ]}
        />
      )}

      {activeTab === 'profitability' && (
        <MachineryProfitabilityModule machinery={machinery} />
      )}

      {activeTab === 'suppliers' && (
        <SupplierPaymentsModule />
      )}

      {activeTab === 'alerts' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Alertas de Vehículos</h2>
          </div>
          <div className="p-6">
            {filtered.alerts.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">No hay alertas pendientes</p>
                <p className="text-gray-500 mt-2">Todos los vehículos están en orden</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.alerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                      alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                      alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                      alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'high' ? 'text-orange-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        <span className="text-sm font-medium text-gray-900">
                          {alert.fleet_vehicles?.license_plate || 'Sin vehículo'}
                        </span>
                        <span className="text-sm text-gray-600">{formatDate(alert.alert_date)}</span>
                      </div>
                      <div className="mt-1 ml-8 text-sm text-gray-700">{alert.description}</div>
                    </div>
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Resolver
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <Modal
          title={`${editingItem ? 'Editar' : 'Nuevo'} ${getModalTitle(modalType)}`}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
            setFormData({});
          }}
          onSave={handleSave}
        >
          {renderForm(modalType, formData, setFormData, machinery, vehicles, workers, projects, suppliers)}
        </Modal>
      )}
    </div>
  );
};

const DashboardView: React.FC<any> = ({ kpis, machinery, vehicles, alerts, setActiveTab }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Maquinaria Total"
        value={kpis.total_machinery.toString()}
        subtitle={`${kpis.active_machinery} activas`}
        icon={Construction}
        color="blue"
        onClick={() => setActiveTab('machinery')}
      />
      <KPICard
        title="Vehículos Total"
        value={kpis.total_vehicles.toString()}
        subtitle={`${kpis.active_vehicles} activos`}
        icon={Truck}
        color="green"
        onClick={() => setActiveTab('vehicles')}
      />
      <KPICard
        title="Alertas Pendientes"
        value={kpis.pending_alerts.toString()}
        subtitle="Requieren atención"
        icon={AlertTriangle}
        color="orange"
        onClick={() => setActiveTab('alerts')}
      />
      <KPICard
        title="Coste Mensual"
        value={formatCurrency(kpis.monthly_machinery_cost + kpis.monthly_vehicle_cost)}
        subtitle="Mantenimientos"
        icon={DollarSign}
        color="purple"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Maquinaria por Estado</h3>
        <div className="space-y-3">
          {machinery.slice(0, 5).map((m: any) => (
            <div key={m.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">{m.name}</p>
                <p className="text-sm text-gray-600">{m.machinery_code} - {m.category}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{m.current_hours} horas</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  m.status === 'active' ? 'bg-green-100 text-green-800' :
                  m.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehículos</h3>
        <div className="space-y-3">
          {vehicles.slice(0, 5).map((v: any) => (
            <div key={v.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">{v.license_plate}</p>
                <p className="text-sm text-gray-600">{v.brand} {v.model} - {v.vehicle_type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{formatNumber(v.current_odometer, 0)} km</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  v.status === 'active' ? 'bg-green-100 text-green-800' :
                  v.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {v.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Costes Mensuales</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-900">Maquinaria</p>
          <p className="text-2xl font-bold text-blue-900">{formatCurrency(kpis.monthly_machinery_cost)}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm font-medium text-green-900">Vehículos</p>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(kpis.monthly_vehicle_cost)}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-sm font-medium text-purple-900">Total</p>
          <p className="text-2xl font-bold text-purple-900">
            {formatCurrency(kpis.monthly_machinery_cost + kpis.monthly_vehicle_cost)}
          </p>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start">
        <Construction className="w-6 h-6 text-blue-600 flex-shrink-0" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">Sistema Integrado de Flota</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p className="mb-2">Módulo completamente funcional con:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Gestión completa de maquinaria y vehículos</li>
              <li>Control de mantenimientos preventivos y correctivos</li>
              <li>Sistema de alertas automáticas</li>
              <li>Seguimiento de horómetros y odómetros</li>
              <li>Control de costes por máquina/vehículo</li>
              <li>Asignación a obras y operarios</li>
              <li>ITV, seguros y documentación</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const KPICard: React.FC<any> = ({ title, value, subtitle, icon: Icon, color, onClick }) => {
  const colors = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm mt-1 ${colors[color].text}`}>{subtitle}</p>
        </div>
        <div className={`p-3 ${colors[color].bg} rounded-full flex-shrink-0`}>
          <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${colors[color].text}`} />
        </div>
      </div>
    </div>
  );
};

const getModalTitle = (type: string) => {
  const titles: Record<string, string> = {
    machinery: 'Maquinaria',
    vehicle: 'Vehículo',
    machinery_maintenance: 'Mantenimiento de Maquinaria',
    vehicle_maintenance: 'Mantenimiento de Vehículo'
  };
  return titles[type] || '';
};

const renderForm = (
  type: string,
  data: any,
  setData: (data: any) => void,
  machinery: Machinery[],
  vehicles: FleetVehicle[],
  workers: any[],
  projects: any[],
  suppliers: any[]
) => {
  const updateField = (field: string, value: any) => {
    setData({ ...data, [field]: value });
  };

  switch (type) {
    case 'machinery':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Código *" value={data.machinery_code || ''} onChange={(e) => updateField('machinery_code', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
            <input type="text" placeholder="Nombre *" value={data.name || ''} onChange={(e) => updateField('name', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select value={data.category || 'excavator'} onChange={(e) => updateField('category', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
              <option value="excavator">Excavadora</option>
              <option value="crane">Grúa</option>
              <option value="truck">Camión</option>
              <option value="compactor">Compactadora</option>
              <option value="loader">Cargadora</option>
              <option value="mixer">Hormigonera</option>
              <option value="generator">Generador</option>
              <option value="other">Otro</option>
            </select>
            <select value={data.status || 'active'} onChange={(e) => updateField('status', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
              <option value="active">Activa</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="inactive">Inactiva</option>
              <option value="sold">Vendida</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Marca" value={data.brand || ''} onChange={(e) => updateField('brand', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            <input type="text" placeholder="Modelo" value={data.model || ''} onChange={(e) => updateField('model', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Nº Serie" value={data.serial_number || ''} onChange={(e) => updateField('serial_number', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            <input type="text" placeholder="Matrícula" value={data.license_plate || ''} onChange={(e) => updateField('license_plate', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <input type="date" placeholder="Fecha Compra" value={data.purchase_date || ''} onChange={(e) => updateField('purchase_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            <input type="number" placeholder="Precio Compra" value={data.purchase_price || ''} onChange={(e) => updateField('purchase_price', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" />
            <input type="number" placeholder="Valor Actual" value={data.current_value || ''} onChange={(e) => updateField('current_value', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <input type="number" placeholder="Coste/Hora *" value={data.hourly_cost || 0} onChange={(e) => updateField('hourly_cost', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" required />
            <select value={data.fuel_type || 'diesel'} onChange={(e) => updateField('fuel_type', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
              <option value="diesel">Diésel</option>
              <option value="gasoline">Gasolina</option>
              <option value="electric">Eléctrico</option>
              <option value="hybrid">Híbrido</option>
            </select>
            <input type="number" placeholder="Capacidad Comb." value={data.fuel_capacity || ''} onChange={(e) => updateField('fuel_capacity', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Horas máx. mant." value={data.max_hours_before_maintenance || 250} onChange={(e) => updateField('max_hours_before_maintenance', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            <input type="text" placeholder="Ubicación" value={data.location || ''} onChange={(e) => updateField('location', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Tipo de Tenencia y Costes</h4>
            <div className="grid grid-cols-2 gap-4">
              <select value={data.ownership_type || 'owned'} onChange={(e) => updateField('ownership_type', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                <option value="owned">Propiedad</option>
                <option value="rented">Alquiler</option>
              </select>
              {data.ownership_type === 'rented' && (
                <select value={data.supplier_id || ''} onChange={(e) => updateField('supplier_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                  <option value="">Seleccionar Proveedor</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.commercial_name}</option>)}
                </select>
              )}
            </div>
            {data.ownership_type === 'rented' && (
              <>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <input type="number" placeholder="Alquiler Mensual €" value={data.monthly_rental_cost || ''} onChange={(e) => updateField('monthly_rental_cost', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" />
                  <input type="date" placeholder="Inicio Alquiler" value={data.rental_start_date || ''} onChange={(e) => updateField('rental_start_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                  <input type="date" placeholder="Fin Alquiler" value={data.rental_end_date || ''} onChange={(e) => updateField('rental_end_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </>
            )}
            <div className="grid grid-cols-3 gap-4 mt-4">
              <input type="number" placeholder="Coste Operador €/mes" value={data.operator_monthly_cost || ''} onChange={(e) => updateField('operator_monthly_cost', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" />
              <input type="number" placeholder="Seguro €/mes" value={data.insurance_monthly_cost || ''} onChange={(e) => updateField('insurance_monthly_cost', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" />
              <input type="number" placeholder="Presup. Mant. €/mes" value={data.maintenance_monthly_budget || ''} onChange={(e) => updateField('maintenance_monthly_budget', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" />
            </div>
          </div>

          <div className="flex items-center">
            <input type="checkbox" id="requires_license" checked={data.requires_operator_license || false} onChange={(e) => updateField('requires_operator_license', e.target.checked)} className="mr-2" />
            <label htmlFor="requires_license" className="text-sm text-gray-700">Requiere licencia de operador</label>
          </div>
          <textarea placeholder="Notas" value={data.notes || ''} onChange={(e) => updateField('notes', e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={2} />
        </div>
      );

    case 'vehicle':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Código *" value={data.vehicle_code || ''} onChange={(e) => updateField('vehicle_code', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
            <input type="text" placeholder="Matrícula *" value={data.license_plate || ''} onChange={(e) => updateField('license_plate', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select value={data.vehicle_type || 'van'} onChange={(e) => updateField('vehicle_type', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
              <option value="car">Coche</option>
              <option value="van">Furgoneta</option>
              <option value="truck">Camión</option>
              <option value="pickup">Pickup</option>
            </select>
            <select value={data.status || 'active'} onChange={(e) => updateField('status', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
              <option value="active">Activo</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="inactive">Inactivo</option>
              <option value="sold">Vendido</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <input type="text" placeholder="Marca" value={data.brand || ''} onChange={(e) => updateField('brand', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            <input type="text" placeholder="Modelo" value={data.model || ''} onChange={(e) => updateField('model', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            <input type="number" placeholder="Año" value={data.year || ''} onChange={(e) => updateField('year', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select value={data.fuel_type || 'diesel'} onChange={(e) => updateField('fuel_type', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
              <option value="diesel">Diésel</option>
              <option value="gasoline">Gasolina</option>
              <option value="electric">Eléctrico</option>
              <option value="hybrid">Híbrido</option>
            </select>
            <input type="number" placeholder="Capacidad Comb." value={data.fuel_capacity || ''} onChange={(e) => updateField('fuel_capacity', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" placeholder="Fecha Compra" value={data.purchase_date || ''} onChange={(e) => updateField('purchase_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            <input type="number" placeholder="Precio Compra" value={data.purchase_price || ''} onChange={(e) => updateField('purchase_price', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select value={data.assigned_to_worker_id || ''} onChange={(e) => updateField('assigned_to_worker_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
              <option value="">Sin asignar</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.first_name} {w.last_name}</option>)}
            </select>
            <input type="number" placeholder="Límite km/mes *" value={data.monthly_km_limit || 2000} onChange={(e) => updateField('monthly_km_limit', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <input type="text" placeholder="Aseguradora" value={data.insurance_company || ''} onChange={(e) => updateField('insurance_company', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            <input type="text" placeholder="Nº Póliza" value={data.insurance_policy || ''} onChange={(e) => updateField('insurance_policy', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            <input type="date" placeholder="Venc. Seguro" value={data.insurance_expiry || ''} onChange={(e) => updateField('insurance_expiry', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <input type="date" placeholder="Vencimiento ITV" value={data.itv_expiry || ''} onChange={(e) => updateField('itv_expiry', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <textarea placeholder="Notas" value={data.notes || ''} onChange={(e) => updateField('notes', e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={2} />
        </div>
      );

    case 'machinery_maintenance':
      return (
        <div className="space-y-4">
          <select value={data.machinery_id || ''} onChange={(e) => updateField('machinery_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required>
            <option value="">Seleccionar maquinaria *</option>
            {machinery.map(m => <option key={m.id} value={m.id}>{m.name} ({m.machinery_code})</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" placeholder="Fecha *" value={data.maintenance_date || ''} onChange={(e) => updateField('maintenance_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
            <select value={data.maintenance_type || 'preventive'} onChange={(e) => updateField('maintenance_type', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
              <option value="preventive">Preventivo</option>
              <option value="corrective">Correctivo</option>
              <option value="inspection">Inspección</option>
            </select>
          </div>
          <input type="text" placeholder="Descripción *" value={data.description || ''} onChange={(e) => updateField('description', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <div className="grid grid-cols-3 gap-4">
            <input type="number" placeholder="Horas" value={data.hours_at_maintenance || ''} onChange={(e) => updateField('hours_at_maintenance', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            <input type="number" placeholder="Coste" value={data.cost || ''} onChange={(e) => updateField('cost', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" />
            <input type="number" placeholder="Horas parada" value={data.downtime_hours || ''} onChange={(e) => updateField('downtime_hours', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Realizado por" value={data.performed_by || ''} onChange={(e) => updateField('performed_by', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            <input type="number" placeholder="Próx. mant. (horas)" value={data.next_maintenance_hours || ''} onChange={(e) => updateField('next_maintenance_hours', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <input type="date" placeholder="Próx. fecha mant." value={data.next_maintenance_date || ''} onChange={(e) => updateField('next_maintenance_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <textarea placeholder="Piezas reemplazadas" value={data.parts_replaced || ''} onChange={(e) => updateField('parts_replaced', e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={2} />
          <textarea placeholder="Notas" value={data.notes || ''} onChange={(e) => updateField('notes', e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={2} />
        </div>
      );

    case 'vehicle_maintenance':
      return (
        <div className="space-y-4">
          <select value={data.vehicle_id || ''} onChange={(e) => updateField('vehicle_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required>
            <option value="">Seleccionar vehículo *</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate} ({v.brand} {v.model})</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" placeholder="Fecha *" value={data.maintenance_date || ''} onChange={(e) => updateField('maintenance_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
            <select value={data.maintenance_type || 'oil_change'} onChange={(e) => updateField('maintenance_type', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
              <option value="oil_change">Cambio de aceite</option>
              <option value="inspection">Inspección</option>
              <option value="repair">Reparación</option>
              <option value="itv">ITV</option>
            </select>
          </div>
          <input type="text" placeholder="Descripción *" value={data.description || ''} onChange={(e) => updateField('description', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Km actuales" value={data.odometer_at_maintenance || ''} onChange={(e) => updateField('odometer_at_maintenance', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            <input type="number" placeholder="Coste" value={data.cost || ''} onChange={(e) => updateField('cost', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Taller" value={data.workshop || ''} onChange={(e) => updateField('workshop', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            <input type="text" placeholder="Nº Factura" value={data.invoice_number || ''} onChange={(e) => updateField('invoice_number', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" placeholder="Próx. fecha mant." value={data.next_maintenance_date || ''} onChange={(e) => updateField('next_maintenance_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
            <input type="number" placeholder="Próx. mant. (km)" value={data.next_maintenance_km || ''} onChange={(e) => updateField('next_maintenance_km', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <textarea placeholder="Piezas reemplazadas" value={data.parts_replaced || ''} onChange={(e) => updateField('parts_replaced', e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={2} />
          <textarea placeholder="Notas" value={data.notes || ''} onChange={(e) => updateField('notes', e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={2} />
        </div>
      );

    default:
      return null;
  }
};

const GenericTable: React.FC<any> = ({
  title, data, onAdd, onEdit, onDelete, onExport, searchTerm, setSearchTerm, columns
}) => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <div className="flex space-x-2">
          {onExport && (
            <button onClick={onExport} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="w-5 h-5 mr-2" />
              Exportar
            </button>
          )}
          <button onClick={onAdd} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Nuevo
          </button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col: any, idx: number) => (
              <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                No hay registros disponibles
              </td>
            </tr>
          ) : (
            data.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns.map((col: any, idx: number) => {
                  const value = col.key.split('.').reduce((obj: any, key: string) => obj?.[key], item);
                  return (
                    <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm">
                      {col.icon && <div className="flex items-center"><col.icon className="w-4 h-4 text-gray-400 mr-2" /><span className="font-medium text-gray-900">{value || '-'}</span></div>}
                      {!col.icon && col.type === 'currency' && <span className="font-bold text-green-600">{formatCurrency(value || 0)}</span>}
                      {!col.icon && col.type === 'date' && <span className="text-gray-900">{value ? formatDate(value) : '-'}</span>}
                      {!col.icon && col.type === 'status' && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          value === 'active' ? 'bg-green-100 text-green-800' :
                          value === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          value === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          value === 'sold' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {value}
                        </span>
                      )}
                      {!col.icon && !col.type && <span className="text-gray-900">{value || '-'}</span>}
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900 mr-3">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const Modal: React.FC<any> = ({ title, onClose, onSave, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
      <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white">
        <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          Cancelar
        </button>
        <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
          <Save className="w-5 h-5 mr-2" />
          Guardar
        </button>
      </div>
    </div>
  </div>
);

export default FleetManagement;
