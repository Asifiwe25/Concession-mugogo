import React from 'react'

interface LogoProps {
  size?: number
  color?: string
  withText?: boolean
  textColor?: string
  variant?: 'full' | 'icon' | 'report'
}

export function MugogoLogo({ size = 36, color = '#8c6e3f', withText = false, textColor = '#2e1f10', variant = 'icon' }: LogoProps) {
  const s = size

  const IconSVG = (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle */}
      <circle cx="50" cy="50" r="50" fill={color}/>
      {/* House / Farm shape */}
      <path d="M50 18 L82 42 L82 82 L18 82 L18 42 Z" fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
      {/* Door */}
      <rect x="38" y="58" width="14" height="24" rx="2" fill={color} opacity="0.9"/>
      {/* Window left */}
      <rect x="20" y="50" width="12" height="11" rx="2" fill={color} opacity="0.7"/>
      {/* Window right */}
      <rect x="68" y="50" width="12" height="11" rx="2" fill={color} opacity="0.7"/>
      {/* Crop/leaf symbol */}
      <ellipse cx="63" cy="38" rx="8" ry="5" fill={color} opacity="0.8" transform="rotate(-30 63 38)"/>
      <line x1="63" y1="43" x2="63" y2="55" stroke={color} strokeWidth="2" opacity="0.7"/>
      {/* Sun rays */}
      <circle cx="30" cy="28" r="5" fill="rgba(255,220,100,0.9)"/>
      <line x1="30" y1="18" x2="30" y2="22" stroke="rgba(255,220,100,0.8)" strokeWidth="2"/>
      <line x1="30" y1="34" x2="30" y2="38" stroke="rgba(255,220,100,0.8)" strokeWidth="2"/>
      <line x1="20" y1="28" x2="24" y2="28" stroke="rgba(255,220,100,0.8)" strokeWidth="2"/>
      <line x1="36" y1="28" x2="40" y2="28" stroke="rgba(255,220,100,0.8)" strokeWidth="2"/>
      {/* Bottom ground line */}
      <rect x="10" y="80" width="80" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
    </svg>
  )

  if (variant === 'report') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <svg width={48} height={48} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="50" fill={color}/>
          <path d="M50 18 L82 42 L82 82 L18 82 L18 42 Z" fill="rgba(255,255,255,0.95)"/>
          <rect x="38" y="58" width="14" height="24" rx="2" fill={color} opacity="0.9"/>
          <rect x="20" y="50" width="12" height="11" rx="2" fill={color} opacity="0.7"/>
          <rect x="68" y="50" width="12" height="11" rx="2" fill={color} opacity="0.7"/>
          <ellipse cx="63" cy="38" rx="8" ry="5" fill={color} opacity="0.8" transform="rotate(-30 63 38)"/>
          <line x1="63" y1="43" x2="63" y2="55" stroke={color} strokeWidth="2" opacity="0.7"/>
          <circle cx="30" cy="28" r="5" fill="rgba(255,220,100,0.9)"/>
          <rect x="10" y="80" width="80" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
        </svg>
        <div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 700, color: textColor, lineHeight: 1.1 }}>
            Concession Mugogo
          </div>
          <div style={{ fontSize: '11px', color: '#8c6e3f', marginTop: '2px', letterSpacing: '.04em' }}>
            Gestion Agro-pastorale Intégrée — Walungu, Sud-Kivu, RDC
          </div>
        </div>
      </div>
    )
  }

  if (withText) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {IconSVG}
        <div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: `${s * 0.38}px`, fontWeight: 700, color: textColor, lineHeight: 1.2 }}>
            Concession Mugogo
          </div>
          <div style={{ fontSize: `${s * 0.24}px`, color: '#8c6e3f', marginTop: '1px' }}>
            Walungu, Sud-Kivu
          </div>
        </div>
      </div>
    )
  }

  return IconSVG
}

// Report header HTML string for PDF/Word download
export function getReportLogoHTML(color = '#8c6e3f'): string {
  return `
<div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;padding-bottom:16px;border-bottom:3px solid ${color}">
  <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="${color}"/>
    <path d="M50 18 L82 42 L82 82 L18 82 L18 42 Z" fill="rgba(255,255,255,0.95)"/>
    <rect x="38" y="58" width="14" height="24" rx="2" fill="${color}" opacity="0.9"/>
    <rect x="20" y="50" width="12" height="11" rx="2" fill="${color}" opacity="0.7"/>
    <rect x="68" y="50" width="12" height="11" rx="2" fill="${color}" opacity="0.7"/>
    <ellipse cx="63" cy="38" rx="8" ry="5" fill="${color}" opacity="0.8" transform="rotate(-30 63 38)"/>
    <line x1="63" y1="43" x2="63" y2="55" stroke="${color}" stroke-width="2" opacity="0.7"/>
    <circle cx="30" cy="28" r="5" fill="rgba(255,220,100,0.9)"/>
    <rect x="10" y="80" width="80" height="4" rx="2" fill="rgba(255,255,255,0.4)"/>
  </svg>
  <div>
    <div style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:${color};line-height:1.1">Concession Mugogo</div>
    <div style="font-size:12px;color:#666;margin-top:3px">Gestion Agro-pastorale Intégrée — Walungu, Sud-Kivu, RDC</div>
    <div style="font-size:11px;color:#888;margin-top:2px">Tél: +243 976960983 | richardbunani2013@gmail.com</div>
  </div>
</div>`
}
