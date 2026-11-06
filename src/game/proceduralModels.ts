import * as THREE from 'three';
import { createScaleTexture } from './textures';

/**
 * Procedural composite 3D models complying with Three.js skill directives:
 * 3-12 parts per model, grounded pivots, varied roughness/metalness, no default single primitives.
 */

// Shared reusable materials & geometries
const scaleTex = createScaleTexture('#103050', '#0a1a2f', 256);

// Build Kael procedural character
export function createKaelModel(level = 1, inWaterKing = false): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Kael';

  // Base materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xdeb887,
    roughness: 0.65,
    metalness: 0.05,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x241711,
    roughness: 0.85,
    metalness: 0.0,
  });

  // Armor tier based on level
  const isHighTier = level >= 25 || inWaterKing;
  const isGodTier = level >= 40 || inWaterKing;

  const clothesMat = new THREE.MeshStandardMaterial({
    color: isGodTier ? 0x00d4ff : isHighTier ? 0x1b4965 : 0x5a4a42,
    roughness: isGodTier ? 0.2 : 0.7,
    metalness: isGodTier ? 0.8 : isHighTier ? 0.4 : 0.05,
  });

  const goldArmorMat = new THREE.MeshStandardMaterial({
    color: isGodTier ? 0xffd700 : 0x48cae4,
    roughness: 0.25,
    metalness: 0.9,
  });

  // 1. Torso (Primary silhouette)
  const torsoGeo = new THREE.CylinderGeometry(0.38, 0.28, 0.85, 8);
  const torso = new THREE.Mesh(torsoGeo, clothesMat);
  torso.position.y = 1.05;
  group.add(torso);

  // Chest plate / tunic detail
  const chestPlateGeo = new THREE.BoxGeometry(0.55, 0.45, 0.35);
  const chestPlate = new THREE.Mesh(chestPlateGeo, isHighTier ? goldArmorMat : clothesMat);
  chestPlate.position.set(0, 1.15, 0.05);
  group.add(chestPlate);

  // 2. Head & Neck
  const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.2, 8);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.y = 1.55;
  group.add(neck);

  const headGeo = new THREE.SphereGeometry(0.24, 12, 10);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.78;
  group.add(head);

  // Hair (wind/underwater blown)
  const hairGeo = new THREE.ConeGeometry(0.28, 0.35, 7);
  hairGeo.rotateX(Math.PI * 0.15);
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.set(0, 1.9, -0.05);
  group.add(hair);

  // 3. Arms & Bracers
  const armGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.55, 6);
  const leftArm = new THREE.Mesh(armGeo, skinMat);
  leftArm.position.set(-0.46, 1.05, 0);
  leftArm.rotation.z = Math.PI * 0.12;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, skinMat);
  rightArm.position.set(0.46, 1.05, 0);
  rightArm.rotation.z = -Math.PI * 0.12;
  group.add(rightArm);

  // Bracers
  const bracerGeo = new THREE.CylinderGeometry(0.12, 0.11, 0.24, 6);
  const leftBracer = new THREE.Mesh(bracerGeo, isHighTier ? goldArmorMat : clothesMat);
  leftBracer.position.set(-0.52, 0.9, 0);
  group.add(leftBracer);

  const rightBracer = new THREE.Mesh(bracerGeo, isHighTier ? goldArmorMat : clothesMat);
  rightBracer.position.set(0.52, 0.9, 0);
  group.add(rightBracer);

  // 4. Legs / Swim Flippers
  const legGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.75, 6);
  const leftLeg = new THREE.Mesh(legGeo, clothesMat);
  leftLeg.position.set(-0.18, 0.38, 0);
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, clothesMat);
  rightLeg.position.set(0.18, 0.38, 0);
  group.add(rightLeg);

  // 5. Water King Crown & Glowing Cape (Level 41+ or God Mode)
  if (isGodTier) {
    // Water Crown floating above head
    const crownGeo = new THREE.TorusGeometry(0.28, 0.04, 8, 16);
    crownGeo.rotateX(Math.PI / 2);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x0088ff,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9,
    });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.set(0, 2.1, 0);
    crown.name = 'Crown';
    group.add(crown);

    // Crown Spikes
    for (let i = 0; i < 5; i++) {
      const spikeGeo = new THREE.ConeGeometry(0.04, 0.18, 4);
      const spike = new THREE.Mesh(spikeGeo, crownMat);
      const angle = (i * Math.PI * 2) / 5;
      spike.position.set(Math.cos(angle) * 0.28, 2.2, Math.sin(angle) * 0.28);
      group.add(spike);
    }
  }

  // 6. Trident (Equipped for Level 21+)
  if (level >= 21 || inWaterKing) {
    const trident = createTridentModel(isGodTier);
    trident.position.set(0.58, 1.1, 0.3);
    trident.rotation.x = Math.PI * 0.15;
    trident.name = 'Trident';
    group.add(trident);
  }

  return group;
}

