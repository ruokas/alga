import { state } from './state.js';
import { simulateEsiCounts } from '../simulation.js';
import { levels } from './levels.js';

/**
 * Paprasta būsenos mašina: init -> startRound -> submit -> showResult
 */
export class Engine {
  constructor() {
    this.current = 'init';
  }

  /** Inicializuoja žaidimą */
  init(data = null) {
    state.roundData = data;
    state.score = 0;
    this.current = 'init';
  }

  /**
   * Pradeda raundą pagal lygį
   * @param {number} level Indexas iš levels masyvo
   */
  startRound(level = 0) {
    const config = levels[level] || levels[0];
    const esi = simulateEsiCounts(config.kMax, config.capacity);
    state.roundData = { config, esi, correct: String(esi.total) };
    this.current = 'startRound';
  }

  /** Pateikia atsakymą */
  submit(answer) {
    if (state.roundData && answer === state.roundData.correct) {
      state.score += 1;
    }
    this.current = 'submit';
  }

  /** Parodo rezultatą ir išsaugo rekordus */
  showResult() {
    state.highScores.push(state.score);
    this.current = 'showResult';
    return state.score;
  }
}
