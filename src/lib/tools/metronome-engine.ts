export type Subdivision = 'quarter' | 'eighth' | 'sixteenth' | 'triplet';

const SUB_DIVISOR: Record<Subdivision, number> = {
  quarter: 1,
  eighth: 2,
  sixteenth: 4,
  triplet: 3,
};

export class MetronomeEngine {
  private ctx: AudioContext | null = null;
  private nextNoteTime = 0;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private beat = 0;
  private running = false;
  private volume = 0.7;
  private muted = false;
  private subdivision: Subdivision = 'quarter';
  private tapTimes: number[] = [];

  constructor(
    public bpm = 100,
    public beatsPerBar = 4,
  ) {}

  private scheduleClick(time: number, accent: boolean) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.value = accent ? 1200 : 800;
    const vol = (accent ? 0.35 : 0.18) * this.volume * (this.muted ? 0 : 1);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    osc.start(time);
    osc.stop(time + 0.05);
  }

  private scheduler = () => {
    if (!this.ctx || !this.running) return;
    const divisor = SUB_DIVISOR[this.subdivision];
    const interval = 60 / this.bpm / divisor;
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      const beatIndex = Math.floor(this.beat / divisor);
      const isAccent = beatIndex % this.beatsPerBar === 0 && this.beat % divisor === 0;
      this.scheduleClick(this.nextNoteTime, isAccent);
      this.nextNoteTime += interval;
      this.beat += 1;
    }
  };

  async start() {
    if (this.running) return;
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    await this.ctx.resume();
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.beat = 0;
    this.running = true;
    this.timerId = setInterval(this.scheduler, 25);
  }

  stop() {
    this.running = false;
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = null;
  }

  setBpm(bpm: number) {
    this.bpm = Math.min(240, Math.max(40, Math.round(bpm)));
  }

  setBeatsPerBar(n: number) {
    this.beatsPerBar = n;
  }

  setVolume(v: number) {
    this.volume = Math.min(1, Math.max(0, v));
  }

  setMuted(m: boolean) {
    this.muted = m;
  }

  setSubdivision(s: Subdivision) {
    this.subdivision = s;
  }

  tapTempo(): number | null {
    const now = performance.now();
    this.tapTimes.push(now);
    if (this.tapTimes.length > 4) this.tapTimes.shift();
    if (this.tapTimes.length < 2) return null;
    const intervals: number[] = [];
    for (let i = 1; i < this.tapTimes.length; i++) {
      intervals.push(this.tapTimes[i] - this.tapTimes[i - 1]);
    }
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60000 / avg);
    if (bpm >= 40 && bpm <= 240) {
      this.bpm = bpm;
      return bpm;
    }
    return null;
  }

  resetTap() {
    this.tapTimes = [];
  }

  get isRunning() {
    return this.running;
  }

  get currentBeat() {
    const divisor = SUB_DIVISOR[this.subdivision];
    return Math.floor(this.beat / divisor) % this.beatsPerBar;
  }

  destroy() {
    this.stop();
    void this.ctx?.close();
    this.ctx = null;
  }
}
