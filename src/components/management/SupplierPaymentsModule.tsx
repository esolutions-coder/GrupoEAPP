import React, { useState, useEffect } from 'react';
import {
  Building, Users, DollarSign, FileText, Download, RefreshCw, Calendar
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/formatUtils';
import { showErrorNotification } from '../../utils/modalUtils';
import * as XLSX from 'xlsx';
import type { SupplierMonthlyPayment } from '../../types/fleet';

const SupplierPaymentsModule: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [supplierPayments, setSupplierPayments] = useState<SupplierMonthlyPayment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totals, setTotals] = useState({
    total_suppliers: 0,
    total_machinery: 0,
    total_payments: 0
  });

  useEffect(() => {
    loadSupplierPayments();
  }, [selectedYear, selectedMonth]);

  const loadSupplierPayments = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('v_supplier_monthly_payments')
        .select('*')
        .eq('year', selectedYear)
        .eq('month', selectedMonth)
        .order('total_rental_cost', { ascending: false });

      if (error) throw error;

      setSupplierPayments(data || []);

      const totalSuppliers = data?.length || 0;
      const totalMachinery = data?.reduce((sum, item) => sum + item.machinery_count, 0) || 0;
      const totalPayments = data?.reduce((sum, item) => sum + Number(item.total_rental_cost), 0) || 0;

      setTotals({
        total_suppliers: totalSuppliers,
        total_machinery: totalMachinery,
        total_payments: totalPayments
      });
    } catch (error: any) {
      showErrorNotification('Error al cargar pagos a proveedores');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    const dataToExport = supplierPayments.map(item => ({
      'Proveedor': item.supplier_name,
      'Contacto': item.contact_person || '-',
      'Email': item.email || '-',
      'Teléfono': item.phone || '-',
      'Periodo': item.period,
      'Nº Máquinas': item.machinery_count,
      'Pago Total': formatCurrency(item.total_rental_cost),
      'Máquinas': item.machinery_list
    }));

    dataToExport.push({
      'Proveedor': 'TOTAL',
      'Contacto': '',
      'Email': '',
      'Teléfono': '',
      'Periodo': '',
      'Nº Máquinas': totals.total_machinery,
      'Pago Total': formatCurrency(totals.total_payments),
      'Máquinas': ''
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pagos Proveedores');
    XLSX.writeFile(wb, `pagos_proveedores_${selectedYear}_${selectedMonth}.xlsx`);
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
              <Building className="w-6 h-6 mr-2 text-blue-600" />
              Informe de Pagos a Proveedores
            </h2>
            <p className="text-gray-600 mt-1">Control mensual de alquileres de maquinaria por proveedor</p>
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
              onClick={loadSupplierPayments}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>

            {supplierPayments.length > 0 && (
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">Proveedores Activos</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{totals.total_suppliers}</p>
              </div>
              <Building className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">Máquinas en Alquiler</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">{totals.total_machinery}</p>
              </div>
              <Users className="w-10 h-10 text-purple-600" />
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-900">Total a Pagar</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {formatCurrency(totals.total_payments)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {supplierPayments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">No hay pagos registrados</p>
          <p className="text-gray-600 mt-2">
            No se encontraron máquinas en alquiler para el periodo seleccionado
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-left max-w-2xl mx-auto">
            <p className="text-sm font-medium text-blue-900 mb-2">Para ver pagos a proveedores:</p>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Crea un proveedor en <strong>Proveedores & Recursos → Proveedores</strong></li>
              <li>Añade una máquina en <strong>Flota → Maquinaria</strong></li>
              <li>Configúrala como <strong>"Alquiler"</strong> y selecciona el proveedor</li>
              <li>Introduce el <strong>coste mensual de alquiler</strong></li>
              <li>Ve a <strong>Flota → Rentabilidad</strong> y calcula costes del mes</li>
              <li>Regresa aquí para ver el informe de pagos</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {supplierPayments.map((supplier) => (
            <div key={supplier.supplier_id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-white">{supplier.supplier_name}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-blue-100">
                      {supplier.contact_person && (
                        <span>👤 {supplier.contact_person}</span>
                      )}
                      {supplier.email && (
                        <span>📧 {supplier.email}</span>
                      )}
                      {supplier.phone && (
                        <span>📞 {supplier.phone}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-100">Total Mensual</p>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(supplier.total_rental_cost)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span className="font-medium">Periodo: {supplier.period}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Users className="w-5 h-5 mr-2" />
                    <span className="font-medium">{supplier.machinery_count} máquinas</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Máquinas Alquiladas:</h4>
                  <div className="flex flex-wrap gap-2">
                    {supplier.machinery_list.split(', ').map((machine, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-white text-gray-700 text-sm font-medium rounded-full border border-gray-300 shadow-sm"
                      >
                        {machine}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-blue-900">Pago Promedio por Máquina</p>
                      <p className="text-xs text-blue-700 mt-1">
                        {formatCurrency(supplier.total_rental_cost / supplier.machinery_count)} por unidad
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-900">Total a Pagar</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(supplier.total_rental_cost)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg shadow p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">TOTAL GENERAL</p>
                <p className="text-sm text-gray-300 mt-1">
                  {totals.total_suppliers} proveedores • {totals.total_machinery} máquinas
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">Pago Total Mensual</p>
                <p className="text-4xl font-bold">{formatCurrency(totals.total_payments)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start">
          <DollarSign className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Información del Informe</h3>
            <div className="mt-2 text-sm text-green-700 space-y-2">
              <p><strong>Este informe te muestra:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Cuánto pagas mensualmente a cada proveedor por alquiler de maquinaria</li>
                <li>Qué máquinas tienes alquiladas de cada proveedor</li>
                <li>El coste promedio por máquina de cada proveedor</li>
                <li>El total general que pagas mensualmente en alquileres</li>
              </ul>
              <p className="mt-3 font-medium">💡 Usa esta información para negociar mejores tarifas con proveedores, consolidar alquileres, o decidir si conviene comprar maquinaria que usas frecuentemente.</p>

              <div className="mt-4 p-3 bg-white rounded border border-green-300">
                <p className="font-semibold text-green-900 mb-1">📌 Nota Importante:</p>
                <p className="text-green-800">
                  Este módulo está <strong>sincronizado automáticamente</strong> con el módulo de <strong>Proveedores & Recursos → Proveedores</strong>.
                  Los proveedores que veas aquí son los mismos que gestionas en ese módulo.
                  Este informe solo muestra proveedores que tienen máquinas en alquiler con costes calculados para el periodo seleccionado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierPaymentsModule;
