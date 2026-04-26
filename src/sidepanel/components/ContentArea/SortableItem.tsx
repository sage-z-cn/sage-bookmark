import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { AppBookmarkNode } from "@/types/bookmark";
import FolderItem from "./FolderItem";
import BookmarkItem from "./BookmarkItem";
import styles from "./ContentArea.module.css";

interface SortableItemProps {
  item: AppBookmarkNode;
  selected: boolean;
  cut?: boolean;
  docked?: boolean;
  onSelect: (multi: boolean, range: boolean) => void;
  onDoubleClick: () => void;
  renaming?: boolean;
  onRenameSubmit?: (newTitle: string) => void;
  onRenameCancel?: () => void;
  isDragOverlay?: boolean;
  highlightQuery?: string;
}

export default function SortableItem({
  item,
  selected,
  cut = false,
  docked = false,
  onSelect,
  onDoubleClick,
  renaming = false,
  onRenameSubmit,
  onRenameCancel,
  highlightQuery,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      source: "content",
      type: item.type,
      title: item.title,
      url: item.url,
      faviconUrl: item.faviconUrl,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : docked ? 0.45 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? styles.draggingItem : ""} ${docked && !isDragging ? styles.itemDocked : ""}`}
      {...attributes}
      {...listeners}
    >
      {item.type === "folder" ? (
        <FolderItem
          item={item}
          selected={selected}
          cut={cut}
          onSelect={onSelect}
          onDoubleClick={onDoubleClick}
          renaming={renaming}
          onRenameSubmit={onRenameSubmit}
          onRenameCancel={onRenameCancel}
          highlightQuery={highlightQuery}
        />
      ) : (
        <BookmarkItem
          item={item}
          selected={selected}
          cut={cut}
          onSelect={onSelect}
          onDoubleClick={onDoubleClick}
          highlightQuery={highlightQuery}
        />
      )}
    </div>
  );
}
