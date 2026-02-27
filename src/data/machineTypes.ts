import { MachineType } from '../types/machinery';

export const machineTypes: MachineType[] = [
  {
    id: 'excavator',
    name: 'Excavadora',
    category: 'excavation',
    icon: '🚜',
    requiresLicense: true,
    averageLifespan: 15,
    maintenanceInterval: 250
  },
  {
    id: 'crane',
    name: 'Grúa',
    category: 'lifting',
    icon: '🏗️',
    requiresLicense: true,
    averageLifespan: 20,
    maintenanceInterval: 500
  },
  {
    id: 'bulldozer',
    name: 'Bulldozer',
    category: 'excavation',
    icon: '🚛',
    requiresLicense: true,
    averageLifespan: 18,
    maintenanceInterval: 300
  },
  {
    id: 'truck',
    name: 'Camión',
    category: 'transport',
    icon: '🚚',
    requiresLicense: true,
    averageLifespan: 12,
    maintenanceInterval: 200
  },
  {
    id: 'compactor',
    name: 'Compactadora',
    category: 'compaction',
    icon: '🛞',
    requiresLicense: true,
    averageLifespan: 15,
    maintenanceInterval: 300
  },
  {
    id: 'concrete_mixer',
    name: 'Hormigonera',
    category: 'concrete',
    icon: '🥤',
    requiresLicense: false,
    averageLifespan: 10,
    maintenanceInterval: 150
  },
  {
    id: 'loader',
    name: 'Cargadora',
    category: 'excavation',
    icon: '🚜',
    requiresLicense: true,
    averageLifespan: 16,
    maintenanceInterval: 250
  },
  {
    id: 'dump_truck',
    name: 'Volquete',
    category: 'transport',
    icon: '🚛',
    requiresLicense: true,
    averageLifespan: 14,
    maintenanceInterval: 200
  }
];

export const machineCategories = [
  { id: 'excavation', name: 'Excavación', icon: '🚜', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'lifting', name: 'Elevación', icon: '🏗️', color: 'bg-blue-100 text-blue-800' },
  { id: 'transport', name: 'Transporte', icon: '🚚', color: 'bg-green-100 text-green-800' },
  { id: 'compaction', name: 'Compactación', icon: '🛞', color: 'bg-purple-100 text-purple-800' },
  { id: 'concrete', name: 'Hormigón', icon: '🥤', color: 'bg-gray-100 text-gray-800' },
  { id: 'other', name: 'Otros', icon: '⚙️', color: 'bg-orange-100 text-orange-800' }
];