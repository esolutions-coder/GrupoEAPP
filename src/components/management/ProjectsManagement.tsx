import React, { useState, useEffect } from 'react';
import {
  Building2, Plus, Search, Edit, Trash2, Eye, Calendar,
  DollarSign, BarChart3, FileText, AlertTriangle, Download,
  Upload, X, CheckCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { exportToPDF, exportToExcel, printTable } from '../../utils/exportUtils';
import { showSuccessNotification, showErrorNotification } from '../../utils/modalUtils';
import { formatCurrency, formatNumber } from '../../utils/formatUtils';
import * as XLSX from 'xlsx';
import { ProjectFormModal, ViewModal, InfoTab, GenericDataTable } from './ProjectsForms';
import ProjectControlPanel from './ProjectControlPanel';
import type {
  Project,
  ProjectBudget,
  ProjectBudgetItem,
  ProjectMeasurement,
  ProjectCertification,
  ProjectCost,
  ProjectQualitySafety,
  ProjectDocument
} from '../../types/projects';

const ProjectsManagement: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'budget' | 'measurements' | 'certifications' | 'costs' | 'quality' | 'documents'>('info');
  const [isLoading, setIsLoading] = useState(false);

  const [budgets, setBudgets] = useState<ProjectBudget[]>([]);
  const [budgetItems, setBudgetItems] = useState<ProjectBudgetItem[]>([]);
  const [measurements, setMeasurements] = useState<ProjectMeasurement[]>([]);
  const [certifications, setCertifications] = useState<ProjectCertification[]>([]);
  const [costs, setCosts] = useState<ProjectCost[]>([]);
  const [qualitySafety, setQualitySafety] = useState<ProjectQualitySafety[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);

  const [showCostForm, setShowCostForm] = useState(false);
  const [showQualityForm, setShowQualityForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);

  const [controlPanelData, setControlPanelData] = useState({
    presupuestoAdjudicado: 0,
    produccionEjecutada: 0,
    porcentajeEjecucion: 0,
    facturadoAcumulado: 0,
    pendienteFacturar: 0,
    retenciones: 0,
    costesReales: 0,
    provisionCostes: 0,
    costeEstimadoFinal: 0,
    margenReal: 0,
    margenPrevisto: 0,
    porcentajeMargen: 0
  });

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    client_id: '',
    project_manager: '',
    start_date: '',
    end_date: '',
    hourly_rate_labor: 0,
    hourly_rate_machinery: 0,
    budget_amount: 0,
    status: 'planning',
    address: '',
    city: '',
    description: ''
  });

  useEffect(() => {
    loadProjects();
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectData(selectedProject.id);
    }
  }, [selectedProject, activeTab]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      showErrorNotification('Error al cargar obras', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      showErrorNotification('Error al cargar clientes', error.message);
    }
  };

  const loadProjectData = async (projectId: string) => {
    try {
      if (activeTab === 'budget') {
        const { data: budgetData, error: budgetError } = await supabase
          .from('budget_summary')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });
        if (budgetError) throw budgetError;
        setBudgets(budgetData || []);

        if (budgetData && budgetData.length > 0) {
          const { data: itemsData, error: itemsError } = await supabase
            .from('budget_items')
            .select('*')
            .eq('budget_id', budgetData[0].budget_id)
            .order('display_order');
          if (itemsError) throw itemsError;
          setBudgetItems(itemsData || []);
        } else {
          setBudgetItems([]);
        }
      } else if (activeTab === 'measurements') {
        const { data, error } = await supabase
          .from('measurement_summary_by_chapter')
          .select('*')
          .eq('project_id', projectId)
          .order('chapter_code');
        if (error) throw error;
        setMeasurements(data || []);
      } else if (activeTab === 'certifications') {
        const { data, error } = await supabase
          .from('certifications')
          .select('*')
          .eq('project_id', projectId)
          .order('issue_date', { ascending: false });
        if (error) throw error;
        setCertifications(data || []);

        // Cargar datos para el panel de control
        await loadControlPanelData(projectId);
      } else if (activeTab === 'costs') {
        const { data, error } = await supabase
          .from('project_costs')
          .select('*')
          .eq('project_id', projectId)
          .order('cost_date', { ascending: false });
        if (error) throw error;
        setCosts(data || []);
      } else if (activeTab === 'quality') {
        const { data, error } = await supabase
          .from('project_quality_safety')
          .select('*')
          .eq('project_id', projectId)
          .order('record_date', { ascending: false });
        if (error) throw error;
        setQualitySafety(data || []);
      } else if (activeTab === 'documents') {
        const { data, error } = await supabase
          .from('project_documents')
          .select('*')
          .eq('project_id', projectId)
          .order('upload_date', { ascending: false });
        if (error) throw error;
        setDocuments(data || []);
      }
    } catch (error: any) {
      showErrorNotification('Error al cargar datos', error.message);
    }
  };

  const loadControlPanelData = async (projectId: string) => {
    try {
      // BLOQUE 1 - PRODUCCIÓN
      const project = projects.find(p => p.id === projectId);
      const presupuestoAdjudicado = project?.budget_amount || 0;

      // Obtener producción ejecutada de certificaciones
      const { data: certData } = await supabase
        .from('certifications')
        .select('accumulated_amount')
        .eq('project_id', projectId)
        .order('issue_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      const produccionEjecutada = certData?.accumulated_amount || 0;
      const porcentajeEjecucion = presupuestoAdjudicado > 0
        ? (produccionEjecutada / presupuestoAdjudicado) * 100
        : 0;

      // BLOQUE 2 - FACTURACIÓN
      const { data: certifications } = await supabase
        .from('certifications')
        .select('net_amount, retention_amount, status')
        .eq('project_id', projectId)
        .eq('status', 'certified');

      const facturadoAcumulado = certifications?.reduce((sum, cert) => sum + (cert.net_amount || 0), 0) || 0;
      const retenciones = certifications?.reduce((sum, cert) => sum + (cert.retention_amount || 0), 0) || 0;
      const pendienteFacturar = produccionEjecutada - facturadoAcumulado;

      // BLOQUE 3 - COSTES
      const { data: costsData } = await supabase
        .from('project_costs')
        .select('actual_amount')
        .eq('project_id', projectId);

      const costesReales = costsData?.reduce((sum, cost) => sum + (cost.actual_amount || 0), 0) || 0;

      // Provisión de costes: 10% de la producción pendiente
      const produccionPendiente = presupuestoAdjudicado - produccionEjecutada;
      const provisionCostes = produccionPendiente * 0.10;

      const costeEstimadoFinal = costesReales + provisionCostes;

      // BLOQUE 4 - MARGEN
      const margenReal = facturadoAcumulado - costesReales;
      const margenPrevisto = presupuestoAdjudicado - costeEstimadoFinal;
      const porcentajeMargen = presupuestoAdjudicado > 0
        ? (margenPrevisto / presupuestoAdjudicado) * 100
        : 0;

      setControlPanelData({
        presupuestoAdjudicado,
        produccionEjecutada,
        porcentajeEjecucion,
        facturadoAcumulado,
        pendienteFacturar,
        retenciones,
        costesReales,
        provisionCostes,
        costeEstimadoFinal,
        margenReal,
        margenPrevisto,
        porcentajeMargen
      });
    } catch (error: any) {
      console.error('Error al cargar datos del panel de control:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    setFormData({
      code: `OBR-${Date.now()}`,
      name: '',
      client_id: '',
      project_manager: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      hourly_rate_labor: 0,
      hourly_rate_machinery: 0,
      budget_amount: 0,
      status: 'planning',
      address: '',
      city: '',
      description: ''
    });
    setShowCreateModal(true);
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      code: project.code,
      name: project.name,
      client_id: project.client_id,
      project_manager: project.project_manager || '',
      start_date: project.start_date,
      end_date: project.end_date || '',
      hourly_rate_labor: project.hourly_rate_labor || 0,
      hourly_rate_machinery: project.hourly_rate_machinery || 0,
      budget_amount: project.budget_amount || 0,
      status: project.status,
      address: project.address || '',
      city: project.city || '',
      description: project.description || ''
    });
    setShowEditModal(true);
  };

  const handleView = async (project: Project) => {
    setSelectedProject(project);
    setActiveTab('info');

    const client = clients.find(c => c.id === project.client_id);
    setSelectedClient(client);

    setShowViewModal(true);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cleanData = {
        code: formData.code,
        name: formData.name,
        client_id: formData.client_id,
        project_manager: formData.project_manager || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        hourly_rate_labor: formData.hourly_rate_labor || 0,
        hourly_rate_machinery: formData.hourly_rate_machinery || 0,
        budget_amount: formData.budget_amount || 0,
        status: formData.status,
        address: formData.address || null,
        city: formData.city || null,
        description: formData.description || null
      };

      const { error } = await supabase
        .from('projects')
        .insert([cleanData]);

      if (error) throw error;

      showSuccessNotification('Obra creada correctamente');
      setShowCreateModal(false);
      loadProjects();
    } catch (error: any) {
      showErrorNotification('Error al crear obra', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setIsLoading(true);

    try {
      const cleanData = {
        code: formData.code,
        name: formData.name,
        client_id: formData.client_id,
        project_manager: formData.project_manager || null,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        hourly_rate_labor: formData.hourly_rate_labor || 0,
        hourly_rate_machinery: formData.hourly_rate_machinery || 0,
        budget_amount: formData.budget_amount || 0,
        status: formData.status,
        address: formData.address || null,
        city: formData.city || null,
        description: formData.description || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('projects')
        .update(cleanData)
        .eq('id', selectedProject.id);

      if (error) throw error;

      showSuccessNotification('Obra actualizada correctamente');
      setShowEditModal(false);
      loadProjects();
    } catch (error: any) {
      showErrorNotification('Error al actualizar obra', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`¿Estás seguro de eliminar la obra ${project.name}?`)) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      showSuccessNotification('Obra eliminada correctamente');
      loadProjects();
    } catch (error: any) {
      showErrorNotification('Error al eliminar obra', error.message);
    }
  };

  const handleExportPDF = () => {
    const exportData = {
      title: 'Listado de Obras - Grupo EA',
      headers: ['Código', 'Nombre', 'Cliente', 'Responsable', 'Inicio', 'Fin', 'Presupuesto', 'Estado'],
      data: filteredProjects.map(p => [
        p.code || '',
        p.name,
        clients.find(c => c.id === p.client_id)?.name || 'N/A',
        p.project_manager || 'N/A',
        p.start_date,
        p.end_date || 'N/A',
        formatCurrency(p.budget_amount),
        p.status === 'planning' ? 'Planificación' :
        p.status === 'in_progress' ? 'En Progreso' :
        p.status === 'completed' ? 'Completado' :
        p.status === 'cancelled' ? 'Cancelado' : 'Pausado'
      ]),
      filename: `obras_${new Date().toISOString().split('T')[0]}`
    };
    exportToPDF(exportData);
  };

  const handleExportExcel = () => {
    const exportData = {
      title: 'Listado de Obras - Grupo EA',
      headers: ['Código', 'Nombre', 'Cliente', 'Responsable', 'Inicio', 'Fin', 'Presupuesto', 'Precio/h Operarios', 'Precio/h Maquinaria', 'Estado'],
      data: filteredProjects.map(p => [
        p.code || '',
        p.name,
        clients.find(c => c.id === p.client_id)?.name || 'N/A',
        p.project_manager || 'N/A',
        p.start_date,
        p.end_date || 'N/A',
        p.budget_amount || 0,
        p.hourly_rate_labor || 0,
        p.hourly_rate_machinery || 0,
        p.status
      ]),
      filename: `obras_${new Date().toISOString().split('T')[0]}`
    };
    exportToExcel(exportData);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const projectsToImport = jsonData.map((row: any) => {
        const clientCode = row['Código Cliente'] || row['client_code'];
        const client = clients.find(c => c.code === clientCode);

        return {
          code: row['Código'] || row['code'],
          name: row['Nombre'] || row['name'],
          client_id: client?.id || null,
          client_name: row['Cliente'] || row['client_name'] || '',
          location: row['Ubicación'] || row['location'] || '',
          description: row['Descripción'] || row['description'] || '',
          project_manager: row['Responsable'] || row['project_manager'] || '',
          responsible: row['Jefe de Obra'] || row['responsible'] || '',
          start_date: row['Fecha Inicio'] || row['start_date'],
          end_date: row['Fecha Fin'] || row['end_date'],
          estimated_end_date: row['Fecha Fin Estimada'] || row['estimated_end_date'] || row['Fecha Fin'] || row['end_date'],
          total_budget: parseFloat(row['Presupuesto'] || row['total_budget'] || 0),
          hourly_rate_labor: parseFloat(row['Precio/h Operarios'] || row['hourly_rate_labor'] || 0),
          hourly_rate_machinery: parseFloat(row['Precio/h Maquinaria'] || row['hourly_rate_machinery'] || 0),
          status: row['Estado'] || row['status'] || 'planning',
          created_by: 'import',
          updated_by: 'import'
        };
      });

      const { error } = await supabase
        .from('projects')
        .insert(projectsToImport);

      if (error) throw error;

      showSuccessNotification(`${projectsToImport.length} proyectos importados correctamente`);
      await loadProjects();
    } catch (error: any) {
      console.error('Error importing projects:', error);
      showErrorNotification(error.message || 'Error al importar proyectos');
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const stats = [
    { label: 'Total Obras', value: projects.length.toString(), icon: Building2, color: 'text-blue-600' },
    { label: 'En Progreso', value: projects.filter(p => p.status === 'in_progress').length.toString(), icon: BarChart3, color: 'text-green-600' },
    { label: 'Planificación', value: projects.filter(p => p.status === 'planning').length.toString(), icon: Calendar, color: 'text-yellow-600' },
    { label: 'Completadas', value: projects.filter(p => p.status === 'completed').length.toString(), icon: FileText, color: 'text-gray-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Obras</h2>
          <p className="text-gray-600">Administra obras, presupuestos, certificaciones y documentación</p>
        </div>
        <div className="flex space-x-3">
          <label className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2 cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Importar</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="hidden"
              disabled={isLoading}
            />
          </label>
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isLoading}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
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
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Obra</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-12 w-12 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="planning">Planificación</option>
            <option value="in_progress">En Progreso</option>
            <option value="paused">Pausado</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fechas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Presupuesto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Cargando obras...
                </td>
              </tr>
            ) : filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  No hay obras disponibles
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {project.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-500">{project.city || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {clients.find(c => c.id === project.client_id)?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.project_manager || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{project.start_date}</div>
                    <div className="text-sm text-gray-500">{project.end_date || 'No definida'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(project.budget_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      project.status === 'paused' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status === 'completed' ? 'Completado' :
                       project.status === 'in_progress' ? 'En Progreso' :
                       project.status === 'cancelled' ? 'Cancelado' :
                       project.status === 'paused' ? 'Pausado' : 'Planificación'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleView(project)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(project)}
                        className="text-green-600 hover:text-green-900"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(project)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProjectFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSubmitCreate}
        formData={formData}
        setFormData={setFormData}
        isLoading={isLoading}
        clients={clients}
      />

      <ProjectFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleSubmitEdit}
        formData={formData}
        setFormData={setFormData}
        isLoading={isLoading}
        isEdit={true}
        clients={clients}
      />

      {selectedProject && (
        <ViewModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          project={selectedProject}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          {activeTab === 'info' && <InfoTab project={selectedProject} client={selectedClient} />}

          {activeTab === 'budget' && (
            <div className="space-y-6">
              <GenericDataTable
                title="Presupuestos"
                data={budgets}
                columns={[
                  { key: 'budget_code', label: 'Código' },
                  { key: 'version', label: 'Versión' },
                  { key: 'contractor', label: 'Contratista' },
                  { key: 'issue_date', label: 'Fecha Emisión', render: (val) => new Date(val).toLocaleDateString() },
                  { key: 'total', label: 'Total', render: (val) => formatCurrency(val) },
                  { key: 'status', label: 'Estado', render: (val) => (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      val === 'approved' ? 'bg-green-100 text-green-800' :
                      val === 'rejected' ? 'bg-red-100 text-red-800' :
                      val === 'closed' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {val === 'approved' ? 'Aprobado' : val === 'rejected' ? 'Rechazado' : val === 'closed' ? 'Cerrado' : 'Borrador'}
                    </span>
                  )},
                  { key: 'approved_by', label: 'Aprobado por', render: (val) => val || 'N/A' }
                ]}
                emptyMessage="No hay presupuestos registrados para este proyecto. Crea uno desde el módulo de Presupuestos."
              />

              {budgetItems.length > 0 && (
                <GenericDataTable
                  title="Partidas del Presupuesto (Última Versión)"
                  data={budgetItems}
                  columns={[
                    { key: 'chapter', label: 'Capítulo' },
                    { key: 'item_code', label: 'Código' },
                    { key: 'description', label: 'Descripción' },
                    { key: 'quantity', label: 'Cantidad', render: (val) => formatNumber(val) },
                    { key: 'unit', label: 'Unidad' },
                    { key: 'unit_price', label: 'P. Unitario', render: (val) => formatCurrency(val) },
                    { key: 'total_price', label: 'Total', render: (val) => formatCurrency(val) }
                  ]}
                  emptyMessage="No hay partidas en este presupuesto"
                />
              )}
            </div>
          )}

          {activeTab === 'measurements' && (
            <GenericDataTable
              title="Resumen de Mediciones por Capítulo"
              data={measurements}
              columns={[
                { key: 'chapter_code', label: 'Código' },
                { key: 'chapter_name', label: 'Capítulo' },
                { key: 'total_items', label: 'Partidas', render: (val) => formatNumber(val) },
                { key: 'total_budgeted', label: 'Presupuestado', render: (val) => formatCurrency(val || 0) },
                { key: 'total_measured', label: 'Medido', render: (val) => formatCurrency(val || 0) },
                { key: 'total_certified', label: 'Certificado', render: (val) => formatCurrency(val || 0) },
                { key: 'certified_records', label: 'Certificaciones', render: (val) => formatNumber(val || 0) }
              ]}
              emptyMessage="No hay mediciones registradas para este proyecto. Crea mediciones desde el módulo de Mediciones."
            />
          )}

          {activeTab === 'certifications' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Certificaciones Totales</p>
                      <p className="text-2xl font-bold text-gray-900">{certifications.length}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Certificadas</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {certifications.filter(c => c.status === 'certified').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pendientes Firma</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {certifications.filter(c => c.status === 'validated').length}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Valor Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(certifications.reduce((sum, c) => sum + (c.total_amount || 0), 0))}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Tabla de Certificaciones */}
              <GenericDataTable
              title="Certificaciones"
              data={certifications}
              columns={[
                { key: 'certification_number', label: 'CERTIFICACIÓN' },
                { key: 'contractor', label: 'PROYECTO' },
                { key: 'total_amount', label: 'VALOR', render: (val) => formatCurrency(val || 0) },
                { key: 'accumulated_amount', label: 'FIRMAS', render: (val, row) => {
                  const totalSignatures = 3;
                  const completedSignatures = row.status === 'certified' ? 3 : row.status === 'validated' ? 2 : 0;
                  return (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalSignatures }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < completedSignatures ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">{completedSignatures}/{totalSignatures}</span>
                    </div>
                  );
                }},
                { key: 'status', label: 'ESTADO', render: (val) => (
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    val === 'certified' ? 'bg-green-100 text-green-800' :
                    val === 'rejected' ? 'bg-red-100 text-red-800' :
                    val === 'validated' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {val === 'certified' ? 'Certificada' : val === 'rejected' ? 'Rechazada' : val === 'validated' ? 'Validada' : 'Borrador'}
                  </span>
                )},
                { key: 'issue_date', label: 'ACCIONES', render: (val, row) => (
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Ver">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-orange-600 hover:bg-orange-50 rounded" title="Descargar">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                )}
              ]}
              emptyMessage="No hay certificaciones registradas para este proyecto. Crea certificaciones desde el módulo de Certificaciones."
            />
            </div>
          )}

          {activeTab === 'costs' && (
            <div className="space-y-6">
              <GenericDataTable
                title="Análisis de Costes"
                data={costs}
                columns={[
                  { key: 'cost_date', label: 'Fecha' },
                  { key: 'cost_type', label: 'Tipo', render: (val) => val === 'direct' ? 'Directo' : 'Indirecto' },
                  { key: 'category', label: 'Categoría', render: (val) =>
                    val === 'labor' ? 'Mano de obra' :
                    val === 'materials' ? 'Materiales' :
                    val === 'machinery' ? 'Maquinaria' :
                    val === 'subcontracts' ? 'Subcontratos' : 'Otros'
                  },
                  { key: 'description', label: 'Descripción' },
                  { key: 'amount', label: 'Importe', render: (val) => (val || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) },
                  { key: 'invoice_number', label: 'Nº Factura', render: (val) => val || 'N/A' }
                ]}
                onAdd={() => setShowCostForm(true)}
                emptyMessage="No hay costes registrados"
              />

              {costs.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Resumen Económico</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Costes Directos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {costs.filter(c => c.cost_type === 'direct').reduce((sum, c) => sum + c.amount, 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Costes Indirectos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {costs.filter(c => c.cost_type === 'indirect').reduce((sum, c) => sum + c.amount, 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Costes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {costs.reduce((sum, c) => sum + c.amount, 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quality' && (
            <GenericDataTable
              title="Calidad y Seguridad"
              data={qualitySafety}
              columns={[
                { key: 'record_date', label: 'Fecha' },
                { key: 'record_type', label: 'Tipo', render: (val) =>
                  val === 'incident' ? 'Incidente' :
                  val === 'inspection' ? 'Inspección' : 'Medida'
                },
                { key: 'category', label: 'Categoría', render: (val) =>
                  val === 'quality' ? 'Calidad' :
                  val === 'safety' ? 'Seguridad' : 'Medio Ambiente'
                },
                { key: 'severity', label: 'Severidad', render: (val) => (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    val === 'critical' ? 'bg-red-100 text-red-800' :
                    val === 'high' ? 'bg-orange-100 text-orange-800' :
                    val === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {val === 'critical' ? 'Crítica' : val === 'high' ? 'Alta' : val === 'medium' ? 'Media' : 'Baja'}
                  </span>
                )},
                { key: 'description', label: 'Descripción' },
                { key: 'status', label: 'Estado', render: (val) => (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    val === 'closed' ? 'bg-gray-100 text-gray-800' :
                    val === 'resolved' ? 'bg-green-100 text-green-800' :
                    val === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {val === 'closed' ? 'Cerrado' : val === 'resolved' ? 'Resuelto' : val === 'in_progress' ? 'En Proceso' : 'Abierto'}
                  </span>
                )}
              ]}
              onAdd={() => setShowQualityForm(true)}
              emptyMessage="No hay registros de calidad/seguridad"
            />
          )}

          {activeTab === 'documents' && (
            <GenericDataTable
              title="Documentación"
              data={documents}
              columns={[
                { key: 'document_type', label: 'Tipo', render: (val) =>
                  val === 'photo' ? 'Fotografía' :
                  val === 'plan' ? 'Plano' :
                  val === 'report' ? 'Informe' :
                  val === 'contract' ? 'Contrato' : 'Otro'
                },
                { key: 'title', label: 'Título' },
                { key: 'description', label: 'Descripción', render: (val) => val || 'N/A' },
                { key: 'uploaded_by', label: 'Subido por', render: (val) => val || 'N/A' },
                { key: 'upload_date', label: 'Fecha', render: (val) => new Date(val).toLocaleDateString() },
                { key: 'file_url', label: 'Archivo', render: (val) => val ? (
                  <a href={val} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Ver archivo
                  </a>
                ) : 'N/A' }
              ]}
              onAdd={() => setShowDocumentForm(true)}
              emptyMessage="No hay documentos registrados"
            />
          )}
        </ViewModal>
      )}
    </div>
  );
};

export default ProjectsManagement;
