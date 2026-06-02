/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { LanguageCode } from '../types';
import { LANGUAGES } from '../locales';

interface LanguageSelectorProps {
  currentLanguage: LanguageCode;
  onChangeLanguage: (code: LanguageCode) => void;
}

export default function LanguageSelector({ currentLanguage, onChangeLanguage }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left" id="lang-selector-container">
      <button
        id="lang-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-teal-800 bg-teal-50/80 rounded-full border border-teal-100 hover:bg-teal-100/90 transition-all cursor-pointer shadow-sm active:scale-95"
      >
        <Globe size={15} className="text-teal-600 animate-pulse" />
        <span>{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
      </button>

      {isOpen && (
        <>
          {/* Invisible dim backdrop to close menu on outside clicks */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            id="lang-modal-backdrop"
          />
          
          <div
            id="lang-dropdown-menu"
            className="absolute right-0 mt-2 w-48 rounded-2xl bg-white p-1.5 shadow-xl border border-teal-50 ring-1 ring-black/5 z-20 focus:outline-none animate-fadeIn"
          >
            <div className="px-3 py-1.5 text-xs font-semibold text-teal-600 tracking-wider">
              Select Language
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  id={`lang-btn-${lang.code}`}
                  onClick={() => {
                    onChangeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-xl transition-all cursor-pointer ${
                    currentLanguage === lang.code
                      ? 'bg-teal-50 text-teal-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.name}</span>
                  </div>
                  {currentLanguage === lang.code && (
                    <Check size={14} className="text-teal-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
