'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Music, 
  ChevronRight, 
  Stars,
  Radio,
  Loader2
} from 'lucide-react';
import { apiService } from '@/lib/api';

export default function ArtistsPage() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const data = await apiService.getPerformers();
        setArtists(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const filtered = artists.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && artists.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <div className="flex items-center gap-3 text-indigo-600 mb-4 font-black uppercase tracking-[0.4em] text-[10px]">
            <Stars className="w-4 h-4" />
            Spotlight
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter">Performers</h1>
          <p className="text-slate-500 font-medium mt-4">Discover artists playing across Belgium.</p>
        </div>

        <div className="relative group w-full max-w-md">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 focus:border-indigo-600 rounded-2xl pl-16 pr-8 py-4 font-bold text-slate-900 outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((artist, idx) => (
            <motion.div
              layout
              key={artist.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-slate-50 p-3 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                  <Music className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                  <Radio className="w-3 h-3" />
                  Active
                </div>
              </div>
              
              <h3 className="text-lg font-black text-slate-900 mb-2 truncate">{artist.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-4 border-b border-slate-50">Local Artist Group</p>
              
              <div className="flex items-center justify-between mt-4 text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span className="text-[10px] font-black uppercase tracking-widest">View Schedule</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
           <Music className="w-12 h-12 text-slate-200 mx-auto mb-4" />
           <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No artists found matching "{search}"</p>
        </div>
      )}
    </main>
  );
}
