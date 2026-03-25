const DEG2RAD = Math.PI / 180;

function project(lon, lat) {
  // メルカトル図法: x = lon, y = ln(tan(π/4 + φ/2))
  // 極付近（±85°超）はクランプ
  const clampedLat = Math.max(-85, Math.min(85, lat));
  const x = lon;
  const y = -Math.log(Math.tan(Math.PI / 4 + (clampedLat * DEG2RAD) / 2)) / DEG2RAD;
  return [x, y];
}

function ringToPath(ring) {
  return ring.map((coord, i) => {
    const [x, y] = project(coord[0], coord[1]);
    return (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2);
  }).join('') + 'Z';
}

function geometryToPath(geometry) {
  if (geometry.type === 'Polygon') {
    return geometry.coordinates.map(ring => ringToPath(ring)).join('');
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map(polygon =>
      polygon.map(ring => ringToPath(ring)).join('')
    ).join('');
  }
  return '';
}

function forEachCoord(geometry, fn) {
  if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) {
        for (const c of ring) fn(c[0], c[1]);
      }
    }
  } else if (geometry.type === 'Polygon') {
    for (const ring of geometry.coordinates) {
      for (const c of ring) fn(c[0], c[1]);
    }
  }
}

function computeBBox(features) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const feature of features) {
    forEachCoord(feature.geometry, (lon, lat) => {
      const [x, y] = project(lon, lat);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    });
  }
  const padding = 2;
  return {
    x: minX - padding,
    y: minY - padding,
    width: (maxX - minX) + padding * 2,
    height: (maxY - minY) + padding * 2
  };
}

module.exports = { geometryToPath, computeBBox };
