#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const jsonSum = require('../dist/json-summary-node');
const { version, name } = require('../package');
const STDIN = process.stdin.fd;
const scriptName = path.basename(process.argv[1]);

if (process.argv.includes('-v')) {
  console.error(`${name} v${version}`);
  process.exit(0);
}

const fn = process.argv[2];
if (!fn || fn.startsWith('--')) {
  console.error(`Usage:  ${scriptName} <file.json|- (stdin)>  [--indent N]`);
  process.exit(1);
}

let data;
if (fn === '-') {  // read from stdin
  data = fs.readFileSync(STDIN, 'utf-8');
  data = JSON.parse(data);
} else {
  data = require(path.resolve(fn));
}

let indent = process.argv.indexOf('--indent');
if (indent !== -1) {
  indent = parseInt(process.argv[indent + 1]);
}

let summary = jsonSum.summarize(data);

let text = jsonSum.printSummary(summary, {
  asText: true,
  ...(indent >= 0 ? {
    indentCount: indent
  } : null)
});

console.log(text);
process.exit(0);
