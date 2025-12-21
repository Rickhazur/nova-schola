
import React, { useState, useEffect } from 'react';
import { ViewState, Subject, Infraction, StoreItem, Language } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Curriculum from './components/Curriculum';
import AIConsultant from './components/AIConsultant';
import Metrics from './components/Metrics';
import Progress from './components/Progress';
import CareerPath from './components/CareerPath';
import Flashcards from './components/Flashcards';
import SocialHub from './components/SocialHub';
import RewardsStore from './components/RewardsStore';
import Settings from './components/Settings';
import TestingCenter from './components/TestingCenter';
import ParentAgreement from './components/ParentAgreement';
import OnboardingTour from './components/OnboardingTour';
import DiagnosticTest from './components/DiagnosticTest';
import PricingPlan from './components/PricingPlan';
import Repository from './components/Repository'; 
import SupportWidget from './components/SupportWidget';
import { 
  loginWithSupabase, 
  logoutSupabase, 
  getUserEconomy, 
  fetchStoreItems, 
  logStudentInfraction, 
  saveStoreItemToDb, 
  deleteStoreItemFromDb,
  fetchStudentAcademicResults,
  fetchStudentAllowedViews,
  adminAwardCoins,
  isOffline,
  subscribeToEconomy,
  getAllStudents
} from './services/supabase';
import { Brain, Lock, Zap, ArrowRight, ShieldCheck, Activity, Smartphone, Mail, AtSign, Phone, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isTourOpen, setTourOpen] = useState(false);
  const [isTestingCenterOpen, setTestingCenterOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
  
  // LANGUAGE STATE
  const [language, setLanguage] = useState<Language>('es');

  const [studentForm, setStudentForm] = useState({ email: '', guardianPhone: '', password: '' });
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
  const [userLevel, setUserLevel] = useState<'KIDS' | 'TEEN'>('TEEN');
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [isMockSession, setIsMockSession] = useState(false);

  const [remedialSubject, setRemedialSubject] = useState<Subject | undefined>(undefined);
  const [dailyInfractions, setDailyInfractions] = useState<Infraction[]>([]);
  const [coins, setCoins] = useState(0);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [studentMenuConfig, setStudentMenuConfig] = useState<string[]>([]);
  const [uploadedHomework, setUploadedHomework] = useState<File[]>([]);
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentsList, setStudentsList] = useState<{uid: string, name: string, email: string}[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData(userId);
      loadMenuConfig(userId);

      if (userRole === 'ADMIN') {
        loadStudentsList();
      }

      if (userRole === 'STUDENT') {
        const unsubEconomy = subscribeToEconomy(userId, (newCoins) => {
            setCoins(newCoins);
        });
        return () => { unsubEconomy(); };
      }
    }
  }, [isAuthenticated, userId, userRole]);

  const loadStudentsList = async () => {
    const students = await getAllStudents();
    setStudentsList(students);
    if (students.length > 0) {
      setSelectedStudentId(students[0].uid);
    }
  };

  const loadMenuConfig = async (uid: string) => {
      const allowedViews = await fetchStudentAllowedViews(uid);
      if (allowedViews && allowedViews.length > 0) {
          setStudentMenuConfig(allowedViews);
      } else {
          setStudentMenuConfig([ViewState.DASHBOARD, ViewState.SCHEDULE, ViewState.CURRICULUM, ViewState.REPOSITORY, ViewState.AI_CONSULTANT, ViewState.PROGRESS, ViewState.REWARDS]);
      }
  };

  const loadUserData = async (uid: string) => {
    const economy = await getUserEconomy(uid);
    setCoins(economy.coins);
    const items = await fetchStoreItems();
    setStoreItems(items.length > 0 ? items : [
        { id: 't1', name: 'Tema Oscuro', cost: 150, category: 'theme', owned: false },
        { id: 'a1', name: 'Avatar Robot', cost: 300, category: 'avatar', owned: false },
        { id: 'c1', name: 'Cupón Cine 2x1', cost: 500, category: 'coupon', owned: false },
        { id: 'r1', name: 'Pizza Party', cost: 1000, category: 'real', owned: false },
    ]);
  };

  const loadRemedialPlan = async (uid: string) => {
      const results = await fetchStudentAcademicResults(uid);
      const mathResult = results.find((r: any) => r.subject === 'Math' || (r.remedial_plan && r.remedial_plan.length > 0));
      if (mathResult && mathResult.remedial_plan) {
          const subject: Subject = {
              id: 'remedial-math', name: 'NIVELACION: Matematicas', icon: <Zap className="w-6 h-6" />,
              description: 'Curso intensivo personalizado.', colorTheme: 'rose',
              tracks: [{ id: 'rem-1', name: 'Plan de Choque', overview: 'Recuperacion de bases.',
                  modules: [{ id: 1, name: 'Modulos de Recuperacion', level: 'Prioridad Alta', focus: 'Cerrar brechas.',
                      classes: mathResult.remedial_plan.map((c: any, idx: number) => ({
                          id: 700 + idx, title: c.title, duration: c.duration || '25 min', topic: c.topic,
                          isRemedial: true, blueprint: { hook: '', development: '', practice: '', closure: '', differentiation: '' }
                      }))
                  }]
              }]
          };
          setRemedialSubject(subject);
          return true;
      }
      return false;
  };

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      let emailToAuth = loginMode === 'STUDENT' ? studentForm.email : adminForm.email;
      let passwordToAuth = loginMode === 'STUDENT' ? studentForm.password : adminForm.password;

      if (loginMode === 'STUDENT' && !studentForm.guardianPhone.trim()) {
          alert("Por favor ingresa el WhatsApp del acudiente.");
          return;
      }

      try {
          const user = await loginWithSupabase(emailToAuth, passwordToAuth, loginMode);
          setUserId(user.uid);
          setUserName(user.name);
          setUserRole(user.role as any);
          setUserLevel(user.level as any);
          setIsMockSession(false);
          setIsAuthenticated(true);

          if (loginMode === 'STUDENT' && studentForm.guardianPhone) {
              const { saveGuardianPhone } = await import('./services/supabase');
              await saveGuardianPhone(user.uid, studentForm.guardianPhone);
          }

          const hasRemedial = await loadRemedialPlan(user.uid);
          setAgreementAccepted(user.role === 'ADMIN' || hasRemedial);

          if (user.role === 'ADMIN') setCurrentView(ViewState.PROGRESS);
          else if (hasRemedial) setCurrentView(ViewState.CURRICULUM);
          else setCurrentView(ViewState.DASHBOARD);
      } catch (error) {
          alert("Login fallido. Verifica tus credenciales.");
      }
  };

  const handleLogout = async () => {
      await logoutSupabase();
      setIsAuthenticated(false);
      setUserId('');
      setUserName('');
      setStudentForm({ email: '', guardianPhone: '', password: '' });
      setAdminForm({ email: '', password: '' });
      setAgreementAccepted(false);
      setIsSimulationMode(false);
      setIsMockSession(false);
      setRemedialSubject(undefined);
      setUploadedHomework([]); 
      setCurrentView(ViewState.DASHBOARD);
      setSelectedStudentId('');
      setStudentsList([]);
  };

  const handleSimulatePersona = async (name: string, role: 'STUDENT' | 'ADMIN', level: 'KIDS' | 'TEEN') => {
      setIsSimulationMode(true);
      setUserName(name);
      setUserRole(role);
      setUserLevel(level);
      setIsAuthenticated(true);
      setAgreementAccepted(true); 
      setTestingCenterOpen(false);
      setIsMockSession(true);
      if (role === 'ADMIN') setCurrentView(ViewState.PROGRESS);
      else setCurrentView(ViewState.DASHBOARD);
  };

  const handleLogInfraction = (type: Infraction['type'], description: string) => {
      const newInfraction: Infraction = { id: Date.now().toString(), type, description, timestamp: new Date().toISOString(), severity: 'MEDIUM' };
      setDailyInfractions(prev => [newInfraction, ...prev]);
      if (userId) logStudentInfraction(userId, newInfraction);
  };

  const handleTriggerAction = (action: 'ROOM_CHECK' | 'ADD_COINS' | 'INFRACTION' | 'TOUR') => {
      switch (action) {
          case 'ROOM_CHECK': alert("Room Check forzado iniciado..."); break;
          case 'ADD_COINS': setCoins(prev => prev + 1000); break;
          case 'INFRACTION': handleLogInfraction('ACADEMIC_DISHONESTY', 'Simulated infraction via DevTools'); break;
          case 'TOUR': setTourOpen(true); break;
      }
  };
  
  const handleAdminAddCoins = async (amount: number) => {
      if (!selectedStudentId) {
          alert("Por favor selecciona un estudiante primero.");
          return;
      }
      console.log('Admin enviando', amount, 'coins a estudiante:', selectedStudentId);
      const success = await adminAwardCoins(selectedStudentId, amount);
      if (success) {
          const student = studentsList.find(s => s.uid === selectedStudentId);
          alert('Enviados ' + amount + ' Nova Coins a ' + (student?.name || 'estudiante') + '.');
      } else {
          alert("Error enviando coins. Revisa la consola.");
      }
  };

  const handleSelectStudent = (studentId: string) => {
      setSelectedStudentId(studentId);
      console.log('Estudiante seleccionado:', studentId);
  };

  if (!isAuthenticated) {
      // Translations for Login
      const t = {
          es: { student: 'Estudiante', admin: 'Administrativo', mail: 'Correo Estudiante', guardian: 'WhatsApp Acudiente', pass: 'Contraseña', login: 'INGRESAR A CLASE', access: 'ACCESO PANEL' },
          en: { student: 'Student', admin: 'Administrative', mail: 'Student Email', guardian: 'Parent WhatsApp', pass: 'Password', login: 'ENTER CLASS', access: 'DASHBOARD ACCESS' }
      };
      const text = t[language];

      return (
          <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
              <div className="absolute inset-0 z-0">
                  <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px]"></div>
                  <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-600/20 rounded-full blur-[120px]"></div>
              </div>
              <div className="relative z-10 w-full max-w-md">
                  <div className="text-center mb-8">
                      <div className="inline-flex relative group">
                          <div className="relative bg-[#0f172a] p-4 rounded-2xl border border-white/10 shadow-2xl">
                              <Brain className="w-12 h-12 text-cyan-400" />
                          </div>
                      </div>
                      <h1 className="mt-6 text-4xl font-black text-white tracking-tight">NOVA <span className="text-cyan-400">SCHOLA</span></h1>
                      <p className="mt-2 text-slate-400 text-sm">AI-Powered Educational Ecosystem</p>
                  </div>
                  
                  {/* LANGUAGE TOGGLE */}
                  <div className="flex justify-center mb-6">
                      <div className="bg-white/10 backdrop-blur-md rounded-full p-1 flex border border-white/10">
                          <button 
                              onClick={() => setLanguage('es')} 
                              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'es' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                          >
                              Español
                          </button>
                          <button 
                              onClick={() => setLanguage('en')} 
                              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                          >
                              English
                          </button>
                      </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                      <div className="flex bg-black/40 rounded-xl p-1 mb-6 border border-white/10">
                          <button onClick={() => setLoginMode('STUDENT')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${loginMode === 'STUDENT' ? 'bg-cyan-600 text-white' : 'text-slate-500'}`}>
                              <Smartphone className="w-4 h-4" /> {text.student}
                          </button>
                          <button onClick={() => setLoginMode('ADMIN')} className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${loginMode === 'ADMIN' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
                              <ShieldCheck className="w-4 h-4" /> {text.admin}
                          </button>
                      </div>
                      <form onSubmit={handleLogin} className="space-y-4">
                          {loginMode === 'STUDENT' ? (
                              <>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">{text.mail}</label>
                                    <div className="relative"><AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                    <input type="email" value={studentForm.email} onChange={(e) => setStudentForm({...studentForm, email: e.target.value})} className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-4 pl-12 pr-4" placeholder="estudiante@colegio.edu" required /></div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">{text.guardian}</label>
                                    <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                    <input type="tel" value={studentForm.guardianPhone} onChange={(e) => setStudentForm({...studentForm, guardianPhone: e.target.value})} className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-4 pl-12 pr-4" placeholder="300 123 4567" required /></div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">{text.pass}</label>
                                    <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                    <input type="password" value={studentForm.password} onChange={(e) => setStudentForm({...studentForm, password: e.target.value})} className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-4 pl-12 pr-4" placeholder="********" required /></div>
                                </div>
                              </>
                          ) : (
                              <>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Correo Corporativo</label>
                                    <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                    <input type="email" value={adminForm.email} onChange={(e) => setAdminForm({...adminForm, email: e.target.value})} className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-4 pl-12 pr-4" placeholder="admin@nova.edu" required /></div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">{text.pass}</label>
                                    <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                    <input type="password" value={adminForm.password} onChange={(e) => setAdminForm({...adminForm, password: e.target.value})} className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-4 pl-12 pr-4" placeholder="********" required /></div>
                                </div>
                              </>
                          )}
                          <button type="submit" className={`w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-4 ${loginMode === 'STUDENT' ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}>
                              <span>{loginMode === 'STUDENT' ? text.login : text.access}</span>
                              <ArrowRight className="w-5 h-5" />
                          </button>
                          {isOffline && (<div className="flex items-center justify-center gap-2 text-rose-400 text-xs bg-rose-950/30 py-2 rounded-lg"><Activity className="w-3 h-3" /><span>Conexion Offline</span></div>)}
                      </form>
                  </div>
                  <div className="mt-8 flex justify-center gap-6 text-xs text-slate-500">
                      <button onClick={() => setTestingCenterOpen(true)} className="hover:text-cyan-400 flex items-center gap-1"><Activity className="w-3 h-3" /> Dev Tools</button>
                  </div>
                  <TestingCenter isOpen={isTestingCenterOpen} onClose={() => setTestingCenterOpen(false)} onSimulatePersona={handleSimulatePersona} onTriggerAction={handleTriggerAction} />
              </div>
          </div>
      );
  }

  if (!agreementAccepted && userRole === 'STUDENT') {
      return <ParentAgreement studentName={userName} onAccept={() => setAgreementAccepted(true)} onLogout={handleLogout} />;
  }

  return (
    <div className="flex bg-white min-h-screen font-sans text-slate-900 overflow-hidden">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} onStartTour={() => setTourOpen(true)} onLogout={handleLogout} userName={userName} userRole={userRole} isSimulationMode={isSimulationMode} onExitSimulation={() => { setIsSimulationMode(false); handleLogout(); }} restrictedMode={!!remedialSubject} studentMenuConfig={studentMenuConfig} isMock={isMockSession} language={language} setLanguage={setLanguage} />
        <main className="flex-1 overflow-y-auto h-screen relative bg-stone-50/30 md:ml-64">
            {isAuthenticated && <SupportWidget userId={userId} userName={userName} userRole={userRole} />}
            <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
                {currentView === ViewState.DASHBOARD && <Dashboard onNavigate={setCurrentView} onStartTour={() => setTourOpen(true)} language={language} />}
                {currentView === ViewState.REPOSITORY && <Repository studentName={userName} userRole={userRole} onUploadHomework={(file) => setUploadedHomework(prev => [...prev, file])} />}
                {currentView === ViewState.CURRICULUM && <Curriculum userName={userName} userRole={userRole} remedialSubject={remedialSubject} onLogInfraction={handleLogInfraction} onLogout={handleLogout} guardianPhone={studentForm.guardianPhone} uploadedHomework={uploadedHomework} userId={userId} language={language} />}
                {currentView === ViewState.AI_CONSULTANT && <AIConsultant />}
                {currentView === ViewState.METRICS && <Metrics />}
                {currentView === ViewState.PROGRESS && <Progress userRole={userRole} userId={userId} userName={userName} dailyInfractions={dailyInfractions} onAwardCoins={(amt) => setCoins(c => c + amt)} onAddItemToStore={(item) => { setStoreItems(prev => [...prev, item]); saveStoreItemToDb(item); }} onMenuConfigUpdate={() => loadMenuConfig(userId)} studentsList={studentsList} selectedStudentId={selectedStudentId} onSelectStudent={handleSelectStudent} />}
                {currentView === ViewState.DIAGNOSTIC && <DiagnosticTest studentName={userName} onFinish={async (view, data) => { 
                    if (data?.remedialSubject) { 
                        setRemedialSubject(data.remedialSubject); 
                        if (userId && data.rawResult?.remedialClasses) { 
                            const { assignRemedialPlan } = await import('./services/supabase'); 
                            const planForDB = data.rawResult.remedialClasses.map((c: any, idx: number) => ({
                                title: c.title || `Sesión ${idx + 1}`,
                                topic: c.topic || 'Refuerzo General',
                                duration: '25 min',
                                status: 'pending'
                            }));
                            await assignRemedialPlan(userId, 'Math', planForDB);
                            console.log('✅ Plan de nivelación guardado automáticamente en DB');
                        } 
                    } 
                    setCurrentView(view); 
                }} />}
                {currentView === ViewState.CAREER && <CareerPath initialMode={userLevel} />}
                {currentView === ViewState.FLASHCARDS && <Flashcards />}
                {currentView === ViewState.SOCIAL && <SocialHub />}
                {currentView === ViewState.REWARDS && <RewardsStore userLevel={userLevel} currentCoins={coins} items={storeItems} onPurchase={(item) => { if(coins >= item.cost) { setCoins(c => c - item.cost); setStoreItems(prev => prev.map(i => i.id === item.id ? {...i, owned: true} : i)); alert('Compraste ' + item.name + '!'); } }} isEditable={userRole === 'ADMIN'} onDelete={(id) => { setStoreItems(prev => prev.filter(i => i.id !== id)); deleteStoreItemFromDb(id); }} onUpdate={(item) => { setStoreItems(prev => prev.map(i => i.id === item.id ? item : i)); saveStoreItemToDb(item); }} onAddCoins={handleAdminAddCoins} selectedStudentId={selectedStudentId} selectedStudentName={studentsList.find(s => s.uid === selectedStudentId)?.name || ''} studentsList={studentsList} onSelectStudent={handleSelectStudent} />}
                {currentView === ViewState.PRICING && <PricingPlan />}
                {currentView === ViewState.SETTINGS && <Settings userId={userId} userName={userName} userRole={userRole} onUpdateUser={setUserName} onLogout={handleLogout} />}
            </div>
            {userRole === 'ADMIN' && <button className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-3 rounded-full shadow-lg opacity-30 hover:opacity-100" onClick={() => setTestingCenterOpen(true)}>🛠️</button>}
            <TestingCenter isOpen={isTestingCenterOpen} onClose={() => setTestingCenterOpen(false)} onSimulatePersona={handleSimulatePersona} onTriggerAction={handleTriggerAction} />
            <OnboardingTour isOpen={isTourOpen} onClose={() => setTourOpen(false)} currentView={currentView} onNavigate={setCurrentView} />
        </main>
    </div>
  );
};

export default App;
