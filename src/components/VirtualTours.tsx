import React from 'react';
import { motion } from 'motion/react';
import { Map, Info, Compass, ExternalLink, MapPin } from 'lucide-react';

const tours = [
  {
    id: 1,
    title: 'عرش بلقيس - مأرب',
    image: 'https://images.unsplash.com/photo-1540263437617-66236b28399e?auto=format&fit=crop&q=80&w=1200',
    description: 'تجول في معبد أوام ومملكة سبأ القديمة واستمع لصوت التاريخ يروي حضارة آلاف السنين.',
    points: 12
  },
  {
    id: 2,
    title: 'صنعاء القديمة - باب اليمن',
    image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=1200',
    description: 'عِش تجربة حية في أزقة صنعاء، بين عبق البن والبهارات وأهازيج البنائين.',
    points: 34
  },
  {
    id: 3,
    title: 'مدينة شبام - منهاتن الصحراء',
    image: 'https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?auto=format&fit=crop&q=80&w=1200',
    description: 'ناطحات سحاب طينية تتحدى الزمن. استكشف الهندسة المعمارية الفريدة لوادي حضرموت.',
    points: 8
  }
];

export function VirtualTours() {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
        <div className="space-y-4">
          <div className="bg-amber-600/10 text-amber-500 px-3 py-1 rounded-full text-xs font-bold w-fit">نافذة على اليمن</div>
          <h2 className="text-4xl font-bold">السياحة الافتراضية</h2>
          <p className="text-amber-100/40 max-w-xl">زور اليمن وأنت في بيتك. جولات 360 درجة تفاعلية تذهب ريع اشتراكها لصيانة المعالم الأثرية والمجتمعات المحلية.</p>
        </div>
        <button className="flex items-center gap-2 text-amber-500 font-bold hover:underline">
          <Map size={20} />
          خريطة المواقع التراثية
        </button>
      </div>

      <div className="space-y-12">
        {tours.map((tour, idx) => (
          <motion.div
            key={tour.id}
            initial={{ opacity: 0, x: idx % 2 === 0 ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 md:gap-16 items-center`}
          >
            <div className="flex-1 w-full relative group">
              <div className="absolute -inset-4 bg-amber-600/5 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative aspect-[16/9] rounded-[2rem] overflow-hidden border border-amber-900/20 shadow-2xl">
                <img src={tour.image} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt={tour.title} />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-md p-6 rounded-full text-white cursor-pointer hover:scale-125 transition-all">
                    <Compass size={48} className="animate-spin-slow" />
                  </div>
                </div>
                <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-xs flex items-center gap-2">
                  <MapPin size={14} className="text-amber-500" />
                  {tour.points} نقطة تفاعل
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6 text-center md:text-right">
              <h3 className="text-3xl font-bold">{tour.title}</h3>
              <p className="text-amber-100/60 text-lg leading-relaxed">{tour.description}</p>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                <button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-xl shadow-amber-900/20">
                  ابدأ الجولة الآن
                  <ExternalLink size={18} />
                </button>
                <button className="bg-white/5 border border-white/10 px-8 py-4 rounded-full font-bold flex items-center gap-3">
                  <Info size={18} />
                  عن المعلم
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
