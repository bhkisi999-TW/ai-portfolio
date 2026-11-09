/*
 * 背景特效：滿版電路板（細密迷宮）＋沿走線流動的電流
 * ------------------------------------------------------------
 * - 走線：整頁切成小格，許多條走線各自找路（只走水平、垂直、45°），
 *   遇到別的線就轉彎，因此錯綜複雜又不會交叉；末端有焊點（過孔）。
 *   文字區（首頁介紹、各區標題）一開始就不長線。
 * - 電流：背景隨時有幾道光沿走線流動；滑鼠移動時，從游標最近的走線
 *   往兩個方向放出電流，附近的走線也會反光。手機上點一下也會放出電流。
 * - 開啟「減少動態效果」時只畫靜態走線；分頁不在前景時暫停。
 * - 畫在固定於視窗的 canvas 上（在文字與卡片後面），不影響點擊。
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

  var reduce = matchMedia("(prefers-reduced-motion: reduce)");
  var coarse = matchMedia("(hover: none), (pointer: coarse)").matches;
  var W = 0, H = 0, dpr = 1, docH = 0, layoutW = 0;
  var traces = [], buckets = [], BUCKET = 200;
  var mouse = null, lastSpawn = { x: -1e4, y: -1e4 };
  var currents = [], nextAmbient = 0;
  var running = false, lastT = 0;

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

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // 寬度改變才重新佈局（手機捲動時網址列伸縮只改高度）
    var h = document.documentElement.scrollHeight;
    if (W !== layoutW || Math.abs(h - docH) > 200) { docH = h; layout(); }
  }

  /* ---------- 繪製 ---------- */
  function tracePath(t, sy) {
    var p = t.pts;
    ctx.moveTo(p[0][0], p[0][1] - sy);
    for (var i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1] - sy);
  }

  // tint：換色區的顏色（"R, G, B"）；沒有傳就用預設的金屬銀灰與蒂芬妮藍
  function drawBoard(sy, vis, tint) {
    // 視窗大小為 0（例如分頁在背景載入）時先不畫，避免漸層計算出錯
    if (!(W > 0 && H > 0)) return;
    var accent = tint || CONFIG.color;
    // 走線：金屬拉絲般的明暗變化（換色區改成該顏色的明暗）
    var shift = (sy * 0.12) % (W + H);
    var metal = ctx.createLinearGradient(-shift, 0, W + H - shift, H);
    if (tint) {
      metal.addColorStop(0.00, "rgba(" + tint + ",0.26)");
      metal.addColorStop(0.30, "rgba(" + tint + ",0.42)");
      metal.addColorStop(0.55, "rgba(" + tint + ",0.24)");
      metal.addColorStop(0.80, "rgba(" + tint + ",0.40)");
      metal.addColorStop(1.00, "rgba(" + tint + ",0.28)");
    } else {
      metal.addColorStop(0.00, "rgba(140,175,198,0.15)");
      metal.addColorStop(0.22, "rgba(190,220,234,0.24)");
      metal.addColorStop(0.42, "rgba(125,158,182,0.13)");
      metal.addColorStop(0.62, "rgba(180,212,228,0.22)");
      metal.addColorStop(0.82, "rgba(125,158,182,0.13)");
      metal.addColorStop(1.00, "rgba(160,195,215,0.19)");
    }
    ctx.lineWidth = 1;
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.strokeStyle = metal;
    ctx.beginPath();
    for (var i = 0; i < vis.length; i++) tracePath(vis[i], sy);
    ctx.stroke();

    // 過孔（焊點）
    ctx.strokeStyle = tint ? "rgba(" + tint + ",0.5)" : "rgba(180,212,228,0.30)";
    ctx.beginPath();
    for (i = 0; i < vis.length; i++) {
      var p = vis[i].pts, e = p[p.length - 1];
      ctx.moveTo(e[0] + 2, e[1] - sy); ctx.arc(e[0], e[1] - sy, 2, 0, Math.PI * 2);
      if (vis[i].via0) { ctx.moveTo(p[0][0] + 2, p[0][1] - sy); ctx.arc(p[0][0], p[0][1] - sy, 2, 0, Math.PI * 2); }
    }
    ctx.stroke();

    // 滑鼠附近的走線反光
    if (mouse && !reduce.matches) {
      var mx = mouse.x, my = mouse.y, R = CONFIG.spotlight;
      var glow = ctx.createRadialGradient(mx, my - sy, 0, mx, my - sy, R);
      glow.addColorStop(0, "rgba(" + accent + "," + (tint ? 0.85 : 0.62) + ")");
      glow.addColorStop(1, "rgba(" + accent + ",0)");
      ctx.strokeStyle = glow;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (i = 0; i < vis.length; i++) {
        var t = vis[i];
        if (t.maxY < my - R || t.minY > my + R || t.maxX < mx - R || t.minX > mx + R) continue;
        tracePath(t, sy);
      }
      ctx.stroke();
    }
  }

  /* ---------- 電流 ---------- */
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

  // 電流：從 from 沿 dir（+1 / -1）方向跑 len 的距離
  function spawn(t, from, dir, cursor) {
    currents.push({ t: t, from: from, pos: from, dir: dir,
                    len: cursor ? 140 + Math.random() * 120 : t.total,
                    speed: cursor ? 420 : 230 + Math.random() * 90,
                    tail: cursor ? 55 : 80, alpha: cursor ? 1 : 0.75, cursor: cursor });
  }

  function nearestTrace(x, y, r, vis) {
    var best = null, bd = r * r;
    for (var n = 0; n < vis.length; n++) {
      var t = vis[n];
      if (t.maxX < x - r || t.minX > x + r || t.maxY < y - r || t.minY > y + r) continue;
      for (var k = 1; k < t.pts.length; k++) {
        var a = t.pts[k - 1], b = t.pts[k], vx = b[0] - a[0], vy = b[1] - a[1], L = vx * vx + vy * vy || 1;
        var f = Math.max(0, Math.min(1, ((x - a[0]) * vx + (y - a[1]) * vy) / L));
        var px = a[0] + vx * f, py = a[1] + vy * f, dd = (px - x) * (px - x) + (py - y) * (py - y);
        if (dd < bd) { bd = dd; best = { t: t, at: t.cum[k - 1] + Math.sqrt(L) * f }; }
      }
    }
    return best;
  }

  function burstAt(x, y, vis) {
    var n = nearestTrace(x, y, 45, vis);
    if (!n) return;
    spawn(n.t, n.at, 1, true);
    if (n.at > 20) spawn(n.t, n.at, -1, true);
  }

  // 電流跑完（超過終點一個尾巴長度）就移除
  function currentDone(c) {
    var endPos = c.dir > 0 ? Math.min(c.t.total, c.from + c.len) : Math.max(0, c.from - c.len);
    return (c.dir > 0 ? c.pos - endPos : endPos - c.pos) > c.tail;
  }

  function drawCurrent(c, sy, color) {
    color = color || CONFIG.color;
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

  // 畫一整層：走線、反光、電流（tint 有值時用該顏色）
  function paint(sy, vis, tint) {
    drawBoard(sy, vis, tint);
    var color = tint || CONFIG.color;
    ctx.save();
    ctx.shadowColor = "rgba(" + color + ",0.95)";
    ctx.shadowBlur = 9;
    ctx.lineCap = "round";
    for (var i = 0; i < currents.length; i++) drawCurrent(currents[i], sy, color);
    ctx.restore();
  }

  // 換色區：先清掉該區塊，再用指定顏色重畫一次（只畫在區塊範圍內）
  function paintTintZones(sy, vis) {
    var zones = document.querySelectorAll(CONFIG.tintSel);
    for (var z = 0; z < zones.length; z++) {
      var el = zones[z], r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > H || !r.width) continue;
      var tint = el.getAttribute("data-fx-tint") || getComputedStyle(el).getPropertyValue("--tint").trim();
      if (!tint) continue;
      // 只取跟這個區塊重疊的走線，減少重畫的量
      var top = r.top + sy, bottom = r.bottom + sy;
      var local = vis.filter(function (t) { return t.maxY >= top && t.minY <= bottom && t.maxX >= r.left && t.minX <= r.right; });
      ctx.save();
      ctx.beginPath(); ctx.rect(r.left, r.top, r.width, r.height); ctx.clip();
      ctx.clearRect(r.left, r.top, r.width, r.height);
      paint(sy, local, tint);
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
    var h = document.documentElement.scrollHeight;
    if (Math.abs(h - docH) > 200) { docH = h; layout(); }

    var vis = visibleTraces(sy - 20, sy + H + 20);

    // 背景電流：維持固定數量
    var ambient = 0, cursorN = 0;
    currents.forEach(function (c) { if (c.cursor) cursorN++; else ambient++; });
    var want = coarse ? Math.min(3, CONFIG.ambientCount) : CONFIG.ambientCount;
    if (ambient < want && now > nextAmbient && vis.length) {
      var t = vis[Math.floor(Math.random() * vis.length)];
      if (t.total > 80) spawn(t, 0, 1, false);
      nextAmbient = now + 250 + Math.random() * 700;
    }

    // 滑鼠移動一小段，就從最近的走線往兩邊放出電流
    if (mouse && !coarse && cursorN < CONFIG.cursorMax) {
      var dx = mouse.x - lastSpawn.x, dy = mouse.y - lastSpawn.y;
      if (dx * dx + dy * dy > 22 * 22) { lastSpawn = { x: mouse.x, y: mouse.y }; burstAt(mouse.x, mouse.y, vis); }
    }

    // 推進電流，跑完或離畫面太遠的移除
    for (var i = currents.length - 1; i >= 0; i--) {
      var c = currents[i];
      c.pos += c.dir * c.speed * dt;
      if (c.t.maxY < sy - 400 || c.t.minY > sy + H + 400 || currentDone(c)) currents.splice(i, 1);
    }

    ctx.clearRect(0, 0, W, H);
    paint(sy, vis);
    paintTintZones(sy, vis);
    if (!once) requestAnimationFrame(frame);
  }

  function drawStatic() {
    var sy = window.scrollY || 0;
    var h = document.documentElement.scrollHeight;
    if (Math.abs(h - docH) > 200) { docH = h; layout(); }
    var vis = visibleTraces(sy - 20, sy + H + 20);
    ctx.clearRect(0, 0, W, H);
    drawBoard(sy, vis);
    var saved = currents; currents = [];
    paintTintZones(sy, vis);
    currents = saved;
  }

  function start() {
    if (running || reduce.matches || document.hidden) return;
    running = true; lastT = 0;
    requestAnimationFrame(frame);
  }
  function stop() { running = false; }
  function update() {
    if (reduce.matches) { stop(); currents = []; drawStatic(); }
    else start();
  }

  resize();
  window.addEventListener("resize", function () { resize(); if (!running) drawStatic(); });
  // 圖片、字型載入後版面位置會變，重新佈局讓文字區保持乾淨
  window.addEventListener("load", function () { docH = 0; resize(); if (!running) drawStatic(); });
  window.addEventListener("scroll", function () { if (!running) drawStatic(); }, { passive: true });
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    mouse = { x: e.clientX, cy: e.clientY, y: e.clientY + (window.scrollY || 0) };
  }, { passive: true });
  // 手機：點一下就從附近的走線放出電流
  window.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" || reduce.matches) return;
    var sy = window.scrollY || 0;
    burstAt(e.clientX, e.clientY + sy, visibleTraces(sy, sy + H));
  }, { passive: true });
  document.documentElement.addEventListener("mouseleave", function () { mouse = null; });
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else update(); });
  if (reduce.addEventListener) reduce.addEventListener("change", update);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { docH = 0; resize(); if (!running) drawStatic(); });

  drawStatic();
  update();

  // 除錯用：在瀏覽器主控台手動推進一格畫面，例如 PortfolioFX.step(1000)
  window.PortfolioFX = {
    step: function (ms) { frame((lastT || performance.now()) + (ms || 16), true); },
    count: function () { return currents.length; },
    stats: function () { return { traces: traces.length, docH: docH }; }
  };
})();
