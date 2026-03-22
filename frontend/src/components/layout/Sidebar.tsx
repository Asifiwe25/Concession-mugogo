import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard, Users, Map, Beef, Sprout, Wheat, Package,
  Wrench, ClipboardList, DollarSign, Bell, FileText, Settings,
  Shield, Building2, LogOut, ChevronDown, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@/context/authStore'
import { useStore } from '@/store/useStore'
import i18n from '@/i18n'

const LANGS = [
  { code: 'fr',    label: 'FR', full: 'Français'  },
  { code: 'sw',    label: 'SW', full: 'Kiswahili'  },
  { code: 'mashi', label: 'SH', full: 'Mashi'      },
]

const NAV_GROUPS = [
  {
    section: null,
    items: [
      { to: '/tableau-de-bord', label: 'Tableau de bord', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Exploitation',
    items: [
      { to: '/concessions', label: 'Concessions',  icon: Building2 },
      { to: '/zones',       label: 'Zones & Carte', icon: Map       },
    ],
  },
  {
    section: 'Élevage & Cultures',
    items: [
      { to: '/elevage',   label: 'Élevage',   icon: Beef   },
      { to: '/cultures',  label: 'Cultures',  icon: Sprout },
      { to: '/recoltes',  label: 'Récoltes',  icon: Wheat  },
    ],
  },
  {
    section: 'Ressources',
    items: [
      { to: '/stock',    label: 'Stock',    icon: Package       },
      { to: '/machines', label: 'Machines', icon: Wrench        },
      { to: '/taches',   label: 'Tâches',   icon: ClipboardList },
    ],
  },
  {
    section: 'Gestion',
    items: [
      { to: '/employes', label: 'Employés', icon: Users       },
      { to: '/finance',  label: 'Finance',  icon: DollarSign  },
      { to: '/alertes',  label: 'Alertes',  icon: Bell, badge: true },
    ],
  },
  {
    section: 'Administration',
    items: [
      { to: '/rapports',   label: 'Rapports',    icon: FileText  },
      { to: '/parametres', label: 'Paramètres',  icon: Settings  },
      { to: '/audit',      label: 'Audit',       icon: Shield    },
    ],
  },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { alerts } = useStore()
  const [lang, setLang] = useState(i18n.language || 'fr')
  const newAlerts = alerts.filter(a => a.status === 'new').length

  const handleLang = (code: string) => {
    setLang(code)
    i18n.changeLanguage(code)
    localStorage.setItem('mugogo_lang', code)
  }

  return (
    <aside style={{
      width: '224px', minWidth: '224px', height: '100vh',
      background: 'white', borderRight: '1px solid var(--borderS)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, zIndex: 40,
      overflowY: 'auto',
    }} className="scrollbar-hide">

      {/* Logo / Brand */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid var(--borderS)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: '13.5px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.25 }}>
              Concession<br/>Mugogo
            </div>
          </div>
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--light)', fontStyle: 'italic', paddingLeft: '46px' }}>
          Walungu, Sud-Kivu, RDC
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={gi}>
            {group.section && (
              <div style={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--light)', padding: '10px 14px 3px' }}>
                {group.section}
              </div>
            )}
            {group.items.map(item => (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) => clsx('nav-link', isActive && 'active')}>
                <item.icon size={15} style={{ flexShrink: 0, strokeWidth: 1.9 }}/>
                <span style={{ flex: 1 }}>{item.label}</span>
                {(item as any).badge && newAlerts > 0 && (
                  <span style={{ background: 'var(--err)', color: 'white', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '99px', minWidth: '18px', textAlign: 'center' }}>
                    {newAlerts}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--borderS)' }}>
        {/* Language selector */}
        <div style={{ display: 'flex', gap: '3px', marginBottom: '10px' }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => handleLang(l.code)} title={l.full}
              style={{ flex: 1, padding: '4px 0', borderRadius: '7px', border: '1px solid', fontSize: '10px', fontWeight: 700, cursor: 'pointer', transition: 'all .12s',
                       background: lang === l.code ? 'var(--accent)' : 'var(--surface2)',
                       color: lang === l.code ? 'white' : 'var(--muted)',
                       borderColor: lang === l.code ? 'var(--accent)' : 'var(--border)' }}>
              {l.label}
            </button>
          ))}
        </div>

        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', color: 'var(--accent)', border: '1.5px solid var(--border)', flexShrink: 0 }}>
            {(user?.fullName || 'R').charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName || 'Richard Bunani'}
            </p>
            <p style={{ fontSize: '9.5px', color: 'var(--muted)' }}>
              {user?.role === 'super_admin' ? 'Propriétaire' : user?.role || 'Administrateur'}
            </p>
          </div>
          <button onClick={logout} title="Se déconnecter"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--light)', padding: '5px', borderRadius: '7px', display: 'flex', transition: 'all .12s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--errBg)'; (e.currentTarget as HTMLElement).style.color = 'var(--err)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--light)' }}>
            <LogOut size={14}/>
          </button>
        </div>
      </div>
    </aside>
  )
}
