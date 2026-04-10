import React, { useState } from 'react'
import { Download, FileText, X, CheckCircle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from './crud'

interface PageReportProps {
  title: string
  description: string
  data: any[]
  columns: Array<{ key: string; label: string; format?: (v: any) => string }>
  pageId: string
}

export function PageReport({ title, description, data, columns, pageId }: PageReportProps) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [period, setPeriod] = useState<'daily'|'monthly'|'annual'>('monthly')
  const [format, setFormat] = useState<'pdf'|'word'>('pdf')
  const [dateFrom, setFrom] = useState(new Date().toISOString().split('T')[0])
  const [dateTo, setTo] = useState(new Date().toISOString().split('T')[0])
  const [generating, setGen] = useState(false)
  const [done, setDone] = useState(false)

  const periodLabels = { daily: 'Journalier', monthly: 'Mensuel', annual: 'Annuel' }
  const langLabel = { fr: 'Français', en: 'English', sw: 'Kiswahili', mashi: 'Mashi' }[i18n.language] || 'Français'

  const generateReport = async () => {
    setGen(true)
    await new Promise(r => setTimeout(r, 1200))
    const now = new Date()
    const pl = periodLabels[period]

    // Build table rows
    const tableRows = data.slice(0, 50).map(row =>
      `<tr>${columns.map(col => {
        const val = row[col.key]
        const display = col.format ? col.format(val) : (val ?? '—')
        return `<td>${display}</td>`
      }).join('')}</tr>`
    ).join('')

    const tableHeaders = columns.map(c => `<th>${c.label}</th>`).join('')

    const htmlContent = `<!DOCTYPE html>
<html lang="${i18n.language}">
<head>
<meta charset="UTF-8"/>
<title>${title} — Concession Mugogo</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Georgia, serif; font-size: 12px; color: #2e1f10; background: white; padding: 36px; max-width: 900px; margin: 0 auto; }
  .header { display:flex; align-items:center; gap:14px; margin-bottom:24px; padding-bottom:16px; border-bottom:3px solid #8c6e3f; }
  .logo-circle { width:56px; height:56px; background:#8c6e3f; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .org-name { font-size:20px; font-weight:700; color:#8c6e3f; }
  .org-sub { font-size:11px; color:#666; margin-top:2px; }
  .report-title { background:#8c6e3f; color:white; padding:10px 18px; border-radius:7px; font-size:15px; font-weight:700; margin-bottom:16px; }
  .meta { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:20px; }
  .meta-box { background:#f7f0e4; border:1px solid #deccb0; border-radius:7px; padding:8px 12px; }
  .meta-label { font-size:9px; text-transform:uppercase; letter-spacing:.05em; color:#8c6e3f; font-weight:700; }
  .meta-value { font-size:12px; font-weight:600; color:#2e1f10; margin-top:2px; }
  table { width:100%; border-collapse:collapse; margin-top:8px; }
  th { background:#8c6e3f; color:white; padding:7px 10px; font-size:10px; text-align:left; font-weight:700; }
  td { padding:6px 10px; font-size:11px; border-bottom:1px solid #f0e8dc; }
  tr:nth-child(even) td { background:#fdfaf5; }
  .footer { margin-top:24px; padding-top:12px; border-top:2px solid #ede0cc; display:flex; justify-content:space-between; font-size:10px; color:#8a7060; }
  .desc { background:#f7f0e4; border:1px solid #ede0cc; border-radius:7px; padding:10px 14px; margin-bottom:16px; font-size:12px; color:#4a3520; line-height:1.65; }
  .count { font-size:11px; color:#8c6e3f; font-weight:700; margin-bottom:8px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="logo-circle">
      <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
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
      <div class="org-sub">+243 976960983 | richardbunani2013@gmail.com</div>
    </div>
  </div>

  <div class="report-title">${title} — ${pl}</div>

  <div class="meta">
    <div class="meta-box"><div class="meta-label">Période</div><div class="meta-value">${pl}</div></div>
    <div class="meta-box"><div class="meta-label">Du</div><div class="meta-value">${dateFrom}</div></div>
    <div class="meta-box"><div class="meta-label">Au</div><div class="meta-value">${dateTo}</div></div>
    <div class="meta-box"><div class="meta-label">Généré</div><div class="meta-value">${now.toLocaleDateString('fr-FR')}</div></div>
  </div>

  <div class="desc">${description}</div>
  <div class="count">${data.length} enregistrement(s) total — ${Math.min(data.length, 50)} affichés</div>

  <table>
    <thead><tr>${tableHeaders}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>

  <div class="footer">
    <span>© 2025 Concession Mugogo — Richard Bunani</span>
    <span>Généré le ${now.toLocaleDateString('fr-FR')} à ${now.toLocaleTimeString('fr-FR')}</span>
    <span>Langue: ${langLabel}</span>
  </div>
</body>
</html>`

    if (format === 'pdf') {
      const w = window.open('', '_blank')
      if (w) { w.document.write(htmlContent); w.document.close(); setTimeout(() => w.print(), 500) }
    } else {
      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-word;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Mugogo_${pageId}_${pl}_${dateFrom.replace(/-/g,'')}.doc`
      document.body.appendChild(a); a.click()
      document.body.removeChild(a); URL.revokeObjectURL(url)
    }

    setGen(false); setDone(true)
    toast(`Rapport ${title} téléchargé`)
  }

  if (!open) {
    return (
      <button className="btn-secondary btn-sm" onClick={() => setOpen(true)}>
        <Download size={13}/> Rapport
      </button>
    )
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setOpen(false)}>
      <div className="modal" style={{ maxWidth: '440px' }}>
        <div className="modal-header" style={{ background: 'var(--b50)' }}>
          <div>
            <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.05rem', fontWeight: 700 }}>
              <FileText size={15} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: 'var(--accent)' }}/>
              {title}
            </h3>
            <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: '2px' }}>{data.length} enregistrements</p>
          </div>
          <button className="btn-ghost" style={{ padding: '6px' }} onClick={() => { setOpen(false); setDone(false) }}>
            <X size={15}/>
          </button>
        </div>
        <div className="modal-body">
          {done ? (
            <div style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--okBg)', border: '2px solid var(--ok)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CheckCircle size={24} style={{ color: 'var(--ok)' }}/>
              </div>
              <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: '.5rem' }}>Rapport prêt</h3>
              <p style={{ fontSize: '.84rem', color: 'var(--muted)', marginBottom: '1.125rem' }}>
                {format === 'pdf' ? 'La fenêtre d\'impression est ouverte. Choisissez "Enregistrer en PDF".' : 'Le fichier Word a été téléchargé.'}
              </p>
              <button className="btn-primary" onClick={() => { setOpen(false); setDone(false) }}>Fermer</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Période</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginTop: '4px' }}>
                  {(['daily', 'monthly', 'annual'] as const).map(p => (
                    <button key={p} onClick={() => setPeriod(p)}
                      style={{ padding: '9px', borderRadius: '10px', border: `1.5px solid ${period === p ? 'var(--accent)' : 'var(--border)'}`, background: period === p ? 'var(--accentS)' : 'var(--surface2)', cursor: 'pointer', fontSize: '.8rem', fontWeight: 700, color: period === p ? 'var(--accent)' : 'var(--muted)' }}>
                      {periodLabels[p]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-grid">
                <div><label className="label">Du</label><input className="input" type="date" value={dateFrom} onChange={e => setFrom(e.target.value)}/></div>
                <div><label className="label">Au</label><input className="input" type="date" value={dateTo} onChange={e => setTo(e.target.value)}/></div>
              </div>
              <div>
                <label className="label">Format</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                  <button onClick={() => setFormat('pdf')}
                    style={{ padding: '11px', borderRadius: '10px', border: `1.5px solid ${format === 'pdf' ? 'var(--err)' : 'var(--border)'}`, background: format === 'pdf' ? '#f9eded' : 'var(--surface2)', cursor: 'pointer', textAlign: 'left' }}>
                    <p style={{ fontWeight: 700, fontSize: '.88rem', color: format === 'pdf' ? 'var(--err)' : 'var(--muted)' }}>PDF</p>
                    <p style={{ fontSize: '.72rem', color: 'var(--light)', marginTop: '2px' }}>Impression / Enregistrement</p>
                  </button>
                  <button onClick={() => setFormat('word')}
                    style={{ padding: '11px', borderRadius: '10px', border: `1.5px solid ${format === 'word' ? 'var(--b600)' : 'var(--border)'}`, background: format === 'word' ? 'var(--accentS)' : 'var(--surface2)', cursor: 'pointer', textAlign: 'left' }}>
                    <p style={{ fontWeight: 700, fontSize: '.88rem', color: format === 'word' ? 'var(--b600)' : 'var(--muted)' }}>Word (.doc)</p>
                    <p style={{ fontSize: '.72rem', color: 'var(--light)', marginTop: '2px' }}>Microsoft Word</p>
                  </button>
                </div>
              </div>
              <button onClick={generateReport} disabled={generating} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                {generating
                  ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }}/> Génération...</>
                  : <><Download size={14}/> Télécharger {format === 'pdf' ? 'PDF' : 'Word'}</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
