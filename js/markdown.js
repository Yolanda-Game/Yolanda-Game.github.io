  /* ============ 迷你 Markdown ============ */
   /* ── 标注框类型表：图标 + 标签词 + 颜色名 ──
     t 改成 '' 就是"只显示图标"；k 对应 CSS 里的 .co-xxx 颜色 */
  const CO = {
    note:     { t:'NOTE',     k:'note',     i:'<path d="M4 20h4L18 10l-4-4L4 16z"/><path d="M13 7l4 4"/>' },
    abstract: { t:'ABSTRACT', k:'abstract', i:'<path d="M6.5 3.5h7L18.5 8v12.5h-12z"/><path d="M9.5 12h6M9.5 15.5h6"/>' },
    info:     { t:'INFO',     k:'info',     i:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.9v.1"/>' },
    todo:     { t:'TODO',     k:'todo',     i:'<rect x="4.5" y="4.5" width="15" height="15"/><path d="M8.5 12.2l2.6 2.6 5-5.6"/>' },
    tip:      { t:'TIP',      k:'tip',      i:'<path d="M12 3.5l1.9 5.2 5.2 1.9-5.2 1.9L12 17.7l-1.9-5.2-5.2-1.9 5.2-1.9z"/>' },
    example:  { t:'EXAMPLE',  k:'example',  i:'<path d="M4.5 7h2M4.5 12h2M4.5 17h2M9.5 7h10M9.5 12h10M9.5 17h10"/>' },
    warn:     { t:'WARNING',  k:'warn',     i:'<path d="M12 4.2l8.6 15.3H3.4z"/><path d="M12 10v4.2M12 17.2v.1"/>' },
    warning:  { t:'WARNING',  k:'warn',     i:'<path d="M12 4.2l8.6 15.3H3.4z"/><path d="M12 10v4.2M12 17.2v.1"/>' },
    danger:   { t:'DANGER',   k:'warn',     i:'<path d="M12 4.2l8.6 15.3H3.4z"/><path d="M12 10v4.2M12 17.2v.1"/>' }
  };
  function coHTML(kind, head, src){
    const c = CO[String(kind).toLowerCase()] || CO.note;      // 类型写错就退回 note
    return '<div class="callout co-' + c.k + '">' +
      '<div class="callout-h"><span class="co-tag">' +
        '<svg class="co-ic" viewBox="0 0 24 24">' + c.i + '</svg>' +
        c.t + '</span>' +
      (head ? '<span class="co-t">' + inlineMd(head) + '</span>' : '') +
      '</div>' + md(src) + '</div>';
  }

  function inlineMd(s){
    return esc(s)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)(\{w=(\d+)%\})?/g,
        (m,a,b,c,d,w) => {
          const st = w ? ' style="width:' + w + '%;margin:0 auto"' : '';
          return '<img src="' + b + '" alt="' + a + '"' + st + '>';
        })
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/~~([^~]+)~~/g, '<s>$1</s>')
      .replace(/==([^=]+)==/g, '<mark>$1</mark>')
      .replace(/(^|[^*])\*([^*]+)\*/g, '$1<i>$2</i>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/(^|[\s（(])(https?:\/\/[^\s<)]+)/g,
        '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  }

  function md(src){
    const lines = String(src).replace(/\r/g,'').split('\n');
    const out = [];
    let buf = [];
    const flush = () => { if (buf.length){ out.push('<p>' + buf.join('<br>') + '</p>'); buf = []; } };
    let i = 0;
    while (i < lines.length){
      const t = lines[i].trim();
      if (!t){ flush(); i++; continue; }

      // 标注框
      let m = t.match(/^>\s*\[!(\w+)\]\s*(.*)$/);
      if (m){
        flush();
        const head = m[2].trim();
        const body = []; i++;
        while (i < lines.length && /^>/.test(lines[i].trim())){
          body.push(lines[i].trim().replace(/^>\s?/,'')); i++;
        }
        out.push(coHTML(m[1], head, body.join('\n')));
        continue;
      }
      // 引用
      if (/^>/.test(t)){
        flush();
        const body = [];
        while (i < lines.length && /^>/.test(lines[i].trim())){
          body.push(lines[i].trim().replace(/^>\s?/,'')); i++;
        }
        out.push('<blockquote>' + inlineMd(body.join(' ')) + '</blockquote>');
        continue;
      }
      // 代码块
      if (/^```/.test(t)){
        flush(); i++;
        const code = [];
        while (i < lines.length && !/^```/.test(lines[i].trim())){ code.push(lines[i]); i++; }
        i++;
        out.push('<pre><code>' + esc(code.join('\n')) + '</code></pre>');
        continue;
      }
      // 嵌入指令
      m = t.match(/^:::(\w+)\s*(.*)$/);
      if (m){
        flush();
        const kind = m[1], arg = m[2].trim();
        const body = []; i++;
        while (i < lines.length && !/^:::\s*$/.test(lines[i].trim())){ body.push(lines[i].trim()); i++; }
        i++;
        if (kind === 'video' || kind === 'embed'){
          const sp = arg.indexOf(' ');
          const vsrc = sp < 0 ? arg : arg.slice(0, sp);
          const label = (sp < 0 ? body.join(' ') : arg.slice(sp + 1)) || '视频';
          out.push('<div class="vid" data-src="' + esc(vsrc) + '">' +
            '<span class="pl">▶</span><span class="vl">' + esc(label) + '</span></div>');
        } else {
          out.push(coHTML(kind, arg, body.join('\n')));
        }
        continue;
      }
      // 表格
      if (/^\|/.test(t) && /^[\|\s:\-]+$/.test(lines[i+1] ? lines[i+1].trim() : '')){
        flush();
        const rows = [];
        while (i < lines.length && /^\|/.test(lines[i].trim())){
          rows.push(lines[i].trim().replace(/^\||\|$/g,'').split('|').map(c => c.trim())); i++;
        }
        const thead = rows.shift();
        const tbody = rows.slice(1);
        out.push('<table><thead><tr>' + thead.map(c => '<th>' + inlineMd(c) + '</th>').join('') +
          '</tr></thead><tbody>' +
          tbody.map(r => '<tr>' + r.map(c => '<td>' + inlineMd(c) + '</td>').join('') + '</tr>').join('') +
          '</tbody></table>');
        continue;
      }
      // 标题
      m = t.match(/^(#{2,6})\s+(.*)$/);
      if (m){
        flush();
        out.push(m[1].length <= 2 ? '<h4>' + inlineMd(m[2]) + '</h4>'
                                  : '<h5>' + inlineMd(m[2]) + '</h5>');
        i++; continue;
      }
      if (/^(-{3,}|\*{3,})$/.test(t)){ flush(); out.push('<hr>'); i++; continue; }
      // 列表
      if (/^([-*+]|\d+\.)\s+/.test(t)){
        flush();
        const ordered = /^\d+\./.test(t);
        const items = [];
        while (i < lines.length && /^([-*+]|\d+\.)\s+/.test(lines[i].trim())){
          items.push(lines[i].trim().replace(/^([-*+]|\d+\.)\s+/,'')); i++;
        }
        out.push('<' + (ordered ? 'ol' : 'ul') + '>' +
          items.map(x => '<li>' + inlineMd(x) + '</li>').join('') +
          '</' + (ordered ? 'ol' : 'ul') + '>');
        continue;
      }
      // 独占一行的图
      m = t.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)(\{w=(\d+)%\})?$/);
      if (m){
        flush();
        const cap = m[3] || m[1];
        const st = m[5] ? ' style="width:' + m[5] + '%;margin:0 auto"' : '';
        out.push('<figure><img src="' + m[2] + '" alt="' + esc(m[1]) + '"' + st + '>' +
          (cap ? '<figcaption>' + inlineMd(cap) + '</figcaption>' : '') + '</figure>');
        i++; continue;
      }
      // 逃生舱
      if (/^</.test(t)){
        flush();
        const raw = [];
        while (i < lines.length && lines[i].trim()){ raw.push(lines[i]); i++; }
        out.push(raw.join('\n')); continue;
      }
      buf.push(inlineMd(t)); i++;
    }
    flush();
    return out.join('\n');
  }
  function readFM(src){
    const s = String(src).replace(/\r/g,'');
    const lines = s.split('\n');
    let i = 0;
    while (i < lines.length && !lines[i].trim()) i++;
    if (!/^---\s*$/.test(lines[i] || '')) return { meta:{}, body:s };
    i++;
    const meta = {};
    for (; i < lines.length; i++){
      const t = lines[i].trim();
      if (t === '---'){ i++; break; }
      const m = t.match(/^([\w-]+)\s*:\s*(.*)$/);
      if (m) meta[m[1].toLowerCase()] = m[2].trim().replace(/^["']|["']$/g,'');
    }
    return { meta, body: lines.slice(i).join('\n') };
  }
