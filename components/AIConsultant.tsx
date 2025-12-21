
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Image as ImageIcon, X, Globe, Search, Paperclip, ExternalLink, AlertTriangle, ShieldAlert, Lock } from 'lucide-react';
import { ChatMessage, GroundingChunk } from '../types';
import { streamConsultation } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

const AIConsultant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "¡Hola! Soy tu **Tutor Multimodal**. \n\nPuedo ayudarte de tres formas:\n1. 📸 **Visión:** Sube una foto de tu tarea o un gráfico.\n2. 🌍 **Investigación:** Activa la búsqueda web para datos recientes.\n3. 🧠 **Tutoría:** Resuelvo dudas complejas paso a paso.\n\n**Recuerda:** Solo respondo temas académicos de Nova Schola."
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [useSearch, setUseSearch] = useState(false);
  
  // GUARDRAIL STATE
  const [warnings, setWarnings] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [currentWarningMsg, setCurrentWarningMsg] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const logInfraction = (desc: string) => {
      // In a real implementation, this would call the App's logInfraction function via props
      console.warn("INFRACTION LOGGED:", desc);
      // We are simulating the "Admin Alert" here visually
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && !attachedImage) || isLoading || isLocked) return;

    const userText = inputValue;
    const userImage = attachedImage;
    
    // Reset inputs
    setInputValue('');
    setAttachedImage(null);
    setCurrentWarningMsg(null);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      image: userImage || undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create a temporary model message for streaming
      const modelMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', isThinking: true }]);

      const stream = await streamConsultation(
          messages.map(m => ({role: m.role, text: m.text, image: m.image})), 
          userText,
          userImage || undefined,
          useSearch
      );
      
      let fullText = '';
      let groundingChunks: GroundingChunk[] = [];
      let detectedOffTopic = false;
      
      for await (const chunk of stream) {
        if (chunk.text) {
            fullText += chunk.text;
            
            // GUARDRAIL CHECK
            if (fullText.includes("[OFF_TOPIC]") && !detectedOffTopic) {
                detectedOffTopic = true;
                const newWarnings = warnings + 1;
                setWarnings(newWarnings);
                
                if (newWarnings >= 3) {
                    setIsLocked(true);
                    logInfraction(`SUSPENSION: 3rd Strike for Off-Topic detected.`);
                    setCurrentWarningMsg("⛔ SESIÓN BLOQUEADA: Has excedido el límite de advertencias. Se ha enviado un reporte al Administrador.");
                } else {
                    logInfraction(`Warning ${newWarnings}: Off-Topic detected.`);
                    setCurrentWarningMsg(`⚠️ ADVERTENCIA ${newWarnings}/3: Por favor mantén la conversación en temas académicos.`);
                }
            }
        }
        const responseChunk = chunk as any;
        if (responseChunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            groundingChunks = responseChunk.candidates[0].groundingMetadata.groundingChunks;
        }
        
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { 
              ...msg, 
              text: fullText.replace("[OFF_TOPIC]", "⛔"), // Hide the raw tag, show icon
              isThinking: false,
              groundingMetadata: groundingChunks.length > 0 ? { groundingChunks } : undefined
          } : msg
        ));
      }
      
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedPrompts = [
    "Explícame este problema de física (sube foto)",
    "Busca noticias recientes sobre CRISPR (Web)",
    "Ayúdame a estructurar mi ensayo de TOK",
    "Crea un quiz rápido de Trigonometría"
  ];

  if (isLocked) {
      return (
          <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-stone-50 rounded-2xl border-2 border-rose-500 shadow-xl p-8 text-center animate-fade-in">
              <ShieldAlert className="w-24 h-24 text-rose-600 mb-6" />
              <h2 className="text-3xl font-black text-rose-800 mb-2">SESIÓN BLOQUEADA</h2>
              <p className="text-stone-600 max-w-md mb-6">
                  Has violado los protocolos de **Nova Schola** al intentar discutir temas no académicos repetidamente.
              </p>
              <div className="bg-white p-4 rounded-xl border border-stone-200 w-full max-w-sm">
                  <p className="text-xs font-bold text-stone-400 uppercase mb-2">REPORTE ENVIADO</p>
                  <p className="text-sm font-mono text-rose-600">Infracción: Distracción / Uso Inapropiado</p>
                  <p className="text-sm font-mono text-rose-600">Gravedad: ALTA</p>
              </div>
              <button disabled className="mt-8 bg-stone-300 text-stone-500 px-6 py-3 rounded-xl font-bold cursor-not-allowed flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Chat Deshabilitado
              </button>
          </div>
      );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden font-sans relative">
      
      {/* WARNING OVERLAY */}
      {currentWarningMsg && !isLocked && (
          <div className="absolute top-16 left-4 right-4 z-50 bg-rose-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <span className="font-bold text-sm">{currentWarningMsg}</span>
              <button onClick={() => setCurrentWarningMsg(null)} className="ml-auto hover:bg-rose-600 p-1 rounded"><X className="w-4 h-4"/></button>
          </div>
      )}

      <div className="p-4 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-lg shadow-sm">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-800">Tutor Multimodal</h3>
            <p className="text-xs text-stone-500 flex items-center gap-1">
               <Bot className="w-3 h-3" /> Gemini 2.5 Flash
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {warnings > 0 && (
                <div className="flex gap-1 mr-2" title="Strikes / Advertencias">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${i < warnings ? 'bg-rose-500' : 'bg-stone-200'}`}></div>
                    ))}
                </div>
            )}
            <button 
                onClick={() => setUseSearch(!useSearch)}
                className={`text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-all border ${
                    useSearch 
                    ? 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm' 
                    : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200'
                }`}
            >
                {useSearch ? <Globe className="w-3 h-3" /> : <Search className="w-3 h-3" />}
                {useSearch ? 'Búsqueda Web ACTIVA' : 'Búsqueda Web OFF'}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-stone-50/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-stone-800' : 'bg-teal-600'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              
              <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Render Attached Image in Chat */}
                  {msg.image && (
                      <div className="rounded-xl overflow-hidden border border-stone-200 shadow-sm max-w-[200px]">
                          <img src={msg.image} alt="User upload" className="w-full h-auto" />
                      </div>
                  )}

                  <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-white text-stone-800 rounded-tr-none border border-stone-200' 
                      : 'bg-white/80 backdrop-blur-sm border border-teal-100 text-stone-800 rounded-tl-none'
                  }`}>
                    {msg.isThinking && msg.text === '' ? (
                      <div className="flex space-x-2 items-center h-5 px-2">
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    ) : (
                      <div className="prose prose-sm prose-stone max-w-none">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}

                    {/* Grounding Sources */}
                    {msg.groundingMetadata?.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-stone-100">
                            <p className="text-[10px] font-bold text-stone-400 uppercase mb-2 flex items-center gap-1">
                                <Globe className="w-3 h-3" /> Fuentes Citadas
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {msg.groundingMetadata.groundingChunks.map((chunk, idx) => (
                                    chunk.web?.uri && (
                                        <a 
                                            key={idx}
                                            href={chunk.web.uri}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs bg-stone-50 border border-stone-200 text-blue-600 px-2 py-1 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors flex items-center gap-1 truncate max-w-[150px]"
                                        >
                                            <ExternalLink className="w-3 h-3 shrink-0" />
                                            <span className="truncate">{chunk.web.title || "Fuente Web"}</span>
                                        </a>
                                    )
                                ))}
                            </div>
                        </div>
                    )}
                  </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => setInputValue(prompt)}
                className="text-xs bg-white border border-stone-200 px-3 py-2 rounded-lg text-stone-600 hover:border-teal-300 hover:text-teal-600 transition-colors text-left shadow-sm"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-stone-100">
         {/* Image Preview in Input */}
         {attachedImage && (
             <div className="mb-3 flex items-center gap-3 bg-stone-50 p-2 rounded-lg border border-stone-200 w-fit">
                 <div className="w-12 h-12 rounded overflow-hidden">
                     <img src={attachedImage} className="w-full h-full object-cover" alt="Preview" />
                 </div>
                 <div className="text-xs">
                     <p className="font-bold text-stone-700">Imagen adjunta</p>
                     <p className="text-stone-400">Lista para analizar</p>
                 </div>
                 <button onClick={() => setAttachedImage(null)} className="p-1 hover:bg-stone-200 rounded-full">
                     <X className="w-4 h-4 text-stone-500" />
                 </button>
             </div>
         )}

        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className={`p-3 rounded-xl transition-colors mb-[1px] border ${
                attachedImage ? 'bg-teal-50 text-teal-600 border-teal-200' : 'bg-stone-50 text-stone-400 border-stone-200 hover:bg-stone-100'
            }`}
            title="Subir imagen (Tarea, Diagrama)"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={attachedImage ? "Añade una pregunta sobre la imagen..." : "Escribe tu duda, pide un quiz o investiga un tema..."}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-stone-700 placeholder:text-stone-400"
                disabled={isLoading}
              />
              {useSearch && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 animate-pulse" title="Búsqueda activa">
                      <Globe className="w-4 h-4" />
                  </div>
              )}
          </div>

          <button
            type="submit"
            disabled={isLoading || (!inputValue.trim() && !attachedImage)}
            className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors flex items-center justify-center shadow-lg shadow-teal-200 mb-[1px]"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIConsultant;
