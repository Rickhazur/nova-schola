
import React from 'react';
import { LayoutDashboard, Calendar, BookOpen, Bot, BarChart3, GraduationCap, UserCheck, HeartHandshake, CircleHelp, Users, Trophy, Brain, Map, Layers, Compass, ShoppingBag, LogOut, Settings as SettingsIcon, EyeOff, Receipt, FolderOpen, WifiOff, Zap, Cloud, Activity, Globe } from 'lucide-react';
import { ViewState, Language } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onStartTour?: () => void;
  onLogout?: () => void;
  userName?: string;
  userRole?: string;
  isSimulationMode?: boolean;
  onExitSimulation?: () => void;
  restrictedMode?: boolean; 
  studentMenuConfig?: string[]; 
  isMock?: boolean; 
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  onStartTour, 
  onLogout, 
  userName = "Usuario", 
  userRole,
  isSimulationMode = false,
  onExitSimulation,
  restrictedMode = false,
  studentMenuConfig,
  isMock = false,
  language,
  setLanguage
}) => {
  
  const t = {
    es: {
        dashboard: 'Nuestra Esencia',
        curriculum: 'Tutoría Inteligente',
        repository: 'Mi Repositorio',
        career: 'Career Pathfinder',
        flashcards: 'AI Flashcards',
        social: 'Arena & Ranking',
        rewards: 'Tienda Nova',
        progress: userRole === 'ADMIN' ? 'Panel de Control' : 'Progreso Estudiante',
        consultant: 'Asistente 24/7',
        metrics: 'Resultados',
        pricing: 'Planes y Precios',
        settings: 'Configuración',
        tour: 'Tour de Ayuda',
        logout: 'Cerrar Sesión',
        exitSim: 'Salir Vista',
        connection: 'CONEXIÓN ACTIVA',
        remedial: 'Nivelación Activa'
    },
    en: {
        dashboard: 'Our Essence',
        curriculum: 'Smart Tutoring',
        repository: 'My Repository',
        career: 'Career Pathfinder',
        flashcards: 'AI Flashcards',
        social: 'Arena & Ranking',
        rewards: 'Nova Store',
        progress: userRole === 'ADMIN' ? 'Control Panel' : 'Student Progress',
        consultant: '24/7 Assistant',
        metrics: 'Results',
        pricing: 'Plans & Pricing',
        settings: 'Settings',
        tour: 'Help Tour',
        logout: 'Logout',
        exitSim: 'Exit View',
        connection: 'CONNECTION ACTIVE',
        remedial: 'Remedial Active'
    }
  };

  const labels = t[language];

  const allNavItems = [
    { id: ViewState.DASHBOARD, label: labels.dashboard, icon: HeartHandshake },
    { id: ViewState.CURRICULUM, label: labels.curriculum, icon: BookOpen },
    { id: ViewState.REPOSITORY, label: labels.repository, icon: FolderOpen },
    { id: ViewState.CAREER, label: labels.career, icon: Compass },
    { id: ViewState.FLASHCARDS, label: labels.flashcards, icon: Layers }, 
    { id: ViewState.SOCIAL, label: labels.social, icon: Trophy }, 
    { id: ViewState.REWARDS, label: labels.rewards, icon: ShoppingBag },
    { id: ViewState.PROGRESS, label: labels.progress, icon: UserCheck },
    { id: ViewState.AI_CONSULTANT, label: labels.consultant, icon: Bot },
    { id: ViewState.METRICS, label: labels.metrics, icon: BarChart3 },
  ];

  let navItems = allNavItems;

  if (restrictedMode) {
     navItems = allNavItems.filter(item => 
        item.id === ViewState.CURRICULUM || 
        item.id === ViewState.REPOSITORY || 
        item.id === ViewState.REWARDS ||
        item.id === ViewState.PROGRESS
      );
  } else if (userRole === 'STUDENT' && studentMenuConfig && studentMenuConfig.length > 0) {
      navItems = allNavItems.filter(item => studentMenuConfig.includes(item.id));
  }

  const handleHomeClick = () => {
      if (restrictedMode) return;
      if (userRole === 'ADMIN') {
          onViewChange(ViewState.PROGRESS);
      } else {
          onViewChange(ViewState.DASHBOARD);
      }
  };

  return (
    <aside className="w-64 bg-white border-r border-stone-200 h-screen fixed left-0 top-0 flex flex-col z-10 hidden md:flex font-sans">
      <div 
        className={`p-6 flex items-center space-x-3 border-b border-stone-100 ${restrictedMode ? 'cursor-default' : 'cursor-pointer hover:bg-stone-50'} transition-colors shrink-0`}
        onClick={handleHomeClick}
        title={restrictedMode ? labels.remedial : "Nova Schola"}
      >
        <div className={`p-2 rounded-xl shadow-lg ${restrictedMode ? 'bg-rose-600 shadow-rose-200' : 'bg-teal-600 shadow-teal-200'}`}>
          <Brain className="text-white w-7 h-7" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-stone-800 leading-tight">Nova Schola<br/>
            <span className={`text-[10px] uppercase tracking-wider font-extrabold ${restrictedMode ? 'text-rose-600' : 'text-teal-600'}`}>
                {restrictedMode ? labels.remedial : 'Elite AI Tutoring'}
            </span>
          </h1>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-stone-50 bg-stone-50/30 shrink-0">
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-[10px] font-bold text-center flex items-center justify-center gap-2 shadow-sm uppercase tracking-wide">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <Cloud className="w-3 h-3" />
            {labels.connection}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group mb-1 ${
                isActive
                  ? 'bg-teal-50 text-teal-700 font-semibold shadow-sm ring-1 ring-teal-100'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-teal-600' : 'text-stone-400 group-hover:text-stone-600'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
        
        <div className="my-2 border-t border-stone-100"></div>
        
        {(userRole === 'ADMIN' || (studentMenuConfig?.includes(ViewState.PRICING))) && (
            <button
            onClick={() => onViewChange(ViewState.PRICING)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group mb-1 ${
                currentView === ViewState.PRICING
                ? 'bg-stone-100 text-stone-800 font-semibold'
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
            }`}
            >
            <Receipt className={`w-5 h-5 transition-colors ${currentView === ViewState.PRICING ? 'text-stone-800' : 'text-stone-400 group-hover:text-stone-600'}`} />
            <span>{labels.pricing}</span>
            </button>
        )}

        <button
          onClick={() => onViewChange(ViewState.SETTINGS)}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group mb-1 ${
            currentView === ViewState.SETTINGS
              ? 'bg-stone-100 text-stone-800 font-semibold'
              : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
          }`}
        >
          <SettingsIcon className={`w-5 h-5 transition-colors ${currentView === ViewState.SETTINGS ? 'text-stone-800' : 'text-stone-400 group-hover:text-stone-600'}`} />
          <span>{labels.settings}</span>
        </button>

      </nav>

      <div className="p-4 border-t border-stone-100 space-y-3 bg-stone-50/50 shrink-0">
        {/* Language Toggle */}
        <div className="flex bg-white rounded-lg border border-stone-200 p-1">
            <button 
                onClick={() => setLanguage('es')}
                className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-bold py-1.5 rounded-md transition-colors ${language === 'es' ? 'bg-indigo-50 text-indigo-700' : 'text-stone-400 hover:text-stone-600'}`}
            >
                ES
            </button>
            <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-bold py-1.5 rounded-md transition-colors ${language === 'en' ? 'bg-indigo-50 text-indigo-700' : 'text-stone-400 hover:text-stone-600'}`}
            >
                EN
            </button>
        </div>

        {!restrictedMode && (
            <button 
            onClick={onStartTour}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all group shadow-sm text-sm font-medium"
            >
                <CircleHelp className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span>{labels.tour}</span>
            </button>
        )}

        <button 
           onClick={isSimulationMode && onExitSimulation ? onExitSimulation : onLogout}
           className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group font-bold shadow-sm mb-2 ${
               isSimulationMode 
               ? 'text-orange-600 bg-orange-50 border border-orange-200 hover:bg-orange-100' 
               : 'text-rose-600 bg-white border border-transparent hover:bg-rose-50 hover:border-rose-200'
           }`}
        >
            {isSimulationMode ? <EyeOff className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
            <span>{isSimulationMode ? labels.exitSim : labels.logout}</span>
        </button>

        <div className={`p-3 rounded-xl border shadow-sm flex items-center gap-3 opacity-90 ${isSimulationMode ? 'bg-orange-50 border-orange-200' : 'bg-white border-stone-200'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isSimulationMode ? 'bg-orange-100 border-orange-200' : 'bg-stone-100 border-stone-200'}`}>
                <span className={`text-xs font-bold ${isSimulationMode ? 'text-orange-600' : 'text-stone-600'}`}>{(userName || "U").charAt(0)}</span>
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className={`text-xs font-bold truncate w-32 ${isSimulationMode ? 'text-orange-900' : 'text-stone-800'}`} title={userName}>{userName}</span>
                <span className={`text-[10px] uppercase tracking-wide ${isSimulationMode ? 'text-orange-500' : 'text-stone-400'}`}>
                    {userRole === 'ADMIN' ? 'Administrador' : 'Estudiante'}
                </span>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
