import type { FullActionPlan, SimilarForm } from './ai'

export type IdeaStatus = '种子' | '发酵中' | '可行动'

export type IdeaCard = {
  id: string
  rawText: string
  title: string
  coreIdea: string
  possibleDirections: string[]
  possibleForms: string[]
  similarProjectForms: SimilarForm[]
  smallestAction: string
  fullActionPlan?: FullActionPlan
  tags: string[]
  status: IdeaStatus
  createdAt: string
  isGenerating?: boolean
  streamingText?: string
  error?: string
}

export const statusStyles: Record<IdeaStatus, string> = {
  种子: 'bg-riso-yellow/50 text-amber-900 border-riso-yellow',
  发酵中: 'bg-riso-green/50 text-green-900 border-riso-green',
  可行动: 'bg-riso-purple/50 text-purple-900 border-riso-purple',
}
