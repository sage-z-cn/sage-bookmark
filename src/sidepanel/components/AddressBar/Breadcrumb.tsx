import { useRef } from 'react'
import type { PathSegment } from '@/types/bookmark'
import { RightOutlined } from '@ant-design/icons'
import { useBreadcrumbOverflow } from './useBreadcrumbOverflow'
import BreadcrumbItem from './BreadcrumbItem'
import OverflowMenu from './OverflowMenu'
import styles from './Breadcrumb.module.css'

interface BreadcrumbProps {
  path: PathSegment[]
  onNavigate: (folderId: string) => void
}

export default function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  const containerRef = useRef<HTMLElement>(null)
  const { overflow, setSegmentRef } = useBreadcrumbOverflow(containerRef, path)

  // 构建被隐藏片段的详细信息
  const hiddenSegments = overflow.hiddenMiddle.map((idx) => ({
    index: idx,
    segment: path[idx],
  }))

  // 所有可见片段索引（按原始顺序），过滤掉越界索引
  const visibleIndices = [...overflow.visibleStart, ...overflow.visibleEnd].filter(
    (idx) => idx < path.length,
  )
  const hasOverflow = overflow.isOverflowing && overflow.hiddenMiddle.every((idx) => idx < path.length)

  return (
    <nav className={styles.breadcrumb} ref={containerRef}>
      {/* 隐藏的测量层：渲染所有片段以测量宽度，但不可见 */}
      <span className={styles.measureLayer}>
        {path.map((_, idx) => (
          <span
            key={`m-${path[idx].id}`}
            className={styles.segment}
            ref={setSegmentRef(idx)}
          >
            {idx > 0 && <RightOutlined className={styles.separator} />}
            <BreadcrumbItem
              title={path[idx].title}
              isActive={false}
              onClick={() => {}}
            />
          </span>
        ))}
      </span>

      {/* 可见层：只渲染可见片段 + 省略号 */}
      {visibleIndices.map((idx, vi) => {
        const isLast = idx === path.length - 1
        // 需要在第一个可见片段后、省略号出现的位置加分隔符
        const showSeparator = idx > 0
        const isLastVisibleStart = vi === overflow.visibleStart.length - 1

        return (
          <span key={path[idx].id} className={styles.segment}>
            {showSeparator && <RightOutlined className={styles.separator} />}
            <BreadcrumbItem
              title={path[idx].title}
              isActive={isLast}
              onClick={() => onNavigate(path[idx].id)}
            />
            {/* 在 visibleStart 最后一个片段后面插入省略号 */}
            {hasOverflow && isLastVisibleStart && (
              <>
                <RightOutlined className={styles.separator} />
                <OverflowMenu
                  hiddenSegments={hiddenSegments}
                  currentSegmentIndex={path.length - 1}
                  onNavigate={onNavigate}
                >
                  <button className={styles.ellipsis} type="button">
                    ...
                  </button>
                </OverflowMenu>
              </>
            )}
          </span>
        )
      })}
    </nav>
  )
}
