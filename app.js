document.addEventListener('DOMContentLoaded', function () {

  // ─── Element References ─────────────────────────────────────────────
  const creatorSection = document.getElementById('creator-section');
  const receiverSection = document.getElementById('receiver-section');
  const birthdayForm = document.getElementById('birthday-form');
  const inputName = document.getElementById('input-name');
  const inputDate = document.getElementById('input-date');
  const themeChips = document.querySelectorAll('.theme-chip');
  const animChips = document.querySelectorAll('.anim-chip');
  const fontFamily = document.getElementById('font-family');
  const fontSize = document.getElementById('font-size');
  const tbBtns = document.querySelectorAll('.tb-btn[data-cmd]');
  const textColor = document.getElementById('text-color');
  const wordartPicker = document.getElementById('wordart-picker');
  const messageEditor = document.getElementById('message-editor');
  const mediaTabs = document.querySelectorAll('.mtab[data-tab]');
  const imageUrl = document.getElementById('image-url');
  const videoUrl = document.getElementById('video-url');
  const audioUrl = document.getElementById('audio-url');
  const giftsList = document.getElementById('gifts-list');
  const addGiftBtn = document.getElementById('add-gift-btn');
  const previewAnimBtn = document.getElementById('preview-anim-btn');
  const previewCanvas = document.getElementById('preview-canvas');
  const previewFrame = document.getElementById('preview-frame');
  const prevName = document.getElementById('prev-name');
  const prevAge = document.getElementById('prev-age');
  const prevMessage = document.getElementById('prev-message');
  const prevMedia = document.getElementById('prev-media');
  const prevGifts = document.getElementById('prev-gifts');
  const linkModal = document.getElementById('link-modal');
  const shareLink = document.getElementById('share-link');
  const copyBtn = document.getElementById('copy-btn');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const dateLockScreen = document.getElementById('date-lock-screen');
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins = document.getElementById('cd-mins');
  const cdSecs = document.getElementById('cd-secs');
  const lockSubText = document.getElementById('lock-sub-text');
  const unwrapOverlay = document.getElementById('unwrap-overlay');
  const uwBox = document.getElementById('uw-box');
  const uwCurtains = document.getElementById('uw-curtains');
  const uwCurtainBtn = document.getElementById('uw-curtain-btn');
  const uwGates = document.getElementById('uw-gates');
  const uwGateBtn = document.getElementById('uw-gate-btn');
  const uwWarp = document.getElementById('uw-warp');
  const uwWarpBtn = document.getElementById('uw-warp-btn');
  const receiverCard = document.getElementById('receiver-card');
  const rcName = document.getElementById('rc-name');
  const rcAge = document.getElementById('rc-age');
  const rcMessage = document.getElementById('rc-message');
  const rcMedia = document.getElementById('rc-media');
  const rcGifts = document.getElementById('rc-gifts');
  const rcGiftsGrid = document.getElementById('rc-gifts-grid');
  const replayBtn = document.getElementById('replay-btn');
  const bgMusic = document.getElementById('bg-music');
  const animationCanvas = document.getElementById('animation-canvas');

  let giftCount = 0;
  let giftIdCounter = 0;
  let currentWordart = 'none';
  let countdownInterval = null;
  let mainParticleEngine = null;
  let previewParticleEngine = null;
  let previewTimeout = null;
  let receiverData = null;
  let fireworkLaunchTimers = [];

  // ─── 18. Encoding / Decoding ────────────────────────────────────────
  function encodeData(obj) {
    var json = JSON.stringify(obj);
    return btoa(unescape(encodeURIComponent(json)));
  }

  function decodeData(str) {
    try {
      var json = decodeURIComponent(escape(atob(str)));
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  // ─── 19. YouTube ID Extraction ──────────────────────────────────────
  function getYouTubeId(url) {
    if (!url) return null;
    var regex = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    var match = url.match(regex);
    return match ? match[1] : null;
  }

  // ─── 20. Age Calculation ────────────────────────────────────────────
  function calcAge(dateStr) {
    var birth = new Date(dateStr);
    var today = new Date();
    var age = today.getFullYear() - birth.getFullYear();
    var monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // ─── 17. PARTICLE ENGINE CLASS ──────────────────────────────────────

  class ParticleEngine {
    constructor(canvas, ctx) {
      this.canvas = canvas;
      this.ctx = ctx;
      this.particles = [];
      this.active = false;
      this.rafId = null;
      this.domEls = [];
      this.fireworkTimers = [];
    }

    start(type) {
      this.stop();
      this.active = true;
      this.type = type;

      if (type === 'balloons') {
        this._spawnBalloons();
        return;
      }

      if (type === 'fireworks') {
        this._launchFireworks();
      } else {
        this._initParticles(type);
      }

      this.tick();
    }

    stop() {
      this.active = false;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.particles = [];
      // Clean up DOM elements (balloons)
      this.domEls.forEach(function (el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
      this.domEls = [];
      // Clean up firework timers
      this.fireworkTimers.forEach(function (t) { clearTimeout(t); });
      this.fireworkTimers = [];
    }

    tick() {
      if (!this.active) return;
      var self = this;
      var ctx = this.ctx;
      var w = this.canvas.width;
      var h = this.canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Update and draw
      for (var i = this.particles.length - 1; i >= 0; i--) {
        var p = this.particles[i];
        p.update(w, h);
        if (p.dead) {
          this.particles.splice(i, 1);
        } else {
          p.draw(ctx);
        }
      }

      // Replenish particles
      this._replenish();

      this.rafId = requestAnimationFrame(function () { self.tick(); });
    }

    _initParticles(type) {
      var w = this.canvas.width;
      var h = this.canvas.height;
      var count = 0;

      switch (type) {
        case 'confetti': count = 60; break;
        case 'sparkles': count = 50; break;
        case 'hearts': count = 40; break;
        case 'pixel': count = 50; break;
        case 'ribbon': count = 25; break;
        case 'curtains': count = 40; break;
        case 'gate': count = 50; break;
        case 'spacewarp': count = 200; break;
        default: count = 50;
      }

      for (var i = 0; i < count; i++) {
        this.particles.push(this._createParticle(type, w, h));
      }
    }

    _createParticle(type, w, h) {
      switch (type) {
        case 'confetti':
          return new ConfettiParticle(w, h);
        case 'curtains':
          return new CurtainParticle(w, h);
        case 'gate':
          return new GateParticle(w, h);
        case 'sparkles':
          return new SparkleParticle(w, h);
        case 'hearts':
          return new HeartParticle(w, h);
        case 'pixel':
          return new PixelParticle(w, h);
        case 'ribbon':
          return new RibbonParticle(w, h);
        case 'spacewarp':
          return new StarWarpParticle(w, h);
        default:
          return new ConfettiParticle(w, h);
      }
    }

    _replenish() {
      var w = this.canvas.width;
      var h = this.canvas.height;
      var type = this.type;

      if (type === 'balloons' || type === 'fireworks') return;

      var target;
      switch (type) {
        case 'confetti': target = 50; break;
        case 'curtains': target = 35; break;
        case 'gate': target = 40; break;
        case 'sparkles': target = 40; break;
        case 'hearts': target = 30; break;
        case 'pixel': target = 40; break;
        case 'ribbon': target = 20; break;
        case 'spacewarp': target = 150; break;
        default: target = 50;
      }

      while (this.particles.length < target) {
        var p = this._createParticle(type, w, h);
        if (type === 'ribbon') {
          // Also add confetti for ribbon
          if (Math.random() < 0.3) {
            this.particles.push(new ConfettiParticle(w, h));
          }
        }
        // For gates, keep them spawning at center
        if (type === 'gate') {
          p.x = w / 2;
          p.y = h / 2;
          p.opacity = 1;
        }
        this.particles.push(p);
      }
    }

    _spawnBalloons() {
      var self = this;
      var colors = ['#ff4e6a', '#ff9f43', '#00d2d3', '#feca57', '#5f27cd', '#01a3a4', '#ff6b6b', '#48dbfb', '#ff9ff3', '#54a0ff'];
      for (var i = 0; i < 30; i++) {
        var div = document.createElement('div');
        div.className = 'balloon-dom';
        div.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        div.style.left = (10 + Math.random() * 80) + 'vw';
        div.style.setProperty('--dur', (5 + Math.random() * 5) + 's');
        div.style.setProperty('--drift', (Math.random() * 100 - 50) + 'px');
        div.style.animationDelay = (Math.random() * 5) + 's';
        document.body.appendChild(div);
        self.domEls.push(div);
      }
    }

    _launchFireworks() {
      var self = this;
      if (!this.active) return;

      var w = this.canvas.width;
      var h = this.canvas.height;

      function launch() {
        if (!self.active) return;
        var rocket = new FireworkRocket(w, h, function (rx, ry) {
          // Explosion callback
          var flareCount = 30 + Math.floor(Math.random() * 30);
          var palette = ['#ff4e6a', '#feca57', '#00d2d3', '#5f27cd', '#ff9f43', '#48dbfb', '#ff6b6b', '#54a0ff', '#ff9ff3', '#01a3a4'];
          var color = palette[Math.floor(Math.random() * palette.length)];
          for (var i = 0; i < flareCount; i++) {
            self.particles.push(new FireworkFlare(rx, ry, color));
          }
        });
        self.particles.push(rocket);

        var delay = 800 + Math.random() * 700;
        var timer = setTimeout(launch, delay);
        self.fireworkTimers.push(timer);
      }

      launch();
      this.tick();
    }
  }

  // ─── Particle Classes ───────────────────────────────────────────────

  // a) Confetti
  function ConfettiParticle(w, h) {
    var palette = ['#ff4e6a', '#feca57', '#00d2d3', '#5f27cd', '#ff9f43', '#48dbfb', '#ff6b6b', '#54a0ff', '#ff9ff3', '#01a3a4', '#f368e0', '#2ed573'];
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
  ConfettiParticle.prototype.update = function (w, h) {
    this.x += this.velX;
    this.y += this.velY;
    this.rotation += this.rotSpeed;
    if (this.y > h + 20) this.dead = true;
  };
  ConfettiParticle.prototype.draw = function (ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
    ctx.restore();
  };

  // b) Sparkle
  function SparkleParticle(w, h) {
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
  SparkleParticle.prototype.update = function (w, h) {
    this.x += this.velX;
    this.y += this.velY;
    this.life--;
    if (this.life <= 0) this.dead = true;
  };
  SparkleParticle.prototype.draw = function (ctx) {
    var alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'hsl(' + this.hue + ', 100%, 60%)';
    ctx.fillStyle = 'hsl(' + this.hue + ', 100%, 70%)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // c) Hearts
  function HeartParticle(w, h) {
    var cx = w / 2;
    var cy = h / 2;
    var angle = Math.random() * Math.PI * 2;
    var speed = 2 + Math.random() * 4;
    this.x = cx;
    this.y = cy;
    this.size = 8 + Math.random() * 12;
    this.velX = Math.cos(angle) * speed;
    this.velY = Math.sin(angle) * speed;
    this.opacity = 1;
    this.decay = 0.008 + Math.random() * 0.012;
    var pinks = ['#ff4e6a', '#ff6b81', '#e84393', '#fd79a8', '#e17055', '#d63031', '#ff7675', '#fab1a0'];
    this.color = pinks[Math.floor(Math.random() * pinks.length)];
    this.dead = false;
  }
  HeartParticle.prototype.update = function (w, h) {
    this.x += this.velX;
    this.y += this.velY;
    this.velY += 0.02;
    this.opacity -= this.decay;
    if (this.opacity <= 0) this.dead = true;
  };
  HeartParticle.prototype.draw = function (ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    var s = this.size;
    var x = this.x;
    var y = this.y;
    ctx.moveTo(x, y + s / 4);
    ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s / 4);
    ctx.bezierCurveTo(x - s / 2, y + s / 2, x, y + s * 0.7, x, y + s);
    ctx.bezierCurveTo(x, y + s * 0.7, x + s / 2, y + s / 2, x + s / 2, y + s / 4);
    ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + s / 4);
    ctx.fill();
    ctx.restore();
  };

  // d) Firework Rocket
  function FireworkRocket(w, h, onExplode) {
    this.x = Math.random() * w;
    this.y = h;
    this.targetY = h * (0.15 + Math.random() * 0.35);
    this.velY = -(10 + Math.random() * 6);
    this.onExplode = onExplode;
    this.dead = false;
    this.color = '#fff';
    this.trail = [];
  }
  FireworkRocket.prototype.update = function (w, h) {
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 8) this.trail.shift();
    this.y += this.velY;
    this.velY += 0.15;
    if (this.y <= this.targetY || this.velY >= 0) {
      this.dead = true;
      if (this.onExplode) this.onExplode(this.x, this.y);
    }
  };
  FireworkRocket.prototype.draw = function (ctx) {
    ctx.save();
    for (var i = 0; i < this.trail.length; i++) {
      var alpha = (i + 1) / this.trail.length * 0.5;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffeaa7';
      ctx.fillRect(this.trail[i].x - 1, this.trail[i].y - 1, 2, 2);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
    ctx.restore();
  };

  // e) Firework Flare
  function FireworkFlare(x, y, color) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 1 + Math.random() * 5;
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
  FireworkFlare.prototype.update = function (w, h) {
    this.x += this.velX;
    this.y += this.velY;
    this.velY += 0.03;
    this.velX *= 0.99;
    this.velY *= 0.99;
    this.opacity -= this.decay;
    if (this.opacity <= 0) this.dead = true;
  };
  FireworkFlare.prototype.draw = function (ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // f) Pixel
  function PixelParticle(w, h) {
    var cx = w / 2;
    var cy = h / 2;
    var angle = Math.random() * Math.PI * 2;
    var speed = 3 + Math.random() * 5;
    var neons = ['#0ff', '#f0f', '#ff0', '#0f0', '#f00', '#00f', '#ff6600', '#ff0099', '#00ff99', '#9900ff'];
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
  PixelParticle.prototype.update = function (w, h) {
    this.x += this.velX;
    this.y += this.velY;
    this.life--;
    if (this.life <= 0) this.dead = true;
  };
  PixelParticle.prototype.draw = function (ctx) {
    ctx.save();
    ctx.globalAlpha = this.life / this.maxLife;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    ctx.restore();
  };

  // g) Ribbon
  function RibbonParticle(w, h) {
    var palette = ['#ff4e6a', '#feca57', '#00d2d3', '#5f27cd', '#ff9f43', '#48dbfb', '#ff6b6b', '#54a0ff', '#ff9ff3'];
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
  RibbonParticle.prototype.update = function (w, h) {
    this.x += this.velX + Math.sin(this.wave) * 0.5;
    this.y += this.velY;
    this.wave += this.waveSpeed;
    if (this.y > h + 50) this.dead = true;
  };
  RibbonParticle.prototype.draw = function (ctx) {
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    var x = this.x;
    var y = this.y;
    var len = this.length;
    ctx.moveTo(x, y);
    var cp1x = x + Math.sin(this.wave) * 15;
    var cp1y = y + len * 0.33;
    var cp2x = x - Math.sin(this.wave + 1) * 15;
    var cp2y = y + len * 0.66;
    var ex = x + Math.sin(this.wave + 2) * 10;
    var ey = y + len;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey);
    ctx.stroke();
    ctx.restore();
  };

  // h) StarWarp (for spacewarp animation)
  function StarWarpParticle(w, h) {
    this.cx = w / 2;
    this.cy = h / 2;
    this.reset(w, h);
    this.dead = false;
  }
  StarWarpParticle.prototype.reset = function (w, h) {
    this.x = (Math.random() - 0.5) * w;
    this.y = (Math.random() - 0.5) * h;
    this.z = Math.random() * w;
    this.pz = this.z;
    this.speed = 5 + Math.random() * 15;
  };
  StarWarpParticle.prototype.update = function (w, h) {
    this.cx = w / 2;
    this.cy = h / 2;
    this.pz = this.z;
    this.z -= this.speed;
    if (this.z <= 0) {
      this.reset(w, h);
      this.pz = this.z;
    }
  };
  StarWarpParticle.prototype.draw = function (ctx) {
    var w = ctx.canvas.width;
    var h = ctx.canvas.height;
    var sx = (this.x / this.z) * w + this.cx;
    var sy = (this.y / this.z) * h + this.cy;
    var px = (this.x / this.pz) * w + this.cx;
    var py = (this.y / this.pz) * h + this.cy;

    var alpha = Math.min(1, (1 - this.z / w) * 1.5);
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(0.5, (1 - this.z / w) * 3);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(sx, sy);
    ctx.stroke();
    ctx.restore();
  };

  // i) Curtain reveal particles
  function CurtainParticle(w, h) {
    var symbols = ['🌟', '⭐', '✨', '🎵', '🎶', '🎭'];
    this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
    this.x = Math.random() * w;
    this.y = Math.random() * -h;
    this.size = 14 + Math.random() * 12;
    this.velX = Math.random() * 2 - 1;
    this.velY = 2 + Math.random() * 3;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.05;
    this.opacity = 1;
    this.dead = false;
  }
  CurtainParticle.prototype.update = function (w, h) {
    this.x += this.velX;
    this.y += this.velY;
    this.rotation += this.rotSpeed;
    if (this.y > h + 30) this.dead = true;
  };
  CurtainParticle.prototype.draw = function (ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.font = this.size + 'px Poppins';
    ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FFD700';
    ctx.fillText(this.symbol, 0, 0);
    ctx.restore();
  };

  // j) Gate reveal particles
  function GateParticle(w, h) {
    var symbols = ['🔑', '🗝️', '🔒', '🔓', '✨'];
    this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
    this.x = w / 2;
    this.y = h / 2;
    var angle = Math.random() * Math.PI * 2;
    var speed = 2 + Math.random() * 5;
    this.velX = Math.cos(angle) * speed;
    this.velY = Math.sin(angle) * speed;
    this.size = 16 + Math.random() * 10;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.1;
    this.opacity = 1;
    this.decay = 0.01 + Math.random() * 0.01;
    this.dead = false;
  }
  GateParticle.prototype.update = function (w, h) {
    this.x += this.velX;
    this.y += this.velY;
    this.rotation += this.rotSpeed;
    this.velY += 0.02; // slight gravity
    this.opacity -= this.decay;
    if (this.opacity <= 0) this.dead = true;
  };
  GateParticle.prototype.draw = function (ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.font = this.size + 'px Poppins';
    ctx.fillStyle = '#FFD700';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#F2C744';
    ctx.fillText(this.symbol, 0, 0);
    ctx.restore();
  };


  // ─── 2. URL Router ─────────────────────────────────────────────────

  function route() {
    var hash = window.location.hash;
    if (hash.indexOf('#card=') === 0) {
      var encoded = hash.substring(6);
      var data = decodeData(encoded);
      if (data) {
        switchToReceiver(data);
      } else {
        switchToCreator();
      }
    } else {
      switchToCreator();
    }
  }

  function switchToCreator() {
    if (creatorSection) creatorSection.classList.add('active');
    if (receiverSection) receiverSection.classList.remove('active');
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  function switchToReceiver(data) {
    if (creatorSection) creatorSection.classList.remove('active');
    if (receiverSection) receiverSection.classList.add('active');
    receiverData = data;

    // Apply theme
    document.body.className = 'theme-' + (data.theme || 'party');

    // Date lock check
    var birthDate = new Date(data.date);
    var today = new Date();
    var targetMonth = birthDate.getMonth();
    var targetDay = birthDate.getDate();

    var targetThisYear = new Date(today.getFullYear(), targetMonth, targetDay);

    // Compare dates (date only, no time)
    var todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (todayDateOnly < targetThisYear) {
      // Birthday hasn't arrived yet this year — show lock screen
      if (dateLockScreen) {
        dateLockScreen.classList.remove('hidden');
        dateLockScreen.style.display = '';
      }
      if (unwrapOverlay) {
        unwrapOverlay.classList.add('hidden');
      }
      if (receiverCard) {
        receiverCard.classList.add('hidden');
        receiverCard.classList.remove('reveal');
      }
      if (lockSubText) lockSubText.textContent = "It's not your birthday yet! Come back on " + (targetMonth + 1) + '/' + targetDay + '.';

      // Start countdown
      if (countdownInterval) clearInterval(countdownInterval);
      countdownInterval = setInterval(function () {
        var now = new Date();
        var diff = targetThisYear.getTime() - now.getTime();
        if (diff <= 0) {
          clearInterval(countdownInterval);
          countdownInterval = null;
          showUnwrap(data);
          return;
        }
        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var secs = Math.floor((diff % (1000 * 60)) / 1000);
        if (cdDays) cdDays.textContent = String(days).padStart(2, '0');
        if (cdHours) cdHours.textContent = String(hours).padStart(2, '0');
        if (cdMins) cdMins.textContent = String(mins).padStart(2, '0');
        if (cdSecs) cdSecs.textContent = String(secs).padStart(2, '0');
      }, 1000);
    } else {
      // Birthday has arrived or passed — show unwrap
      showUnwrap(data);
    }
  }

  // ─── 13. Receiver Mode — Unwrap ─────────────────────────────────────

  function showUnwrap(data) {
    if (dateLockScreen) {
      dateLockScreen.classList.add('hidden');
    }
    if (unwrapOverlay) {
      unwrapOverlay.classList.remove('hidden');
      unwrapOverlay.style.display = '';
      unwrapOverlay.classList.remove('fade-out');
    }
    if (receiverCard) {
      receiverCard.classList.add('hidden');
      receiverCard.classList.remove('reveal');
    }

    // Hide all .uw-element
    var uwElements = document.querySelectorAll('.uw-element');
    uwElements.forEach(function (el) { el.classList.add('hidden'); el.style.display = 'none'; });

    // Reset states
    if (uwBox) {
      var giftBox = uwBox.querySelector('.gift-box');
      if (giftBox) giftBox.classList.remove('opened');
    }
    if (uwCurtains) uwCurtains.classList.remove('opened');
    if (uwGates) uwGates.classList.remove('opened');
    if (uwWarp) {
      var warpRing = uwWarp.querySelector('.warp-ring');
      if (warpRing) warpRing.classList.remove('zoomed');
    }

    // Show the correct unwrap based on animation
    var anim = data.animation || 'confetti';
    switch (anim) {
      case 'curtains':
        if (uwCurtains) {
          uwCurtains.classList.remove('hidden');
          uwCurtains.style.display = '';
        }
        break;
      case 'gate':
        if (uwGates) {
          uwGates.classList.remove('hidden');
          uwGates.style.display = '';
        }
        break;
      case 'spacewarp':
        if (uwWarp) {
          uwWarp.classList.remove('hidden');
          uwWarp.style.display = '';
        }
        break;
      default:
        if (uwBox) {
          uwBox.classList.remove('hidden');
          uwBox.style.display = '';
        }
        break;
    }

    // Populate card content
    if (rcName) rcName.textContent = 'Happy Birthday, ' + (data.name || '') + '!';

    if (data.date) {
      var age = calcAge(data.date);
      if (rcAge) {
        rcAge.textContent = age + ' years young!';
        rcAge.style.display = '';
      }
    } else {
      if (rcAge) rcAge.style.display = 'none';
    }

    if (rcMessage) {
      rcMessage.innerHTML = data.messageHTML || '';
      
      // Apply customized typography styles
      rcMessage.style.fontFamily = data.fontFamily || '';
      rcMessage.style.fontSize = data.fontSize || '';
      rcMessage.style.textAlign = data.textAlign || '';
      rcMessage.style.color = data.textColor || '';
      
      // Apply wordart
      rcMessage.className = 'rc-message';
      if (data.wordart && data.wordart !== 'none') {
        rcMessage.classList.add('wordart-' + data.wordart);
      }
    }

    // Media
    if (rcMedia) rcMedia.innerHTML = '';

    if (data.imageUrl) {
      if (rcMedia) {
        rcMedia.style.display = '';
        var img = document.createElement('img');
        img.src = data.imageUrl;
        img.alt = 'Birthday image';
        img.style.maxWidth = '100%';
        img.style.borderRadius = '12px';
        rcMedia.appendChild(img);
      }
    } else if (data.videoUrl) {
      if (rcMedia) {
        rcMedia.style.display = '';
        var ytId = getYouTubeId(data.videoUrl);
        if (ytId) {
          var iframe = document.createElement('iframe');
          iframe.src = 'https://www.youtube.com/embed/' + ytId;
          iframe.width = '100%';
          iframe.height = '315';
          iframe.frameBorder = '0';
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.allowFullscreen = true;
          iframe.style.borderRadius = '12px';
          rcMedia.appendChild(iframe);
        } else {
          var video = document.createElement('video');
          video.src = data.videoUrl;
          video.controls = true;
          video.style.maxWidth = '100%';
          video.style.borderRadius = '12px';
          rcMedia.appendChild(video);
        }
      }
    } else {
      if (rcMedia) rcMedia.style.display = 'none';
    }

    // Audio
    if (data.audioUrl && bgMusic) {
      bgMusic.src = data.audioUrl;
    }

    // Gifts
    var giftEmojis = ['🎁', '🎀', '✨', '💎', '🎮'];
    if (data.gifts && data.gifts.length > 0) {
      if (rcGifts) rcGifts.style.display = '';
      if (rcGiftsGrid) {
        rcGiftsGrid.innerHTML = '';
        data.gifts.forEach(function (gift, index) {
          var a = document.createElement('a');
          a.className = 'rc-gift-card';
          a.href = gift.url || '#';
          a.target = '_blank';
          var emoji = giftEmojis[index % giftEmojis.length];
          a.innerHTML = '<span class="gift-emoji">' + emoji + '</span><strong>' + escapeHtml(gift.title || 'Gift') + '</strong><small>Click to open</small>';
          rcGiftsGrid.appendChild(a);
        });
      }
    } else {
      if (rcGifts) rcGifts.style.display = 'none';
    }
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── 14. Unwrap Triggers ────────────────────────────────────────────

  if (uwBox) {
    uwBox.addEventListener('click', function () {
      var giftBox = uwBox.querySelector('.gift-box');
      if (giftBox) giftBox.classList.add('opened');
      setTimeout(function () {
        revealCard(receiverData);
      }, 800);
    });
  }

  if (uwCurtainBtn) {
    uwCurtainBtn.addEventListener('click', function () {
      if (uwCurtains) uwCurtains.classList.add('opened');
      setTimeout(function () {
        revealCard(receiverData);
      }, 1200);
    });
  }

  if (uwGateBtn) {
    uwGateBtn.addEventListener('click', function () {
      if (uwGates) uwGates.classList.add('opened');
      setTimeout(function () {
        revealCard(receiverData);
      }, 1200);
    });
  }

  if (uwWarpBtn) {
    uwWarpBtn.addEventListener('click', function () {
      if (uwWarp) {
        var warpRing = uwWarp.querySelector('.warp-ring');
        if (warpRing) warpRing.classList.add('zoomed');
      }
      setTimeout(function () {
        revealCard(receiverData);
      }, 800);
    });
  }

  // ─── 15. revealCard ─────────────────────────────────────────────────

  function revealCard(data) {
    if (!data) return;

    // Fade out overlay
    if (unwrapOverlay) {
      unwrapOverlay.classList.add('fade-out');
      setTimeout(function () {
        unwrapOverlay.classList.add('hidden');
      }, 1000);
    }

    // Show receiver card
    if (receiverCard) {
      receiverCard.classList.remove('hidden');
      setTimeout(function () {
        receiverCard.classList.add('reveal');
      }, 100);
    }

    // Play music
    if (bgMusic && bgMusic.src) {
      try {
        bgMusic.play().catch(function () { /* silently fail */ });
      } catch (e) { /* silently fail */ }
    }

    // Start full-screen animation
    if (animationCanvas) {
      animationCanvas.width = window.innerWidth;
      animationCanvas.height = window.innerHeight;
      var ctx = animationCanvas.getContext('2d');

      if (mainParticleEngine) mainParticleEngine.stop();
      mainParticleEngine = new ParticleEngine(animationCanvas, ctx);
      mainParticleEngine.start(data.animation || 'confetti');
    }
  }

  // ─── 16. Replay ────────────────────────────────────────────────────

  if (replayBtn) {
    replayBtn.addEventListener('click', function () {
      if (mainParticleEngine) mainParticleEngine.stop();
      if (receiverCard) {
        receiverCard.classList.add('hidden');
        receiverCard.classList.remove('reveal');
      }
      if (unwrapOverlay) {
        unwrapOverlay.classList.remove('fade-out');
      }
      if (receiverData) {
        showUnwrap(receiverData);
      }
    });
  }

  // ─── 3. Theme Switching ─────────────────────────────────────────────

  themeChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var themeValue = chip.getAttribute('data-theme');
      // Toggle active class
      themeChips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      // Set radio
      var radio = document.querySelector('input[name="theme"][value="' + themeValue + '"]');
      if (radio) radio.checked = true;
      // Set body class
      document.body.className = 'theme-' + themeValue;
    });
  });

  // ─── 4. Animation Chip Switching ────────────────────────────────────

  animChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var animValue = chip.getAttribute('data-anim');
      // Toggle active class
      animChips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      // Set radio
      var radio = document.querySelector('input[name="animation"][value="' + animValue + '"]');
      if (radio) radio.checked = true;
    });
  });

  // ─── 5. Rich Text Editor ───────────────────────────────────────────

  tbBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var cmd = btn.getAttribute('data-cmd');
      
      // Apply alignment globally to messageEditor for immediate full card alignment
      if (cmd === 'justifyLeft' || cmd === 'justifyCenter' || cmd === 'justifyRight') {
        if (messageEditor) {
          var alignMap = {
            'justifyLeft': 'left',
            'justifyCenter': 'center',
            'justifyRight': 'right'
          };
          messageEditor.style.textAlign = alignMap[cmd];
        }
      }
      
      document.execCommand(cmd, false, null);
      updatePreview();
      messageEditor && messageEditor.focus();
    });
  });

  if (fontFamily) {
    fontFamily.addEventListener('change', function () {
      if (messageEditor) {
        messageEditor.style.fontFamily = fontFamily.value;
      }
      document.execCommand('fontName', false, fontFamily.value);
      updatePreview();
      messageEditor && messageEditor.focus();
    });
  }

  if (fontSize) {
    fontSize.addEventListener('change', function () {
      if (messageEditor) {
        var sizeMap = {
          '3': '0.9rem',
          '4': '1.1rem',
          '5': '1.4rem',
          '6': '1.8rem'
        };
        messageEditor.style.fontSize = sizeMap[fontSize.value] || '1.1rem';
      }
      document.execCommand('fontSize', false, fontSize.value);
      updatePreview();
      messageEditor && messageEditor.focus();
    });
  }

  if (textColor) {
    textColor.addEventListener('change', function () {
      if (messageEditor) {
        messageEditor.style.color = textColor.value;
      }
      document.execCommand('foreColor', false, textColor.value);
      updatePreview();
      messageEditor && messageEditor.focus();
    });
  }

  if (wordartPicker) {
    wordartPicker.addEventListener('change', function () {
      if (messageEditor) {
        // Remove all existing wordart classes
        var classes = messageEditor.className.split(' ');
        classes = classes.filter(function (c) { return c.indexOf('wordart-') !== 0; });
        messageEditor.className = classes.join(' ');
        if (wordartPicker.value !== 'none') {
          messageEditor.classList.add('wordart-' + wordartPicker.value);
        }
      }
      currentWordart = wordartPicker.value;
      updatePreview();
    });
  }

  // ─── 6. Media Tabs ─────────────────────────────────────────────────

  mediaTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var tabName = tab.getAttribute('data-tab');
      // Toggle active on tabs
      mediaTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      // Toggle panes
      var panes = document.querySelectorAll('.mpane');
      panes.forEach(function (p) { p.classList.remove('active'); });
      var targetPane = document.getElementById(tabName);
      if (targetPane) targetPane.classList.add('active');
      updatePreview();
    });
  });

  // Helper: Image Compression using Canvas
  function compressImage(file, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var maxDim = 400; // Limit image dimension for sharing url
        var width = img.width;
        var height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round(height * maxDim / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round(width * maxDim / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        var compressedBase64 = canvas.toDataURL('image/jpeg', 0.6); // 60% quality
        callback(compressedBase64);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // File Upload Listeners
  var imageFile = document.getElementById('image-file');
  var imageFileName = document.getElementById('image-file-name');
  var uploadedImageBase64 = '';
  if (imageFile) {
    imageFile.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (file) {
        if (imageFileName) imageFileName.textContent = file.name;
        if (imageUrl) imageUrl.value = ''; // clear url input to avoid conflict
        compressImage(file, function (compressedBase64) {
          uploadedImageBase64 = compressedBase64;
          updatePreview();
        });
      } else {
        if (imageFileName) imageFileName.textContent = 'No image selected';
        uploadedImageBase64 = '';
        updatePreview();
      }
    });
  }

  var videoFile = document.getElementById('video-file');
  var videoFileName = document.getElementById('video-file-name');
  var uploadedVideoBase64 = '';
  if (videoFile) {
    videoFile.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (file) {
        if (file.size > 1.5 * 1024 * 1024) {
          alert('⚠️ This video is too large to fit in a shareable link! Please choose a file under 1.5MB, or paste a video web link instead.');
          videoFile.value = '';
          if (videoFileName) videoFileName.textContent = 'No video selected';
          uploadedVideoBase64 = '';
          updatePreview();
          return;
        }
        if (videoFileName) videoFileName.textContent = file.name;
        if (videoUrl) videoUrl.value = ''; // clear url input to avoid conflict
        var reader = new FileReader();
        reader.onload = function (event) {
          uploadedVideoBase64 = event.target.result;
          updatePreview();
        };
        reader.readAsDataURL(file);
      } else {
        if (videoFileName) videoFileName.textContent = 'No video selected';
        uploadedVideoBase64 = '';
        updatePreview();
      }
    });
  }

  var audioFile = document.getElementById('audio-file');
  var audioFileName = document.getElementById('audio-file-name');
  var uploadedAudioBase64 = '';
  if (audioFile) {
    audioFile.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (file) {
        if (file.size > 1.5 * 1024 * 1024) {
          alert('⚠️ This audio file is too large to fit in a shareable link! Please choose a file under 1.5MB, or paste a web link instead.');
          audioFile.value = '';
          if (audioFileName) audioFileName.textContent = 'No audio selected';
          uploadedAudioBase64 = '';
          updatePreview();
          return;
        }
        if (audioFileName) audioFileName.textContent = file.name;
        if (audioUrl) audioUrl.value = ''; // clear url input to avoid conflict
        var reader = new FileReader();
        reader.onload = function (event) {
          uploadedAudioBase64 = event.target.result;
          updatePreview();
        };
        reader.readAsDataURL(file);
      } else {
        if (audioFileName) audioFileName.textContent = 'No audio selected';
        uploadedAudioBase64 = '';
        updatePreview();
      }
    });
  }

  // Clear file upload state on direct URL input
  if (imageUrl) {
    imageUrl.addEventListener('input', function () {
      if (imageUrl.value.trim() !== '') {
        if (imageFile) imageFile.value = '';
        if (imageFileName) imageFileName.textContent = 'No image selected';
        uploadedImageBase64 = '';
      }
      updatePreview();
    });
  }
  if (videoUrl) {
    videoUrl.addEventListener('input', function () {
      if (videoUrl.value.trim() !== '') {
        if (videoFile) videoFile.value = '';
        if (videoFileName) videoFileName.textContent = 'No video selected';
        uploadedVideoBase64 = '';
      }
      updatePreview();
    });
  }
  if (audioUrl) {
    audioUrl.addEventListener('input', function () {
      if (audioUrl.value.trim() !== '') {
        if (audioFile) audioFile.value = '';
        if (audioFileName) audioFileName.textContent = 'No audio selected';
        uploadedAudioBase64 = '';
      }
      updatePreview();
    });
  }

  // ─── 7. Gift Management ────────────────────────────────────────────

  if (addGiftBtn) {
    addGiftBtn.addEventListener('click', function () {
      if (giftCount >= 5) return;
      giftIdCounter++;
      giftCount++;
      var id = 'gift-' + giftIdCounter;
      var row = document.createElement('div');
      row.className = 'gift-row';
      row.id = id;
      row.innerHTML = '<input type="text" class="gift-title" placeholder="Gift name"><input type="url" class="gift-url" placeholder="Link (Amazon, Steam, etc.)"><button type="button" class="gift-remove-btn"><i class="fa-solid fa-xmark"></i></button>';
      if (giftsList) giftsList.appendChild(row);

      // Attach remove handler
      var removeBtn = row.querySelector('.gift-remove-btn');
      removeBtn.addEventListener('click', function () {
        row.parentNode.removeChild(row);
        giftCount--;
        updatePreview();
      });

      // Listen for changes for preview
      var titleInput = row.querySelector('.gift-title');
      if (titleInput) {
        titleInput.addEventListener('input', updatePreview);
      }

      updatePreview();
    });
  }

  // ─── 8. Live Preview Updates ────────────────────────────────────────

  if (inputName) inputName.addEventListener('input', updatePreview);
  if (inputDate) inputDate.addEventListener('input', updatePreview);
  if (messageEditor) messageEditor.addEventListener('input', updatePreview);

  function updatePreview() {
    // Name
    var name = inputName ? inputName.value.trim() : '';
    if (prevName) {
      prevName.textContent = name ? 'Happy Birthday, ' + name + '!' : 'Happy Birthday!';
    }

    // Age
    if (inputDate && inputDate.value) {
      var age = calcAge(inputDate.value);
      if (prevAge) {
        prevAge.textContent = age + ' years young!';
        prevAge.style.display = '';
      }
    } else {
      if (prevAge) prevAge.style.display = 'none';
    }

    // Message
    if (prevMessage && messageEditor) {
      prevMessage.innerHTML = messageEditor.innerHTML;
      // Apply wordart
      prevMessage.className = 'prev-message';
      if (currentWordart && currentWordart !== 'none') {
        prevMessage.classList.add('wordart-' + currentWordart);
      }
    }

    // Media
    var activeTabElement = document.querySelector('.mtab.active');
    var activeTab = activeTabElement ? activeTabElement.getAttribute('data-tab') : 'tab-image';
    var imgVal = imageUrl ? imageUrl.value.trim() : '';
    var vidVal = videoUrl ? videoUrl.value.trim() : '';
    var audVal = audioUrl ? audioUrl.value.trim() : '';

    if (prevMedia) {
      if (activeTab === 'tab-image' && (imgVal || uploadedImageBase64)) {
        var src = uploadedImageBase64 || imgVal;
        prevMedia.style.display = '';
        prevMedia.innerHTML = '<img src="' + escapeAttr(src) + '" alt="Preview" style="max-width:100%;border-radius:8px;">';
      } else if (activeTab === 'tab-video' && (vidVal || uploadedVideoBase64)) {
        prevMedia.style.display = '';
        var ytId = getYouTubeId(vidVal);
        if (ytId) {
          prevMedia.innerHTML = '<iframe src="https://www.youtube.com/embed/' + ytId + '" width="100%" height="150" frameborder="0" allowfullscreen style="border-radius:8px;"></iframe>';
        } else {
          var src = uploadedVideoBase64 || vidVal;
          prevMedia.innerHTML = '<video src="' + escapeAttr(src) + '" controls style="max-width:100%;border-radius:8px;max-height:150px;"></video>';
        }
      } else if (activeTab === 'tab-audio' && (audVal || uploadedAudioBase64)) {
        prevMedia.style.display = '';
        var src = uploadedAudioBase64 || audVal;
        prevMedia.innerHTML = '<audio src="' + escapeAttr(src) + '" controls style="width:100%;margin-top:10px;"></audio>';
      } else {
        prevMedia.style.display = 'none';
        prevMedia.innerHTML = '';
      }
    }

    // Gifts
    if (prevGifts && giftsList) {
      var giftRows = giftsList.querySelectorAll('.gift-row');
      if (giftRows.length > 0) {
        prevGifts.style.display = '';
        var html = '';
        giftRows.forEach(function (row) {
          var title = row.querySelector('.gift-title');
          if (title && title.value.trim()) {
            html += '<span class="prev-gift-badge">🎁 ' + escapeHtml(title.value.trim()) + '</span> ';
          }
        });
        prevGifts.innerHTML = html || '';
        if (!html) prevGifts.style.display = 'none';
      } else {
        prevGifts.style.display = 'none';
        prevGifts.innerHTML = '';
      }
    }
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ─── 9. Animation Preview ──────────────────────────────────────────

  if (previewAnimBtn) {
    previewAnimBtn.addEventListener('click', function () {
      var selectedAnim = document.querySelector('input[name="animation"]:checked');
      var animType = selectedAnim ? selectedAnim.value : 'confetti';

      if (previewCanvas && previewFrame) {
        var rect = previewFrame.getBoundingClientRect();
        previewCanvas.width = rect.width;
        previewCanvas.height = rect.height;
        var ctx = previewCanvas.getContext('2d');

        if (previewParticleEngine) previewParticleEngine.stop();
        if (previewTimeout) clearTimeout(previewTimeout);

        previewParticleEngine = new ParticleEngine(previewCanvas, ctx);
        previewParticleEngine.start(animType);

        previewTimeout = setTimeout(function () {
          if (previewParticleEngine) previewParticleEngine.stop();
          if (ctx) ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        }, 4000);
      }
    });
  }

  // ─── 10. Form Submission / Link Generation ──────────────────────────

  if (birthdayForm) {
    birthdayForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = inputName ? inputName.value.trim() : '';
      var date = inputDate ? inputDate.value : '';

      if (!name || !date) {
        alert('Please fill in the name and date fields.');
        return;
      }

      var selectedTheme = document.querySelector('input[name="theme"]:checked');
      var theme = selectedTheme ? selectedTheme.value : 'party';

      var selectedAnim = document.querySelector('input[name="animation"]:checked');
      var animation = selectedAnim ? selectedAnim.value : 'confetti';

      var msgHTML = messageEditor ? messageEditor.innerHTML : '';

      var imgUrl = uploadedImageBase64 || (imageUrl ? imageUrl.value.trim() : '');
      var vidUrl = uploadedVideoBase64 || (videoUrl ? videoUrl.value.trim() : '');
      var audUrl = uploadedAudioBase64 || (audioUrl ? audioUrl.value.trim() : '');

      // Collect gifts
      var gifts = [];
      if (giftsList) {
        var giftRows = giftsList.querySelectorAll('.gift-row');
        giftRows.forEach(function (row) {
          var titleInput = row.querySelector('.gift-title');
          var urlInput = row.querySelector('.gift-url');
          var title = titleInput ? titleInput.value.trim() : '';
          var url = urlInput ? urlInput.value.trim() : '';
          if (title) {
            gifts.push({ title: title, url: url });
          }
        });
      }

      var data = {
        name: name,
        date: date,
        theme: theme,
        animation: animation,
        messageHTML: msgHTML,
        wordart: currentWordart,
        fontFamily: messageEditor ? messageEditor.style.fontFamily : '',
        fontSize: messageEditor ? messageEditor.style.fontSize : '',
        textAlign: messageEditor ? messageEditor.style.textAlign : '',
        textColor: messageEditor ? messageEditor.style.color : '',
        imageUrl: imgUrl,
        videoUrl: vidUrl,
        audioUrl: audUrl,
        gifts: gifts
      };

      var encoded = encodeData(data);
      var fullUrl = location.origin + location.pathname + '#card=' + encoded;

      if (shareLink) shareLink.value = fullUrl;

      var sizeWarning = document.getElementById('link-size-warning');
      if (sizeWarning) {
        if (fullUrl.length > 4000) {
          sizeWarning.classList.remove('hidden');
        } else {
          sizeWarning.classList.add('hidden');
        }
      }

      if (linkModal) linkModal.classList.remove('hidden');
    });
  }

  // ─── 11. Link Copy ─────────────────────────────────────────────────

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      if (shareLink) {
        shareLink.select();
        shareLink.setSelectionRange(0, 99999);

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareLink.value).then(function () {
            showCopied();
          }).catch(function () {
            document.execCommand('copy');
            showCopied();
          });
        } else {
          document.execCommand('copy');
          showCopied();
        }
      }

      function showCopied() {
        var original = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(function () {
          copyBtn.textContent = original;
        }, 2000);
      }
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function () {
      if (linkModal) linkModal.classList.add('hidden');
    });
  }

  // ─── Handle window resize for animation canvas ─────────────────────

  window.addEventListener('resize', function () {
    if (animationCanvas && mainParticleEngine && mainParticleEngine.active) {
      animationCanvas.width = window.innerWidth;
      animationCanvas.height = window.innerHeight;
    }
  });

  // ─── Initialize Router ─────────────────────────────────────────────

  route();
  window.addEventListener('hashchange', route);

});
