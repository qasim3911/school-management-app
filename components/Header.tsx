'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { School } from '@/lib/types';
import { Database, LogOut, ChevronDown, CheckCircle2, Building2, User, Shield } from 'lucide-react';
import { LogoutConfirmModal } from './LogoutConfirmModal';

interface HeaderProps {
  currentSchool: School;
  allSchools: School[];
  onSelectSchool: (id: string) => void;
  onOpenSupabase: () => void;
  onViewLanding: () => void;
  activeModule: string;
  setActiveModule: (mod: string) => void;
  supabaseConnected: boolean;
}

export function Header({
  currentSchool,
  allSchools,
  onSelectSchool,
  onOpenSupabase,
  onViewLanding,
  activeModule,
  setActiveModule,
  supabaseConnected,
}: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Zone 1: Brand / School Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-xs">
            {currentSchool.name_en.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm tracking-tight whitespace-nowrap">
                {currentSchool.name_en}
              </span>
              <span className="hidden md:inline text-xs font-urdu text-slate-500">
                {currentSchool.name_ur}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="font-mono text-orange-600 font-semibold">{currentSchool.registration_no || 'Reg: Verified'}</span>
              <span>·</span>
              <span>{currentSchool.city}, {currentSchool.province}</span>
              <span>·</span>
              <span className="inline-flex items-center px-1.5 py-0.2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[10px] rounded">
                Active School
              </span>
            </div>
          </div>
        </div>

        {/* Zone 2: Fast Navigation Shortcuts (Top Bar Contract) */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-600">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'students', label: 'Students' },
            { id: 'fees', label: 'Fee Challans' },
            { id: 'exams', label: 'Exams & Results' },
            { id: 'subjects', label: 'Subjects' },
            { id: 'accounts', label: 'Cash Book' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeModule === item.id
                  ? 'bg-orange-50 text-orange-700 font-semibold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions: Multi-Tenant Switcher & User Profile Menu with Logout */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* School Switcher */}
          <div className="relative">
            <select
              value={currentSchool.id}
              onChange={(e) => onSelectSchool(e.target.value)}
              className="text-xs font-medium bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-800 pr-7 appearance-none cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            >
              {allSchools.map((sch) => (
                <option key={sch.id} value={sch.id}>
                  🏫 {sch.name_en} ({sch.city})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Public Website Gateway Link */}
          <Link
            href="/"
            className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="View Public Welcome Gateway"
          >
            <Building2 className="w-3.5 h-3.5 text-orange-600" />
            <span>Portal Gateway</span>
          </Link>

          {/* User Profile Menu (Top Right) */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer"
              title="User Account Menu & Logout"
            >
              <div className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold text-xs flex items-center justify-center">
                {currentSchool.principal_name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left text-xs leading-none">
                <span className="font-bold text-slate-900 block truncate max-w-[120px]">
                  {currentSchool.principal_name}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Principal</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="px-3.5 py-2.5 border-b border-slate-100">
                  <p className="font-bold text-slate-900 truncate">{currentSchool.principal_name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentSchool.email}</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-bold rounded">
                    School Administrator
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setActiveModule('settings');
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>School Settings</span>
                  </button>
                  <Link
                    href="/"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Portal Welcome Page</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Standalone Visible Logout Button in Header Bar */}
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
            title="Sign Out of School Admin Portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}