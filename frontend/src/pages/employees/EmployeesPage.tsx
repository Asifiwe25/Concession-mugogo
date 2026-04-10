import { PageReport } from '@/components/ui/PageReport'
import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Download } from 'lucide-react'
import { useStore, Employee } from '@/store/useStore'
import { ConfirmDelete, Modal, StepWizard, TableActions, EmptyState, Pagination, SearchBar, StatCard, toast } from '@/components/ui/crud'
import { clsx } from 'clsx'

const ROLES: Record<string,string> = {
  director:'Directeur', livestock_manager:'Resp. Élevage', farm_manager:'Resp. Agricole',
  hr_manager:'RH Manager', accountant:'Comptable', vet:'Vétérinaire',
  shepherd:'Berger', farmer:'Cultivateur', driver:'Chauffeur', guard:'Gardien', other:'Autre',
}
const ROLE_COLORS: Record<string,string> = {
  director:'badge-dim', livestock_manager:'badge-ok', farm_manager:'badge-ok',
  hr_manager:'badge-acc', accountant:'badge-dim', vet:'badge-dim',
  shepherd:'badge-dim', farmer:'badge-dim', driver:'badge-dim', guard:'badge-dim', other:'badge-dim',
}
const STATUS_COLORS: Record<string,string> = { active:'badge-ok', on_leave:'badge-warn', suspended:'badge-err', archived:'badge-dim' }
const STATUS_LABELS: Record<string,string> = { active:'Actif', on_leave:'Congé', suspended:'Suspendu', archived:'Archivé' }

type FormData = Omit<Employee,'id'|'createdAt'|'updatedAt'>
const EMPTY: FormData = { firstName:'', lastName:'', localName:'', phone:'', email:'', role:'shepherd', contractType:'cdi', salary:0, zone:'', hireDate:'', status:'active', photo:'', score:80 }

