import React, { useState } from 'react'
import { Plus, Download, FileText, Wrench, ChevronRight, CheckCircle, Loader2, X, Trash2 } from 'lucide-react'
import { useExtraStore } from '@/store/extraStore'
import { useAuthStore } from '@/context/authStore'
import { useTranslation } from 'react-i18next'
import { getReportLogoHTML } from '@/components/ui/MugogoLogo'
import { useStore, Harvest, Machine } from '@/store/useStore'
import { ConfirmDelete, Modal, StatCard, EmptyState, Pagination, toast } from '@/components/ui/crud'
import { clsx } from 'clsx'

// ── HARVESTS ─────────────────────────────────────────────────
const DEST_CFG:Record<string,{label:string;cls:string}>={
  sale:{label:'Vente directe',cls:'badge-ok'},storage:{label:'Stockage',cls:'badge-dim'},
  mixed:{label:'Mixte',cls:'badge-warn'},internal:{label:'Consommation',cls:'badge-dim'},
}
type HFD={cropId:string;cropType:string;zone:string;date:string;grossQty:number;netQty:number;unit:string;grade:string;destination:string;salePrice:number;revenue:number;responsible:string;notes:string}
const HEMPTY:HFD={cropId:'',cropType:'',zone:'',date:new Date().toISOString().split('T')[0],grossQty:0,netQty:0,unit:'tonnes',grade:'A',destination:'sale',salePrice:0,revenue:0,responsible:'',notes:''}

