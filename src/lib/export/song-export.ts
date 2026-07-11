import type { SongViewModel } from '@/types/song/song-view.types';

export function songViewToTxt(view: SongViewModel): string {
  const lines: string[] = [];
  lines.push(view.song.title);
  lines.push(view.song.artist);
  lines.push(
    `Tom: ${view.currentKeyName} | Capo: ${view.capo} | ${view.tuning.label}` +
      (view.song.bpm ? ` | BPM: ${view.song.bpm}` : '') +
      (view.song.timeSignature ? ` | ${view.song.timeSignature}` : ''),
  );
  lines.push('');
  for (const section of view.renderedSections) {
    lines.push(`[${section.tag}] ${section.name}`);
    if (section.annotation) lines.push(`  (${section.annotation})`);
    for (const line of section.lines) {
      const chordRow = line.parts.map((p) => p.display || ' ').join('  ');
      const lyricRow = line.parts.map((p) => p.text || '').join('');
      if (chordRow.trim()) lines.push(chordRow.trimEnd());
      if (lyricRow.trim()) lines.push(lyricRow);
    }
    lines.push('');
  }
  lines.push('Exportado do Cifra Tom');
  return lines.join('\n');
}

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** PDF simples via print-to-PDF do browser (C7). */
export function printSongAsPdf(): void {
  window.print();
}
