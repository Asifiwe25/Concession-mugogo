import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Clock } from 'lucide-react'
import { useStore, Task } from '@/store/useStore'
import { ConfirmDelete, Modal, TableActions, EmptyState, StatCard, toast } from '@/components/ui/crud'
import { clsx } from 'clsx'

const COLS = [
  {id:'backlog',    label:'📥 Backlog',       bg:'#f7f0e4'},
  {id:'todo',       label:'📋 À faire',        bg:'#ebf4ff'},
  {id:'in_progress',label:'▶️ En cours',       bg:'#fff7ed'},
  {id:'review',     label:'🔍 En révision',    bg:'#f5f3ff'},
  {id:'done',       label:'✅ Terminé',        bg:'#edf5f0'},
]
const PRIO_CFG:Record<string,{label:string;color:string;dot:string}> = {
  urgent:{label:'Urgent', color:'badge-err',   dot:'var(--err)'},
  high:  {label:'Haute',  color:'badge-warn', dot:'var(--warn)'},
  normal:{label:'Normal', color:'badge-dim',  dot:'var(--b700)'},
  low:   {label:'Faible', color:'badge-dim', dot:'var(--text-light)'},
}
const CAT_EMOJI:Record<string,string> = {livestock:'🐄',crops:'🌱',stock:'📦',hr:'👤',finance:'💰',infrastructure:'🔧',maintenance:'⚙️',other:'📋'}

type FD = Omit<Task,'id'|'createdAt'|'updatedAt'>
const EMPTY:FD = {title:'',description:'',category:'livestock',priority:'normal',status:'todo',assignee:'',dueDate:'',zone:'',estimatedHours:0,notes:''}

