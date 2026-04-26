import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc, 
  addDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { 
  Shield, 
  Check, 
  X, 
  Tag, 
  AlertTriangle, 
  Eye, 
  Edit3, 
  Save, 
  History,
  User,
  Clock,
  Package,
  MapPin,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export function ExpertPanel() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpertState, setIsExpertState] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<any>(null);
  const [filter, setFilter] = useState<'pending' | 'flagged'>('pending');

  useEffect(() => {
    const fetchExpertStatusAndItems = async () => {
      if (!auth.currentUser) return;
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists() && (userDoc.data().role === 'expert' || userDoc.data().role === 'admin')) {
          setIsExpertState(true);
          const q = query(
            collection(db, 'artifacts'), 
            where('status', '==', filter),
            orderBy('createdAt', 'desc')
          );
          const snap = await getDocs(q);
          setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
  }, [filter]);

  const sendNotification = async (userId: string, artifactId: string, type: 'approval' | 'flag', message: string) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        artifactId,
        type,
        message,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to send notification:", err);
    }
  };

  const handleAction = async (item: any, action: 'verified' | 'flagged' | 'archived', metadata?: any) => {
    try {
      const updateData: any = { status: action, ...metadata };
      await updateDoc(doc(db, 'artifacts', item.id), updateData);
      
      const message = action === 'verified' 
        ? `تم اعتماد قطعتك "${item.title}" بنجاح وهي الآن في المتحف!` 
        : `هناك ملاحظات على قطعتك "${item.title}": ${metadata?.flaggedReason || 'يرجى مراجعة البيانات'}`;
      
      const notifType = action === 'verified' ? 'approval' : 'flag';
      await sendNotification(item.ownerId, item.id, notifType, message);
      
      setItems(prev => prev.filter(i => i.id !== item.id));
      setReviewingItem(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `artifacts/${item.id}`);
    }
  };

  if (loading) return <div className="text-center py-20 text-amber-500/50">جارٍ التحميل...</div>;
  if (!isExpertState) return <div className="text-center py-20 text-red-500">لا تملك صلاحيات لدخول لوحة الخبراء.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-600/20 text-amber-500 rounded-2xl flex items-center justify-center">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold">لوحة الخبراء والمراجعة</h2>
            <p className="text-amber-100/40">ساهم في توثيق تاريخ اليمن وتدقيقه.</p>
          </div>
        </div>
        
        <div className="flex bg-[#161513] p-1 rounded-xl border border-amber-900/20">
          <button 
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'pending' ? 'bg-amber-600 text-white' : 'hover:bg-white/5'}`}
          >
            قيد الانتظار
          </button>
          <button 
            onClick={() => setFilter('flagged')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === 'flagged' ? 'bg-red-600/20 text-red-500' : 'hover:bg-white/5'}`}
          >
            تحتاج مراجعة (Flagged)
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-amber-900/5 border border-amber-500/10 p-12 rounded-3xl text-center">
          <Check size={48} className="mx-auto mb-4 opacity-20 text-amber-500" />
          <p className="text-amber-100/40">لا توجد عناصر في قائمة "{filter === 'pending' ? 'الانتظار' : 'المراجعة'}" حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <ArtifactReviewCard 
              key={item.id} 
              item={item} 
              onReview={() => setReviewingItem(item)} 
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {reviewingItem && (
          <ReviewModal 
            item={reviewingItem} 
            onClose={() => setReviewingItem(null)} 
            onAction={handleAction}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ArtifactReviewCard({ item, onReview }: { item: any, onReview: () => void }) {
  const date = item.createdAt?.toDate ? format(item.createdAt.toDate(), 'do MMMM yyyy', { locale: ar }) : 'غير معروف';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#161513] rounded-3xl overflow-hidden border border-amber-900/20 flex flex-col hover:border-amber-500/30 transition-all group"
    >
      <div className="aspect-video relative overflow-hidden">
        <img src={item.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={item.title} />
        {item.status === 'flagged' && (
          <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <AlertTriangle size={10} /> يحتاج مراجعة
          </div>
        )}
        <div className="absolute top-4 right-4 bg-amber-600/90 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
          {item.category}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="font-bold text-xl mb-2 line-clamp-1">{item.title}</h3>
          <p className="text-xs text-amber-100/40 line-clamp-2 leading-relaxed h-8">
            {item.description}
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t border-amber-900/10 mt-auto">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-2 text-amber-100/60">
              <User size={12} className="text-amber-500" />
              <span>{item.ownerName || 'مواطن يمني'}</span>
            </div>
            <div className="flex items-center gap-2 text-amber-100/30">
              <Clock size={12} />
              <span>{date}</span>
            </div>
          </div>
          
          <button 
            onClick={onReview}
            className="w-full bg-white/5 hover:bg-amber-600 hover:text-white border border-white/10 hover:border-amber-600 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            فتح الملف للمراجعة والتدقيق
            <Eye size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ReviewModal({ item, onClose, onAction }: { item: any, onClose: () => void, onAction: any }) {
  const [formData, setFormData] = useState({
    title: item.title,
    description: item.description,
    tags: item.tags?.join(', ') || '',
    materials: item.materials?.join(', ') || '',
    originRegion: item.originRegion || '',
    estimatedAge: item.estimatedAge || '',
    historicalContext: item.historicalContext || '',
    flagReason: ''
  });
  const [activeTab, setActiveTab] = useState<'info' | 'ai' | 'media'>('info');
  const [isFlagging, setIsFlagging] = useState(false);

  const handleSaveAndVerify = () => {
    onAction(item, 'verified', {
      title: formData.title,
      description: formData.description,
      tags: formData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== ''),
      materials: formData.materials.split(',').map((m: string) => m.trim()).filter((m: string) => m !== ''),
      originRegion: formData.originRegion,
      estimatedAge: formData.estimatedAge,
      historicalContext: formData.historicalContext
    });
  };

  const handleFlag = () => {
    if (!formData.flagReason) return alert("يرجى كتابة سبب الإبلاغ.");
    onAction(item, 'flagged', { flaggedReason: formData.flagReason });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-[#0f0e0c] w-full max-w-5xl h-[90vh] rounded-[2.5rem] border border-amber-900/30 overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-6 border-b border-amber-900/20 flex justify-between items-center bg-[#161513]/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white">
              <Edit3 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold">مراجعة: {item.title}</h2>
              <p className="text-xs text-amber-100/40 font-mono">ID: {item.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X /></button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left: Content & Form */}
          <div className="flex-[3] overflow-y-auto p-8 space-y-8 bg-[#161513]/20">
            <div className="flex gap-4 border-b border-amber-900/10 mb-8">
              <button 
                onClick={() => setActiveTab('info')}
                className={`pb-4 px-4 text-sm font-bold transition-all relative ${activeTab === 'info' ? 'text-amber-500' : 'text-amber-100/40'}`}
              >
                المعلومات الأساسية
                {activeTab === 'info' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('media')}
                className={`pb-4 px-4 text-sm font-bold transition-all relative ${activeTab === 'media' ? 'text-amber-500' : 'text-amber-100/40'}`}
              >
                الصور والوسائط
                {activeTab === 'media' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-full" />}
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className={`pb-4 px-4 text-sm font-bold transition-all relative ${activeTab === 'ai' ? 'text-amber-500' : 'text-amber-100/40'}`}
              >
                تحليل الذكاء الاصطناعي
                {activeTab === 'ai' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500 rounded-full" />}
              </button>
            </div>

            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-amber-500 uppercase">العنوان</label>
                  <input 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[#0c0b0a] border border-amber-900/30 p-3 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-amber-500 uppercase">الوصف (من المستخدم)</label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[#0c0b0a] border border-amber-900/30 p-4 rounded-xl h-32 resize-none focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-amber-500 uppercase">الخامات (بفاصلة)</label>
                  <input 
                    value={formData.materials} 
                    onChange={(e) => setFormData({...formData, materials: e.target.value})}
                    placeholder="مثال: فضة، عقيق، مرجان"
                    className="w-full bg-[#0c0b0a] border border-amber-900/30 p-3 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-amber-500 uppercase">منطقة المنشأ</label>
                  <input 
                    value={formData.originRegion} 
                    onChange={(e) => setFormData({...formData, originRegion: e.target.value})}
                    placeholder="مثال: صنعاء القديمة، مأرب"
                    className="w-full bg-[#0c0b0a] border border-amber-900/30 p-3 rounded-xl outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {item.images?.map((img: string, i: number) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-amber-900/20 shadow-xl">
                    <img src={img} className="w-full h-full object-cover" />
                  </div>
                ))}
                {item.audioUrl && (
                  <div className="col-span-full bg-amber-900/10 p-6 rounded-2xl border border-amber-500/20 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center text-white shrink-0">
                      <Sparkles size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold mb-2">تسجيل صوتي مرافق</p>
                      <audio controls src={item.audioUrl} className="w-full h-8" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <div className="bg-amber-900/10 border border-amber-500/20 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Sparkles size={20} />
                    <h3 className="font-bold">تحليل الذكاء الاصطناعي (Gemini)</h3>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-100/40 uppercase">السياق التاريخي المقترح</label>
                    <textarea 
                      value={formData.historicalContext} 
                      onChange={(e) => setFormData({...formData, historicalContext: e.target.value})}
                      className="w-full bg-[#0c0b0a] border border-amber-900/30 p-4 rounded-xl h-40 resize-none text-amber-100/80 italic leading-relaxed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-amber-100/40 uppercase">الكلمات المفتاحية (Tags)</label>
                    <input 
                      value={formData.tags} 
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="w-full bg-[#0c0b0a] border border-amber-900/30 p-3 rounded-xl text-amber-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Expert Actions */}
          <div className="flex-1 bg-[#161513] border-r border-amber-900/20 p-8 flex flex-col">
            <div className="space-y-6">
              <div className="p-4 bg-amber-900/5 rounded-2xl border border-amber-900/10">
                <div className="text-xs text-amber-500 font-bold mb-4 uppercase flex items-center gap-2">
                   <History size={14} /> حالة العنصر
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${item.status === 'flagged' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="font-bold">{item.status === 'flagged' ? 'يحتاج مراجعة دقيقة' : 'بانتظار المراجعة'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold">اتخاذ إجراء بصفتك خبيراً:</h4>
                <button 
                  onClick={handleSaveAndVerify}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  اعتماد ونشر في المتحف
                </button>
                
                <div className="pt-4 border-t border-amber-900/10">
                  {!isFlagging ? (
                    <button 
                      onClick={() => setIsFlagging(true)}
                      className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 py-4 rounded-2xl font-bold border border-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <AlertTriangle size={20} />
                      تأجيل / إبلاغ (Flag)
                    </button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <textarea 
                        value={formData.flagReason}
                        onChange={(e) => setFormData({...formData, flagReason: e.target.value})}
                        placeholder="اكتب سبب التأجيل أو الملاحظات للمستخدم..."
                        className="w-full bg-[#0c0b0a] border border-red-900/30 p-4 rounded-2xl h-32 focus:ring-1 focus:ring-red-500 outline-none text-sm"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setIsFlagging(false)} className="flex-1 py-3 text-xs opacity-50">إلغاء</button>
                        <button onClick={handleFlag} className="flex-2 bg-red-600 text-white py-3 rounded-xl font-bold text-xs ring-offset-2 ring-red-500/20">تأكيد الإبلاغ</button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-8 border-t border-amber-900/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-amber-100/40 uppercase font-bold">الموثق</p>
                  <p className="text-sm font-bold leading-none">{item.ownerName || 'مواطن يمني'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-amber-100/40">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-amber-100/40 uppercase font-bold">تاريخ الإرسال</p>
                  <p className="text-sm font-medium leading-none">
                    {item.createdAt?.toDate ? format(item.createdAt.toDate(), 'do MMMM yyyy HH:mm', { locale: ar }) : 'غير معروف'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
