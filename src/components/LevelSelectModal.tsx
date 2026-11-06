import React, { useState } from 'react';
import { X, Lock, Skull, Award, Check } from 'lucide-react';
import { CHAPTERS_DATA, SHARD_LEVELS } from '../data/chaptersData';
import { sounds } from '../audio/SoundEffects';

interface LevelSelectModalProps {
  maxUnlockedLevel: number;
  onSelectLevel: (levelNumber: number) => void;
  onClose: () => void;
  collectedShards: Set<number>;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  maxUnlockedLevel,
  onSelectLevel,
  onClose,
  collectedShards,
}) => {
  const [activeChapter, setActiveChapter] = useState(
    maxUnlockedLevel <= 10 ? 1 : maxUnlockedLevel <= 20 ? 2 : maxUnlockedLevel <= 30 ? 3 : maxUnlockedLevel <= 40 ? 4 : 5
  );

  const currentChapter = CHAPTERS_DATA[activeChapter - 1];
  const [startLv, endLv] = currentChapter.levelRange;
  const levelNumbers: number[] = [];
  for (let i = startLv; i <= endLv; i++) {
    levelNumbers.push(i);
  }

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4 md:p-8 select-none">
      <div className="max-w-4xl w-full bg-[#031526] border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-cyan-500/20 bg-slate-900/50">
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-cyan-300">Level Selection (1 - 50)</h2>
            <div className="text-xs text-slate-400 font-mono">
              Navigate the 5 Oceanic Chapters · Unlocked up to Level {maxUnlockedLevel}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chapter Tabs */}
        <div className="flex border-b border-cyan-500/20 bg-slate-950/50 overflow-x-auto">
          {CHAPTERS_DATA.map((ch) => {
            const isSelected = activeChapter === ch.chapterNumber;
            const isUnlocked = maxUnlockedLevel >= ch.levelRange[0];

            return (
              <button
                key={ch.chapterNumber}
                onClick={() => {
                  sounds.playBubbleCollect(false);
                  setActiveChapter(ch.chapterNumber);
                }}
                className={`flex-1 py-3 px-4 text-xs font-mono font-bold tracking-wider uppercase transition cursor-pointer whitespace-nowrap border-b-2 ${
                  isSelected
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
                    : isUnlocked
                    ? 'border-transparent text-slate-400 hover:text-slate-200'
                    : 'border-transparent text-slate-600 opacity-60'
                }`}
              >
                Ch. {ch.chapterNumber}: {ch.title}
              </button>
            );
          })}
        </div>

        {/* Active Chapter Details */}
        <div className="p-4 bg-slate-900/30 border-b border-cyan-500/15 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold font-serif text-slate-100">{currentChapter.subtitle}</div>
            <div className="text-xs text-slate-400 font-mono">
              Climax Boss: <span className="text-rose-400 font-bold">{currentChapter.bossName}</span> · Power:{' '}
              <span className="text-cyan-400 font-bold">{currentChapter.unlockedPower}</span>
            </div>
          </div>
        </div>

        {/* Level Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4">
          {levelNumbers.map((lv) => {
            const isUnlocked = lv <= maxUnlockedLevel;
            const isBoss = lv === 10 || lv === 20 || lv === 30 || lv === 40 || lv === 49 || lv === 50;
            const hasShard = SHARD_LEVELS.has(lv);
            const shardFound = collectedShards.has(lv);

            return (
              <button
                key={lv}
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    sounds.unlock();
                    onSelectLevel(lv);
                    onClose();
                  }
                }}
                className={`relative p-4 rounded-xl border flex flex-col items-center justify-between min-h-[105px] transition cursor-pointer ${
                  !isUnlocked
                    ? 'bg-slate-950/40 border-slate-800 text-slate-600 cursor-not-allowed'
                    : isBoss
                    ? 'bg-rose-950/40 border-rose-500/50 hover:bg-rose-900/50 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : 'bg-slate-900/70 border-cyan-500/30 hover:bg-cyan-950/60 text-slate-200'
                }`}
              >
                {/* Level Number */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-mono font-bold">LV {lv}</span>
                  {isBoss && <Skull className="w-4 h-4 text-rose-400" />}
                  {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-600" />}
                </div>

                <div className="my-1 text-center">
                  <div className="text-xs font-semibold">{isBoss ? 'BOSS CLIMAX' : `Depth ${lv * 180}m`}</div>
                </div>

                {/* Shard Indicator */}
                <div className="w-full flex justify-between items-center text-[10px] font-mono">
                  {hasShard && (
                    <div
                      className={`flex items-center space-x-0.5 ${
                        shardFound ? 'text-amber-400' : 'text-slate-500'
                      }`}
                      title={shardFound ? 'Trident Shard Found' : 'Hidden Trident Shard in this level'}
                    >
                      <Award className="w-3 h-3" />
                      <span>{shardFound ? 'Found' : 'Shard'}</span>
                    </div>
                  )}
                  {isUnlocked && lv < maxUnlockedLevel && (
                    <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/20 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
