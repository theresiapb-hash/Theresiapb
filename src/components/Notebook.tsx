/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Calendar, FileCheck, Edit3, Save, CheckCircle2, BookOpenCheck } from 'lucide-react';
import Markdown from 'react-markdown';
import { Note, LanguageCode } from '../types';
import { TRANSLATIONS } from '../locales';

interface NotebookProps {
  currentLanguage: LanguageCode;
  notes: Note[];
  onAddNote: (title: string, content: string) => void;
  onDeleteNote: (id: string) => void;
  onUpdateNote?: (id: string, title: string, content: string) => void;
}

export default function Notebook({ 
  currentLanguage, 
  notes, 
  onAddNote, 
  onDeleteNote,
  onUpdateNote 
}: NotebookProps) {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // Selected note from binder index (defaults to first note if available)
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  // New Note composition fields
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedSubjectTheme, setSelectedSubjectTheme] = useState<'General' | 'Math' | 'Science' | 'History'>('General');

  // In-line Edit Note fields
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');

  // Auto-select first note on start if there are notes and no selection
  useEffect(() => {
    if (notes.length > 0 && !activeNote && !isCreatingNew) {
      setActiveNote(notes[0]);
    }
  }, [notes]);

  // Keep editor inputs fresh if activeNote changes
  useEffect(() => {
    if (activeNote) {
      setIsEditing(false);
      setIsCreatingNew(false);
      setEditingTitle(activeNote.title);
      setEditingContent(activeNote.content);
    }
  }, [activeNote]);

  const handleComposeNew = () => {
    setIsCreatingNew(true);
    setIsEditing(false);
    setActiveNote(null);
    setNewTitle('');
    setNewContent('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    
    const formattedTitle = selectedSubjectTheme !== 'General' 
      ? `[${selectedSubjectTheme}] ${newTitle.trim()}` 
      : newTitle.trim();
      
    onAddNote(formattedTitle, newContent);
    
    // Clear composition
    setNewTitle('');
    setNewContent('');
    setIsCreatingNew(false);
  };

  const handleSaveEdit = () => {
    if (!activeNote || !editingTitle.trim() || !editingContent.trim()) return;
    
    if (onUpdateNote) {
      onUpdateNote(activeNote.id, editingTitle.trim(), editingContent.trim());
      // Update active note display instantly
      setActiveNote({
        ...activeNote,
        title: editingTitle.trim(),
        content: editingContent.trim()
      });
    } else {
      // Fallback: trigger re-add
      onDeleteNote(activeNote.id);
      onAddNote(editingTitle.trim(), editingContent.trim());
    }
    
    setIsEditing(false);
  };

  const getWordCount = (text: string) => {
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md flex flex-col justify-between" id="notebook-feature-container">
      <div>
        {/* Main Header bar */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6" id="notebook-header">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <BookOpen className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800 tracking-tight">
                {t.notesTitle}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Wide View Workspace</p>
            </div>
          </div>

          <button
            id="write-new-note-btn"
            onClick={handleComposeNew}
            className="p-2 px-4 bg-amber-600 hover:bg-amber-700 font-black text-xs text-white rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Plus size={14} />
            <span>{t.notesAdd || 'Add Note'}</span>
          </button>
        </div>

        {/* 2-Column Lined-desk view */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="notebook-split-desk">
          
          {/* Left sidebar: The binder card index list */}
          <div className="lg:col-span-4 space-y-3 flex flex-col" id="notebook-sidebar-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                📚 Study Binder ({notes.length})
              </span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1" id="notes-binders-list">
              {notes.length === 0 ? (
                <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-gray-100 opacity-75">
                  <p className="text-3xl">📓</p>
                  <h4 className="text-xs font-black text-gray-500 mt-2">{t.notesTitle}</h4>
                  <p className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto">
                    {t.noNotes || 'Your study notebook is currently empty.'}
                  </p>
                  <button
                    id="sidebar-create-note-btn"
                    onClick={handleComposeNew}
                    className="mt-4 inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:underline"
                  >
                    <Plus size={12} />
                    <span>Create note now</span>
                  </button>
                </div>
              ) : (
                notes.map((note) => {
                  const isSelected = activeNote?.id === note.id && !isCreatingNew;
                  return (
                    <div
                      key={note.id}
                      id={`note-chip-${note.id}`}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between group ${
                        isSelected 
                          ? 'bg-amber-50/50 border-amber-200 shadow-xs' 
                          : 'bg-white border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <button
                        id={`view-note-btn-${note.id}`}
                        onClick={() => {
                          setActiveNote(note);
                          setIsCreatingNew(false);
                          setIsEditing(false);
                        }}
                        className="flex-1 mr-2 text-left cursor-pointer focus:outline-none"
                      >
                        <p className={`text-xs font-black leading-snug transition-all line-clamp-1 ${
                          isSelected ? 'text-amber-800' : 'text-gray-700 group-hover:text-amber-700'
                        }`}>
                          {note.title}
                        </p>
                        <p className="text-[9px] text-gray-400 font-bold flex items-center gap-1 mt-1.5">
                          <Calendar size={10} />
                          <span>{note.createdAt}</span>
                        </p>
                      </button>

                      <button
                        id={`delete-note-btn-${note.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Are you sure you want to delete this study note from your binder?")) {
                            onDeleteNote(note.id);
                            if (activeNote?.id === note.id) {
                              setActiveNote(null);
                            }
                          }
                        }}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                        title="Delete Note"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right column: Pretty Big Column for writing / viewing */}
          <div className="lg:col-span-8" id="notebook-main-canvas-right">
            
            {/* Create New Note Panel */}
            {isCreatingNew && (
              <form onSubmit={handleCreateSubmit} className="bg-amber-50/20 border border-amber-100/60 rounded-3xl p-6 space-y-4 animate-scaleUp">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase flex items-center gap-1">
                      ✎ New Note
                    </span>
                    <span className="text-xs text-gray-400 font-bold">Write ideas directly here</span>
                  </div>

                  {/* Subject Tag Selector */}
                  <div className="flex items-center gap-1 bg-amber-50 p-1 rounded-xl border border-amber-200/50 self-start">
                    {(['General', 'Math', 'Science', 'History'] as const).map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setSelectedSubjectTheme(sub)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all tracking-wide ${
                          selectedSubjectTheme === sub
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-gray-500 hover:bg-amber-100/50'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Enter short topic title here..."
                    className="w-full text-base sm:text-lg font-extrabold text-gray-800 bg-white border border-gray-250 rounded-2xl px-4 py-3 focus:ring-1 focus:ring-amber-500 focus:outline-none font-sans"
                    id="new-note-title"
                  />

                  {/* Pretty Big Text Area Column */}
                  <div className="relative">
                    <textarea
                      required
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Start writing your thoughts, assignments, formulas, or summaries in detail here..."
                      className="w-full min-h-[380px] text-sm font-medium text-gray-700 bg-white p-5 rounded-2xl border border-gray-250 focus:ring-1 focus:ring-amber-500 focus:outline-none leading-relaxed resize-y font-sans"
                      id="new-note-content"
                    />
                    <div className="absolute bottom-3 right-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">
                      Words: {getWordCount(newContent)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNew(false)}
                    className="px-4 py-2 bg-gray-150 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-xs transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md tracking-wider uppercase transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <Save size={13} />
                    <span>Save Note to Binder</span>
                  </button>
                </div>
              </form>
            )}

            {/* Read & Edit Existing Note Panel */}
            {!isCreatingNew && activeNote && (
              <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6 space-y-4 animate-scaleUp">
                
                {/* Header info / edit modes toggle */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="space-y-0.5">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="text-base font-extrabold text-gray-800 bg-white border border-gray-250 rounded-xl px-3 py-1.5 focus:ring-1 focus:ring-amber-500 focus:outline-none font-sans"
                        id="editing-note-title"
                      />
                    ) : (
                      <h4 className="text-base font-extrabold text-slate-800 font-sans tracking-tight leading-snug">{activeNote.title}</h4>
                    )}
                    
                    <div className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                      <Calendar size={11} />
                      <span>Note Created on {activeNote.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveEdit}
                          className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                        >
                          <Save size={12} />
                          <span>Save</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setEditingTitle(activeNote.title);
                          setEditingContent(activeNote.content);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200/50"
                      >
                        <Edit3 size={12} />
                        <span>Edit Note</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Pretty Big Text Area reading/editing workspace */}
                <div className="pt-1">
                  {isEditing ? (
                    <div className="relative">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full min-h-[380px] text-sm font-medium text-gray-700 bg-white p-5 rounded-2xl border border-gray-250 focus:ring-1 focus:ring-amber-500 focus:outline-none leading-relaxed resize-y font-sans"
                        id="editing-note-content"
                      />
                      <div className="absolute bottom-3 right-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">
                        Words: {getWordCount(editingContent)}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full text-slate-700 text-sm font-semibold leading-relaxed bg-[#fdfbf7] p-6 rounded-2xl border border-amber-100/40 shadow-xs whitespace-pre-wrap min-h-[380px] prose prose-sm markdown-body">
                      {/* Markdown formatted content */}
                      <Markdown>{activeNote.content}</Markdown>
                    </div>
                  )}
                </div>

                {/* Metadata actions */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-gray-400 font-bold">
                  <span className="uppercase tracking-widest">
                    Words: {getWordCount(isEditing ? editingContent : activeNote.content)} • Chars: {(isEditing ? editingContent : activeNote.content).length}
                  </span>
                  
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this study note?")) {
                          onDeleteNote(activeNote.id);
                          setActiveNote(null);
                        }
                      }}
                      className="text-red-400 hover:text-red-600 hover:underline cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <Trash2 size={11} />
                      <span>Delete from Binder</span>
                    </button>
                  )}
                </div>

              </div>
            )}

            {/* Zero state: No note selected nor creating one */}
            {!isCreatingNew && !activeNote && (
              <div className="bg-slate-50/40 border border-dashed border-slate-200 rounded-3xl p-12 text-center min-h-[460px] flex flex-col items-center justify-center space-y-4">
                <div className="p-4 rounded-full bg-slate-50 text-slate-400 text-3xl shadow-xs">
                  📚
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-700">Select a study note to read</h4>
                  <p className="text-xs text-gray-400 max-w-sm mt-1 mx-auto leading-relaxed">
                    Click items in your Study Binder Index on the left to read in detail, or write on paper to add a brand-new note!
                  </p>
                </div>
                <button
                  id="empty-pulp-compose-btn"
                  onClick={handleComposeNew}
                  className="p-2 px-5 bg-amber-600 hover:bg-amber-700 font-black text-xs text-white rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Plus size={13} />
                  <span>Write on Paper</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-gray-400 font-semibold uppercase tracking-wider select-none">
        <div className="flex items-center gap-1.5">
          <BookOpenCheck size={13} className="text-teal-600" />
          <span>Together Interactive Study Binder</span>
        </div>
        <div>
          <span>Local storage persistence • auto-sync active</span>
        </div>
      </div>
    </div>
  );
}
