import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'
import { X } from 'lucide-react'

const Dialog = ({ open, onOpenChange, children }) => {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onOpenChange(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    const focusable = dialogRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable?.[0]?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="presentation">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className="relative z-50 bg-background rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        {children}
      </div>
    </div>
  )
}

const DialogHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left p-6', className)} {...props} />
)

const DialogTitle = ({ className, ...props }) => (
  <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
)

const DialogContent = ({ className, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
)

const DialogFooter = ({ className, ...props }) => (
  <div className={cn('flex items-center justify-end gap-2 p-6 pt-0', className)} {...props} />
)

const DialogClose = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Fermer"
    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  >
    <X className="h-4 w-4" />
  </button>
)

export { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogClose }
