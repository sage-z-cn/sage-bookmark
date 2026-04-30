import { useState } from "react";
import { Form, Input, message } from "antd";
import BasicModal from "./BasicModal";

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (title: string) => Promise<void>;
}

export default function CreateFolderDialog({
  open,
  onClose,
  onConfirm,
}: CreateFolderDialogProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  async function handleOk() {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onConfirm(values.title);
      message.success("文件夹已创建");
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
      title="新建文件夹"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="创建"
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
          label="文件夹名称"
          rules={[{ required: true, message: "请输入文件夹名称" }]}
        >
          <Input placeholder="输入文件夹名称" autoFocus />
        </Form.Item>
      </Form>
    </BasicModal>
  );
}
