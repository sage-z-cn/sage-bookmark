import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ViewMode = "grid" | "list";
const STORAGE_KEY = "sage-bookmark-view-settings";

interface ViewSettings {
  viewMode: ViewMode;
}

interface ViewSettingsContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewSettingsContext = createContext<ViewSettingsContextValue | null>(null);

function readViewSettings(): ViewSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ViewSettings>;
      if (parsed.viewMode === "grid" || parsed.viewMode === "list") {
        return { viewMode: parsed.viewMode };
      }
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

export function useViewSettings() {
  const ctx = useContext(ViewSettingsContext);
  if (!ctx)
    throw new Error(
      "useViewSettings must be used within ViewSettingsProvider",
    );
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

  return (
    <ViewSettingsContext.Provider
      value={{ viewMode: settings.viewMode, setViewMode }}
    >
      {children}
    </ViewSettingsContext.Provider>
  );
}
