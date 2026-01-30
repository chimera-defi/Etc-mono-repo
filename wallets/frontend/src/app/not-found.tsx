import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-md mx-auto text-center glass-panel p-8">
        <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The document you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-[12px] bg-gradient-to-r from-sky-400 to-indigo-500 px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:brightness-110"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
