
import React, { useState } from 'react';
import { ShieldCheck, Eye, Mic, FileSignature, CheckCircle2, AlertTriangle, ChevronRight, LogOut } from 'lucide-react';

interface ParentAgreementProps {
  studentName: string;
  onAccept: (parentName: string) => void;
  onLogout?: () => void;
}

const ParentAgreement: React.FC<ParentAgreementProps> = ({ studentName, onAccept, onLogout }) => {
  const [parentName, setParentName] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isChecked || !parentName.trim()) return;
    setIsSubmitting(true);
    // Simulate API delay for solemnity
    setTimeout(() => {
        onAccept(parentName);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 relative">
        
        {/* EXIT BUTTON (Top Right) */}
        {onLogout && (
            <button 
                onClick={onLogout}
                className="absolute top-6 right-6 z-20 flex items-center gap-2 text-white/60 hover:text-white transition-colors bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full text-xs font-bold backdrop-blur-md"
            >
                <LogOut className="w-4 h-4" /> Cancelar / Salir
            </button>
        )}

        {/* Header */}
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10">
               <ShieldCheck className="w-8 h-8 text-teal-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Pacto de Excelencia</h1>
              <p className="text-slate-400 text-sm">Consentimiento Informado & Compromiso</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <p className="text-stone-600 mb-8 leading-relaxed">
            Bienvenido a <strong>Nova Schola</strong>. Para garantizar la seguridad, disciplina y el alto rendimiento académico de <strong>{studentName}</strong>, requerimos su consentimiento explícito en los siguientes puntos:
          </p>

          <div className="space-y-6 mb-10">
            {/* Clause 1 */}
            <div className="flex gap-4">
              <div className="shrink-0 mt-1">
                <Eye className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wide mb-1">1. Transparencia Visual (Room Check)</h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Autorizo el uso de la cámara del dispositivo para que la Inteligencia Artificial verifique <strong>exclusivamente</strong> el orden del entorno de estudio (cama tendida, escritorio limpio) antes de iniciar clases. Entiendo que las imágenes se analizan en tiempo real para fines de disciplina.
                </p>
              </div>
            </div>

            {/* Clause 2 */}
            <div className="flex gap-4">
              <div className="shrink-0 mt-1">
                <Mic className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wide mb-1">2. Análisis de Voz & Sentimiento</h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Autorizo el procesamiento de la voz del estudiante durante las sesiones de tutoría y el "Diario de Bienestar". La IA analizará el tono para detectar frustración, fatiga o motivación y adaptar el ritmo de enseñanza.
                </p>
              </div>
            </div>

            {/* Clause 3 */}
            <div className="flex gap-4">
              <div className="shrink-0 mt-1">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wide mb-1">3. Compromiso de Integridad</h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Entiendo que Nova Schola utiliza tecnología "Anti-Cheat" (Detección de pestañas, presencia). Acepto recibir reportes diarios vía WhatsApp sobre el rendimiento académico y las faltas disciplinarias de mi acudido.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
             <label className="flex items-start gap-3 cursor-pointer mb-6 group">
                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-teal-600 border-teal-600' : 'bg-white border-stone-300 group-hover:border-teal-400'}`}>
                    {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
                <span className={`text-sm select-none ${isChecked ? 'text-stone-800 font-medium' : 'text-stone-500'}`}>
                    He leído, comprendo y acepto los términos del Pacto de Excelencia Nova Schola.
                </span>
             </label>

             <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase mb-1 ml-1">Firma Digital (Nombre del Acudiente)</label>
                    <div className="relative">
                        <FileSignature className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <input 
                           type="text" 
                           value={parentName}
                           onChange={(e) => setParentName(e.target.value)}
                           placeholder="Escriba su nombre completo"
                           className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-stone-800 font-medium placeholder-stone-400"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <button 
                       type="submit" 
                       disabled={!isChecked || !parentName.trim() || isSubmitting}
                       className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                       {isSubmitting ? 'Firmando...' : 'Firmar y Acceder'}
                       {!isSubmitting && <ChevronRight className="w-4 h-4" />}
                    </button>
                    
                    {onLogout && (
                        <button 
                           type="button"
                           onClick={onLogout}
                           className="w-full py-3 text-stone-400 font-bold hover:text-rose-500 transition-colors text-xs uppercase tracking-wide"
                        >
                            No acepto los términos. Cerrar Sesión.
                        </button>
                    )}
                </div>
             </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ParentAgreement;
