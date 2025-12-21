import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Calculator,
  PlayCircle,
  Timer,
  PenTool,
  Trash2,
  MousePointer2,
  Lock,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Subject, ClassSession, Language } from '../types';
import { GeminiRealtimeClient, getNovaConfig, getAiClient } from '../services/openai';

// --- HELPERS AUDIO ---
function b64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function floatTo16BitPCM(input: Float32Array) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output.buffer;
}

function sanitizeSvgCode(rawSvg: string): string {
  if (!rawSvg) return '';
  let cleaned = rawSvg.replace(/```(svg|xml)?/gi, '').replace(/```/g, '').trim();
  const svgMatch = cleaned.match(/<svg[\s\S]*<\/svg>/i);
  if (!svgMatch)
    return `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="white"/><text x="400" y="300" text-anchor="middle" font-size="20" fill="#94a3b8">Error al cargar gráfico</text></svg>`;

  let final = svgMatch[0];
  if (!final.includes('stroke'))
    final = final.replace(
      /<path|<line|<circle|<rect/g,
      (m) => `${m} stroke="#000000" stroke-width="3"`
    );
  if (!final.includes('<rect'))
    final = final.replace(
      '>',
      '><rect width="800" height="600" fill="#ffffff" />'
    );

  return final;
}

interface LiveClassroomProps {
  session: ClassSession;
  studentName: string;
  onExit: () => void;
  language: Language;
}

