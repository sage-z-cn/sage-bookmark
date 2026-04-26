export interface AppBookmarkNode {
  id: string
  parentId: string | null
  index: number
  title: string
  url?: string
  type: 'bookmark' | 'folder'
  dateAdded: number
  dateGroupModified?: number
  faviconUrl?: string
  children?: AppBookmarkNode[]
}

export interface DisplayItem {
  id: string
  title: string
  type: 'bookmark' | 'folder'
  url?: string
  domain?: string
  faviconUrl?: string
  dateAdded: number
  dateAddedFormatted: string
}

export interface BookmarkIndex {
  nodeMap: Map<string, AppBookmarkNode>
  childrenMap: Map<string, AppBookmarkNode[]>
  rootNodes: AppBookmarkNode[]
}

export interface PathSegment {
  id: string
  title: string
}
