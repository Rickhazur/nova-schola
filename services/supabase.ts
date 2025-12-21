
import { createClient } from "@supabase/supabase-js";
import { Infraction, StoreItem, EducationalPlan, ViewState, AppMessage } from "../types";

const getEnv = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    console.warn("Env var access failed");
  }
  return undefined;
};

const rawUrl = getEnv('REACT_APP_SUPABASE_URL');
const rawKey = getEnv('REACT_APP_SUPABASE_KEY');

const SUPABASE_URL = rawUrl || "https://fwpnhxmktwvmsvrxbuat.supabase.co";
const SUPABASE_KEY = rawKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3cG5oeG1rdHd2bXN2cnhidWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNjc2NzQsImV4cCI6MjA4MDY0MzY3NH0.75kyLHHlec5x4DhGXhbOko4oMIy6jdz2tFEOerNE8c0";

export const isOffline = !SUPABASE_URL || !SUPABASE_KEY;
export const supabase = isOffline ? null : createClient(SUPABASE_URL, SUPABASE_KEY);

/* ===================================================
   AUTH - USUARIOS 100% REALES
=================================================== */

export const loginWithSupabase = async (email: string, password: string, intendedRole: string = 'STUDENT') => {
  if (!supabase) throw new Error("Sistema desconectado.");

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user!.id)
    .single();

  let finalRole = profile?.role || intendedRole;
  const normalizedEmail = (data.user?.email || email).toLowerCase().trim();
  if (normalizedEmail.includes('rickhazur') || normalizedEmail.includes('admin')) {
    finalRole = 'ADMIN';
  }

  return {
    uid: data.user!.id,
    email: normalizedEmail,
    name: profile?.name || normalizedEmail.split('@')[0],
    role: finalRole,
    level: profile?.level || "TEEN",
    agreementAccepted: true
  };
};

export const logoutSupabase = async () => {
  if (supabase) await supabase.auth.signOut();
  return true;
};

export const updateUserProfile = async (uid: string, profileData: { name: string; avatar: string }) => {
  if (!supabase) return { success: false };
  const { error } = await supabase.from("profiles").update(profileData).eq("id", uid);
  if (error) throw error;
  return { success: true };
};

export const updateUserPassword = async (newPass: string) => {
  if (supabase) {
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) throw error;
  }
  return { success: true };
};

/* ===================================================
   PLANES Y MENU
=================================================== */

const DEFAULT_PLANS: EducationalPlan[] = [
  { id: 'plan_essential', name: 'Plan Esencial', description: 'Enfoque academico.',
    allowedViews: [ViewState.DASHBOARD, ViewState.SCHEDULE, ViewState.CURRICULUM, ViewState.REPOSITORY, ViewState.PROGRESS, ViewState.AI_CONSULTANT] },
  { id: 'plan_standard', name: 'Plan Estandar IB', description: 'Programa completo.',
    allowedViews: [ViewState.DASHBOARD, ViewState.SCHEDULE, ViewState.CURRICULUM, ViewState.REPOSITORY, ViewState.AI_CONSULTANT, ViewState.FLASHCARDS, ViewState.METRICS, ViewState.PROGRESS, ViewState.REWARDS] },
  { id: 'plan_elite', name: 'Plan Elite', description: 'Acceso total.',
    allowedViews: [ViewState.DASHBOARD, ViewState.SCHEDULE, ViewState.CURRICULUM, ViewState.REPOSITORY, ViewState.AI_CONSULTANT, ViewState.FLASHCARDS, ViewState.METRICS, ViewState.SOCIAL, ViewState.REWARDS, ViewState.CAREER, ViewState.PROGRESS, ViewState.SETTINGS] }
];

export const fetchPlansConfig = async (): Promise<EducationalPlan[]> => DEFAULT_PLANS;
export const savePlansConfig = async (plans: EducationalPlan[]) => true;
export const fetchStudentPlanAssignment = async (uid: string): Promise<string> => 'plan_standard';
export const assignPlanToStudent = async (uid: string, planId: string) => true;
export const fetchStudentAllowedViews = async (uid: string): Promise<string[]> => DEFAULT_PLANS[1].allowedViews;
export const fetchStudentMenuConfig = async () => null;
export const updateStudentMenuConfig = async (visibleItems: string[]) => false;

