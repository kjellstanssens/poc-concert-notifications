'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Terminal, 
  Activity, 
  Database,
  Cloud,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { ConcertCard } from '@/components/ConcertCard';
import { apiService } from '@/lib/api';

export default function DiscoverPage() {
  const [concerts, setConcerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiService.getConcerts();
        setConcerts(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFDFF] pb-32">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-2xl">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">Live Discover</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Real-time Feed</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Found:</span>
            <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-black">{concerts.length}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Upcoming Performances</h2>
          <p className="text-slate-500 font-medium">Synced from across the Belgian music scene.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {concerts.map((concert, idx) => (
              <ConcertCard key={concert.id} concert={concert} idx={idx} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}