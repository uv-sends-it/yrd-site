const { test, expect } = require("@playwright/test");

test("Ask YRD answers the three core newcomer questions from reviewed facts", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Ask YRD/i }).click();

  await page.getByRole("button", { name: "How do I sign up?" }).click();
  await expect(page.locator(".chat-message--bot").last()).toContainText("Dragon Pass");

  await page.getByRole("button", { name: "Can I just rock up?" }).click();
  await expect(page.locator(".chat-message--bot").last()).toContainText(/register first/i);

  await page.getByRole("button", { name: "I can't swim" }).click();
  await expect(page.locator(".chat-message--bot").last()).toContainText("PFD");
  await expect(page.locator(".chat-message--bot").last()).toContainText(/tell the crew/i);
});

test("contact fallback stays minimal", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Ask YRD/i }).click();
  await page.getByRole("button", { name: "Contact the crew" }).click();

  const form = page.locator("[data-contact-form]");
  await expect(form).toBeVisible();
  await expect(form.getByLabel("Name")).toBeVisible();
  await expect(form.getByLabel("Email")).toBeVisible();
  await expect(form.getByLabel("Query or feedback")).toBeVisible();
});

test("configured Umami analytics loads", async ({ page }) => {
  const analyticsRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("umami")) analyticsRequests.push(request.url());
  });

  await page.goto("/");
  await page.waitForTimeout(250);
  expect(analyticsRequests.length).toBeGreaterThan(0);
});

test("chatbot starts closed and close button hides the panel", async ({ page }) => {
  await page.goto("/");

  const panel = page.locator("[data-chat-panel]");
  await expect(panel).toBeHidden();

  await page.getByRole("button", { name: /Ask YRD/i }).click();
  await expect(panel).toBeVisible();

  await page.getByRole("button", { name: "Close chat" }).click();
  await expect(panel).toBeHidden();
  await expect(page.getByRole("button", { name: /Ask YRD/i })).toBeVisible();
});

test("chatbot keeps small talk short and does not misclassify greetings", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Ask YRD/i }).click();

  const input = page.getByLabel("Ask YRD a question");
  await input.fill("hi");
  await input.press("Enter");
  await expect(page.locator(".chat-message--bot").last()).toHaveText("Hi! What can I help with?");

  await input.fill("how are you?");
  await input.press("Enter");
  await expect(page.locator(".chat-message--bot").last()).toHaveText("Good, thanks. What can I help with?");
});

test("common questions stay instant without loading the local model", async ({ page }) => {
  const modelRequests = [];
  page.on("request", (request) => {
    if (request.url().includes("huggingface") || request.url().includes("transformers") || request.url().includes("jsdelivr")) {
      modelRequests.push(request.url());
    }
  });

  await page.goto("/");
  await page.getByRole("button", { name: /Ask YRD/i }).click();

  const input = page.getByLabel("Ask YRD a question");
  await input.fill("What is dragon boating?");
  await input.press("Enter");

  await expect(page.locator(".chat-message--bot").last()).toContainText("team paddling sport");
  expect(modelRequests).toHaveLength(0);
});

test("common answers stay concise", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Ask YRD/i }).click();

  const input = page.getByLabel("Ask YRD a question");
  await input.fill("What should I bring?");
  await input.press("Enter");

  const text = await page.locator(".chat-message--bot").last().innerText();
  expect(text.split(/\s+/).length).toBeLessThanOrEqual(45);
});
