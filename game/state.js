export const GAME_HIGHSCORES = 'DIRECTOR_HEIST_HIGHSCORES';

export const state = {
  running: false,
  levelIndex: 0,
  score: 0,
  suspicion: 0,
  suspicionMax: 100,
  timeLeft: 0,
  lastResult: null,
  highScores: [],

  resetForLevel(level) {
    this.running = true;
    this.score = 0;
    this.suspicion = 0;
    this.suspicionMax = level.suspicionMax;
    this.timeLeft = level.timeLimit;
    this.lastResult = null;
  },

  loadHighScores() {
    if (typeof localStorage === 'undefined') {
      this.highScores = [];
      return;
    }
    try {
      const saved = localStorage.getItem(GAME_HIGHSCORES);
      this.highScores = saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Nepavyko nuskaityti rekordų', error);
      this.highScores = [];
    }
  },

  saveHighScore(score) {
    const cleanScore = Math.max(0, Math.round(score));
    if (!Number.isFinite(cleanScore)) return;
    const next = [...this.highScores, cleanScore]
      .sort((a, b) => b - a)
      .slice(0, 5);
    this.highScores = next;
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(GAME_HIGHSCORES, JSON.stringify(next));
    } catch (error) {
      console.warn('Nepavyko išsaugoti rekordų', error);
    }
  },

  clearHighScores() {
    this.highScores = [];
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(GAME_HIGHSCORES);
    } catch (error) {
      console.warn('Nepavyko ištrinti rekordų', error);
    }
  },
};
