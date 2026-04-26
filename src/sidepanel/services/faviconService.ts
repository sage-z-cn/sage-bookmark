// MV3 使用 chrome-extension:// 协议获取 favicon
export function getFaviconUrl(url: string, size = 32): string {
  return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(url)}&size=${size}`;
}
