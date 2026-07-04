import type { ReactNode } from 'react'
import { Trash2 } from 'lucide-react'
import type { IdeaCard as IdeaCardType, IdeaStatus } from '../types'
import { statusStyles } from '../types'
import { SeedIcon, SproutIcon, PlantIcon } from './StatusIcons'

type Props = {
  idea: IdeaCardType
  isSelected: boolean
  confirmDeleteId: string
  onSelect: (id: string) => void
  onToggleDelete: (id: string) => void
  onDelete: (id: string) => void
  onCancelDelete: () => void
}

const tiltClasses = [
  'sticker-tilt-left',
  'sticker-tilt-right',
  'sticker-tilt-slight',
  '',
]

function getTiltClass(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0
  }
  return tiltClasses[Math.abs(hash) % tiltClasses.length]
}

/* ── 状态图标映射 ── */

const statusIcons: Record<IdeaStatus, ReactNode> = {
  种子: <SeedIcon className="h-3.5 w-3.5" />,
  发酵中: <SproutIcon className="h-3.5 w-3.5" />,
  可行动: <PlantIcon className="h-3.5 w-3.5" />,
}

function StatusBadge({ status }: { status: IdeaStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 organic-shape border px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusIcons[status]}
      {status}
    </span>
  )
}

export default function IdeaCardView({
  idea,
  isSelected,
  confirmDeleteId,
  onSelect,
  onToggleDelete,
  onDelete,
  onCancelDelete,
}: Props) {
  return (
    <article
      className={`relative mb-4 break-inside-avoid rounded-2xl bg-white/45 p-4 backdrop-blur-sm transition-all hover:-translate-y-0.5 ${
        isSelected ? 'bg-white/60' : 'hover:bg-white/55'
      }`}
      style={{
        boxShadow: isSelected
          ? '0 8px 24px -4px rgba(167, 139, 250, 0.1), 0 2px 6px rgba(167, 139, 250, 0.05)'
          : '0 4px 16px -4px rgba(0, 0, 0, 0.04)',
        transform: getTiltClass(idea.id) === 'sticker-tilt-left' ? 'rotate(-0.8deg)'
          : getTiltClass(idea.id) === 'sticker-tilt-right' ? 'rotate(0.6deg)'
          : undefined,
      }}
    >
      <button
        aria-label={`删除 ${idea.title}`}
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-stone-400 transition hover:border-clay-100 hover:bg-clay-50 hover:text-clay-700 focus:outline-none focus:ring-4 focus:ring-clay-100"
        onClick={() => onToggleDelete(idea.id)}
        type="button"
      >
        <Trash2 size={15} />
      </button>

      <button
        className="block w-full pr-9 text-left"
        onClick={() => onSelect(idea.id)}
        type="button"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <StatusBadge status={idea.status} />
          <span className="text-xs text-stone-500">
            {new Date(idea.createdAt).toLocaleDateString('zh-CN')}
          </span>
        </div>
        <h3 className="text-base font-bold leading-snug tracking-normal text-stone-900">
          {idea.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600/80">
          {idea.rawText}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {idea.tags.map((tag) => (
            <span
              className="organic-shape bg-riso-yellow/40 px-2.5 py-0.5 text-xs font-medium text-amber-800"
              key={tag}
            >
              #{tag}
            </span>
          ))}
        </div>
        {idea.error ? (
          <p className="mt-3 organic-shape bg-clay-50 px-3 py-2 text-xs leading-5 text-clay-800">
            {idea.error}
          </p>
        ) : null}
      </button>

      {confirmDeleteId === idea.id ? (
        <div className="mt-3 organic-shape border border-clay-100 bg-cream-50/90 p-3 text-sm text-stone-600">
          <p>要把这颗种子移出库吗？</p>
          <div className="mt-3 flex gap-2">
            <button
              className="organic-shape bg-clay-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-clay-800 focus:outline-none focus:ring-4 focus:ring-clay-100"
              onClick={() => onDelete(idea.id)}
              type="button"
            >
              移出
            </button>
            <button
              className="organic-shape border border-moss-100 bg-white/80 px-3 py-1.5 text-xs text-stone-600 transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-moss-100"
              onClick={onCancelDelete}
              type="button"
            >
              先留着
            </button>
          </div>
        </div>
      ) : null}
    </article>
  )
}
