import { MovementCategory, PaymentMethod } from '../types/treasury';

export const movementCategories: MovementCategory[] = [
  // INGRESOS
  {
    id: 'billing',
    name: 'Facturación',
    type: 'income',
    icon: '💰',
    color: 'bg-green-100 text-green-800',
    isActive: true
  },
  {
    id: 'certifications',
    name: 'Certificaciones',
    type: 'income',
    icon: '📜',
    color: 'bg-blue-100 text-blue-800',
    isActive: true
  },
  {
    id: 'advances',
    name: 'Anticipos de Cliente',
    type: 'income',
    icon: '⬆️',
    color: 'bg-cyan-100 text-cyan-800',
    isActive: true
  },
  {
    id: 'subsidies',
    name: 'Subvenciones',
    type: 'income',
    icon: '🏛️',
    color: 'bg-purple-100 text-purple-800',
    isActive: true
  },
  {
    id: 'other_income',
    name: 'Otros Ingresos',
    type: 'income',
    icon: '💵',
    color: 'bg-emerald-100 text-emerald-800',
    isActive: true
  },

  // GASTOS OPERATIVOS
  {
    id: 'payroll',
    name: 'Nóminas',
    type: 'expense',
    icon: '👥',
    color: 'bg-red-100 text-red-800',
    isActive: true
  },
  {
    id: 'materials',
    name: 'Materiales',
    type: 'expense',
    icon: '🧱',
    color: 'bg-orange-100 text-orange-800',
    isActive: true
  },
  {
    id: 'subcontracts',
    name: 'Subcontratas',
    type: 'expense',
    icon: '🤝',
    color: 'bg-yellow-100 text-yellow-800',
    isActive: true
  },
  {
    id: 'machinery',
    name: 'Maquinaria',
    type: 'expense',
    icon: '🚛',
    color: 'bg-indigo-100 text-indigo-800',
    isActive: true
  },
  {
    id: 'fuel',
    name: 'Combustible',
    type: 'expense',
    icon: '⛽',
    color: 'bg-amber-100 text-amber-800',
    isActive: true
  },
  {
    id: 'transport',
    name: 'Transporte',
    type: 'expense',
    icon: '🚚',
    color: 'bg-lime-100 text-lime-800',
    isActive: true
  },

  // GASTOS ADMINISTRATIVOS
  {
    id: 'office_expenses',
    name: 'Gastos de Oficina',
    type: 'expense',
    icon: '🏢',
    color: 'bg-slate-100 text-slate-800',
    isActive: true
  },
  {
    id: 'insurance',
    name: 'Seguros',
    type: 'expense',
    icon: '🛡️',
    color: 'bg-teal-100 text-teal-800',
    isActive: true
  },
  {
    id: 'professional_services',
    name: 'Servicios Profesionales',
    type: 'expense',
    icon: '⚖️',
    color: 'bg-violet-100 text-violet-800',
    isActive: true
  },
  {
    id: 'utilities',
    name: 'Suministros',
    type: 'expense',
    icon: '💡',
    color: 'bg-yellow-100 text-yellow-800',
    isActive: true
  },

  // GASTOS FINANCIEROS Y FISCALES
  {
    id: 'bank_fees',
    name: 'Comisiones Bancarias',
    type: 'expense',
    icon: '🏦',
    color: 'bg-gray-100 text-gray-800',
    isActive: true
  },
  {
    id: 'interest',
    name: 'Intereses',
    type: 'expense',
    icon: '📈',
    color: 'bg-red-100 text-red-800',
    isActive: true
  },
  {
    id: 'taxes',
    name: 'Impuestos',
    type: 'expense',
    icon: '🏛️',
    color: 'bg-red-100 text-red-800',
    isActive: true
  },

  // INVERSIONES
  {
    id: 'equipment',
    name: 'Equipos',
    type: 'expense',
    icon: '🔧',
    color: 'bg-blue-100 text-blue-800',
    isActive: true
  },
  {
    id: 'technology',
    name: 'Tecnología',
    type: 'expense',
    icon: '💻',
    color: 'bg-purple-100 text-purple-800',
    isActive: true
  }
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'cash',
    name: 'Efectivo',
    type: 'cash'
  },
  {
    id: 'bank_transfer',
    name: 'Transferencia Bancaria',
    type: 'transfer',
    account: 'ES76 2100 0813 1234 5678 9012'
  },
  {
    id: 'credit_card',
    name: 'Tarjeta de Crédito',
    type: 'card',
    fees: 1.5
  },
  {
    id: 'debit_card',
    name: 'Tarjeta de Débito',
    type: 'card',
    fees: 0.5
  },
  {
    id: 'check',
    name: 'Cheque',
    type: 'check'
  },
  {
    id: 'promissory_note',
    name: 'Pagaré',
    type: 'other'
  },
  {
    id: 'direct_debit',
    name: 'Domiciliación',
    type: 'transfer'
  }
];

export const defaultKPIs = [
  'Liquidez Actual',
  'Flujo Neto Mensual',
  'Días de Caja',
  'Ratio de Liquidez',
  'EBITDA Operativo',
  'Desviación Presupuestaria',
  'Cobertura de Gastos Fijos',
  'Rotación de Cuentas por Cobrar'
];