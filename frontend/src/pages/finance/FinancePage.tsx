import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Download, TrendingUp, TrendingDown } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useStore, Transaction } from '@/store/useStore'
import { ConfirmDelete, Modal, TableActions, EmptyState, Pagination, SearchBar, StatCard, toast } from '@/components/ui/crud'
import { clsx } from 'clsx'

const INC_CATS=['milk_eggs','animal_sales','crop_sales','processing','subsidies','other_income']
const EXP_CATS=['salaries','animal_feed','vet_medicines','seeds','agrochemicals','fuel_energy','maintenance','land_rent','equipment','taxes','services']
const CAT_LABELS:Record<string,string>={
  milk_eggs:'Lait/Œufs',animal_sales:'Vente animaux',crop_sales:'Vente récoltes',
  processing:'Transformation',subsidies:'Subventions',other_income:'Autres revenus',
  salaries:'Salaires',animal_feed:'Alimentation animaux',vet_medicines:'Médicaments vét.',
  seeds:'Semences/Plants',agrochemicals:'Produits agrochimiques',fuel_energy:'Carburant/Énergie',
  maintenance:'Maintenance',land_rent:'Location terrain',equipment:'Équipements',
  taxes:'Taxes/Impôts',services:'Services externes',
}
const PMETHODS=['cash','mpesa','airtel','bank','cheque','other']
const STATUS_CFG:Record<string,{label:string;color:string}>={paid:{label:'Payé',color:'badge-ok'},pending:{label:'En attente',color:'badge-warn'},overdue:{label:'En retard',color:'badge-err'},cancelled:{label:'Annulé',color:'badge-dim'}}
const PIE_COLORS=['#8c6e3f','#4a7c59','#2c5282','#a16207','#a13333','#5e4b8b','#2d7f7f']

type FD=Omit<Transaction,'id'|'createdAt'>
const EMPTY:FD={type:'income',category:'milk_eggs',description:'',amount:0,date:new Date().toISOString().split('T')[0],paymentMethod:'cash',status:'paid',reference:'',notes:''}

