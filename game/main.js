import { DirectorGameEngine } from './engine.js';
import { initView } from './view.js';
import { state } from './state.js';
import { levels } from './levels.js';

const STYLE_ID = 'director-game-styles';

const STYLE_CONTENT = `
.dg-root {
  font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color-scheme: dark;
  color: #f8fafc;
  display: block;
  padding: 1.5rem 0;
  box-sizing: border-box;
}

.dg-root * {
  box-sizing: border-box;
}

.dg-embed {
  background: radial-gradient(circle at top, #1e293b, #0f172a 60%);
  padding: 2rem 1rem 3rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.dg-embed .dg-root {
  width: min(960px, 100%);
}

.dg-app {
  width: min(960px, 100%);
  background: rgba(15, 23, 42, 0.92);
  border-radius: 18px;
  padding: 2rem;
  box-shadow: 0 25px 60px rgba(15, 23, 42, 0.55);
  border: 1px solid rgba(148, 163, 184, 0.35);
  position: relative;
  margin: 0 auto;
}

.dg-app h1 {
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  margin: 0;
}

.dg-app header p {
  margin: 0.5rem 0 0;
  max-width: 60ch;
  color: rgba(226, 232, 240, 0.9);
}

.dg-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1.8rem 0 1.2rem;
  align-items: flex-end;
}

.dg-field {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  color: rgba(226, 232, 240, 0.9);
  gap: 0.35rem;
}

.dg-app select,
.dg-app button {
  border-radius: 12px;
  border: none;
  padding: 0.65rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 150ms ease, background 150ms ease;
}

.dg-app button {
  background: linear-gradient(135deg, #38bdf8, #0ea5e9);
  color: #082f49;
  box-shadow: 0 14px 24px rgba(14, 165, 233, 0.32);
}

.dg-app button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

.dg-app button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 20px 28px rgba(14, 165, 233, 0.45);
}

.dg-app button:focus-visible,
.dg-app select:focus-visible {
  outline: 3px solid rgba(56, 189, 248, 0.8);
  outline-offset: 3px;
}

.dg-app select {
  background: rgba(15, 23, 42, 0.8);
  color: inherit;
  border: 1px solid rgba(148, 163, 184, 0.4);
  padding-right: 2.5rem;
}

.dg-level {
  margin: 0 0 1rem;
  color: rgba(148, 163, 184, 0.92);
}

.dg-hud {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.dg-card {
  padding: 1rem;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.25);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.dg-card span {
  font-size: 0.9rem;
  color: rgba(148, 163, 184, 0.85);
}

.dg-card strong {
  font-size: 1.4rem;
}

.dg-suspicion-track {
  background: rgba(30, 41, 59, 0.85);
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  height: 18px;
  overflow: hidden;
  position: relative;
}

#suspicion-bar {
  height: 100%;
  width: 0%;
  border-radius: inherit;
  transition: width 160ms ease;
  background: linear-gradient(90deg, rgba(248, 113, 113, 0.85), rgba(239, 68, 68, 1));
}

#suspicion-bar.danger {
  animation: pulse 0.8s infinite alternate;
}

@keyframes pulse {
  from {
    filter: brightness(1);
  }
  to {
    filter: brightness(1.6);
  }
}

#suspicion-bar[data-mode='distracted'] {
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.85), rgba(34, 197, 94, 0.95));
}

.dg-status {
  margin: 0.5rem 0 1.5rem;
  font-weight: 600;
  color: rgba(248, 250, 252, 0.9);
}

.dg-app canvas {
  width: 100%;
  max-width: 720px;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  margin: 0 auto 2rem;
  display: block;
}

.dg-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.dg-panel {
  background: rgba(15, 23, 42, 0.6);
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  padding: 1.2rem;
}

.dg-panel h2 {
  margin-top: 0;
  font-size: 1.1rem;
}

#highscores {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

#highscores li {
  background: rgba(30, 41, 59, 0.65);
  border-radius: 12px;
  padding: 0.6rem 0.75rem;
}

#instructions {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.35rem;
}

.dg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.92);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  gap: 1.5rem;
  border-radius: inherit;
  border: 1px solid rgba(56, 189, 248, 0.35);
  box-shadow: 0 25px 60px rgba(14, 165, 233, 0.25);
}

.dg-overlay[hidden] {
  display: none;
}

#overlay-message {
  font-size: 1.3rem;
  line-height: 1.4;
}

#shortcuts {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: rgba(148, 163, 184, 0.85);
}

@media (max-width: 720px) {
  .dg-app {
    padding: 1.5rem;
  }

  .dg-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .dg-app button,
  .dg-app select {
    width: 100%;
  }

  .dg-app canvas {
    max-width: 100%;
  }
}
`;

