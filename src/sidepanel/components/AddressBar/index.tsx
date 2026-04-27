import { Button } from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useBookmarkContext } from "@/sidepanel/context/BookmarkContext";
import Breadcrumb from "./Breadcrumb";
import styles from "./AddressBar.module.css";

export default function AddressBar() {
  const {
    goBack,
    goForward,
    canGoBack,
    canGoForward,
    refresh,
    currentPath,
    navigateTo,
  } = useBookmarkContext();

  return (
    <div className={styles.addressBar}>
      <div className={styles.navButtons}>
        <Button
          type="text"
          size="small"
          icon={<ArrowLeftOutlined />}
          disabled={!canGoBack}
          onClick={goBack}
        />
        <Button
          type="text"
          size="small"
          icon={<ArrowRightOutlined />}
          disabled={!canGoForward}
          onClick={goForward}
        />
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={refresh}
        />
      </div>
      <Breadcrumb path={currentPath} onNavigate={navigateTo} />
    </div>
  );
}
