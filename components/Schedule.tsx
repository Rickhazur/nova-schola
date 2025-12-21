
import React, { useState, useEffect } from 'react';
import { Clock, Brain, Coffee, Atom, Calculator, Dna, CheckCircle2, AlertTriangle, ArrowRight, Zap, LayoutList } from 'lucide-react';
import { Subject } from '../types';

interface SmartTask {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'math' | 'physics' | 'science' | 'break' | 'wellness' | 'core' | 'eval';
  status: 'pending' | 'completed';
  origin: 'AI_GAP' | 'ROUTINE';
}

const INITIAL_FLOW: SmartTask[] = [
  { id: '1', title: 'Activación & Room Check', description: 'Ordena tu espacio para activar la plataforma.', duration: '15m', type: 'wellness', status: 'pending', origin: 'ROUTINE' },
  { id: '2', title: 'Sesión de Enfoque Profundo', description: 'Matemáticas: Funciones Avanzadas.', duration: '60m', type: 'math', status: 'pending', origin: 'ROUTINE' },
  { id: '3', title: 'Pausa Cognitiva', description: 'Descanso sin pantallas.', duration: '15m', type: 'break', status: 'pending', origin: 'ROUTINE' },
  { id: '4', title: 'Bloque de Ciencias', description: 'Biología o Física (Rotativo).', duration: '60m', type: 'science', status: 'pending', origin: 'ROUTINE' },
];

interface ScheduleProps {
    remedialSubject?: Subject;
}

const Schedule: React.FC<ScheduleProps> = ({ remedialSubject }) => {
  const [tasks, setTasks] = useState<SmartTask[]>(INITIAL_FLOW);

  useEffect(() => {
      if (remedialSubject && remedialSubject.tracks.length > 0) {
          const remedialClasses = remedialSubject.tracks[0].modules[0].classes;
          if (remedialClasses.length > 0) {
              const newRoutine: SmartTask[] = [
                  { id: '1', title: 'Activación & Room Check', description: 'Ordena tu espacio.', duration: '15m', type: 'wellness', status: 'pending', origin: 'ROUTINE' },
                  ...remedialClasses.map((c, i) => ({
                      id: `rem-${i}`,
                      title: `🔴 REFUERZO: ${c.title}`,
                      description: c.topic,
                      duration: c.duration,
                      type: 'math' as const,
                      status: 'pending' as const,
                      origin: 'AI_GAP' as const
                  })),
                  { id: '3', title: 'Pausa Cognitiva', description: 'Descanso.', duration: '15m', type: 'break', status: 'pending', origin: 'ROUTINE' },
              ];
              setTasks(newRoutine);
          }
      }
  }, [remedialSubject]);

  const toggleTask = (id: string) => {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t));
  };

  const getTheme = (type: string) => {
    switch (type) {
      case 'math': return { bg: 'bg-indigo-50', icon: <Calculator className="w-5 h-5 text-indigo-600" />, accent: 'bg-indigo-500' };
      case 'physics': return { bg: 'bg-violet-50', icon: <Atom className="w-5 h-5 text-violet-600" />, accent: 'bg-violet-500' };
      case 'wellness': return { bg: 'bg-teal-50', icon: <Zap className="w-5 h-5 text-teal-600" />, accent: 'bg-teal-500' };
      case 'break': return { bg: 'bg-amber-50', icon: <Coffee className="w-5 h-5 text-amber-600" />, accent: 'bg-amber-400' };
      default: return { bg: 'bg-slate-50', icon: <Clock className="w-5 h-5 text-slate-400" />, accent: 'bg-slate-400' };
    }
  };

  const progress = Math.round(((tasks.length - tasks.filter(t => t.status === 'pending').length) / tasks.length) * 100);

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-4xl mx-auto">
      <header className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
         <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
               <div className="flex items-center gap-2 text-teal-600 font-bold uppercase tracking-wide text-xs mb-2">
                   <LayoutList className="w-4 h-4" /> Smart Workflow
               </div>
               <h2 className="text-3xl font-bold text-stone-800">Ruta de Aprendizaje</h2>
               <p className="text-stone-500 mt-1">Misiones de hoy adaptadas por tu Tutor IA.</p>
            </div>
            <div className="text-right">
                <span className="text-4xl font-bold text-stone-800">{progress}%</span>
                <div className="w-32 h-2 bg-stone-100 rounded-full mt-1"><div className="h-full bg-teal-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div></div>
            </div>
         </div>
      </header>

      <div className="relative border-l-2 border-stone-200 ml-6 space-y-8 py-4">
         {tasks.map((task) => {
             const theme = getTheme(task.type);
             const isCompleted = task.status === 'completed';
             return (
                 <div key={task.id} className={`relative pl-8 transition-all duration-500 ${isCompleted ? 'opacity-50 grayscale' : ''}`}>
                     <button onClick={() => toggleTask(task.id)} className={`absolute -left-[9px] top-6 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 ${isCompleted ? 'bg-stone-400' : theme.accent}`}></button>
                     <div className="p-6 rounded-2xl border bg-white border-stone-200 shadow-sm hover:border-teal-200 transition-all">
                         <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                 <div className={`p-2.5 rounded-xl ${theme.bg}`}>{theme.icon}</div>
                                 <div>
                                     <h3 className={`font-bold text-lg ${isCompleted ? 'line-through text-stone-400' : 'text-stone-800'}`}>{task.title}</h3>
                                     <p className="text-xs text-stone-400">{task.duration} • {task.origin === 'AI_GAP' ? 'Prioridad Alta' : 'Rutina'}</p>
                                 </div>
                             </div>
                         </div>
                         <p className="text-sm text-stone-500 mt-3">{task.description}</p>
                     </div>
                 </div>
             );
         })}
      </div>
    </div>
  );
};

export default Schedule;
