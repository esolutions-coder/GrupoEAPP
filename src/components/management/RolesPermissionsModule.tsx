import React, { useState, useEffect } from 'react';
import { Shield, Users, Key, Plus, Edit, Trash2, Save, X, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Role, Permission, RolePermission } from '../../types/permissions';

const RolesPermissionsModule: React.FC = () => {
  const [view, setView] = useState<'roles' | 'permissions'>('roles');
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<string | null>(null);

  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadRoles(),
      loadPermissions(),
      loadRolePermissions()
    ]);
    setLoading(false);
  };

  const loadRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const loadPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('module', { ascending: true });

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const loadRolePermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('role_permissions')
        .select('*');

      if (error) throw error;
      setRolePermissions(data || []);
    } catch (error) {
      console.error('Error loading role permissions:', error);
    }
  };

  const handleSaveRole = async () => {
    try {
      if (!roleForm.name) {
        alert('El nombre del rol es obligatorio');
        return;
      }

      if (editingRole) {
        const { error } = await supabase
          .from('roles')
          .update(roleForm)
          .eq('id', editingRole.id);

        if (error) throw error;
        alert('Rol actualizado');
      } else {
        const { error } = await supabase
          .from('roles')
          .insert([roleForm]);

        if (error) throw error;
        alert('Rol creado');
      }

      setShowRoleModal(false);
      resetRoleForm();
      loadRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Error al guardar el rol');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('¿Estás seguro de eliminar este rol?')) return;

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
      alert('Rol eliminado');
      loadRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Error al eliminar el rol');
    }
  };

  const handleTogglePermission = async (roleId: string, permissionId: string) => {
    try {
      const existingRelation = rolePermissions.find(
        rp => rp.role_id === roleId && rp.permission_id === permissionId
      );

      if (existingRelation) {
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .eq('id', existingRelation.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('role_permissions')
          .insert([{
            role_id: roleId,
            permission_id: permissionId
          }]);

        if (error) throw error;
      }

      loadRolePermissions();
    } catch (error) {
      console.error('Error toggling permission:', error);
      alert('Error al modificar permiso');
    }
  };

  const hasPermission = (roleId: string, permissionId: string): boolean => {
    return rolePermissions.some(
      rp => rp.role_id === roleId && rp.permission_id === permissionId
    );
  };

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      description: '',
      is_active: true
    });
    setEditingRole(null);
  };

  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      is_active: role.is_active
    });
    setShowRoleModal(true);
  };

  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-corporate-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Roles y Permisos</h2>
          <p className="text-gray-600">Gestión de control de acceso y permisos del sistema</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setView('roles')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'roles'
                ? 'bg-corporate-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Roles
          </button>
          <button
            onClick={() => setView('permissions')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'permissions'
                ? 'bg-corporate-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Key className="h-4 w-4 inline mr-2" />
            Permisos
          </button>
          {view === 'roles' && (
            <button
              onClick={() => setShowRoleModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Rol</span>
            </button>
          )}
        </div>
      </div>

      {view === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Roles del Sistema</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{role.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            role.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {role.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        {role.description && (
                          <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditRole(role)}
                          className="text-corporate-blue-600 hover:text-corporate-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRoleForPermissions(role.id)}
                      className="text-sm text-corporate-blue-600 hover:text-corporate-blue-700 font-medium"
                    >
                      Gestionar permisos →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedRoleForPermissions && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Permisos: {roles.find(r => r.id === selectedRoleForPermissions)?.name}
                </h3>
                <button
                  onClick={() => setSelectedRoleForPermissions(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 max-h-[600px] overflow-y-auto">
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([module, perms]) => (
                    <div key={module} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 capitalize">{module}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {perms.map((perm) => (
                          <label key={perm.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasPermission(selectedRoleForPermissions, perm.id)}
                              onChange={() => handleTogglePermission(selectedRoleForPermissions, perm.id)}
                              className="rounded border-gray-300 text-corporate-blue-600 focus:ring-corporate-blue-500"
                            />
                            <span className="text-sm text-gray-700 capitalize">{perm.action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'permissions' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Permisos del Sistema</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([module, perms]) => (
                <div key={module} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 capitalize text-lg">{module}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {perms.map((perm) => (
                      <div key={perm.id} className="flex items-center space-x-2">
                        <Key className="h-4 w-4 text-corporate-blue-600" />
                        <span className="text-sm text-gray-700 capitalize">{perm.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
              </h3>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  resetRoleForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del rol *
                </label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  placeholder="Ej: Jefe de Obra"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-corporate-blue-500 focus:border-transparent"
                  placeholder="Describe las responsabilidades del rol..."
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roleForm.is_active}
                    onChange={(e) => setRoleForm({ ...roleForm, is_active: e.target.checked })}
                    className="rounded border-gray-300 text-corporate-blue-600 focus:ring-corporate-blue-500"
                  />
                  <span className="text-sm text-gray-700">Rol activo</span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  resetRoleForm();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRole}
                className="px-4 py-2 bg-corporate-blue-600 hover:bg-corporate-blue-700 text-white rounded-lg flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{editingRole ? 'Actualizar' : 'Crear'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissionsModule;
