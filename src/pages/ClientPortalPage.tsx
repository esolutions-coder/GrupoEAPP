import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  FileText, Download, AlertCircle, CheckCircle, Clock,
  Building2, Mail, Phone, MapPin, Calendar
} from 'lucide-react';
import { formatCurrency } from '../utils/formatUtils';
import type { Invoice } from '../types/invoicing';

const ClientPortalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    if (token) {
      loadClientData();
    } else {
      setError('Token de acceso no válido');
      setLoading(false);
    }
  }, [token]);

  const loadClientData = async () => {
    try {
      setLoading(true);

      const { data: tokenData, error: tokenError } = await supabase
        .from('client_portal_tokens')
        .select('*')
        .eq('token', token)
        .eq('is_active', true)
        .maybeSingle();

      if (tokenError) throw tokenError;

      if (!tokenData) {
        setError('Token no válido o expirado');
        return;
      }

      const expiresAt = new Date(tokenData.expires_at);
      if (expiresAt < new Date()) {
        setError('El enlace ha expirado');
        return;
      }

      await supabase
        .from('client_portal_tokens')
        .update({
          last_accessed_at: new Date().toISOString(),
          access_count: tokenData.access_count + 1
        })
        .eq('id', tokenData.id);

      const { data: clientInvoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', tokenData.client_id)
        .order('issue_date', { ascending: false });

      if (invoicesError) throw invoicesError;

      if (clientInvoices && clientInvoices.length > 0) {
        setClientName(clientInvoices[0].client_name);
      }

      setInvoices(clientInvoices || []);

      const { data: configData } = await supabase
        .from('invoicing_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      setConfig(configData);
    } catch (err: any) {
      console.error('Error loading client data:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    alert('Función de descarga de PDF en desarrollo');
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Borrador',
      issued: 'Emitida',
      partially_paid: 'Pago Parcial',
      paid: 'Cobrada',
      overdue: 'Vencida',
      cancelled: 'Anulada'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'partially_paid':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <FileText className="w-5 h-5 text-blue-600" />;
    }
  };

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPending = invoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.pending_amount, 0);
  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {config?.company_name || 'Portal de Cliente'}
              </h1>
              <p className="text-gray-600 mt-1">Consulta de Facturas</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-gray-600">
                <Building2 className="w-5 h-5 mr-2" />
                <span className="font-medium">{clientName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Facturado</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalInvoiced)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendiente de Pago</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalPending)}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Facturas Vencidas</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {overdueCount}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Mis Facturas</h2>
          </div>

          <div className="overflow-x-auto">
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
                    Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pendiente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoice_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {invoice.issue_date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.project_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{invoice.due_date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatCurrency(invoice.pending_amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(invoice.status)}
                        <span className="ml-2 text-sm text-gray-700">
                          {getStatusLabel(invoice.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDownloadPDF(invoice)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {invoices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay facturas disponibles</p>
            </div>
          )}
        </div>

        {config && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <Building2 className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{config.company_name}</p>
                  <p className="text-sm text-gray-600">CIF: {config.company_cif}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">{config.company_address}</p>
                  <p className="text-sm text-gray-600">
                    {config.company_postal_code} {config.company_city}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 mr-3" />
                <p className="text-sm text-gray-600">{config.company_phone}</p>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <p className="text-sm text-gray-600">{config.company_email}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Este enlace es personal e intransferible</p>
          <p className="mt-1">
            Para cualquier consulta, contacte con {config?.company_name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientPortalPage;
