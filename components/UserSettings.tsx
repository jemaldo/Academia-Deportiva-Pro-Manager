
import React, { useRef } from 'react';
import { User, SchoolSettings } from '../types.ts';
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
      setUsers([...users, { id: Date.now().toString(), updatedAt: Date.now(), username, role }]);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSchoolSettings({ ...schoolSettings, logo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateSetting = (field: keyof SchoolSettings, value: string) => {
    setSchoolSettings({ ...schoolSettings, [field]: value });
  };

  const handleToggleGoogleDrive = () => {
    if (!schoolSettings.googleDriveLinked) {
      if (confirm("¿Vincular Google Drive para respaldos automáticos?")) {
        setSchoolSettings({ ...schoolSettings, googleDriveLinked: true, lastCloudSync: new Date().toISOString() });
      }
    } else {
      if (confirm("¿Desvincular Google Drive?")) {
        setSchoolSettings({ ...schoolSettings, googleDriveLinked: false });
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <h2 className="text-3xl font-black tracking-tighter relative z-10">Soberanía de Información</h2>
        <p className="text-slate-400 text-sm mt-2 relative z-10">Gestiona tus respaldos y la identidad visual de la academia.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-slate-800"><Building2 className="w-5 h-5 text-blue-600" /> Identidad</h3>
          <div className="flex flex-col items-center gap-4">
             <div className="w-40 h-40 rounded-3xl bg-slate-50 border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => logoInputRef.current?.click()}>
               {schoolSettings.logo ? <img src={schoolSettings.logo} className="w-full h-full object-contain p-4" /> : <Camera />}
             </div>
             <input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
          </div>
          <div className="mt-8 space-y-4">
             <input type="text" placeholder="Nombre Oficial" value={schoolSettings.name} onChange={(e) => handleUpdateSetting('name', e.target.value)} className="w-full border p-3 rounded-xl" />
             <input type="text" placeholder="NIT" value={schoolSettings.nit} onChange={(e) => handleUpdateSetting('nit', e.target.value)} className="w-full border p-3 rounded-xl" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
           <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-8"><Users className="w-6 h-6 text-blue-600" /> Operadores</h3>
           <div className="space-y-4">
             {users.map(u => (
               <div key={u.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center">
                 <span className="font-bold">{u.username} ({u.role})</span>
                 {u.id !== '1' && <button onClick={() => setUsers(users.filter(usr => usr.id !== u.id))} className="text-red-500"><Trash2 className="w-4 h-4" /></button>}
               </div>
             ))}
             <button onClick={handleAddUser} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">+ Nuevo Operador</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
