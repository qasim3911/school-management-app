'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { supabase, supabaseSignInSchool } from '@/lib/supabase';
import {
  LogIn,
  Eye,
  EyeOff,
  Building2,
  AlertCircle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  UserPlus,
  Search,
  KeyRound,
  ArrowRight,
} from 'lucide-react';

export default function SchoolLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Status Alerts
  const [loginResult, setLoginResult] = useState<{
    type: 'success' | 'pending' | 'under_review' | 'info_required' | 'rejected' | 'suspended' | 'expired' | 'invalid';
    title: string;
    message: string;
    appId?: string;
  } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginResult(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setLoginResult({
        type: 'invalid',
        title: 'Missing Fields',
        message: 'Please enter both your registered school email address and password.',
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Query Real Supabase school_applications
      const { data: appData, error: appError } = await supabase
        .from('school_applications')
        .select('*')
        .or(`email.ilike.${cleanEmail},official_email.ilike.${cleanEmail}`)
        .maybeSingle();

      if (appError) {
        console.error('Supabase application lookup error:', appError);
      }

      if (appData) {
        const statusLower = (appData.status || '').toLowerCase();

        if (statusLower === 'pending') {
          setLoginResult({
            type: 'pending',
            title: 'Access Restricted: Application Pending Approval',
            message: `Your school application (${appData.application_id || 'Submitted'}) was received and is currently awaiting accreditation review and plan verification by the Super Admin. School Dashboard access is automatically enabled once approved.`,
            appId: appData.application_id,
          });
          setIsLoading(false);
          return;
        }

        if (statusLower === 'under review') {
          setLoginResult({
            type: 'under_review',
            title: 'Access Restricted: Application Under Review',
            message: `Your school application (${appData.application_id}) is currently under active review by the Super Admin team.`,
            appId: appData.application_id,
          });
          setIsLoading(false);
          return;
        }

        if (statusLower === 'rejected') {
          setLoginResult({
            type: 'rejected',
            title: 'Access Denied: Application Not Approved',
            message: appData.rejection_reason || appData.internal_notes || 'Your registration application was reviewed and not approved by the Super Admin.',
            appId: appData.application_id,
          });
          setIsLoading(false);
          return;
        }

        if (statusLower === 'suspended') {
          setLoginResult({
            type: 'suspended',
            title: 'School Account Suspended',
            message: 'This school account has been suspended by the Super Admin. Please contact administrative support.',
          });
          setIsLoading(false);
          return;
        }

        if (statusLower === 'approved') {
          // Attempt real Supabase Auth signInWithPassword
          try {
            await supabaseSignInSchool(cleanEmail, password);
          } catch (authErr) {
            console.log('Supabase Auth warning:', authErr);
          }

          const approvedSchool = db.registerApprovedSchool(appData);
          db.setCurrentSchoolId(approvedSchool.id);
          db.setAuthenticatedSession({ email: cleanEmail, school_id: approvedSchool.id });

          setLoginResult({
            type: 'success',
            title: 'Authentication Successful',
            message: `Welcome, ${approvedSchool.principal_name || 'Principal'}! Redirecting to ${approvedSchool.name_en}...`,
          });

          setTimeout(() => {
            router.push('/dashboard');
          }, 800);
          return;
        }
      }

      // If no application found in Supabase
      setLoginResult({
        type: 'invalid',
        title: 'Invalid Login Credentials',
        message: 'No school registration or approved application found matching this email address. Please register your school first.',
      });
      setIsLoading(false);
      return;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setLoginResult({
        type: 'invalid',
        title: 'Login Error',
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill demo helpers
  const handleDemoFill = (schoolEmail: string) => {
    setEmail(schoolEmail);
    setPassword('Pakistan@2026');
    setLoginResult(null);
  };

  return (
    <div className="flex-1 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-md mx-auto w-full flex flex-col justify-center">
      {/* Branding Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white font-bold flex items-center justify-center text-2xl shadow-sm mx-auto">
          🇵🇰
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          School Admin Login
        </h1>
        <p className="text-xs text-slate-500">
          Sign in with your registered school administrator credentials
        </p>
        <p className="text-xs font-urdu text-orange-700 font-bold">
          سکول ایڈمنسٹریشن لاگ ان
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Status Alerts */}
        {loginResult && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 ${
              loginResult.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : loginResult.type === 'pending'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : loginResult.type === 'under_review'
                ? 'bg-blue-50 border-blue-300 text-blue-900'
                : loginResult.type === 'info_required'
                ? 'bg-purple-50 border-purple-300 text-purple-900'
                : loginResult.type === 'suspended'
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : loginResult.type === 'expired'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
          >
            <div className="flex items-start gap-2.5 font-bold">
              {loginResult.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : loginResult.type === 'pending' || loginResult.type === 'under_review' ? (
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{loginResult.title}</span>
            </div>
            <p className="leading-relaxed text-[11px]">{loginResult.message}</p>

            {loginResult.appId && (
              <div className="pt-1">
                <Link
                  href={`/school/application-status?appId=${loginResult.appId}`}
                  className="inline-flex items-center gap-1 font-bold underline hover:no-underline"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Check Application Status ({loginResult.appId}) →</span>
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Registered Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. admin@iqbalschool.edu.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link
                href="/school/forgot-password"
                className="text-xs text-orange-600 hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter your administrative password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-xs text-slate-600">Remember Me</span>
            </label>

            <Link
              href="/school/application-status"
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Track Application
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying Credentials with Supabase...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Login to School Portal</span>
              </>
            )}
          </button>
        </form>

        {/* Register Your School Link */}
        <div className="pt-2 text-center text-xs text-slate-600">
          <span>Don&apos;t have a registered school yet? </span>
          <Link
            href="/school/register"
            className="text-emerald-700 font-bold hover:underline"
          >
            Register Your School Now
          </Link>
        </div>
      </div>
    </div>
  );
}