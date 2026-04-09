import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, ArrowLeft, AlertCircle, Loader2, Shield } from 'lucide-react'
import { useAuthStore } from '@/context/authStore'
import { useExtraStore } from '@/store/extraStore'
import { useTranslation } from 'react-i18next'
import { changeLanguage } from '@/i18n'

// Hardcoded admin — always works regardless of localStorage
const ADMIN = {
  id: 'admin-1',
  email: 'richardbunani2013@gmail.com',
  password: 'Mugogo@2025!',
  fullName: 'Richard Bunani',
  role: 'super_admin' as const,
  language: 'fr' as const,
  phone: '+243 976960983',
}

const LANGS = [
  { code: 'fr',    label: 'Français'  },
  { code: 'en',    label: 'English'   },
  { code: 'sw',    label: 'Kiswahili' },
  { code: 'mashi', label: 'Mashi'     },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuthStore()
  const { managedUsers } = useExtraStore()
  const { t, i18n } = useTranslation()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [lang,     setLang]     = useState(i18n.language || 'fr')
  const [fieldErr, setFieldErr] = useState<{email?: string; password?: string}>({})
  const [attempts, setAttempts] = useState(0)
  const [locked,   setLocked]   = useState(false)
  const [lockSec,  setLockSec]  = useState(0)
  const [shake,    setShake]    = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (isAuthenticated) navigate('/tableau-de-bord', { replace: true }) }, [isAuthenticated])
  useEffect(() => { emailRef.current?.focus() }, [])
  useEffect(() => {
    const saved = localStorage.getItem('mugogo_remember')
    if (saved) { setEmail(saved); setRemember(true) }
  }, [])
  useEffect(() => {
    if (!locked || lockSec <= 0) return
    const t = setInterval(() => setLockSec(s => { if (s <= 1) { setLocked(false); return 0 } return s - 1 }), 1000)
    return () => clearInterval(t)
  }, [locked, lockSec])

  const handleLang = (code: string) => {
    setLang(code)
    changeLanguage(code)
  }

  const validate = () => {
    const e: typeof fieldErr = {}
    if (!email.trim()) e.email = t('common.required', 'Email requis')
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Email invalide'
    if (!password) e.password = t('common.required', 'Mot de passe requis')
    else if (password.length < 6) e.password = 'Minimum 6 caractères'
    setFieldErr(e)
    return Object.keys(e).length === 0
  }

  const doShake = () => { setShake(true); setTimeout(() => setShake(false), 500) }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (locked) return
    if (!validate()) { doShake(); return }
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 700))

    const emailLower = email.trim().toLowerCase()

    // 1. Always check hardcoded admin first
    let found: any = null
    if (emailLower === ADMIN.email.toLowerCase() && password === ADMIN.password) {
      found = ADMIN
    }

    // 2. Check other managed users from store
    if (!found) {
      const match = managedUsers.find(u =>
        u.email.toLowerCase() === emailLower && u.password === password && u.status === 'active'
      )
      if (match) found = { ...match, role: match.role as any }
    }

    if (found) {
      if (remember) localStorage.setItem('mugogo_remember', email)
      else localStorage.removeItem('mugogo_remember')
      login({
        id: found.id || found.id,
        fullName: found.fullName,
        email: found.email,
        phone: found.phone || '',
        role: found.role,
        language: found.language || (lang as any),
      }, `token_${found.role}_${Date.now()}`)
      navigate('/tableau-de-bord', { replace: true })
    } else {
      const next = attempts + 1; setAttempts(next)
      if (next >= 5) {
        setLocked(true); setLockSec(30)
        setError('Compte bloqué après 5 tentatives. Attendez 30 secondes.')
      } else {
        setError(`${t('auth.loginError', 'Identifiants incorrects')}. ${5 - next} tentative(s) restante(s).`)
      }
      doShake()
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--b50)', fontFamily: 'system-ui,sans-serif' }}>
      <style>{`
        @keyframes authUp   { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        @keyframes authShake{ 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-7px)} 40%,80%{transform:translateX(7px)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes breathe  { 0%,100%{transform:scale(1)}50%{transform:scale(1.04)} }
        .au1{animation:authUp .5s .05s ease both}.au2{animation:authUp .5s .12s ease both}
        .au3{animation:authUp .5s .18s ease both}.au4{animation:authUp .5s .24s ease both}
        .spin{animation:spin 1s linear infinite}
        .shake{animation:authShake .45s ease}
        .inp{width:100%;padding:11px 12px 11px 38px;background:var(--surface2);border:1.5px solid var(--border);border-radius:11px;font-size:.9rem;color:var(--text);font-family:inherit;transition:all .13s;outline:none}
        .inp:focus{border-color:var(--accent);background:white;box-shadow:0 0 0 3px rgba(140,110,63,.1)}
        .inp.err{border-color:var(--err)}
        .inp-wrap{position:relative}
        .inp-wrap .ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--light);pointer-events:none}
      `}</style>

      {/* Left panel */}
      <div style={{ width: '42%', minWidth: '300px', background: 'var(--b800)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'var(--b700)', opacity: .5 }}/>
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'var(--b600)', opacity: .35 }}/>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '380px', textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '22px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.9rem', fontWeight: 700, color: 'white', marginBottom: '.75rem', lineHeight: 1.2 }}>
            Concession<br/>Mugogo
          </h1>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.55)', marginBottom: '.3rem' }}>Walungu, Sud-Kivu, RDC</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.55)', marginBottom: '.3rem' }}>+243 976960983</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,.55)', marginBottom: '1.5rem' }}>richardbunani2013@gmail.com</p>
          <div style={{ width: '36px', height: '2px', background: 'var(--b400)', borderRadius: '99px', margin: '0 auto 1.5rem' }}/>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', textAlign: 'left' }}>
            {[
              'Gestion complète du cheptel et élevage',
              'Suivi des cultures, saisons et récoltes',
              'Finance, RH et paiement des salaires',
              'Rapports PDF et Word téléchargeables',
              'Interface 4 langues FR / EN / SW / Mashi',
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.68)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,.07)', borderRadius: '99px', padding: '5px 12px', whiteSpace: 'nowrap' }}>
          <Shield size={11} style={{ color: 'rgba(255,255,255,.55)' }}/>
          <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,.55)' }}>Connexion sécurisée — Session 8h</span>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '.82rem', color: 'var(--muted)', textDecoration: 'none', marginBottom: '2rem' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
            <ArrowLeft size={13}/> {t('nav.home', 'Retour à l\'accueil')}
          </Link>

          <div className="au1" style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '.375rem' }}>{t('auth.login', 'Connexion')}</h2>
            <p style={{ fontSize: '.88rem', color: 'var(--muted)' }}>{t('auth.loginSubtitle', 'Accédez à votre espace de gestion')}</p>
          </div>

          {/* Language selector */}
          <div className="au2" style={{ display: 'flex', gap: '5px', marginBottom: '1.5rem' }}>
            {LANGS.map(l => (
              <button key={l.code} onClick={() => handleLang(l.code)}
                style={{ flex: 1, padding: '7px 4px', borderRadius: '9px', border: `1.5px solid ${lang === l.code ? 'var(--accent)' : 'var(--border)'}`, background: lang === l.code ? 'var(--accentS)' : 'white', color: lang === l.code ? 'var(--accent)' : 'var(--muted)', fontSize: '.72rem', fontWeight: 700, cursor: 'pointer', transition: 'all .12s' }}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className={shake ? 'shake' : ''} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 13px', borderRadius: '11px', background: 'var(--errBg)', border: '1px solid var(--err)', marginBottom: '1.25rem' }}>
              <AlertCircle size={14} style={{ color: 'var(--err)', flexShrink: 0, marginTop: '1px' }}/>
              <p style={{ fontSize: '.82rem', color: 'var(--err)', fontWeight: 500, lineHeight: 1.45 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="au3" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '.73rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>{t('auth.email', 'Email')}</label>
              <div className="inp-wrap">
                <Mail size={14} className="ico"/>
                <input ref={emailRef} type="text" value={email} placeholder="richardbunani2013@gmail.com"
                  onChange={e => { setEmail(e.target.value); setFieldErr(p => ({...p, email: undefined})) }}
                  className={`inp${fieldErr.email ? ' err' : ''}`}/>
              </div>
              {fieldErr.email && <p style={{ fontSize: '.72rem', color: 'var(--err)', marginTop: '3px' }}>{fieldErr.email}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '.73rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>{t('auth.password', 'Mot de passe')}</label>
              <div className="inp-wrap">
                <Lock size={14} className="ico"/>
                <input type={showPass ? 'text' : 'password'} value={password} placeholder="••••••••"
                  onChange={e => { setPassword(e.target.value); setFieldErr(p => ({...p, password: undefined})) }}
                  className={`inp${fieldErr.password ? ' err' : ''}`} style={{ paddingRight: '40px' }}/>
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--light)', padding: '3px' }}>
                  {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
              {fieldErr.password && <p style={{ fontSize: '.72rem', color: 'var(--err)', marginTop: '3px' }}>{fieldErr.password}</p>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '.84rem', color: 'var(--muted)' }}>
                <div onClick={() => setRemember(!remember)}
                  style={{ width: '17px', height: '17px', borderRadius: '5px', border: `2px solid ${remember ? 'var(--accent)' : 'var(--border)'}`, background: remember ? 'var(--accent)' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .12s', flexShrink: 0 }}>
                  {remember && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                {t('auth.rememberMe', 'Se souvenir de moi')}
              </label>
              <Link to="/mot-de-passe-oublie" style={{ fontSize: '.84rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                {t('auth.forgotPassword', 'Mot de passe oublié ?')}
              </Link>
            </div>

            {locked && (
              <div>
                <div style={{ height: '4px', background: 'var(--b200)', borderRadius: '99px', overflow: 'hidden', marginBottom: '4px' }}>
                  <div style={{ height: '100%', background: 'var(--err)', borderRadius: '99px', width: `${(lockSec / 30) * 100}%`, transition: 'width 1s linear' }}/>
                </div>
                <p style={{ fontSize: '.74rem', color: 'var(--muted)', textAlign: 'center' }}>{lockSec}s...</p>
              </div>
            )}

            <button type="submit" disabled={loading || locked}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', borderRadius: '12px', background: locked ? 'var(--b300)' : 'var(--accent)', color: 'white', border: 'none', fontSize: '.95rem', fontWeight: 700, cursor: locked || loading ? 'not-allowed' : 'pointer', transition: 'all .15s', boxShadow: locked ? 'none' : '0 4px 14px rgba(140,110,63,.28)' }}>
              {loading ? <><Loader2 size={15} className="spin"/> {t('common.loading', 'Vérification...')}</>
              : locked  ? `${lockSec}s...`
              : t('auth.login', 'Se connecter')}
            </button>

            <p style={{ textAlign: 'center', fontSize: '.84rem', color: 'var(--muted)' }}>
              {t('auth.noAccount', 'Pas encore de compte ?')}{' '}
              <Link to="/inscription" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                {t('auth.register', 'Demander un accès')}
              </Link>
            </p>
          </form>

          {/* Admin quick access */}
          <div className="au4" style={{ marginTop: '1.5rem', padding: '.875rem 1rem', background: 'var(--b100)', borderRadius: '12px', border: '1px solid var(--b200)' }}>
            <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--b600)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.625rem' }}>
              Accès rapide
            </p>
            <button onClick={() => { setEmail(ADMIN.email); setPassword(ADMIN.password); setError(''); setFieldErr({}) }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '9px', border: '1px solid var(--b300)', background: 'white', cursor: 'pointer', transition: 'all .12s', width: '100%', textAlign: 'left' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accentS)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--b300)' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accentS)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.82rem', flexShrink: 0 }}>R</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text)' }}>Richard Bunani</p>
                <p style={{ fontSize: '.72rem', color: 'var(--muted)' }}>richardbunani2013@gmail.com</p>
              </div>
              <span style={{ fontSize: '.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: '99px', background: 'var(--accent)', color: 'white' }}>Propriétaire</span>
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '.74rem', color: 'var(--light)', marginTop: '1.5rem' }}>
            © 2025 Concession Mugogo — Walungu, Sud-Kivu
          </p>
        </div>
      </div>
    </div>
  )
}
