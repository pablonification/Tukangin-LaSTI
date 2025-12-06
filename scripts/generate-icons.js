const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, '../public/tukangin.svg');
const outputDir = path.join(__dirname, '../public');

// Check if sharp is installed
try {
  require.resolve('sharp');
} catch (e) {
  console.log('Installing sharp...');
  require('child_process').execSync('npm install sharp', { stdio: 'inherit' });
}

async function generateIcons() {
  // Read SVG file
  const svgBuffer = fs.readFileSync(inputFile);

  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(svgBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputFile);
    
    console.log(`Generated ${outputFile}`);
  }

  // Generate apple touch icon
  const appleIconFile = path.join(outputDir, 'apple-touch-icon.png');
  await sharp(svgBuffer)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(appleIconFile);
  
  console.log(`Generated ${appleIconFile}`);
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
