'use client';

import { useState, useEffect } from 'react';
import { apiService, Concert, User } from '@/lib/api';
import { Bell, MapPin, Music, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DiscoverPage() {
  const [user, setUser] = useState<User | null>(null);
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for logged in user in localStorage
    const savedEmail = localStorage.getItem('concert_user_email');
    if (savedEmail) {
      apiService.getOrCreateUser(savedEmail).then(u => {
        setUser(u);
      }).catch(() => {
        window.location.href = '/';
      });
    } else {
        window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    if (user) {
        loadConcerts();
    }
  }, [user, search]);

  const loadConcerts = async () => {
    setLoading(true);
    try {
      const data = await apiService.getConcerts(search);
      setConcerts(data);
    } catch (err) {
      console.error("Failed to load concerts", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-4 border-b">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Music className="w-6 h-6 text-indigo-600" />
                Live Concert Feed
                </h1>
                <p className="text-gray-500 text-sm">Discover upcoming events specialized for you</p>
            </div>
          </div>
        </header>

        <section className="mb-12">
            <div className="relative max-w-2xl mb-8">
                <Music className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search for concerts, artists, or venues..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 text-black"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading && concerts.length === 0 ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {concerts.length === 0 && (
                        <div className="col-span-full py-12 text-center text-gray-400">
                            No concerts found matching your selection.
                        </div>
                    )}
                    {concerts.map(concert => (
                        <div key={concert.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                        {new Date(concert.date).toLocaleDateString('en-BE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                    <span className="text-xs text-gray-400 font-mono">#{concert.id}</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                                    {concert.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    {concert.venue?.name}
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {concert.performers.map((p: any) => (
                                        <span key={p.id} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                            {p.name}
                                        </span>
                                    ))}
                                </div>

                                <a 
                                    href={concert.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="block text-center w-full py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors"
                                >
                                    View Ticket Details
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
      </div>
    </main>
  );
}
