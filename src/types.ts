/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EducationLevel = 'kindergarten' | 'elementary' | 'middle_school' | 'high_school' | 'university';

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'id' | 'ja' | 'zh' | 'zh-TW' | 'ar';

export interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
}

export interface TodoItem {
  id: string;
  text: string;
  durationMinutes: number;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface StudySession {
  id: string;
  subject: string;
  durationMinutes: number;
  completed: boolean;
  partnerId?: string;
}

export interface StudyPartner {
  id: string;
  name: string;
  avatar: string;
  level: EducationLevel;
  status: 'online' | 'studying' | 'offline';
  subject: string;
  country: string;
}

export interface SummaryTask {
  id: string;
  fileName?: string;
  fileSize?: string;
  textInput?: string;
  summary?: string;
  status: 'idle' | 'processing' | 'done' | 'error';
  timestamp: string;
}
