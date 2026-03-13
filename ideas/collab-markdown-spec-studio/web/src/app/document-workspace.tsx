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

type Collaborator = {
  id: string;
  name: string;
  color: string;
  state: string;
};

const userPalette = ["#0f766e", "#1d4ed8", "#c2410c", "#7c3aed", "#be123c"];

function makeLocalUser() {
  if (typeof window === "undefined") {
    return {
      id: "local-reviewer",
      name: "Local reviewer",
      color: userPalette[0],
    };
  }

  const existing = window.sessionStorage.getItem("specforge-local-user");
  if (existing) {
    return JSON.parse(existing) as { id: string; name: string; color: string };
  }

  const id = `reviewer-${crypto.randomUUID().slice(0, 6)}`;
  const suffix = id.slice(-3).toUpperCase();
  const color = userPalette[id.charCodeAt(id.length - 1) % userPalette.length]!;
  const value = {
    id,
    name: `Reviewer ${suffix}`,
    color,
  };
  window.sessionStorage.setItem("specforge-local-user", JSON.stringify(value));
  return value;
}

export function DocumentWorkspace({ document }: Props) {
  const collabUrl =
    process.env.NEXT_PUBLIC_COLLAB_URL?.trim() || "ws://127.0.0.1:4321";
  const roomName = `${document.document_id}:v${document.version}`;
  const [localUser] = useState(makeLocalUser);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
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
    const awareness = collab.provider.awareness;

    if (!editor || !awareness) {
      return;
    }

    awareness.setLocalStateField("user", localUser);
    awareness.setLocalStateField("presence", {
      room: roomName,
      state: "viewing",
    });

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

    const updateCollaborators = () => {
      const states = Array.from(awareness.getStates().values());
      const nextCollaborators = states
        .map((state) => {
          const user = state.user as { id?: string; name?: string; color?: string } | undefined;
          const presence = state.presence as { state?: string } | undefined;
          if (!user?.id || !user?.name || !user?.color) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            color: user.color,
            state: presence?.state ?? "viewing",
          };
        })
        .filter((value): value is Collaborator => Boolean(value))
        .sort((left, right) => left.name.localeCompare(right.name));

      setCollaborators(nextCollaborators);
    };

    const handleFocus = () => {
      awareness.setLocalStateField("presence", {
        room: roomName,
        state: "editing",
      });
      updateCollaborators();
    };

    const handleBlur = () => {
      awareness.setLocalStateField("presence", {
        room: roomName,
        state: "viewing",
      });
      updateCollaborators();
    };

    collab.provider.on("status", handleStatus);
    collab.provider.on("synced", handleSynced);
    awareness.on("change", updateCollaborators);
    editor.on("focus", handleFocus);
    editor.on("blur", handleBlur);
    updateCollaborators();

    return () => {
      collab.provider.off("status", handleStatus);
      collab.provider.off("synced", handleSynced);
      awareness.off("change", updateCollaborators);
      editor.off("focus", handleFocus);
      editor.off("blur", handleBlur);
    };
  }, [collab.provider, document.markdown, editor, localUser, roomName]);

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
      <div className="presenceBar">
        <span>Live collaborators</span>
        <div className="presenceList">
          {collaborators.map((collaborator) => (
            <span
              key={collaborator.id}
              className="presenceChip"
              style={{ borderColor: collaborator.color }}
            >
              <i style={{ backgroundColor: collaborator.color }} />
              {collaborator.name} · {collaborator.state}
            </span>
          ))}
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