function HarvestForm({onSave,onCancel,crops}:{onSave:(d:HFD)=>void;onCancel:()=>void;crops:any[]}) {
  const [form,setForm]=useState<HFD>(HEMPTY)
  const set=(k:string,v:any)=>setForm(p=>({...p,[k]:v}))
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div className="form-grid">
        <div>
          <label className="label">Culture recoltee *</label>
          <select className="input" value={form.cropId} onChange={e=>{const c=crops.find(x=>x.id===e.target.value);set('cropId',e.target.value);if(c){set('cropType',`${c.type} ${c.variety}`);set('zone',c.zone)}}}>
            <option value="">Selectionner...</option>
            {crops.map(c=><option key={c.id} value={c.id}>{c.type} {c.variety} — {c.zone}</option>)}
          </select>
        </div>
        <div><label className="label">Date de recolte</label><input className="input" type="date" value={form.date} onChange={e=>set('date',e.target.value)}/></div>
      </div>
      <div className="form-grid3">
        <div><label className="label">Quantite brute (kg)</label><input className="input" type="number" value={form.grossQty||''} onChange={e=>set('grossQty',parseFloat(e.target.value)||0)}/></div>
        <div><label className="label">Quantite nette (kg)</label><input className="input" type="number" value={form.netQty||''} onChange={e=>{const n=parseFloat(e.target.value)||0;set('netQty',n);set('revenue',Math.round(n*form.salePrice*100)/100)}}/></div>
        <div>
          <label className="label">Grade</label>
          <select className="input" value={form.grade} onChange={e=>set('grade',e.target.value)}>
            <option value="A">Grade A — Excellent</option>
            <option value="B">Grade B — Bon</option>
            <option value="C">Grade C — Acceptable</option>
          </select>
        </div>
      </div>
      <div className="form-grid">
        <div>
          <label className="label">Destination</label>
          <select className="input" value={form.destination} onChange={e=>set('destination',e.target.value)}>
            {Object.entries(DEST_CFG).map(([v,c])=><option key={v} value={v}>{c.label}</option>)}
          </select>
        </div>
        <div><label className="label">Prix vente (USD/kg)</label><input className="input" type="number" step="0.01" value={form.salePrice||''} onChange={e=>{const p=parseFloat(e.target.value)||0;set('salePrice',p);set('revenue',Math.round(p*form.netQty*100)/100)}}/></div>
      </div>
      <div className="form-grid">
        <div>
          <label className="label">Responsable</label>
          <select className="input" value={form.responsible} onChange={e=>set('responsible',e.target.value)}>
            <option value="">Choisir...</option>
            {['Richard Bunani','Marie Kahindo','Josephine Nabintu','Jean-Baptiste Mutombo','Emmanuel Kasereka'].map(n=><option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div><label className="label">Revenu calcule (USD)</label><input className="input" readOnly value={form.revenue>0?`$${form.revenue}`:'—'} style={{background:'var(--surface2)',fontWeight:700,color:form.revenue>0?'var(--ok)':'var(--muted)'}}/></div>
      </div>
      <div><label className="label">Notes / Observations</label><textarea className="input" rows={2} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Conditions de recolte, pertes, qualite observee..."/></div>
      <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',paddingTop:'1rem',borderTop:'1px solid var(--borderS)'}}>
        <button className="btn-secondary" onClick={onCancel}>Annuler</button>
        <button className="btn-primary" onClick={()=>{if(form.cropType&&form.netQty>0)onSave(form);else toast('Culture et quantite nette requis','error')}}>Enregistrer la recolte</button>
      </div>
    </div>
  )
}

export function HarvestsPage() {
  const {harvests,crops,addHarvest,updateHarvest,deleteHarvest}=useStore()
  const [showAdd,setShowAdd]=useState(false)
  const [editH,setEditH]=useState<Harvest|null>(null)
  const [deleteId,setDeleteId]=useState<string|null>(null)
  const [deleting,setDeleting]=useState(false)
  const [page,setPage]=useState(1)
  const PER=10

  const totalNet=harvests.reduce((s,h)=>s+h.netQty,0)
  const totalRev=harvests.reduce((s,h)=>s+h.revenue,0)

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.25rem',animation:'fadeUp .4s ease'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'.75rem'}}>
        <div><h1 className="page-title">Recoltes</h1><p className="page-sub">{harvests.length} recoltes — {totalNet.toFixed(1)} t — ${totalRev.toLocaleString()}</p></div>
        <div style={{display:'flex',gap:'6px'}}>
          <button className="btn-secondary btn-sm"><Download size={13}/> Export</button>
          <button className="btn-primary" onClick={()=>setShowAdd(true)}><Plus size={14}/> Enregistrer recolte</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'.75rem'}}>
        <StatCard label="Total recoltes" value={harvests.length} delay="d1"/>
        <StatCard label="Tonnes recoltees" value={`${totalNet.toFixed(1)} t`} delay="d2" color="var(--b700)"/>
        <StatCard label="Revenus generes" value={`$${totalRev.toLocaleString()}`} delay="d3" color="var(--ok)"/>
        <StatCard label="En stockage" value={harvests.filter(h=>h.destination==='storage').length} delay="d4"/>
      </div>
      {harvests.length===0?(
        <EmptyState title="Aucune recolte enregistree" desc="Enregistrez votre premiere recolte" action={<button className="btn-primary" onClick={()=>setShowAdd(true)}><Plus size={14}/> Enregistrer</button>}/>
      ):(
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Culture</th><th>Zone</th><th>Date</th><th>Qte brute</th><th>Qte nette</th><th>Grade</th><th>Destination</th><th>Revenu</th><th>Responsable</th><th>Actions CRUD</th></tr></thead>
            <tbody>
              {harvests.slice((page-1)*PER,page*PER).map((h,i)=>(
                <tr key={h.id} className="anim-fade-in" style={{animationDelay:`${i*.04}s`}}>
                  <td><p style={{fontWeight:700}}>{h.cropType}</p></td>
                  <td style={{color:'var(--muted)'}}>{h.zone}</td>
                  <td style={{fontFamily:'monospace',fontSize:'.78rem',color:'var(--light)'}}>{h.date}</td>
                  <td>{h.grossQty} {h.unit}</td>
                  <td style={{fontWeight:700,color:'var(--accent)'}}>{h.netQty} {h.unit}</td>
                  <td><span className={clsx('badge',h.grade==='A'?'badge-ok':'badge-warn')}>Grade {h.grade}</span></td>
                  <td><span className={clsx('badge',(DEST_CFG[h.destination]||{cls:'badge-dim'}).cls)}>{(DEST_CFG[h.destination]||{label:h.destination}).label}</span></td>
                  <td style={{fontWeight:700,color:h.revenue>0?'var(--ok)':'var(--muted)'}}>{h.revenue>0?`$${h.revenue.toLocaleString()}`:'—'}</td>
                  <td style={{fontSize:'.82rem',color:'var(--muted)'}}>{h.responsible||'—'}</td>
                  <td>
                    <div style={{display:'flex',gap:'3px'}}>
                      <button className="btn-ico edt" title="Modifier" onClick={()=>setEditH(h)}><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                      <button className="btn-ico del" title="Supprimer" onClick={()=>setDeleteId(h.id)}><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination total={harvests.length} page={page} perPage={PER} onPage={setPage}/>
        </div>
      )}
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Enregistrer une recolte" size="lg">
        <HarvestForm crops={crops} onSave={d=>{addHarvest(d);setShowAdd(false);toast(`Recolte ${d.cropType} enregistree`)}} onCancel={()=>setShowAdd(false)}/>
      </Modal>
      <ConfirmDelete open={!!deleteId} title="Supprimer la recolte" message="Cette recolte sera definitivement supprimee."
        onConfirm={()=>{setDeleting(true);setTimeout(()=>{deleteHarvest(deleteId!);setDeleteId(null);setDeleting(false);toast('Recolte supprimee','info')},600)}}
        onCancel={()=>setDeleteId(null)} loading={deleting}/>
    </div>
  )
}

// ── MACHINES ─────────────────────────────────────────────────
const MTYPE:Record<string,{label:string}>={
  tractor:{label:'Tracteur'},cultivator:{label:'Motoculteur'},pump:{label:'Pompe'},
  generator:{label:'Generateur'},vehicle:{label:'Vehicule'},harvester:{label:'Moissonneuse'},
  sprayer:{label:'Pulverisateur'},other:{label:'Autre'},
}
const MSTATUS:Record<string,{label:string;cls:string}> = {
  available:{label:'Disponible',cls:'badge-ok'},in_use:{label:'En utilisation',cls:'badge-warn'},
  maintenance:{label:'Maintenance',cls:'badge-warn'},out_of_service:{label:'Hors service',cls:'badge-err'},
}
type MFD=Omit<Machine,'id'|'createdAt'|'updatedAt'>
const MEMPTY:MFD={type:'tractor',brand:'',model:'',year:new Date().getFullYear(),serial:'',plate:'',status:'available',hours:0,fuel:'diesel',value:0,nextMainDate:'',notes:''}

function MachineForm({initial,onSave,onCancel}:{initial:MFD;onSave:(d:MFD)=>void;onCancel:()=>void}) {
  const [form,setForm]=useState<MFD>(initial)
  const set=(k:keyof MFD,v:any)=>setForm(p=>({...p,[k]:v}))
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div>
        <label className="label">Type de machine *</label>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px'}}>
          {Object.entries(MTYPE).map(([v,c])=>(
            <button key={v} onClick={()=>set('type',v)}
              style={{padding:'8px',borderRadius:'10px',border:`1.5px solid`,cursor:'pointer',fontSize:'.78rem',fontWeight:form.type===v?700:400,
                      borderColor:form.type===v?'var(--accent)':'var(--border)',
                      background:form.type===v?'var(--accentS)':'var(--surface2)',
                      color:form.type===v?'var(--accent)':'var(--muted)'}}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className="form-grid">
        <div><label className="label">Marque *</label><input className="input" placeholder="ex: Massey Ferguson..." value={form.brand} onChange={e=>set('brand',e.target.value)}/></div>
        <div><label className="label">Modele *</label><input className="input" placeholder="ex: MF 290..." value={form.model} onChange={e=>set('model',e.target.value)}/></div>
      </div>
      <div className="form-grid3">
        <div><label className="label">Annee</label><input className="input" type="number" value={form.year||''} onChange={e=>set('year',parseInt(e.target.value)||0)}/></div>
        <div><label className="label">N° de serie</label><input className="input" placeholder="..." value={form.serial} onChange={e=>set('serial',e.target.value)}/></div>
        <div><label className="label">Immatriculation</label><input className="input" placeholder="—" value={form.plate} onChange={e=>set('plate',e.target.value)}/></div>
      </div>
      <div className="form-grid3">
        <div><label className="label">Heures / Km</label><input className="input" type="number" value={form.hours||''} onChange={e=>set('hours',parseInt(e.target.value)||0)}/></div>
        <div><label className="label">Carburant</label><select className="input" value={form.fuel} onChange={e=>set('fuel',e.target.value)}>{['diesel','essence','electrique','autre'].map(f=><option key={f} value={f}>{f}</option>)}</select></div>
        <div><label className="label">Valeur ($)</label><input className="input" type="number" value={form.value||''} onChange={e=>set('value',parseInt(e.target.value)||0)}/></div>
      </div>
      <div className="form-grid">
        <div>
          <label className="label">Statut</label>
          <select className="input" value={form.status} onChange={e=>set('status',e.target.value)}>
            {Object.entries(MSTATUS).map(([v,c])=><option key={v} value={v}>{c.label}</option>)}
          </select>
        </div>
        <div><label className="label">Prochaine maintenance</label><input className="input" type="date" value={form.nextMainDate} onChange={e=>set('nextMainDate',e.target.value)}/></div>
      </div>
      <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e=>set('notes',e.target.value)}/></div>
      <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',paddingTop:'1rem',borderTop:'1px solid var(--borderS)'}}>
        <button className="btn-secondary" onClick={onCancel}>Annuler</button>
        <button className="btn-primary" onClick={()=>{if(form.brand&&form.model)onSave(form);else toast('Marque et modele requis','error')}}>Enregistrer</button>
      </div>
    </div>
  )
}

export function MachinesPage() {
  const {machines,addMachine,updateMachine,deleteMachine}=useStore()
  const [showAdd,setShowAdd]=useState(false)
  const [editM,setEditM]=useState<Machine|null>(null)
  const [deleteId,setDeleteId]=useState<string|null>(null)
  const [deleting,setDeleting]=useState(false)
  const avail=machines.filter(m=>m.status==='available').length

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.25rem',animation:'fadeUp .4s ease'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'.75rem'}}>
        <div><h1 className="page-title">Machines & Maintenance</h1><p className="page-sub">{machines.length} machines — valeur totale ${machines.reduce((s,m)=>s+m.value,0).toLocaleString()}</p></div>
        <button className="btn-primary" onClick={()=>setShowAdd(true)}><Plus size={14}/> Ajouter machine</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'.75rem'}}>
        <StatCard label="Total machines" value={machines.length} delay="d1"/>
        <StatCard label="Disponibles" value={avail} delay="d2" color="var(--ok)"/>
        <StatCard label="En maintenance" value={machines.filter(m=>m.status==='maintenance').length} delay="d3" color="var(--warn)"/>
        <StatCard label="Valeur parc" value={`$${machines.reduce((s,m)=>s+m.value,0).toLocaleString()}`} delay="d4" color="var(--accent)"/>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Machine</th><th>Type</th><th>Annee</th><th>Heures/Km</th><th>Carburant</th><th>Valeur</th><th>Prochaine maintenance</th><th>Statut</th><th>Actions CRUD</th></tr></thead>
          <tbody>
            {machines.map((m,i)=>{
              const ms=MSTATUS[m.status]||MSTATUS.available
              const dToMaint=m.nextMainDate?Math.ceil((new Date(m.nextMainDate).getTime()-Date.now())/86400000):999
              return (
                <tr key={m.id} className="anim-fade-in" style={{animationDelay:`${i*.04}s`}}>
                  <td><p style={{fontWeight:700}}>{m.brand} {m.model}</p><p style={{fontSize:'.76rem',color:'var(--muted)'}}>{m.serial||'—'}</p></td>
                  <td>{MTYPE[m.type]?.label||m.type}</td>
                  <td>{m.year}</td>
                  <td style={{fontWeight:600}}>{m.hours.toLocaleString()}</td>
                  <td style={{fontSize:'.82rem',color:'var(--muted)'}}>{m.fuel}</td>
                  <td style={{fontWeight:700,color:'var(--accent)'}}>${m.value.toLocaleString()}</td>
                  <td>
                    {m.nextMainDate?(
                      <span style={{fontSize:'.8rem',fontWeight:dToMaint<=14?700:400,color:dToMaint<0?'var(--err)':dToMaint<=14?'var(--warn)':'var(--muted)'}}>
                        {m.nextMainDate}{dToMaint<=14?` (${dToMaint}j)`:''}
                      </span>
                    ):'—'}
                  </td>
                  <td><span className={clsx('badge',ms.cls)}>{ms.label}</span></td>
                  <td>
                    <div style={{display:'flex',gap:'3px'}}>
                      <button className="btn-ico edt" title="Modifier" onClick={()=>setEditM(m)}><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
                      <button className="btn-ico del" title="Supprimer" onClick={()=>setDeleteId(m.id)}><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Ajouter une machine" size="lg">
        <MachineForm initial={{...MEMPTY}} onSave={d=>{addMachine(d);setShowAdd(false);toast(`${d.brand} ${d.model} ajoute`)}} onCancel={()=>setShowAdd(false)}/>
      </Modal>
      <Modal open={!!editM} onClose={()=>setEditM(null)} title="Modifier la machine" subtitle={editM?`${editM.brand} ${editM.model}`:''} size="lg">
        {editM&&<MachineForm initial={{type:editM.type,brand:editM.brand,model:editM.model,year:editM.year,serial:editM.serial,plate:editM.plate,status:editM.status,hours:editM.hours,fuel:editM.fuel,value:editM.value,nextMainDate:editM.nextMainDate,notes:editM.notes}}
          onSave={d=>{updateMachine(editM.id,d);setEditM(null);toast(`${d.brand} ${d.model} modifie`)}} onCancel={()=>setEditM(null)}/>}
      </Modal>
      <ConfirmDelete open={!!deleteId} title="Supprimer la machine" message="Cette machine sera definitivement supprimee."
        onConfirm={()=>{setDeleting(true);setTimeout(()=>{deleteMachine(deleteId!);setDeleteId(null);setDeleting(false);toast('Machine supprimee','info')},600)}}
        onCancel={()=>setDeleteId(null)} loading={deleting}/>
    </div>
  )
}

// ── REPORTS ───────────────────────────────────────────────────

const REPORT_DEFS = [
  { id:'rh',  title:'Rapport RH',          desc:'Présence, paie, performance des employés',           tags:['Journalier','Mensuel','Annuel'], icon:'U' },
  { id:'el',  title:'Rapport Élevage',     desc:'Inventaire cheptel, santé, production, reproduction', tags:['Journalier','Mensuel','Annuel'], icon:'A' },
  { id:'ag',  title:'Rapport Agriculture', desc:'État cultures, récoltes, traitements phytosanitaires', tags:['Mensuel','Saison'],             icon:'C' },
  { id:'fi',  title:'Rapport Financier',   desc:'P&L, flux trésorerie, budget vs réalisé',             tags:['Mensuel','Annuel'],             icon:'F' },
  { id:'st',  title:'Rapport Stock',       desc:'Inventaire valorisé, mouvements, ruptures',           tags:['Journalier','Mensuel'],         icon:'S' },
  { id:'vt',  title:'Rapport Sanitaire',   desc:'Vaccinations, maladies, traitements vétérinaires',    tags:['Mensuel'],                      icon:'V' },
  { id:'zo',  title:'Rapport Zones',       desc:'Occupation, rotations, état des parcelles',           tags:['Trimestriel'],                  icon:'Z' },
]

const CAT_LABELS: Record<string,string> = {
  daily:'Rapport journalier', incident:'Incident', livestock:'Élevage',
  crops:'Cultures', finance:'Finance', other:'Autre'
}

function ReportGeneratorModal({ rpt, onClose }: { rpt: typeof REPORT_DEFS[0]; onClose:()=>void }) {
  const [period, setPeriod]   = React.useState<'daily'|'monthly'|'annual'>('monthly')
  const [format, setFormat]   = React.useState<'pdf'|'word'>('pdf')
  const [dateFrom, setFrom]   = React.useState(new Date().toISOString().split('T')[0])
  const [dateTo,   setTo]     = React.useState(new Date().toISOString().split('T')[0])
  const [lang,     setLang]   = React.useState('fr')
  const [generating, setGen]  = React.useState(false)
  const [done,     setDone]   = React.useState(false)

  const PERIODS = [
    { v:'daily',   l:'Journalier' },
    { v:'monthly', l:'Mensuel'    },
    { v:'annual',  l:'Annuel'     },
  ] as const

  const FORMATS = [
    { v:'pdf',  l:'PDF',          ext:'.pdf',  color:'var(--err)' },
    { v:'word', l:'Word (.docx)', ext:'.docx', color:'var(--b600)' },
  ] as const

  const handleGenerate = async () => {
    setGen(true)
    await new Promise(r => setTimeout(r, 1600))
    const now = new Date()
    const periodLabel = { daily:'Journalier', monthly:'Mensuel', annual:'Annuel' }[period]
    const langLabel = { fr:'Français', en:'English', sw:'Kiswahili', mashi:'Mashi' }[lang] || 'Français'
    const fname = `Mugogo_${rpt.id}_${periodLabel}_${dateFrom.replace(/-/g,'')}`

    // Build full HTML report with logo
    const htmlContent = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${rpt.title} — Concession Mugogo</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Georgia, serif; font-size: 13px; color: #2e1f10; background: white; padding: 40px; max-width: 800px; margin: 0 auto; }
  .header { margin-bottom: 28px; padding-bottom: 20px; border-bottom: 3px solid #8c6e3f; display: flex; align-items: center; gap: 16px; }
  .logo-circle { width: 60px; height: 60px; background: #8c6e3f; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .logo-circle svg { width: 36px; height: 36px; }
  .org-name { font-size: 22px; font-weight: 700; color: #8c6e3f; line-height: 1.1; }
  .org-sub { font-size: 11px; color: #666; margin-top: 3px; }
  .report-title { background: #8c6e3f; color: white; padding: 12px 20px; border-radius: 8px; font-size: 16px; font-weight: 700; margin-bottom: 20px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
  .meta-box { background: #f7f0e4; border: 1px solid #deccb0; border-radius: 8px; padding: 10px 14px; }
  .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: .05em; color: #8c6e3f; font-weight: 700; margin-bottom: 3px; }
  .meta-value { font-size: 13px; font-weight: 600; color: #2e1f10; }
  .section-title { font-size: 14px; font-weight: 700; color: #8c6e3f; border-bottom: 2px solid #ede0cc; padding-bottom: 6px; margin: 20px 0 12px; }
  .content-box { background: #fdfaf5; border: 1px solid #ede0cc; border-radius: 8px; padding: 14px; margin-bottom: 16px; font-size: 13px; line-height: 1.7; color: #4a3520; }
  .data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  .data-table th { background: #8c6e3f; color: white; padding: 8px 12px; font-size: 11px; text-align: left; }
  .data-table td { padding: 7px 12px; font-size: 12px; border-bottom: 1px solid #f0e8dc; }
  .data-table tr:nth-child(even) td { background: #fdfaf5; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 2px solid #ede0cc; display: flex; justify-content: space-between; font-size: 11px; color: #8a7060; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 700; }
  .badge-ok { background: #f0f2eb; color: #6b7c4a; }
  .badge-warn { background: #faf3e0; color: #8a6520; }
  .badge-err { background: #f9eded; color: #8c3a3a; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="logo-circle">
      <svg viewBox="0 0 100 100" fill="none">
        <path d="M50 15 L85 40 L85 85 L15 85 L15 40 Z" fill="rgba(255,255,255,0.95)"/>
        <rect x="38" y="62" width="14" height="23" rx="2" fill="#8c6e3f" opacity="0.9"/>
        <rect x="18" y="52" width="14" height="12" rx="2" fill="#8c6e3f" opacity="0.7"/>
        <rect x="68" y="52" width="14" height="12" rx="2" fill="#8c6e3f" opacity="0.7"/>
        <ellipse cx="66" cy="36" rx="9" ry="5.5" fill="#8c6e3f" opacity="0.8" transform="rotate(-30 66 36)"/>
        <circle cx="30" cy="26" r="6" fill="rgba(255,220,100,0.95)"/>
      </svg>
    </div>
    <div>
      <div class="org-name">Concession Mugogo</div>
      <div class="org-sub">Gestion Agro-pastorale Intégrée — Walungu, Sud-Kivu, RDC</div>
      <div class="org-sub">Tél/WhatsApp : +243 976960983 | richardbunani2013@gmail.com</div>
    </div>
  </div>

  <div class="report-title">${rpt.title} — ${periodLabel}</div>

  <div class="meta-grid">
    <div class="meta-box">
      <div class="meta-label">Période</div>
      <div class="meta-value">Du ${dateFrom} au ${dateTo}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Généré le</div>
      <div class="meta-value">${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Format</div>
      <div class="meta-value">${format.toUpperCase()}</div>
    </div>
    <div class="meta-box">
      <div class="meta-label">Langue</div>
      <div class="meta-value">${langLabel}</div>
    </div>
  </div>

  <div class="section-title">Description du rapport</div>
  <div class="content-box">
    <strong>${rpt.title}</strong> — ${rpt.desc}
    <br/><br/>
    Ce rapport couvre la période du <strong>${dateFrom}</strong> au <strong>${dateTo}</strong>.
    Il a été généré automatiquement par le système ERP de la Concession Mugogo.
  </div>

  <div class="section-title">Informations de la concession</div>
  <table class="data-table">
    <tr><th>Propriété</th><th>Valeur</th></tr>
    <tr><td>Propriétaire</td><td><strong>Richard Bunani</strong></td></tr>
    <tr><td>Localisation</td><td>Walungu, Sud-Kivu, République Démocratique du Congo</td></tr>
    <tr><td>Superficie</td><td>9 hectares</td></tr>
    <tr><td>Téléphone / WhatsApp</td><td>+243 976960983</td></tr>
    <tr><td>Email</td><td>richardbunani2013@gmail.com</td></tr>
    <tr><td>Type de rapport</td><td>${periodLabel}</td></tr>
  </table>

  <div class="section-title">Données incluses</div>
  <div class="content-box">
    Les données de ce rapport couvrent : ${rpt.desc}<br/>
    Période analysée : ${periodLabel} (${dateFrom} → ${dateTo})<br/>
    Pour plus de détails, consultez le tableau de bord du système ERP.
  </div>

  <div class="footer">
    <span>© 2025 Concession Mugogo — Walungu, Sud-Kivu, RDC</span>
    <span>Rapport généré le ${now.toLocaleDateString('fr-FR')}</span>
    <span>Propriétaire : Richard Bunani</span>
  </div>
</body>
</html>`

    if (format === 'pdf') {
      // Open print dialog for PDF
      const w = window.open('', '_blank')
      if (w) {
        w.document.write(htmlContent)
        w.document.close()
        setTimeout(() => { w.print() }, 500)
      }
    } else {
      // Download as HTML file (opens in Word)
      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-word;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fname}.doc`
      document.body.appendChild(a); a.click()
      document.body.removeChild(a); URL.revokeObjectURL(url)
    }

    setGen(false); setDone(true)
    toast(`${rpt.title} — ${periodLabel} téléchargé`)
  }

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:'460px'}}>
        <div className="modal-header" style={{background:'var(--b50)'}}>
          <div>
            <h3 style={{fontFamily:'Georgia,serif',fontSize:'1.05rem',fontWeight:700}}>{rpt.title}</h3>
            <p style={{fontSize:'.78rem',color:'var(--muted)',marginTop:'2px'}}>{rpt.desc}</p>
          </div>
          <button className="btn-ghost" style={{padding:'6px'}} onClick={onClose}><X size={15}/></button>
        </div>
        <div className="modal-body">
          {done ? (
            <div style={{textAlign:'center',padding:'1.5rem'}}>
              <div style={{width:'52px',height:'52px',borderRadius:'50%',background:'var(--okBg)',border:'2px solid var(--ok)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}>
                <CheckCircle size={24} style={{color:'var(--ok)'}}/>
              </div>
              <h3 style={{fontFamily:'Georgia,serif',fontSize:'1.1rem',fontWeight:700,marginBottom:'.5rem'}}>Rapport téléchargé</h3>
              <p style={{fontSize:'.84rem',color:'var(--muted)',marginBottom:'1.125rem'}}>Le fichier a été enregistré dans vos Téléchargements.</p>
              <button className="btn-primary" onClick={onClose}>Fermer</button>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div>
                <label className="label">Période</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px',marginTop:'4px'}}>
                  {PERIODS.map(p=>(
                    <button key={p.v} onClick={()=>setPeriod(p.v)}
                      style={{padding:'9px',borderRadius:'10px',border:`1.5px solid ${period===p.v?'var(--accent)':'var(--border)'}`,background:period===p.v?'var(--accentS)':'var(--surface2)',cursor:'pointer',fontSize:'.82rem',fontWeight:700,color:period===p.v?'var(--accent)':'var(--muted)'}}>
                      {p.l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-grid">
                <div><label className="label">Du</label><input className="input" type="date" value={dateFrom} onChange={e=>setFrom(e.target.value)}/></div>
                <div><label className="label">Au</label><input className="input" type="date" value={dateTo} onChange={e=>setTo(e.target.value)}/></div>
              </div>
              <div>
                <label className="label">Format</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginTop:'4px'}}>
                  {FORMATS.map(f=>(
                    <button key={f.v} onClick={()=>setFormat(f.v)}
                      style={{padding:'11px',borderRadius:'10px',border:`1.5px solid ${format===f.v?f.color:'var(--border)'}`,background:format===f.v?`${f.color}14`:'var(--surface2)',cursor:'pointer',textAlign:'left'}}>
                      <p style={{fontWeight:700,fontSize:'.88rem',color:format===f.v?f.color:'var(--muted)'}}>{f.l}</p>
                      <p style={{fontSize:'.72rem',color:'var(--light)',marginTop:'2px'}}>{f.ext}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Langue du rapport</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px',marginTop:'4px'}}>
                  {[['fr','Français'],['sw','Kiswahili'],['mashi','Mashi']].map(([v,l])=>(
                    <button key={v} onClick={()=>setLang(v)}
                      style={{padding:'8px',borderRadius:'9px',border:`1.5px solid ${lang===v?'var(--accent)':'var(--border)'}`,background:lang===v?'var(--accentS)':'var(--surface2)',color:lang===v?'var(--accent)':'var(--muted)',fontSize:'.78rem',fontWeight:700,cursor:'pointer'}}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleGenerate} disabled={generating} className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px'}}>
                {generating
                  ? <><Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/> Génération...</>
                  : <><Download size={14}/> Télécharger {format.toUpperCase()}</>
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FieldReportForm({ onClose }: { onClose:()=>void }) {
  const { user } = useAuthStore()
  const { addFieldReport } = useExtraStore()
  const [type,     setType]    = React.useState<'text'|'voice'|'video'>('text')
  const [title,    setTitle]   = React.useState('')
  const [content,  setContent] = React.useState('')
  const [category, setCat]     = React.useState<'daily'|'incident'|'livestock'|'crops'|'finance'|'other'>('daily')
  const [file,     setFile]    = React.useState<File|null>(null)
  const [recording, setRec]   = React.useState(false)
  const [recTime,  setRecTime] = React.useState(0)
  const [submitted, setSub]   = React.useState(false)
  const recTimer = React.useRef<ReturnType<typeof setInterval>|null>(null)
  const fileRef  = React.useRef<HTMLInputElement>(null)

  const startRec = () => { setRec(true); setRecTime(0); recTimer.current = setInterval(()=>setRecTime(p=>p+1),1000) }
  const stopRec  = () => { setRec(false); if(recTimer.current) clearInterval(recTimer.current) }
  const fmtTime  = (s:number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const handleSubmit = () => {
    if (!title.trim()) { toast('Le titre est requis','error' as any); return }
    addFieldReport({
      authorId: user?.id||'emp', authorName: user?.fullName||'Employé', authorRole: user?.role||'farmer',
      type, title, content, category,
      fileName: file?.name,
      mediaSize: file ? `${(file.size/1024).toFixed(1)} Ko` : undefined,
      duration: type!=='text' ? fmtTime(recTime) : undefined,
    })
    setSub(true); toast('Rapport envoyé à Richard Bunani')
  }

  if (submitted) return (
    <div style={{textAlign:'center',padding:'2rem'}}>
      <div style={{width:'56px',height:'56px',borderRadius:'50%',background:'var(--okBg)',border:'2px solid var(--ok)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}>
        <CheckCircle size={26} style={{color:'var(--ok)'}}/>
      </div>
      <h3 style={{fontFamily:'Georgia,serif',fontSize:'1.1rem',fontWeight:700,marginBottom:'.5rem'}}>Rapport envoyé</h3>
      <p style={{fontSize:'.85rem',color:'var(--muted)',marginBottom:'1.25rem'}}>Transmis à <strong>Richard Bunani</strong> — tableau de bord, WhatsApp et email.</p>
      <button className="btn-primary" onClick={onClose}>Fermer</button>
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div>
        <label className="label">Type de rapport</label>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px',marginTop:'4px'}}>
          {[{v:'text',l:'Écrit'},{v:'voice',l:'Vocal'},{v:'video',l:'Vidéo'}].map(t=>(
            <button key={t.v} onClick={()=>setType(t.v as any)}
              style={{padding:'9px',borderRadius:'10px',border:`1.5px solid ${type===t.v?'var(--accent)':'var(--border)'}`,background:type===t.v?'var(--accentS)':'var(--surface2)',color:type===t.v?'var(--accent)':'var(--muted)',fontSize:'.82rem',fontWeight:700,cursor:'pointer'}}>
              {t.l}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label">Catégorie</label>
        <select className="input" value={category} onChange={e=>setCat(e.target.value as any)}>
          {Object.entries(CAT_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Titre *</label>
        <input className="input" placeholder="ex: Rapport journalier Zone A — 7 Janvier" value={title} onChange={e=>setTitle(e.target.value)}/>
      </div>
      {type==='text' && (
        <div>
          <label className="label">Contenu</label>
          <textarea className="input" rows={5} placeholder="Observations, actions, incidents..." value={content} onChange={e=>setContent(e.target.value)} style={{resize:'vertical'}}/>
        </div>
      )}
      {type==='voice' && (
        <div style={{background:'var(--b100)',borderRadius:'13px',padding:'1.25rem',textAlign:'center',border:'1px solid var(--b300)'}}>
          {!recording ? (
            <>
              <p style={{fontSize:'.84rem',color:'var(--muted)',marginBottom:'.875rem'}}>Enregistrez votre message vocal</p>
              {recTime>0 && <p style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:700,color:'var(--accent)',marginBottom:'.875rem'}}>{fmtTime(recTime)}</p>}
              <button onClick={startRec} className="btn-primary" style={{width:'100%',justifyContent:'center'}}>Démarrer l'enregistrement</button>
            </>
          ) : (
            <>
              <div style={{display:'flex',alignItems:'center',gap:'8px',justifyContent:'center',marginBottom:'.875rem'}}>
                <div style={{width:'10px',height:'10px',borderRadius:'50%',background:'var(--err)',animation:'pulse 1s infinite'}}/>
                <span style={{fontFamily:'monospace',fontSize:'1.4rem',fontWeight:700,color:'var(--err)'}}>{fmtTime(recTime)}</span>
              </div>
              <button onClick={stopRec} className="btn-danger" style={{width:'100%',justifyContent:'center'}}>Arrêter</button>
            </>
          )}
        </div>
      )}
      {type==='video' && (
        <div>
          <label className="label">Fichier vidéo</label>
          <input ref={fileRef} type="file" accept="video/*" style={{display:'none'}} onChange={e=>setFile(e.target.files?.[0]||null)}/>
          <div style={{background:'var(--b100)',borderRadius:'12px',padding:'1.25rem',textAlign:'center',border:`2px dashed ${file?'var(--accent)':'var(--b300)'}`,cursor:'pointer'}} onClick={()=>fileRef.current?.click()}>
            {file ? <p style={{fontWeight:700,color:'var(--accent)'}}>{file.name}</p> : <p style={{color:'var(--muted)'}}>Cliquer pour sélectionner une vidéo</p>}
          </div>
        </div>
      )}
      <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',paddingTop:'1rem',borderTop:'1px solid var(--borderS)'}}>
        <button className="btn-secondary" onClick={onClose}>Annuler</button>
        <button className="btn-primary" onClick={handleSubmit}>Envoyer à Richard Bunani</button>
      </div>
    </div>
  )
}

export function ReportsPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { fieldReports, markReportRead, archiveReport, deleteReport } = useExtraStore()
  const isAdmin = user?.role === 'super_admin' || user?.role === 'director'
  const [activeRpt, setActiveRpt] = React.useState<typeof REPORT_DEFS[0]|null>(null)
  const [showSend, setShowSend]   = React.useState(false)
  const [reportFilter, setFilter] = React.useState('all')

  const myReports = isAdmin
    ? fieldReports
    : fieldReports.filter(r=>r.authorId===user?.id)

  const filteredReports = myReports.filter(r =>
    reportFilter==='all' || r.status===reportFilter || r.type===reportFilter
  )

  const unread = fieldReports.filter(r=>r.status==='pending').length

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.25rem',animation:'fadeUp .4s ease'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'.75rem'}}>
        <div>
          <h1 className="page-title">Rapports & Export</h1>
          <p className="page-sub">
            {isAdmin
              ? `${fieldReports.length} rapports reçus — ${unread} non lus`
              : 'Envoyez vos rapports à Richard Bunani'}
          </p>
        </div>
        <div style={{display:'flex',gap:'7px'}}>
          {!isAdmin && (
            <button className="btn-primary" onClick={()=>setShowSend(true)}>
              <Plus size={14}/> Envoyer un rapport
            </button>
          )}
        </div>
      </div>

      {/* ADMIN SECTION: Download reports */}
      {isAdmin && (
        <>
          <div style={{background:'var(--accentS)',borderRadius:'14px',padding:'12px 16px',border:'1px solid var(--b300)',display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--ok)',flexShrink:0}}/>
            <p style={{fontSize:'.84rem',fontWeight:600,color:'var(--accent)',flex:1}}>
              Administration — Sélectionnez un rapport, choisissez la période et le format de téléchargement.
            </p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1rem',marginBottom:'1rem'}}>
            {REPORT_DEFS.map((r,i)=>(
              <div key={r.id} className="card-hover anim-fade-up" style={{animationDelay:`${i*.05}s`}} onClick={()=>setActiveRpt(r)}>
                <div style={{display:'flex',alignItems:'flex-start',gap:'11px'}}>
                  <div style={{width:'44px',height:'44px',borderRadius:'12px',background:'var(--b100)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontWeight:700,fontSize:'.85rem',color:'var(--b600)'}}>{r.icon}</div>
                  <div style={{flex:1}}>
                    <h3 className="font-display" style={{fontSize:'1rem',fontWeight:700,marginBottom:'4px'}}>{r.title}</h3>
                    <p style={{fontSize:'.82rem',color:'var(--muted)',marginBottom:'8px'}}>{r.desc}</p>
                    <div style={{display:'flex',gap:'4px',flexWrap:'wrap',marginBottom:'10px'}}>
                      {r.tags.map(t=><span key={t} className="badge badge-dim">{t}</span>)}
                    </div>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button className="btn-primary btn-sm" onClick={e=>{e.stopPropagation();setActiveRpt(r)}}>
                        <Download size={11}/> Télécharger
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* FIELD REPORTS RECEIVED (admin) or sent (employee) */}
      <div className="card">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem',flexWrap:'wrap',gap:'8px'}}>
          <h2 className="font-display" style={{fontSize:'1.1rem',fontWeight:700}}>
            {isAdmin ? `Rapports reçus des employés (${fieldReports.length})` : 'Mes rapports envoyés'}
          </h2>
          {!isAdmin && (
            <button className="btn-primary btn-sm" onClick={()=>setShowSend(true)}>
              <Plus size={12}/> Nouveau rapport
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{display:'flex',gap:'5px',marginBottom:'1rem',flexWrap:'wrap'}}>
          {[['all','Tous'],['pending','Non lus'],['read','Lus'],['text','Écrits'],['voice','Vocaux'],['video','Vidéos']].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)}
              className={`pill ${reportFilter===v?'active':''}`} style={{fontSize:'.76rem'}}>
              {l}
            </button>
          ))}
        </div>

        {filteredReports.length === 0 ? (
          <div style={{textAlign:'center',padding:'3rem',color:'var(--muted)'}}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--b300)" strokeWidth="1.5" style={{margin:'0 auto 1rem',display:'block'}}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p style={{fontWeight:500}}>
              {isAdmin ? 'Aucun rapport reçu pour le moment' : 'Aucun rapport envoyé'}
            </p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
            {filteredReports.map((r,i)=>(
              <div key={r.id} className="anim-fade-in" style={{animationDelay:`${i*.04}s`,display:'flex',alignItems:'flex-start',gap:'10px',padding:'11px 13px',borderRadius:'13px',background:r.status==='pending'?'var(--warnBg)':'var(--surface2)',border:`1px solid ${r.status==='pending'?'var(--warn)':'var(--borderS)'}`,transition:'all .2s'}}>
                <div style={{width:'36px',height:'36px',borderRadius:'10px',background:r.type==='text'?'var(--b200)':r.type==='voice'?'var(--accentS)':'var(--errBg)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  {r.type==='text'  && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--b600)" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                  {r.type==='voice' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg>}
                  {r.type==='video' && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--err)" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'8px',marginBottom:'3px',flexWrap:'wrap'}}>
                    <p style={{fontWeight:700,fontSize:'.88rem',color:'var(--text)'}}>{r.title}</p>
                    <div style={{display:'flex',gap:'4px',flexShrink:0}}>
                      <span className="badge badge-dim">{CAT_LABELS[r.category]||r.category}</span>
                      {r.status==='pending' && <span className="badge badge-warn">Non lu</span>}
                      {r.status==='read'    && <span className="badge badge-ok">Lu</span>}
                    </div>
                  </div>
                  {r.content && <p style={{fontSize:'.8rem',color:'var(--muted)',marginBottom:'4px'}}>{r.content.slice(0,120)}{r.content.length>120?'...':''}</p>}
                  <div style={{display:'flex',alignItems:'center',gap:'10px',flexWrap:'wrap'}}>
                    <span style={{fontSize:'.74rem',color:'var(--light)'}}>
                      {isAdmin ? `De: ${r.authorName}` : ''} — {new Date(r.createdAt).toLocaleString('fr-FR')}
                    </span>
                    {r.duration && <span style={{fontSize:'.74rem',color:'var(--muted)',fontFamily:'monospace'}}>{r.duration}</span>}
                    {r.fileName  && <span style={{fontSize:'.74rem',color:'var(--muted)',fontFamily:'monospace'}}>{r.fileName}</span>}
                  </div>
                </div>
                {isAdmin && r.status==='pending' && (
                  <div style={{display:'flex',gap:'4px',flexShrink:0}}>
                    <button className="btn-ico edt" title="Marquer lu" onClick={()=>markReportRead(r.id)}>
                      <CheckCircle size={12}/>
                    </button>
                    <button className="btn-ico del" title="Supprimer" onClick={()=>deleteReport(r.id)}>
                      <Trash2 size={12}/>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {activeRpt && <ReportGeneratorModal rpt={activeRpt} onClose={()=>setActiveRpt(null)}/>}
      <Modal open={showSend} onClose={()=>setShowSend(false)} title="Envoyer un rapport" subtitle="Votre rapport sera transmis à Richard Bunani" size="lg">
        <FieldReportForm onClose={()=>setShowSend(false)}/>
      </Modal>
    </div>
  )
}

// ── SETTINGS / USER MANAGEMENT ────────────────────────────────
export function SettingsPage() {
  const { user: currentUser } = useAuthStore()
  const { managedUsers, addManagedUser, updateManagedUser, deleteManagedUser } = useExtraStore()
  const isAdmin = currentUser?.role === 'super_admin'

  const [active, setActive] = React.useState('profile')
  const [showAddUser, setShowAddUser] = React.useState(false)
  const [editUser, setEditUser]       = React.useState<any>(null)
  const [deleteUserId, setDeleteUserId] = React.useState<string|null>(null)
  const [deleting, setDeleting]       = React.useState(false)
  const [newUser, setNewUser]         = React.useState({ fullName:'', email:'', phone:'', role:'farmer', language:'fr' as 'fr'|'sw'|'mashi', password:'', zone:'', status:'active' as 'active'|'suspended'|'pending' })
  const setNU = (k:string,v:string) => setNewUser(p=>({...p,[k]:v}))

  const SECTIONS = [
    {id:'profile',  label:'Mon profil'},
    {id:'farm',     label:'Configuration exploitation'},
    ...(isAdmin ? [{id:'users',label:'Utilisateurs & Rôles'}] : []),
    {id:'languages',label:'Langues'},
    {id:'security', label:'Sécurité'},
  ]

  const ROLES_LIST = [
    {v:'super_admin',       l:'Super Admin / Propriétaire'},
    {v:'director',          l:'Directeur'},
    {v:'livestock_manager', l:'Responsable Élevage'},
    {v:'farm_manager',      l:'Responsable Agricole'},
    {v:'hr_manager',        l:'RH Manager'},
    {v:'accountant',        l:'Comptable'},
    {v:'vet',               l:'Vétérinaire'},
    {v:'shepherd',          l:'Berger'},
    {v:'farmer',            l:'Cultivateur'},
    {v:'visitor',           l:'Visiteur'},
  ]

  const saveNewUser = () => {
    if (!newUser.fullName.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      toast('Nom, email et mot de passe requis', 'error'); return
    }
    addManagedUser({ ...newUser, status: 'active' })
    setShowAddUser(false)
    setNewUser({ fullName:'', email:'', phone:'', role:'farmer', language:'fr', password:'', zone:'', status:'active' })
    toast('Utilisateur créé avec succès')
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.25rem',animation:'fadeUp .4s ease'}}>
      <div><h1 className="page-title">Paramètres</h1><p className="page-sub">Configuration — Concession Mugogo ERP</p></div>
      <div style={{display:'grid',gridTemplateColumns:'200px 1fr',gap:'1.25rem',alignItems:'start'}}>
        <div className="card" style={{padding:'.625rem'}}>
          {SECTIONS.map(s=>(
            <button key={s.id} onClick={()=>setActive(s.id)}
              style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',padding:'7px 9px',borderRadius:'9px',border:'none',cursor:'pointer',marginBottom:'2px',fontSize:'.84rem',transition:'all .12s',fontWeight:active===s.id?700:400,
                      background:active===s.id?'var(--accentS)':'transparent',color:active===s.id?'var(--accent)':'var(--muted)'}}>
              {s.label}
            </button>
          ))}
        </div>

        <div>
          {/* PROFILE */}
          {active==='profile' && (
            <div className="card">
              <h2 className="font-display" style={{fontSize:'1.15rem',fontWeight:700,marginBottom:'1.125rem'}}>Mon profil</h2>
              <div style={{display:'flex',alignItems:'center',gap:'14px',marginBottom:'1.125rem'}}>
                <div style={{width:'56px',height:'56px',borderRadius:'18px',background:'var(--accentS)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'1.4rem',color:'var(--accent)',border:'2px solid var(--b300)'}}>
                  {(currentUser?.fullName||'R').charAt(0)}
                </div>
                <div>
                  <p style={{fontWeight:700}}>{currentUser?.fullName||'Richard Bunani'}</p>
                  <p style={{fontSize:'.82rem',color:'var(--muted)'}}>{currentUser?.role==='super_admin'?'Propriétaire':currentUser?.role}</p>
                </div>
                <span className="badge badge-acc" style={{marginLeft:'auto'}}>
                  {currentUser?.role==='super_admin'?'Propriétaire':currentUser?.role}
                </span>
              </div>
              <div className="form-grid">
                <div><label className="label">Nom complet</label><input className="input" defaultValue={currentUser?.fullName||'Richard Bunani'}/></div>
                <div><label className="label">Email</label><input className="input" defaultValue={currentUser?.email||'richardbunani2013@gmail.com'}/></div>
              </div>
              <div className="form-grid">
                <div><label className="label">Téléphone</label><input className="input" defaultValue="+243 976960983"/></div>
                <div><label className="label">Langue préférée</label><select className="input"><option value="fr">Français</option><option value="sw">Kiswahili</option><option value="mashi">Mashi</option></select></div>
              </div>
              <div className="form-grid">
                <div><label className="label">Nouveau mot de passe</label><input className="input" type="password" placeholder="Laisser vide pour ne pas changer"/></div>
                <div><label className="label">Confirmer mot de passe</label><input className="input" type="password" placeholder="Confirmer..."/></div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:'1rem',paddingTop:'1rem',borderTop:'1px solid var(--borderS)'}}>
                <button className="btn-primary" onClick={()=>toast('Profil enregistré')}>Enregistrer les modifications</button>
              </div>
            </div>
          )}

          {/* USERS */}
          {active==='users' && isAdmin && (
            <div className="card">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem',flexWrap:'wrap',gap:'8px'}}>
                <h2 className="font-display" style={{fontSize:'1.15rem',fontWeight:700}}>Gestion des utilisateurs</h2>
                <button className="btn-primary btn-sm" onClick={()=>setShowAddUser(true)}>
                  <Plus size={13}/> Créer un compte
                </button>
              </div>

              <div className="info-box info-dim" style={{marginBottom:'1rem'}}>
                Seul Richard Bunani peut créer des comptes et assigner des rôles. Les employés n'ont pas accès à cette section.
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                {managedUsers.map((u,i)=>(
                  <div key={u.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',background:'var(--surface2)',borderRadius:'12px',border:'1px solid var(--borderS)',transition:'all .12s',cursor:'pointer'}}
                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--b300)'}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor='var(--borderS)'}}>
                    <div style={{width:'34px',height:'34px',borderRadius:'50%',background:'var(--accentS)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'12px',border:'1.5px solid var(--border)',flexShrink:0}}>{u.fullName.charAt(0)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontWeight:700,fontSize:'.88rem'}}>{u.fullName}</p>
                      <p style={{fontSize:'.76rem',color:'var(--muted)'}}>{u.email} {u.phone?`— ${u.phone}`:''}</p>
                    </div>
                    <span className={`badge ${u.id==='admin-1'?'badge-acc':'badge-dim'}`}>
                      {ROLES_LIST.find(r=>r.v===u.role)?.l||u.role}
                    </span>
                    <span className={`badge ${u.status==='active'?'badge-ok':'badge-warn'}`}>
                      {u.status==='active'?'Actif':u.status==='suspended'?'Suspendu':'En attente'}
                    </span>
                    <div style={{width:'7px',height:'7px',borderRadius:'50%',background:u.status==='active'?'var(--ok)':'var(--warn)',flexShrink:0}}/>
                    <div style={{display:'flex',gap:'3px'}}>
                      {u.id!=='admin-1' && <>
                        <button className="btn-ico edt" title="Modifier" onClick={()=>setEditUser(u)}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button className="btn-ico del" title="Supprimer" onClick={()=>setDeleteUserId(u.id)}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add User Modal */}
              <Modal open={showAddUser} onClose={()=>setShowAddUser(false)} title="Créer un nouveau compte" subtitle="L'utilisateur pourra se connecter avec ces identifiants" size="md">
                <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                  <div className="form-grid">
                    <div><label className="label">Nom complet *</label><input className="input" placeholder="Prénom et nom..." value={newUser.fullName} onChange={e=>setNU('fullName',e.target.value)}/></div>
                    <div><label className="label">Email *</label><input className="input" type="email" placeholder="email@mugogo.cd" value={newUser.email} onChange={e=>setNU('email',e.target.value)}/></div>
                  </div>
                  <div className="form-grid">
                    <div><label className="label">Téléphone</label><input className="input" placeholder="+243 81 xxx xxxx" value={newUser.phone} onChange={e=>setNU('phone',e.target.value)}/></div>
                    <div><label className="label">Zone assignée</label><input className="input" placeholder="Zone A, Zone B..." value={newUser.zone} onChange={e=>setNU('zone',e.target.value)}/></div>
                  </div>
                  <div>
                    <label className="label">Rôle *</label>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5px',marginTop:'4px'}}>
                      {ROLES_LIST.filter(r=>r.v!=='super_admin').map(r=>(
                        <button key={r.v} onClick={()=>setNU('role',r.v)}
                          style={{padding:'8px 10px',borderRadius:'10px',border:`1.5px solid ${newUser.role===r.v?'var(--accent)':'var(--border)'}`,background:newUser.role===r.v?'var(--accentS)':'var(--surface2)',color:newUser.role===r.v?'var(--accent)':'var(--muted)',fontSize:'.78rem',fontWeight:700,cursor:'pointer',textAlign:'left',transition:'all .12s'}}>
                          {r.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-grid">
                    <div>
                      <label className="label">Langue</label>
                      <select className="input" value={newUser.language} onChange={e=>setNU('language',e.target.value)}>
                        <option value="fr">Français</option>
                        <option value="sw">Kiswahili</option>
                        <option value="mashi">Mashi</option>
                      </select>
                    </div>
                    <div><label className="label">Mot de passe *</label><input className="input" type="password" placeholder="Minimum 8 caractères" value={newUser.password} onChange={e=>setNU('password',e.target.value)}/></div>
                  </div>
                  <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',paddingTop:'1rem',borderTop:'1px solid var(--borderS)'}}>
                    <button className="btn-secondary" onClick={()=>setShowAddUser(false)}>Annuler</button>
                    <button className="btn-primary" onClick={saveNewUser}>Créer le compte</button>
                  </div>
                </div>
              </Modal>

              {/* Edit user modal */}
              <Modal open={!!editUser} onClose={()=>setEditUser(null)} title="Modifier l'utilisateur" subtitle={editUser?.fullName} size="md">
                {editUser && (
                  <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                    <div className="form-grid">
                      <div><label className="label">Nom complet</label><input className="input" defaultValue={editUser.fullName} onChange={e=>setEditUser((p:any)=>({...p,fullName:e.target.value}))}/></div>
                      <div><label className="label">Email</label><input className="input" defaultValue={editUser.email} onChange={e=>setEditUser((p:any)=>({...p,email:e.target.value}))}/></div>
                    </div>
                    <div>
                      <label className="label">Rôle</label>
                      <select className="input" value={editUser.role} onChange={e=>setEditUser((p:any)=>({...p,role:e.target.value}))}>
                        {ROLES_LIST.filter(r=>r.v!=='super_admin').map(r=><option key={r.v} value={r.v}>{r.l}</option>)}
                      </select>
                    </div>
                    <div className="form-grid">
                      <div>
                        <label className="label">Statut</label>
                        <select className="input" value={editUser.status} onChange={e=>setEditUser((p:any)=>({...p,status:e.target.value}))}>
                          <option value="active">Actif</option>
                          <option value="suspended">Suspendu</option>
                          <option value="pending">En attente</option>
                        </select>
                      </div>
                      <div><label className="label">Téléphone</label><input className="input" defaultValue={editUser.phone} onChange={e=>setEditUser((p:any)=>({...p,phone:e.target.value}))}/></div>
                    </div>
                    <div style={{display:'flex',gap:'8px',justifyContent:'flex-end',paddingTop:'1rem',borderTop:'1px solid var(--borderS)'}}>
                      <button className="btn-secondary" onClick={()=>setEditUser(null)}>Annuler</button>
                      <button className="btn-primary" onClick={()=>{updateManagedUser(editUser.id,editUser);setEditUser(null);toast('Utilisateur modifié')}}>Enregistrer</button>
                    </div>
                  </div>
                )}
              </Modal>

              <ConfirmDelete open={!!deleteUserId} title="Supprimer cet utilisateur" message="Cet utilisateur ne pourra plus se connecter au système."
                onConfirm={()=>{setDeleting(true);setTimeout(()=>{deleteManagedUser(deleteUserId!);setDeleteUserId(null);setDeleting(false);toast('Utilisateur supprimé','info')},600)}}
                onCancel={()=>setDeleteUserId(null)} loading={deleting}/>
            </div>
          )}

          {/* FARM CONFIG */}
          {active==='farm' && (
            <div className="card">
              <h2 className="font-display" style={{fontSize:'1.15rem',fontWeight:700,marginBottom:'1.125rem'}}>Configuration de l'exploitation</h2>
              <div className="form-grid">
                <div><label className="label">Nom de l'exploitation</label><input className="input" defaultValue="Concession Mugogo"/></div>
                <div><label className="label">Superficie totale</label><input className="input" defaultValue="9 hectares"/></div>
              </div>
              <div className="form-grid">
                <div><label className="label">Propriétaire</label><input className="input" defaultValue="Richard Bunani"/></div>
                <div><label className="label">Téléphone principal</label><input className="input" defaultValue="+243 976960983"/></div>
              </div>
              <div className="form-grid">
                <div><label className="label">Email principal</label><input className="input" defaultValue="richardbunani2013@gmail.com"/></div>
                <div><label className="label">Localisation</label><input className="input" defaultValue="Walungu, Sud-Kivu, RDC"/></div>
              </div>
              <div className="form-grid">
                <div><label className="label">Devise</label><select className="input"><option>USD ($)</option><option>CDF (FC)</option></select></div>
                <div><label className="label">Fuseau horaire</label><select className="input"><option>Africa/Kinshasa (UTC+1)</option><option>Africa/Nairobi (UTC+3)</option></select></div>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:'1rem',paddingTop:'1rem',borderTop:'1px solid var(--borderS)'}}>
                <button className="btn-primary" onClick={()=>toast('Configuration enregistrée')}>Enregistrer</button>
              </div>
            </div>
          )}

          {/* LANGUAGES */}
          {active==='languages' && (
            <div className="card">
              <h2 className="font-display" style={{fontSize:'1.15rem',fontWeight:700,marginBottom:'1rem'}}>Langues du système</h2>
              {[{name:'Français',pct:100,status:'Complète'},{name:'Kiswahili',pct:100,status:'Complète'},{name:'Mashi (Shi)',pct:100,status:'Complète'}].map((l,i)=>(
                <div key={i} style={{padding:'1rem',background:'var(--surface2)',borderRadius:'12px',marginBottom:'8px'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'6px'}}>
                    <div><p style={{fontWeight:700}}>{l.name}</p><p style={{fontSize:'.78rem',color:'var(--muted)'}}>{l.status}</p></div>
                    <span style={{fontWeight:700,color:'var(--accent)'}}>{l.pct}%</span>
                  </div>
                  <div className="progress-track"><div className="progress-fill" style={{width:`${l.pct}%`}}/></div>
                </div>
              ))}
            </div>
          )}

          {/* SECURITY */}
          {active==='security' && (
            <div className="card">
              <h2 className="font-display" style={{fontSize:'1.15rem',fontWeight:700,marginBottom:'1rem'}}>Sécurité</h2>
              <div className="form-grid">
                <div><label className="label">Mot de passe actuel</label><input className="input" type="password" placeholder="••••••••"/></div>
                <div><label className="label">Nouveau mot de passe</label><input className="input" type="password" placeholder="Minimum 8 caractères"/></div>
              </div>
              <div style={{background:'var(--b100)',borderRadius:'12px',padding:'1rem',marginTop:'1rem',border:'1px solid var(--b200)'}}>
                <p style={{fontWeight:700,marginBottom:'8px',fontSize:'.9rem'}}>Informations de sécurité</p>
                {[['Durée de session','8 heures'],['Tentatives max','5 avant blocage'],['Blocage','30 secondes'],['Journal d\'audit','Activé — immuable']].map(([k,v])=>(
                  <div key={k} className="det-row"><span className="det-k">{k}</span><span className="det-v">{v}</span></div>
                ))}
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',marginTop:'1rem',paddingTop:'1rem',borderTop:'1px solid var(--borderS)'}}>
                <button className="btn-primary" onClick={()=>toast('Sécurité mise à jour')}>Mettre à jour</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export function AuditPage() {
  const LOGS=[
    {user:'Richard Bunani',action:'Creer',module:'Elevage',detail:'Animal BOV-2025-001 enregistre',time:'2025-01-07 14:32',ip:'192.168.1.10'},
    {user:'Pierre Lwambo',action:'Modifier',module:'Stock',detail:'Ivermectine: quantite 12 vers 2 flacons',time:'2025-01-07 11:15',ip:'192.168.1.14'},
    {user:'Marie Kahindo',action:'Creer',module:'Cultures',detail:'Culture Mais Zone D ajoutee',time:'2025-01-06 09:40',ip:'192.168.1.22'},
    {user:'Richard Bunani',action:'Connexion',module:'Systeme',detail:'Connexion reussie depuis Chrome Windows',time:'2025-01-06 07:58',ip:'192.168.1.10'},
    {user:'Dr. David Shabani',action:'Modifier',module:'Sante',detail:'Traitement anti-gale CAP-2022-001 enregistre',time:'2025-01-05 16:20',ip:'192.168.1.18'},
    {user:'Marie Kahindo',action:'Modifier',module:'Cultures',detail:'Score sante CRP-002: 65 vers 72',time:'2025-01-05 10:00',ip:'192.168.1.22'},
    {user:'Richard Bunani',action:'Exporter',module:'Finance',detail:'Export CSV transactions Decembre 2024',time:'2025-01-04 15:30',ip:'192.168.1.10'},
  ]
  const AC_CLS: Record<string,string> = {'Creer':'badge-ok','Modifier':'badge-warn','Supprimer':'badge-err','Connexion':'badge-dim','Exporter':'badge-dark'}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.25rem',animation:'fadeUp .4s ease'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'.75rem'}}>
        <div><h1 className="page-title">Audit & Historique</h1><p className="page-sub">Journal immuable — tracabilite complete de toutes les actions</p></div>
        <button className="btn-secondary btn-sm"><Download size={13}/> Export audit</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'.75rem'}}>
        <StatCard label="Actions aujourd'hui" value="7" delay="d1"/>
        <StatCard label="Utilisateurs actifs" value="4" delay="d2" color="var(--b700)"/>
        <StatCard label="Modifications" value="3" delay="d3" color="var(--warn)"/>
        <StatCard label="Creations" value="2" delay="d4" color="var(--ok)"/>
      </div>
      <div className="info-box info-warn">
        Journal immuable — aucune entree ne peut etre modifiee ou supprimee, meme par l'administrateur.
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Utilisateur</th><th>Action</th><th>Module</th><th>Detail</th><th>Horodatage</th><th>Adresse IP</th></tr></thead>
          <tbody>
            {LOGS.map((log,i)=>(
              <tr key={i} className="anim-fade-in" style={{animationDelay:`${i*.04}s`}}>
                <td>
                  <div style={{display:'flex',alignItems:'center',gap:'7px'}}>
                    <div style={{width:'26px',height:'26px',borderRadius:'50%',background:'var(--accentS)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'.76rem',flexShrink:0}}>{log.user.charAt(0)}</div>
                    <span style={{fontWeight:600,fontSize:'.85rem'}}>{log.user}</span>
                  </div>
                </td>
                <td><span className={clsx('badge',AC_CLS[log.action]||'badge-dim')}>{log.action}</span></td>
                <td><span className="badge badge-dim">{log.module}</span></td>
                <td style={{fontSize:'.82rem',color:'var(--muted)',maxWidth:'260px'}}>{log.detail}</td>
                <td style={{fontFamily:'monospace',fontSize:'.78rem',color:'var(--muted)'}}>{log.time}</td>
                <td style={{fontFamily:'monospace',fontSize:'.78rem',color:'var(--light)'}}>{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
