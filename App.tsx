
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
import { mergeDataLists, fetchDriveData, saveDriveData } from './services/cloudSyncService';
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
  Info,
  CheckCircle2
} from 'lucide-react';

const APP_VERSION = "1.1.0"; // Versión Incremental

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('DASHBOARD');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'UPDATED' | 'ERROR'>('IDLE');

  // Estados
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
  const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem('users') || '[{"id":"1","username":"admin","role":"ADMIN","updatedAt":0}]'));

  // Sincronización automática al abrir la aplicación
  const performIncrementalSync = useCallback(async () => {
    if (!schoolSettings.googleDriveLinked) return;
    
    setSyncStatus('SYNCING');
    try {
      const remoteData = await fetchDriveData();
      if (!remoteData) {
        // Si no hay datos en la nube, subimos los locales
        await handlePushToCloud();
        setSyncStatus('UPDATED');
        return;
      }

      // Fusión incremental
      const mergedStudents = mergeDataLists(students, remoteData.students || []);
      const mergedTeachers = mergeDataLists(teachers, remoteData.teachers || []);
      const mergedPayments = mergeDataLists(payments, remoteData.payments || []);
      const mergedCashFlow = mergeDataLists(cashFlow, remoteData.cashFlow || []);
      const mergedSquads = mergeDataLists(squads, remoteData.squads || []);
      const mergedUsers = mergeDataLists(users, remoteData.users || []);

      // Actualizar estados locales
      setStudents(mergedStudents);
      setTeachers(mergedTeachers);
      setPayments(mergedPayments);
      setCashFlow(mergedCashFlow);
      setSquads(mergedSquads);
      setUsers(mergedUsers);

      // Guardar de vuelta a la nube los datos fusionados (Paz y Salvo mutuo)
      const allDataMerged = {
        students: mergedStudents,
        teachers: mergedTeachers,
        payments: mergedPayments,
        cashFlow: mergedCashFlow,
        squads: mergedSquads,
        users: mergedUsers,
        lastSync: Date.now()
      };
      await saveDriveData(allDataMerged);
      
      setSyncStatus('UPDATED');
      setTimeout(() => setSyncStatus('IDLE'), 3000);
    } catch (error) {
      console.error("Error en sincronización:", error);
      setSyncStatus('ERROR');
    }
  }, [schoolSettings.googleDriveLinked, students, teachers, payments, cashFlow, squads, users]);

  // Ejecutar sync al iniciar sesión
  useEffect(() => {
    if (currentUser) {
      performIncrementalSync();
    }
  }, [currentUser]);

  // Guardado local persistente con marcas de tiempo automáticas
  useEffect(() => { localStorage.setItem('schoolSettings', JSON.stringify(schoolSettings)); }, [schoolSettings]);
  useEffect(() => { localStorage.setItem('students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('payments', JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem('cashFlow', JSON.stringify(cashFlow)); }, [cashFlow]);
  useEffect(() => { localStorage.setItem('squads', JSON.stringify(squads)); }, [squads]);
  useEffect(() => { localStorage.setItem('users', JSON.stringify(users)); }, [users]);

  const handlePushToCloud = async () => {
    setIsSyncing(true);
    setSyncStatus('SYNCING');
    const allData = { schoolSettings, students, teachers, payments, cashFlow, squads, users, timestamp: Date.now() };
    await saveDriveData(allData);
    setSchoolSettings({ ...schoolSettings, lastCloudSync: new Date().toISOString() });
    setIsSyncing(false);
    setSyncStatus('UPDATED');
    setTimeout(() => setSyncStatus('IDLE'), 3000);
    return true;
  };

  const wrapUpdate = (setter: any) => (val: any) => {
    // Si val es una función (como en setStudents(prev => [...prev, new])), la ejecutamos primero
    setter((prev: any) => {
      const next = typeof val === 'function' ? val(prev) : val;
      // Si es un array de objetos, nos aseguramos que los nuevos tengan updatedAt
      if (Array.isArray(next)) {
        return next.map(item => ({
          ...item,
          updatedAt: item.updatedAt || Date.now()
        }));
      }
      return next;
    });
  };

  const renderView = () => {
    const commonProps = { schoolSettings, students, teachers, payments, cashFlow, squads, users };
    switch (currentView) {
      case 'DASHBOARD': return <Dashboard {...commonProps} />;
      case 'STUDENTS': return <StudentManager students={students} setStudents={wrapUpdate(setStudents)} payments={payments} setPayments={wrapUpdate(setPayments)} schoolSettings={schoolSettings} />;
      case 'TEACHERS': return <TeacherManager teachers={teachers} setTeachers={wrapUpdate(setTeachers)} payments={payments} setPayments={wrapUpdate(setPayments)} schoolSettings={schoolSettings} />;
      case 'FINANCE': return <FinanceManager cashFlow={cashFlow} setCashFlow={wrapUpdate(setCashFlow)} />;
      case 'MATCHES': return <MatchManager squads={squads} setSquads={wrapUpdate(setSquads)} students={students} schoolSettings={schoolSettings} />;
      case 'TRAINING': return <TrainingManager />;
      case 'REPORTS': return <ReportManager students={students} teachers={teachers} payments={payments} cashFlow={cashFlow} />;
      case 'USERS':
        return (
          <UserSettings 
            users={users} 
            setUsers={wrapUpdate(setUsers)} 
            currentUser={currentUser} 
            schoolSettings={schoolSettings} 
            setSchoolSettings={setSchoolSettings}
            allData={commonProps}
            onImportData={(data) => {
               if (data.students) setStudents(data.students);
               if (data.teachers) setTeachers(data.teachers);
               if (data.payments) setPayments(data.payments);
               if (data.cashFlow) setCashFlow(data.cashFlow);
               if (data.squads) setSquads(data.squads);
            }}
          />
        );
      default: return <Dashboard {...commonProps} />;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
          <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-6 text-slate-800 uppercase tracking-tighter">{schoolSettings.name}</h1>
          <button 
            onClick={() => setCurrentUser(users[0])}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden">
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <Trophy className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold truncate">{schoolSettings.name}</h1>
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
            <div className="mb-4 px-2 py-1 bg-slate-800/50 rounded-lg flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Version</span>
              <span className="text-[10px] font-bold text-blue-400">v{APP_VERSION}</span>
            </div>
            <button 
              onClick={() => setCurrentUser(null)}
              className="w-full flex items-center gap-2 text-slate-500 hover:text-red-400 text-xs transition font-bold"
            >
              <LogOut className="w-4 h-4" /> CERRAR SESIÓN
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600">
              <Menu />
            </button>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
              {NAV_ITEMS.find(i => i.id === currentView)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
             {schoolSettings.googleDriveLinked && (
               <div className="flex items-center gap-2">
                 {syncStatus === 'SYNCING' && (
                   <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                     <RefreshCw className="w-3 h-3 animate-spin" /> SINCRONIZANDO...
                   </div>
                 )}
                 {syncStatus === 'UPDATED' && (
                   <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 animate-in fade-in zoom-in duration-300">
                     <CheckCircle2 className="w-3 h-3" /> TODO ACTUALIZADO
                   </div>
                 )}
                 {syncStatus === 'ERROR' && (
                   <button onClick={performIncrementalSync} className="flex items-center gap-2 text-red-600 font-bold text-[10px] bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                     <AlertCircle className="w-3 h-3" /> REINTENTAR SYNC
                   </button>
                 )}
                 {syncStatus === 'IDLE' && (
                    <button onClick={performIncrementalSync} className="text-slate-400 hover:text-blue-600 transition">
                      <CloudCheck className="w-5 h-5" />
                    </button>
                 )}
               </div>
             )}
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
