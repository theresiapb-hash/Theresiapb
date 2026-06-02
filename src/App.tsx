/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, RefreshCw, MessageSquare, Plus, FileText, CheckCircle2, Award, Clipboard, Highlighter, Sparkles, LogOut, ArrowLeft } from 'lucide-react';
import { EducationLevel, LanguageCode, TodoItem, Note } from './types';
import { TRANSLATIONS } from './locales';
import LanguageSelector from './components/LanguageSelector';
import WelcomeScreen from './components/WelcomeScreen';
import StudyTimer from './components/StudyTimer';
import InteractiveLessons from './components/InteractiveLessons';
import ChatRoom from './components/ChatRoom';
import SmartSummarizer from './components/SmartSummarizer';
import Notebook from './components/Notebook';
import StudyGuild from './components/StudyGuild';
import TodoList from './components/TodoList';

export default function App() {
  // 1. Core State loaded recursively from localStorage for optimal recovery
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('together_lang');
      return (saved as LanguageCode) || 'en';
    } catch {
      return 'en';
    }
  });

  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | null>(() => {
    try {
      const saved = localStorage.getItem('together_level');
      return (saved as EducationLevel) || null;
    } catch {
      return null;
    }
  });

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const saved = localStorage.getItem('together_todos');
      return saved ? JSON.parse(saved) : [
        { id: '1', text: 'Read about Photosynthesis 🌿', durationMinutes: 25, completed: false },
        { id: '2', text: 'Solve 3 Algebra variables questions 📐', durationMinutes: 10, completed: false }
      ];
    } catch {
      return [];
    }
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('together_notes');
      return saved ? JSON.parse(saved) : [
        {
          id: 'n1',
          title: 'My Morning Vocabulary',
          content: 'Keep notes neat! Studying is about finding the correlations between multiple elements.',
          createdAt: new Date().toLocaleDateString()
        }
      ];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<'sandbox' | 'chat' | 'summarizer' | 'notebook'>('sandbox');
  const [activeTimerMinutes, setActiveTimerMinutes] = useState(25);
  const [activeTimerTodoId, setActiveTimerTodoId] = useState<string | undefined>(undefined);

  // Synchronize localStorage on shift values
  useEffect(() => {
    localStorage.setItem('together_lang', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    if (selectedLevel) {
      localStorage.setItem('together_level', selectedLevel);
    } else {
      localStorage.removeItem('together_level');
    }
  }, [selectedLevel]);

  useEffect(() => {
    localStorage.setItem('together_todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('together_notes', JSON.stringify(notes));
  }, [notes]);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // 2. Action triggers
  const handleAddTodo = (text: string, duration: number) => {
    setTodos([
      ...todos,
      {
        id: Math.random().toString(),
        text,
        durationMinutes: duration,
        completed: false
      }
    ]);
  };

  const handleToggleTodo = (id: string) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
    if (activeTimerTodoId === id) {
      setActiveTimerTodoId(undefined);
    }
  };

  const handleAddNote = (title: string, content: string) => {
    setNotes([
      {
        id: Math.random().toString(),
        title,
        content,
        createdAt: new Date().toLocaleDateString()
      },
      ...notes
    ]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  // Connects Todo plan to active pomodoro timer
  const handleSelectTodoForTimer = (item: TodoItem) => {
    setActiveTimerMinutes(item.durationMinutes);
    setActiveTimerTodoId(item.id);
  };

  // Link study partner's session to main timer
  const handleLinkPartnerSession = (subj: string, mins: number) => {
    // Add the linked topic to the todo plan list dynamically!
    const partnerTask: TodoItem = {
      id: Math.random().toString(),
      text: `Co-study: ${subj} 🎒`,
      durationMinutes: mins,
      completed: false
    };
    setTodos(prev => [partnerTask, ...prev]);
    setActiveTimerMinutes(mins);
    setActiveTimerTodoId(partnerTask.id);
  };

  const handleTimerComplete = (minutesSpent: number) => {
    // Auto check the actively studying todo item!
    if (activeTimerTodoId) {
      setTodos(prev => prev.map(todo => todo.id === activeTimerTodoId ? { ...todo, completed: true } : todo));
      setActiveTimerTodoId(undefined);
    }
  };

  // Welcome introductory banner mapping
  const levelWelcomeDescriptor: Record<EducationLevel, string> = {
    kindergarten: t.kindergartenDesc,
    elementary: t.elementaryDesc,
    middle_school: t.middle_schoolDesc,
    high_school: t.high_schoolDesc,
    university: t.universityDesc,
  };

  if (!selectedLevel) {
    return (
      <div className="min-h-screen bg-[#F9F7F1] flex flex-col justify-between py-12 px-4 selection:bg-teal-100 selection:text-teal-900 font-sans" id="app-viewport-welcome">
        {/* Floating Language localized bar in selection list */}
        <div className="max-w-4xl mx-auto w-full flex justify-end mb-6" id="welcome-floating-lang-bar">
          <LanguageSelector currentLanguage={currentLanguage} onChangeLanguage={setCurrentLanguage} />
        </div>
        
        <WelcomeScreen
          currentLanguage={currentLanguage}
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
          onConfirm={() => {}}
        />

        <div className="text-center text-xs text-gray-400 mt-12 font-medium" id="welcome-copyright">
          Together Study Sphere © {new Date().getFullYear()} • Global Multilingual Study Circles
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F4] select-none text-gray-800 font-sans pb-16 selection:bg-teal-100" id="app-viewport-dashboard">
      
      {/* 1. Dashboard Navigation Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs z-30 px-4 sm:px-8 py-3.5" id="main-app-nav-header">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-teal-600 text-white font-black text-xl shadow-md cursor-default flex items-center justify-center">
              🎒
            </span>
            <div className="text-left">
              <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-1.5">
                <span>{t.appName}</span>
                <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {t[selectedLevel]}
                </span>
              </h1>
              <p className="text-[10px] text-gray-400 font-bold tracking-wide">STUDY TOGETHER, LEARN TOGETHER</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSelector currentLanguage={currentLanguage} onChangeLanguage={setCurrentLanguage} />
            
            <button
              id="switch-level-header-btn"
              onClick={() => setSelectedLevel(null)}
              className="px-3.5 py-1.5 text-xs font-bold text-gray-500 hover:text-red-600 bg-gray-50 rounded-full border border-gray-100 hover:bg-red-50/50 hover:border-red-100 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <LogOut size={13} />
              <span>{t.switchLevel}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Personalized Stage Welcome Ribbon Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-5" id="welcome-ribbon-row">
        <div className="bg-gradient-to-r from-teal-50 to-teal-100/50 r py-3.5 px-5 rounded-2xl border border-teal-100/60 flex items-center gap-3 justify-between animate-fadeIn">
          <div className="flex items-center gap-2 text-left">
            <Sparkles className="text-teal-600 w-5 h-5 shrink-0 animate-spin-slow" />
            <p className="text-xs font-medium text-teal-900">
              <span className="font-bold">{t.welcomeAlert}</span> {levelWelcomeDescriptor[selectedLevel]}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Primary Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="workspace-layout-panels">
          
          {/* LEFT COLUMN: Study Plan & Concentrated Timer (Spans 4 columns) */}
          <div className="lg:col-span-4 space-y-6" id="left-sidebar-scope">
            
            <TodoList
              currentLanguage={currentLanguage}
              todos={todos}
              onAddTodo={handleAddTodo}
              onToggleTodo={handleToggleTodo}
              onDeleteTodo={handleDeleteTodo}
              onSelectForTimer={handleSelectTodoForTimer}
              activeTimerTodoId={activeTimerTodoId}
            />

            <StudyTimer
              currentLanguage={currentLanguage}
              selectedMinutes={activeTimerMinutes}
              onSessionComplete={handleTimerComplete}
            />

            <StudyGuild
              currentLanguage={currentLanguage}
              selectedLevel={selectedLevel}
              onLinkSession={handleLinkPartnerSession}
            />
          </div>

          {/* RIGHT SPACE MAIN SECTION: Tabs & Study binder (Spans 8 columns) */}
          <div className="lg:col-span-8 space-y-6" id="centre-main-scope">
            
            {/* Modular Workspace Tabs header */}
            <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap gap-1 relative z-10" id="feature-tabs-navigation">
              <button
                id="tab-sandbox-btn"
                onClick={() => setActiveTab('sandbox')}
                className={`flex-1 min-w-[120px] py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'sandbox'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Highlighter size={13} />
                <span>Specialized Module</span>
              </button>

              <button
                id="tab-notebook-btn"
                onClick={() => setActiveTab('notebook')}
                className={`flex-1 min-w-[120px] py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'notebook'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <BookOpen size={13} />
                <span>Study Notebook</span>
              </button>

              <button
                id="tab-chat-btn"
                onClick={() => setActiveTab('chat')}
                className={`flex-1 min-w-[120px] py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <MessageSquare size={13} />
                <span>Ask Me AI Tutor</span>
              </button>

              <button
                id="tab-summarizer-btn"
                onClick={() => setActiveTab('summarizer')}
                className={`flex-1 min-w-[120px] py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'summarizer'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <FileText size={13} />
                <span>Sum To Remember</span>
              </button>
            </div>

            {/* Active Tab rendering windows */}
            <div className="min-h-[450px]" id="tab-window-panels">
              {activeTab === 'sandbox' && (
                <div className="h-full animate-fadeIn" id="sandbox-tab-frame">
                  <InteractiveLessons
                    currentLanguage={currentLanguage}
                    selectedLevel={selectedLevel}
                  />
                </div>
              )}

              {activeTab === 'notebook' && (
                <div className="h-full animate-fadeIn" id="notebook-tab-frame">
                  <Notebook
                    currentLanguage={currentLanguage}
                    notes={notes}
                    onAddNote={handleAddNote}
                    onDeleteNote={handleDeleteNote}
                  />
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="h-full animate-fadeIn" id="chat-tab-frame">
                  <ChatRoom
                    currentLanguage={currentLanguage}
                    selectedLevel={selectedLevel}
                    onSaveToNotes={(title, md) => {
                      handleAddNote(title, md);
                      alert('Saved response block directly into your personal notebook! Click the "Study Notebook" tab above to review anytime.');
                    }}
                  />
                </div>
              )}

              {activeTab === 'summarizer' && (
                <div className="h-full animate-fadeIn" id="summarizer-tab-frame">
                  <SmartSummarizer
                    currentLanguage={currentLanguage}
                    selectedLevel={selectedLevel}
                    onSaveSummaryToNotes={(title, ct) => {
                      handleAddNote(title, ct);
                      alert('Saved synthesized key points directly into your study notebook! Click the "Study Notebook" tab above to review anytime.');
                    }}
                  />
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      {/* 4. Global Footer Credits */}
      <footer className="text-center py-10 mt-12 border-t border-gray-100 text-xs text-gray-400 font-semibold uppercase tracking-wider" id="app-footer-credit-line">
        <span>Together Learn System • Active AI Session • Global Multilingual study platform</span>
      </footer>
    </div>
  );
}
