import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { AppBookmarkNode, BookmarkIndex, PathSegment } from '@/types/bookmark'
import { bookmarkService } from '@/sidepanel/services/bookmarkService'

interface BookmarkContextValue {
  index: BookmarkIndex | null
  loading: boolean
  currentNodeId: string
  currentItems: AppBookmarkNode[]
  currentPath: PathSegment[]
  selectedIds: Set<string>
  navigateTo: (folderId: string) => void
  goBack: () => void
  goForward: () => void
  canGoBack: boolean
  canGoForward: boolean
  refresh: () => void
  toggleSelect: (id: string, multi?: boolean) => void
  clearSelection: () => void
  selectAll: () => void
}

const BookmarkContext = createContext<BookmarkContextValue | null>(null)

export function useBookmarkContext() {
  const ctx = useContext(BookmarkContext)
  if (!ctx) throw new Error('useBookmarkContext must be used within BookmarkProvider')
  return ctx
}

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState<BookmarkIndex | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentNodeId, setCurrentNodeId] = useState('1')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // 导航历史栈
  const historyRef = useRef<string[]>(['1'])
  const historyIdxRef = useRef(0)

  // 加载书签树
  const loadTree = useCallback(async () => {
    setLoading(true)
    try {
      const idx = await bookmarkService.getTree()
      setIndex(idx)
      // 默认进入 "书签栏"（id 为 "1"）
      const bookmarkBarId = '1'
      if (idx.nodeMap.has(bookmarkBarId)) {
        setCurrentNodeId(bookmarkBarId)
      } else if (idx.rootNodes.length > 0 && idx.rootNodes[0].children?.length) {
        // 回退：取第一个有子节点的根
        const firstChild = idx.rootNodes[0].children[0]
        setCurrentNodeId(firstChild.id)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTree()
  }, [loadTree])

  // 监听外部变更，刷新索引
  useEffect(() => {
    const cleanup = bookmarkService.onExternalChange(() => {
      loadTree()
    })
    return cleanup
  }, [loadTree])

  // 当前文件夹子项
  const currentItems = useMemo<AppBookmarkNode[]>(() => {
    if (!index) return []
    return index.childrenMap.get(currentNodeId) ?? []
  }, [index, currentNodeId])

  // 当前路径（面包屑）
  const currentPath = useMemo<PathSegment[]>(() => {
    if (!index) return []
    return bookmarkService.getPathToRoot(currentNodeId, index.nodeMap)
  }, [index, currentNodeId])

  // 导航到指定文件夹
  const navigateTo = useCallback((folderId: string) => {
    setCurrentNodeId(folderId)
    setSelectedIds(new Set())

    // 截断前进历史，压入新节点
    const history = historyRef.current
    const idx = historyIdxRef.current
    historyRef.current = [...history.slice(0, idx + 1), folderId]
    historyIdxRef.current = historyRef.current.length - 1
  }, [])

  const canGoBack = historyIdxRef.current > 0
  const canGoForward = historyIdxRef.current < historyRef.current.length - 1

  const goBack = useCallback(() => {
    if (historyIdxRef.current <= 0) return
    historyIdxRef.current -= 1
    const prevId = historyRef.current[historyIdxRef.current]
    setCurrentNodeId(prevId)
    setSelectedIds(new Set())
  }, [])

  const goForward = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return
    historyIdxRef.current += 1
    const nextId = historyRef.current[historyIdxRef.current]
    setCurrentNodeId(nextId)
    setSelectedIds(new Set())
  }, [])

  const refresh = useCallback(() => {
    loadTree()
  }, [loadTree])

  // 选择操作
  const toggleSelect = useCallback((id: string, multi = false) => {
    setSelectedIds(prev => {
      const next = new Set(multi ? prev : [])
      if (multi && prev.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(currentItems.map(item => item.id)))
  }, [currentItems])

  const value = useMemo<BookmarkContextValue>(() => ({
    index,
    loading,
    currentNodeId,
    currentItems,
    currentPath,
    selectedIds,
    navigateTo,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
    refresh,
    toggleSelect,
    clearSelection,
    selectAll,
  }), [
    index, loading, currentNodeId, currentItems, currentPath, selectedIds,
    navigateTo, goBack, goForward, canGoBack, canGoForward, refresh,
    toggleSelect, clearSelection, selectAll,
  ])

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  )
}
