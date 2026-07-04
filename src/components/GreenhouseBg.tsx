/**
 * 温室结构背景 —— 纯 SVG + CSS，全屏 fixed 层
 *
 * 层次（从后到前）：
 * 1. 暖色径向渐变 —— 阳光穿过穹顶的光晕
 * 2. 顶部桁架线条 —— 三角形屋顶骨架
 * 3. 两侧玻璃骨架 —— 斜线交叉 + 横梁
 * 4. 底部山丘 + 花盆轮廓
 */

/** 在直线路径中注入微小抖动，模拟手绘不完美感 */
function tremble(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  seed: number,
  amplitude = 1.0,
) {
  const mx = (x1 + x2) / 2 + ((seed * 7) % 3 - 1) * amplitude
  const my = (y1 + y2) / 2 + ((seed * 13) % 3 - 1) * amplitude
  return `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`
}

/** 不规则波浪路径（底部山丘） */
function hillPath(points: Array<[number, number]>) {
  if (points.length < 2) return ''
  let d = `M${points[0][0]} ${points[0][1]}`
  for (let i = 1; i < points.length; i++) {
    const [px, py] = points[i - 1]
    const [cx, cy] = points[i]
    const cpx = (px + cx) / 2
    const cpy = py + (cy - py) * 0.3 + ((i * 7) % 5 - 2) * 1.5
    d += ` Q${cpx} ${cpy} ${cx} ${cy}`
  }
  return d
}

/* ── 棕灰色线条色值（配合暖纸底色） ── */
const LINE = 'rgba(120,105,85,0.08)'
const LINE_LIGHT = 'rgba(120,105,85,0.05)'
const LINE_FAINTEST = 'rgba(120,105,85,0.035)'

