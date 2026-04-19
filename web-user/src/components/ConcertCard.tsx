'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, ExternalLink, Sparkles } from 'lucide-react';

interface ConcertCardProps {
  concert: any;
  idx: number;
}

export const ConcertCard = ({ concert, idx }: ConcertCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(79,70,229,0.15)] transition-all duration-500 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-100/50 transition-colors duration-500" />
      
      <div className="relative flex justify-between items-start mb-8">
        <div className="bg-indigo-600 px-6 py-2.5 rounded-full shadow-lg shadow-indigo-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/80" />
          <span className="text-[11px] font-black tracking-widest text-white uppercase">
            {new Date(concert.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        
        {concert.is_new && (
          <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Just Added</span>
          </div>
        )}
      </div>

      <div className="relative space-y-2 mb-8">
        <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
          {concert.performer_name}
        </h3>
        <div className="flex items-center gap-2 text-slate-400">
          <MapPin className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">{concert.venue_name}</span>
        </div>
      </div>

      <div className="relative pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</span>
          <span className="text-sm font-bold text-slate-700">{concert.venue?.city || 'Belgium'}</span>
        </div>
        
        <a 
          href={concert.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-indigo-600 transition-all active:scale-95 group/btn"
        >
          <ExternalLink className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
        </a>
      </div>
    </motion.div>
  );
};
