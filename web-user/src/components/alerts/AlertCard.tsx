'use client';

import { motion } from 'framer-motion';
import { Music, Building, MapPin, Filter, Trash2 } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export function AlertCard({ alert, onRemove }: { alert: any; onRemove: (id: number) => void }) {
  const { t } = useLanguage();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-500 transition-all group relative overflow-hidden"
    >
      <div className="flex flex-col gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
            {alert.performer_id ? <Music className="w-5 h-5" /> : (alert.venue_id ? <Building className="w-5 h-5" /> : <MapPin className="w-5 h-5" />)}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">
              {alert.performer_id ? t('alerts.list.targetArtist') : (alert.venue_id ? t('alerts.list.targetVenue') : t('alerts.list.targetRegion'))}
            </span>
            <h3 className="text-lg font-bold text-slate-900 leading-none mt-1">
              {alert.performer?.name || alert.venue?.name || alert.province?.replace('_', ' ') || 'Global Stream'}
            </h3>
          </div>
        </div>
        
        {(alert.venue || alert.province) && alert.performer && (
          <div className="bg-slate-50 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-medium text-slate-600 border border-slate-100 w-fit">
              <Filter className="w-3 h-3" />
              {t('alerts.list.filterPrefix')} {alert.venue?.name || alert.province?.replace('_', ' ')}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-500">{t('alerts.list.statusMonitoring')}</span>
        </div>
        <button 
          onClick={() => onRemove(alert.id)}
          className="p-2 bg-rose-50 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}