import { DEFAULT_PORT_MAP, getDefaultEmoji } from './port-map.js';

export function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderEmptyState() {
  document.getElementById('tab-list').hidden = true;
  const updateBtn = document.getElementById('update-titles-btn');
  if (updateBtn) updateBtn.hidden = true;
  const el = document.getElementById('empty-state');
  el.hidden = false;
  el.textContent = "No localhost tabs open yet — start a local server and I'll label it automatically.";
}

/**
 * Normalize raw storage value to { name, emoji }. Backward compat: string → name only, emoji default.
 * @param {Record<string, string|{ name?: string, emoji?: string }>} raw
 * @returns {Record<string, { name: string, emoji: string }>}
 */
export function normalizePortMappings(raw) {
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  for (const port of Object.keys(raw)) {
    const v = raw[port];
    if (typeof v === 'string') {
      out[port] = { name: v, emoji: getDefaultEmoji(port) };
    } else if (v && typeof v === 'object') {
      out[port] = {
        name: typeof v.name === 'string' ? v.name : '',
        emoji: typeof v.emoji === 'string' && v.emoji.trim() ? v.emoji.trim().slice(0, 2) : getDefaultEmoji(port)
      };
    }
  }
  return out;
}

export function renderTabList(tabs, portMappings, rawPortMappings = {}) {
  document.getElementById('empty-state').hidden = true;
  const updateBtn = document.getElementById('update-titles-btn');
  if (updateBtn) updateBtn.hidden = false;
  const list = document.getElementById('tab-list');
  list.hidden = false;

  const normalized = normalizePortMappings(rawPortMappings);

  const ports = [...new Set(
    tabs
      .map(tab => new URL(tab.url).port)
      .filter(port => port !== '')
  )].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  list.innerHTML = ports.map(port => {
    const defaultName = DEFAULT_PORT_MAP[port] ?? 'Port ' + port;
    const defaultEmoji = getDefaultEmoji(port);
    const { name: customName, emoji: customEmoji } = normalized[port] ?? { name: '', emoji: defaultEmoji };
    const displayEmoji = customEmoji || defaultEmoji;
    return `
      <div class="tab-row" data-port="${port}" role="listitem">
        <input class="emoji-input"
               data-port="${port}"
               type="text"
               maxlength="2"
               placeholder="${defaultEmoji}"
               aria-label="Emoji for port ${port}"
               value="${escapeHtml(displayEmoji)}">
        <label for="input-${port}">Port ${port}</label>
        <input id="input-${port}"
               class="tab-name-input"
               data-port="${port}"
               type="text"
               placeholder="${defaultName}"
               aria-label="Custom name for port ${port}"
               value="${escapeHtml(customName)}">
      </div>`;
  }).join('');
}

/** Legacy: string-only mapping. Kept for tests that assert old shape. New code uses applyNameMapping/applyEmojiMapping. */
export function applyMapping(portMappings, port, value) {
  const updated = { ...portMappings };
  if (value) {
    updated[port] = value;
  } else {
    delete updated[port];
  }
  return updated;
}

/**
 * Apply name change for a port; persists object form { name, emoji }. Removes entry if name and emoji both default.
 */
export function applyNameMapping(portMappings, port, nameStr) {
  const normalized = normalizePortMappings(portMappings);
  const current = normalized[port] ?? { name: '', emoji: getDefaultEmoji(port) };
  const name = nameStr.trim();
  const emoji = current.emoji || getDefaultEmoji(port);
  const updated = { ...normalized };
  if (name === '' && emoji === getDefaultEmoji(port)) {
    delete updated[port];
  } else {
    updated[port] = { name, emoji };
  }
  return updated;
}

/**
 * Apply emoji change for a port; persists object form { name, emoji }. Removes entry if name and emoji both default.
 */
export function applyEmojiMapping(portMappings, port, emojiStr) {
  const normalized = normalizePortMappings(portMappings);
  const current = normalized[port] ?? { name: '', emoji: getDefaultEmoji(port) };
  const emoji = (emojiStr.trim().slice(0, 2) || getDefaultEmoji(port));
  const name = current.name;
  const updated = { ...normalized };
  if (name === '' && emoji === getDefaultEmoji(port)) {
    delete updated[port];
  } else {
    updated[port] = { name, emoji };
  }
  return updated;
}

async function saveMapping(input) {
  const port = input.dataset.port;
  const value = input.value.trim();
  try {
    const { portMappings = {} } = await chrome.storage.sync.get('portMappings');
    const updated = applyNameMapping(portMappings, port, value);
    await chrome.storage.sync.set({ portMappings: updated });
  } catch (_) {
    // silent per NFR9
  }
}

