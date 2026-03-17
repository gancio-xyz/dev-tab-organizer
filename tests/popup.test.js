import { test } from 'node:test';
import assert from 'node:assert/strict';

// Provide minimal DOM and chrome mocks before importing popup.js
// Minimal DOM mock for toggle button
let btn = { textContent: '', _attrs: {} };
btn.setAttribute = (k, v) => { btn._attrs[k] = String(v); };
btn.addEventListener = () => {};

const tabListEl = { hidden: false, innerHTML: '' };
const emptyStateEl = { hidden: false, textContent: '' };

globalThis.document = {
  getElementById: (id) => {
    if (id === 'toggle-btn') return btn;
    if (id === 'tab-list') return tabListEl;
    if (id === 'empty-state') return emptyStateEl;
    return { hidden: false, textContent: '' };
  },
  querySelectorAll: () => []
};

globalThis.chrome = {
  tabs: {
    query: async () => []
  },
  storage: {
    sync: {
      get: async () => ({ portMappings: {} }),
      set: async () => {}
    }
  }
};

const { applyMapping, applyNameMapping, applyEmojiMapping, normalizePortMappings, updateToggleUI, renderTabList } = await import('../extension/popup.js');

test('applyMapping sets new value for empty mappings', () => {
  const result = applyMapping({}, '3000', 'My App');
  assert.deepEqual(result, { '3000': 'My App' });
});

test('applyMapping removes mapping when value is empty', () => {
  const result = applyMapping({ '3000': 'My App' }, '3000', '');
  assert.deepEqual(result, {});
});

test('applyMapping preserves other ports when updating one', () => {
  const result = applyMapping({ '3000': 'A', '8080': 'B' }, '3000', 'C');
  assert.deepEqual(result, { '3000': 'C', '8080': 'B' });
});

test('updateToggleUI: active state sets Pause + aria-pressed false', () => {
  updateToggleUI(true);
  assert.equal(btn.textContent, 'Pause');
  assert.equal(btn._attrs['aria-pressed'], 'false');
});

test('updateToggleUI: paused state sets Resume + aria-pressed true', () => {
  updateToggleUI(false);
  assert.equal(btn.textContent, 'Resume');
  assert.equal(btn._attrs['aria-pressed'], 'true');
});

test('renderTabList: one row per unique port (no duplicates for same port)', () => {
  tabListEl.innerHTML = '';
  const twoTabsSamePort = [
    { url: 'http://localhost:3000/' },
    { url: 'http://localhost:3000/path' }
  ];
  renderTabList(twoTabsSamePort, {}, {});
  const rows = (tabListEl.innerHTML.match(/class="tab-row"/g) || []);
  assert.equal(rows.length, 1, 'should render exactly one row when two tabs share the same port');
  assert.ok(tabListEl.innerHTML.includes('input-3000'), 'row should contain input for port 3000');
});

test('renderTabList: one row per port across different ports', () => {
  tabListEl.innerHTML = '';
  const tabs = [
    { url: 'http://localhost:3000/' },
    { url: 'http://localhost:8080/' }
  ];
  renderTabList(tabs, {}, {});
  const rows = (tabListEl.innerHTML.match(/class="tab-row"/g) || []);
  assert.equal(rows.length, 2, 'should render two rows for two different ports');
  assert.ok(tabListEl.innerHTML.includes('input-3000') && tabListEl.innerHTML.includes('input-8080'));
});

test('renderTabList: each row includes emoji input', () => {
  tabListEl.innerHTML = '';
  const tabs = [{ url: 'http://localhost:3000/' }];
  renderTabList(tabs, {}, {});
  assert.ok(tabListEl.innerHTML.includes('emoji-input'), 'row should contain emoji input');
  assert.ok(tabListEl.innerHTML.includes('maxlength="2"'), 'emoji input should be maxlength 2');
});

test('normalizePortMappings: empty or non-object returns empty', () => {
  assert.deepEqual(normalizePortMappings({}), {});
  assert.deepEqual(normalizePortMappings(null), {});
  assert.deepEqual(normalizePortMappings(undefined), {});
});

test('normalizePortMappings: legacy string value becomes { name, emoji }', () => {
  const result = normalizePortMappings({ '3000': 'My App' });
  assert.equal(result['3000'].name, 'My App');
  assert.equal(result['3000'].emoji, '⚛️');
});

test('normalizePortMappings: object value preserves name and emoji', () => {
  const result = normalizePortMappings({ '3000': { name: 'My App', emoji: '🚀' } });
  assert.equal(result['3000'].name, 'My App');
  assert.equal(result['3000'].emoji, '🚀');
});

test('applyNameMapping: sets name and keeps emoji', () => {
  const result = applyNameMapping({ '3000': { name: 'Old', emoji: '🚀' } }, '3000', 'New Name');
  assert.deepEqual(result['3000'], { name: 'New Name', emoji: '🚀' });
});

test('applyNameMapping: empty name and default emoji removes entry', () => {
  const result = applyNameMapping({ '3000': { name: '', emoji: '⚛️' } }, '3000', '');
  assert.ok(!('3000' in result));
});

test('applyEmojiMapping: sets emoji and keeps name', () => {
  const result = applyEmojiMapping({ '3000': { name: 'My App', emoji: '⚛️' } }, '3000', '🐧');
  assert.deepEqual(result['3000'], { name: 'My App', emoji: '🐧' });
});

test('applyEmojiMapping: empty name and default emoji removes entry', () => {
  const result = applyEmojiMapping({ '3000': { name: '', emoji: '⚛️' } }, '3000', '⚛️');
  assert.ok(!('3000' in result));
});
