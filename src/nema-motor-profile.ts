/** Analytic cap/core clearance checks; no renderer or meshes are needed. */
type NemaProfile = {
  width: number
  chamfer: number
  stepped: boolean
  recessRadius: number
  filletRadius: number
}

export function isInsideNemaFace(x: number, y: number, p: NemaProfile) {
  const h = p.width / 2
  x = Math.abs(x)
  y = Math.abs(y)
  if (x > h || y > h) return false
  const chamfer = p.chamfer
  if (!p.stepped) return x + y <= 2 * h - chamfer
  const c = chamfer / Math.SQRT2
  if (c === 0) return true
  const recess = p.recessRadius
  const fillet = p.filletRadius
  const k = h - c + recess
  if (x > h - c && y > h - c)
    return x <= k && y <= k && Math.hypot(x - k, y - k) >= recess
  if (y > h - fillet && x > h - c - fillet)
    return Math.hypot(x - (h - c - fillet), y - (h - fillet)) <= fillet
  if (x > h - fillet && y > h - c - fillet)
    return Math.hypot(x - (h - fillet), y - (h - c - fillet)) <= fillet
  return true
}

const segmentDistance = (
  x: number,
  y: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
) => {
  const dx = bx - ax
  const dy = by - ay
  const t = Math.max(
    0,
    Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)),
  )
  return Math.hypot(x - ax - t * dx, y - ay - t * dy)
}

const arcDistance = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  r: number,
  start: number,
  end: number,
) => {
  const angle = (Math.atan2(y - cy, x - cx) + 2 * Math.PI) % (2 * Math.PI)
  if (angle >= start && angle <= end)
    return Math.abs(Math.hypot(x - cx, y - cy) - r)
  return Math.min(
    Math.hypot(x - cx - r * Math.cos(start), y - cy - r * Math.sin(start)),
    Math.hypot(x - cx - r * Math.cos(end), y - cy - r * Math.sin(end)),
  )
}

const boundaryDistance = (x: number, y: number, p: NemaProfile) => {
  const h = p.width / 2
  x = Math.abs(x)
  y = Math.abs(y)
  const chamfer = p.chamfer
  if (!p.stepped || chamfer === 0)
    return Math.min(
      Math.abs(h - x),
      Math.abs(h - y),
      Math.abs(2 * h - chamfer - x - y) / Math.SQRT2,
    )
  const c = chamfer / Math.SQRT2
  const recess = p.recessRadius
  const fillet = p.filletRadius
  const a = h - c - fillet
  const k = h - c + recess
  return Math.min(
    segmentDistance(x, y, -a, h, a, h),
    segmentDistance(x, y, h, -a, h, a),
    segmentDistance(x, y, h - c, h - fillet, h - c, k),
    segmentDistance(x, y, k, h - c, h - fillet, h - c),
    arcDistance(x, y, a, h - fillet, fillet, 0, Math.PI / 2),
    arcDistance(x, y, k, k, recess, Math.PI, (3 * Math.PI) / 2),
    arcDistance(x, y, h - fillet, a, fillet, 0, Math.PI / 2),
  )
}

/** Reject a bore/head that touches or crosses a straight edge or either kind of arc. */
export function fitsNemaCircle(
  x: number,
  y: number,
  radius: number,
  p: NemaProfile,
) {
  return isInsideNemaFace(x, y, p) && boundaryDistance(x, y, p) > radius
}

/** A through mounting bore must remain entirely outside the core profile. */
export function clearsNemaCircle(
  x: number,
  y: number,
  radius: number,
  p: NemaProfile,
) {
  return !isInsideNemaFace(x, y, p) && boundaryDistance(x, y, p) > radius
}
