/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Award, Volume2, VolumeX } from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../locales';

interface StudyTimerProps {
  currentLanguage: LanguageCode;
  selectedMinutes?: number;
  onSessionComplete?: (minutes: number) => void;
}

export default function StudyTimer({ currentLanguage, selectedMinutes = 25, onSessionComplete }: StudyTimerProps) {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  
  const [minutes, setMinutes] = useState(selectedMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  const initialTotalSecondsCount = useRef(selectedMinutes * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if selected task changes
  useEffect(() => {
    setMinutes(selectedMinutes);
    setSeconds(0);
    setIsActive(false);
    initialTotalSecondsCount.current = selectedMinutes * 60;
  }, [selectedMinutes]);

  // Audio gong synthesizer using Web Audio API (works 100% of the time, no external assets required!)
  const playCompletedGong = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      // Warm fundamental tone
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(164.81, ctx.currentTime); // E3

      gainNode.gain.setValueAtTime(0.6, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 2.5);
      osc2.stop(ctx.currentTime + 2.5);
    } catch (e) {
      console.warn("Audio Context blocked by policy:", e);
    }
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (seconds === 0) {
          if (minutes === 0) {
            // Completed!
            setIsActive(false);
            playCompletedGong();
            setCompletedSessionsCount(prev => prev + 1);
            if (onSessionComplete) {
              const minutesSpent = Math.ceil(initialTotalSecondsCount.current / 60);
              onSessionComplete(minutesSpent);
            }
            if (intervalRef.current) clearInterval(intervalRef.current);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, minutes, seconds]);

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setMinutes(selectedMinutes);
    setSeconds(0);
  };

  const setPreset = (mins: number) => {
    setIsActive(false);
    setMinutes(mins);
    setSeconds(0);
    initialTotalSecondsCount.current = mins * 60;
  };

  // Compute percentage for dynamic visual rings
  const totalSecsRemaining = minutes * 60 + seconds;
  const originalTotalSecs = initialTotalSecondsCount.current || 1;
  const progressRatio = Math.max(0, Math.min(1, totalSecsRemaining / originalTotalSecs));
  const strokeDashoffset = progressRatio * 283; // 2 * pi * r (r=45)

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md flex flex-col md:flex-row items-center gap-6" id="study-timer-container">
      {/* Circle Meter Visualiser */}
      <div className="relative flex items-center justify-center w-40 h-40" id="timer-ring-visualizer">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="45"
            className="stroke-gray-100 fill-transparent"
            strokeWidth="8"
          />
          <circle
            cx="80"
            cy="80"
            r="45"
            className="stroke-teal-600 fill-transparent transition-all duration-1000 ease-linear"
            strokeWidth="8"
            strokeDasharray="283"
            strokeDashoffset={283 - strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-gray-800 tracking-tighter" id="timer-text">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-bold text-teal-700 tracking-widest uppercase">
            {isActive ? 'FOCUSING' : 'READY'}
          </span>
        </div>
      </div>

      {/* Control Actions & Presets */}
      <div className="flex-1 w-full flex flex-col justify-between h-full" id="timer-settings-and-controls">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-gray-800 font-bold">
            <Timer className="w-5 h-5 text-teal-600 animate-pulse" />
            <h3 className="text-base text-gray-800 font-black">{t.activeTimer}</h3>
          </div>
          
          <button
            id="toggle-timer-sound-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 px-2.5 text-xs font-semibold rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center gap-1 transition-all"
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>{soundEnabled ? 'Sound On' : 'Muted'}</span>
          </button>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap gap-1.5 mb-4" id="timer-preset-chips">
          {[5, 10, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              id={`preset-${mins}-min-btn`}
              onClick={() => setPreset(mins)}
              className={`px-3 py-1 text-xs font-bold rounded-full border transition-all cursor-pointer ${
                minutes === mins && seconds === 0
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            id="timer-start-pause-btn"
            onClick={handleStartPause}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95 shadow-sm ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-100'
            }`}
          >
            {isActive ? <Pause size={15} /> : <Play size={15} />}
            <span>{isActive ? t.timerPause : t.timerStart}</span>
          </button>

          <button
            id="timer-reset-btn"
            onClick={handleReset}
            className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 bg-gray-50 border border-gray-200 rounded-xl transition-all cursor-pointer active:scale-95"
            title={t.timerReset}
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {completedSessionsCount > 0 && (
          <div className="flex items-center gap-1 mt-3 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-100 text-[11px] text-teal-800 font-bold animate-fadeIn">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {t.timerCompleted} (Daily Count: {completedSessionsCount})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