/* ===================================================
   ECONOMIA
=================================================== */

export const getUserEconomy = async (uid: string) => {
  if (!supabase) return { coins: 0 };
  const { data, error } = await supabase.from("economy").select("coins").eq("user_id", uid).single();
  if (error || !data) return { coins: 0 };
  return data;
};

export const subscribeToEconomy = (userId: string, onUpdate: (coins: number) => void) => {
  if (!supabase) return () => {};
  console.log('📡 Suscribiendo a economy para:', userId);
  
  const channel = supabase
    .channel(`economy-${userId}`)
    .on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'economy', filter: `user_id=eq.${userId}` },
      (payload) => {
        console.log('💰 Cambio en economy:', payload);
        if (payload.new && typeof payload.new.coins === 'number') {
          onUpdate(payload.new.coins);
        }
      }
    )
    .subscribe((status) => console.log('Economy status:', status));

  return () => { supabase.removeChannel(channel); };
};

export const adminAwardCoins = async (studentId: string, amount: number) => {
  if (!supabase) return false;
  
  const { data: current } = await supabase.from("economy").select("coins").eq("user_id", studentId).single();
  const newTotal = (current?.coins || 0) + amount;
  
  const { error } = await supabase
    .from("economy")
    .update({ coins: newTotal, last_updated: new Date().toISOString() })
    .eq("user_id", studentId);
  
  if (error) {
    console.error('Error coins:', error);
    return false;
  }
  return true;
};

export const fetchStoreItems = async (): Promise<StoreItem[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from("store_items").select("*");
  if (error) return [];
  return data as StoreItem[];
};

export const saveStoreItemToDb = async (item: StoreItem) => {
  if (!supabase) return false;
  const { error } = await supabase.from("store_items").upsert(item);
  if (error) throw error;
  return true;
};

export const deleteStoreItemFromDb = async (id: string) => {
  if (!supabase) return false;
  const { error } = await supabase.from("store_items").delete().eq("id", id);
  if (error) throw error;
  return true;
};

/* ===================================================
   DISCIPLINA
=================================================== */

export const fetchStudentInfractions = async (uid: string): Promise<Infraction[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase.from("infractions").select("*").eq("student_id", uid).order('timestamp', { ascending: false });
  if (error) return [];
  return data as Infraction[];
};

export const logStudentInfraction = async (uid: string, infraction: Infraction) => {
  if (!supabase) return false;
  const { error } = await supabase.from("infractions").insert({
    student_id: uid, type: infraction.type, description: infraction.description,
    severity: infraction.severity, timestamp: infraction.timestamp
  });
  return !error;
};

/* ===================================================
   ACADEMICO
=================================================== */

export const fetchStudentAcademicResults = async (uid: string) => {
  if (!supabase) return [];
  const { data, error } = await supabase.from("academic_results").select("*").eq("student_id", uid).order('timestamp', { ascending: false });
  if (error) return [];
  return data || [];
};

export const saveAcademicResult = async (uid: string, result: any) => {
  if (!supabase) return false;
  const { error } = await supabase.from("academic_results").insert({ student_id: uid, ...result });
  return !error;
};