// King Thalor (Old Mermaid King Spirit Guide)
export function createThalorModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'KingThalor';

  const spiritSkinMat = new THREE.MeshStandardMaterial({
    color: 0xb0e0e6,
    roughness: 0.5,
    metalness: 0.1,
    transparent: true,
    opacity: 0.88,
  });

  const beardMat = new THREE.MeshStandardMaterial({
    color: 0xeef8ff,
    roughness: 0.9,
    metalness: 0.0,
  });

  const tailMat = new THREE.MeshStandardMaterial({
    color: 0x0077b6,
    roughness: 0.3,
    metalness: 0.5,
    map: scaleTex,
    transparent: true,
    opacity: 0.92,
  });

  const crownMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.35,
    metalness: 0.8,
    emissive: 0x553300,
  });

  // Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.32, 0.95, 8), spiritSkinMat);
  torso.position.y = 1.1;
  group.add(torso);

  // Royal Coral Pectoral Chest
  const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.35), crownMat);
  chestPlate.position.set(0, 1.25, 0.05);
  group.add(chestPlate);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), spiritSkinMat);
  head.position.y = 1.85;
  group.add(head);

  // Long flowing White Beard
  const beardGeo = new THREE.ConeGeometry(0.22, 0.65, 6);
  beardGeo.rotateX(Math.PI * 0.05);
  const beard = new THREE.Mesh(beardGeo, beardMat);
  beard.position.set(0, 1.45, 0.16);
  group.add(beard);

  // Ancient Broken Crown
  const crown = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 6, 12), crownMat);
  crown.rotation.x = Math.PI / 2;
  crown.position.set(0, 2.05, 0);
  group.add(crown);

  // Mer-Tail (3 curved segmented segments)
  const tailBase = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.22, 0.8, 8), tailMat);
  tailBase.position.set(0, 0.35, -0.15);
  tailBase.rotation.x = Math.PI * 0.12;
  group.add(tailBase);

  const tailMid = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.12, 0.8, 8), tailMat);
  tailMid.position.set(0, -0.35, -0.38);
  tailMid.rotation.x = Math.PI * 0.25;
  group.add(tailMid);

  // Caudal Tail Fluke
  const flukeGeo = new THREE.ConeGeometry(0.4, 0.65, 4);
  flukeGeo.rotateZ(Math.PI / 2);
  const fluke = new THREE.Mesh(flukeGeo, tailMat);
  fluke.position.set(0, -0.85, -0.65);
  fluke.scale.set(1.5, 0.2, 1);
  group.add(fluke);

  return group;
}

// Thalor's Legendary Trident
export function createTridentModel(isLegendary = false): THREE.Group {
  const group = new THREE.Group();

  const shaftMat = new THREE.MeshStandardMaterial({
    color: isLegendary ? 0xffd700 : 0x00b4d8,
    roughness: 0.2,
    metalness: 0.9,
    emissive: isLegendary ? 0xaa7700 : 0x004466,
  });

  const prongMat = new THREE.MeshStandardMaterial({
    color: isLegendary ? 0xffea00 : 0x90e0ef,
    roughness: 0.15,
    metalness: 0.95,
  });

  // Shaft
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.2, 8), shaftMat);
  group.add(shaft);

  // Head Cross guard
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.08, 0.08), shaftMat);
  guard.position.y = 1.05;
  group.add(guard);

  // Center Prong
  const centerProng = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.6, 6), prongMat);
  centerProng.position.y = 1.45;
  group.add(centerProng);

  // Left & Right Curved Prongs
  const leftProng = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.5, 6), prongMat);
  leftProng.position.set(-0.2, 1.38, 0);
  leftProng.rotation.z = Math.PI * 0.05;
  group.add(leftProng);

  const rightProng = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.5, 6), prongMat);
  rightProng.position.set(0.2, 1.38, 0);
  rightProng.rotation.z = -Math.PI * 0.05;
  group.add(rightProng);

  return group;
}