const LiveClassroom: React.FC<LiveClassroomProps> = ({
  session,
  studentName,
  onExit,
  language,
}) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [board, setBoard] = useState({ title: 'Pizarra Nova', svg: '' });
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState('#ef4444');
  const hasApiKey = !!getAiClient();

  const clientRef = useRef<GeminiRealtimeClient | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const statusRef = useRef<'idle' | 'connecting' | 'connected'>('idle');
  const currentResponseText = useRef<string>('');

  useEffect(() => {
    if (status === 'connected') {
      const int = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
      return () => clearInterval(int);
    }
  }, [status]);

  const resize = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    canvasRef.current.width = containerRef.current.clientWidth;
    canvasRef.current.height = containerRef.current.clientHeight;
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize, status]);

  const draw = (e: any) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();
    lastPos.current = { x, y };
  };

  const connect = async () => {
    setStatus('connecting');
    statusRef.current = 'connecting';

    try {
      // 1. Audio Setup
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      await ctx.audioWorklet.addModule(
        'data:application/javascript;base64,' +
        btoa(`
        class PCMProcessor extends AudioWorkletProcessor {
          process(inputs, outputs, parameters) {
            const input = inputs[0];
            if (input.length > 0) {
              const float32 = input[0];
              const int16 = new Int16Array(float32.length);
              for (let i = 0; i < float32.length; i++) {
                const s = Math.max(-1, Math.min(1, float32[i]));
                int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
              }
              this.port.postMessage(int16.buffer, [int16.buffer]);
            }
            return true;
          }
        }
        registerProcessor('pcm-processor', PCMProcessor);
      `)
      );

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          autoGainControl: true,
          noiseSuppression: true,
        },
      });

      const source = ctx.createMediaStreamSource(stream);
      const processor = new AudioWorkletNode(ctx, 'pcm-processor');

      processor.port.onmessage = (e) => {
        if (clientRef.current && statusRef.current === 'connected') {
          const b64 = arrayBufferToBase64(e.data);
          clientRef.current.sendAudio(b64);
        }
      };

      source.connect(processor);
      const gain = ctx.createGain();
      gain.gain.value = 0;
      processor.connect(gain);
      gain.connect(ctx.destination);

      // 2. Client Init
      const apiKey =
        import.meta.env.VITE_OPENAI_API_KEY ||
        (process as any).env.VITE_OPENAI_API_KEY ||
        '';

      if (!apiKey) {
        alert('Falta la API Key. Configura VITE_OPENAI_API_KEY en Vercel o .env');
        setStatus('idle');
        statusRef.current = 'idle';
        return;
      }

      const client = new GeminiRealtimeClient(apiKey);
      clientRef.current = client;

      const sys = `Tutor Nova. Idioma: ${language === 'en' ? 'English' : 'Español'
        }. TEMA: ${session.topic}. REGLA: Llama a 'updateWhiteboard' para poner el ejercicio de ${session.topic
        } ANTES de saludar. No hables si la pizarra está vacía.`;

      // 3. Handlers
      client.onOpen = () => {
        console.log('✅ Connected to AI Tutor');
        setStatus('connected');
        statusRef.current = 'connected';
      };

      client.onMessage = async (data: any) => {
        console.log('📨 [AI] Message:', data.type);

        // Text Delta (Accumulate)
        if (data.type === 'response.text.delta' && data.text) {
          currentResponseText.current += data.text;
          setIsSpeaking(true);
          console.log('✏️ [AI] Delta:', data.text);
        }

        // Turn Done (Synthesize accumulated text via ElevenLabs)
        if (data.type === 'response.done') {
          console.log('✅ [AI] Turn done. Full text:', currentResponseText.current);
          setIsSpeaking(false);
          const fullText = currentResponseText.current;
          currentResponseText.current = '';

          if (!fullText.trim()) {
            console.warn('⚠️ [AI] Empty text, skipping ElevenLabs');
            return;
          }

          try {
            console.log('🎧 Importing ElevenLabs service...');
            const { generateSpeech } = await import('../services/elevenlabs');

            console.log('🎤 Calling generateSpeech...');
            const audioBuffer = await generateSpeech(fullText);

            if (!audioBuffer || audioBuffer.byteLength === 0) {
              console.warn('⚠️ [ElevenLabs] Empty audio buffer');
              return;
            }

            console.log('🔊 Building Audio from buffer:', audioBuffer.byteLength);
            const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;

            setIsSpeaking(true);

            audio.onended = () => {
              console.log('🔇 Audio ended');
              setIsSpeaking(false);
              URL.revokeObjectURL(url);
            };

            audio.onerror = (e) => {
              console.error('❌ Audio element error:', e);
              setIsSpeaking(false);
              URL.revokeObjectURL(url);
            };

            audio
              .play()
              .then(() => console.log('▶️ Playback started'))
              .catch((err) => {
                console.error('❌ audio.play() rejected:', err);
                setIsSpeaking(false);
              });
          } catch (err: any) {
            console.error('❌ ElevenLabs generateSpeech error:', err?.message || err);
          }
        }

        // Function Call
        if (data.type === 'response.function_call_arguments.done') {
          const args = JSON.parse(data.arguments);
          if (data.name === 'updateWhiteboard') {
            setBoard({ title: args.topic, svg: sanitizeSvgCode(args.svg_code) });
            client.sendToolResponse(data.call_id, 'Board updated successfully');
          }
        }
      };

      client.onError = (err) => {
        console.error('AI Service Error:', err);
        setStatus('idle');
        statusRef.current = 'idle';
        alert('Error de conexión con el servicio de IA. Reintenta.');
      };

      client.onClose = () => {
        console.log('AI Service Closed');
        setStatus('idle');
        statusRef.current = 'idle';
      };

      // 4. Connect
      client.connect(getNovaConfig(sys));
    } catch (e) {
      console.error('Connection failed', e);
      alert('Error iniciando audio. Asegúrate de dar permisos de micrófono.');
      setStatus('idle');
      statusRef.current = 'idle';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-stone-50 rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative font-sans">
      <div className="p-4 bg-stone-900 text-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">
            N
          </div>
          <div>
            <h2 className="font-bold text-xs">{session.title}</h2>
            <p className="text-[10px] text-stone-400">{session.topic}</p>
          </div>
        </div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-mono">
          <Timer className="inline w-3 h-3 mr-1" />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        {status !== 'connected' ? (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl border border-stone-200">
              <MousePointer2
                className={`w-10 h-10 ${status === 'connecting' ? 'text-indigo-400 animate-pulse' : 'text-indigo-600'
                  }`}
              />
            </div>
            <button
              onClick={connect}
              disabled={status === 'connecting'}
              className="px-12 py-4 rounded-2xl text-white font-black text-lg bg-indigo-600 shadow-xl hover:scale-105 transition-all disabled:bg-indigo-300 flex items-center gap-2 mx-auto"
            >
              {status === 'connecting' ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {status === 'connecting' ? 'CONECTANDO...' : 'INICIAR SESIÓN'}
            </button>
            <p className="text-xs text-stone-400 max-w-xs mx-auto">
              AI Service Status: {hasApiKey ? '✅ LOADED' : '❌ MISSING'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col w-full h-full max-w-5xl gap-4">
            <div className="flex justify-between items-center bg-white p-2.5 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'
                    }`}
                ></div>
                <span className="text-[10px] font-black uppercase text-stone-400">
                  {isSpeaking ? 'Tutor Hablando (Realtime)' : 'Escuchando...'}
                </span>
              </div>
              <div className="flex gap-2">
                {['#ef4444', '#3b82f6', '#22c55e', '#0f172a'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-lg ${color === c ? 'ring-2 ring-indigo-500 scale-110' : ''
                      }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <button
                  onClick={() =>
                    canvasRef.current?.getContext('2d')?.clearRect(0, 0, 9999, 9999)
                  }
                  className="p-2 text-stone-400 hover:text-rose-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              ref={containerRef}
              className="flex-1 bg-white rounded-[2rem] border-4 border-stone-200 relative overflow-hidden shadow-inner group"
            >
              <div
                dangerouslySetInnerHTML={{ __html: board.svg }}
                className="absolute inset-0 w-full h-full p-6 pointer-events-none"
                style={{ zIndex: 1 }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full z-10 cursor-crosshair touch-none"
                onMouseDown={(e) => {
                  isDrawing.current = true;
                  const r = canvasRef.current!.getBoundingClientRect();
                  lastPos.current = { x: e.clientX - r.left, y: e.clientY - r.top };
                }}
                onMouseMove={draw}
                onMouseUp={() => (isDrawing.current = false)}
                onTouchStart={(e) => {
                  isDrawing.current = true;
                  const r = canvasRef.current!.getBoundingClientRect();
                  lastPos.current = {
                    x: e.touches[0].clientX - r.left,
                    y: e.touches[0].clientY - r.top,
                  };
                }}
                onTouchMove={draw}
                onTouchEnd={() => (isDrawing.current = false)}
              />
              <div className="absolute top-4 left-4 z-20 bg-stone-900/90 text-white px-4 py-1.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-2 border border-white/10">
                <PenTool className="w-3.5 h-3.5 text-indigo-400" /> {board.title}
              </div>
              {!board.svg && (
                <div className="absolute inset-0 flex items-center justify-center text-stone-300 font-bold text-sm">
                  EL TUTOR ESTÁ LISTO...
                </div>
              )}
            </div>

            <button
              onClick={() => {
                clientRef.current?.close();
                onExit();
              }}
              className="self-center px-12 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95"
            >
              FINALIZAR CLASE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- DATA CON SCORES MOCKEADOS ---
const tutoringCurriculumData: Subject[] = [
  {
    id: 'math',
    name: 'Math Mastery (IB/AP)',
    icon: <Calculator className="w-6 h-6" />,
    description: 'Análisis y Enfoques de nivel avanzado.',
    colorTheme: 'indigo',
    tracks: [
      {
        id: 'track-1',
        name: 'Core Skills',
        overview: 'Nivelación intensiva.',
        modules: [
          {
            id: 1,
            name: 'Semana 1: Álgebra IB',
            level: 'Diploma Programme',
            focus: 'Fundamentos.',
            classes: [
              {
                id: 101,
                title: 'Dominio y Rango',
                duration: '25 min',
                topic: 'Conceptos de Funciones',
                blueprint: {
                  hook: '',
                  development: '',
                  practice: '',
                  closure: '',
                  differentiation: '',
                },
                score: 85,
              },
              {
                id: 102,
                title: 'Funciones Inversas',
                duration: '30 min',
                topic: 'Invertibilidad',
                blueprint: {
                  hook: '',
                  development: '',
                  practice: '',
                  closure: '',
                  differentiation: '',
                },
                score: 0,
              },
              {
                id: 103,
                title: 'Funciones Compuestas',
                duration: '40 min',
                topic: 'Composición f(g(x))',
                blueprint: {
                  hook: '',
                  development: '',
                  practice: '',
                  closure: '',
                  differentiation: '',
                },
                score: 0,
              },
            ],
          },
        ],
      },
    ],
  },
];

const Curriculum: React.FC<{
  userName: string;
  language: Language;
  remedialSubject?: Subject;
  userRole?: string;
  onLogInfraction?: any;
  onLogout?: any;
  guardianPhone?: string;
  uploadedHomework?: any;
  userId?: string;
}> = ({ userName, language, remedialSubject }) => {
  const [active, setActive] = useState<ClassSession | null>(null);

  const all = remedialSubject ? [remedialSubject, ...tutoringCurriculumData] : tutoringCurriculumData;

  const handleStartClass = (cls: ClassSession, isLocked: boolean) => {
    if (isLocked) {
      alert(
        '⛔ CLASE BLOQUEADA: Debes obtener al menos 90% en la sesión anterior para dominar el tema.'
      );
      return;
    }
    setActive(cls);
  };

  if (active)
    return (
      <LiveClassroom
        session={active}
        studentName={userName}
        onExit={() => setActive(null)}
        language={language}
      />
    );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <h2 className="text-3xl font-black text-stone-800 tracking-tight">
        {language === 'en' ? 'Smart Tutoring' : 'Tutoría Inteligente'}
      </h2>
      <div className="grid grid-cols-1 gap-6">
        {all.map((sub) => (
          <div
            key={sub.id}
            className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b bg-stone-50 flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">{sub.icon}</div>
              <div>
                <h3 className="text-xl font-bold text-stone-800">{sub.name}</h3>
                <p className="text-stone-500 text-sm">{sub.description}</p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {sub.tracks[0].modules[0].classes.map((cls, idx, arr) => {
                let isLocked = false;
                let prevScore = 0;

                if (idx > 0) {
                  prevScore = arr[idx - 1].score || 0;
                  if (prevScore < 90) isLocked = true;
                }

                return (
                  <div
                    key={cls.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${isLocked
                      ? 'bg-stone-50 border-stone-100 opacity-60'
                      : 'bg-white hover:bg-stone-50 border-stone-100'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full ${isLocked ? 'bg-stone-200 text-stone-400' : 'bg-indigo-100 text-indigo-600'
                          }`}
                      >
                        {isLocked ? <Lock className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-stone-700 text-sm flex items-center gap-2">
                          {cls.title}
                          {cls.score && cls.score > 0 && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cls.score >= 90
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                                }`}
                            >
                              {cls.score}% Mastery
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-stone-400">{cls.duration}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartClass(cls, isLocked)}
                      disabled={isLocked}
                      className={`px-6 py-2 rounded-xl text-xs font-bold shadow-md transition-transform ${isLocked
                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                        : 'bg-indigo-600 text-white hover:scale-105'
                        }`}
                    >
                      {isLocked ? `Req: 90% en Clase ${idx}` : 'Iniciar Clase'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Curriculum;