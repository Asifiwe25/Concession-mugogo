import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LangSwitcher, useLang } from '@/context/LanguageContext'
import { useAuthStore } from '@/context/authStore'
import { useExtraStore, useHomeStore } from '@/store/extraStore'
import {
  ArrowRight, ChevronDown, BarChart3, Users, Package, Sprout,
  Shield, Globe, CheckCircle, Star, TrendingUp, MapPin,
  Beef, Wrench, DollarSign, Bell, FileText, Wheat,
  Mic, MicOff, Video, Send, FileText as FileIcon, Loader2, X, Menu
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import Lenis from 'lenis'
import { MugogoLogo } from '@/components/ui/MugogoLogo'
import { toast } from '@/components/ui/crud'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

// ── Lenis singleton ────────────────────────────────────────────
let lenisInstance: Lenis | null = null
let rafId: number | null = null

function initLenis() {
  if (lenisInstance) { lenisInstance.destroy(); lenisInstance = null }
  if (rafId) { cancelAnimationFrame(rafId); rafId = null }

  const lenis = new Lenis({
    duration: 1.6,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.8,
    infinite: false,
  })

  lenis.on('scroll', ScrollTrigger.update)

  const raf = (time: number) => {
    lenis.raf(time)
    rafId = requestAnimationFrame(raf)
  }
  rafId = requestAnimationFrame(raf)

  lenisInstance = lenis
  return lenis
}

// ── Split text into spans ──────────────────────────────────────
function splitChars(text: string, className: string) {
  return text.split('').map((ch, i) => (
    <span key={i} className={className} style={{ display:'inline-block', willChange:'transform,opacity' }}>
      {ch === ' ' ? '\u00a0' : ch}
    </span>
  ))
}

// ── Animated Counter ──────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const done = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true
        gsap.to({ n: 0 }, {
          n: target, duration: 2, ease: 'power3.out',
          onUpdate: function() { setVal(Math.round(this.targets()[0].n)) }
        })
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target])
  return <span ref={ref}>{val}{suffix}</span>
}

// ── Magnetic Button ───────────────────────────────────────────
function MagneticBtn({ children, onClick, style, className }: any) {
  const ref = useRef<HTMLButtonElement>(null)
  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current!
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    gsap.to(el, { x: x * 0.25, y: y * 0.25, duration: 0.4, ease: 'power3.out' })
  }
  const handleLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' })
  }
  return (
    <button ref={ref} onClick={onClick} onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={style} className={className}>
      {children}
    </button>
  )
}

// ── Feature Card with 3D tilt ─────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, index }: { icon: any; title: string; desc: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [hov, setHov] = useState(false)

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current!
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    gsap.to(el, { rotateY: x * 12, rotateX: -y * 12, duration: 0.3, ease: 'power2.out', transformPerspective: 800 })
  }
  const handleLeave = () => {
    gsap.to(ref.current, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' })
    setHov(false)
  }

  return (
    <div ref={ref} className="feature-card"
      onMouseMove={handleMove} onMouseEnter={() => setHov(true)} onMouseLeave={handleLeave}
      style={{
        background: hov ? 'var(--accent)' : 'white',
        border: `1px solid ${hov ? 'var(--accent)' : 'var(--borderS)'}`,
        borderRadius: '18px', padding: '1.5rem 1.25rem',
        cursor: 'default', willChange: 'transform',
        transition: 'background .3s, border-color .3s',
        boxShadow: hov ? '0 20px 60px rgba(140,110,63,.25)' : '0 2px 12px rgba(46,31,16,.05)',
      }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: hov ? 'rgba(255,255,255,.18)' : 'var(--b100)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', transition: 'background .3s' }}>
        <Icon size={20} style={{ color: hov ? 'white' : 'var(--accent)', transition: 'color .3s' }}/>
      </div>
      <h3 style={{ fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: '.95rem', color: hov ? 'white' : 'var(--text)', marginBottom: '.375rem', transition: 'color .3s' }}>{title}</h3>
      <p style={{ fontSize: '.8rem', color: hov ? 'rgba(255,255,255,.78)' : 'var(--muted)', lineHeight: 1.6, transition: 'color .3s' }}>{desc}</p>
    </div>
  )
}