function TaskForm({initial,onSave,onCancel}:{initial:FD;onSave:(d:FD)=>void;onCancel:()=>void}) {
  const [form,setForm]=useState<FD>(initial)
  const set=(k:keyof FD,v:any)=>setForm(p=>({...p,[k]:v}))
  return (
    <div className="space-y-4">
      <div><label className="label">Titre *</label><input className="input" placeholder="Titre de la tâche..." value={form.title} onChange={e=>set('title',e.target.value)}/></div>
      <div><label className="label">Description</label><textarea className="input" rows={3} placeholder="Instructions détaillées..." value={form.description} onChange={e=>set('description',e.target.value)}/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
        <div>
          <label className="label">Catégorie</label>
          <select className="input" value={form.category} onChange={e=>set('category',e.target.value)}>
            {Object.entries(CAT_EMOJI).map(([v,e])=><option key={v} value={v}>{e} {v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Priorité</label>
          <select className="input" value={form.priority} onChange={e=>set('priority',e.target.value)}>
            {Object.entries(PRIO_CFG).map(([v,c])=><option key={v} value={v}>{c.label}</option>)}
          </select>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
        <div>
          <label className="label">Statut initial</label>
          <select className="input" value={form.status} onChange={e=>set('status',e.target.value)}>
            {COLS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date limite</label>
          <input className="input" type="date" value={form.dueDate} onChange={e=>set('dueDate',e.target.value)}/>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
        <div>
          <label className="label">Assigné à</label>
          <select className="input" value={form.assignee} onChange={e=>set('assignee',e.target.value)}>
            <option value="">Choisir...</option>
            {['Jean-Baptiste Mutombo','Marie Kahindo','Pierre Lwambo','David Shabani','Joséphine Nabintu','Emmanuel Kasereka'].map(n=><option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Zone concernée</label>
          <select className="input" value={form.zone} onChange={e=>set('zone',e.target.value)}>
            <option value="">Zone...</option>
            {['Zone A','Zone B','Zone C','Zone D','Zone E','Zone F','Poulailler','Toutes'].map(z=><option key={z} value={z}>{z}</option>)}
          </select>
        </div>
      </div>
      <div><label className="label">Heures estimées</label><input className="input" type="number" placeholder="0" value={form.estimatedHours||''} onChange={e=>set('estimatedHours',parseFloat(e.target.value)||0)}/></div>
      <div style={{display:'flex',gap:'0.75rem',justifyContent:'flex-end',paddingTop:'1rem',borderTop:'1px solid var(--borderS)'}}>
        <button className="btn-secondary" onClick={onCancel}>{'Annuler'}</button>
        <button className="btn-primary" onClick={()=>{if(form.title.trim())onSave(form);else toast('Le titre est obligatoire','error')}}>✓ Enregistrer</button>
      </div>
    </div>
  )
}

function TaskCard({task,onEdit,onDelete,onMove}:{task:Task;onEdit:()=>void;onDelete:()=>void;onMove:(s:string)=>void}) {
  const pc=PRIO_CFG[task.priority]||PRIO_CFG.normal
  const isOverdue=task.dueDate&&new Date(task.dueDate)<new Date()&&task.status!=='done'
  return (
    <div className="kanban-card">
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'0.5rem',marginBottom:'0.5rem'}}>
        <p className="text-sm font-semibold leading-tight flex-1" style={{color:'var(--text)'}}>{task.title}</p>
        <span className="text-base flex-shrink-0">{CAT_EMOJI[task.category]||'📋'}</span>
      </div>
      {task.description&&<p className="text-xs mb-2" style={{color:'var(--text-muted)'}}>{task.description.slice(0,80)}{task.description.length>80?'...':''}</p>}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.5rem'}}>
        <span className={clsx('badge',pc.color)}>{pc.label}</span>
        {task.assignee&&<span className="text-xs" style={{color:'var(--text-muted)'}}>{task.assignee.split(' ')[0]}</span>}
      </div>
      {task.dueDate&&(
        <div style={{display:'flex',alignItems:'center',gap:'0.25rem',marginBottom:'0.5rem'}}>
          <Clock className="w-3 h-3" style={{color:isOverdue?'var(--err)':'var(--text-light)'}}/>
          <span className="text-xs" style={{color:isOverdue?'var(--err)':'var(--text-light)'}}>{task.dueDate}{isOverdue?' ⚠️ En retard':''}</span>
        </div>
      )}
      <div style={{display:'flex',gap:'0.25rem',paddingTop:'0.5rem',borderTop:'1px solid var(--borderS)'}}>
        <select className="text-xs rounded-lg border px-2 py-1 flex-1" style={{background:'var(--surface2)',borderColor:'var(--borderS)',color:'var(--text-muted)',fontSize:'0.7rem'}}
          value={task.status} onChange={e=>onMove(e.target.value)}>
          {COLS.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <button className="btn-ghost" style={{padding:'0.25rem'}} onClick={onEdit}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
        <button className="btn-ghost" style={{padding:'0.25rem',color:'var(--err)'}} onClick={onDelete}><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
      </div>
    </div>
  )
}

export default function TasksPage() {
  const {t}=useTranslation()
  const {tasks,addTask,updateTask,deleteTask,moveTask}=useStore()
  const [showAdd,setShowAdd]=useState(false)
  const [editTask,setEditTask]=useState<Task|null>(null)
  const [deleteId,setDeleteId]=useState<string|null>(null)
  const [deleting,setDeleting]=useState(false)
  const [filterPrio,setFilterPrio]=useState('')

  const filtered=useMemo(()=>tasks.filter(t=>!filterPrio||t.priority===filterPrio),[tasks,filterPrio])
  const done=tasks.filter(t=>t.status==='done').length
  const overdue=tasks.filter(t=>t.dueDate&&new Date(t.dueDate)<new Date()&&t.status!=='done').length

  return (
    <div className="space-y-5">
      <div className="page-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem'}}>
        <div><h1 className="page-title">🧩 {t('tasks.title')}</h1><p className="page-sub">{done}/{tasks.length} terminées · {overdue} en retard</p></div>
        <button className="btn-primary" onClick={()=>setShowAdd(true)}><Plus className="w-4 h-4"/> Nouvelle tâche</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'0.75rem'}}>
        {COLS.map(c=>{
          const count=filtered.filter(t=>t.status===c.id).length
          return <div key={c.id} className="card text-center" style={{padding:'0.75rem'}}>
            <p className="text-xl font-display font-bold">{count}</p>
            <p className="text-xs mt-0.5" style={{color:'var(--text-muted)'}}>{c.label}</p>
          </div>
        })}
      </div>

      <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
        <span className="text-sm" style={{color:'var(--text-muted)'}}>Filtrer :</span>
        {[['','Toutes'],...Object.entries(PRIO_CFG).map(([v,c])=>[v,c.label])].map(([v,l])=>(
          <button key={v} onClick={()=>setFilterPrio(v)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
            style={{background:filterPrio===v?'var(--accent)':'white',color:filterPrio===v?'white':'var(--text-muted)',borderColor:filterPrio===v?'var(--accent)':'var(--borderS)'}}>{l}</button>
        ))}
      </div>

      <div style={{display:'flex',gap:'1rem',overflowX:'auto',paddingBottom:'1rem'}}>
        {COLS.map(col=>{
          const colTasks=filtered.filter(t=>t.status===col.id)
          return (
            <div key={col.id} style={{minWidth:'260px',borderRadius:'20px',padding:'0.875rem',background:col.bg,flexShrink:0}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.875rem'}}>
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{background:'white',color:'var(--text-muted)'}}>{colTasks.length}</span>
              </div>
              <div className="space-y-2">
                {colTasks.map(task=>(
                  <TaskCard key={task.id} task={task}
                    onEdit={()=>setEditTask(task)}
                    onDelete={()=>setDeleteId(task.id)}
                    onMove={s=>{ moveTask(task.id,s); toast(`Tâche déplacée vers "${COLS.find(c=>c.id===s)?.label}"`) }}/>
                ))}
              </div>
              <button className="w-full mt-2 py-2 rounded-xl border-2 border-dashed text-xs font-medium transition-all flex items-center justify-center gap-1"
                style={{borderColor:'rgba(140,110,63,.3)',color:'var(--text-light)'}}
                onClick={()=>{ setShowAdd(true) }}>
                <Plus className="w-3 h-3"/> Ajouter
              </button>
            </div>
          )
        })}
      </div>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Nouvelle tâche">
        <TaskForm initial={{...EMPTY}} onSave={d=>{addTask(d);setShowAdd(false);toast(`✅ Tâche "${d.title}" créée`)}} onCancel={()=>setShowAdd(false)}/>
      </Modal>
      <Modal open={!!editTask} onClose={()=>setEditTask(null)} title="Modifier la tâche" subtitle={editTask?.title}>
        {editTask&&<TaskForm initial={{title:editTask.title,description:editTask.description,category:editTask.category,priority:editTask.priority,status:editTask.status,assignee:editTask.assignee,dueDate:editTask.dueDate,zone:editTask.zone,estimatedHours:editTask.estimatedHours,notes:editTask.notes}}
          onSave={d=>{updateTask(editTask.id,d);setEditTask(null);toast(`✏️ Tâche "${d.title}" modifiée`)}} onCancel={()=>setEditTask(null)}/>}
      </Modal>
      <ConfirmDelete open={!!deleteId} title="Supprimer la tâche" message="Cette tâche sera définitivement supprimée."
        onConfirm={()=>{setDeleting(true);setTimeout(()=>{deleteTask(deleteId!);setDeleteId(null);setDeleting(false);toast('🗑️ Tâche supprimée','info')},600)}}
        onCancel={()=>setDeleteId(null)} loading={deleting}/>
    </div>
  )
}
