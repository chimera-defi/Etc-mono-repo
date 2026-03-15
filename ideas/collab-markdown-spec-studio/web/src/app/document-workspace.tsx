"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import * as Y from "yjs";

import type { DocumentRecord } from "@/lib/specforge/contracts";
import { markdownToEditorHtml, tiptapJsonToMarkdown } from "@/lib/specforge/editor";
import { logger } from "@/lib/logger";

type Props = {
  document: DocumentRecord;
  activeActor: {
    actor_id: string;
    name: string;
    color: string;
  };
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
  contributors: string;
  left: number;
  top: number;
};

type SyncState = "connecting" | "live" | "saving" | "recovering" | "offline" | "stale" | "error";

const userPalette = ["#0f766e", "#1d4ed8", "#c2410c", "#7c3aed", "#be123c"];

function makeLocalUser(activeActor: Props["activeActor"]) {
  if (typeof window === "undefined") {
    return {
      id: `${activeActor.actor_id}-local`,
      name: activeActor.name,
      color: activeActor.color,
    };
  }

  const storageKey = `specforge-local-user:${activeActor.actor_id}`;
  const existing = window.sessionStorage.getItem(storageKey);
  if (existing) {
    return JSON.parse(existing) as { id: string; name: string; color: string };
  }

  const id = `${activeActor.actor_id}-${crypto.randomUUID().slice(0, 6)}`;
  const value = {
    id,
    name: activeActor.name,
    color:
      activeActor.color ||
      userPalette[id.charCodeAt(id.length - 1) % userPalette.length]!,
  };
  window.sessionStorage.setItem(storageKey, JSON.stringify(value));
  return value;
}

