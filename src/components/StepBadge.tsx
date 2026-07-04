import type { ReactNode } from 'react'

type StepBadgeProps = {
  index: number
  variant?: 'yellow' | 'green' | 'purple' | 'pink'
  children?: ReactNode
}

const variantStyles: Record<string, string> = {
  yellow: 'bg-riso-yellow text-amber-900 shadow-riso-yellow',
  green: 'bg-riso-green text-green-900 shadow-riso-green',
  purple: 'bg-riso-purple text-purple-900 shadow-riso-purple',
  pink: 'bg-riso-pink text-pink-900 shadow-riso-pink',
}

export default function StepBadge({ index, variant = 'yellow' }: StepBadgeProps) {
  return (
    <span
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm ${variantStyles[variant]}`}
      style={{
        boxShadow: '2px 2px 0px rgba(0,0,0,0.08)',
      }}
    >
      {index + 1}
    </span>
  )
}
