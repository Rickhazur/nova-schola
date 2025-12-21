import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { generateRemedialPlan } from '../services/openai';
import { Subject } from '../types';

const TeacherReport: React.FC<{ onAssignPlan: (plan: Subject) => void }> = ({ onAssignPlan }) => {
    const [reportText, setReportText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<Subject | null>(null);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const rawPlan = await generateRemedialPlan(reportText);
            if (!rawPlan) throw new Error("No plan generated");

            // Post-process to ensure valid Subject structure
            const processedPlan: Subject = {
                ...rawPlan,
                id: rawPlan.id || `plan-${Date.now()}`,
                icon: <Sparkles className="w-6 h-6" />,
                tracks: rawPlan.tracks.map((t: any, Ti: number) => ({
                    ...t,
                    id: t.id || `track-${Ti}-${Date.now()}`,
                    modules: t.modules.map((m: any, Mi: number) => ({
                        ...m,
                        id: m.id || parseInt(`88${Ti}${Mi}`),
                        classes: m.classes ? m.classes.map((c: any, Ci: number) => ({
                            ...c,
                            id: c.id || parseInt(`99${Ti}${Mi}${Ci}`),
                            blueprint: c.blueprint || { hook: '', development: '', practice: '', closure: '', differentiation: '' }
                        })) : []
                    }))
                }))
            };

            setResult(processedPlan);
        } catch (error) {
            console.error("Error generating plan", error);
            alert("Error al procesar el reporte. Intenta de nuevo.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <header className="space-y-4">
                <h2 className="text-3xl font-black text-slate-800">
                    <span className="text-indigo-600">Teacher</span> Intelligence
                </h2>
                <p className="text-slate-600 max-w-2xl">
                    Sube reportes académicos o pega comentarios de retroalimentación.
                    Nuestra IA diseñará un plan de estudio personalizado para fortalecer las debilidades del estudiante.
                </p>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Pegar Reporte / Comentarios
                        </label>
                        <textarea
                            value={reportText}
                            onChange={(e) => setReportText(e.target.value)}
                            className="w-full h-64 p-4 text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                            placeholder="Ej: El estudiante muestra dificultades con las fracciones y la comprensión lectora..."
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleAnalyze}
                                disabled={!reportText.trim() || isAnalyzing}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all
                                    ${!reportText.trim() || isAnalyzing
                                        ? 'bg-slate-300 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'}`}
                            >
                                {isAnalyzing ? <Sparkles className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                {isAnalyzing ? 'Analizando...' : 'Generar Plan de Estudio'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Preview */}
                <div className="relative">
                    {!result ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                            <FileText className="w-16 h-16 mb-4 opacity-50" />
                            <p>Los resultados del análisis aparecerán aquí.</p>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 animate-slide-up">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">Plan Generado</h3>
                                    <p className="text-xs text-slate-500">Basado en el análisis de IA</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                                    <h4 className="font-extrabold text-indigo-900 mb-1">{result.name}</h4>
                                    <p className="text-sm text-indigo-700">{result.description}</p>
                                </div>

                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Módulos Sugeridos</p>
                                    {result.tracks[0].modules.map((mod, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg">
                                                <span className="text-sm font-medium text-slate-700">{mod.name}</span>
                                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">{mod.level}</span>
                                            </div>
                                            {mod.classes?.map((c, ci) => (
                                                <div key={ci} className="ml-4 pl-3 border-l-2 border-slate-100 text-xs text-slate-500">
                                                    • {c.title}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => onAssignPlan(result)}
                                        className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-black transition-colors shadow-lg"
                                    >
                                        Asignar al Estudiante
                                    </button>
                                    <button onClick={() => setResult(null)} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-500 font-bold text-sm hover:bg-slate-50">
                                        Descartar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherReport;
