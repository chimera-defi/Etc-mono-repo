import { expect, test } from "@playwright/test";
import { heroVariantOrder, heroVariants } from "../src/lib/specforge/marketing";

test("renders the integrated SpecForge demo and captures a screenshot", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByText("SpecForge", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Write the spec once. Let humans and agents build from the same canvas.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Launch workspace" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How agent configuration works" })).toBeVisible();

  await page.screenshot({
    path: "artifacts/screenshots/specforge-demo-home.png",
    fullPage: true,
  });
});

test("captures north-star copy variants for review", async ({ page }) => {
  for (const variantId of heroVariantOrder) {
    const variant = heroVariants[variantId];
    await page.goto(`/?variant=${variantId}`);
    await expect(page.getByText("SpecForge", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: variant.headline })).toBeVisible();

    await page.screenshot({
      path: `artifacts/screenshots/specforge-variant-${variantId}.png`,
      fullPage: true,
    });
  }
});

test("creates a document, queues a patch, and exposes export JSON", async ({ page }) => {
  const title = `Demo Spec ${Date.now()}`;

  await page.goto("/workspace?stage=start");
  await page.getByTestId("create-document-title").fill(title);
  await page.getByRole("button", { name: "Create guided draft" }).click();

  await expect(page.getByRole("heading", { name: "Document workspace" })).toBeVisible();
  await expect(page.locator(".editorToolbar strong")).toContainText(title);

  await page.goto(`${page.url().split("?")[0]}?document=${new URL(page.url()).searchParams.get("document")}&stage=review`);
  await page.getByTestId("patch-type-select").selectOption("task_export_change");
  await page
    .getByTestId("patch-content-input")
    .fill("## Goals\n\n- Export this draft as a clean handoff bundle.");
  await page.getByRole("button", { name: "Queue patch" }).click();

  await page.goto(`${page.url().split("?")[0]}?document=${new URL(page.url()).searchParams.get("document")}&stage=draft`);
  await expect
    .poll(async () => await page.locator(".blockMarker").count(), {
      timeout: 10_000,
    })
    .toBeGreaterThanOrEqual(1);
  await expect
    .poll(async () => await page.locator(".inlineProvenance").count(), {
      timeout: 10_000,
    })
    .toBeGreaterThanOrEqual(1);

  await page.goto(`${page.url().split("?")[0]}?document=${new URL(page.url()).searchParams.get("document")}&stage=decide`);
  await expect(page.getByTestId("patch-queue")).toContainText("task_export_change");

  await page.goto(`${page.url().split("?")[0]}?document=${new URL(page.url()).searchParams.get("document")}&stage=export`);
  const exportHref = await page.getByTestId("open-export-json").getAttribute("href");
  const handoffHref = await page.getByTestId("open-handoff-json").getAttribute("href");
  const executionHref = await page.getByTestId("open-execution-json").getAttribute("href");
  const launchPacketHref = await page.getByTestId("open-launch-packet-json").getAttribute("href");
  expect(exportHref).toBeTruthy();
  expect(handoffHref).toBeTruthy();
  expect(executionHref).toBeTruthy();
  expect(launchPacketHref).toBeTruthy();
  const exportResponse = await page.request.get(exportHref!);
  const handoffResponse = await page.request.get(handoffHref!);
  const executionResponse = await page.request.get(executionHref!);
  const launchPacketResponse = await page.request.get(launchPacketHref!);

  expect(exportResponse.ok()).toBeTruthy();
  expect(handoffResponse.ok()).toBeTruthy();
  expect(executionResponse.ok()).toBeTruthy();
  expect(launchPacketResponse.ok()).toBeTruthy();
  expect(await exportResponse.json()).toMatchObject({
    files: expect.objectContaining({
      "agent_spec.json": expect.any(String),
    }),
  });
  expect(await handoffResponse.json()).toMatchObject({
    template_id: "ts_cli_starter_v1",
    files: expect.objectContaining({
      "package.json": expect.any(String),
      "src/main.ts": expect.any(String),
    }),
  });
  expect(await executionResponse.json()).toMatchObject({
    run_ready: expect.any(Boolean),
    commands: expect.arrayContaining(["npm install", "npm run dev", "npm run build"]),
  });
  expect(await launchPacketResponse.json()).toMatchObject({
    packet_id: expect.stringContaining("launch_doc_"),
    export_bundle: expect.any(Object),
    starter_bundle: expect.any(Object),
    execution_brief: expect.any(Object),
  });
});

test("agent assist can populate the guided draft form before creation", async ({ page }) => {
  await page.goto("/workspace?stage=start");
  await page.getByTestId("agent-assist-brief").fill(
    "A SaaS workspace where founders and engineers coauthor specs with reviewable AI patches and export a launch packet for implementation.",
  );
  await page.getByLabel("Assist runtime").selectOption("heuristic");
  await page.getByRole("button", { name: "Populate fields with assist" }).click();

  await expect(page.getByTestId("create-document-title")).toHaveValue(
    /SaaS Workspace Where Founders And Engineers/i,
  );
  await expect(page.getByText("Built-in fallback populated the fields.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create guided draft" })).toBeVisible();

  await page.screenshot({
    path: "artifacts/screenshots/specforge-workspace-start.png",
    fullPage: true,
  });
});

