// Generates assets/extension-icon.png: the Backwise "KB" brand mark, centered on a
// 512x512 transparent canvas. Pure Node (zlib + manual PNG encoding), no dependencies.
//
// Source artwork: Backwise Icon, "color-dark" variant (371x320, viewBox 0 0 371 320).
// Four filled paths (two triangles + two quarter-circle bowls built from a single
// cubic each). Rendered at 4x supersampling and box-downsampled for anti-aliasing.
const zlib = require("node:zlib");
const fs = require("node:fs");
const path = require("node:path");

const SIZE = 512;
const SS = 4; // supersampling factor
const SUP = SIZE * SS;

// Place the 371x320 artwork on the 512 canvas: scale to ~384px wide, centered.
const SCALE = 1.0351;
const TX = 64;
const TY = 90.4;

// Brand colors (color-dark variant).
const PEACH = [0xff, 0xce, 0x96];
const BLUE = [0x21, 0x60, 0xa4];
const RED = [0xff, 0x77, 0x77];

// Paths in artwork coordinate space. Each path is a closed contour: a start point
// followed by segments — ["L", x, y] (line) or ["C", c1x, c1y, c2x, c2y, x, y] (cubic).
const PATHS = [
  {
    color: PEACH, // top-left card with rounded top-left corner
    start: [48.2397, 0],
    segs: [
      ["L", 160.24, 0],
      ["L", 0.239746, 160],
      ["L", 0.239746, 48],
      ["C", 0.239746, 21.4903, 21.7301, 0, 48.2397, 0],
    ],
  },
  {
    color: BLUE, // bottom-left card with rounded bottom-left corner
    start: [0.239746, 272],
    segs: [
      ["L", 0.239746, 160],
      ["L", 160.24, 320],
      ["L", 48.2397, 320],
      ["C", 21.7301, 320, 0.239746, 298.51, 0.239746, 272],
    ],
  },
  {
    color: BLUE, // bottom-right bowl
    start: [190.24, 160],
    segs: [
      ["L", 190.24, 320],
      ["L", 370.24, 320],
      ["C", 370.24, 231.635, 278.589, 160, 190.24, 160],
    ],
  },
  {
    color: RED, // top-right bowl
    start: [370.24, 0],
    segs: [
      ["L", 190.24, 0],
      ["L", 190.24, 160],
      ["C", 278.589, 160, 370.24, 88.37, 370.24, 0],
    ],
  },
];

// Map an artwork point into supersampled device space.
const dx = (x) => (x * SCALE + TX) * SS;
const dy = (y) => (y * SCALE + TY) * SS;

// Flatten a path into a closed polygon (array of [x, y] in device space).
function flatten(p) {
  const pts = [[dx(p.start[0]), dy(p.start[1])]];
  let cx = p.start[0];
  let cy = p.start[1];
  for (const s of p.segs) {
    if (s[0] === "L") {
      cx = s[1];
      cy = s[2];
      pts.push([dx(cx), dy(cy)]);
    } else {
      // cubic bezier; flatten with fixed steps
      const [, c1x, c1y, c2x, c2y, ex, ey] = s;
      const STEPS = 64;
      for (let i = 1; i <= STEPS; i++) {
        const t = i / STEPS;
        const u = 1 - t;
        const bx = u * u * u * cx + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * ex;
        const by = u * u * u * cy + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * ey;
        pts.push([dx(bx), dy(by)]);
      }
      cx = ex;
      cy = ey;
    }
  }
  return pts;
}

// Supersampled RGBA buffer (premultiplied not needed; regions are flat colors).
const sup = new Uint8Array(SUP * SUP * 4);

function fillPolygon(poly, [r, g, b]) {
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [, y] of poly) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const y0 = Math.max(0, Math.floor(minY));
  const y1 = Math.min(SUP - 1, Math.ceil(maxY));
  for (let py = y0; py <= y1; py++) {
    const yc = py + 0.5;
    const xs = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const c = poly[(i + 1) % poly.length];
      const ay = a[1];
      const by = c[1];
      if (ay > yc !== by > yc) {
        xs.push(a[0] + ((yc - ay) / (by - ay)) * (c[0] - a[0]));
      }
    }
    xs.sort((m, n) => m - n);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = Math.max(0, Math.ceil(xs[k] - 0.5));
      const xb = Math.min(SUP - 1, Math.floor(xs[k + 1] - 0.5));
      for (let px = xa; px <= xb; px++) {
        const o = (py * SUP + px) * 4;
        sup[o] = r;
        sup[o + 1] = g;
        sup[o + 2] = b;
        sup[o + 3] = 255;
      }
    }
  }
}

for (const p of PATHS) fillPolygon(flatten(p), p.color);

// Box-downsample SS x SS blocks into the final RGBA image, averaging color weighted
// by alpha so transparent edges don't pick up dark fringes.
const out = new Uint8Array(SIZE * SIZE * 4);
const n = SS * SS;
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    let ar = 0;
    let ag = 0;
    let ab = 0;
    let aa = 0;
    for (let sy = 0; sy < SS; sy++) {
      for (let sx = 0; sx < SS; sx++) {
        const o = ((y * SS + sy) * SUP + (x * SS + sx)) * 4;
        const a = sup[o + 3];
        if (a) {
          ar += sup[o];
          ag += sup[o + 1];
          ab += sup[o + 2];
          aa += a;
        }
      }
    }
    const o = (y * SIZE + x) * 4;
    const covered = aa / 255; // number of opaque samples
    out[o] = covered ? Math.round(ar / covered) : 0;
    out[o + 1] = covered ? Math.round(ag / covered) : 0;
    out[o + 2] = covered ? Math.round(ab / covered) : 0;
    out[o + 3] = Math.round(aa / n);
  }
}

// --- PNG encoding (RGBA, color type 6) ---
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

// Raw image: each row prefixed with filter byte 0, then RGBA quadruples.
const raw = Buffer.alloc(SIZE * (1 + SIZE * 4));
for (let y = 0; y < SIZE; y++) {
  const rowStart = y * (1 + SIZE * 4);
  raw[rowStart] = 0; // filter: none
  for (let x = 0; x < SIZE; x++) {
    const src = (y * SIZE + x) * 4;
    const p = rowStart + 1 + x * 4;
    raw[p] = out[src];
    raw[p + 1] = out[src + 1];
    raw[p + 2] = out[src + 2];
    raw[p + 3] = out[src + 3];
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0);
ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // color type: RGBA
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const outPath = path.join(__dirname, "..", "assets", "extension-icon.png");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, png);
console.log(`Wrote ${outPath} (${png.length} bytes)`);
