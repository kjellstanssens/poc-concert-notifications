'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Terminal, 
  Activity, 
  ChevronRight,
  Loader2,
  Calendar,
  Compass,
  Zap,
  Music,
  Bell,
  MapPin,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { ConcertCard } from '@/components/ConcertCard';
import { apiService } from '@/lib/api';

export default function LandingPage() {
  const [concerts, setConcerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiService.getConcerts();
        // Just take the latest 6
        setConcerts(Array.isArray(data) ? data.slice(0, 6) : []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#FDFDFF] pb-32">
      {/* Hero Section */}
      <section className="relative pt-24 pb-48 px-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="max-w-4xl"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="bg-slate-900 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-2xl flex items-center gap-3">
                 <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                 Beta Access Protocol v4.0.1
              </div>
              <div className="h-[1px] w-24 bg-slate-100" />
              <div className="flex items-center gap-2 px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                 <Activity className="w-3.5 h-3.5 fill-emerald-100 animate-pulse" />
                 Live Scanning
              </div>
            </div>

            <h1 className="text-8xl font-[1000] text-slate-900 tracking-tighter leading-[0.9] mb-12 font-sans">
              The Heartbeat of <span className="text-indigo-600 italic">Live Music</span> in Belgium.
            </h1>
            
            <p className="text-2xl text-slate-500 font-medium max-w-2xl leading-relaxed mb-16">
              Aggregating concerts from across the country into one real-time feed. Stay notified, stay ahead.
            </p>

            <div className="flex flex-wrap items-center gap-8">
              <Link href="/discover" className="group flex items-center gap-4 bg-slate-900 text-white px-10 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-black hover:scale-105 active:scale-95 transition-all">
                <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                Explore Discover Feed
                <ChevronRight className="w-4 h-4 text-slate-400 ml-4" />
              </Link>
              
              <div className="flex items-center gap-4 px-8 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                 <div className="flex -space-x-4">
                    {[1,2,3].map(i => (
                       <div key={i} className={`w-10 h-10 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-[10px] font-black text-slate-400`}>U</div>
                    ))}
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-nowrap">+ 1.2k Watching</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Discovery Strip */}
      <section className="bg-white border-y border-slate-50 py-32 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-20">
             <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tight">Recent Discoveries</h2>
                <div className="flex items-center gap-3 mt-4">
                  <span className="h-1 w-12 bg-indigo-600 rounded-full" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Fresh synced performances from the Belgian scene</p>
                </div>
             </div>
             
             <Link href="/discover" className="flex items-center gap-3 text-indigo-600 font-black uppercase tracking-widest text-[11px] hover:translate-x-3 transition-transform">
                View Archive Cluster
                <ChevronRight className="w-4 h-4" />
             </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-96 bg-slate-50 rounded-[3rem] animate-pulse border border-slate-100 flex items-center justify-center">
                     <Loader2 className="w-8 h-8 text-slate-200 animate-spin" />
                  </div>
                ))
              ) : (
                concerts.map((concert, idx) => (
                  <ConcertCard key={concert.id} concert={concert} idx={idx} />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Logic Blocks */}
      <section className="max-w-7xl mx-auto py-40 px-8">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
               { title: "Artists Cluster", desc: "Browse a collective registry of local and international performers playing in BE.", icon: Music, link: "/artists", label: "Performers" },
               { title: "Registry Hub", desc: "Access the decentralized database of venues, from club basements to arenas.", icon: MapPin, link: "/venues", label: "Venues" },
               { title: "Alert Mission", desc: "Configure high-priority notification triggers for your favorite acts.", icon: Bell, link: "/alerts", label: "Surveillance" },
            ].map((block, i) => (
               <Link key={i} href={block.link} className="bg-slate-50 border border-slate-100 p-12 rounded-[4rem] group hover:bg-white hover:shadow-2xl hover:shadow-indigo-50 hover:border-indigo-100 transition-all duration-500 flex flex-col items-start gap-8">
                  <div className="bg-white p-6 rounded-[2rem] shadow-sm group-hover:bg-indigo-600 transition-all duration-500">
                     <block.icon className="w-8 h-8 text-slate-400 group-hover:text-white transition-all duration-500" />
                  </div>
                  <div className="space-y-4">
                     <h3 className="text-3xl font-black text-slate-900 tracking-tight">{block.title}</h3>
                     <p className="text-slate-500 font-medium leading-relaxed">{block.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-indigo-600 font-black uppercase tracking-widest text-[10px]">
                     Deploy {block.label}
                     <ExternalLink className="w-3.5 h-3.5" />
                  </div>
               </Link>
            ))}
         </div>
      </section>

      {/* Footer System */}
      <footer className="max-w-7xl mx-auto pt-32 px-8">
        <div className="border-t border-slate-100 py-16 flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
           <div className="flex items-center gap-4">
              <Terminal className="w-5 h-5" />
              BELIVE-CORE CLUSTER v1.0.0
           </div>
           <div className="flex items-center gap-12">
              <span className="hover:text-indigo-600 cursor-pointer">Protocol API</span>
              <span className="hover:text-indigo-600 cursor-pointer">Security Ledger</span>
              <span className="hover:text-indigo-600 cursor-pointer text-slate-900">Uptime: 99.9%</span>
           </div>
        </div>
      </footer>
    </main>
  );
}
