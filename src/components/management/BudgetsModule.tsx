import React, { useState, useEffect } from 'react';
import {
  FileText, Plus, Search, Edit, Trash2, Eye, Download, Copy,
  CheckCircle, X, Save, Send, Calculator, Percent, DollarSign,
  ChevronDown, ChevronRight, AlertCircle, Clock, Building, User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatNumber } from '../../utils/formatUtils';
import {
  Budget,
  BudgetChapter,
  BudgetItem,
  BudgetSummary,
  BudgetWithDetails,
  BudgetChapterWithItems,
  BudgetFormData,
  BudgetStatus,
  BudgetCalculations
} from '../../types/budgets';
import { Project } from '../../types/construction';
import { exportToExcel } from '../../utils/exportUtils';

interface BudgetsModuleProps {
  selectedProject?: Project | null;
}

interface Client {
  id: string;
  name: string;
  tax_id: string;
  contact_person?: string;
}

const BudgetsModule: React.FC<BudgetsModuleProps> = ({ selectedProject }) => {
  const [activeView, setActiveView] = useState<'list' | 'form' | 'detail'>('list');
  const [activeTab, setActiveTab] = useState<'general' | 'items' | 'summary'>('general');
  const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<BudgetWithDetails | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>(selectedProject?.id || '');
  const [expandedBudgets, setExpandedBudgets] = useState<Set<string>>(new Set());
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<BudgetStatus | 'all'>('all');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [budgetForm, setBudgetForm] = useState<BudgetFormData>({
    project_id: '',
    contractor: '',
    budget_code: '',
    issue_date: new Date().toISOString().split('T')[0],
    general_expenses_percentage: 13.00,
    industrial_benefit_percentage: 6.00,
    discount_percentage: 0.00,
    tax_percentage: 21.00,
    notes: ''
  });

  const [chapters, setChapters] = useState<BudgetChapterWithItems[]>([]);
  const [newChapter, setNewChapter] = useState({ chapter_code: '', chapter_name: '' });
  const [newItem, setNewItem] = useState({
    chapter_id: '',
    item_code: '',
    description: '',
    unit_of_measure: 'ud',
    estimated_quantity: 0,
    unit_price: 0,
    notes: ''
  });

  const statusLabels = {
    draft: 'Borrador',
    in_review: 'En Revisión',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    closed: 'Cerrado'
  };

  useEffect(() => {
    if (currentProjectId) {
      loadData();
    }
  }, [currentProjectId]);

  useEffect(() => {
    loadProjects();
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, tax_id, contact_person')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error('Error al cargar clientes:', error);
    }
  };

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
      clientId: p.client_id || '',
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
    //Esto cambia a una query
    try {
      const { data, error } = await supabase
        .from('budget_summary')
        .select('*')
        .eq('project_id', currentProjectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error: any) {
      showNotification('Error al cargar datos: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewBudget = () => {
    const selectedProj = projects.find(p => p.id === currentProjectId);

    setBudgetForm({
      project_id: currentProjectId,
      client_id: selectedProj?.clientId || undefined,
      contractor: '',
      budget_code: '',
      issue_date: new Date().toISOString().split('T')[0],
      general_expenses_percentage: 13.00,
      industrial_benefit_percentage: 6.00,
      discount_percentage: 0.00,
      tax_percentage: 21.00,
      notes: ''
    });
    setChapters([]);
    setEditingBudget(null);
    setActiveTab('general');
    setActiveView('form');
  };

  const handleAddChapter = () => {
    if (!newChapter.chapter_code || !newChapter.chapter_name) {
      showNotification('Complete el código y nombre del capítulo', 'error');
      return;
    }

    const chapter: BudgetChapterWithItems = {
      id: `temp-${Date.now()}`,
      budget_id: '',
      chapter_code: newChapter.chapter_code,
      chapter_name: newChapter.chapter_name,
      display_order: chapters.length,
      subtotal: 0,
      created_at: new Date().toISOString(),
      items: []
    };

    setChapters([...chapters, chapter]);
    setNewChapter({ chapter_code: '', chapter_name: '' });
  };

  const handleRemoveChapter = (chapterId: string) => {
    setChapters(chapters.filter(c => c.id !== chapterId));
  };

  const handleAddItem = (chapterId: string) => {
    if (!newItem.item_code || !newItem.description) {
      showNotification('Complete el código y descripción de la partida', 'error');
      return;
    }

    const item: BudgetItem = {
      id: `temp-${Date.now()}`,
      budget_id: '',
      chapter_id: chapterId,
      item_code: newItem.item_code,
      description: newItem.description,
      unit_of_measure: newItem.unit_of_measure,
      estimated_quantity: newItem.estimated_quantity,
      unit_price: newItem.unit_price,
      amount: newItem.estimated_quantity * newItem.unit_price,
      display_order: 0,
      notes: newItem.notes,
      created_at: new Date().toISOString()
    };

    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        return {
          ...chapter,
          items: [...chapter.items, item],
          subtotal: chapter.subtotal + item.amount
        };
      }
      return chapter;
    });

    setChapters(updatedChapters);
    setNewItem({
      chapter_id: '',
      item_code: '',
      description: '',
      unit_of_measure: 'ud',
      estimated_quantity: 0,
      unit_price: 0,
      notes: ''
    });
  };

  const handleUpdateItem = (chapterId: string, itemId: string, field: string, value: any) => {
    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        const updatedItems = chapter.items.map(item => {
          if (item.id === itemId) {
            const updatedItem = { ...item, [field]: value };
            if (field === 'estimated_quantity' || field === 'unit_price') {
              updatedItem.amount = updatedItem.estimated_quantity * updatedItem.unit_price;
            }
            return updatedItem;
          }
          return item;
        });

        const newSubtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);

        return {
          ...chapter,
          items: updatedItems,
          subtotal: newSubtotal
        };
      }
      return chapter;
    });

    setChapters(updatedChapters);
  };

  const handleRemoveItem = (chapterId: string, itemId: string) => {
    const updatedChapters = chapters.map(chapter => {
      if (chapter.id === chapterId) {
        const updatedItems = chapter.items.filter(item => item.id !== itemId);
        const newSubtotal = updatedItems.reduce((sum, item) => sum + item.amount, 0);
        return {
          ...chapter,
          items: updatedItems,
          subtotal: newSubtotal
        };
      }
      return chapter;
    });

    setChapters(updatedChapters);
  };

  const handleDuplicateItem = (chapterId: string, itemId: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const item = chapter.items.find(i => i.id === itemId);
    if (!item) return;

    const duplicatedItem: BudgetItem = {
      ...item,
      id: `temp-${Date.now()}`,
      item_code: item.item_code + '-COPY'
    };

    const updatedChapters = chapters.map(c => {
      if (c.id === chapterId) {
        return {
          ...c,
          items: [...c.items, duplicatedItem],
          subtotal: c.subtotal + duplicatedItem.amount
        };
      }
      return c;
    });

    setChapters(updatedChapters);
  };

  const calculateBudget = (): BudgetCalculations => {
    const subtotal = chapters.reduce((sum, chapter) => sum + chapter.subtotal, 0);
    const general_expenses = subtotal * (budgetForm.general_expenses_percentage / 100);
    const with_expenses = subtotal + general_expenses;
    const industrial_benefit = with_expenses * (budgetForm.industrial_benefit_percentage / 100);
    const with_benefit = with_expenses + industrial_benefit;
    const discount = with_benefit * (budgetForm.discount_percentage / 100);
    const base_before_tax = with_benefit - discount;
    const tax_amount = base_before_tax * (budgetForm.tax_percentage / 100);
    const total = base_before_tax + tax_amount;

    return {
      subtotal,
      general_expenses,
      industrial_benefit,
      discount,
      base_before_tax,
      tax_amount,
      total
    };
  };

  // Aquí se guardaría el presupuesto, capítulos y partidas en la base de datos
  const handleSaveBudget = async () => {
    if (!budgetForm.budget_code || !budgetForm.client_id || !budgetForm.contractor) {
      showNotification('Complete los campos obligatorios (Código de presupuesto y Cliente)', 'error');
      return;
    }

    if (chapters.length === 0) {
      showNotification('Debe agregar al menos un capítulo con partidas', 'error');
      return;
    }

    try {
      const calculations = calculateBudget();

      const budgetData = {
        ...budgetForm,
        subtotal: calculations.subtotal,
        total: calculations.total,
        version: 1,
        created_by: 'Admin'
      };

      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .insert(budgetData)
        .select()
        .single();

      if (budgetError) throw budgetError;

      for (const chapter of chapters) {
        const { data: savedChapter, error: chapterError } = await supabase
          .from('budget_chapters')
          .insert({
            budget_id: budget.id,
            chapter_code: chapter.chapter_code,
            chapter_name: chapter.chapter_name,
            display_order: chapter.display_order
          })
          .select()
          .single();

        if (chapterError) throw chapterError;

        if (chapter.items.length > 0) {
          const itemsData = chapter.items.map((item, index) => ({
            budget_id: budget.id,
            chapter_id: savedChapter.id,
            item_code: item.item_code,
            description: item.description,
            unit_of_measure: item.unit_of_measure,
            estimated_quantity: item.estimated_quantity,
            unit_price: item.unit_price,
            display_order: index,
            notes: item.notes
          }));

          const { error: itemsError } = await supabase
            .from('budget_items')
            .insert(itemsData);

          if (itemsError) throw itemsError;
        }
      }

      await supabase.from('budget_versions').insert({
        original_budget_id: budget.id,
        version: 1,
        created_by: 'Admin',
        changes: `Presupuesto ${budgetForm.budget_code} creado`
      });

      showNotification('Presupuesto creado correctamente', 'success');
      setActiveView('list');
      loadData();
    } catch (error: any) {
      showNotification('Error al guardar: ' + error.message, 'error');
    }
  };

  const handleViewDetail = async (budgetId: string) => {
    console.log('🔍 Cargando detalle del presupuesto:', budgetId);
    setIsLoading(true);

    try {
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .select('*, projects!project_id(name)')
        .eq('id', budgetId)
        .single();

      if (budgetError) {
        console.error('❌ Error al cargar presupuesto:', budgetError);
        throw budgetError;
      }

      if (!budget) {
        throw new Error('Presupuesto no encontrado');
      }

      console.log('✅ Presupuesto cargado:', budget);

      const { data: chapterData, error: chapterError } = await supabase
        .from('budget_chapters')
        .select('*')
        .eq('budget_id', budgetId)
        .order('display_order');

      if (chapterError) {
        console.error('❌ Error al cargar capítulos:', chapterError);
      }

      console.log('📋 Capítulos encontrados:', chapterData?.length || 0);

      const chaptersWithItems: BudgetChapterWithItems[] = [];

      if (chapterData && chapterData.length > 0) {
        for (const chapter of chapterData) {
          const { data: items, error: itemsError } = await supabase
            .from('budget_items')
            .select('*')
            .eq('chapter_id', chapter.id)
            .order('display_order');

          if (itemsError) {
            console.error('❌ Error al cargar items del capítulo:', chapter.chapter_name, itemsError);
          }

          console.log(`📦 Items en capítulo "${chapter.chapter_name}":`, items?.length || 0);

          chaptersWithItems.push({
            ...chapter,
            items: items || []
          });
        }
      }

      const { data: versions } = await supabase
        .from('budget_versions')
        .select('*')
        .eq('original_budget_id', budgetId)
        .order('version', { ascending: false });

      const { data: documents } = await supabase
        .from('budget_documents')
        .select('*')
        .eq('budget_id', budgetId);

      const budgetWithDetails: BudgetWithDetails = {
        ...budget,
        project_name: (budget as any).projects?.name || 'Sin proyecto',
        chapters: chaptersWithItems,
        documents: documents || [],
        versions: versions || []
      };

      console.log('✅ Presupuesto completo cargado:', budgetWithDetails);

      setSelectedBudget(budgetWithDetails);
      setActiveView('detail');
      showNotification('Presupuesto cargado correctamente', 'success');
    } catch (error: any) {
      console.error('❌ Error en handleViewDetail:', error);
      showNotification('Error al cargar detalle: ' + (error.message || 'Error desconocido'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToReview = async (budgetId: string) => {
    if (!confirm('¿Enviar presupuesto a revisión?')) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .update({ status: 'in_review' })
        .eq('id', budgetId);

      if (error) throw error;

      showNotification('Presupuesto enviado a revisión', 'success');
      loadData();
      if (selectedBudget) {
        handleViewDetail(budgetId);
      }
    } catch (error: any) {
      showNotification('Error al enviar a revisión: ' + error.message, 'error');
    }
  };

  const handleApproveBudget = async (budgetId: string) => {
    if (!confirm('¿Aprobar este presupuesto?\n\n✅ Se creará automáticamente un proyecto con todas sus partidas.\n⏱️ Este proceso puede tardar unos segundos.')) {
      return;
    }

    console.log('🚀 Iniciando aprobación del presupuesto:', budgetId);
    setIsLoading(true);

    try {
      const { data: currentBudget, error: fetchError } = await supabase
        .from('budgets')
        .select('status, generated_project_id, can_generate_project, budget_code')
        .eq('id', budgetId)
        .single();

      if (fetchError) {
        console.error('❌ Error al obtener presupuesto:', fetchError);
        throw fetchError;
      }

      console.log('📋 Estado actual del presupuesto:', currentBudget);

      if (currentBudget.status === 'approved' && currentBudget.generated_project_id) {
        showNotification('⚠️ Este presupuesto ya está aprobado y tiene un proyecto asociado', 'error');
        setIsLoading(false);
        return;
      }

      showNotification('⏳ Aprobando presupuesto y creando proyecto...', 'success');

      const { data: updatedBudget, error: updateError } = await supabase
        .from('budgets')
        .update({
          status: 'approved',
          approved_by: 'Admin',
          approved_at: new Date().toISOString(),
          can_generate_project: true
        })
        .eq('id', budgetId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error al actualizar presupuesto:', updateError);
        throw updateError;
      }

      console.log('✅ Presupuesto actualizado a approved:', updatedBudget);

      showNotification('⏳ Esperando a que se cree el proyecto... (3 segundos)', 'success');

      await new Promise(resolve => setTimeout(resolve, 3000));

      const { data: finalBudget, error: finalError } = await supabase
        .from('budgets')
        .select('generated_project_id, budget_code')
        .eq('id', budgetId)
        .single();

      if (finalError) {
        console.error('❌ Error al verificar proyecto generado:', finalError);
      }

      console.log('🔍 Verificando proyecto generado:', finalBudget);

      if (finalBudget?.generated_project_id) {
        const { data: newProject } = await supabase
          .from('projects')
          .select('id, name, code')
          .eq('id', finalBudget.generated_project_id)
          .single();

        console.log('✅ Proyecto creado:', newProject);

        showNotification(
          `✅ ¡Presupuesto aprobado!\n📁 Proyecto creado: ${newProject?.name || 'OBRA: ' + finalBudget.budget_code}\n🆔 ID: ${finalBudget.generated_project_id.substring(0, 8)}...`,
          'success'
        );
      } else {
        console.warn('⚠️ El presupuesto se aprobó pero no se generó el proyecto automáticamente');
        showNotification(
          '⚠️ Presupuesto aprobado, pero el proyecto no se generó automáticamente.\nPor favor, verifique el trigger de base de datos.',
          'error'
        );
      }

      loadData();
      if (selectedBudget) {
        setTimeout(() => handleViewDetail(budgetId), 500);
      }
    } catch (error: any) {
      console.error('❌ Error en handleApproveBudget:', error);
      showNotification('❌ Error al aprobar: ' + (error.message || 'Error desconocido'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectBudget = async (budgetId: string) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .update({
          status: 'rejected',
          notes: reason
        })
        .eq('id', budgetId);

      if (error) throw error;

      showNotification('Presupuesto rechazado', 'success');
      loadData();
      if (selectedBudget) {
        handleViewDetail(budgetId);
      }
    } catch (error: any) {
      showNotification('Error al rechazar: ' + error.message, 'error');
    }
  };

  const handleDuplicateBudget = async (budgetId: string) => {
    try {
      const { data: budget } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', budgetId)
        .single();

      const { data: chapterData } = await supabase
        .from('budget_chapters')
        .select('*')
        .eq('budget_id', budgetId)
        .order('display_order');

      if (!budget || !chapterData) return;

      const newCode = prompt('Código del nuevo presupuesto:', budget.budget_code + '-V2');
      if (!newCode) return;

      const { data: maxVersion } = await supabase
        .from('budgets')
        .select('version')
        .eq('project_id', budget.project_id)
        .eq('budget_code', budget.budget_code)
        .order('version', { ascending: false })
        .limit(1);

      const nextVersion = (maxVersion && maxVersion[0]?.version || 0) + 1;

      const newBudgetData = {
        ...budget,
        id: undefined,
        budget_code: newCode,
        version: nextVersion,
        status: 'draft',
        approved_by: null,
        approved_at: null,
        created_at: undefined,
        updated_at: undefined
      };

      const { data: newBudget, error: budgetError } = await supabase
        .from('budgets')
        .insert(newBudgetData)
        .select()
        .single();

      if (budgetError) throw budgetError;

      for (const chapter of chapterData) {
        const { data: newChapter, error: chapterError } = await supabase
          .from('budget_chapters')
          .insert({
            budget_id: newBudget.id,
            chapter_code: chapter.chapter_code,
            chapter_name: chapter.chapter_name,
            display_order: chapter.display_order
          })
          .select()
          .single();

        if (chapterError) throw chapterError;

        const { data: items } = await supabase
          .from('budget_items')
          .select('*')
          .eq('chapter_id', chapter.id);

        if (items && items.length > 0) {
          const newItems = items.map(item => ({
            budget_id: newBudget.id,
            chapter_id: newChapter.id,
            item_code: item.item_code,
            description: item.description,
            unit_of_measure: item.unit_of_measure,
            estimated_quantity: item.estimated_quantity,
            unit_price: item.unit_price,
            display_order: item.display_order,
            notes: item.notes
          }));

          await supabase.from('budget_items').insert(newItems);
        }
      }

      await supabase.from('budget_versions').insert({
        original_budget_id: newBudget.id,
        version: nextVersion,
        created_by: 'Admin',
        changes: `Duplicado desde ${budget.budget_code} v${budget.version}`
      });

      showNotification('Presupuesto duplicado correctamente', 'success');
      loadData();
    } catch (error: any) {
      showNotification('Error al duplicar: ' + error.message, 'error');
    }
  };

  const handleDelete = async (budgetId: string) => {
    if (!confirm('¿Eliminar este presupuesto?')) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId);

      if (error) throw error;

      showNotification('Presupuesto eliminado', 'success');
      loadData();
      setActiveView('list');
    } catch (error: any) {
      showNotification('Error al eliminar: ' + error.message, 'error');
    }
  };

  const handleExportToExcel = async (budgetId: string) => {
    const { data: chapterData } = await supabase
      .from('budget_chapters')
      .select('*')
      .eq('budget_id', budgetId)
      .order('display_order');

    if (!chapterData) return;

    const exportData: any[] = [];

    for (const chapter of chapterData) {
      exportData.push({
        'Código': chapter.chapter_code,
        'Descripción': chapter.chapter_name,
        'Unidad': '',
        'Cantidad': '',
        'P. Unit.': '',
        'Importe': formatCurrency(chapter.subtotal)
      });

      const { data: items } = await supabase
        .from('budget_items')
        .select('*')
        .eq('chapter_id', chapter.id)
        .order('display_order');

      if (items) {
        items.forEach(item => {
          exportData.push({
            'Código': '  ' + item.item_code,
            'Descripción': item.description,
            'Unidad': item.unit_of_measure,
            'Cantidad': formatNumber(item.estimated_quantity),
            'P. Unit.': formatCurrency(item.unit_price),
            'Importe': formatCurrency(item.amount)
          });
        });
      }
    }

    const budget = budgets.find(b => b.budget_id === budgetId);
    exportToExcel({
      title: `Presupuesto ${budget?.budget_code}`,
      headers: Object.keys(exportData[0] || {}),
      data: exportData,
      filename: `presupuesto_${budget?.budget_code}`
    });
  };

  const toggleBudgetExpansion = (budgetId: string) => {
    const newExpanded = new Set(expandedBudgets);
    if (newExpanded.has(budgetId)) {
      newExpanded.delete(budgetId);
    } else {
      newExpanded.add(budgetId);
    }
    setExpandedBudgets(newExpanded);
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

  const showNotification = (message: string, type: string) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const getStatusBadge = (status: BudgetStatus) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      closed: 'bg-gray-100 text-gray-600'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.budget_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.contractor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || budget.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: 'Total Presupuestos',
      value: budgets.length.toString(),
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      label: 'Aprobados',
      value: budgets.filter(b => b.status === 'approved').length.toString(),
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      label: 'En Borrador',
      value: budgets.filter(b => b.status === 'draft').length.toString(),
      icon: Edit,
      color: 'text-gray-600'
    },
    {
      label: 'Valor Total',
      value: formatCurrency(budgets.filter(b => b.status === 'approved').reduce((sum, b) => sum + Number(b.total), 0)),
      icon: DollarSign,
      color: 'text-green-600'
    }
  ];

  if (activeView === 'form') {
    const calculations = calculateBudget();

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
            <h3 className="text-2xl font-bold text-gray-900">Nuevo Presupuesto de Obra</h3>
            <p className="text-gray-600">Gestión completa de presupuestos con capítulos y partidas</p>
          </div>
          <button
            onClick={() => setActiveView('list')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'general'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Datos Generales
              </button>
              <button
                onClick={() => setActiveTab('items')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'items'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Capítulos y Partidas
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'summary'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Resumen Económico
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Código de Presupuesto *</label>
                    <input
                      type="text"
                      value={budgetForm.budget_code}
                      onChange={(e) => setBudgetForm({ ...budgetForm, budget_code: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="PRES-2024-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
                    <select
                      value={budgetForm.client_id || ''}
                      onChange={(e) => {
                        const selectedClient = clients.find(c => c.id === e.target.value);
                        setBudgetForm({
                          ...budgetForm,
                          client_id: e.target.value,
                          contractor: selectedClient?.name || ''
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar cliente...</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name} {client.tax_id ? `(${client.tax_id})` : ''}
                        </option>
                      ))}
                    </select>
                    {budgetForm.client_id && clients.find(c => c.id === budgetForm.client_id)?.contact_person && (
                      <p className="text-sm text-gray-500 mt-1">
                        Contacto: {clients.find(c => c.id === budgetForm.client_id)?.contact_person}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Emisión</label>
                    <input
                      type="date"
                      value={budgetForm.issue_date}
                      onChange={(e) => setBudgetForm({ ...budgetForm, issue_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gastos Generales (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={budgetForm.general_expenses_percentage}
                      onChange={(e) => setBudgetForm({ ...budgetForm, general_expenses_percentage: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Beneficio Industrial (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={budgetForm.industrial_benefit_percentage}
                      onChange={(e) => setBudgetForm({ ...budgetForm, industrial_benefit_percentage: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descuento (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={budgetForm.discount_percentage}
                      onChange={(e) => setBudgetForm({ ...budgetForm, discount_percentage: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IVA (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={budgetForm.tax_percentage}
                      onChange={(e) => setBudgetForm({ ...budgetForm, tax_percentage: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                    <textarea
                      value={budgetForm.notes}
                      onChange={(e) => setBudgetForm({ ...budgetForm, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Observaciones generales del presupuesto..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setActiveTab('items')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Siguiente: Partidas
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Agregar Capítulo</h4>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Código (ej: 01)"
                      value={newChapter.chapter_code}
                      onChange={(e) => setNewChapter({ ...newChapter, chapter_code: e.target.value })}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Nombre del capítulo"
                      value={newChapter.chapter_name}
                      onChange={(e) => setNewChapter({ ...newChapter, chapter_name: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={handleAddChapter}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {chapters.map((chapter) => (
                    <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-blue-50 p-4 flex items-center justify-between">
                        <button
                          onClick={() => toggleChapterExpansion(chapter.id)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {expandedChapters.has(chapter.id) ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                          <span className="font-semibold text-gray-900">
                            {chapter.chapter_code} - {chapter.chapter_name}
                          </span>
                          <span className="ml-auto text-sm text-gray-600">
                            {chapter.items.length} partidas | {formatCurrency(chapter.subtotal)}
                          </span>
                        </button>
                        <button
                          onClick={() => handleRemoveChapter(chapter.id)}
                          className="ml-4 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {expandedChapters.has(chapter.id) && (
                        <div className="p-4 space-y-4">
                          <div className="bg-gray-50 p-3 rounded space-y-2">
                            <h5 className="font-medium text-sm text-gray-700">Nueva Partida</h5>
                            <div className="grid grid-cols-6 gap-2">
                              <input
                                type="text"
                                placeholder="Código"
                                value={newItem.chapter_id === chapter.id ? newItem.item_code : ''}
                                onChange={(e) => setNewItem({ ...newItem, chapter_id: chapter.id, item_code: e.target.value })}
                                className="px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                              <input
                                type="text"
                                placeholder="Descripción"
                                value={newItem.chapter_id === chapter.id ? newItem.description : ''}
                                onChange={(e) => setNewItem({ ...newItem, chapter_id: chapter.id, description: e.target.value })}
                                className="col-span-2 px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                              <input
                                type="text"
                                placeholder="Ud"
                                value={newItem.chapter_id === chapter.id ? newItem.unit_of_measure : 'ud'}
                                onChange={(e) => setNewItem({ ...newItem, chapter_id: chapter.id, unit_of_measure: e.target.value })}
                                className="px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                              <input
                                type="number"
                                placeholder="Cant"
                                step="0.01"
                                min="0"
                                value={newItem.chapter_id === chapter.id ? newItem.estimated_quantity : ''}
                                onChange={(e) => setNewItem({ ...newItem, chapter_id: chapter.id, estimated_quantity: parseFloat(e.target.value) || 0 })}
                                className="px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                              <input
                                type="number"
                                placeholder="Precio"
                                step="0.01"
                                min="0"
                                value={newItem.chapter_id === chapter.id ? newItem.unit_price : ''}
                                onChange={(e) => setNewItem({ ...newItem, chapter_id: chapter.id, unit_price: parseFloat(e.target.value) || 0 })}
                                className="px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                            </div>
                            <button
                              onClick={() => handleAddItem(chapter.id)}
                              className="w-full px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Agregar Partida
                            </button>
                          </div>

                          {chapter.items.length > 0 && (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Código</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500">Descripción</th>
                                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-500">Ud</th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500">Cantidad</th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500">P. Unit.</th>
                                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500">Importe</th>
                                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-500">Acción</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {chapter.items.map((item) => (
                                    <tr key={item.id}>
                                      <td className="px-2 py-2">
                                        <input
                                          type="text"
                                          value={item.item_code}
                                          onChange={(e) => handleUpdateItem(chapter.id, item.id, 'item_code', e.target.value)}
                                          className="w-full px-1 py-1 text-sm border border-gray-300 rounded"
                                        />
                                      </td>
                                      <td className="px-2 py-2">
                                        <input
                                          type="text"
                                          value={item.description}
                                          onChange={(e) => handleUpdateItem(chapter.id, item.id, 'description', e.target.value)}
                                          className="w-full px-1 py-1 text-sm border border-gray-300 rounded"
                                        />
                                      </td>
                                      <td className="px-2 py-2 text-center">
                                        <input
                                          type="text"
                                          value={item.unit_of_measure}
                                          onChange={(e) => handleUpdateItem(chapter.id, item.id, 'unit_of_measure', e.target.value)}
                                          className="w-16 px-1 py-1 text-sm text-center border border-gray-300 rounded"
                                        />
                                      </td>
                                      <td className="px-2 py-2">
                                        <input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          value={item.estimated_quantity}
                                          onChange={(e) => handleUpdateItem(chapter.id, item.id, 'estimated_quantity', parseFloat(e.target.value) || 0)}
                                          className="w-24 px-1 py-1 text-sm text-right border border-gray-300 rounded"
                                        />
                                      </td>
                                      <td className="px-2 py-2">
                                        <input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          value={item.unit_price}
                                          onChange={(e) => handleUpdateItem(chapter.id, item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                          className="w-24 px-1 py-1 text-sm text-right border border-gray-300 rounded"
                                        />
                                      </td>
                                      <td className="px-2 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                                      <td className="px-2 py-2 text-center">
                                        <div className="flex gap-1 justify-center">
                                          <button
                                            onClick={() => handleDuplicateItem(chapter.id, item.id)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Duplicar"
                                          >
                                            <Copy className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => handleRemoveItem(chapter.id, item.id)}
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
                      )}
                    </div>
                  ))}

                  {chapters.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No hay capítulos agregados. Agregue un capítulo para comenzar.
                    </div>
                  )}
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t">
                  <button
                    onClick={() => setActiveTab('general')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setActiveTab('summary')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Siguiente: Resumen
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Resumen Económico</h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700">Subtotal (Material y Mano de Obra)</span>
                      <span className="text-xl font-bold text-gray-900">{formatCurrency(calculations.subtotal)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 pl-4">
                      <span className="text-gray-600">+ Gastos Generales ({formatNumber(budgetForm.general_expenses_percentage)}%)</span>
                      <span className="text-gray-700 font-medium">{formatCurrency(calculations.general_expenses)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 pl-4">
                      <span className="text-gray-600">+ Beneficio Industrial ({formatNumber(budgetForm.industrial_benefit_percentage)}%)</span>
                      <span className="text-gray-700 font-medium">{formatCurrency(calculations.industrial_benefit)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 pl-4 border-t border-gray-300">
                      <span className="text-gray-600">- Descuento ({formatNumber(budgetForm.discount_percentage)}%)</span>
                      <span className="text-red-600 font-medium">-{formatCurrency(calculations.discount)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-t border-gray-300">
                      <span className="text-gray-700 font-medium">Base Imponible</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(calculations.base_before_tax)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 pl-4">
                      <span className="text-gray-600">+ IVA ({formatNumber(budgetForm.tax_percentage)}%)</span>
                      <span className="text-gray-700 font-medium">{formatCurrency(calculations.tax_amount)}</span>
                    </div>

                    <div className="flex justify-between items-center py-4 border-t-2 border-blue-600">
                      <span className="text-xl font-bold text-gray-900">TOTAL PRESUPUESTO</span>
                      <span className="text-3xl font-bold text-blue-600">{formatCurrency(calculations.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-3">Resumen de Partidas</h5>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{chapters.length}</p>
                      <p className="text-sm text-gray-600">Capítulos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {chapters.reduce((sum, ch) => sum + ch.items.length, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Partidas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(calculations.subtotal)}</p>
                      <p className="text-sm text-gray-600">Ejecución Material</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4 border-t">
                  <button
                    onClick={() => setActiveTab('items')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveView('list')}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveBudget}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Save className="w-5 h-5" />
                      Guardar Presupuesto
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'detail' && selectedBudget) {
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
            <h3 className="text-2xl font-bold text-gray-900">Detalle del Presupuesto</h3>
            <p className="text-gray-600">{selectedBudget.budget_code} v{selectedBudget.version} - {selectedBudget.contractor}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveView('list')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Volver
            </button>
            <button
              onClick={() => handleExportToExcel(selectedBudget.id)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            {(selectedBudget.status === 'draft' || selectedBudget.status === 'in_review') && (
              <>
                {selectedBudget.status === 'draft' && (
                  <button
                    onClick={() => handleSendToReview(selectedBudget.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    <Send className="w-4 h-4" />
                    Enviar a Revisión
                  </button>
                )}
                {selectedBudget.status === 'in_review' && (
                  <button
                    onClick={() => handleRejectBudget(selectedBudget.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                    Rechazar
                  </button>
                )}
                <button
                  onClick={() => handleApproveBudget(selectedBudget.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" />
                  Aprobar y Crear Proyecto
                </button>
                <button
                  onClick={() => handleDuplicateBudget(selectedBudget.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Copy className="w-4 h-4" />
                  Duplicar
                </button>
              </>
            )}
            {selectedBudget.status === 'approved' && selectedBudget.generated_project_id && (
              <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  ✅ Proyecto creado automáticamente
                </p>
                <p className="text-xs text-green-600 mt-1">
                  ID: {selectedBudget.generated_project_id}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Proyecto</p>
              <p className="font-semibold">{selectedBudget.project_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Fecha Emisión</p>
              <p className="font-semibold">{selectedBudget.issue_date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Estado</p>
              {getStatusBadge(selectedBudget.status)}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedBudget.total)}</p>
            </div>
          </div>

          {selectedBudget.approved_by && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                Aprobado por {selectedBudget.approved_by} el {new Date(selectedBudget.approved_at!).toLocaleString()}
              </p>
            </div>
          )}

          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold mb-4">Capítulos y Partidas</h4>
            <div className="space-y-4">
              {selectedBudget.chapters.map((chapter) => (
                <div key={chapter.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        {chapter.chapter_code} - {chapter.chapter_name}
                      </span>
                      <span className="text-sm text-gray-600">
                        {chapter.items.length} partidas | {formatCurrency(chapter.subtotal)}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Código</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Descripción</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Unidad</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Cantidad</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">P. Unit.</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Importe</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {chapter.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-2 font-medium">{item.item_code}</td>
                            <td className="px-4 py-2">{item.description}</td>
                            <td className="px-4 py-2 text-center">{item.unit_of_measure}</td>
                            <td className="px-4 py-2 text-right">{formatNumber(item.estimated_quantity)}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                            <td className="px-4 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <h4 className="text-lg font-semibold mb-4">Desglose Económico</h4>
            <div className="bg-gray-50 p-6 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-medium">{formatCurrency(selectedBudget.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gastos Generales ({formatNumber(selectedBudget.general_expenses_percentage)}%)</span>
                <span className="font-medium">{formatCurrency(selectedBudget.subtotal * selectedBudget.general_expenses_percentage / 100)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Beneficio Industrial ({formatNumber(selectedBudget.industrial_benefit_percentage)}%)</span>
                <span className="font-medium">{formatCurrency(selectedBudget.subtotal * (1 + selectedBudget.general_expenses_percentage/100) * selectedBudget.industrial_benefit_percentage / 100)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Descuento ({formatNumber(selectedBudget.discount_percentage)}%)</span>
                <span className="font-medium text-red-600">-{formatCurrency(selectedBudget.subtotal * (1 + selectedBudget.general_expenses_percentage/100) * (1 + selectedBudget.industrial_benefit_percentage/100) * selectedBudget.discount_percentage / 100)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-700 font-medium">Base Imponible</span>
                <span className="font-bold">{formatCurrency(selectedBudget.total / (1 + selectedBudget.tax_percentage/100))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IVA ({formatNumber(selectedBudget.tax_percentage)}%)</span>
                <span className="font-medium">{formatCurrency(selectedBudget.total - selectedBudget.total / (1 + selectedBudget.tax_percentage/100))}</span>
              </div>
              <div className="flex justify-between pt-3 border-t-2 border-blue-600">
                <span className="text-xl font-bold text-gray-900">TOTAL</span>
                <span className="text-2xl font-bold text-blue-600">{formatCurrency(selectedBudget.total)}</span>
              </div>
            </div>
          </div>

          {selectedBudget.notes && (
            <div className="border-t pt-6 mt-6">
              <h4 className="text-lg font-semibold mb-2">Notas</h4>
              <p className="text-gray-700">{selectedBudget.notes}</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Presupuestos de Obra</h2>
          <p className="text-gray-600">Gestión de presupuestos con capítulos, partidas y control económico</p>
        </div>
        <button
          onClick={handleNewBudget}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Nuevo Presupuesto
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
              placeholder="Buscar por código o contratista..."
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
            Todos
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-4 py-2 rounded-lg ${filterStatus === 'draft' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Borrador
          </button>
          <button
            onClick={() => setFilterStatus('in_review')}
            className={`px-4 py-2 rounded-lg ${filterStatus === 'in_review' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            En Revisión
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-4 py-2 rounded-lg ${filterStatus === 'approved' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Aprobados
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando presupuestos...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBudgets.map(budget => (
            <div key={budget.budget_id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {budget.budget_code} <span className="text-sm text-gray-500">v{budget.version}</span>
                    </h3>
                    <p className="text-sm text-gray-600">{budget.contractor} | {budget.issue_date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Presupuesto</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(budget.total)}</p>
                  </div>
                  <div>
                    {getStatusBadge(budget.status)}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetail(budget.budget_id)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Ver detalle"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDuplicateBudget(budget.budget_id)}
                      className="text-purple-600 hover:text-purple-800"
                      title="Duplicar"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleExportToExcel(budget.budget_id)}
                      className="text-green-600 hover:text-green-800"
                      title="Exportar Excel"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    {budget.status === 'draft' && (
                      <button
                        onClick={() => handleDelete(budget.budget_id)}
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
                    <span className="text-gray-600">Capítulos: </span>
                    <span className="font-medium">{budget.total_chapters}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Partidas: </span>
                    <span className="font-medium">{budget.total_items}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Subtotal: </span>
                    <span className="font-medium">{formatCurrency(budget.subtotal)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">IVA: </span>
                    <span className="font-medium">{budget.tax_percentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredBudgets.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No hay presupuestos creados</p>
              <button
                onClick={handleNewBudget}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Crear primer presupuesto
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetsModule;