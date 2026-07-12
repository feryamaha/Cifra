/**
 * Detecção de pitch para o afinador (SPEC_010 rodada 4).
 *
 * Motor: McLeod Pitch Method via `pitchy` (MIT). O MPM devolve, além da
 * frequência, um valor de CLARITY (0..1) que mede quão "limpo" é o pitch:
 * ruído cacofônico tem clarity baixa e é descartado. Isso elimina os falsos
 * positivos da autocorrelação crua anterior (qualquer ruído virava nota).
 *
 * Anti-falso-positivo em camadas:
 *  1. minVolumeDecibels: sinal fraco demais é ignorado pelo próprio pitchy.
 *  2. CLARITY_MIN alto (afinador precisa de leitura estável, não musical).
 *  3. faixa de frequência do violão (com folga).
 *  4. mediana das últimas leituras (o componente aplica) mata outliers.
 */

import { PitchDetector } from 'pitchy';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Clarity mínima para aceitar um pitch (0..1). Alto = conservador. */
export const CLARITY_MIN = 0.92;
/** Faixa útil para violão: E2 (~82Hz) a E4 (~330Hz), com folga. */
const MIN_FREQ = 60;
const MAX_FREQ = 500;

export function frequencyToNote(freq: number): {
  name: string;
  octave: number;
  cents: number;
  midi: number;
  targetHz: number;
} {
  const a4 = 440;
  const semi = 12 * Math.log2(freq / a4);
  const midi = Math.round(semi) + 69;
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  const targetHz = a4 * 2 ** ((midi - 69) / 12);
  const cents = Math.round(1200 * Math.log2(freq / targetHz));
  return { name, octave, cents, midi, targetHz };
}

export interface PitchReading {
  pitch: number;
  clarity: number;
}

export interface PitchEngine {
  detect(buffer: Float32Array, sampleRate: number): PitchReading | null;
}

/**
 * Cria um detector reutilizável para um tamanho de janela fixo (fftSize do
 * AnalyserNode). O pitchy exige buffer sempre do mesmo tamanho.
 */
export function createPitchEngine(inputLength: number): PitchEngine {
  const detector = PitchDetector.forFloat32Array(inputLength);
  // ignora quadros abaixo desse volume (dB) direto no motor.
  detector.minVolumeDecibels = -34;

  return {
    detect(buffer, sampleRate) {
      const [pitch, clarity] = detector.findPitch(buffer, sampleRate);
      if (!pitch || clarity < CLARITY_MIN) return null;
      if (pitch < MIN_FREQ || pitch > MAX_FREQ) return null;
      return { pitch, clarity };
    },
  };
}
