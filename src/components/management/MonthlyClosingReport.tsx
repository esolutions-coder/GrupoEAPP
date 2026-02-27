import React, { useState, useEffect } from 'react';
import { X, Lock, Download, Calendar, FileText, Users, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { WorkReport, WorkReportDetail } from '../../types/workReports';
import { Project } from '../../types/projects';
import { Worker } from '../../types/construction';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MonthlyClosingReportProps {
  workReports: WorkReport[];
  projects: Project[];
  workers: Worker[];
  userName: string;
  onClose: () => void;
  onRefresh: () => void;
}

const MonthlyClosingReport: React.FC<MonthlyClosingReportProps> = ({
  workReports,
  projects,
  workers,
  userName,
  onClose,
  onRefresh
}) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    generateReport();
  }, [selectedYear, selectedMonth]);

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];

      const monthReports = workReports.filter(r =>
        r.report_date >= startDate && r.report_date <= endDate
      );

      if (monthReports.length === 0) {
        setReportData(null);
        return;
      }

      const reportIds = monthReports.map(r => r.id);
      const { data: details, error } = await supabase
        .from('work_report_details')
        .select('*')
        .in('work_report_id', reportIds);

      if (error) throw error;

      const totalHours = details?.reduce((sum, d) => sum + parseFloat(d.hours_worked.toString()), 0) || 0;

      const hoursByType = {
        admin: details?.filter(d => d.hour_type === 'admin').reduce((sum, d) => sum + parseFloat(d.hours_worked.toString()), 0) || 0,
        destajo: details?.filter(d => d.hour_type === 'destajo').reduce((sum, d) => sum + parseFloat(d.hours_worked.toString()), 0) || 0,
        extra: details?.filter(d => d.hour_type === 'extra').reduce((sum, d) => sum + parseFloat(d.hours_worked.toString()), 0) || 0
      };

      const projectsMap = new Map();
      monthReports.forEach(report => {
        const projectId = report.project_id;
        const project = projects.find(p => p.id === projectId);
        const projectDetails = details?.filter(d =>
          monthReports.find(r => r.id === d.work_report_id && r.project_id === projectId)
        ) || [];
        const projectHours = projectDetails.reduce((sum, d) => sum + parseFloat(d.hours_worked.toString()), 0);

        if (projectsMap.has(projectId)) {
          projectsMap.set(projectId, {
            ...projectsMap.get(projectId),
            total_hours: projectsMap.get(projectId).total_hours + projectHours,
            reports_count: projectsMap.get(projectId).reports_count + 1
          });
        } else {
          projectsMap.set(projectId, {
            project_id: projectId,
            project_name: project?.name || 'N/A',
            total_hours: projectHours,
            reports_count: 1
          });
        }
      });

      const workersMap = new Map();
      details?.forEach(detail => {
        const workerId = detail.worker_id;
        const worker = workers.find(w => w.id === workerId);
        const hours = parseFloat(detail.hours_worked.toString());

        if (workersMap.has(workerId)) {
          workersMap.set(workerId, {
            ...workersMap.get(workerId),
            total_hours: workersMap.get(workerId).total_hours + hours,
            reports_count: workersMap.get(workerId).reports_count + 1
          });
        } else {
          workersMap.set(workerId, {
            worker_id: workerId,
            worker_name: worker?.name || 'N/A',
            total_hours: hours,
            reports_count: 1
          });
        }
      });

      setReportData({
        month: months[selectedMonth - 1],
        year: selectedYear,
        total_reports: monthReports.length,
        total_hours: totalHours,
        hours_by_type: hoursByType,
        reports_by_project: Array.from(projectsMap.values()),
        workers_summary: Array.from(workersMap.values()),
        is_closed: monthReports.every(r => r.month_closed)
      });
    } catch (error: any) {
      alert('Error al generar el informe: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeMonth = async () => {
    if (!confirm(`¿Está seguro de cerrar el mes de ${months[selectedMonth - 1]} ${selectedYear}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];

      const { error } = await supabase
        .from('work_reports')
        .update({
          month_closed: true,
          closed_at: new Date().toISOString(),
          closed_by: userName,
          status: 'closed'
        })
        .gte('report_date', startDate)
        .lte('report_date', endDate);

      if (error) throw error;

      alert('Mes cerrado correctamente');
      generateReport();
      onRefresh();
    } catch (error: any) {
      alert('Error al cerrar el mes: ' + error.message);
    }
  };

  const exportToPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Informe Mensual de Partes de Trabajo', 105, 15, { align: 'center' });

    doc.setFontSize(14);
    doc.text(`${reportData.month} ${reportData.year}`, 105, 25, { align: 'center' });

    doc.setFontSize(12);
    doc.text('Resumen General', 20, 40);
    doc.setFontSize(10);
    doc.text(`Total de Partes: ${reportData.total_reports}`, 20, 48);
    doc.text(`Total de Horas: ${reportData.total_hours.toFixed(2)}`, 20, 55);

    doc.text('Distribución por Tipo de Hora:', 20, 65);
    doc.text(`Admin: ${reportData.hours_by_type.admin.toFixed(2)} hrs`, 30, 72);
    doc.text(`Destajo: ${reportData.hours_by_type.destajo.toFixed(2)} hrs`, 30, 79);
    doc.text(`Extra: ${reportData.hours_by_type.extra.toFixed(2)} hrs`, 30, 86);

    autoTable(doc, {
      startY: 95,
      head: [['Proyecto', 'N° Partes', 'Total Horas']],
      body: reportData.reports_by_project.map((p: any) => [
        p.project_name,
        p.reports_count.toString(),
        p.total_hours.toFixed(2)
      ]),
      theme: 'grid'
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    autoTable(doc, {
      startY: finalY,
      head: [['Operario', 'N° Partes', 'Total Horas']],
      body: reportData.workers_summary.map((w: any) => [
        w.worker_name,
        w.reports_count.toString(),
        w.total_hours.toFixed(2)
      ]),
      theme: 'grid'
    });

    doc.save(`informe_mensual_${selectedYear}_${selectedMonth}.pdf`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md">
        <div className="bg-purple-600 text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Cierre Mensual e Informes
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Seleccionar Período</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index + 1}>{month}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 animate-spin mx-auto text-purple-600" />
              <p className="mt-4 text-gray-600">Generando informe...</p>
            </div>
          ) : reportData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Total Partes</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{reportData.total_reports}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Total Horas</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{reportData.total_hours.toFixed(2)}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-orange-600" />
                    <span className="text-sm text-gray-600">Operarios</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{reportData.workers_summary.length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-600">Estado</span>
                  </div>
                  <p className="text-lg font-bold text-purple-600">
                    {reportData.is_closed ? 'Cerrado' : 'Abierto'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Horas por Tipo</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Admin:</span>
                      <span className="font-semibold text-blue-600">{reportData.hours_by_type.admin.toFixed(2)} hrs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Destajo:</span>
                      <span className="font-semibold text-green-600">{reportData.hours_by_type.destajo.toFixed(2)} hrs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Extra:</span>
                      <span className="font-semibold text-orange-600">{reportData.hours_by_type.extra.toFixed(2)} hrs</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Distribución por Tipo</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 h-8 rounded-lg overflow-hidden">
                        <div
                          className="bg-blue-600 h-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{ width: `${(reportData.hours_by_type.admin / reportData.total_hours) * 100}%` }}
                        >
                          {((reportData.hours_by_type.admin / reportData.total_hours) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 w-16">Admin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 h-8 rounded-lg overflow-hidden">
                        <div
                          className="bg-green-600 h-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{ width: `${(reportData.hours_by_type.destajo / reportData.total_hours) * 100}%` }}
                        >
                          {((reportData.hours_by_type.destajo / reportData.total_hours) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 w-16">Destajo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 h-8 rounded-lg overflow-hidden">
                        <div
                          className="bg-orange-600 h-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{ width: `${(reportData.hours_by_type.extra / reportData.total_hours) * 100}%` }}
                        >
                          {((reportData.hours_by_type.extra / reportData.total_hours) * 100).toFixed(1)}%
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 w-16">Extra</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Resumen por Proyecto</h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Proyecto</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Partes</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Horas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.reports_by_project.map((project: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{project.project_name}</td>
                            <td className="px-4 py-2 text-sm text-center">{project.reports_count}</td>
                            <td className="px-4 py-2 text-sm text-right font-semibold">{project.total_hours.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Resumen por Operario</h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Operario</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-700">Partes</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Horas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.workers_summary.map((worker: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-900">{worker.worker_name}</td>
                            <td className="px-4 py-2 text-sm text-center">{worker.reports_count}</td>
                            <td className="px-4 py-2 text-sm text-right font-semibold">{worker.total_hours.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No hay partes de trabajo para el período seleccionado</p>
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center rounded-b-lg border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Cerrar
          </button>
          {reportData && (
            <div className="flex gap-3">
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Download className="w-5 h-5" />
                Exportar PDF
              </button>
              {!reportData.is_closed && (
                <button
                  onClick={closeMonth}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Lock className="w-5 h-5" />
                  Cerrar Mes
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyClosingReport;
