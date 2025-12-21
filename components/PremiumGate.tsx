import React from 'react';
import { Lock, Zap, Sparkles } from 'lucide-react';

interface PremiumGateProps {
    isPremium?: boolean; // In real app, this would come from a context/hook
    children: React.ReactNode;
    featureName?: string;
    type?: 'blur' | 'banner' | 'lock';
    onUpgrade?: () => void;
}

const PremiumGate: React.FC<PremiumGateProps> = ({
    isPremium = false,
    children,
    featureName = "Función Premium",
    type = 'blur',
    onUpgrade
}) => {
    // If user is premium, just render the content
    if (isPremium) {
        return <>{children}</>;
    }

    // Handle different gate styles
    if (type === 'banner') {
        return (
            <div className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Sparkles className="w-5 h-5 text-yellow-300" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm">Desbloquea {featureName}</h3>
                            <p className="text-indigo-100 text-xs">Acceso ilimitado con Nova Premium</p>
                        </div>
                    </div>
                    <button
                        onClick={onUpgrade}
                        className="bg-white text-indigo-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                        Upgrade
                    </button>
                </div>
                <div className="opacity-50 pointer-events-none grayscale">
                    {children}
                </div>
            </div>
        );
    }

    if (type === 'lock') {
        return (
            <div className="relative group">
                <div className="opacity-40 blur-sm pointer-events-none select-none">
                    {children}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <button onClick={onUpgrade} className="bg-slate-900/90 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold shadow-xl hover:scale-105 transition-transform border border-white/10">
                        <Lock className="w-4 h-4 text-cyan-400" />
                        <span>Bloqueado</span>
                    </button>
                </div>
            </div>
        )
    }

    // Default: Blur overlay
    return (
        <div className="relative overflow-hidden rounded-xl">
            <div className="filter blur-md opacity-30 pointer-events-none select-none" aria-hidden="true">
                {children}
            </div>

            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/5 backdrop-blur-[2px]">
                <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm text-center border border-indigo-100 m-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-6 h-6 text-indigo-600 fill-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{featureName}</h3>
                    <p className="text-slate-500 text-sm mb-6">
                        Esta herramienta avanzada requiere una suscripción activa. Potencia tu aprendizaje hoy.
                    </p>
                    <button
                        onClick={onUpgrade}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Obtener Premium</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PremiumGate;
