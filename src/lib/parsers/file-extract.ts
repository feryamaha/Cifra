/**
 * Extrai texto puro de arquivos .txt, .docx e .pdf no browser.
 */

export type SupportedUploadExt = 'txt' | 'docx' | 'pdf';

export function getUploadExt(file: File): SupportedUploadExt | null {
  const name = file.name.toLowerCase();
  if (name.endsWith('.txt') || file.type === 'text/plain') return 'txt';
  if (
    name.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'docx';
  }
  if (name.endsWith('.pdf') || file.type === 'application/pdf') return 'pdf';
  return null;
}

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = getUploadExt(file);
  if (!ext) {
    throw new Error('Formato não suportado. Use .txt, .docx ou .pdf.');
  }
  if (ext === 'txt') {
    return file.text();
  }
  if (ext === 'docx') {
    return extractDocx(file);
  }
  return extractPdf(file);
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value || '';
}

async function extractPdf(file: File): Promise<string> {
  // pdfjs-dist: worker self-host em /public (CSP sem unpkg/CDN)
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // Agrupa por Y para tentar preservar linhas de acordes
    const items = content.items as { str: string; transform: number[] }[];
    const rows = new Map<number, { x: number; str: string }[]>();
    for (const item of items) {
      if (!item.str) continue;
      const y = Math.round(item.transform[5]);
      const x = item.transform[4];
      const list = rows.get(y) ?? [];
      list.push({ x, str: item.str });
      rows.set(y, list);
    }
    const sortedY = [...rows.keys()].sort((a, b) => b - a);
    for (const y of sortedY) {
      const row = (rows.get(y) ?? []).sort((a, b) => a.x - b.x);
      parts.push(row.map((r) => r.str).join(''));
    }
    parts.push('');
  }
  return parts.join('\n');
}
