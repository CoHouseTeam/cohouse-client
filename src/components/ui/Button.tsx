import { ButtonHTMLAttributes, ReactNode } from 'react'
import { useHaptics } from '../../libs/hooks/useHaptics'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
  hapticFeedback?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  hapticFeedback = true,
  onClick,
  ...props
}: ButtonProps) {
  const { lightImpact } = useHaptics()

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (hapticFeedback && !disabled && !loading) {
      await lightImpact()
    }
    onClick?.(e)
  }
  const baseClasses = 'btn'
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    ghost: 'btn-ghost',
    link: 'btn-link',
  }
  const sizeClasses = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    loading ? 'loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading ? '' : children}
    </button>
  )
}
