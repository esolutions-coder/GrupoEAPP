import { EPIType } from '../types/epi';

export const epiTypes: EPIType[] = [
  {
    id: 'helmet',
    name: 'Casco de Seguridad',
    category: 'head',
    icon: '⛑️',
    mandatoryReplacement: true,
    averageLifespan: 1095, // 3 años
    sizes: ['Talla Única'],
    certificationRequired: true
  },
  {
    id: 'safety_vest',
    name: 'Chaleco Reflectante',
    category: 'visibility',
    icon: '🦺',
    mandatoryReplacement: true,
    averageLifespan: 365, // 1 año
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    certificationRequired: true
  },
  {
    id: 'safety_boots',
    name: 'Botas de Seguridad',
    category: 'feet',
    icon: '🥾',
    mandatoryReplacement: true,
    averageLifespan: 365, // 1 año
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
    certificationRequired: true
  },
  {
    id: 'work_gloves',
    name: 'Guantes de Trabajo',
    category: 'hands',
    icon: '🧤',
    mandatoryReplacement: true,
    averageLifespan: 90, // 3 meses
    sizes: ['S', 'M', 'L', 'XL'],
    certificationRequired: true
  },
  {
    id: 'safety_glasses',
    name: 'Gafas de Protección',
    category: 'head',
    icon: '🥽',
    mandatoryReplacement: true,
    averageLifespan: 730, // 2 años
    sizes: ['Talla Única'],
    certificationRequired: true
  },
  {
    id: 'hearing_protection',
    name: 'Protección Auditiva',
    category: 'head',
    icon: '🎧',
    mandatoryReplacement: true,
    averageLifespan: 365, // 1 año
    sizes: ['Talla Única'],
    certificationRequired: true
  },
  {
    id: 'dust_mask',
    name: 'Mascarilla Antipolvo',
    category: 'respiratory',
    icon: '😷',
    mandatoryReplacement: true,
    averageLifespan: 30, // 1 mes
    sizes: ['Talla Única'],
    certificationRequired: true
  },
  {
    id: 'harness',
    name: 'Arnés de Seguridad',
    category: 'fall_protection',
    icon: '🪢',
    mandatoryReplacement: true,
    averageLifespan: 1825, // 5 años
    sizes: ['S', 'M', 'L', 'XL'],
    certificationRequired: true
  },
  {
    id: 'coveralls',
    name: 'Mono de Trabajo',
    category: 'body',
    icon: '👷',
    mandatoryReplacement: false,
    averageLifespan: 180, // 6 meses
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    certificationRequired: false
  },
  {
    id: 'knee_pads',
    name: 'Rodilleras',
    category: 'body',
    icon: '🦵',
    mandatoryReplacement: false,
    averageLifespan: 365, // 1 año
    sizes: ['S', 'M', 'L', 'XL'],
    certificationRequired: false
  }
];

export const epiCategories = [
  { id: 'head', name: 'Protección Cabeza', icon: '⛑️', color: 'bg-red-100 text-red-800' },
  { id: 'body', name: 'Protección Cuerpo', icon: '🦺', color: 'bg-blue-100 text-blue-800' },
  { id: 'hands', name: 'Protección Manos', icon: '🧤', color: 'bg-green-100 text-green-800' },
  { id: 'feet', name: 'Protección Pies', icon: '🥾', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'respiratory', name: 'Protección Respiratoria', icon: '😷', color: 'bg-purple-100 text-purple-800' },
  { id: 'fall_protection', name: 'Protección Caídas', icon: '🪢', color: 'bg-orange-100 text-orange-800' },
  { id: 'visibility', name: 'Alta Visibilidad', icon: '🦺', color: 'bg-pink-100 text-pink-800' }
];