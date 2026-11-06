import { LevelConfig, CutsceneData } from '../types/game';

export interface ChapterMeta {
  chapterNumber: number;
  title: string;
  subtitle: string;
  levelRange: [number, number];
  zoneName: string;
  bossName: string;
  unlockedPower: string;
  themeColor: string;
}

export const CHAPTERS_DATA: ChapterMeta[] = [
  {
    chapterNumber: 1,
    title: 'The Sunken Prison',
    subtitle: 'Betrayal in the Abyss & King Thalor’s Pact',
    levelRange: [1, 10],
    zoneName: 'Coral Catacombs',
    bossName: 'The Warden (Stone Golem Crab)',
    unlockedPower: 'Tidal Fist',
    themeColor: '#00b4d8',
  },
  {
    chapterNumber: 2,
    title: 'The Coral Kingdom',
    subtitle: 'Ruined Splendor & Brotherly Treachery',
    levelRange: [11, 20],
    zoneName: 'Submerged Spires',
    bossName: 'Ronan, The Shark Knight',
    unlockedPower: 'Aqua Dash',
    themeColor: '#48cae4',
  },
  {
    chapterNumber: 3,
    title: 'The Storm Abyss',
    subtitle: 'Vortices of Lightning & Siren Song',
    levelRange: [21, 30],
    zoneName: 'Tempest Trench',
    bossName: 'Lira, The Siren Queen',
    unlockedPower: 'Trident Summon',
    themeColor: '#9d4edd',
  },
  {
    chapterNumber: 4,
    title: 'The Witch’s Throne',
    subtitle: 'Black Coral Necropolis & Elder Varun’s Sin',
    levelRange: [31, 40],
    zoneName: 'Bone Spire Palace',
    bossName: 'Elder Varun, Sea Warlock',
    unlockedPower: 'Leviathan Roar',
    themeColor: '#d90429',
  },
  {
    chapterNumber: 5,
    title: 'The War for the 7 Seas',
    subtitle: 'Ascension of the First Human Water King',
    levelRange: [41, 50],
    zoneName: 'Abyssal Throne & Open Maelstrom',
    bossName: 'Morgana, The Sea Witch (3 Phases)',
    unlockedPower: 'WATER KING MODE',
    themeColor: '#00ffff',
  },
];

// 10 Secret Trident Shard Locations
export const SHARD_LEVELS = new Set([3, 8, 14, 19, 24, 29, 34, 38, 44, 48]);

// Generate configuration for all 50 levels
export function generateLevels(): LevelConfig[] {
  const levels: LevelConfig[] = [];

  for (let lv = 1; lv <= 50; lv++) {
    const chapterNum = lv <= 10 ? 1 : lv <= 20 ? 2 : lv <= 30 ? 3 : lv <= 40 ? 4 : 5;
    const isBossLevel = lv === 10 || lv === 20 || lv === 30 || lv === 40 || lv === 49 || lv === 50;
    const hasShard = SHARD_LEVELS.has(lv);

    let bossType: LevelConfig['bossType'] = undefined;
    if (lv === 10) bossType = 'warden';
    else if (lv === 20) bossType = 'ronan';
    else if (lv === 30) bossType = 'lira';
    else if (lv === 40) bossType = 'varun';
    else if (lv === 49) bossType = 'sea_lords';
    else if (lv === 50) bossType = 'morgana';

    let zoneName = 'Coral Catacombs';
    let ambientColor = 0x051b2c;
    let fogColor = 0x03111f;
    let fogDensity = 0.035;

    if (chapterNum === 2) {
      zoneName = 'Coral Kingdom Ruins';
      ambientColor = 0x073b4c;
      fogColor = 0x04212c;
      fogDensity = 0.032;
    } else if (chapterNum === 3) {
      zoneName = 'Storm Abyss & Maelstrom';
      ambientColor = 0x1d1135;
      fogColor = 0x0f091c;
      fogDensity = 0.04;
    } else if (chapterNum === 4) {
      zoneName = 'Witch’s Bone Spire';
      ambientColor = 0x220912;
      fogColor = 0x14030a;
      fogDensity = 0.045;
    } else if (chapterNum === 5) {
      zoneName = 'The 7 Oceanic Fronts';
      ambientColor = 0x0a192f;
      fogColor = 0x020c1b;
      fogDensity = 0.038;
    }

    const title = isBossLevel
      ? lv === 50
        ? 'Level 50: The Final Reckoning — Morgana'
        : lv === 49
        ? 'Level 49: The 7 Sea Lords Gauntlet'
        : `Level ${lv}: Chapter ${chapterNum} Climax Boss`
      : `Level ${lv}: ${zoneName} - Depths ${lv * 180}m`;

    levels.push({
      levelNumber: lv,
      chapterNumber: chapterNum,
      title,
      zoneName,
      description: isBossLevel
        ? `Defeat the Chapter Lord to claim their Coral Soul and proceed!`
        : `Cleanse the zone of sea monsters (${4 + Math.floor(lv * 0.4)} beasts) and gather tide pearls!`,
      goal: isBossLevel ? `Slay the Chapter Boss!` : `Defeat all monsters & reach the Abyssal Gate`,
      requiredEnemies: isBossLevel ? 1 : Math.min(12, 4 + Math.floor(lv * 0.35)),
      hasBoss: isBossLevel,
      bossType,
      hasShard,
      ambientColor,
      fogColor,
      fogDensity,
    });
  }

  return levels;
}

