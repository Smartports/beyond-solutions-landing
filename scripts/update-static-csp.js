#!/usr/bin/env node
/* Update CSP meta tag for static HTML pages to align with React app CSP */
const fs = require('fs');
const path = require('path');

const targets = [
  'index.html',
  'calculator.html',
  'calculator-gamified.html',
  path.join('docs', 'component-examples.html'),
];

const csp =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https:; font-src 'self' https://fonts.gstatic.com; frame-src 'self';";

for (const file of targets) {
  if (!fs.existsSync(file)) {
    console.warn(`Skipping ${file}`);
    continue;
  }
  let html = fs.readFileSync(file, 'utf8');
  const newMeta = `<meta http-equiv=\"Content-Security-Policy\" content=\"${csp}\">`;
  const hasMeta = /<meta[^>]+http-equiv="Content-Security-Policy"[^>]*>/i.test(html);
  if (hasMeta) {
    html = html.replace(/<meta[^>]+http-equiv="Content-Security-Policy"[^>]*>/i, newMeta);
  } else {
    html = html.replace('<head>', `<head>\n  ${newMeta}`);
  }
  fs.writeFileSync(file, html, 'utf8');
  console.log(`CSP updated for ${file}`);
}
