import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the main heading", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /carebase/i })).toBeVisible();
  });

  test("should display the sign in button", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("should display the documentation button", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /documentation/i })).toBeVisible();
  });

  test("should display feature badges", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Client Onboarding")).toBeVisible();
    await expect(page.getByText("Scheduling")).toBeVisible();
    await expect(page.getByText("Payroll")).toBeVisible();
    await expect(page.getByText("Incidents")).toBeVisible();
    await expect(page.getByText("Reports")).toBeVisible();
  });

  test("should navigate to login page when clicking sign in", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/.*login/);
  });
});
