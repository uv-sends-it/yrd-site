const { test, expect } = require("@playwright/test");

const routes = [
  ["/", "Home"],
  ["/about/", "About"],
  ["/join/", "Join Us"],
  ["/gallery/", "Gallery"],
  ["/come-and-try/", "Come and try"],
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

  const heroCta = page.locator(".ex-hero .ex-button--red").first();
  await expect(heroCta).toBeVisible();
  await expect(heroCta).toHaveAttribute("href", "/come-and-try/");
  await page.goto("/come-and-try/");
  await expect(page.getByRole("link", { name: /Register for your free month/i })).toHaveAttribute("href", /revolutionise\.com\.au\/yarrariver\/registration/);

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
  await expect(page.getByText(/Saturday mornings|Saturday.*8:15 am/).first()).toBeVisible();
});

test("home can show a cancellation without exposing private event details", async ({ page }) => {
  await page.goto("/");
  const html = await page.content();
  expect(html).not.toContain("TEAMAPP_PRIVATE_ICS_URL");
  expect(html).not.toContain("secret=");
});

test("printed poster Come & Try URL is its own conversion landing page", async ({ page }) => {
  await page.goto("/come-and-try/?utm_source=poster&utm_medium=qr&utm_campaign=gyms");
  await expect(page).toHaveURL(/\/come-and-try\/\?/);
  await expect(page.getByRole("heading", { name: /Your first paddle/i })).toBeVisible();
  await expect(page.locator("#register").getByRole("link", { name: /Register for your free month/i })).toHaveAttribute("href", /revolutionise\.com\.au/);
});

test("About separates committee and coaches with a single club contact", async ({ page }) => {
  await page.goto("/about/");
  const committee = page.locator("#committee");
  const groups = committee.locator(".people-group");
  const officers = groups.nth(0).locator(".person-card");
  const general = groups.nth(1).locator(".person-card");

  await expect(committee.getByRole("heading", { name: "Our committee" })).toBeVisible();
  await expect(officers).toHaveCount(4);
  await expect(general).toHaveCount(3);
  await expect(officers.nth(0)).toContainText("Andrew Gilovitch");
  await expect(officers.nth(0)).toContainText("President");
  await expect(officers.nth(1)).toContainText("Clement Lo");
  await expect(officers.nth(2)).toContainText("Christine Watson");
  await expect(officers.nth(2)).toContainText("Secretary");
  await expect(officers.nth(3)).toContainText("Derek Eer");
  await expect(general.nth(0)).toContainText("Damien Wadsworth");
  await expect(general.nth(1)).toContainText("Rosie Elle Brown");
  await expect(general.nth(2)).toContainText("Patrick Myer");
  await expect(committee.locator(".person-card a")).toHaveCount(0);
  await expect(committee.getByRole("link", { name: /Contact the club/i }))
    .toHaveAttribute("href", "mailto:admin@yarrariverdragons.com.au");

  const coaches = page.locator("#coaches");
  await expect(coaches.getByRole("heading", { name: "Our coaches" })).toBeVisible();
  await expect(coaches.locator(".person-card")).toHaveCount(3);
  await expect(coaches).toContainText("Thom Cullem");
  await expect(coaches).toContainText("John Cuzzupi");
  await expect(coaches).toContainText("Jess Sharpe");
  await expect(coaches.locator("a[href^='mailto:']")).toHaveCount(0);
});

test("Join Us links directly to the coaches on About", async ({ page }) => {
  await page.goto("/join/");
  const link = page.getByRole("link", { name: /Meet our coaches/i });
  await expect(link).toHaveAttribute("href", "/about/#coaches");
  await link.click();
  await expect(page).toHaveURL(/\/about\/#coaches$/);
  await expect(page.locator("#coaches")).toBeVisible();
});


test("home welcomes newcomers without fake live figures or placeholder metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".ex-welcome__notes article")).toHaveCount(3);
  await expect(page.getByRole("heading", { name: /Find your crew/i })).toBeVisible();
  await expect(page.locator("[data-stroke-rate]")).toHaveCount(0);
  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description).toContain("first month");
  expect(description).not.toContain("TODO");
});

test("about page has no public placeholder introduction", async ({ page }) => {
  await page.goto("/about/");
  await expect(page.locator(".hero__lead")).toContainText("Melbourne dragon boating club");
  expect(await page.locator(".hero__lead").innerText()).not.toContain("TODO");
});

test("small-screen chat choices are at least 44px tall", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /Ask YRD/i }).click();
  const box = await page.locator("[data-chat-quick] button").first().boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
});


test("homepage answers the first five newcomer questions", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Try dragon boating.*Find your crew/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /next chance to paddle/i })).toHaveCount(0);
  await expect(page.locator(".ex-session")).toContainText("Community Boating Hub");
  await expect(page.locator(".ex-story")).toContainText("One long boat");
  await expect(page.locator("#everyone-welcome")).toContainText("Never paddled?");
  await expect(page.locator(".ex-quote")).toContainText("Matt Dignan");
});

test("the first-paddle page explains the official external handoff", async ({ page }) => {
  await page.goto("/come-and-try/");
  await expect(page.locator("#register")).toContainText("Revolutionise");
  await expect(page.locator("#register")).toContainText("clicking here does not confirm a booking");
  await expect(page.locator(".ex-faq details")).toHaveCount(6);
  await page.locator(".ex-faq summary").first().click();
  await expect(page.locator(".ex-faq details").first()).toHaveAttribute("open", "");
});

test("campaign parameters do not leak into the registration link", async ({ page }) => {
  await page.goto("/come-and-try/?utm_source=gym-poster&utm_medium=qr");
  const href = await page.locator("#register a[href*='revolutionise.com.au']").getAttribute("href");
  expect(href).not.toContain("utm_");
});
