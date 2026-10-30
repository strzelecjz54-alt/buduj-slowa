import { getVolume } from './audio-settings.js';
// Local, short cues: no downloads, speech engine or network required.
let enabled = true;
let context;
try { enabled = localStorage.getItem('buduj-answer-sounds') !== 'off'; } catch {}
export function soundsEnabled() { return enabled; }
export function toggleSounds() {
  enabled = !enabled;
  try { localStorage.setItem('buduj-answer-sounds', enabled ? 'on' : 'off'); } catch {}
  return enabled;
}
export function playAnswerSound(correct) {
  if (!enabled || getVolume('effects') === 0) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    context ||= new AudioContext();
    const current = context;
    const play = () => {
      if (!enabled || current.state !== 'running') return;
      const start = current.currentTime;
      const notes = correct ? [[659.25, 0, .12], [880, .11, .20]] : [[311.13, 0, .13], [261.63, .12, .20]];
      for (const [frequency, offset, duration] of notes) {
        const oscillator = current.createOscillator();
        const gain = current.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start + offset);
        gain.gain.linearRampToValueAtTime(.24 * getVolume('effects'), start + offset + .015);
        gain.gain.exponentialRampToValueAtTime(.001, start + offset + duration);
        oscillator.connect(gain);
        gain.connect(current.destination);
        oscillator.start(start + offset);
        oscillator.stop(start + offset + duration + .02);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      }
    };
    // Called directly from the answer tap to satisfy mobile autoplay rules.
    if (current.state === 'running') play();
    else current.resume().then(play).catch(() => {});
  } catch { /* Visual feedback remains available if audio is unsupported. */ }
}
