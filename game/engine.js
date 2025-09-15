import { state } from './state.js';
import { simulateEsiCounts } from '../simulation.js';
import { levels } from './levels.js';

/**
 * Paprasta būsenos mašina: init -> startRound -> submit -> showResult
 */
export class Engine {
  constructor({ onTimeout } = {}) {
    this.current = 'init';
    this.onTimeout = onTimeout;
    this.timerId = null;
  }

  /** Inicializuoja žaidimą */
  init(data = null) {
    state.roundData = data;
    state.score = 0;
    state.loadHighScores();
    this.current = 'init';
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Pradeda raundą pagal lygį
   * @param {number} level Indexas iš levels masyvo
   */
  startRound(level = 0) {
    const config = levels[level] || levels[0];
    const esi = simulateEsiCounts(config.kMax, config.capacity);
    state.roundData = { config, esi, correct: String(esi.total) };
    state.startTime = Date.now();
    this.current = 'startRound';
    if (this.timerId) clearTimeout(this.timerId);
    if (config.timeLimit) {
      this.timerId = setTimeout(() => {
        this.current = 'timeout';
        if (typeof this.onTimeout === 'function') {
          this.onTimeout();
        }
      }, config.timeLimit * 1000);
    }
  }

  /**
   * Įvertina atsakymą ir grąžina taškus
   * @param {string} answer Vartotojo atsakymas
   * @param {number} timeMs Laikas ms nuo raundo pradžios
   * @returns {number} gauti taškai
   */
  checkAnswer(answer, timeMs) {
    if (!state.roundData || answer !== state.roundData.correct) return 0;
    const seconds = Math.floor(timeMs / 1000);
    return Math.max(1, 10 - seconds); // kuo greičiau, tuo daugiau taškų
  }

  /** Pateikia atsakymą */
  submit(answer) {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    const timeMs = Date.now() - state.startTime;
    const points = this.checkAnswer(answer, timeMs);
    state.score += points;
    this.current = 'submit';
    return points;
  }

  /** Parodo rezultatą ir išsaugo rekordus */
  showResult() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    state.saveHighScore(state.score);
    this.current = 'showResult';
    return state.score;
  }
}
