// Copy for the 15-second call/WhatsApp popup (components/ContactPopup.astro).
//
// One entry per service intent, matched by longest path prefix, so
// /copiers/maintenance gets repair copy while /copiers/buy gets buying copy.
// Headlines name the visitor's situation; the sub-line says what we do about
// it and how small the next step is. Every promise here is one the site
// already makes elsewhere (free consultation, custom quote, 24h urgent
// maintenance response, reply within minutes in working hours, free AC
// sizing, since 1999, all of Egypt). Don't add new promises without the owner.
//
// `primary` picks the big button: 'call' for breakdowns (they want a person
// now), 'wa' for buying/quotes (they want to send specs at their own pace).
// Outside working hours the component forces WhatsApp to primary anyway.

export interface PopupCopy {
  /** Stable key, sent with tracking events so copy can be compared. */
  section: string;
  headline: string;
  sub: string;
  /** Pre-filled WhatsApp text, worded as the customer would say it. */
  waMessage: string;
  primary: 'wa' | 'call';
}

type Entry = Omit<PopupCopy, 'section'>;

const COPY: Record<string, Entry> = {
  'copiers-maintenance': {
    headline: 'ماكينة التصوير واقفة أو بتطلع الورق مشوّه؟',
    sub: 'ابعتلنا صورة العطل على واتساب وفني متخصص يقولك المشكلة والتكلفة قبل أي زيارة.',
    waMessage: 'مرحبًا، عندي عطل في ماكينة التصوير ومحتاج أعرف تكلفة الصيانة',
    primary: 'call',
  },
  'copiers-buy': {
    headline: 'بتدور على ماكينة تصوير تناسب شغل مكتبك؟',
    sub: 'قولنا عدد النسخ في الشهر ونرشحلك الأنسب مع عرض سعر مخصص.',
    waMessage: 'مرحبًا، محتاج ترشيح وعرض سعر لماكينة تصوير لمكتبي',
    primary: 'wa',
  },
  'copiers-cartridges': {
    headline: 'الحبر خلص والشغل مستني؟',
    sub: 'ابعت موديل الطابعة أو الماكينة ونأكدلك المتاح والسعر.',
    waMessage: 'مرحبًا، محتاج حبر/كارتريدج وهبعتلكم موديل الطابعة',
    primary: 'wa',
  },
  'ac-maintenance': {
    headline: 'التكييف مش بيبرّد أو محتاج شحن فريون؟',
    sub: 'كلمنا ونحددلك ميعاد صيانة، والطلبات الطارئة بنستجيب لها خلال 24 ساعة.',
    waMessage: 'مرحبًا، التكييف عندي محتاج صيانة وعايز أحجز ميعاد',
    primary: 'call',
  },
  'ac-installation': {
    headline: 'اشتريت تكييف ومحتاج تركيب؟',
    sub: 'فنيين متخصصين يركبوه صح من أول مرة. كلمنا ونحددلك ميعاد.',
    waMessage: 'مرحبًا، محتاج تركيب تكييف وعايز أحجز ميعاد',
    primary: 'call',
  },
  'ac-buy': {
    headline: 'محتار تختار تكييف كام حصان؟',
    sub: 'نحسبلك السعة المناسبة لمساحتك مجانًا قبل ما تشتري.',
    waMessage: 'مرحبًا، عايز أعرف التكييف المناسب لمساحة المكان عندي',
    primary: 'wa',
  },
  'cameras-maintenance': {
    headline: 'الكاميرات فصلت أو التسجيل وقف؟',
    sub: 'كلمنا وفني متخصص يحددلك المشكلة ويرجّع النظام يشتغل.',
    waMessage: 'مرحبًا، عندي مشكلة في نظام الكاميرات ومحتاج صيانة',
    primary: 'call',
  },
  'cameras': {
    headline: 'عايز تأمّن مكانك بكاميرات من غير ما تدفع في حاجة مش محتاجها؟',
    sub: 'ابعت مساحة المكان وعدد المداخل ونصمملك نظام مناسب مع عرض سعر.',
    waMessage: 'مرحبًا، محتاج نظام كاميرات مراقبة وعرض سعر',
    primary: 'wa',
  },
  'cash-machines': {
    headline: 'عايز ماكينة عد أو فرم مناسبة لحجم شغلك؟',
    sub: 'قولنا حجم التعامل اليومي ونرشحلك الموديل المناسب مع عرض سعر.',
    waMessage: 'مرحبًا، محتاج ترشيح وعرض سعر لماكينة عد نقود/فرم ورق',
    primary: 'wa',
  },
  'printing': {
    headline: 'عندك شغل طباعة ومحتاج سعر النهارده؟',
    sub: 'ابعت الكمية والمقاس على واتساب ويوصلك عرض السعر بسرعة.',
    waMessage: 'مرحبًا، محتاج عرض سعر طباعة وهبعتلكم الكمية والمقاس',
    primary: 'wa',
  },
  'office-supplies': {
    headline: 'محتاج توريد مستلزمات لمكتبك؟',
    sub: 'ابعت قايمة طلباتك ونرجعلك بعرض سعر للجملة، ونوصل لكل محافظات مصر.',
    waMessage: 'مرحبًا، محتاج عرض سعر توريد مستلزمات مكتبية',
    primary: 'wa',
  },
  'office-setup': {
    headline: 'بتجهز مكتب جديد ومش عارف تبدأ منين؟',
    sub: 'من ماكينات التصوير والكاميرات للتكييف والمستلزمات، نجهزلك كله مع عرض سعر واحد.',
    waMessage: 'مرحبًا، بجهز مكتب جديد ومحتاج عرض سعر تجهيز متكامل',
    primary: 'wa',
  },
  default: {
    headline: 'محتاج ماكينة تصوير، كاميرات، تكييف أو مستلزمات لشركتك؟',
    sub: 'قولنا محتاج إيه وفريقنا يرشحلك الأنسب مع عرض سعر مخصص. بنخدم شركات في كل مصر من 1999.',
    waMessage: 'مرحبًا، محتاج عرض سعر لشركتي',
    primary: 'wa',
  },
};

