import React, { useState, useEffect } from 'react';
import {
  Users, Building2, Truck, TrendingUp, AlertTriangle, CheckCircle,
  Clock, DollarSign, BarChart3, Calendar, FileText, Shield, Briefcase,
  Download, RefreshCw, Filter, Eye, Landmark, Package, ClipboardList,
  ArrowUpCircle, ArrowDownCircle, Activity, Award, TrendingDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatDate } from '../../utils/formatUtils';
import { showSuccessNotification, showErrorNotification } from '../../utils/modalUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface DashboardProps {
  setCurrentModule: (module: string) => void;
}

interface DashboardKPIs {
  total_workers: number;
  active_workers: number;
  total_projects: number;
  active_projects: number;
  total_certifications: number;
  monthly_income: number;
  monthly_expenses: number;
  net_cash_flow: number;
  pending_settlements: number;
  total_machinery: number;
  active_machinery: number;
  treasury_balance: number;
  pending_budgets: number;
  approved_budgets: number;
}

interface ProjectSummary {
  id: string;
  name: string;
  code: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: number;
  total_certified: number;
  total_expenses: number;
  margin: number;
  workers_count: number;
}

interface WorkerSummary {
  id: string;
  full_name: string;
  category: string;
  contract_type: string;
  total_hours: number;
  pending_settlements: number;
  last_settlement_date: string;
}

