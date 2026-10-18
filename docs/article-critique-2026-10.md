# Blog Article Critique — 2026-10

Scope: all 66 published posts in `astro/src/content/blog/*.json` (live source of truth).
Scores are /10 for a B2B buyer in Egypt (procurement / office manager / owner).

## Site-wide findings (automated pass, all 66)

> **Fixed in 647bd7d (2026-10-05):** the 15 posts with no in-body image, the 12 posts with no FAQ (14 flagged; printing-terms and reception-area-setup already had one under a different heading), and the office-setup-cairo-tagamoa geo tone.

- **Zero inline images in 15 posts.** That's the whole Aug-Sep geo batch (ac-*, cash-counter-*, cctv-*-alexandria/cairo, copier-*-alexandria/cairo, office-setup-*, remote-cctv, buy-vs-rent-copier, office-ac-electricity-saving, cash-counter-before-holidays) plus paper-shredder-buying-guide. They have a cover and nothing else across about 1,500 words.
- **14 posts have no FAQ section.** These are mostly the July launch batch: best-*-guide, copier-maintenance-common-faults, digital-vs-offset, do-companies-still-need-paper-printing, how-to-choose-office-supplies-vendor, new-office-setup-checklist, office-supplies-checklist, paper-shredder, printing-terms, reception-area-setup, reduce-printing-costs.
- **SEO titles over about 65 chars get truncated in the SERP:** copier-import-export-alexandria (105), cash-counter-banks-retail-cairo (98), office-setup-cairo-tagamoa (96), cctv-factories-warehouses-alexandria (89), hikvision-…-buying-guide (88), cctv-shops-alexandria-corniche (86), remote-cctv-multi-branch-cairo (80), cash-counter-shops-alexandria (79), ac-maintenance-…-alexandria (78), copier-fleet-…-cairo (75), smart-office-solutions (74), best-security-cameras (71).
- **Meta descriptions under about 115 chars (unused SERP space):** best-office-printer (98), best-money-counting (101), copier-maintenance-common-faults (101), new-office-setup-checklist (101), how-to-choose-vendor (105), best-security-cameras (109), do-companies-still-need-paper (109), office-supplies-checklist (110), reduce-printing-costs (111), digital-vs-offset (113), paper-shredder (114). Over 160 (truncated): buying-a4-paper (174), office-organization-tools-archiving (172), ptz-camera (168), office-organization-tools-guide (165), office-supplies-for-companies (163).
- **Weak internal linking:** egypt-photocopier-prices has **0** internal links, even though it's a money page. Only 1 internal link each in office-pens, office-tools-battery-usb, thermal-receipt-paper and whiteboard-corkboard.
- `.html` links: the only two are external ISO links (accounting, law). OK.
- No duplicate cover or inline images across posts. OK.
- Every post has the أهم النقاط block. OK.
- **Geo tone:** office-setup-cairo-tagamoa says "رغم أن الفرع الفعلي في الإسكندرية" and talks about "جدولة توصيل". That breaks the Cairo service-presence tone rule.

## Recurring patterns and priority fix list

**Scores:** 66 posts, average **6.0/10**. 17 below 5.5, 29 from 5.5 to 6.5, 20 at 7 or above. Best: copier-import-export-alexandria (8), print-file-preparation (7.5), hikvision buying guide (7.5). Worst: best-money-counting-machine-guide (4), best-office-printer-guide (4), best-security-cameras-for-business (4).

**By batch:**
- **July launch batch (best-*, *-checklist, how-to-choose-vendor, copier-maintenance, digital-vs-offset, paper-shredder, reduce-printing-costs, do-companies-still-need-paper):** the weakest group. Visible typos in almost every post, about 20–34 H2s each, exact-match keyword stuffing, no numbers, no Egypt specifics. Several are near-clones of each other.
- **August–September geo batch (ac-*, cash-counter-*, cctv-*, copier-*-alexandria/cairo, office-setup-*):** good structure and genuine local angles, but long SEO titles and vague "it depends" answers where a number was needed.
- **September–October "quote-ready" batch (dtf-*, *-office-supplies, safety-signage, pos-supplies, etc.):** the strongest writing. But it carries leaked brief artifacts, keyword injection, and a few overreaching legal claims.

### P1 — fix now (credibility and live bugs)
1. **Leaked brief placeholders in live prose:** "مقاسات ورق التصوير / انحشار الورق ونوعه / تخزين الورق" written into the text of accounting, engineering, law, nursery, office-cable-management and reception-area-setup. Plus the raw-URL anchors "/office-supplies" in reception-area-setup.
2. **Keyword-injection sentence about banner, card and brochure "cost guides" that don't exist:** in dtf-design-file, dtf-printing, dtf-vs-screen-printing, garment-print-durability and uniform-printing. Either write those three guides or delete the sentences.
3. **Contradictions between posts:** DTF files RGB vs CMYK (#25 / #26 / #27), and screen-print durability (#27 vs #30).
4. **Factual and legal claims to verify or soften:**
   - accounting (mandatory books, the "نقابة المحاسبين" body, paper invoice vs e-invoice)
   - law (self-inking "ذاتي اللصق", bar seal requirement)
   - safety-signage (civil defence, new Labour Law 14/2025)
   - ptz (US/China certifications)
5. **egypt-photocopier-prices:** "2025" in the title, "according to the original article" leaks, no new/used column, 0 internal links.
6. **Lost headings (`<p>` instead of H2):** hikvision (3), home-surveillance (4), how-to-choose-vendor, ptz, small-wireless. Also the duplicated H2 in types-of-surveillance-cameras.
7. **Wrong closing line:** paper-shredder ends with cash-counter service copy.

### P2 — business-fit and cannibalization
- **Promising services NGO may not offer:** copier **rental** (buy-vs-rent, import-export), **furniture** (office-setup-*, nursery), **POS systems** (pos-supplies), **plotters** (engineering). Confirm each, or reframe.
- **Clusters to merge or differentiate:**
  - copier/printer buying guides: best-office-copier, best-office-printer, laser-color-vs-bw
  - office-supplies lists: office-supplies-checklist, office-supplies-for-companies, new-office-setup-checklist, how-to-choose-vendor, smart-office-solutions
  - archiving: office-organization-tools-guide, office-organization-tools-archiving-system, professional-filing
  - garment printing: corporate-tshirt, uniform
  - surveillance types: best-security-cameras, types-of-surveillance, small-wireless, home-surveillance
- **Off-market keywords:** "الجوال بدون نت" (Gulf dialect), "أدوات مكتبية" grabs in the battery and whiteboard titles and FAQs.

### P3 — depth upgrades that would lift the whole site
- **Polymer 10/20 EGP notes:** add a section to all four cash-counter posts and best-money-counting.
- **Egyptian trade vocabulary in the printing posts:** كوشيه، بريستول، دوبلكس، طبع وش وضهر، سلوفان. Plus Arabic-text breaking in PDF export (print-file-preparation).
- **Legal retention periods (tax and commercial, about 5 years)** in the three archiving posts. Public Contracts Law 182/2018 and the e-procurement portal in the schools/hospitals/government post. Nafeza/ACI in the import-export copier post.
- **Replace "it depends" with numbers:** filter-cleaning frequency, AC setpoint 25°C, whiteboard sizes and mounting heights, SLA hours, PPM/duty-cycle bands, storage TB per camera, upload Mbps per camera.
- **Proofread the July batch** (typo lists are under each article). Demote the numbered-step H2s to lists.
- FAQPage schema is still missing on 14 geo posts that already have visible FAQs.
- **Shorten SEO titles over 65 chars** (12 posts, listed above).


---

## Per-article critique

### 1. ac-filter-cleaning-cairo-dust — 7/10
- **Good:** genuinely Cairo-specific angle (dry dust vs coastal salt, khamaseen), clear split between in-house cleaning and technician work, safe-cleaning steps are correct.
- **Weak:** it never answers its own head query ("كم مرة"). The table says "تكرار أقل نسبيًا / أعلى بوضوح" with no numbers. Give ranges: e.g. closed upper-floor office every 3-4 weeks in season, street-facing shop every 1-2 weeks, double during khamaseen.
- No inline image. A before/after filter photo or a split-unit filter location diagram would earn its place.
- Internal links are absolute `https://newgoldenoffice.com/...`. That's inconsistent with the rest of the site's relative links (harmless, but normalise).
- CTA is fine. No brand/model specifics (split vs cassette filters differ). That's a missed depth opportunity.

### 2. ac-maintenance-presummer-alexandria-salt-corrosion — 7.5/10
- **Good:** mechanism explained correctly (salt + humidity = electrolyte), clear March–May window, 4-axis table, sensible "annual contract vs seasonal visit" section.
- **Weak:** SEO title is 78 chars, so it gets truncated. Cut to "صيانة تكييف قبل الصيف بالإسكندرية: حماية الوحدة من التآكل الملحي".
- Protective coating is vague. Name the real market options (Gold Fin / Blue Fin coated condensers when buying, anti-corrosion spray after cleaning) and say which brands sell coated outdoor units.
- No image. Opener says "الإسكندرية والقاهرة" while the whole article is coastal. Fine for a geo post, but the closing CTA dilutes it.
- 7 FAQs, some redundant (FAQ 1 and 2 overlap with the body almost verbatim).

### 3. accounting-office-supplies — 6/10 ⚠ fact-check needed
- **Accuracy risk (fix first):**
  - Mandatory books: Egyptian Commercial Law 17/1999 obliges the **merchant** to keep دفتر اليومية and دفتر الجرد. The general ledger (دفتر الأستاذ) is not a statutory book. The article says all three are mandatory and puts the obligation on the accounting office.
  - Who numbers and stamps the books: that's the commercial registry office (مكتب السجل التجاري). "الجهة المختصة" dodges the question.
  - "نقابة المحاسبين والمراجعين" requiring paper records: there's no body by that exact name. Auditors register in سجل المحاسبين والمراجعين at the Ministry of Finance, and the professional bodies are جمعية المحاسبين والمراجعين المصرية / نقابة التجاريين. Remove or source the claim.
  - "الفاتورة الورقية تظل الوثيقة الأصلية… حتى مع تطبيق منظومة الفوترة الإلكترونية": wrong for taxpayers on the mandatory e-invoice system. There, the e-invoice *is* the legal document. This could mislead a professional reader and hurts credibility with exactly the target audience.
- **Structure:** about 40% of the body is really about copier paper and jams. That's useful but off-intent. Add accountant-specific items instead: receipt books with carbon copies, ledger binders, archiving boxes by fiscal year, check/cash counter, shredder for confidential docs (link paper-shredder-buying-guide).
- Good: cost-factor table, "what to prepare before a quote" list, WhatsApp CTA, 6 internal links.

### 4. best-ac-brands-egypt-2026 — 4.5/10
- **Audience mismatch:** written for home buyers ("غرف النوم", "مساحة منزلك"). The site sells B2B.
- **Duplicate sections:** "أفضل المكيفات الموفرة للكهرباء في مصر" and "أفضل تكييفات موفرة للطاقة في مصر لعام 2026" say the same thing twice, almost line for line.
- **Unsubstantiated superlatives:** "تورنيدو من أكثر التكييفات اقتصادًا" has no energy-label data, and "ECO MOOD" is unverifiable as a Carrier Egypt feature name. Either cite the Egyptian energy-efficiency label (stars) or soften the claim.
- **Missing context a buyer needs:** Sharp and Tornado are both made by El Araby in Egypt (same service network). Carrier/Midea are Miraco. Unionaire and Gree are missing entirely.
- The horsepower table has no m² numbers, so it's useless as a sizing guide. Add e.g. 1.5HP ≈ 12–16 m², 2.25HP ≈ 18–24 m², 3HP ≈ 25–32 m², with a sun/occupancy caveat.
- No office or commercial angle (central/cassette/concealed units, running 10h/day). That's the one angle that would differentiate it.
- Short (1,136 words) for a "مقارنة شاملة" title. **Recommend a rewrite.**

### 5. best-money-counting-machine-guide — 4/10 ⚠ proofreading
- **Typos and grammar errors** (embarrassing on a live page):
  - "فبلاً" → بدلاً
  - "عند أكثر من 1000 ورقة" → تعد
  - "يتم الإيرادات" → يتم عدّ الإيرادات
  - "عد أنواع" → عدة أنواع
  - "دقة العهد" → دقة العد
  - "بالنسبة لي نشاط" → لأي نشاط
  - "خاصية التزوير" → خاصية كشف التزوير
  - "على اختيار جهاز" → عند اختيار جهاز
  - "الإضافة على" → بالإضافة إلى
  - "يومًا" → يوميًا
  - "حتي"
  - systemic ي/ى confusion (إلي، علي) throughout
- **34 H2s for 1,420 words:** every use case and feature is an H2. Demote them to H3 under 5–6 real sections.
- **Zero Egypt specifics.** The biggest miss is the **polymer 10 & 20 EGP notes**, which many older counters misread. That's *the* buying question in Egypt right now. Also: mixed-denomination value counting for EGP, and USD/EUR support for exchange offices.
- No FAQ. Meta is 101 chars.
- Generic list-padding ("نصائح للحفاظ"). No numbers on hopper capacity or speeds beyond "1000+".
- **Recommend a rewrite**, or at minimum a proofread plus a polymer-notes section.

### 6. best-office-copier-guide — 4.5/10
- **Keyword stuffing:** "أفضل ماكينة تصوير للمكاتب" about 10× in 913 words. The opener ("تعد أفضل ماكينة تصوير للمكاتب من أهم الأجهزة") reads machine-written.
- **No numbers anywhere:** give PPM bands by office size (e.g. 20–30 ppm small, 35–45 medium, 50+ large), monthly duty cycle, A3 vs A4 decision, cost-per-page math.
- Doesn't link its own siblings: buy-vs-rent-copier, egypt-photocopier-prices, laser color-vs-bw, copier-maintenance-common-faults. All exist and none is linked.
- Doesn't cover the used/refurbished option, which is a big part of the Egyptian copier market.
- Brand list is just names, with no differentiation (Ricoh/Kyocera toner yield vs Canon, local service availability).
- No FAQ, thin. **Recommend an expansion** into a real buying guide, or merging it with laser-photocopier-color-vs-bw.

### 7. best-office-printer-guide — 4/10 ⚠ proofreading
- **Typos:**
  - "كيف تختار أفضل طباعة للمكاتب" (H2) → طابعة
  - "الصاينة" → الصيانة
  - "مستندات وسمية" → رسمية
  - "كلما زادت الشركة" → السرعة
  - "أفضل ماكينة طابعة للمكاتب،ى"
  - "عمرًا افتراضًا" → افتراضيًا
  - "يوميًا ن فإن"
  - "فالطباعة الأرخص" → فالطابعة
  - "اقل/اعلي/دورى"
- **Near-clone of best-office-copier-guide:** same skeleton, same "أخطاء شائعة" list, same keyword-stuffed opener ("تعد أفضل طابعة للمكاتب من أهم الأجهزة"). The two compete for overlapping queries. Make one about printers (desktop laser and inkjet, ink-tank models like Epson EcoTank/Canon G-series, which are popular in Egypt) and the other about MFP copiers.
- 22 H2s. Feature bullets ("Wi-Fi / Ethernet / USB") are listed with no guidance.
- No numbers (cost-per-page comparison laser vs ink-tank vs cartridge inkjet), no FAQ, meta 98 chars.

### 8. best-security-cameras-for-business — 4/10 ⚠ proofreading
- **Typos:**
  - "تعدى أفضل كاميرات" → تعد
  - "أفضل كاميرات مراقبة شركتك" → لشركتك
  - "تحد زاوية العدسة" → تحدد
  - "لمراقبة ونقاط معينة"
  - "كاميرات جدية" → جديدة
  - "اختيار التسجيلات بشكل منتظم" → مراجعة
  - "خاصية للشركات" → خاصة
  - "كا توفر" → كما
  - "لأي ترغب" (missing شركة)
  - "هل تحتاج شركتك على"
- **Generic, no specs:** no megapixel guidance (2MP vs 4MP vs 8MP by use), H.265, PoE, NVR channel counts, storage-days math (e.g. 8 cams × 4MP × 30 days ≈ X TB), Hikvision/Dahua (the brands the site actually sells).
- The privacy line is vague. Cite Egypt's Personal Data Protection Law 151/2020 or drop it.
- Cannibalizes types-of-surveillance-cameras (same type list). 22 H2s, no FAQ, meta 109 chars.
- **Recommend a rewrite** as a B2B system-design guide (cameras + NVR + storage + install), linking to types-of-surveillance-cameras for the type explanations.

### 9. buy-vs-rent-copier — 6.5/10 ⚠ business-fit issue
- **Good:** clear decision framework, operating lease vs lease-to-own explained, a contract checklist (auto-renewal, minimum volume, early termination) that's genuinely useful.
- **Business-fit problem:** the site has **no copier rental page** (`src/pages/copiers/` = buy, cartridges, maintenance, printers). The article leans pro-rental for startups, then the CTA sends readers to "buy". Either add a rental/MPS offering or reframe as "buy new vs buy refurbished vs maintenance contract", which NGO can actually fulfil.
- **Zero numbers:** a buy-vs-rent article without a break-even example is incomplete. Add an illustrative calculation, e.g. "at ~8–10k pages/month for 3+ years, buying + maintenance contract usually wins". Add a tax angle too: rent is a deductible operating expense vs depreciation on a purchased asset.
- Very repetitive. The same three criteria (volume / horizon / cash flow) are restated about five times.
- No image. Absolute internal links.

### 10. buying-a4-paper-wholesale-egypt — 6/10
- **Promise mismatch:** title says "الأنواع **والأسعار**" but there's no price or price band anywhere. Either add dated ranges ("as of Oct 2026, 80gsm ream ≈ X–Y EGP") or drop "الأسعار" from the H1.
- **Missing practical basics:** ream = 500 sheets, box = 5 reams, pallet sizes, brightness (CIE 146 vs 161), and the brands Egyptian buyers actually compare (Double A, PaperOne, Navigator, Rakta, local mills). Without these it's a generic paper explainer.
- Contradiction-ish: recommends 2–3 months of stock, then pushes annual contracts. Reconcile it: annual price lock with staggered monthly delivery.
- The second image sits *after* the closing CTA, which looks like an orphan. Meta is 174 chars (truncated).
- Clean language. FAQ OK. Only 2 internal links (add law/accounting/engineering-office-supplies, paper-weight-gsm).

### 11. cash-counter-banks-retail-cairo — 6/10
- **Credibility overreach:** Egyptian bank branches procure through formal tenders and CBE-compliant vendors (Glory, De La Rue/Kisan-class sorters with CIS image sensors and serial-number reading). Pitching an office-supplies dealer to bank branches will read as naïve to the exact audience named. Re-aim at exchange offices and retail chains, or add real bank-grade spec language (CIS sensors, serial-number capture, ECB/CBE fitness sorting).
- **Missing the polymer notes again.** The "currency updates" section talks generically about "new designs". Name the CBE's polymer 10 EGP (2022) and 20 EGP (2023) notes explicitly.
- Unsourced claims: "دقة صفرية", "نظام تبريد داخلي".
- SEO title 98 chars. No image. Multi-currency section (USD/EUR/SAR) is good. The multi-branch fleet-standardisation section is the strongest part.

### 12. cash-counter-before-holidays — 6/10
- **Good angle, vague execution:** "بأسابيع كافية" is never quantified. Say "3–4 weeks before Ramadan/Eid al-Fitr" and name the Egyptian peaks (Ramadan + Eid al-Fitr, Eid al-Adha, back-to-school, year-end sales).
- **Missed insight:** before Eid, banks release **new crisp notes** for العيدية. New notes stick together, so double-note detection and the polymer 10/20 notes are *the* holiday-specific counting problem. That's the hook this article should be built around.
- **FAQ stuffing:** "ما هي أقوى ماكينة / أفضل ماكينة في مصر / أفضل آلة عد نقود" are three near-identical Q&As written for keyword variants. Merge them into one.
- Awkward phrasing: "قبل هبوب موسم المناسبات", "وفق ما تُذكر لدى هذه الفئات".
- Cairo link copy says "وحدّد موعد التوصيل". That's delivery tone for Cairo, against the geo rule.
- No image.

### 13. cash-counter-shops-alexandria — 7/10
- **Good:** properly local. It names Mansheya/Attarine, worn and folded notes in popular markets, dusty market sensors, the 200 EGP note, portable vs desktop vs two-pocket. The two-pocket explanation (suspect notes set aside without stopping the count) is genuinely useful.
- **Missing the polymer 10/20 EGP notes**, which matter most for exactly this audience (small-denomination shop cash). It's the same gap as the other cash-counter posts, so it's worth one shared paragraph across all of them.
- No numbers at all for "معدل عد مرتفع". Give a band (e.g. 800–1,000+ notes/min for counter models).
- Keyword-shaped H2 "ماكينة عد نقود المنشية والعطارين: اعتبارات المنطقة" reads unnaturally. SEO title is 79 chars.

### 14. cctv-factories-warehouses-alexandria — 6/10
- **Questionable technical advice:** the key point "IP وWiFi للمساحات الواسعة" recommends WiFi cameras for factories. Industrial sites should be wired PoE, with fibre for runs over ~100 m. WiFi is the exception (remote yard poles), not the rule. Rewrite that point.
- **"Alexandria" in name only:** no mention of Borg El Arab, Amreya, El Max, the port/free-zone areas, or the 10th of Ramadan-style industrial context. A reader in Borg El Arab learns nothing local.
- **Missing industrial specifics:** IP66/IP67 and IK10 ratings, ANPR at gates, thermal cameras for fire detection, storage-days math, UPS sizing for the NVR.
- Garbled keyword heading: "أنواع كاميرات المصانع المنطقة الصناعية والمخازن".
- FAQ "how many cameras?" and "how long to keep footage?" both answer "it depends". Give a typical starting point (e.g. 30 days retention is common practice).
- SEO title 89 chars.

### 15. cctv-maintenance-guide-hikvision-dahua — 7/10
- **Good:** practical and correct. It uses real tooling (SADP), PoE and IP-conflict diagnosis, "lower the live stream but keep recording quality", and a clear 3/6/12-month schedule table.
- **H2 inflation:** numbered troubleshooting steps ("1. التأكد من سلامة كابل…") are H2s, giving 34 H2s. Make them an ordered list.
- **Dahua is thinner than Hikvision:** name the Dahua equivalent tool (ConfigTool) to match SADP.
- **Missing:** surveillance-grade HDDs (WD Purple / Seagate SkyHawk), IR glare from spider webs and dome bubbles at night, changing default passwords as a security item.
- The FAQ has near-duplicates ("كيف أعيد تشغيل" / "كيف اعيد ضبط"). Typo "اشهر اعطال" (missing hamza).

### 16. cctv-shops-alexandria-corniche — 7/10
- **Good:** real local problems: glass-front reflections from corniche street lights at night, summer seasonal peaks, salt air, cashier-dispute footage. The 5-zone planning method is actionable.
- **Names the problem but not the spec:** the glare and backlight issue is exactly what **WDR (true WDR ~120 dB)** solves, and "تصنيف مقاوم للماء والغبار" should say **IP66/IP67**. Also stainless or marine-grade brackets for salt air. Without the terms, the buyer can't check a quote.
- Small geography slip: Agami isn't on the main corniche strip (it's west of the city). Sidi Bishr and Mandara are fine.
- SEO title 86 chars.

