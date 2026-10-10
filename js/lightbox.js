  /* ============ 全图层（项目页 / 作品页共用） ============ */
  const lightLayer = $('#lightLayer');
  let lightList = [], lightI = 0, lightBack = null;

  function lightPaint(){
    const sh = lightList[lightI] || { src:'', note:'' };
    const box = $('#lightBox'); box.replaceChildren();
    const img = new Image(); img.alt = '';
    img.src = sh.src;
    img.onerror = () => { box.innerHTML = '<div class="phbox">图片未找到：' + esc(sh.src) + '</div>'; };
    box.appendChild(img);
    $('#lightNote').textContent = sh.note || '';
    $('#lightNote').hidden = !sh.note;
    $('#lightIdx').textContent = p2(lightI + 1) + ' / ' + p2(lightList.length);
    if (lightBack) lightBack(lightI);
  }
  function lightOpen(list, i, name, after){
    lightList = list || []; lightI = i || 0; lightBack = after || null;
    $('#lightName').textContent = name || '';
    lightPaint();
    lightLayer.classList.add('on');
  }
  function lightClose(){ lightLayer.classList.remove('on'); }
  function lightGo(d){
    if (!lightList.length) return;
    lightI = (lightI + d + lightList.length) % lightList.length;
    lightPaint();
  }

  $('#lightClose').onclick = lightClose;
  $('#lightPrev').onclick = () => lightGo(-1);
  $('#lightNext').onclick = () => lightGo(1);
  lightLayer.addEventListener('click', e => {
    if (e.target.closest('img, .pn, .dl-share')) return;
    lightClose();
  });
  /* 点详情层里那张大图 → 看全图；翻到哪张，关掉后详情层也停在哪张 */
  $('#mShotBox').onclick = () => {
    const p = PJ[pjCur];
    lightOpen(shotsOf(p), pjShotI, p.name, n => { pjShotI = n; pjShotPaint(); });
  };

  $('#mClose').addEventListener('click', pjClose);
  $('#mLang').addEventListener('click', () => setLang(LANG === 'cn' ? 'en' : 'cn'));
  pjLayer.addEventListener('click', e => {
    const t = e.target;
    if (t.closest && t.closest(NO_CLOSE)) return;
    pjClose();
  });
  $('#sPrev').addEventListener('click', () => {
    const n = shotsOf(PJ[pjCur]).length; pjShotI = (pjShotI - 1 + n) % n; pjShotPaint(); });
  $('#sNext').addEventListener('click', () => {
    const n = shotsOf(PJ[pjCur]).length; pjShotI = (pjShotI + 1) % n; pjShotPaint(); });

  /* 详情层 / 全图层开着时，键盘 / 滚轮 / 滑动不再翻页；Esc 逐层关 */
  ['keydown','wheel','touchstart','touchend'].forEach(t => addEventListener(t, e => {
    if (lightLayer.classList.contains('on')){
      if (t === 'keydown' && e.key === 'Escape') lightClose();
      e.stopPropagation();
      return;
    }
    const openPj = pjLayer.classList.contains('on');
    const openWk = document.querySelector('#wkLayer').classList.contains('on');
    if (!openPj && !openWk) return;
    if (t === 'keydown' && e.key === 'Escape'){ openWk ? wkClose() : pjClose(); }
    e.stopPropagation();
  }, { capture:true, passive:t !== 'keydown' }));
