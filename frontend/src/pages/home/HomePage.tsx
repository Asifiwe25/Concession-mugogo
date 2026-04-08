import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/context/authStore'
import { useExtraStore, useHomeStore } from '@/store/extraStore'
import {
  ArrowRight, ChevronDown, BarChart3, Users, Package, Sprout,
  Shield, Globe, CheckCircle, Play, Star, TrendingUp, MapPin,
  Beef, Wrench, DollarSign, Bell, FileText, Wheat,
  Mic, MicOff, Video, Send, FileText as FileIcon, Loader2, X
} from 'lucide-react'

// ── Animated Counter ─────────────────────────────────────────
function Counter({ target, suffix = '', duration = 2200 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const t0 = Date.now()
        const tick = () => {
          const p = Math.min((Date.now() - t0) / duration, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setCount(Math.round(ease * target))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target, duration])
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ── Magnetic button ──────────────────────────────────────────
function MagneticBtn({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  const ref = useRef<HTMLButtonElement>(null)
  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left - r.width / 2
    const y = e.clientY - r.top - r.height / 2
    el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`
  }
  const handleLeave = () => { if (ref.current) ref.current.style.transform = 'none' }
  return (
    <button ref={ref} onClick={onClick} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ transition: 'transform .25s cubic-bezier(.34,1.56,.64,1)', cursor: 'pointer', ...style }}>
      {children}
    </button>
  )
}

// ── Particles ────────────────────────────────────────────────
function Particles({ count = 22, color = 'var(--b400)' }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: 2 + Math.random() * 4, delay: Math.random() * 7,
    dur: 4 + Math.random() * 7, op: 0.08 + Math.random() * 0.16,
  }))
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          width: `${p.size}px`, height: `${p.size}px`,
          borderRadius: '50%', background: color, opacity: p.op,
          animation: `pfloat ${p.dur}s ${p.delay}s ease-in-out infinite`,
        }}/>
      ))}
    </div>
  )
}

// ── Feature card ─────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, delay }: { icon: any; title: string; desc: string; delay: string }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'white' : 'rgba(255,255,255,.72)',
        border: `1px solid ${hov ? 'var(--b300)' : 'var(--borderS)'}`,
        borderRadius: '20px', padding: '1.625rem',
        transition: 'all 0.3s cubic-bezier(.34,1.56,.64,1)',
        transform: hov ? 'translateY(-6px) scale(1.02)' : 'none',
        boxShadow: hov ? '0 18px 50px rgba(46,31,16,.12)' : '0 2px 8px rgba(46,31,16,.04)',
        animationDelay: delay, cursor: 'default',
      }} className="anim-fade-up">
      <div style={{
        width: '50px', height: '50px', borderRadius: '15px',
        background: hov ? 'var(--accent)' : 'var(--b100)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '1rem', transition: 'all .28s ease',
      }}>
        <Icon size={22} style={{ color: hov ? 'white' : 'var(--b600)', strokeWidth: 1.8, transition: 'color .28s' }}/>
      </div>
      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.05rem', fontWeight: 700, marginBottom: '.4rem', color: 'var(--text)' }}>{title}</h3>
      <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.65 }}>{desc}</p>
    </div>
  )
}

// ── Testimonial ───────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Jean-Baptiste Mutombo', role: 'Berger — Cheptel bovin',       text: 'Avec le système Mugogo, je peux enregistrer chaque animal, suivre ses vaccinations et voir son évolution de poids semaine après semaine. La concession est mieux gérée.', stars: 5 },
  { name: 'Marie Kahindo',         role: 'Responsable cultures, Zone C', text: 'Le calendrier cultural me rappelle chaque étape — semis, fertilisation, récolte. Les alertes automatiques m\'ont sauvé plusieurs fois lors d\'attaques phytosanitaires.', stars: 5 },
  { name: 'Dr. David Shabani',     role: 'Vétérinaire en chef',          text: 'Le carnet de vaccination numérique et le suivi de santé de chaque animal ont transformé mon travail. Je peux consulter l\'historique complet en quelques secondes.', stars: 5 },
  { name: 'Joseph Mutombo',        role: 'Comptable principal',          text: 'Les rapports financiers mensuels et le suivi des salaires sont maintenant automatisés. Richard Bunani a une vision claire des finances de la concession.', stars: 5 },
]

const FEATURES = [
  { icon: BarChart3,   title: 'Tableau de bord',       desc: 'KPIs temps réel, alertes, demandes d\'accès et rapports reçus en un coup d\'œil.' },
  { icon: Beef,        title: 'Élevage & Cheptel',     desc: 'Suivi individuel — vaccinations, santé, reproduction, pesées, valeur estimée.' },
  { icon: Sprout,      title: 'Cultures & Plantations',desc: 'Calendrier cultural, semis, irrigation, traitements phytosanitaires, récoltes.' },
  { icon: Package,     title: 'Stock & Inventaire',    desc: 'Alertes critiques automatiques, mouvements, approvisionnement, traçabilité.' },
  { icon: DollarSign,  title: 'Finance & Trésorerie',  desc: 'Revenus, dépenses, paiement salaires, budget prévisionnel, rapports.' },
  { icon: Users,       title: 'Ressources humaines',   desc: 'Dossiers employés, contrats, présences, performance et fiche de paie.' },
  { icon: Bell,        title: 'Alertes intelligentes', desc: 'Notification automatique — stock critique, animal malade, récolte prête.' },
  { icon: Shield,      title: 'Sécurité & Audit',      desc: 'Rôles différenciés, journal d\'audit immuable, sessions sécurisées 8h.' },
  { icon: Globe,       title: 'Trilingue FR/SW/Mashi', desc: 'Interface complète en français, kiswahili et mashi pour toute l\'équipe.' },
  { icon: FileText,    title: 'Rapports PDF & Word',   desc: 'Génération de rapports journaliers, mensuels ou annuels téléchargeables.' },
  { icon: MapPin,      title: 'Zones & Parcelles',     desc: 'Cartographie des zones, capacité de charge, rotations, occupation.' },
  { icon: Wrench,      title: 'Machines & Entretien',  desc: 'Suivi tracteurs, pompes, véhicules — heures compteur et maintenance.' },
]

// ── Public Report Form ───────────────────────────────────────
type RType = 'text' | 'voice' | 'video'
type RStatus = 'idle' | 'recording' | 'done' | 'sent'

function PublicReportForm() {
  const { addFieldReport } = useExtraStore()
  const [type,      setType]      = useState<RType>('text')
  const [name,      setName]      = useState('')
  const [role,      setRole]      = useState('')
  const [title,     setTitle]     = useState('')
  const [content,   setContent]   = useState('')
  const [category,  setCategory]  = useState('daily')
  const [file,      setFile]      = useState<File|null>(null)
  const [status,    setStatus]    = useState<RStatus>('idle')
  const [recTime,   setRecTime]   = useState(0)
  const [sending,   setSending]   = useState(false)
  const [sent,      setSent]      = useState(false)
  const [errors,    setErrors]    = useState<Record<string,string>>({})
  const recInterval = useRef<any>(null)
  const fileRef     = useRef<HTMLInputElement>(null)

  const startRec = () => {
    setStatus('recording'); setRecTime(0)
    recInterval.current = setInterval(() => setRecTime(p => p + 1), 1000)
  }
  const stopRec = () => {
    clearInterval(recInterval.current)
    setStatus('done')
  }
  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim())    e.name    = 'Votre nom est requis'
    if (!title.trim())   e.title   = 'Le titre est requis'
    if (type === 'text' && !content.trim()) e.content = 'Le contenu est requis'
    if (type === 'voice' && status === 'idle') e.voice = 'Enregistrez d\'abord un message'
    if (type === 'video' && !file) e.file = 'Sélectionnez une vidéo'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSend = async () => {
    if (!validate()) return
    setSending(true)
    await new Promise(r => setTimeout(r, 1200))
    addFieldReport({
      authorId:   'public',
      authorName: name.trim(),
      authorRole: role.trim() || 'Employé',
      type,
      title:      title.trim(),
      content:    content.trim(),
      category:   category as any,
      fileName:   file?.name,
      mediaSize:  file ? `${(file.size / 1024).toFixed(1)} Ko` : undefined,
      duration:   type !== 'text' ? fmtTime(recTime) : undefined,
    })
    setSending(false); setSent(true)
  }

  if (sent) return (
    <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
      <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--okBg)', border: '2px solid var(--ok)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', animation: 'scaleIn .4s cubic-bezier(.34,1.56,.64,1)' }}>
        <CheckCircle size={30} style={{ color: 'var(--ok)' }}/>
      </div>
      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '.625rem', color: 'var(--text)' }}>Rapport envoyé</h3>
      <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
        Votre rapport a été transmis à <strong style={{ color: 'var(--text)' }}>Richard Bunani</strong>.<br/>
        Il le recevra sur son tableau de bord, WhatsApp et email.
      </p>
      <button onClick={() => { setSent(false); setTitle(''); setContent(''); setName(''); setRole(''); setFile(null); setStatus('idle'); setRecTime(0) }}
        style={{ padding: '10px 24px', borderRadius: '11px', background: 'var(--accent)', color: 'white', border: 'none', fontSize: '.9rem', fontWeight: 700, cursor: 'pointer' }}>
        Envoyer un autre rapport
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
      {/* Type selector */}
      <div>
        <p style={{ fontSize: '.74rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.5rem' }}>
          Type de rapport
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {([
            { v: 'text',  label: 'Rapport écrit',  icon: FileIcon, color: 'var(--b600)',  desc: 'Texte libre' },
            { v: 'voice', label: 'Message vocal',  icon: Mic,      color: 'var(--accent)', desc: 'Audio' },
            { v: 'video', label: 'Vidéo terrain',  icon: Video,    color: 'var(--err)',   desc: 'Fichier vidéo' },
          ] as const).map(t => (
            <button key={t.v} onClick={() => { setType(t.v); setStatus('idle'); setRecTime(0); setErrors({}) }}
              style={{
                padding: '12px 8px', borderRadius: '14px', border: `2px solid`,
                borderColor: type === t.v ? t.color : 'var(--border)',
                background: type === t.v ? `${t.color}14` : 'var(--surface2)',
                cursor: 'pointer', textAlign: 'center', transition: 'all .2s cubic-bezier(.34,1.56,.64,1)',
                transform: type === t.v ? 'scale(1.04)' : 'scale(1)',
              }}>
              <t.icon size={20} style={{ color: type === t.v ? t.color : 'var(--light)', margin: '0 auto 5px', display: 'block', transition: 'color .2s' }}/>
              <p style={{ fontSize: '.78rem', fontWeight: 700, color: type === t.v ? t.color : 'var(--muted)' }}>{t.label}</p>
              <p style={{ fontSize: '.66rem', color: 'var(--light)', marginTop: '2px' }}>{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Sender info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '.73rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Votre nom *
          </label>
          <input className="input" placeholder="Prénom et nom..." value={name}
            onChange={e => { setName(e.target.value); setErrors(p => ({...p, name: undefined as any})) }}
            style={{ borderColor: errors.name ? 'var(--err)' : undefined }}/>
          {errors.name && <p style={{ fontSize: '.7rem', color: 'var(--err)', marginTop: '3px' }}>{errors.name}</p>}
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '.73rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Votre rôle
          </label>
          <input className="input" placeholder="Berger, cultivateur..." value={role} onChange={e => setRole(e.target.value)}/>
        </div>
      </div>

      {/* Category + title */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '.73rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Catégorie
          </label>
          <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="daily">Rapport journalier</option>
            <option value="livestock">Élevage</option>
            <option value="crops">Cultures</option>
            <option value="incident">Incident</option>
            <option value="finance">Finance</option>
            <option value="other">Autre</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '.73rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Titre *
          </label>
          <input className="input" placeholder="ex: Rapport Zone A — 7 Janvier..." value={title}
            onChange={e => { setTitle(e.target.value); setErrors(p => ({...p, title: undefined as any})) }}
            style={{ borderColor: errors.title ? 'var(--err)' : undefined }}/>
          {errors.title && <p style={{ fontSize: '.7rem', color: 'var(--err)', marginTop: '3px' }}>{errors.title}</p>}
        </div>
      </div>

      {/* Content area by type */}
      {type === 'text' && (
        <div>
          <label style={{ display: 'block', fontSize: '.73rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Contenu du rapport *
          </label>
          <textarea className="input" rows={5}
            placeholder="Décrivez la situation, vos observations et actions effectuées sur le terrain..."
            value={content}
            onChange={e => { setContent(e.target.value); setErrors(p => ({...p, content: undefined as any})) }}
            style={{ resize: 'vertical', borderColor: errors.content ? 'var(--err)' : undefined }}/>
          {errors.content && <p style={{ fontSize: '.7rem', color: 'var(--err)', marginTop: '3px' }}>{errors.content}</p>}
        </div>
      )}

      {type === 'voice' && (
        <div style={{ background: 'var(--b100)', borderRadius: '16px', padding: '1.5rem', border: `2px solid ${errors.voice ? 'var(--err)' : 'var(--b200)'}`, textAlign: 'center' }}>
          {status === 'idle' && (
            <>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .875rem', border: '2px solid var(--b300)' }}>
                <Mic size={24} style={{ color: 'var(--accent)' }}/>
              </div>
              <p style={{ fontSize: '.88rem', color: 'var(--muted)', marginBottom: '1rem' }}>
                Appuyez pour enregistrer votre message vocal
              </p>
              <button onClick={startRec}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', borderRadius: '11px', background: 'var(--accent)', color: 'white', border: 'none', fontSize: '.88rem', fontWeight: 700, cursor: 'pointer' }}>
                <Mic size={16}/> Démarrer l'enregistrement
              </button>
            </>
          )}
          {status === 'recording' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--err)', animation: 'pulse 1s infinite' }}/>
                <span style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 700, color: 'var(--err)' }}>{fmtTime(recTime)}</span>
                <span style={{ fontSize: '.84rem', color: 'var(--err)', fontWeight: 700 }}>Enregistrement...</span>
              </div>
              {/* Animated wave */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', height: '40px', marginBottom: '1rem' }}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} style={{ width: '4px', borderRadius: '99px', background: 'var(--err)', opacity: .7, animation: `voiceWave .6s ${i * .06}s ease-in-out infinite alternate`, minHeight: '6px' }}/>
                ))}
              </div>
              <button onClick={stopRec}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', borderRadius: '11px', background: 'var(--err)', color: 'white', border: 'none', fontSize: '.88rem', fontWeight: 700, cursor: 'pointer' }}>
                <MicOff size={16}/> Arrêter l'enregistrement
              </button>
            </>
          )}
          {status === 'done' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '.875rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--okBg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={18} style={{ color: 'var(--ok)' }}/>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontWeight: 700, fontSize: '.88rem' }}>Message enregistré</p>
                  <p style={{ fontSize: '.78rem', color: 'var(--muted)', fontFamily: 'monospace' }}>{fmtTime(recTime)}</p>
                </div>
              </div>
              <button onClick={() => { setStatus('idle'); setRecTime(0) }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9px', background: 'var(--surface2)', border: '1px solid var(--border)', fontSize: '.82rem', color: 'var(--muted)', cursor: 'pointer', fontWeight: 600 }}>
                <X size={13}/> Recommencer
              </button>
            </>
          )}
          {errors.voice && <p style={{ fontSize: '.7rem', color: 'var(--err)', marginTop: '8px' }}>{errors.voice}</p>}
        </div>
      )}

      {type === 'video' && (
        <div>
          <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => { setFile(e.target.files?.[0] || null); setErrors(p => ({...p, file: undefined as any})) }}/>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ background: 'var(--b100)', borderRadius: '16px', padding: '1.75rem', border: `2px dashed ${file ? 'var(--accent)' : errors.file ? 'var(--err)' : 'var(--b300)'}`, textAlign: 'center', cursor: 'pointer', transition: 'all .2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accentS)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--b100)')}>
            {file ? (
              <div>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .75rem', border: '1px solid var(--b300)' }}>
                  <Video size={22} style={{ color: 'var(--accent)' }}/>
                </div>
                <p style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>{file.name}</p>
                <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
              </div>
            ) : (
              <>
                <Video size={28} style={{ color: 'var(--b400)', margin: '0 auto .75rem', display: 'block' }}/>
                <p style={{ fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>Cliquer pour sélectionner une vidéo</p>
                <p style={{ fontSize: '.76rem', color: 'var(--light)' }}>MP4, MOV, AVI — max 500 Mo</p>
              </>
            )}
          </div>
          {errors.file && <p style={{ fontSize: '.7rem', color: 'var(--err)', marginTop: '4px' }}>{errors.file}</p>}
          {file && (
            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'block', fontSize: '.73rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Description
              </label>
              <textarea className="input" rows={3} placeholder="Décrivez ce que montre la vidéo..." value={content} onChange={e => setContent(e.target.value)}/>
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      <button onClick={handleSend} disabled={sending}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px',
          padding: '13px', borderRadius: '13px',
          background: sending ? 'var(--b300)' : 'var(--accent)',
          color: 'white', border: 'none', fontSize: '.95rem', fontWeight: 700,
          cursor: sending ? 'not-allowed' : 'pointer',
          boxShadow: sending ? 'none' : '0 5px 18px rgba(140,110,63,.32)',
          transition: 'all .2s',
        }}>
        {sending
          ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }}/> Envoi en cours...</>
          : <><Send size={16}/> Envoyer à Richard Bunani</>
        }
      </button>

      <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--light)' }}>
        Votre rapport sera reçu sur le tableau de bord, WhatsApp +243 976960983 et richardbunani2013@gmail.com
      </p>
    </div>
  )
}

// ── Typewriter effect ─────────────────────────────────────────
function TypeWriter({ words, speed = 80 }: { words: string[]; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [wordIdx, setWordIdx]     = useState(0)
  const [charIdx, setCharIdx]     = useState(0)
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => {
    const word = words[wordIdx]
    const timer = setTimeout(() => {
      if (!deleting) {
        setDisplayed(word.slice(0, charIdx + 1))
        if (charIdx + 1 === word.length) {
          setTimeout(() => setDeleting(true), 1800)
        } else {
          setCharIdx(c => c + 1)
        }
      } else {
        setDisplayed(word.slice(0, charIdx - 1))
        if (charIdx === 0) {
          setDeleting(false)
          setWordIdx(i => (i + 1) % words.length)
        } else {
          setCharIdx(c => c - 1)
        }
      }
    }, deleting ? speed / 2 : speed)
    return () => clearTimeout(timer)
  }, [charIdx, deleting, wordIdx, words, speed])

  return (
    <span style={{ color: 'var(--accent)' }}>
      {displayed}
      <span style={{ animation: 'pulse 1s infinite', color: 'var(--b400)', marginLeft: '1px' }}>|</span>
    </span>
  )
}

// ── Main HomePage ─────────────────────────────────────────────
export default function HomePage() {
  const navigate    = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { i18n } = useTranslation()
  const { homeContent } = useHomeStore()
  const [navSolid,  setNavSolid]   = useState(false)
  const [activeTest, setActiveTest] = useState(0)
  const [reportOpen, setReportOpen] = useState(false)
  const [reportType, setReportType] = useState<RType>('text')
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isAuthenticated) navigate('/tableau-de-bord', { replace: true })
  }, [isAuthenticated])

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveTest(p => (p + 1) % TESTIMONIALS.length), 5500)
    return () => clearInterval(t)
  }, [])

  const scrollToReport = (type: RType) => {
    setReportType(type)
    setReportOpen(true)
    setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'system-ui,sans-serif' }}>
      <style>{`
        @keyframes pfloat   { 0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-24px) scale(1.12)} }
        @keyframes heroText { from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)} }
        @keyframes heroBadge{ from{opacity:0;transform:translateY(-14px) scale(.86)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes shimmer  { 0%{transform:translateX(-100%)}100%{transform:translateX(260%)} }
        @keyframes breatheA { 0%,100%{transform:scale(1) rotate(-6deg)}50%{transform:scale(1.05) rotate(-6deg)} }
        @keyframes breatheB { 0%,100%{transform:scale(1) rotate(5deg)}50%{transform:scale(1.06) rotate(5deg)} }
        @keyframes navIn    { from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn  { from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)} }
        @keyframes voiceWave{ from{height:6px}to{height:32px} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes pulse    { 0%,100%{opacity:1}50%{opacity:.35} }
        @keyframes slideUp  { from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)} }
        @keyframes glow     { 0%,100%{box-shadow:0 0 0 0 rgba(140,110,63,.0)}50%{box-shadow:0 0 24px 8px rgba(140,110,63,.18)} }
        .h1{animation:heroText .75s .08s ease both}
        .h2{animation:heroText .75s .2s  ease both}
        .h3{animation:heroText .75s .32s ease both}
        .hb{animation:heroBadge .65s .04s cubic-bezier(.34,1.56,.64,1) both}
        .hc{animation:heroText .75s .44s ease both}
        .anim-fade-up{animation:slideUp .55s ease both}
        .d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}
        .d4{animation-delay:.24s}.d5{animation-delay:.30s}.d6{animation-delay:.36s}
        .nav-btn-ghost{padding:7px 16px;border-radius:9px;border:1px solid rgba(46,31,16,.14);background:transparent;font-size:.84rem;font-weight:600;cursor:pointer;color:var(--text);transition:all .15s}
        .nav-btn-ghost:hover{background:var(--b100)}
        .nav-btn-solid{padding:8px 18px;border-radius:9px;background:var(--accent);color:white;border:none;font-size:.84rem;font-weight:700;cursor:pointer;box-shadow:0 3px 12px rgba(140,110,63,.28);transition:all .15s;animation:glow 3s 2s ease-in-out infinite}
        .nav-btn-solid:hover{background:var(--accentH);transform:translateY(-1px)}
        .cta-primary{display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border-radius:13px;background:var(--accent);color:white;border:none;font-size:1rem;font-weight:700;cursor:pointer;box-shadow:0 6px 24px rgba(140,110,63,.35);transition:all .2s}
        .cta-primary:hover{background:var(--accentH);transform:translateY(-2px);box-shadow:0 10px 34px rgba(140,110,63,.42)}
        .cta-secondary{display:inline-flex;align-items:center;gap:8px;padding:14px 22px;border-radius:13px;background:white;color:var(--text);border:1px solid var(--border);font-size:1rem;font-weight:600;cursor:pointer;transition:all .15s}
        .cta-secondary:hover{background:var(--b100);border-color:var(--b300)}
        .msg-type-btn{padding:1.125rem;border-radius:18px;border:2px solid;cursor:pointer;text-align:center;transition:all .25s cubic-bezier(.34,1.56,.64,1);background:white}
        .msg-type-btn:hover{transform:translateY(-4px)}
        .send-btn-pub{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 20px;border-radius:12px;border:none;font-size:.88rem;font-weight:700;cursor:pointer;transition:all .2s cubic-bezier(.34,1.56,.64,1);width:100%}
        .send-btn-pub:hover{transform:translateY(-2px)}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '60px',
        background: navSolid ? 'rgba(253,250,245,.96)' : 'transparent',
        backdropFilter: navSolid ? 'blur(18px)' : 'none',
        borderBottom: navSolid ? '1px solid var(--borderS)' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(1rem,5vw,3rem)',
        transition: 'all .35s ease', animation: 'navIn .5s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.3">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <span style={{ fontFamily: 'Georgia,serif', fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Concession Mugogo</span>
            <span style={{ fontSize: '10px', color: 'var(--light)', marginLeft: '6px', fontStyle: 'italic' }}>Walungu, Sud-Kivu</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
          <button className="nav-btn-ghost" onClick={() => scrollToReport('text')}>Envoyer un rapport</button>
          <button className="nav-btn-ghost" onClick={() => navigate('/connexion')}>Connexion</button>
          <button className="nav-btn-solid" onClick={() => navigate('/connexion')}>Accès ERP</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '90px clamp(1rem,6vw,4rem) 60px', position: 'relative', overflow: 'hidden', background: 'var(--bg)' }}>
        {/* BG decorations */}
        <div style={{ position: 'absolute', top: '-90px', right: '-110px', width: '460px', height: '460px', borderRadius: '50%', background: 'var(--b200)', opacity: .35, animation: 'breatheA 7s ease-in-out infinite' }}/>
        <div style={{ position: 'absolute', bottom: '-70px', left: '-90px', width: '310px', height: '310px', borderRadius: '50%', background: 'var(--b300)', opacity: .22, animation: 'breatheB 9s 1.5s ease-in-out infinite' }}/>
        <div style={{ position: 'absolute', top: '18%', left: '3%', width: '110px', height: '110px', borderRadius: '50%', background: 'var(--b200)', opacity: .16, animation: 'breatheA 12s 3s ease-in-out infinite' }}/>
        <div style={{ position: 'absolute', bottom: '22%', right: '6%', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--b400)', opacity: .14, animation: 'breatheB 8s 4s ease-in-out infinite' }}/>
        <Particles count={26}/>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', textAlign: 'center', width: '100%' }}>
          {/* Badge */}
          <div className="hb" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', border: '1px solid var(--b300)', borderRadius: '99px', padding: '5px 16px 5px 8px', marginBottom: '2rem', boxShadow: '0 4px 16px rgba(46,31,16,.1)' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--b700)' }}>Système ERP Agro-pastoral — Walungu, Sud-Kivu, RDC</span>
          </div>

          {/* Headline */}
          <h1 className="h1" style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2.2rem,5.5vw,4.2rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, marginBottom: '.5rem', letterSpacing: '-.025em' }}>
            Bienvenue sur le système de la
          </h1>
          <h1 className="h2" style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(2.2rem,5.5vw,4.2rem)', fontWeight: 700, lineHeight: 1.1, marginBottom: '1.375rem', letterSpacing: '-.025em' }}>
            <span style={{ color: 'var(--accent)', position: 'relative', display: 'inline-block' }}>
              {homeContent.heroSubtitle}
              <span style={{ position: 'absolute', bottom: '3px', left: 0, right: 0, height: '3px', background: 'var(--b200)', borderRadius: '99px', overflow: 'hidden' }}>
                <span style={{ position: 'absolute', inset: 0, background: 'var(--accent)', borderRadius: '99px', animation: 'shimmer 2.8s 1.4s ease-in-out infinite' }}/>
              </span>
            </span>
          </h1>

          {/* Typewriter subtitle */}
          <p className="h3" style={{ fontSize: 'clamp(1rem,2vw,1.25rem)', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '660px', margin: '0 auto 2.25rem' }}>
            Gérez votre exploitation agro-pastorale —{' '}
            <TypeWriter words={['élevage & cheptel', 'cultures & récoltes', 'finances & RH', 'stock & alertes', 'rapports PDF & Word']} speed={70}/>
            <br/>
            <span style={{ color: 'var(--b500)', fontSize: '.9em' }}>9 hectares · Richard Bunani · Walungu</span>
          </p>

          {/* CTAs */}
          <div className="hc" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <button className="cta-primary" onClick={() => navigate('/connexion')}>
              Accéder au système <ArrowRight size={18}/>
            </button>
            <button className="cta-secondary" onClick={() => scrollToReport('text')}>
              <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--b100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Send size={11} style={{ color: 'var(--accent)' }}/>
              </div>
              Envoyer un rapport
            </button>
          </div>

          {/* Trust */}
          <div className="hc" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '22px', flexWrap: 'wrap' }}>
            {['Données hébergées localement', 'FR / Kiswahili / Mashi', 'Export PDF & Word', 'Sessions sécurisées 8h'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: 'var(--muted)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', opacity: .45 }}>
          <span style={{ fontSize: '.72rem', color: 'var(--light)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Découvrir</span>
          <ChevronDown size={17} style={{ color: 'var(--light)', animation: 'pfloat 1.5s ease-in-out infinite' }}/>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section style={{ background: 'white', padding: '6rem clamp(1rem,6vw,4rem)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div className="anim-fade-up">
            <div style={{ display: 'inline-block', background: 'var(--b100)', color: 'var(--b700)', fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', border: '1px solid var(--b200)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              À propos
            </div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.6rem,3.5vw,2.5rem)', fontWeight: 700, color: 'var(--text)', marginBottom: '1.125rem', lineHeight: 1.2 }}>
              {homeContent.aboutTitle}
            </h2>
            <p style={{ fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
              Fondée et dirigée par <strong style={{ color: 'var(--text)' }}>Richard Bunani</strong>, la Concession Mugogo est une exploitation agro-pastorale intégrée située à <strong>Walungu, dans le Sud-Kivu</strong>, en République Démocratique du Congo.
            </p>
            <p style={{ fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '1.75rem' }}>
              L'exploitation couvre <strong style={{ color: 'var(--text)' }}>9 hectares</strong> de terres agricoles et pastorales, avec un cheptel de bovins Ankole, caprins, volailles et porcins, ainsi que des cultures de maïs, pommes de terre et haricots.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Propriétaire',  value: 'Richard Bunani' },
                { label: 'Localisation', value: 'Walungu, Sud-Kivu' },
                { label: 'Contact',       value: '+243 976960983' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'var(--b100)', borderRadius: '12px', padding: '10px 14px', border: '1px solid var(--b200)' }}>
                  <p style={{ fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700, marginBottom: '2px' }}>{s.label}</p>
                  <p style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text)' }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="anim-fade-up d2">
            <div style={{ background: 'var(--b100)', borderRadius: '22px', padding: '1.5rem', border: '1px solid var(--b200)', position: 'relative', overflow: 'hidden', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: .4, padding: '1rem' }}>
                {[
                  { t: '8%',  l: '6%', w: '34%', h: '28%', bg: 'var(--b400)', label: 'Zone A — 12ha' },
                  { t: '8%',  l: '45%', w: '40%', h: '23%', bg: 'var(--b300)', label: 'Zone B — 8ha' },
                  { t: '44%', l: '6%', w: '27%', h: '25%', bg: 'var(--b500)', label: 'Zone C — 5ha' },
                  { t: '44%', l: '37%', w: '32%', h: '25%', bg: 'var(--b300)', label: 'Zone D — 7ha' },
                  { t: '76%', l: '16%', w: '33%', h: '20%', bg: 'var(--b400)', label: 'Zone E — 4.5ha' },
                  { t: '76%', l: '54%', w: '24%', h: '20%', bg: 'var(--b200)', label: 'Zone F' },
                ].map((z, i) => (
                  <div key={i} style={{ position: 'absolute', top: z.t, left: z.l, width: z.w, height: z.h, background: z.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--b800)' }}>{z.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(255,255,255,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto .75rem', border: '1px solid var(--b300)' }}>
                  <MapPin size={26} style={{ color: 'var(--accent)' }}/>
                </div>
                <p style={{ fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>7 Zones agricoles</p>
                <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '3px' }}>9 hectares — Walungu</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      {homeContent.showStats && <section style={{ background: 'var(--accent)', padding: '4rem clamp(1rem,6vw,4rem)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2.5rem', textAlign: 'center' }}>
          {[
            { target: 9,   suffix: ' ha', label: 'Superficie de la concession', delay: '.05s' },
            { target: 8,   suffix: '',    label: 'Employés permanents',          delay: '.15s' },
            { target: 7,   suffix: '',    label: 'Zones agricoles',               delay: '.25s' },
            { target: 100, suffix: '%',   label: 'Données sécurisées',            delay: '.35s' },
          ].map((s, i) => (
            <div key={i} className="anim-fade-up" style={{ animationDelay: s.delay }}>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: '3rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>
                <Counter target={s.target} suffix={s.suffix}/>
              </div>
              <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,.68)', marginTop: '5px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>}

      {/* ── FEATURES ── */}
      {homeContent.showFeatures && <section style={{ padding: '6rem clamp(1rem,6vw,4rem)', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-block', background: 'var(--b100)', color: 'var(--b700)', fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', border: '1px solid var(--b200)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.07em' }}>
            Modules du système
          </div>
          <h2 className="anim-fade-up" style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.7rem,4vw,2.75rem)', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
            Tout pour gérer votre exploitation
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.65 }}>
            12 modules intégrés, conçus pour la réalité de la Concession Mugogo.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} delay={`${i * .06}s`}/>
          ))}
        </div>
      </section>}

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: 'var(--b100)', padding: '6rem clamp(1rem,6vw,4rem)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-block', background: 'white', color: 'var(--b700)', fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', border: '1px solid var(--b300)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Comment utiliser
            </div>
            <h2 className="anim-fade-up" style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.7rem,4vw,2.5rem)', fontWeight: 700, color: 'var(--text)' }}>
              Opérationnel en 3 étapes
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {[
              { num: '01', title: 'Connexion sécurisée',  desc: 'Richard Bunani crée votre compte avec le rôle adapté. Chaque employé accède uniquement à son périmètre.', icon: Shield },
              { num: '02', title: 'Saisie des données',   desc: 'Enregistrez animaux, cultures, stocks et transactions. Les formulaires guidés facilitent la saisie sur le terrain.', icon: BarChart3 },
              { num: '03', title: 'Suivi & Décisions',    desc: 'Tableau de bord temps réel, alertes automatiques, rapports PDF/Word téléchargeables. Toute la concession sous contrôle.', icon: TrendingUp },
            ].map((step, i) => (
              <div key={i} className="anim-fade-up" style={{ animationDelay: `${i * .12}s`, background: 'white', borderRadius: '20px', padding: '1.875rem', border: '1px solid var(--borderS)', boxShadow: '0 2px 12px rgba(46,31,16,.05)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.125rem' }}>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: '3.5rem', fontWeight: 700, color: 'var(--b200)', lineHeight: 1 }}>{step.num}</div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--b300)' }}>
                    <step.icon size={18} style={{ color: 'var(--accent)', strokeWidth: 1.8 }}/>
                  </div>
                </div>
                <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.15rem', fontWeight: 700, marginBottom: '.5rem', color: 'var(--text)' }}>{step.title}</h3>
                <p style={{ fontSize: '.87rem', color: 'var(--muted)', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REPORT SECTION (PUBLIC — NO LOGIN NEEDED) ── */}
      <section ref={reportRef} style={{ background: 'white', padding: '6rem clamp(1rem,6vw,4rem)', borderTop: '1px solid var(--borderS)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-block', background: 'var(--accentS)', color: 'var(--accent)', fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', border: '1px solid var(--b300)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.07em' }}>
              Envoi de rapports — Accès libre
            </div>
            <h2 className="anim-fade-up" style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.7rem,4vw,2.75rem)', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
              Envoyez votre rapport à Richard Bunani
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.65 }}>
              Rapport écrit, message vocal ou vidéo — <strong>sans connexion requise.</strong><br/>
              Richard reçoit tout sur son tableau de bord, WhatsApp et email.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '3rem' }}>
            {([
              { type: 'text'  as RType, title: 'Rapport écrit',  desc: 'Rédigez un rapport détaillé — observations, incidents, activités du jour.', icon: FileIcon, color: 'var(--b600)',  bg: 'var(--b100)' },
              { type: 'voice' as RType, title: 'Message vocal',  desc: 'Enregistrez votre rapport directement au micro, sans taper de texte.', icon: Mic,      color: 'var(--accent)', bg: 'var(--accentS)' },
              { type: 'video' as RType, title: 'Rapport vidéo',  desc: 'Filmez la situation sur le terrain et envoyez la vidéo directement.', icon: Video,    color: 'var(--err)',   bg: 'var(--errBg)' },
            ]).map((item, i) => (
              <div key={i} className="anim-fade-up" style={{ animationDelay: `${i * .1}s` }}
                onClick={() => { setReportType(item.type); setReportOpen(true) }}>
                <div style={{
                  background: item.bg, borderRadius: '20px', padding: '1.875rem',
                  border: `2px solid ${reportType === item.type && reportOpen ? item.color : 'transparent'}`,
                  cursor: 'pointer', textAlign: 'center', transition: 'all .25s cubic-bezier(.34,1.56,.64,1)',
                  boxShadow: reportType === item.type && reportOpen ? `0 8px 28px rgba(0,0,0,.1)` : '0 2px 8px rgba(46,31,16,.05)',
                  transform: reportType === item.type && reportOpen ? 'translateY(-4px)' : 'none',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 36px rgba(0,0,0,.1)` }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = reportType === item.type && reportOpen ? 'translateY(-4px)' : 'none'; (e.currentTarget as HTMLElement).style.boxShadow = reportType === item.type && reportOpen ? `0 8px 28px rgba(0,0,0,.1)` : '0 2px 8px rgba(46,31,16,.05)' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.125rem', border: `2px solid ${item.color}28`, boxShadow: `0 4px 12px ${item.color}22` }}>
                    <item.icon size={26} style={{ color: item.color, strokeWidth: 1.8 }}/>
                  </div>
                  <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: '.5rem', color: 'var(--text)' }}>{item.title}</h3>
                  <p style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '1.125rem' }}>{item.desc}</p>
                  <button style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '10px', background: item.color, color: 'white', border: 'none', fontSize: '.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}>
                    <Send size={13}/> Ouvrir le formulaire
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Inline form — appears when type selected */}
          {reportOpen && (
            <div className="anim-fade-up" style={{ background: 'var(--bg)', borderRadius: '22px', padding: '2rem', border: '1px solid var(--b300)', boxShadow: '0 8px 40px rgba(46,31,16,.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)' }}>
                    {reportType === 'text' ? 'Rapport écrit' : reportType === 'voice' ? 'Message vocal' : 'Rapport vidéo'}
                  </h3>
                  <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '2px' }}>
                    Sera envoyé à Richard Bunani — tableau de bord, WhatsApp +243 976960983, email richardbunani2013@gmail.com
                  </p>
                </div>
                <button onClick={() => setReportOpen(false)}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                  <X size={15}/>
                </button>
              </div>
              <PublicReportForm key={reportType}/>
            </div>
          )}

          {/* Contact info */}
          <div style={{ marginTop: '2.5rem', background: 'var(--accentS)', borderRadius: '18px', padding: '1.375rem 1.75rem', border: '1px solid var(--b300)', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--b100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)', border: '2px solid var(--b300)', flexShrink: 0 }}>R</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--text)' }}>Richard Bunani — Propriétaire de la Concession Mugogo</p>
              <p style={{ fontSize: '.84rem', color: 'var(--muted)', marginTop: '3px' }}>
                WhatsApp &amp; Tél : <strong>+243 976960983</strong> · Email : <strong>richardbunani2013@gmail.com</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: 'var(--b50)', padding: '6rem clamp(1rem,6vw,4rem)', maxWidth: '820px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-block', background: 'var(--b100)', color: 'var(--b700)', fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', border: '1px solid var(--b200)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.07em' }}>
            Témoignages
          </div>
          <h2 className="anim-fade-up" style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.7rem,4vw,2.5rem)', fontWeight: 700, color: 'var(--text)' }}>
            Ce que dit l'équipe Mugogo
          </h2>
        </div>
        <div style={{ position: 'relative', minHeight: '230px' }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ position: 'absolute', inset: 0, opacity: i === activeTest ? 1 : 0, transform: i === activeTest ? 'none' : 'translateX(20px)', transition: 'all .65s ease', pointerEvents: i === activeTest ? 'all' : 'none' }}>
              <div style={{ background: 'white', borderRadius: '22px', padding: '2rem 2.5rem', border: '1px solid var(--borderS)', boxShadow: '0 6px 28px rgba(46,31,16,.08)' }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '1.125rem' }}>
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} size={15} style={{ fill: 'var(--b400)', color: 'var(--b400)' }}/>
                  ))}
                </div>
                <p style={{ fontSize: '1.05rem', color: 'var(--text)', lineHeight: 1.72, marginBottom: '1.375rem', fontStyle: 'italic' }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', color: 'var(--accent)', border: '2px solid var(--b300)', flexShrink: 0 }}>{t.name.charAt(0)}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '.9rem' }}>{t.name}</p>
                    <p style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16.5rem' }}>
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setActiveTest(i)}
              style={{ width: i === activeTest ? '26px' : '8px', height: '8px', borderRadius: '99px', background: i === activeTest ? 'var(--accent)' : 'var(--b300)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all .35s ease' }}/>
          ))}
        </div>
      </section>

      {/* ── ROLES ── */}
      <section style={{ background: 'var(--b50)', padding: '5.5rem clamp(1rem,6vw,4rem)', borderTop: '1px solid var(--borderS)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-block', background: 'var(--b100)', color: 'var(--b700)', fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px', border: '1px solid var(--b200)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '.07em' }}>
            Rôles & Accès
          </div>
          <h2 className="anim-fade-up" style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.7rem,4vw,2.5rem)', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
            Un accès adapté à chaque rôle
          </h2>
        </div>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.875rem' }}>
          {[
            { role: 'Propriétaire',    who: 'Richard Bunani',       access: 'Accès total — toute la concession', ac: true },
            { role: 'Directeur',       who: 'Direction générale',   access: 'Vue globale, rapports, finances', ac: false },
            { role: 'Resp. Élevage',   who: 'Pierre Lwambo',        access: 'Cheptel, santé, reproduction', ac: false },
            { role: 'Vétérinaire',     who: 'Dr. David Shabani',    access: 'Santé animale, vaccins', ac: false },
            { role: 'Cultivateur',     who: 'Marie Kahindo & équipe',access: 'Cultures, récoltes, zones', ac: false },
            { role: 'Comptable',       who: 'Joseph Mutombo',       access: 'Finance, salaires', ac: false },
            { role: 'Berger',          who: 'Équipe pâturage',      access: 'Cheptel, pâturages', ac: false },
            { role: 'Visiteur',        who: 'Accès lecture',        access: 'Consultation uniquement', ac: false },
          ].map((r, i) => (
            <div key={i} className="anim-fade-up" style={{ animationDelay: `${i * .05}s`, background: 'white', borderRadius: '14px', padding: '1rem 1.125rem', border: `1px solid ${r.ac ? 'var(--b300)' : 'var(--borderS)'}`, boxShadow: r.ac ? '0 4px 16px rgba(140,110,63,.12)' : '0 1px 4px rgba(46,31,16,.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                <p style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--text)' }}>{r.role}</p>
                {r.ac && <span className="badge badge-acc" style={{ fontSize: '.66rem' }}>Admin</span>}
              </div>
              <p style={{ fontSize: '.78rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '.25rem' }}>{r.who}</p>
              <p style={{ fontSize: '.76rem', color: 'var(--muted)', lineHeight: 1.45 }}>{r.access}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ background: 'var(--b800)', padding: '6rem clamp(1rem,6vw,4rem)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-70px', right: '-70px', width: '280px', height: '280px', borderRadius: '50%', background: 'var(--b700)', opacity: .5 }}/>
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'var(--b600)', opacity: .4 }}/>
        <Particles count={12} color="rgba(255,255,255,.08)"/>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <h2 className="anim-fade-up" style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.7rem,4vw,2.75rem)', fontWeight: 700, color: 'white', marginBottom: '1rem', lineHeight: 1.2 }}>
            {homeContent.ctaTitle}
          </h2>
          <p className="anim-fade-up d2" style={{ fontSize: '1rem', color: 'rgba(255,255,255,.68)', marginBottom: '2.25rem', lineHeight: 1.65 }}>
            {homeContent.ctaSubtitle}
          </p>
          <div className="anim-fade-up d3" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <MagneticBtn onClick={() => navigate('/connexion')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '12px', background: 'var(--b50)', color: 'var(--b800)', border: 'none', fontSize: '1rem', fontWeight: 700 }}>
              Se connecter <ArrowRight size={17}/>
            </MagneticBtn>
            <MagneticBtn onClick={() => navigate('/inscription')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 24px', borderRadius: '12px', background: 'rgba(255,255,255,.1)', color: 'white', border: '1px solid rgba(255,255,255,.22)', fontSize: '1rem', fontWeight: 600 }}>
              Demander un accès
            </MagneticBtn>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--b900)', padding: '2rem clamp(1rem,6vw,4rem)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'var(--b600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--b200)" strokeWidth="2.3">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <span style={{ fontFamily: 'Georgia,serif', fontSize: '12.5px', fontWeight: 700, color: 'var(--b400)' }}>Concession Mugogo</span>
              <span style={{ fontSize: '10px', color: 'var(--b600)', marginLeft: '6px' }}>Walungu, Sud-Kivu, RDC</span>
            </div>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--b600)' }}>© 2025 — Propriété de Richard Bunani — Tous droits réservés</p>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            {['FR', 'SW', 'SH'].map(l => (
              <span key={l} style={{ fontSize: '11px', color: 'var(--b500)', cursor: 'pointer', fontWeight: 700, transition: 'color .12s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--b300)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--b500)')}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
