import React from 'react'

/* Chemistry drawings for the slides (SVG, theme colours via CSS variables). */

const C = { ink: 'var(--ink2d)', o: 'var(--o2d)', r: 'var(--r2d)', g: 'var(--rp2d)', me: 'var(--nuc)', hot: 'var(--push)', nu: 'var(--nuc)' }
const T = ({ x, y, c = C.ink, s = 30, w = 700, a = 'middle', children, cls }) => (
  <text x={x} y={y} textAnchor={a} className={cls || 'ch-t'} style={{ fill: c, fontSize: s, fontWeight: w }}>{children}</text>
)
const L = ({ x1, y1, x2, y2, c = C.ink, w = 3.2, dash }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} style={{ stroke: c }} strokeWidth={w} strokeLinecap="round" strokeDasharray={dash} />
)
/* carbonyl drawn as C with =O above it */
const CO = ({ x, y }) => (
  <g>
    <T x={x} y={y}>C</T>
    <L x1={x - 5} y1={y - 26} x2={x - 5} y2={y - 52} />
    <L x1={x + 5} y1={y - 26} x2={x + 5} y2={y - 52} />
    <T x={x} y={y - 60} c={C.o}>O</T>
  </g>
)

/** TG + 3 CH3OH -> 3 FAME + glycerol, with the bond that breaks marked */
export function OverallReaction({ showBreak = true }) {
  const rows = [96, 200, 304]
  return (
    <svg className="ch-svg" viewBox="0 0 1240 390">
      {/* triglyceride */}
      {rows.map((y, k) => (
        <g key={`tg${k}`}>
          <T x={52} y={y} c={C.g}>{k === 1 ? 'CH' : 'CH₂'}</T>
          <L x1={86} y1={y - 10} x2={104} y2={y - 10} />
          <T x={120} y={y} c={C.o}>O</T>
          <L x1={136} y1={y - 10} x2={158} y2={y - 10} c={showBreak ? C.hot : C.ink} dash={showBreak ? '6 5' : undefined} />
          <CO x={174} y={y} />
          <L x1={190} y1={y - 10} x2={210} y2={y - 10} />
          <T x={226} y={y} c={C.r}>R</T>
          {k < 2 && <L x1={52} y1={y + 10} x2={52} y2={rows[k + 1] - 34} />}
        </g>
      ))}
      <T x={130} y={372} s={21} w={600} c="var(--text-2)" cls="ch-cap">triglyceride (น้ำมันปาล์ม)</T>

      <T x={290} y={210} s={40} c="var(--text-3)">+</T>
      <g>
        <T x={334} y={210} s={32}>3</T>
        <T x={386} y={210} s={32} c={C.me}>CH₃</T>
        <T x={432} y={210} s={32} c={C.o}>O</T>
        <T x={456} y={210} s={32}>H</T>
      </g>
      <T x={400} y={372} s={21} w={600} c="var(--text-2)" cls="ch-cap">เมทานอล</T>

      {/* arrow */}
      <L x1={500} y1={200} x2={650} y2={200} w={4} />
      <path d="M650 200 l-16 -9 v18 z" style={{ fill: C.ink }} />
      <T x={575} y={176} s={22} w={700} c={C.me}>CH₃O⁻ (NaOCH₃)</T>
      <T x={575} y={236} s={19} w={500} c="var(--text-2)">60 °C · 1 atm · ~1 ชม.</T>

      {/* FAME */}
      {rows.map((y, k) => (
        <g key={`fa${k}`}>
          <T x={720} y={y} c={C.me}>CH₃</T>
          <L x1={752} y1={y - 10} x2={770} y2={y - 10} />
          <T x={786} y={y} c={C.o}>O</T>
          <L x1={802} y1={y - 10} x2={824} y2={y - 10} c={C.me} w={4} />
          <CO x={840} y={y} />
          <L x1={856} y1={y - 10} x2={876} y2={y - 10} />
          <T x={892} y={y} c={C.r}>R</T>
        </g>
      ))}
      <T x={806} y={372} s={21} w={600} c="var(--text-2)" cls="ch-cap">ไบโอดีเซล 3 โมเลกุล (FAME)</T>

      <T x={952} y={210} s={40} c="var(--text-3)">+</T>

      {/* glycerol */}
      {rows.map((y, k) => (
        <g key={`gl${k}`}>
          <T x={1030} y={y} c={C.g}>{k === 1 ? 'CH' : 'CH₂'}</T>
          <L x1={1064} y1={y - 10} x2={1082} y2={y - 10} />
          <T x={1098} y={y} c={C.o}>O</T>
          <T x={1124} y={y}>H</T>
          {k < 2 && <L x1={1030} y1={y + 10} x2={1030} y2={rows[k + 1] - 34} />}
        </g>
      ))}
      <T x={1070} y={372} s={21} w={600} c="var(--text-2)" cls="ch-cap">glycerol</T>
    </svg>
  )
}