const GAME_TEMPLATE = `
<div class="dg-app" role="region" aria-labelledby="game-title">
  <header class="dg-header">
    <h1 id="game-title">Direktoriaus gudrybių žaidimas</h1>
    <p id="game-subtitle">Surink kuo daugiau lėšų skyriui vengdamas direktoriaus žvilgsnio.</p>
  </header>

  <section class="dg-controls" aria-label="Žaidimo valdikliai">
    <button id="start" type="button">Pradėti</button>
    <button id="restart" type="button" disabled>Pakartoti</button>
    <label class="dg-field" for="level">
      <span id="level-label">Misijos sunkumas</span>
      <select id="level" name="level" aria-describedby="level-description"></select>
    </label>
  </section>

  <p class="dg-level" id="level-description">Direktorius dažnai nusisuka. Laikas 90 s, rizika minimali.</p>

  <section class="dg-hud" aria-label="Žaidimo būsena">
    <div class="dg-card">
      <span id="funds-label">Skyriui sukaupta</span>
      <strong id="funds">0 €</strong>
    </div>
    <div class="dg-card">
      <span id="timer-label">Laikas</span>
      <strong id="timer">01:30</strong>
    </div>
    <div class="dg-card">
      <span id="suspicion-label">Direktoriaus įtarimas</span>
      <div class="dg-suspicion-track" role="presentation">
        <div
          id="suspicion-bar"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="0"
        ></div>
      </div>
    </div>
  </section>

  <p class="dg-status" id="status">Pasiruošk misijai.</p>

  <canvas
    id="game-canvas"
    width="720"
    height="420"
    role="img"
    aria-label="Žaidimo laukas: direktoriumi prižiūrima salė"
  >
    Jūsų naršyklė nepalaiko Canvas elemento.
  </canvas>

  <section class="dg-info-grid" aria-label="Papildoma informacija">
    <article class="dg-panel">
      <h2 id="instructions-title">Taisyklės</h2>
      <ol id="instructions"></ol>
      <p id="shortcuts">Klaviatūra: rodyklės / WASD judėjimui.</p>
    </article>
    <article class="dg-panel">
      <h2 id="highscores-title">Geriausi rezultatai</h2>
      <ol id="highscores">
        <li>Nėra rekordų – tapk pirmas!</li>
      </ol>
      <button id="clear-scores" type="button">Išvalyti rekordus</button>
      <p id="local-note">Rezultatai saugomi tik šioje naršyklėje.</p>
    </article>
  </section>

  <section id="overlay" class="dg-overlay" hidden aria-live="polite" aria-atomic="true">
    <div id="overlay-message">Sveikinimai!</div>
    <button id="overlay-action" type="button">Dar kartą!</button>
  </section>
</div>
`;

let engine;
let view;

function injectStyles() {
  if (document.getElementById(STYLE_ID)) {
    return;
  }
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = STYLE_CONTENT;
  document.head.appendChild(style);
}

function ensureGameMarkup() {
  injectStyles();
  const existingCanvas = document.getElementById('game-canvas');
  if (existingCanvas) {
    const hostCandidate =
      document.querySelector('[data-game-root]') ||
      document.getElementById('game-root') ||
      existingCanvas.closest('.dg-root');
    hostCandidate?.classList.add('dg-root');
    return true;
  }

  const host =
    document.querySelector('[data-game-root]') || document.getElementById('game-root');
  if (!host) {
    console.error(
      'Nerasta žaidimo talpykla. Įtraukite <div id="game-root" data-game-root></div> į puslapį.',
    );
    return false;
  }

  host.classList.add('dg-root');
  host.innerHTML = GAME_TEMPLATE;
  return true;
}

function boot() {
  if (!ensureGameMarkup()) {
    return;
  }

  const canvas = document.getElementById('game-canvas');
  if (!canvas) {
    console.error('Nerastas žaidimo drobės elementas (#game-canvas)');
    return;
  }

  state.loadHighScores();

  engine = new DirectorGameEngine(canvas, {
    onUpdate: (payload) => view?.updateHUD(payload),
    onEnd: (payload) => {
      view?.showEnd(payload);
      view?.renderHighScores(state.highScores);
    },
  });

  view = initView({
    levels,
    onStart: (levelIndex) => {
      engine.start(levelIndex);
      view.updateLevelDescription(levelIndex);
      view.renderHighScores(state.highScores);
    },
    onRestart: (levelIndex) => {
      engine.start(levelIndex);
      view.updateLevelDescription(levelIndex);
      view.renderHighScores(state.highScores);
    },
    onClearScores: () => {
      state.clearHighScores();
    },
  });

  view.toggleRunningState(false);
  view.renderHighScores(state.highScores);
  view.updateHUD({
    score: 0,
    suspicion: 0,
    suspicionMax: levels[0].suspicionMax,
    timeLeft: levels[0].timeLimit,
    directorMode: 'distracted',
  });
}

document.addEventListener('DOMContentLoaded', boot);

if (typeof window !== 'undefined') {
  window.directorGame = {
    get state() {
      return state;
    },
    start(levelIndex = 0) {
      engine?.start(levelIndex);
    },
    levels,
  };
}

export { boot, state };
