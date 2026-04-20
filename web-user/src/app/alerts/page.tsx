'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import api, { 
  apiService,
  Performer, 
  Venue 
} from '@/lib/api';
import { Navbar } from '@/components/Navbar';
import { useLanguage } from '@/lib/LanguageContext';

import { AlertCard } from '@/components/alerts/AlertCard';
import { AlertsEmptyState } from '@/components/alerts/AlertsEmptyState';
import { CreateAlertModal } from '@/components/alerts/CreateAlertModal';

export default function AlertsPage() {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<{
    performers: Performer[];
    venues: Venue[];
    provinces: string[];
  }>({ performers: [], venues: [], provinces: [] });

  // Selection State
  const [selectedPerformer, setSelectedPerformer] = useState<Performer | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch();
      } else {
        setResults({ performers: [], venues: [], provinces: [] });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSubscriptions(1); // Default to user 1 for now
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    setSearching(true);
    try {
      const allPerformers = await apiService.getPerformers();
      const performers = allPerformers.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const allVenues = await apiService.getVenues();
      const venues = allVenues.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.city?.toLowerCase().includes(searchQuery.toLowerCase()));
      setResults({ performers, venues, provinces: [] });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateAlert = async () => {
    try {
      if (selectedPerformer) {
        await apiService.subscribeToPerformer(1, selectedPerformer.id, { venue_id: selectedVenue?.id, province: selectedProvince || undefined });
      } else if (selectedVenue) {
        await apiService.subscribeToVenue(1, selectedVenue.id);
      } else if (selectedProvince) {
        await apiService.subscribeToProvince(1, selectedProvince);
      }
      
      setIsModalOpen(false);
      
      // Keep selected performer, clear venue/province and query to allow rapid creation
      setSelectedVenue(null);
      setSelectedProvince(null);
      setSearchQuery('');
      setResults({ performers: [], venues: [], provinces: [] });
      
      loadAlerts(); // Refresh list
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const handleRemoveAlert = async (id: number) => {
    try {
      await apiService.unsubscribe(id);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to remove alert:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900">
              {t('alerts.title')}
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              {t('alerts.subtitle')}
            </p>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold tracking-wide hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>{t('alerts.createButton')}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="relative z-10">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="font-semibold text-sm tracking-wide">{t('alerts.loadingText')}</p>
            </div>
          ) : alerts.length === 0 ? (
            <AlertsEmptyState />
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {alerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} onRemove={handleRemoveAlert} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Extracted Modal */}
      <AnimatePresence>
        <CreateAlertModal
           isOpen={isModalOpen}
           onClose={() => setIsModalOpen(false)}
           searchQuery={searchQuery}
           onSearch={setSearchQuery}
           searching={searching}
           results={results}
           selectedPerformer={selectedPerformer}
           setSelectedPerformer={setSelectedPerformer}
           selectedVenue={selectedVenue}
           setSelectedVenue={setSelectedVenue}
           selectedProvince={selectedProvince}
           setSelectedProvince={setSelectedProvince}
           onCreate={handleCreateAlert}
        />
      </AnimatePresence>
    </div>
  );
}
