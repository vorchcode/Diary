let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function ensureCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // create a master gain for SFX so we can raise/lower SFX relative to music
      try {
        masterGain = ctx.createGain();
        masterGain.gain.value = 0.9; // louder by default
        masterGain.connect(ctx.destination);
      } catch (e) {
        masterGain = null;
      }
    } catch (e) {
      ctx = null;
    }
  }
  return ctx;
}

export function playBubble() {
  const c = ensureCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'triangle';
  o.frequency.value = 420;
  o.connect(g);
  // route through masterGain when available so music and sfx mix cleanly
  if (masterGain) g.connect(masterGain);
  else g.connect(c.destination);
  const now = c.currentTime;
  g.gain.setValueAtTime(0.0001, now);
  // increase peak gain so bubble is more audible over music
  g.gain.exponentialRampToValueAtTime(0.5, now + 0.01);
  o.frequency.exponentialRampToValueAtTime(700, now + 0.12);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
  o.start(now);
  o.stop(now + 0.3);
}

export function playPetal() {
  const c = ensureCtx();
  if (!c) return;
  const o = c.createOscillator();
  const o2 = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';
  o2.type = 'sine';
  o.frequency.value = 880;
  o2.frequency.value = 1320;
  const mix = c.createGain();
  // louder mix so petal is clearly heard over background music
  mix.gain.value = 1.0;
  o.connect(mix);
  o2.connect(mix);
  mix.connect(g);
  if (masterGain) g.connect(masterGain);
  else g.connect(c.destination);
  const now = c.currentTime;
  g.gain.setValueAtTime(0.0001, now);
  // slightly stronger and longer tail for petal
  g.gain.exponentialRampToValueAtTime(0.28, now + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
  o.start(now);
  o2.start(now);
  o.stop(now + 0.6);
  o2.stop(now + 0.6);
}

export function playBreath(phase: "in" | "out" | "hold", durationSeconds: number) {
  const c = ensureCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = 'sine';

  // set base frequencies for in/out
  if (phase === 'in') {
    o.frequency.value = 220;
  } else if (phase === 'out') {
    o.frequency.value = 440;
  } else {
    o.frequency.value = 330;
  }

  o.connect(g);
  g.connect(c.destination);
  const now = c.currentTime;

  // tiny initial gain to avoid click
  g.gain.setValueAtTime(0.0001, now);

  if (phase === 'in') {
    // swell over duration
    g.gain.exponentialRampToValueAtTime(0.12, now + Math.max(0.02, durationSeconds));
    // gentle frequency rise
    o.frequency.exponentialRampToValueAtTime(660, now + Math.max(0.02, durationSeconds));
    o.start(now);
    o.stop(now + durationSeconds + 0.1);
  } else if (phase === 'out') {
    // start a bit louder then decay
    g.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.02, durationSeconds));
    o.frequency.exponentialRampToValueAtTime(220, now + Math.max(0.02, durationSeconds));
    o.start(now);
    o.stop(now + durationSeconds + 0.1);
  } else {
    // hold: small bell
    g.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    o.start(now);
    o.stop(now + 0.6);
  }
}

export default { playBubble, playPetal };
