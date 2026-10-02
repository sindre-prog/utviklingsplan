// Sammenligner to skjermbildesett piksel for piksel.
// Bruk: node tools/visual-check/compare.js <før-mappe> <etter-mappe>

const fs = require("fs");
const path = require("path");
const puppeteer = require(process.env.PUPPETEER_MODULE || "puppeteer-core");

const [beforeDir, afterDir] = process.argv.slice(2);
if (!beforeDir || !afterDir) {
  console.error("Bruk: node tools/visual-check/compare.js <før-mappe> <etter-mappe>");
  process.exit(1);
}

(async () => {
  const names = fs.readdirSync(beforeDir).filter((name) => name.endsWith(".png")).sort();
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome",
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();
  let changed = 0;
  for (const name of names) {
    const afterPath = path.join(afterDir, name);
    if (!fs.existsSync(afterPath)) {
      changed += 1;
      console.log(`MANGLER  ${name}`);
      continue;
    }
    const before = fs.readFileSync(path.join(beforeDir, name));
    const after = fs.readFileSync(afterPath);
    if (before.equals(after)) {
      console.log(`LIK      ${name}`);
      continue;
    }
    const result = await page.evaluate(async (a, b) => {
      const load = (src) => new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = src;
      });
      const [imageA, imageB] = await Promise.all([load(a), load(b)]);
      if (imageA.width !== imageB.width || imageA.height !== imageB.height) {
        return { size: `${imageA.width}x${imageA.height} → ${imageB.width}x${imageB.height}` };
      }
      const pixels = (image) => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        return context.getImageData(0, 0, image.width, image.height).data;
      };
      const dataA = pixels(imageA);
      const dataB = pixels(imageB);
      let diff = 0;
      for (let index = 0; index < dataA.length; index += 4) {
        if (dataA[index] !== dataB[index] || dataA[index + 1] !== dataB[index + 1] || dataA[index + 2] !== dataB[index + 2]) diff += 1;
      }
      return { diff };
    }, `data:image/png;base64,${before.toString("base64")}`, `data:image/png;base64,${after.toString("base64")}`);
    if (result.size) {
      changed += 1;
      console.log(`STØRRELSE ${name}: ${result.size}`);
    } else if (result.diff) {
      changed += 1;
      console.log(`ENDRET   ${name}: ${result.diff} piksler`);
    } else {
      console.log(`LIK      ${name}`);
    }
  }
  await browser.close();
  console.log(`\n${names.length - changed} av ${names.length} like.`);
  process.exit(changed ? 1 : 0);
})();
