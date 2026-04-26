import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Map, 
  BookOpen, 
  PlusCircle, 
  Search, 
  User, 
  Award, 
  Music, 
  ChevronRight,
  Menu,
  X,
  History,
  Languages,
  ShieldAlert
} from 'lucide-react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Components
import { Hero } from './components/Hero';
import { CategoryGrid } from './components/CategoryGrid';
import { FeaturedArtifacts } from './components/FeaturedArtifacts';
import { DocumentationWizard } from './components/DocumentationWizard';
import { VirtualTours } from './components/VirtualTours';
import { UserProfile } from './components/UserProfile';
import { ExpertPanel } from './components/ExpertPanel';
import { MapExplorer } from './components/MapExplorer';
import { ArtifactModal } from './components/ArtifactModal';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'museum' | 'document' | 'tours' | 'map' | 'profile' | 'expert'>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsub;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    signOut(auth);
    setActiveTab('home');
  };

  const openArtifactModal = (artifact: any) => {
    setSelectedArtifact(artifact);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0f0e0c] text-[#e5e1d8] font-sans selection:bg-amber-500/30" dir="rtl">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f0e0c]/80 backdrop-blur-md border-b border-amber-900/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-900/20">
              <Award className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tighter text-amber-500">كـنز</h1>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button onClick={() => setActiveTab('home')} className={`hover:text-amber-500 transition-colors ${activeTab === 'home' ? 'text-amber-500' : ''}`}>الرئيسية</button>
            <button onClick={() => setActiveTab('museum')} className={`hover:text-amber-500 transition-colors ${activeTab === 'museum' ? 'text-amber-500' : ''}`}>المتحف</button>
            <button onClick={() => setActiveTab('tours')} className={`hover:text-amber-500 transition-colors ${activeTab === 'tours' ? 'text-amber-500' : ''}`}>جولات افتراضية</button>
            <button onClick={() => setActiveTab('map')} className={`hover:text-amber-500 transition-colors flex items-center gap-1 ${activeTab === 'map' ? 'text-amber-500' : ''}`}><Map size={16}/> خريطة الكنوز</button>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveTab('document')}
                  className="hidden md:flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-full transition-all text-sm shadow-xl shadow-amber-900/20"
                >
                  <PlusCircle size={18} />
                  وثق كنزك
                </button>
                <div className="relative group cursor-pointer" onClick={() => setActiveTab('profile')}>
                  <img src={user.photoURL} className="w-9 h-9 rounded-full border-2 border-amber-500/30 group-hover:border-amber-500 transition-colors" alt={user.displayName} />
                  {/* Small popup on hover config maybe? */}
                </div>
                <button onClick={() => setActiveTab('expert')} className="hidden lg:block text-amber-100/40 hover:text-amber-500" title="لوحة الخبراء">
                   <ShieldAlert size={18}/>
                </button>
                <button onClick={logout} className="text-xs opacity-50 hover:opacity-100">خروج</button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 border border-amber-500/30 px-5 py-2 rounded-full transition-all text-sm font-bold"
              >
                تسجيل الدخول
              </button>
            )}
            
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#0f0e0c] pt-24 px-6 flex flex-col gap-6"
          >
            <button onClick={() => {setActiveTab('home'); setIsMenuOpen(false)}} className="text-2xl border-b border-amber-900/20 pb-4 text-right">الرئيسية</button>
            <button onClick={() => {setActiveTab('museum'); setIsMenuOpen(false)}} className="text-2xl border-b border-amber-900/20 pb-4 text-right">المتحف</button>
            <button onClick={() => {setActiveTab('tours'); setIsMenuOpen(false)}} className="text-2xl border-b border-amber-900/20 pb-4 text-right">جولات افتراضية</button>
            <button onClick={() => {setActiveTab('map'); setIsMenuOpen(false)}} className="text-2xl border-b border-amber-900/20 pb-4 text-right flex items-center gap-2"><Map/> خريطة الكنوز</button>
            {user && (
              <>
                <button onClick={() => {setActiveTab('profile'); setIsMenuOpen(false)}} className="text-2xl border-b border-amber-900/20 pb-4 text-right">ملفي الشخصي</button>
                <button onClick={() => {setActiveTab('expert'); setIsMenuOpen(false)}} className="text-2xl border-b border-amber-900/20 pb-4 text-right">لوحة الخبراء</button>
              </>
            )}
            <button onClick={() => {setActiveTab('document'); setIsMenuOpen(false)}} className="text-2xl text-amber-500 text-right mt-4">وثق كنزك</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-24 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'home' && (
              <>
                <Hero onDocumentClick={() => setActiveTab('document')} />
                <CategoryGrid />
                <FeaturedArtifacts onArtifactClick={openArtifactModal} />
                <div className="max-w-7xl mx-auto px-4 mt-20">
                  <div className="bg-amber-900/10 border border-amber-500/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
                    <div className="space-y-4 max-w-xl text-center md:text-right relative z-10">
                      <h2 className="text-3xl font-bold">اليمن متحف مفتوح... وأنت حارسه</h2>
                      <p className="text-amber-100/60 leading-relaxed">
                        كل قطعة أثرية في بيتك، وكل حكاية سمعتها من جدك، هي كنز مهدد بالضياع. ساهم في توثيقها رقمياً لحمايتها من الاندثار والسرقة.
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('document')}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-full font-bold transition-all shadow-xl shadow-amber-900/20 whitespace-nowrap relative z-10"
                    >
                      ابدأ التوثيق الآن
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'museum' && <FeaturedArtifacts fullView onArtifactClick={openArtifactModal} />}
            {activeTab === 'document' && <DocumentationWizard onComplete={() => setActiveTab('museum')} />}
            {activeTab === 'tours' && <VirtualTours />}
            {activeTab === 'map' && (
               <div className="max-w-7xl mx-auto px-4 py-8">
                 <div className="mb-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                      <Map size={32} className="text-amber-500"/> خريطة الكنوز الموثقة
                    </h2>
                    <p className="text-amber-100/40">استكشف القطع والمعالم الأثرية جغرافياً (تظهر فقط الكنوز المعتمدة من الخبراء).</p>
                 </div>
                 <MapExplorer onArtifactSelect={openArtifactModal} />
               </div>
            )}
            {activeTab === 'profile' && <UserProfile />}
            {activeTab === 'expert' && <ExpertPanel />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Artifact Modal */}
      <ArtifactModal artifact={selectedArtifact} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-amber-900/20 py-12 mt-20 bg-[#0c0b0a]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Award className="text-amber-600" size={24} />
            <h2 className="text-xl font-bold">كـنز للحفاظ على التراث</h2>
          </div>
          <div className="flex gap-6 text-sm text-amber-100/40">
            <a href="#" className="hover:text-amber-500 transition-colors">عن المشروع</a>
            <a href="#" className="hover:text-amber-500 transition-colors">شركاء النجاح</a>
            <a href="#" className="hover:text-amber-500 transition-colors">سياسة الخصوصية</a>
          </div>
          <p className="text-xs text-amber-100/20">© 2026 كنز - جميع الحقوق محفوظة لليمن</p>
        </div>
      </footer>
    </div>
  );
}
