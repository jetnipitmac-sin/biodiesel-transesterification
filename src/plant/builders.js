import * as THREE from 'three'

/* ==========================================================================
   Procedural plant equipment ("architectural model" look: soft white bodies,
   stainless vessels, safety-yellow handrails, coloured bands per product).
   Every builder returns a THREE.Group with its base at y = 0.
   ========================================================================== */

export const MAT = {
  white: new THREE.MeshStandardMaterial({ color: 0xf4f5f9, roughness: 0.55, metalness: 0.02 }),
  steel: new THREE.MeshStandardMaterial({ color: 0xd2d8e2, roughness: 0.28, metalness: 0.65 }),
  jacket: new THREE.MeshStandardMaterial({ color: 0xaeb7c6, roughness: 0.35, metalness: 0.55 }),
  frame: new THREE.MeshStandardMaterial({ color: 0x6b7290, roughness: 0.5, metalness: 0.3 }),
  rail: new THREE.MeshStandardMaterial({ color: 0xf2c037, roughness: 0.45, metalness: 0.1 }),
  concrete: new THREE.MeshStandardMaterial({ color: 0xe3e5ec, roughness: 0.92, metalness: 0 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x3a4055, roughness: 0.55, metalness: 0.25 }),
  motor: new THREE.MeshStandardMaterial({ color: 0x5b6cff, roughness: 0.35, metalness: 0.25 }),
  grating: new THREE.MeshStandardMaterial({ color: 0x8f97ad, roughness: 0.6, metalness: 0.3, transparent: true, opacity: 0.85 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xa9c8ff, roughness: 0.1, metalness: 0.2, emissive: 0x3d5bd8, emissiveIntensity: 0.25 }),
}
const bandMats = new Map()
export const bandMat = (hex) => {
  if (!bandMats.has(hex)) bandMats.set(hex, new THREE.MeshStandardMaterial({ color: hex, roughness: 0.45, metalness: 0.05 }))
  return bandMats.get(hex)
}

const cyl = (rt, rb, h, seg = 32, open = false) => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open)
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d)
function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat)
  m.position.set(x, y, z)
  return m
}
export function shadows(obj) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true } })
  return obj
}

/* a pole between two points */
function pole(a, b, r, mat) {
  const A = new THREE.Vector3(...a)
  const B = new THREE.Vector3(...b)
  const d = B.clone().sub(A)
  const m = new THREE.Mesh(cyl(r, r, d.length(), 8), mat)
  m.position.copy(A).add(d.multiplyScalar(0.5))
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize())
  return m
}

/* caged ladder up the side of a vessel at angle `ang` (radians) */
function ladder(r, y0, y1, ang) {
  const g = new THREE.Group()
  const off = r + 0.28
  const cx = Math.cos(ang) * off
  const cz = Math.sin(ang) * off
  const side = new THREE.Vector3(-Math.sin(ang), 0, Math.cos(ang)).multiplyScalar(0.22)
  g.add(pole([cx + side.x, y0, cz + side.z], [cx + side.x, y1, cz + side.z], 0.025, MAT.rail))
  g.add(pole([cx - side.x, y0, cz - side.z], [cx - side.x, y1, cz - side.z], 0.025, MAT.rail))
  const rungs = Math.floor((y1 - y0) / 0.35)
  const rg = cyl(0.016, 0.016, 0.44, 6)
  const inst = new THREE.InstancedMesh(rg, MAT.rail, rungs)
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), side.clone().normalize())
  const mtx = new THREE.Matrix4()
  for (let i = 0; i < rungs; i++) {
    mtx.compose(new THREE.Vector3(cx, y0 + 0.3 + i * 0.35, cz), q, new THREE.Vector3(1, 1, 1))
    inst.setMatrixAt(i, mtx)
  }
  g.add(inst)
  // cage hoops
  for (let y = y0 + 2.4; y < y1; y += 0.9) {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.014, 6, 16, Math.PI), MAT.rail)
    hoop.position.set(cx, y, cz)
    hoop.rotation.set(Math.PI / 2, 0, -ang + Math.PI / 2)
    g.add(hoop)
  }
  return g
}

