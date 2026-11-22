/* One look: the Neon theme (styles/neon.css). Every colour and font is a CSS
   variable under html[data-theme='neon']; the 2-D drawing and the 3-D scenes
   read them through token(). */

export const THEME = 'neon'

export function applyTheme() {
  document.documentElement.dataset.theme = THEME
}

/** Read a CSS variable of the theme (trimmed). */
export const token = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
