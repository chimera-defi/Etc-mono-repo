'use client'

import { cn } from '@/lib/utils'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

export interface TerminalProps {
  code?: string
  language?: string
  children?: React.ReactNode
  className?: string
  title?: string
}

const codeStyle = {
  margin: 0,
  padding: 0,
  background: 'transparent',
  fontSize: '13px',
  lineHeight: '1.6',
}

export function Terminal({ code, language = 'bash', children, className, title }: TerminalProps) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-[#0c0c0c]', className)}>
      {/* Window chrome - minimal */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
          <div className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
        </div>
        {title && <span className="ml-3 font-mono text-xs text-zinc-500">{title}</span>}
      </div>
      {/* Code content */}
      <div className="overflow-x-auto p-4">
        {code ? (
          <SyntaxHighlighter language={language} style={vscDarkPlus} customStyle={codeStyle}>
            {code}
          </SyntaxHighlighter>
        ) : (
          <div className="font-mono text-sm text-zinc-300">{children}</div>
        )}
      </div>
    </div>
  )
}
