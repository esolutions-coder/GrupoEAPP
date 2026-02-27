import React, { useState, useEffect } from 'react';
import {
  Scale, FileText, AlertTriangle, Calendar, DollarSign, TrendingUp,
  Users, Clock, CheckCircle, XCircle, AlertCircle, Plus, Download,
  Upload, Search, Filter, Edit, Trash2, Eye, Bell, Save, X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import * as XLSX from 'xlsx';
import type { SMACRecord, SMACStatus, ClaimType, SMACStats } from '../../types/smac';

const CLAIM_TYPE_LABELS: Record<ClaimType, string> = {
  despido_improcedente: 'Despido Improcedente',
  despido_nulo: 'Despido Nulo',
  despido_disciplinario: 'Despido Disciplinario',
  finiquito: 'Reclamación de Finiquito',
  indemnizacion: 'Indemnización',
  cantidad: 'Reclamación de Cantidad',
  salarios: 'Salarios Impagados',
  horas_extras: 'Horas Extras',
  vacaciones: 'Vacaciones no Disfrutadas',
  modificacion_sustancial: 'Modificación Sustancial',
  acoso: 'Acoso Laboral',
  seguridad_social: 'Seguridad Social',
  otros: 'Otros'
};

const STATUS_LABELS: Record<SMACStatus, string> = {
  presentado: 'Presentado',
  citado: 'Citado para Conciliación',
  conciliado: 'Conciliado con Acuerdo',
  sin_avenencia: 'Sin Avenencia',
  demanda_judicial: 'Demanda Judicial Presentada',
  juicio_pendiente: 'Juicio Pendiente',
  sentencia_pendiente: 'Pendiente de Sentencia',
  resuelto_favorable: 'Resuelto Favorable',
  resuelto_desfavorable: 'Resuelto Desfavorable',
  desistimiento: 'Desistimiento',
  caducado: 'Caducado'
};

const STATUS_COLORS: Record<SMACStatus, string> = {
  presentado: 'bg-blue-100 text-blue-800',
  citado: 'bg-cyan-100 text-cyan-800',
  conciliado: 'bg-green-100 text-green-800',
  sin_avenencia: 'bg-yellow-100 text-yellow-800',
  demanda_judicial: 'bg-orange-100 text-orange-800',
  juicio_pendiente: 'bg-red-100 text-red-800',
  sentencia_pendiente: 'bg-purple-100 text-purple-800',
  resuelto_favorable: 'bg-emerald-100 text-emerald-800',
  resuelto_desfavorable: 'bg-rose-100 text-rose-800',
  desistimiento: 'bg-gray-100 text-gray-800',
  caducado: 'bg-slate-100 text-slate-800'
};

interface Worker {
  id: string;
  worker_code: string;
  first_name: string;
  last_name: string;
  dni: string;
  phone?: string;
  email?: string;
  category?: string;
  hire_date?: string;
  termination_date?: string;
  hourly_rate?: number;
  monthly_rate?: number;
  status: string;
}

export default function SMACManagement() {
  const [records, setRecords] = useState<SMACRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<SMACRecord[]>([]);
  const [stats, setStats] = useState<SMACStats | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SMACRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SMACStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar registros SMAC
      const { data: smacData, error: smacError } = await supabase
        .from('smac_records')
        .select('*')
        .order('presentation_date', { ascending: false });

      if (smacError) throw smacError;

      const formattedData = (smacData || []).map(record => ({
        ...record,
        claim_types: Array.isArray(record.claim_types) ? record.claim_types : []
      }));

      setRecords(formattedData);
      calculateStats(formattedData);

      // Cargar trabajadores
      const { data: workersData, error: workersError } = await supabase
        .from('workers')
        .select('id, worker_code, first_name, last_name, dni, phone, email, category, hire_date, termination_date, hourly_rate, monthly_rate, status')
        .order('last_name', { ascending: true });

      if (workersError) {
        console.error('Error loading workers:', workersError);
      } else {
        setWorkers(workersData || []);
      }
    } catch (error) {
      console.error('Error loading SMAC records:', error);
      alert('Error al cargar los registros SMAC');
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.worker_name.toLowerCase().includes(term) ||
        record.worker_dni.toLowerCase().includes(term) ||
        record.smac_number.toLowerCase().includes(term) ||
        (record.judicial_number?.toLowerCase().includes(term) || false)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    setFilteredRecords(filtered);
  };

  const calculateStats = (data: SMACRecord[]) => {
    const active = data.filter(r => !['resuelto_favorable', 'resuelto_desfavorable', 'desistimiento', 'caducado'].includes(r.status));
    const resolved = data.filter(r => ['resuelto_favorable', 'resuelto_desfavorable', 'desistimiento', 'caducado'].includes(r.status));

    const byStatus = data.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {} as Record<SMACStatus, number>);

    const totalClaimed = data.reduce((sum, r) => sum + (r.claimed_amount || 0), 0);
    const totalSettled = data.reduce((sum, r) => sum + (r.settlement_amount || 0), 0);
    const totalCosts = data.reduce((sum, r) => sum + (r.total_cost || 0), 0);

    const totalPaid = data.reduce((sum, r) => sum + (r.actual_paid_amount || 0), 0);
    const totalDeviation = data.reduce((sum, r) => sum + (r.deviation_amount || 0), 0);
    const paidToClaimedRatio = totalClaimed > 0 ? (totalPaid / totalClaimed) * 100 : 0;

    const uniqueWorkers = new Set(data.map(r => r.worker_id).filter(Boolean)).size;
    const smacToWorkersRatio = uniqueWorkers > 0 ? data.length / uniqueWorkers : 0;

    const conciliated = data.filter(r => r.status === 'conciliado').length;
    const conciliationRate = data.length > 0 ? (conciliated / data.length) * 100 : 0;

    const favorable = data.filter(r => r.status === 'resuelto_favorable' || r.status === 'conciliado').length;
    const favorableRate = resolved.length > 0 ? (favorable / resolved.length) * 100 : 0;

    const stats: SMACStats = {
      total_cases: data.length,
      active_cases: active.length,
      resolved_cases: resolved.length,
      by_status: byStatus,
      by_claim_type: {} as Record<ClaimType, number>,
      total_claimed: totalClaimed,
      total_settled: totalSettled,
      total_costs: totalCosts,
      average_settlement: resolved.length > 0 ? totalSettled / resolved.length : 0,
      total_paid: totalPaid,
      total_deviation: totalDeviation,
      paid_to_claimed_ratio: paidToClaimedRatio,
      smac_to_workers_ratio: smacToWorkersRatio,
      conciliation_rate: conciliationRate,
      favorable_resolution_rate: favorableRate,
      average_duration_days: 0,
      pending_trials: data.filter(r => r.status === 'juicio_pendiente').length,
      cases_by_year: []
    };

    setStats(stats);
  };

  const handleSave = async (formData: Partial<SMACRecord>) => {
    try {
      const cleanData = {
        smac_number: formData.smac_number,
        judicial_number: formData.judicial_number || null,
        presentation_date: formData.presentation_date,
        conciliation_date: formData.conciliation_date || null,
        trial_date: formData.trial_date || null,
        resolution_date: formData.resolution_date || null,
        worker_id: formData.worker_id || null,
        worker_name: formData.worker_name,
        worker_dni: formData.worker_dni,
        worker_phone: formData.worker_phone || null,
        worker_email: formData.worker_email || null,
        worker_category: formData.worker_category || null,
        entry_date: formData.entry_date,
        exit_date: formData.exit_date,
        position: formData.position,
        last_salary: formData.last_salary || 0,
        claim_types: formData.claim_types || [],
        claim_description: formData.claim_description,
        claimed_amount: formData.claimed_amount || 0,
        status: formData.status || 'presentado',
        current_phase: formData.current_phase || 'Presentado ante SMAC',
        resolution_type: formData.resolution_type || null,
        conciliation_achieved: formData.conciliation_achieved || false,
        conciliation_amount: formData.conciliation_amount || null,
        settlement_amount: formData.settlement_amount || null,
        payment_date: formData.payment_date || null,
        payment_method: formData.payment_method || null,
        agreement_reached: formData.agreement_reached || false,
        agreement_amount: formData.agreement_amount || null,
        actual_paid_amount: formData.actual_paid_amount || 0,
        is_favorable: formData.is_favorable || null,
        our_lawyer: formData.our_lawyer || null,
        worker_lawyer: formData.worker_lawyer || null,
        labor_court: formData.labor_court || null,
        legal_costs: formData.legal_costs || 0,
        court_fees: formData.court_fees || 0,
        settlement_costs: formData.settlement_costs || 0,
        notes: formData.notes || null,
        risk_level: formData.risk_level || 'medio',
        probability_loss: formData.probability_loss || 50,
        assigned_to: formData.assigned_to || null,
        project_id: formData.project_id || null
      };

      if (editingRecord) {
        const { error } = await supabase
          .from('smac_records')
          .update(cleanData)
          .eq('id', editingRecord.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('smac_records')
          .insert([{
            ...cleanData,
            created_by: 'current_user'
          }]);

        if (error) throw error;
      }

      await loadData();
      setShowForm(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Error saving SMAC record:', error);
      alert('Error al guardar el registro: ' + (error as any).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este registro SMAC?')) return;

    try {
      const { error } = await supabase
        .from('smac_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error deleting SMAC record:', error);
      alert('Error al eliminar el registro');
    }
  };

  const exportToExcel = () => {
    const exportData = filteredRecords.map(record => ({
      'Nº SMAC': record.smac_number,
      'Nº Judicial': record.judicial_number || '',
      'Trabajador': record.worker_name,
      'DNI': record.worker_dni,
      'Categoría': record.worker_category || '',
      'Puesto': record.position,
      'Fecha Alta': record.entry_date || '',
      'Fecha Baja': record.exit_date || '',
      'Último Salario': record.last_salary || 0,
      'Fecha Presentación': record.presentation_date,
      'Estado': STATUS_LABELS[record.status],
      'Tipo Reclamación': record.claim_types.map(t => CLAIM_TYPE_LABELS[t]).join(', '),
      'Importe Reclamado': record.claimed_amount,
      'Acuerdo Alcanzado': record.agreement_reached ? 'Sí' : 'No',
      'Importe Acuerdo': record.agreement_amount || 0,
      'Cantidad Pagada': record.actual_paid_amount || 0,
      'Desviación': record.deviation_amount || 0,
      'Resultado': record.is_favorable === null ? 'Pendiente' : record.is_favorable ? 'Favorable' : 'Desfavorable',
      'Costes Totales': record.total_cost,
      'Fecha Conciliación': record.conciliation_date || '',
      'Fecha Juicio': record.trial_date || '',
      'Abogado Empresa': record.our_lawyer || '',
      'Abogado Trabajador': record.worker_lawyer || '',
      'Juzgado': record.labor_court || '',
      'Nivel Riesgo': record.risk_level,
      'Probabilidad Pérdida': `${record.probability_loss}%`,
      'Observaciones': record.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'SMAC');

    const colWidths = [
      { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 15 },
      { wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
      { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 12 }, { wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 20 },
      { wch: 12 }, { wch: 15 }, { wch: 40 }
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `SMAC_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando registros SMAC...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Scale className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de SMAC</h2>
            <p className="text-sm text-gray-600">Servicios de Mediación, Arbitraje y Conciliación</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'stats' : 'list')}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {viewMode === 'list' ? <TrendingUp className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-5 h-5" />
            Exportar Excel
          </button>
          <button
            onClick={() => {
              setEditingRecord(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Nuevo SMAC
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Casos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_cases}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Casos Activos</p>
                <p className="text-2xl font-bold text-orange-600">{stats.active_cases}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tasa Conciliación</p>
                <p className="text-2xl font-bold text-green-600">{stats.conciliation_rate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ratio Pagado/Reclamado</p>
                <p className={`text-2xl font-bold ${stats.paid_to_claimed_ratio < 100 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.paid_to_claimed_ratio.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className={`w-8 h-8 ${stats.paid_to_claimed_ratio < 100 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Desviación</p>
                <p className={`text-xl font-bold ${stats.total_deviation < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.total_deviation.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                </p>
              </div>
              <DollarSign className={`w-8 h-8 ${stats.total_deviation < 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ratio SMAC/Trabajadores</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.smac_to_workers_ratio.toFixed(2)}</p>
              </div>
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'stats' ? (
        <StatsView stats={stats} records={filteredRecords} />
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, DNI o número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as SMACStatus | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              <div className="text-sm text-gray-600 flex items-center justify-end">
                Mostrando {filteredRecords.length} de {records.length} registros
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nº SMAC / Judicial
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trabajador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo Reclamación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reclamado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coste Total
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Riesgo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{record.smac_number}</div>
                        {record.judicial_number && (
                          <div className="text-xs text-gray-500">{record.judicial_number}</div>
                        )}
                        <div className="text-xs text-gray-500">{record.presentation_date}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{record.worker_name}</div>
                        <div className="text-xs text-gray-500">{record.worker_dni}</div>
                        {record.worker_category && (
                          <div className="text-xs font-medium text-blue-600">{record.worker_category}</div>
                        )}
                        <div className="text-xs text-gray-500">{record.position}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {record.claim_types.slice(0, 2).map((type, idx) => (
                            <div key={idx} className="text-xs">
                              {CLAIM_TYPE_LABELS[type]}
                            </div>
                          ))}
                          {record.claim_types.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{record.claim_types.length - 2} más
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[record.status]}`}>
                          {STATUS_LABELS[record.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {record.claimed_amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-red-600">
                        {record.total_cost.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.risk_level === 'bajo' ? 'bg-green-100 text-green-800' :
                          record.risk_level === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                          record.risk_level === 'alto' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.risk_level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingRecord(record);
                              setShowForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Form Modal */}
      {showForm && (
        <SMACForm
          record={editingRecord}
          workers={workers}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingRecord(null);
          }}
        />
      )}
    </div>
  );
}

interface SMACFormProps {
  record: SMACRecord | null;
  workers: Worker[];
  onSave: (data: Partial<SMACRecord>) => void;
  onClose: () => void;
}

function SMACForm({ record, workers, onSave, onClose }: SMACFormProps) {
  const [formData, setFormData] = useState<Partial<SMACRecord>>(
    record || {
      smac_number: '',
      worker_name: '',
      worker_dni: '',
      position: '',
      presentation_date: new Date().toISOString().split('T')[0],
      entry_date: '',
      exit_date: '',
      last_salary: 0,
      claim_types: [],
      claim_description: '',
      claimed_amount: 0,
      status: 'presentado',
      current_phase: 'Presentado ante SMAC',
      conciliation_achieved: false,
      agreement_reached: false,
      actual_paid_amount: 0,
      deviation_amount: 0,
      legal_costs: 0,
      court_fees: 0,
      settlement_costs: 0,
      total_cost: 0,
      risk_level: 'medio',
      probability_loss: 50
    }
  );

  const handleWorkerSelect = (workerId: string) => {
    if (!workerId) {
      return;
    }

    const selectedWorker = workers.find(w => w.id === workerId);
    if (selectedWorker) {
      setFormData({
        ...formData,
        worker_id: selectedWorker.id,
        worker_name: `${selectedWorker.first_name} ${selectedWorker.last_name}`,
        worker_dni: selectedWorker.dni,
        worker_phone: selectedWorker.phone || '',
        worker_email: selectedWorker.email || '',
        worker_category: selectedWorker.category || '',
        entry_date: selectedWorker.hire_date || '',
        exit_date: selectedWorker.termination_date || '',
        last_salary: selectedWorker.monthly_rate || selectedWorker.hourly_rate || 0
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.claim_types || formData.claim_types.length === 0) {
      alert('Por favor, selecciona al menos un tipo de reclamación');
      return;
    }

    if (!formData.smac_number || !formData.worker_name || !formData.worker_dni ||
        !formData.position || !formData.entry_date || !formData.exit_date ||
        !formData.claim_description) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {record ? 'Editar SMAC' : 'Nuevo SMAC'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Datos del Procedimiento */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Datos del Procedimiento</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nº SMAC *
                </label>
                <input
                  type="text"
                  required
                  value={formData.smac_number}
                  onChange={(e) => setFormData({ ...formData, smac_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nº Judicial
                </label>
                <input
                  type="text"
                  value={formData.judicial_number || ''}
                  onChange={(e) => setFormData({ ...formData, judicial_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Presentación *
                </label>
                <input
                  type="date"
                  required
                  value={formData.presentation_date}
                  onChange={(e) => setFormData({ ...formData, presentation_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Selección del Trabajador */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Trabajador</h4>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trabajador *
                </label>
                <select
                  value={formData.worker_id || ''}
                  onChange={(e) => handleWorkerSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar trabajador...</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.last_name}, {worker.first_name} - {worker.dni} - {worker.category || 'Sin categoría'}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Selecciona un trabajador de la lista o introduce los datos manualmente
                </p>
              </div>
            </div>
          </div>

          {/* Datos del Trabajador */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Datos del Trabajador</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.worker_name}
                  onChange={(e) => setFormData({ ...formData, worker_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Se completa al seleccionar trabajador"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DNI/NIE *
                </label>
                <input
                  type="text"
                  required
                  value={formData.worker_dni}
                  onChange={(e) => setFormData({ ...formData, worker_dni: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Se completa al seleccionar trabajador"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría Profesional
                </label>
                <input
                  type="text"
                  value={formData.worker_category || ''}
                  onChange={(e) => setFormData({ ...formData, worker_category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Oficial, Ayudante, Peón, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Puesto de Trabajo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Último Salario €
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.last_salary}
                  onChange={(e) => setFormData({ ...formData, last_salary: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Alta *
                </label>
                <input
                  type="date"
                  required
                  value={formData.entry_date}
                  onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Baja *
                </label>
                <input
                  type="date"
                  required
                  value={formData.exit_date}
                  onChange={(e) => setFormData({ ...formData, exit_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Datos de la Reclamación */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Datos de la Reclamación</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Reclamación *
                </label>
                <select
                  multiple
                  value={formData.claim_types}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value as ClaimType);
                    setFormData({ ...formData, claim_types: selected });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  size={6}
                >
                  {Object.entries(CLAIM_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Mantén Ctrl/Cmd para seleccionar múltiples</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción de la Reclamación *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.claim_description}
                  onChange={(e) => setFormData({ ...formData, claim_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Importe Reclamado € *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.claimed_amount}
                    onChange={(e) => setFormData({ ...formData, claimed_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as SMACStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Evaluación de Riesgo */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Evaluación de Riesgo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel de Riesgo
                </label>
                <select
                  value={formData.risk_level}
                  onChange={(e) => setFormData({ ...formData, risk_level: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bajo">Bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                  <option value="critico">Crítico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Probabilidad de Pérdida %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability_loss}
                  onChange={(e) => setFormData({ ...formData, probability_loss: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Resolución y Acuerdos */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Resolución y Acuerdos</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="agreement_reached"
                    checked={formData.agreement_reached || false}
                    onChange={(e) => setFormData({ ...formData, agreement_reached: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="agreement_reached" className="text-sm font-medium text-gray-700">
                    ¿Se llegó a un acuerdo?
                  </label>
                </div>

                {formData.agreement_reached && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Importe del Acuerdo €
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.agreement_amount || ''}
                      onChange={(e) => setFormData({ ...formData, agreement_amount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad Realmente Pagada €
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.actual_paid_amount || 0}
                    onChange={(e) => setFormData({ ...formData, actual_paid_amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Cantidad pagada por acuerdo o sentencia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resultado
                  </label>
                  <select
                    value={formData.is_favorable === null ? 'pendiente' : formData.is_favorable ? 'favorable' : 'desfavorable'}
                    onChange={(e) => setFormData({
                      ...formData,
                      is_favorable: e.target.value === 'pendiente' ? null : e.target.value === 'favorable'
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="favorable">Favorable a la Empresa</option>
                    <option value="desfavorable">Desfavorable a la Empresa</option>
                  </select>
                </div>
              </div>

              {formData.claimed_amount && formData.actual_paid_amount ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Importe Reclamado:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {(formData.claimed_amount || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Desviación:</span>
                      <span className={`ml-2 font-semibold ${
                        ((formData.actual_paid_amount || 0) - (formData.claimed_amount || 0)) < 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {((formData.actual_paid_amount || 0) - (formData.claimed_amount || 0)).toLocaleString('es-ES', {
                          style: 'currency',
                          currency: 'EUR'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Añadir notas adicionales sobre el caso..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Save className="w-5 h-5" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface StatsViewProps {
  stats: SMACStats | null;
  records: SMACRecord[];
}

function StatsView({ stats, records }: StatsViewProps) {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Resumen Económico */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Económico</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Reclamado</p>
            <p className="text-2xl font-bold text-red-600">
              {stats.total_claimed.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Pagado</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.total_paid.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Desviación Total</p>
            <p className={`text-2xl font-bold ${
              stats.total_deviation < 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.total_deviation.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.total_deviation < 0 ? 'Ahorro' : 'Sobrecosto'}
            </p>
          </div>
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Costes Totales</p>
            <p className="text-2xl font-bold text-slate-600">
              {stats.total_costs.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
        </div>
      </div>

      {/* Distribución por Estado */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Estado</h3>
        <div className="space-y-3">
          {Object.entries(stats.by_status).map(([status, count]) => {
            const percentage = (count / stats.total_cases) * 100;
            return (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{STATUS_LABELS[status as SMACStatus]}</span>
                  <span className="font-medium">{count} casos ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicadores Clave */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores Clave de Rendimiento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {stats.conciliation_rate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">Tasa de Conciliación</p>
            <p className="text-xs text-gray-500 mt-1">
              Casos resueltos en conciliación
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {stats.favorable_resolution_rate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">Resoluciones Favorables</p>
            <p className="text-xs text-gray-500 mt-1">
              Casos ganados favorablemente
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {stats.pending_trials}
            </div>
            <p className="text-sm text-gray-600">Juicios Pendientes</p>
            <p className="text-xs text-gray-500 mt-1">
              Casos en fase judicial
            </p>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-bold mb-2 ${
              stats.paid_to_claimed_ratio < 100 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.paid_to_claimed_ratio.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">Ratio Pagado/Reclamado</p>
            <p className="text-xs text-gray-500 mt-1">
              Porcentaje realmente pagado
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {stats.smac_to_workers_ratio.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">Ratio SMAC/Trabajadores</p>
            <p className="text-xs text-gray-500 mt-1">
              Casos por trabajador
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
