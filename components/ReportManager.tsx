
import React, { useMemo, useState } from 'react';
import { Student, Teacher, Payment, CashTransaction } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  FileText, 
  Download, 
  Printer, 
  Users, 
  UserX, 
  TrendingUp, 
  TrendingDown, 
  FileSpreadsheet, 
  ChevronRight,
  PieChart as PieChartIcon,
  Search,
  School
} from 'lucide-react';
import { exportWorkbook } from '../services/excelService';
import { CATEGORIES } from '../constants';

interface Props {
  students: Student[];
  teachers: Teacher[];
  payments: Payment[];
  cashFlow: CashTransaction[];
}

const ReportManager: React.FC<Props> = ({ students, teachers, payments, cashFlow }) => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  // Datos financieros consolidados
  const finances = useMemo(() => {
    const incomes = cashFlow.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
    const outcomes = cashFlow.filter(t => t.type === 'OUTCOME').reduce((acc, curr) => acc + curr.amount, 0);
    return { incomes, outcomes, balance: incomes - outcomes };
  }, [cashFlow]);

  // Alumnos morosos
  const debtors = useMemo(() => students.filter(s => !s.isPaidUp), [students]);

  // Gráfico de morosidad
  const paidVsUnpaidData = useMemo(() => [
    { name: 'Paz y Salvo', value: students.length - debtors.length, color: '#10b981' },
    { name: 'Morosos', value: debtors.length, color: '#ef4444' }
  ], [students, debtors]);

  const handleExportExcel = (type: string) => {
    let sheets: { name: string; data: any[] }[] = [];
    let fileName = `Reporte_${type}_${new Date().toISOString().split('T')[0]}`;

    switch (type) {
      case 'MOROSOS':
        sheets = [{
          name: "Alumnos Morosos",
          data: debtors.map(s => ({
            Nombre: s.fullName,
            Documento: s.dni,
            Categoria: s.category,
            Telefono: s.phone,
            Acudiente: s.parents[0]?.name || 'N/A',
            TelefonoAcudiente: s.parents[0]?.phone || 'N/A'
          }))
        }];
        break;
      case 'FINANCIERO':
        sheets = [
          {
            name: "Ingresos",
            data: cashFlow.filter(t => t.type === 'INCOME').map(t => ({ Fecha: t.date, Concepto: t.description, Monto: t.amount, Usuario: t.user }))
          },
          {
            name: "Egresos",
            data: cashFlow.filter(t => t.type === 'OUTCOME').map(t => ({ Fecha: t.date, Concepto: t.description, Monto: t.amount, Usuario: t.user }))
          }
        ];
        break;
      case 'ALUMNOS_FULL':
        sheets = [{
          name: "Listado Maestro Alumnos",
          data: students.map(s => ({
            Nombre: s.fullName,
            DNI: s.dni,
            Edad: s.age,
            RH: s.bloodType,
            Categoria: s.category,
            Posicion: s.position,
            Telefono: s.phone,
            Estado: s.isPaidUp ? 'Paz y Salvo' : 'Moroso'
          }))
        }];
        break;
      case 'DOCENTES_FULL':
        sheets = [{
          name: "Listado Maestro Docentes",
          data: teachers.map(t => ({
            Nombre: `${t.firstName} ${t.lastName}`,
            Categoria: t.category,
            Telefono: t.phone,
            Email: t.email,
            CuentaBancaria: t.bankAccount,
            FechaIngreso: t.entryDate
          }))
        }];
        break;
    }

    if (sheets.length > 0) {
      exportWorkbook(sheets, fileName);
    }
  };

  const handlePrint = (reportId: string) => {
    setSelectedReport(reportId);
    // Pequeño delay para que el estado se refleje antes de imprimir
    setTimeout(() => {
      window.print();
      setSelectedReport(null);
    }, 100);
  };

  const CATEGORY_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Informativo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Centro de Reportes Gerenciales</h3>
          <p className="text-slate-500 text-sm">Visualiza y exporta la información vital de tu academia.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleExportExcel('ALUMNOS_FULL')}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
          >
            <FileSpreadsheet className="w-4 h-4" /> Exportar Todo (Excel)
          </button>
        </div>
      </div>

      {/* Grid de Reportes Específicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
        {/* Card: Morosos */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="bg-red-100 text-red-600 p-3 rounded-2xl w-fit mb-4">
              <UserX className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">Reporte de Morosos</h4>
            <p className="text-xs text-slate-500 mb-6">Listado de alumnos con mensualidades pendientes.</p>
            <div className="space-y-2">
              <button 
                onClick={() => handleExportExcel('MOROSOS')}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-lg text-xs font-bold transition"
              >
                <span>Descargar Excel</span>
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handlePrint('DEBTORS')}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-900 text-slate-600 hover:text-white rounded-lg text-xs font-bold transition"
              >
                <span>Generar PDF / Imprimir</span>
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Card: Ingresos/Egresos */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl w-fit mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">Movimientos de Caja</h4>
            <p className="text-xs text-slate-500 mb-6">Estado detallado de ingresos y egresos registrados.</p>
            <div className="space-y-2">
              <button 
                onClick={() => handleExportExcel('FINANCIERO')}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg text-xs font-bold transition"
              >
                <span>Descargar Excel</span>
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handlePrint('FINANCES')}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-900 text-slate-600 hover:text-white rounded-lg text-xs font-bold transition"
              >
                <span>Generar PDF / Imprimir</span>
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Card: Alumnos Full */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl w-fit mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">Listado de Alumnos</h4>
            <p className="text-xs text-slate-500 mb-6">Base de datos completa de todos los estudiantes.</p>
            <div className="space-y-2">
              <button 
                onClick={() => handleExportExcel('ALUMNOS_FULL')}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg text-xs font-bold transition"
              >
                <span>Descargar Excel</span>
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handlePrint('STUDENTS')}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-900 text-slate-600 hover:text-white rounded-lg text-xs font-bold transition"
              >
                <span>Generar PDF / Imprimir</span>
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Card: Docentes Full */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-2xl w-fit mb-4">
              <School className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">Cuerpo Docente</h4>
            <p className="text-xs text-slate-500 mb-6">Información laboral y de contacto de profesores.</p>
            <div className="space-y-2">
              <button 
                onClick={() => handleExportExcel('DOCENTES_FULL')}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-700 rounded-lg text-xs font-bold transition"
              >
                <span>Descargar Excel</span>
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handlePrint('TEACHERS')}
                className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-900 text-slate-600 hover:text-white rounded-lg text-xs font-bold transition"
              >
                <span>Generar PDF / Imprimir</span>
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visualización de Datos (Gráficos) - no-print */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="font-bold mb-6 flex items-center gap-2 text-slate-800">
            <PieChartIcon className="w-5 h-5 text-blue-500" />
            Estado de Pagos Global
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paidVsUnpaidData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paidVsUnpaidData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="font-bold mb-6 flex items-center gap-2 text-slate-800">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Alumnos por Categoría
          </h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORIES.map(c => ({ name: c, total: students.filter(s => s.category === c).length }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Alumnos">
                  {paidVsUnpaidData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* VISTA DE IMPRESIÓN (Solo visible al imprimir) */}
      <div className="print-only fixed inset-0 bg-white z-[999] p-12">
        <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black uppercase text-slate-900 tracking-tighter">Reporte Institucional</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Academia Deportiva Pro-Manager</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400">FECHA DE GENERACIÓN</p>
            <p className="text-sm font-black">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Tabla Dinámica según el reporte seleccionado */}
        <h2 className="text-xl font-black text-slate-800 mb-6 uppercase border-l-4 border-blue-600 pl-4">
          {selectedReport === 'DEBTORS' && 'Relación Detallada de Alumnos Morosos'}
          {selectedReport === 'FINANCES' && 'Balance de Movimientos de Caja Menor'}
          {selectedReport === 'STUDENTS' && 'Listado Maestro de Alumnos'}
          {selectedReport === 'TEACHERS' && 'Listado de Personal Docente'}
        </h2>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 border-y border-slate-300">
              {selectedReport === 'DEBTORS' && (
                <>
                  <th className="px-3 py-3 font-bold uppercase">Alumno</th>
                  <th className="px-3 py-3 font-bold uppercase">Categoría</th>
                  <th className="px-3 py-3 font-bold uppercase">Acudiente</th>
                  <th className="px-3 py-3 font-bold uppercase">Contacto</th>
                </>
              )}
              {selectedReport === 'FINANCES' && (
                <>
                  <th className="px-3 py-3 font-bold uppercase">Fecha</th>
                  <th className="px-3 py-3 font-bold uppercase">Tipo</th>
                  <th className="px-3 py-3 font-bold uppercase">Descripción</th>
                  <th className="px-3 py-3 font-bold uppercase text-right">Monto</th>
                </>
              )}
              {selectedReport === 'STUDENTS' && (
                <>
                  <th className="px-3 py-3 font-bold uppercase">Alumno</th>
                  <th className="px-3 py-3 font-bold uppercase">DNI</th>
                  <th className="px-3 py-3 font-bold uppercase">Categoría</th>
                  <th className="px-3 py-3 font-bold uppercase">Estado</th>
                </>
              )}
              {selectedReport === 'TEACHERS' && (
                <>
                  <th className="px-3 py-3 font-bold uppercase">Docente</th>
                  <th className="px-3 py-3 font-bold uppercase">Especialidad</th>
                  <th className="px-3 py-3 font-bold uppercase">Teléfono</th>
                  <th className="px-3 py-3 font-bold uppercase">Email</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {selectedReport === 'DEBTORS' && debtors.map(s => (
              <tr key={s.id}>
                <td className="px-3 py-3 font-bold">{s.fullName}</td>
                <td className="px-3 py-3">{s.category}</td>
                <td className="px-3 py-3">{s.parents[0]?.name}</td>
                <td className="px-3 py-3">{s.parents[0]?.phone}</td>
              </tr>
            ))}
            {selectedReport === 'FINANCES' && cashFlow.map(t => (
              <tr key={t.id}>
                <td className="px-3 py-3">{t.date}</td>
                <td className="px-3 py-3 font-bold">{t.type === 'INCOME' ? 'INGRESO' : 'EGRESO'}</td>
                <td className="px-3 py-3">{t.description}</td>
                <td className="px-3 py-3 text-right font-black">${t.amount.toLocaleString()}</td>
              </tr>
            ))}
            {selectedReport === 'STUDENTS' && students.map(s => (
              <tr key={s.id}>
                <td className="px-3 py-3 font-bold">{s.fullName}</td>
                <td className="px-3 py-3">{s.dni}</td>
                <td className="px-3 py-3">{s.category}</td>
                <td className="px-3 py-3 font-bold">{s.isPaidUp ? 'Paz y Salvo' : 'Moroso'}</td>
              </tr>
            ))}
            {selectedReport === 'TEACHERS' && teachers.map(t => (
              <tr key={t.id}>
                <td className="px-3 py-3 font-bold">{t.firstName} {t.lastName}</td>
                <td className="px-3 py-3">{t.category}</td>
                <td className="px-3 py-3">{t.phone}</td>
                <td className="px-3 py-3">{t.email}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center opacity-50 italic">
          <p className="text-[10px]">Este documento es un reporte generado por el Sistema Pro-Manager. No requiere firma física.</p>
          <p className="text-[10px]">Página 1 de 1</p>
        </div>
      </div>
    </div>
  );
};

export default ReportManager;
