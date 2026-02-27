import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  FileText, Plus, Search, Filter, Download, Eye, Edit2, Trash2,
  Check, X, AlertTriangle, Calendar, DollarSign, TrendingUp,
  CreditCard, RefreshCw, Send, Clock, CheckCircle, XCircle,
  Users, Building2, FileSpreadsheet, Receipt
} from 'lucide-react';
import type { Invoice, InvoiceLine, InvoicePayment, MonthlyClosing, InvoicingConfig } from '../../types/invoicing';
import { formatCurrency } from '../../utils/formatUtils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const InvoicingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'closings' | 'payments' | 'config'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [closings, setClosings] = useState<MonthlyClosing[]>([]);
  const [config, setConfig] = useState<InvoicingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<'month' | 'quarter' | 'semester' | 'year'>('month');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedClosing, setSelectedClosing] = useState<MonthlyClosing | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [lastProjectInvoice, setLastProjectInvoice] = useState<Invoice | null>(null);
  const [loadingLastInvoice, setLoadingLastInvoice] = useState(false);

  const [invoiceForm, setInvoiceForm] = useState({
    client_id: '',
    project_id: '',
    invoice_type: 'normal' as 'normal' | 'isp' | 'rectificative',
    is_isp: false,
    has_guarantee: false,
    guarantee_rate: 5,
    retention_rate: 0,
    iva_rate: 21,
    payment_days: 30,
    payment_method_label: 'TRANSFERENCIA BANCARIA 30 DIAS',
    issue_date: new Date().toISOString().split('T')[0],
    notes: '',
    lines: [{
      description: '',
      unit: 'ud',
      origin_quantity: 0,
      previous_quantity: 0,
      current_quantity: 0,
      quantity: 0,
      unit_price: 0,
      discount_rate: 0
    }]
  });

  const [paymentForm, setPaymentForm] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    amount: 0,
    payment_method: 'transfer' as 'transfer' | 'check' | 'cash' | 'card' | 'other',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadInvoices(),
        loadClosings(),
        loadConfig(),
        loadProjects(),
        loadClients()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('issue_date', { ascending: false });

    if (error) throw error;
    setInvoices(data || []);
  };

  const loadClosings = async () => {
    const { data, error } = await supabase
      .from('monthly_closings')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    if (error) throw error;
    setClosings(data || []);
  };

  const loadConfig = async () => {
    const { data, error } = await supabase
      .from('invoicing_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    setConfig(data);
  };

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (error) throw error;
    setProjects(data || []);
  };

  const loadClients = async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (error) throw error;
    setClients(data || []);
  };

  const getNextInvoiceNumber = async (type: 'normal' | 'rectificative') => {
    const { data, error } = await supabase.rpc('get_next_invoice_number', {
      p_invoice_type: type === 'rectificative' ? 'rectificative' : 'normal'
    });

    if (error) throw error;
    return data;
  };

  const calculateInvoiceTotals = (lines: any[], ivaRate: number, guaranteeRate: number, hasGuarantee: boolean, isIsp: boolean) => {
    const subtotal = lines.reduce((sum, line) => {
      const currentQty = (line.origin_quantity || 0) - (line.previous_quantity || 0);
      const lineSubtotal = currentQty * line.unit_price;
      const discount = lineSubtotal * (line.discount_rate / 100);
      return sum + (lineSubtotal - discount);
    }, 0);

    const ivaAmount = isIsp ? 0 : subtotal * (ivaRate / 100);
    const guaranteeAmount = hasGuarantee ? subtotal * (guaranteeRate / 100) : 0;
    const total = subtotal + ivaAmount - guaranteeAmount;

    return { subtotal, ivaAmount, guaranteeAmount, total };
  };

  const handleCreateInvoice = async () => {
    try {
      if (!invoiceForm.client_id) {
        alert('Seleccione un cliente');
        return;
      }

      if (!invoiceForm.lines || invoiceForm.lines.length === 0) {
        alert('Agregue al menos una línea a la factura');
        return;
      }

      const hasEmptyDescription = invoiceForm.lines.some(line => !line.description || line.description.trim() === '');
      if (hasEmptyDescription) {
        alert('Complete la descripción de todas las líneas');
        return;
      }

      const client = clients.find(c => c.id === invoiceForm.client_id);
      const project = projects.find(p => p.id === invoiceForm.project_id);

      if (!client) {
        alert('Cliente no encontrado');
        return;
      }

      const invoiceNumber = await getNextInvoiceNumber(
        invoiceForm.invoice_type === 'rectificative' ? 'rectificative' : 'normal'
      );

      const totals = calculateInvoiceTotals(
        invoiceForm.lines,
        invoiceForm.iva_rate,
        invoiceForm.guarantee_rate,
        invoiceForm.has_guarantee,
        invoiceForm.is_isp
      );

      const dueDate = new Date(invoiceForm.issue_date);
      dueDate.setDate(dueDate.getDate() + invoiceForm.payment_days);

      const invoiceData = {
        invoice_number: invoiceNumber,
        invoice_series: invoiceForm.invoice_type === 'rectificative' ? config?.rectificative_series : config?.normal_series,
        invoice_type: invoiceForm.invoice_type,
        client_id: invoiceForm.client_id,
        client_name: client.name || 'Sin nombre',
        client_cif: client.cif || 'N/A',
        client_address: client.address || 'N/A',
        client_city: client.city || 'N/A',
        client_postal_code: client.postal_code || '00000',
        project_id: invoiceForm.project_id || null,
        project_name: project?.name || 'Sin proyecto',
        project_code: project?.code || '',
        issue_date: invoiceForm.issue_date,
        due_date: dueDate.toISOString().split('T')[0],
        payment_days: invoiceForm.payment_days || 30,
        payment_method_label: invoiceForm.payment_method_label || 'TRANSFERENCIA BANCARIA 30 DIAS',
        subtotal: totals.subtotal || 0,
        iva_rate: invoiceForm.is_isp ? 0 : (invoiceForm.iva_rate || 21),
        iva_amount: totals.ivaAmount || 0,
        retention_rate: 0,
        retention_amount: 0,
        guarantee_rate: invoiceForm.guarantee_rate || 0,
        guarantee_amount: totals.guaranteeAmount || 0,
        total: totals.total || 0,
        paid_amount: 0,
        pending_amount: totals.total || 0,
        payment_status: 'pending',
        guarantee_released: false,
        internal_notes: '',
        pdf_url: '',
        is_isp: invoiceForm.is_isp || false,
        has_guarantee: invoiceForm.has_guarantee || false,
        notes: invoiceForm.notes || '',
        status: 'draft',
        created_by: 'user',
        updated_by: 'user'
      };

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const linesData = invoiceForm.lines.map((line, index) => {
        const originQty = Number(line.origin_quantity) || 0;
        const previousQty = Number(line.previous_quantity) || 0;
        const currentQty = originQty - previousQty;
        const unitPrice = Number(line.unit_price) || 0;
        const discountRate = Number(line.discount_rate) || 0;

        const lineSubtotal = currentQty * unitPrice;
        const discount = lineSubtotal * (discountRate / 100);
        const subtotal = lineSubtotal - discount;
        const ivaAmount = subtotal * (invoiceForm.iva_rate / 100);
        const total = subtotal + ivaAmount;

        return {
          invoice_id: invoice.id,
          line_number: index + 1,
          description: line.description || 'Sin descripción',
          unit: line.unit || 'ud',
          origin_quantity: originQty,
          previous_quantity: previousQty,
          current_quantity: currentQty,
          quantity: currentQty,
          unit_price: unitPrice,
          discount_rate: discountRate,
          discount_amount: discount,
          subtotal: subtotal,
          iva_rate: invoiceForm.iva_rate || 21,
          iva_amount: ivaAmount,
          total: total
        };
      });

      const { error: linesError } = await supabase
        .from('invoice_lines')
        .insert(linesData);

      if (linesError) throw linesError;

      if (invoiceForm.has_guarantee) {
        const { error: guaranteeError } = await supabase
          .from('invoice_guarantees')
          .insert([{
            invoice_id: invoice.id,
            amount: totals.guaranteeAmount,
            retention_date: invoiceForm.issue_date,
            status: 'retained'
          }]);

        if (guaranteeError) throw guaranteeError;
      }

      alert('Factura creada correctamente');
      setShowInvoiceModal(false);
      resetInvoiceForm();
      loadInvoices();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      const errorMessage = error?.message || error?.details || error?.hint || 'Error desconocido';
      alert(`Error al crear factura: ${errorMessage}`);
    }
  };

  const handleIssueInvoice = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({
          status: 'issued',
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (error) throw error;

      alert('Factura emitida correctamente');
      loadInvoices();
    } catch (error) {
      console.error('Error issuing invoice:', error);
      alert('Error al emitir factura');
    }
  };

  const handleAddPayment = async () => {
    try {
      if (!selectedInvoice) return;

      if (paymentForm.amount <= 0) {
        alert('El importe debe ser mayor a 0');
        return;
      }

      if (paymentForm.amount > selectedInvoice.pending_amount) {
        alert('El importe supera el pendiente de la factura');
        return;
      }

      const { error } = await supabase
        .from('invoice_payments')
        .insert([{
          invoice_id: selectedInvoice.id,
          payment_date: paymentForm.payment_date,
          amount: paymentForm.amount,
          payment_method: paymentForm.payment_method,
          reference: paymentForm.reference,
          notes: paymentForm.notes,
          created_by: 'user'
        }]);

      if (error) throw error;

      alert('Pago registrado correctamente');
      setShowPaymentModal(false);
      resetPaymentForm();
      loadInvoices();
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Error al registrar pago');
    }
  };

  const handleGenerateClosing = async () => {
    try {
      if (!selectedClosing) return;

      const invoiceNumber = await getNextInvoiceNumber('normal');

      const client = clients.find(c => c.id === selectedClosing.client_id);
      const project = projects.find(p => p.id === selectedClosing.project_id);

      if (!client || !project) {
        alert('Cliente o proyecto no encontrado');
        return;
      }

      const issueDate = new Date().toISOString().split('T')[0];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (config?.default_payment_days || 30));

      const subtotal = selectedClosing.total_amount;
      const ivaAmount = subtotal * ((config?.default_iva_rate || 21) / 100);
      const total = subtotal + ivaAmount;

      const invoiceData = {
        invoice_number: invoiceNumber,
        invoice_series: config?.normal_series || 'F/',
        invoice_type: 'normal',
        client_id: selectedClosing.client_id,
        client_name: client.name,
        client_cif: client.cif || '',
        client_address: client.address || '',
        client_city: client.city || '',
        client_postal_code: client.postal_code || '',
        project_id: selectedClosing.project_id,
        project_name: project.name,
        project_code: project.code,
        monthly_closing_id: selectedClosing.id,
        issue_date: issueDate,
        due_date: dueDate.toISOString().split('T')[0],
        payment_days: config?.default_payment_days || 30,
        subtotal: subtotal,
        iva_rate: config?.default_iva_rate || 21,
        iva_amount: ivaAmount,
        retention_rate: 0,
        retention_amount: 0,
        guarantee_rate: 0,
        guarantee_amount: 0,
        total: total,
        pending_amount: total,
        is_isp: false,
        has_guarantee: false,
        notes: `Cierre mensual - ${getMonthName(selectedClosing.month)} ${selectedClosing.year}`,
        status: 'issued',
        created_by: 'user'
      };

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      const lineData = {
        invoice_id: invoice.id,
        line_number: 1,
        description: `Servicios ${project.name} - ${getMonthName(selectedClosing.month)} ${selectedClosing.year}`,
        quantity: selectedClosing.total_hours,
        unit_price: selectedClosing.total_amount / selectedClosing.total_hours,
        discount_rate: 0,
        discount_amount: 0,
        subtotal: subtotal,
        iva_rate: config?.default_iva_rate || 21,
        iva_amount: ivaAmount,
        total: total
      };

      const { error: lineError } = await supabase
        .from('invoice_lines')
        .insert([lineData]);

      if (lineError) throw lineError;

      const { error: closingError } = await supabase
        .from('monthly_closings')
        .update({
          status: 'invoiced',
          invoice_id: invoice.id,
          invoiced_at: new Date().toISOString()
        })
        .eq('id', selectedClosing.id);

      if (closingError) throw closingError;

      alert('Factura generada correctamente desde cierre mensual');
      setShowClosingModal(false);
      loadInvoices();
      loadClosings();
    } catch (error) {
      console.error('Error generating invoice from closing:', error);
      alert('Error al generar factura');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('¿Está seguro de eliminar esta factura?')) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;

      alert('Factura eliminada correctamente');
      loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Error al eliminar factura');
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredInvoices.map(inv => ({
      'Número': inv.invoice_number,
      'Fecha': inv.issue_date,
      'Cliente': inv.client_name,
      'Proyecto': inv.project_name,
      'Tipo': inv.invoice_type === 'normal' ? 'Normal' : inv.invoice_type === 'isp' ? 'ISP' : 'Rectificativa',
      'Subtotal': inv.subtotal,
      'IVA': inv.iva_amount,
      'Retención Garantía': inv.guarantee_amount,
      'Total': inv.total,
      'Pagado': inv.paid_amount,
      'Pendiente': inv.pending_amount,
      'Estado': getStatusLabel(inv.status)
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Facturas');
    XLSX.writeFile(wb, `facturas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = async (invoice: Invoice) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Colores corporativos pasteles
    const colors = {
      softBlue: [147, 197, 253],      // Azul pastel suave
      lightBlue: [191, 219, 254],     // Azul muy claro
      softViolet: [196, 181, 253],    // Violeta pastel
      softGray: [209, 213, 219],      // Gris suave
      mediumGray: [156, 163, 175],    // Gris medio
      lightGray: [249, 250, 251],     // Gris muy claro
      darkText: [55, 65, 81],         // Texto oscuro
      white: [255, 255, 255]
    };

    // Encabezado principal con color pastel
    doc.setFillColor(...colors.softBlue);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Logo/Nombre de empresa
    doc.setTextColor(...colors.darkText);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('GRUPO EA', 20, 18);

    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('OBRAS Y SERVICIOS S.L.', 20, 25);

    // Información de contacto
    doc.setFontSize(8);
    doc.text('Cl. RIO BIDASOA, 43 BAJO DCHA', 20, 32);
    doc.text('46019 VALENCIA', 20, 37);
    doc.text('Tel: 960225469 | Email: grupoea@grupoea.es', 20, 42);

    // FACTURA - Box en la derecha
    doc.setFillColor(...colors.softViolet);
    doc.roundedRect(pageWidth - 70, 10, 55, 25, 2, 2, 'F');

    doc.setTextColor(...colors.darkText);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('FACTURA', pageWidth - 42.5, 19, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(invoice.invoice_number, pageWidth - 42.5, 27, { align: 'center' });

    doc.setFontSize(8);
    doc.text(invoice.issue_date, pageWidth - 42.5, 33, { align: 'center' });

    doc.setTextColor(...colors.darkText);

    // Información del cliente
    let yPos = 55;
    doc.setFillColor(...colors.lightGray);
    doc.roundedRect(15, yPos, pageWidth - 30, 32, 2, 2, 'F');

    doc.setDrawColor(...colors.softGray);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, yPos, pageWidth - 30, 32, 2, 2, 'S');

    doc.setFillColor(...colors.mediumGray);
    doc.roundedRect(18, yPos + 3, 50, 6, 1, 1, 'F');
    doc.setTextColor(...colors.white);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('DATOS DEL CLIENTE', 20, yPos + 7);

    doc.setTextColor(...colors.darkText);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');

    doc.text('Razón Social:', 20, yPos + 15);
    doc.setFont(undefined, 'normal');
    doc.text(invoice.client_name, 20, yPos + 19);

    doc.setFont(undefined, 'bold');
    doc.text('Dirección:', 20, yPos + 24);
    doc.setFont(undefined, 'normal');
    const addressText = invoice.client_address || '';
    const wrappedAddress = doc.splitTextToSize(addressText, 80);
    doc.text(wrappedAddress, 20, yPos + 28);

    const rightX = pageWidth - 75;
    doc.setFont(undefined, 'bold');
    doc.text('CIF/NIF:', rightX, yPos + 15);
    doc.setFont(undefined, 'normal');
    doc.text(invoice.client_cif || '', rightX + 20, yPos + 15);

    doc.setFont(undefined, 'bold');
    doc.text('CP:', rightX, yPos + 20);
    doc.setFont(undefined, 'normal');
    doc.text(invoice.client_postal_code || '', rightX + 20, yPos + 20);

    doc.setFont(undefined, 'bold');
    doc.text('Población:', rightX, yPos + 25);
    doc.setFont(undefined, 'normal');
    doc.text(invoice.client_city || '', rightX + 20, yPos + 25);

    if (invoice.project_code && invoice.project_name) {
      yPos += 38;
      doc.setFillColor(...colors.softViolet);
      doc.roundedRect(15, yPos, pageWidth - 30, 8, 1, 1, 'F');
      doc.setTextColor(...colors.darkText);
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text('PROYECTO:', 18, yPos + 5.5);
      doc.setFont(undefined, 'normal');
      doc.text(`${invoice.project_code} - ${invoice.project_name}`, 37, yPos + 5.5);
      yPos += 12;
    } else {
      yPos += 38;
    }

    const { data: lines } = await supabase
      .from('invoice_lines')
      .select('*')
      .eq('invoice_id', invoice.id)
      .order('line_number');

    // Tabla con certificación a origen
    doc.setFillColor(...colors.softBlue);
    doc.rect(15, yPos, pageWidth - 30, 12, 'F');

    doc.setTextColor(...colors.darkText);
    doc.setFontSize(6.5);
    doc.setFont(undefined, 'bold');

    // Definir columnas para certificación a origen - concepto más amplio, unidad más angosta
    const cols = {
      num: 18,
      unit: 25,
      desc: 90,
      price: 118,
      originQty: 135,
      originAmt: 145,
      prevQty: 157,
      prevAmt: 167,
      currentQty: 179,
      currentAmt: pageWidth - 17
    };

    // Primera línea de encabezados
    doc.text('#', cols.num, yPos + 4);
    doc.text('U', cols.unit, yPos + 4);
    doc.text('CONCEPTO', cols.desc, yPos + 4);
    doc.text('PRECIO', cols.price, yPos + 4, { align: 'right' });

    doc.text('ORIGEN', cols.originQty + 3, yPos + 4, { align: 'center' });
    doc.text('ANTERIOR', cols.prevQty + 3, yPos + 4, { align: 'center' });
    doc.text('ACTUAL', cols.currentQty + 3, yPos + 4, { align: 'center' });

    // Segunda línea de encabezados
    doc.text('Cant.', cols.originQty, yPos + 8, { align: 'right' });
    doc.text('Importe', cols.originAmt, yPos + 8, { align: 'right' });
    doc.text('Cant.', cols.prevQty, yPos + 8, { align: 'right' });
    doc.text('Importe', cols.prevAmt, yPos + 8, { align: 'right' });
    doc.text('Cant.', cols.currentQty, yPos + 8, { align: 'right' });
    doc.text('Importe', cols.currentAmt, yPos + 8, { align: 'right' });

    doc.setTextColor(...colors.darkText);
    yPos += 12;

    let rowColor = true;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(6.5);

    lines?.forEach((line: any) => {
      const originAmount = line.origin_quantity * line.unit_price;
      const previousAmount = line.previous_quantity * line.unit_price;
      const currentAmount = line.current_quantity * line.unit_price;

      if (rowColor) {
        doc.setFillColor(...colors.lightGray);
        doc.rect(15, yPos - 1, pageWidth - 30, 5, 'F');
      }
      rowColor = !rowColor;

      doc.setTextColor(...colors.darkText);
      doc.text(String(line.line_number).padStart(3, '0'), cols.num, yPos + 3);
      doc.text((line.unit || 'ud').substring(0, 3), cols.unit, yPos + 3);

      // Concepto más amplio
      const desc = line.description.length > 70 ? line.description.substring(0, 67) + '...' : line.description;
      doc.text(desc, cols.desc, yPos + 3);

      doc.text(formatCurrency(line.unit_price), cols.price, yPos + 3, { align: 'right' });

      // Origen
      doc.text(line.origin_quantity.toFixed(2), cols.originQty, yPos + 3, { align: 'right' });
      doc.text(formatCurrency(originAmount), cols.originAmt, yPos + 3, { align: 'right' });

      // Anterior
      doc.text(line.previous_quantity.toFixed(2), cols.prevQty, yPos + 3, { align: 'right' });
      doc.text(formatCurrency(previousAmount), cols.prevAmt, yPos + 3, { align: 'right' });

      // Actual
      doc.setFont(undefined, 'bold');
      doc.text(line.current_quantity.toFixed(2), cols.currentQty, yPos + 3, { align: 'right' });
      doc.text(formatCurrency(currentAmount), cols.currentAmt, yPos + 3, { align: 'right' });
      doc.setFont(undefined, 'normal');

      yPos += 5;
    });

    doc.setDrawColor(...colors.softGray);
    doc.setLineWidth(0.5);
    doc.line(15, yPos + 2, pageWidth - 15, yPos + 2);

    yPos += 10;
    const summaryX = pageWidth - 95;
    const valueX = pageWidth - 25;

    doc.setFontSize(8);
    doc.setTextColor(...colors.darkText);

    doc.setFont(undefined, 'normal');
    doc.text('Base Imponible:', summaryX, yPos);
    doc.setFont(undefined, 'bold');
    doc.text(formatCurrency(invoice.subtotal), valueX, yPos, { align: 'right' });

    if (invoice.is_isp) {
      yPos += 6;
      doc.setFont(undefined, 'normal');
      doc.setTextColor(...colors.softViolet);
      doc.setFontSize(7);
      const ispText = 'Inversión del Sujeto Pasivo (Art. 84.Uno.2º.f Ley 37/1992)';
      doc.text(ispText, summaryX, yPos);
      doc.setTextColor(...colors.darkText);
      doc.setFontSize(8);
    } else {
      yPos += 6;
      doc.setFont(undefined, 'normal');
      doc.text(`IVA (${invoice.iva_rate}%):`, summaryX, yPos);
      doc.setFont(undefined, 'bold');
      doc.text(formatCurrency(invoice.iva_amount), valueX, yPos, { align: 'right' });
    }

    if (invoice.guarantee_amount > 0) {
      yPos += 6;
      doc.setFont(undefined, 'normal');
      doc.text(`Retención Garantía (${invoice.guarantee_rate}%):`, summaryX, yPos);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(239, 68, 68);
      doc.text(`-${formatCurrency(invoice.guarantee_amount)}`, valueX, yPos, { align: 'right' });
      doc.setTextColor(...colors.darkText);
    }

    if (invoice.retention_rate > 0) {
      const retentionAmount = invoice.subtotal * (invoice.retention_rate / 100);
      yPos += 6;
      doc.setFont(undefined, 'normal');
      doc.text(`Retención IRPF (${invoice.retention_rate}%):`, summaryX, yPos);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(239, 68, 68);
      doc.text(`-${formatCurrency(retentionAmount)}`, valueX, yPos, { align: 'right' });
      doc.setTextColor(...colors.darkText);
    }

    yPos += 10;
    doc.setFillColor(...colors.softViolet);
    doc.roundedRect(summaryX - 5, yPos - 5, 85, 10, 1, 1, 'F');

    doc.setTextColor(...colors.darkText);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL FACTURA:', summaryX, yPos + 2);
    doc.setFontSize(12);
    doc.text(formatCurrency(invoice.total), valueX, yPos + 2, { align: 'right' });

    yPos += 20;
    doc.setFillColor(...colors.lightGray);
    doc.roundedRect(15, yPos, pageWidth - 30, 18, 2, 2, 'F');

    doc.setDrawColor(...colors.softGray);
    doc.setLineWidth(0.3);
    doc.roundedRect(15, yPos, pageWidth - 30, 18, 2, 2, 'S');

    doc.setFillColor(...colors.mediumGray);
    doc.roundedRect(18, yPos + 2, 40, 5, 1, 1, 'F');
    doc.setTextColor(...colors.white);
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('FORMA DE PAGO', 20, yPos + 5.5);

    doc.setTextColor(...colors.darkText);
    doc.setFontSize(7);
    doc.setFont(undefined, 'normal');
    doc.text('Método:', 20, yPos + 11);
    doc.setFont(undefined, 'bold');
    doc.text(invoice.payment_method_label || 'TRANSFERENCIA BANCARIA', 20, yPos + 15);

    doc.setFont(undefined, 'normal');
    doc.text('Vencimiento:', pageWidth - 75, yPos + 11);
    doc.setFont(undefined, 'bold');
    doc.text(invoice.due_date, pageWidth - 75, yPos + 15);

    if (invoice.notes && invoice.notes.trim()) {
      yPos += 23;
      doc.setFillColor(...colors.softBlue);
      doc.roundedRect(15, yPos, pageWidth - 30, 6, 1, 1, 'F');
      doc.setTextColor(...colors.darkText);
      doc.setFontSize(8);
      doc.setFont(undefined, 'bold');
      doc.text('OBSERVACIONES', 18, yPos + 4);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...colors.softGray);
      doc.roundedRect(15, yPos + 6, pageWidth - 30, 15, 1, 1, 'FD');

      doc.setTextColor(...colors.darkText);
      doc.setFontSize(7);
      doc.setFont(undefined, 'normal');
      const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - 40);
      doc.text(notesLines, 18, yPos + 10);
    }

    doc.setFillColor(...colors.softBlue);
    doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

    doc.setTextColor(...colors.darkText);
    doc.setFontSize(6);
    doc.setFont(undefined, 'normal');
    doc.text('CIF: B-98961535', pageWidth / 2, pageHeight - 14, { align: 'center' });
    doc.text('Inscrita en el Reg. Mercantil de Valencia, Tomo 10,432, Libro 7713, Folio 114, Hoja V-179751, Inscripción 1ª', pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.setFontSize(5);
    doc.text('Este documento es una representación impresa de una factura electrónica', pageWidth / 2, pageHeight - 6, { align: 'center' });

    doc.save(`factura_${invoice.invoice_number.replace(/\//g, '_')}.pdf`);
  };

  const resetInvoiceForm = () => {
    setInvoiceForm({
      client_id: '',
      project_id: '',
      invoice_type: 'normal',
      is_isp: false,
      has_guarantee: false,
      guarantee_rate: 5,
      retention_rate: 0,
      iva_rate: 21,
      payment_days: 30,
      payment_method_label: 'TRANSFERENCIA BANCARIA 30 DIAS',
      issue_date: new Date().toISOString().split('T')[0],
      notes: '',
      lines: [{
        description: '',
        unit: 'ud',
        origin_quantity: 0,
        previous_quantity: 0,
        current_quantity: 0,
        quantity: 0,
        unit_price: 0,
        discount_rate: 0
      }]
    });
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      payment_date: new Date().toISOString().split('T')[0],
      amount: 0,
      payment_method: 'transfer',
      reference: '',
      notes: ''
    });
  };

  const loadLastProjectInvoice = async (projectId: string) => {
    if (!projectId) {
      setLastProjectInvoice(null);
      return;
    }

    try {
      setLoadingLastInvoice(true);

      const { data: lastInvoice, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('project_id', projectId)
        .order('issue_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (lastInvoice) {
        const { data: lines, error: linesError } = await supabase
          .from('invoice_lines')
          .select('*')
          .eq('invoice_id', lastInvoice.id)
          .order('line_number', { ascending: true });

        if (linesError) throw linesError;

        setLastProjectInvoice({ ...lastInvoice, lines: lines || [] });
      } else {
        setLastProjectInvoice(null);
      }
    } catch (error) {
      console.error('Error loading last invoice:', error);
      setLastProjectInvoice(null);
    } finally {
      setLoadingLastInvoice(false);
    }
  };

  const duplicateLastInvoice = () => {
    if (!lastProjectInvoice) return;

    const duplicatedLines = (lastProjectInvoice as any).lines.map((line: any) => ({
      description: line.description,
      unit: line.unit,
      origin_quantity: line.current_quantity || line.origin_quantity || 0,
      previous_quantity: line.current_quantity || line.origin_quantity || 0,
      current_quantity: line.current_quantity || line.origin_quantity || 0,
      quantity: 0,
      unit_price: line.unit_price,
      discount_rate: line.discount_rate
    }));

    setInvoiceForm({
      ...invoiceForm,
      is_isp: lastProjectInvoice.is_isp,
      has_guarantee: lastProjectInvoice.has_guarantee,
      guarantee_rate: lastProjectInvoice.guarantee_rate,
      iva_rate: lastProjectInvoice.iva_rate,
      retention_rate: lastProjectInvoice.retention_rate || 0,
      payment_days: lastProjectInvoice.payment_days,
      payment_method_label: lastProjectInvoice.payment_method_label,
      lines: duplicatedLines
    });

    alert('Factura anterior duplicada. Ahora actualice las cantidades de origen con los nuevos valores del mes actual.');
  };

  const addInvoiceLine = () => {
    setInvoiceForm({
      ...invoiceForm,
      lines: [...invoiceForm.lines, {
        description: '',
        unit: 'ud',
        origin_quantity: 0,
        previous_quantity: 0,
        current_quantity: 0,
        quantity: 0,
        unit_price: 0,
        discount_rate: 0
      }]
    });
  };

  const removeInvoiceLine = (index: number) => {
    setInvoiceForm({
      ...invoiceForm,
      lines: invoiceForm.lines.filter((_, i) => i !== index)
    });
  };

  const updateInvoiceLine = (index: number, field: string, value: any) => {
    const newLines = [...invoiceForm.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setInvoiceForm({ ...invoiceForm, lines: newLines });
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      issued: 'bg-blue-100 text-blue-800',
      partially_paid: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getMonthName = (month: number) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month - 1];
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.project_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const filteredClosings = closings.filter(closing =>
    closing.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    closing.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    currentMonth: invoices
      .filter(inv => {
        const date = new Date(inv.issue_date);
        const now = new Date();
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, inv) => sum + inv.total, 0),
    currentYear: invoices
      .filter(inv => {
        const date = new Date(inv.issue_date);
        const now = new Date();
        return date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, inv) => sum + inv.total, 0),
    pending: invoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.pending_amount, 0),
    overdue: invoices.filter(inv => inv.status === 'overdue').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Facturación</h2>
          <p className="text-gray-600 mt-1">Gestión integral de facturación y cobros</p>
        </div>
        <button
          onClick={() => setShowInvoiceModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Factura</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mes Actual</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.currentMonth)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Año Actual</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.currentYear)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendiente Cobro</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.pending)}</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.overdue}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'invoices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Facturas</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('closings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'closings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Cierres Mensuales</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Cobros</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'config'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5" />
                <span>Configuración</span>
              </div>
            </button>
          </nav>
        </div>

        {activeTab === 'invoices' && (
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar facturas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="draft">Borradores</option>
                <option value="issued">Emitidas</option>
                <option value="partially_paid">Pago Parcial</option>
                <option value="paid">Cobradas</option>
                <option value="overdue">Vencidas</option>
                <option value="cancelled">Anuladas</option>
              </select>
              <button
                onClick={handleExportExcel}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-5 h-5" />
                <span>Excel</span>
              </button>
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
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proyecto
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
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                        {invoice.is_isp && (
                          <span className="text-xs text-purple-600">ISP</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.issue_date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.client_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.project_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(invoice.pending_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                          {getStatusLabel(invoice.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleExportPDF(invoice)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Descargar PDF"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          {invoice.status === 'draft' && (
                            <button
                              onClick={() => handleIssueInvoice(invoice.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Emitir Factura"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          )}
                          {(invoice.status === 'issued' || invoice.status === 'partially_paid') && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowPaymentModal(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Registrar Cobro"
                            >
                              <CreditCard className="w-5 h-5" />
                            </button>
                          )}
                          {invoice.status === 'draft' && (
                            <button
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron facturas</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'closings' && (
          <div className="p-6">
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Los cierres mensuales agrupan los partes de trabajo por proyecto y mes. Desde aquí puede generar facturas automáticamente.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Proyecto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Importe
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
                  {filteredClosings.map((closing) => (
                    <tr key={closing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{closing.project_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{closing.client_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getMonthName(closing.month)} {closing.year}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {closing.total_hours}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(closing.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          closing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          closing.status === 'invoiced' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {closing.status === 'pending' ? 'Pendiente' :
                           closing.status === 'invoiced' ? 'Facturado' : 'Cancelado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {closing.status === 'pending' && (
                          <button
                            onClick={() => {
                              setSelectedClosing(closing);
                              setShowClosingModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Generar Factura
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredClosings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay cierres mensuales registrados</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'config' && config && (
          <div className="p-6">
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Configuración de Facturación</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serie Facturas Normales
                  </label>
                  <input
                    type="text"
                    value={config.normal_series}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Último Número
                  </label>
                  <input
                    type="text"
                    value={config.current_normal_number}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serie Facturas Rectificativas
                  </label>
                  <input
                    type="text"
                    value={config.rectificative_series}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Último Número
                  </label>
                  <input
                    type="text"
                    value={config.current_rectificative_number}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IVA por defecto (%)
                  </label>
                  <input
                    type="number"
                    value={config.default_iva_rate}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retención de Garantía por defecto (%)
                  </label>
                  <input
                    type="number"
                    value={config.default_guarantee_rate}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 mt-8">Datos de la Empresa</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razón Social
                </label>
                <input
                  type="text"
                  value={config.company_name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CIF
                  </label>
                  <input
                    type="text"
                    value={config.company_cif}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={config.company_phone}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={config.company_address}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Nueva Factura</h3>
                <button
                  onClick={() => {
                    setShowInvoiceModal(false);
                    resetInvoiceForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente *
                  </label>
                  <select
                    value={invoiceForm.client_id}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, client_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccione cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proyecto (opcional)
                  </label>
                  <select
                    value={invoiceForm.project_id}
                    onChange={(e) => {
                      const projectId = e.target.value;
                      setInvoiceForm({ ...invoiceForm, project_id: projectId });
                      if (projectId) {
                        loadLastProjectInvoice(projectId);
                      } else {
                        setLastProjectInvoice(null);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sin proyecto</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {lastProjectInvoice && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-900">Factura anterior encontrada</h4>
                      </div>
                      <p className="text-sm text-blue-700 mb-2">
                        <strong>Nº:</strong> {lastProjectInvoice.invoice_number} |
                        <strong> Fecha:</strong> {lastProjectInvoice.issue_date} |
                        <strong> Total:</strong> {formatCurrency(lastProjectInvoice.total)}
                      </p>
                      <p className="text-xs text-blue-600">
                        Puede duplicar esta factura para crear la del mes actual. Las cantidades previas se actualizarán automáticamente.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={duplicateLastInvoice}
                      disabled={loadingLastInvoice}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingLastInvoice ? 'animate-spin' : ''}`} />
                      <span>Duplicar Factura</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Factura
                  </label>
                  <select
                    value={invoiceForm.invoice_type}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="normal">Normal</option>
                    <option value="isp">Inversión Sujeto Pasivo</option>
                    <option value="rectificative">Rectificativa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Emisión
                  </label>
                  <input
                    type="date"
                    value={invoiceForm.issue_date}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, issue_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forma de Pago
                  </label>
                  <select
                    value={invoiceForm.payment_method_label}
                    onChange={(e) => {
                      const selectedOption = e.target.value;
                      let days = 30;
                      if (selectedOption.includes('60 DIAS')) days = 60;
                      else if (selectedOption.includes('90 DIAS')) days = 90;
                      else if (selectedOption.includes('120 DIAS')) days = 120;
                      else if (selectedOption.includes('30 DIAS')) days = 30;

                      setInvoiceForm({
                        ...invoiceForm,
                        payment_method_label: selectedOption,
                        payment_days: days
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="TRANSFERENCIA BANCARIA 30 DIAS">TRANSFERENCIA BANCARIA 30 DIAS</option>
                    <option value="CONFIRMING BANCARIO 30 DIAS">CONFIRMING BANCARIO 30 DIAS</option>
                    <option value="CONFIRMING BANCARIO 60 DIAS">CONFIRMING BANCARIO 60 DIAS</option>
                    <option value="CONFIRMING BANCARIO 90 DIAS">CONFIRMING BANCARIO 90 DIAS</option>
                    <option value="CONFIRMING BANCARIO 120 DIAS">CONFIRMING BANCARIO 120 DIAS</option>
                    <option value="PAGARE 90 DIAS">PAGARE 90 DIAS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IVA (%)
                  </label>
                  <input
                    type="number"
                    value={invoiceForm.is_isp ? 0 : invoiceForm.iva_rate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, iva_rate: parseFloat(e.target.value) })}
                    disabled={invoiceForm.is_isp}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  {invoiceForm.is_isp && (
                    <p className="text-xs text-gray-500 mt-1">Desactivado por ISP</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={invoiceForm.has_guarantee}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, has_guarantee: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Retención de garantía</span>
                  </label>
                  {invoiceForm.has_guarantee && (
                    <input
                      type="number"
                      value={invoiceForm.guarantee_rate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, guarantee_rate: parseFloat(e.target.value) })}
                      placeholder="% Garantía"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Líneas de Factura (Certificación a Origen)
                  </label>
                  <button
                    onClick={addInvoiceLine}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Añadir línea
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-300 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-r">Concepto</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-r">Unidad</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 border-r">Origen</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 border-r">Anterior</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700 border-r">Actual</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 border-r">Precio</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 border-r">Dto %</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-700 border-r">Importe</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-700"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceForm.lines.map((line, index) => {
                        const currentQty = (line.origin_quantity || 0) - (line.previous_quantity || 0);
                        const lineSubtotal = currentQty * (line.unit_price || 0);
                        const discount = lineSubtotal * ((line.discount_rate || 0) / 100);
                        const lineTotal = lineSubtotal - discount;

                        return (
                          <tr key={index} className="border-t">
                            <td className="px-3 py-2 border-r">
                              <input
                                type="text"
                                placeholder="Descripción del concepto"
                                value={line.description}
                                onChange={(e) => updateInvoiceLine(index, 'description', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2 border-r">
                              <input
                                type="text"
                                placeholder="ud"
                                value={line.unit || 'ud'}
                                onChange={(e) => updateInvoiceLine(index, 'unit', e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-3 py-2 border-r">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={line.origin_quantity || 0}
                                onChange={(e) => updateInvoiceLine(index, 'origin_quantity', parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-center"
                              />
                            </td>
                            <td className="px-3 py-2 border-r">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={line.previous_quantity || 0}
                                onChange={(e) => updateInvoiceLine(index, 'previous_quantity', parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-center"
                              />
                            </td>
                            <td className="px-3 py-2 border-r bg-blue-50">
                              <div className="w-24 px-2 py-1 text-center font-semibold text-blue-700">
                                {currentQty.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-3 py-2 border-r">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={line.unit_price || 0}
                                onChange={(e) => updateInvoiceLine(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-right"
                              />
                            </td>
                            <td className="px-3 py-2 border-r">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0"
                                value={line.discount_rate || 0}
                                onChange={(e) => updateInvoiceLine(index, 'discount_rate', parseFloat(e.target.value) || 0)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 text-right"
                              />
                            </td>
                            <td className="px-3 py-2 border-r bg-green-50">
                              <div className="w-28 px-2 py-1 text-right font-semibold text-green-700">
                                {formatCurrency(lineTotal)}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              {invoiceForm.lines.length > 1 && (
                                <button
                                  onClick={() => removeInvoiceLine(index)}
                                  className="text-red-600 hover:text-red-700"
                                  title="Eliminar línea"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <strong>Nota:</strong> El sistema de certificación a origen calcula automáticamente la cantidad actual restando:
                    <span className="font-mono text-blue-700"> Actual = Origen - Anterior</span>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  resetInvoiceForm();
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateInvoice}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crear Factura
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Registrar Cobro</h3>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedInvoice(null);
                    resetPaymentForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Factura: {selectedInvoice.invoice_number}</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  Pendiente: {formatCurrency(selectedInvoice.pending_amount)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Cobro *
                </label>
                <input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Importe *
                </label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pago *
                </label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="transfer">Transferencia</option>
                  <option value="check">Cheque</option>
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia
                </label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Número de transferencia, cheque, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Notas adicionales..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedInvoice(null);
                  resetPaymentForm();
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddPayment}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Registrar Cobro
              </button>
            </div>
          </div>
        </div>
      )}

      {showClosingModal && selectedClosing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Generar Factura</h3>
                <button
                  onClick={() => {
                    setShowClosingModal(false);
                    setSelectedClosing(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Proyecto:</p>
                <p className="text-lg font-semibold text-gray-900">{selectedClosing.project_name}</p>
                <p className="text-sm text-gray-600 mt-2">Cliente:</p>
                <p className="font-medium text-gray-900">{selectedClosing.client_name}</p>
                <p className="text-sm text-gray-600 mt-2">Período:</p>
                <p className="font-medium text-gray-900">
                  {getMonthName(selectedClosing.month)} {selectedClosing.year}
                </p>
                <p className="text-sm text-gray-600 mt-2">Horas:</p>
                <p className="font-medium text-gray-900">{selectedClosing.total_hours}h</p>
                <p className="text-sm text-gray-600 mt-2">Importe:</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(selectedClosing.total_amount)}
                </p>
              </div>

              <p className="text-sm text-gray-600">
                Se generará una factura automáticamente con los datos de este cierre mensual.
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowClosingModal(false);
                  setSelectedClosing(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateClosing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Generar Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicingModule;
