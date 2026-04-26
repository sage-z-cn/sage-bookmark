import { useState } from 'react'
import { Modal, message } from 'antd'

interface ConfirmDeleteDialogProps {
  open: boolean
  count: number
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function ConfirmDeleteDialog({
  open,
  count,
  onClose,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const [loading, setLoading] = useState(false)

  async function handleOk() {
    setLoading(true)
    try {
      await onConfirm()
      message.success(`已删除 ${count} 个项目`)
      onClose()
    } catch {
      message.error('删除失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="确认删除"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText="删除"
      cancelText="取消"
      okButtonProps={{ danger: true }}
    >
      <p>确定删除选中的 {count} 个项目吗？此操作不可撤销。</p>
    </Modal>
  )
}
