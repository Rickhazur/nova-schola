
import React, { useState } from 'react';
import { Layers, RotateCcw, CheckCircle, ArrowRight, Brain, Plus, Loader2 } from 'lucide-react';
import { generateFlashcards } from '../services/gemini';

interface Flashcard {
  front: string;
  back: string;
}

const Flashcards: React.FC = () => {
  const [deck, setDeck] = useState<Flashcard[]>([
    { front: "What is the derivative of x²?", back: "2x" },
    { front: "Define Mitochondria", back: "Powerhouse of the cell (ATP production)." },
    { front: "Newton's Second Law", back: "F = ma (Force = mass * acceleration)" }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [topicInput, setTopicInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % deck.length);
    }, 200); // Wait for flip back
  };

  const handleGenerate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!topicInput.trim()) return;
      setIsGenerating(true);
      const newCards = await generateFlashcards(topicInput);
      if (newCards.length > 0) {
          setDeck(newCards);
          setCurrentIndex(0);
          setIsFlipped(false);
      }
      setIsGenerating(false);
      setTopicInput('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in pb-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-stone-800 flex items-center justify-center gap-2">
                <Layers className="w-8 h-8 text-indigo-600" />
                Smart Flashcards
            </h2>
            <p className="text-stone-500">Repaso espaciado potenciado por IA.</p>
        </div>

        {/* Generator */}
        <form onSubmit={handleGenerate} className="flex gap-2 bg-white p-2 rounded-xl shadow-sm border border-stone-200">
            <input 
               type="text" 
               value={topicInput}
               onChange={(e) => setTopicInput(e.target.value)}
               placeholder="Tema (ej: 'Vectores', 'Fotosíntesis', 'Verbos Irregulares')" 
               className="flex-1 px-4 py-2 bg-transparent outline-none text-stone-700"
            />
            <button 
               type="submit" 
               disabled={isGenerating}
               className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
            >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                Generar Deck
            </button>
        </form>

        {/* Card Area */}
        <div className="perspective-1000 h-80 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT */}
                <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border-2 border-stone-100 flex flex-col items-center justify-center p-8 text-center hover:border-indigo-200 transition-colors">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Pregunta / Concepto</span>
                    <h3 className="text-2xl font-bold text-stone-800">{deck[currentIndex].front}</h3>
                    <p className="text-stone-400 text-xs mt-8 absolute bottom-8">Click para voltear</p>
                </div>

                {/* BACK */}
                <div className="absolute inset-0 backface-hidden bg-indigo-600 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center rotate-y-180 text-white">
                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-4">Respuesta</span>
                    <h3 className="text-2xl font-bold">{deck[currentIndex].back}</h3>
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
            <button onClick={() => setIsFlipped(!isFlipped)} className="p-4 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
                <RotateCcw className="w-6 h-6" />
            </button>
            <button onClick={handleNext} className="px-8 py-4 rounded-full bg-stone-900 text-white font-bold hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-lg">
                Siguiente <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={handleNext} className="p-4 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors" title="Marcar como aprendido">
                <CheckCircle className="w-6 h-6" />
            </button>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2">
            {deck.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-indigo-600' : 'bg-stone-200'}`}></div>
            ))}
        </div>

    </div>
  );
};

export default Flashcards;
