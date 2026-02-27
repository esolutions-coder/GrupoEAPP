import React, { useState } from 'react';
import { Building2, Plus, Search, Phone, Mail, MapPin, TrendingUp, DollarSign, Calendar, Star, User, FileText } from 'lucide-react';

const Clients: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const clients = [
    {
      id: 1,
      name: 'Ministerio de Transportes',
      type: 'Público',
      contact: 'Director Técnico Regional',
      phone: '+34 915 123 456',
      email: 'direccion.tecnica@mitma.es',
      address: 'Paseo de la Castellana 67, Madrid',
      activeProjects: 2,
      completedProjects: 8,
      totalRevenue: 4500000,
      lastProject: 'Autopista A-7 Valencia',
      lastProjectDate: '2024-01-15',
      paymentTerms: '60 días',
      rating: 4.8,
      status: 'Activo',
      sector: 'Infraestructuras'
    },
    {
      id: 2,
      name: 'Inmobiliaria Mediterránea S.L.',
      type: 'Privado',
      contact: 'Ana García Ruiz',
      phone: '+34 963 456 789',
      email: 'ana.garcia@inmo-med.es',
      address: 'Avenida del Puerto 123, Valencia',
      activeProjects: 1,
      completedProjects: 5,
      totalRevenue: 2800000,
      lastProject: 'Edificio Residencial Marina',
      lastProjectDate: '2024-02-01',
      paymentTerms: '30 días',
      rating: 4.6,
      status: 'Activo',
      sector: 'Residencial'
    },
    {
      id: 3,
      name: 'Ayuntamiento de Valencia',
      type: 'Público',
      contact: 'Concejalía de Urbanismo',
      phone: '+34 963 525 478',
      email: 'urbanismo@valencia.es',
      address: 'Plaza del Ayuntamiento 1, Valencia',
      activeProjects: 1,
      completedProjects: 12,
      totalRevenue: 3200000,
      lastProject: 'Polígono Industrial Norte',
      lastProjectDate: '2024-03-10',
      paymentTerms: '90 días',
      rating: 4.4,
      status: 'Activo',
      sector: 'Urbanización'
    },
    {
      id: 4,
      name: 'Constructora Levante S.A.',
      type: 'Privado',
      contact: 'Carlos Martínez López',
      phone: '+34 965 789 012',
      email: 'carlos.martinez@const-levante.es',
      address: 'Polígono Industrial Sur, Alicante',
      activeProjects: 0,
      completedProjects: 15,
      totalRevenue: 5600000,
      lastProject: 'Centro Comercial Mediterráneo',
      lastProjectDate: '2023-11-20',
      paymentTerms: '45 días',
      rating: 4.9,
      status: 'Inactivo',
      sector: 'Comercial'
    },
    {
      id: 5,
      name: 'Desarrollos Inmobiliarios Costa Blanca',
      type: 'Privado',
      contact: 'María José Fernández',
      phone: '+34 966 234 567',
      email: 'mj.fernandez@dic-blanca.es',
      address: 'Avenida de la Playa 45, Benidorm',
      activeProjects: 2,
      completedProjects: 7,
      totalRevenue: 3800000,
      lastProject: 'Complejo Turístico Sunset',
      lastProjectDate: '2024-01-20',
      paymentTerms: '30 días',
      rating: 4.7,
      status: 'Activo',
      sector: 'Turístico'
    }
  ];

  const filteredClients = selectedFilter === 'all' 
    ? clients 
    : clients.filter(client => {
        if (selectedFilter === 'activo') return client.status === 'Activo';
        if (selectedFilter === 'inactivo') return client.status === 'Inactivo';
        if (selectedFilter === 'publico') return client.type === 'Público';
        if (selectedFilter === 'privado') return client.type === 'Privado';
        return true;
      });

  const stats = [
    { 
      label: 'Total Clientes', 
      value: clients.length.toString(), 
      icon: Building2, 
      color: 'text-blue-600' 
    },
    { 
      label: 'Clientes Activos', 
      value: clients.filter(c => c.status === 'Activo').length.toString(), 
      icon: TrendingUp, 
      color: 'text-green-600' 
    },
    { 
      label: 'Facturación Total', 
      value: `€${(clients.reduce((sum, c) => sum + c.totalRevenue, 0) / 1000000).toFixed(1)}M`, 
      icon: DollarSign, 
      color: 'text-purple-600' 
    },
    { 
      label: 'Proyectos Activos', 
      value: clients.reduce((sum, c) => sum + c.activeProjects, 0).toString(), 
      icon: Calendar, 
      color: 'text-orange-600' 
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Inactivo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Público': return 'bg-blue-100 text-blue-800';
      case 'Privado': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h2>
          <p className="text-gray-600">Administra la cartera de clientes y proyectos</p>
        </div>
        <div className="flex space-x-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Informe Clientes</span>
          </button>
          <button className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent">
            <option>Todos los sectores</option>
            <option>Infraestructuras</option>
            <option>Residencial</option>
            <option>Comercial</option>
            <option>Turístico</option>
            <option>Urbanización</option>
          </select>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'activo', label: 'Activos' },
            { id: 'inactivo', label: 'Inactivos' },
            { id: 'publico', label: 'Públicos' },
            { id: 'privado', label: 'Privados' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedFilter === filter.id
                  ? 'bg-corporate-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Lista de Clientes</h3>
        <div className="space-y-6">
        {filteredClients.map((client) => (
          <div key={client.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{client.name}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(client.type)}`}>
                    {client.type}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                    {client.status}
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {client.sector}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-700">{client.rating}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>{client.contact}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{client.address}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-600">Proyectos activos:</span>
                <div className="font-semibold text-green-600">{client.activeProjects}</div>
              </div>
              <div>
                <span className="text-gray-600">Proyectos completados:</span>
                <div className="font-semibold text-gray-900">{client.completedProjects}</div>
              </div>
              <div>
                <span className="text-gray-600">Facturación total:</span>
                <div className="font-semibold text-gray-900">€{client.totalRevenue.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Condiciones pago:</span>
                <div className="font-semibold text-gray-900">{client.paymentTerms}</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Último proyecto:</span> {client.lastProject}
              </div>
              <div className="text-sm text-gray-500">
                Fecha inicio: {client.lastProjectDate}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
              <div className="text-xs text-gray-500">
                Relación comercial desde {new Date(client.lastProjectDate).getFullYear() - Math.floor(Math.random() * 5)}
              </div>
              <div className="flex space-x-2">
                <button className="text-corporate-blue-600 hover:text-corporate-blue-900">
                  <FileText className="h-4 w-4" />
                </button>
                <button className="text-green-600 hover:text-green-900">
                  <Phone className="h-4 w-4" />
                </button>
                <button className="text-purple-600 hover:text-purple-900">
                  <Mail className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>

      {/* Client Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento por Tipo de Cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Clientes Públicos</h4>
            {clients.filter(c => c.type === 'Público').map((client) => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{client.name}</div>
                  <div className="text-sm text-gray-600">{client.activeProjects} activos</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">€{(client.totalRevenue / 1000000).toFixed(1)}M</div>
                  <div className="text-sm text-gray-600">{client.paymentTerms}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Clientes Privados</h4>
            {clients.filter(c => c.type === 'Privado').map((client) => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{client.name}</div>
                  <div className="text-sm text-gray-600">{client.activeProjects} activos</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">€{(client.totalRevenue / 1000000).toFixed(1)}M</div>
                  <div className="text-sm text-gray-600">{client.paymentTerms}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;