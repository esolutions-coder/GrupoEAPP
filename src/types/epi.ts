export type EPIRestockFrequency = 'daily' | 'weekly' | 'monthly' | 'annual';
export type EPIItemStatus = 'active' | 'inactive' | 'discontinued';
export type EPICondition = 'new' | 'in_use' | 'damaged' | 'lost';
export type EPIOrderStatus = 'pending' | 'sent' | 'received' | 'cancelled';
export type EPIAlertType = 'low_stock' | 'restock_due' | 'order_pending' | 'delivery_required';
export type StockStatus = 'critical' | 'low' | 'ok';

export interface EPICategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
}

export interface EPIItem {
  id: string;
  category_id?: string;
  name: string;
  description?: string;
  sizes_available: string[];
  current_stock: number;
  minimum_stock: number;
  restock_frequency: EPIRestockFrequency;
  unit_price: number;
  location?: string;
  supplier_id?: string;
  status: EPIItemStatus;
  last_delivery_date?: string;
  created_at: string;
  updated_at: string;
}

export interface EPIDelivery {
  id: string;
  worker_id: string;
  delivery_date: string;
  delivered_by?: string;
  notes?: string;
  signature_url?: string;
  acta_number?: string;
  created_at: string;
}

export interface EPIDeliveryItem {
  id: string;
  delivery_id: string;
  epi_item_id: string;
  quantity: number;
  size?: string;
  notes?: string;
  created_at: string;
}

export interface EPIOrder {
  id: string;
  order_number: string;
  supplier_id?: string;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status: EPIOrderStatus;
  total_amount: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EPIOrderItem {
  id: string;
  order_id: string;
  epi_item_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
  subtotal: number;
}

export interface EPIAlert {
  id: string;
  epi_item_id?: string;
  alert_type: EPIAlertType;
  alert_message: string;
  is_resolved: boolean;
  resolved_at?: string;
  created_at: string;
}

export interface EPIStockSummary {
  id: string;
  name: string;
  category_name: string;
  current_stock: number;
  minimum_stock: number;
  stock_difference: number;
  stock_status: StockStatus;
  location: string;
  supplier_name: string;
  unit_price: number;
  last_delivery_date: string;
  total_deliveries: number;
  total_delivered: number;
}

export interface EPIDeliveryByWorker {
  worker_id: string;
  worker_name: string;
  worker_code: string;
  epi_name: string;
  category_name: string;
  quantity: number;
  size: string;
  delivery_date: string;
  condition: EPICondition;
  delivered_by: string;
  notes: string;
}

export interface EPIPendingOrder {
  id: string;
  order_number: string;
  supplier_name: string;
  supplier_phone: string;
  order_date: string;
  expected_delivery_date: string;
  status: EPIOrderStatus;
  total_amount: number;
  total_items: number;
  total_quantity: number;
}

export interface EPIItemWithDetails extends EPIItem {
  category_name?: string;
  supplier_name?: string;
  stock_status: StockStatus;
  pending_orders?: number;
  total_deliveries?: number;
}

export interface EPIOrderWithDetails extends EPIOrder {
  supplier_name?: string;
  supplier_phone?: string;
  items: (EPIOrderItem & { epi_name: string })[];
}

export interface EPIDeliveryWithDetails extends EPIDelivery {
  worker_name: string;
  worker_code: string;
  items?: Array<EPIDeliveryItem & {
    epi_name: string;
    category_name?: string;
  }>;
}

export interface EPIDashboardStats {
  total_items: number;
  total_stock: number;
  low_stock_items: number;
  critical_stock_items: number;
  active_orders: number;
  deliveries_today: number;
  pending_alerts: number;
  total_value: number;
}

export interface EPIItemFormData {
  category_id: string;
  name: string;
  description: string;
  sizes_available: string[];
  current_stock: number;
  minimum_stock: number;
  restock_frequency: EPIRestockFrequency;
  unit_price: number;
  location: string;
  supplier_id: string;
}

export interface EPIDeliveryFormData {
  worker_id: string;
  delivery_date: string;
  delivered_by: string;
  notes: string;
  items: Array<{
    epi_item_id: string;
    quantity: number;
    size?: string;
    notes?: string;
  }>;
}

export interface EPIOrderFormData {
  order_number: string;
  supplier_id: string;
  order_date: string;
  expected_delivery_date: string;
  notes: string;
  items: {
    epi_item_id: string;
    quantity_ordered: number;
    unit_price: number;
  }[];
}
