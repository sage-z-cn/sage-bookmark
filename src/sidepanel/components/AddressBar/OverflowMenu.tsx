import { Dropdown, type MenuProps } from 'antd'
import { FolderOutlined } from '@ant-design/icons'
import type { PathSegment } from '@/types/bookmark'
import styles from './Breadcrumb.module.css'

interface OverflowMenuProps {
  hiddenSegments: { index: number; segment: PathSegment }[]
  currentSegmentIndex: number
  onNavigate: (folderId: string) => void
  children: React.ReactNode
}

export default function OverflowMenu({
  hiddenSegments,
  currentSegmentIndex,
  onNavigate,
  children,
}: OverflowMenuProps) {
  const menuItems: MenuProps['items'] = hiddenSegments.map(
    ({ index, segment }) => ({
      key: segment.id,
      label: segment.title || '根目录',
      icon: <FolderOutlined />,
      onClick: () => onNavigate(segment.id),
      className:
        index === currentSegmentIndex ? styles.menuItemActive : undefined,
    }),
  )

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomLeft"
    >
      {children}
    </Dropdown>
  )
}
