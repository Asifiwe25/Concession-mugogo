import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import i18n, { changeLanguage as doChange } from '@/i18n'

interface LanguageContextType {
  lang: string
  setLang: (lang: string) => void
  langs: Array<{ code: string; label: string; flag: string }>
}

const LANGS = [
  { code: 'fr',    label: 'Français',  flag: 'FR' },
  { code: 'en',    label: 'English',   flag: 'EN' },
  { code: 'sw',    label: 'Kiswahili', flag: 'SW' },
  { code: 'mashi', label: 'Mashi',     flag: 'SH' },
]

const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  setLang: () => {},
  langs: LANGS,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState(
    localStorage.getItem('mugogo_lang') || 'fr'
  )

  const setLang = useCallback((code: string) => {
    setLangState(code)
    doChange(code)
  }, [])

  // Sync when i18n changes from outside
  useEffect(() => {
    const handler = () => setLangState(i18n.language)
    i18n.on('languageChanged', handler)
    return () => i18n.off('languageChanged', handler)
  }, [])

  return (
    <LanguageContext.Provider value={{ lang, setLang, langs: LANGS }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)

// Reusable language switcher component
export function LangSwitcher({ style }: { style?: React.CSSProperties }) {
  const { lang, setLang, langs } = useLang()
  return (
    <div style={{ display: 'flex', gap: '3px', ...style }}>
      {langs.map(l => (
        <button key={l.code} onClick={() => setLang(l.code)} title={l.label}
          style={{
            padding: '5px 8px', borderRadius: '7px', border: '1px solid',
            fontSize: '10px', fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
            background:  lang === l.code ? 'var(--accent)' : 'transparent',
            color:       lang === l.code ? 'white' : 'var(--muted)',
            borderColor: lang === l.code ? 'var(--accent)' : 'var(--border)',
          }}>
          {l.flag}
        </button>
      ))}
    </div>
  )
}