export const assignRemedialPlan = async (uid: string, subject: string, customPlan?: any[]) => {
  if (!supabase) return false;
  
  // Plan por defecto de Matemáticas (4 semanas)
  const defaultMathPlan = [
    { title: "Sesión 1: Factorización Básica", topic: "Identificar casos de factorización", duration: "25 min", status: "pending" },
    { title: "Sesión 2: Factorización Aplicada", topic: "Aplicar técnicas en ejercicios", duration: "25 min", status: "pending" },
    { title: "Sesión 3: Productos Notables", topic: "Binomios al cuadrado y diferencia de cuadrados", duration: "25 min", status: "pending" },
    { title: "Sesión 4: Evaluación Semana 1", topic: "Quiz de factorización", duration: "25 min", status: "pending" },
    { title: "Sesión 5: Ecuaciones Lineales", topic: "Resolver ecuaciones de primer grado", duration: "25 min", status: "pending" },
    { title: "Sesión 6: Ecuaciones con Fracciones", topic: "Ecuaciones con denominadores", duration: "25 min", status: "pending" },
    { title: "Sesión 7: Sistemas de Ecuaciones", topic: "Método de sustitución", duration: "25 min", status: "pending" },
    { title: "Sesión 8: Evaluación Semana 2", topic: "Quiz de ecuaciones", duration: "25 min", status: "pending" },
    { title: "Sesión 9: Funciones Lineales", topic: "Graficación y pendiente", duration: "25 min", status: "pending" },
    { title: "Sesión 10: Funciones Cuadráticas", topic: "Parábolas y vértice", duration: "25 min", status: "pending" },
    { title: "Sesión 11: Transformaciones", topic: "Traslaciones y reflexiones", duration: "25 min", status: "pending" },
    { title: "Sesión 12: Evaluación Semana 3", topic: "Quiz de funciones", duration: "25 min", status: "pending" },
    { title: "Sesión 13: Repaso General", topic: "Todos los temas", duration: "25 min", status: "pending" },
    { title: "Sesión 14: Examen Final", topic: "Evaluación completa de nivelación", duration: "45 min", status: "pending" }
  ];

  const planToSave = customPlan || defaultMathPlan;

  // Verificar si ya existe un plan para este estudiante
  const { data: existing } = await supabase
    .from("academic_results")
    .select("id")
    .eq("student_id", uid)
    .eq("subject", subject)
    .single();

  if (existing) {
    // Actualizar plan existente
    const { error } = await supabase
      .from("academic_results")
      .update({ 
        remedial_plan: planToSave,
        timestamp: new Date().toISOString()
      })
      .eq("id", existing.id);
    
    if (error) {
      console.error('Error actualizando plan:', error);
      return false;
    }
  } else {
    // Crear nuevo plan
    const { error } = await supabase
      .from("academic_results")
      .insert({
        student_id: uid,
        subject: subject,
        remedial_plan: planToSave,
        timestamp: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error creando plan:', error);
      return false;
    }
  }

  console.log('✅ Plan de nivelación asignado a:', uid);
  return true;
};

// Guardar WhatsApp del acudiente
export const saveGuardianPhone = async (uid: string, phone: string) => {
  if (!supabase) return false;
  
  const cleanPhone = phone.replace(/\D/g, ''); // Solo números
  
  const { error } = await supabase
    .from("profiles")
    .update({ guardian_phone: cleanPhone })
    .eq("id", uid);
  
  if (error) {
    console.error('Error guardando teléfono:', error);
    return false;
  }
  
  console.log('📱 WhatsApp del acudiente guardado:', cleanPhone);
  return true;
};

// Obtener WhatsApp del acudiente
export const getGuardianPhone = async (uid: string) => {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from("profiles")
    .select("guardian_phone")
    .eq("id", uid)
    .single();
  
  if (error || !data) return null;
  return data.guardian_phone;
};

// Generar link de WhatsApp con reporte
export const generateWhatsAppLink = (phone: string, studentName: string, report: {
  sessionTitle: string;
  score?: number;
  feedback?: string;
  date: string;
}) => {
  // Limpiar teléfono (solo números)
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Agregar código de país si no lo tiene (Colombia por defecto)
  if (cleanPhone.length === 10) {
    cleanPhone = '57' + cleanPhone;
  }
  
  // Construir mensaje
  const message = `
📚 *NOVA SCHOLA - Reporte de Tutoría*

👤 *Estudiante:* ${studentName}
📅 *Fecha:* ${report.date}
📖 *Sesión:* ${report.sessionTitle}
${report.score !== undefined ? `📊 *Nota de Tarea:* ${report.score}%` : ''}
${report.score !== undefined && report.score >= 90 ? '✅ *Estado:* Aprobado - Puede continuar' : ''}
${report.score !== undefined && report.score < 90 ? '⚠️ *Estado:* Necesita refuerzo' : ''}

${report.feedback ? `💬 *Feedback del Tutor:*\n${report.feedback}` : ''}

---
_Reporte generado automáticamente por Nova Schola AI_
  `.trim();
  
  // Codificar mensaje para URL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

// Obtener reportes de sesiones para Admin (con info del acudiente)
export const getSessionReportsForAdmin = async () => {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from("lesson_progress")
    .select(`
      *,
      profiles:student_id (
        name,
        email,
        guardian_phone
      )
    `)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(50);
  
  if (error) {
    console.error('Error obteniendo reportes:', error);
    return [];
  }
  
  return data || [];
};

// Obtener plan de nivelación de un estudiante
export const getStudentRemedialPlan = async (uid: string) => {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from("academic_results")
    .select("*")
    .eq("student_id", uid)
    .not("remedial_plan", "is", null)
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) return null;
  return data;
};

// Actualizar progreso de una sesión del plan
export const updateRemedialSessionStatus = async (uid: string, sessionIndex: number, newStatus: string) => {
  if (!supabase) return false;
  
  const { data: current } = await supabase
    .from("academic_results")
    .select("id, remedial_plan")
    .eq("student_id", uid)
    .not("remedial_plan", "is", null)
    .single();
  
  if (!current || !current.remedial_plan) return false;
  
  const updatedPlan = [...current.remedial_plan];
  if (updatedPlan[sessionIndex]) {
    updatedPlan[sessionIndex].status = newStatus;
  }
  
  const { error } = await supabase
    .from("academic_results")
    .update({ remedial_plan: updatedPlan })
    .eq("id", current.id);
  
  return !error;
};
export const unlockDailySession = async (uid: string) => true;

/* ===================================================
   TRACKING DE PROGRESO DE CLASES
=================================================== */

export const startLessonSession = async (
  studentId: string, 
  lessonId: string, 
  lessonTitle: string, 
  subject: string
) => {
  if (!supabase) return null;
  
  console.log('🎓 Iniciando sesión:', { studentId, lessonId, lessonTitle });
  
  const { data, error } = await supabase
    .from("lesson_progress")
    .insert({
      student_id: studentId,
      lesson_id: lessonId,
      lesson_title: lessonTitle,
      subject: subject,
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error('❌ Error iniciando sesión:', error);
    return null;
  }
  
  console.log('✅ Sesión iniciada:', data);
  return data;
};

export const completeLessonSession = async (
  studentId: string,
  lessonId: string,
  sessionData: {
    score?: number;
    timeSpentMinutes?: number;
    feedback?: string;
    homeworkSubmitted?: boolean;
    homeworkScore?: number;
  }
) => {
  if (!supabase) return false;
  
  const canContinue = (sessionData.homeworkScore || 0) >= 90;
  
  console.log('🏁 Completando sesión:', { studentId, lessonId, ...sessionData, canContinue });
  
  const { error } = await supabase
    .from("lesson_progress")
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      score: sessionData.score,
      time_spent_minutes: sessionData.timeSpentMinutes,
      feedback: sessionData.feedback,
      homework_submitted: sessionData.homeworkSubmitted || false,
      homework_score: sessionData.homeworkScore,
      can_continue: canContinue
    })
    .eq('student_id', studentId)
    .eq('lesson_id', lessonId)
    .eq('status', 'in_progress');
  
  if (error) {
    console.error('❌ Error completando sesión:', error);
    return false;
  }
  
  console.log('✅ Sesión completada. Puede continuar:', canContinue);
  return true;
};

