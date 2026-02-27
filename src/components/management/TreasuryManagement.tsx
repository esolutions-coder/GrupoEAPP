import React, { useState, useEffect } from 'react';
import {
  DollarSign, CreditCard, TrendingUp, FileText, CheckCircle, Calendar,
  Plus, Search, Filter, Download, Eye, Edit, Trash2, AlertTriangle,
  Building2, Users, Package, ArrowUpCircle, ArrowDownCircle, RefreshCw,
  Upload, X, Save, Bank, Wallet, Receipt, Activity, BarChart3
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatDate } from '../../utils/formatUtils';
import { showSuccessNotification, showErrorNotification } from '../../utils/modalUtils';
import { TreasuryDashboard } from './treasury/TreasuryDashboard';
import * as XLSX from 'xlsx';
import type {
  Bank as BankType,
  BankAccount,
  CreditLine,
  TreasuryMovement,
  TreasuryDashboardKPI,
  FactoringOperation,
  LeasingContract,
  TreasuryForecast
} from '../../types/treasury';

const TreasuryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [banks, setBanks] = useState<BankType[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [creditLines, setCreditLines] = useState<CreditLine[]>([]);
  const [movements, setMovements] = useState<TreasuryMovement[]>([]);
  const [factoring, setFactoring] = useState<FactoringOperation[]>([]);
  const [leasing, setLeasing] = useState<LeasingContract[]>([]);
  const [forecasts, setForecasts] = useState<TreasuryForecast[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [kpis, setKpis] = useState<TreasuryDashboardKPI>({
    total_balance: 0,
    available_balance: 0,
    total_credit_lines: 0,
    used_credit_lines: 0,
    available_credit: 0,
    credit_usage_percentage: 0,
    monthly_financial_cost: 0,
    active_factoring_operations: 0,
    factoring_advanced: 0,
    pending_reconciliations: 0,
    projects_with_cash_tension: 0,
    forecast_30_days: 0,
    forecast_60_days: 0,
    forecast_90_days: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);

      const [
        banksRes, accountsRes, creditLinesRes, movementsRes,
        factoringRes, leasingRes, forecastsRes, projectsRes,
        clientsRes, suppliersRes
      ] = await Promise.all([
        supabase.from('banks').select('*').order('name'),
        supabase.from('bank_accounts').select('*, banks(*)').order('account_alias'),
        supabase.from('credit_lines').select('*, banks(*), projects(*)').order('policy_number'),
        supabase.from('treasury_movements')
          .select('*, bank_accounts(*), projects(*), clients(*), suppliers(*)')
          .order('operation_date', { ascending: false })
          .limit(100),
        supabase.from('factoring_operations').select('*, banks(*), clients(*), projects(*)').order('assignment_date', { ascending: false }),
        supabase.from('leasing_contracts').select('*, projects(*)').order('contract_start_date', { ascending: false }),
        supabase.from('treasury_forecasts')
          .select('*, bank_accounts(*), projects(*), clients(*), suppliers(*)')
          .order('forecast_date'),
        supabase.from('projects').select('id, name, code').eq('status', 'active').order('name'),
        supabase.from('clients').select('id, company_name').order('company_name'),
        supabase.from('suppliers').select('id, company_name').order('company_name')
      ]);

      if (banksRes.data) setBanks(banksRes.data);
      if (accountsRes.data) setAccounts(accountsRes.data);
      if (creditLinesRes.data) setCreditLines(creditLinesRes.data);
      if (movementsRes.data) setMovements(movementsRes.data);
      if (factoringRes.data) setFactoring(factoringRes.data);
      if (leasingRes.data) setLeasing(leasingRes.data);
      if (forecastsRes.data) setForecasts(forecastsRes.data);
      if (projectsRes.data) setProjects(projectsRes.data);
      if (clientsRes.data) setClients(clientsRes.data);
      if (suppliersRes.data) setSuppliers(suppliersRes.data);

      calculateKPIs(
        accountsRes.data || [],
        creditLinesRes.data || [],
        movementsRes.data || [],
        factoringRes.data || [],
        leasingRes.data || [],
        forecastsRes.data || []
      );
    } catch (error: any) {
      showErrorNotification('Error al cargar datos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateKPIs = (
    accounts: BankAccount[],
    creditLines: CreditLine[],
    movements: TreasuryMovement[],
    factoring: FactoringOperation[],
    leasing: LeasingContract[],
    forecasts: TreasuryForecast[]
  ) => {
    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.current_balance), 0);
    const totalCreditLimit = creditLines.reduce((sum, cl) => sum + Number(cl.granted_limit), 0);
    const usedCredit = creditLines.reduce((sum, cl) => sum + Number(cl.drawn_amount), 0);
    const availableCredit = creditLines.reduce((sum, cl) => sum + Number(cl.available_amount), 0);
    const factoringAdvanced = factoring.filter(f => f.status === 'active').reduce((sum, f) => sum + Number(f.advanced_amount), 0);
    const pendingReconciliations = movements.filter(m => m.reconciliation_status === 'pending').length;

    const monthlyLeasingFees = leasing.filter(l => l.status === 'active').reduce((sum, l) => sum + Number(l.monthly_fee), 0);
    const monthlyInterest = creditLines.filter(cl => cl.status === 'active').reduce((sum, cl) => {
      const rate = cl.interest_rate || 0;
      return sum + (Number(cl.drawn_amount) * Number(rate) / 100 / 12);
    }, 0);

    const today = new Date();
    const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const in60Days = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
    const in90Days = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    const forecast30 = forecasts.filter(f => {
      const fDate = new Date(f.forecast_date);
      return fDate >= today && fDate <= in30Days && !f.is_confirmed;
    }).reduce((sum, f) => sum + Number(f.expected_amount), 0);

    const forecast60 = forecasts.filter(f => {
      const fDate = new Date(f.forecast_date);
      return fDate > in30Days && fDate <= in60Days && !f.is_confirmed;
    }).reduce((sum, f) => sum + Number(f.expected_amount), 0);

    const forecast90 = forecasts.filter(f => {
      const fDate = new Date(f.forecast_date);
      return fDate > in60Days && fDate <= in90Days && !f.is_confirmed;
    }).reduce((sum, f) => sum + Number(f.expected_amount), 0);

    setKpis({
      total_balance: totalBalance,
      available_balance: totalBalance + availableCredit,
      total_credit_lines: creditLines.length,
      used_credit_lines: creditLines.filter(cl => Number(cl.drawn_amount) > 0).length,
      available_credit: availableCredit,
      credit_usage_percentage: totalCreditLimit > 0 ? (usedCredit / totalCreditLimit * 100) : 0,
      monthly_financial_cost: monthlyLeasingFees + monthlyInterest,
      active_factoring_operations: factoring.filter(f => f.status === 'active').length,
      factoring_advanced: factoringAdvanced,
      pending_reconciliations: pendingReconciliations,
      projects_with_cash_tension: 0,
      forecast_30_days: forecast30,
      forecast_60_days: forecast60,
      forecast_90_days: forecast90
    });
  };

  const openModal = (type: string, item: any = null) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item || getEmptyFormData(type));
    setShowModal(true);
  };

  const getEmptyFormData = (type: string) => {
    switch (type) {
      case 'bank':
        return { name: '', bic_swift: '', account_manager: '', phone: '', email: '', notes: '' };
      case 'account':
        return { bank_id: '', account_alias: '', iban: '', account_type: 'operative', initial_balance: 0, initial_balance_date: new Date().toISOString().split('T')[0], status: 'active', notes: '' };
      case 'credit_line':
        return { bank_id: '', policy_number: '', granted_limit: 0, interest_rate: 0, commission_rate: 0, expiry_date: '', project_id: '', notes: '' };
      case 'leasing':
        return { financial_entity: '', contract_number: '', asset_description: '', asset_type: 'machinery', monthly_fee: 0, outstanding_capital: 0, contract_start_date: '', contract_end_date: '', project_id: '', notes: '' };
      case 'factoring':
        return { bank_id: '', invoice_number: '', client_id: '', project_id: '', operation_type: 'with_recourse', assignment_date: new Date().toISOString().split('T')[0], invoice_amount: 0, advance_percentage: 80, commission_amount: 0, interest_amount: 0, due_date: '', notes: '' };
      case 'movement':
        return { bank_account_id: '', operation_date: new Date().toISOString().split('T')[0], value_date: new Date().toISOString().split('T')[0], movement_type: 'income', amount: 0, concept: '', project_id: '', client_id: '', supplier_id: '', document_reference: '', notes: '' };
      default:
        return {};
    }
  };

  const handleSave = async () => {
    try {
      let data: any = { ...formData };
      let table = '';

      switch (modalType) {
        case 'bank':
          table = 'banks';
          data.is_active = true;
          break;
        case 'account':
          table = 'bank_accounts';
          data.initial_balance = Number(data.initial_balance);
          if (!editingItem) data.current_balance = data.initial_balance;
          break;
        case 'credit_line':
          table = 'credit_lines';
          data.granted_limit = Number(data.granted_limit);
          data.interest_rate = data.interest_rate ? Number(data.interest_rate) : null;
          data.commission_rate = data.commission_rate ? Number(data.commission_rate) : null;
          data.project_id = data.project_id || null;
          data.status = 'active';
          if (!editingItem) data.drawn_amount = 0;
          break;
        case 'leasing':
          table = 'leasing_contracts';
          data.monthly_fee = Number(data.monthly_fee);
          data.outstanding_capital = data.outstanding_capital ? Number(data.outstanding_capital) : null;
          data.project_id = data.project_id || null;
          data.status = 'active';
          break;
        case 'factoring':
          table = 'factoring_operations';
          const invoiceAmount = Number(data.invoice_amount);
          const advancePercentage = Number(data.advance_percentage);
          data.invoice_amount = invoiceAmount;
          data.advance_percentage = advancePercentage;
          data.advanced_amount = (invoiceAmount * advancePercentage) / 100;
          data.retained_amount = invoiceAmount - data.advanced_amount;
          data.commission_amount = data.commission_amount ? Number(data.commission_amount) : null;
          data.interest_amount = data.interest_amount ? Number(data.interest_amount) : null;
          data.client_id = data.client_id || null;
          data.project_id = data.project_id || null;
          data.status = 'active';
          break;
        case 'movement':
          table = 'treasury_movements';
          data.amount = Number(data.amount);
          data.project_id = data.project_id || null;
          data.client_id = data.client_id || null;
          data.supplier_id = data.supplier_id || null;
          data.reconciliation_status = 'pending';
          break;
      }

      if (editingItem) {
        const { error } = await supabase.from(table).update(data).eq('id', editingItem.id);
        if (error) throw error;
        showSuccessNotification('Registro actualizado correctamente');
      } else {
        const { error } = await supabase.from(table).insert([data]);
        if (error) throw error;
        showSuccessNotification('Registro creado correctamente');
      }

      setShowModal(false);
      setEditingItem(null);
      setFormData({});
      loadAllData();
    } catch (error: any) {
      showErrorNotification(error.message);
    }
  };

  const handleDelete = async (table: string, id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      showSuccessNotification('Registro eliminado correctamente');
      loadAllData();
    } catch (error: any) {
      showErrorNotification(error.message);
    }
  };

  const handleReconcile = async (id: string) => {
    try {
      const { error } = await supabase
        .from('treasury_movements')
        .update({
          reconciliation_status: 'reconciled',
          reconciled_at: new Date().toISOString(),
          reconciled_by: 'Admin'
        })
        .eq('id', id);

      if (error) throw error;
      showSuccessNotification('Movimiento conciliado correctamente');
      loadAllData();
    } catch (error: any) {
      showErrorNotification(error.message);
    }
  };

  const exportToExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'banks', label: 'Bancos', icon: Building2 },
    { id: 'accounts', label: 'Cuentas', icon: CreditCard },
    { id: 'credit_lines', label: 'Pólizas', icon: TrendingUp },
    { id: 'leasing', label: 'Leasing', icon: Package },
    { id: 'factoring', label: 'Factoring', icon: Receipt },
    { id: 'movements', label: 'Movimientos', icon: Activity },
    { id: 'reconciliation', label: 'Conciliación', icon: CheckCircle },
    { id: 'forecasts', label: 'Previsión', icon: Calendar }
  ];

  const filtered = {
    banks: banks.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase())),
    accounts: accounts.filter(a => a.account_alias.toLowerCase().includes(searchTerm.toLowerCase()) || a.iban.toLowerCase().includes(searchTerm.toLowerCase())),
    creditLines: creditLines.filter(cl => cl.policy_number.toLowerCase().includes(searchTerm.toLowerCase())),
    leasing: leasing.filter(l => l.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) || l.asset_description.toLowerCase().includes(searchTerm.toLowerCase())),
    factoring: factoring.filter(f => f.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())),
    movements: movements.filter(m => m.concept.toLowerCase().includes(searchTerm.toLowerCase()))
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tesorería Multibanco</h1>
          <p className="mt-2 text-gray-600">Gestión integral de liquidez y productos financieros</p>
        </div>
        <button
          onClick={loadAllData}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                className={`
                  group inline-flex items-center py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'dashboard' && (
        <TreasuryDashboard
          kpis={kpis}
          accounts={accounts}
          creditLines={creditLines}
          factoring={factoring}
          leasing={leasing}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'banks' && (
        <GenericTable
          title="Entidades Bancarias"
          data={filtered.banks}
          onAdd={() => openModal('bank')}
          onEdit={(item) => openModal('bank', item)}
          onDelete={(id) => handleDelete('banks', id)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          columns={[
            { key: 'name', label: 'Entidad', icon: Building2 },
            { key: 'bic_swift', label: 'BIC/SWIFT' },
            { key: 'account_manager', label: 'Gestor' },
            { key: 'phone', label: 'Teléfono' },
            { key: 'email', label: 'Email' },
            { key: 'is_active', label: 'Estado', type: 'status' }
          ]}
        />
      )}

      {activeTab === 'accounts' && (
        <GenericTable
          title="Cuentas Bancarias"
          data={filtered.accounts}
          onAdd={() => openModal('account')}
          onEdit={(item) => openModal('account', item)}
          onDelete={(id) => handleDelete('bank_accounts', id)}
          onExport={() => exportToExcel(accounts, 'cuentas_bancarias')}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          columns={[
            { key: 'account_alias', label: 'Alias', icon: CreditCard },
            { key: 'iban', label: 'IBAN' },
            { key: 'bank.name', label: 'Banco' },
            { key: 'account_type', label: 'Tipo' },
            { key: 'current_balance', label: 'Saldo', type: 'currency' },
            { key: 'status', label: 'Estado', type: 'status' }
          ]}
        />
      )}

      {activeTab === 'credit_lines' && (
        <GenericTable
          title="Pólizas de Crédito"
          data={filtered.creditLines}
          onAdd={() => openModal('credit_line')}
          onEdit={(item) => openModal('credit_line', item)}
          onDelete={(id) => handleDelete('credit_lines', id)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          columns={[
            { key: 'policy_number', label: 'Nº Póliza', icon: TrendingUp },
            { key: 'bank.name', label: 'Banco' },
            { key: 'granted_limit', label: 'Límite', type: 'currency' },
            { key: 'drawn_amount', label: 'Dispuesto', type: 'currency' },
            { key: 'available_amount', label: 'Disponible', type: 'currency' },
            { key: 'interest_rate', label: 'Interés %' },
            { key: 'status', label: 'Estado', type: 'status' }
          ]}
        />
      )}

      {activeTab === 'leasing' && (
        <GenericTable
          title="Contratos Leasing/Renting"
          data={filtered.leasing}
          onAdd={() => openModal('leasing')}
          onEdit={(item) => openModal('leasing', item)}
          onDelete={(id) => handleDelete('leasing_contracts', id)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          columns={[
            { key: 'contract_number', label: 'Nº Contrato', icon: Package },
            { key: 'financial_entity', label: 'Entidad' },
            { key: 'asset_description', label: 'Activo' },
            { key: 'asset_type', label: 'Tipo' },
            { key: 'monthly_fee', label: 'Cuota Mensual', type: 'currency' },
            { key: 'contract_end_date', label: 'Vencimiento', type: 'date' },
            { key: 'status', label: 'Estado', type: 'status' }
          ]}
        />
      )}

      {activeTab === 'factoring' && (
        <GenericTable
          title="Operaciones de Factoring"
          data={filtered.factoring}
          onAdd={() => openModal('factoring')}
          onEdit={(item) => openModal('factoring', item)}
          onDelete={(id) => handleDelete('factoring_operations', id)}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          columns={[
            { key: 'invoice_number', label: 'Nº Factura', icon: Receipt },
            { key: 'client.company_name', label: 'Cliente' },
            { key: 'invoice_amount', label: 'Importe', type: 'currency' },
            { key: 'advanced_amount', label: 'Anticipado', type: 'currency' },
            { key: 'operation_type', label: 'Tipo' },
            { key: 'due_date', label: 'Vencimiento', type: 'date' },
            { key: 'status', label: 'Estado', type: 'status' }
          ]}
        />
      )}

      {activeTab === 'movements' && (
        <GenericTable
          title="Movimientos de Tesorería"
          data={filtered.movements}
          onAdd={() => openModal('movement')}
          onEdit={(item) => openModal('movement', item)}
          onDelete={(id) => handleDelete('treasury_movements', id)}
          onExport={() => exportToExcel(movements, 'movimientos_tesoreria')}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          customActions={(item) => item.reconciliation_status === 'pending' && (
            <button
              onClick={() => handleReconcile(item.id)}
              className="text-green-600 hover:text-green-900 mr-2"
              title="Conciliar"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          columns={[
            { key: 'operation_date', label: 'Fecha', type: 'date', icon: Calendar },
            { key: 'bank_account.account_alias', label: 'Cuenta' },
            { key: 'movement_type', label: 'Tipo' },
            { key: 'concept', label: 'Concepto' },
            { key: 'amount', label: 'Importe', type: 'currency' },
            { key: 'reconciliation_status', label: 'Conciliación', type: 'status' }
          ]}
        />
      )}

      {activeTab === 'reconciliation' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Conciliación Bancaria</h2>
          {movements.filter(m => m.reconciliation_status === 'pending').length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">Todas las operaciones están conciliadas</p>
              <p className="text-gray-500 mt-2">No hay movimientos pendientes de conciliación</p>
            </div>
          ) : (
            <div className="space-y-3">
              {movements.filter(m => m.reconciliation_status === 'pending').map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900">{formatDate(movement.operation_date)}</span>
                      <span className="text-sm text-gray-600">{movement.concept}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {movement.bank_account?.account_alias || 'Sin cuenta'}
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <p className={`text-lg font-bold ${Number(movement.amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(movement.amount)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleReconcile(movement.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Conciliar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'forecasts' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Previsión de Tesorería</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Próximos 30 días</h3>
              <p className="text-3xl font-bold text-blue-900">{formatCurrency(kpis.forecast_30_days)}</p>
              <p className="text-sm text-blue-700 mt-2">Previsión a corto plazo</p>
            </div>
            <div className="p-6 bg-indigo-50 rounded-lg border-2 border-indigo-200">
              <h3 className="text-sm font-medium text-indigo-900 mb-2">30-60 días</h3>
              <p className="text-3xl font-bold text-indigo-900">{formatCurrency(kpis.forecast_60_days)}</p>
              <p className="text-sm text-indigo-700 mt-2">Previsión a medio plazo</p>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
              <h3 className="text-sm font-medium text-purple-900 mb-2">60-90 días</h3>
              <p className="text-3xl font-bold text-purple-900">{formatCurrency(kpis.forecast_90_days)}</p>
              <p className="text-sm text-purple-700 mt-2">Previsión a largo plazo</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Previsiones calculadas automáticamente</p>
            <p className="text-sm text-gray-500 mt-2">Basadas en certificaciones, facturas y compromisos pendientes</p>
          </div>
        </div>
      )}

      {showModal && (
        <Modal
          title={`${editingItem ? 'Editar' : 'Nuevo'} ${getModalTitle(modalType)}`}
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
            setFormData({});
          }}
          onSave={handleSave}
        >
          {renderForm(modalType, formData, setFormData, banks, accounts, projects, clients, suppliers)}
        </Modal>
      )}
    </div>
  );
};

