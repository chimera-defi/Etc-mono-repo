'use client';

import { Twitter, Facebook, Linkedin, Mail, Link2, Check } from 'lucide-react';
import { useState } from 'react';
import { getSocialShareUrls } from '@/lib/seo';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
  size?: 'default' | 'large';
}

/**
 * Social sharing buttons component
 * Provides share functionality for Twitter, Facebook, LinkedIn, Email, and Copy Link
 */
export function SocialShare({ url, title, description, className = '', size = 'default' }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const shareUrls = getSocialShareUrls(url, title, description);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    const shareUrl = shareUrls[platform];
    if (platform === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
    }
  };

  const isLarge = size === 'large';
  const iconSize = isLarge ? 'h-5 w-5' : 'h-4 w-4';
  const buttonPadding = isLarge ? 'p-3' : 'p-2';
  const labelSize = isLarge ? 'text-base font-medium' : 'text-sm';

  const buttons = [
    {
      platform: 'twitter' as const,
      icon: Twitter,
      label: 'Share on Twitter',
      shortLabel: 'Twitter',
      className: 'hover:bg-slate-900/60 hover:text-slate-100',
      bgClass: 'bg-slate-900/70 text-[#38bdf8] border border-slate-700/60',
    },
    {
      platform: 'facebook' as const,
      icon: Facebook,
      label: 'Share on Facebook',
      shortLabel: 'Facebook',
      className: 'hover:bg-slate-900/60 hover:text-slate-100',
      bgClass: 'bg-slate-900/70 text-[#60a5fa] border border-slate-700/60',
    },
    {
      platform: 'linkedin' as const,
      icon: Linkedin,
      label: 'Share on LinkedIn',
      shortLabel: 'LinkedIn',
      className: 'hover:bg-slate-900/60 hover:text-slate-100',
      bgClass: 'bg-slate-900/70 text-[#38bdf8] border border-slate-700/60',
    },
    {
      platform: 'email' as const,
      icon: Mail,
      label: 'Share via Email',
      shortLabel: 'Email',
      className: 'hover:bg-slate-900/60 hover:text-slate-100',
      bgClass: 'bg-slate-900/70 text-slate-200 border border-slate-700/60',
    },
  ];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`${labelSize} text-muted-foreground mr-1`}>Share:</span>
      {buttons.map(({ platform, icon: Icon, label, shortLabel, className: btnClass, bgClass }) => (
        <button
          key={platform}
          onClick={() => handleShare(platform)}
          className={`${buttonPadding} rounded-lg text-muted-foreground transition-colors ${isLarge ? `${bgClass}` : btnClass} ${isLarge ? 'flex items-center gap-2' : ''}`}
          title={label}
          aria-label={label}
        >
          <Icon className={iconSize} />
          {isLarge && <span className="hidden sm:inline text-sm">{shortLabel}</span>}
        </button>
      ))}
      <button
        onClick={handleCopyLink}
        className={`${buttonPadding} rounded-lg text-muted-foreground hover:bg-slate-900/60 transition-colors ${isLarge ? 'bg-slate-900/70 border border-slate-700/60 flex items-center gap-2' : ''}`}
        title={copied ? 'Copied!' : 'Copy link'}
        aria-label="Copy link"
      >
        {copied ? (
          <>
            <Check className={`${iconSize} text-green-500`} />
            {isLarge && <span className="hidden sm:inline text-sm text-green-500">Copied!</span>}
          </>
        ) : (
          <>
            <Link2 className={iconSize} />
            {isLarge && <span className="hidden sm:inline text-sm">Copy</span>}
          </>
        )}
      </button>
    </div>
  );
}
