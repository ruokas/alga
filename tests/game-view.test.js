import { renderHighScores } from '../game/view.js';
import { state } from '../game/state.js';

test('renderHighScores shows top 5 scores', () => {
  document.body.innerHTML = '<ul id="highscores"></ul>';
  state.highScores = [10, 8, 6, 4, 2, 1];
  renderHighScores();
  const items = document.querySelectorAll('#highscores li');
  expect(items.length).toBe(5);
  expect(items[0].textContent).toContain('10');
  expect(items[4].textContent).toContain('2');
});
