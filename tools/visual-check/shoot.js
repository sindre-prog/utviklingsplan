// Tar hele skjermbildesettet.
// Bruk: node tools/visual-check/shoot.js <mappe> [base-url] [filter]
// Krever puppeteer-core (sett PUPPETEER_MODULE ved behov) og Chrome (sett CHROME_PATH ved behov).

const fs = require("fs");
const path = require("path");
const puppeteer = require(process.env.PUPPETEER_MODULE || "puppeteer-core");

const outDir = process.argv[2];
const baseUrl = (process.argv[3] || "http://localhost:8770").replace(/\/$/, "");
const filter = process.argv[4] ? new RegExp(process.argv[4]) : null;
if (!outDir) {
  console.error("Bruk: node tools/visual-check/shoot.js <mappe> [base-url] [filter]");
  process.exit(1);
}

const scenes = [
  ["akkurat-naa-tom", "scene=now-empty"],
  ["akkurat-naa-utkast", "scene=now-draft"],
  ["akkurat-naa", "scene=now-complete"],
  ["akkurat-naa-aktiv", "scene=now-active"],
  ["forlopet", "scene=now-complete&pane=direction"],
  ["forlopet-delvis", "scene=direction-partial"],
  ["forlopet-tom", "scene=now-empty&pane=direction"],
  ["utviklingsfokus-lederkompetanser", "scene=workspace&pane=work"],
  ["utviklingsfokus-fokusoppdrag", "scene=focus-detail&pane=work"],
  ["utviklingsfokus-fokusoppdrag-flere", "scene=focus-many&pane=work"],
  ["utviklingsfokus-eksperimenter", "scene=focus-many&pane=work&view=experiments"],
  ["utviklingsfokus-tom", "scene=now-empty&pane=work"],
  ["samtaler", "scene=now-complete&pane=sessions"],
  ["refleksjon", "scene=now-complete&pane=reflections"],
  ["ressurser", "scene=now-complete&pane=resources"],
  ["samtaler-aktiv", "scene=now-active&pane=sessions"],
  ["refleksjon-aktiv", "scene=now-active&pane=reflections"],
  ["ressurser-aktiv", "scene=now-active&pane=resources"],
  ["samtaler-flere", "scene=rich&pane=sessions"],
  ["refleksjon-flere", "scene=rich&pane=reflections"],
  ["ressurser-flere", "scene=rich&pane=resources"],
  ["coach-samtaler", "scene=rich&pane=sessions&role=coach"],
  ["coach-refleksjon", "scene=rich&pane=reflections&role=coach"],
  ["coach-ressurser", "scene=rich&pane=resources&role=coach"],
  ["bibliotek", "scene=chooser-two"],
  ["bibliotek-tom", "scene=chooser-empty"],
  ["bibliotek-kompetanse", "scene=chooser-two&mobilepreview=1"],
  ["bibliotek-coach", "scene=chooser-two&role=coach"],
  ["bibliotek-ingen-treff", "scene=chooser-two&query=xyzzy"],
  ["dialog-eksperiment-ny", "scene=rich&pane=work&dialog=experiment-new"],
  ["dialog-eksperiment-rediger", "scene=rich&pane=work&dialog=experiment-edit"],
  ["dialog-eksperiment-se-tilbake", "scene=rich&pane=work&dialog=experiment-review"],
  ["dialog-bekreft", "scene=rich&pane=work&dialog=confirm"],
  ["dialog-bekreft-slett", "scene=rich&role=coach&dialog=confirm-remove"],
  ["dialog-melding", "scene=rich&pane=reflections&dialog=message"],
  ["dialog-inviter-klient", "scene=rich&role=coach&dialog=client-invite"],
  ["dialog-rediger-klient", "scene=rich&role=coach&dialog=client-edit"],
  ["dialog-ressurs-rediger", "scene=rich&role=coach&dialog=resource-edit"],
  ["dialog-ressurs-del", "scene=rich&role=coach&pane=resources&dialog=resource-send"],
  ["innlogging", "screen=login"],
  ["nytt-passord", "screen=password"],
  ["ny-tilkobling", "screen=reconnect"],
  ["samtykke", "screen=consent"],
  ["coach-akkurat-naa", "scene=now-complete&role=coach"],
  ["coach-forlopet", "scene=now-complete&pane=direction&role=coach"],
  ["coach-utviklingsfokus", "scene=workspace&pane=work&role=coach"],
  ["byggeklosser", "", "components.html"]
];

// Skissene for steg 10 tas bare når filteret nevner dem, for eksempel "skisse-".
const sketchScenes = [
  ["skisse-dialog-eksperiment-ny", "scene=rich&pane=work&sketch=eksperiment-ny"],
  ["skisse-dialog-eksperiment-rediger", "scene=rich&pane=work&sketch=eksperiment-rediger"],
  ["skisse-dialog-eksperiment-se-tilbake", "scene=rich&pane=work&sketch=eksperiment-se-tilbake"],
  ["skisse-dialog-inviter-klient", "scene=rich&role=coach&sketch=inviter-klient"],
  ["skisse-dialog-bekreft", "scene=rich&pane=work&sketch=bekreft"],
  ["skisse-dialog-bekreft-slett", "scene=rich&role=coach&sketch=bekreft-slett"],
  ["skisse-dialog-melding", "scene=rich&pane=reflections&sketch=melding"],
  ["skisse-dialog-bibliotek", "scene=rich&pane=work&sketch=bibliotek"],
  ["skisse-dialog-bibliotek-kompetanse", "scene=rich&pane=work&sketch=bibliotek-kompetanse"],
  ["skisse-innlogging", "screen=login&sketch=innlogging"],
  ["skisse-nytt-passord", "screen=login&sketch=nytt-passord"],
  ["skisse-ny-tilkobling", "screen=login&sketch=ny-tilkobling"],
  ["skisse-samtykke", "screen=consent&sketch=samtykke"]
].map(([name, query]) => [name, query, "sketches.html"]);
if (filter && filter.source.includes("skisse")) scenes.push(...sketchScenes);

const viewports = [
  ["1440", 1440, 900],
  ["1024", 1024, 1366],
  ["390", 390, 844],
  ["360", 360, 780]
];

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || "/usr/local/bin/google-chrome",
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"]
  });
  let failures = 0;
  for (const [scene, query, file = "preview.html"] of scenes) {
    for (const [label, width, height] of viewports) {
      const name = `${scene}-${label}`;
      if (filter && !filter.test(name)) continue;
      const page = await browser.newPage();
      page.on("pageerror", (error) => {
        failures += 1;
        console.log(`FEIL ${name}: ${error.message}`);
      });
      await page.setViewport({ width, height, isMobile: width < 700, hasTouch: width < 700 });
      await page.goto(`${baseUrl}/tools/visual-check/${file}?${query}`, { waitUntil: "networkidle0" });
      await page.waitForFunction(() => document.body.dataset.ready, { timeout: 20000 });
      const ready = await page.evaluate(() => document.body.dataset.ready);
      if (ready !== "1") {
        failures += 1;
        console.log(`FEIL ${name}: oppstart feilet`);
      }
      await page.evaluate(() => document.activeElement?.blur?.());
      await new Promise((resolve) => setTimeout(resolve, 300));
      await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: !/^(skisse-)?(dialog-|bibliotek)/.test(scene) });
      console.log(name);
      await page.close();
    }
  }
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
