import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-6xl font-semibold text-muted-foreground">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">
        Page not found
      </h1>
      <p className="mt-4 text-muted-foreground max-w-md">
        The page you're looking for doesn't exist.
      </p>
      <div className="mt-8">
        <Button href="/" variant="secondary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    </div>
  )
}
