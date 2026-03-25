const { geometryToPath } = require('./geo-to-svg');

function renderSVG(features, viewBox, opts = {}) {
  const sw = opts.strokeWidth != null ? opts.strokeWidth : 0.5;
  const highlight = opts.highlight || {};
  const paths = features.map(f => {
    const d = geometryToPath(f.geometry);
    const name = (f.properties.NAME || '').replace(/"/g, '&quot;');
    const iso = f.properties.ISO_A3 !== '-99'
      ? f.properties.ISO_A3
      : f.properties.ISO_A3_EH;
    const hl = highlight[iso];
    const fillAttr = hl && hl.fill ? ` fill="${hl.fill}"` : '';
    const strokeAttr = hl && hl.stroke ? ` stroke="${hl.stroke}"` : '';
    const swAttr = hl && hl.strokeWidth ? ` stroke-width="${hl.strokeWidth}"` : '';
    return `  <path d="${d}" data-name="${name}" data-iso="${iso}"${fillAttr}${strokeAttr}${swAttr} vector-effect="non-scaling-stroke" />`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="${viewBox.x.toFixed(2)} ${viewBox.y.toFixed(2)} ${viewBox.width.toFixed(2)} ${viewBox.height.toFixed(2)}"
     fill="${opts.fill || '#d4d4d4'}" stroke="${opts.noStroke ? 'none' : (opts.stroke || '#333')}" stroke-width="${sw}"
     fill-rule="evenodd">
${paths}
</svg>
`;
}

module.exports = { renderSVG };
