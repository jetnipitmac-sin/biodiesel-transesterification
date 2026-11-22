import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { UNITS, UNIT, FLOWS, FLUIDS, RACK, PUMPS } from './units.js'
import {
  MAT, storageTank, reactor, column, horizontalVessel, exchanger, pump, structure, pipeRack, bund, building, shadows,
} from './builders.js'
import { token } from '../theme.js'

/* ==========================================================================
   The 3-D biodiesel plant. Units are clickable (mesh or label); selecting one
   flies the camera to it, rings it on the ground and brightens the pipes that
   feed it / leave it while the rest fade. Pipe stripes scroll to show flow.
   ========================================================================== */

const PROPS = [
  { file: 'ibcTank_steel_stainless_a01', h: 1.25, at: [[-31, 12.2, 0], [-31, 13.8, 0]] },
  { file: 'ibcTank_a02', h: 1.2, at: [[29.4, 15.2, 0], [30.9, 15.2, 0], [32.4, 15.2, 0], [30.1, 16.7, 0.1]] },
  { file: 'pallet_a01', h: 0.15, at: [[-37, 19.4, 0], [-35.6, 19.4, 0], [-33, 19.4, 0]] },
  { file: 'drum_steel_a01', h: 0.9, at: [[-37.3, 19.1, 0], [-36.7, 19.1, 0], [-37.3, 19.7, 0], [-36.7, 19.7, 0], [-35.9, 19.1, 0], [-35.3, 19.1, 0]], onPallet: true },
  { file: 'drum_plastic_blue_a01', h: 0.95, at: [[-33.3, 19.1, 0], [-32.7, 19.1, 0], [-33.3, 19.7, 0]], onPallet: true },
  { file: 'cabinet_drum_flammable_a02', h: 1.7, at: [[-39.6, 18.8, Math.PI / 2]] },
  { file: 'safety_eyewashStation_combo_shower_a01', h: 2.3, at: [[-31.6, 10.2, -Math.PI / 2], [-11.6, -2.4, 0], [24.4, -2.2, 0]] },
  { file: 'vehicle_forklift_orange_a01', h: 2.1, at: [[-29.5, 21.5, -0.7]] },
  { file: 'fireProtection_extinguisher_portable_a01', h: 0.6, at: [[-26.6, 4.2, 0], [4.6, -2.3, 0], [19.4, 2.6, 0], [34.6, 3.6, 0], [-12.2, 15.6, 0]] },
  { file: 'safetyBoard_hseInformation_a01', h: 1.9, at: [[-9.2, 15.4, 0]] },
  { file: 'sign_warning_a04', h: 1.1, at: [[-29.6, 7.2, 0], [29.2, 6.6, 0]] },
]
const OVERVIEW = { pos: new THREE.Vector3(-2.5, 54, 79), target: new THREE.Vector3(4, 0, 6) }
const VIEW_DIR = new THREE.Vector3(-0.35, 0.6, 0.72).normalize()

function stripeTexture(hex) {
  const c = document.createElement('canvas')
  c.width = 128; c.height = 32
  const g = c.getContext('2d')
  const base = new THREE.Color(hex)
  g.fillStyle = `#${base.clone().multiplyScalar(0.82).getHexString()}`
  g.fillRect(0, 0, 128, 32)
  g.fillStyle = 'rgba(255,255,255,0.55)'
  for (const x0 of [10, 74]) {
    g.beginPath(); g.moveTo(x0, 4); g.lineTo(x0 + 26, 16); g.lineTo(x0, 28); g.lineTo(x0 + 12, 16); g.closePath(); g.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = THREE.RepeatWrapping
  t.anisotropy = 4
  return t
}

function radialTexture(stops) {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 256
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  stops.forEach(([o, col]) => grd.addColorStop(o, col))
  g.fillStyle = grd
  g.fillRect(0, 0, 256, 256)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** polyline with rounded corners -> CurvePath */
function roundedPath(pts, rad = 0.45) {
  const P = pts.map((p) => new THREE.Vector3(...p))
  const path = new THREE.CurvePath()
  let cur = P[0].clone()
  for (let i = 1; i < P.length - 1; i++) {
    const a = P[i - 1]; const b = P[i]; const c = P[i + 1]
    const d1 = b.clone().sub(a); const d2 = c.clone().sub(b)
    const r = Math.min(rad, d1.length() / 2, d2.length() / 2)
    const s = b.clone().sub(d1.normalize().multiplyScalar(r))
    const e = b.clone().add(d2.normalize().multiplyScalar(r))
    if (s.distanceTo(cur) > 1e-3) path.add(new THREE.LineCurve3(cur, s))
    path.add(new THREE.QuadraticBezierCurve3(s, b.clone(), e))
    cur = e
  }
  path.add(new THREE.LineCurve3(cur, P[P.length - 1]))
  return path
}

/** route a rack pipe: up, over to its lane, along the rack, back out, down */
function rackRoute(a, b, laneZ) {
  const yz = RACK.zLeg
  const pts = [a, [a[0], yz, a[2]], [a[0], yz, laneZ], [a[0], RACK.y, laneZ], [b[0], RACK.y, laneZ], [b[0], yz, laneZ], [b[0], yz, b[2]], b]
  return pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1], p[2] - pts[i - 1][2]) > 0.05)
}

