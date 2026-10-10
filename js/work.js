  const WK = window.WORKS || [];
  let WKPER = innerWidth < 1180 ? 6 : 8;  /* 作品每页数量：宽屏 8 件，窄屏 6 件；窗口跨越断点时同步更新 */
  const WKPREF = ['关卡设计','任务设计','系统设计','叙事设计','UI/UX'];
  const WKSORTED = WK.slice().sort((a, b) => endYM(b.date).localeCompare(endYM(a.date)));  /* 结束年月倒序，新→旧 */
  const WKTAGS = WKPREF.filter(t => WK.some(w => (w.tags||[]).includes(t)))
    .concat([...new Set(WK.flatMap(w => (w.tags||[])))].filter(t => WKPREF.indexOf(t) < 0));

  const wkSec = $('#wkSec'), wkLayer = $('#wkLayer');
  let wkFilter = null, wkPage = 1, wkCur = null, wkShot = 0;

  // 当窗口宽度跨过布局断点时，重新计算每页数量
  addEventListener('resize', () => {
    const nextPer = innerWidth < 1180 ? 6 : 8;

    if (nextPer !== WKPER) {
      WKPER = nextPer;
      wkPage = 1;
      wkRender();
    }
  });

  const wkList = () => wkFilter ? WKSORTED.filter(w => (w.tags||[]).includes(wkFilter)) : WKSORTED;
  /* 截图：没写 shots 就去猜 images/<id>/01.jpg（跟封面同一张） */
  const wkShots = w => {
    const L = (w.shots || []).map(s => typeof s === 'string'
      ? { src:s, note:'' } : { src:(s && s.src) || '', note:(s && s.note) || '' });
    return L.length ? L : [{ src:'images/' + w.id + '/01.jpg', note:'' }];
  };
  const wkPages = () => Math.max(1, Math.ceil(wkList().length / WKPER));
  const wkWork = () => WK.find(w => w.id === wkCur) || null;

  function wkRender(){
    const L = wkList(), pages = wkPages();
    if (wkPage > pages) wkPage = pages;

    $('#wCount').textContent = '共 ' + L.length + ' 件';

    const fl = $('#wFloor'); fl.replaceChildren();
    const mk = (t, label) => {
      const s = document.createElement('span');
      s.textContent = label;
      if ((t || null) === wkFilter) s.className = 'on';
      s.onclick = () => { wkFilter = t; wkPage = 1; wkRender(); };
      return s;
    };
    fl.appendChild(mk(null, '#全部'));
    WKTAGS.forEach(t => fl.appendChild(mk(t, '#' + t)));

    const start = (wkPage - 1) * WKPER;
    const g = $('#wGrid');
    g.innerHTML = L.slice(start, start + WKPER).map((w, i) => {
      const first = wkShots(w)[0] || { src:'' };
      const k = (w.tags||[]).concat(w.proj ? [w.proj] : []).join(' · ');
      return `<button class="wk-card" data-id="${w.id}" style="--d:${(i * 0.04).toFixed(2)}s">
        <span class="wk-thumb"><img src="${esc(first.src)}" alt="" loading="lazy" decoding="async"></span>
        <span class="wk-foot"><span class="wk-t" title="${esc(w.title)}">${esc(w.title)}</span><span class="wk-y">${esc(endYM(w.date))}</span></span>
        <span class="wk-k">${esc(k)}</span>
      </button>`;
    }).join('');
    fixMedia(g);
    g.querySelectorAll('.wk-card').forEach(c => c.onclick = () => wkOpen(c.dataset.id));

    $('#wPgIdx').textContent = p2(wkPage) + ' / ' + p2(pages);
    $('#wPgPrev').classList.toggle('off', pages < 2);
    $('#wPgNext').classList.toggle('off', pages < 2);
  }
  function wkGoPage(d){
    const pages = wkPages();
    if (pages < 2) return;
    wkPage = (wkPage - 1 + d + pages) % pages + 1;
    wkRender();
  }
  function wkPaintShot(){
    const w = wkWork(), L = wkShots(w);
    if (wkShot >= L.length) wkShot = 0;
    const sh = L[wkShot] || { src:'', note:'' };
    const box = $('#wShotBox'); box.replaceChildren();
    const img = new Image(); img.alt = '';
    img.src = sh.src;
    img.onerror = () => { box.innerHTML = '<div class="phbox">图片未找到：' + esc(sh.src) + '</div>'; };
    box.appendChild(img);
    $('#wShotNote').textContent = mediaCaption(sh, 'image');
    $('#wShotNote').hidden = !mediaCaption(sh, 'image');
    $('#wShotIdx').textContent = p2(wkShot+1) + ' / ' + p2(L.length);
  }
  /* 作品详情里跟语言有关的字段，只在这一处画（切语言时复用） */
  function wkLangPaint(){
    const w = wkWork(); if (!w) return;
    langFor(w);
    setTtl($('#wName'), $('#wNameEn'), w.title, w.title_en);
    const sp = pick(w.spec, w.spec_en) || '';
    $('#wSpec').textContent = sp;
    $('#wSpec').hidden = !sp;
    $('#wProj').textContent = w.proj || '';
    $('#wProj').hidden = !w.proj;
    $('#wIntro').innerHTML = md(pick(w.md, w.md_en) || '');
    fixMedia($('#wIntro'));
    const imgNote = wkShots(w)[wkShot] || wkShots(w)[0];
    $('#wShotNote').textContent = mediaCaption(imgNote, 'image');
    mediaRefreshCaptions(wkLayer);
    langSw($('#wLang'), hasEN(w));
  }

  function wkOpen(id){
    wkCur = id; const w = wkWork();
    $('#wDate').textContent = w.date || '';
    $('#wDate').hidden = !w.date;
    const tagsEl = $('#wTags'); tagsEl.replaceChildren();
    (w.tags || []).forEach(t => {
      const s = document.createElement('span'); s.textContent = '#' + t; tagsEl.appendChild(s);
    });
    tagsEl.hidden = !(w.tags || []).length;
    $('#wSep').hidden = !(w.tags || []).length;
    wkLangPaint();

    const side = $('#wSide');
    side.querySelectorAll('.media-video-carousel, .vid').forEach(el => el.remove());
    mediaVideoCarousel(side, w.videos || [], 'w');

    wkShot = 0; wkPaintShot();
    wkLayer.classList.add('on');
    fixMedia(wkLayer);
    $('#wCol').scrollTop = 0;
  }
  function wkClose(){
    wkLayer.classList.remove('on');
    wkLayer.querySelectorAll('.media-video-stage iframe').forEach(f => f.remove());
  }

  $('#wPgPrev').addEventListener('click', () => wkGoPage(-1));
  $('#wPgNext').addEventListener('click', () => wkGoPage(1));
  $('#wClose').addEventListener('click', wkClose);
  $('#wLang').addEventListener('click', () => setLang(LANG === 'cn' ? 'en' : 'cn'));
  $('#wPrev').addEventListener('click', () => {
    const n = wkShots(wkWork()).length; wkShot = (wkShot - 1 + n) % n; wkPaintShot(); });
  $('#wNext').addEventListener('click', () => {
    const n = wkShots(wkWork()).length; wkShot = (wkShot + 1) % n; wkPaintShot(); });
  $('#wShotBox').addEventListener('click', () => {
    const w = wkWork();
    lightOpen(wkShots(w), wkShot, w.title, n => { wkShot = n; wkPaintShot(); });
  });
  wkLayer.addEventListener('click', e => {
    if (lightLayer.classList.contains('on') || lightLayer.classList.contains('closing')) return;
    const t = e.target;
    if (t.closest && t.closest(NO_CLOSE)) return;
    wkClose();
  });

  /* 走到这一屏时重放一次卡片入场动画 */
  new MutationObserver(() => {
    if (!wkSec.classList.contains('on')) return;
    $('#wGrid').querySelectorAll('.wk-card').forEach(c => {
      c.style.animation = 'none'; void c.offsetWidth; c.style.animation = '';
    });
  }).observe(wkSec, { attributes:true, attributeFilter:['class'] });

  wkRender();
