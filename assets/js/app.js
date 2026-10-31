/* XPPen Christmas 2026 — game logic & UI
 * Front-end prototype only: state lives in localStorage, all draws and
 * fulfilment steps are simulated.
 */
(function () {
  'use strict';

  var D = window.XMASData;
  var ART = window.XMASArt;
  var CARDS = window.XMASCards;

  var TASKS = D.TASKS;
  var BY_ID = D.TASK_BY_ID;
  var EVENT = D.EVENT;
  var MILESTONES = D.MILESTONES;
  var SPECIAL = D.SPECIAL;
  var POOLS = D.PRIZE_POOLS;

  var START = new Date(EVENT.startISO);
  var END = new Date(EVENT.endISO);
  var SPEC_OPEN = new Date(EVENT.specialOpenISO);
  var SPEC_CLOSE = new Date(EVENT.specialCloseISO);
  var MAKEUP_START = new Date(EVENT.makeupStartISO);

  var SH_OFFSET = 8 * 3600 * 1000;
  var SH_TZ = 'Asia/Shanghai';
  var STORAGE_KEY = 'xppen-xmas-2026-v2';

  var COLORS = ['#1b2130', '#e4574c', '#f08a3c', '#e0a62f', '#2f7a5a', '#2d9cdb', '#7c6cf0', '#e86fa8'];
  var SIZES = [0.008, 0.016, 0.028];

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var I18N = window.XMASI18N;
  function t(key, vars) { return I18N.t(key, vars); }
  function isZh() { return I18N.current() === 'zh'; }
  function loc() { return isZh() ? 'zh-CN' : 'en-US'; }
  function L(obj, key) {
    if (!obj) return '';
    return isZh() ? (obj[key + 'Zh'] || obj[key]) : obj[key];
  }
  function taskName(task) { return L(task, 'name'); }
  function taskBlurb(task) { return L(task, 'blurb'); }
  function prizeName(p) { return L(p, 'name'); }
  function prizeNote(p) { return L(p, 'note'); }
  function milestoneLabel(m) { return L(m, 'label'); }
  function blessingList() { return isZh() && D.BLESSINGS_ZH ? D.BLESSINGS_ZH : D.BLESSINGS; }
  function chanceUnit(n) { return isZh() ? '次' : (n === 1 ? t('chance.unitOne') : t('chance.unit')); }
  function chanceCount(n) { return isZh() ? n + ' 次机会' : n + ' ' + chanceUnit(n); }
  function toGo(n) { return isZh() ? '还差 ' + n + ' 块' : n + (n === 1 ? ' piece' : ' pieces') + ' to go'; }
  function prizeById(id) {
    var all = POOLS.limited.concat(POOLS.special);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }
  function recordName(rec) { var p = prizeById(rec.prizeId); return p ? prizeName(p) : (rec.name || ''); }
  function recordNote(rec) { var p = prizeById(rec.prizeId); return p ? prizeNote(p) : (rec.note || ''); }
  function sourceLabel(rec) {
    if (rec.sourceKey === 'special') return t('stage.special');
    if (rec.sourceKey === 'limited') return t('draw.limitedName');
    if (rec.sourceKey) {
      var m = MILESTONES.filter(function (x) { return x.id === rec.sourceKey; })[0];
      if (m) return milestoneLabel(m);
    }
    return rec.source || '';
  }
  function nameOf(task) { return taskName(task); }

  /* ------------------------------------------------------------------ time */

  function toSH(date) { return new Date(date.getTime() + SH_OFFSET); }

  function shParts(date) {
    var d = toSH(date);
    var y = d.getUTCFullYear();
    var m = d.getUTCMonth() + 1;
    var day = d.getUTCDate();
    return {
      y: y, m: m, d: day,
      h: d.getUTCHours(), mi: d.getUTCMinutes(), s: d.getUTCSeconds(),
      key: y + '-' + String(m).padStart(2, '0') + '-' + String(day).padStart(2, '0')
    };
  }

  function shDate(y, m, d, h, mi) {
    return new Date(Date.UTC(y, m - 1, d, h || 0, mi || 0) - SH_OFFSET);
  }

  function sameDay(a, b) {
    var x = shParts(a), y = shParts(b);
    return x.y === y.y && x.m === y.m && x.d === y.d;
  }

  function fmtShort(date) {
    return new Intl.DateTimeFormat(loc(), { timeZone: SH_TZ, month: 'short', day: 'numeric' }).format(date);
  }

  function fmtLong(date) {
    return new Intl.DateTimeFormat(loc(), { timeZone: SH_TZ, month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  }

  function fmtClock(date) {
    return new Intl.DateTimeFormat('en-GB', { timeZone: SH_TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
  }

  function taskOpenAt(task) {
    if (task.day === 1) return shDate(2026, 12, 3, 10, 0);
    return shDate(2026, 12, 2 + task.day, 0, 0);
  }

  var simBaseMs = 0;
  var simAnchorMs = 0;

  function syncSimClock(source) {
    var src = source || state;
    simBaseMs = src && src.sim ? new Date(src.sim).getTime() : 0;
    simAnchorMs = Date.now();
  }

  function now() {
    if (state && state.sim) {
      if (!simBaseMs) syncSimClock();
      return new Date(simBaseMs + (Date.now() - simAnchorMs));
    }
    return new Date();
  }

  function eventPhase() {
    var n = now();
    if (n < START) return 'before';
    if (n >= END) return 'ended';
    return 'live';
  }

  function dayKey(date) { return shParts(date).key; }

  function eventDayIndex(date) {
    var p = shParts(date);
    if (p.m === 11) return 0;
    if (p.m === 12) return Math.max(1, Math.min(28, p.d - 2));
    return 28;
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  function countdownText(target) {
    var ms = target.getTime() - now().getTime();
    if (ms <= 0) return '';
    var total = Math.floor(ms / 1000);
    var days = Math.floor(total / 86400);
    var hours = Math.floor((total % 86400) / 3600);
    var mins = Math.floor((total % 3600) / 60);
    var secs = total % 60;
    if (days > 0) return (isZh() ? days + ' 天 ' : days + 'd ') + pad2(hours) + ':' + pad2(mins) + ':' + pad2(secs);
    return pad2(hours) + ':' + pad2(mins) + ':' + pad2(secs);
  }

  function countdownHMS(target) {
    var ms = target.getTime() - now().getTime();
    if (ms < 0) ms = 0;
    var total = Math.floor(ms / 1000);
    var hours = Math.floor(total / 3600);
    var mins = Math.floor((total % 3600) / 60);
    var secs = total % 60;
    return pad2(hours) + ':' + pad2(mins) + ':' + pad2(secs);
  }

  /* ----------------------------------------------------------------- state */

  function emptyState() {
    return {
      v: 3,
      user: null,
      sim: '2026-12-03T10:30:00+08:00',
      completed: {},
      energy: 0,
      nodes: {
        stage1: { achievedAt: null, endAt: null },
        stage2: { achievedAt: null, endAt: null },
        stage3: { achievedAt: null, endAt: null }
      },
      special: { chances: 0, used: 0 },
      prizes: [],
      freeWorks: [],
      share: { day: null, count: 0 },
      keepsake: { name: '', blessing: '', code: null, createdAt: null },
      seen: { complete: false },
      ui: { filter: 'all', selectedId: null, justSubmitted: null }
    };
  }

  var state;

  function save(opts) {
    opts = opts || {};
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      /* quota — keep the session alive; callers that need a hard failure check the return value */
      if (!opts.quiet && !save._warned) {
        save._warned = true;
        toast(t('toast.storageFull'));
      }
      return false;
    }
  }

  // New storage key + a deliberately fresh demo state. Old v1 data is not migrated.
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyState();
      var parsed = JSON.parse(raw);
      var base = emptyState();
      var s = Object.assign(base, parsed);
      s.nodes = {};
      MILESTONES.forEach(function (m) {
        var old = (parsed.nodes && parsed.nodes[m.id]) || {};
        s.nodes[m.id] = {
          achievedAt: old.achievedAt || null,
          endAt: old.endAt || null
        };
      });
      s.special = {
        chances: Math.max(0, (parsed.special && parsed.special.chances) || 0),
        used: Math.max(0, (parsed.special && parsed.special.used) || 0)
      };
      s.freeWorks = Array.isArray(parsed.freeWorks) ? parsed.freeWorks : [];
      s.share = Object.assign(base.share, parsed.share || {});
      s.keepsake = Object.assign(base.keepsake, parsed.keepsake || {});
      s.seen = Object.assign(base.seen, parsed.seen || {});
      s.ui = { filter: 'all', selectedId: null, justSubmitted: null };
      s.completed = parsed.completed || {};
      return s;
    } catch (err) {
      return emptyState();
    }
  }

  function fragments() { return Object.keys(state.completed).length; }

  function isDone(taskId) { return !!state.completed[taskId]; }

  function energy() { return state.energy || 0; }

  function unlockedStages() {
    return MILESTONES.filter(function (m) { return !!state.nodes[m.id].achievedAt; });
  }

  function highestStage() {
    var list = unlockedStages();
    return list[list.length - 1] || null;
  }

  function specialLimit() {
    if (fragments() >= SPECIAL.bonusAt) return 2;
    if (fragments() >= SPECIAL.at) return 1;
    return 0;
  }

  function specialRemaining() {
    return Math.max(0, specialLimit() - state.special.used);
  }

  function totalChances() { return energy(); }

  function specialWindowOpen() {
    var n = now();
    return n >= SPEC_OPEN && n < SPEC_CLOSE;
  }

  function taskStatus(task) {
    if (isDone(task.id)) return 'done';
    var n = now();
    if (n >= END) return 'closed';
    var open = taskOpenAt(task);
    if (n < open) return 'locked';
    if (sameDay(n, open)) return 'today';
    if (n >= MAKEUP_START) return 'makeup';
    return 'missed';
  }

  function todaysTask() {
    return TASKS.filter(function (t) { return taskStatus(t) === 'today'; })[0] || null;
  }

  function makeupTasks() {
    return TASKS.filter(function (t) { return taskStatus(t) === 'makeup'; });
  }

  function drawGate() {
    var win = limitedWindow();
    if (!win.open || energy() <= 0) return null;
    return win.node;
  }

  function syncSpecial() {
    var limit = specialLimit();
    var changed = false;
    if (state.special.chances !== limit) {
      state.special.chances = limit;
      changed = true;
    }
    if (state.special.used > limit) {
      state.special.used = limit;
      changed = true;
    }
    return changed;
  }

  function unlockNodes() {
    var opened = [];
    var n = now();
    MILESTONES.forEach(function (m) {
      var node = state.nodes[m.id];
      if (!node || node.achievedAt) return;
      if (fragments() < m.at) return;
      var endsAt = new Date(Math.min(n.getTime() + 24 * 3600 * 1000, END.getTime()));
      node.achievedAt = n.toISOString();
      node.endAt = endsAt.toISOString();
      opened.push(m.id);
    });
    return opened;
  }

  /* Each threshold opens its own 24h window. The effective limited window is
     the latest end among all achieved, not-yet-ended nodes. Event end caps it. */
  function limitedWindow() {
    var achieved = MILESTONES.map(function (m) {
      var node = state.nodes[m.id];
      return node && node.achievedAt ? { milestone: m, node: node, end: new Date(node.endAt) } : null;
    }).filter(Boolean);
    if (!achieved.length) return { open: false, none: true, node: null, end: null, expired: false };
    var latest = achieved.reduce(function (a, b) { return b.end > a.end ? b : a; });
    var open = now() < latest.end && eventPhase() === 'live';
    return { open: open, none: false, node: latest.milestone, end: latest.end, expired: !open && now() >= latest.end };
  }

  function limitedEnd() { return limitedWindow().end; }

  function limitedOpen() { return limitedWindow().open; }

  function limitedNode() { return limitedWindow().node; }

  /* ------------------------------------------------------------------ icons */

  function icon(name, cls) {
    return '<svg class="i ' + (cls || '') + '" aria-hidden="true"><use href="#' + name + '"/></svg>';
  }

  /* ------------------------------------------------------------------ toast */

  function toast(message, iconName) {
    var stack = $('#toasts');
    if (!stack) return;
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = icon(iconName || 'i-sparkle') + '<span>' + message + '</span>';
    stack.appendChild(el);
    setTimeout(function () {
      el.classList.add('is-out');
      setTimeout(function () { el.remove(); }, 320);
    }, 3200);
  }

  /* -------------------------------------------------------------------- fx */

  function burst(x, y, count, palette) {
    var layer = $('#fx');
    if (!layer) return;
    var colors = palette || ['#f7c869', '#ffe7b0', '#bfe3ff', '#ffffff'];
    for (var i = 0; i < count; i++) {
      var s = document.createElement('span');
      s.className = 'spark';
      var angle = Math.random() * Math.PI * 2;
      var dist = 30 + Math.random() * 110;
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
      s.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
      s.style.background = colors[i % colors.length];
      s.style.boxShadow = '0 0 10px ' + colors[i % colors.length];
      s.style.animationDelay = (Math.random() * 90) + 'ms';
      s.style.width = s.style.height = (3 + Math.random() * 5) + 'px';
      layer.appendChild(s);
      setTimeout(function (node) { return function () { node.remove(); }; }(s), 1200);
    }
  }

  function flyOrb(fromEl, toEl) {
    if (!fromEl || !toEl) return;
    var a = fromEl.getBoundingClientRect();
    var b = toEl.getBoundingClientRect();
    var orb = document.createElement('div');
    orb.className = 'fly-orb';
    orb.style.left = (a.left + a.width / 2 - 7) + 'px';
    orb.style.top = (a.top + a.height / 2 - 7) + 'px';
    $('#fx').appendChild(orb);
    var dx = (b.left + b.width / 2) - (a.left + a.width / 2);
    var dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        orb.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(.55)';
        orb.style.opacity = '0.1';
      });
    });
    setTimeout(function () { orb.remove(); }, 1300);
  }

  /* ------------------------------------------------------------------ modal */

  var openOverlays = [];

  function lockScroll() { document.body.classList.add('modal-open'); }

  function refreshScrollLock() {
    if (!openOverlays.length && $('#auth').hidden) document.body.classList.remove('modal-open');
  }

  function openModal(html, opts) {
    opts = opts || {};
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    var modal = document.createElement('div');
    modal.className = 'modal' + (opts.className ? ' ' + opts.className : '');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    if (opts.label) modal.setAttribute('aria-label', opts.label);
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = (opts.closable === false ? '' :
      '<button type="button" class="modal-close" data-close aria-label="' + t('common.close') + '">' + icon('i-close') + '</button>') + html;
    overlay.appendChild(modal);
    $('#modal-root').appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('is-open'); });
    lockScroll();

    var api = {
      overlay: overlay,
      modal: modal,
      closed: false,
      close: function () { closeModal(api); }
    };
    openOverlays.push(api);

    overlay.addEventListener('click', function (e) {
      if (opts.closable === false) return;
      if (e.target === overlay) api.close();
    });
    modal.addEventListener('click', function (e) {
      var closer = e.target.closest('[data-close]');
      if (closer && opts.closable !== false) api.close();
    });

    function onKey(e) {
      if (e.key === 'Escape' && opts.closable !== false) {
        e.preventDefault();
        api.close();
      }
    }
    document.addEventListener('keydown', onKey);
    api._onKey = onKey;

    setTimeout(function () {
      if (!api.closed) modal.focus({ preventScroll: true });
    }, 80);

    if (opts.onOpen) opts.onOpen(api);
    return api;
  }

  function closeModal(api) {
    if (!api || api.closed) return;
    api.closed = true;
    api.overlay.classList.remove('is-open');
    document.removeEventListener('keydown', api._onKey);
    setTimeout(function () {
      api.overlay.remove();
      openOverlays = openOverlays.filter(function (x) { return x !== api; });
      refreshScrollLock();
    }, 260);
  }

  function closeAllModals() {
    openOverlays.slice().forEach(closeModal);
  }

  /* ----------------------------------------------------------------- auth */

  function showAuth() {
    var auth = $('#auth');
    authOpenedAt = Date.now();
    auth.hidden = false;
    lockScroll();
    setTimeout(function () { var f = $('#auth-email'); if (f) f.focus(); }, 120);
  }

  function hideAuth() {
    var auth = $('#auth');
    if (auth) auth.hidden = true;
    if (!openOverlays.length) document.body.classList.remove('modal-open');
  }

  function requireAuth(action) {
    if (state.user) {
      if (action) action();
      return true;
    }
    pendingAuthAction = action || null;
    showAuth();
    return false;
  }

  function closeAuth() {
    pendingAuthAction = null;
    hideAuth();
  }

  function setUser(email) {
    var local = (email || 'demo@xp-pen.com').split('@')[0];
    var name = local.replace(/[._-]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }).trim() || 'Christmas Maker';
    state.user = {
      email: email,
      name: name,
      id: 'xm' + Math.random().toString(36).slice(2, 8)
    };
    save();
    hideAuth();
    renderAll();
    toast(t('auth.welcome', { name: state.user.name }), 'i-snow');
    var action = pendingAuthAction;
    pendingAuthAction = null;
    if (action) setTimeout(action, 240);
  }

  function initials(name) {
    var parts = (name || 'Demo Maker').split(/\s+/).filter(Boolean);
    return ((parts[0] || 'D')[0] + (parts[1] ? parts[1][0] : 'M')).toUpperCase();
  }

  /* ---------------------------------------------------------------- artwork */

  function buildScene() {
    var mount = $('#scene-mount');
    if (!mount) return;
    mount.innerHTML = ART.sceneSVG({ lang: I18N.current() });
    var mosaic = $('#mosaic');
    var order = ART.tileOrder();
    var dayForCell = {};
    order.forEach(function (pos, i) { dayForCell[pos] = i + 1; });
    var cells = '';
    for (var pos = 0; pos < 28; pos++) {
      var t = TASKS[dayForCell[pos] - 1];
      cells += '<div class="frag" data-task="' + t.id + '" data-tile="' + (pos + 1) + '" data-label="' +
        pad2(t.day) + ' · ' + taskName(t) + '"></div>';
    }
    mosaic.innerHTML = cells;
    mosaic.addEventListener('click', function (e) {
      var frag = e.target.closest('.frag');
      if (!frag) return;
      if (state.completed[frag.dataset.task]) openDoodle(frag.dataset.task);
    });
    var authScene = $('#auth-scene');
    if (authScene) authScene.innerHTML = ART.sceneSVG({ clean: true, fit: 'slice', lang: I18N.current() });
    var muralScene = $('#mural-scene');
    if (muralScene) muralScene.innerHTML = ART.sceneSVG({ clean: true, fit: 'slice', lang: I18N.current(), viewBox: '0 280 1120 420' });
  }

  function updateScene() {
    $$('.frag').forEach(function (el) {
      el.classList.toggle('is-lit', !!state.completed[el.dataset.task]);
      var task = BY_ID[el.dataset.task];
      if (task) el.dataset.label = pad2(task.day) + ' · ' + taskName(task);
    });
    if (state.ui.freshTask) {
      var fresh = $('.frag[data-task="' + state.ui.freshTask + '"]');
      if (fresh) {
        fresh.classList.add('is-lit', 'is-fresh');
        setTimeout(function () { fresh.classList.remove('is-fresh'); }, 1700);
      }
      state.ui.freshTask = null;
    }
  }

  function flashTown(tileTaskId) {
    var flash = $('#town-flash');
    flash.classList.remove('is-on');
    void flash.offsetWidth;
    flash.classList.add('is-on');
    var frag = $('.frag[data-task="' + tileTaskId + '"]');
    if (frag) {
      var r = frag.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 14, ['#f7c869', '#ffe7b0', '#ffffff']);
    }
  }

  /* ----------------------------------------------------------- snow / clock */

  function initSnow() {
    var canvas = $('#snow-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var parts = [];
    var w = 0, h = 0;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = w < 700 ? 34 : 64;
      parts = [];
      for (var i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.7 + Math.random() * 2.1,
          vy: 0.16 + Math.random() * 0.5,
          vx: -0.16 + Math.random() * 0.32,
          a: 0.14 + Math.random() * 0.5,
          p: Math.random() * Math.PI * 2
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var s = parts[i];
        ctx.globalAlpha = s.a;
        ctx.fillStyle = '#eaf3ff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function tick() {
      for (var i = 0; i < parts.length; i++) {
        var s = parts[i];
        s.y += s.vy;
        s.x += s.vx + Math.sin((s.y + s.p) / 60) * 0.14;
        if (s.y > h + 6) { s.y = -8; s.x = Math.random() * w; }
        if (s.x < -8) s.x = w + 8;
        if (s.x > w + 8) s.x = -8;
      }
      draw();
      requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', resize);
    if (reduced) draw(); else requestAnimationFrame(tick);
  }

  var clockTimer = null;

  function startClock() {
    if (clockTimer) clearInterval(clockTimer);
    clockTimer = setInterval(function () {
      var note = $('#studio-note');
      if (note && note.dataset.deadline) {
        var target = new Date(note.dataset.deadline);
        var txt = countdownText(target);
        if (txt) note.textContent = note.dataset.prefix + ' ' + txt;
      }
      var specialEl = $('#special-countdown');
      if (specialEl) {
        var t2 = new Date(specialEl.dataset.deadline);
        var txt2 = countdownText(t2);
        if (txt2) specialEl.textContent = txt2;
      }
    }, 1000);
  }

  /* ---------------------------------------------------------------- drawing */

  var pad = null;
  var currentStudio = null;
  var padTaskId = null;
  var redrawTask = null;
  var pendingAuthAction = null;
  var authOpenedAt = 0;
  var clearArmed = false;
  var clearTimer = null;
  var submitting = false;

  function initPad() {
    var canvas = $('#pad');
    pad = new window.DrawingPad(canvas, function (p) {
      updateToolState();
    });
    var paperEl = $('#paper');
    if (paperEl) {
      paperEl.addEventListener('pointerdown', function (e) {
        if (state.user) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        requireAuth(function () {
          paperEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
        });
      }, true);
    }

    var sw = $('#swatches');
    sw.innerHTML = COLORS.map(function (c, i) {
      return '<button type="button" class="swatch' + (i === 0 ? ' is-active' : '') + '" data-color="' + c +
        '" style="--c:' + c + '" aria-label="' + t('tool.colour', { n: i + 1 }) + '"></button>';
    }).join('');
    sw.addEventListener('click', function (e) {
      var b = e.target.closest('.swatch');
      if (!b) return;
      pad.setColor(b.dataset.color);
      $$('.swatch').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      setEraser(false);
      $('.paper').classList.remove('is-erasing');
    });

    var sz = $('#sizes');
    sz.innerHTML = SIZES.map(function (s, i) {
      var d = 5 + i * 4;
      return '<button type="button" class="size' + (i === 1 ? ' is-active' : '') + '" data-size="' + s +
        '" aria-label="' + t('tool.brushSize', { n: i + 1 }) + '"><i style="width:' + d + 'px;height:' + d + 'px"></i></button>';
    }).join('');
    sz.addEventListener('click', function (e) {
      var b = e.target.closest('.size');
      if (!b) return;
      pad.setSize(parseFloat(b.dataset.size));
      $$('.size').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      setEraser(false);
    });

    $('#tool-eraser').addEventListener('click', function () {
      setEraser(pad.tool !== 'eraser');
    });

    $('#tool-undo').addEventListener('click', function () {
      if (!pad.undo()) toast(t('toast.nothingUndo'));
    });

    $('#tool-clear').addEventListener('click', function () {
      var btn = $('#tool-clear');
      if (!pad.hasInk()) { toast(t('toast.emptyCanvas')); return; }
      if (!clearArmed) {
        clearArmed = true;
        btn.classList.add('is-armed');
        btn.querySelector('span').textContent = t('tool.sure');
        clearTimeout(clearTimer);
        clearTimer = setTimeout(resetClear, 3200);
        return;
      }
      pad.clear();
      resetClear();
      toast(t('toast.cleared'));
    });

    $('#tool-guide').addEventListener('click', function () {
      var on = !$('#tool-guide').classList.contains('is-on');
      $('#tool-guide').classList.toggle('is-on', on);
      $('#tool-guide').setAttribute('aria-pressed', on ? 'true' : 'false');
      $('#guide').classList.toggle('is-hidden', !on);
    });

    $('#submit-drawing').addEventListener('click', submitDrawing);

    $('#paper').addEventListener('pointerdown', function () {
      if (pad.tool === 'eraser') $('.paper').classList.add('is-erasing');
    });
    window.addEventListener('pointerup', function () {
      $('.paper').classList.remove('is-erasing');
    });
  }

  function resetClear() {
    clearArmed = false;
    var btn = $('#tool-clear');
    if (!btn) return;
    btn.classList.remove('is-armed');
    btn.querySelector('span').textContent = t('tool.clear');
  }

  function setEraser(on) {
    pad.setTool(on ? 'eraser' : 'brush');
    $('#tool-eraser').classList.toggle('is-on', on);
    $('#tool-eraser').setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) {
      $$('.swatch').forEach(function (x) { x.classList.remove('is-active'); });
    } else {
      var active = COLORS.indexOf(pad.color);
      $$('.swatch').forEach(function (x, i) { x.classList.toggle('is-active', i === (active < 0 ? 0 : active)); });
    }
  }

  function updateToolState() {
    var undo = $('#tool-undo');
    if (undo) undo.style.opacity = pad && pad.strokes.length ? '1' : '.45';
    var sub = $('#submit-drawing');
    if (sub) sub.classList.toggle('is-ready', !!(pad && pad.hasInk()));
  }

  function setGuide(task) {
    var guide = $('#guide');
    guide.innerHTML = task ? ART.icon(task.id) : '';
  }

  /* --------------------------------------------------------------- render UI */

  function renderAll() {
    var specialChanged = syncSpecial();
    if (specialChanged) save();
    updateHeader();
    updateScene();
    updateHero();
    renderStudio();
    updateChanceCard();
    renderMilestones();
    renderMural();
    renderPrizeStrip();
    updateShareRow();
  }

  function updateHeader() {
    $('#nav-energy').textContent = energy();
  }

  function heroCta() {
    var phase = eventPhase();
    if (phase === 'before') return { label: t('hero.cta.before'), action: 'before' };
    if (phase === 'ended') return { label: t('hero.cta.town'), action: 'town' };
    if (fragments() >= 28) return { label: t('hero.cta.keepsake'), action: 'keepsake' };
    var today = todaysTask();
    if (today && !isDone(today.id)) return { label: t('hero.cta.start'), action: 'studio' };
    if (makeupTasks().length) return { label: t('hero.cta.makeup'), action: 'studio' };
    return { label: t('hero.cta.done'), action: 'done' };
  }

  function updateHero() {
    $('#stat-energy').textContent = energy();
    $('#stat-pieces').textContent = fragments();
    $('#town-count').textContent = t('town.lit', { n: pad2(fragments()) });
    $('#plaque-count').textContent = pad2(fragments());
    $('#collection-count').textContent = fragments();
    var n = now();
    var phase = eventPhase();
    var dayLabel, daySub;
    if (phase === 'before') {
      dayLabel = t('town.preseason');
      daySub = t('town.opensShort');
      $('#plaque-date').textContent = t('town.opens');
    } else if (phase === 'ended') {
      dayLabel = t('town.closedShort');
      daySub = fmtShort(END);
      $('#plaque-date').textContent = t('town.closed');
    } else {
      dayLabel = t('town.dayShort', { n: pad2(eventDayIndex(n)) });
      daySub = fmtShort(n);
      $('#plaque-date').textContent = t('town.plaqueLive', { date: fmtShort(n), n: pad2(eventDayIndex(n)) });
    }
    $('#day-chip').innerHTML = '<b>' + dayLabel + '</b><span>' + daySub + '</span>';

    var cta = heroCta();
    $('#hero-cta-label').textContent = cta.label;
    $('#hero-cta').dataset.action = cta.action;
  }

  function showGate(opts) {
    var gate = $('#studio-gate');
    gate.hidden = false;
    $('#studio-body').hidden = true;
    $('#studio-done').hidden = true;
    $('#makeup-picker').hidden = true;
    $('.task-head').style.display = 'none';
    gate.querySelector('.gate-icon').innerHTML = icon(opts.icon || 'i-gift');
    $('#gate-title').textContent = opts.title;
    $('#gate-copy').textContent = opts.copy;
    var cta = $('#gate-cta');
    cta.innerHTML = opts.cta + ' ' + icon('i-arrow');
    cta.hidden = !opts.cta;
    gate._handler = opts.handler || null;
    if (opts.note) {
      $('#studio-note').textContent = opts.note;
      delete $('#studio-note').dataset.deadline;
    }
  }

  function taskHeader(task, mode) {
    $('#task-icon').innerHTML = ART.icon(task.id);
    $('#task-day').textContent = t('studio.day', { n: pad2(task.day) }) + ' · ' + fmtShort(taskOpenAt(task));
    $('#task-name').textContent = taskName(task);
    $('#task-blurb').textContent = taskBlurb(task);
    var badge = $('#task-badge');
    if (mode === 'makeup') {
      badge.textContent = t('studio.makeupNoChance');
      badge.classList.add('is-makeup');
    } else if (mode === 'redraw') {
      badge.textContent = t('studio.redrawBadge');
      badge.classList.add('is-makeup');
    } else {
      badge.textContent = t('studio.reward');
      badge.classList.remove('is-makeup');
    }
    var sub = $('#submit-drawing');
    sub.querySelector('span').textContent = mode === 'makeup' ? t('studio.submitMakeup') : mode === 'redraw' ? t('studio.update') : t('studio.submit');
    sub.querySelector('.submit-plus').textContent = mode === 'makeup' ? t('studio.noChance') : mode === 'redraw' ? t('studio.noExtra') : t('studio.reward');
    $('#canvas-mode').textContent = mode === 'makeup' ? t('studio.canvasHintMakeup') : mode === 'redraw' ? t('studio.canvasHintRedraw') : t('studio.canvasHint');
    $('.task-head').style.display = '';
  }

  function showTodayDone(task, makeups) {
    currentStudio = null;
    $('#studio-gate').hidden = true;
    $('#studio-body').hidden = true;
    $('#studio-done').hidden = false;
    $('#makeup-picker').hidden = makeups.length === 0;
    taskHeader(task, 'daily');
    var rec = state.completed[task.id];
    var pieceNo = TASKS.filter(function (t) { return t.day <= task.day && isDone(t.id); }).length;
    $('#done-title').textContent = t('done.title');
    $('#done-copy').textContent = rec && rec.makeup ? t('done.makeupCopy') : t('done.energyCopy', { n: pieceNo });
    $('#done-view').dataset.task = task.id;
    var artEl = $('#done-art');
    if (artEl) {
      if (rec && rec.art) {
        artEl.src = rec.art;
        artEl.hidden = false;
      } else {
        artEl.hidden = true;
        artEl.removeAttribute('src');
      }
    }
    $('#done-share').hidden = false;
    if (makeups.length) renderMakeupChips(makeups, null, 'daily');
    var note = $('#studio-note');
    delete note.dataset.deadline;
    var next = nextOpenAt();
    note.textContent = next > now() ? t('studio.noteNextOnly', { time: countdownText(next) }) : t('studio.noteLast');
  }

  function showFreeStudio() {
    currentStudio = { mode: 'free' };
    $('#studio-gate').hidden = true;
    $('#studio-body').hidden = false;
    $('#studio-done').hidden = true;
    $('#makeup-picker').hidden = true;
    $('#task-icon').innerHTML = icon('i-sparkle');
    $('#task-day').textContent = t('studio.freeKicker');
    $('#task-name').textContent = t('studio.freeTitle');
    $('#task-blurb').textContent = t('studio.freeBlurb');
    var badge = $('#task-badge');
    badge.textContent = t('studio.freeBadge');
    badge.classList.add('is-makeup');
    var sub = $('#submit-drawing');
    sub.querySelector('span').textContent = t('studio.freeSave');
    sub.querySelector('.submit-plus').textContent = t('studio.freeNoReward');
    $('#canvas-mode').textContent = t('studio.freeCanvasHint');
    $('.task-head').style.display = '';
    if (padTaskId !== '__free__') {
      padTaskId = '__free__';
      setGuide(null);
      if (pad) pad.clear();
    }
    var note = $('#studio-note');
    delete note.dataset.deadline;
    note.textContent = t('studio.freeNote');
    updateToolState();
  }

  function renderStudio() {
    var phase = eventPhase();
    var todayCard = TASKS.filter(function (t) { return sameDay(now(), taskOpenAt(t)); })[0] || null;
    var todayAvailable = todayCard && !isDone(todayCard.id) ? todayCard : null;
    var makeups = makeupTasks();
    var frag = fragments();
    var note = $('#studio-note');

    if (phase === 'before') {
      currentStudio = null;
      showGate({
        icon: 'i-calendar',
        title: t('gate.beforeTitle'),
        copy: t('gate.beforeCopy'),
        cta: t('gate.beforeCta'),
        handler: openRules,
        note: t('gate.beforeNote', { time: countdownText(START) })
      });
      return;
    }

    if (phase === 'ended') {
      currentStudio = null;
      showGate({
        icon: 'i-lock',
        title: t('gate.endedTitle'),
        copy: t('gate.endedCopy'),
        cta: t('gate.endedCta'),
        handler: openPrizes,
        note: t('gate.endedNote')
      });
      return;
    }

    if (currentStudio && currentStudio.mode === 'free') { showFreeStudio(); return; }

    if (frag >= 28) {
      currentStudio = null;
      showGate({
        icon: 'i-sparkle',
        title: t('gate.completeTitle'),
        copy: t('gate.completeCopy'),
        cta: t('gate.completeCta'),
        handler: openKeepsake,
        note: t('gate.completeNote')
      });
      return;
    }

    // just submitted today's element this session
    if (state.ui.justSubmitted === 'daily' && todayCard && isDone(todayCard.id)) {
      showTodayDone(todayCard, makeups);
      return;
    }

    // resolve what should be in the studio
    var current = null;
    var mode = null;
    if (state.ui.selectedId) {
      var sel = BY_ID[state.ui.selectedId];
      var selStatus = sel ? taskStatus(sel) : null;
      if (sel && !isDone(sel.id) && (selStatus === 'today' || selStatus === 'makeup')) {
        current = sel;
        mode = selStatus === 'today' ? 'daily' : 'makeup';
      } else {
        state.ui.selectedId = null;
      }
    }
    if (!current && todayAvailable) { current = todayAvailable; mode = 'daily'; }
    if (!current && makeups.length) { current = makeups[0]; mode = 'makeup'; }

    if (!current) {
      if (todayCard && isDone(todayCard.id)) {
        showTodayDone(todayCard, makeups);
        return;
      }
      currentStudio = null;
      showGate({
        icon: 'i-calendar',
        title: t('gate.caughtTitle'),
        copy: t('gate.caughtCopy'),
        cta: t('gate.caughtCta'),
        handler: function () { document.getElementById('top').scrollIntoView({ behavior: 'smooth' }); },
        note: t('gate.caughtNote', { time: countdownText(nextOpenAt()) })
      });
      return;
    }

    currentStudio = { task: current, mode: mode };
    $('#studio-gate').hidden = true;
    $('#studio-body').hidden = false;
    $('#studio-done').hidden = true;
    taskHeader(current, mode);

    if (padTaskId !== current.id) {
      padTaskId = current.id;
      setGuide(current);
      if (pad) pad.clear();
    }

    if (mode === 'makeup' && todayCard && isDone(todayCard.id)) {
      delete note.dataset.deadline;
      note.textContent = t('studio.noteMakeupToday');
    } else if (mode === 'makeup') {
      delete note.dataset.deadline;
      note.textContent = t('studio.noteMakeup');
    } else {
      var next = nextOpenAt();
      note.dataset.deadline = next.toISOString();
      note.dataset.prefix = t('studio.countdown');
      note.textContent = t('studio.noteDaily', { time: countdownText(next) });
    }

    $('#makeup-picker').hidden = makeups.length === 0;
    if (makeups.length) renderMakeupChips(makeups, current, mode);
    updateToolState();
  }

  function nextOpenAt() {
    var n = now();
    var candidates = TASKS.map(taskOpenAt).filter(function (d) { return d > n; });
    if (candidates.length) return candidates[0];
    return END;
  }

  function renderMakeupChips(makeups, current, mode) {
    var wrap = $('#makeup-chips');
    var html = '';
    var today = todaysTask();
    if (mode === 'makeup' && today) {
      html += '<button type="button" class="makeup-chip is-today" data-select="">' +
        ART.icon(today.id) + t('makeup.today', { name: taskName(today) }) + '</button>';
    }
    html += makeups.map(function (task) {
      return '<button type="button" class="makeup-chip' + (current && task.id === current.id ? ' is-active' : '') +
        '" data-select="' + task.id + '">' + ART.icon(task.id) + t('makeup.chip', { name: taskName(task) }) + '</button>';
    }).join('');
    wrap.innerHTML = html;
  }

  function updateChanceCard() {
    var total = energy();
    $('#chance-num').textContent = total;
    var unitEl = $('#chance-unit');
    if (unitEl) unitEl.textContent = total === 1 ? t('energy.unitOne') : t('energy.unit');

    var note = $('#chance-note');
    var phase = eventPhase();
    if (phase === 'ended') {
      note.textContent = t('chance.noteEnded');
    } else if (phase === 'before') {
      note.textContent = t('chance.noteBefore');
    } else if (total > 0) {
      if (unlockedStages().length) {
        note.textContent = t('chance.energyNote', { n: total });
      } else {
        var next = MILESTONES.filter(function (m) { return !state.nodes[m.id].achievedAt; })[0];
        note.textContent = t('chance.energyBanked', { n: total, toGo: next ? toGo(next.at - fragments()) : '' });
      }
    } else {
      var future = MILESTONES.filter(function (m) { return !state.nodes[m.id].achievedAt; })[0];
      if (fragments() === 0) {
        note.textContent = t('chance.noteFirst');
      } else if (future) {
        note.textContent = t('chance.noEnergyNext', { n: future.at - fragments(), stage: milestoneLabel(future) });
      } else if (fragments() >= 18) {
        note.textContent = t('chance.noEnergyCap');
      } else {
        note.textContent = t('chance.noEnergy');
      }
    }

    var fillPct = Math.min(100, fragments() / 28 * 100);
    $('#nm-fill').style.width = fillPct + '%';
    var nextM = MILESTONES.filter(function (m) { return fragments() < m.at; })[0];
    if (eventPhase() === 'ended') {
      $('#nm-label').textContent = t('chance.nmClosed');
      $('#nm-count').textContent = t('chance.nmThanks');
    } else if (nextM) {
      $('#nm-label').textContent = t('chance.nmNext');
      $('#nm-count').textContent = toGo(nextM.at - fragments());
    } else {
      $('#nm-label').textContent = t('chance.nmAll');
      $('#nm-count').textContent = eventPhase() === 'ended' ? t('chance.nmEnded') : t('chance.nmChristmas');
    }
    $('#nm-ticks').innerHTML = [6, 12, 18, 23].map(function (n) {
      var left = n / 28 * 100;
      return '<span class="nm-tick' + (fragments() >= n ? ' is-past' : '') + '" style="left:' + left + '%"></span>' +
        '<span class="nm-tick-label" style="left:' + left + '%">' + n + '</span>';
    }).join('');
    updateDrawEntry();
  }

  function drawEntryState(kind) {
    kind = kind || 'limited';
    var phase = eventPhase();
    if (phase === 'before') return { ready: false, kind: 'before', label: t('draw.entryBefore'), sub: t('draw.subBefore') };
    if (phase === 'ended') return { ready: false, kind: 'ended', label: t('draw.entryEnded'), sub: t('draw.subEnded') };

    if (kind === 'special') {
      var rem = specialRemaining();
      if (now() >= SPEC_CLOSE) {
        return { ready: false, kind: 'special-ended', label: t('draw.specialClosed'), sub: t('draw.specialEndedSub') };
      }
      if (now() < SPEC_OPEN) {
        if (fragments() < SPECIAL.at) {
          return { ready: false, kind: 'special-locked', label: t('draw.specialName'), sub: t('draw.specialLockedSub') };
        }
        return { ready: false, kind: 'special-soon', label: t('draw.specialName'), sub: t('draw.specialSoonSub', { n: rem }) };
      }
      if (fragments() < SPECIAL.at) {
        return { ready: false, kind: 'special-nofund', label: t('draw.specialNoFundLabel'), sub: t('draw.specialLockedSub') };
      }
      if (rem <= 0) {
        return { ready: false, kind: 'special-used', label: t('draw.specialUsedLabel'), sub: t('draw.specialUsedSub') };
      }
      return {
        ready: true, kind: 'special', remain: rem,
        label: t('draw.specialName'),
        sub: t('draw.specialOpenSub', {
          n: rem,
          t: countdownText(SPEC_CLOSE),
          date: fmtLong(SPEC_CLOSE),
          time: fmtClock(SPEC_CLOSE)
        })
      };
    }

    var win = limitedWindow();
    var next = MILESTONES.filter(function (m) { return !state.nodes[m.id].achievedAt; })[0];

    if (win.open) {
      var sub = t('draw.limitedSub', {
        t: countdownText(win.end),
        date: fmtLong(win.end),
        time: fmtClock(win.end)
      });
      if (energy() > 0) {
        return { ready: true, kind: 'limited', remain: energy(), end: win.end, label: t('draw.limitedName'), sub: sub };
      }
      return {
        ready: false, kind: 'limited-noenergy', remain: 0, end: win.end,
        label: t('draw.limitedNoEnergy'),
        sub: t('draw.limitedNoEnergySub', { t: countdownText(win.end) })
      };
    }

    if (next) {
      var left = Math.max(1, next.at - fragments());
      if (win.expired) {
        return {
          ready: false, kind: 'limited-ended', end: win.end,
          label: t('draw.limitedEnded'),
          sub: t('draw.limitedNext', { n: left, pieces: next.at })
        };
      }
      return {
        ready: false, kind: 'limited-locked',
        label: left === 1 ? t('draw.limitedLockedOne') : t('draw.limitedLocked', { n: left }),
        sub: t('draw.limitedRules')
      };
    }

    return {
      ready: false, kind: 'limited-ended', end: win.end,
      label: t('draw.limitedEnded'),
      sub: t('draw.limitedEndedSub', { date: fmtLong(win.end), time: fmtClock(win.end) })
    };
  }

  function updateGiftCard(kind, info) {
    var suffix = kind === 'special' ? 'special' : 'draw';
    var meta = document.getElementById('gifts-' + suffix + '-meta');
    if (!meta) return;
    meta.textContent = kind === 'special'
      ? t('gifts.metaSpecial', { n: specialRemaining() })
      : t('gifts.metaEnergy', { n: energy() });
  }

  function updateGiftToggles() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-gift-toggle]'), function (btn) {
      var card = btn.closest('.gift-pool');
      var label = btn.querySelector('[data-gift-toggle-label]');
      if (!card || !label) return;
      var open = card.classList.contains('is-list-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      label.textContent = t(open ? 'gifts.hidePrizes' : 'gifts.viewPrizes');
    });
  }

  function updateDrawEntry() {
    var entries = [
      ['limited', 'hud-draw', 'hud-draw-label', 'hud-draw-sub'],
      ['special', 'hud-special-draw', 'hud-special-label', 'hud-special-sub'],
      ['limited', 'gifts-draw', 'gifts-draw-label', 'gifts-draw-sub'],
      ['special', 'gifts-special-draw', 'gifts-special-label', 'gifts-special-sub'],
      ['limited', 'mobile-draw', null, null]
    ];
    entries.forEach(function (e) {
      var btn = document.getElementById(e[1]);
      if (!btn) return;
      var info = drawEntryState(e[0]);
      var label = e[2] ? document.getElementById(e[2]) : null;
      var sub = e[3] ? document.getElementById(e[3]) : null;
      btn.disabled = !info.ready;
      btn.classList.toggle('btn-primary', info.ready);
      btn.classList.toggle('btn-ghost', !info.ready);
      btn.classList.toggle('is-special', e[0] === 'special');
      var labelText = info.label;
      var subText = info.sub;
      if (e[1] === 'gifts-draw' && info.end && info.kind !== 'limited-ended' && info.end > now()) {
        if (info.ready) labelText = t('draw.enterLimited');
        subText = t('gifts.subRemain', { t: countdownHMS(info.end) });
      }
      if (e[1] === 'gifts-special-draw' &&
          (info.kind === 'special' || info.kind === 'special-nofund' || info.kind === 'special-used') &&
          now() < SPEC_CLOSE) {
        if (info.ready) labelText = t('draw.enterSpecial');
        subText = t('gifts.subRemain', { t: countdownHMS(SPEC_CLOSE) });
      }
      if (label) label.textContent = labelText;
      if (sub) sub.textContent = subText;
      btn.title = labelText + ' · ' + subText;
      if (e[1] === 'gifts-draw') updateGiftCard('limited', info);
      if (e[1] === 'gifts-special-draw') updateGiftCard('special', info);
      if (e[1] === 'mobile-draw') {
        var badge = document.getElementById('mobile-draw-badge');
        if (badge) {
          badge.hidden = !info.ready || !info.remain;
          badge.textContent = info.remain || '';
        }
        var mm = document.getElementById('mobile-draw-label');
        if (mm) mm.textContent = info.ready ? t('draw.mobileReady') : t('draw.mobile');
      }
    });

    updateGiftToggles();

    var signout = document.getElementById('signout-btn');
    if (signout) signout.hidden = !state.user;
  }

  function activateDrawEntry(kind) {
    kind = kind === 'special' ? 'special' : 'limited';
    if (!state.user) {
      requireAuth(function () { activateDrawEntry(kind); });
      return;
    }
    var info = drawEntryState(kind);
    if (!info.ready) {
      toast(info.label + (info.sub ? ' · ' + info.sub : ''));
      return;
    }
    if (kind === 'special') openSpecialDraw();
    else openLimitedDraw();
  }

  function updateShareRow() {
    var sub = $('#share-sub');
    var label = $('#share-label');
    var town = fragments() >= 28;
    var phase = eventPhase();
    if (label) label.textContent = town ? t('chance.shareTown') : t('chance.shareDoodle');
    if (phase === 'ended') {
      sub.textContent = t('chance.shareClosed');
    } else if (phase === 'before') {
      sub.textContent = t('chance.shareBefore');
    } else if (state.share.day === dayKey(now())) {
      sub.textContent = t('chance.shareUsed');
    } else if (fragments() >= 18) {
      sub.textContent = t('chance.shareJoy');
    } else if (!town && !latestArt()) {
      sub.textContent = t('chance.shareDrawFirst');
    } else {
      sub.textContent = t('chance.shareSub');
    }
  }

  function milestoneInfo(m) {
    var node = state.nodes[m.id];
    var frag = fragments();
    if (!node.achievedAt) {
      var left = m.at - frag;
      return { cls: '', state: t('state.locked'), sub: toGo(left) };
    }
    if (energy() > 0) {
      return { cls: 'is-ready', state: t('state.ready'), sub: t('mstone.energySub', { n: energy() }) };
    }
    return { cls: 'is-done', state: t('state.noEnergy'), sub: fragments() >= 18 ? t('mstone.capSub') : t('mstone.noEnergySub') };
  }

  function specialInfo() {
    var frag = fragments();
    var n = now();
    if (frag < SPECIAL.at) {
      var sl = SPECIAL.at - frag;
      return { cls: 'is-special', state: t('state.locked'), sub: toGo(sl) + (isZh() ? ' · 12月25日' : ' · Dec 25') };
    }
    if (n > SPEC_CLOSE) {
      if (specialRemaining() > 0) return { cls: 'is-special is-done', state: t('state.expired'), sub: t('mstone.specialClosed') };
      return { cls: 'is-special is-done', state: t('state.closed'), sub: t('mstone.specialClosed') };
    }
    if (n < SPEC_OPEN) {
      var onDay = frag >= SPECIAL.bonusAt ? 2 : 1;
      return { cls: 'is-special', state: t('state.dec25'), sub: onDay === 1 ? t('mstone.specialOnDayOne') : t('mstone.specialOnDay', { n: onDay }) };
    }
    if (specialRemaining() <= 0) return { cls: 'is-special is-done', state: t('state.used'), sub: t('mstone.specialUsed') };
    return { cls: 'is-special is-ready', state: t('state.ready'), sub: specialRemaining() === 1 ? t('mstone.specialReadyOne') : t('mstone.specialReady', { n: specialRemaining() }) };
  }

  function renderMilestones() {
    var list = $('#milestone-list');
    if (!list) return;
    var html = MILESTONES.map(function (m) {
      var info = milestoneInfo(m);
      return '<button type="button" class="mstone ' + info.cls + '" data-node="' + m.id + '">' +
        '<span class="mstone-icon">' + icon('i-gift') + '</span>' +
        '<span class="mstone-copy"><span class="mstone-name">' + milestoneLabel(m) + ' · ' + m.at + (isZh() ? ' 块' : ' pieces') + '</span>' +
        '<span class="mstone-sub">' + info.sub + '</span></span>' +
        '<span class="mstone-state">' + info.state + '</span></button>';
    }).join('');
    var si = specialInfo();
    html += '<button type="button" class="mstone ' + si.cls + '" data-node="special">' +
      '<span class="mstone-icon">' + icon('i-sparkle') + '</span>' +
      '<span class="mstone-copy"><span class="mstone-name">' + t('stage.special') + '</span>' +
      '<span class="mstone-sub">' + si.sub + '</span></span>' +
      '<span class="mstone-state">' + si.state + '</span></button>';
    list.innerHTML = html;
  }

  /* ------------------------------------------------------------------ mural */

  function renderMural() {
    var grid = $('#mural-grid');
    if (!grid) return;
    var lit = fragments();
    var html = TASKS.map(function (task, i) {
      var done = isDone(task.id);
      var label = t('album.day', { n: pad2(task.day) }) + ' · ' + taskName(task);
      return '<button type="button" class="mural-piece' + (done ? ' is-lit' : '') + '" data-task="' + task.id +
        '" title="' + escapeAttr(label) + '" aria-label="' + escapeAttr(label) + '">' +
        '<span class="mural-num">' + (i + 1) + '</span>' +
        (done ? '' : '<span class="mural-lock">' + icon('i-lock') + '</span>') +
        '</button>';
    }).join('');
    html += '<div class="mural-sign' + (lit >= 28 ? ' is-complete' : '') + '"' + (lit >= 28 ? ' data-complete="1"' : '') + '>' +
      '<span class="mural-sign-count"><b>' + lit + '</b><span>/ 28</span></span>' +
      '<span class="mural-sign-text">' + (lit >= 28 ? t('mural.signDone') : t('mural.sign')) + '</span>' +
      '</div>';
    grid.innerHTML = html;
  }

  /* ----------------------------------------------------------------- prizes */

  /* ---------------------------------------------------------------- lottery */

  function resultLine(label, value, cls) {
    return '<div class="result-line' + (cls ? ' ' + cls : '') + '">' +
      '<span class="result-line-label">' + label + '</span>' +
      '<span class="result-line-value">' + value + '</span></div>';
  }

  function openResultModal(opts) {
    var isMakeup = opts.mode === 'makeup';
    var specialNew = !!opts.specialGain;
    var specialOpenNow = specialNew && specialWindowOpen();
    var limitedNew = !!(opts.opened && opts.opened.length);
    var kicker, title;

    if (specialNew) {
      kicker = t('result.kicker.special');
      title = specialOpenNow ? t('result.title.special') : t('result.title.specialUnlocked');
    } else if (limitedNew) {
      kicker = t('result.kicker.limited');
      title = t('result.title.limited');
    } else {
      kicker = t(isMakeup ? 'result.kicker.makeup' : 'result.kicker.daily');
      title = t(isMakeup ? 'result.title.dailyMakeup' : 'result.title.daily');
    }

    var lines = '';
    lines += resultLine(t('result.fragmentLabel'), t('result.fragment', { n: fragments() }));
    if (opts.energyGain) lines += resultLine(t('result.energyLabel'), t('result.energy'));
    if (opts.specialGain) {
      lines += resultLine(t('result.specialLabel'), t('result.special', { n: opts.specialTotal }));
      if (!specialOpenNow) lines += resultLine(t('result.specialOpensLabel'), t('result.specialOpens'), 'is-stage');
    }
    if (limitedNew) {
      var end = limitedEnd();
      lines += resultLine(t('result.limitedLabel'), t('result.limitedOpen'), 'is-stage');
      if (end) {
        lines += resultLine(t('result.deadlineLabel'),
          t('result.limitedDeadline', { date: fmtLong(end), time: fmtClock(end) }), 'is-stage');
      }
    }

    var actions;
    if (specialOpenNow || limitedNew) {
      actions = '<button type="button" class="btn btn-primary" id="result-draw">' + t(specialOpenNow ? 'result.draw' : 'result.drawLimited') + '</button>' +
        '<button type="button" class="btn btn-ghost" data-close>' + t('result.later') + '</button>';
    } else {
      actions = '<button type="button" class="btn btn-primary" id="result-view">' + t('result.view') + '</button>' +
        '<button type="button" class="btn btn-ghost" id="result-continue">' + t('result.continue') + '</button>' +
        '<button type="button" class="btn btn-ghost" data-close>' + t('result.close') + '</button>';
    }

    var html = '<div class="modal-head"><span class="modal-kicker">' + kicker + '</span><h2>' + title + '</h2></div>' +
      (lines ? '<div class="result-lines">' + lines + '</div>' : '') +
      '<div class="modal-actions">' + actions + '</div>';

    var modal = openModal(html, { className: 'stage-notice result-modal', closable: true, label: title });
    var view = $('#result-view', modal.modal);
    var cont = $('#result-continue', modal.modal);
    var draw = $('#result-draw', modal.modal);

    if (view) view.addEventListener('click', function () {
      modal.close();
      if (opts.task) setTimeout(function () { openDoodle(opts.task.id); }, 200);
    });
    if (cont) cont.addEventListener('click', function () {
      modal.close();
      setTimeout(openFreeStudio, 220);
    });
    if (draw) draw.addEventListener('click', function () {
      modal.close();
      setTimeout(function () {
        if (specialOpenNow) openSpecialDraw();
        else if (limitedNew) openLimitedDraw();
      }, 220);
    });
  }

  function downloadArt(dataUrl, name) {
    var a = document.createElement('a');
    a.href = dataUrl;
    a.download = name || 'xppen-christmas.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function openFreeStudio() {
    if (!state.user) { requireAuth(openFreeStudio); return; }
    if (eventPhase() !== 'live') { toast(t('toast.freeClosed')); return; }
    currentStudio = { mode: 'free' };
    redrawTask = null;
    state.ui.justSubmitted = null;
    state.ui.selectedId = null;
    renderStudio();
    setTimeout(function () {
      var studio = document.getElementById('studio');
      if (studio) studio.scrollIntoView({ behavior: 'smooth' });
    }, 40);
  }

  function openFreeSaved(work) {
    var html = '<div class="modal-head"><span class="modal-kicker">' + t('free.kicker') + '</span>' +
      '<h2>' + t('free.savedTitle') + '</h2><p>' + t('free.savedCopy') + '</p></div>' +
      '<div class="modal-actions"><button type="button" class="btn btn-primary" id="free-view">' + t('free.view') + '</button>' +
      '<button type="button" class="btn btn-ghost" data-close>' + t('free.keep') + '</button></div>';
    var modal = openModal(html, { className: 'modal--narrow', label: t('free.savedTitle') });
    var view = $('#free-view', modal.modal);
    if (view) view.addEventListener('click', function () {
      modal.close();
      setTimeout(openWorks, 200);
    });
  }

  function openFreeSaveError(art) {
    var html = '<div class="modal-head"><span class="modal-kicker">' + t('free.failKicker') + '</span>' +
      '<h2>' + t('free.failTitle') + '</h2><p>' + t('free.failCopy') + '</p></div>' +
      '<div class="modal-actions"><button type="button" class="btn btn-primary" id="free-download">' + t('free.download') + '</button>' +
      '<button type="button" class="btn btn-ghost" data-close>' + t('free.keep') + '</button></div>';
    var modal = openModal(html, { className: 'modal--narrow', label: t('free.failTitle') });
    var dl = $('#free-download', modal.modal);
    if (dl) dl.addEventListener('click', function () {
      downloadArt(art, 'xppen-free-work.png');
      toast(t('free.downloaded'));
    });
  }

  function openLimitedDraw() {
    if (!state.user) { requireAuth(openLimitedDraw); return; }
    var win = limitedWindow();
    if (!win.open) { toast(t('toast.limitedClosed')); return; }
    if (energy() <= 0) { toast(t('toast.noEnergy')); return; }
    var total = energy();
    var pool = POOLS.limited;
    var deadline = fmtLong(win.end) + ' ' + fmtClock(win.end);

    var html =
      '<div class="modal-head"><span class="modal-kicker">' + t('draw.limitedKicker') + '</span>' +
      '<h2>' + t('draw.limitedTitle') + '</h2>' +
      '<p>' + t('draw.limitedModalSub', { n: total, date: fmtLong(win.end), time: fmtClock(win.end) }) + '</p>' +
      '<p class="draw-cost">' + t('draw.costNote') + ' · ' + t('draw.deadlineLabel', { date: fmtLong(win.end), time: fmtClock(win.end) }) + '</p></div>' +
      '<div class="draw-topline"><span class="muted-small" id="draw-count">' + t('draw.energyLeft', { n: total }) + '</span></div>' +
      '<div class="reel-frame" id="draw-reel"><div class="reel-pointer"></div><div class="reel-track"></div>' +
      '<div class="reel-pointer reel-pointer--bottom"></div>' +
      '<div class="reel-idle" id="draw-idle"><span class="reel-idle-q">?</span><span>' + t('draw.idle') + '</span></div></div>' +
      '<div class="draw-result is-pending" id="draw-result">' + t('draw.readyResult') + '</div>' +
      '<div class="draw-actions" id="draw-actions"></div>';

    var modal = openModal(html, {
      className: 'draw-modal',
      closable: true,
      label: t('draw.limitedTitle')
    });

    var frame = $('#draw-reel', modal.modal);
    var resultEl = $('#draw-result', modal.modal);
    var actionsEl = $('#draw-actions', modal.modal);
    var countEl = $('#draw-count', modal.modal);
    var busy = false;

    function spin() {
      var live = limitedWindow();
      if (busy) return;
      if (!live.open) { toast(t('toast.limitedClosed')); return; }
      if (energy() <= 0) { toast(t('toast.noEnergy')); return; }
      busy = true;
      countEl.textContent = t('draw.energyLeft', { n: energy() });
      actionsEl.innerHTML = '';
      var idleEl = $('#draw-idle', modal.modal);
      if (idleEl) idleEl.hidden = true;
      resultEl.className = 'draw-result is-pending';
      resultEl.innerHTML = t('draw.spinning');

      var prize = weightedPrize('limited');
      window.XMASReel.spin(frame, pool, prize).then(function () {
        var record = makePrizeRecord(prize, 'limited');
        state.prizes.unshift(record);
        state.energy = Math.max(0, energy() - 1);
        save();
        renderAll();
        flashTown();

        var cRect = resultEl.getBoundingClientRect();
        burst(cRect.left + cRect.width / 2, cRect.top + 30, 18);

        resultEl.className = 'draw-result is-win';
        resultEl.innerHTML =
          '<div class="result-icon">' + ART.prizeIcon(prize.kind, prize.iconLabel, prize.rarity) + '</div>' +
          '<div class="result-copy"><span class="result-kicker">' + t('draw.unwrapped') + '</span>' +
          '<div class="result-name">' + prizeName(prize) + '</div>' +
          '<p class="result-note">' + prizeNote(prize) + '</p>' +
          (record.code ? '<span class="result-code">' + record.code + '</span>' : '') + '</div>';

        busy = false;
        countEl.textContent = t('draw.energyLeft', { n: energy() });

        if (energy() > 0 && limitedWindow().open) {
          actionsEl.innerHTML = '<button type="button" class="btn btn-primary" id="draw-next">' +
            t('draw.next', { n: energy() }) + '</button>' +
            '<button type="button" class="btn btn-ghost" data-close>' + t('draw.later') + '</button>';
          $('#draw-next', modal.modal).addEventListener('click', spin);
        } else {
          countEl.textContent = limitedWindow().open ? t('draw.energyEmpty') : t('draw.limitedEnded');
          actionsEl.innerHTML =
            '<button type="button" class="btn btn-ghost" id="draw-prizes">' + t('draw.seePrizes') + '</button>' +
            '<button type="button" class="btn btn-primary" id="draw-done">' + t('draw.done') + '</button>';
          $('#draw-prizes', modal.modal).addEventListener('click', function () {
            modal.close();
            setTimeout(openPrizes, 220);
          });
          $('#draw-done', modal.modal).addEventListener('click', function () {
            modal.close();
          });
        }
      });
    }

    actionsEl.innerHTML = '<button type="button" class="btn btn-primary" id="draw-start">' + t('draw.start') + '</button>' +
      '<button type="button" class="btn btn-ghost" data-close>' + t('draw.later') + '</button>';
    $('#draw-start', modal.modal).addEventListener('click', spin);
  }

  function openSpecialDraw() {
    if (!state.user) { requireAuth(openSpecialDraw); return; }
    if (fragments() < SPECIAL.at) {
      toast(t('toast.need18'));
      return;
    }
    if (now() < SPEC_OPEN) {
      toast(t('toast.specialNotOpen'));
      return;
    }
    if (now() >= SPEC_CLOSE) {
      toast(t('toast.specialClosed'));
      return;
    }
    var total = specialRemaining();
    if (total <= 0) {
      toast(t('toast.specialUsed'));
      return;
    }
    var pool = POOLS.special;

    var html =
      '<div class="modal-head"><span class="modal-kicker" style="color:#ffb4aa">' + t('draw.specialKicker') + '</span>' +
      '<h2>' + t('draw.specialTitle') + '</h2>' +
      '<p>' + t(total === 1 ? 'draw.specialSubOne' : 'draw.specialSubMany', { n: total, pieces: fragments() }) + '</p>' +
      '<p class="draw-cost">' + t('draw.specialCost') + ' · ' + t('draw.specialDeadline') + '</p></div>' +
      '<div class="draw-topline"><span class="muted-small" id="draw-count">' + t('draw.specialChanceOf', { n: 1, m: total }) + '</span></div>' +
      '<div class="reel-frame" id="draw-reel" style="border-color:rgba(228,87,76,.45)"><div class="reel-pointer" style="border-top-color:#e4574c"></div><div class="reel-track"></div>' +
      '<div class="reel-pointer reel-pointer--bottom" style="border-bottom-color:#e4574c;border-top-color:transparent"></div>' +
      '<div class="reel-idle" id="draw-idle"><span class="reel-idle-q">?</span><span>' + t('draw.idle') + '</span></div></div>' +
      '<div class="draw-result is-pending" id="draw-result">' + t('draw.readyResult') + '</div>' +
      '<div class="draw-actions" id="draw-actions"></div>';

    var modal = openModal(html, {
      className: 'draw-modal',
      closable: true,
      label: t('stage.special')
    });

    var frame = $('#draw-reel', modal.modal);
    var resultEl = $('#draw-result', modal.modal);
    var actionsEl = $('#draw-actions', modal.modal);
    var countEl = $('#draw-count', modal.modal);
    var busy = false;
    var drawsDone = 0;

    function spin() {
      if (busy) return;
      if (!specialWindowOpen()) { toast(t('toast.specialClosed')); return; }
      if (specialRemaining() <= 0) { toast(t('toast.specialUsed')); return; }
      busy = true;
      countEl.textContent = t('draw.specialChanceOf', { n: drawsDone + 1, m: total });
      actionsEl.innerHTML = '';
      var idleEl = $('#draw-idle', modal.modal);
      if (idleEl) idleEl.hidden = true;
      resultEl.className = 'draw-result is-pending';
      resultEl.innerHTML = t('draw.spinning');

      var prize = weightedPrize('special');
      window.XMASReel.spin(frame, pool, prize).then(function () {
        var record = makePrizeRecord(prize, 'special');
        state.prizes.unshift(record);
        state.special.used += 1;
        drawsDone += 1;
        save();
        renderAll();

        var cRect = resultEl.getBoundingClientRect();
        burst(cRect.left + cRect.width / 2, cRect.top + 30, 22, ['#f7c869', '#e4574c', '#ffe7b0', '#ffffff']);

        resultEl.className = 'draw-result is-win';
        resultEl.innerHTML =
          '<div class="result-icon">' + ART.prizeIcon(prize.kind, prize.iconLabel, prize.rarity) + '</div>' +
          '<div class="result-copy"><span class="result-kicker">' + t('draw.specialGift') + '</span>' +
          '<div class="result-name">' + prizeName(prize) + '</div>' +
          '<p class="result-note">' + prizeNote(prize) + '</p>' +
          (record.code ? '<span class="result-code">' + record.code + '</span>' : '') + '</div>';

        busy = false;
        if (specialRemaining() > 0 && specialWindowOpen()) {
          actionsEl.innerHTML = '<button type="button" class="btn btn-primary" id="draw-next">' +
            t('draw.nextSpecial', { n: specialRemaining() }) + '</button>' +
            '<button type="button" class="btn btn-ghost" data-close>' + t('draw.later') + '</button>';
          $('#draw-next', modal.modal).addEventListener('click', spin);
        } else {
          countEl.textContent = specialWindowOpen() ? t('draw.specialDone') : t('draw.specialClosed');
          actionsEl.innerHTML =
            '<button type="button" class="btn btn-ghost" id="draw-prizes">' + t('draw.seePrizes') + '</button>' +
            '<button type="button" class="btn btn-primary" id="draw-done">' + t('draw.done') + '</button>';
          $('#draw-prizes', modal.modal).addEventListener('click', function () {
            modal.close();
            setTimeout(openPrizes, 220);
          });
          $('#draw-done', modal.modal).addEventListener('click', function () { modal.close(); });
        }
      });
    }

    actionsEl.innerHTML = '<button type="button" class="btn btn-primary" id="draw-start">' + t('draw.start') + '</button>' +
      '<button type="button" class="btn btn-ghost" data-close>' + t('draw.later') + '</button>';
    $('#draw-start', modal.modal).addEventListener('click', spin);
  }

  function renderPrizeStrip() {
    var stage = $('#stage-prize-list');
    var special = $('#special-prize-list');
    if (!stage || !special) return;
    stage.innerHTML = POOLS.limited.map(giftPrize).join('');
    special.innerHTML = POOLS.special.map(giftPrize).join('');
  }

  function giftPrize(p) {
    var type = p.kind === 'product' ? t('gifts.product')
      : p.kind === 'coupon' ? t('gifts.coupon')
      : p.kind === 'coins' ? t('gifts.coins')
      : t('gifts.bundle');
    return '<div class="gift-prize">' + ART.prizeIcon(p.kind, p.iconLabel, p.rarity) +
      '<span class="gift-prize-copy"><b>' + prizeName(p) + '</b><small>' + type +
      ' · <em class="r-' + p.rarity + '">' + t('rarity.' + p.rarity) + '</em></small></span></div>';
  }

  function findPrize(pool, id) {
    return POOLS[pool].filter(function (p) { return p.id === id; })[0] || POOLS[pool][0];
  }

  function weightedPrize(poolName) {
    var pool = POOLS[poolName];
    var total = pool.reduce(function (n, p) { return n + p.weight; }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < pool.length; i++) {
      r -= pool[i].weight;
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  function makePrizeRecord(prize, source) {
    return {
      uid: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      prizeId: prize.id,
      name: prize.name,
      kind: prize.kind,
      label: prize.iconLabel,
      rarity: prize.rarity,
      note: prize.note,
      code: prize.kind === 'coupon'
        ? 'XPXMAS26-' + String(prize.iconLabel || '').replace(/[^0-9A-Z]/gi, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()
        : '',
      at: new Date(now()).toISOString(),
      sourceKey: source,
      source: ''
    };
  }

  /* --------------------------------------------------------------- submits */

  function submitDrawing() {
    if (submitting) return;
    if (!state.user) {
      requireAuth(submitDrawing);
      return;
    }
    if (!currentStudio) {
      toast(t('toast.noElement'));
      return;
    }
    if (!pad.hasInk()) {
      toast(t('toast.blank'));
      var paper = $('#paper');
      paper.classList.add('shake');
      setTimeout(function () { paper.classList.remove('shake'); }, 500);
      return;
    }

    submitting = true;
    var btn = $('#submit-drawing');
    btn.disabled = true;
    btn.classList.add('is-busy');

    var mode = currentStudio.mode;
    var task = currentStudio.task;
    var art = pad.toDataURL(480);

    if (mode === 'free') {
      var work = {
        id: 'free-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
        art: art,
        at: new Date(now()).toISOString()
      };
      state.freeWorks.unshift(work);
      var saved = save({ quiet: true });
      if (!saved) {
        state.freeWorks = state.freeWorks.filter(function (w) { return w.id !== work.id; });
        submitting = false;
        btn.disabled = false;
        btn.classList.remove('is-busy');
        openFreeSaveError(art);
        return;
      }
      pad.clear();
      var fRect = btn.getBoundingClientRect();
      burst(fRect.left + fRect.width / 2, fRect.top + fRect.height / 2, 18);
      toast(t('toast.freeSaved'), 'i-check');
      renderAll();
      submitting = false;
      btn.disabled = false;
      btn.classList.remove('is-busy');
      setTimeout(function () { openFreeSaved(work); }, 260);
      return;
    }

    var energyBefore = energy();
    var specialLimitBefore = specialLimit();
    state.completed[task.id] = {
      at: new Date(now()).toISOString(),
      makeup: mode === 'makeup',
      art: art
    };
    if (mode === 'daily' && fragments() <= 18) state.energy = (state.energy || 0) + 1;
    var opened = unlockNodes();
    syncSpecial();
    var energyGain = energy() > energyBefore;
    var specialGain = specialLimit() > specialLimitBefore;
    var specialTotal = specialLimit();
    var isComplete = fragments() >= 28;
    state.ui.freshTask = task.id;
    state.ui.selectedId = null;
    state.ui.justSubmitted = mode === 'daily' ? 'daily' : null;
    padTaskId = null;
    save();

    var submitRect = btn.getBoundingClientRect();
    burst(submitRect.left + submitRect.width / 2, submitRect.top + submitRect.height / 2, 26);

    setTimeout(function () {
      pad.clear();
      renderAll();
      flashTown(task.id);
      if (energyGain) flyOrb(btn, $('.energy-chip'));

      if (mode === 'daily') {
        toast(t(energyGain ? 'toast.energy' : 'toast.submitted', { n: fragments() }), 'i-snow');
      } else {
        toast(t('toast.makeup', { n: fragments() }), 'i-check');
      }

      if (isComplete) {
        setTimeout(showComplete, 500);
      } else {
        setTimeout(function () {
          openResultModal({
            mode: mode,
            task: task,
            opened: opened,
            energyGain: energyGain,
            specialGain: specialGain && now() < SPEC_CLOSE,
            specialTotal: specialTotal
          });
        }, 900);
      }

      submitting = false;
      btn.disabled = false;
      btn.classList.remove('is-busy');
    }, 620);
  }

  /* ----------------------------------------------------------------- prizes */

  function openPrizes() {
    if (!state.user) { requireAuth(openPrizes); return; }
    var list = state.prizes;
    var body;
    if (!list.length) {
      body = '<div class="prizes-empty"><div class="prize-empty-icon">' + icon('i-gift') + '</div>' +
        '<h3>' + t('prizes.emptyTitle') + '</h3><p>' + t('prizes.emptyCopy') + '</p></div>';
    } else {
      body = '<div class="prize-list">' + list.map(function (p) {
        var status = p.kind === 'coupon' ? t('prizes.ready') : p.kind === 'coins' ? t('prizes.credited') : t('prizes.claim');
        return '<div class="prize-row">' +
          '<div class="prize-row-icon">' + ART.prizeIcon(p.kind, p.label, p.rarity) + '</div>' +
          '<div class="prize-row-copy"><b>' + recordName(p) + '</b>' +
          '<small>' + t('prizes.record', { source: sourceLabel(p), date: fmtLong(new Date(p.at)) }) + '</small>' +
          (p.code ? '<span class="code-chip" data-copy="' + p.code + '">' + p.code + ' ' + icon('i-sparkle') + '</span>' : '') +
          '</div>' +
          '<span class="prize-row-status">' + status + '</span></div>';
      }).join('') + '</div>';
    }

    var modal = openModal(
      '<div class="modal-head"><span class="modal-kicker">' + t('prizes.kicker') + '</span><h2>' + t('prizes.title') + '</h2>' +
      '<p>' + (list.length ? t(list.length === 1 ? 'prizes.subOne' : 'prizes.subMany', { n: list.length }) : t('prizes.subEmpty')) + '</p></div>' +
      body +
      '<p class="prizes-note">' + t('prizes.note') + '</p>' +
      '<div class="modal-actions is-end"><button type="button" class="btn btn-primary" data-close>' + t('prizes.done') + '</button></div>',
      { className: list.length ? 'modal--wide' : 'modal--narrow', label: t('prizes.kicker') }
    );

    modal.modal.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-copy]');
      if (!chip) return;
      copyText(chip.dataset.copy);
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast(t('prizes.copyOk'));
      }).catch(function () { toast(t('prizes.copyFail')); });
    } else {
      toast(t('prizes.copyFail'));
    }
  }

  /* ------------------------------------------------------------------ rules */

  function openRules() {
    var html = '<div class="modal-head"><span class="modal-kicker">' + t('rules.kicker') + '</span><h2>' + t('rules.title') + '</h2>' +
      '<p>' + t('rules.sub') + '</p></div>' +
      '<div class="rules-body">' + D.RULES.map(function (r, i) {
        return '<div class="rule-item"><span class="rule-num">' + (i + 1) + '</span><div><h4>' + L(r, 'title') + '</h4>' + L(r, 'body') + '</div></div>';
      }).join('') + '</div>' +
      '<p class="rules-foot">' + t('rules.foot').replace('official@xp-pen.com', '<a href="mailto:official@xp-pen.com" style="color:var(--gold)">official@xp-pen.com</a>') + '</p>';
    openModal(html, { className: 'modal--wide', label: t('rules.kicker') });
  }

  /* ---------------------------------------------------------------- keepsake */

  function keepsakeCode() {
    if (!state.keepsake.code) {
      var seed = (state.user && state.user.id) || 'xmas';
      var hash = 0;
      for (var i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 1679616;
      var tail = String(Math.floor(1000 + Math.random() * 9000));
      var code = 'XM26-' + hash.toString(36).toUpperCase().padStart(4, '0').slice(0, 4) + '-' + tail;
      state.keepsake.code = code;
      save();
    }
    return state.keepsake.code;
  }

  function openKeepsake() {
    if (!state.user) { requireAuth(openKeepsake); return; }
    if (fragments() < 28) {
      var pct = Math.round(fragments() / 28 * 100);
      openModal(
        '<div class="keepsake-locked"><div>' + icon('i-lock') + '</div>' +
        '<h3>' + t('keepsake.lockedTitle') + '</h3>' +
        '<p>' + t('keepsake.lockedCopy') + '</p>' +
        '<div class="nm-bar" style="max-width:320px;margin:0 auto 10px"><div class="nm-fill" style="width:' + pct + '%"></div></div>' +
        '<p class="muted-small" style="margin-bottom:18px">' + t('keepsake.progress', { n: fragments() }) + '</p>' +
        '<button type="button" class="btn btn-primary" data-close>' + t('keepsake.back') + '</button></div>',
        { className: 'modal--narrow', label: t('keepsake.kicker') }
      );
      return;
    }

    var code = keepsakeCode();
    var name = state.keepsake.name || (state.user ? state.user.name : t('keepsake.placeholderName'));
    var blessing = state.keepsake.blessing || blessingList()[0];

    var html =
      '<div class="modal-head"><span class="modal-kicker">' + t('keepsake.kicker') + '</span><h2>' + t('keepsake.title') + '</h2>' +
      '<p>' + t('keepsake.sub') + '</p></div>' +
      '<div class="keepsake-grid">' +
      '<div class="keepsake-preview"><div class="kp-scene">' + ART.sceneSVG({ clean: true, fit: 'slice' }) + '</div>' +
      '<div class="kp-body"><span class="kp-kicker">' + t('keepsake.cardKicker') + '</span>' +
      '<div class="kp-name" id="kp-name">' + escapeHtml(name) + '</div>' +
      '<p class="kp-blessing" id="kp-blessing">' + escapeHtml(blessing) + '</p>' +
      '<div class="kp-foot"><span>' + t('keepsake.piecesAll') + '</span><span id="kp-code">' + code + '</span></div></div></div>' +
      '<div class="keepsake-form">' +
      '<label class="field"><span>' + t('keepsake.name') + '</span><input id="kp-input-name" maxlength="18" value="' + escapeAttr(name) + '" placeholder="' + t('keepsake.placeholderName') + '"></label>' +
      '<label class="field"><span>' + t('keepsake.wish') + '</span><textarea id="kp-input-blessing" maxlength="80" placeholder="' + t('keepsake.placeholderWish') + '">' + escapeHtml(blessing) + '</textarea></label>' +
      '<div class="preset-chips" id="kp-presets">' + blessingList().map(function (b) {
        return '<button type="button" class="preset-chip" data-blessing="' + escapeAttr(b) + '">' + b + '</button>';
      }).join('') + '</div>' +
      '<div class="modal-actions"><button type="button" class="btn btn-primary" id="kp-download">' + icon('i-download') + t('keepsake.download') + '</button></div>' +
      '<p class="rules-fine">' + t('keepsake.fine') + '</p>' +
      '</div></div>';

    var modal = openModal(html, { className: 'modal--wide', label: t('keepsake.kicker') });
    var nameEl = $('#kp-name', modal.modal);
    var blessEl = $('#kp-blessing', modal.modal);
    var inputName = $('#kp-input-name', modal.modal);
    var inputBless = $('#kp-input-blessing', modal.modal);

    function sync() {
      if (nameEl) nameEl.textContent = inputName.value || t('keepsake.placeholderName');
      if (blessEl) blessEl.textContent = inputBless.value || blessingList()[0];
      state.keepsake.name = inputName.value;
      state.keepsake.blessing = inputBless.value;
    }
    inputName.addEventListener('input', sync);
    inputBless.addEventListener('input', sync);
    $('#kp-presets', modal.modal).addEventListener('click', function (e) {
      var b = e.target.closest('[data-blessing]');
      if (!b) return;
      inputBless.value = b.dataset.blessing;
      sync();
    });

    $('#kp-download', modal.modal).addEventListener('click', function () {
      var btn = this;
      btn.disabled = true;
      btn.textContent = t('keepsake.rendering');
      state.keepsake.name = inputName.value;
      state.keepsake.blessing = inputBless.value;
      state.keepsake.createdAt = new Date(now()).toISOString();
      save();
      waitFonts().then(function () {
        var canvas = document.createElement('canvas');
        return CARDS.renderKeepsake(canvas, {
          name: inputName.value,
          blessing: inputBless.value,
          code: code,
          pieces: fragments(),
          lang: I18N.current()
        });
      }).then(function (canvas) {
        return CARDS.download(canvas, 'xppen-christmas-town-2026.png');
      }).then(function () {
        btn.disabled = false;
        btn.innerHTML = icon('i-download') + t('keepsake.download');
        toast(t('keepsake.saved'), 'i-download');
      }).catch(function () {
        btn.disabled = false;
        btn.innerHTML = icon('i-download') + t('keepsake.download');
        toast(t('keepsake.failed'));
      });
    });
  }

  function showComplete() {
    if (state.seen.complete) return;
    state.seen.complete = true;
    save();
    var html = '<div class="modal-head" style="text-align:center;padding-right:0">' +
      '<span class="modal-kicker">' + t('complete.kicker') + '</span>' +
      '<h2 style="font-size:36px">' + t('complete.title') + '</h2>' +
      '<p>' + t('complete.copy') + '</p></div>' +
      '<div class="celebration-scene">' + ART.sceneSVG({ clean: true }) + '</div>' +
      '<div class="modal-actions"><button type="button" class="btn btn-ghost" id="celebrate-share">' + icon('i-share') + t('complete.share') + '</button>' +
      '<button type="button" class="btn btn-primary" id="celebrate-keepsake">' + icon('i-sparkle') + t('complete.keepsake') + '</button></div>';
    var modal = openModal(html, { className: 'modal--wide celebration', label: t('stage.special') });
    burst(window.innerWidth / 2, window.innerHeight * 0.35, 40, ['#f7c869', '#ffe7b0', '#bfe3ff', '#e4574c']);
    $('#celebrate-keepsake', modal.modal).addEventListener('click', function () {
      modal.close();
      setTimeout(openKeepsake, 240);
    });
    $('#celebrate-share', modal.modal).addEventListener('click', function () {
      modal.close();
      setTimeout(openShare, 240);
    });
  }

  /* ------------------------------------------------------------------ share */

  function canEarnShareChance() {
    return eventPhase() === 'live' && state.share.day !== dayKey(now()) && fragments() < 18;
  }

  function latestArt() {
    var best = null;
    Object.keys(state.completed).forEach(function (id) {
      var rec = state.completed[id];
      if (!rec || !rec.art) return;
      if (!best || new Date(rec.at) > new Date(best.rec.at)) best = { id: id, rec: rec };
    });
    return best;
  }

  function shareTarget(preferredTaskId) {
    if (preferredTaskId) {
      var preferred = state.completed[preferredTaskId];
      if (preferred && preferred.art) {
        return { kind: 'doodle', id: preferredTaskId, task: BY_ID[preferredTaskId], rec: preferred };
      }
    }
    if (fragments() >= 28) return { kind: 'town' };
    var latest = latestArt();
    if (!latest) return null;
    return { kind: 'doodle', id: latest.id, task: BY_ID[latest.id], rec: latest.rec };
  }

  function openShare(preferredTaskId) {
    if (preferredTaskId && typeof preferredTaskId !== 'string') preferredTaskId = null;
    var target = shareTarget(preferredTaskId);
    if (!target) {
      toast(t('share.noArt'), 'i-share');
      var studio = document.getElementById('studio');
      if (studio) studio.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    var isTown = target.kind === 'town';
    var sharedToday = state.share.day === dayKey(now());
    var earn = canEarnShareChance();
    var primaryLabel = earn ? t('share.claim') : (sharedToday ? t('share.again') : t('share.share'));
    var shareNote = earn ? t('share.noteEarn') : (sharedToday ? t('share.noteUsed') : t('share.noteNoChance'));

    var title = isTown ? t('share.titleTown') : t('share.titleDoodle');
    var kicker = isTown ? t('share.kickerTown') : t('share.kickerDoodle');
    var subtitle = isTown
      ? t('share.subTown')
      : t('share.subDoodle', { name: taskName(target.task), n: pad2(target.task.day), date: fmtLong(new Date(target.rec.at)) });
    var townNote = (!isTown && fragments() < 28) ? ' ' + t('share.townGate') : '';

    var html =
      '<div class="modal-head"><span class="modal-kicker">' + kicker + '</span><h2>' + title + '</h2>' +
      '<p>' + subtitle + '</p></div>' +
      '<div class="keepsake-grid">' +
      '<div class="keepsake-preview share-preview"><canvas id="share-canvas" width="1080" height="1350"></canvas></div>' +
      '<div class="share-side"><div class="share-facts">' +
      '<div class="share-fact"><b>' + fragments() + '</b><span>' + t('share.pieces') + '</span></div>' +
      '<div class="share-fact"><b>' + state.prizes.length + '</b><span>' + t('share.prizes') + '</span></div>' +
      '<div class="share-fact"><b>' + totalChances() + '</b><span>' + t('share.chances') + '</span></div>' +
      '</div>' +
      '<button type="button" class="btn btn-primary btn-block" id="share-claim">' + primaryLabel + '</button>' +
      '<button type="button" class="btn btn-ghost btn-block" id="share-download" style="margin-top:8px">' + icon('i-download') + t('share.download') + '</button>' +
      '<p class="rules-fine">' + shareNote + townNote + ' ' + t('share.demoNote') + '</p>' +
      '</div></div>';

    var modal = openModal(html, { className: 'modal--wide', label: isTown ? t('chance.shareTown') : t('chance.shareDoodle') });
    var canvas = $('#share-canvas', modal.modal);
    var filename = isTown ? 'xppen-christmas-town-share.png' : 'xppen-doodle-' + target.id + '.png';

    waitFonts().then(function () {
      if (isTown) {
        return CARDS.renderShareCard(canvas, {
          name: state.user ? state.user.name : 'A Christmas maker',
          pieces: fragments(),
          code: state.keepsake.code || '',
          lang: I18N.current()
        });
      }
      return CARDS.renderDoodleCard(canvas, {
        name: state.user ? state.user.name : 'A Christmas maker',
        art: target.rec.art,
        taskName: taskName(target.task),
        day: target.task.day,
        dateLabel: fmtLong(new Date(target.rec.at)),
        pieces: fragments(),
        lang: I18N.current()
      });
    }).catch(function () {});

    $('#share-download', modal.modal).addEventListener('click', function () {
      CARDS.download(canvas, filename);
      toast(t('share.saved'), 'i-download');
    });

    var claimBtn = $('#share-claim', modal.modal);
    claimBtn.addEventListener('click', function () {
      var wasEarn = earn;
      claimBtn.disabled = true;
      claimBtn.textContent = t('share.opening');
      shareCardFile(canvas, isTown, filename).then(function (result) {
        if (result === 'cancelled') {
          claimBtn.disabled = false;
          claimBtn.textContent = primaryLabel;
          return;
        }
        if (wasEarn) {
          state.share.day = dayKey(now());
          state.share.count += 1;
          state.energy = (state.energy || 0) + 1;
          save();
          renderAll();
          modal.close();
          toast(t('share.claimed'), 'i-share');
        } else {
          modal.close();
          toast(t('share.thanks'), 'i-share');
        }
      });
    });
  }

  function shareCardFile(canvas, isTown, filename) {
    return CARDS.toBlob(canvas).then(function (blob) {
      if (!blob) return 'done';
      var file = new File([blob], filename || 'xppen-christmas-card.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({
          files: [file],
          title: isTown ? t('share.nativeTitleTown') : t('share.nativeTitleDoodle'),
          text: isTown ? t('share.nativeTextTown', { n: fragments() }) : t('share.nativeTextDoodle')
        }).then(function () { return 'shared'; }).catch(function (err) {
          return err && err.name === 'AbortError' ? 'cancelled' : 'done';
        });
      }
      CARDS.download(canvas, filename || 'xppen-christmas-card.png');
      return 'done';
    });
  }

  /* ------------------------------------------------------------------ doodle */

  function openWorks() {
    if (!state.user) { requireAuth(openWorks); return; }
    var works = TASKS.map(function (task) {
      return { task: task, rec: state.completed[task.id] };
    }).filter(function (w) { return w.rec && w.rec.art; });
    var free = (state.freeWorks || []).slice();
    var total = works.length + free.length;

    var cards = works.map(function (w) {
      var task = w.task;
      var label = taskName(task) + ' · ' + fmtShort(new Date(w.rec.at));
      return '<button type="button" class="work-card" data-work="' + task.id + '" aria-label="' + escapeAttr(label) + '">' +
        '<img class="work-thumb" src="' + w.rec.art + '" alt="' + escapeAttr(taskName(task)) + '">' +
        '<span class="work-meta"><b>' + taskName(task) + '</b><small>' + fmtShort(new Date(w.rec.at)) + '</small></span></button>';
    }).join('');

    var freeCards = free.map(function (w) {
      var label = t('works.freeLabel', { date: fmtShort(new Date(w.at)) });
      return '<button type="button" class="work-card is-free" data-free="' + w.id + '" aria-label="' + escapeAttr(label) + '">' +
        '<img class="work-thumb" src="' + w.art + '" alt="' + escapeAttr(t('works.freeTitle')) + '">' +
        '<span class="work-meta"><b>' + t('works.freeTitle') + '</b><small>' + fmtShort(new Date(w.at)) + '</small></span></button>';
    }).join('');

    var body = '';
    if (total) {
      if (works.length) {
        body += '<h3 class="works-group-title">' + t('works.dailyGroup') + ' · ' + works.length + '</h3>' +
          '<div class="works-grid">' + cards + '</div>';
      }
      if (free.length) {
        body += '<h3 class="works-group-title">' + t('works.freeGroup') + ' · ' + free.length + '</h3>' +
          '<div class="works-grid">' + freeCards + '</div>';
      }
    } else {
      body = '<div class="works-empty">' + t('works.empty') + '</div>';
    }

    var html =
      '<div class="modal-head"><span class="modal-kicker">' + t('works.kicker') + '</span>' +
      '<h2>' + t('works.title') + '</h2>' +
      '<p>' + t(total === 1 ? 'works.subOne' : 'works.sub', { n: total }) + '</p></div>' +
      body +
      '<div class="modal-actions is-end"><button type="button" class="btn btn-primary" data-close>' + t('common.done') + '</button></div>';

    var modal = openModal(html, { className: 'modal--wide works-modal', label: t('works.kicker') });
    modal.modal.addEventListener('click', function (e) {
      var freeCard = e.target.closest('[data-free]');
      if (freeCard) {
        var id = freeCard.dataset.free;
        modal.close();
        setTimeout(function () { openFreeWork(id); }, 180);
        return;
      }
      var card = e.target.closest('[data-work]');
      if (!card) return;
      var taskId = card.dataset.work;
      modal.close();
      setTimeout(function () { openDoodle(taskId); }, 180);
    });
  }

  function openFreeWork(workId) {
    var work = (state.freeWorks || []).filter(function (w) { return w.id === workId; })[0];
    if (!work) return;
    var html = '<div class="modal-head"><span class="modal-kicker">' + t('works.freeGroup') + '</span>' +
      '<h2>' + t('works.freeTitle') + '</h2>' +
      '<p>' + fmtLong(new Date(work.at)) + ' · ' + t('works.freeNote') + '</p></div>' +
      '<div class="doodle-figure"><img src="' + work.art + '" alt="' + escapeAttr(t('works.freeTitle')) + '"></div>' +
      '<div class="doodle-actions"><button type="button" class="btn btn-primary" id="free-work-download">' +
      icon('i-download') + t('doodle.download') + '</button>' +
      '<button type="button" class="btn btn-ghost" data-close>' + t('common.done') + '</button></div>';
    var modal = openModal(html, { className: 'modal--narrow', label: t('works.freeTitle') });
    var dl = $('#free-work-download', modal.modal);
    if (dl) dl.addEventListener('click', function () {
      downloadArt(work.art, 'xppen-free-' + work.id + '.png');
      toast(t('free.downloaded'));
    });
  }

  function openDoodle(taskId) {
    var task = BY_ID[taskId];
    var rec = state.completed[taskId];
    if (!task || !rec) return;
    var html = '<div class="doodle-meta"><div class="task-icon">' + ART.icon(task.id) + '</div>' +
      '<div><h3>' + taskName(task) + '</h3><p>' + t('studio.day', { n: pad2(task.day) }) + ' · ' + fmtLong(new Date(rec.at)) +
      (rec.makeup ? t('doodle.makeup') : '') + '</p></div></div>';
    if (rec.art) {
      html += '<div class="doodle-figure"><img src="' + rec.art + '" alt="' + escapeAttr(taskName(task)) + '"></div>';
    } else {
      html += '<div class="doodle-figure"><div class="doodle-empty">' + t('doodle.empty') + '</div></div>';
    }
    html += '<div class="doodle-actions">' +
      (rec.art ? '<button type="button" class="btn btn-ghost" id="doodle-download">' + icon('i-download') + t('doodle.download') + '</button>' : '') +
      '<button type="button" class="btn btn-primary" id="doodle-share">' + icon('i-share') + t('doodle.share') + '</button></div>';
    var modal = openModal(html, { className: 'modal--narrow', label: taskName(task) });
    var dl = $('#doodle-download', modal.modal);
    if (dl) {
      dl.addEventListener('click', function () {
        var a = document.createElement('a');
        a.href = rec.art;
        a.download = 'xppen-' + task.id + '-day-' + pad2(task.day) + '.jpg';
        a.click();
      });
    }
    $('#doodle-share', modal.modal).addEventListener('click', function () {
      modal.close();
      setTimeout(function () { openShare(taskId); }, 200);
    });
  }

  /* -------------------------------------------------------------------- hero */

  function handleHeroCta() {
    var action = $('#hero-cta').dataset.action;
    if (!state.user && action !== 'town' && action !== 'before') {
      requireAuth(handleHeroCta);
      return;
    }
    if (action === 'gate') {
      openLimitedDraw();
      return;
    }
    if (action === 'keepsake') { openKeepsake(); return; }
    if (action === 'town') {
      document.getElementById('top').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (action === 'before') { toast(t('toast.beforeStart')); openRules(); return; }
    if (action === 'done') {
      if (fragments() >= 28) { openKeepsake(); return; }
      openFreeStudio();
      return;
      document.getElementById('studio').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    document.getElementById('studio').scrollIntoView({ behavior: 'smooth' });
    setTimeout(function () { var el = $('#submit-drawing'); if (el) el.focus({ preventScroll: true }); }, 600);
  }

  /* ------------------------------------------------------------------- share */

  function escapeHtml(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function escapeAttr(str) { return escapeHtml(str).replace(/`/g, '&#96;'); }

  /* -------------------------------------------------------------------- demo */

  function simValueForInput(date) {
    var p = shParts(date);
    return p.y + '-' + pad2(p.m) + '-' + pad2(p.d) + 'T' + pad2(p.h) + ':' + pad2(p.mi);
  }

  function applySimInput(value) {
    if (!value) return;
    var iso = value.length === 16 ? value + ':00+08:00' : value + '+08:00';
    var d = new Date(iso);
    if (isNaN(d.getTime())) { toast(t('demo.dateError')); return; }
    state.sim = d.toISOString();
    syncSimClock(state);
    state.ui.selectedId = null;
    state.ui.justSubmitted = null;
    padTaskId = null;
    save();
    renderAll();
    toast(t('demo.sim', { date: fmtLong(d), time: fmtClock(d) }));
  }

  function demoWindow(s, id) {
    var t = new Date(s.sim);
    s.nodes[id] = {
      achievedAt: t.toISOString(),
      endAt: new Date(Math.min(t.getTime() + 24 * 3600 * 1000, END.getTime())).toISOString()
    };
  }

  function scenarioTasks(s, days, opts) {
    opts = opts || {};
    for (var i = 1; i <= days; i++) {
      var t = TASKS[i - 1];
      s.completed[t.id] = {
        at: new Date(taskOpenAt(t).getTime() + 11 * 3600 * 1000).toISOString(),
        makeup: false,
        art: null
      };
    }
    if (typeof opts.energy === 'number') s.energy = opts.energy;
  }

  function seedPrizesFor(nodeId, count, s) {
    var pool = POOLS.limited;
    for (var i = 0; i < count; i++) {
      var prize = pool[Math.floor(Math.random() * pool.length)];
      var rec = makePrizeRecord(prize, 'limited');
      rec.at = new Date(s.sim).toISOString();
      s.prizes.push(rec);
    }
  }

  function loadScenario(name) {
    var s = emptyState();
    s.user = state.user;
    s.keepsake.name = state.user ? state.user.name : '';
    s.ui = { filter: 'all', selectedId: null, justSubmitted: null };

    if (name === 'fresh') {
      s.sim = '2026-12-03T10:30:00+08:00';
    } else if (name === 'stage1') {
      s.sim = '2026-12-08T19:20:00+08:00';
      scenarioTasks(s, 5, { energy: 5 });
    } else if (name === 'stage3') {
      s.sim = '2026-12-20T19:20:00+08:00';
      scenarioTasks(s, 17, { energy: 5 });
      demoWindow(s, 'stage1');
      demoWindow(s, 'stage2');
      seedPrizesFor('stage1', 2, s);
      seedPrizesFor('stage2', 2, s);
    } else if (name === 'xmas') {
      s.sim = '2026-12-25T12:00:00+08:00';
      scenarioTasks(s, 18, { energy: 2 });
      demoWindow(s, 'stage1');
      demoWindow(s, 'stage2');
      demoWindow(s, 'stage3');
      s.special = { chances: 0, used: 0 };
      seedPrizesFor('stage1', 2, s);
      seedPrizesFor('stage2', 2, s);
      seedPrizesFor('stage3', 2, s);
    } else if (name === 'makeupstage') {
      s.sim = '2026-12-27T15:00:00+08:00';
      scenarioTasks(s, 5, { energy: 5 });
      s.ui.selectedId = TASKS[5].id;
    } else if (name === 'makeup') {
      s.sim = '2026-12-27T15:00:00+08:00';
      scenarioTasks(s, 20, { energy: 0 });
      s.ui.selectedId = TASKS[20].id;
      demoWindow(s, 'stage1');
      demoWindow(s, 'stage2');
      demoWindow(s, 'stage3');
      s.special = { chances: 0, used: 1 };
      seedPrizesFor('stage1', 2, s);
      seedPrizesFor('stage2', 2, s);
      seedPrizesFor('stage3', 2, s);
    } else if (name === 'complete') {
      s.sim = '2026-12-30T15:00:00+08:00';
      scenarioTasks(s, 28, { energy: 0 });
      demoWindow(s, 'stage1');
      demoWindow(s, 'stage2');
      demoWindow(s, 'stage3');
      s.special = { chances: 0, used: 2 };
      seedPrizesFor('stage1', 2, s);
      seedPrizesFor('stage2', 2, s);
      seedPrizesFor('stage3', 2, s);
      s.keepsake.code = null;
      s.seen.complete = true;
    }

    closeAllModals();
    state = s;
    syncSimClock(state);
    padTaskId = null;
    save();
    renderAll();
    syncDemoDateInput();
    toast(t('demo.scenarioToast', { name: t('demo.scenario.' + name) }));
  }

  function syncDemoDateInput() {
    var input = $('#demo-date');
    if (input) input.value = simValueForInput(now());
  }

  function openDemo() {
    $('#demo-panel').hidden = false;
    $('#avatar-menu').hidden = true;
    syncDemoDateInput();
  }

  /* ------------------------------------------------------------------ events */

  function updateLangSwitch() {
    $$('.lang-switch [data-lang]').forEach(function (b) {
      var on = b.dataset.lang === I18N.current();
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function setLanguage(next) {
    if (!next || next === I18N.current()) return;
    I18N.set(next);
    I18N.applyStatic();
    updateLangSwitch();
    buildScene();
    closeAllModals();
    $('#avatar-menu').hidden = true;
    var err = $('#auth-error');
    if (err) { err.hidden = true; err.textContent = ''; }
    var authBtn = $('#auth-submit');
    if (authBtn) { authBtn.textContent = t('auth.submit'); authBtn.disabled = false; }
    resetClear();
    $$('.swatch').forEach(function (el, i) { el.setAttribute('aria-label', t('tool.colour', { n: i + 1 })); });
    $$('.size').forEach(function (el, i) { el.setAttribute('aria-label', t('tool.brushSize', { n: i + 1 })); });
    var toasts = $('#toasts');
    if (toasts) toasts.innerHTML = '';
    renderAll();
    updateToolState();
    toast(t('toast.lang'));
  }

  function waitFonts() {
    if (document.fonts && document.fonts.ready) return document.fonts.ready;
    return Promise.resolve();
  }

  function bindEvents() {
    $('#hero-cta').addEventListener('click', handleHeroCta);
    $('#submit-drawing').addEventListener('click', submitDrawing);

    $('#studio-gate').addEventListener('click', function (e) {
      if (!e.target.closest('#gate-cta')) return;
      var handler = $('#studio-gate')._handler;
      if (handler) handler();
    });

    [['#hud-draw', 'limited'], ['#gifts-draw', 'limited'], ['#mobile-draw', 'limited'],
     ['#hud-special-draw', 'special'], ['#gifts-special-draw', 'special']].forEach(function (pair) {
      var btn = $(pair[0]);
      if (btn) btn.addEventListener('click', function () { activateDrawEntry(pair[1]); });
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-gift-toggle]'), function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('.gift-pool');
        if (!card) return;
        card.classList.toggle('is-list-open');
        updateGiftToggles();
      });
    });
    var signoutBtn = $('#signout-btn');
    if (signoutBtn) signoutBtn.addEventListener('click', signOut);

    var milestoneList = $('#milestone-list');
    if (milestoneList) milestoneList.addEventListener('click', function (e) {
      var row = e.target.closest('[data-node]');
      if (!row) return;
      var id = row.dataset.node;
      if (id === 'special') {
        if (fragments() < SPECIAL.at) { toast(t('toast.need18')); return; }
        if (now() < SPEC_OPEN) { toast(t('toast.specialNotOpen')); return; }
        if (now() > SPEC_CLOSE) { toast(t('toast.specialClosed')); return; }
        openSpecialDraw();
        return;
      }
      var node = state.nodes[id];
      if (!node.achievedAt) {
        var m = MILESTONES.filter(function (x) { return x.id === id; })[0];
        var need = m.at - fragments();
        toast(m.at + ' pieces needed — ' + need + ' more to go.');
        return;
      }
      openLimitedDraw();
    });

    $('#share-chance').addEventListener('click', function () { openShare(); });
    $('#done-share').addEventListener('click', function () {
      var id = $('#done-view').dataset.task;
      openShare(id || undefined);
    });
    $('#done-continue').addEventListener('click', function () {
      openFreeStudio();
    });

    $('#done-view').addEventListener('click', function () {
      var id = this.dataset.task;
      if (id) openDoodle(id);
      else document.getElementById('top').scrollIntoView({ behavior: 'smooth' });
    });

    $('#makeup-chips').addEventListener('click', function (e) {
      var chip = e.target.closest('[data-select]');
      if (!chip) return;
      state.ui.selectedId = chip.dataset.select || null;
      state.ui.justSubmitted = null;
      padTaskId = null;
      renderStudio();
      document.getElementById('studio').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    var mural = $('#mural');
    if (mural) {
      mural.addEventListener('click', function (e) {
        var sign = e.target.closest('[data-complete]');
        if (sign) { openKeepsake(); return; }
        var piece = e.target.closest('.mural-piece');
        if (!piece) return;
        var task = BY_ID[piece.dataset.task];
        if (!task) return;
        var st = taskStatus(task);
        if (st === 'done') { openDoodle(task.id); return; }
        if (st === 'today' || st === 'makeup') {
          state.ui.selectedId = st === 'makeup' ? task.id : null;
          state.ui.justSubmitted = null;
          padTaskId = null;
          renderStudio();
          document.getElementById('studio').scrollIntoView({ behavior: 'smooth' });
          return;
        }
        if (st === 'locked') {
          toast(t('album.opensOn', { name: taskName(task), date: fmtShort(taskOpenAt(task)) }));
        } else if (st === 'missed') {
          toast(t('album.missed'));
        } else {
          toast(t('album.closed'));
        }
      });
    }

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-open-rules],[data-open-prizes],[data-open-keepsake],[data-open-demo],[data-open-works],[data-sign-out]');
      if (trigger) {
        if (trigger.hasAttribute('data-open-rules')) openRules();
        else if (trigger.hasAttribute('data-open-prizes')) openPrizes();
        else if (trigger.hasAttribute('data-open-keepsake')) openKeepsake();
        else if (trigger.hasAttribute('data-open-demo')) openDemo();
        else if (trigger.hasAttribute('data-open-works')) openWorks();
        else if (trigger.hasAttribute('data-sign-out')) signOut();
        $('#avatar-menu').hidden = true;
        return;
      }
      var shareBtn = e.target.closest('[data-share]');
      if (shareBtn) openShare();
    });


    // auth
    $('#auth-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var email = $('#auth-email').value.trim();
      var pass = $('#auth-pass').value;
      var err = $('#auth-error');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        err.textContent = t('auth.invalidEmail');
        err.hidden = false;
        return;
      }
      if (pass.length < 6) {
        err.textContent = t('auth.shortPass');
        err.hidden = false;
        return;
      }
      err.hidden = true;
      var btn = $('#auth-submit');
      btn.disabled = true;
      btn.textContent = t('auth.signingIn');
      setTimeout(function () {
        btn.disabled = false;
        btn.textContent = t('auth.submit');
        setUser(email);
      }, 650);
    });
    $('#auth-demo').addEventListener('click', function () {
      setUser('demo@xp-pen.com');
    });
    $('#auth-close').addEventListener('click', closeAuth);
    $('#auth').addEventListener('click', function (e) {
      if (e.target !== this) return;
      if (Date.now() - authOpenedAt < 400) return;
      closeAuth();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('#auth').hidden) {
        e.preventDefault();
        closeAuth();
      }
    });

    // demo panel
    $('#demo-fab').addEventListener('click', function () {
      var panel = $('#demo-panel');
      panel.hidden = !panel.hidden;
      if (!panel.hidden) syncDemoDateInput();
    });
    $('#demo-close').addEventListener('click', function () { $('#demo-panel').hidden = true; });
    $('#demo-apply').addEventListener('click', function () { applySimInput($('#demo-date').value); });
    $('#demo-panel').addEventListener('click', function (e) {
      var jump = e.target.closest('[data-jump]');
      if (jump) {
        applySimInput(jump.dataset.jump);
        if (jump.dataset.jump === '2026-12-25T12:00') syncSpecial();
        renderAll();
        return;
      }
      var scenario = e.target.closest('[data-scenario]');
      if (scenario) { loadScenario(scenario.dataset.scenario); return; }
      var act = e.target.closest('[data-demo]');
      if (!act) return;
      var kind = act.dataset.demo;
      if (kind === 'piece') {
        var next = TASKS.filter(function (t) { return !state.completed[t.id]; })[0];
        if (!next) { toast(t('demo.allPieces')); return; }
        state.completed[next.id] = { at: new Date(now()).toISOString(), makeup: false, art: null };
        if (fragments() <= 18) state.energy = (state.energy || 0) + 1;
        unlockNodes();
        syncSpecial();
        save();
        state.ui.justSubmitted = null;
        renderAll();
        toast(t('demo.pieceToast', { name: taskName(next) }));
      } else if (kind === 'chance') {
        state.energy = (state.energy || 0) + 1;
        save();
        renderAll();
        toast(t('demo.chanceToast'));
      } else if (kind === 'finish-draws') {
        state.energy = 0;
        state.special.used = specialLimit();
        save();
        closeAllModals();
        renderAll();
        toast(t('demo.finishToast'));
      } else if (kind === 'reset') {
        loadScenario('fresh');
        toast(t('demo.resetToast'));
      }
    });

    $$('.lang-switch').forEach(function (group) {
      group.addEventListener('click', function (e) {
        var b = e.target.closest('[data-lang]');
        if (b) setLanguage(b.dataset.lang);
      });
    });

    // nav active state
    var sections = ['top', 'studio', 'collection'];
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        var nav = id === 'top' ? 'town' : id;
        $$('.topnav a[data-nav], .bottom-nav a[data-nav]').forEach(function (a) {
          a.classList.toggle('is-active', a.dataset.nav === nav);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // header shadow
    window.addEventListener('scroll', function () {
      $('#topbar').classList.toggle('is-scrolled', window.scrollY > 12);
    }, { passive: true });

    // thumbnails on nav links
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () {
        $('#avatar-menu').hidden = true;
      });
    });
  }

  function signOut() {
    state.user = null;
    save();
    $('#avatar-menu').hidden = true;
    currentStudio = null;
    redrawTask = null;
    state.ui.justSubmitted = null;
    state.ui.selectedId = null;
    renderAll();
    toast(t('auth.signOutToast'));
  }

  /* -------------------------------------------------------------------- init */

  function init() {
    I18N.set(I18N.current());
    I18N.applyStatic();
    updateLangSwitch();
    state = load();
    syncSimClock(state);
    buildScene();
    initSnow();
    initPad();
    bindEvents();
    renderPrizeStrip();
    renderAll();
    startClock();
    syncDemoDateInput();
    hideAuth();
    updateToolState();
  }

  setInterval(function () { if (!document.hidden && state) updateDrawEntry(); }, 1000);

  document.addEventListener('DOMContentLoaded', init);
})();
