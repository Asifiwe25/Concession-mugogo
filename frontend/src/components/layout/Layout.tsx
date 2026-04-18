import React, { useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom'
import { Search, Bell, Home, X, ChevronRight, Menu, LayoutDashboard, Beef, Package, DollarSign, MoreHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Sidebar from './Sidebar'
import { useAuthStore } from '@/context/authStore'
import { useStore } from '@/store/useStore'
import { ToastContainer } from '@/components/ui/crud'
import { LangSwitcher } from '@/context/LanguageContext'

// ── Search engine ──────────────────────────────────────
type SearchItem = { label: string; sub: string; route: string; page: string; icon: string; keywords: string }

function buildSearchIndex(store: any, tFn: Function): SearchItem[] {
  const items: SearchItem[] = []
  const t = (k: string, d: string) => tFn(k, d) as string
  store.animals.forEach((a: any) => items.push({ label: a.localName || a.systemId, sub: `${a.species} · ${a.zone}`, route: '/elevage', page: t('nav.livestock','Élevage'), icon: '🐄', keywords: `${a.localName||''} ${a.systemId} ${a.species} ${a.breed} ${a.tagNumber||''} ${a.zone} ${a.healthStatus}`.toLowerCase() }))
  store.employees.forEach((e: any) => items.push({ label: `${e.firstName} ${e.lastName}`, sub: `${e.role} · ${e.zone}`, route: '/employes', page: t('nav.employees','Employés'), icon: '👤', keywords: `${e.firstName} ${e.lastName} ${e.phone||''} ${e.email||''} ${e.role} ${e.zone}`.toLowerCase() }))
  store.crops.forEach((c: any) => items.push({ label: c.type, sub: `${c.variety||''} · ${c.zone}`, route: '/cultures', page: t('nav.crops','Cultures'), icon: '🌱', keywords: `${c.type} ${c.variety||''} ${c.zone} ${c.status}`.toLowerCase() }))
  store.stock.forEach((s: any) => items.push({ label: s.name, sub: `${s.quantity} ${s.unit} · ${s.category}`, route: '/stock', page: t('nav.stock','Stock'), icon: '📦', keywords: `${s.name} ${s.category} ${s.supplier||''}`.toLowerCase() }))
  store.tasks.forEach((tk: any) => items.push({ label: tk.title, sub: `${tk.status} · ${tk.priority}`, route: '/taches', page: t('nav.tasks','Tâches'), icon: '✓', keywords: `${tk.title} ${tk.status} ${tk.priority}`.toLowerCase() }))
  store.zones.forEach((z: any) => items.push({ label: z.name, sub: `${z.type} · ${z.area}ha`, route: '/zones', page: t('nav.zones','Zones'), icon: '🗺', keywords: `${z.name} ${z.type}`.toLowerCase() }))
  store.machines.forEach((m: any) => items.push({ label: `${m.brand} ${m.model}`, sub: `${m.type} · ${m.status}`, route: '/machines', page: t('nav.machines','Machines'), icon: '⚙', keywords: `${m.brand} ${m.model} ${m.type}`.toLowerCase() }))
  store.transactions.forEach((tr: any) => items.push({ label: tr.description || tr.category, sub: `${tr.amount} USD`, route: '/finance', page: t('nav.finance','Finance'), icon: '💰', keywords: `${tr.description||''} ${tr.category}`.toLowerCase() }))
  store.harvests.forEach((h: any) => items.push({ label: h.cropType, sub: `${h.netQty} ${h.unit} · ${h.zone}`, route: '/recoltes', page: t('nav.harvests','Récoltes'), icon: '🌾', keywords: `${h.cropType} ${h.zone}`.toLowerCase() }))
  return items
}

function GlobalSearch({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const store = useStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); setOpen(false); return }
    const q = query.toLowerCase().trim()
    const found = buildSearchIndex(store, t).filter(item => item.keywords.includes(q))
    setResults(found.slice(0, 10)); setOpen(true); setSelected(-1)
  }, [query, store])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s+1, results.length-1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s-1, -1)) }
    if (e.key === 'Enter' && selected >= 0) handleSelect(results[selected])
    if (e.key === 'Escape') { setOpen(false); setQuery('') }
  }

  const handleSelect = (r: SearchItem) => {
    navigate(r.route); setQuery(''); setOpen(false); setSelected(-1)
    onClose?.()
  }

  const grouped = results.reduce((acc: Record<string, SearchItem[]>, r) => {
    if (!acc[r.page]) acc[r.page] = []
    acc[r.page].push(r); return acc
  }, {})

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
      <Search size={13} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--light)', zIndex:1 }}/>
      <input ref={inputRef} value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKey}
        onFocus={() => results.length > 0 && setOpen(true)}
        className="input"
        style={{ paddingLeft:'32px', paddingRight:query?'32px':'12px', height:'36px', fontSize:'.82rem' }}
        placeholder={t('common.search','Rechercher...')}/>
      {query && (
        <button onClick={() => { setQuery(''); setOpen(false) }}
          style={{ position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--light)', padding:'3px' }}>
          <X size={13}/>
        </button>
      )}
      {open && (
        <div className="search-dropdown" style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'white', borderRadius:'14px', border:'1px solid var(--borderS)', boxShadow:'0 8px 32px rgba(46,31,16,.14)', zIndex:200, overflow:'hidden', maxHeight:'420px', overflowY:'auto' }}>
          {Object.keys(grouped).length === 0 ? (
            <div style={{ padding:'1.25rem', textAlign:'center', color:'var(--muted)', fontSize:'.84rem' }}>
              {t('common.noData','Aucun résultat')} — <strong>"{query}"</strong>
            </div>
          ) : (
            Object.entries(grouped).map(([page, items]) => (
              <div key={page}>
                <div style={{ padding:'7px 13px 4px', background:'var(--b50)', fontSize:'9.5px', fontWeight:700, color:'var(--b600)', textTransform:'uppercase', letterSpacing:'.08em', borderBottom:'1px solid var(--borderS)', display:'flex', alignItems:'center', gap:'5px' }}>
                  <span>{items[0].icon}</span>{page}
                  <span style={{ marginLeft:'auto', background:'var(--b200)', color:'var(--b700)', borderRadius:'99px', padding:'1px 6px', fontSize:'9px' }}>{items.length}</span>
                </div>
                {items.map((r, i) => {
                  const idx = results.indexOf(r)
                  return (
                    <button key={i} onClick={() => handleSelect(r)}
                      style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'10px 13px', background:selected===idx?'var(--accentS)':'transparent', border:'none', cursor:'pointer', textAlign:'left', borderBottom:'1px solid var(--b50)' }}
                      onMouseEnter={() => setSelected(idx)}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:'.84rem', fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.label}</p>
                        <p style={{ fontSize:'.74rem', color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.sub}</p>
                      </div>
                      <ChevronRight size={12} style={{ color:'var(--light)', flexShrink:0 }}/>
                    </button>
                  )
                })}
              </div>
            ))
          )}
          {results.length > 0 && (
            <div style={{ padding:'6px 13px', background:'var(--b50)', fontSize:'10px', color:'var(--light)', borderTop:'1px solid var(--borderS)', display:'flex', gap:'12px' }}>
              <span>↑↓</span><span>↵ {t('common.view','Ouvrir')}</span><span>Esc</span>
              <span style={{ marginLeft:'auto' }}>{results.length} {t('common.results','résultat(s)')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Bottom Navigation Bar (mobile only) ───────────────
function BottomNav() {
  const { t } = useTranslation()
  const { alerts } = useStore()
  const location = useLocation()
  const navigate = useNavigate()
  const newAlerts = alerts.filter(a => a.status === 'new').length
  const [showMore, setShowMore] = useState(false)

  const mainItems = [
    { icon: LayoutDashboard, label: t('nav.dashboard','Dashboard'), route: '/tableau-de-bord' },
    { icon: Beef,            label: t('nav.livestock','Élevage'),   route: '/elevage' },
    { icon: Package,         label: t('nav.stock','Stock'),         route: '/stock' },
    { icon: DollarSign,      label: t('nav.finance','Finance'),     route: '/finance' },
  ]

  return (
    <>
      {showMore && (
        <div style={{ position:'fixed', inset:0, background:'rgba(46,31,16,.5)', zIndex:55, backdropFilter:'blur(4px)' }}
          onClick={() => setShowMore(false)}>
          <div style={{ position:'absolute', bottom:'64px', left:0, right:0, background:'white', borderRadius:'20px 20px 0 0', padding:'1rem', maxHeight:'70vh', overflowY:'auto' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width:'40px', height:'4px', background:'var(--b300)', borderRadius:'99px', margin:'0 auto .875rem' }}/>
            <p style={{ fontWeight:700, fontSize:'13px', marginBottom:'12px', color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em' }}>
              {t('dashboard.quickActions','Navigation')}
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
              {[
                { icon:'🌱', label:t('nav.crops','Cultures'),      route:'/cultures' },
                { icon:'👤', label:t('nav.employees','Employés'),  route:'/employes' },
                { icon:'✓',  label:t('nav.tasks','Tâches'),        route:'/taches' },
                { icon:'🔔', label:t('nav.alerts','Alertes'),      route:'/alertes' },
                { icon:'🗺', label:t('nav.zones','Zones'),         route:'/zones' },
                { icon:'🚜', label:t('nav.machines','Machines'),   route:'/machines' },
                { icon:'🌾', label:t('nav.harvests','Récoltes'),   route:'/recoltes' },
                { icon:'📄', label:t('nav.reports','Rapports'),    route:'/rapports' },
                { icon:'⚙',  label:t('nav.settings','Paramètres'),route:'/parametres' },
                { icon:'🏡', label:t('nav.home','Accueil'),        route:'/' },
                { icon:'🛡', label:t('nav.audit','Audit'),         route:'/audit' },
                { icon:'🌐', label:t('settings.homepage','Admin'), route:'/accueil-admin' },
              ].map(item => (
                <button key={item.route}
                  onClick={() => { navigate(item.route); setShowMore(false) }}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'5px', padding:'12px 6px', borderRadius:'12px', background:location.pathname===item.route?'var(--accentS)':'var(--surface2)', border:`1px solid ${location.pathname===item.route?'var(--accent)':'var(--borderS)'}`, cursor:'pointer' }}>
                  <span style={{ fontSize:'22px' }}>{item.icon}</span>
                  <span style={{ fontSize:'10px', fontWeight:600, color:location.pathname===item.route?'var(--accent)':'var(--muted)', textAlign:'center', lineHeight:1.2 }}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <nav className="bottom-nav">
        {mainItems.map(item => (
          <button key={item.route} className={`bottom-nav-item${location.pathname===item.route?' active':''}`}
            onClick={() => navigate(item.route)}>
            <item.icon size={20}/>
            <span>{item.label}</span>
          </button>
        ))}
        <button className={`bottom-nav-item${showMore?' active':''}`} onClick={() => setShowMore(!showMore)}
          style={{ position:'relative' }}>
          {newAlerts > 0 && <span className="bottom-nav-dot"/>}
          <MoreHorizontal size={20}/>
          <span>{t('common.all','Plus')}</span>
        </button>
      </nav>
    </>
  )
}

// ── Main Layout ────────────────────────────────────────
export default function Layout() {
  const { user } = useAuthStore()
  const { alerts } = useStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const newAlerts = alerts.filter(a => a.status === 'new').length
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change (mobile)
  const location = useLocation()
  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  // Close sidebar on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)' }}>

      {/* Sidebar — slides in on mobile */}
      <div style={{ position:'fixed', left:0, top:0, zIndex:40, height:'100vh',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
      }}
        className="sidebar-wrap">
        <Sidebar onClose={() => setSidebarOpen(false)}/>
      </div>

      {/* Desktop: always visible */}
      <div style={{ width:'224px', flexShrink:0 }} className="sidebar-desktop-space"/>

      {/* Backdrop */}
      <div className={`sidebar-backdrop${sidebarOpen?' show':''}`} onClick={() => setSidebarOpen(false)}/>

      <ToastContainer />

      {/* Main content */}
      <div className="layout-content-mobile" style={{ flex:1, display:'flex', flexDirection:'column', minHeight:'100vh', overflow:'hidden', marginLeft:'224px' }}>

        {/* Topbar */}
        <header style={{ height:'54px', background:'white', borderBottom:'1px solid var(--borderS)', display:'flex', alignItems:'center', padding:'0 14px', gap:'8px', flexShrink:0, position:'sticky', top:0, zIndex:30, boxShadow:'0 1px 4px rgba(46,31,16,.04)' }}>

          {/* Hamburger — mobile only */}
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={18}/>
          </button>

          <GlobalSearch onClose={() => setSidebarOpen(false)}/>
          <div style={{ flex:1 }}/>

          {/* Lang — hidden on small mobile */}
          <div style={{ display:'flex' }} className="lang-desktop">
            <LangSwitcher/>
          </div>

          {/* Home button */}
          <button onClick={() => navigate('/')}
            title={t('nav.home','Page d\'accueil')}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'36px', height:'36px', borderRadius:'9px', border:'1px solid var(--borderS)', background:'white', cursor:'pointer', color:'var(--muted)', transition:'all .13s', flexShrink:0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='var(--accentS)'; (e.currentTarget as HTMLElement).style.color='var(--accent)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='white'; (e.currentTarget as HTMLElement).style.color='var(--muted)' }}>
            <Home size={15}/>
          </button>

          {/* Bell */}
          <button onClick={() => navigate('/alertes')}
            style={{ position:'relative', width:'36px', height:'36px', borderRadius:'9px', background:'transparent', border:'none', cursor:'pointer', color:'var(--muted)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Bell size={17}/>
            {newAlerts > 0 && <span style={{ position:'absolute', top:'6px', right:'6px', width:'7px', height:'7px', background:'var(--err)', borderRadius:'50%', border:'1.5px solid white', animation:'pulse 2s infinite' }}/>}
          </button>

          {/* Avatar */}
          <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'var(--accentS)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'13px', color:'var(--accent)', border:'1.5px solid var(--border)', flexShrink:0 }}>
            {(user?.fullName || 'R').charAt(0)}
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflowY:'auto', padding:'18px 18px 80px' }} className="scrollbar-hide page-main-mobile">
          <div style={{ maxWidth:'1440px', margin:'0 auto' }}>
            <Outlet />
          </div>
        </main>

        {/* Bottom navigation — mobile only */}
        <BottomNav />
      </div>
    </div>
  )
}
