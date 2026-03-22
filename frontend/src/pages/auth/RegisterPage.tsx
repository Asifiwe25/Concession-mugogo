import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff, User, Mail, Phone, Lock, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/context/authStore'
import { useExtraStore } from '@/store/extraStore'

const ROLES = [
  { v: 'farmer',           l: 'Cultivateur',        desc: 'Gestion des cultures et récoltes' },
  { v: 'shepherd',         l: 'Berger',             desc: 'Suivi du cheptel et pâturage' },
  { v: 'hr_manager',       l: 'RH Manager',         desc: 'Gestion des ressources humaines' },
  { v: 'accountant',       l: 'Comptable',          desc: 'Finance et comptabilité' },
  { v: 'vet',              l: 'Vétérinaire',        desc: 'Santé animale et soins' },
  { v: 'livestock_manager',l: 'Resp. Élevage',      desc: 'Direction de l\'élevage' },
  { v: 'farm_manager',     l: 'Resp. Agricole',     desc: 'Direction agricole' },
  { v: 'director',         l: 'Directeur',          desc: 'Direction générale' },
]

const LANGS = [
  { code: 'fr',    label: 'Français' },
  { code: 'sw',    label: 'Kiswahili' },
  { code: 'mashi', label: 'Mashi' },
]

type Step = 1 | 2 | 3

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [step, setStep]       = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass]   = useState(false)
  const [showConf, setShowConf]   = useState(false)
  const [lang, setLang]       = useState('fr')
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirm: '',
    role: '', language: 'fr', inviteCode: '',
  })
  const set = (k: string, v: string) => setForm(p => ({...p, [k]: v}))

  const STEPS = ['Identité', 'Rôle & Langue', 'Accès']

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!form.fullName.trim() || form.fullName.trim().length < 3) { setError('Nom complet requis (minimum 3 caractères)'); return false }
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) { setError('Adresse email invalide'); return false }
    }
    if (step === 2) {
      if (!form.role) { setError('Veuillez sélectionner un rôle'); return false }
    }
    if (step === 3) {
      if (!form.password || form.password.length < 8) { setError('Le mot de passe doit contenir minimum 8 caractères'); return false }
      if (!/[A-Z]/.test(form.password)) { setError('Le mot de passe doit contenir au moins une majuscule'); return false }
      if (!/[0-9]/.test(form.password)) { setError('Le mot de passe doit contenir au moins un chiffre'); return false }
      if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas'); return false }
    }
    setError(''); return true
  }

  const next = () => { if (validateStep()) setStep(s => Math.min(s + 1, 3) as Step) }
  const prev = () => { setStep(s => Math.max(s - 1, 1) as Step); setError('') }

  const { addAccessRequest } = useExtraStore()

  const handleSubmit = async () => {
    if (!validateStep()) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))

    // Save access request — admin will see it on dashboard
    addAccessRequest({
      fullName: form.fullName,
      email:    form.email,
      phone:    form.phone,
      role:     form.role,
      language: form.language,
      message:  `Demande d'accès — ${ROLES.find(r=>r.v===form.role)?.l||form.role}`,
    })

    setLoading(false)
    setSuccess(true)
    setTimeout(() => navigate('/connexion'), 3500)
  }

  const pwStrength = () => {
    let score = 0
    if (form.password.length >= 8) score++
    if (/[A-Z]/.test(form.password)) score++
    if (/[0-9]/.test(form.password)) score++
    if (/[^A-Za-z0-9]/.test(form.password)) score++
    return score
  }
  const pw = pwStrength()
  const pwColor = pw <= 1 ? 'var(--err)' : pw === 2 ? 'var(--warn)' : pw === 3 ? 'var(--b500)' : 'var(--ok)'
  const pwLabel = ['Très faible','Faible','Moyen','Fort','Très fort'][pw] || ''

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--b50)', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '380px', animation: 'authUp .5s ease' }}>
        <style>{`@keyframes authUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--okBg)', border: '2px solid var(--ok)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={30} style={{ color: 'var(--ok)' }}/>
        </div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.75rem', fontWeight: 700, marginBottom: '.625rem', color: 'var(--text)' }}>Demande envoyée</h2>
        <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
          Votre demande d'accès a été transmise à <strong>Richard Bunani</strong>, propriétaire de la Concession Mugogo.<br/><br/>
          Vous recevrez un email de confirmation dès validation de votre accès.
        </p>
        <div style={{ width: '100%', height: '4px', background: 'var(--b200)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--accent)', borderRadius: '99px', width: '100%', animation: 'grow 3s linear' }}/>
        </div>
        <style>{`@keyframes grow{from{width:0}to{width:100%}}`}</style>
        <p style={{ fontSize: '.76rem', color: 'var(--light)', marginTop: '8px' }}>Redirection vers la connexion...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--b50)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'system-ui,sans-serif' }}>
      <style>{`
        @keyframes authUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .au1{animation:authUp .5s .05s ease both}.au2{animation:authUp .5s .12s ease both}.au3{animation:authUp .5s .18s ease both}
        .inp2{width:100%;padding:10px 12px 10px 38px;background:var(--surface2);border:1.5px solid var(--border);border-radius:11px;font-size:.9rem;color:var(--text);font-family:inherit;transition:all .13s;outline:none}
        .inp2:focus{border-color:var(--accent);background:white;box-shadow:0 0 0 3px rgba(140,110,63,.1)}
        .inp-w{position:relative}.inp-w .ico2{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--light);pointer-events:none}
      `}</style>

      <div style={{ width: '100%', maxWidth: '520px' }}>
        <Link to="/connexion" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '.82rem', color: 'var(--muted)', textDecoration: 'none', marginBottom: '2rem' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
          <ArrowLeft size={13}/> Retour à la connexion
        </Link>

        <div className="au1" style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid var(--borderS)', boxShadow: '0 4px 24px rgba(46,31,16,.08)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .875rem', border: '1px solid var(--b300)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', marginBottom: '.3rem' }}>Demande d'accès</h2>
            <p style={{ fontSize: '.85rem', color: 'var(--muted)' }}>Concession Mugogo — Votre demande sera validée par Richard Bunani</p>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '1.75rem' }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 700, transition: 'all .2s',
                      background: i + 1 < step ? 'var(--accent)' : i + 1 === step ? 'var(--accentS)' : 'var(--b100)',
                      color:      i + 1 < step ? 'white' : i + 1 === step ? 'var(--accent)' : 'var(--light)',
                      border:     i + 1 === step ? '2px solid var(--accent)' : 'none' }}>
                    {i + 1 < step ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : i + 1}
                  </div>
                  <span style={{ fontSize: '.62rem', color: i + 1 === step ? 'var(--accent)' : 'var(--light)', fontWeight: i + 1 === step ? 700 : 400 }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ height: '2px', width: '28px', background: i + 1 < step ? 'var(--accent)' : 'var(--b200)', borderRadius: '99px', marginBottom: '14px', flexShrink: 0, transition: 'background .3s' }}/>}
              </React.Fragment>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '9px 12px', borderRadius: '10px', background: 'var(--errBg)', border: '1px solid var(--err)', marginBottom: '1rem' }}>
              <AlertCircle size={13} style={{ color: 'var(--err)', flexShrink: 0, marginTop: '2px' }}/>
              <p style={{ fontSize: '.8rem', color: 'var(--err)' }}>{error}</p>
            </div>
          )}

          {/* Step 1 — Identity */}
          {step === 1 && (
            <div className="au2" style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Nom complet *</label>
                <div className="inp-w">
                  <User size={14} className="ico2"/>
                  <input type="text" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Prénom et nom de famille" className="inp2"/>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Adresse email *</label>
                <div className="inp-w">
                  <Mail size={14} className="ico2"/>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="votre@mugogo.cd" className="inp2"/>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Téléphone (optionnel)</label>
                <div className="inp-w">
                  <Phone size={14} className="ico2"/>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+243 81 xxx xxxx" className="inp2"/>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Role */}
          {step === 2 && (
            <div className="au2" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.625rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Rôle dans la concession *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {ROLES.map(r => (
                    <button key={r.v} onClick={() => set('role', r.v)}
                      style={{ padding: '9px 10px', borderRadius: '11px', border: `1.5px solid ${form.role === r.v ? 'var(--accent)' : 'var(--border)'}`, background: form.role === r.v ? 'var(--accentS)' : 'var(--surface2)', cursor: 'pointer', textAlign: 'left', transition: 'all .13s' }}>
                      <p style={{ fontSize: '.82rem', fontWeight: 700, color: form.role === r.v ? 'var(--accent)' : 'var(--text)' }}>{r.l}</p>
                      <p style={{ fontSize: '.7rem', color: 'var(--muted)', marginTop: '1px', lineHeight: 1.3 }}>{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.5rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Langue préférée</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {LANGS.map(l => (
                    <button key={l.code} onClick={() => set('language', l.code)}
                      style={{ flex: 1, padding: '8px', borderRadius: '9px', border: `1.5px solid ${form.language === l.code ? 'var(--accent)' : 'var(--border)'}`, background: form.language === l.code ? 'var(--accentS)' : 'var(--surface2)', color: form.language === l.code ? 'var(--accent)' : 'var(--muted)', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all .12s' }}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Code d'invitation (optionnel)</label>
                <input type="text" value={form.inviteCode} onChange={e => set('inviteCode', e.target.value)} placeholder="Fourni par l'administrateur..." className="inp2" style={{ paddingLeft: '12px' }}/>
                <p style={{ fontSize: '.72rem', color: 'var(--light)', marginTop: '3px' }}>Si vous avez un code, votre accès sera approuvé automatiquement</p>
              </div>
            </div>
          )}

          {/* Step 3 — Password */}
          {step === 3 && (
            <div className="au2" style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Mot de passe *</label>
                <div className="inp-w">
                  <Lock size={14} className="ico2"/>
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Minimum 8 caractères" className="inp2" style={{ paddingRight: '38px' }}/>
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--light)' }}>
                    {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
                {form.password && (
                  <div style={{ marginTop: '6px' }}>
                    <div style={{ height: '4px', background: 'var(--b200)', borderRadius: '99px', overflow: 'hidden', marginBottom: '3px' }}>
                      <div style={{ height: '100%', width: `${(pw / 4) * 100}%`, background: pwColor, borderRadius: '99px', transition: 'all .3s ease' }}/>
                    </div>
                    <span style={{ fontSize: '.72rem', color: pwColor, fontWeight: 600 }}>{pwLabel}</span>
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>Confirmer le mot de passe *</label>
                <div className="inp-w">
                  <Lock size={14} className="ico2"/>
                  <input type={showConf ? 'text' : 'password'} value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Répéter le mot de passe" className="inp2" style={{ paddingRight: '38px' }}/>
                  <button type="button" onClick={() => setShowConf(!showConf)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--light)' }}>
                    {showConf ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
                {form.confirm && form.password !== form.confirm && (
                  <p style={{ fontSize: '.72rem', color: 'var(--err)', marginTop: '3px' }}>Les mots de passe ne correspondent pas</p>
                )}
                {form.confirm && form.password === form.confirm && form.confirm.length >= 8 && (
                  <p style={{ fontSize: '.72rem', color: 'var(--ok)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={11}/> Mots de passe identiques
                  </p>
                )}
              </div>
              {/* Summary */}
              <div style={{ background: 'var(--b100)', borderRadius: '12px', padding: '10px 12px', border: '1px solid var(--b200)', fontSize: '.8rem' }}>
                <p style={{ fontWeight: 700, color: 'var(--b700)', marginBottom: '5px' }}>Récapitulatif de votre demande</p>
                {[['Nom', form.fullName], ['Email', form.email], ['Rôle', ROLES.find(r => r.v === form.role)?.l || '—'], ['Langue', LANGS.find(l => l.code === form.language)?.label || '—']].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '1px solid var(--b200)' }}>
                    <span style={{ color: 'var(--muted)' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--borderS)' }}>
            <span style={{ fontSize: '.72rem', color: 'var(--light)' }}>Étape {step} / 3</span>
            <div style={{ display: 'flex', gap: '7px' }}>
              {step > 1 && <button onClick={prev} style={{ padding: '9px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', fontSize: '.84rem', fontWeight: 600, cursor: 'pointer' }}>← Précédent</button>}
              {step < 3 && <button onClick={next} style={{ padding: '9px 18px', borderRadius: '10px', background: 'var(--accent)', color: 'white', border: 'none', fontSize: '.84rem', fontWeight: 700, cursor: 'pointer' }}>Suivant →</button>}
              {step === 3 && (
                <button onClick={handleSubmit} disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '10px', background: 'var(--accent)', color: 'white', border: 'none', fontSize: '.84rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? <><Loader2 size={14} style={{ animation: 'authSpin 1s linear infinite' }}/> Envoi...</> : 'Envoyer la demande'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
