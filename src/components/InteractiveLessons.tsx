/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Medal, 
  Shuffle, 
  ArrowRight, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { EducationLevel, LanguageCode } from '../types';
import { TRANSLATIONS } from '../locales';

interface InteractiveLessonsProps {
  currentLanguage: LanguageCode;
  selectedLevel: EducationLevel;
}

export default function InteractiveLessons({ currentLanguage, selectedLevel }: InteractiveLessonsProps) {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // Synthesizer helper for sound effects (Game feedback)
  const playSoundEffect = (type: 'success' | 'click' | 'pop' | 'wrong' | 'chime') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === 'success') {
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        freqs.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + index * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + index * 0.08);
          osc.stop(ctx.currentTime + index * 0.08 + 0.33);
        });
      } else if (type === 'chime') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(146.83, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(900, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn("AudioContext blocked:", e);
    }
  };

  // ==================== GLOBAL STAR SCOREBOARD ====================
  const [stars, setStars] = useState(5);

  // ==================== KINDERGARTEN STATE SUITE ====================
  const [kgActiveTab, setKgActiveTab] = useState<'spelling' | 'puzzle' | 'detective'>('spelling');

  // --- Spelling Playroom ---
  const spellingPool = [
    { word: 'LION', jumbled: ['I', 'L', 'O', 'N'], emoji: '🦁' },
    { word: 'FROG', jumbled: ['G', 'O', 'F', 'R'], emoji: '🐸' },
    { word: 'DUCK', jumbled: ['C', 'U', 'D', 'K'], emoji: '🦆' },
    { word: 'BEAR', jumbled: ['A', 'B', 'R', 'E'], emoji: '🐻' },
    { word: 'FISH', jumbled: ['H', 'S', 'F', 'I'], emoji: '🐠' },
  ];
  const [kgIndex, setKgIndex] = useState(0);
  const [currentDraft, setCurrentDraft] = useState<string[]>([]);
  const [availableTiles, setAvailableTiles] = useState<string[]>(spellingPool[0].jumbled);
  const [kgSuccess, setKgSuccess] = useState(false);

  useEffect(() => {
    setCurrentDraft([]);
    setAvailableTiles(spellingPool[kgIndex % spellingPool.length].jumbled);
    setKgSuccess(false);
  }, [kgIndex]);

  const selectTile = (letter: string, tileIndex: number) => {
    if (kgSuccess) return;
    playSoundEffect('click');
    setCurrentDraft([...currentDraft, letter]);
    setAvailableTiles(availableTiles.filter((_, idx) => idx !== tileIndex));
  };

  const resetTiles = () => {
    playSoundEffect('click');
    setCurrentDraft([]);
    setAvailableTiles(spellingPool[kgIndex % spellingPool.length].jumbled);
  };

  useEffect(() => {
    const targetWord = spellingPool[kgIndex % spellingPool.length].word;
    if (currentDraft.join('') === targetWord) {
      setKgSuccess(true);
      playSoundEffect('success');
      setStars(prev => prev + 5);
    } else if (currentDraft.length === targetWord.length) {
      playSoundEffect('wrong');
      setTimeout(() => resetTiles(), 800);
    }
  }, [currentDraft]);

  // --- Real Picture 3x3 Puzzle ---
  // Unsplash adorable school children painting
  const puzzleImgUrl = 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?auto=format&fit=crop&q=80&w=600';
  const puzzleWinningOrder = [
    { label: '🎨 1', id: 0 },
    { label: '🎨 2', id: 1 },
    { label: '🎨 3', id: 2 },
    { label: '🎨 4', id: 3 },
    { label: '🎨 5', id: 4 },
    { label: '🎨 6', id: 5 },
    { label: '🎨 7', id: 6 },
    { label: '🎨 8', id: 7 },
    { label: '👑 9', id: 8 },
  ];
  const [puzzleTiles, setPuzzleTiles] = useState<{ label: string; id: number }[]>([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [puzzleSolved, setPuzzleSolved] = useState(false);

  const initPuzzle = () => {
    let order = [...puzzleWinningOrder];
    // Solvable puzzle shuffle - swap a few random pairs
    for (let i = 0; i < 6; i++) {
      const idx1 = Math.floor(Math.random() * 8);
      const idx2 = Math.floor(Math.random() * 8);
      if (idx1 !== idx2) {
        const temp = order[idx1];
        order[idx1] = order[idx2];
        order[idx2] = temp;
      }
    }
    setPuzzleTiles(order);
    setSelectedTileIndex(null);
    setPuzzleSolved(false);
  };

  useEffect(() => {
    if (kgActiveTab === 'puzzle') {
      initPuzzle();
    }
  }, [kgActiveTab]);

  const tapPuzzleTile = (index: number) => {
    if (puzzleSolved) return;
    playSoundEffect('click');
    if (selectedTileIndex === null) {
      setSelectedTileIndex(index);
    } else {
      const newTiles = [...puzzleTiles];
      const temp = newTiles[selectedTileIndex];
      newTiles[selectedTileIndex] = newTiles[index];
      newTiles[index] = temp;
      setPuzzleTiles(newTiles);
      setSelectedTileIndex(null);

      const isCorrectOrder = newTiles.every((t, i) => t.id === i);
      if (isCorrectOrder) {
        setPuzzleSolved(true);
        playSoundEffect('success');
        setStars(prev => prev + 10);
      }
    }
  };

  // --- Detective Quest ---
  const [detectiveScene, setDetectiveScene] = useState<'forest' | 'house' | 'classroom'>('forest');
  
  // Custom scenes representing Forest with full animals, House with family, and Classroom!
  const forestItems = [
    { id: 'f1', label: 'Bear 🐻', found: false, gridIndex: 3, name: 'Big Brown forest Bear' },
    { id: 'f2', label: 'Fox 🦊', found: false, gridIndex: 8, name: 'Sly red wild Fox' },
    { id: 'f3', label: 'Owl 🦉', found: false, gridIndex: 12, name: 'Wise night Owl on a branch' },
    { id: 'f4', label: 'Mushroom 🍄', found: false, gridIndex: 20, name: 'Spotted red forest Mushroom' },
    { id: 'f5', label: 'Rabbit 🐰', found: false, gridIndex: 18, name: 'Fluffy hopping forest Rabbit' },
    { id: 'f6', label: 'Apple 🍎', found: false, gridIndex: 10, name: 'Crunchy red apple hanging from a tree' },
  ];

  const houseItems = [
    { id: 'h1', label: 'Dad 👨', found: false, gridIndex: 2, name: 'Happy Family Father' },
    { id: 'h2', label: 'Mom 👩', found: false, gridIndex: 4, name: 'Kind Family Mother' },
    { id: 'h3', label: 'Sister 👧', found: false, gridIndex: 14, name: 'Cheerful little Daughter' },
    { id: 'h4', label: 'Brother 👦', found: false, gridIndex: 12, name: 'Smiling little Son' },
    { id: 'h5', label: 'Sofa 🛋️', found: false, gridIndex: 21, name: 'Cozy yellow living room Sofa' },
    { id: 'h6', label: 'TV 📺', found: false, gridIndex: 8, name: 'Modern television screen' },
    { id: 'h7', label: 'Pizza 🍕', found: false, gridIndex: 23, name: 'Tasty slice of dinner pizza' },
  ];

  const classroomItems = [
    { id: 'c1', label: 'Teacher 👩‍🏫', found: false, gridIndex: 2, name: 'Helpful school Teacher' },
    { id: 'c2', label: 'Backpack 🎒', found: false, gridIndex: 11, name: 'Red school Backpack' },
    { id: 'c3', label: 'Ruler 📐', found: false, gridIndex: 7, name: 'Golden measuring triangle Ruler' },
    { id: 'c4', label: 'Globe 🌐', found: false, gridIndex: 16, name: 'Rotating blue highschool Globe' },
    { id: 'c5', label: 'Pencil ✏️', found: false, gridIndex: 22, name: 'Sharp wooden writing Pencil' },
    { id: 'c6', label: 'Book 📘', found: false, gridIndex: 4, name: 'Blue math study Book' },
  ];

  const [activeDetectiveItems, setActiveDetectiveItems] = useState(forestItems);
  const [detectiveFb, setDetectiveFb] = useState<string>('');

  useEffect(() => {
    setDetectiveFb('');
    if (detectiveScene === 'forest') {
      setActiveDetectiveItems(forestItems);
    } else if (detectiveScene === 'house') {
      setActiveDetectiveItems(houseItems);
    } else {
      setActiveDetectiveItems(classroomItems);
    }
  }, [detectiveScene, kgActiveTab]);

  const tapDetectiveSquare = (index: number) => {
    const matched = activeDetectiveItems.find(item => item.gridIndex === index);
    if (matched) {
      if (matched.found) return;
      playSoundEffect('success');
      setActiveDetectiveItems(prev => prev.map(item => item.id === matched.id ? { ...item, found: true } : item));
      setDetectiveFb(`You found the ${matched.name}! Exceptional detection work! 🔍🎉`);
      setStars(prev => prev + 5);
    } else {
      playSoundEffect('click');
    }
  };

  const getDetectiveSceneEmoji = (index: number) => {
    // Return decorative background elements or characters based on the scene index
    if (detectiveScene === 'forest') {
      const match = activeDetectiveItems.find(item => item.gridIndex === index);
      if (match?.found) return match.label.split(' ')[1];
      if (index === 3) return '🐻';
      if (index === 8) return '🦊';
      if (index === 12) return '🦉';
      if (index === 20) return '🍄';
      if (index === 18) return '🐰';
      if (index === 10) return '🍎';
      // Fillers
      if (index % 4 === 0) return '🌲';
      if (index % 5 === 0) return '🌿';
      if (index % 7 === 0) return '🌸';
      return '';
    } else if (detectiveScene === 'house') {
      const match = activeDetectiveItems.find(item => item.gridIndex === index);
      if (match?.found) return match.label.split(' ')[1];
      if (index === 2) return '👨';
      if (index === 4) return '👩';
      if (index === 14) return '👧';
      if (index === 12) return '👦';
      if (index === 21) return '🛋️';
      if (index === 8) return '📺';
      if (index === 23) return '🍕';
      // Fillers
      if (index === 0) return '🚪';
      if (index === 5) return '🖼️';
      if (index === 16) return '🐱';
      if (index === 19) return '💡';
      return '';
    } else {
      const match = activeDetectiveItems.find(item => item.gridIndex === index);
      if (match?.found) return match.label.split(' ')[1];
      if (index === 2) return '👩‍🏫';
      if (index === 11) return '🎒';
      if (index === 7) return '📐';
      if (index === 16) return '🌐';
      if (index === 22) return '✏️';
      if (index === 4) return '📘';
      // Fillers
      if (index === 0) return '🗄️';
      if (index === 8) return '⬛'; // Blackboard
      if (index === 13) return '🎨';
      if (index === 19) return '🔬';
      return '';
    }
  };


  // ==================== ELEMENTARY STATE SUITE ====================
  const [elemActiveTab, setElemActiveTab] = useState<'math' | 'science' | 'history'>('math');

  // --- ELEMENTARY Math Balloon Pop ---
  const elemMathPool = [
    { q: '3 × 4 = ?', answer: 12, options: [8, 12, 16, 9, 15, 6] },
    { q: '15 − 7 = ?', answer: 8, options: [6, 11, 8, 9, 7, 5] },
    { q: '24 ÷ 6 = ?', answer: 4, options: [3, 12, 4, 6, 8, 10] },
    { q: '9 + 8 = ?', answer: 17, options: [15, 16, 14, 19, 17, 18] },
    { q: '7 × 6 = ?', answer: 42, options: [36, 42, 45, 48, 40, 54] },
    { q: '54 ÷ 9 = ?', answer: 6, options: [5, 6, 7, 8, 9, 12] },
  ];
  const [elemMathIdx, setElemMathIdx] = useState(0);
  const [balloonFeedback, setBalloonFeedback] = useState<'idle' | 'hit' | 'miss'>('idle');

  const popBalloon = (opt: number) => {
    const currentQ = elemMathPool[elemMathIdx % elemMathPool.length];
    if (opt === currentQ.answer) {
      playSoundEffect('pop');
      setStars(prev => prev + 3);
      setBalloonFeedback('hit');
      setTimeout(() => {
        setElemMathIdx(prev => prev + 1);
        setBalloonFeedback('idle');
      }, 1000);
    } else {
      playSoundEffect('wrong');
      setBalloonFeedback('miss');
      setTimeout(() => setBalloonFeedback('idle'), 800);
    }
  };

  // --- ELEMENTARY Science Habitat Classifier ---
  const scienceAnimals = [
    { name: 'Shark 🦈', habitat: 'Ocean' },
    { name: 'Camel 🐪', habitat: 'Desert' },
    { name: 'Squirrel 🐿️', habitat: 'Forest' },
    { name: 'Dolphin 🐬', habitat: 'Ocean' },
    { name: 'Fennec Fox 🦊', habitat: 'Desert' },
    { name: 'Grizzly Bear 🐻', habitat: 'Forest' },
  ];
  const [sciIdx, setSciIdx] = useState(0);
  const [sciFeedback, setSciFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const classifyAnimal = (habitat: 'Ocean' | 'Desert' | 'Forest') => {
    const currentAnimal = scienceAnimals[sciIdx % scienceAnimals.length];
    if (currentAnimal.habitat === habitat) {
      playSoundEffect('success');
      setStars(prev => prev + 5);
      setSciFeedback('correct');
      setTimeout(() => {
        setSciIdx(prev => prev + 1);
        setSciFeedback('idle');
      }, 1200);
    } else {
      playSoundEffect('wrong');
      setSciFeedback('wrong');
      setTimeout(() => setSciFeedback('idle'), 1000);
    }
  };

  // --- ELEMENTARY History Pathfinder Quiz ---
  const elemHistoryPool = [
    {
      q: 'Who constructed the massive limestone Great Pyramids in Giza?',
      options: ['Romans 🛡️', 'Ancient Egyptians 📐', 'Vikings ⛵', 'Ancient Greeks 🏛️'],
      ans: 'Ancient Egyptians 📐',
      fact: 'The Pyramids were built as monumental tombs for Pharaohs during the Old Kingdom.'
    },
    {
      q: 'Which famous wooden ship brought explorers across the Atlantic in 1492?',
      options: ['The Titanic 🚢', 'Santa Maria ⛵', 'Apollo 11 🚀', 'HMS Beagle 🔬'],
      ans: 'Santa Maria ⛵',
      fact: 'The Santa Maria was the famous flagship navigated by Christopher Columbus.'
    },
    {
      q: 'Where did the ancient Olympic Games originally originate?',
      options: ['Nile River Valley 🌾', 'Imperial Rome ⚔️', 'Olympia, Greece 🏛️', 'Chichen Itza 🗿'],
      ans: 'Olympia, Greece 🏛️',
      fact: 'The games were held every four years honoring the sky-god Zeus.'
    },
  ];
  const [elemHistIdx, setElemHistIdx] = useState(0);
  const [histSelection, setHistSelection] = useState<string | null>(null);
  const [histIsCorrect, setHistIsCorrect] = useState<boolean | null>(null);

  const answerHistoryQuestions = (opt: string) => {
    setHistSelection(opt);
    const currentQ = elemHistoryPool[elemHistIdx % elemHistoryPool.length];
    if (opt === currentQ.ans) {
      playSoundEffect('success');
      setHistIsCorrect(true);
      setStars(prev => prev + 5);
    } else {
      playSoundEffect('wrong');
      setHistIsCorrect(false);
    }
  };

  const nextHistoryQuestion = () => {
    playSoundEffect('chime');
    setHistSelection(null);
    setHistIsCorrect(null);
    setElemHistIdx(prev => prev + 1);
  };


  // ==================== MIDDLE SCHOOL STATE SUITE ====================
  const [middleActiveTab, setMiddleActiveTab] = useState<'math' | 'science' | 'history'>('math');

  // --- MIDDLE Math algebraic Quiz ---
  const msMathPool = [
    { q: 'If 3x + 7 = 22, what is the value of x?', answer: 5, options: [3, 4, 5, 6] },
    { q: 'What is the area of a triangle with base = 6cm and height = 8cm?', answer: 24, options: [14, 24, 48, 12] },
    { q: 'Which of the following is a prime number?', answer: 17, options: [9, 15, 21, 17] },
  ];
  const [msMathIdx, setMsMathIdx] = useState(0);
  const [msMathSelection, setMsMathSelection] = useState<number | null>(null);
  const [msMathFb, setMsMathFb] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const selectMsMath = (opt: number) => {
    setMsMathSelection(opt);
    const current = msMathPool[msMathIdx % msMathPool.length];
    if (opt === current.answer) {
      playSoundEffect('success');
      setStars(prev => prev + 5);
      setMsMathFb('correct');
      setTimeout(() => {
        setMsMathIdx(prev => prev + 1);
        setMsMathSelection(null);
        setMsMathFb('idle');
      }, 1500);
    } else {
      playSoundEffect('wrong');
      setMsMathFb('wrong');
      setTimeout(() => {
        setMsMathSelection(null);
        setMsMathFb('idle');
      }, 1200);
    }
  };

  // --- MIDDLE Science organelles & chemistry Quiz ---
  const msSciPool = [
    { q: 'Which organelle is referred to as the powerhouse of the cell?', answer: 'Mitochondria', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Lysosome'] },
    { q: 'What gas is released as an output during plant photosynthesis?', answer: 'Oxygen (O₂)', options: ['Carbon Dioxide (CO₂)', 'Oxygen (O₂)', 'Nitrogen (N₂)', 'Hydrogen (H₂)'] },
    { q: 'Which state of matter has a definite volume but no definite shape?', answer: 'Liquid', options: ['Solid', 'Gas', 'Liquid', 'Plasma'] },
  ];
  const [msSciIdx, setMsSciIdx] = useState(0);
  const [msSciSelection, setMsSciSelection] = useState<string | null>(null);
  const [msSciFb, setMsSciFb] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const selectMsSci = (opt: string) => {
    setMsSciSelection(opt);
    const current = msSciPool[msSciIdx % msSciPool.length];
    if (opt === current.answer) {
      playSoundEffect('success');
      setStars(prev => prev + 5);
      setMsSciFb('correct');
      setTimeout(() => {
        setMsSciIdx(prev => prev + 1);
        setMsSciSelection(null);
        setMsSciFb('idle');
      }, 1500);
    } else {
      playSoundEffect('wrong');
      setMsSciFb('wrong');
      setTimeout(() => {
        setMsSciSelection(null);
        setMsSciFb('idle');
      }, 1200);
    }
  };

  // --- MIDDLE History Landmark Timeline (Chronology Game) ---
  const msHistoryTimeline = [
    { id: '1', event: 'Great Egyptian Pyramids Construction', year: '2560 BC', rank: 1, emoji: '📐' },
    { id: '2', event: 'Gutenberg Printing Press Invented', year: '1440 AD', rank: 2, emoji: '📖' },
    { id: '3', event: 'Galileo Directs Telescope to Space', year: '1609 AD', rank: 3, emoji: '🔭' },
    { id: '4', event: 'Apollo 11 Astronauts Walk on Moon', year: '1969 AD', rank: 4, emoji: '🚀' },
  ];
  const [timelineEvents, setTimelineEvents] = useState(msHistoryTimeline);
  const [timelineFeedback, setTimelineFeedback] = useState<'idle' | 'ordered' | 'failed'>('idle');

  const shuffleTimeline = () => {
    playSoundEffect('click');
    setTimelineFeedback('idle');
    const shuffled = [...msHistoryTimeline].sort(() => Math.random() - 0.5);
    setTimelineEvents(shuffled);
  };

  const moveTimelineItem = (index: number, direction: 'up' | 'down') => {
    playSoundEffect('click');
    const newItems = [...timelineEvents];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= timelineEvents.length) return;
    
    // Swap
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setTimelineEvents(newItems);
  };

  const checkChronology = () => {
    let sorted = true;
    for (let i = 0; i < timelineEvents.length - 1; i++) {
      if (timelineEvents[i].rank > timelineEvents[i + 1].rank) {
        sorted = false;
        break;
      }
    }
    if (sorted) {
      setTimelineFeedback('ordered');
      playSoundEffect('success');
      setStars(prev => prev + 10);
    } else {
      setTimelineFeedback('failed');
      playSoundEffect('wrong');
      setTimeout(() => setTimelineFeedback('idle'), 2000);
    }
  };


  // ==================== HIGH SCHOOL STATE SUITE ====================
  const [highActiveTab, setHighActiveTab] = useState<'math' | 'science' | 'history'>('math');

  // --- HS Math algebraic solver steps quiz ---
  const algebraSets = [
    { q: 'Factorize: x² − 5x + 6 = 0', s1: '(x − 2)(x − 3) = 0', s2: 'x = 2  or  x = 3', formula: 'b² - 4ac = 1' },
    { q: 'Solve: 4x + 12 = 32', s1: '4x = 20', s2: 'x = 5', formula: '4x = 32 - 12' },
    { q: 'Simplify: (x² − 9) / (x + 3)', s1: '(x − 3)(x + 3) / (x + 3)', s2: 'x − 3  (where x ≠ −3)', formula: 'Difference of squares' },
  ];
  const [highIndex, setHighIndex] = useState(0);
  const [solvedSteps, setSolvedSteps] = useState<number[]>([]);

  const clickAlgebraStep = (stepNo: number) => {
    if (solvedSteps.includes(stepNo)) return;
    playSoundEffect('click');
    setSolvedSteps([...solvedSteps, stepNo]);
    if (solvedSteps.length === 1) {
      playSoundEffect('success');
      setStars(prev => prev + 5);
    }
  };

  const nextAlgebra = () => {
    playSoundEffect('chime');
    setSolvedSteps([]);
    setHighIndex(prev => prev + 1);
  };

  // --- HS Science Elements Synthesizer Lab ---
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [elemSynthesisResult, setElemSynthesisResult] = useState<{ name: string; formula: string; emoji: string; desc: string } | null>(null);

  const elementDeck = [
    { symbol: 'H', name: 'Hydrogen', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    { symbol: 'O', name: 'Oxygen', color: 'bg-rose-50 border-rose-200 text-rose-700' },
    { symbol: 'Na', name: 'Sodium', color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { symbol: 'Cl', name: 'Chlorine', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { symbol: 'C', name: 'Carbon', color: 'bg-stone-50 border-stone-200 text-stone-700' },
  ];

  const tapChemistryElement = (symbol: string) => {
    if (selectedElements.length >= 4) return;
    playSoundEffect('click');
    setSelectedElements([...selectedElements, symbol]);
  };

  const resetSynthesisDeck = () => {
    playSoundEffect('chime');
    setSelectedElements([]);
    setElemSynthesisResult(null);
  };

  const synthesizeElements = () => {
    const combo = [...selectedElements].sort().join('');
    if (combo === 'HHO') {
      setElemSynthesisResult({
        name: 'Pure Water',
        formula: 'H₂O',
        emoji: '🌊💧',
        desc: 'Two parts Hydrogen combined with one part Oxygen through covalent bonds.'
      });
      playSoundEffect('success');
      setStars(prev => prev + 10);
    } else if (combo === 'ClNa') {
      setElemSynthesisResult({
        name: 'Sodium Chloride (Table Salt)',
        formula: 'NaCl',
        emoji: '🧂🧂',
        desc: 'Constructed via ionic bonds between highly reactive Sodium and Chlorine!'
      });
      playSoundEffect('success');
      setStars(prev => prev + 10);
    } else if (combo === 'COO') {
      setElemSynthesisResult({
        name: 'Carbon Dioxide Gas',
        formula: 'CO₂',
        emoji: '💨🏭',
        desc: 'Covalent carbon double bonded to dual atmospheric oxygen atoms.'
      });
      playSoundEffect('success');
      setStars(prev => prev + 10);
    } else {
      playSoundEffect('wrong');
      alert("Inert Compound Mixture! Try combinations like H + H + O (H₂O) or Na + Cl (NaCl)!");
      setSelectedElements([]);
    }
  };

  // --- HS History Sovereign Treaties Quiz ---
  const chemistryHistPool = [
    {
      treaty: 'The Treaty of Versailles (1919 AD)',
      correctImpact: 'Officially concluded World War I and established the League of Nations.',
      incorrectImpacts: [
        'Ended the Hundred Years War in Medieval Europe.',
        'Granted independence to British North American colonies.',
        'Established the borders of ancient Athenian naval federations.'
      ],
      century: '20th Century'
    },
    {
      treaty: 'The Magna Carta (1215 AD)',
      correctImpact: 'First historical charter declaring that the English sovereign was subject to general law.',
      incorrectImpacts: [
        'Consolidated Napoleon Bonaparte’s dominance across Western Prussia.',
        'Integrated Scotland into the United Kingdom permanently.',
        'Marked the end of Roman Caesar Julius’ dictatorship.'
      ],
      century: '13th Century'
    },
    {
      treaty: 'Treaty of Westphalia (1648 AD)',
      correctImpact: 'Concluded the Thirty Years’ War and formulated modern nation-state sovereignty principles.',
      incorrectImpacts: [
        'Formally annexed Canada to the British Empire.',
        'Formulated the early division of South American soils between Spain and Portugal.',
        'Ended the ancient Peloponnesian naval campaigns.'
      ],
      century: '17th Century'
    },
  ];

  const [treatyIdx, setTreatyIdx] = useState(0);
  const [selectedTreatyOption, setSelectedTreatyOption] = useState<string | null>(null);
  const [isTreatyChoiceCorrect, setIsTreatyChoiceCorrect] = useState<boolean | null>(null);
  const [scrambledTreatyOptions, setScrambledTreatyOptions] = useState<string[]>([]);

  const setupTreatyQuestion = () => {
    const q = chemistryHistPool[treatyIdx % chemistryHistPool.length];
    const list = [q.correctImpact, ...q.incorrectImpacts].sort(() => Math.random() - 0.5);
    setScrambledTreatyOptions(list);
    setSelectedTreatyOption(null);
    setIsTreatyChoiceCorrect(null);
  };

  useEffect(() => {
    setupTreatyQuestion();
  }, [treatyIdx]);

  const selectTreatyAnswer = (impact: string) => {
    setSelectedTreatyOption(impact);
    const q = chemistryHistPool[treatyIdx % chemistryHistPool.length];
    if (impact === q.correctImpact) {
      playSoundEffect('success');
      setIsTreatyChoiceCorrect(true);
      setStars(prev => prev + 8);
    } else {
      playSoundEffect('wrong');
      setIsTreatyChoiceCorrect(false);
    }
  };


  // ==================== UNIVERSITY CITATION BUILDER ====================
  const [citations, setCitations] = useState<{
    id: string;
    author: string;
    title: string;
    year: string;
    publisher: string;
    style: 'APA' | 'MLA' | 'IEEE';
  }[]>([
    { id: 'c1', author: 'Goodfellow, I.', title: 'Deep Learning for Academic Research', year: '2021', publisher: 'MIT Press', style: 'APA' },
  ]);

  const [author, setAuthor] = useState('');
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [publisher, setPublisher] = useState('');
  const [styleMode, setStyleMode] = useState<'APA' | 'MLA' | 'IEEE'>('APA');

  const addCitation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !title) return;
    playSoundEffect('success');
    setCitations([
      ...citations,
      {
        id: Math.random().toString(),
        author,
        title,
        year: year || '2026',
        publisher: publisher || 'Oxford University Press',
        style: styleMode
      }
    ]);
    setAuthor('');
    setTitle('');
    setYear('');
    setPublisher('');
    setStars(prev => prev + 5);
  };

  const formatReferenceString = (item: typeof citations[0]) => {
    if (item.style === 'APA') {
      return `${item.author} (${item.year}). ${item.title}. ${item.publisher}.`;
    } else if (item.style === 'MLA') {
      return `${item.author}. "${item.title}." ${item.publisher}, ${item.year}.`;
    } else {
      return `[1] ${item.author}, "${item.title}," ${item.publisher}, ${item.year}.`;
    }
  };


  // ======================= RENDER MULTIPLE MODULARS =======================
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md h-full flex flex-col justify-between" id="interactive-lessons-card">
      <div className="flex-1 flex flex-col">
        {/* Title stage header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3.5 border-b border-gray-150 mb-4" id="lessons-card-header">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-teal-600 w-5.5 h-5.5 animate-bounce" />
            <h3 className="text-base font-black text-gray-800 tracking-tight">
              {t.interactiveLessons}
            </h3>
          </div>

          <span className="text-[10px] bg-teal-50 border border-teal-100/90 text-teal-800 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
            Stage {t[selectedLevel] || selectedLevel} Active
          </span>
        </div>

        {/* Global Sparks Indicator */}
        <div className="flex justify-between items-center mb-4 px-1" id="global-lessons-scoreboard">
          <span className="text-[10px] text-stone-400 font-bold tracking-wider uppercase">Active Academic Arena</span>
          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-black">
            <span>⭐ Sparks Coins:</span>
            <span className="font-mono bg-amber-50 border border-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full select-none">{stars}</span>
          </div>
        </div>

        {/* -------------------- KINDERGARTEN VIEW -------------------- */}
        {selectedLevel === 'kindergarten' && (
          <div className="space-y-4 animate-fadeIn flex-1 flex flex-col justify-between" id="kg-game-scope-v2">
            
            {/* Horizontal sub-tabs */}
            <div className="flex flex-wrap gap-1 bg-stone-100 p-1.5 rounded-2xl border border-stone-200/50" id="kg-game-tabs">
              <button
                onClick={() => { playSoundEffect('click'); setKgActiveTab('spelling'); }}
                className={`flex-1 py-1.5 px-2 text-[10px] font-black rounded-lg uppercase tracking-wide transition-all ${
                  kgActiveTab === 'spelling' ? 'bg-pink-500 text-white' : 'text-stone-600 hover:bg-stone-250/50'
                }`}
              >
                🧸 Spelling
              </button>
              <button
                onClick={() => { playSoundEffect('click'); setKgActiveTab('puzzle'); }}
                className={`flex-1 py-1.5 px-2 text-[10px] font-black rounded-lg uppercase tracking-wide transition-all ${
                  kgActiveTab === 'puzzle' ? 'bg-violet-600 text-white' : 'text-stone-600 hover:bg-stone-250/50'
                }`}
              >
                🧩 Real Puzzle
              </button>
              <button
                onClick={() => { playSoundEffect('click'); setKgActiveTab('detective'); }}
                className={`flex-1 py-1.5 px-2 text-[10px] font-black rounded-lg uppercase tracking-wide transition-all ${
                  kgActiveTab === 'detective' ? 'bg-rose-500 text-white' : 'text-stone-600 hover:bg-stone-250/50'
                }`}
              >
                🔍 Detective
              </button>
            </div>

            <div className="flex-1 mt-2">
              {/* SPELLING GAME */}
              {kgActiveTab === 'spelling' && (
                <div className="p-4 rounded-3xl bg-pink-50/40 border border-pink-100 flex flex-col items-center justify-center relative animate-fadeIn">
                  <span className="text-5xl mb-2">{spellingPool[kgIndex % spellingPool.length].emoji}</span>
                  <p className="text-xs text-pink-700 font-bold mb-3">Re-arrange the tiles to spell this animal!</p>

                  <div className="flex gap-2.5 justify-center h-12 items-center mb-5">
                    {spellingPool[kgIndex % spellingPool.length].word.split('').map((char, index) => {
                      const letterSelected = currentDraft[index];
                      return (
                        <div
                          key={index}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black border-2 text-base shadow-xs transition-all duration-350 ${
                            letterSelected
                              ? 'bg-pink-500 border-pink-600 text-white translate-y-0 scale-100'
                              : 'bg-white border-pink-250 border-dashed text-transparent scale-90'
                          }`}
                        >
                          {letterSelected || ''}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {availableTiles.map((letter, idx) => (
                      <button
                        key={idx}
                        id={`tile-${letter}-${idx}`}
                        onClick={() => selectTile(letter, idx)}
                        className="w-11 h-11 rounded-xl bg-white border-2 border-pink-200 hover:border-pink-400 text-slate-800 font-black text-lg flex items-center justify-center shadow hover:-translate-y-1 hover:shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        {letter}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={resetTiles}
                      className="px-3.5 py-1.5 text-xs text-pink-700 bg-pink-100/80 hover:bg-pink-200/90 rounded-lg font-black transition-all cursor-pointer"
                    >
                      Clear Game 🧹
                    </button>
                  </div>

                  {kgSuccess && (
                    <div className="absolute inset-0 bg-white/95 rounded-3xl flex flex-col items-center justify-center p-4 animate-scaleUp">
                      <Medal className="w-12 h-12 text-amber-400 animate-bounce" />
                      <h4 className="text-xl font-black text-pink-600 mt-2 font-display">Magnificent!</h4>
                      <p className="text-xs text-slate-600 font-medium mb-4">You successfully spelled "{spellingPool[kgIndex % spellingPool.length].word}"!</p>
                      <button
                        onClick={() => setKgIndex(prev => prev + 1)}
                        className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-black text-xs shadow-md transition-all cursor-pointer animate-pulse"
                      >
                        Next Word Emojis 🎉
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* PUZZLE GAME (REAL PICTURE!) */}
              {kgActiveTab === 'puzzle' && (
                <div className="p-4 rounded-3xl bg-violet-50/40 border border-violet-100 flex flex-col justify-between h-full animate-fadeIn" id="kg-puzzle-scope">
                  <div className="text-center space-y-1 mb-3">
                    <p className="text-xs font-black text-violet-800">Painting Class 3x3 Real-Picture Jigsaw! 🎨</p>
                    <p className="text-[10px] text-gray-500">Tap two tiles to trade places. Can you assemble the full children painting picture?</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    {/* Genuine Picture Grid */}
                    <div className="grid grid-cols-3 gap-1 bg-stone-250 p-2 rounded-2xl border-2 border-violet-200 shadow-md relative overflow-hidden max-w-[280px]">
                      {puzzleTiles.map((tile, idx) => {
                        const isSelected = selectedTileIndex === idx;
                        const matchSpot = tile.id === idx;
                        return (
                          <div
                            key={idx}
                            onClick={() => tapPuzzleTile(idx)}
                            style={{
                              backgroundImage: `url('${puzzleImgUrl}')`,
                              backgroundSize: '300% 300%',
                              backgroundPosition: `${(tile.id % 3) * 50}% ${Math.floor(tile.id / 3) * 50}%`,
                            }}
                            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-lg flex items-end justify-between p-1.5 cursor-pointer border transition-all select-none relative ${
                              isSelected 
                                ? 'ring-4 ring-violet-600 border-transparent scale-95 shadow-inner' 
                                : matchSpot
                                ? 'border-emerald-400 border-2'
                                : 'border-stone-300'
                            }`}
                          >
                            {/* Piece number tag for child guidance */}
                            <span className="bg-black/60 text-white text-[8px] font-mono px-1 rounded font-black select-none z-10">
                              Piece {tile.id + 1}
                            </span>
                            {matchSpot && (
                              <span className="bg-emerald-500 text-white text-[8px] px-1 rounded font-black z-10">
                                OK
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-center md:text-left space-y-2 bg-white p-3.5 rounded-2xl border border-violet-150 max-w-[200px]">
                      <p className="text-[10px] font-extrabold text-violet-700 uppercase tracking-widest block">Reference Goal Picture:</p>
                      <img 
                        src={puzzleImgUrl} 
                        alt="Goal structure" 
                        className="w-20 h-20 mx-auto rounded-lg shadow border border-violet-200"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={initPuzzle}
                        className="py-1.5 px-3 w-full bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black rounded-lg transition-all"
                      >
                        Reshuffle Puzzle 🔄
                      </button>
                    </div>
                  </div>

                  {puzzleSolved && (
                    <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl mt-4 text-center text-xs font-black text-emerald-950 animate-scaleUp">
                      🎉 Tremendous job! You assembled the school painting real-image perfectly! (+10 Sparks Added)
                    </div>
                  )}
                </div>
              )}

              {/* DETECTIVE GAME QUEST */}
              {kgActiveTab === 'detective' && (
                <div className="p-4 rounded-3xl bg-rose-50/40 border border-rose-100 flex flex-col justify-between h-full animate-fadeIn" id="kg-detective-scope">
                  <div className="text-center space-y-1 mb-3">
                    <p className="text-xs font-black text-rose-800">Detective Quest Playroom 🔍</p>
                    <p className="text-[10px] text-gray-500">Pick a scene to explore! Can you find all hidden elements hidden inside?</p>
                  </div>

                  {/* Scene Selectors */}
                  <div className="flex gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-250 mb-3 justify-center max-w-sm mx-auto" id="detective-scene-picker">
                    <button
                      onClick={() => setDetectiveScene('forest')}
                      className={`flex-1 py-1 px-2 text-[9px] font-black rounded-xl uppercase transition-all ${
                        detectiveScene === 'forest' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:bg-stone-250'
                      }`}
                    >
                      🌲 Forest
                    </button>
                    <button
                      onClick={() => setDetectiveScene('house')}
                      className={`flex-1 py-1 px-2 text-[9px] font-black rounded-xl uppercase transition-all ${
                        detectiveScene === 'house' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-250'
                      }`}
                    >
                      🏠 House/Family
                    </button>
                    <button
                      onClick={() => setDetectiveScene('classroom')}
                      className={`flex-1 py-1 px-2 text-[9px] font-black rounded-xl uppercase transition-all ${
                        detectiveScene === 'classroom' ? 'bg-teal-600 text-white' : 'text-stone-600 hover:bg-stone-250'
                      }`}
                    >
                      🏫 Classroom
                    </button>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-4 items-center my-2 justify-center">
                    {/* Scene Illustration Box (5x5 grid representing dense layout) */}
                    <div className="relative">
                      <div className="grid grid-cols-5 gap-1.5 bg-white p-3 rounded-2xl border border-rose-150 relative shadow-inner max-w-[260px]">
                        {Array.from({ length: 25 }).map((_, idx) => {
                          const matchedItem = activeDetectiveItems.find(item => item.gridIndex === idx);
                          const isFound = matchedItem?.found;
                          return (
                            <div
                              key={idx}
                              onClick={() => tapDetectiveSquare(idx)}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg cursor-pointer border transition-all select-none hover:-translate-y-0.5 ${
                                isFound 
                                  ? 'bg-[#fef3c7] border-[#d97706] scale-100 animate-scaleUp shadow' 
                                  : 'bg-rose-50/10 border-rose-100 hover:bg-rose-100/55'
                              }`}
                            >
                              {getDetectiveSceneEmoji(idx)}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Target List */}
                    <div className="bg-white p-3.5 rounded-2xl border border-rose-100 w-full max-w-xs text-left">
                      <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest mb-2">Find these items:</p>
                      <div className="space-y-1.5">
                        {activeDetectiveItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] ${
                              item.found ? 'bg-emerald-100 border-emerald-300 text-emerald-800 font-extrabold' : 'bg-stone-50 border-stone-250 text-gray-400'
                            }`}>
                              {item.found ? '✓' : ''}
                            </span>
                            <span className={`text-[11px] font-semibold ${item.found ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          playSoundEffect('chime');
                          if (detectiveScene === 'forest') setActiveDetectiveItems(forestItems);
                          else if (detectiveScene === 'house') setActiveDetectiveItems(houseItems);
                          else setActiveDetectiveItems(classroomItems);
                          setDetectiveFb('');
                        }}
                        className="mt-3.5 w-full py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-black rounded-lg transition-all"
                      >
                        Reset Scene Board
                      </button>
                    </div>
                  </div>

                  {detectiveFb && (
                    <div className="text-center text-[10px] text-rose-750 font-bold bg-[#fff1f2] border border-rose-200/50 p-2.5 rounded-xl animate-fadeIn mt-2">
                      {detectiveFb}
                    </div>
                  )}

                  {activeDetectiveItems.every(item => item.found) && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl mt-3 animate-scaleUp text-xs font-black text-center">
                      🌟 You found every single hidden element in the scene! Splendid work, little detective!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------- ELEMENTARY VIEW (WITH MATH, SCIENCE, HISTORY TABS) -------------------- */}
        {selectedLevel === 'elementary' && (
          <div className="space-y-4 animate-fadeIn flex-1 flex flex-col justify-between" id="elementary-master-scope">
            
            {/* Horizontal subtabs for math, science, history */}
            <div className="flex gap-1 bg-stone-100 p-1.5 rounded-2xl border border-stone-200/50" id="elem-internal-tabs">
              <button
                onClick={() => { playSoundEffect('click'); setElemActiveTab('math'); }}
                className={`flex-1 py-1 px-2 text-[10px] font-black rounded-lg uppercase tracking-wide transition-all ${
                  elemActiveTab === 'math' ? 'bg-amber-500 text-white' : 'text-stone-600 hover:bg-stone-250/50'
                }`}
              >
                🔢 Math Quiz
              </button>
              <button
                onClick={() => { playSoundEffect('click'); setElemActiveTab('science'); }}
                className={`flex-1 py-1 px-2 text-[10px] font-black rounded-lg uppercase tracking-wide transition-all ${
                  elemActiveTab === 'science' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:bg-stone-250/50'
                }`}
              >
                🔬 Science Quiz
              </button>
              <button
                onClick={() => { playSoundEffect('click'); setElemActiveTab('history'); }}
                className={`flex-1 py-1 px-2 text-[10px] font-black rounded-lg uppercase tracking-wide transition-all ${
                  elemActiveTab === 'history' ? 'bg-indigo-600 text-white' : 'text-stone-600 hover:bg-stone-250/50'
                }`}
              >
                🏰 History Quiz
              </button>
            </div>

            <div className="flex-1 mt-2">
              {/* Math Balloon POP */}
              {elemActiveTab === 'math' && (
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 flex flex-col justify-between h-full relative overflow-hidden animate-fadeIn" id="elem-math-classroom">
                  <div className="text-center mb-4">
                    <p className="text-[10px] text-amber-800 font-bold mb-1">Pop the correct answer balloon options!</p>
                    <div className="text-2xl font-black text-[#5c3e16] bg-white rounded-2xl py-2.5 px-6 shadow-xs border border-amber-100 inline-block">
                      {elemMathPool[elemMathIdx % elemMathPool.length].q}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5" id="math-balloon-grid">
                    {elemMathPool[elemMathIdx % elemMathPool.length].options.map((opt, idx) => (
                      <button
                        key={idx}
                        id={`balloon-opt-${opt}`}
                        onClick={() => popBalloon(opt)}
                        className="py-3 rounded-2xl bg-white border border-amber-100 hover:border-amber-400 text-gray-800 font-black text-base hover:-translate-y-1 hover:shadow-md transition-all flex items-center justify-center relative cursor-pointer active:scale-95 animate-fadeIn"
                      >
                        <span className="inline-block mr-1 text-sm">🎈</span>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>

                  {balloonFeedback === 'hit' && (
                    <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-4 animate-scaleUp">
                      <span className="text-3xl animate-bounce">🎈🎉</span>
                      <h4 className="text-lg font-black text-[#15803d]">Pop! Core Hit! (+3 Sparks)</h4>
                      <p className="text-xs text-slate-500">Formulating next calculation balloon deck...</p>
                    </div>
                  )}

                  {balloonFeedback === 'miss' && (
                    <div className="absolute inset-0 bg-[#fef2f2]/95 rounded-2xl flex flex-col items-center justify-center p-4 animate-fadeIn">
                      <span className="text-3xl">⚠️💨</span>
                      <h4 className="text-sm font-black text-red-800">Balloon Pop Empty (Wrong Target!)</h4>
                      <p className="text-[10px] text-slate-500 font-bold">Try another math balloon carefully</p>
                    </div>
                  )}
                </div>
              )}

              {/* Science Classifier */}
              {elemActiveTab === 'science' && (
                <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex flex-col justify-between h-full relative animate-fadeIn" id="elem-science-classroom">
                  <div className="text-center mb-4">
                    <p className="text-[10px] text-emerald-800 font-extrabold mb-1">Biome Habitat Classification Lab</p>
                    <div className="text-sm font-bold text-gray-400">Classify the ecological habitat for:</div>
                    <div className="text-4xl font-extrabold my-2 bg-white rounded-2xl py-3 px-8 shadow-xs border border-emerald-100 inline-block select-none animate-pulse">
                      {scienceAnimals[sciIdx % scienceAnimals.length].name}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(['Ocean', 'Desert', 'Forest'] as const).map((habitat) => (
                      <button
                        key={habitat}
                        id={`habitat-btn-${habitat}`}
                        onClick={() => classifyAnimal(habitat)}
                        className="py-3 rounded-xl bg-white border border-emerald-100 hover:border-emerald-500 text-stone-700 font-black text-xs hover:-translate-y-0.5 hover:shadow-xs transition-all cursor-pointer text-center"
                      >
                        {habitat === 'Ocean' ? '🌊 Ocean' : habitat === 'Desert' ? '🏜️ Desert' : '🌲 Forest'}
                      </button>
                    ))}
                  </div>

                  {sciFeedback === 'correct' && (
                    <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-4 animate-scaleUp">
                      <span className="text-3xl animate-bounce">🦖🌳</span>
                      <h4 className="text-base font-black text-emerald-800 font-display">Correct Classification (+5 Sparks!)</h4>
                      <p className="text-[10px] text-slate-500">Fetching next biological sample organism...</p>
                    </div>
                  )}

                  {sciFeedback === 'wrong' && (
                    <div className="absolute inset-0 bg-red-50/95 rounded-2xl flex flex-col items-center justify-center p-4 animate-fadeIn">
                      <span className="text-3xl">🏜️✖️</span>
                      <h4 className="text-sm font-black text-red-800">Organism Habitat Mismatch!</h4>
                      <p className="text-[10px] text-slate-500">Consider the creature's adaptive features & retry!</p>
                    </div>
                  )}
                </div>
              )}

              {/* History Pathfinder Quiz */}
              {elemActiveTab === 'history' && (
                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-150 flex flex-col justify-between h-full animate-fadeIn" id="elem-history-classroom">
                  <div className="space-y-3">
                    <p className="text-[11px] font-black text-indigo-800 uppercase tracking-wider">Historical Legend Pathfinder Quiz</p>
                    <h4 className="text-sm font-black text-stone-800 leading-snug">
                      {elemHistoryPool[elemHistIdx % elemHistoryPool.length].q}
                    </h4>

                    {/* Furious Choices options list */}
                    <div className="grid grid-cols-2 gap-2">
                      {elemHistoryPool[elemHistIdx % elemHistoryPool.length].options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => answerHistoryQuestions(opt)}
                          className={`p-2.5 rounded-xl text-left text-xs font-bold border transition-all ${
                            histSelection === opt
                              ? opt === elemHistoryPool[elemHistIdx % elemHistoryPool.length].ans
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-red-500 text-white border-red-500 shadow-sm'
                              : 'bg-white text-stone-700 hover:border-indigo-300'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {histSelection && (
                    <div className="bg-white p-3 rounded-2xl border border-indigo-100 mt-3 animate-scaleUp">
                      <p className="text-[10px] text-indigo-700 font-black uppercase">Pathfinder Classroom Explanation</p>
                      <p className="text-[11px] text-stone-600 font-semibold mb-2">
                        {elemHistoryPool[elemHistIdx % elemHistoryPool.length].fact}
                      </p>
                      <button
                        onClick={nextHistoryQuestion}
                        className="p-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-lg transition-all"
                      >
                        Next Legend Event 🗓️
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------- MIDDLE SCHOOL VIEW -------------------- */}
        {selectedLevel === 'middle_school' && (
          <div className="space-y-4 animate-fadeIn flex-1 flex flex-col justify-between" id="middle-master-scope">
            
            {/* Horizontal subtabs for math, science, history */}
            <div className="flex gap-1 bg-stone-100 p-1.5 rounded-2xl border border-stone-200/50" id="ms-internal-tabs">
              <button
                onClick={() => { playSoundEffect('click'); setMiddleActiveTab('math'); }}
                className={`flex-1 py-1 px-2 text-[10px] font-black rounded-lg uppercase tracking-wide transition-all ${
                  middleActiveTab === 'math' ? 'bg-amber-500 text-white' : 'text-stone-600 hover:bg-stone-250/50'
                }`}
              >
                🔢 Math Quiz
              </button>
              <button
                onClick={() => { playSoundEffect('click'); setMiddleActiveTab('science'); }}
                className={`flex-1 py-1 px-2 text-[10px] font-black rounded-lg uppercase tracking-wide transition-all ${
                  middleActiveTab === 'science' ? 'bg-emerald-600 text-white' : 'text-stone-600 hover:bg-stone-250/50'
                }`}
              >
                🔬 Science Quiz
              </button>
              <button
                onClick={() => { playSoundEffect('click'); setMiddleActiveTab('history'); }}
                className={`flex-1 py-1 px-2 text-[10px] font-black rounded-lg uppercase tracking-wide transition-all ${
                  middleActiveTab === 'history' ? 'bg-indigo-600 text-white' : 'text-stone-600 hover:bg-stone-250/50'
                }`}
              >
                🗓️ History Chronology
              </button>
            </div>

            <div className="flex-1 mt-2">
              {/* MIDDLE MATH */}
              {middleActiveTab === 'math' && (
                <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-100 flex flex-col justify-between h-full relative animate-fadeIn" id="ms-math-scope">
                  <div>
                    <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider mb-2">Middle School Pre-Algebra & Geometry</p>
                    <h4 className="text-sm font-black text-stone-850 bg-white border border-amber-100 p-3.5 rounded-2xl mb-4 leading-relaxed">
                      {msMathPool[msMathIdx % msMathPool.length].q}
                    </h4>

                    <div className="grid grid-cols-2 gap-2">
                      {msMathPool[msMathIdx % msMathPool.length].options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => selectMsMath(opt)}
                          className={`p-3 rounded-xl border text-xs font-black text-left transition-all ${
                            msMathSelection === opt
                              ? opt === msMathPool[msMathIdx % msMathPool.length].answer
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-red-500 border-red-500 text-white'
                              : 'bg-white hover:border-amber-400 text-stone-700'
                          }`}
                        >
                          📐 Option: {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {msMathFb === 'correct' && (
                    <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-4 animate-scaleUp">
                      <span className="text-3xl animate-bounce">🎓✨</span>
                      <h4 className="text-base font-black text-emerald-800 font-display">Correct! Excellent deduction (+5 Sparks)</h4>
                      <p className="text-[10px] text-slate-500 mt-1">Generating next math sequence equations...</p>
                    </div>
                  )}

                  {msMathFb === 'wrong' && (
                    <div className="absolute inset-0 bg-red-50/95 rounded-2xl flex flex-col items-center justify-center p-4 animate-fadeIn">
                      <span className="text-3xl">✖️📐</span>
                      <h4 className="text-sm font-black text-red-800">Incorrect Calculation</h4>
                      <p className="text-[10px] text-slate-500">Think step-by-step and retry!</p>
                    </div>
                  )}
                </div>
              )}

              {/* MIDDLE SCIENCE */}
              {middleActiveTab === 'science' && (
                <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 flex flex-col justify-between h-full relative animate-fadeIn" id="ms-science-scope">
                  <div>
                    <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider mb-2">Middle School Biology & Matter Science</p>
                    <h4 className="text-sm font-black text-stone-850 bg-white border border-emerald-100 p-3.5 rounded-2xl mb-4 leading-relaxed">
                      {msSciPool[msSciIdx % msSciPool.length].q}
                    </h4>

                    <div className="grid grid-cols-2 gap-2">
                      {msSciPool[msSciIdx % msSciPool.length].options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => selectMsSci(opt)}
                          className={`p-3 rounded-xl border text-xs font-black text-left transition-all ${
                            msSciSelection === opt
                              ? opt === msSciPool[msSciIdx % msSciPool.length].answer
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'bg-red-500 border-red-500 text-white'
                              : 'bg-white hover:border-emerald-400 text-stone-700'
                          }`}
                        >
                          🧪 {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {msSciFb === 'correct' && (
                    <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-4 animate-scaleUp">
                      <span className="text-2xl animate-bounce">🧬🔬</span>
                      <h4 className="text-base font-black text-emerald-800">Spot on! Perfect Academic Answer! (+5 Sparks)</h4>
                      <p className="text-[10px] text-slate-500 mt-1">Acquiring biological cell organism database...</p>
                    </div>
                  )}

                  {msSciFb === 'wrong' && (
                    <div className="absolute inset-0 bg-red-50/95 rounded-2xl flex flex-col items-center justify-center p-4 animate-fadeIn">
                      <span className="text-3xl">🏜️✖️</span>
                      <h4 className="text-sm font-black text-red-800">Inaccurate Hypothesis</h4>
                      <p className="text-[10px] text-slate-500">Review cellular biology characteristics and retry.</p>
                    </div>
                  )}
                </div>
              )}

              {/* MIDDLE CHRONOLOGICAL HISTORY TIMELINE */}
              {middleActiveTab === 'history' && (
                <div className="p-4 rounded-xl bg-indigo-50/30 border border-indigo-150 animate-fadeIn" id="middle-timeline-scope">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-black text-indigo-800 uppercase tracking-wider">History Landmark Organizer</p>
                    <button
                      onClick={shuffleTimeline}
                      className="p-1 px-2.5 rounded-lg text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-250 flex items-center gap-1 transition-all hover:bg-indigo-100"
                    >
                      <Shuffle size={11} />
                      <span>Shuffle Timeline</span>
                    </button>
                  </div>

                  <p className="text-xs text-stone-500 leading-relaxed mb-3">
                    Arrange these four important historical discoveries chronologically (oldest on top, newest on bottom) using the arrows, then click verify!
                  </p>

                  <div className="space-y-2" id="history-landmarks-container">
                    {timelineEvents.map((evt, idx) => {
                      return (
                        <div
                          key={evt.id}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-indigo-100 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl bg-stone-50 p-1.5 rounded-xl block">{evt.emoji}</span>
                            <div className="text-left">
                              <p className="text-xs font-black text-gray-800 leading-tight">{evt.event}</p>
                              <p className="text-[10px] text-indigo-700 font-extrabold mt-0.5">{evt.year}</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => moveTimelineItem(idx, 'up')}
                              className={`p-1 rounded bg-stone-50 border border-stone-200 text-[10px] hover:bg-indigo-50 hover:text-indigo-700 transition-all ${
                                idx === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'
                              }`}
                            >
                              ▲
                            </button>
                            <button
                              disabled={idx === timelineEvents.length - 1}
                              onClick={() => moveTimelineItem(idx, 'down')}
                              className={`p-1 rounded bg-stone-50 border border-stone-200 text-[10px] hover:bg-indigo-50 hover:text-indigo-700 transition-all ${
                                idx === timelineEvents.length - 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'
                              }`}
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3">
                    <button
                      onClick={checkChronology}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black tracking-wide uppercase transition-all shadow active:scale-98"
                    >
                      Verify History Chronology Timeline
                    </button>
                  </div>

                  {timelineFeedback === 'ordered' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-xl mt-3 text-xs font-bold flex items-center justify-center gap-1.5 animate-fadeIn">
                      <Medal className="w-4 h-4 text-emerald-600" />
                      <span>Perfect! All landmarks are ordered perfectly! Great History study! (+10 Sparks added)</span>
                    </div>
                  )}

                  {timelineFeedback === 'failed' && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl mt-3 text-xs font-bold flex items-center justify-center gap-1.5 animate-fadeIn">
                      <span>Timeline audit mismatch. Remember: BC happens before AD! Swap cards & retry!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------- HIGH SCHOOL VIEW -------------------- */}
        {selectedLevel === 'high_school' && (
          <div className="space-y-4 animate-fadeIn flex-1 flex flex-col justify-between" id="highstory-master-scope">
            
            {/* Horizontal subtabs bar */}
            <div className="flex gap-1 bg-stone-100 p-1.5 rounded-2xl border border-stone-200/50" id="high-internal-tabs">
              <button
                onClick={() => { playSoundEffect('click'); setHighActiveTab('math'); }}
                className={`flex-1 py-1 px-1.5 text-[10px] font-black rounded-lg uppercase tracking-wide transition-all ${
                  highActiveTab === 'math' ? 'bg-indigo-600 text-white' : 'text-stone-600 hover:bg-stone-250/50'
                }`}
              >
                📐 Algebra Solver
              </button>
              <button
                onClick={() => { playSoundEffect('click'); setHighActiveTab('science'); }}
                className={`flex-1 py-1 px-1.5 text-[10px] font-black rounded-lg uppercase tracking-wide transition-all ${
                  highActiveTab === 'science' ? 'bg-rose-600 text-white' : 'text-stone-600 hover:bg-stone-250/50'
                }`}
              >
                🧪 Synthesis Lab
              </button>
              <button
                onClick={() => { playSoundEffect('click'); setHighActiveTab('history'); }}
                className={`flex-1 py-1 px-1.5 text-[10px] font-black rounded-lg uppercase tracking-wide transition-all ${
                  highActiveTab === 'history' ? 'bg-amber-600 text-white' : 'text-stone-600 hover:bg-stone-250/50'
                }`}
              >
                📜 Treaties Quiz
              </button>
            </div>

            {/* HIGH SCHOOL ACTIVE MODULAR */}
            <div className="flex-1 mt-2">
              {/* HS Math tab */}
              {highActiveTab === 'math' && (
                <div className="p-4 rounded-xl bg-indigo-50/30 border border-indigo-150 animate-fadeIn" id="high-algebra-scope">
                  <h4 className="text-[10px] font-black text-indigo-800 tracking-wider uppercase mb-2">Algebraic Solver & Factorizer Lab</h4>
                  
                  <div className="p-3 bg-white border border-indigo-100 rounded-2xl relative">
                    <div className="bg-stone-50 p-2 rounded-xl flex justify-between items-center mb-3">
                      <span className="text-[9px] text-indigo-700 font-mono bg-indigo-100 px-2 py-0.5 rounded">Quadratic Expansion</span>
                      <span className="text-[9px] text-gray-400 font-mono">Formula: {algebraSets[highIndex % algebraSets.length].formula}</span>
                    </div>

                    <div className="text-base font-black text-gray-800 text-center py-2.5 mb-4 bg-stone-50/30 rounded-xl border border-dashed border-indigo-200">
                      {algebraSets[highIndex % algebraSets.length].q}
                    </div>

                    <p className="text-[10px] text-gray-500 mb-3 text-center font-bold">Click steps sequentially to audit variables deduction:</p>

                    <div className="space-y-2">
                      <button
                        id="algebra-step-1"
                        onClick={() => clickAlgebraStep(1)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                          solvedSteps.includes(1)
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                            : 'bg-white text-gray-700 hover:border-indigo-300'
                        }`}
                      >
                        <span>Step 1: Expand binomial factors</span>
                        <span className="font-mono text-[9px]">{solvedSteps.includes(1) ? algebraSets[highIndex % algebraSets.length].s1 : 'Reveal 🔎'}</span>
                      </button>

                      <button
                        id="algebra-step-2"
                        disabled={!solvedSteps.includes(1)}
                        onClick={() => clickAlgebraStep(2)}
                        className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                          !solvedSteps.includes(1)
                            ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                            : solvedSteps.includes(2)
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                            : 'bg-white text-gray-700 hover:border-indigo-300 cursor-pointer'
                        }`}
                      >
                        <span>Step 2: Solve root variables</span>
                        <span className="font-mono text-[9px]">{solvedSteps.includes(2) ? algebraSets[highIndex % algebraSets.length].s2 : 'Reveal 🔎'}</span>
                      </button>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={nextAlgebra}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Next Equation</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* HS Element Synthesizer */}
              {highActiveTab === 'science' && (
                <div className="p-4 rounded-xl bg-rose-50/30 border border-rose-100 animate-fadeIn" id="high-chemistry-scope">
                  <h4 className="text-[10px] font-black text-rose-800 tracking-wider uppercase mb-1">Molecular Chemistry Synthesis Lab 🧪</h4>
                  <p className="text-[10px] text-gray-500 mb-3">Trigger covalent and ionic bonding. Tap chemical elements below to load your deck!</p>

                  <div className="bg-white p-3.5 rounded-2xl border border-rose-100 space-y-3">
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {elementDeck.map((elem) => (
                        <button
                          key={elem.symbol}
                          onClick={() => tapChemistryElement(elem.symbol)}
                          className={`px-3 py-1.5 rounded-xl border text-[11px] font-black transition-all hover:-translate-y-0.5 ${elem.color}`}
                        >
                          {elem.symbol} <span className="text-[8px] font-medium block opacity-75">{elem.name}</span>
                        </button>
                      ))}
                    </div>

                    <div className="bg-stone-50 p-2.5 rounded-xl text-center border border-dashed border-stone-200">
                      <p className="text-[9px] text-[#b45309] font-black uppercase tracking-wider mb-2">Reactor Chamber Loader ({selectedElements.length}/4)</p>
                      
                      {selectedElements.length === 0 ? (
                        <p className="text-[11px] text-stone-400 italic">No molecules loaded yet. Tap atoms above!</p>
                      ) : (
                        <div className="flex justify-center gap-2">
                          {selectedElements.map((symbol, idx) => (
                            <span key={idx} className="bg-rose-500 text-white font-extrabold w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow animate-scaleUp">
                              {symbol}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={resetSynthesisDeck}
                        className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all"
                      >
                        Reset Chamber
                      </button>
                      <button
                        disabled={selectedElements.length < 2}
                        onClick={synthesizeElements}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                          selectedElements.length < 2
                            ? 'bg-rose-100 text-rose-450 cursor-not-allowed opacity-50'
                            : 'bg-rose-600 hover:bg-rose-700 text-white shadow'
                        }`}
                      >
                        Synthesize Molecule ✨
                      </button>
                    </div>

                    {elemSynthesisResult && (
                      <div className="p-3 bg-emerald-50 border border-emerald-250 rounded-xl animate-scaleUp">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{elemSynthesisResult.emoji}</span>
                          <div className="text-left">
                            <h4 className="text-xs font-black text-emerald-900">{elemSynthesisResult.name} ({elemSynthesisResult.formula})</h4>
                            <p className="text-[10px] text-[#1565c0] leading-normal font-semibold mt-0.5">{elemSynthesisResult.desc}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* HS Chronological Treaties match */}
              {highActiveTab === 'history' && (
                <div className="p-4 rounded-xl bg-amber-50/30 border border-amber-100 animate-fadeIn" id="high-history-scope">
                  <h4 className="text-[10px] font-black text-amber-800 tracking-wider uppercase mb-1">Global Sovereign Treaties Lab</h4>
                  <p className="text-[10px] text-gray-500 mb-2.5">Analyze sovereign pacts. Connect the treaty to its historical impact!</p>

                  <div className="bg-white p-3 rounded-2xl border border-amber-100 space-y-3">
                    <div className="bg-[#fffbeb] p-2.5 rounded-xl border border-amber-200 flex justify-between items-center">
                      <span className="text-xs font-extrabold text-amber-900">{chemistryHistPool[treatyIdx % chemistryHistPool.length].treaty}</span>
                      <span className="text-[9px] bg-amber-100 px-2 py-0.5 rounded-full text-amber-800 font-mono font-bold">
                        {chemistryHistPool[treatyIdx % chemistryHistPool.length].century}
                      </span>
                    </div>

                    <p className="text-[10px] text-[#b45309] font-black uppercase">Furious choices impact list (Select one):</p>
                    
                    <div className="space-y-1.5" id="treaty-options-choices">
                      {scrambledTreatyOptions.map((impact) => {
                        const isSelect = selectedTreatyOption === impact;
                        const isCorrect = impact === chemistryHistPool[treatyIdx % chemistryHistPool.length].correctImpact;
                        return (
                          <button
                            key={impact}
                            onClick={() => selectTreatyAnswer(impact)}
                            className={`w-full p-2.5 rounded-xl text-left text-[11px] leading-relaxed font-bold border transition-all flex items-start gap-2 ${
                              isSelect
                                ? isCorrect
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'bg-red-500 border-red-500 text-white'
                                : 'bg-stone-50 hover:bg-stone-100 border-stone-150 text-slate-800'
                            }`}
                          >
                            <span>💡</span>
                            <span className="flex-1">{impact}</span>
                          </button>
                        );
                      })}
                    </div>

                    {selectedTreatyOption && (
                      <div className="flex justify-between items-center pt-2">
                        <span className={`text-[10px] font-black uppercase ${isTreatyChoiceCorrect ? 'text-emerald-800' : 'text-red-800'}`}>
                          {isTreatyChoiceCorrect ? '✓ Match verified' : '✖ Mismatch detected'}
                        </span>
                        <button
                          onClick={() => setTreatyIdx(prev => prev + 1)}
                          className="py-1 px-3 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black rounded-lg transition-all"
                        >
                          Next Treaty Question 📂
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------- UNIVERSITY VIEW -------------------- */}
        {selectedLevel === 'university' && (
          <div className="space-y-4 animate-fadeIn" id="university-cite-scope">
            <h4 className="text-xs font-black text-emerald-800 tracking-wider uppercase">Citecraft Academic Citation Lab</h4>
            
            <form onSubmit={addCitation} className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-0.5">Author (e.g. Einstein, A.)</label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Lastname, Firstname"
                    className="w-full p-1.5 rounded-lg border border-emerald-200 bg-white text-xs focus:ring-1 focus:ring-emerald-400 outline-none font-semibold text-stone-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-0.5">Publication Year</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2026"
                    className="w-full p-1.5 rounded-lg border border-emerald-200 bg-white text-xs focus:ring-1 focus:ring-emerald-400 outline-none font-semibold text-stone-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-0.5">Article/Book Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Relational study models..."
                  className="w-full p-1.5 rounded-lg border border-emerald-200 bg-white text-xs focus:ring-1 focus:ring-emerald-400 outline-none font-semibold text-stone-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 items-end">
                <div>
                  <label className="block text-[10px] font-bold text-emerald-800 uppercase mb-0.5">Publisher / Journal</label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="Academic Press"
                    className="w-full p-1.5 rounded-lg border border-emerald-200 bg-white text-xs focus:ring-1 focus:ring-emerald-400 outline-none font-semibold text-stone-700"
                  />
                </div>
                <div className="flex gap-1 bg-white p-1 rounded-lg border border-emerald-200">
                  {['APA', 'MLA', 'IEEE'].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setStyleMode(style as any)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${
                        styleMode === style
                          ? 'bg-emerald-600 text-white'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#d97706] hover:bg-[#b45309] text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Build Formal Citation Entry
              </button>
            </form>

            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              <span className="block text-[9px] font-black text-gray-400 tracking-wide uppercase text-left">Your Bibliography Binder ({citations.length})</span>
              {citations.map((cit) => (
                <div
                  key={cit.id}
                  className="p-2 ml-1 rounded-xl border border-gray-100 bg-stone-50/50 flex flex-col items-start gap-1"
                >
                  <div className="flex-1 text-left">
                    <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[8px] font-black tracking-wide uppercase mb-1">{cit.style}</span>
                    <p className="text-[10px] font-semibold text-slate-705 leading-relaxed uppercase pr-2">
                      {formatReferenceString(cit)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-gray-55 flex items-center justify-between text-[10px] text-slate-400 mt-4 shrink-0 font-bold">
        <div className="flex items-center gap-1">
          <Clock size={11} />
          <span>Together Live Classroom</span>
        </div>
        <span>Interactive Specialized Module</span>
      </div>
    </div>
  );
}
