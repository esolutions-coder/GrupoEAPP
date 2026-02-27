import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Building2, Briefcase, FileText, TrendingUp,
  DollarSign, Calendar, Shield, HardHat, Truck, Package,
  ClipboardList, UserCheck, Wrench, ChevronRight, ChevronDown,
  FolderKanban, Wallet, UsersRound, Settings, ShoppingCart, BarChart3,
  Scale, Receipt, Ruler, FileCheck, ShieldCheck, Sliders
} from 'lucide-react';

interface SidebarProps {
  currentModule: string;
  onModuleChange: (module: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface MenuCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  items?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onModuleChange,
  isMobileOpen = false,
  onMobileClose
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const menuStructure: (MenuItem | MenuCategory)[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Principal',
      icon: LayoutDashboard,
      color: 'text-blue-600'
    },
    {
      id: 'administracion',
      label: 'Administración',
      icon: UsersRound,
      color: 'text-gray-600',
      items: [
        { id: 'workers', label: 'Trabajadores', icon: Users, color: 'text-purple-600' },
        { id: 'smac', label: 'Asesoría Legal', icon: Scale, color: 'text-red-600' },
        { id: 'clients', label: 'CRM & Comercial', icon: Briefcase, color: 'text-orange-600' },
        { id: 'job-offers', label: 'Ofertas de Empleo', icon: Wrench, color: 'text-blue-500' },
        { id: 'vacations', label: 'Vacaciones', icon: Calendar, color: 'text-red-600' }
      ]
    },
    {
      id: 'produccion',
      label: 'Producción',
      icon: FolderKanban,
      color: 'text-green-600',
      items: [
        { id: 'crews', label: 'Cuadrillas', icon: UserCheck, color: 'text-teal-600' },
        { id: 'work-reports', label: 'Partes de Trabajo', icon: ClipboardList, color: 'text-indigo-600' },
        { id: 'payroll', label: 'Liquidaciones', icon: DollarSign, color: 'text-green-700' },
        { id: 'invoicing', label: 'Facturación', icon: Receipt, color: 'text-blue-600' }
      ]
    },
    {
      id: 'gestion-obras',
      label: 'Gestión de Obras',
      icon: Building2,
      color: 'text-blue-600',
      items: [
        { id: 'projects', label: 'Proyectos', icon: Building2, color: 'text-green-600' },
        { id: 'measurements', label: 'Mediciones', icon: Ruler, color: 'text-blue-600' },
        { id: 'certifications', label: 'Certificaciones', icon: FileCheck, color: 'text-purple-600' },
        { id: 'budgets', label: 'Presupuestos', icon: FileText, color: 'text-indigo-600' }
      ]
    },
    {
      id: 'movimiento-tierras',
      label: 'Movimiento de Tierras',
      icon: Truck,
      color: 'text-gray-700',
      items: [
        { id: 'fleet-management', label: 'Flota y Maquinaria', icon: Truck, color: 'text-gray-700' }
      ]
    },
    {
      id: 'centro-costes',
      label: 'Centro de Costes',
      icon: BarChart3,
      color: 'text-amber-600',
      items: [
        { id: 'cost-control', label: 'Control de Costes', icon: BarChart3, color: 'text-amber-600' },
        { id: 'cost-items', label: 'Líneas de Coste', icon: TrendingUp, color: 'text-red-600' }
      ]
    },
    {
      id: 'contabilidad',
      label: 'Contabilidad',
      icon: Wallet,
      color: 'text-emerald-600',
      items: [
        { id: 'suppliers', label: 'Proveedores & Recursos', icon: Package, color: 'text-yellow-600' },
        { id: 'epi', label: 'EPIs', icon: HardHat, color: 'text-orange-700' },
        { id: 'financial-dashboard', label: 'Dashboard Financiero', icon: BarChart3, color: 'text-green-600' },
        { id: 'treasury', label: 'Tesorería', icon: DollarSign, color: 'text-emerald-600' }
      ]
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: Settings,
      color: 'text-slate-600',
      items: [
        { id: 'roles-permissions', label: 'Roles y Permisos', icon: ShieldCheck, color: 'text-red-600' },
        { id: 'settings', label: 'Configuración', icon: Sliders, color: 'text-slate-600' }
      ]
    }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? []
        : [categoryId]
    );
  };

  const handleItemClick = (itemId: string) => {
    onModuleChange(itemId);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const isItemActive = (itemId: string): boolean => {
    return currentModule === itemId;
  };

  const isCategoryActive = (category: MenuCategory): boolean => {
    if (!category.items) return false;
    return category.items.some(item => item.id === currentModule);
  };

  const renderMenuItem = (item: MenuItem, isSubmenu: boolean = false) => {
    const Icon = item.icon;
    const isActive = isItemActive(item.id);

    return (
      <button
        key={item.id}
        onClick={() => handleItemClick(item.id)}
        className={`
          w-full flex items-center justify-between rounded-lg text-sm font-medium
          transition-all duration-200
          ${isSubmenu ? 'pl-11 pr-3 py-2' : 'px-3 py-2.5'}
          ${isActive
            ? 'bg-blue-50 text-blue-700 shadow-sm'
            : 'text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        <div className="flex items-center space-x-3">
          <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : item.color}`} />
          <span>{item.label}</span>
        </div>
        {isActive && (
          <ChevronRight className="h-4 w-4 text-blue-600" />
        )}
      </button>
    );
  };

  const renderCategory = (category: MenuCategory) => {
    const Icon = category.icon;
    const isExpanded = expandedCategories.includes(category.id);
    const hasActiveItem = isCategoryActive(category);

    return (
      <div key={category.id} className="space-y-1">
        <button
          onClick={() => toggleCategory(category.id)}
          className={`
            w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold
            transition-all duration-200
            ${hasActiveItem
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <div className="flex items-center space-x-3">
            <Icon className={`h-5 w-5 ${hasActiveItem ? 'text-blue-600' : category.color}`} />
            <span>{category.label}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {isExpanded && category.items && (
          <div className="space-y-0.5 ml-2">
            {category.items.map(item => renderMenuItem(item, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white border-r border-gray-200 overflow-y-auto z-50
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 lg:w-64
        `}
      >
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-lg font-bold text-white">Grupo EA</h2>
          <p className="text-xs text-blue-100">Sistema de Gestión Integral</p>
        </div>

        <nav className="p-2">
          <div className="space-y-1">
            {menuStructure.map((item) => {
              if ('items' in item) {
                return renderCategory(item as MenuCategory);
              } else {
                return renderMenuItem(item as MenuItem, false);
              }
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200 mt-auto sticky bottom-0 bg-white">
          <div className="text-xs text-gray-500">
            <p className="font-medium">Sistema v1.0</p>
            <p>© 2024 Grupo EA</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
