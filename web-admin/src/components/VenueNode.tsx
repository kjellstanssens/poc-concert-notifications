'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Terminal, 
  Trash2, 
  Target, 
  MapPin, 
  Settings2, 
  Activity,
  ChevronRight,
  Database,
  Calendar,
  ExternalLink,
  X,
  Save,
  Info
} from 'lucide-react';
import { useState } from 'react';

interface VenueNodeProps {
  venue: any;
  idx: number;
  updateVenue: (idx: number, field: string, value: any) => void;
  removeVenue: (idx: number) => void;
}

const PROVINCES = [
  "Antwerp",
  "East Flanders",
  "Flemish Brabant",
  "Limburg",
  "West Flanders"
];

export const VenueNode = ({ venue, idx, updateVenue, removeVenue }: VenueNodeProps) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Helper to resolve data from either top-level or scraper_config
  const getData = (path: string) => {
    const segments = path.split('.');
    let current = venue;
    
    // Check first if it's in the top level
    if (segments[0] === 'selectors' || segments[0] === 'date_parsing' || segments[0] === 'performer_strategy') {
      if (venue[segments[0]]) {
        return segments.length > 1 ? venue[segments[0]][segments[1]] : venue[segments[0]];
      }
      // Fallback to scraper_config
      if (venue.scraper_config && venue.scraper_config[segments[0]]) {
        return segments.length > 1 ? venue.scraper_config[segments[0]][segments[1]] : venue.scraper_config[segments[0]];
      }
      return segments.length > 1 ? '' : (segments[0] === 'performer_strategy' ? { split_by: [] } : {});
    }
    
    return venue[path] || '';
  };

  const updateNestedField = (path: string, value: any) => {
    updateVenue(idx, path, value);
  };

  return (
    <>
      <motion.div 
        layout 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.9 }} 
        whileHover={{ y: -4 }}
        onClick={() => setIsEditorOpen(true)}
        className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm group hover:border-indigo-500 hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
      >
        <div className="flex flex-col h-full gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {venue.venue_name || venue.name || "Untitled Node"}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Stable</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="text-[10px] font-medium truncate">{venue.city || "Remote"}, {venue.province || "BE"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Globe className="w-3 h-3 flex-shrink-0" />
              <span className="text-[9px] font-mono truncate opacity-70">{venue.start_url || venue.website_url}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
            <button 
              onClick={(e) => { e.stopPropagation(); removeVenue(idx); }}
              className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 text-indigo-600">
              <span className="text-[10px] font-bold uppercase tracking-wider">Configure</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setIsEditorOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-900 p-3 rounded-2xl">
                    <Settings2 className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Node Settings</h2>
                    <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">Instance ID: {venue.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditorOpen(false)}
                  className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-10 bg-slate-50/30">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-12 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                             <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest text-indigo-600 mb-2">
                                <Activity className="w-4 h-4" /> Identity & Location
                             </div>
                             <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Venue Identity</label>
                                    <input value={venue.venue_name || venue.name || ""} onChange={(e) => updateNestedField('venue_name', e.target.value)} className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl px-5 py-4 text-sm font-bold outline-none transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">City</label>
                                        <input value={venue.city || ""} onChange={(e) => updateNestedField('city', e.target.value)} className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl px-5 py-4 text-sm font-bold outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Province</label>
                                        <select 
                                          value={venue.province || ""} 
                                          onChange={(e) => updateNestedField('province', e.target.value)} 
                                          className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl px-5 py-[1.1rem] text-sm font-bold outline-none transition-all appearance-none cursor-pointer"
                                        >
                                          <option value="">Select Region</option>
                                          {PROVINCES.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                          ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Target Endpoint (URL)</label>
                                    <input value={venue.start_url || venue.website_url || ""} onChange={(e) => updateNestedField('start_url', e.target.value)} className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl px-5 py-4 text-xs font-mono font-bold text-slate-500 outline-none transition-all" />
                                </div>
                             </div>
                        </section>

                        <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                             <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest text-indigo-600 mb-2">
                                <Calendar className="w-4 h-4" /> Logic Control
                             </div>
                             <div className="space-y-6">
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-2">
                                      Temporal Mask <Info className="w-3 h-3 text-slate-300" />
                                    </label>
                                    <input value={getData('date_parsing.format')} onChange={(e) => updateNestedField('date_parsing.format', e.target.value)} className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500 focus:bg-white rounded-xl px-5 py-4 text-xs font-mono font-bold text-indigo-600 outline-none transition-all" placeholder="%d %b %Y" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Performer Splitters</label>
                                    <div className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-slate-50 rounded-xl border border-slate-100">
                                        {(getData('performer_strategy')?.split_by || []).map((sep: string, sIdx: number) => (
                                          <div key={sIdx} className="bg-indigo-600 text-white rounded-lg px-2.5 py-1 text-[9px] font-bold flex items-center gap-2">
                                            {sep}
                                            <button onClick={() => {
                                              const current = getData('performer_strategy')?.split_by || [];
                                              updateNestedField('performer_strategy.split_by', current.filter((_:any, i:number) => i !== sIdx));
                                            }}><X className="w-3 h-3"/></button>
                                          </div>
                                        ))}
                                        <button onClick={() => {
                                          const s = prompt("Enter separator (e.g. ' & ' or ' , ')");
                                          if(s) {
                                            const current = getData('performer_strategy')?.split_by || [];
                                            updateNestedField('performer_strategy.split_by', [...current, s]);
                                          }
                                        }} className="px-3 py-1 border border-dashed border-slate-300 rounded-lg text-[9px] font-bold text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all">+ Add Sep</button>
                                    </div>
                                </div>
                             </div>
                        </section>
                    </div>

                    <section className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
                        <div className="flex items-center gap-3 mb-10">
                           <div className="p-3 bg-indigo-500/20 rounded-2xl">
                             <Target className="w-6 h-6 text-indigo-400" />
                           </div>
                           <span className="text-sm font-black uppercase tracking-[0.4em] text-white">DOM Selector Registry</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { label: 'Card Container', field: 'card', icon: Database },
                                { label: 'Event Title', field: 'title', icon: Terminal },
                                { label: 'Event Date', field: 'date', icon: Calendar },
                                { label: 'Direct URL', field: 'url', icon: ExternalLink },
                            ].map((item) => (
                                <div key={item.field} className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2 ml-1">
                                        <item.icon className="w-3 h-3" /> {item.label}
                                    </label>
                                    <input 
                                        value={getData(`selectors.${item.field}`)} 
                                        onChange={(e) => updateNestedField(`selectors.${item.field}`, e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-[11px] font-mono font-bold text-indigo-300 outline-none focus:border-indigo-400 focus:bg-white/10 transition-all"
                                        placeholder="e.g. .event-card"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white border-t border-slate-100 flex justify-end gap-4">
                 <button 
                  onClick={() => setIsEditorOpen(false)}
                  className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                  onClick={() => setIsEditorOpen(false)}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-3 transition-all"
                 >
                   <Save className="w-4 h-4" /> Commit Changes Locally
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};