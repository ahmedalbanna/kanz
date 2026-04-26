import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Shield, 
  CheckCircle2, 
  Package, 
  Bell, 
  Clock, 
  AlertTriangle, 
  Trash2,
  ChevronLeft,
  ExternalLink
} from 'lucide-react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export function UserProfile() {
  const [user] = useState<any>(auth.currentUser);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: '',
    photoURL: user?.photoURL || ''
  });
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [myArtifacts, setMyArtifacts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'artifacts'>('profile');

  useEffect(() => {
    if (!user) return;
    
    // Fetch profile
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
          setFormData(prev => ({ ...prev, bio: docSnap.data().bio || '' }));
        }
      } catch (err) {
         handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      }
    };
    fetchProfile();

    // Real-time notifications
    const qNotif = query(
      collection(db, 'notifications'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubNotif = onSnapshot(qNotif, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Real-time my artifacts
    const qArt = query(
      collection(db, 'artifacts'), 
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubArt = onSnapshot(qArt, (snap) => {
      setMyArtifacts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubNotif();
      unsubArt();
    };
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(user, {
        displayName: formData.displayName,
        photoURL: formData.photoURL || user.photoURL
      });
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: formData.displayName,
        photoURL: formData.photoURL || user.photoURL,
        bio: formData.bio,
        role: profile?.role || 'contributor'
      }, { merge: true });
      setProfile({ ...profile, bio: formData.bio, role: profile?.role || 'contributor' });
      setIsEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) { console.error(err); }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (err) { console.error(err); }
  };

  if (!user) {
    return <div className="text-center py-20 text-amber-500/50">يرجى تسجيل الدخول لعرض ملفك الشخصي.</div>;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all ${activeTab === 'profile' ? 'bg-amber-600 text-white shadow-xl shadow-amber-900/20' : 'bg-white/5 text-amber-100/40 hover:bg-white/10'}`}
        >
          <User size={18} /> الملف الشخصي
        </button>
        <button 
          onClick={() => setActiveTab('artifacts')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all relative ${activeTab === 'artifacts' ? 'bg-amber-600 text-white shadow-xl shadow-amber-900/20' : 'bg-white/5 text-amber-100/40 hover:bg-white/10'}`}
        >
          <Package size={18} /> مساهماتي
          {myArtifacts.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-500 text-[#0c0b0a] text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0c0b0a]">
              {myArtifacts.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all relative ${activeTab === 'notifications' ? 'bg-amber-600 text-white shadow-xl shadow-amber-900/20' : 'bg-white/5 text-amber-100/40 hover:bg-white/10'}`}
        >
          <Bell size={18} /> الإشعارات
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0c0b0a] animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#161513] rounded-3xl overflow-hidden border border-amber-900/30 p-8 shadow-2xl"
          >
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group w-32 h-32 rounded-full overflow-hidden border-2 border-amber-500/30">
                  <img src={formData.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300'} alt="Profile" className="w-full h-full object-cover" />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer">
                      <span className="text-xs font-bold w-3/4 text-center">تحديث الصورة (أدخل رابط)</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm font-bold bg-amber-900/30 text-amber-500 px-4 py-1 rounded-full whitespace-nowrap">
                  <Shield size={16} />
                  {profile?.role === 'expert' ? 'خبير تراثي' : profile?.role === 'admin' ? 'مدير النظام' : 'مساهم'}
                </div>
              </div>

              <div className="flex-1 space-y-6 w-full text-right">
                <div>
                  <label className="block text-xs font-bold text-amber-500 mb-2 uppercase">الاسم</label>
                  {isEditing ? (
                    <input 
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className="w-full bg-[#0c0b0a] border border-amber-900/50 rounded-xl p-3 focus:border-amber-500 outline-none text-white text-right"
                    />
                  ) : (
                    <div className="text-2xl font-bold">{formData.displayName || 'مستخدم بلا اسم'}</div>
                  )}
                </div>
                
                {isEditing && (
                  <div>
                    <label className="block text-xs font-bold text-amber-500 mb-2 uppercase text-right">رابط الصورة الشخصية</label>
                    <input 
                      value={formData.photoURL}
                      onChange={(e) => setFormData({...formData, photoURL: e.target.value})}
                      placeholder="https://..."
                      className="w-full bg-[#0c0b0a] border border-amber-900/50 rounded-xl p-3 focus:border-amber-500 outline-none text-white text-right"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-amber-500 mb-2 uppercase flex items-center gap-2 justify-end">
                    {user.email} <Mail size={14} /> البريد الإلكتروني
                  </label>
                  <div className="text-amber-100/60 leading-relaxed">
                    {user.emailVerified && <span className="text-emerald-500 text-xs flex items-center gap-1 justify-end"><CheckCircle2 size={12} /> بريد موثق</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-500 mb-2 uppercase text-right">نبذة (Bio)</label>
                  {isEditing ? (
                    <textarea 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full bg-[#0c0b0a] border border-amber-900/50 rounded-xl p-3 focus:border-amber-500 outline-none text-white h-24 resize-none text-right"
                      placeholder="حدثنا عن اهتمامك بالتراث، أو مهنتك المرتبطة به..."
                    />
                  ) : (
                    <div className="text-amber-100/80 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 min-h-[5rem] text-right">
                      {formData.bio || 'لا توجد نبذة حالياً.'}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  {isEditing ? (
                    <>
                      <button onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-xl text-amber-100/60 hover:bg-white/5 font-bold">إلغاء</button>
                      <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold">
                        {loading ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditing(true)} className="px-6 py-2 border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 rounded-xl font-bold">
                      تعديل الملف
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'artifacts' && (
          <motion.div 
            key="artifacts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {myArtifacts.length === 0 ? (
              <div className="bg-[#161513] rounded-3xl p-12 text-center border border-amber-900/20">
                <Package size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-amber-100/40">لم توثق أي كنوز بعد. كن أول الحارسين لتراث منطقتك!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myArtifacts.map(art => (
                  <div key={art.id} className="bg-[#161513] rounded-2xl border border-amber-900/20 p-4 flex gap-4 hover:border-amber-500/30 transition-all group">
                    <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
                      <img src={art.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-amber-100 line-clamp-1">{art.title}</h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            art.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' : 
                            art.status === 'flagged' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {art.status === 'verified' ? 'معتمد' : art.status === 'flagged' ? 'مرفوض' : 'قيد المراجعة'}
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-100/40 line-clamp-2 mt-1">{art.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-amber-100/30">
                        <Clock size={10} />
                        <span>{art.createdAt?.toDate ? format(art.createdAt.toDate(), 'do MMMM yyyy', { locale: ar }) : ''}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div 
            key="notifications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {notifications.length === 0 ? (
              <div className="bg-[#161513] rounded-3xl p-12 text-center border border-amber-900/20">
                <Bell size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-amber-100/40">لا توجد إشعارات حالياً.</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  onClick={() => !notif.read && markAsRead(notif.id)}
                  className={`bg-[#161513] rounded-2xl p-4 border transition-all flex items-start gap-4 group cursor-pointer ${
                    notif.read ? 'border-amber-900/10 opacity-70' : 'border-amber-500/30 shadow-lg shadow-amber-900/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    notif.type === 'approval' ? 'bg-emerald-500/10 text-emerald-500' : 
                    notif.type === 'flag' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {notif.type === 'approval' ? <CheckCircle2 size={20} /> : notif.type === 'flag' ? <AlertTriangle size={20} /> : <Bell size={20} />}
                  </div>
                  <div className="flex-1 text-right">
                    <p className={`text-sm mb-1 ${notif.read ? 'text-amber-100/60' : 'text-amber-100 font-bold'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 justify-end text-[10px] text-amber-100/30">
                      <span>{notif.createdAt?.toDate ? format(notif.createdAt.toDate(), 'do MMMM yyyy HH:mm', { locale: ar }) : ''}</span>
                      <Clock size={10} />
                    </div>
                  </div>
                  <button 
                    onClick={(e) => deleteNotification(notif.id, e)}
                    className="p-2 text-amber-100/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
