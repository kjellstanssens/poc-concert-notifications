'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Music, 
  MapPin, 
  Bell, 
  Compass, 
  User,
  Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Discover', href: '/discover', icon: Compass },
  { label: 'Artists', href: '/artists', icon: Music },
  { label: 'Venues', href: '/venues', icon: MapPin },
  { label: 'My Alerts', href: '/alerts', icon: Bell },
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-[1.02]">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100 rotate-3 group-hover:rotate-0 transition-transform">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">BE<span className="text-indigo-600">LIVE</span></span>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 -mt-1">Concert Alerts</p>
          </div>
        </Link>

        <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="nav-bg"
                    className="absolute inset-0 bg-white shadow-sm border border-slate-100 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={`relative z-10 w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <button className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-200">
          <User className="w-4 h-4" />
          Join Club
        </button>
      </div>
    </nav>
  );
};
