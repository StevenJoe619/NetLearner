/**
 * app.js — 应用主逻辑
 *
 * 版本号用于缓存爆破
 */
const APP_VER = 'v4.1-20260526';

/* ============================================================
   Data Loading (with cache busting)
   ============================================================ */

let examMetaCache = null;

function cacheBust(url) {
  return url + '?v=' + encodeURIComponent(APP_VER);
}

async function loadExamMeta() {
  if (examMetaCache) return examMetaCache;
  try {
    const r = await fetch(cacheBust('questions/index.json'));
    examMetaCache = await r.json();
    return examMetaCache;
  } catch {
    // Fallback (should not happen with local server)
    examMetaCache = {
      exams: [
        { id:'ccna-level-demo', title:'CCNA (200-301) 水平测试 · 16题', type:'level-test', target:'CCNA', vendor:'cisco', questionCount:15, timeLimit:0 },
        { id:'ccna-mock-1', title:'CCNA (200-301) 模拟考试 · 103题', type:'mock-exam', target:'CCNA', vendor:'cisco', questionCount:100, timeLimit:120 },
        { id:'ccnp-encor-level-demo', title:'CCNP ENCOR (350-401) 水平测试 · 20题', type:'level-test', target:'CCNP ENCOR', vendor:'cisco', questionCount:20, timeLimit:0 },
        { id:'ccnp-encor-mock-1', title:'CCNP ENCOR (350-401) 模拟考试 · 60题', type:'mock-exam', target:'CCNP ENCOR', vendor:'cisco', questionCount:60, timeLimit:120 },
        { id:'hcia-level-demo', title:'HCIA-Datacom (H12-811) 水平测试 · 15题', type:'level-test', target:'HCIA', vendor:'huawei', questionCount:15, timeLimit:0 },
        { id:'hcia-mock-1', title:'HCIA-Datacom (H12-811) 模拟考试 · 60题', type:'mock-exam', target:'HCIA', vendor:'huawei', questionCount:60, timeLimit:120 },
        { id:'hcip-level-demo', title:'HCIP-Datacom (H12-821) 水平测试 · 20题', type:'level-test', target:'HCIP', vendor:'huawei', questionCount:20, timeLimit:0 },
        { id:'hcip-mock-1', title:'HCIP-Datacom (H12-821) 模拟考试 · 60题', type:'mock-exam', target:'HCIP', vendor:'huawei', questionCount:60, timeLimit:120 },
      ]
    };
    return examMetaCache;
  }
}

async function loadQs(examId) {
  try {
    const r = await fetch(cacheBust(`questions/generated/${examId}.json`));
    if (!r.ok) throw Error('404');
    const d = await r.json();
    return { questions: d.questions || d, meta: d._meta || d };
  } catch {
    toast('题库加载失败，请确认 node server.js 已启动');
    return null;
  }
}

/* ============================================================
   Global State
   ============================================================ */

let engine = null;
let curQs = null;
let curMeta = null;
let curResult = null;
let vendorFilter = 'all';

/* ============================================================
   Init
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
  applyTheme();
  applyLangUI();
  await loadExamMeta();
  renderHomeStats();
  renderMockList();
  updateStorageSize();
});

window.addEventListener('page-change', (e) => {
  const { page, params } = e.detail;
  if (page === 'page-home') renderHomeStats();
  if (page === 'page-level-test') resetLT();
  if (page === 'page-exam' && !params.get('file')) renderMockList();
  if (page === 'page-wrong-answers') { renderWA(); populateDomFilter(); }
  if (page === 'page-settings') updateStorageSize();
  if (page === 'page-result') renderResult();
  if (page === 'page-planner') renderPlan();

  if (page === 'page-exam' && params.get('file')) {
    loadExam(params.get('file'));
  }
});

/* ============================================================
   HOME
   ============================================================ */

function renderHomeStats() {
  const s = was.stats();
  const recs = storage.get('recs') || [];
  const el = document.getElementById('home-stats');
  if (!el) return;
  const vendorSet = new Set((examMetaCache?.exams || []).map(e => e.vendor || 'cisco'));
  const vendorBadges = [...vendorSet].map(v =>
    `<span class="vendor-stat v-${v}">${v === 'cisco' ? 'Cisco' : 'Huawei'}</span>`
  ).join('');
  el.innerHTML = `<div class="stats">
    <div class="card stat-card"><div class="num">${s.total}</div><div class="lbl">错题</div></div>
    <div class="card stat-card"><div class="num" style="color:var(--green)">${s.byStatus.mastered || 0}</div><div class="lbl">已掌握</div></div>
    <div class="card stat-card"><div class="num">${recs.length}</div><div class="lbl">考试次数</div></div>
    <div class="card stat-card"><div class="num" style="color:var(--blue)">${recs.length ? Math.round(recs.reduce((a,r)=>a+r.score,0)/recs.length) : '--'}</div><div class="lbl">平均分</div></div>
  </div>
  ${vendorBadges ? `<div class="vendor-stats">${vendorBadges}</div>` : ''}`;
}

/* ============================================================
   LEVEL TEST
   ============================================================ */

