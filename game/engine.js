import { state } from './state.js';
import { levels } from './levels.js';

const TAU = Math.PI * 2;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomRange([min, max]) {
  return min + Math.random() * (max - min);
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
    this.keys = new Set();
    this.running = false;
    this.player = this.createPlayer();
    this.director = this.createDirector();
    this.scoreFlash = 0;
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

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackground(ctx);
    this.drawTokens(ctx);
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
    const modeColor = d.mode === 'looking' ? '#f87171' : '#fb923c';

    ctx.save();
    ctx.translate(d.x, d.y);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, d.width, d.height);

    ctx.fillStyle = modeColor;
    ctx.fillRect(d.width * 0.2, -18, d.width * 0.6, 18);

    ctx.beginPath();
    ctx.moveTo(d.width, d.height * 0.2);
    ctx.lineTo(d.width + 140, d.height * 0.5);
    ctx.lineTo(d.width, d.height * 0.8);
    ctx.closePath();
    ctx.fillStyle = d.mode === 'looking' ? 'rgba(248, 113, 113, 0.25)' : 'rgba(253, 186, 116, 0.2)';
    ctx.fill();

    ctx.restore();
  }

  drawPlayer(ctx) {
    const p = this.player;
    const flash = this.scoreFlash > 0 ? 0.35 : 0;
    ctx.fillStyle = `rgba(56, 189, 248, ${0.75 + flash})`;
    ctx.fillRect(p.x, p.y, p.width, p.height);

    ctx.fillStyle = '#0ea5e9';
    ctx.fillRect(p.x + p.width * 0.25, p.y - 12, p.width * 0.5, 12);
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
