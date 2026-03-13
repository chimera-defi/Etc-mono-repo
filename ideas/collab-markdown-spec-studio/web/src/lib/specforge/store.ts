import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import {
  documentCreateSchema,
  patchProposalSchema,
  storeSchema,
  type DocumentCreateInput,
  type DocumentRecord,
  type PatchProposalInput,
  type StoreData,
  type StoredPatch,
} from "./contracts";
import { exportDocumentBundle } from "./export";
import { deriveDocumentShape } from "./markdown";

type StoreOptions = {
  dataFile?: string;
  fixturesDir?: string;
};

function resolveOptions(options: StoreOptions = {}) {
  return {
    dataFile:
      options.dataFile ?? path.join(process.cwd(), ".data", "specforge-store.json"),
    fixturesDir:
      options.fixturesDir ?? path.resolve(process.cwd(), "..", "fixtures"),
  };
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function loadSeedStore(fixturesDir: string): Promise<StoreData> {
  const workspace = (await readJson<{
    workspace_id: string;
    document_id: string;
    title: string;
    version: number;
    markdown: string;
    sections: Array<{ section_id: string; heading: string }>;
    blocks?: Array<{ block_id: string; section_id: string; heading: string }>;
  }>(path.join(fixturesDir, "workspace.seed.json")));

  const derived = deriveDocumentShape(workspace.markdown);
  const now = new Date().toISOString();

  const document: DocumentRecord = {
    document_id: workspace.document_id,
    workspace_id: workspace.workspace_id,
    title: workspace.title,
    version: workspace.version,
    markdown: workspace.markdown,
    sections: derived.sections,
    blocks: derived.blocks,
    metadata: {},
    created_at: now,
    updated_at: now,
  };

  const patchesRaw = await readFile(path.join(fixturesDir, "patches.seed.jsonl"), "utf8");
  const patches: StoredPatch[] = patchesRaw
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Omit<StoredPatch, "document_id" | "proposed_by" | "base_version" | "created_at" | "status"> & Partial<StoredPatch>)
    .map((patch) => ({
      document_id: document.document_id,
      proposed_by: {
        actor_type: "agent",
        actor_id: "seed_agent",
      },
      base_version: document.version,
      created_at: now,
      status: "proposed",
      confidence: 0.75,
      rationale: "Seed patch for local demo.",
      ...patch,
    }));

  return {
    documents: [document],
    patches,
  };
}

async function ensureStore(options: StoreOptions = {}) {
  const { dataFile, fixturesDir } = resolveOptions(options);
  const dataDir = path.dirname(dataFile);
  await mkdir(dataDir, { recursive: true });

  try {
    const existing = await readJson<StoreData>(dataFile);
    return storeSchema.parse(existing);
  } catch {
    const seed = await loadSeedStore(fixturesDir);
    await writeFile(dataFile, JSON.stringify(seed, null, 2));
    return seed;
  }
}

async function saveStore(store: StoreData, options: StoreOptions = {}) {
  const { dataFile } = resolveOptions(options);
  await writeFile(dataFile, JSON.stringify(store, null, 2));
}

export async function listDocuments(options?: StoreOptions) {
  const store = await ensureStore(options);
  return store.documents;
}

export async function getDocument(documentId: string, options?: StoreOptions) {
  const store = await ensureStore(options);
  return (
    store.documents.find((document) => document.document_id === documentId) ?? null
  );
}

export async function listPatches(documentId: string, options?: StoreOptions) {
  const store = await ensureStore(options);
  return store.patches.filter((patch) => patch.document_id === documentId);
}

export async function createDocument(input: DocumentCreateInput, options?: StoreOptions) {
  const payload = documentCreateSchema.parse(input);
  const store = await ensureStore(options);
  const now = new Date().toISOString();
  const shape = deriveDocumentShape(payload.initial_markdown);

  const document: DocumentRecord = {
    document_id: `doc_${randomUUID()}`,
    workspace_id: payload.workspace_id,
    title: payload.title,
    version: 1,
    markdown: payload.initial_markdown,
    sections: shape.sections,
    blocks: shape.blocks,
    metadata: payload.metadata ?? {},
    created_at: now,
    updated_at: now,
  };

  store.documents.unshift(document);
  await saveStore(store, options);
  return document;
}

export async function createPatchProposal(
  input: PatchProposalInput,
  options?: StoreOptions,
) {
  const payload = patchProposalSchema.parse(input);
  const store = await ensureStore(options);
  const document = store.documents.find(
    (candidate) => candidate.document_id === payload.document_id,
  );

  if (!document) {
    throw new Error(`Document ${payload.document_id} not found`);
  }

  const block = document.blocks.find((candidate) => candidate.block_id === payload.block_id);

  if (!block) {
    throw new Error(`Block ${payload.block_id} not found`);
  }

  const status: StoredPatch["status"] =
    payload.base_version === document.version &&
    payload.target_fingerprint === block.target_fingerprint
      ? "proposed"
      : "stale";

  const patch: StoredPatch = {
    patch_id: `patch_${randomUUID()}`,
    created_at: new Date().toISOString(),
    status,
    ...payload,
  };

  store.patches.unshift(patch);
  await saveStore(store, options);
  return patch;
}

export async function exportDocument(documentId: string, options?: StoreOptions) {
  const store = await ensureStore(options);
  const document = store.documents.find((candidate) => candidate.document_id === documentId);

  if (!document) {
    throw new Error(`Document ${documentId} not found`);
  }

  const patches = store.patches.filter((patch) => patch.document_id === documentId);
  return exportDocumentBundle(document, patches);
}
