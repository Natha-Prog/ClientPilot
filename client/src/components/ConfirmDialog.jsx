import { createContext, useContext, useState, useCallback } from 'react'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'

const ConfirmContext = createContext(null)

export const useConfirm = () => {
  const context = useContext(ConfirmContext)
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider')
  return context
}

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirmer',
    variant: 'destructive',
    resolve: null,
  })

  const confirm = useCallback(({ title, description, confirmLabel = 'Confirmer', variant = 'destructive' }) => {
    return new Promise((resolve) => {
      setState({ open: true, title, description, confirmLabel, variant, resolve })
    })
  }, [])

  const handleClose = (result) => {
    state.resolve?.(result)
    setState((s) => ({ ...s, open: false, resolve: null }))
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog open={state.open} onOpenChange={(open) => !open && handleClose(false)}>
        <DialogHeader>
          <DialogTitle>{state.title}</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-sm text-muted-foreground">{state.description}</p>
        </DialogContent>
        <DialogFooter className="gap-2 justify-end">
          <Button variant="outline" onClick={() => handleClose(false)}>Annuler</Button>
          <Button variant={state.variant} onClick={() => handleClose(true)}>{state.confirmLabel}</Button>
        </DialogFooter>
      </Dialog>
    </ConfirmContext.Provider>
  )
}