// ── Report Form ───────────────────────────────────────────────
function ReportForm({ onClose }: { onClose: () => void }) {
  const { addFieldReport } = useExtraStore()
  const [type, setType] = useState<'text'|'voice'|'video'>('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [file, setFile] = useState<File|null>(null)
  const [status, setStatus] = useState<'idle'|'sending'|'sent'>('idle')
  const [recTime, setRecTime] = useState(0)
  const [recActive, setRecActive] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const fileRef = useRef<HTMLInputElement>(null)
  const recRef = useRef<any>(null)
  const fmtTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const startRec = () => { setRecActive(true); setRecTime(0); recRef.current = setInterval(() => setRecTime(t=>t+1), 1000) }
  const stopRec = () => { setRecActive(false); clearInterval(recRef.current) }

  const handleSend = async () => {
    const e: any = {}
    if (!title.trim()) e.title = true
    if (!name.trim()) e.name = true
    if (Object.keys(e).length) { setErrors(e); return }
    setStatus('sending')
    await new Promise(r => setTimeout(r, 1200))
    addFieldReport({ authorId:'public', authorName: name, authorRole: role||'Visiteur', type, title, content, category:'daily', fileName: file?.name })
    setStatus('sent')
    toast('Rapport envoyé à Richard Bunani')
  }

  if (status === 'sent') return (
    <div style={{ textAlign:'center', padding:'2rem 1rem' }}>
      <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'var(--okBg)', border:'2px solid var(--ok)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
        <CheckCircle size={28} style={{ color:'var(--ok)' }}/>
      </div>
      <h3 style={{ fontFamily:'Georgia,serif', fontSize:'1.3rem', fontWeight:700, marginBottom:'.5rem' }}>Rapport envoyé</h3>
      <p style={{ fontSize:'.88rem', color:'var(--muted)', marginBottom:'1.5rem', lineHeight:1.65 }}>
        Transmis à <strong>Richard Bunani</strong> — tableau de bord, WhatsApp et email.
      </p>
      <div style={{ display:'flex', gap:'8px', justifyContent:'center' }}>
        <button onClick={() => { setStatus('idle'); setTitle(''); setContent(''); setName(''); setRole(''); setFile(null); setRecTime(0) }}
          style={{ padding:'9px 18px', borderRadius:'10px', border:'1px solid var(--border)', background:'var(--surface2)', cursor:'pointer', fontSize:'.84rem' }}>
          Envoyer un autre rapport
        </button>
        <button onClick={onClose} style={{ padding:'9px 18px', borderRadius:'10px', background:'var(--accent)', color:'white', border:'none', cursor:'pointer', fontSize:'.84rem', fontWeight:700 }}>Fermer</button>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
        {[
          { v:'text', label:'Écrit', icon:FileIcon },
          { v:'voice', label:'Vocal', icon:Mic },
          { v:'video', label:'Vidéo', icon:Video },
        ].map(t => (
          <button key={t.v} onClick={() => setType(t.v as any)}
            style={{ padding:'12px 8px', borderRadius:'12px', border:`1.5px solid ${type===t.v?'var(--accent)':'var(--border)'}`, background:type===t.v?'var(--accentS)':'white', cursor:'pointer', textAlign:'center', transition:'all .2s' }}>
            <t.icon size={18} style={{ color:type===t.v?'var(--accent)':'var(--light)', margin:'0 auto 5px', display:'block' }}/>
            <p style={{ fontSize:'.78rem', fontWeight:700, color:type===t.v?'var(--accent)':'var(--muted)' }}>{t.label}</p>
          </button>
        ))}
      </div>

      <div className="form-grid">
        <div>
          <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'var(--muted)', marginBottom:'.3rem', textTransform:'uppercase' }}>Votre nom *</label>
          <input className={`input${errors.name?' inp-err':''}`} value={name} onChange={e=>setName(e.target.value)} placeholder="Jean Katumba"/>
        </div>
        <div>
          <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'var(--muted)', marginBottom:'.3rem', textTransform:'uppercase' }}>Votre rôle</label>
          <input className="input" value={role} onChange={e=>setRole(e.target.value)} placeholder="Berger, Cultivateur..."/>
        </div>
      </div>

      <div>
        <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'var(--muted)', marginBottom:'.3rem', textTransform:'uppercase' }}>Titre du rapport *</label>
        <input className={`input${errors.title?' inp-err':''}`} value={title} onChange={e=>setTitle(e.target.value)} placeholder="ex: Rapport Zone A — matin"/>
      </div>

      {type === 'text' && (
        <div>
          <label style={{ display:'block', fontSize:'.72rem', fontWeight:700, color:'var(--muted)', marginBottom:'.3rem', textTransform:'uppercase' }}>Observations</label>
          <textarea className="input" rows={4} value={content} onChange={e=>setContent(e.target.value)} style={{ resize:'vertical' }} placeholder="Décrivez ce que vous observez..."/>
        </div>
      )}

      {type === 'voice' && (
        <div style={{ background:'var(--b100)', borderRadius:'14px', padding:'1.5rem', textAlign:'center', border:'1px solid var(--b300)' }}>
          {!recActive ? (
            <>
              {recTime > 0 && <p style={{ fontFamily:'monospace', fontSize:'1.5rem', fontWeight:700, color:'var(--accent)', marginBottom:'.875rem' }}>{fmtTime(recTime)}</p>}
              <button onClick={startRec} style={{ padding:'10px 24px', borderRadius:'12px', background:'var(--accent)', color:'white', border:'none', cursor:'pointer', fontWeight:700 }}>
                <Mic size={14} style={{ display:'inline', marginRight:'6px' }}/>Démarrer
              </button>
            </>
          ) : (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:'8px', justifyContent:'center', marginBottom:'.875rem' }}>
                <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:'var(--err)', animation:'pulse 1s infinite' }}/>
                <span style={{ fontFamily:'monospace', fontSize:'1.5rem', fontWeight:700, color:'var(--err)' }}>{fmtTime(recTime)}</span>
              </div>
              <button onClick={stopRec} style={{ padding:'10px 24px', borderRadius:'12px', background:'var(--err)', color:'white', border:'none', cursor:'pointer', fontWeight:700 }}>
                <MicOff size={14} style={{ display:'inline', marginRight:'6px' }}/>Arrêter
              </button>
            </>
          )}
        </div>
      )}

      {type === 'video' && (
        <div>
          <input ref={fileRef} type="file" accept="video/*" style={{ display:'none' }} onChange={e=>setFile(e.target.files?.[0]||null)}/>
          <div onClick={() => fileRef.current?.click()}
            style={{ background:'var(--b100)', borderRadius:'14px', padding:'2rem', textAlign:'center', border:`2px dashed ${file?'var(--accent)':errors.file?'var(--err)':'var(--b300)'}`, cursor:'pointer', transition:'all .2s' }}>
            {file ? <p style={{ fontWeight:700, color:'var(--accent)' }}>{file.name}</p> : <p style={{ color:'var(--muted)' }}>Cliquer pour sélectionner une vidéo</p>}
          </div>
        </div>
      )}

      <button onClick={handleSend} disabled={status==='sending'}
        style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', padding:'13px', borderRadius:'12px', background:'var(--accent)', color:'white', border:'none', cursor:status==='sending'?'not-allowed':'pointer', fontWeight:700, fontSize:'.95rem', opacity:status==='sending'?.7:1 }}>
        {status==='sending' ? <><Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/> Envoi...</> : <><Send size={15}/> Envoyer à Richard Bunani</>}
      </button>
    </div>
  )
}

