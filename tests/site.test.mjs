import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const css = readFileSync(resolve(root, "styles.css"), "utf8");
const script = readFileSync(resolve(root, "script.js"), "utf8");

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

for (const text of [
  'class="nav__menu-toggle"',
  'aria-controls="mobileMenu"',
  'id="mobileMenu"',
  'class="mobile-menu__link"',
]) {
  assert.ok(html.includes(text), `Expected mobile navigation markup: ${text}`);
}

assert.ok(script.includes("function initMobileMenu()"));
assert.ok(script.includes("initMobileMenu();"));

for (const text of [
  ".mobile-menu{",
  ".menu-is-open{overflow:hidden;}",
  "overflow-wrap:anywhere",
  "min-width:0",
]) {
  assert.ok(css.includes(text), `Expected responsive CSS rule: ${text}`);
}

const robots = readFileSync(resolve(root, "robots.txt"), "utf8");
const sitemap = readFileSync(resolve(root, "sitemap.xml"), "utf8");
const systemPage = readFileSync(resolve(root, "guangdong-ai-system.html"), "utf8");
const trainingPage = readFileSync(resolve(root, "guangdong-ai-training.html"), "utf8");

for (const text of [
  '<link rel="canonical" href="https://mooninai.top/"',
  'property="og:type" content="website"',
  '"@type":"WebSite"',
  '"@type":"Organization"',
  './guangdong-ai-system.html',
  './guangdong-ai-training.html',
]) {
  assert.ok(html.includes(text), `Expected homepage SEO content: ${text}`);
}

assert.equal(robots.trim(), "User-agent: *\nAllow: /\n\nSitemap: https://mooninai.top/sitemap.xml");
for (const url of [
  "https://mooninai.top/",
  "https://mooninai.top/guangdong-ai-system.html",
  "https://mooninai.top/guangdong-ai-training.html",
]) {
  assert.ok(sitemap.includes(`<loc>${url}</loc>`), `Expected sitemap URL: ${url}`);
}

for (const [page, h1, title] of [
  [systemPage, "广东传统企业 AI 系统", "广东传统企业 AI 系统｜MoonInAI"],
  [trainingPage, "广东企业 AI 培训", "广东企业 AI 培训｜MoonInAI"],
]) {
  assert.ok(page.includes(`<title>${title}</title>`));
  assert.ok(page.includes(`<h1>${h1}</h1>`));
  assert.ok(page.includes('<link rel="canonical"'));
  assert.ok(page.includes("扫码添加微信"));
}
