import React from 'react';
import { PlayerStats, MagicType } from '../types/game';
import { X, Sparkles, Flame, Shield, Zap, Swords, Award, CheckCircle2 } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface UpgradeModalProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ stats, onUpdateStats, onClose }) => {
  // Upgrade HP
  const hpCost = Math.floor(stats.maxHp * 0.4);
  const handleUpgradeHp = () => {
    if (stats.pearls < hpCost) return;
    sounds.playBubbleCollect(true);
    onUpdateStats({
      ...stats,
      pearls: stats.pearls - hpCost,
      maxHp: stats.maxHp + 50,
      hp: stats.hp + 50,
    });
  };

  // Upgrade Tide Energy
  const tideCost = Math.floor(stats.maxTideEnergy * 0.8);
  const handleUpgradeTide = () => {
    if (stats.pearls < tideCost) return;
    sounds.playBubbleCollect(true);
    onUpdateStats({
      ...stats,
      pearls: stats.pearls - tideCost,
      maxTideEnergy: stats.maxTideEnergy + 25,
      tideEnergy: stats.tideEnergy + 25,
    });
  };

  // Upgrade Attack
  const atkCost = Math.floor(stats.attackPower * 4.5);
  const handleUpgradeAtk = () => {
    if (stats.pearls < atkCost) return;
    sounds.playBubbleCollect(true);
    onUpdateStats({
      ...stats,
      pearls: stats.pearls - atkCost,
      attackPower: stats.attackPower + 8,
    });
  };

  // Upgrade Magic Skill Tier
  const handleUpgradeSkillTier = (skill: MagicType) => {
    const currentTier = stats.skillTiers[skill] || 1;
    if (currentTier >= 5) return;
    const soulCost = currentTier;
    if (stats.coralSouls < soulCost) return;

    sounds.playWaterKingMode();
    onUpdateStats({
      ...stats,
      coralSouls: stats.coralSouls - soulCost,
      skillTiers: {
        ...stats.skillTiers,
        [skill]: currentTier + 1,
      },
      attackPower: stats.attackPower + 5,
    });
  };

  const skillsList: { id: MagicType; name: string; desc: string; minLevel: number }[] = [
    {
      id: 'tidal_fist',
      name: 'Tidal Fist',
      desc: 'Infuses your punches with pressurized water torrents.',
      minLevel: 1,
    },
    {
      id: 'aqua_dash',
      name: 'Aqua Dash',
      desc: 'Transform into a hydro stream, passing through enemies unharmed.',
      minLevel: 11,
    },
    {
      id: 'trident_summon',
      name: 'Trident Summon',
      desc: 'Summons King Thalor’s spectral spear to pierce foes with vortexes.',
      minLevel: 21,
    },
    {
      id: 'leviathan_roar',
      name: 'Leviathan Roar',
      desc: 'Summons an abyssal water dragon that wreaks massive AoE devastation.',
      minLevel: 31,
    },
    {
      id: 'water_king_mode',
      name: 'WATER KING MODE',
      desc: 'Become the sovereign ruler of the 7 seas for 30s of invulnerable god-mode.',
      minLevel: 41,
    },
  ];

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4 md:p-8 select-none">
      <div className="max-w-4xl w-full bg-[#031526] border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-cyan-500/20 bg-slate-900/50">
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-cyan-300">Sanctuary of King Thalor</h2>
            <div className="text-xs text-slate-400 font-mono">Enhance Kael’s Attributes & Ascend Magic Skill Trees</div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-sm">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-bold tabular-nums">{stats.pearls}</span>
              <span className="text-xs text-slate-400">Pearls</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-rose-950/80 border border-rose-500/30 text-rose-300 font-mono text-sm">
              <Flame className="w-4 h-4 text-rose-400" />
              <span className="font-bold tabular-nums">{stats.coralSouls}</span>
              <span className="text-xs text-slate-400">Souls</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6">
          {/* Section 1: Core Physical Attributes (Spend Pearls) */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-cyan-400 mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              <span>Core Attributes (Pearls)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Max HP */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-400 mb-1">Vitality</div>
                  <div className="text-lg font-bold text-emerald-400 tabular-nums">{stats.maxHp} HP</div>
                  <div className="text-xs text-slate-300 mt-1">+50 Max Health per upgrade</div>
                </div>
                <button
                  onClick={handleUpgradeHp}
                  disabled={stats.pearls < hpCost}
                  className={`mt-4 py-2 px-3 rounded-lg font-semibold text-xs tracking-wider uppercase font-mono transition cursor-pointer ${
                    stats.pearls >= hpCost
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Upgrade ({hpCost} Pearls)
                </button>
              </div>

              {/* Max Tide Energy */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-400 mb-1">Mana Reservoir</div>
                  <div className="text-lg font-bold text-cyan-400 tabular-nums">{stats.maxTideEnergy} Mana</div>
                  <div className="text-xs text-slate-300 mt-1">+25 Max Tide Energy per upgrade</div>
                </div>
                <button
                  onClick={handleUpgradeTide}
                  disabled={stats.pearls < tideCost}
                  className={`mt-4 py-2 px-3 rounded-lg font-semibold text-xs tracking-wider uppercase font-mono transition cursor-pointer ${
                    stats.pearls >= tideCost
                      ? 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Upgrade ({tideCost} Pearls)
                </button>
              </div>

              {/* Attack Power */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-700/60 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-400 mb-1">Tidal Force</div>
                  <div className="text-lg font-bold text-amber-400 tabular-nums">{stats.attackPower} ATK</div>
                  <div className="text-xs text-slate-300 mt-1">+8 Base Attack Power</div>
                </div>
                <button
                  onClick={handleUpgradeAtk}
                  disabled={stats.pearls < atkCost}
                  className={`mt-4 py-2 px-3 rounded-lg font-semibold text-xs tracking-wider uppercase font-mono transition cursor-pointer ${
                    stats.pearls >= atkCost
                      ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Upgrade ({atkCost} Pearls)
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Magic Skill Tree (Spend Coral Souls) */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-rose-400 mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4" />
              <span>Magic Skill Tree (Coral Souls - 5 Tiers Each)</span>
            </h3>

            <div className="space-y-2.5">
              {skillsList.map((skill) => {
                const isUnlocked = stats.unlockedSkills[skill.id];
                const currentTier = stats.skillTiers[skill.id] || 1;
                const cost = currentTier;
                const canAfford = stats.coralSouls >= cost;

                return (
                  <div
                    key={skill.id}
                    className={`p-3.5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                      isUnlocked
                        ? 'bg-slate-900/70 border-cyan-500/30'
                        : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold font-serif text-slate-100 text-sm md:text-base">{skill.name}</span>
                        {isUnlocked ? (
                          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-xs font-mono border border-cyan-500/30">
                            Tier {currentTier} / 5
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs font-mono">
                            Unlocks at Level {skill.minLevel}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-xl">{skill.desc}</p>
                    </div>

                    <div className="flex items-center space-x-2 self-end md:self-auto">
                      {isUnlocked && currentTier < 5 && (
                        <button
                          onClick={() => handleUpgradeSkillTier(skill.id)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition cursor-pointer ${
                            canAfford
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          Upgrade Tier ({cost} Souls)
                        </button>
                      )}
                      {isUnlocked && currentTier >= 5 && (
                        <div className="flex items-center space-x-1 text-emerald-400 text-xs font-mono font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>MAX TIER</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Secret Weapon - The Sovereign Leviathan Trident */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-cyan-950/30 to-slate-900 border border-amber-500/40 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-3 rounded-xl bg-amber-900/40 border border-amber-500/40 text-amber-300">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <div className="text-sm font-bold text-amber-300 font-serif">
                  Secret Weapon: The Sovereign Leviathan Trident
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Collect 10 Trident Shards hidden across levels 1-49 to unlock King Thalor’s true relic weapon (+50%
                  Crit Damage & Twin Maelstrom Vortexes).
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xs font-mono text-slate-400">Shards Found</div>
                <div className="text-base font-bold font-mono text-amber-300 tabular-nums">
                  {stats.tridentShards} / 10
                </div>
              </div>
              {stats.unlockedSecretWeapon ? (
                <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-bold font-mono">
                  EQUIPPED
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs font-mono">
                  SEALED
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/20 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-sm tracking-wide transition cursor-pointer"
          >
            Return to Ocean
          </button>
        </div>
      </div>
    </div>
  );
};
