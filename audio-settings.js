const defaults = { speech: 100, effects: 70 };
const volumes = { ...defaults };
try {
  const saved = JSON.parse(localStorage.getItem('buduj-audio-volume'));
  for (const key of Object.keys(defaults)) {
    if (typeof saved?.[key] === 'number' && Number.isFinite(saved[key])) volumes[key] = Math.max(0, Math.min(100, saved[key]));
  }
} catch {}
export function getVolume(key) { return volumes[key] / 100; }
export function setVolume(key, value) {
  if (!(key in defaults) || !Number.isFinite(Number(value))) return;
  volumes[key] = Math.max(0, Math.min(100, Number(value)));
  try { localStorage.setItem('buduj-audio-volume', JSON.stringify(volumes)); } catch {}
}
