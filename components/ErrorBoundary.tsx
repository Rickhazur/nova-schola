import React from 'react';
import { FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

export const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
            <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 mb-6">
                    <AlertTriangle className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-black mb-2 text-white">Algo salió mal</h2>
                <p className="text-slate-400 mb-6 text-sm">
                    No te preocupes, esto suele ser temporal. Hemos registrado el error.
                </p>

                <div className="bg-black/30 rounded-lg p-4 mb-8 text-left overflow-auto max-h-32 border border-white/5">
                    <code className="text-xs text-rose-300 font-mono">
                        {error.message}
                    </code>
                </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={resetErrorBoundary}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Reintentar
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold transition-all"
                    >
                        <Home className="w-4 h-4" />
                        Recargar Todo
                    </button>
                </div>
            </div>
        </div>
    );
};