// Page-specific copy, matched on the exact path before the section
// prefixes below, so every service subpage and city page has its own
// headline. Pages not listed here fall back to their section's copy.
const PAGES: Record<string, Entry> = {
  '/about': { headline: 'من 1999 بنجهز مكاتب وشركات في كل مصر. نبدأ مع شركتك؟', sub: 'قولنا محتاج إيه وفريقنا يرشحلك الأنسب مع عرض سعر مخصص، واستشارتك مجانية.', waMessage: 'مرحبًا، عايز أتعامل معاكم وأعرف تفاصيل أكتر', primary: 'wa' },
  '/blog': { headline: 'محتاج رأي متخصص قبل ما تشتري؟', sub: 'ابعتلنا سؤالك على واتساب وفريقنا يرشحلك الأنسب لشغلك، واستشارتك مجانية.', waMessage: 'مرحبًا، محتاج استشارة قبل ما أشتري', primary: 'wa' },
  '/copiers': { headline: 'ماكينة تصوير جديدة، صيانة أو حبر؟', sub: 'قولنا محتاج إيه بالظبط ونرشحلك الحل المناسب لمكتبك مع عرض سعر مخصص.', waMessage: 'مرحبًا، محتاج استفسار عن ماكينات التصوير', primary: 'wa' },
  '/copiers/buy': { headline: 'بتدور على ماكينة تصوير تناسب شغل مكتبك؟', sub: 'ريكو، كانون، كيوسيرا أو توشيبا؟ قولنا عدد النسخ في الشهر ونرشحلك الأنسب مع عرض سعر مخصص.', waMessage: 'مرحبًا، محتاج ترشيح وعرض سعر لماكينة تصوير لمكتبي', primary: 'wa' },
  '/copiers/printers': { headline: 'محتار بين طابعة ليزر وإنكجيت؟', sub: 'قولنا هتطبع إيه وقد إيه في الشهر ونرشحلك الطابعة المناسبة مع عرض سعر.', waMessage: 'مرحبًا، محتاج ترشيح وعرض سعر لطابعة', primary: 'wa' },
  '/ac': { headline: 'محتاج تكييف جديد، تركيب أو صيانة؟', sub: 'قولنا مساحة المكان واحتياجك ونرشحلك الأنسب، والسعة المناسبة بنحسبهالك مجانًا.', waMessage: 'مرحبًا، محتاج استفسار عن التكييفات', primary: 'wa' },
  '/cameras/install': { headline: 'عايز تركّب كاميرات ومش عارف تحتاج كام كاميرا؟', sub: 'احجز معاينة مجانية وفريقنا يحددلك عدد الكاميرات وأماكنها مع عرض سعر.', waMessage: 'مرحبًا، عايز أحجز معاينة مجانية لتركيب كاميرات', primary: 'call' },
  '/cameras/ip-wifi': { headline: 'عايز تشوف بيتك أو شغلك من موبايلك في أي وقت؟', sub: 'قولنا المكان ونوع النت عندك ونرشحلك كاميرا الواي فاي أو IP المناسبة.', waMessage: 'مرحبًا، محتاج ترشيح كاميرا واي فاي أو IP', primary: 'wa' },
  '/cameras/dvr-nvr': { headline: 'محتار بين DVR و NVR لتسجيل الكاميرات؟', sub: 'قولنا عدد الكاميرات ومدة التسجيل اللي محتاجها ونرشحلك الجهاز والهارد المناسب.', waMessage: 'مرحبًا، محتاج ترشيح جهاز تسجيل DVR أو NVR', primary: 'wa' },
  '/cash-machines': { headline: 'ماكينة عد، فارم، كشف تزييف أو شريدر؟', sub: 'قولنا طبيعة شغلك ونرشحلك الماكينة المناسبة مع عرض سعر.', waMessage: 'مرحبًا، محتاج استفسار عن ماكينات عد النقود والفرم', primary: 'wa' },
  '/cash-machines/counting': { headline: 'بتعد فلوس كتير كل يوم وخايف من الغلط؟', sub: 'قولنا حجم التعامل اليومي ونرشحلك ماكينة العد المناسبة مع عرض سعر.', waMessage: 'مرحبًا، محتاج ترشيح وعرض سعر لماكينة عد نقود', primary: 'wa' },
  '/cash-machines/detector': { headline: 'خايف تستلم عملة مزيفة؟', sub: 'نرشحلك جهاز كشف التزييف المناسب لحجم شغلك مع عرض سعر.', waMessage: 'مرحبًا، محتاج جهاز كشف عملات مزيفة', primary: 'wa' },
  '/cash-machines/franking': { headline: 'محتاج ماكينة فارم وختم يدوي ولا كهربائي؟', sub: 'قولنا عدد المستندات اللي بتختمها يوميًا ونرشحلك الأنسب مع عرض سعر.', waMessage: 'مرحبًا، محتاج ماكينة فارم وختم', primary: 'wa' },
  '/cash-machines/shredder': { headline: 'عندك مستندات محتاج تتخلص منها بأمان؟', sub: 'قولنا حجم الورق اللي بتفرمه ونرشحلك الشريدر المناسب مع عرض سعر.', waMessage: 'مرحبًا، محتاج ماكينة تدمير مستندات (شريدر)', primary: 'wa' },
  '/printing/offset': { headline: 'عندك كمية طباعة كبيرة ومحتاج أحسن سعر للنسخة؟', sub: 'ابعت الكمية والمقاس ونوع الورق ويوصلك عرض سعر أوفست.', waMessage: 'مرحبًا، محتاج عرض سعر طباعة أوفست وهبعتلكم الكمية والمقاس', primary: 'wa' },
  '/printing/digital': { headline: 'محتاج طباعة مستعجلة؟', sub: 'الطباعة الرقمية بتبقى جاهزة في ساعات. ابعت الملف والكمية ويوصلك السعر.', waMessage: 'مرحبًا، محتاج طباعة رقمية مستعجلة', primary: 'wa' },
  '/printing/banners': { headline: 'محتاج بنر أو لافتة لمحلك أو معرضك؟', sub: 'ابعت المقاس ومكان التركيب ويوصلك عرض السعر.', waMessage: 'مرحبًا، محتاج عرض سعر بنر وهبعتلكم المقاس', primary: 'wa' },
  '/printing/business-cards': { headline: 'محتاج كروت شخصية تعمل انطباع من أول مرة؟', sub: 'ابعت التصميم أو قولنا فكرتك ويوصلك عرض سعر للكمية اللي محتاجها.', waMessage: 'مرحبًا، محتاج عرض سعر كروت شخصية', primary: 'wa' },
  '/printing/brochures': { headline: 'محتاج بروشورات أو فلايرات لشركتك؟', sub: 'قولنا الكمية والمقاس ونوع الطي، ونصممهالك ونطبعها مع عرض سعر.', waMessage: 'مرحبًا، محتاج عرض سعر بروشورات أو فلايرات', primary: 'wa' },
  '/printing/uv': { headline: 'عايز تطبع على خشب أو أكريليك أو أي خامة؟', sub: 'ابعت الخامة والمقاس والتصميم ويوصلك عرض سعر طباعة UV.', waMessage: 'مرحبًا، محتاج عرض سعر طباعة UV', primary: 'wa' },
  '/printing/gifts': { headline: 'محتاج هدايا دعائية عليها لوجو شركتك؟', sub: 'أكواب وأقلام وغيرها. قولنا الكمية والمناسبة ويوصلك عرض السعر.', waMessage: 'مرحبًا، محتاج عرض سعر هدايا دعائية بلوجو الشركة', primary: 'wa' },
  '/office-supplies/a4-paper': { headline: 'ورق A4 بيخلص منك بسرعة؟', sub: 'قولنا الكمية والوزن اللي بتستخدمه ونرجعلك بسعر الجملة، ونوصل لكل محافظات مصر.', waMessage: 'مرحبًا، محتاج عرض سعر ورق A4 بالجملة', primary: 'wa' },
  '/office-supplies/batteries-usb': { headline: 'محتاج بطاريات أو فلاشات USB لمكتبك؟', sub: 'ابعت الأنواع والكميات ونرجعلك بعرض سعر.', waMessage: 'مرحبًا، محتاج عرض سعر بطاريات أو فلاشات USB', primary: 'wa' },
  '/office-supplies/binding': { headline: 'محتاج دباسات ومشابك ولاصق لمكتبك؟', sub: 'ابعت قايمة طلباتك ونرجعلك بعرض سعر للجملة.', waMessage: 'مرحبًا، محتاج عرض سعر أدوات ربط ودباسة', primary: 'wa' },
  '/office-supplies/envelopes': { headline: 'محتاج أظرف أو كراتين تغليف بكميات؟', sub: 'قولنا المقاسات والكمية ونرجعلك بعرض سعر.', waMessage: 'مرحبًا، محتاج عرض سعر أظرف أو كراتين تغليف', primary: 'wa' },
  '/office-supplies/files': { headline: 'ورق المكتب متبعتر ومحتاج يترتب؟', sub: 'ملفات وبوكسات أرشفة بكل المقاسات. ابعت الكمية ونرجعلك بعرض سعر.', waMessage: 'مرحبًا، محتاج عرض سعر ملفات أرشفة', primary: 'wa' },
  '/office-supplies/notebooks': { headline: 'محتاج دفاتر ومفكرات لفريقك أو مدرستك؟', sub: 'قولنا الأنواع والكمية ونرجعلك بعرض سعر للجملة.', waMessage: 'مرحبًا، محتاج عرض سعر دفاتر ومفكرات', primary: 'wa' },
  '/office-supplies/pens': { headline: 'محتاج أقلام بكميات لمكتبك أو مدرستك؟', sub: 'قولنا الأنواع والكمية ونرجعلك بسعر الجملة.', waMessage: 'مرحبًا، محتاج عرض سعر أقلام بالجملة', primary: 'wa' },
  '/office-supplies/stamps': { headline: 'محتاج ختم لشركتك؟', sub: 'ابعت التصميم أو بيانات الختم ويوصلك السعر.', waMessage: 'مرحبًا، محتاج ختم وهبعتلكم البيانات', primary: 'wa' },
  '/office-supplies/sticky-notes': { headline: 'محتاج بوست إت أو ستيكرات تسميات؟', sub: 'ابعت الأنواع والكميات ونرجعلك بعرض سعر.', waMessage: 'مرحبًا، محتاج عرض سعر بوست إت أو تسميات', primary: 'wa' },
  '/office-supplies/thermal': { headline: 'رولات الكاشير بتخلص منك؟', sub: 'قولنا مقاس الرول والكمية الشهرية ونرجعلك بسعر الجملة.', waMessage: 'مرحبًا، محتاج عرض سعر رولات كاشير وورق حراري', primary: 'wa' },
  '/office-supplies/whiteboards': { headline: 'محتاج وايت بورد لمكتب أو قاعة اجتماعات؟', sub: 'قولنا المقاس والعدد ونرجعلك بعرض سعر.', waMessage: 'مرحبًا، محتاج عرض سعر وايت بورد', primary: 'wa' },
  '/cairo': { headline: 'محتاج خدمات لمكتبك أو شركتك في القاهرة؟', sub: 'ماكينات تصوير، كاميرات، تكييف، طباعة ومستلزمات. قولنا محتاج إيه ويوصلك عرض سعر.', waMessage: 'مرحبًا، شركتي في القاهرة ومحتاج عرض سعر', primary: 'wa' },
  '/alexandria': { headline: 'محتاج خدمات لمكتبك أو شركتك في الإسكندرية؟', sub: 'ماكينات تصوير، كاميرات، تكييف، طباعة ومستلزمات. قولنا محتاج إيه ويوصلك عرض سعر.', waMessage: 'مرحبًا، شركتي في الإسكندرية ومحتاج عرض سعر', primary: 'wa' },
  '/cairo/copiers': { headline: 'محتاج ماكينة تصوير أو صيانة لمكتبك في القاهرة؟', sub: 'شراء أو إيجار أو عقد صيانة لماكينات شركتك. قولنا احتياجك ويوصلك عرض سعر.', waMessage: 'مرحبًا، مكتبي في القاهرة ومحتاج ماكينة تصوير', primary: 'wa' },
  '/alexandria/copiers': { headline: 'محتاج ماكينة تصوير أو صيانة لمكتبك في الإسكندرية؟', sub: 'شراء أو تقسيط أو إيجار، وصيانة وأحبار. قولنا احتياجك ويوصلك عرض سعر.', waMessage: 'مرحبًا، مكتبي في الإسكندرية ومحتاج ماكينة تصوير', primary: 'wa' },
  '/cairo/cameras': { headline: 'عايز تأمّن شركتك أو فرعك في القاهرة بكاميرات؟', sub: 'معاينة مجانية، وتشوف كل فروعك من موبايلك. قولنا المكان ويوصلك عرض سعر.', waMessage: 'مرحبًا، عايز معاينة لتركيب كاميرات في القاهرة', primary: 'wa' },
  '/alexandria/cameras': { headline: 'عايز تأمّن مكانك في الإسكندرية بكاميرات مراقبة؟', sub: 'كاميرات IP وأنظمة DVR و NVR بضمان. قولنا المكان ويوصلك عرض سعر.', waMessage: 'مرحبًا، محتاج كاميرات مراقبة في الإسكندرية', primary: 'wa' },
  '/cairo/ac': { headline: 'محتاج تكييف أو صيانة لمكتبك في القاهرة؟', sub: 'شراء وتركيب وصيانة وشحن فريون، وعقود صيانة سنوية للشركات.', waMessage: 'مرحبًا، مكتبي في القاهرة ومحتاج تكييف أو صيانة', primary: 'wa' },
  '/alexandria/ac': { headline: 'محتاج تكييف أو صيانة في الإسكندرية؟', sub: 'توريد وتركيب سبليت ومركزي، وصيانة وشحن فريون لكل الماركات.', waMessage: 'مرحبًا، محتاج تكييف أو صيانة في الإسكندرية', primary: 'wa' },
  '/cairo/cash-machines': { headline: 'محتاج ماكينة عد نقود لشركتك في القاهرة؟', sub: 'جلوري أو LG أو كاسيدا؟ قولنا حجم شغلك ونرشحلك الأنسب مع عرض سعر.', waMessage: 'مرحبًا، شركتي في القاهرة ومحتاج ماكينة عد نقود', primary: 'wa' },
  '/alexandria/cash-machines': { headline: 'محتاج ماكينة عد نقود في الإسكندرية؟', sub: 'ماكينات عد وكشف تزييف بضمان وصيانة. قولنا حجم شغلك ويوصلك عرض سعر.', waMessage: 'مرحبًا، محتاج ماكينة عد نقود في الإسكندرية', primary: 'wa' },
  '/cairo/office-supplies': { headline: 'محتاج توريد مستلزمات لشركتك في القاهرة؟', sub: 'توريد بالجملة بعقود دورية وفاتورة ضريبية. ابعت قايمة طلباتك ويوصلك عرض سعر.', waMessage: 'مرحبًا، شركتي في القاهرة ومحتاج توريد مستلزمات مكتبية', primary: 'wa' },
  '/alexandria/office-supplies': { headline: 'محتاج توريد مستلزمات لشركتك في الإسكندرية؟', sub: 'جملة وتوريد دوري للشركات بفاتورة ضريبية. ابعت قايمة طلباتك ويوصلك عرض سعر.', waMessage: 'مرحبًا، شركتي في الإسكندرية ومحتاج توريد مستلزمات مكتبية', primary: 'wa' },
  '/cairo/printing': { headline: 'عندك شغل طباعة في القاهرة ومحتاج سعر؟', sub: 'كروت وبروشورات وبنرات وهدايا دعائية، وبروفة قبل الطباعة. ابعت التفاصيل ويوصلك عرض سعر.', waMessage: 'مرحبًا، محتاج عرض سعر طباعة في القاهرة', primary: 'wa' },
  '/alexandria/printing': { headline: 'عندك شغل طباعة في الإسكندرية ومحتاج سعر؟', sub: 'أوفست وديجيتال، كروت وفلايرات وبنرات. ابعت التفاصيل ويوصلك عرض سعر.', waMessage: 'مرحبًا، محتاج عرض سعر طباعة في الإسكندرية', primary: 'wa' },
  '/cairo/office-setup': { headline: 'بتفتح فرع أو بتجهز مكتب جديد في القاهرة؟', sub: 'تكييف وكاميرات وماكينات ومستلزمات في مشروع واحد بعرض سعر واحد.', waMessage: 'مرحبًا، بجهز مكتب في القاهرة ومحتاج عرض سعر تجهيز متكامل', primary: 'wa' },
  '/alexandria/office-setup': { headline: 'بتجهز مكتب أو محل جديد في الإسكندرية؟', sub: 'تكييف وكاميرات وماكينات ومستلزمات في مشروع واحد بعرض سعر واحد.', waMessage: 'مرحبًا، بجهز مكتب في الإسكندرية ومحتاج عرض سعر تجهيز متكامل', primary: 'wa' },
};

