import { state } from './state.js';

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

  /** Pradeda raundą */
  startRound(data) {
    state.roundData = data;
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
