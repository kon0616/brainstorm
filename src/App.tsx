import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import {
  defaultAISettings,
  hasUsableAISettings,
  streamIdeaExpansion,
} from './ai'
import type { AISettings, IdeaExpansion } from './ai'
import type { IdeaCard } from './types'
import NoiseOverlay from './components/NoiseOverlay'
import GreenhouseBg from './components/GreenhouseBg'
import HomePage from './components/HomePage'
import GalleryPage from './components/GalleryPage'

const STORAGE_KEY = 'brain-garden-ideas'
const SETTINGS_KEY = 'brain-garden-ai-settings'

const starterIdeas = [
  '把群聊里反复出现的吐槽变成一个温柔的观察小报。',
  '做一个给焦虑时刻用的三分钟决策纸条。',
]

function createIdeaCard(input: string): IdeaCard {
  const text = input.trim()
  const compact = text.replace(/\s+/g, ' ')
  const title =
    compact.length > 18 ? `${compact.slice(0, 18)}...` : compact || '一颗新的种子'
  const hasEmotion = /烦|焦虑|累|怕|开心|生气|压力|崩|喜欢|讨厌/.test(text)
  const hasPeople = /朋友|群聊|同事|用户|大家|我们|他们/.test(text)
  const hasTool = /工具|系统|页面|表格|模板|bot|AI|流程/.test(text)

  const possibleForms = [
    hasTool ? '一个轻量小工具' : '一张可复用卡片',
    hasPeople ? '一份群聊观察记录' : '一篇短札记',
    hasEmotion ? '一个情绪急救清单' : '一个小型实验',
  ]
  const similarForms = possibleForms.map((form) => ({ name: form }))

  const tags = [
    hasEmotion ? '情绪线索' : '想法碎片',
    hasPeople ? '人群观察' : '个人灵感',
    hasTool ? '工具雏形' : '温柔记录',
  ]

  return {
    id: crypto.randomUUID(),
    rawText: text,
    title: `可以先叫它：${title}`,
    coreIdea: `这条脑洞里有一个值得保留的核心：${compact}。先不用证明它有多大，只要看见它正在指向什么。`,
    possibleDirections: possibleForms,
    possibleForms,
    similarProjectForms: similarForms,
    smallestAction:
      '花 10 分钟写下：它适合谁、出现在哪个场景、对方用完后会轻松一点点的原因。',
    fullActionPlan: undefined,
    tags,
    status: hasTool ? '可行动' : hasEmotion ? '发酵中' : '种子',
    createdAt: new Date().toISOString(),
  }
}

function createGrowingIdea(input: string): IdeaCard {
  return {
    id: crypto.randomUUID(),
    rawText: input.trim(),
    title: '正在让这颗脑洞慢慢发芽...',
    coreIdea: '正在听它里面细小、模糊、还没说完的部分。',
    possibleDirections: ['正在延伸可能性...'],
    possibleForms: ['正在寻找适合它的形状...'],
    similarProjectForms: [{ name: '正在寻找相近的柔软形式...' }],
    smallestAction: '正在找一个不会制造压力的小动作。',
    fullActionPlan: undefined,
    tags: ['生长中'],
    status: '发酵中',
    createdAt: new Date().toISOString(),
    isGenerating: true,
    streamingText: '',
  }
}

function createIdeaFromExpansion(rawText: string, expansion: IdeaExpansion): IdeaCard {
  return {
    id: crypto.randomUUID(),
    rawText,
    title: expansion.title,
    coreIdea: expansion.coreIdea,
    possibleDirections: expansion.directions,
    possibleForms: expansion.similarForms.map((form) => form.name),
    similarProjectForms: expansion.similarForms,
    smallestAction: expansion.minimalAction,
    fullActionPlan: expansion.fullActionPlan,
    tags: expansion.tags,
    status: expansion.status,
    createdAt: new Date().toISOString(),
  }
}

function normalizeIdea(idea: IdeaCard): IdeaCard {
  const rawSimilarForms = idea.similarProjectForms ?? idea.possibleForms ?? []
  const similarProjectForms = rawSimilarForms.map((form) =>
    typeof form === 'string' ? { name: form } : form,
  )
  const possibleForms = idea.possibleForms ?? similarProjectForms.map((form) => form.name)

  return {
    ...idea,
    possibleDirections: idea.possibleDirections ?? possibleForms,
    possibleForms,
    similarProjectForms,
    fullActionPlan: idea.fullActionPlan,
  }
}

function loadIdeas(): IdeaCard[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return starterIdeas.map(createIdeaCard)
    const parsed = JSON.parse(saved) as IdeaCard[]
    return Array.isArray(parsed) ? parsed.map(normalizeIdea) : []
  } catch {
    return starterIdeas.map(createIdeaCard)
  }
}

function loadAISettings(): AISettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (!saved) return defaultAISettings
    return { ...defaultAISettings, ...(JSON.parse(saved) as Partial<AISettings>) }
  } catch {
    return defaultAISettings
  }
}

