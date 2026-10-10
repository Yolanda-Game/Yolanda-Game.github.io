  /* ============ 项目页逻辑（平时不用动） ============ */
  const PJ = window.PROJECTS || [];
  const PCAR = PJ.filter(p => p.carousel);
  const endYM = s => {
    const m = String(s || '').match(/\d{4}\.\d{2}/g);
    if (m) return m[m.length - 1];
    const y = String(s || '').match(/\d{4}/);
    return y ? y[0] : '';                       /* 只写到年就退回年 */
  };
  const PJIDX = PJ.slice().sort((a, b) => endYM(b.date).localeCompare(endYM(a.date)));
  const PSLIDES = PCAR.length + 1;
  const pjIsIdx = k => k === PSLIDES - 1;
  const pjSec = $('#projSec'), pjLayer = $('#pjLayer'), pjg = $('#prog');
  const pjBgA = $('#bgA'), pjBgB = $('#bgB');
  const pset = (sel, txt) => { const el = $(sel); if (!el) return; el.hidden = !txt; if (txt) el.textContent = txt; };
  /* 封面图：写了 cover 就用 cover；没写就用截图第一张；再没有才猜 images/<id>/cover.jpg
     —— 所以「封面 = shots 的 01」这种写法直接成立，数据里 cover 那行可以删掉 */
  const coverOf = p => {
    const s = (p.shots || [])[0];
    return p.cover || (typeof s === 'string' ? s : (s && s.src) || '') || ('images/' + p.id + '/cover.jpg');
  };
  const shotsOf = p => ((p.shots && p.shots.length) ? p.shots : ['images/' + p.id + '/01.jpg'])
    .map(s => (typeof s === 'string' ? { src:s, note:'' } : { src:(s && s.src) || '', note:(s && s.note) || '' }));
  let pjI = 0, pjShotI = 0, pjFront = 0, pjCur = 0, pjOn = false;

  PJ.forEach(p => { const im = new Image(); im.src = coverOf(p); });

  function pjBg(src){
    const next = pjFront === 0 ? pjBgB : pjBgA, prev = pjFront === 0 ? pjBgA : pjBgB;
    next.onload = () => { next.classList.add('on'); prev.classList.remove('on'); pjFront = 1 - pjFront; };
    next.src = src;
  }
  function pjBgOff(){ pjBgA.onload = pjBgB.onload = null; pjBgA.classList.remove('on'); pjBgB.classList.remove('on'); }

  function pjPaint(){
    const idx = pjIsIdx(pjI);
    pjSec.classList.toggle('idx', idx);
    if (idx){
      pjBgOff();
      pset('#pName',''); pset('#pNameEn','');
      pset('#pDate', '共 ' + PJ.length + ' 个 ');
      pset('#pSpec',''); pset('#pSpecEn','');
      $('#pOpen').hidden = true;
      $('#pIndex').innerHTML = PJIDX.map(p => `
        <button class="pj-row" data-pi="${PJ.indexOf(p)}">
          <span class="rname">
            <span class="rn">${esc(p.name)}</span>
            ${p.name_en ? `<span class="rne">${esc(p.name_en)}</span>` : ''}
          </span>
          ${p.carousel ? '<span class="rm">轮播</span>' : ''}
          <span class="rs">${esc(p.spec)}<i class="sp">·</i></span>
          <span class="rd">${esc(p.date)}</span>
        </button>`).join('');
    } else {
      const p = PCAR[pjI];
      if (p){
        pjBg(coverOf(p));
        pset('#pName', p.name); pset('#pNameEn', p.name_en); pset('#pDate', p.date);
        pset('#pSpec', p.spec); pset('#pSpecEn', '');      /* 轮播页不显示英文品类（详情层切换用） */
        $('#pOpen').hidden = false;
        $('#pIndex').innerHTML = '';
      }
    }
    $('#pIdx').textContent = p2(pjI + 1) + ' / ' + p2(PSLIDES);
    pjg.classList.remove('run'); void pjg.offsetWidth; pjg.classList.add('run');
  }
  function pjGo(d){ pjI = (pjI + d + PSLIDES) % PSLIDES; pjPaint(); }

  /* 进这一屏才走进度条，离开就停；不改世界导航那套 */
  new MutationObserver(() => {
    const on = pjSec.classList.contains('on');
    if (on === pjOn) return;
    pjOn = on;
    if (on){
      pjI = 0; pjPaint();
      ['#pName','#pNameEn','#pDate','#pSpec','.pj-act'].forEach(sel => {
        const el = pjSec.querySelector(sel); if (!el) return;
        el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
      });
    } else {
      pjg.classList.remove('run');
      pjSec.classList.remove('paused');
    }
  }).observe(pjSec, { attributes:true, attributeFilter:['class'] });

  pjg.addEventListener('animationend', () => { if (pjOn && !pjIsIdx(pjI)) pjGo(1); });

  $('#pPrev').addEventListener('click', e => { e.stopPropagation(); pjGo(-1); });
  $('#pNext').addEventListener('click', e => { e.stopPropagation(); pjGo(1); });
  $('#pOpen').addEventListener('click', e => {
    e.stopPropagation();
    if (!pjIsIdx(pjI)) pjOpen(PJ.indexOf(PCAR[pjI]));
  });
  pjSec.addEventListener('click', e => {
    const row = e.target.closest('.pj-row');
    if (row){ pjOpen(+row.dataset.pi); return; }
    if (!e.target.closest('.pn') && !pjIsIdx(pjI) && pjOn) pjOpen(PJ.indexOf(PCAR[pjI]));
  });

  function pjShotPaint(){
    const p = PJ[pjCur], list = shotsOf(p);
    if (pjShotI >= list.length) pjShotI = 0;
    const sh = list[pjShotI];
    const box = $('#mShotBox'); box.replaceChildren();
    const img = new Image(); img.alt = sh.note || ''; img.src = sh.src;
    img.onerror = () => { box.innerHTML = '<div class="phbox">图片未找到：' + esc(sh.src) + '</div>'; };
    box.appendChild(img);
    pset('#mShotNote', sh.note);
    $('#mShotIdx').textContent = p2(pjShotI + 1) + ' / ' + p2(list.length);
  }

  /* 项目详情里跟语言有关的字段，只在这一处画（切语言时复用） */
  function pjLangPaint(){
    const p = PJ[pjCur]; if (!p) return;
    langFor(p);
    setTtl($('#mName'), $('#mNameEn'), p.name, p.name_en);
    pset('#mRole', pick(p.role, p.role_en));
    pset('#mSpec', pick(p.spec, p.spec_en));
    $('#mIntro').innerHTML = md(pick(p.md, p.md_en) || '');
    fixMedia($('#mIntro'));
    langSw($('#mLang'), hasEN(p));
  }

  function pjOpen(n){
    pjCur = n; const p = PJ[n];
    pset('#mDate', p.date);
    pjLangPaint();
    pjShotI = 0; pjShotPaint();
    const side = $('#mSide');
    side.querySelectorAll('.vid').forEach(v => v.remove());
    (p.videos || []).filter(v => v && v.src).forEach(v => {
      const d = document.createElement('div');
      d.className = 'vid';
      d.dataset.src = v.src;
      d.innerHTML = '<span class="pl">▶</span><span class="vl">' + esc(v.label || '视频') + '</span>';
      side.appendChild(d);
    });
    pjLayer.classList.add('on');
    pjSec.classList.add('paused');
    $('#pjCol').scrollTop = 0;
    fixMedia(pjLayer);   /* 复用日志那套：图找不到有兜底、视频点一下原地播放 */
  }
  function pjClose(){ pjLayer.classList.remove('on'); pjSec.classList.remove('paused'); }
