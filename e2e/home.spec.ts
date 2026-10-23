import { test, expect } from "@playwright/test";

test.describe("CareBase landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("explains the product and provides working conversion links", async ({
    page,
  }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Every visit.Everyone connected.",
    );
    await page
      .getByRole("link", { name: "Let’s talk about your agency" })
      .click();
    await expect(page).toHaveURL(/#demo$/);
    await expect(page.getByLabel("Work Email")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Create an account" }),
    ).toHaveAttribute("href", "/register");
  });

  test("explores all feature groups and supports keyboard tab navigation", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "Scheduling & visits" }).click();
    await expect(page.getByRole("tabpanel")).toContainText(
      "Electronic visit verification",
    );
    await expect(page.getByRole("tabpanel")).toContainText("Thursday’s visits");
    await page
      .getByRole("tab", { name: "Scheduling & visits" })
      .press("ArrowRight");
    await expect(
      page.getByRole("tab", { name: "Billing & oversight" }),
    ).toBeFocused();
    await expect(page.getByRole("tabpanel")).toContainText(
      "Service authorizations",
    );
    await page.getByRole("tab", { name: "Billing & oversight" }).press("End");
    await expect(page.getByRole("tabpanel")).toContainText(
      "Credentials & training",
    );
    await page
      .getByRole("tab", { name: "People & communication" })
      .press("Home");
    await expect(
      page.getByRole("tab", { name: "Client & clinical care" }),
    ).toHaveAttribute("aria-selected", "true");
  });

  test("opens FAQs and retains the login route", async ({ page }) => {
    const question = page.locator("summary", {
      hasText: "Can we use our own forms and care templates?",
    });
    await question.click();
    await expect(
      page.getByText("Yes. Template builders let your team"),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Footer navigation" })
      .getByRole("link", { name: "Sign in" })
      .click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("submits a demo request and announces success without sending email", async ({
    page,
  }) => {
    await page.route("**/api/demo-request", (route) =>
      route.fulfill({ json: { success: true } }),
    );
    await page.getByLabel("First Name").fill("Test");
    await page.getByLabel("Last Name").fill("Agency");
    await page.getByLabel("Work Email").fill("test@example.com");
    await page.getByLabel("Company Name").fill("Example Care");
    await page.getByLabel("Company Size").selectOption("11-50");
    const requestPromise = page.waitForRequest("**/api/demo-request");
    await page
      .getByRole("button", { name: "Request Demo", exact: true })
      .click();
    expect((await requestPromise).postDataJSON()).toMatchObject({
      companyName: "Example Care",
      companySize: "11-50",
      email: "test@example.com",
    });
    await expect(
      page
        .getByRole("status")
        .filter({ hasText: "received your demo request" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Submit another request" }).click();
    await expect(page.getByLabel("Work Email")).toHaveValue("");
  });

  test("retains form values and permits retry after a failed demo request", async ({
    page,
  }) => {
    await page.route("**/api/demo-request", (route) =>
      route.fulfill({
        status: 503,
        json: { error: "Unable to send. Please try again." },
      }),
    );
    await page.getByLabel("First Name").fill("Test");
    await page.getByLabel("Last Name").fill("Agency");
    await page.getByLabel("Work Email").fill("test@example.com");
    await page.getByLabel("Company Name").fill("Example Care");
    await page.getByLabel("Company Size").selectOption("11-50");
    await page
      .getByRole("button", { name: "Request Demo", exact: true })
      .click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Unable to send" }),
    ).toBeVisible();
    await expect(page.getByLabel("Work Email")).toHaveValue("test@example.com");
    await expect(
      page.getByRole("button", { name: "Request Demo", exact: true }),
    ).toBeEnabled();
  });

  test("fits a narrow screen and exposes the mobile navigation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByLabel("Open navigation").click();
    await expect(
      page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: "Sign in" }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
  });
});