### 17. company-seals-egypt-office-supplies-guide — 5.5/10
- **Keyword-stuffed title:** "ودورها ضمن مستلزمات مكتبية للشركات" is ungrammatical, a keyword pasted onto the sentence. Fix it to e.g. "أختام الشركات في مصر: الأنواع والاستخدامات وطريقة الطلب".
- **Wrong order and padding (2,071 words):** "how to choose a supplier" comes *before* explaining what seals are. The "one supplier for everything" pitch repeats three times.
- **Missing what Egyptian buyers actually ask:**
  - the embossing seal (الختم البارز) for certificates and official papers, which is completely absent
  - popular self-inking brands (Trodat, Shiny)
  - ink colours (blue is standard for official use)
  - typical turnaround (often same/next day)
  - what banks and the tax authority typically require on the seal
- Both inline images have alt = the post title. They're covered by image-meta, so low priority.

### 18. contracting-supplies — 6.5/10
- **Good niche angle:** the site office as a documentation hub (safety logs, change orders, handover minutes). The cost-factor table and the "prepare before quote" list are solid.
- **Biggest miss:** construction site offices print and copy **drawings**. That means A3 MFPs and A1/A0 plotter or large-format copies, drawing tubes and flat-file storage. None of it is mentioned. Also missing: waterproof document wallets, clipboards, the site diary (دفتر يومية الموقع), marking pens.
- **Overreach:** "انقطاع الإمداد … يضع الشركة أمام مساءلة قانونية" is dramatic and unsourced. Soften it.
- Odd item: "أقلام توقيع مقاومة للحرارة".
- Only 2 internal links (both `/office-supplies`). Link copiers/buy (A3), engineering-office-supplies, professional-filing-archiving.

