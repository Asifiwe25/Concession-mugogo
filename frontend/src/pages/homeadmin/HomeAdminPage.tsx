import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Eye, EyeOff, Save, RotateCcw, Plus, Trash2, Edit2, Star,
  CheckCircle, Globe, Layout, Users, MessageSquare, BarChart3,
  Image, AlignLeft, Phone, Mail, MapPin, Zap, ChevronDown, ChevronUp
} from 'lucide-react'
import { useHomeStore } from '@/store/extraStore'
import { toast } from '@/components/ui/crud'

const SECTION_ICONS: Record<string, any> = {
  hero: Layout, about: AlignLeft, stats: BarChart3,
  features: Zap, testimonials: MessageSquare, contact: Phone,
  cta: Star, visibility: Eye,
}

type Tab = 'hero' | 'about' | 'stats' | 'features' | 'testimonials' | 'contact' | 'cta' | 'visibility'

function Field({ label, value, onChange, type = 'text', rows }: {
  label: string; value: string | number; onChange: (v: string) => void
  type?: string; rows?: number
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>
        {label}
      </label>
      {rows ? (
        <textarea className="input" rows={rows}
          value={String(value)} onChange={e => onChange(e.target.value)}
          style={{ resize: 'vertical' }}/>
      ) : (
        <input className="input" type={type} value={String(value)}
          onChange={e => onChange(e.target.value)}/>
      )}
    </div>
  )
}

function Toggle({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--surface2)', borderRadius: '12px', marginBottom: '8px', border: '1px solid var(--borderS)' }}>
      <div>
        <p style={{ fontWeight: 700, fontSize: '.9rem' }}>{label}</p>
        {desc && <p style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: '2px' }}>{desc}</p>}
      </div>
      <div onClick={() => onChange(!value)}
        style={{ width: '44px', height: '24px', borderRadius: '99px', background: value ? 'var(--accent)' : 'var(--b300)', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: '3px', left: value ? '22px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }}/>
      </div>
    </div>
  )
}

