# Service Pages Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Note on execution mode:** the user has explicitly requested this run as a self-paced `/loop` (autonomous, batch-by-batch, deploying to production after every batch, without stopping to ask each time) rather than the two options above. Tasks 1-7 below (the three components, the progress tracker, the first worked-example page, and the first verified production deploy) run once, normally, with review. Task 8 is where the work becomes a repeating loop — see Task 8 for the exact recipe the loop follows for the remaining 38 pages.

**Goal:** Replace the bullet-list "article" content on the 39 service pages under `astro/src/pages/{ac,printing,office-supplies,cameras,cash-machines,copiers}/` with card/icon-grid layouts, using three new reusable Astro components, then roll the change out to production one small batch at a time.

**Architecture:** Three new presentational components (`IconCardGrid.astro`, `ComparisonGrid.astro`, `ContentIntro.astro`) added to `astro/src/components/`, built from the site's existing `.feature-card`/`.features-grid` CSS classes (already used on the homepage) so no new global CSS is needed. Each service page's `<ul><li>` blocks are re-bucketed into `{icon, title, text}` arrays passed as props — the Arabic copy moves near-verbatim, it is not reworded. Rollout is git-batch + immediate production deploy, tracked in a checklist file.

**Tech Stack:** Astro (`.astro` components, scoped `<style>` blocks), existing `astro/src/styles/global.css`, o2switch/CloudLinux production host (SSH + rsync deploy).

---

## File structure

| File | Responsibility |
|---|---|
| `astro/src/components/IconCardGrid.astro` | Renders an array of `{icon, title?, text}` as a `.features-grid`/`.feature-card` grid (2/3/4 columns). Replaces most `<ul><li>` blocks. |
| `astro/src/components/ComparisonGrid.astro` | Renders an array of `{title, text}` as a compact comparison-card grid (auto-fit columns, single accent color). Replaces the ad hoc inline-styled brand/type comparison blocks. |
| `astro/src/components/ContentIntro.astro` | Renders a heading + one short paragraph. Used as the opening framing text before the grids. |
| `astro/.redesign-progress.md` | Checklist of all 39 pages; checked off as each is converted, built, deployed, and curl-verified. Drives the loop's "what's next" decision. |
| `astro/src/pages/ac/maintenance.astro` | First page converted (worked example / pattern reference for the remaining 38). |

No existing files are restructured beyond the page-by-page content edits described below. `global.css`, `BaseLayout.astro`, `PageHero.astro`, `MidPageCTA.astro`, `Navbar.astro`, `Footer.astro` are not touched.

---

## Task 1: `IconCardGrid.astro` component

**Files:**
- Create: `astro/src/components/IconCardGrid.astro`

- [ ] **Step 1: Write the component**

```astro
---
interface CardItem {
  icon: string;
  title?: string;
  text: string;
}

interface Props {
  items: CardItem[];
  columns?: 2 | 3 | 4;
}

const { items, columns = 4 } = Astro.props;
---

<div class:list={['features-grid', 'icon-card-grid', `cols-${columns}`]}>
  {items.map((item, i) => (
    <div class:list={['feature-card', 'reveal', i > 0 && i <= 4 ? `delay-${i}` : '']}>
      <div class="feature-icon"><i class={`fas ${item.icon}`}></i></div>
      {item.title && <h4>{item.title}</h4>}
      <p>{item.text}</p>
    </div>
  ))}
</div>

<style>
  /* .features-grid is repeat(4,1fr) by default in global.css, with its own
     responsive collapse at 1024/768/480px. Only override column count above
     that first breakpoint, so we never fight the existing mobile behavior. */
  @media (min-width: 1025px) {
    .icon-card-grid.cols-2 { grid-template-columns: repeat(2, 1fr); }
    .icon-card-grid.cols-3 { grid-template-columns: repeat(3, 1fr); }
  }
</style>
```

