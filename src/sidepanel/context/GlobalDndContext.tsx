import {
  createContext,
  useCallback,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { BookOutlined } from "@ant-design/icons";
import { getFaviconUrl } from "@/sidepanel/services/faviconService";
import { truncateUrl } from "@/sidepanel/utils/format";

// 书签图标组件，处理 favicon 加载失败的情况，与 BookmarkItem 保持一致
function BookmarkIcon({ url }: { url?: string }) {
  const [error, setError] = useState(false);
  const faviconSrc = url && !error ? getFaviconUrl(url, 32) : undefined;

  if (faviconSrc) {
    return (
      <img
        src={faviconSrc}
        alt=""
        style={{ width: 16, height: 16, borderRadius: 2, flexShrink: 0 }}
        onError={() => setError(true)}
      />
    );
  }

  // 回退到与 BookmarkItem 相同的 BookOutlined 图标
  return <BookOutlined style={{ fontSize: 16, color: "#6366f1" }} />;
}

interface DragItemData {
  type: "bookmark" | "folder";
  title: string;
  url?: string;
  faviconUrl?: string;
}

interface DragState {
  isDragging: boolean;
  source: "content" | "dock" | null;
  activeId: UniqueIdentifier | null;
  activeIds: string[];
  activeItem: DragItemData | null;
}

interface GlobalDndContextValue extends DragState {
  isOverDock: boolean;
}

const GlobalDndContext = createContext<GlobalDndContextValue>({
  isDragging: false,
  source: null,
  activeId: null,
  activeIds: [],
  activeItem: null,
  isOverDock: false,
});

export function useGlobalDnd() {
  return useContext(GlobalDndContext);
}

interface GlobalDndProviderProps {
  children: ReactNode;
  onDragStart?: (ids: string[]) => void;
  onDragEnd?: () => void;
  onDropToDock?: (ids: string[]) => void;
  renderOverlay?: (item: DragItemData, count: number) => ReactNode;
}

export const DOCK_DROPPABLE_ID = "dock-drop-zone";

export function GlobalDndProvider({
  children,
  onDragStart,
  onDragEnd,
  onDropToDock,
  renderOverlay,
}: GlobalDndProviderProps) {
  const [state, setState] = useState<DragState>({
    isDragging: false,
    source: null,
    activeId: null,
    activeIds: [],
    activeItem: null,
  });
  const [isOverDock, setIsOverDock] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const data = active.data.current;
      const ids = data?.ids || [active.id as string];

      const activeItem: DragItemData = {
        type: data?.type || "bookmark",
        title: data?.title || "",
        url: data?.url,
        faviconUrl: data?.faviconUrl,
      };

      setState({
        isDragging: true,
        source: data?.source || "content",
        activeId: active.id,
        activeIds: ids,
        activeItem,
      });

      onDragStart?.(ids);
    },
    [onDragStart],
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    setIsOverDock(over?.id === DOCK_DROPPABLE_ID);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { over } = event;

      if (over?.id === DOCK_DROPPABLE_ID && state.source === "content") {
        onDropToDock?.(state.activeIds);
      }

      setState({
        isDragging: false,
        source: null,
        activeId: null,
        activeIds: [],
        activeItem: null,
      });
      setIsOverDock(false);
      onDragEnd?.();
    },
    [onDragEnd, onDropToDock, state],
  );

  const handleDragCancel = useCallback(() => {
    setState({
      isDragging: false,
      source: null,
      activeId: null,
      activeIds: [],
      activeItem: null,
    });
    setIsOverDock(false);
    onDragEnd?.();
  }, [onDragEnd]);

  const dragCount = state.activeIds.length;

  const defaultOverlay = useMemo(() => {
    if (!state.activeItem) return null;
    const item = state.activeItem;

    // 书签名称为空时显示 URL，与 BookmarkItem 保持一致
    const displayTitle = item.title || (item.url ? truncateUrl(item.url) : "");

    return (
      <div
        style={{
          background: "var(--color-surface, #fff)",
          border: "2px solid var(--color-primary, #6366f1)",
          borderRadius: 8,
          padding: "8px 16px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          opacity: 0.92,
          maxWidth: 220,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {item.type === "folder" ? (
          // 文件夹使用 Ant Design 的 FolderOutlined 样式颜色
          <span style={{ fontSize: 16, flexShrink: 0, color: "#F59E0B" }}>
            📁
          </span>
        ) : (
          // 书签使用带有错误处理的图标组件
          <BookmarkIcon url={item.url} />
        )}
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--color-text-primary, #1e293b)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayTitle}
        </span>
        {dragCount > 1 && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#fff",
              background: "var(--color-primary, #6366f1)",
              borderRadius: 10,
              padding: "1px 6px",
              flexShrink: 0,
              lineHeight: "16px",
              minWidth: 18,
              textAlign: "center",
            }}
          >
            {dragCount}
          </span>
        )}
      </div>
    );
  }, [state.activeItem, dragCount]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <GlobalDndContext.Provider value={{ ...state, isOverDock }}>
        {children}
      </GlobalDndContext.Provider>
      <DragOverlay dropAnimation={null}>
        {state.isDragging &&
          (renderOverlay
            ? renderOverlay(state.activeItem!, dragCount)
            : defaultOverlay)}
      </DragOverlay>
    </DndContext>
  );
}
