import { ConfigProvider, Button, Space, Typography } from "antd";
import { BookOutlined } from "@ant-design/icons";
import { genesisTheme } from "@/sidepanel/styles/token";
import "./index.css";

const { Title, Text } = Typography;

export default function App() {
  const openSidePanel = async () => {
    // sidePanel.open 需要指定 tabId 或 windowId
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.id != null) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
    window.close();
  };

  return (
    <ConfigProvider theme={genesisTheme}>
      <div className="popup-container">
        <Space direction="vertical" align="center" size="middle">
          <BookOutlined style={{ fontSize: 32, color: "#6366F1" }} />
          <Title level={5} style={{ margin: 0 }}>
            Sage Bookmark
          </Title>
          <Text type="secondary">书签管理器</Text>
          <Button type="primary" onClick={openSidePanel} block>
            打开管理面板
          </Button>
        </Space>
      </div>
    </ConfigProvider>
  );
}
