import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Mic, 
  Upload, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  MapPin,
  Tag,
  Award
} from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { transcribeAndAnalyzeHeritage } from '../lib/gemini';

type Step = 'media' | 'details' | 'ai' | 'success';

export function DocumentationWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>('media');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'folklore',
    imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=800',
    audioUrl: '',
    location: null as any
  });
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAiAnalyze = async () => {
    if (!formData.description && !formData.title) return;
    setIsAnalyzing(true);
    const result = await transcribeAndAnalyzeHeritage('', formData.description || formData.title);
    if (result) {
      setAiAnalysis(result);
      setFormData(prev => ({
        ...prev,
        title: result.title || prev.title,
        category: result.category || prev.category
      }));
      setStep('ai');
    }
    setIsAnalyzing(false);
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'artifacts'), {
        ...formData,
        ...aiAnalysis,
        ownerId: auth.currentUser.uid,
        ownerName: auth.currentUser.displayName,
        createdAt: serverTimestamp(),
        status: 'pending',
        isPublic: true
      });
      setStep('success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'artifacts');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-[#161513] border border-amber-900/20 rounded-[2rem] overflow-hidden shadow-2xl">
        {/* Progress Bar */}
        <div className="h-1 bg-amber-900/20 flex">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: step === 'media' ? '25%' : step === 'details' ? '50%' : step === 'ai' ? '75%' : '100%' }}
            className="bg-amber-500 h-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
          />
        </div>

        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {step === 'media' && (
              <motion.div 
                key="media"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold">ارفع صور كنزك</h2>
                  <p className="text-amber-100/40">صور القطعة من زوايا مختلفة للحفاظ على أدق تفاصيلها.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="aspect-square border-2 border-dashed border-amber-900/30 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-amber-500/50 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera className="text-amber-500" size={32} />
                    </div>
                    <span className="font-bold">استخدام الكاميرا</span>
                  </div>
                  <div className="aspect-square border-2 border-dashed border-amber-900/30 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-amber-500/50 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="text-blue-500" size={32} />
                    </div>
                    <span className="font-bold">رفع ملفات</span>
                  </div>
                </div>

                <button 
                  onClick={() => setStep('details')}
                  className="w-full bg-amber-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  الخطوة التالية
                  <ChevronLeft size={20} />
                </button>
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold">احكي لنا القصة</h2>
                  <p className="text-amber-100/40">سجل صوتك أو اكتب ما تعرفه عن تاريخ هذه القطعة.</p>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <textarea 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="هذا الخنجر يعود لجدي، اشتراه من سوق الملح في صنعاء قبل 50 عاماً..."
                      className="w-full h-40 bg-[#0c0b0a] border border-amber-900/30 rounded-2xl p-6 focus:ring-2 focus:ring-amber-500 outline-none text-lg resize-none"
                    />
                    <button className="absolute bottom-4 left-4 bg-red-500/20 text-red-500 p-3 rounded-full hover:bg-red-500 hover:text-white transition-all animate-pulse">
                      <Mic size={24} />
                    </button>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep('media')}
                      className="flex-1 bg-white/5 py-4 rounded-2xl font-bold border border-white/10"
                    >
                      رجوع
                    </button>
                    <button 
                      onClick={handleAiAnalyze}
                      disabled={isAnalyzing}
                      className="flex-[2] bg-amber-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                    >
                      {isAnalyzing ? "جارٍ تحليل التراث..." : "تحليل ذكي وحفظ"}
                      {!isAnalyzing && <Sparkles size={20} />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'ai' && (
              <motion.div 
                key="ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
                    مراجعة الخبير الرقمي
                    <Sparkles className="text-amber-500" />
                  </h2>
                  <p className="text-amber-100/40">قام الذكاء الاصطناعي بتصنيف وتوثيق قطعتك بناءً على وصفك.</p>
                </div>

                <div className="bg-[#0c0b0a] p-8 rounded-3xl border border-amber-500/20 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <span className="text-xs text-amber-500 font-bold uppercase">الاسم المقترح</span>
                      <p className="text-2xl font-bold">{aiAnalysis?.title}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-amber-500 font-bold uppercase">التصنيف</span>
                      <p className="text-xl font-bold flex items-center gap-2">
                        <Tag size={18} className="text-amber-100/40" />
                        {aiAnalysis?.category}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-amber-500 font-bold uppercase">السياق التاريخي</span>
                    <p className="text-amber-100/60 leading-relaxed italic border-l-2 border-amber-500/30 pl-4 py-2 bg-amber-500/5">
                      {aiAnalysis?.historicalContext}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis?.tags?.map((tag: string) => (
                      <span key={tag} className="bg-amber-900/30 text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-900/50">#{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep('details')}
                    className="flex-1 bg-white/5 py-4 rounded-2xl font-bold border border-white/10"
                  >
                    تعديل
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-[2] bg-emerald-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "جارٍ التثبيت في السجل..." : "إيداع في الكنز الوطني"}
                    {!isSubmitting && <CheckCircle2 size={20} />}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-8 py-12"
              >
                <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold">تم حفظ كنزك للأبد!</h2>
                  <p className="text-amber-100/60 max-w-md mx-auto">
                    بصفتك حارساً للتراث، قمت للتو بمهمة وطنية عظيمة. قطعتك الآن مسجلة في السجل الرقمي الوطني لليمن.
                  </p>
                </div>
                
                <div className="bg-amber-900/10 border border-amber-500/20 p-6 rounded-2xl inline-block">
                  <div className="flex items-center gap-4">
                    <Award className="text-amber-500" size={32} />
                    <div className="text-right">
                      <div className="text-sm font-bold">شهادة بصمة رقمية</div>
                      <div className="text-[10px] opacity-40">Serial: KNZ-{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={onComplete}
                  className="w-full bg-amber-600 py-4 rounded-2xl font-bold lg:w-1/2 mx-auto"
                >
                  العودة للمتحف
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
