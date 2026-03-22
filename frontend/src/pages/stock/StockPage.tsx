import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, ArrowUpDown } from 'lucide-react'
import { useStore, StockItem } from '@/store/useStore'
import { ConfirmDelete, Modal, TableActions, EmptyState, Pagination, SearchBar, StatCard, toast } from '@/components/ui/crud'
import { clsx } from 'clsx'

const CAT_CFG:Record<string,{label:string;emoji:string}> = {
  medicines:{label:'Médicaments',emoji:'💊'},seeds:{label:'Semences',emoji:'🌾'},
  fertilizers:{label:'Engrais',emoji:'🧪'},pesticides:{label:'Pesticides',emoji:'🐛'},
  fuel:{label:'Carburant',emoji:'⛽'},feed:{label:'Aliments animaux',emoji:'🥗'},
  spare_parts:{label:'Pièces détachées',emoji:'🔧'},tools:{label:'Matériel',emoji:'🧰'},
  packaging:{label:'Emballages',emoji:'📦'},other:{label:'Autre',emoji:'🗂️'},
}
const STATUS_CFG:Record<string,{label:string;color:string}> = {
  ok:{label:'OK',color:'badge-ok'},low:{label:'Faible',color:'badge-warn'},critical:{label:'Critique',color:'badge-err'},
}
type FD=Omit<StockItem,'id'|'status'|'createdAt'|'updatedAt'>
const EMPTY:FD={name:'',category:'medicines',quantity:0,unit:'',threshold:0,unitPrice:0,supplier:'',expiryDate:'',location:''}

