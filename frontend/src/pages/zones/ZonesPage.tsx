import { useTranslation } from 'react-i18next'
import React, { useState, useMemo } from 'react'
import { Plus, Layers } from 'lucide-react'
import { useStore, Zone } from '@/store/useStore'
import { ConfirmDelete, Modal, TableActions, EmptyState, StatCard, toast } from '@/components/ui/crud'
import { clsx } from 'clsx'

const TYPE_CFG:Record<string,{label:string;emoji:string;color:string;bg:string}> = {
  pasture:{label:'Pâturage',emoji:'🌿',color:'var(--ok)',bg:'var(--okBg)'},
  cropland:{label:'Culture',emoji:'🌱',color:'var(--warn)',bg:'var(--warnBg)'},
  mixed:{label:'Mixte',emoji:'🔀',color:'var(--b700)',bg:'var(--b100)'},
  fallow:{label:'Jachère',emoji:'🍂',color:'var(--text-muted)',bg:'var(--surface2)'},
  forest:{label:'Forêt',emoji:'🌲',color:'var(--ok)',bg:'var(--okBg)'},
  infrastructure:{label:'Infrastructure',emoji:'🏠',color:'var(--accent)',bg:'var(--accentS)'},
}
const STATUS_CFG:Record<string,{label:string;dot:string}> = {
  active:{label:'Actif',dot:'#22c55e'}, resting:{label:'En repos',dot:'#f59e0b'}, developing:{label:'En aménagement',dot:'#3b82f6'},
}
type FD = Omit<Zone,'id'|'createdAt'|'updatedAt'>
const EMPTY:FD = {name:'',code:'',type:'pasture',area:0,capacity:0,used:0,status:'active',responsible:'',notes:''}

