export function generatePath(
  startX: number,
  startY: number,
  points: number,
  step: number,
): number[][] {
  const path = [];
  let x = startX;
  let y = startY;

  for (let i = 0; i < points; i++) {
    x += step;
    y += Math.sin(i / 2) * step;
    path.push([x, y]);
  }
  return path;
}
