// Minimal, zero-dependency pure TypeScript QR Code generator (Version 1-10, Error Correction Level M)
// Generates boolean[][] module matrix suitable for Canvas/SVG rendering.

class QRBitBuffer {
  private buffer: number[] = [];
  public length = 0;

  get(index: number): boolean {
    const bufIndex = Math.floor(index / 8);
    return ((this.buffer[bufIndex] >>> (7 - (index % 8))) & 1) === 1;
  }

  put(num: number, length: number): void {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  putBit(bit: boolean): void {
    const bufIndex = Math.floor(this.length / 8);
    if (this.buffer.length <= bufIndex) {
      this.buffer.push(0);
    }
    if (bit) {
      this.buffer[bufIndex] |= 0x80 >>> (this.length % 8);
    }
    this.length++;
  }
}

// Polynomial math for Reed-Solomon error correction
const EXP_TABLE = new Uint8Array(256);
const LOG_TABLE = new Uint8Array(256);
for (let i = 0, x = 1; i < 256; i++) {
  EXP_TABLE[i] = x;
  LOG_TABLE[x] = i;
  x = (x << 1) ^ (x & 0x80 ? 0x11d : 0);
}

function glog(n: number): number {
  if (n < 1) throw new Error("glog(" + n + ")");
  return LOG_TABLE[n]!;
}

function gexp(n: number): number {
  while (n < 0) n += 255;
  while (n >= 256) n -= 255;
  return EXP_TABLE[n]!;
}

function rsMultiply(p1: number[], p2: number[]): number[] {
  const num = Array.from({ length: p1.length + p2.length - 1 }, () => 0);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      num[i + j] ^= gexp(glog(p1[i]!) + glog(p2[j]!));
    }
  }
  return num;
}

function rsGeneratorPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    poly = rsMultiply(poly, [1, gexp(i)]);
  }
  return poly;
}

function rsCalculateRemainder(data: number[], degree: number): number[] {
  const gen = rsGeneratorPoly(degree);
  const remainder = Array.from({ length: degree }, () => 0);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i]! ^ remainder[0]!;
    remainder.shift();
    remainder.push(0);
    if (factor !== 0) {
      for (let j = 0; j < degree; j++) {
        remainder[j] ^= gexp(glog(gen[j + 1]!) + glog(factor));
      }
    }
  }
  return remainder;
}

// Version capacities and block configurations for EC Level M (byte mode)
// Each entry: [version, totalDataCodewords, ecCodewordsPerBlock, numBlocks]
const VERSION_SPECS: [number, number, number, number][] = [
  [1, 16, 10, 1],
  [2, 28, 16, 1],
  [3, 44, 26, 1],
  [4, 64, 18, 2],
  [5, 86, 24, 2],
  [6, 108, 16, 4],
  [7, 124, 18, 4],
];

