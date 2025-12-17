'use client';

import { Twitter, Facebook, Linkedin, Mail, Link2, Check } from 'lucide-react';
import { useState } from 'react';
import { getSocialShareUrls } from '@/lib/seo';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

/**
 * Social sharing buttons component
 * Provides share functionality for Twitter, Facebook, LinkedIn, Email, and Copy Link
 */
export function SocialShare({ url, title, description, className = '' }: SocialShareProps) {
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

  const buttons = [
    {
      platform: 'twitter' as const,
      icon: Twitter,
      label: 'Share on Twitter',
      className: 'hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]',
    },
    {
      platform: 'facebook' as const,
      icon: Facebook,
      label: 'Share on Facebook',
      className: 'hover:bg-[#4267B2]/10 hover:text-[#4267B2]',
    },
    {
      platform: 'linkedin' as const,
      icon: Linkedin,
      label: 'Share on LinkedIn',
      className: 'hover:bg-[#0077B5]/10 hover:text-[#0077B5]',
    },
    {
      platform: 'email' as const,
      icon: Mail,
      label: 'Share via Email',
      className: 'hover:bg-muted',
    },
  ];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-sm text-muted-foreground mr-2">Share:</span>
      {buttons.map(({ platform, icon: Icon, label, className: btnClass }) => (
        <button
          key={platform}
          onClick={() => handleShare(platform)}
          className={`p-2 rounded-lg text-muted-foreground transition-colors ${btnClass}`}
          title={label}
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
      <button
        onClick={handleCopyLink}
        className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
        title={copied ? 'Copied!' : 'Copy link'}
        aria-label="Copy link"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

/**
 * Compact social share for mobile/smaller spaces
 */
export function SocialShareCompact({ url, title, description }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
        title="Share"
        aria-label="Share"
      >
        <Link2 className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 p-2 bg-background border border-border rounded-lg shadow-lg z-50">
          <SocialShare url={url} title={title} description={description} />
        </div>
      )}
    </div>
  );
}
