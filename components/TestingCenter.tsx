
import React, { useState } from 'react';
import { Terminal, User, Shield, Coins, AlertTriangle, RefreshCw, X, Zap, Baby, GraduationCap, Database, CloudLightning } from 'lucide-react';
import { ViewState } from '../types';
import { checkSupabaseConnection } from '../services/supabase';

interface TestingCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulatePersona: (name: string, role: 'STUDENT' | 'ADMIN', level: 'KIDS' | 'TEEN') => void;
  onTriggerAction: (action: 'ROOM_CHECK' | 'ADD_COINS' | 'INFRACTION' | 'TOUR') => void;
}

const TestingCenter: React.FC<TestingCenterProps> = ({ isOpen, onClose, onSimulatePersona, onTriggerAction }) => {
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
      setConnectionStatus("Probando conexión...");
      const result = await checkSupabaseConnection();
      setConnectionStatus(result.message);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-mono animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-emerald-500/50 rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-emerald-500/30 flex justify-between items-center">
          <div className="flex items-center gap-3 text-emerald-400">
            <Terminal className="w-5 h-5" />
            <h2 className="font-bold tracking-widest uppercase">Nova Schola Dev Lab</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
          
          {/* Section: Cloud Diagnostic */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
              <CloudLightning className="w-4 h-4" /> Diagnóstico de Nube
            </h3>
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400 mb-3">
                    Verifica si la aplicación está conectada correctamente a tu base de datos de Supabase.
                </p>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleTestConnection}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2"
                    >
                        <Database className="w-3 h-3" /> Probar Conexión
                    </button>
                    {connectionStatus && (
                        <span className={`text-xs font-bold ${connectionStatus.includes('Exitosa') ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {connectionStatus}
                        </span>
                    )}
                </div>
            </div>
          </div>

          {/* Section 1: Personas */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
              <User className="w-4 h-4" /> Simulate Persona (Hot-Swap)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button 
                onClick={() => onSimulatePersona('Sami', 'STUDENT', 'TEEN')}
                className="bg-slate-800 hover:bg-indigo-900/50 border border-slate-700 hover:border-indigo-500 p-3 rounded-lg text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
                  <GraduationCap className="w-4 h-4" /> Sami (Teen)
                </div>
                <p className="text-[10px] text-slate-400">Grado 10, IB Track, Focus: Math/Physics.</p>
              </button>

              <button 
                onClick={() => onSimulatePersona('Leo', 'STUDENT', 'KIDS')}
                className="bg-slate-800 hover:bg-yellow-900/50 border border-slate-700 hover:border-yellow-500 p-3 rounded-lg text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-yellow-400 font-bold mb-1">
                  <Baby className="w-4 h-4" /> Leo (Kid)
                </div>
                <p className="text-[10px] text-slate-400">Primaria, Gamified UI, Focus: Discovery.</p>
              </button>

              <button 
                onClick={() => onSimulatePersona('Director Rick', 'ADMIN', 'TEEN')}
                className="bg-slate-800 hover:bg-emerald-900/50 border border-slate-700 hover:border-emerald-500 p-3 rounded-lg text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                  <Shield className="w-4 h-4" /> Admin
                </div>
                <p className="text-[10px] text-slate-400">Full Access, Dashboard, User Management.</p>
              </button>
            </div>
          </div>

          {/* Section 2: Triggers */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" /> System Triggers
            </h3>
            <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => onTriggerAction('ROOM_CHECK')}
                 className="flex items-center justify-between px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-white/30 text-slate-300 hover:text-white transition-all"
               >
                 <span className="text-sm font-bold">Force Room Check</span>
                 <RefreshCw className="w-4 h-4 text-orange-400" />
               </button>

               <button 
                 onClick={() => onTriggerAction('ADD_COINS')}
                 className="flex items-center justify-between px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-white/30 text-slate-300 hover:text-white transition-all"
               >
                 <span className="text-sm font-bold">+1000 Coins</span>
                 <Coins className="w-4 h-4 text-yellow-400" />
               </button>

               <button 
                 onClick={() => onTriggerAction('INFRACTION')}
                 className="flex items-center justify-between px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-white/30 text-slate-300 hover:text-white transition-all"
               >
                 <span className="text-sm font-bold">Log Fake Infraction</span>
                 <AlertTriangle className="w-4 h-4 text-rose-400" />
               </button>

               <button 
                 onClick={() => onTriggerAction('TOUR')}
                 className="flex items-center justify-between px-4 py-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-white/30 text-slate-300 hover:text-white transition-all"
               >
                 <span className="text-sm font-bold">Restart Tour</span>
                 <RefreshCw className="w-4 h-4 text-cyan-400" />
               </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-500 font-mono">
            <p>Environment: <span className="text-emerald-500">Development</span></p>
            <p>Build: v2.5.0-alpha (AI-Powered)</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TestingCenter;
