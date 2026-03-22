import React, { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, X, Info, Loader2, Edit, Trash2 } from 'lucide-react'
import { clsx } from 'clsx'

type ToastType = 'success'|'error'|'info'|'warning'
interface IToast { id:string; type:ToastType; message:string }
let _fn: ((m:string,t?:ToastType)=>void)|null = null

export function ToastContainer() {
  const [toasts, setToasts] = useState<IToast[]>([])
  useEffect(() => {
    _fn = (message, type='success') => {
      const id = Date.now().toString()
      setToasts(p => [...p,{id,type,message}])
      setTimeout(() => setToasts(p => p.filter(t=>t.id!==id)), 3500)
    }
    return () => { _fn = null }
  }, [])

  const colors: Record<ToastType, string> = {
    success: 'var(--ok)', error: 'var(--err)', info: 'var(--accent)', warning: 'var(--warn)'
  }

  return (
    <div style={{ position:'fixed', top:'16px', right:'16px', zIndex:100, display:'flex', flexDirection:'column', gap:'8px', maxWidth:'340px', pointerEvents:'none' }}>
      {toasts.map(t => (
        <div key={t.id} className="anim-slide-in"
          style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', borderRadius:'14px', background:'white', border:`1px solid var(--borderS)`, boxShadow:'var(--shadowLg)', pointerEvents:'all', borderLeft:`3px solid ${colors[t.type]}` }}>
          <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:colors[t.type], flexShrink:0 }}/>
          <span style={{ fontSize:'.84rem', fontWeight:500, flex:1, color:'var(--text)' }}>{t.message}</span>
          <button onClick={() => setToasts(p=>p.filter(x=>x.id!==t.id))} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--light)', padding:'2px' }}>
            <X size={12}/>
          </button>
        </div>
      ))}
    </div>
  )
}

export function toast(message:string, type:ToastType='success') { if(_fn) _fn(message,type) }

export function ConfirmDelete({open,title,message,onConfirm,onCancel,loading}:{open:boolean;title:string;message:string;onConfirm:()=>void;onCancel:()=>void;loading?:boolean}) {
  if(!open) return null
  return (
    <div className="modal-overlay" style={{zIndex:60}}>
      <div className="modal" style={{maxWidth:'400px'}}>
        <div className="modal-body" style={{textAlign:'center',padding:'2.5rem 2rem'}}>
          <div style={{width:'52px',height:'52px',borderRadius:'50%',background:'var(--errBg)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem',border:'1px solid var(--err)'}}>
            <AlertTriangle size={22} style={{color:'var(--err)'}}/>
          </div>
          <h3 className="font-display" style={{fontSize:'1.2rem',fontWeight:700,marginBottom:'.5rem'}}>{title}</h3>
          <p style={{fontSize:'.85rem',color:'var(--muted)',marginBottom:'1.5rem'}}>{message}</p>
          <div style={{display:'flex',gap:'10px',justifyContent:'center'}}>
            <button className="btn-secondary" onClick={onCancel} disabled={loading}>Annuler</button>
            <button className="btn-danger" onClick={onConfirm} disabled={loading}>
              {loading ? <><Loader2 size={14} className="anim-spin"/> Suppression...</> : <><Trash2 size={14}/> Supprimer</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Modal({open,onClose,title,subtitle,children,footer,size='md'}:{open:boolean;onClose:()=>void;title:string;subtitle?:string;children:React.ReactNode;footer?:React.ReactNode;size?:'sm'|'md'|'lg'|'xl'}) {
  if(!open) return null
  const w = {sm:'400px',md:'560px',lg:'680px',xl:'800px'}
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:w[size]}}>
        <div className="modal-header">
          <div>
            <h3 className="font-display" style={{fontSize:'1.15rem',fontWeight:700}}>{title}</h3>
            {subtitle && <p style={{fontSize:'.78rem',color:'var(--muted)',marginTop:'2px'}}>{subtitle}</p>}
          </div>
          <button className="btn-ghost" style={{padding:'6px'}} onClick={onClose}><X size={16}/></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export function StepWizard({steps,current}:{steps:string[];current:number}) {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'6px',marginBottom:'1.25rem',flexWrap:'wrap'}}>
      {steps.map((s,i) => (
        <React.Fragment key={i}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',flexShrink:0}}>
            <div className={clsx('step-dot', i<current?'step-done':i===current?'step-cur':'step-pend')}>
              {i<current?'V':i+1}
            </div>
            <span style={{fontSize:'.62rem',color:i===current?'var(--accent)':i<current?'var(--ok)':'var(--light)',fontWeight:i===current?700:400,maxWidth:'60px',textAlign:'center',lineHeight:1.2}}>{s.split(' ').slice(1).join(' ')||s}</span>
          </div>
          {i<steps.length-1 && <div className={clsx('step-line',i<current?'step-line-done':'')} style={{marginBottom:'14px'}}/>}
        </React.Fragment>
      ))}
    </div>
  )
}

