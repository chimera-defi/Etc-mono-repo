/**
 * Core export bundle builder.
 */

/**
 * @param {import('../../web/src/lib/specforge/contracts').DocumentRecord} document
 * @param {import('../../web/src/lib/specforge/contracts').StoredPatch[]} patches
 * @param {{ validateAgentSpec: (value: unknown) => unknown }} opts
 */
export function buildExportBundle(document, patches, { validateAgentSpec }) {
  const proposedPatches = patches.filter(
    (p) => p.status === "proposed" || p.status === "stale"
  );

  const agentSpecRaw = {
    document_id: document.document_id,
    title: document.title,
    version: document.version,
    sections: document.sections,
    patch_queue: proposedPatches.map((p) => ({
      patch_id: p.patch_id,
      block_id: p.block_id,
      patch_type: p.patch_type,
      status: p.status,
    })),
  };

  const agentSpecExport = validateAgentSpec(agentSpecRaw);

  return {
    spec_version: "1.0",
    agent_spec: {
      document_id: document.document_id,
      document_version: document.version,
      document_title: document.title,
      created_at: document.created_at,
      last_modified: document.updated_at,
      total_patches_proposed: patches.length,
      total_patches_accepted: patches.filter((p) => p.status === "accepted")
        .length,
      total_patches_rejected: patches.filter((p) => p.status === "rejected")
        .length,
      authors: ["agent"],
      sections: document.blocks.map((b) => ({
        block_id: b.block_id,
        heading: b.heading,
        content_length: (b.content ?? "").length,
        modified_by: [],
        patch_count: patches.filter((p) => p.block_id === b.block_id).length,
      })),
    },
    agent_spec_export: agentSpecExport,
    document_markdown: document.markdown,
    patch_summary: patches.map((p) => ({
      patch_id: p.patch_id,
      operation: p.operation,
      block_id: p.block_id,
      status: p.status,
      accepted_at:
        p.status === "accepted" || p.status === "cherry_picked"
          ? p.created_at
          : undefined,
    })),
    export_timestamp: new Date().toISOString(),
  };
}
