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
