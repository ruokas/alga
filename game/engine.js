import { state } from './state.js';
import { levels } from './levels.js';

const TAU = Math.PI * 2;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomRange([min, max]) {
  return min + Math.random() * (max - min);
}

/**
 * Sukuria glotniai užapvalinto stačiakampio kontūrą.
 * Keičiant spindulį galima greitai koreguoti personažų kūnų formą.
 */
function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export class DirectorGameEngine {
  constructor(canvas, { onUpdate, onEnd } = {}) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext('2d') || null;
    this.onUpdate = onUpdate;
    this.onEnd = onEnd;
    this.levelIndex = 0;
    this.config = levels[0];
    this.lastTimestamp = 0;
    this.spawnTimer = 0;
    this.tokens = [];
    this.particles = [];
    this.keys = new Set();
    this.running = false;
    this.player = this.createPlayer();
    this.director = this.createDirector();
    this.scoreFlash = 0;
    this.bgOffset = 0;
    this._boundLoop = this.loop.bind(this);
    this.attachInput();
  }

  createPlayer() {
    return {
      x: 60,
      y: this.canvas.height - 80,
      width: 36,
      height: 48,
      speed: this.config.playerSpeed,
    };
  }

  createDirector() {
    return {
      x: this.canvas.width - 120,
      y: this.canvas.height / 2 - 40,
      width: 56,
      height: 80,
      mode: 'looking',
      timer: randomRange(this.config.lookDuration),
    };
  }

  attachInput() {
    window.addEventListener('keydown', (event) => {
      if (!this.running) return;
      const key = event.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        event.preventDefault();
        this.keys.add(key);
      }
      if (event.code === 'Space') {
        event.preventDefault();
        this.keys.clear();
      }
    });

    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      this.keys.delete(key);
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
    });

    window.addEventListener('resize', () => {
      this.bgOffset = 0;
    });
  }

  setLevel(levelIndex) {
    this.levelIndex = clamp(levelIndex, 0, levels.length - 1);
    this.config = levels[this.levelIndex];
  }

  start(levelIndex = this.levelIndex) {
    this.setLevel(levelIndex);
    state.levelIndex = this.levelIndex;
    state.resetForLevel(this.config);
    this.player = this.createPlayer();
    this.director = this.createDirector();
    this.tokens = [];
    this.particles = [];
    this.spawnTimer = 0;
    this.scoreFlash = 0;
    this.lastTimestamp = 0;
    this.running = true;
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    requestAnimationFrame(this._boundLoop);
  }

  stop() {
    this.running = false;
    state.running = false;
  }

  loop(timestamp) {
    if (!this.running) return;
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const dt = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    this.update(dt);
    this.draw();
    requestAnimationFrame(this._boundLoop);
  }

  update(dt) {
    const config = this.config;
    state.timeLeft = clamp(state.timeLeft - dt, 0, config.timeLimit);
    if (state.timeLeft <= 0) {
      return this.finish('time');
    }

    this.updateDirector(dt);
    this.updatePlayer(dt);
    this.updateTokens(dt);
    this.updateParticles(dt);

    if (typeof this.onUpdate === 'function') {
      this.onUpdate({
        score: state.score,
        suspicion: state.suspicion,
        suspicionMax: config.suspicionMax,
        timeLeft: state.timeLeft,
        directorMode: this.director.mode,
        scoreFlash: this.scoreFlash,
      });
    }

    if (state.suspicion >= config.suspicionMax) {
      this.finish('caught');
    }

    this.bgOffset = (this.bgOffset + dt * 20) % 40;
  }

  updatePlayer(dt) {
    const config = this.config;
    const speed = config.playerSpeed;
    let dx = 0;
    let dy = 0;

    if (this.keys.has('arrowleft') || this.keys.has('a')) dx -= 1;
    if (this.keys.has('arrowright') || this.keys.has('d')) dx += 1;
    if (this.keys.has('arrowup') || this.keys.has('w')) dy -= 1;
    if (this.keys.has('arrowdown') || this.keys.has('s')) dy += 1;

    const moving = dx !== 0 || dy !== 0;
    if (moving) {
      const length = Math.hypot(dx, dy) || 1;
      dx /= length;
      dy /= length;
      this.player.x += dx * speed * dt;
      this.player.y += dy * speed * dt;
    }

    const margin = 8;
    this.player.x = clamp(this.player.x, margin, this.canvas.width - this.player.width - margin);
    this.player.y = clamp(this.player.y, margin, this.canvas.height - this.player.height - margin);

    if (this.director.mode === 'looking' && moving) {
      state.suspicion = clamp(
        state.suspicion + this.config.suspicionIncrease * dt,
        0,
        this.config.suspicionMax
      );
    } else if (this.director.mode === 'distracted') {
      state.suspicion = clamp(
        state.suspicion - this.config.suspicionDecay * dt,
        0,
        this.config.suspicionMax
      );
    }
  }

  updateDirector(dt) {
    this.director.timer -= dt;
    if (this.director.timer <= 0) {
      if (this.director.mode === 'looking') {
        this.director.mode = 'distracted';
        this.director.timer = randomRange(this.config.distractDuration);
      } else {
        this.director.mode = 'looking';
        this.director.timer = randomRange(this.config.lookDuration);
      }
    }
  }

  updateTokens(dt) {
    this.spawnTimer += dt;
    const interval = this.config.spawnInterval;
    if (this.spawnTimer >= interval && this.tokens.length < this.config.maxTokens) {
      this.spawnTimer = 0;
      this.tokens.push(this.createToken());
    }

    this.tokens = this.tokens.filter((token) => {
      const playerCenterX = this.player.x + this.player.width / 2;
      const playerCenterY = this.player.y + this.player.height / 2;
      const dist = Math.hypot(playerCenterX - token.x, playerCenterY - token.y);
      const collisionDistance = token.radius + Math.max(this.player.width, this.player.height) / 2;
      if (dist < collisionDistance) {
        state.score += token.value;
        this.scoreFlash = 0.4;
        this.spawnParticles(token.x, token.y);
        return false;
      }
      return true;
    });

    this.scoreFlash = Math.max(0, this.scoreFlash - dt);
  }

  createToken() {
    const [minValue, maxValue] = this.config.tokenValue;
    const padding = 40;
    const radius = 18;
    return {
      x: padding + Math.random() * (this.canvas.width - padding * 2),
      y: padding + Math.random() * (this.canvas.height - padding * 2),
      radius,
      value: Math.round(randomRange([minValue, maxValue]) / 10) * 10,
    };
  }

  spawnParticles(x, y) {
    const count = 12;
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * TAU;
      const speed = 80 + Math.random() * 160;
      this.particles.push({
        x,
        y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        life: 1,
      });
    }
  }

  updateParticles(dt) {
    const damping = Math.pow(0.92, dt * 60);
    const fadeSpeed = 2.5;
    this.particles = this.particles.filter((particle) => {
      particle.x += particle.dx * dt;
      particle.y += particle.dy * dt;
      particle.dx *= damping;
      particle.dy *= damping;
      particle.life -= dt * fadeSpeed;
      return particle.life > 0;
    });
  }

  drawParticles(ctx) {
    if (!ctx) return;
    const radius = 4;
    this.particles.forEach((particle) => {
      const alpha = clamp(particle.life, 0, 1);
      ctx.beginPath();
      ctx.fillStyle = `rgba(190, 242, 100, ${alpha})`;
      ctx.arc(particle.x, particle.y, radius, 0, TAU);
      ctx.fill();
    });
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackground(ctx);
    this.drawTokens(ctx);
    this.drawParticles(ctx);
    this.drawDirector(ctx);
    this.drawPlayer(ctx);
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1f2937');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;

    ctx.save();
    ctx.translate(0, this.bgOffset);
    for (let y = 40; y < this.canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
    for (let x = 40; x < this.canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawTokens(ctx) {
    this.tokens.forEach((token) => {
      const intensity = 0.5 + Math.random() * 0.1;
      ctx.beginPath();
      ctx.fillStyle = `rgba(34, 197, 94, ${intensity})`;
      ctx.arc(token.x, token.y, token.radius, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#bbf7d0';
      ctx.font = 'bold 12px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('€', token.x, token.y + 4);
    });
  }

  drawDirector(ctx) {
    const d = this.director;
    const isLooking = d.mode === 'looking';
    const beamLength = isLooking ? 200 : 160;

    ctx.save();
    ctx.translate(d.x, d.y);

    const bodyWidth = d.width;
    const bodyHeight = d.height;
    const headRadius = bodyWidth * 0.28;
    const headCenterX = bodyWidth / 2;
    const headCenterY = headRadius + 6;

    // Žvilgsnio kūgis – kuo žvilgsnis budresnis, tuo siauresnis ir raudonesnis spindulys.
    ctx.beginPath();
    ctx.moveTo(bodyWidth * 0.92, headCenterY - headRadius * 0.75);
    ctx.lineTo(bodyWidth * 0.92 + beamLength, headCenterY - headRadius * 0.25);
    ctx.lineTo(bodyWidth * 0.92 + beamLength, headCenterY + headRadius * 0.25);
    ctx.lineTo(bodyWidth * 0.92, headCenterY + headRadius * 0.75);
    ctx.closePath();
    ctx.fillStyle = isLooking
      ? 'rgba(248, 113, 113, 0.35)'
      : 'rgba(253, 186, 116, 0.25)';
    ctx.fill();

    // Šešėlis po direktoriaus kėde.
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    roundedRectPath(ctx, bodyWidth * 0.05, bodyHeight - 10, bodyWidth * 0.9, 12, 6);
    ctx.fill();

    // Kėdės atlošas.
    const chairGradient = ctx.createLinearGradient(0, bodyHeight * 0.18, 0, bodyHeight);
    chairGradient.addColorStop(0, '#1f2937');
    chairGradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = chairGradient;
    roundedRectPath(ctx, -bodyWidth * 0.08, bodyHeight * 0.18, bodyWidth * 1.16, bodyHeight * 0.82, 18);
    ctx.fill();

    // Rankos ir kostiumo rankovės.
    ctx.fillStyle = '#0f172a';
    roundedRectPath(ctx, -bodyWidth * 0.18, bodyHeight * 0.38, bodyWidth * 0.38, bodyHeight * 0.42, 14);
    ctx.fill();
    roundedRectPath(ctx, bodyWidth * 0.8, bodyHeight * 0.38, bodyWidth * 0.38, bodyHeight * 0.42, 14);
    ctx.fill();

    // Kostiumo liemuo.
    const suitGradient = ctx.createLinearGradient(0, bodyHeight * 0.25, 0, bodyHeight);
    suitGradient.addColorStop(0, '#1e293b');
    suitGradient.addColorStop(1, '#0b1220');
    ctx.fillStyle = suitGradient;
    roundedRectPath(ctx, 0, bodyHeight * 0.28, bodyWidth, bodyHeight * 0.7, 16);
    ctx.fill();

    // Marškinių apykaklė.
    ctx.beginPath();
    ctx.moveTo(bodyWidth * 0.1, bodyHeight * 0.32);
    ctx.lineTo(bodyWidth * 0.5, bodyHeight * 0.44);
    ctx.lineTo(bodyWidth * 0.9, bodyHeight * 0.32);
    ctx.closePath();
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();

    // Kaklaraištis – keisk spalvą, jei reikia žaidime išskirti kitą direktorių.
    ctx.beginPath();
    ctx.moveTo(bodyWidth * 0.5, bodyHeight * 0.38);
    ctx.lineTo(bodyWidth * 0.58, bodyHeight * 0.72);
    ctx.lineTo(bodyWidth * 0.42, bodyHeight * 0.72);
    ctx.closePath();
    ctx.fillStyle = '#b91c1c';
    ctx.fill();

    // Kišenė su raudonu įspėjimo dokumentu.
    ctx.fillStyle = '#1f2937';
    roundedRectPath(ctx, bodyWidth * 0.64, bodyHeight * 0.5, bodyWidth * 0.22, bodyHeight * 0.18, 6);
    ctx.fill();
    ctx.fillStyle = isLooking ? '#f87171' : '#fb923c';
    roundedRectPath(ctx, bodyWidth * 0.68, bodyHeight * 0.52, bodyWidth * 0.14, bodyHeight * 0.12, 4);
    ctx.fill();

    // Galva su akimis ir antakiais.
    ctx.beginPath();
    ctx.fillStyle = '#fcd5b5';
    ctx.arc(headCenterX, headCenterY, headRadius, 0, TAU);
    ctx.fill();

    // Plaukai.
    ctx.beginPath();
    ctx.fillStyle = '#0f172a';
    ctx.arc(headCenterX, headCenterY - headRadius * 0.15, headRadius * 1.05, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();

    // Akys – kai žiūri, vyzdžiai susiaurėja.
    const eyeOffsetX = headRadius * 0.38;
    const eyeRadius = isLooking ? headRadius * 0.12 : headRadius * 0.16;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(headCenterX - eyeOffsetX, headCenterY, eyeRadius, 0, TAU);
    ctx.arc(headCenterX + eyeOffsetX, headCenterY, eyeRadius, 0, TAU);
    ctx.fill();

    // Antakiai parodo režimą.
    ctx.strokeStyle = isLooking ? '#b91c1c' : '#fb923c';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(headCenterX - eyeOffsetX - 6, headCenterY - headRadius * 0.4);
    ctx.lineTo(headCenterX - eyeOffsetX + 6, headCenterY - headRadius * 0.45);
    ctx.moveTo(headCenterX + eyeOffsetX - 6, headCenterY - headRadius * 0.45);
    ctx.lineTo(headCenterX + eyeOffsetX + 6, headCenterY - headRadius * 0.4);
    ctx.stroke();

    // Grąžiname pradinę būseną.
    ctx.restore();
  }

  drawPlayer(ctx) {
    const p = this.player;
    const flash = this.scoreFlash > 0 ? 0.35 : 0;

    ctx.save();
    ctx.translate(p.x, p.y);

    const width = p.width;
    const height = p.height;
    const torsoHeight = height * 0.62;
    const torsoWidth = width * 0.72;
    const torsoX = (width - torsoWidth) / 2;
    const torsoY = height - torsoHeight;

    // Kuprinė – indikacija, kad personažas renka aplankus.
    ctx.fillStyle = `rgba(12, 74, 110, ${0.45 + flash / 2})`;
    roundedRectPath(ctx, torsoX - 12, torsoY + 4, torsoWidth + 24, torsoHeight * 0.9, 16);
    ctx.fill();

    // Torso gradientas.
    const torsoGradient = ctx.createLinearGradient(0, torsoY, 0, torsoY + torsoHeight);
    torsoGradient.addColorStop(0, `rgba(56, 189, 248, ${0.9 + flash})`);
    torsoGradient.addColorStop(1, `rgba(14, 165, 233, ${0.85 + flash})`);
    ctx.fillStyle = torsoGradient;
    roundedRectPath(ctx, torsoX, torsoY, torsoWidth, torsoHeight, 14);
    ctx.fill();

    // Diržas.
    ctx.fillStyle = '#0284c7';
    roundedRectPath(ctx, torsoX + 4, torsoY + torsoHeight * 0.55, torsoWidth - 8, 6, 3);
    ctx.fill();

    // Rankos.
    ctx.fillStyle = `rgba(59, 130, 246, ${0.9 + flash / 2})`;
    roundedRectPath(ctx, torsoX - 14, torsoY + 10, 14, torsoHeight * 0.55, 8);
    ctx.fill();
    roundedRectPath(ctx, torsoX + torsoWidth, torsoY + 10, 14, torsoHeight * 0.55, 8);
    ctx.fill();

    // Rankų delnai.
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(torsoX - 7, torsoY + torsoHeight * 0.58, 6, 0, TAU);
    ctx.arc(torsoX + torsoWidth + 7, torsoY + torsoHeight * 0.58, 6, 0, TAU);
    ctx.fill();

    // Kojos.
    const legHeight = height - (torsoY + torsoHeight) + 6;
    const legWidth = torsoWidth * 0.36;
    ctx.fillStyle = '#0f172a';
    roundedRectPath(ctx, torsoX + 6, height - legHeight, legWidth, legHeight, 6);
    ctx.fill();
    roundedRectPath(ctx, torsoX + torsoWidth - legWidth - 6, height - legHeight, legWidth, legHeight, 6);
    ctx.fill();

    // Batai.
    ctx.fillStyle = '#082f49';
    roundedRectPath(ctx, torsoX + 2, height - 8, legWidth + 10, 8, 4);
    ctx.fill();
    roundedRectPath(ctx, torsoX + torsoWidth - legWidth - 12, height - 8, legWidth + 10, 8, 4);
    ctx.fill();

    // Galva ir šalmas.
    const headRadius = width * 0.26;
    const headCenterX = width / 2;
    const headCenterY = headRadius;
    ctx.beginPath();
    ctx.fillStyle = '#fde68a';
    ctx.arc(headCenterX, headCenterY, headRadius, 0, TAU);
    ctx.fill();

    // Apsauginis skydelis – parodo atsargų darbą.
    ctx.fillStyle = `rgba(191, 219, 254, ${0.7 + flash / 3})`;
    roundedRectPath(ctx, headCenterX - headRadius * 0.8, headCenterY - headRadius * 0.6, headRadius * 1.6, headRadius * 0.9, 12);
    ctx.fill();

    // Akys.
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(headCenterX - headRadius * 0.35, headCenterY, headRadius * 0.14, 0, TAU);
    ctx.arc(headCenterX + headRadius * 0.35, headCenterY, headRadius * 0.14, 0, TAU);
    ctx.fill();

    // Antakiai ir šypsena suteikia gyvybingumo.
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(headCenterX - headRadius * 0.5, headCenterY - headRadius * 0.45);
    ctx.lineTo(headCenterX - headRadius * 0.2, headCenterY - headRadius * 0.35);
    ctx.moveTo(headCenterX + headRadius * 0.2, headCenterY - headRadius * 0.35);
    ctx.lineTo(headCenterX + headRadius * 0.5, headCenterY - headRadius * 0.45);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(headCenterX, headCenterY + headRadius * 0.25, headRadius * 0.35, 0, Math.PI);
    ctx.stroke();

    // Švytėjimo kontūras, kai surenkami pinigai.
    if (flash > 0) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${flash})`;
      ctx.lineWidth = 3;
      roundedRectPath(ctx, torsoX - 16, torsoY - 12, torsoWidth + 32, torsoHeight + 24, 20);
      ctx.stroke();
    }

    ctx.restore();
  }

  finish(reason) {
    if (!this.running) return;
    this.running = false;
    state.running = false;
    const finalScore = Math.max(0, Math.round(state.score));
    state.lastResult = { reason, score: finalScore };
    state.saveHighScore(finalScore);
    if (typeof this.onEnd === 'function') {
      this.onEnd({
        reason,
        score: finalScore,
        timeLeft: state.timeLeft,
        levelIndex: this.levelIndex,
      });
    }
  }
}
