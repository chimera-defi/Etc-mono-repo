'use client';

import { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { cn } from '@/lib/utils';
import { CollapsibleSection } from './CollapsibleSection';
import { 
  Trophy, 
  Calculator, 
  Shield, 
  AlertTriangle, 
  Layers, 
  Key, 
  Smartphone,
  Code,
  DollarSign,
  Lock,
  FileText,
  ExternalLink,
  Info,
  Zap,
  BookOpen,
  Target
} from 'lucide-react';

interface EnhancedMarkdownRendererProps {
  content: string;
  className?: string;
  showExpandableSections?: boolean;
}

// Section definitions - which sections should be collapsible
const COLLAPSIBLE_SECTIONS = [
  { pattern: /^#{1,2}\s+.*Recommendations.*$/im, title: 'Recommendations by Use Case', icon: Trophy },
  { pattern: /^#{1,2}\s+.*Scoring.*Methodology.*$/im, title: 'Scoring Methodology', icon: Calculator },
  { pattern: /^#{1,2}\s+.*Security.*Deep.*Dive.*$/im, title: 'Security Deep Dive', icon: Shield },
  { pattern: /^#{1,2}\s+.*Security.*Audits.*$/im, title: 'Security Audits', icon: Shield },
  { pattern: /^#{1,2}\s+.*Security.*Features.*$/im, title: 'Security Features', icon: Lock },
  { pattern: /^#{1,2}\s+.*Known.*Quirks.*$/im, title: 'Known Quirks & Gotchas', icon: AlertTriangle },
  { pattern: /^#{1,2}\s+.*EIP.*Support.*$/im, title: 'EIP Support Matrix', icon: Layers },
  { pattern: /^#{1,2}\s+.*EIP-7702.*$/im, title: 'EIP-7702 Wallet Support', icon: Zap },
  { pattern: /^#{1,2}\s+.*Account.*Type.*$/im, title: 'Account Type Support', icon: Key },
  { pattern: /^#{1,2}\s+.*Hardware.*Wallet.*Support.*$/im, title: 'Hardware Wallet Support', icon: Key },
  { pattern: /^#{1,2}\s+.*ENS.*Address.*$/im, title: 'ENS & Address Resolution', icon: Target },
  { pattern: /^#{1,2}\s+.*Browser.*Integration.*$/im, title: 'Browser Integration', icon: Code },
  { pattern: /^#{1,2}\s+.*Mobile.*Deep.*$/im, title: 'Mobile Deep-linking', icon: Smartphone },
  { pattern: /^#{1,2}\s+.*Developer.*Experience.*$/im, title: 'Developer Experience', icon: Code },
  { pattern: /^#{1,2}\s+.*Monetization.*Business.*$/im, title: 'Monetization & Business Model', icon: DollarSign },
  { pattern: /^#{1,2}\s+.*Gas.*Estimation.*$/im, title: 'Gas Estimation & Transaction Preview', icon: Zap },
  { pattern: /^#{1,2}\s+.*Privacy.*Data.*$/im, title: 'Privacy & Data Collection', icon: Lock },
  { pattern: /^#{1,2}\s+.*License.*Information.*$/im, title: 'License Information', icon: FileText },
  { pattern: /^#{1,2}\s+.*Other.*Wallet.*Comparison.*$/im, title: 'Other Resources', icon: ExternalLink },
  { pattern: /^#{1,2}\s+.*Integration.*Advice.*$/im, title: 'Integration Advice', icon: BookOpen },
  { pattern: /^#{1,2}\s+.*Data.*Sources.*Verification.*$/im, title: 'Data Sources & Verification', icon: FileText },
  { pattern: /^#{1,2}\s+.*Activity.*Status.*Details.*$/im, title: 'Activity Status Details', icon: Info },
  { pattern: /^#{1,2}\s+.*Changelog.*$/im, title: 'Changelog', icon: FileText },
  { pattern: /^#{1,2}\s+.*Contributing.*Add.*$/im, title: 'Contributing', icon: BookOpen },
  { pattern: /^#{1,2}\s+.*Quick.*Recommendations.*$/im, title: 'Quick Recommendations', icon: Trophy },
  { pattern: /^#{1,2}\s+.*Wallets.*to.*Avoid.*$/im, title: 'Wallets to Avoid', icon: AlertTriangle },
  { pattern: /^#{1,2}\s+.*Why.*Look.*Beyond.*$/im, title: 'Why Look Beyond Ledger?', icon: AlertTriangle },
  { pattern: /^#{1,2}\s+.*Ledger.*Migration.*$/im, title: 'Ledger Migration', icon: Target },
  { pattern: /^#{1,2}\s+.*Resources.*$/im, title: 'Resources', icon: ExternalLink },
];

// Patterns for primary content that should always be visible
const PRIMARY_SECTIONS = [
  /^#{1,2}\s+Complete.*Comparison.*$/im,
  /^#{1,2}\s+Complete.*Hardware.*$/im,
  /^#{1,2}\s+.*GitHub.*Metrics.*$/im,
  /^#{1,2}\s+Summary.*$/im,
  /^#{1,2}\s+.*Top.*Picks.*$/im,
  /^#{1,2}\s+.*Which.*Wallet.*Should.*$/im,
];

function parseMarkdownSections(content: string): { primary: string; sections: { id: string; title: string; content: string; icon: typeof Trophy }[] } {
  const lines = content.split('\n');
  const sections: { id: string; title: string; content: string; icon: typeof Trophy }[] = [];
  
  let currentSectionStart = -1;
  let currentSection: { title: string; icon: typeof Trophy } | null = null;
  let primaryContent = '';
  let inPrimarySection = true;
  let sectionLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isHeading = /^#{1,2}\s+/.test(line);
    
    if (isHeading) {
      // Check if this is a collapsible section
      const collapsibleMatch = COLLAPSIBLE_SECTIONS.find(s => s.pattern.test(line));
      const isPrimary = PRIMARY_SECTIONS.some(p => p.test(line));
      
      // Save previous section if it was collapsible
      if (currentSection && sectionLines.length > 0) {
        sections.push({
          id: currentSection.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: currentSection.title,
          content: sectionLines.join('\n'),
          icon: currentSection.icon,
        });
        sectionLines = [];
      }
      
      if (collapsibleMatch && !isPrimary) {
        // Start a new collapsible section
        currentSection = { title: collapsibleMatch.title, icon: collapsibleMatch.icon };
        inPrimarySection = false;
        sectionLines = [line];
      } else {
        // This is primary content
        currentSection = null;
        inPrimarySection = true;
        primaryContent += line + '\n';
      }
    } else {
      if (currentSection) {
        sectionLines.push(line);
      } else {
        primaryContent += line + '\n';
      }
    }
  }
  
  // Save last section
  if (currentSection && sectionLines.length > 0) {
    sections.push({
      id: currentSection.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: currentSection.title,
      content: sectionLines.join('\n'),
      icon: currentSection.icon,
    });
  }
  
  return { primary: primaryContent.trim(), sections };
}

function MarkdownContent({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn('prose-wallet', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          // Lazy load images with proper attributes
          img: ({ src, alt, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt || 'Image'}
              loading="lazy"
              decoding="async"
              className="max-w-full h-auto rounded-lg"
              {...props}
            />
          ),
          table: ({ children, ...props }) => (
            <div className="table-wrapper">
              <table {...props}>{children}</table>
            </div>
          ),
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith('http');
            
            // Transform relative .md links to Next.js routes
            let transformedHref = href;
            if (href && !isExternal && href.includes('.md')) {
              // Extract filename and anchor hash from relative path
              // e.g., ./WALLET_COMPARISON_UNIFIED_DETAILS.md#section or WALLET_COMPARISON_UNIFIED_DETAILS.md#section
              const [pathPart, hashPart] = href.split('#');
              const filename = pathPart.replace(/^\.\//, '').replace(/^.*\//, '');
              
              if (filename && filename.endsWith('.md')) {
                // Convert filename to slug format (same as markdown.ts)
                const slug = filename.replace('.md', '').toLowerCase().replace(/_/g, '-');
                transformedHref = `/docs/${slug}${hashPart ? `#${hashPart}` : ''}`;
              }
            }
            
            // Use Next.js Link for internal routes, regular <a> for external
            if (transformedHref && !isExternal && transformedHref.startsWith('/')) {
              return (
                <Link href={transformedHref} {...props}>
                  {children}
                </Link>
              );
            }
            
            return (
              <a
                href={transformedHref}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          pre: ({ children, ...props }) => (
            <pre {...props} className="relative group">
              {children}
            </pre>
          ),
          del: ({ children }) => (
            <del className="text-muted-foreground">{children}</del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function EnhancedMarkdownRenderer({ 
  content, 
  className,
  showExpandableSections = true 
}: EnhancedMarkdownRendererProps) {
  const [showAll, setShowAll] = useState(false);
  
  if (!showExpandableSections) {
    return <MarkdownContent content={content} className={className} />;
  }

  const { primary, sections } = parseMarkdownSections(content);
  
  return (
    <div className={className}>
      {/* Primary Content (tables, summary, etc.) */}
      <MarkdownContent content={primary} />
      
      {/* Expandable Sections */}
      {sections.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Additional Information</h2>
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-primary hover:underline"
            >
              {showAll ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
          
          <div className="space-y-4">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <CollapsibleSection
                  key={section.id}
                  title={section.title}
                  icon={<Icon className="h-5 w-5" />}
                  defaultOpen={showAll}
                >
                  <MarkdownContent content={section.content} />
                </CollapsibleSection>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
