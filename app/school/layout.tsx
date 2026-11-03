'use client';

import React from 'react';
import { SchoolAuthNavbar } from '@/components/SchoolAuthNavbar';

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SchoolAuthNavbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Pakistan School Management SaaS · Multi-Tenant Cloud Architecture</p>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Karachi · Lahore · Islamabad · Peshawar · Quetta</span>
            <span>·</span>
            <span className="font-semibold text-orange-600">Secure Supabase Auth</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