export default function App() {
  const [ideas, setIdeas] = useState<IdeaCard[]>(loadIdeas)
  const [aiSettings, setAISettings] = useState<AISettings>(loadAISettings)
  const [selectedId, setSelectedId] = useState(() => ideas[0]?.id ?? '')
  const [confirmDeleteId, setConfirmDeleteId] = useState('')

  // ── 持久化 ──
  useEffect(() => {
    const persistedIdeas = ideas.map((idea) => {
      const copy = { ...idea }
      delete copy.isGenerating
      delete copy.streamingText
      return copy
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedIdeas))
  }, [ideas])

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(aiSettings))
  }, [aiSettings])

  useEffect(() => {
    if (!selectedId && ideas[0]) {
      setSelectedId(ideas[0].id)
      return
    }
    if (selectedId && !ideas.some((idea) => idea.id === selectedId)) {
      setSelectedId(ideas[0]?.id ?? '')
    }
  }, [ideas, selectedId])

  // ── 收集 ──
  async function handleCollect(rawText: string) {
    if (!rawText) return
    const growingIdea = createGrowingIdea(rawText)
    setIdeas((current) => [growingIdea, ...current])
    setSelectedId(growingIdea.id)

    try {
      if (!hasUsableAISettings(aiSettings)) {
        const fallbackIdea = {
          ...createIdeaCard(rawText),
          id: growingIdea.id,
          error: '还没有接入 AI，这颗种子先安静保存。',
        }
        setIdeas((current) =>
          current.map((idea) => (idea.id === growingIdea.id ? fallbackIdea : idea)),
        )
        return
      }

      const expansion = await streamIdeaExpansion(rawText, aiSettings, (streamingText) => {
        setIdeas((current) =>
          current.map((idea) =>
            idea.id === growingIdea.id ? { ...idea, streamingText } : idea,
          ),
        )
      })
      const completedIdea = createIdeaFromExpansion(rawText, expansion)
      setIdeas((current) =>
        current.map((idea) =>
          idea.id === growingIdea.id ? { ...completedIdea, id: growingIdea.id } : idea,
        ),
      )
    } catch (error) {
      const fallbackIdea = createIdeaCard(rawText)
      setIdeas((current) =>
        current.map((idea) =>
          idea.id === growingIdea.id
            ? {
                ...fallbackIdea,
                id: growingIdea.id,
                error:
                  error instanceof Error
                    ? error.message
                    : 'AI 生成暂时没有成功，先保留一版本地整理。',
              }
            : idea,
        ),
      )
    }
  }

  // ── 删除 ──
  function handleDeleteIdea(id: string) {
    const deleteIndex = ideas.findIndex((idea) => idea.id === id)
    const nextIdeas = ideas.filter((idea) => idea.id !== id)
    setIdeas(nextIdeas)
    setConfirmDeleteId('')
    if (selectedId === id) {
      setSelectedId(nextIdeas[deleteIndex]?.id ?? nextIdeas[deleteIndex - 1]?.id ?? '')
    }
  }

  // ── 导入 ──
  async function handleImport(file: File | undefined) {
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as { ideas?: IdeaCard[] } | IdeaCard[]
      const importedIdeas = Array.isArray(parsed) ? parsed : parsed.ideas
      if (!Array.isArray(importedIdeas)) {
        throw new Error('导入文件里没有找到脑洞数据。')
      }
      const nextIdeas = importedIdeas.map(normalizeIdea)
      setIdeas(nextIdeas)
      setSelectedId(nextIdeas[0]?.id ?? '')
    } catch {
      window.alert('导入失败，请确认这是脑洞容器导出的 JSON 文件。')
    }
  }

  return (
    <>
      <GreenhouseBg />
      <NoiseOverlay />
      <main className="relative min-h-screen bg-[linear-gradient(180deg,_#F7F1E1_0%,_#EFE9D8_100%)] px-4 py-5 text-stone-800 sm:px-6 lg:px-8">
        <Routes>
          <Route
            element={
              <HomePage
                ideas={ideas}
                aiSettings={aiSettings}
                onSettingsChange={setAISettings}
                onCollect={handleCollect}
                onDeleteIdea={handleDeleteIdea}
                selectedId={selectedId}
                onImport={handleImport}
              />
            }
            path="/"
          />
          <Route
            element={
              <GalleryPage
                ideas={ideas}
                selectedId={selectedId}
                confirmDeleteId={confirmDeleteId}
                onSelect={setSelectedId}
                onToggleDelete={(id) =>
                  setConfirmDeleteId((current) => (current === id ? '' : id))
                }
                onDelete={handleDeleteIdea}
                onCancelDelete={() => setConfirmDeleteId('')}
              />
            }
            path="/gallery"
          />
        </Routes>
      </main>
    </>
  )
}