// ── TypeWriter ─────────────────────────────────────────────────
function TypeWriter({ words, speed = 80 }: { words: string[]; speed?: number }) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)
  useEffect(() => {
    const word = words[wordIdx]
    const delay = deleting ? speed / 2.5 : charIdx === word.length ? 2200 : speed
    const timer = setTimeout(() => {
      if (!deleting && charIdx < word.length) { setDisplay(word.slice(0, charIdx+1)); setCharIdx(c=>c+1) }
      else if (!deleting && charIdx === word.length) setDeleting(true)
      else if (deleting && charIdx > 0) { setDisplay(word.slice(0, charIdx-1)); setCharIdx(c=>c-1) }
      else { setDeleting(false); setWordIdx(w=>(w+1)%words.length) }
    }, delay)
    return () => clearTimeout(timer)
  }, [display, wordIdx, charIdx, deleting, words, speed])
  return <span style={{ borderRight:'2.5px solid var(--accent)', paddingRight:'2px', animation:'cursorBlink 1s step-end infinite' }}>{display}</span>
}

// ── MAIN HOMEPAGE ──────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { lang: currentLang, setLang, langs } = useLang()
  const { isAuthenticated } = useAuthStore()
  const { homeContent } = useHomeStore()
  const reportRef  = useRef<HTMLDivElement>(null)
  const heroRef    = useRef<HTMLDivElement>(null)
  const navRef     = useRef<HTMLElement>(null)
  const [showReport, setShowReport] = useState(false)
  const [activeTest, setActiveTest] = useState(0)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [scrolled,   setScrolled]   = useState(false)

  // Testimonials auto-advance
  useEffect(() => {
    const id = setInterval(() => setActiveTest(p => (p+1) % TESTIMONIALS.length), 5500)
    return () => clearInterval(id)
  }, [])

  const scrollToReport = () => {
    setShowReport(true)
    setTimeout(() => {
      if (reportRef.current && lenisInstance) {
        lenisInstance.scrollTo(reportRef.current, { offset: -80, duration: 1.8 })
      }
    }, 100)
  }

  // ── Main GSAP + Lenis init ────────────────────────────────────
  useEffect(() => {
    const lenis = initLenis()

    // Scroll → navbar style
    lenis.on('scroll', ({ scroll, velocity }: any) => {
      setScrolled(scroll > 60)
      // Parallax via scroll velocity
      if (heroRef.current) {
        const bg1 = heroRef.current.querySelector('.hero-bg-circle-1') as HTMLElement
        const bg2 = heroRef.current.querySelector('.hero-bg-circle-2') as HTMLElement
        if (bg1) gsap.to(bg1, { y: scroll * -0.25, ease:'none', duration:0 })
        if (bg2) gsap.to(bg2, { y: scroll * -0.15, ease:'none', duration:0 })
      }
    })

    // ── Hero entrance (stagger chars) ──────────────────────────
    const heroCtx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 })

      tl.fromTo('.hero-badge',
        { opacity: 0, y: 24, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.7)' }
      )
      .fromTo('.hero-char-1',
        { opacity: 0, y: 60, rotateX: -45 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.6, ease: 'power3.out', stagger: 0.025 },
        '-=0.3'
      )
      .fromTo('.hero-char-2',
        { opacity: 0, y: 60, rotateX: -45 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.6, ease: 'power3.out', stagger: 0.02 },
        '-=0.4'
      )
      .fromTo('.hero-sub',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.2'
      )
      .fromTo('.hero-cta',
        { opacity: 0, y: 24, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.7)' },
        '-=0.4'
      )
      .fromTo('.hero-stat-item',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.1 },
        '-=0.4'
      )
      .fromTo('.hero-scroll-indicator',
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: 'power2.out' },
        '-=0.2'
      )
    }, heroRef)

    // ── Section reveals with clip-path ─────────────────────────
    const sections = gsap.utils.toArray('.reveal-section') as Element[]
    sections.forEach((el, i) => {
      gsap.fromTo(el,
        { clipPath: 'inset(8% 0% 0% 0%)', opacity: 0, y: 40 },
        {
          clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, y: 0,
          duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true }
        }
      )
    })

    // ── Features — stagger with bounce ─────────────────────────
    gsap.fromTo('.feature-card',
      { opacity: 0, y: 50, scale: 0.92 },
      {
        opacity: 1, y: 0, scale: 1,
        duration: 0.65, ease: 'back.out(1.4)', stagger: { amount: 0.8, grid: 'auto', from: 'start' },
        scrollTrigger: { trigger: '.features-grid', start: 'top 82%', once: true }
      }
    )

    // ── Stats band ─────────────────────────────────────────────
    gsap.fromTo('.stat-item',
      { opacity: 0, scale: 0.7, y: 20 },
      {
        opacity: 1, scale: 1, y: 0,
        duration: 0.7, ease: 'back.out(2)', stagger: 0.15,
        scrollTrigger: { trigger: '.stats-band', start: 'top 88%', once: true }
      }
    )

    // ── About section — split reveal ───────────────────────────
    gsap.fromTo('.about-text',
      { opacity: 0, x: -50 },
      {
        opacity: 1, x: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-text', start: 'top 82%', once: true }
      }
    )
    gsap.fromTo('.about-card',
      { opacity: 0, x: 50, rotateY: 8 },
      {
        opacity: 1, x: 0, rotateY: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.about-card', start: 'top 82%', once: true }
      }
    )

    // ── Section headings — letter stagger ─────────────────────
    gsap.utils.toArray('.section-heading-char').forEach((el: any) => {
      gsap.fromTo(el,
        { opacity: 0, y: 40, rotateX: -60 },
        {
          opacity: 1, y: 0, rotateX: 0, duration: 0.5, ease: 'power3.out',
          scrollTrigger: {
            trigger: el.parentElement,
            start: 'top 85%', once: true
          },
          delay: parseFloat(el.dataset.delay || '0')
        }
      )
    })

    // ── Testimonials slide in ──────────────────────────────────
    gsap.fromTo('.testimonial-box',
      { opacity: 0, y: 40, scale: 0.96 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: '.testimonial-box', start: 'top 85%', once: true }
      }
    )

    // ── Roles table rows ───────────────────────────────────────
    gsap.fromTo('.role-row',
      { opacity: 0, x: -30 },
      {
        opacity: 1, x: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08,
        scrollTrigger: { trigger: '.roles-table', start: 'top 82%', once: true }
      }
    )

    // ── Report section ─────────────────────────────────────────
    gsap.fromTo('.report-section-content',
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.report-section-content', start: 'top 85%', once: true }
      }
    )

    // ── CTA ────────────────────────────────────────────────────
    gsap.fromTo('.cta-content',
      { opacity: 0, scale: 0.94, y: 30 },
      {
        opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '.cta-section', start: 'top 85%', once: true }
      }
    )

    // ── Floating particles ─────────────────────────────────────
    gsap.utils.toArray('.hero-particle').forEach((el: any, i) => {
      gsap.to(el, {
        y: `${-20 - i * 8}px`,
        x: `${(i % 2 === 0 ? 1 : -1) * (8 + i * 3)}px`,
        rotation: i % 2 === 0 ? 15 : -15,
        duration: 2.5 + i * 0.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.3
      })
    })

    return () => {
      heroCtx.revert()
      ScrollTrigger.getAll().forEach(t => t.kill())
      if (lenisInstance) { lenisInstance.destroy(); lenisInstance = null }
      if (rafId) { cancelAnimationFrame(rafId); rafId = null }
    }
  }, [])

  const FEATURES = [
    { icon:BarChart3, title: t('nav.dashboard','Tableau de bord'),  desc:'KPIs temps réel, alertes, rapports, accès rapide.' },
    { icon:Beef,      title: t('nav.livestock','Élevage'),           desc:'Suivi individuel — vaccinations, santé, reproduction.' },
    { icon:Sprout,    title: t('nav.crops','Cultures'),              desc:'Calendrier cultural, semis, récoltes, traitements.' },
    { icon:Package,   title: t('nav.stock','Stock'),                 desc:'Alertes automatiques, mouvements, traçabilité.' },
    { icon:DollarSign,title: t('nav.finance','Finance'),             desc:'Revenus, dépenses, salaires, budget prévisionnel.' },
    { icon:Users,     title: t('nav.employees','Employés'),          desc:'Dossiers, présences, performance, fiche de paie.' },
    { icon:Bell,      title: t('nav.alerts','Alertes'),              desc:'Notifications automatiques — stock, santé, récoltes.' },
    { icon:Shield,    title: t('nav.audit','Sécurité'),              desc:'Rôles différenciés, audit log, sessions 8h.' },
    { icon:FileText,  title: t('nav.reports','Rapports'),            desc:'PDF et Word — journalier, mensuel, annuel.' },
    { icon:Globe,     title: '4 Langues',                            desc:'Français, English, Kiswahili, Mashi.' },
    { icon:Wrench,    title: t('nav.machines','Machines'),           desc:'Tracteurs, pompes, véhicules — heures et maintenance.' },
    { icon:Wheat,     title: t('nav.harvests','Récoltes'),           desc:'Quantités, destinations, qualité, historique.' },
  ]

  const TESTIMONIALS = homeContent.testimonials

  const ROLES = [
    { role: t('roles.super_admin','Propriétaire'),        access: 'Accès total à tout le système',               color:'var(--accent)' },
    { role: t('roles.livestock_manager','Resp. Élevage'), access: 'Élevage, santé animale, rapports',             color:'var(--b600)' },
    { role: t('roles.farmer','Cultivateur'),              access: 'Cultures, récoltes, zones',                    color:'var(--ok)' },
    { role: t('roles.accountant','Comptable'),            access: 'Finance, paie, budgets',                       color:'var(--warn)' },
    { role: t('roles.vet','Vétérinaire'),                 access: 'Santé animale, vaccinations, traitements',     color:'var(--b500)' },
    { role: t('roles.visitor','Visiteur'),                access: 'Lecture seule, rapports publics',              color:'var(--light)' },
  ]

  const PARTICLES = Array.from({ length: 8 }).map((_, i) => ({
    left: `${8 + i * 12}%`, top: `${15 + (i % 4) * 20}%`,
    size: 3 + (i % 4) * 3, opacity: 0.08 + (i % 4) * 0.05
  }))

  return (
    <div style={{ background:'var(--bg)', minHeight:'100vh', overflowX:'hidden', fontFamily:'system-ui,sans-serif' }}>
      <style>{`
        @keyframes cursorBlink { 0%,100%{border-color:var(--accent)} 50%{border-color:transparent} }
        @keyframes pulse       { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes spin        { to{transform:rotate(360deg)} }
        @keyframes fadeUpIn    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes floatY      { from{transform:translateY(0)} to{transform:translateY(-12px)} }
        @keyframes gradShift   { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .hero-section { position:relative; min-height:100vh; display:flex; align-items:center; justify-content:center; overflow:hidden; background:var(--b800); }
        .reveal-section { will-change:transform,opacity; }
        .inp-err { border-color:var(--err) !important; }
        .nav-btn-ghost { background:transparent; border:1px solid rgba(255,255,255,.2); color:rgba(255,255,255,.8); padding:8px 18px; border-radius:99px; font-size:.84rem; cursor:pointer; transition:all .2s; }
        .nav-btn-ghost:hover { background:rgba(255,255,255,.1); border-color:rgba(255,255,255,.4); }
        .hero-gradient-text { background: linear-gradient(135deg, #d4b87a 0%, #f7d99e 40%, #8c6e3f 70%, #c8af8a 100%); background-size:300% 300%; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:gradShift 4s ease infinite; }
        .section-heading { perspective:600px; }
        .magnetic-wrap { display:inline-block; }
        @media(max-width:640px){ .hero-section{min-height:100svh} }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav ref={navRef} style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 clamp(1rem,5vw,3rem)', height:'64px',
        background: scrolled ? 'rgba(46,31,16,.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,.08)' : 'none',
        transition:'all .4s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }} onClick={() => lenisInstance?.scrollTo(0, { duration:1.6 })}>
          <MugogoLogo size={32} color="rgba(255,255,255,0.9)"/>
          <span style={{ fontFamily:'Georgia,serif', fontSize:'15px', fontWeight:700, color:'white', lineHeight:1.2 }}>Concession<br/>Mugogo</span>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ display:'flex', gap:'6px' }}>
            {langs.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)}
                style={{ padding:'4px 10px', borderRadius:'99px', border:`1px solid ${currentLang===l.code?'rgba(255,255,255,.6)':'rgba(255,255,255,.15)'}`, background:currentLang===l.code?'rgba(255,255,255,.15)':'transparent', color:currentLang===l.code?'white':'rgba(255,255,255,.5)', cursor:'pointer', fontSize:'11px', fontWeight:700, transition:'all .2s' }}>
                {l.flag}
              </button>
            ))}
          </div>
          <button onClick={() => isAuthenticated ? navigate('/tableau-de-bord') : navigate('/connexion')}
            className="nav-btn-ghost">
            {isAuthenticated ? t('nav.dashboard','Dashboard') : t('auth.login','Connexion')}
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section" ref={heroRef}>
        {/* Parallax circles */}
        <div className="hero-bg-circle-1" style={{ position:'absolute', top:'-15%', right:'-8%', width:'700px', height:'700px', borderRadius:'50%', background:'rgba(140,110,63,.1)', willChange:'transform' }}/>
        <div className="hero-bg-circle-2" style={{ position:'absolute', bottom:'-20%', left:'-6%', width:'550px', height:'550px', borderRadius:'50%', background:'rgba(200,175,138,.07)', willChange:'transform' }}/>
        {/* Grain overlay */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.04\'/%3E%3C/svg%3E")', opacity:.4, pointerEvents:'none' }}/>

        {/* Floating particles */}
        {PARTICLES.map((p,i) => (
          <div key={i} className="hero-particle" style={{ position:'absolute', left:p.left, top:p.top, width:`${p.size}px`, height:`${p.size}px`, borderRadius:'50%', background:'rgba(200,175,138,.7)', opacity:p.opacity, willChange:'transform' }}/>
        ))}

        <div style={{ position:'relative', zIndex:2, textAlign:'center', maxWidth:'860px', padding:'80px clamp(1rem,5vw,3rem) 60px' }}>
          {/* Badge */}
          <div className="hero-badge" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.15)', borderRadius:'99px', padding:'7px 20px', marginBottom:'2rem', backdropFilter:'blur(12px)' }}>
            <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:'#4ade80', animation:'pulse 2s infinite' }}/>
            <span style={{ fontSize:'12px', color:'rgba(255,255,255,.75)', fontWeight:600, letterSpacing:'.04em' }}>
              {t('app.subtitle','Walungu, Sud-Kivu, RDC')} · Système actif
            </span>
          </div>

          {/* Title line 1 — split chars */}
          <h1 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(2.2rem,5.5vw,4.5rem)', fontWeight:700, color:'rgba(255,255,255,.55)', lineHeight:1.1, marginBottom:'.2rem', letterSpacing:'-.02em', perspective:'600px' }}>
            {splitChars(t('home.heroLine1','Bienvenue sur le système de la'), 'hero-char-1')}
          </h1>

          {/* Title line 2 — gradient animated */}
          <h1 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(2.2rem,5.5vw,4.5rem)', fontWeight:700, lineHeight:1.15, marginBottom:'1.5rem', letterSpacing:'-.02em', perspective:'600px' }}>
            <span className="hero-gradient-text hero-char-2">
              {splitChars('Concession Mugogo', 'hero-char-2')}
            </span>
          </h1>

          {/* Sub + typewriter */}
          <p className="hero-sub" style={{ fontSize:'clamp(.95rem,2vw,1.2rem)', color:'rgba(255,255,255,.55)', lineHeight:1.7, maxWidth:'640px', margin:'0 auto .5rem' }}>
            {t('home.heroManage','Gérez votre exploitation agro-pastorale')} —
          </p>
          <p className="hero-sub" style={{ fontSize:'clamp(.95rem,2vw,1.2rem)', color:'rgba(255,255,255,.85)', fontWeight:600, marginBottom:'2.75rem', minHeight:'2rem' }}>
            <TypeWriter words={[
              t('nav.livestock','élevage') + ' & cheptel',
              t('nav.crops','cultures') + ' & récoltes',
              'finances & RH',
              t('nav.stock','stock') + ' & alertes',
              'rapports PDF & Word',
            ]} speed={75}/>
          </p>

          {/* CTA */}
          <div className="hero-cta" style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap', marginBottom:'3.5rem' }}>
            <MagneticBtn
              onClick={() => isAuthenticated ? navigate('/tableau-de-bord') : navigate('/connexion')}
              style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'15px 36px', borderRadius:'14px', background:'var(--accent)', color:'white', border:'none', fontSize:'1rem', fontWeight:700, cursor:'pointer', boxShadow:'0 8px 40px rgba(140,110,63,.5)', willChange:'transform' }}>
              {isAuthenticated ? t('nav.dashboard','Tableau de bord') : t('home.ctaBtn1','Se connecter')} <ArrowRight size={18}/>
            </MagneticBtn>
            <MagneticBtn
              onClick={scrollToReport}
              style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'15px 30px', borderRadius:'14px', background:'rgba(255,255,255,.08)', color:'white', border:'1px solid rgba(255,255,255,.22)', fontSize:'1rem', fontWeight:600, cursor:'pointer', backdropFilter:'blur(12px)', willChange:'transform' }}>
              <Send size={17}/> {t('home.sendReport','Envoyer un rapport')}
            </MagneticBtn>
          </div>

          {/* Mini stats */}
          <div style={{ display:'flex', gap:'2.5rem', justifyContent:'center', flexWrap:'wrap' }}>
            {[
              { val:'9', unit:' ha', label:'Superficie' },
              { val:'100', unit:'%', label:'Sécurisé' },
              { val:'4', unit:'', label:'Langues' },
              { val:'12', unit:'+', label:'Modules' },
            ].map((s,i) => (
              <div key={i} className="hero-stat-item" style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'Georgia,serif', fontSize:'1.9rem', fontWeight:700, color:'white', lineHeight:1 }}>
                  {s.val}<span style={{ fontSize:'1rem', color:'rgba(255,255,255,.5)' }}>{s.unit}</span>
                </div>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,.45)', marginTop:'4px', letterSpacing:'.05em', textTransform:'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll-indicator" style={{ position:'absolute', bottom:'2rem', left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
          <span style={{ fontSize:'9px', color:'rgba(255,255,255,.35)', letterSpacing:'.12em', textTransform:'uppercase' }}>{t('home.scrollDown','Découvrir')}</span>
          <div style={{ width:'22px', height:'36px', borderRadius:'11px', border:'1.5px solid rgba(255,255,255,.18)', display:'flex', justifyContent:'center', paddingTop:'5px' }}>
            <div style={{ width:'3px', height:'7px', borderRadius:'2px', background:'rgba(255,255,255,.45)', animation:'floatY 1.5s ease-in-out infinite' }}/>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      {homeContent.showStats && (
        <section className="stats-band" style={{ background:'var(--accent)', padding:'3.5rem clamp(1rem,6vw,4rem)' }}>
          <div style={{ display:'flex', gap:'3rem', justifyContent:'center', flexWrap:'wrap', maxWidth:'960px', margin:'0 auto' }}>
            {[
              { target:9,   suffix:' ha', label:'Superficie' },
              { target:homeContent.statEmployees, suffix:'', label:t('nav.employees','Employés') },
              { target:homeContent.statZones,     suffix:'', label:t('nav.zones','Zones') },
              { target:100, suffix:'%',  label:'Sécurisé' },
            ].map((s,i) => (
              <div key={i} className="stat-item" style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'Georgia,serif', fontSize:'clamp(2.2rem,4vw,3.2rem)', fontWeight:700, color:'white', lineHeight:1 }}>
                  <Counter target={s.target} suffix={s.suffix}/>
                </div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,.65)', marginTop:'8px', letterSpacing:'.07em', textTransform:'uppercase', fontWeight:600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ABOUT ── */}
      {homeContent.showAbout && (
        <section className="reveal-section" style={{ background:'white', padding:'8rem clamp(1rem,6vw,4rem)' }}>
          <div style={{ maxWidth:'1100px', margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6rem', alignItems:'center' }}>
            <div className="about-text">
              <div style={{ display:'inline-block', background:'var(--b100)', color:'var(--accent)', fontSize:'11px', fontWeight:700, padding:'5px 14px', borderRadius:'99px', marginBottom:'1.25rem', letterSpacing:'.06em', textTransform:'uppercase' }}>
                {t('home.about','À propos')}
              </div>
              <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(1.8rem,3.5vw,2.6rem)', fontWeight:700, color:'var(--text)', lineHeight:1.25, marginBottom:'1.25rem' }}>
                {homeContent.aboutTitle}
              </h2>
              <p style={{ fontSize:'.95rem', color:'var(--muted)', lineHeight:1.85, marginBottom:'1rem' }}
                dangerouslySetInnerHTML={{ __html: t('homepage.aboutDescription1', homeContent.aboutDescription1) }}/>
              <p style={{ fontSize:'.95rem', color:'var(--muted)', lineHeight:1.85 }}>
                {t('homepage.aboutDesc2short',"L'exploitation couvre")} <strong style={{ color:'var(--text)' }}>9 hectares</strong> de terres agricoles et pastorales, avec un cheptel de bovins Ankole, caprins, volailles et porcins.
              </p>
              <div style={{ display:'flex', gap:'10px', marginTop:'2rem', flexWrap:'wrap' }}>
                {[
                  { icon:MapPin,     label:'Walungu, Sud-Kivu' },
                  { icon:TrendingUp, label:'9 hectares' },
                  { icon:Users,      label:`${homeContent.statEmployees} ${t('nav.employees','employés')}` },
                ].map((item,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px', background:'var(--b50)', padding:'8px 16px', borderRadius:'99px', border:'1px solid var(--b200)' }}>
                    <item.icon size={13} style={{ color:'var(--accent)' }}/>
                    <span style={{ fontSize:'12px', fontWeight:600, color:'var(--b700)' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="about-card" style={{ position:'relative' }}>
              <div style={{ background:'var(--b100)', borderRadius:'28px', padding:'2.5rem', border:'1px solid var(--b200)', position:'relative', overflow:'hidden', boxShadow:'0 20px 60px rgba(140,110,63,.12)' }}>
                <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'150px', height:'150px', borderRadius:'50%', background:'var(--accentS)', opacity:.7 }}/>
                <div style={{ position:'absolute', bottom:'-30px', left:'-30px', width:'100px', height:'100px', borderRadius:'50%', background:'rgba(140,110,63,.08)' }}/>
                <div style={{ position:'relative', zIndex:1 }}>
                  <MugogoLogo size={80} color="#8c6e3f" withText textColor="#2e1f10"/>
                  <div style={{ marginTop:'2rem', display:'flex', flexDirection:'column', gap:'10px' }}>
                    {[
                      { label:'Propriétaire', value:homeContent.ownerName },
                      { label:'Localisation', value:homeContent.location },
                      { label:'Téléphone', value:homeContent.phone },
                      { label:'Email', value:homeContent.email },
                      { label:'Superficie', value:homeContent.area },
                    ].map((item,i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--b200)', fontSize:'.84rem' }}>
                        <span style={{ color:'var(--muted)', fontWeight:600 }}>{item.label}</span>
                        <span style={{ color:'var(--text)', fontWeight:700, textAlign:'right', maxWidth:'60%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES ── */}
      {homeContent.showFeatures && (
        <section className="reveal-section" style={{ background:'var(--b50)', padding:'8rem clamp(1rem,6vw,4rem)' }}>
          <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'4.5rem' }}>
              <div style={{ display:'inline-block', background:'var(--b200)', color:'var(--accent)', fontSize:'11px', fontWeight:700, padding:'5px 14px', borderRadius:'99px', marginBottom:'1rem', letterSpacing:'.06em', textTransform:'uppercase' }}>
                {t('home.features','Fonctionnalités')}
              </div>
              <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(1.8rem,3.5vw,2.6rem)', fontWeight:700, color:'var(--text)', marginBottom:'.875rem' }}>
                {t('homepage.featuresTitle','Tout ce dont vous avez besoin')}
              </h2>
              <p style={{ fontSize:'.95rem', color:'var(--muted)', maxWidth:'520px', margin:'0 auto', lineHeight:1.7 }}>
                {t('homepage.featuresSubtitle','Un système complet pour gérer chaque aspect de la concession')}
              </p>
            </div>
            <div className="features-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:'16px' }}>
              {FEATURES.map((f,i) => (
                <FeatureCard key={i} icon={f.icon} title={f.title} desc={f.desc} index={i}/>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      {homeContent.showTestimonials && TESTIMONIALS.length > 0 && (
        <section className="reveal-section" style={{ background:'var(--b800)', padding:'8rem clamp(1rem,6vw,4rem)' }}>
          <div style={{ maxWidth:'900px', margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'4rem' }}>
              <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(1.8rem,3.5vw,2.6rem)', fontWeight:700, color:'white', marginBottom:'.75rem' }}>
                {t('home.testimonialsTitle','Témoignages')}
              </h2>
              <p style={{ fontSize:'.9rem', color:'rgba(255,255,255,.45)' }}>
                {t('home.testimonialsSubtitle','Ce que dit l\'équipe')}
              </p>
            </div>
            <div className="testimonial-box" style={{ background:'rgba(255,255,255,.06)', borderRadius:'28px', padding:'3rem', border:'1px solid rgba(255,255,255,.1)', backdropFilter:'blur(12px)', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'200px', height:'200px', borderRadius:'50%', background:'rgba(140,110,63,.15)' }}/>
              <div style={{ fontSize:'3rem', color:'rgba(200,175,138,.3)', lineHeight:1, marginBottom:'1rem' }}>"</div>
              <div style={{ position:'relative', zIndex:1 }}>
                <p style={{ fontSize:'clamp(1rem,2vw,1.15rem)', color:'rgba(255,255,255,.85)', lineHeight:1.8, fontStyle:'italic', marginBottom:'2rem', minHeight:'80px' }}>
                  {TESTIMONIALS[activeTest]?.text}
                </p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:'46px', height:'46px', borderRadius:'50%', background:'var(--accentS)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'1.1rem', color:'var(--accent)', border:'2px solid var(--b400)' }}>
                      {(TESTIMONIALS[activeTest]?.name||'?').charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontWeight:700, color:'white', fontSize:'.95rem' }}>{TESTIMONIALS[activeTest]?.name}</p>
                      <p style={{ fontSize:'.8rem', color:'rgba(255,255,255,.5)' }}>{TESTIMONIALS[activeTest]?.role}</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'6px' }}>
                    {TESTIMONIALS.map((_,i) => (
                      <button key={i} onClick={() => setActiveTest(i)}
                        style={{ width: i===activeTest?'24px':'8px', height:'8px', borderRadius:'99px', background: i===activeTest?'var(--accent)':'rgba(255,255,255,.25)', border:'none', cursor:'pointer', transition:'all .4s cubic-bezier(.4,0,.2,1)', padding:0 }}/>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── ROLES ── */}
      {homeContent.showRoles && (
        <section className="reveal-section" style={{ background:'white', padding:'8rem clamp(1rem,6vw,4rem)' }}>
          <div style={{ maxWidth:'900px', margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'4rem' }}>
              <div style={{ display:'inline-block', background:'var(--b100)', color:'var(--accent)', fontSize:'11px', fontWeight:700, padding:'5px 14px', borderRadius:'99px', marginBottom:'1rem', letterSpacing:'.06em', textTransform:'uppercase' }}>
                {t('homepage.roleTitle','Rôles et accès')}
              </div>
              <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(1.8rem,3.5vw,2.6rem)', fontWeight:700, color:'var(--text)' }}>
                {t('homepage.roleSubtitle','Chaque membre de l\'équipe a un accès adapté')}
              </h2>
            </div>
            <div className="roles-table" style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {ROLES.map((r,i) => (
                <div key={i} className="role-row" style={{ display:'flex', alignItems:'center', gap:'16px', padding:'14px 20px', borderRadius:'14px', background:'var(--b50)', border:'1px solid var(--borderS)', transition:'all .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='var(--b100)'; (e.currentTarget as HTMLElement).style.borderColor='var(--b300)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='var(--b50)'; (e.currentTarget as HTMLElement).style.borderColor='var(--borderS)' }}>
                  <div style={{ width:'10px', height:'10px', borderRadius:'50%', background:r.color, flexShrink:0 }}/>
                  <span style={{ fontWeight:700, color:'var(--text)', minWidth:'160px', fontSize:'.9rem' }}>{r.role}</span>
                  <span style={{ fontSize:'.84rem', color:'var(--muted)', flex:1 }}>{r.access}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── REPORT SECTION ── */}
      {homeContent.showReportSection && (
        <section className="reveal-section" ref={reportRef} style={{ background:'var(--b50)', padding:'8rem clamp(1rem,6vw,4rem)' }}>
          <div className="report-section-content" style={{ maxWidth:'680px', margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'3rem' }}>
              <div style={{ display:'inline-block', background:'var(--b100)', color:'var(--accent)', fontSize:'11px', fontWeight:700, padding:'5px 14px', borderRadius:'99px', marginBottom:'1rem', letterSpacing:'.06em', textTransform:'uppercase' }}>
                Rapport de terrain
              </div>
              <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(1.8rem,3.5vw,2.4rem)', fontWeight:700, color:'var(--text)', marginBottom:'.875rem' }}>
                {t('home.reportTitle','Envoyez votre rapport à Richard Bunani')}
              </h2>
              <p style={{ fontSize:'.9rem', color:'var(--muted)', lineHeight:1.7 }}>
                {t('home.reportSubtitle','Rapportez en quelques secondes')} — sans connexion requise.
              </p>
            </div>
            <div style={{ background:'white', borderRadius:'24px', padding:'2.5rem', border:'1px solid var(--borderS)', boxShadow:'0 20px 60px rgba(140,110,63,.08)' }}>
              {showReport ? <ReportForm onClose={() => setShowReport(false)}/> : (
                <div style={{ textAlign:'center', padding:'2rem' }}>
                  <MagneticBtn onClick={() => setShowReport(true)}
                    style={{ display:'inline-flex', alignItems:'center', gap:'10px', padding:'16px 36px', borderRadius:'14px', background:'var(--accent)', color:'white', border:'none', fontSize:'1rem', fontWeight:700, cursor:'pointer', boxShadow:'0 8px 30px rgba(140,110,63,.35)', willChange:'transform' }}>
                    <Send size={18}/> Ouvrir le formulaire de rapport
                  </MagneticBtn>
                  <p style={{ marginTop:'1rem', fontSize:'.8rem', color:'var(--light)' }}>Écrit · Vocal · Vidéo — gratuit, sans compte</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="cta-section" style={{ background:'var(--b900)', padding:'9rem clamp(1rem,6vw,4rem)', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'-100px', left:'50%', transform:'translateX(-50%)', width:'600px', height:'600px', borderRadius:'50%', background:'rgba(140,110,63,.08)', pointerEvents:'none' }}/>
        <div className="cta-content" style={{ position:'relative', zIndex:1, maxWidth:'640px', margin:'0 auto' }}>
          <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(2rem,4vw,3.2rem)', fontWeight:700, color:'white', marginBottom:'1rem', lineHeight:1.2 }}>
            {homeContent.ctaTitle}
          </h2>
          <p style={{ fontSize:'.95rem', color:'rgba(255,255,255,.5)', marginBottom:'2.5rem', lineHeight:1.7 }}>
            {homeContent.ctaSubtitle}
          </p>
          <div style={{ display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap' }}>
            <MagneticBtn onClick={() => navigate('/connexion')}
              style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'15px 36px', borderRadius:'14px', background:'var(--accent)', color:'white', border:'none', fontSize:'1rem', fontWeight:700, cursor:'pointer', boxShadow:'0 8px 40px rgba(140,110,63,.4)', willChange:'transform' }}>
              {t('home.ctaBtn1','Se connecter')} <ArrowRight size={18}/>
            </MagneticBtn>
            <MagneticBtn onClick={() => navigate('/inscription')}
              style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'15px 30px', borderRadius:'14px', background:'rgba(255,255,255,.08)', color:'white', border:'1px solid rgba(255,255,255,.2)', fontSize:'1rem', fontWeight:600, cursor:'pointer', willChange:'transform' }}>
              {t('home.ctaBtn2','Demander un accès')}
            </MagneticBtn>
          </div>
        </div>
      </section>

      {/* ── LANGUAGE BAR ── */}
      <div style={{ background:'var(--b900)', padding:'.875rem clamp(1rem,6vw,4rem)', display:'flex', alignItems:'center', justifyContent:'center', gap:'1rem', flexWrap:'wrap', borderTop:'1px solid rgba(255,255,255,.06)' }}>
        <span style={{ fontSize:'11px', color:'rgba(255,255,255,.3)', letterSpacing:'.06em', textTransform:'uppercase', fontWeight:700 }}>
          {currentLang==='fr'?'Changer de langue':currentLang==='en'?'Language':currentLang==='sw'?'Lugha':'Ururimi'} :
        </span>
        <LangSwitcher variant="full"/>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background:'var(--b900)', padding:'2.5rem clamp(1rem,6vw,4rem)', borderTop:'1px solid rgba(255,255,255,.06)' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <MugogoLogo size={28} color="rgba(255,255,255,0.6)"/>
            <div>
              <p style={{ fontFamily:'Georgia,serif', fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,.6)' }}>Concession Mugogo</p>
              <p style={{ fontSize:'10px', color:'rgba(255,255,255,.3)', marginTop:'1px' }}>
                {t('app.subtitle','Walungu, Sud-Kivu, RDC')}
              </p>
            </div>
          </div>
          <p style={{ fontSize:'11px', color:'rgba(255,255,255,.25)' }}>
            © 2025 — Richard Bunani — {t('home.footerRights','Tous droits réservés')}
          </p>
        </div>
      </footer>
    </div>
  )
}