const getModalTitle = (type: string) => {
  const titles: Record<string, string> = {
    bank: 'Banco',
    account: 'Cuenta Bancaria',
    credit_line: 'Póliza de Crédito',
    leasing: 'Contrato Leasing',
    factoring: 'Operación Factoring',
    movement: 'Movimiento'
  };
  return titles[type] || '';
};

const renderForm = (type: string, data: any, setData: (data: any) => void, banks: any[], accounts: any[], projects: any[], clients: any[], suppliers: any[]) => {
  const updateField = (field: string, value: any) => {
    setData({ ...data, [field]: value });
  };

  switch (type) {
    case 'bank':
      return (
        <div className="space-y-4">
          <input type="text" placeholder="Nombre del banco *" value={data.name || ''} onChange={(e) => updateField('name', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <input type="text" placeholder="BIC/SWIFT" value={data.bic_swift || ''} onChange={(e) => updateField('bic_swift', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <input type="text" placeholder="Gestor de cuenta" value={data.account_manager || ''} onChange={(e) => updateField('account_manager', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <input type="tel" placeholder="Teléfono" value={data.phone || ''} onChange={(e) => updateField('phone', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <input type="email" placeholder="Email" value={data.email || ''} onChange={(e) => updateField('email', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <textarea placeholder="Notas" value={data.notes || ''} onChange={(e) => updateField('notes', e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={3} />
        </div>
      );

    case 'account':
      return (
        <div className="space-y-4">
          <select value={data.bank_id || ''} onChange={(e) => updateField('bank_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required>
            <option value="">Seleccionar banco *</option>
            {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input type="text" placeholder="Alias de la cuenta *" value={data.account_alias || ''} onChange={(e) => updateField('account_alias', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <input type="text" placeholder="IBAN *" value={data.iban || ''} onChange={(e) => updateField('iban', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <select value={data.account_type || 'operative'} onChange={(e) => updateField('account_type', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
            <option value="operative">Operativa</option>
            <option value="collections">Cobros</option>
            <option value="payments">Pagos</option>
            <option value="guarantees">Garantías</option>
            <option value="payroll">Nóminas</option>
          </select>
          <input type="number" placeholder="Saldo inicial *" value={data.initial_balance || 0} onChange={(e) => updateField('initial_balance', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" required />
          <input type="date" placeholder="Fecha saldo inicial *" value={data.initial_balance_date || ''} onChange={(e) => updateField('initial_balance_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <textarea placeholder="Notas" value={data.notes || ''} onChange={(e) => updateField('notes', e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={2} />
        </div>
      );

    case 'credit_line':
      return (
        <div className="space-y-4">
          <select value={data.bank_id || ''} onChange={(e) => updateField('bank_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required>
            <option value="">Seleccionar banco *</option>
            {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input type="text" placeholder="Nº de póliza *" value={data.policy_number || ''} onChange={(e) => updateField('policy_number', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <input type="number" placeholder="Límite concedido *" value={data.granted_limit || 0} onChange={(e) => updateField('granted_limit', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" required />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Tipo de interés %" value={data.interest_rate || ''} onChange={(e) => updateField('interest_rate', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" />
            <input type="number" placeholder="Comisión %" value={data.commission_rate || ''} onChange={(e) => updateField('commission_rate', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" />
          </div>
          <input type="date" placeholder="Fecha vencimiento" value={data.expiry_date || ''} onChange={(e) => updateField('expiry_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <select value={data.project_id || ''} onChange={(e) => updateField('project_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
            <option value="">Obra asociada (opcional)</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <textarea placeholder="Notas" value={data.notes || ''} onChange={(e) => updateField('notes', e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={2} />
        </div>
      );

    case 'leasing':
      return (
        <div className="space-y-4">
          <input type="text" placeholder="Entidad financiera *" value={data.financial_entity || ''} onChange={(e) => updateField('financial_entity', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <input type="text" placeholder="Nº de contrato *" value={data.contract_number || ''} onChange={(e) => updateField('contract_number', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <input type="text" placeholder="Descripción del activo *" value={data.asset_description || ''} onChange={(e) => updateField('asset_description', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <select value={data.asset_type || 'machinery'} onChange={(e) => updateField('asset_type', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
            <option value="machinery">Maquinaria</option>
            <option value="vehicle">Vehículo</option>
            <option value="equipment">Equipo</option>
            <option value="other">Otro</option>
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Cuota mensual *" value={data.monthly_fee || 0} onChange={(e) => updateField('monthly_fee', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" required />
            <input type="number" placeholder="Capital pendiente" value={data.outstanding_capital || ''} onChange={(e) => updateField('outstanding_capital', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" placeholder="Fecha inicio *" value={data.contract_start_date || ''} onChange={(e) => updateField('contract_start_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
            <input type="date" placeholder="Fecha fin *" value={data.contract_end_date || ''} onChange={(e) => updateField('contract_end_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <select value={data.project_id || ''} onChange={(e) => updateField('project_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
            <option value="">Obra asociada (opcional)</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <textarea placeholder="Notas" value={data.notes || ''} onChange={(e) => updateField('notes', e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={2} />
        </div>
      );

    case 'factoring':
      return (
        <div className="space-y-4">
          <select value={data.bank_id || ''} onChange={(e) => updateField('bank_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required>
            <option value="">Seleccionar banco *</option>
            {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input type="text" placeholder="Nº de factura *" value={data.invoice_number || ''} onChange={(e) => updateField('invoice_number', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <select value={data.client_id || ''} onChange={(e) => updateField('client_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
            <option value="">Cliente (opcional)</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
          <select value={data.project_id || ''} onChange={(e) => updateField('project_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
            <option value="">Obra (opcional)</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={data.operation_type || 'with_recourse'} onChange={(e) => updateField('operation_type', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
            <option value="with_recourse">Con recurso</option>
            <option value="without_recourse">Sin recurso</option>
            <option value="confirming">Confirming</option>
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" placeholder="Fecha cesión *" value={data.assignment_date || ''} onChange={(e) => updateField('assignment_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
            <input type="date" placeholder="Fecha vencimiento *" value={data.due_date || ''} onChange={(e) => updateField('due_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Importe factura *" value={data.invoice_amount || 0} onChange={(e) => updateField('invoice_amount', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" required />
            <input type="number" placeholder="% Anticipo *" value={data.advance_percentage || 80} onChange={(e) => updateField('advance_percentage', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" min="0" max="100" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Comisión" value={data.commission_amount || ''} onChange={(e) => updateField('commission_amount', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" />
            <input type="number" placeholder="Intereses" value={data.interest_amount || ''} onChange={(e) => updateField('interest_amount', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" />
          </div>
          <textarea placeholder="Notas" value={data.notes || ''} onChange={(e) => updateField('notes', e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={2} />
        </div>
      );

    case 'movement':
      return (
        <div className="space-y-4">
          <select value={data.bank_account_id || ''} onChange={(e) => updateField('bank_account_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required>
            <option value="">Seleccionar cuenta *</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.account_alias} - {a.iban}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" placeholder="Fecha operación *" value={data.operation_date || ''} onChange={(e) => updateField('operation_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
            <input type="date" placeholder="Fecha valor *" value={data.value_date || ''} onChange={(e) => updateField('value_date', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <select value={data.movement_type || 'income'} onChange={(e) => updateField('movement_type', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
            <option value="income">Ingreso</option>
            <option value="payment">Pago</option>
            <option value="credit_line_draw">Disposición póliza</option>
            <option value="credit_line_repayment">Amortización póliza</option>
            <option value="factoring_advance">Anticipo factoring</option>
            <option value="factoring_settlement">Liquidación factoring</option>
            <option value="leasing_fee">Cuota leasing</option>
            <option value="bank_fee">Comisión bancaria</option>
            <option value="interest">Intereses</option>
            <option value="transfer">Transferencia</option>
            <option value="other">Otro</option>
          </select>
          <input type="number" placeholder="Importe *" value={data.amount || 0} onChange={(e) => updateField('amount', e.target.value)} className="w-full px-4 py-2 border rounded-lg" step="0.01" required />
          <input type="text" placeholder="Concepto *" value={data.concept || ''} onChange={(e) => updateField('concept', e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <select value={data.project_id || ''} onChange={(e) => updateField('project_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
            <option value="">Obra (opcional)</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={data.client_id || ''} onChange={(e) => updateField('client_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
            <option value="">Cliente (opcional)</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
          <select value={data.supplier_id || ''} onChange={(e) => updateField('supplier_id', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
            <option value="">Proveedor (opcional)</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.company_name}</option>)}
          </select>
          <input type="text" placeholder="Referencia documento" value={data.document_reference || ''} onChange={(e) => updateField('document_reference', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <textarea placeholder="Notas" value={data.notes || ''} onChange={(e) => updateField('notes', e.target.value)} className="w-full px-4 py-2 border rounded-lg" rows={2} />
        </div>
      );

    default:
      return null;
  }
};

const GenericTable: React.FC<any> = ({ title, data, onAdd, onEdit, onDelete, onExport, searchTerm, setSearchTerm, columns, customActions }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <div className="flex space-x-2">
          {onExport && (
            <button onClick={onExport} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="w-5 h-5 mr-2" />
              Exportar
            </button>
          )}
          <button onClick={onAdd} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Nuevo
          </button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col: any, idx: number) => (
              <th key={idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                No hay registros disponibles
              </td>
            </tr>
          ) : (
            data.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {columns.map((col: any, idx: number) => {
                  const value = col.key.split('.').reduce((obj: any, key: string) => obj?.[key], item);
                  return (
                    <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm">
                      {col.icon && <div className="flex items-center"><col.icon className="w-4 h-4 text-gray-400 mr-2" /><span className="font-medium text-gray-900">{value || '-'}</span></div>}
                      {!col.icon && col.type === 'currency' && <span className={`font-bold ${Number(value) >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(value || 0)}</span>}
                      {!col.icon && col.type === 'date' && <span className="text-gray-900">{value ? formatDate(value) : '-'}</span>}
                      {!col.icon && col.type === 'status' && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          value === 'active' || value === 'reconciled' || value === true ? 'bg-green-100 text-green-800' :
                          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {value === true ? 'Activo' : value === false ? 'Inactivo' : value}
                        </span>
                      )}
                      {!col.icon && !col.type && <span className="text-gray-900">{value || '-'}</span>}
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {customActions && customActions(item)}
                  <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900 mr-3">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const Modal: React.FC<any> = ({ title, onClose, onSave, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="p-6">
        {children}
      </div>
      <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white">
        <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          Cancelar
        </button>
        <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
          <Save className="w-5 h-5 mr-2" />
          Guardar
        </button>
      </div>
    </div>
  </div>
);

export default TreasuryManagement;
