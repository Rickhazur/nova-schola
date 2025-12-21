import React, { useState, useEffect } from 'react';
import { X, Send, AlertTriangle, MessageCircle, Reply } from 'lucide-react';
import { AppMessage } from '../types';
import { sendFlashMessage, subscribeToMessages } from '../services/supabase';

interface SupportWidgetProps {
  userId: string;
  userName: string;
  userRole: string;
}

const SupportWidget: React.FC<SupportWidgetProps> = ({ userId, userName, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [supportText, setSupportText] = useState('');
  const [notifications, setNotifications] = useState<AppMessage[]>([]);
  const [showToast, setShowToast] = useState<AppMessage | null>(null);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeToMessages(userId, (msg) => {
        setNotifications(prev => [msg, ...prev]);
        setShowToast(msg);
        setTimeout(() => setShowToast(null), 8000);
    });
    return () => unsubscribe();
  }, [userId]);

  const handleSendSupport = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!supportText.trim()) return;
      const ticket: AppMessage = {
          id: Date.now().toString(),
          senderId: userId,
          senderName: userName,
          receiverId: 'ADMIN_INBOX',
          content: supportText,
          type: 'SUPPORT_TICKET',
          timestamp: new Date().toISOString(),
          read: false
      };
      await sendFlashMessage(ticket);
      setSupportText('');
      setIsOpen(false);
      alert("Mensaje enviado.");
  };

  if (userRole === 'ADMIN') return null;

  return (
    <>
      {showToast && (
          <div onClick={() => { setIsOpen(true); setShowToast(null); }} className="fixed top-20 right-4 z-[200] max-w-sm w-full cursor-pointer group">
              <div className="p-4 rounded-xl shadow-2xl border-l-4 bg-white border-indigo-500 flex gap-3">
                  <div className="p-2 rounded-full bg-indigo-100 text-indigo-600">
                      <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                      <h4 className="font-bold text-sm mb-1">{showToast.senderName || 'Admin'}</h4>
                      <p className="text-sm">{showToast.content}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setShowToast(null); }} className="text-stone-400">
                      <X className="w-4 h-4" />
                  </button>
              </div>
          </div>
      )}
      <div className="fixed bottom-6 left-6 z-50">
        <button onClick={() => setIsOpen(true)} className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl">
            <MessageCircle className="w-6 h-6" />
        </button>
      </div>
      {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                      <h3 className="font-bold">Mensajes</h3>
                      <button onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
                  </div>
                  <div className="p-6">
                      <form onSubmit={handleSendSupport}>
                          <textarea value={supportText} onChange={(e) => setSupportText(e.target.value)} placeholder="Escribe tu mensaje..." className="w-full h-32 p-3 border rounded-xl mb-4" />
                          <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-stone-500">Cancelar</button>
                              <button type="submit" disabled={!supportText.trim()} className="px-6 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50">
                                  Enviar <Send className="w-4 h-4" />
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default SupportWidget;
