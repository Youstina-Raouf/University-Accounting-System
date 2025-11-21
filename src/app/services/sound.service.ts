import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SoundService {
  private audioCtx?: AudioContext;

  private getCtx() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioCtx;
  }

  // Simple short beep for success
  playSuccess(duration = 160) {
    this.playTone(880, duration, 'sine', 0.04);
  }

  // Lower tone for error
  playError(duration = 220) {
    this.playTone(220, duration, 'sawtooth', 0.06);
  }

  // Click tap
  playClick(duration = 80) {
    this.playTone(1200, duration, 'square', 0.02);
  }

  // Generic tone
  playTone(freq: number, duration = 120, type: OscillatorType = 'sine', gain = 0.03) {
    try {
      const ctx = this.getCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = gain;
      o.connect(g);
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      o.start(now);
      g.gain.setValueAtTime(gain, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
      o.stop(now + duration / 1000 + 0.02);
    } catch (e) {
      // ignore
    }
  }
}
