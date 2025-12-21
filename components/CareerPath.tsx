
import React, { useState } from 'react';
import { Compass, Briefcase, GraduationCap, DollarSign, Rocket, Star, Heart, RefreshCw, ChevronRight, TrendingUp } from 'lucide-react';
import { generateCareerGuidance } from '../services/openai';
import { UserLevel } from '../types';

interface CareerPathProps {
    initialMode?: UserLevel;
}

interface CareerOption {
    title: string;
    description: string;
    match: number;
    roadmap?: string[]; // Teen
    salary?: string; // Teen
    superpowers?: string[]; // Kids
    emoji?: string; // Kids
}

const CareerPath: React.FC<CareerPathProps> = ({ initialMode = 'bachillerato' }) => {
    const [mode, setMode] = useState<'TEEN' | 'KIDS'>(initialMode === 'primary' ? 'KIDS' : 'TEEN');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<CareerOption[]>([]);

    // Simulated profile based on current "Math/Physics" focus
    const [profile, setProfile] = useState("Fuerte en Matemáticas y Física. Le gusta resolver problemas, el espacio y la tecnología.");

    const handleAnalysis = async () => {
        setLoading(true);
        const data = await generateCareerGuidance(mode, profile);
        setResults(data.careers || []);
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-fade-in font-sans pb-10">

            {/* Toggle Mode Control (For Demo) */}
            <div className="flex justify-end">
                <div className="bg-white border border-stone-200 rounded-full p-1 flex gap-1 shadow-sm">
                    <button
                        onClick={() => setMode('KIDS')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'KIDS' ? 'bg-yellow-400 text-stone-900 shadow-md' : 'text-stone-500 hover:bg-stone-100'}`}
                    >
                        🐣 Kids Mode
                    </button>
                    <button
                        onClick={() => setMode('TEEN')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${mode === 'TEEN' ? 'bg-indigo-600 text-white shadow-md' : 'text-stone-500 hover:bg-stone-100'}`}
                    >
                        🎓 Teen Mode
                    </button>
                </div>
            </div>

            {/* --- TEEN UI (HIGH SCHOOL / IB) --- */}
            {mode === 'TEEN' && (
                <>
                    <header className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[128px] opacity-20"></div>
                        <div className="relative z-10 max-w-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <Compass className="w-8 h-8 text-cyan-400" />
                                <span className="text-sm font-bold uppercase tracking-widest text-cyan-200">AI Career Pathfinder</span>
                            </div>
                            <h2 className="text-4xl font-bold mb-4 leading-tight">
                                Connect your grades to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">Future Career</span>.
                            </h2>
                            <p className="text-slate-300 mb-8 text-lg">
                                Base on your strengths in <strong className="text-white">Math & Physics</strong>, our AI has identified high-growth potential paths for you.
                            </p>
                            <button
                                onClick={handleAnalysis}
                                disabled={loading}
                                className="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-cyan-50 transition-all flex items-center gap-2 shadow-lg disabled:opacity-70"
                            >
                                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Briefcase className="w-5 h-5" />}
                                Analyze My Path
                            </button>
                        </div>
                    </header>

                    {results.length > 0 && (
                        <div className="grid grid-cols-1 gap-6">
                            {results.map((career, idx) => (
                                <div key={idx} className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-2xl font-bold text-slate-800">{career.title}</h3>
                                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                                                    {career.match}% Match
                                                </span>
                                            </div>
                                            <p className="text-slate-600 leading-relaxed mb-6">
                                                {career.description}
                                            </p>

                                            <div className="flex items-center gap-6 text-sm font-medium text-slate-500 mb-6">
                                                <span className="flex items-center gap-1.5">
                                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                                    Est. Salary: <strong className="text-slate-800">{career.salary}</strong>
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                                                    High Demand (2030+)
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 w-full md:w-80">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4" /> Your Roadmap
                                            </h4>
                                            <ul className="space-y-4">
                                                {career.roadmap?.map((step, i) => (
                                                    <li key={i} className="flex gap-3 text-sm text-slate-700">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5"></div>
                                                            {i !== career.roadmap!.length - 1 && <div className="w-px h-full bg-slate-200 my-1"></div>}
                                                        </div>
                                                        <span>{step}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* --- KIDS UI (PRIMARY SCHOOL) --- */}
            {mode === 'KIDS' && (
                <>
                    <header className="bg-yellow-400 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden border-4 border-yellow-200">
                        <div className="relative z-10">
                            <div className="inline-flex bg-white px-4 py-2 rounded-full mb-4 shadow-sm animate-bounce">
                                <span className="text-xl">🚀</span>
                            </div>
                            <h2 className="text-4xl font-black text-stone-900 mb-2 tracking-tight">
                                ¡Aventura del Futuro!
                            </h2>
                            <p className="text-stone-800 font-bold opacity-80 text-lg mb-6">
                                Descubre qué puedes ser cuando seas grande.
                            </p>
                            <button
                                onClick={handleAnalysis}
                                disabled={loading}
                                className="bg-white text-indigo-600 px-8 py-4 rounded-full font-black text-lg hover:scale-105 transition-transform shadow-lg border-b-4 border-stone-200 active:border-b-0 active:translate-y-1 flex items-center gap-2 mx-auto"
                            >
                                {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />}
                                ¡Descubrir mis Poderes!
                            </button>
                        </div>
                        {/* Decorative Elements */}
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white opacity-20 rounded-full"></div>
                        <div className="absolute top-10 right-10 w-20 h-20 bg-orange-400 opacity-20 rounded-full"></div>
                    </header>

                    {results.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {results.map((career, idx) => (
                                <div key={idx} className="bg-white rounded-3xl p-6 border-4 border-b-8 border-stone-100 hover:border-cyan-200 transition-all cursor-pointer group hover:-translate-y-2">
                                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform block text-center">
                                        {career.emoji || "🌟"}
                                    </div>
                                    <h3 className="text-xl font-black text-stone-800 text-center mb-2 leading-tight">
                                        {career.title}
                                    </h3>
                                    <p className="text-stone-500 text-center text-sm mb-6 font-medium">
                                        {career.description}
                                    </p>

                                    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                                        <h4 className="text-xs font-black text-yellow-600 uppercase mb-2 flex items-center justify-center gap-1">
                                            <Rocket className="w-3 h-3" /> Tus Superpoderes
                                        </h4>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {career.superpowers?.map((power, i) => (
                                                <span key={i} className="bg-white text-stone-700 text-xs font-bold px-2 py-1 rounded-md border border-stone-200">
                                                    {power}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

        </div>
    );
};

export default CareerPath;
