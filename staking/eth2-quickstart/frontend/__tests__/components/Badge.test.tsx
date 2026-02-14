import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/Badge'

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Test Badge</Badge>)
    expect(screen.getByText('Test Badge')).toBeInTheDocument()
  })

  it('applies default variant styles', () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass('bg-muted')
    expect(badge).toHaveClass('text-muted-foreground')
  })

  it('applies primary variant styles', () => {
    render(<Badge variant="primary">Primary</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass('bg-primary/10')
    expect(badge).toHaveClass('text-primary')
  })

  it('has correct base classes', () => {
    render(<Badge>Base</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass('rounded-md')
    expect(badge).toHaveClass('font-mono')
    expect(badge).toHaveClass('text-xs')
  })

  it('accepts custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>)
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass('custom-class')
  })
})
