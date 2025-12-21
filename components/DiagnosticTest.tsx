
import React, { useState, useRef, useEffect } from 'react';
import { Calculator, CheckCircle2, ChevronRight, Brain, AlertTriangle, ArrowRight, BookOpen, Layout, Zap, Camera, Upload, RefreshCw } from 'lucide-react';
import { evaluateMathDiagnostic } from '../services/openai';
import { ViewState } from '../types';
import ReactMarkdown from 'react-markdown';

interface DiagnosticTestProps {
  studentName: string;
  onFinish: (view: ViewState, data?: any) => void;
}

// 25 Questions covering Grade 8 & 9 (Algebra, Geometry, Pre-Trig)
const QUESTIONS = [
  // --- Nivel 1: Aritmética y Conceptos Básicos ---
  { id: 1, text: "Calcula: -5 + (-3) - 4", options: ["-12", "-6", "2", "-4"], correct: "-12" },
  { id: 2, text: "¿Cuál es el valor de 3⁴?", options: ["12", "81", "27", "64"], correct: "81" },
  { id: 3, text: "Simplifica: √144", options: ["14", "11", "12", "13"], correct: "12" },
  { id: 4, text: "Orden de operaciones: 10 - 2 × 3 + 4", options: ["28", "8", "16", "32"], correct: "8" },
  { id: 5, text: "Convierte 0.75 a fracción simplificada", options: ["3/4", "4/5", "7/5", "2/3"], correct: "3/4" },

  // --- Nivel 2: Álgebra Básica (Grado 8) ---
  { id: 6, text: "Si 2x + 5 = 15, halla x", options: ["2", "5", "10", "7.5"], correct: "5" },
  { id: 7, text: "Simplifica: 3(x + 2) - 4", options: ["3x + 2", "3x + 6", "3x - 2", "3x + 10"], correct: "3x + 2" },
  { id: 8, text: "Halla la pendiente de y = -2x + 4", options: ["4", "2", "-2", "x"], correct: "-2" },
  { id: 9, text: "Resuelve para y: 2y/3 = 4", options: ["6", "12", "8", "2"], correct: "6" },
  { id: 10, text: "¿Cuál par es solución de y = x + 1?", options: ["(2,3)", "(3,2)", "(1,1)", "(0,0)"], correct: "(2,3)" },

  // --- Nivel 3: Álgebra Intermedia (Grado 9) ---
  { id: 11, text: "Factoriza: x² - 9", options: ["(x-3)(x+3)", "(x-9)(x+1)", "(x-3)²", "(x+3)²"], correct: "(x-3)(x+3)" },
  { id: 12, text: "Expande: (x + 2)(x + 3)", options: ["x² + 5x + 6", "x² + 6x + 5", "x² + 6", "2x + 5"], correct: "x² + 5x + 6" },
  { id: 13, text: "Resuelve el sistema: x + y = 10, x - y = 2", options: ["(6,4)", "(5,5)", "(8,2)", "(7,3)"], correct: "(6,4)" },
  { id: 14, text: "Factoriza: x² + 4x + 4", options: ["(x+2)(x-2)", "(x+2)²", "(x+4)²", "x(x+4)"], correct: "(x+2)²" },
  { id: 15, text: "Soluciones de: x² - 5x + 6 = 0", options: ["2 y 3", "-2 y -3", "1 y 6", "-1 y 6"], correct: "2 y 3" },

  // --- Nivel 4: Geometría Plana ---
  { id: 16, text: "Área de un triángulo base=4, altura=3", options: ["12", "6", "7", "14"], correct: "6" },
  { id: 17, text: "Perímetro de un rectángulo de 5x3", options: ["15", "8", "16", "12"], correct: "16" },
  { id: 18, text: "Área de un círculo radio 3 (usa π≈3.14)", options: ["28.26", "18.84", "9.42", "6"], correct: "28.26" },
  { id: 19, text: "Suma de ángulos internos de un triángulo", options: ["360°", "90°", "180°", "270°"], correct: "180°" },
  { id: 20, text: "¿Qué es un triángulo isósceles?", options: ["3 lados iguales", "2 lados iguales", "0 lados iguales", "Tiene ángulo recto"], correct: "2 lados iguales" },

  // --- Nivel 5: Pre-Trigonometría y Avanzado ---
  { id: 21, text: "Teorema de Pitágoras: a=3, b=4, c=?", options: ["5", "6", "7", "25"], correct: "5" },
  { id: 22, text: "En un triángulo rectángulo, sin(θ) es:", options: ["Opuesto/Adyacente", "Adyacente/Hipotenusa", "Opuesto/Hipotenusa", "Hipotenusa/Opuesto"], correct: "Opuesto/Hipotenusa" },
  { id: 23, text: "Hipotenusa si catetos son 5 y 12", options: ["13", "17", "15", "10"], correct: "13" },
  { id: 24, text: "Si un ángulo mide 90°, es un ángulo...", options: ["Agudo", "Obtuso", "Recto", "Llano"], correct: "Recto" },
  { id: 25, text: "Volumen de cubo lado 3", options: ["9", "18", "27", "81"], correct: "27" }
];

