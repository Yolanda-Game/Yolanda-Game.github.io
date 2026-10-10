  /* ============ 世界导航 ============ */
  const COL_NAME = ['首页','项目','作品'];
  const nameOf = (c, r) => r === -1 ? '日志' : r === 1 ? '关于' : (COL_NAME[c] || '');
  const world = $('#world'), brand = $('#brand');
  const abLayer = $('#abLayer');
  const planWrap = $('#planWrap'), planSvg = planWrap.querySelector('svg');
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

  ['blog','about'].forEach(kind => {
    const tpl = document.querySelector('[data-tpl="' + kind + '"]');
    [1,2].forEach(c => {
      const el = tpl.cloneNode(true);
      el.removeAttribute('data-tpl');
      el.dataset.c = c;
      el.classList.remove('on');
      world.appendChild(el);
    });
  });
  const secs = $$('#world section');
  /* 每屏落位由 data-c / data-r 算出来，HTML 里不再手写 left / top */
  secs.forEach(s => {
    s.style.left = ((+s.dataset.c + 1) * 100) + 'vw';
    s.style.top  = ((+s.dataset.r + 1) * 100) + 'vh';
  });
  const map = {};
  secs.forEach(s => { map[s.dataset.c + ',' + s.dataset.r] = s; });

  let cur = { c:0, r:0 }, lock = false;
  const base = () => 'translate(' + (-(cur.c+1)*100) + 'vw, ' + (-(cur.r+1)*100) + 'vh)';

  function can(dir){
    if (cur.r === 0){
      if (dir === 'left')  return cur.c > 0;
      if (dir === 'right') return cur.c < 2;
      return true;
    }
    if (cur.r === -1) return dir === 'down';
    return dir === 'up';
  }
  function go(c, r){
    if (lock || !map[c + ',' + r]) return;
    lock = true; cur = { c, r }; render();
    setTimeout(() => lock = false, 640);
  }
  function step(dir){
    if (lock || !can(dir)) return;
    let n = null;
    if (cur.r === 0){
      if (dir === 'left')  n = { c:cur.c-1, r:0 };
      if (dir === 'right') n = { c:cur.c+1, r:0 };
      if (dir === 'up')    n = { c:cur.c,   r:-1 };
      if (dir === 'down')  n = { c:cur.c,   r:1  };
    } else if (cur.r === -1 && dir === 'down') n = { c:cur.c, r:0 };
    else if (cur.r ===  1 && dir === 'up')     n = { c:cur.c, r:0 };
    if (n) go(n.c, n.r);
  }
  const home = () => go(0,0);

  function playPlan(){
    if (!planWrap) return;
    planWrap.classList.remove('play'); void planWrap.offsetWidth; planWrap.classList.add('play');
    if (!planSvg || !planSvg.setCurrentTime) return;
    if (REDUCE){ if (planSvg.pauseAnimations) planSvg.pauseAnimations(); return; }
    if (planSvg.pauseAnimations)  planSvg.pauseAnimations();
    planSvg.setCurrentTime(0);
    const wk = document.getElementById('walk'); if (wk && wk.beginElement) wk.beginElement();
    if (planSvg.unpauseAnimations) planSvg.unpauseAnimations();
  }
  function stopPlan(){
    if (!planWrap) return;
    planWrap.classList.remove('play');
    if (planSvg.pauseAnimations) planSvg.pauseAnimations();
  }

  function render(){
    const vp = document.getElementById('viewport');
    if (vp && (vp.scrollLeft || vp.scrollTop)){ vp.scrollLeft = 0; vp.scrollTop = 0; }
    world.style.transform = base();
    secs.forEach(s => s.classList.toggle('on', s === map[cur.c + ',' + cur.r]));
    brand.classList.toggle('hide', cur.c === 0 && cur.r === 0);
    if (cur.c === 0 && cur.r === 0) playPlan(); else stopPlan();
    ui();
  }

  addEventListener('keydown', e => {
    if (abLayer.classList.contains('on')){
      if (e.key === 'Escape') abLayer.classList.remove('on');
      return;
    }
    if (e.key === 'ArrowLeft')  step('left');
    if (e.key === 'ArrowRight') step('right');
    if (e.key === 'ArrowUp')    step('up');
    if (e.key === 'ArrowDown')  step('down');
    if (e.key === 'Escape')     home();
  });

  addEventListener('wheel', e => {
    if (abLayer.classList.contains('on')) return;

    // 项目索引拥有独立滚动权限
    // 鼠标位于索引内时，不允许触发整页切换
    if (e.target instanceof Element &&
        e.target.closest('.pj-index')) {
      return;
    }

    // 其余区域保持原来的页面导航功能
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.deltaX > 12 ? step('right') : step('left');
    } else {
      e.deltaY > 12 ? step('down') :
      e.deltaY < -12 ? step('up') : 0;
    }
  }, { passive:true });

  
  let sx = 0, sy = 0;
  let touchInProjectIndex = false;

  addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;

    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;

    // 记录手指是否从项目索引区域开始滑动
    touchInProjectIndex =
      e.target instanceof Element &&
      !!e.target.closest('.pj-index');
  }, { passive:true });

  addEventListener('touchend', e => {
    if (abLayer.classList.contains('on')) return;

    // 从项目索引开始的滑动，只处理内部滚动
    if (touchInProjectIndex) {
      touchInProjectIndex = false;
      return;
    }

    // 多指操作不触发切页
    if (e.touches.length > 0) return;

    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < 50) return;

    Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? step('left') : step('right'))
      : (dy > 0 ? step('up') : step('down'));
  }, { passive:true });

  addEventListener('touchcancel', () => {
    touchInProjectIndex = false;
  }, { passive:true });

  brand.onclick = home;

  const mmGrid = $('#mmGrid'), mmName = $('#mmName');
  const mmCells = {};
  [{c:1,r:-1},{c:0,r:0},{c:1,r:0},{c:2,r:0},{c:1,r:1}].forEach(({c, r}) => {
    const cell = document.createElement('div');
    cell.className = 'mm-cell used';
    cell.style.gridColumn = c + 1;
    cell.style.gridRow = r + 2;
    cell.onclick = () => go(c, r);
    mmGrid.appendChild(cell);
    mmCells[c + ',' + r] = cell;
  });

  let overMini = false;
  const mini = $('#minimap');
  mini.addEventListener('mouseenter', () => { overMini = true;  hoverEdge(lastX, lastY); });
  mini.addEventListener('mouseleave', () => { overMini = false; hoverEdge(lastX, lastY); });

  const eTop = $('#eTop'), eBottom = $('#eBottom'), eLeft = $('#eLeft'), eRight = $('#eRight');
  const E = { top:eTop, bottom:eBottom, left:eLeft, right:eRight };
  const TRI = { top:'▲', bottom:'▼', left:'◀', right:'▶' };
  let avail = { top:false, bottom:false, left:false, right:false };

  function ui(){
    Object.values(E).forEach(el => { el.innerHTML = ''; el.classList.remove('hot'); });
    avail = { top:false, bottom:false, left:false, right:false };
    const put = (edge, text, dir) => {
      const inner = document.createElement('div'); inner.className = 'edge-inner';
      const tri = document.createElement('span'); tri.className = 'tri'; tri.textContent = TRI[edge];
      const txt = document.createElement('span'); txt.className = 'edge-txt'; txt.textContent = text;
      (edge === 'top' || edge === 'left' ? [tri, txt] : [txt, tri]).forEach(n => inner.appendChild(n));
      E[edge].appendChild(inner);
      E[edge].onclick = () => step(dir);
      avail[edge] = true;
    };
    if (cur.r === 0){
      put('top', '日志', 'up');
      put('bottom', '关于', 'down');
      if (can('left'))  put('left',  nameOf(cur.c-1, 0), 'left');
      if (can('right')) put('right', nameOf(cur.c+1, 0), 'right');
    } else if (cur.r === -1){
      put('bottom', '回到' + nameOf(cur.c, 0), 'down');
    } else {
      put('top', '回到' + nameOf(cur.c, 0), 'up');
    }
    const key = (cur.r === 0 ? cur.c : 1) + ',' + cur.r;
    for (const k in mmCells) mmCells[k].classList.toggle('on', k === key);
    mmName.textContent = nameOf(cur.c, cur.r);
    hoverEdge(lastX, lastY);
  }

  let lastX = -1, lastY = -1;
  function hoverEdge(x, y){
    if (x < 0 || y < 0 || overMini){
      for (const k in E) E[k].classList.remove('hot');
      return;
    }
    const W = innerWidth, H = innerHeight;
    /* 触发深度收窄：手机 56px、桌面约 72–95px（原来 108–168px，太容易抢到附近按钮） */
    const T = (W < 700) ? 56 : Math.min(120, Math.max(72, H * 0.10));
    const SPAN = 0.36;
    const hot = {
      top:    y < T       && Math.abs(x - W/2) < W * SPAN,
      bottom: (H - y) < T && Math.abs(x - W/2) < W * SPAN,
      left:   x < T       && Math.abs(y - H/2) < H * SPAN,
      right:  (W - x) < T && Math.abs(y - H/2) < H * SPAN
    };
    const busy = $$('.edge-safe').some(el => {
      const r = el.getBoundingClientRect();
      return r.width && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });
    for (const k in E) E[k].classList.toggle('hot', !!(hot[k] && avail[k] && !busy));
  }

  const cross = $('#cross');
  addEventListener('mousemove', e => {
    lastX = e.clientX; lastY = e.clientY;
    document.documentElement.style.setProperty('--sx', e.clientX + 'px');
    document.documentElement.style.setProperty('--sy', e.clientY + 'px');
    document.documentElement.style.setProperty('--mx', ((e.clientX/innerWidth  - .5) * 40) + 'px');
    document.documentElement.style.setProperty('--my', ((e.clientY/innerHeight - .5) * 40) + 'px');
    cross.style.left = e.clientX + 'px';
    cross.style.top  = e.clientY + 'px';
    cross.classList.add('on');
    hoverEdge(e.clientX, e.clientY);
  });
  setInterval(() => {
    cross.classList.toggle('big', !!document.querySelector('.edge.hot') || overMini);
  }, 120);
  $('#year').textContent = new Date().getFullYear();
