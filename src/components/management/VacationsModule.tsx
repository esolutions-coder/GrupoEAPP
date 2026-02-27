import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar, Plus, Search, User, CheckCircle, Clock, X, AlertTriangle,
  Download, FileText, Edit, Trash2, Bell, Filter, Eye, Save, Check,
  Ban, TrendingUp, Users, Send, Pencil
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { VacationBalance, VacationRequest, VacationAlert, VacationType } from '../../types/vacations';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Worker {
  id: string;
  full_name: string;
  position: string;
}

const VacationsModule: React.FC = () => {
  const [view, setView] = useState<'requests' | 'balances' | 'alerts'>('requests');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'Pendiente' | 'Aprobado' | 'Rechazado'>('all');
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [balances, setBalances] = useState<VacationBalance[]>([]);
  const [alerts, setAlerts] = useState<VacationAlert[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VacationRequest | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState({
    worker_id: '',
    year: new Date().getFullYear(),
    start_date: '',
    end_date: '',
    vacation_type: 'Vacaciones anuales' as VacationType,
    reason: ''
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    loadData();
  }, [view]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadRequests(),
      loadBalances(),
      loadAlerts(),
      loadWorkers()
    ]);
    setLoading(false);
  };

  const loadWorkers = async () => {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('id, full_name, position')
        .order('full_name');

      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      console.error('Error loading workers:', error);
    }
  };

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('vacation_requests')
        .select(`
          *,
          workers!vacation_requests_worker_id_fkey (full_name, position)
        `)
        .order('requested_date', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map(item => ({
        ...item,
        worker_name: item.workers?.full_name,
        worker_position: item.workers?.position
      }));

      setRequests(formattedData);

      setStats({
        total: formattedData.length,
        pending: formattedData.filter(r => r.status === 'Pendiente').length,
        approved: formattedData.filter(r => r.status === 'Aprobado').length,
        rejected: formattedData.filter(r => r.status === 'Rechazado').length
      });
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const loadBalances = async () => {
    try {
      const { data, error } = await supabase
        .from('vacation_balances')
        .select(`
          *,
          workers!vacation_balances_worker_id_fkey (full_name, position)
        `)
        .eq('year', new Date().getFullYear())
        .order('remaining_days', { ascending: true });

      if (error) throw error;

      const formattedData = (data || []).map(item => ({
        ...item,
        worker_name: item.workers?.full_name,
        worker_position: item.workers?.position
      }));

      setBalances(formattedData);
    } catch (error) {
      console.error('Error loading balances:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('vacation_alerts')
        .select(`
          *,
          workers!vacation_alerts_worker_id_fkey (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedData = (data || []).map(item => ({
        ...item,
        worker_name: item.workers?.full_name
      }));

      setAlerts(formattedData);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmitRequest = async () => {
    try {
      if (!formData.worker_id || !formData.start_date || !formData.end_date) {
        alert('Por favor, completa todos los campos obligatorios');
        return;
      }

      const totalDays = calculateDays(formData.start_date, formData.end_date);

      const { error } = await supabase
        .from('vacation_requests')
        .insert([{
          worker_id: formData.worker_id,
          year: formData.year,
          start_date: formData.start_date,
          end_date: formData.end_date,
          total_days: totalDays,
          vacation_type: formData.vacation_type,
          reason: formData.reason,
          status: 'Pendiente',
          request_number: ''
        }]);

      if (error) throw error;

      alert('Solicitud creada exitosamente');
      setShowRequestModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Error al crear la solicitud');
    }
  };

  const handleApproveRequest = async (request: VacationRequest) => {
    setSelectedRequest(request);
    setShowSignatureModal(true);
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;

    try {
      const { error } = await supabase
        .from('vacation_requests')
        .update({
          status: 'Rechazado',
          rejection_reason: reason,
          approved_date: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      alert('Solicitud rechazada');
      loadData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error al rechazar la solicitud');
    }
  };

  const handleSignatureApproval = async () => {
    if (!canvasRef.current || !selectedRequest) return;

    try {
      const signatureData = canvasRef.current.toDataURL();

      const { error } = await supabase
        .from('vacation_requests')
        .update({
          status: 'Aprobado',
          signature_data: signatureData,
          approved_date: new Date().toISOString(),
          approved_by: 'admin'
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      alert('Solicitud aprobada con firma');
      setShowSignatureModal(false);
      setSelectedRequest(null);
      clearCanvas();
      loadData();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error al aprobar la solicitud');
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const generatePDF = async (request: VacationRequest) => {
    try {
      const { data: workerData } = await supabase
        .from('workers')
        .select('full_name, dni, position, email, phone')
        .eq('id', request.worker_id)
        .single();

      const pdf = new jsPDF();

      pdf.setFontSize(20);
      pdf.text('SOLICITUD DE VACACIONES', 105, 20, { align: 'center' });

      pdf.setFontSize(12);
      pdf.text(`N° Solicitud: ${request.request_number}`, 20, 40);

      pdf.setFontSize(11);
      pdf.text('DATOS DEL TRABAJADOR', 20, 55);
      pdf.setFontSize(10);
      pdf.text(`Nombre: ${workerData?.full_name || request.worker_name || 'N/A'}`, 20, 65);
      pdf.text(`DNI: ${workerData?.dni || 'N/A'}`, 20, 72);
      pdf.text(`Puesto: ${workerData?.position || request.worker_position || 'N/A'}`, 20, 79);
      pdf.text(`Email: ${workerData?.email || 'N/A'}`, 20, 86);
      pdf.text(`Teléfono: ${workerData?.phone || 'N/A'}`, 20, 93);

      pdf.setFontSize(11);
      pdf.text('DETALLES DE LA SOLICITUD', 20, 110);
      pdf.setFontSize(10);
      pdf.text(`Tipo: ${request.vacation_type}`, 20, 120);
      pdf.text(`Fecha inicio: ${new Date(request.start_date).toLocaleDateString('es-ES')}`, 20, 127);
      pdf.text(`Fecha fin: ${new Date(request.end_date).toLocaleDateString('es-ES')}`, 20, 134);
      pdf.text(`Total días: ${request.total_days}`, 20, 141);
      pdf.text(`Motivo: ${request.reason || 'No especificado'}`, 20, 148);

      pdf.setFontSize(11);
      pdf.text('ESTADO DE LA SOLICITUD', 20, 165);
      pdf.setFontSize(10);
      pdf.text(`Estado: ${request.status}`, 20, 175);
      pdf.text(`Fecha solicitud: ${new Date(request.requested_date).toLocaleString('es-ES')}`, 20, 182);

      if (request.status === 'Aprobado') {
        pdf.text(`Aprobado por: ${request.approved_by_name || request.approved_by || 'N/A'}`, 20, 189);
        pdf.text(`Fecha aprobación: ${request.approved_date ? new Date(request.approved_date).toLocaleString('es-ES') : 'N/A'}`, 20, 196);

        if (request.signature_data) {
          pdf.text('Firma del responsable:', 20, 210);
          pdf.addImage(request.signature_data, 'PNG', 20, 215, 50, 25);
        }
      } else if (request.status === 'Rechazado') {
        pdf.text(`Rechazado: ${request.rejection_reason || 'No especificado'}`, 20, 189);
        pdf.text(`Fecha rechazo: ${request.approved_date ? new Date(request.approved_date).toLocaleString('es-ES') : 'N/A'}`, 20, 196);
      }

      pdf.setFontSize(8);
      pdf.text('Grupo EA - Sistema de Gestión Empresarial', 105, 280, { align: 'center' });
      pdf.text(`Generado el ${new Date().toLocaleString('es-ES')}`, 105, 285, { align: 'center' });

      pdf.save(`Solicitud_Vacaciones_${request.request_number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  const generateBalanceReport = () => {
    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text('INFORME DE BALANCE DE VACACIONES', 105, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text(`Año ${new Date().getFullYear()}`, 105, 30, { align: 'center' });

    const tableData = balances.map(balance => [
      balance.worker_name || 'N/A',
      balance.worker_position || 'N/A',
      balance.total_days.toString(),
      balance.used_days.toString(),
      balance.pending_days.toString(),
      balance.remaining_days.toString()
    ]);

    (pdf as any).autoTable({
      startY: 40,
      head: [['Trabajador', 'Puesto', 'Total', 'Usados', 'Pendientes', 'Restantes']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    pdf.setFontSize(8);
    pdf.text('Grupo EA - Sistema de Gestión Empresarial', 105, 280, { align: 'center' });
    pdf.text(`Generado el ${new Date().toLocaleString('es-ES')}`, 105, 285, { align: 'center' });

    pdf.save(`Balance_Vacaciones_${new Date().getFullYear()}.pdf`);
  };

  const markAlertAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('vacation_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
      loadAlerts();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      worker_id: '',
      year: new Date().getFullYear(),
      start_date: '',
      end_date: '',
      vacation_type: 'Vacaciones anuales',
      reason: ''
    });
  };

  const filteredRequests = requests.filter(request => {
    const matchesFilter = selectedFilter === 'all' || request.status === selectedFilter;
    const matchesSearch = !searchTerm ||
      request.worker_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.request_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprobado': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Rechazado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Vacaciones anuales': return 'bg-blue-100 text-blue-800';
      case 'Asuntos personales': return 'bg-purple-100 text-purple-800';
      case 'Permiso médico': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'balance_low': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'expiring_days': return <Clock className="h-5 w-5 text-red-600" />;
      case 'pending_approval': return <Bell className="h-5 w-5 text-blue-600" />;
      case 'request_approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'request_rejected': return <X className="h-5 w-5 text-red-600" />;
      default: return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-corporate-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Vacaciones</h2>
          <p className="text-gray-600">Control completo de solicitudes y balance de vacaciones</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setView('requests')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'requests'
                ? 'bg-corporate-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Solicitudes
          </button>
          <button
            onClick={() => setView('balances')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'balances'
                ? 'bg-corporate-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="h-4 w-4 inline mr-2" />
            Balances
          </button>
          <button
            onClick={() => setView('alerts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors relative ${
              view === 'alerts'
                ? 'bg-corporate-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Bell className="h-4 w-4 inline mr-2" />
            Alertas
            {alerts.filter(a => !a.is_read).length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {alerts.filter(a => !a.is_read).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Solicitud</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Solicitudes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aprobadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rechazadas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
            <X className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {view === 'requests' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Solicitudes de Vacaciones</h3>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'Pendiente', label: 'Pendientes' },
                { id: 'Aprobado', label: 'Aprobadas' },
                { id: 'Rechazado', label: 'Rechazadas' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id as any)}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                    selectedFilter === filter.id
                      ? 'bg-corporate-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-corporate-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-corporate-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{request.worker_name || 'N/A'}</h4>
                        <p className="text-sm text-gray-500">{request.worker_position || 'N/A'}</p>
                        <p className="text-xs text-gray-400">{request.request_number}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(request.vacation_type)}`}>
                        {request.vacation_type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Fechas:</span>
                      <div>{new Date(request.start_date).toLocaleDateString('es-ES')} - {new Date(request.end_date).toLocaleDateString('es-ES')}</div>
                    </div>
                    <div>
                      <span className="font-medium">Días solicitados:</span>
                      <div>{request.total_days} días</div>
                    </div>
                    <div>
                      <span className="font-medium">Solicitado:</span>
                      <div>{new Date(request.requested_date).toLocaleDateString('es-ES')}</div>
                    </div>
                    {request.approved_date && (
                      <div>
                        <span className="font-medium">{request.status === 'Aprobado' ? 'Aprobado' : 'Rechazado'}:</span>
                        <div>{new Date(request.approved_date).toLocaleDateString('es-ES')}</div>
                      </div>
                    )}
                  </div>

                  {request.reason && (
                    <div className="text-sm text-gray-600 mb-3">
                      <span className="font-medium">Motivo:</span> {request.reason}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex space-x-2">
                      {request.status === 'Pendiente' && (
                        <>
                          <button
                            onClick={() => handleApproveRequest(request)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center space-x-1"
                          >
                            <Check className="h-3 w-3" />
                            <span>Aprobar</span>
                          </button>
                          <button
                            onClick={() => handleRejectRequest(request.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium flex items-center space-x-1"
                          >
                            <Ban className="h-3 w-3" />
                            <span>Rechazar</span>
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => generatePDF(request)}
                      className="text-corporate-blue-600 hover:text-corporate-blue-700 text-sm font-medium flex items-center space-x-1"
                    >
                      <Download className="h-4 w-4" />
                      <span>Descargar PDF</span>
                    </button>
                  </div>

                  {request.rejection_reason && (
                    <div className="text-xs text-red-600 mt-2 pt-2 border-t border-gray-200">
                      <span className="font-medium">Motivo rechazo:</span> {request.rejection_reason}
                    </div>
                  )}
                </div>
              ))}
              {filteredRequests.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No hay solicitudes {selectedFilter !== 'all' ? selectedFilter.toLowerCase() + 's' : ''}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'balances' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Balance de Vacaciones {new Date().getFullYear()}</h3>
            <button
              onClick={generateBalanceReport}
              className="text-corporate-blue-600 hover:text-corporate-blue-700 text-sm font-medium flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span>Exportar PDF</span>
            </button>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {balances.map((balance) => (
                <div key={balance.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-corporate-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-corporate-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{balance.worker_name || 'N/A'}</h4>
                      <p className="text-sm text-gray-500">{balance.worker_position || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total días:</span>
                      <span className="font-medium">{balance.total_days}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Días usados:</span>
                      <span className="font-medium text-red-600">{balance.used_days}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Días pendientes:</span>
                      <span className="font-medium text-yellow-600">{balance.pending_days}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Días restantes:</span>
                      <span className="font-medium text-green-600">{balance.remaining_days}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-corporate-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(balance.used_days / balance.total_days) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round((balance.used_days / balance.total_days) * 100)}% utilizado
                    </div>
                  </div>

                  {balance.remaining_days < 5 && (
                    <div className="mt-3 flex items-center space-x-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Balance bajo</span>
                    </div>
                  )}
                </div>
              ))}
              {balances.length === 0 && (
                <div className="col-span-3 text-center py-12 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No hay balances registrados</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'alerts' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Alertas y Notificaciones</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 flex items-start space-x-3 ${
                    alert.is_read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  {getAlertIcon(alert.alert_type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.worker_name || 'Sistema'}</p>
                    <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(alert.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                  {!alert.is_read && (
                    <button
                      onClick={() => markAlertAsRead(alert.id)}
                      className="text-corporate-blue-600 hover:text-corporate-blue-700 text-sm font-medium"
                    >
                      Marcar leída
                    </button>
                  )}
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No hay alertas</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Nueva Solicitud de Vacaciones</h3>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trabajador *
                </label>
                <select
                  value={formData.worker_id}
                  onChange={(e) => setFormData({ ...formData, worker_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar trabajador</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.full_name} - {worker.position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha inicio *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha fin *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {formData.start_date && formData.end_date && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Días solicitados:</strong> {calculateDays(formData.start_date, formData.end_date)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de vacaciones *
                </label>
                <select
                  value={formData.vacation_type}
                  onChange={(e) => setFormData({ ...formData, vacation_type: e.target.value as VacationType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  required
                >
                  <option value="Vacaciones anuales">Vacaciones anuales</option>
                  <option value="Asuntos personales">Asuntos personales</option>
                  <option value="Permiso médico">Permiso médico</option>
                  <option value="Permiso retribuido">Permiso retribuido</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  placeholder="Describe el motivo de la solicitud..."
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitRequest}
                className="px-4 py-2 bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white rounded-lg flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Crear Solicitud</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showSignatureModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Aprobar con Firma</h3>
              <button
                onClick={() => {
                  setShowSignatureModal(false);
                  setSelectedRequest(null);
                  clearCanvas();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Solicitud:</strong> {selectedRequest.request_number}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Trabajador:</strong> {selectedRequest.worker_name}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Fechas:</strong> {new Date(selectedRequest.start_date).toLocaleDateString('es-ES')} - {new Date(selectedRequest.end_date).toLocaleDateString('es-ES')}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Días:</strong> {selectedRequest.total_days}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Firma del responsable
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full cursor-crosshair"
                    style={{ touchAction: 'none' }}
                  />
                </div>
                <button
                  onClick={clearCanvas}
                  className="mt-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpiar firma
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSignatureModal(false);
                  setSelectedRequest(null);
                  clearCanvas();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSignatureApproval}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Aprobar y Firmar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacationsModule;
