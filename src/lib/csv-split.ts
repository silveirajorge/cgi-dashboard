export interface CsvChunk {
  blob: Blob;
  name: string;
}

export interface SplitResult {
  chunks: CsvChunk[];
  totalChunks: number;
  originalName: string;
}

const CHUNK_SIZE = 48 * 1024 * 1024;

export async function splitCsvIntoChunks(file: File): Promise<SplitResult> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const firstNewline = findByte(bytes, 0x0a, 0);
  if (firstNewline === -1) {
    throw new Error("CSV inválido — não foi possível encontrar o cabeçalho");
  }

  // headerLen = number of bytes in the header row (excluding any line ending)
  const headerLen = firstNewline > 0 && bytes[firstNewline - 1] === 0x0d ? firstNewline - 1 : firstNewline;
  const dataStart = firstNewline + 1;

  // Build byte offsets of each data line's first byte
  const lineStarts: number[] = [];
  let pos = dataStart;
  while (pos < bytes.length) {
    lineStarts.push(pos);
    const nl = findByte(bytes, 0x0a, pos);
    if (nl === -1) break;
    pos = nl + 1;
  }

  if (lineStarts.length === 0) {
    throw new Error("CSV vazio — nenhuma linha de dados encontrada");
  }

  const totalDataLines = lineStarts.length;

  // Estimate average line size from first 100 lines
  const sampleSize = Math.min(100, totalDataLines);
  let sampleBytes = 0;
  for (let i = 0; i < sampleSize; i++) {
    const end = i + 1 < lineStarts.length ? lineStarts[i + 1] : bytes.length;
    sampleBytes += end - lineStarts[i];
  }
  const avgLineBytes = sampleBytes / sampleSize;
  const linesPerChunk = Math.max(1, Math.floor((CHUNK_SIZE - (headerLen + 1)) / avgLineBytes));

  const chunks: CsvChunk[] = [];
  const baseName = file.name.replace(/\.csv$/i, "");

  for (let i = 0; i < totalDataLines; i += linesPerChunk) {
    const chunkStart = lineStarts[i];
    const chunkEnd = i + linesPerChunk < totalDataLines ? lineStarts[i + linesPerChunk] : bytes.length;
    const dataLen = chunkEnd - chunkStart;

    // Build: header + \n + data rows (normalizes \r\n → \n for the header line only)
    const combined = new Uint8Array(headerLen + 1 + dataLen);
    combined.set(bytes.slice(0, headerLen), 0);
    combined[headerLen] = 0x0a;
    combined.set(bytes.slice(chunkStart, chunkEnd), headerLen + 1);

    const chunkNumber = Math.floor(i / linesPerChunk) + 1;
    chunks.push({
      blob: new Blob([combined], { type: "text/csv" }),
      name: `${baseName}_part${chunkNumber}.csv`,
    });
  }

  return { chunks, totalChunks: chunks.length, originalName: file.name };
}

function findByte(bytes: Uint8Array, value: number, from: number): number {
  for (let i = from; i < bytes.length; i++) {
    if (bytes[i] === value) return i;
  }
  return -1;
}
