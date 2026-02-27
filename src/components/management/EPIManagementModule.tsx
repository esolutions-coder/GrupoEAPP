import React, { useState, useEffect } from 'react';
import {
  Shield, Plus, Search, Edit, Trash2, Eye, Package, AlertTriangle,
  TrendingUp, TrendingDown, Clock, CheckCircle, X, Save, Download,
  ShoppingCart, Users, DollarSign, Activity, Filter, Calendar,
  FileText, RefreshCw, Truck, Archive, Printer
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  EPIItem, EPIDelivery, EPIOrder, EPIAlert, EPICategory,
  EPIItemFormData, EPIDeliveryFormData, EPIDashboardStats,
  EPIStockSummary, EPIOrderWithDetails, EPICondition,
  EPIRestockFrequency, EPIOrderStatus, EPIDeliveryItem, EPIDeliveryWithDetails
} from '../../types/epi';
import { exportToExcel } from '../../utils/exportUtils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EPIDeliveryMultiForm } from './EPIDeliveryMultiForm';

const EPIManagementModule: React.FC = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'inventory' | 'deliveries' | 'orders' | 'alerts' | 'history'>('dashboard');
  const [items, setItems] = useState<EPIItem[]>([]);
  const [categories, setCategories] = useState<EPICategory[]>([]);
  const [deliveries, setDeliveries] = useState<EPIDelivery[]>([]);
  const [orders, setOrders] = useState<EPIOrder[]>([]);
  const [alerts, setAlerts] = useState<EPIAlert[]>([]);
  const [stats, setStats] = useState<EPIDashboardStats>({
    total_items: 0,
    total_stock: 0,
    low_stock_items: 0,
    critical_stock_items: 0,
    active_orders: 0,
    deliveries_today: 0,
    pending_alerts: 0,
    total_value: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showItemModal, setShowItemModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EPIItem | null>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const [itemForm, setItemForm] = useState<EPIItemFormData>({
    category_id: '',
    name: '',
    description: '',
    sizes_available: [],
    current_stock: 0,
    minimum_stock: 10,
    restock_frequency: 'monthly',
    unit_price: 0,
    location: '',
    supplier_id: ''
  });

  const [deliveryForm, setDeliveryForm] = useState<EPIDeliveryFormData>({
    worker_id: '',
    delivery_date: new Date().toISOString().split('T')[0],
    delivered_by: 'Admin',
    notes: '',
    items: []
  });

  const [orderForm, setOrderForm] = useState({
    order_number: '',
    supplier_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    notes: '',
    items: [] as { epi_item_id: string; quantity_ordered: number; unit_price: number; epi_name?: string }[]
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeView === 'dashboard') {
      loadDashboardStats();
    }
  }, [activeView, items, deliveries, orders, alerts]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadCategories(),
        loadItems(),
        loadDeliveries(),
        loadOrders(),
        loadAlerts(),
        loadWorkers(),
        loadSuppliers(),
        loadProjects()
      ]);
    } catch (error: any) {
      showNotification('Error al cargar datos: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('epi_categories')
      .select('*')
      .order('name');
    if (!error && data) setCategories(data);
  };

  const loadItems = async () => {
    const { data, error } = await supabase
      .from('epi_items')
      .select('*')
      .eq('status', 'active')
      .order('name');
    if (!error && data) setItems(data);
  };

  const loadDeliveries = async () => {
    const { data, error } = await supabase
      .from('epi_deliveries')
      .select(`
        *,
        workers!epi_deliveries_worker_id_fkey(id, first_name, last_name, worker_code)
      `)
      .order('delivery_date', { ascending: false })
      .limit(100);

    if (!error && data) {
      const deliveriesWithItems = await Promise.all(
        data.map(async (delivery: any) => {
          const { data: itemsData } = await supabase
            .from('epi_delivery_items')
            .select(`
              *,
              epi_items!epi_delivery_items_epi_item_id_fkey(id, name, category_id)
            `)
            .eq('delivery_id', delivery.id);

          return {
            ...delivery,
            items: itemsData || []
          };
        })
      );
      setDeliveries(deliveriesWithItems);
    }
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('epi_orders')
      .select('*')
      .order('order_date', { ascending: false })
      .limit(50);
    if (!error && data) setOrders(data);
  };

  const loadAlerts = async () => {
    const { data, error } = await supabase
      .from('epi_alerts')
      .select('*')
      .eq('is_resolved', false)
      .order('created_at', { ascending: false });
    if (!error && data) setAlerts(data);
  };

  const loadWorkers = async () => {
    const { data, error } = await supabase
      .from('workers')
      .select('id, worker_code, first_name, last_name, category')
      .eq('status', 'active')
      .order('first_name');
    if (!error && data) setWorkers(data);
  };

  const loadSuppliers = async () => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('id, supplier_code, commercial_name, category')
      .eq('status', 'active')
      .order('commercial_name');
    if (!error && data) setSuppliers(data);
  };

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, project_code, name, manager_name')
      .eq('status', 'active')
      .order('name');
    if (!error && data) setProjects(data);
  };

  const loadDashboardStats = () => {
    const totalStock = items.reduce((sum, item) => sum + item.current_stock, 0);
    const lowStockItems = items.filter(item => item.current_stock <= item.minimum_stock * 1.5 && item.current_stock > item.minimum_stock).length;
    const criticalStockItems = items.filter(item => item.current_stock <= item.minimum_stock).length;
    const activeOrders = orders.filter(order => order.status === 'pending' || order.status === 'sent').length;
    const today = new Date().toISOString().split('T')[0];
    const deliveriesToday = deliveries.filter(delivery => delivery.delivery_date === today).length;
    const totalValue = items.reduce((sum, item) => sum + (item.current_stock * item.unit_price), 0);

    setStats({
      total_items: items.length,
      total_stock: totalStock,
      low_stock_items: lowStockItems,
      critical_stock_items: criticalStockItems,
      active_orders: activeOrders,
      deliveries_today: deliveriesToday,
      pending_alerts: alerts.length,
      total_value: totalValue
    });
  };

  const handleSaveItem = async () => {
    if (!itemForm.name || !itemForm.category_id) {
      showNotification('Complete los campos obligatorios', 'error');
      return;
    }

    try {
      if (selectedItem) {
        const { error } = await supabase
          .from('epi_items')
          .update({ ...itemForm, updated_at: new Date().toISOString() })
          .eq('id', selectedItem.id);
        if (error) throw error;
        showNotification('EPI actualizado correctamente', 'success');
      } else {
        const { error } = await supabase
          .from('epi_items')
          .insert(itemForm);
        if (error) throw error;
        showNotification('EPI creado correctamente', 'success');
      }
      setShowItemModal(false);
      setSelectedItem(null);
      resetItemForm();
      loadItems();
    } catch (error: any) {
      showNotification('Error al guardar: ' + error.message, 'error');
    }
  };

  const handleSaveDelivery = async (formData: EPIDeliveryFormData) => {
    if (!formData.worker_id || formData.items.length === 0) {
      showNotification('Complete todos los campos requeridos', 'error');
      return;
    }

    try {
      const actaNumber = `ACTA-${Date.now()}`;

      const { data: delivery, error: deliveryError } = await supabase
        .from('epi_deliveries')
        .insert({
          worker_id: formData.worker_id,
          delivery_date: formData.delivery_date,
          delivered_by: formData.delivered_by,
          notes: formData.notes,
          acta_number: actaNumber
        })
        .select()
        .single();

      if (deliveryError) throw deliveryError;

      const deliveryItems = formData.items.map(item => ({
        delivery_id: delivery.id,
        epi_item_id: item.epi_item_id,
        quantity: item.quantity,
        size: item.size,
        notes: item.notes
      }));

      const { error: itemsError } = await supabase
        .from('epi_delivery_items')
        .insert(deliveryItems);

      if (itemsError) throw itemsError;

      showNotification(`Entrega registrada correctamente. Acta: ${actaNumber}`, 'success');
      setShowDeliveryModal(false);
      resetDeliveryForm();
      loadDeliveries();
      loadItems();
      loadStats();
    } catch (error: any) {
      showNotification('Error al registrar entrega: ' + error.message, 'error');
    }
  };

  const handleSaveOrder = async () => {
    if (!orderForm.order_number || !orderForm.supplier_id || orderForm.items.length === 0) {
      showNotification('Complete los campos obligatorios y agregue items', 'error');
      return;
    }

    try {
      const { data: order, error: orderError } = await supabase
        .from('epi_orders')
        .insert({
          order_number: orderForm.order_number,
          supplier_id: orderForm.supplier_id,
          order_date: orderForm.order_date,
          expected_delivery_date: orderForm.expected_delivery_date,
          status: 'pending',
          notes: orderForm.notes,
          created_by: 'Admin'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = orderForm.items.map(item => ({
        order_id: order.id,
        epi_item_id: item.epi_item_id,
        quantity_ordered: item.quantity_ordered,
        quantity_received: 0,
        unit_price: item.unit_price
      }));

      const { error: itemsError } = await supabase
        .from('epi_order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      showNotification('Pedido creado correctamente', 'success');
      setShowOrderModal(false);
      resetOrderForm();
      loadOrders();
    } catch (error: any) {
      showNotification('Error al crear pedido: ' + error.message, 'error');
    }
  };

  const handleMarkOrderAsReceived = async (orderId: string) => {
    if (!confirm('¿Marcar pedido como recibido? Esto actualizará el stock automáticamente.')) return;

    try {
      const { data: orderItems } = await supabase
        .from('epi_order_items')
        .select('*')
        .eq('order_id', orderId);

      if (orderItems && orderItems.length > 0) {
        await supabase
          .from('epi_order_items')
          .update({ quantity_received: orderItems[0].quantity_ordered })
          .eq('order_id', orderId);
      }

      const { error } = await supabase
        .from('epi_orders')
        .update({ status: 'received' })
        .eq('id', orderId);

      if (error) throw error;

      showNotification('Pedido marcado como recibido. Stock actualizado', 'success');
      loadOrders();
      loadItems();
    } catch (error: any) {
      showNotification('Error al actualizar pedido: ' + error.message, 'error');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('epi_alerts')
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;

      showNotification('Alerta resuelta', 'success');
      loadAlerts();
    } catch (error: any) {
      showNotification('Error al resolver alerta: ' + error.message, 'error');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('¿Eliminar este EPI del inventario?')) return;

    try {
      const { error } = await supabase
        .from('epi_items')
        .update({ status: 'inactive' })
        .eq('id', id);

      if (error) throw error;

      showNotification('EPI eliminado correctamente', 'success');
      loadItems();
    } catch (error: any) {
      showNotification('Error al eliminar: ' + error.message, 'error');
    }
  };

  const handleDeleteDelivery = async (deliveryId: string) => {
    if (!confirm('¿Eliminar esta entrega? El stock de todos los EPIs será restaurado automáticamente.')) return;

    try {
      const { error: deleteError } = await supabase
        .from('epi_deliveries')
        .delete()
        .eq('id', deliveryId);

      if (deleteError) throw deleteError;

      showNotification('Entrega eliminada y stock restaurado correctamente', 'success');
      loadDeliveries();
      loadItems();
      loadStats();
    } catch (error: any) {
      showNotification('Error al eliminar entrega: ' + error.message, 'error');
    }
  };

  const handlePrintDeliveryReceipt = async (deliveryId: string) => {
    try {
      const delivery: any = deliveries.find(d => d.id === deliveryId);
      if (!delivery) {
        showNotification('Entrega no encontrada', 'error');
        return;
      }

      const worker = workers.find(w => w.id === delivery.worker_id) || delivery.workers;

      if (!worker) {
        showNotification('Datos del trabajador no encontrados', 'error');
        return;
      }

      if (!delivery.items || delivery.items.length === 0) {
        showNotification('No hay items en esta entrega', 'error');
        return;
      }

      const { data: workerData } = await supabase
        .from('workers')
        .select('dni, category')
        .eq('id', delivery.worker_id)
        .maybeSingle();

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let yPosition = 20;

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('ACTA DE ENTREGA DE EQUIPOS DE PROTECCIÓN INDIVIDUAL (EPI)', pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      doc.text(`Empresa: GRUPO EA OBRAS Y SERVICIOS S.L.`, margin, yPosition);
      yPosition += 6;
      doc.text(`NIF: B12345678`, margin, yPosition);
      yPosition += 6;
      if (delivery.acta_number) {
        doc.text(`Nº Acta: ${delivery.acta_number}`, margin, yPosition);
        yPosition += 6;
      }

      const projectName = projects.length > 0 ? projects[0].name : 'Obra General';
      const managerName = projects.length > 0 ? (projects[0].manager_name || 'N/A') : 'N/A';

      doc.text(`Obra: ${projectName}`, margin, yPosition);
      doc.text(`Fecha: ${new Date(delivery.delivery_date).toLocaleDateString('es-ES')}`, pageWidth - margin - 60, yPosition);
      yPosition += 6;
      doc.text(`Responsable de obra: ${managerName}`, margin, yPosition);

      yPosition += 12;
      doc.setFont('helvetica', 'bold');
      doc.text('Por la presente se hace constar que el/la trabajador/a:', margin, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'normal');

      doc.text(`Nombre: ${worker.first_name} ${worker.last_name}`, margin, yPosition);
      yPosition += 6;
      doc.text(`DNI/NIE: ${workerData?.dni || 'N/A'}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Puesto: ${workerData?.category || worker.category || 'N/A'}`, margin, yPosition);

      yPosition += 12;
      doc.setFont('helvetica', 'bold');
      doc.text('Ha recibido los siguientes EPIs:', margin, yPosition);
      yPosition += 8;

      const tableData = delivery.items.map((item: any, index: number) => {
        const epiItem = item.epi_items || items.find(i => i.id === item.epi_item_id);
        return [
          (index + 1).toString(),
          item.epi_item_id.substring(0, 8),
          epiItem?.name || 'N/A',
          item.size || 'N/A',
          'N/A',
          item.quantity.toString(),
          item.notes || ''
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [['Nº', 'Código', 'Descripción', 'Talla', 'Lote', 'Cantidad', 'Observaciones']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
        margin: { left: margin, right: margin }
      });

      const finalY = (doc as any).lastAutoTable?.finalY || yPosition + 30;
      yPosition = finalY + 12;

      doc.setFont('helvetica', 'bold');
      doc.text('Declaración:', margin, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      const declarationText = 'El trabajador declara haber recibido los equipos relacionados, encontrarlos en buen estado y conocer su uso y mantenimiento. Se le ha informado de la obligatoriedad de su uso conforme a la normativa interna y de prevención de riesgos laborales.';
      const splitDeclaration = doc.splitTextToSize(declarationText, pageWidth - 2 * margin);
      doc.text(splitDeclaration, margin, yPosition);
      yPosition += splitDeclaration.length * 5 + 10;

      doc.setFontSize(10);
      const today = new Date().toLocaleDateString('es-ES');

      doc.text(`Firma del trabajador: ____________________`, margin, yPosition);
      doc.text(`Fecha: ${today}`, margin + 80, yPosition);
      yPosition += 10;

      doc.text(`Firma del responsable de entrega: __________`, margin, yPosition);
      doc.text(`Fecha: ${today}`, margin + 80, yPosition);
      yPosition += 15;

      doc.setFont('helvetica', 'bold');
      doc.text('Sello y firma de la empresa:', margin, yPosition);
      yPosition += 6;
      doc.text('______________________', margin, yPosition);

      yPosition += 15;
      if (yPosition < doc.internal.pageSize.getHeight() - 40) {
        doc.setFont('helvetica', 'bold');
        doc.text('Observaciones adicionales:', margin, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'normal');

        const observations = delivery.notes || 'Ninguna';
        const splitObs = doc.splitTextToSize(observations, pageWidth - 2 * margin);
        doc.text(splitObs, margin, yPosition);
      }

      const filename = `acta_entrega_EPI_${worker.worker_code}_${new Date(delivery.delivery_date).toISOString().split('T')[0]}.pdf`;
      doc.save(filename);

      showNotification('Acta de entrega generada correctamente', 'success');
    } catch (error: any) {
      console.error('Error al generar acta:', error);
      showNotification('Error al generar acta: ' + error.message, 'error');
    }
  };

  const handleGenerateAutomaticOrders = async () => {
    const lowStockItems = items.filter(item => item.current_stock <= item.minimum_stock);

    if (lowStockItems.length === 0) {
      showNotification('No hay EPIs con stock bajo', 'error');
      return;
    }

    if (!confirm(`Se generarán pedidos automáticos para ${lowStockItems.length} EPIs con stock bajo. ¿Continuar?`)) return;

    try {
      for (const item of lowStockItems) {
        if (!item.supplier_id) continue;

        const orderNumber = `AUTO-${Date.now()}-${item.id.substring(0, 8)}`;
        const quantityToOrder = item.minimum_stock * 2 - item.current_stock;

        const { data: order, error: orderError } = await supabase
          .from('epi_orders')
          .insert({
            order_number: orderNumber,
            supplier_id: item.supplier_id,
            order_date: new Date().toISOString().split('T')[0],
            expected_delivery_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'pending',
            notes: `Pedido automático generado por stock bajo (Stock actual: ${item.current_stock}, Mínimo: ${item.minimum_stock})`,
            created_by: 'Sistema Automático'
          })
          .select()
          .single();

        if (orderError) throw orderError;

        await supabase
          .from('epi_order_items')
          .insert({
            order_id: order.id,
            epi_item_id: item.id,
            quantity_ordered: quantityToOrder,
            quantity_received: 0,
            unit_price: item.unit_price
          });
      }

      showNotification(`${lowStockItems.length} pedidos automáticos generados correctamente`, 'success');
      loadOrders();
    } catch (error: any) {
      showNotification('Error al generar pedidos: ' + error.message, 'error');
    }
  };

  const resetItemForm = () => {
    setItemForm({
      category_id: '',
      name: '',
      description: '',
      sizes_available: [],
      current_stock: 0,
      minimum_stock: 10,
      restock_frequency: 'monthly',
      unit_price: 0,
      location: '',
      supplier_id: ''
    });
  };

  const resetDeliveryForm = () => {
    setDeliveryForm({
      worker_id: '',
      delivery_date: new Date().toISOString().split('T')[0],
      delivered_by: 'Admin',
      notes: '',
      items: []
    });
  };

  const resetOrderForm = () => {
    setOrderForm({
      order_number: '',
      supplier_id: '',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
      notes: '',
      items: []
    });
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const addItemToOrder = () => {
    if (!orderForm.items.find(i => i.epi_item_id === selectedItem?.id) && selectedItem) {
      setOrderForm({
        ...orderForm,
        items: [
          ...orderForm.items,
          {
            epi_item_id: selectedItem.id,
            quantity_ordered: selectedItem.minimum_stock * 2,
            unit_price: selectedItem.unit_price,
            epi_name: selectedItem.name
          }
        ]
      });
      setSelectedItem(null);
    }
  };

  const removeItemFromOrder = (epiItemId: string) => {
    setOrderForm({
      ...orderForm,
      items: orderForm.items.filter(item => item.epi_item_id !== epiItemId)
    });
  };

  const getStockStatusBadge = (item: EPIItem) => {
    if (item.current_stock <= item.minimum_stock) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Crítico</span>;
    } else if (item.current_stock <= item.minimum_stock * 1.5) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Bajo</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">OK</span>;
  };

  const getOrderStatusBadge = (status: EPIOrderStatus) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      received: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      pending: 'Pendiente',
      sent: 'Enviado',
      received: 'Recibido',
      cancelled: 'Cancelado'
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`}>{labels[status]}</span>;
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const dashboardCards = [
    { label: 'Total EPIs', value: stats.total_items, icon: Shield, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Stock Total', value: stats.total_stock, icon: Package, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Stock Crítico', value: stats.critical_stock_items, icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-50' },
    { label: 'Stock Bajo', value: stats.low_stock_items, icon: TrendingDown, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { label: 'Pedidos Activos', value: stats.active_orders, icon: ShoppingCart, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { label: 'Entregas Hoy', value: stats.deliveries_today, icon: Truck, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { label: 'Alertas Pendientes', value: stats.pending_alerts, icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { label: 'Valor Total', value: `€${stats.total_value.toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50' }
  ];

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
          <h2 className="text-2xl font-bold text-gray-900">Gestión de EPIs</h2>
          <p className="text-gray-600">Sistema integral de equipos de protección individual</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setShowItemModal(true); setSelectedItem(null); resetItemForm(); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Añadir EPI
          </button>
          <button
            onClick={() => { setShowDeliveryModal(true); resetDeliveryForm(); }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Truck className="w-5 h-5" />
            Registrar Entrega
          </button>
          <button
            onClick={() => { setShowOrderModal(true); resetOrderForm(); }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <ShoppingCart className="w-5 h-5" />
            Crear Pedido
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            {['dashboard', 'inventory', 'deliveries', 'orders', 'alerts', 'history'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view as any)}
                className={`px-6 py-3 font-medium capitalize ${
                  activeView === view
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {view === 'dashboard' && 'Panel Principal'}
                {view === 'inventory' && 'Inventario'}
                {view === 'deliveries' && 'Entregas'}
                {view === 'orders' && 'Pedidos'}
                {view === 'alerts' && 'Alertas'}
                {view === 'history' && 'Historial'}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {dashboardCards.map((card, index) => (
                  <div key={index} className={`${card.bgColor} rounded-lg p-6 border border-gray-200`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{card.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                      </div>
                      <card.icon className={`h-8 w-8 ${card.color}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Alertas Críticas de Stock
                  </h3>
                  <div className="space-y-3">
                    {items.filter(item => item.current_stock <= item.minimum_stock).slice(0, 5).map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">Stock: {item.current_stock} / Mínimo: {item.minimum_stock}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowOrderModal(true);
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Pedir
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    Pedidos Pendientes
                  </h3>
                  <div className="space-y-3">
                    {orders.filter(order => order.status === 'pending' || order.status === 'sent').slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{order.order_number}</p>
                          <p className="text-sm text-gray-600">Fecha esperada: {order.expected_delivery_date || 'N/A'}</p>
                        </div>
                        {getOrderStatusBadge(order.status)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleGenerateAutomaticOrders}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  <RefreshCw className="w-5 h-5" />
                  Generar Pedidos Automáticos
                </button>
                <button
                  onClick={() => exportToExcel({
                    title: 'Stock EPIs',
                    data: items.map(i => ({
                      'Nombre': i.name,
                      'Stock Actual': i.current_stock,
                      'Stock Mínimo': i.minimum_stock,
                      'Precio': i.unit_price,
                      'Ubicación': i.location
                    })),
                    filename: 'stock_epis'
                  })}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Download className="w-5 h-5" />
                  Exportar Excel
                </button>
              </div>
            </div>
          )}

          {activeView === 'inventory' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar EPIs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EPI</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Mínimo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map(item => (
                      <tr key={item.id}>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium">{item.current_stock}</span>
                        </td>
                        <td className="px-6 py-4">{item.minimum_stock}</td>
                        <td className="px-6 py-4">{getStockStatusBadge(item)}</td>
                        <td className="px-6 py-4">€{item.unit_price.toFixed(2)}</td>
                        <td className="px-6 py-4">{item.location || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setItemForm({...item, sizes_available: item.sizes_available || []});
                                setShowItemModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-800"
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

          {activeView === 'deliveries' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº Acta</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trabajador</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">EPIs Entregados</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entregado por</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deliveries.slice(0, 50).map((delivery: any) => {
                      const worker = workers.find(w => w.id === delivery.worker_id) || delivery.workers;
                      const totalItems = delivery.items?.length || 0;
                      return (
                        <tr key={delivery.id}>
                          <td className="px-6 py-4">{delivery.delivery_date}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                              {delivery.acta_number || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {worker ? `${worker.first_name} ${worker.last_name}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="font-semibold text-sm text-blue-600">
                                {totalItems} {totalItems === 1 ? 'EPI' : 'EPIs'}
                              </div>
                              {delivery.items && delivery.items.slice(0, 2).map((item: any, idx: number) => {
                                const epiItem = item.epi_items || items.find(i => i.id === item.epi_item_id);
                                return (
                                  <div key={idx} className="text-xs text-gray-600">
                                    • {epiItem?.name || 'N/A'} (x{item.quantity})
                                  </div>
                                );
                              })}
                              {totalItems > 2 && (
                                <div className="text-xs text-gray-500 italic">
                                  + {totalItems - 2} más...
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">{delivery.delivered_by || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handlePrintDeliveryReceipt(delivery.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Imprimir Acta de Entrega"
                              >
                                <Printer className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDelivery(delivery.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar Entrega"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'orders' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº Pedido</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrega Esperada</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map(order => {
                      const supplier = suppliers.find(s => s.id === order.supplier_id);
                      return (
                        <tr key={order.id}>
                          <td className="px-6 py-4 font-medium">{order.order_number}</td>
                          <td className="px-6 py-4">{supplier?.commercial_name || 'N/A'}</td>
                          <td className="px-6 py-4">{order.order_date}</td>
                          <td className="px-6 py-4">{order.expected_delivery_date || 'N/A'}</td>
                          <td className="px-6 py-4">{getOrderStatusBadge(order.status)}</td>
                          <td className="px-6 py-4">€{order.total_amount.toFixed(2)}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-end">
                              {order.status === 'pending' && (
                                <button
                                  onClick={() => handleMarkOrderAsReceived(order.id)}
                                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                >
                                  Recibido
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'alerts' && (
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                  <p>No hay alertas pendientes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map(alert => {
                    const item = items.find(i => i.id === alert.epi_item_id);
                    return (
                      <div key={alert.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="font-medium text-gray-900">{alert.alert_message}</p>
                            {item && <p className="text-sm text-gray-600">EPI: {item.name}</p>}
                            <p className="text-xs text-gray-500">{new Date(alert.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Resolver
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeView === 'history' && (
            <div className="text-center py-12 text-gray-500">
              <Archive className="w-16 h-16 mx-auto mb-4" />
              <p>Historial completo disponible</p>
              <p className="text-sm mt-2">Ver actividad de entregas, pedidos y alertas resueltas</p>
            </div>
          )}
        </div>
      </div>

      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold">{selectedItem ? 'Editar EPI' : 'Nuevo EPI'}</h3>
              <button onClick={() => { setShowItemModal(false); setSelectedItem(null); }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                  <select
                    value={itemForm.category_id}
                    onChange={(e) => setItemForm({...itemForm, category_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Actual</label>
                  <input
                    type="number"
                    value={itemForm.current_stock}
                    onChange={(e) => setItemForm({...itemForm, current_stock: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Mínimo</label>
                  <input
                    type="number"
                    value={itemForm.minimum_stock}
                    onChange={(e) => setItemForm({...itemForm, minimum_stock: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Precio Unitario</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.unit_price}
                    onChange={(e) => setItemForm({...itemForm, unit_price: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                  <input
                    type="text"
                    value={itemForm.location}
                    onChange={(e) => setItemForm({...itemForm, location: e.target.value})}
                    placeholder="Ej: Almacén A, Estante 3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frecuencia de Reposición</label>
                  <select
                    value={itemForm.restock_frequency}
                    onChange={(e) => setItemForm({...itemForm, restock_frequency: e.target.value as EPIRestockFrequency})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="daily">Diaria</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                    <option value="annual">Anual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
                  <select
                    value={itemForm.supplier_id}
                    onChange={(e) => setItemForm({...itemForm, supplier_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar</option>
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.commercial_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowItemModal(false); setSelectedItem(null); }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveItem}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-5 h-5 inline mr-2" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeliveryModal && (
        <EPIDeliveryMultiForm
          workers={workers}
          items={items}
          onSubmit={handleSaveDelivery}
          onCancel={() => {
            setShowDeliveryModal(false);
            resetDeliveryForm();
          }}
        />
      )}

      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Crear Pedido</h3>
              <button onClick={() => { setShowOrderModal(false); resetOrderForm(); }} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nº Pedido *</label>
                  <input
                    type="text"
                    value={orderForm.order_number}
                    onChange={(e) => setOrderForm({...orderForm, order_number: e.target.value})}
                    placeholder="PED-2024-001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor *</label>
                  <select
                    value={orderForm.supplier_id}
                    onChange={(e) => setOrderForm({...orderForm, supplier_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar</option>
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.commercial_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Pedido</label>
                  <input
                    type="date"
                    value={orderForm.order_date}
                    onChange={(e) => setOrderForm({...orderForm, order_date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entrega Esperada</label>
                  <input
                    type="date"
                    value={orderForm.expected_delivery_date}
                    onChange={(e) => setOrderForm({...orderForm, expected_delivery_date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Items del Pedido</h4>
                <div className="flex gap-3 mb-4">
                  <select
                    onChange={(e) => {
                      const item = items.find(i => i.id === e.target.value);
                      if (item) setSelectedItem(item);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar EPI para agregar</option>
                    {items.filter(item => !orderForm.items.find(i => i.epi_item_id === item.id)).map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={addItemToOrder}
                    disabled={!selectedItem}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {orderForm.items.length > 0 ? (
                  <div className="space-y-2">
                    {orderForm.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.epi_name}</p>
                          <p className="text-sm text-gray-600">
                            Cantidad: {item.quantity_ordered} × €{item.unit_price.toFixed(2)} = €{(item.quantity_ordered * item.unit_price).toFixed(2)}
                          </p>
                        </div>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity_ordered}
                          onChange={(e) => {
                            const newItems = [...orderForm.items];
                            newItems[index].quantity_ordered = parseInt(e.target.value) || 1;
                            setOrderForm({...orderForm, items: newItems});
                          }}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                        />
                        <button
                          onClick={() => removeItemFromOrder(item.epi_item_id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="pt-3 border-t">
                      <p className="text-right font-semibold text-lg">
                        Total: €{orderForm.items.reduce((sum, item) => sum + (item.quantity_ordered * item.unit_price), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No hay items agregados al pedido</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                <textarea
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowOrderModal(false); resetOrderForm(); }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveOrder}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Save className="w-5 h-5 inline mr-2" />
                Crear Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EPIManagementModule;
