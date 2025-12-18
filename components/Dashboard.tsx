
import React from 'react';
import { Student, Teacher, Payment, CashTransaction, SchoolSettings } from '../types';
import { Users, UserSquare2, DollarSign, Wallet, TrendingUp, TrendingDown, Trophy } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface Props {
  students: Student[];
  teachers: Teacher[];
  payments: Payment[];
  cashFlow: CashTransaction[];
  schoolSettings: SchoolSettings;
}

const Dashboard: React.FC<Props> = ({ students, teachers, payments, cashFlow, schoolSettings }) => {
  const totalIncome = cashFlow.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = cashFlow.filter(t => t.type === 'OUTCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpenses;

  const paidUpCount = students.filter(s => s.isPaidUp).length;
  const pendingCount = students.length - paidUpCount;

  const pieData = [
    { name: 'Al día', value: paidUpCount },
    { name: 'Pendientes', value: pendingCount },
  ];
  const COLORS = ['#10b981', '#ef4444'];

  const stats = [
    { label: 'Total Alumnos', value: students.length, icon: <Users className="w-6 h-6" />, color: 'bg-blue-500' },
    { label: 'Total Docentes', value: teachers.length, icon: <UserSquare2 className="w-6 h-6" />, color: 'bg-purple-500' },
    { label: 'Ingresos Caja', value: `$${totalIncome.toLocaleString()}`, icon: <TrendingUp className="w-6 h-6" />, color: 'bg-green-500' },
    { label: 'Egresos Caja', value: `$${totalExpenses.toLocaleString()}`, icon: <TrendingDown className="w-6 h-6" />, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10 space-y-2">
          <p className="text-blue-400 font-bold uppercase tracking-widest text-xs">Panel de Control</p>
          <h1 className="text-3xl font-black">Bienvenido a {schoolSettings.name}</h1>
          <p className="text-slate-400 max-w-md">Gestión deportiva inteligente para el alto rendimiento de tus atletas.</p>
        </div>
        <div className="relative z-10 mt-6 md:mt-0 flex items-center gap-4">
           {schoolSettings.logo ? (
             <img src={schoolSettings.logo} alt="Logo" className="w-24 h-24 object-contain bg-white rounded-xl p-2 shadow-2xl" />
           ) : (
             <div className="bg-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition">
            <div className={`${stat.color} p-3 rounded-lg text-white shadow-md`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-500" />
            Estado de Pagos (Alumnos)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-medium text-slate-600">Al día: {paidUpCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-slate-600">Pendientes: {pendingCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-500" />
            Balance de Caja Menor
          </h3>
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold mb-2">Disponible</p>
            <p className={`text-5xl font-black ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ${balance.toLocaleString()}
            </p>
            <div className="mt-8 w-full bg-slate-50 rounded-lg p-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-slate-500">Ingresos Totales</p>
                <p className="text-lg font-bold text-emerald-600">+${totalIncome.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-500">Egresos Totales</p>
                <p className="text-lg font-bold text-red-600">-${totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
