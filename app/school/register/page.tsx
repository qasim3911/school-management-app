'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getSupabaseClient, supabaseSignUpSchool } from '@/lib/supabase';
import {
  SchoolType,
  SubscriptionTier,
  SubscriptionDuration,
} from '@/lib/types';
import {
  UserPlus, Building2, CheckCircle2, AlertCircle, Copy, Check, Eye, EyeOff, Upload, ShieldAlert, Search, LogIn,
} from 'lucide-react';

export default function SchoolRegisterPage() {
  const [formData, setFormData] = useState({
    school_name_en: '', 
    school_name_ur: '', 
    school_type: 'Private' as SchoolType,
    registration_number: '', 
    principal_name: '', 
    owner_name: '', 
    official_email: '',
    mobile_number: '', 
    whatsapp_number: '', 
    province: 'Punjab', 
    district: 'Lahore',
    tehsil: 'Model Town', 
    complete_address: '', 
    student_count_estimate: 300,
    teacher_count_estimate: 20, 
    branches_count: 1, 
    selected_plan: 'Standard' as SubscriptionTier,
    selected_duration: 'Yearly' as SubscriptionDuration, 
    password: '', 
    confirm_password: '', 
    terms_accepted: false,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { setErrorMessage('Logo size must be under 2MB.'); return; }
      const reader = new FileReader();
      reader.onloadend = () => { setLogoPreview(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyId = () => {
    if (submittedApp?.application_id) {
      navigator.clipboard.writeText(submittedApp.application_id);
      setIsCopied(true); setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setErrorMessage(null);

    if (!formData.school_name_en.trim()) { setErrorMessage('Please enter School Name'); return; }
    if (!formData.principal_name.trim()) { setErrorMessage('Please enter Principal Name'); return; }
    if (!formData.official_email.trim()) { setErrorMessage('Please enter Official Email'); return; }
    if (formData.password.length < 6) { setErrorMessage('Password must be at least 6 chars'); return; }
    if (formData.password !== formData.confirm_password) { setErrorMessage('Passwords do not match'); return; }
    if (!formData.terms_accepted) { setErrorMessage('Accept Terms and Conditions'); return; }

    setIsSubmitting(true);
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase not configured. Check .env.local');

      const appId = `APP-PK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const cleanMobile = formData.mobile_number.replace(/[-\s]/g, '');
      const cleanEmail = formData.official_email.trim().toLowerCase();

      // 1. Auth Signup - fail bhi ho to ignore karo
      try { 
        await supabaseSignUpSchool(cleanEmail, formData.password, { school_name_en: formData.school_name_en }); 
      } catch (authErr) { console.log("Auth skipped", authErr); }

      // 2. Insert into Supabase - FIXED
      const { data, error } = await client
        .from('school_applications')
        .insert([{
          application_id: appId,
          school_name: formData.school_name_en.trim(),
          school_name_en: formData.school_name_en.trim(),
          school_name_ur: formData.school_name_ur.trim() || formData.school_name_en.trim(),
          school_type: formData.school_type,
          owner_name: formData.owner_name.trim() || formData.principal_name.trim(),
          principal_name: formData.principal_name.trim(),
          official_email: cleanEmail,
          email: cleanEmail,
          mobile_number: cleanMobile,
          phone: cleanMobile,
          whatsapp_number: formData.whatsapp_number.trim() || cleanMobile,
          province: formData.province,
          district: formData.district,
          city: formData.district,
          tehsil: formData.tehsil,
          complete_address: formData.complete_address,
          address: formData.complete_address,
          student_count_estimate: Number(formData.student_count_estimate),
          teacher_count_estimate: Number(formData.teacher_count_estimate),
          student_count: Number(formData.student_count_estimate),
          teacher_count: Number(formData.teacher_count_estimate),
          branches_count: Number(formData.branches_count),
          registration_number: formData.registration_number,
          selected_plan: formData.selected_plan,
          selected_duration: formData.selected_duration,
          status: 'Pending',
          logo_url: logoPreview || null,
        }])
        .select()
        .single();

      if (error) {
        if (error.message.toLowerCase().includes('duplicate') || error.message.toLowerCase().includes('unique')) {
          throw new Error(`Email ${cleanEmail} already used. Please delete old row from Supabase Table Editor or use ${cleanEmail.replace('@','+1@')}`);
        }
        throw error;
      }
      
      setSubmittedApp(data);

    } catch (err: any) {
      console.error("Registration Error:", err);
      setErrorMessage(err.message || 'Registration failed');
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (submittedApp) {
    return (
      <div className="flex-1 py-12 px-4 max-w-2xl mx-auto w-full flex flex-col justify-center">
        <div className="bg-white rounded-2xl border shadow-sm p-6 sm:p-10 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto"><CheckCircle2 className="w-10 h-10" /></div>
          <h1 className="text-2xl font-extrabold">Registration Successful!</h1>
          <p className="text-sm text-slate-600">Application for <b>{submittedApp.school_name_en || submittedApp.school_name}</b> received.</p>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-center">
            <p className="text-xs font-bold text-orange-900 uppercase">Your Unique Application ID</p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="font-mono text-xl font-black text-orange-700">{submittedApp.application_id}</span>
              <button type="button" onClick={handleCopyId} className="p-1.5 bg-white border rounded-lg hover:bg-slate-50">{isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}</button>
            </div>
            <p className="text-[11px] text-orange-800 mt-2">Is ID ko save rakhain, status check karne ke liye chahiye hogi.</p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Link href={`/school/application-status?appId=${submittedApp.application_id}`} className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm flex items-center gap-2"><Search className="w-4 h-4" />Track Status</Link>
            <Link href="/school/login" className="px-6 py-2.5 rounded-xl bg-slate-100 font-bold text-sm flex items-center gap-2"><LogIn className="w-4 h-4" />School Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8 px-4 max-w-4xl mx-auto w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold flex justify-center gap-2"><Building2 className="w-8 h-8 text-emerald-700"/> Register Your School</h1>
        <p className="text-sm text-slate-600 mt-1">Complete onboarding form for EduPak</p>
      </div>
      <div className="bg-white rounded-2xl border shadow-sm p-6 sm:p-10">
        {errorMessage && <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex gap-3"><AlertCircle className="w-5 h-5 text-red-600 shrink-0" /><p className="text-xs text-red-700 font-medium">{errorMessage}</p></div>}
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold">School Name (English) *</label><input type="text" required value={formData.school_name_en} onChange={e=>setFormData({...formData,school_name_en:e.target.value})} className="mt-1 w-full text-sm px-3.5 py-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="QASIM MODEL SCHOOL" /></div>
            <div><label className="text-xs font-semibold">School Name (Urdu)</label><input type="text" value={formData.school_name_ur} onChange={e=>setFormData({...formData,school_name_ur:e.target.value})} className="mt-1 w-full text-sm px-3.5 py-2.5 rounded-lg border" placeholder="قاسم ماڈل سکول" /></div>
            
            <div><label className="text-xs font-semibold">Principal Name *</label><input type="text" required value={formData.principal_name} onChange={e=>setFormData({...formData,principal_name:e.target.value})} className="mt-1 w-full text-sm px-3.5 py-2.5 rounded-lg border" /></div>
            <div><label className="text-xs font-semibold">Owner Name</label><input type="text" value={formData.owner_name} onChange={e=>setFormData({...formData,owner_name:e.target.value})} className="mt-1 w-full text-sm px-3.5 py-2.5 rounded-lg border" /></div>

            <div><label className="text-xs font-semibold">Official Email *</label><input type="email" required value={formData.official_email} onChange={e=>setFormData({...formData,official_email:e.target.value})} className="mt-1 w-full text-sm px-3.5 py-2.5 rounded-lg border" placeholder="qasim+1@gmail.com for testing" /></div>
            <div><label className="text-xs font-semibold">Mobile Number *</label><input type="tel" required value={formData.mobile_number} onChange={e=>setFormData({...formData,mobile_number:e.target.value})} className="mt-1 w-full text-sm px-3.5 py-2.5 rounded-lg border" placeholder="0300-1234567" /></div>

            <div><label className="text-xs font-semibold">Province</label><select value={formData.province} onChange={e=>setFormData({...formData,province:e.target.value})} className="mt-1 w-full text-sm px-3.5 py-2.5 rounded-lg border"><option>Punjab</option><option>Sindh</option><option>KPK</option><option>Balochistan</option><option>Islamabad</option></select></div>
            <div><label className="text-xs font-semibold">District</label><input type="text" value={formData.district} onChange={e=>setFormData({...formData,district:e.target.value})} className="mt-1 w-full text-sm px-3.5 py-2.5 rounded-lg border" /></div>

            <div className="sm:col-span-2"><label className="text-xs font-semibold">Complete Address *</label><textarea required rows={3} value={formData.complete_address} onChange={e=>setFormData({...formData,complete_address:e.target.value})} className="mt-1 w-full text-sm px-3.5 py-2.5 rounded-lg border" placeholder="Full school address" /></div>

            <div><label className="text-xs font-semibold">Password *</label><div className="relative"><input type={showPassword?'text':'password'} required value={formData.password} onChange={e=>setFormData({...formData,password:e.target.value})} className="mt-1 w-full text-sm px-3.5 py-2.5 rounded-lg border pr-10" /><button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-2.5 top-3"><Eye className="w-4 h-4 text-slate-500" /></button></div></div>
            <div><label className="text-xs font-semibold">Confirm Password *</label><input type="password" required value={formData.confirm_password} onChange={e=>setFormData({...formData,confirm_password:e.target.value})} className="mt-1 w-full text-sm px-3.5 py-2.5 rounded-lg border" /></div>
          </div>

          <div className="flex items-start gap-3"><input type="checkbox" required checked={formData.terms_accepted} onChange={e=>setFormData({...formData,terms_accepted:e.target.checked})} className="mt-1" /><span className="text-xs text-slate-600">I accept Terms and Conditions and Privacy Policy *</span></div>
          
          <button type="submit" disabled={isSubmitting} className="w-full px-8 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex justify-center gap-2 disabled:opacity-60">
            {isSubmitting ? 'Submitting...' : <><UserPlus className="w-5 h-5"/> Register Your School</>}
          </button>
        </form>
      </div>
    </div>
  );
}