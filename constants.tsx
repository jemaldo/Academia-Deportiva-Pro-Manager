
import React from 'react';
import { 
  Users, 
  UserSquare2, 
  DollarSign, 
  Trophy, 
  ClipboardList, 
  Settings, 
  LayoutDashboard,
  LogOut,
  TrendingUp,
  CreditCard,
  UserCheck
} from 'lucide-react';

export const CATEGORIES = ['Baby', 'Pre-Infantil', 'Infantil', 'Pre-Juvenil', 'Juvenil', 'Elite'];
export const POSITIONS = ['Portero', 'Defensa Central', 'Lateral', 'Mediocentro', 'Extremo', 'Delantero'];

export const NAV_ITEMS = [
  { id: 'DASHBOARD', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'STUDENTS', label: 'Alumnos', icon: <Users className="w-5 h-5" /> },
  { id: 'TEACHERS', label: 'Docentes', icon: <UserSquare2 className="w-5 h-5" /> },
  { id: 'FINANCE', label: 'Caja Menor', icon: <DollarSign className="w-5 h-5" /> },
  { id: 'MATCHES', label: 'Convocatorias', icon: <Trophy className="w-5 h-5" /> },
  { id: 'TRAINING', label: 'Entrenamientos', icon: <ClipboardList className="w-5 h-5" /> },
  { id: 'REPORTS', label: 'Informes', icon: <TrendingUp className="w-5 h-5" /> },
  { id: 'USERS', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
];
