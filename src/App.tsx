import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { PlayerStats, BossData, LevelConfig, MagicType } from './types/game';
import { generateLevels, CUTSCENES } from './data/chaptersData';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { CutsceneDialog } from './components/CutsceneDialog';
import { UpgradeModal } from './components/UpgradeModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { LevelClearModal, GameOverModal } from './components/OutcomeModals';
import { EndingScreen } from './components/EndingScreen';
import { sounds } from './audio/SoundEffects';

const SAVE_KEY = 'kael_water_king_save_v1';

const defaultStats: PlayerStats = {
  level: 1,
  hp: 200,
  maxHp: 200,
  tideEnergy: 100,
  maxTideEnergy: 100,
  attackPower: 25,
  pearls: 0,
  coralSouls: 0,
  tridentShards: 0,
  unlockedSkills: {
    tidal_fist: true,
    aqua_dash: false,
    trident_summon: false,
    leviathan_roar: false,
    water_king_mode: false,
  },
  skillTiers: {
    tidal_fist: 1,
    aqua_dash: 1,
    trident_summon: 1,
    leviathan_roar: 1,
    water_king_mode: 1,
  },
  waterKingTimer: 0,
  inWaterKingMode: false,
  isBlocking: false,
  dashCooldown: 0,
  skillCooldowns: {
    tidal_fist: 0,
    aqua_dash: 0,
    trident_summon: 0,
    leviathan_roar: 0,
    water_king_mode: 0,
  },
  unlockedSecretWeapon: false,
};

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Game UI States
  const [gameState, setGameState] = useState<'title' | 'playing' | 'level_clear' | 'game_over' | 'ending'>('title');
  const [showUpgrades, setShowUpgrades] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [activeCutscene, setActiveCutscene] = useState<{ id: string; title: string; lines: typeof CUTSCENES['prologue']['lines'] } | null>(null);

  // Progression & Save State
  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return defaultStats;
  });

  const [currentLevelNumber, setCurrentLevelNumber] = useState(stats.level || 1);
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(Math.max(stats.level || 1, 1));
  const [collectedShards, setCollectedShards] = useState<Set<number>>(new Set());

  // HUD active state
  const [boss, setBoss] = useState<BossData | null>(null);
  const [killedEnemies, setKilledEnemies] = useState(0);
  const [totalEnemies, setTotalEnemies] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Pre-generate 50 levels
  const levels = useRef<LevelConfig[]>(generateLevels());
  const currentLevelConfig = levels.current[currentLevelNumber - 1] || levels.current[0];

  // Sync Save to localStorage
  const saveProgress = useCallback((newStats: PlayerStats, levelNum: number) => {
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({
          ...newStats,
          level: levelNum,
        })
      );
    } catch {
      // Ignore
    }
  }, []);

  // Update skills unlock state based on level
  const checkSkillUnlocks = useCallback((lv: number, currentStats: PlayerStats): PlayerStats => {
    const updated = { ...currentStats };
    if (lv >= 1) updated.unlockedSkills.tidal_fist = true;
    if (lv >= 11) updated.unlockedSkills.aqua_dash = true;
    if (lv >= 21) updated.unlockedSkills.trident_summon = true;
    if (lv >= 31) updated.unlockedSkills.leviathan_roar = true;
    if (lv >= 41) updated.unlockedSkills.water_king_mode = true;
    return updated;
  }, []);

  // Initialize GameEngine
  useEffect(() => {
    if (!canvasMountRef.current || engineRef.current) return;

    const engine = new GameEngine(canvasMountRef.current, stats, {
      onStatsChange: (newStats) => {
        setStats({ ...newStats });
      },
      onBossChange: (bossData) => {
        setBoss(bossData ? { ...bossData } : null);
      },
      onEnemiesChange: (killed, total) => {
        setKilledEnemies(killed);
        setTotalEnemies(total);
      },
      onLevelComplete: () => {
        setGameState('level_clear');
      },
      onPlayerDeath: () => {
        setGameState('game_over');
      },
      onTriggerCutscene: (cutsceneId) => {
        // Only show dialogue cutscene if player has entered gameplay
        setGameState((current) => {
          if (current === 'playing') {
            const scene = CUTSCENES[cutsceneId];
            if (scene) {
              setActiveCutscene({ id: scene.id, title: scene.title, lines: scene.lines });
            }
          }
          return current;
        });
      },
      onShardCollected: (levelNum) => {
        setCollectedShards((prev) => new Set(prev).add(levelNum));
      },
    });

    engineRef.current = engine;

    // Start title screen idle world
    engine.startLevel(currentLevelConfig);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []); // Run once on mount

  // Start Playing from Title
  const handleStartGame = useCallback(() => {
    sounds.unlock();
    setGameState('playing');
    if (engineRef.current) {
      engineRef.current.isPaused = false;
      const leveledStats = checkSkillUnlocks(currentLevelNumber, stats);
      setStats(leveledStats);
      engineRef.current.setStats(leveledStats);
      engineRef.current.startLevel(currentLevelConfig);

      if (currentLevelNumber === 1) {
        const scene = CUTSCENES['prologue'];
        setActiveCutscene({ id: scene.id, title: scene.title, lines: scene.lines });
      }
    }
  }, [currentLevelNumber, currentLevelConfig, stats, checkSkillUnlocks]);

  // Next Level Transition
  const handleNextLevel = useCallback(() => {
    const nextLv = currentLevelNumber + 1;
    if (nextLv > 50) {
      setGameState('ending');
      return;
    }

    setCurrentLevelNumber(nextLv);
    setMaxUnlockedLevel((prev) => Math.max(prev, nextLv));

    const updatedStats = checkSkillUnlocks(nextLv, {
      ...stats,
      level: nextLv,
      hp: stats.maxHp,
      tideEnergy: stats.maxTideEnergy,
      pearls: stats.pearls + 50 + nextLv * 10,
    });

    setStats(updatedStats);
    saveProgress(updatedStats, nextLv);

    setGameState('playing');
    if (engineRef.current) {
      engineRef.current.setStats(updatedStats);
      const nextConfig = levels.current[nextLv - 1];
      engineRef.current.startLevel(nextConfig);
    }
  }, [currentLevelNumber, stats, checkSkillUnlocks, saveProgress]);

  // Jump to specific Level
  const handleSelectLevel = useCallback(
    (targetLv: number) => {
      setCurrentLevelNumber(targetLv);
      const updatedStats = checkSkillUnlocks(targetLv, {
        ...stats,
        level: targetLv,
        hp: stats.maxHp,
        tideEnergy: stats.maxTideEnergy,
      });
      setStats(updatedStats);
      saveProgress(updatedStats, targetLv);

      setGameState('playing');
      if (engineRef.current) {
        engineRef.current.setStats(updatedStats);
        const targetConfig = levels.current[targetLv - 1];
        engineRef.current.startLevel(targetConfig);
      }
    },
    [stats, checkSkillUnlocks, saveProgress]
  );

  // Retry Level on Death
  const handleRetry = useCallback(() => {
    const restoredStats = {
      ...stats,
      hp: stats.maxHp,
      tideEnergy: stats.maxTideEnergy,
    };
    setStats(restoredStats);
    setGameState('playing');
    if (engineRef.current) {
      engineRef.current.setStats(restoredStats);
      engineRef.current.startLevel(currentLevelConfig);
    }
  }, [stats, currentLevelConfig]);

  // Skills execution
  const handlePerformSkill = useCallback((skill: MagicType) => {
    if (!engineRef.current) return;
    if (skill === 'tidal_fist') engineRef.current.performTidalFist();
    else if (skill === 'aqua_dash') engineRef.current.performAquaDash();
    else if (skill === 'trident_summon') engineRef.current.performTridentSummon();
    else if (skill === 'leviathan_roar') engineRef.current.performLeviathanRoar();
    else if (skill === 'water_king_mode') engineRef.current.performWaterKingMode();
  }, []);

  const handleSetBlocking = useCallback((isBlocking: boolean) => {
    if (!engineRef.current) return;
    engineRef.current.setBlocking(isBlocking);
  }, []);

  const handlePauseToggle = useCallback(() => {
    if (!engineRef.current) return;
    const next = !isPaused;
    setIsPaused(next);
    engineRef.current.isPaused = next;
  }, [isPaused]);

  const handleResetSave = useCallback(() => {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // Ignore
    }
    setStats(defaultStats);
    setCurrentLevelNumber(1);
    setMaxUnlockedLevel(1);
    setCollectedShards(new Set());
    if (engineRef.current) {
      engineRef.current.setStats(defaultStats);
      engineRef.current.startLevel(levels.current[0]);
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans select-none">
      {/* Isolated WebGL Canvas Container */}
      <div ref={canvasMountRef} className="absolute inset-0 z-0" />

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
          onOpenUpgrades={() => setShowUpgrades(true)}
          onResetSave={handleResetSave}
          currentLevel={currentLevelNumber}
          tridentShards={stats.tridentShards}
        />
      )}

      {/* In-Game Low-Occlusion HUD */}
      {gameState === 'playing' && (
        <HUD
          stats={stats}
          boss={boss}
          level={currentLevelConfig}
          killedEnemies={killedEnemies}
          totalEnemies={totalEnemies}
          onPerformSkill={handlePerformSkill}
          onSetBlocking={handleSetBlocking}
          onPauseToggle={handlePauseToggle}
          onOpenUpgrades={() => setShowUpgrades(true)}
          onOpenLevelSelect={() => setShowLevelSelect(true)}
          onVirtualTurn={(delta) => engineRef.current?.setVirtualSteering(delta)}
        />
      )}

      {/* Story Cutscene Modal */}
      {activeCutscene && (
        <CutsceneDialog
          title={activeCutscene.title}
          lines={activeCutscene.lines}
          onFinish={() => {
            if (activeCutscene.id === 'ending_choice') {
              setGameState('ending');
            }
            setActiveCutscene(null);
          }}
        />
      )}

      {/* Upgrades & Magic Skill Tree Modal */}
      {showUpgrades && (
        <UpgradeModal
          stats={stats}
          onUpdateStats={(newStats) => {
            setStats(newStats);
            saveProgress(newStats, currentLevelNumber);
            if (engineRef.current) engineRef.current.setStats(newStats);
          }}
          onClose={() => setShowUpgrades(false)}
        />
      )}

      {/* 50 Levels Selection Modal */}
      {showLevelSelect && (
        <LevelSelectModal
          maxUnlockedLevel={maxUnlockedLevel}
          onSelectLevel={handleSelectLevel}
          onClose={() => setShowLevelSelect(false)}
          collectedShards={collectedShards}
        />
      )}

      {/* Level Clear / Victory Modal */}
      {gameState === 'level_clear' && (
        <LevelClearModal
          level={currentLevelConfig}
          pearlsGained={50 + currentLevelNumber * 15}
          soulsGained={currentLevelConfig.hasBoss ? 1 : 0}
          onNextLevel={handleNextLevel}
          onOpenUpgrades={() => setShowUpgrades(true)}
        />
      )}

      {/* Game Over / Abyss Death Modal */}
      {gameState === 'game_over' && (
        <GameOverModal
          levelNumber={currentLevelNumber}
          onRetry={handleRetry}
          onOpenUpgrades={() => setShowUpgrades(true)}
        />
      )}

      {/* Grand Ending Screen (Revenge vs Mercy Choice) */}
      {gameState === 'ending' && (
        <EndingScreen
          onRestart={() => {
            setGameState('title');
            setCurrentLevelNumber(1);
          }}
        />
      )}

      {/* Pause Screen Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-6">
          <div className="max-w-xs w-full bg-[#031526] border border-cyan-500/40 rounded-2xl p-6 text-center">
            <h2 className="text-2xl font-bold font-serif text-cyan-300 mb-4">GAME PAUSED</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={handlePauseToggle}
                className="py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition cursor-pointer"
              >
                RESUME
              </button>
              <button
                onClick={() => {
                  handlePauseToggle();
                  setShowUpgrades(true);
                }}
                className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-sm font-semibold transition cursor-pointer"
              >
                Upgrades & Skills
              </button>
              <button
                onClick={() => {
                  handlePauseToggle();
                  setGameState('title');
                }}
                className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-sm transition cursor-pointer"
              >
                Return to Title
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
