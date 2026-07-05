# Site review status — 2026-07-05

Full code and structure review completed for newgoldenoffice.com (52 static pages + Node/Express admin CMS). Three parallel audits run: link/consistency check across all pages, a customer-experience (UX) audit, and an admin-backend security/functionality audit.

## Closed — code-side, verified

- Contact page FAQ accordion was double-wired (inline `onclick` + `main.js` listener) and cancelled itself on every click. Fixed.
- Contact page Google Maps embed contained a fabricated placeholder parameter and would not render a real map. Replaced with a verified working embed.
- `layout.js` base-path fallback was mathematically wrong for every 2-level page (`/category/page.html`), breaking injected nav/footer/logo links on 21 pages. Fixed.
- Four category hub pages (`cameras`, `copiers`, `cash-machines`, `printing` index pages) each ran a duplicate inline script alongside `main.js` — every hamburger/dropdown/FAQ click fired twice and cancelled out, so **the mobile menu was completely non-functional** on 4 of 6 main category pages. Converted to the shared injected nav/footer used sitewide.
- Mobile nav dropdowns could never navigate to the category hub page itself (`preventDefault` fired unconditionally). Now a second tap on an already-open dropdown navigates through.
- Contact form had no "general inquiry" option, forcing every visitor into one of 6 fixed categories. Added, client + server side.
- Built a sitewide client-side search (43-page index, nav icon, Enter-to-navigate) — the site had no search or on-page way to find 1 of ~50 pages beyond the nav tree.
- All 27 primary WhatsApp CTA buttons sitewide previously opened a blank chat; each now pre-fills real, page-specific context text.
- Dead `href="#"` Facebook icon removed sitewide (was on ~47 pages via `layout.js` + `index.html`). Trivial one-line restore once a real URL is provided.
- Portfolio page was reachable only via the footer, never the main navbar, despite being the site's primary trust asset. Added to main nav on every page.
- Verified 3 specific claims from the UX audit against actual code and found them **factually false**: two "garbled Arabic" text quotes did not match the real file contents, and the "generic image shown before page title on mobile" claim is false — CSS already hides that image below 768px (`.page-hero-image{display:none}`), so the H1 is already first on phones.

## Closed — content decisions made by site owner

- **Pricing**: owner decided to remove all pricing signals sitewide and always route to WhatsApp/contact. The one page that had disclosed EGP figures (copiers FAQ) was rewritten to match. This is a deliberate, confirmed business policy, not an open gap.
- **Fabricated testimonials & case studies**: owner confirmed the 3 named testimonials on the homepage, the 3 named testimonials on the portfolio page, and the 9 numbered "مشروع #00X" project case studies (specific invented clients/numbers, e.g. "200 computers for a government ministry") were placeholder content, not real. All removed. Portfolio page's project grid replaced with an honest categories-of-work overview; homepage testimonials section removed outright.

## Open — requires the business owner, not more code

These cannot be closed by further code work without fabricating false business content, which this review will not do:

1. **Real photography.** Visual inspection (not just filename-checking) of every hero/hub image found the problem is worse than "generic stock":
   - `ac-hub.jpg` shows a Bluetooth speaker, not an air conditioner — a factual content error, live on the AC category page right now.
   - `og-image.jpg` is a tiny icon glyph, not a valid 1200×630 social-share preview.
   - `hero-office.jpg` (homepage) and `about-team.jpg` (About page) are Western co-working/stock photography unrelated to the business.
   - `cash-machines-hub.jpg` is US one-dollar bills, not Egyptian pounds or an actual counting machine.
   - `copiers-hub.jpg`, `cameras-hub.jpg`, `printing-hub.jpg` are topically correct stock photos — acceptable as a temporary placeholder, lowest priority to replace.
   - Full prioritized list with reasoning written to `images/IMAGES-NEEDED.txt`. The image-swap mechanism is already built: dropping a correctly-named real file into `images/` makes it live sitewide with no further code changes.
2. **Facebook URL.** Icon removed from the footer pending a real link; asked twice, not yet provided.

## Why this is the stopping point for code work

Every item in the "Open" section requires either a physical action (taking real photographs at the shop) or a piece of information only the business owner has (a real social media URL). Inventing placeholder numbers, fake photos, or a guessed URL to make these appear "resolved" would make the site actively dishonest to real customers — the opposite of the goal. The technical work to make either item trivial to close the moment the owner acts (auto-loading images by filename, a one-line footer edit for Facebook) is already done.