const DiagnosticTest: React.FC<DiagnosticTestProps> = ({ studentName, onFinish }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Camera State for "Show Your Work"
  const [showCameraStep, setShowCameraStep] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [workImage, setWorkImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCameraStep) {
      startCamera();
    }
    return () => stopCamera();
  }, [showCameraStep]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("Camera error", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      const ctx = canvasRef.current.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const base64 = canvasRef.current.toDataURL('image/jpeg');
      setWorkImage(base64);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWorkImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [QUESTIONS[currentQuestion].id]: option }));
  };

  const nextQuestion = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowCameraStep(true); // Go to Camera Step instead of submitting immediately
    }
  };

  const submitTest = async () => {
    setIsSubmitting(true);
    const payload = QUESTIONS.map(q => ({
      question: q.text,
      selected: answers[q.id] || "No Respondida",
      correct: q.correct
    }));

    // AI Analysis + Curriculum Generation (Sending Image if available)
    const aiResult = await evaluateMathDiagnostic(studentName, payload, workImage || undefined);
    setResult(aiResult);
    setIsSubmitting(false);
  };

  const handleStartRemedial = () => {
    // Construct a valid Subject object from the AI result
    const remedialSubject = {
      id: 'remedial-math',
      name: '🚨 NIVELACIÓN: Matemáticas',
      icon: <Zap className="w-6 h-6" />,
      description: 'Curso intensivo personalizado basado en tus resultados del diagnóstico.',
      colorTheme: 'rose',
      tracks: [{
        id: 'rem-1',
        name: 'Plan de Choque',
        overview: 'Recuperación de bases de Grado 8 y 9.',
        modules: [{
          id: 1,
          name: 'Módulos de Recuperación',
          level: 'Prioridad Alta',
          focus: 'Cerrar brechas detectadas en el examen.',
          classes: aiResultToClasses(result.remedialClasses)
        }]
      }]
    };

    // Pass BOTH the UI object AND the raw data for DB saving
    onFinish(ViewState.CURRICULUM, {
      remedialSubject,
      rawResult: result
    });
  };

  // Helper to map AI JSON to ClassSession structure
  const aiResultToClasses = (aiClasses: any[]): any[] => {
    if (!aiClasses || !Array.isArray(aiClasses)) return [];
    return aiClasses.map((c, idx) => ({
      id: 600 + idx,
      title: c.title || `Sesión ${idx + 1}`,
      duration: '25 min',
      topic: c.topic || 'Refuerzo General',
      isRemedial: true,
      blueprint: {
        hook: 'Actividad de conexión rápida.',
        development: 'Explicación del concepto fallido.',
        practice: 'Ejercicios guiados en pizarra.',
        closure: 'Verificación de entendimiento.',
        differentiation: 'Ajuste por ritmo.'
      }
    }));
  };

  if (result) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden animate-fade-in my-8">
        <div className="bg-indigo-600 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

          <div className="relative z-10">
            <div className="w-24 h-24 bg-white text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-indigo-300 shadow-lg">
              <span className="text-4xl font-bold">{result.score}%</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Diagnóstico Completado</h2>
            <p className="text-indigo-100 text-lg">
              {result.score >= 80 ? "¡Excelente nivel! Estás listo para Grado 10." : "Hemos detectado bases importantes por reforzar."}
            </p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 shadow-sm">
            <h3 className="flex items-center gap-2 font-bold text-stone-800 mb-3 text-lg">
              <Brain className="w-6 h-6 text-indigo-500" />
              Análisis del Tutor IA
            </h3>
            <div className="prose prose-stone text-stone-600">
              <ReactMarkdown>{result.feedback}</ReactMarkdown>
            </div>
          </div>

          {
            result.score < 100 && (
              <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                <h3 className="flex items-center gap-2 font-bold text-amber-800 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Brechas Identificadas (Gaps)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.gaps && result.gaps.length > 0 ? (
                    result.gaps.map((gap: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-white border border-amber-200 text-amber-700 text-sm font-bold rounded-full shadow-sm">
                        {gap}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-amber-700">Sin brechas críticas.</span>
                  )}
                </div>
              </div>
            )}

          {result.remedialClasses && result.remedialClasses.length > 0 && (
            <div className="border-2 border-indigo-100 rounded-2xl overflow-hidden shadow-md bg-white">
              <div className="bg-indigo-50 px-8 py-5 border-b border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-bold text-indigo-900 text-xl">Plan de Nivelación Personalizado</h3>
                  <p className="text-sm text-indigo-600">Creado por IA basado en tus 25 respuestas y procedimiento.</p>
                </div>
                <span className="text-xs bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full font-bold animate-pulse">
                  RECOMENDADO
                </span>
              </div>

              <div className="p-6 bg-white">
                <p className="text-stone-600 mb-4 text-sm">
                  Hemos generado un curso de <strong>{result.remedialClasses.length} sesiones</strong> para cubrir tus falencias antes de iniciar Trigonometría.
                </p>
                <div className="space-y-3 mb-6">
                  {result.remedialClasses.map((cls: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg border border-stone-100">
                      <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-stone-800 text-sm">{cls.title}</p>
                        <p className="text-xs text-stone-500">{cls.topic}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleStartRemedial}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-200 hover:scale-[1.02]"
                >
                  <BookOpen className="w-5 h-5" />
                  Activar Curso de Nivelación en mi Currículo
                </button>
              </div>
            </div>
          )}

          {result.remedialClasses?.length === 0 && (
            <button
              onClick={() => onFinish(ViewState.CURRICULUM)}
              className="w-full bg-stone-800 text-white py-4 rounded-xl font-bold"
            >
              Volver al Currículo
            </button>
          )
          }
        </div>
      </div>
    );
  }

  // --- CAMERA / UPLOAD WORK STEP ---
  if (showCameraStep && !isSubmitting) {
    return (
      <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center font-sans p-4 animate-fade-in">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden text-center p-8">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">¡Muestra tu trabajo!</h2>
          <p className="text-stone-500 mb-6 text-sm">
            La IA quiere ver CÓMO llegaste a las respuestas. Sube una foto de tu hoja de cálculos (scratchpad) para recibir un análisis más profundo.
          </p>

          <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-6 group shadow-inner">
            {workImage ? (
              <img src={workImage} className="w-full h-full object-cover" alt="Captured work" />
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 border-[20px] border-black/30 pointer-events-none"></div>
              </>
            )}
          </div>

          {!workImage ? (
            <div className="space-y-3">
              <button
                onClick={capturePhoto}
                className="w-full bg-stone-900 text-white font-bold py-3 rounded-xl hover:bg-stone-800 flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" /> Capturar Foto
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-stone-400">O</span></div>
              </div>

              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-white border border-stone-300 text-stone-600 font-bold py-3 rounded-xl hover:bg-stone-50 flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" /> Subir Archivo
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={submitTest}
                className="w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 flex items-center justify-center gap-2 shadow-lg shadow-teal-200"
              >
                <CheckCircle2 className="w-5 h-5" /> Enviar para Análisis
              </button>
              <button
                onClick={() => { setWorkImage(null); startCamera(); }}
                className="w-full text-stone-500 font-bold text-sm hover:text-stone-700"
              >
                Volver a tomar
              </button>
            </div>
          )}

          <button
            onClick={submitTest}
            className="mt-6 text-xs text-stone-400 underline hover:text-stone-600"
          >
            Saltar este paso (No tengo cámara)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center font-sans p-4 animate-fade-in">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden relative">

        {/* Header */}
        <div className="bg-stone-900 p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calculator className="w-6 h-6 text-teal-400" />
              Diagnóstico de Matemáticas
            </h2>
            <p className="text-stone-400 text-xs mt-1">Evaluando bases de Grado 8 y 9</p>
          </div>
          <div className="bg-stone-800 px-3 py-1 rounded-lg border border-stone-700 text-xs font-mono">
            {currentQuestion + 1} / {QUESTIONS.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-stone-100 w-full">
          <div
            className="h-full bg-teal-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
          ></div>
        </div>

        {
          isSubmitting ? (
            <div className="p-20 text-center flex flex-col items-center" >
              <div className="relative mb-8">
                <div className="w-20 h-20 border-4 border-stone-200 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-teal-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                <Brain className="w-8 h-8 text-teal-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mb-2">Analizando Patrones...</h3>
              <p className="text-stone-500 max-w-md">Nova AI está revisando tus respuestas {workImage ? 'y tu procedimiento manuscrito' : ''} para diseñar tu ruta de aprendizaje.</p>
            </div>
          ) : (
            <div className="p-8 md:p-10">
              <div className="mb-8">
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2 block">
                  Pregunta {currentQuestion + 1}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-stone-800 leading-tight">
                  {QUESTIONS[currentQuestion].text}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {QUESTIONS[currentQuestion].options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className={`p-5 rounded-xl border-2 transition-all flex justify-between items-center group text-lg ${answers[QUESTIONS[currentQuestion].id] === opt
                      ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold shadow-md'
                      : 'border-stone-100 bg-white hover:border-teal-200 hover:bg-stone-50 text-stone-600'
                      }`}
                  >
                    <span>{opt}</span>
                    {answers[QUESTIONS[currentQuestion].id] === opt && <CheckCircle2 className="w-6 h-6 text-teal-600" />}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-stone-100">
                <button
                  onClick={() => {
                    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1)
                  }}
                  disabled={currentQuestion === 0}
                  className="text-stone-400 hover:text-stone-600 px-4 py-2 text-sm font-bold disabled:opacity-30"
                >
                  Anterior
                </button>

                <button
                  onClick={nextQuestion}
                  disabled={!answers[QUESTIONS[currentQuestion].id]}
                  className="bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
                >
                  {currentQuestion === QUESTIONS.length - 1 ? 'Finalizar Test' : 'Siguiente'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default DiagnosticTest;
