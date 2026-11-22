import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { v } from './geometry3d.js'
import { arrowPath } from './layout2d.js'
import { token } from '../theme.js'

/* ==========================================================================
   3-D mechanism, laid out like the 2-D drawing (see align3d.js):
   the camera looks at the "board" from the front (slightly tilted so the
   depth reads), pans with the action like the 2-D view, and never swings.
   - atoms morph with bond lengths kept (morphDisplay)
   - each bond has a sigma and a pi part that fade (gold while changing)
   - curved electron arrows bend the same way as in the 2-D drawing, and
     the electron pair (two gold dots) rides along them while atoms move
   ========================================================================== */

const EL = {
  C: { r: 0.3, color: 0x3b4146, rough: 0.32, metal: 0.15 },
  O: { r: 0.3, color: 0xe0503d, rough: 0.28, metal: 0.05 },
  H: { r: 0.18, color: 0xf0ebe0, rough: 0.35, metal: 0.0 },
  R: { r: 0.42, color: 0x2aa57c, rough: 0.3, metal: 0.25 },
  Rp: { r: 0.42, color: 0xcfa45a, rough: 0.26, metal: 0.65 },
  Na: { r: 0.38, color: 0x8b5cf6, rough: 0.3, metal: 0.2 },
}
/* bond / label / arrow colours come from the active theme (see theme.js) */
const tcol = (name, fallback) => token(name) || fallback
const hex = (n) => `#${n.toString(16).padStart(6, '0')}`
/* 3-tone ramp for cartoon (toon) shading */
let RAMP = null
const toonRamp = () => {
  if (!RAMP) {
    RAMP = new THREE.DataTexture(new Uint8Array([80, 165, 255]), 3, 1, THREE.RedFormat)
    RAMP.minFilter = RAMP.magFilter = THREE.NearestFilter
    RAMP.needsUpdate = true
  }
  return RAMP
}
const VIEW_DIR = new THREE.Vector3(0.3, 0.2, 1).normalize()     // a gentle tilt: the sp3 depth reads, layout stays like the 2-D

function roundRect(g, w, h, r) {
  g.beginPath()
  g.moveTo(r, 0); g.lineTo(w - r, 0); g.quadraticCurveTo(w, 0, w, r); g.lineTo(w, h - r)
  g.quadraticCurveTo(w, h, w - r, h); g.lineTo(r, h); g.quadraticCurveTo(0, h, 0, h - r)
  g.lineTo(0, r); g.quadraticCurveTo(0, 0, r, 0)
}

function textSprite(text, color, { bg = true, size = 0.4, weight = 600 } = {}) {
  const font = `${weight} 46px ${tcol('--f-label', '"IBM Plex Sans Thai", sans-serif')}`
  const c = document.createElement('canvas')
  const g = c.getContext('2d')
  g.font = font
  const w = Math.ceil(g.measureText(text).width) + (bg ? 44 : 12)
  const h = 76
  c.width = w; c.height = h
  g.font = font
  if (bg) {
    roundRect(g, w, h, 20)
    g.fillStyle = tcol('--label-bg', 'rgba(255,255,255,0.92)')
    g.fill()
    g.strokeStyle = tcol('--label-border', 'rgba(0,0,0,0.15)')
    g.lineWidth = 2
    g.stroke()
  }
  g.fillStyle = color
  g.textBaseline = 'middle'
  g.textAlign = 'center'
  g.fillText(text, w / 2, h / 2 + 3)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }))
  s.scale.set((size * w) / h, size, 1)
  s.renderOrder = 12
  return s
}

function chargeSprite() {
  const c = document.createElement('canvas')
  c.width = 128; c.height = 128
  const g = c.getContext('2d')
  g.fillStyle = '#3d86ff'
  g.beginPath(); g.arc(64, 64, 54, 0, Math.PI * 2); g.fill()
  g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 6; g.stroke()
  g.fillStyle = '#fff'
  g.fillRect(36, 58, 56, 12)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }))
  s.scale.set(0.3, 0.3, 1)
  s.renderOrder = 13
  return s
}

