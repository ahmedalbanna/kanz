import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Shield, CheckCircle2, Package } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';

export function UserProfile() {
  const [user, setUser] = useState<any>(auth.currentUser);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: '',
    photoURL: user?.photoURL || ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
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
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Update Auth Profile
      await updateProfile(user, {
        displayName: formData.displayName,
        photoURL: formData.photoURL || user.photoURL
      });
      // Update Firestore Profile
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

  if (!user) {
    return <div className="text-center py-20 text-amber-500/50">يرجى تسجيل الدخول لعرض ملفك الشخصي.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#161513] rounded-3xl overflow-hidden border border-amber-900/30 p-8 shadow-2xl"
      >
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group w-32 h-32 rounded-full overflow-hidden border-2 border-amber-500/30">
              <img src={formData.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300'} alt="Profile" className="w-full h-full object-cover" />
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer">
                   <span className="text-xs font-bold w-3/4 text-center">تحديث الصورة (أدخل رابط)</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm font-bold bg-amber-900/30 text-amber-500 px-4 py-1 rounded-full">
              <Shield size={16} />
              {profile?.role === 'expert' ? 'خبير تراثي' : profile?.role === 'admin' ? 'مدير النظام' : 'مساهم'}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 space-y-6 w-full">
            <div>
              <label className="block text-xs font-bold text-amber-500 mb-2 uppercase">الاسم</label>
              {isEditing ? (
                <input 
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full bg-[#0c0b0a] border border-amber-900/50 rounded-xl p-3 focus:border-amber-500 outline-none text-white"
                />
              ) : (
                <div className="text-2xl font-bold">{formData.displayName || 'مستخدم بلا اسم'}</div>
              )}
            </div>
            
            {isEditing && (
               <div>
                  <label className="block text-xs font-bold text-amber-500 mb-2 uppercase">رابط الصورة الشخصية</label>
                  <input 
                    value={formData.photoURL}
                    onChange={(e) => setFormData({...formData, photoURL: e.target.value})}
                    placeholder="https://..."
                    className="w-full bg-[#0c0b0a] border border-amber-900/50 rounded-xl p-3 focus:border-amber-500 outline-none text-white"
                  />
               </div>
            )}

            <div>
              <label className="block text-xs font-bold text-amber-500 mb-2 uppercase flex items-center gap-2">
                <Mail size={14} /> البريد الإلكتروني
              </label>
              <div className="text-amber-100/60">{user.email} {user.emailVerified && <CheckCircle2 size={14} className="inline text-emerald-500" />}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-500 mb-2 uppercase">نبذة (Bio)</label>
              {isEditing ? (
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-[#0c0b0a] border border-amber-900/50 rounded-xl p-3 focus:border-amber-500 outline-none text-white h-24 resize-none"
                  placeholder="حدثنا عن اهتمامك بالتراث، أو مهنتك المرتبطة به..."
                />
              ) : (
                <div className="text-amber-100/80 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5 min-h-[5rem]">
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
    </div>
  );
}
