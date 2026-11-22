import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/ibm-plex-sans-thai/400.css'
import '@fontsource/ibm-plex-sans-thai/500.css'
import '@fontsource/ibm-plex-sans-thai/600.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/mitr/400.css'
import '@fontsource/mitr/500.css'
import '@fontsource/mitr/600.css'
import '@fontsource/mitr/700.css'
import '@fontsource/bungee/400.css'
import './styles/global.css'
import './styles/neon.css'
import App from './App.jsx'
import { applyTheme } from './theme.js'

applyTheme()   // before the first paint, so the 3-D scene reads the right colours

createRoot(document.getElementById('root')).render(<App />)
