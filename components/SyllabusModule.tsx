'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { School, Syllabus } from '@/lib/types';
import { BookMarked, CheckCircle2, Circle, Plus, Printer, BookOpen } from 'lucide-react';
import { triggerPrint } from '@/lib/pdf-generator';

interface SyllabusModuleProps {
  school: School;
}

export function SyllabusModule({ school }: SyllabusModuleProps) {
  const syllabi = db.getSyllabi(school.id);
  const classes = db.getClasses(school.id);
  const subjects = db.getSubjects(school.id);

  const [activeSyllabus, setActiveSyllabus] = useState<Syllabus | null>(syllabi[0] || null);

  const handleToggleChapter = (chapterId: string) => {
    if (!activeSyllabus) return;
    const updatedChapters = activeSyllabus.chapters.map((ch) =>
      ch.id === chapterId ? { ...ch, is_completed: !ch.is_completed } : ch
    );
    setActiveSyllabus({ ...activeSyllabus, chapters: updatedChapters });
  };

  const completedCount = activeSyllabus?.chapters.filter((c) => c.is_completed).length || 0;
  const totalCount = activeSyllabus?.chapters.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Syllabus &amp; Curriculum Tracking</h2>
          <p className="text-xs text-slate-500">
            Monitor textbooks (Punjab Textbook Board / SNC), chapter completion progress, and lesson plans
          </p>
        </div>

        <button
          onClick={triggerPrint}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Syllabus (A4)
        </button>
      </div>

      {activeSyllabus && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6 print-container">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                Physics for Class 10
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{activeSyllabus.book_name}</h3>
              <p className="text-xs text-slate-500">
                Publisher: {activeSyllabus.publisher} · Edition: {activeSyllabus.edition}
              </p>
            </div>

            {/* Progress */}
            <div className="sm:text-right">
              <span className="text-2xl font-black text-slate-900 font-mono">{progressPercent}%</span>
              <p className="text-xs text-slate-500">{completedCount} of {totalCount} Chapters Completed</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-orange-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Chapters List */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900">Curriculum Chapters &amp; Topics</h4>
            <div className="space-y-2">
              {activeSyllabus.chapters.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => handleToggleChapter(ch.id)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                    ch.is_completed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="mt-0.5 text-emerald-600 shrink-0">
                    {ch.is_completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300" />
                    )}
                  </div>

                  <div className="space-y-1 flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Chapter {ch.chapter_number}: {ch.title}</span>
                        {ch.urdu_title && (
                          <span className="font-urdu text-slate-600 font-medium">({ch.urdu_title})</span>
                        )}
                      </div>
                      <span className="font-mono text-slate-500 text-[11px]">{ch.page_range}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ch.topics.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
