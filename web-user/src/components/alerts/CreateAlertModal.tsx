'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Search, Loader2, Music, Building, MapPin, 
  ArrowRight, Filter, Plus, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Performer, Venue } from '@/lib/api';
import { useLanguage } from '@/lib/LanguageContext';

export interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearch: (val: string) => void;
  searching: boolean;
  results: { performers: Performer[], venues: Venue[], provinces: string[] };
  selectedPerformer: Performer | null;
  setSelectedPerformer: (p: Performer | null) => void;
  selectedVenue: Venue | null;
  setSelectedVenue: (v: Venue | null) => void;
  selectedProvince: string | null;
  setSelectedProvince: (p: string | null) => void;
  onCreate: () => void;
}

export function CreateAlertModal({
  isOpen, onClose, searchQuery, onSearch, searching, results,
  selectedPerformer, setSelectedPerformer, selectedVenue, setSelectedVenue,
  selectedProvince, setSelectedProvince, onCreate
}: CreateAlertModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }} 
        className="relative bg-white w-full max-w-4xl h-[700px] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100"
      >
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('alerts.modal.title')}</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{t('alerts.modal.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex bg-slate-50/50">
          <div className="w-[45%] p-8 border-r border-slate-100 flex flex-col bg-white overflow-hidden">
            <div className="relative mb-6 group flex-shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                autoFocus
                placeholder={t('alerts.modal.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded-2xl pl-12 pr-10 py-3 text-sm font-medium text-slate-900 outline-none transition-all"
              />
              {searching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar pb-4 text-sm">
              {results.performers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3 ml-1">
                     <Music className="w-3 h-3 text-indigo-500" />
                     <h4 className="text-xs font-semibold text-slate-500">{t('alerts.modal.sectionPerformers')}</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {results.performers.map(p => (
                      <button 
                        key={p.id}
                        onClick={() => setSelectedPerformer(p)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${selectedPerformer?.id === p.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-indigo-100'}`}
                      >
                        <span className={`font-semibold text-sm ${selectedPerformer?.id === p.id ? 'text-indigo-700' : 'text-slate-800'}`}>{p.name}</span>
                        {selectedPerformer?.id === p.id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                {results.venues.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 ml-1">
                       <Building className="w-3 h-3 text-emerald-500" />
                       <h4 className="text-xs font-semibold text-slate-500">{t('alerts.modal.sectionVenues')}</h4>
                    </div>
                    <div className="space-y-2">
                      {results.venues.map(v => (
                        <button 
                            key={v.id}
                            disabled={!!selectedProvince}
                            onClick={() => { 
                              if (selectedPerformer) setSelectedVenue(v);
                              else { setSelectedVenue(v); setSelectedProvince(null); setSelectedPerformer(null); }
                            }}
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${selectedVenue?.id === v.id ? 'bg-emerald-50 border-emerald-200' : (selectedProvince ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'bg-white border-slate-100 hover:border-emerald-100')}`}
                          >
                            <div className="min-w-0">
                              <span className={`font-semibold text-sm block ${selectedVenue?.id === v.id ? 'text-emerald-700' : 'text-slate-800'}`}>{v.name}</span>
                              <span className="text-xs text-slate-500 mt-0.5 block">{v.city}</span>
                            </div>
                            {selectedVenue?.id === v.id && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {results.provinces.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3 ml-1">
                       <MapPin className="w-3 h-3 text-amber-500" />
                       <h4 className="text-xs font-semibold text-slate-500">{t('alerts.modal.sectionRegions')}</h4>
                    </div>
                    <div className="space-y-2">
                       {results.provinces.map(p => (
                         <button 
                            key={p}
                            disabled={!!selectedVenue}
                            onClick={() => { 
                              if (selectedPerformer) { setSelectedProvince(p); setSelectedVenue(null); }
                              else { setSelectedProvince(p); setSelectedVenue(null); setSelectedPerformer(null); }
                            }}
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${selectedProvince === p ? 'bg-amber-50 border-amber-200' : (selectedVenue ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'bg-white border-slate-100 hover:border-amber-100')}`}
                         >
                            <span className={`font-semibold text-sm capitalize ${selectedProvince === p ? 'text-amber-700' : 'text-slate-800'}`}>{p.replace('_', ' ')}</span>
                            {selectedProvince === p && <CheckCircle2 className="w-5 h-5 text-amber-600" />}
                         </button>
                       ))}
                    </div>
                  </div>
                )}
              </div>

              {searchQuery.length >= 2 && !results.performers.length && !results.venues.length && !results.provinces.length && !searching && (
                <div className="text-center py-12 px-4">
                  <p className="text-slate-500 font-medium text-sm">{t('alerts.modal.noResults')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="w-[55%] p-10 flex flex-col justify-between">
             <div className="space-y-8">
                <div className="flex items-center gap-3">
                   <div className="bg-indigo-100 p-2.5 rounded-xl"><Filter className="w-4 h-4 text-indigo-600" /></div>
                   <div>
                      <h3 className="text-sm font-bold text-slate-900">{t('alerts.modal.configuration')}</h3>
                   </div>
                </div>

                <div className="space-y-5">
                   <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <div className="space-y-5">
                         <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 ml-1">{t('alerts.modal.targetLabel')}</label>
                            <div className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-between ${selectedPerformer ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                               <span className="truncate">{selectedPerformer?.name || t('alerts.modal.searchPlaceholder')}</span>
                               {selectedPerformer && <button onClick={() => setSelectedPerformer(null)} className="hover:text-rose-500 transition-colors"><X className="w-4 h-4" /></button>}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 ml-1">{t('alerts.modal.venueFilter')}</label>
                            <div className="grid grid-cols-1 gap-3">
                              <div className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-between ${selectedProvince ? 'bg-slate-50 border-slate-100 text-slate-300' : (selectedVenue ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-500')}`}>
                                 <div className="flex items-center gap-3 min-w-0">
                                    <Building className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{selectedVenue?.name || t('alerts.modal.anyVenue')}</span>
                                 </div>
                                 {selectedVenue && !selectedProvince && <button onClick={() => setSelectedVenue(null)} className="hover:text-rose-500"><X className="w-4 h-4" /></button>}
                              </div>
                            </div>
                          </div>
                          
                           <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 ml-1">{t('alerts.modal.regionFilter')}</label>
                            <div className="grid grid-cols-1 gap-3">
                              <div className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-between ${selectedVenue ? 'bg-slate-50 border-slate-100 text-slate-300' : (selectedProvince ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-50 border-slate-100 text-slate-500')}`}>
                                 <div className="flex items-center gap-3 min-w-0">
                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate capitalize">{selectedProvince?.replace('_', ' ') || t('alerts.modal.anyRegion')}</span>
                                 </div>
                                 {selectedProvince && !selectedVenue && <button onClick={() => setSelectedProvince(null)} className="hover:text-rose-500"><X className="w-4 h-4" /></button>}
                              </div>
                            </div>
                          </div>
                      </div>
                   </div>

                   {(!selectedPerformer && !selectedVenue && !selectedProvince) && (
                     <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-2xl">
                        <AlertCircle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                        <p className="text-xs font-medium text-slate-600 leading-relaxed">{t('alerts.modal.missingCriteriaWarning')}</p>
                     </div>
                   )}

                   {(selectedVenue || selectedProvince) && !selectedPerformer && (
                     <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        <p className="text-xs font-medium text-indigo-700 leading-relaxed">{t('alerts.modal.globalWarning')}</p>
                     </div>
                   )}
                </div>
             </div>

             <button 
              disabled={!selectedPerformer && !selectedVenue && !selectedProvince}
              onClick={onCreate}
              className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${(!selectedPerformer && !selectedVenue && !selectedProvince) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'}`}
             >
                <span>{t('alerts.modal.submitButton')}</span>
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}