/* ring handrail with posts */
function ringRail(r, y, posts = 16) {
  const g = new THREE.Group()
  const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.03, 6, 64), MAT.rail)
  t.rotation.x = Math.PI / 2
  t.position.y = y + 1
  g.add(t)
  const mid = t.clone()
  mid.position.y = y + 0.5
  g.add(mid)
  const pg = cyl(0.025, 0.025, 1, 6)
  const inst = new THREE.InstancedMesh(pg, MAT.rail, posts)
  const m = new THREE.Matrix4()
  for (let i = 0; i < posts; i++) {
    const a = (i / posts) * Math.PI * 2
    m.makeTranslation(Math.cos(a) * r, y + 0.5, Math.sin(a) * r)
    inst.setMatrixAt(i, m)
  }
  g.add(inst)
  return g
}

/* lathe profile of a vessel with 2:1 elliptical heads, base at y = 0 */
function vesselGeo(r, h, seg = 48) {
  const pts = []
  const N = 10
  for (let i = 0; i <= N; i++) { const t = (i / N) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.sin(t) * r, r / 2 - Math.cos(t) * (r / 2))) }
  for (let i = 0; i <= N; i++) { const t = (i / N) * (Math.PI / 2); pts.push(new THREE.Vector2(Math.cos(t) * r, r / 2 + h + Math.sin(t) * (r / 2))) }
  pts[pts.length - 1].x = 0.0001
  pts[0].x = 0.0001
  return new THREE.LatheGeometry(pts, seg)
}

/* ---------- storage tank: cone roof, product band, ladder, roof rail ---------- */
export function storageTank({ d, h, band, ladder: ang = 0.5 }) {
  const g = new THREE.Group()
  const r = d / 2
  g.add(mesh(cyl(r + 0.45, r + 0.55, 0.3, 64), MAT.concrete, 0, 0.15, 0))
  g.add(mesh(cyl(r, r, h, 64, true), MAT.white, 0, 0.3 + h / 2, 0))
  const roofH = r * 0.22
  g.add(mesh(new THREE.ConeGeometry(r * 1.015, roofH, 64), MAT.white, 0, 0.3 + h + roofH / 2, 0))
  g.add(mesh(cyl(r * 1.006, r * 1.006, Math.max(0.6, h * 0.11), 64, true), bandMat(band), 0, 0.3 + h * 0.72, 0))
  g.add(mesh(cyl(r * 1.006, r * 1.006, 0.12, 64, true), bandMat(band), 0, 0.3 + h * 0.62, 0))
  g.add(ringRail(r * 0.9, 0.3 + h + roofH * 0.15, 20))
  g.add(ladder(r, 0.3, 0.3 + h + 0.4, ang))
  // manway + nozzle stubs
  g.add(mesh(cyl(0.35, 0.35, 0.3, 20), MAT.steel, Math.cos(ang + 1.2) * (r + 0.1), 1.1, Math.sin(ang + 1.2) * (r + 0.1)).rotateZ(Math.PI / 2))
  g.userData.top = 0.3 + h + roofH
  g.userData.size = Math.max(d, h)
  return g
}

