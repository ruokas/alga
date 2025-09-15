/** LocalStorage raktas geriausiems rezultatams */
export const GAME_HIGHSCORES = 'GAME_HIGHSCORES';

export const state = {
  roundData: null, // dabartinio raundo duomenys
  score: 0, // surinkti taškai
  highScores: [], // geriausi rezultatai
  startTime: 0, // raundo pradžios laikas

  /** Perskaito rekordus iš LocalStorage */
  loadHighScores() {
    if (typeof localStorage === 'undefined') {
      this.highScores = [];
      return;
    }

    try {
      const saved = localStorage.getItem(GAME_HIGHSCORES);
      this.highScores = saved ? JSON.parse(saved) : [];
    } catch {
      this.highScores = [];
    }
  },

  /**
   * Išsaugo rezultatą LocalStorage.
   * @param {number} score Gauti taškai
   */
  saveHighScore(score) {
    if (typeof localStorage === 'undefined') return;
    const scores = [...this.highScores, score].sort((a, b) => b - a).slice(0, 5);
    this.highScores = scores;
    try {
      localStorage.setItem(GAME_HIGHSCORES, JSON.stringify(scores));
    } catch {
      // saugojimo klaidos nutylimos
    }
  },
};
