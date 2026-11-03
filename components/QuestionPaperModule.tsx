'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { School, QuestionPaper, QuestionPaperItem } from '@/lib/types';
import { FileQuestion, Plus, Printer, Eye, Trash2, X, Check, ArrowUpDown } from 'lucide-react';

interface QuestionPaperModuleProps {
  school: School;
  onOpenQuestionPaperModal: (paper: QuestionPaper) => void;
}

export function QuestionPaperModule({ school, onOpenQuestionPaperModal }: QuestionPaperModuleProps) {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const papers = db.getQuestionPapers(school.id);
  const classes = db.getClasses(school.id);
  const subjects = db.getSubjects(school.id);

  // New Paper State
  const [paperTitle, setPaperTitle] = useState('Grade 10 Matric Science - Physics Mid-Term Examination');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [duration, setDuration] = useState(120);
  const [instructions, setInstructions] = useState('Attempt all questions from Section A (MCQs). Attempt any 4 short questions from Section B and 2 long questions from Section C.');

  const [questions, setQuestions] = useState<QuestionPaperItem[]>([
    {
      id: 'q1',
      question_type: 'MCQ',
      text: 'Which of the following physical quantities is a vector?',
      urdu_text: 'درج ذیل میں سے کون سی سمتی مقدار ہے؟',
      marks: 1,
      options: ['Speed', 'Displacement', 'Work', 'Temperature'],
      answer_key: 'Displacement',
    },
    {
      id: 'q2',
      question_type: 'Short',
      text: 'State Newton’s Second Law of Motion and derive its formula F = ma.',
      urdu_text: 'نیوٹن کا حرکت کا دوسرا قانون بیان کریں اور حسابی مساوات اخذ کریں۔',
      marks: 4,
      answer_key: 'When a net force acts on a body, it produces acceleration proportional to force and inversely proportional to mass.',
    },
    {
      id: 'q3',
      question_type: 'Long',
      text: 'Derive the second equation of motion (S = vit + 1/2 at^2) using a speed-time graph with complete derivation steps.',
      urdu_text: 'رفتار-وقت گراف کی مدد سے حرکت کی دوسری مساوات اخذ کریں۔',
      marks: 8,
      answer_key: 'Total distance = Area of rectangle + Area of triangle.',
    },
  ]);

  // Form for adding question item
  const [newQType, setNewQType] = useState<QuestionPaperItem['question_type']>('Short');
  const [newQText, setNewQText] = useState('');
  const [newQUrdu, setNewQUrdu] = useState('');
  const [newQMarks, setNewQMarks] = useState(4);
  const [newQOptions, setNewQOptions] = useState(['', '', '', '']);
  const [newQAnswer, setNewQAnswer] = useState('');

  const totalCalculatedMarks = questions.reduce((acc, q) => acc + q.marks, 0);

  const handleAddQuestion = () => {
    if (!newQText.trim()) return;

    const newItem: QuestionPaperItem = {
      id: `q_${Date.now()}`,
      question_type: newQType,
      text: newQText.trim(),
      urdu_text: newQUrdu.trim() || undefined,
      marks: Number(newQMarks),
      options: newQType === 'MCQ' ? newQOptions.filter((o) => o.trim()) : undefined,
      answer_key: newQAnswer.trim() || undefined,
    };

    setQuestions([...questions, newItem]);
    setNewQText('');
    setNewQUrdu('');
    setNewQAnswer('');
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSavePaper = () => {
    if (!paperTitle.trim() || questions.length === 0) {
      alert('Please enter paper title and at least one question.');
      return;
    }

    const saved = db.createQuestionPaper({
      school_id: school.id,
      class_id: selectedClassId,
      subject_id: selectedSubjectId,
      title: paperTitle,
      instructions,
      duration_minutes: Number(duration),
      total_marks: totalCalculatedMarks,
      questions,
      is_published: true,
    });

    setIsBuilderOpen(false);
    onOpenQuestionPaperModal(saved);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Official Question Paper Builder</h2>
          <p className="text-xs text-slate-500">
            Compose board-standard test papers with MCQs, short/long questions, Urdu translation, and printable answer keys
          </p>
        </div>

        <button
          onClick={() => setIsBuilderOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          Create New Question Paper
        </button>
      </div>

      {/* Existing Papers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {papers.map((p) => {
          const cls = classes.find((c) => c.id === p.class_id);
          const sub = subjects.find((s) => s.id === p.subject_id);
          return (
            <div
              key={p.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-700">
                    {sub ? sub.name_en : 'Exam Paper'}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {p.total_marks} Marks
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-2">{p.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">{p.instructions}</p>

                <div className="mt-3 bg-slate-50 p-2.5 rounded text-xs space-y-1">
                  <div>Class: <strong>{cls ? cls.name : 'Matric Science'}</strong></div>
                  <div>Time Allowed: <strong className="font-mono">{p.duration_minutes} Minutes</strong></div>
                  <div>Questions: <strong className="font-mono">{p.questions.length} Items</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  onClick={() => onOpenQuestionPaperModal(p)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print &amp; Download PDF
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Question Paper Builder Modal */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-orange-400" />
                <h3 className="font-bold text-sm">Design Examination Question Paper</h3>
              </div>
              <button onClick={() => setIsBuilderOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
              {/* Paper Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">Paper Title *</label>
                  <input
                    type="text"
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md font-semibold text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name_en}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md font-mono bg-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">General Instructions</label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-white"
                  />
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Questions in Paper ({questions.length} Items · Total Marks: <span className="font-mono text-orange-600 font-extrabold">{totalCalculatedMarks}</span>)
                  </h4>
                </div>

                <div className="space-y-2">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-slate-900">Q.{idx + 1}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px] text-slate-600 uppercase">
                            {q.question_type}
                          </span>
                          <span className="font-mono text-orange-600 font-bold">[{q.marks} Marks]</span>
                        </div>
                        <p className="text-slate-800">{q.text}</p>
                        {q.urdu_text && (
                          <p className="font-urdu text-right text-slate-600 text-xs">{q.urdu_text}</p>
                        )}
                        {q.options && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[11px] text-slate-600 pt-1">
                            {q.options.map((opt, oIdx) => (
                              <span key={oIdx}>({String.fromCharCode(65 + oIdx)}) {opt}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Question Sub-form */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <h5 className="font-bold text-xs uppercase text-slate-800">Add Question to Paper</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Question Type</label>
                    <select
                      value={newQType}
                      onChange={(e) => setNewQType(e.target.value as QuestionPaperItem['question_type'])}
                      className="w-full px-3 py-1.5 border rounded-md bg-white"
                    >
                      <option value="MCQ">Multiple Choice (MCQ)</option>
                      <option value="Short">Short Question</option>
                      <option value="Long">Long / Detailed Question</option>
                      <option value="FillBlank">Fill in the Blanks</option>
                      <option value="TrueFalse">True / False</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Question Marks</label>
                    <input
                      type="number"
                      value={newQMarks}
                      onChange={(e) => setNewQMarks(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border rounded-md bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Question Statement (English) *</label>
                  <textarea
                    rows={2}
                    placeholder="Enter question text..."
                    value={newQText}
                    onChange={(e) => setNewQText(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-md bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Question Statement (Urdu Translation)</label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="سوال اردو میں درج کریں..."
                    value={newQUrdu}
                    onChange={(e) => setNewQUrdu(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-md bg-white font-urdu"
                  />
                </div>

                {newQType === 'MCQ' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['A', 'B', 'C', 'D'].map((letter, i) => (
                      <div key={letter}>
                        <label className="block font-bold text-slate-600 mb-0.5">Option ({letter})</label>
                        <input
                          type="text"
                          placeholder={`Choice ${letter}`}
                          value={newQOptions[i]}
                          onChange={(e) => {
                            const updated = [...newQOptions];
                            updated[i] = e.target.value;
                            setNewQOptions(updated);
                          }}
                          className="w-full px-2 py-1 border rounded bg-white text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Answer Key / Solution Points</label>
                  <input
                    type="text"
                    placeholder="Correct choice or key grading points for answer key PDF..."
                    value={newQAnswer}
                    onChange={(e) => setNewQAnswer(e.target.value)}
                    className="w-full px-3 py-1.5 border rounded-md bg-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-4 py-2 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-2xs"
                >
                  + Add Question to Paper
                </button>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBuilderOpen(false)}
                className="px-4 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePaper}
                className="px-5 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs"
              >
                Publish &amp; Preview A4 PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
