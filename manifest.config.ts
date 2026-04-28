import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

// 根据是否为 dev 模式生成不同名称
export function createManifest(isDev: boolean) {
  return defineManifest({
    manifest_version: 3,
    name: isDev ? `[DEV] ${pkg.name}` : pkg.name,
    version: pkg.version,
    icons: {
      48: "public/logo.png",
    },
    action: {
      default_icon: {
        48: "public/logo.png",
      },
    },
    background: {
      service_worker: "src/background/main.ts",
    },
    permissions: ["bookmarks", "storage", "sidePanel", "favicon", "tabs"],
    content_scripts: [
      {
        js: ["src/content/main.tsx"],
        matches: ["https://*/*"],
      },
    ],
    side_panel: {
      default_path: "src/sidepanel/index.html",
    },
  });
}
