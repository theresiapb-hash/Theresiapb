/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Send, Smile, UserPlus, Heart, Sparkles, MessageSquare } from 'lucide-react';
import { StudyPartner, EducationLevel, LanguageCode } from '../types';
import { TRANSLATIONS } from '../locales';

interface StudyGuildProps {
  currentLanguage: LanguageCode;
  selectedLevel: EducationLevel;
  onLinkSession?: (subject: string, minutes: number) => void;
}

export default function StudyGuild({ currentLanguage, selectedLevel, onLinkSession }: StudyGuildProps) {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // Preset collaborative partners matched beautifully to their educational complexity
  const partnersDatabase: Record<EducationLevel, StudyPartner[]> = {
    kindergarten: [
      { id: 'p1', name: 'Leon', avatar: '🦁', level: 'kindergarten', status: 'studying', subject: 'Drawing Fruits 🍎', country: 'France' },
      { id: 'p2', name: 'Sasha', avatar: '🐼', level: 'kindergarten', status: 'online', subject: 'Phonic Riddles 🐝', country: 'Canada' },
      { id: 'p3', name: 'Hiro', avatar: '🐱', level: 'kindergarten', status: 'offline', subject: 'Counting stars ⭐', country: 'Japan' },
    ],
    elementary: [
      { id: 'p1', name: 'Leon', avatar: '🐯', level: 'elementary', status: 'studying', subject: '2-digit Addition ✏️', country: 'UK' },
      { id: 'p2', name: 'Sasha', avatar: '🦊', level: 'elementary', status: 'studying', subject: 'Animal Habitats 🌳', country: 'Australia' },
      { id: 'p3', name: 'Hiro', avatar: '🐨', level: 'elementary', status: 'online', subject: 'Spelling Bees 🍯', country: 'Japan' },
    ],
    middle_school: [
      { id: 'p1', name: 'Leon', avatar: '🧑‍💻', level: 'middle_school', status: 'studying', subject: 'Medieval Dynasties 🏛️', country: 'Germany' },
      { id: 'p2', name: 'Sasha', avatar: '👩‍🎨', level: 'middle_school', status: 'online', subject: 'Fraction Division 📈', country: 'Ecuador' },
      { id: 'p3', name: 'Hiro', avatar: '🧑‍🔬', level: 'middle_school', status: 'studying', subject: 'Plate Tectonics 🌋', country: 'Japanese-School' },
    ],
    high_school: [
      { id: 'p1', name: 'Leon', avatar: '🦸', level: 'high_school', status: 'studying', subject: 'Mitosis division phases 🧬', country: 'USA' },
      { id: 'p2', name: 'Sasha', avatar: '👩‍🏫', level: 'high_school', status: 'online', subject: 'Algebraic coordinates 📉', country: 'Indonesia' },
      { id: 'p3', name: 'Hiro', avatar: '👨‍🎓', level: 'high_school', status: 'studying', subject: 'Python logic variables 💻', country: 'Japan' },
    ],
    university: [
      { id: 'p1', name: 'Leon', avatar: '👨‍🔬', level: 'university', status: 'studying', subject: 'Quantum superposition vectors', country: 'Germany' },
      { id: 'p2', name: 'Sasha', avatar: '👩‍🔬', level: 'university', status: 'online', subject: 'Macroeconomics GDP metrics', country: 'Brazil' },
      { id: 'p3', name: 'Hiro', avatar: '👨‍💻', level: 'university', status: 'studying', subject: 'Machine Learning structures', country: 'Singapore' },
    ],
  };

  const currentPartners = partnersDatabase[selectedLevel];
  const [partnerStatus, setPartnerStatus] = useState<Record<string, string>>({});
  const [activePartnerChat, setActivePartnerChat] = useState<StudyPartner | null>(null);
  const [guestMessages, setGuestMessages] = useState<{ sender: string; msg: string }[]>([
    { sender: 'Leon', msg: 'Hey! Ready to co-study today? Let’s do 25 mins of focused study!' },
  ]);
  const [inputText, setInputText] = useState('');

  const sendCheer = (partner: StudyPartner) => {
    // Generate lovely randomized motivational cheers based on selected language
    const cheers: Record<LanguageCode, string[]> = {
      en: ['Keep up the amazing work!', 'Brilliant study focus!', 'Let’s crush this study plan!', 'Together we learn better!'],
      es: ['¡Sigue con el gran trabajo!', '¡Excelente enfoque de estudio!', '¡Vamos a dominar esto!', '¡Juntos aprendemos mejor!'],
      fr: ['Continue comme ça, c’est super !', 'Super concentration !', 'On va réussir !', 'Ensemble, on apprend mieux !'],
      de: ['Mach weiter so, spitze!', 'Großartiger Fokus!', 'Lass uns das lernen!', 'Zusammen lernt es sich besser!'],
      id: ['Semangat belajarnya!', 'Fokus yang luar biasa!', 'Mari selesaikan rencana belajar ini!', 'Bersama kita belajar lebih baik!'],
      ja: ['その調子で頑張ろう！', '素晴らしい集中力！', '一緒に計画をやり遂げよう！', '一緒に勉強すると楽しいね！'],
      zh: ['继续保持优秀状态！', '专注力太棒了！', '加油，把今天的目标做完！', '我们一起互相勉励，学得更快！'],
      'zh-TW': ['繼續保持優秀狀態！', '專注力太棒了！', '加油，把今天的目標做完！', '我們一起互相勉勵，學得更快！'],
      ar: ['استمر في هذا العمل الرائع!', 'تركيز دراسي مذهل!', 'دعنا نحقق أهدافنا اليوم!', 'معًا نتعلم بشكل أفضل!']
    };

    const phrases = cheers[currentLanguage] || cheers.en;
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    setPartnerStatus({
      ...partnerStatus,
      [partner.id]: `Sent Cheer 📣: "${randomPhrase}"`
    });

    // Simulated partner replies after 1 second
    setTimeout(() => {
      setPartnerStatus(prev => ({
        ...prev,
        [partner.id]: `Leon replied: "Thank you! Let's do it!" 🙏`
      }));
    }, 1500);
  };

  const joinPartnerSession = (partner: StudyPartner) => {
    if (onLinkSession) {
      onLinkSession(partner.subject, 25);
    }
  };

  const isEligibleLevel = ['high_school', 'university'].includes(selectedLevel);

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md flex flex-col justify-between h-full" id="study-guild-container">
      <div>
        <div className="flex items-center gap-2 mb-3" id="guild-title">
          <Users className="text-teal-600 w-5.5 h-5.5" />
          <h3 className="text-lg font-black text-gray-800 tracking-tight">
            {t.partnerSection}
          </h3>
        </div>

        {!isEligibleLevel ? (
          <div className="text-center py-8 px-4 bg-teal-50/25 border border-dashed border-teal-100 rounded-2xl space-y-3 animate-fadeIn" id="guild-restricted-view">
            <span className="text-3xl block animate-bounce">🎓✨</span>
            <h4 className="text-xs font-black text-teal-800 uppercase tracking-widest">Stage Specialized Feature</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
              Study Guild & virtual peer study rooms are reserved exclusively for <b>High School</b> and <b>University</b> students to support formal advanced research, literature citation swaps, and markdown study groups.
            </p>
            <p className="text-[10px] text-teal-600/90 font-bold">
              Check out the "Interactive Specialized Module" for fun spelling, brain math games, and interactive timelines tailored to you!
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              {t.collaborateMsg}
            </p>

            <div className="space-y-3" id="guild-partners-list">
              {currentPartners.map((pt) => {
                const isStudying = pt.status === 'studying';
                const isOnline = pt.status === 'online';
                return (
                  <div
                    key={pt.id}
                    id={`partner-card-${pt.id}`}
                    className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-gray-100/80 hover:border-teal-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between transition-all gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl bg-white p-2 rounded-2xl shadow-xs block">
                        {pt.avatar}
                      </span>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-gray-800">{pt.name}</p>
                          <span className="text-[10px] text-gray-400 font-bold">({pt.country})</span>
                          <span className={`${isStudying ? 'text-amber-500' : isOnline ? 'text-emerald-500' : 'text-gray-300'}`} />
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold max-w-44 truncate">
                          {isStudying ? `${t.peerStudying}: ${pt.subject}` : isOnline ? t.statusOnline : t.statusOffline}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        id={`partner-cheer-${pt.id}`}
                        onClick={() => sendCheer(pt)}
                        className="p-1.5 bg-white border border-gray-200 text-[10px] hover:border-teal-200 text-teal-700 hover:text-teal-900 font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Smile size={11} />
                        <span>Cheer</span>
                      </button>

                      <button
                        id={`partner-join-${pt.id}`}
                        onClick={() => joinPartnerSession(pt)}
                        className="p-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles size={11} />
                        <span>Join</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {isEligibleLevel && Object.values(partnerStatus).some(Boolean) && (
        <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl mt-4 animate-fadeIn text-[10px] text-amber-900 font-semibold text-center" id="guild-status-log">
          {Object.values(partnerStatus)[0]}
        </div>
      )}

      <div className="pt-3 border-t border-gray-50 flex items-center gap-1 text-[10px] text-gray-400 font-semibold uppercase justify-center mt-4">
        <span>✨ Interactive Peer Lobby • Sync Active</span>
      </div>
    </div>
  );
}
