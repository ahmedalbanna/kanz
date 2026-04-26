import React from 'react';
import { motion } from 'motion/react';
import { 
  Gem, 
  Sword, 
  Scroll, 
  MapPin, 
  UtensilsCrossed, 
  Shirt, 
  Music 
} from 'lucide-react';

const categories = [
  { id: 'jewelry', name: 'الحلي والفضيات', icon: Gem, color: 'bg-indigo-500/10 text-indigo-400' },
  { id: 'weapons', name: 'الخناجر والأسلحة', icon: Sword, color: 'bg-red-500/10 text-red-400' },
  { id: 'manuscripts', name: 'المخطوطات والمصاحف', icon: Scroll, color: 'bg-amber-500/10 text-amber-400' },
  { id: 'architecture', name: 'العمارة التقليدية', icon: MapPin, color: 'bg-emerald-500/10 text-emerald-400' },
  { id: 'food', name: 'المطبخ اليمني', icon: UtensilsCrossed, color: 'bg-orange-500/10 text-orange-400' },
  { id: 'clothing', name: 'الأزياء الشعبية', icon: Shirt, color: 'bg-pink-500/10 text-pink-400' },
  { id: 'folklore', name: 'الحكايات والأهازيج', icon: Music, color: 'bg-blue-500/10 text-blue-400' },
];

export function CategoryGrid() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-end mb-12">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <span className="w-12 h-[1px] bg-amber-500"></span>
            أبواب الكنوز
          </h2>
          <p className="text-amber-100/40">استكشف تراث اليمن المتنوع حسب التصنيف</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {categories.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="group cursor-pointer"
          >
            <div className={`aspect-square rounded-3xl ${cat.color} flex flex-col items-center justify-center p-6 transition-all border border-transparent group-hover:border-current/20`}>
              <cat.icon size={40} className="mb-4 transition-transform group-hover:scale-110" />
              <span className="text-sm font-bold text-center leading-tight">{cat.name}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