// ----------------------------------------------------
// BOSS 1: The Warden (Lv 10) - Giant Stone Golem Crab
// ----------------------------------------------------
export function createWardenBossModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'TheWarden';

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x5a636a,
    roughness: 0.9,
    metalness: 0.1,
  });

  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x007799,
    roughness: 0.2,
    metalness: 0.8,
  });

  // Carapace Shell (Huge hexagonal boulder)
  const shell = new THREE.Mesh(new THREE.DodecahedronGeometry(2.4, 0), stoneMat);
  shell.scale.set(1.4, 0.7, 1.1);
  shell.position.y = 2.0;
  group.add(shell);

  // Glowing Crystal Spikes on back
  for (let i = 0; i < 7; i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.2, 5), crystalMat);
    const angle = (i * Math.PI * 2) / 7;
    spike.position.set(Math.cos(angle) * 1.5, 2.7, Math.sin(angle) * 1.1);
    spike.rotation.x = (Math.random() - 0.5) * 0.4;
    spike.rotation.z = (Math.random() - 0.5) * 0.4;
    group.add(spike);
  }

  // Giant Left Pincer Claw
  const leftClaw = createCrabClaw(stoneMat, crystalMat);
  leftClaw.position.set(-2.6, 2.0, 1.4);
  leftClaw.scale.set(1.6, 1.6, 1.6);
  leftClaw.rotation.y = Math.PI * 0.2;
  group.add(leftClaw);

  // Giant Right Pincer Claw
  const rightClaw = createCrabClaw(stoneMat, crystalMat);
  rightClaw.position.set(2.6, 2.0, 1.4);
  rightClaw.scale.set(1.6, 1.6, 1.6);
  rightClaw.rotation.y = -Math.PI * 0.2;
  group.add(rightClaw);

  // 6 Stone Legs
  for (let i = 0; i < 3; i++) {
    const zOffset = (i - 1) * 1.1;
    const lLeg = createCrabLeg(stoneMat);
    lLeg.position.set(-2.0, 1.2, zOffset);
    lLeg.rotation.z = -Math.PI * 0.25;
    group.add(lLeg);

    const rLeg = createCrabLeg(stoneMat);
    rLeg.position.set(2.0, 1.2, zOffset);
    rLeg.rotation.z = Math.PI * 0.25;
    rLeg.rotation.y = Math.PI;
    group.add(rLeg);
  }

  return group;
}

function createCrabClaw(baseMat: THREE.Material, crystalMat: THREE.Material): THREE.Group {
  const claw = new THREE.Group();
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.2, 6), baseMat);
  claw.add(arm);

  const mainPincer = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.3, 5), baseMat);
  mainPincer.position.set(0.15, 0.9, 0);
  claw.add(mainPincer);

  const subPincer = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.0, 5), crystalMat);
  subPincer.position.set(-0.25, 0.8, 0);
  subPincer.rotation.z = Math.PI * 0.15;
  claw.add(subPincer);
  return claw;
}

function createCrabLeg(baseMat: THREE.Material): THREE.Group {
  const leg = new THREE.Group();
  const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 1.5, 6), baseMat);
  upper.position.y = 0.7;
  leg.add(upper);

  const lower = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.8, 6), baseMat);
  lower.position.set(0, 1.9, 0.6);
  lower.rotation.x = -Math.PI * 0.35;
  leg.add(lower);
  return leg;
}

