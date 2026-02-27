import React from 'react';
import { X, Plus, Edit, Trash2, Save } from 'lucide-react';
import type { Project } from '../../types/projects';
import { formatCurrency } from '../../utils/formatUtils';

export const ProjectFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  isLoading: boolean;
  isEdit?: boolean;
  clients: any[];
}> = ({ isOpen, onClose, onSubmit, formData, setFormData, isLoading, isEdit = false, clients }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Editar Obra' : 'Nueva Obra'}
            </h2>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
              <select
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Responsable</label>
              <input
                type="text"
                value={formData.project_manager}
                onChange={(e) => setFormData({ ...formData, project_manager: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio *</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin Prevista</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio/Hora Operarios (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.hourly_rate_labor}
                onChange={(e) => setFormData({ ...formData, hourly_rate_labor: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Precio/Hora Maquinaria (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.hourly_rate_machinery}
                onChange={(e) => setFormData({ ...formData, hourly_rate_machinery: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Presupuesto (€)</label>
              <input
                type="number"
                step="0.01"
                value={formData.budget_amount}
                onChange={(e) => setFormData({ ...formData, budget_amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="planning">Planificación</option>
                <option value="in_progress">En Progreso</option>
                <option value="paused">Pausado</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-4 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Crear Obra')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ViewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, project, activeTab, setActiveTab, children }) => {
  if (!isOpen || !project) return null;

  const tabs = [
    { id: 'info', label: 'Información' },
    { id: 'budget', label: 'Presupuesto' },
    { id: 'measurements', label: 'Mediciones' },
    { id: 'certifications', label: 'Certificaciones' },
    { id: 'costs', label: 'Análisis' },
    { id: 'quality', label: 'Calidad/Seguridad' },
    { id: 'documents', label: 'Documentación' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
              <p className="text-gray-600">{project.code}</p>
            </div>
            <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const InfoTab: React.FC<{ project: Project; client: any }> = ({ project, client }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <h3 className="text-lg font-semibold mb-4">Datos Generales</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600">Código</label>
          <p className="text-gray-900 font-medium">{project.code}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Nombre</label>
          <p className="text-gray-900 font-medium">{project.name}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Cliente</label>
          <p className="text-gray-900 font-medium">{client?.name || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Responsable</label>
          <p className="text-gray-900 font-medium">{project.project_manager || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Estado</label>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            project.status === 'completed' ? 'bg-green-100 text-green-800' :
            project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            project.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {project.status === 'completed' ? 'Completado' :
             project.status === 'in_progress' ? 'En Progreso' :
             project.status === 'cancelled' ? 'Cancelado' :
             project.status === 'paused' ? 'Pausado' : 'Planificación'}
          </span>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-4">Fechas y Ubicación</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600">Fecha Inicio</label>
          <p className="text-gray-900 font-medium">{project.start_date}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Fecha Fin</label>
          <p className="text-gray-900 font-medium">{project.end_date || 'No definida'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Dirección</label>
          <p className="text-gray-900 font-medium">{project.address || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Ciudad</label>
          <p className="text-gray-900 font-medium">{project.city || 'N/A'}</p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-4">Económico</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600">Presupuesto</label>
          <p className="text-gray-900 font-medium">{formatCurrency(project.budget_amount)}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Precio/Hora Operarios</label>
          <p className="text-gray-900 font-medium">{formatCurrency(project.hourly_rate_labor)}/h</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Precio/Hora Maquinaria</label>
          <p className="text-gray-900 font-medium">{formatCurrency(project.hourly_rate_machinery)}/h</p>
        </div>
      </div>
    </div>

    {project.description && (
      <div className="md:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Descripción</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
      </div>
    )}
  </div>
);

export const GenericDataTable: React.FC<{
  title: string;
  data: any[];
  columns: { key: string; label: string; render?: (value: any, item: any) => React.ReactNode }[];
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}> = ({ title, data, columns, onAdd, onEdit, onDelete, emptyMessage = 'No hay datos disponibles' }) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus className="h-4 w-4" />
          <span>Agregar</span>
        </button>
      )}
    </div>

    {data.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);
