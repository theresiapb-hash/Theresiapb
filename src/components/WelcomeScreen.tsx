/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, BookOpen, GraduationCap, School, Highlighter, ArrowRight } from 'lucide-react';
import { EducationLevel, LanguageCode } from '../types';
import { TRANSLATIONS } from '../locales';

interface WelcomeScreenProps {
  currentLanguage: LanguageCode;
  selectedLevel: EducationLevel | null;
  onSelectLevel: (level: EducationLevel) => void;
  onConfirm: () => void;
}

export default function WelcomeScreen({
  currentLanguage,
  selectedLevel,
  onSelectLevel,
  onConfirm,
}: WelcomeScreenProps) {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const levelOptions: {
    id: EducationLevel;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
    badgeEmoji: string;
    accentGlow: string;
  }[] = [
    {
      id: 'kindergarten',
      icon: <Sparkles className="w-7 h-7" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 hover:bg-pink-100/70',
      borderColor: 'border-pink-200',
      badgeEmoji: '🧸',
      accentGlow: 'focus-within:ring-pink-300',
    },
    {
      id: 'elementary',
      icon: <Highlighter className="w-7 h-7" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 hover:bg-amber-100/70',
      borderColor: 'border-amber-200',
      badgeEmoji: '✏️',
      accentGlow: 'focus-within:ring-amber-300',
    },
    {
      id: 'middle_school',
      icon: <BookOpen className="w-7 h-7" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50 hover:bg-teal-100/70',
      borderColor: 'border-teal-200',
      badgeEmoji: '🎒',
      accentGlow: 'focus-within:ring-teal-300',
    },
    {
      id: 'high_school',
      icon: <School className="w-7 h-7" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100/70',
      borderColor: 'border-indigo-200',
      badgeEmoji: '📐',
      accentGlow: 'focus-within:ring-indigo-300',
    },
    {
      id: 'university',
      icon: <GraduationCap className="w-7 h-7" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100/70',
      borderColor: 'border-emerald-200',
      badgeEmoji: '🎓',
      accentGlow: 'focus-within:ring-emerald-300',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="welcome-screen-wrapper">
      <div className="text-center mb-10" id="welcome-header">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 text-teal-800 text-sm font-semibold mb-3 border border-teal-100">
          <BookOpen className="w-4 h-4 animate-spin-slow" />
          <span>Together Studio Online</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mb-3">
          {t.appName}
        </h1>
        <p className="text-lg text-gray-600 font-medium max-w-xl mx-auto">
          {t.tagline}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100" id="welcome-level-selection-card">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          {t.selectLevel}
        </h2>
        <p className="text-sm text-gray-500 mb-8 text-center max-w-lg mx-auto">
          {t.selectLevelSub}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8" id="level-options-grid">
          {levelOptions.map((opt) => {
            const isSelected = selectedLevel === opt.id;
            return (
              <button
                key={opt.id}
                id={`level-card-${opt.id}`}
                onClick={() => onSelectLevel(opt.id)}
                className={`group flex md:flex-col items-center md:justify-center p-4 rounded-2xl border-2 text-left md:text-center transition-all cursor-pointer relative overflow-hidden active:scale-98 ${
                  isSelected
                    ? `${opt.borderColor} bg-white shadow-md ring-2 ring-teal-500 md:-translate-y-1`
                    : `${opt.borderColor} ${opt.bgColor} border-dashed`
                }`}
              >
                {/* Visual Level Highlight Splash */}
                {isSelected && (
                  <div className="absolute top-0 right-0 p-1 bg-teal-500 text-white rounded-bl-xl text-xs font-bold leading-none">
                    ✓
                  </div>
                )}

                <div className={`p-3 rounded-2xl mb-0 md:mb-3 bg-white shadow-sm mr-4 md:mr-0 ${opt.color}`}>
                  {opt.icon}
                </div>

                <div className="flex-1 md:flex-none">
                  <div className="flex items-center justify-start md:justify-center gap-1.5 font-bold text-gray-800 text-base">
                    <span>{opt.badgeEmoji}</span>
                    <span>{t[opt.id]}</span>
                  </div>
                  <span className="block md:hidden text-xs text-gray-500 mt-1">
                    {t[`${opt.id}Desc`].substring(0, 50)}...
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected level long detailed description box */}
        {selectedLevel && (
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-8 animate-fadeIn" id="level-detailed-desc-box">
            <div className="flex gap-3">
              <span className="text-2xl">
                {levelOptions.find(o => o.id === selectedLevel)?.badgeEmoji}
              </span>
              <div>
                <h4 className="font-bold text-slate-800 text-base">
                  {t[selectedLevel]} {t.levelBadge}
                </h4>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  {t[`${selectedLevel}Desc`]}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center" id="welcome-footer-actions">
          <button
            id="welcome-confirm-btn"
            disabled={!selectedLevel}
            onClick={onConfirm}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
              selectedLevel
                ? 'bg-teal-600 hover:bg-teal-500 text-white hover:shadow-teal-100'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            <span>{t.startButton}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
