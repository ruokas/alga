import { state } from './state.js';
import { STRINGS, formatCurrency, formatTime } from './strings.js';

/**
 * Inicializuoja žaidimo sąsają ir grąžina HUD atnaujinimo funkcijas
 */
export function initView({
  levels,
  onStart,
  onRestart,
  onClearScores,
  onDirectionalInput,
  onDirectionalClear,
}) {
  const title = document.getElementById('game-title');
  const subtitle = document.getElementById('game-subtitle');
  const startButton = document.getElementById('start');
  const restartButton = document.getElementById('restart');
  const levelSelect = document.getElementById('level');
  const levelDescription = document.getElementById('level-description');
  const timerEl = document.getElementById('timer');
  const fundsEl = document.getElementById('funds');
  const suspicionBar = document.getElementById('suspicion-bar');
  const suspicionLabel = document.getElementById('suspicion-label');
  const statusMsg = document.getElementById('status');
  const overlay = document.getElementById('overlay');
  const overlayMsg = document.getElementById('overlay-message');
  const overlayButton = document.getElementById('overlay-action');
  const highscoreList = document.getElementById('highscores');
  const clearScoresButton = document.getElementById('clear-scores');
  const instructionsList = document.getElementById('instructions');
  const shortcuts = document.getElementById('shortcuts');
  const canvas = document.getElementById('game-canvas');

  title.textContent = STRINGS.title;
  subtitle.textContent = STRINGS.subtitle;
  startButton.textContent = STRINGS.startButton;
  restartButton.textContent = STRINGS.restartButton;
  document.getElementById('funds-label').textContent = STRINGS.fundsLabel;
  document.getElementById('timer-label').textContent = STRINGS.timerLabel;
  suspicionLabel.textContent = STRINGS.suspicionLabel;
  document.getElementById('level-label').textContent = STRINGS.levelLabel;
  document.getElementById('highscores-title').textContent = STRINGS.highscoreTitle;
  document.getElementById('instructions-title').textContent = STRINGS.instructionsTitle;
  clearScoresButton.textContent = STRINGS.clearScores;
  document.getElementById('local-note').textContent = STRINGS.localOnly;
  shortcuts.textContent = STRINGS.shortcuts;

  const touchControls = setupTouchControls({
    canvas,
    shortcutsEl: shortcuts,
    onDirectionalInput,
    onDirectionalClear,
  });

  instructionsList.innerHTML = '';
  STRINGS.instructions.forEach((line) => {
    const li = document.createElement('li');
    li.textContent = line;
    instructionsList.appendChild(li);
  });

  levelSelect.innerHTML = '';
  levels.forEach((level, index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = level.label;
    levelSelect.appendChild(option);
  });
  levelDescription.textContent = levels[0]?.description || '';

  levelSelect.addEventListener('change', () => {
    const idx = Number(levelSelect.value);
    levelDescription.textContent = levels[idx]?.description || '';
  });

  startButton.addEventListener('click', () => {
    const idx = Number(levelSelect.value) || 0;
    onStart(idx);
    toggleRunningState(true);
  });

  restartButton.addEventListener('click', () => {
    const idx = Number(levelSelect.value) || 0;
    onRestart(idx);
    toggleRunningState(true);
  });

  overlayButton.addEventListener('click', () => {
    overlay.hidden = true;
    const idx = Number(levelSelect.value) || 0;
    onRestart(idx);
    toggleRunningState(true);
  });

  clearScoresButton.addEventListener('click', () => {
    onClearScores();
    renderHighScores([]);
  });

  function toggleRunningState(isRunning) {
    startButton.disabled = isRunning;
    restartButton.disabled = !isRunning;
    levelSelect.disabled = isRunning;
    if (!isRunning) {
      touchControls.clearDirections();
    }
  }

  function updateHUD({ score, suspicion, suspicionMax, timeLeft, directorMode }) {
    fundsEl.textContent = formatCurrency(score);
    timerEl.textContent = formatTime(timeLeft);
    const percent = suspicionMax > 0 ? Math.round((suspicion / suspicionMax) * 100) : 0;
    if (percent >= 85) {
      suspicionBar.classList.add('danger');
    } else {
      suspicionBar.classList.remove('danger');
    }
    suspicionBar.style.width = `${clamp(percent, 0, 100)}%`;
    suspicionBar.setAttribute('aria-valuenow', String(percent));
    suspicionBar.setAttribute('aria-valuemax', String(100));
    suspicionBar.setAttribute('aria-valuemin', String(0));
    suspicionBar.dataset.mode = directorMode;
    statusMsg.textContent = directorMode === 'looking' ? STRINGS.lookingWarning : STRINGS.distractedInfo;
  }

  function showEnd({ reason, score }) {
    const message =
      reason === 'caught'
        ? STRINGS.caught
        : reason === 'time'
        ? STRINGS.timeUp(score)
        : STRINGS.caught;
    overlayMsg.textContent = message;
    overlay.hidden = false;
    toggleRunningState(false);
  }

  function renderHighScores(scores = state.highScores) {
    highscoreList.innerHTML = '';
    if (!scores.length) {
      const li = document.createElement('li');
      li.textContent = 'Nėra rekordų – tapk pirmas!';
      highscoreList.appendChild(li);
      return;
    }
    scores.slice(0, 5).forEach((score, index) => {
      const li = document.createElement('li');
      li.textContent = `${index + 1}. ${formatCurrency(score)}`;
      highscoreList.appendChild(li);
    });
  }

  return {
    updateHUD,
    showEnd,
    renderHighScores,
    toggleRunningState,
    updateLevelDescription(index) {
      levelSelect.value = String(index);
      levelDescription.textContent = levels[index]?.description || '';
    },
  };
}

