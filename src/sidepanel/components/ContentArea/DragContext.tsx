import { type ReactNode } from "react";
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBookmarkContext } from "@/sidepanel/context/BookmarkContext";
import type { ViewMode } from "@/sidepanel/context/ViewSettingsContext";

interface DragContextProps {
  children: ReactNode;
  viewMode: ViewMode;
}

export default function DragContext({ children, viewMode }: DragContextProps) {
  const { currentItems } = useBookmarkContext();

  const strategy =
    viewMode === "list" ? verticalListSortingStrategy : rectSortingStrategy;

  const sortableIds = currentItems.map((item) => item.id);

  return (
    <SortableContext items={sortableIds} strategy={strategy}>
      {children}
    </SortableContext>
  );
}
