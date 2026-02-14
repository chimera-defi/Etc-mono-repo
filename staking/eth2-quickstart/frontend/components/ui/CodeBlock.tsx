'use client'

import { useState } from 'react'
import { cn, copyToClipboard } from '@/lib/utils'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'

export interface CodeBlockProps {
  code: string
  language?: string
  showCopy?: boolean
  className?: string
}

const codeStyle = {
  margin: 0,
  padding: 0,
  background: 'transparent',
  fontSize: '13px',
  lineHeight: '1.6',
}

export function CodeBlock({ code, language = 'bash', showCopy = true, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    const success = await copyToClipboard(code)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  return (
    <div className={cn('group relative overflow-hidden rounded-lg border border-border bg-[#0c0c0c]', className)}>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 rounded p-1.5 text-zinc-500 opacity-0 transition-all hover:text-zinc-300 group-hover:opacity-100 focus:opacity-100"
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        </button>
      )}
      <div className="overflow-x-auto p-4">
        <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={codeStyle}>
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
