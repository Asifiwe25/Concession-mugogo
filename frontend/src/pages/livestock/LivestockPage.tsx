import React, { useState, useMemo } from 'react'
import { PageReport } from '@/components/ui/PageReport'
import { useTranslation } from 'react-i18next'
import { Plus, Download, Search, X, Eye, Edit, Trash2, Activity, Syringe, Scale, Calendar } from 'lucide-react'
import { useStore, Animal } from '@/store/useStore'
import { ConfirmDelete, Modal, StepWizard, toast } from '@/components/ui/crud'
import { clsx } from 'clsx'

const SPECIES = [
  {v:'bovine',  e:'🐄',l:'Bovin',    sub:['Vache laitière','Taureau','Veau','Génisse','Bouvillon'],   avg:350},
  {v:'goat',    e:'🐐',l:'Caprin',   sub:['Chèvre laitière','Bouc','Chevreau'],                       avg:35},
  {v:'sheep',   e:'🐑',l:'Ovin',     sub:['Brebis','Bélier','Agneau'],                                avg:45},
  {v:'pig',     e:'🐷',l:'Porcin',   sub:['Truie','Verrat','Porcelet','Porc charcutier'],             avg:80},
  {v:'poultry', e:'🐔',l:'Volaille', sub:['Pondeuse','Coq','Poussin','Poulet de chair'],              avg:2},
  {v:'duck',    e:'🦆',l:'Canard',   sub:['Cane','Canard','Canetons'],                                avg:3},
  {v:'rabbit',  e:'🐇',l:'Cuniculin',sub:['Lapine','Lapin','Lapereaux'],                              avg:4},
  {v:'equine',  e:'🐴',l:'Équin',    sub:['Jument','Étalon','Poulain'],                               avg:400},
  {v:'fish',    e:'🐟',l:'Piscicole',sub:['Tilapia','Carpe','Silure'],                               avg:1},
]

const BREEDS: Record<string,string[]> = {
  bovine:['Ankole','Frisonne Holstein','Jersey','Sahiwal','Brahman','Simmental','Charolais','Métis','Locale'],
  goat:['Alpine','Boer','Nubienne','Toggenburg','Saanen','Angora','Locale'],
  sheep:['Mérinos','Dorper','Suffolk','East Friesian','Mouton des Prairies','Locale'],
  pig:['Large White','Duroc','Landrace','Pietrain','Hampshire','Locale'],
  poultry:['Cobb 500','Ross 308','ISA Brown','Lohmann','Hubbard','Poulet Local'],
}

const HEALTH: Record<string,{label:string;color:string;bg:string;dot:string;icon:string}> = {
  healthy:    {label:'Sain',          color:'var(--ok)',  bg:'var(--okBg)', dot:'#22c55e',icon:'✅'},
  sick:       {label:'Malade',        color:'var(--err)',    bg:'var(--errBg)',   dot:'#ef4444',icon:'🔴'},
  quarantine: {label:'Quarantaine',   color:'var(--warn)',  bg:'var(--warnBg)',  dot:'#f59e0b',icon:'🛡️'},
  treatment:  {label:'En traitement', color:'var(--b700)',   bg:'var(--b100)',  dot:'#3b82f6',icon:'💊'},
  pregnant:   {label:'Gestante',      color:'#ec4899',       bg:'#fdf2f8',         dot:'#ec4899',icon:'🤰'},
  deceased:   {label:'Décédé',        color:'var(--text-muted)',bg:'var(--surface2)',dot:'#888',icon:'💀'},
}

const VACCINES = ['FMD (Fièvre aphteuse)','Charbon bactérien','PPR (Petits ruminants)','Newcastle','Gumboro','Marek','CBPP','LSD (Dermatose nodulaire)','Trypanosomiase','Brucellose']

interface AnimalExtended {
  id:string; systemId:string; species:string; subCategory:string; breed:string; sex:string
  localName:string; tagNumber:string; birthDate:string; estimatedAge:string
  color:string; weight:number; weightHistory:Array<{date:string;weight:number}>
  zone:string; responsible:string; origin:string; supplierName:string
  purchaseDate:string; purchasePrice:number
  healthStatus:string; quarantine:boolean; vetNotes:string
  motherTag:string; fatherTag:string; production:string; lastVet:string
  vaccinations:Array<{vaccine:string;date:string;nextDate:string;by:string;batch:string}>
  healthRecords:Array<{date:string;diagnosis:string;treatment:string;by:string;resolved:boolean}>
  reproductions:Array<{type:string;date:string;partner?:string;expectedBirth?:string;result:string}>
  feedingPlan:string; dailyFeed:number; feedUnit:string
  insuranceNumber:string; estimatedValue:number; saleStatus:string
  photo:string; createdAt:string; updatedAt:string; microchip:string
  entryDate:string; exitDate:string; exitReason:string
}

function Ring({pct,size=40,stroke=3,color='var(--accent)'}:{pct:number;size?:number;stroke?:number;color?:string}) {
  const r=(size-stroke*2)/2, circ=2*Math.PI*r, offset=circ-(pct/100)*circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:'rotate(-90deg)'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{transition:'stroke-dashoffset .8s ease'}}/>
    </svg>
  )
}

