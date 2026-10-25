const { test, expect } = require("@playwright/test");

const views = [
  { name: "home-desktop", route: "/", viewport: { width: 1280, height: 900 } },
  { name: "join-desktop", route: "/join/", viewport: { width: 1280, height: 900 } },
  { name: "home-mobile", route: "/", viewport: { width: 390, height: 844 } },
  { name: "join-mobile", route: "/join/", viewport: { width: 390, height: 844 } },
];

for (const view of views) {
  test(`${view.name} visual baseline`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize(view.viewport);
    await page.goto(view.route);
    await page.evaluate(() => document.fonts.ready.then(() => true));

    await expect(page).toHaveScreenshot(`${view.name}.png`, {
      fullPage: true,
      animations: "disabled",
      maxDiffPixelRatio: 0.015,
    });
  });
}
