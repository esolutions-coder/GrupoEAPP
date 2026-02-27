import React from 'react';
import { DollarSign, Wallet, TrendingUp, TrendingDown, Building2, Receipt, Package } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatUtils';
import type { BankAccount, CreditLine, FactoringOperation, LeasingContract, TreasuryDashboardKPI } from '../../../types/treasury';

interface Props {
  kpis: TreasuryDashboardKPI;
  accounts: BankAccount[];
  creditLines: CreditLine[];
  factoring: FactoringOperation[];
  leasing: LeasingContract[];
  setActiveTab: (tab: string) => void;
}

export const TreasuryDashboard: React.FC<Props> = ({
  kpis,
  accounts,
  creditLines,
  factoring,
  leasing,
  setActiveTab
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Saldo Total"
          value={formatCurrency(kpis.total_balance)}
          subtitle={`En ${accounts.length} cuentas`}
          icon={DollarSign}
          color="green"
          onClick={() => setActiveTab('accounts')}
        />
        <KPICard
          title="Saldo Disponible"
          value={formatCurrency(kpis.available_balance)}
          subtitle="Con crédito disponible"
          icon={Wallet}
          color="blue"
        />
        <KPICard
          title="Crédito Disponible"
          value={formatCurrency(kpis.available_credit)}
          subtitle={`Uso: ${kpis.credit_usage_percentage.toFixed(1)}%`}
          icon={TrendingUp}
          color="orange"
          onClick={() => setActiveTab('credit_lines')}
        />
        <KPICard
          title="Coste Financiero"
          value={formatCurrency(kpis.monthly_financial_cost)}
          subtitle="Mensual"
          icon={TrendingDown}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cuentas Bancarias</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {accounts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay cuentas registradas</p>
            ) : (
              accounts.map((account) => (
                <div key={account.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <div>
                    <p className="font-semibold text-gray-900">{account.account_alias}</p>
                    <p className="text-sm text-gray-600">{account.iban}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${Number(account.current_balance) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(account.current_balance)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {account.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pólizas de Crédito</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {creditLines.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No hay pólizas registradas</p>
            ) : (
              creditLines.map((line) => {
                const usagePercent = (Number(line.drawn_amount) / Number(line.granted_limit)) * 100;
                return (
                  <div key={line.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-gray-900">{line.policy_number}</p>
                      <p className="text-sm text-gray-600">{usagePercent.toFixed(1)}% usado</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full ${usagePercent > 80 ? 'bg-red-600' : usagePercent > 50 ? 'bg-orange-500' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Dispuesto: {formatCurrency(line.drawn_amount)}</span>
                      <span className="text-green-600">Disponible: {formatCurrency(line.available_amount)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg" onClick={() => setActiveTab('factoring')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Factoring Activo</h3>
            <Receipt className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-blue-600">{kpis.active_factoring_operations}</p>
            <p className="text-sm text-gray-600 mt-2">Operaciones activas</p>
            <p className="text-2xl font-semibold text-gray-900 mt-4">{formatCurrency(kpis.factoring_advanced)}</p>
            <p className="text-sm text-gray-600">Anticipado total</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg" onClick={() => setActiveTab('leasing')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Leasing/Renting</h3>
            <Package className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-purple-600">{leasing.filter(l => l.status === 'active').length}</p>
            <p className="text-sm text-gray-600 mt-2">Contratos activos</p>
            <p className="text-2xl font-semibold text-gray-900 mt-4">
              {formatCurrency(leasing.filter(l => l.status === 'active').reduce((sum, l) => sum + Number(l.monthly_fee), 0))}
            </p>
            <p className="text-sm text-gray-600">Cuota mensual total</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg" onClick={() => setActiveTab('reconciliation')}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Conciliación</h3>
            <Building2 className="w-6 h-6 text-orange-600" />
          </div>
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-orange-600">{kpis.pending_reconciliations}</p>
            <p className="text-sm text-gray-600 mt-2">Movimientos pendientes</p>
            {kpis.pending_reconciliations > 0 && (
              <button className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                Conciliar ahora
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Previsión de Tesorería</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">30 días</p>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(kpis.forecast_30_days)}</p>
            <p className="text-xs text-blue-700 mt-1">Previsión a corto plazo</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm font-medium text-indigo-900">60 días</p>
            <p className="text-2xl font-bold text-indigo-900">{formatCurrency(kpis.forecast_60_days)}</p>
            <p className="text-xs text-indigo-700 mt-1">Previsión a medio plazo</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium text-purple-900">90 días</p>
            <p className="text-2xl font-bold text-purple-900">{formatCurrency(kpis.forecast_90_days)}</p>
            <p className="text-xs text-purple-700 mt-1">Previsión a largo plazo</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">Sistema de Tesorería Avanzada</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p className="mb-2">Módulo completamente integrado y operativo con:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Gestión multicuenta bancaria (hasta 10+ cuentas simultáneas)</li>
                <li>Control de pólizas de crédito con alertas de límites</li>
                <li>Seguimiento de factoring y confirming con trazabilidad total</li>
                <li>Gestión de leasing/renting vinculado a activos</li>
                <li>Importación de extractos bancarios CSV/Excel</li>
                <li>Conciliación bancaria asistida con matching automático</li>
                <li>Previsión de tesorería a 30/60/90 días</li>
                <li>Integración completa con Obras, Clientes y Proveedores</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: 'green' | 'blue' | 'orange' | 'red';
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, icon: Icon, color, onClick }) => {
  const colors = {
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow p-6 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm mt-1 ${colors[color].text}`}>{subtitle}</p>
        </div>
        <div className={`p-3 ${colors[color].bg} rounded-full flex-shrink-0`}>
          <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${colors[color].text}`} />
        </div>
      </div>
    </div>
  );
};
