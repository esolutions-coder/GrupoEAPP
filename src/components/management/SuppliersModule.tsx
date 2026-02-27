import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck, Plus, Search, Edit, Trash2, Eye, X, Save,
  Building2, DollarSign, FileText, Package, Truck, FileCheck,
  AlertCircle, MessageSquare, Calendar, Download, Upload, Star
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { exportToPDF, exportToExcel, printTable, parseExcelFile } from '../../utils/exportUtils';
import { showSuccessNotification, showErrorNotification } from '../../utils/modalUtils';
import { formatCurrency } from '../../utils/formatUtils';
import {
  SupplierFormModal,
  ViewModal,
  ImportModal,
  InfoTab,
  GenericDataTable
} from './SuppliersForms';

interface Supplier {
  id: string;
  supplier_code: string;
  commercial_name: string;
  legal_name: string;
  cif_nif: string;
  category: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  payment_terms: number;
  bank_account: string;
  rating: number;
  certifications: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

interface Contract {
  id: string;
  supplier_id: string;
  contract_number: string;
  contract_type: string;
  start_date: string;
  end_date: string | null;
  total_amount: number;
  payment_terms: string;
  renewal_type: string;
  status: string;
  notes: string;
  document_url: string;
  created_at: string;
}

interface Order {
  id: string;
  supplier_id: string;
  order_number: string;
  order_date: string;
  expected_delivery: string | null;
  project_id: string | null;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_amount: number;
  tax_rate: number;
  total_with_tax: number;
  status: string;
  ordered_by: string;
  notes: string;
  created_at: string;
}

interface DeliveryNote {
  id: string;
  supplier_id: string;
  order_id: string | null;
  delivery_note_number: string;
  delivery_date: string;
  received_by: string;
  quantity_delivered: number;
  quantity_accepted: number;
  quantity_rejected: number;
  rejection_reason: string;
  quality_check: string;
  notes: string;
  document_url: string;
  created_at: string;
}

interface Invoice {
  id: string;
  supplier_id: string;
  order_id: string | null;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  description: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: string;
  payment_method: string;
  document_url: string;
  notes: string;
  created_at: string;
}

interface Payment {
  id: string;
  supplier_id: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference: string;
  approved_by: string;
  bank_account: string;
  notes: string;
  created_at: string;
}

interface Incident {
  id: string;
  supplier_id: string;
  order_id: string | null;
  incident_date: string;
  incident_type: string;
  severity: string;
  description: string;
  resolution: string;
  resolution_date: string | null;
  status: string;
  reported_by: string;
  assigned_to: string;
  created_at: string;
}

interface Note {
  id: string;
  supplier_id: string;
  note_type: string;
  note_date: string;
  title: string;
  content: string;
  priority: string;
  created_by: string;
  created_at: string;
}

const SuppliersModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'contracts' | 'orders' | 'invoices' | 'payments' | 'incidents' | 'notes'>('info');
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const [showContractForm, setShowContractForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingDelivery, setEditingDelivery] = useState<DeliveryNote | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [formData, setFormData] = useState({
    supplier_code: '',
    commercial_name: '',
    legal_name: '',
    cif_nif: '',
    category: 'Materiales',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'España',
    payment_terms: 30,
    bank_account: '',
    rating: 0,
    certifications: [] as string[],
    status: 'active'
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (selectedSupplier) {
      loadSupplierData(selectedSupplier.id);
    }
  }, [selectedSupplier, activeTab]);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error: any) {
      showErrorNotification('Error al cargar proveedores', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSupplierData = async (supplierId: string) => {
    try {
      if (activeTab === 'contracts') {
        const { data, error } = await supabase
          .from('supplier_contracts')
          .select('*')
          .eq('supplier_id', supplierId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setContracts(data || []);
      } else if (activeTab === 'orders') {
        const { data, error } = await supabase
          .from('supplier_orders')
          .select('*')
          .eq('supplier_id', supplierId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setOrders(data || []);
      } else if (activeTab === 'invoices') {
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('supplier_invoices')
          .select('*')
          .eq('supplier_id', supplierId)
          .order('created_at', { ascending: false });
        if (invoicesError) throw invoicesError;
        setInvoices(invoicesData || []);

        const { data: deliveryData, error: deliveryError } = await supabase
          .from('supplier_delivery_notes')
          .select('*')
          .eq('supplier_id', supplierId)
          .order('created_at', { ascending: false });
        if (deliveryError) throw deliveryError;
        setDeliveryNotes(deliveryData || []);
      } else if (activeTab === 'payments') {
        const { data, error } = await supabase
          .from('supplier_payments')
          .select('*')
          .eq('supplier_id', supplierId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPayments(data || []);
      } else if (activeTab === 'incidents') {
        const { data, error } = await supabase
          .from('supplier_incidents')
          .select('*')
          .eq('supplier_id', supplierId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setIncidents(data || []);
      } else if (activeTab === 'notes') {
        const { data, error } = await supabase
          .from('supplier_notes')
          .select('*')
          .eq('supplier_id', supplierId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setNotes(data || []);
      }
    } catch (error: any) {
      showErrorNotification('Error al cargar datos', error.message);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch =
      supplier.commercial_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.cif_nif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.supplier_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || supplier.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || supplier.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreate = () => {
    setFormData({
      supplier_code: `PROV-${Date.now()}`,
      commercial_name: '',
      legal_name: '',
      cif_nif: '',
      category: 'Materiales',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      postal_code: '',
      country: 'España',
      payment_terms: 30,
      bank_account: '',
      rating: 0,
      certifications: [],
      status: 'active'
    });
    setShowCreateModal(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      supplier_code: supplier.supplier_code,
      commercial_name: supplier.commercial_name,
      legal_name: supplier.legal_name || '',
      cif_nif: supplier.cif_nif || '',
      category: supplier.category,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      city: supplier.city || '',
      postal_code: supplier.postal_code || '',
      country: supplier.country || 'España',
      payment_terms: supplier.payment_terms || 30,
      bank_account: supplier.bank_account || '',
      rating: supplier.rating || 0,
      certifications: supplier.certifications || [],
      status: supplier.status
    });
    setShowEditModal(true);
  };

  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setActiveTab('info');
    setShowViewModal(true);
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('suppliers')
        .insert([formData]);

      if (error) throw error;

      showSuccessNotification('Proveedor creado correctamente');
      setShowCreateModal(false);
      loadSuppliers();
    } catch (error: any) {
      showErrorNotification('Error al crear proveedor', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', selectedSupplier.id);

      if (error) throw error;

      showSuccessNotification('Proveedor actualizado correctamente');
      setShowEditModal(false);
      loadSuppliers();
    } catch (error: any) {
      showErrorNotification('Error al actualizar proveedor', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!confirm(`¿Estás seguro de eliminar el proveedor ${supplier.commercial_name}?`)) return;

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplier.id);

      if (error) throw error;

      showSuccessNotification('Proveedor eliminado correctamente');
      loadSuppliers();
    } catch (error: any) {
      showErrorNotification('Error al eliminar proveedor', error.message);
    }
  };

  const handleSubmitContract = async (contractData: any) => {
    if (!selectedSupplier) return;

    try {
      setIsLoading(true);
      const data = {
        ...contractData,
        supplier_id: selectedSupplier.id
      };

      if (editingContract) {
        const { error } = await supabase
          .from('supplier_contracts')
          .update(data)
          .eq('id', editingContract.id);
        if (error) throw error;
        showSuccessNotification('Contrato actualizado');
      } else {
        const { error } = await supabase
          .from('supplier_contracts')
          .insert([data]);
        if (error) throw error;
        showSuccessNotification('Contrato creado');
      }

      setShowContractForm(false);
      setEditingContract(null);
      loadSupplierData(selectedSupplier.id);
    } catch (error: any) {
      showErrorNotification('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm('¿Eliminar este contrato?')) return;

    try {
      const { error } = await supabase
        .from('supplier_contracts')
        .delete()
        .eq('id', contractId);

      if (error) throw error;
      showSuccessNotification('Contrato eliminado');
      if (selectedSupplier) loadSupplierData(selectedSupplier.id);
    } catch (error: any) {
      showErrorNotification('Error', error.message);
    }
  };

  const handleSubmitOrder = async (orderData: any) => {
    if (!selectedSupplier) return;

    try {
      setIsLoading(true);
      const totalWithTax = orderData.total_amount * (1 + orderData.tax_rate / 100);
      const data = {
        ...orderData,
        supplier_id: selectedSupplier.id,
        total_with_tax: totalWithTax
      };

      if (editingOrder) {
        const { error } = await supabase
          .from('supplier_orders')
          .update(data)
          .eq('id', editingOrder.id);
        if (error) throw error;
        showSuccessNotification('Orden actualizada');
      } else {
        const { error } = await supabase
          .from('supplier_orders')
          .insert([data]);
        if (error) throw error;
        showSuccessNotification('Orden creada');
      }

      setShowOrderForm(false);
      setEditingOrder(null);
      loadSupplierData(selectedSupplier.id);
    } catch (error: any) {
      showErrorNotification('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('¿Eliminar esta orden?')) return;

    try {
      const { error } = await supabase
        .from('supplier_orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      showSuccessNotification('Orden eliminada');
      if (selectedSupplier) loadSupplierData(selectedSupplier.id);
    } catch (error: any) {
      showErrorNotification('Error', error.message);
    }
  };

  const handleSubmitDelivery = async (deliveryData: any) => {
    if (!selectedSupplier) return;

    try {
      setIsLoading(true);
      const data = {
        ...deliveryData,
        supplier_id: selectedSupplier.id
      };

      if (editingDelivery) {
        const { error } = await supabase
          .from('supplier_delivery_notes')
          .update(data)
          .eq('id', editingDelivery.id);
        if (error) throw error;
        showSuccessNotification('Albarán actualizado');
      } else {
        const { error } = await supabase
          .from('supplier_delivery_notes')
          .insert([data]);
        if (error) throw error;
        showSuccessNotification('Albarán creado');
      }

      setShowDeliveryForm(false);
      setEditingDelivery(null);
      loadSupplierData(selectedSupplier.id);
    } catch (error: any) {
      showErrorNotification('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDelivery = async (deliveryId: string) => {
    if (!confirm('¿Eliminar este albarán?')) return;

    try {
      const { error } = await supabase
        .from('supplier_delivery_notes')
        .delete()
        .eq('id', deliveryId);

      if (error) throw error;
      showSuccessNotification('Albarán eliminado');
      if (selectedSupplier) loadSupplierData(selectedSupplier.id);
    } catch (error: any) {
      showErrorNotification('Error', error.message);
    }
  };

  const handleSubmitInvoice = async (invoiceData: any) => {
    if (!selectedSupplier) return;

    try {
      setIsLoading(true);
      const pendingAmount = invoiceData.total_amount - (invoiceData.paid_amount || 0);
      const data = {
        ...invoiceData,
        supplier_id: selectedSupplier.id,
        pending_amount: pendingAmount
      };

      if (editingInvoice) {
        const { error } = await supabase
          .from('supplier_invoices')
          .update(data)
          .eq('id', editingInvoice.id);
        if (error) throw error;
        showSuccessNotification('Factura actualizada');
      } else {
        const { error } = await supabase
          .from('supplier_invoices')
          .insert([data]);
        if (error) throw error;
        showSuccessNotification('Factura creada');
      }

      setShowInvoiceForm(false);
      setEditingInvoice(null);
      loadSupplierData(selectedSupplier.id);
    } catch (error: any) {
      showErrorNotification('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('¿Eliminar esta factura?')) return;

    try {
      const { error } = await supabase
        .from('supplier_invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;
      showSuccessNotification('Factura eliminada');
      if (selectedSupplier) loadSupplierData(selectedSupplier.id);
    } catch (error: any) {
      showErrorNotification('Error', error.message);
    }
  };

  const handleSubmitPayment = async (paymentData: any) => {
    if (!selectedSupplier) return;

    try {
      setIsLoading(true);
      const data = {
        ...paymentData,
        supplier_id: selectedSupplier.id
      };

      const { error } = await supabase
        .from('supplier_payments')
        .insert([data]);
      if (error) throw error;

      const invoice = invoices.find(inv => inv.id === paymentData.invoice_id);
      if (invoice) {
        const newPaidAmount = invoice.paid_amount + paymentData.amount;
        const newPendingAmount = invoice.total_amount - newPaidAmount;
        const newStatus = newPendingAmount <= 0 ? 'paid' : 'partial';

        await supabase
          .from('supplier_invoices')
          .update({
            paid_amount: newPaidAmount,
            pending_amount: newPendingAmount,
            status: newStatus
          })
          .eq('id', paymentData.invoice_id);
      }

      showSuccessNotification('Pago registrado');
      setShowPaymentForm(false);
      loadSupplierData(selectedSupplier.id);
    } catch (error: any) {
      showErrorNotification('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('¿Eliminar este pago?')) return;

    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      const { error } = await supabase
        .from('supplier_payments')
        .delete()
        .eq('id', paymentId);

      if (error) throw error;

      const invoice = invoices.find(inv => inv.id === payment.invoice_id);
      if (invoice) {
        const newPaidAmount = invoice.paid_amount - payment.amount;
        const newPendingAmount = invoice.total_amount - newPaidAmount;
        const newStatus = newPaidAmount <= 0 ? 'pending' : 'partial';

        await supabase
          .from('supplier_invoices')
          .update({
            paid_amount: newPaidAmount,
            pending_amount: newPendingAmount,
            status: newStatus
          })
          .eq('id', payment.invoice_id);
      }

      showSuccessNotification('Pago eliminado');
      if (selectedSupplier) loadSupplierData(selectedSupplier.id);
    } catch (error: any) {
      showErrorNotification('Error', error.message);
    }
  };

  const handleSubmitIncident = async (incidentData: any) => {
    if (!selectedSupplier) return;

    try {
      setIsLoading(true);
      const data = {
        ...incidentData,
        supplier_id: selectedSupplier.id
      };

      if (editingIncident) {
        const { error } = await supabase
          .from('supplier_incidents')
          .update(data)
          .eq('id', editingIncident.id);
        if (error) throw error;
        showSuccessNotification('Incidencia actualizada');
      } else {
        const { error } = await supabase
          .from('supplier_incidents')
          .insert([data]);
        if (error) throw error;
        showSuccessNotification('Incidencia creada');
      }

      setShowIncidentForm(false);
      setEditingIncident(null);
      loadSupplierData(selectedSupplier.id);
    } catch (error: any) {
      showErrorNotification('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIncident = async (incidentId: string) => {
    if (!confirm('¿Eliminar esta incidencia?')) return;

    try {
      const { error } = await supabase
        .from('supplier_incidents')
        .delete()
        .eq('id', incidentId);

      if (error) throw error;
      showSuccessNotification('Incidencia eliminada');
      if (selectedSupplier) loadSupplierData(selectedSupplier.id);
    } catch (error: any) {
      showErrorNotification('Error', error.message);
    }
  };

  const handleSubmitNote = async (noteData: any) => {
    if (!selectedSupplier) return;

    try {
      setIsLoading(true);
      const data = {
        ...noteData,
        supplier_id: selectedSupplier.id
      };

      if (editingNote) {
        const { error } = await supabase
          .from('supplier_notes')
          .update(data)
          .eq('id', editingNote.id);
        if (error) throw error;
        showSuccessNotification('Nota actualizada');
      } else {
        const { error } = await supabase
          .from('supplier_notes')
          .insert([data]);
        if (error) throw error;
        showSuccessNotification('Nota creada');
      }

      setShowNoteForm(false);
      setEditingNote(null);
      loadSupplierData(selectedSupplier.id);
    } catch (error: any) {
      showErrorNotification('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('¿Eliminar esta nota?')) return;

    try {
      const { error } = await supabase
        .from('supplier_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      showSuccessNotification('Nota eliminada');
      if (selectedSupplier) loadSupplierData(selectedSupplier.id);
    } catch (error: any) {
      showErrorNotification('Error', error.message);
    }
  };

  const handleExportPDF = () => {
    const exportData = {
      title: 'Listado de Proveedores - Grupo EA',
      headers: ['Código', 'Nombre Comercial', 'CIF/NIF', 'Categoría', 'Contacto', 'Teléfono', 'Email', 'Valoración', 'Estado'],
      data: filteredSuppliers.map(s => [
        s.supplier_code,
        s.commercial_name,
        s.cif_nif || 'N/A',
        s.category,
        s.contact_person || 'N/A',
        s.phone || 'N/A',
        s.email || 'N/A',
        `${s.rating}/5`,
        s.status === 'active' ? 'Activo' : 'Inactivo'
      ]),
      filename: `proveedores_${new Date().toISOString().split('T')[0]}`
    };
    exportToPDF(exportData);
  };

  const handleExportExcel = () => {
    const exportData = {
      title: 'Listado de Proveedores - Grupo EA',
      headers: ['Código', 'Nombre Comercial', 'Razón Social', 'CIF/NIF', 'Categoría', 'Contacto', 'Teléfono', 'Email', 'Dirección', 'Ciudad', 'CP', 'Plazo Pago', 'IBAN', 'Valoración', 'Certificaciones', 'Estado'],
      data: filteredSuppliers.map(s => [
        s.supplier_code,
        s.commercial_name,
        s.legal_name || '',
        s.cif_nif || '',
        s.category,
        s.contact_person || '',
        s.phone || '',
        s.email || '',
        s.address || '',
        s.city || '',
        s.postal_code || '',
        `${s.payment_terms} días`,
        s.bank_account || '',
        `${s.rating}/5`,
        (s.certifications || []).join(', '),
        s.status === 'active' ? 'Activo' : 'Inactivo'
      ]),
      filename: `proveedores_${new Date().toISOString().split('T')[0]}`
    };
    exportToExcel(exportData);
  };

  const handlePrint = () => {
    const exportData = {
      title: 'Listado de Proveedores - Grupo EA',
      headers: ['Código', 'Nombre Comercial', 'CIF/NIF', 'Categoría', 'Contacto', 'Teléfono', 'Estado'],
      data: filteredSuppliers.map(s => [
        s.supplier_code,
        s.commercial_name,
        s.cif_nif || 'N/A',
        s.category,
        s.contact_person || 'N/A',
        s.phone || 'N/A',
        s.status === 'active' ? 'Activo' : 'Inactivo'
      ]),
      filename: `proveedores_${new Date().toISOString().split('T')[0]}`
    };
    printTable(exportData);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setIsLoading(true);

    try {
      const result = await parseExcelFile(file);

      if (result.success && result.data) {
        setImportPreview(result.data);
        if (result.errors && result.errors.length > 0) {
          alert(`Advertencias:\n${result.errors.join('\n')}`);
        }
      } else {
        alert(result.message);
        setImportFile(null);
      }
    } catch (error) {
      alert('Error al leer el archivo');
      setImportFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportSuppliers = async () => {
    if (!importPreview || importPreview.length === 0) {
      alert('No hay datos para importar');
      return;
    }

    setIsLoading(true);
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      for (const row of importPreview) {
        try {
          const supplierData = {
            supplier_code: row['Código'] || row['Codigo'] || `PROV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            commercial_name: row['Nombre Comercial'] || row['Nombre'] || '',
            legal_name: row['Razón Social'] || row['Razon Social'] || '',
            cif_nif: row['CIF/NIF'] || row['CIF'] || '',
            category: row['Categoría'] || row['Categoria'] || 'Materiales',
            contact_person: row['Contacto'] || row['Persona de Contacto'] || '',
            phone: row['Teléfono'] || row['Telefono'] || '',
            email: row['Email'] || '',
            address: row['Dirección'] || row['Direccion'] || '',
            city: row['Ciudad'] || '',
            postal_code: row['Código Postal'] || row['Codigo Postal'] || row['CP'] || '',
            country: row['País'] || row['Pais'] || 'España',
            payment_terms: parseInt(row['Plazo Pago'] || row['Plazo de Pago'] || '30'),
            bank_account: row['IBAN'] || row['Cuenta Bancaria'] || '',
            rating: parseFloat(row['Valoración'] || row['Valoracion'] || row['Rating'] || '0'),
            certifications: (row['Certificaciones'] || '').split(',').map((c: string) => c.trim()).filter((c: string) => c),
            status: row['Estado'] === 'Activo' || row['Estado'] === 'active' ? 'active' : 'inactive'
          };

          const { error } = await supabase
            .from('suppliers')
            .insert([supplierData]);

          if (error) {
            errorCount++;
            errors.push(`${row['Nombre Comercial'] || row['Nombre']}: ${error.message}`);
          } else {
            successCount++;
          }
        } catch (err: any) {
          errorCount++;
          errors.push(`${row['Nombre Comercial'] || row['Nombre']}: ${err.message || 'Error desconocido'}`);
        }
      }

      let message = `Importación completada:\n${successCount} proveedores importados correctamente`;
      if (errorCount > 0) {
        message += `\n${errorCount} errores encontrados`;
        if (errors.length > 0) {
          message += `\n\nPrimeros errores:\n${errors.slice(0, 5).join('\n')}`;
        }
      }

      alert(message);
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview([]);
      loadSuppliers();
    } catch (error: any) {
      alert(`Error durante la importación: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = {
      title: 'Plantilla de Importación - Proveedores',
      headers: ['Código', 'Nombre Comercial', 'Razón Social', 'CIF/NIF', 'Categoría', 'Contacto', 'Teléfono', 'Email', 'Dirección', 'Ciudad', 'Código Postal', 'Plazo Pago', 'IBAN', 'Valoración', 'Certificaciones', 'Estado'],
      data: [
        ['PROV-001', 'Cementos Lafarge', 'Cementos Lafarge España S.A.', 'A12345678', 'Materiales', 'Pedro Martínez', '+34 961 234 567', 'contacto@lafarge.es', 'Polígono Industrial Sur', 'Valencia', '46001', '30', 'ES76 2100 0813 1234 5678 9012', '4.5', 'ISO 9001, CE', 'Activo']
      ],
      filename: 'plantilla_proveedores'
    };
    exportToExcel(templateData);
  };

  const stats = [
    { label: 'Total Proveedores', value: suppliers.length.toString(), icon: UserCheck, color: 'text-blue-600' },
    { label: 'Proveedores Activos', value: suppliers.filter(s => s.status === 'active').length.toString(), icon: Building2, color: 'text-green-600' },
    { label: 'Materiales', value: suppliers.filter(s => s.category === 'Materiales').length.toString(), icon: Package, color: 'text-orange-600' },
    { label: 'Equipos', value: suppliers.filter(s => s.category === 'Equipos').length.toString(), icon: Truck, color: 'text-blue-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Proveedores</h2>
          <p className="text-gray-600">Administra proveedores, contratos, facturas y pagos</p>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isLoading}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </button>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isLoading}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Excel</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Imprimir</span>
          </button>
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Importar</span>
          </button>
          <button
            type="button"
            onClick={handleCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Proveedor</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-12 w-12 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o CIF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todas las categorías</option>
            <option value="Materiales">Materiales</option>
            <option value="Equipos">Equipos</option>
            <option value="Servicios">Servicios</option>
            <option value="Subcontratos">Subcontratos</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full" id="suppliers-table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre Comercial</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIF/NIF</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valoración</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  Cargando proveedores...
                </td>
              </tr>
            ) : filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  No hay proveedores disponibles
                </td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {supplier.supplier_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{supplier.commercial_name}</div>
                    <div className="text-sm text-gray-500">{supplier.legal_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.cif_nif || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {supplier.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{supplier.contact_person || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{supplier.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-900">{supplier.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      supplier.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {supplier.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleView(supplier)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(supplier)}
                        className="text-green-600 hover:text-green-900"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(supplier)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <SupplierFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleSubmitCreate}
        formData={formData}
        setFormData={setFormData}
        isLoading={isLoading}
      />

      {/* Edit Modal */}
      <SupplierFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleSubmitEdit}
        formData={formData}
        setFormData={setFormData}
        isLoading={isLoading}
        isEdit={true}
      />

      {/* View Modal */}
      {selectedSupplier && (
        <ViewModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          supplier={selectedSupplier}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        >
          {activeTab === 'info' && <InfoTab supplier={selectedSupplier} />}

          {activeTab === 'contracts' && (
            <GenericDataTable
              title="Contratos"
              data={contracts}
              columns={[
                { key: 'contract_number', label: 'Número' },
                { key: 'contract_type', label: 'Tipo' },
                { key: 'start_date', label: 'Inicio' },
                { key: 'end_date', label: 'Fin', render: (val) => val || 'N/A' },
                { key: 'total_amount', label: 'Importe', render: (val) => formatCurrency(val) },
                {
                  key: 'status',
                  label: 'Estado',
                  render: (val) => (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      val === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {val === 'active' ? 'Activo' : val === 'expired' ? 'Expirado' : 'Cancelado'}
                    </span>
                  )
                }
              ]}
              onAdd={() => setShowContractForm(true)}
              onEdit={(item) => { setEditingContract(item); setShowContractForm(true); }}
              onDelete={handleDeleteContract}
              emptyMessage="No hay contratos registrados"
            />
          )}

          {activeTab === 'orders' && (
            <GenericDataTable
              title="Órdenes de Compra"
              data={orders}
              columns={[
                { key: 'order_number', label: 'Número' },
                { key: 'order_date', label: 'Fecha' },
                { key: 'description', label: 'Descripción' },
                { key: 'quantity', label: 'Cantidad', render: (val, item) => `${val} ${item.unit}` },
                { key: 'total_with_tax', label: 'Total', render: (val) => formatCurrency(val) },
                {
                  key: 'status',
                  label: 'Estado',
                  render: (val) => (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      val === 'delivered' ? 'bg-green-100 text-green-800' :
                      val === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      val === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {val === 'delivered' ? 'Entregado' : val === 'confirmed' ? 'Confirmado' : val === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                    </span>
                  )
                }
              ]}
              onAdd={() => setShowOrderForm(true)}
              onEdit={(item) => { setEditingOrder(item); setShowOrderForm(true); }}
              onDelete={handleDeleteOrder}
              emptyMessage="No hay órdenes registradas"
            />
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-6">
              <GenericDataTable
                title="Facturas"
                data={invoices}
                columns={[
                  { key: 'invoice_number', label: 'Número' },
                  { key: 'invoice_date', label: 'Fecha' },
                  { key: 'due_date', label: 'Vencimiento' },
                  { key: 'total_amount', label: 'Total', render: (val) => formatCurrency(val) },
                  { key: 'pending_amount', label: 'Pendiente', render: (val) => formatCurrency(val) },
                  {
                    key: 'status',
                    label: 'Estado',
                    render: (val) => (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        val === 'paid' ? 'bg-green-100 text-green-800' :
                        val === 'partial' ? 'bg-blue-100 text-blue-800' :
                        val === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {val === 'paid' ? 'Pagada' : val === 'partial' ? 'Parcial' : val === 'overdue' ? 'Vencida' : 'Pendiente'}
                      </span>
                    )
                  }
                ]}
                onAdd={() => setShowInvoiceForm(true)}
                onEdit={(item) => { setEditingInvoice(item); setShowInvoiceForm(true); }}
                onDelete={handleDeleteInvoice}
                emptyMessage="No hay facturas registradas"
              />

              <GenericDataTable
                title="Albaranes"
                data={deliveryNotes}
                columns={[
                  { key: 'delivery_note_number', label: 'Número' },
                  { key: 'delivery_date', label: 'Fecha' },
                  { key: 'received_by', label: 'Recibido por' },
                  { key: 'quantity_delivered', label: 'Entregado' },
                  { key: 'quantity_accepted', label: 'Aceptado' },
                  {
                    key: 'quality_check',
                    label: 'Control',
                    render: (val) => (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        val === 'approved' ? 'bg-green-100 text-green-800' :
                        val === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {val === 'approved' ? 'Aprobado' : val === 'rejected' ? 'Rechazado' : 'Parcial'}
                      </span>
                    )
                  }
                ]}
                onAdd={() => setShowDeliveryForm(true)}
                onEdit={(item) => { setEditingDelivery(item); setShowDeliveryForm(true); }}
                onDelete={handleDeleteDelivery}
                emptyMessage="No hay albaranes registrados"
              />
            </div>
          )}

          {activeTab === 'payments' && (
            <GenericDataTable
              title="Pagos"
              data={payments}
              columns={[
                { key: 'payment_date', label: 'Fecha' },
                { key: 'amount', label: 'Importe', render: (val) => formatCurrency(val) },
                { key: 'payment_method', label: 'Método', render: (val) => val === 'transfer' ? 'Transferencia' : val === 'check' ? 'Cheque' : val === 'cash' ? 'Efectivo' : 'Tarjeta' },
                { key: 'reference', label: 'Referencia' },
                { key: 'approved_by', label: 'Aprobado por' }
              ]}
              onAdd={() => setShowPaymentForm(true)}
              onDelete={handleDeletePayment}
              emptyMessage="No hay pagos registrados"
            />
          )}

          {activeTab === 'incidents' && (
            <GenericDataTable
              title="Incidencias"
              data={incidents}
              columns={[
                { key: 'incident_date', label: 'Fecha' },
                { key: 'incident_type', label: 'Tipo', render: (val) => val === 'quality' ? 'Calidad' : val === 'delivery' ? 'Entrega' : val === 'documentation' ? 'Documentación' : 'Otro' },
                { key: 'description', label: 'Descripción' },
                {
                  key: 'severity',
                  label: 'Severidad',
                  render: (val) => (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      val === 'critical' ? 'bg-red-100 text-red-800' :
                      val === 'high' ? 'bg-orange-100 text-orange-800' :
                      val === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {val === 'critical' ? 'Crítica' : val === 'high' ? 'Alta' : val === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  )
                },
                {
                  key: 'status',
                  label: 'Estado',
                  render: (val) => (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      val === 'closed' ? 'bg-gray-100 text-gray-800' :
                      val === 'resolved' ? 'bg-green-100 text-green-800' :
                      val === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {val === 'closed' ? 'Cerrada' : val === 'resolved' ? 'Resuelta' : val === 'in_progress' ? 'En proceso' : 'Abierta'}
                    </span>
                  )
                }
              ]}
              onAdd={() => setShowIncidentForm(true)}
              onEdit={(item) => { setEditingIncident(item); setShowIncidentForm(true); }}
              onDelete={handleDeleteIncident}
              emptyMessage="No hay incidencias registradas"
            />
          )}

          {activeTab === 'notes' && (
            <GenericDataTable
              title="Notas Internas"
              data={notes}
              columns={[
                { key: 'note_date', label: 'Fecha' },
                { key: 'title', label: 'Título' },
                { key: 'note_type', label: 'Tipo', render: (val) => val === 'alert' ? 'Alerta' : val === 'reminder' ? 'Recordatorio' : val === 'review' ? 'Revisión' : 'General' },
                {
                  key: 'priority',
                  label: 'Prioridad',
                  render: (val) => (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      val === 'high' ? 'bg-red-100 text-red-800' :
                      val === 'normal' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {val === 'high' ? 'Alta' : val === 'normal' ? 'Normal' : 'Baja'}
                    </span>
                  )
                },
                { key: 'created_by', label: 'Creado por' }
              ]}
              onAdd={() => setShowNoteForm(true)}
              onEdit={(item) => { setEditingNote(item); setShowNoteForm(true); }}
              onDelete={handleDeleteNote}
              emptyMessage="No hay notas registradas"
            />
          )}
        </ViewModal>
      )}

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportFile(null);
          setImportPreview([]);
        }}
        onDownloadTemplate={downloadTemplate}
        onFileSelect={handleFileSelect}
        onImport={handleImportSuppliers}
        importPreview={importPreview}
        isLoading={isLoading}
        fileInputRef={fileInputRef}
      />

    </div>
  );
};

export default SuppliersModule;
