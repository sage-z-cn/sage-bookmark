import { Button, Dropdown, Tooltip } from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderAddOutlined,
  BookOutlined,
} from '@ant-design/icons'
import { useBookmarkContext } from '@/sidepanel/context/BookmarkContext'
import styles from './Toolbar.module.css'

interface ToolbarProps {
  onCreateBookmark: () => void
  onCreateFolder: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function Toolbar({
  onCreateBookmark,
  onCreateFolder,
  onEdit,
  onDelete,
}: ToolbarProps) {
  const { selectedIds } = useBookmarkContext()
  const hasSelection = selectedIds.size > 0

  // 选中单个书签时可编辑；选中单个文件夹时走行内重命名
  const singleSelected = selectedIds.size === 1

  const newMenuItems = [
    {
      key: 'folder',
      icon: <FolderAddOutlined />,
      label: '新建文件夹',
      onClick: onCreateFolder,
    },
    {
      key: 'bookmark',
      icon: <BookOutlined />,
      label: '新建书签',
      onClick: onCreateBookmark,
    },
  ]

  return (
    <div className={styles.toolbar}>
      {/* 新建下拉菜单 */}
      <Dropdown menu={{ items: newMenuItems }} trigger={['click']}>
        <Button type="primary" icon={<PlusOutlined />} className={styles.newButton}>
          新建
        </Button>
      </Dropdown>

      <div className={styles.separator} />

      {/* 编辑按钮 */}
      <Tooltip title={singleSelected ? '编辑 (F2)' : '选择一个项目以编辑'}>
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          disabled={!singleSelected}
          onClick={onEdit}
        />
      </Tooltip>

      {/* 删除按钮 */}
      <Tooltip title={hasSelection ? `删除 (${selectedIds.size} 项)` : '选择项目以删除'}>
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          disabled={!hasSelection}
          onClick={onDelete}
        />
      </Tooltip>
    </div>
  )
}