export default function HomeAdminPage() {
  const { t } = useTranslation()
  const {
    homeContent, updateHomeContent, resetHomeContent,
    updateTestimonial, addTestimonial, removeTestimonial,
    updateFeature, addFeature, removeFeature,
  } = useHomeStore()

  const [activeTab, setActiveTab] = useState<Tab>('hero')
  const [saved,    setSaved]      = useState(false)
  const [expandedTest, setExpandedTest] = useState<number|null>(null)
  const [expandedFeat, setExpandedFeat] = useState<number|null>(null)

  const tabs: Array<{ id: Tab; label: string; icon: any }> = [
    { id: 'hero',         label: 'Hero',           icon: Layout         },
    { id: 'about',        label: 'À propos',        icon: AlignLeft      },
    { id: 'stats',        label: 'Statistiques',    icon: BarChart3      },
    { id: 'features',     label: 'Modules',         icon: Zap            },
    { id: 'testimonials', label: 'Témoignages',     icon: MessageSquare  },
    { id: 'contact',      label: 'Contact',         icon: Phone          },
    { id: 'cta',          label: 'Appel à l\'action', icon: Star         },
    { id: 'visibility',   label: 'Visibilité',      icon: Eye            },
  ]

  const handleSave = () => {
    setSaved(true)
    toast('Page d\'accueil mise à jour avec succès')
    setTimeout(() => setSaved(false), 2500)
  }

  const handleReset = () => {
    if (window.confirm('Réinitialiser toutes les modifications ? Les données par défaut seront restaurées.')) {
      resetHomeContent()
      toast('Contenu réinitialisé', 'info' as any)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeUp .4s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem' }}>
        <div>
          <h1 className="page-title">
            <Globe size={20} style={{ display: 'inline', marginRight: '8px', color: 'var(--accent)', verticalAlign: 'middle' }}/>
            Gestion de la page d'accueil
          </h1>
          <p className="page-sub">Modifiez le contenu visible par tous les visiteurs de la Concession Mugogo</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleReset} className="btn-secondary btn-sm">
            <RotateCcw size={13}/> Réinitialiser
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Eye size={13}/> Voir la page
          </a>
          <button onClick={handleSave} className="btn-primary btn-sm">
            {saved
              ? <><CheckCircle size={13}/> Enregistré</>
              : <><Save size={13}/> Enregistrer</>
            }
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ background: 'var(--accentS)', borderRadius: '13px', padding: '11px 16px', border: '1px solid var(--b300)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Globe size={15} style={{ color: 'var(--accent)', flexShrink: 0 }}/>
        <p style={{ fontSize: '.84rem', color: 'var(--accent)', fontWeight: 600 }}>
          Les modifications s'appliquent immédiatement sur la page d'accueil publique. Cliquez "Voir la page" pour prévisualiser.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1.25rem', alignItems: 'start' }}>

        {/* Tab list */}
        <div className="card" style={{ padding: '.5rem' }}>
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px', borderRadius: '10px', border: 'none', cursor: 'pointer', marginBottom: '2px', fontSize: '.84rem', fontWeight: isActive ? 700 : 400, transition: 'all .12s',
                  background: isActive ? 'var(--accentS)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--muted)' }}>
                <Icon size={14} style={{ flexShrink: 0 }}/>
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content panel */}
        <div className="card">

          {/* ── HERO ── */}
          {activeTab === 'hero' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--borderS)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layout size={18} style={{ color: 'var(--accent)' }}/>
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.15rem', fontWeight: 700 }}>Section Hero</h2>
                  <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>Première impression — titre principal et description</p>
                </div>
              </div>

              <Field label="Titre ligne 1" value={homeContent.heroTitle}
                onChange={v => updateHomeContent({ heroTitle: v })}/>
              <Field label="Titre accentué (ligne 2 — en doré)" value={homeContent.heroSubtitle}
                onChange={v => updateHomeContent({ heroSubtitle: v })}/>
              <Field label="Description principale" value={homeContent.heroDescription}
                onChange={v => updateHomeContent({ heroDescription: v })} rows={4}/>

              <div style={{ background: 'var(--b50)', borderRadius: '14px', padding: '1rem 1.25rem', border: '1px solid var(--b200)', marginTop: '1.25rem' }}>
                <p style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--b700)', marginBottom: '.875rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Aperçu du titre</p>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2, color: 'var(--text)' }}>
                  {homeContent.heroTitle}
                </div>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2, color: 'var(--accent)', marginBottom: '.875rem' }}>
                  {homeContent.heroSubtitle}
                </div>
                <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65 }}>{homeContent.heroDescription}</p>
              </div>
            </div>
          )}

          {/* ── ABOUT ── */}
          {activeTab === 'about' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--borderS)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'var(--b100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlignLeft size={18} style={{ color: 'var(--b600)' }}/>
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.15rem', fontWeight: 700 }}>Section À propos</h2>
                  <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>Présentation de la concession</p>
                </div>
              </div>

              <Field label="Sous-titre (badge)" value={homeContent.aboutSubtitle}
                onChange={v => updateHomeContent({ aboutSubtitle: v })}/>
              <Field label="Titre principal" value={homeContent.aboutTitle}
                onChange={v => updateHomeContent({ aboutTitle: v })} rows={2}/>
              <Field label="Paragraphe 1" value={homeContent.aboutDescription1}
                onChange={v => updateHomeContent({ aboutDescription1: v })} rows={3}/>
              <Field label="Paragraphe 2" value={homeContent.aboutDescription2}
                onChange={v => updateHomeContent({ aboutDescription2: v })} rows={3}/>
            </div>
          )}

          {/* ── STATS ── */}
          {activeTab === 'stats' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--borderS)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart3 size={18} style={{ color: 'var(--accent)' }}/>
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.15rem', fontWeight: 700 }}>Statistiques</h2>
                  <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>Chiffres affichés dans la bande colorée</p>
                </div>
              </div>

              <div className="form-grid">
                <Field label="Superficie (ha)" value={homeContent.statArea} type="number"
                  onChange={v => updateHomeContent({ statArea: parseInt(v)||0, area: v+' hectares' })}/>
                <Field label="Nombre d'employés" value={homeContent.statEmployees} type="number"
                  onChange={v => updateHomeContent({ statEmployees: parseInt(v)||0 })}/>
              </div>
              <div className="form-grid">
                <Field label="Nombre de zones" value={homeContent.statZones} type="number"
                  onChange={v => updateHomeContent({ statZones: parseInt(v)||0 })}/>
              </div>

              <div style={{ background: 'var(--accent)', borderRadius: '14px', padding: '1.25rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '.5rem' }}>
                {[
                  { val: homeContent.statArea, suf: ' ha', lbl: 'Superficie' },
                  { val: homeContent.statEmployees, suf: '', lbl: 'Employés' },
                  { val: homeContent.statZones, suf: '', lbl: 'Zones' },
                  { val: 100, suf: '%', lbl: 'Sécurisé' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Georgia,serif', fontSize: '2rem', fontWeight: 700, color: 'white' }}>{s.val}{s.suf}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.7)', marginTop: '4px' }}>{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FEATURES ── */}
          {activeTab === 'features' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--borderS)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'var(--b100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={18} style={{ color: 'var(--b600)' }}/>
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.15rem', fontWeight: 700 }}>Modules / Fonctionnalités</h2>
                    <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{homeContent.features.length} modules affichés</p>
                  </div>
                </div>
                <button onClick={addFeature} className="btn-primary btn-sm">
                  <Plus size={13}/> Ajouter
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {homeContent.features.map((feat, i) => (
                  <div key={i} style={{ border: '1px solid var(--borderS)', borderRadius: '13px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', background: 'var(--surface2)', cursor: 'pointer' }}
                      onClick={() => setExpandedFeat(expandedFeat === i ? null : i)}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'var(--b100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '11px', color: 'var(--b600)' }}>
                        {i + 1}
                      </div>
                      <p style={{ flex: 1, fontWeight: 600, fontSize: '.88rem' }}>{feat.title || 'Module sans titre'}</p>
                      <button onClick={e => { e.stopPropagation(); removeFeature(i) }} className="btn-ico del" style={{ flexShrink: 0 }}>
                        <Trash2 size={12}/>
                      </button>
                      {expandedFeat === i ? <ChevronUp size={14} style={{ color: 'var(--muted)', flexShrink: 0 }}/> : <ChevronDown size={14} style={{ color: 'var(--muted)', flexShrink: 0 }}/>}
                    </div>
                    {expandedFeat === i && (
                      <div style={{ padding: '14px', borderTop: '1px solid var(--borderS)' }}>
                        <Field label="Titre du module" value={feat.title}
                          onChange={v => updateFeature(i, { title: v })}/>
                        <Field label="Description" value={feat.desc}
                          onChange={v => updateFeature(i, { desc: v })} rows={2}/>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TESTIMONIALS ── */}
          {activeTab === 'testimonials' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--borderS)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'var(--b100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={18} style={{ color: 'var(--b600)' }}/>
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.15rem', fontWeight: 700 }}>Témoignages de l'équipe</h2>
                    <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>{homeContent.testimonials.length} témoignages</p>
                  </div>
                </div>
                <button onClick={addTestimonial} className="btn-primary btn-sm">
                  <Plus size={13}/> Ajouter
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {homeContent.testimonials.map((test, i) => (
                  <div key={i} style={{ border: '1px solid var(--borderS)', borderRadius: '13px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', background: 'var(--surface2)', cursor: 'pointer' }}
                      onClick={() => setExpandedTest(expandedTest === i ? null : i)}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accentS)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                        {(test.name || '?').charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{test.name}</p>
                        <p style={{ fontSize: '.74rem', color: 'var(--muted)' }}>{test.role}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                        {Array.from({ length: test.stars }).map((_, j) => (
                          <Star key={j} size={11} style={{ fill: 'var(--b400)', color: 'var(--b400)' }}/>
                        ))}
                      </div>
                      <button onClick={e => { e.stopPropagation(); removeTestimonial(i) }} className="btn-ico del" style={{ flexShrink: 0 }}>
                        <Trash2 size={12}/>
                      </button>
                      {expandedTest === i ? <ChevronUp size={14} style={{ color: 'var(--muted)', flexShrink: 0 }}/> : <ChevronDown size={14} style={{ color: 'var(--muted)', flexShrink: 0 }}/>}
                    </div>
                    {expandedTest === i && (
                      <div style={{ padding: '14px', borderTop: '1px solid var(--borderS)', display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
                        <div className="form-grid">
                          <Field label="Nom" value={test.name} onChange={v => updateTestimonial(i, { name: v })}/>
                          <Field label="Rôle / Poste" value={test.role} onChange={v => updateTestimonial(i, { role: v })}/>
                        </div>
                        <Field label="Témoignage" value={test.text} onChange={v => updateTestimonial(i, { text: v })} rows={3}/>
                        <div>
                          <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '.4rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                            Étoiles
                          </label>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {[1,2,3,4,5].map(s => (
                              <button key={s} onClick={() => updateTestimonial(i, { stars: s })}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                <Star size={20} style={{ fill: s <= test.stars ? 'var(--b400)' : 'transparent', color: 'var(--b400)', transition: 'all .15s' }}/>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div style={{ background: 'var(--b50)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--b200)' }}>
                          <p style={{ fontSize: '.82rem', color: 'var(--muted)', fontStyle: 'italic', marginBottom: '.625rem' }}>"{test.text}"</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', color: 'var(--accent)' }}>
                              {(test.name||'?').charAt(0)}
                            </div>
                            <div>
                              <p style={{ fontWeight: 700, fontSize: '.82rem' }}>{test.name}</p>
                              <p style={{ fontSize: '.74rem', color: 'var(--muted)' }}>{test.role}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CONTACT ── */}
          {activeTab === 'contact' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--borderS)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'var(--accentS)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={18} style={{ color: 'var(--accent)' }}/>
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.15rem', fontWeight: 700 }}>Informations de contact</h2>
                  <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>Affiché sur la page d'accueil et dans le formulaire de rapport</p>
                </div>
              </div>

              <div className="form-grid">
                <Field label="Nom du propriétaire" value={homeContent.ownerName}
                  onChange={v => updateHomeContent({ ownerName: v })}/>
                <Field label="Superficie" value={homeContent.area}
                  onChange={v => updateHomeContent({ area: v })}/>
              </div>
              <div className="form-grid">
                <Field label="Téléphone / WhatsApp" value={homeContent.phone}
                  onChange={v => updateHomeContent({ phone: v })}/>
                <Field label="Email" value={homeContent.email} type="email"
                  onChange={v => updateHomeContent({ email: v })}/>
              </div>
              <Field label="Localisation" value={homeContent.location}
                onChange={v => updateHomeContent({ location: v })}/>
              <div className="form-grid">
                <Field label="Nom du site" value={homeContent.siteName}
                  onChange={v => updateHomeContent({ siteName: v })}/>
                <Field label="Slogan" value={homeContent.siteTagline}
                  onChange={v => updateHomeContent({ siteTagline: v })}/>
              </div>

              {/* Preview */}
              <div style={{ background: 'var(--accentS)', borderRadius: '14px', padding: '1.125rem 1.5rem', border: '1px solid var(--b300)', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '.5rem', flexWrap: 'wrap' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--b100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', color: 'var(--accent)', border: '2px solid var(--b300)', flexShrink: 0 }}>
                  {(homeContent.ownerName||'R').charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: '.95rem' }}>{homeContent.ownerName} — Propriétaire</p>
                  <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginTop: '2px' }}>
                    WhatsApp : <strong>{homeContent.phone}</strong> · Email : <strong>{homeContent.email}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── CTA ── */}
          {activeTab === 'cta' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--borderS)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'var(--b100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Star size={18} style={{ color: 'var(--b600)' }}/>
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.15rem', fontWeight: 700 }}>Appel à l'action (CTA)</h2>
                  <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>Section finale de la page d'accueil</p>
                </div>
              </div>

              <Field label="Titre du CTA" value={homeContent.ctaTitle}
                onChange={v => updateHomeContent({ ctaTitle: v })}/>
              <Field label="Sous-titre" value={homeContent.ctaSubtitle}
                onChange={v => updateHomeContent({ ctaSubtitle: v })} rows={2}/>
              <Field label="Titre de la section rapport" value={homeContent.reportTitle}
                onChange={v => updateHomeContent({ reportTitle: v })}/>
              <Field label="Sous-titre section rapport" value={homeContent.reportSubtitle}
                onChange={v => updateHomeContent({ reportSubtitle: v })} rows={2}/>

              <div style={{ background: 'var(--b800)', borderRadius: '16px', padding: '2rem', textAlign: 'center', marginTop: '.5rem' }}>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '.875rem' }}>{homeContent.ctaTitle}</h2>
                <p style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.68)' }}>{homeContent.ctaSubtitle}</p>
              </div>
            </div>
          )}

          {/* ── VISIBILITY ── */}
          {activeTab === 'visibility' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--borderS)' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'var(--b100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Eye size={18} style={{ color: 'var(--b600)' }}/>
                </div>
                <div>
                  <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '1.15rem', fontWeight: 700 }}>Visibilité des sections</h2>
                  <p style={{ fontSize: '.78rem', color: 'var(--muted)' }}>Afficher ou masquer des sections entières</p>
                </div>
              </div>

              <Toggle label="Section À propos" desc="Présentation de la concession et de la carte des zones"
                value={homeContent.showAbout} onChange={v => updateHomeContent({ showAbout: v })}/>
              <Toggle label="Bande statistiques" desc="Chiffres clés — superficie, employés, zones"
                value={homeContent.showStats} onChange={v => updateHomeContent({ showStats: v })}/>
              <Toggle label="Modules & Fonctionnalités" desc="Grille des 12 modules du système ERP"
                value={homeContent.showFeatures} onChange={v => updateHomeContent({ showFeatures: v })}/>
              <Toggle label="Témoignages de l'équipe" desc="Carousel des avis des employés"
                value={homeContent.showTestimonials} onChange={v => updateHomeContent({ showTestimonials: v })}/>
              <Toggle label="Section envoi de rapports" desc="Formulaire public rapport écrit/vocal/vidéo"
                value={homeContent.showReportSection} onChange={v => updateHomeContent({ showReportSection: v })}/>
              <Toggle label="Rôles & Accès" desc="Tableau des rôles et permissions"
                value={homeContent.showRoles} onChange={v => updateHomeContent({ showRoles: v })}/>

              <div style={{ background: 'var(--b50)', borderRadius: '13px', padding: '1rem 1.25rem', border: '1px solid var(--b200)', marginTop: '1rem' }}>
                <p style={{ fontWeight: 700, fontSize: '.82rem', marginBottom: '.75rem', color: 'var(--b700)' }}>Récapitulatif de visibilité</p>
                {[
                  ['À propos', homeContent.showAbout],
                  ['Statistiques', homeContent.showStats],
                  ['Modules', homeContent.showFeatures],
                  ['Témoignages', homeContent.showTestimonials],
                  ['Rapports public', homeContent.showReportSection],
                  ['Rôles', homeContent.showRoles],
                ].map(([label, visible]) => (
                  <div key={label as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--b200)', fontSize: '.84rem' }}>
                    <span>{label as string}</span>
                    <span className={`badge ${visible ? 'badge-ok' : 'badge-dim'}`}>
                      {visible ? 'Visible' : 'Masqué'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--borderS)' }}>
            <button onClick={handleReset} className="btn-secondary">
              <RotateCcw size={13}/> Réinitialiser
            </button>
            <button onClick={handleSave} className="btn-primary">
              {saved ? <><CheckCircle size={13}/> Enregistré !</> : <><Save size={13}/> Enregistrer les modifications</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