/* ---------- jacketed reactor / drum on legs, optional top-entry agitator ---------- */
export function reactor({ d, h, legs = 2, noMotor = false }) {
  const g = new THREE.Group()
  const r = d / 2
  const body = mesh(vesselGeo(r, h), MAT.steel, 0, legs, 0)
  g.add(body)
  g.add(mesh(cyl(r * 1.07, r * 1.07, h * 0.72, 48), MAT.jacket, 0, legs + r / 2 + h * 0.36 + 0.1, 0))
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    g.add(pole([Math.cos(a) * r * 0.82, 0, Math.sin(a) * r * 0.82], [Math.cos(a) * r * 0.82, legs + r * 0.45, Math.sin(a) * r * 0.82], 0.07, MAT.frame))
    g.add(mesh(box(0.3, 0.05, 0.3), MAT.dark, Math.cos(a) * r * 0.82, 0.025, Math.sin(a) * r * 0.82))
  }
  const top = legs + h + r
  if (!noMotor) {
    g.add(mesh(cyl(0.34, 0.38, 0.45, 24), MAT.dark, 0, top + 0.2, 0))
    g.add(mesh(cyl(0.27, 0.27, 0.8, 24), MAT.motor, 0, top + 0.82, 0))
    g.add(mesh(cyl(0.29, 0.29, 0.06, 24), MAT.dark, 0, top + 1.24, 0))
  } else {
    g.add(mesh(cyl(0.18, 0.18, 0.6, 16), MAT.steel, 0.35, top + 0.1, 0))
    g.add(mesh(cyl(0.12, 0.12, 0.5, 16), MAT.dark, -0.35, top, 0.2))
  }
  g.add(mesh(cyl(0.12, 0.12, 0.25, 12), MAT.steel, r * 0.5, top - 0.05, 0))
  g.add(mesh(cyl(0.1, 0.1, 0.5, 12), MAT.steel, 0, legs - 0.2, 0))
  g.userData.top = top
  g.userData.size = Math.max(d, h + legs)
  return g
}

/* ---------- column: skirt, shell, platforms every ~4 m, ladder ---------- */
export function column({ d, h }) {
  const g = new THREE.Group()
  const r = d / 2
  const skirt = 1.3
  g.add(mesh(cyl(r + 0.25, r + 0.35, 0.3, 32), MAT.concrete, 0, 0.15, 0))
  g.add(mesh(cyl(r, r, skirt, 32), MAT.frame, 0, 0.3 + skirt / 2, 0))
  g.add(mesh(vesselGeo(r, h, 40), MAT.white, 0, 0.3 + skirt - r / 2, 0))
  const y0 = 0.3 + skirt
  for (let y = y0 + 3.5; y < y0 + h - 0.5; y += 4) {
    const ring = mesh(cyl(r + 1, r + 1, 0.08, 40), MAT.grating, 0, y, 0)
    g.add(ring)
    g.add(ringRail(r + 0.95, y, 18))
  }
  for (let y = y0 + 1.2; y < y0 + h; y += 1.6) g.add(mesh(cyl(r * 1.01, r * 1.01, 0.06, 40, true), MAT.steel, 0, y, 0))
  g.add(ladder(r, 0.3, y0 + h, 0.9))
  g.userData.top = y0 + h + r / 2
  g.userData.size = Math.max(d + 2, h)
  return g
}

/* ---------- horizontal vessel on two saddles (axis along x) ---------- */
export function horizontalVessel({ d, L }) {
  const g = new THREE.Group()
  const r = d / 2
  const cy = r + 1.0
  const shell = mesh(vesselGeo(r, L - r, 48), MAT.steel)
  shell.rotation.z = -Math.PI / 2
  shell.position.set(-(L) / 2, cy, 0)
  g.add(shell)
  for (const sx of [-L * 0.3, L * 0.3]) {
    g.add(mesh(box(0.35, cy, d * 0.9), MAT.frame, sx, cy / 2, 0))
    g.add(mesh(box(0.7, 0.08, d), MAT.dark, sx, 0.04, 0))
  }
  // interface sight glass + nozzles
  g.add(mesh(box(0.12, r * 1.2, 0.12), MAT.glass, L * 0.1, cy, r + 0.05))
  for (const sx of [-L * 0.375, L * 0.375]) g.add(mesh(cyl(0.12, 0.12, 0.35, 12), MAT.steel, sx, cy + r + 0.1, 0))
  g.add(mesh(cyl(0.12, 0.12, 0.6, 12), MAT.steel, L * 0.25, cy - r - 0.25, 0))
  g.userData.top = cy + r
  g.userData.size = L
  return g
}

