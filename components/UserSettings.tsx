
import React, { useRef } from 'react';
import { User, SchoolSettings } from '../types';
import { 
  Shield, 
  UserPlus, 
  Trash2, 
  Key, 
  Building2, 
  Camera, 
  X, 
  Check, 
  Users, 
  Database, 
  CloudDownload, 
  CloudUpload,
  AlertCircle,
  Chrome,
  History,
  Lock,
  Server,
  Share2
} from 'lucide-react';

interface Props {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User | null;
  schoolSettings: SchoolSettings;
  setSchoolSettings: React.Dispatch<React.SetStateAction<SchoolSettings>>;
  allData: any; 
  onImportData: (data: any) => void;
}

const UserSettings: React.FC<Props> = ({ 
  users, 
  setUsers, 
  currentUser, 
  schoolSettings, 
  setSchoolSettings,
  allData,
  onImportData
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const dataInputRef = useRef<HTMLInputElement>(null);

  const handleAddUser = () => {
    const username = prompt("Nombre de usuario:");
    const role = prompt("Rol (ADMIN, COACH, SECRETARY):") as any;
    if (username && role) {
      setUsers([...users, { id: Date.now().toString(), username, role }]);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolSettings({ ...schoolSettings, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSetting = (field: keyof SchoolSettings, value: string) => {
    setSchoolSettings({ ...schoolSettings, [field]: value });
  };

  const handleToggleGoogleDrive = () => {
    if (!schoolSettings.googleDriveLinked) {
      if (confirm("Al vincular Google Drive, la app creará un archivo de respaldo automático para sincronizar con otros computadores. ¿Deseas continuar?")) {
        setSchoolSettings({ ...schoolSettings, googleDriveLinked: true, lastCloudSync: new Date().toISOString() });
      }
    } else {
      if (confirm("¿Desvincular Google Drive? Se detendrá la sincronización automática entre dispositivos.")) {
        setSchoolSettings({ ...schoolSettings, googleDriveLinked: false });
      }
    }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `Backup_Academia_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (confirm("¡ATENCIÓN! Al importar, se borrarán todos los datos actuales y se reemplazarán por los del archivo. ¿Continuar?")) {
            onImportData(json);
          }
        } catch (error) {
          alert("Error: El archivo no es un respaldo válido.");
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Informativo sobre Seguridad */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-blue-400 font-black text-xs uppercase tracking-widest mb-2">
              <Shield className="w-4 h-4" /> Centro de Seguridad y Datos
            </div>
            <h2 className="text-3xl font-black tracking-tighter">Soberanía de Información</h2>
            <p className="text-slate-400 text-sm max-w-md">Tus datos nunca salen de tu control. Gestiona cómo se comparten y respaldan entre tus dispositivos.</p>
          </div>
          <div className="flex gap-4">
             <button onClick={handleExportData} className="bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-3 rounded-2xl font-bold text-sm transition flex items-center gap-2">
                <Database className="w-5 h-5" /> Exportar Backup
             </button>
             <button onClick={() => dataInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-2xl font-bold text-sm transition flex items-center gap-2 shadow-xl shadow-blue-900/40">
                <CloudUpload className="w-5 h-5" /> Importar Backup
             </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Izquierdo: Configuración e Imagen */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-slate-800">
              <Building2 className="w-5 h-5 text-blue-600" /> Identidad Visual
            </h3>
            
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="w-40 h-40 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 overflow-hidden relative">
                  {schoolSettings.logo ? (
                    <img src={schoolSettings.logo} alt="School Logo" className="w-full h-full object-contain p-4" />
                  ) : (
                    <>
                      <Camera className="w-10 h-10 mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Logo Academia</span>
                    </>
                  )}
                  <button onClick={() => logoInputRef.current?.click()} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                    <Camera className="w-8 h-8" />
                  </button>
                </div>
                <input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">Nombre Oficial</label>
                <input type="text" value={schoolSettings.name} onChange={(e) => handleUpdateSetting('name', e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 ml-1">NIT / Registro Fiscal</label>
                <input type="text" value={schoolSettings.nit} onChange={(e) => handleUpdateSetting('nit', e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>

          {/* CLOUD SYNC CARD */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-0 opacity-40"></div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 relative z-10 text-slate-800">
              <Share2 className="w-5 h-5 text-blue-600" /> Sincronización Multi-Usuario
            </h3>
            <p className="text-[11px] text-slate-500 mb-6 relative z-10 leading-relaxed font-medium">
              Activa esta opción para compartir los datos con otros miembros de tu equipo usando una cuenta de Google compartida.
            </p>
            
            <button 
              onClick={handleToggleGoogleDrive}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition shadow-lg ${schoolSettings.googleDriveLinked ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-slate-900 text-white hover:bg-black'}`}
            >
              {schoolSettings.googleDriveLinked ? (
                <>DETENER SINCRONIZACIÓN</>
              ) : (
                <><Chrome className="w-4 h-4" /> VINCULAR GOOGLE DRIVE</>
              )}
            </button>

            {schoolSettings.googleDriveLinked && (
              <div className="mt-8 space-y-4 pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-black text-slate-400 uppercase tracking-widest">Estado Nube</span>
                  <span className="flex items-center gap-1.5 text-emerald-600 font-black"><Check className="w-3 h-3" /> ACTIVO</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-black text-slate-400 uppercase tracking-widest">Último Envío</span>
                  <span className="text-slate-700 font-black">{new Date(schoolSettings.lastCloudSync || '').toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lado Derecho: Usuarios e Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" /> Permisos de Acceso
                </h3>
                <p className="text-xs text-slate-500">Define quién puede entrar al sistema desde este computador.</p>
              </div>
              <button 
                onClick={handleAddUser} 
                className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition flex items-center gap-2 text-xs"
              >
                <UserPlus className="w-4 h-4" /> Nuevo Operador
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 font-black text-lg shadow-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{user.username}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-black uppercase text-blue-600 tracking-wider">Acceso {user.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button className="p-2 text-slate-400 hover:text-blue-600"><Key className="w-4 h-4" /></button>
                    {user.id !== '1' && (
                      <button onClick={() => setUsers(users.filter(u => u.id !== user.id))} className="p-2 text-slate-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-8">
              <Server className="w-6 h-6 text-blue-600" /> Información para Reportes e Impresión
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Dirección Física</label>
                <input type="text" value={schoolSettings.address} onChange={(e) => handleUpdateSetting('address', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Teléfono de Contacto</label>
                <input type="text" value={schoolSettings.phone} onChange={(e) => handleUpdateSetting('phone', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Correo Electrónico de Soporte</label>
                <input type="email" value={schoolSettings.email} onChange={(e) => handleUpdateSetting('email', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
              </div>
            </div>
            
            <div className="mt-10 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4">
               <AlertCircle className="w-6 h-6 text-blue-600 shrink-0" />
               <p className="text-[11px] text-blue-800 leading-relaxed">
                 <strong>Recordatorio de Privacidad:</strong> Toda la información ingresada en este sistema reside únicamente en este navegador y en tu Google Drive vinculado. No enviamos datos a servidores externos de terceros.
               </p>
            </div>
          </div>
        </div>
      </div>
      <input type="file" ref={dataInputRef} onChange={handleImportData} accept=".json" className="hidden" />
    </div>
  );
};

export default UserSettings;
