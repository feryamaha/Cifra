/**
 * Detecao de pitch por autocorrelacao com parabolic interpolation (afinador, SPEC_006 C1).
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function frequencyToNote(freq: number): {
  name: string;
  octave: number;
  cents: number;
  targetHz: number;
} {
  const a4 = 440;
  const semi = 12 * Math.log2(freq / a4);
  const midi = Math.round(semi) + 69;
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  const targetHz = a4 * 2 ** ((midi - 69) / 12);
  const cents = Math.round(1200 * Math.log2(freq / targetHz));
  return { name, octave, cents, targetHz };
}

export function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
  const SIZE = buffer.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    const v = buffer[i] ?? 0;
    rms += v * v;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return null;

  const minFreq = 50;
  const maxFreq = 1500;
  const minLag = Math.floor(sampleRate / maxFreq);
  const maxLag = Math.min(Math.floor(sampleRate / minFreq), Math.floor(SIZE / 2));

  const correlations = new Float32Array(maxLag + 1);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < maxLag; i++) {
      sum += (buffer[i] ?? 0) * (buffer[i + lag] ?? 0);
    }
    correlations[lag] = sum;
  }

  let d = minLag;
  while (d < maxLag - 1 && (correlations[d] ?? 0) > (correlations[d + 1] ?? 0)) d++;
  let maxVal = -1;
  let maxPos = -1;
  for (let i = d; i <= maxLag; i++) {
    const c = correlations[i] ?? 0;
    if (c > maxVal) {
      maxVal = c;
      maxPos = i;
    }
  }
  if (maxPos <= 0) return null;

  if (maxPos > 0 && maxPos < maxLag) {
    const x1 = maxPos - 1;
    const x2 = maxPos;
    const x3 = maxPos + 1;
    const y1 = correlations[x1] ?? 0;
    const y2 = correlations[x2] ?? 0;
    const y3 = correlations[x3] ?? 0;
    const denom = (x1 - x2) * (x1 - x3) * (x2 - x3);
    if (denom !== 0) {
      const a = (x3 * (y2 - y1) + x2 * (y1 - y3) + x1 * (y3 - y2)) / denom;
      const b = (x3 * x3 * (y1 - y2) + x2 * x2 * (y3 - y1) + x1 * x1 * (y2 - y3)) / denom;
      const peakX = -b / (2 * a);
      if (peakX > 0 && peakX < maxLag) {
        return sampleRate / peakX;
      }
    }
  }

  return sampleRate / maxPos;
}
