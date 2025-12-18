
import React, { useState } from 'react';
import { CashTransaction } from '../types';
import { Plus, Search, TrendingUp, TrendingDown, RefreshCw, Printer, AlertTriangle } from 'lucide-react';

interface Props {
  cashFlow: CashTransaction[];
  setCashFlow: React.Dispatch<React.SetStateAction<CashTransaction[]>>;
}

const FinanceManager: React.FC<Props> = ({ cashFlow, setCashFlow }) => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'INCOME' | 'OUTCOME'>('INCOME');

  const totalIncome = cashFlow.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutcome = cashFlow.filter(t => t.type === 'OUTCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalOutcome;

  const handleSaveTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTx: CashTransaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: transactionType,
      amount: Number(formData.get('amount')),
      description: formData.get('description') as string,
      user: 'admin'
    };
    setCashFlow([newTx, ...cashFlow]);
    setShowTransactionModal(false);
  };

  const handleArqueo = () => {
    const physicalAmount = prompt("Ingrese el monto físico contado en caja:");
    if (physicalAmount && !isNaN(Number(physicalAmount))) {
      const diff = Number(physicalAmount) - balance;
      if (diff === 0) {
        alert("¡Arqueo Exitoso! El saldo coincide perfectamente.");
      } else {
        alert(`Diferencia detectada: ${diff > 0 ? '+' : ''}${diff.toLocaleString()}. Revise las transacciones.`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Saldo en Caja</p>
          <p className={`text-4xl font-black ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            ${balance.toLocaleString()}
          </p>
          <div className="mt-4 flex gap-2">
            <button onClick={handleArqueo} className="flex-1 text-xs font-bold py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition">
              Arqueo de Caja
            </button>
            <button className="flex-1 text-xs font-bold py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition">
              Cierre Diario
            </button>
          </div>
        </div>
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-500 p-3 rounded-lg text-white"><TrendingUp /></div>
          <div>
            <p className="text-sm font-semibold text-emerald-800 uppercase tracking-widest">Ingresos Totales</p>
            <p className="text-2xl font-bold text-emerald-700">+${totalIncome.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm flex items-center gap-4">
          <div className="bg-red-500 p-3 rounded-lg text-white"><TrendingDown /></div>
          <div>
            <p className="text-sm font-semibold text-red-800 uppercase tracking-widest">Egresos Totales</p>
            <p className="text-2xl font-bold text-red-700">-${totalOutcome.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Movimientos Recientes
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={() => { setTransactionType('INCOME'); setShowTransactionModal(true); }}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Ingreso
            </button>
            <button 
              onClick={() => { setTransactionType('OUTCOME'); setShowTransactionModal(true); }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Egreso
            </button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Descripción</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Monto</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Usuario</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cashFlow.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No hay movimientos registrados</td></tr>
            ) : (
              cashFlow.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm text-slate-600">{tx.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{tx.description}</td>
                  <td className={`px-6 py-4 text-sm font-bold ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{tx.user}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600"><Printer className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className={`p-4 text-white font-bold flex justify-between items-center ${transactionType === 'INCOME' ? 'bg-emerald-600' : 'bg-red-600'}`}>
              <h3>{transactionType === 'INCOME' ? 'Registrar Ingreso de Caja' : 'Registrar Gasto / Salida'}</h3>
              <button onClick={() => setShowTransactionModal(false)} className="hover:opacity-80">X</button>
            </div>
            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monto ($)</label>
                <input type="number" name="amount" required className="w-full px-4 py-2 border rounded-lg text-lg font-bold" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Concepto / Descripción</label>
                <textarea name="description" required className="w-full px-4 py-2 border rounded-lg h-24" placeholder="Ej: Pago servicio de luz, Compra de balones..."></textarea>
              </div>
              <div className="flex gap-3">
                 <button type="submit" className={`flex-1 py-3 rounded-lg text-white font-bold transition ${transactionType === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  Confirmar Registro
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceManager;
