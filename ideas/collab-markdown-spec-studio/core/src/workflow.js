/**
 * Core document launch context / launch packet builder.
 */

export async function buildDocumentLaunchContext(documentId, opts = {}) {
  const {
    workspaceId,
    templateId,
    loadDocument,
    loadPatches,
    loadComments,
    loadClarifications,
    loadExportBundle,
    evaluateReadiness,
    buildStarterTemplate,
    buildExecutionBrief,
  } = opts;

  const document = await loadDocument(documentId, workspaceId);
  if (!document) return null;

  const [patches, comments, clarifications, exportBundle] = await Promise.all([
    loadPatches(documentId, workspaceId),
    loadComments(documentId, workspaceId),
    loadClarifications(documentId, workspaceId),
    loadExportBundle(documentId, workspaceId),
  ]);

  const readiness = evaluateReadiness({ document, patches, comments, clarifications });
  const starterBundle = buildStarterTemplate(document, exportBundle, readiness, patches, templateId);
  const executionBrief = buildExecutionBrief({
    document,
    exportBundle,
    starterBundle,
    readiness,
    patches,
    comments,
    clarifications,
  });

  return {
    document,
    patches,
    comments,
    clarifications,
    exportBundle,
    readiness,
    starterBundle,
    executionBrief,
  };
}

export function buildLaunchPacket(context) {
  const { document, exportBundle, starterBundle, executionBrief, readiness } = context;

  return {
    spec_version: "1.0",
    document_id: document.document_id,
    document_title: document.title,
    document_version: document.version,
    readiness: {
      status: readiness.status,
      score: readiness.score,
      recap: readiness.recap,
    },
    execution: {
      run_ready: executionBrief.run_ready,
      commands: executionBrief.commands,
      deliverables: executionBrief.deliverables,
      blockers: executionBrief.blockers,
    },
    starter_template_id: starterBundle.template_id,
    export_timestamp: exportBundle?.export_timestamp ?? new Date().toISOString(),
    context_summary: executionBrief.context_summary,
  };
}
