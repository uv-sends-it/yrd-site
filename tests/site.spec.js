const { test, expect } = require("@playwright/test");

const routes = [
  ["/", "Home"],
  ["/about/", "About"],
  ["/join/", "Join Us"],
  ["/newsletter/", "Newsletter"],
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

test("join page explains the first session and exposes a safe calendar subscription", async ({ page }) => {
  await page.goto("/join/");

  await expect(page.locator(".first-session__step")).toHaveCount(4);
  await expect(page.getByRole("heading", { name: "Get your Dragon Pass" })).toBeVisible();

  const calendar = page.getByRole("link", { name: /Subscribe to calendar/i });
  await expect(calendar).toHaveAttribute("href", /events_subscriptions\/help$/);
  const href = await calendar.getAttribute("href");
  expect(href).not.toContain("secret=");
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