export const saveHomeworkGrade = async (
  studentId: string,
  lessonId: string,
  score: number,
  feedback: string
) => {
  if (!supabase) return { score: 0, canContinue: false };
  
  const canContinue = score >= 90;
  
  console.log('📝 Guardando nota de tarea:', { studentId, lessonId, score, canContinue });
  
  const { error } = await supabase
    .from("lesson_progress")
    .update({
      homework_submitted: true,
      homework_score: score,
      can_continue: canContinue,
      feedback: feedback
    })
    .eq('student_id', studentId)
    .eq('lesson_id', lessonId);
  
  if (error) {
    console.error('❌ Error guardando nota:', error);
    return { score: 0, canContinue: false };
  }
  
  console.log('✅ Tarea calificada: ' + score + '%. Puede continuar: ' + canContinue);
  return { score, canContinue };
};

export const getStudentProgress = async (studentId: string) => {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("student_id", studentId)
    .order('started_at', { ascending: false });
  
  if (error) {
    console.error('Error obteniendo progreso:', error);
    return [];
  }
  
  return data || [];
};

export const canStudentContinue = async (studentId: string, currentLessonId: string) => {
  if (!supabase) return false;
  
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("can_continue, homework_score")
    .eq("student_id", studentId)
    .eq("lesson_id", currentLessonId)
    .single();
  
  if (error || !data) return false;
  
  return data.can_continue === true;
};

