/*
 * AI 實戰作品集 — 互動邏輯
 * 資料來源：data/site.js（網站設定、分類）與 data/works.js（作品）。
 * 新增作品時通常不需要修改這個檔案。
 */
(function () {
  "use strict";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === undefined || v === null || v === false) return;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function hasText(v) { return typeof v === "string" && v.trim() !== ""; }

  /* 只接受真實網址：http(s) 或站內相對路徑；拒絕空字串、#、javascript: 等 */
  function isUsableUrl(u) {
    if (!hasText(u)) return false;
    var s = u.trim();
    if (s.charAt(0) === "#") return false;
    if (/^(javascript|data|vbscript):/i.test(s)) return false;
    if (/^https?:\/\/[^\s]+$/i.test(s)) return true;
    return !/^[a-z][a-z0-9+.-]*:/i.test(s); // 相對路徑
  }
  function isExternal(u) { return /^https?:\/\//i.test(u.trim()); }

  function youtubeEmbed(url) {
    var m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
    return m ? "https://www.youtube-nocookie.com/embed/" + m[1] : null;
  }

  /* ---------- 資料整理 ---------- */
  function loadData() {
    var site = window.PORTFOLIO_SITE || {};
    var allCats = Array.isArray(window.PORTFOLIO_CATEGORIES) ? window.PORTFOLIO_CATEGORIES : [];
    var raw = Array.isArray(window.PORTFOLIO_WORKS) ? window.PORTFOLIO_WORKS : [];
    var catMap = {};
    allCats.forEach(function (c) { catMap[c.id] = c; });

    var seen = {};
    var works = raw.filter(function (w, i) {
      if (!w || !hasText(w.id) || !hasText(w.title)) {
        console.warn("[作品集] 第 " + (i + 1) + " 筆作品缺少 id 或 title，已略過。");
        return false;
      }
      if (seen[w.id]) { console.warn("[作品集] 作品 id 重複：" + w.id + "，已略過後者。"); return false; }
      if (!catMap[w.category]) {
        console.warn("[作品集] 作品「" + w.title + "」的分類 \"" + w.category + "\" 不存在於 data/site.js，已略過。");
        return false;
      }
      seen[w.id] = true;
      return true;
    });

    // 依 data/site.js 的分類順序，只保留有作品的分類
    var cats = allCats
      .map(function (c) {
        return { id: c.id, label: c.label, description: c.description,
                 count: works.filter(function (w) { return w.category === c.id; }).length };
      })
      .filter(function (c) { return c.count > 0; });

    return { site: site, works: works, cats: cats, catMap: catMap };
  }

  /* ---------- 狀態 ---------- */
  var state = { data: null, filter: "all", opener: null };

  /* ---------- 網站文字 ---------- */
  function renderSite(site) {
    document.querySelectorAll("[data-site]").forEach(function (node) {
      var v = site[node.getAttribute("data-site")];
      if (hasText(v)) node.textContent = v; else node.hidden = true;
    });
    if (hasText(site.brand)) document.title = site.brand;
  }

  /* ---------- 能力方向 ---------- */
  var ICONS = {
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    scale: '<path d="M12 4v16M6 20h12M5 7h14"/><path d="M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
    coins: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
    gantt: '<path d="M3 3v18h18"/><path d="M7 7h7M10 11h8M8 15h6"/>',
    cycle: '<path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9"/><path d="M18.5 3v4.5H14M5.5 21v-4.5H10"/>',
    grid: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 14h18M9 4v10M15 4v10M12 14v6"/>',
    flow: '<rect x="3" y="4" width="6" height="6" rx="1"/><rect x="15" y="14" width="6" height="6" rx="1"/><path d="M9 7h4a2 2 0 0 1 2 2v5"/>',
    pen: '<path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/><path d="M4 20h16"/>',
    spark: '<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>'
  };
  function icon(name) {
    var span = el("span", { class: "skill__icon", "aria-hidden": "true" });
    span.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      (ICONS[name] || ICONS.spark) + "</svg>";
    return span;
  }

  /* 只保留出處作品確實存在的項目 */
  function validEvidence(list, works) {
    var ids = {};
    works.forEach(function (w) { ids[w.id] = w; });
    return (Array.isArray(list) ? list : []).filter(function (e) { return e && ids[e.work]; })
      .map(function (e) { return { work: ids[e.work], note: e.note }; });
  }

  function evidenceButtons(evs) {
    return el("div", { class: "skill__evidence" }, [
      el("span", { class: "skill__evidence-label", text: "出處" })
    ].concat(evs.map(function (e) {
      var b = el("button", { type: "button", class: "evidence", "aria-haspopup": "dialog",
                             "aria-label": "查看出處作品：" + e.work.title + (hasText(e.note) ? "，" + e.note : "") }, [
        el("span", { class: "evidence__note", text: hasText(e.note) ? e.note : e.work.title }),
        el("span", { "aria-hidden": "true", text: "↗" })
      ]);
      b.addEventListener("click", function () { openWork(e.work, b); });
      return b;
    })));
  }

  function renderSkills(works) {
    var listEl = $("#skill-list");
    var methodEl = $("#method");
    listEl.innerHTML = ""; methodEl.innerHTML = "";

    var skills = (Array.isArray(window.PORTFOLIO_CAPABILITIES) ? window.PORTFOLIO_CAPABILITIES : [])
      .map(function (s) { return { s: s, ev: validEvidence(s.evidence, works) }; })
      .filter(function (x) { return x.ev.length && hasText(x.s.title); });

    skills.forEach(function (x, i) {
      var s = x.s;
      var points = (Array.isArray(s.points) ? s.points : []).filter(hasText);
      listEl.appendChild(el("li", { class: "skill" }, [
        el("div", { class: "skill__top" }, [
          el("span", { class: "skill__num", text: pad(i + 1) }),
          icon(s.icon)
        ]),
        el("h3", { class: "skill__title", text: s.title }),
        hasText(s.summary) ? el("p", { class: "skill__summary", text: s.summary }) : null,
        points.length ? el("ul", { class: "skill__points" }, points.map(function (p) { return el("li", { text: p }); })) : null,
        evidenceButtons(x.ev)
      ]));
    });
    listEl.hidden = skills.length === 0;

    var m = window.PORTFOLIO_METHOD;
    var mev = m ? validEvidence(m.evidence, works) : [];
    var steps = m && Array.isArray(m.steps) ? m.steps.filter(function (st) { return st && hasText(st.title); }) : [];
    if (mev.length && steps.length) {
      methodEl.appendChild(el("div", { class: "method__head" }, [
        el("p", { class: "eyebrow", text: "Workflow method" }),
        el("h3", { class: "method__title", text: m.title || "工作流程" })
      ]));
      methodEl.appendChild(el("ol", { class: "method__steps" }, steps.map(function (st, i) {
        return el("li", { class: "method__step" }, [
          el("span", { class: "method__node", "aria-hidden": "true" }),
          el("span", { class: "method__num", text: pad(i + 1) }),
          el("span", { class: "method__step-title", text: st.title }),
          hasText(st.text) ? el("span", { class: "method__text", text: st.text }) : null
        ]);
      })));
      methodEl.appendChild(evidenceButtons(mev));
      methodEl.hidden = false;
    } else {
      methodEl.hidden = true;
    }
    return skills.length;
  }

  function renderCapabilities(cats) {
    var section = $("#capabilities");
    var list = $("#cap-list");
    list.innerHTML = "";
    var show = cats.length > 0;
    section.hidden = !show;
    document.querySelectorAll("[data-requires-works]").forEach(function (n) { n.hidden = !show; });
    $("#works-index").textContent = show ? "02" : "01";

    // 有能力分析資料時顯示能力卡；沒有時退回顯示作品分類卡
    var skillCount = show ? renderSkills(state.data.works) : 0;
    list.hidden = skillCount > 0;
    // 以逗號分段，換行時只會在逗號後斷開，不會把詞拆開
    var desc = $("#cap-desc");
    desc.innerHTML = "";
    (skillCount > 0
      ? ["皆從已完成作品內容整理，", "點選「出處」可查看原作品。"]
      : ["依已完成作品整理，", "點選可直接篩選該類作品。"]
    ).forEach(function (t) { desc.appendChild(el("span", { class: "nobreak", text: t })); });
    if (skillCount > 0) return;

    cats.forEach(function (c, i) {
      var btn = el("button", { type: "button", class: "cap-btn", "data-filter": c.id,
                               "aria-label": c.label + "，" + c.count + " 件作品，點選篩選" }, [
        el("span", { class: "cap-btn__top" }, [
          el("span", { class: "cap-btn__num", text: pad(i + 1) }),
          el("span", { class: "cap-btn__count", text: c.count + " 件" })
        ]),
        el("span", { class: "cap-btn__label", text: c.label }),
        hasText(c.description) ? el("span", { class: "cap-btn__desc", text: c.description }) : null
      ]);
      btn.addEventListener("click", function () {
        setFilter(c.id);
        var works = $("#works");
        works.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        works.focus({ preventScroll: true });
      });
      list.appendChild(el("li", { class: "cap-item" }, [btn]));
    });
  }

  /* ---------- 首頁最新作品（依 completedAt 取最新完成的一件） ---------- */
  var PLAY_SVG = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" focusable="false"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.2-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" fill="currentColor"/></svg>';

  function playIcon(cls, size) {
    var s = el("span", { class: cls, "aria-hidden": "true" });
    s.innerHTML = size ? PLAY_SVG.replace(/width="28" height="28"/, 'width="' + size + '" height="' + size + '"') : PLAY_SVG;
    return s;
  }

  /* 作品的第一個影片預覽（有的話，首頁可直接播放） */
  function firstVideo(w) {
    var items = Array.isArray(w.preview) ? w.preview : (w.preview ? [w.preview] : []);
    for (var i = 0; i < items.length; i++) {
      if (items[i] && items[i].type === "video" && hasText(items[i].src) && isUsableUrl(items[i].src)) return items[i];
    }
    return null;
  }

  function latestWork(works) {
    var withCover = works.filter(function (w) { return hasText(w.coverImage); });
    return withCover.slice().sort(function (a, b) {
      return String(b.completedAt || "").localeCompare(String(a.completedAt || ""));
    })[0] || null;
  }

  function renderFeature(works, catMap) {
    var box = $("#hero-feature");
    if (!box) return;   // 首頁改成自我介紹卡後，沒有「最新作品」區塊
    box.innerHTML = "";
    var w = latestWork(works);
    if (!w) { box.hidden = true; return; }

    var label = el("span", { class: "feature__label", "aria-hidden": "true", text: "最新作品 / LATEST WORK" });
    var img = el("img", { src: w.coverImage, alt: "", decoding: "async" });
    var info = [
      el("span", { class: "feature__cat", text: catMap[w.category].label }),
      el("span", { class: "feature__title", text: w.title }),
      el("span", { class: "feature__more", "aria-hidden": "true", text: "查看詳情 →" })
    ];
    var video = firstVideo(w);
    var card;

    if (video) {
      // 影片作品：封面維持靜態；點播放鍵開啟作品詳情並直接播放
      var dur = hasText(video.duration) ? video.duration.trim() : "";
      var playBtn = el("button", { type: "button", class: "feature__media", "aria-haspopup": "dialog",
                                   "aria-label": "播放影片：" + w.title + (dur ? "，片長 " + dur : "") }, [
        img, playIcon("feature__play"),
        dur ? el("span", { class: "feature__duration", "aria-hidden": "true", text: dur }) : null
      ]);
      var infoBtn = el("button", { type: "button", class: "feature__info", "aria-haspopup": "dialog",
                                   "aria-label": "最新作品：" + w.title + "，查看作品詳情" }, info);
      card = el("div", { class: "feature feature--video" }, [label, playBtn, infoBtn]);
      playBtn.addEventListener("click", function () { openWork(w, playBtn, { autoplay: true }); });
      infoBtn.addEventListener("click", function () { openWork(w, infoBtn); });
    } else {
      card = el("button", { type: "button", class: "feature feature--single", "aria-haspopup": "dialog",
                            "aria-label": "最新作品：" + w.title + "，查看作品詳情" }, [
        label, el("span", { class: "feature__media" }, [img]),
        el("span", { class: "feature__info", "aria-hidden": "true" }, info)
      ]);
      card.addEventListener("click", function () { openWork(w, card); });
    }
    box.appendChild(card);
    box.hidden = false;
  }

  /* ---------- 首頁電流：沿右側格線走一個轉角，抵達最新作品卡片邊緣後淡出（只播一次） ---------- */
  function runCurrent() {
    var svg = $("#hero-current");
    var hero = $(".hero");
    var card = $("#hero-feature .feature");
    if (!svg || !hero || !card || !svg.animate) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var G = 48;
    var h = hero.getBoundingClientRect();
    var c = card.getBoundingClientRect();
    var L = c.left - h.left, T = c.top - h.top, R = c.right - h.left, B = c.bottom - h.top;
    // 卡片右側要有至少一格格線的空間，光線才不會壓到文字或封面；空間不夠（如手機）就不播
    var gx = Math.ceil((R + 14) / G) * G;
    if (gx > h.width - 8) return;
    var gyEnd = Math.round((T + (B - T) * 0.3) / G) * G;
    if (gyEnd < T + 12) gyEnd += G;
    var gyStart = Math.max(G, gyEnd - 3 * G);
    var px = function (v) { return Math.round(v) + 0.5; };
    var d = "M" + px(gx) + " " + px(gyStart) + " V" + px(gyEnd) + " H" + Math.round(R + 2);

    svg.setAttribute("viewBox", "0 0 " + Math.round(h.width) + " " + Math.round(h.height));
    svg.innerHTML = "";
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    svg.appendChild(path);
    var total = path.getTotalLength();
    var seg = Math.min(72, total * 0.45);
    path.style.strokeDasharray = seg + " " + (total + seg);
    path.style.strokeDashoffset = String(seg);

    var anim = path.animate([
      { strokeDashoffset: seg, opacity: 0 },
      { strokeDashoffset: seg * 0.4, opacity: 1, offset: 0.1 },
      { strokeDashoffset: -(total - seg), opacity: 1, offset: 0.78 },
      { strokeDashoffset: -(total - seg * 0.2), opacity: 0 }
    ], { duration: 560, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" });
    anim.onfinish = function () { svg.innerHTML = ""; };
    // 光線抵達時，卡片邊緣亮一下再淡出
    card.animate([
      { borderColor: "rgba(129,216,208,0)" },
      { borderColor: "rgba(129,216,208,.7)", offset: 0.4 },
      { borderColor: "rgba(140,200,225,.24)" }
    ], { duration: 420, delay: 380, easing: "ease-out" });
  }

  /* ---------- 篩選器 ---------- */
  function renderFilters(cats, total) {
    var bar = $("#filters");
    bar.innerHTML = "";
    bar.hidden = total === 0;
    if (total === 0) return;

    var items = [{ id: "all", label: "全部", count: total }].concat(cats);
    items.forEach(function (c) {
      var b = el("button", { type: "button", class: "chip", "data-filter": c.id,
                             "aria-pressed": String(state.filter === c.id) }, [
        c.label, el("span", { class: "chip__count", "aria-hidden": "true", text: String(c.count) })
      ]);
      b.addEventListener("click", function () { setFilter(c.id); });
      bar.appendChild(b);
    });
  }

  function setFilter(id) {
    var valid = id === "all" || state.data.cats.some(function (c) { return c.id === id; });
    state.filter = valid ? id : "all";
    document.querySelectorAll("#filters .chip").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === state.filter));
    });
    renderGrid();
  }

  /* ---------- 作品卡片 ---------- */
  function placeholder(label) {
    return el("span", { class: "card__placeholder", "aria-hidden": "true", text: label || "Preview" });
  }

  function renderGrid() {
    var d = state.data;
    var grid = $("#grid");
    grid.innerHTML = "";
    var list = d.works.filter(function (w) { return state.filter === "all" || w.category === state.filter; });

    $("#empty").hidden = d.works.length > 0;
    grid.hidden = d.works.length === 0;

    var cat = d.catMap[state.filter];
    $("#filter-status").textContent = d.works.length
      ? (state.filter === "all" ? "顯示全部 " : "顯示「" + cat.label + "」") + list.length + " 件作品"
      : "";

    list.forEach(function (w, i) {
      var c = d.catMap[w.category];
      var titleId = "card-title-" + w.id;
      var media = el("span", { class: "card__media" });
      if (hasText(w.coverImage)) {
        var img = el("img", { src: w.coverImage, alt: "", loading: "lazy", decoding: "async" });
        img.addEventListener("error", function () { media.innerHTML = ""; media.appendChild(placeholder(c.label)); });
        media.appendChild(img);
      } else {
        media.appendChild(placeholder(c.label));
      }
      if (firstVideo(w)) media.appendChild(playIcon("card__play", 22));

      var card = el("button", { type: "button", class: "card", "aria-labelledby": titleId,
                                "aria-haspopup": "dialog" }, [
        media,
        el("span", { class: "card__body" }, [
          el("span", { class: "card__meta" }, [
            el("span", { class: "card__num", "aria-hidden": "true", text: pad(i + 1) }),
            hasText(w.completedAt) ? el("span", { class: "card__date", text: w.completedAt }) : null
          ]),
          el("span", { class: "card__cat" }, [
            c.label,
            // 標籤放在類型旁邊，避免蓋住封面上的文字
            hasText(w.badge) ? el("span", { class: "card__badge", text: w.badge }) : null
          ]),
          el("span", { class: "card__title", id: titleId, text: w.title }),
          hasText(w.summary) ? el("span", { class: "card__summary", text: w.summary }) : null,
          el("span", { class: "card__more", "aria-hidden": "true" }, ["查看作品詳情", el("span", { class: "card__arrow", text: "→" })])
        ])
      ]);
      card.addEventListener("click", function () { openWork(w, card); });
      grid.appendChild(el("li", null, [card]));
    });
  }

  /* ---------- 作品詳情 Modal ---------- */
  function previewItems(w) {
    var p = w.preview;
    var items = Array.isArray(p) ? p : (p && typeof p === "object" ? [p] : []);
    items = items.filter(function (it) { return it && hasText(it.src) && isUsableUrl(it.src); });
    if (!items.length && hasText(w.coverImage)) items = [{ type: "image", src: w.coverImage, alt: w.title }];
    return items;
  }

  function renderPreview(items, w) {
    if (!items.length) return null;
    var wrap = el("div", { class: "preview" });
    items.forEach(function (it, i) {
      var type = it.type || "image";
      var cap = hasText(it.caption) ? el("figcaption", { text: it.caption }) : null;
      var label = hasText(it.alt) ? it.alt : w.title + " 預覽 " + (i + 1);
      var node;
      if (type === "image") {
        // 所有圖片放進同尺寸的展示框，直式、橫式、方形都以相同大小呈現；點圖可開啟原尺寸
        node = el("figure", { class: "preview__item preview__item--image", style: "margin:0" }, [
          el("a", { class: "preview__frame-img", href: it.src, target: "_blank", rel: "noopener",
                    "aria-label": label + "（開啟原尺寸圖片，另開新視窗）" }, [
            // 以同一張圖模糊放大當背景，讓每一格都被完整填滿，視覺上尺寸一致
            el("span", { class: "preview__backdrop", "aria-hidden": "true",
                         style: "background-image:url(\"" + encodeURI(it.src).replace(/"/g, "%22") + "\")" }),
            el("img", { src: it.src, alt: label, loading: i === 0 ? "eager" : "lazy" }),
            el("span", { class: "preview__zoom", "aria-hidden": "true", text: "原尺寸 ↗" })
          ]), cap
        ]);
      } else if (type === "video") {
        node = el("figure", { class: "preview__item", style: "margin:0" }, [
          el("div", { class: "preview__frame" }, [
            el("video", { src: it.src, controls: true, preload: "metadata", playsinline: true,
                          poster: hasText(it.poster) ? it.poster : null, "aria-label": label })
          ]), cap
        ]);
      } else if (type === "audio") {
        node = el("figure", { class: "preview__item preview__audio", style: "margin:0" }, [
          el("p", { class: "preview__audio-label", text: hasText(it.alt) ? it.alt : "音訊" }),
          el("audio", { src: it.src, controls: true, preload: "none", "aria-label": label }), cap
        ]);
      } else if (type === "youtube" || type === "embed" || type === "pdf") {
        var src = type === "youtube" ? youtubeEmbed(it.src) : it.src;
        if (!src) return;
        node = el("figure", { class: "preview__item", style: "margin:0" }, [
          el("div", { class: "preview__frame" + (type === "pdf" ? " preview__frame--doc" : "") }, [
            el("iframe", { src: src, title: label, loading: "lazy", allowfullscreen: true,
                           allow: type === "youtube" ? "accelerometer; encrypted-media; picture-in-picture; fullscreen" : null })
          ]), cap
        ]);
      }
      if (node) wrap.appendChild(node);
    });
    return wrap.childNodes.length ? wrap : null;
  }

  function renderLinks(links) {
    var arr = (Array.isArray(links) ? links : []).filter(function (l) { return l && isUsableUrl(l.url); });
    if (!arr.length) return null;
    return el("div", null, [
      el("p", { class: "detail__label", text: "成果連結" }),
      el("div", { class: "links" }, arr.map(function (l, i) {
        var ext = true; // 成果連結（外部網址或 PDF 等檔案）一律另開新分頁，避免訪客離開作品集
        return el("a", { class: "btn btn--block " + (i > 0 ? "btn--ghost" : "btn--primary"), href: l.url.trim(),
                         target: ext ? "_blank" : null, rel: ext ? "noopener noreferrer" : null }, [
          hasText(l.label) ? l.label : "查看成果",
          el("span", { "aria-hidden": "true", text: ext ? "↗" : "→" }),
          ext ? el("span", { class: "sr-only", text: "（另開新視窗）" }) : null
        ]);
      }))
    ]);
  }

  function openWork(w, opener, opts) {
    var d = state.data;
    var c = d.catMap[w.category];
    var body = $("#modal-body");
    body.innerHTML = "";

    var tools = (Array.isArray(w.tools) ? w.tools : []).filter(hasText);
    var paras = hasText(w.description)
      ? w.description.split(/\n\s*\n/).map(function (t) { return el("p", { text: t.trim() }); })
      : [];

    var aside = [
      tools.length ? el("div", null, [
        el("p", { class: "detail__label", text: "使用工具" }),
        el("ul", { class: "tags" }, tools.map(function (t) { return el("li", { class: "tag", text: t }); }))
      ]) : null,
      hasText(w.completedAt) ? el("div", null, [
        el("p", { class: "detail__label", text: "完成時間" }),
        el("p", { class: "detail__date", text: w.completedAt })
      ]) : null,
      renderLinks(w.links)
    ].filter(Boolean);

    var preview = renderPreview(previewItems(w), w);
    if (preview) body.appendChild(preview);
    body.appendChild(el("article", { class: "detail" }, [
      el("header", null, [
        el("p", { class: "detail__cat", text: c.label }),
        el("h2", { class: "detail__title", id: "modal-title", text: w.title }),
        hasText(w.summary) ? el("p", { class: "detail__summary", text: w.summary }) : null
      ]),
      hasText(w.notice) ? el("p", { class: "notice", role: "note" }, [
        el("span", { class: "notice__label", text: hasText(w.badge) ? w.badge : "說明" }),
        el("span", { text: w.notice })
      ]) : null,
      (paras.length || aside.length) ? el("div", { class: "detail__cols" }, [
        el("div", { class: "detail__desc" }, paras),
        aside.length ? el("aside", { class: "detail__aside", "aria-label": "作品資訊" }, aside) : null
      ]) : null
    ]));

    state.opener = opener || null;
    var modal = $("#modal");
    modal.showModal();
    $(".modal__panel", modal).scrollTop = 0;
    document.body.style.overflow = "hidden";

    // 從首頁播放鍵開啟：直接播放（在點擊事件中呼叫，手機也允許有聲播放）
    var v = opts && opts.autoplay ? $("video", body) : null;
    if (v) {
      v.focus();
      var p = v.play();
      if (p && p.catch) p.catch(function () { /* 瀏覽器不允許自動播放時，保留播放控制讓使用者按播放 */ });
    } else {
      $("#modal-close").focus();
    }
  }

  function setupModal() {
    var modal = $("#modal");
    $("#modal-close").addEventListener("click", function () { modal.close(); });
    // 點擊背景關閉
    modal.addEventListener("click", function (e) { if (e.target === modal) modal.close(); });
    modal.addEventListener("close", function () {
      document.body.style.overflow = "";
      $("#modal-body").querySelectorAll("video, audio").forEach(function (v) { v.pause(); });
      $("#modal-body").innerHTML = ""; // 停止 iframe 播放
      if (state.opener && document.contains(state.opener)) state.opener.focus();
      state.opener = null;
    });
  }

  /* ---------- 初始化 ---------- */
  function render() {
    state.data = loadData();
    if (state.filter !== "all" && !state.data.cats.some(function (c) { return c.id === state.filter; })) state.filter = "all";
    renderSite(state.data.site);
    // 作品數（自我介紹卡上的「AI 實戰作品 N 件」）會依作品資料自動更新
    var statWorks = $("#stat-works"), statCats = $("#stat-cats"), heroStats = $(".hero__stats");
    if (statWorks) statWorks.textContent = pad(state.data.works.length);
    if (statCats) statCats.textContent = pad(state.data.cats.length);
    if (heroStats) heroStats.hidden = state.data.works.length === 0;
    renderFeature(state.data.works, state.data.catMap);
    renderCapabilities(state.data.cats);
    renderFilters(state.data.cats, state.data.works.length);
    renderGrid();
  }

  setupModal();
  render();

  // 首頁載入後播放一次電流（等字型與版面穩定）
  (function () {
    var started = false;
    function go() {
      if (started) return;
      started = true;
      requestAnimationFrame(function () { requestAnimationFrame(runCurrent); });
    }
    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(function () { setTimeout(go, 250); });
    setTimeout(go, 1500);
  })();
  window.Portfolio = { render: render, replayCurrent: runCurrent };
})();
