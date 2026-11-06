import React, { useState } from 'react';
import {
  Shield,
  Volume2,
  VolumeX,
  Pause,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Flame,
  Award,
  Crown,
} from 'lucide-react';
import { PlayerStats, BossData, LevelConfig, MagicType } from '../types/game';
import { sounds } from '../audio/SoundEffects';

interface HUDProps {
  stats: PlayerStats;
  boss: BossData | null;
  level: LevelConfig;
  killedEnemies: number;
  totalEnemies: number;
  onPerformSkill: (skill: MagicType) => void;
  onSetBlocking: (isBlocking: boolean) => void;
  onPauseToggle: () => void;
  onOpenUpgrades: () => void;
  onOpenLevelSelect: () => void;
  onVirtualTurn?: (delta: number) => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  boss,
  level,
  killedEnemies,
  totalEnemies,
  onPerformSkill,
  onSetBlocking,
  onPauseToggle,
  onOpenUpgrades,
  onOpenLevelSelect,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const hpPercent = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
  const tidePercent = Math.max(0, Math.min(100, (stats.tideEnergy / stats.maxTideEnergy) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3 md:p-6 overflow-hidden">
      {/* ======================================================== */}
      {/* TOP BAR / PERIMETER CLUSTERS                             */}
      {/* ======================================================== */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: Kael's Stats Cluster */}
        <div className="pointer-events-auto bg-[#031526]/90 border border-cyan-500/30 rounded-xl p-3 shadow-lg max-w-xs md:max-w-sm">
          {/* Level & Identity */}
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-cyan-500/20">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono font-bold text-xs border border-cyan-400/40">
                LV {stats.level}
              </span>
              <span className="text-sm font-bold text-slate-100 tracking-wide font-serif">
                {stats.inWaterKingMode ? 'WATER KING KAEL' : 'KAEL'}
              </span>
            </div>
            {stats.inWaterKingMode && (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-xs font-bold animate-pulse">
                <Crown className="w-3 h-3" />
                <span>{Math.ceil(stats.waterKingTimer)}s</span>
              </span>
            )}
          </div>

          {/* Health Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-300 mb-1">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> HP
              </span>
              <span className="tabular-nums">
                {Math.ceil(stats.hp)} / {stats.maxHp}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-950/80 rounded-full overflow-hidden border border-emerald-500/30">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Tide Energy (Mana) Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs font-mono font-semibold text-slate-300 mb-1">
              <span className="text-cyan-400 flex items-center gap-1">
                <Zap className="w-3 h-3" /> TIDE ENERGY
              </span>
              <span className="tabular-nums">
                {Math.ceil(stats.tideEnergy)} / {stats.maxTideEnergy}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-950/80 rounded-full overflow-hidden border border-cyan-500/30">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-150"
                style={{ width: `${tidePercent}%` }}
              />
            </div>
          </div>

          {/* Currencies & Relics */}
          <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-300">
            <div className="flex items-center space-x-1 text-cyan-200">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="tabular-nums font-bold">{stats.pearls}</span>
              <span className="text-[10px] text-slate-400">Pearls</span>
            </div>
            <div className="flex items-center space-x-1 text-rose-300">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span className="tabular-nums font-bold">{stats.coralSouls}</span>
              <span className="text-[10px] text-slate-400">Souls</span>
            </div>
            <div className="flex items-center space-x-1 text-amber-300">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="tabular-nums font-bold">{stats.tridentShards}/10</span>
              <span className="text-[10px] text-slate-400">Shards</span>
            </div>
          </div>
        </div>

        {/* Top-Center: Boss Bar (Active during boss fights) */}
        {boss && (
          <div className="pointer-events-auto bg-[#031526]/95 border border-rose-500/40 rounded-xl px-5 py-3 shadow-[0_0_20px_rgba(244,63,94,0.3)] max-w-md w-full mx-3 text-center">
            <div className="flex items-center justify-between mb-1">
              <div className="text-left">
                <div className="text-sm font-bold text-rose-200 font-serif tracking-wide">{boss.name}</div>
                <div className="text-[11px] text-rose-400/80 font-mono">{boss.title}</div>
              </div>
              <div className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30">
                Phase {boss.phase}/{boss.maxPhase} {boss.isRaging && '· RAGE'}
              </div>
            </div>

            {/* Boss HP Bar */}
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-rose-500/50 mb-1">
              <div
                className={`h-full transition-all duration-150 ${
                  boss.isRaging
                    ? 'bg-gradient-to-r from-rose-600 via-orange-500 to-yellow-400'
                    : 'bg-gradient-to-r from-rose-600 to-rose-400'
                }`}
                style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span className="text-rose-300 font-semibold">{boss.currentAbility}</span>
              <span className="tabular-nums">
                {Math.ceil(boss.hp)} / {boss.maxHp}
              </span>
            </div>
          </div>
        )}

        {/* Top-Right: Objective & Utility Controls */}
        <div className="pointer-events-auto flex flex-col items-end space-y-2">
          {/* Level Info card */}
          <div className="bg-[#031526]/90 border border-cyan-500/30 rounded-xl p-2.5 text-right shadow-lg">
            <div className="text-xs font-mono text-cyan-400 font-semibold uppercase">
              Ch. {level.chapterNumber} · {level.zoneName}
            </div>
            <div className="text-sm font-bold text-slate-100 font-serif">Level {level.levelNumber}</div>
            {!level.hasBoss && (
              <div className="text-xs font-mono text-slate-300 mt-1">
                Monsters: <span className="text-cyan-400 font-bold tabular-nums">{killedEnemies}</span> / {totalEnemies}
              </div>
            )}
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={onOpenUpgrades}
              className="px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-900/80 transition cursor-pointer"
            >
              Upgrades
            </button>
            <button
              onClick={onOpenLevelSelect}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs hover:bg-slate-800 transition cursor-pointer"
              title="Level Select"
            >
              Maps
            </button>
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-cyan-300 hover:bg-slate-800 transition cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onPauseToggle}
              className="p-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-cyan-300 hover:bg-slate-800 transition cursor-pointer"
              title="Pause Game"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* COLLAPSIBLE BOTTOM CONTROL DOCK (Zero Viewport Occlusion)*/}
      {/* ======================================================== */}
      <div className="pointer-events-auto flex flex-col items-center mx-auto mb-2 w-full max-w-3xl transition-transform duration-200">
        {/* Dock Collapse Toggle */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="flex items-center space-x-1 px-3 py-1 rounded-t-lg bg-[#031526]/90 border-t border-x border-cyan-500/30 text-[11px] font-mono text-cyan-300 hover:bg-cyan-950/70 transition cursor-pointer shadow-md mb-[-1px]"
        >
          {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{isDockCollapsed ? 'Show Controls Dock' : 'Hide Controls Dock'}</span>
        </button>

        {/* Dock Content */}
        {!isDockCollapsed && (
          <div className="w-full bg-[#020e1a]/95 border border-cyan-500/40 rounded-2xl p-3 md:p-4 shadow-[0_0_25px_rgba(0,180,216,0.25)]">
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              {/* Skill 1: Tidal Fist */}
              <button
                onClick={() => onPerformSkill('tidal_fist')}
                className="flex flex-col items-center p-2 md:px-3 md:py-2.5 rounded-xl bg-cyan-950/60 border border-cyan-400/50 hover:bg-cyan-900/60 transition active:scale-95 cursor-pointer min-w-[70px] md:min-w-[84px]"
              >
                <div className="text-cyan-300 font-bold text-xs md:text-sm">Tidal Fist</div>
                <div className="text-[10px] text-cyan-400/70 font-mono mt-0.5">[E] / Click</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Water Punch</div>
              </button>

              {/* Skill 2: Aqua Dash */}
              <button
                onClick={() => onPerformSkill('aqua_dash')}
                disabled={!stats.unlockedSkills.aqua_dash || stats.dashCooldown > 0}
                className={`relative flex flex-col items-center p-2 md:px-3 md:py-2.5 rounded-xl border transition min-w-[70px] md:min-w-[84px] cursor-pointer ${
                  !stats.unlockedSkills.aqua_dash
                    ? 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-50'
                    : stats.dashCooldown > 0
                    ? 'bg-slate-900/60 border-cyan-500/20 text-slate-400'
                    : 'bg-cyan-950/60 border-cyan-400/50 hover:bg-cyan-900/60 text-cyan-300 active:scale-95'
                }`}
              >
                <div className="font-bold text-xs md:text-sm">Aqua Dash</div>
                <div className="text-[10px] font-mono mt-0.5 text-cyan-400/70">
                  {stats.unlockedSkills.aqua_dash ? (stats.dashCooldown > 0 ? `${stats.dashCooldown.toFixed(1)}s` : '[Q]') : 'Lv 11'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Phase Dodge</div>
              </button>

              {/* Skill 3: Trident Summon */}
              <button
                onClick={() => onPerformSkill('trident_summon')}
                disabled={!stats.unlockedSkills.trident_summon || stats.skillCooldowns.trident_summon > 0}
                className={`relative flex flex-col items-center p-2 md:px-3 md:py-2.5 rounded-xl border transition min-w-[70px] md:min-w-[84px] cursor-pointer ${
                  !stats.unlockedSkills.trident_summon
                    ? 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-50'
                    : stats.skillCooldowns.trident_summon > 0
                    ? 'bg-slate-900/60 border-amber-500/20 text-slate-400'
                    : 'bg-amber-950/60 border-amber-400/50 hover:bg-amber-900/60 text-amber-300 active:scale-95'
                }`}
              >
                <div className="font-bold text-xs md:text-sm">Trident</div>
                <div className="text-[10px] font-mono mt-0.5 text-amber-400/70">
                  {stats.unlockedSkills.trident_summon
                    ? stats.skillCooldowns.trident_summon > 0
                      ? `${stats.skillCooldowns.trident_summon.toFixed(1)}s`
                      : '[R]'
                    : 'Lv 21'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Vortex Spear</div>
              </button>

              {/* Skill 4: Leviathan Roar */}
              <button
                onClick={() => onPerformSkill('leviathan_roar')}
                disabled={!stats.unlockedSkills.leviathan_roar || stats.skillCooldowns.leviathan_roar > 0}
                className={`relative flex flex-col items-center p-2 md:px-3 md:py-2.5 rounded-xl border transition min-w-[70px] md:min-w-[84px] cursor-pointer ${
                  !stats.unlockedSkills.leviathan_roar
                    ? 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-50'
                    : stats.skillCooldowns.leviathan_roar > 0
                    ? 'bg-slate-900/60 border-purple-500/20 text-slate-400'
                    : 'bg-purple-950/60 border-purple-400/50 hover:bg-purple-900/60 text-purple-300 active:scale-95'
                }`}
              >
                <div className="font-bold text-xs md:text-sm">Leviathan</div>
                <div className="text-[10px] font-mono mt-0.5 text-purple-400/70">
                  {stats.unlockedSkills.leviathan_roar
                    ? stats.skillCooldowns.leviathan_roar > 0
                      ? `${stats.skillCooldowns.leviathan_roar.toFixed(1)}s`
                      : '[F]'
                    : 'Lv 31'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Dragon AoE</div>
              </button>

              {/* Skill 5: WATER KING MODE (God Mode) */}
              <button
                onClick={() => onPerformSkill('water_king_mode')}
                disabled={!stats.unlockedSkills.water_king_mode || stats.skillCooldowns.water_king_mode > 0 || stats.inWaterKingMode}
                className={`relative flex flex-col items-center p-2 md:px-3 md:py-2.5 rounded-xl border transition min-w-[80px] md:min-w-[96px] cursor-pointer ${
                  !stats.unlockedSkills.water_king_mode
                    ? 'bg-slate-900/40 border-slate-800 text-slate-600 opacity-50'
                    : stats.inWaterKingMode
                    ? 'bg-cyan-500 border-cyan-300 text-slate-950 shadow-[0_0_20px_rgba(0,255,255,0.7)]'
                    : stats.skillCooldowns.water_king_mode > 0
                    ? 'bg-slate-900/60 border-cyan-500/20 text-slate-400'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-300 text-white shadow-[0_0_15px_rgba(0,212,255,0.4)] active:scale-95'
                }`}
              >
                <div className="font-bold text-xs md:text-sm flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>KING</span>
                </div>
                <div className="text-[10px] font-mono mt-0.5">
                  {stats.unlockedSkills.water_king_mode
                    ? stats.inWaterKingMode
                      ? 'ACTIVE'
                      : stats.skillCooldowns.water_king_mode > 0
                      ? `${stats.skillCooldowns.water_king_mode.toFixed(0)}s`
                      : '[V]'
                    : 'Lv 41'}
                </div>
                <div className="text-[10px] opacity-80 mt-0.5">30s God Mode</div>
              </button>

              {/* Water Shield / Block */}
              <button
                onMouseDown={() => onSetBlocking(true)}
                onMouseUp={() => onSetBlocking(false)}
                onTouchStart={() => onSetBlocking(true)}
                onTouchEnd={() => onSetBlocking(false)}
                className={`flex flex-col items-center p-2 md:px-3 md:py-2.5 rounded-xl border transition min-w-[70px] md:min-w-[84px] cursor-pointer ${
                  stats.isBlocking
                    ? 'bg-cyan-400 border-white text-slate-950 shadow-[0_0_18px_rgba(0,240,255,0.6)]'
                    : 'bg-slate-900/80 border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/50'
                }`}
              >
                <div className="flex items-center space-x-1 font-bold text-xs md:text-sm">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Block</span>
                </div>
                <div className="text-[10px] font-mono mt-0.5">[X] / R-Click</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Water Shield</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
