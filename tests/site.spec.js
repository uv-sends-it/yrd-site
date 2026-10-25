const { test, expect } = require("@playwright/test");

const routes = [
  ["/", "Home"],
  ["/about/", "About"],
  ["/join/", "Join Us"],
  ["/gallery/", "Gallery"],
];

for (const [route, title] of routes) {
  test(`${title} renders without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    await expect(page.locator("main h1").first()).toBeVisible();

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));

    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });
}

test("mobile menu supports Escape and returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const toggle = page.locator(".nav__toggle");
  const links = page.locator("#nav-links");

  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(links).toHaveClass(/is-open/);

  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(links).not.toHaveClass(/is-open/);
  await expect(toggle).toBeFocused();
});

test("join page explains the first session without exposing a private calendar URL", async ({ page }) => {
  await page.goto("/join/");

  await expect(page.locator(".first-session__step")).toHaveCount(4);
  await expect(page.getByRole("heading", { name: "Get your Dragon Pass" })).toBeVisible();

  const teamApp = page.getByRole("link", { name: /Open TeamApp/i }).first();
  await expect(teamApp).toHaveAttribute("href", /teamapp\.com/);
  const html = await page.content();
  expect(html).not.toContain("secret=");
});

test("primary Dragon Pass actions remain available", async ({ page }) => {
  await page.goto("/");

  const heroCta = page.locator(".hero__ctas .btn--primary").first();
  await expect(heroCta).toBeVisible();
  await expect(heroCta).toHaveAttribute("href", /revolutionise\.com\.au\/yarrariver\/registration/);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const sticky = page.locator("[data-mobile-join-cta]");
  await page.locator(".hero").evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().bottom + window.scrollY + 80));
  await expect(sticky).toBeVisible();
});

test("skip link reaches the main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to main content" });
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute("href", "#main-content");
});

test("join page includes confirmed arrival, facilities and cancellation guidance", async ({ page }) => {
  await page.goto("/join/");
  await expect(page.getByText("Arrive by 8:00 am", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Facilities" })).toBeVisible();
  await expect(page.getByText(/toilets, change rooms, showers/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Health & accessibility" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Weather & cancellations" })).toBeVisible();
});

test("newsletter and sponsors are not exposed in the public navigation/content", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Newsletter" })).toHaveCount(0);

  await page.goto("/about/");
  await expect(page.getByRole("heading", { name: "Our sponsors" })).toHaveCount(0);
});

test("home shows the Saturday schedule once", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Next Saturday · 8:15 am", { exact: true })).toHaveCount(1);
});

test("home can show a cancellation without exposing private event details", async ({ page }) => {
  await page.goto("/");
  const html = await page.content();
  expect(html).not.toContain("TEAMAPP_PRIVATE_ICS_URL");
  expect(html).not.toContain("secret=");
});

test("printed poster Come & Try URL redirects to Join", async ({ page }) => {
  await page.goto("/come-and-try/");
  await page.waitForURL("**/join/");
  await expect(page).toHaveURL(/\/join\/$/);
});
