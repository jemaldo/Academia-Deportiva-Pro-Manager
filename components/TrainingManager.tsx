
import React, { useState } from 'react';
import { generateTrainingProgram } from '../services/geminiService';
import { CATEGORIES } from '../constants';
import { ClipboardList, Sparkles, Loader2, Calendar, Clock, Target } from 'lucide-react';

const TrainingManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState('Resistencia física y control de balón');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [program, setProgram] = useState<any>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateTrainingProgram(category, focus);
      setProgram(result);
    } catch (error) {
      console.error(error);
      alert("Error al generar el programa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h3 className="text-xl font-bold">Generador de Programas de Entrenamiento (IA)</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Categoría Objetivo</label>
            <select 
              className="w-full border rounded-lg px-4 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Enfoque del Entrenamiento</label>
            <input 
              type="text"
              className="w-full border rounded-lg px-4 py-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="Ej: Defensa táctica, definición, juego aéreo..."
            />
          </div>
        </div>
        
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="mt-6 w-full md:w-auto bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          Generar Programa Personalizado
        </button>
      </div>

      {program && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-bold text-slate-800">Programa Sugerido para {category}</h4>
            <button className="text-blue-600 font-bold text-sm hover:underline">Imprimir Programa</button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {program.sessions.map((session: any, idx: number) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
                <div className="bg-blue-600 text-white p-6 md:w-48 flex flex-col justify-center items-center text-center">
                  <Calendar className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-lg font-black uppercase tracking-tighter">{session.day}</span>
                  <div className="mt-2 flex items-center gap-1 text-xs opacity-80">
                    <Clock className="w-3 h-3" /> {session.duration}
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <h5 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" /> {session.title}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {session.activities.map((act: string, aIdx: number) => (
                      <div key={aIdx} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">
                          {aIdx + 1}
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{act}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingManager;
