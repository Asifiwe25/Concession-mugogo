import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './i18n'
import { LanguageProvider } from './context/LanguageContext'

// Splash screen — shown while app loads
const splash = document.getElementById('splash')
if (splash) {
  splash.innerHTML = `
    <style>
      #splash{position:fixed;inset:0;background:#f7f0e4;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;transition:opacity .5s ease}
      #splash.hide{opacity:0;pointer-events:none}
      .sp-logo{width:80px;height:80px;margin-bottom:1.5rem;animation:sp-bounce .8s ease infinite alternate}
      @keyframes sp-bounce{from{transform:scale(1)}to{transform:scale(1.06)}}
      .sp-title{font-family:Georgia,serif;font-size:1.5rem;font-weight:700;color:#8c6e3f;margin-bottom:.375rem}
      .sp-sub{font-size:.8rem;color:#b8996a;letter-spacing:.04em}
      .sp-bar{width:160px;height:3px;background:#ede0cc;border-radius:99px;overflow:hidden;margin-top:2rem}
      .sp-prog{height:100%;background:#8c6e3f;border-radius:99px;animation:sp-load 1.2s ease forwards}
      @keyframes sp-load{from{width:0}to{width:100%}}
    </style>
    <svg class="sp-logo" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="50" fill="#8c6e3f"/>
      <path d="M50 18 L82 42 L82 82 L18 82 L18 42 Z" fill="rgba(255,255,255,0.95)"/>
      <rect x="38" y="58" width="14" height="24" rx="2" fill="#8c6e3f" opacity="0.9"/>
      <rect x="20" y="50" width="12" height="11" rx="2" fill="#8c6e3f" opacity="0.7"/>
      <rect x="68" y="50" width="12" height="11" rx="2" fill="#8c6e3f" opacity="0.7"/>
      <ellipse cx="63" cy="38" rx="8" ry="5" fill="#8c6e3f" opacity="0.8" transform="rotate(-30 63 38)"/>
      <circle cx="30" cy="28" r="5" fill="rgba(255,220,100,0.95)"/>
      <rect x="10" y="80" width="80" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
    </svg>
    <div class="sp-title">Concession Mugogo</div>
    <div class="sp-sub">Gestion Agro-pastorale Intégrée</div>
    <div class="sp-bar"><div class="sp-prog"></div></div>
  `
}

// Remove splash after app mounts
setTimeout(() => {
  if (splash) {
    splash.classList.add('hide')
    setTimeout(() => splash.remove(), 600)
  }
}, 1400)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
)
