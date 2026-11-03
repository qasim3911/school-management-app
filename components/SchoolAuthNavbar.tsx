'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  LogIn,
  UserPlus,
  Search,
  KeyRound,
  LayoutDashboard,
  ShieldAlert,
} from 'lucide-react';

export function SchoolAuthNavbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/school/welcome', label: 'Portal Welcome', icon: Building2 },
    { href: '/school/login', label: 'School Login', icon: LogIn },
    { href: '/school/register', label: 'Register School', icon: UserPlus },
    { href: '/school/application-status', label: 'Track Application', icon: Search },
    { href: '/school/forgot-password', label: 'Forgot Password', icon: KeyRound },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/school/welcome" className="flex items-center gap-3 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-bold flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
            🇵🇰
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">
                PAKISTAN SCHOOL SAAS
              </span>
              <span className="hidden md:inline px-1.5 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-bold rounded">
                Portal Auth
              </span>
            </div>
            <p className="text-[11px] font-urdu text-slate-500 font-semibold leading-none">
              قومی سکول مینجمنٹ سسٹم
            </p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-600">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 font-bold'
                    : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">School Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
