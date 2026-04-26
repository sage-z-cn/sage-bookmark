// 将 URL 截断为适合显示的短文本，优先保留路径尾部
export function truncateUrl(url: string, maxLen = 28): string {
  try {
    const { hostname, pathname, search } = new URL(url);
    const path = pathname === "/" ? "" : pathname;
    const full = hostname + path + search;
    if (full.length <= maxLen) return full;
    // 保留域名前缀 + ... + 路径尾部
    const headLen = Math.min(hostname.length, Math.floor(maxLen * 0.6));
    const head = full.slice(0, headLen);
    const tail = full.slice(-(maxLen - headLen - 3));
    return head + "..." + tail;
  } catch {
    return url.length <= maxLen ? url : url.slice(0, maxLen - 3) + "...";
  }
}

// 从 URL 中提取域名
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

// 格式化时间戳为可读日期
export function formatDate(timestamp: number): string {
  if (!timestamp) return "—";
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