// Lore Dialogues for key narrative moments
export const CUTSCENES: Record<string, CutsceneData> = {
  prologue: {
    id: 'prologue',
    title: 'Chapter 0: The Betrayal at Tidefall',
    lines: [
      {
        speaker: 'Elder Varun',
        text: 'The tempest will tear our village to kindling! The Sea Witch demands a blood sacrifice to spare Tidefall.',
      },
      {
        speaker: 'Kael',
        text: 'Varun! Ronan! Lira! What are you doing?! We can reinforce the sea walls together!',
      },
      {
        speaker: 'Ronan',
        text: 'Save your breath, little brother. You were born with zero water magic. A useless fisherman’s boy. At least as bait, your life buys our survival.',
      },
      {
        speaker: 'Lira',
        text: 'Don’t look at me like that, Kael... Morgana promised to teach me the true song of the sirens. I can’t die in this dirt village.',
      },
      {
        speaker: 'Narrator',
        text: 'They cast Kael into the bottomless Abyss Trench. Down through the crushing black depths, past the point where human lungs should burst...',
      },
      {
        speaker: 'King Thalor',
        text: 'A human boy... yet you breathe the saltwater? Ah. The blood seal Morgana bound me in cannot detect you, for you possess no magic trace!',
      },
      {
        speaker: 'Kael',
        text: 'Who... who are you? An old mermaid in chains?',
      },
      {
        speaker: 'King Thalor',
        text: 'I was the ruler of all seven oceans until Morgana’s treachery sealed me in this coral tomb. Cut this seal with your mortal blood, and I swear an oath: I will give you revenge, and make you the first Human Water King.',
      },
      {
        speaker: 'Kael',
        text: 'Give me your power, Old King. Tidefall cast me away to drown. I will return as the tide itself.',
      },
    ],
  },
  chapter1_boss_defeat: {
    id: 'chapter1_boss_defeat',
    title: 'Chapter 1: The Warden Falls',
    lines: [
      {
        speaker: 'King Thalor',
        text: 'Well struck, Kael! The Warden was once my royal guard, corrupted by Morgana’s dark ichor.',
      },
      {
        speaker: 'Kael',
        text: 'The sea... I can feel it rushing through my knuckles. Tidal Fist!',
      },
      {
        speaker: 'King Thalor',
        text: 'You have claimed your first Coral Soul. Beyond this trench lies the Coral Kingdom... but steel your heart, boy. Your brother Ronan commands its outer gates.',
      },
    ],
  },
  chapter2_boss_start: {
    id: 'chapter2_boss_start',
    title: 'Chapter 2: Face to Face with Ronan',
    lines: [
      {
        speaker: 'Ronan',
        text: 'You?! You survived the trench?! Impossible! No human survives a drop into the abyss!',
      },
      {
        speaker: 'Kael',
        text: 'Look at you, Ronan. You sold your humanity to become a monster in shark scales. Did mother know what you’d do to me?',
      },
      {
        speaker: 'Ronan',
        text: 'Mother is dead, Kael! The weak die! Morgana gave me fangs, power, authority! You were always an embarrassment. Let me finish what I started at the cliff!',
      },
    ],
  },
  chapter2_boss_defeat: {
    id: 'chapter2_boss_defeat',
    title: 'Chapter 2: The Fallen Shark Knight',
    lines: [
      {
        speaker: 'Ronan',
        text: 'Cough... how can your water strike hit harder than steel? You had no magic...',
      },
      {
        speaker: 'Kael',
        text: 'The ocean doesn’t bend to pride, brother. It flows where it wills.',
      },
      {
        speaker: 'King Thalor',
        text: 'His corruption is deep, Kael. We must press into the Storm Abyss before Lira finishes weaving her siren song across the fleet.',
      },
    ],
  },
  chapter3_boss_start: {
    id: 'chapter3_boss_start',
    title: 'Chapter 3: Lira’s Siren Song',
    lines: [
      {
        speaker: 'Lira',
        text: 'Kael... you came for me? Listen to my voice... let the currents cradle you. Why fight? Morgana’s peace is so quiet...',
      },
      {
        speaker: 'Kael',
        text: 'Snap out of it, Lira! You used to weave pearl necklaces on the harbor docks. Now your song lures ships into whirlpools!',
      },
      {
        speaker: 'Lira',
        text: 'Those harbor docks smelled of rot and poverty! Down here, I am a Queen! Kneel to me or drown in my vortex!',
      },
    ],
  },
  chapter4_boss_start: {
    id: 'chapter4_boss_start',
    title: 'Chapter 4: Elder Varun’s Treachery',
    lines: [
      {
        speaker: 'Elder Varun',
        text: 'Hehehe... the sacrificial lamb returns as a wolf. How delightfully tragic.',
      },
      {
        speaker: 'Kael',
        text: 'Elder Varun. You told the village the gods demanded my blood. It was never the storm gods, was it? You bargained my life for Morgana’s dark warlock draught!',
      },
      {
        speaker: 'Elder Varun',
        text: 'A mortal life lasts sixty bitter winters. But Morgana offered five hundred years of youth and dark tides! A leader must sacrifice for the greater good—namely, myself!',
      },
      {
        speaker: 'King Thalor',
        text: 'He is hollowed out by greed. Unleash the Leviathan Roar, Kael! Cleanse this warlock from my halls!',
      },
    ],
  },
  chapter5_morgana_start: {
    id: 'chapter5_morgana_start',
    title: 'Level 50: Morgana, The Sea Witch',
    lines: [
      {
        speaker: 'Morgana',
        text: 'Look at the little surface rat... strutting in royal armor, holding Thalor’s trinkets. You think because water ripples at your call, you are King?',
      },
      {
        speaker: 'Kael',
        text: 'You poisoned the 7 seas, turned brother against brother, and locked away the true ruler. Today, the tide turns against you.',
      },
      {
        speaker: 'Morgana',
        text: 'Foolish boy. The ocean is not your friend. The ocean is an abyss of hunger—and I am its maw!',
      },
    ],
  },
  morgana_phase3_start: {
    id: 'morgana_phase3_start',
    title: 'Phase 3: The Spirit of Thalor Corrupted',
    lines: [
      {
        speaker: 'Morgana',
        text: 'If my serpent flesh fails, I shall take what you love most! Come to me, old Thalor... your soul is mine!',
      },
      {
        speaker: 'King Thalor',
        text: 'Ghh... Kael! Resist... she is taking my spectral form! Do not hesitate... strike me down if you must!',
      },
      {
        speaker: 'Kael',
        text: 'I will not kill my master! I will tear her dark corruption straight out of your soul!',
      },
    ],
  },
  ending_choice: {
    id: 'ending_choice',
    title: 'The Destiny of the Water King',
    lines: [
      {
        speaker: 'Narrator',
        text: 'Morgana disintegrates into black foam. Ronan, Lira, and Varun lie kneeling in chains before the throne, trembling in terror. King Thalor’s crown hovers before Kael.',
      },
      {
        speaker: 'King Thalor',
        text: 'The war is won. You are the first Human Water King. But a king is defined not by how he takes power, but how he wields it. What will you do with those who threw you into the abyss?',
      },
    ],
  },
};
