import React, { useState, useEffect } from 'react';
import { FileCheck, Plus, Search, Edit, Trash2, Eye, Download, Save, X, Calendar, Building2, Euro, CheckCircle, AlertTriangle, Clock, Upload, Filter, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { showSuccessNotification, showErrorNotification } from '../../utils/modalUtils';
import { formatCurrency } from '../../utils/formatUtils';
import * as XLSX from 'xlsx';

interface Certification {
  id: string;
  project_id: string;
  project_name?: string;
  certification_number: string;
  issue_date: string;
  period_start: string;
  period_end: string;
  status: 'draft' | 'certified' | 'approved' | 'invoiced';
  base_amount: number;
  iva_amount: number;
  retention_amount: number;
  net_amount: number;
  accumulated_amount: number;
  previous_accumulated: number;
  iva_rate: number;
  retention_rate: number;
  description: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

interface CertificationFormData {
  project_id: string;
  certification_number: string;
  issue_date: string;
  period_start: string;
  period_end: string;
  status: 'draft' | 'certified' | 'approved' | 'invoiced';
  base_amount: number;
  iva_rate: number;
  retention_rate: number;
  description: string;
  notes: string;
}

const CertificationModule: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'list' | 'create' | 'edit'>('list');
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CertificationFormData>({
    project_id: '',
    certification_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    period_start: new Date().toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
    status: 'draft',
    base_amount: 0,
    iva_rate: 21,
    retention_rate: 5,
    description: '',
    notes: ''
  });

  useEffect(() => {
    loadCertifications();
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, code, name, status')
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadCertifications = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('certifications')
        .select(`
          *,
          projects:project_id (name)
        `)
        .order('issue_date', { ascending: false });

      if (error) throw error;

      const certificationsWithProjectName = (data || []).map(cert => ({
        ...cert,
        project_name: cert.projects?.name || 'Sin proyecto'
      }));

      setCertifications(certificationsWithProjectName);
    } catch (error) {
      console.error('Error loading certifications:', error);
      showErrorNotification('Error al cargar certificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const ivaAmount = formData.base_amount * (formData.iva_rate / 100);
      const retentionAmount = formData.base_amount * (formData.retention_rate / 100);
      const netAmount = formData.base_amount + ivaAmount - retentionAmount;

      const { data: previousCert } = await supabase
        .from('certifications')
        .select('accumulated_amount')
        .eq('project_id', formData.project_id)
        .order('issue_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      const previousAccumulated = previousCert?.accumulated_amount || 0;
      const accumulatedAmount = previousAccumulated + formData.base_amount;

      const certificationData = {
        ...formData,
        iva_amount: ivaAmount,
        retention_amount: retentionAmount,
        net_amount: netAmount,
        accumulated_amount: accumulatedAmount,
        previous_accumulated: previousAccumulated
      };

      if (selectedTab === 'edit' && selectedCertification) {
        const { error } = await supabase
          .from('certifications')
          .update(certificationData)
          .eq('id', selectedCertification.id);

        if (error) throw error;
        showSuccessNotification('Certificación actualizada correctamente');
      } else {
        const { error } = await supabase
          .from('certifications')
          .insert([certificationData]);

        if (error) throw error;
        showSuccessNotification('Certificación creada correctamente');
      }

      await loadCertifications();
      setSelectedTab('list');
      resetForm();
    } catch (error: any) {
      console.error('Error saving certification:', error);
      showErrorNotification(error.message || 'Error al guardar certificación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (cert: Certification) => {
    setSelectedCertification(cert);
    setFormData({
      project_id: cert.project_id,
      certification_number: cert.certification_number,
      issue_date: cert.issue_date,
      period_start: cert.period_start,
      period_end: cert.period_end,
      status: cert.status,
      base_amount: cert.base_amount,
      iva_rate: cert.iva_rate,
      retention_rate: cert.retention_rate,
      description: cert.description || '',
      notes: cert.notes || ''
    });
    setSelectedTab('edit');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta certificación?')) return;

    try {
      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showSuccessNotification('Certificación eliminada correctamente');
      await loadCertifications();
    } catch (error: any) {
      showErrorNotification(error.message || 'Error al eliminar certificación');
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: '',
      certification_number: '',
      issue_date: new Date().toISOString().split('T')[0],
      period_start: new Date().toISOString().split('T')[0],
      period_end: new Date().toISOString().split('T')[0],
      status: 'draft',
      base_amount: 0,
      iva_rate: 21,
      retention_rate: 5,
      description: '',
      notes: ''
    });
    setSelectedCertification(null);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const certificationsToImport = jsonData.map((row: any) => {
        const baseAmount = parseFloat(row['Base Imponible'] || row['base_amount'] || 0);
        const ivaRate = parseFloat(row['IVA %'] || row['iva_rate'] || 21);
        const retentionRate = parseFloat(row['Retención %'] || row['retention_rate'] || 5);

        const ivaAmount = baseAmount * (ivaRate / 100);
        const retentionAmount = baseAmount * (retentionRate / 100);
        const netAmount = baseAmount + ivaAmount - retentionAmount;

        return {
          project_id: row['ID Proyecto'] || row['project_id'],
          certification_number: row['Número Certificación'] || row['certification_number'],
          issue_date: row['Fecha Emisión'] || row['issue_date'],
          period_start: row['Periodo Inicio'] || row['period_start'],
          period_end: row['Periodo Fin'] || row['period_end'],
          status: row['Estado'] || row['status'] || 'draft',
          base_amount: baseAmount,
          iva_rate: ivaRate,
          retention_rate: retentionRate,
          iva_amount: ivaAmount,
          retention_amount: retentionAmount,
          net_amount: netAmount,
          accumulated_amount: parseFloat(row['Acumulado'] || row['accumulated_amount'] || 0),
          previous_accumulated: parseFloat(row['Acumulado Anterior'] || row['previous_accumulated'] || 0),
          description: row['Descripción'] || row['description'] || '',
          notes: row['Notas'] || row['notes'] || ''
        };
      });

      const { error } = await supabase
        .from('certifications')
        .insert(certificationsToImport);

      if (error) throw error;

      showSuccessNotification(`${certificationsToImport.length} certificaciones importadas correctamente`);
      await loadCertifications();
    } catch (error: any) {
      console.error('Error importing certifications:', error);
      showErrorNotification(error.message || 'Error al importar certificaciones');
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredCertifications.map(cert => ({
      'Número': cert.certification_number,
      'Proyecto': cert.project_name,
      'Fecha Emisión': cert.issue_date,
      'Periodo Inicio': cert.period_start,
      'Periodo Fin': cert.period_end,
      'Estado': cert.status,
      'Base Imponible': cert.base_amount,
      'IVA %': cert.iva_rate,
      'IVA': cert.iva_amount,
      'Retención %': cert.retention_rate,
      'Retención': cert.retention_amount,
      'Importe Neto': cert.net_amount,
      'Acumulado': cert.accumulated_amount,
      'Descripción': cert.description,
      'Notas': cert.notes
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Certificaciones');
    XLSX.writeFile(wb, `certificaciones_${new Date().toISOString().split('T')[0]}.xlsx`);
    showSuccessNotification('Certificaciones exportadas correctamente');
  };

  const filteredCertifications = certifications.filter(cert => {
    const matchesSearch = cert.certification_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (cert.project_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProject === 'all' || cert.project_id === selectedProject;
    const matchesStatus = selectedStatus === 'all' || cert.status === selectedStatus;
    return matchesSearch && matchesProject && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-800' },
      certified: { label: 'Certificado', color: 'bg-blue-100 text-blue-800' },
      approved: { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
      invoiced: { label: 'Facturado', color: 'bg-purple-100 text-purple-800' }
    };
    const badge = badges[status as keyof typeof badges] || badges.draft;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>{badge.label}</span>;
  };

  if (selectedTab === 'create' || selectedTab === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedTab === 'edit' ? 'Editar Certificación' : 'Nueva Certificación'}
              </h2>
              <p className="text-sm text-gray-600">Complete los datos de la certificación</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedTab('list');
              resetForm();
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto *</label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar proyecto</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.code} - {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Certificación *</label>
              <input
                type="text"
                value={formData.certification_number}
                onChange={(e) => setFormData({ ...formData, certification_number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Emisión *</label>
              <input
                type="date"
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="draft">Borrador</option>
                <option value="certified">Certificado</option>
                <option value="approved">Aprobado</option>
                <option value="invoiced">Facturado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Periodo Inicio *</label>
              <input
                type="date"
                value={formData.period_start}
                onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Periodo Fin *</label>
              <input
                type="date"
                value={formData.period_end}
                onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Imponible (€) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.base_amount}
                onChange={(e) => setFormData({ ...formData, base_amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IVA (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.iva_rate}
                onChange={(e) => setFormData({ ...formData, iva_rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retención (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.retention_rate}
                onChange={(e) => setFormData({ ...formData, retention_rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Resumen de Importes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Base Imponible</p>
                <p className="font-bold text-gray-900">{formatCurrency(formData.base_amount)}</p>
              </div>
              <div>
                <p className="text-gray-600">IVA ({formData.iva_rate}%)</p>
                <p className="font-bold text-gray-900">{formatCurrency(formData.base_amount * formData.iva_rate / 100)}</p>
              </div>
              <div>
                <p className="text-gray-600">Retención ({formData.retention_rate}%)</p>
                <p className="font-bold text-red-600">-{formatCurrency(formData.base_amount * formData.retention_rate / 100)}</p>
              </div>
              <div>
                <p className="text-gray-600">Importe Neto</p>
                <p className="font-bold text-green-600">
                  {formatCurrency(formData.base_amount + (formData.base_amount * formData.iva_rate / 100) - (formData.base_amount * formData.retention_rate / 100))}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Guardando...' : 'Guardar Certificación'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedTab('list');
                resetForm();
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCheck className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Certificaciones de Obra</h2>
            <p className="text-sm text-gray-600">Gestión y control de certificaciones</p>
          </div>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
            <Upload className="w-4 h-4" />
            Importar Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Download className="w-4 h-4" />
            Exportar Excel
          </button>
          <button
            onClick={() => setSelectedTab('create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Nueva Certificación
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar certificaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los proyectos</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.code} - {project.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="certified">Certificado</option>
            <option value="approved">Aprobado</option>
            <option value="invoiced">Facturado</option>
          </select>

          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-600">
              {filteredCertifications.length} certificaciones
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando certificaciones...</p>
        </div>
      ) : filteredCertifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay certificaciones</h3>
          <p className="text-gray-600 mb-4">Comienza creando una nueva certificación o importa desde Excel</p>
          <button
            onClick={() => setSelectedTab('create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Crear Primera Certificación
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proyecto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Importe Neto
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acumulado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCertifications.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{cert.certification_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{cert.project_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(cert.issue_date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(cert.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {formatCurrency(cert.base_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">
                      {formatCurrency(cert.net_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-blue-600">
                      {formatCurrency(cert.accumulated_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cert)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cert.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Formato de Excel para Importación</h3>
        <p className="text-sm text-gray-600 mb-3">
          El archivo Excel debe contener las siguientes columnas:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="bg-white rounded p-2">
            <span className="font-medium">ID Proyecto</span>
          </div>
          <div className="bg-white rounded p-2">
            <span className="font-medium">Número Certificación</span>
          </div>
          <div className="bg-white rounded p-2">
            <span className="font-medium">Fecha Emisión</span>
          </div>
          <div className="bg-white rounded p-2">
            <span className="font-medium">Periodo Inicio</span>
          </div>
          <div className="bg-white rounded p-2">
            <span className="font-medium">Periodo Fin</span>
          </div>
          <div className="bg-white rounded p-2">
            <span className="font-medium">Estado</span>
          </div>
          <div className="bg-white rounded p-2">
            <span className="font-medium">Base Imponible</span>
          </div>
          <div className="bg-white rounded p-2">
            <span className="font-medium">IVA %</span>
          </div>
          <div className="bg-white rounded p-2">
            <span className="font-medium">Retención %</span>
          </div>
          <div className="bg-white rounded p-2">
            <span className="font-medium">Descripción</span>
          </div>
          <div className="bg-white rounded p-2">
            <span className="font-medium">Notas</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationModule;
