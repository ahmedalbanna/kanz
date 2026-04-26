import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { MapPin, Info, ArrowUpLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Fix typical Leaflet icon issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// A custom icon
const yemenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export function MapExplorer({ onArtifactSelect }: { onArtifactSelect: (artifact: any) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const q = query(collection(db, 'artifacts'), where('status', '==', 'verified'));
        const snap = await getDocs(q);
        const data = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          // Ensure they have valid locations
          .filter((doc: any) => doc.location && doc.location.lat && doc.location.lng);
        
        setItems(data);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, 'artifacts');
      } finally {
        setLoading(false);
      }
    };
    fetchGeoData();
  }, []);

  return (
    <div className="relative w-full h-[70vh] rounded-3xl overflow-hidden border border-amber-900/30">
      <div className="absolute top-4 right-4 z-[400] bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-amber-500/20 text-sm font-bold flex items-center gap-2">
        <MapPin size={18} className="text-amber-500" />
        خريطة كنوز اليمن
      </div>
      
      <MapContainer 
        center={[15.3694, 44.1910]} // Sana'a as default
        zoom={6} 
        style={{ height: '100%', width: '100%', backgroundColor: '#0c0b0a' }}
        attributionControl={false}
      >
        {/* Using a dark themed tile layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {items.map(item => (
          <Marker 
            key={item.id} 
            position={[item.location.lat, item.location.lng]}
            icon={yemenIcon}
          >
            <Popup className="custom-popup">
              <div className="w-48 !bg-[#161513] !text-[#e5e1d8] rounded-xl overflow-hidden p-0 m-0 border-none">
                <img 
                  src={item.images?.[0] || 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&q=80&w=200'} 
                  className="w-full h-24 object-cover" 
                  alt={item.title} 
                />
                <div className="p-3">
                  <h4 className="font-bold text-amber-500 mb-1 line-clamp-1 text-sm">{item.title}</h4>
                  <p className="text-xs text-amber-100/60 mb-3 line-clamp-2">{item.description}</p>
                  <button 
                    onClick={(e) => {
                       e.stopPropagation();
                       onArtifactSelect(item);
                    }}
                    className="w-full bg-amber-600/20 hover:bg-amber-600/40 text-amber-500 py-1.5 rounded-lg text-xs font-bold transition-colors flex justify-center items-center gap-1"
                  >
                    عرض التفاصيل
                    <ArrowUpLeft size={14} />
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
