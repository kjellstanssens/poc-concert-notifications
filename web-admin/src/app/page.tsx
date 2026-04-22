'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Terminal, 
  Database,
  Cloud,
  Loader2,
  Search,
  LayoutGrid,
  Filter,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { VenueNode } from '@/components/VenueNode';
import { AddVenueModal } from '@/components/AddVenueModal';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/api/v1';

export default function AdminDashboard() {
  const [venues, setVenues] = useState<any[]>([]);
  const [originalVenues, setOriginalVenues] = useState<string>('[]');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newVenue, setNewVenue] = useState({
    venue_name: '',
    start_url: '',
    city: '',
    province: '',
    address: '',
    selectors: { card: '', title: '', date: '', url: '', image: '' },
    date_parsing: { format: '' },
    performer_strategy: { split_by: [] }
  });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/venues/`);
      if (!resp.ok) throw new Error("Failed to fetch registry");
      const data = await resp.json();
      const venuesData = (Array.isArray(data) ? data : []).map(v => ({
        ...v,
        // Ensure consistent naming even if backend returns different keys
        venue_name: v.venue_name || v.name,
        start_url: v.start_url || v.website_url
      }));
      setVenues(venuesData);
      setOriginalVenues(JSON.stringify(venuesData));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isDirty = useMemo(() => {
    return JSON.stringify(venues) !== originalVenues;
  }, [venues, originalVenues]);

  const updateVenue = (idx: number, field: string, value: any) => {
    setVenues((prev: any[]) => {
      const updated = JSON.parse(JSON.stringify(prev));
      const target = updated[idx];
      const path = field.split('.');
      
      if (path.length > 1) {
        if (!target[path[0]]) target[path[0]] = {};
        target[path[0]][path[1]] = value;
      } else {
        target[field] = value;
      }
      return updated;
    });
  };

  const saveAll = async () => {
    if (!isDirty) return;
    try {
      setLoading(true);
      const originalArray = JSON.parse(originalVenues);
      
      for (let i = 0; i < venues.length; i++) {
        const venue = venues[i];
        const original = originalArray.find((v: any) => v.id === venue.id);

        if (original && JSON.stringify(venue) === JSON.stringify(original)) {
          continue;
        }

        const payload: any = {
          name: venue.venue_name,
          website_url: venue.start_url,
          city: venue.city,
          province: venue.province,
          address: venue.address,
        };

        // Flatten nested config into what backend expects
        if (venue.selectors || venue.date_parsing || venue.performer_strategy) {
          payload.scraper_config = {
            selectors: venue.selectors || (venue.scraper_config?.selectors),
            date_parsing: venue.date_parsing || (venue.scraper_config?.date_parsing),
            performer_strategy: venue.performer_strategy || (venue.scraper_config?.performer_strategy)
          };
        }

        const resp = await fetch(`${API_BASE_URL}/venues/${venue.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!resp.ok) {
          const errData = await resp.json();
          throw new Error(`Node ${venue.id} Sync Failed: ${JSON.stringify(errData.detail || errData)}`);
        }
      }
      
      alert("All clusters synchronized successfully.");
      await fetchVenues();
    } catch (err: any) {
      alert(`Sync Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeVenue = async (idx: number) => {
    const venue = venues[idx];
    if (confirm(`Decommission node: ${venue.venue_name || venue.name}?`)) {
      await fetch(`${API_BASE_URL}/venues/${venue.id}`, { method: 'DELETE' });
      fetchVenues();
    }
  };

  const handleDeploy = async () => {
    if (!newVenue.venue_name || !newVenue.start_url) return;
    try {
      setLoading(true);
      const payload = {
        name: newVenue.venue_name,
        website_url: newVenue.start_url,
        city: newVenue.city,
        province: newVenue.province,
        address: newVenue.address,
        scraper_config: {
          selectors: newVenue.selectors,
          date_parsing: newVenue.date_parsing,
          performer_strategy: newVenue.performer_strategy
        }
      };

      const resp = await fetch(`${API_BASE_URL}/venues/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(JSON.stringify(errData.detail || errData));
      }

      setNewVenue({
        venue_name: '',
        start_url: '',
        city: '',
        province: '',
        address: '',
        selectors: { card: '', title: '', date: '', url: '', image: '' },
        date_parsing: { format: '' },
        performer_strategy: { split_by: [] }
      });
      setIsModalOpen(false);
      await fetchVenues();
    } catch (err: any) {
      alert(`Deployment Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter((v: any) => 
    (v.venue_name || v.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.city || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-32">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-slate-100">
        <div className="max-w-[1600px] mx-auto px-12 h-24 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-4 group">
              <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-200 group-hover:rotate-12 transition-transform">
                <Terminal className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-[1000] tracking-tight text-slate-900 font-sans leading-none">SCRAPER<span className="text-indigo-600">STUDIO</span></h1>
                <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400 mt-1">Registry Management</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={saveAll}
              disabled={!isDirty || loading}
              className={`px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl flex items-center gap-3 ${
                isDirty 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 shadow-indigo-100' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cloud className="w-4 h-4" />}
              {isDirty ? 'Push Registry Changes' : 'Registry Up to Date'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-12 pt-16">
        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm mb-16 flex flex-col md:flex-row items-center gap-8">
          <div className="flex items-center gap-8 border-r border-slate-100 pr-8">
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registered Clusters</span>
                <span className="text-2xl font-black text-slate-900">{venues.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Database State</span>
                <div className="flex items-center gap-2">
                  {isDirty ? (
                    <>
                      <span className="text-[11px] font-black text-amber-500 uppercase tracking-wider">Unsaved Changes</span>
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] font-black text-emerald-500 uppercase tracking-wider">Synchronized</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </>
                  )}
                </div>
              </div>
          </div>

          <div className="flex-1 relative group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="Search registry by venue name, city or cluster ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 focus:bg-white rounded-[1.5rem] pl-16 pr-8 py-4 text-sm font-bold outline-none transition-all"
            />
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-black transition-all shadow-lg shadow-slate-100 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Deploy Node
          </button>
        </div>

        <div className="flex items-center justify-between mb-12 px-2">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-slate-100 rounded-2xl"><LayoutGrid className="w-5 h-5 text-slate-500" /></div>
             <h2 className="text-4xl font-[1000] text-slate-900 tracking-tighter">Node Registry</h2>
          </div>
        </div>

        {loading && venues.length === 0 ? (
          <div className="flex justify-center py-32"><Loader2 className="w-12 h-12 text-indigo-600 animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredVenues.map((venue, idx) => (
                <VenueNode key={venue.id || idx} venue={venue} idx={idx} updateVenue={updateVenue} removeVenue={removeVenue} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredVenues.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900">No clusters found</h3>
          </div>
        )}
      </div>

      <AddVenueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} newVenue={newVenue} setNewVenue={setNewVenue} onDeploy={handleDeploy} />
    </main>
  );
}