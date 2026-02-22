/**
 * Génère les icônes PWA (192x192 et 512x512) au format PNG
 * sans dépendance externe — utilise uniquement le module zlib natif Node.js
 */
const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

// Couleurs BAARA
const BG_R = 0x1A, BG_G = 0x27, BG_B = 0x42  // #1A2742 bleu marine
const AC_R = 0xE9, AC_G = 0xA2, AC_B = 0x3B  // #E9A23B orange accent

function uint32BE(n) {
  const buf = Buffer.alloc(4)
  buf.writeUInt32BE(n >>> 0, 0)
  return buf
}

function crc32(buf) {
  let crc = 0xFFFFFFFF
  const table = makeCRCTable()
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8)
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function makeCRCTable() {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    }
    table[n] = c
  }
  return table
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii')
  const crcInput = Buffer.concat([typeBuffer, data])
  return Buffer.concat([
    uint32BE(data.length),
    typeBuffer,
    data,
    uint32BE(crc32(crcInput)),
  ])
}

/**
 * Crée un PNG avec un fond #1A2742 et un "B" centré en orange
 */
function generatePNG(size) {
  // Signature PNG
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0)
  ihdrData.writeUInt32BE(size, 4)
  ihdrData[8] = 8   // bit depth
  ihdrData[9] = 2   // color type: truecolor (RGB)
  ihdrData[10] = 0  // compression
  ihdrData[11] = 0  // filter
  ihdrData[12] = 0  // interlace

  const ihdr = chunk('IHDR', ihdrData)

  // Données image (chaque ligne : 1 octet filtre + size * 3 octets RGB)
  const rawData = Buffer.alloc(size * (1 + size * 3), 0)

  // Épaisseur du "B" en pixels (proportionnel à la taille)
  const margin = Math.floor(size * 0.22)
  const strokeW = Math.max(2, Math.floor(size * 0.08))

  for (let y = 0; y < size; y++) {
    rawData[y * (1 + size * 3)] = 0 // filter None

    for (let x = 0; x < size; x++) {
      const offset = y * (1 + size * 3) + 1 + x * 3

      // Fond bleu marine par défaut
      let r = BG_R, g = BG_G, b = BG_B

      // Dessiner un "B" stylisé en orange
      const lx = x - margin
      const ly = y - margin
      const innerW = size - 2 * margin
      const innerH = size - 2 * margin
      const half = Math.floor(innerH / 2)

      // Barre verticale gauche du B
      if (lx >= 0 && lx < strokeW && ly >= 0 && ly < innerH) {
        r = AC_R; g = AC_G; b = AC_B
      }
      // Barre horizontale haut
      else if (ly >= 0 && ly < strokeW && lx >= 0 && lx < innerW * 0.7) {
        r = AC_R; g = AC_G; b = AC_B
      }
      // Barre horizontale milieu
      else if (ly >= half - Math.floor(strokeW / 2) && ly < half + Math.ceil(strokeW / 2) && lx >= 0 && lx < innerW * 0.75) {
        r = AC_R; g = AC_G; b = AC_B
      }
      // Barre horizontale bas
      else if (ly >= innerH - strokeW && ly < innerH && lx >= 0 && lx < innerW * 0.7) {
        r = AC_R; g = AC_G; b = AC_B
      }
      // Barre verticale droite haut (demi-cercle haut simplifié)
      else if (lx >= innerW * 0.65 && lx < innerW * 0.65 + strokeW && ly > 0 && ly < half) {
        r = AC_R; g = AC_G; b = AC_B
      }
      // Barre verticale droite bas (demi-cercle bas un peu plus large)
      else if (lx >= innerW * 0.7 && lx < innerW * 0.7 + strokeW && ly >= half && ly < innerH) {
        r = AC_R; g = AC_G; b = AC_B
      }

      rawData[offset] = r
      rawData[offset + 1] = g
      rawData[offset + 2] = b
    }
  }

  // Compresser avec zlib
  const compressed = zlib.deflateSync(rawData, { level: 9 })
  const idat = chunk('IDAT', compressed)

  // IEND
  const iend = chunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdr, idat, iend])
}

// Générer les deux tailles
const outputDir = path.join(__dirname, '..', 'public', 'icons')
fs.mkdirSync(outputDir, { recursive: true })

const sizes = [192, 512]
for (const size of sizes) {
  const png = generatePNG(size)
  const outPath = path.join(outputDir, `icon-${size}.png`)
  fs.writeFileSync(outPath, png)
  console.log(`✓ icon-${size}.png généré (${png.length} octets)`)
}

console.log('Icônes PWA générées avec succès !')