/** Nu- + R-CO-L -> tetrahedral -> R-CO-Nu + L-  (one picture for all three reactions) */
export function AcylSubstitution() {
  const arrow = (x1, x2, y) => (
    <g>
      <L x1={x1} y1={y} x2={x2} y2={y} w={3.5} />
      <path d={`M${x2} ${y} l-14 -8 v16 z`} style={{ fill: C.ink }} />
    </g>
  )
  const curly = (d, c) => <path d={d} fill="none" style={{ stroke: c }} strokeWidth="3" strokeLinecap="round" markerEnd={`url(#ah-${c === C.nu ? 'n' : 'p'})`} />
  return (
    <svg className="ch-svg" viewBox="0 0 1240 270">
      <defs>
        <marker id="ah-n" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" style={{ fill: C.nu }} /></marker>
        <marker id="ah-p" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" style={{ fill: C.hot }} /></marker>
      </defs>
      {/* 1: carbonyl + nucleophile */}
      <T x={96} y={92} c={C.nu}>Nu⁻</T>
      <T x={270} y={160}>C</T>
      <L x1={265} y1={132} x2={265} y2={98} /><L x1={275} y1={132} x2={275} y2={98} />
      <T x={270} y={88} c={C.o}>O</T>
      <L x1={256} y1={160} x2={222} y2={184} /><T x={206} y={204} c={C.r}>R</T>
      <L x1={284} y1={160} x2={318} y2={184} /><T x={336} y={204} c={C.g}>L</T>
      {curly('M120 96 Q 200 92 252 140', C.nu)}
      {curly('M282 118 Q 318 104 290 82', C.hot)}
      {arrow(388, 470, 150)}
      <T x={429} y={128} s={18} w={600} c="var(--text-2)">addition</T>

      {/* 2: tetrahedral */}
      <T x={640} y={160}>C</T>
      <L x1={640} y1={132} x2={640} y2={100} /><T x={640} y={90} c={C.o}>O⁻</T>
      <L x1={622} y1={150} x2={584} y2={150} /><T x={556} y={160} c={C.nu}>Nu</T>
      <L x1={658} y1={150} x2={696} y2={150} /><T x={716} y={160} c={C.g}>L</T>
      <L x1={640} y1={170} x2={640} y2={202} /><T x={640} y={232} c={C.r}>R</T>
      <T x={640} y={262} s={17} w={600} c="var(--text-3)">tetrahedral intermediate</T>
      {arrow(770, 852, 150)}
      <T x={811} y={128} s={18} w={600} c="var(--text-2)">elimination</T>

      {/* 3: product */}
      <T x={990} y={160}>C</T>
      <L x1={985} y1={132} x2={985} y2={98} /><L x1={995} y1={132} x2={995} y2={98} />
      <T x={990} y={88} c={C.o}>O</T>
      <L x1={976} y1={160} x2={942} y2={184} /><T x={926} y={204} c={C.r}>R</T>
      <L x1={1004} y1={160} x2={1038} y2={184} /><T x={1062} y={204} c={C.nu}>Nu</T>
      <T x={1118} y={160} s={34} c="var(--text-3)">+</T>
      <T x={1172} y={160} c={C.g}>L⁻</T>
    </svg>
  )
}

/** inline formula helper: <F>R–COO<sub>…</sub></F> with coloured parts */
export const Rr = ({ children = 'R' }) => <span className="f-r">{children}</span>
export const Rg = ({ children = 'R′' }) => <span className="f-g">{children}</span>
export const Ox = ({ children = 'O' }) => <span className="f-o">{children}</span>
export const Me = ({ children = 'CH₃' }) => <span className="f-me">{children}</span>

/** triglyceride on its own: glycerol backbone + three fatty-acid ester arms */
export function Triglyceride() {
  const rows = [70, 170, 270]
  return (
    <svg className="ch-svg" viewBox="0 0 520 330">
      {rows.map((y, k) => (
        <g key={k}>
          <T x={60} y={y} c={C.g}>{k === 1 ? 'CH' : 'CH₂'}</T>
          <L x1={94} y1={y - 10} x2={114} y2={y - 10} />
          <T x={130} y={y} c={C.o}>O</T>
          <L x1={146} y1={y - 10} x2={168} y2={y - 10} />
          <CO x={184} y={y} />
          <L x1={200} y1={y - 10} x2={224} y2={y - 10} />
          <path d={`M232 ${y - 10} l22 -14 l22 14 l22 -14 l22 14 l22 -14 l22 14 l22 -14 l22 14`} fill="none" style={{ stroke: C.r }} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
          <T x={460} y={y - 2} s={22} w={600} c={C.r} a="start">C₁₅–C₁₇</T>
          {k < 2 && <L x1={60} y1={y + 10} x2={60} y2={rows[k + 1] - 34} />}
        </g>
      ))}
      <T x={60} y={318} s={17} w={600} c={C.g} cls="ch-cap">glycerol</T>
      <T x={340} y={318} s={17} w={600} c={C.r} cls="ch-cap">กรดไขมัน 3 สาย (เอสเทอร์)</T>
    </svg>
  )
}

/** the headline equation of each reaction page */
export function Equation({ kind }) {
  if (kind === 'fischer') return <span className="eqn"><Rr />–CO<Ox />H + <Me />OH <span className="eq-a">⇌</span><small>H₂SO₄</small> <Rr />–CO<Ox /><Me /> + H₂O</span>
  if (kind === 'sapon') return <span className="eqn"><Rr />–CO<Ox /><Rg /> + Na⁺OH⁻ <span className="eq-a">→</span> <Rr />–COO⁻ Na⁺ + <Rg />OH</span>
  return <span className="eqn">TG + 3 <Me />OH <span className="eq-a">→</span><small>CH₃O⁻</small> 3 <Rr />–CO<Ox /><Me /> + glycerol</span>
}
