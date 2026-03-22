import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, X, Clock } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { StatCard, toast } from '@/components/ui/crud'
import { clsx } from 'clsx'

const TYPE_CFG: Record<string,{border:string;bg:string;textColor:string;label:string}> = {
  critical: { border:'var(--err)',  bg:'var(--errBg)',  textColor:'var(--err)',  label:'Critique' },
  high:     { border:'var(--warn)', bg:'var(--warnBg)', textColor:'var(--warn)', label:'Haute' },
  normal:   { border:'var(--b500)', bg:'var(--b100)',   textColor:'var(--b700)', label:'Normale' },
  info:     { border:'var(--ok)',   bg:'var(--okBg)',   textColor:'var(--ok)',   label:'Info' },
}

const CAT_LABELS: Record<string,string> = {
  animalHealth:'Sante animale', crops:'Cultures', stock:'Stock', hr:'RH',
  finance:'Finance', maintenance:'Maintenance', livestock:'Elevage', security:'Securite', other:'Autre'
}

export function AlertsPage() {
  const { t } = useTranslation()
  const { alerts, resolveAlert, dismissAlert } = useStore()
  const [filter, setFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')

  const filtered = alerts.filter(a => {
    const matchT = filter === 'all' || a.type === filter || a.status === filter
    const matchC = catFilter === 'all' || a.category === catFilter
    return matchT && matchC && a.status !== 'ignored'
  })

  const unresolved = alerts.filter(a => a.status === 'new').length
  const handleResolveAll = () => {
    alerts.filter(a => a.status === 'new').forEach(a => resolveAlert(a.id))
    toast(`${unresolved} alertes resolues`)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', animation:'fadeUp .4s ease' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'.75rem' }}>
        <div>
          <h1 className="page-title">Alertes & Notifications</h1>
          <p className="page-sub">{unresolved} alertes non resolues</p>
        </div>
        {unresolved > 0 && (
          <button className="btn-secondary btn-sm" onClick={handleResolveAll}>
            <CheckCircle size={13}/> Tout marquer resolu
          </button>
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'.75rem' }}>
        {[
          { label:'Critiques', value:alerts.filter(a=>a.type==='critical'&&a.status!=='resolved'&&a.status!=='ignored').length, color:'var(--err)', delay:'d1' },
          { label:'Hautes',    value:alerts.filter(a=>a.type==='high'&&a.status!=='resolved'&&a.status!=='ignored').length,    color:'var(--warn)',delay:'d2' },
          { label:'Normales',  value:alerts.filter(a=>a.type==='normal'&&a.status!=='resolved'&&a.status!=='ignored').length,  color:'var(--b700)',delay:'d3' },
          { label:'Resolues',  value:alerts.filter(a=>a.status==='resolved').length, color:'var(--muted)', delay:'d4' },
        ].map((s,i) => (
          <StatCard key={i} label={s.label} value={s.value} color={s.color} delay={s.delay}/>
        ))}
      </div>

      <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
        {[['all','Toutes'],['critical','Critiques'],['high','Hautes'],['normal','Normales'],['resolved','Resolues']].map(([v,l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className="pill" style={{ ...(filter===v ? { background:'var(--accent)', color:'white', borderColor:'var(--accent)' } : {}) }}>
            {l}
          </button>
        ))}
        <select className="input" style={{ width:'160px' }} value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
          <option value="all">Toutes categories</option>
          {Object.entries(CAT_LABELS).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'4rem', background:'white', borderRadius:'18px', border:'1px solid var(--borderS)' }}>
          <div style={{ width:'52px', height:'52px', borderRadius:'16px', background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', fontWeight:700, fontSize:'1.25rem', color:'var(--b400)' }}>
            <CheckCircle size={24} style={{color:'var(--ok)'}}/>
          </div>
          <h3 className="font-display" style={{ fontSize:'1.25rem', fontWeight:700, marginBottom:'.5rem' }}>Aucune alerte</h3>
          <p style={{ fontSize:'.85rem', color:'var(--muted)' }}>Tout est sous controle</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
          {filtered.map((alert, i) => {
            const cfg = TYPE_CFG[alert.type] || TYPE_CFG.normal
            const resolved = alert.status === 'resolved'
            return (
              <div key={alert.id} className="anim-fade-in" style={{ animationDelay:`${i*.04}s`, display:'flex', alignItems:'flex-start', gap:'10px', padding:'12px 14px', borderRadius:'14px', background:cfg.bg, borderLeft:`3px solid ${cfg.border}`, opacity:resolved?.6:1, transition:'all .2s' }}>
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:cfg.border, flexShrink:0, marginTop:'6px' }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'8px', flexWrap:'wrap', marginBottom:'3px' }}>
                    <p style={{ fontWeight:700, fontSize:'.88rem', color:'var(--text)' }}>{alert.title}</p>
                    <div style={{ display:'flex', gap:'4px', flexShrink:0 }}>
                      <span className="badge" style={{ background:cfg.bg, color:cfg.textColor, border:`1px solid ${cfg.border}33` }}>{cfg.label}</span>
                      {alert.status === 'new'      && <span className="badge badge-err">Nouvelle</span>}
                      {alert.status === 'resolved' && <span className="badge badge-ok">Resolue</span>}
                    </div>
                  </div>
                  <p style={{ fontSize:'.8rem', color:'var(--muted)' }}>{alert.desc}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginTop:'5px' }}>
                    <span style={{ fontSize:'.74rem', color:'var(--light)', display:'flex', alignItems:'center', gap:'3px' }}>
                      <Clock size={11}/> {alert.time}
                    </span>
                    <span className="badge badge-dim">{CAT_LABELS[alert.category] || alert.category}</span>
                  </div>
                </div>
                {!resolved && (
                  <div style={{ display:'flex', gap:'5px', flexShrink:0 }}>
                    <button onClick={() => { resolveAlert(alert.id); toast('Alerte resolue') }}
                      className="btn-secondary btn-sm" style={{ fontSize:'.76rem' }}>
                      Resoudre
                    </button>
                    <button onClick={() => { dismissAlert(alert.id); toast('Alerte ignoree','info') }}
                      className="btn-ghost btn-sm" style={{ padding:'5px' }}>
                      <X size={13}/>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
