import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { Shield, Check, X, Tag, AlertTriangle } from 'lucide-react';

export function ExpertPanel() {
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpertState, setIsExpertState] = useState(false);

  useEffect(() => {
    const fetchExpertStatusAndItems = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists() && (userDoc.data().role === 'expert' || userDoc.data().role === 'admin')) {
          setIsExpertState(true);
          // Fetch pending artifacts
          const q = query(collection(db, 'artifacts'), where('status', '==', 'pending'));
          const snap = await getDocs(q);
          setPendingItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setIsExpertState(false);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'artifacts/users');
      } finally {
        setLoading(false);
      }
    };
    fetchExpertStatusAndItems();
  }, []);

  const handleAction = async (id: string, action: 'verified' | 'flagged' | 'archived') => {
    try {
      await updateDoc(doc(db, 'artifacts', id), { status: action });
      setPendingItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `artifacts/${id}`);
    }
  };

  if (loading) return <div className="text-center py-20 text-amber-500/50">جارٍ التحقق من الصلاحيات...</div>;
  if (!isExpertState) return <div className="text-center py-20 text-red-500">لا تملك صلاحيات لدخول لوحة الخبراء.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-amber-600/20 text-amber-500 rounded-2xl flex items-center justify-center">
          <Shield size={24} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">لوحة الخبراء والمراجعة</h2>
          <p className="text-amber-100/40">راجع الكنوز المضافة وساهم في توثيق تاريخ اليمن وتصنيفه بشكل صحيح.</p>
        </div>
      </div>

      {pendingItems.length === 0 ? (
        <div className="bg-emerald-900/10 border border-emerald-500/20 p-8 rounded-3xl text-center text-emerald-500 font-bold">
          <Check size={48} className="mx-auto mb-4 opacity-50" />
          لا توجد كنوز قيد المراجعة حالياً. عمل رائع!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingItems.map(item => (
            <motion.div key={item.id} layout className="bg-[#161513] rounded-3xl overflow-hidden border border-amber-900/30 flex shadow-lg">
              <div className="w-1/3 aspect-square bg-black shrink-0 relative">
                <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80'} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-black/60 text-amber-500 text-[10px] px-2 py-1 rounded-full uppercase tracking-widest">{item.category}</div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg mb-1 line-clamp-1 hover:text-amber-500">{item.title}</h3>
                  <p className="text-xs text-amber-100/50 line-clamp-2 mb-2">{item.description}</p>
                  <p className="text-[10px] text-amber-400/80 bg-amber-900/20 px-2 py-1 rounded w-fit italic line-clamp-1">
                    {item.historicalContext}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-amber-900/20">
                  <button onClick={() => handleAction(item.id, 'verified')} className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-500 py-2 border border-emerald-500/20 border-b-2 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1">
                    <Check size={14} /> اعتماد
                  </button>
                  <button onClick={() => handleAction(item.id, 'flagged')} className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-500 py-2 border border-red-500/20 border-b-2 rounded-xl text-xs font-bold transition-all flex justify-center items-center gap-1">
                    <AlertTriangle size={14} /> إبلاغ
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
