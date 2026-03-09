const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'assets');

async function processImages() {
    const files = fs.readdirSync(imgDir).filter(f => f.endsWith('.png'));
    for (const file of files) {
        if (file.startsWith('bg_')) continue; // Don't make backgrounds transparent

        try {
            const imgPath = path.join(imgDir, file);
            const image = await Jimp.read(imgPath);

            // Get top-left pixel color
            const hex = image.getPixelColor(0, 0);
            const r = Jimp.intToRGBA(hex).r;
            const g = Jimp.intToRGBA(hex).g;
            const b = Jimp.intToRGBA(hex).b;

            // Distance function
            const colorDiff = (c1, r2, g2, b2) => {
                const rgba = Jimp.intToRGBA(c1);
                return Math.sqrt(Math.pow(rgba.r - r2, 2) + Math.pow(rgba.g - g2, 2) + Math.pow(rgba.b - b2, 2));
            };

            // Scan and make transparent
            image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                const dist = colorDiff(this.getPixelColor(x, y), r, g, b);
                if (dist < 40) {
                    this.bitmap.data[idx + 3] = dist > 15 ? ((dist - 15) / 25) * 255 : 0;
                }
            });

            await image.writeAsync(imgPath);
            console.log(`Processed ${file} (bg: ${r}, ${g}, ${b})`);
        } catch (e) {
            console.error(`Failed ${file}`, e.message);
        }
    }
}

processImages();
