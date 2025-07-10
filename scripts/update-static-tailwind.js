#!/usr/bin/env node
/* eslint-disable no-console */
// Migrate static HTML pages from CDN Tailwind to generated static stylesheet.
// Removes CDN links/scripts & inline tailwind.config, injects ./css/tailwind-static.css,
// and strips `https://cdn.tailwindcss.com` from CSP meta tag.

const fs = require('fs');
const path = require('path');

const targets = [
  'index.html',
  'calculator.html',
  'calculator-gamified.html',
  path.join('docs', 'component-examples.html'),
];

const cdnPattern = /https:\/\/cdn\.tailwindcss\.com/;

const removePatterns = [
  /<link[^>]+href="https:\/\/cdn\.tailwindcss\.com[^"]*"[^>]*>/gi, // preconnect / preload links
  /<script[^>]+src="https:\/\/cdn\.tailwindcss\.com[^"]*"[^>]*><\/script>/gi, // external script
  /<script>\s*tailwind\.config[\s\S]*?<\/script>/gi, // inline config
];

function injectStaticCss(html) {
  // Insert static stylesheet before the first custom css link (colors.css as anchor)
  const staticLink = '<link rel="stylesheet" href="./css/tailwind-static.css">';
  if (html.includes(staticLink)) return html; // already patched
  return html.replace(/<link[^>]+href="\.\/css\/colors\.css"/, `${staticLink}$&`);
}

function patchCsp(html) {
  return html.replace(
    /(<meta[^>]+http-equiv="Content-Security-Policy"[^>]+content=")([^"]+)("[^>]*>)/i,
    (_, start, content, end) => {
      const cleaned = content.replace(/https:\/\/cdn\.tailwindcss\.com\s?/g, '');
      return `${start}${cleaned.trim()}${end}`;
    },
  );
}

for (const filePath of targets) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping ${filePath}: not found`);
    continue;
  }
  let html = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  removePatterns.forEach((regex) => {
    if (regex.test(html)) {
      html = html.replace(regex, '');
      modified = true;
    }
  });
  const injected = injectStaticCss(html);
  if (injected !== html) {
    html = injected;
    modified = true;
  }
  const patched = patchCsp(html);
  if (patched !== html) {
    html = patched;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Patched ${filePath}`);
  } else {
    console.log(`No changes needed for ${filePath}`);
  }
}
