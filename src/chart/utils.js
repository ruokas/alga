export function safeCreateChart(canvas, config, name) {
  if (!canvas || typeof Chart === 'undefined') return null;
  try {
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return null;
    return new Chart(ctx, config);
  } catch (err) {
    const id = canvas && canvas.id ? `#${canvas.id}` : '';
    console.error(`Failed to create ${name} chart (${id})`, err?.stack || err);
    const msg = document.createElement('div');
    msg.className = 'chart-error';
    msg.textContent = `Unable to render ${name} chart`;
    canvas.replaceWith(msg);
    return null;
  }
}

// CommonJS compatibility for tests
if (typeof module !== 'undefined') {
  module.exports = { safeCreateChart };
}