// Longest prefix wins. Paths are slash-less service paths, after the geo
// prefix (/cairo, /alexandria) has been stripped.
const PREFIXES: [string, string][] = [
  ['/copiers/maintenance', 'copiers-maintenance'],
  ['/copiers/cartridges', 'copiers-cartridges'],
  ['/copiers', 'copiers-buy'],
  ['/ac/maintenance', 'ac-maintenance'],
  ['/ac/installation', 'ac-installation'],
  ['/ac', 'ac-buy'],
  ['/cameras/maintenance', 'cameras-maintenance'],
  ['/cameras', 'cameras'],
  ['/cash-machines', 'cash-machines'],
  ['/printing', 'printing'],
  ['/office-supplies', 'office-supplies'],
  ['/office-setup', 'office-setup'],
];

// Blog category name (as stored on posts, see BLOG_CATEGORIES in blog-list.ts)
// and category-listing slug -> copy key.
const BLOG_CATEGORY_KEYS: Record<string, string> = {
  'مستلزمات مكتبية': 'office-supplies',
  'الطباعة': 'printing',
  'ماكينات التصوير': 'copiers-buy',
  'كاميرات المراقبة': 'cameras',
  'ماكينات عد النقود وفرم الورق': 'cash-machines',
  'تكييفات': 'ac-buy',
};
// Repair-intent posts ("صيانة تكييف قبل الصيف") get the maintenance copy of
// their category instead of the buying copy.
const BLOG_MAINTENANCE_KEYS: Record<string, string> = {
  'ماكينات التصوير': 'copiers-maintenance',
  'كاميرات المراقبة': 'cameras-maintenance',
  'تكييفات': 'ac-maintenance',
};
const MAINTENANCE_TITLE = /صيانة|تنظيف|عطل|أعطال|اعطال|تصليح|إصلاح|اصلاح|مشاكل|مشكلة/;
const BLOG_SLUG_KEYS: Record<string, string> = {
  'office-supplies': 'office-supplies',
  printing: 'printing',
  copiers: 'copiers-buy',
  cameras: 'cameras',
  'cash-machines': 'cash-machines',
  ac: 'ac-buy',
};

