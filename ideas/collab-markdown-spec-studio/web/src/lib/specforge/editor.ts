type TiptapNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function inlineMarkdownToHtml(value: string) {
  return escapeHtml(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export function markdownToEditorHtml(markdown: string) {
  const lines = markdown.split("\n");
  const parts: string[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) {
      return;
    }

    parts.push(`<p>${inlineMarkdownToHtml(paragraph.join(" "))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length === 0) {
      return;
    }

    parts.push(
      `<ul>${listItems.map((item) => `<li>${inlineMarkdownToHtml(item)}</li>`).join("")}</ul>`,
    );
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.trim().length === 0) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      parts.push(`<h${level}>${inlineMarkdownToHtml(headingMatch[2].trim())}</h${level}>`);
      continue;
    }

    const listMatch = line.match(/^-+\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[1].trim());
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();

  return parts.join("");
}

function readText(content: TiptapNode[] = []): string {
  return content
    .map((node) => {
      if (node.type === "text") {
        return node.text ?? "";
      }

      if (node.type === "hardBreak") {
        return "\n";
      }

      return readText(node.content);
    })
    .join("");
}

function serializeBlock(node: TiptapNode): string | null {
  switch (node.type) {
    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      const safeLevel = Math.min(Math.max(level, 1), 3);
      return `${"#".repeat(safeLevel)} ${readText(node.content).trim()}`;
    }
    case "paragraph":
      return readText(node.content).trim();
    case "bulletList": {
      const items = (node.content ?? [])
        .map((item) => {
          const text = readText(item.content).trim();
          return text.length > 0 ? `- ${text}` : null;
        })
        .filter((value): value is string => Boolean(value));

      return items.join("\n");
    }
    default:
      return null;
  }
}

export function tiptapJsonToMarkdown(document: TiptapNode | null | undefined) {
  if (!document?.content?.length) {
    return "";
  }

  return document.content
    .map((node) => serializeBlock(node))
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join("\n\n")
    .trim();
}
