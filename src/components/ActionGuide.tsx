import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  Clipboard,
  ClipboardCheck,
  ExternalLink,
} from 'lucide-react'
import { hasFullActionPlan } from '../ai'
import type { FullActionPlan, SimilarForm } from '../ai'
import type { IdeaCard, IdeaStatus } from '../types'
import { statusStyles } from '../types'
import StepBadge from './StepBadge'
import { SeedIcon, SproutIcon, PlantIcon } from './StatusIcons'

type Props = {
  idea: IdeaCard | undefined
}

/* ── 状态图标映射 ── */

const statusIcons: Record<IdeaStatus, ReactNode> = {
  种子: <SeedIcon className="h-4 w-4" />,
  发酵中: <SproutIcon className="h-4 w-4" />,
  可行动: <PlantIcon className="h-4 w-4" />,
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

/* ── 生长中的嫩芽 SVG —— 从卡片上边缘延伸出去 ── */

function GrowingSprout() {
  return (
    <div
      className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2"
      style={{ zIndex: 11 }}
    >
      <svg
        width="32"
        height="36"
        viewBox="0 0 32 36"
        fill="none"
        stroke="rgba(139, 184, 112, 0.5)"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        {/* 茎 —— 从下往上弯曲生长 */}
        <path d="M16 36 C16 28 14 22 16 16 C18 10 16 6 16 4" />
        {/* 左叶 */}
        <path d="M16 18 C12 16 9 14 8 10 C12 11 15 14 16 18" />
        {/* 右叶 */}
        <path d="M16 14 C20 12 23 10 24 7 C20 8 17 11 16 14" />
        {/* 顶部嫩芽尖 */}
        <circle cx="16" cy="3" r="1.5" fill="rgba(139,184,112,0.3)" stroke="none" />
      </svg>
    </div>
  )
}

/* ── 辅助子组件 ── */

function GentleList({ items }: { items: string[] }) {
  if (!items.length) {
    return <p className="text-stone-400 italic">暂时还空着。</p>
  }

  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          className="flex items-start gap-3 rounded-xl bg-white/30 px-4 py-2.5"
          key={item}
        >
          <StepBadge index={i} variant={['yellow', 'green', 'purple', 'pink'][i % 4] as 'yellow' | 'green' | 'purple' | 'pink'} />
          <span className="pt-0.5 text-sm leading-7 text-stone-700">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function referenceUrlFor(form: SimilarForm) {
  return (
    form.referenceUrl ||
    `https://www.google.com/search?q=${encodeURIComponent(`${form.name} example reference inspiration`)}`
  )
}

function referenceLabelFor(form: SimilarForm) {
  return form.referenceLabel || '找参考'
}

function SimilarFormsList({ forms }: { forms: SimilarForm[] }) {
  return (
    <div className="grid gap-2">
      {forms.map((form) => (
        <div
          className="flex items-center justify-between gap-3 rounded-xl bg-white/30 px-4 py-2 text-sm text-sky-900/80"
          key={`${form.name}-${form.referenceUrl || 'search'}`}
        >
          <span>{form.name}</span>
          <a
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/50 px-2.5 py-1 text-xs text-sky-800/70 backdrop-blur-sm transition hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-riso-blue/10"
            href={referenceUrlFor(form)}
            rel="noreferrer"
            target="_blank"
          >
            {referenceLabelFor(form)}
            <ExternalLink size={12} />
          </a>
        </div>
      ))}
    </div>
  )
}

function PlanBlock({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </p>
      {children}
    </div>
  )
}

function PlanFold({
  label,
  count,
  children,
}: {
  label: string
  count?: number
  children: ReactNode
}) {
  return (
    <details className="group rounded-2xl bg-white/30 backdrop-blur-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-xs font-semibold text-stone-600/80 marker:hidden">
        <span>{label}</span>
        <span className="flex items-center gap-2">
          {typeof count === 'number' ? (
            <span className="organic-shape bg-riso-yellow/50 px-2 py-0.5 text-[11px] font-bold text-amber-800">
              {count}
            </span>
          ) : null}
          <ChevronDown
            className="text-riso-purple-dark transition group-open:rotate-180"
            size={15}
          />
        </span>
      </summary>
      <div className="border-t border-stone-200/30 px-5 py-3">{children}</div>
    </details>
  )
}

function FullActionPlanView({ plan }: { plan?: FullActionPlan }) {
  if (!plan) return null

  return (
    <div className="space-y-5">
      <PlanBlock label="适合做成什么">
        <p className="organic-shape bg-riso-blue/20 pl-5 pr-4 py-3 text-sky-900 font-medium">
          {plan.format || '还没有明确形状。'}
        </p>
      </PlanBlock>

      <PlanFold count={plan.steps.length} label="具体步骤">
        <GentleList items={plan.steps} />
      </PlanFold>

      <PlanFold count={plan.materials.length} label="需要准备的素材">
        <GentleList items={plan.materials} />
      </PlanFold>

      <PlanFold count={plan.collaborators.length} label="可以邀请谁参与">
        <GentleList items={plan.collaborators} />
      </PlanFold>

      <PlanFold count={plan.possibleBlocks.length} label="可能遇到的卡点">
        <GentleList items={plan.possibleBlocks} />
      </PlanFold>

      <div className="grid gap-4 xl:grid-cols-2">
        <PlanBlock label="低压力版本">
          <div className="organic-shape sticker-tilt-left">
            <p className="bg-riso-green/25 pl-5 pr-4 py-3 text-green-900 font-medium leading-8">
              {plan.lowPressureVersion || '先把它放着，只写一句旁注也可以。'}
            </p>
          </div>
        </PlanBlock>

        <PlanFold label="进阶版本">
          <div className="organic-shape sticker-tilt-right">
            <p className="bg-riso-yellow/25 pl-5 pr-4 py-3 text-amber-900 font-medium leading-8">
              {plan.advancedVersion || '等它更清楚一点，再扩成一个小实验。'}
            </p>
          </div>
        </PlanFold>
      </div>
    </div>
  )
}

/* ── 主组件 ── */

export default function ActionGuide({ idea }: Props) {
  const [copyDone, setCopyDone] = useState(false)

  function formatActionGuide(selectedIdea: IdeaCard) {
    const plan = selectedIdea.fullActionPlan
    const lines = [
      `# ${selectedIdea.title}`,
      '',
      `状态：${selectedIdea.status}`,
      '',
      '## 原始脑洞',
      selectedIdea.rawText,
      '',
      '## 核心想法',
      selectedIdea.coreIdea,
      '',
      '## 最小行动',
      selectedIdea.smallestAction,
      '',
      '## 可能延伸方向',
      ...selectedIdea.possibleDirections.map((d) => `- ${d}`),
      '',
      '## 类似项目形式',
      ...selectedIdea.similarProjectForms.map((form) => {
        const label = referenceLabelFor(form)
        const url = form.referenceUrl
        return url ? `- ${form.name}：${label} ${url}` : `- ${form.name}`
      }),
    ]

    if (hasFullActionPlan(plan)) {
      lines.push(
        '',
        '## 完整行动操作方案',
        `适合做成什么：${plan?.format || '还没有明确形状。'}`,
        '',
        '具体步骤：',
        ...((plan?.steps.length ? plan.steps : ['暂时还空着。']).map((item) => `- ${item}`)),
        '',
        '需要准备的素材：',
        ...((plan?.materials.length ? plan.materials : ['暂时还空着。']).map((item) => `- ${item}`)),
        '',
        '可以邀请谁参与：',
        ...((plan?.collaborators.length ? plan.collaborators : ['暂时还空着。']).map((item) => `- ${item}`)),
        '',
        '可能遇到的卡点：',
        ...((plan?.possibleBlocks.length ? plan.possibleBlocks : ['暂时还空着。']).map((item) => `- ${item}`)),
        '',
        `低压力版本：${plan?.lowPressureVersion || '先把它放着，只写一句旁注也可以。'}`,
        `进阶版本：${plan?.advancedVersion || '等它更清楚一点，再扩成一个小实验。'}`,
      )
    }

    return lines.join('\n')
  }

  async function handleCopy() {
    if (!idea) return
    await navigator.clipboard.writeText(formatActionGuide(idea))
    setCopyDone(true)
    window.setTimeout(() => setCopyDone(false), 1600)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── 标题栏 ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sky-800">
          <CheckCircle2 size={22} className="text-riso-purple-dark" />
          <h2 className="text-xl font-bold tracking-normal">行动指南</h2>
        </div>
        {idea ? (
          <button
            className="organic-shape inline-flex items-center gap-2 border border-riso-purple/30 bg-white/75 px-4 py-2 text-sm font-medium text-riso-purple-dark transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-riso-purple/20"
            onClick={handleCopy}
            type="button"
          >
            {copyDone ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
            {copyDone ? '已复制' : '复制行动指南'}
          </button>
        ) : null}
      </div>

      {idea ? (
        <div className="flex flex-col" style={{ gap: '2.5rem' }}>
          {/* ═══════════════════════════════════════════════
              标题区 —— 纯文本漂浮
              ═══════════════════════════════════════════════ */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <StatusBadge status={idea.status} />
              <span className="text-xs text-stone-400/70">
                {new Date(idea.createdAt).toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
          <h3 className="-mt-4 text-3xl font-bold leading-tight tracking-tight text-stone-800/90">
            {idea.title}
          </h3>

          {/* ═══════════════════════════════════════════════
              核心卡片 —— 无边框、毛玻璃、彩色光晕
              ═══════════════════════════════════════════════ */}
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            {/* ── 核心想法 ── */}
            <div
              className="relative rounded-3xl bg-white/50 backdrop-blur-sm p-6"
              style={{
                boxShadow: '0 8px 32px -4px rgba(167, 139, 250, 0.12), 0 2px 8px rgba(167, 139, 250, 0.06)',
                transform: 'rotate(-0.8deg)',
              }}
            >
              <div className="washi-tape washi-tape-purple" />
              <p className="mb-3 text-xs font-bold text-riso-purple-dark/70 uppercase tracking-widest">
                核心想法
              </p>
              <p className="text-base leading-8 text-stone-700/90">{idea.coreIdea}</p>
            </div>

            {/* ── 最小行动 ── */}
            <div className="relative">
              <GrowingSprout />
              <div
                className="relative rounded-3xl bg-white/50 backdrop-blur-sm p-6"
                style={{
                  boxShadow: '0 8px 32px -4px rgba(139, 184, 112, 0.12), 0 2px 8px rgba(139, 184, 112, 0.06)',
                  transform: 'rotate(0.6deg)',
                }}
              >
                <div className="washi-tape" />
                <p className="mb-3 text-xs font-bold text-green-800/70 uppercase tracking-widest">
                  今天先做这一小步
                </p>
                <p className="text-base leading-8 text-green-900/70">
                  {idea.smallestAction}
                </p>
              </div>
            </div>
          </div>

          {/* ── 生成中提示 ── */}
          {idea.isGenerating && idea.streamingText ? (
            <section>
              <p className="mb-2 text-sm font-semibold text-stone-500/70">
                正在生长的草稿
              </p>
              <p className="max-h-44 overflow-auto rounded-2xl bg-white/40 backdrop-blur-sm p-4 text-sm leading-6 text-stone-600/80">
                {idea.streamingText}
              </p>
            </section>
          ) : null}

          {/* ═══════════════════════════════════════════════
              原始脑洞 & 延伸方向
              ═══════════════════════════════════════════════ */}
          <div className="grid gap-5 xl:grid-cols-2">
            <section
              className="relative rounded-3xl bg-white/45 backdrop-blur-sm p-6"
              style={{
                boxShadow: '0 6px 24px -4px rgba(251, 191, 36, 0.1), 0 2px 6px rgba(251, 191, 36, 0.05)',
                transform: 'rotate(-0.5deg)',
              }}
            >
              <div className="washi-tape washi-tape-yellow" />
              <p className="mb-4 text-base font-bold text-amber-800/80 title-underline">原始脑洞</p>
              <p className="max-h-40 overflow-y-auto rounded-xl bg-white/30 p-4 leading-8 text-stone-700/80">
                {idea.rawText}
              </p>
            </section>

            <section
              className="relative rounded-3xl bg-white/45 backdrop-blur-sm p-6"
              style={{
                boxShadow: '0 6px 24px -4px rgba(139, 184, 112, 0.1), 0 2px 6px rgba(139, 184, 112, 0.05)',
                transform: 'rotate(0.4deg)',
              }}
            >
              <div className="washi-tape" />
              <p className="mb-4 text-base font-bold text-green-800/80 title-underline">
                可能延伸方向
              </p>
              <div className="grid gap-2">
                {idea.possibleDirections.map((direction) => (
                  <span
                    className="rounded-xl bg-white/30 px-4 py-2 text-sm text-green-900/70 leading-7"
                    key={direction}
                  >
                    {direction}
                  </span>
                ))}
              </div>
            </section>
          </div>

          {/* ═══════════════════════════════════════════════
              类似项目形式
              ═══════════════════════════════════════════════ */}
          <section
            className="relative rounded-3xl bg-white/40 backdrop-blur-sm p-6"
            style={{
              boxShadow: '0 6px 24px -4px rgba(125, 211, 252, 0.08)',
              transform: 'rotate(-0.3deg)',
            }}
          >
            <div className="washi-tape washi-tape-purple" />
            <p className="mb-4 text-base font-bold text-sky-900/70 title-underline">
              类似项目形式与参考
            </p>
            <SimilarFormsList forms={idea.similarProjectForms} />
          </section>

          {/* ═══════════════════════════════════════════════
              完整行动操作方案
              ═══════════════════════════════════════════════ */}
          <section>
            <details className="group rounded-3xl bg-white/35 backdrop-blur-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-4 text-sm font-bold text-riso-purple-dark/80 marker:hidden">
                <span>完整行动操作方案</span>
                <ChevronDown
                  className="text-riso-purple-dark transition group-open:rotate-180"
                  size={17}
                />
              </summary>

              <div className="space-y-5 border-t border-stone-200/30 px-6 py-4 text-sm leading-6 text-stone-700/80">
                {hasFullActionPlan(idea.fullActionPlan) ? (
                  <FullActionPlanView plan={idea.fullActionPlan} />
                ) : (
                  <p className="organic-shape bg-riso-yellow/20 pl-5 pr-4 py-3 text-stone-500 italic">
                    还没有生成完整方案。
                  </p>
                )}
              </div>
            </details>
          </section>
        </div>
      ) : (
        <div className="flex min-h-72 flex-col items-center justify-center organic-shape border-2 border-dashed border-riso-purple/30 bg-white/30 text-center text-stone-500">
          <SproutIcon className="mb-3 h-12 w-12 text-riso-purple/30" />
          <p className="text-lg font-medium">先收集一条脑洞，这里会出现下一步。</p>
          <p className="mt-2 text-sm text-stone-400">你的灵感会在温室里慢慢生长</p>
        </div>
      )}
    </div>
  )
}
