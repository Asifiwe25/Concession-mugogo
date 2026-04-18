import React, { useState } from 'react'
import { Download, FileText, X, CheckCircle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useStore } from '@/store/useStore'
import { useAuthStore } from '@/context/authStore'
import { toast } from './crud'

interface PageReportProps {
  title: string
  description: string
  data: any[]
  columns: Array<{ key: string; label: string; format?: (v: any, row?: any) => string }>
  pageId: string
}

function buildHTML(title: string, description: string, data: any[], columns: any[], period: string, dateFrom: string, dateTo: string, lang: string, user: any) {
  const now = new Date()
  const langLabel: any = { fr:'Français', en:'English', sw:'Kiswahili', mashi:'Mashi' }
  const pl: any = { daily:'Journalier', monthly:'Mensuel', annual:'Annuel' }

  const rows = data.slice(0, 100).map((row, i) => {
    const cells = columns.map(col => {
      const val = row[col.key]
      const display = col.format ? col.format(val, row) : (val ?? '—')
      return `<td>${display}</td>`
    }).join('')
    return `<tr class="${i%2===0?'even':'odd'}">${cells}</tr>`
  }).join('')

  const headers = columns.map(c => `<th>${c.label}</th>`).join('')

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${title} — Concession Mugogo</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Georgia,'Times New Roman',serif;font-size:12px;color:#2e1f10;background:white;padding:40px;max-width:920px;margin:0 auto;line-height:1.6}
  .header{display:flex;align-items:center;gap:18px;padding-bottom:20px;border-bottom:3px solid #8c6e3f;margin-bottom:24px}
  .logo{width:64px;height:64px;background:#8c6e3f;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .org{flex:1}
  .org-name{font-size:22px;font-weight:bold;color:#8c6e3f;font-family:Georgia,serif}
  .org-sub{font-size:11px;color:#666;margin-top:3px}
  .report-badge{display:inline-block;background:#8c6e3f;color:white;padding:8px 18px;border-radius:6px;font-size:15px;font-weight:bold;margin-bottom:18px}
  .meta-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:22px}
  .meta-box{background:#f7f0e4;border:1px solid #deccb0;border-radius:7px;padding:9px 12px}
  .meta-label{font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:#8c6e3f;font-weight:bold;margin-bottom:3px}
  .meta-value{font-size:12px;font-weight:bold;color:#2e1f10}
  .section-title{font-size:13px;font-weight:bold;color:#8c6e3f;border-bottom:2px solid #ede0cc;padding-bottom:5px;margin:18px 0 10px;text-transform:uppercase;letter-spacing:.04em}
  .desc{background:#fdfaf5;border:1px solid #ede0cc;border-left:4px solid #8c6e3f;border-radius:0 7px 7px 0;padding:10px 14px;margin-bottom:16px;font-size:12px;color:#4a3520;line-height:1.7}
  .count{font-size:11px;color:#8c6e3f;font-weight:bold;margin-bottom:8px}
  table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:11px}
  thead th{background:#8c6e3f;color:white;padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.04em}
  tbody td{padding:7px 10px;border-bottom:1px solid #f0e8dc;vertical-align:top}
  tr.even td{background:#fdfaf5}
  tr:hover td{background:#f7f0e4}
  .summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}
  .summary-box{background:#f7f0e4;border:1px solid #deccb0;border-radius:7px;padding:10px 14px;text-align:center}
  .summary-num{font-size:22px;font-weight:bold;color:#8c6e3f;font-family:Georgia,serif}
  .summary-lbl{font-size:10px;color:#666;margin-top:3px}
  .footer{margin-top:30px;padding-top:14px;border-top:2px solid #ede0cc;display:flex;justify-content:space-between;font-size:10px;color:#8a7060;align-items:center}
  .footer-logo{font-family:Georgia,serif;font-size:13px;font-weight:bold;color:#8c6e3f}
  .sig{margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:40px}
  .sig-box{border-top:1px solid #8c6e3f;padding-top:8px}
  .sig-label{font-size:10px;color:#666;text-transform:uppercase;letter-spacing:.04em}
  .page-break{page-break-before:always}
  @media print{
    body{padding:20px}
    .no-print{display:none}
    thead{display:table-header-group}
    tr{page-break-inside:avoid}
  }
</style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <div class="logo">
      <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
        <path d="M50 15 L85 40 L85 85 L15 85 L15 40 Z" fill="rgba(255,255,255,0.95)"/>
        <rect x="38" y="62" width="14" height="23" rx="2" fill="#8c6e3f" opacity="0.9"/>
        <rect x="18" y="52" width="14" height="12" rx="2" fill="#8c6e3f" opacity="0.7"/>
        <rect x="68" y="52" width="14" height="12" rx="2" fill="#8c6e3f" opacity="0.7"/>
        <ellipse cx="66" cy="36" rx="9" ry="5.5" fill="#8c6e3f" opacity="0.8" transform="rotate(-30 66 36)"/>
        <circle cx="30" cy="26" r="6" fill="rgba(255,220,100,0.95)"/>
        <rect x="10" y="82" width="80" height="3" rx="1.5" fill="rgba(255,255,255,0.4)"/>
      </svg>
    </div>
    <div class="org">
      <div class="org-name">Concession Mugogo</div>
      <div class="org-sub">Gestion Agro-pastorale Intégrée · Walungu, Sud-Kivu, RDC</div>
      <div class="org-sub">Propriétaire : Richard Bunani · Tél : +243 976960983 · richardbunani2013@gmail.com</div>
      <div class="org-sub">Superficie : 9 hectares</div>
    </div>
    <div style="text-align:right;font-size:10px;color:#888">
      <div>Rapport N° ${Math.floor(Math.random()*9000)+1000}</div>
      <div>${now.toLocaleDateString('fr-FR')}</div>
      <div>${now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</div>
    </div>
  </div>

  <!-- TITLE -->
  <div class="report-badge">${title} — ${pl[period]||period}</div>

  <!-- META -->
  <div class="meta-grid">
    <div class="meta-box"><div class="meta-label">Période</div><div class="meta-value">${pl[period]||period}</div></div>
    <div class="meta-box"><div class="meta-label">Du</div><div class="meta-value">${dateFrom}</div></div>
    <div class="meta-box"><div class="meta-label">Au</div><div class="meta-value">${dateTo}</div></div>
    <div class="meta-box"><div class="meta-label">Langue</div><div class="meta-value">${langLabel[lang]||lang}</div></div>
    <div class="meta-box"><div class="meta-label">Généré par</div><div class="meta-value">${user?.fullName||'Richard Bunani'}</div></div>
    <div class="meta-box"><div class="meta-label">Rôle</div><div class="meta-value">${user?.role==='super_admin'?'Propriétaire':user?.role||'Admin'}</div></div>
    <div class="meta-box"><div class="meta-label">Enregistrements</div><div class="meta-value">${data.length} au total</div></div>
    <div class="meta-box"><div class="meta-label">Format</div><div class="meta-value">HTML/PDF</div></div>
  </div>

  <!-- DESCRIPTION -->
  <div class="section-title">À propos de ce rapport</div>
  <div class="desc">${description}<br/><br/>Ce rapport a été généré automatiquement par le système ERP de la Concession Mugogo. Il couvre la période du <strong>${dateFrom}</strong> au <strong>${dateTo}</strong>.</div>

  <!-- SUMMARY -->
  <div class="section-title">Résumé</div>
  <div class="summary-grid">
    <div class="summary-box"><div class="summary-num">${data.length}</div><div class="summary-lbl">Total enregistrements</div></div>
    <div class="summary-box"><div class="summary-num">${dateFrom}</div><div class="summary-lbl">Date de début</div></div>
    <div class="summary-box"><div class="summary-num">${dateTo}</div><div class="summary-lbl">Date de fin</div></div>
  </div>

  <!-- DATA TABLE -->
  <div class="section-title">Données détaillées (${Math.min(data.length,100)} enregistrements)</div>
  <div class="count">${data.length > 100 ? `Affichage des 100 premiers enregistrements sur ${data.length}` : `${data.length} enregistrement(s)`}</div>
  <table>
    <thead><tr>${headers}</tr></thead>
    <tbody>${rows || '<tr><td colspan="'+columns.length+'" style="text-align:center;color:#999;padding:1rem">Aucune donnée pour cette période</td></tr>'}</tbody>
  </table>

  <!-- SIGNATURES -->
  <div class="sig">
    <div class="sig-box">
      <div class="sig-label">Émis par</div>
      <div style="margin-top:20px;font-weight:bold">${user?.fullName||'Richard Bunani'}</div>
      <div style="font-size:10px;color:#666">${user?.role==='super_admin'?'Propriétaire, Concession Mugogo':user?.role||''}</div>
    </div>
    <div class="sig-box">
      <div class="sig-label">Approuvé par</div>
      <div style="margin-top:20px;font-weight:bold">Richard Bunani</div>
      <div style="font-size:10px;color:#666">Propriétaire, Concession Mugogo</div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div>
      <div class="footer-logo">Concession Mugogo</div>
      <div>Walungu, Sud-Kivu, République Démocratique du Congo</div>
    </div>
    <div style="text-align:center">
      <div>© 2025 Concession Mugogo</div>
      <div>Tous droits réservés</div>
    </div>
    <div style="text-align:right">
      <div>Généré le ${now.toLocaleDateString('fr-FR')}</div>
      <div>à ${now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</div>
      <div>Système ERP Mugogo v7</div>
    </div>
  </div>

</body>
</html>`
}

export function PageReport({ title, description, data, columns, pageId }: PageReportProps) {
  const { i18n } = useTranslation()
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [period, setPeriod] = useState<'daily'|'monthly'|'annual'>('monthly')
  const [format, setFormat] = useState<'pdf'|'word'>('pdf')
  const [dateFrom, setFrom] = useState(new Date(Date.now()-30*86400000).toISOString().split('T')[0])
  const [dateTo, setTo] = useState(new Date().toISOString().split('T')[0])
  const [generating, setGen] = useState(false)
  const [done, setDone] = useState(false)

  const generate = async () => {
    setGen(true)
    await new Promise(r => setTimeout(r, 1000))
    const html = buildHTML(title, description, data, columns, period, dateFrom, dateTo, i18n.language, user)
    if (format === 'pdf') {
      const w = window.open('', '_blank')
      if (w) { w.document.write(html); w.document.close(); setTimeout(() => { try { w.print() } catch {} }, 600) }
    } else {
      const blob = new Blob([html], { type:'application/vnd.ms-word;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const pl: any = { daily:'Journalier', monthly:'Mensuel', annual:'Annuel' }
      a.href = url; a.download = `Mugogo_${pageId}_${pl[period]}_${dateFrom.replace(/-/g,'')}.doc`
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    }
    setGen(false); setDone(true)
    toast(`📄 ${title} — rapport téléchargé`)
  }

  if (!open) return (
    <button className="btn-secondary btn-sm" onClick={() => setOpen(true)}>
      <Download size={13}/> Rapport
    </button>
  )

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setOpen(false)}>
      <div className="modal" style={{maxWidth:'440px'}}>
        <div className="modal-header" style={{background:'var(--b50)'}}>
          <div>
            <h3 style={{fontFamily:'Georgia,serif',fontSize:'1.05rem',fontWeight:700}}>
              <FileText size={15} style={{display:'inline',marginRight:'6px',verticalAlign:'middle',color:'var(--accent)'}}/>{title}
            </h3>
            <p style={{fontSize:'.78rem',color:'var(--muted)',marginTop:'2px'}}>{data.length} enregistrement(s)</p>
          </div>
          <button className="btn-ghost" style={{padding:'6px'}} onClick={() => { setOpen(false); setDone(false) }}><X size={15}/></button>
        </div>
        <div className="modal-body">
          {done ? (
            <div style={{textAlign:'center',padding:'1.5rem 1rem'}}>
              <div style={{width:'56px',height:'56px',borderRadius:'50%',background:'var(--okBg)',border:'2px solid var(--ok)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}>
                <CheckCircle size={26} style={{color:'var(--ok)'}}/>
              </div>
              <h3 style={{fontFamily:'Georgia,serif',fontSize:'1.1rem',fontWeight:700,marginBottom:'.5rem'}}>Rapport généré</h3>
              <p style={{fontSize:'.84rem',color:'var(--muted)',marginBottom:'1.25rem'}}>
                {format==='pdf' ? 'Fenêtre impression ouverte → choisissez "Enregistrer en PDF"' : 'Fichier Word téléchargé dans vos Téléchargements'}
              </p>
              <div style={{display:'flex',gap:'8px',justifyContent:'center'}}>
                <button className="btn-secondary" onClick={() => { setDone(false) }}>Nouveau rapport</button>
                <button className="btn-primary" onClick={() => { setOpen(false); setDone(false) }}>Fermer</button>
              </div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
              <div>
                <label className="label">Période</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px',marginTop:'4px'}}>
                  {[['daily','Journalier'],['monthly','Mensuel'],['annual','Annuel']].map(([v,l])=>(
                    <button key={v} onClick={()=>setPeriod(v as any)}
                      style={{padding:'9px',borderRadius:'10px',border:`1.5px solid ${period===v?'var(--accent)':'var(--border)'}`,background:period===v?'var(--accentS)':'var(--surface2)',cursor:'pointer',fontSize:'.8rem',fontWeight:700,color:period===v?'var(--accent)':'var(--muted)'}}>
                      {l}
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
                  <button onClick={()=>setFormat('pdf')}
                    style={{padding:'12px',borderRadius:'10px',border:`1.5px solid ${format==='pdf'?'var(--err)':'var(--border)'}`,background:format==='pdf'?'#fdf0f0':'var(--surface2)',cursor:'pointer',textAlign:'left'}}>
                    <p style={{fontWeight:700,fontSize:'.88rem',color:format==='pdf'?'var(--err)':'var(--muted)'}}>📄 PDF</p>
                    <p style={{fontSize:'.72rem',color:'var(--light)',marginTop:'2px'}}>Impression / Enregistrement</p>
                  </button>
                  <button onClick={()=>setFormat('word')}
                    style={{padding:'12px',borderRadius:'10px',border:`1.5px solid ${format==='word'?'var(--b600)':'var(--border)'}`,background:format==='word'?'var(--accentS)':'var(--surface2)',cursor:'pointer',textAlign:'left'}}>
                    <p style={{fontWeight:700,fontSize:'.88rem',color:format==='word'?'var(--b600)':'var(--muted)'}}>📝 Word (.doc)</p>
                    <p style={{fontSize:'.72rem',color:'var(--light)',marginTop:'2px'}}>Microsoft Word</p>
                  </button>
                </div>
              </div>
              <div style={{background:'var(--b50)',borderRadius:'10px',padding:'10px 12px',border:'1px solid var(--b200)',fontSize:'.78rem',color:'var(--muted)'}}>
                ℹ️ Le rapport inclut le logo Mugogo, les informations de la concession, {data.length} enregistrement(s) et les signatures.
              </div>
              <button onClick={generate} disabled={generating} className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px'}}>
                {generating ? <><Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/> Génération en cours...</> : <><Download size={14}/> Générer le rapport {format.toUpperCase()}</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
