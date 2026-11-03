'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  LogIn,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
  HelpCircle,
} from 'lucide-react';

function ApplicationStatusContent() {
  const searchParams = useSearchParams();
  const initialAppId = searchParams.get('appId') || '';
  const initialEmail = searchParams.get('email') || '';

  const [appId, setAppId] = useState(initialAppId);
  const [email, setEmail] = useState(initialEmail);
  const [appRecord, setAppRecord] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = appId.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanId) {
      setErrorMessage('Please enter your Application ID (e.g. APP-PK-2026-8941).');
      setAppRecord(null);
      return;
    }
    if (!cleanEmail) {
      setErrorMessage('Please enter your registered official school email address for privacy verification.');
      setAppRecord(null);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setAppRecord(null);

    try {
      // Find matching application by application_id or id safely without 22P02 UUID syntax error
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
      let query = supabase.from('school_applications').select('*');
      if (isUuid) {
        query = query.or(`application_id.ilike.${cleanId},id.eq.${cleanId}`);
      } else {
        query = query.ilike('application_id', cleanId);
      }
      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Lookup error:', error);
      }

      if (!data) {
        setErrorMessage(`No registration application found matching Application ID "${cleanId}". Please check the ID or register your school.`);
      } else {
        const emailMatches =
          (data.official_email && data.official_email.toLowerCase() === cleanEmail) ||
          (data.email && data.email.toLowerCase() === cleanEmail);

        if (!emailMatches) {
          setErrorMessage('The email address provided does not match the registered contact email for this Application ID.');
        } else {
          setAppRecord(data);
        }
      }
    } catch (err: any) {
      console.error('Error fetching application status:', err);
      setErrorMessage(err.message || 'Failed to search application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full flex flex-col justify-center">
      <div className="text-center mb-8 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-bold flex items-center justify-center text-xl shadow-sm mx-auto">
          <Search className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Application Status
        </h1>
        <p className="text-xs text-slate-500">
          Monitor your school&apos;s accreditation and Super Admin onboarding review progress
        </p>
        <p className="text-xs font-urdu text-orange-700 font-bold">
          اپنے سکول کی رجسٹریشن درخواست کی تصدیق اور صورتحال معلوم کریں
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Application ID</label>
              <input type="text" required placeholder="e.g. APP-PK-2026-9041" value={appId} onChange={(e) => setAppId(e.target.value)} className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono uppercase" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered School Email</label>
              <input type="email" required placeholder="e.g. admin@yourschool.edu.pk" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer">
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching Live Supabase...' : 'Search Application'}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold text-[11px]">Quick test:</span>
          <button type="button" onClick={() => { setAppId('APP-PK-2026-2145'); setEmail('qasimtest@gmail.com'); }} className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md text-[11px] font-medium">Pending: QASIM MODEL SCHOOL</button>
          <button type="button" onClick={() => { setAppId('APP-2026-6728'); setEmail('principal6728@alhadi-edu.pk'); }} className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-md text-[11px] font-medium">Under Review: Al-Hadi Grammar</button>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {appRecord && (
          <div className="pt-4 border-t border-slate-100 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-mono text-xs font-bold text-orange-600">{appRecord.application_id}</span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{appRecord.school_name_en || appRecord.school_name}</h3>
                {appRecord.school_name_ur && (
                  <p className="text-xs font-urdu text-slate-500 font-bold">{appRecord.school_name_ur}</p>
                )}
              </div>
              <div className="shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                  (appRecord.status || '').toLowerCase() === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : (appRecord.status || '').toLowerCase() === 'pending'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : (appRecord.status || '').toLowerCase() === 'under review'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-current" />
                  <span>Status: {appRecord.status || 'Pending'}</span>
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700">Verification Lifecycle Stage</p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800"><div className="font-bold">1. Submitted</div><div className="text-[10px] text-emerald-600">Received in Supabase</div></div>
                <div className={`p-2.5 rounded-lg border ${(appRecord.status || '').toLowerCase() === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold' : (appRecord.status || '').toLowerCase() === 'rejected' ? 'bg-rose-50 border-rose-200 text-rose-800 font-bold' : 'bg-amber-50 border-amber-200 text-amber-800 font-bold animate-pulse'}`}><div>2. Super Admin Review</div><div className="text-[10px]">{(appRecord.status || '').toLowerCase() === 'approved' ? 'Verified & Approved' : (appRecord.status || '').toLowerCase() === 'rejected' ? 'Accreditation Denied' : 'In Verification'}</div></div>
                <div className={`p-2.5 rounded-lg border ${(appRecord.status || '').toLowerCase() === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}><div>3. Portal Activation</div><div className="text-[10px]">{(appRecord.status || '').toLowerCase() === 'approved' ? 'Ready for Login' : 'Locked'}</div></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200">
              <div><span className="text-slate-400 block text-[11px]">Principal / Owner</span><span className="font-semibold text-slate-800">{appRecord.principal_name || appRecord.owner_name || 'N/A'}</span></div>
              <div><span className="text-slate-400 block text-[11px]">Location</span><span className="font-semibold text-slate-800">{appRecord.district || appRecord.city || ''}, {appRecord.province || 'Pakistan'}</span></div>
              <div><span className="text-slate-400 block text-[11px]">School Type</span><span className="font-semibold text-slate-800">{appRecord.school_type || 'Private'}</span></div>
              <div><span className="text-slate-400 block text-[11px]">Selected Subscription Tier</span><span className="font-semibold text-orange-700">{appRecord.selected_plan || 'Standard'} Plan ({appRecord.selected_duration || 'Monthly'})</span></div>
              <div className="sm:col-span-2"><span className="text-slate-400 block text-[11px]">Submission Timestamp</span><span className="font-mono text-slate-700">{appRecord.created_at ? new Date(appRecord.created_at).toLocaleString() : 'N/A'}</span></div>
              {appRecord.internal_notes && (<div className="sm:col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700"><span className="font-bold text-[11px] block text-slate-900 mb-0.5">Super Admin Review Remarks:</span><p className="text-xs">{appRecord.internal_notes}</p></div>)}
            </div>

            <div className="pt-2">
              {appRecord.status === 'Approved' ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-center">
                  <p className="text-xs text-emerald-800 font-semibold">Your institutional application has been approved! You can now log in to access your administrative dashboard.</p>
                  <Link href="/school/login" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"><LogIn className="w-4 h-4" /><span>Proceed to School Login</span></Link>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                  <p className="text-xs text-slate-600">Questions about your application? Contact Super Admin Support or verify status periodically.</p>
                  <div className="flex items-center justify-center gap-3"><Link href="/school/welcome" className="text-xs font-semibold text-orange-600 hover:underline">← Back to Portal Welcome</Link><span>·</span><Link href="/school/register" className="text-xs font-semibold text-slate-600 hover:underline">Register Another School</Link></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationStatusPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-8"><div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <ApplicationStatusContent />
    </Suspense>
  );
}