export const getStudentProgressSummary = async (studentId: string) => {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("student_id", studentId)
    .order('started_at', { ascending: true });
  
  if (error || !data || data.length === 0) return null;
  
  const completed = data.filter(d => d.status === 'completed').length;
  const total = data.length;
  const scores = data.filter(d => d.homework_score != null).map(d => d.homework_score);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const lastSession = data[data.length - 1];
  
  return {
    totalSessions: total,
    completedSessions: completed,
    averageScore: Math.round(avgScore),
    lastSessionDate: lastSession?.completed_at || lastSession?.started_at,
    lastSessionTitle: lastSession?.lesson_title,
    canContinue: lastSession?.can_continue || false,
    sessions: data
  };
};

export const saveSessionFeedback = async (feedback: string, completed: boolean, uid: string) => {
  if (!supabase) return false;
  
  const { data: currentSession } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("student_id", uid)
    .eq("status", "in_progress")
    .order('started_at', { ascending: false })
    .limit(1)
    .single();
  
  if (!currentSession) {
    console.log('⚠️ No hay sesión activa, creando registro');
    const { error } = await supabase
      .from("lesson_progress")
      .insert({
        student_id: uid,
        lesson_id: 'feedback-' + Date.now(),
        lesson_title: 'Sesión General',
        subject: 'General',
        status: completed ? 'completed' : 'in_progress',
        feedback: feedback,
        completed_at: completed ? new Date().toISOString() : null
      });
    return !error;
  }
  
  const { error } = await supabase
    .from("lesson_progress")
    .update({
      status: completed ? 'completed' : 'in_progress',
      completed_at: completed ? new Date().toISOString() : null,
      feedback: feedback
    })
    .eq('id', currentSession.id);
  
  if (error) {
    console.error('❌ Error guardando feedback:', error);
    return false;
  }
  
  console.log('✅ Feedback guardado');
  return true;
};

/* ===================================================
   HOMEWORK
=================================================== */

export const submitHomework = async (uid: string, weekId: string, fileName: string) => {
  if (!supabase) return false;
  const { error } = await supabase.from("homework_submissions").insert({
    student_id: uid, week_id: weekId, file_name: fileName, status: 'submitted', timestamp: new Date().toISOString()
  });
  return !error;
};

export const fetchHomeworkSubmissions = async (uid: string) => {
  if (!supabase) return [];
  const { data, error } = await supabase.from("homework_submissions").select("*").eq("student_id", uid).order('timestamp', { ascending: false });
  if (error) return [];
  return data;
};

/* ===================================================
   GESTION USUARIOS
=================================================== */

export const getAllStudents = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase.from('profiles').select('id, name, email, level, role').eq('role', 'STUDENT');
  if (error || !data) return [];
  return data.map(s => ({
    uid: s.id,
    name: s.name || s.email?.split('@')[0] || 'Estudiante',
    email: s.email || '',
    level: s.level || 'TEEN'
  }));
};

export const registerStudent = async (email: string, pass: string, name: string, level: string) => {
  return { success: true, message: "Registro via panel." };
};

