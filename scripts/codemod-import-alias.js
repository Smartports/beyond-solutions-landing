#!/usr/bin/env node
/* Codemod to replace relative package imports with @beyond/* aliases */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const aliasMap = {
  core: '@beyond/core',
  ui: '@beyond/ui',
  geo: '@beyond/geo',
  maps: '@beyond/maps',
  finance: '@beyond/finance',
  experience3d: '@beyond/experience3d',
};

const exts = ['ts', 'tsx', 'js', 'jsx'];
const patterns = exts.map((ext) => `**/*.${ext}`);

const files = patterns.flatMap((p) => glob.sync(p, { ignore: ['node_modules/**', 'dist/**'] }));

const REL_REGEX =
  /["']((?:\.\.\/)+)packages\/(core|ui|geo|maps|finance|experience3d)(?:\/src)?(\/[^"']*)["']/g;

files.forEach((file) => {
  const text = fs.readFileSync(file, 'utf8');
  let replaced = text.replace(REL_REGEX, (match, dots, pkg, rest) => {
    const alias = aliasMap[pkg];
    // Strip any leading / from rest
    const clean = rest.replace(/^\//, '');
    return `'${alias}/${clean}'`;
  });

  if (replaced !== text) {
    fs.writeFileSync(file, replaced, 'utf8');
    console.log(`Updated imports in ${file}`);
  }
});
