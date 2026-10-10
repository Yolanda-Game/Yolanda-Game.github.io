  /* ============ 关于（三个实例共用同一状态） ============ */
  const abouts = $$('#world section.about');
  /* 页头计数一律从数据里数出来，加条目不用改任何数字；AB_GAP 必须与 CSS .blocks/.bcol 的 20px 一致 */
  const AB_MIN = 72, AB_GAP = 20;
  let abOpen = null;
  const abLangOn = new Set(); 

  function abNeed(blk){
    const cap = blk.querySelector('.cap'), bd = blk.querySelector('.bd');
    const cs = getComputedStyle(blk);
    const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    bd.style.maxHeight = 'none';
    const h = cap.getBoundingClientRect().height + 14 + bd.getBoundingClientRect().height;
    bd.style.maxHeight = '';
    return pad + h;
  }

  function abLayout(){
    if (innerWidth < 1080) return;          /* 手机上不需要分配高度，交给 CSS */
    abouts.forEach(sec => {
      sec.querySelectorAll('.bcol').forEach(col => {
        const kids = Array.from(col.children);
        const avail = col.clientHeight - AB_GAP * (kids.length - 1);
        if (avail <= 0) return;
        const sum = kids.reduce((s, k) => s + (+k.dataset.n), 0);
        const base = new Map();
        kids.forEach(k => base.set(k, avail * (+k.dataset.n) / sum));
        const open = kids.find(k => k.classList.contains('on'));
        if (!open){
          kids.forEach(k => k.style.height = Math.max(AB_MIN, base.get(k)) + 'px');
          return;
        }
        const others = kids.filter(k => k !== open);
        const osum = others.reduce((s,k) => s + base.get(k), 0) || 1;
        let openH = Math.max(AB_MIN, abNeed(open));
        openH = Math.min(openH, Math.max(AB_MIN, avail - AB_MIN * others.length));
        const rest = avail - openH;
        const hs = others.map(k => Math.max(AB_MIN, rest * base.get(k) / osum));
        const used = hs.reduce((a, b) => a + b, 0);
        if (used > rest) openH = Math.max(AB_MIN, avail - used);
        kids.forEach(k => {
          const i = others.indexOf(k);
          k.style.height = (i < 0 ? openH : hs[i]) + 'px';
        });
      });
    });
  }

  /* 计数一律从内容里数出来，不手写：往 .bd 里加一行 tag，计数和块高自动跟着变 */
  function abCount(){
    abouts.forEach(sec => {
      sec.querySelectorAll('.bk').forEach(b => {
        const n = b.querySelectorAll('.bd .t').length;
        b.dataset.n = n;                       /* 块高靠它分配 */
        b.querySelector('.n').textContent = n; /* 块面上的数字 */
      });
    });
  }

  /* 窄屏时 about 内容能滚：轮到它滚的时候，别让滚轮去翻页（和日志页同一个套路） */
  function abWheelGuard(){
    abouts.forEach(sec => {
      const ab = sec.querySelector('.ab-body');
      if (!ab || ab.__guard) return;
      ab.__guard = 1;
      ab.addEventListener('wheel', e => {
        if (ab.scrollHeight <= ab.clientHeight + 1) return;
        const atTop = ab.scrollTop <= 0, atBot = ab.scrollTop + ab.clientHeight >= ab.scrollHeight - 1;
        if (!((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBot))) e.stopPropagation();
      }, { passive:false });
    });
  }

  /* 所有实心按钮：指针压在上面时，边缘提示不抢点击（避免误切页） */
  $$('.ab-btn').forEach(b => b.classList.add('edge-safe'));

  function abApply(){
    abWheelGuard();
    abouts.forEach(sec => {
      sec.querySelectorAll('.bk').forEach(b => {
        const on = b.dataset.id === abOpen;
        b.classList.toggle('on', on);
        b.setAttribute('aria-expanded', on ? 'true' : 'false');
        b.querySelectorAll('.bd .t').forEach(t => {
          t.classList.toggle('on', abLangOn.has(t.dataset.k));
        });
      });
      sec.querySelector('.abNLog').textContent  = posts.length + ' 条日志';
      sec.querySelector('.abNProj').textContent = PJ.length + ' 个项目';
      sec.querySelector('.abNWork').textContent = WK.length + ' 件作品';
    });
    abLayout();
  }

  /* 关于页交互：点标签 = 切中英文（不收起）；点块 = 展开/收起；点「联系我」= 开全屏层 */
  abouts.forEach(sec => {
    sec.querySelectorAll('.bk').forEach(b => {
      b.querySelectorAll('.bd .t').forEach((t, ti) => { t.dataset.k = b.dataset.id + ':' + ti; });
      b.addEventListener('click', e => {
        const t = e.target.closest('.t');        /* 点标签：切中英文，不收起 */
        if (t){
          const k = t.dataset.k;
          abLangOn.has(k) ? abLangOn.delete(k) : abLangOn.add(k);
          abApply();
          return;
        }
        abOpen = (abOpen === b.dataset.id) ? null : b.dataset.id;   /* 点空白：展开/收起 */
        abApply();
      });
    });
    sec.querySelectorAll('.ab-cta').forEach(b =>
      b.addEventListener('click', () => abLayer.classList.add('on')));
  });

  $('#abClose').addEventListener('click', () => abLayer.classList.remove('on'));

  /* 邮箱字面量在 HTML 里不出现，只写在这里；按钮文字由它生成，改一处就够 */
  const MAIL = ['jjjiexiansen', 'foxmail.com'];
  const mb = $('#abMail'), mbTxt = MAIL.join('@');
  mb.textContent = mbTxt;
  mb.addEventListener('click', async () => {
    const addr = MAIL[0] + '@' + MAIL[1];
    let ok = false;
    try { await navigator.clipboard.writeText(addr); ok = true; }
    catch(e){
      const ta = document.createElement('textarea');
      ta.value = addr; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch(e2){ ok = false; }
      ta.remove();
    }
    mb.textContent = ok ? '已复制 ✓' : '复制失败';
    mb.classList.toggle('ok', ok);
    clearTimeout(mb._t);
    mb._t = setTimeout(() => { mb.textContent = mbTxt; mb.classList.remove('ok'); }, 1700);
  });

  addEventListener('resize', abLayout);

  /* 单条链接：#log-2026-09-24 → 打开日志层并选中 */
  function fromHash(){
    const h = location.hash.replace('#','');
    if (!h) return;
    const p = posts.find(x => x.id === h || (x.id + '-1') === h || (x.id + '-2') === h);
    if (!p) return;
    selId = p.id;
    openY.clear(); openM.clear();
    openY.add(p.y); openM.add(p.y + '-' + p2(p.m));
    renderBlogs();
    go(0, -1);
  }
  addEventListener('hashchange', fromHash);
