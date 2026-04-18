import { useTranslation } from 'react-i18next'
import { useLang } from '@/context/LanguageContext'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, CheckCircle, Loader2, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react'

type View = 'email' | 'code' | 'reset' | 'success'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [view,  setView]  = useState<View>('email')
  const [email, setEmail] = useState('')
  const [code,  setCode]  = useState(['', '', '', '', '', ''])
  const [pass1, setPass1] = useState('')
  const [pass2, setPass2] = useState('')
  const [showP1, setShowP1] = useState(false)
  const [showP2, setShowP2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const codeRefs = Array.from({ length: 6 }, () => React.useRef<HTMLInputElement>(null))

  const submitEmail = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError('Adresse email invalide'); return }
    setLoading(true); await new Promise(r => setTimeout(r, 900)); setLoading(false); setError(''); setView('code')
  }

  const handleCodeInput = (i: number, val: string) => {
    const c = [...code]; c[i] = val.slice(-1); setCode(c)
    if (val && i < 5) codeRefs[i + 1].current?.focus()
    if (!val && i > 0) codeRefs[i - 1].current?.focus()
  }

  const submitCode = async () => {
    if (code.some(c => !c)) { setError('Veuillez entrer le code complet'); return }
    setLoading(true); await new Promise(r => setTimeout(r, 800)); setLoading(false); setError(''); setView('reset')
  }

  const submitReset = async () => {
    if (pass1.length < 8) { setError('Minimum 8 caractères'); return }
    if (pass1 !== pass2)  { setError('Les mots de passe ne correspondent pas'); return }
    setLoading(true); await new Promise(r => setTimeout(r, 800)); setLoading(false); setError(''); setView('success')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--b50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'system-ui,sans-serif' }}>
      <style>{`
        @keyframes au{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .a1{animation:au .5s .05s ease both}.a2{animation:au .5s .12s ease both}.a3{animation:au .5s .18s ease both}
        .inp3{width:100%;padding:11px 12px 11px 38px;background:var(--surface2);border:1.5px solid var(--border);border-radius:11px;font-size:.9rem;color:var(--text);font-family:inherit;transition:all .13s;outline:none}
        .inp3:focus{border-color:var(--accent);background:white;box-shadow:0 0 0 3px rgba(140,110,63,.1)}
        .code-box{width:46px;height:54px;border-radius:12px;border:2px solid var(--border);background:var(--surface2);text-align:center;font-size:1.5rem;font-weight:700;color:var(--text);font-family:Georgia,serif;transition:all .13s;outline:none}
        .code-box:focus{border-color:var(--accent);background:white;box-shadow:0 0 0 3px rgba(140,110,63,.12)}
      `}</style>

      <div style={{ width: '100%', maxWidth: '420px' }}>
        <Link to="/connexion" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '.82rem', color: 'var(--muted)', textDecoration: 'none', marginBottom: '2rem' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
          <ArrowLeft size={13}/> Retour à la connexion
        </Link>

        <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid var(--borderS)', boxShadow: '0 4px 24px rgba(46,31,16,.08)' }}>

          {/* Step indicators */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2rem' }}>
            {(['email','code','reset'] as View[]).map((v, i) => {
              const done = ['email','code','reset'].indexOf(view) > i
              const cur  = view === v || (v === 'reset' && view === 'success')
              return (
                <React.Fragment key={v}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 700, background: done ? 'var(--accent)' : cur ? 'var(--accentS)' : 'var(--b100)', color: done ? 'white' : cur ? 'var(--accent)' : 'var(--light)', border: cur ? '2px solid var(--accent)' : 'none', transition: 'all .2s' }}>
                    {done ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : i+1}
                  </div>
                  {i < 2 && <div style={{ height: '2px', width: '24px', background: done ? 'var(--accent)' : 'var(--b200)', borderRadius: '99px', transition: 'background .3s' }}/>}
                </React.Fragment>
              )
            })}
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 12px', borderRadius: '10px', background: 'var(--errBg)', border: '1px solid var(--err)', marginBottom: '1rem' }}>
              <AlertCircle size={13} style={{ color: 'var(--err)', flexShrink: 0 }}/>
              <p style={{ fontSize: '.8rem', color: 'var(--err)' }}>{error}</p>
            </div>
          )}

          {/* VIEW: Email */}
          {view === 'email' && (
            <div className="a1">
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .875rem', border: '1px solid var(--b300)' }}>
                  <Mail size={22} style={{ color: 'var(--accent)' }}/>
                </div>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.6rem', fontWeight: 700, marginBottom: '.375rem' }}>Mot de passe oublié</h2>
                <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.55 }}>Entrez votre adresse email. Nous vous enverrons un code de vérification.</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--light)' }}/>
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }} placeholder="richardbunani2013@gmail.com" className="inp3"/>
                </div>
              </div>
              <button onClick={submitEmail} disabled={loading}
                style={{ width: '100%', padding: '12px', borderRadius: '11px', background: 'var(--accent)', color: 'white', border: 'none', fontSize: '.92rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                {loading ? <><Loader2 size={15} style={{ animation: 'au 1s linear infinite' }}/> Envoi...</> : 'Envoyer le code'}
              </button>
            </div>
          )}

          {/* VIEW: Code */}
          {view === 'code' && (
            <div className="a1">
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '.375rem' }}>Code de vérification</h2>
                <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.55 }}>
                  Un code à 6 chiffres a été envoyé à<br/><strong style={{ color: 'var(--text)' }}>{email}</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.25rem' }}>
                {code.map((c, i) => (
                  <input key={i} ref={codeRefs[i]} type="text" inputMode="numeric" maxLength={1} value={c}
                    onChange={e => { handleCodeInput(i, e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Backspace' && !c && i > 0 && codeRefs[i-1].current?.focus()}
                    className="code-box"/>
                ))}
              </div>
              <button onClick={submitCode} disabled={loading}
                style={{ width: '100%', padding: '12px', borderRadius: '11px', background: 'var(--accent)', color: 'white', border: 'none', fontSize: '.92rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', marginBottom: '10px' }}>
                {loading ? <><Loader2 size={15} style={{ animation: 'au 1s linear infinite' }}/> Vérification...</> : 'Valider le code'}
              </button>
              <p style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--muted)' }}>
                Code non reçu ?{' '}
                <button onClick={() => setView('email')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', fontSize: '.8rem' }}>
                  Renvoyer
                </button>
              </p>
              <p style={{ textAlign: 'center', fontSize: '.72rem', color: 'var(--light)', marginTop: '4px' }}>
                Code de démonstration : <strong>1 2 3 4 5 6</strong>
              </p>
            </div>
          )}

          {/* VIEW: Reset */}
          {view === 'reset' && (
            <div className="a1">
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '.375rem' }}>Nouveau mot de passe</h2>
                <p style={{ fontSize: '.85rem', color: 'var(--muted)' }}>Choisissez un mot de passe sécurisé pour votre compte.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Nouveau mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--light)' }}/>
                    <input type={showP1 ? 'text' : 'password'} value={pass1} onChange={e => { setPass1(e.target.value); setError('') }} placeholder="Minimum 8 caractères" className="inp3" style={{ paddingRight: '38px' }}/>
                    <button type="button" onClick={() => setShowP1(!showP1)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--light)' }}>
                      {showP1 ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Confirmer le mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--light)' }}/>
                    <input type={showP2 ? 'text' : 'password'} value={pass2} onChange={e => { setPass2(e.target.value); setError('') }} placeholder="Répéter le mot de passe" className="inp3" style={{ paddingRight: '38px' }}/>
                    <button type="button" onClick={() => setShowP2(!showP2)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--light)' }}>
                      {showP2 ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={submitReset} disabled={loading}
                style={{ width: '100%', padding: '12px', borderRadius: '11px', background: 'var(--accent)', color: 'white', border: 'none', fontSize: '.92rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                {loading ? <><Loader2 size={15} style={{ animation: 'au 1s linear infinite' }}/> Enregistrement...</> : 'Réinitialiser le mot de passe'}
              </button>
            </div>
          )}

          {/* VIEW: Success */}
          {view === 'success' && (
            <div className="a1" style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--okBg)', border: '2px solid var(--ok)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle size={28} style={{ color: 'var(--ok)' }}/>
              </div>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.6rem', fontWeight: 700, marginBottom: '.5rem' }}>Mot de passe modifié</h2>
              <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
              </p>
              <Link to="/connexion" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px 24px', borderRadius: '11px', background: 'var(--accent)', color: 'white', textDecoration: 'none', fontSize: '.9rem', fontWeight: 700 }}>
                Aller à la connexion
              </Link>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '.74rem', color: 'var(--light)', marginTop: '1.5rem' }}>
          © 2025 Concession Mugogo — Walungu, Sud-Kivu
        </p>
      </div>
    </div>
  )
}
