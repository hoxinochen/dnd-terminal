const EPSILON = 1e-9;
const ARC_SEGMENTS = 720;

function signedArea(points) {
  return points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0) / 2;
}

function clipPolygon(points, inside, intersect) {
  if (!points.length) return [];
  const output = [];
  let previous = points.at(-1);
  let previousInside = inside(previous);
  for (const current of points) {
    const currentInside = inside(current);
    if (currentInside !== previousInside) output.push(intersect(previous, current));
    if (currentInside) output.push(current);
    previous = current;
    previousInside = currentInside;
  }
  return output;
}

function clipToCell(points, x, y, cellFeet) {
  const minX = x * cellFeet, maxX = minX + cellFeet;
  const minY = y * cellFeet, maxY = minY + cellFeet;
  const verticalIntersection = boundary => (a, b) => {
    const ratio = (boundary - a.x) / (b.x - a.x);
    return { x: boundary, y: a.y + (b.y - a.y) * ratio };
  };
  const horizontalIntersection = boundary => (a, b) => {
    const ratio = (boundary - a.y) / (b.y - a.y);
    return { x: a.x + (b.x - a.x) * ratio, y: boundary };
  };
  return [
    [point => point.x >= minX - EPSILON, verticalIntersection(minX)],
    [point => point.x <= maxX + EPSILON, verticalIntersection(maxX)],
    [point => point.y >= minY - EPSILON, horizontalIntersection(minY)],
    [point => point.y <= maxY + EPSILON, horizontalIntersection(maxY)],
  ].reduce((polygon, [inside, intersect]) => clipPolygon(polygon, inside, intersect), points);
}

function arcPolygon(origin, radius, startAngle, endAngle) {
  const span = endAngle - startAngle;
  const steps = Math.max(12, Math.ceil(Math.abs(span) / (Math.PI * 2) * ARC_SEGMENTS));
  return Array.from({ length: steps + 1 }, (_, index) => {
    const angle = startAngle + span * index / steps;
    return { x: origin.x + Math.cos(angle) * radius, y: origin.y + Math.sin(angle) * radius };
  });
}

function rangePolygon(range, cellFeet) {
  const origin = { x: (range.origin.x + 0.5) * cellFeet, y: (range.origin.y + 0.5) * cellFeet };
  if (range.shape === 'square') {
    const half = range.size / 2;
    return [
      { x: origin.x - half, y: origin.y - half }, { x: origin.x + half, y: origin.y - half },
      { x: origin.x + half, y: origin.y + half }, { x: origin.x - half, y: origin.y + half },
    ];
  }
  if (range.shape === 'circle') return arcPolygon(origin, range.size, 0, Math.PI * 2);
  const directionLength = Math.hypot(range.direction?.x || 0, range.direction?.y || 0) || 1;
  const unit = { x: (range.direction?.x || 1) / directionLength, y: (range.direction?.y || 0) / directionLength };
  if (range.shape === 'line') {
    const normal = { x: -unit.y, y: unit.x }, half = (range.widthFeet ?? cellFeet) / 2;
    const end = { x: origin.x + unit.x * range.size, y: origin.y + unit.y * range.size };
    return [
      { x: origin.x + normal.x * half, y: origin.y + normal.y * half },
      { x: end.x + normal.x * half, y: end.y + normal.y * half },
      { x: end.x - normal.x * half, y: end.y - normal.y * half },
      { x: origin.x - normal.x * half, y: origin.y - normal.y * half },
    ];
  }
  if (range.shape === 'cone') {
    const directionAngle = Math.atan2(unit.y, unit.x);
    return [origin, ...arcPolygon(origin, range.size, directionAngle - Math.PI / 4, directionAngle + Math.PI / 4)];
  }
  return [];
}

export function coverageRatio(range, x, y, cellFeet) {
  const polygon = rangePolygon(range, cellFeet);
  const clipped = clipToCell(polygon, x, y, cellFeet);
  return clipped.length < 3 ? 0 : Math.abs(signedArea(clipped)) / (cellFeet * cellFeet);
}

export function coveredCellsForRange(range, settings) {
  const cells = [];
  for (let y = 0; y < settings.height; y += 1) for (let x = 0; x < settings.width; x += 1) {
    if (coverageRatio(range, x, y, settings.cellFeet) >= 0.5 - EPSILON) cells.push(`${x},${y}`);
  }
  return cells;
}