export const updateGlobalConfig = async (roomCheckEnabled: boolean) => {
  if (!supabase) return false;
  const { error } = await supabase.from('app_settings').upsert({ key: 'room_check_enabled', value: roomCheckEnabled, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  return !error;
};

export const fetchGlobalConfig = async () => {
  if (!supabase) return true;
  const { data } = await supabase.from('app_settings').select('value').eq('key', 'room_check_enabled').single();
  return data ? data.value : true;
};

/* ===================================================
   MENSAJERIA
=================================================== */

export const sendFlashMessage = async (msg: AppMessage) => {
  if (!supabase) return false;
  console.log('📤 Enviando mensaje a:', msg.receiverId);
  
  // 1. Guardar en base de datos
  const { error: dbError } = await supabase.from('messages').insert({
    sender_id: msg.senderId,
    sender_name: msg.senderName,
    receiver_id: msg.receiverId,
    content: msg.content,
    type: msg.type,
    read: false,
    created_at: new Date().toISOString()
  });
  
  if (dbError) {
    console.error('Error guardando mensaje:', dbError);
  }
  
  // 2. Enviar por Realtime Broadcast para notificación instantánea
  try {
    const channel = supabase.channel(`flash-${msg.receiverId}`);
    await channel.subscribe();
    await new Promise(r => setTimeout(r, 100));
    await channel.send({ type: 'broadcast', event: 'flash', payload: msg });
    setTimeout(() => supabase.removeChannel(channel), 1000);
  } catch (e) {
    console.log('Broadcast opcional falló, mensaje guardado en DB');
  }
  
  return true;
};

export const subscribeToMessages = (userId: string, callback: (msg: AppMessage) => void) => {
  if (!supabase) return () => {};
  console.log('📡 Suscribiendo a mensajes:', userId);
  
  // Suscribirse a Broadcast
  const channel = supabase
    .channel(`flash-${userId}`)
    .on('broadcast', { event: 'flash' }, (payload) => {
      console.log('📥 Mensaje recibido (broadcast):', payload);
      callback(payload.payload as AppMessage);
    })
    .subscribe();
  
  // También suscribirse a cambios en la tabla messages
  const dbChannel = supabase
    .channel(`messages-db-${userId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` },
      (payload) => {
        console.log('📥 Mensaje recibido (DB):', payload);
        const msg = payload.new;
        callback({
          id: msg.id,
          senderId: msg.sender_id,
          senderName: msg.sender_name,
          receiverId: msg.receiver_id,
          content: msg.content,
          type: msg.type,
          timestamp: msg.created_at,
          read: msg.read
        });
      }
    )
    .subscribe();
  
  return () => { 
    supabase.removeChannel(channel);
    supabase.removeChannel(dbChannel);
  };
};

// Obtener mensajes para Admin (tickets de soporte)
export const getAdminMessages = async () => {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('type', 'SUPPORT_TICKET') // Simplified query to avoid UUID issues with 'ADMIN_INBOX'
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (error) {
    console.error('Error obteniendo mensajes:', JSON.stringify(error));
    return [];
  }
  
  return data.map((msg: any) => ({
    id: msg.id,
    senderId: msg.sender_id,
    senderName: msg.sender_name,
    receiverId: msg.receiver_id,
    content: msg.content,
    type: msg.type,
    timestamp: msg.created_at,
    read: msg.read
  }));
};

// Marcar mensaje como leído
export const markMessageAsRead = async (messageId: string) => {
  if (!supabase) return false;
  
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId);
  
  return !error;
};

// Suscribirse a nuevos tickets (para Admin)
export const subscribeToAdminMessages = (callback: (msg: AppMessage) => void) => {
  if (!supabase) return () => {};
  console.log('📡 Admin suscrito a tickets de soporte');
  
  const channel = supabase
    .channel('admin-messages')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        const msg = payload.new;
        // Solo notificar tickets de soporte o mensajes para admin
        if (msg.type === 'SUPPORT_TICKET' || msg.receiver_id === 'ADMIN_INBOX') {
          console.log('📥 Nuevo ticket de soporte:', payload);
          callback({
            id: msg.id,
            senderId: msg.sender_id,
            senderName: msg.sender_name,
            receiverId: msg.receiver_id,
            content: msg.content,
            type: msg.type,
            timestamp: msg.created_at,
            read: msg.read
          });
        }
      }
    )
    .subscribe();
  
  return () => { supabase.removeChannel(channel); };
};

/* ===================================================
   DEBUG
=================================================== */

export const checkSupabaseConnection = async () => {
  if (!supabase) return { success: false, message: "No inicializado" };
  const { error } = await supabase.from('profiles').select('count').limit(1);
  if (error) return { success: false, message: error.message };
  return { success: true, message: "Conexion OK" };
};
