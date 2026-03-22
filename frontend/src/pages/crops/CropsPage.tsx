import React, { useState, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Download, Search, ChevronDown, ChevronRight, Leaf, Droplets, Sun, Cloud, Calendar, TrendingUp, Eye, Edit, Trash2, CheckCircle, Clock, AlertTriangle, Filter, X, BarChart3, Thermometer, Wind } from 'lucide-react'
import { useStore, Crop } from '@/store/useStore'
import { ConfirmDelete, Modal, toast } from '@/components/ui/crud'
import { clsx } from 'clsx'

// ── Config ──────────────────────────────────────────────────
const PLANT_TYPES = [
  { v:'Maïs',         emoji:'🌽', cat:'cereale',   cycle:120, soil:'Limoneux', water:'Moyen', temp:'18-30°C' },
  { v:'Haricots',     emoji:'🫘', cat:'legumineuse',cycle:90,  soil:'Léger',    water:'Faible',temp:'16-24°C' },
  { v:'Pomme de terre',emoji:'🥔',cat:'tubercule',  cycle:100, soil:'Sableux',  water:'Moyen', temp:'10-20°C' },
  { v:'Sorgho',       emoji:'🌾', cat:'cereale',   cycle:130, soil:'Argileux', water:'Faible',temp:'20-35°C' },
  { v:'Manioc',       emoji:'🫚', cat:'tubercule',  cycle:365, soil:'Léger',    water:'Faible',temp:'25-35°C' },
  { v:'Patate douce', emoji:'🍠', cat:'tubercule',  cycle:90,  soil:'Sableux',  water:'Faible',temp:'18-28°C' },
  { v:'Tomate',       emoji:'🍅', cat:'maraicher',  cycle:75,  soil:'Riche',    water:'Élevé', temp:'18-25°C' },
  { v:'Chou',         emoji:'🥬', cat:'maraicher',  cycle:80,  soil:'Riche',    water:'Moyen', temp:'10-20°C' },
  { v:'Oignon',       emoji:'🧅', cat:'maraicher',  cycle:120, soil:'Léger',    water:'Moyen', temp:'13-24°C' },
  { v:'Arachide',     emoji:'🥜', cat:'legumineuse',cycle:110, soil:'Sableux',  water:'Faible',temp:'22-30°C' },
  { v:'Soja',         emoji:'🫛', cat:'legumineuse',cycle:100, soil:'Riche',    water:'Moyen', temp:'20-30°C' },
  { v:'Riz',          emoji:'🌾', cat:'cereale',   cycle:150, soil:'Argileux', water:'Élevé', temp:'20-35°C' },
  { v:'Blé',          emoji:'🌾', cat:'cereale',   cycle:120, soil:'Limoneux', water:'Moyen', temp:'10-22°C' },
  { v:'Banane',       emoji:'🍌', cat:'fruitier',  cycle:365, soil:'Riche',    water:'Élevé', temp:'25-35°C' },
  { v:'Avocat',       emoji:'🥑', cat:'fruitier',  cycle:365, soil:'Léger',    water:'Moyen', temp:'20-30°C' },
  { v:'Autre',        emoji:'🌿', cat:'autre',     cycle:90,  soil:'Variable', water:'Variable',temp:'Variable' },
]

const VARIETIES: Record<string,string[]> = {
  'Maïs':['SC403','SC627','H614D','DK8031','Locale Katanga','CIPRO','ZM621'],
  'Haricots':['Roba','Lyamungu 85','Jesca','Lyamungu 90','Selian 97','Locale'],
  'Pomme de terre':['Victoria','Kinigi','Cruza 148','CODURE','Cherie','Locale'],
  'Sorgho':['Seredo','Epurple','Gadam','Locale Sud-Kivu'],
  'Manioc':['Mvuvula','TME 419','KASESE','Locale'],
  'Tomate':['Roma','Heinz','Tengeru 97','Determinate Local'],
}

const SOIL_TYPES = ['Argilo-limoneux','Sableux','Argileux','Limoneux','Sablo-argileux','Tourbeux','Latéritique']
const IRRIGATION_MODES = [
  {v:'rain',l:'🌧️ Pluviale',desc:'Eau de pluie naturelle'},
  {v:'drip',l:'💧 Goutte-à-goutte',desc:'Irrigation localisée économe'},
  {v:'sprinkler',l:'🌿 Aspersion',desc:'Asperseurs automatiques'},
  {v:'gravity',l:'⛲ Gravitaire',desc:'Canal gravitaire naturel'},
  {v:'manual',l:'🪣 Manuelle',desc:'Arrosage à la main'},
  {v:'none',l:'❌ Aucune',desc:'Culture sèche'},
]

const STATUS_CFG: Record<string,{label:string;color:string;bg:string;dot:string;icon:string}> = {
  planned:   {label:'Planifiée',      color:'var(--text-muted)',bg:'var(--surface2)',      dot:'#888',  icon:'📋'},
  sowing:    {label:'Semis en cours', color:'var(--b700)',      bg:'var(--b100)',        dot:'#3b82f6',icon:'🌱'},
  growing:   {label:'En croissance',  color:'var(--ok)',     bg:'var(--okBg)',       dot:'#22c55e',icon:'🌿'},
  flowering: {label:'En floraison',   color:'#7c3aed',          bg:'#f5f3ff',               dot:'#7c3aed',icon:'🌸'},
  fruiting:  {label:'Fructification', color:'#ea580c',          bg:'#fff7ed',               dot:'#ea580c',icon:'🍃'},
  ready:     {label:'Prête à récolter',color:'var(--accent)',   bg:'var(--accentS)',       dot:'#8c6e3f',icon:'🌾'},
  harvested: {label:'Récoltée',       color:'var(--text-muted)',bg:'var(--surface2)',      dot:'#888',  icon:'✅'},
  lost:      {label:'Perdue',         color:'var(--err)',       bg:'var(--errBg)',         dot:'#ef4444',icon:'💀'},
}

const SOWING_METHODS = [
  {v:'direct',l:'Semis direct en sillon'},
  {v:'broadcast',l:'Semis à la volée'},
  {v:'transplant',l:'Transplantation de plants'},
  {v:'cutting',l:'Bouturage'},
  {v:'tuber',l:'Plantation de tubercules'},
]

const TREATMENT_TYPES = [
  {v:'fungicide',l:'🍄 Fongicide',color:'#7c3aed'},
  {v:'herbicide',l:'🌿 Herbicide',color:'#059669'},
  {v:'insecticide',l:'🐛 Insecticide',color:'#dc2626'},
  {v:'fertilizer',l:'🧪 Engrais',color:'#0284c7'},
  {v:'irrigation',l:'💧 Arrosage',color:'#0891b2'},
  {v:'pruning',l:'✂️ Taille/Sarclage',color:'#d97706'},
]

// Extended crop type with extra fields
interface CropExtended {
  id: string
  type: string; variety: string; zone: string; area: number
  plantingDate: string; harvestDate: string; status: string
  health: number; yieldEst: number; responsible: string
  irrigation: string; seedSource: string; notes: string
  createdAt: string; updatedAt: string
  // extra fields
  sowingMethod: string
  soilType: string
  seedQtyPerHa: number
  seedLotNumber: string
  spacing: string  // ex: "30x50cm"
  depth: string    // ex: "3cm"
  fertiPlan: string
  pesticideUsed: string
  waterReq: string
  expectedRevenue: number
  actualYield: number
  laborDays: number
  treatments: Array<{date:string;type:string;product:string;dose:string;by:string}>
  observations: Array<{date:string;text:string;by:string;photo?:string}>
  season: string  // ex: "Saison A 2024-2025"
  latitude: string; longitude: string
  certifications: string[]
}

// ── Mini Progress Ring ───────────────────────────────────────
function Ring({ pct, size=48, stroke=4, color='var(--accent)' }: {pct:number;size?:number;stroke?:number;color?:string}) {
  const r = (size-stroke*2)/2
  const circ = 2*Math.PI*r
  const offset = circ - (pct/100)*circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:'rotate(-90deg)'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{transition:'stroke-dashoffset 1s ease'}}/>
    </svg>
  )
}

// ── Animated Counter ─────────────────────────────────────────
function Counter({ val, suffix='' }: {val:number;suffix?:string}) {
  return <span>{val.toLocaleString()}{suffix}</span>
}

