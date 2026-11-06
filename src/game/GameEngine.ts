import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  PlayerStats,
  Enemy,
  BossData,
  Projectile,
  BubblePickup,
  WhirlpoolHazard,
  LevelConfig,
  MagicType,
} from '../types/game';
import {
  createKaelModel,
  createThalorModel,
  createWardenBossModel,
  createRonanBossModel,
  createLiraBossModel,
  createVarunBossModel,
  createMorganaPhase1Model,
  createMorganaPhase2Model,
  createCaveEelModel,
  createPrisonCrabModel,
  createElectricJellyModel,
  createCoralProp,
  createSunkenPillarProp,
  createTridentShardProp,
} from './proceduralModels';
import {
  createCausticsTexture,
  createGlowBubbleTexture,
  createRuneCircleTexture,
} from './textures';
import { sounds } from '../audio/SoundEffects';

// Preallocated math helpers to ensure zero GC in render loop
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3C = new THREE.Vector3();

export interface GameEngineCallbacks {
  onStatsChange: (stats: PlayerStats) => void;
  onBossChange: (boss: BossData | null) => void;
  onEnemiesChange: (killed: number, total: number) => void;
  onLevelComplete: () => void;
  onPlayerDeath: () => void;
  onTriggerCutscene: (id: string) => void;
  onShardCollected: (level: number) => void;
}

export class GameEngine {
  public container: HTMLElement;
  public callbacks: GameEngineCallbacks;

  // Three.js Core
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private isSoftwareGl: boolean = false;
  private animFrameId: number = 0;
  private lastTime: number = 0;

  // Scene Objects
  private playerGroup: THREE.Group | null = null;
  private thalorGroup: THREE.Group | null = null;
  private bossGroup: THREE.Group | null = null;
  private enemyMeshes: Map<string, THREE.Group> = new Map();
  private pickupMeshes: Map<string, THREE.Group> = new Map();
  private projectileMeshes: Map<string, THREE.Group> = new Map();
  private shardMesh: THREE.Group | null = null;
  private waterShieldMesh: THREE.Mesh | null = null;
  private whirlpoolMeshes: Map<string, THREE.Group> = new Map();

  // Caustics & Environment
  private seaFloorMesh: THREE.Mesh | null = null;
  private bubbleParticles: THREE.Points | null = null;
  private bubblePositions: Float32Array | null = null;

  // Game State
  public stats: PlayerStats;
  public currentLevel: LevelConfig | null = null;
  public enemies: Enemy[] = [];
  public boss: BossData | null = null;
  public projectiles: Projectile[] = [];
  public pickups: BubblePickup[] = [];
  public whirlpools: WhirlpoolHazard[] = [];
  public killedEnemiesCount: number = 0;
  public isPaused: boolean = false;
  public isRunning: boolean = false;

  // Player Kinematics
  public playerPos: THREE.Vector3 = new THREE.Vector3(0, 1.5, 0);
  public playerVel: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public playerRotY: number = 0;
  private cameraOffset: THREE.Vector3 = new THREE.Vector3(0, 2.2, 5.5);

  // Input states
  public keysHeld: Record<string, boolean> = {};
  public mouseLook = { yaw: 0, pitch: 0 };
  private isPointerLocked: boolean = false;
  private comboStep: number = 1;
  private comboResetTimer: number = 0;

  constructor(container: HTMLElement, initialStats: PlayerStats, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.stats = { ...initialStats };
    this.callbacks = callbacks;
    this.lastTime = performance.now();

    // 1. Detect software WebGL
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    // 2. Initialize Three.js Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
      0.1,
      250
    );

    // 4. Studio Environment
    try {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch {
      // Fallback
    }

    // 5. Lighting Setup
    this.setupLighting();

    // 6. Bind inputs
    this.bindInputs();

    // 7. Window resize observer
    window.addEventListener('resize', this.onWindowResize);
  }

  private setupLighting() {
    // Ambient oceanic radiance
    const ambientLight = new THREE.AmbientLight(0x133852, 1.8);
    this.scene.add(ambientLight);

    // Key sunlight filtering from ocean surface
    const keyLight = new THREE.DirectionalLight(0x70e2ff, 3.0);
    keyLight.position.set(12, 40, 18);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    // Rich aquatic rim fill
    const hemiLight = new THREE.HemisphereLight(0x00b4d8, 0x051d2f, 1.8);
    this.scene.add(hemiLight);
  }

  public setStats(newStats: PlayerStats) {
    this.stats = { ...newStats };
  }

