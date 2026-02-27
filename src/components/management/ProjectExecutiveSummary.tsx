import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Building2, Search, ArrowUpDown, Download, Users, TrendingDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/formatUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ProjectSummary {
  id: string;
  code: string;
  name: string;
  status: string;
  presupuestoAdjudicado: number;
  produccionEjecutada: number;
  porcentajeEjecucion: number;
  facturadoAcumulado: number;
  pendienteFacturar: number;
  retenciones: number;
  costesReales: number;
  provisionCostes: number;
  costeEstimadoFinal: number;
  margenReal: number;
  margenPrevisto: number;
  porcentajeMargen: number;
}

interface WorkerStats {
  activeWorkers: number;
  newHires: number;
  terminations: number;
}

interface ProjectStats {
  newProjects: number;
  completedProjects: number;
  topProfitableProjects: Array<{
    name: string;
    code: string;
    profitability: number;
    margin: number;
  }>;
}

interface FinancialStats {
  monthlyBilling: number;
  monthlyPayroll: number;
}

type SortField = 'name' | 'porcentajeEjecucion' | 'porcentajeMargen' | 'presupuestoAdjudicado';
type SortOrder = 'asc' | 'desc';

const ProjectExecutiveSummary: React.FC = () => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'warning' | 'critical'>('all');
  const [sortField, setSortField] = useState<SortField>('porcentajeMargen');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [workerStats, setWorkerStats] = useState<WorkerStats>({ activeWorkers: 0, newHires: 0, terminations: 0 });
  const [projectStats, setProjectStats] = useState<ProjectStats>({ newProjects: 0, completedProjects: 0, topProfitableProjects: [] });
  const [financialStats, setFinancialStats] = useState<FinancialStats>({ monthlyBilling: 0, monthlyPayroll: 0 });

  useEffect(() => {
    loadProjectsSummary();
    loadAdditionalStats();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [projects, searchTerm, filterStatus, sortField, sortOrder]);

  const loadProjectsSummary = async () => {
    try {
      setIsLoading(true);

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, code, name, status, budget_amount')
        .in('status', ['active', 'in_progress', 'planning']);

      if (projectsError) throw projectsError;

      const summaries: ProjectSummary[] = [];

      for (const project of projectsData || []) {
        const presupuestoAdjudicado = project.budget_amount || 0;

        const { data: certData } = await supabase
          .from('certifications')
          .select('accumulated_amount')
          .eq('project_id', project.id)
          .order('issue_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        const produccionEjecutada = certData?.accumulated_amount || 0;
        const porcentajeEjecucion = presupuestoAdjudicado > 0
          ? (produccionEjecutada / presupuestoAdjudicado) * 100
          : 0;

        const { data: certifications } = await supabase
          .from('certifications')
          .select('net_amount, retention_amount, status')
          .eq('project_id', project.id)
          .eq('status', 'certified');

        const facturadoAcumulado = certifications?.reduce((sum, cert) => sum + (cert.net_amount || 0), 0) || 0;
        const retenciones = certifications?.reduce((sum, cert) => sum + (cert.retention_amount || 0), 0) || 0;
        const pendienteFacturar = produccionEjecutada - facturadoAcumulado;

        const { data: costsData } = await supabase
          .from('project_costs')
          .select('actual_amount')
          .eq('project_id', project.id);

        const costesReales = costsData?.reduce((sum, cost) => sum + (cost.actual_amount || 0), 0) || 0;

        const produccionPendiente = presupuestoAdjudicado - produccionEjecutada;
        const provisionCostes = produccionPendiente * 0.10;
        const costeEstimadoFinal = costesReales + provisionCostes;

        const margenReal = facturadoAcumulado - costesReales;
        const margenPrevisto = presupuestoAdjudicado - costeEstimadoFinal;
        const porcentajeMargen = presupuestoAdjudicado > 0
          ? (margenPrevisto / presupuestoAdjudicado) * 100
          : 0;

        summaries.push({
          id: project.id,
          code: project.code || '',
          name: project.name,
          status: project.status || 'active',
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
      }

      setProjects(summaries);
    } catch (error: any) {
      console.error('Error al cargar resumen de obras:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdditionalStats = async () => {
    try {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).toISOString();

      const { data: workersData } = await supabase
        .from('workers')
        .select('status, hire_date, termination_date');

      const activeWorkers = workersData?.filter(w => w.status === 'active').length || 0;
      const newHires = workersData?.filter(w =>
        w.hire_date && new Date(w.hire_date) >= new Date(firstDayOfMonth) && new Date(w.hire_date) <= new Date(lastDayOfMonth)
      ).length || 0;
      const terminations = workersData?.filter(w =>
        w.termination_date && new Date(w.termination_date) >= new Date(firstDayOfMonth) && new Date(w.termination_date) <= new Date(lastDayOfMonth)
      ).length || 0;

      setWorkerStats({ activeWorkers, newHires, terminations });

      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name, code, status, created_at, budget_amount');

      const newProjects = projectsData?.filter(p =>
        p.created_at && new Date(p.created_at) >= new Date(firstDayOfMonth) && new Date(p.created_at) <= new Date(lastDayOfMonth)
      ).length || 0;

      const completedProjects = projectsData?.filter(p => p.status === 'completed').length || 0;

      const projectProfitability = [];
      for (const project of projectsData || []) {
        const { data: certData } = await supabase
          .from('certifications')
          .select('accumulated_amount')
          .eq('project_id', project.id)
          .order('issue_date', { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: costsData } = await supabase
          .from('project_costs')
          .select('actual_amount')
          .eq('project_id', project.id);

        const production = certData?.accumulated_amount || 0;
        const costs = costsData?.reduce((sum, c) => sum + (c.actual_amount || 0), 0) || 0;
        const profit = production - costs;
        const margin = production > 0 ? (profit / production) * 100 : 0;

        if (production > 0) {
          projectProfitability.push({
            name: project.name,
            code: project.code || '',
            profitability: profit,
            margin
          });
        }
      }

      const topProfitableProjects = projectProfitability
        .sort((a, b) => b.margin - a.margin)
        .slice(0, 5);

      setProjectStats({ newProjects, completedProjects, topProfitableProjects });

      const { data: certificationsData } = await supabase
        .from('certifications')
        .select('net_amount, issue_date')
        .eq('status', 'certified')
        .gte('issue_date', firstDayOfMonth)
        .lte('issue_date', lastDayOfMonth);

      const monthlyBilling = certificationsData?.reduce((sum, c) => sum + (c.net_amount || 0), 0) || 0;

      const { data: settlementsData } = await supabase
        .from('settlements')
        .select('net_amount, settlement_date')
        .gte('settlement_date', firstDayOfMonth)
        .lte('settlement_date', lastDayOfMonth);

      const monthlyPayroll = settlementsData?.reduce((sum, s) => sum + (s.net_amount || 0), 0) || 0;

      setFinancialStats({ monthlyBilling, monthlyPayroll });

    } catch (error) {
      console.error('Error al cargar estadísticas adicionales:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => {
        if (filterStatus === 'active') return p.porcentajeMargen > 15;
        if (filterStatus === 'warning') return p.porcentajeMargen >= 5 && p.porcentajeMargen <= 15;
        if (filterStatus === 'critical') return p.porcentajeMargen < 5;
        return true;
      });
    }

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    setFilteredProjects(filtered);
  };

  const getMarginStatus = (percentage: number) => {
    if (percentage > 15) return {
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      label: 'Óptimo',
      icon: CheckCircle
    };
    if (percentage >= 5) return {
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      label: 'Aceptable',
      icon: AlertTriangle
    };
    return {
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Crítico',
      icon: AlertTriangle
    };
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const totals = {
    presupuestoAdjudicado: filteredProjects.reduce((sum, p) => sum + p.presupuestoAdjudicado, 0),
    produccionEjecutada: filteredProjects.reduce((sum, p) => sum + p.produccionEjecutada, 0),
    facturadoAcumulado: filteredProjects.reduce((sum, p) => sum + p.facturadoAcumulado, 0),
    costesReales: filteredProjects.reduce((sum, p) => sum + p.costesReales, 0),
    margenPrevisto: filteredProjects.reduce((sum, p) => sum + p.margenPrevisto, 0)
  };

  const globalMarginPercentage = totals.presupuestoAdjudicado > 0
    ? (totals.margenPrevisto / totals.presupuestoAdjudicado) * 100
    : 0;

  const exportToPDF = () => {
    const doc = new jsPDF();
    const now = new Date();
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const currentMonthName = monthNames[now.getMonth()];
    const currentYear = now.getFullYear();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO DE GESTION', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periodo: ${currentMonthName} ${currentYear}`, 105, 28, { align: 'center' });
    doc.text(`Fecha de generacion: ${now.toLocaleDateString('es-ES')}`, 105, 34, { align: 'center' });

    let yPos = 45;

    doc.setFillColor(59, 130, 246);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RECURSOS HUMANOS', 105, yPos + 5.5, { align: 'center' });
    yPos += 12;

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const workerData = [
      ['Trabajadores Activos', workerStats.activeWorkers.toString()],
      ['Altas del Mes', workerStats.newHires.toString()],
      ['Bajas del Mes', workerStats.terminations.toString()]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Concepto', 'Cantidad']],
      body: workerData,
      theme: 'grid',
      headStyles: { fillColor: [219, 234, 254], textColor: [0, 0, 0], fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    doc.setFillColor(16, 185, 129);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PROYECTOS', 105, yPos + 5.5, { align: 'center' });
    yPos += 12;

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    const projectData = [
      ['Proyectos Nuevos', projectStats.newProjects.toString()],
      ['Proyectos Terminados', projectStats.completedProjects.toString()],
      ['Proyectos Activos', filteredProjects.length.toString()]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Concepto', 'Cantidad']],
      body: projectData,
      theme: 'grid',
      headStyles: { fillColor: [209, 250, 229], textColor: [0, 0, 0], fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(168, 85, 247);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOP 5 PROYECTOS MAS RENTABLES', 105, yPos + 5.5, { align: 'center' });
    yPos += 12;

    doc.setTextColor(0, 0, 0);

    const topProjectsData = projectStats.topProfitableProjects.map(p => [
      p.code,
      p.name,
      `${p.margin.toFixed(2)}%`,
      formatCurrency(p.profitability)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Codigo', 'Proyecto', 'Margen %', 'Beneficio']],
      body: topProjectsData,
      theme: 'grid',
      headStyles: { fillColor: [237, 233, 254], textColor: [0, 0, 0], fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(251, 146, 60);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ANALISIS FINANCIERO DEL MES', 105, yPos + 5.5, { align: 'center' });
    yPos += 12;

    doc.setTextColor(0, 0, 0);

    const financialData = [
      ['Facturado en el Mes', formatCurrency(financialStats.monthlyBilling)],
      ['Pagado en Mano de Obra', formatCurrency(financialStats.monthlyPayroll)],
      ['Diferencia', formatCurrency(financialStats.monthlyBilling - financialStats.monthlyPayroll)]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Concepto', 'Importe']],
      body: financialData,
      theme: 'grid',
      headStyles: { fillColor: [254, 243, 199], textColor: [0, 0, 0], fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(239, 68, 68);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN GLOBAL DE OBRAS', 105, yPos + 5.5, { align: 'center' });
    yPos += 12;

    doc.setTextColor(0, 0, 0);

    const summaryData = [
      ['Total Presupuestado', formatCurrency(totals.presupuestoAdjudicado)],
      ['Produccion Ejecutada', formatCurrency(totals.produccionEjecutada)],
      ['Facturado Total', formatCurrency(totals.facturadoAcumulado)],
      ['Costes Totales', formatCurrency(totals.costesReales)],
      ['Margen Global', `${globalMarginPercentage.toFixed(2)}%`]
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Concepto', 'Valor']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [254, 226, 226], textColor: [0, 0, 0], fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(100, 116, 139);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE OBRAS ACTIVAS', 105, yPos + 5.5, { align: 'center' });
    yPos += 12;

    const projectsDetailData = filteredProjects.map(p => [
      p.code,
      p.name,
      formatCurrency(p.presupuestoAdjudicado),
      `${p.porcentajeEjecucion.toFixed(1)}%`,
      formatCurrency(p.facturadoAcumulado),
      formatCurrency(p.costesReales),
      `${p.porcentajeMargen.toFixed(1)}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Cod', 'Proyecto', 'Presupuesto', '% Ejec', 'Facturado', 'Costes', 'Margen %']],
      body: projectsDetailData,
      theme: 'grid',
      headStyles: { fillColor: [226, 232, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 45 },
        2: { cellWidth: 25 },
        3: { cellWidth: 18 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 20 }
      }
    });

    doc.save(`Resumen_Ejecutivo_${currentMonthName}_${currentYear}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando resumen de obras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con resumen global */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Resumen Ejecutivo de Obras</h2>
              <p className="text-sm text-gray-600">Vista consolidada de indicadores financieros</p>
            </div>
          </div>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all hover:scale-105"
          >
            <Download className="w-5 h-5" />
            <span className="font-semibold">Generar PDF Ejecutivo</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Total Presupuestado</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totals.presupuestoAdjudicado)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Producción Ejecutada</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totals.produccionEjecutada)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Facturado Total</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totals.facturadoAcumulado)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Costes Totales</p>
            <p className="text-xl font-bold text-purple-600">{formatCurrency(totals.costesReales)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Margen Global</p>
            <p className={`text-xl font-bold ${getMarginStatus(globalMarginPercentage).color}`}>
              {globalMarginPercentage.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recursos Humanos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Recursos Humanos</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Trabajadores Activos</span>
              <span className="text-lg font-bold text-blue-600">{workerStats.activeWorkers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Altas del Mes</span>
              <span className="text-lg font-bold text-green-600">{workerStats.newHires}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bajas del Mes</span>
              <span className="text-lg font-bold text-red-600">{workerStats.terminations}</span>
            </div>
          </div>
        </div>

        {/* Proyectos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Proyectos</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Proyectos Nuevos</span>
              <span className="text-lg font-bold text-green-600">{projectStats.newProjects}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Proyectos Terminados</span>
              <span className="text-lg font-bold text-gray-600">{projectStats.completedProjects}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Proyectos Activos</span>
              <span className="text-lg font-bold text-blue-600">{filteredProjects.length}</span>
            </div>
          </div>
        </div>

        {/* Financiero del Mes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-bold text-gray-900">Financiero del Mes</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Facturado</span>
              <span className="text-sm font-bold text-green-600">{formatCurrency(financialStats.monthlyBilling)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Mano de Obra</span>
              <span className="text-sm font-bold text-red-600">{formatCurrency(financialStats.monthlyPayroll)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Diferencia</span>
              <span className={`text-sm font-bold ${financialStats.monthlyBilling - financialStats.monthlyPayroll >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(financialStats.monthlyBilling - financialStats.monthlyPayroll)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 5 Proyectos más Rentables */}
      {projectStats.topProfitableProjects.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold text-gray-900">Top 5 Proyectos más Rentables</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Código</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Proyecto</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Margen %</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Beneficio</th>
                </tr>
              </thead>
              <tbody>
                {projectStats.topProfitableProjects.map((project, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{project.code}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{project.name}</td>
                    <td className="py-3 px-4 text-sm font-bold text-right text-green-600">{project.margin.toFixed(2)}%</td>
                    <td className="py-3 px-4 text-sm font-bold text-right text-blue-600">{formatCurrency(project.profitability)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre o código de obra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({projects.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              Óptimas
            </button>
            <button
              onClick={() => setFilterStatus('warning')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'warning'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
              }`}
            >
              Aceptables
            </button>
            <button
              onClick={() => setFilterStatus('critical')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'critical'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Críticas
            </button>
          </div>
        </div>
      </div>

      {/* Lista de obras */}
      <div className="space-y-3">
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron obras con los filtros aplicados</p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const marginStatus = getMarginStatus(project.porcentajeMargen);
            const Icon = marginStatus.icon;

            return (
              <div
                key={project.id}
                className={`bg-white rounded-lg shadow-sm border-2 ${marginStatus.border} hover:shadow-md transition-all`}
              >
                <div className="p-6">
                  {/* Header de la obra */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                          {project.code}
                        </span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${marginStatus.bg}`}>
                      <Icon className={`w-5 h-5 ${marginStatus.color}`} />
                      <div className="text-right">
                        <p className={`text-xs font-medium ${marginStatus.color}`}>{marginStatus.label}</p>
                        <p className={`text-xl font-bold ${marginStatus.color}`}>
                          {project.porcentajeMargen.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grid de indicadores */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* BLOQUE 1 - PRODUCCIÓN */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <p className="text-xs font-semibold text-gray-700 uppercase">Producción</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Presupuestado</p>
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(project.presupuestoAdjudicado)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Ejecutado</p>
                        <p className="text-sm font-bold text-blue-600">{formatCurrency(project.produccionEjecutada)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">% Ejecución</p>
                        <p className="text-sm font-bold text-blue-600">{project.porcentajeEjecucion.toFixed(1)}%</p>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(project.porcentajeEjecucion, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* BLOQUE 2 - FACTURACIÓN */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 text-green-600">€</div>
                        <p className="text-xs font-semibold text-gray-700 uppercase">Facturación</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Facturado</p>
                        <p className="text-sm font-bold text-green-600">{formatCurrency(project.facturadoAcumulado)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Pendiente</p>
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(project.pendienteFacturar)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Retenciones</p>
                        <p className="text-sm font-bold text-orange-600">{formatCurrency(project.retenciones)}</p>
                      </div>
                    </div>

                    {/* BLOQUE 3 - COSTES */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 text-purple-600">💰</div>
                        <p className="text-xs font-semibold text-gray-700 uppercase">Costes</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Reales</p>
                        <p className="text-sm font-bold text-purple-600">{formatCurrency(project.costesReales)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Provisiones</p>
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(project.provisionCostes)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Estimado Final</p>
                        <p className="text-sm font-bold text-purple-700">{formatCurrency(project.costeEstimadoFinal)}</p>
                      </div>
                    </div>

                    {/* BLOQUE 4 - MARGEN */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 ${marginStatus.color}`} />
                        <p className="text-xs font-semibold text-gray-700 uppercase">Margen</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Real</p>
                        <p className={`text-sm font-bold ${marginStatus.color}`}>
                          {formatCurrency(project.margenReal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Previsto</p>
                        <p className={`text-sm font-bold ${marginStatus.color}`}>
                          {formatCurrency(project.margenPrevisto)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">% sobre Ppto</p>
                        <p className={`text-lg font-bold ${marginStatus.color}`}>
                          {project.porcentajeMargen.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProjectExecutiveSummary;