// ── Season pill ───────────────────────────────────────────────
function SeasonPill({season}:{season:string}) {
  return <span style={{background:'linear-gradient(135deg,var(--beige-200),var(--beige-100))',color:'var(--accent)',fontSize:'0.65rem',fontWeight:700,padding:'2px 8px',borderRadius:'99px',border:'1px solid var(--beige-300)'}}>{season||'—'}</span>
}

// ── Calendar mini ────────────────────────────────────────────
function CropCalendar({ crops }: { crops: CropExtended[] }) {
  const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
  const colors = ['#4a7c59','#8c6e3f','#2c5282','#a16207','#7c3aed','#dc2626','#0891b2','#059669']
  return (
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',minWidth:'600px'}}>
        <thead>
          <tr>
            <th style={{padding:'6px 10px',fontSize:'0.7rem',textAlign:'left',color:'var(--text-muted)',fontWeight:600,borderBottom:'1px solid var(--border)'}}>Culture</th>
            {months.map(m=><th key={m} style={{padding:'6px 4px',fontSize:'0.65rem',color:'var(--text-muted)',textAlign:'center',fontWeight:600,borderBottom:'1px solid var(--border)',minWidth:'40px'}}>{m}</th>)}
          </tr>
        </thead>
        <tbody>
          {crops.slice(0,8).map((crop,ci)=>{
            const color = colors[ci%colors.length]
            const pStart = crop.plantingDate ? new Date(crop.plantingDate).getMonth() : 0
            const pEnd   = crop.harvestDate  ? new Date(crop.harvestDate).getMonth()  : 0
            return (
              <tr key={crop.id} style={{borderBottom:'1px solid var(--borderS)'}}>
                <td style={{padding:'6px 10px',fontSize:'0.78rem',fontWeight:600,whiteSpace:'nowrap'}}>
                  {PLANT_TYPES.find(p=>p.v===crop.type)?.emoji||'🌱'} {crop.type} <span style={{fontSize:'0.65rem',color:'var(--text-muted)'}}>{crop.variety}</span>
                </td>
                {months.map((_,mi)=>{
                  const inRange = pEnd>=pStart ? (mi>=pStart&&mi<=pEnd) : (mi>=pStart||mi<=pEnd)
                  const isStart = mi===pStart
                  const isEnd   = mi===pEnd
                  return (
                    <td key={mi} style={{padding:'6px 4px',textAlign:'center'}}>
                      {inRange&&(
                        <div style={{
                          height:'14px',background:color+'33',
                          borderRadius: isStart?'99px 0 0 99px': isEnd?'0 99px 99px 0':'0',
                          borderLeft: isStart?`3px solid ${color}`:'none',
                          borderRight: isEnd?`3px solid ${color}`:'none',
                          margin:'0 1px',
                        }}/>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Detail Side Panel ────────────────────────────────────────
function CropDetail({ crop, onClose, onEdit }: { crop: CropExtended; onClose:()=>void; onEdit:()=>void }) {
  const [tab,setTab] = useState('overview')
  const sc = STATUS_CFG[crop.status]||STATUS_CFG.growing
  const pt = PLANT_TYPES.find(p=>p.v===crop.type)

  const tabs = [
    {id:'overview',label:'📊 Vue d\'ensemble'},
    {id:'technical',label:'🔬 Technique'},
    {id:'treatments',label:'🧪 Traitements'},
    {id:'observations',label:'📝 Observations'},
    {id:'economics',label:'💰 Économie'},
  ]

  const daysSincePlanting = crop.plantingDate ? Math.floor((Date.now()-new Date(crop.plantingDate).getTime())/86400000) : 0
  const daysToHarvest    = crop.harvestDate   ? Math.ceil((new Date(crop.harvestDate).getTime()-Date.now())/86400000) : 0
  const cycleDuration    = pt?.cycle || 90
  const progressPct      = Math.min(100,Math.max(0,Math.round(daysSincePlanting/cycleDuration*100)))

  return (
    <div className="fixed inset-0 z-50 flex" style={{background:'rgba(46,31,16,.5)',backdropFilter:'blur(12px)'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="ml-auto w-full bg-white h-full overflow-y-auto scrollbar-hide"
        style={{maxWidth:'680px',animation:'slideIn .3s ease',boxShadow:'-4px 0 40px rgba(46,31,16,.15)'}}>

        {/* Hero header */}
        <div style={{background:`linear-gradient(135deg,${sc.bg} 0%,white 100%)`,borderBottom:'1px solid var(--borderS)',padding:'1.5rem'}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'1rem'}}>
            <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
              <div style={{width:'64px',height:'64px',borderRadius:'20px',background:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem',boxShadow:'0 4px 20px rgba(46,31,16,.1)'}}>
                {pt?.emoji||'🌱'}
              </div>
              <div>
                <h2 style={{fontFamily:'Georgia,serif',fontSize:'1.75rem',fontWeight:700}}>{crop.type}</h2>
                <p style={{fontSize:'0.85rem',color:'var(--text-muted)',marginTop:'2px'}}>{crop.variety||'—'} · {crop.zone} · {crop.area} ha</p>
                <div style={{display:'flex',gap:'0.5rem',marginTop:'0.5rem',flexWrap:'wrap'}}>
                  <span style={{background:sc.bg,color:sc.color,fontSize:'0.7rem',fontWeight:700,padding:'3px 10px',borderRadius:'99px',border:`1px solid ${sc.dot}33`}}>{sc.icon} {sc.label}</span>
                  {crop.season&&<SeasonPill season={crop.season}/>}
                  <span style={{background:'var(--surface2)',color:'var(--text-muted)',fontSize:'0.7rem',padding:'3px 8px',borderRadius:'99px'}}>📍 {crop.responsible||'—'}</span>
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <button style={{background:'var(--accent)',color:'white',border:'none',borderRadius:'10px',padding:'8px 14px',fontSize:'0.8rem',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'6px'}} onClick={onEdit}>✏️ Modifier</button>
              <button style={{background:'transparent',border:'1px solid var(--border)',borderRadius:'10px',padding:'8px',cursor:'pointer'}} onClick={onClose}>✕</button>
            </div>
          </div>

          {/* Progress cycle */}
          <div style={{background:'white',borderRadius:'14px',padding:'1rem',border:'1px solid var(--borderS)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.75rem'}}>
              <span style={{fontSize:'0.78rem',fontWeight:600,color:'var(--text-muted)'}}>PROGRESSION DU CYCLE</span>
              <span style={{fontSize:'0.85rem',fontWeight:700,color:'var(--accent)'}}>{progressPct}%</span>
            </div>
            <div style={{height:'8px',background:'var(--beige-100)',borderRadius:'99px',overflow:'hidden'}}>
              <div style={{height:'100%',width:`${progressPct}%`,background:`linear-gradient(90deg,var(--ok),var(--accent))`,borderRadius:'99px',transition:'width 1s ease'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:'0.5rem'}}>
              <span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>Planté le {crop.plantingDate||'—'}</span>
              <span style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{daysToHarvest>0?`${daysToHarvest} jours restants`:'Prêt'}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',borderBottom:'1px solid var(--border)',overflowX:'auto',background:'white'}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{padding:'10px 14px',fontSize:'0.78rem',fontWeight:tab===t.id?600:400,
                      color:tab===t.id?'var(--accent)':'var(--text-muted)',
                      borderBottom:tab===t.id?'2px solid var(--accent)':'2px solid transparent',
                      background:'transparent',border:'none',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{padding:'1.25rem'}}>

          {tab==='overview'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              {/* Quick stats */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.625rem'}}>
                {[
                  {label:'Santé',value:`${crop.health}%`,icon:'💚',color:crop.health>80?'var(--ok)':'var(--warn)'},
                  {label:'Rendement est.',value:`${crop.yieldEst}t/ha`,icon:'📦',color:'var(--accent)'},
                  {label:'J. depuis semis',value:`${daysSincePlanting}j`,icon:'📅',color:'var(--b700)'},
                  {label:'Surface',value:`${crop.area}ha`,icon:'📐',color:'var(--text)'},
                ].map((s,i)=>(
                  <div key={i} style={{background:'var(--surface2)',borderRadius:'14px',padding:'12px',textAlign:'center',border:'1px solid var(--borderS)'}}>
                    <div style={{fontSize:'1.25rem',marginBottom:'4px'}}>{s.icon}</div>
                    <div style={{fontFamily:'Georgia,serif',fontSize:'1.1rem',fontWeight:700,color:s.color}}>{s.value}</div>
                    <div style={{fontSize:'0.65rem',color:'var(--text-muted)',marginTop:'2px'}}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Info grid */}
              <div style={{background:'var(--surface2)',borderRadius:'16px',padding:'1rem',border:'1px solid var(--borderS)'}}>
                <p style={{fontSize:'0.7rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'0.75rem'}}>INFORMATIONS GÉNÉRALES</p>
                {[
                  ['Espèce',`${pt?.emoji||'🌱'} ${crop.type}`],['Variété',crop.variety||'—'],
                  ['Saison',crop.season||'—'],['Zone',crop.zone],['Surface',`${crop.area} ha`],
                  ['Méthode semis',SOWING_METHODS.find(s=>s.v===crop.sowingMethod)?.l||'—'],
                  ['Type de sol',crop.soilType||'—'],['Écartement',crop.spacing||'—'],
                  ['Profondeur semis',crop.depth||'—'],['Irrigation',IRRIGATION_MODES.find(m=>m.v===crop.irrigation)?.l||'—'],
                  ['Source semences',crop.seedSource||'—'],['N° lot semences',crop.seedLotNumber||'—'],
                  ['Densité semis',crop.seedQtyPerHa?`${crop.seedQtyPerHa} kg/ha`:'—'],
                  ['Responsable',crop.responsible||'—'],
                ].filter(([,v])=>v!=='—').map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--borderS)'}}>
                    <span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>{k}</span>
                    <span style={{fontSize:'0.78rem',fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
              {/* Notes */}
              {crop.notes&&(
                <div style={{background:'var(--b100)',borderRadius:'14px',padding:'1rem',borderLeft:'3px solid var(--b700)'}}>
                  <p style={{fontSize:'0.78rem',fontWeight:600,color:'var(--b700)',marginBottom:'4px'}}>📝 Notes</p>
                  <p style={{fontSize:'0.8rem',color:'var(--text)'}}>{crop.notes}</p>
                </div>
              )}
            </div>
          )}

          {tab==='technical'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              {/* Agronomic specs */}
              <div style={{background:'var(--surface2)',borderRadius:'16px',padding:'1rem'}}>
                <p style={{fontSize:'0.7rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'0.75rem'}}>FICHE AGRONOMIQUE — {crop.type.toUpperCase()}</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.625rem'}}>
                  {[
                    {label:'Durée du cycle',value:`${pt?.cycle||'—'} jours`,icon:'⏳'},
                    {label:'Besoin en eau',value:pt?.water||'—',icon:'💧'},
                    {label:'Sol idéal',value:pt?.soil||'—',icon:'🪨'},
                    {label:'Température optimale',value:pt?.temp||'—',icon:'🌡️'},
                  ].map((s,i)=>(
                    <div key={i} style={{background:'white',borderRadius:'12px',padding:'10px',display:'flex',gap:'8px',alignItems:'center',border:'1px solid var(--borderS)'}}>
                      <span style={{fontSize:'1.25rem'}}>{s.icon}</span>
                      <div>
                        <p style={{fontSize:'0.65rem',color:'var(--text-muted)'}}>{s.label}</p>
                        <p style={{fontSize:'0.82rem',fontWeight:600}}>{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Fertilization plan */}
              <div style={{background:'var(--surface2)',borderRadius:'16px',padding:'1rem'}}>
                <p style={{fontSize:'0.7rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'0.75rem'}}>PLAN DE FERTILISATION</p>
                {crop.fertiPlan?(
                  <p style={{fontSize:'0.82rem'}}>{crop.fertiPlan}</p>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                    {[
                      {phase:'Fumure de fond',produit:'NPK 17-17-17',dose:'200 kg/ha',timing:'À la plantation'},
                      {phase:'1ère N fractionnée',produit:'Urée 46%',dose:'100 kg/ha',timing:'4 semaines après'},
                      {phase:'2ème N top-dressing',produit:'Urée 46%',dose:'80 kg/ha',timing:'8 semaines après'},
                    ].map((f,i)=>(
                      <div key={i} style={{background:'white',borderRadius:'10px',padding:'8px 10px',border:'1px solid var(--borderS)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div>
                          <p style={{fontSize:'0.78rem',fontWeight:600}}>{f.phase}</p>
                          <p style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{f.produit} · {f.dose}</p>
                        </div>
                        <span style={{fontSize:'0.7rem',background:'var(--warnBg)',color:'var(--warn)',padding:'2px 7px',borderRadius:'99px',fontWeight:600}}>{f.timing}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Weather needs */}
              <div style={{background:'var(--b100)',borderRadius:'16px',padding:'1rem',border:'1px solid var(--b700)22'}}>
                <p style={{fontSize:'0.7rem',fontWeight:700,color:'var(--b700)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'0.625rem'}}>BESOINS CLIMATIQUES</p>
                <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                  {[
                    {icon:'💧',label:'Eau',value:crop.waterReq||`${pt?.water||'Moyen'}`},
                    {icon:'☀️',label:'Soleil',value:'Plein soleil'},
                    {icon:'🌡️',label:'Température',value:pt?.temp||'Variable'},
                    {icon:'🪨',label:'Sol',value:crop.soilType||pt?.soil||'Variable'},
                  ].map((c,i)=>(
                    <div key={i} style={{background:'white',borderRadius:'10px',padding:'8px 12px',display:'flex',alignItems:'center',gap:'6px',border:'1px solid var(--b700)22',flex:'1',minWidth:'120px'}}>
                      <span>{c.icon}</span>
                      <div><p style={{fontSize:'0.65rem',color:'var(--text-muted)'}}>{c.label}</p><p style={{fontSize:'0.78rem',fontWeight:600}}>{c.value}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab==='treatments'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {(crop.treatments||[]).length===0?(
                <div style={{textAlign:'center',padding:'2.5rem',color:'var(--text-muted)'}}>
                  <div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>🧪</div>
                  <p style={{fontFamily:'Georgia,serif',fontSize:'1.1rem',fontWeight:600}}>Aucun traitement enregistré</p>
                  <p style={{fontSize:'0.82rem',marginTop:'4px'}}>Ajoutez les interventions phytosanitaires</p>
                </div>
              ):(crop.treatments||[]).map((tr,i)=>{
                const tc = TREATMENT_TYPES.find(t=>t.v===tr.type)
                return (
                  <div key={i} style={{background:'var(--surface2)',borderRadius:'14px',padding:'0.875rem',border:'1px solid var(--borderS)',display:'flex',gap:'10px',alignItems:'flex-start'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'10px',background:`${tc?.color||'#888'}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',flexShrink:0}}>
                      {tc?.l.split(' ')[0]||'🧪'}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'2px'}}>
                        <p style={{fontSize:'0.82rem',fontWeight:600}}>{tr.product}</p>
                        <span style={{fontSize:'0.65rem',fontWeight:600,padding:'2px 7px',borderRadius:'99px',background:`${tc?.color||'#888'}22`,color:tc?.color||'#888'}}>{tc?.l||tr.type}</span>
                      </div>
                      <p style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{tr.date} · {tr.dose} · Par {tr.by||'—'}</p>
                    </div>
                  </div>
                )
              })}
              <button style={{background:'var(--accent)',color:'white',border:'none',borderRadius:'12px',padding:'10px',fontSize:'0.82rem',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',justifyContent:'center'}}>
                ➕ Ajouter traitement
              </button>
            </div>
          )}

          {tab==='observations'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {(crop.observations||[]).length===0?(
                <div style={{textAlign:'center',padding:'2.5rem',color:'var(--text-muted)'}}>
                  <div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>📝</div>
                  <p style={{fontFamily:'Georgia,serif',fontSize:'1.1rem',fontWeight:600}}>Aucune observation</p>
                  <p style={{fontSize:'0.82rem',marginTop:'4px'}}>Enregistrez les observations terrain</p>
                </div>
              ):(crop.observations||[]).map((obs,i)=>(
                <div key={i} style={{background:'var(--surface2)',borderRadius:'14px',padding:'0.875rem',border:'1px solid var(--borderS)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                    <span style={{fontSize:'0.72rem',fontWeight:600,color:'var(--accent)'}}>📅 {obs.date}</span>
                    <span style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>👤 {obs.by}</span>
                  </div>
                  <p style={{fontSize:'0.82rem'}}>{obs.text}</p>
                </div>
              ))}
              <button style={{background:'var(--accent)',color:'white',border:'none',borderRadius:'12px',padding:'10px',fontSize:'0.82rem',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',justifyContent:'center'}}>
                ➕ Ajouter observation
              </button>
            </div>
          )}

          {tab==='economics'&&(
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.625rem'}}>
                {[
                  {label:'Production estimée',value:`${(crop.yieldEst*crop.area).toFixed(1)} t`,icon:'📦',color:'var(--accent)'},
                  {label:'Revenu prévu',value:crop.expectedRevenue?`$${crop.expectedRevenue.toLocaleString()}`:'—',icon:'💰',color:'var(--ok)'},
                  {label:'Jours de travail',value:crop.laborDays?`${crop.laborDays}j`:'—',icon:'👷',color:'var(--b700)'},
                ].map((s,i)=>(
                  <div key={i} style={{background:'var(--surface2)',borderRadius:'14px',padding:'12px',textAlign:'center',border:'1px solid var(--borderS)'}}>
                    <div style={{fontSize:'1.5rem',marginBottom:'4px'}}>{s.icon}</div>
                    <div style={{fontFamily:'Georgia,serif',fontSize:'1.25rem',fontWeight:700,color:s.color}}>{s.value}</div>
                    <div style={{fontSize:'0.65rem',color:'var(--text-muted)',marginTop:'2px'}}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{background:'var(--okBg)',borderRadius:'16px',padding:'1rem',border:'1px solid var(--ok)33'}}>
                <p style={{fontSize:'0.7rem',fontWeight:700,color:'var(--ok)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:'0.625rem'}}>SCÉNARIOS DE RENDEMENT</p>
                {[
                  {label:'Pessimiste (-25%)',value:`${(crop.yieldEst*0.75*crop.area).toFixed(1)} t`,color:'var(--err)'},
                  {label:'Réaliste',value:`${(crop.yieldEst*crop.area).toFixed(1)} t`,color:'var(--accent)',bold:true},
                  {label:'Optimiste (+20%)',value:`${(crop.yieldEst*1.2*crop.area).toFixed(1)} t`,color:'var(--ok)'},
                ].map((s,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid var(--ok)22'}}>
                    <span style={{fontSize:'0.8rem',color:'var(--text-muted)',fontWeight:s.bold?600:400}}>{s.label}</span>
                    <span style={{fontSize:'0.8rem',fontWeight:700,color:s.color}}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Add/Edit Form (multi-step) ────────────────────────────────
function CropForm({ initial, onSave, onCancel, editMode=false }: {
  initial: Partial<CropExtended>; onSave:(d:any)=>void; onCancel:()=>void; editMode?:boolean
}) {
  const [step,setStep] = useState(0)
  const [form,setForm] = useState<any>({
    type:'',variety:'',season:'Saison A 2024-2025',zone:'',area:'',
    plantingDate:'',harvestDate:'',sowingMethod:'direct',soilType:'',
    spacing:'',depth:'',seedQtyPerHa:'',seedSource:'',seedLotNumber:'',
    irrigation:'rain',fertiPlan:'',waterReq:'',responsible:'',
    status:'planned',health:90,yieldEst:'',expectedRevenue:'',laborDays:'',
    notes:'',certifications:[],...initial
  })
  const [errors,setErrors] = useState<Record<string,string>>({})
  const set=(k:string,v:any)=>setForm((p:any)=>({...p,[k]:v}))

  const STEPS = ['🌱 Culture','📐 Parcelle','🌾 Technique','💧 Intrants','📊 Prévisions']
  const selPT = PLANT_TYPES.find(p=>p.v===form.type)

  const validate=()=>{
    const e:Record<string,string>={}
    if(step===0){if(!form.type)e.type='Requis';if(!form.season)e.season='Requis'}
    if(step===1){if(!form.zone)e.zone='Requis';if(!form.area)e.area='Requis'}
    setErrors(e);return Object.keys(e).length===0
  }

  return (
    <div>
      {/* Step indicator */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',marginBottom:'1.25rem',overflowX:'auto',paddingBottom:'4px'}}>
        {STEPS.map((s,i)=>(
          <React.Fragment key={i}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flexShrink:0}}>
              <div style={{
                width:'28px',height:'28px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:'0.7rem',fontWeight:700,transition:'all .2s',
                background:i<step?'var(--ok)':i===step?'var(--accent)':'var(--beige-100)',
                color:i<=step?'white':'var(--text-light)',
                border:i===step?'2px solid var(--accent)':'2px solid transparent',
              }}>{i<step?'✓':i+1}</div>
              <span style={{fontSize:'0.6rem',color:i===step?'var(--accent)':i<step?'var(--ok)':'var(--text-light)',fontWeight:i===step?700:400,maxWidth:'55px',textAlign:'center',lineHeight:'1.2'}}>{s.split(' ').slice(1).join(' ')}</span>
            </div>
            {i<STEPS.length-1&&<div style={{height:'2px',width:'20px',background:i<step?'var(--ok)':'var(--beige-200)',borderRadius:'99px',marginBottom:'14px',flexShrink:0}}/>}
          </React.Fragment>
        ))}
      </div>

      <div style={{minHeight:'280px'}}>

        {/* Step 0 — Culture de base */}
        {step===0&&(
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div>
              <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'0.5rem'}}>Type de plante *</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px',maxHeight:'240px',overflowY:'auto'}}>
                {PLANT_TYPES.map(pt=>(
                  <button key={pt.v} onClick={()=>set('type',pt.v)}
                    style={{
                      display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',
                      padding:'8px 4px',borderRadius:'12px',border:`1.5px solid`,
                      cursor:'pointer',transition:'all .15s',textAlign:'center',
                      borderColor:form.type===pt.v?'var(--accent)':'var(--borderS)',
                      background:form.type===pt.v?'var(--accentS)':'var(--surface2)',
                      color:form.type===pt.v?'var(--accent)':'var(--text-muted)',
                    }}>
                    <span style={{fontSize:'1.5rem'}}>{pt.emoji}</span>
                    <span style={{fontSize:'0.62rem',fontWeight:600,lineHeight:'1.2'}}>{pt.v}</span>
                    <span style={{fontSize:'0.55rem',opacity:.6}}>{pt.cat}</span>
                  </button>
                ))}
              </div>
              {errors.type&&<p style={{fontSize:'0.7rem',color:'var(--err)',marginTop:'4px'}}>{errors.type}</p>}
            </div>
            {form.type&&(
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                <div>
                  <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Variété</label>
                  <select style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}}
                    value={form.variety} onChange={e=>set('variety',e.target.value)}>
                    <option value="">Sélectionner...</option>
                    {(VARIETIES[form.type]||['Locale','Autre']).map(v=><option key={v} value={v}>{v}</option>)}
                    <option value="Autre">Autre (spécifier)</option>
                  </select>
                </div>
                <div>
                  <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Saison agricole *</label>
                  <select style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}}
                    value={form.season} onChange={e=>set('season',e.target.value)}>
                    {['Saison A 2024-2025','Saison B 2025','Saison A 2025-2026','Hors-saison 2025','Annuel 2025'].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}
            {selPT&&(
              <div style={{background:'var(--surface2)',borderRadius:'14px',padding:'12px',border:'1px solid var(--borderS)'}}>
                <p style={{fontSize:'0.7rem',fontWeight:700,color:'var(--text-muted)',marginBottom:'6px'}}>FICHE RAPIDE — {form.type.toUpperCase()}</p>
                <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
                  {[['⏳',`Cycle ${selPT.cycle}j`],['💧',`Eau: ${selPT.water}`],['🪨',selPT.soil],['🌡️',selPT.temp]].map(([ic,txt],i)=>(
                    <span key={i} style={{fontSize:'0.72rem',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:'3px'}}>{ic} {txt}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 1 — Parcelle */}
        {step===1&&(
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div>
                <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Zone *</label>
                <select style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:`1.5px solid ${errors.zone?'var(--err)':'var(--border)'}`,background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}}
                  value={form.zone} onChange={e=>set('zone',e.target.value)}>
                  <option value="">Choisir zone...</option>
                  {['Zone A','Zone B','Zone C','Zone D','Zone E','Zone F','Nouvelle parcelle'].map(z=><option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Superficie (ha) *</label>
                <input type="number" step="0.1" placeholder="ex: 2.5"
                  style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:`1.5px solid ${errors.area?'var(--err)':'var(--border)'}`,background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}}
                  value={form.area} onChange={e=>set('area',e.target.value)}/>
              </div>
            </div>
            <div>
              <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Type de sol</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px'}}>
                {SOIL_TYPES.map(s=>(
                  <button key={s} onClick={()=>set('soilType',s)}
                    style={{padding:'7px',borderRadius:'10px',border:`1.5px solid ${form.soilType===s?'var(--accent)':'var(--borderS)'}`,background:form.soilType===s?'var(--accentS)':'var(--surface2)',color:form.soilType===s?'var(--accent)':'var(--text-muted)',fontSize:'0.72rem',cursor:'pointer',fontWeight:form.soilType===s?700:400}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div>
                <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Date de semis / plantation</label>
                <input type="date" style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}}
                  value={form.plantingDate} onChange={e=>set('plantingDate',e.target.value)}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Date de récolte prévue</label>
                <input type="date" style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}}
                  value={form.harvestDate} onChange={e=>set('harvestDate',e.target.value)}/>
              </div>
            </div>
            <div>
              <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Responsable de la culture</label>
              <select style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}}
                value={form.responsible} onChange={e=>set('responsible',e.target.value)}>
                <option value="">Choisir...</option>
                {['Richard Bunani','Marie Kahindo','Joséphine Nabintu','Emmanuel Kasereka','Jean-Baptiste Mutombo','Pierre Lwambo'].map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* Step 2 — Technique semis */}
        {step===2&&(
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div>
              <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'6px'}}>Méthode de semis</label>
              <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                {SOWING_METHODS.map(m=>(
                  <button key={m.v} onClick={()=>set('sowingMethod',m.v)}
                    style={{padding:'10px 12px',borderRadius:'12px',border:`1.5px solid ${form.sowingMethod===m.v?'var(--accent)':'var(--borderS)'}`,background:form.sowingMethod===m.v?'var(--accentS)':'var(--surface2)',color:form.sowingMethod===m.v?'var(--accent)':'var(--text-muted)',fontSize:'0.82rem',cursor:'pointer',textAlign:'left',fontWeight:form.sowingMethod===m.v?600:400}}>
                    {form.sowingMethod===m.v?'●':'○'} {m.l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1rem'}}>
              <div>
                <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Écartement</label>
                <input placeholder="ex: 30×50cm" style={{width:'100%',padding:'8px 10px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.82rem',color:'var(--text)'}}
                  value={form.spacing} onChange={e=>set('spacing',e.target.value)}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Profondeur</label>
                <input placeholder="ex: 3cm" style={{width:'100%',padding:'8px 10px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.82rem',color:'var(--text)'}}
                  value={form.depth} onChange={e=>set('depth',e.target.value)}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Densité (kg/ha)</label>
                <input type="number" placeholder="25" style={{width:'100%',padding:'8px 10px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.82rem',color:'var(--text)'}}
                  value={form.seedQtyPerHa} onChange={e=>set('seedQtyPerHa',e.target.value)}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div>
                <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Source des semences</label>
                <input placeholder="Fournisseur / provenance..." style={{width:'100%',padding:'8px 10px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.82rem',color:'var(--text)'}}
                  value={form.seedSource} onChange={e=>set('seedSource',e.target.value)}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>N° de lot semences</label>
                <input placeholder="LOT-2025-..." style={{width:'100%',padding:'8px 10px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.82rem',color:'var(--text)'}}
                  value={form.seedLotNumber} onChange={e=>set('seedLotNumber',e.target.value)}/>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Intrants */}
        {step===3&&(
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div>
              <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'6px'}}>Méthode d'irrigation</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
                {IRRIGATION_MODES.map(m=>(
                  <button key={m.v} onClick={()=>set('irrigation',m.v)}
                    style={{padding:'10px',borderRadius:'12px',border:`1.5px solid ${form.irrigation===m.v?'var(--accent)':'var(--borderS)'}`,background:form.irrigation===m.v?'var(--accentS)':'var(--surface2)',cursor:'pointer',textAlign:'left'}}>
                    <p style={{fontSize:'0.8rem',fontWeight:700,color:form.irrigation===m.v?'var(--accent)':'var(--text-muted)'}}>{m.l}</p>
                    <p style={{fontSize:'0.65rem',color:'var(--text-light)',marginTop:'2px'}}>{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Plan de fertilisation / Intrants prévus</label>
              <textarea rows={3} placeholder="Ex: Fumure de fond NPK 17-17-17 à 200kg/ha + Urée en top-dressing..."
                style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.82rem',color:'var(--text)',resize:'vertical'}}
                value={form.fertiPlan} onChange={e=>set('fertiPlan',e.target.value)}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Besoins en eau estimés</label>
              <input placeholder="ex: 500mm/saison, 2× arrosage/semaine..." style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.82rem',color:'var(--text)'}}
                value={form.waterReq} onChange={e=>set('waterReq',e.target.value)}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Statut initial</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px'}}>
                {['planned','sowing','growing'].map(st=>{
                  const sc=STATUS_CFG[st]
                  return (
                    <button key={st} onClick={()=>set('status',st)}
                      style={{padding:'8px',borderRadius:'10px',border:`1.5px solid ${form.status===st?sc.dot:'var(--borderS)'}`,background:form.status===st?sc.bg:'var(--surface2)',color:form.status===st?sc.color:'var(--text-muted)',fontSize:'0.75rem',cursor:'pointer',fontWeight:form.status===st?700:400}}>
                      {sc.icon} {sc.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4 — Prévisions */}
        {step===4&&(
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div>
                <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Rendement estimé (t/ha)</label>
                <input type="number" step="0.1" placeholder="ex: 4.2" style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}}
                  value={form.yieldEst} onChange={e=>set('yieldEst',e.target.value)}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Revenu attendu (USD)</label>
                <input type="number" placeholder="ex: 4500" style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}}
                  value={form.expectedRevenue} onChange={e=>set('expectedRevenue',e.target.value)}/>
              </div>
            </div>
            <div>
              <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Jours de main d'œuvre prévus</label>
              <input type="number" placeholder="ex: 30" style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)'}}
                value={form.laborDays} onChange={e=>set('laborDays',e.target.value)}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'var(--text-muted)',marginBottom:'4px'}}>Notes complémentaires</label>
              <textarea rows={3} placeholder="Observations, particularités du terrain, risques identifiés..." style={{width:'100%',padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.82rem',color:'var(--text)',resize:'vertical'}}
                value={form.notes} onChange={e=>set('notes',e.target.value)}/>
            </div>
            {/* Summary */}
            <div style={{background:'var(--okBg)',borderRadius:'14px',padding:'1rem',border:'1px solid var(--ok)33'}}>
              <p style={{fontSize:'0.7rem',fontWeight:700,color:'var(--ok)',marginBottom:'8px'}}>✅ RÉCAPITULATIF</p>
              {[
                ['Culture',`${PLANT_TYPES.find(p=>p.v===form.type)?.emoji||'🌱'} ${form.type||'—'} — ${form.variety||'—'}`],
                ['Saison',form.season||'—'],['Zone',form.zone||'—'],['Surface',form.area?`${form.area} ha`:'—'],
                ['Semis',form.plantingDate||'—'],['Récolte prévue',form.harvestDate||'—'],
                ['Méthode',SOWING_METHODS.find(s=>s.v===form.sowingMethod)?.l||'—'],
                ['Rendement estimé',form.yieldEst?`${form.yieldEst} t/ha`:'—'],
                ['Responsable',form.responsible||'—'],
              ].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid var(--ok)22'}}>
                  <span style={{fontSize:'0.75rem',color:'var(--text-muted)'}}>{k}</span>
                  <span style={{fontSize:'0.75rem',fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'1.25rem',paddingTop:'1rem',borderTop:'1px solid var(--borderS)'}}>
        <span style={{fontSize:'0.7rem',color:'var(--text-light)'}}>Étape {step+1}/5</span>
        <div style={{display:'flex',gap:'0.625rem'}}>
          {step>0
            ? <button onClick={()=>setStep(s=>s-1)} style={{padding:'8px 16px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',color:'var(--text)',fontSize:'0.82rem',fontWeight:600,cursor:'pointer'}}>← Précédent</button>
            : <button onClick={onCancel} style={{padding:'8px 16px',borderRadius:'10px',border:'1px solid var(--border)',background:'var(--surface2)',color:'var(--text)',fontSize:'0.82rem',fontWeight:600,cursor:'pointer'}}>Annuler</button>
          }
          {step<4
            ? <button onClick={()=>{if(validate())setStep(s=>s+1)}} disabled={step===0&&!form.type} style={{padding:'8px 16px',borderRadius:'10px',background:'var(--accent)',color:'white',border:'none',fontSize:'0.82rem',fontWeight:600,cursor:'pointer',opacity:step===0&&!form.type?.5:1}}>Suivant →</button>
            : <button onClick={()=>onSave(form)} style={{padding:'8px 16px',borderRadius:'10px',background:'var(--ok)',color:'white',border:'none',fontSize:'0.82rem',fontWeight:600,cursor:'pointer'}}>✓ {editMode?'Modifier':'Enregistrer la culture'}</button>
          }
        </div>
      </div>
    </div>
  )
}

// ── Crop Card ────────────────────────────────────────────────
function CropCard({ crop, onView, onEdit, onDelete, index }: {
  crop: CropExtended; onView:()=>void; onEdit:()=>void; onDelete:()=>void; index:number
}) {
  const [hovered,setHovered] = useState(false)
  const sc = STATUS_CFG[crop.status]||STATUS_CFG.growing
  const pt = PLANT_TYPES.find(p=>p.v===crop.type)
  const daysTillHarvest = crop.harvestDate?Math.ceil((new Date(crop.harvestDate).getTime()-Date.now())/86400000):null

  return (
    <div
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{
        background:'white',borderRadius:'20px',border:'1px solid var(--borderS)',
        overflow:'hidden',cursor:'pointer',transition:'all .25s cubic-bezier(.34,1.56,.64,1)',
        transform:hovered?'translateY(-4px) scale(1.01)':'translateY(0) scale(1)',
        boxShadow:hovered?'0 12px 40px rgba(46,31,16,.12)':'0 2px 8px rgba(46,31,16,.06)',
        animation:`fadeUp .5s ease both`,animationDelay:`${index*.06}s`,
      }}
      onClick={onView}>

      {/* Top color stripe */}
      <div style={{height:'4px',background:`linear-gradient(90deg,${sc.dot},${sc.dot}88)`}}/>

      <div style={{padding:'1rem'}}>
        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'0.75rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:'44px',height:'44px',borderRadius:'14px',background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.6rem',transition:'transform .2s',transform:hovered?'rotate(-5deg) scale(1.1)':'none'}}>
              {pt?.emoji||'🌱'}
            </div>
            <div>
              <h3 style={{fontFamily:'Georgia,serif',fontSize:'1rem',fontWeight:700,lineHeight:1.2}}>{crop.type}</h3>
              <p style={{fontSize:'0.7rem',color:'var(--text-muted)',marginTop:'1px'}}>{crop.variety||'—'} · {crop.zone}</p>
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'4px'}}>
            <span style={{background:sc.bg,color:sc.color,fontSize:'0.65rem',fontWeight:700,padding:'3px 8px',borderRadius:'99px'}}>{sc.icon} {sc.label}</span>
            {crop.season&&<SeasonPill season={crop.season}/>}
          </div>
        </div>

        {/* Health ring + stats */}
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'0.75rem'}}>
          <div style={{position:'relative',flexShrink:0}}>
            <Ring pct={crop.health} size={44} stroke={3} color={crop.health>80?'var(--ok)':crop.health>60?'var(--warn)':'var(--err)'}/>
            <span style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:'0.6rem',fontWeight:700,color:'var(--text)'}}>{crop.health}%</span>
          </div>
          <div style={{flex:1,display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px'}}>
            {[
              {l:'Surface',v:`${crop.area} ha`},
              {l:'Rendement',v:`${crop.yieldEst}t/ha`},
              {l:'Méthode',v:SOWING_METHODS.find(s=>s.v===crop.sowingMethod)?.l?.split(' ').slice(-1)[0]||'—'},
              {l:'Irrigation',v:IRRIGATION_MODES.find(m=>m.v===crop.irrigation)?.l?.split(' ')[1]||'—'},
            ].map((s,i)=>(
              <div key={i} style={{background:'var(--surface2)',borderRadius:'8px',padding:'5px 7px'}}>
                <p style={{fontSize:'0.6rem',color:'var(--text-light)'}}>{s.l}</p>
                <p style={{fontSize:'0.72rem',fontWeight:600,color:'var(--text)'}}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dates & harvest countdown */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.75rem'}}>
          <div style={{fontSize:'0.7rem',color:'var(--text-muted)',display:'flex',alignItems:'center',gap:'4px'}}>
            <span>📅 Semé le {crop.plantingDate||'—'}</span>
          </div>
          {daysTillHarvest!==null&&(
            <span style={{
              fontSize:'0.65rem',fontWeight:700,padding:'3px 8px',borderRadius:'99px',
              background:daysTillHarvest<0?'var(--errBg)':daysTillHarvest<14?'var(--warnBg)':'var(--okBg)',
              color:daysTillHarvest<0?'var(--err)':daysTillHarvest<14?'var(--warn)':'var(--ok)',
            }}>
              {daysTillHarvest<0?`${Math.abs(daysTillHarvest)}j en retard`:daysTillHarvest===0?'Aujourd\'hui!':daysTillHarvest<14?`⚡ ${daysTillHarvest}j`:`🌾 ${daysTillHarvest}j`}
            </span>
          )}
        </div>

        {/* Responsible */}
        {crop.responsible&&(
          <p style={{fontSize:'0.7rem',color:'var(--text-muted)',marginBottom:'0.75rem',display:'flex',alignItems:'center',gap:'4px'}}>
            👤 <strong>{crop.responsible}</strong>
          </p>
        )}

        {/* Actions */}
        <div style={{display:'flex',gap:'6px',paddingTop:'0.625rem',borderTop:'1px solid var(--borderS)'}}>
          <button onClick={e=>{e.stopPropagation();onView()}} style={{flex:1,padding:'7px',borderRadius:'10px',background:'var(--surface2)',border:'none',fontSize:'0.72rem',fontWeight:600,cursor:'pointer',color:'var(--text)',display:'flex',alignItems:'center',justifyContent:'center',gap:'4px'}}>
            <Eye size={12}/> Détails
          </button>
          <button onClick={e=>{e.stopPropagation();onEdit()}} style={{flex:1,padding:'7px',borderRadius:'10px',background:'var(--accentS)',border:'1px solid var(--beige-300)',fontSize:'0.72rem',fontWeight:600,cursor:'pointer',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',gap:'4px'}}>
            <Edit size={12}/> Modifier
          </button>
          <button onClick={e=>{e.stopPropagation();onDelete()}} style={{padding:'7px 10px',borderRadius:'10px',background:'var(--errBg)',border:'none',fontSize:'0.72rem',fontWeight:600,cursor:'pointer',color:'var(--err)',display:'flex',alignItems:'center',gap:'4px'}}>
            <Trash2 size={12}/>
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function CropsPage() {
  const { crops, addCrop, updateCrop, deleteCrop } = useStore()
  const [search,setSearch] = useState('')
  const [statusF,setStatusF] = useState('')
  const [catF,setCatF] = useState('')
  const [viewMode,setViewMode] = useState<'cards'|'table'|'calendar'>('cards')
  const [showAdd,setShowAdd] = useState(false)
  const [editCrop,setEditCrop] = useState<CropExtended|null>(null)
  const [viewCrop,setViewCrop] = useState<CropExtended|null>(null)
  const [deleteId,setDeleteId] = useState<string|null>(null)
  const [deleting,setDeleting] = useState(false)

  // Cast store crops to extended type
  const cropsExt: CropExtended[] = useMemo(()=>(crops as any[]).map(c=>({
    sowingMethod:'direct',soilType:'Argilo-limoneux',seedQtyPerHa:0,seedLotNumber:'',
    spacing:'30×50cm',depth:'3cm',fertiPlan:'',pesticideUsed:'',waterReq:'',
    expectedRevenue:0,actualYield:0,laborDays:0,treatments:[],observations:[],
    season:'Saison A 2024-2025',latitude:'',longitude:'',certifications:[],...c
  })),[crops])

  const filtered = useMemo(()=>cropsExt.filter(c=>{
    const q=search.toLowerCase()
    const matchQ = !q||[c.type,c.variety,c.zone,c.responsible].join(' ').toLowerCase().includes(q)
    const matchS = !statusF||c.status===statusF
    const matchC = !catF||(PLANT_TYPES.find(p=>p.v===c.type)?.cat===catF)
    return matchQ&&matchS&&matchC
  }),[cropsExt,search,statusF,catF])

  const stats = useMemo(()=>({
    total: crops.length,
    growing: crops.filter(c=>['growing','flowering','fruiting','sowing'].includes(c.status)).length,
    ready: crops.filter(c=>c.status==='ready').length,
    totalArea: crops.reduce((s,c)=>s+c.area,0),
    avgHealth: Math.round(crops.reduce((s,c)=>s+c.health,0)/Math.max(crops.length,1)),
    estimated: crops.reduce((s,c)=>s+c.yieldEst*c.area,0),
  }),[crops])

  const categories = [...new Set(PLANT_TYPES.map(p=>p.cat))]

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'1.25rem',animation:'fadeUp .4s ease'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem'}}>
        <div>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:'2rem',fontWeight:700,color:'var(--text)',display:'flex',alignItems:'center',gap:'10px'}}>
            🌱 Cultures & Plantations
          </h1>
          <p style={{fontSize:'0.85rem',color:'var(--text-muted)',marginTop:'3px'}}>{crops.length} cultures · {stats.totalArea.toFixed(1)} ha · {stats.estimated.toFixed(1)} t estimées</p>
        </div>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          {[['cards','🃏'],['table','📋'],['calendar','📅']].map(([m,ic])=>(
            <button key={m} onClick={()=>setViewMode(m as any)}
              style={{padding:'8px 12px',borderRadius:'10px',border:`1.5px solid ${viewMode===m?'var(--accent)':'var(--border)'}`,background:viewMode===m?'var(--accentS)':'white',color:viewMode===m?'var(--accent)':'var(--text-muted)',fontSize:'0.8rem',fontWeight:viewMode===m?700:400,cursor:'pointer',display:'flex',alignItems:'center',gap:'4px'}}>
              {ic} {m==='cards'?'Cartes':m==='table'?'Tableau':'Calendrier'}
            </button>
          ))}
          <button onClick={()=>setShowAdd(true)}
            style={{padding:'8px 16px',borderRadius:'10px',background:'var(--accent)',color:'white',border:'none',fontSize:'0.85rem',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',boxShadow:'0 4px 12px rgba(140,110,63,.3)',transition:'all .15s'}}
            onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-1px)')}
            onMouseLeave={e=>(e.currentTarget.style.transform='none')}>
            <Plus size={16}/> Nouvelle culture
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'0.75rem'}}>
        {[
          {label:'Total',value:stats.total,icon:'🌱',color:'var(--text)',delay:.05},
          {label:'En croissance',value:stats.growing,icon:'🌿',color:'var(--ok)',delay:.1},
          {label:'Prêtes à récolter',value:stats.ready,icon:'🌾',color:'var(--accent)',delay:.15},
          {label:'Surface totale',value:`${stats.totalArea.toFixed(1)} ha`,icon:'📐',color:'var(--b700)',delay:.2},
          {label:'Production estimée',value:`${stats.estimated.toFixed(1)} t`,icon:'📦',color:'var(--warn)',delay:.25},
        ].map((s,i)=>(
          <div key={i} style={{background:'white',borderRadius:'16px',padding:'1rem',border:'1px solid var(--borderS)',boxShadow:'0 2px 8px rgba(46,31,16,.05)',animation:'fadeUp .5s ease both',animationDelay:`${s.delay}s`}}>
            <div style={{width:'32px',height:'32px',borderRadius:'10px',background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',marginBottom:'8px'}}>{s.icon}</div>
            <div style={{fontFamily:'Georgia,serif',fontSize:'1.6rem',fontWeight:700,color:s.color,lineHeight:1}}>{s.value}</div>
            <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginTop:'4px'}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
        {/* Search */}
        <div style={{position:'relative',flex:1,minWidth:'200px'}}>
          <Search size={14} style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:'var(--text-light)'}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Rechercher culture, zone, variété, responsable..."
            style={{width:'100%',padding:'9px 12px 9px 32px',borderRadius:'12px',border:'1px solid var(--border)',background:'var(--surface2)',fontSize:'0.85rem',color:'var(--text)',outline:'none'}}/>
          {search&&<button onClick={()=>setSearch('')} style={{position:'absolute',right:'8px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-light)'}}><X size={14}/></button>}
        </div>
        {/* Status pills */}
        <div style={{display:'flex',gap:'5px',overflowX:'auto',flexWrap:'wrap'}}>
          {[['','Tous',...Object.entries(STATUS_CFG).map(([v,c])=>[v,`${c.icon} ${c.label}`])]].flat().reduce((acc:any[],item:any,i)=>{
            if(i%2===0&&i<Object.keys(STATUS_CFG).length*2+2)acc.push(item);return acc
          },[...([['','🗂️ Tous'],['planned','📋 Planifiée'],['growing','🌿 Croissance'],['ready','🌾 Prête'],['harvested','✅ Récoltée'],['lost','💀 Perdue']])]
          ).map(([v,l])=>(
            <button key={v} onClick={()=>setStatusF(v)}
              style={{padding:'6px 12px',borderRadius:'99px',border:'1.5px solid',fontSize:'0.72rem',fontWeight:statusF===v?700:500,cursor:'pointer',transition:'all .12s',
                      borderColor:statusF===v?'var(--accent)':'var(--border)',
                      background:statusF===v?'var(--accent)':'white',
                      color:statusF===v?'white':'var(--text-muted)',flexShrink:0}}>
              {l}
            </button>
          ))}
        </div>
        {/* Category filter */}
        <select value={catF} onChange={e=>setCatF(e.target.value)}
          style={{padding:'8px 12px',borderRadius:'10px',border:'1px solid var(--border)',background:'white',fontSize:'0.8rem',color:'var(--text)',cursor:'pointer'}}>
          <option value="">Toutes catégories</option>
          {categories.map(c=><option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Content */}
      {filtered.length===0?(
        <div style={{textAlign:'center',padding:'4rem',background:'white',borderRadius:'20px',border:'1px solid var(--borderS)'}}>
          <div style={{fontSize:'4rem',marginBottom:'1rem'}}>🌱</div>
          <h3 style={{fontFamily:'Georgia,serif',fontSize:'1.5rem',fontWeight:700,marginBottom:'0.5rem'}}>Aucune culture trouvée</h3>
          <p style={{fontSize:'0.85rem',color:'var(--text-muted)',marginBottom:'1.25rem'}}>Modifiez vos filtres ou enregistrez votre première culture</p>
          <button onClick={()=>setShowAdd(true)} style={{padding:'10px 20px',borderRadius:'12px',background:'var(--accent)',color:'white',border:'none',fontSize:'0.85rem',fontWeight:600,cursor:'pointer'}}>
            <Plus size={14} style={{display:'inline',marginRight:'6px'}}/> Nouvelle culture
          </button>
        </div>
      ) : viewMode==='cards' ? (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1rem'}}>
          {filtered.map((crop,i)=>(
            <CropCard key={crop.id} crop={crop} index={i}
              onView={()=>setViewCrop(crop)}
              onEdit={()=>setEditCrop(crop)}
              onDelete={()=>setDeleteId(crop.id)}/>
          ))}
          {/* Add card */}
          <div onClick={()=>setShowAdd(true)}
            style={{background:'var(--surface2)',borderRadius:'20px',border:'2px dashed var(--beige-300)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2.5rem',cursor:'pointer',minHeight:'200px',transition:'all .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--accentS)';e.currentTarget.style.borderColor='var(--accent)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='var(--surface2)';e.currentTarget.style.borderColor='var(--beige-300)'}}>
            <div style={{width:'44px',height:'44px',borderRadius:'50%',background:'var(--beige-200)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'0.75rem'}}>
              <Plus size={20} style={{color:'var(--accent)'}}/>
            </div>
            <p style={{fontWeight:600,color:'var(--text-muted)',fontSize:'0.85rem'}}>Ajouter une culture</p>
          </div>
        </div>
      ) : viewMode==='table' ? (
        <div style={{background:'white',borderRadius:'20px',border:'1px solid var(--borderS)',overflow:'hidden',boxShadow:'0 2px 8px rgba(46,31,16,.06)'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead style={{background:'var(--beige-50)',borderBottom:'1px solid var(--border)'}}>
              <tr>
                {['Culture','Variété','Zone','Surface','Semis','Récolte prévue','Méthode','Irrigation','Santé','Statut','Actions'].map(h=>(
                  <th key={h} style={{padding:'10px 12px',fontSize:'0.7rem',fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'.05em',textAlign:'left',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((crop,i)=>{
                const sc=STATUS_CFG[crop.status]||STATUS_CFG.growing
                const pt=PLANT_TYPES.find(p=>p.v===crop.type)
                return (
                  <tr key={crop.id} style={{borderBottom:'1px solid var(--beige-50)',transition:'background .1s',cursor:'pointer',animation:`fadeIn .3s ease ${i*.04}s both`}}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--beige-50)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                    onClick={()=>setViewCrop(crop)}>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <span style={{fontSize:'1.2rem'}}>{pt?.emoji||'🌱'}</span>
                        <span style={{fontSize:'0.85rem',fontWeight:700}}>{crop.type}</span>
                      </div>
                    </td>
                    <td style={{padding:'10px 12px',fontSize:'0.82rem',color:'var(--text-muted)'}}>{crop.variety||'—'}</td>
                    <td style={{padding:'10px 12px',fontSize:'0.82rem'}}>{crop.zone}</td>
                    <td style={{padding:'10px 12px',fontSize:'0.82rem',fontWeight:600}}>{crop.area} ha</td>
                    <td style={{padding:'10px 12px',fontSize:'0.78rem',fontFamily:'monospace',color:'var(--text-muted)'}}>{crop.plantingDate||'—'}</td>
                    <td style={{padding:'10px 12px',fontSize:'0.78rem',fontFamily:'monospace',color:'var(--text-muted)'}}>{crop.harvestDate||'—'}</td>
                    <td style={{padding:'10px 12px',fontSize:'0.75rem',color:'var(--text-muted)'}}>{SOWING_METHODS.find(s=>s.v===crop.sowingMethod)?.l||'—'}</td>
                    <td style={{padding:'10px 12px',fontSize:'0.75rem'}}>{IRRIGATION_MODES.find(m=>m.v===crop.irrigation)?.l||'—'}</td>
                    <td style={{padding:'10px 12px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                        <div style={{width:'50px',height:'5px',borderRadius:'99px',background:'var(--beige-100)',overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${crop.health}%`,background:crop.health>80?'var(--ok)':crop.health>60?'var(--warn)':'var(--err)',borderRadius:'99px'}}/>
                        </div>
                        <span style={{fontSize:'0.72rem',fontWeight:700}}>{crop.health}%</span>
                      </div>
                    </td>
                    <td style={{padding:'10px 12px'}}>
                      <span style={{background:sc.bg,color:sc.color,fontSize:'0.65rem',fontWeight:700,padding:'3px 8px',borderRadius:'99px'}}>{sc.icon} {sc.label}</span>
                    </td>
                    <td style={{padding:'10px 12px'}} onClick={e=>e.stopPropagation()}>
                      <div style={{display:'flex',gap:'4px'}}>
                        <button onClick={()=>setViewCrop(crop)} style={{padding:'5px',borderRadius:'8px',background:'transparent',border:'none',cursor:'pointer',color:'var(--text-muted)',display:'flex'}}><Eye size={14}/></button>
                        <button onClick={()=>setEditCrop(crop)} style={{padding:'5px',borderRadius:'8px',background:'transparent',border:'none',cursor:'pointer',color:'var(--accent)',display:'flex'}}><Edit size={14}/></button>
                        <button onClick={()=>setDeleteId(crop.id)} style={{padding:'5px',borderRadius:'8px',background:'transparent',border:'none',cursor:'pointer',color:'var(--err)',display:'flex'}}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{background:'white',borderRadius:'20px',border:'1px solid var(--borderS)',padding:'1.25rem',boxShadow:'0 2px 8px rgba(46,31,16,.06)'}}>
          <h3 style={{fontFamily:'Georgia,serif',fontSize:'1.1rem',fontWeight:700,marginBottom:'1rem',display:'flex',alignItems:'center',gap:'8px'}}>
            📅 Calendrier Cultural Annuel
          </h3>
          <div style={{marginBottom:'0.75rem',padding:'0.75rem',background:'var(--warnBg)',borderRadius:'12px',borderLeft:'3px solid var(--warn)',fontSize:'0.8rem',color:'var(--warn)'}}>
            💡 Visualisation des cycles de toutes vos cultures sur 12 mois
          </div>
          <CropCalendar crops={cropsExt}/>
        </div>
      )}

      {/* Add Modal */}
      {showAdd&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div className="modal" style={{maxWidth:'640px'}}>
            <div className="modal-header" style={{background:'var(--beige-50)'}}>
              <h3 style={{fontFamily:'Georgia,serif',fontSize:'1.25rem',fontWeight:700}}>🌱 Enregistrer une nouvelle culture</h3>
              <button style={{background:'transparent',border:'none',cursor:'pointer',padding:'6px'}} onClick={()=>setShowAdd(false)}>✕</button>
            </div>
            <div className="modal-body">
              <CropForm initial={{}} onSave={d=>{
                addCrop({type:d.type,variety:d.variety,zone:d.zone,area:parseFloat(d.area)||0,plantingDate:d.plantingDate,harvestDate:d.harvestDate,status:d.status,health:90,yieldEst:parseFloat(d.yieldEst)||0,responsible:d.responsible,irrigation:d.irrigation,seedSource:d.seedSource,notes:d.notes})
                setShowAdd(false);toast(`✅ Culture ${d.type} enregistrée`)
              }} onCancel={()=>setShowAdd(false)}/>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editCrop&&(
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setEditCrop(null)}>
          <div className="modal" style={{maxWidth:'640px'}}>
            <div className="modal-header" style={{background:'var(--beige-50)'}}>
              <h3 style={{fontFamily:'Georgia,serif',fontSize:'1.25rem',fontWeight:700}}>✏️ Modifier — {editCrop.type}</h3>
              <button style={{background:'transparent',border:'none',cursor:'pointer',padding:'6px'}} onClick={()=>setEditCrop(null)}>✕</button>
            </div>
            <div className="modal-body">
              <CropForm initial={editCrop} onSave={d=>{
                updateCrop(editCrop.id,{type:d.type,variety:d.variety,zone:d.zone,area:parseFloat(d.area)||editCrop.area,plantingDate:d.plantingDate,harvestDate:d.harvestDate,status:d.status,health:d.health||editCrop.health,yieldEst:parseFloat(d.yieldEst)||editCrop.yieldEst,responsible:d.responsible,irrigation:d.irrigation,seedSource:d.seedSource,notes:d.notes})
                setEditCrop(null);toast(`✏️ Culture ${d.type} modifiée`)
              }} onCancel={()=>setEditCrop(null)} editMode/>
            </div>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {viewCrop&&<CropDetail crop={viewCrop} onClose={()=>setViewCrop(null)} onEdit={()=>{setEditCrop(viewCrop);setViewCrop(null)}}/>}

      {/* Delete Confirm */}
      <ConfirmDelete open={!!deleteId} title="Supprimer cette culture" message="Cette culture et toutes ses données seront définitivement supprimées."
        onConfirm={()=>{setDeleting(true);setTimeout(()=>{deleteCrop(deleteId!);setDeleteId(null);setDeleting(false);toast('🗑️ Culture supprimée','info')},600)}}
        onCancel={()=>setDeleteId(null)} loading={deleting}/>
    </div>
  )
}
