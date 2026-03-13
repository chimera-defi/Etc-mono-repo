import { createDocumentAction, createPatchAction, decidePatchAction } from "./actions";
import { DocumentWorkspace } from "./document-workspace";
import styles from "./page.module.css";
import { exportDocument, listAuditEvents, listDocuments, listPatches } from "@/lib/specforge/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const documents = await listDocuments();
  const activeDocument = documents[0] ?? null;
  const patches = activeDocument
    ? await listPatches(activeDocument.document_id)
    : [];
  const auditEvents = activeDocument
    ? await listAuditEvents(activeDocument.document_id)
    : [];
  const exportBundle = activeDocument
    ? await exportDocument(activeDocument.document_id)
    : null;
  const activeBlock = activeDocument?.blocks[0] ?? null;

  return (
    <div className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>SpecForge MVP kickoff</p>
          <h1>Authoring, patches, and export in one local slice.</h1>
          <p className={styles.subhead}>
            This first implementation is intentionally narrow: seeded documents,
            governed patch proposals, and deterministic exports from the local
            store.
          </p>
        </div>
        <div className={styles.stats}>
          <div>
            <strong>{documents.length}</strong>
            <span>documents</span>
          </div>
          <div>
            <strong>{patches.length}</strong>
            <span>patches</span>
          </div>
        </div>
      </header>

      <main className={styles.grid}>
        <section className={`${styles.panel} ${styles.wide}`}>
          <div className={styles.panelHeader}>
            <h2>Document workspace</h2>
            <span>Tiptap-backed local editor</span>
          </div>
          {activeDocument ? (
            <DocumentWorkspace
              key={`${activeDocument.document_id}:${activeDocument.version}`}
              document={activeDocument}
            />
          ) : (
            <p className={styles.empty}>Create a document first.</p>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Create document</h2>
            <span>Server action</span>
          </div>
          <form action={createDocumentAction} className={styles.form}>
            <label>
              Title
              <input name="title" defaultValue="New SpecForge Draft" />
            </label>
            <label>
              Initial markdown
              <textarea
                name="initial_markdown"
                rows={8}
                defaultValue={"# PRD\n\n## Problem\nTBD\n\n## Goals\nTBD\n"}
              />
            </label>
            <button type="submit">Create document</button>
          </form>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Document list</h2>
            <span>Seeded from fixtures</span>
          </div>
          <ul className={styles.documentList}>
            {documents.map((document) => (
              <li key={document.document_id} className={styles.documentItem}>
                <strong>{document.title}</strong>
                <span>{document.document_id}</span>
                <span>v{document.version}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Patch proposal</h2>
            <span>Against first block</span>
          </div>
          {activeDocument && activeBlock ? (
            <form action={createPatchAction} className={styles.form}>
              <input type="hidden" name="document_id" value={activeDocument.document_id} />
              <input type="hidden" name="block_id" value={activeBlock.block_id} />
              <input type="hidden" name="section_id" value={activeBlock.section_id} />
              <input
                type="hidden"
                name="target_fingerprint"
                value={activeBlock.target_fingerprint}
              />
              <input type="hidden" name="base_version" value={activeDocument.version} />
              <p className={styles.context}>
                Target: <code>{activeBlock.block_id}</code> in{" "}
                <code>{activeDocument.title}</code>
              </p>
              <label>
                Replacement content
                <textarea
                  name="content"
                  rows={6}
                  defaultValue={`${activeBlock.content}\n\n- Added from the MVP dashboard.`}
                />
              </label>
              <button type="submit">Queue patch</button>
            </form>
          ) : (
            <p className={styles.empty}>Create a document first.</p>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Patch queue</h2>
            <span>Current document</span>
          </div>
          <ul className={styles.patchList}>
            {patches.map((patch) => (
              <li key={patch.patch_id} className={styles.patchItem}>
                <strong>{patch.patch_type}</strong>
                <span>{patch.patch_id}</span>
                <span className={styles.status}>{patch.status}</span>
                {["proposed", "stale"].includes(patch.status) ? (
                  <form action={decidePatchAction} className={styles.patchActionForm}>
                    <input type="hidden" name="document_id" value={patch.document_id} />
                    <input type="hidden" name="patch_id" value={patch.patch_id} />
                    <label>
                      Reviewed content
                      <textarea
                        name="resolved_content"
                        rows={5}
                        defaultValue={patch.content ?? ""}
                        className={styles.patchTextarea}
                      />
                    </label>
                    <div className={styles.patchActions}>
                      <button type="submit" name="decision" value="accept">
                        Accept
                      </button>
                      <button type="submit" name="decision" value="cherry_pick">
                        Cherry-pick
                      </button>
                      <button type="submit" name="decision" value="reject">
                        Reject
                      </button>
                    </div>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Audit trail</h2>
            <span>Recent actions</span>
          </div>
          <ul className={styles.patchList}>
            {auditEvents.map((event) => (
              <li key={event.event_id} className={styles.patchItem}>
                <strong>{event.event_type}</strong>
                <span>
                  {event.actor_type}:{event.actor_id}
                </span>
                <span>{event.created_at}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${styles.panel} ${styles.wide}`}>
          <div className={styles.panelHeader}>
            <h2>Export preview</h2>
            <span>Deterministic bundle</span>
          </div>
          {exportBundle ? (
            <div className={styles.exportGrid}>
              {Object.entries(exportBundle.files).map(([name, content]) => (
                <article key={name} className={styles.exportCard}>
                  <h3>{name}</h3>
                  <pre>{content}</pre>
                </article>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>No export available yet.</p>
          )}
        </section>
      </main>
    </div>
  );
}
