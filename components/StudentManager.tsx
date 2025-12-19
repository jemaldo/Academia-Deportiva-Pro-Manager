
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
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [paidStatusFilter, setPaidStatusFilter] = useState<'ALL' | 'PAID' | 'DEBTOR'>('ALL');
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [historyStudentId, setHistoryStudentId] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Payment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStudent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const fullName = formData.get('fullName') as string;
    const dni = formData.get('dni') as string;
    const birthDate = formData.get('birthDate') as string;
    const parentName = formData.get('parentName') as string;
    const parentPhone = formData.get('parentPhone') as string;

    if (!fullName.trim() || !birthDate || !parentName.trim() || !parentPhone.trim()) {
      alert("Error: Los campos 'Nombre Completo', 'Fecha de Nacimiento', 'Nombre del Acudiente' y 'Teléfono de contacto' son obligatorios.");
      return;
    }

    const weight = Number(formData.get('weight'));
    const height = Number(formData.get('height'));

    const newStudent: Student = {
      id: selectedStudent?.id || Date.now().toString(),
      updatedAt: Date.now(),
      fullName: fullName,
      dni: dni,
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
      parents: [
        { 
          name: parentName, 
          phone: parentPhone, 
          address: formData.get('parentAddress') as string 
        }
      ]
    };

    if (selectedStudent) {
      setStudents(students.map(s => s.id === selectedStudent.id ? newStudent : s));
    } else {
      setStudents([...students, newStudent]);
    }
    setShowForm(false);
    setSelectedStudent(null);
    setPhotoPreview(null);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcelFile(file);
      const importedStudents: Student[] = data.map((row: any) => {
        const weight = Number(row.Peso || 0);
        const height = Number(row.Talla || 0);
        const bDay = row.FechaNacimiento || "";
        return {
          id: Date.now().toString() + Math.random(),
          updatedAt: Date.now(),
          fullName: row.NombreCompleto || "Sin nombre",
          dni: row.DNI || "",
          birthDate: bDay,
          age: calculateAge(bDay),
          bloodType: (row.RH || "O+") as BloodType,
          school: row.Colegio || "",
          grade: row.Grado || "",
          weight: weight,
          height: height,
          bmi: calculateBMI(weight, height),
          address: row.Direccion || "",
          phone: row.Telefono || "",
          observations: row.Observaciones || "",
          category: row.Categoria || CATEGORIES[0],
          position: row.Posicion || POSITIONS[0],
          entryDate: row.FechaIngreso || new Date().toISOString().split('T')[0],
          isPaidUp: row.PazYSalvo === "SI",
          parents: [{ name: row.NombrePadre || "", phone: row.TelefonoPadre || "", address: row.DireccionPadre || "" }]
        };
      });
      setStudents([...students, ...importedStudents]);
      alert(`Se importaron ${importedStudents.length} alumnos correctamente.`);
    } catch (err) {
      console.error(err);
      alert("Error al procesar el archivo Excel. Verifique el formato.");
    }
    e.target.value = "";
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "NombreCompleto", "DNI", "FechaNacimiento", "RH", "Colegio", "Grado", 
      "Peso", "Talla", "Direccion", "Telefono", "Observaciones", 
      "Categoria", "Posicion", "FechaIngreso", "PazYSalvo", 
      "NombrePadre", "TelefonoPadre", "DireccionPadre"
    ];
    downloadTemplate(headers, "Plantilla_Alumnos");
  };

  const handlePayment = (student: Student) => {
    const amount = prompt(`Monto del pago de mensualidad para ${student.fullName}:`, "50000");
    if (amount && !isNaN(Number(amount))) {
      const newPayment: Payment = {
        id: Date.now().toString(),
        updatedAt: Date.now(),
        date: new Date().toISOString().split('T')[0],
        amount: Number(amount),
        type: 'STUDENT_MONTHLY',
        targetId: student.id,
        targetName: student.fullName,
        description: `Mensualidad - ${new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`,
        status: 'PAID'
      };
      setPayments([...payments, newPayment]);
      setStudents(students.map(s => s.id === student.id ? { ...s, isPaidUp: true, updatedAt: Date.now() } : s));
      alert("Pago registrado con éxito");
      setViewingReceipt(newPayment);
    }
  };

  const handleDeleteStudent = () => {
    if (deleteConfirmId) {
      setStudents(students.filter(s => s.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === '' || s.category === categoryFilter;
      const matchesPaidStatus = 
        paidStatusFilter === 'ALL' || 
        (paidStatusFilter === 'PAID' && s.isPaidUp) || 
        (paidStatusFilter === 'DEBTOR' && !s.isPaidUp);
      
      return matchesSearch && matchesCategory && matchesPaidStatus;
    });
  }, [students, searchTerm, categoryFilter, paidStatusFilter]);

  const historyData = useMemo(() => {
    if (!historyStudentId) return [];
    return payments
      .filter(p => p.targetId === historyStudentId && p.type === 'STUDENT_MONTHLY')
      .filter(p => {
        if (!filterMonth && !filterYear) return true;
        const pDate = new Date(p.date);
        const matchMonth = filterMonth ? (pDate.getMonth() + 1).toString() === filterMonth : true;
        const matchYear = filterYear ? pDate.getFullYear().toString() === filterYear : true;
        return matchMonth && matchYear;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [historyStudentId, payments, filterMonth, filterYear]);

  const historyStudent = students.find(s => s.id === historyStudentId);
  const studentToDelete = students.find(s => s.id === deleteConfirmId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4 no-print">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-wrap gap-4 w-full md:w-auto flex-1">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Buscar por nombre..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative w-full md:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm appearance-none"
              >
                <option value="">Todas las categorías</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="relative w-full md:w-48">
              <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select 
                value={paidStatusFilter}
                onChange={(e) => setPaidStatusFilter(e.target.value as any)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm appearance-none"
              >
                <option value="ALL">Todos los estados</option>
                <option value="PAID">Paz y Salvo</option>
                <option value="DEBTOR">Deudor</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
            <button 
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-200 transition text-sm font-semibold"
            >
              <FileDown className="w-4 h-4" /> Plantilla
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-900 transition text-sm font-semibold"
            >
              <FileUp className="w-4 h-4" /> Importar
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImportExcel} accept=".xlsx, .xls, .csv" className="hidden" />
            <button 
              onClick={() => { setShowForm(true); setSelectedStudent(null); setPhotoPreview(null); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
            >
              <Plus className="w-4 h-4" /> Nuevo Alumno
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto no-print">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Alumno</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Categoría / Posición</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Contacto</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-center">Estado</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No se encontraron alumnos</td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0 overflow-hidden">
                        {student.photo ? <img src={student.photo} className="w-full h-full object-cover" /> : student.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{student.fullName}</p>
                        <p className="text-xs text-slate-500">DNI: {student.dni || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-700">{student.category}</p>
                    <p className="text-xs text-slate-500">{student.position}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{student.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {student.isPaidUp ? (
                        <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">Paz y Salvo</span>
                      ) : (
                        <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Deudor</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setHistoryStudentId(student.id)} className="p-2 text-slate-600 hover:text-blue-600 transition"><History className="w-4 h-4" /></button>
                      <button onClick={() => handlePayment(student)} className="p-2 text-slate-600 hover:text-emerald-600 transition"><CreditCard className="w-4 h-4" /></button>
                      <button onClick={() => { setSelectedStudent(student); setShowForm(true); }} className="p-2 text-slate-600 hover:text-blue-600 transition"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteConfirmId(student.id)} className="p-2 text-slate-600 hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals simplificados para el ejemplo */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">Registro de Alumno</h3>
            <form onSubmit={handleSaveStudent}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input name="fullName" placeholder="Nombre Completo" defaultValue={selectedStudent?.fullName} required className="border p-2 rounded" />
                <input name="dni" placeholder="DNI" defaultValue={selectedStudent?.dni} className="border p-2 rounded" />
                <input type="date" name="birthDate" defaultValue={selectedStudent?.birthDate} required className="border p-2 rounded" />
                <select name="category" defaultValue={selectedStudent?.category} className="border p-2 rounded">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input name="parentName" placeholder="Nombre Acudiente" defaultValue={selectedStudent?.parents[0]?.name} required className="border p-2 rounded" />
                <input name="parentPhone" placeholder="Teléfono Acudiente" defaultValue={selectedStudent?.parents[0]?.phone} required className="border p-2 rounded" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-200 rounded">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManager;
