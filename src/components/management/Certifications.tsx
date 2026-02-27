import React, { useState, useEffect } from 'react';
import {
  Award, Plus, Search, Edit, Trash2, Eye, Download, FileText, Copy,
  CheckCircle, X, Save, Calendar, DollarSign, TrendingUp, AlertCircle,
  FileSignature, User, Send, ChevronDown, ChevronRight, Clock, Building,
  Calculator, Percent, MinusCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  Certification,
  CertificationItem,
  CertificationSignature,
  CertificationWithDetails,
  CertificationSummary,
  CertificationFormData,
  CertificationStatus,
  SignatureRole
} from '../../types/certifications';
import { Project } from '../../types/construction';
import { exportToExcel } from '../../utils/exportUtils';

interface CertificationsProps {
  selectedProject?: Project | null;
}

const Certifications: React.FC<CertificationsProps> = ({ selectedProject }) => {
  const [activeView, setActiveView] = useState<'list' | 'form' | 'detail' | 'economic-control'>('list');
  const [certifications, setCertifications] = useState<CertificationSummary[]>([]);
  const [selectedCertification, setSelectedCertification] = useState<CertificationWithDetails | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>(selectedProject?.id || '');
  const [expandedCerts, setExpandedCerts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<CertificationStatus | 'all'>('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [editingCert, setEditingCert] = useState<Certification | null>(null);

  const [certForm, setCertForm] = useState<CertificationFormData>({
    project_id: '',
    certification_number: '',
    certification_code: '',
    contractor: '',
    issue_date: new Date().toISOString().split('T')[0],
    period_start: new Date().toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
    retention_percentage: 5,
    discount_amount: 0,
    notes: ''
  });

  const [certItems, setCertItems] = useState<any[]>([]);
  const [availableMeasurementItems, setAvailableMeasurementItems] = useState<any[]>([]);

  const statusLabels = {
    draft: 'Borrador',
    validated: 'Validada',
    certified: 'Certificada',
    rejected: 'Rechazada'
  };

  const roleLabels = {
    site_manager: 'Jefe de Obra',
    technician: 'Técnico',
    client: 'Cliente',
    director: 'Director de Obra'
  };

  useEffect(() => {
    if (currentProjectId) {
      loadData();
    }
  }, [currentProjectId]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (error) {
      showNotification('Error al cargar proyectos: ' + error.message, 'error');
      return;
    }

    const transformedProjects: Project[] = (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      code: p.code || '',
      description: p.description || '',
      client: p.client_name || '',
      location: p.location || '',
      status: p.status,
      startDate: p.start_date || '',
      endDate: p.end_date || '',
      budget: p.total_budget || 0,
      contractValue: p.total_budget || 0
    }));

    setProjects(transformedProjects);

    if (!currentProjectId && transformedProjects.length > 0) {
      setCurrentProjectId(transformedProjects[0].id);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('certification_summary')
        .select('*')
        .eq('project_id', currentProjectId)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      setCertifications(data || []);
    } catch (error: any) {
      showNotification('Error al cargar datos: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMeasurementItems = async (projectId: string) => {
    const { data: chapters } = await supabase
      .from('measurement_chapters')
      .select('id, chapter_code, chapter_name')
      .eq('project_id', projectId)
      .order('display_order');

    if (!chapters) return;

    const itemsPromises = chapters.map(async (chapter) => {
      const { data: items } = await supabase
        .from('measurement_items')
        .select('*')
        .eq('chapter_id', chapter.id)
        .order('item_code');

      return (items || []).map(item => ({
        ...item,
        chapter_name: chapter.chapter_name
      }));
    });

    const allItems = (await Promise.all(itemsPromises)).flat();
    setAvailableMeasurementItems(allItems);
  };

  const handleNewCertification = () => {
    setCertForm({
      project_id: currentProjectId,
      certification_number: '',
      certification_code: '',
      contractor: '',
      issue_date: new Date().toISOString().split('T')[0],
      period_start: new Date().toISOString().split('T')[0],
      period_end: new Date().toISOString().split('T')[0],
      retention_percentage: 5,
      discount_amount: 0,
      notes: ''
    });
    setCertItems([]);
    setEditingCert(null);
    loadMeasurementItems(currentProjectId);
    setActiveView('form');
  };

  const handleAddItems = () => {
    const selectedItems = availableMeasurementItems.filter((item: any) =>
      (document.getElementById(`item-${item.id}`) as HTMLInputElement)?.checked
    );

    const newItems = selectedItems.map((item: any) => ({
      measurement_item_id: item.id,
      item_code: item.item_code,
      description: item.description,
      unit_of_measure: item.unit_of_measure,
      unit_price: Number(item.budgeted_unit_price),
      budgeted_quantity: Number(item.budgeted_quantity),
      previous_quantity: 0,
      current_quantity: 0,
      accumulated_quantity: 0,
      percentage_executed: 0,
      previous_amount: 0,
      current_amount: 0,
      accumulated_amount: 0,
      observations: ''
    }));

    setCertItems([...certItems, ...newItems]);
  };

  const handleItemQuantityChange = (index: number, currentQty: number) => {
    const newItems = [...certItems];
    const item = newItems[index];

    item.current_quantity = currentQty;
    item.accumulated_quantity = item.previous_quantity + currentQty;
    item.current_amount = currentQty * item.unit_price;
    item.accumulated_amount = item.accumulated_quantity * item.unit_price;
    item.percentage_executed = item.budgeted_quantity > 0
      ? (item.accumulated_quantity / item.budgeted_quantity * 100)
      : 0;

    setCertItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setCertItems(certItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const totalAmount = certItems.reduce((sum, item) => sum + item.current_amount, 0);
    const retentionAmount = totalAmount * (certForm.retention_percentage / 100);
    const netAmount = totalAmount - retentionAmount - certForm.discount_amount;

    return { totalAmount, retentionAmount, netAmount };
  };

  const handleSaveCertification = async () => {
    if (!certForm.certification_number || !certForm.contractor) {
      showNotification('Complete los campos obligatorios', 'error');
      return;
    }

    if (certItems.length === 0) {
      showNotification('Debe agregar al menos una partida', 'error');
      return;
    }

    try {
      const totals = calculateTotals();

      const certData = {
        ...certForm,
        total_amount: totals.totalAmount,
        retention_amount: totals.retentionAmount,
        net_amount: totals.netAmount,
        accumulated_amount: certItems.reduce((sum, item) => sum + item.accumulated_amount, 0),
        created_by: 'Admin'
      };

      const { data: cert, error: certError } = await supabase
        .from('certifications')
        .insert(certData)
        .select()
        .single();

      if (certError) throw certError;

      const itemsData = certItems.map(item => ({
        certification_id: cert.id,
        ...item
      }));

      const { error: itemsError } = await supabase
        .from('certification_items')
        .insert(itemsData);

      if (itemsError) throw itemsError;

      await supabase.from('certification_history').insert({
        certification_id: cert.id,
        action: 'created',
        changed_by: 'Admin',
        changes: `Certificación ${certForm.certification_number} creada`,
        changed_at: new Date().toISOString()
      });

      const requiredSignatures = [
        { role: 'site_manager', name: 'Jefe de Obra' },
        { role: 'technician', name: 'Técnico' },
        { role: 'client', name: 'Cliente' }
      ];

      await Promise.all(requiredSignatures.map(sig =>
        supabase.from('certification_signatures').insert({
          certification_id: cert.id,
          role: sig.role,
          signer_name: sig.name,
          status: 'pending'
        })
      ));

      showNotification('Certificación creada correctamente', 'success');
      setActiveView('list');
      loadData();
    } catch (error: any) {
      showNotification('Error al guardar: ' + error.message, 'error');
    }
  };

  const handleDuplicateCertification = async (certId: string) => {
    try {
      const { data: cert } = await supabase
        .from('certifications')
        .select('*')
        .eq('id', certId)
        .single();

      const { data: items } = await supabase
        .from('certification_items')
        .select('*')
        .eq('certification_id', certId);

      if (!cert || !items) return;

      const newCertNumber = prompt('Número de la nueva certificación:');
      if (!newCertNumber) return;

      const newCertData = {
        ...cert,
        id: undefined,
        certification_number: newCertNumber,
        issue_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        created_at: undefined,
        updated_at: undefined
      };

      const { data: newCert, error: certError } = await supabase
        .from('certifications')
        .insert(newCertData)
        .select()
        .single();

      if (certError) throw certError;

      const newItemsData = items.map(item => {
        const previousQty = item.accumulated_quantity;
        return {
          ...item,
          id: undefined,
          certification_id: newCert.id,
          previous_quantity: previousQty,
          current_quantity: 0,
          accumulated_quantity: previousQty,
          previous_amount: item.accumulated_amount,
          current_amount: 0,
          created_at: undefined
        };
      });

      await supabase.from('certification_items').insert(newItemsData);

      await supabase.from('certification_history').insert({
        certification_id: newCert.id,
        action: 'duplicated',
        changed_by: 'Admin',
        changes: `Duplicada desde certificación ${cert.certification_number}`,
        changed_at: new Date().toISOString()
      });

      showNotification('Certificación duplicada correctamente', 'success');
      loadData();
    } catch (error: any) {
      showNotification('Error al duplicar: ' + error.message, 'error');
    }
  };

  const handleViewDetail = async (certId: string) => {
    try {
      const { data: cert } = await supabase
        .from('certifications')
        .select('*, projects(name)')
        .eq('id', certId)
        .single();

      const { data: items } = await supabase
        .from('certification_items')
        .select('*')
        .eq('certification_id', certId)
        .order('item_code');

      const { data: signatures } = await supabase
        .from('certification_signatures')
        .select('*')
        .eq('certification_id', certId);

      const { data: documents } = await supabase
        .from('certification_documents')
        .select('*')
        .eq('certification_id', certId);

      const { data: history } = await supabase
        .from('certification_history')
        .select('*')
        .eq('certification_id', certId)
        .order('changed_at', { ascending: false });

      if (cert) {
        setSelectedCertification({
          ...cert,
          project_name: (cert as any).projects?.name || '',
          items: items || [],
          signatures: signatures || [],
          documents: documents || [],
          history: history || []
        });
        setActiveView('detail');
      }
    } catch (error: any) {
      showNotification('Error al cargar detalle: ' + error.message, 'error');
    }
  };

  const handleSign = async (signatureId: string) => {
    const signerName = prompt('Ingrese su nombre para firmar:');
    if (!signerName) return;

    try {
      const { error } = await supabase
        .from('certification_signatures')
        .update({
          status: 'signed',
          signer_name: signerName,
          signature_date: new Date().toISOString()
        })
        .eq('id', signatureId);

      if (error) throw error;

      showNotification('Firmado correctamente', 'success');
      if (selectedCertification) {
        handleViewDetail(selectedCertification.id);
      }
    } catch (error: any) {
      showNotification('Error al firmar: ' + error.message, 'error');
    }
  };

  const handleValidate = async (certId: string) => {
    if (!confirm('¿Validar esta certificación?')) return;

    try {
      const { error } = await supabase
        .from('certifications')
        .update({ status: 'validated' })
        .eq('id', certId);

      if (error) throw error;

      await supabase.from('certification_history').insert({
        certification_id: certId,
        action: 'validated',
        changed_by: 'Admin',
        changes: 'Certificación validada',
        changed_at: new Date().toISOString()
      });

      showNotification('Certificación validada', 'success');
      loadData();
      if (selectedCertification) {
        handleViewDetail(certId);
      }
    } catch (error: any) {
      showNotification('Error al validar: ' + error.message, 'error');
    }
  };

  const handleCertify = async (certId: string) => {
    if (!confirm('¿Certificar definitivamente? Esta acción no se puede deshacer.')) return;

    try {
      const { error } = await supabase
        .from('certifications')
        .update({ status: 'certified' })
        .eq('id', certId);

      if (error) throw error;

      await supabase.from('certification_history').insert({
        certification_id: certId,
        action: 'certified',
        changed_by: 'Admin',
        changes: 'Certificación certificada definitivamente',
        changed_at: new Date().toISOString()
      });

      showNotification('Certificación certificada', 'success');
      loadData();
      if (selectedCertification) {
        handleViewDetail(certId);
      }
    } catch (error: any) {
      showNotification('Error al certificar: ' + error.message, 'error');
    }
  };

  const handleDelete = async (certId: string) => {
    if (!confirm('¿Eliminar esta certificación?')) return;

    try {
      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', certId);

      if (error) throw error;

      showNotification('Certificación eliminada', 'success');
      loadData();
      setActiveView('list');
    } catch (error: any) {
      showNotification('Error al eliminar: ' + error.message, 'error');
    }
  };

  const handleExportCertification = (cert: CertificationSummary) => {
    showNotification('Exportación a PDF en desarrollo', 'error');
  };

  const handleExportToExcel = async (certId: string) => {
    const { data: items } = await supabase
      .from('certification_items')
      .select('*')
      .eq('certification_id', certId);

    if (!items) return;

    const exportData = items.map(item => ({
      'Código': item.item_code,
      'Descripción': item.description,
      'Unidad': item.unit_of_measure,
      'P. Unit.': item.unit_price,
      'Presup.': item.budgeted_quantity,
      'Ant. Acum.': item.previous_quantity,
      'Actual': item.current_quantity,
      'Total Acum.': item.accumulated_quantity,
      '% Ejec.': item.percentage_executed.toFixed(2),
      'Importe Actual': item.current_amount,
      'Importe Acum.': item.accumulated_amount
    }));

    const cert = certifications.find(c => c.certification_id === certId);
    exportToExcel({
      title: `Certificación ${cert?.certification_number}`,
      headers: Object.keys(exportData[0] || {}),
      data: exportData,
      filename: `certificacion_${cert?.certification_number}`
    });
  };

  const toggleCertExpansion = (certId: string) => {
    const newExpanded = new Set(expandedCerts);
    if (newExpanded.has(certId)) {
      newExpanded.delete(certId);
    } else {
      newExpanded.add(certId);
    }
    setExpandedCerts(newExpanded);
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const getStatusBadge = (status: CertificationStatus) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      validated: 'bg-blue-100 text-blue-800',
      certified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  const filteredCertifications = certifications.filter(cert => {
    const matchesSearch = cert.certification_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.contractor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: 'Total Certificaciones',
      value: certifications.length.toString(),
      icon: Award,
      color: 'text-blue-600'
    },
    {
      label: 'Certificadas',
      value: certifications.filter(c => c.status === 'certified').length.toString(),
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      label: 'En Borrador',
      value: certifications.filter(c => c.status === 'draft').length.toString(),
      icon: FileText,
      color: 'text-gray-600'
    },
    {
      label: 'Importe Total',
      value: `€${certifications.filter(c => c.status === 'certified').reduce((sum, c) => sum + Number(c.total_amount), 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600'
    }
  ];

  if (activeView === 'form') {
    const totals = calculateTotals();

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
            <h3 className="text-2xl font-bold text-gray-900">Nueva Certificación de Obra</h3>
            <p className="text-gray-600">Registro de trabajos ejecutados y certificados</p>
          </div>
          <button
            onClick={() => setActiveView('list')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="border-b pb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Datos de la Certificación</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número de Certificación *</label>
                <input
                  type="text"
                  value={certForm.certification_number}
                  onChange={(e) => setCertForm({ ...certForm, certification_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="CERT-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Código Interno</label>
                <input
                  type="text"
                  value={certForm.certification_code}
                  onChange={(e) => setCertForm({ ...certForm, certification_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="CRT-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contratista/Empresa *</label>
                <input
                  type="text"
                  value={certForm.contractor}
                  onChange={(e) => setCertForm({ ...certForm, contractor: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Empresa Constructora SA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Emisión</label>
                <input
                  type="date"
                  value={certForm.issue_date}
                  onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Período Inicio</label>
                <input
                  type="date"
                  value={certForm.period_start}
                  onChange={(e) => setCertForm({ ...certForm, period_start: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Período Fin</label>
                <input
                  type="date"
                  value={certForm.period_end}
                  onChange={(e) => setCertForm({ ...certForm, period_end: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Retención (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={certForm.retention_percentage}
                  onChange={(e) => setCertForm({ ...certForm, retention_percentage: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descuentos (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={certForm.discount_amount}
                  onChange={(e) => setCertForm({ ...certForm, discount_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                <textarea
                  value={certForm.notes}
                  onChange={(e) => setCertForm({ ...certForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Observaciones generales..."
                />
              </div>
            </div>
          </div>

          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Partidas Certificadas</h4>
              <button
                onClick={() => {
                  const modal = document.getElementById('items-modal');
                  if (modal) modal.style.display = 'block';
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Agregar Partidas
              </button>
            </div>

            {certItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Presup.</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Ant.</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acum.</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Importe</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {certItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm font-medium">{item.item_code}</td>
                        <td className="px-4 py-2 text-sm">{item.description}</td>
                        <td className="px-4 py-2 text-sm text-right">{item.budgeted_quantity} {item.unit_of_measure}</td>
                        <td className="px-4 py-2 text-sm text-right">{item.previous_quantity}</td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            step="0.001"
                            value={item.current_quantity}
                            onChange={(e) => handleItemQuantityChange(index, parseFloat(e.target.value) || 0)}
                            className="w-24 px-2 py-1 text-sm text-right border border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm text-right font-medium">{item.accumulated_quantity.toFixed(3)}</td>
                        <td className="px-4 py-2 text-sm text-right font-medium">€{item.current_amount.toFixed(2)}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No hay partidas agregadas. Haga clic en "Agregar Partidas" para comenzar.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Bruto</p>
              <p className="text-2xl font-bold text-gray-900">€{totals.totalAmount.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Retención ({certForm.retention_percentage}%)</p>
              <p className="text-2xl font-bold text-red-600">-€{totals.retentionAmount.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Descuentos</p>
              <p className="text-2xl font-bold text-red-600">-€{certForm.discount_amount.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Neto</p>
              <p className="text-2xl font-bold text-green-600">€{totals.netAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              onClick={() => setActiveView('list')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveCertification}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-5 h-5" />
              Guardar Certificación
            </button>
          </div>
        </div>

        <div id="items-modal" className="fixed inset-0 bg-black bg-opacity-50 hidden z-50" style={{ display: 'none' }}>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Seleccionar Partidas del Presupuesto</h3>
                  <button
                    onClick={() => {
                      const modal = document.getElementById('items-modal');
                      if (modal) modal.style.display = 'none';
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-96">
                {availableMeasurementItems.length > 0 ? (
                  <div className="space-y-2">
                    {availableMeasurementItems.map((item: any) => (
                      <label key={item.id} className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          id={`item-${item.id}`}
                          className="w-4 h-4 mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{item.item_code} - {item.description}</div>
                          <div className="text-sm text-gray-500">
                            {item.chapter_name} | {item.budgeted_quantity} {item.unit_of_measure} | €{item.budgeted_unit_price}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No hay partidas disponibles en el presupuesto</p>
                )}
              </div>
              <div className="p-6 border-t">
                <button
                  onClick={() => {
                    handleAddItems();
                    const modal = document.getElementById('items-modal');
                    if (modal) modal.style.display = 'none';
                  }}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Agregar Partidas Seleccionadas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'detail' && selectedCertification) {
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
            <h3 className="text-2xl font-bold text-gray-900">Detalle de Certificación</h3>
            <p className="text-gray-600">{selectedCertification.certification_number} - {selectedCertification.contractor}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveView('list')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Volver
            </button>
            <button
              onClick={() => handleExportToExcel(selectedCertification.id)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            {selectedCertification.status === 'draft' && (
              <button
                onClick={() => handleValidate(selectedCertification.id)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <CheckCircle className="w-4 h-4" />
                Validar
              </button>
            )}
            {selectedCertification.status === 'validated' && (
              <button
                onClick={() => handleCertify(selectedCertification.id)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Award className="w-4 h-4" />
                Certificar
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Proyecto</p>
              <p className="font-semibold">{selectedCertification.project_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Período</p>
              <p className="font-semibold">{selectedCertification.period_start} / {selectedCertification.period_end}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Fecha Emisión</p>
              <p className="font-semibold">{selectedCertification.issue_date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Estado</p>
              {getStatusBadge(selectedCertification.status)}
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold mb-4">Partidas Certificadas</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">P. Unit.</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Anterior</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Actual</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acumulado</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">% Ejec.</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Importe</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedCertification.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 text-sm font-medium">{item.item_code}</td>
                      <td className="px-4 py-2 text-sm">{item.description}</td>
                      <td className="px-4 py-2 text-sm text-right">€{item.unit_price.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-right">{item.previous_quantity} {item.unit_of_measure}</td>
                      <td className="px-4 py-2 text-sm text-right font-medium">{item.current_quantity} {item.unit_of_measure}</td>
                      <td className="px-4 py-2 text-sm text-right font-medium">{item.accumulated_quantity} {item.unit_of_measure}</td>
                      <td className="px-4 py-2 text-sm text-right">{item.percentage_executed.toFixed(1)}%</td>
                      <td className="px-4 py-2 text-sm text-right font-medium">€{item.current_amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h4 className="text-lg font-semibold mb-4">Resumen Económico</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Bruto</p>
                <p className="text-2xl font-bold text-gray-900">€{selectedCertification.total_amount.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Retención ({selectedCertification.retention_percentage}%)</p>
                <p className="text-2xl font-bold text-red-600">-€{selectedCertification.retention_amount.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Descuentos</p>
                <p className="text-2xl font-bold text-red-600">-€{selectedCertification.discount_amount.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Neto</p>
                <p className="text-2xl font-bold text-green-600">€{selectedCertification.net_amount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h4 className="text-lg font-semibold mb-4">Firmas y Autorizaciones</h4>
            <div className="space-y-3">
              {selectedCertification.signatures.map((sig) => (
                <div key={sig.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="font-medium">{roleLabels[sig.role]}</p>
                      <p className="text-sm text-gray-600">{sig.signer_name}</p>
                      {sig.signature_date && (
                        <p className="text-xs text-gray-500">Firmado: {new Date(sig.signature_date).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    {sig.status === 'pending' ? (
                      <button
                        onClick={() => handleSign(sig.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <FileSignature className="w-4 h-4" />
                        Firmar
                      </button>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Firmado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedCertification.notes && (
            <div className="border-t pt-6 mt-6">
              <h4 className="text-lg font-semibold mb-2">Notas</h4>
              <p className="text-gray-700">{selectedCertification.notes}</p>
            </div>
          )}
        </div>
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
          <h2 className="text-2xl font-bold text-gray-900">Certificaciones de Obra</h2>
          <p className="text-gray-600">Registro y control de certificaciones de trabajos ejecutados</p>
        </div>
        <button
          onClick={handleNewCertification}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Nueva Certificación
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por número o contratista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <select
            value={currentProjectId}
            onChange={(e) => setCurrentProjectId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-4 py-2 rounded-lg ${filterStatus === 'draft' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Borrador
          </button>
          <button
            onClick={() => setFilterStatus('validated')}
            className={`px-4 py-2 rounded-lg ${filterStatus === 'validated' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Validadas
          </button>
          <button
            onClick={() => setFilterStatus('certified')}
            className={`px-4 py-2 rounded-lg ${filterStatus === 'certified' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Certificadas
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando certificaciones...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCertifications.map(cert => (
            <div key={cert.certification_id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-4">
                  <Award className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {cert.certification_number}
                    </h3>
                    <p className="text-sm text-gray-600">{cert.contractor} | {cert.issue_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Certificado</p>
                    <p className="text-xl font-bold text-gray-900">€{cert.total_amount.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Neto a Pagar</p>
                    <p className="text-xl font-bold text-green-600">€{cert.net_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    {getStatusBadge(cert.status)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetail(cert.certification_id)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Ver detalle"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDuplicateCertification(cert.certification_id)}
                      className="text-purple-600 hover:text-purple-800"
                      title="Duplicar"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleExportToExcel(cert.certification_id)}
                      className="text-green-600 hover:text-green-800"
                      title="Exportar Excel"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    {cert.status === 'draft' && (
                      <button
                        onClick={() => handleDelete(cert.certification_id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-white">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Partidas: </span>
                    <span className="font-medium">{cert.total_items}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Retención: </span>
                    <span className="font-medium">€{cert.retention_amount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Firmas: </span>
                    <span className="font-medium">{cert.signed_count}/{cert.total_signatures_required}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Período: </span>
                    <span className="font-medium">{cert.period_start} - {cert.period_end}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredCertifications.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No hay certificaciones creadas</p>
              <button
                onClick={handleNewCertification}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Crear primera certificación
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Certifications;