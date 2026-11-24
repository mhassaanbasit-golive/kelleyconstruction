let sharedAudioCtx = null;

function isReducedMotionActive() {
  try {
    if (typeof window === 'undefined') return true;
    const forceFull = document.documentElement.classList.contains('wk-motion-full');
    if (forceFull) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

function getAudioContext() {
  try {
    if (typeof window === 'undefined') return null;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!sharedAudioCtx) {
      sharedAudioCtx = new Ctx();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

export function playSound(kind, muted = false) {
  try {
    if (muted || isReducedMotionActive()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (kind === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.linearRampToValueAtTime(1120, now + 0.045);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.11);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
      return;
    }

    if (kind === 'ding') {
      const tones = [
        { freq: 880, start: 0, end: 0.12 },
        { freq: 1320, start: 0.05, end: 0.18 },
      ];
      for (const t of tones) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(t.freq, now + t.start);

        gain.gain.setValueAtTime(0.001, now + t.start);
        gain.gain.linearRampToValueAtTime(0.2, now + t.start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t.end);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + t.start);
        osc.stop(now + t.end + 0.01);
      }
    }
  } catch (err) {
    console.warn('[WK chat] sound playback skipped:', err);
  }
}

export function playNotificationChime(muted = false) {
  playSound('pop', muted);
}
