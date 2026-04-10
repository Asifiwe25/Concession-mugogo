import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { useAuthStore } from '@/context/authStore'
import { useExtraStore } from '@/store/extraStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowRight, Plus, Home, Bell, CheckCircle, X, User, Download } from 'lucide-react'
import { toast } from '@/components/ui/crud'
import { clsx } from 'clsx'
import { useTranslation } from 'react-i18next'
import { PageReport } from '@/components/ui/PageReport'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { animals, employees, crops, alerts, transactions, stock } = useStore()
  const { fieldReports, accessRequests, approveRequest, rejectRequest } = useExtraStore()

  const isAdmin = user?.role === 'super_admin'
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? t('dashboard.welcome','Bonjour') : hour < 18 ? t('dashboard.welcome','Bonjour') : t('dashboard.welcome','Bonsoir')

  const rev      = transactions.filter(t=>t.type==='income'  && t.status==='paid').reduce((s,t)=>s+t.amount,0)
  const exp      = transactions.filter(t=>t.type==='expense' && t.status==='paid').reduce((s,t)=>s+t.amount,0)
  const profit   = rev - exp
  const critAlerts  = alerts.filter(a=>a.status==='new' && a.type==='critical').length
  const newAlerts   = alerts.filter(a=>a.status==='new').length
  const readyCrops  = crops.filter(c=>c.status==='ready').length
  const sickAnimals = animals.filter(a=>a.healthStatus==='sick').length
  const critStock   = stock.filter(s=>s.status==='critical').length
  const activeEmp   = employees.filter(e=>e.status==='active').length
  const unread      = fieldReports.filter(r=>r.status==='pending').length
  const pendingReqs = accessRequests.filter(r=>r.status==='pending').length

  const monthData = [
    { name:'Jan', rev:2400, dep:1800 }, { name:'Fév', rev:1800, dep:1200 },
    { name:'Mar', rev:3200, dep:2100 }, { name:'Avr', rev:2800, dep:1900 },
    { name:'Mai', rev:3800, dep:2400 }, { name:'Juin', rev:4200, dep:2800 },
    { name:'Juil', rev:3600, dep:2200 }, { name:'Août', rev:4800, dep:3100 },
    { name:'Sep', rev:5200, dep:3400 }, { name:'Oct', rev:4600, dep:2900 },
    { name:'Nov', rev:5800, dep:3600 }, { name:'Déc', rev:Math.round(rev), dep:Math.round(exp) },
  ]

  const reportData = [
    { label: t('dashboard.animals','Animaux'), valeur: animals.length, status: sickAnimals > 0 ? `${sickAnimals} malades` : 'tous en bonne santé' },
    { label: t('dashboard.employees','Employés actifs'), valeur: activeEmp, status: `${employees.length} total` },
    { label: t('dashboard.revenue','Revenus'), valeur: `$${Math.round(rev)}`, status: `profit $${Math.round(profit)}` },
    { label: t('dashboard.expenses','Dépenses'), valeur: `$${Math.round(exp)}`, status: `${((exp/(rev||1))*100).toFixed(0)}% des revenus` },
    { label: t('nav.alerts','Alertes'), valeur: newAlerts, status: `${critAlerts} critiques` },
    { label: t('crops.title','Cultures prêtes'), valeur: readyCrops, status: `sur ${crops.length} total` },
    { label: t('stock.title','Stock critique'), valeur: critStock, status: `sur ${stock.length} articles` },
    { label: t('nav.reports','Rapports non lus'), valeur: unread, status: `${fieldReports.length} total` },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', animation:'fadeUp .4s ease' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'.75rem' }}>
        <div>
          <h1 className="page-title">{greeting}, {(user?.fullName||'Richard').split(' ')[0]} 👋</h1>
          <p className="page-sub">{now.toLocaleDateString(undefined, { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button className="btn-secondary btn-sm" onClick={() => navigate('/')}>
            <Home size={13}/> {t('nav.home','Page d\'accueil')}
          </button>
          <PageReport
            title={t('nav.dashboard','Tableau de bord')}
            description={t('dashboard.overview','Résumé global de la Concession Mugogo')}
            pageId="dashboard"
            data={reportData}
            columns={[
              { key:'label', label:t('common.actions','Indicateur') },
              { key:'valeur', label:'Valeur' },
              { key:'status', label:'Détail' },
            ]}
          />
          <button className="btn-secondary btn-sm" onClick={() => navigate('/taches')}>
            <Plus size={13}/> {t('tasks.addTask','Tâche')}
          </button>
          <button className="btn-primary btn-sm" onClick={() => navigate('/elevage')}>
            <Plus size={13}/> {t('livestock.addAnimal','Animal')}
          </button>
        </div>
      </div>

      {/* Unread reports banner */}
      {unread > 0 && (
        <div style={{ background:'var(--accentS)', borderRadius:'13px', padding:'11px 16px', border:'1px solid var(--b300)', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }}
          onClick={() => navigate('/rapports')}>
          <Bell size={15} style={{ color:'var(--accent)', flexShrink:0 }}/>
          <p style={{ fontSize:'.84rem', color:'var(--accent)', fontWeight:600 }}>
            {unread} {t('nav.reports','rapport(s) de terrain non lu(s)')} — {t('common.view','Voir')}
          </p>
          <ArrowRight size={14} style={{ color:'var(--accent)', marginLeft:'auto' }}/>
        </div>
      )}

      {/* Access requests banner (admin only) */}
      {isAdmin && pendingReqs > 0 && (
        <div style={{ background:'#f0f2eb', borderRadius:'13px', padding:'11px 16px', border:'1px solid #c8d4aa' }}>
          <p style={{ fontSize:'.84rem', color:'#4a5e2a', fontWeight:600, marginBottom:'8px' }}>
            {pendingReqs} demande(s) d'accès en attente
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
            {accessRequests.filter(r=>r.status==='pending').slice(0,3).map(req => (
              <div key={req.id} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px 10px', background:'white', borderRadius:'9px' }}>
                <User size={13} style={{ color:'var(--muted)', flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:'.82rem', fontWeight:600 }}>{req.fullName}</p>
                  <p style={{ fontSize:'.74rem', color:'var(--muted)' }}>{req.email} · {req.role}</p>
                </div>
                <button onClick={() => { approveRequest(req.id); toast(`✅ ${req.fullName} approuvé`) }} className="btn-sm" style={{ background:'var(--ok)', color:'white', border:'none', borderRadius:'7px', padding:'4px 9px', cursor:'pointer', fontSize:'.74rem', fontWeight:700 }}>
                  <CheckCircle size={11}/> {t('common.confirm','Approuver')}
                </button>
                <button onClick={() => { rejectRequest(req.id); toast(`${req.fullName} refusé`) }} className="btn-sm" style={{ background:'var(--err)', color:'white', border:'none', borderRadius:'7px', padding:'4px 9px', cursor:'pointer', fontSize:'.74rem', fontWeight:700 }}>
                  <X size={11}/> {t('common.no','Refuser')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'10px' }}>
        {[
          { label:t('dashboard.animals','Animaux'), value:animals.length, sub:`${sickAnimals} ${t('livestock.sick','malades')}`, color:'var(--b600)', delay:'.05s', click:'/elevage' },
          { label:t('dashboard.employees','Employés'), value:activeEmp, sub:`${employees.length} ${t('common.total','total')}`, color:'var(--ok)', delay:'.10s', click:'/employes' },
          { label:t('dashboard.revenue','Revenus'), value:`$${Math.round(rev/100)/10}k`, sub:`${t('dashboard.profit','bénéfice')} $${Math.round(profit)}`, color:'var(--ok)', delay:'.15s', click:'/finance' },
          { label:t('nav.alerts','Alertes'), value:newAlerts, sub:`${critAlerts} ${t('alerts.critical','critiques')}`, color:critAlerts>0?'var(--err)':'var(--muted)', delay:'.20s', click:'/alertes' },
          { label:t('crops.ready','Cultures prêtes'), value:readyCrops, sub:`${t('common.of','sur')} ${crops.length} ${t('common.total','total')}`, color:'var(--b600)', delay:'.25s', click:'/cultures' },
          { label:t('stock.critical','Stock critique'), value:critStock, sub:`${t('common.of','sur')} ${stock.length} ${t('common.total','articles')}`, color:critStock>0?'var(--warn)':'var(--muted)', delay:'.30s', click:'/stock' },
        ].map((kpi,i) => (
          <div key={i} className="card kpi-card" onClick={() => navigate(kpi.click)}
            style={{ cursor:'pointer', animation:`fadeUp .5s ${kpi.delay} ease both`, padding:'1rem 1.125rem' }}>
            <p style={{ fontSize:'.74rem', fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'.375rem' }}>{kpi.label}</p>
            <p style={{ fontSize:'1.75rem', fontWeight:700, color:kpi.color, lineHeight:1, marginBottom:'.25rem' }}>{kpi.value}</p>
            <p style={{ fontSize:'.74rem', color:'var(--light)' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart + Quick actions */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1rem' }}>
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' }}>
            <h3 style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:'1rem' }}>{t('dashboard.productionChart','Production mensuelle')}</h3>
            <span style={{ fontSize:'.74rem', color:'var(--muted)' }}>USD</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--borderS)" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize:10, fill:'var(--light)' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize:10, fill:'var(--light)' }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v}`}/>
              <Tooltip formatter={(v:any)=>[`$${v}`]} contentStyle={{ fontSize:12, borderRadius:8, border:'1px solid var(--borderS)' }}/>
              <Bar dataKey="rev" fill="var(--b400)" radius={[3,3,0,0]} name={t('finance.revenue','Revenus')}/>
              <Bar dataKey="dep" fill="var(--b200)" radius={[3,3,0,0]} name={t('finance.expenses','Dépenses')}/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', marginTop:'.5rem' }}>
            {[['var(--b400)',t('finance.revenue','Revenus')],['var(--b200)',t('finance.expenses','Dépenses')]].map(([c,l])=>(
              <div key={l as string} style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                <div style={{ width:'10px', height:'10px', borderRadius:'2px', background:c as string }}/>
                <span style={{ fontSize:'11px', color:'var(--muted)' }}>{l as string}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          <h3 style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:'1rem', marginBottom:'.25rem' }}>{t('dashboard.quickActions','Actions rapides')}</h3>
          {[
            { label:t('livestock.addAnimal','Ajouter animal'), route:'/elevage', color:'var(--b600)' },
            { label:t('crops.addCrop','Ajouter culture'), route:'/cultures', color:'var(--ok)' },
            { label:t('tasks.addTask','Créer tâche'), route:'/taches', color:'var(--b500)' },
            { label:t('employees.addEmployee','Ajouter employé'), route:'/employes', color:'var(--warn)' },
            { label:t('stock.addItem','Ajouter stock'), route:'/stock', color:'var(--b400)' },
            { label:t('nav.reports','Voir rapports'), route:'/rapports', color:'var(--muted)' },
          ].map((a,i) => (
            <button key={i} onClick={() => navigate(a.route)} className="btn-secondary"
              style={{ display:'flex', alignItems:'center', gap:'8px', width:'100%', padding:'8px 10px', fontSize:'.82rem' }}>
              <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:a.color, flexShrink:0 }}/>
              {a.label}
              <ArrowRight size={12} style={{ marginLeft:'auto', color:'var(--light)' }}/>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Alerts + Stock Critical + Animals + Crops */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
        {/* Alerts */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.875rem' }}>
            <h3 style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:'1rem' }}>{t('dashboard.recentAlerts','Alertes récentes')}</h3>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/alertes')}>{t('common.view','Voir tout')}</button>
          </div>
          {alerts.filter(a=>a.status==='new').slice(0,4).map(a => (
            <div key={a.id} style={{ marginBottom:'6px', cursor:'pointer', padding:'8px 10px', borderRadius:'9px', background:'var(--surface2)', border:'1px solid var(--borderS)' }}
              onClick={() => navigate('/alertes')}>
              <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                <span className={clsx('badge', a.type==='critical'?'badge-err':a.type==='high'?'badge-warn':'badge-dim')} style={{ fontSize:'9px', padding:'2px 6px' }}>
                  {t(`alerts.${a.type}`, a.type)}
                </span>
                <p style={{ fontSize:'.8rem', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.title || (a as any).message || a.type}</p>
              </div>
            </div>
          ))}
          {alerts.filter(a=>a.status==='new').length === 0 && (
            <p style={{ fontSize:'.84rem', color:'var(--muted)', textAlign:'center', padding:'1rem' }}>{t('alerts.noAlerts','Aucune alerte')}</p>
          )}
        </div>

        {/* Stock critical */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.875rem' }}>
            <h3 style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:'1rem' }}>{t('dashboard.stockStatus','État du stock')}</h3>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/stock')}>{t('common.view','Voir tout')}</button>
          </div>
          {stock.filter(s=>s.status!=='ok').slice(0,4).map(s => (
            <div key={s.id} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', padding:'8px 10px', background:'var(--surface2)', borderRadius:'9px', border:'1px solid var(--borderS)' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:'.82rem', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</p>
                <p style={{ fontSize:'.74rem', color:'var(--muted)' }}>{s.quantity} {s.unit}</p>
              </div>
              <span className={s.status==='critical'?'badge badge-err':'badge badge-warn'} style={{ fontSize:'9px', flexShrink:0 }}>
                {s.status==='critical' ? t('alerts.critical','Critique') : t('stock.lowStock','Faible')}
              </span>
            </div>
          ))}
          {stock.filter(s=>s.status!=='ok').length === 0 && (
            <p style={{ fontSize:'.84rem', color:'var(--muted)', textAlign:'center', padding:'1rem' }}>✓ {t('common.success','Stock normal')}</p>
          )}
        </div>

        {/* Animals health */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.875rem' }}>
            <h3 style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:'1rem' }}>{t('livestock.title','Élevage')}</h3>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/elevage')}>{t('common.view','Voir tout')}</button>
          </div>
          {animals.slice(0,4).map(a => (
            <div key={a.id} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', padding:'8px 10px', background:'var(--surface2)', borderRadius:'9px', border:'1px solid var(--borderS)' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:'.82rem', fontWeight:600 }}>{a.localName || a.systemId}</p>
                <p style={{ fontSize:'.74rem', color:'var(--muted)' }}>{a.species} · {a.zone}</p>
              </div>
              <span className={a.healthStatus==='healthy'?'badge badge-ok':a.healthStatus==='sick'?'badge badge-err':'badge badge-warn'} style={{ fontSize:'9px', flexShrink:0 }}>
                {t(`livestock.${a.healthStatus}`, a.healthStatus)}
              </span>
            </div>
          ))}
          {animals.length === 0 && (
            <p style={{ fontSize:'.84rem', color:'var(--muted)', textAlign:'center', padding:'1rem' }}>{t('common.noData','Aucun animal')}</p>
          )}
        </div>

        {/* Crops ready */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'.875rem' }}>
            <h3 style={{ fontFamily:'Georgia,serif', fontWeight:700, fontSize:'1rem' }}>{t('crops.title','Cultures')}</h3>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/cultures')}>{t('common.view','Voir tout')}</button>
          </div>
          {crops.slice(0,4).map(c => (
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px', padding:'8px 10px', background:'var(--surface2)', borderRadius:'9px', border:'1px solid var(--borderS)' }}>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:'.82rem', fontWeight:600 }}>{c.type}</p>
                <p style={{ fontSize:'.74rem', color:'var(--muted)' }}>{c.zone} · {c.area}ha</p>
              </div>
              <span className={c.status==='ready'?'badge badge-ok':c.status==='growing'?'badge badge-warn':'badge badge-dim'} style={{ fontSize:'9px', flexShrink:0 }}>
                {t(`crops.${c.status}`, c.status)}
              </span>
            </div>
          ))}
          {crops.length === 0 && (
            <p style={{ fontSize:'.84rem', color:'var(--muted)', textAlign:'center', padding:'1rem' }}>{t('common.noData','Aucune culture')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
