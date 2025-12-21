import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Lock, Trophy, TrendingUp, RefreshCw, Zap, Timer, Users, Search, ChevronDown, Globe, Mic, StopCircle, Smile, AlertCircle, AlertTriangle, ShieldCheck, ShieldAlert, BookOpen, Camera, Upload, Sparkles, FileText, ArrowRight, Mail, MessageCircle, UserPlus, Coins, ShoppingBag, Plus, Brain, Wrench, GraduationCap, ListChecks, CheckCircle2, Circle, X, Layout, Menu, Save, Edit, Layers, FolderOpen, Send, Bell, Inbox, MessageSquare } from 'lucide-react';
import { generateParentEmailReport } from '../services/openai';
import {
    updateGlobalConfig,
    registerStudent,
    fetchGlobalConfig,
    getAllStudents,
    fetchStudentInfractions,
    fetchStudentAcademicResults,
    adminAwardCoins,
    assignRemedialPlan,
    saveStoreItemToDb,
    fetchPlansConfig,
    savePlansConfig,
    assignPlanToStudent,
    fetchStudentPlanAssignment,
    fetchHomeworkSubmissions,
    sendFlashMessage,
    getAdminMessages,
    markMessageAsRead,
    subscribeToAdminMessages,
    getSessionReportsForAdmin,
    generateWhatsAppLink,
    generateTeacherEmailLink,
    getStudentProgressSummary,
    getStudentProgress
} from '../services/supabase';
import { Infraction, StoreItem, ViewState, EducationalPlan, AppMessage } from '../types';

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

    // ADMIN TABS
    const [adminTab, setAdminTab] = useState<'DASHBOARD' | 'PLANS_EDITOR' | 'MESSAGES' | 'REPORTS'>('DASHBOARD');

    // PLANS EDITOR STATE
    const [plans, setPlans] = useState<EducationalPlan[]>([]);
    const [activePlanId, setActivePlanId] = useState<string>('');
    const [isSavingPlans, setIsSavingPlans] = useState(false);

    // Student Plan Assignment State
    const [currentStudentPlanId, setCurrentStudentPlanId] = useState<string>('');
    const [isAssigningPlan, setIsAssigningPlan] = useState(false);

    // DATA STATE
    const [realInfractions, setRealInfractions] = useState<Infraction[]>([]);
    const [realAcademicData, setRealAcademicData] = useState<any[]>([]);
    const [homeworkSubmissions, setHomeworkSubmissions] = useState<any[]>([]);
    const [roomCheckEnabled, setRoomCheckEnabled] = useState(true);

    // MESSAGING STATE
    const [flashMessage, setFlashMessage] = useState('');
    const [isSendingMsg, setIsSendingMsg] = useState(false);
    const [adminMessages, setAdminMessages] = useState<AppMessage[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [replyingTo, setReplyingTo] = useState<AppMessage | null>(null);
    const [replyText, setReplyText] = useState('');

    // REPORTS STATE
    const [sessionReports, setSessionReports] = useState<any[]>([]);
    const [isLoadingReports, setIsLoadingReports] = useState(false);

    // TOOLS STATE
    const [awardAmount, setAwardAmount] = useState(50);
    const [newItemName, setNewItemName] = useState('');
    const [newItemCost, setNewItemCost] = useState(100);
    const [newItemEmoji, setNewItemEmoji] = useState('🎁');

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

                    // Load Plans
                    const fetchedPlans = await fetchPlansConfig();
                    setPlans(fetchedPlans);
                    if (fetchedPlans.length > 0) {
                        setActivePlanId(fetchedPlans[0].id);
                    }

                    // Load Admin Messages
                    const messages = await getAdminMessages();
                    setAdminMessages(messages);
                    setUnreadCount(messages.filter((m: AppMessage) => !m.read).length);

                    // Subscribe to new messages
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

        const success = await sendFlashMessage(msg);
        if (success) {
            setFlashMessage('');
            alert("Mensaje enviado.");
        } else {
            alert("Error al enviar mensaje.");
        }
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

        const success = await sendFlashMessage(msg);
        if (success) {
            setReplyText('');
            setReplyingTo(null);
            // Marcar como leído
            await markMessageAsRead(replyingTo.id);
            setAdminMessages(prev => prev.map(m => m.id === replyingTo.id ? { ...m, read: true } : m));
            setUnreadCount(prev => Math.max(0, prev - 1));
            alert("Respuesta enviada al estudiante.");
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
            const success = await assignRemedialPlan(currentStudentId, 'Math');
            if (success) {
                alert("✅ Plan de Nivelación Matemáticas asignado correctamente. El estudiante verá su plan personalizado cuando inicie sesión.");
                const academic = await fetchStudentAcademicResults(currentStudentId);
                setRealAcademicData(academic || []);
            } else {
                alert("Error al asignar plan.");
            }
        }
    };

    // Asignar plan personalizado
    const handleAssignCustomPlan = async (subject: string, sessions: any[]) => {
        if (currentStudentId) {
            const success = await assignRemedialPlan(currentStudentId, subject, sessions);
            if (success) {
                alert(`✅ Plan de ${subject} asignado correctamente.`);
                const academic = await fetchStudentAcademicResults(currentStudentId);
                setRealAcademicData(academic || []);
            } else {
                alert("Error al asignar plan.");
            }
        }
    };

    const handleCreatePlan = () => {
        const newPlan: EducationalPlan = {
            id: `plan_${Date.now()}`,
            name: 'Nuevo Plan Personalizado',
            description: 'Descripción del plan...',
            allowedViews: [ViewState.DASHBOARD]
        };
        setPlans([...plans, newPlan]);
        setActivePlanId(newPlan.id);
    };

    const toggleViewInPlan = (viewId: string) => {
        setPlans(prev => prev.map(p => {
            if (p.id === activePlanId) {
                const exists = p.allowedViews.includes(viewId);
                const newViews = exists
                    ? p.allowedViews.filter(v => v !== viewId)
                    : [...p.allowedViews, viewId];
                return { ...p, allowedViews: newViews };
            }
            return p;
        }));
    };

    const updatePlanDetails = (key: 'name' | 'description', value: string) => {
        setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, [key]: value } : p));
    };

    const saveAllPlans = async () => {
        setIsSavingPlans(true);
        const success = await savePlansConfig(plans);
        if (success) {
            alert("Planes actualizados correctamente.");
        } else {
            alert("Error al guardar planes.");
        }
        setIsSavingPlans(false);
    };

    const handleAssignPlanToStudent = async (newPlanId: string) => {
        if (!currentStudentId) return;
        setIsAssigningPlan(true);

        const success = await assignPlanToStudent(currentStudentId, newPlanId);
        if (success) {
            setCurrentStudentPlanId(newPlanId);
            alert("Plan asignado correctamente.");
        } else {
            alert("Error al asignar plan.");
        }
        setIsAssigningPlan(false);
    };

    // CALCULATIONS
    const isToday = (dateString: string) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    const allInfractions = userRole === 'ADMIN' ? realInfractions : dailyInfractions;
    const todayInfractions = allInfractions.filter(i => isToday(i.timestamp));

    let latestFeedback = "";
    let parentMessage = "";
    let gaps: string[] = [];
    if (realAcademicData.length > 0) {
        const entry = realAcademicData[0];
        if (entry.feedback) latestFeedback = entry.feedback;
        if (entry.parent_message) parentMessage = entry.parent_message;
        if (entry.weaknesses) gaps = entry.weaknesses;
    }

    const remedialData = realAcademicData.find(r => r.remedial_plan);
    const remedialClasses = remedialData ? remedialData.remedial_plan : [];
    const remedialProgress = remedialClasses.length > 0
        ? Math.round((remedialClasses.filter((c: any) => c.status === 'completed').length / remedialClasses.length) * 100)
        : 0;

    const activePlan = plans.find(p => p.id === activePlanId);

    // --- RENDER ADMIN DASHBOARD ---
    if (userRole === 'ADMIN') {
        return (
            <div className="max-w-7xl mx-auto space-y-8 pb-20 font-sans">

                {/* ADMIN TAB SWITCHER */}
                <div className="flex gap-4 border-b border-stone-200 pb-2 overflow-x-auto">
                    <button
                        onClick={() => setAdminTab('DASHBOARD')}
                        className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${adminTab === 'DASHBOARD' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:bg-stone-100'}`}
                    >
                        <Users className="w-4 h-4" /> Estudiantes
                    </button>
                    <button
                        onClick={() => {
                            setAdminTab('REPORTS');
                            // Cargar reportes
                            setIsLoadingReports(true);
                            getSessionReportsForAdmin().then(reports => {
                                setSessionReports(reports);
                                setIsLoadingReports(false);
                            });
                        }}
                        className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${adminTab === 'REPORTS' ? 'bg-emerald-600 text-white' : 'text-stone-500 hover:bg-stone-100'}`}
                    >
                        <FileText className="w-4 h-4" /> Reportes Tutorías
                    </button>
                    <button
                        onClick={() => setAdminTab('MESSAGES')}
                        className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 relative whitespace-nowrap ${adminTab === 'MESSAGES' ? 'bg-indigo-600 text-white' : 'text-stone-500 hover:bg-stone-100'}`}
                    >
                        <Inbox className="w-4 h-4" /> Mensajes
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setAdminTab('PLANS_EDITOR')}
                        className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${adminTab === 'PLANS_EDITOR' ? 'bg-indigo-600 text-white' : 'text-stone-500 hover:bg-stone-100'}`}
                    >
                        <Layers className="w-4 h-4" /> Planes
                    </button>
                </div>

                {/* VIEW: REPORTS - Reportes de Tutorías con WhatsApp */}
                {adminTab === 'REPORTS' && (
                    <div className="animate-fade-in">
                        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-stone-100 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <FileText className="w-6 h-6" />
                                    Reportes de Tutorías Completadas
                                </h3>
                                <p className="opacity-80 text-sm mt-1">Envía los reportes a los padres por WhatsApp</p>
                            </div>

                            {isLoadingReports ? (
                                <div className="p-12 text-center">
                                    <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
                                    <p className="text-stone-500">Cargando reportes...</p>
                                </div>
                            ) : sessionReports.length === 0 ? (
                                <div className="p-12 text-center">
                                    <FileText className="w-16 h-16 text-stone-200 mx-auto mb-4" />
                                    <p className="text-stone-400 font-medium">No hay reportes de tutorías</p>
                                    <p className="text-stone-300 text-sm">Los reportes aparecerán aquí cuando los estudiantes completen sesiones</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-stone-100">
                                    {sessionReports.map((report, idx) => {
                                        const studentName = report.profiles?.name || 'Estudiante';
                                        const guardianPhone = report.profiles?.guardian_phone;
                                        const hasPhone = guardianPhone && guardianPhone.length >= 10;

                                        const whatsappLink = hasPhone ? generateWhatsAppLink(
                                            guardianPhone,
                                            studentName,
                                            {
                                                sessionTitle: report.lesson_title || 'Sesión de Tutoría',
                                                score: report.homework_score,
                                                feedback: report.feedback,
                                                date: report.completed_at ? new Date(report.completed_at).toLocaleDateString('es-CO') : 'Hoy'
                                            }
                                        ) : null;

                                        const teacherEmailLink = generateTeacherEmailLink(
                                            studentName,
                                            {
                                                sessionTitle: report.lesson_title || 'Sesión de Tutoría',
                                                score: report.homework_score,
                                                feedback: report.feedback,
                                                date: report.completed_at ? new Date(report.completed_at).toLocaleDateString('es-CO') : 'Hoy'
                                            }
                                        );

                                        return (
                                            <div key={idx} className="p-5 hover:bg-stone-50 transition-colors">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                                                            {studentName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-stone-800">{studentName}</h4>
                                                            <p className="text-sm text-stone-600">{report.lesson_title || 'Sesión de Tutoría'}</p>
                                                            <p className="text-xs text-stone-400 mt-1">
                                                                {report.completed_at ? new Date(report.completed_at).toLocaleString('es-CO') : ''}
                                                            </p>
                                                            {report.feedback && (
                                                                <div className="mt-2 bg-stone-50 rounded-lg p-2 text-xs text-stone-600 max-w-md">
                                                                    💬 {report.feedback.substring(0, 100)}{report.feedback.length > 100 ? '...' : ''}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        {report.homework_score !== null && report.homework_score !== undefined && (
                                                            <div className={`px-3 py-1 rounded-full text-sm font-bold ${report.homework_score >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                {report.homework_score}%
                                                            </div>
                                                        )}

                                                        <a
                                                            href={teacherEmailLink}
                                                            className="px-4 py-2 bg-indigo-500 text-white text-sm font-bold rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-sm w-full justify-center"
                                                        >
                                                            <Mail className="w-4 h-4" />
                                                            Enviar a Docente
                                                        </a>

                                                        {hasPhone ? (
                                                            <a
                                                                href={whatsappLink!}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 shadow-sm"
                                                            >
                                                                <MessageCircle className="w-4 h-4" />
                                                                Enviar a WhatsApp
                                                            </a>
                                                        ) : (
                                                            <span className="text-xs text-stone-400 bg-stone-100 px-3 py-1 rounded-lg">
                                                                Sin WhatsApp registrado
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* VIEW: MESSAGES INBOX */}
                {adminTab === 'MESSAGES' && (
                    <div className="animate-fade-in">
                        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-stone-100 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                                <h3 className="text-xl font-bold flex items-center gap-3">
                                    <Inbox className="w-6 h-6" />
                                    Bandeja de Mensajes
                                </h3>
                                <p className="opacity-80 text-sm mt-1">Tickets de soporte y mensajes de estudiantes</p>
                            </div>

                            {/* Reply Modal */}
                            {replyingTo && (
                                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                                        <div className="p-4 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                                            <h4 className="font-bold text-stone-800">Responder a {replyingTo.senderName}</h4>
                                            <button onClick={() => setReplyingTo(null)} className="text-stone-400 hover:text-stone-600">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="p-4">
                                            <div className="bg-stone-50 rounded-xl p-3 mb-4">
                                                <p className="text-xs text-stone-500 mb-1">Mensaje original:</p>
                                                <p className="text-sm text-stone-700">{replyingTo.content}</p>
                                            </div>
                                            <form onSubmit={handleReplyToMessage}>
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Escribe tu respuesta..."
                                                    className="w-full h-32 p-3 border border-stone-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2 mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setReplyingTo(null)}
                                                        className="px-4 py-2 text-stone-500 font-bold hover:bg-stone-100 rounded-lg"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={!replyText.trim() || isSendingMsg}
                                                        className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {isSendingMsg ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                        Enviar
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Messages List */}
                            <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
                                {adminMessages.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <MessageSquare className="w-16 h-16 text-stone-200 mx-auto mb-4" />
                                        <p className="text-stone-400 font-medium">No hay mensajes</p>
                                        <p className="text-stone-300 text-sm">Los tickets de soporte de estudiantes aparecerán aquí</p>
                                    </div>
                                ) : (
                                    adminMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`p-4 hover:bg-stone-50 transition-colors ${!msg.read ? 'bg-indigo-50/50 border-l-4 border-indigo-500' : ''}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${msg.type === 'SUPPORT_TICKET' ? 'bg-amber-500' : 'bg-indigo-500'}`}>
                                                    {(msg.senderName || 'S').charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-stone-800">{msg.senderName || 'Estudiante'}</span>
                                                            {!msg.read && (
                                                                <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">NUEVO</span>
                                                            )}
                                                            {msg.type === 'SUPPORT_TICKET' && (
                                                                <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">SOPORTE</span>
                                                            )}
                                                        </div>
                                                        <span className="text-xs text-stone-400">
                                                            {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-stone-600 mb-3">{msg.content}</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => setReplyingTo(msg)}
                                                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                                                        >
                                                            <Send className="w-3 h-3" /> Responder
                                                        </button>
                                                        {!msg.read && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(msg.id)}
                                                                className="px-3 py-1.5 bg-stone-100 text-stone-600 text-xs font-bold rounded-lg hover:bg-stone-200 flex items-center gap-1"
                                                            >
                                                                <CheckCircle2 className="w-3 h-3" /> Marcar leído
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: PLANS EDITOR */}
                {adminTab === 'PLANS_EDITOR' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
                        <div className="md:col-span-4 space-y-4">
                            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
                                <h3 className="font-bold text-stone-800 mb-4 flex justify-between items-center">
                                    Planes Disponibles
                                    <button onClick={handleCreatePlan} className="text-xs bg-stone-100 hover:bg-stone-200 p-2 rounded-lg text-stone-600 transition-colors"><Plus className="w-4 h-4" /></button>
                                </h3>
                                <div className="space-y-2">
                                    {plans.map(plan => (
                                        <button
                                            key={plan.id}
                                            onClick={() => setActivePlanId(plan.id)}
                                            className={`w-full text-left p-3 rounded-xl border transition-all ${activePlanId === plan.id
                                                ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-300'
                                                : 'bg-white border-stone-100 hover:bg-stone-50'
                                                }`}
                                        >
                                            <div className="font-bold text-stone-800 text-sm">{plan.name}</div>
                                            <div className="text-xs text-stone-500 truncate">{plan.description}</div>
                                            <div className="mt-2 text-[10px] text-indigo-600 font-bold bg-white/50 inline-block px-2 py-0.5 rounded border border-indigo-100">
                                                {plan.allowedViews.length} Herramientas
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-8">
                            {activePlan ? (
                                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8">
                                    <div className="flex justify-between items-start mb-6 border-b border-stone-100 pb-4">
                                        <div>
                                            <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Nombre del Plan</label>
                                            <input
                                                type="text"
                                                value={activePlan.name}
                                                onChange={(e) => updatePlanDetails('name', e.target.value)}
                                                className="text-2xl font-bold text-stone-800 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-indigo-500 focus:outline-none w-full"
                                            />
                                            <label className="block text-xs font-bold text-stone-400 uppercase mt-4 mb-1">Descripción</label>
                                            <input
                                                type="text"
                                                value={activePlan.description}
                                                onChange={(e) => updatePlanDetails('description', e.target.value)}
                                                className="text-sm text-stone-500 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-indigo-500 focus:outline-none w-full"
                                            />
                                        </div>
                                        <button
                                            onClick={saveAllPlans}
                                            disabled={isSavingPlans}
                                            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                                        >
                                            {isSavingPlans ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Guardar
                                        </button>
                                    </div>

                                    <h4 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                                        <Layout className="w-5 h-5 text-stone-400" />
                                        Menú & Herramientas Visibles
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {[
                                            { id: ViewState.DASHBOARD, label: 'Nuestra Esencia (Home)', desc: 'Siempre Activo' },
                                            { id: ViewState.SCHEDULE, label: 'Ruta de Aprendizaje', desc: 'Horario Inteligente' },
                                            { id: ViewState.CURRICULUM, label: 'Tutoría Inteligente', desc: 'Clases IA' },
                                            { id: ViewState.REPOSITORY, label: 'Mi Repositorio', desc: 'Tareas y PDFs' },
                                            { id: ViewState.PROGRESS, label: 'Progreso Estudiante', desc: 'Métricas Básicas' },
                                            { id: ViewState.AI_CONSULTANT, label: 'Asistente 24/7', desc: 'Chat Gemini' },
                                            { id: ViewState.METRICS, label: 'Resultados (KPIs)', desc: 'Gráficas Avanzadas' },
                                            { id: ViewState.CAREER, label: 'Career Pathfinder', desc: 'Orientación Vocacional' },
                                            { id: ViewState.FLASHCARDS, label: 'AI Flashcards', desc: 'Herramienta de Repaso' },
                                            { id: ViewState.SOCIAL, label: 'Arena Social', desc: 'Ranking y Duelos' },
                                            { id: ViewState.REWARDS, label: 'Tienda Nova', desc: 'Economía de Fichas' },
                                        ].map(item => (
                                            <label key={item.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${activePlan.allowedViews.includes(item.id) ? 'border-emerald-500 bg-emerald-50' : 'border-stone-100 bg-white hover:border-stone-300'}`}>
                                                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 ${activePlan.allowedViews.includes(item.id) ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-stone-300'}`}>
                                                    {activePlan.allowedViews.includes(item.id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={activePlan.allowedViews.includes(item.id)}
                                                    onChange={() => toggleViewInPlan(item.id)}
                                                />
                                                <div>
                                                    <span className={`font-bold text-sm block ${activePlan.allowedViews.includes(item.id) ? 'text-emerald-900' : 'text-stone-700'}`}>{item.label}</span>
                                                    <span className={`text-xs ${activePlan.allowedViews.includes(item.id) ? 'text-emerald-700' : 'text-stone-400'}`}>{item.desc}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-stone-400">Selecciona un plan para editar.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* VIEW: DASHBOARD */}
                {adminTab === 'DASHBOARD' && (
                    <>
                        {/* 1. STUDENT DOSSIER HEADER */}
                        <div className="bg-stone-900 rounded-3xl p-1 shadow-2xl">
                            <div className="bg-[#1c1917] rounded-[22px] p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
                                <div className="flex-1 w-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-stone-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Seleccionar Estudiante
                                        </h2>
                                        <div className="relative group z-20">
                                            <select
                                                value={currentStudentPlanId}
                                                onChange={(e) => handleAssignPlanToStudent(e.target.value)}
                                                className="appearance-none bg-stone-800 text-white text-xs font-bold py-1.5 pl-3 pr-8 rounded-lg border border-stone-600 hover:border-indigo-500 focus:outline-none cursor-pointer uppercase tracking-wide"
                                                disabled={isAssigningPlan}
                                            >
                                                {plans.map(p => (
                                                    <option key={p.id} value={p.id}>Plan: {p.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none" />
                                        </div>
                                    </div>

                                    <div className="relative group">
                                        <select
                                            value={currentStudentId}
                                            onChange={(e) => handleStudentSelect(e.target.value)}
                                            className="w-full appearance-none bg-stone-800 hover:bg-stone-700 border-2 border-stone-700 hover:border-indigo-500 text-white text-xl md:text-2xl font-bold py-4 pl-6 pr-12 rounded-2xl transition-all cursor-pointer outline-none focus:ring-4 focus:ring-indigo-500/20"
                                        >
                                            {isLoadingStudents ? <option>Cargando...</option> :
                                                students.map(s => <option key={s.uid} value={s.uid}>{s.name} ({s.email})</option>)
                                            }
                                        </select>
                                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-500 pointer-events-none group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. ACADEMIC MONITORING & MESSAGING */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">

                                {/* FLASH MESSAGE SENDER */}
                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                    <div className="relative z-10 flex items-start gap-4">
                                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                            <Bell className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-1">Mensaje Flash al Estudiante</h3>
                                            <p className="text-indigo-100 text-sm mb-4">Envía una alerta que aparecerá en su pantalla.</p>
                                            <form onSubmit={handleSendFlashMessage} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={flashMessage}
                                                    onChange={(e) => setFlashMessage(e.target.value)}
                                                    placeholder="Ej: Reinicia tu cámara por favor..."
                                                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-200 focus:outline-none focus:bg-white/20 transition-all"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={isSendingMsg || !flashMessage.trim()}
                                                    className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                                                >
                                                    {isSendingMsg ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                    Enviar
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
                                    <div className="px-8 py-6 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xl font-bold text-stone-800 flex items-center gap-3">
                                                <Brain className="w-6 h-6 text-indigo-600" />
                                                Progreso Académico
                                            </h3>
                                            <p className="text-stone-500 text-sm mt-1">Supervisión del plan de estudios.</p>
                                        </div>
                                        {remedialClasses.length > 0 && (
                                            <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-sm">
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-stone-400 uppercase">Nivelación IB</p>
                                                    <p className="text-lg font-black text-indigo-600 leading-none">{remedialProgress}%</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-8">
                                        {remedialClasses.length > 0 ? (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {remedialClasses.map((cls: any, idx: number) => {
                                                        const isCompleted = cls.status === 'completed';
                                                        return (
                                                            <div key={idx} className={`p-4 rounded-xl border-2 transition-all ${isCompleted ? 'bg-emerald-50 border-emerald-100 opacity-70' : 'bg-white border-stone-100 hover:border-indigo-200 hover:shadow-md'}`}>
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                                                                        {isCompleted ? 'Completado' : 'Pendiente'}
                                                                    </span>
                                                                    <span className="text-xs font-mono text-stone-400">{cls.duration}</span>
                                                                </div>
                                                                <h4 className={`font-bold text-sm mb-1 ${isCompleted ? 'text-stone-500 line-through' : 'text-stone-800'}`}>
                                                                    {cls.title}
                                                                </h4>
                                                                <p className="text-xs text-stone-400">{cls.topic}</p>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
                                                <GraduationCap className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                                                <p className="text-stone-500 font-medium mb-2">No hay plan de nivelación activo.</p>
                                                <p className="text-stone-400 text-sm mb-6">Asigna un plan para que el estudiante vea su curriculum personalizado.</p>
                                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                                    <button
                                                        onClick={handleAssignRemedial}
                                                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 justify-center"
                                                    >
                                                        <Brain className="w-4 h-4" />
                                                        Asignar Plan Matemáticas (4 semanas)
                                                    </button>
                                                    <button
                                                        onClick={() => handleAssignCustomPlan('Physics', [
                                                            { title: "Sesión 1: Cinemática", topic: "MRU y MRUV", duration: "25 min", status: "pending" },
                                                            { title: "Sesión 2: Dinámica", topic: "Leyes de Newton", duration: "25 min", status: "pending" },
                                                            { title: "Sesión 3: Evaluación", topic: "Quiz de física básica", duration: "25 min", status: "pending" }
                                                        ])}
                                                        className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors flex items-center gap-2 justify-center"
                                                    >
                                                        <Zap className="w-4 h-4" />
                                                        Asignar Plan Física (Demo)
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="space-y-6">
                                {/* HOMEWORK LOG */}
                                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                                    <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center gap-2">
                                        <FolderOpen className="w-5 h-5 text-indigo-600" />
                                        <h4 className="font-bold text-stone-800">Entregas Recientes</h4>
                                    </div>
                                    <div className="p-0">
                                        {homeworkSubmissions.length > 0 ? (
                                            <div className="divide-y divide-stone-100">
                                                {homeworkSubmissions.slice(0, 5).map((sub, idx) => (
                                                    <div key={idx} className="p-4 hover:bg-stone-50 transition-colors">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-stone-700 truncate max-w-[150px]">{sub.file_name}</p>
                                                                <p className="text-[10px] text-stone-400">{new Date(sub.timestamp).toLocaleString()}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-6 text-center">
                                                <p className="text-stone-400 text-sm">Sin entregas registradas.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* DISCIPLINE LOG */}
                                <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
                                    <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center gap-2">
                                        <ShieldAlert className="w-5 h-5 text-rose-600" />
                                        <h4 className="font-bold text-rose-900">Infracciones (Hoy)</h4>
                                    </div>
                                    <div className="p-4 h-40 overflow-y-auto">
                                        {todayInfractions.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-emerald-400 opacity-60">
                                                <ShieldCheck className="w-8 h-8 mb-2" />
                                                <span className="text-xs font-medium">Conducta Impecable</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {todayInfractions.map((inf, idx) => (
                                                    <div key={idx} className="bg-rose-50 p-2 rounded-lg border border-rose-100 flex gap-2">
                                                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                                        <div>
                                                            <p className="text-xs font-bold text-rose-800">{inf.type}</p>
                                                            <p className="text-[10px] text-rose-600">{inf.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // STUDENT VIEW
    if (userRole === 'STUDENT') {
        const [studentProgressData, setStudentProgressData] = useState<any>(null);
        const [isLoadingProgress, setIsLoadingProgress] = useState(true);

        useEffect(() => {
            const loadProgress = async () => {
                if (userId) {
                    setIsLoadingProgress(true);
                    const { getStudentProgressSummary, getStudentProgress } = await import('../services/supabase');
                    const summary = await getStudentProgressSummary(userId);
                    const sessions = await getStudentProgress(userId);
                    setStudentProgressData({ summary, sessions });
                    setIsLoadingProgress(false);
                }
            };
            loadProgress();
        }, [userId]);

        if (isLoadingProgress) {
            return (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
                        <p className="text-stone-500">Cargando tu progreso...</p>
                    </div>
                </div>
            );
        }

        const summary = studentProgressData?.summary;
        const sessions = studentProgressData?.sessions || [];

        return (
            <div className="max-w-4xl mx-auto space-y-8 pb-20 font-sans animate-fade-in">
                {/* HEADER */}
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-indigo-200 text-sm font-bold uppercase tracking-wider">
                            <TrendingUp className="w-4 h-4" /> Mi Progreso Académico
                        </div>
                        <h2 className="text-3xl font-black mb-2">¡Hola, {userName}!</h2>
                        <p className="text-indigo-100 opacity-90">Aquí puedes ver tu avance en el programa de nivelación.</p>
                    </div>
                </div>

                {/* STATS CARDS */}
                {summary ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl border border-stone-200 p-5 text-center shadow-sm">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <BookOpen className="w-6 h-6 text-indigo-600" />
                            </div>
                            <p className="text-3xl font-black text-stone-800">{summary.completedSessions}</p>
                            <p className="text-xs text-stone-500 font-medium">Sesiones Completadas</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-stone-200 p-5 text-center shadow-sm">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                            <p className="text-3xl font-black text-stone-800">{summary.totalSessions - summary.completedSessions}</p>
                            <p className="text-xs text-stone-500 font-medium">Sesiones Pendientes</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-stone-200 p-5 text-center shadow-sm">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Trophy className="w-6 h-6 text-emerald-600" />
                            </div>
                            <p className="text-3xl font-black text-stone-800">{summary.averageScore}%</p>
                            <p className="text-xs text-stone-500 font-medium">Promedio Tareas</p>
                        </div>
                        <div className={`rounded-2xl border p-5 text-center shadow-sm ${summary.canContinue ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${summary.canContinue ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                {summary.canContinue ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <Lock className="w-6 h-6 text-amber-600" />}
                            </div>
                            <p className={`text-lg font-black ${summary.canContinue ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {summary.canContinue ? '✅ Puedes Avanzar' : '⏳ En Progreso'}
                            </p>
                            <p className="text-xs text-stone-500 font-medium">Estado Actual</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 p-12 text-center">
                        <GraduationCap className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-stone-600 mb-2">Aún no tienes sesiones registradas</h3>
                        <p className="text-stone-400">Completa tu primera sesión en Tutoría Inteligente para ver tu progreso aquí.</p>
                    </div>
                )}

                {/* SESSIONS HISTORY */}
                {sessions.length > 0 && (
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-stone-100 bg-stone-50">
                            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                                <ListChecks className="w-5 h-5 text-indigo-600" />
                                Historial de Sesiones
                            </h3>
                        </div>
                        <div className="divide-y divide-stone-100">
                            {sessions.map((session: any, idx: number) => (
                                <div key={idx} className="p-5 hover:bg-stone-50 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {session.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-stone-800">{session.lesson_title || 'Sesión de Tutoría'}</h4>
                                                <p className="text-sm text-stone-500">{session.subject || 'Matemáticas'}</p>
                                                <p className="text-xs text-stone-400 mt-1">
                                                    {session.started_at ? new Date(session.started_at).toLocaleDateString('es-CO', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : ''}
                                                </p>
                                                {session.feedback && (
                                                    <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                                                        <p className="text-xs font-bold text-indigo-700 mb-1">������ Feedback del Tutor:</p>
                                                        <p className="text-sm text-indigo-900">{session.feedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            {session.homework_score !== null && session.homework_score !== undefined ? (
                                                <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${session.homework_score >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    Tarea: {session.homework_score}%
                                                </div>
                                            ) : (
                                                <span className="text-xs text-stone-400">Sin tarea</span>
                                            )}
                                            {session.time_spent_minutes && (
                                                <p className="text-xs text-stone-400 mt-1">
                                                    ⏱️ {session.time_spent_minutes} min
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {session.homework_score !== null && session.homework_score < 90 && (
                                        <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                            <p className="text-xs text-amber-700">
                                                Necesitas 90% o más en la tarea para desbloquear la siguiente sesión.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MOTIVATION MESSAGE */}
                {summary && summary.completedSessions > 0 && (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white text-center shadow-lg">
                        <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-90" />
                        <h3 className="text-xl font-bold mb-2">
                            {summary.averageScore >= 90 ? '¡Excelente trabajo!' : '¡Sigue adelante!'}
                        </h3>
                        <p className="text-emerald-100 text-sm">
                            {summary.averageScore >= 90
                                ? 'Estás dominando el material. ¡Continúa así!'
                                : 'Cada sesión te acerca más a tu meta. ¡No te rindas!'}
                        </p>
                    </div>
                )}
            </div>
        );
    }

    return null;
};

export default Progress;