function TransactionForm({initial,onSave,onCancel}:{initial:FD;onSave:(d:FD)=>void;onCancel:()=>void}) {
  const [form,setForm]=useState<FD>(initial)
  const set=(k:keyof FD,v:any)=>setForm(p=>({...p,[k]:v}))
  const cats=form.type==='income'?INC_CATS:EXP_CATS

  return (
    <div className="space-y-4">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
        {[['income','↑ Recette'],['expense','↓ Dépense']].map(([v,l])=>(
          <button key={v} onClick={()=>{set('type',v);set('category',v==='income'?'milk_eggs':'salaries')}}
            className="py-3 rounded-xl border text-sm font-semibold transition-all"
            style={{background:form.type===v?(v==='income'?'var(--okBg)':'var(--errBg)'):'var(--surface2)',
                    borderColor:form.type===v?(v==='income'?'var(--ok)':'var(--err)'):'var(--borderS)',
                    color:form.type===v?(v==='income'?'var(--ok)':'var(--err)'):'var(--text-muted)'}}>
            {l}
          </button>
        ))}
      </div>
      <div><label className="label">Description *</label><input className="input" placeholder="Description de la transaction..." value={form.description} onChange={e=>set('description',e.target.value)}/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
        <div>
          <label className="label">Catégorie</label>
          <select className="input" value={form.category} onChange={e=>set('category',e.target.value)}>
            {cats.map(c=><option key={c} value={c}>{CAT_LABELS[c]||c}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Montant (USD) *</label>
          <input className="input" type="number" step="0.01" placeholder="0.00" value={form.amount||''} onChange={e=>set('amount',parseFloat(e.target.value)||0)}/>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
        <div>
          <label className="label">Date</label>
          <input className="input" type="date" value={form.date} onChange={e=>set('date',e.target.value)}/>
        </div>
        <div>
          <label className="label">Mode de paiement</label>
          <select className="input" value={form.paymentMethod} onChange={e=>set('paymentMethod',e.target.value)}>
            {[['cash','Espèces'],['mpesa','M-Pesa'],['airtel','Airtel Money'],['bank','Virement'],['cheque','Chèque'],['other','Autre']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
        <div>
          <label className="label">Statut</label>
          <select className="input" value={form.status} onChange={e=>set('status',e.target.value)}>
            {Object.entries(STATUS_CFG).map(([v,c])=><option key={v} value={v}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Référence / N° facture</label>
          <input className="input" placeholder="FAC-001..." value={form.reference} onChange={e=>set('reference',e.target.value)}/>
        </div>
      </div>
      <div><label className="label">Notes</label><textarea className="input" rows={2} placeholder="Notes complémentaires..." value={form.notes} onChange={e=>set('notes',e.target.value)}/></div>
      <div style={{display:'flex',gap:'0.75rem',justifyContent:'flex-end',paddingTop:'1rem',borderTop:'1px solid var(--borderS)'}}>
        <button className="btn-secondary" onClick={onCancel}>{'Annuler'}</button>
        <button className="btn-primary" onClick={()=>{if(form.description&&form.amount>0)onSave(form);else toast('Description et montant requis','error')}}>✓ Enregistrer</button>
      </div>
    </div>
  )
}

export default function FinancePage() {
  const {t}=useTranslation()
  const {transactions,addTransaction,updateTransaction,deleteTransaction}=useStore()
  const [search,setSearch]=useState('')
  const [typeF,setTypeF]=useState('')
  const [statusF,setStatusF]=useState('')
  const [page,setPage]=useState(1)
  const PER=15
  const [activeTab,setActiveTab]=useState('overview')
  const [showAdd,setShowAdd]=useState(false)
  const [editTx,setEditTx]=useState<Transaction|null>(null)
  const [deleteId,setDeleteId]=useState<string|null>(null)
  const [deleting,setDeleting]=useState(false)

  const rev   = useMemo(()=>transactions.filter(t=>t.type==='income'&&t.status==='paid').reduce((s,t)=>s+t.amount,0),[transactions])
  const exp   = useMemo(()=>transactions.filter(t=>t.type==='expense'&&t.status==='paid').reduce((s,t)=>s+t.amount,0),[transactions])
  const profit= rev-exp
  const pending=transactions.filter(t=>t.status==='pending').length

  const filtered=useMemo(()=>transactions.filter(t=>{
    const q=search.toLowerCase()
    return (!q||t.description.toLowerCase().includes(q)||t.reference.toLowerCase().includes(q))
      &&(!typeF||t.type===typeF)&&(!statusF||t.status===statusF)
  }),[transactions,search,typeF,statusF])
  const paged=filtered.slice((page-1)*PER,page*PER)

  // Charts data
  const months=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
  const chartData=months.map((m,i)=>({month:m,revenus:Math.round(3000+Math.random()*3000),depenses:Math.round(2000+Math.random()*2000)}))
  const expBycat=EXP_CATS.map((c,i)=>({name:CAT_LABELS[c]||c,value:Math.round(200+Math.random()*800)})).filter(x=>x.value>300)

  const TABS=[{id:'overview',label:'Vue d\'ensemble'},{id:'transactions',label:`Transactions (${transactions.length})`},{id:'budget',label:'Budget'}]

  return (
    <div className="space-y-6">
      <div className="page-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem'}}>
        <div><h1 className="page-title">💰 {t('finance.title')}</h1><p className="page-sub">{pending} transactions en attente de paiement</p></div>
        <div style={{display:'flex',gap:'0.5rem'}}>
          <button className="btn-secondary btn-sm"><Download className="w-4 h-4"/> Export</button>
          <button className="btn-primary" onClick={()=>setShowAdd(true)}><Plus className="w-4 h-4"/> Ajouter transaction</button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem'}}>
        <StatCard label="Revenus (total)" value={`$${rev.toLocaleString()}`} icon="📈" delay="delay-1" color="var(--ok)"/>
        <StatCard label="Dépenses (total)" value={`$${exp.toLocaleString()}`} icon="📉" delay="delay-2" color="var(--err)"/>
        <StatCard label="Bénéfice net" value={`$${profit.toLocaleString()}`} icon="💰" delay="delay-3" color="var(--accent)"/>
        <StatCard label="En attente" value={pending} icon="⏳" delay="delay-4" color="var(--warn)"/>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(tab=><button key={tab.id} className={clsx('tab',activeTab===tab.id&&'active')} onClick={()=>setActiveTab(tab.id)}>{tab.label}</button>)}
      </div>

      {activeTab==='overview'&&(
        <div className="space-y-4">
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1rem'}}>
            <div className="card">
              <h3 className="font-display font-semibold text-lg mb-4">Évolution Revenus / Dépenses</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--ok)" stopOpacity={0.2}/><stop offset="95%" stopColor="var(--ok)" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--err)" stopOpacity={0.15}/><stop offset="95%" stopColor="var(--err)" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--borderS)"/>
                  <XAxis dataKey="month" tick={{fontSize:11,fill:'var(--text-muted)'}}/>
                  <YAxis tick={{fontSize:11,fill:'var(--text-muted)'}}/>
                  <Tooltip contentStyle={{borderRadius:'14px',border:'1px solid var(--borderS)',fontSize:12}} formatter={(v:number)=>[`$${v.toLocaleString()}`,'']}/>
                  <Area type="monotone" dataKey="revenus" stroke="var(--ok)" strokeWidth={2} fill="url(#gr)" name="Revenus"/>
                  <Area type="monotone" dataKey="depenses" stroke="var(--err)" strokeWidth={2} fill="url(#gd)" name="Dépenses"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h3 className="font-display font-semibold text-lg mb-4">Répartition dépenses</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={expBycat} cx="50%" cy="50%" outerRadius={65} dataKey="value" paddingAngle={2}>
                    {expBycat.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius:'12px',fontSize:11}} formatter={(v:number)=>[`$${v}`,'']}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {expBycat.slice(0,4).map((e,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                    <div style={{width:'8px',height:'8px',borderRadius:'50%',background:PIE_COLORS[i%PIE_COLORS.length],flexShrink:0}}/>
                    <span className="text-xs flex-1" style={{color:'var(--text-muted)'}}>{e.name}</span>
                    <span className="text-xs font-semibold">${e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab==='transactions'&&(
        <div className="space-y-4">
          <SearchBar value={search} onChange={v=>{setSearch(v);setPage(1)}} placeholder="Description, référence..."
            extra={<div style={{display:'flex',gap:'0.5rem'}}>
              <select className="input" style={{width:'130px'}} value={typeF} onChange={e=>{setTypeF(e.target.value);setPage(1)}}><option value="">Tous types</option><option value="income">Recettes</option><option value="expense">Dépenses</option></select>
              <select className="input" style={{width:'140px'}} value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1)}}><option value="">Tous statuts</option>{Object.entries(STATUS_CFG).map(([v,c])=><option key={v} value={v}>{c.label}</option>)}</select>
            </div>}
          />
          {filtered.length===0?<EmptyState icon="💰" title="Aucune transaction" action={<button className="btn-primary" onClick={()=>setShowAdd(true)}><Plus className="w-4 h-4"/> Ajouter</button>}/>:(
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Date</th><th>Description</th><th>Catégorie</th><th>Montant</th><th>Paiement</th><th>Statut</th><th>Référence</th><th>Actions</th></tr></thead>
                <tbody>
                  {paged.map((tx,i)=>(
                    <tr key={tx.id} className="anim-fade-in" style={{animationDelay:`${i*.03}s`}}>
                      <td className="text-xs font-mono" style={{color:'var(--text-muted)'}}>{tx.date}</td>
                      <td className="font-medium text-sm" style={{maxWidth:'200px'}}><span className="truncate-2">{tx.description}</span></td>
                      <td><span className="badge badge-dim">{CAT_LABELS[tx.category]||tx.category}</span></td>
                      <td className="font-bold" style={{color:tx.type==='income'?'var(--ok)':'var(--err)'}}>
                        {tx.type==='income'?'+':'-'}${tx.amount.toLocaleString()}
                      </td>
                      <td className="text-xs capitalize" style={{color:'var(--text-muted)'}}>{tx.paymentMethod}</td>
                      <td><span className={clsx('badge',(STATUS_CFG[tx.status]||STATUS_CFG.paid).color)}>{(STATUS_CFG[tx.status]||STATUS_CFG.paid).label}</span></td>
                      <td className="text-xs font-mono" style={{color:'var(--text-light)'}}>{tx.reference||'—'}</td>
                      <td><TableActions onEdit={()=>setEditTx(tx)} onDelete={()=>setDeleteId(tx.id)}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{padding:'0.75rem 1.25rem',borderTop:'1px solid var(--borderS)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <p className="text-xs" style={{color:'var(--text-muted)'}}>Affichage {Math.min((page-1)*PER+1,filtered.length)}–{Math.min(page*PER,filtered.length)} sur {filtered.length}</p>
                <div style={{display:'flex',gap:'0.25rem'}}>
                  {page>1&&<button className="btn-ghost btn-sm" onClick={()=>setPage(p=>p-1)}>←</button>}
                  {page*PER<filtered.length&&<button className="btn-ghost btn-sm" onClick={()=>setPage(p=>p+1)}>→</button>}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab==='budget'&&(
        <div className="card">
          <h3 className="font-display font-semibold text-lg mb-5">Budget annuel 2025 vs Réalisé</h3>
          <div className="space-y-4">
            {[
              {cat:'Salaires',budget:45000,actual:38400},{cat:'Alimentation animaux',budget:18000,actual:14400},
              {cat:'Vétérinaire',budget:9600,actual:exp},{cat:'Semences & Intrants',budget:12000,actual:6480},
              {cat:'Carburant',budget:6000,actual:4560},{cat:'Maintenance',budget:4800,actual:2640},
            ].map((item,i)=>{
              const pct=Math.min(100,Math.round(item.actual/item.budget*100))
              return (
                <div key={i}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.375rem'}}>
                    <span className="text-sm font-medium">{item.cat}</span>
                    <span className="text-xs" style={{color:'var(--text-muted)'}}>${item.actual.toLocaleString()} / ${item.budget.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{width:`${pct}%`,background:pct>90?'var(--err)':pct>75?'var(--warn)':'var(--accent)'}}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Ajouter une transaction">
        <TransactionForm initial={{...EMPTY}} onSave={d=>{addTransaction(d);setShowAdd(false);toast(`✅ Transaction ${d.type==='income'?'recette':'dépense'} enregistrée`)}} onCancel={()=>setShowAdd(false)}/>
      </Modal>
      <Modal open={!!editTx} onClose={()=>setEditTx(null)} title="Modifier la transaction" subtitle={editTx?.description}>
        {editTx&&<TransactionForm initial={{type:editTx.type,category:editTx.category,description:editTx.description,amount:editTx.amount,date:editTx.date,paymentMethod:editTx.paymentMethod,status:editTx.status,reference:editTx.reference,notes:editTx.notes}}
          onSave={d=>{updateTransaction(editTx.id,d);setEditTx(null);toast('✏️ Transaction modifiée')}} onCancel={()=>setEditTx(null)}/>}
      </Modal>
      <ConfirmDelete open={!!deleteId} title="Supprimer la transaction" message="Cette transaction sera supprimée définitivement."
        onConfirm={()=>{setDeleting(true);setTimeout(()=>{deleteTransaction(deleteId!);setDeleteId(null);setDeleting(false);toast('🗑️ Transaction supprimée','info')},600)}}
        onCancel={()=>setDeleteId(null)} loading={deleting}/>
    </div>
  )
}
