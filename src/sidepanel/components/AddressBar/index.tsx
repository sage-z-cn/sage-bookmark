import { Button, Tooltip } from 'antd'
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useBookmarkContext } from '@/sidepanel/context/BookmarkContext'
import Breadcrumb from './Breadcrumb'
import styles from './AddressBar.module.css'

export default function AddressBar() {
  const { goBack, goForward, canGoBack, canGoForward, refresh, currentPath, navigateTo } = useBookmarkContext()

  return (
    <div className={styles.addressBar}>
      <div className={styles.navButtons}>
        <Tooltip title="后退">
          <Button
            type="text"
            size="small"
            icon={<ArrowLeftOutlined />}
            disabled={!canGoBack}
            onClick={goBack}
          />
        </Tooltip>
        <Tooltip title="前进">
          <Button
            type="text"
            size="small"
            icon={<ArrowRightOutlined />}
            disabled={!canGoForward}
            onClick={goForward}
          />
        </Tooltip>
        <Tooltip title="刷新">
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={refresh}
          />
        </Tooltip>
      </div>
      <Breadcrumb path={currentPath} onNavigate={navigateTo} />
    </div>
  )
}
