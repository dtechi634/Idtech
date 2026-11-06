import React, { useState } from 'react';
import { DialogueLine } from '../types/game';
import { ArrowRight, SkipForward } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface CutsceneDialogProps {
  title: string;
  lines: DialogueLine[];
  onFinish: () => void;
}

export const CutsceneDialog: React.FC<CutsceneDialogProps> = ({ title, lines, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentLine = lines[currentIndex] || lines[0];

  const handleNext = () => {
    sounds.playBubbleCollect(false);
    if (currentIndex < lines.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    sounds.playBubbleCollect(false);
    onFinish();
  };

  // Determine speaker color theme and badge
  const getSpeakerStyle = (speaker: DialogueLine['speaker']) => {
    switch (speaker) {
      case 'Kael':
        return {
          color: 'text-cyan-300',
          border: 'border-cyan-400',
          bg: 'bg-cyan-950/40',
          badge: 'bg-cyan-900 text-cyan-200',
        };
      case 'King Thalor':
        return {
          color: 'text-amber-300',
          border: 'border-amber-400',
          bg: 'bg-amber-950/40',
          badge: 'bg-amber-900 text-amber-200',
        };
      case 'Ronan':
        return {
          color: 'text-rose-400',
          border: 'border-rose-500',
          bg: 'bg-rose-950/40',
          badge: 'bg-rose-950 text-rose-300',
        };
      case 'Lira':
        return {
          color: 'text-purple-300',
          border: 'border-purple-400',
          bg: 'bg-purple-950/40',
          badge: 'bg-purple-950 text-purple-200',
        };
      case 'Elder Varun':
        return {
          color: 'text-emerald-300',
          border: 'border-emerald-500',
          bg: 'bg-emerald-950/40',
          badge: 'bg-emerald-950 text-emerald-200',
        };
      case 'Morgana':
        return {
          color: 'text-fuchsia-400',
          border: 'border-fuchsia-500',
          bg: 'bg-fuchsia-950/50',
          badge: 'bg-fuchsia-950 text-fuchsia-200',
        };
      default:
        return {
          color: 'text-slate-300',
          border: 'border-slate-500',
          bg: 'bg-slate-900/60',
          badge: 'bg-slate-800 text-slate-300',
        };
    }
  };

  const style = getSpeakerStyle(currentLine.speaker);

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/80 flex flex-col justify-end p-4 md:p-8 select-none">
      <div className="max-w-3xl w-full mx-auto bg-[#031526]/95 border border-cyan-500/40 rounded-2xl p-5 md:p-6 shadow-[0_0_35px_rgba(6,182,212,0.3)]">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 mb-3">
          <div className="text-xs font-mono font-semibold text-cyan-400 tracking-wider uppercase">{title}</div>
          <button
            onClick={handleSkip}
            className="flex items-center space-x-1 text-xs font-mono text-slate-400 hover:text-cyan-300 transition cursor-pointer"
          >
            <span>Skip Scene</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dialogue Card */}
        <div className="flex items-start space-x-4 mb-4">
          {/* Avatar representation */}
          <div
            className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center font-serif font-black text-xl border ${style.border} ${style.bg} ${style.color} shadow-md`}
          >
            {currentLine.speaker[0]}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1.5">
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${style.badge}`}>
                {currentLine.speaker}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                ({currentIndex + 1}/{lines.length})
              </span>
            </div>
            <p className="text-slate-200 text-sm md:text-base leading-relaxed font-sans">{currentLine.text}</p>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex justify-end pt-2 border-t border-cyan-500/15">
          <button
            onClick={handleNext}
            className="flex items-center space-x-2 px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-sm tracking-wide transition cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <span>{currentIndex < lines.length - 1 ? 'CONTINUE' : 'PROCEED'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