/* ---------- shell & tube exchanger (axis along x) ---------- */
export function exchanger({ d = 0.7, L = 3 }) {
  const g = new THREE.Group()
  const r = d / 2
  const s = mesh(cyl(r, r, L, 32), MAT.white)
  s.rotation.z = Math.PI / 2
  g.add(s)
  for (const sx of [-L / 2 - 0.2, L / 2 + 0.2]) {
    const h = mesh(cyl(r * 1.08, r * 1.08, 0.4, 32), MAT.steel, sx, 0, 0)
    h.rotation.z = Math.PI / 2
    g.add(h)
  }
  return g
}

/* ---------- centrifugal pump on a skid ---------- */
const pumpGeo = { skid: box(1.3, 0.18, 0.6), motor: cyl(0.2, 0.2, 0.6, 20), casing: cyl(0.26, 0.26, 0.24, 20), fan: cyl(0.21, 0.21, 0.08, 20) }
export function pump() {
  const g = new THREE.Group()
  g.add(mesh(pumpGeo.skid, MAT.dark, 0, 0.09, 0))
  const m = mesh(pumpGeo.motor, MAT.motor, -0.25, 0.42, 0)
  m.rotation.z = Math.PI / 2
  g.add(m)
  const c = mesh(pumpGeo.casing, MAT.steel, 0.32, 0.42, 0)
  c.rotation.x = Math.PI / 2
  g.add(c)
  g.add(mesh(cyl(0.08, 0.08, 0.5, 12), MAT.steel, 0.32, 0.7, 0))
  return g
}

/* sloped member (box) from a to b; sx = width across, sz = depth */
function strut(a, b, sx, sz, mat) {
  const A = new THREE.Vector3(...a)
  const B = new THREE.Vector3(...b)
  const d = B.clone().sub(A)
  const m = new THREE.Mesh(box(sx, d.length(), sz), mat)
  m.position.copy(A).add(d.clone().multiplyScalar(0.5))
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())
  return m
}

/* straight stair beside a platform, climbing toward -z.
   The bottom sits on the ground, the top lands on a small landing that
   reaches the platform edge (x = edge); two stringers, two handrails. */
function stairFlight({ x, zTop, y, edge }) {
  const g = new THREE.Group()
  const W = 1.0
  const steps = Math.max(4, Math.round(y / 0.2))
  const rise = y / steps
  const going = 0.25
  const run = (steps - 1) * going
  const zBot = zTop + run
  const L = 1.1                                    // landing depth (along z)
  const tread = new THREE.InstancedMesh(box(W, 0.05, going + 0.02), MAT.grating, steps - 1)
  const m = new THREE.Matrix4()
  for (let i = 0; i < steps - 1; i++) {
    m.makeTranslation(x, (i + 1) * rise, zBot - i * going)
    tread.setMatrixAt(i, m)
  }
  g.add(tread)
  // landing level with the platform, from the platform edge to the outer stringer
  const lx0 = edge
  const lx1 = x + W / 2 + 0.06
  g.add(mesh(box(lx1 - lx0, 0.06, L), MAT.grating, (lx0 + lx1) / 2, y, zTop - L / 2 + going / 2))
  g.add(mesh(box(lx1 - lx0, 0.16, 0.12), MAT.frame, (lx0 + lx1) / 2, y - 0.11, zTop - L + going / 2))
  // landing post down to the ground
  g.add(mesh(box(0.14, y, 0.14), MAT.frame, x + W / 2 + 0.06, y / 2, zTop - L + going / 2 + 0.07))
  // stringers + handrails (1 m above the nosing line) on both sides
  for (const sx of [-W / 2 - 0.05, W / 2 + 0.05]) {
    g.add(strut([x + sx, 0, zBot + going / 2], [x + sx, y, zTop - going / 2], 0.06, 0.24, MAT.frame))
    g.add(pole([x + sx, 1.0, zBot + going / 2], [x + sx, y + 1.0, zTop - going / 2], 0.028, MAT.rail))
    g.add(pole([x + sx, 0.5, zBot + going / 2], [x + sx, y + 0.5, zTop - going / 2], 0.02, MAT.rail))
    g.add(pole([x + sx, 0, zBot + going / 2], [x + sx, 1.0, zBot + going / 2], 0.028, MAT.rail))
    g.add(pole([x + sx, y, zTop - going / 2], [x + sx, y + 1.0, zTop - going / 2], 0.028, MAT.rail))
  }
  // guard rail round the open sides of the landing
  const xo = x + W / 2 + 0.05
  const zb = zTop - L + going / 2
  g.add(pole([xo, y + 1.0, zTop - going / 2], [xo, y + 1.0, zb], 0.028, MAT.rail))
  g.add(pole([xo, y + 1.0, zb], [lx0, y + 1.0, zb], 0.028, MAT.rail))
  g.add(pole([xo, y, zb], [xo, y + 1.0, zb], 0.028, MAT.rail))
  // concrete pad under the foot of the stair
  g.add(mesh(box(W + 0.4, 0.08, 0.6), MAT.concrete, x, 0.04, zBot + 0.15))
  return g
}

