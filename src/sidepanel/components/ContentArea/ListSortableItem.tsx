import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { AppBookmarkNode } from "@/types/bookmark";
import { useGlobalDnd } from "@/sidepanel/context/GlobalDndContext";
import { useBookmarkContext } from "@/sidepanel/context/BookmarkContext";
import ListItem from "./ListItem";
import styles from "./ContentArea.module.css";

interface ListSortableItemProps {
  item: AppBookmarkNode;
  selected: boolean;
  selectedIds: Set<string>;
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
  selectedIds,
  cut = false,
  docked = false,
  onSelect,
  onDoubleClick,
  renaming = false,
  onRenameSubmit,
  onRenameCancel,
  highlightQuery,
}: ListSortableItemProps) {
  const { isRoot } = useBookmarkContext();

  const {
    isDragging: globalDragging,
    activeIds,
    ctrlHeld,
    overFolderId,
  } = useGlobalDnd();

  const dragIds = selected ? [...selectedIds] : [item.id as string];

  const isFolderTarget =
    ctrlHeld && overFolderId === item.id && item.type === "folder";

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
      ids: dragIds,
    },
  });

  const isInDragGroup =
    globalDragging && !isDragging && activeIds.includes(item.id as string);

  const shouldSuppressTransform = ctrlHeld && globalDragging && !isDragging;

  const style: React.CSSProperties = {
    transform: shouldSuppressTransform
      ? "none"
      : CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isInDragGroup ? 0 : docked ? 0.45 : 1,
  };

  const folderHighlightClass = isFolderTarget ? styles.folderDropTarget : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isRoot ? {} : listeners)}
      className={`${isDragging ? styles.draggingItem : ""} ${isInDragGroup ? styles.dragGroupItem : ""} ${docked && !isDragging && !isInDragGroup ? styles.itemDocked : ""} ${folderHighlightClass}`}
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
