'use client';

import { useState, useEffect } from 'react';
import { apiService, Performer, Venue, User } from '@/lib/api';
import { UserIcon, MapPin, Music, Bell, Check, Trash2, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for logged in user in localStorage
    const savedEmail = localStorage.getItem('concert_user_email');
    if (savedEmail) {
        setEmail(savedEmail);
        apiService.getOrCreateUser(savedEmail).then(u => {
            setUser(u);
        }).catch(err => {
            console.error(err);
        });
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadDiscoveryData();
      loadSubscriptions();
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userData = await apiService.getOrCreateUser(email);
      setUser(userData);
      localStorage.setItem('concert_user_email', email);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to login. Is the API running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDiscoveryData = async () => {
    try {
      const [p, v] = await Promise.all([
        apiService.getPerformers(),
        apiService.getVenues()
      ]);
      setPerformers(p);
      setVenues(v);
    } catch (err) {
      console.error("Failed to load discovery data", err);
    }
  };

  const loadSubscriptions = async () => {
    if (!user) return;
    try {
      const subs = await apiService.getSubscriptions(user.id);
      setSubscriptions(subs);
    } catch (err) {
      console.error("Failed to load subscriptions", err);
    }
  };

  const handleSubscribe = async (type: 'performer' | 'venue', id: number) => {
    if (!user) return;
    try {
      if (type === 'performer') {
        await apiService.subscribeToPerformer(user.id, id);
      } else {
        await apiService.subscribeToVenue(user.id, id);
      }
      await loadSubscriptions();
    } catch (err) {
      console.error(`Failed to subscribe to ${type}`, err);
    }
  };

  const handleUnsubscribe = async (subId: number) => {
    try {
      await apiService.unsubscribe(subId);
      await loadSubscriptions();
    } catch (err) {
      console.error("Failed to unsubscribe", err);
    }
  };

  const isSubscribed = (type: 'performer' | 'venue', id: number) => {
    return subscriptions.some(s => 
      type === 'performer' ? s.performer_id === id : s.venue_id === id
    );
  };

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f8fafc] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />
          
          <div className="text-center mb-10 relative">
            <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100 rotate-3 transition-transform hover:rotate-0">
              <Bell className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Concert Tracker</h1>
            <p className="text-slate-500 font-medium mt-3">Be the first to know when your favorite artists announce a show.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all outline-none text-slate-900 font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <p className="text-rose-500 text-xs font-bold bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                {error}
              </p>
            )}
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:bg-slate-300"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Access My Tracker
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-xs text-slate-400 font-bold uppercase tracking-widest">
            POC Stage v1.0
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] selection:bg-indigo-100 selection:text-indigo-700">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-100">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                Notifications Manager
              </h1>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 flex items-center gap-2">
                Active Session: <span className="text-indigo-600">{user.email}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
                href="/discover" 
                className="flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black transition-all shadow-xl active:scale-95"
            >
                Live Discovery <ArrowRight className="w-5 h-5" />
            </Link>
            <button 
                onClick={() => {
                    localStorage.removeItem('concert_user_email');
                    setUser(null);
                }}
                className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all font-bold text-sm"
                title="Sign Out"
            >
                Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Performers Section */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-50/30">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <Music className="w-6 h-6 text-indigo-500" />
                    Artists
                  </h2>
                  <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-indigo-500 border border-indigo-100 uppercase tracking-widest shadow-sm">
                    {performers.length} Available
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[500px] p-4 space-y-2">
                  {performers.length === 0 && (
                    <div className="py-20 text-center space-y-2">
                      <Music className="w-10 h-10 text-slate-100 mx-auto" />
                      <p className="text-slate-400 font-bold text-sm">No artists found in the system.</p>
                    </div>
                  )}
                  {performers.map(p => (
                    <div key={p.id} className="p-5 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500 transition-colors">
                          <Music className="w-5 h-5 font-bold" />
                        </div>
                        <span className="font-bold text-slate-700">{p.name}</span>
                      </div>
                      <button
                        onClick={() => handleSubscribe('performer', p.id)}
                        disabled={isSubscribed('performer', p.id)}
                        className={cn(
                          "text-xs px-6 py-2.5 rounded-xl font-black uppercase tracking-widest transition-all",
                          isSubscribed('performer', p.id)
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100 pointer-events-none"
                            : "bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95"
                        )}
                      >
                        {isSubscribed('performer', p.id) ? (
                          <span className="flex items-center gap-2"><Check className="w-4 h-4 stroke-[3]" /> Added</span>
                        ) : 'Follow'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Venues Section */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-orange-50/20">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-orange-500" />
                    Venues
                  </h2>
                  <span className="bg-white px-3 py-1 rounded-full text-[10px] font-black text-orange-500 border border-orange-100 uppercase tracking-widest shadow-sm">
                    {venues.length} Active
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[500px] p-4 space-y-2">
                  {venues.length === 0 && (
                     <div className="py-20 text-center space-y-2">
                        <MapPin className="w-10 h-10 text-slate-100 mx-auto" />
                        <p className="text-slate-400 font-bold text-sm">No venues registered yet.</p>
                      </div>
                  )}
                  {venues.map(v => (
                    <div key={v.id} className="p-5 rounded-2xl flex items-center justify-between hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                      <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{v.name}</span>
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">{v.city}</span>
                      </div>
                      <button
                        onClick={() => handleSubscribe('venue', v.id)}
                        disabled={isSubscribed('venue', v.id)}
                        className={cn(
                          "text-xs px-6 py-2.5 rounded-xl font-black uppercase tracking-widest transition-all",
                          isSubscribed('venue', v.id)
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100 pointer-events-none"
                            : "bg-orange-600 text-white shadow-lg shadow-orange-100 hover:scale-105 active:scale-95"
                        )}
                      >
                         {isSubscribed('venue', v.id) ? (
                          <span className="flex items-center gap-2"><Check className="w-4 h-4 stroke-[3]" /> Linked</span>
                        ) : 'Link'}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Sidebar: My Subscriptions */}
          <div className="lg:col-span-4 h-fit sticky top-28">
            <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                
                <h2 className="text-2xl font-black mb-6 flex items-center gap-3 relative">
                    <Bell className="w-6 h-6 text-indigo-400" />
                    My Alerts
                </h2>

                <div className="space-y-4 relative">
                    {subscriptions.length === 0 && (
                        <div className="py-12 px-6 rounded-3xl border-2 border-dashed border-slate-800 text-center">
                            <p className="text-slate-500 text-sm leading-relaxed font-bold italic">
                                "Subscribe to an artist to unlock personalized alerts."
                            </p>
                        </div>
                    )}
                    {subscriptions.map(sub => (
                        <div key={sub.id} className="bg-slate-800/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-700/50 flex items-center justify-between group animate-in fade-in slide-in-from-right-4">
                            <div className="flex flex-col">
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-[0.2em] mb-1.5",
                                    sub.performer_id ? 'text-indigo-400' : 'text-orange-400'
                                )}>
                                    {sub.performer_id ? 'Performer' : 'Venue'}
                                </span>
                                <span className="text-sm font-black text-white truncate max-w-[150px]">
                                    {sub.performer?.name || sub.venue?.name}
                                </span>
                            </div>
                            <button 
                                onClick={() => handleUnsubscribe(sub.id)}
                                className="w-10 h-10 bg-slate-700 hover:bg-rose-500/20 hover:text-rose-500 text-slate-400 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-10 p-5 bg-indigo-600 rounded-2xl flex items-center gap-4 relative">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs font-bold leading-tight">
                        You'll receive an email as soon as new dates are matched.
                    </p>
                </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}


