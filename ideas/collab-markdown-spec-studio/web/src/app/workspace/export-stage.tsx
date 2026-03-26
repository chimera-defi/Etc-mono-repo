import Link from "next/link";

import styles from "../page.module.css";
import { ExportFileBrowser } from "./export-file-browser";
import { DesignHandoffPanel } from "./design-handoff-panel";
import type { DocumentRecord, StoredPatch } from "@/lib/specforge/contracts";
import type { CommentThreadRecord } from "@/lib/specforge/store";
import type { ReadinessReport } from "@/lib/specforge/readiness";
import type { DesignHandoffData } from "@/lib/specforge/design-handoff";
import type { StarterTemplateId } from "@/lib/specforge/handoff";
import type { Stage } from "./stage-utils";

type ExportStageProps = {
  activeDocument: DocumentRecord | null;
  readinessReport: ReadinessReport | null;
  exportBundle: { files: Record<string, string> } | null;
  exportEndpoint: string;
  handoffBundle: {
    template_id: string;
    confidence: number;
    files: Record<string, string>;
    next_steps: string[];
  } | null;
  executionBrief: {
    primary_goal: string;
    run_ready: boolean;
    provenance: {
      version: number;
      approved_patch_count: number;
      pending_patch_count: number;
      open_comment_count: number;
    };
    agent_instructions: string[];
    commands: string[];
    blockers: string[];
    deliverables: unknown[];
  } | null;
  launchPacket: {
    packet_id: string;
    document: { title: string; version: number };
    starter_bundle: { files: Record<string, string> };
    execution_brief: { deliverables: unknown[]; commands: string[] };
  } | null;
  designHandoff: DesignHandoffData | null;
  showcaseSourceId: string;
  showcaseSourcePath: string;
  patches: StoredPatch[];
  commentThreads: CommentThreadRecord[];
  agentProposedPatches: StoredPatch[];
  approvedAgentPatches: StoredPatch[];
  humanComments: CommentThreadRecord[];
  selectedTemplateId: StarterTemplateId;
  availableTemplates: { id: StarterTemplateId; label: string; stack: string; description: string }[];
  buildStageHref: (documentId: string | null, stage: Stage) => string;
  buildTemplateHref: (documentId: string | null, stage: Stage, templateId: StarterTemplateId) => string;
};