// ----------------------------------------------------
// BOSS 2: Ronan (Lv 20) - Shark Knight Traitor Brother
// ----------------------------------------------------
export function createRonanBossModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Ronan';

  const sharkMat = new THREE.MeshStandardMaterial({
    color: 0x1b263b,
    roughness: 0.4,
    metalness: 0.6,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xd4a373,
    roughness: 0.6,
    metalness: 0.1,
  });

  const bladeMat = new THREE.MeshStandardMaterial({
    color: 0xe63946,
    emissive: 0x660011,
    roughness: 0.2,
    metalness: 0.9,
  });

  // Shark-knight armored torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.38, 1.2, 8), sharkMat);
  torso.position.y = 1.3;
  group.add(torso);

  // Dorsal Shark Fin on back
  const finGeo = new THREE.ConeGeometry(0.25, 0.9, 4);
  finGeo.rotateX(Math.PI * 0.4);
  const dorsalFin = new THREE.Mesh(finGeo, sharkMat);
  dorsalFin.position.set(0, 1.4, -0.5);
  group.add(dorsalFin);

  // Shark Maw Helmet / Visor
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), sharkMat);
  helm.position.y = 2.1;
  group.add(helm);

  // Glowing Red Shark Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0033 });
  const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), eyeMat);
  leftEye.position.set(-0.16, 2.12, 0.28);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), eyeMat);
  rightEye.position.set(0.16, 2.12, 0.28);
  group.add(rightEye);

  // Twin Coral Shark Blades
  const leftBlade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 0.25), bladeMat);
  leftBlade.position.set(-0.85, 1.1, 0.4);
  leftBlade.rotation.x = Math.PI * 0.2;
  group.add(leftBlade);

  const rightBlade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 0.25), bladeMat);
  rightBlade.position.set(0.85, 1.1, 0.4);
  rightBlade.rotation.x = Math.PI * 0.2;
  group.add(rightBlade);

  // Legs / Armored Greaves
  const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.9, 6), sharkMat);
  lLeg.position.set(-0.25, 0.45, 0);
  group.add(lLeg);

  const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.9, 6), sharkMat);
  rLeg.position.set(0.25, 0.45, 0);
  group.add(rLeg);

  return group;
}

// ----------------------------------------------------
// BOSS 3: Lira (Lv 30) - Siren Queen Ex-Friend
// ----------------------------------------------------
export function createLiraBossModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Lira';

  const sirenSkinMat = new THREE.MeshStandardMaterial({
    color: 0xc8b6ff,
    roughness: 0.4,
    metalness: 0.2,
  });

  const crownMat = new THREE.MeshStandardMaterial({
    color: 0x9d4edd,
    emissive: 0x3c096c,
    roughness: 0.2,
    metalness: 0.8,
  });

  const finMat = new THREE.MeshStandardMaterial({
    color: 0x7b2cbf,
    roughness: 0.3,
    metalness: 0.4,
    transparent: true,
    opacity: 0.85,
  });

  // Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.26, 1.0, 8), sirenSkinMat);
  torso.position.y = 1.2;
  group.add(torso);

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), sirenSkinMat);
  head.position.y = 1.95;
  group.add(head);

  // Urchin Spine Crown
  const crown = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.05, 6, 12), crownMat);
  crown.rotation.x = Math.PI / 2;
  crown.position.set(0, 2.15, 0);
  group.add(crown);

  for (let i = 0; i < 6; i++) {
    const spine = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.45, 4), crownMat);
    const angle = (i * Math.PI * 2) / 6;
    spine.position.set(Math.cos(angle) * 0.26, 2.35, Math.sin(angle) * 0.26);
    group.add(spine);
  }

  // 4 Bioluminescent Tentacle Fins trailing behind
  for (let i = 0; i < 4; i++) {
    const tent = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.02, 1.8, 6), finMat);
    const angle = ((i - 1.5) * Math.PI) / 6;
    tent.position.set(Math.sin(angle) * 0.4, 0.2, -0.3);
    tent.rotation.x = Math.PI * 0.15;
    tent.rotation.z = angle;
    group.add(tent);
  }

  return group;
}

