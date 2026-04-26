import { useCallback, useEffect, useRef, useState } from 'react'
import type { PathSegment } from '@/types/bookmark'

const SEPARATOR_WIDTH = 22 // ">" 图标 + 左右 margin
const OVERFLOW_ELLIPSIS_WIDTH = 36 // "..." 按钮宽度 + padding

export interface OverflowState {
  visibleStart: number[]
  hiddenMiddle: number[]
  visibleEnd: number[]
  isOverflowing: boolean
}

function computeOverflow(
  totalSegments: number,
  availableWidth: number,
  segmentWidths: number[],
): OverflowState {
  // 不需要省略的情况：路径 ≤ 2 层，或总宽度足够
  const totalWidth = segmentWidths.reduce(
    (sum, w) => sum + w + SEPARATOR_WIDTH,
    -SEPARATOR_WIDTH,
  )

  if (totalSegments <= 2 || totalWidth <= availableWidth) {
    return {
      visibleStart: Array.from({ length: totalSegments }, (_, i) => i),
      hiddenMiddle: [],
      visibleEnd: [],
      isOverflowing: false,
    }
  }

  // 始终保留第一段和最后一段
  const firstWidth = segmentWidths[0]
  const lastWidth = segmentWidths[totalSegments - 1]
  const essentialWidth =
    firstWidth + SEPARATOR_WIDTH + OVERFLOW_ELLIPSIS_WIDTH + SEPARATOR_WIDTH + lastWidth

  // 即使只保留首尾也放不下，至少显示首 + ... + 尾
  if (essentialWidth > availableWidth) {
    return {
      visibleStart: [0],
      hiddenMiddle: Array.from({ length: totalSegments - 2 }, (_, i) => i + 1),
      visibleEnd: [totalSegments - 1],
      isOverflowing: true,
    }
  }

  // 从两端尽可能多地保留可见片段
  const visibleStart: number[] = [0]
  const visibleEnd: number[] = [totalSegments - 1]

  let usedWidth = essentialWidth
  let startIdx = 1
  let endIdx = totalSegments - 2

  // 交替尝试从头部和尾部添加片段
  while (startIdx <= endIdx) {
    // 尝试添加头部片段
    const addStartWidth =
      segmentWidths[startIdx] + SEPARATOR_WIDTH
    if (usedWidth + addStartWidth <= availableWidth) {
      visibleStart.push(startIdx)
      usedWidth += addStartWidth
      startIdx++
    } else {
      break
    }

    if (startIdx > endIdx) break

    // 尝试添加尾部片段
    const addEndWidth =
      SEPARATOR_WIDTH + segmentWidths[endIdx]
    if (usedWidth + addEndWidth <= availableWidth) {
      visibleEnd.unshift(endIdx)
      usedWidth += addEndWidth
      endIdx--
    } else {
      break
    }
  }

  const hiddenMiddle: number[] = []
  for (let i = startIdx; i <= endIdx; i++) {
    hiddenMiddle.push(i)
  }

  return {
    visibleStart,
    hiddenMiddle,
    visibleEnd,
    isOverflowing: hiddenMiddle.length > 0,
  }
}

// 生成全显示状态（无省略）
function allVisibleState(length: number): OverflowState {
  return {
    visibleStart: Array.from({ length }, (_, i) => i),
    hiddenMiddle: [],
    visibleEnd: [],
    isOverflowing: false,
  }
}

export function useBreadcrumbOverflow(
  containerRef: React.RefObject<HTMLElement | null>,
  segments: PathSegment[],
) {
  const segmentCount = segments.length
  const [overflow, setOverflow] = useState<OverflowState>(() =>
    allVisibleState(segmentCount),
  )
  const segmentRefs = useRef<(HTMLElement | null)[]>([])
  const rafIdRef = useRef(0)

  const recalc = useCallback(() => {
    const container = containerRef.current
    if (!container || segmentCount === 0) {
      setOverflow(allVisibleState(segmentCount))
      return
    }

    const availableWidth = container.clientWidth
    const widths = segmentRefs.current.map(
      (el) => el?.getBoundingClientRect().width ?? 0,
    )

    setOverflow(computeOverflow(segmentCount, availableWidth, widths))
  }, [containerRef, segmentCount])

  // segments 变化时立即重置为全显示，避免旧索引越界
  useEffect(() => {
    setOverflow(allVisibleState(segmentCount))
    segmentRefs.current = []
  }, [segmentCount])

  // 监听容器宽度变化
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = requestAnimationFrame(recalc)
    })

    observer.observe(container)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafIdRef.current)
    }
  }, [containerRef, recalc])

  // 路径变化后等 DOM 更新再重新计算
  useEffect(() => {
    // 使用 rAF 确保 DOM 已渲染测量层后再计算宽度
    rafIdRef.current = requestAnimationFrame(recalc)
    return () => cancelAnimationFrame(rafIdRef.current)
  }, [recalc, segmentCount])

  // 注册片段 DOM 引用的回调
  const setSegmentRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      segmentRefs.current[index] = el
    },
    [],
  )

  return { overflow, setSegmentRef }
}
