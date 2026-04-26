import { ConfigProvider, Empty } from "antd";
import { genesisTheme } from "./styles/token";

export default function App() {
  return (
    <ConfigProvider theme={genesisTheme}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Empty
          description="Sage Bookmark — 书签管理器"
          style={{ margin: "auto" }}
        />
      </div>
    </ConfigProvider>
  );
}
