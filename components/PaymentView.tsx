import React, { useState } from 'react';
import { CreditCard, CheckCircle, Shield } from 'lucide-react';

interface PaymentViewProps {
    planId?: string;
    onBack?: () => void;
}

const PaymentView: React.FC<PaymentViewProps> = ({ planId, onBack }) => {
    const [step, setStep] = useState<'payment' | 'success'>(planId ? 'payment' : 'payment'); // Default to payment if plan provided

    // Derived plan details (in real app, fetch from ID)
    const planDetails = planId === 'premium'
        ? { name: 'Estudiante Genio', price: '$9.99' }
        : { name: 'Plan Personalizado', price: '---' };


    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock payment processing
        setTimeout(() => setStep('success'), 1500);
    };

    if (step === 'success') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">¡Pago Exitoso!</h2>
                <p className="text-slate-600 max-w-md mx-auto mb-8">
                    Tu suscripción ha sido activada correctamente. Ahora tienes acceso ilimitado a todos los cursos y tutores IA.
                </p>
                <button
                    onClick={onBack}
                    className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:scale-105 transition-transform"
                >
                    Volver al Inicio
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-4">
            {step === 'payment' && (
                <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-slide-up">
                    <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1">
                        &larr; Volver
                    </button>

                    <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Estás comprando</div>
                        <div className="text-xl font-bold text-indigo-900">{planDetails.name}</div>
                        <div className="text-2xl font-black text-slate-900">{planDetails.price} <span className="text-sm font-medium text-slate-400">/mes</span></div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-800 mb-6">Detalles de Pago</h3>

                    <form onSubmit={handlePayment} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre en la tarjeta</label>
                            <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Ricardo Torres" required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Número de tarjeta</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input type="text" className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="0000 0000 0000 0000" required />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Exp.</label>
                                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="MM/YY" required />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">CVC</label>
                                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="123" required />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                                <Shield className="w-4 h-4" /> Pagar Seguro
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PaymentView;
