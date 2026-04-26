import { useMemo } from "react";

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

// 将文本按匹配项分割为高亮片段
export default function HighlightText({
  text,
  query,
  className,
  highlightClassName,
}: HighlightTextProps) {
  const segments = useMemo(() => {
    if (!query || !text) return [{ text: text || "", highlight: false }];

    const lowerQuery = query.toLowerCase();
    const lowerText = text.toLowerCase();
    const result: Array<{ text: string; highlight: boolean }> = [];

    let lastIndex = 0;
    let index = lowerText.indexOf(lowerQuery);

    while (index !== -1) {
      // 添加匹配前的文本
      if (index > lastIndex) {
        result.push({
          text: text.slice(lastIndex, index),
          highlight: false,
        });
      }
      // 添加匹配的文本（保持原始大小写）
      result.push({
        text: text.slice(index, index + query.length),
        highlight: true,
      });
      lastIndex = index + query.length;
      index = lowerText.indexOf(lowerQuery, lastIndex);
    }

    // 添加剩余文本
    if (lastIndex < text.length) {
      result.push({ text: text.slice(lastIndex), highlight: false });
    }

    return result;
  }, [text, query]);

  return (
    <span className={className}>
      {segments.map((segment, i) =>
        segment.highlight ? (
          <mark
            key={i}
            className={highlightClassName}
            style={{
              background: "rgba(99, 102, 241, 0.2)",
              color: "inherit",
              padding: "0 1px",
              borderRadius: "2px",
              fontWeight: 500,
            }}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </span>
  );
}
