import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Calendar, Filter, Download, Lock, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { WorkReport, WorkReportDetail, MonthlyReportData } from '../../types/workReports';
import { Project } from '../../types/projects';
import { Worker } from '../../types/construction';
import WorkReportForm from './WorkReportForm';
import WorkReportDetailsView from './WorkReportDetailsView';
import MonthlyClosingReport from './MonthlyClosingReport';

interface WorkReportsModuleProps {
  userName: string;
}

const WorkReportsModule: React.FC<WorkReportsModuleProps> = ({ userName }) => {
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [filteredReports, setFilteredReports] = useState<WorkReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WorkReport | null>(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterReports();
  }, [searchTerm, selectedProject, selectedStatus, dateFrom, dateTo, workReports]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadWorkReports(),
        loadProjects(),
        loadWorkers()
      ]);
    } catch (error: any) {
      showNotification('Error al cargar datos: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkReports = async () => {
    const { data, error } = await supabase
      .from('work_reports')
      .select('*')
      .order('report_date', { ascending: false });

    if (error) throw error;
    setWorkReports(data || []);
  };

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (error) throw error;
    setProjects(data || []);
  };

  const loadWorkers = async () => {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('status', 'active')
      .order('first_name');

    if (error) throw error;
    setWorkers(data || []);
  };

  const filterReports = () => {
    let filtered = [...workReports];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(report =>
        report.report_number.toLowerCase().includes(term) ||
        report.manager.toLowerCase().includes(term) ||
        report.activities?.toLowerCase().includes(term)
      );
    }

    if (selectedProject) {
      filtered = filtered.filter(report => report.project_id === selectedProject);
    }

    if (selectedStatus) {
      filtered = filtered.filter(report => report.status === selectedStatus);
    }

    if (dateFrom) {
      filtered = filtered.filter(report => report.report_date >= dateFrom);
    }

    if (dateTo) {
      filtered = filtered.filter(report => report.report_date <= dateTo);
    }

    setFilteredReports(filtered);
  };

  const handleCreateReport = () => {
    setSelectedReport(null);
    setShowForm(true);
  };

  const handleEditReport = (report: WorkReport) => {
    if (report.month_closed) {
      showNotification('No se puede editar un parte de un mes cerrado', 'error');
      return;
    }
    setSelectedReport(report);
    setShowForm(true);
  };

  const handleViewDetails = (report: WorkReport) => {
    setSelectedReport(report);
    setShowDetails(true);
  };

  const handleDeleteReport = async (id: string) => {
    const report = workReports.find(r => r.id === id);
    if (report?.month_closed) {
      showNotification('No se puede eliminar un parte de un mes cerrado', 'error');
      return;
    }

    if (!confirm('¿Está seguro de eliminar este parte de trabajo?')) return;

    try {
      const { error } = await supabase
        .from('work_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showNotification('Parte de trabajo eliminado correctamente', 'success');
      loadWorkReports();
    } catch (error: any) {
      showNotification('Error al eliminar: ' + error.message, 'error');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedReport(null);
    loadWorkReports();
    showNotification('Parte de trabajo guardado correctamente', 'success');
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      closed: 'bg-red-100 text-red-800'
    };
    const labels = {
      draft: 'Borrador',
      submitted: 'Enviado',
      approved: 'Aprobado',
      closed: 'Cerrado'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'N/A';
  };

  const exportToCSV = () => {
    const headers = ['Número', 'Fecha', 'Proyecto', 'Responsable', 'Estado', 'Actividades'];
    const rows = filteredReports.map(report => [
      report.report_number,
      new Date(report.report_date).toLocaleDateString('es-ES'),
      getProjectName(report.project_id),
      report.manager,
      report.status,
      report.activities || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `partes_trabajo_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (showForm) {
    return (
      <WorkReportForm
        report={selectedReport}
        projects={projects}
        workers={workers}
        userName={userName}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setSelectedReport(null);
        }}
      />
    );
  }

  if (showDetails && selectedReport) {
    return (
      <WorkReportDetailsView
        report={selectedReport}
        project={projects.find(p => p.id === selectedReport.project_id)}
        workers={workers}
        onClose={() => {
          setShowDetails(false);
          setSelectedReport(null);
        }}
        onEdit={() => {
          setShowDetails(false);
          handleEditReport(selectedReport);
        }}
        onRefresh={loadWorkReports}
      />
    );
  }

  if (showMonthlyReport) {
    return (
      <MonthlyClosingReport
        workReports={workReports}
        projects={projects}
        workers={workers}
        userName={userName}
        onClose={() => setShowMonthlyReport(false)}
        onRefresh={loadWorkReports}
      />
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {notification.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Partes de Trabajo
          </h1>
          <p className="text-gray-600 mt-1">Gestión de partes diarios de trabajo</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowMonthlyReport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Lock className="w-5 h-5" />
            Cierre Mensual
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Download className="w-5 h-5" />
            Exportar
          </button>
          <button
            onClick={handleCreateReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Nuevo Parte
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por número, responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las obras</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="draft">Borrador</option>
              <option value="submitted">Enviado</option>
              <option value="approved">Aprobado</option>
              <option value="closed">Cerrado</option>
            </select>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Desde"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Hasta"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Cargando partes de trabajo...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responsable
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cerrado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {report.report_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(report.report_date).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getProjectName(report.project_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.manager}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {report.month_closed ? (
                      <span className="flex items-center gap-1 text-red-600">
                        <Lock className="w-4 h-4" />
                        Sí
                      </span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(report)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Ver
                    </button>
                    {!report.month_closed && (
                      <>
                        <button
                          onClick={() => handleEditReport(report)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300" />
              <p className="mt-4 text-gray-500">No se encontraron partes de trabajo</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkReportsModule;
