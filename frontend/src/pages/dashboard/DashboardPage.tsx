import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { useAuthStore } from '@/context/authStore'
import { useExtraStore } from '@/store/extraStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowRight, Plus, Home, Bell, CheckCircle, X, User } from 'lucide-react'
import { toast } from '@/components/ui/crud'
import { clsx } from 'clsx'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { animals, employees, crops, alerts, transactions, stock } = useStore()
  const { fieldReports, accessRequests, approveRequest, rejectRequest } = useExtraStore()

  const isAdmin = user?.role === 'super_admin'

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  const rev    = transactions.filter(t=>t.type==='income'  && t.status==='paid').reduce((s,t)=>s+t.amount,0)
  const exp    = transactions.filter(t=>t.type==='expense' && t.status==='paid').reduce((s,t)=>s+t.amount,0)
  const profit = rev - exp

  const critAlerts   = alerts.filter(a=>a.status==='new' && a.type==='critical').length
  const newAlerts    = alerts.filter(a=>a.status==='new').length
  const readyCrops   = crops.filter(c=>c.status==='ready').length
  const sickAnimals  = animals.filter(a=>a.healthStatus==='sick').length
  const activeEmp    = employees.filter(e=>e.status==='active').length
  const critStock    = stock.filter(s=>s.status==='critical').length
  const pendingReports = fieldReports.filter(r=>r.status==='pending').length
  const pendingAccess  = accessRequests.filter(r=>r.status==='pending').length

  const monthData = [
    {m:'Sep',r:6200,d:4100},{m:'Oct',r:7800,d:5200},{m:'Nov',r:6900,d:4800},
    {m:'Dec',r:9400,d:6200},{m:'Jan',r:rev||4200,d:exp||2800},
  ]

  const handleApproveAccess = (id: string, req: any) => {
    approveRequest(id)
    toast(`Accès approuvé pour ${req.fullName}`)
  }
  const handleRejectAccess = (id: string, req: any) => {
    rejectRequest(id)
    toast(`Demande refusée — ${req.fullName}`, 'info')
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.25rem',animation:'fadeUp .4s ease'}}>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'.75rem'}}>
        <div>
          <h1 className="page-title">{greeting}, {(user?.fullName||'Richard').split(' ')[0]}</h1>
          <p className="page-sub">
            {now.toLocaleDateString('fr-FR',{weekday:'long',year:'numeric',month:'long',day:'numeric'})} — Concession Mugogo
          </p>
        </div>
        <div style={{display:'flex',gap:'7px',flexWrap:'wrap'}}>
          <button className="btn-secondary btn-sm" onClick={()=>navigate('/')}>
            <Home size={13}/> Page d'accueil
          </button>
          <button className="btn-secondary btn-sm" onClick={()=>navigate('/taches')}>
            Voir tâches
          </button>
          <button className="btn-primary btn-sm" onClick={()=>navigate('/elevage')}>
            <Plus size={13}/> Ajouter animal
          </button>
        </div>
      </div>

      {/* ADMIN: Access requests banner */}
      {isAdmin && pendingAccess > 0 && (
        <div style={{background:'var(--warnBg)',borderRadius:'14px',padding:'12px 16px',border:'1px solid var(--warn)',animation:'fadeUp .4s ease'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
            <Bell size={15} style={{color:'var(--warn)',flexShrink:0}}/>
            <p style={{fontWeight:700,color:'var(--warn)',fontSize:'.9rem'}}>{pendingAccess} demande(s) d'accès en attente</p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
            {accessRequests.filter(r=>r.status==='pending').slice(0,3).map(req=>(
              <div key={req.id} style={{display:'flex',alignItems:'center',gap:'10px',background:'white',borderRadius:'10px',padding:'8px 12px',border:'1px solid var(--warnBg)'}}>
                <div style={{width:'30px',height:'30px',borderRadius:'50%',background:'var(--b100)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'var(--b600)',fontSize:'12px',flexShrink:0}}>{req.fullName.charAt(0)}</div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontWeight:700,fontSize:'.84rem'}}>{req.fullName}</p>
                  <p style={{fontSize:'.74rem',color:'var(--muted)'}}>{req.email} — {req.role} — {new Date(req.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div style={{display:'flex',gap:'5px',flexShrink:0}}>
                  <button onClick={()=>handleApproveAccess(req.id,req)} className="btn-primary btn-sm" style={{padding:'5px 10px',fontSize:'.74rem'}}>
                    <CheckCircle size={11}/> Approuver
                  </button>
                  <button onClick={()=>handleRejectAccess(req.id,req)} className="btn-danger btn-sm" style={{padding:'5px 10px',fontSize:'.74rem'}}>
                    <X size={11}/> Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMIN: unread field reports banner */}
      {isAdmin && pendingReports > 0 && (
        <div style={{background:'var(--accentS)',borderRadius:'12px',padding:'10px 14px',border:'1px solid var(--b300)',display:'flex',alignItems:'center',gap:'10px',cursor:'pointer'}} onClick={()=>navigate('/rapports')}>
          <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--accent)',animation:'pulse 2s infinite',flexShrink:0}}/>
          <p style={{fontSize:'.84rem',fontWeight:600,color:'var(--accent)',flex:1}}>
            {pendingReports} rapport(s) non lu(s) envoyé(s) par l'équipe
          </p>
          <ArrowRight size={14} style={{color:'var(--accent)',flexShrink:0}}/>
        </div>
      )}

      {/* KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'.75rem'}}>
        {[
          {label:'Animaux',       value:animals.length, sub:`${sickAnimals} malades`,             delay:'.05s', color:'var(--accent)'},
          {label:'Employés actifs',value:activeEmp,     sub:`sur ${employees.length} total`,      delay:'.10s', color:'var(--b700)'},
          {label:'Revenus',       value:`$${Math.round(rev/100)/10}k`, sub:`profit $${Math.round(profit)}`, delay:'.15s', color:'var(--ok)'},
          {label:'Alertes',       value:newAlerts,      sub:`${critAlerts} critiques`,             delay:'.20s', color:critAlerts>0?'var(--err)':'var(--muted)'},
          {label:'Cultures prêtes',value:readyCrops,    sub:`sur ${crops.length} total`,          delay:'.25s', color:'var(--b600)'},
        ].map((s,i)=>(
          <div key={i} className="stat-card" style={{animationDelay:s.delay}}>
            <div className="stat-icon" style={{fontSize:'.78rem',fontWeight:700,color:'var(--muted)'}}>{['A','E','R','!','C'][i]}</div>
            <div className="stat-val" style={{color:s.color}}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div style={{fontSize:'.72rem',color:'var(--light)',marginTop:'2px'}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts + Alerts */}
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1rem'}}>
        <div className="card anim-fade-up d2">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem',flexWrap:'wrap',gap:'6px'}}>
            <h3 className="font-display" style={{fontSize:'1rem',fontWeight:700}}>Revenus vs Dépenses</h3>
            <div style={{display:'flex',gap:'10px'}}>
              {[['Revenus','var(--b500)'],['Dépenses','var(--b200)']].map(([l,c])=>(
                <div key={l} style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'.76rem',color:'var(--muted)'}}>
                  <div style={{width:'10px',height:'10px',borderRadius:'3px',background:c}}/>
                  {l}
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={155}>
            <BarChart data={monthData} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--borderS)"/>
              <XAxis dataKey="m" tick={{fontSize:11,fill:'var(--muted)'}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:11,fill:'var(--muted)'}} axisLine={false} tickLine={false} tickFormatter={v=>`$${Math.round(v/1000)}k`}/>
              <Tooltip contentStyle={{borderRadius:'12px',border:'1px solid var(--borderS)',fontSize:12}} formatter={(v:number)=>[`$${v.toLocaleString()}`,'']}/>
              <Bar dataKey="r" name="Revenus"  fill="var(--b500)" radius={[5,5,0,0]}/>
              <Bar dataKey="d" name="Dépenses" fill="var(--b200)" radius={[5,5,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card anim-fade-up d3">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.875rem'}}>
            <h3 className="font-display" style={{fontSize:'1rem',fontWeight:700}}>Alertes actives</h3>
            <button className="btn-ghost btn-sm" onClick={()=>navigate('/alertes')}>Voir tout</button>
          </div>
          {alerts.filter(a=>a.status==='new').slice(0,4).map((al,i)=>(
            <div key={al.id} className={clsx('info-box',al.type==='critical'?'info-err':al.type==='high'?'info-warn':'info-dim')}
              style={{marginBottom:'6px',cursor:'pointer'}} onClick={()=>navigate('/alertes')}>
              <p style={{fontWeight:700,fontSize:'.82rem',marginBottom:'2px'}}>{al.title}</p>
              <p style={{fontSize:'.74rem',opacity:.8}}>{al.desc.slice(0,55)}...</p>
            </div>
          ))}
          {newAlerts===0 && <p style={{color:'var(--muted)',fontSize:'.85rem',textAlign:'center',padding:'1rem'}}>Aucune alerte active</p>}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem'}}>
        <div className="card anim-fade-up d3">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.875rem'}}>
            <h3 className="font-display" style={{fontSize:'.95rem',fontWeight:700}}>Stock critique</h3>
            <button className="btn-ghost btn-sm" onClick={()=>navigate('/stock')}>Voir tout</button>
          </div>
          {stock.filter(s=>s.status==='critical'||s.status==='low').slice(0,4).map((s,i)=>(
            <div key={s.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid var(--borderS)',fontSize:'.84rem'}}>
              <span style={{fontWeight:600}}>{s.name}</span>
              <div style={{display:'flex',alignItems:'center',gap:'5px'}}>
                <span style={{fontWeight:700,color:s.status==='critical'?'var(--err)':'var(--warn)'}}>{s.quantity} {s.unit}</span>
                <span className={s.status==='critical'?'badge badge-err':'badge badge-warn'}>{s.status==='critical'?'Critique':'Faible'}</span>
              </div>
            </div>
          ))}
          {critStock===0 && <p style={{color:'var(--muted)',fontSize:'.84rem',textAlign:'center',padding:'.75rem'}}>Stock complet</p>}
        </div>

        <div className="card anim-fade-up d4">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.875rem'}}>
            <h3 className="font-display" style={{fontSize:'.95rem',fontWeight:700}}>Santé élevage</h3>
            <button className="btn-ghost btn-sm" onClick={()=>navigate('/elevage')}>Voir tout</button>
          </div>
          {animals.filter(a=>a.healthStatus!=='healthy').slice(0,4).map((a,i)=>(
            <div key={a.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid var(--borderS)',fontSize:'.84rem'}}>
              <div>
                <p style={{fontWeight:600}}>{a.localName||a.systemId}</p>
                <p style={{fontSize:'.72rem',color:'var(--muted)'}}>{a.systemId}</p>
              </div>
              <span className={a.healthStatus==='sick'?'badge badge-err':a.healthStatus==='quarantine'?'badge badge-warn':'badge badge-dim'}>
                {a.healthStatus==='sick'?'Malade':a.healthStatus==='quarantine'?'Quarantaine':'Traitement'}
              </span>
            </div>
          ))}
          {sickAnimals===0 && <p style={{color:'var(--muted)',fontSize:'.84rem',textAlign:'center',padding:'.75rem'}}>Tous les animaux sont sains</p>}
        </div>

        <div className="card anim-fade-up d5">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.875rem'}}>
            <h3 className="font-display" style={{fontSize:'.95rem',fontWeight:700}}>Cultures prêtes</h3>
            <button className="btn-ghost btn-sm" onClick={()=>navigate('/cultures')}>Voir tout</button>
          </div>
          <div style={{marginBottom:'.875rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px',fontSize:'.84rem'}}>
              <span style={{color:'var(--muted)'}}>Bénéfice net</span>
              <span style={{fontWeight:700,color:profit>=0?'var(--ok)':'var(--err)'}}>${profit.toLocaleString()}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{width:`${Math.min(100,rev>0?Math.round((profit/rev)*100):0)}%`}}/>
            </div>
            <p style={{fontSize:'.72rem',color:'var(--muted)',marginTop:'3px'}}>Marge {rev>0?Math.round((profit/rev)*100):0}%</p>
          </div>
          {crops.filter(c=>c.status==='ready').slice(0,3).map((c,i)=>(
            <div key={c.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid var(--borderS)',fontSize:'.84rem'}}>
              <div>
                <p style={{fontWeight:600}}>{c.type} — {c.zone}</p>
                <p style={{fontSize:'.72rem',color:'var(--muted)'}}>Récolte: {c.harvestDate}</p>
              </div>
              <span className="badge badge-acc">Prête</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
