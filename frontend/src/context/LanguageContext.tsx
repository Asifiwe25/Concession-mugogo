import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import i18n, { changeLanguage as doChange } from '@/i18n'

export const LANGS = [
  { code: 'fr',    label: 'Français',  flag: 'FR' },
  { code: 'en',    label: 'English',   flag: 'EN' },
  { code: 'sw',    label: 'Kiswahili', flag: 'SW' },
  { code: 'mashi', label: 'Mashi',     flag: 'SH' },
]

interface LangCtx {
  lang: string
  setLang: (code: string) => void
  langs: typeof LANGS
}

const LanguageContext = createContext<LangCtx>({ lang:'fr', setLang:()=>{}, langs:LANGS })

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState(localStorage.getItem('mugogo_lang') || 'fr')

  const setLang = useCallback((code: string) => {
    setLangState(code)
    doChange(code)
    localStorage.setItem('mugogo_lang', code)
    document.documentElement.lang = code
  }, [])

  // Keep in sync when changed externally
  useEffect(() => {
    const onLangChange = (lng: string) => setLangState(lng)
    i18n.on('languageChanged', onLangChange)
    return () => i18n.off('languageChanged', onLangChange)
  }, [])

  // Restore saved language on mount
  useEffect(() => {
    const saved = localStorage.getItem('mugogo_lang')
    if (saved && saved !== i18n.language) doChange(saved)
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, setLang, langs: LANGS }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)

// Reusable compact language switcher
export function LangSwitcher({ style, variant = 'compact' }: { style?: React.CSSProperties; variant?: 'compact' | 'full' }) {
  const { lang, setLang, langs } = useLang()

  if (variant === 'full') {
    return (
      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', ...style }}>
        {langs.map(l => (
          <button key={l.code} onClick={() => setLang(l.code)}
            style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 14px', borderRadius:'99px',
              border: `1.5px solid ${lang===l.code ? 'var(--accent)' : 'var(--border)'}`,
              background: lang===l.code ? 'var(--accent)' : 'transparent',
              color: lang===l.code ? 'white' : 'var(--muted)',
              cursor: 'pointer', transition: 'all .15s', fontSize: '12px', fontWeight: 700 }}>
            {l.flag} <span style={{ fontWeight: lang===l.code ? 700 : 400 }}>{l.label}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display:'flex', gap:'3px', ...style }}>
      {langs.map(l => (
        <button key={l.code} onClick={() => setLang(l.code)} title={l.label}
          style={{ padding:'5px 8px', borderRadius:'7px', border:'1px solid',
            fontSize:'10px', fontWeight:700, cursor:'pointer', transition:'all .15s',
            background:  lang===l.code ? 'var(--accent)' : 'transparent',
            color:       lang===l.code ? 'white' : 'var(--muted)',
            borderColor: lang===l.code ? 'var(--accent)' : 'var(--border)' }}>
          {l.flag}
        </button>
      ))}
    </div>
  )
}