function resetLT() {
  document.getElementById('lt-setup').style.display = 'block';
  document.getElementById('lt-exam').style.display = 'none';
  engine = null;

  const container = document.getElementById('lt-buttons');
  if (!container || !examMetaCache) return;

  const lts = examMetaCache.exams.filter(e => e.type === 'level-test');
  const vendorOrder = ['cisco', 'huawei'];
  const groups = {};
  lts.forEach(e => {
    const v = e.vendor || 'cisco';
    if (!groups[v]) groups[v] = [];
    groups[v].push(e);
  });

  let html = `<div class="vendor-filter">
    <button class="vf-btn active" onclick="resetLT()">全部</button>
    ${vendorOrder.filter(v => groups[v]).map(v =>
      `<button class="vf-btn" onclick="filterLT('${v}')">${v === 'cisco' ? 'Cisco' : 'Huawei'}</button>`
    ).join('')}
  </div>`;

  vendorOrder.forEach(v => {
    if (!groups[v]) return;
    const label = v === 'cisco' ? 'Cisco' : 'Huawei';
    html += `<div class="vendor-section vendor-${v}">
      <h3 class="vendor-heading">${label}</h3>
      <div class="card-grid">
        ${groups[v].map(e =>
          `<div class="card card-feature" onclick="startLT('${e.target}')">
            <div class="icon">▣</div><h3>${e.title}</h3>
            <p>水平测试 · 快速摸底</p>
          </div>`
        ).join('')}
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

let ltVendorFilter = 'all';
function filterLT(v) {
  ltVendorFilter = v;
  const container = document.getElementById('lt-buttons');
  if (!container || !examMetaCache) return;
  const lts = examMetaCache.exams.filter(e => e.type === 'level-test');
  const filtered = v === 'all' ? lts : lts.filter(e => (e.vendor || 'cisco') === v);

  let html = `<div class="vendor-filter">
    <button class="vf-btn ${v === 'all' ? 'active' : ''}" onclick="filterLT('all')">全部</button>
    <button class="vf-btn ${v === 'cisco' ? 'active' : ''}" onclick="filterLT('cisco')">Cisco</button>
    <button class="vf-btn ${v === 'huawei' ? 'active' : ''}" onclick="filterLT('huawei')">Huawei</button>
  </div>`;

  const groups = {};
  filtered.forEach(e => {
    const vv = e.vendor || 'cisco';
    if (!groups[vv]) groups[vv] = [];
    groups[vv].push(e);
  });

  Object.entries(groups).forEach(([vv, exams]) => {
    const label = vv === 'cisco' ? 'Cisco' : 'Huawei';
    html += `<div class="vendor-section vendor-${vv}">
      <h3 class="vendor-heading">${label}</h3>
      <div class="card-grid">
        ${exams.map(e =>
          `<div class="card card-feature" onclick="startLT('${e.target}')">
            <div class="icon">▣</div><h3>${e.title}</h3>
            <p>水平测试 · 快速摸底</p>
          </div>`
        ).join('')}
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

async function startLT(target) {
  if (!examMetaCache) return;
  const lts = examMetaCache.exams.filter(e => e.type === 'level-test');
  const match = lts.find(e => e.target === target);
  if (!match) { toast(target + ' 暂未开放'); return; }

  // 大池抽取模式
  if (match.poolFile) {
    const poolData = await loadQs(match.poolFile);
    if (!poolData) return;
    const pool = poolData.questions || [];
    const qs = ExamEngine.pickFromPool(pool, match.questionCount || 10, match.weightings, ExamEngine.LEVEL_TEST_WEIGHTINGS[target]);
    if (!qs.length) { toast('题库为空'); return; }
    curQs = qs;
    curMeta = { title: target + ' 水平测试' };
    document.getElementById('lt-setup').style.display = 'none';
    document.getElementById('lt-exam').style.display = 'block';
    document.getElementById('lt-title').textContent = target + ' 水平测试';
    engine = new ExamEngine({ questions: curQs, mode: 'level-test', timeLimit: 0, allowBack: true });
    engine.start();
    renderLT();
    return;
  }

  // 兼容模式：加载固定文件
  const data = await loadQs(match.id);
  if (!data) return;

  curQs = data.questions;
  curMeta = data.meta;

  document.getElementById('lt-setup').style.display = 'none';
  document.getElementById('lt-exam').style.display = 'block';
  document.getElementById('lt-title').textContent = target + ' 水平测试';

  engine = new ExamEngine({ questions: curQs, mode: 'level-test', timeLimit: 0, allowBack: true });
  engine.start();
  renderLT();
}

function renderLT() {
  const s = engine.current();
  if (!s.q) return;
  const q = s.q;
  const body = document.getElementById('lt-body');
  const t = q.type || 'single';
  const sel = engine.getAns(q.id);

  const dc = domainClass(q.domain);
  const typeLabel = { single:'单选题', multiple:'多选题' };

  let optsHtml = '';
  if (t === 'multiple') {
    const selParts = sel ? sel.split(',') : [];
    optsHtml = q.options.map(o => {
      const k = o.charAt(0);
      const active = selParts.includes(k);
      return `<div class="option ${active?'sel':''}" onclick="multiLT('${q.id}','${k}')">${o}${active?' ✓':''}</div>`;
    }).join('');
    optsHtml += '<div style="margin-top:8px;font-size:12px;color:var(--text-muted)">多选：点击选择多个选项</div>';
  } else {
    optsHtml = q.options.map(o => {
      const k = o.charAt(0);
      return `<div class="option ${sel===k?'sel':''}" onclick="ansLT('${q.id}','${k}')">${o}</div>`;
    }).join('');
  }

  body.innerHTML = `<div class="card">
    <div style="font-size:13px;color:var(--text-muted);margin-bottom:10px">
      <span class="domain-badge ${dc}">${q.domain}</span>
      <span style="margin-left:6px">${typeLabel[t]||'单选题'} · 第 ${s.idx+1}/${s.total} 题</span>
    </div>
    ${qText(q)}
    ${optsHtml}
  </div>
  <div style="text-align:center;margin-top:12px">
    ${s.idx < s.total-1
      ? `<button class="btn btn-primary" id="lt-next" style="display:${sel?'':'none'}" onclick="nLT()">下一题 →</button>`
      : `<button class="btn btn-primary" id="lt-sub" style="display:${sel?'':'none'}" onclick="subLT()">📝 提交</button>`
    }
  </div>`;
}

function ansLT(id, k) {
  engine.answer(id, k);
  // 单选题答完立即跳到下一题
  const cur = engine.current();
  if (cur.q && cur.q.type !== 'multiple' && cur.idx < cur.total - 1) {
    engine.go('next');
  }
  renderLT();
}
function multiLT(id, k) { engine.toggleChoice(id, k); renderLT(); }
function nLT() { engine.go('next'); renderLT(); }

function subLT() {
  const st = engine.status();
  if (st.unanswered.length > 0) {
    confirm('确认交卷？', `${st.unanswered.length} 题未答，将计为错误。`, () => doSubLT());
  } else {
    doSubLT();
  }
}

function doSubLT() {
  const r = engine.submit();
  curResult = r;
  saveRec(r);
  was.batchAdd(r.wrongQuestions);
  const plan = generatePlan(r.level, r.target, getWeak(r));
  storage.set('plan', plan);
  sessionStorage.setItem('lr', JSON.stringify(r));
  router.go('/result');
}

/* ============================================================
   MOCK EXAM
   ============================================================ */

function setVendorFilter(v) {
  vendorFilter = v;
  renderMockList();
}

function renderMockList() {
  const el = document.getElementById('mock-list');
  if (!el || !examMetaCache) return;

  let exams = examMetaCache.exams.filter(e => e.type === 'mock-exam');
  if (vendorFilter !== 'all') {
    exams = exams.filter(e => (e.vendor || 'cisco') === vendorFilter);
  }
  if (!exams.length) { el.innerHTML = '<p class="text-muted">暂无模拟卷</p>'; return; }

  const vendorOrder = ['cisco', 'huawei'];
  const groups = {};
  exams.forEach(e => {
    const v = e.vendor || 'cisco';
    if (!groups[v]) groups[v] = [];
    groups[v].push(e);
  });

  let html = `<div class="vendor-filter">
    <button class="vf-btn ${vendorFilter === 'all' ? 'active' : ''}" onclick="setVendorFilter('all')">全部</button>
    <button class="vf-btn ${vendorFilter === 'cisco' ? 'active' : ''}" data-vf="cisco" onclick="setVendorFilter('cisco')">Cisco</button>
    <button class="vf-btn ${vendorFilter === 'huawei' ? 'active' : ''}" data-vf="huawei" onclick="setVendorFilter('huawei')">Huawei</button>
  </div>`;

  vendorOrder.forEach(v => {
    if (!groups[v]) return;
    const label = v === 'cisco' ? 'Cisco' : 'Huawei';
    html += `<div class="vendor-section vendor-${v}">
      <h3 class="vendor-heading">${label}</h3>
      <div class="card-grid">
        ${groups[v].map(e =>
          `<div class="card card-feature" onclick="loadExam('${e.id}')">
            <div class="icon">◷</div><h3>${e.title}</h3>
            <p>${e.timeLimit ? e.timeLimit+'min · 贴近真实考试' : ''}</p>
          </div>`
        ).join('')}
      </div>
    </div>`;
  });
  el.innerHTML = html;
  document.getElementById('mock-exam').style.display = 'none';
  document.getElementById('mock-list').style.display = 'block';
}

function backMock() {
  engine = null;
  document.getElementById('mock-exam').style.display = 'none';
  document.getElementById('mock-list').style.display = 'block';
}

async function loadExam(id) {
  // Check if this exam uses a pool
  const meta = examMetaCache?.exams.find(e => e.id === id);
  if (meta?.poolFile) {
    const poolData = await loadQs(meta.poolFile);
    if (!poolData) return;
    const pool = poolData.questions || [];
    const qs = ExamEngine.pickFromPool(pool, meta.questionCount || 60, meta.weightings, ExamEngine.TYPE_WEIGHTINGS[meta.target]);
    if (!qs.length) { toast('题库为空'); return; }
    curQs = qs;
    document.getElementById('mock-list').style.display = 'none';
    document.getElementById('mock-exam').style.display = 'block';
    document.getElementById('exam-name').textContent = meta.title || id;
    engine = new ExamEngine({ questions: curQs, mode: 'mock-exam', timeLimit: meta.timeLimit || 120, allowBack: true });
    engine.start();
    renderQ();
    startTimer();
    return;
  }

  // Legacy: load fixed exam file
  const data = await loadQs(id);
  if (!data) return;

  curQs = data.questions;
  curMeta = data.meta;

  document.getElementById('mock-list').style.display = 'none';
  document.getElementById('mock-exam').style.display = 'block';
  document.getElementById('exam-name').textContent = data.meta.title || id;

  engine = new ExamEngine({ questions: curQs, mode: 'mock-exam', timeLimit: data.meta.timeLimit || 120, allowBack: true });
  engine.start();
  renderQ();
  startTimer();
}

function renderQ() {
  const s = engine.current();
  if (!s.q) return;
  const q = s.q;
  const body = document.getElementById('exam-body');
  const t = q.type || 'single';

  document.getElementById('exam-pos').textContent = `${s.idx+1}/${s.total}`;
  document.getElementById('pf').style.width = `${((s.idx+1)/s.total)*100}%`;

  const dc = domainClass(q.domain);
  const ans = engine.getAns(q.id);
  const typeLabel = { single:'单选题', multiple:'多选题', fill:'填空题', drag:'拖拽题', boolean:'判断题' };

  let optsHtml = renderOpts(q, ans);
  
  body.innerHTML = `<div class="q-card">
    <div class="q-meta">
      <span class="domain-badge ${dc}">${q.domain}</span>
      <span style="font-size:11px;color:var(--text-muted);margin-left:6px">${typeLabel[t]||'单选题'}</span>
      ${engine.isMarked(q.id) ? '<span style="color:var(--orange);font-size:12px">● 已标记</span>' : ''}
    </div>
    ${qText(q)}
    ${optsHtml}
  </div>`;
  if (t === 'fill') {
    const inp = document.getElementById('fill-input');
    if (inp) { inp.focus(); inp.addEventListener('keydown', e => { if (e.key==='Enter') fillEx(q.id); }); }
  }
  updateSheet();
}

function multiEx(id, k) { engine.toggleChoice(id, k); renderQ(); }
function fillEx(id) {
  const v = document.getElementById('fill-input')?.value?.trim();
  if (v !== undefined) engine.answer(id, v);
  renderQ();
}
/* dragEx replaced by selectDrag/moveDrag/resetDrag - see below */

function ansEx(id, k) {
  engine.answer(id, k);
  const cur = engine.current();
  // 单选题/判断题答完自动跳到下一题
  if (cur.q && (cur.q.type === 'single' || cur.q.type === 'boolean') && cur.idx < cur.total - 1) {
    engine.go('next');
  }
  renderQ();
}

/* ============================================================
   Match (拖拽匹配) — 下拉选择
   ============================================================ */

function matchSelect(el) {
  const qId = el.dataset.q;
  const ri = parseInt(el.dataset.ri);
  const li = el.value;
  const q = engine.current().q;
  if (!q || q.id !== qId) return;
  
  let matches = engine.getAns(qId) ? engine.getAns(qId).split(',') : [];
  while (matches.length < (q.rightItems || []).length) matches.push('');
  
  if (li === '') {
    // 清空该槽位
    matches[ri] = '';
  } else {
    // 如果这个选项已经放在别处，先移除
    const prevIdx = matches.indexOf(li);
    if (prevIdx >= 0) matches[prevIdx] = '';
    // 放到目标槽位
    matches[ri] = li;
  }
  
  engine.answer(qId, matches.join(','));
  renderQ();
}

function resetMatch(qId) {
  const q = engine.current().q;
  if (!q || q.id !== qId) return;
  const empty = (q.rightItems || []).map(() => '');
  engine.answer(qId, empty.join(','));
  renderQ();
}

/* ============================================================
   Testlet (场景题) 交互
   ============================================================ */

function getTestletAns(qId) {
  try { return JSON.parse(engine.getAns(qId) || '[]'); } catch { return []; }
}

function saveTestletAns(qId, ansArr) {
  engine.answer(qId, JSON.stringify(ansArr));
  renderQ();
}

function ansTestlet(qId, qi, k) {
  const arr = getTestletAns(qId);
  arr[qi] = k;
  saveTestletAns(qId, arr);
}

function multiTestlet(qId, qi, k) {
  const arr = getTestletAns(qId);
  let current = (arr[qi] || '').split(',').filter(Boolean);
  const idx = current.indexOf(k);
  if (idx >= 0) current.splice(idx, 1); else current.push(k);
  arr[qi] = current.sort().join(',');
  saveTestletAns(qId, arr);
}

/* ============================================================
   Drag (排序拖拽) — 点击选中 + 上下移动 + 拖拽
   ============================================================ */

let _dragSelectedPos = null;

function selectDrag(pos) {
  _dragSelectedPos = _dragSelectedPos === pos ? null : pos;
  renderQ();
}

function moveDrag(qId, dir) {
  if (_dragSelectedPos === null) return;
  const newPos = _dragSelectedPos + dir;
  const q = engine.current().q;
  const opts = q.optionsEn || q.options;
  if (newPos < 0 || newPos >= opts.length) return;
  
  let order = (engine.getAns(qId) || '').split(',').filter(Boolean).map(Number);
  if (!order.length) order = opts.map((_, i) => i);
  
  // Swap
  [order[_dragSelectedPos], order[newPos]] = [order[newPos], order[_dragSelectedPos]];
  engine.answer(qId, order.join(','));
  _dragSelectedPos = newPos;
  renderQ();
}

function resetDrag(qId) {
  const q = engine.current().q;
  const opts = q.optionsEn || q.options;
  const order = opts.map((_, i) => i);
  engine.answer(qId, order.join(','));
  _dragSelectedPos = null;
  renderQ();
}

function dragStart(e, pos) {
  e.dataTransfer.setData('text/plain', pos);
  _dragSelectedPos = pos;
}

function dragDrop(e, targetPos) {
  e.preventDefault();
  const sourcePos = parseInt(e.dataTransfer.getData('text/plain'));
  if (sourcePos === targetPos) return;
  
  const q = engine.current().q;
  const opts = q.optionsEn || q.options;
  let order = (engine.getAns(q.id) || '').split(',').filter(Boolean).map(Number);
  if (!order.length) order = opts.map((_, i) => i);
  
  // Move source to target position
  const [item] = order.splice(sourcePos, 1);
  order.splice(targetPos, 0, item);
  engine.answer(q.id, order.join(','));
  _dragSelectedPos = targetPos;
  renderQ();
}

function examGo(dir) { engine.go(dir); renderQ(); }
function examMark() { const q = engine.current().q; if(q) { engine.toggleMark(q.id); renderQ(); } }

function startTimer() {
  setInterval(() => {
    const rem = engine.timeLeft();
    const m = Math.floor(rem / 60);
    const s = rem % 60;
    const el = document.getElementById('exam-timer');
    el.textContent = `⏱ ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    el.className = 'timer';
    if (rem <= 300) el.classList.add('timer-critical');
    else if (rem <= 900) el.classList.add('timer-warning');
  }, 1000);

  const check = setInterval(() => {
    if (engine.state() === 'submitted') { clearInterval(check); handleSub(); }
  }, 1000);
}

function toggleSheet() {
  const el = document.getElementById('sheet-box');
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
  if (el.style.display === 'block') updateSheet();
}

function updateSheet() {
  const st = engine.status();
  const grid = document.getElementById('sheet-grid');
  if (!grid) return;
  document.getElementById('sheet-cnt').textContent = `已答 ${st.answered.length}/${st.total}`;
  grid.innerHTML = curQs.map((q,i) => {
    const cls = [];
    if (i === st.idx) cls.push('cur');
    if (engine.getAns(q.id)) cls.push('done');
    if (engine.isMarked(q.id)) cls.push('marked');
    return `<div class="si ${cls.join(' ')}" onclick="jumpQ(${i})">${i+1}</div>`;
  }).join('');
}

function jumpQ(i) { engine.jump(i); renderQ(); document.getElementById('sheet-box').style.display='none'; }

function confirmSubmit() {
  const st = engine.status();
  confirm('确认交卷？', `${st.unanswered.length} 题未答，将计为错误。`, () => { engine.submit(); handleSub(); });
}

function handleSub() {
  const r = engine._result;
  curResult = r;
  saveRec(r);
  was.batchAdd(r.wrongQuestions);
  sessionStorage.setItem('lr', JSON.stringify(r));
  router.go('/result');
}

/* ============================================================
   RESULT
   ============================================================ */

function renderResult() {
  const raw = sessionStorage.getItem('lr');
  const box = document.getElementById('result-box');
  if (!raw) { box.innerHTML = '<div class="empty"><div class="icon">📊</div><p>暂无结果</p></div>'; return; }

  const r = JSON.parse(raw);
  curResult = r;
  const levelLabel = r.score >= 85 ? '🏆 高级' : r.score >= 60 ? '📌 中级' : '📖 初级';
  const t = Math.floor(r.timeSpentSeconds / 60);
  const ts = r.timeSpentSeconds % 60;

  const dc = {
    'Network Fundamentals':'#2e7d32','Network Access':'#1565c0','IP Connectivity':'#c62828',
    'IP Services':'#6a1b9a','Security Fundamentals':'#e65100','Automation':'#00695c',
    'Architecture':'#1565c0','Virtualization':'#6a1b9a','Infrastructure':'#c62828',
    'Network Assurance':'#00695c','Security':'#e65100',
    'Ethernet Switching':'#1565c0','IP Routing':'#c62828',
    'WAN Technologies':'#6a1b9a','Network Management':'#00695c',
    'Advanced IP Routing':'#c62828','Switching':'#1565c0',
    'MPLS/VPN':'#e65100','Network Reliability':'#00695c',
    'SDN & Automation':'#6a1b9a'
  };

  box.innerHTML = `<div class="result">
    <div class="big">${r.score}%</div>
    <div class="label">${levelLabel}</div>
    <div class="sub">${r.correct}/${r.total} 正确 · ${t}m ${ts}s</div>
  </div>
  <div class="ds-grid">${Object.entries(r.domains).map(([n,d]) =>
    `<div class="ds-card" style="background:${dc[n]||'#333'}">
      <div class="pct">${d.pct}%</div>
      <div class="name">${n}</div>
      <div class="cnt">${d.correct}/${d.total}</div>
    </div>`
  ).join('')}</div>
  <div style="text-align:center;margin-top:16px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
    <button class="btn btn-primary" onclick="goPlan()">📋 学习计划</button>
    <button class="btn" onclick="router.go('/wrong-answers')">❌ 错题</button>
    <button class="btn" onclick="router.go('/level-test')">🔄 重新测试</button>
  </div>`;
}

function getWeak(r) {
  if (!r.domains) return [];
  return Object.entries(r.domains).filter(([_,d]) => d.pct < 60).map(([n]) => n);
}

function goPlan() {
  const r = curResult;
  if (!r) { router.go('/planner'); return; }
  const p = generatePlan(r.level, r.target || 'CCNA', getWeak(r));
  storage.set('plan', p);
  router.go('/planner');
}

/* ============================================================
   WRONG ANSWERS
   ============================================================ */

function renderWA() {
  const dom = document.getElementById('wa-dom')?.value || '';
  const st = document.getElementById('wa-st')?.value || '';
  const filter = {};
  if (dom) filter.domain = dom;
  if (st) filter.status = st;

  const items = was.getAll(Object.keys(filter).length ? filter : null);
  const s = was.stats();

  document.getElementById('wa-stats').innerHTML = `<div class="stats">
    <div class="card stat-card"><div class="num">${s.total}</div><div class="lbl">总错题</div></div>
    <div class="card stat-card"><div class="num" style="color:var(--red)">${s.byStatus.need_review||0}</div><div class="lbl">需复习</div></div>
    <div class="card stat-card"><div class="num" style="color:var(--orange)">${s.byStatus.almost||0}</div><div class="lbl">基本掌握</div></div>
    <div class="card stat-card"><div class="num" style="color:var(--green)">${s.byStatus.mastered||0}</div><div class="lbl">已掌握</div></div>
  </div>`;

  const list = document.getElementById('wa-list');
  if (!items.length) {
    list.innerHTML = '<div class="empty"><div class="icon">✅</div><p>暂无错题</p><button class="btn btn-primary" onclick="router.go(\'/level-test\')">去测试</button></div>';
    return;
  }

  list.innerHTML = items.map(i => {
    const sc = i.status || 'need_review';
    return `<div class="card wi ${sc}" style="margin-bottom:10px">
      <div class="q-meta">
        <span class="domain-badge ${domainClass(i.domain)}">${i.domain}</span>
        <span style="font-size:12px;color:var(--text-muted)">${i.reviewCount||0}次复习</span>
      </div>
      <div class="q-text" style="font-size:14px">${i.questionText}</div>
      <div class="wa-display wa-user">❌ 你的答案: ${i.userAnswer ? i.options.find(o=>o.startsWith(i.userAnswer+'.'))||i.userAnswer : '未答'}</div>
      <div class="wa-display wa-correct">✅ 正确答案: ${i.options.find(o=>o.startsWith(i.correctAnswer+'.'))||i.correctAnswer}</div>
      <p style="font-size:13px;color:var(--text-secondary);margin:6px 0;line-height:1.6">${i.explanation}</p>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">
        <button class="btn btn-sm ${i.status==='need_review'?'btn-primary':''}" onclick="was.updateStatus('${i.id}','need_review');renderWA()">📖 仍需复习</button>
        <button class="btn btn-sm ${i.status==='almost'?'btn-primary':''}" onclick="was.updateStatus('${i.id}','almost');renderWA()">📌 基本掌握</button>
        <button class="btn btn-sm ${i.status==='mastered'?'btn-primary':''}" onclick="was.updateStatus('${i.id}','mastered');renderWA()">✅ 已掌握</button>
        <button class="btn btn-sm btn-danger" onclick="was.remove('${i.id}');renderWA()">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

function populateDomFilter() {
  const sel = document.getElementById('wa-dom');
  if (!sel) return;
  const items = was.getAll();
  const doms = [...new Set(items.map(i => i.domain))];
  sel.innerHTML = '<option value="">全部域</option>' + doms.map(d => `<option value="${d}">${d}</option>`).join('');
}

function clearWA() {
  confirm('清空错题本？', '建议先导出备份。', () => { was.clear(); renderWA(); toast('已清空'); });
}

async function startWR() {
  const items = was.reviewItems();
  if (!items.length) { toast('没有需要复习的错题'); return; }
  curQs = items.map(i => ({
    id: i.id, text: i.questionText, options: i.options,
    answer: i.correctAnswer, explanation: i.explanation,
    domain: i.domain, difficulty: i.difficulty, source: i.source, tags: i.tags || []
  }));
  sessionStorage.setItem('rq', JSON.stringify(curQs));
  router.go('/exam?file=wrong-review');
}

/* ============================================================
   PLANNER
   ============================================================ */

function renderPlan() {
  const p = storage.get('plan');
  if (!p || !p.weeklyPlans) {
    document.getElementById('planner-empty').style.display = 'block';
    document.getElementById('planner-box').style.display = 'none';
    return;
  }
  document.getElementById('planner-empty').style.display = 'none';
  document.getElementById('planner-box').style.display = 'block';
  document.getElementById('plan-title').textContent = p.title;
  document.getElementById('plan-sub').textContent = p.subtitle;
  document.getElementById('plan-weeks').innerHTML = p.weeklyPlans.map(w => `
    <div class="card wc">
      <div class="wh"><h3>${w.title}</h3><span class="h">⏱ ~${w.estimatedHours}h</span></div>
      ${(w.tasks||[]).filter(t=>t.day<=7).sort((a,b)=>a.day-b.day).map(t =>
        `<div class="ti"><span class="day">${t.dayLabel||'D'+t.day}</span><span class="tp tp-${t.type}">${t.type==='read'?'阅读':t.type==='practice'?'练习':'实验'}</span><span>${t.description}</span><span style="font-size:12px;color:var(--text-muted);margin-left:auto">${t.minutes}min</span></div>`
      ).join('')}
      ${w.milestone ? `<div style="margin-top:6px;font-size:12px;color:var(--green)">🎯 ${w.milestone}</div>` : ''}
    </div>
  `).join('');
}

function clearPlan() { confirm('清除计划？', '', () => { storage.remove('plan'); renderPlan(); }); }

/* ============================================================
   SETTINGS
   ============================================================ */

function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const s = storage.get('settings') || {};
  s.theme = t;
  storage.set('settings', s);
  document.querySelectorAll('.theme-opt').forEach(b => b.classList.toggle('active', b.dataset.t === t));
}

function applyTheme() {
  const s = storage.get('settings');
  setTheme(s?.theme || 'dark');
}

function applyLangUI() {
  const s = storage.get('settings');
  const lang = s?.lang || 'en';
  document.querySelectorAll('.lang-opt').forEach(b => b.classList.toggle('active', b.dataset.l === lang));
}

/* ============================================================
   Language setting (EN / Bilingual)
   ============================================================ */

function getLang() {
  const s = storage.get('settings');
  return s?.lang || 'en';
}

function setLang(l) {
  const s = storage.get('settings') || {};
  s.lang = l;
  storage.set('settings', s);
  document.querySelectorAll('.lang-opt').forEach(b => b.classList.toggle('active', b.dataset.l === l));
  // Re-render current question if in an exam
  if (engine && engine.current().q) {
    if (document.getElementById('mock-exam')?.style.display !== 'none') renderQ();
    if (document.getElementById('lt-exam')?.style.display !== 'none') renderLT();
  }
}

function qText(q) {
  const lang = getLang();
  // testlet 题不需要单独的题干，文本在 renderOpts 里处理
  if (q.type === 'testlet') return '';
  if (lang === 'bilingual') {
    const en = q.textEn || q.text;
    const cn = q.textCn || en;
    if (en !== cn) {
      return `<div class="q-text-en">${en}</div><div class="q-text-cn">${cn}</div>`;
    }
  }
  return `<div class="q-text">${q.textEn || q.text}</div>`;
}

function renderOpts(q, selAns) {
  const t = q.type || 'single';
  const opts = q.optionsEn || q.options;
  
  let html;
  
  // ---- match: 拖拽匹配 ----
  if (t === 'match') {
    const leftItems = q.leftItems || [];
    const rightItems = q.rightItems || [];
    const matches = selAns ? selAns.split(',') : [];
    // Build match state: for each right slot, which left index is placed there
    const placed = {};
    matches.forEach((li, ri) => { if (li !== '') placed[ri] = parseInt(li); });
    const usedLeft = new Set(Object.values(placed));
    
    html = '<div class="match-area">';
    html += '<div class="match-cols"><div class="match-left"><div class="match-col-header">选项</div>';
    leftItems.forEach((item, i) => {
      const isUsed = usedLeft.has(i);
      // Show the matched description name if placed
      let matchedTo = '';
      if (isUsed) {
        for (const [ri, li] of Object.entries(placed)) {
          if (li === i) { matchedTo = rightItems[parseInt(ri)]; break; }
        }
      }
      html += `<div class="match-item ${isUsed?'used':''}">${item}${isUsed ? '<br><span class="match-matched">→ '+matchedTo+'</span>' : ''}</div>`;
    });
    html += '</div><div class="match-right"><div class="match-col-header">请为每条描述选择对应的选项</div>';
    rightItems.forEach((item, i) => {
      const li = placed[i];
      html += `<div class="match-slot">
        <div class="match-desc">${item}</div>
        <select class="match-select" data-q="${q.id}" data-ri="${i}" onchange="matchSelect(this)">
          <option value="">-- 请选择 --</option>
          ${leftItems.map((liItem, liIdx) => {
            const selected = placed[i] === liIdx ? 'selected' : '';
            const disabled = usedLeft.has(liIdx) && placed[i] !== liIdx ? 'disabled' : '';
            return `<option value="${liIdx}" ${selected} ${disabled}>${liItem}</option>`;
          }).join('')}
        </select>
      </div>`;
    });
    html += '</div></div>';
    html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
      <span style="font-size:12px;color:var(--text-muted)">为每条描述从下拉框中选择对应的选项</span>
      <button class="btn btn-sm" onclick="resetMatch('${q.id}')">重置</button>
    </div>`;
    
  // ---- testlet: 场景题 ----
  } else if (t === 'testlet') {
    const scenario = q.scenario || '';
    const questions = q.testletQuestions || [];
    let ansArr = [];
    try { ansArr = selAns ? JSON.parse(selAns) : []; } catch {}
    
    html = `<div class="testlet-scenario">${scenario.replace(/'([^']+)'/g, "<code>$1</code>")}</div>`;
    questions.forEach((sq, qi) => {
      const sqAns = ansArr[qi] || '';
      const sqType = sq.type || 'single';
      const isMulti = sqType === 'multiple';
      const selParts = sqAns ? sqAns.split(',') : [];
      
      html += `<div class="testlet-q">
        <div class="testlet-q-header">问题 ${qi+1}:</div>
        <div class="q-text">${sq.text}</div>`;
      
      (sq.options || []).forEach(o => {
        const k = o.charAt(0);
        const active = isMulti ? selParts.includes(k) : sqAns === k;
        const click = isMulti ? `multiTestlet('${q.id}',${qi},'${k}')` : `ansTestlet('${q.id}',${qi},'${k}')`;
        html += `<div class="option ${active?'sel':''}" onclick="${click}">${o}${isMulti && active?' ✓':''}</div>`;
      });
      
      if (isMulti) html += '<div style="font-size:12px;color:var(--text-muted);margin:4px 0">多选：点击选择多个选项</div>';
      html += '</div>';
    });
    html += `<div style="margin-top:8px;font-size:12px;color:var(--text-muted)">场景题：阅读场景，回答所有子问题</div>`;
  
  // ---- single / boolean ----
  } else if (t === 'single' || t === 'boolean') {
    html = '';
    opts.forEach(o => {
      const k = o.charAt(0);
      const isSel = selAns === k;
      html += `<div class="option ${isSel?'sel':''}" onclick="ansEx('${q.id}','${k}')">${o}</div>`;
    });
  } else if (t === 'multiple') {
    const selParts = selAns ? selAns.split(',') : [];
    html = '';
    opts.forEach(o => {
      const k = o.charAt(0);
      const active = selParts.includes(k);
      html += `<div class="option ${active?'sel':''}" onclick="multiEx('${q.id}','${k}')">${o}${active?' ✓':''}</div>`;
    });
    html += '<div style="margin-top:8px;font-size:12px;color:var(--text-muted)">多选：点击选择多个选项</div>';
  } else if (t === 'fill') {
    html = `<input id="fill-input" type="text" class="fill-input" value="${selAns||''}" placeholder="在此输入答案..." autocomplete="off" style="width:100%;padding:12px 16px;background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);font-size:16px;font-family:inherit">
      <div style="margin-top:8px;display:flex;gap:6px">
        <button class="btn btn-sm btn-primary" onclick="fillEx('${q.id}')">确认答案</button>
      </div>`;
  } else if (t === 'drag') {
    const order = selAns ? selAns.split(',').map(Number) : opts.map((_,i) => i);
    html = `<div class="drag-list" data-q="${q.id}">`;
    order.forEach((itemIdx, pos) => {
      const isSel = _dragSelectedPos === pos;
      html += `<div class="drag-item ${isSel?'sel':''}" data-pos="${pos}" draggable="true"
        ondragstart="dragStart(event,${pos})" ondrop="dragDrop(event,${pos})" ondragover="event.preventDefault()"
        onclick="selectDrag(${pos})">
        <span class="drag-pos">${pos+1}</span>
        <span class="drag-text">${opts[itemIdx]}</span>
      </div>`;
    });
    html += `</div>`;
    html += `<div style="display:flex;gap:6px;margin-top:8px;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-sm ${_dragSelectedPos===null?'disabled':''}" onclick="moveDrag('${q.id}',-1)" ${_dragSelectedPos===null?'disabled':''}>▲ 上移</button>
      <button class="btn btn-sm ${_dragSelectedPos===null?'disabled':''}" onclick="moveDrag('${q.id}',1)" ${_dragSelectedPos===null?'disabled':''}>▼ 下移</button>
      <button class="btn btn-sm" onclick="resetDrag('${q.id}')">↺ 重置</button>
    </div>`;
    html += `<div style="font-size:12px;color:var(--text-muted);margin-top:6px;text-align:center">点击选中项目，再用上下按钮移动；或直接拖拽到目标位置</div>`;
  }
  return html;
}

function updateStorageSize() {
  const st = storage.stats();
  const el = document.getElementById('sz');
  if (el) el.textContent = (st.totalSize / 1024).toFixed(1) + ' KB';
}

async function importData() {
  try { const r = await storage.import(); toast(`导入 ${r.count} 项`); renderHomeStats(); renderWA(); updateStorageSize(); }
  catch(e) { if (e.message !== '取消') toast(e.message); }
}

function clearAll() { confirm('清除所有数据？', '建议先导出备份。', () => { storage.clear(); toast('已清除'); renderHomeStats(); renderWA(); updateStorageSize(); }); }

/* ============================================================
   HELPERS
   ============================================================ */

function domainClass(d) {
  const m = {
    'Network Fundamentals':'dn-nf','Network Access':'dn-na','IP Connectivity':'dn-ic',
    'IP Services':'dn-is','Security Fundamentals':'dn-sf','Automation':'dn-ap',
    'Architecture':'dn-na','Virtualization':'dn-is','Infrastructure':'dn-ic',
    'Network Assurance':'dn-ap','Security':'dn-sf',
    'Ethernet Switching':'dn-na','IP Routing':'dn-ic',
    'WAN Technologies':'dn-is','Network Management':'dn-ap',
    'Advanced IP Routing':'dn-ic','Switching':'dn-na',
    'MPLS/VPN':'dn-sf','Network Reliability':'dn-ap',
    'SDN & Automation':'dn-ap'
  };
  return m[d] || 'dn-nf';
}

function saveRec(r) {
  const recs = storage.get('recs') || [];
  recs.unshift({ id:r.id, type:r.type, target:r.target, date:r.date, score:r.score, total:r.total, correct:r.correct, timeSpentSeconds:r.timeSpentSeconds, level:r.level });
  if (recs.length > 50) recs.length = 50;
  storage.set('recs', recs);
}

/* ============================================================
   Modal / Toast
   ============================================================ */

function confirm(title, msg, onOk) {
  document.getElementById('modal-t').textContent = title;
  document.getElementById('modal-msg').textContent = msg;
  document.getElementById('modal').classList.add('open');
  document.getElementById('modal-confirm').onclick = () => { closeModal(); if (onOk) onOk(); };
}

function closeModal() { document.getElementById('modal').classList.remove('open'); }

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 2500);
}

/* ============================================================
   Handle wrong-review redirect
   ============================================================ */

window.addEventListener('page-change', (e) => {
  if (e.detail.page === 'page-exam') {
    const rq = sessionStorage.getItem('rq');
    if (rq && !e.detail.params.get('file')) {
      sessionStorage.removeItem('rq');
      curQs = JSON.parse(rq);
      document.getElementById('mock-list').style.display = 'none';
      document.getElementById('mock-exam').style.display = 'block';
      document.getElementById('exam-name').textContent = `错题重练 (${curQs.length} 题)`;
      engine = new ExamEngine({ questions: curQs, mode: 'wrong-review', timeLimit: 0, allowBack: true });
      engine.start();
      renderQ();
    }
  }
});
