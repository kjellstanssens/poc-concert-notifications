'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, Save, AlertCircle, CheckCircle2, RefreshCw, 
  Globe, Terminal, Loader2, Plus, Trash2, ChevronRight, 
  ChevronDown, Layout, Code2, Sparkles, Wand2
} from 'lucide-react';
import jsyaml from 'js-yaml';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [view, setView] = useState<'visual' | 'code'>('visual');
  const [configContent, setConfigContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [parsedConfig, setParsedConfig] = useState<any>({ venues: [] });
  const [yamlError, setYamlError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      if (data.content) {
        setConfigContent(data.content);
        try {
          const parsed = jsyaml.load(data.content) as any;
          setParsedConfig(parsed || { venues: [] });
        } catch (e) {}
      }
    } catch (err) {
      setMessage({ text: 'Failed to load configuration.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const syncToYaml = (newParsed: any) => {
    try {
      const yaml = jsyaml.dump(newParsed, { indent: 2, noRefs: true });
      setConfigContent(yaml);
      setYamlError(null);
      return yaml;
    } catch (e: any) {
      setYamlError(e.message);
      return null;
    }
  };

  const handleSave = async () => {
    let contentToSave = configContent;
    
    if (view === 'visual') {
      const synced = syncToYaml(parsedConfig);
      if (!synced) return;
      contentToSave = synced;
    } else {
      try {
        jsyaml.load(configContent);
      } catch (e: any) {
        setMessage({ text: 'Cannot save invalid YAML.', type: 'error' });
        return;
      }
    }

    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contentToSave }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ text: 'Configuration saved successfully!', type: 'success' });
        if (view === 'code') fetchConfig(); 
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to save configuration.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateVenue = (index: number, field: string, value: any) => {
    const newVenues = [...parsedConfig.venues];
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newVenues[index][parent] = { ...newVenues[index][parent], [child]: value };
    } else {
      newVenues[index][field] = value;
    }
    
    const newConfig = { ...parsedConfig, venues: newVenues };
    setParsedConfig(newConfig);
    if (view === 'visual') syncToYaml(newConfig);
  };

  const addVenue = () => {
    const newVenue = {
      venue_name: "New Venue",
      start_url: "https://",
      selectors: {
        card: "",
        title: "",
        date: "",
        url: ""
      },
      performer_strategy: {
        split_by: [" + ", " / "]
      }
    };
    const newConfig = { ...parsedConfig, venues: [...(parsedConfig.venues || []), newVenue] };
    setParsedConfig(newConfig);
    syncToYaml(newConfig);
  };

  const removeVenue = (index: number) => {
    const newVenues = parsedConfig.venues.filter((_: any, i: number) => i !== index);
    const newConfig = { ...parsedConfig, venues: newVenues };
    setParsedConfig(newConfig);
    syncToYaml(newConfig);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Loading Scraper Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-indigo-200 shadow-lg">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Scraper Studio</h1>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Venue Configuration Node</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
           <button 
             onClick={() => setView('visual')}
             className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${view === 'visual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <Layout className="w-4 h-4" /> Visual Builder
           </button>
           <button 
             onClick={() => setView('code')}
             className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${view === 'code' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
           >
             <Code2 className="w-4 h-4" /> YAML Editor
           </button>
        </div>

        <div className="flex items-center gap-3">
            <button
                onClick={fetchConfig}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 rounded-lg border"
                title="Discard & Refresh"
            >
                <RefreshCw className="w-5 h-5" />
            </button>
            <button
                onClick={handleSave}
                disabled={isSaving || (view === 'code' && !!yamlError)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl font-bold shadow-indigo-100 shadow-xl transition-all active:scale-95"
            >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Publish Nodes
            </button>
        </div>
      </nav>

      <div className="p-8 flex-1 max-w-7xl mx-auto w-full">
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-4 rounded-2xl border flex items-center justify-between ${
                message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-3">
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span className="font-semibold">{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-current opacity-50 hover:opacity-100 font-bold">✕</button>
          </motion.div>
        )}

        {view === 'visual' ? (
          <div className="space-y-8 pb-20">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    <Globe className="w-7 h-7 text-indigo-500" />
                    Active Venues
                    <span className="text-sm font-bold bg-slate-200 px-3 py-1 rounded-full text-slate-500 ml-2">
                        {parsedConfig.venues?.length || 0}
                    </span>
                </h2>
                <button 
                    onClick={addVenue}
                    className="flex items-center gap-2 bg-white text-indigo-600 border-2 border-indigo-50 hover:border-indigo-200 px-5 py-2 rounded-2xl font-bold transition-all shadow-sm"
                >
                    <Plus className="w-5 h-5" /> Add New Venue
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence>
                    {parsedConfig.venues?.map((venue: any, idx: number) => (
                        <motion.div 
                            key={idx}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-300 transition-all"
                        >
                            <div className="p-1 bg-indigo-50/50 flex items-center justify-between border-b">
                                <div className="px-6 py-2 flex items-center gap-3">
                                    <div className="bg-white p-1.5 rounded-lg border shadow-sm">
                                        <Layout className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <input 
                                        value={venue.venue_name}
                                        onChange={(e) => updateVenue(idx, 'venue_name', e.target.value)}
                                        className="bg-transparent font-black text-slate-800 outline-none text-lg focus:text-indigo-600 transition-colors"
                                        placeholder="Venue Name"
                                    />
                                </div>
                                <button 
                                    onClick={() => removeVenue(idx)}
                                    className="mr-6 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <section className="lg:col-span-7 space-y-6">
                                    <label className="block">
                                        <span className="text-xs font-black uppercase text-slate-400 mb-2 block tracking-widest">Entry Endpoint</span>
                                        <div className="relative group">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                            <input 
                                                value={venue.start_url}
                                                onChange={(e) => updateVenue(idx, 'start_url', e.target.value)}
                                                className="w-full bg-slate-50 border-2 border-slate-100 focus:border-indigo-100 focus:bg-white rounded-2xl pl-12 pr-6 py-3.5 text-slate-600 font-mono text-sm transition-all focus:ring-0 shadow-inner"
                                                placeholder="https://example.com/agenda"
                                            />
                                        </div>
                                    </label>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4 shadow-sm">
                                           <div>
                                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter block mb-2">Performer Strategy</span>
                                              <div className="flex flex-wrap gap-2 mb-1">
                                                  {venue.performer_strategy?.split_by?.map((sep: string, sIdx: number) => (
                                                      <div key={sIdx} className="group relative flex items-center bg-white border border-slate-200 rounded-lg pl-3 pr-1 py-1 text-slate-700 shadow-sm transition-all hover:border-indigo-300">
                                                          <span className="font-mono text-[10px] font-bold">"{sep}"</span>
                                                          <button 
                                                            onClick={() => {
                                                              const newSeps = venue.performer_strategy.split_by.filter((_: any, i: number) => i !== sIdx);
                                                              updateVenue(idx, 'performer_strategy.split_by', newSeps);
                                                            }}
                                                            className="ml-2 p-1 text-slate-300 hover:text-rose-500 rounded-md transition-colors"
                                                          >
                                                            <Trash2 className="w-3 h-3" />
                                                          </button>
                                                      </div>
                                                  ))}
                                                  <button 
                                                    onClick={() => {
                                                      const s = prompt("Enter separator (e.g. ' & ')");
                                                      if (s) updateVenue(idx, 'performer_strategy.split_by', [...(venue.performer_strategy?.split_by || []), s]);
                                                    }}
                                                    className="bg-indigo-600 text-white shadow-indigo-100 shadow-md border border-indigo-700 rounded-lg px-3 py-1 text-[10px] font-bold hover:bg-indigo-700 transition-colors"
                                                  >
                                                    + Add
                                                  </button>
                                              </div>
                                           </div>

                                           <div className="pt-4 border-t border-slate-200/60">
                                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter block mb-2">Date Masking</span>
                                              <input 
                                                value={venue.date_parsing?.format || ''}
                                                onChange={(e) => updateVenue(idx, 'date_parsing.format', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-700 placeholder:text-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all shadow-sm"
                                                placeholder="e.g. %d %b %Y"
                                              />
                                              <p className="mt-1.5 text-[9px] text-slate-400 italic font-medium">Python strptime format (e.g. %d %m %Y)</p>
                                           </div>
                                        </div>
                                        
                                        <div className="p-5 bg-emerald-50/40 rounded-2xl border border-emerald-100 flex flex-col justify-center items-center text-center">
                                           <div className="bg-white p-2.5 rounded-full shadow-sm border border-emerald-100 mb-3">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                                           </div>
                                           <span className="text-[10px] font-black uppercase text-emerald-600 tracking-tighter">Node Status</span>
                                           <div className="mt-1 text-sm font-bold text-slate-700">
                                                Ready to Scrape
                                           </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="lg:col-span-5">
                                    <div className="bg-slate-900 rounded-3xl p-5 relative h-full shadow-xl">
                                        <div className="flex items-center gap-2 mb-4 text-indigo-400 border-b border-white/10 pb-4">
                                            <Terminal className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white">DOM Selectors</span>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Card Container', field: 'card', placeholder: '.event-card' },
                                                { label: 'Title Path', field: 'title', placeholder: 'h2 span' },
                                                { label: 'Date Path', field: 'date', placeholder: 'time' },
                                                { label: 'URL Target', field: 'url', placeholder: 'a (or "self")' },
                                            ].map((item) => (
                                                <div key={item.field} className="flex flex-col gap-1.5">
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{item.label}</span>
                                                    <input 
                                                        value={venue.selectors?.[item.field]}
                                                        onChange={(e) => updateVenue(idx, `selectors.${item.field}`, e.target.value)}
                                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-[11px] font-mono text-indigo-300 placeholder:text-slate-700 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                                                        placeholder={item.placeholder}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-200px)] animate-in fade-in duration-500">
            <div className="flex-1 bg-[#1e1e1e] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
              <div className="px-6 py-3 bg-[#252525] flex items-center justify-between border-b border-white/5">
                <div className="flex gap-1.5">
                   <div className="w-3 h-3 rounded-full bg-rose-500" />
                   <div className="w-3 h-3 rounded-full bg-amber-500" />
                   <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs font-mono text-slate-500">scraper_config.yaml</span>
                <div className="w-10" />
              </div>
              <textarea
                className="flex-1 p-8 font-mono text-sm bg-transparent text-slate-300 resize-none outline-none selection:bg-indigo-500/30 leading-relaxed"
                spellCheck="false"
                value={configContent}
                onChange={(e) => {
                    const val = e.target.value;
                    setConfigContent(val);
                    try {
                        const parsed = jsyaml.load(val);
                        setParsedConfig(parsed);
                        setYamlError(null);
                    } catch (e: any) {
                        setYamlError(e.message);
                    }
                }}
              />
              {yamlError && (
                <div className="p-6 bg-rose-950/30 border-t border-rose-900/50 flex flex-col gap-2">
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Syntax Alert</span>
                    <span className="text-xs text-rose-200 font-mono">{yamlError}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


