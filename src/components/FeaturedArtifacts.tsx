import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, query, orderBy, limit, onSnapshot, getDocs, where } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { Eye, Clock, User, Award } from 'lucide-react';

export function FeaturedArtifacts({ fullView = false, onArtifactClick }: { fullView?: boolean, onArtifactClick?: (artifact: any) => void }) {
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only fetch verified artifacts for the public museum
    const q = query(
      collection(db, 'artifacts'),
      where('status', '==', 'verified'),
      orderBy('createdAt', 'desc'), 
      limit(fullView ? 50 : 6)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArtifacts(data);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'artifacts');
      setLoading(false); // don't infinite spin
    });

    return unsub;
  }, [fullView]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center text-amber-500/50">جارٍ تحميل الكنوز...</div>
  );

  return (
    <section className="py-20 max-w-7xl mx-auto px-4">
      {!fullView && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="w-12 h-[1px] bg-amber-500"></span>
            آخر المكتشفات الرقمية
          </h2>
        </div>
      )}

      {artifacts.length === 0 ? (
        <div className="text-center py-20 bg-amber-900/5 rounded-3xl border border-dashed border-amber-900/20">
          <p className="text-amber-100/40">لم يتم توثيق أي كنوز بعد. كن أول من يوثق!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artifacts.map((art, idx) => (
            <motion.div
              key={art.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group bg-[#161513] rounded-3xl overflow-hidden border border-amber-900/10 hover:border-amber-500/30 transition-all p-3"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-2xl relative">
                <img 
                  src={art.images?.[0] || 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=400'} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={art.title}
                />
                <div className="absolute top-4 right-4 bg-amber-600/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                  {art.category}
                </div>
                {art.status === 'verified' && (
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-md p-1.5 rounded-full text-white">
                    <Award size={16} />
                  </div>
                )}
                {/* Overlay info */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-4 text-white/80 text-xs">
                    <span className="flex items-center gap-1"><Eye size={14} /> 1.2k</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> 120y</span>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold group-hover:text-amber-500 transition-colors line-clamp-1">{art.title}</h3>
                  <p className="text-sm text-amber-100/40 line-clamp-2 leading-relaxed">
                    {art.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-amber-900/10 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                      <User size={14} />
                    </div>
                    <span className="text-xs text-amber-100/40">موثق بواسطة {art.ownerName || 'مواطن يمني'}</span>
                  </div>
                  <button onClick={() => onArtifactClick?.(art)} className="text-amber-500 hover:underline text-xs font-bold shrink-0">التفاصيل</button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