// ----------------------------------------------------
// BOSS 4: Elder Varun (Lv 40) - Sea Warlock
// ----------------------------------------------------
export function createVarunBossModel(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'ElderVarun';

  const warlockRobesMat = new THREE.MeshStandardMaterial({
    color: 0x1a0933,
    roughness: 0.8,
    metalness: 0.3,
  });

  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xd8d8d8,
    roughness: 0.7,
    metalness: 0.1,
  });

  const bloodMagicMat = new THREE.MeshStandardMaterial({
    color: 0xd90429,
    emissive: 0x8b0000,
    emissiveIntensity: 0.7,
    roughness: 0.2,
    metalness: 0.7,
  });

  // Hunched Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.55, 1.3, 8), warlockRobesMat);
  torso.position.set(0, 1.1, -0.15);
  torso.rotation.x = Math.PI * 0.08;
  group.add(torso);

  // Elder Head with Hood
  const hood = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.65, 7), warlockRobesMat);
  hood.position.set(0, 1.95, 0.05);
  group.add(hood);

  // Cursed Coral Staff
  const staffShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), boneMat);
  staffShaft.position.set(0.65, 1.2, 0.4);
  group.add(staffShaft);

  // Blood Orb at Staff Head
  const bloodOrb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 1), bloodMagicMat);
  bloodOrb.position.set(0.65, 2.45, 0.4);
  group.add(bloodOrb);

  return group;
}

// ----------------------------------------------------
// BOSS 5: MORGANA (Lv 50 Final Boss) - 3 Phases
// ----------------------------------------------------
export function createMorganaPhase1Model(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Morgana_Witch';

  const witchMat = new THREE.MeshStandardMaterial({
    color: 0x140124,
    roughness: 0.3,
    metalness: 0.7,
  });

  const tentacleMat = new THREE.MeshStandardMaterial({
    color: 0x480ca8,
    roughness: 0.5,
    metalness: 0.3,
    emissive: 0x1e0038,
  });

  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xdad7cd,
    roughness: 0.6,
  });

  // Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.32, 1.2, 8), witchMat);
  torso.position.y = 1.3;
  group.add(torso);

  // Head with wild black tentacle hair
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), skinMat);
  head.position.y = 2.1;
  group.add(head);

  // 6 Animated Giant Octopus Tentacles
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const tentacle = new THREE.Group();
    tentacle.position.set(Math.cos(angle) * 0.4, 0.7, Math.sin(angle) * 0.4);

    const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 1.2, 6), tentacleMat);
    seg1.position.y = -0.5;
    seg1.rotation.z = Math.cos(angle) * 0.5;
    seg1.rotation.x = Math.sin(angle) * 0.5;
    tentacle.add(seg1);

    const seg2 = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.4, 6), tentacleMat);
    seg2.position.set(0, -1.5, 0);
    seg2.rotation.z = Math.cos(angle) * 0.7;
    tentacle.add(seg2);

    group.add(tentacle);
  }

  // Dark Magic Orb floating above hand
  const orbMat = new THREE.MeshStandardMaterial({
    color: 0x7209b7,
    emissive: 0xb5179e,
    emissiveIntensity: 0.9,
    roughness: 0.1,
  });
  const darkOrb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), orbMat);
  darkOrb.position.set(0.65, 1.9, 0.5);
  group.add(darkOrb);

  return group;
}

// Morgana Phase 2: Giant Abyssal Sea Serpent
export function createMorganaPhase2Model(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'Morgana_Serpent';

  const serpentMat = new THREE.MeshStandardMaterial({
    color: 0x03071e,
    roughness: 0.35,
    metalness: 0.65,
    map: scaleTex,
  });

  const glowingSpineMat = new THREE.MeshStandardMaterial({
    color: 0xf72585,
    emissive: 0x7209b7,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });

  // Huge Dragon Head
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.9, 2.2, 7), serpentMat);
  head.rotation.x = Math.PI / 2;
  head.position.set(0, 2.2, 2.0);
  group.add(head);

  // Horns
  const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.2, 5), glowingSpineMat);
  hornL.position.set(-0.6, 2.8, 1.6);
  hornL.rotation.z = -Math.PI * 0.2;
  group.add(hornL);

  const hornR = new THREE.Mesh(new THREE.ConeGeometry(0.2, 1.2, 5), glowingSpineMat);
  hornR.position.set(0.6, 2.8, 1.6);
  hornR.rotation.z = Math.PI * 0.2;
  group.add(hornR);

  // Coiling Segmented Body (5 massive segments)
  for (let i = 0; i < 6; i++) {
    const r = 0.85 - i * 0.1;
    const seg = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), serpentMat);
    const z = 1.0 - i * 1.3;
    const y = 1.5 + Math.sin(i * 0.8) * 0.6;
    const x = Math.cos(i * 0.8) * 0.8;
    seg.position.set(x, y, z);
    group.add(seg);

    // Spine fin
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.7, 4), glowingSpineMat);
    fin.position.set(x, y + r + 0.2, z);
    group.add(fin);
  }

  return group;
}

