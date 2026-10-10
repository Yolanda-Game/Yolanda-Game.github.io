/* v1.9.1 发布前媒体补丁：详情视频轮播 + 全类别日志媒体合集。
   依赖：js/core.js / js/blog.js / js/lightbox.js；在 js/work.js 后、js/boot.js 前加载。 */

/* 英文不存在时保持原始中文小标题；由详情或日志的 langFor() 决定 SHOWN。 */
function mediaBilingual(item, cnKey, enKey) {
  if (!item) return '';
  const cn = String(item[cnKey] || '');
  const en = String(item[enKey] || '');
  return SHOWN === 'en' && en ? en : cn;
}
function mediaShot(s) {
  return typeof s === 'string' ? { src: s, note: '', note_en: '' } : (s || {});
}
function mediaVideo(v) {
  return typeof v === 'string' ? { src: v, label: '视频', label_en: '' } : (v || {});
}
function mediaCaption(item, type) {
  if (type === 'video') {
    return mediaBilingual(item,'note','note_en') || mediaBilingual(item,'label','label_en') || '视频';
  }
  return mediaBilingual(item,'note','note_en');
}
function mediaVideoPlaceholder(stage, video) {
  const el = document.createElement('div');
  el.className = 'vid';
  el.dataset.src = String(video.src || '');
  const play = document.createElement('span');
  play.className = 'pl'; play.textContent = '▶';
  const label = document.createElement('span');
  label.className = 'vl'; label.textContent = mediaBilingual(video,'label','label_en') || '视频';
  el.append(play,label);
  stage.replaceChildren(el); // 移除旧 iframe，切换时停止先前的视频
  fixMedia(stage);
}
function mediaVideoCarousel(side, sources, prefix) {
  const videos = (Array.isArray(sources) ? sources : []).map(mediaVideo).filter(v => v.src);
  if (!videos.length) return null;
  const root = document.createElement('div');
  root.className = 'media-video-carousel edge-safe';
  root.id = prefix + 'VideoCarousel';
  const stage = document.createElement('div'); stage.className = 'media-video-stage';
  const bar = document.createElement('div'); bar.className = 'shot-bar media-video-bar';
  const caption = document.createElement('span'); caption.className = 'shot-note media-caption';
  const index = document.createElement('span'); index.className = 'media-index';
  const prev = document.createElement('button'); prev.className = 'pn'; prev.type = 'button';
  prev.setAttribute('aria-label','上一个视频'); prev.textContent = '‹';
  const next = document.createElement('button'); next.className = 'pn'; next.type = 'button';
  next.setAttribute('aria-label','下一个视频'); next.textContent = '›';
  bar.append(caption,index,prev,next);
  root.append(stage,bar); side.append(root);
  let current = 0;
  const refreshLanguage = () => {
    caption.textContent = mediaCaption(videos[current], 'video');
    const label = stage.querySelector('.vl');
    if (label) label.textContent = mediaBilingual(videos[current],'label','label_en') || '视频';
  };
  const paint = () => {
    mediaVideoPlaceholder(stage,videos[current]);
    index.textContent = p2(current+1) + ' / ' + p2(videos.length);
    prev.disabled = next.disabled = videos.length < 2;
    refreshLanguage();
  };
  const move = (d,e) => { if(e) e.stopPropagation(); current=(current+d+videos.length)%videos.length; paint(); };
  prev.addEventListener('click',e=>move(-1,e));
  next.addEventListener('click',e=>move(1,e));
  root.addEventListener('click',e=>e.stopPropagation());
  root._refreshLanguage = refreshLanguage;
  paint();
  return root;
}
function mediaRefreshCaptions(container) {
  container.querySelectorAll('.media-video-carousel').forEach(el => {
    if (typeof el._refreshLanguage === 'function') el._refreshLanguage();
  });
}

/* 所有日志均可提供 shots/videos；普通日志附于正文之后，介绍日志放在正文之前。
   介绍日志合并视频与图片（视频在前）；原 Markdown 内嵌媒体保留原位，避免重复。 */
function mediaLogGallery(root, post) {
  const shots = (Array.isArray(post.mediaShots) ? post.mediaShots : [])
    .map(mediaShot).filter(sh => sh.src);
  const videos = (Array.isArray(post.mediaVideos) ? post.mediaVideos : [])
    .map(mediaVideo).filter(v => v.src);
  const entries = post.isIntro
    ? [...videos.map(v=>({type:'video',item:v})),...shots.map(s=>({type:'image',item:s}))]
    : [...shots.map(s=>({type:'image',item:s})),...videos.map(v=>({type:'video',item:v}))];
  if (!entries.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'media-gallery edge-safe' + (post.isIntro ? ' media-gallery-intro' : '');
  const stage = document.createElement('div'); stage.className = 'media-gallery-stage';
  const bar = document.createElement('div'); bar.className = 'shot-bar media-gallery-bar';
  const note = document.createElement('span'); note.className = 'shot-note media-caption';
  const idx = document.createElement('span'); idx.className = 'media-index';
  const prev = document.createElement('button'); prev.className = 'pn'; prev.type = 'button';
  prev.setAttribute('aria-label','上一项媒体'); prev.textContent = '‹';
  const next = document.createElement('button'); next.className = 'pn'; next.type = 'button';
  next.setAttribute('aria-label','下一项媒体'); next.textContent = '›';
  bar.append(note,idx,prev,next); wrap.append(stage,bar);
  let current = 0;
  const paint = () => {
    const entry = entries[current];
    if (entry.type === 'video') {
      mediaVideoPlaceholder(stage, entry.item);
    } else {
      const img = document.createElement('img');
      img.alt = mediaCaption(entry.item, 'image');
      img.decoding = 'async';
      img.src = entry.item.src;
      img.onerror = () => {
        if (!img.isConnected) return;
        const ph = document.createElement('div'); ph.className = 'phbox';
        ph.textContent = '图片未找到：' + entry.item.src;
        img.replaceWith(ph);
      };
      img.title = '点击查看全图';
      img.addEventListener('click', e => {
        e.stopPropagation();
        const images = entries.filter(x=>x.type==='image').map(x=>x.item);
        const imageIndex = entries.slice(0,current+1).filter(x=>x.type==='image').length - 1;
        lightOpen(images,imageIndex,post.title,n=>{
          const imageEntry = entries.findIndex((x,i)=>x.type==='image' &&
            entries.slice(0,i+1).filter(v=>v.type==='image').length-1===n);
          if (imageEntry>=0) {current=imageEntry;paint();}
        });
      });
      stage.replaceChildren(img);
    }
    note.textContent = mediaCaption(entry.item,entry.type);
    idx.textContent = p2(current+1) + ' / ' + p2(entries.length);
    prev.disabled = next.disabled = entries.length < 2;
  };
  prev.onclick=e=>{e.stopPropagation();current=(current+entries.length-1)%entries.length;paint();};
  next.onclick=e=>{e.stopPropagation();current=(current+1)%entries.length;paint();};
  wrap.addEventListener('click',e=>e.stopPropagation());
  if(post.isIntro) root.prepend(wrap); else root.append(wrap);
  paint();
}
