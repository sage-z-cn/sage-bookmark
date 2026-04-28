import { useState } from 'react'
import { Modal, Form, Input, message } from 'antd'
import type { AppBookmarkNode } from '@/types/bookmark'

interface EditBookmarkDialogProps {
  open: boolean
  bookmark: AppBookmarkNode | null
  onClose: () => void
  onConfirm: (id: string, title: string, url: string) => Promise<void>
  /** 用于覆盖默认书签值的初始值（如当前标签页信息） */
  initialValues?: { title: string; url: string }
}

export default function EditBookmarkDialog({
  open,
  bookmark,
  onClose,
  onConfirm,
  initialValues,
}: EditBookmarkDialogProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // 当 bookmark 变化或弹窗打开时，填入初始值
  function handleAfterOpenChange(visible: boolean) {
    if (visible && bookmark) {
      form.setFieldsValue({
        title: initialValues?.title ?? bookmark.title,
        url: initialValues?.url ?? (bookmark.url ?? ''),
      })
    }
  }

  async function handleOk() {
    if (!bookmark) return
    try {
      const values = await form.validateFields()
      setLoading(true)
      await onConfirm(bookmark.id, values.title, values.url)
      message.success('书签已更新')
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
    <Modal
      title="编辑书签"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="保存"
      cancelText="取消"
      destroyOnClose
      afterOpenChange={handleAfterOpenChange}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入书签标题' }]}
        >
          <Input placeholder="输入书签标题" />
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
    </Modal>
  )
}
