
import React from 'react';
import { LayoutDashboard, Calendar, BookOpen, Bot, BarChart3, GraduationCap, UserCheck, HeartHandshake, CircleHelp, Users, Trophy, Brain, Map, Layers, Compass, ShoppingBag, LogOut, Settings as SettingsIcon, EyeOff, Receipt, FolderOpen, WifiOff, Zap, Cloud, Activity, Globe, PenTool } from 'lucide-react';
import { ViewState, Language, UserLevel } from '../types';

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
  userLevel?: UserLevel;
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
  setLanguage,
  userLevel = 'bachillerato'
}): React.ReactElement => {

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
      remedial: 'Nivelación Activa',
      whiteboard: 'Pizarra',
      teacherReport: 'Inteligencia Docente',
      payments: 'Pagos y Suscripciones'
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
      remedial: 'Remedial Active',
      whiteboard: 'Whiteboard',
      teacherReport: 'Teacher Intelligence',
      payments: 'Payments & Subscriptions'
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
    { id: ViewState.WHITEBOARD, label: labels.whiteboard, icon: PenTool },
  ];

  if (userRole === 'ADMIN') {
    allNavItems.push({ id: ViewState.TEACHER_REPORT, label: labels.teacherReport, icon: Brain });
  }

  // Payment is typically accessed via Pricing, but we can add direct link if needed.
  // We'll keep it under 'Pricing' or add if explicit request.
  // The user asked for "interface changes" and "receive reports". 

  let navItems = allNavItems;

  // PRIMARY SCHOOL THEME (Keep colorful but adapted for dark mode if needed, or keep distinct)
  const isPrimary = userLevel === 'primary';
  // Dark Theme Base: #0E0E10
  const sidebarBg = 'bg-[#0E0E10] border-white/5';

  // Hover & Active States
  const itemHover = 'hover:bg-white/5 hover:text-white';
  const itemActive = isPrimary
    ? 'bg-indigo-600/20 text-indigo-400 shadow-lg shadow-indigo-900/20 border border-indigo-500/30'
    : 'bg-cyan-950/30 text-cyan-400 font-bold shadow-lg shadow-cyan-900/10 border border-cyan-500/20';

  const iconActive = isPrimary ? 'text-indigo-400' : 'text-cyan-400';

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

  const handleHomeClick = (): void => {
    if (restrictedMode) return;
    if (userRole === 'ADMIN') {
      onViewChange(ViewState.PROGRESS);
    } else {
      onViewChange(ViewState.DASHBOARD);
    }
  };

  return (
    <aside className={`w-64 ${sidebarBg} border-r h-screen fixed left-0 top-0 flex flex-col z-10 hidden md:flex font-sans transition-colors duration-300`}>
      <div
        className={`p-6 flex items-center space-x-3 border-b border-white/5 ${restrictedMode ? 'cursor-default' : 'cursor-pointer hover:bg-white/5'} transition-colors shrink-0`}
        onClick={handleHomeClick}
        title={restrictedMode ? labels.remedial : "Nova Schola"}
      >
        <div className={`p-2 rounded-xl shadow-lg border border-white/10 ${restrictedMode ? 'bg-rose-950/50 shadow-rose-900/20' : 'bg-[#18181B] shadow-black/50'}`}>
          <Brain className={`${restrictedMode ? 'text-rose-500' : 'text-cyan-400'} w-7 h-7`} />
        </div>
        <div>
          <h1 className="font-black text-lg text-white leading-tight tracking-tight">NOVA SCHOLA<br />
            <span className={`text-[10px] uppercase tracking-widest font-bold ${restrictedMode ? 'text-rose-500' : 'text-cyan-600'}`}>
              {restrictedMode ? labels.remedial : 'Elite AI Tutoring'}
            </span>
          </h1>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-white/5 bg-black/20 shrink-0">
        <div className="p-2 bg-emerald-950/30 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-bold text-center flex items-center justify-center gap-2 shadow-sm uppercase tracking-wide">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <Cloud className="w-3 h-3" />
          {labels.connection}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group mb-1 ${isActive
                ? itemActive
                : `text-slate-500 ${itemHover}`
                }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${isActive ? iconActive : 'text-slate-600 group-hover:text-slate-400'}`} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}

        <div className="my-2 border-t border-white/5"></div>

        {(userRole === 'ADMIN' || (studentMenuConfig?.includes(ViewState.PRICING))) && (
          <button
            onClick={() => onViewChange(ViewState.PRICING)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group mb-1 ${currentView === ViewState.PRICING
              ? 'bg-white/10 text-white font-semibold'
              : 'text-slate-500 hover:bg-white/5 hover:text-white'
              }`}
          >
            <Receipt className={`w-5 h-5 transition-colors ${currentView === ViewState.PRICING ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}`} />
            <span className="text-sm font-medium">{labels.pricing}</span>
          </button>
        )}

        <button
          onClick={() => onViewChange(ViewState.SETTINGS)}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group mb-1 ${currentView === ViewState.SETTINGS
            ? 'bg-white/10 text-white font-semibold'
            : 'text-slate-500 hover:bg-white/5 hover:text-white'
            }`}
        >
          <SettingsIcon className={`w-5 h-5 transition-colors ${currentView === ViewState.SETTINGS ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}`} />
          <span className="text-sm font-medium">{labels.settings}</span>
        </button>

      </nav>

      <div className="p-4 border-t border-white/5 space-y-3 bg-black/20 shrink-0">
        {/* Language Toggle */}
        <div className="flex bg-[#18181B] rounded-lg border border-white/5 p-1">
          <button
            onClick={() => setLanguage('es')}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-bold py-1.5 rounded-md transition-colors ${language === 'es' ? 'bg-cyan-600 text-white shadow' : 'text-slate-600 hover:text-slate-400'}`}
          >
            ES
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 flex items-center justify-center gap-1 text-[10px] font-bold py-1.5 rounded-md transition-colors ${language === 'en' ? 'bg-cyan-600 text-white shadow' : 'text-slate-600 hover:text-slate-400'}`}
          >
            EN
          </button>
        </div>

        {!restrictedMode && (
          <button
            onClick={onStartTour}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#18181B] text-slate-400 border border-white/5 hover:bg-white/5 hover:text-white transition-all group shadow-sm text-sm font-medium"
          >
            <CircleHelp className="w-4 h-4 text-cyan-600 group-hover:text-cyan-400 transition-colors" />
            <span>{labels.tour}</span>
          </button>
        )}

        <button
          onClick={isSimulationMode && onExitSimulation ? onExitSimulation : onLogout}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group font-bold shadow-sm mb-2 ${isSimulationMode
            ? 'text-orange-400 bg-orange-950/20 border border-orange-500/20 hover:bg-orange-900/30'
            : 'text-rose-400 bg-rose-950/10 border border-rose-500/10 hover:bg-rose-900/20 hover:text-rose-300'
            }`}
        >
          {isSimulationMode ? <EyeOff className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
          <span className="text-xs tracking-wide uppercase">{isSimulationMode ? labels.exitSim : labels.logout}</span>
        </button>

        <div className={`p-3 rounded-xl border shadow-sm flex items-center gap-3 ${isSimulationMode ? 'bg-orange-950/10 border-orange-500/20' : 'bg-[#18181B] border-white/5'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${isSimulationMode ? 'bg-orange-900/40 border-orange-500/50 text-orange-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
            <span className="text-xs font-bold">{(userName || "U").charAt(0)}</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className={`text-xs font-bold truncate w-32 ${isSimulationMode ? 'text-orange-400' : 'text-white'}`} title={userName}>{userName}</span>
            <span className={`text-[10px] uppercase tracking-wide ${isSimulationMode ? 'text-orange-600' : 'text-slate-600'}`}>
              {userRole === 'ADMIN' ? 'Administrador' : 'Estudiante'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
