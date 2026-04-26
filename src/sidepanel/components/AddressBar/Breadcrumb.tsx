import type { PathSegment } from '@/types/bookmark'
import { RightOutlined } from '@ant-design/icons'
import styles from './Breadcrumb.module.css'

interface BreadcrumbProps {
  path: PathSegment[]
  onNavigate: (folderId: string) => void
}

export default function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  return (
    <nav className={styles.breadcrumb}>
      {path.map((segment, idx) => (
        <span key={segment.id} className={styles.segment}>
          {idx > 0 && <RightOutlined className={styles.separator} />}
          <button
            className={`${styles.crumb} ${idx === path.length - 1 ? styles.crumbActive : ''}`}
            onClick={() => onNavigate(segment.id)}
            type="button"
          >
            {segment.title || '根目录'}
          </button>
        </span>
      ))}
    </nav>
  )
}
