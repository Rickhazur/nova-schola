
import React, { useState, useEffect } from 'react';
import {
    Brain, Trophy, TrendingUp, AlertTriangle, CheckCircle, Clock, Calendar, ChevronDown, ShieldAlert,
    ShieldCheck, Bell, Send, Users, FileText, Inbox, MessageSquare, CheckCircle2, X, Filter, Download,
    Mail, Phone, MessageCircle, Plus, RefreshCw, Save, Layout, Layers, Lock, ListChecks, BookOpen,
    Sparkles, Zap, GraduationCap, FolderOpen
} from 'lucide-react';
import {
    getAllStudents, fetchStudentInfractions, fetchStudentAcademicResults, fetchHomeworkSubmissions,
    adminAwardCoins, fetchGlobalConfig, sendFlashMessage, getAdminMessages, subscribeToAdminMessages,
    markMessageAsRead, assignRemedialPlan, fetchStudentPlanAssignment, fetchPlansConfig,
    savePlansConfig, assignPlanToStudent, getSessionReportsForAdmin,
    generateWhatsAppLink, generateTeacherEmailLink
} from '../services/supabase';
import { Infraction, ViewState, StoreItem, EducationalPlan, AppMessage } from '../types';
import { generateParentEmailReport } from '../services/openai';

interface ProgressProps {
    userRole?: 'STUDENT' | 'ADMIN';
    userId?: string;
    userName?: string;
    dailyInfractions?: Infraction[];
    onAwardCoins?: (amount: number, studentId: string) => void;
    onAddItemToStore?: (item: StoreItem) => void;
    onMenuConfigUpdate?: () => void;
    studentsList?: { uid: string, name: string, email: string }[];
    selectedStudentId?: string;
    onSelectStudent?: (studentId: string) => void;
}

