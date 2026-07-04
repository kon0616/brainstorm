import { useState, useRef } from 'react'
import type { FormEvent } from 'react'
import { Plus, Settings, Upload } from 'lucide-react'
import { hasUsableAISettings } from '../ai'
import type { AISettings, Provider } from '../ai'
import { providerDefaults } from '../ai'
import { ChevronDown } from 'lucide-react'

type Props = {
  aiSettings: AISettings
  onSettingsChange: (settings: AISettings) => void
  onCollect: (rawText: string) => void
  onImport: (file: File | undefined) => void
  isGenerating: boolean
}

export default function Omnibar({
  aiSettings,
  onSettingsChange,
  onCollect,
  onImport,
  isGenerating,
}: Props) {
  const [draft, setDraft] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isConfigured = hasUsableAISettings(aiSettings)

  function doSubmit() {
    if (!draft.trim()) return
    onCollect(draft.trim())
    setDraft('')
    setTimeout(() => textareaRef.current?.focus(), 300)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    doSubmit()
  }

  function updateProvider(provider: Provider) {
    onSettingsChange({
      ...aiSettings,
      provider,
      ...providerDefaults[provider],
    })
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* ── 主输入区 ── */}
      <form onSubmit={handleSubmit}>
        <div
          className="relative rounded-3xl bg-white/50 backdrop-blur-md transition-all focus-within:bg-white/70"
          style={{
            boxShadow:
              '0 8px 40px -8px rgba(167, 139, 250, 0.08), 0 2px 12px rgba(0, 0, 0, 0.03)',
          }}
        >
          <textarea
            ref={textareaRef}
            className="min-h-[120px] w-full resize-none rounded-3xl bg-transparent px-6 pt-5 pb-4 text-base leading-7 text-stone-800 outline-none placeholder:text-stone-400/60"
            placeholder="把脑洞丢进来，温室会帮你培育……"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                doSubmit()
              }
            }}
          />

          {/* ── 底部工具栏：设置 + 导入导出 + 提交 ── */}
          <div className="flex items-center justify-between gap-3 border-t border-stone-200/30 px-5 py-3">
            {/* 左侧：幽灵按钮组 */}
            <div className="flex items-center gap-1">
              {/* AI 设置下拉 */}
              <SettingsMenu
                settings={aiSettings}
                onChange={onSettingsChange}
                isConfigured={isConfigured}
                onUpdateProvider={updateProvider}
              />

              {/* 分隔点 */}
              <span className="mx-1 h-3 w-px bg-stone-300/40" />

              {/* 导入 */}
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm text-stone-400 transition hover:bg-white/60 hover:text-stone-600">
                <Upload size={14} />
                导入
                <input
                  accept="application/json,.json"
                  className="sr-only"
                  onChange={(event) => {
                    onImport(event.target.files?.[0])
                    event.target.value = ''
                  }}
                  type="file"
                />
              </label>
            </div>

            {/* 右侧：提交按钮 */}
            <button
              className="inline-flex items-center gap-1.5 rounded-full bg-riso-purple-dark/80 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-riso-purple-dark focus:outline-none focus:ring-2 focus:ring-riso-purple/20 disabled:cursor-not-allowed disabled:bg-riso-purple/30"
              disabled={isGenerating || !draft.trim()}
              type="submit"
            >
              <Plus size={15} />
              {isGenerating ? '生长中...' : '收集'}
            </button>
          </div>
        </div>
      </form>

      {/* ── 提示文字 ── */}
      <p className="mt-2 text-center text-xs text-stone-400/50">
        Cmd/Enter 发送 · 脑洞会被温柔地整理成行动指南
      </p>
    </div>
  )
}

/* ── AI 设置下拉菜单（紧凑幽灵按钮） ── */

function SettingsMenu({
  settings,
  onChange,
  isConfigured,
  onUpdateProvider,
}: {
  settings: AISettings
  onChange: (s: AISettings) => void
  isConfigured: boolean
  onUpdateProvider: (p: Provider) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm text-stone-400 transition hover:bg-white/60 hover:text-stone-600"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <Settings size={14} className="shrink-0" />
        <span>
          {isConfigured ? '已接入' : settings.useMock ? 'Mock' : '未配置'}
        </span>
        <ChevronDown
          size={12}
          className={`text-stone-400 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          {/* 遮罩 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* 下拉面板 */}
          <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-stone-200/50 bg-[#FAF8F5] p-4 shadow-xl">
            <p className="mb-3 text-xs leading-5 text-stone-500">
              API Key 只保存在浏览器本地。
            </p>

            <label className="mb-2 grid gap-1">
              <span className="text-[11px] font-semibold text-stone-500">服务商</span>
              <select
                className="rounded-lg border border-stone-200/50 bg-white/60 px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-riso-green/10"
                value={settings.provider}
                onChange={(event) => onUpdateProvider(event.target.value as Provider)}
              >
                <option value="deepseek">DeepSeek</option>
                <option value="openai">OpenAI</option>
                <option value="other">其他</option>
              </select>
            </label>

            <label className="mb-2 grid gap-1">
              <span className="text-[11px] font-semibold text-stone-500">API Key</span>
              <input
                className="rounded-lg border border-stone-200/50 bg-white/60 px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-riso-green/10"
                placeholder="只保存在本地"
                type="password"
                value={settings.apiKey}
                onChange={(event) => onChange({ ...settings, apiKey: event.target.value })}
              />
            </label>

            <label className="mb-2 grid gap-1">
              <span className="text-[11px] font-semibold text-stone-500">Base URL</span>
              <input
                className="rounded-lg border border-stone-200/50 bg-white/60 px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-riso-green/10"
                placeholder="https://api.deepseek.com"
                value={settings.baseUrl}
                onChange={(event) => onChange({ ...settings, baseUrl: event.target.value })}
              />
            </label>

            <label className="mb-2 grid gap-1">
              <span className="text-[11px] font-semibold text-stone-500">Model</span>
              <input
                className="rounded-lg border border-stone-200/50 bg-white/60 px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-riso-green/10"
                placeholder="deepseek-chat"
                value={settings.modelName}
                onChange={(event) => onChange({ ...settings, modelName: event.target.value })}
              />
            </label>

            <label className="flex items-center justify-between gap-2 rounded-lg bg-riso-yellow/10 px-2.5 py-1.5">
              <span className="text-xs">Mock 模式</span>
              <input
                checked={settings.useMock}
                onChange={(event) => onChange({ ...settings, useMock: event.target.checked })}
                type="checkbox"
                className="h-3.5 w-3.5 accent-riso-yellow-dark"
              />
            </label>
          </div>
        </>
      )}
    </div>
  )
}
