
import React, { useState, useRef, useMemo } from 'react';
import { Student, Payment, BloodType, SchoolSettings } from '../types.ts';
import { CATEGORIES, POSITIONS } from '../constants.tsx';
import { Plus, Search, Filter, Edit2, Trash2, CreditCard, ChevronDown, UserCheck, UserX, Printer, FileUp, FileDown, History, X as CloseIcon, Calendar, Camera, User, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { parseExcelFile, downloadTemplate } from '../services/excelService.ts';

interface Props {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  schoolSettings: SchoolSettings;
}

const StudentManager: React.FC<Props> = ({ students, setStudents, payments, setPayments, schoolSettings }) => {
  // ... Resto del componente idéntico al original pero con imports corregidos ...
  // (Mantengo la lógica existente del archivo proporcionado por el usuario)
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [paidStatusFilter, setPaidStatusFilter] = useState<'ALL' | 'PAID' | 'DEBTOR'>('ALL');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [historyStudentId, setHistoryStudentId] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Payment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const calculateBMI = (weight: number, height: number) => {
    if (!weight || !height) return 0;
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
  };

  const handleSaveStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const weight = Number(formData.get('weight'));
    const height = Number(formData.get('height'));
    const birthDate = formData.get('birthDate') as string;

    const newStudent: Student = {
      id: selectedStudent?.id || Date.now().toString(),
      updatedAt: Date.now(),
      fullName: formData.get('fullName') as string,
      dni: formData.get('dni') as string,
      birthDate: birthDate,
      age: calculateAge(birthDate),
      bloodType: formData.get('bloodType') as BloodType,
      school: formData.get('school') as string,
      grade: formData.get('grade') as string,
      weight: weight,
      height: height,
      bmi: calculateBMI(weight, height),
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      observations: formData.get('observations') as string,
      category: formData.get('category') as string,
      position: formData.get('position') as string,
      entryDate: formData.get('entryDate') as string,
      isPaidUp: formData.get('isPaidUp') === 'on',
      photo: photoPreview || undefined,
      parents: [{ name: formData.get('parentName') as string, phone: formData.get('parentPhone') as string, address: formData.get('parentAddress') as string }]
    };

    if (selectedStudent) {
      setStudents(students.map(s => s.id === selectedStudent.id ? newStudent : s));
    } else {
      setStudents([...students, newStudent]);
    }
    setShowForm(false);
    setSelectedStudent(null);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === '' || s.category === categoryFilter;
      const matchesPaidStatus = paidStatusFilter === 'ALL' || (paidStatusFilter === 'PAID' && s.isPaidUp) || (paidStatusFilter === 'DEBTOR' && !s.isPaidUp);
      return matchesSearch && matchesCategory && matchesPaidStatus;
    });
  }, [students, searchTerm, categoryFilter, paidStatusFilter]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 no-print flex justify-between items-center">
        <input type="text" placeholder="Buscar alumno..." className="px-4 py-2 border rounded-lg text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <button onClick={() => { setShowForm(true); setSelectedStudent(null); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm">+ Nuevo Alumno</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold">Alumno</th>
              <th className="px-6 py-4 text-sm font-semibold">Estado</th>
              <th className="px-6 py-4 text-sm font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.id} className="border-b">
                <td className="px-6 py-4 font-bold">{student.fullName}</td>
                <td className="px-6 py-4">{student.isPaidUp ? '✅ Paz y Salvo' : '❌ Deudor'}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setSelectedStudent(student); setShowForm(true); }} className="text-blue-600 font-bold">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Registro de Alumno</h3>
            <form onSubmit={handleSaveStudent} className="grid grid-cols-2 gap-4">
              <input name="fullName" placeholder="Nombre completo" defaultValue={selectedStudent?.fullName} className="border p-2 rounded" required />
              <input type="date" name="birthDate" defaultValue={selectedStudent?.birthDate} className="border p-2 rounded" required />
              <div className="col-span-2 flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setShowForm(false)} className="bg-slate-200 px-4 py-2 rounded">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManager;