export function DocumentWorkspace({ document, activeActor, blockSummaries }: Props) {
  const router = useRouter();
  const collabUrl =
    process.env.NEXT_PUBLIC_COLLAB_URL?.trim() || "ws://127.0.0.1:4321";
  const roomName = `${document.document_id}:v${document.version}`;
  const [localUser] = useState(() => makeLocalUser(activeActor));
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [blockMarkers, setBlockMarkers] = useState<BlockMarker[]>([]);
  const [syncState, setSyncState] = useState<SyncState>("connecting");
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
      token: async () => {
        const response = await fetch("/api/collab/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            document_id: document.document_id,
            version: document.version,
            actor: localUser,
          }),
        });

        if (!response.ok) {
          throw new Error(`Unable to mint collab session for ${roomName}`);
        }

        const payload = (await response.json()) as { token?: string };
        if (!payload.token) {
          throw new Error(`Missing collab token for ${roomName}`);
        }

        return payload.token;
      },
      onAuthenticated: () => {
        updateSyncState("recovering", `Authenticated room: ${roomName}`);
      },
      onAuthenticationFailed: () => {
        updateSyncState("error", `Collab authentication failed: ${roomName}`);
      },
    });

    return { ydoc, provider };
  }, [collabUrl, document.document_id, document.version, localUser, roomName]);
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

  function updateSyncState(nextState: SyncState, message: string) {
    setSyncState(nextState);
    setStatus(message);
    setStatusTone(nextState === "live" ? "success" : nextState === "connecting" ? "neutral" : "warning");
  }

  async function checkDocumentFreshness() {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      updateSyncState("offline", `Offline: ${roomName}`);
      return;
    }

    try {
      const response = await fetch(`/api/documents/${document.document_id}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        updateSyncState("error", `Recovery check failed for ${roomName}`);
        return;
      }

      const payload = (await response.json()) as { document?: { version?: number } };
      const latestVersion = payload.document?.version ?? document.version;

      if (latestVersion > document.version) {
        updateSyncState("stale", `Newer snapshot available: v${latestVersion}`);
        return;
      }

      if (syncState !== "saving") {
        updateSyncState("live", `Live room synced: ${roomName}`);
      }
    } catch (error) {
      // Recovery check can fail if latestVersion query times out or returns unexpected data
      // This is handled gracefully - we just report the error and continue
      logger.warn(
        `Recovery check failed for document room`,
        { roomName, error: error instanceof Error ? error.message : "Unknown error" }
      );
      updateSyncState("error", `Recovery check failed for ${roomName}`);
    }
  }

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
      if (nextStatus === "connected") {
        updateSyncState("recovering", `Checking live room state: ${roomName}`);
        return;
      }

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        updateSyncState("offline", `Offline: ${roomName}`);
        return;
      }

      updateSyncState("recovering", `Collab ${nextStatus}: ${roomName}`);
    };

    const handleSynced = () => {
      const hasContent = editor.getText().trim().length > 0;

      if (!hasContent) {
        editor.commands.setContent(markdownToEditorHtml(document.markdown));
        updateSyncState("live", `Seeded live room: ${roomName}`);
        return;
      }

      updateSyncState("live", `Live room synced: ${roomName}`);
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
          } catch (error) {
            // coordsAtPos can fail if selection is invalid or editor state is not ready
            // Returning null gracefully skips rendering this user's cursor
            logger.debug(
              "Failed to calculate remote cursor position",
              { userId: user.id, error: error instanceof Error ? error.message : "Unknown error" }
            );
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
    const handleOffline = () => {
      collab.provider.disconnect();
      updateSyncState("offline", `Offline: ${roomName}`);
    };
    const handleOnline = () => {
      updateSyncState("recovering", `Reconnecting room: ${roomName}`);
      collab.provider.connect();
    };

    collab.provider.on("status", handleStatus);
    collab.provider.on("synced", handleSynced);
    awareness.on("change", handleAwarenessChange);
    editor.on("focus", handleFocus);
    editor.on("blur", handleBlur);
    editor.on("selectionUpdate", updateLocalSelection);
    editor.on("update", updateRemoteCursors);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
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
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("resize", handleWindowChange);
    };
  }, [collab.provider, document.markdown, editor, localUser, roomName]);

  useEffect(() => {
    const handleFocus = () => {
      void checkDocumentFreshness();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document.document_id, document.version, roomName, syncState]);

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
            contributors: summary.touchedBy.slice(0, 2).join(" · "),
            left: matchRect.left - containerRect.left,
            top: matchRect.top - containerRect.top,
          };
        })
        .filter((value): value is BlockMarker => Boolean(value));

      headings.forEach((heading) => heading.classList.remove("specforgeHeading--active"));
      nextMarkers.forEach((marker) => {
        const match = headings.find(
          (heading) => heading.textContent?.trim().toLowerCase() === marker.heading.toLowerCase(),
        );
        match?.classList.add("specforgeHeading--active");
      });

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
      container
        .querySelectorAll(".specforgeHeading--active")
        .forEach((element) => element.classList.remove("specforgeHeading--active"));
    };
  }, [blockSummaries, document.version, editor]);

  async function saveDocument() {
    if (!editor) {
      return;
    }

    const editorJson = editor.getJSON();
    const markdown = tiptapJsonToMarkdown(editorJson);

    startTransition(async () => {
      updateSyncState("saving", `Saving ${roomName}...`);
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
        updateSyncState("error", `Save failed for ${roomName}`);
        return;
      }

      updateSyncState("recovering", `Saved snapshot for ${roomName}`);
      router.refresh();
    });
  }

  function reconnectRoom() {
    updateSyncState("recovering", `Reconnecting room: ${roomName}`);
    collab.provider.disconnect();
    collab.provider.connect();
  }

  function reloadLatestSnapshot() {
    updateSyncState("recovering", `Reloading latest snapshot: ${roomName}`);
    router.refresh();
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
        <div className="editorToolbar__actions">
          <button type="button" onClick={() => void checkDocumentFreshness()} disabled={isPending}>
            Check latest snapshot
          </button>
          {syncState === "offline" || syncState === "error" ? (
            <button type="button" onClick={reconnectRoom}>
              Reconnect room
            </button>
          ) : null}
          {syncState === "stale" ? (
            <button type="button" onClick={reloadLatestSnapshot}>
              Reload latest snapshot
            </button>
          ) : null}
          <button type="button" onClick={saveDocument} disabled={!editor || isPending}>
            {isPending ? "Saving..." : "Save document"}
          </button>
        </div>
      </div>
      {syncState === "offline" || syncState === "error" || syncState === "stale" ? (
        <div className="recoveryBanner">
          <strong>{syncState === "stale" ? "Recovery needed" : "Connection needs attention"}</strong>
          <span>{status}</span>
        </div>
      ) : null}
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
        {blockMarkers.map((marker) => (
          <div
            key={`${marker.block_id}-inline`}
            className="inlineProvenance"
            style={{ left: `${marker.left}px`, top: `${marker.top + 26}px` }}
          >
            <strong>{marker.label}</strong>
            <span>{marker.contributors || "workspace activity"}</span>
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
