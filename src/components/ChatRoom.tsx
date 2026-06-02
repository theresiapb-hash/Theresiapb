/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageCircle, RefreshCw, AlertCircle, Bookmark } from 'lucide-react';
import Markdown from 'react-markdown';
import { ChatMessage, EducationLevel, LanguageCode } from '../types';
import { TRANSLATIONS } from '../locales';

interface ChatRoomProps {
  currentLanguage: LanguageCode;
  selectedLevel: EducationLevel;
  onSaveToNotes?: (title: string, markdown: string) => void;
}

export default function ChatRoom({ currentLanguage, selectedLevel, onSaveToNotes }: ChatRoomProps) {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // Suggested prompt chips customized per education level
  const suggestionPrompts: Record<EducationLevel, string[]> = {
    kindergarten: [
      'Tell me a fun educational animal riddle! 🦁',
      'Sing a short cheerful ABC spelling song! 🎵',
      'Explain basic math counting using apples! 🍎',
    ],
    elementary: [
      'Challenge me with a 5-question math quiz! ⭐',
      'Tell me an amazing fact about outer space! 🚀',
      'Show me a fun trick to remember spelling bees!',
    ],
    middle_school: [
      'Explain how volcanoes work using real-life objects 🌋',
      'Give me a mnemonic tip to remember the planets in order!',
      'Create a 3-question historical timeline quiz for me!',
    ],
    high_school: [
      'Analyze the difference between mitosis and meiosis 🧬',
      'Help me understand the algebraic quadratic formula step-by-step',
      'Give me a python coding exercise for variables!',
    ],
    university: [
      'Critique academic research theories in Quantum Computing 🖥️',
      'Give me an exam preparation drill for Advanced Microeconomics',
      'Explain structural citation frameworks for IEEE vs APA style',
    ],
  };

  // Welcome introductory message on change level or language
  useEffect(() => {
    let intro = "";
    if (currentLanguage === 'en') {
      intro = `Hello! I am your AI Study buddy. I have adjusted our discussions for **${t[selectedLevel]}** students in **English**. What would you like to explore today?`;
    } else if (currentLanguage === 'es') {
      intro = `¡Hola! Soy tu compañero de estudio IA. He adaptado nuestras discusiones para estudiantes de **${t[selectedLevel]}** en **Español**. ¿Qué te gustaría explorar hoy?`;
    } else if (currentLanguage === 'fr') {
      intro = `Bonjour ! Je suis ton compagnon d'étude IA. J'ai adapté nos discussions pour les élèves de **${t[selectedLevel]}** en **Français**. Qu'aimerais-tu explorer aujourd'hui ?`;
    } else if (currentLanguage === 'de') {
      intro = `Hallo! Ich bin dein KI-Lernpartner. Ich habe unsere Diskussionen perfekt auf die Bildungsstufe **${t[selectedLevel]}** auf **Deutsch** abgestimmt. Was möchtest du heute lernen?`;
    } else if (currentLanguage === 'id') {
      intro = `Halo! Saya adalah rekan belajar AI Anda. Saya telah menyesuaikan diskusi kita untuk pelajar tingkat **${t[selectedLevel]}** dalam **Bahasa Indonesia**. Apa yang ingin Anda pelajari hari ini?`;
    } else if (currentLanguage === 'ja') {
      intro = `こんにちは！私はAI学習パートナーです。私たちの会話を**${t[selectedLevel]}**レベルの学習者に合わせて、**日本語**でカスタマイズしました。今日は何を勉強しますか？`;
    } else if (currentLanguage === 'zh') {
      intro = `你好！我是您的 AI 学习伴侣。我已经将我的解答深度、语言和词汇完全调配到**${t[selectedLevel]}**，我们将进行**中文**交流。今天想研讨什么？`;
    } else {
      intro = `مرحبًا! أنا رفيق المذاكرة الذكي الخاص بك. لقد قمت بضبط المناقشات لتناسب مستوى **${t[selectedLevel]}** باللغة **العربية**. ما الذي ترغب في استكشافه اليوم؟`;
    }

    setMessages([
      {
        id: 'welcome-message',
        role: 'assistant',
        content: intro,
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);
  }, [selectedLevel, currentLanguage]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    
    setErrorText(null);
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          level: selectedLevel,
          language: currentLanguage
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to consult AI tutor code status: ${response.status}`);
      }

      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date().toLocaleTimeString(),
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Could not reach Together AI Tutor server. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAIResponseToNotebook = (msg: ChatMessage) => {
    if (!onSaveToNotes) return;
    const dateStr = new Date().toLocaleDateString();
    onSaveToNotes(
      `AI Note (${dateStr})`,
      `### Study Topic from Ask Me (Tutor Chat)\n*Target Level: ${selectedLevel}*\n\n---\n\n${msg.content}`
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md flex flex-col h-[520px]" id="chat-room-container">
      {/* Active Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3" id="chat-tutor-header">
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="p-2.5 rounded-full bg-teal-50 text-teal-600 block shadow-sm font-black">
              🤖
            </span>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h3 className="text-base text-gray-800 font-black">{t.askMeTitle}</h3>
            <span className="text-[10px] text-emerald-600 font-bold tracking-wide uppercase">Tutor Online • {t[selectedLevel]} Level</span>
          </div>
        </div>

        {onSaveToNotes && (
          <span className="text-[10px] font-bold text-gray-400">Save replies to notebooks 👇</span>
        )}
      </div>

      {/* Messages Stream Grid */}
      <div className="flex-1 overflow-y-auto px-1 space-y-3.5 mb-3" id="messages-stream">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              id={`chat-bubble-${msg.id}`}
              className={`flex items-start gap-2 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`p-2 rounded-xl text-xs font-semibold ${isUser ? 'bg-indigo-50 text-indigo-700' : 'bg-teal-50 text-teal-800'}`}>
                {isUser ? '👤' : '🤖'}
              </div>
              
              <div className="space-y-1">
                <div
                  className={`rounded-2xl px-4 py-3 text-sm shadow-xs ${
                    isUser
                      ? 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-tr-none'
                      : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {/* Renders AI Markdown safely in a structured div */}
                  {/* Since className was removed from react-markdown, we wrap it in markdown-body instead */}
                  <div className="markdown-body leading-relaxed max-w-none text-sm break-words prose prose-sm">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>

                <div className={`flex items-center gap-1.5 text-[10px] text-gray-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp}</span>
                  {!isUser && onSaveToNotes && (
                    <button
                      id={`save-reply-btn-${msg.id}`}
                      onClick={() => handleSaveAIResponseToNotebook(msg)}
                      className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-0.5 hover:underline"
                    >
                      <Bookmark size={10} />
                      <span>Pin to Notes</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2 max-w-[80%]" id="chat-loading-indicator">
            <div className="p-2 rounded-xl text-xs bg-teal-50 text-teal-700 animate-spin">
              <RefreshCw size={13} />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-slate-100 border border-slate-200 text-slate-500 font-semibold text-xs flex items-center gap-2 animate-pulse">
              <span>Together AI tutor formatting dynamic insights...</span>
            </div>
          </div>
        )}

        {errorText && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 flex items-center gap-2" id="chat-error-message">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorText}</span>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* Suggested prompts widget (Visible unless waiting) */}
      {!isLoading && (
        <div className="mb-3 whitespace-nowrap overflow-x-auto py-1 flex gap-1.5 scrollbar-thin" id="prompt-suggestion-deck">
          {suggestionPrompts[selectedLevel].map((prompt, index) => (
            <button
              key={index}
              id={`suggested-prompt-${selectedLevel}-${index}`}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-gray-600 rounded-full font-bold transition-all shrink-0 cursor-pointer text-ellipsis overflow-hidden max-w-64"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Submit Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="flex items-center gap-2 pt-2 border-t border-gray-100"
        id="chat-submit-channel"
      >
        <input
          type="text"
          id="chat-input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.askMePlaceholder}
          className="flex-1 p-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white text-gray-800 font-medium"
        />
        <button
          type="submit"
          id="chat-send-msg-btn"
          disabled={!inputText.trim() || isLoading}
          className={`p-3 rounded-2xl text-white shadow-sm font-bold transition-all cursor-pointer ${
            inputText.trim() && !isLoading
              ? 'bg-teal-600 hover:bg-teal-700 active:scale-95'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
