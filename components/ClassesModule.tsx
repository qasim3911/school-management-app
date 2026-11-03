'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { School, SchoolClass, AcademicSession, Section } from '@/lib/types';
import { Building, Plus, Calendar, Check, Trash2, X, Users } from 'lucide-react';

interface ClassesModuleProps {
  school: School;
}

export function ClassesModule({ school }: ClassesModuleProps) {
  const [activeTab, setActiveTab] = useState<'classes' | 'sessions'>('classes');
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [selectedClassForSection, setSelectedClassForSection] = useState<string>('');

  const sessions = db.getSessions(school.id);
  const classes = db.getClasses(school.id);
  const sections = db.getSections(school.id);
  const staff = db.getStaff(school.id);
  const teachers = staff.filter((s) => s.department === 'Teaching');

  // Form states
  const [classNameInput, setClassNameInput] = useState('');
  const [classCapacityInput, setClassCapacityInput] = useState(40);
  const [sessionNameInput, setSessionNameInput] = useState('2027-2028');
  const [sectionNameInput, setSectionNameInput] = useState('');

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim()) return;

    db.createClass({
      school_id: school.id,
      session_id: sessions[0]?.id || 'ses_2026_2027_s1',
      name: classNameInput.trim(),
      numeric_order: classes.length + 1,
      capacity: Number(classCapacityInput),
    });

    setClassNameInput('');
    setIsAddClassModalOpen(false);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionNameInput.trim()) return;

    db.createSession({
      school_id: school.id,
      name: sessionNameInput.trim(),
      start_date: '2027-04-01',
      end_date: '2028-03-31',
      is_active: false,
      is_archived: false,
    });

    setSessionNameInput('');
    setIsAddSessionModalOpen(false);
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionNameInput.trim() || !selectedClassForSection) return;

    db.createSection({
      school_id: school.id,
      class_id: selectedClassForSection,
      name: sectionNameInput.trim(),
      capacity: 35,
    });

    setSectionNameInput('');
    setIsAddSectionModalOpen(false);
  };

  const handleDeleteClass = (classId: string) => {
    try {
      db.deleteClass(classId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Academic Sessions, Classes &amp; Sections</h2>
          <p className="text-xs text-slate-500">
            Define custom school grades (Playgroup to FSc / Matric), capacity limits, and session archives
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsAddSessionModalOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            New Session
          </button>
          <button
            onClick={() => setIsAddClassModalOpen(true)}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            Add Custom Class
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2">
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'classes' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Classes &amp; Sections ({classes.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'sessions' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Academic Sessions ({sessions.length})
        </button>
      </div>

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => {
            const classSections = sections.filter((s) => s.class_id === cls.id);
            return (
              <div
                key={cls.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{cls.name}</h3>
                      <p className="text-xs text-slate-500">Capacity: {cls.capacity || 40} Students</p>
                    </div>
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Delete Class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Sections */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Sections:</span>
                      <button
                        onClick={() => {
                          setSelectedClassForSection(cls.id);
                          setIsAddSectionModalOpen(true);
                        }}
                        className="text-[11px] text-orange-600 hover:underline font-bold"
                      >
                        + Add Section
                      </button>
                    </div>

                    <div className="space-y-1 pt-1">
                      {classSections.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No sections created yet.</p>
                      ) : (
                        classSections.map((sec) => (
                          <div
                            key={sec.id}
                            className="p-2 bg-slate-50 rounded border border-slate-100 text-xs flex justify-between items-center"
                          >
                            <span className="font-medium text-slate-800">{sec.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">Max {sec.capacity}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
                  <span>Order: #{cls.numeric_order}</span>
                  <span className="text-orange-600 font-semibold">Active in 2026-2027</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b">
              <tr>
                <th className="py-2.5 px-4 text-left font-semibold">Session Name</th>
                <th className="py-2.5 px-4 text-left font-semibold">Start Date</th>
                <th className="py-2.5 px-4 text-left font-semibold">End Date</th>
                <th className="py-2.5 px-4 text-center font-semibold">Status</th>
                <th className="py-2.5 px-4 text-center font-semibold">Historical Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((ses) => (
                <tr key={ses.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{ses.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{ses.start_date}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{ses.end_date}</td>
                  <td className="py-3 px-4 text-center">
                    {ses.is_active ? (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                        ACTIVE SESSION
                      </span>
                    ) : ses.is_archived ? (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700">
                        ARCHIVED
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                        UPCOMING
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">
                    Preserved &amp; Locked
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Custom Class Modal */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Add Custom Class</h3>
              <button onClick={() => setIsAddClassModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Custom Class Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Playgroup, Grade 6, FSc Pre-Engineering"
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <div className="mt-2 space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold">Ready-Made Pakistani Templates:</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      'Nursery',
                      'Prep (KG)',
                      'Grade 1',
                      'Grade 5',
                      'Grade 8',
                      'Grade 9 (Science)',
                      'Grade 10 (Matric)',
                      'FSc Pre-Medical',
                      'FSc Pre-Engineering',
                      'ICS (Computer Science)',
                    ].map((template) => (
                      <button
                        key={template}
                        type="button"
                        onClick={() => setClassNameInput(template)}
                        className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-orange-100 hover:text-orange-800 rounded border border-slate-200 transition-colors"
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Capacity</label>
                <input
                  type="number"
                  value={classCapacityInput}
                  onChange={(e) => setClassCapacityInput(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-3 py-1.5 text-slate-700 bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {isAddSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">Add Section to Class</h3>
              <button onClick={() => setIsAddSectionModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Section Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Section B, Jasmine, Rose, Pre-Med Alpha"
                  value={sectionNameInput}
                  onChange={(e) => setSectionNameInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSectionModalOpen(false)}
                  className="px-3 py-1.5 text-slate-700 bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