function setupTouchControls({
  canvas,
  shortcutsEl,
  onDirectionalInput,
  onDirectionalClear,
}) {
  const noop = () => {};
  if (!canvas || typeof window === 'undefined' || !window.matchMedia) {
    return { clearDirections: noop };
  }

  const mediaQuery = window.matchMedia('(pointer: coarse)');
  const wrapper = document.createElement('div');
  wrapper.className = 'dg-touch-controls';
  wrapper.setAttribute('role', 'group');
  wrapper.setAttribute('aria-label', 'Lietimo valdymo pultelis');
  wrapper.hidden = true;

  const pad = document.createElement('div');
  pad.className = 'dg-touch-controls__pad';
  wrapper.appendChild(pad);

  const pointerMap = new Map();

  const buttons = {
    up: { label: 'Judėti aukštyn', icon: '↑' },
    left: { label: 'Judėti kairėn', icon: '←' },
    down: { label: 'Judėti žemyn', icon: '↓' },
    right: { label: 'Judėti dešinėn', icon: '→' },
  };

  const layout = [
    null,
    'up',
    null,
    'left',
    null,
    'right',
    null,
    'down',
    null,
  ];

  layout.forEach((slot) => {
    if (!slot) {
      const spacer = document.createElement('span');
      spacer.className = 'dg-touch-controls__spacer';
      pad.appendChild(spacer);
      return;
    }

    const config = buttons[slot];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'dg-touch-button';
    button.dataset.direction = slot;
    button.setAttribute('aria-label', config.label);
    button.textContent = config.icon;

    const release = (event) => {
      const direction = pointerMap.get(event.pointerId) || slot;
      pointerMap.delete(event.pointerId);
      if (typeof onDirectionalInput === 'function' && direction) {
        onDirectionalInput(direction, false);
      }
      if (typeof button.releasePointerCapture === 'function') {
        button.releasePointerCapture(event.pointerId);
      }
    };

    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      pointerMap.set(event.pointerId, slot);
      if (typeof onDirectionalInput === 'function') {
        onDirectionalInput(slot, true);
      }
      if (typeof button.setPointerCapture === 'function') {
        button.setPointerCapture(event.pointerId);
      }
    });

    ['pointerup', 'pointercancel', 'pointerleave', 'pointerout'].forEach((eventName) => {
      button.addEventListener(eventName, release);
    });

    pad.appendChild(button);
  });

  canvas.insertAdjacentElement('afterend', wrapper);

  const updateShortcuts = (showTouch) => {
    if (!shortcutsEl) return;
    shortcutsEl.textContent = showTouch
      ? `${STRINGS.shortcuts} ${STRINGS.touchHint}`
      : STRINGS.shortcuts;
  };

  const updateVisibility = (query) => {
    const showControls = Boolean(query?.matches);
    wrapper.hidden = !showControls;
    updateShortcuts(showControls);
    if (!showControls) {
      pointerMap.clear();
      if (typeof onDirectionalClear === 'function') {
        onDirectionalClear();
      } else if (typeof onDirectionalInput === 'function') {
        ['up', 'down', 'left', 'right'].forEach((direction) =>
          onDirectionalInput(direction, false)
        );
      }
    }
  };

  updateVisibility(mediaQuery);

  const listener = (event) => updateVisibility(event);
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', listener);
  } else if (typeof mediaQuery.addListener === 'function') {
    mediaQuery.addListener(listener);
  }

  return {
    clearDirections() {
      pointerMap.clear();
      if (typeof onDirectionalClear === 'function') {
        onDirectionalClear();
      } else if (typeof onDirectionalInput === 'function') {
        ['up', 'down', 'left', 'right'].forEach((direction) =>
          onDirectionalInput(direction, false)
        );
      }
    },
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
