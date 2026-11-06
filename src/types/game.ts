export type MagicType = 'tidal_fist' | 'aqua_dash' | 'trident_summon' | 'leviathan_roar' | 'water_king_mode';

export type ElementalType = 'none' | 'fire' | 'ice' | 'poison';

export interface PlayerStats {
  level: number;
  hp: number;
  maxHp: number;
  tideEnergy: number;
  maxTideEnergy: number;
  attackPower: number;
  pearls: number;
  coralSouls: number;
  tridentShards: number;
  unlockedSkills: Record<MagicType, boolean>;
  skillTiers: Record<MagicType, number>;
  waterKingTimer: number; // God mode duration countdown
  inWaterKingMode: boolean;
  isBlocking: boolean;
  dashCooldown: number;
  skillCooldowns: Record<MagicType, number>;
  unlockedSecretWeapon: boolean;
}

export interface Enemy {
  id: string;
  name: string;
  type: 'cave_eel' | 'prison_crab' | 'corrupted_mermaid' | 'siren_archer' | 'storm_serpent' | 'electric_jelly' | 'witch_guard' | 'blood_shark' | 'dark_mage' | 'elite_guardian';
  maxHp: number;
  hp: number;
  attack: number;
  speed: number;
  radius: number;
  elementalShield: ElementalType;
  shieldHp: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  attackCooldown: number;
  isRaging: boolean;
  targetKael: boolean;
  meshIndex?: number;
}

export interface BossData {
  name: string;
  title: string;
  chapter: number;
  level: number;
  phase: number;
  maxPhase: number;
  maxHp: number;
  hp: number;
  attack: number;
  speed: number;
  x: number;
  y: number;
  z: number;
  abilities: string[];
  currentAbility: string;
  abilityTimer: number;
  isRaging: boolean;
  dialogueEncounter: string;
  dialogueDefeat: string;
}

export interface Projectile {
  id: string;
  fromPlayer: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  damage: number;
  element: ElementalType;
  lifetime: number;
  color: string;
  type: 'water_bolt' | 'trident' | 'dragon_blast' | 'witch_orb' | 'lightning_jolt' | 'shark_wave';
}

export interface BubblePickup {
  id: string;
  type: 'tide_bubble' | 'pearl' | 'coral_soul' | 'trident_shard';
  value: number;
  x: number;
  y: number;
  z: number;
  lifetime: number;
}

export interface WhirlpoolHazard {
  id: string;
  x: number;
  z: number;
  radius: number;
  pullForce: number;
  damage: number;
  duration: number;
}

export interface LevelConfig {
  levelNumber: number;
  chapterNumber: number;
  title: string;
  zoneName: string;
  description: string;
  goal: string;
  requiredEnemies: number;
  hasBoss: boolean;
  bossType?: 'warden' | 'ronan' | 'lira' | 'varun' | 'sea_lords' | 'morgana';
  hasShard: boolean;
  ambientColor: number;
  fogColor: number;
  fogDensity: number;
}

export interface DialogueLine {
  speaker: 'Kael' | 'King Thalor' | 'Ronan' | 'Lira' | 'Elder Varun' | 'Morgana' | 'Narrator';
  text: string;
  emotion?: 'neutral' | 'angry' | 'shocked' | 'sorrow' | 'triumphant' | 'regal';
}

export interface CutsceneData {
  id: string;
  title: string;
  lines: DialogueLine[];
  onComplete?: () => void;
}
