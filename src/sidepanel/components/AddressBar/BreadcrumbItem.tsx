import styles from './Breadcrumb.module.css'

interface BreadcrumbItemProps {
  title: string
  isActive: boolean
  onClick: () => void
}

export default function BreadcrumbItem({
  title,
  isActive,
  onClick,
}: BreadcrumbItemProps) {
  const className = `${styles.crumb} ${isActive ? styles.crumbActive : ''}`

  return (
    <button
      className={className}
      onClick={isActive ? undefined : onClick}
      type="button"
      title={title}
    >
      {title || '根目录'}
    </button>
  )
}
