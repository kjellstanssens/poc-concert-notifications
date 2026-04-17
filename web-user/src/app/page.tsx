'use client';

import { useState, useEffect } from 'react';
import { apiService, Performer, Venue, User } from '@/lib/api';
import { UserIcon, MapPin, Music, Bell, Check, Trash2, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
      <main className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Concert Tracker</h1>
            <p className="text-sm text-gray-500 mt-2">Enter your email to manage your notifications</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-black"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Started'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-4 border-b">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-indigo-600" />
              My Discovery Dashboard
            </h1>
            <p className="text-gray-500 text-sm">Welcome back, {user.email}</p>
          </div>
          <button 
            onClick={() => setUser(null)}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Performers Section */}
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <Music className="w-5 h-5 text-purple-600" />
              Follow Performers
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                {performers.map(p => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <span className="font-medium text-gray-700">{p.name}</span>
                    <button
                      onClick={() => handleSubscribe('performer', p.id)}
                      disabled={isSubscribed('performer', p.id)}
                      className={cn(
                        "text-sm px-4 py-1.5 rounded-full border transition-all",
                        isSubscribed('performer', p.id)
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                      )}
                    >
                      {isSubscribed('performer', p.id) ? (
                        <span className="flex items-center gap-1 font-semibold"><Check className="w-4 h-4" /> Following</span>
                      ) : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Venues Section */}
          <section>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <MapPin className="w-5 h-5 text-orange-600" />
              Follow Venues
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                {venues.map(v => (
                  <div key={v.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col">
                        <span className="font-medium text-gray-700">{v.name}</span>
                        <span className="text-xs text-gray-400">{v.city}</span>
                    </div>
                    <button
                      onClick={() => handleSubscribe('venue', v.id)}
                      disabled={isSubscribed('venue', v.id)}
                      className={cn(
                        "text-sm px-4 py-1.5 rounded-full border transition-all",
                        isSubscribed('venue', v.id)
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50"
                      )}
                    >
                      {isSubscribed('venue', v.id) ? (
                        <span className="flex items-center gap-1 font-semibold"><Check className="w-4 h-4" /> Following</span>
                      ) : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* My Subscriptions List (Bottom) */}
        <section className="mt-12">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 border-t pt-8">My active subscriptions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {subscriptions.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400 italic">
                        No active subscriptions. Follow some artists or venues to get started!
                    </div>
                )}
                {subscriptions.map(sub => (
                    <div key={sub.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between group">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                {sub.performer_id ? 'Performer' : 'Venue'}
                            </span>
                            <span className="text-sm font-semibold text-gray-800 truncate max-w-[150px]">
                                {sub.performer?.name || sub.venue?.name}
                            </span>
                        </div>
                        <button 
                            onClick={() => handleUnsubscribe(sub.id)}
                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                            title="Remove subscription"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </section>
      </div>
    </main>
  );
}