// ----------------------------------------------------
// Regular Sea Monsters
// ----------------------------------------------------
export function createCaveEelModel(): THREE.Group {
  const group = new THREE.Group();
  const eelMat = new THREE.MeshStandardMaterial({ color: 0x1f363d, roughness: 0.6, metalness: 0.2 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.08, 2.0, 6), eelMat);
  body.rotation.x = Math.PI / 2;
  body.position.y = 0.5;
  group.add(body);

  // Lure antenna
  const lure = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), glowMat);
  lure.position.set(0, 0.8, 1.1);
  group.add(lure);
  return group;
}

export function createPrisonCrabModel(): THREE.Group {
  const group = new THREE.Group();
  const crabMat = new THREE.MeshStandardMaterial({ color: 0x9b2226, roughness: 0.8, metalness: 0.1 });
  const body = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 0), crabMat);
  body.scale.set(1.2, 0.6, 1.0);
  body.position.y = 0.4;
  group.add(body);

  const clawL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.2), crabMat);
  clawL.position.set(-0.7, 0.45, 0.4);
  group.add(clawL);

  const clawR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.2), crabMat);
  clawR.position.set(0.7, 0.45, 0.4);
  group.add(clawR);
  return group;
}

export function createElectricJellyModel(): THREE.Group {
  const group = new THREE.Group();
  const bellMat = new THREE.MeshStandardMaterial({
    color: 0x48cae4,
    emissive: 0x0077b6,
    emissiveIntensity: 0.7,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8,
  });

  const bell = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), bellMat);
  bell.position.y = 1.0;
  group.add(bell);

  // Tentacles
  const tentMat = new THREE.MeshBasicMaterial({ color: 0x90e0ef });
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const tent = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.01, 1.4, 4), tentMat);
    tent.position.set(Math.cos(angle) * 0.4, 0.3, Math.sin(angle) * 0.4);
    group.add(tent);
  }
  return group;
}

// ----------------------------------------------------
// Props: Bioluminescent Corals, Pillars, Shards
// ----------------------------------------------------
export function createCoralProp(type = 0): THREE.Group {
  const group = new THREE.Group();
  const colors = [0xff006e, 0x3a86ff, 0x8338ec, 0xfb5607];
  const mat = new THREE.MeshStandardMaterial({
    color: colors[type % colors.length],
    roughness: 0.7,
    metalness: 0.1,
    emissive: colors[type % colors.length],
    emissiveIntensity: 0.25,
  });

  // Branching coral stalk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 1.8, 6), mat);
  trunk.position.y = 0.9;
  group.add(trunk);

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 1.1, 5), mat);
    branch.position.set(Math.cos(angle) * 0.4, 1.4, Math.sin(angle) * 0.4);
    branch.rotation.z = Math.cos(angle) * 0.45;
    branch.rotation.x = Math.sin(angle) * 0.45;
    group.add(branch);
  }

  return group;
}

export function createSunkenPillarProp(): THREE.Group {
  const group = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.95 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.6), stoneMat);
  base.position.y = 0.25;
  group.add(base);

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, 4.5, 10), stoneMat);
  shaft.position.y = 2.75;
  group.add(shaft);

  const capital = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 1.5), stoneMat);
  capital.position.y = 5.25;
  group.add(capital);

  return group;
}

export function createTridentShardProp(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'TridentShard';

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd700,
    emissive: 0xffaa00,
    emissiveIntensity: 0.9,
    roughness: 0.1,
    metalness: 0.95,
  });

  const shard = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.9, 4), goldMat);
  shard.position.y = 0.5;
  group.add(shard);

  const aura = new THREE.Mesh(
    new THREE.SphereGeometry(0.65, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true, transparent: true, opacity: 0.45 })
  );
  aura.position.y = 0.5;
  group.add(aura);

  return group;
}
