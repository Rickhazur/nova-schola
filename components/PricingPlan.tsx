
import React, { useState } from 'react';
import { Check, X, Star, Zap, School, Shield, Rocket, HelpCircle } from 'lucide-react';
import { ViewState } from '../types';

/* 
  NOTE: This component handles the display of pricing tiers.
  In a real integration, the "Choose Plan" buttons would trigger 
  a Stripe Checkout session via a backend API.
*/

interface PricingPlanProps {
  onPlanSelect?: (planId: string) => void;
  onClose?: () => void;
}

const PricingPlan: React.FC<PricingPlanProps> = ({ onPlanSelect, onClose }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Estudiante Explorador',
      price: 0,
      description: 'Herramientas esenciales para empezar tu viaje.',
      icon: <Rocket className="w-6 h-6 text-slate-400" />,
      features: [
        'Acceso al Dashboard',
        '3 Flashcards diarias',
        '5 Consultas al Tutor AI (Básico)',
        'Seguimiento de Progreso simple',
        'Acceso al Repositorio',
      ],
      missing: [
        'Diagnóstico con Visión (Fotos)',
        'Tutor AI Ilimitado (Pro)',
        'Planes de Recuperación',
        'Orientación Vocacional',
        'Sin Anuncios'
      ],
      cta: 'Tu Plan Actual',
      color: 'slate',
      popular: false
    },
    {
      id: 'premium',
      name: 'Estudiante Genio',
      price: billingCycle === 'monthly' ? 11.99 : 119,
      description: 'Desbloquea tu máximo potencial académico.',
      icon: <Zap className="w-6 h-6 text-white" />,
      features: [
        'Todo lo del plan Explorador',
        'Tutor AI Ilimitado (Modelo Pro)',
        'Escaneo de Tareas (Vision AI)',
        'Planes de Recuperación Personalizados',
        'Orientación Vocacional Completa',
        'Flashcards Ilimitadas',
        'Acceso Prioritario a Nuevas Funciones'
      ],
      missing: [],
      cta: 'Desbloquear Premium',
      color: 'indigo',
      popular: true
    },
    {
      id: 'school',
      name: 'Institucional',
      price: null, // Contact sales
      description: 'Para colegios que buscan excelencia educativa.',
      icon: <School className="w-6 h-6 text-cyan-600" />,
      features: [
        'Licencias para todos los estudiantes',
        'Dashboard para Profesores',
        'Reportes de Rendimiento Masivos',
        'Integración con LMS existente',
        'Soporte Prioritario Dedicado',
        'Personalización de Marca'
      ],
      missing: [],
      cta: 'Contactar Ventas',
      color: 'cyan',
      popular: false
    }
  ];

  return (
    <div className="min-h-full p-4 md:p-8 animate-fade-in pb-20">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          Invierte en tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Futuro</span>
        </h2>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tus necesidades. Potencia tu aprendizaje con la tecnología más avanzada de Inteligencia Artificial.
        </p>

        {/* Toggle Monthly/Yearly */}
        <div className="flex items-center justify-center mt-8 gap-4">
          <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>Mensual</span>
          <button
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${billingCycle === 'yearly' ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-400'}`}>
            Anual <span className="text-indigo-600 text-xs bg-indigo-50 px-2 py-0.5 rounded-full ml-1">-20%</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-2 
              ${plan.popular
                ? 'border-indigo-500 shadow-2xl shadow-indigo-500/10 z-10 scale-105'
                : 'border-slate-100 shadow-xl hover:shadow-2xl'
              }
            `}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" /> MÁS POPULAR
              </div>
            )}

            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 
              ${plan.id === 'premium' ? 'bg-indigo-600' : 'bg-slate-50'}
            `}>
              {plan.icon}
            </div>

            <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
            <p className="text-slate-500 text-sm mt-2 min-h-[40px]">{plan.description}</p>

            <div className="my-6">
              {plan.price !== null ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">${plan.price}</span>
                  <span className="text-slate-400 font-medium">/ {billingCycle === 'monthly' ? 'mes' : 'año'}</span>
                </div>
              ) : (
                <div className="text-4xl font-black text-slate-900 tracking-tight">Contactar</div>
              )}
            </div>

            <button
              onClick={() => onPlanSelect && onPlanSelect(plan.id)}
              className={`w-full py-3 rounded-xl font-bold transition-all mb-8
                ${plan.id === 'premium'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                  : plan.id === 'school'
                    ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {plan.cta}
            </button>

            <div className="space-y-4">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`mt-0.5 p-0.5 rounded-full flex-shrink-0 
                    ${plan.id === 'premium' ? 'bg-indigo-100' : 'bg-slate-100'}
                  `}>
                    <Check className={`w-3 h-3 ${plan.id === 'premium' ? 'text-indigo-600' : 'text-slate-600'}`} />
                  </div>
                  <span className="text-sm text-slate-600 font-medium leading-tight">{feature}</span>
                </div>
              ))}

              {plan.missing.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-3 opacity-50">
                  <div className="mt-0.5 p-0.5 rounded-full bg-slate-50 flex-shrink-0">
                    <X className="w-3 h-3 text-slate-400" />
                  </div>
                  <span className="text-sm text-slate-400 leading-tight">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-16 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-400 mb-4">
          <Shield className="w-5 h-5" />
          <span className="text-sm font-medium">Pago Seguro con Stripe • Cancelación en cualquier momento</span>
        </div>
        <p className="text-xs text-slate-400">
          Los precios están en USD. Impuestos locales pueden aplicar.
          <a href="#" className="underline ml-1 hover:text-indigo-500">Términos del Servicio</a>
        </p>
      </div>
    </div>
  );
};

export default PricingPlan;