/* caged ladder on the +z face of a frame, from y0 to y1 (+1.1 m handhold) */
function frameLadder({ x, z, y0, y1 }) {
  const g = new THREE.Group()
  const top = y1 + 1.1
  for (const sx of [-0.22, 0.22]) g.add(mesh(box(0.05, top - y0, 0.05), MAT.rail, x + sx, (y0 + top) / 2, z))
  const rungs = Math.floor((y1 - y0) / 0.3)
  const inst = new THREE.InstancedMesh(cyl(0.016, 0.016, 0.44, 6), MAT.rail, rungs)
  const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2)
  const mtx = new THREE.Matrix4()
  for (let i = 0; i < rungs; i++) {
    mtx.compose(new THREE.Vector3(x, y0 + 0.3 * (i + 1), z), q, new THREE.Vector3(1, 1, 1))
    inst.setMatrixAt(i, mtx)
  }
  g.add(inst)
  // stand-off brackets back to the frame
  for (let y = y0 + 1.5; y < y1; y += 2.5) for (const sx of [-0.22, 0.22]) g.add(mesh(box(0.04, 0.04, 0.22), MAT.frame, x + sx, y, z - 0.11))
  // cage: hoops bulging outward (+z) from 2.2 m above the base, plus three straps
  const c0 = y0 + (y0 === 0 ? 2.2 : 1.0)
  let last = c0
  for (let y = c0; y <= top + 0.01; y += 0.9) {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.014, 6, 16, Math.PI), MAT.rail)
    hoop.position.set(x, y, z)
    hoop.rotation.x = Math.PI / 2
    g.add(hoop)
    last = y
  }
  for (const a of [0.25, 0.5, 0.75]) {
    const ang = Math.PI * a
    g.add(mesh(box(0.03, last - c0, 0.03), MAT.rail, x + 0.36 * Math.cos(ang), (c0 + last) / 2, z + 0.36 * Math.sin(ang)))
  }
  return g
}

