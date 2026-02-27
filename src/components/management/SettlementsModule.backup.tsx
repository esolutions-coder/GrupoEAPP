import React, { useState, useEffect } from 'react';
import {
  DollarSign, Plus, Search, Filter, Edit, Trash2, Eye, Download, FileText,
  Calculator, CheckCircle, X, Calendar, User, Building2, Clock, AlertCircle,
  TrendingUp, Minus, Save, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  PayrollSettlement,
  SettlementWithDetails,
  SettlementFormData,
  SettlementSummary,
  HourType,
  IncidentType,
  DeductionType,
  IncomeType
} from '../../types/settlements';
import { Worker } from '../../types/construction';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';

const SettlementsModule: React.FC = () => {
  const [activeView, setActiveView] = useState<'list' | 'form' | 'detail'>('list');
  const [settlements, setSettlements] = useState<SettlementWithDetails[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [summary, setSummary] = useState<SettlementSummary>({
    total_settlements: 0,
    total_gross_amount: 0,
    total_deductions: 0,
    total_net_amount: 0,
    settlements_by_status: { draft: 0, calculated: 0, approved: 0, paid: 0 }
  });

  const [formData, setFormData] = useState<SettlementFormData>({
    settlement_code: '',
    worker_id: '',
    project_id: '',
    period_month: new Date().getMonth() + 1,
    period_year: new Date().getFullYear(),
    base_salary: 0,
    notes: '',
    hours: [],
    incidents: [],
    deductions: [],
    additional_income: []
  });

  useEffect(() => {
    loadData();
  }, [filterMonth, filterYear, filterStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadSettlements(),
        loadWorkers(),
        loadProjects()
      ]);
    } catch (error: any) {
      showNotification('Error al cargar datos: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettlements = async () => {
    let query = supabase
      .from('payroll_settlements')
      .select('*')
      .eq('period_month', filterMonth)
      .eq('period_year', filterYear);

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    const settlementsWithDetails: SettlementWithDetails[] = await Promise.all(
      (data || []).map(async (settlement) => {
        const [hoursRes, incidentsRes, deductionsRes, incomeRes] = await Promise.all([
          supabase.from('settlement_hours').select('*').eq('settlement_id', settlement.id),
          supabase.from('settlement_incidents').select('*').eq('settlement_id', settlement.id),
          supabase.from('settlement_deductions').select('*').eq('settlement_id', settlement.id),
          supabase.from('settlement_additional_income').select('*').eq('settlement_id', settlement.id)
        ]);

        const worker = workers.find(w => w.id === settlement.worker_id);
        const project = projects.find(p => p.id === settlement.project_id);

        return {
          ...settlement,
          worker_name: worker?.name || 'N/A',
          project_name: project?.name || 'General',
          hours: hoursRes.data || [],
          incidents: incidentsRes.data || [],
          deductions: deductionsRes.data || [],
          additional_income: incomeRes.data || []
        };
      })
    );

    setSettlements(settlementsWithDetails);
    calculateSummary(settlementsWithDetails);
  };

  const loadWorkers = async () => {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('status', 'active')
      .order('first_name');

    if (error) throw error;

    const transformedWorkers: Worker[] = (data || []).map((w: any) => ({
      id: w.id,
      workerCode: w.worker_code,
      name: `${w.first_name} ${w.last_name}`,
      personalData: {
        firstName: w.first_name,
        lastName: w.last_name,
        dni: w.dni,
        dniExpiryDate: w.dni_expiry_date,
        address: w.address || '',
        city: w.city || '',
        postalCode: w.postal_code || '',
        phone: w.phone || '',
        email: w.email || '',
        emergencyContact: w.emergency_contact || '',
        emergencyPhone: w.emergency_phone || '',
        hasDriverLicense: w.has_driver_license,
        hasOwnVehicle: w.has_own_vehicle
      },
      professionalData: {
        category: w.category,
        prlType: w.prl_type || '',
        prlTraining: [],
        prlExpiryDate: w.prl_expiry_date || '',
        medicalCheckDate: w.medical_check_date || '',
        medicalCheckExpiry: w.medical_check_expiry || '',
        epiDeliveryDate: w.epi_delivery_date || ''
      },
      contractData: {
        contractType: w.contract_type,
        hourlyRate: w.hourly_rate || 0,
        overtimeRate: w.overtime_rate || 0,
        hireDate: w.hire_date || '',
        vacationTotalDays: w.vacation_total_days || 30,
        vacationUsedDays: w.vacation_used_days || 0,
        vacationPendingDays: w.vacation_pending_days || 0,
        contractSigned: w.contract_signed || false,
        bankAccount: w.bank_account || '',
        digitalAccessUsername: w.digital_access_username || '',
        digitalAccessPassword: w.digital_access_password || ''
      },
      status: w.status,
      category: w.category
    }));

    setWorkers(transformedWorkers);
  };

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, code')
      .eq('status', 'active')
      .order('name');

    if (error) throw error;
    setProjects(data || []);
  };

  const calculateSummary = (settlementsData: SettlementWithDetails[]) => {
    const summaryData: SettlementSummary = {
      total_settlements: settlementsData.length,
      total_gross_amount: settlementsData.reduce((sum, s) => sum + Number(s.gross_amount), 0),
      total_deductions: settlementsData.reduce((sum, s) => sum + Number(s.total_deductions), 0),
      total_net_amount: settlementsData.reduce((sum, s) => sum + Number(s.net_amount), 0),
      settlements_by_status: {
        draft: settlementsData.filter(s => s.status === 'draft').length,
        calculated: settlementsData.filter(s => s.status === 'calculated').length,
        approved: settlementsData.filter(s => s.status === 'approved').length,
        paid: settlementsData.filter(s => s.status === 'paid').length
      }
    };
    setSummary(summaryData);
  };

  const handleCreate = () => {
    const nextCode = `LIQ-${filterYear}-${String(filterMonth).padStart(2, '0')}-${String(settlements.length + 1).padStart(3, '0')}`;
    setFormData({
      settlement_code: nextCode,
      worker_id: '',
      project_id: '',
      period_month: filterMonth,
      period_year: filterYear,
      base_salary: 0,
      notes: '',
      hours: [],
      incidents: [],
      deductions: [],
      additional_income: []
    });
    setSelectedSettlement(null);
    setActiveView('form');
  };

  const handleEdit = (settlement: SettlementWithDetails) => {
    setSelectedSettlement(settlement);
    setFormData({
      settlement_code: settlement.settlement_code,
      worker_id: settlement.worker_id,
      project_id: settlement.project_id || '',
      period_month: settlement.period_month,
      period_year: settlement.period_year,
      base_salary: settlement.base_salary,
      notes: settlement.notes || '',
      hours: settlement.hours.map(h => ({
        hour_type: h.hour_type,
        hours: h.hours,
        rate: h.rate,
        description: h.description
      })),
      incidents: settlement.incidents.map(i => ({
        incident_type: i.incident_type,
        incident_date: i.incident_date,
        days: i.days,
        hours: i.hours,
        affects_payment: i.affects_payment,
        discount_amount: i.discount_amount,
        description: i.description
      })),
      deductions: settlement.deductions.map(d => ({
        deduction_type: d.deduction_type,
        amount: d.amount,
        percentage: d.percentage,
        description: d.description,
        reference: d.reference
      })),
      additional_income: settlement.additional_income.map(ai => ({
        income_type: ai.income_type,
        amount: ai.amount,
        description: ai.description
      }))
    });
    setActiveView('form');
  };

  const handleView = (settlement: SettlementWithDetails) => {
    setSelectedSettlement(settlement);
    setActiveView('detail');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta liquidación?')) return;

    try {
      const { error } = await supabase
        .from('payroll_settlements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showNotification('Liquidación eliminada correctamente', 'success');
      loadSettlements();
    } catch (error: any) {
      showNotification('Error al eliminar: ' + error.message, 'error');
    }
  };

  const calculateTotals = () => {
    const hoursTotal = formData.hours.reduce((sum, h) => sum + (h.hours * h.rate), 0);
    const incidentsDiscount = formData.incidents.reduce((sum, i) =>
      sum + (i.affects_payment ? i.discount_amount : 0), 0);
    const deductionsTotal = formData.deductions.reduce((sum, d) => sum + d.amount, 0);
    const additionalIncomeTotal = formData.additional_income.reduce((sum, ai) => sum + ai.amount, 0);

    const grossAmount = formData.base_salary + hoursTotal + additionalIncomeTotal;
    const netAmount = grossAmount - incidentsDiscount - deductionsTotal;

    return {
      hoursTotal,
      incidentsDiscount,
      deductionsTotal,
      additionalIncomeTotal,
      grossAmount,
      netAmount
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.worker_id) {
      showNotification('Seleccione un operario', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const totals = calculateTotals();
      const totalHours = formData.hours.reduce((sum, h) => sum + h.hours, 0);

      const settlementData = {
        settlement_code: formData.settlement_code,
        worker_id: formData.worker_id,
        project_id: formData.project_id || null,
        period_month: formData.period_month,
        period_year: formData.period_year,
        base_salary: formData.base_salary,
        total_hours_worked: totalHours,
        gross_amount: totals.grossAmount,
        total_deductions: totals.deductionsTotal + totals.incidentsDiscount,
        total_additional_income: totals.additionalIncomeTotal,
        net_amount: totals.netAmount,
        status: 'calculated',
        notes: formData.notes,
        created_by: 'Admin'
      };

      let settlementId: string;

      if (selectedSettlement) {
        const { error: updateError } = await supabase
          .from('payroll_settlements')
          .update(settlementData)
          .eq('id', selectedSettlement.id);

        if (updateError) throw updateError;

        await supabase.from('settlement_hours').delete().eq('settlement_id', selectedSettlement.id);
        await supabase.from('settlement_incidents').delete().eq('settlement_id', selectedSettlement.id);
        await supabase.from('settlement_deductions').delete().eq('settlement_id', selectedSettlement.id);
        await supabase.from('settlement_additional_income').delete().eq('settlement_id', selectedSettlement.id);

        settlementId = selectedSettlement.id;
      } else {
        const { data: newSettlement, error: insertError } = await supabase
          .from('payroll_settlements')
          .insert(settlementData)
          .select()
          .single();

        if (insertError) throw insertError;
        settlementId = newSettlement.id;
      }

      if (formData.hours.length > 0) {
        const hoursData = formData.hours.map(h => ({
          settlement_id: settlementId,
          hour_type: h.hour_type,
          hours: h.hours,
          rate: h.rate,
          description: h.description
        }));
        await supabase.from('settlement_hours').insert(hoursData);
      }

      if (formData.incidents.length > 0) {
        const incidentsData = formData.incidents.map(i => ({
          settlement_id: settlementId,
          incident_type: i.incident_type,
          incident_date: i.incident_date,
          days: i.days,
          hours: i.hours,
          affects_payment: i.affects_payment,
          discount_amount: i.discount_amount,
          description: i.description
        }));
        await supabase.from('settlement_incidents').insert(incidentsData);
      }

      if (formData.deductions.length > 0) {
        const deductionsData = formData.deductions.map(d => ({
          settlement_id: settlementId,
          deduction_type: d.deduction_type,
          amount: d.amount,
          percentage: d.percentage,
          description: d.description,
          reference: d.reference
        }));
        await supabase.from('settlement_deductions').insert(deductionsData);
      }

      if (formData.additional_income.length > 0) {
        const incomeData = formData.additional_income.map(ai => ({
          settlement_id: settlementId,
          income_type: ai.income_type,
          amount: ai.amount,
          description: ai.description
        }));
        await supabase.from('settlement_additional_income').insert(incomeData);
      }

      showNotification(
        selectedSettlement ? 'Liquidación actualizada correctamente' : 'Liquidación creada correctamente',
        'success'
      );
      setActiveView('list');
      loadSettlements();
    } catch (error: any) {
      showNotification('Error: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const addHourRow = () => {
    setFormData({
      ...formData,
      hours: [...formData.hours, { hour_type: 'normal', hours: 0, rate: 0, description: '' }]
    });
  };

  const removeHourRow = (index: number) => {
    setFormData({
      ...formData,
      hours: formData.hours.filter((_, i) => i !== index)
    });
  };

  const addIncidentRow = () => {
    setFormData({
      ...formData,
      incidents: [...formData.incidents, {
        incident_type: 'absence',
        incident_date: new Date().toISOString().split('T')[0],
        days: 0,
        hours: 0,
        affects_payment: false,
        discount_amount: 0,
        description: ''
      }]
    });
  };

  const removeIncidentRow = (index: number) => {
    setFormData({
      ...formData,
      incidents: formData.incidents.filter((_, i) => i !== index)
    });
  };

  const addDeductionRow = () => {
    setFormData({
      ...formData,
      deductions: [...formData.deductions, {
        deduction_type: 'irpf',
        amount: 0,
        percentage: 0,
        description: '',
        reference: ''
      }]
    });
  };

  const removeDeductionRow = (index: number) => {
    setFormData({
      ...formData,
      deductions: formData.deductions.filter((_, i) => i !== index)
    });
  };

  const addIncomeRow = () => {
    setFormData({
      ...formData,
      additional_income: [...formData.additional_income, {
        income_type: 'per_diem',
        amount: 0,
        description: ''
      }]
    });
  };

  const removeIncomeRow = (index: number) => {
    setFormData({
      ...formData,
      additional_income: formData.additional_income.filter((_, i) => i !== index)
    });
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payroll_settlements')
        .update({
          status: 'approved',
          approved_by: 'Admin',
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      showNotification('Liquidación aprobada correctamente', 'success');
      loadSettlements();
    } catch (error: any) {
      showNotification('Error al aprobar: ' + error.message, 'error');
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payroll_settlements')
        .update({
          status: 'paid',
          payment_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) throw error;

      showNotification('Liquidación marcada como pagada', 'success');
      loadSettlements();
    } catch (error: any) {
      showNotification('Error al actualizar: ' + error.message, 'error');
    }
  };

  const handleExportPDF = async () => {
    const exportData = settlements.map(s => ({
      'Código': s.settlement_code,
      'Operario': s.worker_name,
      'Período': `${s.period_month}/${s.period_year}`,
      'Base': `€${s.base_salary.toFixed(2)}`,
      'Bruto': `€${s.gross_amount.toFixed(2)}`,
      'Deducciones': `€${s.total_deductions.toFixed(2)}`,
      'Neto': `€${s.net_amount.toFixed(2)}`,
      'Estado': s.status
    }));

    const pdfData = {
      title: `Liquidaciones ${filterMonth}/${filterYear}`,
      headers: ['Código', 'Operario', 'Período', 'Base', 'Bruto', 'Deducciones', 'Neto', 'Estado'],
      data: exportData,
      filename: `liquidaciones_${filterYear}_${filterMonth}`
    };

    exportToPDF(pdfData);
  };

  const handleExportExcel = () => {
    const exportData = settlements.map(s => ({
      'Código': s.settlement_code,
      'Operario': s.worker_name,
      'Proyecto': s.project_name,
      'Período': `${s.period_month}/${s.period_year}`,
      'Salario Base': s.base_salary,
      'Horas Trabajadas': s.total_hours_worked,
      'Bruto': s.gross_amount,
      'Deducciones': s.total_deductions,
      'Ingresos Adicionales': s.total_additional_income,
      'Neto': s.net_amount,
      'Estado': s.status,
      'Fecha Pago': s.payment_date || 'N/A'
    }));

    const excelData = {
      title: `Liquidaciones ${filterMonth}/${filterYear}`,
      headers: ['Código', 'Operario', 'Proyecto', 'Período', 'Salario Base', 'Horas Trabajadas', 'Bruto', 'Deducciones', 'Ingresos Adicionales', 'Neto', 'Estado', 'Fecha Pago'],
      data: exportData,
      filename: `liquidaciones_${filterYear}_${filterMonth}`
    };

    exportToExcel(excelData);
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      calculated: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      paid: 'bg-purple-100 text-purple-800'
    };
    const labels = {
      draft: 'Borrador',
      calculated: 'Calculado',
      approved: 'Aprobado',
      paid: 'Pagado'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredSettlements = settlements.filter(s =>
    s.worker_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.settlement_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totals = calculateTotals();

  if (activeView === 'detail' && selectedSettlement) {
    return (
      <div className="space-y-6">
        {notification.show && (
          <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {notification.message}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Detalle de Liquidación</h3>
            <p className="text-gray-600">{selectedSettlement.settlement_code}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveView('list')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operario</label>
              <p className="text-lg font-semibold">{selectedSettlement.worker_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
              <p className="text-lg font-semibold">{selectedSettlement.period_month}/{selectedSettlement.period_year}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              {getStatusBadge(selectedSettlement.status)}
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Horas Trabajadas</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tipo</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Horas</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tarifa</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedSettlement.hours.map(hour => (
                    <tr key={hour.id}>
                      <td className="px-4 py-2 text-sm">{hour.hour_type}</td>
                      <td className="px-4 py-2 text-sm">{hour.hours}</td>
                      <td className="px-4 py-2 text-sm">€{hour.rate.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm font-semibold">€{hour.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedSettlement.incidents.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Incidencias</h4>
              <div className="space-y-2">
                {selectedSettlement.incidents.map(incident => (
                  <div key={incident.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{incident.incident_type}</p>
                      <p className="text-sm text-gray-600">{incident.description}</p>
                    </div>
                    {incident.affects_payment && (
                      <p className="text-red-600 font-semibold">-€{incident.discount_amount.toFixed(2)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedSettlement.deductions.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Descuentos</h4>
              <div className="space-y-2">
                {selectedSettlement.deductions.map(deduction => (
                  <div key={deduction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{deduction.deduction_type}</p>
                      <p className="text-sm text-gray-600">{deduction.description}</p>
                    </div>
                    <p className="text-red-600 font-semibold">-€{deduction.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedSettlement.additional_income.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Ingresos Adicionales</h4>
              <div className="space-y-2">
                {selectedSettlement.additional_income.map(income => (
                  <div key={income.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{income.income_type}</p>
                      <p className="text-sm text-gray-600">{income.description}</p>
                    </div>
                    <p className="text-green-600 font-semibold">+€{income.amount.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Salario Base:</p>
                <p className="text-sm text-gray-600">Total Horas:</p>
                <p className="text-sm text-gray-600">Ingresos Adicionales:</p>
                <p className="text-lg font-bold text-gray-900 mt-2">Bruto Total:</p>
                <p className="text-sm text-red-600 mt-2">Total Descuentos:</p>
                <p className="text-2xl font-bold text-green-600 mt-4">Neto a Pagar:</p>
              </div>
              <div>
                <p className="text-sm">€{selectedSettlement.base_salary.toFixed(2)}</p>
                <p className="text-sm">€{selectedSettlement.hours.reduce((sum, h) => sum + h.amount, 0).toFixed(2)}</p>
                <p className="text-sm">€{selectedSettlement.total_additional_income.toFixed(2)}</p>
                <p className="text-lg font-bold mt-2">€{selectedSettlement.gross_amount.toFixed(2)}</p>
                <p className="text-sm text-red-600 mt-2">-€{selectedSettlement.total_deductions.toFixed(2)}</p>
                <p className="text-2xl font-bold text-green-600 mt-4">€{selectedSettlement.net_amount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            {selectedSettlement.status === 'calculated' && (
              <button
                onClick={() => handleApprove(selectedSettlement.id)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="w-5 h-5" />
                Aprobar Liquidación
              </button>
            )}
            {selectedSettlement.status === 'approved' && (
              <button
                onClick={() => handleMarkAsPaid(selectedSettlement.id)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <DollarSign className="w-5 h-5" />
                Marcar como Pagado
              </button>
            )}
            <button
              onClick={() => handleEdit(selectedSettlement)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-5 h-5" />
              Editar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'form') {
    return (
      <div className="space-y-6">
        {notification.show && (
          <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}>
            {notification.message}
          </div>
        )}

        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">
            {selectedSettlement ? 'Editar Liquidación' : 'Nueva Liquidación'}
          </h3>
          <button
            onClick={() => setActiveView('list')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h4 className="text-lg font-bold text-gray-900">Información General</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código</label>
                <input
                  type="text"
                  value={formData.settlement_code}
                  onChange={(e) => setFormData({ ...formData, settlement_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Operario *</label>
                <select
                  value={formData.worker_id}
                  onChange={(e) => {
                    const worker = workers.find(w => w.id === e.target.value);
                    setFormData({
                      ...formData,
                      worker_id: e.target.value,
                      base_salary: worker?.contractData.hourlyRate ? worker.contractData.hourlyRate * 160 : 0
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccione operario</option>
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.id}>{worker.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proyecto</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">General</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.period_month}
                  onChange={(e) => setFormData({ ...formData, period_month: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                <input
                  type="number"
                  min="2020"
                  value={formData.period_year}
                  onChange={(e) => setFormData({ ...formData, period_year: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salario Base</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.base_salary}
                  onChange={(e) => setFormData({ ...formData, base_salary: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-900">Horas Trabajadas</h4>
              <button
                type="button"
                onClick={addHourRow}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Añadir
              </button>
            </div>

            <div className="space-y-3">
              {formData.hours.map((hour, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg">
                  <select
                    value={hour.hour_type}
                    onChange={(e) => {
                      const newHours = [...formData.hours];
                      newHours[index].hour_type = e.target.value as HourType;
                      setFormData({ ...formData, hours: newHours });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="normal">Normales</option>
                    <option value="overtime">Extra</option>
                    <option value="night">Nocturnas</option>
                    <option value="holiday">Festivas</option>
                  </select>

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Horas"
                    value={hour.hours}
                    onChange={(e) => {
                      const newHours = [...formData.hours];
                      newHours[index].hours = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, hours: newHours });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Tarifa/h"
                    value={hour.rate}
                    onChange={(e) => {
                      const newHours = [...formData.hours];
                      newHours[index].rate = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, hours: newHours });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <input
                    type="text"
                    placeholder="Descripción"
                    value={hour.description}
                    onChange={(e) => {
                      const newHours = [...formData.hours];
                      newHours[index].description = e.target.value;
                      setFormData({ ...formData, hours: newHours });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={() => removeHourRow(index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-900">Incidencias</h4>
              <button
                type="button"
                onClick={addIncidentRow}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Añadir
              </button>
            </div>

            <div className="space-y-3">
              {formData.incidents.map((incident, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-3 p-3 bg-gray-50 rounded-lg">
                  <select
                    value={incident.incident_type}
                    onChange={(e) => {
                      const newIncidents = [...formData.incidents];
                      newIncidents[index].incident_type = e.target.value as IncidentType;
                      setFormData({ ...formData, incidents: newIncidents });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="absence">Ausencia</option>
                    <option value="permission">Permiso</option>
                    <option value="sick_leave">Baja</option>
                    <option value="vacation">Vacaciones</option>
                  </select>

                  <input
                    type="date"
                    value={incident.incident_date}
                    onChange={(e) => {
                      const newIncidents = [...formData.incidents];
                      newIncidents[index].incident_date = e.target.value;
                      setFormData({ ...formData, incidents: newIncidents });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Días"
                    value={incident.days}
                    onChange={(e) => {
                      const newIncidents = [...formData.incidents];
                      newIncidents[index].days = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, incidents: newIncidents });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={incident.affects_payment}
                      onChange={(e) => {
                        const newIncidents = [...formData.incidents];
                        newIncidents[index].affects_payment = e.target.checked;
                        setFormData({ ...formData, incidents: newIncidents });
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Afecta pago</span>
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Descuento"
                    value={incident.discount_amount}
                    onChange={(e) => {
                      const newIncidents = [...formData.incidents];
                      newIncidents[index].discount_amount = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, incidents: newIncidents });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={!incident.affects_payment}
                  />

                  <input
                    type="text"
                    placeholder="Descripción"
                    value={incident.description}
                    onChange={(e) => {
                      const newIncidents = [...formData.incidents];
                      newIncidents[index].description = e.target.value;
                      setFormData({ ...formData, incidents: newIncidents });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={() => removeIncidentRow(index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-900">Descuentos</h4>
              <button
                type="button"
                onClick={addDeductionRow}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Añadir
              </button>
            </div>

            <div className="space-y-3">
              {formData.deductions.map((deduction, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 bg-gray-50 rounded-lg">
                  <select
                    value={deduction.deduction_type}
                    onChange={(e) => {
                      const newDeductions = [...formData.deductions];
                      newDeductions[index].deduction_type = e.target.value as DeductionType;
                      setFormData({ ...formData, deductions: newDeductions });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="irpf">IRPF</option>
                    <option value="garnishment">Embargo</option>
                    <option value="sanction">Sanción</option>
                    <option value="advance">Anticipo</option>
                    <option value="social_security">Seg. Social</option>
                    <option value="other">Otro</option>
                  </select>

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Importe"
                    value={deduction.amount}
                    onChange={(e) => {
                      const newDeductions = [...formData.deductions];
                      newDeductions[index].amount = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, deductions: newDeductions });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <input
                    type="number"
                    step="0.01"
                    placeholder="%"
                    value={deduction.percentage}
                    onChange={(e) => {
                      const newDeductions = [...formData.deductions];
                      newDeductions[index].percentage = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, deductions: newDeductions });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <input
                    type="text"
                    placeholder="Descripción"
                    value={deduction.description}
                    onChange={(e) => {
                      const newDeductions = [...formData.deductions];
                      newDeductions[index].description = e.target.value;
                      setFormData({ ...formData, deductions: newDeductions });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <input
                    type="text"
                    placeholder="Referencia"
                    value={deduction.reference}
                    onChange={(e) => {
                      const newDeductions = [...formData.deductions];
                      newDeductions[index].reference = e.target.value;
                      setFormData({ ...formData, deductions: newDeductions });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={() => removeDeductionRow(index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-900">Ingresos Adicionales</h4>
              <button
                type="button"
                onClick={addIncomeRow}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Añadir
              </button>
            </div>

            <div className="space-y-3">
              {formData.additional_income.map((income, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                  <select
                    value={income.income_type}
                    onChange={(e) => {
                      const newIncome = [...formData.additional_income];
                      newIncome[index].income_type = e.target.value as IncomeType;
                      setFormData({ ...formData, additional_income: newIncome });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="per_diem">Dieta</option>
                    <option value="bonus">Bonificación</option>
                    <option value="award">Premio</option>
                    <option value="transportation">Transporte</option>
                    <option value="other">Otro</option>
                  </select>

                  <input
                    type="number"
                    step="0.01"
                    placeholder="Importe"
                    value={income.amount}
                    onChange={(e) => {
                      const newIncome = [...formData.additional_income];
                      newIncome[index].amount = parseFloat(e.target.value) || 0;
                      setFormData({ ...formData, additional_income: newIncome });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <input
                    type="text"
                    placeholder="Descripción"
                    value={income.description}
                    onChange={(e) => {
                      const newIncome = [...formData.additional_income];
                      newIncome[index].description = e.target.value;
                      setFormData({ ...formData, additional_income: newIncome });
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={() => removeIncomeRow(index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Resumen de Liquidación</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-right font-medium">
                <p>Salario Base:</p>
                <p>Total Horas:</p>
                <p>Ingresos Adicionales:</p>
                <p className="text-lg mt-2">Bruto Total:</p>
                <p className="text-red-600 mt-2">Descuentos:</p>
                <p className="text-red-600">Incidencias:</p>
                <p className="text-2xl font-bold text-green-600 mt-4">Neto a Pagar:</p>
              </div>
              <div>
                <p>€{formData.base_salary.toFixed(2)}</p>
                <p>€{totals.hoursTotal.toFixed(2)}</p>
                <p>€{totals.additionalIncomeTotal.toFixed(2)}</p>
                <p className="text-lg mt-2">€{totals.grossAmount.toFixed(2)}</p>
                <p className="text-red-600 mt-2">-€{totals.deductionsTotal.toFixed(2)}</p>
                <p className="text-red-600">-€{totals.incidentsDiscount.toFixed(2)}</p>
                <p className="text-2xl font-bold text-green-600 mt-4">€{totals.netAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => setActiveView('list')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isLoading ? 'Guardando...' : 'Guardar Liquidación'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Liquidaciones</h2>
          <p className="text-gray-600">Gestión de nóminas y liquidaciones mensuales</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-5 h-5" />
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <FileText className="w-5 h-5" />
            Excel
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Nueva Liquidación
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Liquidaciones</p>
              <p className="text-2xl font-bold text-gray-900">{summary.total_settlements}</p>
            </div>
            <Calculator className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bruto Total</p>
              <p className="text-2xl font-bold text-gray-900">€{summary.total_gross_amount.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Descuentos</p>
              <p className="text-2xl font-bold text-red-600">€{summary.total_deductions.toFixed(2)}</p>
            </div>
            <Minus className="w-12 h-12 text-red-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Neto Total</p>
              <p className="text-2xl font-bold text-green-600">€{summary.total_net_amount.toFixed(2)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>
                {new Date(2024, month - 1).toLocaleString('es', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="calculated">Calculado</option>
            <option value="approved">Aprobado</option>
            <option value="paid">Pagado</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando liquidaciones...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bruto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuentos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Neto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSettlements.map(settlement => (
                  <tr key={settlement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {settlement.settlement_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {settlement.worker_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {settlement.period_month}/{settlement.period_year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      €{settlement.gross_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                      -€{settlement.total_deductions.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      €{settlement.net_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(settlement.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(settlement)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(settlement)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(settlement.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSettlements.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No se encontraron liquidaciones</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SettlementsModule;
