import React, { useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Search, Bell, Home, X, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Sidebar from './Sidebar'
import { useAuthStore } from '@/context/authStore'
import { useStore } from '@/store/useStore'
import { ToastContainer } from '@/components/ui/crud'
import { LangSwitcher } from '@/context/LanguageContext'
import { MugogoLogo } from '@/components/ui/MugogoLogo'

// ── Search engine ─────────────────────────────────────────────
type SearchItem = { label: string; sub: string; route: string; page: string; icon: string; keywords: string }

function buildSearchIndex(store: any, tFn: Function): SearchItem[] {
  const items: SearchItem[] = []
  const t = (k: string, d: string) => tFn(k, d) as string

  store.animals.forEach((a: any) => items.push({
    label: a.localName || a.systemId,
    sub: `${a.species} · ${a.breed} · ${a.zone}`,
    route: '/elevage', page: t('nav.livestock','Élevage'), icon: '🐄',
    keywords: `${a.localName||''} ${a.systemId} ${a.species} ${a.breed} ${a.tagNumber||''} ${a.zone} ${a.healthStatus}`.toLowerCase(),
  }))
  store.employees.forEach((e: any) => items.push({
    label: `${e.firstName} ${e.lastName}`,
    sub: `${e.role} · ${e.zone}`,
    route: '/employes', page: t('nav.employees','Employés'), icon: '👤',
    keywords: `${e.firstName} ${e.lastName} ${e.phone||''} ${e.email||''} ${e.role} ${e.zone}`.toLowerCase(),
  }))
  store.crops.forEach((c: any) => items.push({
    label: c.type, sub: `${c.variety||''} · ${c.zone} · ${c.status}`,
    route: '/cultures', page: t('nav.crops','Cultures'), icon: '🌱',
    keywords: `${c.type} ${c.variety||''} ${c.zone} ${c.status} ${c.responsible||''}`.toLowerCase(),
  }))
  store.stock.forEach((s: any) => items.push({
    label: s.name, sub: `${s.quantity} ${s.unit} · ${s.category} · ${s.status}`,
    route: '/stock', page: t('nav.stock','Stock'), icon: '📦',
    keywords: `${s.name} ${s.category} ${s.supplier||''} ${s.location||''}`.toLowerCase(),
  }))
  store.tasks.forEach((tk: any) => items.push({
    label: tk.title, sub: `${tk.status} · ${tk.priority}`,
    route: '/taches', page: t('nav.tasks','Tâches'), icon: '✓',
    keywords: `${tk.title} ${tk.status} ${tk.priority} ${tk.category||''}`.toLowerCase(),
  }))
  store.zones.forEach((z: any) => items.push({
    label: z.name, sub: `${z.type} · ${z.area}ha · ${z.status}`,
    route: '/zones', page: t('nav.zones','Zones'), icon: '🗺',
    keywords: `${z.name} ${z.type} ${z.responsible||''}`.toLowerCase(),
  }))
  store.machines.forEach((m: any) => items.push({
    label: `${m.brand} ${m.model}`, sub: `${m.type} · ${m.status}`,
    route: '/machines', page: t('nav.machines','Machines'), icon: '⚙',
    keywords: `${m.brand} ${m.model} ${m.type} ${m.status}`.toLowerCase(),
  }))
  store.transactions.forEach((tr: any) => items.push({
    label: tr.description || tr.category,
    sub: `${tr.amount} USD · ${tr.type} · ${tr.status}`,
    route: '/finance', page: t('nav.finance','Finance'), icon: '💰',
    keywords: `${tr.description||''} ${tr.category} ${tr.type}`.toLowerCase(),
  }))
  store.harvests.forEach((h: any) => items.push({
    label: h.cropType, sub: `${h.netQty} ${h.unit} · ${h.zone} · ${h.date}`,
    route: '/recoltes', page: t('nav.harvests','Récoltes'), icon: '🌾',
    keywords: `${h.cropType} ${h.zone} ${h.destination||''}`.toLowerCase(),
  }))
  return items
}

function GlobalSearch() {
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
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); setOpen(false); return }
    const q = query.toLowerCase().trim()
    const index = buildSearchIndex(store, t)
    const found = index.filter(item => item.keywords.includes(q))
    setResults(found.slice(0, 10))
    setOpen(true)
    setSelected(-1)
  }, [query, store])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, -1)) }
    if (e.key === 'Enter' && selected >= 0) { handleSelect(results[selected]) }
    if (e.key === 'Escape') { setOpen(false); setQuery('') }
  }

  const handleSelect = (r: any) => {
    navigate(r.route)
    setQuery('')
    setOpen(false)
    setSelected(-1)
  }

  // Group results by page
  const grouped = results.reduce((acc: Record<string, SearchItem[]>, r: SearchItem) => {
    if (!acc[r.page]) acc[r.page] = []
    acc[r.page].push(r)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
      <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--light)', zIndex: 1 }}/>
      <input
        ref={inputRef}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKey}
        onFocus={() => results.length > 0 && setOpen(true)}
        className="input"
        style={{ paddingLeft: '32px', paddingRight: query ? '32px' : '12px', height: '36px', fontSize: '.82rem' }}
        placeholder={t('common.search', 'Rechercher dans tout le système...')}/>
      {query && (
        <button onClick={() => { setQuery(''); setOpen(false) }}
          style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--light)', display: 'flex', padding: '3px' }}>
          <X size={13}/>
        </button>
      )}

      {/* Results dropdown */}
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'white', borderRadius: '14px', border: '1px solid var(--borderS)', boxShadow: '0 8px 32px rgba(46,31,16,.14)', zIndex: 200, overflow: 'hidden', maxHeight: '420px', overflowY: 'auto' }}>
          {Object.keys(grouped).length === 0 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--muted)', fontSize: '.84rem' }}>
              Aucun résultat pour <strong>"{query}"</strong>
            </div>
          ) : (
            Object.entries(grouped).map(([page, items]: [string, SearchItem[]]) => (
              <div key={page}>
                {/* Page section header */}
                <div style={{ padding: '7px 13px 4px', background: 'var(--b50)', fontSize: '9.5px', fontWeight: 700, color: 'var(--b600)', textTransform: 'uppercase', letterSpacing: '.08em', borderBottom: '1px solid var(--borderS)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>{(items[0] as any).icon}</span>
                  {page}
                  <span style={{ marginLeft: 'auto', background: 'var(--b200)', color: 'var(--b700)', borderRadius: '99px', padding: '1px 6px', fontSize: '9px' }}>{(items as any[]).length}</span>
                </div>
                {items.map((r: SearchItem, i: number) => {
                  const globalIdx = results.indexOf(r)
                  return (
                    <button key={i} onClick={() => handleSelect(r)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 13px', background: selected === globalIdx ? 'var(--accentS)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .1s', borderBottom: '1px solid var(--b50)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--b50)'; setSelected(globalIdx) }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = selected === globalIdx ? 'var(--accentS)' : 'transparent' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</p>
                        <p style={{ fontSize: '.74rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.sub}</p>
                      </div>
                      <ChevronRight size={12} style={{ color: 'var(--light)', flexShrink: 0 }}/>
                    </button>
                  )
                })}
              </div>
            ))
          )}
          {Object.keys(grouped).length > 0 && (
            <div style={{ padding: '6px 13px', background: 'var(--b50)', fontSize: '10px', color: 'var(--light)', borderTop: '1px solid var(--borderS)', display: 'flex', gap: '12px' }}>
              <span>↑↓ Naviguer</span>
              <span>↵ Ouvrir</span>
              <span>Esc Fermer</span>
              <span style={{ marginLeft: 'auto' }}>{results.length} résultat(s)</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Layout() {
  const { user } = useAuthStore()
  const { alerts } = useStore()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const newAlerts = alerts.filter(a => a.status === 'new').length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <ToastContainer />
      <div style={{ flex: 1, marginLeft: '224px', display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: '54px', background: 'white', borderBottom: '1px solid var(--borderS)', display: 'flex', alignItems: 'center', padding: '0 20px', gap: '10px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 1px 4px rgba(46,31,16,.04)' }}>
          <GlobalSearch />
          <div style={{ flex: 1 }}/>

          {/* Lang switcher in topbar */}
          <LangSwitcher/>

          {/* Home button */}
          <button onClick={() => navigate('/')}
            title={t('nav.home', 'Page d\'accueil')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 11px', borderRadius: '9px', border: '1px solid var(--borderS)', background: 'white', cursor: 'pointer', fontSize: '11.5px', color: 'var(--muted)', transition: 'all .13s', fontWeight: 600, whiteSpace: 'nowrap' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accentS)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--borderS)' }}>
            <Home size={13}/>
            <span style={{ display: window.innerWidth > 900 ? 'inline' : 'none' }}>{t('nav.home', 'Accueil')}</span>
          </button>

          {/* Alerts bell */}
          <button onClick={() => navigate('/alertes')} style={{ position: 'relative', padding: '7px', borderRadius: '9px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <Bell size={17}/>
            {newAlerts > 0 && (
              <span style={{ position: 'absolute', top: '5px', right: '5px', width: '7px', height: '7px', background: 'var(--err)', borderRadius: '50%', border: '1.5px solid white', animation: 'pulse 2s infinite' }}/>
            )}
          </button>

          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '10px', borderLeft: '1px solid var(--borderS)' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', color: 'var(--accent)', border: '1.5px solid var(--border)' }}>
              {(user?.fullName || 'R').charAt(0)}
            </div>
            <div style={{ display: window.innerWidth > 900 ? 'block' : 'none' }}>
              <p style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>{user?.fullName || 'Richard Bunani'}</p>
              <p style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{user?.role === 'super_admin' ? t('roles.super_admin', 'Propriétaire') : user?.role}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '22px 26px' }} className="scrollbar-hide">
          <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
