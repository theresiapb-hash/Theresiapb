/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Play, Circle, Calendar, Clock } from 'lucide-react';
import { TodoItem, LanguageCode } from '../types';
import { TRANSLATIONS } from '../locales';

interface TodoListProps {
  currentLanguage: LanguageCode;
  todos: TodoItem[];
  onAddTodo: (text: string, duration: number) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onSelectForTimer: (item: TodoItem) => void;
  activeTimerTodoId?: string;
}

export default function TodoList({
  currentLanguage,
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onSelectForTimer,
  activeTimerTodoId,
}: TodoListProps) {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [newText, setNewText] = useState('');
  const [newDuration, setNewDuration] = useState(25);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || newDuration <= 0) return;
    onAddTodo(newText, newDuration);
    setNewText('');
    setNewDuration(25);
    setShowForm(false);
  };

  const totalMinutesToStudy = todos.reduce((acc, curr) => acc + (curr.completed ? 0 : curr.durationMinutes), 0);

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md h-full flex flex-col justify-between" id="todo-feature-container">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4" id="todo-list-header">
          <div>
            <h3 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-1.5">
              <CheckCircle2 className="text-teal-600" />
              <span>{t.todoTitle}</span>
            </h3>
            {totalMinutesToStudy > 0 && (
              <span className="text-[10px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 w-max mt-1">
                <Clock size={10} />
                <span>{totalMinutesToStudy} {t.secLeft} of daily studying</span>
              </span>
            )}
          </div>

          <button
            id="toggle-add-todo-form-btn"
            onClick={() => setShowForm(!showForm)}
            className="p-1 px-2.5 bg-teal-600 hover:bg-teal-700 font-bold text-xs text-white rounded-lg flex items-center gap-1 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Plus size={13} />
            <span>{t.addBtn} Plan</span>
          </button>
        </div>

        {/* Inline input form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-2.5 mb-3.5 animate-scaleUp" id="todo-form">
            <div>
              <label className="block text-[9px] font-bold text-teal-800 uppercase tracking-widest mb-1">{t.todoPlaceholder}</label>
              <input
                type="text"
                required
                id="todo-subject-input"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="e.g. Science - read mitosis"
                className="w-full text-xs font-bold p-1.5 border border-teal-200 bg-white rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-[9px] font-bold text-teal-800 uppercase tracking-widest mb-1">{t.todoDuration}</label>
                <input
                  type="number"
                  min="1"
                  required
                  id="todo-duration-input"
                  value={newDuration}
                  onChange={(e) => setNewDuration(Math.max(1, parseInt(e.target.value) || 25))}
                  className="w-full text-xs font-bold p-1.5 border border-teal-200 bg-white rounded-lg focus:ring-1 focus:ring-teal-500 outline-none"
                />
              </div>
              <button
                type="submit"
                id="submit-todo-btn"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all self-end"
              >
                Assemble
              </button>
            </div>
          </form>
        )}

        {/* Scrollable Todo Items */}
        <div className="space-y-2 max-h-72 overflow-y-auto" id="todo-items-list-wrapper">
          {todos.length === 0 ? (
            <div className="text-center py-10 opacity-75">
              <p className="text-lg">🎯</p>
              <h4 className="text-xs font-bold text-gray-500 mt-1">{t.todoTitle}</h4>
              <p className="text-[10px] text-gray-400 mt-1 max-w-xs mx-auto">
                {t.noTasks}
              </p>
            </div>
          ) : (
            todos.map((todo) => {
              const isActiveLocalTimer = activeTimerTodoId === todo.id;
              return (
                <div
                  key={todo.id}
                  id={`todo-card-${todo.id}`}
                  className={`p-3 border rounded-2xl flex items-center justify-between transition-all ${
                    todo.completed
                      ? 'bg-slate-50 border-gray-100 opacity-60 line-through'
                      : isActiveLocalTimer
                      ? 'bg-teal-50 border-teal-300 shadow-sm'
                      : 'bg-white border-gray-100 hover:border-teal-100 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <button
                      id={`toggle-todo-check-${todo.id}`}
                      onClick={() => onToggleTodo(todo.id)}
                      className="text-gray-400 hover:text-teal-600 transition-all cursor-pointer"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-teal-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="text-left min-w-0">
                      <p className="text-xs font-black text-gray-800 truncate select-all">{todo.text}</p>
                      <span className="text-[10px] text-teal-700 font-bold flex items-center gap-0.5 mt-0.5">
                        <Clock size={10} />
                        <span>{todo.durationMinutes} minutes needed</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 md:gap-2">
                    {!todo.completed && (
                      <button
                        id={`play-timer-for-todo-${todo.id}`}
                        onClick={() => onSelectForTimer(todo)}
                        className={`p-1.5 rounded-lg flex items-center gap-0.5 text-[9px] font-black uppercase transition-all shadow-xs cursor-pointer ${
                          isActiveLocalTimer
                            ? 'bg-teal-600 text-white shadow-teal-100 hover:bg-teal-700'
                            : 'bg-gray-50 hover:bg-teal-50 hover:text-teal-800 text-gray-500 border border-gray-100'
                        }`}
                      >
                        <Play size={10} />
                        <span>{isActiveLocalTimer ? 'Studying' : 'Start'}</span>
                      </button>
                    )}

                    <button
                      id={`delete-todo-btn-${todo.id}`}
                      onClick={() => onDeleteTodo(todo.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-gray-50 flex items-center gap-1 text-[10px] text-gray-400 font-semibold uppercase">
        <Calendar size={12} className="text-teal-600" />
        <span>Daily Curriculum Planner</span>
      </div>
    </div>
  );
}
