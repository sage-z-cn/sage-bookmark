// Favicon URL 生成
export function getFaviconUrl(url: string, size = 32): string {
  return `chrome://favicon/size/${size}/${url}`
}
