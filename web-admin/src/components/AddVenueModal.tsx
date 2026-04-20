'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Terminal, 
  Globe, 
  MapPin, 
  Target, 
  Rocket, 
  Database,
  Calendar,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { useState } from 'react';

const PROVINCES = [
  "Antwerp",
  "East Flanders",
  "Flemish Brabant",
  "Limburg",
  "West Flanders"
];

interface AddVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  newVenue: any;
  setNewVenue: (v: any) => void;
  onDeploy: () => void;
}

export const AddVenueModal = ({ isOpen, onClose, newVenue, setNewVenue, onDeploy }: AddVenueModalProps) => {
  const [step, setStep] = useState(1);

  const updateField = (path: string, value: any) => {
    const updated = { ...newVenue };
    const segments = path.split('.');
    
    // Ensure nested objects exist
    if (segments.length > 1) {
      let current = updated;
      for (let i = 0; i < segments.length - 1; i++) {
        if (!current[segments[i]]) current[segments[i]] = {};
        current = current[segments[i]];
      }
      current[segments[segments.length - 1]] = value;
    } else {
      updated[path] = value;
    }
    setNewVenue(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xl" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 40 }} 
        className="relative bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
          <div className="flex items-center gap-6">
            <div className="bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-100">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Deploy New Node</h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-6 rounded-full transition-all ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                  <span className={`h-1.5 w-6 rounded-full transition-all ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                  <span className={`h-1.5 w-6 rounded-full transition-all ${step >= 3 ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phase 0{step} Strategy</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-50 rounded-[2rem] text-slate-400 hover:text-slate-900 transition-all">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/30">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                 <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                       <Terminal className="w-5 h-5 text-indigo-600" />
                       <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">Core Identity</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Venue Identity Label</label>
                        <input placeholder="e.g. Ancienne Belgique" value={newVenue.venue_name} onChange={(e) => updateField('venue_name', e.target.value)} className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-600 focus:bg-white rounded-2xl px-6 py-5 font-bold outline-none transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Crawl Root (Absolute URL)</label>
                        <input placeholder="https://..." value={newVenue.start_url} onChange={(e) => updateField('start_url', e.target.value)} className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-600 focus:bg-white rounded-2xl px-6 py-5 font-mono text-xs font-bold outline-none transition-all" />
                      </div>
                    </div>
                 </section>

                 <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                       <MapPin className="w-5 h-5 text-indigo-600" />
                       <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">Geospatial Routing</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City Hub</label>
                        <input placeholder="Brussel" value={newVenue.city} onChange={(e) => updateField('city', e.target.value)} className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-600 focus:bg-white rounded-2xl px-6 py-4 font-bold outline-none transition-all" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Administrative Province</label>
                        <select value={newVenue.province} onChange={(e) => updateField('province', e.target.value)} className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-600 focus:bg-white rounded-2xl px-6 py-4.5 font-bold outline-none transition-all appearance-none cursor-pointer">
                          <option value="">Select Region</option>
                          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                 </section>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                 <section className="bg-slate-900 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[130px] rounded-full" />
                    <div className="flex items-center gap-3 mb-12 relative z-10">
                      <Target className="w-6 h-6 text-indigo-400" />
                      <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white">DOM Logic Matrix</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                      {[
                        { label: 'Cluster Container', field: 'card', icon: Database },
                        { label: 'Identifier (Title)', field: 'title', icon: Terminal },
                        { label: 'Temporal Node (Date)', field: 'date', icon: Calendar },
                        { label: 'Actionable URI', field: 'url', icon: ExternalLink },                      { label: 'Event Cover Image', field: 'image', icon: Globe },                      ].map((item) => (
                        <div key={item.field} className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                             <item.icon className="w-3 h-3" /> {item.label}
                          </label>
                          <input placeholder=".event-card" value={newVenue.selectors[item.field]} onChange={(e) => updateField(`selectors.${item.field}`, e.target.value)} className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 focus:bg-white/10 rounded-2xl px-6 py-5 font-mono text-xs font-black text-indigo-300 outline-none transition-all" />
                        </div>
                      ))}
                    </div>
                 </section>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                 <section className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                    <div className="flex items-center gap-3">
                       <Calendar className="w-6 h-6 text-indigo-600" />
                       <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900">Advanced Logic Tuning</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-10">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                             Temporal Parser Format <Info className="w-3 h-3 text-slate-300" />
                          </label>
                          <input placeholder="%d %b %Y (e.g. 19 Apr 2026)" value={newVenue.date_parsing?.format} onChange={(e) => updateField('date_parsing.format', e.target.value)} className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-600 focus:bg-white rounded-2xl px-8 py-6 font-mono text-sm font-black text-indigo-600 outline-none transition-all" />
                        </div>

                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Performer Splitters</label>
                           <div className="flex flex-wrap gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[80px]">
                              {(newVenue.performer_strategy?.split_by || []).map((sep: string, idx: number) => (
                                <div key={idx} className="bg-indigo-600 text-white rounded-xl px-4 py-2 text-[11px] font-black flex items-center gap-2 shadow-lg shadow-indigo-100">
                                  {sep}
                                  <button onClick={() => {
                                    const current = newVenue.performer_strategy.split_by;
                                    updateField('performer_strategy.split_by', current.filter((_:any, i:number) => i !== idx));
                                  }} className="hover:text-amber-300 transition-colors"><X className="w-4 h-4" /></button>
                                </div>
                              ))}
                              <button onClick={() => {
                                const s = prompt("Enter separator string");
                                if(s) {
                                  const current = newVenue.performer_strategy.split_by || [];
                                  updateField('performer_strategy.split_by', [...current, s]);
                                }
                              }} className="px-5 py-2 border-2 border-dashed border-slate-300 rounded-xl text-[11px] font-black text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-all">+ Add Logic</button>
                           </div>
                        </div>
                    </div>
                 </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-10 border-t border-slate-100 bg-white flex justify-between items-center relative z-10">
          <button onClick={onClose} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors">Abort Protocol</button>
          
          <div className="flex items-center gap-4">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="px-8 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all">Back</button>
            )}
            <button 
              onClick={step < 3 ? () => setStep(step + 1) : onDeploy} 
              className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-indigo-100 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3"
            >
              {step < 3 ? 'Next Phase' : 'Activate Cluster Node'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};