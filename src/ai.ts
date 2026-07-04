export type Provider = 'deepseek' | 'openai' | 'other'

export type AISettings = {
  provider: Provider
  apiKey: string
  baseUrl: string
  modelName: string
  useMock: boolean
}

export type IdeaExpansion = {
  title: string
  coreIdea: string
  directions: string[]
  similarForms: SimilarForm[]
  minimalAction: string
  fullActionPlan: FullActionPlan
  tags: string[]
  status: '种子' | '发酵中' | '可行动'
}

export type SimilarForm = {
  name: string
  referenceUrl?: string
  referenceLabel?: string
}

export type FullActionPlan = {
  format: string
  steps: string[]
  materials: string[]
  collaborators: string[]
  possibleBlocks: string[]
  lowPressureVersion: string
  advancedVersion: string
}

export const defaultAISettings: AISettings = {
  provider: 'deepseek',
  apiKey: '',
  baseUrl: 'https://api.deepseek.com',
  modelName: 'deepseek-chat',
  useMock: false,
}

export const providerDefaults: Record<Provider, Pick<AISettings, 'baseUrl' | 'modelName'>> = {
  deepseek: {
    baseUrl: 'https://api.deepseek.com',
    modelName: 'deepseek-chat',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-4o-mini',
  },
  other: {
    baseUrl: '',
    modelName: '',
  },
}

const systemPrompt = `
你是“脑洞收集容器”的陪伴式整理者。

你的任务不是商业分析，不是效率建议，也不是把想法过早变成项目。
你的任务是帮助碎片脑洞继续生长：延伸、联想、提问、保留可能性。

必须遵守：
- 保留未完成感，不把模糊视为缺陷。
- 允许情绪、矛盾、废话、群聊片段、半句话存在。
- 输出温柔、具体、可行动，但不要催促。
- 不要使用 KPI、创业、商业化、效率、增长黑客、规模化、变现、用户增长等语言。
- 不要用“市场机会”“商业模式”“目标用户画像”这类顾问式表达。
- 每个最小行动都应该小到今天就能轻轻做一下，不制造压力。

请只输出 JSON，不要 Markdown，不要额外解释。JSON 结构必须是：
{
  "title": "",
  "coreIdea": "",
  "directions": [],
  "similarForms": [
    {
      "name": "",
      "referenceUrl": "",
      "referenceLabel": ""
    }
  ],
  "minimalAction": "",
  "fullActionPlan": {
    "format": "",
    "steps": [],
    "materials": [],
    "collaborators": [],
    "possibleBlocks": [],
    "lowPressureVersion": "",
    "advancedVersion": ""
  },
  "tags": [],
  "status": ""
}

字段要求：
- directions：3 到 4 个可能延伸方向，像在继续联想，不要收束得太早。
- similarForms：3 到 4 个类似形式，可以是小册、卡片、声音备忘、对话练习、观察记录、轻量网页等。referenceUrl 只放你有把握的公开参考链接；不确定时留空，系统会补搜索链接。
- minimalAction：今天就能做的一小步，不超过一句话，不制造压力。
- fullActionPlan：完整行动操作方案，但语气要轻，像一份可以慢慢展开的路线，不要像任务清单压人。
- status：只能是“种子”“发酵中”“可行动”之一，大多数模糊想法应保留为“种子”或“发酵中”。
`

type LegacyIdeaExpansion = Partial<IdeaExpansion> & {
  possibleDirections?: string[]
  smallestAction?: string
  similarProjectForms?: Array<string | SimilarForm>
}

const emptyFullActionPlan: FullActionPlan = {
  format: '',
  steps: [],
  materials: [],
  collaborators: [],
  possibleBlocks: [],
  lowPressureVersion: '',
  advancedVersion: '',
}

function parseServerSentEvents(chunk: string) {
  return chunk
    .split('\n\n')
    .map((eventBlock) =>
      eventBlock
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.replace(/^data:\s?/, ''))
        .join('\n'),
    )
    .filter(Boolean)
}

function createApiErrorMessage(status: number, detail: string) {
  if (status === 401 || status === 403) {
    return 'API key 无效，请检查设置里的 API Key 是否正确。'
  }

  if (status === 402 || status === 429) {
    return 'API 额度不足或请求过于频繁，请稍后再试。'
  }

  if (status >= 500) {
    return 'AI 服务暂时不稳定，请稍后再试。'
  }

  return detail ? `AI 请求失败：${detail}` : 'AI 请求失败。'
}

function extractJson(text: string) {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)

  if (fenced?.[1]) {
    return fenced[1].trim()
  }

  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1)
  }

  return trimmed
}

function normalizeStatus(status: unknown): IdeaExpansion['status'] {
  return status === '种子' || status === '可行动' || status === '发酵中'
    ? status
    : '发酵中'
}

