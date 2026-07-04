/**
 * 手绘线条风格的状态图标 —— 种子、嫩芽、植物
 * 全部使用 stroke-only 简笔画风格，无 fill
 */

export function SeedIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* 种子主体 —— 一颗不规则的椭圆 */}
      <path d="M12 17c-3.5 0-6-2.5-6-5.5S8.5 6 12 6s6 2.5 6 5.5-2.5 5.5-6 5.5z" />
      {/* 种子上的小裂纹/纹路 */}
      <path d="M12 7.5c0 2-0.8 4.5-0.5 6" />
      <path d="M10 9.5c1 0.8 2.5 1.2 3.5 0.8" />
    </svg>
  )
}

export function SproutIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* 茎 —— 从土里长出来的弯曲小茎 */}
      <path d="M12 20V11" />
      <path d="M12 11c0-3 2-5 4.5-5.5" />
      {/* 左边小叶子 */}
      <path d="M12 14c-2.5-0.5-4.5-2-5-4.5 2.5 0 4.5 1.5 5 4.5z" />
      {/* 右边小叶子 */}
      <path d="M12 11c2-1.5 4-1.5 5.5-0.5-2 0.5-3.5 1.5-5.5 0.5z" />
      {/* 土壤线 */}
      <path d="M7 20.5c1.5-0.5 3-0.8 5-0.8s3.5 0.3 5 0.8" />
    </svg>
  )
}

export function PlantIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* 主茎 */}
      <path d="M12 22V10" />
      {/* 左大叶子 */}
      <path d="M12 15c-3-1-5.5-3-6.5-6.5 3 0.5 5.5 2.5 6.5 6.5z" />
      {/* 右大叶子 */}
      <path d="M12 12c3-1.5 5.5-1.5 7 0-2.5 1-5 1.5-7 0z" />
      {/* 左上小叶子 */}
      <path d="M12 10c-1.5-2-2-4-1.5-6 2 0.5 3 2.5 1.5 6z" />
      {/* 右上小叶子 */}
      <path d="M12 10c1.5-2 3-3 5-3-1.5 1.5-3 3-5 3z" />
      {/* 土壤 */}
      <path d="M6 22.5c2-0.5 4-0.8 6-0.8s4 0.3 6 0.8" />
    </svg>
  )
}
