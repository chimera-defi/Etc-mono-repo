"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as Y from "yjs";

import type { DocumentRecord } from "@/lib/specforge/contracts";
import { markdownToEditorHtml, tiptapJsonToMarkdown } from "@/lib/specforge/editor";

type Props = {
  document: DocumentRecord;
  blockSummaries: {
    block_id: string;
    heading: string;
    openComments: number;
    pendingPatches: number;
    touchedBy: string[];
  }[];
};

type Collaborator = {
  id: string;
  name: string;
  color: string;
  state: string;
};

type RemoteCursor = {
  id: string;
  name: string;
  color: string;
  left: number;
  top: number;
};

type BlockMarker = {
  block_id: string;
  heading: string;
  label: string;
  top: number;
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

export function DocumentWorkspace({ document, blockSummaries }: Props) {
  const collabUrl =
    process.env.NEXT_PUBLIC_COLLAB_URL?.trim() || "ws://127.0.0.1:4321";
  const roomName = `${document.document_id}:v${document.version}`;
  const [localUser] = useState(makeLocalUser);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [blockMarkers, setBlockMarkers] = useState<BlockMarker[]>([]);
  const [status, setStatus] = useState(`Connecting to ${roomName}`);
  const [statusTone, setStatusTone] = useState<"neutral" | "success" | "warning">("warning");
  const [isPending, startTransition] = useTransition();
  const surfaceRef = useRef<HTMLDivElement | null>(null);
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
    awareness.setLocalStateField("selection", null);

    const handleStatus = ({ status: nextStatus }: { status: string }) => {
      setStatusTone(nextStatus === "connected" ? "success" : "warning");
      setStatus(
        nextStatus === "connected"
          ? `Live room connected: ${roomName}`
          : `Collab ${nextStatus}: ${roomName}`,
      );
    };

    const handleSynced = () => {
      const hasContent = editor.getText().trim().length > 0;

      if (!hasContent) {
        editor.commands.setContent(markdownToEditorHtml(document.markdown));
        setStatusTone("success");
        setStatus(`Seeded live room: ${roomName}`);
        return;
      }

      setStatusTone("success");
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

    const updateRemoteCursors = () => {
      const container = surfaceRef.current;
      if (!container) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const states = Array.from(awareness.getStates().values());
      const nextCursors = states
        .map((state) => {
          const user = state.user as { id?: string; name?: string; color?: string } | undefined;
          const selection = state.selection as { head?: number } | undefined;

          if (
            !user?.id ||
            user.id === localUser.id ||
            !user.name ||
            !user.color ||
            typeof selection?.head !== "number"
          ) {
            return null;
          }

          try {
            const coords = editor.view.coordsAtPos(selection.head);
            return {
              id: user.id,
              name: user.name,
              color: user.color,
              left: coords.left - containerRect.left,
              top: coords.top - containerRect.top,
            };
          } catch {
            return null;
          }
        })
        .filter((value): value is RemoteCursor => Boolean(value));

      setRemoteCursors(nextCursors);
    };

    const updateLocalSelection = () => {
      const selection = editor.state.selection;
      awareness.setLocalStateField("selection", {
        anchor: selection.anchor,
        head: selection.head,
      });
      updateRemoteCursors();
    };

    const handleFocus = () => {
      awareness.setLocalStateField("presence", {
        room: roomName,
        state: "editing",
      });
      updateLocalSelection();
      updateCollaborators();
    };

    const handleBlur = () => {
      awareness.setLocalStateField("presence", {
        room: roomName,
        state: "viewing",
      });
      awareness.setLocalStateField("selection", null);
      setRemoteCursors([]);
      updateCollaborators();
    };

    const handleWindowChange = () => {
      updateRemoteCursors();
    };
    const handleAwarenessChange = () => {
      updateCollaborators();
      updateRemoteCursors();
    };

    collab.provider.on("status", handleStatus);
    collab.provider.on("synced", handleSynced);
    awareness.on("change", handleAwarenessChange);
    editor.on("focus", handleFocus);
    editor.on("blur", handleBlur);
    editor.on("selectionUpdate", updateLocalSelection);
    editor.on("update", updateRemoteCursors);
    window.addEventListener("resize", handleWindowChange);
    updateLocalSelection();
    updateCollaborators();
    updateRemoteCursors();

    return () => {
      collab.provider.off("status", handleStatus);
      collab.provider.off("synced", handleSynced);
      awareness.off("change", handleAwarenessChange);
      editor.off("focus", handleFocus);
      editor.off("blur", handleBlur);
      editor.off("selectionUpdate", updateLocalSelection);
      editor.off("update", updateRemoteCursors);
      window.removeEventListener("resize", handleWindowChange);
    };
  }, [collab.provider, document.markdown, editor, localUser, roomName]);

  useEffect(() => {
    if (!editor || !surfaceRef.current) {
      return;
    }

    const container = surfaceRef.current;

    const updateBlockMarkers = () => {
      const containerRect = container.getBoundingClientRect();
      const headings = Array.from(
        container.querySelectorAll<HTMLElement>(".specforgeEditor h1, .specforgeEditor h2"),
      );
      const nextMarkers = blockSummaries
        .map((summary) => {
          const match = headings.find(
            (heading) => heading.textContent?.trim().toLowerCase() === summary.heading.toLowerCase(),
          );
          const activityCount = summary.pendingPatches + summary.openComments;

          if (!match || (activityCount === 0 && summary.touchedBy.length === 0)) {
            return null;
          }

          const matchRect = match.getBoundingClientRect();
          const labelParts = [];

          if (summary.pendingPatches > 0) {
            labelParts.push(
              `${summary.pendingPatches} patch${summary.pendingPatches === 1 ? "" : "es"}`,
            );
          }
          if (summary.openComments > 0) {
            labelParts.push(
              `${summary.openComments} comment${summary.openComments === 1 ? "" : "s"}`,
            );
          }
          if (labelParts.length === 0) {
            labelParts.push(
              `${summary.touchedBy.length} contributor${summary.touchedBy.length === 1 ? "" : "s"}`,
            );
          }

          return {
            block_id: summary.block_id,
            heading: summary.heading,
            label: labelParts.join(" · "),
            top: matchRect.top - containerRect.top,
          };
        })
        .filter((value): value is BlockMarker => Boolean(value));

      setBlockMarkers(nextMarkers);
    };

    const raf = window.requestAnimationFrame(updateBlockMarkers);
    const handleLayout = () => updateBlockMarkers();

    editor.on("update", handleLayout);
    window.addEventListener("resize", handleLayout);

    return () => {
      window.cancelAnimationFrame(raf);
      editor.off("update", handleLayout);
      window.removeEventListener("resize", handleLayout);
    };
  }, [blockSummaries, document.version, editor]);

  async function saveDocument() {
    if (!editor) {
      return;
    }

    const editorJson = editor.getJSON();
    const markdown = tiptapJsonToMarkdown(editorJson);

    startTransition(async () => {
      setStatus("Saving...");
      setStatusTone("warning");
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
        setStatusTone("warning");
        setStatus("Save failed");
        return;
      }

      setStatusTone("success");
      setStatus(`Saved snapshot for ${roomName}`);
    });
  }

  return (
    <div>
      <div className="editorToolbar">
        <div>
          <strong>{document.title}</strong>
          <span>
            <span className={`statusChip statusChip--${statusTone}`}>{statusTone}</span> {status}
          </span>
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
      <div className="editorSurface" ref={surfaceRef}>
        {blockMarkers.map((marker) => (
          <div key={marker.block_id} className="blockMarker" style={{ top: `${marker.top}px` }}>
            <strong>{marker.heading}</strong>
            <span>{marker.label}</span>
          </div>
        ))}
        {remoteCursors.map((cursor) => (
          <div
            key={cursor.id}
            className="remoteCursor"
            style={{ left: `${cursor.left}px`, top: `${cursor.top}px`, color: cursor.color }}
          >
            <span className="remoteCursor__label" style={{ backgroundColor: cursor.color }}>
              {cursor.name}
            </span>
          </div>
        ))}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
