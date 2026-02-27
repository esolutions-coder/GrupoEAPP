import React, { useState } from 'react';
import { Users, Plus, Search, User, MapPin, Calendar, Star, Award, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const Teams: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const teams = [
    {
      id: 1,
      name: 'Equipo Autopista A-7',
      project: 'Autopista A-7 Valencia',
      leader: 'Ana Martínez Torres',
      members: [
        { name: 'Juan García', role: 'Oficial Albañilería', experience: '8 años' },
        { name: 'María López', role: 'Operadora Excavadora', experience: '5 años' },
        { name: 'Carlos Ruiz', role: 'Soldador', experience: '12 años' },
        { name: 'Pedro González', role: 'Gruista', experience: '10 años' },
        { name: 'Luis Fernández', role: 'Peón Especializado', experience: '3 años' }
      ],
      totalMembers: 15,
      location: 'Valencia, España',
      startDate: '2024-01-15',
      expectedEndDate: '2024-06-15',
      progress: 75,
      performance: 4.8,
      status: 'Activo',
      specializations: ['Obra Civil', 'Movimiento Tierras', 'Pavimentación'],
      currentPhase: 'Pavimentación y acabados'
    },
    {
      id: 2,
      name: 'Equipo Marina Residencial',
      project: 'Edificio Residencial Marina',
      leader: 'Pedro González Ruiz',
      members: [
        { name: 'Carmen Vega', role: 'Oficial Albañilería', experience: '6 años' },
        { name: 'Antonio Ruiz', role: 'Ferrallista', experience: '9 años' },
        { name: 'Isabel Torres', role: 'Pintora', experience: '4 años' },
        { name: 'Miguel Sánchez', role: 'Electricista', experience: '7 años' }
      ],
      totalMembers: 12,
      location: 'Alicante, España',
      startDate: '2024-02-01',
      expectedEndDate: '2024-08-20',
      progress: 60,
      performance: 4.6,
      status: 'Activo',
      specializations: ['Edificación', 'Instalaciones', 'Acabados'],
      currentPhase: 'Estructura y cerramientos'
    },
    {
      id: 3,
      name: 'Equipo Polígono Industrial',
      project: 'Polígono Industrial Norte',
      leader: 'Carlos Martínez López',
      members: [
        { name: 'Francisco Gil', role: 'Operador Bulldozer', experience: '11 años' },
        { name: 'Rosa Jiménez', role: 'Topógrafa', experience: '8 años' },
        { name: 'Andrés Moreno', role: 'Oficial Fontanería', experience: '6 años' },
        { name: 'Elena Castillo', role: 'Técnico Calidad', experience: '5 años' }
      ],
      totalMembers: 10,
      location: 'Valencia, España',
      startDate: '2024-03-10',
      expectedEndDate: '2024-09-10',
      progress: 25,
      performance: 4.4,
      status: 'Activo',
      specializations: ['Urbanización', 'Infraestructuras', 'Servicios'],
      currentPhase: 'Movimiento de tierras'
    },
    {
      id: 4,
      name: 'Equipo Mantenimiento',
      project: 'Múltiples proyectos',
      leader: 'Laura Jiménez Vega',
      members: [
        { name: 'Roberto Díaz', role: 'Mecánico', experience: '15 años' },
        { name: 'Silvia Herrera', role: 'Electricista', experience: '7 años' },
        { name: 'Javier Ortega', role: 'Soldador', experience: '9 años' }
      ],
      totalMembers: 8,
      location: 'Base Central Valencia',
      startDate: '2024-01-01',
      expectedEndDate: '2024-12-31',
      progress: 100,
      performance: 4.9,
      status: 'Activo',
      specializations: ['Mantenimiento', 'Reparaciones', 'Soporte Técnico'],
      currentPhase: 'Soporte continuo'
    },
    {
      id: 5,
      name: 'Equipo Centro Comercial',
      project: 'Centro Comercial Mediterráneo',
      leader: 'José Antonio Ruiz',
      members: [
        { name: 'Patricia Morales', role: 'Arquitecta Técnica', experience: '10 años' },
        { name: 'David López', role: 'Jefe de Obra', experience: '12 años' },
        { name: 'Cristina Vega', role: 'Coordinadora Seguridad', experience: '8 años' }
      ],
      totalMembers: 18,
      location: 'Castellón, España',
      startDate: '2023-09-01',
      expectedEndDate: '2024-02-28',
      progress: 95,
      performance: 4.7,
      status: 'Finalizando',
      specializations: ['Edificación Comercial', 'Instalaciones Complejas', 'Acabados Premium'],
      currentPhase: 'Entrega y acabados finales'
    }
  ];

  const filteredTeams = selectedFilter === 'all' 
    ? teams 
    : teams.filter(team => {
        if (selectedFilter === 'activo') return team.status === 'Activo';
        if (selectedFilter === 'finalizando') return team.status === 'Finalizando';
        return true;
      });

  const stats = [
    { label: 'Equipos Totales', value: teams.length.toString(), icon: Users, color: 'text-blue-600' },
    { label: 'Equipos Activos', value: teams.filter(t => t.status === 'Activo').length.toString(), icon: CheckCircle, color: 'text-green-600' },
    { label: 'Total Miembros', value: teams.reduce((sum, t) => sum + t.totalMembers, 0).toString(), icon: User, color: 'text-purple-600' },
    { label: 'Rendimiento Promedio', value: (teams.reduce((sum, t) => sum + t.performance, 0) / teams.length).toFixed(1), icon: Star, color: 'text-yellow-600' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Activo': return 'bg-green-100 text-green-800';
      case 'Finalizando': return 'bg-blue-100 text-blue-800';
      case 'Pausado': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 4.5) return 'text-green-600';
    if (performance >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Equipos</h2>
          <p className="text-gray-600">Organización y seguimiento de equipos de trabajo</p>
        </div>
        <div className="flex space-x-3">
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Análisis Rendimiento</span>
          </button>
          <button className="bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Nuevo Equipo</span>
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
                placeholder="Buscar equipos o proyectos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent">
            <option>Todas las especializaciones</option>
            <option>Obra Civil</option>
            <option>Edificación</option>
            <option>Urbanización</option>
            <option>Mantenimiento</option>
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'activo', label: 'Activos' },
            { id: 'finalizando', label: 'Finalizando' }
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

      {/* Teams Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Lista de Equipos</h3>
        <div className="space-y-6">
          {filteredTeams.map((team) => (
            <div key={team.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-corporate-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-corporate-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-600">{team.project}</p>
                    <p className="text-xs text-gray-500">Líder: {team.leader}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(team.status)}`}>
                    {team.status}
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-corporate-blue-600">{team.totalMembers}</div>
                    <div className="text-xs text-gray-500">miembros</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-600">Ubicación:</span>
                  <div className="font-medium text-gray-900">{team.location}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Fase Actual:</span>
                  <div className="font-medium text-gray-900">{team.currentPhase}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Progreso:</span>
                  <div className="font-bold text-green-600">{team.progress}%</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Rendimiento:</span>
                  <div className={`font-bold ${getPerformanceColor(team.performance)}`}>
                    {team.performance}/5.0 ⭐
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-sm text-gray-600 block mb-2">Especializaciones:</span>
                <div className="flex flex-wrap gap-2">
                  {team.specializations.map((spec, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-corporate-blue-100 text-corporate-blue-800 rounded">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <span className="text-sm text-gray-600 block mb-2">Miembros Clave:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {team.members.slice(0, 4).map((member, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900">{member.name}</span>
                      <span className="text-gray-600">{member.role}</span>
                    </div>
                  ))}
                  {team.members.length > 4 && (
                    <div className="text-sm text-corporate-blue-600 font-medium col-span-2">
                      +{team.members.length - 4} miembros más...
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <span className="text-sm text-gray-600 block mb-2">Progreso del Proyecto:</span>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-corporate-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${team.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{team.progress}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <div>Inicio: {team.startDate}</div>
                  <div>Fin previsto: {team.expectedEndDate}</div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-corporate-blue-600 hover:text-corporate-blue-900" title="Ver equipo">
                    <Users className="h-5 w-5" />
                  </button>
                  <button className="text-green-600 hover:text-green-900" title="Rendimiento">
                    <TrendingUp className="h-5 w-5" />
                  </button>
                  <button className="text-purple-600 hover:text-purple-900" title="Reconocimientos">
                    <Award className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Performance Summary - Mantenemos como estaba */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Rendimiento por Equipo</h3>
        <div className="space-y-4">
          {teams.map((team) => (
            <div key={team.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-corporate-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-corporate-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{team.name}</h4>
                  <p className="text-sm text-gray-600">{team.totalMembers} miembros • {team.leader}</p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Progreso</div>
                  <div className="font-semibold text-gray-900">{team.progress}%</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Rendimiento</div>
                  <div className={`font-semibold ${getPerformanceColor(team.performance)}`}>
                    {team.performance}/5.0
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Estado</div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(team.status)}`}>
                    {team.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Teams;