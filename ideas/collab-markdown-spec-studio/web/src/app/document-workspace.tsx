"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as Y from "yjs";

import type { DocumentRecord } from "@/lib/specforge/contracts";
import { markdownToEditorHtml, tiptapJsonToMarkdown } from "@/lib/specforge/editor";

type Props = {
  document: DocumentRecord;
};

export function DocumentWorkspace({ document }: Props) {
  const collabUrl =
    process.env.NEXT_PUBLIC_COLLAB_URL?.trim() || "ws://127.0.0.1:4321";
  const roomName = `${document.document_id}:v${document.version}`;
  const [status, setStatus] = useState(`Connecting to ${roomName}`);
  const [isPending, startTransition] = useTransition();
  const collab = useMemo(() => {
    const ydoc = new Y.Doc();
    const provider = new HocuspocusProvider({
      url: collabUrl,
      name: roomName,
      document: ydoc,
    });

    return { ydoc, provider };
  }, [collabUrl, roomName]);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        undoRedo: false,
      }),
      Collaboration.configure({
        document: collab.ydoc,
      }),
    ],
    editorProps: {
      attributes: {
        class: "specforgeEditor",
      },
    },
  });

  useEffect(() => {
    return () => {
      collab.provider.destroy();
      collab.ydoc.destroy();
    };
  }, [collab]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleStatus = ({ status: nextStatus }: { status: string }) => {
      setStatus(
        nextStatus === "connected"
          ? `Live room connected: ${roomName}`
          : `Collab ${nextStatus}: ${roomName}`,
      );
    };

    const handleSynced = () => {
      const current = editor.getJSON();
      const hasContent = Array.isArray(current.content) && current.content.length > 0;

      if (!hasContent) {
        editor.commands.setContent(markdownToEditorHtml(document.markdown));
        setStatus(`Seeded live room: ${roomName}`);
        return;
      }

      setStatus(`Live room synced: ${roomName}`);
    };

    collab.provider.on("status", handleStatus);
    collab.provider.on("synced", handleSynced);

    return () => {
      collab.provider.off("status", handleStatus);
      collab.provider.off("synced", handleSynced);
    };
  }, [collab.provider, document.markdown, editor, roomName]);

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

      setStatus(`Saved snapshot for ${roomName}`);
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
