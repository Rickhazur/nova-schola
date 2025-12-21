import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, Award, Users } from 'lucide-react';

const learningPacingData = [
  { month: 'Mes 1', tradicional: 10, nova: 12 },
  { month: 'Mes 2', tradicional: 20, nova: 28 },
  { month: 'Mes 3', tradicional: 30, nova: 45 },
  { month: 'Mes 4', tradicional: 40, nova: 65 },
  { month: 'Mes 5', tradicional: 50, nova: 85 },
  { month: 'Mes 6', tradicional: 60, nova: 100 }, // Mastery achieved faster
];

const saberTestProjection = [
  { area: 'Lectura Crítica', nacional: 52, nova: 78 },
  { area: 'Matemáticas', nacional: 48, nova: 82 },
  { area: 'Inglés (B2+)', nacional: 45, nova: 90 },
  { area: 'Ciencias', nacional: 50, nova: 75 },
];

const Metrics: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Proyección de Impacto</h2>
        <p className="text-slate-500 mt-1">Indicadores clave de rendimiento (KPIs) basados en el modelo de aprendizaje adaptativo.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium text-sm">Velocidad de Aprendizaje</h3>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-slate-800">1.8x</span>
            <span className="text-sm text-emerald-600 font-medium mb-1">vs Tradicional</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Basado en cobertura curricular por horas invertidas.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium text-sm">Satisfacción (NPS)</h3>
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-slate-800">72</span>
            <span className="text-sm text-indigo-600 font-medium mb-1">Excelente</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Proyectado basado en modelos similares de autogestión.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-500 font-medium text-sm">Certificaciones Int.</h3>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-slate-800">95%</span>
            <span className="text-sm text-amber-600 font-medium mb-1">Graduados</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Cambridge C1 / TOEFL y habilidades técnicas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Curricular Pacing Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">Velocidad de Adquisición de Conceptos</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={learningPacingData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} label={{ value: '% Contenido', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="tradicional" name="Colegio Tradicional" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="nova" name="Modelo Nova (IA)" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Saber Test Comparison */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">Proyección Pruebas SABER 11</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={saberTestProjection} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="area" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="nacional" name="Promedio Nacional" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="nova" name="Objetivo Nova" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;