const GEO_PREFIX = /^\/(cairo|alexandria)(?=\/|$)/;

function entry(key: string): PopupCopy {
  return { section: key, ...(COPY[key] ?? COPY.default) };
}

/** Section key for a page entry: '/cash-machines/counting' -> 'cash-machines-counting'. */
const pageKey = (path: string) => path.slice(1).replace(/\//g, '-');

function keyForPath(path: string): string {
  const p = path.replace(GEO_PREFIX, '') || '/';
  for (const [prefix, key] of PREFIXES) {
    if (p === prefix || p.startsWith(prefix + '/')) return key;
  }
  const blogCat = /^\/blog\/category\/([^/]+)/.exec(p);
  if (blogCat && BLOG_SLUG_KEYS[blogCat[1]]) return BLOG_SLUG_KEYS[blogCat[1]];
  return 'default';
}

export interface PopupContext {
  /** Blog post category name, e.g. 'كاميرات المراقبة'. */
  category?: string;
  /** Blog post title, quoted in the WhatsApp message. */
  title?: string;
}

/**
 * Resolve the popup copy for a page. Blog posts pass their category and
 * title: they get the copy of the service they're about (repair copy for
 * repair articles), and the WhatsApp text names the article.
 */
export function resolvePopupCopy(pathname: string, ctx: PopupContext = {}): PopupCopy {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (ctx.title) {
    const cat = ctx.category ?? '';
    const repair = MAINTENANCE_TITLE.test(ctx.title) && BLOG_MAINTENANCE_KEYS[cat];
    const base = entry(repair || BLOG_CATEGORY_KEYS[cat] || 'default');
    // Same headline as the service the article is about; the WhatsApp text
    // also names the article so sales knows what the visitor just read.
    return {
      ...base,
      section: `blog:${base.section}`,
      waMessage: base.waMessage.replace(/^مرحبًا، /, `مرحبًا، قريت مقال "${ctx.title.slice(0, 90)}"، و`),
    };
  }
  if (PAGES[path]) return { section: pageKey(path), ...PAGES[path] };
  return entry(keyForPath(path));
}
