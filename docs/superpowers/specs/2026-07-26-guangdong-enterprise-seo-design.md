# 广东企业 AI 服务 SEO 设计

## 目标

让 `mooninai.top` 对 Google 具备明确、可抓取且可验证的索引信号，并覆盖两类高意图查询：广东传统企业 AI 系统与广东企业 AI 培训。

收录与排名由 Google 自主决定；本设计的目标是消除可避免的技术障碍、提供真实且区分明确的页面内容，并建立可持续的 Search Console 监测流程。

## 信息架构

保留现有首页作为品牌与总览页面，新增两个独立静态 HTML 落地页：

- `/guangdong-ai-system.html`：广东传统企业 AI 系统。
- `/guangdong-ai-training.html`：广东企业 AI 培训。

三个页面均可从站内导航与正文链接到达；每页只对应一个主要服务意图，不创建近似内容的地区页或关键词堆砌页。

## 页面内容

### 首页

- 保留 MoonInAI 品牌、服务总览与联系入口。
- 在服务区域增加指向两页的清晰文本链接。
- 标题与描述同时说明广东、传统企业 AI 系统、企业 AI 培训和实际业务落地，但不替代落地页的详细内容。

### 广东传统企业 AI 系统页

- 单一 H1：广东传统企业 AI 系统。
- 面向企业负责人、销售、运营与内容团队。
- 具体说明知识库、SOP、销售与内容流程、资料整理等业务场景；列出诊断、搭建、培训/陪跑的交付路径。
- 以微信联系为主要 CTA，并链接回首页和企业 AI 培训页。

### 广东企业 AI 培训页

- 单一 H1：广东企业 AI 培训。
- 面向管理层与业务团队。
- 说明培训前诊断、岗位案例、提示词与工作流、课后任务包、复盘与陪跑等内容。
- 以微信联系为主要 CTA，并链接回首页和企业 AI 系统页。

## 技术 SEO

- 三页分别使用唯一的 `<title>`、`meta description`、canonical URL 与 Open Graph 基础元数据。
- 在首页添加与可见内容一致的 JSON-LD：`WebSite`（站点名 MoonInAI）和 `Organization`（名称、URL、广东服务区域、GitHub/X 资料链接）。不杜撰地址、评分、客户数量或未验证资质。
- 新建根目录 `robots.txt`，允许抓取并声明 `https://mooninai.top/sitemap.xml`。
- 新建根目录 `sitemap.xml`，以 UTF-8 和绝对规范 URL 列出首页及两个服务页。
- 图片使用实际替代文本；现有 CSS、JS、图片均可被匿名访问，不使用 `noindex` 或阻断 Googlebot 的 robots 规则。

## 部署后的人工步骤

1. 在 Google Search Console 添加并验证 `mooninai.top` 域名资产；DNS 验证优先，或使用 Google 生成的 HTML meta 标签。
2. 在 Search Console 的 Sitemap 报告提交 `https://mooninai.top/sitemap.xml`。
3. 对首页和两条服务页使用 URL 检查，确认可抓取、已选择规范 URL，并在首次发布后请求编入索引。
4. 每月检查索引报告、搜索字词、展示量、点击率与任何抓取错误；基于真实搜索词补充案例或 FAQ，而不是批量生成近似页面。

## 验收

- `robots.txt` 和 `sitemap.xml` 在根路径返回 200，且 sitemap 只列 3 个绝对 HTTPS URL。
- 三个页面分别有唯一 title、description、canonical、H1 和可访问的内部链接。
- JSON-LD 可被 Google Rich Results Test / Schema Markup Validator 解析，且字段与可见页面内容一致。
- 静态测试检查 SEO 文件、页面元数据和互链；本地服务返回 HTTP 200。
- 部署后由站点所有者在 Search Console 验证并提交 sitemap。
