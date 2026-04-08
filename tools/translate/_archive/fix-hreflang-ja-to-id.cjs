#!/usr/bin/env node
// fix-hreflang-ja-to-id.cjs
// Replaces hreflang="ja" with hreflang="id" and fixes URLs from /ja/[en-slug]/ to /id/[id-slug]/

const fs = require('fs');
const path = require('path');

// EN slug → ID slug mapping
const slugMap = {
  '': '',
  'tiktok-downloader': 'unduh-tiktok',
  'twitter-video-downloader': 'unduh-twitter',
  'invoice-generator': 'pembuat-faktur',
  'paystub-generator': 'pembuat-slip-gaji',
  'ai-detector': 'pendeteksi-ai',
  'ai-humanizer': 'humanizer-ai',
  'image-toolkit': 'peralatan-gambar',
  'about': 'tentang',
  'contact': 'kontak',
  'privacy': 'privasi',
  'terms': 'syarat',
  'blog': 'blog',
};

const files = [
  'frontend/de/bild-werkzeuge/index.html',
  'frontend/de/datenschutz/index.html',
  'frontend/de/gehaltsabrechnungs-generator/index.html',
  'frontend/de/index.html',
  'frontend/de/ki-detektor/index.html',
  'frontend/de/ki-humanisierer/index.html',
  'frontend/de/kontakt/index.html',
  'frontend/de/nutzungsbedingungen/index.html',
  'frontend/de/rechnungsgenerator/index.html',
  'frontend/de/tiktok-herunterladen/index.html',
  'frontend/de/twitter-video-herunterladen/index.html',
  'frontend/de/ueber-uns/index.html',
  'frontend/es/acerca-de/index.html',
  'frontend/es/contacto/index.html',
  'frontend/es/descargador-tiktok/index.html',
  'frontend/es/descargador-twitter/index.html',
  'frontend/es/detector-ia/index.html',
  'frontend/es/generador-facturas/index.html',
  'frontend/es/generador-recibo-nomina/index.html',
  'frontend/es/herramientas-imagenes/index.html',
  'frontend/es/humanizador-ia/index.html',
  'frontend/es/index.html',
  'frontend/es/privacidad/index.html',
  'frontend/es/terminos/index.html',
  'frontend/hi/about/index.html',
  'frontend/hi/ai-detector/index.html',
  'frontend/hi/ai-humanizer/index.html',
  'frontend/hi/contact/index.html',
  'frontend/hi/image-toolkit/index.html',
  'frontend/hi/index.html',
  'frontend/hi/invoice-generator/index.html',
  'frontend/hi/paystub-generator/index.html',
  'frontend/hi/privacy/index.html',
  'frontend/hi/terms/index.html',
  'frontend/hi/tiktok-downloader/index.html',
  'frontend/hi/twitter-video-downloader/index.html',
  'frontend/pt/baixar-tiktok/index.html',
  'frontend/pt/baixar-twitter/index.html',
  'frontend/pt/contato/index.html',
  'frontend/pt/detector-ia/index.html',
  'frontend/pt/ferramentas-imagem/index.html',
  'frontend/pt/gerador-faturas/index.html',
  'frontend/pt/gerador-holerite/index.html',
  'frontend/pt/humanizador-ia/index.html',
  'frontend/pt/index.html',
  'frontend/pt/privacidade/index.html',
  'frontend/pt/sobre/index.html',
  'frontend/pt/termos/index.html',
];

const ROOT = path.join(__dirname, '../../');

let changed = 0;

files.forEach(file => {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) {
    console.log(`SKIP (not found): ${file}`);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  // 1. Fix hreflang="ja" → hreflang="id"
  content = content.replace(/hreflang="ja"/g, 'hreflang="id"');

  // 2. Fix URL: /ja/[en-slug]/ → /id/[id-slug]/
  content = content.replace(/https:\/\/aawebtools\.com\/ja\/([^"]*)/g, (match, slug) => {
    // slug may be empty (homepage) or like "tiktok-downloader/"
    const slugKey = slug.replace(/\/$/, ''); // remove trailing slash
    if (slugKey in slugMap) {
      const idSlug = slugMap[slugKey];
      return `https://aawebtools.com/id/${idSlug ? idSlug + '/' : ''}`;
    }
    // Unknown slug — keep /ja/ but warn
    console.log(`  WARNING: unknown slug "${slugKey}" in ${file} — kept as /ja/${slug}`);
    return match;
  });

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    changed++;
    console.log(`FIXED: ${file}`);
  } else {
    console.log(`NO CHANGE: ${file}`);
  }
});

console.log(`\nDone. ${changed}/${files.length} files updated.`);
