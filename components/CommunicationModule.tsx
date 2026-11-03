'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { School, SchoolNotice } from '@/lib/types';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Plus, Users, Bell, Phone } from 'lucide-react';

interface CommunicationModuleProps {
  school: School;
}

export function CommunicationModule({ school }: CommunicationModuleProps) {
  const notices = db.getNotices(school.id);
  const students = db.getStudents(school.id);
  const classes = db.getClasses(school.id);

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const [form, setForm] = useState({
    title: '',
    body: '',
    category: 'General Notice' as SchoolNotice['category'],
    target_audience: 'All' as SchoolNotice['target_audience'],
    class_id: classes[0]?.id || '',
    send_whatsapp: true,
  });

  const handleSendNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.body) {
      alert('Please enter notice title and body.');
      return;
    }

    db.createNotice({
      school_id: school.id,
      title: form.title,
      body: form.body,
      category: form.category,
      target_audience: form.target_audience,
      class_id: form.target_audience === 'Specific Class' ? form.class_id : undefined,
      sent_via_whatsapp: form.send_whatsapp,
      published_at: new Date().toISOString(),
    });

    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setIsComposeOpen(false);
      setForm({ ...form, title: '', body: '' });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">WhatsApp &amp; School Notifications</h2>
          <p className="text-xs text-slate-500">
            Send fee reminders, exam intimations, and urgent alerts directly to student guardian WhatsApp numbers
          </p>
        </div>

        <button
          onClick={() => setIsComposeOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          Broadcast Notice
        </button>
      </div>

      {/* Gateway Status Badge */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center gap-2.5">
          <Phone className="w-4 h-4 text-emerald-600" />
          <div>
            <p className="font-bold">Pakistani WhatsApp Gateway Active</p>
            <p className="text-[11px] text-emerald-800">
              Sender: <strong className="font-mono">{school.whatsapp || '0300-8451920'}</strong> (Automated delivery reports with retry queue)
            </p>
          </div>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold text-[10px]">
          ONLINE
        </span>
      </div>

      {/* Notices Feed */}
      <div className="space-y-4">
        {notices.map((n) => (
          <div
            key={n.id}
            className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{n.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                    {n.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target: <strong>{n.target_audience}</strong> · Published: {n.published_at.split('T')[0]}
                </p>
              </div>

              {n.sent_via_whatsapp && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  WhatsApp Sent
                </span>
              )}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">
              {n.body}
            </p>
          </div>
        ))}
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Broadcast School Notice</h3>

            {sentSuccess ? (
              <div className="py-6 text-center text-emerald-600 font-bold text-xs space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p>Notice published and dispatched to guardian WhatsApp contacts!</p>
              </div>
            ) : (
              <form onSubmit={handleSendNotice} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notice Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as SchoolNotice['category'] })}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="General Notice">General School Notice</option>
                    <option value="Fee Reminder">Monthly Fee Due Reminder</option>
                    <option value="Exam Notice">Examination Schedule</option>
                    <option value="Holiday">Gazetted Holiday / Vacation</option>
                    <option value="Urgent Alert">Urgent Weather / Security Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={form.target_audience}
                    onChange={(e) => setForm({ ...form, target_audience: e.target.value as SchoolNotice['target_audience'] })}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    <option value="All">All School Parents &amp; Students ({students.length})</option>
                    <option value="Specific Class">Specific Class Parents Only</option>
                    <option value="Staff Only">Faculty &amp; Staff Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject / Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Autumn Break Announcement"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notice Body *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type official notification message in English or Urdu..."
                    value={form.body}
                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={form.send_whatsapp}
                    onChange={(e) => setForm({ ...form, send_whatsapp: e.target.checked })}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  <span className="font-semibold text-slate-800">Dispatch directly to Parents&apos; WhatsApp numbers</span>
                </label>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-3 py-1.5 text-slate-700 bg-slate-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Broadcast Now
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