  // ----------------------------------------------------
  // Level Initialization
  // ----------------------------------------------------
  public startLevel(config: LevelConfig) {
    this.currentLevel = config;
    this.killedEnemiesCount = 0;
    this.projectiles = [];
    this.pickups = [];
    this.whirlpools = [];
    this.enemies = [];
    this.boss = null;

    // Reset player position
    this.playerPos.set(0, 2, 0);
    this.playerVel.set(0, 0, 0);

    // Clear previous entities from scene
    this.clearSceneDynamicEntities();

    // Scene fog based on chapter
    this.scene.background = new THREE.Color(config.fogColor);
    this.scene.fog = new THREE.FogExp2(config.fogColor, config.fogDensity);

    // Build underwater floor & props
    this.buildSeafloor();
    this.buildEnvironmentProps(config);
    this.buildBubbleParticleSystem();

    // Spawn Kael & Thalor
    this.spawnKael();
    this.spawnThalor();

    // Spawn Shard if present
    if (config.hasShard && !this.stats.unlockedSecretWeapon) {
      this.spawnTridentShard();
    }

    // Spawn Boss or regular waves
    if (config.hasBoss && config.bossType) {
      this.spawnBoss(config.bossType, config.levelNumber);
      sounds.playBossSting();
      this.callbacks.onBossChange(this.boss);
    } else {
      this.spawnEnemyWave(config.requiredEnemies, config.chapterNumber, config.levelNumber);
      this.callbacks.onBossChange(null);
    }

    this.callbacks.onEnemiesChange(0, config.requiredEnemies);
    this.callbacks.onStatsChange(this.stats);

    // Trigger narrative cutscene if first level of chapter or boss level
    if (config.levelNumber === 1) {
      this.callbacks.onTriggerCutscene('prologue');
    } else if (config.levelNumber === 20) {
      this.callbacks.onTriggerCutscene('chapter2_boss_start');
    } else if (config.levelNumber === 30) {
      this.callbacks.onTriggerCutscene('chapter3_boss_start');
    } else if (config.levelNumber === 40) {
      this.callbacks.onTriggerCutscene('chapter4_boss_start');
    } else if (config.levelNumber === 50) {
      this.callbacks.onTriggerCutscene('chapter5_morgana_start');
    }

    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.tick();
    }
  }

  private clearSceneDynamicEntities() {
    this.enemyMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.enemyMeshes.clear();

    this.pickupMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.pickupMeshes.clear();

    this.projectileMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.projectileMeshes.clear();

    this.whirlpoolMeshes.forEach((mesh) => this.scene.remove(mesh));
    this.whirlpoolMeshes.clear();

    if (this.bossGroup) {
      this.scene.remove(this.bossGroup);
      this.bossGroup = null;
    }
    if (this.shardMesh) {
      this.scene.remove(this.shardMesh);
      this.shardMesh = null;
    }
  }

  private buildSeafloor() {
    if (this.seaFloorMesh) {
      this.scene.remove(this.seaFloorMesh);
    }
    const causticsTex = createCausticsTexture(512);
    const floorGeo = new THREE.PlaneGeometry(160, 160, 16, 16);
    floorGeo.rotateX(-Math.PI / 2);

    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x051b2c,
      roughness: 0.85,
      metalness: 0.15,
      map: causticsTex,
    });

    this.seaFloorMesh = new THREE.Mesh(floorGeo, floorMat);
    this.seaFloorMesh.position.y = 0;
    this.seaFloorMesh.receiveShadow = !this.isSoftwareGl;
    this.scene.add(this.seaFloorMesh);
  }

  private buildEnvironmentProps(config: LevelConfig) {
    // Corals and ancient ruins placed organically
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2 + Math.random() * 0.2;
      const dist = 18 + Math.random() * 45;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      if (i % 3 === 0) {
        const pillar = createSunkenPillarProp();
        pillar.position.set(x, 0, z);
        pillar.rotation.y = Math.random() * Math.PI;
        this.scene.add(pillar);
      } else {
        const coral = createCoralProp(i);
        coral.position.set(x, 0, z);
        coral.rotation.y = Math.random() * Math.PI;
        coral.scale.setScalar(0.8 + Math.random() * 0.8);
        this.scene.add(coral);
      }
    }
  }

  private buildBubbleParticleSystem() {
    if (this.bubbleParticles) {
      this.scene.remove(this.bubbleParticles);
    }
    const bubbleCount = 200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(bubbleCount * 3);

    for (let i = 0; i < bubbleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 1] = Math.random() * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.bubblePositions = positions;

    const bubbleTex = createGlowBubbleTexture('#48cae4', '#ffffff', 64);
    const mat = new THREE.PointsMaterial({
      size: 0.6,
      map: bubbleTex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.bubbleParticles = new THREE.Points(geo, mat);
    this.scene.add(this.bubbleParticles);
  }

  private spawnKael() {
    if (this.playerGroup) {
      this.scene.remove(this.playerGroup);
    }
    this.playerGroup = createKaelModel(this.stats.level, this.stats.inWaterKingMode);
    this.playerGroup.position.copy(this.playerPos);
    this.scene.add(this.playerGroup);

    // Water shield mesh attached to Kael
    const shieldGeo = new THREE.SphereGeometry(1.4, 16, 16);
    const runeTex = createRuneCircleTexture(256);
    const shieldMat = new THREE.MeshBasicMaterial({
      map: runeTex,
      transparent: true,
      opacity: 0.0,
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.waterShieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.waterShieldMesh.position.y = 1.2;
    this.playerGroup.add(this.waterShieldMesh);
  }

  private spawnThalor() {
    if (this.thalorGroup) {
      this.scene.remove(this.thalorGroup);
    }
    this.thalorGroup = createThalorModel();
    this.thalorGroup.position.set(-1.8, 2.5, -1.0);
    this.scene.add(this.thalorGroup);
  }

  private spawnTridentShard() {
    this.shardMesh = createTridentShardProp();
    // Placed in a notable alcove
    this.shardMesh.position.set(12, 1.8, -14);
    this.scene.add(this.shardMesh);
  }

  private spawnEnemyWave(count: number, chapter: number, level: number) {
    this.enemies = [];
    for (let i = 0; i < count; i++) {
      const id = `enemy_${i}_${Date.now()}`;
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 14 + Math.random() * 20;

      let type: Enemy['type'] = 'prison_crab';
      let maxHp = 40 + level * 8;
      let attack = 8 + level * 2;
      let speed = 2.8 + Math.random() * 0.8;
      let mesh: THREE.Group;

      if (chapter === 1) {
        if (i % 2 === 0) {
          type = 'cave_eel';
          mesh = createCaveEelModel();
          speed = 3.6;
        } else {
          type = 'prison_crab';
          mesh = createPrisonCrabModel();
          speed = 2.2;
        }
      } else if (chapter === 2) {
        type = 'corrupted_mermaid';
        mesh = createCaveEelModel();
        maxHp *= 1.3;
        speed = 4.0;
      } else if (chapter === 3) {
        type = 'electric_jelly';
        mesh = createElectricJellyModel();
        maxHp *= 1.5;
        speed = 2.4;
      } else {
        type = 'blood_shark';
        mesh = createCaveEelModel();
        maxHp *= 1.8;
        attack *= 1.5;
        speed = 4.2;
      }

      // Elemental Shield for Chapter 5
      const elementalShield = chapter === 5 ? (i % 3 === 0 ? 'fire' : i % 3 === 1 ? 'ice' : 'poison') : 'none';

      const enemy: Enemy = {
        id,
        name: type.replace('_', ' ').toUpperCase(),
        type,
        maxHp,
        hp: maxHp,
        attack,
        speed,
        radius: 1.2,
        elementalShield,
        shieldHp: elementalShield !== 'none' ? 50 : 0,
        x: Math.cos(angle) * dist,
        y: 1.2 + Math.random() * 3,
        z: Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        vz: 0,
        attackCooldown: 1.0 + Math.random() * 2,
        isRaging: false,
        targetKael: true,
      };

      mesh.position.set(enemy.x, enemy.y, enemy.z);
      this.scene.add(mesh);
      this.enemyMeshes.set(id, mesh);
      this.enemies.push(enemy);
    }
  }

  private spawnBoss(bossType: NonNullable<LevelConfig['bossType']>, level: number) {
    let name = 'The Warden';
    let title = 'Corrupted Stone Crab';
    let maxHp = 450;
    let attack = 22;
    let mesh: THREE.Group;
    let abilities = ['Ground Quake', 'Crushing Pincer'];

    if (bossType === 'warden') {
      name = 'The Warden';
      title = 'Ancient Guardian of the Sunken Prison';
      maxHp = 500;
      attack = 25;
      mesh = createWardenBossModel();
      abilities = ['Stone Quake', 'Crystal Spike Volley'];
    } else if (bossType === 'ronan') {
      name = 'Ronan';
      title = 'The Shark Knight (Traitor Brother)';
      maxHp = 950;
      attack = 35;
      mesh = createRonanBossModel();
      abilities = ['Shark Dash', 'Tidal Wave Slash'];
    } else if (bossType === 'lira') {
      name = 'Lira';
      title = 'The Siren Queen (Traitor Ex-Friend)';
      maxHp = 1500;
      attack = 42;
      mesh = createLiraBossModel();
      abilities = ['Siren Song', 'Maelstrom Vortex', 'Hydro Drain'];
    } else if (bossType === 'varun') {
      name = 'Elder Varun';
      title = 'Sea Warlock of Blood Pacts';
      maxHp = 2200;
      attack = 55;
      mesh = createVarunBossModel();
      abilities = ['Blood Orb Barrage', 'Dark Ruin Seal', 'Soul Drain'];
    } else if (bossType === 'sea_lords') {
      name = 'Morgana’s 7 Sea Lords';
      title = 'Dread Champions Gauntlet';
      maxHp = 3200;
      attack = 65;
      mesh = createRonanBossModel();
      abilities = ['Triple Dash', 'Vortex Surge', 'Blood Storm'];
    } else {
      // Morgana Final Boss Lv 50
      name = 'Morgana';
      title = 'The Sea Witch — Sovereign of the Abyss';
      maxHp = 4500;
      attack = 75;
      mesh = createMorganaPhase1Model();
      abilities = ['Abyssal Tentacles', 'Dark Sorcery Orbs', 'Whirlpool Cataclysm'];
    }

    this.boss = {
      name,
      title,
      chapter: this.currentLevel?.chapterNumber || 1,
      level,
      phase: 1,
      maxPhase: bossType === 'morgana' ? 3 : 1,
      maxHp,
      hp: maxHp,
      attack,
      speed: 3.5,
      x: 0,
      y: 1.8,
      z: -18,
      abilities,
      currentAbility: 'Approaching...',
      abilityTimer: 3.0,
      isRaging: false,
      dialogueEncounter: '',
      dialogueDefeat: '',
    };

    mesh.position.set(this.boss.x, this.boss.y, this.boss.z);
    this.scene.add(mesh);
    this.bossGroup = mesh;
  }

  // ----------------------------------------------------
  // Combat Actions (Triggered by HUD or Keyboard)
  // ----------------------------------------------------
  public performTidalFist() {
    if (this.stats.hp <= 0) return;

    sounds.playTidalFist(this.comboStep);
    this.comboStep = (this.comboStep % 3) + 1;
    this.comboResetTimer = 1.2;

    // Forward punch shockwave
    const punchDmg = this.stats.attackPower * (this.stats.inWaterKingMode ? 2.5 : 1.2);
    const forward = _vec3A.set(0, 0, -1).applyAxisAngle(_vec3B.set(0, 1, 0), this.playerRotY);

    // Spawn hydro fist projectile
    this.spawnProjectile({
      fromPlayer: true,
      x: this.playerPos.x + forward.x * 1.0,
      y: this.playerPos.y + 0.8,
      z: this.playerPos.z + forward.z * 1.0,
      vx: forward.x * 16,
      vy: 0,
      vz: forward.z * 16,
      radius: 1.0,
      damage: punchDmg,
      element: 'none',
      lifetime: 1.2,
      color: '#00f0ff',
      type: 'water_bolt',
    });

    // Animate Kael's right arm
    if (this.playerGroup) {
      const arm = this.playerGroup.children.find((c) => c.position.x > 0.4);
      if (arm) {
        arm.rotation.x = -Math.PI * 0.45;
        setTimeout(() => {
          arm.rotation.x = 0;
        }, 180);
      }
    }
  }

  public performAquaDash() {
    if (!this.stats.unlockedSkills.aqua_dash || this.stats.dashCooldown > 0) return;
    if (this.stats.tideEnergy < 15 && !this.stats.inWaterKingMode) return;

    if (!this.stats.inWaterKingMode) {
      this.stats.tideEnergy = Math.max(0, this.stats.tideEnergy - 15);
    }
    this.stats.dashCooldown = 2.5 - this.stats.skillTiers.aqua_dash * 0.3;
    sounds.playAquaDash();

    // Dash forward high speed
    const forward = _vec3A.set(0, 0, -1).applyAxisAngle(_vec3B.set(0, 1, 0), this.playerRotY);
    this.playerVel.addScaledVector(forward, 22);

    // Burst water particles & damage enemies in dash line
    this.enemies.forEach((enemy) => {
      const dist = Math.hypot(enemy.x - this.playerPos.x, enemy.z - this.playerPos.z);
      if (dist < 3.5) {
        this.damageEnemy(enemy, this.stats.attackPower * 1.5);
      }
    });

    this.callbacks.onStatsChange(this.stats);
  }

  public performTridentSummon() {
    if (!this.stats.unlockedSkills.trident_summon || this.stats.skillCooldowns.trident_summon > 0) return;
    if (this.stats.tideEnergy < 25 && !this.stats.inWaterKingMode) return;

    if (!this.stats.inWaterKingMode) {
      this.stats.tideEnergy = Math.max(0, this.stats.tideEnergy - 25);
    }
    this.stats.skillCooldowns.trident_summon = 4.0;
    sounds.playTridentSummon();

    const forward = _vec3A.set(0, 0, -1).applyAxisAngle(_vec3B.set(0, 1, 0), this.playerRotY);
    const tridentDmg = this.stats.attackPower * 2.8;

    // Launch heavy piercing Trident vortex
    this.spawnProjectile({
      fromPlayer: true,
      x: this.playerPos.x + forward.x * 1.2,
      y: this.playerPos.y + 1.0,
      z: this.playerPos.z + forward.z * 1.2,
      vx: forward.x * 22,
      vy: 0,
      vz: forward.z * 22,
      radius: 1.6,
      damage: tridentDmg,
      element: 'none',
      lifetime: 1.8,
      color: '#ffd700',
      type: 'trident',
    });

    this.callbacks.onStatsChange(this.stats);
  }

  public performLeviathanRoar() {
    if (!this.stats.unlockedSkills.leviathan_roar || this.stats.skillCooldowns.leviathan_roar > 0) return;
    if (this.stats.tideEnergy < 45 && !this.stats.inWaterKingMode) return;

    if (!this.stats.inWaterKingMode) {
      this.stats.tideEnergy = Math.max(0, this.stats.tideEnergy - 45);
    }
    this.stats.skillCooldowns.leviathan_roar = 8.0;
    sounds.playLeviathanRoar();

    // Screen-wide 360 AoE dragon burst
    const aoeRadius = 16;
    const aoeDmg = this.stats.attackPower * 4.0;

    this.enemies.forEach((enemy) => {
      const dist = Math.hypot(enemy.x - this.playerPos.x, enemy.z - this.playerPos.z);
      if (dist <= aoeRadius) {
        this.damageEnemy(enemy, aoeDmg);
      }
    });

    if (this.boss) {
      const dist = Math.hypot(this.boss.x - this.playerPos.x, this.boss.z - this.playerPos.z);
      if (dist <= aoeRadius) {
        this.damageBoss(aoeDmg);
      }
    }

    // Camera shake
    this.camera.position.y += 0.6;

    this.callbacks.onStatsChange(this.stats);
  }

  public performWaterKingMode() {
    if (!this.stats.unlockedSkills.water_king_mode || this.stats.skillCooldowns.water_king_mode > 0) return;
    if (this.stats.inWaterKingMode) return;

    this.stats.inWaterKingMode = true;
    this.stats.waterKingTimer = 30.0;
    this.stats.skillCooldowns.water_king_mode = 45.0;
    this.stats.hp = this.stats.maxHp;
    this.stats.tideEnergy = this.stats.maxTideEnergy;

    sounds.playWaterKingMode();

    // Rebuild Kael model with Water King Crown and radiant blue armor
    this.spawnKael();

    // Spawn accompanying protective whirlpool
    this.whirlpools.push({
      id: `king_vortex_${Date.now()}`,
      x: this.playerPos.x,
      z: this.playerPos.z,
      radius: 8.0,
      pullForce: 4.5,
      damage: this.stats.attackPower * 0.8,
      duration: 30.0,
    });

    this.callbacks.onStatsChange(this.stats);
  }

  public setBlocking(isBlocking: boolean) {
    if (this.stats.isBlocking === isBlocking) return;
    this.stats.isBlocking = isBlocking;
    if (this.waterShieldMesh) {
      (this.waterShieldMesh.material as THREE.MeshBasicMaterial).opacity = isBlocking ? 0.65 : 0.0;
    }
    if (isBlocking) {
      sounds.playBlockDeflect();
    }
    this.callbacks.onStatsChange(this.stats);
  }

  // ----------------------------------------------------
  // Projectile & Damage Mechanics
  // ----------------------------------------------------
  private spawnProjectile(params: Omit<Projectile, 'id'>) {
    const id = `proj_${Date.now()}_${Math.random()}`;
    const proj: Projectile = { ...params, id };
    this.projectiles.push(proj);

    // Create 3D representation
    const group = new THREE.Group();
    if (proj.type === 'trident') {
      const tri = createTridentShardProp();
      tri.rotation.x = Math.PI / 2;
      group.add(tri);
    } else {
      const geo = new THREE.SphereGeometry(proj.radius, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        color: proj.color,
        transparent: true,
        opacity: 0.85,
      });
      group.add(new THREE.Mesh(geo, mat));
    }

    group.position.set(proj.x, proj.y, proj.z);
    this.scene.add(group);
    this.projectileMeshes.set(id, group);
  }

  private damageEnemy(enemy: Enemy, amount: number) {
    // Check elemental shield
    if (enemy.shieldHp > 0) {
      enemy.shieldHp -= amount;
      if (enemy.shieldHp <= 0) {
        enemy.elementalShield = 'none';
      }
    } else {
      enemy.hp -= amount;
    }

    // Rage mode threshold at 30% HP
    if (enemy.hp <= enemy.maxHp * 0.3 && !enemy.isRaging) {
      enemy.isRaging = true;
      enemy.speed *= 1.4;
      enemy.attack *= 1.3;
    }

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  private killEnemy(enemy: Enemy) {
    const mesh = this.enemyMeshes.get(enemy.id);
    if (mesh) {
      this.scene.remove(mesh);
      this.enemyMeshes.delete(enemy.id);
    }

    this.enemies = this.enemies.filter((e) => e.id !== enemy.id);
    this.killedEnemiesCount++;
    this.callbacks.onEnemiesChange(this.killedEnemiesCount, this.currentLevel?.requiredEnemies || 10);

    // Drop Tide Energy Bubbles & Pearls
    this.spawnPickup('tide_bubble', 20, enemy.x, enemy.y, enemy.z);
    this.spawnPickup('pearl', 10 + Math.floor(Math.random() * 8), enemy.x + 0.5, enemy.y, enemy.z);

    // Check level complete
    if (this.currentLevel && !this.currentLevel.hasBoss) {
      if (this.killedEnemiesCount >= this.currentLevel.requiredEnemies) {
        sounds.playVictory();
        this.callbacks.onLevelComplete();
      }
    }
  }

  private damageBoss(amount: number) {
    if (!this.boss) return;
    this.boss.hp -= amount;

    // Boss Rage mode at 30% HP
    if (this.boss.hp <= this.boss.maxHp * 0.3 && !this.boss.isRaging) {
      this.boss.isRaging = true;
      this.boss.speed *= 1.35;
      this.boss.attack *= 1.3;
    }

    // Morgana Phase Transitions
    if (this.currentLevel?.bossType === 'morgana') {
      if (this.boss.phase === 1 && this.boss.hp <= (this.boss.maxHp * 2) / 3) {
        this.boss.phase = 2;
        this.callbacks.onTriggerCutscene('morgana_serpent_transition');
        if (this.bossGroup) this.scene.remove(this.bossGroup);
        this.bossGroup = createMorganaPhase2Model();
        this.bossGroup.position.set(this.boss.x, this.boss.y, this.boss.z);
        this.scene.add(this.bossGroup);
      } else if (this.boss.phase === 2 && this.boss.hp <= this.boss.maxHp / 3) {
        this.boss.phase = 3;
        this.callbacks.onTriggerCutscene('morgana_phase3_start');
        if (this.bossGroup) this.scene.remove(this.bossGroup);
        this.bossGroup = createThalorModel(); // Possessed Thalor
        this.bossGroup.position.set(this.boss.x, this.boss.y, this.boss.z);
        this.scene.add(this.bossGroup);
      }
    }

    if (this.boss.hp <= 0) {
      this.killBoss();
    } else {
      this.callbacks.onBossChange(this.boss);
    }
  }

  private killBoss() {
    if (!this.boss) return;

    if (this.bossGroup) {
      this.scene.remove(this.bossGroup);
      this.bossGroup = null;
    }

    // Drop massive loot (Coral Soul & Pearls)
    this.spawnPickup('coral_soul', 1, this.boss.x, this.boss.y + 1, this.boss.z);
    this.spawnPickup('pearl', 200, this.boss.x, this.boss.y, this.boss.z);

    this.boss = null;
    this.callbacks.onBossChange(null);
    sounds.playVictory();

    // Narrative defeat scenes
    if (this.currentLevel?.levelNumber === 10) {
      this.callbacks.onTriggerCutscene('chapter1_boss_defeat');
    } else if (this.currentLevel?.levelNumber === 20) {
      this.callbacks.onTriggerCutscene('chapter2_boss_defeat');
    } else if (this.currentLevel?.levelNumber === 50) {
      this.callbacks.onTriggerCutscene('ending_choice');
    } else {
      this.callbacks.onLevelComplete();
    }
  }

  private spawnPickup(type: BubblePickup['type'], value: number, x: number, y: number, z: number) {
    const id = `pickup_${Date.now()}_${Math.random()}`;
    const pickup: BubblePickup = {
      id,
      type,
      value,
      x,
      y: Math.max(0.8, y),
      z,
      lifetime: 25.0,
    };
    this.pickups.push(pickup);

    // 3D Visual Mesh
    const group = new THREE.Group();
    const color = type === 'coral_soul' ? 0xff007f : type === 'pearl' ? 0xffffff : 0x00f0ff;
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 8),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      })
    );
    group.add(mesh);
    group.position.set(x, y, z);
    this.scene.add(group);
    this.pickupMeshes.set(id, group);
  }

  // ----------------------------------------------------
  // Main Render & Physics Tick Loop
  // ----------------------------------------------------
  public tick = () => {
    if (!this.isRunning) return;

    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = Math.min(rawDt, 0.05);

    if (!this.isPaused) {
      this.updatePlayer(dt);
      this.updateThalor(dt);
      this.updateProjectiles(dt);
      this.updateEnemies(dt);
      this.updateBoss(dt);
      this.updatePickups(dt);
      this.updateWhirlpools(dt);
      this.updateEnvironment(dt);
      this.updateCamera(dt);
    }

    this.renderer.render(this.scene, this.camera);
    this.animFrameId = requestAnimationFrame(this.tick);
  };

  private updatePlayer(dt: number) {
    if (this.stats.hp <= 0) return;

    // Movement direction from keys
    const moveDir = _vec3A.set(0, 0, 0);

    if (this.keysHeld['KeyW'] || this.keysHeld['ArrowUp']) moveDir.z -= 1;
    if (this.keysHeld['KeyS'] || this.keysHeld['ArrowDown']) moveDir.z += 1;
    if (this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft']) moveDir.x -= 1;
    if (this.keysHeld['KeyD'] || this.keysHeld['ArrowRight']) moveDir.x += 1;

    // Vertical swim: Space = Ascend, Shift/KeyC = Dive
    if (this.keysHeld['Space']) moveDir.y += 1;
    if (this.keysHeld['ShiftLeft'] || this.keysHeld['ShiftRight'] || this.keysHeld['KeyC']) moveDir.y -= 1;

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      // Apply camera rotation
      moveDir.applyAxisAngle(_vec3B.set(0, 1, 0), this.playerRotY);

      const swimSpeed = this.stats.inWaterKingMode ? 14 : 8.5;
      this.playerVel.x = THREE.MathUtils.damp(this.playerVel.x, moveDir.x * swimSpeed, 8, dt);
      this.playerVel.y = THREE.MathUtils.damp(this.playerVel.y, moveDir.y * swimSpeed, 8, dt);
      this.playerVel.z = THREE.MathUtils.damp(this.playerVel.z, moveDir.z * swimSpeed, 8, dt);
    } else {
      // Hydrodynamic water drag
      this.playerVel.x = THREE.MathUtils.damp(this.playerVel.x, 0, 4, dt);
      this.playerVel.y = THREE.MathUtils.damp(this.playerVel.y, 0, 4, dt);
      this.playerVel.z = THREE.MathUtils.damp(this.playerVel.z, 0, 4, dt);
    }

    this.playerPos.addScaledVector(this.playerVel, dt);

    // Boundaries
    this.playerPos.y = Math.max(0.6, Math.min(22.0, this.playerPos.y));
    const maxBound = 70;
    this.playerPos.x = Math.max(-maxBound, Math.min(maxBound, this.playerPos.x));
    this.playerPos.z = Math.max(-maxBound, Math.min(maxBound, this.playerPos.z));

    if (this.playerGroup) {
      this.playerGroup.position.copy(this.playerPos);
      this.playerGroup.rotation.y = this.playerRotY;

      // Slight tilt when moving
      this.playerGroup.rotation.x = this.playerVel.z * 0.03;
      this.playerGroup.rotation.z = -this.playerVel.x * 0.03;
    }

    // Cooldown updates
    if (this.stats.dashCooldown > 0) {
      this.stats.dashCooldown = Math.max(0, this.stats.dashCooldown - dt);
    }
    (['tidal_fist', 'aqua_dash', 'trident_summon', 'leviathan_roar', 'water_king_mode'] as MagicType[]).forEach(
      (skill) => {
        if (this.stats.skillCooldowns[skill] > 0) {
          this.stats.skillCooldowns[skill] = Math.max(0, this.stats.skillCooldowns[skill] - dt);
        }
      }
    );

    // Water King Mode countdown
    if (this.stats.inWaterKingMode) {
      this.stats.waterKingTimer -= dt;
      if (this.stats.waterKingTimer <= 0) {
        this.stats.inWaterKingMode = false;
        this.spawnKael(); // Revert model
      }
    }

    // Combo timer
    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= dt;
      if (this.comboResetTimer <= 0) {
        this.comboStep = 1;
      }
    }

    // Secret Trident Shard collection check
    if (this.shardMesh && !this.stats.unlockedSecretWeapon) {
      const dist = this.playerPos.distanceTo(this.shardMesh.position);
      if (dist < 2.5) {
        this.scene.remove(this.shardMesh);
        this.shardMesh = null;
        this.stats.tridentShards += 1;
        sounds.playBubbleCollect(true);
        if (this.currentLevel) {
          this.callbacks.onShardCollected(this.currentLevel.levelNumber);
        }
        if (this.stats.tridentShards >= 10) {
          this.stats.unlockedSecretWeapon = true;
          this.stats.attackPower *= 1.5;
        }
        this.callbacks.onStatsChange(this.stats);
      }
    }
  }

  private updateThalor(dt: number) {
    if (!this.thalorGroup) return;

    // Floats gracefully over Kael's left shoulder
    const targetX = this.playerPos.x - Math.sin(this.playerRotY + 0.6) * 2.2;
    const targetZ = this.playerPos.z - Math.cos(this.playerRotY + 0.6) * 2.2;
    const targetY = this.playerPos.y + 0.8 + Math.sin(performance.now() * 0.002) * 0.25;

    this.thalorGroup.position.x = THREE.MathUtils.damp(this.thalorGroup.position.x, targetX, 5, dt);
    this.thalorGroup.position.y = THREE.MathUtils.damp(this.thalorGroup.position.y, targetY, 5, dt);
    this.thalorGroup.position.z = THREE.MathUtils.damp(this.thalorGroup.position.z, targetZ, 5, dt);

    this.thalorGroup.rotation.y = this.playerRotY + 0.3;
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.lifetime -= dt;

      const mesh = this.projectileMeshes.get(p.id);
      if (mesh) {
        mesh.position.set(p.x, p.y, p.z);
      }

      let hit = false;

      if (p.fromPlayer) {
        // Hit regular enemies
        for (const enemy of this.enemies) {
          const dist = Math.hypot(enemy.x - p.x, enemy.z - p.z);
          if (dist < enemy.radius + p.radius) {
            this.damageEnemy(enemy, p.damage);
            hit = true;
            break;
          }
        }

        // Hit boss
        if (!hit && this.boss) {
          const dist = Math.hypot(this.boss.x - p.x, this.boss.z - p.z);
          if (dist < 2.5 + p.radius) {
            this.damageBoss(p.damage);
            hit = true;
          }
        }
      } else {
        // Enemy projectile hitting Kael
        const dist = this.playerPos.distanceTo(_vec3A.set(p.x, p.y, p.z));
        if (dist < 1.4) {
          hit = true;
          if (this.stats.isBlocking) {
            sounds.playBlockDeflect();
          } else {
            this.stats.hp -= p.damage;
            sounds.playHurt();
            if (this.stats.hp <= 0) {
              this.stats.hp = 0;
              this.callbacks.onPlayerDeath();
            }
            this.callbacks.onStatsChange(this.stats);
          }
        }
      }

      if (p.lifetime <= 0 || hit) {
        if (mesh) {
          this.scene.remove(mesh);
          this.projectileMeshes.delete(p.id);
        }
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateEnemies(dt: number) {
    for (const enemy of this.enemies) {
      // AI: Move toward Kael
      const dx = this.playerPos.x - enemy.x;
      const dz = this.playerPos.z - enemy.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 1.8) {
        enemy.vx = (dx / dist) * enemy.speed;
        enemy.vz = (dz / dist) * enemy.speed;
        enemy.x += enemy.vx * dt;
        enemy.z += enemy.vz * dt;
      }

      // Attack Kael
      enemy.attackCooldown -= dt;
      if (dist < 2.2 && enemy.attackCooldown <= 0) {
        enemy.attackCooldown = 1.6;
        if (this.stats.isBlocking) {
          sounds.playBlockDeflect();
        } else {
          this.stats.hp -= enemy.attack;
          sounds.playHurt();
          if (this.stats.hp <= 0) {
            this.stats.hp = 0;
            this.callbacks.onPlayerDeath();
          }
          this.callbacks.onStatsChange(this.stats);
        }
      }

      const mesh = this.enemyMeshes.get(enemy.id);
      if (mesh) {
        mesh.position.set(enemy.x, enemy.y, enemy.z);
        mesh.rotation.y = Math.atan2(dx, dz);
      }
    }
  }

  private updateBoss(dt: number) {
    if (!this.boss || !this.bossGroup) return;

    const dx = this.playerPos.x - this.boss.x;
    const dz = this.playerPos.z - this.boss.z;
    const dist = Math.hypot(dx, dz);

    this.bossGroup.rotation.y = Math.atan2(dx, dz);

    // Ability cooldown cycle
    this.boss.abilityTimer -= dt;
    if (this.boss.abilityTimer <= 0) {
      this.boss.abilityTimer = this.boss.isRaging ? 2.5 : 4.0;
      const abilityIndex = Math.floor(Math.random() * this.boss.abilities.length);
      this.boss.currentAbility = this.boss.abilities[abilityIndex];

      // Perform boss attack projectile/burst
      const forward = _vec3A.set(dx / dist, 0, dz / dist);
      this.spawnProjectile({
        fromPlayer: false,
        x: this.boss.x + forward.x * 2.0,
        y: this.boss.y + 1.2,
        z: this.boss.z + forward.z * 2.0,
        vx: forward.x * 12,
        vy: 0,
        vz: forward.z * 12,
        radius: 1.2,
        damage: this.boss.attack,
        element: 'none',
        lifetime: 3.5,
        color: '#ff0055',
        type: 'witch_orb',
      });

      this.callbacks.onBossChange(this.boss);
    }

    // Boss stalking movement
    if (dist > 4.5) {
      this.boss.x += (dx / dist) * this.boss.speed * dt;
      this.boss.z += (dz / dist) * this.boss.speed * dt;
      this.bossGroup.position.set(this.boss.x, this.boss.y, this.boss.z);
    }
  }

  private updatePickups(dt: number) {
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const p = this.pickups[i];
      p.lifetime -= dt;

      // Magnet pull toward Kael
      const dist = this.playerPos.distanceTo(_vec3A.set(p.x, p.y, p.z));
      if (dist < 6.0) {
        const pullSpeed = 12.0 * dt;
        p.x += (this.playerPos.x - p.x) * pullSpeed;
        p.y += (this.playerPos.y - p.y) * pullSpeed;
        p.z += (this.playerPos.z - p.z) * pullSpeed;
      }

      const mesh = this.pickupMeshes.get(p.id);
      if (mesh) {
        mesh.position.set(p.x, p.y, p.z);
        mesh.rotation.y += dt * 3.0;
      }

      if (dist < 1.4) {
        // Collect!
        if (p.type === 'tide_bubble') {
          this.stats.tideEnergy = Math.min(this.stats.maxTideEnergy, this.stats.tideEnergy + p.value);
          sounds.playBubbleCollect(false);
        } else if (p.type === 'pearl') {
          this.stats.pearls += p.value;
          sounds.playBubbleCollect(true);
        } else if (p.type === 'coral_soul') {
          this.stats.coralSouls += p.value;
          sounds.playBubbleCollect(true);
        }

        if (mesh) {
          this.scene.remove(mesh);
          this.pickupMeshes.delete(p.id);
        }
        this.pickups.splice(i, 1);
        this.callbacks.onStatsChange(this.stats);
      } else if (p.lifetime <= 0) {
        if (mesh) {
          this.scene.remove(mesh);
          this.pickupMeshes.delete(p.id);
        }
        this.pickups.splice(i, 1);
      }
    }
  }

  private updateWhirlpools(dt: number) {
    for (let i = this.whirlpools.length - 1; i >= 0; i--) {
      const w = this.whirlpools[i];
      w.duration -= dt;

      // Pull enemies into vortex
      for (const enemy of this.enemies) {
        const dx = w.x - enemy.x;
        const dz = w.z - enemy.z;
        const dist = Math.hypot(dx, dz);
        if (dist < w.radius) {
          enemy.x += (dx / dist) * w.pullForce * dt;
          enemy.z += (dz / dist) * w.pullForce * dt;
          this.damageEnemy(enemy, w.damage * dt);
        }
      }

      if (w.duration <= 0) {
        this.whirlpools.splice(i, 1);
      }
    }
  }

  private updateEnvironment(dt: number) {
    // Rising bubbles animation
    if (this.bubblePositions && this.bubbleParticles) {
      const pos = this.bubblePositions;
      for (let i = 0; i < pos.length / 3; i++) {
        pos[i * 3 + 1] += dt * 3.5;
        if (pos[i * 3 + 1] > 26) {
          pos[i * 3 + 1] = 0;
        }
      }
      this.bubbleParticles.geometry.attributes.position.needsUpdate = true;
    }
  }

  private updateCamera(dt: number) {
    // Smooth 3rd person camera tracking over-the-shoulder
    const camTarget = _vec3A.copy(this.playerPos).add(new THREE.Vector3(0, 1.4, 0));
    const offset = _vec3B
      .copy(this.cameraOffset)
      .applyAxisAngle(_vec3C.set(0, 1, 0), this.playerRotY);

    const desiredCamPos = camTarget.clone().add(offset);
    this.camera.position.lerp(desiredCamPos, 0.15);
    this.camera.lookAt(camTarget);
  }

  // ----------------------------------------------------
  // Input Handling
  // ----------------------------------------------------
  private bindInputs() {
    window.addEventListener('keydown', (e) => {
      this.keysHeld[e.code] = true;

      // Key shortcuts for abilities
      if (e.code === 'KeyJ' || e.code === 'KeyE') {
        this.performTidalFist();
      } else if (e.code === 'KeyQ') {
        this.performAquaDash();
      } else if (e.code === 'KeyR') {
        this.performTridentSummon();
      } else if (e.code === 'KeyF') {
        this.performLeviathanRoar();
      } else if (e.code === 'KeyV') {
        this.performWaterKingMode();
      } else if (e.code === 'KeyX') {
        this.setBlocking(true);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysHeld[e.code] = false;
      if (e.code === 'KeyX') {
        this.setBlocking(false);
      }
    });

    // Mouse drag rotation / pointer
    let isMouseDown = false;
    let lastX = 0;

    this.container.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        isMouseDown = true;
        lastX = e.clientX;
        sounds.unlock();
      } else if (e.button === 2) {
        // Right click block
        this.setBlocking(true);
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        isMouseDown = false;
      } else if (e.button === 2) {
        this.setBlocking(false);
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isMouseDown) {
        const deltaX = e.clientX - lastX;
        lastX = e.clientX;
        this.playerRotY -= deltaX * 0.008;
      }
    });

    this.container.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  public setVirtualSteering(turnDelta: number) {
    this.playerRotY -= turnDelta * 0.05;
  }

  private onWindowResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public destroy() {
    this.isRunning = false;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onWindowResize);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.dispose();
      this.container.innerHTML = '';
    }
  }
}