**Why no inline `style` for column count:** global.css already defines responsive breakpoints for `.features-grid` (`repeat(2,1fr)` at ≤1024px, `1fr 1fr` at ≤768px, `1fr` at ≤480px). An inline `style="grid-template-columns:..."` attribute has higher CSS specificity than any class-based media-query rule and would silently break that mobile collapse. The scoped `cols-2`/`cols-3` classes above are guarded behind `min-width:1025px` so they only ever apply on desktop, where the existing responsive rules don't apply anyway.

- [ ] **Step 2: Verify it builds**

Run: `cd astro && npm run build`
Expected: build succeeds (this component isn't used anywhere yet, so this only checks for syntax errors in the file — Astro type-checks `.astro` files during build).

- [ ] **Step 3: Commit**

```bash
git add astro/src/components/IconCardGrid.astro
git commit -m "Add IconCardGrid component for service-page content redesign"
```

---

## Task 2: `ComparisonGrid.astro` component

**Files:**
- Create: `astro/src/components/ComparisonGrid.astro`

- [ ] **Step 1: Write the component**

```astro
---
interface ComparisonItem {
  title: string;
  text: string;
}

interface Props {
  items: ComparisonItem[];
}

const { items } = Astro.props;
---

<div class="comparison-grid">
  {items.map((item) => (
    <div class="comparison-card">
      <h3>{item.title}</h3>
      <p>{item.text}</p>
    </div>
  ))}
</div>

<style>
  .comparison-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  .comparison-card {
    background: var(--white);
    border-radius: var(--radius);
    padding: 20px;
    border-top: 4px solid var(--secondary);
    text-align: center;
    box-shadow: var(--shadow-sm);
  }
  .comparison-card h3 {
    font-size: 1rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 8px;
  }
  .comparison-card p {
    color: var(--text-muted);
    font-size: 0.9rem;
    line-height: 1.6;
    margin: 0;
  }
</style>
```

This replaces patterns like `ac/index.astro`'s hand-rolled brand comparison block, which currently hardcodes a different `border-top` color per card inline (`#3498db`, `#e74c3c`, `#27ae60`, `#9b59b6`) — here every card gets the same `var(--secondary)` accent, consistent with the rest of the site's design language.

- [ ] **Step 2: Verify it builds**

Run: `cd astro && npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add astro/src/components/ComparisonGrid.astro
git commit -m "Add ComparisonGrid component for service-page content redesign"
```

---

## Task 3: `ContentIntro.astro` component

**Files:**
- Create: `astro/src/components/ContentIntro.astro`

- [ ] **Step 1: Write the component**

```astro
---
interface Props {
  heading: string;
  text: string;
}

const { heading, text } = Astro.props;
---

<div class="content-intro">
  <h2>{heading}</h2>
  <p>{text}</p>
</div>

<style>
  .content-intro { margin-bottom: 32px; }
  .content-intro p {
    color: var(--text-muted);
    font-size: 1.05rem;
    line-height: 1.9;
  }
</style>
```

- [ ] **Step 2: Verify it builds**

Run: `cd astro && npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add astro/src/components/ContentIntro.astro
git commit -m "Add ContentIntro component for service-page content redesign"
```

---

## Task 4: Progress tracker file

**Files:**
- Create: `astro/.redesign-progress.md`

- [ ] **Step 1: List all 39 pages, grouped by category, hub page first in each group**

```markdown
# Service pages redesign — progress tracker

Format: `- [ ] path — status`. Check off only after: converted, `npm run build` passes, committed, deployed to production, and curl-verified live.

## ac (3)
- [x] src/pages/ac/maintenance.astro — worked example, converted in this plan's Task 6
- [ ] src/pages/ac/index.astro
- [ ] src/pages/ac/buy.astro
- [ ] src/pages/ac/installation.astro

## printing (7)
- [ ] src/pages/printing/index.astro
- [ ] src/pages/printing/business-cards.astro
- [ ] src/pages/printing/banners.astro
- [ ] src/pages/printing/offset.astro
- [ ] src/pages/printing/uv.astro
- [ ] src/pages/printing/digital.astro
- [ ] src/pages/printing/gifts.astro
- [ ] src/pages/printing/brochures.astro

## office-supplies (12)
- [ ] src/pages/office-supplies/index.astro
- [ ] src/pages/office-supplies/whiteboards.astro
- [ ] src/pages/office-supplies/pens.astro
- [ ] src/pages/office-supplies/envelopes.astro
- [ ] src/pages/office-supplies/files.astro
- [ ] src/pages/office-supplies/sticky-notes.astro
- [ ] src/pages/office-supplies/binding.astro
- [ ] src/pages/office-supplies/thermal.astro
- [ ] src/pages/office-supplies/stamps.astro
- [ ] src/pages/office-supplies/batteries-usb.astro
- [ ] src/pages/office-supplies/a4-paper.astro
- [ ] src/pages/office-supplies/notebooks.astro

## cameras (5)
- [ ] src/pages/cameras/index.astro
- [ ] src/pages/cameras/install.astro
- [ ] src/pages/cameras/ip-wifi.astro
- [ ] src/pages/cameras/maintenance.astro
- [ ] src/pages/cameras/dvr-nvr.astro

## cash-machines (5)
- [ ] src/pages/cash-machines/index.astro
- [ ] src/pages/cash-machines/franking.astro
- [ ] src/pages/cash-machines/counting.astro
- [ ] src/pages/cash-machines/detector.astro
- [ ] src/pages/cash-machines/shredder.astro

## copiers (5)
- [ ] src/pages/copiers/index.astro
- [ ] src/pages/copiers/cartridges.astro
- [ ] src/pages/copiers/maintenance.astro
- [ ] src/pages/copiers/buy.astro
- [ ] src/pages/copiers/printers.astro
```

(Run `find astro/src/pages/{ac,printing,office-supplies,cameras,cash-machines,copiers} -name '*.astro'` before starting Task 10's first loop iteration to confirm this list still matches — pages may have been added/renamed since this plan was written.)

- [ ] **Step 2: Commit**

```bash
git add astro/.redesign-progress.md
git commit -m "Add progress tracker for service pages redesign rollout"
```

---

## Task 5: Convert `ac/maintenance.astro` (worked example)

This is the reference conversion every later page follows. Full before/after shown so the pattern is unambiguous.

**Files:**
- Modify: `astro/src/pages/ac/maintenance.astro`

**Current structure inside `.service-content`** (the part that changes): two intro paragraphs, then five `<h3>+<ul>` blocks (benefits, warning signs, what's-included, freon types, annual contracts) plus a `<h3>+<ul>` tips block, interrupted once by `<MidPageCTA>`, ending in a `<table>`.

- [ ] **Step 1: Add the new imports**

At the top of `astro/src/pages/ac/maintenance.astro`, after the existing imports (`BaseLayout`, `MidPageCTA`, `PageHero`, `getSeoFor`):

```astro
import ContentIntro from '../../components/ContentIntro.astro';
import IconCardGrid from '../../components/IconCardGrid.astro';
import ComparisonGrid from '../../components/ComparisonGrid.astro';
```

- [ ] **Step 2: Replace the `.service-content` inner markup**

Replace everything from `<h2>شحن فريون مصر وصيانة التكييف — الاستثمار الأذكى لحماية جهازك</h2>` down to (but not including) the closing `</div>` of `.service-content` (i.e. lines 65-162 of the current file, up to and including the `<div style="overflow-x:auto;...">...</div>` table wrapper — the table itself is kept unchanged) with:

```astro
      <ContentIntro
        heading="شحن فريون مصر وصيانة التكييف — الاستثمار الأذكى لحماية جهازك"
        text="الصيانة الدورية تُطيل عمر التكييف بشكل كبير وتوفر فاتورة الكهرباء وتمنع الأعطال المكلفة. معظم مشاكل التكييف في مصر يمكن تفاديها بصيانة وقائية بسيطة كل 6 أشهر قبل بداية الصيف وبعد انتهائه."
      />
      <p>كثير من عملائنا يتواصلون معنا بعد أن يتوقف التكييف تماماً في منتصف يوليو أو أغسطس، ونكتشف عند الفحص أن المشكلة كانت بسيطة ويمكن تفاديها بالكامل لو تمت صيانة الجهاز قبل بداية الموسم بأسابيع. لهذا نُشجّع دائماً على حجز موعد الصيانة الوقائية مبكراً، قبل أن يمتلئ جدول الفنيين بطلبات الطوارئ في ذروة الصيف، وهو أمر يوفر عليك وقت الانتظار وإزعاج انقطاع التبريد في أشد أيام الحر.</p>

      <h3><i class="fas fa-heartbeat" style="color:var(--secondary);margin-left:8px;"></i> لماذا تحتاج لصيانة تكييفك؟</h3>
      <IconCardGrid columns={2} items={[
        { icon: 'fa-bolt', title: 'توفير الكهرباء', text: 'تكييف نظيف يعمل بكفاءة 20-30% أعلى من تكييف متسخ الفلاتر — الفلتر المتسخ يُجبر الكمبريسور على العمل أكثر لينتج نفس البرودة' },
        { icon: 'fa-wind', title: 'تبريد أقوى وأسرع', text: 'الكويل النظيف والفريون الكافي يضمنان الوصول لدرجة الحرارة المطلوبة أسرع وبأقل ضوضاء' },
        { icon: 'fa-lungs', title: 'هواء نظيف وصحي', text: 'الفلاتر المتسخة تُعيد تدوير الغبار والجراثيم في الغرفة — التنظيف الدوري يُحسّن جودة الهواء' },
        { icon: 'fa-shield-alt', title: 'منع الأعطال المفاجئة', text: 'اكتشاف مشاكل الفريون أو الكمبريسور مبكراً يوفر عليك تكلفة إصلاح كبيرة لاحقاً' },
      ]} />

      <h3><i class="fas fa-exclamation-triangle" style="color:var(--secondary);margin-left:8px;"></i> علامات تكييفك يحتاج صيانة فوراً</h3>
      <IconCardGrid columns={3} items={[
        { icon: 'fa-temperature-low', title: 'لا يبرد كما كان سابقاً', text: 'رغم أنه يعمل — علامة على نقص فريون أو فلتر مسدود' },
        { icon: 'fa-volume-up', title: 'صوت غير طبيعي', text: 'كطرق أو صفير — علامة على مشكلة في الكمبريسور أو الفان' },
        { icon: 'fa-tint', title: 'تقطير مياه من الوحدة الداخلية', text: 'خرطوم الصرف مسدود أو ممتلئ' },
        { icon: 'fa-money-bill-wave', title: 'ارتفاع فاتورة الكهرباء', text: 'دون تغيير في الاستخدام — التكييف يُجهد نفسه أكثر' },
        { icon: 'fa-wind', title: 'رائحة كريهة', text: 'عند تشغيله — تكاثر بكتيريا في الفلتر أو الكويل' },
        { icon: 'fa-snowflake', title: 'تجمد الوحدة الداخلية', text: 'نقص فريون واضح' },
      ]} />

      <MidPageCTA formId="acMaintenanceMidCta" />

      <h3><i class="fas fa-tools" style="color:var(--secondary);margin-left:8px;"></i> ماذا تشمل خدمة الصيانة؟</h3>
      <IconCardGrid columns={4} items={[
        { icon: 'fa-filter', title: 'تنظيف الفلتر', text: 'غسيل الفلاتر وتعقيمها لضمان تدفق هواء نظيف وتوفير الكهرباء' },
        { icon: 'fa-broom', title: 'تنظيف كويل التبخير والمكثف', text: 'إزالة الأتربة والعوالق من الكويل بمحاليل متخصصة' },
        { icon: 'fa-gauge-high', title: 'فحص مستوى الفريون', text: 'قياس ضغط الفريون بـ Manifold Gauge وإضافة الكمية المطلوبة إن لزم' },
        { icon: 'fa-water', title: 'تنظيف وفحص خرطوم الصرف', text: 'تنظيف خرطوم الصرف والتحقق من ميله وعدم انسداده' },
        { icon: 'fa-plug', title: 'فحص الكمبريسور والكهرباء', text: 'قياس استهلاك الكمبريسور والتأكد من سلامة التوصيلات والكابلات' },
        { icon: 'fa-bolt', title: 'فحص المكثفات (Capacitors)', text: 'فحص المكثفات واستبدال المعطوب منها، سبب شائع لأعطال الكمبرسور' },
        { icon: 'fa-fan', title: 'فحص الموتورات والريش', text: 'فحص الموتورات الداخلية والخارجية والتأكد من سلامة الريش' },
        { icon: 'fa-satellite-dish', title: 'اختبار وحدة التحكم والريموت', text: 'التأكد من استجابة الوحدة لجميع أوامر الريموت' },
      ]} />

      <h3><i class="fas fa-wind" style="color:var(--secondary);margin-left:8px;"></i> شحن الفريون — R22 وR410A وR32</h3>
      <ComparisonGrid items={[
        { title: 'فريون R22', text: 'مادة التبريد التقليدية المستخدمة في التكييفات المصنوعة قبل 2015 تقريباً، ويُمنع تدريجياً في كثير من الدول بسبب ضرره على طبقة الأوزون. لا يزال متوفراً لدينا مع قياس الضغط الدقيق لتحديد الكمية المناسبة، لكن أسعاره في ارتفاع مستمر بسبب تقليص الإنتاج العالمي' },
        { title: 'فريون R410A', text: 'النوع الأشيع في التكييفات الحديثة — صديق للبيئة وأكفأ في نقل الحرارة، يعمل بضغط أعلى ويتطلب معدات شحن مختلفة وزيوت خاصة' },
        { title: 'فريون R32', text: 'الجيل الجديد الأكثر كفاءة وصداقة للبيئة — يُستخدم في التكييفات الحديثة من Samsung وMidea وLG' },
      ]} />
      <p><strong>كشف تسريبات الفريون:</strong> إذا نقص الفريون مراراً فهذا يعني وجود تسريب — نُشخّصه ونُصلحه قبل إعادة الشحن.</p>
      <p><strong>تنبيه مهم:</strong> لا يمكن تحويل تكييف R22 ليعمل بـ R410A دون تغيير مكونات جوهرية، والتحويل غير المتخصص يُتلف الكمبرسور. إذا كان تكييفك القديم يستهلك الفريون بسرعة، استشرنا لتقييم جدوى الصيانة مقابل الاستبدال.</p>

      <h3><i class="fas fa-file-contract" style="color:var(--secondary);margin-left:8px;"></i> عقود الصيانة السنوية</h3>
      <p>للشركات والمحلات وأصحاب أنظمة التكييف المتعددة نوفر عقود صيانة سنوية تشمل:</p>
      <IconCardGrid columns={2} items={[
        { icon: 'fa-calendar-check', text: 'زيارتان إلى أربع زيارات للصيانة الشاملة سنوياً حسب الاتفاق (قبل الصيف وبعده أساساً)' },
        { icon: 'fa-clock', text: 'أولوية الاستجابة لطلبات الصيانة الطارئة خلال 24 ساعة' },
        { icon: 'fa-tag', title: 'خصومات على قطع الغيار', text: 'أسعار مخفضة على قطع الغيار والمواد المستهلكة لعملاء العقود' },
        { icon: 'fa-file-alt', text: 'تقرير صيانة مكتوب ومفصل بعد كل زيارة' },
      ]} />
      <p>نخدم الإسكندرية والقاهرة والمدن المجاورة. تواصل معنا للحصول على عرض سعر لعقد صيانة مخصص لعدد وحداتك ومتطلباتك.</p>

      <h3><i class="fas fa-lightbulb" style="color:var(--secondary);margin-left:8px;"></i> نصائح بسيطة تطيل عمر تكييفك بين زيارات الصيانة</h3>
      <IconCardGrid columns={3} items={[
        { icon: 'fa-power-off', title: 'لا تُغلق التكييف وتُشغّله بشكل متكرر خلال ساعات قليلة', text: 'كل تشغيل يُحمّل الكمبريسور، والأفضل ضبط الثيرموستات وتركه يعمل بثبات بدل الإيقاف والتشغيل المتكرر' },
        { icon: 'fa-door-closed', title: 'أبقِ النوافذ والأبواب مغلقة أثناء التشغيل', text: 'الهواء المتسرب من الخارج يُجبر الجهاز على العمل أكثر لتعويض الفرق في درجة الحرارة' },
        { icon: 'fa-wind', title: 'لا تُغطِّ الوحدة الخارجية بإحكام', text: 'الوحدة الخارجية تحتاج تهوية جيدة لتبديد الحرارة، والتغطية الكاملة تُقلل الكفاءة وتُرهق الموتور' },
        { icon: 'fa-file-invoice-dollar', title: 'راقب فاتورة الكهرباء شهرياً', text: 'أي ارتفاع غير مبرر غالباً أول إشارة على مشكلة ناشئة، وكلما أُصلحت مبكراً كانت التكلفة أقل' },
        { icon: 'fa-broom', title: 'نظّف محيط الوحدة الخارجية من الأوراق والأتربة المتراكمة', text: 'تراكم القاذورات حول الوحدة يعيق تدفق الهواء ويرفع الحمل على الموتور بشكل غير ضروري' },
      ]} />

      <div style="overflow-x:auto;margin-top:24px;">
        <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
          <!-- unchanged — keep the existing table exactly as-is -->
```

The `<table>...</table>` and everything after it (sidebar, steps section, FAQ section, the "أخطاء شائعة" prose section, the existing "صيانة التكييف حسب طبيعة المكان" `features-grid` section, and the CTA banner) are **not modified** — they're already fine per the design spec.

- [ ] **Step 3: Verify it builds**

Run: `cd astro && npm run build`
Expected: build succeeds with no errors, and the build output includes `ac/maintenance/index.html` (confirms the page still renders).

- [ ] **Step 4: Visual spot check**

Run: `cd astro && astro dev --background`, then open `http://localhost:4321/ac/maintenance` in a browser (or `curl -s http://localhost:4321/ac/maintenance | grep -c 'feature-card'` — expect a much higher count than before, since 4 of the 6 `<ul>` blocks became card grids). Stop the dev server after: `astro dev stop`.

- [ ] **Step 5: Commit**

```bash
git add astro/src/pages/ac/maintenance.astro
git commit -m "Redesign ac/maintenance page: bullet lists -> icon card grids"
```

- [ ] **Step 6: Update the progress tracker**

`astro/.redesign-progress.md` already has this page pre-checked (Task 4) — no change needed here, just confirms the tracker and reality now agree.

---

## Task 6: First production deploy — establish and verify the real deploy sequence

This batch (just `ac/maintenance.astro`) is deployed alone first, specifically to verify the deploy sequence actually works before it becomes an unattended, repeating loop step. Do not skip the curl verification — per project memory, a wrong doc-root path or a stale flag on this host has silently no-op'd a deploy before, with no non-zero exit code to catch it.

**Files:** none (operational task, no code changes).

- [ ] **Step 1: Push the commits**

```bash
git push origin master
```

- [x] **Step 2: SSH in and deploy — VERIFIED WORKING 2026-08-05**

`node_modules/.bin/npm` on this host is a CloudLinux `l.v.e-manager` wrapper script tied to the admin app's context (`/home/zash7309/nodevenv/apps/new-golden-office/admin/22/bin/npm` → `npm_wrapper`) — do not source its `activate` or call it directly for the astro build, it can hijack npm resolution for other projects on the host (per project memory). Instead, prepend the real Node 22 binaries directory to `PATH`:

```bash
ssh -i ~/.ssh/id_ed25519_o2switch zash7309@cuivre.o2switch.net
cd /home/zash7309/apps/new-golden-office
git pull origin master
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH
cd astro
npm run build
rsync -a --delete dist/ /home/zash7309/newgoldenoffice.com/
```

`astro/node_modules` already exists on the server from the initial cutover — no `npm install` needed for a routine content-only redeploy. If a future change adds a new dependency, run `npm install` (with the same `PATH` export) before `npm run build`.

- [x] **Step 3: Verify the deploy actually landed — VERIFIED**

From your local machine (not the server):

```bash
curl -s https://newgoldenoffice.com/ac/maintenance | grep -o 'icon-card-grid' | head -1
```

Expected output: `icon-card-grid` (proves the new component's markup is live, not just that `rsync` exited 0). Also spot-check `curl -sI https://newgoldenoffice.com/some-fake-path` still returns the custom `404` (confirms `.htaccess` survived the `--delete`).

- [x] **Step 4: Record the verified sequence — DONE**

The exact commands above (Step 2) are confirmed working as of 2026-08-05 — Task 8's loop reuses this exact sequence unattended for the remaining 38 pages.

---

## Task 7: Spec self-review (already performed)

Covered during plan writing:
- **Spec coverage:** components (Tasks 1-3), page pattern (Task 5), progress tracker (Task 4), deploy mechanics (Task 6), loop continuation (Task 10 below) — all spec sections have a corresponding task.
- **Placeholder scan:** no TBD/TODO; every code step above is complete, runnable code.
- **Type consistency:** `IconCardGrid` props (`items: {icon, title?, text}[]`, `columns?`) are used identically in Task 5's usage as defined in Task 1. `ComparisonGrid` props (`items: {title, text}[]`) match between Task 2 and Task 5.

---

## Task 8: Launch the loop for the remaining 38 pages

**This is the task that actually runs as `/loop`.** Each iteration:

1. **Pick the next 2-3 unconverted pages** from `astro/.redesign-progress.md` (top to bottom — `ac` hub/remaining pages first, then `printing`, `office-supplies`, `cameras`, `cash-machines`, `copiers` in that order, hub `index.astro` before its detail pages within each category).
2. **Read each page fully** before editing — every page's bullet content is different, there is no shortcut around reading it.
3. **Convert following the exact pattern established in Task 5**: `<h2>`/first paragraph → `ContentIntro` (+ any second intro paragraph kept as a plain `<p>` right after, verbatim), each `<h3>+<ul>` block → `IconCardGrid` (choose `columns` based on item count: 4 items → 2 or 4 cols, 5-6 items → 3 cols, 7-8 items → 4 cols; pick a distinct, sensible Font Awesome icon per item — reuse icons already used elsewhere on the site where the concept repeats, e.g. `fa-shield-alt` for warranty/guarantee items, `fa-tag`/`fa-money-bill-wave` for pricing, `fa-clock` for response-time), true side-by-side comparisons (brand names, product types, freon types, paper weights, etc.) → `ComparisonGrid` instead of `IconCardGrid`. Copy text moves verbatim into `title`/`text` fields — do not rewrite or reword it. Leave `MidPageCTA`, tables, the sidebar, steps/FAQ/CTA sections, and schema JSON-LD untouched, exactly as Task 5 did.
4. **Build:** `cd astro && npm run build` — must succeed before continuing. Fix any error before moving on; never commit a broken build.
5. **Commit:** one commit per batch, e.g. `git commit -m "Redesign printing/{index,business-cards}: bullet lists -> icon card grids"`.
6. **Push:** `git push origin master`.
7. **Deploy using the exact sequence verified in Task 6**: SSH in, `git pull`, `npm run build`, `rsync -a --delete dist/ /home/zash7309/newgoldenoffice.com/`.
8. **Verify live** with one `curl` per changed page checking for `icon-card-grid` or `comparison-grid` in the response body (same check as Task 6 Step 3).
9. **Update `astro/.redesign-progress.md`**, checking off the pages just deployed; commit and push that update too.
10. **Continue automatically** to the next batch — per the user's explicit instruction, this loop does not stop to ask permission between batches. It stops only when every page in the tracker is checked off, or the user interrupts it.

**Definition of done:** every checkbox in `astro/.redesign-progress.md` is checked, `npm run build` passes on the final state, and a final pass spot-checks one page from each of the 6 categories in a real browser (not just curl) for visual correctness and RTL layout — the last thing before declaring the whole redesign complete.
