/**
 * tooltip.js
 * ─────────────────────────────────────────────────────────────
 * Global D3 tooltip helper for The Roots of Rhythm platform.
 *
 * Creates a single floating tooltip <div> that follows the
 * cursor across any visualization. Call show/hide/move from
 * D3 event handlers; use html() to set custom content.
 *
 * Usage:
 *   import { tooltip } from '../tooltip.js';
 *   tooltip.show(event, '<b>Title</b><br>Value: 42');
 *   tooltip.move(event);
 *   tooltip.hide();
 * ─────────────────────────────────────────────────────────────
 */

const OFFSET_X = 14;
const OFFSET_Y = -28;

class Tooltip {
  constructor() {
    this._el = null;
    this._init();
  }

  _init() {
    // Reuse existing tooltip element if present (e.g. page reload)
    let el = document.getElementById('d3-tooltip');
    if (!el) {
      el = document.createElement('div');
      el.id = 'd3-tooltip';
      el.className = 'd3-tooltip';
      el.setAttribute('role', 'tooltip');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    this._el = el;
  }

  /**
   * Show the tooltip near the current mouse position.
   * @param {MouseEvent} event  - D3 or native mouse event
   * @param {string}     html   - Inner HTML content
   */
  show(event, html) {
    if (!this._el) this._init();
    this._el.innerHTML = html;
    this._el.classList.add('visible');
    this._position(event);
    return this;
  }

  /**
   * Update tooltip position (call on mousemove).
   * @param {MouseEvent} event
   */
  move(event) {
    if (!this._el) return this;
    this._position(event);
    return this;
  }

  /**
   * Hide the tooltip.
   */
  hide() {
    if (!this._el) return this;
    this._el.classList.remove('visible');
    return this;
  }

  /**
   * Set tooltip HTML content without changing visibility.
   * @param {string} html
   */
  html(html) {
    if (!this._el) return this;
    this._el.innerHTML = html;
    return this;
  }

  /** @private */
  _position(event) {
    const clientX = event.clientX ?? (event.sourceEvent?.clientX ?? 0);
    const clientY = event.clientY ?? (event.sourceEvent?.clientY ?? 0);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const box = this._el.getBoundingClientRect();

    let x = clientX + OFFSET_X;
    let y = clientY + OFFSET_Y;

    // Prevent overflow right
    if (x + box.width + 16 > vw) {
      x = clientX - box.width - OFFSET_X;
    }
    // Prevent overflow bottom
    if (y + box.height + 16 > vh) {
      y = clientY - box.height - OFFSET_Y;
    }
    // Prevent overflow top
    if (y < 8) y = 8;

    this._el.style.left = `${x}px`;
    this._el.style.top  = `${y}px`;
  }
}

/** Singleton tooltip instance — import and use directly. */
export const tooltip = new Tooltip();

/**
 * Build a standard tooltip HTML string.
 * @param {string}              title
 * @param {Array<{label,value,color}>} rows
 * @returns {string}
 */
export function tooltipHtml(title, rows = []) {
  const rowsHtml = rows.map(r => `
    <div class="tooltip-row">
      <span>${r.label}</span>
      <span class="tooltip-value" style="color:${r.color || 'var(--text-primary)'}">
        ${r.value}
      </span>
    </div>`).join('');

  return `
    <div class="tooltip-title">${title}</div>
    ${rows.length ? `<div class="tooltip-divider"></div>${rowsHtml}` : ''}
  `;
}
