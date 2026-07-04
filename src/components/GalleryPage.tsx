import { Link } from 'react-router-dom'
import { ArrowLeft, Leaf, Sparkles } from 'lucide-react'
import type { IdeaCard } from '../types'
import IdeaCardView from './IdeaCard'

type Props = {
  ideas: IdeaCard[]
  selectedId: string
  confirmDeleteId: string
  onSelect: (id: string) => void
  onToggleDelete: (id: string) => void
  onDelete: (id: string) => void
  onCancelDelete: () => void
}

export default function GalleryPage({
  ideas,
  selectedId,
  confirmDeleteId,
  onSelect,
  onToggleDelete,
  onDelete,
  onCancelDelete,
}: Props) {
  return (
    <div className="relative mx-auto max-w-5xl">
      {/* ── 标题区 ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/50 px-3 py-1.5 text-sm font-medium text-moss-700/70 backdrop-blur-sm transition hover:bg-white/70"
          >
            <ArrowLeft size={14} />
            回到温室
          </Link>
          <div className="flex items-center gap-2 text-moss-700/70">
            <Sparkles size={18} />
            <h1 className="text-2xl font-bold tracking-tight text-stone-800/90">脑洞画廊</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-riso-yellow/30 px-3 py-1 text-sm font-bold text-amber-800/70">
            {ideas.length} 张
          </span>
          <div className="flex items-center gap-1.5 text-xs text-stone-400/60">
            <Leaf size={13} />
            <span>Masonry</span>
          </div>
        </div>
      </div>

      {/* ── 悬挂线 ── */}
      <div className="relative mb-4">
        <div
          className="h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.08) 15%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.08) 85%, transparent 100%)',
          }}
        />
        {/* 铁丝节点 */}
        <div className="absolute -top-[2px] left-[15%] h-[5px] w-[5px] rounded-full bg-stone-400/15" />
        <div className="absolute -top-[2px] left-[50%] h-[5px] w-[5px] rounded-full bg-stone-400/15" />
        <div className="absolute -top-[2px] left-[85%] h-[5px] w-[5px] rounded-full bg-stone-400/15" />
      </div>

      {/* ── Masonry 瀑布流 ── */}
      {ideas.length > 0 ? (
        <div
          className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4"
          style={{ columnFill: 'balance' }}
        >
          {ideas.map((idea) => (
            <IdeaCardView
              idea={idea}
              isSelected={selectedId === idea.id}
              confirmDeleteId={confirmDeleteId}
              onSelect={onSelect}
              onToggleDelete={onToggleDelete}
              onDelete={onDelete}
              onCancelDelete={onCancelDelete}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm text-center text-stone-500/60">
          <Sparkles size={40} className="mb-4 text-stone-300/40" />
          <p className="text-lg font-bold">画廊里还没有脑洞</p>
          <p className="mt-2 text-sm">回到温室去收集第一颗种子吧！</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-riso-purple-dark/70 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-riso-purple-dark"
          >
            <ArrowLeft size={14} />
            去收集
          </Link>
        </div>
      )}
    </div>
  )
}
