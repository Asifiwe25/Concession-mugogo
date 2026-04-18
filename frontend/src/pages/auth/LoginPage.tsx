import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, ArrowLeft, AlertCircle, Loader2, Shield } from 'lucide-react'
import { useAuthStore } from '@/context/authStore'
import { useTranslation } from 'react-i18next'
import { LangSwitcher, useLang } from '@/context/LanguageContext'
import { MugogoLogo } from '@/components/ui/MugogoLogo'

// ── ADMIN hardcodé — fonctionne toujours, sans localStorage ──
const ADMIN_EMAIL    = 'richardbunani2013@gmail.com'
const ADMIN_PASSWORD = 'Mugogo@2025!'
const ADMIN_USER = {
  id: 'admin-richard', fullName: 'Richard Bunani',
  email: ADMIN_EMAIL, phone: '+243 976960983',
  role: 'super_admin' as const,
}

function safeGet(k: string): string | null {
  try { return typeof window !== 'undefined' ? window.localStorage.getItem(k) : null }
  catch { return null }
}
function safeSet(k: string, v: string) {
  try { if (typeof window !== 'undefined') window.localStorage.setItem(k, v) } catch {}
}
function safeDel(k: string) {
  try { if (typeof window !== 'undefined') window.localStorage.removeItem(k) } catch {}
}

