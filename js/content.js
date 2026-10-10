/* v1.9.1：日志为唯一内容源；从带 #介绍 标签的日志派生项目与作品详情。 */
(function(){
  const bank=window.YOLANDA_CONTENT,logs=window.YOLANDA_LOGS;
  if(!bank||!Array.isArray(logs))throw new Error('内容库或日志数据未加载');
  const normTags=l=>{
    const xs=Array.isArray(l.tags)?l.tags:(l.tag?[l.tag]:['更新']);
    l.tags=[...new Set(xs.map(x=>x==='进度'?'更新':String(x).trim()).filter(Boolean))];
  };
  logs.forEach(normTags);
  const introList=logs.filter(l=>l.subject&&l.tags.includes('介绍')&&
    (l.subject.startsWith('project/')?l.tags.includes('项目'):
     l.subject.startsWith('work/')?l.tags.includes('作品'):false));
  const fromLegacy=ref=>{
    const a=introList.find(l=>l.subject===ref);
    return a?'log/'+a.id:ref;
  };
  const find=ref=>{
    const entry=bank[ref]||bank[fromLegacy(ref)];
    if(!entry||typeof entry.cn!=='string')throw new Error('内容库缺少正文：'+ref);
    return entry;
  };
  const dev=location.protocol==='file:'||location.hash==='#dev';
  // 相同 subject 的介绍日志：优先显式 featured:true，其次最近日期；线上排除草稿。
  function introduction(subject){
    const matches=introList.filter(l=>l.subject===subject&&(dev||!l.draft));
    matches.sort((a,b)=>Number(!!b.featured)-Number(!!a.featured)||
      String(b.date||'').localeCompare(String(a.date||''))||String(b.id).localeCompare(String(a.id)));
    return matches[0]||null;
  }
  const catalog=(kind,items)=>{
    if(!Array.isArray(items))throw new Error('缺少 '+kind+' 栏目索引');
    return items.filter(item=>{
      const log=introduction(kind+'/'+item.id);
      if(!log){console.warn('没有可发布的介绍日志：'+kind+'/'+item.id);return false;}
      const body=find(log.contentRef||'log/'+log.id);
      const title=log.title||'';
      item.date=log.period||log.date||'';
      item.spec=log.spec||'';item.spec_en=log.spec_en||'';
      item.shots=Array.isArray(log.shots)?log.shots:[];
      item.videos=Array.isArray(log.videos)?log.videos:[];
      item.cover=log.cover||'';
      item.md=body.cn;item.md_en=body.en||'';
      if(kind==='project'){
        item.name=title;item.name_en=log.title_en||'';
        item.role=log.role||'';item.role_en=log.role_en||'';
      }else{
        item.title=title;item.title_en=log.title_en||'';
        item.proj=log.proj||'';item.tags=Array.isArray(log.workTags)?log.workTags:[];
      }
      return true;
    });
  };
  window.PROJECTS=catalog('project',window.PROJECTS);
  window.WORKS=catalog('work',window.WORKS);
  logs.forEach(log=>{
    const body=find(log.contentRef||'log/'+log.id);
    // 旧解析器继续使用 readFM；正文来自同一份日志数据，不产生副本。
    const keys=['date','time','title','title_en','draft'];
    const meta=keys.filter(k=>log[k]!==undefined&&log[k]!=='')
      .map(k=>k+': '+String(log[k]).replace(/[\r\n]/g,' '));
    log.markdown='---\n'+meta.join('\n')+'\n---\n'+body.cn;
    log.markdown_en=body.en||'';
  });
})();
