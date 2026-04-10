import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, ArrowLeft, AlertCircle, Loader2, Shield } from 'lucide-react'
import { useAuthStore } from '@/context/authStore'
import { useTranslation } from 'react-i18next'
import { changeLanguage } from '@/i18n'
import { MugogoLogo } from '@/components/ui/MugogoLogo'

// ALL authorized users — hardcoded, no localStorage dependency
const ALL_USERS = [
  { id:'admin-1', email:'richardbunani2013@gmail.com', password:'Mugogo@2025!', fullName:'Richard Bunani',    role:'super_admin'       as const, phone:'+243 976960983', language:'fr' as const, label:'Propriétaire' },
  { id:'usr-2',   email:'pierre@mugogo.cd',            password:'Pierre@2025!', fullName:'Pierre Lwambo',     role:'livestock_manager' as const, phone:'+243 81 234 5679', language:'fr' as const, label:'Resp. Élevage' },
  { id:'usr-3',   email:'marie@mugogo.cd',             password:'Marie@2025!',  fullName:'Marie Kahindo',     role:'farmer'            as const, phone:'+243 81 234 5680', language:'fr' as const, label:'Cultivateur' },
  { id:'usr-4',   email:'david@mugogo.cd',             password:'David@2025!',  fullName:'Dr. David Shabani', role:'vet'               as const, phone:'+243 81 234 5681', language:'fr' as const, label:'Vétérinaire' },
  { id:'usr-5',   email:'joseph@mugogo.cd',            password:'Joseph@2025!', fullName:'Joseph Mutombo',    role:'accountant'        as const, phone:'+243 81 234 5682', language:'fr' as const, label:'Comptable' },
]

