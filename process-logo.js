import sharp from 'sharp';
import fs from 'fs';

const inputPath = 'C:/Users/Jobelon Mahinay/.gemini/antigravity/brain/4efcd007-1563-4cca-b195-67315677e2a1/.user_uploaded/media_1790830963800.png';

async function processLogo() {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  console.log('Metadata:', metadata);

  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  console.log('Info:', info);

  // Analyze corner pixel color (which is the white/off-white background)
  const r0 = data[0];
  const g0 = data[1];
  const b0 = data[2];
  console.log('Background corner RGB:', r0, g0, b0);

  // Variant 1: Remove outer white/light background (turn transparent) while keeping the rounded dark app tile
  // We can treat any pixel close to the corner color (r > 230, g > 230, b > 230) as transparent
  const outDataWithTile = Buffer.alloc(info.width * info.height * 4);
  const channels = info.channels;

  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    
    // Check if it's the light/white background
    const isWhiteBg = r > 230 && g > 230 && b > 230;

    outDataWithTile[i * 4] = r;
    outDataWithTile[i * 4 + 1] = g;
    outDataWithTile[i * 4 + 2] = b;
    outDataWithTile[i * 4 + 3] = isWhiteBg ? 0 : 255;
  }

  // Save as public/logo.png and public/logo-badge.png
  await sharp(outDataWithTile, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .trim() // trim transparent edges so it's tight
  .png()
  .toFile('public/logo.png');

  console.log('Saved public/logo.png successfully');

  // Variant 2: Also create an icon symbol-only version (where the dark bg is also transparent, leaving only green S and white/green text, or just green S)
  const outSymbolOnly = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * channels];
    const g = data[i * channels + 1];
    const b = data[i * channels + 2];
    
    // Check if it's dark background or white background
    const isDarkBg = r < 45 && g < 45 && b < 45;
    const isWhiteBg = r > 230 && g > 230 && b > 230;

    outSymbolOnly[i * 4] = r;
    outSymbolOnly[i * 4 + 1] = g;
    outSymbolOnly[i * 4 + 2] = b;
    outSymbolOnly[i * 4 + 3] = (isDarkBg || isWhiteBg) ? 0 : 255;
  }

  await sharp(outSymbolOnly, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .trim()
  .png()
  .toFile('public/logo-symbol.png');

  console.log('Saved public/logo-symbol.png successfully');
}

processLogo().catch(console.error);