const Progress: React.FC<ProgressProps> = ({
    userRole = 'STUDENT',
    userId,
    userName = 'Estudiante',
    dailyInfractions = [],
    onAwardCoins,
    onAddItemToStore,
    onMenuConfigUpdate,
    studentsList,
    selectedStudentId,
    onSelectStudent
}) => {
    // ADMIN STATE
    const [internalSelectedStudentId, setInternalSelectedStudentId] = useState<string>('');
    const [internalStudents, setInternalStudents] = useState<{ uid: string, name: string, email: string }[]>([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);

    const currentStudentId = selectedStudentId || internalSelectedStudentId;
    const students = studentsList || internalStudents;

    const handleStudentSelect = (id: string) => {
        if (onSelectStudent) {
            onSelectStudent(id);
        } else {
            setInternalSelectedStudentId(id);
        }
    };

    // Tabs & Plans
    const [adminTab, setAdminTab] = useState<'DASHBOARD' | 'PLANS_EDITOR' | 'MESSAGES' | 'REPORTS'>('DASHBOARD');
    const [plans, setPlans] = useState<EducationalPlan[]>([]);
    const [activePlanId, setActivePlanId] = useState<string>('');
    const [isSavingPlans, setIsSavingPlans] = useState(false);
    const [currentStudentPlanId, setCurrentStudentPlanId] = useState<string>('');
    const [isAssigningPlan, setIsAssigningPlan] = useState(false);

    // Data State
    const [realInfractions, setRealInfractions] = useState<Infraction[]>([]);
    const [realAcademicData, setRealAcademicData] = useState<any[]>([]);
    const [homeworkSubmissions, setHomeworkSubmissions] = useState<any[]>([]);
    const [roomCheckEnabled, setRoomCheckEnabled] = useState(true);

    // Messaging State
    const [flashMessage, setFlashMessage] = useState('');
    const [isSendingMsg, setIsSendingMsg] = useState(false);
    const [adminMessages, setAdminMessages] = useState<AppMessage[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [replyingTo, setReplyingTo] = useState<AppMessage | null>(null);
    const [replyText, setReplyText] = useState('');

    // Reports State
    const [sessionReports, setSessionReports] = useState<any[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(false);

    // Tools State
    const [awardAmount, setAwardAmount] = useState(50);

    // INIT
    useEffect(() => {
        const initConfig = async () => {
            try {
                const enabled = await fetchGlobalConfig();
                setRoomCheckEnabled(enabled);

                if (userRole === 'ADMIN') {
                    if (!studentsList) {
                        setIsLoadingStudents(true);
                        const fetchedStudents = await getAllStudents();
                        setInternalStudents(fetchedStudents);
                        if (fetchedStudents.length > 0) {
                            setInternalSelectedStudentId(fetchedStudents[0].uid);
                        }
                        setIsLoadingStudents(false);
                    }
                    const fetchedPlans = await fetchPlansConfig();
                    setPlans(fetchedPlans);
                    if (fetchedPlans.length > 0) setActivePlanId(fetchedPlans[0].id);

                    const messages = await getAdminMessages();
                    setAdminMessages(messages);
                    setUnreadCount(messages.filter((m: AppMessage) => !m.read).length);

                    const unsub = subscribeToAdminMessages((newMsg) => {
                        setAdminMessages(prev => [newMsg, ...prev]);
                        setUnreadCount(prev => prev + 1);
                    });
                    return () => unsub();
                }
            } catch (e) {
                console.error("Error inicializando config:", e);
            }
        };
        initConfig();
    }, [userRole, studentsList]);

    // LOAD STUDENT DATA
    useEffect(() => {
        const loadStudentData = async () => {
            const targetId = userRole === 'ADMIN' ? currentStudentId : userId;
            if (targetId) {
                const infractions = await fetchStudentInfractions(targetId);
                setRealInfractions(infractions.map(i => ({
                    id: i.id || Date.now().toString(),
                    type: i.type,
                    description: i.description,
                    timestamp: i.timestamp || new Date().toISOString(),
                    severity: i.severity || 'MEDIUM'
                })));

                const academic = await fetchStudentAcademicResults(targetId);
                setRealAcademicData(academic || []);

                const submissions = await fetchHomeworkSubmissions(targetId);
                setHomeworkSubmissions(submissions);

                if (userRole === 'ADMIN') {
                    const p = await fetchStudentPlanAssignment(targetId);
                    setCurrentStudentPlanId(p);
                }
            }
        };
        loadStudentData();
    }, [currentStudentId, userRole, userId]);

    // ACTIONS
    const handleAwardCoins = async () => {
        if (currentStudentId) {
            const success = await adminAwardCoins(currentStudentId, awardAmount);
            if (success) {
                alert(`¡${awardAmount} Coins enviados!`);
                if (onAwardCoins) onAwardCoins(awardAmount, currentStudentId);
            } else {
                alert("Error al enviar coins.");
            }
        }
    };

    const handleSendFlashMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!flashMessage.trim() || !currentStudentId) return;
        setIsSendingMsg(true);
        const msg: AppMessage = {
            id: Date.now().toString(),
            senderId: userId || 'admin',
            senderName: userName || 'Administrador',
            receiverId: currentStudentId,
            content: flashMessage,
            type: 'ADMIN_ALERT',
            timestamp: new Date().toISOString(),
            read: false
        };
        if (await sendFlashMessage(msg)) {
            setFlashMessage('');
            alert("Mensaje enviado.");
        } else alert("Error al enviar mensaje.");
        setIsSendingMsg(false);
    };

    const handleReplyToMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !replyingTo) return;
        setIsSendingMsg(true);
        const msg: AppMessage = {
            id: Date.now().toString(),
            senderId: userId || 'admin',
            senderName: userName || 'Administrador',
            receiverId: replyingTo.senderId,
            content: replyText,
            type: 'ADMIN_REPLY',
            timestamp: new Date().toISOString(),
            read: false
        };
        if (await sendFlashMessage(msg)) {
            setReplyText('');
            setReplyingTo(null);
            await markMessageAsRead(replyingTo.id);
            setAdminMessages(prev => prev.map(m => m.id === replyingTo!.id ? { ...m, read: true } : m));
            setUnreadCount(prev => Math.max(0, prev - 1));
            alert("Respuesta enviada.");
        }
        setIsSendingMsg(false);
    };

    const handleMarkAsRead = async (messageId: string) => {
        await markMessageAsRead(messageId);
        setAdminMessages(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m));
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const handleAssignRemedial = async () => {
        if (currentStudentId) {
            if (await assignRemedialPlan(currentStudentId, 'Math')) {
                alert("✅ Plan de Nivelación Matemáticas asignado.");
                const academic = await fetchStudentAcademicResults(currentStudentId);
                setRealAcademicData(academic || []);
            } else alert("Error al asignar plan.");
        }
    };

    const handleAssignCustomPlan = async (subject: string, sessions: any[]) => {
        if (currentStudentId && await assignRemedialPlan(currentStudentId, subject, sessions)) {
            alert(`✅ Plan de ${subject} asignado.`);
            const academic = await fetchStudentAcademicResults(currentStudentId);
            setRealAcademicData(academic || []);
        } else alert("Error al asignar plan.");
    };

    const handleCreatePlan = () => {
        const newPlan: EducationalPlan = {
            id: `plan_${Date.now()}`,
            name: 'Nuevo Plan',
            description: 'Descripción...',
            allowedViews: [ViewState.DASHBOARD]
        };
        setPlans([...plans, newPlan]);
        setActivePlanId(newPlan.id);
    };

    const toggleViewInPlan = (viewId: string) => {
        setPlans(prev => prev.map(p => {
            if (p.id === activePlanId) {
                const exists = p.allowedViews.includes(viewId);
                return { ...p, allowedViews: exists ? p.allowedViews.filter((v: string) => v !== viewId) : [...p.allowedViews, viewId] };
            }
            return p;
        }));
    };

    const updatePlanDetails = (key: 'name' | 'description', value: string) => {
        setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, [key]: value } : p));
    };

    const saveAllPlans = async () => {
        setIsSavingPlans(true);
        if (await savePlansConfig(plans)) alert("Planes actualizados.");
        else alert("Error al guardar planes.");
        setIsSavingPlans(false);
    };

    const handleAssignPlanToStudent = async (newPlanId: string) => {
        if (!currentStudentId) return;
        setIsAssigningPlan(true);
        if (await assignPlanToStudent(currentStudentId, newPlanId)) {
            setCurrentStudentPlanId(newPlanId);
            alert("Plan asignado.");
        } else alert("Error al asignar.");
        setIsAssigningPlan(false);
    };

    const isToday = (dateString: string) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    const allInfractions = userRole === 'ADMIN' ? realInfractions : dailyInfractions;
    const todayInfractions = allInfractions.filter(i => isToday(i.timestamp));

    const remedialData = realAcademicData.find(r => r.remedial_plan);
    const remedialClasses = remedialData ? remedialData.remedial_plan : [];
    const remedialProgress = remedialClasses.length > 0
        ? Math.round((remedialClasses.filter((c: any) => c.status === 'completed').length / remedialClasses.length) * 100)
        : 0;
    const activePlan = plans.find(p => p.id === activePlanId);

    // --- RENDER ADMIN ---
    if (userRole === 'ADMIN') {
        return (
            <div className="max-w-7xl mx-auto space-y-8 pb-20 font-sans">
                {/* ADMIN TAB SWITCHER */}
                <div className="flex gap-4 border-b border-stone-200 pb-2 overflow-x-auto">
                    <button onClick={() => setAdminTab('DASHBOARD')} className={`px-4 py-2 font-bold text-sm rounded-lg ${adminTab === 'DASHBOARD' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-100'}`}>Estudiantes</button>
                    <button onClick={() => { setAdminTab('REPORTS'); setIsLoadingReports(true); getSessionReportsForAdmin().then(r => { setSessionReports(r); setIsLoadingReports(false); }); }} className={`px-4 py-2 font-bold text-sm rounded-lg ${adminTab === 'REPORTS' ? 'bg-emerald-600 text-white' : 'text-stone-500 hover:bg-stone-100'}`}>Reportes</button>
                    <button onClick={() => setAdminTab('MESSAGES')} className={`px-4 py-2 font-bold text-sm rounded-lg ${adminTab === 'MESSAGES' ? 'bg-indigo-600 text-white' : 'text-stone-500 hover:bg-stone-100'}`}>Mensajes {unreadCount > 0 && <span className="ml-1 bg-rose-500 text-white px-1.5 rounded-full text-xs">{unreadCount}</span>}</button>
                    <button onClick={() => setAdminTab('PLANS_EDITOR')} className={`px-4 py-2 font-bold text-sm rounded-lg ${adminTab === 'PLANS_EDITOR' ? 'bg-indigo-600 text-white' : 'text-stone-500 hover:bg-stone-100'}`}>Planes</button>
                </div>

                {/* REPORTS VIEW */}
                {adminTab === 'REPORTS' && (
                    <div className="animate-fade-in bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden min-h-[400px]">
                        <div className="px-8 py-6 border-b border-stone-100 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                            <h3 className="text-xl font-bold flex items-center gap-2"><FileText /> Reportes de Tutorías</h3>
                        </div>
                        {isLoadingReports ? <div className="p-10 text-center"><RefreshCw className="animate-spin w-8 h-8 mx-auto" /></div> :
                            sessionReports.length === 0 ? <div className="p-10 text-center text-stone-400">No hay reportes.</div> : (
                                <div className="divide-y divide-stone-100">
                                    {sessionReports.map((report, idx) => {
                                        const studentName = report.profiles?.name || 'Estudiante';
                                        const guardianPhone = report.profiles?.guardian_phone;
                                        const hasPhone = guardianPhone && guardianPhone.length >= 10;
                                        const whatsappLink = hasPhone ? generateWhatsAppLink(guardianPhone, studentName, { sessionTitle: report.lesson_title || 'Tutoría', score: report.homework_score, feedback: report.feedback, date: new Date(report.completed_at || Date.now()).toLocaleDateString('es-CO') }) : null;
                                        const teacherEmailLink = generateTeacherEmailLink(studentName, { sessionTitle: report.lesson_title || 'Tutoría', score: report.homework_score, feedback: report.feedback, date: new Date(report.completed_at || Date.now()).toLocaleDateString('es-CO') });

                                        return (
                                            <div key={idx} className="p-5 hover:bg-stone-50 flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold">{studentName}</h4>
                                                    <p className="text-sm">{report.lesson_title}</p>
                                                    <p className="text-xs text-stone-400">{new Date(report.completed_at).toLocaleString()}</p>
                                                </div>
                                                <div className="flex flex-col gap-2 items-end">
                                                    {report.homework_score !== null && <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">{report.homework_score}%</div>}
                                                    <a href={teacherEmailLink} className="text-xs bg-indigo-500 text-white px-3 py-1.5 rounded hover:bg-indigo-600 flex items-center gap-1"><Mail className="w-3 h-3" /> Email Docente</a>
                                                    {hasPhone ? <a href={whatsappLink!} target="_blank" rel="noreferrer" className="text-xs bg-green-500 text-white px-3 py-1.5 rounded hover:bg-green-600 flex items-center gap-1"><MessageCircle className="w-3 h-3" /> WhatsApp</a> : <span className="text-xs text-stone-300">Sin WhatsApp</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                    </div>
                )}

                {/* MESSAGES VIEW */}
                {
                    adminTab === 'MESSAGES' && (
                        <div className="animate-fade-in bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-stone-100 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                                <h3 className="text-xl font-bold flex items-center gap-3"><Inbox /> Bandeja de Mensajes</h3>
                            </div>
                            {replyingTo && (
                                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                                    <div className="bg-white rounded-2xl w-full max-w-lg p-4">
                                        <h4 className="font-bold mb-2">Responder a {replyingTo.senderName}</h4>
                                        <textarea value={replyText} onChange={e => setReplyText(e.target.value)} className="w-full h-32 border rounded p-2" />
                                        <div className="flex justify-end gap-2 mt-2">
                                            <button onClick={() => setReplyingTo(null)}>Cancelar</button>
                                            <button onClick={handleReplyToMessage} className="bg-indigo-600 text-white px-4 py-2 rounded">Enviar</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
                                {adminMessages.map(msg => (
                                    <div key={msg.id} className={`p-4 ${!msg.read ? 'bg-indigo-50' : ''}`}>
                                        <div className="flex justify-between">
                                            <span className="font-bold">{msg.senderName}</span>
                                            <span className="text-xs text-stone-400">{new Date(msg.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm">{msg.content}</p>
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={() => setReplyingTo(msg)} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded">Responder</button>
                                            {!msg.read && <button onClick={() => handleMarkAsRead(msg.id)} className="text-xs bg-stone-200 px-2 py-1 rounded">Marcar leído</button>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {/* PLANS EDITOR */}
                {
                    adminTab === 'PLANS_EDITOR' && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
                            <div className="md:col-span-4 space-y-4">
                                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
                                    <h3 className="font-bold flex justify-between">Planes <button onClick={handleCreatePlan}><Plus className="w-4 h-4" /></button></h3>
                                    {plans.map(p => (
                                        <button key={p.id} onClick={() => setActivePlanId(p.id)} className={`w-full text-left p-3 rounded-xl border ${activePlanId === p.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white'}`}>
                                            <div className="font-bold text-sm">{p.name}</div>
                                            <div className="text-xs text-stone-500">{p.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="md:col-span-8">
                                {activePlan && (
                                    <div className="bg-white rounded-3xl border border-stone-200 p-8">
                                        <input value={activePlan.name} onChange={e => updatePlanDetails('name', e.target.value)} className="text-2xl font-bold w-full mb-2" />
                                        <input value={activePlan.description} onChange={e => updatePlanDetails('description', e.target.value)} className="text-sm w-full mb-4" />
                                        <button onClick={saveAllPlans} disabled={isSavingPlans} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Guardar</button>

                                        <div className="grid grid-cols-2 gap-3 mt-6">
                                            {[
                                                { id: ViewState.DASHBOARD, label: 'Home' }, { id: ViewState.SCHEDULE, label: 'Ruta' },
                                                { id: ViewState.CURRICULUM, label: 'Tutoría' }, { id: ViewState.REPOSITORY, label: 'Repositorio' },
                                                { id: ViewState.PROGRESS, label: 'Progreso' }, { id: ViewState.AI_CONSULTANT, label: 'Asistente IA' },
                                                { id: ViewState.METRICS, label: 'Resultados' }, { id: ViewState.CAREER, label: 'Career Path' },
                                                { id: ViewState.FLASHCARDS, label: 'Flashcards' }, { id: ViewState.SOCIAL, label: 'Social' },
                                                { id: ViewState.REWARDS, label: 'Tienda' }
                                            ].map(item => (
                                                <label key={item.id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer ${activePlan.allowedViews.includes(item.id) ? 'bg-emerald-50 border-emerald-500' : 'bg-white'}`}>
                                                    <input type="checkbox" className="hidden" checked={activePlan.allowedViews.includes(item.id)} onChange={() => toggleViewInPlan(item.id)} />
                                                    <span className="font-bold text-sm">{item.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

                {/* DASHBOARD VIEW */}
                {
                    adminTab === 'DASHBOARD' && (
                        <>
                            <div className="bg-stone-900 rounded-3xl p-6">
                                <div className="flex gap-4 items-center">
                                    <select value={currentStudentPlanId} onChange={e => handleAssignPlanToStudent(e.target.value)} className="bg-stone-800 text-white p-2 rounded">
                                        {plans.map(p => <option key={p.id} value={p.id}>Plan: {p.name}</option>)}
                                    </select>
                                    <select value={currentStudentId} onChange={e => handleStudentSelect(e.target.value)} className="flex-1 bg-stone-800 text-white p-4 text-xl font-bold rounded-2xl">
                                        {isLoadingStudents ? <option>Cargando...</option> : students.map(s => <option key={s.uid} value={s.uid}>{s.name} ({s.email})</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="bg-indigo-600 rounded-3xl p-6 text-white flex gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">Mensaje Flash</h3>
                                            <form onSubmit={handleSendFlashMessage} className="flex gap-2 mt-2">
                                                <input value={flashMessage} onChange={e => setFlashMessage(e.target.value)} placeholder="Escribe alerta..." className="flex-1 text-black p-2 rounded" />
                                                <button type="submit" className="bg-white text-indigo-600 px-4 py-2 rounded font-bold"><Send className="w-4 h-4" /></button>
                                            </form>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-3xl border border-stone-200 p-8">
                                        <h3 className="text-xl font-bold mb-4 flex gap-2"><Brain /> Progreso Académico</h3>
                                        {remedialClasses.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-4">
                                                {remedialClasses.map((cls: any, i: number) => (
                                                    <div key={i} className={`p-4 border rounded-xl ${cls.status === 'completed' ? 'bg-emerald-50' : 'bg-white'}`}>
                                                        <div className="font-bold">{cls.title}</div>
                                                        <div className="text-xs text-stone-500">{cls.status}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center p-10 border-2 border-dashed rounded-2xl">
                                                <p className="mb-4 text-stone-500">Sin plan activo</p>
                                                <div className="flex gap-2 justify-center">
                                                    <button onClick={handleAssignRemedial} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold">Asignar Matemáticas</button>
                                                    <button onClick={() => handleAssignCustomPlan('Physics', [{ title: "Sesión 1", topic: "Cinemática", duration: "25 min" }])} className="bg-amber-500 text-white px-4 py-2 rounded font-bold">Asignar Física</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white rounded-2xl border p-4">
                                        <h4 className="font-bold mb-2 flex gap-2"><FolderOpen /> Entregas</h4>
                                        {homeworkSubmissions.map((s, i) => (
                                            <div key={i} className="p-2 border-b text-sm">{s.file_name}</div>
                                        ))}
                                    </div>
                                    <div className="bg-white rounded-2xl border p-4">
                                        <h4 className="font-bold mb-2 flex gap-2"><ShieldAlert /> Infracciones</h4>
                                        {todayInfractions.map((inf, i) => <div key={i} className="text-xs text-rose-600">{inf.type}</div>)}
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                }
            </div >
        );
    }

    // STUDENT VIEW
    if (userRole === 'STUDENT') {
        const [studentProgressData, setStudentProgressData] = useState<any>(null);
        const [isLoadingProgress, setIsLoadingProgress] = useState(true);

        useEffect(() => {
            if (userId) {
                import('../services/supabase').then(async ({ getStudentProgressSummary, getStudentProgress }) => {
                    const summary = await getStudentProgressSummary(userId);
                    const sessions = await getStudentProgress(userId);
                    setStudentProgressData({ summary, sessions });
                    setIsLoadingProgress(false);
                });
            }
        }, [userId]);

        if (isLoadingProgress) return <div className="text-center p-20"><RefreshCw className="animate-spin" /></div>;

        const summary = studentProgressData?.summary;
        const sessions = studentProgressData?.sessions || [];

        return (
            <div className="max-w-4xl mx-auto space-y-8 pb-20 font-sans animate-fade-in">
                <div className="bg-indigo-600 rounded-3xl p-8 text-white">
                    <h2 className="text-3xl font-black">¡Hola, {userName}!</h2>
                    <p>Tu progreso académico.</p>
                </div>
                {summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl text-center shadow-sm">
                            <p className="text-3xl font-black">{summary.completedSessions}</p>
                            <p className="text-xs">Completadas</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl text-center shadow-sm">
                            <p className="text-3xl font-black">{summary.averageScore}%</p>
                            <p className="text-xs">Promedio</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl text-center shadow-sm">
                            <div className="flex justify-center">{summary.canContinue ? <CheckCircle className="text-emerald-500" /> : <Lock className="text-amber-500" />}</div>
                            <p className="text-xs">{summary.canContinue ? 'Puedes Avanzar' : 'En Progreso'}</p>
                        </div>
                    </div>
                )}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 bg-stone-50 font-bold">Historial</div>
                    <div className="divide-y divide-stone-100">
                        {sessions.map((s: any, i: number) => (
                            <div key={i} className="p-4 flex justify-between">
                                <div>
                                    <div className="font-bold">{s.lesson_title}</div>
                                    <div className="text-xs text-stone-500">{new Date(s.started_at).toLocaleDateString()}</div>
                                    {s.feedback && <div className="text-xs bg-indigo-50 p-2 mt-1 rounded text-indigo-800">{s.feedback}</div>}
                                </div>
                                <div className="text-right">
                                    {s.homework_score != null && <span className="bg-emerald-100 px-2 py-1 rounded text-xs font-bold">{s.homework_score}%</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default Progress;
