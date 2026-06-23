import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Home } from 'lucide-react'

const NotFound = () => (
  <div className="flex flex-col items-center justify-center py-24 space-y-4">
    <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
    <h2 className="text-2xl font-semibold">Page introuvable</h2>
    <p className="text-muted-foreground">La page que vous recherchez n&apos;existe pas.</p>
    <Link to="/dashboard">
      <Button>
        <Home className="h-4 w-4 mr-2" />
        Retour au tableau de bord
      </Button>
    </Link>
  </div>
)

export default NotFound
