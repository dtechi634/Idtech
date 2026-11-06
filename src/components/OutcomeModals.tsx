import React from 'react';
import { ArrowRight, RotateCcw, Sparkles, Flame, ShieldAlert, Award } from 'lucide-react';
import { LevelConfig } from '../types/game';

interface LevelClearModalProps {
  level: LevelConfig;
  pearlsGained: number;
  soulsGained: number;
  onNextLevel: () => void;
  onOpenUpgrades: () => void;
}

export const LevelClearModal: React.FC<LevelClearModalProps> = ({
  level,
  pearlsGained,
  soulsGained,
  onNextLevel,
  onOpenUpgrades,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-6 select-none">
      <div className="max-w-md w-full bg-[#031526] border border-cyan-500/40 rounded-2xl p-6 text-center shadow-[0_0_35px_rgba(6,182,212,0.3)]">
        <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-400 mx-auto flex items-center justify-center text-cyan-300 mb-3 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          <Award className="w-6 h-6" />
        </div>

        <h2 className="text-xl md:text-2xl font-black font-serif text-slate-100 mb-1">
          {level.hasBoss ? 'CHAPTER CLIMAX CLEARED!' : 'ZONE PURIFIED!'}
        </h2>
        <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-4">
          Level {level.levelNumber} Completed
        </div>

        {/* Spoils */}
        <div className="flex items-center justify-center space-x-6 py-3 bg-slate-900/60 rounded-xl border border-cyan-500/20 mb-6">
          <div className="flex items-center space-x-2 text-cyan-300 font-mono text-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-bold">+{pearlsGained}</span>
            <span className="text-xs text-slate-400">Pearls</span>
          </div>

          {soulsGained > 0 && (
            <div className="flex items-center space-x-2 text-rose-300 font-mono text-sm">
              <Flame className="w-4 h-4 text-rose-400" />
              <span className="font-bold">+{soulsGained}</span>
              <span className="text-xs text-slate-400">Coral Soul</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onNextLevel}
            className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <span>DIVE DEEPER (LEVEL {level.levelNumber + 1})</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenUpgrades}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-semibold font-mono transition cursor-pointer"
          >
            Upgrade Skills & Health
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  levelNumber: number;
  onRetry: () => void;
  onOpenUpgrades: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ levelNumber, onRetry, onOpenUpgrades }) => {
  return (
    <div className="absolute inset-0 z-40 bg-slate-950/90 flex items-center justify-center p-6 select-none">
      <div className="max-w-md w-full bg-[#16050b] border border-rose-500/50 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(244,63,94,0.3)]">
        <div className="w-12 h-12 rounded-full bg-rose-950 border border-rose-500 mx-auto flex items-center justify-center text-rose-400 mb-3 shadow-[0_0_20px_rgba(244,63,94,0.5)]">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h2 className="text-2xl font-black font-serif text-rose-100 mb-1">CRUSHED BY THE ABYSS</h2>
        <p className="text-xs text-slate-400 leading-relaxed mb-6 font-sans">
          The ocean currents overwhelmed your mortal form. Draw upon King Thalor’s resilience and rise again!
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRetry}
            className="flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.4)]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RETRY LEVEL {levelNumber}</span>
          </button>

          <button
            onClick={onOpenUpgrades}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-semibold font-mono transition cursor-pointer"
          >
            Upgrade Power in Sanctuary
          </button>
        </div>
      </div>
    </div>
  );
};