function EmpForm({ initial, onSave, onCancel, editMode=false }: { initial:FormData; onSave:(d:FormData)=>void; onCancel:()=>void; editMode?:boolean }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(initial)
  const [errors, setErrors] = useState<Record<string,string>>({})
  const set = (k: keyof FormData, v: any) => setForm(p => ({...p,[k]:v}))
  const STEPS = editMode ? ['👤 Identité','📋 Contrat','✅ Confirmation'] : ['👤 Identité','📞 Contact','📋 Contrat','✅ Confirmation']
  const maxStep = editMode ? 2 : 3

  const validate = () => {
    const e: Record<string,string> = {}
    if (!form.firstName.trim()) e.firstName = 'Requis'
    if (!form.lastName.trim())  e.lastName  = 'Requis'
    if (!form.phone.trim())     e.phone     = 'Requis'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <div>
      <StepWizard steps={STEPS} current={step} />
      <div style={{minHeight:'220px'}}>
        {step === 0 && (
          <div className="space-y-4">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div>
                <label className="label">Prénom *</label>
                <input className={clsx('input',errors.firstName&&'error')} placeholder="Prénom..." value={form.firstName} onChange={e=>set('firstName',e.target.value)}/>
                {errors.firstName&&<p className="text-xs mt-1" style={{color:'var(--err)'}}>{errors.firstName}</p>}
              </div>
              <div>
                <label className="label">Nom *</label>
                <input className={clsx('input',errors.lastName&&'error')} placeholder="Nom..." value={form.lastName} onChange={e=>set('lastName',e.target.value)}/>
                {errors.lastName&&<p className="text-xs mt-1" style={{color:'var(--err)'}}>{errors.lastName}</p>}
              </div>
            </div>
            <div>
              <label className="label">Surnom local</label>
              <input className="input" placeholder="ex: JB, Chef P..." value={form.localName} onChange={e=>set('localName',e.target.value)}/>
            </div>
            <div>
              <label className="label">Statut</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0.5rem'}}>
                {Object.entries(STATUS_LABELS).map(([v,l])=>(
                  <button key={v} onClick={()=>set('status',v)} className="py-2 px-2 rounded-xl border text-xs font-medium transition-all"
                    style={{background:form.status===v?'var(--accentS)':'var(--surface2)',borderColor:form.status===v?'var(--accent)':'var(--borderS)',color:form.status===v?'var(--accent)':'var(--text-muted)'}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {((step===1&&!editMode)||(step===1&&editMode)) && (
          <div className="space-y-4">
            {(!editMode||step===1) && (
              <>
                <div>
                  <label className="label">Téléphone *</label>
                  <input className={clsx('input',errors.phone&&'error')} placeholder="+243 81..." value={form.phone} onChange={e=>set('phone',e.target.value)}/>
                  {errors.phone&&<p className="text-xs mt-1" style={{color:'var(--err)'}}>{errors.phone}</p>}
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" placeholder="email@..." value={form.email} onChange={e=>set('email',e.target.value)}/>
                </div>
              </>
            )}
            {editMode && (
              <div className="space-y-4">
                <div>
                  <label className="label">Rôle *</label>
                  <select className="input" value={form.role} onChange={e=>set('role',e.target.value)}>
                    {Object.entries(ROLES).map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                  <div>
                    <label className="label">Type contrat</label>
                    <select className="input" value={form.contractType} onChange={e=>set('contractType',e.target.value)}>
                      {[['cdi','CDI'],['cdd','CDD'],['seasonal','Saisonnier'],['volunteer','Bénévole'],['intern','Stagiaire']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Salaire (USD)</label>
                    <input className="input" type="number" placeholder="0" value={form.salary||''} onChange={e=>set('salary',parseFloat(e.target.value)||0)}/>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                  <div>
                    <label className="label">Zone</label>
                    <select className="input" value={form.zone} onChange={e=>set('zone',e.target.value)}>
                      <option value="">Zone...</option>
                      {['Zone A','Zone B','Zone C','Zone D','Zone E','Zone F','Poulailler','Toutes'].map(z=><option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Date embauche</label>
                    <input className="input" type="date" value={form.hireDate} onChange={e=>set('hireDate',e.target.value)}/>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step===2&&!editMode && (
          <div className="space-y-4">
            <div>
              <label className="label">Rôle *</label>
              <select className="input" value={form.role} onChange={e=>set('role',e.target.value)}>
                {Object.entries(ROLES).map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div>
                <label className="label">Type contrat</label>
                <select className="input" value={form.contractType} onChange={e=>set('contractType',e.target.value)}>
                  {[['cdi','CDI'],['cdd','CDD'],['seasonal','Saisonnier'],['volunteer','Bénévole'],['intern','Stagiaire']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Salaire (USD)</label>
                <input className="input" type="number" placeholder="0" value={form.salary||''} onChange={e=>set('salary',parseFloat(e.target.value)||0)}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div>
                <label className="label">Zone</label>
                <select className="input" value={form.zone} onChange={e=>set('zone',e.target.value)}>
                  <option value="">Zone...</option>
                  {['Zone A','Zone B','Zone C','Zone D','Zone E','Zone F','Poulailler','Toutes'].map(z=><option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Date embauche</label>
                <input className="input" type="date" value={form.hireDate} onChange={e=>set('hireDate',e.target.value)}/>
              </div>
            </div>
          </div>
        )}

        {/* Last step — summary */}
        {((step===3&&!editMode)||(step===2&&editMode)) && (
          <div className="p-4 rounded-2xl space-y-2" style={{background:'var(--okBg)',border:'1px solid var(--ok)'}}>
            <p className="font-semibold text-sm mb-3" style={{color:'var(--ok)'}}>✅ Récapitulatif</p>
            {[
              ['Nom complet',`${form.firstName} ${form.lastName}${form.localName?` (${form.localName})`:''}`],
              ['Téléphone',form.phone||'—'],['Email',form.email||'—'],
              ['Rôle',ROLES[form.role]||form.role],
              ['Contrat',form.contractType.toUpperCase()],
              ['Salaire',form.salary?`$${form.salary}/mois`:'—'],
              ['Zone',form.zone||'—'],['Statut',STATUS_LABELS[form.status]],
            ].map(([k,v])=>(
              <div key={k} className="flex justify-between py-1 text-sm" style={{borderBottom:'1px solid rgba(74,124,89,.2)'}}>
                <span style={{color:'var(--text-muted)'}}>{k}</span>
                <span className="font-semibold">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'1.5rem',paddingTop:'1rem',borderTop:'1px solid var(--borderS)'}}>
        <span className="text-xs" style={{color:'var(--text-light)'}}>Étape {step+1}/{STEPS.length}</span>
        <div style={{display:'flex',gap:'0.75rem'}}>
          {step>0 ? <button className="btn-secondary" onClick={()=>setStep(s=>s-1)}>← Précédent</button>
                  : <button className="btn-secondary" onClick={onCancel}>Annuler</button>}
          {step<maxStep
            ? <button className="btn-primary" onClick={()=>setStep(s=>s+1)} disabled={step===0&&(!form.firstName||!form.lastName)}>Suivant →</button>
            : <button className="btn-primary" onClick={()=>{ if(validate()) onSave(form); else toast('Champs obligatoires manquants','error')}}>✓ {editMode?'Modifier':'Créer'}</button>
          }
        </div>
      </div>
    </div>
  )
}

export default function EmployeesPage() {
  const { t } = useTranslation()
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useStore()
  const [search, setSearch] = useState('')
  const [roleF, setRoleF] = useState('')
  const [statusF, setStatusF] = useState('')
  const [page, setPage] = useState(1)
  const PER = 10
  const [showAdd, setShowAdd] = useState(false)
  const [editEmp, setEditEmp] = useState<Employee|null>(null)
  const [viewEmp, setViewEmp] = useState<Employee|null>(null)
  const [deleteId, setDeleteId] = useState<string|null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(()=>employees.filter(e=>{
    const q=search.toLowerCase()
    return (!q||`${e.firstName} ${e.lastName} ${e.localName} ${e.phone}`.toLowerCase().includes(q))
      && (!roleF||e.role===roleF) && (!statusF||e.status===statusF)
  }),[employees,search,roleF,statusF])
  const paged = filtered.slice((page-1)*PER, page*PER)

  return (
    <div className="space-y-6">
      <div className="page-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'0.75rem'}}>
        <div>
          <h1 className="page-title">👨‍🌾 {t('employees.title')}</h1>
          <p className="page-sub">{employees.length} employés · {employees.filter(e=>e.status==='active').length} actifs</p>
        </div>
        <div style={{display:'flex',gap:'0.5rem'}}>
          <button className="btn-secondary btn-sm"><Download className="w-4 h-4"/> Export</button>
          <button className="btn-primary" onClick={()=>setShowAdd(true)}><Plus className="w-4 h-4"/> Ajouter employé</button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem'}}>
        <StatCard label="Total" value={employees.length} icon="👥" delay="delay-1"/>
        <StatCard label="Actifs" value={employees.filter(e=>e.status==='active').length} icon="✅" delay="delay-2" color="var(--ok)"/>
        <StatCard label="En congé" value={employees.filter(e=>e.status==='on_leave').length} icon="🏖️" delay="delay-3" color="var(--warn)"/>
        <StatCard label="Score moyen" value={`${Math.round(employees.reduce((s,e)=>s+e.score,0)/Math.max(employees.length,1))}%`} icon="⭐" delay="delay-4" color="var(--accent)"/>
      </div>

      <SearchBar value={search} onChange={v=>{setSearch(v);setPage(1)}} placeholder="Nom, téléphone..."
        extra={<div style={{display:'flex',gap:'0.5rem'}}>
          <select className="input" style={{width:'160px'}} value={roleF} onChange={e=>{setRoleF(e.target.value);setPage(1)}}>
            <option value="">Tous les rôles</option>
            {Object.entries(ROLES).map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
          <select className="input" style={{width:'130px'}} value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1)}}>
            <option value="">Statuts</option>
            {Object.entries(STATUS_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>}
      />

      {filtered.length===0 ? (
        <EmptyState icon="👥" title="Aucun employé trouvé" desc="Ajoutez votre premier employé"
          action={<button className="btn-primary" onClick={()=>setShowAdd(true)}><Plus className="w-4 h-4"/> Ajouter</button>}/>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Employé</th><th>Rôle</th><th>Téléphone</th><th>Zone</th><th>Contrat</th><th>Statut</th><th>Score</th><th>Actions</th></tr></thead>
            <tbody>
              {paged.map((emp,i)=>(
                <tr key={emp.id} className="anim-fade-in" style={{animationDelay:`${i*.04}s`}}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{background:'var(--accentS)',color:'var(--accent)'}}>{emp.firstName.charAt(0)}</div>
                      <div>
                        <p className="font-semibold text-sm">{emp.firstName} {emp.lastName}</p>
                        {emp.localName&&<p className="text-xs italic" style={{color:'var(--text-muted)'}}>"{emp.localName}"</p>}
                      </div>
                    </div>
                  </td>
                  <td><span className={clsx('badge',ROLE_COLORS[emp.role]||'badge-dim')}>{ROLES[emp.role]||emp.role}</span></td>
                  <td className="font-mono text-xs">{emp.phone}</td>
                  <td className="text-sm" style={{color:'var(--text-muted)'}}>{emp.zone||'—'}</td>
                  <td>
                    <p className="text-xs font-semibold">{emp.contractType.toUpperCase()}</p>
                    <p className="text-xs" style={{color:'var(--text-muted)'}}>${emp.salary}/mois</p>
                  </td>
                  <td><span className={clsx('badge',STATUS_COLORS[emp.status]||'badge-dim')}>{STATUS_LABELS[emp.status]}</span></td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                      <div className="progress-track" style={{width:'50px'}}>
                        <div className="progress-fill" style={{width:`${emp.score}%`,background:emp.score>=85?'var(--ok)':emp.score>=70?'var(--warn)':'var(--err)'}}/>
                      </div>
                      <span className="text-xs font-semibold">{emp.score}%</span>
                    </div>
                  </td>
                  <td><TableActions onView={()=>setViewEmp(emp)} onEdit={()=>setEditEmp(emp)} onDelete={()=>setDeleteId(emp.id)}/></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination total={filtered.length} page={page} perPage={PER} onPage={setPage}/>
        </div>
      )}

      {/* Add */}
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Ajouter un employé">
        <EmpForm initial={{...EMPTY}} onSave={d=>{addEmployee(d);setShowAdd(false);toast(`✅ ${d.firstName} ${d.lastName} ajouté(e)`)}} onCancel={()=>setShowAdd(false)}/>
      </Modal>

      {/* Edit */}
      <Modal open={!!editEmp} onClose={()=>setEditEmp(null)} title="Modifier l'employé" subtitle={editEmp?`${editEmp.firstName} ${editEmp.lastName}`:''}>
        {editEmp&&<EmpForm initial={{firstName:editEmp.firstName,lastName:editEmp.lastName,localName:editEmp.localName,phone:editEmp.phone,email:editEmp.email,role:editEmp.role,contractType:editEmp.contractType,salary:editEmp.salary,zone:editEmp.zone,hireDate:editEmp.hireDate,status:editEmp.status,photo:editEmp.photo,score:editEmp.score}}
          onSave={d=>{updateEmployee(editEmp.id,d);setEditEmp(null);toast(`✏️ ${d.firstName} ${d.lastName} modifié(e)`)}}
          onCancel={()=>setEditEmp(null)} editMode/>}
      </Modal>

      {/* View */}
      {viewEmp&&(
        <div className="fixed inset-0 z-50 flex" style={{background:'rgba(46,31,16,.4)',backdropFilter:'blur(8px)'}} onClick={e=>e.target===e.currentTarget&&setViewEmp(null)}>
          <div className="ml-auto w-full max-w-lg bg-white h-full overflow-y-auto" style={{animation:'slideIn .3s ease',boxShadow:'var(--shadowLg)'}}>
            <div className="p-6" style={{background:'var(--beige-50)',borderBottom:'1px solid var(--borderS)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-bold" style={{background:'var(--accentS)',color:'var(--accent)'}}>{viewEmp.firstName.charAt(0)}</div>
                  <div>
                    <h2 className="font-display text-2xl font-bold">{viewEmp.firstName} {viewEmp.lastName}</h2>
                    {viewEmp.localName&&<p className="text-sm italic" style={{color:'var(--text-muted)'}}>"{viewEmp.localName}"</p>}
                  </div>
                </div>
                <div style={{display:'flex',gap:'0.5rem'}}>
                  <button className="btn-primary btn-sm" onClick={()=>{setEditEmp(viewEmp);setViewEmp(null)}}>✏️ Modifier</button>
                  <button className="btn-ghost" style={{padding:'0.4rem'}} onClick={()=>setViewEmp(null)}>✕</button>
                </div>
              </div>
              <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                <span className={clsx('badge',ROLE_COLORS[viewEmp.role]||'badge-dim')}>{ROLES[viewEmp.role]||viewEmp.role}</span>
                <span className={clsx('badge',STATUS_COLORS[viewEmp.status]||'badge-dim')}>{STATUS_LABELS[viewEmp.status]}</span>
                {viewEmp.zone&&<span className="badge badge-dim">📍 {viewEmp.zone}</span>}
              </div>
            </div>
            <div className="p-6 space-y-3">
              {[['📞 Téléphone',viewEmp.phone||'—'],['📧 Email',viewEmp.email||'—'],['📋 Contrat',viewEmp.contractType.toUpperCase()],['💰 Salaire',`$${viewEmp.salary}/mois`],['📅 Embauche',viewEmp.hireDate||'—']].map(([k,v])=>(
                <div key={k} className="flex justify-between py-3 text-sm" style={{borderBottom:'1px solid var(--borderS)'}}>
                  <span style={{color:'var(--text-muted)'}}>{k}</span>
                  <span className="font-semibold">{v}</span>
                </div>
              ))}
              <div className="card mt-4">
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}>
                  <span className="text-sm font-medium">Score de performance</span>
                  <span className="font-bold" style={{color:'var(--accent)'}}>{viewEmp.score}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{width:`${viewEmp.score}%`,background:viewEmp.score>=85?'var(--ok)':viewEmp.score>=70?'var(--warn)':'var(--err)'}}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete */}
      <ConfirmDelete open={!!deleteId} title="Supprimer l'employé" message="Cette action est irréversible."
        onConfirm={()=>{setDeleting(true);setTimeout(()=>{deleteEmployee(deleteId!);setDeleteId(null);setDeleting(false);toast('🗑️ Employé supprimé','info')},600)}}
        onCancel={()=>setDeleteId(null)} loading={deleting}/>
    </div>
  )
}