async function saveEmojiMapping(input) {
  const port = input.dataset.port;
  const value = input.value.trim().slice(0, 2);
  try {
    const { portMappings = {} } = await chrome.storage.sync.get('portMappings');
    const updated = applyEmojiMapping(portMappings, port, value);
    await chrome.storage.sync.set({ portMappings: updated });
  } catch (_) {
    // silent per NFR9
  }
}

/**
 * Build portMappings from current DOM (all tab rows). Used by "Update titles" button.
 */
function buildPortMappingsFromDOM() {
  const rows = document.querySelectorAll('.tab-row');
  const portMappings = {};
  for (const row of rows) {
    const port = row.dataset.port;
    if (!port) continue;
    const nameInput = row.querySelector('.tab-name-input');
    const emojiInput = row.querySelector('.emoji-input');
    const name = (nameInput?.value ?? '').trim();
    const emoji = (emojiInput?.value ?? '').trim().slice(0, 2) || getDefaultEmoji(port);
    if (name === '' && emoji === getDefaultEmoji(port)) continue;
    portMappings[port] = { name, emoji };
  }
  return portMappings;
}

/**
 * Save all current name/emoji values from the popup to storage. Storage change triggers
 * background to rewrite tab titles. Call this from "Update titles" button.
 */
export async function saveAllAndUpdateTitles() {
  try {
    const portMappings = buildPortMappingsFromDOM();
    await chrome.storage.sync.set({ portMappings });
  } catch (_) {
    // silent per NFR9
  }
}

export function attachEditListeners() {
  document.querySelectorAll('.tab-name-input').forEach(input => {
    input.addEventListener('blur', () => saveMapping(input));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveMapping(input);
      }
    });
  });
  document.querySelectorAll('.emoji-input').forEach(input => {
    input.addEventListener('blur', () => saveEmojiMapping(input));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEmojiMapping(input);
      }
    });
  });

  const updateBtn = document.getElementById('update-titles-btn');
  if (updateBtn) {
    updateBtn.addEventListener('click', () => saveAllAndUpdateTitles());
  }
}

export function updateToggleUI(isEnabled) {
  const btn = document.getElementById('toggle-btn');
  btn.textContent = isEnabled ? 'Pause' : 'Resume';
  btn.setAttribute('aria-pressed', String(!isEnabled));
}

function updateRewriteModeUI(mode) {
  const checkbox = document.getElementById('rewrite-mode-toggle');
  if (!checkbox) return;
  checkbox.checked = mode === 'replace';
}

async function initRewriteMode() {
  try {
    const { rewriteMode = 'prefix' } = await chrome.storage.sync.get('rewriteMode');
    updateRewriteModeUI(rewriteMode);

    const checkbox = document.getElementById('rewrite-mode-toggle');
    if (!checkbox) return;
    checkbox.addEventListener('change', async () => {
      try {
        const nextMode = checkbox.checked ? 'replace' : 'prefix';
        await chrome.storage.sync.set({ rewriteMode: nextMode });
        updateRewriteModeUI(nextMode);
      } catch (_) {
        // silent — NFR9
      }
    });
  } catch (_) {
    // silent — NFR9
  }
}

async function initToggle() {
  try {
    const { isEnabled = true } = await chrome.storage.sync.get('isEnabled');
    updateToggleUI(isEnabled);
    document.getElementById('toggle-btn').addEventListener('click', async () => {
      try {
        const { isEnabled: current = true } = await chrome.storage.sync.get('isEnabled');
        const next = !current;
        await chrome.storage.sync.set({ isEnabled: next });
        updateToggleUI(next);
      } catch (_) {
        // silent — NFR9
      }
    });
  } catch (_) {
    // silent — NFR9; button defaults to "Pause" (isEnabled=true assumed)
  }
}

export async function init() {
  try {
    const [tabs, storage] = await Promise.all([
      chrome.tabs.query({ url: ['*://localhost/*', '*://127.0.0.1/*'] }),
      chrome.storage.sync.get('portMappings')
    ]);
    const portMappings = storage.portMappings ?? {};
    if (tabs.length === 0) {
      renderEmptyState();
    } else {
      renderTabList(tabs, {}, portMappings);
      attachEditListeners();
    }
  } catch (_) {
    renderEmptyState();
  }
  initToggle();
  initRewriteMode();
}

init();
