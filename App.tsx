
import React, { useState, useEffect } from 'react';
import { ViewState, Subject, Infraction, StoreItem, Language, UserLevel } from './types';
import Sidebar from './components/Sidebar';

// Lazy Load Heavy Components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Curriculum = React.lazy(() => import('./components/Curriculum'));
const AIConsultant = React.lazy(() => import('./components/AIConsultant'));
const Metrics = React.lazy(() => import('./components/Metrics'));
const Progress = React.lazy(() => import('./components/Progress'));
const CareerPath = React.lazy(() => import('./components/CareerPath'));
const Flashcards = React.lazy(() => import('./components/Flashcards'));
const SocialHub = React.lazy(() => import('./components/SocialHub'));
const RewardsStore = React.lazy(() => import('./components/RewardsStore'));
const Settings = React.lazy(() => import('./components/Settings'));
const TestingCenter = React.lazy(() => import('./components/TestingCenter'));
const ParentAgreement = React.lazy(() => import('./components/ParentAgreement'));
const OnboardingTour = React.lazy(() => import('./components/OnboardingTour'));
const DiagnosticTest = React.lazy(() => import('./components/DiagnosticTest'));
const PricingPlan = React.lazy(() => import('./components/PricingPlan'));
const Repository = React.lazy(() => import('./components/Repository'));
const Whiteboard = React.lazy(() => import('./components/Whiteboard'));
const SupportWidget = React.lazy(() => import('./components/SupportWidget'));
const TeacherReport = React.lazy(() => import('./components/TeacherReport'));
const PaymentView = React.lazy(() => import('./components/PaymentView'));
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
    const [isTourOpen, setTourOpen] = useState(true) // Skip ParentAgreement;
    const [isTestingCenterOpen, setTestingCenterOpen] = useState(true) // Skip ParentAgreement;
    const [loginMode, setLoginMode] = useState<'STUDENT' | 'ADMIN'>('STUDENT');

    // LANGUAGE STATE
    const [language, setLanguage] = useState<Language>('es');

    const [studentForm, setStudentForm] = useState({ email: '', guardianPhone: '', password: '' });
    const [adminForm, setAdminForm] = useState({ email: '', password: '' });

    const [isAuthenticated, setIsAuthenticated] = useState(true) // Skip ParentAgreement;
    const [userId, setUserId] = useState<string>('');
    const [userName, setUserName] = useState<string>('');
    const [userRole, setUserRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
    const [userLevel, setUserLevel] = useState<UserLevel>('bachillerato');
    const [loginLevel, setLoginLevel] = useState<UserLevel>('bachillerato');
    const [agreementAccepted, setAgreementAccepted] = useState(true) // Skip ParentAgreement;
    const [isMockSession, setIsMockSession] = useState(true) // Skip ParentAgreement;

    const [remedialSubject, setRemedialSubject] = useState<Subject | undefined>(undefined);
    const [dailyInfractions, setDailyInfractions] = useState<Infraction[]>([]);
    const [coins, setCoins] = useState(0);
    const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
    const [studentMenuConfig, setStudentMenuConfig] = useState<string[]>([]);
    const [uploadedHomework, setUploadedHomework] = useState<File[]>([]);
    const [isSimulationMode, setIsSimulationMode] = useState(true) // Skip ParentAgreement;

    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [studentsList, setStudentsList] = useState<{ uid: string, name: string, email: string }[]>([]);
    const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<string>(''); // For Payment Flow

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
                tracks: [{
                    id: 'rem-1', name: 'Plan de Choque', overview: 'Recuperacion de bases.',
                    modules: [{
                        id: 1, name: 'Modulos de Recuperacion', level: 'Prioridad Alta', focus: 'Cerrar brechas.',
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
            setUserLevel(loginLevel); // Use the selected level for now as DB mock might not have it
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

    const handleSimulatePersona = async (name: string, role: 'STUDENT' | 'ADMIN', level: UserLevel) => {
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
            es: { student: 'Estudiante', admin: 'Administrativo', mail: 'CORREO ESTUDIANTE', guardian: 'WHATSAPP ACUDIENTE', pass: 'CONTRASEÑA', login: 'INGRESAR A CLASE', access: 'ACCESO PANEL' },
            en: { student: 'Student', admin: 'Administrative', mail: 'STUDENT EMAIL', guardian: 'PARENT WHATSAPP', pass: 'PASSWORD', login: 'ENTER CLASS', access: 'DASHBOARD ACCESS' }
        };
        const text = t[language];

        return (
            <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6 font-sans selection:bg-cyan-500/30">

                {/* Main Container */}
                <div className="w-full max-w-[420px] mx-auto flex flex-col items-center">

                    {/* Logo Area */}
                    <div className="mb-10 text-center">
                        <div className="w-16 h-16 bg-[#0E0E10] border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-cyan-900/10">
                            <Brain className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-widest uppercase">NOVA <span className="text-cyan-400">SCHOLA</span></h1>
                        <p className="text-slate-500 text-xs font-medium tracking-wide mt-2">AI Powered Educational Ecosystem</p>
                    </div>

                    {/* Language Switcher */}
                    <div className="mb-8">
                        <div className="bg-[#0E0E10] border border-white/5 rounded-full p-1 flex">
                            <button onClick={() => setLanguage('es')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'es' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-500 hover:text-white'}`}>Español</button>
                            <button onClick={() => setLanguage('en')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-500 hover:text-white'}`}>English</button>
                        </div>
                    </div>

                    {/* Auth Card */}
                    <div className="w-full bg-[#0E0E10] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">

                        {/* Role Tabs */}
                        <div className="flex bg-[#18181B] rounded-xl p-1 mb-6">
                            <button onClick={() => setLoginMode('STUDENT')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${loginMode === 'STUDENT' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
                                <Smartphone className="w-3.5 h-3.5" /> {text.student}
                            </button>
                            <button onClick={() => setLoginMode('ADMIN')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${loginMode === 'ADMIN' ? 'bg-[#27272A] text-white border border-white/5' : 'text-slate-500 hover:text-slate-300'}`}>
                                <ShieldCheck className="w-3.5 h-3.5" /> {text.admin}
                            </button>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {loginMode === 'STUDENT' ? (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 tracking-wider ml-1">{text.mail}</label>
                                        <div className="relative group">
                                            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                            <input
                                                type="email"
                                                value={studentForm.email}
                                                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                                                className="w-full bg-[#18181B] border border-transparent focus:border-cyan-500/50 focus:bg-[#202025] text-white rounded-xl py-3.5 pl-11 pr-4 text-sm placeholder:text-slate-600 outline-none transition-all"
                                                placeholder="estudiante@colegio.edu"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 tracking-wider ml-1">{text.guardian}</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                            <input
                                                type="tel"
                                                value={studentForm.guardianPhone}
                                                onChange={(e) => setStudentForm({ ...studentForm, guardianPhone: e.target.value })}
                                                className="w-full bg-[#18181B] border border-transparent focus:border-cyan-500/50 focus:bg-[#202025] text-white rounded-xl py-3.5 pl-11 pr-4 text-sm placeholder:text-slate-600 outline-none transition-all"
                                                placeholder="300 123 4567"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 tracking-wider ml-1">{text.pass}</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                            <input
                                                type="password"
                                                value={studentForm.password}
                                                onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                                                className="w-full bg-[#18181B] border border-transparent focus:border-cyan-500/50 focus:bg-[#202025] text-white rounded-xl py-3.5 pl-11 pr-4 text-sm placeholder:text-slate-600 outline-none transition-all"
                                                placeholder="********"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 tracking-wider ml-1">CORREO CORPORATIVO</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                            <input
                                                type="email"
                                                value={adminForm.email}
                                                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                                                className="w-full bg-[#18181B] border border-transparent focus:border-indigo-500/50 focus:bg-[#202025] text-white rounded-xl py-3.5 pl-11 pr-4 text-sm placeholder:text-slate-600 outline-none transition-all"
                                                placeholder="admin@nova.edu"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 tracking-wider ml-1">{text.pass}</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                            <input
                                                type="password"
                                                value={adminForm.password}
                                                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                                                className="w-full bg-[#18181B] border border-transparent focus:border-indigo-500/50 focus:bg-[#202025] text-white rounded-xl py-3.5 pl-11 pr-4 text-sm placeholder:text-slate-600 outline-none transition-all"
                                                placeholder="********"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <button type="submit" className={`w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-2 transition-all shadow-lg hover:translate-y-[-1px] active:translate-y-0 ${loginMode === 'STUDENT' ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'}`}>
                                <span className="text-xs tracking-widest uppercase">{loginMode === 'STUDENT' ? text.login : text.access}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            {/* Offline Indicator - Styled as Red Button/Badge */}
                            {isOffline && (
                                <button type="button" className="w-full bg-rose-950/30 border border-rose-900/50 text-rose-400 text-[10px] font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 animate-pulse cursor-default">
                                    <Zap className="w-3 h-3 fill-rose-500" />
                                    <span>CONEXION OFFLINE</span>
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Dev Tools Footer */}
                    <div className="mt-8">
                        <button onClick={() => setTestingCenterOpen(true)} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 hover:text-slate-500 transition-colors uppercase tracking-widest">
                            <Activity className="w-3 h-3" /> Dev Tools
                        </button>
                    </div>

                    <TestingCenter isOpen={isTestingCenterOpen} onClose={() => setTestingCenterOpen(false)} onSimulatePersona={handleSimulatePersona} onTriggerAction={handleTriggerAction} />
                </div>
            </div>
        );
    }

    if (!agreementAccepted && userRole === 'STUDENT') {
        return (
            <React.Suspense fallback={<div className="h-screen flex items-center justify-center text-white">Loading Agreement...</div>}>
                <ParentAgreement studentName={userName} onAccept={() => setAgreementAccepted(true)} onLogout={handleLogout} />
            </React.Suspense>
        );
    }

    return (
        <div className="flex bg-white min-h-screen font-sans text-slate-900 overflow-hidden">
            <Sidebar currentView={currentView} onViewChange={setCurrentView} onStartTour={() => setTourOpen(true)} onLogout={handleLogout} userName={userName} userRole={userRole} isSimulationMode={isSimulationMode} onExitSimulation={() => { setIsSimulationMode(false); handleLogout(); }} restrictedMode={!!remedialSubject} studentMenuConfig={studentMenuConfig} isMock={isMockSession} language={language} setLanguage={setLanguage} userLevel={userLevel} />
            <main className={`flex-1 overflow-y-auto h-screen relative md:ml-64 bg-[#050505]`}>
                {isAuthenticated && <React.Suspense fallback={null}><SupportWidget userId={userId} userName={userName} userRole={userRole} /></React.Suspense>}
                <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
                    <React.Suspense fallback={
                        <div className="flex h-96 items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                        </div>
                    }>
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
                        {currentView === ViewState.WHITEBOARD && <Whiteboard />}
                        {currentView === ViewState.FLASHCARDS && <Flashcards />}
                        {currentView === ViewState.SOCIAL && <SocialHub />}
                        {currentView === ViewState.REWARDS && <RewardsStore userLevel={userLevel === 'primary' ? 'KIDS' : 'TEEN'} currentCoins={coins} items={storeItems} onPurchase={(item) => { if (coins >= item.cost) { setCoins(c => c - item.cost); setStoreItems(prev => prev.map(i => i.id === item.id ? { ...i, owned: true } : i)); alert('Compraste ' + item.name + '!'); } }} isEditable={userRole === 'ADMIN'} onDelete={(id) => { setStoreItems(prev => prev.filter(i => i.id !== id)); deleteStoreItemFromDb(id); }} onUpdate={(item) => { setStoreItems(prev => prev.map(i => i.id === item.id ? item : i)); saveStoreItemToDb(item); }} onAddCoins={handleAdminAddCoins} selectedStudentId={selectedStudentId} selectedStudentName={studentsList.find(s => s.uid === selectedStudentId)?.name || ''} studentsList={studentsList} onSelectStudent={handleSelectStudent} />}
                        {currentView === ViewState.PRICING && <PricingPlan onPlanSelect={(id) => { setSelectedCheckoutPlan(id); setCurrentView(ViewState.PAYMENTS); }} />}
                        {currentView === ViewState.PAYMENTS && <PaymentView planId={selectedCheckoutPlan} onBack={() => setCurrentView(ViewState.PRICING)} />}
                        {currentView === ViewState.TEACHER_REPORT && <TeacherReport onAssignPlan={(plan) => { setRemedialSubject(plan); setCurrentView(ViewState.CURRICULUM); alert("Plan asignado correctamente."); }} />}
                        {currentView === ViewState.SETTINGS && <Settings userId={userId} userName={userName} userRole={userRole} onUpdateUser={setUserName} onLogout={handleLogout} />}
                    </React.Suspense>
                </div>
                {userRole === 'ADMIN' && <button className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-3 rounded-full shadow-lg opacity-30 hover:opacity-100" onClick={() => setTestingCenterOpen(true)}>🛠️</button>}
                <React.Suspense fallback={null}>
                    <TestingCenter isOpen={isTestingCenterOpen} onClose={() => setTestingCenterOpen(false)} onSimulatePersona={handleSimulatePersona} onTriggerAction={handleTriggerAction} />
                    <OnboardingTour isOpen={isTourOpen} onClose={() => setTourOpen(false)} currentView={currentView} onNavigate={setCurrentView} />
                </React.Suspense>
            </main>
        </div>
    );
};

export default App;