/* ---------- steel structure with grating floors ---------- */
export function structure({ w, d, levels }) {
  const g = new THREE.Group()
  const top = levels[levels.length - 1]
  const cols = [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]
  if (w > 7) cols.push([0, -d / 2], [0, d / 2])
  cols.forEach(([x, z]) => g.add(mesh(box(0.22, top + 1.1, 0.22), MAT.frame, x, (top + 1.1) / 2, z)))
  levels.forEach((y) => {
    g.add(mesh(box(w, 0.06, d), MAT.grating, 0, y, 0))
    g.add(mesh(box(w, 0.18, 0.16), MAT.frame, 0, y - 0.12, -d / 2))
    g.add(mesh(box(w, 0.18, 0.16), MAT.frame, 0, y - 0.12, d / 2))
    g.add(mesh(box(0.16, 0.18, d), MAT.frame, -w / 2, y - 0.12, 0))
    g.add(mesh(box(0.16, 0.18, d), MAT.frame, w / 2, y - 0.12, 0))
    // handrails on the two long sides
    for (const z of [-d / 2, d / 2]) {
      g.add(mesh(box(w, 0.05, 0.05), MAT.rail, 0, y + 1.05, z))
      g.add(mesh(box(w, 0.04, 0.04), MAT.rail, 0, y + 0.55, z))
    }
  })
  // access: a stair for a low platform, caged ladders for tall frames
  const y1 = levels[0]
  if (y1 <= 4.5) g.add(stairFlight({ x: w / 2 + 0.76, zTop: -d / 2 + 1.2, y: y1, edge: w / 2 }))
  else levels.forEach((y, k) => g.add(frameLadder({ x: (k % 2 ? -1 : 1) * (w / 2 - 0.55), z: d / 2 + 0.2, y0: k ? levels[k - 1] : 0, y1: y })))
  return g
}

/* ---------- pipe rack: portal frames every 6 m ---------- */
export function pipeRack({ x0, x1, z, y, width = 3.4 }) {
  const g = new THREE.Group()
  for (let x = x0; x <= x1 + 0.01; x += 6) {
    for (const dz of [-width / 2, width / 2]) {
      g.add(mesh(box(0.28, y + 0.7, 0.28), MAT.frame, x, (y + 0.7) / 2, z + dz))
      g.add(mesh(box(0.6, 0.12, 0.6), MAT.concrete, x, 0.06, z + dz))
    }
    g.add(mesh(box(0.22, 0.24, width + 0.3), MAT.frame, x, y - 0.18, z))
    g.add(mesh(box(0.2, 0.2, width + 0.3), MAT.frame, x, y + 0.42, z))
  }
  for (const dz of [-width / 2, width / 2]) g.add(mesh(box(x1 - x0, 0.2, 0.2), MAT.frame, (x0 + x1) / 2, y - 0.18, z + dz))
  return g
}

/* ---------- bund wall around a tank area ---------- */
export function bund({ x0, x1, z0, z1, h = 0.9 }) {
  const g = new THREE.Group()
  const t = 0.3
  g.add(mesh(box(x1 - x0, h, t), MAT.concrete, (x0 + x1) / 2, h / 2, z0))
  g.add(mesh(box(x1 - x0, h, t), MAT.concrete, (x0 + x1) / 2, h / 2, z1))
  g.add(mesh(box(t, h, z1 - z0), MAT.concrete, x0, h / 2, (z0 + z1) / 2))
  g.add(mesh(box(t, h, z1 - z0), MAT.concrete, x1, h / 2, (z0 + z1) / 2))
  return g
}

/* ---------- control room ---------- */
export function building({ w, d, h }) {
  const g = new THREE.Group()
  g.add(mesh(box(w, h, d), MAT.white, 0, h / 2, 0))
  g.add(mesh(box(w + 0.3, 0.35, d + 0.3), MAT.frame, 0, h + 0.17, 0))
  g.add(mesh(box(w * 0.86, h * 0.32, 0.08), MAT.glass, 0, h * 0.6, d / 2 + 0.03))
  g.add(mesh(box(1.1, 2.2, 0.08), MAT.dark, -w * 0.38, 1.1, d / 2 + 0.03))
  g.add(mesh(box(1.4, 0.7, 1), MAT.steel, w * 0.25, h + 0.7, 0))
  g.add(mesh(box(1.4, 0.7, 1), MAT.steel, -w * 0.05, h + 0.7, 0))
  return g
}
