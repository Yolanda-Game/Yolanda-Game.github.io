/* v1.9.1：直接从日志数据生成时间线；支持多标签、年月归档及图片视频。 */
const DEV=location.protocol==='file:'||location.hash==='#dev';
/* 媒体由 js/media.js 统一渲染成可切换合集，不再向 Markdown 末尾逐项追加。 */
function logMediaHTML(){ return ''; }
const posts=window.YOLANDA_LOGS.map(entry=>{
  const fm=readFM(entry.markdown||'');
  const tags=Array.isArray(entry.tags)?entry.tags:(entry.tag?[entry.tag]:['更新']);
  const date=entry.date||fm.meta.date||'';
  const [y,m,d0]=date.split('-').map(Number),d=d0||0;
  const title=entry.title||fm.meta.title||'(无标题)';
  const time=entry.time||fm.meta.time||'';
  const media=logMediaHTML(entry,fm.body);
  const body=md(fm.body),en=entry.markdown_en?md(entry.markdown_en):'';
  // Markdown 已经内嵌相同媒体路径的条目不再重复收进合集。
  const shots=(Array.isArray(entry.shots)?entry.shots:[]).filter(sh=>{
    const src=typeof sh==='string'?sh:sh&&sh.src;
    return !!src&&!fm.body.includes(src);
  });
  const videos=(Array.isArray(entry.videos)?entry.videos:[]).filter(v=>{
    const src=typeof v==='string'?v:v&&v.src;
    return !!src&&!fm.body.includes(src);
  });
  const isIntro=tags.includes('介绍') && (tags.includes('项目')||tags.includes('作品')) && !!entry.subject;
  return {id:entry.id,y,m,d,time,title,title_en:entry.title_en||fm.meta.title_en||'',
    mediaShots:shots,mediaVideos:videos,isIntro,
    tags,tag:tags[0]||'更新',html:body+media,html_en:en?en+media:'',
    draft:!!entry.draft,sortKey:(d?date:date+'-01')+' '+(time||'00:00'),
    dstr:y+'.'+p2(m)+(d?'.'+p2(d):'')+(time?' '+time:''),
    mdstr:p2(m)+(d?'.'+p2(d):'')};
}).filter(p=>p.y&&p.m>=1&&p.m<=12&&(!p.draft||DEV))
  .sort((a,b)=>b.sortKey.localeCompare(a.sortKey));
const PREF=['项目','作品','介绍','更新','拆解','技术','说明'];
const TAGS=PREF.filter(t=>posts.some(p=>p.tags.includes(t)))
  .concat([...new Set(posts.flatMap(p=>p.tags))].filter(t=>!PREF.includes(t)));
let filter=null,selId=null;
const openY=new Set(),openM=new Set();
