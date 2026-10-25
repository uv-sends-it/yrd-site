import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const siteUrl = (process.env.SITE_URL || "https://yarrariverdragons.com.au").replace(/\/$/, "");
const after = process.env.AFTER_SHA || "HEAD";
const before = process.env.BEFORE_SHA && !/^0+$/.test(process.env.BEFORE_SHA)
  ? process.env.BEFORE_SHA
  : "HEAD^";

let changed = [];
try {
  changed = execFileSync("git", ["diff", "--name-only", before, after], { encoding: "utf8" })
    .split("\n").map((x) => x.trim()).filter(Boolean);
} catch {
  changed = [];
}

function absoluteUrl(value) {
  if (!value) return siteUrl;
  if (/^https?:\/\//.test(value)) return value;
  return siteUrl + (value.startsWith("/") ? value : "/" + value);
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function trackedLinks(url, campaign) {
  const base = absoluteUrl(url);
  return {
    instagram: `${base}${base.includes("?") ? "&" : "?"}utm_source=instagram&utm_medium=social&utm_campaign=${campaign}`,
    facebook: `${base}${base.includes("?") ? "&" : "?"}utm_source=facebook&utm_medium=social&utm_campaign=${campaign}`,
    linkedin: `${base}${base.includes("?") ? "&" : "?"}utm_source=linkedin&utm_medium=social&utm_campaign=${campaign}`
  };
}

const content = [];

for (const file of changed) {
  if (/^content\/newsletters\/\d{4}-\d{2}-newsletter\.(pdf|html)$/.test(file)) {
    const filename = path.basename(file);
    const match = filename.match(/^(\d{4})-(\d{2})/);
    const label = match ? `${match[1]}-${match[2]}` : "latest";
    const campaign = `newsletter-${label}`;
    const url = `/newsletters/${filename}`;
    content.push({
      kind: "newsletter",
      title: `New YRD newsletter — ${label}`,
      caption_hint: "Share one useful or exciting item from the latest YRD newsletter and invite people to read the full update.",
      url: absoluteUrl(url),
      campaign,
      tracked_links: trackedLinks(url, campaign)
    });
  }

  if (/^content\/social\/.*\.json$/.test(file) && existsSync(file)) {
    const item = JSON.parse(readFileSync(file, "utf8"));
    if (item.publish === false) continue;
    const campaign = item.campaign || slug(item.title || path.basename(file, ".json"));
    content.push({
      kind: item.kind || "website_update",
      title: item.title,
      caption: item.caption || "",
      caption_hint: item.caption_hint || "",
      url: absoluteUrl(item.url || "/"),
      media_url: item.media_url || null,
      campaign,
      tracked_links: trackedLinks(item.url || "/", campaign)
    });
  }
}

const payload = {
  event: "yrd_content_published",
  approval_required: true,
  repository: process.env.GITHUB_REPOSITORY || "uv-sends-it/yrd-site",
  commit: process.env.GITHUB_SHA || after,
  site_url: siteUrl,
  changed_files: changed,
  content
};

process.stdout.write(JSON.stringify(payload, null, 2));
