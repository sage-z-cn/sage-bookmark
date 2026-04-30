import { useState } from 'react'
import { Form, Input, message } from 'antd'
import BasicModal from './BasicModal'

interface CreateBookmarkDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (title: string, url: string) => Promise<void>
}

export default function CreateBookmarkDialog({
  open,
  onClose,
  onConfirm,
}: CreateBookmarkDialogProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  async function handleAfterOpenChange(visible: boolean) {
    if (!visible) return
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      })
      if (tab?.url && tab.url !== 'chrome://newtab') {
        form.setFieldsValue({
          title: tab.title || '',
          url: tab.url,
        })
      }
    } catch {
      // 获取标签页信息失败，不填充
    }
  }

  async function handleOk() {
    try {
      const values = await form.validateFields()
      setLoading(true)
      await onConfirm(values.title, values.url)
      message.success('书签已创建')
      form.resetFields()
      onClose()
    } catch {
      // 校验失败不关闭
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    form.resetFields()
    onClose()
  }

  return (
    <BasicModal
      title="新建书签"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="创建"
      afterOpenChange={handleAfterOpenChange}
    >
      <Form form={form} layout="vertical" size="small" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleOk() } }} style={{ rowGap: 8 }}>
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入书签标题' }]}
        >
          <Input placeholder="输入书签标题" autoFocus />
        </Form.Item>
        <Form.Item
          name="url"
          label="URL"
          rules={[
            { required: true, message: '请输入 URL' },
            { type: 'url', message: '请输入有效的 URL（如 https://example.com）' },
          ]}
        >
          <Input
            placeholder="https://example.com"
            style={{ fontFamily: 'var(--font-code)' }}
          />
        </Form.Item>
      </Form>
    </BasicModal>
  )
}