const LANGS = [
  { code: 'fr',    label: 'Français'  },
  { code: 'en',    label: 'English'   },
  { code: 'sw',    label: 'Kiswahili' },
  { code: 'mashi', label: 'Mashi'     },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuthStore()
  const { t, i18n } = useTranslation()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [lang,     setLang]     = useState(i18n.language || 'fr')
  const [fieldErr, setFieldErr] = useState<{email?:string;password?:string}>({})
  const [attempts, setAttempts] = useState(0)
  const [locked,   setLocked]   = useState(false)
  const [lockSec,  setLockSec]  = useState(0)
  const [shake,    setShake]    = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAuthenticated) navigate('/tableau-de-bord', { replace: true })
  }, [isAuthenticated])

  useEffect(() => { emailRef.current?.focus() }, [])

  useEffect(() => {
    const saved = localStorage.getItem('mugogo_remember')
    if (saved) { setEmail(saved); setRemember(true) }
  }, [])

  useEffect(() => {
    if (!locked) return
    const timer = setInterval(() => setLockSec(s => {
      if (s <= 1) { setLocked(false); return 0 }
      return s - 1
    }), 1000)
    return () => clearInterval(timer)
  }, [locked])

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
    await new Promise(r => setTimeout(r, 600))

    const emailLower = email.trim().toLowerCase()
    // Check against ALL_USERS — completely hardcoded, no localStorage needed
    const found = ALL_USERS.find(u =>
      u.email.toLowerCase() === emailLower && u.password === password
    )

    if (found) {
      if (remember) localStorage.setItem('mugogo_remember', email)
      else localStorage.removeItem('mugogo_remember')
      login({
        id: found.id,
        fullName: found.fullName,
        email: found.email,
        phone: found.phone,
        role: found.role,
        language: lang as any,
      }, `mugogo_token_${found.role}_${Date.now()}`)
      navigate('/tableau-de-bord', { replace: true })
    } else {
      const next = attempts + 1; setAttempts(next)
      if (next >= 5) {
        setLocked(true); setLockSec(30)
        setError('Compte bloqué 30 secondes après 5 tentatives.')
      } else {
        setError(`${t('auth.loginError', 'Email ou mot de passe incorrect')}. ${5 - next} essai(s) restant(s).`)
      }
      doShake()
    }
    setLoading(false)
  }

  const fillUser = (u: typeof ALL_USERS[0]) => {
    setEmail(u.email); setPassword(u.password); setError(''); setFieldErr({})
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--b50)', fontFamily:'system-ui,sans-serif' }}>
      <style>{`
        @keyframes authUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes authShake{ 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        .au1{animation:authUp .5s .05s ease both} .au2{animation:authUp .5s .12s ease both}
        .au3{animation:authUp .5s .18s ease both} .au4{animation:authUp .5s .24s ease both}
        .spin{animation:spin 1s linear infinite}
        .shake{animation:authShake .45s ease}
        .inp{width:100%;padding:11px 12px 11px 38px;background:var(--surface2);border:1.5px solid var(--border);border-radius:11px;font-size:.9rem;color:var(--text);font-family:inherit;transition:all .13s;outline:none}
        .inp:focus{border-color:var(--accent);background:white;box-shadow:0 0 0 3px rgba(140,110,63,.1)}
        .inp.err{border-color:var(--err)}
        .inp-wrap{position:relative}
        .inp-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);pointer-events:none}
      `}</style>

      {/* LEFT PANEL */}
      <div style={{ width:'42%', minWidth:'300px', background:'var(--b800)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'3rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'320px', height:'320px', borderRadius:'50%', background:'var(--b700)', opacity:.5 }}/>
        <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:'260px', height:'260px', borderRadius:'50%', background:'var(--b600)', opacity:.35 }}/>
        <div style={{ position:'relative', zIndex:2, maxWidth:'380px', textAlign:'center' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'1.5rem' }}>
            <MugogoLogo size={80} color="rgba(255,255,255,0.85)"/>
          </div>
          <h1 style={{ fontFamily:'Georgia,serif', fontSize:'1.9rem', fontWeight:700, color:'white', marginBottom:'.75rem', lineHeight:1.2 }}>
            Concession<br/>Mugogo
          </h1>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,.55)', marginBottom:'.3rem' }}>Walungu, Sud-Kivu, RDC</p>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,.55)', marginBottom:'.3rem' }}>+243 976960983</p>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,.55)', marginBottom:'1.5rem' }}>richardbunani2013@gmail.com</p>
          <div style={{ width:'36px', height:'2px', background:'var(--b400)', borderRadius:'99px', margin:'0 auto 1.5rem' }}/>
          <div style={{ display:'flex', flexDirection:'column', gap:'9px', textAlign:'left' }}>
            {[
              t('auth.feature1','Gestion complète du cheptel et élevage'),
              t('auth.feature2','Suivi des cultures, saisons et récoltes'),
              t('auth.feature3','Finance, RH et paiement des salaires'),
              t('auth.feature4','Rapports PDF et Word téléchargeables'),
              lang==='fr' ? 'Interface 4 langues FR / EN / SW / Mashi' :
              lang==='en' ? '4 languages: FR / EN / Swahili / Mashi' :
              lang==='sw' ? 'Lugha 4: FR / EN / SW / Mashi' :
              'Indimi 4: FR / EN / SW / Mashi',
            ].map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                <div style={{ width:'16px', height:'16px', borderRadius:'50%', background:'rgba(255,255,255,.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,.68)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position:'absolute', bottom:'1.5rem', left:'50%', transform:'translateX(-50%)', display:'flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,.07)', borderRadius:'99px', padding:'5px 12px', whiteSpace:'nowrap' }}>
          <Shield size={11} style={{ color:'rgba(255,255,255,.55)' }}/>
          <span style={{ fontSize:'10.5px', color:'rgba(255,255,255,.55)' }}>
            {lang==='en' ? 'Secure connection — 8h session' : 'Connexion sécurisée — Session 8h'}
          </span>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:'420px' }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:'5px', fontSize:'.82rem', color:'var(--muted)', textDecoration:'none', marginBottom:'2rem' }}
            onMouseEnter={e => (e.currentTarget.style.color='var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color='var(--muted)')}>
            <ArrowLeft size={13}/>
            {lang==='en' ? 'Back to home' : lang==='sw' ? 'Rudi nyumbani' : lang==='mashi' ? 'Garuka inzu' : 'Retour à l\'accueil'}
          </Link>

          <div className="au1" style={{ marginBottom:'1.75rem' }}>
            <h2 style={{ fontFamily:'Georgia,serif', fontSize:'1.85rem', fontWeight:700, color:'var(--text)', marginBottom:'.375rem' }}>
              {lang==='en' ? 'Sign In' : lang==='sw' ? 'Ingia' : lang==='mashi' ? 'Injira' : 'Connexion'}
            </h2>
            <p style={{ fontSize:'.88rem', color:'var(--muted)' }}>
              {lang==='en' ? 'Access your farm management workspace' : lang==='sw' ? 'Ingia katika nafasi yako ya usimamizi' : lang==='mashi' ? 'Injira mu kibanza cawe' : 'Accédez à votre espace de gestion'}
            </p>
          </div>

          {/* Lang selector */}
          <div className="au2" style={{ display:'flex', gap:'5px', marginBottom:'1.5rem' }}>
            {LANGS.map(l => (
              <button key={l.code} onClick={() => handleLang(l.code)}
                style={{ flex:1, padding:'7px 4px', borderRadius:'9px', border:`1.5px solid ${lang===l.code?'var(--accent)':'var(--border)'}`, background:lang===l.code?'var(--accentS)':'white', color:lang===l.code?'var(--accent)':'var(--muted)', fontSize:'.72rem', fontWeight:700, cursor:'pointer', transition:'all .12s' }}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className={shake?'shake':''} style={{ display:'flex', alignItems:'flex-start', gap:'8px', padding:'10px 13px', borderRadius:'11px', background:'var(--errBg)', border:'1px solid var(--err)', marginBottom:'1.25rem' }}>
              <AlertCircle size={14} style={{ color:'var(--err)', flexShrink:0, marginTop:'1px' }}/>
              <p style={{ fontSize:'.82rem', color:'var(--err)', fontWeight:500, lineHeight:1.45 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="au3" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {/* Email */}
            <div>
              <label style={{ display:'block', fontSize:'.73rem', fontWeight:700, color:'var(--muted)', marginBottom:'.3rem', textTransform:'uppercase', letterSpacing:'.04em' }}>
                {lang==='en'?'Email':lang==='sw'?'Barua pepe':lang==='mashi'?'Imeyili':'Email'}
              </label>
              <div className="inp-wrap">
                <Mail size={14} className="inp-ico" style={{ color:'var(--light)' }}/>
                <input ref={emailRef} type="text" value={email}
                  placeholder={lang==='en'?'your@email.com':'richardbunani2013@gmail.com'}
                  onChange={e => { setEmail(e.target.value); setFieldErr(p=>({...p,email:undefined})) }}
                  className={`inp${fieldErr.email?' err':''}`}/>
              </div>
              {fieldErr.email && <p style={{ fontSize:'.72rem', color:'var(--err)', marginTop:'3px' }}>{fieldErr.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label style={{ display:'block', fontSize:'.73rem', fontWeight:700, color:'var(--muted)', marginBottom:'.3rem', textTransform:'uppercase', letterSpacing:'.04em' }}>
                {lang==='en'?'Password':lang==='sw'?'Nywila':lang==='mashi'?'Ijambo ry\'ibanga':'Mot de passe'}
              </label>
              <div className="inp-wrap">
                <Lock size={14} className="inp-ico" style={{ color:'var(--light)' }}/>
                <input type={showPass?'text':'password'} value={password} placeholder="••••••••"
                  onChange={e => { setPassword(e.target.value); setFieldErr(p=>({...p,password:undefined})) }}
                  className={`inp${fieldErr.password?' err':''}`} style={{ paddingRight:'40px' }}/>
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--light)', padding:'3px' }}>
                  {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
              {fieldErr.password && <p style={{ fontSize:'.72rem', color:'var(--err)', marginTop:'3px' }}>{fieldErr.password}</p>}
            </div>

            {/* Remember + Forgot */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <label style={{ display:'flex', alignItems:'center', gap:'7px', cursor:'pointer', fontSize:'.84rem', color:'var(--muted)' }}>
                <div onClick={() => setRemember(!remember)}
                  style={{ width:'17px', height:'17px', borderRadius:'5px', border:`2px solid ${remember?'var(--accent)':'var(--border)'}`, background:remember?'var(--accent)':'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .12s', flexShrink:0 }}>
                  {remember && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                {lang==='en'?'Remember me':lang==='sw'?'Nikumbuke':lang==='mashi'?'Ninkumbuke':'Se souvenir de moi'}
              </label>
              <Link to="/mot-de-passe-oublie" style={{ fontSize:'.84rem', color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>
                {lang==='en'?'Forgot password?':lang==='sw'?'Umesahau nywila?':lang==='mashi'?'Nasanze ijambo?':'Mot de passe oublié ?'}
              </Link>
            </div>

            {/* Lock bar */}
            {locked && (
              <div>
                <div style={{ height:'4px', background:'var(--b200)', borderRadius:'99px', overflow:'hidden', marginBottom:'4px' }}>
                  <div style={{ height:'100%', background:'var(--err)', borderRadius:'99px', width:`${(lockSec/30)*100}%`, transition:'width 1s linear' }}/>
                </div>
                <p style={{ fontSize:'.74rem', color:'var(--muted)', textAlign:'center' }}>{lockSec}s...</p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading||locked}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'13px', borderRadius:'12px', background:locked?'var(--b300)':'var(--accent)', color:'white', border:'none', fontSize:'.95rem', fontWeight:700, cursor:locked||loading?'not-allowed':'pointer', transition:'all .15s', boxShadow:locked?'none':'0 4px 14px rgba(140,110,63,.28)' }}>
              {loading ? <><Loader2 size={15} className="spin"/>{lang==='en'?'Verifying...':lang==='sw'?'Inakagua...':lang==='mashi'?'Birashakishwa...':'Vérification...'}</>
              : locked ? `${lockSec}s...`
              : lang==='en'?'Sign In':lang==='sw'?'Ingia':lang==='mashi'?'Injira':'Se connecter'}
            </button>

            <p style={{ textAlign:'center', fontSize:'.84rem', color:'var(--muted)' }}>
              {lang==='en'?'No account?':lang==='sw'?'Huna akaunti?':lang==='mashi'?'Nta konti?':'Pas de compte ?'}{' '}
              <Link to="/inscription" style={{ color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>
                {lang==='en'?'Request access':lang==='sw'?'Omba ruhusa':lang==='mashi'?'Saba uburenganzira':'Demander un accès'}
              </Link>
            </p>
          </form>

          {/* Quick access */}
          <div className="au4" style={{ marginTop:'1.5rem', padding:'.875rem 1rem', background:'var(--b100)', borderRadius:'12px', border:'1px solid var(--b200)' }}>
            <p style={{ fontSize:'.72rem', fontWeight:700, color:'var(--b600)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'.625rem' }}>
              {lang==='en'?'Quick access':lang==='sw'?'Ufikiaji wa haraka':lang==='mashi'?'Kugera vite':'Accès rapide'}
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
              {ALL_USERS.map((u, i) => (
                <button key={i} onClick={() => fillUser(u)}
                  style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 9px', borderRadius:'9px', border:'1px solid var(--b300)', background:'white', cursor:'pointer', transition:'all .12s', width:'100%', textAlign:'left' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='var(--accentS)'; (e.currentTarget as HTMLElement).style.borderColor='var(--accent)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='white'; (e.currentTarget as HTMLElement).style.borderColor='var(--b300)' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'var(--accentS)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'.82rem', flexShrink:0 }}>
                    {u.fullName.charAt(0)}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:'.82rem', fontWeight:700, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.fullName}</p>
                    <p style={{ fontSize:'.72rem', color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</p>
                  </div>
                  <span style={{ fontSize:'.68rem', fontWeight:700, padding:'2px 6px', borderRadius:'99px', background:i===0?'var(--accent)':'var(--b200)', color:i===0?'white':'var(--b700)', flexShrink:0 }}>
                    {u.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p style={{ textAlign:'center', fontSize:'.74rem', color:'var(--light)', marginTop:'1.5rem' }}>
            © 2025 Concession Mugogo — Walungu, Sud-Kivu
          </p>
        </div>
      </div>
    </div>
  )
}