const LABELS: Record<string, Record<string, string>> = {
  fr:    { title:'Connexion', sub:'Accédez à votre espace de gestion', email:'Email', pass:'Mot de passe', remember:'Se souvenir', forgot:'Mot de passe oublié ?', submit:'Se connecter', back:'Retour à l\'accueil', noAcct:'Pas de compte ?', request:'Demander un accès', quick:'Accès rapide admin', owner:'Propriétaire', checking:'Vérification...' },
  en:    { title:'Sign In', sub:'Access your farm management space', email:'Email', pass:'Password', remember:'Remember me', forgot:'Forgot password?', submit:'Sign In', back:'Back to home', noAcct:'No account?', request:'Request access', quick:'Admin quick access', owner:'Owner', checking:'Checking...' },
  sw:    { title:'Ingia', sub:'Ingia katika nafasi yako ya usimamizi', email:'Barua pepe', pass:'Nywila', remember:'Nikumbuke', forgot:'Umesahau nywila?', submit:'Ingia', back:'Rudi nyumbani', noAcct:'Huna akaunti?', request:'Omba ufikiaji', quick:'Ufikiaji wa haraka', owner:'Mmiliki', checking:'Inakagua...' },
  mashi: { title:'Injira', sub:'Injira mu kibanza cawe', email:'Imeyili', pass:'Ijambo ry\'ibanga', remember:'Ninkumbuke', forgot:'Nasanze ijambo?', submit:'Injira', back:'Garuka inzu', noAcct:'Nta konti?', request:'Saba uburenganzira', quick:'Kugera vite', owner:'Nyir\'ikirima', checking:'Birashakishwa...' },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuthStore()
  const { t } = useTranslation()
  const { lang, setLang, langs } = useLang()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [attempts, setAttempts] = useState(0)
  const [locked,   setLocked]   = useState(false)
  const [lockSec,  setLockSec]  = useState(0)
  const [shake,    setShake]    = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const L = LABELS[lang] || LABELS.fr

  useEffect(() => { if (isAuthenticated) navigate('/tableau-de-bord', { replace: true }) }, [isAuthenticated])
  useEffect(() => { emailRef.current?.focus() }, [])
  useEffect(() => {
    const saved = safeGet('mugogo_remember')
    if (saved) { setEmail(saved); setRemember(true) }
  }, [])
  useEffect(() => {
    if (!locked) return
    const id = setInterval(() => setLockSec(s => { if (s <= 1) { setLocked(false); return 0 } return s - 1 }), 1000)
    return () => clearInterval(id)
  }, [locked])

  const doShake = () => { setShake(true); setTimeout(() => setShake(false), 500) }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (locked) return
    if (!email.trim() || !password) { doShake(); return }
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 400))

    const em = email.trim().toLowerCase().replace(/\s/g, '')
    let found: any = null

    // Check admin — hardcoded, works 100% on Vercel
    if (em === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      found = { ...ADMIN_USER, language: lang as any }
    }

    // Check users created by admin
    if (!found) {
      try {
        const raw = safeGet('mugogo_managed_users')
        if (raw) {
          const users: any[] = JSON.parse(raw)
          const u = users.find(u => u.email?.trim().toLowerCase() === em && u.password === password && u.status !== 'suspended')
          if (u) found = { ...u, language: lang as any }
        }
      } catch {}
    }

    if (found) {
      if (remember) safeSet('mugogo_remember', email.trim())
      else safeDel('mugogo_remember')
      login({ id: found.id, fullName: found.fullName, email: found.email, phone: found.phone || '', role: found.role, language: found.language || 'fr' }, `mk_${found.role}_${Date.now()}`)
      navigate('/tableau-de-bord', { replace: true })
    } else {
      const n = attempts + 1; setAttempts(n)
      if (n >= 5) { setLocked(true); setLockSec(30); setError('Bloqué 30s après 5 tentatives.') }
      else setError(`Email ou mot de passe incorrect — ${5-n} essai(s) restant(s).`)
      doShake()
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'var(--b50)', fontFamily:'system-ui,sans-serif' }}>
      <style>{`
        @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shk{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .au1{animation:up .5s .05s both}.au2{animation:up .5s .1s both}.au3{animation:up .5s .18s both}.au4{animation:up .5s .26s both}
        .shake{animation:shk .45s ease}.spin{animation:spin 1s linear infinite}
        .inp{width:100%;padding:11px 12px 11px 38px;background:var(--surface2);border:1.5px solid var(--border);border-radius:11px;font-size:16px;color:var(--text);transition:all .13s;outline:none;font-family:inherit}
        .inp:focus{border-color:var(--accent);background:white;box-shadow:0 0 0 3px rgba(140,110,63,.12)}
        .inp.err{border-color:var(--err)}
        .ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--light)}
        @media(max-width:640px){.auth-left{display:none!important}.auth-right{padding:1.25rem!important;max-width:100%!important}}
      `}</style>

      {/* LEFT panel */}
      <div className="auth-left" style={{ width:'42%', minWidth:'280px', background:'var(--b800)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'3rem 2rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'300px', height:'300px', borderRadius:'50%', background:'var(--b700)', opacity:.5 }}/>
        <div style={{ position:'absolute', bottom:'-60px', left:'-60px', width:'250px', height:'250px', borderRadius:'50%', background:'var(--b600)', opacity:.4 }}/>
        <div style={{ position:'relative', zIndex:2, textAlign:'center', maxWidth:'360px' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'1.5rem' }}>
            <MugogoLogo size={88} color="rgba(255,255,255,0.9)"/>
          </div>
          <h1 style={{ fontFamily:'Georgia,serif', fontSize:'2rem', fontWeight:700, color:'white', lineHeight:1.2, marginBottom:'.5rem' }}>
            Concession<br/>Mugogo
          </h1>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,.5)', marginBottom:'2px' }}>Walungu, Sud-Kivu, RDC</p>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,.5)', marginBottom:'2px' }}>+243 976960983</p>
          <p style={{ fontSize:'12px', color:'rgba(255,255,255,.5)', marginBottom:'2rem' }}>richardbunani2013@gmail.com</p>
          <div style={{ width:'40px', height:'2px', background:'var(--b400)', borderRadius:'99px', margin:'0 auto 1.5rem' }}/>
          {[
            lang==='en' ? 'Complete livestock & crop management' : lang==='sw' ? 'Usimamizi kamili wa mifugo na mazao' : lang==='mashi' ? 'Gucunga inyamá n\'indimwa' : 'Gestion complète élevage & cultures',
            lang==='en' ? 'Finance, HR and salary payments' : lang==='sw' ? 'Fedha, HR na mishahara' : lang==='mashi' ? 'Amafaranga, ababenzi n\'imishahara' : 'Finance, RH et paiement des salaires',
            lang==='en' ? 'PDF & Word reports' : lang==='sw' ? 'Ripoti za PDF na Word' : lang==='mashi' ? 'Raporo PDF na Word' : 'Rapports PDF et Word',
            lang==='en' ? '4 languages: FR/EN/SW/Mashi' : lang==='sw' ? 'Lugha 4: FR/EN/SW/Mashi' : lang==='mashi' ? 'Indimi 4: FR/EN/SW/Mashi' : '4 langues : FR/EN/SW/Mashi',
          ].map((f, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'9px', marginBottom:'8px', textAlign:'left' }}>
              <div style={{ width:'16px', height:'16px', borderRadius:'50%', background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span style={{ fontSize:'12px', color:'rgba(255,255,255,.68)' }}>{f}</span>
            </div>
          ))}
        </div>
        <div style={{ position:'absolute', bottom:'1.5rem', display:'flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,.07)', borderRadius:'99px', padding:'5px 14px' }}>
          <Shield size={11} style={{ color:'rgba(255,255,255,.5)' }}/>
          <span style={{ fontSize:'10px', color:'rgba(255,255,255,.5)' }}>
            {lang==='en' ? 'Secure 8h session' : lang==='sw' ? 'Kikao salama cha masaa 8' : lang==='mashi' ? 'Ikirafiki amahoro amasaha 8' : 'Session sécurisée 8h'}
          </span>
        </div>
      </div>

      {/* RIGHT panel */}
      <div className="auth-right" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', overflowY:'auto' }}>
        <div style={{ width:'100%', maxWidth:'420px' }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:'5px', fontSize:'.82rem', color:'var(--muted)', textDecoration:'none', marginBottom:'2rem' }}
            onMouseEnter={e => (e.currentTarget.style.color='var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color='var(--muted)')}>
            <ArrowLeft size={13}/>{L.back}
          </Link>

          <div className="au1" style={{ marginBottom:'1.75rem' }}>
            <h2 style={{ fontFamily:'Georgia,serif', fontSize:'1.85rem', fontWeight:700, color:'var(--text)', marginBottom:'.375rem' }}>{L.title}</h2>
            <p style={{ fontSize:'.88rem', color:'var(--muted)' }}>{L.sub}</p>
          </div>

          {/* Language switcher */}
          <div className="au2" style={{ marginBottom:'1.5rem' }}>
            <LangSwitcher variant="full" style={{ gap:'5px', flexWrap:'wrap' }}/>
          </div>

          {error && (
            <div className={`au2${shake?' shake':''}`} style={{ display:'flex', alignItems:'flex-start', gap:'8px', padding:'10px 13px', borderRadius:'11px', background:'var(--errBg)', border:'1px solid var(--err)', marginBottom:'1.25rem' }}>
              <AlertCircle size={14} style={{ color:'var(--err)', flexShrink:0, marginTop:'1px' }}/>
              <p style={{ fontSize:'.82rem', color:'var(--err)', fontWeight:500, lineHeight:1.45 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="au3" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div>
              <label style={{ display:'block', fontSize:'.73rem', fontWeight:700, color:'var(--muted)', marginBottom:'.3rem', textTransform:'uppercase', letterSpacing:'.04em' }}>{L.email}</label>
              <div style={{ position:'relative' }}>
                <Mail size={14} className="ico"/>
                <input ref={emailRef} type="email" value={email} placeholder="richardbunani2013@gmail.com" autoComplete="email"
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  className="inp"/>
              </div>
            </div>

            <div>
              <label style={{ display:'block', fontSize:'.73rem', fontWeight:700, color:'var(--muted)', marginBottom:'.3rem', textTransform:'uppercase', letterSpacing:'.04em' }}>{L.pass}</label>
              <div style={{ position:'relative' }}>
                <Lock size={14} className="ico"/>
                <input type={showPass?'text':'password'} value={password} placeholder="••••••••" autoComplete="current-password"
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  className="inp" style={{ paddingRight:'40px' }}/>
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--light)', padding:'3px' }}>
                  {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>

            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <label style={{ display:'flex', alignItems:'center', gap:'7px', cursor:'pointer', fontSize:'.84rem', color:'var(--muted)' }}>
                <div onClick={() => setRemember(!remember)}
                  style={{ width:'17px', height:'17px', borderRadius:'5px', border:`2px solid ${remember?'var(--accent)':'var(--border)'}`, background:remember?'var(--accent)':'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .12s', flexShrink:0 }}>
                  {remember && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                {L.remember}
              </label>
              <Link to="/mot-de-passe-oublie" style={{ fontSize:'.84rem', color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>{L.forgot}</Link>
            </div>

            {locked && (
              <div>
                <div style={{ height:'4px', background:'var(--b200)', borderRadius:'99px', overflow:'hidden', marginBottom:'4px' }}>
                  <div style={{ height:'100%', background:'var(--err)', borderRadius:'99px', width:`${(lockSec/30)*100}%`, transition:'width 1s linear' }}/>
                </div>
                <p style={{ fontSize:'.74rem', color:'var(--muted)', textAlign:'center' }}>{lockSec}s...</p>
              </div>
            )}

            <button type="submit" disabled={loading || locked}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'14px', borderRadius:'12px', background:locked?'var(--b300)':'var(--accent)', color:'white', border:'none', fontSize:'.95rem', fontWeight:700, cursor:locked||loading?'not-allowed':'pointer', transition:'all .15s', boxShadow:locked?'none':'0 4px 14px rgba(140,110,63,.28)', minHeight:'48px' }}>
              {loading ? <><Loader2 size={15} className="spin"/>{L.checking}</> : locked ? `${lockSec}s...` : L.submit}
            </button>

            <p style={{ textAlign:'center', fontSize:'.84rem', color:'var(--muted)' }}>
              {L.noAcct}{' '}
              <Link to="/inscription" style={{ color:'var(--accent)', fontWeight:600, textDecoration:'none' }}>{L.request}</Link>
            </p>
          </form>

          {/* Quick access — Richard Bunani */}
          <div className="au4" style={{ marginTop:'1.5rem', padding:'.875rem 1rem', background:'var(--b100)', borderRadius:'12px', border:'1px solid var(--b200)' }}>
            <p style={{ fontSize:'.72rem', fontWeight:700, color:'var(--b600)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'.75rem' }}>{L.quick}</p>
            <button onClick={() => { setEmail(ADMIN_EMAIL); setPassword(ADMIN_PASSWORD); setError('') }}
              style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', borderRadius:'10px', border:'1.5px solid var(--b300)', background:'white', cursor:'pointer', transition:'all .12s', width:'100%', textAlign:'left' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='var(--accentS)'; (e.currentTarget as HTMLElement).style.borderColor='var(--accent)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='white'; (e.currentTarget as HTMLElement).style.borderColor='var(--b300)' }}>
              <div style={{ width:'38px', height:'38px', borderRadius:'50%', background:'var(--accentS)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1.1rem', flexShrink:0, border:'2px solid var(--b300)' }}>R</div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:'.9rem', fontWeight:700, color:'var(--text)' }}>Richard Bunani</p>
                <p style={{ fontSize:'.75rem', color:'var(--muted)' }}>{ADMIN_EMAIL}</p>
              </div>
              <span style={{ fontSize:'.7rem', fontWeight:700, padding:'3px 9px', borderRadius:'99px', background:'var(--accent)', color:'white', flexShrink:0 }}>{L.owner}</span>
            </button>
          </div>

          <p style={{ textAlign:'center', fontSize:'.74rem', color:'var(--light)', marginTop:'1.5rem' }}>
            © 2025 Concession Mugogo — Walungu, Sud-Kivu
          </p>
        </div>
      </div>
    </div>
  )
}
