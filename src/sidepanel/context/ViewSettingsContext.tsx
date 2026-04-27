import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ViewMode = "grid" | "list";
const STORAGE_KEY = "sage-bookmark-view-settings";
const FOLDER_EXPIRY_MS = 5 * 60 * 1000; // 5分钟过期

interface ViewSettings {
  viewMode: ViewMode;
  currentNodeId?: string;
  timestamp?: number;
}

interface ViewSettingsContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  persistedFolderId: string | null;
  setPersistedFolderId: (id: string | null) => void;
}

const ViewSettingsContext = createContext<ViewSettingsContextValue | null>(
  null,
);

function readViewSettings(): ViewSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ViewSettings>;
      const viewMode =
        parsed.viewMode === "grid" || parsed.viewMode === "list"
          ? parsed.viewMode
          : "grid";
      const currentNodeId =
        typeof parsed.currentNodeId === "string"
          ? parsed.currentNodeId
          : undefined;
      const timestamp =
        typeof parsed.timestamp === "number" ? parsed.timestamp : undefined;
      return { viewMode, currentNodeId, timestamp };
    }
  } catch {
    // 解析失败时回退默认值
  }
  return { viewMode: "grid" };
}

function writeViewSettings(settings: ViewSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // 静默失败
  }
}

// 检查目录是否过期（超过5分钟）
function isFolderExpired(timestamp?: number): boolean {
  if (!timestamp) return true;
  return Date.now() - timestamp > FOLDER_EXPIRY_MS;
}

export function useViewSettings() {
  const ctx = useContext(ViewSettingsContext);
  if (!ctx)
    throw new Error("useViewSettings must be used within ViewSettingsProvider");
  return ctx;
}

export function ViewSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<ViewSettings>(readViewSettings);

  useEffect(() => {
    writeViewSettings(settings);
  }, [settings]);

  const setViewMode = useCallback((mode: ViewMode) => {
    setSettings((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  // 获取有效的持久化目录（未过期时返回）
  const persistedFolderId =
    settings.currentNodeId && !isFolderExpired(settings.timestamp)
      ? settings.currentNodeId
      : null;

  const setPersistedFolderId = useCallback((id: string | null) => {
    setSettings((prev) => ({
      ...prev,
      currentNodeId: id ?? undefined,
      timestamp: id ? Date.now() : undefined,
    }));
  }, []);

  return (
    <ViewSettingsContext.Provider
      value={{
        viewMode: settings.viewMode,
        setViewMode,
        persistedFolderId,
        setPersistedFolderId,
      }}
    >
      {children}
    </ViewSettingsContext.Provider>
  );
}
