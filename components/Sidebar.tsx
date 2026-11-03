'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building,
  BookOpen,
  UserCheck,
  Receipt,
  CheckSquare,
  Award,
  FileQuestion,
  Calendar,
  BookMarked,
  Clock,
  Banknote,
  DollarSign,
  FileBadge,
  MessageSquare,
  LifeBuoy,
  Settings,
  LogOut,
} from 'lucide-react';
import { LogoutConfirmModal } from './LogoutConfirmModal';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (mod: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export function Sidebar({ activeModule, setActiveModule, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'students', label: 'Students & Admissions', icon: Users },
    { id: 'classes', label: 'Sessions & Classes', icon: Building },
    { id: 'subjects', label: 'Manual Subjects', icon: BookOpen },
    { id: 'staff', label: 'Teachers & Staff', icon: UserCheck },
    { id: 'fees', label: 'Fees & Challans', icon: Receipt },
    { id: 'attendance', label: 'Daily Attendance', icon: CheckSquare },
    { id: 'exams', label: 'Exams & Result Cards', icon: Award },
    { id: 'question_papers', label: 'Question Paper Builder', icon: FileQuestion },
    { id: 'date_sheets', label: 'Exam Date Sheets', icon: Calendar },
    { id: 'syllabus', label: 'Syllabus & Books', icon: BookMarked },
    { id: 'timetable', label: 'Weekly Timetable', icon: Clock },
    { id: 'payroll', label: 'Staff Payroll', icon: Banknote },
    { id: 'accounts', label: 'Cash Book & Accounts', icon: DollarSign },
    { id: 'certificates', label: 'Certificates (SLC)', icon: FileBadge },
    { id: 'notices', label: 'WhatsApp & Notices', icon: MessageSquare },
    { id: 'support', label: 'Support Tickets', icon: LifeBuoy },
    { id: 'settings', label: 'School Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-[53px] left-0 h-[calc(100vh-53px)] w-64 bg-white border-r border-slate-200 z-30 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 px-4">
          Management Modules
        </div>

        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 text-xs">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Action in Sidebar (Desktop & Mobile) */}
        <div className="p-2 border-t border-slate-200 bg-rose-50/50">
          <button
            type="button"
            onClick={() => {
              setIsLogoutModalOpen(true);
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-100 transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Sign Out (Logout)</span>
          </button>
        </div>

        {/* School Footer Branding */}
        <div className="p-3 border-t border-slate-200 text-[11px] text-slate-500 bg-slate-50">
          <p className="font-semibold text-slate-700">Pakistan School SaaS</p>
          <p className="text-[10px]">Multi-Tenant &amp; Supabase RLS</p>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
