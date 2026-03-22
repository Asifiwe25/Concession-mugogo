import React from 'react'
import { X, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

// ── Button ──────────────────────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props
}: ButtonProps) {
  const base = 'inline-flex items-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl'
  const variants = {
    primary:   'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 focus:ring-neutral-400',
    outline:   'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 focus:ring-primary-500',
    danger:    'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
    ghost:     'text-neutral-600 hover:bg-neutral-100 focus:ring-neutral-400',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  )
}

// ── Badge ────────────────────────────────────────────────────────────────────
type BadgeColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple' | 'orange'
interface BadgeProps { color?: BadgeColor; children: React.ReactNode; className?: string }

export function Badge({ color = 'gray', children, className }: BadgeProps) {
  const colors: Record<BadgeColor, string> = {
    green:  'bg-primary-100 text-primary-700',
    yellow: 'bg-earth-100 text-earth-700',
    red:    'bg-red-100 text-red-700',
    blue:   'bg-blue-100 text-blue-700',
    gray:   'bg-neutral-100 text-neutral-600',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
  }
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colors[color], className)}>
      {children}
    </span>
  )
}

// ── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  hint?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, hint, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="label">{label}{props.required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">{icon}</div>}
        <input
          ref={ref}
          className={clsx(
            'input',
            icon && 'pl-10',
            error && 'border-red-300 focus:ring-red-400',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, options, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}{props.required && <span className="text-red-500 ml-0.5">*</span>}</label>}
      <select
        className={clsx('input appearance-none cursor-pointer', error && 'border-red-300', className)}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

// ── Card ─────────────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; className?: string; hover?: boolean; onClick?: () => void }

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      className={clsx(hover ? 'card-hover cursor-pointer' : 'card', className)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// ── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  iconBg?: string
  trend?: { value: number; label: string }
  className?: string
}

export function StatCard({ title, value, subtitle, icon, iconBg = 'bg-primary-100', trend, className }: StatCardProps) {
  return (
    <Card className={clsx('animate-fade-in', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
          {icon}
        </div>
        {trend && (
          <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full',
            trend.value >= 0 ? 'bg-primary-50 text-primary-700' : 'bg-red-50 text-red-600'
          )}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-semibold text-neutral-900">{value}</p>
      <p className="text-sm font-medium text-neutral-700 mt-0.5">{title}</p>
      {subtitle && <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>}
    </Card>
  )
}

// ── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={clsx('modal w-full', sizes[size])}>
        <div className="modal-header">
          <h3 className="text-lg font-display font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-neutral-100 transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>
        <div className="modal-body max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

// ── Table ────────────────────────────────────────────────────────────────────
interface Column<T> { key: string; header: string; render?: (row: T) => React.ReactNode; width?: string }
interface TableProps<T> { columns: Column<T>[]; data: T[]; loading?: boolean; emptyText?: string }

export function Table<T extends Record<string, unknown>>({ columns, data, loading, emptyText = 'Aucune donnée' }: TableProps<T>) {
  return (
    <div className="table-container">
      <table className="table w-full">
        <thead>
          <tr>{columns.map(c => <th key={c.key} style={{ width: c.width }}>{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="text-center py-12 text-neutral-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Chargement...
            </td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-12 text-neutral-400">{emptyText}</td></tr>
          ) : data.map((row, i) => (
            <tr key={i} className="animate-fade-in">
              {columns.map(c => <td key={c.key}>{c.render ? c.render(row) : String(row[c.key] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[]
  active: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-neutral-200 mb-6 overflow-x-auto scrollbar-hide">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'tab flex items-center gap-1.5 whitespace-nowrap',
            active === tab.id && 'active'
          )}
        >
          {tab.icon}{tab.label}
        </button>
      ))}
    </div>
  )
}

// ── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'primary' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const colors: Record<string, string> = {
    primary: 'bg-primary-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
  }
  return (
    <div className="progress-bar">
      <div className={clsx('progress-fill', colors[color] || colors.primary)} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4 text-neutral-400">{icon}</div>
      <h3 className="text-base font-semibold text-neutral-800 mb-1">{title}</h3>
      {desc && <p className="text-sm text-neutral-500 mb-4 max-w-sm">{desc}</p>}
      {action}
    </div>
  )
}