### 19. copier-fleet-maintenance-contract-cairo — 7/10
- **Good:** real B2B content. It covers the two pricing models (per-device vs per-copy), a written response SLA, a recurring-fault replacement clause, signed visit reports, and the onboarding inventory. Useful to a procurement manager.
- **No numbers:** give typical SLA bands (e.g. 4–8 working hours response inside Greater Cairo, a loaner after 48h) and an uptime target. Without them "مدة استجابة محددة" can't be benchmarked.
- **Missing industry terms buyers search for:** MPS (Managed Print Services), remote meter reading and fleet-monitoring software, automatic toner replenishment.
- **Claim check:** it promises coverage of Ricoh/Canon/Toshiba/Kyocera/HP/Xerox "بمستوى واحد". Make sure NGO actually services all six before implying it.
- SEO title 75 chars. Absolute internal links.

### 20. copier-import-export-alexandria — 8/10 (best so far)
- **Good:** concrete, specific and locally grounded. It covers single-pass duplex scan, ADF capacity, duty cycle above peak month, searchable PDF with Arabic OCR, scan-to-SMB, Legal paper for customs forms, and container demurrage (أرضية) as the cost of downtime. This is the template the generic July posts should follow.
- **Missing local hook:** Egypt's **Nafeza / ACI** single-window system has required electronic shipping documents since 2021. Scanning straight to PDF for Nafeza uploads is the strongest argument for the scan features, and it isn't mentioned.
- **Business-fit:** recommends monthly rental "يشمل عادة الصيانة والتونر", which NGO doesn't offer (see #9).
- Add number bands (ADF 100+ sheets, 40+ ppm for mid-size).
- The SEO title and H1 are **105 chars**. Cut to "ماكينة تصوير لشركات الاستيراد والتصدير بالإسكندرية".

### 21. copier-maintenance-common-faults — 4.5/10 ⚠ proofreading
- **Typos:**
  - "إزالة الورق العالق الحذر" → بحذر
  - H2 "بط الطباعة" → بطء
  - "وحدة التسخينز"
  - "يتم اختيار جودة الطباعة" → اختبار
  - "الإفتراضي"
  - "قد تعرض الماكينة" → تتعرض
  - "اشهر اعطال"
- **Keyword stuffing:** "صيانة ماكينة تصوير" about 15×. 21 H2s.
- **Generic:** no error-code guidance (Ricoh SC codes, Kyocera C-codes, Canon E-codes) and no "what you can fix yourself vs call a technician" split. That's what someone searching faults actually wants.
- FAQ added in 647bd7d.

### 22. corporate-tshirt-printing — 7/10
- **Good:** smart framing ("two quotes differ because of decisions, not margin"). Fabric determines technique, the cost-factor table is solid, and the sizing and sample advice is practical.
- **Missing local selling point:** Egyptian cotton. It's the obvious differentiator for an Egyptian printer and isn't mentioned.
- **No numbers:** typical screen-print minimums, gsm bands (e.g. 160–180 everyday, 200+ premium), lead times.
- **Under-linked:** the site has dtf-printing, dtf-vs-screen-printing, garment-print-durability, uniform-printing, dtf-design-file. None is linked (only 2 internal links). It doesn't mention DTF at all, even though NGO has five DTF/garment posts.
- Cost table row "تقنية الطباعة → يخفض" is confusing; technique isn't a direction.

### 23. digital-vs-offset-printing-guide — 5.5/10 ⚠ proofreading
- **Good:** gives real thresholds (50–300 digital, 5,000+ offset) and explains variable-data printing.
- **Gap in the logic:** it says nothing about **300–5,000 copies**, which is exactly where most corporate orders (brochures, catalogues) fall. Add a "grey zone" section (it depends on colours, paper and deadline; ask for both quotes).
- **Typos:**
  - inconsistent "الديجتال/الديجيتال"
  - "ثالتًا"
  - "قليللاً"
  - "حلة التسويقية" → حملة
  - "لكل طباعة الأوفست توفر" → لكن
  - "مناسب لإنتاج"
- 22 H2s.
- FAQ added in 647bd7d. I also turned the "الخاتمة:" paragraph into a real H2.

### 24. do-companies-still-need-paper-printing — 4.5/10 ⚠ proofreading
- **Thin (868 words) and generic.** The interesting Egyptian answer is missing. E-invoice and e-receipt mandates *do* cut paper, but courts, notaries (الشهر العقاري), government stamps (الدمغة) and many tenders still demand originals on paper. That nuance is the whole value of this topic in Egypt.
- **Typos:**
  - "ويغني عنها" → يغني
  - "سنتعرض أهمية" → سنعرض
  - "تقليل عليى الطباعة"
  - "موفرة الحبر أو التبرز" → التونر
  - "الطبباعة"
  - "تلع دروًا" → تلعب دورًا
  - H2 "كيف تقليل تكلفة"
- Overlaps reduce-printing-costs-company. Either merge, or keep this one strictly about "when paper is still legally or practically required".
- FAQ added in 647bd7d.

### 25. dtf-design-file — 6.5/10 ⚠ contradicts sibling posts
- **Good:** technically right on the core point. PNG with an alpha channel lets the RIP build the white underbase only under the design, and a solid white background leaves a white box on dark fabric. Clear and useful for designers.
- **Cross-post contradiction (fix across all DTF posts):** this post says *send RGB, never CMYK*. dtf-printing says the design prints "بألوان CMYK". dtf-vs-screen-printing lists "ألوان RGB بدل CMYK" as a *mistake*. A customer reading two NGO posts gets opposite instructions. Pick one line (RGB PNG for DTF, the RIP converts to CMYK+W) and apply it everywhere.
- **Attribution-washing:** "وفق بيانات مطوّري برامج RIP" appears 4× to back "20% ink saving" and "0.01 mm white layer precision" with no source. Remove the fake precision or cite a vendor.
- **Keyword injection:** "تكلفة طباعة البنرات أو تكلفة طباعة الكروت أو تكلفة طباعة البروشورات" is pasted into the intro. These are target keywords for pages that don't exist (no links), and the sentence reads oddly. The same injection appears in dtf-printing, dtf-vs-screen-printing and garment-print-durability.
- No resolution number at all (it says "دقة مرتفعة"). Give 300 DPI at print size, which dtf-printing already says.

