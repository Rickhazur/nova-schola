
import React, { useState } from 'react';
import { User, Bell, Lock, Shield, Moon, Volume2, Save, LogOut, Smartphone, Mail, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { updateUserProfile, updateUserPassword } from '../services/supabase';

interface SettingsProps {
  userId: string;
  userName: string;
  userRole: string;
  onUpdateUser: (name: string) => void;
  onLogout: () => void;
}

const AVATARS = ["👤", "👩‍🚀", "🦖", "🦊", "🤖", "🦁", "🦄", "⚡", "🎓", "🧠"];

const Settings: React.FC<SettingsProps> = ({ userId, userName, userRole, onUpdateUser, onLogout }) => {
  const [name, setName] = useState(userName);
  const [selectedAvatar, setSelectedAvatar] = useState("👤");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sound, setSound] = useState(true);
  
  // Password Change State
  const [newPass, setNewPass] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  const handleSave = async () => {
      setIsSaving(true);
      setMessage(null);
      try {
          // 1. Update Profile Data
          await updateUserProfile(userId, { name, avatar: selectedAvatar });
          onUpdateUser(name);

          // 2. Update Password if provided
          if (newPass) {
              if (newPass.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");
              await updateUserPassword(newPass);
          }

          setMessage({ type: 'success', text: "Perfil actualizado correctamente." });
          setNewPass('');
      } catch (e: any) {
          setMessage({ type: 'error', text: e.message || "Error al guardar cambios." });
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-stone-200 pb-6">
            <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                {selectedAvatar}
            </div>
            <div>
                <h2 className="text-3xl font-bold text-stone-800">Configuración</h2>
                <p className="text-stone-500">Gestiona tu identidad y preferencias en Nova Schola.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Navigation (Visual Only for MVP) */}
            <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center gap-3">
                    <User className="w-5 h-5" /> Mi Perfil
                </button>
                <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-stone-50 text-stone-600 font-medium flex items-center gap-3 transition-colors">
                    <Bell className="w-5 h-5" /> Notificaciones
                </button>
                <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-stone-50 text-stone-600 font-medium flex items-center gap-3 transition-colors">
                    <Shield className="w-5 h-5" /> Seguridad
                </button>
            </div>

            {/* Right Column: Forms */}
            <div className="md:col-span-2 space-y-8">
                
                {/* PUBLIC PROFILE */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                    <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-500" /> Información Pública
                    </h3>
                    
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Nombre para mostrar</label>
                            <input 
                               type="text" 
                               value={name}
                               onChange={(e) => setName(e.target.value)}
                               className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-700 font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase mb-3">Avatar</label>
                            <div className="flex flex-wrap gap-3">
                                {AVATARS.map(emoji => (
                                    <button
                                       key={emoji}
                                       onClick={() => setSelectedAvatar(emoji)}
                                       className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all border-2 ${
                                           selectedAvatar === emoji 
                                           ? 'bg-indigo-50 border-indigo-500 scale-110' 
                                           : 'bg-white border-stone-100 hover:border-stone-300'
                                       }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* PREFERENCES */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                    <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-teal-500" /> Preferencias
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 hover:bg-stone-50 rounded-xl transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Smartphone className="w-5 h-5" /></div>
                                <div>
                                    <p className="font-bold text-stone-700 text-sm">Notificaciones WhatsApp</p>
                                    <p className="text-xs text-stone-400">Recibir reporte diario de progreso.</p>
                                </div>
                            </div>
                            <div 
                                onClick={() => setNotifications(!notifications)}
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${notifications ? 'bg-green-500' : 'bg-stone-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notifications ? 'translate-x-6' : ''}`}></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 hover:bg-stone-50 rounded-xl transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Moon className="w-5 h-5" /></div>
                                <div>
                                    <p className="font-bold text-stone-700 text-sm">Modo Oscuro</p>
                                    <p className="text-xs text-stone-400">Interfaz de alto contraste (Beta).</p>
                                </div>
                            </div>
                            <div 
                                onClick={() => setDarkMode(!darkMode)}
                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-stone-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${darkMode ? 'translate-x-6' : ''}`}></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECURITY */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                    <h3 className="text-lg font-bold text-stone-800 mb-6 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-rose-500" /> Seguridad
                    </h3>
                    
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-2">Cambiar Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                            <input 
                               type="password" 
                               value={newPass}
                               onChange={(e) => setNewPass(e.target.value)}
                               placeholder="Nueva contraseña (dejar vacío para mantener)"
                               className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-stone-700 font-medium placeholder-stone-400"
                            />
                        </div>
                        <p className="text-[10px] text-stone-400 mt-2 ml-1 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Solo el usuario principal puede realizar cambios críticos.
                        </p>
                    </div>
                </section>

                {/* ACTIONS */}
                <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                    <button 
                       onClick={onLogout}
                       className="px-6 py-3 rounded-xl text-rose-600 font-bold hover:bg-rose-50 transition-colors flex items-center gap-2"
                    >
                        <LogOut className="w-5 h-5" /> Cerrar Sesión
                    </button>

                    <button 
                       onClick={handleSave}
                       disabled={isSaving}
                       className="px-8 py-3 rounded-xl bg-stone-900 text-white font-bold hover:bg-stone-800 transition-all shadow-lg flex items-center gap-2 disabled:opacity-70"
                    >
                        {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Guardar Cambios
                    </button>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
                        message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        <span className="font-bold text-sm">{message.text}</span>
                    </div>
                )}

            </div>
        </div>
    </div>
  );
};

export default Settings;
