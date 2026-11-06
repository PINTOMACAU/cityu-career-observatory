#!/usr/bin/env node
// Guards the two lists that must never drift: the required questions in
// data/questions.js and the REQUIRED array the cloud function enforces.
//
//   node scripts/check-schema.mjs

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { SECTIONS, REQUIRED_NAMES } = require('../data/questions.js');

const source = readFileSync(new URL('../cloudfunctions/submitResponse/index.js', import.meta.url), 'utf8');
const match = source.match(/const REQUIRED = (\[[\s\S]*?\]);/);
if (!match) {
  console.error('Could not find the REQUIRED array in cloudfunctions/submitResponse/index.js');
  process.exit(1);
}

const remote = match[1]
  .replace(/'/g, '"')
  .replace(/,\s*]/g, ']');
const serverSide = JSON.parse(remote);

const clientSide = REQUIRED_NAMES.slice().sort();
const serverSorted = serverSide.slice().sort();

const onlyClient = clientSide.filter((n) => !serverSorted.includes(n));
const onlyServer = serverSorted.filter((n) => !clientSide.includes(n));

const names = new Set();
const duplicates = [];
for (const section of SECTIONS) {
  for (const el of section.elements) {
    if (names.has(el.name)) duplicates.push(el.name);
    names.add(el.name);
  }
}

let failed = false;
if (onlyClient.length) {
  failed = true;
  console.error('Required on the client but not enforced by the server:', onlyClient.join(', '));
}
if (onlyServer.length) {
  failed = true;
  console.error('Enforced by the server but no longer required on the client:', onlyServer.join(', '));
}
if (duplicates.length) {
  failed = true;
  console.error('Duplicate question names:', duplicates.join(', '));
}

const total = SECTIONS.reduce((sum, section) => sum + section.elements.length, 0);
if (failed) process.exit(1);
console.log(`OK - ${SECTIONS.length} sections, ${total} questions, ${clientSide.length} required.`);
