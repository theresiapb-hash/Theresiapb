/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { EducationLevel, LanguageCode, SummaryTask } from '../types';
import { TRANSLATIONS } from '../locales';

interface SmartSummarizerProps {
  currentLanguage: LanguageCode;
  selectedLevel: EducationLevel;
  onSaveSummaryToNotes?: (title: string, content: string) => void;
}

export default function SmartSummarizer({
  currentLanguage,
  selectedLevel,
  onSaveSummaryToNotes,
}: SmartSummarizerProps) {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const [textInput, setTextInput] = useState('');
  const [fileData, setFileData] = useState<{
    name: string;
    size: string;
    mimeType: string;
    base64: string | null;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Ready-to-go student study library samples tailored to selected level
  const studyLibrarySamples: Record<EducationLevel, { title: string; excerpt: string }[]> = {
    kindergarten: [
      {
        title: 'Teddy Bears Counting Adventure',
        excerpt: 'One furry teddy bear was eating juicy sweet honey. Suddenly, two more fluffy teddy bears jumped into the green garden! Now, how many teddy bears are in the garden? Yes! One plus two makes three happy teddy bears playing together!'
      },
    ],
    elementary: [
      {
        title: 'Story of Solar System Stars',
        excerpt: 'The Sun is a giant, hot, glowing ball of gas at the center of our Solar System. Eight planets travel around the Sun in paths called orbits. Mercury is closest, while Earth is the third planet and the only one filled with breathable air, liquid water, and living mammals. The Moon orbits our Earth once every 27 days.'
      },
    ],
    middle_school: [
      {
        title: 'Volcanology & Plate Tectonics',
        excerpt: 'Volcanoes are ruptures in the crust of the Earth that allow hot lava, volcanic ash, and cooling steam gases to escape from the magma chamber below. This tectonic movement mostly happens along subterranean boundaries where the continent plates pull apart or collide, releasing tremendous kinetic stress called earthquakes.'
      },
    ],
    high_school: [
      {
        title: 'Introduction to Mitosis Biology',
        excerpt: 'Mitosis is a fundamental process where a single eukaryotic cell divides into two identical daughter cells. The stages are Prophase (chromatin condenses), Metaphase (chromosomes line up along the equator), Anaphase (sister chromatids are pulled apart by spindle fibers), and Telophase (nuclear envelopes reform, followed by physical cleavage division called Cytokinesis).'
      },
    ],
    university: [
      {
        title: 'Theory of Quantum Superposition',
        excerpt: 'Quantum superposition is a fundamental principle of quantum mechanics. It states that physical models exist in a linear combination of multiple distinct states simultaneously. When a physical observation measurement is conducted on the wave equation, the wave function collapses into a singular definite outcome, governed by the probabilistic magnitude squared of the state vectors.'
      },
    ],
  };

  const handleSelectSample = (sample: { title: string; excerpt: string }) => {
    setTextInput(sample.excerpt);
    setFileData(null);
    setSummaryResult(null);
    setErrorText(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    setErrorText(null);
    setSummaryResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const base64Content = resultStr.split(',')[1] || resultStr;
      
      setFileData({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        mimeType: file.type || 'text/plain',
        base64: base64Content
      });

      // If it is a text-based file, read text and pre-populate the text input
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const textReader = new FileReader();
        textReader.onload = () => {
          setTextInput(textReader.result as string);
        };
        textReader.readAsText(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const executeSummarize = async () => {
    if (!textInput.trim() && !fileData) return;

    setIsLoading(true);
    setProgressStep('Formulating file parameters...');
    setErrorText(null);

    try {
      // Step-by-step progress simulation for a responsive educational vibe
      setTimeout(() => setProgressStep('Synthesizing vocabulary contexts...'), 1000);
      setTimeout(() => setProgressStep('Aligning output to level criteria...'), 2000);
      setTimeout(() => setProgressStep('Together AI is weaving summary nodes...'), 3000);

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textInput,
          fileData: fileData ? {
            name: fileData.name,
            mimeType: fileData.mimeType,
            base64: fileData.base64
          } : null,
          level: selectedLevel,
          language: currentLanguage
        })
      });

      if (!response.ok) {
        let errMsg = `Summarize failed with status: ${response.status}`;
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      setSummaryResult(data.summary);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Synthesizer offline. Please retry summary submission!");
    } finally {
      setIsLoading(false);
      setProgressStep('');
    }
  };

  const triggerSaveSummary = () => {
    if (!onSaveSummaryToNotes || !summaryResult) return;
    const dateStr = new Date().toLocaleDateString();
    onSaveSummaryToNotes(
      `Summary: ${fileData?.name || 'Text Synthesis'}`,
      `### Synthesized Summary\n*Stage level: ${selectedLevel}*\n\n---\n\n${summaryResult}`
    );
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-5" id="smart-summarizer-card">
      <div id="summarizer-title">
        <h3 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-1.5">
          <UploadCloud className="text-teal-600 animate-pulse" />
          <span>{t.sumTitle}</span>
        </h3>
        <p className="text-xs text-gray-500 font-medium">
          {t.sumDesc}
        </p>
      </div>

      {/* Suggested Textbook samples */}
      <div className="space-y-1.5" id="library-samples-section">
        <span className="block text-[10px] font-bold text-teal-800 uppercase tracking-widest">
          Study Library Samples ({t[selectedLevel]})
        </span>
        <div className="flex flex-wrap gap-1.5">
          {studyLibrarySamples[selectedLevel].map((sample, idx) => (
            <button
              key={idx}
              id={`study-sample-${idx}`}
              onClick={() => handleSelectSample(sample)}
              className="px-3 py-1.5 rounded-full border border-teal-100 hover:border-teal-400 bg-teal-50/50 hover:bg-teal-50 text-xs text-teal-900 font-bold tracking-wide transition-all cursor-pointer active:scale-95"
            >
              📚 Read: {sample.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="summarizer-interactive-grid">
        {/* Document Ingestion Left Column */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-200 hover:border-teal-400 rounded-2xl p-4 text-center relative transition-all bg-gray-50 hover:bg-white" id="upload-zone">
            <input
              type="file"
              id="summarizer-file-input"
              accept="image/*,text/plain"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <UploadCloud className="w-8 h-8 text-teal-600 mb-0.5" />
              <p className="text-[11px] font-bold text-gray-700">{t.sumDrop}</p>
              <p className="text-[9px] text-gray-400">Accepts text notes / JPG, PNG screenshots</p>
            </div>
          </div>

          {/* Uploaded File Chip */}
          {fileData && (
            <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-between animate-fadeIn" id="uploaded-file-details">
              <div className="flex items-center gap-2">
                <FileText className="text-teal-700 w-5 h-5" />
                <div className="text-left">
                  <p className="text-xs font-bold text-teal-900 truncate max-w-44">{fileData.name}</p>
                  <p className="text-[10px] text-teal-700 font-semibold">{fileData.size} • {fileData.mimeType}</p>
                </div>
              </div>
              <button
                id="clear-uploaded-file"
                onClick={() => setFileData(null)}
                className="text-xs text-teal-700 hover:text-teal-900 hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          <div className="space-y-1.5">
            <span className="block text-[10px] font-bold text-teal-800 uppercase tracking-widest">
              Study Note Input Field
            </span>
            <textarea
              id="summarizer-text-input"
              rows={5}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={t.sumPlaceholder}
              className="w-full text-xs font-medium p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-1 focus:ring-teal-500 text-gray-800 bg-white"
            />
          </div>

          <button
            id="summarize-trigger-btn"
            disabled={(!textInput.trim() && !fileData) || isLoading}
            onClick={executeSummarize}
            className={`w-full py-3 rounded-2xl text-xs font-black text-white shadow-sm transition-all focus:outline-none cursor-pointer flex items-center justify-center gap-2 ${
              (textInput.trim() || fileData) && !isLoading
                ? 'bg-teal-600 hover:bg-teal-700 active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{fileData ? t.sumFileBtn : t.sumBtn}</span>
          </button>
        </div>

        {/* Synthesis Output Right Column */}
        <div className="flex flex-col h-full justify-between" id="summarizer-results-column">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex-1 min-h-[300px] overflow-y-auto max-h-[380px] relative" id="results-deck">
            {isLoading && (
              <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center p-6 text-center z-10" id="summarizer-loading">
                <RefreshCw className="w-10 h-10 text-teal-600 animate-spin mb-3" />
                <h4 className="text-sm font-bold text-teal-900 mb-1">Synthesizing Notes...</h4>
                <p className="text-xs text-slate-500 font-bold">{progressStep}</p>
              </div>
            )}

            {errorText && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800 flex items-center gap-2 mb-3" id="summarize-error">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{errorText}</span>
              </div>
            )}

            {summaryResult ? (
              <div className="space-y-3" id="synthesis-results-wrapper">
                <div className="flex justify-between items-center bg-teal-50 p-2.5 rounded-xl border border-teal-100">
                  <div className="flex items-center gap-1 text-[10px] text-teal-800 font-bold">
                    <CheckCircle size={12} className="text-teal-600" />
                    <span>{t.sumResult}</span>
                  </div>
                  {onSaveSummaryToNotes && (
                    <button
                      id="save-summary-to-notes-btn"
                      onClick={triggerSaveSummary}
                      className="text-[10px] font-bold text-teal-700 hover:text-teal-900 transition-all hover:underline"
                    >
                      Pin to Notebook 📓
                    </button>
                  )}
                </div>

                <div className="markdown-body text-xs leading-relaxed text-gray-700 bg-white p-3 rounded-xl border border-gray-100 shadow-xs max-h-64 overflow-y-auto select-text prose prose-sm">
                  <Markdown>{summaryResult}</Markdown>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-75">
                <p className="text-base">📝</p>
                <h4 className="text-xs font-black text-gray-700 mt-1">{t.sumResult}</h4>
                <p className="text-[10px] text-gray-400 max-w-xs mt-1">
                  {t.sumResultSub}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
