import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(resolve(root, "index.html"), "utf8");
const css = readFileSync(resolve(root, "styles.css"), "utf8").replace(/\s+/g, "");
const script = readFileSync(resolve(root, "script.js"), "utf8");

for (const text of [
  "MoonInAI",
  "00后潮汕人｜泽行智远创始人｜千问办公大使",
  "六年自媒体实战经验，副业服务超1000人",
  "开源Skil全网转发量1.2万，累计Star破千",
  "正在用AI为一百个传统行业赋能(寻找共创伙伴中)",
  "提供AI新手入门/智能体工作流定制/企业AI赋能/大湾区AI 线下沙龙",
  "传统企业 AI 系统",
  "AI 工作流 / 智能体定制",
  "AI 新手入门课程",
  "副业搞钱",
  "AI线下沙龙",

  "JZX_AI1203",
  "@MoonInAI",
  "./assets/mmexport1779008582137..jpg",
  "./assets/lunar-full.webp",
]) {
  assert.ok(html.includes(text), `Expected index.html to include: ${text}`);
}

const hero = html.slice(html.indexOf('<section class="hero'), html.indexOf('<section class="proof'));
for (const removedHeroText of [
  "信号台 / SERVICE SIGNALS",
  "LIVE FEED",
  "企业 AI 系统</span><b>LIVE",
  "AI 工作流 / 智能体定制</span><b>LIVE",
  "AI 新手入门课程</span><b>LIVE",
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

for (const text of [
  './assets/favicon-32.png',
  './assets/favicon-180.png',
  './assets/favicon.ico',
]) {
  assert.ok(html.includes(text), `Expected favicon reference: ${text}`);
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
const salonPage = readFileSync(resolve(root, "guangdong-ai-salon.html"), "utf8");
const beginnerPage = readFileSync(resolve(root, "guangdong-ai-beginner-course.html"), "utf8");

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
  [trainingPage, "广东 AI 工作流 / 智能体定制", "广东 AI 工作流 / 智能体定制｜MoonInAI"],
]) {
  assert.ok(page.includes(`<title>${title}</title>`));
  assert.ok(page.includes(`<h1>${h1}</h1>`));
  assert.ok(page.includes('<link rel="canonical"'));
  assert.ok(page.includes("扫码添加微信"));
}

assert.ok(!html.includes("企业 AI 培训"));
assert.ok(trainingPage.includes("业务诊断"));
assert.ok(trainingPage.includes("智能体配置"));

assert.ok(!html.includes("AI 学习规划"));
assert.ok(html.includes("AI 新手入门课程"));
for (const text of ["./guangdong-ai-salon.html", "./guangdong-ai-beginner-course.html"]) {
  assert.ok(html.includes(text), `Expected homepage service link: ${text}`);
}

for (const [page, h1, title] of [
  [salonPage, "广东 AI 线下沙龙", "广东 AI 线下沙龙｜MoonInAI"],
  [beginnerPage, "广东 AI 新手入门课程", "广东 AI 新手入门课程｜MoonInAI"],
]) {
  assert.ok(page.includes(`<title>${title}</title>`));
  assert.ok(page.includes(`<h1>${h1}</h1>`));
  assert.ok(page.includes('<link rel="canonical"'));
  assert.ok(page.includes("扫码添加微信"));
}

for (const url of [
  "https://mooninai.top/guangdong-ai-salon.html",
  "https://mooninai.top/guangdong-ai-beginner-course.html",
]) {
  assert.ok(sitemap.includes(`<loc>${url}</loc>`), `Expected sitemap URL: ${url}`);
}
assert.equal((sitemap.match(/<loc>/g) || []).length, 5);

for (const [repo] of [
  ["xhs-virtual-product", "648", "73"],
  ["agent-skills-launch-pack_", "551", "79"],
  ["wechat-miniprogram-builder", "312", "38"],
]) {
  assert.ok(html.includes(repo), `Expected GitHub showcase repository: ${repo}`);
  assert.ok(html.includes(`https://github.com/chenjin-cmd/${repo}`), `Expected repository link for ${repo}`);
}

assert.ok(html.includes('class="proof section-shell"'), "Expected Proof of Work section");


// Every internal anchor resolves and every local page/asset reference exists.
import { existsSync } from "node:fs";
for (const [name, page] of [["index.html", html], ["guangdong-ai-system.html", systemPage], ["guangdong-ai-training.html", trainingPage], ["guangdong-ai-salon.html", salonPage], ["guangdong-ai-beginner-course.html", beginnerPage]]) {
  const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${name}: duplicate IDs`);
  for (const [, target] of page.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (target.startsWith("#")) assert.ok(ids.includes(target.slice(1)), `${name}: missing anchor ${target}`);
    if (target.startsWith("./")) assert.ok(existsSync(resolve(root, target.split(/[?#]/)[0])), `${name}: missing resource ${target}`);
  }
  assert.equal((page.match(/<h1[ >]/g) || []).length, 1, `${name}: one main heading`);
  assert.ok(page.includes("./assets/mooninai-wechat-qr.jpg"), `${name}: working QR contact`);
  assert.ok(!page.includes('href="weixin://"'), `${name}: avoid empty WeChat deep link`);
}
console.log("Passed: five pages, navigation targets, local assets, profile, repositories and SEO.");
