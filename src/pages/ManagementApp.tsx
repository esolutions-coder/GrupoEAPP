import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  FileText,
  Building2,
  LogOut,
  Home,
  DollarSign,
  Truck,
  Shield,
  UserCheck,
  Calendar,
  Package,
  TrendingUp,
  Briefcase,
  ClipboardList,
  Award,
  Settings,
  Menu,
  X,
  Calculator,
  Ruler
} from 'lucide-react';

// Importar todos los módulos
import DashboardProfessional from '../components/management/DashboardProfessional';
import WorkersModule from '../components/management/WorkersModule';
import CRMModule from '../components/management/CRMModule';
import ProjectsManagement from '../components/management/ProjectsManagement';
import CostControlModule from '../components/management/CostControlModule';
import CostControlReports from '../components/management/CostControlReports';
import SuppliersModule from '../components/management/SuppliersModule';
import WorkReportsModule from '../components/management/WorkReportsModule';
import SettlementsModule from '../components/management/SettlementsModule';
import BudgetsModule from '../components/management/BudgetsModule';
import MeasurementsEnhanced from '../components/management/Measurements';
import CertificationModule from '../components/management/CertificationModule';
import VacationsModule from '../components/management/VacationsModule';
import RolesPermissionsModule from '../components/management/RolesPermissionsModule';
import EPIManagementModule from '../components/management/EPIManagementModule';
import ClientsManagement from '../components/management/ClientsManagement';
import CrewsManagement from '../components/management/CrewsManagement';
import JobManager from '../components/management/JobManager';
import SMACManagement from '../components/management/SMACManagement';
import FleetManagement from '../components/management/FleetManagement';
import TreasuryModuleProfessional from '../components/management/TreasuryModuleProfessional';
import CostItemsManagement from '../components/management/CostItemsManagement';
import InvoicingModule from '../components/management/InvoicingModule';
import FinancialDashboard from '../components/management/FinancialDashboard';
import SettingsModule from '../components/management/SettingsModule';
import Sidebar from '../components/management/Sidebar';

interface ManagementAppProps {
  onNavigate: (page: string) => void;
}

const ManagementApp: React.FC<ManagementAppProps> = ({ onNavigate }) => {
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      onNavigate('home');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-blue-600' },
    { id: 'workers', label: 'Operarios', icon: Users, color: 'text-green-600' },
    { id: 'crm', label: 'CRM Clientes', icon: UserCheck, color: 'text-purple-600' },
    { id: 'projects', label: 'Gestión Obras', icon: Building2, color: 'text-blue-600' },
    { id: 'budgets', label: 'Presupuestos', icon: Calculator, color: 'text-blue-600' },
    { id: 'measurements', label: 'Mediciones', icon: Ruler, color: 'text-teal-600' },
    { id: 'certifications', label: 'Certificaciones', icon: Award, color: 'text-purple-600' },
    { id: 'cost-control', label: 'Control Costes', icon: TrendingUp, color: 'text-red-600' },
    { id: 'suppliers', label: 'Proveedores', icon: Truck, color: 'text-orange-600' },
    { id: 'epis', label: 'Gestión EPIs', icon: Package, color: 'text-indigo-600' },
    { id: 'vacations', label: 'Vacaciones', icon: Calendar, color: 'text-yellow-600' },
    { id: 'job-manager', label: 'Ofertas Trabajo', icon: Briefcase, color: 'text-green-600' },
    { id: 'work-reports', label: 'Partes Trabajo', icon: ClipboardList, color: 'text-blue-600' },
    { id: 'payroll', label: 'Liquidaciones', icon: DollarSign, color: 'text-green-600' },
    { id: 'reports', label: 'Informes', icon: FileText, color: 'text-red-600' },
    { id: 'safety', label: 'Seguridad', icon: Shield, color: 'text-red-500' },
    { id: 'project-gallery', label: 'Galería Proyectos', icon: Building2, color: 'text-blue-600' }
  ];

  const renderCurrentModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <DashboardProfessional setCurrentModule={setCurrentModule} />;
      case 'workers':
        return <WorkersModule />;
      case 'crm':
        return <CRMModule />;
      case 'clients':
        return <ClientsManagement />;
      case 'crews':
        return <CrewsManagement />;
      case 'projects':
        return <ProjectsManagement />;
      case 'budgets':
        return <BudgetsModule />;
      case 'measurements':
        return <MeasurementsEnhanced />;
      case 'certifications':
        return <CertificationModule />;
      case 'cost-control':
        return <CostControlModule />;
      case 'cost-items':
        return <CostItemsManagement />;
      case 'suppliers':
        return <SuppliersModule />;
      case 'epi':
      case 'epis':
        return <EPIManagementModule />;
      case 'vacations':
        return <VacationsModule />;
      case 'job-offers':
        return <JobManager />;
      case 'roles-permissions':
        return <RolesPermissionsModule />;
      case 'work-reports':
        return <WorkReportsModule userName="Admin" />;
      case 'payroll':
        return <SettlementsModule />;
      case 'smac':
        return <SMACManagement />;
      case 'fleet-management':
        return <FleetManagement />;
      case 'treasury':
        return <TreasuryModuleProfessional />;
      case 'invoicing':
        return <InvoicingModule />;
      case 'financial-dashboard':
        return <FinancialDashboard />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <DashboardProfessional setCurrentModule={setCurrentModule} />;
    }
  };

  const moduleNames: Record<string, string> = {
    'dashboard': 'Dashboard',
    'projects': 'Proyectos',
    'workers': 'Trabajadores',
    'clients': 'Clientes',
    'suppliers': 'Proveedores',
    'crews': 'Cuadrillas',
    'work-reports': 'Partes de Trabajo',
    'measurements': 'Mediciones',
    'certifications': 'Certificaciones',
    'payroll': 'Liquidaciones',
    'vacations': 'Vacaciones',
    'budgets': 'Presupuestos',
    'cost-control': 'Control de Costes',
    'cost-items': 'Líneas de Coste',
    'epi': 'EPIs',
    'epis': 'Gestión de EPIs',
    'machinery': 'Maquinaria',
    'job-offers': 'Ofertas de Empleo',
    'roles-permissions': 'Roles y Permisos',
    'settings': 'Configuración',
    'crm': 'CRM Clientes',
    'smac': 'Gestión de SMAC',
    'fleet-management': 'Flota y Maquinaria',
    'treasury': 'Tesorería Multibanco'
  };

  const getCurrentModuleTitle = () => {
    return moduleNames[currentModule] || 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        currentModule={currentModule}
        onModuleChange={setCurrentModule}
        isMobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-corporate-gray-900">{getCurrentModuleTitle()}</h1>
                <p className="text-gray-600">Grupo EA - Sistema de Gestión Empresarial</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {renderCurrentModule()}
        </main>
      </div>
    </div>
  );
};

export default ManagementApp;