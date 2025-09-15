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
  }

  function updateHUD({ score, suspicion, suspicionMax, timeLeft, directorMode }) {
    fundsEl.textContent = formatCurrency(score);
    timerEl.textContent = formatTime(timeLeft);
    const percent = suspicionMax > 0 ? Math.round((suspicion / suspicionMax) * 100) : 0;
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
