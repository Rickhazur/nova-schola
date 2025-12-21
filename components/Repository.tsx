import React, { useState, useRef, useEffect } from 'react';
import { FolderOpen, FileText, Upload, CheckCircle2, AlertCircle, Eye, Download, Camera, Clock, ChevronDown, ChevronUp, Users, Loader2 } from 'lucide-react';
import { getAllStudents, fetchHomeworkSubmissions, submitHomework, supabase } from '../services/supabase';

interface RepositoryProps {
  studentName: string;
  onUploadHomework: (file: File) => void;
  userRole?: 'STUDENT' | 'ADMIN';
}

const REPOSITORY_DATA = [
  {
    id: 'week-1',
    title: 'Semana 1: Factorización',
    status: 'active',
    files: [
      { id: 's1-1', name: 'S1_Sesion1_Factorizacion_Identificar.pdf', type: 'practice', status: 'pending' },
      { id: 's1-2', name: 'S1_Sesion2_Factorizacion_Aplicar.pdf', type: 'practice', status: 'pending' },
      { id: 's1-3', name: 'S1_Sesion3_Factorizacion_Especiales.pdf', type: 'evaluation', status: 'pending_upload' }
    ]
  },
  {
    id: 'week-2',
    title: 'Semana 2: Ecuaciones Cuadráticas',
    status: 'locked',
    files: [
      { id: 's2-1', name: 'S2_Sesion1_Cuadraticas_Identificar.pdf', type: 'practice', status: 'locked' },
      { id: 's2-2', name: 'S2_Sesion2_Cuadraticas_Discriminante.pdf', type: 'practice', status: 'locked' },
      { id: 's2-3', name: 'S2_Sesion3_Cuadraticas_Resolver.pdf', type: 'evaluation', status: 'locked' }
    ]
  },
  {
    id: 'week-3',
    title: 'Semana 3: Sistemas de Ecuaciones 2x2',
    status: 'locked',
    files: [
      { id: 's3-1', name: 'S3_Sesion1_Sistemas_Despejar.pdf', type: 'practice', status: 'locked' },
      { id: 's3-2', name: 'S3_Sesion2_Sistemas_Resolver.pdf', type: 'practice', status: 'locked' },
      { id: 's3-3', name: 'S3_Sesion3_Sistemas_Problemas.pdf', type: 'evaluation', status: 'locked' }
    ]
  }
];

// Helper to sanitize text for PDF
const removeAccents = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const FILE_CONTENT: {[key: string]: { title: string, lines: string[] }} = {
    'S1_Sesion1_Factorizacion_Identificar.pdf': {
        title: "NOVA SCHOLA - Nivelacion IB: Semana 1 Sesion 1",
        lines: [
            "Tema: Factorizacion - Identificar Diferencia de Cuadrados",
            "RECUERDA: a² - b² = (a + b)(a - b)",
            "EJEMPLO: x² - 16 = (x + 4)(x - 4)",
            "PRACTICA: 1. x² - 9 =, 2. x² - 25 =, 3. x² - 49 ="
        ]
    },
    'S1_Sesion2_Factorizacion_Aplicar.pdf': {
        title: "NOVA SCHOLA - Nivelacion IB: Semana 1 Sesion 2",
        lines: [
            "Tema: Factorizacion - Aplicar con Coeficientes",
            "EJEMPLO: 4x² - 25 = (2x + 5)(2x - 5)",
            "PRACTICA: 1. 9x² - 16 =, 2. 16x² - 49 ="
        ]
    },
    'S1_Sesion3_Factorizacion_Especiales.pdf': {
        title: "NOVA SCHOLA - Nivelacion Matematicas IB",
        lines: [
            "Estudiante: Samuel Torres",
            "Semana 1 - Sesion 3 | Viernes",
            "Tema: Factorizacion - Casos Especiales + Evaluacion",
            "",
            "* CASOS ESPECIALES",
            "  - Con dos variables: 9a² - 4b² = (3a + 2b)(3a - 2b)",
            "",
            "* EVALUACION SEMANAL - Factorizacion",
            "E1. x² - 49 =",
            "E2. x² - 144 =",
            "E3. 4x² - 81 ="
        ]
    }
};

