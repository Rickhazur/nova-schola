
import React, { useState, useEffect } from 'react';
import { Trophy, Users, Zap, Crown, Flame, Swords, Timer, ArrowRight, X, Shield, Star, Medal } from 'lucide-react';

const SunIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const PiIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;

// --- MOCK DATA ---
const LEADERBOARD = [
  { id: 1, name: "Sofía Rodríguez", level: 1, xp: 0, avatar: "👩‍🎓", streak: 0, status: 'online' },
  { id: 2, name: "Sami (Tú)", level: 1, xp: 0, avatar: "👤", streak: 0, status: 'online' },
  { id: 3, name: "Mateo G.", level: 1, xp: 0, avatar: "👨‍💻", streak: 0, status: 'offline' },
  { id: 4, name: "Valentina P.", level: 1, xp: 0, avatar: "🎨", streak: 0, status: 'online' },
  { id: 5, name: "Juan D.", level: 1, xp: 0, avatar: "🏀", streak: 0, status: 'offline' },
];

const ACHIEVEMENTS = [
  { id: 1, name: "Madrugador", desc: "Clase antes de 8AM", icon: <SunIcon />, earned: false },
  { id: 2, name: "Matemático", desc: "90% en Quiz Math", icon: <PiIcon />, earned: false },
  { id: 3, name: "Imparable", desc: "Racha de 30 días", icon: <Flame className="w-4 h-4 text-orange-500" />, earned: false },
];

// --- DUEL COMPONENT ---
interface DuelArenaProps {
  onClose: () => void;
  opponentName: string;
}