export default function GreenhouseBg() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ═══ 层 1：阳光光晕（CSS 径向渐变） ═══ */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(253,230,170,0.12) 0%, rgba(253,230,170,0.04) 40%, transparent 70%)',
        }}
      />

      {/* ═══ 层 2-4：SVG 结构线 ═══ */}
      <svg
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <pattern id="grid-dots" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="rgba(120,105,85,0.04)" />
          </pattern>
        </defs>

        {/* ═══════════════════════════════════════════
            顶部桁架 (Trusses) —— 三角形屋顶骨架
            ═══════════════════════════════════════════ */}

        {/* 主桁架 —— 大三角形 */}
        <path d={tremble(300, 120, 720, 15, 70)} stroke={LINE} strokeWidth="0.8" />
        <path d={tremble(720, 15, 1140, 120, 71)} stroke={LINE} strokeWidth="0.8" />
        <path d={tremble(300, 120, 1140, 120, 72)} stroke={LINE_LIGHT} strokeWidth="0.6" />

        {/* 次桁架 —— 内部三角支撑 */}
        <path d={tremble(420, 110, 720, 35, 73)} stroke={LINE_LIGHT} strokeWidth="0.6" />
        <path d={tremble(720, 35, 1020, 110, 74)} stroke={LINE_LIGHT} strokeWidth="0.6" />

        {/* 桁架竖杆 */}
        <path d={tremble(510, 115, 540, 50, 75)} stroke={LINE_FAINTEST} strokeWidth="0.5" />
        <path d={tremble(720, 120, 720, 15, 76)} stroke={LINE_FAINTEST} strokeWidth="0.5" />
        <path d={tremble(930, 115, 900, 50, 77)} stroke={LINE_FAINTEST} strokeWidth="0.5" />

        {/* 桁架斜撑 —— 小 X 形 */}
        <path d={tremble(510, 115, 620, 65, 78)} stroke={LINE_FAINTEST} strokeWidth="0.4" />
        <path d={tremble(620, 115, 510, 65, 79)} stroke={LINE_FAINTEST} strokeWidth="0.4" />
        <path d={tremble(820, 115, 930, 65, 80)} stroke={LINE_FAINTEST} strokeWidth="0.4" />
        <path d={tremble(930, 115, 820, 65, 81)} stroke={LINE_FAINTEST} strokeWidth="0.4" />

        {/* 水平弦杆 */}
        <path d={tremble(350, 85, 1090, 85, 82)} stroke={LINE_FAINTEST} strokeWidth="0.4" />

        {/* ═══════════════════════════════════════════
            山丘轮廓（底部，3 层叠加）
            ═══════════════════════════════════════════ */}

        <path
          d={hillPath([[0, 740], [180, 710], [400, 730], [620, 715], [850, 728], [1080, 710], [1280, 722], [1440, 715]])}
          stroke="rgba(139,184,112,0.06)"
          strokeWidth="0.8"
        />
        <path
          d={hillPath([[0, 785], [150, 758], [350, 775], [560, 762], [780, 778], [1000, 765], [1220, 775], [1440, 768]])}
          stroke="rgba(139,184,112,0.07)"
          strokeWidth="0.8"
        />
        <path
          d={hillPath([[0, 835], [200, 812], [420, 830], [640, 818], [860, 832], [1100, 820], [1300, 828], [1440, 822]])}
          stroke="rgba(139,184,112,0.09)"
          strokeWidth="0.8"
        />

        {/* ═══════════════════════════════════════════
            花盆轮廓（底部）
            ═══════════════════════════════════════════ */}

        <path d="M165 852 L178 888 L252 888 L265 852" stroke="rgba(139,184,112,0.06)" strokeWidth="0.7" />
        <path d="M160 850 Q215 844 270 850" stroke="rgba(139,184,112,0.05)" strokeWidth="0.7" />
        <path d="M1175 856 L1185 888 L1255 888 L1265 856" stroke="rgba(139,184,112,0.06)" strokeWidth="0.7" />
        <path d="M1170 854 Q1220 848 1270 854" stroke="rgba(139,184,112,0.05)" strokeWidth="0.7" />
        <rect x="165" y="860" width="100" height="28" fill="url(#grid-dots)" opacity="0.4" />
        <rect x="1175" y="860" width="90" height="28" fill="url(#grid-dots)" opacity="0.4" />

        {/* ═══════════════════════════════════════════
            两侧玻璃骨架
            ═══════════════════════════════════════════ */}

        {/* 左侧 */}
        <path d={tremble(60, 0, 185, 900, 1)} stroke={LINE_FAINTEST} strokeWidth="0.8" />
        <path d={tremble(115, 0, 230, 900, 2)} stroke={LINE_FAINTEST} strokeWidth="0.6" />
        <path d={tremble(0, 150, 175, 148, 10)} stroke={LINE_FAINTEST} strokeWidth="0.6" />
        <path d={tremble(0, 320, 195, 318, 11)} stroke={LINE_FAINTEST} strokeWidth="0.6" />
        <path d={tremble(0, 490, 210, 488, 12)} stroke={LINE_FAINTEST} strokeWidth="0.6" />
        <path d={tremble(0, 660, 225, 658, 13)} stroke={LINE_FAINTEST} strokeWidth="0.6" />
        <path d={tremble(60, 150, 115, 320, 20)} stroke={LINE_FAINTEST} strokeWidth="0.4" />
        <path d={tremble(115, 150, 60, 320, 21)} stroke={LINE_FAINTEST} strokeWidth="0.4" />
        <path d={tremble(80, 320, 140, 490, 22)} stroke={LINE_FAINTEST} strokeWidth="0.4" />
        <path d={tremble(140, 320, 80, 490, 23)} stroke={LINE_FAINTEST} strokeWidth="0.4" />

        {/* 右侧 */}
        <path d={tremble(1255, 0, 1380, 900, 31)} stroke={LINE_FAINTEST} strokeWidth="0.8" />
        <path d={tremble(1310, 0, 1420, 900, 32)} stroke={LINE_FAINTEST} strokeWidth="0.6" />
        <path d={tremble(1265, 148, 1440, 150, 40)} stroke={LINE_FAINTEST} strokeWidth="0.6" />
        <path d={tremble(1245, 318, 1440, 320, 41)} stroke={LINE_FAINTEST} strokeWidth="0.6" />
        <path d={tremble(1230, 488, 1440, 490, 42)} stroke={LINE_FAINTEST} strokeWidth="0.6" />
        <path d={tremble(1215, 658, 1440, 660, 43)} stroke={LINE_FAINTEST} strokeWidth="0.6" />
        <path d={tremble(1255, 150, 1310, 320, 50)} stroke={LINE_FAINTEST} strokeWidth="0.4" />
        <path d={tremble(1310, 150, 1255, 320, 51)} stroke={LINE_FAINTEST} strokeWidth="0.4" />
        <path d={tremble(1275, 320, 1340, 490, 52)} stroke={LINE_FAINTEST} strokeWidth="0.4" />
        <path d={tremble(1340, 320, 1275, 490, 53)} stroke={LINE_FAINTEST} strokeWidth="0.4" />

        {/* ═══════════════════════════════════════════
            散落装饰 —— 叶子暗示
            ═══════════════════════════════════════════ */}

        <path
          d="M330 685 Q335 675 342 678 Q338 688 330 685Z"
          stroke="rgba(139,184,112,0.05)"
          strokeWidth="0.5"
          fill="rgba(139,184,112,0.015)"
        />
        <path
          d="M1110 692 Q1115 682 1122 685 Q1118 695 1110 692Z"
          stroke="rgba(139,184,112,0.05)"
          strokeWidth="0.5"
          fill="rgba(139,184,112,0.015)"
        />
      </svg>
    </div>
  )
}
