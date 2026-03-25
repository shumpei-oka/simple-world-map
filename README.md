# simple-world-map

CLI tool to generate SVG world maps from Natural Earth 110m data. Mercator projection. Zero dependencies.

## Install

```bash
npm install -g simple-world-map
# or
npx simple-world-map <region>
```

## Usage

### By region

```bash
simple-world-map east-asia > map.svg
simple-world-map world > map.svg

# List available regions
simple-world-map --list
```

Available regions: `world`, `east-asia`, `southeast-asia`, `europe`, `north-america`, `south-america`, `africa`, `middle-east`, `oceania`

### By coordinates

```bash
# Center on Tokyo, 15° radius
simple-world-map --center 35.68,139.69 --radius 15 > tokyo.svg

# Default radius is 20°
simple-world-map --center 13.75,100.52 > bangkok.svg
```

### Highlight countries

```bash
# Fill per country (ISO 3166-1 alpha-3, separated by ;)
simple-world-map east-asia --hl "JPN:#ff5555;KOR:#5555ff;CHN:#55cc55" > map.svg

# Fill + stroke per country (separated by |)
simple-world-map east-asia --hl "JPN:#ff5555|#0000ff;KOR:#5555ff" > map.svg

# Fill + stroke + stroke width per country
simple-world-map east-asia --hl "JPN:#ff5555|#0000ff|2;KOR:#5555ff" > map.svg

# rgba values
simple-world-map east-asia --hl "JPN:rgba(255,85,85,0.5)|rgba(0,0,255,0.8)" > map.svg

# Omit color for default red
simple-world-map east-asia --hl "JPN;KOR" > map.svg
```

### Styling

```bash
# Custom fill and stroke
simple-world-map east-asia --fill "#1a1a2e" --stroke "#e94560" > map.svg

# No borders
simple-world-map east-asia --no-stroke > map.svg

# Custom stroke width (px, default 0.5)
simple-world-map east-asia --sw 1 > map.svg

# Combine options
simple-world-map east-asia --no-stroke --hl "JPN:#ff5555" > map.svg
```

## Options

| Option | Alias | Description |
|---|---|---|
| `--center <lat,lon>` | | Center coordinates (latitude,longitude) |
| `--radius <degrees>` | | View radius (default: 20) |
| `--fill <color>` | | Fill color (default: #d4d4d4) |
| `--stroke <color>` | | Stroke color (default: #333) |
| `--stroke-width <n>` | `--sw` | Stroke width in px (default: 0.5) |
| `--no-stroke` | | Hide country borders |
| `--highlight <spec>` | `--hl` | Highlight countries (`ISO:fill\|stroke\|width;...`) |
| `--list` | | List available regions |
| `--help` | `-h` | Show help |

## Output

- SVG string to stdout
- `vector-effect="non-scaling-stroke"` for zoom-independent stroke width
- Each path has `data-name` (country name) and `data-iso` (ISO alpha-3) attributes

## Data

Bundled [Natural Earth](https://www.naturalearthdata.com/) 110m Admin 0 Countries. Public domain.

## License

ISC
