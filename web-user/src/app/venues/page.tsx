'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  ChevronRight, 
  Activity,
  Globe,
  Loader2
} from 'lucide-react';
import { apiService } from '@/lib/api';

export default function VenuesPage() {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const data = await apiService.getVenues();
        setVenues(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  const filtered = venues.filter(v => 
    (v.venue_name || v.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (v.city || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading && venues.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-4">
        <div>
          <div className="flex items-center gap-3 text-indigo-600 mb-4 font-black uppercase tracking-[0.4em] text-[10px]">
             <Activity className="w-4 h-4" />
             Live Registry
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter">Music Venues</h1>
          <p className="text-slate-500 font-medium mt-4">Belgian hotspots for live performance.</p>
        </div>

        <div className="relative group w-full max-w-md">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
           <input 
             type="text"
             placeholder="Search by name or city..." 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full bg-white border-2 border-slate-100 focus:border-indigo-600 rounded-3xl pl-16 pr-8 py-5 font-bold text-slate-900 outline-none transition-all"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((venue, idx) => (
            <motion.div
              layout
              key={venue.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                    <MapPin className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                    {venue.province || 'Region Unknown'}
                  </div>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 mb-2">{venue.venue_name || venue.name}</h3>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] mb-6">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="truncate">{venue.city}</span>
                </div>
              </div>
              
              <div className="pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between text-indigo-600 group-hover:translate-x-1 transition-transform">
                  <span className="text-[10px] font-black uppercase tracking-widest">View Concerts</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
           <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-4" />
           <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No venues found matching "{search}"</p>
        </div>
      )}
    </main>
  );
}
