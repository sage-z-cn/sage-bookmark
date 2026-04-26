import { FolderOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import type { AppBookmarkNode } from '@/types/bookmark'
import styles from './ContentArea.module.css'

interface FolderItemProps {
  item: AppBookmarkNode
  selected: boolean
  onSelect: (multi: boolean) => void
  onDoubleClick: () => void
}

export default function FolderItem({ item, selected, onSelect, onDoubleClick }: FolderItemProps) {
  return (
    <Tooltip title={item.title} mouseEnterDelay={0.8}>
      <div
        className={`${styles.item} ${selected ? styles.itemSelected : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(e.ctrlKey || e.metaKey)
        }}
        onDoubleClick={(e) => {
          e.stopPropagation()
          onDoubleClick()
        }}
      >
        <div className={styles.itemIcon}>
          <FolderOutlined style={{ fontSize: 40, color: '#F59E0B' }} />
        </div>
        <div className={styles.itemTitle}>{item.title}</div>
      </div>
    </Tooltip>
  )
}
