'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Settings, 
  Trash2, 
  Plus,
  Shield,
  Activity,
  Music,
  MapPin,
  ChevronRight
} from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-8 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 px-4">
        <div>
          <div className="flex items-center gap-3 text-indigo-600 mb-4 font-black uppercase tracking-[0.4em] text-[10px]">
             <Shield className="w-4 h-4 fill-indigo-100" />
             Surveillance System
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">My Alerts</h1>
          <p className="text-slate-500 font-medium mt-6">Manage your real-time performance notifications.</p>
        </div>

        <button className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-slate-200 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3">
          <Plus className="w-4 h-4" />
          Create Alert Mission
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white rounded-[4rem] border border-slate-100 p-24 text-center shadow-sm">
           <div className="bg-indigo-50 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 rotate-12">
              <Bell className="w-10 h-10 text-indigo-600 animate-bounce" />
           </div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Idle</h2>
           <p className="max-w-md mx-auto text-slate-500 font-medium mt-4 mb-12 italic">"Silence is golden, but concerts are better."</p>
           
           <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="bg-slate-50 border border-slate-100 px-6 py-4 rounded-3xl flex items-center gap-4">
                 <div className="bg-indigo-600 p-2 rounded-xl text-white"><Music className="w-4 h-4" /></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 01: Choose Artist</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-200" />
              <div className="bg-slate-50 border border-slate-100 px-6 py-4 rounded-3xl flex items-center gap-4 opacity-50">
                 <div className="bg-slate-900 p-2 rounded-xl text-white"><MapPin className="w-4 h-4" /></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 02: Define Region</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-200" />
              <div className="bg-slate-50 border border-slate-100 px-6 py-4 rounded-3xl flex items-center gap-4 opacity-30">
                 <div className="bg-indigo-600 p-2 rounded-xl text-white animate-pulse"><Bell className="w-4 h-4" /></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 03: Stay Notified</span>
              </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Future Alert List */}
        </div>
      )}

      <div className="mt-24 bg-slate-100/50 rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-12">
         <div className="flex items-center gap-8">
            <div className="bg-white p-5 rounded-[2rem] shadow-sm"><Activity className="w-8 h-8 text-indigo-600 animate-pulse" /></div>
            <div>
               <h4 className="text-xl font-black text-slate-900 leading-none">Real-time Watcher</h4>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Checking venues across Belgium every 60m</p>
            </div>
         </div>
         <button className="flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm hover:border-slate-400 transition-all">
            <Settings className="w-4 h-4" />
            Global Push Settings
         </button>
      </div>
    </main>
  );
}
