import React, { useState } from 'react';
import { Award, Plus, Search, Calendar, AlertTriangle, CheckCircle, Clock, User, FileText, Download } from 'lucide-react';

const Certifications: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const certifications = [
    {
      id: 1,
      worker: 'Juan García Martínez',
      position: 'Oficial de Albañilería',
      certification: 'PRL 20 Horas',
      issueDate: '2023-06-15',
      expiryDate: '2026-06-15',
      status: 'Vigente',
      issuer: 'FREMAP',
      documentUrl: '#'
    },
    {
      id: 2,
      worker: 'María López Fernández',
      position: 'Operadora de Excavadora',
      certification: 'PRL Maquinaria Pesada',
      issueDate: '2023-08-20',
      expiryDate: '2026-08-20',
      status: 'Vigente',
      issuer: 'ASEPEYO',
      documentUrl: '#'
    },
    {
      id: 3,
      worker: 'Carlos Ruiz Sánchez',
      position: 'Soldador Especializado',
      certification: 'Certificación Soldadura TIG/MIG',
      issueDate: '2022-11-10',
      expiryDate: '2025-11-10',
      status: 'Próximo a vencer',
      issuer: 'CESOL',
      documentUrl: '#'
    },
    {
      id: 4,
      worker: 'Ana Martínez Torres',
      position: 'Coordinadora de Seguridad',
      certification: 'Coordinador de Seguridad y Salud',
      issueDate: '2021-03-15',
      expiryDate: '2024-03-15',
      status: 'Vencido',
      issuer: 'Colegio de Arquitectos Técnicos',
      documentUrl: '#'
    },
    {
      id: 5,
      worker: 'Pedro González Ruiz',
      position: 'Gruista',
      certification: 'Operador de Grúa Torre',
      issueDate: '2023-09-05',
      expiryDate: '2028-09-05',
      status: 'Vigente',
      issuer: 'AENOR',
      documentUrl: '#'
    },
    {
      id: 6,
      worker: 'Laura Jiménez Vega',
      position: 'Técnico en PRL',
      certification: 'Técnico Superior en PRL',
      issueDate: '2022-01-20',
      expiryDate: '2027-01-20',
      status: 'Vigente',
      issuer: 'Universidad Politécnica Valencia',
      documentUrl: '#'
    }
  ];

  const certificationTypes = [
    { id: 'PRL', name: 'Prevención Riesgos Laborales', count: 45, color: 'bg-red-100 text-red-800' },
    { id: 'Maquinaria', name: 'Operación de Maquinaria', count: 28, color: 'bg-orange-100 text-orange-800' },
    { id: 'Soldadura', name: 'Certificaciones Soldadura', count: 15, color: 'bg-blue-100 text-blue-800' },
    { id: 'Coordinacion', name: 'Coordinación y Gestión', count: 8, color: 'bg-purple-100 text-purple-800' },
    { id: 'Especializadas', name: 'Certificaciones Especializadas', count: 22, color: 'bg-green-100 text-green-800' }
  ];

  const filteredCertifications = selectedFilter === 'all' 
    ? certifications 
    : certifications.filter(cert => {
        if (selectedFilter === 'vigente') return cert.status === 'Vigente';
        if (selectedFilter === 'vencido') return cert.status === 'Vencido';
        if (selectedFilter === 'proximo') return cert.status === 'Próximo a vencer';
        return true;
      });

  const stats = [
    { label: 'Total Certificaciones', value: '342', icon: Award, color: 'text-blue-600' },
    { label: 'Vigentes', value: '298', icon: CheckCircle, color: 'text-green-600' },
    { label: 'Próximas a Vencer', value: '28', icon: Clock, color: 'text-yellow-600' },
    { label: 'Vencidas', value: '16', icon: AlertTriangle, color: 'text-red-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Vigente': return 'bg-green-100 text-green-800';
      case 'Próximo a vencer': return 'bg-yellow-100 text-yellow-800';
      case 'Vencido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Certificaciones</h2>
          <p className="text-gray-600">Control de certificaciones y formación del personal</p>
        </div>
        <div className="flex space-x-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Programar Formación</span>
          </button>
          <button className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nueva Certificación</span>
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

      {/* Certification Types */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Certificaciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {certificationTypes.map((type) => (
            <div key={type.id} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 mb-1">{type.count}</div>
              <div className="text-sm text-gray-600 mb-2">{type.name}</div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${type.color}`}>
                {type.id}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar certificaciones..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent">
            <option>Todos los tipos</option>
            <option>PRL</option>
            <option>Maquinaria</option>
            <option>Soldadura</option>
            <option>Coordinación</option>
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Todas', count: certifications.length },
            { id: 'vigente', label: 'Vigentes', count: certifications.filter(c => c.status === 'Vigente').length },
            { id: 'proximo', label: 'Próximas a Vencer', count: certifications.filter(c => c.status === 'Próximo a vencer').length },
            { id: 'vencido', label: 'Vencidas', count: certifications.filter(c => c.status === 'Vencido').length }
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
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      {/* Certifications Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Certificaciones del Personal</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trabajador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emisor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCertifications.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-corporate-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-corporate-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{cert.worker}</div>
                        <div className="text-sm text-gray-500">{cert.position}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{cert.certification}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cert.issuer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Emisión: {cert.issueDate}</div>
                    <div>Vence: {cert.expiryDate}</div>
                    {cert.status === 'Próximo a vencer' && (
                      <div className="text-yellow-600 font-medium">
                        {getDaysUntilExpiry(cert.expiryDate)} días restantes
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(cert.status)}`}>
                      {cert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-corporate-blue-600 hover:text-corporate-blue-900">
                        <FileText className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Download className="h-4 w-4" />
                      </button>
                      {cert.status === 'Vencido' || cert.status === 'Próximo a vencer' ? (
                        <button className="text-yellow-600 hover:text-yellow-900">
                          <Calendar className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Certifications;