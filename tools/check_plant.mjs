// Pipe-vs-equipment clearance check for the plant layout.
//   node tools/check_plant.mjs
import { UNITS, FLOWS, RACK } from '../src/plant/units.js'
const lanes = {}
const order = [0, 1, -1, 2, -2, 3, -3]; const used = order.map(() => [])
FLOWS.filter((f) => f.rack).sort((p, q) => Math.abs(q.rack[1][0] - q.rack[0][0]) - Math.abs(p.rack[1][0] - p.rack[0][0])).forEach((f) => {
  const lo = Math.min(f.rack[0][0], f.rack[1][0]) - 0.6; const hi = Math.max(f.rack[0][0], f.rack[1][0]) + 0.6
  const k = order.findIndex((_, i) => used[i].every(([a, b]) => hi < a || lo > b)); used[k].push([lo, hi]); lanes[f.id] = RACK.z + order[k] * RACK.lane
})
const route = (a, b, lz) => [a, [a[0], RACK.zLeg, a[2]], [a[0], RACK.zLeg, lz], [a[0], RACK.y, lz], [b[0], RACK.y, lz], [b[0], RACK.zLeg, lz], [b[0], RACK.zLeg, b[2]], b]
// equipment as vertical cylinders: [x, z, radius, top]
const solids = UNITS.flatMap((u) => {
  if (u.kind === 'tank') return [[u.x, u.z, u.d / 2 + 0.5, 0.3 + u.h + u.d * 0.11 + 1.1, u.id]]
  if (u.kind === 'reactor') return [[u.x, u.z, u.d / 2 + 0.2, u.legs + u.h + u.d / 2 + (u.noMotor ? 0.5 : 1.3), u.id]]
  if (u.kind === 'reactors') return [[u.x - 3.25, u.z, u.d / 2 + 0.2, u.platform + u.h + u.d / 2 + 1.3, 'R-201'], [u.x + 3.25, u.z, u.d / 2 + 0.2, u.platform + u.h + u.d / 2 + 1.3, 'R-202']]
  if (u.kind === 'column') return [[u.x, u.z, u.d / 2 + 1.05, 1.6 + u.h + u.d / 4, u.id]]
  return []
}).concat([[17, 9, 2.1, 13.2, 'condenser frame']])
let bad = 0
FLOWS.forEach((f) => {
  const pts = f.rack ? route(f.rack[0], f.rack[1], lanes[f.id]) : f.path
  for (let i = 0; i + 1 < pts.length; i++) {
    const [a, b] = [pts[i], pts[i + 1]]
    for (let t = 0; t <= 1.0001; t += 0.02) {
      const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
      solids.forEach(([x, z, r, top, id]) => {
        const own = id === f.from || id === f.to || (f.from === 'rx' || f.to === 'rx') && id.startsWith('R-2') || (f.from === 'mrec' || f.to === 'mrec') && id === 'condenser frame'
        if (Math.hypot(p[0] - x, p[2] - z) < r && p[1] < top && !own) {   // a pipe may enter its own unit
          if (!f._hit) { console.log(`! ${f.id} (${f.from}->${f.to}) hits ${id} near [${p.map((v) => v.toFixed(1))}]`); bad++ }
          f._hit = true
        }
      })
    }
  }
})
console.log(bad ? `${bad} clash(es)` : 'all pipes clear of equipment')
