import React, { useState } from 'react';
import { ShoppingBag, Coins, Lock, Check, Gift, Palette, User, Star, CreditCard, Trash2, Edit2, X, Save, Send, Users } from 'lucide-react';
import { StoreItem } from '../types';

interface RewardsStoreProps {
  userLevel: 'KIDS' | 'TEEN';
  currentCoins: number;
  items: StoreItem[];
  onPurchase: (item: StoreItem) => void;
  isEditable?: boolean;
  onDelete?: (itemId: string) => void;
  onUpdate?: (item: StoreItem) => void;
  onAddCoins?: (amount: number) => void;
  // NUEVO: Props para seleccion de estudiante
  selectedStudentId?: string;
  selectedStudentName?: string;
  studentsList?: {uid: string, name: string, email: string}[];
  onSelectStudent?: (studentId: string) => void;
}

const RewardsStore: React.FC<RewardsStoreProps> = ({ 
  userLevel, currentCoins, items, onPurchase, isEditable, onDelete, onUpdate, onAddCoins,
  selectedStudentId, selectedStudentName, studentsList, onSelectStudent
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'avatar' | 'theme' | 'coupon' | 'real'>('all');
  const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
  const [adminCoinAmount, setAdminCoinAmount] = useState(50);

  const visibleItems = items.filter(item => {
      if (isEditable) return true;
      const isKidItem = item.id.startsWith('k');
      const isTeenItem = item.id.startsWith('t');
      if (userLevel === 'KIDS' && isTeenItem) return false;
      if (userLevel === 'TEEN' && isKidItem) return false;
      return true;
  }).filter(item => activeCategory === 'all' || item.category === activeCategory);

  const handleBuy = (item: StoreItem) => {
      if (isEditable || currentCoins >= item.cost) {
          onPurchase(item);
      } else {
          alert("No tienes suficientes Nova Coins!");
      }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingItem && onUpdate) {
          onUpdate(editingItem);
          setEditingItem(null);
      }
  };

  const handleAdminInjectCoins = () => {
      if (onAddCoins && adminCoinAmount > 0) {
          onAddCoins(adminCoinAmount);
      }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-10">
        
        {/* EDIT MODAL */}
        {editingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-2">
                        <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2">
                            <Edit2 className="w-4 h-4 text-indigo-500" /> Editar Item
                        </h3>
                        <button onClick={() => setEditingItem(null)} className="text-stone-400 hover:text-stone-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSaveEdit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Nombre</label>
                            <input value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm" />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Costo</label>
                                <input type="number" value={editingItem.cost} onChange={e => setEditingItem({...editingItem, cost: Number(e.target.value)})} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Icono/Emoji</label>
                                <input value={editingItem.image || ''} onChange={e => setEditingItem({...editingItem, image: e.target.value})} className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm" />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2">
                            <Save className="w-4 h-4" /> Guardar Cambios
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* Header / Wallet */}
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-yellow-900 font-bold uppercase tracking-widest text-sm">
                    <ShoppingBag className="w-4 h-4" /> Tienda Nova
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-md">
                    {currentCoins.toLocaleString()} <span className="text-2xl opacity-80">Coins</span>
                </h2>
                <p className="text-yellow-100 font-medium mt-2">
                    {isEditable ? "Modo Administrador Activo" : "Ganas +50 Coins por cada clase completada (o mas si el Admin lo decide!)."}
                </p>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 flex items-center justify-center">
                <Coins className="w-16 h-16 text-yellow-100 animate-pulse" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
        </div>

        {/* ADMIN TREASURY PANEL - MEJORADO CON SELECTOR */}
        {isEditable && (
            <div className="bg-stone-900 p-6 rounded-2xl shadow-lg border border-stone-700">
                <div className="flex flex-col gap-6">
                    <div>
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <Lock className="w-5 h-5 text-emerald-400" /> Panel de Tesoreria (Admin)
                        </h3>
                        <p className="text-stone-400 text-sm">Asignar puntos manualmente al estudiante seleccionado.</p>
                    </div>
                    
                    {/* SELECTOR DE ESTUDIANTE */}
                    {studentsList && studentsList.length > 0 && (
                        <div className="bg-stone-800 p-4 rounded-xl border border-stone-600">
                            <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                                <Users className="w-4 h-4" /> Seleccionar Estudiante
                            </label>
                            <select 
                                value={selectedStudentId || ''} 
                                onChange={(e) => onSelectStudent && onSelectStudent(e.target.value)}
                                className="w-full bg-stone-700 text-white rounded-lg px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {studentsList.map(student => (
                                    <option key={student.uid} value={student.uid}>
                                        {student.name} ({student.email})
                                    </option>
                                ))}
                            </select>
                            {selectedStudentName && (
                                <p className="text-emerald-400 text-sm mt-2">
                                    Enviando a: <span className="font-bold">{selectedStudentName}</span>
                                </p>
                            )}
                        </div>
                    )}
                    
                    {/* ENVIAR COINS */}
                    <div className="flex items-center gap-2 bg-stone-800 p-2 rounded-xl border border-stone-600">
                        <Coins className="w-5 h-5 text-yellow-400 ml-2" />
                        <input 
                            type="number" 
                            value={adminCoinAmount}
                            onChange={(e) => setAdminCoinAmount(Number(e.target.value))}
                            className="bg-transparent text-white font-bold w-24 focus:outline-none"
                            min="1"
                        />
                        <button 
                            onClick={handleAdminInjectCoins}
                            disabled={!selectedStudentId}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 ${
                                selectedStudentId 
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                                : 'bg-stone-600 text-stone-400 cursor-not-allowed'
                            }`}
                        >
                            Enviar <Send className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
                { id: 'all', label: 'Todo', icon: <Star className="w-4 h-4" /> },
                { id: 'avatar', label: 'Avatares', icon: <User className="w-4 h-4" /> },
                { id: 'theme', label: 'Temas', icon: <Palette className="w-4 h-4" /> },
                { id: 'coupon', label: 'Cupones', icon: <CreditCard className="w-4 h-4" /> },
                { id: 'real', label: 'Premios Reales', icon: <Gift className="w-4 h-4" /> },
            ].map((cat) => (
                <button 
                   key={cat.id}
                   onClick={() => setActiveCategory(cat.id as any)}
                   className={`px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
                       activeCategory === cat.id 
                       ? 'bg-stone-800 text-white shadow-md' 
                       : 'bg-white border border-stone-200 text-stone-500 hover:bg-stone-50'
                   }`}
                >
                    {cat.icon} {cat.label}
                </button>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleItems.map((item) => (
                <div key={item.id} className={`bg-white rounded-2xl border transition-all relative overflow-hidden group ${item.owned ? 'border-emerald-200 bg-emerald-50/30' : 'border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-1'}`}>
                    <div className={`h-32 flex items-center justify-center ${item.color || 'bg-stone-100'} relative`}>
                        <span className="text-6xl drop-shadow-sm">{item.image || <Gift className="w-12 h-12 text-white/50" />}</span>
                        {item.owned && (
                            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center backdrop-blur-[1px]">
                                <div className="bg-white text-emerald-600 px-3 py-1 rounded-full font-bold text-xs shadow-sm flex items-center gap-1">
                                    <Check className="w-3 h-3" /> ADQUIRIDO
                                </div>
                            </div>
                        )}
                        {item.minLevel && (
                            <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Lvl {item.minLevel}
                            </div>
                        )}
                        {item.category === 'real' && (
                             <div className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                                <Gift className="w-3 h-3" /> PREMIO REAL
                            </div>
                        )}
                        {isEditable && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                <button onClick={(e) => { e.stopPropagation(); setEditingItem(item); }} className="p-2 bg-white rounded-full text-indigo-600 hover:scale-110 transition-transform" title="Edit">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(item.id); }} className="p-2 bg-white rounded-full text-rose-600 hover:scale-110 transition-transform" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase text-stone-400 tracking-wider">{item.category}</span>
                        </div>
                        <h3 className="font-bold text-stone-800 text-lg leading-tight mb-4">{item.name}</h3>
                        <button 
                           onClick={() => (!item.owned || isEditable) && handleBuy(item)}
                           disabled={item.owned && !isEditable} 
                           className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                               item.owned && !isEditable
                               ? 'bg-stone-100 text-stone-400 cursor-default' 
                               : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-95'
                           }`}
                        >
                            {isEditable ? (<><Gift className="w-4 h-4" /> Regalar (Admin)</>) : item.owned ? ('En Inventario') : (<><Coins className="w-4 h-4 text-yellow-300" />{item.cost}</>)}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default RewardsStore;

