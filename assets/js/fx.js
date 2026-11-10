/*
 * 背景特效：滿版電路板（細密迷宮）＋沿走線流動的電流
 * ------------------------------------------------------------
 * - 走線：整頁切成小格，許多條走線各自找路（只走水平、垂直、45°），
 *   遇到別的線就轉彎，因此錯綜複雜又不會交叉；末端有焊點（過孔）。
 *   文字區（首頁介紹、各區標題）一開始就不長線。
 * - 電流：背景隨時有幾道光沿走線流動；滑鼠移動時，從游標最近的走線
 *   往兩個方向放出電流，附近的走線也會反光。
 * - 手機（沒有滑鼠）：手指點一下，點擊處會亮起一圈反光，並從附近幾條走線放出電流。
 * - 分兩層畫（2026-11-10 起）：
 *   1. 電路板層：走線與焊點畫在「跟著頁面一起捲動」的分塊畫布上，只畫一次，
 *      捲動時由瀏覽器直接移動，不用重畫，手機滑動才會順。
 *   2. 動態層：電流與反光畫在固定於視窗的 canvas（#fx）上，每格更新。
 * - 開啟「減少動態效果」時只畫靜態走線；分頁不在前景時暫停。
 * - 兩層都在文字與卡片後面，不影響點擊。
 * 調整參數請改下方 CONFIG。
 */
