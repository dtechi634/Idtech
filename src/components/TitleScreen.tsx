import React from 'react';
import { Play, BookOpen, Volume2, VolumeX, Shield, Award, RotateCcw } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenLevelSelect: () => void;
  onOpenUpgrades: () => void;
  onResetSave: () => void;
  currentLevel: number;
  tridentShards: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLevelSelect,
  onOpenUpgrades,
  onResetSave,
  currentLevel,
  tridentShards,
}) => {
  const [isMuted, setIsMuted] = React.useState(sounds.getMuted());
  const [showStoryIntro, setShowStoryIntro] = React.useState(false);

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        sounds.unlock();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 md:p-12 select-none bg-gradient-to-t from-[#020b14]/95 via-[#031627]/60 to-transparent">
      {/* Top Header / Meta bar */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold text-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            50
          </div>
          <div>
            <div className="text-xs tracking-widest font-mono text-cyan-400 font-semibold uppercase">
              5 Chapters · 50 Levels · 3D Action RPG
            </div>
            <div className="text-sm text-slate-300 font-medium">
              Progress: Level {currentLevel} / 50 · Shards {tridentShards}/10
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/60 transition cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Hero Title Lockup over negative space */}
      <div className="max-w-2xl my-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs tracking-wider uppercase font-mono mb-4">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>The First Human Water King</span>
        </div>

        {/* Bespoke inline SVG Title Lockup */}
        <div className="mb-4">
          <svg viewBox="0 0 540 110" className="w-full max-w-lg drop-shadow-[0_4px_24px_rgba(0,212,255,0.45)]">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#70e2ff" />
                <stop offset="70%" stopColor="#00b4d8" />
                <stop offset="100%" stopColor="#0077b6" />
              </linearGradient>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff3b0" />
                <stop offset="50%" stopColor="#ffd166" />
                <stop offset="100%" stopColor="#e76f51" />
              </linearGradient>
            </defs>
            <text
              x="0"
              y="55"
              fill="url(#titleGrad)"
              fontFamily="Cinzel, serif"
              fontWeight="900"
              fontSize="56"
              letterSpacing="3"
            >
              KAEL
            </text>
            <text
              x="180"
              y="55"
              fill="url(#goldGrad)"
              fontFamily="Cinzel, serif"
              fontWeight="700"
              fontSize="34"
              letterSpacing="6"
            >
              THE WATER KING
            </text>
            {/* Ambient water wave underline */}
            <path
              d="M0 72 Q 135 88, 270 72 T 540 72"
              fill="none"
              stroke="#00f0ff"
              strokeWidth="2.5"
              strokeOpacity="0.8"
            />
            <path
              d="M0 78 Q 135 64, 270 78 T 540 78"
              fill="none"
              stroke="#ffd700"
              strokeWidth="1.2"
              strokeOpacity="0.6"
            />
          </svg>
        </div>

        <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8 max-w-xl font-normal drop-shadow">
          Cast into the bottomless Abyss Trench as a sacrifice by your brother, friend, and elder.
          At the ocean floor, make a blood pact with the imprisoned Mermaid King Thalor.
          Command the primordial tides and claim your vengeance.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => {
              sounds.unlock();
              onStartGame();
            }}
            className="flex items-center space-x-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-base tracking-wide shadow-[0_0_25px_rgba(6,182,212,0.5)] transition active:scale-95 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>{currentLevel > 1 ? `CONTINUE (LV ${currentLevel})` : 'BEGIN JOURNEY'}</span>
          </button>

          <button
            onClick={onOpenLevelSelect}
            className="flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-500/40 text-cyan-300 font-semibold text-sm transition cursor-pointer"
          >
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Select Level (1-50)</span>
          </button>

          <button
            onClick={onOpenUpgrades}
            className="flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-amber-500/40 text-amber-300 font-semibold text-sm transition cursor-pointer"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Magic & Upgrades</span>
          </button>

          <button
            onClick={() => setShowStoryIntro(!showStoryIntro)}
            className="flex items-center space-x-2 px-4 py-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/70 border border-slate-700 text-slate-300 font-medium text-sm transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Story Codex</span>
          </button>

          {currentLevel > 1 && (
            <button
              onClick={onResetSave}
              className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-rose-950/60 border border-rose-900/40 text-rose-400 transition cursor-pointer"
              title="Reset Save Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Story Codex Modal Overlay */}
      {showStoryIntro && (
        <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center p-6 z-40">
          <div className="max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 md:p-8 shadow-[0_0_35px_rgba(6,182,212,0.3)]">
            <h3 className="text-2xl font-bold font-serif text-cyan-300 mb-3">The Lore of Kael</h3>
            <div className="text-slate-300 space-y-3 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <p>
                <strong>The Human with Zero Magic:</strong> Born in the coastal village of Tidefall where every child
                commands the sea, Kael alone had no spark. Bullied and branded useless, he was betrayed by his closest
                allies: elder Varun, brother Ronan, and childhood friend Lira.
              </p>
              <p>
                <strong>The Abyssal Pact:</strong> Bound in chains and thrown into the deepest trench as a human
                sacrifice to the Sea Witch Morgana, Kael survived the fall. In the dark ruins of the Sunken Prison, he
                found King Thalor—the ancient ruler of all 7 seas, sealed for a century.
              </p>
              <p>
                Because Kael has no magical aura, the ancient blood seal could not detect him. By spilling his mortal
                blood, Kael shattered Thalor’s cage. In return, Thalor swore an oath to forge Kael into the first Human
                Water King.
              </p>
              <p>
                <strong>The 5 Chapters:</strong> Climb from Level 1 to 50 across 5 terrifying ocean realms, defeat
                Morgana’s 7 Sea Lords, conquer your traitors turned sea monsters, and decide the fate of all seven
                seas: <em>Revenge</em> or <em>Mercy</em>.
              </p>
            </div>
            <button
              onClick={() => setShowStoryIntro(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition cursor-pointer"
            >
              Close Codex
            </button>
          </div>
        </div>
      )}

      {/* Single Flat Control Hint Line */}
      <div className="flex items-center justify-center w-full pt-4 border-t border-cyan-500/15 text-xs text-slate-400 font-mono tracking-wider text-center">
        WASD Move · Space Ascend · Shift Dive · E Punch · Q Dash · R Trident · F Dragon · V Water King Mode · X Block · Esc Pause
      </div>
    </div>
  );
};