function StockForm({initial,onSave,onCancel}:{initial:FD;onSave:(d:FD)=>void;onCancel:()=>void}) {
  const [form,setForm]=useState<FD>(initial)
  const [errors,setErrors]=useState<Record<string,string>>({})
  const set=(k:keyof FD,v:any)=>setForm(p=>({...p,[k]:v}))
  const validate=()=>{const e:Record<string,string>={};if(!form.name.trim())e.name='Requis';if(!form.unit.trim())e.unit='Requis';setErrors(e);return!Object.keys(e).length}

  return (
    <div className="space-y-4">
      <div><label className="label">Désignation *</label><input className={clsx('input',errors.name&&'error')} placeholder="Nom de l'article..." value={form.name} onChange={e=>set('name',e.target.value)}/>{errors.name&&<p className="text-xs mt-1" style={{color:'var(--err)'}}>{errors.name}</p>}</div>
      <div>
        <label className="label">Catégorie *</label>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'0.5rem'}}>
          {Object.entries(CAT_CFG).map(([v,c])=>(
            <button key={v} onClick={()=>set('category',v)} className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-medium transition-all"
              style={{background:form.category===v?'var(--accentS)':'var(--surface2)',borderColor:form.category===v?'var(--accent)':'var(--borderS)',color:form.category===v?'var(--accent)':'var(--text-muted)'}}>
              <span className="text-lg">{c.emoji}</span><span style={{fontSize:'0.62rem',textAlign:'center',lineHeight:'1.2'}}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1rem'}}>
        <div><label className="label">Quantité</label><input className="input" type="number" placeholder="0" value={form.quantity||''} onChange={e=>set('quantity',parseFloat(e.target.value)||0)}/></div>
        <div><label className="label">Unité *</label><select className="input" value={form.unit} onChange={e=>set('unit',e.target.value)}><option value="">...</option>{['kg','g','litres','ml','unités','sacs 25kg','sacs 50kg','flacons','doses','comprimés','boîtes'].map(u=><option key={u} value={u}>{u}</option>)}</select>{errors.unit&&<p className="text-xs mt-1" style={{color:'var(--err)'}}>{errors.unit}</p>}</div>
        <div><label className="label">Seuil alerte</label><input className="input" type="number" placeholder="0" value={form.threshold||''} onChange={e=>set('threshold',parseFloat(e.target.value)||0)}/></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
        <div><label className="label">Prix unitaire (USD)</label><input className="input" type="number" step="0.01" placeholder="0.00" value={form.unitPrice||''} onChange={e=>set('unitPrice',parseFloat(e.target.value)||0)}/></div>
        <div><label className="label">Fournisseur</label><input className="input" placeholder="Nom du fournisseur..." value={form.supplier} onChange={e=>set('supplier',e.target.value)}/></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
        <div><label className="label">Date péremption</label><input className="input" type="date" value={form.expiryDate} onChange={e=>set('expiryDate',e.target.value)}/></div>
        <div><label className="label">Emplacement</label><select className="input" value={form.location} onChange={e=>set('location',e.target.value)}><option value="">...</option>{['Entrepôt principal','Armoire vétérinaire','Réfrigérateur','Hangar agricole','Réservoir carburant'].map(l=><option key={l} value={l}>{l}</option>)}</select></div>
      </div>
      <div style={{display:'flex',gap:'0.75rem',justifyContent:'flex-end',paddingTop:'1rem',borderTop:'1px solid var(--borderS)'}}>
        <button className="btn-secondary" onClick={onCancel}>Annuler</button>
        <button className="btn-primary" onClick={()=>{if(validate())onSave(form);else toast('Champs obligatoires manquants','error')}}>✓ Enregistrer</button>
      </div>
    </div>
  )
}

function MovementModal({item,open,onClose}:{item:StockItem|null;open:boolean;onClose:()=>void}) {
  const {addMovement}=useStore()
  const [type,setType]=useState<'in'|'out'>('in')
  const [qty,setQty]=useState('')
  const [reason,setReason]=useState('')
  if(!open||!item) return null
  const handleSave=()=>{
    if(!qty||parseFloat(qty)<=0){toast('Quantité invalide','error');return}
    addMovement({itemId:item.id,itemName:item.name,type,quantity:parseFloat(qty),reason,date:new Date().toISOString().split('T')[0],createdBy:'Admin'})
    toast(`${type==='in'?'📥 Entrée':'📤 Sortie'} : ${qty} ${item.unit}`)
    setQty('');setReason('');onClose()
  }
  return (
    <div className="modal-overlay" style={{zIndex:55}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:'420px'}}>
        <div className="modal-header">
          <div><h3 className="font-display text-xl font-bold">Mouvement de stock</h3><p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{item.name} · Stock: <strong>{item.quantity} {item.unit}</strong></p></div>
          <button className="btn-ghost" style={{padding:'0.4rem'}} onClick={onClose}>✕</button>
        </div>
        <div className="modal-body space-y-4">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
            {[['in','📥 Entrée'],['out','📤 Sortie']].map(([v,l])=>(
              <button key={v} onClick={()=>setType(v as 'in'|'out')} className="py-3 rounded-xl border text-sm font-medium transition-all"
                style={{background:type===v?(v==='in'?'var(--okBg)':'var(--errBg)'):'var(--surface2)',borderColor:type===v?(v==='in'?'var(--ok)':'var(--err)'):'var(--borderS)',color:type===v?(v==='in'?'var(--ok)':'var(--err)'):'var(--text-muted)'}}>
                {l}
              </button>
            ))}
          </div>
          <div><label className="label">Quantité ({item.unit}) *</label><input className="input" type="number" placeholder="0" value={qty} onChange={e=>setQty(e.target.value)}/></div>
          <div>
            <label className="label">Motif</label>
            <select className="input" value={reason} onChange={e=>setReason(e.target.value)}>
              <option value="">Choisir...</option>
              {(type==='in'?['Achat fournisseur','Réception commande','Don/Subvention','Ajustement inventaire']:['Traitement vétérinaire','Fertilisation','Traitement phytosanitaire','Plein carburant','Perte/Péremption','Autre']).map(r=><option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Annuler</button>
          <button className="btn-primary" onClick={handleSave}>✓ Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

export default function StockPage() {
  const {t}=useTranslation()
  const {stock,movements,addStockItem,updateStockItem,deleteStockItem}=useStore()
  const [search,setSearch]=useState('')
  const [catF,setCatF]=useState('')
  const [statusF,setStatusF]=useState('')
  const [page,setPage]=useState(1)
  const PER=12
  const [showAdd,setShowAdd]=useState(false)
  const [editItem,setEditItem]=useState<StockItem|null>(null)
  const [deleteId,setDeleteId]=useState<string|null>(null)
  const [deleting,setDeleting]=useState(false)
  const [movItem,setMovItem]=useState<StockItem|null>(null)
  const [showMov,setShowMov]=useState(false)
  const [showHistory,setShowHistory]=useState(false)

  const filtered=useMemo(()=>stock.filter(s=>{
    const q=search.toLowerCase()
    return(!q||s.name.toLowerCase().includes(q)||s.supplier.toLowerCase().includes(q))&&(!catF||s.category===catF)&&(!statusF||s.status===statusF)
  }),[stock,search,catF,statusF])
  const paged=filtered.slice((page-1)*PER,page*PER)
  const critical=stock.filter(s=>s.status==='critical').length
  const low=stock.filter(s=>s.status==='low').length
  const totalVal=stock.reduce((sum,s)=>sum+s.quantity*s.unitPrice,0)

  return (
    <div className="space-y-6">
      <div className="page-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem'}}>
        <div><h1 className="page-title">📦 {t('stock.title')}</h1><p className="page-sub">{stock.length} articles · {movements.length} mouvements</p></div>
        <div style={{display:'flex',gap:'0.5rem'}}>
          <button className="btn-secondary btn-sm" onClick={()=>setShowHistory(true)}><ArrowUpDown className="w-4 h-4"/> Historique</button>
          <button className="btn-primary" onClick={()=>setShowAdd(true)}><Plus className="w-4 h-4"/> Ajouter article</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem'}}>
        <StatCard label="Articles total" value={stock.length} icon="📦" delay="delay-1"/>
        <StatCard label="Stock critique" value={critical} icon="🔴" delay="delay-2" color="var(--err)"/>
        <StatCard label="Stock faible" value={low} icon="🟡" delay="delay-3" color="var(--warn)"/>
        <StatCard label="Valeur totale" value={`$${Math.round(totalVal).toLocaleString()}`} icon="💵" delay="delay-4" color="var(--accent)"/>
      </div>
      <div style={{display:'flex',gap:'0.5rem',overflowX:'auto',paddingBottom:'4px'}}>
        {[['','🗂️ Tous'],...Object.entries(CAT_CFG).map(([v,c])=>[v,`${c.emoji} ${c.label}`])].map(([v,l])=>(
          <button key={v} onClick={()=>{setCatF(v);setPage(1)}} className="flex-shrink-0 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all"
            style={{background:catF===v?'var(--accent)':'white',color:catF===v?'white':'var(--text-muted)',borderColor:catF===v?'var(--accent)':'var(--borderS)'}}>{l}</button>
        ))}
      </div>
      <SearchBar value={search} onChange={v=>{setSearch(v);setPage(1)}} placeholder="Article, fournisseur..."
        extra={<select className="input" style={{width:'140px'}} value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1)}}><option value="">Tous statuts</option>{Object.entries(STATUS_CFG).map(([v,c])=><option key={v} value={v}>{c.label}</option>)}</select>}
      />
      {filtered.length===0?<EmptyState icon="📦" title="Aucun article" desc="Ajoutez votre premier article au stock" action={<button className="btn-primary" onClick={()=>setShowAdd(true)}><Plus className="w-4 h-4"/> Ajouter</button>}/>:(
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Article</th><th>Catégorie</th><th>Quantité</th><th>Seuil</th><th>Prix unit.</th><th>Valeur</th><th>Expiration</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {paged.map((item,i)=>{
                const cat=CAT_CFG[item.category]||{emoji:'📦',label:item.category}
                const st=STATUS_CFG[item.status]||STATUS_CFG.ok
                const expSoon=item.expiryDate&&new Date(item.expiryDate)<=new Date(Date.now()+30*86400000)
                return(
                  <tr key={item.id} className="anim-fade-in" style={{animationDelay:`${i*.04}s`}}>
                    <td><p className="font-semibold text-sm">{item.name}</p>{item.supplier&&<p className="text-xs" style={{color:'var(--text-muted)'}}>🏪 {item.supplier}</p>}{item.location&&<p className="text-xs" style={{color:'var(--text-light)'}}>📍 {item.location}</p>}</td>
                    <td><span className="badge badge-dim">{cat.emoji} {cat.label}</span></td>
                    <td><span className="font-bold" style={{color:item.status==='critical'?'var(--err)':item.status==='low'?'var(--warn)':'var(--text)'}}>{item.quantity} {item.unit}</span></td>
                    <td className="text-sm" style={{color:'var(--text-muted)'}}>{item.threshold} {item.unit}</td>
                    <td className="text-sm font-medium">${item.unitPrice.toFixed(2)}</td>
                    <td className="font-semibold text-sm">${(item.quantity*item.unitPrice).toFixed(0)}</td>
                    <td>{item.expiryDate?<span className="text-xs" style={{color:expSoon?'var(--err)':'var(--text-muted)'}}>{expSoon?'⚠️ ':''}{item.expiryDate}</span>:<span className="text-xs" style={{color:'var(--text-light)'}}>—</span>}</td>
                    <td><span className={clsx('badge',st.color)}>{st.label}</span></td>
                    <td>
                      <div style={{display:'flex',gap:'0.25rem'}}>
                        <button className="btn-ghost btn-sm" style={{padding:'0.35rem'}} onClick={()=>{setMovItem(item);setShowMov(true)}} title="Mouvement"><ArrowUpDown className="w-4 h-4"/></button>
                        <button className="btn-ghost btn-sm" style={{padding:'0.35rem'}} onClick={()=>setEditItem(item)} title="Modifier"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                        <button className="btn-ghost btn-sm" style={{padding:'0.35rem',color:'var(--err)'}} onClick={()=>setDeleteId(item.id)} title="Supprimer"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage}/>
        </div>
      )}
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Ajouter un article au stock" size="lg">
        <StockForm initial={{...EMPTY}} onSave={d=>{addStockItem(d);setShowAdd(false);toast(`✅ "${d.name}" ajouté au stock`)}} onCancel={()=>setShowAdd(false)}/>
      </Modal>
      <Modal open={!!editItem} onClose={()=>setEditItem(null)} title="Modifier l'article" subtitle={editItem?.name} size="lg">
        {editItem&&<StockForm initial={{name:editItem.name,category:editItem.category,quantity:editItem.quantity,unit:editItem.unit,threshold:editItem.threshold,unitPrice:editItem.unitPrice,supplier:editItem.supplier,expiryDate:editItem.expiryDate,location:editItem.location}}
          onSave={d=>{updateStockItem(editItem.id,d);setEditItem(null);toast(`✏️ "${d.name}" modifié`)}} onCancel={()=>setEditItem(null)}/>}
      </Modal>
      <MovementModal item={movItem} open={showMov} onClose={()=>{setShowMov(false);setMovItem(null)}}/>
      <Modal open={showHistory} onClose={()=>setShowHistory(false)} title="Historique des mouvements" size="lg">
        <div className="space-y-2">
          {movements.length===0?<p className="text-center py-8" style={{color:'var(--text-muted)'}}>Aucun mouvement</p>:
          movements.slice().reverse().map((mv,i)=>(
            <div key={mv.id} className="flex items-center gap-3 p-3 rounded-xl" style={{background:'var(--surface2)'}}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{background:mv.type==='in'?'var(--okBg)':'var(--errBg)'}}>{mv.type==='in'?'📥':'📤'}</div>
              <div className="flex-1"><p className="text-sm font-semibold">{mv.itemName}</p><p className="text-xs" style={{color:'var(--text-muted)'}}>{mv.reason||'—'} · {mv.date}</p></div>
              <div className="text-right"><p className="font-bold text-sm" style={{color:mv.type==='in'?'var(--ok)':'var(--err)'}}>{mv.type==='in'?'+':'-'}{mv.quantity}</p><p className="text-xs" style={{color:'var(--text-muted)'}}>{mv.createdBy}</p></div>
            </div>
          ))}
        </div>
      </Modal>
      <ConfirmDelete open={!!deleteId} title="Supprimer cet article" message="L'article sera définitivement supprimé du stock."
        onConfirm={()=>{setDeleting(true);setTimeout(()=>{deleteStockItem(deleteId!);setDeleteId(null);setDeleting(false);toast('🗑️ Article supprimé','info')},600)}}
        onCancel={()=>setDeleteId(null)} loading={deleting}/>
    </div>
  )
}
