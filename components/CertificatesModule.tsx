'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { School, CertificateRecord } from '@/lib/types';
import { FileBadge, Plus, Printer, Award, X, Download } from 'lucide-react';
import { triggerPrint, downloadCharacterCertificatePDF, downloadLeavingCertificatePDF } from '@/lib/pdf-generator';

interface CertificatesModuleProps {
  school: School;
}

export function CertificatesModule({ school }: CertificatesModuleProps) {
  const certificates = db.getCertificates(school.id);
  const students = db.getStudents(school.id);

  const [activeCert, setActiveCert] = useState<CertificateRecord | null>(certificates[0] || null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  const [form, setForm] = useState({
    student_id: students[0]?.id || '',
    certificate_type: 'Character' as CertificateRecord['certificate_type'],
    issue_date: '2026-11-01',
    conduct: 'Exemplary, Diligent & Well-Disciplined',
    reason_for_leaving: 'Completed Matriculation Examinations successfully',
  });

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === form.student_id);
    if (!st) return;

    const certText =
      form.certificate_type === 'School Leaving'
        ? `This is to certify that ${st.name}, son/daughter of ${st.father_name}, bearing B-Form / CNIC ${st.b_form_no}, was a bonafide student of this institution. He/she is leaving the school due to: ${form.reason_for_leaving}. His/her conduct and moral character during the entire stay at this institution was ${form.conduct}. All institutional dues have been completely settled.`
        : `This is to certify that ${st.name}, son/daughter of ${st.father_name}, is a regular bonafide student of Grade 10 Matric Science. He/she bears high moral character, disciplined demeanor, and active participation in institutional co-curricular pursuits. We wish him/her utmost success in future academic endeavors.`;

    const created = db.createCertificate({
      school_id: school.id,
      student_id: st.id,
      certificate_type: form.certificate_type,
      issue_date: form.issue_date,
      content_text: certText,
      character_conduct: form.conduct,
      reason_for_leaving: form.reason_for_leaving,
      signed_by: `${school.principal_name} (Principal)`,
    });

    setActiveCert(created);
    setIsIssueModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Official Certificates &amp; Leaving Letters (SLC)</h2>
          <p className="text-xs text-slate-500">
            Generate verified Character Certificates, School Leaving Certificates (SLC), and Bonafide Letters with unique serial numbers
          </p>
        </div>

        <button
          onClick={() => setIsIssueModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          Issue New Certificate
        </button>
      </div>

      {/* Certificate Viewer Preview */}
      {activeCert && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6 print-container max-w-3xl mx-auto">
          {/* Action strip */}
          <div className="flex justify-between items-center border-b pb-3 no-print">
            <span className="font-bold text-xs text-slate-800">
              Serial No: <strong className="font-mono text-orange-600">{activeCert.certificate_number}</strong>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const st = students.find((s) => s.id === activeCert.student_id);
                  if (activeCert.certificate_type === 'School Leaving') {
                    downloadLeavingCertificatePDF(school, activeCert, st);
                  } else {
                    downloadCharacterCertificatePDF(school, activeCert, st);
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
              <button
                onClick={triggerPrint}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Certificate (A4)
              </button>
            </div>
          </div>

          {/* Certificate Document */}
          <div className="p-8 border-4 border-double border-orange-600 rounded-lg space-y-6 text-center text-slate-900">
            {/* Header */}
            <div className="space-y-1">
              <span className="text-xs font-urdu text-slate-500 font-bold">{school.name_ur}</span>
              <h1 className="text-2xl font-black text-orange-600 tracking-tight uppercase">{school.name_en}</h1>
              <p className="text-xs text-slate-600">{school.address}</p>
              <p className="text-[11px] text-slate-500">Registration No: {school.registration_no || 'BISE/EDU/2026'}</p>
            </div>

            <div className="py-2">
              <span className="inline-block px-5 py-1.5 bg-slate-900 text-white font-black text-sm uppercase tracking-widest rounded">
                {activeCert.certificate_type === 'School Leaving' ? 'SCHOOL LEAVING CERTIFICATE' : 'CHARACTER CERTIFICATE'}
              </span>
              <div className="flex justify-between text-xs text-slate-500 mt-2 px-2">
                <span>Verification Serial: <strong className="font-mono text-slate-800">{activeCert.certificate_number}</strong></span>
                <span>Issue Date: <strong className="font-mono text-slate-800">{activeCert.issue_date}</strong></span>
              </div>
            </div>

            <div className="text-sm leading-relaxed text-slate-800 px-4 text-justify font-serif">
              {activeCert.content_text}
            </div>

            <div className="pt-12 flex justify-between items-end text-xs">
              <div className="text-center">
                <div className="w-36 border-b border-slate-400 mb-1"></div>
                <span className="font-semibold text-slate-700">Checked By / Registrar</span>
              </div>

              <div className="text-center">
                <div className="w-40 border-b border-slate-400 mb-1"></div>
                <p className="font-bold text-slate-900">{school.principal_name}</p>
                <p className="text-[10px] text-slate-500">Principal &amp; Head of Institution</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Issue Verified Certificate</h3>
              <button onClick={() => setIsIssueModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssue} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                <select
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md bg-white"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.admission_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Certificate Type *</label>
                <select
                  value={form.certificate_type}
                  onChange={(e) => setForm({ ...form, certificate_type: e.target.value as CertificateRecord['certificate_type'] })}
                  className="w-full px-3 py-2 border rounded-md bg-white"
                >
                  <option value="Character">Character Certificate</option>
                  <option value="School Leaving">School Leaving Certificate (SLC)</option>
                  <option value="Bonafide">Bonafide Student Certificate</option>
                  <option value="Transfer">Transfer Certificate</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Conduct &amp; Character Remarks</label>
                <input
                  type="text"
                  value={form.conduct}
                  onChange={(e) => setForm({ ...form, conduct: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Leaving (if SLC)</label>
                <input
                  type="text"
                  value={form.reason_for_leaving}
                  onChange={(e) => setForm({ ...form, reason_for_leaving: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsIssueModalOpen(false)} className="px-3 py-1.5 text-slate-700 bg-slate-100 rounded-md">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs">
                  Generate &amp; Print
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
