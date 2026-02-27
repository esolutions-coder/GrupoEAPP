import React, { useState, useEffect } from 'react';
import {
  BarChart3, Plus, Search, Edit, Trash2, Eye, Download, FileText,
  CheckCircle, X, Save, FolderOpen, Package, Calculator, TrendingUp,
  Upload, Paperclip, History, ChevronDown, ChevronRight, Filter,
  AlertCircle, Calendar, User, FileSpreadsheet, Import
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  MeasurementChapter,
  MeasurementItem,
  MeasurementRecord,
  MeasurementDocument,
  ChapterWithItems,
  BudgetComparison,
  MeasurementFormData,
  MeasurementRecordFormData,
  ImportedMeasurementData
} from '../../types/measurements';
import { Project } from '../../types/construction';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

interface MeasurementsEnhancedProps {
  selectedProject?: Project | null;
}

const MeasurementsEnhanced: React.FC<MeasurementsEnhancedProps> = ({ selectedProject }) => {
  const [activeView, setActiveView] = useState<'chapters' | 'items' | 'budget-comparison' | 'form-chapter' | 'form-item' | 'form-record'>('chapters');
  const [chapters, setChapters] = useState<ChapterWithItems[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<MeasurementChapter | null>(null);
  const [selectedItem, setSelectedItem] = useState<MeasurementItem | null>(null);
  const [budgetComparison, setBudgetComparison] = useState<BudgetComparison[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>(selectedProject?.id || '');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const [chapterForm, setChapterForm] = useState({
    chapter_code: '',
    chapter_name: '',
    description: '',
    display_order: 0
  });

  const [itemForm, setItemForm] = useState<MeasurementFormData>({
    chapter_id: '',
    item_code: '',
    description: '',
    unit_of_measure: 'ud',
    budgeted_quantity: 0,
    budgeted_unit_price: 0,
    technical_specs: '',
    reference_documents: '',
    notes: ''
  });

  const [recordForm, setRecordForm] = useState<MeasurementRecordFormData>({
    item_id: '',
    record_date: new Date().toISOString().split('T')[0],
    measured_quantity: 0,
    is_preliminary: true,
    observations: '',
    measured_by: ''
  });

  const unitOptions = [
    { value: 'ud', label: 'Unidad (ud)' },
    { value: 'm', label: 'Metro (m)' },
    { value: 'm²', label: 'Metro cuadrado (m²)' },
    { value: 'm³', label: 'Metro cúbico (m³)' },
    { value: 'kg', label: 'Kilogramo (kg)' },
    { value: 't', label: 'Tonelada (t)' },
    { value: 'l', label: 'Litro (l)' },
    { value: 'h', label: 'Hora (h)' }
  ];

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
      client: p.client || '',
      location: p.location || '',
      status: p.status,
      startDate: p.start_date || '',
      endDate: p.end_date || '',
      budget: p.budget || 0,
      contractValue: p.contract_value || 0
    }));

    setProjects(transformedProjects);

    if (!currentProjectId && transformedProjects.length > 0) {
      setCurrentProjectId(transformedProjects[0].id);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadChapters(),
        loadBudgetComparison()
      ]);
    } catch (error: any) {
      showNotification('Error al cargar datos: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadChapters = async () => {
    const { data: chaptersData, error: chaptersError } = await supabase
      .from('measurement_chapters')
      .select('*')
      .eq('project_id', currentProjectId)
      .order('display_order');

    if (chaptersError) throw chaptersError;

    const chaptersWithItems: ChapterWithItems[] = await Promise.all(
      (chaptersData || []).map(async (chapter) => {
        const { data: itemsData } = await supabase
          .from('measurement_items')
          .select('*')
          .eq('chapter_id', chapter.id)
          .order('item_code');

        const items = await Promise.all(
          (itemsData || []).map(async (item) => {
            const { data: recordsData } = await supabase
              .from('measurement_records')
              .select('*')
              .eq('item_id', item.id)
              .order('record_date', { ascending: false });

            const { data: documentsData } = await supabase
              .from('measurement_documents')
              .select('*')
              .eq('item_id', item.id);

            const total_measured = (recordsData || []).reduce((sum, r) => sum + Number(r.measured_quantity), 0);
            const certified_quantity = (recordsData || []).filter(r => r.is_certified).reduce((sum, r) => sum + Number(r.measured_quantity), 0);
            const percentage_executed = item.budgeted_quantity > 0 ? (total_measured / item.budgeted_quantity * 100) : 0;

            return {
              ...item,
              chapter_name: chapter.chapter_name,
              records: recordsData || [],
              documents: documentsData || [],
              total_measured,
              certified_quantity,
              percentage_executed
            };
          })
        );

        const total_budgeted = items.reduce((sum, i) => sum + Number(i.budgeted_total), 0);
        const total_measured = items.reduce((sum, i) => sum + (i.total_measured * Number(i.budgeted_unit_price)), 0);
        const total_certified = items.reduce((sum, i) => sum + (i.certified_quantity * Number(i.budgeted_unit_price)), 0);

        return {
          ...chapter,
          items,
          total_budgeted,
          total_measured,
          total_certified
        };
      })
    );

    setChapters(chaptersWithItems);
  };

  const loadBudgetComparison = async () => {
    const { data, error } = await supabase
      .from('measurement_budget_comparison')
      .select('*')
      .eq('project_id', currentProjectId);

    if (error) throw error;
    setBudgetComparison(data || []);
  };

  const handleSaveChapter = async () => {
    if (!chapterForm.chapter_code || !chapterForm.chapter_name) {
      showNotification('Complete los campos obligatorios', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('measurement_chapters')
        .insert({
          project_id: currentProjectId,
          ...chapterForm
        });

      if (error) throw error;

      showNotification('Capítulo creado correctamente', 'success');
      setActiveView('chapters');
      loadChapters();
      resetChapterForm();
    } catch (error: any) {
      showNotification('Error al crear capítulo: ' + error.message, 'error');
    }
  };

  const handleSaveItem = async () => {
    if (!itemForm.chapter_id || !itemForm.item_code || !itemForm.description) {
      showNotification('Complete los campos obligatorios', 'error');
      return;
    }

    try {
      const budgeted_total = Number(itemForm.budgeted_quantity) * Number(itemForm.budgeted_unit_price);

      const { error } = await supabase
        .from('measurement_items')
        .insert({
          project_id: currentProjectId,
          ...itemForm,
          budgeted_total
        });

      if (error) throw error;

      await supabase.from('measurement_history').insert({
        item_id: null,
        change_type: 'created',
        field_changed: 'item',
        new_value: `${itemForm.item_code} - ${itemForm.description}`,
        changed_by: 'Admin',
        changed_at: new Date().toISOString()
      });

      showNotification('Partida creada correctamente', 'success');
      setActiveView('chapters');
      loadChapters();
      resetItemForm();
    } catch (error: any) {
      showNotification('Error al crear partida: ' + error.message, 'error');
    }
  };

  const handleSaveRecord = async () => {
    if (!recordForm.item_id || recordForm.measured_quantity <= 0) {
      showNotification('Complete los campos obligatorios', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('measurement_records')
        .insert(recordForm);

      if (error) throw error;

      await supabase.from('measurement_history').insert({
        item_id: recordForm.item_id,
        change_type: 'created',
        field_changed: 'measurement',
        new_value: `${recordForm.measured_quantity} - ${recordForm.record_date}`,
        changed_by: recordForm.measured_by || 'Admin',
        changed_at: new Date().toISOString()
      });

      showNotification('Medición registrada correctamente', 'success');
      setActiveView('chapters');
      loadChapters();
      resetRecordForm();
    } catch (error: any) {
      showNotification('Error al registrar medición: ' + error.message, 'error');
    }
  };

  const handleCertifyRecord = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('measurement_records')
        .update({
          is_certified: true,
          certification_date: new Date().toISOString().split('T')[0],
          is_preliminary: false
        })
        .eq('id', recordId);

      if (error) throw error;

      showNotification('Medición certificada correctamente', 'success');
      loadChapters();
    } catch (error: any) {
      showNotification('Error al certificar: ' + error.message, 'error');
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('¿Eliminar este capítulo y todas sus partidas?')) return;

    try {
      const { error } = await supabase
        .from('measurement_chapters')
        .delete()
        .eq('id', chapterId);

      if (error) throw error;

      showNotification('Capítulo eliminado correctamente', 'success');
      loadChapters();
    } catch (error: any) {
      showNotification('Error al eliminar: ' + error.message, 'error');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('¿Eliminar esta partida y todas sus mediciones?')) return;

    try {
      const { error } = await supabase
        .from('measurement_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      showNotification('Partida eliminada correctamente', 'success');
      loadChapters();
    } catch (error: any) {
      showNotification('Error al eliminar: ' + error.message, 'error');
    }
  };

  const handleExportByChapter = (chapterId: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const exportData = chapter.items.map(item => ({
      'Código': item.item_code,
      'Descripción': item.description,
      'Unidad': item.unit_of_measure,
      'Cantidad Presupuestada': item.budgeted_quantity,
      'Precio Unitario': item.budgeted_unit_price,
      'Total Presupuesto': item.budgeted_total,
      'Cantidad Ejecutada': item.total_measured,
      'Cantidad Certificada': item.certified_quantity,
      '% Ejecución': item.percentage_executed.toFixed(2),
      'Estado': item.status
    }));

    const excelData = {
      title: `${chapter.chapter_name} - Mediciones`,
      headers: Object.keys(exportData[0] || {}),
      data: exportData,
      filename: `mediciones_${chapter.chapter_code}`
    };

    exportToExcel(excelData);
  };

  const handleExportBudgetComparison = () => {
    const exportData = budgetComparison.map(item => ({
      'Capítulo': item.chapter_name,
      'Código': item.item_code,
      'Descripción': item.description,
      'Unidad': item.unit_of_measure,
      'Cantidad Presup.': item.budgeted_quantity,
      'Precio Unit.': item.budgeted_unit_price,
      'Total Presup.': item.budgeted_total,
      'Cantidad Ejecutada': item.total_measured_quantity,
      'Importe Ejecutado': item.total_measured_amount,
      'Cantidad Certificada': item.certified_quantity,
      'Importe Certificado': item.certified_amount,
      '% Ejecutado': item.percentage_executed.toFixed(2),
      'Pendiente': item.pending_amount,
      'Estado': item.status
    }));

    const excelData = {
      title: 'Comparativa Presupuesto vs Ejecutado',
      headers: Object.keys(exportData[0] || {}),
      data: exportData,
      filename: 'comparativa_presupuesto'
    };

    exportToExcel(excelData);
  };

  const handleImportFromExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    showNotification('Función de importación en desarrollo', 'error');
  };

  const toggleChapterExpansion = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const resetChapterForm = () => {
    setChapterForm({
      chapter_code: '',
      chapter_name: '',
      description: '',
      display_order: 0
    });
  };

  const resetItemForm = () => {
    setItemForm({
      chapter_id: '',
      item_code: '',
      description: '',
      unit_of_measure: 'ud',
      budgeted_quantity: 0,
      budgeted_unit_price: 0,
      technical_specs: '',
      reference_documents: '',
      notes: ''
    });
  };

  const resetRecordForm = () => {
    setRecordForm({
      item_id: '',
      record_date: new Date().toISOString().split('T')[0],
      measured_quantity: 0,
      is_preliminary: true,
      observations: '',
      measured_by: ''
    });
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels = {
      active: 'Activo',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredChapters = chapters.filter(c =>
    c.chapter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.chapter_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.items.some(i =>
      i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.item_code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (activeView === 'form-chapter') {
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
            <h3 className="text-2xl font-bold text-gray-900">Nuevo Capítulo de Mediciones</h3>
            <p className="text-gray-600">Organiza las mediciones por capítulos temáticos</p>
          </div>
          <button
            onClick={() => setActiveView('chapters')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código del Capítulo *</label>
              <input
                type="text"
                value={chapterForm.chapter_code}
                onChange={(e) => setChapterForm({ ...chapterForm, chapter_code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Ej: CAP-01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Orden de Visualización</label>
              <input
                type="number"
                value={chapterForm.display_order}
                onChange={(e) => setChapterForm({ ...chapterForm, display_order: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Capítulo *</label>
              <input
                type="text"
                value={chapterForm.chapter_name}
                onChange={(e) => setChapterForm({ ...chapterForm, chapter_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Ej: Movimiento de Tierras"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                value={chapterForm.description}
                onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Descripción detallada del capítulo"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              onClick={() => setActiveView('chapters')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveChapter}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-5 h-5" />
              Guardar Capítulo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'form-item') {
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
            <h3 className="text-2xl font-bold text-gray-900">Nueva Partida de Medición</h3>
            <p className="text-gray-600">Unidad de obra con presupuesto y especificaciones</p>
          </div>
          <button
            onClick={() => setActiveView('chapters')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capítulo *</label>
              <select
                value={itemForm.chapter_id}
                onChange={(e) => setItemForm({ ...itemForm, chapter_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Seleccionar capítulo</option>
                {chapters.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.chapter_code} - {chapter.chapter_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código de Partida *</label>
              <input
                type="text"
                value={itemForm.item_code}
                onChange={(e) => setItemForm({ ...itemForm, item_code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Ej: 01.001"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
              <textarea
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Descripción detallada de la unidad de obra"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unidad de Medida *</label>
              <select
                value={itemForm.unit_of_measure}
                onChange={(e) => setItemForm({ ...itemForm, unit_of_measure: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {unitOptions.map(unit => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad Presupuestada</label>
              <input
                type="number"
                step="0.001"
                value={itemForm.budgeted_quantity}
                onChange={(e) => setItemForm({ ...itemForm, budgeted_quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio Unitario (€)</label>
              <input
                type="number"
                step="0.01"
                value={itemForm.budgeted_unit_price}
                onChange={(e) => setItemForm({ ...itemForm, budgeted_unit_price: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Presupuestado</label>
              <input
                type="text"
                value={`€${(itemForm.budgeted_quantity * itemForm.budgeted_unit_price).toFixed(2)}`}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Especificaciones Técnicas</label>
              <textarea
                value={itemForm.technical_specs}
                onChange={(e) => setItemForm({ ...itemForm, technical_specs: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Especificaciones técnicas y normativa aplicable"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Referencias (planos, fichas, etc.)</label>
              <input
                type="text"
                value={itemForm.reference_documents}
                onChange={(e) => setItemForm({ ...itemForm, reference_documents: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Ej: Plano P-001, Ficha técnica FT-05"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
              <textarea
                value={itemForm.notes}
                onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Notas y observaciones adicionales"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              onClick={() => setActiveView('chapters')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveItem}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-5 h-5" />
              Guardar Partida
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'form-record') {
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
            <h3 className="text-2xl font-bold text-gray-900">Registrar Medición</h3>
            <p className="text-gray-600">Medición de obra ejecutada</p>
          </div>
          <button
            onClick={() => setActiveView('chapters')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Partida *</label>
              <select
                value={recordForm.item_id}
                onChange={(e) => setRecordForm({ ...recordForm, item_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Seleccionar partida</option>
                {chapters.map(chapter => (
                  <optgroup key={chapter.id} label={chapter.chapter_name}>
                    {chapter.items.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.item_code} - {item.description}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Medición *</label>
              <input
                type="date"
                value={recordForm.record_date}
                onChange={(e) => setRecordForm({ ...recordForm, record_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad Medida *</label>
              <input
                type="number"
                step="0.001"
                value={recordForm.measured_quantity}
                onChange={(e) => setRecordForm({ ...recordForm, measured_quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Medido por</label>
              <input
                type="text"
                value={recordForm.measured_by}
                onChange={(e) => setRecordForm({ ...recordForm, measured_by: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Nombre del técnico"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={recordForm.is_preliminary}
                  onChange={(e) => setRecordForm({ ...recordForm, is_preliminary: e.target.checked })}
                  className="w-4 h-4"
                />
                Medición preliminar
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Marca si es una medición no definitiva
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
              <textarea
                value={recordForm.observations}
                onChange={(e) => setRecordForm({ ...recordForm, observations: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Observaciones técnicas o aclaraciones"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              onClick={() => setActiveView('chapters')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveRecord}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-5 h-5" />
              Guardar Medición
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'budget-comparison') {
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
            <h3 className="text-2xl font-bold text-gray-900">Comparativa Presupuesto vs Ejecutado</h3>
            <p className="text-gray-600">Análisis de desviaciones y control de costos</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveView('chapters')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Volver
            </button>
            <button
              onClick={handleExportBudgetComparison}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-5 h-5" />
              Exportar Excel
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capítulo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Presup.</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ejecutado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Certificado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">% Ejec.</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pendiente</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {budgetComparison.map(item => (
                  <tr key={item.item_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.chapter_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.item_code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">€{item.budgeted_total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-600">€{item.total_measured_amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">€{item.certified_amount.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`font-semibold ${
                        item.percentage_executed > 100 ? 'text-red-600' :
                        item.percentage_executed > 90 ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {item.percentage_executed.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">€{item.pending_amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <h2 className="text-2xl font-bold text-gray-900">Mediciones de Obra</h2>
          <p className="text-gray-600">Gestión estructurada de mediciones y certificaciones</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveView('budget-comparison')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Calculator className="w-5 h-5" />
            Comparativa Presupuesto
          </button>
          <button
            onClick={() => setActiveView('form-record')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <BarChart3 className="w-5 h-5" />
            Registrar Medición
          </button>
          <button
            onClick={() => setActiveView('form-item')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Package className="w-5 h-5" />
            Nueva Partida
          </button>
          <button
            onClick={() => setActiveView('form-chapter')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FolderOpen className="w-5 h-5" />
            Nuevo Capítulo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por código, capítulo o descripción..."
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
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando mediciones...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredChapters.map(chapter => (
            <div key={chapter.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleChapterExpansion(chapter.id)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {expandedChapters.has(chapter.id) ?
                      <ChevronDown className="w-5 h-5" /> :
                      <ChevronRight className="w-5 h-5" />
                    }
                  </button>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {chapter.chapter_code} - {chapter.chapter_name}
                    </h3>
                    <p className="text-sm text-gray-600">{chapter.items.length} partidas</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Presupuesto</p>
                    <p className="text-lg font-bold text-gray-900">€{chapter.total_budgeted.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Ejecutado</p>
                    <p className="text-lg font-bold text-blue-600">€{chapter.total_measured.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Certificado</p>
                    <p className="text-lg font-bold text-green-600">€{chapter.total_certified.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleExportByChapter(chapter.id)}
                      className="text-green-600 hover:text-green-800"
                      title="Exportar capítulo"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(chapter.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar capítulo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {expandedChapters.has(chapter.id) && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Presup.</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ejecutado</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Certif.</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">% Ejec.</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {chapter.items.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.item_code}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                            <div>{item.description}</div>
                            {item.technical_specs && (
                              <div className="text-xs text-gray-500 mt-1">{item.technical_specs}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.unit_of_measure}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                            <div>{item.budgeted_quantity} {item.unit_of_measure}</div>
                            <div className="text-xs text-gray-500">€{item.budgeted_total.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-600">
                            {item.total_measured.toFixed(3)} {item.unit_of_measure}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                            {item.certified_quantity.toFixed(3)} {item.unit_of_measure}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    item.percentage_executed > 100 ? 'bg-red-500' :
                                    item.percentage_executed > 90 ? 'bg-green-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${Math.min(item.percentage_executed, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{item.percentage_executed.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">{getStatusBadge(item.status)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-600 hover:text-red-800"
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
              )}
            </div>
          ))}

          {filteredChapters.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FolderOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No hay capítulos de mediciones creados</p>
              <button
                onClick={() => setActiveView('form-chapter')}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Crear primer capítulo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MeasurementsEnhanced;
