
import React, { useState, useRef, useMemo } from 'react';
import { Student, Payment, BloodType, SchoolSettings } from '../types';
import { CATEGORIES, POSITIONS } from '../constants';
import { Plus, Search, Filter, Edit2, Trash2, CreditCard, ChevronDown, UserCheck, UserX, Printer, FileUp, FileDown, History, X as CloseIcon, Calendar, Camera, User, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { parseExcelFile, downloadTemplate } from '../services/excelService';

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
        date: new Date().toISOString().split('T')[0],
        amount: Number(amount),
        type: 'STUDENT_MONTHLY',
        targetId: student.id,
        targetName: student.fullName,
        description: `Mensualidad - ${new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`,
        status: 'PAID'
      };
      setPayments([...payments, newPayment]);
      setStudents(students.map(s => s.id === student.id ? { ...s, isPaidUp: true } : s));
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
      {/* Barra de Filtros y Búsqueda */}
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
              title="Descargar Plantilla Excel"
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

      {/* Tabla de Alumnos */}
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
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No se encontraron alumnos con los filtros seleccionados</td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0 overflow-hidden">
                        {student.photo ? (
                          <img src={student.photo} alt={student.fullName} className="w-full h-full object-cover" />
                        ) : (
                          student.fullName.charAt(0)
                        )}
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
                    <p className="text-xs text-slate-500 truncate max-w-[150px]">{student.address}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {student.isPaidUp ? (
                        <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                          <UserCheck className="w-3 h-3" /> Paz y Salvo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                          <UserX className="w-3 h-3" /> Deudor
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setHistoryStudentId(student.id)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Ver Historial de Pagos"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handlePayment(student)}
                        className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="Registrar Pago"
                      >
                        <CreditCard className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedStudent(student); setShowForm(true); setPhotoPreview(student.photo || null); }}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(student.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">¿Confirmar Eliminación?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Estás a punto de eliminar permanentemente a <strong>{studentToDelete?.fullName}</strong>. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDeleteStudent}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Historial de Pagos */}
      {historyStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-blue-600 text-white rounded-t-xl shrink-0">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5" />
                <div>
                  <h3 className="text-lg font-bold">Historial de Pagos</h3>
                  <p className="text-xs text-blue-100 font-medium">{historyStudent?.fullName}</p>
                </div>
              </div>
              <button onClick={() => setHistoryStudentId(null)} className="hover:bg-blue-700 p-1 rounded-lg">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 bg-slate-50 border-b flex flex-wrap gap-4 items-center shrink-0">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <select 
                  value={filterMonth} 
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Todos los meses</option>
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map(m => (
                    <option key={m} value={m}>{new Date(2000, Number(m)-1).toLocaleString('es-ES', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={filterYear} 
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Todos los años</option>
                  {["2023", "2024", "2025"].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {(filterMonth || filterYear) && (
                <button 
                  onClick={() => { setFilterMonth(''); setFilterYear(''); }}
                  className="text-xs text-blue-600 font-bold hover:underline"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-slate-100 border-b z-10">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Concepto</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Monto</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Ver Recibo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">No hay registros de pagos para este alumno</td>
                    </tr>
                  ) : (
                    historyData.map(payment => (
                      <tr key={payment.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {new Date(payment.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {payment.description}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                          ${payment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => setViewingReceipt(payment)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t bg-slate-50 flex justify-between items-center shrink-0">
              <div className="text-sm font-bold text-slate-600">
                Recaudado Total: <span className="text-emerald-600">${historyData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</span>
              </div>
              <button 
                onClick={() => setHistoryStudentId(null)}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Recibo de Pago (Imprimible) */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[95vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 no-print">
              <h4 className="font-bold text-slate-700 flex items-center gap-2">
                <Printer className="w-4 h-4" /> Vista Previa de Recibo
              </h4>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrint}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Imprimir Recibo
                </button>
                <button onClick={() => setViewingReceipt(null)} className="p-2 text-slate-400 hover:text-slate-600">
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-8 print:p-0 bg-white flex-1 overflow-y-auto">
              {/* Plantilla de Recibo Profesional */}
              <div className="border-2 border-slate-200 p-8 rounded-lg relative overflow-hidden bg-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 opacity-50"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10 border-b-2 border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                      {schoolSettings.logo && <img src={schoolSettings.logo} alt="Logo" className="w-16 h-16 object-contain" />}
                      <div>
                        <h2 className="text-2xl font-black uppercase text-slate-900 tracking-tighter">{schoolSettings.name}</h2>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Academia Deportiva</p>
                        <p className="text-xs text-slate-400 mt-1">Nit. {schoolSettings.nit}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="bg-slate-900 text-white px-3 py-1 rounded text-[10px] font-bold uppercase mb-2 inline-block">Recibo de Caja</div>
                      <p className="text-xs font-bold text-slate-500">Nº R-{viewingReceipt.id.slice(-6)}</p>
                      <p className="text-xs text-slate-400">{new Date(viewingReceipt.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-10">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Recibido de:</p>
                      <p className="text-lg font-bold text-slate-800">{viewingReceipt.targetName}</p>
                      <p className="text-sm text-slate-500">Documento: {students.find(s => s.id === viewingReceipt.targetId)?.dni || '---'}</p>
                      <p className="text-sm text-slate-500">Categoría: {students.find(s => s.id === viewingReceipt.targetId)?.category || '---'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Concepto de Pago</p>
                      <p className="text-sm font-semibold text-slate-700">{viewingReceipt.description}</p>
                      <div className="mt-4 flex items-center justify-end gap-2 text-emerald-600 font-bold">
                        <CheckCircle className="w-4 h-4" /> Pago Procesado
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl overflow-hidden mb-10 border border-slate-100">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-200">
                        <tr>
                          <th className="px-6 py-3 font-bold uppercase text-[10px]">Descripción del Servicio</th>
                          <th className="px-6 py-3 font-bold uppercase text-[10px] text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white">
                          <td className="px-6 py-6 font-medium text-slate-700">Pago de mensualidad academia deportiva - ciclo mensual correspondiente al periodo de registro.</td>
                          <td className="px-6 py-6 font-black text-slate-900 text-right text-lg">${viewingReceipt.amount.toLocaleString()}</td>
                        </tr>
                      </tbody>
                      <tfoot className="bg-slate-900 text-white">
                        <tr>
                          <td className="px-6 py-4 font-bold uppercase text-[10px]">Total Recibido</td>
                          <td className="px-6 py-4 font-black text-xl text-right">${viewingReceipt.amount.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="grid grid-cols-2 gap-12 mt-24">
                    <div className="border-t border-slate-300 pt-3 text-center">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Recibido por (Firma y Sello)</p>
                    </div>
                    <div className="border-t border-slate-300 pt-3 text-center">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Firma del Acudiente / Alumno</p>
                    </div>
                  </div>

                  <div className="mt-16 pt-6 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400 leading-relaxed italic">
                      {schoolSettings.address} • {schoolSettings.phone} <br />
                      Gracias por confiar en {schoolSettings.name}. <br />
                      Este documento es el único soporte válido para reclamaciones sobre pagos realizados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulario de Alumno (Nuevo/Editar) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">
                {selectedStudent ? 'Editar Alumno' : 'Nuevo Registro de Alumno'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSaveStudent} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 overflow-hidden relative">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <User className="w-8 h-8 mb-1" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Foto</span>
                        </>
                      )}
                      <button 
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                      >
                        <Camera className="w-6 h-6" />
                      </button>
                    </div>
                    <input type="file" ref={photoInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                    {photoPreview && (
                      <button 
                        type="button" 
                        onClick={() => setPhotoPreview(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                      >
                        <CloseIcon className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    <h4 className="font-bold text-slate-500 uppercase text-xs tracking-wider">Datos Personales</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo <span className="text-red-500">*</span></label>
                        <input name="fullName" defaultValue={selectedStudent?.fullName} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
                        <input name="dni" defaultValue={selectedStudent?.dni} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Identificación" />
                      </div>
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Nacimiento <span className="text-red-500">*</span></label>
                        <input type="date" name="birthDate" defaultValue={selectedStudent?.birthDate} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">RH</label>
                    <select name="bloodType" defaultValue={selectedStudent?.bloodType} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Peso (kg)</label>
                    <input type="number" step="0.1" name="weight" defaultValue={selectedStudent?.weight} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Talla (cm)</label>
                    <input type="number" name="height" defaultValue={selectedStudent?.height} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <h4 className="font-bold text-slate-500 uppercase text-xs tracking-wider mt-6">Información Académica y Deportiva</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Colegio</label>
                    <input name="school" defaultValue={selectedStudent?.school} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Grado</label>
                    <input name="grade" defaultValue={selectedStudent?.grade} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                    <select name="category" defaultValue={selectedStudent?.category} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Posición</label>
                    <select name="position" defaultValue={selectedStudent?.position} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <h4 className="font-bold text-slate-500 uppercase text-xs tracking-wider mt-6">Observaciones</h4>
                <textarea name="observations" defaultValue={selectedStudent?.observations} className="w-full px-4 py-2 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Condiciones médicas, notas adicionales..."></textarea>
              </div>

              <div className="space-y-4 bg-slate-50 p-4 rounded-xl">
                <h4 className="font-bold text-slate-500 uppercase text-xs tracking-wider">Contacto y Padres</h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono Alumno</label>
                  <input name="phone" defaultValue={selectedStudent?.phone} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                  <input name="address" defaultValue={selectedStudent?.address} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Acudiente <span className="text-red-500">*</span></label>
                  <input name="parentName" defaultValue={selectedStudent?.parents[0]?.name} required className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono Acudiente <span className="text-red-500">*</span></label>
                  <input name="parentPhone" defaultValue={selectedStudent?.parents[0]?.phone} required className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Dirección Acudiente</label>
                  <input name="parentAddress" defaultValue={selectedStudent?.parents[0]?.address} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isPaidUp" defaultChecked={selectedStudent?.isPaidUp} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm font-semibold text-slate-700">A paz y salvo</span>
                  </label>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                   <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                    Guardar Alumno
                   </button>
                   <button type="button" onClick={() => setShowForm(false)} className="w-full bg-slate-200 text-slate-600 py-2 rounded-lg font-bold hover:bg-slate-300 transition">
                    Cancelar
                   </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManager;
