import { Link } from 'react-router-dom'
import { Grid3X3, Sprout } from 'lucide-react'
import type { AISettings } from '../ai'
import type { IdeaCard } from '../types'
import Omnibar from './Omnibar'
import ActionGuide from './ActionGuide'

type Props = {
  ideas: IdeaCard[]
  aiSettings: AISettings
  onSettingsChange: (settings: AISettings) => void
  onCollect: (rawText: string) => void
  onDeleteIdea: (id: string) => void
  selectedId: string
  onImport: (file: File | undefined) => void
}

/* ── SVG 屋顶线框 ── */
function RoofTruss() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1200 120"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <path d="M100 110 L600 10 L1100 110" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      <path d="M250 110 L600 30 L950 110" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />
      <line x1="600" y1="10" x2="600" y2="110" stroke="rgba(0,0,0,0.05)" strokeWidth="0.6" />
      <line x1="350" y1="110" x2="420" y2="50" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" />
      <line x1="850" y1="110" x2="780" y2="50" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" />
      <line x1="200" y1="75" x2="1000" y2="75" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" />
      <line x1="350" y1="110" x2="500" y2="50" stroke="rgba(0,0,0,0.03)" strokeWidth="0.4" />
      <line x1="500" y1="110" x2="350" y2="50" stroke="rgba(0,0,0,0.03)" strokeWidth="0.4" />
      <line x1="700" y1="110" x2="850" y2="50" stroke="rgba(0,0,0,0.03)" strokeWidth="0.4" />
      <line x1="850" y1="110" x2="700" y2="50" stroke="rgba(0,0,0,0.03)" strokeWidth="0.4" />
    </svg>
  )
}

export default function HomePage({
  ideas,
  aiSettings,
  onSettingsChange,
  onCollect,
  selectedId,
  onImport,
}: Props) {
  const selectedIdea = ideas.find((idea) => idea.id === selectedId)
  const isGenerating = ideas.some((idea) => idea.isGenerating)

  return (
    <div className="relative mx-auto max-w-4xl">
      {/* ═══════════════════════════════════════════════════════
          SVG 屋顶线框
          ═══════════════════════════════════════════════════════ */}
      <div className="relative h-28">
        <RoofTruss />
      </div>

      {/* ═══════════════════════════════════════════════════════
          标题区
          ═══════════════════════════════════════════════════════ */}
      <div className="flex flex-col items-center gap-2 pb-8 text-center">
        <p className="flex items-center gap-2 text-sm font-medium text-moss-700/70">
          <Sprout size={15} />
          脑洞收集容器
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-stone-800/90 md:text-4xl">
          把零散想法放进温室里
        </h1>
        <p className="max-w-md text-sm leading-6 text-stone-500/80">
          只负责接住碎片，然后轻轻整理成能看见下一步的脑洞卡片。
        </p>
        <Link
          to="/gallery"
          className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/50 px-3 py-1 text-xs font-medium text-moss-700/70 backdrop-blur-sm transition hover:bg-white/70"
        >
          <Grid3X3 size={13} />
          浏览画廊
        </Link>
      </div>

      {/* ═══════════════════════════════════════════════════════
          全能收集舱 (Omnibar)
          ═══════════════════════════════════════════════════════ */}
      <div className="pb-10">
        <Omnibar
          aiSettings={aiSettings}
          onSettingsChange={onSettingsChange}
          onCollect={onCollect}
          onImport={onImport}
          isGenerating={isGenerating}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════
          行动指南培育区 —— 居中，独占主舞台
          ═══════════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-3xl">
        <ActionGuide idea={selectedIdea} />
      </div>
    </div>
  )
}
