
import React, { useState, useRef, useMemo } from 'react';
import { Teacher, Payment, BloodType, SchoolSettings } from '../types';
import { CATEGORIES } from '../constants';
import { Plus, Search, Edit2, Trash2, Mail, Phone, CreditCard, Banknote, UserRound, X, FileUp, FileDown, History, Printer, Eye, Camera, FileText, User as UserIcon, Upload } from 'lucide-react';
import { parseExcelFile, downloadTemplate } from '../services/excelService';

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
  
  // States for new uploads
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

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

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Por favor, selecciona un archivo PDF válido para la hoja de vida.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setResumeData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTeacher = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTeacher: Teacher = {
      id: selectedTeacher?.id || Date.now().toString(),
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

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setPhotoPreview(teacher.photo || null);
    setResumeData(teacher.resumeUrl || null);
    setShowForm(true);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcelFile(file);
      const importedTeachers: Teacher[] = data.map((row: any) => ({
        id: Date.now().toString() + Math.random(),
        firstName: row.Nombres || "Sin nombre",
        lastName: row.Apellidos || "",
        category: row.Categoria || CATEGORIES[0],
        age: Number(row.Edad || 0),
        bloodType: (row.RH || "O+") as BloodType,
        address: row.Direccion || "",
        phone: row.Telefono || "",
        email: row.Email || "",
        bankAccount: row.NumeroCuenta || "",
        entryDate: row.FechaIngreso || new Date().toISOString().split('T')[0],
      }));
      setTeachers([...teachers, ...importedTeachers]);
      alert(`Se importaron ${importedTeachers.length} docentes correctamente.`);
    } catch (err) {
      console.error(err);
      alert("Error al procesar el archivo Excel. Verifique el formato.");
    }
    e.target.value = "";
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "Nombres", "Apellidos", "Categoria", "Edad", "RH", 
      "Direccion", "Telefono", "Email", "NumeroCuenta", "FechaIngreso"
    ];
    downloadTemplate(headers, "Plantilla_Docentes");
  };

  const handlePayroll = (teacher: Teacher) => {
    const amount = prompt(`Monto de nómina para ${teacher.firstName} ${teacher.lastName}:`, "1200000");
    if (amount && !isNaN(Number(amount))) {
      const newPayment: Payment = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        amount: Number(amount),
        type: 'TEACHER_PAYROLL',
        targetId: teacher.id,
        targetName: `${teacher.firstName} ${teacher.lastName}`,
        description: `Nómina Mensual - ${new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`,
        status: 'PAID'
      };
      setPayments([...payments, newPayment]);
      alert("Nómina generada con éxito. Puede ver el volante en el historial.");
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

  const handlePrintSlip = () => {
    window.print();
  };

  const openResume = (url?: string) => {
    if (!url) {
      alert("No hay hoja de vida cargada para este docente.");
      return;
    }
    const win = window.open();
    if (win) {
      win.document.write(`<iframe src="${url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
    }
  };

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
            onClick={() => { setShowForm(true); setSelectedTeacher(null); setPhotoPreview(null); setResumeData(null); }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition flex items-center gap-2 text-sm"
          >
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
                  {teacher.photo ? (
                    <img src={teacher.photo} alt={teacher.firstName} className="w-full h-full object-cover" />
                  ) : (
                    <>{teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}</>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => setHistoryTeacherId(teacher.id)} title="Ver Historial" className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"><History className="w-4 h-4" /></button>
                  <button onClick={() => handleEdit(teacher)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => setTeachers(teachers.filter(t => t.id !== teacher.id))} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h4 className="text-xl font-bold text-slate-800">{teacher.firstName} {teacher.lastName}</h4>
              <p className="text-sm font-semibold text-purple-600 uppercase tracking-tighter">{teacher.category}</p>
            </div>
            <div className="p-6 flex-1 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="w-4 h-4 opacity-50" /> {teacher.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="w-4 h-4 opacity-50" /> {teacher.phone}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <CreditCard className="w-4 h-4 opacity-50" /> {teacher.bankAccount}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <UserRound className="w-4 h-4 opacity-50" /> {teacher.age} años | RH {teacher.bloodType}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex gap-2">
              <button 
                onClick={() => handlePayroll(teacher)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-sm font-bold hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition flex items-center justify-center gap-2"
              >
                <Banknote className="w-4 h-4" /> Pago Nómina
              </button>
              <button 
                onClick={() => openResume(teacher.resumeUrl)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${teacher.resumeUrl ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                title={teacher.resumeUrl ? "Ver Hoja de Vida" : "No disponible"}
              >
                <FileText className="w-4 h-4" /> CV PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Teacher History Modal */}
      {historyTeacherId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-purple-600 text-white rounded-t-xl shrink-0">
              <div className="flex items-center gap-3">
                <History className="w-5 h-5" />
                <div>
                  <h3 className="text-lg font-bold">Historial de Nómina</h3>
                  <p className="text-xs text-purple-100 font-medium">{historyTeacher?.firstName} {historyTeacher?.lastName}</p>
                </div>
              </div>
              <button onClick={() => setHistoryTeacherId(null)} className="hover:bg-purple-700 p-1 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-slate-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Concepto</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Monto</th>
                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Volante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teacherHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-400 italic">No hay registros de nómina para este docente</td>
                    </tr>
                  ) : (
                    teacherHistory.map(payment => (
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
                            onClick={() => setViewingSlip(payment)}
                            className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Ver Volante de Pago"
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
            <div className="p-4 border-t bg-slate-50 flex justify-end shrink-0">
              <button onClick={() => setHistoryTeacherId(null)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Slip Preview Modal */}
      {viewingSlip && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50 no-print">
              <h4 className="font-bold text-slate-700">Volante de Pago de Nómina</h4>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrintSlip}
                  className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-700"
                >
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
                <button onClick={() => setViewingSlip(null)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-8 print:p-0" id="payroll-slip">
              <div className="border-2 border-slate-200 p-8 rounded-lg relative">
                <div className="flex justify-between items-start mb-10 border-b-2 border-slate-100 pb-6">
                  <div className="flex items-center gap-4">
                    {schoolSettings.logo && <img src={schoolSettings.logo} alt="Logo" className="w-16 h-16 object-contain" />}
                    <div>
                      <h2 className="text-2xl font-black uppercase text-slate-900 tracking-tighter">{schoolSettings.name}</h2>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Academia Deportiva</p>
                      <p className="text-xs text-slate-400 mt-1">NIT: {schoolSettings.nit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-slate-900 text-white px-3 py-1 rounded text-[10px] font-bold uppercase mb-2 inline-block">Comprobante de Nómina</div>
                    <p className="text-xs font-bold text-slate-500">Nº {viewingSlip.id.slice(-6)}</p>
                    <p className="text-xs text-slate-400">{new Date(viewingSlip.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Docente</p>
                    <p className="text-lg font-bold text-slate-800">{viewingSlip.targetName}</p>
                    <p className="text-sm text-slate-500">{historyTeacher?.email}</p>
                    <p className="text-sm text-slate-500">{historyTeacher?.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Información de Pago</p>
                    <p className="text-sm font-bold text-slate-800">{historyTeacher?.bankAccount}</p>
                    <p className="text-sm text-slate-500">Categoría: {historyTeacher?.category}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg overflow-hidden mb-10">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-200">
                      <tr>
                        <th className="px-4 py-2 font-bold uppercase text-[10px]">Concepto</th>
                        <th className="px-4 py-2 font-bold uppercase text-[10px] text-right">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="px-4 py-4 font-medium text-slate-700">{viewingSlip.description}</td>
                        <td className="px-4 py-4 font-bold text-slate-900 text-right">${viewingSlip.amount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-slate-900 text-white">
                      <tr>
                        <td className="px-4 py-3 font-bold uppercase text-[10px]">Total Neto Pagado</td>
                        <td className="px-4 py-3 font-bold text-lg text-right">${viewingSlip.amount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="grid grid-cols-2 gap-12 mt-20">
                  <div className="border-t border-slate-300 pt-2 text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Firma Autorizada</p>
                  </div>
                  <div className="border-t border-slate-300 pt-2 text-center">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Recibí Conforme (Docente)</p>
                  </div>
                </div>

                <div className="mt-12 pt-6 border-t border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    {schoolSettings.address} • {schoolSettings.phone} <br />
                    Este documento es un soporte interno de pago de la Academia Deportiva {schoolSettings.name}. <br />
                    Para cualquier reclamo, favor presentar este volante original.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-purple-50">
              <h3 className="text-xl font-bold text-purple-900">{selectedTeacher ? 'Editar Docente' : 'Nuevo Registro de Docente'}</h3>
              <button onClick={closeForm} className="text-purple-400 hover:text-purple-600"><X /></button>
            </div>
            <form onSubmit={handleSaveTeacher} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Photo & CV */}
              <div className="md:col-span-1 space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-3">Foto del Docente</label>
                  <div className="relative group w-full aspect-square max-w-[200px] mx-auto">
                    <div className="w-full h-full rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 overflow-hidden relative">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <UserIcon className="w-12 h-12 mb-2" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-center px-2">Subir Foto</span>
                        </>
                      )}
                      <button 
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                      >
                        <Camera className="w-8 h-8" />
                      </button>
                    </div>
                    <input type="file" ref={photoInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                    {photoPreview && (
                      <button 
                        type="button" 
                        onClick={() => setPhotoPreview(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-3">Hoja de Vida (PDF)</label>
                  <div 
                    onClick={() => resumeInputRef.current?.click()}
                    className={`w-full p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition ${resumeData ? 'bg-purple-50 border-purple-300' : 'bg-slate-50 border-slate-200 hover:border-purple-300'}`}
                  >
                    {resumeData ? (
                      <>
                        <FileText className="w-8 h-8 text-purple-600 mb-2" />
                        <p className="text-xs font-bold text-purple-700">PDF Cargado</p>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setResumeData(null); }} className="mt-2 text-[10px] text-red-500 font-bold uppercase hover:underline">Eliminar</button>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-xs font-bold text-slate-500">Seleccionar PDF</p>
                      </>
                    )}
                  </div>
                  <input type="file" ref={resumeInputRef} onChange={handleResumeChange} accept="application/pdf" className="hidden" />
                </div>
              </div>

              {/* Right Column: Text Fields */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <h4 className="text-xs font-bold uppercase text-purple-400 tracking-widest border-b pb-2 mb-2">Información Personal</h4>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Nombres</label>
                  <input name="firstName" defaultValue={selectedTeacher?.firstName} required className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Apellidos</label>
                  <input name="lastName" defaultValue={selectedTeacher?.lastName} required className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Edad</label>
                  <input type="number" name="age" defaultValue={selectedTeacher?.age} required className="w-full border rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Tipo de Sangre (RH)</label>
                  <select name="bloodType" defaultValue={selectedTeacher?.bloodType} className="w-full border rounded-lg px-4 py-2">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Dirección de Residencia</label>
                  <input name="address" defaultValue={selectedTeacher?.address} required className="w-full border rounded-lg px-4 py-2" />
                </div>

                <div className="md:col-span-2 mt-4">
                  <h4 className="text-xs font-bold uppercase text-purple-400 tracking-widest border-b pb-2 mb-2">Contacto y Laboral</h4>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Correo Electrónico</label>
                  <input type="email" name="email" defaultValue={selectedTeacher?.email} required className="w-full border rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Teléfono</label>
                  <input name="phone" defaultValue={selectedTeacher?.phone} required className="w-full border rounded-lg px-4 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Categoría asignada</label>
                  <select name="category" defaultValue={selectedTeacher?.category} className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Fecha de Ingreso</label>
                  <input type="date" name="entryDate" defaultValue={selectedTeacher?.entryDate} required className="w-full border rounded-lg px-4 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Número de Cuenta Bancaria</label>
                  <input name="bankAccount" defaultValue={selectedTeacher?.bankAccount} required className="w-full border rounded-lg px-4 py-2" />
                </div>
                
                <div className="md:col-span-2 pt-6">
                  <button type="submit" className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-100 transition text-lg">
                    {selectedTeacher ? 'Actualizar Docente' : 'Registrar Docente'}
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

export default TeacherManager;
