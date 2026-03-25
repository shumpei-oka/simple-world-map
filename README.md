# simple-map

CLI tool to generate SVG world maps from Natural Earth 110m data. Mercator projection. Zero dependencies.

## Install

```bash
npm install -g simple-map
# or
npx simple-map <region>
```

## Usage

### By region

```bash
simple-map east-asia > map.svg
simple-map world > map.svg

# List available regions
simple-map --list
```

Available regions: `world`, `east-asia`, `southeast-asia`, `europe`, `north-america`, `south-america`, `africa`, `middle-east`, `oceania`

### By coordinates

```bash
# Center on Tokyo, 15° radius
simple-map --center 35.68,139.69 --radius 15 > tokyo.svg

# Default radius is 20°
simple-map --center 13.75,100.52 > bangkok.svg
```

### Highlight countries

```bash
# Color per country (ISO 3166-1 alpha-3)
simple-map east-asia --hl "JPN:#ff5555,KOR:#5555ff,CHN:#55cc55" > map.svg

# Omit color for default red
simple-map east-asia --hl JPN,KOR > map.svg
```

### Styling

```bash
# No borders
simple-map east-asia --no-stroke > map.svg

# Custom stroke width (px, default 0.5)
simple-map east-asia --sw 1 > map.svg

# Combine options
simple-map east-asia --no-stroke --hl "JPN:#ff5555" > map.svg
```

## Options

| Option | Alias | Description |
|---|---|---|
| `--center <lat,lon>` | | Center coordinates (latitude,longitude) |
| `--radius <degrees>` | | View radius (default: 20) |
| `--highlight <spec>` | `--hl` | Highlight countries (`ISO:color,...`) |
| `--stroke-width <n>` | `--sw` | Stroke width in px (default: 0.5) |
| `--no-stroke` | | Hide country borders |
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
