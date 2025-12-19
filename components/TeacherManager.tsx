
import React, { useState, useRef, useMemo } from 'react';
import { Teacher, Payment, BloodType, SchoolSettings } from '../types.ts';
import { CATEGORIES } from '../constants.tsx';
import { Plus, Search, Edit2, Trash2, Mail, Phone, CreditCard, Banknote, UserRound, X, FileUp, FileDown, History, Printer, Eye, Camera, FileText, User as UserIcon, Upload } from 'lucide-react';
import { parseExcelFile, downloadTemplate } from '../services/excelService.ts';

interface Props {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  payments: Payment[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  schoolSettings: SchoolSettings;
}

const TeacherManager: React.FC<Props> = ({ teachers, setTeachers, payments, setPayments, schoolSettings }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [historyTeacherId, setHistoryTeacherId] = useState<string | null>(null);
  const [viewingSlip, setViewingSlip] = useState<Payment | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Por favor, selecciona un archivo PDF válido.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setResumeData(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTeacher = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTeacher: Teacher = {
      id: selectedTeacher?.id || Date.now().toString(),
      updatedAt: Date.now(),
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      category: formData.get('category') as string,
      age: Number(formData.get('age')),
      bloodType: formData.get('bloodType') as BloodType,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      bankAccount: formData.get('bankAccount') as string,
      entryDate: formData.get('entryDate') as string,
      photo: photoPreview || undefined,
      resumeUrl: resumeData || undefined
    };

    if (selectedTeacher) {
      setTeachers(teachers.map(t => t.id === selectedTeacher.id ? newTeacher : t));
    } else {
      setTeachers([...teachers, newTeacher]);
    }
    closeForm();
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedTeacher(null);
    setPhotoPreview(null);
    setResumeData(null);
  };

  const handlePayroll = (teacher: Teacher) => {
    const amount = prompt(`Monto de nómina para ${teacher.firstName}:`, "1200000");
    if (amount && !isNaN(Number(amount))) {
      const newPayment: Payment = {
        id: Date.now().toString(),
        updatedAt: Date.now(),
        date: new Date().toISOString().split('T')[0],
        amount: Number(amount),
        type: 'TEACHER_PAYROLL',
        targetId: teacher.id,
        targetName: `${teacher.firstName} ${teacher.lastName}`,
        description: `Nómina Mensual - ${new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`,
        status: 'PAID'
      };
      setPayments([...payments, newPayment]);
      alert("Nómina generada con éxito.");
    }
  };

  const filteredTeachers = teachers.filter(t => 
    `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const teacherHistory = useMemo(() => {
    if (!historyTeacherId) return [];
    return payments
      .filter(p => p.targetId === historyTeacherId && p.type === 'TEACHER_PAYROLL')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [historyTeacherId, payments]);

  const historyTeacher = teachers.find(t => t.id === historyTeacherId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm no-print">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar docente..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={() => { setShowForm(true); setSelectedTeacher(null); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Nuevo Docente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
        {filteredTeachers.map(teacher => (
          <div key={teacher.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition">
            <div className="p-6 border-b border-slate-50">
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 font-black text-2xl uppercase overflow-hidden">
                  {teacher.photo ? <img src={teacher.photo} className="w-full h-full object-cover" /> : <UserIcon />}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => setHistoryTeacherId(teacher.id)} className="p-2 text-slate-400 hover:text-purple-600"><History className="w-4 h-4" /></button>
                </div>
              </div>
              <h4 className="text-xl font-bold text-slate-800">{teacher.firstName} {teacher.lastName}</h4>
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-tighter">{teacher.category}</p>
            </div>
            <div className="p-4 bg-slate-50 border-t flex gap-2">
              <button onClick={() => handlePayroll(teacher)} className="flex-1 bg-white border text-slate-700 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                <Banknote className="w-4 h-4" /> Nómina
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-purple-50">
              <h3 className="text-xl font-bold text-purple-900">{selectedTeacher ? 'Editar Docente' : 'Nuevo Registro'}</h3>
              <button onClick={closeForm} className="text-purple-400 hover:text-purple-600"><X /></button>
            </div>
            <form onSubmit={handleSaveTeacher} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
               <input name="firstName" placeholder="Nombres" defaultValue={selectedTeacher?.firstName} className="border p-2 rounded" required />
               <input name="lastName" placeholder="Apellidos" defaultValue={selectedTeacher?.lastName} className="border p-2 rounded" required />
               <input type="number" name="age" placeholder="Edad" defaultValue={selectedTeacher?.age} className="border p-2 rounded" required />
               <select name="bloodType" defaultValue={selectedTeacher?.bloodType} className="border p-2 rounded">
                 {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
               </select>
               <input name="bankAccount" placeholder="Cuenta Bancaria" defaultValue={selectedTeacher?.bankAccount} className="border p-2 rounded" required />
               <div className="col-span-2 flex justify-end gap-2 mt-4">
                 <button type="button" onClick={closeForm} className="bg-slate-200 px-4 py-2 rounded">Cancelar</button>
                 <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Guardar</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManager;
