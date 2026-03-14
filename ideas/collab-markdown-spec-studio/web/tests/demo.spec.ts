import { expect, test } from "@playwright/test";

const heroVariants = [
  {
    id: "handoff",
    headline: "SpecForge turns multiplayer specs into one-shot build handoffs.",
    screenshot: "artifacts/screenshots/specforge-variant-handoff.png",
  },
  {
    id: "multiplayer",
    headline: "SpecForge is multiplayer spec writing that stays build-ready.",
    screenshot: "artifacts/screenshots/specforge-variant-multiplayer.png",
  },
  {
    id: "ship",
    headline: "SpecForge helps teams write specs that agents can ship from in one shot.",
    screenshot: "artifacts/screenshots/specforge-variant-ship.png",
  },
] as const;

test("renders the integrated SpecForge demo and captures a screenshot", async ({
  page,
}) => {
  await page.goto("/?stage=start");

  await expect(page.getByText("SpecForge", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "SpecForge turns multiplayer specs into one-shot build handoffs.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Workflow" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Delivery loop" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guided spec creation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Canonical showcase" })).toBeVisible();

  await page.screenshot({
    path: "artifacts/screenshots/specforge-demo-home.png",
    fullPage: true,
  });
});

test("captures north-star copy variants for review", async ({ page }) => {
  for (const variant of heroVariants) {
    await page.goto(`/?variant=${variant.id}`);
    await expect(page.getByText("SpecForge", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: variant.headline })).toBeVisible();

    await page.screenshot({
      path: variant.screenshot,
      fullPage: true,
    });
  }
});

test("creates a document, queues a patch, and exposes export JSON", async ({ page }) => {
  const title = `Demo Spec ${Date.now()}`;

  await page.goto("/?stage=start");
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

test("imports the canonical showcase idea and carries it into the draft workspace", async ({
  page,
}) => {
  await page.goto("/?stage=start");
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
  await page.goto(`/?document=${documentId}&stage=export`);
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

  await pageA.goto("/?stage=start");
  await pageA.getByTestId("create-document-title").fill(`Collab Spec ${Date.now()}`);
  await pageA.getByRole("button", { name: "Create guided draft" }).click();
  await expect(pageA.getByRole("heading", { name: "Document workspace" })).toBeVisible();

  const documentId = new URL(pageA.url()).searchParams.get("document");
  expect(documentId).toBeTruthy();

  await pageB.goto(`/?document=${documentId}&stage=draft`);
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

  await pageA.goto("/?stage=start");
  await pageA.getByTestId("create-document-title").fill(`Recovery Spec ${Date.now()}`);
  await pageA.getByRole("button", { name: "Create guided draft" }).click();
  await expect(pageA).toHaveURL(/document=/);

  const documentId = new URL(pageA.url()).searchParams.get("document");
  expect(documentId).toBeTruthy();

  await pageB.goto(`/?document=${documentId}&stage=draft`);
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
  await page.goto("/?stage=start");

  await expect(page.getByText("SpecForge", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Workflow" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guided spec creation" })).toBeVisible();

  await page.screenshot({
    path: "artifacts/screenshots/specforge-demo-mobile.png",
    fullPage: true,
  });
});
