import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, ArrowLeft, AlertCircle, Loader2, Shield } from 'lucide-react'
import { useAuthStore } from '@/context/authStore'
import { useTranslation } from 'react-i18next'
import { LangSwitcher, useLang } from '@/context/LanguageContext'
import { MugogoLogo } from '@/components/ui/MugogoLogo'

// Safe localStorage
function lsGet(k: string) { try { return localStorage.getItem(k) } catch { return null } }
function lsSet(k: string, v: string) { try { localStorage.setItem(k, v) } catch {} }
function lsDel(k: string) { try { localStorage.removeItem(k) } catch {} }

// Admin hardcoded — always works
const ADMIN = {
  id: 'admin-richard',
  email: 'richardbunani2013@gmail.com',
  password: 'Mugogo@2025!',
  fullName: 'Richard Bunani',
  role: 'super_admin' as const,
  phone: '+243 976960983',
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
  const [fieldErr, setFieldErr] = useState<{email?:string;password?:string}>({})
  const [attempts, setAttempts] = useState(0)
  const [locked,   setLocked]   = useState(false)
  const [lockSec,  setLockSec]  = useState(0)
  const [shake,    setShake]    = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (isAuthenticated) navigate('/tableau-de-bord', { replace: true }) }, [isAuthenticated])
  useEffect(() => { emailRef.current?.focus() }, [])
  useEffect(() => {
    const saved = lsGet('mugogo_remember')
    if (saved) { setEmail(saved); setRemember(true) }
  }, [])
  useEffect(() => {
    if (!locked) return
    const id = setInterval(() => setLockSec(s => { if (s <= 1) { setLocked(false); return 0 } return s - 1 }), 1000)
    return () => clearInterval(id)
  }, [locked])

  const validate = () => {
    const e: typeof fieldErr = {}
    if (!email.trim()) e.email = 'Email requis'
    if (!password || password.length < 3) e.password = 'Mot de passe requis'
    setFieldErr(e); return Object.keys(e).length === 0
  }

  const doShake = () => { setShake(true); setTimeout(() => setShake(false), 500) }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (locked || !validate()) { doShake(); return }
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 500))

    const em = email.trim().toLowerCase()
    let found: any = null

    // 1 — Check hardcoded admin first
    if (em === ADMIN.email.toLowerCase() && password === ADMIN.password) {
      found = { ...ADMIN, language: lang as any }
    }

    // 2 — Check users created by admin (stored in localStorage by SettingsPage)
    if (!found) {
      try {
        const stored = lsGet('mugogo_managed_users')
        if (stored) {
          const users = JSON.parse(stored) as any[]
          const match = users.find((u: any) =>
            u.email?.toLowerCase() === em && u.password === password && u.status !== 'suspended'
          )
          if (match) found = { ...match, language: lang as any }
        }
      } catch {}
    }

    if (found) {
      if (remember) lsSet('mugogo_remember', email)
      else lsDel('mugogo_remember')
      login({
        id: found.id, fullName: found.fullName, email: found.email,
        phone: found.phone || '', role: found.role, language: found.language || 'fr',
      }, `mugogo_tk_${found.role}_${Date.now()}`)
      navigate('/tableau-de-bord', { replace: true })
    } else {
      const n = attempts + 1; setAttempts(n)
      if (n >= 5) { setLocked(true); setLockSec(30); setError('Bloqué 30s après 5 tentatives.') }
      else setError(`${t('auth.loginError','Email ou mot de passe incorrect')} — ${5-n} essai(s).`)
      doShake()
    }
    setLoading(false)
  }

  const T = {
    title:    lang==='en'?'Sign In':lang==='sw'?'Ingia':lang==='mashi'?'Injira':'Connexion',
    subtitle: lang==='en'?'Access your farm management space':lang==='sw'?'Ingia katika nafasi yako':lang==='mashi'?'Injira mu kibanza cawe':'Accédez à votre espace de gestion',
    emailLbl: lang==='en'?'Email':lang==='sw'?'Barua pepe':lang==='mashi'?'Imeyili':'Email',
    passLbl:  lang==='en'?'Password':lang==='sw'?'Nywila':lang==='mashi'?'Ijambo ry\'ibanga':'Mot de passe',
    remember: lang==='en'?'Remember me':lang==='sw'?'Nikumbuke':lang==='mashi'?'Ninkumbuke':'Se souvenir',
    forgot:   lang==='en'?'Forgot password?':lang==='sw'?'Umesahau nywila?':lang==='mashi'?'Nasanze ijambo?':'Mot de passe oublié ?',
    submit:   lang==='en'?'Sign In':lang==='sw'?'Ingia':lang==='mashi'?'Injira':'Se connecter',
    back:     lang==='en'?'Back to home':lang==='sw'?'Rudi nyumbani':lang==='mashi'?'Garuka inzu':'Retour à l\'accueil',
    noAcct:   lang==='en'?'No account?':lang==='sw'?'Huna akaunti?':lang==='mashi'?'Nta konti?':'Pas de compte ?',
    request:  lang==='en'?'Request access':lang==='sw'?'Omba ufikiaji':lang==='mashi'?'Saba uburenganzira':'Demander un accès',
    quick:    lang==='en'?'Admin quick access':lang==='sw'?'Ufikiaji wa haraka':lang==='mashi'?'Kugera vite':'Accès rapide admin',
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',background:'var(--b50)',fontFamily:'system-ui,sans-serif'}}>
      <style>{`
        @media(max-width:640px){
          .auth-left{display:none!important}
          .auth-right{padding:1.5rem!important}
        }
        @media(max-width:380px){
          .auth-right{padding:1rem!important}
        }
      `}</style>
      <style>{`
        @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shk{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .au1{animation:up .5s .05s both}.au2{animation:up .5s .1s both}.au3{animation:up .5s .18s both}.au4{animation:up .5s .26s both}
        .shake{animation:shk .45s ease}
        .spin{animation:spin 1s linear infinite}
        .inp{width:100%;padding:11px 12px 11px 38px;background:var(--surface2);border:1.5px solid var(--border);border-radius:11px;font-size:.9rem;color:var(--text);transition:all .13s;outline:none;font-family:inherit}
        .inp:focus{border-color:var(--accent);background:white;box-shadow:0 0 0 3px rgba(140,110,63,.12)}
        .inp.err{border-color:var(--err)}
        .ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--light)}
      `}</style>

      {/* LEFT — branding — hidden on mobile */}
      <div className="auth-left" style={{width:'42%',minWidth:'280px',background:'var(--b800)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'3rem 2rem',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-80px',right:'-80px',width:'300px',height:'300px',borderRadius:'50%',background:'var(--b700)',opacity:.5}}/>
        <div style={{position:'absolute',bottom:'-60px',left:'-60px',width:'250px',height:'250px',borderRadius:'50%',background:'var(--b600)',opacity:.4}}/>
        <div style={{position:'relative',zIndex:2,textAlign:'center',maxWidth:'360px'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'1.5rem'}}>
            <MugogoLogo size={88} color="rgba(255,255,255,0.9)"/>
          </div>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:'2rem',fontWeight:700,color:'white',lineHeight:1.2,marginBottom:'.5rem'}}>
            Concession<br/>Mugogo
          </h1>
          <p style={{fontSize:'12px',color:'rgba(255,255,255,.5)',marginBottom:'2px'}}>Walungu, Sud-Kivu, RDC</p>
          <p style={{fontSize:'12px',color:'rgba(255,255,255,.5)',marginBottom:'2px'}}>+243 976960983</p>
          <p style={{fontSize:'12px',color:'rgba(255,255,255,.5)',marginBottom:'2rem'}}>richardbunani2013@gmail.com</p>
          <div style={{width:'40px',height:'2px',background:'var(--b400)',borderRadius:'99px',margin:'0 auto 1.5rem'}}/>
          {[
            lang==='en'?'Complete livestock & crop management':lang==='sw'?'Usimamizi kamili wa mifugo na mazao':'Gestion complète élevage & cultures',
            lang==='en'?'Finance, HR and salary payments':lang==='sw'?'Fedha, HR na mishahara':'Finance, RH et paiement des salaires',
            lang==='en'?'Downloadable PDF & Word reports':lang==='sw'?'Ripoti za PDF na Word':'Rapports PDF et Word téléchargeables',
            lang==='en'?'4 languages: FR / EN / Swahili / Mashi':lang==='sw'?'Lugha 4: FR / EN / SW / Mashi':'4 langues : FR / EN / SW / Mashi',
          ].map((f,i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:'9px',marginBottom:'8px',textAlign:'left'}}>
              <div style={{width:'16px',height:'16px',borderRadius:'50%',background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span style={{fontSize:'12px',color:'rgba(255,255,255,.68)'}}>{f}</span>
            </div>
          ))}
        </div>
        <div style={{position:'absolute',bottom:'1.5rem',display:'flex',alignItems:'center',gap:'6px',background:'rgba(255,255,255,.07)',borderRadius:'99px',padding:'5px 14px'}}>
          <Shield size={11} style={{color:'rgba(255,255,255,.5)'}}/>
          <span style={{fontSize:'10px',color:'rgba(255,255,255,.5)'}}>{lang==='en'?'Secure 8h session':'Session sécurisée 8h'}</span>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="auth-right" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',overflowY:'auto'}}>
        <div style={{width:'100%',maxWidth:'420px'}}>
          <Link to="/" style={{display:'inline-flex',alignItems:'center',gap:'5px',fontSize:'.82rem',color:'var(--muted)',textDecoration:'none',marginBottom:'2rem'}}
            onMouseEnter={e=>(e.currentTarget.style.color='var(--accent)')}
            onMouseLeave={e=>(e.currentTarget.style.color='var(--muted)')}>
            <ArrowLeft size={13}/>{T.back}
          </Link>

          <div className="au1" style={{marginBottom:'1.75rem'}}>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:'1.85rem',fontWeight:700,color:'var(--text)',marginBottom:'.375rem'}}>{T.title}</h2>
            <p style={{fontSize:'.88rem',color:'var(--muted)'}}>{T.subtitle}</p>
          </div>

          {/* Language switcher */}
          <div className="au2" style={{marginBottom:'1.5rem'}}>
            <LangSwitcher variant="full" style={{justifyContent:'flex-start',gap:'5px'}}/>
          </div>

          {error && (
            <div className={`au2${shake?' shake':''}`} style={{display:'flex',alignItems:'flex-start',gap:'8px',padding:'10px 13px',borderRadius:'11px',background:'var(--errBg)',border:'1px solid var(--err)',marginBottom:'1.25rem'}}>
              <AlertCircle size={14} style={{color:'var(--err)',flexShrink:0,marginTop:'1px'}}/>
              <p style={{fontSize:'.82rem',color:'var(--err)',fontWeight:500,lineHeight:1.45}}>{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="au3" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div>
              <label style={{display:'block',fontSize:'.73rem',fontWeight:700,color:'var(--muted)',marginBottom:'.3rem',textTransform:'uppercase',letterSpacing:'.04em'}}>{T.emailLbl}</label>
              <div style={{position:'relative'}}>
                <Mail size={14} className="ico"/>
                <input ref={emailRef} type="text" value={email} placeholder="richardbunani2013@gmail.com"
                  onChange={e=>{setEmail(e.target.value);setFieldErr(p=>({...p,email:undefined}))}}
                  className={`inp${fieldErr.email?' err':''}`}/>
              </div>
              {fieldErr.email&&<p style={{fontSize:'.72rem',color:'var(--err)',marginTop:'3px'}}>{fieldErr.email}</p>}
            </div>

            <div>
              <label style={{display:'block',fontSize:'.73rem',fontWeight:700,color:'var(--muted)',marginBottom:'.3rem',textTransform:'uppercase',letterSpacing:'.04em'}}>{T.passLbl}</label>
              <div style={{position:'relative'}}>
                <Lock size={14} className="ico"/>
                <input type={showPass?'text':'password'} value={password} placeholder="••••••••"
                  onChange={e=>{setPassword(e.target.value);setFieldErr(p=>({...p,password:undefined}))}}
                  className={`inp${fieldErr.password?' err':''}`} style={{paddingRight:'40px'}}/>
                <button type="button" onClick={()=>setShowPass(!showPass)}
                  style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--light)',padding:'3px'}}>
                  {showPass?<EyeOff size={14}/>:<Eye size={14}/>}
                </button>
              </div>
              {fieldErr.password&&<p style={{fontSize:'.72rem',color:'var(--err)',marginTop:'3px'}}>{fieldErr.password}</p>}
            </div>

            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <label style={{display:'flex',alignItems:'center',gap:'7px',cursor:'pointer',fontSize:'.84rem',color:'var(--muted)'}}>
                <div onClick={()=>setRemember(!remember)}
                  style={{width:'17px',height:'17px',borderRadius:'5px',border:`2px solid ${remember?'var(--accent)':'var(--border)'}`,background:remember?'var(--accent)':'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .12s',flexShrink:0}}>
                  {remember&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                {T.remember}
              </label>
              <Link to="/mot-de-passe-oublie" style={{fontSize:'.84rem',color:'var(--accent)',textDecoration:'none',fontWeight:600}}>{T.forgot}</Link>
            </div>

            {locked&&(
              <div>
                <div style={{height:'4px',background:'var(--b200)',borderRadius:'99px',overflow:'hidden',marginBottom:'4px'}}>
                  <div style={{height:'100%',background:'var(--err)',borderRadius:'99px',width:`${(lockSec/30)*100}%`,transition:'width 1s linear'}}/>
                </div>
                <p style={{fontSize:'.74rem',color:'var(--muted)',textAlign:'center'}}>{lockSec}s...</p>
              </div>
            )}

            <button type="submit" disabled={loading||locked}
              style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',padding:'13px',borderRadius:'12px',background:locked?'var(--b300)':'var(--accent)',color:'white',border:'none',fontSize:'.95rem',fontWeight:700,cursor:locked||loading?'not-allowed':'pointer',transition:'all .15s',boxShadow:locked?'none':'0 4px 14px rgba(140,110,63,.28)'}}>
              {loading?<><Loader2 size={15} className="spin"/>Vérification...</>:locked?`${lockSec}s...`:T.submit}
            </button>

            <p style={{textAlign:'center',fontSize:'.84rem',color:'var(--muted)'}}>
              {T.noAcct}{' '}
              <Link to="/inscription" style={{color:'var(--accent)',fontWeight:600,textDecoration:'none'}}>{T.request}</Link>
            </p>
          </form>

          {/* Admin quick access */}
          <div className="au4" style={{marginTop:'1.5rem',padding:'.875rem 1rem',background:'var(--b100)',borderRadius:'12px',border:'1px solid var(--b200)'}}>
            <p style={{fontSize:'.72rem',fontWeight:700,color:'var(--b600)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'.75rem'}}>{T.quick}</p>
            <button onClick={()=>{setEmail(ADMIN.email);setPassword(ADMIN.password);setError('');setFieldErr({})}}
              style={{display:'flex',alignItems:'center',gap:'10px',padding:'9px 12px',borderRadius:'10px',border:'1px solid var(--b300)',background:'white',cursor:'pointer',transition:'all .12s',width:'100%',textAlign:'left'}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='var(--accentS)';(e.currentTarget as HTMLElement).style.borderColor='var(--accent)'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='white';(e.currentTarget as HTMLElement).style.borderColor='var(--b300)'}}>
              <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'var(--accentS)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'1rem',flexShrink:0,border:'2px solid var(--b300)'}}>R</div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:'.88rem',fontWeight:700,color:'var(--text)'}}>Richard Bunani</p>
                <p style={{fontSize:'.74rem',color:'var(--muted)'}}>richardbunani2013@gmail.com</p>
              </div>
              <span style={{fontSize:'.7rem',fontWeight:700,padding:'3px 8px',borderRadius:'99px',background:'var(--accent)',color:'white',flexShrink:0}}>
                {lang==='en'?'Owner':lang==='sw'?'Mmiliki':lang==='mashi'?'Nyir\'ikirima':'Propriétaire'}
              </span>
            </button>
          </div>

          <p style={{textAlign:'center',fontSize:'.74rem',color:'var(--light)',marginTop:'1.5rem'}}>
            © 2025 Concession Mugogo — Walungu, Sud-Kivu
          </p>
        </div>
      </div>
    </div>
  )
}