const DashboardProfessional: React.FC<DashboardProps> = ({ setCurrentModule }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());
  const [reportType, setReportType] = useState<'monthly' | 'annual' | 'project' | 'worker'>('monthly');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');

  const [kpis, setKpis] = useState<DashboardKPIs>({
    total_workers: 0,
    active_workers: 0,
    total_projects: 0,
    active_projects: 0,
    total_certifications: 0,
    monthly_income: 0,
    monthly_expenses: 0,
    net_cash_flow: 0,
    pending_settlements: 0,
    total_machinery: 0,
    active_machinery: 0,
    treasury_balance: 0,
    pending_budgets: 0,
    approved_budgets: 0
  });

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [workers, setWorkers] = useState<WorkerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod, selectedYear]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [year, month] = selectedPeriod.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

      const [
        workersRes,
        projectsRes,
        certificationsRes,
        treasuryRes,
        settlementsRes,
        machineryRes,
        budgetsRes,
        movementsRes
      ] = await Promise.all([
        supabase.from('workers').select('id, status'),
        supabase.from('projects').select('id, name, code, status, start_date, end_date, budget_amount'),
        supabase.from('certifications').select('id, total_certified').gte('certification_date', startDate).lte('certification_date', endDate),
        supabase.from('bank_accounts').select('current_balance'),
        supabase.from('payroll_settlements').select('id, status'),
        supabase.from('machinery').select('id, status'),
        supabase.from('budgets').select('id, status'),
        supabase.from('treasury_movements').select('amount, movement_type, reconciliation_status').gte('operation_date', startDate).lte('operation_date', endDate)
      ]);

      const totalWorkers = workersRes.data?.length || 0;
      const activeWorkers = workersRes.data?.filter(w => w.status === 'active').length || 0;
      const totalProjects = projectsRes.data?.length || 0;
      const activeProjects = projectsRes.data?.filter(p => p.status === 'active').length || 0;
      const totalCertifications = certificationsRes.data?.length || 0;

      const monthlyIncome = movementsRes.data
        ?.filter(m => m.movement_type === 'income' && m.reconciliation_status === 'reconciled')
        .reduce((sum, m) => sum + Number(m.amount), 0) || 0;

      const monthlyExpenses = movementsRes.data
        ?.filter(m => m.movement_type === 'expense' && m.reconciliation_status === 'reconciled')
        .reduce((sum, m) => sum + Math.abs(Number(m.amount)), 0) || 0;

      const treasuryBalance = treasuryRes.data?.reduce((sum, acc) => sum + Number(acc.current_balance), 0) || 0;
      const pendingSettlements = settlementsRes.data?.filter(s => s.status === 'pending').length || 0;
      const totalMachinery = machineryRes.data?.length || 0;
      const activeMachinery = machineryRes.data?.filter(m => m.status === 'active').length || 0;
      const pendingBudgets = budgetsRes.data?.filter(b => b.status === 'pending').length || 0;
      const approvedBudgets = budgetsRes.data?.filter(b => b.status === 'approved').length || 0;

      setKpis({
        total_workers: totalWorkers,
        active_workers: activeWorkers,
        total_projects: totalProjects,
        active_projects: activeProjects,
        total_certifications: totalCertifications,
        monthly_income: monthlyIncome,
        monthly_expenses: monthlyExpenses,
        net_cash_flow: monthlyIncome - monthlyExpenses,
        pending_settlements: pendingSettlements,
        total_machinery: totalMachinery,
        active_machinery: activeMachinery,
        treasury_balance: treasuryBalance,
        pending_budgets: pendingBudgets,
        approved_budgets: approvedBudgets
      });

      await loadProjectsSummary();
      await loadWorkersSummary();

    } catch (error: any) {
      showErrorNotification('Error al cargar datos del dashboard');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectsSummary = async () => {
    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          code,
          status,
          start_date,
          end_date,
          budget_amount,
          certifications (total_certified),
          cost_controls (total_cost)
        `)
        .eq('status', 'active')
        .limit(10);

      if (error) throw error;

      const projectsSummary: ProjectSummary[] = (projectsData || []).map((p: any) => {
        const totalCertified = p.certifications?.reduce((sum: number, c: any) => sum + Number(c.total_certified || 0), 0) || 0;
        const totalExpenses = p.cost_controls?.reduce((sum: number, c: any) => sum + Number(c.total_cost || 0), 0) || 0;
        const budget = Number(p.budget_amount || 0);
        const margin = budget > 0 ? ((totalCertified - totalExpenses) / budget * 100) : 0;

        return {
          id: p.id,
          name: p.name,
          code: p.code,
          status: p.status,
          start_date: p.start_date,
          end_date: p.end_date,
          budget: budget,
          total_certified: totalCertified,
          total_expenses: totalExpenses,
          margin: margin,
          workers_count: 0
        };
      });

      setProjects(projectsSummary);
    } catch (error) {
      console.error('Error loading projects summary:', error);
    }
  };

  const loadWorkersSummary = async () => {
    try {
      const { data: workersData, error } = await supabase
        .from('workers')
        .select(`
          id,
          first_name,
          last_name,
          category,
          contract_type,
          payroll_settlements (status, settlement_date)
        `)
        .eq('status', 'active')
        .limit(10);

      if (error) throw error;

      const workersSummary: WorkerSummary[] = (workersData || []).map((w: any) => {
        const pendingSettlements = w.payroll_settlements?.filter((s: any) => s.status === 'pending').length || 0;
        const lastSettlement = w.payroll_settlements?.[0]?.settlement_date || '';

        return {
          id: w.id,
          full_name: `${w.first_name} ${w.last_name}`,
          category: w.category || 'N/A',
          contract_type: w.contract_type || 'N/A',
          total_hours: 0,
          pending_settlements: pendingSettlements,
          last_settlement_date: lastSettlement
        };
      });

      setWorkers(workersSummary);
    } catch (error) {
      console.error('Error loading workers summary:', error);
    }
  };

  const generateMonthlyReport = () => {
    const doc = new jsPDF();
    const [year, month] = selectedPeriod.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    doc.setFontSize(20);
    doc.text('INFORME EJECUTIVO MENSUAL', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.text(monthName.toUpperCase(), 105, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${formatDate(new Date().toISOString())}`, 14, 45);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. RESUMEN EJECUTIVO', 14, 55);
    doc.setFont('helvetica', 'normal');

    const summaryData = [
      ['RECURSOS HUMANOS', ''],
      ['Trabajadores Activos', kpis.active_workers.toString()],
      ['Liquidaciones Pendientes', kpis.pending_settlements.toString()],
      ['', ''],
      ['PROYECTOS', ''],
      ['Proyectos Activos', kpis.active_projects.toString()],
      ['Certificaciones del Mes', kpis.total_certifications.toString()],
      ['', ''],
      ['FINANZAS', ''],
      ['Ingresos del Mes', formatCurrency(kpis.monthly_income)],
      ['Gastos del Mes', formatCurrency(kpis.monthly_expenses)],
      ['Flujo Neto', formatCurrency(kpis.net_cash_flow)],
      ['Saldo Tesorería', formatCurrency(kpis.treasury_balance)],
      ['', ''],
      ['OPERACIONES', ''],
      ['Maquinaria Activa', `${kpis.active_machinery} / ${kpis.total_machinery}`],
      ['Presupuestos Aprobados', kpis.approved_budgets.toString()],
      ['Presupuestos Pendientes', kpis.pending_budgets.toString()]
    ];

    autoTable(doc, {
      startY: 60,
      body: summaryData,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 120, fontStyle: 'normal' },
        1: { cellWidth: 60, halign: 'right', fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        if (data.row.index % 4 === 0 && data.column.index === 0) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
      }
    });

    const startY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFont('helvetica', 'bold');
    doc.text('2. PROYECTOS ACTIVOS (TOP 5)', 14, startY);
    doc.setFont('helvetica', 'normal');

    const projectsData = projects.slice(0, 5).map(p => [
      p.name,
      p.code,
      formatCurrency(p.budget),
      formatCurrency(p.total_certified),
      `${p.margin.toFixed(1)}%`
    ]);

    autoTable(doc, {
      startY: startY + 5,
      head: [['Proyecto', 'Código', 'Presupuesto', 'Certificado', 'Margen']],
      body: projectsData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
      styles: { fontSize: 8 },
      columnStyles: {
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFont('helvetica', 'bold');
    doc.text('3. INDICADORES FINANCIEROS', 14, finalY);
    doc.setFont('helvetica', 'normal');

    const ratio = kpis.monthly_expenses > 0 ? (kpis.monthly_income / kpis.monthly_expenses * 100).toFixed(1) : '0.0';
    const financialData = [
      ['Ratio Ingresos/Gastos', `${ratio}%`],
      ['Liquidez Disponible', formatCurrency(kpis.treasury_balance)],
      ['Estado del Periodo', kpis.net_cash_flow >= 0 ? 'SUPERÁVIT' : 'DÉFICIT']
    ];

    autoTable(doc, {
      startY: finalY + 5,
      body: financialData,
      theme: 'grid',
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 60, halign: 'right', fontStyle: 'bold' }
      }
    });

    doc.save(`informe_mensual_${selectedPeriod}.pdf`);
    showSuccessNotification('Informe mensual generado correctamente');
  };

  const generateAnnualReport = () => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('INFORME EJECUTIVO ANUAL', 105, 20, { align: 'center' });

    doc.setFontSize(14);
    doc.text(`AÑO ${selectedYear}`, 105, 30, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${formatDate(new Date().toISOString())}`, 14, 45);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN CONSOLIDADO ANUAL', 14, 55);
    doc.setFont('helvetica', 'normal');

    const annualData = [
      ['Total Trabajadores', kpis.total_workers.toString()],
      ['Total Proyectos Ejecutados', kpis.total_projects.toString()],
      ['Proyectos Activos', kpis.active_projects.toString()],
      ['Total Certificaciones', kpis.total_certifications.toString()],
      ['Ingresos Totales', formatCurrency(kpis.monthly_income * 12)],
      ['Gastos Totales', formatCurrency(kpis.monthly_expenses * 12)],
      ['Resultado Neto', formatCurrency((kpis.monthly_income - kpis.monthly_expenses) * 12)],
      ['Saldo Tesorería Final', formatCurrency(kpis.treasury_balance)]
    ];

    autoTable(doc, {
      startY: 60,
      body: annualData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 120, fontStyle: 'bold' },
        1: { cellWidth: 60, halign: 'right' }
      }
    });

    doc.save(`informe_anual_${selectedYear}.pdf`);
    showSuccessNotification('Informe anual generado correctamente');
  };

  const generateProjectReport = async () => {
    if (!selectedProjectId) {
      showErrorNotification('Selecciona un proyecto');
      return;
    }

    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients (company_name),
          certifications (certification_date, total_certified),
          measurements (measurement_date, total_amount),
          cost_controls (control_date, total_cost)
        `)
        .eq('id', selectedProjectId)
        .single();

      if (error) throw error;

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('INFORME DE PROYECTO', 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.text(project.name.toUpperCase(), 105, 30, { align: 'center' });
      doc.text(`Código: ${project.code}`, 105, 38, { align: 'center' });

      doc.setFontSize(10);
      doc.text(`Cliente: ${project.clients?.company_name || 'N/A'}`, 14, 50);
      doc.text(`Estado: ${project.status}`, 14, 56);
      doc.text(`Inicio: ${formatDate(project.start_date)}`, 14, 62);
      doc.text(`Fin: ${formatDate(project.end_date)}`, 14, 68);

      const totalCertified = project.certifications?.reduce((sum: number, c: any) => sum + Number(c.total_certified), 0) || 0;
      const totalCosts = project.cost_controls?.reduce((sum: number, c: any) => sum + Number(c.total_cost), 0) || 0;
      const margin = totalCertified - totalCosts;
      const marginPercent = project.budget_amount > 0 ? (margin / Number(project.budget_amount) * 100).toFixed(2) : '0.00';

      const projectData = [
        ['Presupuesto Total', formatCurrency(Number(project.budget_amount))],
        ['Total Certificado', formatCurrency(totalCertified)],
        ['Total Costes', formatCurrency(totalCosts)],
        ['Margen', formatCurrency(margin)],
        ['% Margen', `${marginPercent}%`],
        ['Avance', `${((totalCertified / Number(project.budget_amount)) * 100).toFixed(1)}%`]
      ];

      autoTable(doc, {
        startY: 75,
        body: projectData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 100, fontStyle: 'bold' },
          1: { cellWidth: 80, halign: 'right' }
        }
      });

      if (project.certifications && project.certifications.length > 0) {
        const certY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFont('helvetica', 'bold');
        doc.text('CERTIFICACIONES', 14, certY);
        doc.setFont('helvetica', 'normal');

        const certData = project.certifications.map((c: any) => [
          formatDate(c.certification_date),
          formatCurrency(Number(c.total_certified))
        ]);

        autoTable(doc, {
          startY: certY + 5,
          head: [['Fecha', 'Importe']],
          body: certData,
          theme: 'striped',
          headStyles: { fillColor: [34, 197, 94] },
          styles: { fontSize: 9 },
          columnStyles: {
            1: { halign: 'right' }
          }
        });
      }

      doc.save(`informe_proyecto_${project.code}.pdf`);
      showSuccessNotification('Informe de proyecto generado correctamente');
    } catch (error) {
      showErrorNotification('Error al generar informe de proyecto');
      console.error(error);
    }
  };

  const generateWorkerReport = async () => {
    if (!selectedWorkerId) {
      showErrorNotification('Selecciona un trabajador');
      return;
    }

    try {
      const { data: worker, error } = await supabase
        .from('workers')
        .select(`
          *,
          payroll_settlements (settlement_date, period_start, period_end, gross_salary, net_salary, status),
          work_reports (work_date, hours_worked)
        `)
        .eq('id', selectedWorkerId)
        .single();

      if (error) throw error;

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('INFORME DE TRABAJADOR', 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.text(`${worker.first_name} ${worker.last_name}`.toUpperCase(), 105, 30, { align: 'center' });
      doc.text(`DNI: ${worker.dni}`, 105, 38, { align: 'center' });

      doc.setFontSize(10);
      doc.text(`Categoría: ${worker.category}`, 14, 50);
      doc.text(`Tipo Contrato: ${worker.contract_type}`, 14, 56);
      doc.text(`Fecha Alta: ${formatDate(worker.hire_date)}`, 14, 62);
      doc.text(`Estado: ${worker.status}`, 14, 68);

      const totalHours = worker.work_reports?.reduce((sum: number, w: any) => sum + Number(w.hours_worked || 0), 0) || 0;
      const totalPaid = worker.payroll_settlements?.reduce((sum: number, s: any) => sum + Number(s.net_salary || 0), 0) || 0;
      const pendingSettlements = worker.payroll_settlements?.filter((s: any) => s.status === 'pending').length || 0;

      const workerData = [
        ['Total Horas Trabajadas', totalHours.toFixed(2)],
        ['Total Pagado (Neto)', formatCurrency(totalPaid)],
        ['Liquidaciones Pendientes', pendingSettlements.toString()],
        ['Nº Liquidaciones', worker.payroll_settlements?.length.toString() || '0']
      ];

      autoTable(doc, {
        startY: 75,
        body: workerData,
        theme: 'grid',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 100, fontStyle: 'bold' },
          1: { cellWidth: 80, halign: 'right' }
        }
      });

      if (worker.payroll_settlements && worker.payroll_settlements.length > 0) {
        const settY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFont('helvetica', 'bold');
        doc.text('LIQUIDACIONES RECIENTES', 14, settY);
        doc.setFont('helvetica', 'normal');

        const settData = worker.payroll_settlements.slice(0, 10).map((s: any) => [
          formatDate(s.settlement_date),
          formatDate(s.period_start) + ' - ' + formatDate(s.period_end),
          formatCurrency(Number(s.gross_salary)),
          formatCurrency(Number(s.net_salary)),
          s.status === 'paid' ? 'Pagada' : 'Pendiente'
        ]);

        autoTable(doc, {
          startY: settY + 5,
          head: [['Fecha', 'Periodo', 'Bruto', 'Neto', 'Estado']],
          body: settData,
          theme: 'striped',
          headStyles: { fillColor: [34, 197, 94] },
          styles: { fontSize: 8 },
          columnStyles: {
            2: { halign: 'right' },
            3: { halign: 'right' }
          }
        });
      }

      doc.save(`informe_trabajador_${worker.dni}.pdf`);
      showSuccessNotification('Informe de trabajador generado correctamente');
    } catch (error) {
      showErrorNotification('Error al generar informe de trabajador');
      console.error(error);
    }
  };

  const generateExcelReport = () => {
    const wb = XLSX.utils.book_new();

    const kpisSheet = [
      ['DASHBOARD EJECUTIVO - ' + selectedPeriod],
      ['Fecha:', formatDate(new Date().toISOString())],
      [],
      ['RECURSOS HUMANOS'],
      ['Total Trabajadores', kpis.total_workers],
      ['Trabajadores Activos', kpis.active_workers],
      ['Liquidaciones Pendientes', kpis.pending_settlements],
      [],
      ['PROYECTOS'],
      ['Total Proyectos', kpis.total_projects],
      ['Proyectos Activos', kpis.active_projects],
      ['Certificaciones del Mes', kpis.total_certifications],
      [],
      ['FINANZAS'],
      ['Ingresos del Mes', kpis.monthly_income],
      ['Gastos del Mes', kpis.monthly_expenses],
      ['Flujo Neto', kpis.net_cash_flow],
      ['Saldo Tesorería', kpis.treasury_balance],
      [],
      ['OPERACIONES'],
      ['Total Maquinaria', kpis.total_machinery],
      ['Maquinaria Activa', kpis.active_machinery],
      ['Presupuestos Aprobados', kpis.approved_budgets],
      ['Presupuestos Pendientes', kpis.pending_budgets]
    ];

    const wsKPIs = XLSX.utils.aoa_to_sheet(kpisSheet);
    wsKPIs['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsKPIs, 'KPIs');

    const projectsSheet = [
      ['PROYECTOS ACTIVOS'],
      [],
      ['Nombre', 'Código', 'Estado', 'Presupuesto', 'Certificado', 'Gastos', 'Margen', 'Margen %']
    ];

    projects.forEach(p => {
      projectsSheet.push([
        p.name,
        p.code,
        p.status,
        p.budget,
        p.total_certified,
        p.total_expenses,
        p.total_certified - p.total_expenses,
        p.margin
      ]);
    });

    const wsProjects = XLSX.utils.aoa_to_sheet(projectsSheet);
    wsProjects['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsProjects, 'Proyectos');

    const workersSheet = [
      ['TRABAJADORES'],
      [],
      ['Nombre', 'Categoría', 'Tipo Contrato', 'Liquidaciones Pendientes', 'Última Liquidación']
    ];

    workers.forEach(w => {
      workersSheet.push([
        w.full_name,
        w.category,
        w.contract_type,
        w.pending_settlements,
        w.last_settlement_date ? formatDate(w.last_settlement_date) : 'N/A'
      ]);
    });

    const wsWorkers = XLSX.utils.aoa_to_sheet(workersSheet);
    wsWorkers['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsWorkers, 'Trabajadores');

    XLSX.writeFile(wb, `dashboard_completo_${selectedPeriod}.xlsx`);
    showSuccessNotification('Informe Excel generado correctamente');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-lg text-gray-600">Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Dashboard Ejecutivo</h2>
            <p className="text-blue-100">
              Control total de la empresa con informes profesionales en PDF y Excel
            </p>
          </div>
          <BarChart3 className="h-16 w-16 text-blue-200 opacity-50" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Informe</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="monthly">Mensual</option>
                <option value="annual">Anual</option>
                <option value="project">Por Proyecto</option>
                <option value="worker">Por Trabajador</option>
              </select>
            </div>

            {reportType === 'monthly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
                <input
                  type="month"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {reportType === 'annual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  min="2020"
                  max="2030"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {reportType === 'project' && (
              <div className="w-80">
                <label className="block text-sm font-medium text-gray-700 mb-2">Proyecto</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar proyecto...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>
            )}

            {reportType === 'worker' && (
              <div className="w-80">
                <label className="block text-sm font-medium text-gray-700 mb-2">Trabajador</label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar trabajador...</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.full_name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={loadDashboardData}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualizar</span>
            </button>

            {reportType === 'monthly' && (
              <button
                onClick={generateMonthlyReport}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>PDF Mensual</span>
              </button>
            )}

            {reportType === 'annual' && (
              <button
                onClick={generateAnnualReport}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>PDF Anual</span>
              </button>
            )}

            {reportType === 'project' && (
              <button
                onClick={generateProjectReport}
                disabled={!selectedProjectId}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-4 w-4" />
                <span>PDF Proyecto</span>
              </button>
            )}

            {reportType === 'worker' && (
              <button
                onClick={generateWorkerReport}
                disabled={!selectedWorkerId}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-4 w-4" />
                <span>PDF Trabajador</span>
              </button>
            )}

            <button
              onClick={generateExcelReport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Excel Completo</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trabajadores Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{kpis.active_workers}</p>
              <p className="text-xs text-gray-500 mt-1">de {kpis.total_workers} totales</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Proyectos Activos</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{kpis.active_projects}</p>
              <p className="text-xs text-gray-500 mt-1">de {kpis.total_projects} totales</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Tesorería</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(kpis.treasury_balance)}</p>
              <p className="text-xs text-gray-500 mt-1">disponible</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Landmark className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maquinaria Activa</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{kpis.active_machinery}</p>
              <p className="text-xs text-gray-500 mt-1">de {kpis.total_machinery} totales</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <Truck className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Ingresos del Mes</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {formatCurrency(kpis.monthly_income)}
              </p>
              <p className="text-xs text-green-600 mt-1">{kpis.total_certifications} certificaciones</p>
            </div>
            <ArrowUpCircle className="h-12 w-12 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Gastos del Mes</p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                {formatCurrency(kpis.monthly_expenses)}
              </p>
              <p className="text-xs text-red-600 mt-1">operativos y financieros</p>
            </div>
            <ArrowDownCircle className="h-12 w-12 text-red-600 opacity-50" />
          </div>
        </div>

        <div className={`rounded-lg p-6 border-2 ${
          kpis.net_cash_flow >= 0
            ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300'
            : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                kpis.net_cash_flow >= 0 ? 'text-blue-800' : 'text-orange-800'
              }`}>
                Flujo Neto
              </p>
              <p className={`text-3xl font-bold mt-2 ${
                kpis.net_cash_flow >= 0 ? 'text-blue-900' : 'text-orange-900'
              }`}>
                {formatCurrency(kpis.net_cash_flow)}
              </p>
              <p className={`text-xs mt-1 ${
                kpis.net_cash_flow >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`}>
                {kpis.net_cash_flow >= 0 ? 'Superávit' : 'Déficit'}
              </p>
            </div>
            <TrendingUp className={`h-12 w-12 opacity-50 ${
              kpis.net_cash_flow >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Proyectos Activos (Top 5)
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <span className="text-xs font-mono text-gray-500">{project.code}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Presupuesto:</span>
                      <p className="font-semibold text-gray-900">{formatCurrency(project.budget)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Certificado:</span>
                      <p className="font-semibold text-green-600">{formatCurrency(project.total_certified)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Margen:</span>
                      <p className={`font-semibold ${project.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {project.margin.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentModule('projects')}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver detalles
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Indicadores Operacionales
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Certificaciones</span>
                </div>
                <span className="text-lg font-bold text-blue-600">{kpis.total_certifications}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-yellow-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Liquidaciones Pendientes</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{kpis.pending_settlements}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Presupuestos Aprobados</span>
                </div>
                <span className="text-lg font-bold text-green-600">{kpis.approved_budgets}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-orange-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Presupuestos Pendientes</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{kpis.pending_budgets}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <Truck className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-sm font-medium text-gray-900">Ratio Maquinaria</span>
                </div>
                <span className="text-lg font-bold text-purple-600">
                  {kpis.total_machinery > 0 ? ((kpis.active_machinery / kpis.total_machinery) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Accesos Rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { id: 'projects', label: 'Proyectos', icon: Building2, color: 'blue' },
            { id: 'workers', label: 'Trabajadores', icon: Users, color: 'green' },
            { id: 'treasury', label: 'Tesorería', icon: Landmark, color: 'purple' },
            { id: 'certifications', label: 'Certificaciones', icon: Award, color: 'orange' },
            { id: 'payroll', label: 'Liquidaciones', icon: DollarSign, color: 'yellow' },
            { id: 'cost-control', label: 'Control Costes', icon: TrendingUp, color: 'red' }
          ].map((module) => (
            <button
              key={module.id}
              onClick={() => setCurrentModule(module.id)}
              className={`p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center space-y-2`}
            >
              <module.icon className={`h-8 w-8 text-gray-700`} />
              <span className="text-sm font-medium text-gray-900">{module.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardProfessional;
