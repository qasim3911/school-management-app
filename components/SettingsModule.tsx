'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { School } from '@/lib/types';
import { Settings, Save, Check, Building2, Upload, Phone, Mail, Clock, Award } from 'lucide-react';

interface SettingsModuleProps {
  school: School;
  onSchoolUpdated: () => void;
}

export function SettingsModule({ school, onSchoolUpdated }: SettingsModuleProps) {
  const [form, setForm] = useState({
    name_en: school.name_en,
    name_ur: school.name_ur,
    registration_no: school.registration_no || '',
    owner_name: school.owner_name,
    principal_name: school.principal_name,
    email: school.email,
    phone: school.phone,
    whatsapp: school.whatsapp,
    province: school.province,
    district: school.district,
    city: school.city,
    address: school.address,
    school_timings: school.school_timings || '07:45 AM - 01:45 PM',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSchoolProfile(school.id, form);
    onSchoolUpdated();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">School Profile &amp; Official Document Branding</h2>
          <p className="text-xs text-slate-500">
            Configure institutional titles in English and Urdu, principal signature, registration numbers, and school timings
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 rounded-md flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            Changes Saved Successfully!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 text-xs">
        {/* Basic Identification */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-orange-600 border-b pb-1">
            Institutional Branding (Appears on all PDF Documents)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">School Name (English) *</label>
              <input
                type="text"
                required
                value={form.name_en}
                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                className="w-full px-3 py-2 border rounded-md font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">School Name (Urdu)</label>
              <input
                type="text"
                dir="rtl"
                value={form.name_ur}
                onChange={(e) => setForm({ ...form, name_ur: e.target.value })}
                className="w-full px-3 py-2 border rounded-md font-urdu text-sm font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Govt / Board Registration No.</label>
              <input
                type="text"
                value={form.registration_no}
                onChange={(e) => setForm({ ...form, registration_no: e.target.value })}
                className="w-full px-3 py-2 border rounded-md font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">School Timings</label>
              <input
                type="text"
                value={form.school_timings}
                onChange={(e) => setForm({ ...form, school_timings: e.target.value })}
                className="w-full px-3 py-2 border rounded-md font-mono"
              />
            </div>
          </div>
        </div>

        {/* Leadership */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-orange-600 border-b pb-1">
            Leadership &amp; Authorized Signatory
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Principal / Head Teacher Name *</label>
              <input
                type="text"
                required
                value={form.principal_name}
                onChange={(e) => setForm({ ...form, principal_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md font-medium"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Appears automatically on Admission Letters &amp; Result Cards</p>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Owner / Chairman Name *</label>
              <input
                type="text"
                required
                value={form.owner_name}
                onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Contacts & Address */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-orange-600 border-b pb-1">
            Official Contact Particulars
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-md font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Telephone *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-md font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp Business Line</label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full px-3 py-2 border rounded-md font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Province</label>
              <input
                type="text"
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Complete Campus Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Profile Settings
          </button>
        </div>
      </form>
    </div>
  );
}
