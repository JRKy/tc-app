import sharp from 'sharp';
import fs from 'fs';

const sizes = [192, 512];
const inputFile = 'assets/logo.svg';

async function generateIcons() {
  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(inputFile);

    // Generate icons for each size
    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(`assets/icon-${size}x${size}.png`);
      
      console.log(`✅ Generated assets/icon-${size}x${size}.png`);
    }

    // Generate favicon
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile('assets/favicon.png');
    
    console.log('✅ Generated assets/favicon.png');

  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons(); 