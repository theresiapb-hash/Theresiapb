/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, Calendar, FileCheck, HelpCircle } from 'lucide-react';
import { Note, LanguageCode } from '../types';
import { TRANSLATIONS } from '../locales';

interface NotebookProps {
  currentLanguage: LanguageCode;
  notes: Note[];
  onAddNote: (title: string, content: string) => void;
  onDeleteNote: (id: string) => void;
}

export default function Notebook({ currentLanguage, notes, onAddNote, onDeleteNote }: NotebookProps) {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showFocusedPage, setShowFocusedPage] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [selectedSubjectTheme, setSelectedSubjectTheme] = useState<'General' | 'Math' | 'Science' | 'History'>('General');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onAddNote(`${selectedSubjectTheme !== 'General' ? '[' + selectedSubjectTheme + '] ' : ''}${title}`, content);
    setTitle('');
    setContent('');
    setShowFocusedPage(false);
  };

  const getWordCount = (text: string) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md h-full flex flex-col justify-between" id="notebook-feature-container">
      {/* Immersive Distraction-Free 'Paper' Concentration Screen */}
      {showFocusedPage && (
        <div className="fixed inset-0 bg-stone-100/95 z-[9999] flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 backdrop-blur-md overflow-hidden animate-scaleUp">
          <div className="w-full max-w-4xl bg-[#faf6ee] rounded-3xl shadow-2xl border-2 border-stone-200/50 flex flex-col h-[92vh] max-h-[850px] relative overflow-hidden">
            {/* Lined paper binder ring holes left element to feel tangible */}
            <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-around w-4 py-8 pointer-events-none z-10">
              <div className="w-4 h-4 rounded-full bg-stone-300 shadow-inner border border-stone-400/30"></div>
              <div className="w-4 h-4 rounded-full bg-stone-300 shadow-inner border border-stone-400/30"></div>
              <div className="w-4 h-4 rounded-full bg-stone-300 shadow-inner border border-stone-400/30"></div>
              <div className="w-4 h-4 rounded-full bg-stone-300 shadow-inner border border-stone-400/30"></div>
              <div className="w-4 h-4 rounded-full bg-stone-300 shadow-inner border border-stone-400/30"></div>
            </div>

            {/* Red school binder vertical margin line */}
            <div className="absolute left-14 top-0 bottom-0 w-0.5 bg-red-200/80 pointer-events-none"></div>

            {/* Header bar / controls inside the concentration pad */}
            <div className="bg-[#f5ebd6] px-6 py-4 border-b border-stone-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pl-20 pr-6 shrink-0">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-teal-600 animate-ping" />
                <p className="text-xs font-mono text-stone-600 uppercase tracking-widest font-bold">
                  📝 Deep Concentration Mode Active
                </p>
              </div>

              {/* Subject Tag Selector */}
              <div className="flex items-center gap-1.5 bg-[#eae0cb] p-1 rounded-xl border border-stone-300/40">
                {(['General', 'Math', 'Science', 'History'] as const).map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubjectTheme(sub)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all tracking-wide ${
                      selectedSubjectTheme === sub
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-stone-600 hover:bg-[#decfae]'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Lined paper sheet container - scrollable scrollbody */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 pl-20 overflow-y-auto space-y-4">
              
              {/* Note Title Input with hand-ruled design */}
              <div className="relative">
                <input
                  type="text"
                  required
                  id="focused-note-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter Title..."
                  className="w-full text-2xl sm:text-3xl font-extrabold text-stone-800 bg-transparent border-none focus:ring-0 outline-none placeholder-stone-400/70 border-b border-stone-300 pb-2 mb-2 font-display focus:border-b-2 focus:border-teal-600 transition-all"
                />
              </div>

              {/* Lined Paper Textarea Box */}
              <div className="flex-1 flex flex-col relative min-h-[300px]">
                <textarea
                  id="focused-note-content"
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start penning your smart study findings, math formulas, or essay plans here to keep your thoughts organized..."
                  className="w-full flex-1 text-sm sm:text-base font-medium text-stone-700 bg-transparent resize-none focus:ring-0 outline-none pb-12 lined-paper leading-[28px] focus:outline-none"
                  style={{
                    fontFamily: '"Inter", sans-serif',
                  }}
                />
              </div>

              {/* Analytics & Action bar floating inside paper footer */}
              <div className="border-t border-stone-200/80 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-stone-500 shrink-0 select-none pb-2">
                <div className="flex gap-4 text-xs font-mono font-bold text-stone-500">
                  <span>WORDS: {getWordCount(content)}</span>
                  <span>CHARS: {content.length}</span>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (title || content) {
                        if (confirm("Disconnect and clear note? Any unsaved edits will be forgotten.")) {
                          setShowFocusedPage(false);
                          setTitle('');
                          setContent('');
                        }
                      } else {
                        setShowFocusedPage(false);
                      }
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 bg-stone-200 text-stone-700 hover:bg-stone-300 hover:text-stone-900 rounded-xl font-bold text-xs transition-all active:scale-95"
                  >
                    Discard Draft
                  </button>
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-6 py-2 bg-[#d97706] hover:bg-[#b45309] text-white font-extrabold text-xs rounded-xl shadow-md tracking-wider uppercase transition-all hover:-translate-y-0.5 active:scale-95"
                  >
                    Save to Binder (💾)
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4" id="notebook-header">
          <div className="flex items-center gap-2">
            <BookOpen className="text-teal-600 w-5.5 h-5.5" />
            <h3 className="text-lg font-black text-gray-800 tracking-tight">
              {t.notesTitle}
            </h3>
          </div>

          <button
            id="toggle-add-note-form-btn"
            onClick={() => {
              setShowFocusedPage(true);
              setActiveNote(null);
            }}
            className="p-1 px-3 bg-[#d97706] hover:bg-[#b45309] font-black text-xs text-white rounded-full flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Plus size={13} />
            <span>Write on Paper</span>
          </button>
        </div>

        {/* Selected note display modal overlay / panel popup */}
        {activeNote && (
          <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-100/70 space-y-2 mb-4 animate-scaleUp" id="selected-note-display">
            <div className="flex items-center justify-between">
              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black uppercase">Active Binder Item</span>
              <button
                id="close-active-note"
                onClick={() => setActiveNote(null)}
                className="text-xs text-amber-700 font-bold hover:underline"
              >
                Done Reading
              </button>
            </div>
            <h4 className="text-sm font-bold text-gray-800">{activeNote.title}</h4>
            <div className="text-xs text-slate-500 font-bold flex items-center gap-1">
              <Calendar size={11} />
              <span>Saved on {activeNote.createdAt}</span>
            </div>
            <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap leading-relaxed py-2 bg-white p-3 rounded-xl border border-amber-100">
              {activeNote.content}
            </p>
          </div>
        )}

        {/* List notes */}
        <div className="space-y-2 max-h-72 overflow-y-auto" id="notes-binders-list">
          {notes.length === 0 ? (
            <div className="text-center py-10 opacity-75">
              <p className="text-lg">📓</p>
              <h4 className="text-xs font-bold text-gray-500 mt-1">{t.notesTitle}</h4>
              <p className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto">
                {t.noNotes}
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                id={`note-chip-${note.id}`}
                className="p-3 bg-slate-50/50 border border-gray-100 hover:border-teal-200 rounded-2xl flex items-center justify-between transition-all"
              >
                <div
                  id={`view-note-${note.id}`}
                  onClick={() => {
                    setActiveNote(note);
                    setShowFocusedPage(false);
                  }}
                  className="flex-1 mr-4 text-left cursor-pointer group"
                >
                  <p className="text-xs font-black text-gray-800 group-hover:text-teal-600 transition-all max-w-[200px] truncate">{note.title}</p>
                  <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 mt-0.5">
                    <Calendar size={10} />
                    <span>{note.createdAt}</span>
                  </p>
                </div>
                <button
                  id={`delete-note-btn-${note.id}`}
                  onClick={() => onDeleteNote(note.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer active:scale-95"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-gray-50 flex items-center gap-1 text-[10px] text-gray-400 font-semibold uppercase">
        <FileCheck size={12} className="text-teal-600" />
        <span>Binder synchronized local storage</span>
      </div>
    </div>
  );
}
