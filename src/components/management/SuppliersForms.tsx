import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Save, AlertCircle } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  title: string;
  initialData?: any;
  isLoading?: boolean;
}

export const SupplierFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  setFormData: (data: any) => void;
  isLoading: boolean;
  isEdit?: boolean;
}> = ({ isOpen, onClose, onSubmit, formData, setFormData, isLoading, isEdit = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
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
                value={formData.supplier_code}
                onChange={(e) => setFormData({ ...formData, supplier_code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Comercial *</label>
              <input
                type="text"
                value={formData.commercial_name}
                onChange={(e) => setFormData({ ...formData, commercial_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Razón Social</label>
              <input
                type="text"
                value={formData.legal_name}
                onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CIF/NIF</label>
              <input
                type="text"
                value={formData.cif_nif}
                onChange={(e) => setFormData({ ...formData, cif_nif: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Materiales">Materiales</option>
                <option value="Equipos">Equipos</option>
                <option value="Servicios">Servicios</option>
                <option value="Subcontratos">Subcontratos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Persona de Contacto</label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código Postal</label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plazo de Pago (días)</label>
              <input
                type="number"
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: parseInt(e.target.value) || 30 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
              <input
                type="text"
                value={formData.bank_account}
                onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valoración (0-5)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
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
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
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
              {isLoading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Crear Proveedor')}
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
  supplier: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}> = ({ isOpen, onClose, supplier, activeTab, setActiveTab, children }) => {
  if (!isOpen || !supplier) return null;

  const tabs = [
    { id: 'info', label: 'Información' },
    { id: 'contracts', label: 'Contratos' },
    { id: 'orders', label: 'Órdenes' },
    { id: 'invoices', label: 'Facturas' },
    { id: 'payments', label: 'Pagos' },
    { id: 'incidents', label: 'Incidencias' },
    { id: 'notes', label: 'Notas' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{supplier.commercial_name}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
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

export const ImportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onDownloadTemplate: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImport: () => void;
  importPreview: any[];
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
}> = ({ isOpen, onClose, onDownloadTemplate, onFileSelect, onImport, importPreview, isLoading, fileInputRef }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Importar Proveedores desde Excel</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Instrucciones</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Descarga la plantilla de Excel haciendo clic en el botón inferior</li>
              <li>Completa la plantilla con los datos de tus proveedores</li>
              <li>Guarda el archivo como CSV (delimitado por punto y coma)</li>
              <li>Selecciona el archivo y haz clic en "Importar"</li>
            </ol>
          </div>

          <div className="mb-6">
            <button
              type="button"
              onClick={onDownloadTemplate}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center space-x-2 text-gray-700"
            >
              <span>Descargar Plantilla Excel</span>
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar archivo CSV
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={onFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {importPreview.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Vista Previa ({importPreview.length} registros)
              </h3>
              <div className="max-h-64 overflow-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Código</th>
                      <th className="px-4 py-2 text-left">Nombre</th>
                      <th className="px-4 py-2 text-left">CIF/NIF</th>
                      <th className="px-4 py-2 text-left">Categoría</th>
                      <th className="px-4 py-2 text-left">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {importPreview.slice(0, 10).map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{row['Código'] || row['Codigo'] || '-'}</td>
                        <td className="px-4 py-2">{row['Nombre Comercial'] || row['Nombre'] || '-'}</td>
                        <td className="px-4 py-2">{row['CIF/NIF'] || row['CIF'] || '-'}</td>
                        <td className="px-4 py-2">{row['Categoría'] || row['Categoria'] || '-'}</td>
                        <td className="px-4 py-2">{row['Email'] || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {importPreview.length > 10 && (
                  <div className="p-2 text-center text-sm text-gray-500 bg-gray-50">
                    ... y {importPreview.length - 10} registros más
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onImport}
              disabled={isLoading || importPreview.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Importando...' : `Importar ${importPreview.length} Proveedores`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InfoTab: React.FC<{ supplier: any }> = ({ supplier }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600">Código</label>
          <p className="text-gray-900 font-medium">{supplier.supplier_code}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Nombre Comercial</label>
          <p className="text-gray-900 font-medium">{supplier.commercial_name}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Razón Social</label>
          <p className="text-gray-900 font-medium">{supplier.legal_name || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">CIF/NIF</label>
          <p className="text-gray-900 font-medium">{supplier.cif_nif || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Categoría</label>
          <p className="text-gray-900 font-medium">{supplier.category}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Valoración</label>
          <p className="text-gray-900 font-medium">{supplier.rating.toFixed(1)}/5</p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-4">Contacto</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600">Persona de Contacto</label>
          <p className="text-gray-900 font-medium">{supplier.contact_person || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Teléfono</label>
          <p className="text-gray-900 font-medium">{supplier.phone || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <p className="text-gray-900 font-medium">{supplier.email || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Dirección</label>
          <p className="text-gray-900 font-medium">{supplier.address || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Ciudad</label>
          <p className="text-gray-900 font-medium">{supplier.city || 'N/A'}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Código Postal</label>
          <p className="text-gray-900 font-medium">{supplier.postal_code || 'N/A'}</p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-4">Información Financiera</h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600">Plazo de Pago</label>
          <p className="text-gray-900 font-medium">{supplier.payment_terms} días</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">IBAN</label>
          <p className="text-gray-900 font-medium">{supplier.bank_account || 'N/A'}</p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-4">Certificaciones</h3>
      <div className="flex flex-wrap gap-2">
        {(supplier.certifications || []).length > 0 ? (
          supplier.certifications.map((cert: string, idx: number) => (
            <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {cert}
            </span>
          ))
        ) : (
          <p className="text-gray-500">Sin certificaciones</p>
        )}
      </div>
    </div>
  </div>
);

export const GenericDataTable: React.FC<{
  title: string;
  data: any[];
  columns: { key: string; label: string; render?: (value: any, item: any) => React.ReactNode }[];
  onAdd: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
  emptyMessage?: string;
}> = ({ title, data, columns, onAdd, onEdit, onDelete, emptyMessage = 'No hay datos disponibles' }) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
      >
        <Plus className="h-4 w-4" />
        <span>Agregar</span>
      </button>
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
