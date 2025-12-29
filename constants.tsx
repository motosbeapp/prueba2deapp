
import React from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  BarChart3, 
  Settings, 
  LogOut,
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export const INVENTORY_ITEMS = [
    'Espejos', 'Tapas laterales', 'Vías delanteras', 'Vías traseras',
    'Buen estado de pintura', 'Asiento buen estado', 'Guardafango delantero',
    'Guardafango Trasero', 'Luz foco frontal', 'Batería', 'Tanque buen estado',
    'Switch principal', 'Cadena', 'Manecilla', 'Rueda delantera',
    'Rueda trasera', 'Alarma', 'Llaveros', 'Luz stop', 'Corneta',
    'Herramientas', 'Casco'
];

export const NAV_ITEMS = [
  { id: 'service', label: 'Centro de Servicio', icon: <Wrench size={20} /> },
  { id: 'dashboard', label: 'Estadísticas', icon: <LayoutDashboard size={20} /> },
  { id: 'reports', label: 'Reportes', icon: <BarChart3 size={20} /> },
];

export const STATUS_COLORS = {
  'Pendiente': 'bg-gray-100 text-gray-700',
  'En Proceso': 'bg-blue-100 text-blue-700',
  'Completado': 'bg-green-100 text-green-700'
};

export const STATUS_ICONS = {
  'Pendiente': <Clock size={16} />,
  'En Proceso': <AlertCircle size={16} />,
  'Completado': <CheckCircle2 size={16} />
};

export const MotorcycleIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5.5 17.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
    <path d="M18.5 17.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
    <path d="M9 14h6" />
    <path d="M12 14v-4" />
    <path d="M12 10l-2-4h3l2 4" />
    <path d="M7 11l2-4" />
    <path d="M15 11l2-4" />
  </svg>
);
