import { test, expect } from "@playwright/test";

test("homepage renders the tool", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByPlaceholder("e.g. organic skincare for busy moms")).toBeVisible();
});

test("generates hooks with the engine fallback", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("e.g. organic skincare for busy moms").fill("AI note-taking app for students");
  await page.getByRole("button", { name: "Generate hooks" }).click();
  await expect(page.getByText(/Best hook · predicted score/i)).toBeVisible({ timeout: 90_000 });
  await expect(page.getByRole("tablist")).toBeVisible();
});

test("campaign studio page loads", async ({ page }) => {
  await page.goto("/campaign");
  await expect(page.getByRole("heading", { name: /Campaign Studio/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Generate full campaign plan/i })).toBeVisible();
});