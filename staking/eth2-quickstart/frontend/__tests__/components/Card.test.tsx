import { render, screen } from '@testing-library/react'
import { Card } from '@/components/ui/Card'

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies base styles', () => {
    render(<Card>Content</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('rounded-xl')
    expect(card).toHaveClass('border')
    expect(card).toHaveClass('bg-card')
  })

  it('applies hover styles when hover prop is true', () => {
    render(<Card hover>Hoverable</Card>)
    const card = screen.getByTestId('card')
    expect(card).toHaveClass('hover:border-primary/20')
  })

  it('applies padding variants correctly', () => {
    const { rerender } = render(<Card padding="sm">Small</Card>)
    expect(screen.getByTestId('card')).toHaveClass('p-4')
    
    rerender(<Card padding="md">Medium</Card>)
    expect(screen.getByTestId('card')).toHaveClass('p-6')
    
    rerender(<Card padding="lg">Large</Card>)
    expect(screen.getByTestId('card')).toHaveClass('p-8')
    
    rerender(<Card padding="none">None</Card>)
    expect(screen.getByTestId('card')).not.toHaveClass('p-4')
  })

  it('accepts custom className', () => {
    render(<Card className="custom-class">Custom</Card>)
    expect(screen.getByTestId('card')).toHaveClass('custom-class')
  })
})
