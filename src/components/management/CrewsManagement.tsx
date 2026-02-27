import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, User, CheckCircle, XCircle, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Crew, CrewMember, CrewWithMembers, CrewFormData } from '../../types/crews';
import { Worker } from '../../types/construction';

const CrewsManagement: React.FC = () => {
  const [crews, setCrews] = useState<CrewWithMembers[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCrew, setEditingCrew] = useState<CrewWithMembers | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const [formData, setFormData] = useState<CrewFormData>({
    code: '',
    name: '',
    leader_id: '',
    status: 'active',
    worker_ids: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadCrews(), loadWorkers()]);
    } catch (error: any) {
      showNotification('Error al cargar datos: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCrews = async () => {
    const { data: crewsData, error: crewsError } = await supabase
      .from('crews')
      .select('*')
      .order('name');

    if (crewsError) throw crewsError;

    const { data: membersData, error: membersError } = await supabase
      .from('crew_members')
      .select('*')
      .eq('status', 'active');

    if (membersError) throw membersError;

    const crewsWithMembers: CrewWithMembers[] = (crewsData || []).map(crew => {
      const members = (membersData || []).filter(m => m.crew_id === crew.id);
      return {
        ...crew,
        members,
        member_count: members.length,
        leader_name: crew.leader_id ? getWorkerName(crew.leader_id) : undefined
      };
    });

    setCrews(crewsWithMembers);
  };

  const loadWorkers = async () => {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('status', 'active')
      .order('first_name');

    if (error) throw error;

    const transformedWorkers: Worker[] = (data || []).map((w: any) => ({
      id: w.id,
      workerCode: w.worker_code,
      personalData: {
        firstName: w.first_name,
        lastName: w.last_name,
        dni: w.dni,
        dniExpiryDate: w.dni_expiry_date,
        address: w.address || '',
        city: w.city || '',
        postalCode: w.postal_code || '',
        phone: w.phone || '',
        email: w.email || '',
        emergencyContact: w.emergency_contact || '',
        emergencyPhone: w.emergency_phone || '',
        hasDriverLicense: w.has_driver_license,
        hasOwnVehicle: w.has_own_vehicle
      },
      professionalData: {
        category: w.category,
        prlType: w.prl_type || '',
        prlTraining: Array.isArray(w.prl_training) ? w.prl_training : [],
        prlExpiryDate: w.prl_expiry_date || '',
        medicalCheckDate: w.medical_check_date || '',
        medicalCheckExpiry: w.medical_check_expiry || '',
        epiDeliveryDate: w.epi_delivery_date || ''
      },
      contractData: {
        contractType: w.contract_type,
        hourlyRate: w.hourly_rate || 0,
        overtimeRate: w.overtime_rate || 0,
        hireDate: w.hire_date || '',
        vacationTotalDays: w.vacation_total_days || 30,
        vacationUsedDays: w.vacation_used_days || 0,
        vacationPendingDays: w.vacation_pending_days || 0,
        contractSigned: w.contract_signed || false,
        bankAccount: w.bank_account || '',
        digitalAccessUsername: w.digital_access_username || '',
        digitalAccessPassword: w.digital_access_password || ''
      },
      status: w.status,
      name: `${w.first_name} ${w.last_name}`,
      category: w.category
    }));

    setWorkers(transformedWorkers);
  };

  const getWorkerName = (workerId: string): string => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'N/A';
  };

  const handleCreate = () => {
    setEditingCrew(null);
    setFormData({
      code: '',
      name: '',
      leader_id: '',
      status: 'active',
      worker_ids: []
    });
    setShowForm(true);
  };

  const handleEdit = (crew: CrewWithMembers) => {
    setEditingCrew(crew);
    setFormData({
      code: crew.code,
      name: crew.name,
      leader_id: crew.leader_id || '',
      status: crew.status,
      worker_ids: crew.members.map(m => m.worker_id)
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta cuadrilla?')) return;

    try {
      const { error } = await supabase
        .from('crews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showNotification('Cuadrilla eliminada correctamente', 'success');
      loadCrews();
    } catch (error: any) {
      showNotification('Error al eliminar: ' + error.message, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name) {
      showNotification('Complete los campos requeridos', 'error');
      return;
    }

    setIsLoading(true);

    try {
      let crewId = editingCrew?.id;

      if (editingCrew) {
        const { error: updateError } = await supabase
          .from('crews')
          .update({
            code: formData.code,
            name: formData.name,
            leader_id: formData.leader_id || null,
            status: formData.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCrew.id);

        if (updateError) throw updateError;

        const { error: deleteError } = await supabase
          .from('crew_members')
          .delete()
          .eq('crew_id', editingCrew.id);

        if (deleteError) throw deleteError;
      } else {
        const { data: newCrew, error: insertError } = await supabase
          .from('crews')
          .insert({
            code: formData.code,
            name: formData.name,
            leader_id: formData.leader_id || null,
            status: formData.status
          })
          .select()
          .single();

        if (insertError) throw insertError;
        crewId = newCrew.id;
      }

      if (formData.worker_ids.length > 0) {
        const membersToInsert = formData.worker_ids.map(workerId => ({
          crew_id: crewId,
          worker_id: workerId,
          is_leader: workerId === formData.leader_id,
          status: 'active'
        }));

        const { error: membersError } = await supabase
          .from('crew_members')
          .insert(membersToInsert);

        if (membersError) throw membersError;
      }

      showNotification(
        editingCrew ? 'Cuadrilla actualizada correctamente' : 'Cuadrilla creada correctamente',
        'success'
      );
      setShowForm(false);
      setEditingCrew(null);
      loadCrews();
    } catch (error: any) {
      showNotification('Error: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWorkerSelection = (workerId: string) => {
    if (formData.worker_ids.includes(workerId)) {
      setFormData({
        ...formData,
        worker_ids: formData.worker_ids.filter(id => id !== workerId)
      });
    } else {
      setFormData({
        ...formData,
        worker_ids: [...formData.worker_ids, workerId]
      });
    }
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const filteredCrews = crews.filter(crew =>
    crew.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crew.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">
            {editingCrew ? 'Editar Cuadrilla' : 'Nueva Cuadrilla'}
          </h3>
          <button
            onClick={() => {
              setShowForm(false);
              setEditingCrew(null);
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Cuadrilla *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jefe de Cuadrilla
              </label>
              <select
                value={formData.leader_id}
                onChange={(e) => setFormData({ ...formData, leader_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin jefe asignado</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>{worker.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Operarios Asociados
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-96 overflow-y-auto">
              {workers.length === 0 ? (
                <p className="text-center text-gray-500">No hay operarios disponibles</p>
              ) : (
                <div className="space-y-2">
                  {workers.map(worker => (
                    <label
                      key={worker.id}
                      className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.worker_ids.includes(worker.id)}
                        onChange={() => toggleWorkerSelection(worker.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{worker.name}</p>
                        <p className="text-sm text-gray-500">{worker.category}</p>
                      </div>
                      {formData.leader_id === worker.id && (
                        <span className="ml-auto px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Jefe
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Operarios seleccionados: {formData.worker_ids.length}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingCrew(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isLoading ? 'Guardando...' : 'Guardar Cuadrilla'}
            </button>
          </div>
        </form>
      </div>
    );
  }

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
          <h3 className="text-2xl font-bold text-gray-900">Cuadrillas Destajistas</h3>
          <p className="text-gray-600">Gestiona las cuadrillas y sus miembros</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Nueva Cuadrilla
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar cuadrilla..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cuadrillas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrews.map(crew => (
            <div key={crew.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h4 className="text-lg font-bold text-gray-900">{crew.name}</h4>
                  </div>
                  <p className="text-sm text-gray-500">{crew.code}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  crew.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {crew.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Jefe: {crew.leader_name || 'Sin asignar'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Operarios: {crew.member_count}
                  </span>
                </div>
              </div>

              {crew.members.length > 0 && (
                <div className="border-t pt-3 mb-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Miembros:</p>
                  <div className="space-y-1">
                    {crew.members.slice(0, 3).map(member => (
                      <p key={member.id} className="text-xs text-gray-600">
                        • {getWorkerName(member.worker_id)}
                      </p>
                    ))}
                    {crew.members.length > 3 && (
                      <p className="text-xs text-gray-500 italic">
                        +{crew.members.length - 3} más
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t">
                <button
                  onClick={() => handleEdit(crew)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(crew.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredCrews.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No se encontraron cuadrillas</p>
        </div>
      )}
    </div>
  );
};

export default CrewsManagement;
