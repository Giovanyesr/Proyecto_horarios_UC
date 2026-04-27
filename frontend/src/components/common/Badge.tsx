import clsx from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'red' | 'blue' | 'yellow' | 'gray'
}

const variants = {
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  gray: 'bg-gray-100 text-gray-700',
}

export function Badge({ children, variant = 'gray' }: BadgeProps) {
  return <span className={clsx('badge', variants[variant])}>{children}</span>
}
