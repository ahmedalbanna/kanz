import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, MapPin, Tag, Clock, Package, Music } from 'lucide-react';

export function ArtifactModal({ artifact, isOpen, onClose }: { artifact: any | null, isOpen: boolean, onClose: () => void }) {
  if (!artifact) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-[#161513] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-amber-900/30 shadow-2xl flex flex-col md:flex-row"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black p-2 rounded-full text-white transition-colors border border-white/10"
            >
              <X size={20} />
            </button>

            {/* Left/Top Side: Images & Media */}
            <div className="w-full md:w-1/2 bg-black flex flex-col">
              <div className="aspect-square w-full relative">
                <img 
                  src={artifact.images?.[0] || 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=800'} 
                  className="w-full h-full object-cover"
                  alt={artifact.title}
                />
              </div>
              {/* Additional Thumbnails if any */}
              {artifact.images && artifact.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {artifact.images.map((img: string, i: number) => (
                    <img key={i} src={img} className="w-20 h-20 object-cover rounded-xl cursor-pointer border-2 border-transparent hover:border-amber-500 transition-colors" />
                  ))}
                </div>
              )}
              {/* Audio player if any */}
              {artifact.audioUrl && (
                <div className="p-4 bg-amber-900/10 border-t border-amber-900/30 mt-auto flex items-center gap-4">
                   <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white shrink-0">
                     <Music size={20} />
                   </div>
                   <audio controls src={artifact.audioUrl} className="w-full h-10 [&::-webkit-media-controls-panel]:bg-amber-900/20" />
                </div>
              )}
            </div>

            {/* Right/Bottom Side: Details */}
            <div className="w-full md:w-1/2 p-8 md:p-10 space-y-8 flex flex-col justify-start">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-amber-600/20 text-amber-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-600/30">
                    {artifact.category}
                  </span>
                  {artifact.status === 'verified' && (
                    <span className="bg-emerald-600/20 text-emerald-500 px-3 py-1 rounded-full text-xs font-bold border border-emerald-600/30 flex items-center gap-1">
                      موثق من الخبراء
                    </span>
                  )}
                </div>
                <h2 className="text-3xl font-bold mb-2">{artifact.title}</h2>
                
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full bg-amber-900/30 flex items-center justify-center text-amber-500 border border-amber-500/20">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-amber-100/40">مالك التحفة / الموثق</p>
                    <p className="font-bold">{artifact.ownerName || 'مواطن يمني'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-amber-100/70 leading-relaxed text-sm">
                <p>{artifact.description}</p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4">
                {artifact.materials && artifact.materials.length > 0 && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-2 text-amber-500">
                      <Package size={16} />
                      <span className="text-xs font-bold uppercase">الخامات</span>
                    </div>
                    <p className="text-sm font-medium">{artifact.materials.join('، ')}</p>
                  </div>
                )}
                {artifact.estimatedAge && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 mb-2 text-amber-500">
                      <Clock size={16} />
                      <span className="text-xs font-bold uppercase">العمر التقديري</span>
                    </div>
                    <p className="text-sm font-medium">{artifact.estimatedAge}</p>
                  </div>
                )}
                {artifact.originRegion && (
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5 col-span-2">
                    <div className="flex items-center gap-2 mb-2 text-amber-500">
                      <MapPin size={16} />
                      <span className="text-xs font-bold uppercase">منطقة المنشأ</span>
                    </div>
                    <p className="text-sm font-medium">{artifact.originRegion}</p>
                  </div>
                )}
              </div>

              {artifact.historicalContext && (
                <div className="bg-amber-900/10 border border-amber-500/20 p-5 rounded-2xl">
                  <h4 className="text-amber-500 font-bold mb-2 flex items-center gap-2 text-sm">
                    سياق تاريخي
                  </h4>
                  <p className="text-xs leading-relaxed text-amber-100/60 italic">
                    {artifact.historicalContext}
                  </p>
                </div>
              )}

              {artifact.tags && artifact.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {artifact.tags.map((tag: string, i: number) => (
                    <span key={i} className="flex items-center gap-1 bg-amber-900/30 text-amber-400 text-xs px-3 py-1.5 rounded-xl border border-amber-900/50">
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
