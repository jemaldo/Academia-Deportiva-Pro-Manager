
import React, { useState, useEffect, useCallback } from 'react';
import { 
  AppView, 
  Student, 
  Teacher, 
  Payment, 
  CashTransaction, 
  MatchSquad, 
  User,
  SchoolSettings 
} from './types';
import { NAV_ITEMS } from './constants';
import Dashboard from './components/Dashboard';
import StudentManager from './components/StudentManager';
import TeacherManager from './components/TeacherManager';
import FinanceManager from './components/FinanceManager';
import MatchManager from './components/MatchManager';
import TrainingManager from './components/TrainingManager';
import ReportManager from './components/ReportManager';
import UserSettings from './components/UserSettings';
import { 
  LogOut, 
  User as UserIcon, 
  Menu, 
  X, 
  Trophy, 
  CloudLightning, 
  RefreshCw, 
  AlertCircle, 
  CloudCheck, 
  CloudUpload,
  Save,
  TriangleAlert,
  Info
} from 'lucide-react';

const APP_VERSION = "1.0.2"; // Control de versión manual para el usuario

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [cloudUpdateAvailable, setCloudUpdateAvailable] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Estados con carga inicial desde LocalStorage
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => {
    const saved = localStorage.getItem('schoolSettings');
    return saved ? JSON.parse(saved) : {
      name: 'Pro-Manager Academia',
      nit: '900.123.456-7',
      address: 'Calle Deportiva 123, Ciudad',
      phone: '(+57) 300 123 4567',
      email: 'contacto@promanager.com'
    };
  });

  const [students, setStudents] = useState<Student[]>(() => JSON.parse(localStorage.getItem('students') || '[]'));
  const [teachers, setTeachers] = useState<Teacher[]>(() => JSON.parse(localStorage.getItem('teachers') || '[]'));
  const [payments, setPayments] = useState<Payment[]>(() => JSON.parse(localStorage.getItem('payments') || '[]'));
  const [cashFlow, setCashFlow] = useState<CashTransaction[]>(() => JSON.parse(localStorage.getItem('cashFlow') || '[]'));
  const [squads, setSquads] = useState<MatchSquad[]>(() => JSON.parse(localStorage.getItem('squads') || '[]'));
  const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem('users') || '[{"id":"1","username":"admin","role":"ADMIN"}]'));

  const markChanges = () => setHasUnsavedChanges(true);

  useEffect(() => { localStorage.setItem('schoolSettings', JSON.stringify(schoolSettings)); }, [schoolSettings]);
  useEffect(() => { localStorage.setItem('students', JSON.stringify(students)); markChanges(); }, [students]);
  useEffect(() => { localStorage.setItem('teachers', JSON.stringify(teachers)); markChanges(); }, [teachers]);
  useEffect(() => { localStorage.setItem('payments', JSON.stringify(payments)); markChanges(); }, [payments]);
  useEffect(() => { localStorage.setItem('cashFlow', JSON.stringify(cashFlow)); markChanges(); }, [cashFlow]);
  useEffect(() => { localStorage.setItem('squads', JSON.stringify(squads)); markChanges(); }, [squads]);
  useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); markChanges(); }, [users]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "Tienes cambios sin guardar en la nube. ¿Estás seguro de que quieres salir?";
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handlePushToCloud = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const allData = { schoolSettings, students, teachers, payments, cashFlow, squads, users };
    console.log("Subiendo respaldo a Drive:", allData);
    setSchoolSettings({ ...schoolSettings, lastCloudSync: new Date().toISOString() });
    setHasUnsavedChanges(false);
    setIsSyncing(false);
    setShowExitPrompt(false);
    return true;
  };

  const handleLogoutAttempt = () => {
    if (hasUnsavedChanges && schoolSettings.googleDriveLinked) {
      setShowExitPrompt(true);
    } else {
      setCurrentUser(null);
    }
  };

  const checkCloudUpdates = useCallback(() => {
    if (!schoolSettings.googleDriveLinked) return;
    const mockCheck = () => {
      const lastLocalSync = new Date(schoolSettings.lastCloudSync || 0).getTime();
      const mockCloudTime = lastLocalSync + 5000; 
      if (mockCloudTime > lastLocalSync && !hasUnsavedChanges) {
        setCloudUpdateAvailable({ timestamp: new Date(mockCloudTime).toISOString() });
      }
    };
    setTimeout(mockCheck, 3000);
  }, [schoolSettings.googleDriveLinked, schoolSettings.lastCloudSync, hasUnsavedChanges]);

  useEffect(() => {
    checkCloudUpdates();
    window.addEventListener('focus', checkCloudUpdates);
    return () => window.removeEventListener('focus', checkCloudUpdates);
  }, [checkCloudUpdates]);

  const handleImportAllData = (data: any) => {
    if (data.schoolSettings) setSchoolSettings({ ...data.schoolSettings, lastCloudSync: new Date().toISOString() });
    if (data.students) setStudents(data.students);
    if (data.teachers) setTeachers(data.teachers);
    if (data.payments) setPayments(data.payments);
    if (data.cashFlow) setCashFlow(data.cashFlow);
    if (data.squads) setSquads(data.squads);
    if (data.users) setUsers(data.users);
    setCloudUpdateAvailable(null);
    setHasUnsavedChanges(false);
  };

  const renderView = () => {
    const commonProps = { schoolSettings, students, teachers, payments, cashFlow, squads, users };
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard {...commonProps} />;
      case 'STUDENTS': return <StudentManager students={students} setStudents={setStudents} payments={payments} setPayments={setPayments} schoolSettings={schoolSettings} />;
      case 'TEACHERS': return <TeacherManager teachers={teachers} setTeachers={setTeachers} payments={payments} setPayments={setPayments} schoolSettings={schoolSettings} />;
      case 'FINANCE': return <FinanceManager cashFlow={cashFlow} setCashFlow={setCashFlow} />;
      case 'MATCHES': return <MatchManager squads={squads} setSquads={setSquads} students={students} schoolSettings={schoolSettings} />;
      case 'TRAINING': return <TrainingManager />;
      case 'REPORTS': return <ReportManager students={students} teachers={teachers} payments={payments} cashFlow={cashFlow} />;
      case 'USERS':
        return (
          <UserSettings 
            users={users} 
            setUsers={setUsers} 
            currentUser={currentUser} 
            schoolSettings={schoolSettings} 
            setSchoolSettings={setSchoolSettings}
            allData={commonProps}
            onImportData={handleImportAllData}
          />
        );
      default: return <Dashboard {...commonProps} />;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
          {schoolSettings.logo ? (
            <img src={schoolSettings.logo} alt="Logo" className="w-24 h-24 mx-auto mb-4 object-contain" />
          ) : (
            <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          )}
          <h1 className="text-2xl font-bold mb-6 text-slate-800">{schoolSettings.name}</h1>
          <button 
            onClick={() => {
              setCurrentUser(users[0]);
              setHasUnsavedChanges(false);
            }}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            Entrar al Sistema
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden relative">
      {showExitPrompt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <TriangleAlert className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">¡Espera un momento!</h3>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                Has realizado cambios que aún no se han guardado en **Google Drive**. ¿Deseas subir una copia de seguridad antes de cerrar la sesión?
              </p>
              <div className="space-y-3">
                <button 
                  onClick={handlePushToCloud}
                  disabled={isSyncing}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition flex items-center justify-center gap-3 shadow-xl shadow-blue-100 disabled:opacity-50"
                >
                  {isSyncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CloudUpload className="w-5 h-5" />}
                  RESPALDAR Y SALIR
                </button>
                <button 
                  onClick={() => { setShowExitPrompt(false); setCurrentUser(null); }}
                  disabled={isSyncing}
                  className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition"
                >
                  SALIR SIN RESPALDAR
                </button>
                <button 
                  onClick={() => setShowExitPrompt(false)}
                  disabled={isSyncing}
                  className="w-full text-slate-400 py-2 text-xs font-bold hover:text-slate-600 transition"
                >
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cloudUpdateAvailable && (
        <div className="fixed bottom-6 right-6 z-[100] w-80 bg-slate-900 text-white shadow-2xl rounded-2xl p-5 border border-slate-700 animate-slide-in">
          <div className="flex gap-4">
            <div className="bg-blue-500 p-2 rounded-xl h-fit">
              <CloudLightning className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black uppercase tracking-widest text-blue-400">Datos en Nube</h4>
              <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">Se detectaron cambios recientes en el Drive. ¿Deseas actualizar tu sesión local?</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleImportAllData({})} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-[10px] font-black transition"
                >
                  ACTUALIZAR
                </button>
                <button 
                  onClick={() => setCloudUpdateAvailable(null)}
                  className="px-3 py-2 bg-slate-800 text-slate-500 rounded-lg text-[10px] font-bold"
                >
                  LUEGO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            {schoolSettings.logo ? (
              <img src={schoolSettings.logo} alt="Logo" className="w-10 h-10 object-contain rounded-lg bg-white p-1" />
            ) : (
              <div className="bg-blue-600 p-2 rounded-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            )}
            <h1 className="text-xl font-bold tracking-tight truncate">{schoolSettings.name.split(' ')[0]}</h1>
          </div>

          <nav className="space-y-1 flex-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id as AppView);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${currentView === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800">
            {/* INDICADOR DE VERSIÓN */}
            <div className="mb-4 px-2 py-1 bg-slate-800/50 rounded-lg flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sistema</span>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-1.5 rounded">v{APP_VERSION}</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="bg-slate-800 p-2 rounded-full">
                <UserIcon className="w-5 h-5 text-slate-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{currentUser.username}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black">{currentUser.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogoutAttempt}
              className="w-full flex items-center gap-2 text-slate-500 hover:text-red-400 text-xs transition font-bold"
            >
              <LogOut className="w-4 h-4" /> CERRAR SESIÓN
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {isSidebarOpen ? <X /> : <Menu />}
            </button>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
              {NAV_ITEMS.find(i => i.id === currentView)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
             {schoolSettings.googleDriveLinked && (
               <div className="flex items-center gap-2">
                 {hasUnsavedChanges ? (
                    <button 
                      onClick={handlePushToCloud}
                      disabled={isSyncing}
                      className="flex items-center gap-2 text-amber-600 font-black text-[10px] bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 hover:bg-amber-100 transition animate-pulse"
                    >
                      {isSyncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CloudUpload className="w-3 h-3" />}
                      SINCRONIZAR AHORA
                    </button>
                 ) : (
                    <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                      <CloudCheck className="w-3 h-3" /> DRIVE ACTUALIZADO
                    </div>
                 )}
               </div>
             )}
             <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('es-ES', { weekday: 'long' })}</span>
                <span className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
             </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderView()}
        </section>
      </main>
    </div>
  );
};

export default App;
