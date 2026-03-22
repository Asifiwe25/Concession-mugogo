import React, { useState } from 'react'
import { Plus, MapPin, Edit } from 'lucide-react'
import { Modal, toast } from '@/components/ui/crud'
import { useStore } from '@/store/useStore'

const CONCESSION = {
  name:'Concession Mugogo', location:'Mugogo, Walungu, Sud-Kivu', province:'Sud-Kivu',
  territory:'Walungu', area:60.5, soil:'Argilo-limoneux, pH 6.2',
  owner:'Admin Mugogo', created:'2018-03-15',
  infrastructure:['Étable principale (300m²)','Poulailler (200m²)','Hangar stockage','Bureau administratif','2 Forages'],
  desc:'Exploitation agro-pastorale principale, spécialisée en élevage bovin laitier et cultures vivrières.'
}

export default function ConcessionsPage() {
  const {zones,animals,crops,employees,transactions}=useStore()
  const [tab,setTab]=useState('general')
  const [showAdd,setShowAdd]=useState(false)
  const rev=transactions.filter(t=>t.type==='income'&&t.status==='paid').reduce((s,t)=>s+t.amount,0)
  const exp=transactions.filter(t=>t.type==='expense'&&t.status==='paid').reduce((s,t)=>s+t.amount,0)

  const TABS=[['general','🏢 Général'],['production','📊 Production'],['finance','💰 Finance'],['infrastructure','🔧 Infrastructure']]

  return (
    <div className="space-y-6">
      <div className="page-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem'}}>
        <div><h1 className="page-title">🏞️ Concessions</h1><p className="page-sub">Gestion des exploitations agricoles</p></div>
        <button className="btn-primary" onClick={()=>setShowAdd(true)}><Plus className="w-4 h-4"/> Ajouter concession</button>
      </div>

      <div className="card">
        <div style={{display:'flex',alignItems:'flex-start',gap:'1.25rem',flexWrap:'wrap',marginBottom:'1.25rem'}}>
          <div style={{width:'64px',height:'64px',borderRadius:'20px',background:'var(--accentS)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',flexShrink:0}}>🏞️</div>
          <div style={{flex:1}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.5rem',marginBottom:'0.375rem'}}>
              <h2 className="font-display text-2xl font-bold">{CONCESSION.name}</h2>
              <span className="badge badge-ok">Actif</span>
            </div>
            <p className="text-sm" style={{color:'var(--text-muted)',display:'flex',alignItems:'center',gap:'0.375rem',marginBottom:'0.75rem'}}><MapPin className="w-3.5 h-3.5"/>{CONCESSION.location}</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'0.75rem'}}>
              {[{l:'Superficie',v:`${CONCESSION.area} ha`},{l:'Zones',v:zones.length},{l:'Employés',v:employees.length},{l:'Animaux',v:animals.length},{l:'Cultures',v:crops.length}].map((s,i)=>(
                <div key={i} style={{textAlign:'center',background:'var(--surface2)',borderRadius:'14px',padding:'0.75rem'}}>
                  <p className="font-display text-xl font-bold">{s.v}</p>
                  <p className="text-xs" style={{color:'var(--text-muted)'}}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="tabs">
          {TABS.map(([id,l])=><button key={id} className={`tab ${tab===id?'active':''}`} onClick={()=>setTab(id)}>{l}</button>)}
        </div>

        <div style={{paddingTop:'1.25rem'}}>
          {tab==='general'&&(
            <div className="space-y-3">
              <p className="text-sm" style={{color:'var(--text-muted)'}}>{CONCESSION.desc}</p>
              {[['Province',CONCESSION.province],['Territoire',CONCESSION.territory],['Superficie',`${CONCESSION.area} ha`],['Type de sol',CONCESSION.soil],['Propriétaire',CONCESSION.owner],['Créée le',CONCESSION.created]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'0.75rem 0',borderBottom:'1px solid var(--borderS)'}}>
                  <span className="text-sm" style={{color:'var(--text-muted)'}}>{k}</span>
                  <span className="text-sm font-semibold">{v}</span>
                </div>
              ))}
            </div>
          )}
          {tab==='production'&&(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              {[{l:'Animaux',v:animals.length,icon:'🐾',color:'var(--ok)'},{l:'Cultures actives',v:crops.filter(c=>c.status!=='harvested'&&c.status!=='lost').length,icon:'🌱',color:'var(--warn)'},{l:'Employés actifs',v:employees.filter(e=>e.status==='active').length,icon:'👥',color:'var(--b700)'},{l:'Zones en activité',v:zones.filter(z=>z.status==='active').length,icon:'🗺️',color:'var(--accent)'}].map((s,i)=>(
                <div key={i} className="card" style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                  <div style={{width:'48px',height:'48px',borderRadius:'14px',background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem'}}>{s.icon}</div>
                  <div><p className="font-display text-2xl font-bold" style={{color:s.color}}>{s.v}</p><p className="text-xs" style={{color:'var(--text-muted)'}}>{s.l}</p></div>
                </div>
              ))}
            </div>
          )}
          {tab==='finance'&&(
            <div className="space-y-4">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1rem'}}>
                {[{l:'Revenus',v:`$${rev.toLocaleString()}`,color:'var(--ok)'},{l:'Dépenses',v:`$${exp.toLocaleString()}`,color:'var(--err)'},{l:'Bénéfice',v:`$${(rev-exp).toLocaleString()}`,color:'var(--accent)'}].map((s,i)=>(
                  <div key={i} className="card text-center">
                    <p className="font-display text-2xl font-bold" style={{color:s.color}}>{s.v}</p>
                    <p className="text-xs mt-1" style={{color:'var(--text-muted)'}}>{s.l}</p>
                  </div>
                ))}
              </div>
              {rev>0&&<div className="card"><div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}><span className="text-sm font-medium">Marge nette</span><span className="font-bold" style={{color:'var(--accent)'}}>{Math.round((rev-exp)/rev*100)}%</span></div><div className="progress-track"><div className="progress-fill" style={{width:`${Math.max(0,Math.round((rev-exp)/rev*100))}%`}}/></div></div>}
            </div>
          )}
          {tab==='infrastructure'&&(
            <div className="space-y-2">
              {CONCESSION.infrastructure.map((item,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:'0.75rem',padding:'0.75rem',background:'var(--surface2)',borderRadius:'12px'}}>
                  <span>🏗️</span><span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAdd&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal" style={{maxWidth:'520px'}}>
            <div className="modal-header"><h3 className="font-display text-xl font-bold">Ajouter une concession</h3><button className="btn-ghost" style={{padding:'0.4rem'}} onClick={()=>setShowAdd(false)}>✕</button></div>
            <div className="modal-body space-y-4">
              <input className="input" placeholder="Nom de la concession *"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}><input className="input" placeholder="Province"/><input className="input" placeholder="Territoire"/></div>
              <input className="input" placeholder="Village / Localisation précise"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}><input className="input" type="number" placeholder="Superficie totale (ha)"/><input className="input" placeholder="Type de sol"/></div>
              <input className="input" placeholder="Nom du propriétaire / responsable"/>
              <textarea className="input" rows={2} placeholder="Description, notes..."/>
            </div>
            <div className="modal-footer"><button className="btn-secondary" onClick={()=>setShowAdd(false)}>Annuler</button><button className="btn-primary" onClick={()=>{setShowAdd(false);toast('✅ Concession créée')}}>Créer</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
