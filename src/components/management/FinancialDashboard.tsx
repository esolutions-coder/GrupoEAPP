import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  TrendingUp, TrendingDown, DollarSign, AlertTriangle,
  Calendar, CheckCircle, Clock, FileText, Users, BarChart3
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatUtils';
import type { Invoice } from '../../types/invoicing';

interface FinancialStats {
  currentMonth: number;
  previousMonth: number;
  currentYear: number;
  previousYear: number;
  pendingAmount: number;
  overdueAmount: number;
  overdueCount: number;
  guaranteesRetained: number;
  averageCollectionDays: number;
}

interface MonthlyData {
  month: string;
  invoiced: number;
  collected: number;
}

interface ClientData {
  name: string;
  total: number;
  pending: number;
}

const FinancialDashboard: React.FC = () => {
  const [stats, setStats] = useState<FinancialStats>({
    currentMonth: 0,
    previousMonth: 0,
    currentYear: 0,
    previousYear: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    overdueCount: 0,
    guaranteesRetained: 0,
    averageCollectionDays: 0
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [topClients, setTopClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadFinancialStats(),
        loadMonthlyData(),
        loadTopClients()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFinancialStats = async () => {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*');

    if (error) throw error;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthTotal = invoices
      .filter(inv => {
        const date = new Date(inv.issue_date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    const previousMonthTotal = invoices
      .filter(inv => {
        const date = new Date(inv.issue_date);
        return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    const currentYearTotal = invoices
      .filter(inv => {
        const date = new Date(inv.issue_date);
        return date.getFullYear() === currentYear;
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    const previousYearTotal = invoices
      .filter(inv => {
        const date = new Date(inv.issue_date);
        return date.getFullYear() === previousYear;
      })
      .reduce((sum, inv) => sum + inv.total, 0);

    const pendingAmount = invoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.pending_amount, 0);

    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.pending_amount, 0);

    const { data: guarantees } = await supabase
      .from('invoice_guarantees')
      .select('amount')
      .eq('status', 'retained');

    const guaranteesRetained = guarantees?.reduce((sum, g) => sum + g.amount, 0) || 0;

    setStats({
      currentMonth: currentMonthTotal,
      previousMonth: previousMonthTotal,
      currentYear: currentYearTotal,
      previousYear: previousYearTotal,
      pendingAmount,
      overdueAmount,
      overdueCount: overdueInvoices.length,
      guaranteesRetained,
      averageCollectionDays: 0
    });
  };

  const loadMonthlyData = async () => {
    const { data: invoices, error: invoicesError } = await supabase
      .from('invoices')
      .select('issue_date, total');

    const { data: payments, error: paymentsError } = await supabase
      .from('invoice_payments')
      .select('payment_date, amount');

    if (invoicesError || paymentsError) throw invoicesError || paymentsError;

    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return date.toISOString().slice(0, 7);
    });

    const data: MonthlyData[] = months.map(month => {
      const invoiced = invoices
        ?.filter(inv => inv.issue_date.startsWith(month))
        .reduce((sum, inv) => sum + inv.total, 0) || 0;

      const collected = payments
        ?.filter(pay => pay.payment_date.startsWith(month))
        .reduce((sum, pay) => sum + pay.amount, 0) || 0;

      return {
        month: new Date(month).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        invoiced,
        collected
      };
    });

    setMonthlyData(data);
  };

  const loadTopClients = async () => {
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('client_name, total, pending_amount');

    if (error) throw error;

    const clientMap = new Map<string, { total: number; pending: number }>();

    invoices?.forEach(inv => {
      const existing = clientMap.get(inv.client_name) || { total: 0, pending: 0 };
      clientMap.set(inv.client_name, {
        total: existing.total + inv.total,
        pending: existing.pending + inv.pending_amount
      });
    });

    const clients = Array.from(clientMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    setTopClients(clients);
  };

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const monthChangePercent = getPercentageChange(stats.currentMonth, stats.previousMonth);
  const yearChangePercent = getPercentageChange(stats.currentYear, stats.previousYear);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando datos financieros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Financiero</h2>
        <p className="text-gray-600 mt-1">Análisis y métricas de facturación</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Facturación Mes Actual</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.currentMonth)}
              </p>
              <div className="flex items-center mt-2">
                {monthChangePercent >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm font-medium ${monthChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(monthChangePercent).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Facturación Año Actual</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.currentYear)}
              </p>
              <div className="flex items-center mt-2">
                {yearChangePercent >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm font-medium ${yearChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(yearChangePercent).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">vs año anterior</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendiente de Cobro</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.pendingAmount)}
              </p>
              <div className="flex items-center mt-2">
                <Clock className="w-4 h-4 text-yellow-600 mr-1" />
                <span className="text-sm text-gray-500">En gestión</span>
              </div>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Facturas Vencidas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.overdueAmount)}
              </p>
              <div className="flex items-center mt-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600 font-medium">
                  {stats.overdueCount} facturas
                </span>
              </div>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Retenciones de Garantía</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Retenido</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.guaranteesRetained)}
              </p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <FileText className="w-10 h-10 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Cobros</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-gray-600">Cobrado</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(stats.currentYear - stats.pendingAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm text-gray-600">Pendiente</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(stats.pendingAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm text-gray-600">Vencido</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(stats.overdueAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Facturación vs Cobros (últimos 12 meses)</h3>
        <div className="h-80">
          <div className="flex items-end justify-between h-full space-x-2">
            {monthlyData.map((data, index) => {
              const maxValue = Math.max(...monthlyData.map(d => Math.max(d.invoiced, d.collected)));
              const invoicedHeight = (data.invoiced / maxValue) * 100;
              const collectedHeight = (data.collected / maxValue) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex items-end justify-center space-x-1 h-64">
                    <div
                      className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ height: `${invoicedHeight}%` }}
                      title={`Facturado: ${formatCurrency(data.invoiced)}`}
                    />
                    <div
                      className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer"
                      style={{ height: `${collectedHeight}%` }}
                      title={`Cobrado: ${formatCurrency(data.collected)}`}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{data.month}</p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Facturado</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-sm text-gray-600">Cobrado</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Clientes</h3>
        <div className="space-y-4">
          {topClients.map((client, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{client.name}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(client.total / topClients[0].total) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="ml-4 text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(client.total)}
                </p>
                <p className="text-xs text-gray-500">
                  Pendiente: {formatCurrency(client.pending)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;
