  /* 兼容桥接层：把外部日志数据暂时转为隐藏 DOM，再交由既有解析器处理。
     v1.9 统一内容模型之前不要删除。 */
  if (!Array.isArray(window.YOLANDA_LOGS)) throw new Error('data/logs.js 未加载');
  const logStore = $('#logStore');
  window.YOLANDA_LOGS.forEach(entry => {
    const article = document.createElement('article');
    article.id = entry.id;
    const cn = document.createElement('script');
    cn.type = 'text/markdown';
    cn.textContent = entry.markdown || '';
    article.appendChild(cn);
    if (entry.markdown_en) {
      const en = document.createElement('script');
      en.type = 'text/markdown';
      en.dataset.lang = 'en';
      en.textContent = entry.markdown_en;
      article.appendChild(en);
    }
    logStore.appendChild(article);
  });

  /* ============ 日志数据 ============ */
  const DEV = location.protocol === 'file:' || location.hash === '#dev';
  const posts = $$('#logStore article').map(a => {
    /* 中文正文 = 第一个没标 data-lang 的 markdown 块；
       英文正文（可选）= 第二个 <script type="text/markdown" data-lang="en">，里面只写正文 */
    const mdEl = a.querySelector('script[type="text/markdown"]:not([data-lang])');
    const enEl = a.querySelector('script[type="text/markdown"][data-lang="en"]');
    let meta = {}, html = '', html_en = '', date = '', time = '', tag = '进度',
        title = '', title_en = '', draft = false;
    if (mdEl){
      const fm = readFM(mdEl.textContent);
      meta = fm.meta;
      date = meta.date || ''; time = meta.time || '';
      tag = meta.tag || tag; title = meta.title || '';
      title_en = meta.title_en || '';          /* 英文标题写在中文那块的属性块里 */
      draft = /^(true|1|yes)$/i.test(meta.draft || '');
      html = md(fm.body);
    }
    if (enEl) html_en = md(enEl.textContent);
    if (!title){ const h = a.querySelector('h3'); title = h ? h.textContent.trim() : '(无标题)'; }
    const [y,m,d] = (date || '1970-01-01').split('-').map(Number);
    return {
      id: a.id || ('log-' + date + (time ? '-' + time.replace(':','') : '')),
      y, m, d, time, tag, title, title_en, html, html_en, draft,
      sortKey: date + ' ' + (time || '00:00'),
      dstr: y + '.' + p2(m) + '.' + p2(d) + (time ? ' ' + time : ''),
      mdstr: p2(m) + '.' + p2(d)
    };
    })
      .filter(p => p.y && (!p.draft || DEV))
      .sort((a, b) => b.sortKey.localeCompare(a.sortKey));

  const PREF = ['进度','拆解','技术','说明'];
  const TAGS = PREF.filter(t => posts.some(p => p.tag === t))
    .concat(Array.from(new Set(posts.map(p => p.tag))).filter(t => PREF.indexOf(t) < 0));
  let filter = null, selId = null;
  const openY = new Set(), openM = new Set();
