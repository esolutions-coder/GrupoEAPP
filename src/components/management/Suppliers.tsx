import React, { useState } from 'react';
import { UserCheck, Plus, Search, Phone, Mail, MapPin, Star, TrendingUp, AlertTriangle, CheckCircle, Building2, Calendar, DollarSign, Eye, X, Save, Edit, Trash2, CreditCard, FileText, Clock, Download } from 'lucide-react';
import { exportToPDF, exportToExcel, printTable } from '../../utils/exportUtils';
import { handleCRUDOperation, showSuccessNotification, showErrorNotification } from '../../utils/modalUtils';

const Suppliers: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<'info' | 'invoices' | 'payments'>('info');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    invoiceId: '',
    name: '',
    type: 'invoice',
    file: null as File | null
  });

  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    amount: '',
    method: 'transfer',
    reference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    approvedBy: 'Ana Martínez',
    notes: ''
  });

  const suppliers = [
    {
      id: 1,
      name: 'Cementos Lafarge España',
      category: 'Materiales',
      contact: 'Pedro Martínez',
      phone: '+34 961 234 567',
      email: 'pedro.martinez@lafarge.es',
      address: 'Polígono Industrial Sur, Valencia',
      rating: 4.8,
      totalOrders: 156,
      totalInvoiced: 450000,
      totalPaid: 425000,
      pendingPayment: 25000,
      lastOrder: '2024-01-28',
      status: 'Activo',
      paymentTerms: '30 días',
      certifications: ['ISO 9001', 'CE'],
      invoices: [
        {
          id: 'INV-LAF-001',
          number: 'LAF-2024-001',
          date: '2024-01-15',
          dueDate: '2024-02-14',
          amount: 15000,
          description: 'Cemento Portland CEM I 42.5R - 300 toneladas',
          status: 'pending'
        },
        {
          id: 'INV-LAF-002',
          number: 'LAF-2024-002',
          date: '2024-01-20',
          dueDate: '2024-02-19',
          amount: 10000,
          description: 'Cemento blanco - 150 toneladas',
          status: 'pending'
        },
        {
          id: 'INV-LAF-003',
          number: 'LAF-2023-045',
          date: '2023-12-15',
          dueDate: '2024-01-14',
          amount: 18500,
          description: 'Cemento especial alta resistencia',
          status: 'paid'
        }
      ],
      payments: [
        {
          id: 'PAY-001',
          invoiceId: 'INV-LAF-003',
          invoiceNumber: 'LAF-2023-045',
          date: '2024-01-10',
          amount: 18500,
          method: 'transfer',
          reference: 'TRF-240110-001',
          approvedBy: 'Ana Martínez',
          notes: 'Pago dentro de plazo'
        }
      ],
      documents: [
        {
          id: 'DOC-LAF-001',
          invoiceId: 'INV-LAF-001',
          name: 'Factura LAF-2024-001.pdf',
          type: 'invoice',
          format: 'pdf',
          url: '#',
          uploadDate: '2024-01-15',
          uploadedBy: 'Ana Martínez',
          size: '245 KB'
        },
        {
          id: 'DOC-LAF-002',
          invoiceId: 'INV-LAF-001',
          name: 'Albarán entrega cemento.jpg',
          type: 'delivery_note',
          format: 'jpg',
          url: '#',
          uploadDate: '2024-01-15',
          uploadedBy: 'Pedro Martínez',
          size: '1.2 MB'
        }
      ]
    },
    {
      id: 2,
      name: 'Ferralla Mediterránea S.L.',
      category: 'Materiales',
      contact: 'Ana García',
      phone: '+34 963 456 789',
      email: 'ana.garcia@ferralla-med.es',
      address: 'Calle Industrial 45, Alicante',
      rating: 4.6,
      totalOrders: 89,
      totalInvoiced: 320000,
      totalPaid: 295000,
      pendingPayment: 25000,
      lastOrder: '2024-01-30',
      status: 'Activo',
      paymentTerms: '45 días',
      certifications: ['ISO 9001', 'AENOR'],
      invoices: [
        {
          id: 'INV-FER-001',
          number: 'FER-2024-001',
          date: '2024-01-25',
          dueDate: '2024-03-10',
          amount: 25000,
          description: 'Acero corrugado B500S - 15 toneladas',
          status: 'pending'
        }
      ],
      payments: [
        {
          id: 'PAY-002',
          invoiceId: 'INV-FER-002',
          invoiceNumber: 'FER-2023-089',
          date: '2024-01-05',
          amount: 22000,
          method: 'transfer',
          reference: 'TRF-240105-002',
          approvedBy: 'Carlos Ruiz',
          notes: 'Pago con descuento por pronto pago'
        }
      ],
      documents: [
        {
          id: 'DOC-FER-001',
          invoiceId: 'INV-FER-001',
          name: 'Factura FER-2024-001.pdf',
          type: 'invoice',
          format: 'pdf',
          url: '#',
          uploadDate: '2024-01-25',
          uploadedBy: 'Ana García',
          size: '189 KB'
        }
      ]
    },
    {
      id: 3,
      name: 'Maquinaria Levante',
      category: 'Equipos',
      contact: 'Carlos Ruiz',
      phone: '+34 965 789 012',
      email: 'carlos.ruiz@maq-levante.es',
      address: 'Avenida del Puerto 123, Castellón',
      rating: 4.9,
      totalOrders: 45,
      totalInvoiced: 180000,
      totalPaid: 165000,
      pendingPayment: 15000,
      lastOrder: '2024-01-25',
      status: 'Activo',
      paymentTerms: '60 días',
      certifications: ['CE', 'ISO 14001'],
      invoices: [
        {
          id: 'INV-MAQ-001',
          number: 'MAQ-2024-001',
          date: '2024-01-20',
          dueDate: '2024-03-20',
          amount: 15000,
          description: 'Alquiler excavadora CAT 320D - Enero',
          status: 'pending'
        }
      ],
      payments: [
        {
          id: 'PAY-003',
          invoiceId: 'INV-MAQ-002',
          invoiceNumber: 'MAQ-2023-125',
          date: '2024-01-08',
          amount: 12000,
          method: 'transfer',
          reference: 'TRF-240108-003',
          approvedBy: 'Pedro González',
          notes: 'Pago alquiler diciembre'
        }
      ],
      documents: [
        {
          id: 'DOC-MAQ-001',
          invoiceId: 'INV-MAQ-001',
          name: 'Contrato alquiler excavadora.pdf',
          type: 'contract',
          format: 'pdf',
          url: '#',
          uploadDate: '2024-01-20',
          uploadedBy: 'Carlos Ruiz',
          size: '567 KB'
        }
      ]
    },
    {
      id: 4,
      name: 'Transportes Valencia Norte',
      category: 'Servicios',
      contact: 'María López',
      phone: '+34 962 345 678',
      email: 'maria.lopez@tvn.es',
      address: 'Polígono Norte, Valencia',
      rating: 4.4,
      totalOrders: 234,
      totalInvoiced: 95000,
      totalPaid: 89000,
      pendingPayment: 6000,
      lastOrder: '2024-01-29',
      status: 'Activo',
      paymentTerms: '15 días',
      certifications: ['ISO 9001'],
      invoices: [
        {
          id: 'INV-TRA-001',
          number: 'TRA-2024-001',
          date: '2024-01-28',
          dueDate: '2024-02-12',
          amount: 6000,
          description: 'Transporte materiales - Enero',
          status: 'pending'
        }
      ],
      payments: [
        {
          id: 'PAY-004',
          invoiceId: 'INV-TRA-002',
          invoiceNumber: 'TRA-2023-234',
          date: '2024-01-15',
          amount: 5500,
          method: 'transfer',
          reference: 'TRF-240115-004',
          approvedBy: 'Ana Martínez',
          notes: 'Pago servicios diciembre'
        }
      ],
      documents: [
        {
          id: 'DOC-TRA-001',
          invoiceId: 'INV-TRA-001',
          name: 'Albarán transporte enero.jpg',
          type: 'delivery_note',
          format: 'jpg',
          url: '#',
          uploadDate: '2024-01-28',
          uploadedBy: 'María López',
          size: '890 KB'
        }
      ]
    },
    {
      id: 5,
      name: 'Hormigones del Mediterráneo',
      category: 'Materiales',
      contact: 'José Fernández',
      phone: '+34 964 567 890',
      email: 'jose.fernandez@hormigones-med.es',
      address: 'Carretera Nacional 340, Sagunto',
      rating: 4.7,
      totalOrders: 178,
      totalInvoiced: 680000,
      totalPaid: 632000,
      pendingPayment: 48000,
      lastOrder: '2024-01-31',
      status: 'Activo',
      paymentTerms: '30 días',
      certifications: ['ISO 9001', 'CE', 'AENOR'],
      invoices: [
        {
          id: 'INV-HOR-001',
          number: 'HOR-2024-001',
          date: '2024-01-25',
          dueDate: '2024-02-24',
          amount: 28000,
          description: 'Hormigón HA-25 - 350 m³',
          status: 'pending'
        },
        {
          id: 'INV-HOR-002',
          number: 'HOR-2024-002',
          date: '2024-01-30',
          dueDate: '2024-03-01',
          amount: 20000,
          description: 'Hormigón HM-20 - 250 m³',
          status: 'pending'
        }
      ],
      payments: [
        {
          id: 'PAY-005',
          invoiceId: 'INV-HOR-003',
          invoiceNumber: 'HOR-2023-178',
          date: '2024-01-12',
          amount: 32000,
          method: 'transfer',
          reference: 'TRF-240112-005',
          approvedBy: 'Carlos Ruiz',
          notes: 'Pago hormigón diciembre'
        }
      ],
      documents: [
        {
          id: 'DOC-HOR-001',
          invoiceId: 'INV-HOR-001',
          name: 'Factura HOR-2024-001.pdf',
          type: 'invoice',
          format: 'pdf',
          url: '#',
          uploadDate: '2024-01-25',
          uploadedBy: 'José Fernández',
          size: '234 KB'
        },
        {
          id: 'DOC-HOR-002',
          invoiceId: 'INV-HOR-002',
          name: 'Albarán hormigón HM-20.pdf',
          type: 'delivery_note',
          format: 'pdf',
          url: '#',
          uploadDate: '2024-01-30',
          uploadedBy: 'José Fernández',
          size: '156 KB'
        }
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'Todos', count: suppliers.length },
    { id: 'Materiales', label: 'Materiales', count: suppliers.filter(s => s.category === 'Materiales').length },
    { id: 'Equipos', label: 'Equipos', count: suppliers.filter(s => s.category === 'Equipos').length },
    { id: 'Servicios', label: 'Servicios', count: suppliers.filter(s => s.category === 'Servicios').length }
  ];

  const filteredSuppliers = selectedCategory === 'all' 
    ? suppliers 
    : suppliers.filter(supplier => supplier.category === selectedCategory);

  // Calcular estadísticas de pagos
  const totalPendingPayments = suppliers.reduce((sum, s) => sum + s.pendingPayment, 0);
  const totalPaidThisMonth = suppliers.reduce((sum, s) => 
    sum + s.payments.filter(p => p.date.startsWith('2024-01')).reduce((pSum, p) => pSum + p.amount, 0), 0
  );
  const totalOverdueInvoices = suppliers.reduce((sum, s) => 
    sum + s.invoices.filter(inv => inv.status === 'pending' && new Date(inv.dueDate) < new Date()).length, 0
  );

  const stats = [
    { label: 'Total Proveedores', value: '127', icon: UserCheck, color: 'text-blue-600' },
    { label: 'Facturas Pendientes', value: '€94.5K', icon: AlertTriangle, color: 'text-yellow-600' },
    { label: 'Pagos Este Mes', value: '€28.5K', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Facturas Vencidas', value: totalOverdueInvoices.toString(), icon: Clock, color: 'text-red-600' }
  ];

  // Funciones de acción
  const handleView = async (supplier: any) => {
    setSelectedSupplier(supplier);
    await handleCRUDOperation('read', 'Proveedor', supplier, supplier.id);
  };

  const handleEdit = (supplier: any) => {
    console.log('Editando proveedor:', supplier.id);
    showSuccessNotification('Función de edición activada');
  };

  const handleNewInvoice = (supplier: any