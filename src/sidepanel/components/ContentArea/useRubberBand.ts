import { useCallback, useRef, useState } from "react";

export interface RubberBandRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface UseRubberBandOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  onSelectionChange: (ids: Set<string>) => void;
  itemSelector?: string;
}

// 框选 Hook：在容器内拖拽绘制选择矩形，计算与子元素的交叉
export function useRubberBand({
  containerRef,
  onSelectionChange,
  itemSelector = "[data-item-id]",
}: UseRubberBandOptions) {
  const [rect, setRect] = useState<RubberBandRect | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // 只响应在空白区域（content 区域）的左键按下
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest(itemSelector)) return;

      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      startPoint.current = {
        x: e.clientX - containerRect.left + container.scrollLeft,
        y: e.clientY - containerRect.top + container.scrollTop,
      };
      isDragging.current = false;
    },
    [containerRef, itemSelector],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!startPoint.current) return;
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const currentX = e.clientX - containerRect.left + container.scrollLeft;
      const currentY = e.clientY - containerRect.top + container.scrollTop;

      isDragging.current = true;

      const left = Math.min(startPoint.current.x, currentX);
      const top = Math.min(startPoint.current.y, currentY);
      const width = Math.abs(currentX - startPoint.current.x);
      const height = Math.abs(currentY - startPoint.current.y);

      setRect({ left, top, width, height });

      // 计算与子元素的交叉
      const selRect = {
        left: left + containerRect.left - container.scrollLeft,
        top: top + containerRect.top - container.scrollTop,
        right: left + containerRect.left - container.scrollLeft + width,
        bottom: top + containerRect.top - container.scrollTop + height,
      };

      const items = container.querySelectorAll(itemSelector);
      const intersected = new Set<string>();
      for (const item of items) {
        const el = item as HTMLElement;
        const itemRect = el.getBoundingClientRect();
        if (
          itemRect.left < selRect.right &&
          itemRect.right > selRect.left &&
          itemRect.top < selRect.bottom &&
          itemRect.bottom > selRect.top
        ) {
          const id = el.dataset.itemId;
          if (id) intersected.add(id);
        }
      }
      onSelectionChange(intersected);
    },
    [containerRef, itemSelector, onSelectionChange],
  );

  const handleMouseUp = useCallback(() => {
    if (startPoint.current && !isDragging.current) {
      // 点击空白区域未拖拽 → 清除选中
      onSelectionChange(new Set());
    }
    startPoint.current = null;
    isDragging.current = false;
    setRect(null);
  }, [onSelectionChange]);

  return {
    rect,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
    },
  };
}
