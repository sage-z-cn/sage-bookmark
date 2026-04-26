import { useState, useMemo, useCallback, useEffect } from "react";
import type { AppBookmarkNode, BookmarkIndex } from "@/types/bookmark";

export type SearchScope = "current" | "global";

export interface SearchResult {
  item: AppBookmarkNode;
  matchedTitle: boolean;
  matchedUrl: boolean;
  path?: Array<{ id: string; title: string }>;
}

interface UseSearchOptions {
  index: BookmarkIndex | null;
  currentNodeId: string;
}

// 防抖 Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// 检查节点是否在指定文件夹下（包含子文件夹）
function isUnderFolder(
  nodeId: string,
  folderId: string,
  nodeMap: Map<string, AppBookmarkNode>,
): boolean {
  let current = nodeMap.get(nodeId);
  while (current) {
    if (current.id === folderId) return true;
    current = current.parentId ? nodeMap.get(current.parentId) : undefined;
  }
  return false;
}

// 模糊匹配：检查文本是否包含查询词（不区分大小写）
function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return false;
  return text.toLowerCase().includes(query.toLowerCase());
}

export function useSearch({ index, currentNodeId }: UseSearchOptions) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const isActive = debouncedQuery.length > 0;

  // 执行搜索（始终在当前文件夹及其子文件夹中搜索）
  const results = useMemo<SearchResult[]>(() => {
    if (!isActive || !index) return [];

    const q = debouncedQuery.trim();
    if (!q) return [];

    const matches: SearchResult[] = [];
    const seen = new Set<string>();

    // 遍历所有节点进行匹配
    for (const [id, node] of index.nodeMap) {
      if (seen.has(id)) continue;

      const matchedTitle = fuzzyMatch(node.title, q);
      const matchedUrl = node.url ? fuzzyMatch(node.url, q) : false;

      if (matchedTitle || matchedUrl) {
        // 始终过滤：只显示当前文件夹及其子文件夹中的结果
        if (
          !isUnderFolder(id, currentNodeId, index.nodeMap) &&
          id !== currentNodeId
        ) {
          continue;
        }

        seen.add(id);
        matches.push({
          item: node,
          matchedTitle,
          matchedUrl,
        });
      }
    }

    return matches;
  }, [debouncedQuery, index, currentNodeId, isActive]);

  // 清空搜索
  const clearSearch = useCallback(() => {
    setQuery("");
  }, []);

  // 关闭搜索
  const closeSearch = useCallback(() => {
    setQuery("");
  }, []);

  return {
    query,
    setQuery,
    debouncedQuery,
    isActive,
    results,
    clearSearch,
    closeSearch,
  };
}
