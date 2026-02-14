import { cn, copyToClipboard } from '@/lib/utils'

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('handles conditional classes', () => {
    expect(cn('base', true && 'conditional')).toBe('base conditional')
    expect(cn('base', false && 'conditional')).toBe('base')
  })

  it('handles undefined values', () => {
    expect(cn('base', undefined, 'other')).toBe('base other')
  })

  it('handles empty string', () => {
    expect(cn('base', '')).toBe('base')
  })
})

describe('copyToClipboard', () => {
  it('is a function', () => {
    expect(typeof copyToClipboard).toBe('function')
  })

  it('returns a promise', () => {
    const result = copyToClipboard('test')
    expect(result).toBeInstanceOf(Promise)
  })
})
