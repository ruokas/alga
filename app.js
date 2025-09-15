/**
 * Mini žaidimo paleidimo logika.
 * Visi tekstai – čia, kad būtų lengva lokalizuoti (numatyta LT, papildykite EN, jei reikia).
 */
const MINI_GAME_TEXT = Object.freeze({
  fallbackTitle: 'Mini žaidimo demonstracija',
  fallbackHint:
    'Jei naršyklė blokavo naują langą, mini žaidimą galite peržiūrėti šiame peržiūros lange.',
  shortcutHint: 'Trumpinys: Ctrl + M (macOS – ⌘ + M).',
  openError:
    'Nepavyko atidaryti mini žaidimo naujame lange. Patikrinkite iššokančių langų nustatymus.',
  closeLabel: 'Uždaryti',
  closeAria: 'Uždaryti mini žaidimo demonstraciją',
  canvasAriaLabel: 'Mini žaidimo drobė su pulsavimo animacija'
});

/**
 * Pagrindinės konfigūracijos: keiskite URL arba drobės dydžius pagal poreikį.
 */
const MINI_GAME_CONFIG = Object.freeze({
  targetUrl: 'game.html',
  canvasWidth: 360,
  canvasHeight: 240
});

let miniGameOverlayElement = null;
let miniGameAnimationFrame = null;

/**
 * Paleidžia mini žaidimą naujame lange. Jei iššokantis langas užblokuotas – rodoma drobė vietoje.
 */
function startMiniGame() {
  try {
    const newWindow = window.open(MINI_GAME_CONFIG.targetUrl, '_blank', 'noopener');
    if (newWindow) {
      newWindow.focus();
      return;
    }
    throw new Error('popup-blocked');
  } catch (error) {
    console.error('[MiniGame] Nepavyko atidaryti naujo lango.', error);
    showMiniGameCanvasFallback();
    alert(MINI_GAME_TEXT.openError);
  }
}

/**
 * Sukuria (jei reikia) ir parodo mini žaidimo drobę kaip atsarginį variantą.
 */
function showMiniGameCanvasFallback() {
  const overlay = ensureMiniGameOverlay();
  if (!overlay) {
    console.warn('[MiniGame] Nepavyko sugeneruoti drobės.');
    return;
  }

  overlay.style.display = 'flex';
  overlay.setAttribute('aria-hidden', 'false');

  const canvas = overlay.querySelector('canvas');
  if (canvas) {
    renderMiniGameCanvas(canvas);
    canvas.focus({ preventScroll: true });
  }
}

/**
 * Užtikrina, kad dialogo elementas egzistuoja.
 * @returns {HTMLDivElement | null}
 */
function ensureMiniGameOverlay() {
  if (miniGameOverlayElement) {
    return miniGameOverlayElement;
  }

  const overlay = document.createElement('div');
  overlay.id = 'miniGameOverlay';
  overlay.className = 'mini-game-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.display = 'none';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.background = 'rgba(10, 16, 24, 0.75)';
  overlay.style.padding = '1.5rem';
  overlay.style.zIndex = '10000';

  const dialog = document.createElement('div');
  dialog.style.background = 'var(--card-bg, #0f1f2e)';
  dialog.style.color = 'var(--text-color, #f4f6f8)';
  dialog.style.borderRadius = '12px';
  dialog.style.padding = '1.5rem';
  dialog.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.35)';
  dialog.style.maxWidth = '480px';
  dialog.style.width = '100%';
  dialog.style.display = 'flex';
  dialog.style.flexDirection = 'column';
  dialog.style.gap = '0.75rem';
  dialog.style.textAlign = 'center';

  const heading = document.createElement('h2');
  heading.textContent = MINI_GAME_TEXT.fallbackTitle;
  heading.style.margin = '0';

  const canvas = document.createElement('canvas');
  canvas.width = MINI_GAME_CONFIG.canvasWidth;
  canvas.height = MINI_GAME_CONFIG.canvasHeight;
  canvas.id = 'miniGameCanvas';
  canvas.tabIndex = 0;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  canvas.style.borderRadius = '8px';
  canvas.style.border = '1px solid rgba(255, 255, 255, 0.15)';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', MINI_GAME_TEXT.canvasAriaLabel);

  const hint = document.createElement('p');
  hint.textContent = MINI_GAME_TEXT.fallbackHint;
  hint.style.margin = '0';
  hint.style.fontSize = '0.875rem';
  hint.style.opacity = '0.85';

  const shortcut = document.createElement('p');
  shortcut.textContent = MINI_GAME_TEXT.shortcutHint;
  shortcut.style.margin = '0';
  shortcut.style.fontSize = '0.75rem';
  shortcut.style.opacity = '0.65';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.textContent = MINI_GAME_TEXT.closeLabel;
  closeButton.setAttribute('aria-label', MINI_GAME_TEXT.closeAria);
  closeButton.style.alignSelf = 'center';
  closeButton.style.padding = '0.6rem 1.4rem';
  closeButton.style.borderRadius = '999px';
  closeButton.style.border = '1px solid rgba(255, 255, 255, 0.25)';
  closeButton.style.background = 'rgba(255, 255, 255, 0.08)';
  closeButton.style.color = 'inherit';
  closeButton.style.cursor = 'pointer';
  closeButton.addEventListener('click', hideMiniGameOverlay);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      hideMiniGameOverlay();
    }
  });

  dialog.appendChild(heading);
  dialog.appendChild(canvas);
  dialog.appendChild(hint);
  dialog.appendChild(shortcut);
  dialog.appendChild(closeButton);
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  miniGameOverlayElement = overlay;
  return overlay;
}