const Repository: React.FC<RepositoryProps> = ({ studentName, onUploadHomework, userRole = 'STUDENT' }) => {
  const [expandedWeek, setExpandedWeek] = useState<string>('week-1');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  
  // Real DB State
  const [dbSubmissions, setDbSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ADMIN STATE
  const [students, setStudents] = useState<any[]>([]);
  const [currentStudentId, setCurrentStudentId] = useState<string>('');
  const [currentStudentName, setCurrentStudentName] = useState(studentName);

  useEffect(() => {
    const init = async () => {
        if (userRole === 'ADMIN') {
            const data = await getAllStudents();
            setStudents(data);
            if (data.length > 0) {
                setCurrentStudentId(data[0].uid);
                setCurrentStudentName(data[0].name);
            }
        } else {
            // Get current user ID from Supabase session if student
            const { data } = await supabase?.auth.getSession() || { data: { session: null } };
            if (data.session) setCurrentStudentId(data.session.user.id);
        }
    };
    init();
  }, [userRole]);

  useEffect(() => {
      if (currentStudentId) {
          loadSubmissions(currentStudentId);
      }
  }, [currentStudentId]);

  const loadSubmissions = async (uid: string) => {
      setIsLoading(true);
      const subs = await fetchHomeworkSubmissions(uid);
      setDbSubmissions(subs || []);
      setIsLoading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, fileId: string, weekId: string, fileName: string) => {
    const file = e.target.files?.[0];
    if (file && currentStudentId) {
      setUploadingId(fileId);
      
      // 1. Upload logic (Simulated DB persistence for now as we don't have Storage buckets setup in script)
      // We save the METADATA to the DB so the Admin sees it.
      const success = await submitHomework(currentStudentId, weekId, fileName);
      
      if (success) {
          // 2. Local State Update
          onUploadHomework(file); // For Live Class usage
          await loadSubmissions(currentStudentId); // Refresh list
          alert(`Tarea subida correctamente.`);
      } else {
          alert("Error al guardar en base de datos.");
      }
      setUploadingId(null);
    }
  };

  const generatePDF = (fileName: string): Blob => {
      const content = FILE_CONTENT[fileName] || {
          title: "GUIA DE PRACTICA GENERICO",
          lines: ["1. Ejercicio de prueba 1", "2. Ejercicio de prueba 2"]
      };

      const title = removeAccents(content.title);
      const pdfHeader = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj <</Length 5000>> stream
BT
/F1 14 Tf
50 750 Td
20 TL
(${title}) Tj
T*
T*
/F1 10 Tf
12 TL
`;
      let pdfBody = "";
      content.lines.forEach(line => {
          let safeLine = removeAccents(line).replace(/\(/g, '\\(').replace(/\)/g, '\\)');
          safeLine = safeLine.replace(/²/g, ') Tj 4 Ts (2) Tj 0 Ts (');
          pdfBody += `(${safeLine}) Tj\nT*\n`;
      });

      const pdfFooter = `ET
endstream endobj
5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000157 00000 n 
0000000300 00000 n 
0000000450 00000 n 
trailer <</Size 6 /Root 1 0 R>>
startxref
550
%%EOF`;
      return new Blob([pdfHeader + pdfBody + pdfFooter], { type: 'application/pdf' });
  };

  const handleDownload = (fileName: string) => {
      const blob = generatePDF(fileName);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 100);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-widest text-xs mb-2">
             <FolderOpen className="w-4 h-4" /> Repositorio Digital
          </div>
          <h2 className="text-3xl font-bold text-stone-800">
            {userRole === 'ADMIN' ? 'Gestión de Evidencias' : 'Carpeta de Evidencias'}
          </h2>
          <p className="text-stone-500 mt-1">
            {userRole === 'ADMIN' 
                ? `Viendo repositorio de: ${currentStudentName}`
                : 'Descarga tus guías y sube tus ejercicios resueltos para revisión.'}
          </p>
        </div>
        
        {userRole === 'ADMIN' && (
            <div className="w-full md:w-64">
                <label className="text-xs font-bold text-stone-400 uppercase mb-1 block flex items-center gap-1"><Users className="w-3 h-3" /> Seleccionar Estudiante</label>
                <div className="relative">
                    <select 
                        className="w-full appearance-none bg-stone-100 border border-stone-200 text-stone-700 py-2 pl-4 pr-10 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                        onChange={(e) => {
                             const s = students.find(st => st.uid === e.target.value);
                             setCurrentStudentId(e.target.value);
                             setCurrentStudentName(s?.name || '');
                        }}
                        value={currentStudentId}
                    >
                        {students.map((s) => (
                            <option key={s.uid} value={s.uid}>{s.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
                </div>
            </div>
        )}
      </header>

      {/* ALERT BOX */}
      {userRole === 'STUDENT' && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <AlertCircle className="w-6 h-6" />
            </div>
            <div>
                <h4 className="font-bold text-amber-800">Instrucción Importante</h4>
                <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                    Debes subir la foto de tu trabajo (procedimiento completo) antes de la siguiente sesión. 
                    El <strong>Tutor Virtual</strong> analizará tu imagen para corregir errores.
                </p>
            </div>
        </div>
      )}

      {/* FILE LIST */}
      <div className="space-y-4">
          {REPOSITORY_DATA.map((week) => (
              <div key={week.id} className={`bg-white rounded-2xl border transition-all overflow-hidden ${week.status === 'active' ? 'border-indigo-200 shadow-sm' : 'border-stone-100 opacity-80'}`}>
                  <div 
                    onClick={() => setExpandedWeek(expandedWeek === week.id ? '' : week.id)}
                    className={`p-5 flex items-center justify-between cursor-pointer ${week.status === 'active' ? 'bg-indigo-50/50 hover:bg-indigo-50' : 'bg-stone-50'}`}
                  >
                      <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${week.status === 'active' ? 'bg-indigo-100 text-indigo-600' : 'bg-stone-200 text-stone-400'}`}>
                              <Clock className="w-5 h-5" />
                          </div>
                          <h3 className={`font-bold text-lg ${week.status === 'active' ? 'text-indigo-900' : 'text-stone-500'}`}>
                              {week.title}
                          </h3>
                      </div>
                      <div className="text-stone-400">
                          {expandedWeek === week.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                  </div>

                  {expandedWeek === week.id && (
                      <div className="p-5 border-t border-stone-100 space-y-3">
                          {week.files.map((file) => {
                              // Check if file is submitted in DB
                              const submission = dbSubmissions.find((s: any) => s.file_name === file.name && s.week_id === week.id);
                              const isUploaded = !!submission;
                              const isLocked = file.status === 'locked';

                              return (
                                  <div key={file.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100 gap-4">
                                      <div className="flex items-center gap-3 overflow-hidden">
                                          <div className="bg-white p-2 rounded-lg border border-stone-200 text-rose-500 shrink-0">
                                              <FileText className="w-6 h-6" />
                                          </div>
                                          <div className="min-w-0">
                                              <p className={`font-bold text-sm truncate ${isLocked ? 'text-stone-400' : 'text-stone-700'}`}>{file.name}</p>
                                              <div className="flex items-center gap-2">
                                                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                                      file.type === 'evaluation' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-stone-200 text-stone-500 border-stone-300'
                                                  }`}>
                                                      {file.type === 'evaluation' ? 'Evaluación' : 'Práctica'}
                                                  </span>
                                                  {isUploaded && (
                                                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                                          <Clock className="w-3 h-3" /> 
                                                          {new Date(submission.timestamp).toLocaleDateString()}
                                                      </span>
                                                  )}
                                              </div>
                                          </div>
                                      </div>

                                      <div className="flex items-center gap-2 w-full md:w-auto">
                                          <button 
                                              type="button"
                                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownload(file.name); }}
                                              disabled={isLocked} 
                                              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-600 hover:bg-stone-50 hover:text-stone-800 disabled:opacity-50 transition-colors"
                                          >
                                              <Download className="w-4 h-4" /> PDF
                                          </button>

                                          {isUploaded ? (
                                              <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200">
                                                  <CheckCircle2 className="w-4 h-4" /> Enviado
                                              </div>
                                          ) : (
                                              <button 
                                                  type="button"
                                                  onClick={(e) => {
                                                      e.preventDefault();
                                                      e.stopPropagation();
                                                      (fileInputRef.current as any).currentFileId = file.id; 
                                                      (fileInputRef.current as any).currentWeekId = week.id;
                                                      (fileInputRef.current as any).currentFileName = file.name;
                                                      fileInputRef.current?.click();
                                                  }}
                                                  disabled={isLocked || uploadingId === file.id}
                                                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:bg-stone-300 transition-colors shadow-sm"
                                              >
                                                  {uploadingId === file.id ? (
                                                      <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin"/> Subiendo...</span>
                                                  ) : (
                                                      <>
                                                          <Camera className="w-4 h-4" /> {userRole === 'ADMIN' ? 'Subir Manualmente' : 'Subir Evidencia'}
                                                      </>
                                                  )}
                                              </button>
                                          )}
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  )}
              </div>
          ))}
      </div>

      <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={(e) => {
              const ref = fileInputRef.current as any;
              handleFileSelect(e, ref.currentFileId, ref.currentWeekId, ref.currentFileName);
          }}
      />
    </div>
  );
};

export default Repository;