import React, { useEffect, useRef, useMemo } from 'react';

// --- Particle Classes ---

// 1. Confetti
class ConfettiParticle {
  constructor(w, h) {
    const palette = ['#ff4e6a', '#feca57', '#00d2d3', '#5f27cd', '#ff9f43', '#48dbfb', '#ff6b6b', '#54a0ff', '#ff9ff3', '#01a3a4', '#f368e0', '#2ed573'];
    this.x = Math.random() * w;
    this.y = Math.random() * -h;
    this.size = 6 + Math.random() * 8;
    this.velX = Math.random() * 4 - 2;
    this.velY = 3 + Math.random() * 4;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.2;
    this.color = palette[Math.floor(Math.random() * palette.length)];
    this.dead = false;
  }

  update(w, h) {
    this.x += this.velX;
    this.y += this.velY;
    this.rotation += this.rotSpeed;
    if (this.y > h + 20) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
    ctx.restore();
  }
}

// 2. Sparkle
class SparkleParticle {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = h / 2 + Math.random() * (h / 2);
    this.size = 1 + Math.random() * 3;
    this.velX = Math.random() * 1 - 0.5;
    this.velY = -(0.5 + Math.random() * 1.5);
    this.life = 50 + Math.floor(Math.random() * 100);
    this.maxLife = this.life;
    this.hue = 40 + Math.random() * 10;
    this.dead = false;
  }

  update(w, h) {
    this.x += this.velX;
    this.y += this.velY;
    this.life--;
    if (this.life <= 0) this.dead = true;
  }

  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 15;
    ctx.shadowColor = `hsl(${this.hue}, 100%, 60%)`;
    ctx.fillStyle = `hsl(${this.hue}, 100%, 70%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 3. Heart
class HeartParticle {
  constructor(w, h) {
    const cx = w / 2;
    const cy = h / 2;
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    this.x = cx;
    this.y = cy;
    this.size = 8 + Math.random() * 12;
    this.velX = Math.cos(angle) * speed;
    this.velY = Math.sin(angle) * speed;
    this.opacity = 1;
    this.decay = 0.008 + Math.random() * 0.012;
    const pinks = ['#ff4e6a', '#ff6b81', '#e84393', '#fd79a8', '#e17055', '#d63031', '#ff7675', '#fab1a0'];
    this.color = pinks[Math.floor(Math.random() * pinks.length)];
    this.dead = false;
  }

  update(w, h) {
    this.x += this.velX;
    this.y += this.velY;
    this.velY += 0.02;
    this.opacity -= this.decay;
    if (this.opacity <= 0) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    const s = this.size;
    const x = this.x;
    const y = this.y;
    ctx.moveTo(x, y + s / 4);
    ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s / 4);
    ctx.bezierCurveTo(x - s / 2, y + s / 2, x, y + s * 0.7, x, y + s);
    ctx.bezierCurveTo(x, y + s * 0.7, x + s / 2, y + s / 2, x + s / 2, y + s / 4);
    ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + s / 4);
    ctx.fill();
    ctx.restore();
  }
}

// 4. Firework Rocket
class FireworkRocket {
  constructor(w, h, onExplode) {
    this.x = Math.random() * w;
    this.y = h;
    this.targetY = h * (0.15 + Math.random() * 0.35);
    this.velY = -(10 + Math.random() * 6);
    this.onExplode = onExplode;
    this.dead = false;
    this.trail = [];
  }

  update(w, h) {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 8) this.trail.shift();
    this.y += this.velY;
    this.velY += 0.15;
    if (this.y <= this.targetY || this.velY >= 0) {
      this.dead = true;
      if (this.onExplode) this.onExplode(this.x, this.y);
    }
  }

  draw(ctx) {
    ctx.save();
    for (let i = 0; i < this.trail.length; i++) {
      const alpha = ((i + 1) / this.trail.length) * 0.5;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffeaa7';
      ctx.fillRect(this.trail[i].x - 1, this.trail[i].y - 1, 2, 2);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
    ctx.restore();
  }
}

// 5. Firework Flare
class FireworkFlare {
  constructor(x, y, color) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 5;
    this.x = x;
    this.y = y;
    this.velX = Math.cos(angle) * speed;
    this.velY = Math.sin(angle) * speed;
    this.color = color;
    this.opacity = 1;
    this.decay = 0.01 + Math.random() * 0.02;
    this.size = 2 + Math.random() * 2;
    this.dead = false;
  }

  update(w, h) {
    this.x += this.velX;
    this.y += this.velY;
    this.velY += 0.03;
    this.velX *= 0.99;
    this.velY *= 0.99;
    this.opacity -= this.decay;
    if (this.opacity <= 0) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 6. Pixel
class PixelParticle {
  constructor(w, h) {
    const cx = w / 2;
    const cy = h / 2;
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 5;
    const neons = ['#0ff', '#f0f', '#ff0', '#0f0', '#f00', '#00f', '#ff6600', '#ff0099', '#00ff99', '#9900ff'];
    this.x = cx;
    this.y = cy;
    this.size = 4 + Math.floor(Math.random() * 7);
    this.velX = Math.cos(angle) * speed;
    this.velY = Math.sin(angle) * speed;
    this.life = 20 + Math.floor(Math.random() * 50);
    this.maxLife = this.life;
    this.color = neons[Math.floor(Math.random() * neons.length)];
    this.dead = false;
  }

  update(w, h) {
    this.x += this.velX;
    this.y += this.velY;
    this.life--;
    if (this.life <= 0) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life / this.maxLife;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

// 7. Ribbon
class RibbonParticle {
  constructor(w, h) {
    const palette = ['#ff4e6a', '#feca57', '#00d2d3', '#5f27cd', '#ff9f43', '#48dbfb', '#ff6b6b', '#54a0ff', '#ff9ff3'];
    this.x = Math.random() * w;
    this.y = -30 - Math.random() * 70;
    this.width = 2 + Math.random() * 4;
    this.length = 20 + Math.random() * 20;
    this.velX = Math.random() * 2 - 1;
    this.velY = 3 + Math.random() * 3;
    this.waveSpeed = 0.02 + Math.random() * 0.04;
    this.wave = Math.random() * Math.PI * 2;
    this.color = palette[Math.floor(Math.random() * palette.length)];
    this.dead = false;
  }

  update(w, h) {
    this.x += this.velX + Math.sin(this.wave) * 0.5;
    this.y += this.velY;
    this.wave += this.waveSpeed;
    if (this.y > h + 50) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const x = this.x;
    const y = this.y;
    const len = this.length;
    ctx.moveTo(x, y);
    const cp1x = x + Math.sin(this.wave) * 15;
    const cp1y = y + len * 0.33;
    const cp2x = x - Math.sin(this.wave + 1) * 15;
    const cp2y = y + len * 0.66;
    const ex = x + Math.sin(this.wave + 2) * 10;
    const ey = y + len;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey);
    ctx.stroke();
    ctx.restore();
  }
}

// 8. StarWarp (Space Warp)
class StarWarpParticle {
  constructor(w, h) {
    this.cx = w / 2;
    this.cy = h / 2;
    this.reset(w, h);
    this.dead = false;
  }

  reset(w, h) {
    this.x = (Math.random() - 0.5) * w;
    this.y = (Math.random() - 0.5) * h;
    this.z = Math.random() * w;
    this.pz = this.z;
    this.speed = 5 + Math.random() * 15;
  }

  update(w, h) {
    this.cx = w / 2;
    this.cy = h / 2;
    this.pz = this.z;
    this.z -= this.speed;
    if (this.z <= 0) {
      this.reset(w, h);
      this.pz = this.z;
    }
  }

  draw(ctx) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const sx = (this.x / this.z) * w + this.cx;
    const sy = (this.y / this.z) * h + this.cy;
    const px = (this.x / this.pz) * w + this.cx;
    const py = (this.y / this.pz) * h + this.cy;

    const alpha = Math.min(1, (1 - this.z / w) * 1.5);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(0.5, (1 - this.z / w) * 3);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(sx, sy);
    ctx.stroke();
    ctx.restore();
  }
}

// 9. Curtain particles
class CurtainParticle {
  constructor(w, h) {
    const symbols = ['🌟', '⭐', '✨', '🎵', '🎶', '🎭'];
    this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
    this.x = Math.random() * w;
    this.y = Math.random() * -h;
    this.size = 14 + Math.random() * 12;
    this.velX = Math.random() * 2 - 1;
    this.velY = 2 + Math.random() * 3;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.05;
    this.dead = false;
  }

  update(w, h) {
    this.x += this.velX;
    this.y += this.velY;
    this.rotation += this.rotSpeed;
    if (this.y > h + 30) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.font = `${this.size}px Poppins`;
    ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FFD700';
    ctx.fillText(this.symbol, 0, 0);
    ctx.restore();
  }
}

// 10. Gate particles
class GateParticle {
  constructor(w, h) {
    const symbols = ['🔑', '🗝️', '🔒', '🔓', '✨'];
    this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
    this.x = w / 2;
    this.y = h / 2;
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 5;
    this.velX = Math.cos(angle) * speed;
    this.velY = Math.sin(angle) * speed;
    this.size = 16 + Math.random() * 10;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.1;
    this.opacity = 1;
    this.decay = 0.01 + Math.random() * 0.01;
    this.dead = false;
  }

  update(w, h) {
    this.x += this.velX;
    this.y += this.velY;
    this.rotation += this.rotSpeed;
    this.velY += 0.02; // slight gravity
    this.opacity -= this.decay;
    if (this.opacity <= 0) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.font = `${this.size}px Poppins`;
    ctx.fillStyle = '#FFD700';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#F2C744';
    ctx.fillText(this.symbol, 0, 0);
    ctx.restore();
  }
}

// 11. Sakura Petal
class SakuraPetalParticle {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * -h;
    this.size = 5 + Math.random() * 6;
    this.velY = 1.2 + Math.random() * 1.5;
    this.angle = Math.random() * Math.PI;
    this.angleSpeed = 0.02 + Math.random() * 0.03;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.05;
    this.dead = false;
  }

  update(w, h) {
    this.x += Math.sin(this.angle) * 0.8;
    this.y += this.velY;
    this.angle += this.angleSpeed;
    this.rotation += this.rotSpeed;
    if (this.y > h + 20) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = '#ffb7c5'; // Cherry blossom pink
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Crease
    ctx.strokeStyle = '#ffa0b2';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-this.size, 0);
    ctx.lineTo(this.size, 0);
    ctx.stroke();
    ctx.restore();
  }
}

// 12. Snowflake
class SnowflakeParticle {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * -h;
    this.size = 1.5 + Math.random() * 3.5;
    this.velY = 0.8 + Math.random() * 1.2;
    this.angle = Math.random() * Math.PI;
    this.angleSpeed = 0.01 + Math.random() * 0.02;
    this.dead = false;
  }

  update(w, h) {
    this.x += Math.sin(this.angle) * 0.5;
    this.y += this.velY;
    this.angle += this.angleSpeed;
    if (this.y > h + 20) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 13. Bubble
class BubbleParticle {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = h + 20 + Math.random() * 50;
    this.size = 6 + Math.random() * 15;
    this.velY = -(0.8 + Math.random() * 1.5);
    this.angle = Math.random() * Math.PI;
    this.angleSpeed = 0.01 + Math.random() * 0.03;
    this.opacity = 0.3 + Math.random() * 0.4;
    this.dead = false;
  }

  update(w, h) {
    this.x += Math.sin(this.angle) * 0.4;
    this.y += this.velY;
    this.angle += this.angleSpeed;
    if (this.y < -20) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.fillStyle = 'rgba(173, 216, 230, 0.15)'; // Pale bubble blue
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 14. Butterfly
class ButterflyParticle {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = h + 20 + Math.random() * 50;
    this.size = 7 + Math.random() * 7;
    this.velY = -(0.8 + Math.random() * 1.2);
    this.angle = Math.random() * Math.PI * 2;
    this.angleSpeed = 0.02 + Math.random() * 0.03;
    this.flapAngle = Math.random() * Math.PI * 2;
    this.flapSpeed = 0.15 + Math.random() * 0.15;
    const colors = ['#ffe033', '#ffa500', '#ff00aa', '#00ffff', '#b57cff', '#54e346'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.dead = false;
  }

  update(w, h) {
    this.x += Math.sin(this.angle) * 1.2;
    this.y += this.velY;
    this.angle += this.angleSpeed;
    this.flapAngle += this.flapSpeed;
    if (this.y < -20) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    const wingFlap = Math.abs(Math.sin(this.flapAngle));
    ctx.scale(wingFlap, 1);
    ctx.fillStyle = this.color;
    
    // Upper wings
    ctx.beginPath();
    ctx.ellipse(-this.size * 0.5, -this.size * 0.3, this.size * 0.6, this.size * 0.8, -Math.PI / 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(this.size * 0.5, -this.size * 0.3, this.size * 0.6, this.size * 0.8, Math.PI / 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Lower wings
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.ellipse(-this.size * 0.4, this.size * 0.4, this.size * 0.45, this.size * 0.55, -Math.PI / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(this.size * 0.4, this.size * 0.4, this.size * 0.45, this.size * 0.55, Math.PI / 3, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(-1.5, -this.size * 0.8, 3, this.size * 1.3);
    ctx.restore();
  }
}


// 15. Star Shower
class StarShowerParticle {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * -h;
    this.size = 5 + Math.random() * 6;
    this.velY = 1.8 + Math.random() * 2.2;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = 0.02 + Math.random() * 0.03;
    const colors = ['#ffffff', '#ffe033', '#ffa500', '#ffd700'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.dead = false;
  }

  update(w, h) {
    this.y += this.velY;
    this.rotation += this.rotSpeed;
    if (this.y > h + 20) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    
    // Draw 5-point star
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(Math.cos(((18 + i * 72) * Math.PI) / 180) * this.size, -Math.sin(((18 + i * 72) * Math.PI) / 180) * this.size);
      ctx.lineTo(Math.cos(((54 + i * 72) * Math.PI) / 180) * (this.size / 2), -Math.sin(((54 + i * 72) * Math.PI) / 180) * (this.size / 2));
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// 16. Leaves Rustle
class LeavesRustleParticle {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * -h;
    this.size = 6 + Math.random() * 8;
    this.velY = 1.0 + Math.random() * 1.5;
    this.angle = Math.random() * Math.PI;
    this.angleSpeed = 0.02 + Math.random() * 0.03;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.04;
    const colors = ['#4caf50', '#81c784', '#2e7d32', '#ff9800', '#ffb74d'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.dead = false;
  }

  update(w, h) {
    this.x += Math.sin(this.angle) * 0.7;
    this.y += this.velY;
    this.angle += this.angleSpeed;
    this.rotation += this.rotSpeed;
    if (this.y > h + 20) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;
    
    // Draw leaf shape
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    // Leaf vein
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-this.size, 0);
    ctx.lineTo(this.size, 0);
    ctx.stroke();
    
    ctx.restore();
  }
}

// 17. Ghostly Wisps
class GhostWispsParticle {
  constructor(w, h) {
    this.x = Math.random() * w;
    this.y = h + 20 + Math.random() * 50;
    this.size = 8 + Math.random() * 14;
    this.velY = -(0.5 + Math.random() * 1.0);
    this.angle = Math.random() * Math.PI;
    this.angleSpeed = 0.01 + Math.random() * 0.02;
    this.opacity = 0.2 + Math.random() * 0.3;
    const colors = ['#e0f2fe', '#f3e8ff', '#fce7f3', '#ccfbf1'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.dead = false;
  }

  update(w, h) {
    this.x += Math.sin(this.angle) * 0.5;
    this.y += this.velY;
    this.angle += this.angleSpeed;
    if (this.y < -20) this.dead = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    
    // Draw soft wisp
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export default function ParticleCanvas({ type, active, isPreview = false }) {
  const canvasRef = useRef(null);

  // Initialize static balloons data to prevent re-renders changing positions
  const balloons = useMemo(() => {
    const colors = ['#ff4e6a', '#ff9f43', '#00d2d3', '#feca57', '#5f27cd', '#01a3a4', '#ff6b6b', '#48dbfb', '#ff9ff3', '#54a0ff'];
    return Array.from({ length: 30 }).map((_, i) => ({
      color: colors[i % colors.length],
      left: `${10 + Math.random() * 80}vw`,
      dur: `${5 + Math.random() * 5}s`,
      drift: `${Math.random() * 100 - 50}px`,
      delay: `${Math.random() * 3}s`,
    }));
  }, []);

  useEffect(() => {
    if (!active || type === 'balloons') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let rafId = null;
    let particles = [];
    let fireworkTimers = [];

    const handleResize = () => {
      if (isPreview) {
        // Set canvas to parent size
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
        }
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const getTargetCount = (t) => {
      switch (t) {
        case 'confetti': return 50;
        case 'sparkles': return 40;
        case 'hearts': return 30;
        case 'pixel': return 40;
        case 'ribbon': return 20;
        case 'spacewarp': return 150;
        case 'curtains': return 35;
        case 'gate': return 40;
        case 'sakura': return 40;
        case 'snow': return 60;
        case 'bubbles': return 35;
        case 'butterflies': return 25;
        case 'stars': return 45;
        case 'leaves': return 40;
        case 'wisps': return 30;
        default: return 50;
      }
    };

    const createParticle = (t, w, h) => {
      switch (t) {
        case 'confetti': return new ConfettiParticle(w, h);
        case 'sparkles': return new SparkleParticle(w, h);
        case 'hearts': return new HeartParticle(w, h);
        case 'pixel': return new PixelParticle(w, h);
        case 'ribbon': return new RibbonParticle(w, h);
        case 'spacewarp': return new StarWarpParticle(w, h);
        case 'curtains': return new CurtainParticle(w, h);
        case 'gate': return new GateParticle(w, h);
        case 'sakura': return new SakuraPetalParticle(w, h);
        case 'snow': return new SnowflakeParticle(w, h);
        case 'bubbles': return new BubbleParticle(w, h);
        case 'butterflies': return new ButterflyParticle(w, h);
        case 'stars': return new StarShowerParticle(w, h);
        case 'leaves': return new LeavesRustleParticle(w, h);
        case 'wisps': return new GhostWispsParticle(w, h);
        default: return new ConfettiParticle(w, h);
      }
    };

    // Initialize particles
    const initCount = getTargetCount(type);
    for (let i = 0; i < initCount; i++) {
      particles.push(createParticle(type, canvas.width, canvas.height));
    }

    const replenish = () => {
      const target = getTargetCount(type);
      while (particles.length < target) {
        const p = createParticle(type, canvas.width, canvas.height);
        if (type === 'ribbon') {
          if (Math.random() < 0.3) {
            particles.push(new ConfettiParticle(canvas.width, canvas.height));
          }
        }
        if (type === 'gate') {
          p.x = canvas.width / 2;
          p.y = canvas.height / 2;
          p.opacity = 1;
        }
        particles.push(p);
      }
    };

    // Setup fireworks launching
    const launchFireworks = () => {
      if (type !== 'fireworks') return;

      const launch = () => {
        const rocket = new FireworkRocket(canvas.width, canvas.height, (rx, ry) => {
          const flareCount = 30 + Math.floor(Math.random() * 30);
          const palette = ['#ff4e6a', '#feca57', '#00d2d3', '#5f27cd', '#ff9f43', '#48dbfb', '#ff6b6b', '#54a0ff', '#ff9ff3', '#01a3a4'];
          const color = palette[Math.floor(Math.random() * palette.length)];
          for (let i = 0; i < flareCount; i++) {
            particles.push(new FireworkFlare(rx, ry, color));
          }
        });
        particles.push(rocket);

        const delay = 800 + Math.random() * 700;
        const timer = setTimeout(launch, delay);
        fireworkTimers.push(timer);
      };

      launch();
    };

    if (type === 'fireworks') {
      launchFireworks();
    }

    // Animation Loop
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update(canvas.width, canvas.height);
        if (p.dead) {
          particles.splice(i, 1);
        } else {
          p.draw(ctx);
        }
      }

      if (type !== 'fireworks') {
        replenish();
      }

      rafId = requestAnimationFrame(tick);
    };

    tick();

    // Cleanups
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      fireworkTimers.forEach(clearTimeout);
    };
  }, [type, active, isPreview]);

  if (!active) return null;

  if (type === 'balloons') {
    return (
      <div className="balloons-container" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 98, overflow: 'hidden' }}>
        {balloons.map((b, i) => (
          <div
            key={i}
            className="balloon-dom"
            style={{
              backgroundColor: b.color,
              left: b.left,
              '--dur': b.dur,
              '--drift': b.drift,
              animationDelay: b.delay,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      id={isPreview ? "preview-canvas" : "animation-canvas"}
      style={{
        position: isPreview ? 'absolute' : 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: isPreview ? 1 : 99,
      }}
    />
  );
}
