import { Component } from 'react'
import { Button } from './ui/button'
import { AlertTriangle } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-md space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
            <p className="text-muted-foreground text-sm">
              {this.state.error?.message || 'Erreur inattendue'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Recharger la page
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