function normalizeFullActionPlan(plan: Partial<FullActionPlan> | undefined) {
  return {
    format: plan?.format || '',
    steps: Array.isArray(plan?.steps) ? plan.steps : [],
    materials: Array.isArray(plan?.materials) ? plan.materials : [],
    collaborators: Array.isArray(plan?.collaborators) ? plan.collaborators : [],
    possibleBlocks: Array.isArray(plan?.possibleBlocks) ? plan.possibleBlocks : [],
    lowPressureVersion: plan?.lowPressureVersion || '',
    advancedVersion: plan?.advancedVersion || '',
  }
}

function normalizeSimilarForm(form: string | Partial<SimilarForm>): SimilarForm {
  if (typeof form === 'string') {
    return { name: form }
  }

  return {
    name: form.name || '一个可以参考的温柔形式',
    referenceUrl: form.referenceUrl || '',
    referenceLabel: form.referenceLabel || '',
  }
}

function normalizeSimilarForms(forms: unknown) {
  if (!Array.isArray(forms)) {
    return []
  }

  return forms.map((form) => normalizeSimilarForm(form as string | Partial<SimilarForm>))
}

function normalizeExpansion(value: LegacyIdeaExpansion): IdeaExpansion {
  return {
    title: value.title || '一颗还在发芽的脑洞',
    coreIdea: value.coreIdea || '这条脑洞里有一点还没说完的东西，可以先把它轻轻放在这里。',
    directions: Array.isArray(value.directions)
      ? value.directions
      : value.possibleDirections || [],
    similarForms: normalizeSimilarForms(value.similarForms || value.similarProjectForms),
    minimalAction:
      value.minimalAction ||
      value.smallestAction ||
      '先写下三个相关词，不需要判断它们有没有用。',
    fullActionPlan: value.fullActionPlan
      ? normalizeFullActionPlan(value.fullActionPlan)
      : emptyFullActionPlan,
    tags: Array.isArray(value.tags) ? value.tags : ['未完成', '可继续'],
    status: normalizeStatus(value.status),
  }
}

function completionUrl(baseUrl: string) {
  return `${baseUrl.replace(/\/$/, '')}/chat/completions`
}

export function hasUsableAISettings(settings: AISettings) {
  // 只要 apiKey / baseUrl / modelName 填了就走真实 API，忽略 useMock 开关
  return Boolean(
    settings.apiKey.trim() &&
      settings.baseUrl.trim() &&
      settings.modelName.trim(),
  )
}

export function hasFullActionPlan(plan: FullActionPlan | undefined) {
  return Boolean(
    plan &&
      (plan.format ||
        plan.lowPressureVersion ||
        plan.advancedVersion ||
        plan.steps.length ||
        plan.materials.length ||
        plan.collaborators.length ||
        plan.possibleBlocks.length),
  )
}

export async function streamIdeaExpansion(
  rawText: string,
  settings: AISettings,
  onTextDelta: (text: string) => void,
) {
  console.log('[AI] 当前模式:', settings.useMock ? 'Mock(已忽略)' : '真实API',
    '| API Key 存在:', !!settings.apiKey,
    '| Base URL:', settings.baseUrl,
    '| Model:', settings.modelName)

  let response: Response

  try {
    response = await fetch(completionUrl(settings.baseUrl), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `原始脑洞：${rawText}` },
        ],
        response_format: { type: 'json_object' },
        stream: true,
        temperature: 0.8,
      }),
    })
  } catch {
    throw new Error(
      '网络错误：暂时无法连接 AI 服务。若你在浏览器直连第三方 API，可能需要服务商允许跨域请求。',
    )
  }

  if (!response.ok || !response.body) {
    const errorText = await response.text()
    throw new Error(createApiErrorMessage(response.status, errorText))
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const boundary = buffer.lastIndexOf('\n\n')

    if (boundary === -1) {
      continue
    }

    const eventsText = buffer.slice(0, boundary)
    buffer = buffer.slice(boundary + 2)

    for (const data of parseServerSentEvents(eventsText)) {
      if (data === '[DONE]') {
        continue
      }

      const event = JSON.parse(data) as {
        choices?: Array<{
          delta?: { content?: string }
          message?: { content?: string }
          finish_reason?: string | null
        }>
        error?: { message?: string }
      }

      if (event.error) {
        throw new Error(event.error.message || 'AI 服务返回错误。')
      }

      const delta = event.choices?.[0]?.delta?.content

      if (delta) {
        fullText += delta
        onTextDelta(fullText)
      }
    }
  }

  try {
    return normalizeExpansion(JSON.parse(extractJson(fullText)) as Partial<IdeaExpansion>)
  } catch {
    throw new Error('AI 返回内容解析失败，请稍后再试。')
  }
}
