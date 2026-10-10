  /* ============ 启动 ============ */
  render();
  try{ abCount(); abApply(); }catch(err){ console.error('[启动] 关于页初始化失败：', err); }
  try{
    blogDefaults();
    renderBlogs();
    fromHash();
  }catch(err){ console.error('[启动] 日志初始化失败：', err); }
