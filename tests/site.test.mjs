import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(resolve(root, "index.html"), "utf8");

for (const text of [
  "MoonInAI",
  "传统企业 AI 系统顾问 / AI 副业陪跑者",
  "传统企业 AI 系统",
  "企业 AI 培训",
  "AI 学习规划",
  "副业搞钱",
  "AI线下沙龙",
  "$ mooninai build --real-system",
  "JZX_AI1203",
  "@MoonInAI",
  "./assets/mmexport1779008582137..jpg",
  "neuro__canvas",
]) {
  assert.ok(html.includes(text), `Expected index.html to include: ${text}`);
}

const hero = html.slice(html.indexOf('<section class="hero'), html.indexOf('<section class="about'));
for (const removedHeroText of [
  "信号台 / SERVICE SIGNALS",
  "LIVE FEED",
  "企业 AI 系统</span><b>LIVE",
  "企业 AI 培训</span><b>LIVE",
  "AI 学习规划</span><b>LIVE",
  "副业搞钱</span><b>LIVE",
  "AI线下沙龙</span><b>LIVE",
]) {
  assert.ok(!hero.includes(removedHeroText), `Hero should not include: ${removedHeroText}`);
}

assert.ok(!html.includes("portrait__ring"), "Hero should not include the outer portrait ring");
assert.ok(!html.includes("portrait__particles"), "Hero should not include portrait particles");
assert.ok(!html.includes("./main.js"), "Hero should render the portrait image without particle JavaScript");