export function createQRCodeMatrix(text: string): boolean[][] {
  const bytes = new TextEncoder().encode(text);
  const dataLength = bytes.length;

  // Find minimum version that fits data (in Byte mode: 4 bits mode + 8 bits length + 8*dataLength bits)
  const bitLength = 4 + 8 + dataLength * 8;
  const spec = VERSION_SPECS.find(([_, totalData]) => totalData * 8 >= bitLength);
  if (!spec) {
    throw new Error("Text too long for built-in QR generator");
  }

  const [version, totalDataCodewords, ecCount, numBlocks] = spec;
  const moduleCount = version * 4 + 17;

  // Encode data in 8-bit Byte mode (0100)
  const buffer = new QRBitBuffer();
  buffer.put(0b0100, 4); // Byte mode indicator
  buffer.put(dataLength, 8); // Character count indicator
  for (let i = 0; i < bytes.length; i++) {
    buffer.put(bytes[i]!, 8);
  }

  // End of message padding
  const totalBits = totalDataCodewords * 8;
  if (buffer.length + 4 <= totalBits) {
    buffer.put(0, 4);
  } else {
    buffer.put(0, totalBits - buffer.length);
  }
  while (buffer.length % 8 !== 0) {
    buffer.putBit(false);
  }

  // Pad bytes 0xEC, 0x11
  const padBytes = [0xec, 0x11];
  let padIndex = 0;
  while (buffer.length < totalBits) {
    buffer.put(padBytes[padIndex % 2]!, 8);
    padIndex++;
  }

  // Split data into blocks and calculate ECC
  const dataBytes: number[] = [];
  for (let i = 0; i < totalDataCodewords; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      if (buffer.get(i * 8 + b)) {
        byteVal |= 0x80 >>> b;
      }
    }
    dataBytes.push(byteVal);
  }

  const blockSize = Math.floor(totalDataCodewords / numBlocks);
  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];

  for (let b = 0; b < numBlocks; b++) {
    const blockData = dataBytes.slice(b * blockSize, (b + 1) * blockSize);
    dataBlocks.push(blockData);
    ecBlocks.push(rsCalculateRemainder(blockData, ecCount));
  }

  // Interleave data and EC bytes
  const finalCodewords: number[] = [];
  for (let i = 0; i < blockSize; i++) {
    for (let b = 0; b < numBlocks; b++) {
      finalCodewords.push(dataBlocks[b]![i]!);
    }
  }
  for (let i = 0; i < ecCount; i++) {
    for (let b = 0; b < numBlocks; b++) {
      finalCodewords.push(ecBlocks[b]![i]!);
    }
  }

  // Initialize matrix and isFunction mask
  const modules: (boolean | null)[][] = Array.from({ length: moduleCount }, () =>
    Array.from({ length: moduleCount }, () => null)
  );
  const isFunction: boolean[][] = Array.from({ length: moduleCount }, () =>
    Array.from({ length: moduleCount }, () => false)
  );

  // Finder patterns
  function addFinderPattern(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < moduleCount && nc >= 0 && nc < moduleCount) {
          isFunction[nr]![nc] = true;
          if (
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            modules[nr]![nc] = true;
          } else {
            modules[nr]![nc] = false;
          }
        }
      }
    }
  }

  addFinderPattern(0, 0);
  addFinderPattern(moduleCount - 7, 0);
  addFinderPattern(0, moduleCount - 7);

  // Timing patterns
  for (let i = 8; i < moduleCount - 8; i++) {
    if (!isFunction[6]![i]) {
      modules[6]![i] = i % 2 === 0;
      isFunction[6]![i] = true;
    }
    if (!isFunction[i]![6]) {
      modules[i]![6] = i % 2 === 0;
      isFunction[i]![6] = true;
    }
  }

  // Alignment pattern for version >= 2
  if (version >= 2) {
    const alignPos = [6, 18, 22, 26, 30, 34, 38][version - 1] ?? 18;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const nr = alignPos + r;
        const nc = alignPos + c;
        if (!isFunction[nr]![nc]) {
          isFunction[nr]![nc] = true;
          modules[nr]![nc] = Math.max(Math.abs(r), Math.abs(c)) !== 1;
        }
      }
    }
  }

  // Dark module
  modules[4 * version + 9]![8] = true;
  isFunction[4 * version + 9]![8] = true;

  // Format information (Mask pattern 0 + EC Level M -> 101010000010010)
  const formatBits = 0b101010000010010;
  for (let i = 0; i < 15; i++) {
    const bit = ((formatBits >>> i) & 1) === 1;
    // Top-left
    if (i <= 5) {
      modules[i]![8] = bit;
      isFunction[i]![8] = true;
    } else if (i === 6) {
      modules[7]![8] = bit;
      isFunction[7]![8] = true;
    } else if (i === 7) {
      modules[8]![8] = bit;
      isFunction[8]![8] = true;
    } else if (i === 8) {
      modules[8]![7] = bit;
      isFunction[8]![7] = true;
    } else {
      modules[8]![14 - i] = bit;
      isFunction[8]![14 - i] = true;
    }

    // Split format bits around finder patterns
    if (i < 8) {
      modules[8]![moduleCount - i - 1] = bit;
      isFunction[8]![moduleCount - i - 1] = true;
    } else {
      modules[moduleCount - 15 + i]![8] = bit;
      isFunction[moduleCount - 15 + i]![8] = true;
    }
  }

  // Place data bits with Mask pattern 0: (row + col) % 2 === 0
  let bitIndex = 0;
  let dir = -1;
  let row = moduleCount - 1;
  let col = moduleCount - 1;

  while (col > 0) {
    if (col === 6) col--; // Skip vertical timing pattern
    for (let c = 0; c < 2; c++) {
      const curCol = col - c;
      if (!isFunction[row]![curCol]) {
        let bit = false;
        if (bitIndex < finalCodewords.length * 8) {
          const byteVal = finalCodewords[Math.floor(bitIndex / 8)]!;
          bit = ((byteVal >>> (7 - (bitIndex % 8))) & 1) === 1;
          bitIndex++;
        }
        // Invert if mask 0: (row + col) % 2 === 0
        if ((row + curCol) % 2 === 0) {
          bit = !bit;
        }
        modules[row]![curCol] = bit;
      }
    }
    row += dir;
    if (row < 0 || row >= moduleCount) {
      dir = -dir;
      row += dir;
      col -= 2;
    }
  }

  return modules.map((r) => r.map((m) => Boolean(m)));
}

/**
 * Render QR matrix onto an HTML5 Canvas and export as PNG data URL
 */
export function renderQRCodeDataUrl(text: string, size = 300, margin = 2): string {
  if (typeof document === "undefined") return "";
  try {
    const matrix = createQRCodeMatrix(text);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const n = matrix.length;
    const totalCells = n + margin * 2;
    const cellSize = size / totalCells;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "#000000";
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (matrix[r]![c]) {
          ctx.fillRect(
            Math.round((c + margin) * cellSize),
            Math.round((r + margin) * cellSize),
            Math.ceil(cellSize),
            Math.ceil(cellSize)
          );
        }
      }
    }

    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
}
