import React, { useState, useEffect } from 'react';
import {
  DollarSign, CreditCard, TrendingUp, FileText, Download, Plus,
  Search, Filter, Calendar, Landmark, Wallet, ArrowUpCircle, ArrowDownCircle,
  Activity, BarChart3, Eye, Edit, RefreshCw, AlertCircle, CheckCircle,
  Building2, Users, Package
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatDate } from '../../utils/formatUtils';
import { showSuccessNotification, showErrorNotification } from '../../utils/modalUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface BankPoolSummary {
  total_balance: number;
  total_accounts: number;
  total_movements: number;
  income_total: number;
  expense_total: number;
  net_flow: number;
  accounts: AccountBalance[];
}

interface AccountBalance {
  account_id: string;
  account_alias: string;
  bank_name: string;
  iban: string;
  current_balance: number;
  movements_count: number;
  income: number;
  expenses: number;
}

interface MonthlyMovement {
  id: string;
  operation_date: string;
  value_date: string;
  concept: string;
  amount: number;
  movement_type: string;
  account_alias: string;
  bank_name: string;
  project_name?: string;
  client_name?: string;
  supplier_name?: string;
  reconciliation_status: string;
}

const TreasuryModuleProfessional: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pool');
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [poolSummary, setPoolSummary] = useState<BankPoolSummary | null>(null);
  const [movements, setMovements] = useState<MonthlyMovement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTreasuryData();
  }, [selectedPeriod]);

  const loadTreasuryData = async () => {
    try {
      setIsLoading(true);
      const [year, month] = selectedPeriod.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(parseInt(year), parseInt(month), 0).toISOString().split('T')[0];

      const { data: accountsData, error: accountsError } = await supabase
        .from('bank_accounts')
        .select(`
          id,
          account_alias,
          iban,
          current_balance,
          banks (
            name
          )
        `)
        .eq('status', 'active');

      if (accountsError) throw accountsError;

      const { data: movementsData, error: movementsError } = await supabase
        .from('treasury_movements')
        .select(`
          id,
          operation_date,
          value_date,
          concept,
          amount,
          movement_type,
          reconciliation_status,
          bank_accounts (
            account_alias,
            banks (
              name
            )
          ),
          projects (
            name
          ),
          clients (
            company_name
          ),
          suppliers (
            commercial_name
          )
        `)
        .gte('operation_date', startDate)
        .lte('operation_date', endDate)
        .order('operation_date', { ascending: false });

      if (movementsError) throw movementsError;

      const accounts: AccountBalance[] = [];
      let totalIncome = 0;
      let totalExpense = 0;
      let totalBalance = 0;
      let totalMovements = 0;

      for (const account of accountsData || []) {
        const accountMovements = movementsData?.filter(
          (m: any) => m.bank_accounts?.account_alias === account.account_alias
        ) || [];

        const income = accountMovements
          .filter((m: any) => m.movement_type === 'income' && m.reconciliation_status === 'reconciled')
          .reduce((sum, m: any) => sum + Number(m.amount), 0);

        const expenses = accountMovements
          .filter((m: any) => m.movement_type === 'expense' && m.reconciliation_status === 'reconciled')
          .reduce((sum, m: any) => sum + Math.abs(Number(m.amount)), 0);

        accounts.push({
          account_id: account.id,
          account_alias: account.account_alias,
          bank_name: (account as any).banks?.name || 'N/A',
          iban: account.iban,
          current_balance: Number(account.current_balance),
          movements_count: accountMovements.length,
          income,
          expenses
        });

        totalIncome += income;
        totalExpense += expenses;
        totalBalance += Number(account.current_balance);
        totalMovements += accountMovements.length;
      }

      setPoolSummary({
        total_balance: totalBalance,
        total_accounts: accounts.length,
        total_movements: totalMovements,
        income_total: totalIncome,
        expense_total: totalExpense,
        net_flow: totalIncome - totalExpense,
        accounts
      });

      const formattedMovements: MonthlyMovement[] = (movementsData || []).map((m: any) => ({
        id: m.id,
        operation_date: m.operation_date,
        value_date: m.value_date,
        concept: m.concept,
        amount: Number(m.amount),
        movement_type: m.movement_type,
        account_alias: m.bank_accounts?.account_alias || 'N/A',
        bank_name: m.bank_accounts?.banks?.name || 'N/A',
        project_name: m.projects?.name,
        client_name: m.clients?.company_name,
        supplier_name: m.suppliers?.commercial_name,
        reconciliation_status: m.reconciliation_status
      }));

      setMovements(formattedMovements);
    } catch (error: any) {
      showErrorNotification('Error al cargar datos de tesorería');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportPoolToPDF = () => {
    if (!poolSummary) return;

    const doc = new jsPDF();
    const [year, month] = selectedPeriod.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    doc.setFontSize(18);
    doc.text('POOL BANCARIO MENSUAL', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(monthName.toUpperCase(), 105, 28, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Fecha: ${formatDate(new Date().toISOString())}`, 14, 40);

    const summaryData = [
      ['Total Cuentas', poolSummary.total_accounts.toString()],
      ['Saldo Total', formatCurrency(poolSummary.total_balance)],
      ['Movimientos del Mes', poolSummary.total_movements.toString()],
      ['Ingresos Totales', formatCurrency(poolSummary.income_total)],
      ['Gastos Totales', formatCurrency(poolSummary.expense_total)],
      ['Flujo Neto', formatCurrency(poolSummary.net_flow)]
    ];

    autoTable(doc, {
      startY: 48,
      head: [['Concepto', 'Valor']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold' },
      styles: { fontSize: 10 }
    });

    const accountsTableData = poolSummary.accounts.map(acc => [
      acc.bank_name,
      acc.account_alias,
      acc.iban,
      formatCurrency(acc.current_balance),
      acc.movements_count.toString(),
      formatCurrency(acc.income),
      formatCurrency(acc.expenses)
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Banco', 'Cuenta', 'IBAN', 'Saldo', 'Movtos', 'Ingresos', 'Gastos']],
      body: accountsTableData,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94], fontStyle: 'bold' },
      styles: { fontSize: 8 },
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'center' },
        5: { halign: 'right' },
        6: { halign: 'right' }
      }
    });

    doc.save(`pool_bancario_${selectedPeriod}.pdf`);
    showSuccessNotification('Pool bancario exportado a PDF');
  };

  const exportPoolToExcel = () => {
    if (!poolSummary) return;

    const [year, month] = selectedPeriod.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    const summarySheet = [
      ['POOL BANCARIO MENSUAL'],
      [monthName.toUpperCase()],
      ['Fecha:', formatDate(new Date().toISOString())],
      [],
      ['RESUMEN GENERAL'],
      ['Concepto', 'Valor'],
      ['Total Cuentas', poolSummary.total_accounts],
      ['Saldo Total', poolSummary.total_balance],
      ['Movimientos del Mes', poolSummary.total_movements],
      ['Ingresos Totales', poolSummary.income_total],
      ['Gastos Totales', poolSummary.expense_total],
      ['Flujo Neto', poolSummary.net_flow],
      [],
      ['DETALLE POR CUENTA'],
      ['Banco', 'Cuenta', 'IBAN', 'Saldo Actual', 'Movimientos', 'Ingresos', 'Gastos']
    ];

    poolSummary.accounts.forEach(acc => {
      summarySheet.push([
        acc.bank_name,
        acc.account_alias,
        acc.iban,
        acc.current_balance,
        acc.movements_count,
        acc.income,
        acc.expenses
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(summarySheet);

    ws['!cols'] = [
      { wch: 20 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Pool Bancario');

    if (movements.length > 0) {
      const movementsSheet = [
        ['MOVIMIENTOS DEL MES'],
        [monthName.toUpperCase()],
        [],
        ['Fecha Op.', 'Fecha Valor', 'Banco', 'Cuenta', 'Concepto', 'Tipo', 'Importe', 'Estado', 'Proyecto', 'Cliente', 'Proveedor']
      ];

      movements.forEach(mov => {
        movementsSheet.push([
          mov.operation_date,
          mov.value_date,
          mov.bank_name,
          mov.account_alias,
          mov.concept,
          mov.movement_type === 'income' ? 'Ingreso' : 'Gasto',
          mov.amount,
          mov.reconciliation_status === 'reconciled' ? 'Conciliado' : 'Pendiente',
          mov.project_name || '',
          mov.client_name || '',
          mov.supplier_name || ''
        ]);
      });

      const wsMovements = XLSX.utils.aoa_to_sheet(movementsSheet);
      wsMovements['!cols'] = [
        { wch: 12 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 40 },
        { wch: 10 },
        { wch: 15 },
        { wch: 12 },
        { wch: 25 },
        { wch: 25 },
        { wch: 25 }
      ];

      XLSX.utils.book_append_sheet(wb, wsMovements, 'Movimientos');
    }

    XLSX.writeFile(wb, `pool_bancario_${selectedPeriod}.xlsx`);
    showSuccessNotification('Pool bancario exportado a Excel');
  };

  const exportMovementsToPDF = () => {
    const doc = new jsPDF('landscape');
    const [year, month] = selectedPeriod.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    doc.setFontSize(18);
    doc.text('MOVIMIENTOS DE TESORERÍA', 148, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.text(monthName.toUpperCase(), 148, 23, { align: 'center' });

    const filteredMovements = movements.filter(m =>
      m.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.account_alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.bank_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const tableData = filteredMovements.map(mov => [
      formatDate(mov.operation_date),
      mov.bank_name,
      mov.account_alias,
      mov.concept.substring(0, 40),
      mov.movement_type === 'income' ? 'Ingreso' : 'Gasto',
      formatCurrency(Math.abs(mov.amount)),
      mov.reconciliation_status === 'reconciled' ? 'Sí' : 'No'
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Fecha', 'Banco', 'Cuenta', 'Concepto', 'Tipo', 'Importe', 'Conciliado']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8 },
      columnStyles: {
        5: { halign: 'right' },
        6: { halign: 'center' }
      }
    });

    doc.save(`movimientos_tesoreria_${selectedPeriod}.pdf`);
    showSuccessNotification('Movimientos exportados a PDF');
  };

  const filteredMovements = movements.filter(m =>
    m.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.account_alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.bank_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-lg text-gray-600">Cargando datos de tesorería...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tesorería Multibanco</h2>
          <p className="text-gray-600">Pool bancario, movimientos y análisis financiero</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadTreasuryData}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-2">
            <button
              onClick={() => setActiveTab('pool')}
              className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'pool'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Landmark className="h-4 w-4" />
                <span>Pool Bancario</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'movements'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Movimientos</span>
              </div>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
                <input
                  type="month"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {activeTab === 'movements' && (
                <div className="w-80">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Concepto, banco, cuenta..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-2">
              {activeTab === 'pool' && (
                <>
                  <button
                    onClick={exportPoolToPDF}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>PDF Pool</span>
                  </button>
                  <button
                    onClick={exportPoolToExcel}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Excel Pool</span>
                  </button>
                </>
              )}
              {activeTab === 'movements' && (
                <button
                  onClick={exportMovementsToPDF}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>PDF Movimientos</span>
                </button>
              )}
            </div>
          </div>

          {activeTab === 'pool' && poolSummary && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Saldo Total</p>
                      <p className="text-3xl font-bold text-blue-900 mt-2">
                        {formatCurrency(poolSummary.total_balance)}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {poolSummary.total_accounts} cuentas activas
                      </p>
                    </div>
                    <Wallet className="h-12 w-12 text-blue-600 opacity-50" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Ingresos del Mes</p>
                      <p className="text-3xl font-bold text-green-900 mt-2">
                        {formatCurrency(poolSummary.income_total)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Movimientos conciliados
                      </p>
                    </div>
                    <ArrowUpCircle className="h-12 w-12 text-green-600 opacity-50" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-800">Gastos del Mes</p>
                      <p className="text-3xl font-bold text-red-900 mt-2">
                        {formatCurrency(poolSummary.expense_total)}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Movimientos conciliados
                      </p>
                    </div>
                    <ArrowDownCircle className="h-12 w-12 text-red-600 opacity-50" />
                  </div>
                </div>
              </div>

              <div className={`rounded-lg p-6 border-2 ${
                poolSummary.net_flow >= 0
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      poolSummary.net_flow >= 0 ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Flujo Neto del Mes
                    </p>
                    <p className={`text-4xl font-bold mt-2 ${
                      poolSummary.net_flow >= 0 ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {formatCurrency(poolSummary.net_flow)}
                    </p>
                    <p className={`text-xs mt-1 ${
                      poolSummary.net_flow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Total de {poolSummary.total_movements} movimientos registrados
                    </p>
                  </div>
                  <TrendingUp className={`h-16 w-16 opacity-50 ${
                    poolSummary.net_flow >= 0 ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Detalle por Cuenta Bancaria</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Banco</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Cuenta</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">IBAN</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">Saldo Actual</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Movtos</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">Ingresos</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">Gastos</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {poolSummary.accounts.map((account) => (
                        <tr key={account.account_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <Landmark className="h-5 w-5 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">{account.bank_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">{account.account_alias}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-500 font-mono">{account.iban}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`text-sm font-bold ${
                              account.current_balance >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(account.current_balance)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {account.movements_count}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm text-green-600 font-medium">
                              {formatCurrency(account.income)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm text-red-600 font-medium">
                              {formatCurrency(account.expenses)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-left">
                          <span className="text-sm font-bold text-gray-900">TOTALES</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(poolSummary.total_balance)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-gray-900">
                            {poolSummary.total_movements}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-green-600">
                            {formatCurrency(poolSummary.income_total)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-bold text-red-600">
                            {formatCurrency(poolSummary.expense_total)}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'movements' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Total Movimientos</p>
                      <p className="text-2xl font-bold text-gray-900">{filteredMovements.length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Ingresos</p>
                      <p className="text-2xl font-bold text-green-600">
                        {filteredMovements.filter(m => m.movement_type === 'income').length}
                      </p>
                    </div>
                    <ArrowUpCircle className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Gastos</p>
                      <p className="text-2xl font-bold text-red-600">
                        {filteredMovements.filter(m => m.movement_type === 'expense').length}
                      </p>
                    </div>
                    <ArrowDownCircle className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600">Conciliados</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {filteredMovements.filter(m => m.reconciliation_status === 'reconciled').length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Lista de Movimientos ({filteredMovements.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Banco / Cuenta</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Concepto</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">Importe</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredMovements.map((movement) => (
                        <tr key={movement.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(movement.operation_date)}
                            </div>
                            {movement.value_date !== movement.operation_date && (
                              <div className="text-xs text-gray-500">
                                Valor: {formatDate(movement.value_date)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{movement.bank_name}</div>
                            <div className="text-xs text-gray-500">{movement.account_alias}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{movement.concept}</div>
                            {(movement.project_name || movement.client_name || movement.supplier_name) && (
                              <div className="text-xs text-gray-500 mt-1">
                                {movement.project_name && (
                                  <span className="inline-flex items-center mr-2">
                                    <Building2 className="h-3 w-3 mr-1" />
                                    {movement.project_name}
                                  </span>
                                )}
                                {movement.client_name && (
                                  <span className="inline-flex items-center mr-2">
                                    <Users className="h-3 w-3 mr-1" />
                                    {movement.client_name}
                                  </span>
                                )}
                                {movement.supplier_name && (
                                  <span className="inline-flex items-center">
                                    <Package className="h-3 w-3 mr-1" />
                                    {movement.supplier_name}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`text-sm font-bold ${
                              movement.movement_type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {movement.movement_type === 'income' ? '+' : '-'}
                              {formatCurrency(Math.abs(movement.amount))}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {movement.reconciliation_status === 'reconciled' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Conciliado
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Pendiente
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreasuryModuleProfessional;
