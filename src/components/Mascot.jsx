import React from 'react'

/* "หยด" the palm-oil droplet: the cartoon guide of the Neon theme.
   mood: idle (bobbing, blinking) · happy (jumps, sparkles) · sad (droops, sweat drop).
   Hidden in the other themes (CSS). The svg is keyed by mood so each change replays its animation. */
export default function Mascot({ mood = 'idle', className = '' }) {
  return (
    <span className={`mascot ${className}`} data-mood={mood} aria-hidden="true">
      <svg viewBox="0 0 120 150" key={mood}>
        <defs>
          <linearGradient id="mz-oil" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor="#ffe45c" />
            <stop offset="0.55" stopColor="#ffb732" />
            <stop offset="1" stopColor="#ff7a2e" />
          </linearGradient>
        </defs>
        <ellipse className="mz-shadow" cx="60" cy="143" rx="30" ry="5" />
        <g className="mz-body">
          <path className="mz-drop" d="M60 8 C60 8 17 62 17 92 a43 43 0 0 0 86 0 C103 62 60 8 60 8 Z" />
          <path className="mz-shine" d="M38 70 C42 56 50 44 56 36" />
          <circle className="mz-shine-dot" cx="34" cy="84" r="4" />
          <g className="mz-eyes">
            <ellipse cx="45" cy="92" rx="9" ry="11" className="mz-eye" />
            <ellipse cx="75" cy="92" rx="9" ry="11" className="mz-eye" />
            <circle cx="47" cy="94" r="4.6" className="mz-pupil" />
            <circle cx="77" cy="94" r="4.6" className="mz-pupil" />
            <circle cx="49" cy="91" r="1.6" className="mz-glint" />
            <circle cx="79" cy="91" r="1.6" className="mz-glint" />
          </g>
          <ellipse cx="33" cy="108" rx="6.5" ry="4" className="mz-cheek" />
          <ellipse cx="87" cy="108" rx="6.5" ry="4" className="mz-cheek" />
          {mood === 'happy' && <path className="mz-mouth-open" d="M48 106 Q60 126 72 106 Z" />}
          {mood === 'sad' && <path className="mz-mouth" d="M50 116 Q60 106 70 116" />}
          {mood === 'idle' && <path className="mz-mouth" d="M50 108 Q60 117 70 108" />}
          {mood === 'sad' && <path className="mz-sweat" d="M98 62 C98 62 91 72 91 76 a7 7 0 0 0 14 0 C105 72 98 62 98 62 Z" />}
        </g>
        {mood === 'happy' && (
          <g className="mz-sparks">
            <path d="M14 30 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" />
            <path d="M104 22 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4 z" />
            <path d="M108 70 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" />
          </g>
        )}
      </svg>
    </span>
  )
}