/**
 * Slepiamas dialogas ir stabdoma animacija (našumo sumetimais).
 */
function hideMiniGameOverlay() {
  if (!miniGameOverlayElement) {
    return;
  }

  miniGameOverlayElement.style.display = 'none';
  miniGameOverlayElement.setAttribute('aria-hidden', 'true');
  stopMiniGameAnimation();
}

function stopMiniGameAnimation() {
  if (miniGameAnimationFrame) {
    cancelAnimationFrame(miniGameAnimationFrame);
    miniGameAnimationFrame = null;
  }
}

/**
 * Paprasta drobės animacija – galima pakeisti į realų mini žaidimą.
 * @param {HTMLCanvasElement} canvas
 */
function renderMiniGameCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.warn('[MiniGame] Canvas 2D kontekstas nepasiekiamas.');
    return;
  }

  stopMiniGameAnimation();

  const { width, height } = canvas;
  const waves = Array.from({ length: 24 }, (_, index) => index);

  const drawFrame = (time) => {
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#07223a');
    gradient.addColorStop(1, '#1b5975');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    waves.forEach((waveIndex) => {
      const progress = ((time / 400) + waveIndex) % waves.length;
      const alpha = 0.4 + 0.6 * Math.sin((progress / waves.length) * Math.PI);
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 200, 90, ${alpha.toFixed(3)})`;
      ctx.lineWidth = 2;
      ctx.arc(
        width / 2,
        height / 2,
        20 + waveIndex * 6 + Math.sin(time / 350) * 6,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    });

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '600 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ED mini žaidimas (demo)', width / 2, height - 24);

    miniGameAnimationFrame = requestAnimationFrame(drawFrame);
  };

  miniGameAnimationFrame = requestAnimationFrame(drawFrame);
}

function isMiniGameOverlayVisible() {
  return (
    !!miniGameOverlayElement &&
    miniGameOverlayElement.style.display !== 'none' &&
    miniGameOverlayElement.getAttribute('aria-hidden') === 'false'
  );
}

/**
 * Klaviatūros valdymas: Ctrl/Cmd+M – paleisti, Escape – uždaryti drobę.
 * @param {KeyboardEvent} event
 */
function handleMiniGameKeydown(event) {
  const key = event.key.toLowerCase();

  if ((event.ctrlKey || event.metaKey) && key === 'm') {
    event.preventDefault();
    startMiniGame();
    return;
  }

  if (key === 'escape' && isMiniGameOverlayVisible()) {
    event.preventDefault();
    hideMiniGameOverlay();
  }
}

document.addEventListener('keydown', handleMiniGameKeydown, { passive: false });

// Reikalaujamas įvykio registravimas (scenarijus įkeliamas su defer, todėl DOM jau paruoštas).
document.getElementById('miniGameBtn').addEventListener('click', startMiniGame);

console.info('[MiniGame] Paruošta. ' + MINI_GAME_TEXT.shortcutHint);