export function ExportStage({
  activeDocument,
  readinessReport,
  exportBundle,
  exportEndpoint,
  handoffBundle,
  executionBrief,
  launchPacket,
  designHandoff,
  showcaseSourceId,
  showcaseSourcePath,
  patches,
  commentThreads,
  agentProposedPatches,
  approvedAgentPatches,
  humanComments,
  selectedTemplateId,
  availableTemplates,
  buildTemplateHref,
}: ExportStageProps) {
  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Run readiness</h2>
          <span>Pre-build check</span>
        </div>
        {readinessReport ? (
          <>
            <div className={styles.exportActions}>
              <Link
                href={`/api/documents/${activeDocument?.document_id}/launch-packet?template=${selectedTemplateId}`}
                className={styles.exportLink}
                target="_blank"
                rel="noreferrer"
                data-testid="open-launch-packet-json"
              >
                Open launch packet
              </Link>
              <span>One JSON payload for the build agent</span>
            </div>
            <div className={styles.readinessCard}>
              <strong>{readinessReport.score}/100</strong>
              <span className={styles.status}>{readinessReport.status}</span>
              <ul className={styles.readinessList}>
                {readinessReport.recap.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <p className={styles.empty}>Create a document first.</p>
        )}
      </section>

      {launchPacket && activeDocument ? (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Launch packet snapshot</h2>
            <span>{selectedTemplateId}</span>
          </div>
          <ul className={styles.readinessList}>
            <li>{launchPacket.packet_id}</li>
            <li>
              {launchPacket.document.title} · v{launchPacket.document.version}
            </li>
            <li>
              {launchPacket.execution_brief.deliverables.length} deliverables across export
              and starter output
            </li>
          </ul>
          <div className={styles.exportGrid}>
            <article className={styles.exportCard}>
              <h3>Starter output</h3>
              <pre>{Object.keys(launchPacket.starter_bundle.files).join("\n")}</pre>
            </article>
            <article className={styles.exportCard}>
              <h3>Agent commands</h3>
              <pre>{launchPacket.execution_brief.commands.join("\n")}</pre>
            </article>
          </div>
        </section>
      ) : null}

      {showcaseSourceId ? (
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Showcase walkthrough</h2>
            <span>Idea to launch packet</span>
          </div>
          <p className={styles.context}>
            This document started from the canonical <code>{showcaseSourceId}</code> idea
            pack and is now in the executable handoff stage.
          </p>
          <div className={styles.walkthroughGrid}>
            <article className={styles.walkthroughCard}>
              <strong>1. Import</strong>
              <span>Seeded from {showcaseSourcePath || "the ideas workspace"}.</span>
            </article>
            <article className={styles.walkthroughCard}>
              <strong>2. Review</strong>
              <span>
                {patches.length} patches and {commentThreads.length} comments shaped the
                final spec.
              </span>
            </article>
            <article className={styles.walkthroughCard}>
              <strong>3. Handoff</strong>
              <span>
                Export, starter bundle, and launch packet are aligned for one-shot build
                execution.
              </span>
            </article>
          </div>
        </section>
      ) : null}

      <details className={styles.panel} open={Boolean(designHandoff)} id="design-handoff">
        <summary className={styles.disclosureSummary}>
          <span>Design handoff</span>
          <span>{designHandoff?.designSystem ? "review-ready" : "ux-pack only"}</span>
        </summary>
        {designHandoff ? (
          <DesignHandoffPanel
            uxPack={designHandoff.uxPack}
            designSystem={designHandoff.designSystem}
            reviewChecklist={designHandoff.reviewChecklist}
            prompt={designHandoff.prompt}
            documentId={activeDocument?.document_id ?? null}
          />
        ) : (
          <div className={styles.disclosureBody}>
            <p className={styles.empty}>Create a document first.</p>
          </div>
        )}
      </details>

      <details className={styles.panel} id="export-preview">
        <summary className={styles.disclosureSummary}>
          <span>Export preview</span>
          <span>Deterministic bundle</span>
        </summary>
        <div className={styles.disclosureBody}>
          {exportBundle ? (
            <>
              <div className={styles.exportActions}>
                <Link
                  href={exportEndpoint}
                  className={styles.exportLink}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="open-export-json"
                >
                  Open export JSON
                </Link>
                <a
                  href={`/api/documents/${activeDocument?.document_id}/export-zip`}
                  className={styles.exportLinkPrimary}
                  download
                  data-testid="download-export-zip"
                >
                  \u2193 Download ZIP
                </a>
                <span>{Object.keys(exportBundle.files).length} files ready for handoff</span>
              </div>
              <ExportFileBrowser
                documentId={activeDocument?.document_id ?? "export"}
                initialFiles={exportBundle.files}
              />
            </>
          ) : (
            <p className={styles.empty}>No export available yet.</p>
          )}
        </div>
      </details>

      <details className={styles.panel} id="handoff-preview">
        <summary className={styles.disclosureSummary}>
          <span>Starter handoff</span>
          <span>{handoffBundle?.template_id ?? selectedTemplateId}</span>
        </summary>
        <div className={styles.disclosureBody}>
          {handoffBundle ? (
            <>
              <div className={styles.templateGrid} data-testid="template-grid">
                {availableTemplates.map((template) => {
                  const isActive = selectedTemplateId === template.id;
                  return (
                    <Link
                      key={template.id}
                      href={buildTemplateHref(
                        activeDocument?.document_id ?? null,
                        "export",
                        template.id,
                      )}
                      className={`${styles.templateCard} ${isActive ? styles.templateCardActive : ""}`}
                      data-testid={`template-option-${template.id}`}
                    >
                      <strong>{template.label}</strong>
                      <span className={styles.badge}>{template.stack}</span>
                      <p>{template.description}</p>
                    </Link>
                  );
                })}
              </div>
              <div className={styles.exportActions}>
                <Link
                  href={`/api/documents/${activeDocument?.document_id}/handoff?template=${selectedTemplateId}`}
                  className={styles.exportLink}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="open-handoff-json"
                >
                  Open starter JSON
                </Link>
                <span>
                  {handoffBundle.template_id} · {Math.round(handoffBundle.confidence * 100)}%
                  confidence
                </span>
              </div>
              <ul className={styles.readinessList}>
                {handoffBundle.next_steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
              <details className={styles.exportDisclosure}>
                <summary className={styles.disclosureSummary}>
                  <span>Starter files</span>
                  <span>{Object.keys(handoffBundle.files).length} files</span>
                </summary>
                <div className={styles.disclosureBody}>
                  <div className={styles.exportGrid}>
                    {Object.entries(handoffBundle.files).map(([name, content]) => (
                      <article key={name} className={styles.exportCard}>
                        <h3>{name}</h3>
                        <pre>{content}</pre>
                      </article>
                    ))}
                  </div>
                </div>
              </details>
            </>
          ) : (
            <p className={styles.empty}>No starter handoff available yet.</p>
          )}
        </div>
      </details>

      <details className={styles.panel} id="execution-brief">
        <summary className={styles.disclosureSummary}>
          <span>Execution brief</span>
          <span>One-shot build context</span>
        </summary>
        <div className={styles.disclosureBody}>
          {executionBrief ? (
            <>
              <div className={styles.exportActions}>
                <Link
                  href={`/api/documents/${activeDocument?.document_id}/execution?template=${selectedTemplateId}`}
                  className={styles.exportLink}
                  target="_blank"
                  rel="noreferrer"
                  data-testid="open-execution-json"
                >
                  Open execution JSON
                </Link>
                <span>{executionBrief.run_ready ? "Run ready" : "Needs review"}</span>
              </div>
              <ul className={styles.readinessList}>
                <li>Primary goal: {executionBrief.primary_goal}</li>
                <li>
                  Provenance: v{executionBrief.provenance.version} ·{" "}
                  {executionBrief.provenance.approved_patch_count} approved patches
                </li>
                <li>
                  Pending review: {executionBrief.provenance.pending_patch_count} patches ·{" "}
                  {executionBrief.provenance.open_comment_count} comments
                </li>
              </ul>
              <details className={styles.exportDisclosure}>
                <summary className={styles.disclosureSummary}>
                  <span>Agent run instructions</span>
                  <span>{executionBrief.agent_instructions.length} steps</span>
                </summary>
                <div className={styles.disclosureBody}>
                  <ul className={styles.readinessList}>
                    {executionBrief.agent_instructions.map((instruction) => (
                      <li key={instruction}>{instruction}</li>
                    ))}
                  </ul>
                  <div className={styles.exportGrid}>
                    <article className={styles.exportCard}>
                      <h3>Suggested commands</h3>
                      <pre>{executionBrief.commands.join("\n")}</pre>
                    </article>
                    <article className={styles.exportCard}>
                      <h3>Blockers</h3>
                      <pre>
                        {(executionBrief.blockers.length > 0
                          ? executionBrief.blockers
                          : ["No blockers"])
                          .join("\n")}
                      </pre>
                    </article>
                  </div>
                </div>
              </details>
              <details className={styles.exportDisclosure}>
                <summary className={styles.disclosureSummary}>
                  <span>Agent provenance</span>
                  <span>{approvedAgentPatches.length} approved agent changes</span>
                </summary>
                <div className={styles.disclosureBody}>
                  <div className={styles.exportGrid}>
                    <article className={styles.exportCard}>
                      <h3>Patch activity</h3>
                      <pre>
                        {[
                          `Agent proposals: ${agentProposedPatches.length}`,
                          `Approved agent patches: ${approvedAgentPatches.length}`,
                          `Human comments: ${humanComments.length}`,
                        ].join("\n")}
                      </pre>
                    </article>
                    <article className={styles.exportCard}>
                      <h3>Approved agent patches</h3>
                      <pre>
                        {(approvedAgentPatches.length > 0
                          ? approvedAgentPatches.map(
                              (patch) =>
                                `${patch.patch_id} · ${patch.patch_type} · ${patch.block_id}`,
                            )
                          : ["No approved agent patches yet"])
                          .join("\n")}
                      </pre>
                    </article>
                  </div>
                </div>
              </details>
            </>
          ) : (
            <p className={styles.empty}>No execution brief available yet.</p>
          )}
        </div>
      </details>
    </>
  );
}
