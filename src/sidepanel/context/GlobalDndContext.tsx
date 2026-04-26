import {
  createContext,
  useCallback,
  useContext,
  useState,
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

interface DragState {
  isDragging: boolean;
  source: "content" | "dock" | null;
  activeId: UniqueIdentifier | null;
  activeIds: string[];
}

interface GlobalDndContextValue extends DragState {
  isOverDock: boolean;
}

const GlobalDndContext = createContext<GlobalDndContextValue>({
  isDragging: false,
  source: null,
  activeId: null,
  activeIds: [],
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
  renderOverlay?: () => ReactNode;
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

      setState({
        isDragging: true,
        source: data?.source || "content",
        activeId: active.id,
        activeIds: ids,
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
      const { active, over } = event;

      // 检查是否拖到 Dock 栏
      if (over?.id === DOCK_DROPPABLE_ID && state.source === "content") {
        onDropToDock?.(state.activeIds);
      }

      setState({
        isDragging: false,
        source: null,
        activeId: null,
        activeIds: [],
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
    });
    setIsOverDock(false);
    onDragEnd?.();
  }, [onDragEnd]);

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
        {state.isDragging && renderOverlay?.()}
      </DragOverlay>
    </DndContext>
  );
}
