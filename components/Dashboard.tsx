
import React from 'react';
import { SCHOOL_VALUES, ViewState, Language } from '../types';
import { Target, Users, Zap, Heart, Sparkles, Compass, Lightbulb, Shield, Calculator, ArrowRight, AlertTriangle, Brain } from 'lucide-react';

interface DashboardProps {
  onNavigate?: (view: ViewState) => void;
  onStartTour?: () => void;
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onStartTour, language }) => {
  const t = {
    es: {
      heroTitle: "Nova Schola",
      heroSubtitle: "Elite AI Tutoring",
      heroBadge: "Plataforma de Aprendizaje IA",
      heroDesc: "Transformamos el estudio en casa. Tu hijo tendrá un Tutor Privado con Inteligencia Artificial disponible 24/7, diseñado para garantizar el dominio académico y la disciplina personal.",
      btnStart: "Iniciar Tutoría",
      btnDemo: "Ver Demo Tour",
      statsCurriculum: "Expertos Currículo IB",
      statsLogic: "Lógica GPT-4o",
      statsMastery: "Meta 90% Dominio",
      diagnosticTitle: "Diagnóstico de Nivelación",
      diagnosticRequired: "Requerido",
      diagnosticDesc: "Antes de iniciar tus tutorías, necesitamos calibrar el nivel de tu IA. Realiza este test rápido de Matemáticas y Física para que Nova Schola cree tu Plan de Refuerzo Personalizado.",
      btnDiagnostic: "Calibrar mi Tutor",
      methodTitle: "Método Nova",
      methodDesc: "No somos un colegio tradicional. Somos un acelerador de aprendizaje. Utilizamos IA adaptativa para detectar vacíos de conocimiento y llenarlos en tiempo récord, mientras un mentor virtual garantiza la disciplina.",
      resultsTitle: "Resultados Garantizados",
      resultsDesc: "Nuestros estudiantes no solo mejoran sus calificaciones; desarrollan autonomía. Con reportes diarios a padres y control anti-distracciones, garantizamos que el tiempo frente a la pantalla sea 100% productivo.",
      adnTitle: "ADN Nova Schola",
      valAutonomy: { title: "Autonomía", desc: "El estudiante es el piloto." },
      valWellness: { title: "Bienestar", desc: "Salud mental y balance." },
      valMastery: { title: "Maestría", desc: "No avanzamos sin dominar." },
      valImpact: { title: "Impacto", desc: "Aprender para crear valor." }
    },
    en: {
      heroTitle: "Nova Schola",
      heroSubtitle: "Elite AI Tutoring",
      heroBadge: "AI Learning Platform",
      heroDesc: "We transform home study. Your child will have a Private AI Tutor available 24/7, designed to guarantee academic mastery and personal discipline.",
      btnStart: "Start Tutoring",
      btnDemo: "Watch Demo Tour",
      statsCurriculum: "IB Curriculum Experts",
      statsLogic: "GPT-4o Logic",
      statsMastery: "90% Mastery Goal",
      diagnosticTitle: "Placement Diagnostic",
      diagnosticRequired: "Required",
      diagnosticDesc: "Before starting your tutoring, we need to calibrate your AI's level. Take this quick Math and Physics test so Nova Schola can create your Personalized Reinforcement Plan.",
      btnDiagnostic: "Calibrate My Tutor",
      methodTitle: "Nova Method",
      methodDesc: "We are not a traditional school. We are a learning accelerator. We use adaptive AI to detect knowledge gaps and fill them in record time, while a virtual mentor ensures discipline.",
      resultsTitle: "Guaranteed Results",
      resultsDesc: "Our students don't just improve their grades; they develop autonomy. With daily reports to parents and anti-distraction control, we guarantee screen time is 100% productive.",
      adnTitle: "Nova Schola DNA",
      valAutonomy: { title: "Autonomy", desc: "The student is the pilot." },
      valWellness: { title: "Wellness", desc: "Mental health and balance." },
      valMastery: { title: "Mastery", desc: "We don't move on without mastery." },
      valImpact: { title: "Impact", desc: "Learn to create value." }
    }
  };

  const text = t[language];

  return (
    <div className="space-y-10 animate-fade-in font-sans">
      {/* Hero Header */}
      <header className="relative rounded-3xl p-8 md:p-16 text-white overflow-hidden shadow-2xl shadow-black/40 min-h-[500px] flex flex-col justify-center group border border-white/5">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
            alt="Futuristic Digital Network and Education"
            className="w-full h-full object-cover transition-transform duration-[20s] ease-in-out group-hover:scale-110 opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-[#050505]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-3xl pl-4 border-l-4 border-cyan-500">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 backdrop-blur-md border border-cyan-500/20 text-xs font-bold text-cyan-400 mb-6 uppercase tracking-widest animate-fade-in">
            <Sparkles className="w-3 h-3" />
            <span>{text.heroBadge}</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black mb-6 leading-[0.9] tracking-tighter drop-shadow-lg text-white">
            {text.heroTitle}<br />
            <span className="text-3xl md:text-5xl font-light text-cyan-200">{text.heroSubtitle}</span>
          </h2>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl font-light mb-10 leading-relaxed text-shadow-sm pl-2">
            {text.heroDesc}
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate && onNavigate(ViewState.CURRICULUM)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-cyan-600/30 flex items-center gap-2 hover:translate-y-[-2px]"
            >
              {text.btnStart} <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={onStartTour}
              className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-2xl font-medium transition-all hover:border-white/30"
            >
              {text.btnDemo}
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-16 flex flex-wrap items-center gap-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-500" /> {text.statsCurriculum}
            </div>
            <div className="w-1 h-1 bg-cyan-800 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-500" /> {text.statsLogic}
            </div>
            <div className="w-1 h-1 bg-cyan-800 rounded-full"></div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-500" /> {text.statsMastery}
            </div>
          </div>
        </div>
      </header>

      {/* --- DIAGNOSTIC CTA --- */}
      <section className="bg-gradient-to-r from-indigo-900 to-violet-900 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white border border-indigo-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex gap-5">
            <div className="bg-indigo-950/50 p-4 rounded-2xl backdrop-blur-sm border border-indigo-500/20 shadow-inner">
              <Calculator className="w-10 h-10 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {text.diagnosticRequired}
                </span>
                <h3 className="text-xl font-bold text-white">{text.diagnosticTitle}</h3>
              </div>
              <p className="text-indigo-200 max-w-xl text-sm leading-relaxed">
                {text.diagnosticDesc}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate && onNavigate(ViewState.DIAGNOSTIC)}
            className="group whitespace-nowrap bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2"
          >
            {text.btnDiagnostic}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Mission & Vision Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0E0E10] p-8 rounded-3xl shadow-lg border border-white/5 flex flex-col justify-center relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <Compass className="w-10 h-10 text-orange-500 mb-4 relative z-10" />
          <h3 className="text-xl font-bold text-white mb-3 relative z-10">{text.methodTitle}</h3>
          <p className="text-slate-400 leading-relaxed relative z-10">
            {text.methodDesc}
          </p>
        </div>

        <div className="bg-[#0E0E10] p-8 rounded-3xl shadow-lg border border-white/5 flex flex-col justify-center relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <Lightbulb className="w-10 h-10 text-cyan-500 mb-4 relative z-10" />
          <h3 className="text-xl font-bold text-white mb-3 relative z-10">{text.resultsTitle}</h3>
          <p className="text-slate-400 leading-relaxed relative z-10">
            {text.resultsDesc}
          </p>
        </div>
      </div>

      {/* Values Section */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-2xl font-bold text-white">{text.adnTitle}</h3>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ValueCard
            title={text.valAutonomy.title}
            desc={text.valAutonomy.desc}
            icon={<Target className="w-5 h-5 text-cyan-400" />}
            color="bg-cyan-950/30 border-cyan-500/20"
          />
          <ValueCard
            title={text.valWellness.title}
            desc={text.valWellness.desc}
            icon={<Heart className="w-5 h-5 text-rose-400" />}
            color="bg-rose-950/30 border-rose-500/20"
          />
          <ValueCard
            title={text.valMastery.title}
            desc={text.valMastery.desc}
            icon={<Zap className="w-5 h-5 text-amber-400" />}
            color="bg-amber-950/30 border-amber-500/20"
          />
          <ValueCard
            title={text.valImpact.title}
            desc={text.valImpact.desc}
            icon={<Users className="w-5 h-5 text-indigo-400" />}
            color="bg-indigo-950/30 border-indigo-500/20"
          />
        </div>
      </section>
    </div>
  );
};

const ValueCard: React.FC<{ title: string; desc: string; icon: React.ReactNode; color: string }> = ({ title, desc, icon, color }) => (
  <div className="bg-[#0E0E10] p-5 rounded-2xl shadow-sm border border-white/5 hover:border-white/10 transition-colors flex items-start gap-4">
    <div className={`p-3 rounded-xl ${color} border shrink-0`}>
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-white">{title}</h4>
      <p className="text-sm text-slate-500 leading-snug mt-1">{desc}</p>
    </div>
  </div>
);

export default Dashboard;
