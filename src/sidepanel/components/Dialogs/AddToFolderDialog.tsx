import { useMemo, useState } from "react";
import { ConfigProvider, Form, Input, message, TreeSelect } from "antd";
import type { TreeDataNode } from "antd";
import { useBookmarkContext } from "@/sidepanel/context/BookmarkContext";
import type { AppBookmarkNode } from "@/types/bookmark";
import BasicModal from "./BasicModal";

interface AddToFolderDialogProps {
  open: boolean;
  folderId: string | null;
  onClose: () => void;
  onConfirm: (folderId: string, title: string, url: string) => Promise<void>;
}

function buildFolderTreeData(nodes: AppBookmarkNode[]): TreeDataNode[] {
  return nodes
    .filter((node) => node.type === "folder")
    .map((node) => ({
      key: node.id,
      title: node.title,
      value: node.id,
      children: node.children ? buildFolderTreeData(node.children) : [],
    }));
}

export default function AddToFolderDialog({
  open,
  folderId,
  onClose,
  onConfirm,
}: AddToFolderDialogProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { index } = useBookmarkContext();

  const folderTreeData = useMemo(() => {
    if (!index) return [];
    return buildFolderTreeData(index.rootNodes);
  }, [index]);

  async function handleAfterOpenChange(visible: boolean) {
    if (!visible) return;
    form.setFieldsValue({ folderId });
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab?.url && tab.url !== "chrome://newtab") {
        form.setFieldsValue({
          title: tab.title || "",
          url: tab.url,
        });
      }
    } catch {
      // 获取标签页信息失败，不填充
    }
  }

  async function handleOk() {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onConfirm(values.folderId, values.title, values.url);
      message.success("书签已收藏");
      form.resetFields();
      onClose();
    } catch {
      // 校验失败不关闭
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    form.resetFields();
    onClose();
  }

  return (
    <BasicModal
      title="收藏当前页面"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="收藏"
      afterOpenChange={handleAfterOpenChange}
    >
      <Form
        form={form}
        layout="vertical"
        size="small"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleOk();
          }
        }}
        style={{ rowGap: 8 }}
      >
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: "请输入书签标题" }]}
        >
          <Input placeholder="输入书签标题" />
        </Form.Item>
        <Form.Item
          name="url"
          label="URL"
          rules={[
            { required: true, message: "请输入 URL" },
            {
              type: "url",
              message: "请输入有效的 URL（如 https://example.com）",
            },
          ]}
        >
          <Input
            placeholder="https://example.com"
            style={{ fontFamily: "var(--font-code)" }}
          />
        </Form.Item>
        <Form.Item
          name="folderId"
          label="收藏到"
          rules={[{ required: true, message: "请选择文件夹" }]}
        >
          <TreeSelect
            treeData={folderTreeData}
            placeholder="选择文件夹"
            treeDefaultExpandAll
            showSearch
            treeLine={{ showLeafIcon: false }}
            dropdownStyle={{ maxHeight: 240, overflow: "auto" }}
            listHeight={200}
            popupMatchSelectWidth={false}
            filterTreeNode={(input, node) =>
              (node?.title as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>
      </Form>
    </BasicModal>
  );
}
