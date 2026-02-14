'use client'

import { Button } from '@/components/ui/Button'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-sm text-muted-foreground uppercase tracking-wide">
        Error
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">
        Something went wrong
      </h1>
      <p className="mt-4 text-muted-foreground max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-8">
        <Button onClick={reset}>
          Try Again
        </Button>
      </div>
    </div>
  )
}
