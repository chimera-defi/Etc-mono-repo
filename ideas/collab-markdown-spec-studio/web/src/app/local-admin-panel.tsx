import {
  resetWorkspaceDocumentsAction,
  seedReviewDemoAction,
} from "./actions";
import styles from "./page.module.css";

type Props = {
  authMode: "local" | "github" | "unauthenticated";
  activeDocumentId: string | null;
};

export function LocalAdminPanel({ authMode, activeDocumentId }: Props) {
  if (authMode !== "local") {
    return null;
  }

  return (
    <details className={styles.panel}>
      <summary className={styles.disclosureSummary}>
        <span>Local admin</span>
        <span>Mock + reset</span>
      </summary>
      <div className={styles.disclosureBody}>
        <p className={styles.stageDescription}>
          Use local-only controls to reset the demo workspace or seed review activity without
          editing the store by hand.
        </p>
        <div className={styles.inlineActions}>
          <form action={resetWorkspaceDocumentsAction}>
            <input type="hidden" name="return_to" value="/workspace?stage=start" />
            <button type="submit">Reset workspace data</button>
          </form>
          {activeDocumentId ? (
            <form action={seedReviewDemoAction}>
              <input type="hidden" name="document_id" value={activeDocumentId} />
              <button type="submit">Seed review activity</button>
            </form>
          ) : null}
        </div>
        <span className={styles.metaText}>Local demo only. Hidden once pilot auth is active.</span>
      </div>
    </details>
  );
}
