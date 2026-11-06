import * as THREE from 'three';

/**
 * Procedural texture generators using Canvas 2D.
 * Complies strictly with zero 404 / no external asset dependencies.
 */

// Generate animated-like caustics light map for seafloor
export function createCausticsTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0a2540';
  ctx.fillRect(0, 0, size, size);

  // Layered Voronoi-like caustic webs
  const points: { x: number; y: number }[] = [];
  const numPoints = 64;
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: Math.random() * size,
      y: Math.random() * size,
    });
  }

  ctx.strokeStyle = 'rgba(78, 205, 230, 0.45)';
  ctx.lineWidth = 2.5;

  for (let i = 0; i < numPoints; i++) {
    for (let j = i + 1; j < numPoints; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 75) {
        ctx.beginPath();
        ctx.moveTo(points[i].x, points[i].y);
        ctx.bezierCurveTo(
          points[i].x + (Math.random() - 0.5) * 20,
          points[i].y + (Math.random() - 0.5) * 20,
          points[j].x + (Math.random() - 0.5) * 20,
          points[j].y + (Math.random() - 0.5) * 20,
          points[j].x,
          points[j].y
        );
        ctx.stroke();
      }
    }
  }

  // Radial hot spots
  for (let i = 0; i < 30; i++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    const grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, 25);
    grad.addColorStop(0, 'rgba(120, 240, 255, 0.5)');
    grad.addColorStop(1, 'rgba(10, 37, 64, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(rx, ry, 25, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate organic fish/serpent scale texture
export function createScaleTexture(primary = '#1e3a5f', secondary = '#0f2338', size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, size, size);

  const rows = 16;
  const cols = 16;
  const w = size / cols;
  const h = size / rows;

  for (let r = 0; r < rows; r++) {
    const offsetX = (r % 2) * (w / 2);
    for (let c = -1; c <= cols; c++) {
      const cx = c * w + offsetX;
      const cy = r * h;

      ctx.beginPath();
      ctx.arc(cx + w / 2, cy + h, w / 2, Math.PI, 0, false);
      ctx.fillStyle = secondary;
      ctx.fill();

      ctx.strokeStyle = 'rgba(100, 210, 255, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate radial glow bubble / particle sprite
export function createGlowBubbleTexture(color = '#00f0ff', inner = '#ffffff', size = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.25, color);
  grad.addColorStop(0.7, 'rgba(0, 180, 255, 0.3)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(half, half, half, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate water magical rune glyph circle
export function createRuneCircleTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const center = size / 2;

  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(78, 220, 255, 0.9)';
  ctx.lineWidth = 4;

  // Outer rings
  ctx.beginPath();
  ctx.arc(center, center, center - 16, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(center, center, center - 32, 0, Math.PI * 2);
  ctx.stroke();

  // Internal geometric trident star
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const x1 = center + Math.cos(angle) * (center - 32);
    const y1 = center + Math.sin(angle) * (center - 32);
    const x2 = center + Math.cos(angle + Math.PI) * (center - 32);
    const y2 = center + Math.sin(angle + Math.PI) * (center - 32);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Wave glyph arcs
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    const gx = center + Math.cos(a) * (center * 0.55);
    const gy = center + Math.sin(a) * (center * 0.55);
    ctx.beginPath();
    ctx.arc(gx, gy, 18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(120, 245, 255, 0.5)';
    ctx.fill();
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
