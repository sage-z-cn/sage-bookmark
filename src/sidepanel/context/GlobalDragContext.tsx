import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type DragSource = "content" | "dock" | null;

interface GlobalDragState {
  isDragging: boolean;
  source: DragSource;
  dragIds: string[];
}

interface GlobalDragContextValue extends GlobalDragState {
  startDrag: (source: DragSource, ids: string[]) => void;
  endDrag: () => void;
}

const GlobalDragContext = createContext<GlobalDragContextValue | null>(null);

export function useGlobalDrag() {
  const ctx = useContext(GlobalDragContext);
  if (!ctx) {
    throw new Error("useGlobalDrag must be used within GlobalDragProvider");
  }
  return ctx;
}

export function GlobalDragProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GlobalDragState>({
    isDragging: false,
    source: null,
    dragIds: [],
  });

  const startDrag = useCallback((source: DragSource, ids: string[]) => {
    setState({
      isDragging: true,
      source,
      dragIds: ids,
    });
  }, []);

  const endDrag = useCallback(() => {
    setState({
      isDragging: false,
      source: null,
      dragIds: [],
    });
  }, []);

  return (
    <GlobalDragContext.Provider value={{ ...state, startDrag, endDrag }}>
      {children}
    </GlobalDragContext.Provider>
  );
}
