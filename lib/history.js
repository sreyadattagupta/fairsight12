/**
 * Analysis history — persisted in localStorage.
 */

const HISTORY_KEY = "fairsight_history";
const MAX_ENTRIES = 50;

export function saveToHistory({ type, filename, results, modelName = null }) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type, // 'dataset' | 'model'
    filename,
    modelName,
    date: new Date().toISOString(),
    fairnessScore: results.summary?.fairnessScore ?? null,
    fairnessLevel: results.summary?.fairnessLevel ?? null,
    protectedAttributes: results.summary?.protectedAttributes ?? [],
    totalRows: results.summary?.totalRows ?? 0,
    targetColumn: results.summary?.targetColumn ?? null,
    isRegression: results.summary?.isRegression ?? false,
    // Full results compressed
    results,
  };

  try {
    const existing = loadHistory();
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return entry.id;
  } catch {
    return null;
  }
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function deleteFromHistory(id) {
  try {
    const updated = loadHistory().filter((e) => e.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

export function getHistoryEntry(id) {
  return loadHistory().find((e) => e.id === id) ?? null;
}
