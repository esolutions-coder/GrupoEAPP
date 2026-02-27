import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, AlertCircle, Download,
  Calculator, RefreshCw, Calendar, BarChart3, Filter, X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatNumber } from '../../utils/formatUtils';
import { showSuccessNotification, showErrorNotification } from '../../utils/modalUtils';
import * as XLSX from 'xlsx';
import type {
  Machinery,
  MachineryProfitabilitySummary,
  MachineryMonthlyCosts
} from '../../types/fleet';

interface ProfitabilityModuleProps {
  machinery: Machinery[];
}

const MachineryProfitabilityModule: React.FC<ProfitabilityModuleProps> = ({ machinery }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [profitabilitySummary, setProfitabilitySummary] = useState<MachineryProfitabilitySummary[]>([]);
  const [monthlyCosts, setMonthlyCosts] = useState<MachineryMonthlyCosts[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalSummary, setTotalSummary] = useState({
    total_revenue: 0,
    total_costs: 0,
    gross_profit: 0,
    profitable_count: 0,
    losing_count: 0,
    owned_count: 0,
    rented_count: 0
  });

  useEffect(() => {
    loadProfitabilityData();
  }, [selectedYear, selectedMonth]);

  const loadProfitabilityData = async () => {
    try {
      setIsLoading(true);

      const period = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

      const { data: summaryData, error: summaryError } = await supabase
        .from('v_machinery_profitability_summary')
        .select('*')
        .eq('year', selectedYear)
        .eq('month', selectedMonth);

      if (summaryError) throw summaryError;

      const { data: costsData, error: costsError } = await supabase
        .from('machinery_monthly_costs')
        .select('*')
        .eq('year', selectedYear)
        .eq('month', selectedMonth);

      if (costsError) throw costsError;

      setProfitabilitySummary(summaryData || []);
      setMonthlyCosts(costsData || []);

      calculateTotals(summaryData || [], costsData || []);
    } catch (error: any) {
      showErrorNotification('Error al cargar datos de rentabilidad');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotals = (summary: MachineryProfitabilitySummary[], costs: MachineryMonthlyCosts[]) => {
    const totalRevenue = summary.reduce((sum, item) => sum + Number(item.total_revenue || 0), 0);
    const totalCosts = summary.reduce((sum, item) => sum + Number(item.total_costs || 0), 0);
    const profitableCount = summary.filter(item => item.is_profitable).length;
    const losingCount = summary.filter(item => !item.is_profitable && item.total_revenue > 0).length;

    const ownedCount = machinery.filter(m => m.ownership_type === 'owned').length;
    const rentedCount = machinery.filter(m => m.ownership_type === 'rented').length;

    setTotalSummary({
      total_revenue: totalRevenue,
      total_costs: totalCosts,
      gross_profit: totalRevenue - totalCosts,
      profitable_count: profitableCount,
      losing_count: losingCount,
      owned_count: ownedCount,
      rented_count: rentedCount
    });
  };

  const calculateMachineryForPeriod = async () => {
    if (!window.confirm(`¿Calcular costes para todas las máquinas en ${selectedMonth}/${selectedYear}?`)) {
      return;
    }

    try {
      setIsLoading(true);

      for (const machine of machinery) {
        const { error } = await supabase.rpc('calculate_monthly_machinery_costs', {
          p_machinery_id: machine.id,
          p_year: selectedYear,
          p_month: selectedMonth
        });

        if (error) {
          console.error(`Error calculando ${machine.name}:`, error);
        }
      }

      showSuccessNotification('Costes calculados correctamente');
      loadProfitabilityData();
    } catch (error: any) {
      showErrorNotification(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    const dataToExport = profitabilitySummary.map(item => ({
      'Código': item.machinery_code,
      'Maquinaria': item.machinery_name,
      'Categoría': item.category,
      'Tipo': item.ownership_type === 'owned' ? 'Propiedad' : 'Alquiler',
      'Proveedor': item.supplier_name || '-',
      'Periodo': item.period,
      'Horas Trabajadas': formatNumber(item.hours_worked, 2),
      'Alquiler': formatCurrency(item.rental_cost),
      'Operador': formatCurrency(item.operator_cost),
      'Combustible': formatCurrency(item.fuel_cost),
      'Mantenimiento': formatCurrency(item.maintenance_cost),
      'Seguro': formatCurrency(item.insurance_cost),
      'Seg. Social': formatCurrency(item.social_security_cost),
      'Otros': formatCurrency(item.other_costs),
      'COSTES TOTALES': formatCurrency(item.total_costs),
      'INGRESOS': formatCurrency(item.total_revenue),
      'BENEFICIO': formatCurrency(item.gross_profit),
      'Margen %': formatNumber(item.profit_margin, 2) + '%',
      '¿Rentable?': item.is_profitable ? 'SÍ' : 'NO',
      'Coste/Hora': formatCurrency(item.cost_per_hour),
      'Ingreso/Hora': formatCurrency(item.revenue_per_hour)
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rentabilidad');
    XLSX.writeFile(wb, `rentabilidad_maquinaria_${selectedYear}_${selectedMonth}.xlsx`);
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calculator className="w-6 h-6 mr-2 text-blue-600" />
              Análisis de Rentabilidad de Maquinaria
            </h2>
            <p className="text-gray-600 mt-1">Control de costes, ingresos y beneficios por máquina</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <button
              onClick={calculateMachineryForPeriod}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Calculator className="w-5 h-5 mr-2" />
              Calcular Costes
            </button>

            <button
              onClick={loadProfitabilityData}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>

            {profitabilitySummary.length > 0 && (
              <button
                onClick={exportToExcel}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-5 h-5 mr-2" />
                Exportar
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Ingresos Totales</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {formatCurrency(totalSummary.total_revenue)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-900">Costes Totales</p>
                <p className="text-2xl font-bold text-red-900 mt-1">
                  {formatCurrency(totalSummary.total_costs)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className={`p-4 bg-gradient-to-br rounded-lg border ${
            totalSummary.gross_profit >= 0
              ? 'from-green-50 to-green-100 border-green-200'
              : 'from-red-50 to-red-100 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${totalSummary.gross_profit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  Beneficio Bruto
                </p>
                <p className={`text-2xl font-bold mt-1 ${totalSummary.gross_profit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {formatCurrency(totalSummary.gross_profit)}
                </p>
              </div>
              {totalSummary.gross_profit >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Estado Maquinaria</p>
                <div className="flex space-x-4 mt-1">
                  <div>
                    <p className="text-xs text-purple-700">Rentables</p>
                    <p className="text-lg font-bold text-purple-900">{totalSummary.profitable_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-700">Pérdidas</p>
                    <p className="text-lg font-bold text-purple-900">{totalSummary.losing_count}</p>
                  </div>
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Composición de Flota</h3>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-sm text-gray-600">Propiedad</p>
              <p className="text-2xl font-bold text-gray-900">{totalSummary.owned_count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Alquiler</p>
              <p className="text-2xl font-bold text-gray-900">{totalSummary.rented_count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalSummary.owned_count + totalSummary.rented_count}
              </p>
            </div>
          </div>
        </div>
      </div>

      {profitabilitySummary.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">No hay datos de rentabilidad</p>
          <p className="text-gray-600 mt-2">
            Utiliza el botón "Calcular Costes" para generar el análisis del periodo seleccionado
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Maquinaria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Horas</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Costes</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Beneficio</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Rentable</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {profitabilitySummary.map((item) => (
                  <tr key={item.machinery_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{item.machinery_name}</p>
                        <p className="text-sm text-gray-600">{item.machinery_code} - {item.category}</p>
                        {item.supplier_name && (
                          <p className="text-xs text-blue-600">Proveedor: {item.supplier_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.ownership_type === 'owned'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.ownership_type === 'owned' ? 'Propiedad' : 'Alquiler'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-medium text-gray-900">{formatNumber(item.hours_worked, 2)}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(item.cost_per_hour)}/h</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-red-600">{formatCurrency(item.total_costs)}</p>
                      <div className="text-xs text-gray-600 space-y-0.5 mt-1">
                        {item.rental_cost > 0 && <p>Alq: {formatCurrency(item.rental_cost)}</p>}
                        {item.operator_cost > 0 && <p>Op: {formatCurrency(item.operator_cost)}</p>}
                        {item.fuel_cost > 0 && <p>Comb: {formatCurrency(item.fuel_cost)}</p>}
                        {item.maintenance_cost > 0 && <p>Mant: {formatCurrency(item.maintenance_cost)}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-bold text-blue-600">{formatCurrency(item.total_revenue)}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(item.revenue_per_hour)}/h</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={`font-bold text-lg ${
                        item.gross_profit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(item.gross_profit)}
                      </p>
                      <p className={`text-xs font-medium ${
                        item.profit_margin >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatNumber(item.profit_margin, 2)}%
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.is_profitable ? (
                        <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span className="text-xs font-medium">SÍ</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full">
                          <TrendingDown className="w-4 h-4 mr-1" />
                          <span className="text-xs font-medium">NO</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Cómo funciona el análisis de rentabilidad</h3>
            <div className="mt-2 text-sm text-blue-700 space-y-2">
              <p><strong>1. Calcular Costes:</strong> El sistema recopila automáticamente todos los costes del mes (alquiler, operador, combustible, mantenimiento, seguros, seguridad social).</p>
              <p><strong>2. Ingresos:</strong> Se calculan multiplicando las horas productivas por la tarifa/hora configurada en cada máquina.</p>
              <p><strong>3. Beneficio:</strong> Ingresos - Costes. Verde si es positivo (rentable), rojo si es negativo (pérdida).</p>
              <p><strong>4. Margen:</strong> Porcentaje de beneficio sobre ingresos. Indica qué tan eficiente es la máquina.</p>
              <p className="mt-3 font-medium">💡 Usa esta información para decidir si conviene mantener una máquina en alquiler o comprarla, o si debes ajustar las tarifas que cobras al cliente.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MachineryProfitabilityModule;