(function () {
  "use strict";

  var CONFIG = {
    seed: 7,                  // 佈局亂數種子（換數字就換一種排法）
    cell: 10,                 // 走線格距（px），越小越密
    density: 1.0,             // 走線嘗試次數倍率，越大越滿
    turn: 0.13,               // 每一步轉 45° 的機率，越大越彎曲
    maxLen: 55,               // 單條走線最多幾格
    ambientCount: 5,          // 背景同時流動的電流數（手機為 3）
    cursorMax: 8,             // 滑鼠電流同時最多幾道
    color: "129, 216, 208",   // 電流顏色（蒂芬妮藍）
    spotlight: 170,           // 滑鼠反光半徑（px）
    // 手機點擊：找點擊處附近幾條走線放電流，並亮起一圈反光
    tapRadius: 110,           // 往外找走線的範圍（px）
    tapTraces: 4,             // 最多從幾條走線放電流（每條往兩個方向）
    tapGlow: 140,             // 點擊反光半徑（px）
    tapGlowMs: 900,           // 點擊反光淡出時間（毫秒）
    tapMax: 16,               // 點擊電流同時最多幾道
    // 走線緊貼繞開的文字與按鈕（只避開字和按鈕本身，不會空出一大塊）
    quietText: ".hero .eyebrow, .hero__title, .hero__lead, .hero__stats dt, .hero__stats dd, .section__head .eyebrow, .section__title, .section__desc," +
               " .skill__num, .skill__title, .skill__summary, .skill__points li, .skill__evidence-label," +
               " .method .eyebrow, .method__title, .method__num, .method__step-title, .method__text," +
               " .card__meta, .card__cat, .card__title, .card__summary," +
               " .about__label, .about__name, .about__title, .about__edu li, .about__lead, .about__stats dt, .about__stats dd",
    quietBox: ".hero__actions .btn, .filters .chip, .evidence, .card__more, .about__tag, .about__tools li, .about__cta",
    quietPad: 6,              // 文字與走線之間的間距（px）
    // 人物遮罩：元素加上 data-fx-mask="遮罩圖片網址"（白＝人物），走線會沿人物輪廓繞開
    // 換色區：卡片裡的走線、反光與電流改用卡片的顏色（讀卡片的 CSS 變數 --tint），
    //         其他元素也可以加 data-fx-tint="R, G, B" 指定顏色
    maskSel: "[data-fx-mask]",
    tintSel: "[data-fx-tint], .about, .skill, .card"
  };

  var canvas = document.getElementById("fx");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;
  document.documentElement.classList.add("has-fx");

  // 電路板層：放在 canvas 前面，跟著頁面捲動
  var board = document.createElement("div");
  board.className = "fx-board";
  board.setAttribute("aria-hidden", "true");
  canvas.parentNode.insertBefore(board, canvas);

  var reduce = matchMedia("(prefers-reduced-motion: reduce)");
  var coarse = matchMedia("(hover: none), (pointer: coarse)").matches;
  var W = 0, H = 0, dpr = 1, docH = 0, layoutW = 0;
  var traces = [], buckets = [], BUCKET = 200;
  var mouse = null, lastSpawn = { x: -1e4, y: -1e4 };
  var currents = [], nextAmbient = 0, taps = [];
  var running = false, lastT = 0;
  var TILE = 1024, tiles = [], zones = [], boardDpr = 1;

  var D8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function makeTrace(pts) {
    var cum = [0], minX = pts[0][0], maxX = minX, minY = pts[0][1], maxY = minY;
    for (var i = 1; i < pts.length; i++) {
      cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      minX = Math.min(minX, pts[i][0]); maxX = Math.max(maxX, pts[i][0]);
      minY = Math.min(minY, pts[i][1]); maxY = Math.max(maxY, pts[i][1]);
    }
    return { pts: pts, cum: cum, total: cum[cum.length - 1], minX: minX, maxX: maxX, minY: minY, maxY: maxY, via0: false };
  }

  /* ---------- 人物遮罩：載入一次後快取像素；載入完成時重新佈局 ---------- */
  var masks = {};
  function maskData(url) {
    if (!url) return null;
    var m = masks[url];
    if (m) return m.ready ? m : null;
    m = masks[url] = { ready: false };
    var img = new Image();
    img.onload = function () {
      var c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      var x = c.getContext("2d");
      x.drawImage(img, 0, 0);
      m.d = x.getImageData(0, 0, c.width, c.height).data;
      m.w = c.width; m.h = c.height; m.ready = true;
      docH = 0; resize(); if (!running) drawStatic();
    };
    img.src = url;
    return null;
  }

  /* ---------- 產生整頁走線（細密迷宮） ---------- */
  function layout() {
    var R = mulberry32(CONFIG.seed * 7919 + Math.round(W / 50));
    var ri = function (a, b) { return a + Math.floor(R() * (b - a + 1)); };
    var C = CONFIG.cell;
    var cols = Math.ceil(W / C) + 1, rows = Math.ceil(docH / C) + 1;
    var occ = new Uint8Array(cols * rows);
    var id = function (i, j) { return j * cols + i; };
    var free = function (i, j) { return i >= 0 && j >= 0 && i < cols && j < rows && !occ[id(i, j)]; };
    traces = [];

    // 文字與按鈕先佔掉，讓走線緊貼著繞開
    var sy = window.scrollY || 0, P = CONFIG.quietPad;
    function block(r) {
      if (!r.width || !r.height) return;
      var i0 = Math.max(0, Math.floor((r.left - P) / C)), i1 = Math.min(cols - 1, Math.ceil((r.right + P) / C));
      var j0 = Math.max(0, Math.floor((r.top + sy - P) / C)), j1 = Math.min(rows - 1, Math.ceil((r.bottom + sy + P) / C));
      for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) occ[id(i, j)] = 1;
    }
    // 文字：取每一行文字實際的範圍（不是整個區塊的寬度）
    document.querySelectorAll(CONFIG.quietText).forEach(function (el) {
      var range = document.createRange();
      range.selectNodeContents(el);
      [].forEach.call(range.getClientRects(), block);
    });
    // 按鈕：取按鈕外框
    document.querySelectorAll(CONFIG.quietBox).forEach(function (el) { block(el.getBoundingClientRect()); });
    // 人物遮罩：沿著人物輪廓（外擴 1 格）佔掉，走線就會繞開人物
    document.querySelectorAll(CONFIG.maskSel).forEach(function (el) {
      var m = maskData(el.getAttribute("data-fx-mask"));
      var r = el.getBoundingClientRect();
      if (!m || !r.width || !r.height) return;
      var top = r.top + sy;
      var i0 = Math.max(0, Math.floor(r.left / C)), i1 = Math.min(cols - 1, Math.ceil(r.right / C));
      var j0 = Math.max(0, Math.floor(top / C)), j1 = Math.min(rows - 1, Math.ceil((top + r.height) / C));
      for (var j = j0; j <= j1; j++) for (var i = i0; i <= i1; i++) {
        var u = Math.floor((i * C - r.left) / r.width * m.w), v = Math.floor((j * C - top) / r.height * m.h);
        if (u < 0 || v < 0 || u >= m.w || v >= m.h || m.d[(v * m.w + u) * 4] < 24) continue;
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          var a = i + dx, b = j + dy;
          if (a >= 0 && b >= 0 && a < cols && b < rows) occ[id(a, b)] = 1;
        }
      }
    });

    function canStep(i, j, d) {
      var ni = i + D8[d][0], nj = j + D8[d][1];
      if (!free(ni, nj)) return false;
      // 斜走時不可從兩條線的縫中穿過
      if (d % 2 === 1 && occ[id(i + D8[d][0], j)] && occ[id(i, j + D8[d][1])]) return false;
      return true;
    }

    function walk(i, j, d, max) {
      if (!free(i, j)) return;
      occ[id(i, j)] = 1;
      var cells = [[i, j]];
      for (var n = 0; n < max; n++) {
        if (R() < CONFIG.turn) d = (d + (R() < 0.5 ? 1 : 7)) % 8;
        if (!canStep(i, j, d)) {
          var ok = false, alts = [1, 7, 2, 6];
          for (var a = 0; a < alts.length; a++) {
            var d2 = (d + alts[a]) % 8;
            if (canStep(i, j, d2)) { d = d2; ok = true; break; }
          }
          if (!ok) break;
        }
        i += D8[d][0]; j += D8[d][1];
        occ[id(i, j)] = 1;
        cells.push([i, j]);
      }
      if (cells.length < 4) return;
      // 只保留轉折點
      var p = [cells[0]];
      for (var k = 1; k < cells.length - 1; k++) {
        var A = cells[k - 1], B = cells[k], Cc = cells[k + 1];
        if (B[0] - A[0] !== Cc[0] - B[0] || B[1] - A[1] !== Cc[1] - B[1]) p.push(B);
      }
      p.push(cells[cells.length - 1]);
      var t = makeTrace(p.map(function (q) { return [q[0] * C, q[1] * C]; }));
      t.via0 = R() < 0.35;
      traces.push(t);
    }

    var tries = Math.round(cols * rows * 0.95 * CONFIG.density);
    for (var k = 0; k < tries; k++) walk(ri(0, cols - 1), ri(0, rows - 1), [0, 2, 4, 6][ri(0, 3)], ri(6, CONFIG.maxLen));

    // 依垂直位置分桶，繪製時只取畫面內的走線
    buckets = [];
    traces.forEach(function (t) {
      for (var b = Math.floor(t.minY / BUCKET); b <= Math.floor(t.maxY / BUCKET); b++) (buckets[b] = buckets[b] || []).push(t);
    });
    layoutW = W;
    currents = [];
    taps = [];
    measureZones();
    rebuildTiles();
  }

  // 頁面內容高度：量 body（不含電路板層本身，否則電路板會把頁面越撐越高）
  function docHeight() {
    return Math.max(document.body.offsetHeight, window.innerHeight || 0);
  }

  function visibleTraces(top, bottom) {
    var out = [], seen = new Set();
    for (var b = Math.max(0, Math.floor(top / BUCKET)); b <= Math.floor(bottom / BUCKET); b++) {
      var list = buckets[b];
      if (!list) continue;
      for (var i = 0; i < list.length; i++) {
        var t = list[i];
        if (!seen.has(t) && t.maxY >= top && t.minY <= bottom) { seen.add(t); out.push(t); }
      }
    }
    return out;
  }

  /* ---------- 換色區：記住各卡片在整頁中的位置（版面變動時才重量） ---------- */
  function measureZones() {
    var sy = window.scrollY || 0, list = [];
    var els = document.querySelectorAll(CONFIG.tintSel);
    for (var z = 0; z < els.length; z++) {
      var el = els[z], r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      var tint = el.getAttribute("data-fx-tint") || getComputedStyle(el).getPropertyValue("--tint").trim();
      if (!tint) continue;
      list.push({ l: r.left, r: r.right, t: r.top + sy, b: r.bottom + sy, tint: tint });
    }
    var changed = list.length !== zones.length || list.some(function (a, i) {
      var b = zones[i];
      return Math.abs(a.l - b.l) > 0.5 || Math.abs(a.t - b.t) > 0.5 || Math.abs(a.r - b.r) > 0.5 || Math.abs(a.b - b.b) > 0.5 || a.tint !== b.tint;
    });
    zones = list;
    return changed;
  }

  /* ---------- 金屬拉絲的明暗：沿 45° 方向重複，整頁連續不斷 ---------- */
  var METAL = [[0.00, "140,175,198", 0.15], [0.22, "190,220,234", 0.24], [0.42, "125,158,182", 0.13],
               [0.62, "180,212,228", 0.22], [0.82, "125,158,182", 0.13], [1.00, "160,195,215", 0.19]];
  var METAL_T = [[0.00, 0.26], [0.30, 0.42], [0.55, 0.24], [0.80, 0.40], [1.00, 0.28]];
  function metalGradient(c, top, bottom, tint) {
    var P = W + H || 1, s0 = top, s1 = W + bottom;           // s = x + y（整頁座標）
    var g = c.createLinearGradient(s0 / 2, s0 / 2, s1 / 2, s1 / 2);
    var span = s1 - s0 || 1;
    var stops = tint ? METAL_T.map(function (s) { return [s[0], tint, s[1]]; }) : METAL;
    var k0 = Math.floor(s0 / P), k1 = Math.ceil(s1 / P);
    for (var k = k0; k <= k1; k++) {
      for (var i = 0; i < stops.length; i++) {
        var f = ((k + stops[i][0]) * P - s0) / span;
        if (f >= 0 && f <= 1) g.addColorStop(f, "rgba(" + stops[i][1] + "," + stops[i][2] + ")");
      }
    }
    return g;
  }

  // 在 c 上畫走線與焊點（整頁座標，呼叫前已設定好位移）
  function drawTraces(c, list, top, bottom, tint) {
    c.lineWidth = 1;
    c.lineJoin = "round"; c.lineCap = "round";
    c.strokeStyle = metalGradient(c, top, bottom, tint);
    c.beginPath();
    for (var i = 0; i < list.length; i++) {
      var p = list[i].pts;
      c.moveTo(p[0][0], p[0][1]);
      for (var k = 1; k < p.length; k++) c.lineTo(p[k][0], p[k][1]);
    }
    c.stroke();
    c.strokeStyle = tint ? "rgba(" + tint + ",0.5)" : "rgba(180,212,228,0.30)";
    c.beginPath();
    for (i = 0; i < list.length; i++) {
      var q = list[i].pts, e = q[q.length - 1];
      c.moveTo(e[0] + 2, e[1]); c.arc(e[0], e[1], 2, 0, Math.PI * 2);
      if (list[i].via0) { c.moveTo(q[0][0] + 2, q[0][1]); c.arc(q[0][0], q[0][1], 2, 0, Math.PI * 2); }
    }
    c.stroke();
  }

  /* ---------- 電路板層：分塊畫布，只畫畫面附近的幾塊 ---------- */
  function rebuildTiles() {
    boardDpr = coarse ? Math.min(dpr, 1.5) : dpr;
    board.style.height = docH + "px";
    var n = Math.max(1, Math.ceil(docH / TILE));
    while (tiles.length > n) board.removeChild(tiles.pop().el);
    while (tiles.length < n) {
      var el = document.createElement("canvas");
      board.appendChild(el);
      tiles.push({ el: el, c: el.getContext("2d") });
    }
    tiles.forEach(function (tile, i) {
      tile.top = i * TILE;
      tile.h = Math.min(TILE, docH - tile.top) || TILE;
      tile.el.style.top = tile.top + "px";
      tile.el.style.height = tile.h + "px";
      tile.drawn = false;
    });
    ensureTiles(window.scrollY || 0);
  }

  function renderTile(tile) {
    var el = tile.el, c = tile.c;
    el.width = Math.round(W * boardDpr); el.height = Math.round(tile.h * boardDpr);
    c.setTransform(boardDpr, 0, 0, boardDpr, 0, -tile.top * boardDpr);
    var top = tile.top, bottom = tile.top + tile.h;
    var list = visibleTraces(top - 20, bottom + 20);
    drawTraces(c, list, top, bottom);
    // 換色區：先清掉該區塊，再用卡片顏色重畫
    for (var z = 0; z < zones.length; z++) {
      var Z = zones[z];
      if (Z.b < top || Z.t > bottom) continue;
      var local = list.filter(function (t) { return t.maxY >= Z.t && t.minY <= Z.b && t.maxX >= Z.l && t.minX <= Z.r; });
      c.save();
      c.beginPath(); c.rect(Z.l, Z.t, Z.r - Z.l, Z.b - Z.t); c.clip();
      c.clearRect(Z.l, Z.t, Z.r - Z.l, Z.b - Z.t);
      drawTraces(c, local, top, bottom, Z.tint);
      c.restore();
    }
    tile.drawn = true;
  }

  // 只保留畫面上下各約兩塊，離太遠的釋放記憶體（手機很重要）
  function ensureTiles(sy) {
    if (!(W > 0 && H > 0)) return;
    var a = Math.floor((sy - H) / TILE), b = Math.floor((sy + 2 * H) / TILE);
    for (var i = 0; i < tiles.length; i++) {
      var tile = tiles[i];
      if (i >= a && i <= b) { if (!tile.drawn) renderTile(tile); }
      else if (tile.drawn && (i < a - 2 || i > b + 2)) { tile.el.width = 0; tile.el.height = 0; tile.drawn = false; }
    }
  }

  function redrawTiles() {
    tiles.forEach(function (tile) { tile.drawn = false; });
    ensureTiles(window.scrollY || 0);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // 寬度改變才重新佈局（手機捲動時網址列伸縮只改高度）
    var h = docHeight();
    if (W !== layoutW || Math.abs(h - docH) > 200) { docH = h; layout(); }
    else if (measureZones()) redrawTiles();
    else ensureTiles(window.scrollY || 0);
  }

  /* ---------- 動態層：反光與電流（畫在固定於視窗的 canvas） ---------- */
  function tracePath(t, sy) {
    var p = t.pts;
    ctx.moveTo(p[0][0], p[0][1] - sy);
    for (var i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1] - sy);
  }

  // 反光：游標或點擊處附近的走線變亮
  function glowAt(x, y, R, strength, sy, vis, color) {
    if (strength <= 0.01) return;
    var g = ctx.createRadialGradient(x, y - sy, 0, x, y - sy, R);
    g.addColorStop(0, "rgba(" + color + "," + strength.toFixed(3) + ")");
    g.addColorStop(1, "rgba(" + color + ",0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.2;
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.beginPath();
    for (var i = 0; i < vis.length; i++) {
      var t = vis[i];
      if (t.maxY < y - R || t.minY > y + R || t.maxX < x - R || t.minX > x + R) continue;
      tracePath(t, sy);
    }
    ctx.stroke();
  }

  function drawGlows(sy, vis, tint, now) {
    if (reduce.matches) return;
    var color = tint || CONFIG.color;
    if (mouse) glowAt(mouse.x, mouse.y, CONFIG.spotlight, tint ? 0.85 : 0.62, sy, vis, color);
    for (var i = 0; i < taps.length; i++) {
      var k = 1 - (now - taps[i].t0) / CONFIG.tapGlowMs;
      if (k > 0) glowAt(taps[i].x, taps[i].y, CONFIG.tapGlow, (tint ? 0.95 : 0.8) * k, sy, vis, color);
    }
  }

  function pointAt(t, d) {
    d = Math.max(0, Math.min(d || 0, t.total));
    var k = 1;
    while (k < t.cum.length - 1 && t.cum[k] < d) k++;
    var a = t.pts[k - 1], b = t.pts[k], seg = (t.cum[k] - t.cum[k - 1]) || 1, f = (d - t.cum[k - 1]) / seg;
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  }

  function strokeRange(t, a, b, sy) {
    if (a > b) { var s = a; a = b; b = s; }
    var p = pointAt(t, a);
    ctx.beginPath();
    ctx.moveTo(p[0], p[1] - sy);
    for (var k = 1; k < t.cum.length - 1; k++) if (t.cum[k] > a && t.cum[k] < b) ctx.lineTo(t.pts[k][0], t.pts[k][1] - sy);
    p = pointAt(t, b);
    ctx.lineTo(p[0], p[1] - sy);
    ctx.stroke();
  }

  // 電流：從 from 沿 dir（+1 / -1）方向跑；kind：ambient 背景／cursor 滑鼠／tap 點擊
  function spawn(t, from, dir, kind) {
    var c = { t: t, from: from, pos: from, dir: dir, kind: kind, cursor: kind !== "ambient" };
    if (kind === "cursor") { c.len = 140 + Math.random() * 120; c.speed = 420; c.tail = 55; c.alpha = 1; }
    else if (kind === "tap") { c.len = 220 + Math.random() * 180; c.speed = 380; c.tail = 70; c.alpha = 1; }
    else { c.len = t.total; c.speed = 230 + Math.random() * 90; c.tail = 80; c.alpha = 0.75; }
    currents.push(c);
  }

  // 找出 (x, y) 附近的走線，依距離由近到遠排序
  function nearTraces(x, y, r, vis, max) {
    var found = [];
    for (var n = 0; n < vis.length; n++) {
      var t = vis[n], bd = r * r, at = -1;
      if (t.maxX < x - r || t.minX > x + r || t.maxY < y - r || t.minY > y + r) continue;
      for (var k = 1; k < t.pts.length; k++) {
        var a = t.pts[k - 1], b = t.pts[k], vx = b[0] - a[0], vy = b[1] - a[1], L = vx * vx + vy * vy || 1;
        var f = Math.max(0, Math.min(1, ((x - a[0]) * vx + (y - a[1]) * vy) / L));
        var px = a[0] + vx * f, py = a[1] + vy * f, dd = (px - x) * (px - x) + (py - y) * (py - y);
        if (dd < bd) { bd = dd; at = t.cum[k - 1] + Math.sqrt(L) * f; }
      }
      if (at >= 0) found.push({ t: t, at: at, d: bd });
    }
    found.sort(function (a, b) { return a.d - b.d; });
    return found.slice(0, max);
  }

  function burstAt(x, y, vis) {
    var n = nearTraces(x, y, 45, vis, 1)[0];
    if (!n) return;
    spawn(n.t, n.at, 1, "cursor");
    if (n.at > 20) spawn(n.t, n.at, -1, "cursor");
  }

  // 手機點一下：反光＋從附近幾條走線往兩邊放電流
  function tapAt(cx, cy) {
    if (reduce.matches) return;
    var sy = window.scrollY || 0, y = cy + sy, now = performance.now();
    taps.push({ x: cx, y: y, t0: now });
    var tapN = currents.filter(function (c) { return c.kind === "tap"; }).length;
    var list = nearTraces(cx, y, CONFIG.tapRadius, visibleTraces(y - CONFIG.tapRadius, y + CONFIG.tapRadius), CONFIG.tapTraces);
    for (var i = 0; i < list.length && tapN < CONFIG.tapMax; i++) {
      spawn(list[i].t, list[i].at, 1, "tap"); tapN++;
      if (list[i].at > 20 && tapN < CONFIG.tapMax) { spawn(list[i].t, list[i].at, -1, "tap"); tapN++; }
    }
    if (!running) start();
  }

  // 電流跑完（超過終點一個尾巴長度）就移除
  function currentDone(c) {
    var endPos = c.dir > 0 ? Math.min(c.t.total, c.from + c.len) : Math.max(0, c.from - c.len);
    return (c.dir > 0 ? c.pos - endPos : endPos - c.pos) > c.tail;
  }

  function drawCurrent(c, sy, color) {
    var endPos = c.dir > 0 ? Math.min(c.t.total, c.from + c.len) : Math.max(0, c.from - c.len);
    var over = c.dir > 0 ? c.pos - endPos : endPos - c.pos;
    var head = c.dir > 0 ? Math.min(c.pos, endPos) : Math.max(c.pos, endPos);
    var tailPos = c.pos - c.dir * c.tail;
    var tp = c.dir > 0 ? Math.max(c.from, tailPos) : Math.min(c.from, tailPos);
    var fade = over > 0 ? 1 - over / c.tail : 1;
    ctx.lineWidth = 1.6;
    for (var n = 0; n < 5; n++) {
      var a = tp + (head - tp) * n / 5, b = tp + (head - tp) * (n + 1) / 5;
      if (Math.abs(b - a) < 0.5) continue;
      ctx.strokeStyle = "rgba(" + color + "," + (c.alpha * fade * (n + 1) / 5).toFixed(3) + ")";
      strokeRange(c.t, a, b, sy);
    }
    if (over <= 0) {
      var p = pointAt(c.t, head);
      ctx.fillStyle = "rgba(255,252,240," + c.alpha.toFixed(2) + ")";
      ctx.beginPath(); ctx.arc(p[0], p[1] - sy, 2, 0, Math.PI * 2); ctx.fill();
    }
  }

  // 畫一整層動態效果：反光＋電流（tint 有值時用該顏色）
  function paintFx(sy, vis, tint, list, now) {
    drawGlows(sy, vis, tint, now);
    if (!list.length) return;
    var color = tint || CONFIG.color;
    ctx.save();
    ctx.shadowColor = "rgba(" + color + ",0.95)";
    ctx.shadowBlur = coarse ? 6 : 9;
    ctx.lineCap = "round";
    for (var i = 0; i < list.length; i++) drawCurrent(list[i], sy, color);
    ctx.restore();
  }

  // 換色區：清掉該區塊的動態效果，改用卡片顏色重畫（只處理畫面內、而且有東西要畫的卡片）
  function paintFxZones(sy, vis, now) {
    for (var z = 0; z < zones.length; z++) {
      var Z = zones[z];
      if (Z.b < sy || Z.t > sy + H) continue;
      var list = currents.filter(function (c) { return c.t.maxY >= Z.t && c.t.minY <= Z.b && c.t.maxX >= Z.l && c.t.minX <= Z.r; });
      var lit = (mouse && mouse.x > Z.l - CONFIG.spotlight && mouse.x < Z.r + CONFIG.spotlight && mouse.y > Z.t - CONFIG.spotlight && mouse.y < Z.b + CONFIG.spotlight) ||
                taps.some(function (p) { return p.x > Z.l - CONFIG.tapGlow && p.x < Z.r + CONFIG.tapGlow && p.y > Z.t - CONFIG.tapGlow && p.y < Z.b + CONFIG.tapGlow; });
      if (!list.length && !lit) continue;
      var local = vis.filter(function (t) { return t.maxY >= Z.t && t.minY <= Z.b && t.maxX >= Z.l && t.minX <= Z.r; });
      var x = Z.l, y = Z.t - sy, w = Z.r - Z.l, h = Z.b - Z.t;
      ctx.save();
      ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      ctx.clearRect(x, y, w, h);
      paintFx(sy, local, Z.tint, list, now);
      ctx.restore();
    }
  }

  /* ---------- 主迴圈 ---------- */
  function frame(now, once) {
    if (!running && !once) return;
    var dt = lastT ? Math.max(0, Math.min((now - lastT) / 1000, 0.05)) : 0;
    lastT = now;
    var sy = window.scrollY || window.pageYOffset || 0;
    if (mouse) mouse.y = mouse.cy + sy;
    var h = docHeight();
    if (Math.abs(h - docH) > 200) { docH = h; layout(); }
    ensureTiles(sy);

    var vis = visibleTraces(sy - 20, sy + H + 20);

    // 背景電流：維持固定數量
    var ambient = 0, cursorN = 0;
    currents.forEach(function (c) { if (c.kind === "cursor") cursorN++; else if (c.kind === "ambient") ambient++; });
    var want = coarse ? Math.min(3, CONFIG.ambientCount) : CONFIG.ambientCount;
    if (ambient < want && now > nextAmbient && vis.length) {
      var t = vis[Math.floor(Math.random() * vis.length)];
      if (t.total > 80) spawn(t, 0, 1, "ambient");
      nextAmbient = now + 250 + Math.random() * 700;
    }

    // 滑鼠移動一小段，就從最近的走線往兩邊放出電流
    if (mouse && !coarse && cursorN < CONFIG.cursorMax) {
      var dx = mouse.x - lastSpawn.x, dy = mouse.y - lastSpawn.y;
      if (dx * dx + dy * dy > 22 * 22) { lastSpawn = { x: mouse.x, y: mouse.y }; burstAt(mouse.x, mouse.y, vis); }
    }

    // 推進電流，跑完或離畫面太遠的移除；點擊反光淡出後移除
    for (var i = currents.length - 1; i >= 0; i--) {
      var c = currents[i];
      c.pos += c.dir * c.speed * dt;
      if (c.t.maxY < sy - 400 || c.t.minY > sy + H + 400 || currentDone(c)) currents.splice(i, 1);
    }
    taps = taps.filter(function (p) { return now - p.t0 < CONFIG.tapGlowMs; });

    ctx.clearRect(0, 0, W, H);
    paintFx(sy, vis, null, currents, now);
    paintFxZones(sy, vis, now);
    if (!once) requestAnimationFrame(frame);
  }

  function drawStatic() {
    var h = docHeight();
    if (Math.abs(h - docH) > 200) { docH = h; layout(); }
    ensureTiles(window.scrollY || 0);
    ctx.clearRect(0, 0, W, H);
  }

  function start() {
    if (running || reduce.matches || document.hidden) return;
    running = true; lastT = 0;
    requestAnimationFrame(frame);
  }
  function stop() { running = false; }
  function update() {
    if (reduce.matches) { stop(); currents = []; taps = []; drawStatic(); }
    else start();
  }

  // 版面變動（篩選作品、圖片載入、字型載入）時，重量卡片位置並重畫電路板
  var refreshQueued = false;
  function refresh() {
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(function () {
      refreshQueued = false;
      var h = docHeight();
      if (Math.abs(h - docH) > 200) { docH = h; layout(); }
      else if (measureZones()) redrawTiles();
      if (!running) drawStatic();
    });
  }

  resize();
  window.addEventListener("resize", function () { resize(); if (!running) drawStatic(); });
  // 圖片、字型載入後版面位置會變，重新佈局讓文字區保持乾淨
  window.addEventListener("load", function () { docH = 0; resize(); if (!running) drawStatic(); });
  window.addEventListener("scroll", function () { ensureTiles(window.scrollY || 0); }, { passive: true });
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    mouse = { x: e.clientX, cy: e.clientY, y: e.clientY + (window.scrollY || 0) };
  }, { passive: true });
  // 手機：手指「點一下」才放電流（滑動頁面時不會觸發）
  var touchStart = null;
  window.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse") return;
    touchStart = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
  }, { passive: true });
  window.addEventListener("pointerup", function (e) {
    var s = touchStart; touchStart = null;
    if (!s || e.pointerType === "mouse" || e.pointerId !== s.id) return;
    var dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (dx * dx + dy * dy < 12 * 12 && performance.now() - s.t < 600) tapAt(e.clientX, e.clientY);
  }, { passive: true });
  window.addEventListener("pointercancel", function () { touchStart = null; }, { passive: true });
  document.documentElement.addEventListener("mouseleave", function () { mouse = null; });
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else update(); });
  if (reduce.addEventListener) reduce.addEventListener("change", update);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { docH = 0; resize(); if (!running) drawStatic(); });
  if (window.MutationObserver) {
    var main = document.querySelector("main") || document.body;
    new MutationObserver(refresh).observe(main, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "class"] });
  }
  if (window.ResizeObserver) new ResizeObserver(refresh).observe(document.body);

  drawStatic();
  update();

  // 除錯用：在瀏覽器主控台手動推進一格畫面，例如 PortfolioFX.step(1000)
  window.PortfolioFX = {
    step: function (ms) { frame((lastT || performance.now()) + (ms || 16), true); },
    count: function () { return currents.length; },
    tap: function (x, y) { tapAt(x, y); },
    stats: function () {
      return { traces: traces.length, docH: docH, tiles: tiles.length, drawnTiles: tiles.filter(function (t) { return t.drawn; }).length, zones: zones.length };
    }
  };
})();
