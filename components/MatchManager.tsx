
import React, { useState } from 'react';
import { MatchSquad, Student, SquadPlayer } from '../types';
import { CATEGORIES, POSITIONS } from '../constants';
import { Trophy, Calendar, Users, ClipboardCheck, Plus, Trash2 } from 'lucide-react';

interface Props {
  squads: MatchSquad[];
  setSquads: React.Dispatch<React.SetStateAction<MatchSquad[]>>;
  students: Student[];
}

const MatchManager: React.FC<Props> = ({ squads, setSquads, students }) => {
  const [showSquadForm, setShowSquadForm] = useState(false);
  const [currentSquad, setCurrentSquad] = useState<Partial<MatchSquad>>({
    date: new Date().toISOString().split('T')[0],
    category: CATEGORIES[0],
    players: []
  });

  const handleAddPlayer = (student: Student) => {
    if (currentSquad.players?.find(p => p.studentId === student.id)) return;
    const newPlayer: SquadPlayer = {
      studentId: student.id,
      name: student.fullName,
      position: student.position,
      isStarter: (currentSquad.players?.length || 0) < 11
    };
    setCurrentSquad({ ...currentSquad, players: [...(currentSquad.players || []), newPlayer] });
  };

  const handleToggleStarter = (id: string) => {
    setCurrentSquad({
      ...currentSquad,
      players: currentSquad.players?.map(p => p.studentId === id ? { ...p, isStarter: !p.isStarter } : p)
    });
  };

  const handleSaveSquad = () => {
    if (!currentSquad.opponent || !currentSquad.date) {
      alert("Faltan datos obligatorios");
      return;
    }
    const finalSquad: MatchSquad = {
      ...currentSquad as MatchSquad,
      id: Date.now().toString(),
    };
    setSquads([...squads, finalSquad]);
    setShowSquadForm(false);
    setCurrentSquad({ date: new Date().toISOString().split('T')[0], category: CATEGORIES[0], players: [] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" /> Próximos Partidos y Convocatorias
        </h3>
        <button 
          onClick={() => setShowSquadForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Crear Convocatoria
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {squads.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            No hay convocatorias creadas.
          </div>
        ) : (
          squads.map(squad => (
            <div key={squad.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="bg-slate-900 p-4 text-white">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-black uppercase tracking-widest bg-blue-600 px-2 py-0.5 rounded">{squad.category}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> {squad.date}</span>
                </div>
                <h4 className="text-xl font-bold truncate">vs {squad.opponent}</h4>
              </div>
              <div className="p-4 flex-1 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase border-b border-slate-100 pb-1">Titulares ({squad.players.filter(p => p.isStarter).length})</p>
                <div className="grid grid-cols-1 gap-1">
                  {squad.players.filter(p => p.isStarter).map(p => (
                    <div key={p.studentId} className="flex justify-between text-sm">
                      <span className="font-semibold text-slate-700">{p.name}</span>
                      <span className="text-xs text-slate-400">{p.position}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase border-b border-slate-100 pb-1 mt-4">Suplentes ({squad.players.filter(p => !p.isStarter).length})</p>
                <div className="grid grid-cols-1 gap-1">
                  {squad.players.filter(p => !p.isStarter).map(p => (
                    <div key={p.studentId} className="flex justify-between text-sm">
                      <span className="text-slate-600">{p.name}</span>
                      <span className="text-xs text-slate-400">{p.position}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                <button className="flex-1 bg-white border border-slate-200 text-slate-600 py-1.5 rounded-lg text-sm font-bold hover:bg-slate-100 transition">Ver Lista</button>
                <button 
                  onClick={() => setSquads(squads.filter(s => s.id !== squad.id))}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showSquadForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg">Nueva Planilla de Partido</h3>
              <button onClick={() => setShowSquadForm(false)}>Cerrar</button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 p-4 border-r border-slate-100 overflow-y-auto space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Rival</label>
                  <input 
                    className="w-full border rounded-lg px-3 py-2" 
                    placeholder="Nombre del equipo rival"
                    onChange={(e) => setCurrentSquad({ ...currentSquad, opponent: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Fecha</label>
                  <input 
                    type="date" 
                    className="w-full border rounded-lg px-3 py-2" 
                    value={currentSquad.date}
                    onChange={(e) => setCurrentSquad({ ...currentSquad, date: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Categoría</label>
                  <select 
                    className="w-full border rounded-lg px-3 py-2"
                    onChange={(e) => setCurrentSquad({ ...currentSquad, category: e.target.value })}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-bold text-sm mb-2 uppercase text-slate-400 tracking-widest">Seleccionar Alumnos</h4>
                  <div className="space-y-1">
                    {students.filter(s => s.category === currentSquad.category).map(s => (
                      <button 
                        key={s.id}
                        onClick={() => handleAddPlayer(s)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded flex justify-between items-center group"
                      >
                        <span>{s.fullName}</span>
                        <span className="text-xs text-slate-400 group-hover:text-blue-500">{s.position}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 bg-slate-50 overflow-y-auto">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-black uppercase text-slate-900 tracking-tighter">Planilla Oficial de Juego</h2>
                    <p className="text-slate-500 font-medium">{currentSquad.category} • vs {currentSquad.opponent || '---'} • {currentSquad.date}</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h5 className="text-xs font-black uppercase text-blue-600 border-b-2 border-blue-600 mb-3 pb-1">Titulares (11 Máx)</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {currentSquad.players?.filter(p => p.isStarter).map(p => (
                          <div key={p.studentId} className="bg-slate-50 px-3 py-2 rounded border border-slate-100 flex justify-between items-center">
                            <span className="font-bold text-sm">{p.name} <span className="text-slate-400 font-normal">({p.position})</span></span>
                            <button onClick={() => handleToggleStarter(p.studentId)} className="text-xs text-blue-600 hover:underline">Hacer Suplente</button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-black uppercase text-slate-600 border-b-2 border-slate-300 mb-3 pb-1">Suplentes / Convocados</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {currentSquad.players?.filter(p => !p.isStarter).map(p => (
                          <div key={p.studentId} className="bg-slate-50 px-3 py-2 rounded border border-slate-100 flex justify-between items-center">
                            <span className="text-sm font-medium">{p.name} <span className="text-slate-400 font-normal">({p.position})</span></span>
                            <div className="flex gap-2">
                              <button onClick={() => handleToggleStarter(p.studentId)} className="text-xs text-emerald-600 hover:underline">Hacer Titular</button>
                              <button 
                                onClick={() => setCurrentSquad({ ...currentSquad, players: currentSquad.players?.filter(pl => pl.studentId !== p.studentId) })}
                                className="text-xs text-red-600 hover:underline"
                              >Eliminar</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-white flex justify-end gap-3">
              <button onClick={() => setShowSquadForm(false)} className="px-6 py-2 bg-slate-100 rounded-lg font-bold">Cancelar</button>
              <button onClick={handleSaveSquad} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition">Finalizar Planilla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchManager;