export function TableActions({onView,onEdit,onDelete}:{onView?:()=>void;onEdit?:()=>void;onDelete?:()=>void}) {
  return (
    <div style={{display:'flex',gap:'3px'}}>
      {onView   && <button className="btn-ico"      title="Voir"       onClick={onView}><svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>}
      {onEdit   && <button className="btn-ico edt"  title="Modifier"   onClick={onEdit}><Edit   size={13}/></button>}
      {onDelete && <button className="btn-ico del"  title="Supprimer"  onClick={onDelete}><Trash2 size={13}/></button>}
    </div>
  )
}

export function EmptyState({title,desc,action,icon}:{title:string;desc?:string;action?:React.ReactNode;icon?:string}) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'4rem 2rem',textAlign:'center',gap:'0.875rem'}}>
      <div style={{width:'56px',height:'56px',borderRadius:'16px',background:'var(--surface2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',fontWeight:700,color:'var(--b400)'}}>?</div>
      <h3 className="font-display" style={{fontSize:'1.25rem',fontWeight:700}}>{title}</h3>
      {desc && <p style={{fontSize:'.85rem',color:'var(--muted)'}}>{desc}</p>}
      {action}
    </div>
  )
}

export function Pagination({total,page,perPage,onPage}:{total:number;page:number;perPage:number;onPage:(p:number)=>void}) {
  const totalPages = Math.ceil(total/perPage)
  if(totalPages<=1) return null
  const from=(page-1)*perPage+1, to=Math.min(page*perPage,total)
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderTop:'1px solid var(--borderS)'}}>
      <p style={{fontSize:'.78rem',color:'var(--muted)'}}>Affichage {from}–{to} sur {total}</p>
      <div style={{display:'flex',gap:'3px'}}>
        <button disabled={page===1} onClick={()=>onPage(page-1)} className="btn-secondary btn-sm" style={{opacity:page===1?.4:1}}>←</button>
        {Array.from({length:Math.min(totalPages,7)},(_,i)=>{const p=i+1;return(
          <button key={p} onClick={()=>onPage(p)} style={{padding:'4px 8px',borderRadius:'7px',border:'none',cursor:'pointer',fontSize:'.8rem',fontWeight:p===page?700:400,background:p===page?'var(--accent)':'transparent',color:p===page?'white':'var(--muted)'}}>{p}</button>
        )})}
        <button disabled={page===totalPages} onClick={()=>onPage(page+1)} className="btn-secondary btn-sm" style={{opacity:page===totalPages?.4:1}}>→</button>
      </div>
    </div>
  )
}

export function SearchBar({value,onChange,placeholder='Rechercher...',extra}:{value:string;onChange:(v:string)=>void;placeholder?:string;extra?:React.ReactNode}) {
  return (
    <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
      <div style={{flex:1,position:'relative',minWidth:'200px'}}>
        <svg style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',width:'13px',height:'13px',color:'var(--light)'}} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input className="input" style={{paddingLeft:'32px'}} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}/>
      </div>
      {extra}
    </div>
  )
}

export function StatCard({label,value,icon,color,delay,trend,trendUp}:{label:string;value:string|number;icon?:string;color?:string;delay?:string;trend?:string;trendUp?:boolean}) {
  return (
    <div className={clsx('stat-card',delay)}>
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
        {icon && <div className="stat-icon" style={{fontSize:'.85rem',fontWeight:700,color:'var(--muted)'}}>{icon}</div>}
        {trend && <span style={{fontSize:'.72rem',fontWeight:700,padding:'2px 6px',borderRadius:'6px',background:trendUp?'var(--okBg)':'var(--errBg)',color:trendUp?'var(--ok)':'var(--err)'}}>{trendUp?'+':'-'}{trend}</span>}
      </div>
      <div className="stat-val" style={color?{color}:undefined}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export function Field({label,required,error,children,hint}:{label:string;required?:boolean;error?:string;children:React.ReactNode;hint?:string}) {
  return (
    <div>
      <label className="label">{label}{required&&<span style={{color:'var(--err)',marginLeft:'2px'}}>*</span>}</label>
      {children}
      {error && <p style={{fontSize:'.72rem',color:'var(--err)',marginTop:'3px'}}>{error}</p>}
      {hint && !error && <p style={{fontSize:'.72rem',color:'var(--light)',marginTop:'3px'}}>{hint}</p>}
    </div>
  )
}