// ── Animal Detail Panel ──────────────────────────────────────
function AnimalDetail({animal,onClose,onEdit}:{animal:AnimalExtended;onClose:()=>void;onEdit:()=>void}) {
  const [tab,setTab]=useState('profile')
  const hc=HEALTH[animal.healthStatus]||HEALTH.healthy
  const sp=SPECIES.find(s=>s.v===animal.species)
  const age=animal.birthDate?Math.floor((Date.now()-new Date(animal.birthDate).getTime())/(365.25*86400000)):null

  return (
    <div className="fixed inset-0 z-50 flex" style={{background:'rgba(46,31,16,.5)',backdropFilter:'blur(12px)'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="ml-auto w-full bg-white h-full overflow-y-auto scrollbar-hide"
        style={{maxWidth:'720px',animation:'slideIn .3s ease',boxShadow:'-4px 0 40px rgba(46,31,16,.15)'}}>

        {/* Hero */}
        <div style={{background:`linear-gradient(135deg,${hc.bg},white)`,padding:'1.5rem',borderBottom:'1px solid var(--borderS)'}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'1rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
              <div style={{width:'72px',height:'72px',borderRadius:'22px',background:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3rem',boxShadow:'0 4px 20px rgba(46,31,16,.1)'}}>
                {sp?.e||'🐾'}
              </div>
              <div>
                <h2 style={{fontFamily:'Georgia,serif',fontSize:'1.6rem',fontWeight:700}}>{animal.localName||animal.systemId}</h2>
                <p style={{fontFamily:'monospace',fontSize:'0.82rem',color:'var(--text-muted)'}}>{animal.systemId}</p>
                {animal.tagNumber&&<p style={{fontSize:'0.78rem',color:'var(--text-muted)',marginTop:'2px'}}>🏷️ Boucle: {animal.tagNumber}</p>}
              </div>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <button onClick={onEdit} style={{padding:'8px 14px',borderRadius:'10px',background:'var(--accent)',color:'white',border:'none',fontSize:'0.8rem',fontWeight:600,cursor:'pointer'}}>✏️ Modifier</button>
              <button onClick={onClose} style={{padding:'8px',borderRadius:'10px',background:'transparent',border:'1px solid var(--border)',cursor:'pointer'}}>✕</button>
            </div>
          </div>
          {/* Badges */}
          <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'1rem'}}>
            <span style={{background:hc.bg,color:hc.color,padding:'4px 10px',borderRadius:'99px',fontSize:'0.72rem',fontWeight:700,border:`1px solid ${hc.dot}33`}}>{hc.icon} {hc.label}</span>
            <span style={{background:'var(--surface2)',color:'var(--text-muted)',padding:'4px 10px',borderRadius:'99px',fontSize:'0.72rem',fontWeight:600}}>📍 {animal.zone||'—'}</span>
            <span style={{background:'var(--surface2)',color:'var(--text-muted)',padding:'4px 10px',borderRadius:'99px',fontSize:'0.72rem',fontWeight:600}}>{animal.sex==='male'?'♂ Mâle':'♀ Femelle'}</span>
            {animal.quarantine&&<span style={{background:'var(--warnBg)',color:'var(--warn)',padding:'4px 10px',borderRadius:'99px',fontSize:'0.72rem',fontWeight:700}}>🛡️ Quarantaine</span>}
            {age!==null&&<span style={{background:'var(--b100)',color:'var(--b700)',padding:'4px 10px',borderRadius:'99px',fontSize:'0.72rem',fontWeight:600}}>{age} ans</span>}
          </div>
          {/* Quick stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px'}}>
            {[
              {l:'Poids',v:animal.weight?`${animal.weight}kg`:'—',icon:'⚖️'},
              {l:'Production',v:animal.production||'—',icon:'🥛'},
              {l:'Valeur est.',v:animal.estimatedValue?`$${animal.estimatedValue}`:'—',icon:'💰'},
              {l:'Dernier vétérinaire',v:animal.lastVet||'—',icon:'🩺'},
            ].map((s,i)=>(
              <div key={i} style={{background:'white',borderRadius:'12px',padding:'10px',border:'1px solid var(--borderS)',textAlign:'center'}}>
                <div style={{fontSize:'1.1rem',marginBottom:'3px'}}>{s.icon}</div>
                <div style={{fontFamily:'Georgia,serif',fontSize:'0.95rem',fontWeight:700}}>{s.v}</div>
                <div style={{fontSize:'0.6rem',color:'var(--text-muted)',marginTop:'2px'}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',borderBottom:'1px solid var(--border)',overflowX:'auto',background:'white',flexShrink:0}}>
          {[['profile','👤 Profil'],['health','🩺 Santé'],['vaccins','💉 Vaccinations'],['reproduction','🫀 Reproduction'],['weight','⚖️ Poids'],['economics','💰 Économie']].map(([id,l])=>(
            <button key={id} onClick={()=>setTab(id)}
              style={{padding:'10px 14px',fontSize:'0.78rem',fontWeight:tab===id?700:400,
                      color:tab===id?'var(--accent)':'var(--text-muted)',
                      borderBottom:tab===id?'2px solid var(--accent)':'2px solid transparent',
                      background:'transparent',border:'none',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
              {l}
            </button>
          ))}
        </div>

        <div style={{padding:'1.25rem'}}>

          {tab==='profile'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div style={{background:'var(--surface2)',borderRadius:'16px',padding:'1rem'}}>
                <p style={{fontSize:'0.7rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'0.75rem'}}>IDENTITÉ</p>
                {[
                  ['Espèce',`${sp?.e} ${sp?.l||animal.species}`],['Sous-catégorie',animal.subCategory||'—'],
                  ['Race',animal.breed||'—'],['Sexe',animal.sex==='male'?'♂ Mâle':'♀ Femelle'],
                  ['Date de naissance',animal.birthDate||'—'],['Âge estimé',age!==null?`${age} ans`:(animal.estimatedAge||'—')],
                  ['Couleur / Marques',animal.color||'—'],['Microchip',animal.microchip||'—'],
                  ['N° boucle / Tag',animal.tagNumber||'—'],
                ].map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--borderS)'}}>
                    <span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{k}</span>
                    <span style={{fontSize:'0.78rem',fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:'var(--surface2)',borderRadius:'16px',padding:'1rem'}}>
                <p style={{fontSize:'0.7rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'0.75rem'}}>GESTION & LOCALISATION</p>
                {[
                  ['Zone',animal.zone||'—'],['Responsable',animal.responsible||'—'],
                  ['Date entrée ferme',animal.entryDate||animal.purchaseDate||'—'],
                  ['Origine',animal.origin],
                  ...(animal.origin==='purchased'?[['Fournisseur',animal.supplierName||'—'],['Date achat',animal.purchaseDate||'—'],['Prix achat',animal.purchasePrice?`$${animal.purchasePrice}`:'—']] as [string,string][]:[] as [string,string][]),
                  ...(animal.origin==='born_on_farm'?[['Tag mère',animal.motherTag||'—'],['Tag père',animal.fatherTag||'—']] as [string,string][]:[] as [string,string][]),
                ].map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--borderS)'}}>
                    <span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{k}</span>
                    <span style={{fontSize:'0.78rem',fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{background:'var(--surface2)',borderRadius:'16px',padding:'1rem'}}>
                <p style={{fontSize:'0.7rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'0.75rem'}}>ALIMENTATION</p>
                {[
                  ['Plan alimentaire',animal.feedingPlan||'Standard'],
                  ['Ration journalière',animal.dailyFeed?`${animal.dailyFeed} ${animal.feedUnit||'kg'}`:'—'],
                ].map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--borderS)'}}>
                    <span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{k}</span>
                    <span style={{fontSize:'0.78rem',fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='health'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div style={{background:hc.bg,borderRadius:'16px',padding:'1rem',border:`1px solid ${hc.dot}33`}}>
                <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  <div style={{fontSize:'2.5rem'}}>{hc.icon}</div>
                  <div>
                    <p style={{fontFamily:'Georgia,serif',fontSize:'1.25rem',fontWeight:700,color:hc.color}}>{hc.label}</p>
                    <p style={{fontSize:'0.82rem',color:'var(--text-muted)',marginTop:'2px'}}>Dernier vétérinaire: {animal.lastVet||'—'}</p>
                  </div>
                </div>
              </div>
              {animal.vetNotes&&<div style={{background:'var(--b100)',borderRadius:'14px',padding:'1rem',borderLeft:'3px solid var(--b700)'}}>
                <p style={{fontSize:'0.72rem',fontWeight:700,color:'var(--b700)',marginBottom:'4px'}}>📋 Notes vétérinaires</p>
                <p style={{fontSize:'0.82rem'}}>{animal.vetNotes}</p>
              </div>}
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'4px'}}>
                  <p style={{fontSize:'0.72rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em'}}>HISTORIQUE SANTÉ</p>
                  <button style={{fontSize:'0.72rem',padding:'4px 10px',borderRadius:'8px',background:'var(--accent)',color:'white',border:'none',cursor:'pointer'}}>+ Ajouter</button>
                </div>
                {(animal.healthRecords||[]).length===0?(
                  <div style={{textAlign:'center',padding:'1.5rem',background:'var(--surface2)',borderRadius:'14px',color:'var(--text-muted)'}}>
                    <p style={{fontSize:'1.5rem',marginBottom:'6px'}}>📋</p>
                    <p style={{fontSize:'0.82rem',fontWeight:500}}>Aucun dossier de santé</p>
                  </div>
                ):(animal.healthRecords||[]).map((r,i)=>(
                  <div key={i} style={{background:'var(--surface2)',borderRadius:'14px',padding:'10px 12px',border:'1px solid var(--borderS)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                      <span style={{fontSize:'0.82rem',fontWeight:700}}>{r.diagnosis}</span>
                      <span style={{fontSize:'0.7rem',padding:'2px 7px',borderRadius:'99px',background:r.resolved?'var(--okBg)':'var(--errBg)',color:r.resolved?'var(--ok)':'var(--err)',fontWeight:600}}>{r.resolved?'✅ Résolu':'🔴 En cours'}</span>
                    </div>
                    <p style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{r.date} · Traitement: {r.treatment} · Par {r.by}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='vaccins'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <p style={{fontSize:'0.72rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em'}}>CARNET DE VACCINATION</p>
                <button style={{fontSize:'0.72rem',padding:'4px 10px',borderRadius:'8px',background:'var(--accent)',color:'white',border:'none',cursor:'pointer'}}>+ Ajouter vaccin</button>
              </div>
              {(animal.vaccinations||[]).length===0?(
                <div style={{textAlign:'center',padding:'2rem',background:'var(--surface2)',borderRadius:'14px',color:'var(--text-muted)'}}>
                  <p style={{fontSize:'2rem',marginBottom:'8px'}}>💉</p>
                  <p style={{fontWeight:500,fontSize:'0.85rem'}}>Aucune vaccination enregistrée</p>
                </div>
              ):(animal.vaccinations||[]).map((v,i)=>{
                const nextDate=v.nextDate?new Date(v.nextDate):null
                const overdue=nextDate&&nextDate<new Date()
                return (
                  <div key={i} style={{background:'var(--surface2)',borderRadius:'14px',padding:'12px',border:'1px solid var(--borderS)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                      <span style={{fontSize:'0.85rem',fontWeight:700}}>{v.vaccine}</span>
                      <span style={{fontSize:'0.7rem',fontWeight:700,padding:'2px 8px',borderRadius:'99px',background:overdue?'var(--errBg)':'var(--okBg)',color:overdue?'var(--err)':'var(--ok)'}}>{overdue?'⚠️ Rappel dû':'✅ À jour'}</span>
                    </div>
                    <p style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>Fait le: {v.date} · Lot: {v.batch||'—'} · Par: {v.by||'—'}</p>
                    {v.nextDate&&<p style={{fontSize:'0.72rem',color:overdue?'var(--err)':'var(--text-muted)',marginTop:'2px'}}>Prochain rappel: {v.nextDate}</p>}
                  </div>
                )
              })}
              {/* Vaccine schedule */}
              <div style={{background:'var(--b100)',borderRadius:'14px',padding:'1rem',border:'1px solid var(--b700)22'}}>
                <p style={{fontSize:'0.72rem',fontWeight:700,color:'var(--b700)',marginBottom:'8px'}}>📋 VACCINS RECOMMANDÉS — {SPECIES.find(s=>s.v===animal.species)?.l||animal.species}</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                  {VACCINES.slice(0,5).map(vac=>(
                    <span key={vac} style={{fontSize:'0.7rem',padding:'3px 8px',borderRadius:'99px',background:'white',color:'var(--b700)',border:'1px solid var(--b700)22',fontWeight:500}}>{vac}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab==='reproduction'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <p style={{fontSize:'0.72rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em'}}>HISTORIQUE REPRODUCTIF</p>
                <button style={{fontSize:'0.72rem',padding:'4px 10px',borderRadius:'8px',background:'var(--accent)',color:'white',border:'none',cursor:'pointer'}}>+ Ajouter</button>
              </div>
              {(animal.reproductions||[]).length===0?(
                <div style={{textAlign:'center',padding:'2rem',background:'var(--surface2)',borderRadius:'14px',color:'var(--text-muted)'}}>
                  <p style={{fontSize:'2rem',marginBottom:'8px'}}>🫀</p>
                  <p style={{fontWeight:500,fontSize:'0.85rem'}}>Aucun événement reproductif</p>
                </div>
              ):(animal.reproductions||[]).map((r,i)=>(
                <div key={i} style={{background:'var(--surface2)',borderRadius:'14px',padding:'12px',border:'1px solid var(--borderS)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                    <span style={{fontSize:'0.85rem',fontWeight:700}}>{r.type}</span>
                    <span style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{r.date}</span>
                  </div>
                  {r.partner&&<p style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>Partenaire: {r.partner}</p>}
                  {r.expectedBirth&&<p style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>Naissance prévue: {r.expectedBirth}</p>}
                  <p style={{fontSize:'0.72rem',marginTop:'2px',fontWeight:600}}>{r.result}</p>
                </div>
              ))}
            </div>
          )}

          {tab==='weight'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div>
                  <p style={{fontFamily:'Georgia,serif',fontSize:'1.5rem',fontWeight:700}}>{animal.weight} kg</p>
                  <p style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>Poids actuel</p>
                </div>
                <button style={{fontSize:'0.78rem',padding:'8px 14px',borderRadius:'10px',background:'var(--accent)',color:'white',border:'none',cursor:'pointer'}}>+ Pesée</button>
              </div>
              {/* Weight chart bars */}
              <div style={{background:'var(--surface2)',borderRadius:'14px',padding:'1rem'}}>
                <p style={{fontSize:'0.7rem',fontWeight:700,color:'var(--text-muted)',marginBottom:'0.75rem'}}>HISTORIQUE PESÉES</p>
                {(animal.weightHistory&&animal.weightHistory.length>0)?
                  animal.weightHistory.slice(-6).map((w,i)=>{
                    const maxW=Math.max(...animal.weightHistory.map(x=>x.weight))
                    return (
                      <div key={i} style={{marginBottom:'8px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'3px'}}>
                          <span style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{w.date}</span>
                          <span style={{fontSize:'0.72rem',fontWeight:700}}>{w.weight} kg</span>
                        </div>
                        <div style={{height:'6px',background:'var(--beige-100)',borderRadius:'99px',overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${(w.weight/maxW)*100}%`,background:'var(--accent)',borderRadius:'99px',transition:'width .6s ease'}}/>
                        </div>
                      </div>
                    )
                  }):(
                    <p style={{fontSize:'0.82rem',color:'var(--text-muted)',textAlign:'center',padding:'1rem'}}>Aucune pesée enregistrée</p>
                  )
                }
              </div>
              <div style={{background:'var(--surface2)',borderRadius:'14px',padding:'1rem'}}>
                <p style={{fontSize:'0.7rem',fontWeight:700,color:'var(--text-muted)',marginBottom:'8px'}}>OBJECTIFS DE CROISSANCE</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
                  {[
                    {l:'Poids idéal',v:`${SPECIES.find(s=>s.v===animal.species)?.avg||0*1.2} kg`},
                    {l:'GMQ moyen',v:'0.8 kg/j'},
                    {l:'Poids vif est.',v:`${Math.round(animal.weight*0.6)} kg`},
                  ].map((s,i)=>(
                    <div key={i} style={{background:'white',borderRadius:'10px',padding:'8px',textAlign:'center',border:'1px solid var(--borderS)'}}>
                      <p style={{fontFamily:'Georgia,serif',fontSize:'0.95rem',fontWeight:700}}>{s.v}</p>
                      <p style={{fontSize:'0.62rem',color:'var(--text-muted)',marginTop:'2px'}}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab==='economics'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
                {[
                  {l:'Valeur actuelle',v:animal.estimatedValue?`$${animal.estimatedValue}`:animal.purchasePrice?`$${Math.round(animal.purchasePrice*1.3)}`:'—',icon:'💰',color:'var(--accent)'},
                  {l:'Prix d\'achat',v:animal.purchasePrice?`$${animal.purchasePrice}`:'Naissance',icon:'🛒',color:'var(--b700)'},
                  {l:'Plus-value',v:animal.purchasePrice&&animal.estimatedValue?`$${animal.estimatedValue-animal.purchasePrice}`:'—',icon:'📈',color:'var(--ok)'},
                ].map((s,i)=>(
                  <div key={i} style={{background:'var(--surface2)',borderRadius:'14px',padding:'12px',textAlign:'center',border:'1px solid var(--borderS)'}}>
                    <div style={{fontSize:'1.5rem',marginBottom:'4px'}}>{s.icon}</div>
                    <div style={{fontFamily:'Georgia,serif',fontSize:'1.1rem',fontWeight:700,color:s.color}}>{s.v}</div>
                    <div style={{fontSize:'0.62rem',color:'var(--text-muted)',marginTop:'3px'}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{background:'var(--surface2)',borderRadius:'14px',padding:'1rem'}}>
                <p style={{fontSize:'0.72rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'8px'}}>STATUT DE VENTE</p>
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  {['non_vendu','a_vendre','vendu','reserve'].map(st=>(
                    <button key={st} style={{padding:'6px 12px',borderRadius:'99px',border:'1px solid var(--border)',background:animal.saleStatus===st?'var(--accent)':'white',color:animal.saleStatus===st?'white':'var(--text-muted)',fontSize:'0.72rem',fontWeight:600,cursor:'pointer'}}>
                      {st==='non_vendu'?'Non à vendre':st==='a_vendre'?'À vendre':st==='vendu'?'Vendu':'Réservé'}
                    </button>
                  ))}
                </div>
              </div>
              {animal.insuranceNumber&&<div style={{background:'var(--okBg)',borderRadius:'14px',padding:'1rem',borderLeft:'3px solid var(--ok)'}}>
                <p style={{fontSize:'0.78rem',fontWeight:600,color:'var(--ok)'}}>🔒 Assurance: {animal.insuranceNumber}</p>
              </div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Animal Form (multi-step) ─────────────────────────────────
function AnimalForm({initial,onSave,onCancel,editMode=false}:{initial:any;onSave:(d:any)=>void;onCancel:()=>void;editMode?:boolean}) {
  const [step,setStep]=useState(0)
  const [form,setForm]=useState<any>({
    species:'',subCategory:'',breed:'',sex:'',localName:'',tagNumber:'',microchip:'',
    birthDate:'',estimatedAge:'',color:'',weight:'',entryDate:'',
    zone:'',responsible:'',origin:'purchased',supplierName:'',purchaseDate:'',purchasePrice:'',
    motherTag:'',fatherTag:'',
    healthStatus:'healthy',quarantine:false,vetNotes:'',
    production:'',feedingPlan:'Standard',dailyFeed:'',feedUnit:'kg',
    estimatedValue:'',insuranceNumber:'',saleStatus:'non_vendu',...initial
  })
  const set=(k:string,v:any)=>setForm((p:any)=>({...p,[k]:v}))
  const STEPS=['🐾 Espèce','🏷️ Identité','📦 Origine','🏠 Gestion','🩺 Santé & Prod.']

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'4px',marginBottom:'1.25rem',overflowX:'auto',padding:'4px 0'}}>
        {STEPS.map((s,i)=>(
          <React.Fragment key={i}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flexShrink:0}}>
              <div style={{width:'28px',height:'28px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',fontWeight:700,transition:'all .2s',background:i<step?'var(--ok)':i===step?'var(--accent)':'var(--beige-100)',color:i<=step?'white':'var(--text-light)'}}>{i<step?'✓':i+1}</div>
              <span style={{fontSize:'0.6rem',color:i===step?'var(--accent)':i<step?'var(--ok)':'var(--text-light)',fontWeight:i===step?700:400,maxWidth:'50px',textAlign:'center',lineHeight:'1.2'}}>{s.split(' ').slice(1).join(' ')}</span>
            </div>
            {i<STEPS.length-1&&<div style={{height:'2px',width:'16px',background:i<step?'var(--ok)':'var(--beige-200)',borderRadius:'99px',marginBottom:'14px',flexShrink:0}}/>}
          </React.Fragment>
        ))}
      </div>

      <div style={{minHeight:'290px'}}>
        {step===0&&(
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div>
              <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'8px'}}>Espèce *</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
                {SPECIES.map(sp=>(
                  <button key={sp.v} onClick={()=>{set('species',sp.v);set('subCategory','')}}
                    style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',padding:'12px 8px',borderRadius:'14px',border:`1.5px solid`,cursor:'pointer',transition:'all .15s',
                            borderColor:form.species===sp.v?'var(--accent)':'var(--borderS)',
                            background:form.species===sp.v?'var(--accentS)':'var(--surface2)',
                            color:form.species===sp.v?'var(--accent)':'var(--text-muted)'}}>
                    <span style={{fontSize:'2rem'}}>{sp.e}</span>
                    <span style={{fontSize:'0.75rem',fontWeight:700}}>{sp.l}</span>
                  </button>
                ))}
              </div>
            </div>
            {form.species&&(
              <>
                <div>
                  <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'6px'}}>Sous-catégorie</label>
                  <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                    {(SPECIES.find(s=>s.v===form.species)?.sub||[]).map(sub=>(
                      <button key={sub} onClick={()=>set('subCategory',sub)}
                        style={{padding:'6px 12px',borderRadius:'99px',border:'1.5px solid',cursor:'pointer',fontSize:'0.78rem',fontWeight:600,
                                borderColor:form.subCategory===sub?'var(--accent)':'var(--border)',
                                background:form.subCategory===sub?'var(--accentS)':'white',
                                color:form.subCategory===sub?'var(--accent)':'var(--text-muted)'}}>
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                  <div>
                    <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Race</label>
                    <select style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}}
                      value={form.breed} onChange={e=>set('breed',e.target.value)}>
                      <option value="">Sélectionner...</option>
                      {(BREEDS[form.species]||['Locale']).map(b=><option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Sexe *</label>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'6px'}}>
                      {[['male','♂ Mâle'],['female','♀ Femelle'],['unknown','? Inconnu']].map(([v,l])=>(
                        <button key={v} onClick={()=>set('sex',v)}
                          style={{padding:'8px',borderRadius:'10px',border:'1.5px solid',cursor:'pointer',fontSize:'0.75rem',fontWeight:700,
                                  borderColor:form.sex===v?'var(--accent)':'var(--borderS)',
                                  background:form.sex===v?'var(--accentS)':'var(--surface2)',
                                  color:form.sex===v?'var(--accent)':'var(--text-muted)'}}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {step===1&&(
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Nom local</label><input placeholder="ex: Mapendo, Kahindo..." style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.localName} onChange={e=>set('localName',e.target.value)}/></div>
              <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>N° Boucle / Tag</label><input placeholder="RCD-001..." style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.tagNumber} onChange={e=>set('tagNumber',e.target.value)}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Date de naissance</label><input type="date" style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.birthDate} onChange={e=>set('birthDate',e.target.value)}/></div>
              <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Âge estimé (si inconnu)</label><input placeholder="ex: 2 ans, 8 mois..." style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.estimatedAge} onChange={e=>set('estimatedAge',e.target.value)}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Couleur / Marques distinctives</label><input placeholder="Robe fauve, tâche blanche..." style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.color} onChange={e=>set('color',e.target.value)}/></div>
              <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Poids actuel (kg)</label><input type="number" placeholder="0" style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.weight} onChange={e=>set('weight',e.target.value)}/></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Microchip RFID</label><input placeholder="Optionnel..." style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.microchip} onChange={e=>set('microchip',e.target.value)}/></div>
              <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Date d'entrée à la ferme</label><input type="date" style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.entryDate} onChange={e=>set('entryDate',e.target.value)}/></div>
            </div>
          </div>
        )}

        {step===2&&(
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div>
              <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'8px'}}>Origine *</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                {[['born_on_farm','🏠 Né sur la ferme'],['purchased','🛒 Acheté/Marché'],['donated','🎁 Don/Subvention'],['transferred','🔄 Transfert interne']].map(([v,l])=>(
                  <button key={v} onClick={()=>set('origin',v)}
                    style={{padding:'12px',borderRadius:'12px',border:`1.5px solid`,cursor:'pointer',textAlign:'left',fontSize:'0.82rem',fontWeight:700,
                            borderColor:form.origin===v?'var(--accent)':'var(--borderS)',
                            background:form.origin===v?'var(--accentS)':'var(--surface2)',
                            color:form.origin===v?'var(--accent)':'var(--text-muted)'}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            {form.origin==='purchased'&&(
              <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                  <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Fournisseur / Vendeur</label><input placeholder="Nom du vendeur ou marché..." style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.supplierName} onChange={e=>set('supplierName',e.target.value)}/></div>
                  <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Date d'achat</label><input type="date" style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.purchaseDate} onChange={e=>set('purchaseDate',e.target.value)}/></div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                  <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Prix d'achat (USD)</label><input type="number" placeholder="0" style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.purchasePrice} onChange={e=>set('purchasePrice',e.target.value)}/></div>
                  <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Valeur actuelle estimée ($)</label><input type="number" placeholder="0" style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.estimatedValue} onChange={e=>set('estimatedValue',e.target.value)}/></div>
                </div>
              </div>
            )}
            {form.origin==='born_on_farm'&&(
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Tag de la mère</label><input placeholder="BOV-2020-001..." style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.motherTag} onChange={e=>set('motherTag',e.target.value)}/></div>
                <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Tag du père (optionnel)</label><input placeholder="BOV-2018-002..." style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.fatherTag} onChange={e=>set('fatherTag',e.target.value)}/></div>
              </div>
            )}
          </div>
        )}

        {step===3&&(
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div>
                <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Zone / Pâturage *</label>
                <select style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.zone} onChange={e=>set('zone',e.target.value)}>
                  <option value="">Choisir zone...</option>
                  {['Zone A — Pâturage Nord','Zone B — Pâturage Est','Zone D — Polyvalente','Poulailler Central','Zone mixte','Enclos quarantaine'].map(z=><option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Responsable</label>
                <select style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.responsible} onChange={e=>set('responsible',e.target.value)}>
                  <option value="">Choisir...</option>
                  {['Richard Bunani','Jean-Baptiste Mutombo','Pierre Lwambo','Emmanuel Kasereka','David Shabani','Christine Mapendo'].map(n=><option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Plan d'alimentation</label>
              <select style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.feedingPlan} onChange={e=>set('feedingPlan',e.target.value)}>
                {['Standard','Haute production laitière','Prise de masse','Croissance juvénile','Finition avant vente','Gestation/Lactation','Personalisé'].map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Ration journalière</label><input type="number" placeholder="0" style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.dailyFeed} onChange={e=>set('dailyFeed',e.target.value)}/></div>
              <div>
                <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Unité</label>
                <select style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.feedUnit} onChange={e=>set('feedUnit',e.target.value)}>
                  {['kg','g','litres','seaux','portions'].map(u=><option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Production journalière estimée</label><input placeholder="ex: 12L/j lait, 1 œuf/j..." style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}} value={form.production} onChange={e=>set('production',e.target.value)}/></div>
          </div>
        )}

        {step===4&&(
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div>
              <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'8px'}}>État de santé initial *</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px'}}>
                {Object.entries(HEALTH).slice(0,6).map(([v,hc])=>(
                  <button key={v} onClick={()=>set('healthStatus',v)}
                    style={{padding:'10px',borderRadius:'12px',border:`1.5px solid`,cursor:'pointer',textAlign:'center',fontSize:'0.78rem',fontWeight:700,
                            borderColor:form.healthStatus===v?hc.dot:'var(--borderS)',
                            background:form.healthStatus===v?hc.bg:'var(--surface2)',
                            color:form.healthStatus===v?hc.color:'var(--text-muted)'}}>
                    {hc.icon} {hc.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem',borderRadius:'14px',background:'var(--warnBg)',border:'1px solid var(--warn)33'}}>
              <div>
                <p style={{fontSize:'0.85rem',fontWeight:700,color:'var(--warn)'}}>🛡️ Mise en quarantaine</p>
                <p style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:'2px'}}>Recommandée pour tout animal entrant (14 jours min)</p>
              </div>
              <div onClick={()=>set('quarantine',!form.quarantine)}
                style={{width:'44px',height:'24px',borderRadius:'99px',background:form.quarantine?'var(--warn)':'var(--beige-200)',position:'relative',cursor:'pointer',transition:'all .2s'}}>
                <div style={{position:'absolute',top:'3px',left:form.quarantine?'23px':'3px',width:'18px',height:'18px',borderRadius:'50%',background:'white',transition:'all .2s',boxShadow:'0 1px 4px rgba(0,0,0,.2)'}}/>
              </div>
            </div>
            <div><label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Notes vétérinaires initiales</label><textarea rows={3} placeholder="Observations à l'entrée, traitements en cours, recommandations..." style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.82rem',color:'var(--text)',resize:'vertical'}} value={form.vetNotes} onChange={e=>set('vetNotes',e.target.value)}/></div>
          </div>
        )}
      </div>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'1.25rem',paddingTop:'1rem',borderTop:'1px solid var(--borderS)'}}>
        <span style={{fontSize:'0.7rem',color:'var(--text-light)'}}>Étape {step+1}/5</span>
        <div style={{display:'flex',gap:'8px'}}>
          {step>0?<button onClick={()=>setStep(s=>s-1)} style={{padding:'8px 16px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',color:'var(--text)',fontSize:'0.82rem',fontWeight:600,cursor:'pointer'}}>← Précédent</button>:<button onClick={onCancel} style={{padding:'8px 16px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',color:'var(--text)',fontSize:'0.82rem',fontWeight:600,cursor:'pointer'}}>Annuler</button>}
          {step<4?<button onClick={()=>setStep(s=>s+1)} disabled={step===0&&!form.species} style={{padding:'8px 16px',borderRadius:'10px',background:'var(--accent)',color:'white',border:'none',fontSize:'0.82rem',fontWeight:600,cursor:'pointer',opacity:step===0&&!form.species?.5:1}}>Suivant →</button>
                 :<button onClick={()=>onSave(form)} style={{padding:'8px 16px',borderRadius:'10px',background:'var(--ok)',color:'white',border:'none',fontSize:'0.82rem',fontWeight:600,cursor:'pointer'}}>✓ {editMode?'Modifier':'Enregistrer l\'animal'}</button>}
        </div>
      </div>
    </div>
  )
}

// ── MAIN ─────────────────────────────────────────────────────
export default function LivestockPage() {
  const {t}=useTranslation()
  const {animals,addAnimal,updateAnimal,deleteAnimal}=useStore()
  const [search,setSearch]=useState('')
  const [speciesF,setSpeciesF]=useState('')
  const [healthF,setHealthF]=useState('')
  const [viewMode,setViewMode]=useState<'table'|'cards'>('table')
  const [showAdd,setShowAdd]=useState(false)
  const [editA,setEditA]=useState<AnimalExtended|null>(null)
  const [viewA,setViewA]=useState<AnimalExtended|null>(null)
  const [deleteId,setDeleteId]=useState<string|null>(null)
  const [deleting,setDeleting]=useState(false)

  const animalsExt:AnimalExtended[] = useMemo(()=>(animals as any[]).map(a=>({
    subCategory:'',microchip:'',entryDate:'',exitDate:'',exitReason:'',
    weightHistory:[],vaccinations:[],healthRecords:[],reproductions:[],
    feedingPlan:'Standard',dailyFeed:0,feedUnit:'kg',
    estimatedValue:0,insuranceNumber:'',saleStatus:'non_vendu',...a
  })),[animals])

  const filtered=useMemo(()=>animalsExt.filter(a=>{
    const q=search.toLowerCase()
    return(!q||[a.systemId,a.localName,a.breed,a.tagNumber,a.responsible].join(' ').toLowerCase().includes(q))
      &&(!speciesF||a.species===speciesF)&&(!healthF||a.healthStatus===healthF)
  }),[animalsExt,search,speciesF,healthF])

  const speciesCount=useMemo(()=>SPECIES.map(sp=>({...sp,count:animals.filter(a=>a.species===sp.v).length})),[animals])
  const stats={total:animals.length,healthy:animals.filter(a=>a.healthStatus==='healthy').length,sick:animals.filter(a=>a.healthStatus==='sick').length,quarantine:animals.filter(a=>a.quarantine).length,deceased:animals.filter(a=>a.healthStatus==='deceased').length}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.25rem',animation:'fadeUp .4s ease'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem'}}>
        <div>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:'2rem',fontWeight:700,color:'var(--text)'}}>🐾 Élevage & Cheptel</h1>
          <p style={{fontSize:'0.85rem',color:'var(--text-muted)',marginTop:'3px'}}>{animals.length} animaux · {stats.healthy} sains · {stats.sick} malades · {stats.quarantine} en quarantaine</p>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <button className="btn-secondary btn-sm"><Download size={14}/> Export</button>
          <button onClick={()=>setShowAdd(true)}
            style={{padding:'9px 16px',borderRadius:'10px',background:'var(--accent)',color:'white',border:'none',fontSize:'0.85rem',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',boxShadow:'0 4px 12px rgba(140,110,63,.3)'}}>
            <Plus size={16}/> Ajouter animal
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'0.75rem'}}>
        {[
          {l:'Total cheptel',v:stats.total,     icon:'🐾',c:'var(--text)',d:.05},
          {l:'Sains',        v:stats.healthy,    icon:'✅',c:'var(--ok)',d:.1},
          {l:'Malades',      v:stats.sick,       icon:'🔴',c:'var(--err)',d:.15},
          {l:'Quarantaine',  v:stats.quarantine, icon:'🛡️',c:'var(--warn)',d:.2},
          {l:'Décédés',      v:stats.deceased,   icon:'💀',c:'var(--text-muted)',d:.25},
        ].map((s,i)=>(
          <div key={i} style={{background:'white',borderRadius:'16px',padding:'1rem',border:'1px solid var(--borderS)',animation:`fadeUp .5s ease ${s.d}s both`}}>
            <div style={{width:'32px',height:'32px',borderRadius:'10px',background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',marginBottom:'8px'}}>{s.icon}</div>
            <div style={{fontFamily:'Georgia,serif',fontSize:'1.75rem',fontWeight:700,color:s.c,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:'4px'}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Species breakdown */}
      <div style={{display:'flex',gap:'6px',overflowX:'auto',paddingBottom:'4px'}}>
        <button onClick={()=>setSpeciesF('')}
          style={{padding:'7px 14px',borderRadius:'99px',border:`1.5px solid ${!speciesF?'var(--accent)':'var(--border)'}`,background:!speciesF?'var(--accent)':'white',color:!speciesF?'white':'var(--text-muted)',fontSize:'0.78rem',fontWeight:700,cursor:'pointer',flexShrink:0}}>
          🐾 Toutes ({animals.length})
        </button>
        {speciesCount.filter(s=>s.count>0).map(s=>(
          <button key={s.v} onClick={()=>setSpeciesF(s.v)}
            style={{padding:'7px 14px',borderRadius:'99px',border:`1.5px solid ${speciesF===s.v?'var(--accent)':'var(--border)'}`,background:speciesF===s.v?'var(--accent)':'white',color:speciesF===s.v?'white':'var(--text-muted)',fontSize:'0.78rem',fontWeight:speciesF===s.v?700:500,cursor:'pointer',flexShrink:0,display:'flex',alignItems:'center',gap:'5px'}}>
            {s.e} {s.l} ({s.count})
          </button>
        ))}
      </div>

      {/* Search + health filter */}
      <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
        <div style={{position:'relative',flex:1,minWidth:'200px'}}>
          <Search size={14} style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:'var(--text-light)'}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ID système, nom local, race, boucle, responsable..."
            style={{width:'100%',padding:'9px 12px 9px 32px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)',outline:'none'}}/>
          {search&&<button onClick={()=>setSearch('')} style={{position:'absolute',right:'8px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer'}}><X size={14}/></button>}
        </div>
        <select value={healthF} onChange={e=>setHealthF(e.target.value)}
          style={{padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'white',fontSize:'0.8rem',color:'var(--text)',cursor:'pointer'}}>
          <option value="">Tous états de santé</option>
          {Object.entries(HEALTH).map(([v,hc])=><option key={v} value={v}>{hc.icon} {hc.label}</option>)}
        </select>
        <div style={{display:'flex',gap:'5px'}}>
          {[['table','📋'],['cards','🃏']].map(([m,ic])=>(
            <button key={m} onClick={()=>setViewMode(m as any)}
              style={{padding:'8px 10px',borderRadius:'10px',border:`1.5px solid ${viewMode===m?'var(--accent)':'var(--border)'}`,background:viewMode===m?'var(--accentS)':'white',color:viewMode===m?'var(--accent)':'var(--text-muted)',fontSize:'0.8rem',cursor:'pointer'}}>
              {ic}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {filtered.length===0?(
        <div style={{textAlign:'center',padding:'4rem',background:'white',borderRadius:'20px',border:'1px solid var(--borderS)'}}>
          <div style={{fontSize:'4rem',marginBottom:'1rem'}}>🐾</div>
          <h3 style={{fontFamily:'Georgia,serif',fontSize:'1.5rem',fontWeight:700,marginBottom:'0.5rem'}}>Aucun animal trouvé</h3>
          <button onClick={()=>setShowAdd(true)} style={{padding:'10px 20px',borderRadius:'12px',background:'var(--accent)',color:'white',border:'none',fontSize:'0.85rem',fontWeight:600,cursor:'pointer'}}>+ Ajouter animal</button>
        </div>
      ) : viewMode==='table' ? (
        <div style={{background:'white',borderRadius:'20px',border:'1px solid var(--borderS)',overflow:'hidden',boxShadow:'0 2px 8px rgba(46,31,16,.05)'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead style={{background:'var(--beige-50)',borderBottom:'1px solid var(--border)'}}>
              <tr>
                {['ID Système','Animal','Espèce / Race','Sexe / Âge','Poids','Zone','Santé','Production','Responsable','Actions'].map(h=>(
                  <th key={h} style={{padding:'10px 12px',fontSize:'0.68rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em',textAlign:'left',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a,i)=>{
                const hc=HEALTH[a.healthStatus]||HEALTH.healthy
                const sp=SPECIES.find(s=>s.v===a.species)
                const age=a.birthDate?Math.floor((Date.now()-new Date(a.birthDate).getTime())/(365.25*86400000)):null
                return (
                  <tr key={a.id} style={{borderBottom:'1px solid var(--beige-50)',cursor:'pointer',transition:'background .1s',animation:`fadeIn .3s ease ${i*.04}s both`}}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--beige-50)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    onClick={()=>setViewA(a)}>
                    <td style={{padding:'10px 12px',fontFamily:'monospace',fontSize:'0.75rem',color:'var(--text-light)'}}>{a.systemId}</td>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <div style={{width:'32px',height:'32px',borderRadius:'10px',background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',flexShrink:0}}>{sp?.e||'🐾'}</div>
                        <div>
                          <p style={{fontSize:'0.85rem',fontWeight:700}}>{a.localName||'—'}</p>
                          {a.tagNumber&&<p style={{fontSize:'0.65rem',color:'var(--text-light)'}}>🏷️ {a.tagNumber}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{padding:'10px 12px'}}><p style={{fontSize:'0.82rem',fontWeight:600}}>{sp?.l||a.species}</p><p style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{a.breed||'—'}</p></td>
                    <td style={{padding:'10px 12px'}}><p style={{fontSize:'0.82rem'}}>{a.sex==='male'?'♂ Mâle':'♀ Femelle'}</p>{age!==null&&<p style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{age} ans</p>}</td>
                    <td style={{padding:'10px 12px',fontSize:'0.85rem',fontWeight:600}}>{a.weight?`${a.weight} kg`:'—'}</td>
                    <td style={{padding:'10px 12px',fontSize:'0.82rem',color:'var(--text-muted)'}}>{a.zone||'—'}</td>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>
                        <span style={{background:hc.bg,color:hc.color,fontSize:'0.65rem',fontWeight:700,padding:'3px 7px',borderRadius:'99px',display:'inline-block'}}>{hc.icon} {hc.label}</span>
                        {a.quarantine&&<span style={{background:'var(--warnBg)',color:'var(--warn)',fontSize:'0.62rem',fontWeight:700,padding:'2px 6px',borderRadius:'99px',display:'inline-block'}}>🛡️ Quarantaine</span>}
                      </div>
                    </td>
                    <td style={{padding:'10px 12px',fontSize:'0.82rem',color:'var(--text-muted)'}}>{a.production||'—'}</td>
                    <td style={{padding:'10px 12px',fontSize:'0.78rem',color:'var(--text-muted)'}}>{a.responsible||'—'}</td>
                    <td style={{padding:'10px 12px'}} onClick={e=>e.stopPropagation()}>
                      <div style={{display:'flex',gap:'4px'}}>
                        <button onClick={()=>setViewA(a)} style={{padding:'5px',borderRadius:'8px',background:'transparent',border:'none',cursor:'pointer',color:'var(--text-muted)'}}><Eye size={14}/></button>
                        <button onClick={()=>setEditA(a)} style={{padding:'5px',borderRadius:'8px',background:'transparent',border:'none',cursor:'pointer',color:'var(--accent)'}}><Edit size={14}/></button>
                        <button onClick={()=>setDeleteId(a.id)} style={{padding:'5px',borderRadius:'8px',background:'transparent',border:'none',cursor:'pointer',color:'var(--err)'}}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'1rem'}}>
          {filtered.map((a,i)=>{
            const hc=HEALTH[a.healthStatus]||HEALTH.healthy
            const sp=SPECIES.find(s=>s.v===a.species)
            return (
              <div key={a.id} style={{background:'white',borderRadius:'18px',border:`1px solid ${hc.dot}33`,overflow:'hidden',cursor:'pointer',transition:'all .2s',animation:`fadeUp .5s ease ${i*.05}s both`,boxShadow:'0 2px 8px rgba(46,31,16,.05)'}}
                onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 10px 30px rgba(46,31,16,.1)' }}
                onMouseLeave={e=>{ e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 2px 8px rgba(46,31,16,.05)' }}
                onClick={()=>setViewA(a)}>
                <div style={{height:'3px',background:`linear-gradient(90deg,${hc.dot},${hc.dot}66)`}}/>
                <div style={{padding:'1rem'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
                    <div style={{width:'48px',height:'48px',borderRadius:'14px',background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.75rem'}}>{sp?.e||'🐾'}</div>
                    <div style={{flex:1}}>
                      <p style={{fontFamily:'Georgia,serif',fontWeight:700,fontSize:'1rem'}}>{a.localName||a.systemId}</p>
                      <p style={{fontFamily:'monospace',fontSize:'0.65rem',color:'var(--text-light)'}}>{a.systemId}</p>
                    </div>
                    <span style={{background:hc.bg,color:hc.color,fontSize:'0.65rem',fontWeight:700,padding:'3px 7px',borderRadius:'99px'}}>{hc.icon}</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'5px',marginBottom:'10px'}}>
                    {[{l:'Race',v:a.breed||'—'},{l:'Poids',v:a.weight?`${a.weight}kg`:'—'},{l:'Zone',v:a.zone||'—'},{l:'Production',v:a.production||'—'}].map((s,j)=>(
                      <div key={j} style={{background:'var(--surface2)',borderRadius:'8px',padding:'5px 7px'}}>
                        <p style={{fontSize:'0.6rem',color:'var(--text-light)'}}>{s.l}</p>
                        <p style={{fontSize:'0.75rem',fontWeight:600}}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                  {a.quarantine&&<div style={{background:'var(--warnBg)',borderRadius:'10px',padding:'6px 10px',fontSize:'0.72rem',color:'var(--warn)',fontWeight:600,marginBottom:'8px'}}>🛡️ Quarantaine active</div>}
                  <div style={{display:'flex',gap:'5px',paddingTop:'8px',borderTop:'1px solid var(--borderS)'}} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>setEditA(a)} style={{flex:1,padding:'6px',borderRadius:'8px',background:'var(--accentS)',border:'none',fontSize:'0.72rem',fontWeight:600,cursor:'pointer',color:'var(--accent)'}}>✏️ Modifier</button>
                    <button onClick={()=>setDeleteId(a.id)} style={{padding:'6px 8px',borderRadius:'8px',background:'var(--errBg)',border:'none',cursor:'pointer',color:'var(--err)'}}><Trash2 size={12}/></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {showAdd&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal" style={{maxWidth:'640px'}}>
            <div className="modal-header" style={{background:'var(--beige-50)'}}><h3 style={{fontFamily:'Georgia,serif',fontSize:'1.25rem',fontWeight:700}}>🐾 Enregistrer un nouvel animal</h3><button style={{background:'transparent',border:'none',cursor:'pointer',padding:'6px'}} onClick={()=>setShowAdd(false)}>✕</button></div>
            <div className="modal-body">
              <AnimalForm initial={{}} onSave={d=>{addAnimal({systemId:`${d.species?.slice(0,3).toUpperCase()||'ANI'}-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,species:d.species,breed:d.breed,sex:d.sex,localName:d.localName,tagNumber:d.tagNumber,birthDate:d.birthDate,estimatedAge:d.estimatedAge,color:d.color,weight:parseFloat(d.weight)||0,zone:d.zone,responsible:d.responsible,origin:d.origin,supplierName:d.supplierName,purchaseDate:d.purchaseDate,purchasePrice:parseFloat(d.purchasePrice)||0,healthStatus:d.healthStatus,quarantine:d.quarantine,vetNotes:d.vetNotes,motherTag:d.motherTag,fatherTag:d.fatherTag,production:d.production,lastVet:'',photo:''});setShowAdd(false);toast(`✅ Animal enregistré`)}} onCancel={()=>setShowAdd(false)}/>
            </div>
          </div>
        </div>
      )}
      {editA&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setEditA(null)}>
          <div className="modal" style={{maxWidth:'640px'}}>
            <div className="modal-header" style={{background:'var(--beige-50)'}}><h3 style={{fontFamily:'Georgia,serif',fontSize:'1.25rem',fontWeight:700}}>✏️ Modifier — {editA.localName||editA.systemId}</h3><button style={{background:'transparent',border:'none',cursor:'pointer',padding:'6px'}} onClick={()=>setEditA(null)}>✕</button></div>
            <div className="modal-body">
              <AnimalForm initial={editA} onSave={d=>{updateAnimal(editA.id,{species:d.species,breed:d.breed,sex:d.sex,localName:d.localName,tagNumber:d.tagNumber,birthDate:d.birthDate,estimatedAge:d.estimatedAge,color:d.color,weight:parseFloat(d.weight)||editA.weight,zone:d.zone,responsible:d.responsible,origin:d.origin,supplierName:d.supplierName,purchaseDate:d.purchaseDate,purchasePrice:parseFloat(d.purchasePrice)||editA.purchasePrice,healthStatus:d.healthStatus,quarantine:d.quarantine,vetNotes:d.vetNotes,motherTag:d.motherTag,fatherTag:d.fatherTag,production:d.production});setEditA(null);toast(`✏️ Animal modifié`)}} onCancel={()=>setEditA(null)} editMode/>
            </div>
          </div>
        </div>
      )}
      {viewA&&<AnimalDetail animal={viewA} onClose={()=>setViewA(null)} onEdit={()=>{setEditA(viewA);setViewA(null)}}/>}
      <ConfirmDelete open={!!deleteId} title="Supprimer cet animal" message="Cet animal et toutes ses données (santé, vaccinations, etc.) seront définitivement supprimés."
        onConfirm={()=>{setDeleting(true);setTimeout(()=>{deleteAnimal(deleteId!);setDeleteId(null);setDeleting(false);setViewA(null);toast('🗑️ Animal supprimé','info')},600)}}
        onCancel={()=>setDeleteId(null)} loading={deleting}/>
    </div>
  )
}