### 26. dtf-printing — 6.5/10
- **Good:** clear 4-step process, honest comparisons (DTF vs screen vs sublimation vs DTG), ISO 105-C06 wash-fastness reference, and a "what to prepare" list.
- **Same contradictions and injection as #25:** CMYK wording, and the "دليل تكلفة طباعة البنرات… الكروت… البروشورات" references to guides that don't exist. Either write those three cost guides (they're good keywords) or delete the sentences.
- **Printhead claim:** it names Ricoh and Kyocera industrial heads but omits Epson (i3200/XP600), which most DTF printers in the Egyptian market actually use. Readers who know the market will notice.
- **Geo tone:** "بمقر فعلي في الإسكندرية وتغطية كاملة لعملاء القاهرة" and "شركات الإسكندرية والقاهرة" twice. That leads with Alexandria and frames Cairo as coverage.

### 27. dtf-vs-screen-printing — 7/10
- **Good:** the best of the DTF trio. It's decision-oriented (quantity × colours × fabric), explains why DTF unit cost doesn't fall with volume (consumables), and has a sensible "50 washes ≈ 2 years at twice a month" lifetime calculation.
- **Contradictions:**
  - It says screen printing is "الأكثر متانة على القطن الثقيل… المفضّل لملابس العمل اليومية". garment-print-durability says screen print is the *least* durable under daily washing. Decide (in reality, cured plastisol screen print is very durable) and align both posts.
  - It treats RGB as a file mistake (see #25).
- **Unsourced "50 غسلة"** attributed to "دراسات مصنّعي التقنية". Soften it to "typically" or cite one.
- Same banner/card/brochure keyword sentence.

### 28. egypt-photocopier-prices — 5/10 ⚠ money page, outdated and leaky
- **Stale year:** the title says **"2025"** and it's October 2026. On a price page that kills click-through and trust. Update the year and re-check every price (EGP has moved a lot).
- **Rewrite artifacts leaked into the copy:** "وفق البيانات الواردة في المقال", "الأسعار المذكورة في المادة الأصلية", "وفق الأسعار المذكورة". Repeated 8×, this reads like the writer's source notes. Remove them all.
- **Misleading table:** there's no **new/used/refurbished** column. Ricoh MP 3053 / MP 4054 and Kyocera 4501i / 6003i at 19–35k EGP can only be used or refurbished prices. Ricoh SP 3500 is a printer, not a copier. Kyocera 4501i (45 ppm) and 6003i (60 ppm) at nearly the same price needs explaining. "السعر الأصلي / السعر الحالي" is shop-sale language with no date.
- **Zero internal links** on the site's main commercial query. Link /copiers/buy, buy-vs-rent-copier, laser-photocopier-color-vs-bw, the refurbished-copier content, and copier maintenance.
- Generic second half (selection, new vs used) duplicates best-office-copier-guide.

### 29. engineering-office-supplies — 6.5/10 ⚠ leaked placeholders
- **Good:** right framing (plan the plotter/large-format system first, then paper and ink). Correctly flags compatible ink damaging printheads and humidity warping plotter paper.
- **Leaked internal-link placeholders in the cost table:** "وترتبط مباشرة بموضوع انحشار الورق ونوعه", "وموضوع تخزين الورق يستحق سياسة داخلية مكتوبة", "ويربط بموضوع مقاسات ورق التصوير". These are brief instructions ("link to topic X") that were never converted into links and are now in the live prose.
- **Says "بلا أرقام" on purpose, but engineers need numbers:** roll widths (610/914 mm), bond 80 g vs 90 g vs coated, pen line widths (0.13–1.0 mm), plotter families (HP DesignJet, Canon imagePROGRAF, Epson SureColor).
- **Business-fit:** it links "الراسمة المناسبة" to /copiers/buy. Confirm NGO actually sells plotters; if not, say large-format *copiers*.
- The "27 عامًا" boast appears twice.

### 30. garment-print-durability — 7/10
- **Good:** practical care guide. It covers inside-out washing, cold cycles, no chlorine, shade drying, ironing from the back, a clean factor table, and the right fabric-technique logic (sublimation fails on cotton).
- **Contradiction with #27** on screen-print durability (see above).
- **Technical slip:** "مبيّض بصري يهاجم الصبغة". Optical brighteners don't attack dye; chlorine does. Keep chlorine, drop the optical-brightener claim.
- Same keyword-injection paragraph ("تكلفة طباعة البنرات… الكروت… البروشورات… نوع الطي"). Here it's completely off-topic in a garment-care article.

### 31. hikvision-surveillance-cameras-buying-guide — 7.5/10
- **Good:** genuinely expert. It uses real model numbers (DS-2CD1043G2-LIU, DS-7616NXI-K2/16P, DS-KIS604-PC), explains ColorVu / AcuSense / Smart Hybrid Light / DarkFighter correctly, and has a sensible Turbo HD vs IP rule, a lens table, and the reminder that the HDD is sold separately. The best camera post on the site.
- **3 section headings lost their markup.** "دقة كاميرات مراقبة هيك فيجن…", "أشكال كاميرا هيك فيجن ومسجلات NVR DVR…" and "المميزات الإضافية في كاميرا هيك فيجن…" are plain `<p>` paragraphs, so they're missing from the chapter split and table of contents and carry no heading weight for SEO. See the site-wide note in the patterns section.
- **Typos:** "تقنية ColorFu" → ColorVu, "الأنواع الرئيسية كاميرا هيك فيجن" → لكاميرات.
- **The "عيوب" FAQ dodges the question.** "The HDD is sold separately" isn't a real disadvantage. Real ones include the NDAA/FCC restrictions (relevant to multinationals in Egypt with US compliance rules), past firmware vulnerabilities (so update), and the cloud account dependency.
- No storage sizing (TB per camera per 30 days at 4MP H.265). SEO title 88 chars.

### 32. home-surveillance-cameras-via-mobile-without-internet — 5/10
- **Wrong market dialect:** "الجوال بدون نت" is a Gulf/Saudi search phrase. Egyptians say موبايل. The keyword brings Gulf traffic that NGO can't serve, and it's a home-consumer topic on a B2B site.
- **Misleading premise:** a 4G-SIM camera *is* using the internet (mobile data). "بدون نت" really means "without home WiFi". Say so plainly, or the reader feels tricked.
- 4 section headings are plain `<p>` (lost markup), numbered pairing steps are H2s, and the keyword phrase appears about 12×.
- No Egyptian context (WE/Vodafone/Orange/Etisalat data SIMs, typical monthly data use of a 1080p camera).

### 33. how-to-choose-office-supplies-vendor — 4.5/10 ⚠ proofreading
- **Typos:**
  - "مورج مستلزمات" → مورد
  - "وقد يكون الصعب" → من الصعب
  - "خدمة ما احترافية"
  - "وسعره التوريد" → وسرعة
  - "شركًا يعتمد عليه" → شريكًا
  - "بناءًا"
  - "الدعم التوصيل"
- **Structure:** the first H2 ("لماذا يعتبر اختيار مورد…") is a plain paragraph, and the أهم النقاط block comes *after* it, not first, which breaks the key-points card rule.
- Keyword stuffing ("مورد مستلزمات مكتبية للشركات" about 15×). Generic, with no Egypt-specific vendor checks: e-invoice through the ETA portal, tax card, VAT-registered invoices, payment terms (آجل 30/60 يوم), which is what B2B buyers here actually negotiate.

### 34. laser-photocopier-color-vs-black-white-office-guide — 5.5/10
- **Confusing title:** "ليزر مقابل الألوان والأبيض والأسود" sets up a false three-way choice, since laser machines come in both colour and mono. Better: "ماكينة تصوير ليزر ألوان أم أبيض وأسود؟".
- **No numbers on the one comparison that needs them:** colour cost per page vs mono (colour is typically several times the mono cost per page), duty-cycle bands.
- **The third cannibal** alongside best-office-copier-guide and best-office-printer-guide: same "how to choose / common mistakes" skeleton. Consider merging the three into one strong copier/printer buying hub plus focused spokes.
- Clean language. The ink-tank mention is a nice touch.

### 35. law-office-supplies — 6.5/10 ⚠ terminology and legal claim
- **Mistranslation:** "الختم الذاتي اللصق (Flash Stamp)". Self-inking is **ذاتي التحبير**, and ذاتي اللصق means self-adhesive. Flash/pre-inked stamps are also a different technology from self-inking. This appears in the table, the body and the FAQ.
- **Unverified legal claim:** "نقابة المحامين المصرية تشترط… أي ختم ناقص لا يُعتد به أمام الجهات القضائية". What Egyptian courts actually require is the lawyer's signature plus the bar association stamps (دمغة/طوابع المحاماة) on filings, not a private seal format. Verify or soften, because lawyers will notice.
- **Leaked internal-link placeholders** (same as #29 engineering and #3 accounting): "هنا يبرز أثر مقاسات ورق التصوير", "كذلك تخزين الورق نفسه يؤثر…", "انحشار الورق ونوعه أكثر مشكلتين". Topic names from the brief written into prose instead of links.
- **Good:** DIN 66399 / ISO 21964 P-levels (P-4 minimum, P-5 for trade secrets) are correct and useful, Folio vs A4 is a real Egyptian legal-paper issue, and the active vs archived filing split is practical.

### 36. new-office-setup-checklist — 5/10 ⚠ proofreading
- **Typos:**
  - "قارن الأسهار بين أكثر من موردز" → الأسعار، مورد
  - "توفير قطع غيرها" → قطع غيارها
  - "Checklistلتجهيز" (missing space)
  - "تؤثر بشكل مباشر سرعة" → على سرعة
- **Generic:** half the list is outside NGO's catalogue (computers, MS Office, CRM, coffee machine, fridge) and there's no Egypt-specific setup at all (commercial registry, tax card, civil-defence fire licence, internet provider choice).
- **Cannibalizes** office-supplies-checklist, office-setup-cairo-tagamoa and office-setup-alexandria-smouha. Make this the national hub and link the two city pages from it.
- FAQ added in 647bd7d.

### 37. nursery-supplies — 6/10 ⚠ business-fit
- **Business-fit:** the article promises one combined quote for nursery furniture, toys, rubber play mats and classroom tables. NGO's catalogue is office supplies, copiers, AC, cameras and printing. Unless NGO actually supplies children's furniture and ISO 8124 toys, this generates leads it can't serve. Reframe around what NGO does supply to a nursery (admin office, copier, AC, CCTV, stationery), or confirm the furniture offer.
- **Good:** correct regulator (Ministry of Social Solidarity under the Child Law, plus health and civil-defence requirements), ISO 8124 for toys, the "shared areas don't scale with class count" insight, and the August/September peak-season warning.
- **Leaked placeholders again:** "مقاسات ورق التصوير المناسبة للتقارير والشهادات، انحشار الورق ونوعه… وتخزين الورق" (see the patterns section).

### 38. office-ac-electricity-saving — 6.5/10
- **Ungrammatical keyword as title/H1:** "توفير استهلاك الكهرباء تكييف المكتب" (missing لـ). Fix it to "توفير استهلاك كهرباء تكييف المكتب" or "كيف توفّر كهرباء تكييف المكتب".
- **Never gives a temperature.** It says "مستوى مريح ثابت" four times. Egypt's own energy-saving campaigns recommend **25°C**; say it. Also missing: the Egyptian energy-efficiency label (stars), the commercial tariff tiers, and that each degree lower costs roughly X%.
- "الانفرتر يوفر 30–50% وفق بيانات الموردين" is unsourced. Soften it to "commonly cited" or cite a label test.
- **Good:** the right priority order (insulation, then sizing, then scheduling, then inverter), zoning advice, and a clear inverter vs fixed-speed explanation. Image added in 647bd7d.

### 39. office-cable-management — 6.5/10
- **Good:** practical and correct. It covers separating power from data, the 40% trunking fill rule, velcro over over-tightened zip ties, labelling both ends, IEC 60364-5-52 / IEC 62368-1 references, and "pilot one workstation first".
- **Leaked placeholders, completely off-topic:** "اذكر محيط الطابعة بالكامل. مقاسات ورق التصوير، ومسألة انحشار الورق ونوعه، وطريقة تخزين الورق، كلها بنود تؤثر في مكان الطابعة…". Paper jams in a cable-management article.
- The colour code (blue data / black power / yellow audio) is presented as a convention but isn't a standard. Say "pick a code and stick to it".
- Opener mentions "مكاتب القاهرة والإسكندرية". Fine.

### 40. office-envelopes-packaging-types-sizes-guide — 6.5/10
- **Good:** correct ISO sizes (DL, C5, C6, C4) with the A4-fold rule, window vs opaque, payroll envelopes opaque, plus an outgoing-mail checklist and a صادر/وارد register mention.
- **Missing Egyptian market vocabulary** that buyers actually search: ظرف خطاب، ظرف كيس/دبل، ظرف أمانات، ظرف فقاعات (bubble mailer), the common local 23×33 / 25×35 sizes, envelope gsm (80/90/100), and courier packaging (Bosta, Aramex, Egypt Post).
- **Structure glitch:** a CTA H2 ("هل تبحث عن أظرف…؟") sits *before* "الخاتمة", with no link, then the conclusion follows. Move the CTA to the end.
- It mentions printed envelopes but doesn't link /printing.

### 41. office-organization-tools-archiving-system — 5.5/10 ⚠ cannibalization
- **Three-way cannibalization:** this post's SEO title targets "أدوات تنظيم المكتب", the exact primary keyword of #42 office-organization-tools-guide. professional-filing-archiving-system-guide covers the same archiving lifecycle. Google will rotate them and none will rank well. Merge into one archiving hub and one desk-organization post.
- **Missing the most valuable Egypt-specific fact:** legal retention periods. Tax records are commonly kept 5 years under the Unified Tax Procedures Law 206/2020, and commercial books for 5 years under the Commercial Law. "حدد مدة الاحتفاظ" without telling the reader the legal minimums leaves them stuck.
- **Template artifact:** the CTA section is headed "دليل اختيار مورد مستلزمات مكتبية لشركتك في مصر", which is the title of a different article, used as an H2. Same artifact in #42 and #10 buying-a4-paper.

### 42. office-organization-tools-guide — 5/10
- Generic (zones, the "one touch" rule, material comparison) with nothing Egypt- or NGO-specific. Typo H3 "دوات تنظيم الأدراج" → أدوات.
- Same CTA-heading artifact as #41.
- Its cable-management section is a thin duplicate of office-cable-management. Link to it instead.

### 43. office-pens-writing-tools-guide — 6.5/10
- **Good:** clean and sensible. Its "match pen to task" mix (BIC daily, Pilot for signing, Stabilo for highlighting) is practical procurement advice, with tip sizes, a refill-vs-disposable trade-off, and a bulk-buying checklist.
- **Missing specifics:** model names buyers actually order (BIC Cristal / Round Stic, Pilot G2 / V5 / Frixion, Stabilo Boss / Point 88). Also missing the local and mid-price brands common in Egyptian offices (Prima, Roto, Faber-Castell), and ink colour for official documents (blue is the norm for signatures in Egypt).
- "استخدم حبرًا مناسبًا لطبيعة الأرشفة" is vague. Say archival/pigment gel ink resists fading and water.
- Only 1 internal link (see site-wide list).

### 44. office-setup-alexandria-smouha — 7/10
- **Good:** genuinely local and operational. Tower-management elevator rules and booking in Smouha, Sidi Gaber school-traffic timing and stair checks in converted flats, and Miami's salt air (Turkish MDF / HPL, stainless hinges, coated condensers). The district comparison table is useful.
- **Sequencing flaw:** it orders internet → **copier → AC** → furniture. AC installation (drilling the façade, copper runs, dust) should come *before* the copier goes in. A copier is dust-sensitive, and the article itself warns that AC work creates dust. Swap steps 2 and 3.
- **Business-fit:** heavy on furniture (manager desks, workstations, medical chairs, reception sofa). Confirm NGO sells furniture, or frame it as "coordinate with your furniture supplier".
- SEO title 72 chars. Absolute internal links. Image added in 647bd7d.

### 45. office-setup-cairo-tagamoa — 6/10 (after the 647bd7d fix)
- Geo tone fixed: no "branch in Alexandria" or shipping framing left, and the SEO title is shortened.
- **Still weak:** the district differences (Fifth Settlement startups, Nasr City admin HQs, Maadi consultancies) are one-line stereotypes, nowhere near the operational detail of the Smouha post. Add New Cairo compound/admin-building access rules, Nasr City older buildings and freight lifts, and Maadi villa-offices.
- Same furniture business-fit question as #44. Keyword "تجهيز مكاتب بالتجمع الخامس" is repeated heavily. Absolute links.

### 46. office-supplies-checklist — 4.5/10 ⚠ proofreading
- **Typos:**
  - "دروًا" → دورًا
  - "ويٌفضل"
  - "لتحقيق أعلي كفاءة توفير"
  - "ورق ِA3" (stray kasra)
  - "المكاتب العمليةز"
  - "دن الشعور" → دون
  - "داخل القسام" → الأقسام
  - "قبل نفاذها" → نفادها
- **Ungrammatical keyword** "مستلزمات مكتبية للشركات" is forced into sentences about 10× ("تعد مستلزمات مكتبية للشركات من…").
- **A checklist without quantities:** the thing a reader wants is "per 10 employees per month: X reams, Y pens, Z toner". Add a quantity table, or this can't beat competitors.
- Overlaps new-office-setup-checklist and office-supplies-for-companies. FAQ added in 647bd7d.

### 47. office-supplies-for-companies — 5/10
- **2,386 words of padding:** "supply system", team-size tiers and activity types, all generic and with no numbers. It mentions min/max stock levels but never gives the reorder logic (reorder point = daily use × lead time + safety stock), which is the one practical takeaway the title promises.
- **Fourth overlapping "office supplies list" post** (with office-supplies-checklist, new-office-setup-checklist, how-to-choose-vendor). Consolidate.
- Clean language. Ends on a CTA H2 with no link.

### 48. office-supplies-schools-hospitals-government-egypt — 6/10
- **Good:** the right segmentation. Schools (seasonal peaks, child-safe scissors and glue), hospitals (admin vs clinical supplies kept separate, long medical-record retention), government (tender conditions booklet, bank guarantee, delivery penalties).
- **Missing the Egyptian legal anchors:** Public Contracts Law **182/2018** (قانون التعاقدات العامة) and the government e-procurement portal (بوابة التعاقدات الحكومية / etenders). A government-supply article without them looks uninformed.
- **Audience drift:** "هل تخطط لدخول سوق التوريدات الحكومية؟ … يساعدك في تجهيز مستندات التأهل" addresses would-be *suppliers*, who are NGO's competitors, not buyers. Re-aim the section at procurement officers buying *from* NGO.
- Two "تحدث مع مستشار توريد" CTAs have no link. Keyword-shaped H2s ("توريد مستشفيات مصر").

### 49. office-tools-battery-usb-guide — 5.5/10
- **Keyword grab:** the SEO title starts "أدوات مكتبية: …" and two FAQs ("ما هي الأدوات المكتبية؟", "ما الفرق بين الأدوات المكتبية ومستلزمات المكاتب؟") have nothing to do with batteries or USB. They target a head term this page can't win and dilute its topic.
- **Generic for 2,129 words:** no USB-C Power Delivery wattage (a 65–100 W cable for laptops vs a phone cable), no USB 2.0 vs 3.x speeds, no brand names (Duracell, Energizer, Panasonic Eneloop), and no "use lithium 9V in smoke detectors".
- Says "تخلص منها وفق الطرق المخصصة". Egypt has very limited consumer battery recycling, so say what to actually do (collect and hand to an e-waste recycler).
- Only 1 internal link. Link office-cable-management, which links *to* this post.

### 50. paper-shredder-buying-guide — 5/10 ⚠ proofreading
- **Typos:**
  - "فبلاً" → بدلاً
  - "الجهاز المناسبأمرًا" (missing space)
  - "حسب الطريقة التقطيع"
  - "إلى أجزاء" written "غلي أجزاء"
  - "عدم تجاوز الأقصى لعدة الأوراق"
  - "تنظيف الجهاز دروي" → دوريًا
  - "إذا كنت الاستخدام الجهاز"
- **Only covers strip-cut vs cross-cut.** It skips micro-cut and the DIN 66399 P-levels, which law-office-supplies (#35) explains well. Link them, and add a small P-1…P-7 table.
- **Wrong closing line:** "خدمات ماكينات عد النقود وكشف التزييف متوفرة لدينا…". That's cash-counter copy on a shredder article (same city links, wrong service name).
- Image added in 647bd7d. FAQ added in 647bd7d.

### 51. paper-weight-gsm — 7/10
- **Good:** clear "gsm isn't quality, it's fit for purpose" message with correct uses (80 office, 120–135 inner pages, 250–350 covers and cards). It notes the shipping-weight effect and treats coating as an independent variable.
- **Missing Egyptian print-trade vocabulary:** Egyptian printers quote in **كوشيه** (coated) 115/135/150/170, **بريستول**, **دوبلكس** and **طبع**. A buyer reading this still won't understand a local quote. Add a "what the printer will say" glossary.
- "120 جرام هو الأكثر طلبًا في الكتالوجات بالسوق المصرية" is unsourced. Locally, 135/150 coated is more typical for catalogues; soften it.

### 52. pos-supplies — 6.5/10 ⚠ business-fit
- **Good:** the right Egyptian hook (the ETA e-receipt system, buying only registered/approved POS solutions, re-checking the official list on the day). The 57 vs 80 mm and 1D vs 2D scanner explanations are useful.
- **Business-fit:** the CTA promises "منظومة متكاملة معتمدة لدى مصلحة الضرائب". Confirm NGO actually supplies POS hardware/software that's ETA-registered (the site sells thermal paper). If not, re-aim it at thermal paper, cash drawers and counters.
- **Name things:** the e-receipt system (منظومة الإيصال الإلكتروني) and a link to the official provider list, plus typical printer families (Epson TM-T20, Xprinter) and roll lengths.
- Published today (2026-10-05).

### 53. print-file-preparation — 7.5/10
- **Good:** accurate and practical. It covers preflight, CMYK + FOGRA39/51, 3 mm bleed, safe zone, embedded fonts or outlines, PDF/X, and a strong pre-send checklist. Written for the buyer, not the designer, as promised.
- **Missing the Egypt-specific killer issue:** **Arabic text breaking.** Disconnected letters, reversed RTL, and lost ligatures in PDF export or non-ME versions of Illustrator/InDesign. It's the most common file problem in Egyptian print shops. Add a section.
- Register drift: colloquial "قبل ما تفتح / قبل ما ترسل" mixed into MSA prose.
- "الدقة تتراوح بين 72 و600" is confusing next to "300 is the standard". Drop the 72.

### 54. printing-terms — 7/10
- **Good:** buyer-oriented glossary (DPI, CMYK vs RGB, bleed, gsm, pt, Pantone, ISO 12647) with a cost-impact table and a quote checklist. The Egyptian-colloquial intro ("لما تتصل بأي مطبعة… هتسمع") is lively and fits the audience.
- **Not yet an Egyptian dictionary:** for a title promising "قاموس العميل", it misses the actual shop-floor words: كوشيه، بريستول، دوبلكس، طبع وش وضهر، سلوفان مط/لامع، تكسير، تدبيس دبوس/بشر. That's the vocabulary gap that confuses buyers.
- **Overlap:** CMYK, DPI and bleed are explained again in print-file-preparation (#53) and paper-weight-gsm (#51). Keep the definitions here and link out for the how-to.

### 55. professional-filing-archiving-system-guide — 6/10
- **Good:** an actionable five-step method (survey → sort → register → order → review), a central register with a sample row (FIN-2026-001…), quality criteria for archive boxes, and "you can't digitise chaos".
- **Not localised:** the retention FAQ says "حسب الأنظمة المعمول بها **في بلدك**". It's written for no country in particular. Give the Egyptian minimums (tax records about 5 years under Law 206/2020, commercial books 5 years under the Commercial Law, payroll and social-insurance records longer).
- Third member of the archiving cannibal trio (#41, #42). This one is the best of the three. Make it the hub and fold the others in.

### 56. ptz-camera-360-coverage-guide — 6.5/10
- **No intro at all:** the body opens straight on أهم النقاط, with no lead paragraph to answer the query or carry the keyword.
- **Copied-in irrelevant certifications:** GB/T28181 (a Chinese national standard), FIPS 140-2, NDAA and the US SAFETY Act read like a pasted US/China vendor spec sheet. None matters to an Egyptian SME buyer. Cut them, or keep only NDAA with a one-line "relevant to US-compliance multinationals".
- **Missing the key PTZ caveat:** a PTZ only sees where it's pointing. While it zooms on one spot, the rest of the yard is unwatched. Best practice is PTZ *plus* fixed cameras. The article says one PTZ "قد تغني عن عدة كاميرات", which is risky advice.
- One FAQ question is a plain `<p>` (lost heading), and the numbered blind-spot items are H2s.

### 57. reception-area-setup — 6/10 ⚠ broken anchors and unsupported stat
- **Broken anchor text, twice:** "راجع دليل [/office-supplies](/office-supplies)" and "مورد واحد ثابت مثل /office-supplies". The visible link text is the raw URL path, a placeholder that was never filled.
- **Unsupported number in key points:** "الورق مسؤول عن **نصف** أعطال ماكينة التصوير" appears only in the key-points card, with no support in the body. This breaks the key-points rule ("every number must appear in the body").
- **Leaked placeholders** (paper sizes, jams, storage): see the site-wide list.
- **Good:** a strong operational framing (reception as a working point, not décor), a solid factor table, and phased fit-out advice. The English "FAQ" heading was fixed in 647bd7d.

### 58. reduce-printing-costs-company — 5/10 ⚠ proofreading
- **Typos:**
  - "استهلاك الحبر و الروق" → الورق
  - "الطبتعة"
  - "فقط يكون سعر الحبر الأقل… غير اقتصادي" → فقد
  - "تحتاج الشركات على التعامل" → إلى
  - "وتنظم الاستخدام" → وتنظيم
- **Nine generic steps with no numbers.** Duplex can cut paper use by up to about half, and a mono vs colour cost-per-page example would help. No print-management tools are named (PaperCut, secure print release, user quotas on the MFP).
- Overlaps do-companies-still-need-paper-printing. FAQ added in 647bd7d.

### 59. remote-cctv-multi-branch-cairo — 7/10
- **Good:** a clear three-layer architecture (cameras, then per-branch DVR/NVR, then a central app), with upload speed (not download) as the real constraint. Per-branch-manager permissions, "recording continues locally when the internet drops", and separating the camera network from the office LAN are all correct and useful.
- **Name the tools buyers will meet:** Hik-Connect / DMSS apps, iVMS-4200 / HikCentral or SmartPSS for central viewing, and typical upload per camera (roughly 1–2 Mbps per 1080p sub-stream). Without names and numbers, "باقة إنترنت تجارية تناسب عدد الكاميرات" can't be acted on.
- **Framing quirk:** it assumes the owner "يقيم خارج القاهرة" and "كل رحلة إلى القاهرة". For a Cairo page that subtly frames the reader as an outsider. Use "can't be in every branch".
- SEO title 80 chars. Image added in 647bd7d.

### 60. safety-signage — 7/10
- **Good:** correct ISO 7010 colour and shape logic, photoluminescent exit signs, a material-by-location guide (aluminium / PVC / laminated card), reading distance driving size, and bilingual guidance. Practical and well structured.
- **Missing the actual inspector:** for exits and fire-equipment signs, Egyptian offices are inspected by **civil defence (الحماية المدنية)**, not only the Ministry of Labour. Name both. Egypt also has a **new Labour Law (14/2025)**, so update the generic "قانون العمل المصري" reference.
- **Overclaim:** "اتباع ISO 7010 شرط لقبول اللافتة من جهات التفتيش". Inspectors check that signage exists and is visible, not ISO conformance as such. Soften it to "the recognised reference".
- The "27 عامًا" boast again.

### 61. small-wireless-cameras-audio-video-guide — 5/10
- **Exact-match keyword stuffing:** "كاميرات مراقبة صغيرة جدًا بدون سلك بصوت وصورة" (seven words) appears about 12× verbatim, including in H2s. It reads machine-written.
- **Consumer topic on a B2B site:** nanny-cam and child monitoring. Recording audio of employees or domestic workers also has privacy implications under Egypt's PDPL 151/2020. Add a one-paragraph caution, especially since the post sells audio as a key feature.
- One section heading is a plain `<p>`. "Wireless" is never qualified: most of these still need power or recharging, so be explicit.
- Overlaps home-surveillance-cameras-via-mobile (#32) and types-of-surveillance-cameras (#64).

### 62. smart-office-solutions-reduce-office-supplies-costs — 7/10
- **Good:** a real procurement programme. Consumption audit (with a 100 vs 70 reams example), a main supplier plus a backup, the clauses an annual contract should contain, an issuance policy with departmental caps, KPIs (cost per employee, emergency orders, off-list purchases), and a six-phase rollout. Clean language. One of the more useful office-supplies posts.
- **Missing numbers:** typical savings ranges from consolidation or duplex defaults would make the business case.
- Overlaps how-to-choose-office-supplies-vendor and office-supplies-for-companies. It's the strongest of that cluster, so make it the hub.

### 63. thermal-receipt-paper-types-sizes-buying-guide — 7/10
- **Good:** the right checklist (width, outer diameter, core, length), "test a sample on your real printer before buying a carton", BPA-free explained without fear-mongering, and a monthly-consumption formula.
- **Explain the notation:** "80×80 / 57×40" means width × roll *diameter*, which many buyers don't know. Also give the common core sizes (12–13 mm).
- **Missing the Egypt-specific risk:** thermal print fades within months, while invoices must be kept for years for tax purposes. Advise scanning or photocopying thermal receipts that need retention.
- Consistent with pos-supplies (#52). Cross-link both ways.

### 64. types-of-surveillance-cameras — 5.5/10
- **Duplicated section:** "الكاميرات الصغيرة والمصغرة" appears **twice** as an H2 with overlapping content. Merge them.
- Home-oriented ("غرفة الأطفال", "مدخل فيلا") for a B2B site, and **incomplete as a "types" guide.** Turret, fisheye, thermal and ANPR/LPR cameras are all missing, and they matter most for business buyers.
- Overlaps best-security-cameras-for-business (#8) and small-wireless (#61). Should be the canonical "types" hub that #8 links into.

### 65. uniform-printing — 7/10
- **Good:** buyer-oriented and correct. Fabric decides technique (sublimation needs polyester), vector logo plus a Pantone reference, a 5-wash test before the full order, one order instead of five batches, and an ISO 105-C06 / ISO 13688 mention for industrial workwear.
- **Near-duplicate of corporate-tshirt-printing (#22):** same cost table and same advice. Differentiate it (uniform = polos, shirts, workwear, embroidery, PPE compliance; t-shirt = events and promo) or merge.
- **Keyword injection paragraph again** ("تكلفة طباعة البنرات… الكروت… البروشورات").

### 66. whiteboard-corkboard-office-school-sizes-installation — 5.5/10
- **The title promises sizes, and the article gives none.** "صغيرة / متوسطة / كبيرة" with no numbers. Add the standard sizes (60×90, 90×120, 100×150, 120×180, 120×240 cm) mapped to room size and audience distance.
- **Installation without numbers:** give a mounting height (e.g. bottom edge about 90 cm for adults, lower for children; lower edge about 70–80 cm in classrooms) and fixings by wall type (concrete vs drywall).
- **Keyword-prefix title:** "أدوات المكتب: دليل الوايت بورد…" (same pattern as #49). 2,352 words of padding. Only 1 internal link.
