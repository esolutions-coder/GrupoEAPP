import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, FileText, Download,
  RefreshCw, Filter, Calendar, BarChart3, PieChart, Activity, Target,
  CheckCircle, XCircle, Clock, Eye, Package, Users, Truck, Shield
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatDate } from '../../utils/formatUtils';
import { showSuccessNotification, showErrorNotification } from '../../utils/modalUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface CostProject {
  id: string;
  project_id: string;
  project_name: string;
  project_code: string;
  client_name: string;
  start_date: string;
  end_date: string;
  status: string;
  total_budget: number;
  total_actual_cost: number;
  gross_profit: number;
  gross_profit_margin: number;
  budget_variance: number;
  budget_variance_percentage: number;
  risk_level: string;
  cost_trend: string;
  project_manager: string;
  cost_controller: string;
}

interface BudgetBreakdown {
  category: string;
  budgeted: number;
  actual: number;
  committed: number;
  variance: number;
  variance_percentage: number;
}

interface CostItem {
  id: string;
  category: string;
  item_date: string;
  description: string;
  amount: number;
  source: string;
  status: string;
}

interface CostAlert {
  alert_type: string;
  severity: string;
  message: string;
  threshold: number;
  current_value: number;
  resolved: boolean;
  created_at: string;
}

const CostControlReports: React.FC = () => {
  const [projects, setProjects] = useState<CostProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<CostProject | null>(null);
  const [budgetBreakdown, setBudgetBreakdown] = useState<BudgetBreakdown[]>([]);
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [alerts, setAlerts] = useState<CostAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'comparative'>('summary');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetails(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('cost_control_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error loading projects:', error);
      showErrorNotification('Error al cargar proyectos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectDetails = async (projectId: string) => {
    try {
      setIsLoading(true);

      const [projectRes, breakdownRes, itemsRes, alertsRes] = await Promise.all([
        supabase.from('cost_control_projects').select('*').eq('id', projectId).single(),
        supabase.from('budget_breakdown').select('*').eq('project_id', projectId),
        supabase.from('cost_items').select('*').eq('project_id', projectId).order('item_date', { ascending: false }),
        supabase.from('cost_alerts').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
      ]);

      if (projectRes.error) throw projectRes.error;

      setSelectedProject(projectRes.data);
      setBudgetBreakdown(breakdownRes.data || []);
      setCostItems(itemsRes.data || []);
      setAlerts(alertsRes.data || []);
    } catch (error: any) {
      console.error('Error loading project details:', error);
      showErrorNotification('Error al cargar detalles del proyecto');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummaryReport = () => {
    if (!selectedProject) {
      showErrorNotification('Selecciona un proyecto');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORME DE CONTROL DE COSTES', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.text(selectedProject.project_name.toUpperCase(), 105, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Código: ${selectedProject.project_code}`, 14, 45);
    doc.text(`Cliente: ${selectedProject.client_name}`, 14, 51);
    doc.text(`Estado: ${translateStatus(selectedProject.status)}`, 14, 57);
    doc.text(`Periodo: ${formatDate(selectedProject.start_date)} - ${formatDate(selectedProject.end_date)}`, 14, 63);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. RESUMEN EJECUTIVO', 14, 75);
    doc.setFont('helvetica', 'normal');

    const summaryData = [
      ['Presupuesto Total', formatCurrency(selectedProject.total_budget)],
      ['Coste Real Total', formatCurrency(selectedProject.total_actual_cost)],
      ['Desviación Presupuestaria', formatCurrency(selectedProject.budget_variance)],
      ['% Desviación', `${selectedProject.budget_variance_percentage.toFixed(2)}%`],
      ['', ''],
      ['Beneficio Bruto', formatCurrency(selectedProject.gross_profit)],
      ['Margen Bruto', `${selectedProject.gross_profit_margin.toFixed(2)}%`],
      ['', ''],
      ['Nivel de Riesgo', translateRiskLevel(selectedProject.risk_level)],
      ['Tendencia de Costes', translateTrend(selectedProject.cost_trend)],
      ['', ''],
      ['Jefe de Obra', selectedProject.project_manager],
      ['Controlador de Costes', selectedProject.cost_controller]
    ];

    autoTable(doc, {
      startY: 80,
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 90, fontStyle: 'bold' },
        1: { cellWidth: 90, halign: 'right' }
      },
      didParseCell: (data) => {
        if (data.cell.raw === '') {
          data.cell.styles.fillColor = [255, 255, 255];
        }
        if (data.row.index === 8 || data.row.index === 9) {
          if (data.column.index === 1) {
            const text = data.cell.text[0];
            if (text.includes('CRÍTICO') || text.includes('ALTO')) {
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.fontStyle = 'bold';
            } else if (text.includes('DETERIORANDO')) {
              data.cell.styles.textColor = [234, 88, 12];
              data.cell.styles.fontStyle = 'bold';
            } else if (text.includes('BAJO') || text.includes('MEJORANDO')) {
              data.cell.styles.textColor = [34, 197, 94];
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      }
    });

    const startY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFont('helvetica', 'bold');
    doc.text('2. DESGLOSE POR CATEGORÍAS', 14, startY);

    const breakdownData = budgetBreakdown.map(b => [
      translateCategory(b.category),
      formatCurrency(b.budgeted),
      formatCurrency(b.actual),
      formatCurrency(b.committed),
      formatCurrency(b.variance),
      `${b.variance_percentage.toFixed(1)}%`
    ]);

    autoTable(doc, {
      startY: startY + 5,
      head: [['Categoría', 'Presupuestado', 'Real', 'Comprometido', 'Variación', '%']],
      body: breakdownData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { halign: 'right', cellWidth: 27 },
        2: { halign: 'right', cellWidth: 27 },
        3: { halign: 'right', cellWidth: 27 },
        4: { halign: 'right', cellWidth: 27 },
        5: { halign: 'right', cellWidth: 20 }
      },
      didParseCell: (data) => {
        if (data.column.index === 5 && data.section === 'body') {
          const value = parseFloat(data.cell.text[0]);
          if (value < 0) {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          } else if (value > 0) {
            data.cell.styles.textColor = [34, 197, 94];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    if (alerts.length > 0) {
      const alertY = (doc as any).lastAutoTable.finalY + 10;

      if (alertY < 250) {
        doc.setFont('helvetica', 'bold');
        doc.text('3. ALERTAS Y OBSERVACIONES', 14, alertY);

        const alertData = alerts.filter(a => !a.resolved).slice(0, 5).map(a => [
          translateAlertType(a.alert_type),
          translateSeverity(a.severity),
          a.message
        ]);

        if (alertData.length > 0) {
          autoTable(doc, {
            startY: alertY + 5,
            head: [['Tipo', 'Severidad', 'Mensaje']],
            body: alertData,
            theme: 'grid',
            headStyles: { fillColor: [220, 38, 38], fontStyle: 'bold' },
            styles: { fontSize: 8 },
            columnStyles: {
              0: { cellWidth: 45 },
              1: { cellWidth: 25 },
              2: { cellWidth: 103 }
            }
          });
        }
      }
    }

    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generado el ${formatDate(new Date().toISOString())}`, 14, 285);
    doc.text('Página 1', 195, 285, { align: 'right' });

    doc.save(`informe_costes_${selectedProject.project_code}.pdf`);
    showSuccessNotification('Informe de costes generado correctamente');
  };

  const generateDetailedReport = () => {
    if (!selectedProject) {
      showErrorNotification('Selecciona un proyecto');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORME DETALLADO DE COSTES', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(selectedProject.project_name.toUpperCase(), 105, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Código: ${selectedProject.project_code} | Cliente: ${selectedProject.client_name}`, 14, 45);

    doc.setFont('helvetica', 'bold');
    doc.text('LÍNEAS DE COSTE (Últimas 50)', 14, 55);

    const itemsByCategory: Record<string, CostItem[]> = {};
    costItems.slice(0, 50).forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });

    let currentY = 60;

    Object.entries(itemsByCategory).forEach(([category, items]) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(translateCategory(category).toUpperCase(), 14, currentY);
      currentY += 5;

      const categoryTotal = items.reduce((sum, item) => sum + Number(item.amount), 0);

      const itemsData = items.map(item => [
        formatDate(item.item_date),
        item.description.substring(0, 50),
        translateSource(item.source),
        translateItemStatus(item.status),
        formatCurrency(item.amount)
      ]);

      itemsData.push([
        '',
        '',
        '',
        'SUBTOTAL',
        formatCurrency(categoryTotal)
      ]);

      autoTable(doc, {
        startY: currentY,
        body: itemsData,
        theme: 'striped',
        styles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 75 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25 },
          4: { halign: 'right', cellWidth: 28 }
        },
        didParseCell: (data) => {
          if (data.cell.raw === 'SUBTOTAL') {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [230, 230, 230];
          }
          if (data.column.index === 4 && data.row.index === items.length) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [230, 230, 230];
          }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    if (finalY > 250) {
      doc.addPage();
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const summaryY = finalY > 250 ? 20 : finalY;
    doc.text('RESUMEN FINANCIERO', 14, summaryY);

    const totalActual = costItems.reduce((sum, item) => sum + Number(item.amount), 0);
    const financialData = [
      ['Presupuesto Total', formatCurrency(selectedProject.total_budget)],
      ['Coste Real Total', formatCurrency(totalActual)],
      ['Saldo Disponible', formatCurrency(selectedProject.total_budget - totalActual)],
      ['Margen Actual', `${((selectedProject.total_budget - totalActual) / selectedProject.total_budget * 100).toFixed(2)}%`]
    ];

    autoTable(doc, {
      startY: summaryY + 5,
      body: financialData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 90, fontStyle: 'bold' },
        1: { cellWidth: 90, halign: 'right', fontStyle: 'bold' }
      }
    });

    doc.save(`informe_costes_detallado_${selectedProject.project_code}.pdf`);
    showSuccessNotification('Informe detallado generado correctamente');
  };

  const generateExcelReport = () => {
    if (!selectedProject) {
      showErrorNotification('Selecciona un proyecto');
      return;
    }

    const wb = XLSX.utils.book_new();

    const summarySheet = [
      ['INFORME DE CONTROL DE COSTES'],
      ['Proyecto:', selectedProject.project_name],
      ['Código:', selectedProject.project_code],
      ['Cliente:', selectedProject.client_name],
      ['Estado:', translateStatus(selectedProject.status)],
      [],
      ['RESUMEN FINANCIERO'],
      ['Presupuesto Total', selectedProject.total_budget],
      ['Coste Real Total', selectedProject.total_actual_cost],
      ['Desviación', selectedProject.budget_variance],
      ['% Desviación', selectedProject.budget_variance_percentage],
      [],
      ['Beneficio Bruto', selectedProject.gross_profit],
      ['Margen Bruto %', selectedProject.gross_profit_margin],
      [],
      ['ANÁLISIS'],
      ['Nivel de Riesgo', translateRiskLevel(selectedProject.risk_level)],
      ['Tendencia de Costes', translateTrend(selectedProject.cost_trend)],
      [],
      ['RESPONSABLES'],
      ['Jefe de Obra', selectedProject.project_manager],
      ['Controlador de Costes', selectedProject.cost_controller]
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summarySheet);
    wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

    const breakdownSheet = [
      ['DESGLOSE POR CATEGORÍAS'],
      [],
      ['Categoría', 'Presupuestado', 'Real', 'Comprometido', 'Variación', '% Variación']
    ];

    budgetBreakdown.forEach(b => {
      breakdownSheet.push([
        translateCategory(b.category),
        b.budgeted,
        b.actual,
        b.committed,
        b.variance,
        b.variance_percentage
      ]);
    });

    const wsBreakdown = XLSX.utils.aoa_to_sheet(breakdownSheet);
    wsBreakdown['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsBreakdown, 'Desglose');

    const itemsSheet = [
      ['LÍNEAS DE COSTE'],
      [],
      ['Fecha', 'Categoría', 'Descripción', 'Origen', 'Estado', 'Importe']
    ];

    costItems.forEach(item => {
      itemsSheet.push([
        formatDate(item.item_date),
        translateCategory(item.category),
        item.description,
        translateSource(item.source),
        translateItemStatus(item.status),
        item.amount
      ]);
    });

    const wsItems = XLSX.utils.aoa_to_sheet(itemsSheet);
    wsItems['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 50 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsItems, 'Líneas de Coste');

    if (alerts.length > 0) {
      const alertsSheet = [
        ['ALERTAS'],
        [],
        ['Fecha', 'Tipo', 'Severidad', 'Mensaje', 'Estado']
      ];

      alerts.forEach(alert => {
        alertsSheet.push([
          formatDate(alert.created_at),
          translateAlertType(alert.alert_type),
          translateSeverity(alert.severity),
          alert.message,
          alert.resolved ? 'Resuelta' : 'Pendiente'
        ]);
      });

      const wsAlerts = XLSX.utils.aoa_to_sheet(alertsSheet);
      wsAlerts['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 50 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, wsAlerts, 'Alertas');
    }

    XLSX.writeFile(wb, `costes_${selectedProject.project_code}.xlsx`);
    showSuccessNotification('Informe Excel generado correctamente');
  };

  const translateCategory = (category: string): string => {
    const map: Record<string, string> = {
      materials: 'Materiales',
      direct_labor: 'Mano de Obra Directa',
      subcontracts: 'Subcontratas',
      machinery: 'Maquinaria',
      insurance: 'Seguros',
      general_expenses: 'Gastos Generales',
      indirect_costs: 'Costes Indirectos',
      contingency: 'Contingencias',
      profit: 'Beneficio'
    };
    return map[category] || category;
  };

  const translateStatus = (status: string): string => {
    const map: Record<string, string> = {
      planning: 'Planificación',
      active: 'Activo',
      completed: 'Completado',
      paused: 'Pausado',
      cancelled: 'Cancelado'
    };
    return map[status] || status;
  };

  const translateRiskLevel = (risk: string): string => {
    const map: Record<string, string> = {
      low: 'BAJO',
      medium: 'MEDIO',
      high: 'ALTO',
      critical: 'CRÍTICO'
    };
    return map[risk] || risk;
  };

  const translateTrend = (trend: string): string => {
    const map: Record<string, string> = {
      improving: 'MEJORANDO',
      stable: 'ESTABLE',
      deteriorating: 'DETERIORANDO'
    };
    return map[trend] || trend;
  };

  const translateSource = (source: string): string => {
    const map: Record<string, string> = {
      treasury: 'Tesorería',
      supplier: 'Proveedor',
      payroll: 'Nómina',
      manual: 'Manual'
    };
    return map[source] || source;
  };

  const translateItemStatus = (status: string): string => {
    const map: Record<string, string> = {
      planned: 'Planificado',
      committed: 'Comprometido',
      paid: 'Pagado'
    };
    return map[status] || status;
  };

  const translateAlertType = (type: string): string => {
    const map: Record<string, string> = {
      budget_exceeded: 'Presupuesto Excedido',
      no_activity: 'Sin Actividad',
      high_labor_cost: 'Coste Mano Obra Alto',
      variance_threshold: 'Umbral Desviación',
      cash_flow_risk: 'Riesgo Tesorería'
    };
    return map[type] || type;
  };

  const translateSeverity = (severity: string): string => {
    const map: Record<string, string> = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      critical: 'Crítica'
    };
    return map[severity] || severity;
  };

  const getRiskColor = (risk: string): string => {
    const map: Record<string, string> = {
      low: 'text-green-600 bg-green-50',
      medium: 'text-yellow-600 bg-yellow-50',
      high: 'text-orange-600 bg-orange-50',
      critical: 'text-red-600 bg-red-50'
    };
    return map[risk] || 'text-gray-600 bg-gray-50';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'deteriorating') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Control de Costes de Obra</h2>
            <p className="text-blue-100">
              Informes profesionales con análisis detallado de costes por proyecto
            </p>
          </div>
          <BarChart3 className="h-16 w-16 text-blue-200 opacity-50" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-96">
              <label className="block text-sm font-medium text-gray-700 mb-2">Proyecto</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar proyecto...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.project_name} ({p.project_code}) - {translateStatus(p.status)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Informe</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="summary">Resumen Ejecutivo</option>
                <option value="detailed">Detallado por Líneas</option>
                <option value="comparative">Comparativo</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={loadProjects}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualizar</span>
            </button>

            <button
              onClick={generateSummaryReport}
              disabled={!selectedProjectId}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-4 w-4" />
              <span>PDF Resumen</span>
            </button>

            <button
              onClick={generateDetailedReport}
              disabled={!selectedProjectId}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-4 w-4" />
              <span>PDF Detallado</span>
            </button>

            <button
              onClick={generateExcelReport}
              disabled={!selectedProjectId}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      {selectedProject && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Presupuesto Total</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(selectedProject.total_budget)}
                  </p>
                </div>
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Coste Real</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(selectedProject.total_actual_cost)}
                  </p>
                  <p className={`text-xs mt-1 ${selectedProject.budget_variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedProject.budget_variance >= 0 ? '▼' : '▲'} {Math.abs(selectedProject.budget_variance_percentage).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-orange-500 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Margen Bruto</p>
                  <p className={`text-2xl font-bold mt-1 ${selectedProject.gross_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedProject.gross_profit_margin.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatCurrency(selectedProject.gross_profit)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${selectedProject.gross_profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nivel de Riesgo</p>
                  <p className={`text-xl font-bold mt-1 px-3 py-1 rounded-lg inline-block ${getRiskColor(selectedProject.risk_level)}`}>
                    {translateRiskLevel(selectedProject.risk_level)}
                  </p>
                </div>
                <div className="bg-purple-500 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Desglose por Categorías
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {budgetBreakdown.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{translateCategory(item.category)}</h4>
                        <span className={`text-sm font-semibold ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.variance >= 0 ? '+' : ''}{item.variance_percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Presup.:</span>
                          <p className="font-semibold text-gray-900">{formatCurrency(item.budgeted)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Real:</span>
                          <p className="font-semibold text-gray-900">{formatCurrency(item.actual)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Comprom.:</span>
                          <p className="font-semibold text-gray-900">{formatCurrency(item.committed)}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.actual > item.budgeted ? 'bg-red-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min((item.actual / item.budgeted) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Alertas Activas
                </h3>
              </div>
              <div className="p-6">
                {alerts.filter(a => !a.resolved).length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600">No hay alertas activas</p>
                    <p className="text-sm text-gray-500">El proyecto está dentro de los parámetros normales</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alerts.filter(a => !a.resolved).slice(0, 5).map((alert, index) => (
                      <div key={index} className={`border-l-4 p-4 rounded-r-lg ${
                        alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                        alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                        alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                                alert.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                                alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-blue-200 text-blue-800'
                              }`}>
                                {translateSeverity(alert.severity)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(alert.created_at)}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-900">{translateAlertType(alert.alert_type)}</p>
                            <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Últimas Líneas de Coste
              </h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origen</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Importe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {costItems.slice(0, 15).map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{formatDate(item.item_date)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{translateCategory(item.category)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{translateSource(item.source)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.status === 'paid' ? 'bg-green-100 text-green-800' :
                            item.status === 'committed' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {translateItemStatus(item.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {!selectedProject && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Selecciona un Proyecto</h3>
          <p className="text-gray-600">
            Elige un proyecto de la lista superior para ver su análisis de costes y generar informes
          </p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-lg text-gray-600">Cargando datos...</span>
        </div>
      )}
    </div>
  );
};

export default CostControlReports;
