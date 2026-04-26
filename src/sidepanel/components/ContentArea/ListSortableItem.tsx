import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { AppBookmarkNode } from "@/types/bookmark";
import ListItem from "./ListItem";
import styles from "./ContentArea.module.css";

interface ListSortableItemProps {
  item: AppBookmarkNode;
  selected: boolean;
  cut?: boolean;
  docked?: boolean;
  onSelect: (multi: boolean, range: boolean) => void;
  onDoubleClick: () => void;
  renaming?: boolean;
  onRenameSubmit?: (newTitle: string) => void;
  onRenameCancel?: () => void;
  highlightQuery?: string;
}

export default function ListSortableItem({
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
}: ListSortableItemProps) {
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
      {...attributes}
      {...listeners}
      className={`${isDragging ? styles.draggingItem : ""} ${docked && !isDragging ? styles.itemDocked : ""}`}
    >
      <ListItem
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
    </div>
  );
}
