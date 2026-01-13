import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKGROUND_COLOR = '#000000';
const ICON_PATH = path.join(__dirname, '../app/icon.png');
const OUTPUT_DIR = path.join(__dirname, '../public/splash');

// iOS splash screen sizes (portrait)
const IOS_SPLASH_SIZES = [
  { width: 1170, height: 2532, name: 'apple-splash-1170x2532.png' }, // iPhone 12/13/14
  { width: 1284, height: 2778, name: 'apple-splash-1284x2778.png' }, // iPhone 12/13/14 Pro Max
  { width: 1179, height: 2556, name: 'apple-splash-1179x2556.png' }, // iPhone 14 Pro
  { width: 1290, height: 2796, name: 'apple-splash-1290x2796.png' }, // iPhone 14 Pro Max / 15 Pro Max
  { width: 1125, height: 2436, name: 'apple-splash-1125x2436.png' }, // iPhone X/XS/11 Pro
  { width: 1242, height: 2688, name: 'apple-splash-1242x2688.png' }, // iPhone XS Max/11 Pro Max
  { width: 828, height: 1792, name: 'apple-splash-828x1792.png' },   // iPhone XR/11
  { width: 750, height: 1334, name: 'apple-splash-750x1334.png' },   // iPhone 8/SE
  { width: 640, height: 1136, name: 'apple-splash-640x1136.png' },   // iPhone SE (1st gen)
  { width: 1668, height: 2388, name: 'apple-splash-1668x2388.png' }, // iPad Pro 11"
  { width: 2048, height: 2732, name: 'apple-splash-2048x2732.png' }, // iPad Pro 12.9"
  { width: 1620, height: 2160, name: 'apple-splash-1620x2160.png' }, // iPad 10.2"
  { width: 1536, height: 2048, name: 'apple-splash-1536x2048.png' }, // iPad Air/Mini
];

// Android splash - just one size, Android scales it
const ANDROID_SPLASH = { width: 512, height: 512, name: 'android-splash-512x512.png' };

async function generateSplash() {
  console.log('🎨 Generating splash screens...');

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Read the icon
  const iconBuffer = await sharp(ICON_PATH)
    .resize(256, 256) // Resize icon to fit nicely in splash
    .toBuffer();

  // Generate iOS splash screens
  for (const size of IOS_SPLASH_SIZES) {
    const { width, height, name } = size;
    const iconSize = Math.min(width, height) * 0.3; // Icon takes 30% of smallest dimension

    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: BACKGROUND_COLOR,
      },
    })
      .composite([
        {
          input: await sharp(ICON_PATH)
            .resize(Math.round(iconSize), Math.round(iconSize))
            .toBuffer(),
          gravity: 'center',
        },
      ])
      .png()
      .toFile(path.join(OUTPUT_DIR, name));

    console.log(`  ✅ Generated ${name}`);
  }

  // Generate Android splash (centered icon on background)
  await sharp({
    create: {
      width: ANDROID_SPLASH.width,
      height: ANDROID_SPLASH.height,
      channels: 4,
      background: BACKGROUND_COLOR,
    },
  })
    .composite([
      {
        input: await sharp(ICON_PATH)
          .resize(256, 256)
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toFile(path.join(OUTPUT_DIR, ANDROID_SPLASH.name));

  console.log(`  ✅ Generated ${ANDROID_SPLASH.name}`);

  console.log('\n✨ All splash screens generated!');
  console.log(`   Output directory: ${OUTPUT_DIR}`);
}

generateSplash().catch(console.error);
