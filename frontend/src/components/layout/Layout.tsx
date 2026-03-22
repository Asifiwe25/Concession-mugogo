import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuthStore } from '@/context/authStore'
import { useStore } from '@/store/useStore'
import { ToastContainer } from '@/components/ui/crud'

export default function Layout() {
  const { user } = useAuthStore()
  const { alerts } = useStore()
  const navigate = useNavigate()
  const newAlerts = alerts.filter(a => a.status === 'new').length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <ToastContainer />
      <div style={{ flex: 1, marginLeft: '224px', display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: '52px', background: 'white', borderBottom: '1px solid var(--borderS)', display: 'flex', alignItems: 'center', padding: '0 22px', gap: '10px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 1px 4px rgba(46,31,16,.04)' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--light)' }}/>
            <input className="input" style={{ paddingLeft: '32px', height: '36px', fontSize: '.82rem' }} placeholder="Rechercher dans le système..."/>
          </div>
          <div style={{ flex: 1 }}/>
          <button style={{ position: 'relative', padding: '7px', borderRadius: '9px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
            onClick={() => navigate('/alertes')}>
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
              <p style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{user?.role === 'super_admin' ? 'Propriétaire' : user?.role}</p>
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
