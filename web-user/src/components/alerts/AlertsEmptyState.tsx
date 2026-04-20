'use client';

import { Bell, Music, Activity, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export function AlertsEmptyState() {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
       <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
          <Bell className="w-8 h-8 text-indigo-600" />
       </div>
       <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('alerts.emptyState.title')}</h2>
       <p className="max-w-md mx-auto text-slate-500 font-medium mt-4 mb-8">
          {t('alerts.emptyState.description')}
       </p>
       
       <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="bg-slate-50 border border-slate-100 px-5 py-3 rounded-2xl flex items-center gap-3">
             <div className="bg-indigo-600 p-2 rounded-lg text-white"><Music className="w-4 h-4" /></div>
             <span className="text-xs font-semibold text-slate-500">{t('alerts.emptyState.step1')}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className="bg-slate-50 border border-slate-100 px-5 py-3 rounded-2xl flex items-center gap-3">
             <div className="bg-slate-900 p-2 rounded-lg text-white"><Activity className="w-4 h-4" /></div>
             <span className="text-xs font-semibold text-slate-500">{t('alerts.emptyState.step2')}</span>
          </div>
       </div>
    </div>
  );
}