const DuelArena: React.FC<DuelArenaProps> = ({ onClose, opponentName }) => {
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'finished'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<{ q: string; a: number }>({ q: "", a: 0 });
  const [input, setInput] = useState("");
  const [winner, setWinner] = useState<string | null>(null);

  // Generate math question
  const generateQuestion = () => {
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const n1 = Math.floor(Math.random() * 12) + 1;
    const n2 = Math.floor(Math.random() * 12) + 1;
    let q = `${n1} ${op} ${n2}`;
    let a = 0;
    if (op === '+') a = n1 + n2;
    if (op === '-') a = n1 - n2;
    if (op === '*') a = n1 * n2;
    setCurrentQuestion({ q, a });
    setInput("");
  };

  // Start countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown') {
      setGameState('playing');
      generateQuestion();
    }
  }, [countdown]);

  // Opponent AI Logic (Simulate answering)
  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        // Opponent has 60% chance to score every 2.5 seconds
        if (Math.random() > 0.4) {
          setOpponentScore(prev => {
            const newScore = prev + 10;
            if (newScore >= 100) {
              setWinner(opponentName);
              setGameState('finished');
            }
            return newScore;
          });
        }
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [gameState, opponentName]);

  const handleAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(input) === currentQuestion.a) {
      const newScore = playerScore + 10;
      setPlayerScore(newScore);
      if (newScore >= 100) {
        setWinner("Sami");
        setGameState('finished');
      } else {
        generateQuestion();
      }
    } else {
      // Penalty or shake effect could go here
      setInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-indigo-500/50 shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <Swords className="w-5 h-5" />
            Math Race Arena
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-8 text-center relative">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
          
          {gameState === 'countdown' && (
             <div className="py-20">
               <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-400 animate-ping block">
                 {countdown === 0 ? "GO!" : countdown}
               </span>
               <p className="text-slate-400 mt-4">Prepárate...</p>
             </div>
          )}

          {gameState === 'playing' && (
            <div className="relative z-10">
              {/* Score Bars */}
              <div className="space-y-6 mb-10">
                {/* Player */}
                <div>
                   <div className="flex justify-between text-xs font-bold text-cyan-300 mb-1 uppercase">
                      <span>Sami (Tú)</span>
                      <span>{playerScore}/100</span>
                   </div>
                   <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/30">
                      <div className="h-full bg-cyan-500 transition-all duration-300 shadow-[0_0_15px_#06b6d4]" style={{ width: `${playerScore}%` }}></div>
                   </div>
                </div>
                
                {/* Opponent */}
                <div>
                   <div className="flex justify-between text-xs font-bold text-rose-300 mb-1 uppercase">
                      <span>{opponentName}</span>
                      <span>{opponentScore}/100</span>
                   </div>
                   <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-rose-500/30">
                      <div className="h-full bg-rose-500 transition-all duration-300 shadow-[0_0_15px_#f43f5e]" style={{ width: `${opponentScore}%` }}></div>
                   </div>
                </div>
              </div>

              {/* Question Area */}
              <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
                 <h3 className="text-4xl font-mono font-bold text-white mb-6">{currentQuestion.q} = ?</h3>
                 <form onSubmit={handleAnswer} className="flex gap-4 justify-center">
                    <input 
                      type="number" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="bg-slate-900 border-2 border-indigo-500 text-white text-3xl font-bold text-center w-32 py-2 rounded-xl focus:outline-none focus:shadow-[0_0_20px_#6366f1]"
                      autoFocus
                    />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold transition-all">
                       <ArrowRight className="w-6 h-6" />
                    </button>
                 </form>
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="py-10 animate-fade-in">
                {winner === 'Sami' ? (
                   <>
                     <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                     <h2 className="text-4xl font-bold text-white mb-2">¡VICTORIA!</h2>
                     <p className="text-indigo-300 mb-6">+50 XP ganados</p>
                   </>
                ) : (
                   <>
                     <Shield className="w-24 h-24 text-rose-500 mx-auto mb-4" />
                     <h2 className="text-4xl font-bold text-white mb-2">DERROTA</h2>
                     <p className="text-slate-400 mb-6">{opponentName} fue más rápido.</p>
                   </>
                )}
                <button onClick={onClose} className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                   Volver al Lobby
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SocialHub: React.FC = () => {
  const [activeDuel, setActiveDuel] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-10">
      {activeDuel && <DuelArena opponentName={activeDuel} onClose={() => setActiveDuel(null)} />}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="w-8 h-8 text-indigo-600" />
            Arena Social
          </h2>
          <p className="text-slate-500 mt-1">Compite, colabora y sube de nivel con tu generación.</p>
        </div>
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-3">
             <div className="flex flex-col items-end">
                 <span className="text-[10px] uppercase font-bold opacity-80">Tu Nivel</span>
                 <span className="font-bold text-lg leading-none">Lvl 1 (Novato)</span>
             </div>
             <div className="w-px h-8 bg-white/20"></div>
             <div className="flex flex-col items-start">
                 <span className="text-[10px] uppercase font-bold opacity-80">XP Total</span>
                 <span className="font-bold text-lg leading-none">0 XP</span>
             </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                    <h3 className="font-bold text-stone-700 flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-500" /> Top Estudiantes (Grado 10)
                    </h3>
                    <span className="text-xs text-stone-400">Actualizado: Ahora</span>
                </div>
                <div className="p-2">
                    {LEADERBOARD.map((student, idx) => (
                        <div key={student.id} className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${student.id === 2 ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-stone-50'}`}>
                            <div className="w-8 font-bold text-stone-400 text-center">{idx + 1}</div>
                            <div className="relative">
                                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-xl shadow-sm border border-stone-200">
                                    {student.avatar}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${student.status === 'online' ? 'bg-emerald-500' : 'bg-stone-300'}`}></div>
                            </div>
                            <div className="flex-1">
                                <h4 className={`font-bold ${student.id === 2 ? 'text-indigo-700' : 'text-stone-700'}`}>
                                    {student.name} {student.id === 2 && "(Tú)"}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-stone-500">
                                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> {student.xp} XP</span>
                                    <span>•</span>
                                    <span className="text-indigo-500 font-medium">Nivel {student.level}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden md:flex flex-col items-center">
                                    <Flame className={`w-4 h-4 ${student.streak > 3 ? 'text-orange-500 animate-pulse' : 'text-stone-300'}`} />
                                    <span className="text-[10px] font-bold text-stone-500">{student.streak} días</span>
                                </div>
                                {student.id !== 2 && (
                                    <button 
                                      onClick={() => setActiveDuel(student.name)}
                                      className="bg-white border border-stone-200 hover:border-indigo-300 hover:text-indigo-600 text-stone-500 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                                    >
                                        Retar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Global Challenge Banner */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-2 backdrop-blur-sm border border-white/20">
                             EVENTO SEMANAL
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Maratón de Física</h3>
                        <p className="text-indigo-100 max-w-md text-sm">Resuelve la mayor cantidad de problemas de vectores antes del domingo. ¡El ganador se lleva 500 XP!</p>
                    </div>
                    <Trophy className="w-20 h-20 text-yellow-300 drop-shadow-lg opacity-80" />
                </div>
                <div className="mt-6 w-full bg-black/20 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '0%' }}></div> {/* RESET PROGRESS */}
                </div>
                <div className="flex justify-between text-xs mt-1 font-medium text-indigo-200">
                    <span>Tu progreso</span>
                    <span>0 / 100 Problemas</span>
                </div>
            </div>
        </div>

        {/* RIGHT: Profile & Badges */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm text-center">
                 <div className="w-24 h-24 bg-indigo-50 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-inner border-4 border-indigo-100">
                     👤
                 </div>
                 <h3 className="text-xl font-bold text-stone-800">Sami</h3>
                 <p className="text-stone-500 text-sm mb-4">Grado 10 • IB MYP</p>
                 
                 <div className="grid grid-cols-2 gap-3 mb-6">
                     <div className="bg-stone-50 p-2 rounded-lg border border-stone-100">
                         <span className="block text-xl font-bold text-indigo-600">0</span>
                         <span className="text-[10px] text-stone-400 uppercase font-bold">Victorias</span>
                     </div>
                     <div className="bg-stone-50 p-2 rounded-lg border border-stone-100">
                         <span className="block text-xl font-bold text-rose-500">-%</span>
                         <span className="text-[10px] text-stone-400 uppercase font-bold">Precisión</span>
                     </div>
                 </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <Medal className="w-5 h-5 text-amber-500" /> Medallero
                </h3>
                <div className="space-y-4">
                    {ACHIEVEMENTS.map(ach => (
                        <div key={ach.id} className={`flex items-center gap-3 p-3 rounded-xl border ${ach.earned ? 'bg-amber-50/50 border-amber-100' : 'bg-stone-50 border-stone-100 opacity-60'}`}>
                            <div className={`p-2 rounded-lg ${ach.earned ? 'bg-white shadow-sm text-amber-500' : 'bg-stone-200 text-stone-400'}`}>
                                {ach.icon}
                            </div>
                            <div>
                                <h4 className={`text-sm font-bold ${ach.earned ? 'text-stone-800' : 'text-stone-500'}`}>{ach.name}</h4>
                                <p className="text-xs text-stone-400">{ach.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SocialHub;
