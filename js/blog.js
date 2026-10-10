  /* ============ 开发日志（三个实例共用状态） ============ */
  const blogs = $$('#world section.devlog');

  function blogDefaults(){
    if (!posts.length) return;
    const n = posts[0];
    openY.clear(); openM.clear();
    openY.add(n.y); openM.add(n.y + '-' + p2(n.m));
    selId = n.id;
  }

  function renderBlogs(){ blogs.forEach(renderBlog); }

  function renderBlog(sec){
    const q = s => sec.querySelector(s);
    const L = filter ? posts.filter(p => p.tag === filter) : posts;
    q('.dlCount').textContent = '共 ' + L.length + ' 条';
    q('.dlLast').textContent  = L.length ? '更新于 ' + L[0].dstr : '暂无日志';

    if (!L.some(p => p.id === selId)) selId = L.length ? L[0].id : null;
    const sel = posts.find(p => p.id === selId) || null;
    langFor(sel);

    // 标签行
    const fl = q('.dl-floor'); fl.replaceChildren();
    const mk = (t, label) => {
      const s = document.createElement('span');
      s.textContent = label;
      if ((t || null) === filter) s.className = 'on';
      s.onclick = () => { filter = t; selId = null; blogDefaults(); renderBlogs(); };
      return s;
    };
    fl.appendChild(mk(null, '#全部'));
    TAGS.forEach(t => fl.appendChild(mk(t, '#' + t)));

    // 年 → 月 → 帖
    const ys = [];
    L.forEach(p => {
      let g = ys.find(v => v.y === p.y);
      if (!g){ g = { y:p.y, months:[] }; ys.push(g); }
      let mm = g.months.find(v => v.m === p.m);
      if (!mm){ mm = { m:p.m, items:[] }; g.months.push(mm); }
      mm.items.push(p);
    });
    const frag = document.createDocumentFragment();
    ys.forEach(g => {
      const yk = g.y, yOpen = openY.has(yk);
      const total = g.months.reduce((n,x) => n + x.items.length, 0);
      const yr = document.createElement('div');
      yr.className = 'gr y' + (yOpen ? ' open' : '');
      yr.innerHTML = '<span class="ar">' + (yOpen ? '▾' : '▸') + '</span>' +
                     '<span class="g">' + g.y + '</span><span class="c">' + total + '</span>';
      yr.onclick = () => { yOpen ? openY.delete(yk) : openY.add(yk); renderBlogs(); };
      frag.appendChild(yr);
      if (!yOpen) return;
      const kids = document.createElement('div'); kids.className = 'kids';
      g.months.forEach(mm => {
        const mk2 = g.y + '-' + p2(mm.m), mOpen = openM.has(mk2);
        const mr = document.createElement('div');
        mr.className = 'gr mo' + (mOpen ? ' open' : '');
        mr.innerHTML = '<span class="ar">' + (mOpen ? '▾' : '▸') + '</span>' +
          '<span class="g">' + g.y + '.' + p2(mm.m) + '</span><span class="c">' + mm.items.length + '</span>';
        mr.onclick = () => { mOpen ? openM.delete(mk2) : openM.add(mk2); renderBlogs(); };
        kids.appendChild(mr);
        if (!mOpen) return;
        const pk = document.createElement('div'); pk.className = 'kids posts';
        mm.items.forEach(p => {
          const b = document.createElement('button');
          b.className = 'it' + (p.id === selId ? ' on' : '');
          b.innerHTML = '<span class="n"></span><span class="d">' + p.mdstr + '</span>' +
                        '<span class="t">' + esc(p.title) + '</span>';
          b.onclick = () => {
            selId = p.id;
            openY.add(p.y); openM.add(p.y + '-' + p2(p.m));
            renderBlogs();
          };
          pk.appendChild(b);
        });
        kids.appendChild(pk);
      });
      frag.appendChild(kids);
    });
    q('.dl-idx').replaceChildren(frag);

    // 右栏
    const pcol = q('.dl-pcol'), pbody = q('.dl-pbody');
    if (!sel){
      q('.dlDate').textContent = ''; q('.dlTag').textContent = '';
      q('.dl-pttl').textContent = ''; q('.dl-body').innerHTML = '';
      q('.dl-pmeta').hidden = true;            /* 没有日志时：日期·标签·复制链接·中/EN 整行收起 */
      langSw(q('[data-lang-sw]'), false);        /* 没选中条目：切换键置灰 */
    } else {
      q('.dl-pmeta').hidden = false;
      q('.dlDate').textContent = sel.dstr;
      q('.dlTag').textContent = '#' + sel.tag;
      setTtl(q('.dl-pttl'), null, sel.title, sel.title_en);
      q('.dl-body').innerHTML = pick(sel.html, sel.html_en);
      langSw(q('[data-lang-sw]'), hasEN(sel));
      pcol.scrollTop = 0;
      fixMedia(q('.dl-body'));
      const on = q('.dl-idx .it.on'), box = q('.dl-idx');
      if (on && box){
        const a = on.getBoundingClientRect(), b = box.getBoundingClientRect();
        if (a.top < b.top) box.scrollTop -= (b.top - a.top) + 10;
        else if (a.bottom > b.bottom) box.scrollTop += (a.bottom - b.bottom) + 10;
      }
    }
    const more = pcol.scrollHeight - pcol.clientHeight - pcol.scrollTop > 4;
    pbody.classList.toggle('more', more);
  }

  function fixMedia(root){
    root.querySelectorAll('img').forEach(img => {
      const swap = () => {
        const d = document.createElement('div');
        d.className = 'phbox';
        d.textContent = '图片未找到：' + (img.getAttribute('src') || '');
        img.replaceWith(d);
      };
      img.onerror = swap;
      if (img.complete && img.naturalWidth === 0) swap();
    });
    root.querySelectorAll('.vid').forEach(v => {
      v.onclick = () => {
        const src = v.dataset.src || '';
        let url = src;
        if (/^bilibili:/i.test(src))   url = 'https://player.bilibili.com/player.html?bvid=' + src.split(':')[1] + '&autoplay=1';
        else if (/^youku:/i.test(src)) url = 'https://player.youku.com/embed/' + src.split(':')[1];
        if (!/^https?:/i.test(url)) return;
        const f = document.createElement('iframe');
        f.src = url; f.allowFullscreen = true; f.setAttribute('frameborder','0');
        v.replaceChildren(f);
      };
    });
  }

  blogs.forEach(sec => {
    const q = s => sec.querySelector(s);
    const idx = q('.dl-idx'), pcol = q('.dl-pcol'), pbody = q('.dl-pbody');
    // 滚轮：谁在鼠标下就滚谁，滚不动时才翻页
    [idx, pcol].forEach(el => {
      el.addEventListener('wheel', e => {
        const atTop = el.scrollTop <= 0;
        const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
        const down = e.deltaY > 0;
        if ((down && !atEnd) || (!down && !atTop)) e.stopPropagation();
      }, { passive:true });
    });
    pcol.addEventListener('scroll', () => {
      pbody.classList.toggle('more',
        pcol.scrollHeight - pcol.clientHeight - pcol.scrollTop > 4);
    }, { passive:true });
    // 中英切换（在"复制链接"右边）
    q('[data-lang-sw]').addEventListener('click', () => setLang(LANG === 'cn' ? 'en' : 'cn'));
    // 复制链接
    const sh = q('.dl-share');
    sh.addEventListener('click', async () => {
      if (!selId) return;
      const url = location.origin + location.pathname + '#' + selId;
      let done = false;
      try { await navigator.clipboard.writeText(url); done = true; }
      catch(e){
        try {
          const ta = document.createElement('textarea');
          ta.value = url; ta.style.position='fixed'; ta.style.opacity='0';
          document.body.appendChild(ta); ta.select();
          done = document.execCommand('copy'); ta.remove();
        } catch(e2){ done = false; }
      }
      sh.textContent = done ? '已复制 ✓' : '复制失败';
      sh.classList.toggle('ok', done);
      clearTimeout(sh._t);
      sh._t = setTimeout(() => { sh.textContent = '复制链接'; sh.classList.remove('ok'); }, 1700);
    });
  });
