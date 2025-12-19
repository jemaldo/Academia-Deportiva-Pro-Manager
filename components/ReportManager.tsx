
import React, { useMemo, useState } from 'react';
import { Student, Teacher, Payment, CashTransaction } from '../types.ts';
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
import { exportWorkbook } from '../services/excelService.ts';
import { CATEGORIES } from '../constants.tsx';

interface Props {
  students: Student[];
  teachers: Teacher[];
  payments: Payment[];
  cashFlow: CashTransaction[];
}

const ReportManager: React.FC<Props> = ({ students, teachers, payments, cashFlow }) => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const finances = useMemo(() => {
    const incomes = cashFlow.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
    const outcomes = cashFlow.filter(t => t.type === 'OUTCOME').reduce((acc, curr) => acc + curr.amount, 0);
    return { incomes, outcomes, balance: incomes - outcomes };
  }, [cashFlow]);

  const debtors = useMemo(() => students.filter(s => !s.isPaidUp), [students]);

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
            Acudiente: s.parents[0]?.name || 'N/A'
          }))
        }];
        break;
      case 'FINANCIERO':
        sheets = [
          {
            name: "Ingresos",
            data: cashFlow.filter(t => t.type === 'INCOME').map(t => ({ Fecha: t.date, Concepto: t.description, Monto: t.amount }))
          }
        ];
        break;
    }

    if (sheets.length > 0) exportWorkbook(sheets, fileName);
  };

  const handlePrint = (reportId: string) => {
    setSelectedReport(reportId);
    setTimeout(() => {
      window.print();
      setSelectedReport(null);
    }, 100);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">Centro de Reportes</h3>
          <p className="text-slate-500 text-sm">Visualiza y exporta la información vital de tu academia.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all group overflow-hidden relative">
          <div className="bg-red-100 text-red-600 p-3 rounded-2xl w-fit mb-4"><UserX /></div>
          <h4 className="font-bold text-slate-800 mb-1">Reporte de Morosos</h4>
          <div className="space-y-2 mt-4">
            <button onClick={() => handleExportExcel('MOROSOS')} className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-red-50 text-slate-600 rounded-lg text-xs font-bold transition">
              <span>Descargar Excel</span> <Download className="w-4 h-4" />
            </button>
            <button onClick={() => handlePrint('DEBTORS')} className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-900 text-slate-600 hover:text-white rounded-lg text-xs font-bold transition">
              <span>Imprimir / PDF</span> <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="print-only fixed inset-0 bg-white z-[999] p-12">
        <h1 className="text-3xl font-black uppercase text-slate-900 mb-8">Reporte Institucional</h1>
        {selectedReport === 'DEBTORS' && (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-y border-slate-300">
                <th className="px-3 py-3 font-bold uppercase">Alumno</th>
                <th className="px-3 py-3 font-bold uppercase">Acudiente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {debtors.map(s => (
                <tr key={s.id}>
                  <td className="px-3 py-3 font-bold">{s.fullName}</td>
                  <td className="px-3 py-3">{s.parents[0]?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReportManager;
