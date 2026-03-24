"use client";

import hljs from "highlight.js/lib/core";
import hljsBash from "highlight.js/lib/languages/bash";
import hljsJson from "highlight.js/lib/languages/json";
import hljsMarkdown from "highlight.js/lib/languages/markdown";
import hljsTypescript from "highlight.js/lib/languages/typescript";
import hljsYaml from "highlight.js/lib/languages/yaml";
import { useState } from "react";

import { buildZip } from "@/lib/build-zip";

import styles from "./export-file-browser.module.css";

// Register only the languages used in export bundles
hljs.registerLanguage("json", hljsJson);
hljs.registerLanguage("markdown", hljsMarkdown);
hljs.registerLanguage("typescript", hljsTypescript);
hljs.registerLanguage("bash", hljsBash);
hljs.registerLanguage("yaml", hljsYaml);

function getLanguage(filename: string): string {
  if (filename.endsWith(".json")) return "json";
  if (filename.endsWith(".md")) return "markdown";
  if (filename.endsWith(".ts") || filename.endsWith(".tsx")) return "typescript";
  if (filename.endsWith(".sh")) return "bash";
  if (filename.endsWith(".yaml") || filename.endsWith(".yml")) return "yaml";
  return "plaintext";
}

function highlight(code: string, filename: string): string {
  const lang = getLanguage(filename);
  if (lang === "plaintext") return escapeHtml(code);
  try {
    return hljs.highlight(code, { language: lang }).value;
  } catch {
    return escapeHtml(code);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// -------------------------------------------------------

interface EditPaneProps {
  name: string;
  content: string;
  onSave: (name: string, content: string) => void;
  onCancel: () => void;
}

function EditPane({ name, content, onSave, onCancel }: EditPaneProps) {
  const [value, setValue] = useState(content);
  return (
    <div className={styles.editPane}>
      <textarea
        className={styles.editTextarea}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        spellCheck={false}
        aria-label={`Edit ${name}`}
      />
      <div className={styles.editActions}>
        <button className={styles.saveBtn} onClick={() => onSave(name, value)}>
          Save changes
        </button>
        <button className={styles.cancelBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------

interface ExportFileBrowserProps {
  /** Used to generate a sensible ZIP filename */
  documentId: string;
  initialFiles: Record<string, string>;
}

export function ExportFileBrowser({ documentId, initialFiles }: ExportFileBrowserProps) {
  const [files, setFiles] = useState<Record<string, string>>(initialFiles);
  const [selected, setSelected] = useState<string | null>(
    Object.keys(initialFiles)[0] ?? null,
  );
  const [editMode, setEditMode] = useState(false);

  const fileList = Object.keys(files);
  const selectedContent = selected != null ? (files[selected] ?? "") : "";

  function selectFile(name: string) {
    setSelected(name);
    setEditMode(false);
  }

  function removeFile(name: string) {
    setFiles((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (selected === name) {
      const remaining = Object.keys(files).filter((k) => k !== name);
      setSelected(remaining[0] ?? null);
    }
    setEditMode(false);
  }

  function saveEdit(name: string, content: string) {
    setFiles((prev) => ({ ...prev, [name]: content }));
    setEditMode(false);
  }

  function downloadZip() {
    const zipBytes = buildZip(files);
    const blob = new Blob([zipBytes.buffer as ArrayBuffer], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const slug = documentId
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);
    a.download = `${slug}-spec-bundle.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const highlighted =
    selected != null ? highlight(selectedContent, selected) : "";

  return (
    <div className={styles.browser}>
      {/* ---- file list ---- */}
      <aside className={styles.fileList} aria-label="Bundle files">
        <div className={styles.fileListHeader}>
          <span>{fileList.length} files</span>
          <button
            className={styles.downloadBtn}
            onClick={downloadZip}
            disabled={fileList.length === 0}
            title={
              fileList.length === 0
                ? "No files in bundle"
                : "Download modified ZIP"
            }
          >
            ↓ Download ZIP
          </button>
        </div>

        <ul className={styles.fileListScroll} role="listbox" aria-label="Files">
          {fileList.map((name) => (
            <li
              key={name}
              className={`${styles.fileItem} ${name === selected ? styles.fileItemActive : ""}`}
              role="option"
              aria-selected={name === selected}
            >
              <button
                className={styles.fileNameBtn}
                onClick={() => selectFile(name)}
                title={name}
              >
                {name}
              </button>
              <button
                className={styles.removeBtn}
                onClick={() => removeFile(name)}
                aria-label={`Remove ${name} from bundle`}
                title={`Remove ${name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* ---- viewer / editor ---- */}
      <main className={styles.viewer}>
        {selected != null ? (
          <>
            <div className={styles.viewerHeader}>
              <span className={styles.filename}>{selected}</span>
              <div className={styles.viewerActions}>
                <button
                  className={styles.editToggle}
                  onClick={() => setEditMode((e) => !e)}
                >
                  {editMode ? "View" : "Edit"}
                </button>
              </div>
            </div>

            {editMode ? (
              <EditPane
                name={selected}
                content={selectedContent}
                onSave={saveEdit}
                onCancel={() => setEditMode(false)}
              />
            ) : (
              <div className={styles.codeScroll}>
                <pre>
                  <code
                    // highlight.js generates safe escaped HTML
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                  />
                </pre>
              </div>
            )}
          </>
        ) : (
          <p className={styles.empty}>No files in bundle.</p>
        )}
      </main>
    </div>
  );
}
