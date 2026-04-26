import { useRef, useEffect } from "react";
import { SearchOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Select } from "antd";
import styles from "./SearchBar.module.css";

export type SearchScope = "current" | "global";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  scope: SearchScope;
  onScopeChange: (scope: SearchScope) => void;
  onClose?: () => void;
}

export default function SearchBar({
  query,
  onQueryChange,
  scope,
  onScopeChange,
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

      <Select
        className={styles.scopeSelect}
        size="small"
        value={scope}
        onChange={(value) => onScopeChange(value as SearchScope)}
        options={[
          { value: "current", label: "当前文件夹" },
          { value: "global", label: "全局搜索" },
        ]}
        style={{ width: 110 }}
      />
    </div>
  );
}
