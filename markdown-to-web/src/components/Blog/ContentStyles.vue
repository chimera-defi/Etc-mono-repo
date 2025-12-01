<template>
  <div style="display: none;">
    <!-- This component only provides global styles for markdown content -->
  </div>
</template>

<script>
export default {
  name: 'ContentStyles'
};
</script>

<style>
/* Markdown Content Styles - Professional documentation styling */

/* Base */
.md-content {
  @apply text-gray-300 leading-relaxed;
  word-wrap: break-word;
}

/* Headings */
.md-h1 { @apply text-3xl md:text-4xl font-bold text-white mt-8 mb-6 pb-3 border-b-2 border-emerald-600/30; }
.md-h2 { @apply text-2xl md:text-3xl font-bold text-white mt-12 mb-6 pt-4 border-t border-gray-800; }
.md-h3 { @apply text-xl md:text-2xl font-bold text-gray-100 mt-8 mb-4 pl-3 border-l-4 border-emerald-500; }
.md-h4 { @apply text-lg md:text-xl font-semibold text-gray-200 mt-6 mb-3; }
.md-h5, .md-h6 { @apply text-base md:text-lg font-semibold text-gray-300 mt-4 mb-2; }

/* Text */
.md-paragraph { @apply text-gray-300 text-base md:text-lg mb-6 leading-relaxed; }
.md-strong { @apply text-white font-bold; }
.md-emphasis { @apply text-gray-100 italic; }
.md-strikethrough { @apply text-gray-500 line-through; }

/* Links */
.md-link { @apply text-emerald-400 underline hover:text-emerald-300 hover:no-underline transition-colors; }
.md-link-external::after { content: ' ↗'; @apply text-xs; vertical-align: super; }

/* Lists */
.md-unordered-list,
.md-ordered-list {
  @apply mb-6 pl-6 space-y-2 py-4 pr-4 rounded-lg;
  background: rgba(31, 41, 55, 0.3);
}
.md-list-item { @apply text-gray-300 leading-relaxed; }
.md-unordered-list .md-list-item { @apply list-disc; }
.md-ordered-list .md-list-item { @apply list-decimal; }
.md-list-item::marker { @apply text-emerald-400; }
.md-ordered-list .md-list-item::marker { @apply font-bold; }

/* Nested lists */
.md-unordered-list ul,
.md-unordered-list ol,
.md-ordered-list ul,
.md-ordered-list ol {
  @apply mt-2 mb-0 ml-4 bg-transparent py-0;
}

/* Code */
.md-code-block {
  @apply relative my-6 rounded-lg overflow-hidden bg-gray-900 border border-gray-700;
}
.md-code-lang {
  @apply absolute top-0 right-0 px-3 py-1 text-xs bg-gray-800 text-emerald-400 rounded-bl-lg font-mono;
}
.md-code-block pre {
  @apply p-4 md:p-6 overflow-x-auto text-sm md:text-base;
}
.md-code-block code {
  @apply text-gray-200 font-mono bg-transparent p-0;
  white-space: pre;
}
.md-inline-code {
  @apply bg-gray-800 text-emerald-400 px-2 py-0.5 rounded text-sm font-mono border border-gray-700;
}

/* Blockquotes */
.md-blockquote {
  @apply my-6 pl-6 pr-4 py-4 border-l-4 border-emerald-500 bg-gradient-to-r from-gray-800 to-transparent rounded-r-lg;
  position: relative;
}
.md-blockquote::before {
  content: '"';
  @apply text-emerald-400 text-4xl font-bold absolute -top-2 left-2;
  opacity: 0.5;
}
.md-blockquote p { @apply mb-0 text-gray-200 italic; }

/* Tables - Enhanced for wallet comparison */
.md-table-wrapper {
  @apply my-6 overflow-x-auto rounded-lg border border-gray-700;
  background: rgba(31, 41, 55, 0.5);
}
.md-table {
  @apply w-full min-w-full;
  border-collapse: separate;
  border-spacing: 0;
}
.md-table-head { background: rgba(17, 24, 39, 0.8); }
.md-table-header,
.md-table-cell {
  @apply px-4 py-3 text-left border-b border-gray-700 text-sm md:text-base;
}
.md-table-header {
  @apply text-emerald-400 font-bold border-b-2 border-r;
}
.md-table-cell {
  @apply text-gray-300 border-r;
}
.md-table-header:last-child,
.md-table-cell:last-child { @apply border-r-0; }
.md-table-row:last-child .md-table-cell { @apply border-b-0; }
.md-table-row:hover { background: rgba(55, 65, 81, 0.3); }

/* Images */
.md-figure { @apply my-6 text-center; }
.md-image { @apply max-w-full h-auto mx-auto rounded-lg shadow-xl border border-gray-700; }
.md-figcaption { @apply mt-2 text-sm text-gray-400 italic; }

/* Misc */
.md-divider {
  @apply my-12 border-0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
}
.md-task-item { @apply list-none flex items-start gap-2; }
.md-task-checkbox { @apply mt-1; }

/* Mobile */
@media (max-width: 768px) {
  .md-h1 { @apply text-2xl mt-6 mb-4; }
  .md-h2 { @apply text-xl mt-8 mb-4 pt-3; }
  .md-h3 { @apply text-lg mt-6 mb-3; }
  .md-paragraph { @apply text-base mb-4; }
  .md-unordered-list,
  .md-ordered-list { @apply pl-4 py-3; }
  .md-code-block pre { @apply p-3 text-xs; }
  .md-table-header,
  .md-table-cell { @apply px-2 py-2 text-xs; }
  .md-blockquote { @apply pl-4 py-3; }
  .md-divider { @apply my-8; }
}

/* Anchor offset for fixed headers */
[id].md-h1,
[id].md-h2,
[id].md-h3,
[id].md-h4,
[id].md-h5,
[id].md-h6 { scroll-margin-top: 5rem; }
</style>
