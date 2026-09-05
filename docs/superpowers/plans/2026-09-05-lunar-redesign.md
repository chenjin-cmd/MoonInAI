# Lunar redesign implementation plan

**Goal:** Deliver the approved MoonInAI lunar studio design across the homepage and four service pages.
**Architecture:** Static HTML, shared CSS tokens, progressively enhanced JavaScript. Preserve metadata and public URLs.
**Tech Stack:** HTML, CSS, JavaScript, Node test runner.

- [x] Replace homepage composition with lunar hero, repository showcase, services, process, biography and contact. Preserve actual repository destinations and profile facts.
- [x] Replace styles.css with responsive dark visual system. Add optimized lunar image and CSS-only workflow illustrations.
- [x] Replace script.js with accessible mobile navigation, optional reveal and restrained desktop parallax. No continuous fake metrics.
- [x] Rebuild landing.css using shared tokens and update four service pages with actual QR contact and common navigation.
- [x] Update obsolete presentation assertions in tests/site.test.mjs; preserve SEO, content and destination checks.
- [x] Run npm test; inspect all five pages, desktop/mobile layouts, menu keyboard behavior, reduced motion and local resources in browser.

Work directly in the existing branch. Do not touch existing untracked mockups or previous plans.

Validation: npm test, node --check script.js and git diff --check pass. Browser checks: homepage at 390/768/1024/1440px; all service pages at 390/1440px; 1440×720 hero CTA bottom at 641px; mobile menu open/Escape/anchor navigation; clipboard success feedback; all three homepage images loaded. Reduced-motion handling reviewed in CSS/JS; OS preference was not changed.
