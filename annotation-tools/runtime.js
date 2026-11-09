(function () {
  'use strict';
  const seed = JSON.parse(document.getElementById('prd-annotation-seed').textContent);
  const key = 'xmas-prd-annotation-20261109-v5';
  const copy = v => JSON.parse(JSON.stringify(v));
  function read(suffix, fallback) { try { const raw = localStorage.getItem(key + suffix); return raw ? JSON.parse(raw) : copy(fallback); } catch (_) { return copy(fallback); } }
  const state = { annotations: read('-main', seed.annotations), flows: read('-flow', seed.flows), related: read('-related', seed.related), toolbar: read('-toolbar', null) };
  // Repair legacy standalone acceptance rows while preserving browser edits.
  const acceptanceTableFixes = [{"id": 2, "old": "| A13 | 已达到每日提交上限 10 次 | 尝试再次提交作品 | 阻止超出上限的提交；按账号及 UTC+8 自然日合计成功提交，失败不计数 |", "new": "| 编号 | 前置条件 | 操作 | 可观察预期 |\n| --- | --- | --- | --- |\n| A13 | 已达到每日提交上限 10 次 | 尝试再次提交作品 | 阻止超出上限的提交；按账号及 UTC+8 自然日合计成功提交，失败不计数 |"}, {"id": 3, "old": "| A14 | 小镇某任务有多张已提交作品 | 点击该任务已完成碎片 | 展示该任务首次成功提交并保存的作品 |", "new": "| 编号 | 前置条件 | 操作 | 可观察预期 |\n| --- | --- | --- | --- |\n| A14 | 小镇某任务有多张已提交作品 | 点击该任务已完成碎片 | 展示该任务首次成功提交并保存的作品 |"}, {"id": 4, "old": "| A16 | 12 月 25 日 00:00 前已达到 15 或 19 块碎片 | 大奖开放 | 分别累计获得 1 次或 2 次机会，扣除已使用次数 |", "new": "| 编号 | 前置条件 | 操作 | 可观察预期 |\n| --- | --- | --- | --- |\n| A16 | 12 月 25 日 00:00 前已达到 15 或 19 块碎片 | 大奖开放 | 分别累计获得 1 次或 2 次机会，扣除已使用次数 |"}, {"id": 6, "old": "| A16 | 12 月 25 日 00:00 前已达到 15 或 19 块碎片 | 大奖开放 | 分别累计获得 1 次或 2 次机会，扣除已使用次数 |", "new": "| 编号 | 前置条件 | 操作 | 可观察预期 |\n| --- | --- | --- | --- |\n| A16 | 12 月 25 日 00:00 前已达到 15 或 19 块碎片 | 大奖开放 | 分别累计获得 1 次或 2 次机会，扣除已使用次数 |"}, {"id": 10, "old": "| A15 | 存在可分享的纪念册 | 执行分享 | 提供 Facebook、X 分享；不计入每日作品分享奖励 |", "new": "| 编号 | 前置条件 | 操作 | 可观察预期 |\n| --- | --- | --- | --- |\n| A15 | 存在可分享的纪念册 | 执行分享 | 提供 Facebook、X 分享；不计入每日作品分享奖励 |"}];
  let acceptanceTablesUpdated = false;
  for (const fix of acceptanceTableFixes) {
    const annotation = state.annotations.find(a => a.id === fix.id);
    if (annotation && annotation.content.includes(fix.old) && !annotation.content.includes(fix.new)) {
      annotation.content = annotation.content.replace(fix.old, fix.new);
      acceptanceTablesUpdated = true;
    }
  }
  // Append source-approved additions without replacing browser-edited annotations.
  let contentUpdated = false;
  for (const [id, additions] of Object.entries(seed.contentAdditions || {})) {
    const annotation = state.annotations.find(a => String(a.id) === id);
    if (!annotation) continue;
    for (const text of additions) {
      if (!(annotation.content || '').includes(text)) {
        annotation.content = (annotation.content || '') + '\n\n' + text;
        contentUpdated = true;
      }
    }
  }
  let relatedIndex = 0, flowIndex = 0, zoom = 1, flowEpoch = 0, pickerCleanup = null, editor = null;
  let manager, flowScreen, relatedScreen;
  const popovers = new Map();
  const $ = (s, root = document) => root.querySelector(s);
  function escape(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function node(tag, cls, html) { const n = document.createElement(tag); n.className = cls || ''; if (html) n.innerHTML = html; return n; }
  function notice(text) { let n = $('#prd-hint'); if (!n) { n = node('div'); n.id = 'prd-hint'; document.body.append(n); } n.textContent = text; clearTimeout(n.timer); n.timer = setTimeout(() => n.remove(), 3600); }
  function persist(domain) { try { localStorage.setItem(key + '-' + domain, JSON.stringify(state[domain === 'main' ? 'annotations' : domain])); return true; } catch (_) { notice('浏览器存储失败，当前修改仍保留，请立即导出保存。'); return false; } }
  if (contentUpdated || acceptanceTablesUpdated) persist('main');
  function markdown(text) {
    const html = window.marked.parse(String(text || ''), { gfm: true, breaks: false });
    const template = document.createElement('template'); template.innerHTML = html;
    const allowed = new Set('P H1 H2 H3 H4 H5 H6 UL OL LI STRONG EM CODE PRE BLOCKQUOTE TABLE THEAD TBODY TR TH TD A BR HR DEL'.split(' '));
    const visit = parent => Array.from(parent.children).forEach(el => {
      if (!allowed.has(el.tagName)) { el.replaceWith(document.createTextNode(el.textContent)); return; }
      for (const a of Array.from(el.attributes)) {
        if (el.tagName === 'A' && a.name === 'href' && /^(https?:|mailto:|#)/i.test(a.value)) continue;
        el.removeAttribute(a.name);
      }
      if (el.tagName === 'A') { el.target = '_blank'; el.rel = 'noopener noreferrer'; }
      visit(el);
    }); visit(template.content);
    const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT); const texts = []; while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(n => { if (n.parentElement?.closest('pre,code')) return; const re = /(成功|警告|失败|错误|禁用)/g; if (!re.test(n.textContent)) return; const frag = document.createDocumentFragment(); let last = 0; n.textContent.replace(re, (v, _, at) => { frag.append(document.createTextNode(n.textContent.slice(last, at))); const dot = node('i', 'prd-status-dot'); dot.style.background = v === '成功' ? '#389e0d' : v === '警告' ? '#fa8c16' : v === '禁用' ? '#888' : '#cf1322'; frag.append(dot, document.createTextNode(v)); last = at + v.length; return v; }); frag.append(document.createTextNode(n.textContent.slice(last))); n.replaceWith(frag); });
    return template.innerHTML;
  }
  function isolate(el) { ['click','mousedown','mouseup','mousemove','pointerdown','pointerup','keydown'].forEach(type => el.addEventListener(type, e => e.stopPropagation())); }
  function draggable(el, handle, onEnd) {
    handle.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button,input,textarea,select')) return;
      e.preventDefault(); e.stopPropagation(); const rect = el.getBoundingClientRect(), sx = e.clientX, sy = e.clientY;
      el.style.right = 'auto'; el.style.bottom = 'auto'; el.style.margin = '0';
      function move(ev) { ev.preventDefault(); ev.stopPropagation(); el.style.left = Math.min(Math.max(0, rect.left + ev.clientX - sx), Math.max(0, innerWidth - 100)) + 'px'; el.style.top = Math.min(Math.max(0, rect.top + ev.clientY - sy), Math.max(0, innerHeight - 45)) + 'px'; }
      function up(ev) { ev.stopPropagation(); document.removeEventListener('pointermove', move, true); document.removeEventListener('pointerup', up, true); if (onEnd) onEnd(); }
      document.addEventListener('pointermove', move, true); document.addEventListener('pointerup', up, true);
    });
  }
  function closePop(key) { popovers.get(key)?.remove(); popovers.delete(key); }
  function openPopover(a, anchor, domain = 'main') {
    const k = domain === 'main' ? 'main-' + a.id : 'related-' + relatedIndex + '-' + a.id;
    if (popovers.has(k)) return;
    const p = node('section', 'prd-popover prd-ui'); p.dataset.domain = domain; p.dataset.key = k;
    p.innerHTML = '<div class="prd-pop-head"><span class="prd-badge">' + escape(a.id) + '</span><span class="prd-pop-title">需求描述：[' + escape(a.module) + ']</span><button aria-label="关闭批注">X</button></div><div class="prd-trace">来源章节：' + escape(a.sourceSection || '手动批注') + '<br>聚合范围：' + escape(a.aggregationBoundary || '所选页面元素') + '</div><div class="prd-pop-body prd-markdown">' + markdown(a.content) + '</div>';
    document.body.append(p); const r = anchor.getBoundingClientRect();
    p.style.left = Math.max(8, Math.min(r.left - 450, innerWidth - Math.min(450,innerWidth - 16) - 8)) + 'px';
    p.style.top = Math.max(8, Math.min(r.bottom + 8, innerHeight - p.getBoundingClientRect().height - 8)) + 'px';
    $('.prd-pop-head button', p).onclick = () => closePop(k); isolate(p); draggable(p, $('.prd-pop-head', p)); popovers.set(k, p);
  }
  function visible(el) { return !!el && !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden'; }
  function activeDialog() { const auth = $('#auth'); if (auth && !auth.hidden) return auth; return Array.from(document.querySelectorAll('#modal-root > .modal-overlay.is-open')).at(-1) || null; }
  function targetOf(a) {
    const dialog = activeDialog();
    if (dialog) { for (const s of a.modalTargets || []) { const el = $(s, dialog); if (visible(el)) return el; } return null; }
    try { return Array.from(document.querySelectorAll(a.target)).find(visible) || null; } catch (_) { return null; }
  }
  let badgesScheduled = false;
  function scheduleBadges() { if (badgesScheduled) return; badgesScheduled = true; requestAnimationFrame(() => { badgesScheduled = false; renderBadges(); }); }
  function renderBadges() {
    document.querySelectorAll('.prd-body-badge').forEach(n => n.remove());
    const hide = !!pickerCleanup || !!(relatedScreen && !relatedScreen.hidden) || !!(flowScreen && !flowScreen.hidden);
    for (const [k,p] of popovers) if (k.startsWith('main-')) p.hidden = hide || (!!activeDialog() && !targetOf(state.annotations.find(a => 'main-' + a.id === k) || {}));
    if (hide) return;
    state.annotations.forEach(a => {
      const t = targetOf(a); if (!t) return; const r = t.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      const b = node('button', 'prd-badge prd-body-badge'); b.textContent = a.id; b.dataset.prdId = a.id; b.title = a.module; b.setAttribute('aria-label','批注 ' + a.id + ' ' + a.module);
      b.style.left = Math.max(0, Math.min(innerWidth - 22, r.right - 12)) + window.scrollX + 'px'; b.style.top = Math.max(0, r.top - 8) + window.scrollY + 'px';
      b.addEventListener('mouseenter', () => openPopover(a,b)); b.onclick = e => { e.stopPropagation(); openPopover(a,b); }; document.body.append(b);
    });
  }
  async function locate(a) {
    manager.hidden = true;
    if (a.route) { notice('正在切换批注专用演示场景：' + a.module); await window.XMASAnnotationBridge.open(a.route); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); }
    else window.XMASAnnotationBridge.close();
    const t = targetOf(a); if (!t) { notice('当前场景无法定位，请核对模块前置条件或选择器。'); return; }
    t.scrollIntoView({block:'center',behavior:'instant'}); renderBadges(); const b = $('[data-prd-id="' + a.id + '"]') || t; openPopover(a,b);
  }
  function row(a, domain) {
    const r = node('div','prd-manager-row'); r.innerHTML = '<span class="prd-badge">' + escape(a.id) + '</span><strong>' + escape(a.module) + '</strong><div class="prd-row-actions"><button data-view>查看</button><button data-edit>编辑</button><button data-delete>删除</button></div>';
    $('[data-view]',r).onclick = () => domain === 'main' ? locate(a) : openRelatedPinPopover(a);
    $('[data-edit]',r).onclick = () => edit(a,false,domain);
    $('[data-delete]',r).onclick = () => confirmAction('删除批注 ' + a.id + '「' + a.module + '」？已有编号不会重排。',() => {
      if (domain === 'main') { state.annotations = state.annotations.filter(x => x !== a); persist('main'); }
      else { state.related[relatedIndex].pins = state.related[relatedIndex].pins.filter(x => x !== a); persist('related'); }
      closePop(domain === 'main' ? 'main-' + a.id : 'related-' + relatedIndex + '-' + a.id); renderManager(); renderRelated(); scheduleBadges();
    }); return r;
  }
  function renderManager() { const list = $('.prd-manager-list',manager); list.replaceChildren(...state.annotations.map(a => row(a,'main'))); }
  function confirmAction(message, action) {
    const mask = node('div','prd-dialog-mask prd-ui'); mask.innerHTML='<div class="prd-editor prd-confirm"><p>' + escape(message) + '</p><footer><button data-cancel>取消</button><button class="prd-primary" data-ok>确认</button></footer></div>';document.body.append(mask);isolate(mask);$('[data-cancel]',mask).onclick=()=>mask.remove();$('[data-ok]',mask).onclick=()=>{mask.remove();action();};
  }
  function edit(a,isNew,domain='main') {
    const mask = node('div','prd-dialog-mask prd-ui'); editor=mask;
    mask.innerHTML='<section class="prd-editor"><div class="prd-panel-head prd-editor-head"><h3>'+(isNew?'新增':'编辑')+'批注 '+escape(a.id)+'</h3><button data-cancel>X</button></div><div class="prd-editor-fields"><label>模块名称<input data-name value="'+escape(a.module)+'"></label><label>来源章节<input data-source value="'+escape(a.sourceSection||'手动批注')+'"></label></div><div class="prd-editor-columns"><textarea data-content aria-label="Markdown 需求内容"></textarea><div class="prd-editor-preview prd-markdown"></div></div><footer><button data-cancel-bottom>取消</button><button class="prd-primary" data-save>保存批注</button></footer></section>';
    document.body.append(mask);isolate(mask);draggable($('.prd-editor',mask),$('.prd-editor-head',mask));const content=$('[data-content]',mask);content.value=a.content||'';
    function preview(){$('.prd-editor-preview',mask).innerHTML=markdown(content.value);}content.oninput=preview;preview();
    function cancel(){mask.remove();editor=null;} $('[data-cancel]',mask).onclick=cancel;$('[data-cancel-bottom]',mask).onclick=cancel;
    $('[data-save]',mask).onclick=()=>{const name=$('[data-name]',mask).value.trim();if(!name){notice('请填写模块名称');return;}a.module=name;a.content=content.value;a.sourceSection=$('[data-source]',mask).value;
      if(isNew){if(domain==='main')state.annotations.push(a);else state.related[relatedIndex].pins.push(a);}
      persist(domain==='main'?'main':'related'); const k=domain==='main'?'main-'+a.id:'related-'+relatedIndex+'-'+a.id; const p=popovers.get(k);if(p){$('.prd-pop-title',p).textContent='需求描述：['+a.module+']';$('.prd-pop-body',p).innerHTML=markdown(a.content);$('.prd-trace',p).textContent='来源章节：'+a.sourceSection+'；聚合范围：'+(a.aggregationBoundary||'所选元素');}
      cancel();renderManager();renderRelated();scheduleBadges();notice('批注已保存到当前浏览器');};content.focus();
  }
  function uniqueSelector(el){if(el.id)return '#'+CSS.escape(el.id);const path=[];while(el&&el!==document.body){const parent=el.parentElement;if(!parent)break;const same=Array.from(parent.children).filter(n=>n.tagName===el.tagName);path.unshift(el.tagName.toLowerCase()+':nth-of-type('+(same.indexOf(el)+1)+')');if(parent.id){path.unshift('#'+CSS.escape(parent.id));break;}el=parent;}return path.join(' > ');}
  function nextId(list){return Math.max(0,...list.map(a=>Number(a.id)||0))+1;}
  function pickMain(){manager.hidden=true;const mask=node('div');mask.id='prd-pick-mask';const highlight=node('div');highlight.id='prd-pick-target';document.body.append(mask,highlight);document.body.classList.add('prd-picking');notice('点击页面模块添加批注，按 Esc 取消');
    function move(e){const el=document.elementFromPoint(e.clientX,e.clientY);if(!el||el.closest('#prd-tools,.prd-popover'))return;const r=el.getBoundingClientRect();Object.assign(highlight.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});}
    function clean(){mask.remove();highlight.remove();document.body.classList.remove('prd-picking');document.removeEventListener('click',click,true);document.removeEventListener('mousemove',move,true);document.removeEventListener('keydown',keyDown,true);pickerCleanup=null;scheduleBadges();}
    function keyDown(e){if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();clean();}}
    function click(e){if(e.target.closest('#prd-tools,.prd-popover'))return;e.preventDefault();e.stopImmediatePropagation();const el=e.target,route=activeDialog()?window.XMASAnnotationBridge.routeForDialog():null;clean();const id=nextId(state.annotations);if(id>999){notice('批注编号已达999上限');return;}edit({id,module:'新模块',target:uniqueSelector(el),route,modalTargets:activeDialog()?[uniqueSelector(el)]:[],sourceSection:'手动批注',aggregationBoundary:'所选页面元素',content:''},true);}
    pickerCleanup=clean;document.addEventListener('click',click,true);document.addEventListener('mousemove',move,true);document.addEventListener('keydown',keyDown,true);scheduleBadges();
  }
  function exportText(){let text='# 圣诞活动批注 PRD\n\n## 主页面批注\n\n';state.annotations.forEach(a=>{text+='### ['+a.id+'] '+a.module+'\n\n来源章节：'+a.sourceSection+'\n\n聚合范围：'+a.aggregationBoundary+'\n\n'+a.content+'\n\n';});text+='## 流程图\n\n';state.flows.forEach(f=>{text+='### '+f.title+'\n\n'+(f.type==='image'?'图片流程图（不具备结构化追溯）\n\n!['+f.title+']('+f.image+')':'```mermaid\n'+f.code+'\n```')+'\n\n';});text+='## 关联系统调整\n\n';state.related.forEach((r,i)=>{text+='### R'+(i+1)+' '+r.title+'\n\n所属系统：'+r.system+'\n\n来源：'+r.sourceSection+'\n\n';if(r.image)text+='!['+r.title+']('+r.image+')\n\n';r.pins.forEach(p=>{text+='#### ['+p.id+'] '+p.module+'\n\n位置：'+p.x.toFixed(2)+'%, '+p.y.toFixed(2)+'%\n\n'+p.content+'\n\n';});});return text;}
  async function exportPrd(){const text=exportText();if(window.showSaveFilePicker){try{const h=await window.showSaveFilePicker({suggestedName:'圣诞活动-批注导出.md',types:[{description:'Markdown',accept:{'text/markdown':['.md']}}]});const w=await h.createWritable();await w.write(text);await w.close();notice('批注、流程图和关联系统已导出');return;}catch(e){if(e.name==='AbortError')return;}}const u=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=node('a');a.href=u;a.download='圣诞活动-批注导出.md';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);notice('已通过浏览器下载导出，请在下载目录保留文件');}
  function imageFile(callback){const i=node('input');i.type='file';i.accept='image/*';i.onchange=()=>{const f=i.files[0];if(f)loadFile(f,callback);};i.click();}
  function loadFile(file,callback){if(!file?.type.startsWith('image/')){notice('请选择图片文件');return;}const r=new FileReader();r.onload=()=>callback(r.result);r.onerror=()=>notice('图片读取失败，请重试');r.readAsDataURL(file);}
  function buildFlow(){const w=node('section','prd-screen prd-ui');w.id='prd-flow-workspace';w.hidden=true;w.innerHTML='<header><strong>流程图 · 来源于 PRD</strong><button data-new>+ 新增流程</button><button data-delete>删除当前流程</button><button data-fold>折叠编辑区</button><button data-minus>缩小</button><button data-plus>放大</button><button data-reset>重置缩放</button><button data-full>全屏 / 退出全屏</button><button data-back>返回主页面</button></header><div class="prd-screen-body"><div class="prd-flow-edit"><select data-list aria-label="流程图列表"></select><input data-title aria-label="流程图名称"><div class="prd-code-wrap"><pre class="prd-lines"></pre><textarea data-code aria-label="Mermaid 流程代码" spellcheck="false"></textarea></div><button class="prd-primary" data-save>保存并预览</button><button data-image>上传 / 更换图片流程图</button><small>可在工作台粘贴截图；编辑代码后保存将切回 Mermaid。</small></div><div class="prd-flow-stage"><div class="prd-flow-preview"></div></div></div>';document.body.append(w);isolate(w);
    $('[data-back]',w).onclick=()=>{w.hidden=true;w.classList.remove('prd-full');tools.hidden=false;scheduleBadges();};$('[data-full]',w).onclick=()=>w.classList.toggle('prd-full');$('[data-fold]',w).onclick=()=>w.classList.toggle('prd-folded');
    $('[data-new]',w).onclick=()=>{state.flows.push({title:'新流程图',type:'mermaid',code:'flowchart TD\n  A[待补充：填写PRD来源流程]'});flowIndex=state.flows.length-1;persist('flow');renderFlow();};
    $('[data-delete]',w).onclick=()=>{if(state.flows.length===1){notice('至少保留一个流程图');return;}confirmAction('删除当前流程图？',()=>{state.flows.splice(flowIndex,1);flowIndex=0;persist('flow');renderFlow();});};
    $('[data-list]',w).onchange=e=>{flowIndex=Number(e.target.value);renderFlow();};$('[data-code]',w).oninput=()=>{syncLines();};$('[data-code]',w).onscroll=e=>{$('.prd-lines',w).scrollTop=e.target.scrollTop;};
    $('[data-save]',w).onclick=()=>{const f=state.flows[flowIndex];f.title=$('[data-title]',w).value.trim()||'未命名流程';f.code=$('[data-code]',w).value;f.type='mermaid';persist('flow');renderFlow();};
    const setZoom=v=>{zoom=Math.min(3,Math.max(.25,v));$('.prd-flow-preview',w).style.transform='scale('+zoom+')';};$('[data-minus]',w).onclick=()=>setZoom(zoom-.2);$('[data-plus]',w).onclick=()=>setZoom(zoom+.2);$('[data-reset]',w).onclick=()=>setZoom(1);
    $('[data-image]',w).onclick=()=>imageFile(data=>{state.flows[flowIndex].type='image';state.flows[flowIndex].image=data;persist('flow');renderFlow();});return w;
  }
  function syncLines(){const n=$('[data-code]',flowScreen).value.split('\n').length;$('.prd-lines',flowScreen).textContent=Array.from({length:n},(_,i)=>i+1).join('\n');}
  async function renderFlow(){if(!flowScreen)return;const f=state.flows[flowIndex];const select=$('[data-list]',flowScreen);select.innerHTML=state.flows.map((x,i)=>'<option value="'+i+'">'+escape(x.title)+'</option>').join('');select.value=flowIndex;$('[data-title]',flowScreen).value=f.title;$('[data-code]',flowScreen).value=f.code||'';syncLines();const preview=$('.prd-flow-preview',flowScreen);preview.replaceChildren();const epoch=++flowEpoch;if(f.type==='image'){const img=node('img');img.src=f.image;img.alt=f.title;preview.append(img);return;}try{const {svg}=await window.mermaid.render('prd-flow-svg-'+epoch,f.code);if(epoch===flowEpoch)preview.innerHTML=svg;}catch(e){if(epoch===flowEpoch){const err=node('div','prd-flow-error');err.textContent='流程图语法有误，请修改后保存。\n'+String(e.message||e);preview.replaceChildren(err);}}}
  function syncMainAnnotationChrome(hide){tools.hidden=hide;manager.hidden=true;for(const [k,p]of popovers)if(k.startsWith('main-')){if(hide)closePop(k);else p.hidden=false;}scheduleBadges();}
  function buildRelated(){const w=node('section','prd-screen prd-ui prd-full');w.id='prd-related-workspace';w.hidden=true;w.innerHTML='<header><strong data-page-title>关联系统</strong><button data-prd-preview-prev>上一页</button><button data-prd-preview-next>下一页</button><button data-page-new>+ 新增页面</button><button data-page-delete>删除页面</button><button data-prd-related-upload>上传截图</button><button data-prd-related-change>更换截图</button><button data-pin-new>+ 新增批注</button><button data-prd-related-manage>批注管理</button><button data-full>全屏 / 退出全屏</button><button data-back>返回主页面</button></header><div class="prd-related-body"><div class="prd-related-canvas"></div></div><aside class="prd-related-side" hidden><h3>关联页面批注管理</h3><div data-meta></div><div class="prd-manager-list"></div></aside>';document.body.append(w);isolate(w);
    $('[data-back]',w).onclick=()=>{w.hidden=true;w.classList.remove('prd-full');for(const [k]of popovers)if(k.startsWith('related-'))closePop(k);syncMainAnnotationChrome(false);};$('[data-full]',w).onclick=()=>w.classList.toggle('prd-full');
    $('[data-prd-related-manage]',w).onclick=()=>{$('.prd-related-side',w).hidden=!$('.prd-related-side',w).hidden;};
    function switchPage(i){for(const [k]of popovers)if(k.startsWith('related-'))closePop(k);relatedIndex=i;renderRelated();}
    $('[data-prd-preview-prev]',w).onclick=()=>switchPage(Math.max(0,relatedIndex-1));$('[data-prd-preview-next]',w).onclick=()=>switchPage(Math.min(state.related.length-1,relatedIndex+1));
    $('[data-page-new]',w).onclick=()=>{state.related.push({system:'待补充系统',title:'新关联页面',sourceSection:'手动新增',image:'',pins:[]});persist('related');switchPage(state.related.length-1);};
    $('[data-page-delete]',w).onclick=()=>{if(state.related.length===1){notice('至少保留一个关联页面');return;}confirmAction('删除当前关联页面及其批注？',()=>{state.related.splice(relatedIndex,1);persist('related');switchPage(0);});};
    function upload(){imageFile(data=>{state.related[relatedIndex].image=data;persist('related');renderRelated();});}$('[data-prd-related-upload]',w).onclick=upload;$('[data-prd-related-change]',w).onclick=upload;
    $('[data-pin-new]',w).onclick=()=>{const r=state.related[relatedIndex];if(nextId(r.pins)>999){notice('本页编号已达999上限');return;}const canvas=$('.prd-related-canvas',w);canvas.style.cursor='crosshair';notice('点击关联截图上的批注位置');canvas.onclick=e=>{if(e.target.closest('.prd-related-pin'))return;e.preventDefault();e.stopPropagation();const rect=canvas.getBoundingClientRect();const a={id:nextId(r.pins),module:'新关联批注',x:100*(e.clientX-rect.left)/rect.width,y:100*(e.clientY-rect.top)/rect.height,content:'',sourceSection:r.sourceSection,aggregationBoundary:r.system+' / '+r.title};canvas.onclick=null;canvas.style.cursor='';edit(a,true,'related');};};return w;
  }
  function renderRelated(){if(!relatedScreen)return;const w=relatedScreen,r=state.related[relatedIndex];$('[data-page-title]',w).textContent=r.system+' / '+r.title+' · '+(relatedIndex+1)+' / '+state.related.length;$('[data-prd-preview-prev]',w).disabled=relatedIndex===0;$('[data-prd-preview-next]',w).disabled=relatedIndex===state.related.length-1;
    const c=$('.prd-related-canvas',w);c.replaceChildren();if(r.image){const img=node('img');img.src=r.image;img.alt=r.title;c.append(img);}else{const empty=node('div','prd-related-empty');empty.innerHTML='<strong>'+escape(r.system)+' · '+escape(r.title)+'</strong><span>资料未提供此页面截图。点击上传截图，或 Cmd+V / Ctrl+V 粘贴截图。</span><small>'+escape(r.sourceSection)+'</small>';empty.onclick=()=>{if(!c.onclick)$('[data-prd-related-upload]',w).click();};c.append(empty);}
    r.pins.forEach(a=>{const b=node('button','prd-badge prd-related-pin');b.textContent=a.id;b.dataset.relatedPin=a.id;b.style.left=a.x+'%';b.style.top=a.y+'%';b.onmouseenter=()=>openRelatedPinPopover(a,b);b.onclick=e=>{e.stopPropagation();openRelatedPinPopover(a,b);};c.append(b);});
    $('.prd-manager-list',w).replaceChildren(...r.pins.map(a=>row(a,'related')));const meta=$('[data-meta]',w);meta.replaceChildren();for(const [field,label]of [['system','所属系统'],['title','页面名称']]){const line=node('div','prd-meta-row');line.innerHTML='<b>'+label+'：</b><span data-value>'+escape(r[field])+'</span> <button data-related-edit-meta="'+field+'">编辑</button><input data-related-meta-input="'+field+'" hidden><button data-related-save-meta="'+field+'" hidden>保存</button>';meta.append(line);const input=$('input',line);input.value=r[field];$('[data-related-edit-meta]',line).onclick=()=>{$('[data-value]',line).hidden=true;$('[data-related-edit-meta]',line).hidden=true;input.hidden=false;$('[data-related-save-meta]',line).hidden=false;input.focus();};$('[data-related-save-meta]',line).onclick=()=>{if(!input.value.trim()){notice('名称不能为空');return;}r[field]=input.value.trim();persist('related');renderRelated();};}}
  function openRelatedPinPopover(a,b){if(!b)b=$('[data-related-pin="'+a.id+'"]',relatedScreen);if(b)openPopover(a,b,'related');}
  const tools=node('nav','prd-ui');tools.id='prd-tools';tools.innerHTML='<span class="prd-grip" title="拖动批注工具条">⠿</span><button data-manager>批注管理</button><button data-flow>流程图</button><button data-related>关联系统</button>';document.body.append(tools);isolate(tools);
  if(state.toolbar){tools.style.left=Math.min(state.toolbar.x,innerWidth-100)+'px';tools.style.top=Math.min(state.toolbar.y,innerHeight-45)+'px';tools.style.right='auto';}draggable(tools,$('.prd-grip',tools),()=>{const r=tools.getBoundingClientRect();state.toolbar={x:r.left,y:r.top};persist('toolbar');});
  manager=node('aside','prd-ui');manager.id='prd-manager';manager.hidden=true;manager.innerHTML='<div class="prd-panel-head"><h3>批注管理</h3><button data-close>X</button></div><div class="prd-manager-list"></div><div class="prd-manager-foot"><button data-add>+ 新增批注</button><button data-export>导出 prd.md</button></div>';document.body.append(manager);isolate(manager);$('[data-close]',manager).onclick=()=>{manager.hidden=true;};$('[data-add]',manager).onclick=pickMain;$('[data-export]',manager).onclick=exportPrd;
  $('[data-manager]',tools).onclick=()=>{manager.hidden=!manager.hidden;renderManager();};$('[data-flow]',tools).onclick=()=>{if(!flowScreen)flowScreen=buildFlow();flowScreen.hidden=false;tools.hidden=true;manager.hidden=true;scheduleBadges();renderFlow();};$('[data-related]',tools).onclick=()=>{if(!relatedScreen)relatedScreen=buildRelated();relatedScreen.hidden=false;syncMainAnnotationChrome(true);renderRelated();};
  document.addEventListener('paste',e=>{if(editor||e.target.closest('input,textarea,[contenteditable]'))return;const item=Array.from(e.clipboardData?.items||[]).find(i=>i.type.startsWith('image/'));if(!item)return;if(relatedScreen&&!relatedScreen.hidden){e.preventDefault();loadFile(item.getAsFile(),data=>{state.related[relatedIndex].image=data;persist('related');renderRelated();});}else if(flowScreen&&!flowScreen.hidden){e.preventDefault();loadFile(item.getAsFile(),data=>{const f=state.flows[flowIndex];f.type='image';f.image=data;persist('flow');renderFlow();});}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(relatedScreen)relatedScreen.classList.remove('prd-full');if(flowScreen)flowScreen.classList.remove('prd-full');}},true);
  window.addEventListener('scroll',scheduleBadges,{passive:true,capture:true});window.addEventListener('resize',scheduleBadges);
  new MutationObserver(changes=>{if(changes.some(c=>!c.target.closest?.('.prd-ui,.prd-popover,#prd-hint')&&Array.from(c.addedNodes).some(n=>n.nodeType===1&&!n.classList.contains('prd-body-badge'))||c.type==='attributes'&&!c.target.closest?.('.prd-ui,.prd-popover,.prd-body-badge')))scheduleBadges();}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});
  window.openRelatedPinPopover=openRelatedPinPopover;window.syncMainAnnotationChrome=syncMainAnnotationChrome;
  renderManager();scheduleBadges();
})();
