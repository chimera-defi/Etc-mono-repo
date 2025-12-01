import { marked } from 'marked';

// Configure marked for GitHub-flavored markdown
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  sanitize: false,
  smartLists: true,
  smartypants: true
});

// Custom renderer for styled markdown
const renderer = new marked.Renderer();

// Helper to generate IDs from text
const makeId = (text) => {
  if (typeof text !== 'string') {
    console.warn('makeId received non-string:', typeof text, text);
    return 'heading-' + Math.random().toString(36).substr(2, 9);
  }
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
};

// Helper to escape HTML
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

// Headings with classes
renderer.heading = ({ tokens, depth }) => {
  const text = renderer.parser.parseInline(tokens);
  return `<h${depth} id="${makeId(text)}" class="md-h${depth}">${text}</h${depth}>\n`;
};

// Code blocks with language labels
renderer.code = ({ text, lang, escaped }) => {
  const code = escaped ? text : escapeHtml(text);
  const language = lang || 'plaintext';
  return `<div class="md-code-block">
  ${lang ? `<div class="md-code-lang">${lang}</div>` : ''}
  <pre><code class="language-${language}">${code}</code></pre>
</div>\n`;
};

// Inline code
renderer.codespan = ({ text }) => `<code class="md-inline-code">${escapeHtml(text)}</code>`;

// Blockquotes
renderer.blockquote = ({ tokens }) => {
  const content = renderer.parser.parse(tokens);
  return `<blockquote class="md-blockquote">${content}</blockquote>\n`;
};

// Tables with wrapper
renderer.table = ({ header, rows }) => {
  let headerHtml = '';
  for (let i = 0; i < header.length; i++) {
    headerHtml += renderer.tablecell(header[i]);
  }
  const headerRow = `<tr class="md-table-row">${headerHtml}</tr>\n`;
  
  let bodyHtml = '';
  for (let i = 0; i < rows.length; i++) {
    let rowHtml = '';
    for (let j = 0; j < rows[i].length; j++) {
      rowHtml += renderer.tablecell(rows[i][j]);
    }
    bodyHtml += `<tr class="md-table-row">${rowHtml}</tr>\n`;
  }
  
  return `<div class="md-table-wrapper">
  <table class="md-table">
    <thead class="md-table-head">${headerRow}</thead>
    <tbody class="md-table-body">${bodyHtml}</tbody>
  </table>
</div>\n`;
};

renderer.tablerow = ({ text }) => `<tr class="md-table-row">${text}</tr>\n`;
renderer.tablecell = (cell) => {
  const content = renderer.parser.parseInline(cell.tokens);
  const tag = cell.header ? 'th' : 'td';
  const cls = cell.header ? 'md-table-header' : 'md-table-cell';
  const align = cell.align ? ` style="text-align: ${cell.align}"` : '';
  return `<${tag} class="${cls}"${align}>${content}</${tag}>`;
};

// Lists
renderer.list = ({ ordered, start, items }) => {
  const tag = ordered ? 'ol' : 'ul';
  const cls = ordered ? 'md-ordered-list' : 'md-unordered-list';
  const startAttr = ordered && start !== 1 ? ` start="${start}"` : '';
  
  let body = '';
  for (let i = 0; i < items.length; i++) {
    body += renderer.listitem(items[i]);
  }
  
  return `<${tag} class="${cls}"${startAttr}>${body}</${tag}>\n`;
};

renderer.listitem = (item) => {
  const content = renderer.parser.parse(item.tokens, !!item.loose);
  return `<li class="md-list-item">${content}</li>\n`;
};

// Paragraphs
renderer.paragraph = ({ tokens }) => {
  const content = renderer.parser.parseInline(tokens);
  return `<p class="md-paragraph">${content}</p>\n`;
};

// Links
renderer.link = ({ href, title, tokens }) => {
  const text = renderer.parser.parseInline(tokens);
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
  const external = href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${escapeHtml(href)}"${titleAttr}${external} class="md-link">${text}</a>`;
};

// Images
renderer.image = ({ href, title, text, tokens }) => {
  const altText = tokens ? renderer.parser.parseInline(tokens, renderer.parser.textRenderer) : text;
  const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
  return `<img src="${escapeHtml(href)}" alt="${escapeHtml(altText)}"${titleAttr} class="md-image" loading="lazy" />`;
};

// Horizontal rules
renderer.hr = () => '<hr class="md-divider" />\n';

// Strong (bold)
renderer.strong = ({ tokens }) => {
  const content = renderer.parser.parseInline(tokens);
  return `<strong class="md-strong">${content}</strong>`;
};

// Emphasis (italic)
renderer.em = ({ tokens }) => {
  const content = renderer.parser.parseInline(tokens);
  return `<em class="md-emphasis">${content}</em>`;
};

// Strikethrough
renderer.del = ({ tokens }) => {
  const content = renderer.parser.parseInline(tokens);
  return `<del class="md-strikethrough">${content}</del>`;
};

// Export the parsing function
export function parseMarkdown(markdown) {
  try {
    return marked(markdown, { renderer });
  } catch (error) {
    console.error('Error parsing markdown:', error);
    // Return escaped content as fallback
    return `<pre>${escapeHtml(markdown)}</pre>`;
  }
}

// Export marked for direct use if needed
export { marked };
