#!/usr/bin/env node
const { resolve } = require('path');
const { readFileSync } = require('fs');
const REGIONS = require('../src/regions');
const { computeBBox } = require('../src/geo-to-svg');
const { renderSVG } = require('../src/render');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  printUsage();
  process.exit(0);
}

if (args.includes('--list')) {
  console.log('Available regions:');
  for (const name of Object.keys(REGIONS)) {
    console.log(`  ${name}`);
  }
  process.exit(0);
}

function getArg(name) {
  const i = args.indexOf(name);
  return i !== -1 && i + 1 < args.length ? args[i + 1] : null;
}

const dataPath = resolve(__dirname, '..', 'data', 'ne_110m_admin_0_countries.geojson');
const geojson = JSON.parse(readFileSync(dataPath, 'utf-8'));

const centerArg = getArg('--center');
const radiusArg = getArg('--radius');

let viewBox;

if (centerArg) {
  // --center lat,lon --radius 30 (度単位)
  const parts = centerArg.split(',').map(Number);
  if (parts.length !== 2 || parts.some(isNaN)) {
    console.error('--center format: lat,lon (e.g. 35.68,139.69)');
    process.exit(1);
  }
  const [lat, lon] = parts;
  const radius = radiusArg ? Number(radiusArg) : 20;
  if (isNaN(radius)) {
    console.error('--radius must be a number (degrees)');
    process.exit(1);
  }
  // メルカトル座標に変換
  const DEG2RAD = Math.PI / 180;
  const cx = lon;
  const cy = -Math.log(Math.tan(Math.PI / 4 + (lat * DEG2RAD) / 2)) / DEG2RAD;
  viewBox = {
    x: cx - radius,
    y: cy - radius,
    width: radius * 2,
    height: radius * 2
  };
} else {
  const regionName = args.find(a => !a.startsWith('-'));

  if (!regionName) {
    printUsage();
    process.exit(1);
  }

  if (!(regionName in REGIONS)) {
    console.error(`Unknown region: ${regionName}`);
    console.error(`Use --list to see available regions.`);
    process.exit(1);
  }

  const isoCodes = REGIONS[regionName];
  const regionFeatures = isoCodes === null
    ? geojson.features
    : geojson.features.filter(f => {
        const iso = f.properties.ISO_A3 !== '-99'
          ? f.properties.ISO_A3
          : f.properties.ISO_A3_EH;
        return isoCodes.includes(iso);
      });

  if (regionFeatures.length === 0) {
    console.error(`No countries found for region: ${regionName}`);
    process.exit(1);
  }

  viewBox = regionName === 'world' && !args.includes('--viewBox') && !args.includes('--viewbox')
    ? { x: -180, y: -180, width: 360, height: 360 }
    : computeBBox(regionFeatures);
}

const opts = {};
const swArg = getArg('--stroke-width') || getArg('--sw');
if (swArg != null) opts.strokeWidth = swArg;
if (args.includes('--no-stroke')) opts.noStroke = true;
const fillArg = getArg('--fill');
if (fillArg != null) opts.fill = fillArg;
const strokeArg = getArg('--stroke');
if (strokeArg != null) opts.stroke = strokeArg;

// --highlight "JPN:#ff5555|#0000ff|2;KOR:#5555ff" (ISO:fill|stroke|strokeWidth)
const hlArg = getArg('--highlight') || getArg('--hl');
if (hlArg) {
  opts.highlight = {};
  for (const entry of hlArg.split(';')) {
    const trimmed = entry.trim();
    const firstColon = trimmed.indexOf(':');
    if (firstColon === -1) {
      opts.highlight[trimmed] = { fill: '#ff5555' };
      continue;
    }
    const code = trimmed.slice(0, firstColon).trim();
    const parts = trimmed.slice(firstColon + 1).split('|');
    const hl = {};
    if (parts[0]) hl.fill = parts[0].trim();
    if (parts[1]) hl.stroke = parts[1].trim();
    if (parts[2]) hl.strokeWidth = parts[2].trim();
    opts.highlight[code] = hl;
  }
}

process.stdout.write(renderSVG(geojson.features, viewBox, opts));

function printUsage() {
  console.error('Usage:');
  console.error('  simple-world-map <region> [options]');
  console.error('  simple-world-map --center <lat,lon> [--radius <degrees>] [options]');
  console.error('');
  console.error('Options:');
  console.error('  --fill <color>           Fill color (default: #d4d4d4)');
  console.error('  --stroke <color>         Stroke color (default: #333)');
  console.error('  --stroke-width, --sw <n> Stroke width in px (default: 0.5)');
  console.error('  --no-stroke              Hide country borders');
  console.error('  --highlight, --hl <spec> Highlight countries (ISO:fill|stroke|width;...)');
  console.error('  --list                   List available regions');
  console.error('  --help, -h               Show help');
  console.error('');
  console.error('Examples:');
  console.error('  simple-world-map east-asia');
  console.error('  simple-world-map east-asia --fill "#1a1a2e" --stroke "#e94560"');
  console.error('  simple-world-map east-asia --hl "JPN:#ff5555;KOR:#5555ff"');
  console.error('  simple-world-map east-asia --hl "JPN:#ff5555|#0000ff;KOR:#5555ff"');
  console.error('  simple-world-map east-asia --hl "JPN:#ff5555|#0000ff|2;KOR:#5555ff"');
  console.error('  simple-world-map east-asia --no-stroke --hl "JPN;KOR"');
  console.error('  simple-world-map --center 35.68,139.69 --radius 15');
  console.error('');
  console.error('Regions: ' + Object.keys(REGIONS).join(', '));
}
