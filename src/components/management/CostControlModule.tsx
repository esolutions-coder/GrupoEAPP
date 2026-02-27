import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Plus, Search, Edit, Eye, Building2, DollarSign,
  AlertTriangle, CheckCircle, BarChart3, Calculator, Download,
  Calendar, User, FileText, Target, TrendingDown, X, List
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatNumber } from '../../utils/formatUtils';
import ProjectExecutiveSummary from './ProjectExecutiveSummary';

interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  location: string;
  client_id: string;
  client_name: string;
  responsible: string;
  project_manager: string;
  start_date: string;
  end_date: string;
  estimated_end_date: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  total_budget: number;
  admin_hourly_rate_workers: number;
  admin_hourly_rate_machinery: number;
  created_at: string;
  updated_at: string;
}

interface CostControlProject {
  id: string;
  project_id: string;
  project_name: string;
  project_code: string;
  client_id: string;
  client_name: string;
  start_date: string;
  end_date: string;
  estimated_end_date: string;
  status: 'planning' | 'active' | 'completed' | 'paused' | 'cancelled';
  total_budget: number;
  total_actual_cost: number;
  gross_profit: number;
  gross_profit_margin: number;
  budget_variance: number;
  budget_variance_percentage: number;
  performance_index: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  cost_trend: 'improving' | 'stable' | 'deteriorating';
  project_manager: string;
  cost_controller: string;
}

interface CostAlert {
  id: string;
  project_id: string;
  project_name: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  current_value: number;
  resolved: boolean;
  created_at: string;
}

interface BudgetBreakdown {
  id: string;
  project_id: string;
  category: string;
  budgeted: number;
  actual: number;
  committed: number;
  variance: number;
  variance_percentage: number;
}

const CostControlModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('2024-01');
  const [selectedProject, setSelectedProject] = useState<CostControlProject | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showAddCostModal, setShowAddCostModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<CostControlProject[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [selectedAvailableProject, setSelectedAvailableProject] = useState<Project | null>(null);
  const [alerts, setAlerts] = useState<CostAlert[]>([]);
  const [budgetBreakdowns, setBudgetBreakdowns] = useState<BudgetBreakdown[]>([]);

  const [formData, setFormData] = useState({
    cost_controller: '',
    direct_cost_percentage: '70',
    indirect_cost_percentage: '30',
    overhead_rate: '15'
  });

  const [costItemForm, setCostItemForm] = useState({
    category: 'materials',
    item_date: '',
    description: '',
    amount: '',
    status: 'committed' as const
  });

  const [activeView, setActiveView] = useState<'control' | 'summary'>('summary');

  useEffect(() => {
    loadProjects();
    loadAlerts();
    loadAvailableProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cost_control_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableProjects = async () => {
    try {
      const { data: costControlProjects } = await supabase
        .from('cost_control_projects')
        .select('project_id');

      const usedProjectIds = costControlProjects?.map(p => p.project_id) || [];

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .not('id', 'in', `(${usedProjectIds.length > 0 ? usedProjectIds.join(',') : 'null'})`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAvailableProjects(data || []);
    } catch (error) {
      console.error('Error loading available projects:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('cost_alerts')
        .select('*')
        .eq('resolved', false)
        .order('severity', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const loadBudgetBreakdown = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('budget_breakdown')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;
      setBudgetBreakdowns(data || []);
    } catch (error) {
      console.error('Error loading budget breakdown:', error);
    }
  };

  const handleActivateCostControl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAvailableProject) return;

    setIsLoading(true);
    try {
      const { data: costControl, error: costControlError } = await supabase
        .from('cost_control_projects')
        .insert([{
          project_id: selectedAvailableProject.id,
          project_name: selectedAvailableProject.name,
          project_code: selectedAvailableProject.code,
          client_id: selectedAvailableProject.client_id,
          client_name: selectedAvailableProject.client_name,
          start_date: selectedAvailableProject.start_date,
          end_date: selectedAvailableProject.end_date,
          estimated_end_date: selectedAvailableProject.estimated_end_date,
          status: selectedAvailableProject.status,
          total_budget: selectedAvailableProject.total_budget,
          project_manager: selectedAvailableProject.project_manager || selectedAvailableProject.responsible,
          cost_controller: formData.cost_controller,
          direct_cost_percentage: parseFloat(formData.direct_cost_percentage),
          indirect_cost_percentage: parseFloat(formData.indirect_cost_percentage),
          overhead_rate: parseFloat(formData.overhead_rate)
        }])
        .select()
        .single();

      if (costControlError) throw costControlError;

      const budgetPerCategory = selectedAvailableProject.total_budget / 9;
      const categories = ['materials', 'direct_labor', 'subcontracts', 'machinery', 'insurance', 'general_expenses', 'indirect_costs', 'contingency', 'profit'];

      const breakdownInserts = categories.map(category => ({
        project_id: costControl.id,
        category,
        budgeted: budgetPerCategory,
        actual: 0,
        committed: 0,
        variance: 0,
        variance_percentage: 0
      }));

      const { error: breakdownError } = await supabase
        .from('budget_breakdown')
        .insert(breakdownInserts);

      if (breakdownError) throw breakdownError;

      alert('Control de costes activado exitosamente');
      setShowActivateModal(false);
      setSelectedAvailableProject(null);
      resetForm();
      loadProjects();
      loadAvailableProjects();
    } catch (error) {
      console.error('Error activating cost control:', error);
      alert('Error al activar el control de costes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCostItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('cost_items')
        .insert([{
          project_id: selectedProject.id,
          category: costItemForm.category,
          item_date: costItemForm.item_date,
          description: costItemForm.description,
          amount: parseFloat(costItemForm.amount),
          status: costItemForm.status,
          source: 'manual'
        }]);

      if (error) throw error;

      alert('Coste agregado exitosamente');
      setShowAddCostModal(false);
      resetCostItemForm();
      loadProjects();
    } catch (error) {
      console.error('Error adding cost item:', error);
      alert('Error al agregar el coste');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cost_controller: '',
      direct_cost_percentage: '70',
      indirect_cost_percentage: '30',
      overhead_rate: '15'
    });
  };

  const resetCostItemForm = () => {
    setCostItemForm({
      category: 'materials',
      item_date: '',
      description: '',
      amount: '',
      status: 'committed'
    });
  };

  const handleView = async (project: CostControlProject) => {
    setSelectedProject(project);
    await loadBudgetBreakdown(project.id);
    setShowViewModal(true);
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('cost_alerts')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
      loadAlerts();
      alert('Alerta resuelta');
    } catch (error) {
      console.error('Error resolving alert:', error);
      alert('Error al resolver la alerta');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.project_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    const matchesRisk = selectedRisk === 'all' || project.risk_level === selectedRisk;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const stats = [
    { label: 'Proyectos Controlados', value: projects.length.toString(), icon: Building2, color: 'text-blue-600' },
    {
      label: 'Presupuesto Total',
      value: `€${(projects.reduce((sum, p) => sum + p.total_budget, 0) / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      label: 'Desviación Media',
      value: `${(projects.reduce((sum, p) => sum + p.budget_variance_percentage, 0) / (projects.length || 1)).toFixed(1)}%`,
      icon: TrendingDown,
      color: 'text-green-600'
    },
    { label: 'Alertas Activas', value: alerts.length.toString(), icon: AlertTriangle, color: 'text-red-600' }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance < -5) return 'text-green-600';
    if (variance < 0) return 'text-blue-600';
    if (variance < 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      materials: 'Materiales',
      direct_labor: 'Mano de Obra',
      subcontracts: 'Subcontratas',
      machinery: 'Maquinaria',
      insurance: 'Seguros',
      general_expenses: 'Gastos Generales',
      indirect_costs: 'Costes Indirectos',
      contingency: 'Contingencias',
      profit: 'Beneficio'
    };
    return labels[category] || category;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Control de Costes y Rentabilidad</h2>
          <p className="text-gray-600">Análisis financiero y control presupuestario por proyecto</p>
        </div>
        <div className="flex space-x-3">
          {availableProjects.length > 0 && activeView === 'control' && (
            <button type="button" onClick={() => setShowActivateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Activar Control de Costes</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveView('summary')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeView === 'summary'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="w-5 h-5" />
            <span>Resumen Ejecutivo por Obra</span>
          </button>
          <button
            onClick={() => setActiveView('control')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeView === 'control'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calculator className="w-5 h-5" />
            <span>Control Detallado de Costes</span>
          </button>
        </div>
      </div>

      {/* View Content */}
      {activeView === 'summary' ? (
        <ProjectExecutiveSummary />
      ) : (
        <>
      {/* Original Control de Costes content */}

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
                placeholder="Proyecto, código, cliente..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
              />
            </div>
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
              <option value="planning">Planificación</option>
              <option value="completed">Completado</option>
              <option value="paused">Pausado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nivel de Riesgo</label>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los niveles</option>
              <option value="low">Bajo</option>
              <option value="medium">Medio</option>
              <option value="high">Alto</option>
              <option value="critical">Crítico</option>
            </select>
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
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Control de Costes por Proyecto ({filteredProjects.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proyecto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Presupuesto</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Coste Real</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Desviación</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rentabilidad</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Riesgo</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-corporate-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-corporate-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{project.project_name}</div>
                        <div className="text-sm text-gray-500">{project.project_code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{project.client_name}</div>
                    <div className="text-sm text-gray-500">PM: {project.project_manager}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">€{project.total_budget.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900">€{project.total_actual_cost.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {((project.total_actual_cost / project.total_budget) * 100).toFixed(1)}% ejecutado
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-bold ${getVarianceColor(project.budget_variance_percentage)}`}>
                      {project.budget_variance_percentage > 0 ? '+' : ''}
                      {project.budget_variance_percentage.toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-green-600">
                      {project.gross_profit_margin.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">€{project.gross_profit.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(project.risk_level)}`}>
                      {project.risk_level === 'low' ? 'Bajo' :
                       project.risk_level === 'medium' ? 'Medio' :
                       project.risk_level === 'high' ? 'Alto' : 'Crítico'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                      {project.status === 'active' ? 'Activo' :
                       project.status === 'planning' ? 'Planificación' :
                       project.status === 'completed' ? 'Completado' :
                       project.status === 'paused' ? 'Pausado' : 'Cancelado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                      <button type="button" onClick={() => handleView(project)}
                        className="text-corporate-blue-600 hover:text-corporate-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => { setSelectedProject(project); setShowAddCostModal(true); }}
                        className="text-green-600 hover:text-green-900"
                        title="Agregar coste"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas de Control de Costes</h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
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
                      {alert.project_name} • Umbral: {alert.threshold}% • Actual: {alert.current_value}%
                    </div>
                  </div>
                </div>
                <button type="button" onClick={() => handleResolveAlert(alert.id)}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Resolver
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      </>
      )}

      {/* Modals */}
      {showActivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Activar Control de Costes</h2>
                <button type="button" onClick={() => setShowActivateModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Selecciona un proyecto de Gestión de Obras para activar el control de costes</p>
            </div>

            <form onSubmit={handleActivateCostControl} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proyecto</label>
                <select
                  required
                  value={selectedAvailableProject?.id || ''}
                  onChange={(e) => {
                    const project = availableProjects.find(p => p.id === e.target.value);
                    setSelectedAvailableProject(project || null);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                >
                  <option value="">Seleccionar proyecto...</option>
                  {availableProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.code} - {project.name} ({project.client_name})
                    </option>
                  ))}
                </select>
              </div>

              {selectedAvailableProject && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <div><strong>Cliente:</strong> {selectedAvailableProject.client_name}</div>
                  <div><strong>Responsable:</strong> {selectedAvailableProject.responsible}</div>
                  <div><strong>Presupuesto:</strong> €{selectedAvailableProject.total_budget.toLocaleString()}</div>
                  <div><strong>Fechas:</strong> {new Date(selectedAvailableProject.start_date).toLocaleDateString('es-ES')} - {new Date(selectedAvailableProject.end_date).toLocaleDateString('es-ES')}</div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Controlador de Costes</label>
                <input
                  type="text"
                  required
                  value={formData.cost_controller}
                  onChange={(e) => setFormData({...formData, cost_controller: e.target.value})}
                  placeholder="Nombre del controlador"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costes Directos (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={formData.direct_cost_percentage}
                    onChange={(e) => setFormData({...formData, direct_cost_percentage: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costes Indirectos (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={formData.indirect_cost_percentage}
                    onChange={(e) => setFormData({...formData, indirect_cost_percentage: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tasa Overhead (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    value={formData.overhead_rate}
                    onChange={(e) => setFormData({...formData, overhead_rate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading || !selectedAvailableProject}
                  className="flex-1 bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Activando...' : 'Activar Control de Costes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowActivateModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddCostModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Agregar Coste</h2>
                <button type="button" onClick={() => setShowAddCostModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">{selectedProject.project_name}</p>
            </div>

            <form onSubmit={handleAddCostItem} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={costItemForm.category}
                  onChange={(e) => setCostItemForm({...costItemForm, category: e.target.value as any})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                >
                  <option value="materials">Materiales</option>
                  <option value="direct_labor">Mano de Obra</option>
                  <option value="subcontracts">Subcontratas</option>
                  <option value="machinery">Maquinaria</option>
                  <option value="insurance">Seguros</option>
                  <option value="general_expenses">Gastos Generales</option>
                  <option value="indirect_costs">Costes Indirectos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={costItemForm.item_date}
                  onChange={(e) => setCostItemForm({...costItemForm, item_date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  required
                  value={costItemForm.description}
                  onChange={(e) => setCostItemForm({...costItemForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Importe (€)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={costItemForm.amount}
                  onChange={(e) => setCostItemForm({...costItemForm, amount: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={costItemForm.status}
                  onChange={(e) => setCostItemForm({...costItemForm, status: e.target.value as any})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                >
                  <option value="planned">Planificado</option>
                  <option value="committed">Comprometido</option>
                  <option value="paid">Pagado</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Agregando...' : 'Agregar Coste'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCostModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedProject.project_name}</h2>
                <button type="button" onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Proyecto</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Código:</strong> {selectedProject.project_code}</div>
                    <div><strong>Cliente:</strong> {selectedProject.client_name}</div>
                    <div><strong>Project Manager:</strong> {selectedProject.project_manager}</div>
                    <div><strong>Controlador Costes:</strong> {selectedProject.cost_controller}</div>
                    <div><strong>Presupuesto Total:</strong> €{selectedProject.total_budget.toLocaleString()}</div>
                    <div><strong>Coste Real:</strong> €{selectedProject.total_actual_cost.toLocaleString()}</div>
                    <div><strong>Inicio:</strong> {new Date(selectedProject.start_date).toLocaleDateString('es-ES')}</div>
                    <div><strong>Fin:</strong> {new Date(selectedProject.end_date).toLocaleDateString('es-ES')}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Rentabilidad</h3>
                  <div className="space-y-3 text-sm">
                    <div><strong>Beneficio Bruto:</strong> €{selectedProject.gross_profit.toLocaleString()}</div>
                    <div><strong>Margen Bruto:</strong> {selectedProject.gross_profit_margin.toFixed(2)}%</div>
                    <div><strong>Desviación:</strong> {selectedProject.budget_variance_percentage.toFixed(2)}%</div>
                    <div><strong>Índice Rendimiento:</strong> {selectedProject.performance_index}</div>
                    <div><strong>Nivel Riesgo:</strong> <span className={`px-2 py-1 rounded text-xs ${getRiskColor(selectedProject.risk_level)}`}>{selectedProject.risk_level}</span></div>
                    <div><strong>Tendencia Costes:</strong> {selectedProject.cost_trend}</div>
                  </div>
                </div>
              </div>

              {budgetBreakdowns.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Desglose de Presupuesto</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Categoría</th>
                          <th className="px-4 py-2 text-right">Presupuestado</th>
                          <th className="px-4 py-2 text-right">Real</th>
                          <th className="px-4 py-2 text-right">Desviación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {budgetBreakdowns.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="px-4 py-2">{getCategoryLabel(item.category)}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(item.budgeted)}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(item.actual)}</td>
                            <td className={`px-4 py-2 text-right font-semibold ${getVarianceColor(item.variance_percentage)}`}>
                              {item.variance_percentage > 0 ? '+' : ''}{formatNumber(item.variance_percentage, 1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostControlModule;
