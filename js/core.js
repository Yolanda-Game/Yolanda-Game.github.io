  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const p2 = n => String(n).padStart(2,'0'); 
  const esc = s => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  /* 详情层"点空白关闭"的例外名单（项目层 / 作品层共用） */
  const NO_CLOSE = '.dl-share, .lg-sw, .pn, .post, .shot-box, .shot-bar, .shot-note, .media-video-carousel, .media-gallery, .media-caption, .pj-side, .vid, .pl, .vl, .pj-ttl, .pj-ttl-en, .pj-role, .pj-sub, a, iframe';

  /* ============ 中英切换 ============
     只切详情页（日志 / 项目 / 作品）里的正文与标题；界面文案（"项目详情""关闭""共 N 件"）不动。
     规则：该条有英文正文（md_en）才允许切换；英文缺哪一段就回退中文，不会留空。 */
  let LANG = 'cn';                                     /* 用户选的语言（全局，点一次管全站详情页） */
  let SHOWN = 'cn';                                    /* 当前这条实际显示的语言：没英文的条目落回 'cn' */
  /* 「有英文版」= 这条有英文正文（正文没写英文就不允许切换；标题/角色单独填了也不算） */
  const hasEN = s => !!(s && (s.md_en || s.html_en));
  const pick  = (cn, en) => (SHOWN === 'en' && en) ? en : cn;

  /* 打开某条之前，先算一次"这条该显示什么语言" */
  function langFor(s){ SHOWN = (LANG === 'en' && hasEN(s)) ? 'en' : 'cn'; }

  /* 标题：中文时 主=中文/副=英文；英文时 主=英文/副=中文；没英文就都保持中文 */
  function setTtl(main, sub, cn, en){
    const useEn = SHOWN === 'en' && en;
    const txt = useEn ? en : cn;
    main.textContent = txt || '';
    main.style.fontFamily = /[\u3400-\u9fff]/.test(txt || '') ? 'var(--font-cn)' : 'var(--font)';
    if (sub){ const s = useEn ? cn : en; sub.textContent = s || ''; sub.hidden = !s; }
  }

  /* 「中 / EN」两段的高亮对齐当前语言；没有英文版就置灰、点不动 */
  function langSw(btn, ok){
    if (!btn) return;
    btn.querySelector('.cn').classList.toggle('on', SHOWN === 'cn');
    btn.querySelector('.en').classList.toggle('on', SHOWN === 'en');
    btn.disabled = !ok;
  }

  /* 三个切换键都调这一个函数 */
  function setLang(l){
    LANG = l;
    try{ renderBlogs(); }
    catch(err){ console.error('[切换] 日志重画失败：', err); }
    try{ if (pjLayer.classList.contains('on')) pjLangPaint(); }
    catch(err){ console.error('[切换] 项目详情重画失败：', err); }
    try{ if (wkLayer.classList.contains('on')) wkLangPaint(); }
    catch(err){ console.error('[切换] 作品详情重画失败：', err); }
  }
