import type { AppBookmarkNode, BookmarkIndex } from "@/types/bookmark";

// 将 Chrome 原生节点转换为应用内部节点
function toAppNode(node: chrome.bookmarks.BookmarkTreeNode): AppBookmarkNode {
  const isFolder = !node.url;
  return {
    id: node.id,
    parentId: node.parentId ?? null,
    index: node.index ?? 0,
    title:
      node.title ||
      (node.id === "0" ? "根目录" : isFolder ? "未命名文件夹" : "未命名书签"),
    url: node.url,
    type: isFolder ? "folder" : "bookmark",
    dateAdded: node.dateAdded ?? 0,
    dateGroupModified: node.dateGroupModified,
    children: isFolder ? (node.children ?? []).map(toAppNode) : undefined,
  };
}

// 构建内存索引
function buildIndex(rootNodes: AppBookmarkNode[]): BookmarkIndex {
  const nodeMap = new Map<string, AppBookmarkNode>();
  const childrenMap = new Map<string, AppBookmarkNode[]>();

  function walk(node: AppBookmarkNode) {
    nodeMap.set(node.id, node);
    if (node.type === "folder" && node.children) {
      childrenMap.set(node.id, node.children);
      for (const child of node.children) {
        walk(child);
      }
    }
  }

  for (const root of rootNodes) {
    walk(root);
  }

  return { nodeMap, childrenMap, rootNodes };
}

// 获取节点到根的路径
function getPathToRoot(
  nodeId: string,
  nodeMap: Map<string, AppBookmarkNode>,
): Array<{ id: string; title: string }> {
  const path: Array<{ id: string; title: string }> = [];
  let current = nodeMap.get(nodeId);
  while (current) {
    path.unshift({ id: current.id, title: current.title });
    current = current.parentId ? nodeMap.get(current.parentId) : undefined;
  }
  return path;
}

export const bookmarkService = {
  async getTree(): Promise<BookmarkIndex> {
    const tree = await chrome.bookmarks.getTree();
    const rootNodes = tree.map(toAppNode);
    return buildIndex(rootNodes);
  },

  async getChildren(folderId: string): Promise<AppBookmarkNode[]> {
    const results = await chrome.bookmarks.getChildren(folderId);
    return results.map(toAppNode);
  },

  getPathToRoot,

  // 注册外部变更监听，返回取消函数
  onExternalChange(callback: () => void): () => void {
    const events = [
      chrome.bookmarks.onCreated,
      chrome.bookmarks.onRemoved,
      chrome.bookmarks.onChanged,
      chrome.bookmarks.onMoved,
      chrome.bookmarks.onChildrenReordered,
    ];
    for (const ev of events) {
      ev.addListener(callback);
    }
    return () => {
      for (const ev of events) {
        ev.removeListener(callback);
      }
    };
  },
};
