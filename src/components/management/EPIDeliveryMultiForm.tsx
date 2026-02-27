import React, { useState } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { EPIItem, EPIDeliveryFormData } from '../../types/epi';

interface EPIDeliveryMultiFormProps {
  workers: any[];
  items: EPIItem[];
  onSubmit: (formData: EPIDeliveryFormData) => Promise<void>;
  onCancel: () => void;
}

export const EPIDeliveryMultiForm: React.FC<EPIDeliveryMultiFormProps> = ({
  workers,
  items,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<EPIDeliveryFormData>({
    worker_id: '',
    delivery_date: new Date().toISOString().split('T')[0],
    delivered_by: 'Admin',
    notes: '',
    items: []
  });

  const [currentItem, setCurrentItem] = useState({
    epi_item_id: '',
    quantity: 1,
    size: '',
    notes: ''
  });

  const addItemToDelivery = () => {
    if (!currentItem.epi_item_id || currentItem.quantity <= 0) {
      alert('Selecciona un EPI y cantidad válida');
      return;
    }

    const item = items.find(i => i.id === currentItem.epi_item_id);
    if (!item || item.current_stock < currentItem.quantity) {
      alert('Stock insuficiente para este EPI');
      return;
    }

    const exists = formData.items.find(i => i.epi_item_id === currentItem.epi_item_id);
    if (exists) {
      alert('Este EPI ya está en la lista. Elimínalo primero si quieres agregarlo de nuevo.');
      return;
    }

    setFormData({
      ...formData,
      items: [...formData.items, { ...currentItem }]
    });

    setCurrentItem({
      epi_item_id: '',
      quantity: 1,
      size: '',
      notes: ''
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.worker_id) {
      alert('Selecciona un trabajador');
      return;
    }

    if (formData.items.length === 0) {
      alert('Agrega al menos un EPI a la entrega');
      return;
    }

    await onSubmit(formData);
  };

  const selectedItem = items.find(i => i.id === currentItem.epi_item_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Nueva Entrega de EPIs</h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trabajador *
              </label>
              <select
                value={formData.worker_id}
                onChange={(e) => setFormData({ ...formData, worker_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar trabajador</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.first_name} {worker.last_name} - {worker.worker_code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Entrega *
              </label>
              <input
                type="date"
                value={formData.delivery_date}
                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entregado por
              </label>
              <input
                type="text"
                value={formData.delivered_by}
                onChange={(e) => setFormData({ ...formData, delivered_by: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Generales
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Observaciones generales de la entrega"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Agregar EPIs a la Entrega</h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">EPI *</label>
                <select
                  value={currentItem.epi_item_id}
                  onChange={(e) => setCurrentItem({ ...currentItem, epi_item_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar EPI</option>
                  {items.filter(i => i.status === 'active' && i.current_stock > 0).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Stock: {item.current_stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem?.current_stock || 999}
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Talla</label>
                {selectedItem?.sizes_available && selectedItem.sizes_available.length > 0 ? (
                  <select
                    value={currentItem.size}
                    onChange={(e) => setCurrentItem({ ...currentItem, size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sin talla</option>
                    {selectedItem.sizes_available.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={currentItem.size}
                    onChange={(e) => setCurrentItem({ ...currentItem, size: e.target.value })}
                    placeholder="Talla"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acción</label>
                <button
                  type="button"
                  onClick={addItemToDelivery}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Agregar
                </button>
              </div>
            </div>

            <div>
              <input
                type="text"
                value={currentItem.notes}
                onChange={(e) => setCurrentItem({ ...currentItem, notes: e.target.value })}
                placeholder="Notas específicas para este EPI"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {formData.items.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                EPIs a Entregar ({formData.items.length})
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">EPI</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Talla</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => {
                      const epiItem = items.find(i => i.id === item.epi_item_id);
                      return (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{epiItem?.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.size || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.notes || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={formData.items.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              Registrar Entrega
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
