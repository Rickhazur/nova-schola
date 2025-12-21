
import React from 'react';
import { Zap, Database, Globe, Receipt, TrendingUp, AlertCircle, Info } from 'lucide-react';

const PricingPlan: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
      <header className="flex items-center gap-4 border-b border-stone-200 pb-6">
        <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
             <Receipt className="w-8 h-8" />
        </div>
        <div>
            <h2 className="text-3xl font-bold text-stone-800">Planes y Costos</h2>
            <p className="text-stone-500 mt-1">Estimación de costos operativos por estudiante activo.</p>
        </div>
      </header>

      {/* Hero Cost Card */}
      <div className="bg-gradient-to-br from-stone-900 via-slate-800 to-stone-900 text-white p-8 md:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
         {/* Background Effect */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-10"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
           <div>
             <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold uppercase tracking-wider text-xs">
                 <TrendingUp className="w-4 h-4" /> Costo Variable
             </div>
             <h3 className="text-2xl font-bold mb-2">Costo Total Estimado</h3>
             <p className="text-stone-400 text-sm max-w-sm leading-relaxed">
                 Calculado para un estudiante de alto rendimiento (1 hora diaria de uso intensivo de todas las herramientas IA).
             </p>
           </div>
           <div className="text-right bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
             <span className="text-5xl md:text-6xl font-black text-emerald-400 tracking-tight">~$3.00</span>
             <div className="text-sm font-medium text-stone-400 mt-1">USD / Mes / Estudiante</div>
           </div>
         </div>
      </div>

      <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2 mt-8">
          <Info className="w-5 h-5 text-stone-400" /> Desglose de Servicios
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Gemini Live API */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-stone-800 text-lg">Tutoría en Vivo</h4>
                <p className="text-xs text-stone-500">Gemini Multimodal Live</p>
              </div>
           </div>
           <p className="text-3xl font-bold text-stone-800 mb-2">$1.10 <span className="text-xs font-normal text-stone-400">/ mes</span></p>
           <ul className="space-y-2 mb-4">
               <li className="text-xs text-stone-600 flex gap-2">
                   <div className="w-1 h-1 bg-indigo-500 rounded-full mt-1.5"></div>
                   12 Sesiones de 15 min.
               </li>
               <li className="text-xs text-stone-600 flex gap-2">
                   <div className="w-1 h-1 bg-indigo-500 rounded-full mt-1.5"></div>
                   Audio Streaming In/Out.
               </li>
           </ul>
           <div className="text-[10px] text-stone-400 bg-stone-50 p-2 rounded">
               El costo más alto debido al procesamiento de audio en tiempo real.
           </div>
        </div>

        {/* Gemini Search Grounding */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-sky-100 rounded-xl text-sky-600">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-stone-800 text-lg">Investigación</h4>
                <p className="text-xs text-stone-500">Google Search Tool</p>
              </div>
           </div>
           <p className="text-3xl font-bold text-stone-800 mb-2">$1.75 <span className="text-xs font-normal text-stone-400">/ mes</span></p>
           <ul className="space-y-2 mb-4">
               <li className="text-xs text-stone-600 flex gap-2">
                   <div className="w-1 h-1 bg-sky-500 rounded-full mt-1.5"></div>
                   50 Búsquedas profundas.
               </li>
               <li className="text-xs text-stone-600 flex gap-2">
                   <div className="w-1 h-1 bg-sky-500 rounded-full mt-1.5"></div>
                   Validación de datos.
               </li>
           </ul>
           <div className="text-[10px] text-stone-400 bg-stone-50 p-2 rounded">
               $35 por cada 1000 consultas de grounding.
           </div>
        </div>

        {/* Chat & DB */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
           <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-stone-800 text-lg">Chat & DB</h4>
                <p className="text-xs text-stone-500">Flash 2.5 & Supabase</p>
              </div>
           </div>
           <p className="text-3xl font-bold text-stone-800 mb-2">$0.15 <span className="text-xs font-normal text-stone-400">/ mes</span></p>
           <ul className="space-y-2 mb-4">
               <li className="text-xs text-stone-600 flex gap-2">
                   <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5"></div>
                   Chat de Texto Ilimitado.
               </li>
               <li className="text-xs text-stone-600 flex gap-2">
                   <div className="w-1 h-1 bg-amber-500 rounded-full mt-1.5"></div>
                   Almacenamiento Datos.
               </li>
           </ul>
           <div className="text-[10px] text-stone-400 bg-stone-50 p-2 rounded">
               Flash es extremadamente económico. Supabase Free Tier cubre hasta 50k usuarios.
           </div>
        </div>
      </div>

      <div className="mt-8 bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
              <h4 className="font-bold text-indigo-900 text-sm">Nota para Administradores</h4>
              <p className="text-xs text-indigo-700 mt-1">
                  Estos costos son estimados directos de API. No incluyen costos de desarrollo, marketing o personal humano. 
                  Para escalabilidad (1000+ estudiantes), se recomienda contactar a Google Cloud para descuentos por volumen.
              </p>
          </div>
      </div>
    </div>
  );
};

export default PricingPlan;