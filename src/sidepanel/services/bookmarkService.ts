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
      (node.id === "0" ? "根目录" : isFolder ? "未命名文件夹" : ""),
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

  // 在指定文件夹下创建书签
  async createBookmark(
    parentId: string,
    title: string,
    url: string,
  ): Promise<AppBookmarkNode> {
    const node = await chrome.bookmarks.create({ parentId, title, url });
    return toAppNode(node);
  },

  // 在指定文件夹下创建子文件夹
  async createFolder(
    parentId: string,
    title: string,
  ): Promise<AppBookmarkNode> {
    const node = await chrome.bookmarks.create({ parentId, title });
    return toAppNode(node);
  },

  // 更新书签标题和 URL
  async updateBookmark(
    id: string,
    title: string,
    url: string,
  ): Promise<AppBookmarkNode> {
    const node = await chrome.bookmarks.update(id, { title, url });
    return toAppNode(node);
  },

  // 重命名（仅修改标题，适用于文件夹和书签）
  async rename(id: string, newTitle: string): Promise<AppBookmarkNode> {
    const node = await chrome.bookmarks.update(id, { title: newTitle });
    return toAppNode(node);
  },

  // 删除单个书签
  async remove(id: string): Promise<void> {
    await chrome.bookmarks.remove(id);
  },

  // 递归删除文件夹及其子内容
  async removeTree(id: string): Promise<void> {
    await chrome.bookmarks.removeTree(id);
  },

  // 批量删除（自动判断书签/文件夹选择对应 API）
  async deleteItems(ids: string[], nodeMap: Map<string, AppBookmarkNode>): Promise<void> {
    for (const id of ids) {
      const node = nodeMap.get(id);
      if (!node) continue;
      if (node.type === "folder") {
        await chrome.bookmarks.removeTree(id);
      } else {
        await chrome.bookmarks.remove(id);
      }
    }
  },

  // 移动书签/文件夹到目标位置
  async move(id: string, parentId: string, index?: number): Promise<AppBookmarkNode> {
    const node = await chrome.bookmarks.move(id, { parentId, index });
    return toAppNode(node);
  },

  // 复制单个书签到目标文件夹（文件夹递归复制）
  async copyItem(
    id: string,
    targetParentId: string,
    nodeMap: Map<string, AppBookmarkNode>,
  ): Promise<void> {
    const node = nodeMap.get(id);
    if (!node) return;
    if (node.type === "bookmark") {
      await chrome.bookmarks.create({
        parentId: targetParentId,
        title: node.title,
        url: node.url,
      });
    } else {
      // 文件夹递归复制
      const newFolder = await chrome.bookmarks.create({
        parentId: targetParentId,
        title: node.title,
      });
      if (node.children) {
        for (const child of node.children) {
          await this.copyItem(child.id, newFolder.id, nodeMap);
        }
      }
    }
  },

  getPathToRoot,

  // 导出书签树为 JSON（递归构建，包含完整子节点结构）
  async exportBookmarks(folderId: string): Promise<AppBookmarkNode> {
    const subTree = await chrome.bookmarks.getSubTree(folderId);
    return toAppNode(subTree[0]);
  },

  // 从 JSON 数据导入书签到指定父文件夹
  async importBookmarks(
    data: AppBookmarkNode,
    targetParentId: string,
  ): Promise<void> {
    const created = await chrome.bookmarks.create({
      parentId: targetParentId,
      title: data.title,
    });
    if (data.children) {
      for (const child of data.children) {
        if (child.type === "folder") {
          await this.importBookmarks(child, created.id);
        } else {
          await chrome.bookmarks.create({
            parentId: created.id,
            title: child.title,
            url: child.url,
          });
        }
      }
    }
  },

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
