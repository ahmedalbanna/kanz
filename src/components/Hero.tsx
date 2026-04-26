import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Play, Info } from 'lucide-react';

export function Hero({ onDocumentClick }: { onDocumentClick: () => void }) {
  return (
    <section className="relative h-[80vh] flex items-center overflow-hidden">
      {/* Background with texture */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540263437617-66236b28399e?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
      <div className="absolute inset-0 bg-gradient-to-l from-[#0f0e0c] via-[#0f0e0c]/80 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 w-full relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            السجل الوطني الأول للتراث
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
            اليمن متحف...<br />
            وندعوك <span className="text-amber-500 underline decoration-amber-900 underline-offset-8 transition-all hover:decoration-amber-500">لحفظه</span>
          </h1>
          
          <p className="text-lg md:text-xl text-amber-100/60 leading-relaxed max-w-lg">
            منصة "كـنز" هي سفينة نوح الرقمية لحماية تاريخ اليمن من الاندثار. وثق مقتنياتك الأثرية، حكايات أجدادك، وتجول افتراضياً في قلب التاريخ.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={onDocumentClick}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-bold transition-all shadow-xl shadow-amber-900/40 flex items-center gap-3 group"
            >
              شارِك بكنزك
              <div className="bg-white/20 p-1 rounded-full group-hover:translate-x-[-4px] transition-transform">
                <ChevronLeft size={20} />
              </div>
            </button>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-full font-bold transition-all flex items-center gap-3">
              <Play size={20} fill="currentColor" />
              شاهد القصة
            </button>
          </div>
        </motion.div>

        {/* Visual Element */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hidden md:block relative"
        >
          <div className="w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-3xl absolute -top-10 -right-10"></div>
          <div className="relative border border-amber-900/30 p-4 rounded-3xl backdrop-blur-sm">
            <img 
              src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=2670&auto=format&fit=crop" 
              className="rounded-2xl shadow-2xl grayscale hover:grayscale-0 transition-all duration-700 h-[500px] w-full object-cover"
              alt="Yemeni Heritage"
            />
            <div className="absolute -bottom-6 -left-6 bg-[#1a1917] border border-amber-500/20 p-6 rounded-2xl shadow-2xl max-w-xs space-y-2">
              <div className="text-amber-500 font-bold">بصمة وطنية رقمية</div>
              <p className="text-xs text-amber-100/40">موثق بتقنية البصمة الرقمية لضمان حقوق الملكية ومنع التزييف.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
