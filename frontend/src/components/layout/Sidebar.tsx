import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { clsx } from 'clsx'
import {
  LayoutDashboard, Users, Map, Beef, Sprout, Wheat, Package,
  Wrench, ClipboardList, DollarSign, Bell, FileText, Settings,
  Shield, Building2, LogOut, Home, Globe
} from 'lucide-react'
import { useAuthStore } from '@/context/authStore'
import { useStore } from '@/store/useStore'
import { LangSwitcher } from '@/context/LanguageContext'
import { MugogoLogo } from '@/components/ui/MugogoLogo'

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const { alerts } = useStore()
  const navigate = useNavigate()
  const newAlerts = alerts.filter(a => a.status === 'new').length

  const NAV_GROUPS = [
    {
      section: null,
      items: [{ to: '/tableau-de-bord', labelKey: 'nav.dashboard', icon: LayoutDashboard }],
    },
    {
      section: t('nav.territory', 'Exploitation'),
      items: [
        { to: '/concessions', labelKey: 'nav.concessions', icon: Building2 },
        { to: '/zones',       labelKey: 'nav.zones',       icon: Map },
      ],
    },
    {
      section: `${t('nav.livestock', 'Élevage')} & ${t('nav.crops', 'Cultures')}`,
      items: [
        { to: '/elevage',  labelKey: 'nav.livestock', icon: Beef },
        { to: '/cultures', labelKey: 'nav.crops',     icon: Sprout },
        { to: '/recoltes', labelKey: 'nav.harvests',  icon: Wheat },
      ],
    },
    {
      section: t('nav.resources', 'Ressources'),
      items: [
        { to: '/stock',    labelKey: 'nav.stock',    icon: Package },
        { to: '/machines', labelKey: 'nav.machines', icon: Wrench },
        { to: '/taches',   labelKey: 'nav.tasks',    icon: ClipboardList },
      ],
    },
    {
      section: 'Gestion',
      items: [
        { to: '/employes', labelKey: 'nav.employees', icon: Users },
        { to: '/finance',  labelKey: 'nav.finance',   icon: DollarSign },
        { to: '/alertes',  labelKey: 'nav.alerts',    icon: Bell, badge: true },
      ],
    },
    {
      section: t('audit.title', 'Administration'),
      items: [
        { to: '/rapports',      labelKey: 'nav.reports',       icon: FileText },
        { to: '/parametres',    labelKey: 'nav.settings',      icon: Settings },
        { to: '/accueil-admin', labelKey: 'settings.homepage', icon: Globe },
        { to: '/audit',         labelKey: 'nav.audit',         icon: Shield },
      ],
    },
  ]

  return (
    <aside style={{
      width: '224px', minWidth: '224px', height: '100vh',
      background: 'white', borderRight: '1px solid var(--borderS)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, zIndex: 40,
      overflowY: 'auto',
    }} className="scrollbar-hide">

      {/* Logo */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--borderS)' }}>
        <MugogoLogo size={34} withText textColor="#2e1f10"/>
        <div style={{ marginTop: '5px', fontSize: '10px', color: 'var(--light)', fontStyle: 'italic', paddingLeft: '44px' }}>
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
                className={({ isActive }) => clsx('nav-link', isActive && 'active')} onClick={onClose}>
                <item.icon size={15} style={{ flexShrink: 0, strokeWidth: 1.9 }}/>
                <span style={{ flex: 1 }}>{t(item.labelKey, item.labelKey)}</span>
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

        {/* Language switcher */}
        <LangSwitcher style={{ marginBottom: '8px' }}/>

        {/* Home button */}
        <button onClick={() => { navigate('/'); onClose?.() }}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', width: '100%', padding: '7px 9px', borderRadius: '9px', border: '1px solid var(--borderS)', background: 'var(--surface2)', cursor: 'pointer', marginBottom: '8px', fontSize: '11.5px', color: 'var(--muted)', transition: 'all .13s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accentS)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'; (e.currentTarget as HTMLElement).style.color = 'var(--muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--borderS)' }}>
          <Home size={13} style={{ flexShrink: 0 }}/>
          <span>{t('nav.home', 'Page d\'accueil')}</span>
        </button>

        {/* User + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', color: 'var(--accent)', border: '1.5px solid var(--border)', flexShrink: 0 }}>
            {(user?.fullName || 'R').charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName || 'Richard Bunani'}
            </p>
            <p style={{ fontSize: '9.5px', color: 'var(--muted)' }}>
              {user?.role === 'super_admin' ? t('roles.super_admin', 'Propriétaire') : t(`roles.${user?.role}`, user?.role || '')}
            </p>
          </div>
          <button onClick={logout} title={t('auth.logout', 'Déconnexion')}
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
