import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, X, Calendar, DollarSign,
  Filter, Download, Upload, Eye, Save, FileText, TrendingUp
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/formatUtils';
import * as XLSX from 'xlsx';

interface CostControlProject {
  id: string;
  project_id: string;
  project_name: string;
  project_code: string;
  client_name: string;
  status: string;
  total_budget: number;
  total_actual_cost: number;
}

interface CostItem {
  id: string;
  project_id: string;
  category: string;
  item_date: string;
  description: string;
  amount: number;
  source: string;
  status: 'planned' | 'committed' | 'paid';
  invoice_number?: string;
  supplier_name?: string;
  created_at: string;
  updated_at: string;
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

const CostItemsManagement: React.FC = () => {
  const [projects, setProjects] = useState<CostControlProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<CostControlProject | null>(null);
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [budgetBreakdowns, setBudgetBreakdowns] = useState<BudgetBreakdown[]>([]);
  const [filteredItems, setFilteredItems] = useState<CostItem[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CostItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    category: 'materials',
    item_date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    status: 'committed' as const,
    invoice_number: '',
    supplier_name: '',
    source: 'manual'
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadCostItems();
      loadBudgetBreakdown();
    }
  }, [selectedProject]);

  useEffect(() => {
    applyFilters();
  }, [costItems, searchTerm, filterCategory, filterStatus, filterDateFrom, filterDateTo]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('cost_control_projects')
        .select('*')
        .order('project_name');

      if (error) throw error;
      setProjects(data || []);

      if (data && data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadCostItems = async () => {
    if (!selectedProject) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cost_items')
        .select('*')
        .eq('project_id', selectedProject.id)
        .order('item_date', { ascending: false });

      if (error) throw error;
      setCostItems(data || []);
    } catch (error) {
      console.error('Error loading cost items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBudgetBreakdown = async () => {
    if (!selectedProject) return;

    try {
      const { data, error } = await supabase
        .from('budget_breakdown')
        .select('*')
        .eq('project_id', selectedProject.id);

      if (error) throw error;
      setBudgetBreakdowns(data || []);
    } catch (error) {
      console.error('Error loading budget breakdown:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...costItems];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    if (filterDateFrom) {
      filtered = filtered.filter(item => item.item_date >= filterDateFrom);
    }

    if (filterDateTo) {
      filtered = filtered.filter(item => item.item_date <= filterDateTo);
    }

    setFilteredItems(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setIsLoading(true);
    try {
      const itemData = {
        project_id: selectedProject.id,
        category: formData.category,
        item_date: formData.item_date,
        description: formData.description,
        amount: parseFloat(formData.amount),
        status: formData.status,
        invoice_number: formData.invoice_number || null,
        supplier_name: formData.supplier_name || null,
        source: formData.source
      };

      if (editingItem) {
        const { error } = await supabase
          .from('cost_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        alert('Línea de coste actualizada exitosamente');
      } else {
        const { error } = await supabase
          .from('cost_items')
          .insert([itemData]);

        if (error) throw error;
        alert('Línea de coste agregada exitosamente');
      }

      await recalculateBudget();
      setShowModal(false);
      resetForm();
      loadCostItems();
      loadProjects();
    } catch (error) {
      console.error('Error saving cost item:', error);
      alert('Error al guardar la línea de coste');
    } finally {
      setIsLoading(false);
    }
  };

  const recalculateBudget = async () => {
    if (!selectedProject) return;

    try {
      const { data: items, error: itemsError } = await supabase
        .from('cost_items')
        .select('category, amount, status')
        .eq('project_id', selectedProject.id);

      if (itemsError) throw itemsError;

      const categoryTotals: { [key: string]: { actual: number; committed: number } } = {};

      items?.forEach(item => {
        if (!categoryTotals[item.category]) {
          categoryTotals[item.category] = { actual: 0, committed: 0 };
        }

        if (item.status === 'paid') {
          categoryTotals[item.category].actual += item.amount;
        } else {
          categoryTotals[item.category].committed += item.amount;
        }
      });

      for (const [category, totals] of Object.entries(categoryTotals)) {
        const { data: breakdown, error: breakdownError } = await supabase
          .from('budget_breakdown')
          .select('budgeted')
          .eq('project_id', selectedProject.id)
          .eq('category', category)
          .single();

        if (breakdownError) continue;

        const budgeted = breakdown?.budgeted || 0;
        const variance = budgeted - totals.actual;
        const variancePercentage = budgeted > 0 ? ((totals.actual - budgeted) / budgeted) * 100 : 0;

        await supabase
          .from('budget_breakdown')
          .update({
            actual: totals.actual,
            committed: totals.committed,
            variance,
            variance_percentage: variancePercentage
          })
          .eq('project_id', selectedProject.id)
          .eq('category', category);
      }

      const totalActual = Object.values(categoryTotals).reduce((sum, t) => sum + t.actual, 0);
      const totalCommitted = Object.values(categoryTotals).reduce((sum, t) => sum + t.committed, 0);
      const grossProfit = selectedProject.total_budget - totalActual;
      const grossProfitMargin = selectedProject.total_budget > 0
        ? (grossProfit / selectedProject.total_budget) * 100
        : 0;
      const budgetVariance = selectedProject.total_budget - totalActual;
      const budgetVariancePercentage = selectedProject.total_budget > 0
        ? ((totalActual - selectedProject.total_budget) / selectedProject.total_budget) * 100
        : 0;

      await supabase
        .from('cost_control_projects')
        .update({
          total_actual_cost: totalActual,
          gross_profit: grossProfit,
          gross_profit_margin: grossProfitMargin,
          budget_variance: budgetVariance,
          budget_variance_percentage: budgetVariancePercentage
        })
        .eq('id', selectedProject.id);

    } catch (error) {
      console.error('Error recalculating budget:', error);
    }
  };

  const handleEdit = (item: CostItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      item_date: item.item_date,
      description: item.description,
      amount: item.amount.toString(),
      status: item.status,
      invoice_number: item.invoice_number || '',
      supplier_name: item.supplier_name || '',
      source: item.source
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('cost_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await recalculateBudget();
      setShowDeleteConfirm(null);
      loadCostItems();
      loadProjects();
      alert('Línea de coste eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting cost item:', error);
      alert('Error al eliminar la línea de coste');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'materials',
      item_date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      status: 'committed',
      invoice_number: '',
      supplier_name: '',
      source: 'manual'
    });
    setEditingItem(null);
  };

  const handleExportExcel = () => {
    if (filteredItems.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const exportData = filteredItems.map(item => ({
      'Fecha': new Date(item.item_date).toLocaleDateString('es-ES'),
      'Categoría': getCategoryLabel(item.category),
      'Descripción': item.description,
      'Proveedor': item.supplier_name || '-',
      'Nº Factura': item.invoice_number || '-',
      'Importe': item.amount,
      'Estado': getStatusLabel(item.status),
      'Origen': getSourceLabel(item.source)
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Líneas de Coste');

    const fileName = `lineas_coste_${selectedProject?.project_code}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      materials: 'Materiales',
      direct_labor: 'Mano de Obra Directa',
      subcontracts: 'Subcontratas',
      machinery: 'Maquinaria',
      insurance: 'Seguros',
      general_expenses: 'Gastos Generales',
      indirect_costs: 'Costes Indirectos'
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      planned: 'Planificado',
      committed: 'Comprometido',
      paid: 'Pagado'
    };
    return labels[status] || status;
  };

  const getSourceLabel = (source: string) => {
    const labels: { [key: string]: string } = {
      manual: 'Manual',
      supplier: 'Proveedor',
      payroll: 'Nómina',
      treasury: 'Tesorería'
    };
    return labels[source] || source;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'committed': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = filteredItems.reduce((sum, item) => sum + item.amount, 0);
  const paidAmount = filteredItems.filter(item => item.status === 'paid').reduce((sum, item) => sum + item.amount, 0);
  const committedAmount = filteredItems.filter(item => item.status === 'committed').reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Líneas de Coste</h2>
          <p className="text-gray-600">Ingrese y administre todas las líneas de coste por proyecto</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Línea de Coste</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Proyecto</label>
          <select
            value={selectedProject?.id || ''}
            onChange={(e) => {
              const project = projects.find(p => p.id === e.target.value);
              setSelectedProject(project || null);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
          >
            <option value="">Seleccionar proyecto...</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.project_code} - {project.project_name} ({project.client_name})
              </option>
            ))}
          </select>
        </div>

        {selectedProject && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-600 font-medium mb-1">Total Líneas</div>
              <div className="text-2xl font-bold text-blue-900">{filteredItems.length}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm text-green-600 font-medium mb-1">Pagado</div>
              <div className="text-2xl font-bold text-green-900">{formatCurrency(paidAmount)}</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="text-sm text-yellow-600 font-medium mb-1">Comprometido</div>
              <div className="text-2xl font-bold text-yellow-900">{formatCurrency(committedAmount)}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-purple-600 font-medium mb-1">Total</div>
              <div className="text-2xl font-bold text-purple-900">{formatCurrency(totalAmount)}</div>
            </div>
          </div>
        )}

        {selectedProject && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline h-4 w-4 mr-1" />
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Descripción, proveedor..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
              >
                <option value="all">Todas las categorías</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="planned">Planificado</option>
                <option value="committed">Comprometido</option>
                <option value="paid">Pagado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {selectedProject && budgetBreakdowns.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen por Categoría</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {budgetBreakdowns.map((breakdown) => {
              const percentage = breakdown.budgeted > 0
                ? (breakdown.actual / breakdown.budgeted) * 100
                : 0;
              const isOverBudget = percentage > 100;

              return (
                <div key={breakdown.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {getCategoryLabel(breakdown.category)}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Presupuestado:</span>
                      <span className="font-medium">{formatCurrency(breakdown.budgeted)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Real:</span>
                      <span className="font-medium text-blue-600">{formatCurrency(breakdown.actual)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disponible:</span>
                      <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(breakdown.budgeted - breakdown.actual)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Ejecutado</span>
                      <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-blue-600'}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${isOverBudget ? 'bg-red-600' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedProject && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Líneas de Coste ({filteredItems.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Importe</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Origen</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">No hay líneas de coste</p>
                      <p className="text-sm">Agregue la primera línea de coste para este proyecto</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.item_date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getCategoryLabel(item.category)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs">{item.description}</div>
                        {item.invoice_number && (
                          <div className="text-xs text-gray-500">Factura: {item.invoice_number}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.supplier_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                        {getSourceLabel(item.source)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(item.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!selectedProject && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Seleccione un Proyecto
          </h3>
          <p className="text-gray-600">
            Seleccione un proyecto con control de costes activado para comenzar a gestionar líneas de coste
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Editar Línea de Coste' : 'Nueva Línea de Coste'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              {selectedProject && (
                <p className="text-sm text-gray-600 mt-1">{selectedProject.project_name}</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                  >
                    <option value="materials">Materiales</option>
                    <option value="direct_labor">Mano de Obra Directa</option>
                    <option value="subcontracts">Subcontratas</option>
                    <option value="machinery">Maquinaria</option>
                    <option value="insurance">Seguros</option>
                    <option value="general_expenses">Gastos Generales</option>
                    <option value="indirect_costs">Costes Indirectos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.item_date}
                    onChange={(e) => setFormData({ ...formData, item_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción detallada del coste..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proveedor
                  </label>
                  <input
                    type="text"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                    placeholder="Nombre del proveedor"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Factura
                  </label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    placeholder="Ej: FAC-2024-001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Importe (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500"
                  >
                    <option value="planned">Planificado</option>
                    <option value="committed">Comprometido</option>
                    <option value="paid">Pagado</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading || !selectedProject}
                  className="flex-1 bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isLoading ? 'Guardando...' : editingItem ? 'Actualizar' : 'Guardar'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
              Confirmar Eliminación
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              ¿Está seguro de que desea eliminar esta línea de coste? Esta acción no se puede deshacer y recalculará todos los presupuestos.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {isLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostItemsManagement;
