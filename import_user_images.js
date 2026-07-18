const fs = require('fs');
const path = require('path');

const srcDir = '/Users/arielhavana/Documents/exports_tech';
const destDir = path.join(__dirname, 'public', 'assets', 'regions');

const mapping = {
  "alaotra mangoro.jpg": "AlaotraMangoro.jpg",
  "amoron mania.jpg": "AmoroniMania.jpg",
  "analamanga.jpg": "Analamanga.jpg",
  "androy.jpeg": "Androy.jpg",
  "anosy.jpeg": "Anosy.jpg",
  "atsimoandrefana.jpg": "AtsimoAndrefana.jpg",
  "atsimo atsinanana.webp": "AtsimoAtsinanana.webp",
  "betsiboka.jpg": "Betsiboka.jpg",
  "Boeny.jpg": "Boeny.jpg",
  "bongolava.jpg": "Bongolava.jpg",
  "diana.jpg": "Diana.jpg",
  "atsinanana.html": "Atsinanana.html",
  "vatovavy.jpeg": "VatovavyFitovinany.jpg",
  "haute matsiatra.jpg": "HauteMatsiatra.jpg",
  "ihorombe.jpg": "Ihorombe.jpg",
  "images.jpeg": "Analanjirofo.jpg",
  "itasy.jpg": "Itasy.jpg",
  "melaky.jpg": "Melaky.jpg",
  "menabe.jpg": "Menabe.jpg",
  "sava.jpg": "Sava.jpg",
  "sofia.jpg": "Sofia.jpg",
  "vakinakaratra.jpg": "Vakinankaratra.jpg"
};

for (const [src, dest] of Object.entries(mapping)) {
    const srcPath = path.join(srcDir, src);
    const destPath = path.join(destDir, dest);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${src} -> ${dest}`);
    } else {
        console.warn(`File missing: ${src}`);
    }
}