function glowTexture() {
  const c = document.createElement('canvas')
  c.width = 128; c.height = 128
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(64, 64, 4, 64, 64, 64)
  grd.addColorStop(0, 'rgba(255,220,140,0.9)')
  grd.addColorStop(0.45, 'rgba(240,190,90,0.3)')
  grd.addColorStop(1, 'rgba(240,190,90,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

const T3 = (a) => new THREE.Vector3(a[0], a[1], a[2])
const keyOf = (a, b) => [a, b].sort().join('|')
export class MechScene3D {
  constructor(container, timeline, mech) {
    this.container = container
    this.timeline = timeline
    /* everything mechanism-specific comes from the definition (mechs.js) */
    this.mech = mech
    this.STATES = mech.states3d
    this.ATOMS = mech.atoms3d
    this.IDS = Object.keys(mech.atoms3d)
    this.visOf = (k, id) => ((this.STATES[k].hidden || []).includes(id) ? 0 : 1)
    // per-state framing box (visible atoms); all boxes share the largest size
    this.boxes = mech.display.map((D, k) => {
      let x0 = Infinity; let y0 = Infinity; let x1 = -Infinity; let y1 = -Infinity
      this.IDS.forEach((id) => {
        if (!this.visOf(k, id)) return
        const p = D[id]
        x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1])
      })
      return { c: [(x0 + x1) / 2, (y0 + y1) / 2, 0], w: x1 - x0, h: y1 - y0 }
    })
    this.frameW = Math.max(...this.boxes.map((q) => q.w)) + 1.4
    this.frameH = Math.max(...this.boxes.map((q) => q.h)) + 1.5
    this.disposed = false

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.setClearColor(0x000000, 0)                  // the pane's CSS gradient shows through
    container.appendChild(renderer.domElement)
    this.renderer = renderer

    const scene = new THREE.Scene()
    this.scene = scene
    const pmrem = new THREE.PMREMGenerator(renderer)
    this.envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = this.envTex
    pmrem.dispose()
    const key = new THREE.DirectionalLight(0xfff4e0, 1.6)
    key.position.set(4, 6, 8)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xa9c8ff, 0.7)
    rim.position.set(-6, -2, -5)
    scene.add(rim)
    const amb = new THREE.AmbientLight(0xffffff, 0.15)
    scene.add(amb)
    this.lights = { key, rim, amb }

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200)
    this.controls = new OrbitControls(this.camera, renderer.domElement)
    this.controls.enableDamping = true
    this.controls.enablePan = false
    this.controls.rotateSpeed = 0.6

    this.root = new THREE.Group()
    scene.add(this.root)
    this.readTheme()                        // colours first: bonds are built with them
    this.buildAtoms()
    this.buildBonds()
    this.styleAll()
    this.buildCharges()
    this.glowTex = glowTexture()
    this.buildGlows()
    this.arrowStep = -1
    this.arrowObjs = []
    this.labels = []
    this.letters = []
    ;(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { if (!this.disposed) this.buildLabels() })
    this.onTheme = () => this.applyTheme()
    window.addEventListener('themechange', this.onTheme)

    this.ro = new ResizeObserver(() => this.resize(true))
    this.ro.observe(container)
    this.resize(true)

    this.visible = true
    this.io = new IntersectionObserver((ents) => { this.visible = ents[0].isIntersecting })
    this.io.observe(container)

    this.loop = this.loop.bind(this)
    this.raf = requestAnimationFrame(this.loop)
  }

  /* ---------- theme ------------------------------------------------------ */
  readTheme() {
    this.colBond = new THREE.Color(tcol('--bond3d', '#9aa1b5'))
    this.colHot = new THREE.Color(tcol('--hot2d', '#f59e0b'))
    this.colNuc = new THREE.Color(tcol('--nuc', '#3b82f6'))
    this.colPush = new THREE.Color(tcol('--push', '#f43f5e'))
    this.colDot = new THREE.Color(tcol('--dot3d', '#facc15'))
    // optional per-theme atom colours (--atom-c, --atom-o ...) and cartoon mode (--toon: 1)
    this.atomCol = Object.fromEntries(Object.keys(EL).map((k) => [k, new THREE.Color(tcol(`--atom-${k.toLowerCase()}`, hex(EL[k].color)))]))
    this.toon = token('--toon') === '1'
    this.colOutline = new THREE.Color(tcol('--toon-outline', '#06060c'))
  }

  /* materials follow the theme: glossy (MeshStandard) or cartoon (toon ramp + ink outline) */
  styleAll() {
    const mat = (color, e, transparent) => (this.toon
      ? new THREE.MeshToonMaterial({ color, gradientMap: toonRamp(), transparent })
      : new THREE.MeshStandardMaterial({ color, roughness: e.rough, metalness: e.metal, envMapIntensity: 0.9, transparent }))
    this.IDS.forEach((id) => {
      const m = this.atomMesh[id]
      const el = this.ATOMS[id].el
      const old = m.material
      m.material = mat(this.atomCol[el].clone(), EL[el], old.transparent)
      old.dispose()
      this.setOutline(m, 1.14, 1.14)
    })
    this.bondRows.forEach((r) => [r.sigma, r.pi].forEach((m) => {
      const old = m.material
      m.material = mat(this.colBond.clone(), { rough: 0.35, metal: 0.35 }, true)
      old.dispose()
      this.setOutline(m, 1.75, 1)
    }))
    const { key, rim, amb } = this.lights
    key.intensity = this.toon ? 1.5 : 1.6
    rim.intensity = this.toon ? 0.25 : 0.7
    amb.intensity = this.toon ? 0.95 : 0.15
  }

  setOutline(m, s, sy) {
    let o = m.userData.outline
    if (this.toon) {
      if (!o) {
        o = new THREE.Mesh(m.geometry, new THREE.MeshBasicMaterial({ side: THREE.BackSide, transparent: true }))
        m.add(o)
        m.userData.outline = o
      }
      o.material.color.copy(this.colOutline)
      o.scale.set(s, sy, s)
    } else if (o) {
      m.remove(o); o.material.dispose(); m.userData.outline = null
    }
  }

  applyTheme() {
    this.readTheme()
    this.styleAll()
    ;[...this.labels.map((l) => l.sprite), ...this.letters.map((l) => l.sprite)].forEach((sp) => {
      this.root.remove(sp); sp.material.map.dispose(); sp.material.dispose()
    })
    this.buildLabels()
    this.arrowStep = -2                     // rebuild arrows in the new colours
  }

  /* ---------- build ------------------------------------------------------ */
  buildAtoms() {
    this.sphere = new THREE.SphereGeometry(1, 40, 28)
    this.atomMesh = {}
    this.IDS.forEach((id) => {
      const e = EL[this.ATOMS[id].el]
      const fades = this.STATES.some((s) => (s.hidden || []).includes(id))
      const mat = new THREE.MeshStandardMaterial({
        color: e.color, roughness: e.rough, metalness: e.metal, envMapIntensity: 0.9, transparent: fades,
      })
      const m = new THREE.Mesh(this.sphere, mat)
      m.scale.setScalar(e.r)
      this.root.add(m)
      this.atomMesh[id] = m
    })
  }

  buildBonds() {
    this.cyl = new THREE.CylinderGeometry(1, 1, 1, 20, 1)
    const all = new Map()
    this.STATES.forEach((s) => s.bonds.forEach((b) => all.set(keyOf(b.a, b.b), { a: b.a, b: b.b })))
    this.bondRows = [...all.values()].map((r) => {
      const mk = () => {
        const mat = new THREE.MeshStandardMaterial({ color: this.colBond.clone(), roughness: 0.35, metalness: 0.35, transparent: true })
        const m = new THREE.Mesh(this.cyl, mat)
        this.root.add(m)
        return m
      }
      return { ...r, sigma: mk(), pi: mk(), order: this.STATES.map((s) => (s.bonds.find((b) => keyOf(b.a, b.b) === keyOf(r.a, r.b)) || { o: 0 }).o) }
    })
  }

  buildCharges() {
    this.chargeSprites = {}
    const ids = new Set()
    this.STATES.forEach((s) => Object.keys(s.charges).forEach((id) => ids.add(id)))
    ids.forEach((id) => { const s = chargeSprite(); this.root.add(s); this.chargeSprites[id] = s })
  }

  buildGlows() {
    this.glows = [0, 1, 2, 3].map(() => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }))
      s.renderOrder = 5
      this.root.add(s)
      return s
    })
  }

  buildLabels() {
    this.labels = (this.mech.labels3d || []).map((L) => {
      const s = textSprite(L.text, tcol(L.color, '#222'))
      this.root.add(s)
      return { ...L, sprite: s }
    })
    // the R / R' balls carry their letter, like the 2-D drawing
    this.letters = this.IDS.filter((id) => this.ATOMS[id].label).map((id) => {
      const s = textSprite(this.ATOMS[id].label, '#0b0f10', { bg: false, size: 0.42, weight: 700 })
      this.root.add(s)
      return { id, sprite: s }
    })
  }

  /* electron-pushing arrows for step k. The bend comes from the 2-D drawing's
     arrow (same side, same amount), turned to match the 3-D bond direction. */
  buildArrows(k) {
    this.arrowObjs.forEach((o) => {
      this.root.remove(o.tube, o.head, o.d1, o.d2)
      o.tube.geometry.dispose(); o.tube.material.dispose(); o.head.material.dispose(); o.d1.material.dispose()
    })
    this.arrowObjs = []
    this.arrowStep = k
    if (k < 0 || k >= this.mech.arrows3d.length) return
    const D = this.mech.display[k]
    const pointOf = (ref) => (Array.isArray(ref) ? T3(v.lerp(D[ref[0]], D[ref[1]], 0.5)) : T3(D[ref]))

    this.mech.arrows3d[k].forEach((ar, i) => {
      const g2 = arrowPath(this.mech, this.mech.states2d[k], this.mech.arrows2d[k][i])
      const off2 = [g2.c[0] - (g2.p[0] + g2.q[0]) / 2, -(g2.c[1] - (g2.p[1] + g2.q[1]) / 2)]
      const line2 = [g2.q[0] - g2.p[0], -(g2.q[1] - g2.p[1])]
      const L2 = Math.hypot(line2[0], line2[1]) || 1
      let p = pointOf(ar.from)
      let q = pointOf(ar.to)
      const line3 = q.clone().sub(p)
      const L3 = Math.max(0.4, line3.length())
      const turn = Math.atan2(line3.y, line3.x) - Math.atan2(line2[1], line2[0])
      const scale = L3 / L2
      const ox = (off2[0] * Math.cos(turn) - off2[1] * Math.sin(turn)) * scale
      const oy = (off2[0] * Math.sin(turn) + off2[1] * Math.cos(turn)) * scale
      const bow = new THREE.Vector3(ox, oy, 0)
      if (bow.length() < 0.45) bow.setLength(0.45)
      const c = p.clone().add(q).multiplyScalar(0.5).add(bow).add(new THREE.Vector3(0, 0, 0.35))
      if (!Array.isArray(ar.from)) p = p.add(c.clone().sub(p).normalize().multiplyScalar(EL[this.ATOMS[ar.from].el].r + 0.06))
      if (!Array.isArray(ar.to)) q = q.sub(q.clone().sub(c).normalize().multiplyScalar(EL[this.ATOMS[ar.to].el].r + 0.1))
      const curve = new THREE.QuadraticBezierCurve3(p, c, q)
      const col = ar.color === 'nuc' ? this.colNuc : this.colPush
      const SEG = 64
      const RAD = 10
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, SEG, 0.05, RAD, false), new THREE.MeshBasicMaterial({ color: col, transparent: true }))
      tube.renderOrder = 8
      const headGeo = this.headGeo || (this.headGeo = new THREE.ConeGeometry(0.14, 0.34, 20).translate(0, -0.17, 0))
      const head = new THREE.Mesh(headGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true }))
      head.position.copy(q)
      head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curve.getTangent(1))
      head.renderOrder = 8
      const dotGeo = this.dotGeo || (this.dotGeo = new THREE.SphereGeometry(0.07, 16, 12))
      const dotMat = new THREE.MeshBasicMaterial({ color: this.colDot, transparent: true })
      const d1 = new THREE.Mesh(dotGeo, dotMat)
      const d2 = new THREE.Mesh(dotGeo, dotMat)
      this.root.add(tube, head, d1, d2)
      this.arrowObjs.push({ tube, head, d1, d2, curve, SEG, RAD, glowAtoms: [ar.from, ar.to].filter((x) => !Array.isArray(x)) })
    })
  }

  /* ---------- per frame ---------------------------------------------------- */
  frame() {
    const ph = this.timeline.phase()
    const STATES = this.STATES
    const visOf = this.visOf
    const s0 = STATES[ph.k]
    const s1 = STATES[ph.next]
    const m = ph.morph
    const Pd = this.mech.morph(ph.k, ph.next, m)
    const P = {}
    const vis = {}
    this.IDS.forEach((id) => {
      P[id] = T3(Pd[id])
      const v0 = visOf(ph.k, id)
      vis[id] = ph.k === ph.next ? v0 : v0 + (visOf(ph.next, id) - v0) * m
      const mesh = this.atomMesh[id]
      mesh.position.copy(P[id])
      mesh.visible = vis[id] > 0.01
      if (mesh.material.transparent) mesh.material.opacity = vis[id]
      if (mesh.userData.outline) mesh.userData.outline.material.opacity = mesh.material.transparent ? vis[id] : 1
    })

    // bonds
    const up = new THREE.Vector3(0, 1, 0)
    const pa = this.mech.piPlane || ['Cc', 'Oc', 'R1']
    let nCarbonyl = P[pa[1]].clone().sub(P[pa[0]]).cross(P[pa[2]].clone().sub(P[pa[0]]))
    nCarbonyl = nCarbonyl.lengthSq() > 1e-6 ? nCarbonyl.normalize() : new THREE.Vector3(0, 0, 1)
    this.bondRows.forEach((r) => {
      const o0 = r.order[ph.k]
      const o1 = ph.k === ph.next ? o0 : r.order[ph.next]
      const sig = (o0 >= 1 ? 1 : 0) + ((o1 >= 1 ? 1 : 0) - (o0 >= 1 ? 1 : 0)) * m
      const pi = (o0 >= 2 ? 1 : 0) + ((o1 >= 2 ? 1 : 0) - (o0 >= 2 ? 1 : 0)) * m
      const alpha = Math.min(vis[r.a], vis[r.b])
      const A = P[r.a]
      const B = P[r.b]
      const d = B.clone().sub(A)
      const L = d.length()
      const dir = d.clone().normalize()
      const q = new THREE.Quaternion().setFromUnitVectors(up, dir)
      const side = dir.clone().cross(nCarbonyl).normalize()
      const place = (mesh, amount, radius, offset) => {
        mesh.visible = amount * alpha > 0.01
        if (!mesh.visible) return
        mesh.position.copy(A).add(d.clone().multiplyScalar(0.5)).add(side.clone().multiplyScalar(offset))
        mesh.quaternion.copy(q)
        mesh.scale.set(radius, L, radius)
        const hot = amount > 0.02 && amount < 0.98
        mesh.material.color.copy(hot ? this.colHot : this.colBond)
        mesh.material.opacity = amount * alpha
        if (mesh.userData.outline) mesh.userData.outline.material.opacity = amount * alpha
      }
      place(r.sigma, sig, 0.085, pi > 0.01 ? -0.08 * pi : 0)
      place(r.pi, pi, 0.062, 0.1 * pi)
    })

    // charges sit up-right of their atom, toward the viewer
    Object.entries(this.chargeSprites).forEach(([id, s]) => {
      const c0 = s0.charges[id] ? 1 : 0
      const c1 = s1.charges[id] ? 1 : 0
      const a = (ph.k === ph.next ? c0 : c0 + (c1 - c0) * m) * vis[id]
      s.visible = a > 0.01
      s.material.opacity = a
      s.position.copy(P[id]).add(new THREE.Vector3(0.3, 0.3, 0.35))
    })

    this.labels.forEach((L) => {
      const a = (ph.k === ph.next ? L.states[ph.k] : L.states[ph.k] + (L.states[ph.next] - L.states[ph.k]) * m) * vis[L.atom]
      L.sprite.visible = a > 0.01
      L.sprite.material.opacity = a
      L.sprite.position.copy(P[L.atom]).add(new THREE.Vector3(0, L.dy, 0.4))
    })
    this.letters.forEach((L) => {
      L.sprite.position.copy(P[L.id]).add(VIEW_DIR.clone().multiplyScalar(EL[this.ATOMS[L.id].el].r + 0.02))
    })

    // arrows + electron pairs + glow on the atoms that react
    const showK = ph.k < this.mech.steps && ph.arrow > 0 ? ph.k : -1
    if (showK !== this.arrowStep) this.buildArrows(showK)
    const t = performance.now() / 1000
    this.glows.forEach((g) => { g.visible = false })
    let gi = 0
    this.arrowObjs.forEach((o) => {
      const segs = Math.max(1, Math.floor(ph.arrow * o.SEG))
      o.tube.geometry.setDrawRange(0, segs * o.RAD * 6)
      o.tube.material.opacity = ph.arrowAlpha
      o.head.visible = ph.arrow > 0.97
      o.head.material.opacity = ph.arrowAlpha
      const tt = ph.travel
      const e = o.curve.getPoint(tt)
      const tan = o.curve.getTangent(tt)
      const sd = tan.clone().cross(VIEW_DIR).normalize().multiplyScalar(0.085)
      o.d1.position.copy(e).add(sd)
      o.d2.position.copy(e).sub(sd)
      const da = Math.min(ph.arrow, 1 - Math.max(0, (tt - 0.82) / 0.18))
      o.d1.material.opacity = da
      o.d1.visible = o.d2.visible = da > 0.01
      if (ph.morph === 0) {
        o.glowAtoms.forEach((id) => {
          const g = this.glows[gi++]
          if (!g) return
          g.visible = true
          g.position.copy(P[id])
          g.scale.setScalar(1.25 + 0.12 * Math.sin(t * 4))
          g.material.opacity = 0.7 * ph.arrow
        })
      }
    })

    // the view pans with the action (same idea as the 2-D view)
    const target = new THREE.Vector3(...v.lerp(this.boxes[ph.k].c, this.boxes[ph.next].c, m))
    const off = this.camera.position.clone().sub(this.controls.target)
    this.controls.target.copy(target)
    this.camera.position.copy(target).add(off)
  }

  fitDistance() {
    const tanH = Math.tan((this.camera.fov * Math.PI) / 360)
    const byH = this.frameH / 2 / tanH
    const byW = this.frameW / 2 / (tanH * this.camera.aspect)
    return Math.max(byH, byW) * 1.02
  }

  home() {
    this.camera.position.copy(this.controls.target).add(VIEW_DIR.clone().multiplyScalar(this.fitDistance()))
    this.controls.update()
  }

  setAutoRotate(on) {
    this.controls.autoRotate = on
    this.controls.autoRotateSpeed = 0.8
  }

  resize(refit) {
    const w = this.container.clientWidth || 1
    const h = this.container.clientHeight || 1
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    if (refit) {
      if (!this.placed) { this.controls.target.set(...this.boxes[0].c); this.placed = true }
      this.camera.position.copy(this.controls.target).add(VIEW_DIR.clone().multiplyScalar(this.fitDistance()))
      this.controls.minDistance = this.fitDistance() * 0.35
      this.controls.maxDistance = this.fitDistance() * 2.2
      this.controls.update()
    }
  }

  loop() {
    if (this.disposed) return
    this.raf = requestAnimationFrame(this.loop)
    if (!this.visible) return
    this.frame()
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.disposed = true
    window.removeEventListener('themechange', this.onTheme)
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.io.disconnect()
    this.controls.dispose()
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose() }
    })
    this.envTex.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
  }
}
