import { useRef, useEffect } from "react";
import { SearchOutlined, CloseCircleOutlined } from "@ant-design/icons";
import styles from "./SearchBar.module.css";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClose?: () => void;
}

export default function SearchBar({
  query,
  onQueryChange,
  onClose,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动聚焦搜索输入框
  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  // 处理键盘事件
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (query) {
          // 有内容时先清空
          onQueryChange("");
        } else {
          // 无内容时关闭搜索栏
          onClose?.();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [query, onQueryChange, onClose]);

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchInputWrapper}>
        <SearchOutlined className={styles.searchIcon} />
        <input
          ref={inputRef}
          className={styles.searchInput}
          type="text"
          placeholder="搜索书签标题或 URL..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        {query && (
          <CloseCircleOutlined
            className={styles.clearButton}
            onClick={() => onQueryChange("")}
          />
        )}
      </div>
    </div>
  );
}