/** give overlapping rack pipes different lanes: 0, +1, -1, +2, -2 ... */
function assignLanes(flows) {
  const order = [0, 1, -1, 2, -2, 3, -3]
  const used = order.map(() => [])
  const lanes = {}
  flows.filter((f) => f.rack).sort((p, q) => Math.abs(q.rack[1][0] - q.rack[0][0]) - Math.abs(p.rack[1][0] - p.rack[0][0])).forEach((f) => {
    const lo = Math.min(f.rack[0][0], f.rack[1][0]) - 0.6
    const hi = Math.max(f.rack[0][0], f.rack[1][0]) + 0.6
    const k = order.findIndex((_, i) => used[i].every(([a, b]) => hi < a || lo > b))
    used[k].push([lo, hi])
    lanes[f.id] = RACK.z + order[k] * RACK.lane
  })
  return lanes
}

export class PlantScene {
  constructor(container, { onSelect } = {}) {
    this.container = container
    this.onSelect = onSelect || (() => {})
    this.disposed = false
    this.flowsOn = true
    this.selected = null

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)
    this.renderer = renderer

    this.labelRenderer = new CSS2DRenderer()
    this.labelRenderer.domElement.className = 'pl-labels'
    container.appendChild(this.labelRenderer.domElement)

    const scene = new THREE.Scene()
    this.scene = scene
    const pmrem = new THREE.PMREMGenerator(renderer)
    this.envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = this.envTex
    pmrem.dispose()
    this.hemi = new THREE.HemisphereLight(0xffffff, 0xd9dcf0, 0.9)
    scene.add(this.hemi)
    const sun = new THREE.DirectionalLight(0xfff6ea, 2.2)
    sun.position.set(-40, 70, 45)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 55, bottom: -55, near: 10, far: 200 })
    sun.shadow.bias = -0.0004
    sun.shadow.normalBias = 0.03
    scene.add(sun)
    this.sun = sun

    this.camera = new THREE.PerspectiveCamera(34, 1, 0.5, 600)
    this.camera.position.copy(OVERVIEW.pos)
    this.controls = new OrbitControls(this.camera, renderer.domElement)
    this.controls.target.copy(OVERVIEW.target)
    this.controls.enableDamping = true
    this.controls.maxPolarAngle = Math.PI * 0.47
    this.controls.minDistance = 8
    this.controls.maxDistance = 160
    this.controls.addEventListener('start', () => { this.tween = null })

    this.unitRoots = {}
    this.pickables = []
    this.buildGround()
    this.applyTheme()
    this.onTheme = () => this.applyTheme()
    window.addEventListener('themechange', this.onTheme)
    this.buildSite()
    this.buildUnits()
    this.buildFlows()
    this.buildHalo()
    this.loadProps()

    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this.onMove = (e) => this.hover(e)
    this.onClick = (e) => this.click(e)
    renderer.domElement.addEventListener('pointermove', this.onMove)
    renderer.domElement.addEventListener('click', this.onClick)

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(container)
    this.resize()
    this.clock = new THREE.Clock()
    this.loop = this.loop.bind(this)
    this.raf = requestAnimationFrame(this.loop)
  }

  /* ---------- theme: floor, roads, pads and sky light follow CSS tokens --------- */
  applyTheme() {
    const t = (n, f) => token(n) || f
    this.groundMat.color.set(t('--plant-ground', '#eceef4'))
    this.roadMat.color.set(t('--plant-road', '#d6d9e4'))
    this.lineMat.color.set(t('--plant-line', '#ffffff'))
    MAT.concrete.color.set(t('--plant-concrete', '#e3e5ec'))
    this.hemi.color.set(t('--plant-sky', '#ffffff'))
    this.hemi.groundColor.set(t('--plant-hemi-ground', '#d9dcf0'))
    this.grid.visible = token('--plant-grid') === '1'
  }

  /* ---------- static site ---------------------------------------------------- */
  buildGround() {
    const fade = radialTexture([[0, '#ffffff'], [0.62, '#ffffff'], [1, '#000000']])
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(190, 140),
      new THREE.MeshStandardMaterial({ color: 0xeceef4, roughness: 0.95, alphaMap: fade, transparent: true }),
    )
    this.groundMat = ground.material
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    this.scene.add(ground)
    const roadMat = new THREE.MeshStandardMaterial({ color: 0xd6d9e4, roughness: 0.9 })
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    this.roadMat = roadMat
    this.lineMat = lineMat
    // neon theme: a glowing grid on the floor (hidden in the light themes)
    this.grid = new THREE.GridHelper(150, 50, 0xff4fd8, 0x34f5ff)
    this.grid.material.transparent = true
    this.grid.material.opacity = 0.22
    this.grid.position.y = 0.012
    this.scene.add(this.grid)
    const road = (x, z, w, d) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), roadMat)
      m.rotation.x = -Math.PI / 2
      m.position.set(x, 0.02, z)
      m.receiveShadow = true
      this.scene.add(m)
    }
    road(4, 27, 96, 5)
    road(4, -21, 96, 5)
    road(-46, 3, 5, 53)
    road(52, 3, 5, 53)
    const dash = new THREE.InstancedMesh(new THREE.PlaneGeometry(2.2, 0.18), lineMat, 64)
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0))
    let i = 0
    for (let x = -42; x <= 50; x += 5.8) {
      for (const z of [27, -21]) { if (i < 64) { m.compose(new THREE.Vector3(x, 0.03, z), q, new THREE.Vector3(1, 1, 1)); dash.setMatrixAt(i++, m) } }
    }
    dash.count = i
    this.scene.add(dash)
    // trees: soft round crowns along the boundary
    const crown = new THREE.MeshStandardMaterial({ color: 0x8fdcb0, roughness: 0.8 })
    const crown2 = new THREE.MeshStandardMaterial({ color: 0x6fcf9f, roughness: 0.8 })
    const trunk = new THREE.MeshStandardMaterial({ color: 0xb69a7d, roughness: 0.9 })
    const spots = [[-50, 30], [-44, 33], [-36, 32], [-26, 33], [10, 33], [22, 32], [34, 33], [46, 32], [56, 28], [57, 12], [58, -6], [56, -22],
      [-52, 14], [-53, -4], [-51, -20], [-40, -26], [-24, -27], [-6, -26], [14, -27], [30, -26], [44, -27]]
    spots.forEach(([x, z], k) => {
      const s = 0.8 + ((k * 37) % 10) / 20
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * s, 0.25 * s, 2.2 * s, 8), trunk)
      t.position.set(x, 1.1 * s, z)
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7 * s, 1), k % 2 ? crown : crown2)
      c.position.set(x, 3.2 * s, z)
      this.scene.add(shadows(t), shadows(c))
    })
  }

  buildSite() {
    const site = new THREE.Group()
    site.add(pipeRack({ x0: RACK.x0, x1: RACK.x1, z: RACK.z, y: RACK.y }))
    site.add(bund({ x0: -40.5, x1: -27.5, z0: -10.5, z1: 2.5 }))
    site.add(bund({ x0: -29, x1: -21, z0: 8, z1: 16 }))
    site.add(bund({ x0: 35.5, x1: 48.5, z0: -10.5, z1: 2.5 }))
    site.add(bund({ x0: 30, x1: 38, z0: 7, z1: 15 }))
    const ctrl = building({ w: 10, d: 6, h: 4 })
    ctrl.position.set(-14, 0, 19)
    site.add(ctrl)
    PUMPS.forEach((p) => {
      const pm = pump()
      pm.position.set(p.x, 0, p.z)
      site.add(pm)
    })
    // methanol condenser on its own frame beside the column
    const frame = structure({ w: 3.2, d: 2.4, levels: [6, 11.6] })
    frame.position.set(17, 0, 9)
    site.add(frame)
    const cond = exchanger({ d: 0.8, L: 2.6 })
    cond.position.set(17, 12.4, 9)
    site.add(cond)
    const drum = exchanger({ d: 0.9, L: 2 })
    drum.position.set(17, 6.6, 9)
    site.add(drum)
    this.scene.add(shadows(site))
  }

  /* ---------- process units ------------------------------------------------- */
  buildUnits() {
    UNITS.forEach((u) => {
      const root = new THREE.Group()
      root.position.set(u.x, 0, u.z)
      let top = 0
      let size = 6
      if (u.kind === 'tank') {
        const t = storageTank(u)
        root.add(t); top = t.userData.top; size = t.userData.size
      } else if (u.kind === 'reactor') {
        const r = reactor(u)
        root.add(r); top = r.userData.top; size = r.userData.size
      } else if (u.kind === 'reactors') {
        const st = structure({ w: 11, d: 4.6, levels: [u.platform] })
        root.add(st)
        for (const dx of [-3.25, 3.25]) {
          const r = reactor({ d: u.d, h: u.h, legs: u.platform + 0.06 })
          r.position.x = dx
          root.add(r)
          top = r.userData.top
        }
        size = 11
      } else if (u.kind === 'horizontal') {
        const h = horizontalVessel(u)
        root.add(h); top = h.userData.top; size = h.userData.size
      } else if (u.kind === 'column') {
        const c = column(u)
        root.add(c); top = c.userData.top; size = c.userData.size
      }
      root.traverse((o) => { if (o.isMesh) { o.userData.unitId = u.id; this.pickables.push(o) } })
      shadows(root)
      this.scene.add(root)

      const el = document.createElement('button')
      el.className = 'pl-label'
      // short name + compact reaction chip in the overview; the full name and tag show on hover / when selected
      const tagLong = u.rx === 3 ? 'ล้างผลของปฏิกิริยา 3' : `ปฏิกิริยาที่ ${u.rx}`
      el.innerHTML = `<b>${u.n}</b><span class="nm-s">${u.short}</span><span class="nm-l">${u.name}</span>`
        + (u.rx ? `<i class="rxtag rx${u.rx}"><span class="rt-s">${u.rx === 3 ? 'ล้าง ' : ''}R${u.rx}</span><span class="rt-l">${tagLong}</span></i>` : '')
      el.addEventListener('click', (ev) => { ev.stopPropagation(); this.onSelect(u.id) })
      const lab = new CSS2DObject(el)
      lab.position.set(0, top + 1.4, 0)
      root.add(lab)
      this.unitRoots[u.id] = { root, top, size, label: el, footprint: u.kind === 'reactors' ? 7.5 : u.kind === 'horizontal' ? u.L / 2 + 1.4 : (u.d || 2) / 2 + 1.6 }
    })
  }

  buildFlows() {
    const lanes = assignLanes(FLOWS)
    this.flows = FLOWS.map((f) => {
      const pts = f.rack ? rackRoute(f.rack[0], f.rack[1], lanes[f.id]) : f.path
      const curve = roundedPath(pts)
      const len = curve.getLength()
      const tex = stripeTexture(FLUIDS[f.fluid].color)
      tex.repeat.set(len / 1.6, 1)
      const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, metalness: 0.15, transparent: true, opacity: 1 })
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(24, Math.ceil(len * 3)), f.recycle ? 0.1 : 0.12, 10, false), mat)
      tube.castShadow = true
      this.scene.add(tube)
      return { ...f, tube, tex, mat }
    })
  }

  buildHalo() {
    const tex = radialTexture([[0, 'rgba(124,92,255,0)'], [0.55, 'rgba(124,92,255,0)'], [0.75, 'rgba(124,92,255,0.55)'], [0.86, 'rgba(236,72,153,0.35)'], [1, 'rgba(236,72,153,0)']])
    this.halo = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }))
    this.halo.rotation.x = -Math.PI / 2
    this.halo.position.y = 0.06
    this.halo.visible = false
    this.scene.add(this.halo)
  }

  loadProps() {
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    this.props = new THREE.Group()
    this.scene.add(this.props)
    const base = import.meta.env.BASE_URL || '/'
    PROPS.forEach((p) => {
      loader.load(`${base}models/simready/${p.file}.glb`, (gltf) => {
        if (this.disposed) return
        const src = gltf.scene
        const bb = new THREE.Box3().setFromObject(src)
        const hgt = bb.max.y - bb.min.y
        // SimReady is in metres; only rescale if a file comes in at an odd unit
        const s = hgt > 0 && Math.abs(hgt / p.h - 1) > 0.45 ? p.h / hgt : 1
        p.at.forEach(([x, z, ry]) => {
          const c = src.clone(true)
          c.scale.setScalar(s)
          c.rotation.y = ry || 0
          c.position.set(x, -bb.min.y * s + (p.onPallet ? 0.15 : 0), z)
          shadows(c)
          this.props.add(c)
        })
        this.renderer.shadowMap.needsUpdate = true
      }, undefined, () => { /* a missing prop must never break the plant */ })
    })
  }

  /* ---------- interaction --------------------------------------------------- */
  pick(e) {
    const r = this.renderer.domElement.getBoundingClientRect()
    this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    this.raycaster.setFromCamera(this.pointer, this.camera)
    const hit = this.raycaster.intersectObjects(this.pickables, false)[0]
    return hit ? hit.object.userData.unitId : null
  }

  hover(e) {
    const id = this.pick(e)
    if (id === this.hovered) return
    if (this.hovered) this.unitRoots[this.hovered].label.classList.remove('hover')
    this.hovered = id
    if (id) this.unitRoots[id].label.classList.add('hover')
    this.renderer.domElement.style.cursor = id ? 'pointer' : 'grab'
  }

  click(e) {
    const id = this.pick(e)
    if (id) this.onSelect(id)
  }

  /** highlight one unit (or none = overview) and fly the camera */
  select(id) {
    this.selected = id
    Object.entries(this.unitRoots).forEach(([uid, r]) => {
      r.label.classList.toggle('on', uid === id)
      r.label.classList.toggle('dim', !!id && uid !== id)
    })
    this.flows.forEach((f) => {
      const linked = !id || f.from === id || f.to === id
      f.mat.opacity = linked ? 1 : 0.22
      f.linked = linked
    })
    if (!id) { this.halo.visible = false; this.flyTo(OVERVIEW.pos, OVERVIEW.target); return }
    const u = UNIT[id]
    const r = this.unitRoots[id]
    this.halo.visible = true
    this.halo.position.x = u.x
    this.halo.position.z = u.z
    this.haloBase = r.footprint * 1.25
    const target = new THREE.Vector3(u.x, Math.min(r.top * 0.45, 6), u.z)
    const dist = Math.max(16, r.size * 1.9 + 9)
    this.flyTo(target.clone().add(VIEW_DIR.clone().multiplyScalar(dist)), target)
  }

  flyTo(pos, target) {
    this.tween = { t0: performance.now(), dur: 1400, p0: this.camera.position.clone(), t0v: this.controls.target.clone(), p1: pos.clone(), t1: target.clone() }
  }

  setFlows(on) { this.flowsOn = on }

  setLabels(on) { this.labelRenderer.domElement.style.display = on ? '' : 'none' }

  /* ---------- loop ---------------------------------------------------------- */
  resize() {
    const w = this.container.clientWidth || 1
    const h = this.container.clientHeight || 1
    this.renderer.setSize(w, h, false)
    this.labelRenderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

  loop() {
    if (this.disposed) return
    this.raf = requestAnimationFrame(this.loop)
    const dt = Math.min(0.05, this.clock.getDelta())
    if (this.tween) {
      const tw = this.tween
      let e = Math.min(1, (performance.now() - tw.t0) / tw.dur)
      e = e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2
      this.camera.position.lerpVectors(tw.p0, tw.p1, e)
      this.controls.target.lerpVectors(tw.t0v, tw.t1, e)
      if (e >= 1) this.tween = null
    }
    if (this.flowsOn) this.flows.forEach((f) => { f.tex.offset.x -= dt * (f.linked && this.selected ? 1.6 : 0.9) })
    if (this.halo.visible) {
      const s = this.haloBase * (1 + 0.06 * Math.sin(performance.now() / 260))
      this.halo.scale.set(s, s, 1)
    }
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    this.labelRenderer.render(this.scene, this.camera)
  }

  dispose() {
    this.disposed = true
    window.removeEventListener('themechange', this.onTheme)
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.renderer.domElement.removeEventListener('pointermove', this.onMove)
    this.renderer.domElement.removeEventListener('click', this.onClick)
    this.controls.dispose()
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach((m) => { if (m.map) m.map.dispose(); m.dispose() }) }
    })
    this.envTex.dispose()
    this.renderer.dispose()
    this.renderer.domElement.remove()
    this.labelRenderer.domElement.remove()
  }
}

export { OVERVIEW, MAT }