function ZoneForm({initial,onSave,onCancel}:{initial:FD;onSave:(d:FD)=>void;onCancel:()=>void}) {
  const [form,setForm]=useState<FD>(initial)
  const set=(k:keyof FD,v:any)=>setForm(p=>({...p,[k]:v}))
  return (
    <div className="space-y-4">
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1rem'}}>
        <div><label className="label">Nom *</label><input className="input" placeholder="ex: Zone G — Pâturage Sud..." value={form.name} onChange={e=>set('name',e.target.value)}/></div>
        <div><label className="label">Code unique *</label><input className="input" placeholder="Z-G" value={form.code} onChange={e=>set('code',e.target.value)}/></div>
      </div>
      <div>
        <label className="label">Type de zone *</label>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem'}}>
          {Object.entries(TYPE_CFG).map(([v,c])=>(
            <button key={v} onClick={()=>set('type',v)} className="flex items-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all"
              style={{background:form.type===v?c.bg:'var(--surface2)',borderColor:form.type===v?c.color:'var(--borderS)',color:form.type===v?c.color:'var(--text-muted)'}}>
              <span>{c.emoji}</span>{c.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1rem'}}>
        <div><label className="label">Superficie (ha)</label><input className="input" type="number" placeholder="0" value={form.area||''} onChange={e=>set('area',parseFloat(e.target.value)||0)}/></div>
        <div><label className="label">Capacité (animaux)</label><input className="input" type="number" placeholder="0" value={form.capacity||''} onChange={e=>set('capacity',parseInt(e.target.value)||0)}/></div>
        <div>
          <label className="label">Statut</label>
          <select className="input" value={form.status} onChange={e=>set('status',e.target.value)}>
            {Object.entries(STATUS_CFG).map(([v,c])=><option key={v} value={v}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Responsable de zone</label>
        <select className="input" value={form.responsible} onChange={e=>set('responsible',e.target.value)}>
          <option value="">Choisir...</option>
          {['Jean-Baptiste Mutombo','Marie Kahindo','Pierre Lwambo','Emmanuel Kasereka','Joséphine Nabintu','Christine Mapendo'].map(n=><option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div><label className="label">Notes</label><textarea className="input" rows={2} placeholder="Caractéristiques du sol, accès eau..." value={form.notes} onChange={e=>set('notes',e.target.value)}/></div>
      <div style={{display:'flex',gap:'0.75rem',justifyContent:'flex-end',paddingTop:'1rem',borderTop:'1px solid var(--borderS)'}}>
        <button className="btn-secondary" onClick={onCancel}>{'Annuler'}</button>
        <button className="btn-primary" onClick={()=>{if(form.name&&form.code)onSave(form);else toast('Nom et code requis','error')}}>✓ Enregistrer</button>
      </div>
    </div>
  )
}

export default function ZonesPage() {
  const { t } = useTranslation()
  const {zones,addZone,updateZone,deleteZone}=useStore()
  const [showAdd,setShowAdd]=useState(false)
  const [editZone,setEditZone]=useState<Zone|null>(null)
  const [deleteId,setDeleteId]=useState<string|null>(null)
  const [deleting,setDeleting]=useState(false)
  const [viewMode,setViewMode]=useState<'grid'|'table'>('grid')

  const totalArea=zones.reduce((s,z)=>s+z.area,0)
  const active=zones.filter(z=>z.status==='active').length

  return (
    <div className="space-y-6">
      <div className="page-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem'}}>
        <div><h1 className="page-title">🗺️ Zones & Sous-zones</h1><p className="page-sub">{zones.length} zones · {totalArea.toFixed(1)} ha total</p></div>
        <div style={{display:'flex',gap:'0.5rem'}}>
          <button className="btn-secondary btn-sm" onClick={()=>setViewMode(v=>v==='grid'?'table':'grid')}><Layers className="w-4 h-4"/> {viewMode==='grid'?'Tableau':'Cartes'}</button>
          <button className="btn-primary" onClick={()=>setShowAdd(true)}><Plus className="w-4 h-4"/> Ajouter zone</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem'}}>
        <StatCard label="Total zones" value={zones.length} icon="🗺️" delay="delay-1"/>
        <StatCard label="Zones actives" value={active} icon="✅" delay="delay-2" color="var(--ok)"/>
        <StatCard label="Superficie totale" value={`${totalArea.toFixed(1)} ha`} icon="📐" delay="delay-3"/>
        <StatCard label="Animaux en zone" value={zones.reduce((s,z)=>s+z.used,0)} icon="🐾" delay="delay-4"/>
      </div>

      {viewMode==='grid'?(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1rem'}}>
          {zones.map((zone,i)=>{
            const tc=TYPE_CFG[zone.type]||TYPE_CFG.mixed
            const sc=STATUS_CFG[zone.status]||STATUS_CFG.active
            const pct=zone.capacity>0?Math.round(zone.used/zone.capacity*100):0
            return (
              <div key={zone.id} className={clsx('card anim-fade-up','delay-'+String(Math.min(i+1,6)))}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'0.75rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'0.625rem'}}>
                    <div style={{width:'44px',height:'44px',borderRadius:'14px',background:tc.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem'}}>{tc.emoji}</div>
                    <div>
                      <h3 className="font-display font-bold text-sm leading-tight">{zone.name}</h3>
                      <p className="font-mono text-xs" style={{color:'var(--text-light)'}}>{zone.code}</p>
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'0.375rem'}}>
                    <div style={{width:'7px',height:'7px',borderRadius:'50%',background:sc.dot}}/>
                    <span className="text-xs" style={{color:'var(--text-muted)'}}>{sc.label}</span>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.5rem',textAlign:'center',marginBottom:'0.75rem'}}>
                  {[{l:'Superficie',v:`${zone.area}ha`},{l:'Animaux',v:zone.used||'—'},{l:'Type',v:tc.label}].map((x,j)=>(
                    <div key={j} style={{background:'var(--surface2)',borderRadius:'10px',padding:'0.5rem'}}>
                      <p className="font-semibold text-sm">{x.v}</p>
                      <p className="text-xs" style={{color:'var(--text-light)'}}>{x.l}</p>
                    </div>
                  ))}
                </div>
                {zone.capacity>0&&(<div className="mb-3"><div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.25rem'}}><span className="text-xs" style={{color:'var(--text-muted)'}}>Occupation</span><span className="text-xs font-semibold">{pct}%</span></div><div className="progress-track"><div className="progress-fill" style={{width:`${pct}%`,background:pct>90?'var(--err)':'var(--ok)'}}/></div></div>)}
                {zone.responsible&&<p className="text-xs mb-3" style={{color:'var(--text-muted)'}}>👤 {zone.responsible}</p>}
                <div style={{display:'flex',gap:'0.5rem',paddingTop:'0.625rem',borderTop:'1px solid var(--borderS)'}}>
                  <button className="btn-ghost btn-sm flex-1" onClick={()=>setEditZone(zone)}>✏️ Modifier</button>
                  <button className="btn-ghost btn-sm" style={{color:'var(--err)'}} onClick={()=>setDeleteId(zone.id)}>🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      ):(
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Zone</th><th>Type</th><th>Superficie</th><th>Capacité/Occupation</th><th>Responsable</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {zones.map((zone,i)=>{
                const tc=TYPE_CFG[zone.type]||TYPE_CFG.mixed
                const sc=STATUS_CFG[zone.status]||STATUS_CFG.active
                return (
                  <tr key={zone.id} className="anim-fade-in" style={{animationDelay:`${i*.04}s`}}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                        <span className="text-xl">{tc.emoji}</span>
                        <div><p className="font-semibold text-sm">{zone.name}</p><p className="font-mono text-xs" style={{color:'var(--text-light)'}}>{zone.code}</p></div>
                      </div>
                    </td>
                    <td><span className="badge" style={{background:tc.bg,color:tc.color}}>{tc.label}</span></td>
                    <td className="font-semibold">{zone.area} ha</td>
                    <td>{zone.capacity>0?`${zone.used}/${zone.capacity}`:'—'}</td>
                    <td className="text-sm" style={{color:'var(--text-muted)'}}>{zone.responsible||'—'}</td>
                    <td><div style={{display:'flex',alignItems:'center',gap:'0.375rem'}}><div style={{width:'7px',height:'7px',borderRadius:'50%',background:sc.dot}}/><span className="text-xs">{sc.label}</span></div></td>
                    <td><TableActions onEdit={()=>setEditZone(zone)} onDelete={()=>setDeleteId(zone.id)}/></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Ajouter une zone" size="lg">
        <ZoneForm initial={{...EMPTY}} onSave={d=>{addZone(d);setShowAdd(false);toast(`✅ Zone "${d.name}" créée`)}} onCancel={()=>setShowAdd(false)}/>
      </Modal>
      <Modal open={!!editZone} onClose={()=>setEditZone(null)} title="Modifier la zone" subtitle={editZone?.name} size="lg">
        {editZone&&<ZoneForm initial={{name:editZone.name,code:editZone.code,type:editZone.type,area:editZone.area,capacity:editZone.capacity,used:editZone.used,status:editZone.status,responsible:editZone.responsible,notes:editZone.notes}}
          onSave={d=>{updateZone(editZone.id,d);setEditZone(null);toast(`✏️ Zone "${d.name}" modifiée`)}} onCancel={()=>setEditZone(null)}/>}
      </Modal>
      <ConfirmDelete open={!!deleteId} title="Supprimer la zone" message="Cette zone sera définitivement supprimée. Les animaux et cultures associés ne seront pas supprimés."
        onConfirm={()=>{setDeleting(true);setTimeout(()=>{deleteZone(deleteId!);setDeleteId(null);setDeleting(false);toast('🗑️ Zone supprimée','info')},600)}}
        onCancel={()=>setDeleteId(null)} loading={deleting}/>
    </div>
  )
}
