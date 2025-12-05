<template>
  <div style="display: none;">
    <!-- This component provides global styles for markdown content -->
  </div>
</template>

<script>
export default {
  name: 'ContentStyles'
};
</script>

<style>
/* Markdown Content Styles - Professional documentation styling */
/* These use CSS variables for theming - override in your app */

:root {
  --md-color-primary: #10b981;
  --md-color-primary-light: #34d399;
  --md-color-bg: #111827;
  --md-color-surface: #1f2937;
  --md-color-text: #f3f4f6;
  --md-color-text-muted: #9ca3af;
  --md-color-border: #374151;
}

/* Base */
.md-content {
  color: var(--md-color-text-muted);
  line-height: 1.75;
  word-wrap: break-word;
}

/* Headings */
.md-h1 {
  font-size: 2.25rem;
  font-weight: 700;
  color: white;
  margin-top: 2rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(16, 185, 129, 0.3);
}

.md-h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: white;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--md-color-border);
}

.md-h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f3f4f6;
  margin-top: 2rem;
  margin-bottom: 1rem;
  padding-left: 0.75rem;
  border-left: 4px solid var(--md-color-primary);
}

.md-h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e5e7eb;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.md-h5, .md-h6 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #d1d5db;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

/* Text */
.md-paragraph {
  color: #d1d5db;
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
  line-height: 1.75;
}

.md-strong { color: white; font-weight: 700; }
.md-emphasis { color: #f3f4f6; font-style: italic; }
.md-strikethrough { color: #6b7280; text-decoration: line-through; }

/* Links */
.md-link {
  color: var(--md-color-primary);
  text-decoration: underline;
  transition: color 0.2s;
}

.md-link:hover {
  color: var(--md-color-primary-light);
  text-decoration: none;
}

/* Lists */
.md-unordered-list,
.md-ordered-list {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
  padding-right: 1rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  border-radius: 0.5rem;
  background: rgba(31, 41, 55, 0.3);
}

.md-list-item {
  color: #d1d5db;
  line-height: 1.75;
  margin-bottom: 0.5rem;
}

.md-unordered-list .md-list-item { list-style-type: disc; }
.md-ordered-list .md-list-item { list-style-type: decimal; }

.md-list-item::marker {
  color: var(--md-color-primary);
}

/* Nested lists */
.md-unordered-list ul,
.md-unordered-list ol,
.md-ordered-list ul,
.md-ordered-list ol {
  margin-top: 0.5rem;
  margin-bottom: 0;
  margin-left: 1rem;
  background: transparent;
  padding: 0;
}

/* Code */
.md-code-block {
  position: relative;
  margin: 1.5rem 0;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #111827;
  border: 1px solid var(--md-color-border);
}

.md-code-lang {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  background: var(--md-color-surface);
  color: var(--md-color-primary);
  border-bottom-left-radius: 0.5rem;
  font-family: monospace;
}

.md-code-block pre {
  padding: 1.5rem;
  overflow-x: auto;
  font-size: 0.875rem;
  margin: 0;
}

.md-code-block code {
  color: #e5e7eb;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  background: transparent;
  padding: 0;
  white-space: pre;
}

.md-inline-code {
  background: var(--md-color-surface);
  color: var(--md-color-primary);
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-family: monospace;
  border: 1px solid var(--md-color-border);
}

/* Blockquotes */
.md-blockquote {
  margin: 1.5rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid var(--md-color-primary);
  background: linear-gradient(to right, var(--md-color-surface), transparent);
  border-radius: 0 0.5rem 0.5rem 0;
  position: relative;
}

.md-blockquote::before {
  content: '"';
  color: var(--md-color-primary);
  font-size: 2.5rem;
  font-weight: 700;
  position: absolute;
  top: -0.5rem;
  left: 0.5rem;
  opacity: 0.5;
}

.md-blockquote p {
  margin: 0;
  color: #e5e7eb;
  font-style: italic;
}

/* Tables */
.md-table-wrapper {
  margin: 1.5rem 0;
  overflow-x: auto;
  border-radius: 0.5rem;
  border: 1px solid var(--md-color-border);
  background: rgba(31, 41, 55, 0.5);
}

.md-table {
  width: 100%;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.md-table-head {
  background: rgba(17, 24, 39, 0.8);
}

.md-table-header,
.md-table-cell {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--md-color-border);
  font-size: 0.875rem;
}

.md-table-header {
  color: var(--md-color-primary);
  font-weight: 700;
  border-bottom-width: 2px;
  border-right: 1px solid var(--md-color-border);
}

.md-table-cell {
  color: #d1d5db;
  border-right: 1px solid var(--md-color-border);
}

.md-table-header:last-child,
.md-table-cell:last-child {
  border-right: 0;
}

.md-table-row:last-child .md-table-cell {
  border-bottom: 0;
}

.md-table-row:hover {
  background: rgba(55, 65, 81, 0.3);
}

/* Images */
.md-image {
  max-width: 100%;
  height: auto;
  margin: 0 auto;
  display: block;
  border-radius: 0.5rem;
  border: 1px solid var(--md-color-border);
}

/* Divider */
.md-divider {
  margin: 3rem 0;
  border: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--md-color-primary), transparent);
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .md-h1 { font-size: 1.5rem; margin-top: 1.5rem; margin-bottom: 1rem; }
  .md-h2 { font-size: 1.25rem; margin-top: 2rem; margin-bottom: 1rem; }
  .md-h3 { font-size: 1.125rem; margin-top: 1.5rem; margin-bottom: 0.75rem; }
  .md-paragraph { font-size: 1rem; margin-bottom: 1rem; }
  .md-code-block pre { padding: 0.75rem; font-size: 0.75rem; }
  .md-table-header, .md-table-cell { padding: 0.5rem; font-size: 0.75rem; }
  .md-blockquote { padding: 0.75rem 1rem; }
  .md-divider { margin: 2rem 0; }
}

/* Anchor offset for fixed headers */
[id].md-h1,
[id].md-h2,
[id].md-h3,
[id].md-h4,
[id].md-h5,
[id].md-h6 {
  scroll-margin-top: 5rem;
}
</style>