test("imports the canonical showcase idea and carries it into the draft workspace", async ({
  page,
}) => {
  await page.goto("/workspace?stage=start");
  await page.getByRole("button", { name: "Import showcase draft" }).first().click();

  await expect(page.getByRole("heading", { name: "Document workspace" })).toBeVisible();
  await expect(page.locator(".editorToolbar strong")).toContainText("Server Management Agent");
  await expect
    .poll(async () => await page.locator(".specforgeEditor").innerText(), {
      timeout: 15_000,
    })
    .toContain("Source Idea");

  const documentId = new URL(page.url()).searchParams.get("document");
  expect(documentId).toBeTruthy();
  await page.goto(`/workspace?document=${documentId}&stage=export`);
  await expect(page.getByRole("heading", { name: "Showcase walkthrough" })).toBeVisible();
  await expect(page.locator("section").filter({ hasText: "Showcase walkthrough" }).getByText(
    "server-management-agent",
    { exact: true },
  )).toBeVisible();
});

test("shows two live collaborators on the same document", async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  await pageA.goto("/workspace?stage=start");
  await pageA.getByTestId("create-document-title").fill(`Collab Spec ${Date.now()}`);
  await pageA.getByRole("button", { name: "Create guided draft" }).click();
  await expect(pageA.getByRole("heading", { name: "Document workspace" })).toBeVisible();

  const documentId = new URL(pageA.url()).searchParams.get("document");
  expect(documentId).toBeTruthy();

  await pageB.goto(`/workspace?document=${documentId}&stage=draft`);
  await expect(pageB.getByRole("heading", { name: "Document workspace" })).toBeVisible();

  await expect
    .poll(async () => await pageA.locator(".presenceChip").count(), {
      timeout: 10_000,
    })
    .toBeGreaterThanOrEqual(2);
  await expect
    .poll(async () => await pageA.locator(".remoteCursor").count(), {
      timeout: 10_000,
    })
    .toBeGreaterThanOrEqual(1);

  await pageA.screenshot({
    path: "artifacts/screenshots/specforge-demo-collaboration.png",
    fullPage: true,
  });

  await contextA.close();
  await contextB.close();
});

test("detects a stale room and reloads the latest snapshot", async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  await pageA.goto("/workspace?stage=start");
  await pageA.getByTestId("create-document-title").fill(`Recovery Spec ${Date.now()}`);
  await pageA.getByRole("button", { name: "Create guided draft" }).click();
  await expect(pageA).toHaveURL(/document=/);

  const documentId = new URL(pageA.url()).searchParams.get("document");
  expect(documentId).toBeTruthy();

  await pageB.goto(`/workspace?document=${documentId}&stage=draft`);
  await expect(pageB.getByRole("heading", { name: "Document workspace" })).toBeVisible();

  await pageA.getByRole("button", { name: "Save document" }).click();
  await expect(pageA.locator(".editorToolbar")).toContainText(":v2", {
    timeout: 10_000,
  });

  await pageB.getByRole("button", { name: "Check latest snapshot" }).click();
  await expect(pageB.getByText("Recovery needed")).toBeVisible();
  await pageB.getByRole("button", { name: "Reload latest snapshot" }).click();
  await expect(pageB.locator(".editorToolbar")).toContainText(":v2", {
    timeout: 10_000,
  });

  await contextA.close();
  await contextB.close();
});

test("renders the guided flow on a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByText("SpecForge", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Launch workspace" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "How agent configuration works" })).toBeVisible();

  await page.screenshot({
    path: "artifacts/screenshots/specforge-demo-mobile.png",
    fullPage: true,
  });
});

test("local admin controls can seed review activity for a draft", async ({ page }) => {
  await page.goto("/workspace?stage=start");
  await expect(page.getByText("Local admin", { exact: true })).toBeVisible();

  await page.getByTestId("create-document-title").fill(`Admin Seed ${Date.now()}`);
  await page.getByRole("button", { name: "Create guided draft" }).click();
  await expect(page).toHaveURL(/document=/);

  await page.getByText("Local admin", { exact: true }).click();
  await page.getByRole("button", { name: "Seed review activity" }).click();
  await expect(page).toHaveURL(/stage=review/);

  const documentId = new URL(page.url()).searchParams.get("document");
  expect(documentId).toBeTruthy();
  await page.goto(`/workspace?document=${documentId}&stage=decide`);
  await expect(page.getByTestId("patch-queue")).toContainText("structural_edit");
});

test("renders the pricing page", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByRole("heading", { name: /Start with the spec/i })).toBeVisible();
  await expect(page.getByText("Team SaaS")).toBeVisible();

  await page.screenshot({
    path: "artifacts/screenshots/specforge-pricing.png",
    fullPage: true,
  });
});
