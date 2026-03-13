import { expect, test } from "@playwright/test";

test("renders the integrated SpecForge demo and captures a screenshot", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Authoring, patches, and export in one local slice.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Document workspace" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Patch queue" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Export preview" })).toBeVisible();
  await expect(page.getByText("Live collaborators")).toBeVisible();

  await page.screenshot({
    path: "artifacts/screenshots/specforge-demo-home.png",
    fullPage: true,
  });
});

test("creates a document, queues a patch, and exposes export JSON", async ({ page }) => {
  const title = `Demo Spec ${Date.now()}`;

  await page.goto("/");
  await page.getByTestId("create-document-title").fill(title);
  await page.getByRole("button", { name: "Create document" }).click();

  await expect(page.getByRole("heading", { name: "Document workspace" })).toBeVisible();
  await expect(page.locator(".editorToolbar strong")).toContainText(title);

  await page.getByTestId("patch-type-select").selectOption("task_export_change");
  await page
    .getByTestId("patch-content-input")
    .fill("## Goals\n\n- Export this draft as a clean handoff bundle.");
  await page.getByRole("button", { name: "Queue patch" }).click();

  await expect(page.getByTestId("patch-queue")).toContainText("task_export_change");

  const exportHref = await page.getByTestId("open-export-json").getAttribute("href");
  expect(exportHref).toBeTruthy();
  const exportResponse = await page.request.get(`http://127.0.0.1:3000${exportHref}`);

  expect(exportResponse.ok()).toBeTruthy();
  expect(await exportResponse.json()).toMatchObject({
    files: expect.objectContaining({
      "agent_spec.json": expect.any(String),
    }),
  });
});

test("shows two live collaborators on the same document", async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  await pageA.goto("/");
  await pageB.goto("/");

  await expect(pageA.getByRole("heading", { name: "Document workspace" })).toBeVisible();
  await expect(pageB.getByRole("heading", { name: "Document workspace" })).toBeVisible();

  await expect
    .poll(async () => await pageA.locator(".presenceChip").count(), {
      timeout: 10_000,
    })
    .toBeGreaterThanOrEqual(2);

  await pageA.screenshot({
    path: "artifacts/screenshots/specforge-demo-collaboration.png",
    fullPage: true,
  });

  await contextA.close();
  await contextB.close();
});
