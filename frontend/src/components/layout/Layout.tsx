import React, { useState, useRef, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Search, Bell, Home, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Sidebar from './Sidebar'
import { useAuthStore } from '@/context/authStore'
import { useStore }     from '@/store/useStore'
import { ToastContainer } from '@/components/ui/crud'

// Global search across animals, employees, crops, stock, tasks
function GlobalSearch() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { animals, employees, crops, stock, tasks, zones } = useStore()
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<any[]>([])
  const [open,    setOpen]    = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapRef  = useRef<HTMLDivElement>(null)

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
    const q = query.toLowerCase()
    const found: any[] = []

    animals.slice(0,50).forEach(a => {
      if ((a.localName||'').toLowerCase().includes(q) || a.systemId.toLowerCase().includes(q) || a.species.toLowerCase().includes(q) || (a.tagNumber||'').toLowerCase().includes(q)) {
        found.push({ type: 'animal', label: a.localName || a.systemId, sub: `${a.species} — ${a.zone}`, route: '/elevage', icon: '🐄' })
      }
    })
    employees.slice(0,50).forEach(e => {
      const name = `${e.firstName} ${e.lastName}`.toLowerCase()
      if (name.includes(q) || (e.phone||'').includes(q) || (e.email||'').toLowerCase().includes(q)) {
        found.push({ type: 'employee', label: `${e.firstName} ${e.lastName}`, sub: `${e.role} — ${e.zone}`, route: '/employes', icon: '👤' })
      }
    })
    crops.slice(0,50).forEach(c => {
      if (c.type.toLowerCase().includes(q) || c.zone.toLowerCase().includes(q) || (c.variety||'').toLowerCase().includes(q)) {
        found.push({ type: 'crop', label: c.type, sub: `${c.zone} — ${c.status}`, route: '/cultures', icon: '🌱' })
      }
    })
    stock.slice(0,50).forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) {
        found.push({ type: 'stock', label: s.name, sub: `${s.quantity} ${s.unit} — ${s.category}`, route: '/stock', icon: '📦' })
      }
    })
    tasks.slice(0,50).forEach(t => {
      if ((t.title||'').toLowerCase().includes(q)) {
        found.push({ type: 'task', label: t.title, sub: t.status, route: '/taches', icon: '✓' })
      }
    })
    zones.slice(0,20).forEach(z => {
      if (z.name.toLowerCase().includes(q)) {
        found.push({ type: 'zone', label: z.name, sub: `${z.type} — ${z.area}ha`, route: '/zones', icon: '🗺' })
      }
    })

    setResults(found.slice(0, 8))
    setOpen(found.length > 0)
  }, [query, animals, employees, crops, stock, tasks, zones])

  const handleSelect = (route: string) => {
    navigate(route)
    setQuery('')
    setOpen(false)
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
      <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--light)', zIndex: 1 }}/>
      <input
        ref={inputRef}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        className="input"
        style={{ paddingLeft: '32px', paddingRight: query ? '32px' : '12px', height: '36px', fontSize: '.82rem' }}
        placeholder={t('common.search', 'Rechercher...')}/>
      {query && (
        <button onClick={() => { setQuery(''); setOpen(false) }}
          style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--light)', display: 'flex', padding: '2px' }}>
          <X size={13}/>
        </button>
      )}

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'white', borderRadius: '13px', border: '1px solid var(--borderS)', boxShadow: '0 8px 30px rgba(46,31,16,.12)', zIndex: 200, overflow: 'hidden' }}>
          {results.map((r, i) => (
            <button key={i} onClick={() => handleSelect(r.route)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 13px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .1s', borderBottom: i < results.length - 1 ? '1px solid var(--borderS)' : 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--b50)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{r.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</p>
                <p style={{ fontSize: '.74rem', color: 'var(--muted)' }}>{r.sub}</p>
              </div>
              <span style={{ fontSize: '.68rem', color: 'var(--light)', flexShrink: 0, background: 'var(--surface2)', padding: '2px 7px', borderRadius: '99px' }}>
                {r.type}
              </span>
            </button>
          ))}
        </div>
      )}
      {open && query.length >= 2 && results.length === 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'white', borderRadius: '13px', border: '1px solid var(--borderS)', padding: '1rem', textAlign: 'center', color: 'var(--muted)', fontSize: '.84rem', zIndex: 200 }}>
          Aucun résultat pour "{query}"
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
        <header style={{ height: '52px', background: 'white', borderBottom: '1px solid var(--borderS)', display: 'flex', alignItems: 'center', padding: '0 22px', gap: '10px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 1px 4px rgba(46,31,16,.04)' }}>
          <GlobalSearch />
          <div style={{ flex: 1 }}/>

          {/* Home button in topbar */}
          <button onClick={() => navigate('/')} title={t('nav.home', 'Page d\'accueil')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 11px', borderRadius: '8px', border: '1px solid var(--borderS)', background: 'white', cursor: 'pointer', fontSize: '11.5px', color: 'var(--muted)', transition: 'all .13s', fontWeight: 600 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accentS)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--borderS)' }}>
            <Home size={13}/>
            <span style={{ display: 'none' }}>{t('nav.home', 'Accueil')}</span>
          </button>

          <button onClick={() => navigate('/alertes')}
            style={{ position: 'relative', padding: '7px', borderRadius: '9px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
            <Bell size={17}/>
            {newAlerts > 0 && (
              <span style={{ position: 'absolute', top: '5px', right: '5px', width: '7px', height: '7px', background: 'var(--err)', borderRadius: '50%', border: '1.5px solid white', animation: 'pulse 2s infinite' }}/>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '10px', borderLeft: '1px solid var(--borderS)' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', color: 'var(--accent)', border: '1.5px solid var(--border)' }}>
              {(user?.fullName || 'R').charAt(0)}
            </div>
            <div>
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
