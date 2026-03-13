"use client";

import { useState, useTransition } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import type { DocumentRecord } from "@/lib/specforge/contracts";
import { markdownToEditorHtml, tiptapJsonToMarkdown } from "@/lib/specforge/editor";

type Props = {
  document: DocumentRecord;
};

export function DocumentWorkspace({ document }: Props) {
  const [status, setStatus] = useState(`Loaded ${document.title}`);
  const [isPending, startTransition] = useTransition();
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: markdownToEditorHtml(document.markdown),
    editorProps: {
      attributes: {
        class: "specforgeEditor",
      },
    },
  });

  async function saveDocument() {
    if (!editor) {
      return;
    }

    const editorJson = editor.getJSON();
    const markdown = tiptapJsonToMarkdown(editorJson);

    startTransition(async () => {
      setStatus("Saving...");
      const response = await fetch(`/api/documents/${document.document_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: document.title,
          markdown,
          editor_json: editorJson,
        }),
      });

      if (!response.ok) {
        setStatus("Save failed");
        return;
      }

      setStatus("Saved. Refresh to sync the dashboard snapshot.");
    });
  }

  return (
    <div>
      <div className="editorToolbar">
        <div>
          <strong>{document.title}</strong>
          <span>{status}</span>
        </div>
        <button type="button" onClick={saveDocument} disabled={!editor || isPending}>
          {isPending ? "Saving..." : "Save document"}
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
