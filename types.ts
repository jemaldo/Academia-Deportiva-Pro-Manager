
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface ParentInfo {
  name: string;
  phone: string;
  address: string;
}

export interface Student {
  id: string;
  fullName: string;
  dni: string;
  birthDate: string;
  age: number;
  bloodType: BloodType;
  school: string;
  grade: string;
  weight: number; 
  height: number; 
  bmi: number;
  address: string;
  phone: string;
  photo?: string;
  observations: string;
  parents: ParentInfo[];
  category: string;
  position: string;
  entryDate: string;
  exitDate?: string;
  isPaidUp: boolean; 
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  category: string;
  age: number;
  bloodType: BloodType;
  address: string;
  phone: string;
  email: string;
  bankAccount: string;
  entryDate: string;
  photo?: string;
  resumeUrl?: string; 
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  type: 'STUDENT_MONTHLY' | 'TEACHER_PAYROLL' | 'EXPENSE' | 'INCOME';
  targetId: string; 
  targetName: string;
  description: string;
  status: 'PAID' | 'PENDING';
}

export interface CashTransaction {
  id: string;
  date: string;
  type: 'INCOME' | 'OUTCOME';
  amount: number;
  description: string;
  user: string;
}

export interface SquadPlayer {
  studentId: string;
  name: string;
  position: string;
  isStarter: boolean;
}

export interface MatchSquad {
  id: string;
  date: string;
  opponent: string;
  category: string;
  players: SquadPlayer[];
}

export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'COACH' | 'SECRETARY';
}

export interface SchoolSettings {
  name: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  // Cloud Sync Settings
  googleDriveLinked?: boolean;
  lastCloudSync?: string;
  googleAccessToken?: string;
}

export type AppView = 'DASHBOARD' | 'STUDENTS' | 'TEACHERS' | 'FINANCE' | 'MATCHES' | 'TRAINING' | 'USERS' | 'REPORTS';
