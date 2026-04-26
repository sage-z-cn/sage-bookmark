import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { AppBookmarkNode } from "@/types/bookmark";
import ListItem from "./ListItem";
import styles from "./ContentArea.module.css";

interface ListSortableItemProps {
  item: AppBookmarkNode;
  selected: boolean;
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
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? styles.draggingItem : undefined}
    >
      <ListItem
        item={item}
        selected={selected}
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
