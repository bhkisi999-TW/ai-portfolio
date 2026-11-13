/*
 * 作品資料 —— 新增作品只需要修改這個檔案（說明見 README.md）
 * ------------------------------------------------------------
 * 請維持 JSON 格式：鍵與字串都用雙引號、最後一筆後面不要加逗號。
 * 沒有資料的欄位直接省略，不要填假資料。
 *
 * 範例（僅供格式參考，請勿取消註解成為真實資料）：
 * {
 *   "id": "brand-dm-01",
 *   "title": "作品名稱",
 *   "category": "brand-visual",
 *   "summary": "一句話簡介（卡片上顯示）",
 *   "description": "詳細說明，可用空行分段。",
 *   "tools": ["Canva", "ChatGPT"],
 *   "coverImage": "works/brand-dm-01/cover.jpg",
 *   "preview": [
 *     { "type": "image", "src": "works/brand-dm-01/page-1.jpg", "alt": "DM 正面" },
 *     { "type": "pdf",   "src": "works/brand-dm-01/dm.pdf" }
 *   ],
 *   "links": [
 *     { "label": "查看簡報", "url": "https://..." }
 *   ],
 *   "completedAt": "2026-10"
 * }
 */
window.PORTFOLIO_WORKS = [
  {
    "id": "jinyuanbao-year-end-party-2026",
    "title": "金元寶鍋貼｜2026 年度感恩尾牙暨 2027 年團隊展望企畫",
    "category": "pitch-deck",
    "summary": "為模擬餐飲品牌規劃的 20 人年度尾牙企畫，包含企畫書、簡報、主視覺與 Podcast。",
    "description": "以模擬企業「金元寶鍋貼」為對象，將年度尾牙定位為結合員工犒賞、組織認同、跨職能交流、年度成果回顧與未來展望的內部管理活動。\n\n企畫書共 26 頁、17 章，涵蓋企業背景、需求分析、SMART 目標、創意主題、場地可行性、活動流程、餐飲外燴與食品安全、團隊遊戲、員工表揚與抽獎、財務預算與成本效益、專案管理、風險管理、成效評估與 PDCA 改善；並比較經濟型、標準型、豪華型三種預算方案。\n\n簡報共 15 頁，整理企畫重點與 2027 年 PDCA 管理展望；另製作兩款活動主視覺與 Podcast 音訊版本。\n\n本作品為課程作業，企業營運數據、預算與績效目標均為模擬假設，不代表實際舉辦活動或取得廠商報價。",
    "tools": ["ChatGPT", "Gemini Notebook"],
    "coverImage": "works/jinyuanbao-year-end-party-2026/key-visual-outdoor.jpg",
    "preview": [
      { "type": "image", "src": "works/jinyuanbao-year-end-party-2026/key-visual-outdoor.jpg", "alt": "2026 年度尾牙盛宴主視覺：戶外庭園宴會版" },
      { "type": "image", "src": "works/jinyuanbao-year-end-party-2026/key-visual-indoor.jpg", "alt": "2026 年度尾牙盛宴主視覺：室內宴會廳版" },
      { "type": "pdf", "src": "works/jinyuanbao-year-end-party-2026/slides.pdf", "caption": "企畫簡報（15 頁）" },
      { "type": "pdf", "src": "works/jinyuanbao-year-end-party-2026/proposal.pdf", "caption": "企畫書（26 頁）" },
      { "type": "audio", "src": "works/jinyuanbao-year-end-party-2026/podcast.m4a", "alt": "Podcast：鍋貼店尾牙企劃（約 17 分鐘）" }
    ],
    "links": [
      { "label": "開啟企畫簡報 PDF", "url": "works/jinyuanbao-year-end-party-2026/slides.pdf" },
      { "label": "開啟企畫書 PDF", "url": "works/jinyuanbao-year-end-party-2026/proposal.pdf" }
    ],
    "completedAt": "2026-11-03"
  },
  {
    "id": "dumpling-shop-startup-pitch",
    "title": "現代快餐飲品牌：創業募資與營運計畫書",
    "category": "pitch-deck",
    "summary": "以商業模式九宮格（BMC）為核心，為小型鍋貼店規劃的 16 頁創業募資提案簡報。",
    "description": "從外帶與外送市場切入，鎖定「外送悶軟」與「尖峰久候」兩個痛點，提出「8 分鐘極速出餐＆完美酥脆交付」的價值主張，並以商業模式九宮格整理整體營運架構。\n\n簡報內容包含：依時間與價格敏感度描繪客群輪廓、站前街角店與住宅側街店兩處場址比較、平價版與品質版的單份直接成本解析、透氣紙盒與一般 PP 盒的包材取捨、收貨到外送的食安管制重點、高麗菜價格與外送抽成的財務敏感度分析、損平點試算，以及募資需求、資金用途與 30 天關鍵路徑。\n\n簡報中的租金、成本、損平點與募資金額均標示為教材或情境假設，尚待驗證，不代表實際開店數據。",
    "tools": ["Gemini Notebook"],
    "coverImage": "works/dumpling-shop-startup-pitch/cover.jpg",
    "preview": [
      { "type": "pdf", "src": "works/dumpling-shop-startup-pitch/pitch.pdf", "caption": "創業募資提案簡報（16 頁）" }
    ],
    "links": [
      { "label": "開啟募資提案 PDF", "url": "works/dumpling-shop-startup-pitch/pitch.pdf" }
    ],
    "completedAt": "2026-11-04"
  },
  {
    "id": "hedeng-bmc-taipei",
    "title": "禾燈鍋貼臺北市加盟門市｜商業模式九宮格",
    "category": "product-planning",
    "summary": "以商業模式九宮格拆解連鎖餐飲加盟門市的客群、價值主張、通路與成本收益結構。",
    "description": "以虛構品牌「禾燈鍋貼」的臺北市加盟門市為分析對象，依商業模式九宮格的九個構面整理：目標客層（上班族、學生族群、家庭客群、附近居民、外帶外送消費者，並區分主要、次要與潛在成長客群及用餐時段）、價值主張、通路、顧客關係、收益來源、關鍵資源、關鍵活動、關鍵合作夥伴，以及固定與變動成本結構。\n\n以圖像化版面呈現整份分析，讓九個構面能在一張圖中對照閱讀。",
    "badge": "課堂練習・虛構品牌",
    "notice": "「禾燈鍋貼」為課堂練習使用的虛構品牌，圖中內容為模擬分析，不代表任何實際企業的營運資料。",
    "tools": ["ChatGPT"],
    "coverImage": "works/hedeng-bmc-taipei/bmc.jpg",
    "preview": [
      { "type": "image", "src": "works/hedeng-bmc-taipei/bmc.jpg", "alt": "禾燈鍋貼臺北市加盟門市商業模式九宮格" }
    ],
    "completedAt": "2026-11-04"
  },
  {
    "id": "wasen-izakaya-brand",
    "title": "和煎 わせん｜居酒屋品牌視覺",
    "category": "brand-visual",
    "summary": "為居酒屋品牌「和煎 わせん」設計 Logo，並延伸至開幕海報、餐點宣傳圖與招牌、啤酒杯、服裝樣張。",
    "description": "Logo 以扇形外框結合鍋貼褶紋線條，搭配金色書法字「和煎」與日文「わせん」。\n\n品牌延伸包含「和煎之宴・盛大開幕」行銷海報、一張餐點宣傳圖，以及招牌、啤酒杯、服裝三款動態品牌樣張，呈現 Logo 在實際場景中的應用效果。",
    "tools": ["ChatGPT"],
    "coverImage": "works/wasen-izakaya-brand/logo.jpg",
    "preview": [
      { "type": "image", "src": "works/wasen-izakaya-brand/logo.jpg", "alt": "和煎 わせん 品牌 Logo" },
      { "type": "image", "src": "works/wasen-izakaya-brand/poster.jpg", "alt": "行銷海報：和煎之宴・盛大開幕", "caption": "行銷海報：和煎之宴・盛大開幕" },
      { "type": "image", "src": "works/wasen-izakaya-brand/dish.jpg", "alt": "餐點宣傳圖" },
      { "type": "image", "src": "works/wasen-izakaya-brand/mockup-sign.gif", "alt": "品牌樣張：招牌", "caption": "品牌樣張：招牌" },
      { "type": "image", "src": "works/wasen-izakaya-brand/mockup-beer-glass.gif", "alt": "品牌樣張：啤酒杯", "caption": "品牌樣張：啤酒杯" },
      { "type": "image", "src": "works/wasen-izakaya-brand/mockup-tshirt.gif", "alt": "品牌樣張：衣服", "caption": "品牌樣張：衣服" }
    ],
    "completedAt": "2026-11-05"
  },
  {
    "id": "lixianchong-product-ad",
    "title": "理線充｜虛構商品品牌短影音",
    "category": "short-video",
    "summary": "小組分工完成的約 34 秒產品廣告短片，從腳本、角色設定、分鏡圖到圖轉影片與剪輯。",
    "description": "為虛構商品「理線充」製作的品牌短影音，片長約 34 秒（1920×1080）。故事從咖啡廳裡纏成一團的充電線開始，帶出可收納充電線的充電器使用情境，並以「充了一小時，握著不燙手」「MIT 台灣製造」等畫面呈現賣點，最後以「理線充 現在入手！」收尾。\n\n製作流程：先用 ChatGPT 討論腳本與風格，再交給 Claude 產出包含角色、畫面、旁白與運鏡的分鏡腳本；固定角色與商品外觀後逐幕生成分鏡圖，用 Google Flow 將分鏡圖轉為影片片段，最後以 Google Vids 依腳本順序串接，背景音樂使用 Gemini 製作。\n\n因 Google Flow 有點數限制，由組員分工生成各幕片段，再合併成片。",
    "badge": "小組作品・虛構品牌",
    "notice": "本作品為課堂小組作品（組別六），由組員分工完成。「理線充」為虛構商品，影片中的人物與畫面皆為 AI 生成，產品功能與「台灣製造」等內容僅為廣告情境設定。",
    "tools": ["ChatGPT", "Claude", "Google Flow", "Google Vids", "Gemini"],
    "coverImage": "works/lixianchong-product-ad/cover.jpg",
    "preview": [
      { "type": "video", "src": "works/lixianchong-product-ad/promo-film.mp4", "duration": "0:34", "caption": "理線充品牌短影音（約 34 秒）" }
    ],
    "completedAt": "2026-11-06"
  },
  {
    "id": "ai-social-auto-post",
    "title": "AI 社群貼文自動生成與發布流程",
    "category": "social-content",
    "summary": "用 Google Opal 生成 IG 貼文的文案與圖片，再以 Make 串接試算表、Facebook 粉專與 Gmail，完成自動發文。",
    "description": "第一段：用 Google Opal 串成多步驟生成工作流。輸入 AI 相關主題後，依序生成 IG 貼文文案、把文案轉成圖片生成指令、產出 1:1 圖片，最後把文案與圖片排成 IG 版面輸出，並附上下載連結方便轉貼。\n\n第二段：用 Make 建立自動發文流程。Google 試算表新增一列貼文資料後，自動發布含圖片的 Facebook 粉專貼文，接著回寫試算表狀態，並寄送 Gmail 通知。設定過程搭配 Claude 協助，例如調整 Google 雲端硬碟圖片的共用權限，讓 Make 能讀取圖片。\n\n最後一張截圖是由 Make 自動發布到 Facebook 粉專的實際貼文。",
    "tools": ["Google Opal", "Make", "Google 試算表", "Facebook 粉專", "Gmail", "Claude"],
    "coverImage": "works/ai-social-auto-post/post-1.jpg",
    "preview": [
      { "type": "image", "src": "works/ai-social-auto-post/opal-workflow-public.jpg", "alt": "AI 社群內容生成工作流示意圖：主題輸入、AI 內容生成、圖像生成、內容整合、成果輸出", "caption": "AI 社群內容生成工作流（公開示意版）" },
      { "type": "image", "src": "works/ai-social-auto-post/post-1.jpg", "alt": "工作流產出的 IG 貼文：藍色機甲戰士", "caption": "產出的 IG 貼文 1" },
      { "type": "image", "src": "works/ai-social-auto-post/post-2.jpg", "alt": "工作流產出的 IG 貼文：賽博戰甲", "caption": "產出的 IG 貼文 2" },
      { "type": "image", "src": "works/ai-social-auto-post/make-scenario.jpg", "alt": "Make 自動發文流程：Google 試算表、Facebook 粉專、Google 試算表、Gmail 四個模組，右側為 Claude 協助設定的對話", "caption": "Make 自動化流程與 Claude 協助設定" },
      { "type": "image", "src": "works/ai-social-auto-post/facebook-post.jpg", "alt": "由 Make 自動發布到 Facebook 粉專的貼文截圖", "caption": "實際發布結果：由 Make 自動發布的 Facebook 粉專貼文" }
    ],
    "completedAt": "2026-11-09"
  },
  {
    "id": "goutie-excel-data-system",
    "title": "鍋貼店營運資料架構與 Excel 營運儀表板",
    "category": "smart-sheet",
    "summary": "從設定選單、四大主檔到交易與計算表，在 Excel 建立一套能自動算出成本、庫存與毛利的鍋貼店營運系統。",
    "description": "以鍋貼店為情境，設計一套「能被自動化使用」的資料表：用「設定選單」集中管理所有下拉選項；商品、供應商、原物料主檔與商品配方 BOM 都轉成 Excel 表格，新增資料時格式、下拉與公式會自動延伸；原物料的主要供應商只能選擇啟用中的供應商，並自動帶出名稱。\n\n交易端建立銷售紀錄與進貨紀錄；計算端依 BOM 用量與最近進貨單價算出商品成本（內用與外帶分開計算），再推算各物料的銷售消耗、目前庫存與庫存狀態（正常／低於安全庫存／缺料），並逐筆計算營收、毛利與毛利率。\n\n最後整合成營運儀表板：年、月、日三層下拉會互相連動，KPI、商品銷售排行、通路分析與庫存異常清單都會依篩選即時更新，全部以公式與動態陣列產生。",
    "badge": "課堂練習・模擬資料",
    "notice": "本作品為課堂練習，店名、商品、供應商（含聯絡人與電話）與交易資料皆為模擬資料。",
    "tools": ["Excel", "Claude for Excel", "ChatGPT"],
    "coverImage": "works/goutie-excel-data-system/dashboard.jpg",
    "preview": [
      { "type": "image", "src": "works/goutie-excel-data-system/dashboard.jpg", "alt": "Excel 鍋貼店營運儀表板：年月日篩選、核心指標、商品銷售排行、通路別分析與庫存異常清單", "caption": "營運儀表板：篩選年份後，所有指標即時更新" },
      { "type": "image", "src": "works/goutie-excel-data-system/architecture.svg", "alt": "鍋貼店營運系統架構圖：設定選單、四大主檔、交易紀錄、計算表到營運儀表板，以及後續的 VBA 與雲端延伸", "caption": "系統架構：資料從主檔、交易一路流向計算表與儀表板" },
      { "type": "image", "src": "works/goutie-excel-data-system/bom.jpg", "alt": "商品配方 BOM 表：每個商品使用的原物料、每份用量、單位與適用通路", "caption": "商品配方 BOM：成本與庫存消耗都從這裡換算" },
      { "type": "image", "src": "works/goutie-excel-data-system/inventory.jpg", "alt": "庫存管理表：期初庫存、累計進貨、銷售消耗、目前庫存與庫存狀態", "caption": "庫存管理：自動標示缺料與低於安全庫存的品項" },
      { "type": "image", "src": "works/goutie-excel-data-system/sales-records.jpg", "alt": "銷售紀錄表：銷售日期、訂單編號、商品、數量、金額、成本與銷售通路", "caption": "銷售紀錄：交易資料以表格登錄" }
    ],
    "completedAt": "2026-11-10"
  },
  {
    "id": "goutie-cloud-automation",
    "title": "鍋貼店營運自動化：VBA 一鍵報表與雲端儀表板",
    "category": "product-demo",
    "summary": "延伸 Excel 營運系統：用 VBA 一鍵產出日報、叫貨單與月報，再把資料搬上 Google 試算表，用 Apps Script 做成可新增銷售的網頁儀表板與每晚缺料通知。",
    "description": "本機自動化：在 Excel 建立「巨集按鈕」清單與自訂功能區，三個按鈕分別一鍵產生指定日期的營業日報（營收、毛利、通路小計、熱銷排行與明細）、依供應商分組產出可直接傳送的叫貨訊息（可調整數量並詢問送貨日），以及月底跨檔彙總每日日報產出營業月報，結果都另存成新檔。\n\n雲端儀表板：把 Excel 轉成 Google 試算表當作資料庫，用 Google Apps Script 撰寫後端讀取資料，前端網頁呈現營運關鍵指標、商品毛利率與銷售排行、通路營收占比與庫存健康度，年月日篩選會即時連動；並加上「新增銷售」表單，送出後直接寫回試算表。網頁採 RWD 響應式設計，電腦、平板與手機都能正常瀏覽與操作。程式碼由 Claude 與 ChatGPT 協助產生、修改與除錯。\n\n主動通知：設定每天晚上 9 點的觸發器，自動把缺料與低於安全庫存的品項整理成 Email 寄給自己。",
    "badge": "課堂練習・模擬資料",
    "notice": "本作品為課堂練習，店名、商品、供應商（含聯絡人與電話）與交易資料皆為模擬資料。線上儀表板可實際操作，按「新增銷售」送出的資料會直接寫入試算表。",
    "tools": ["Excel VBA", "Google 試算表", "Google Apps Script", "Gmail", "Claude", "ChatGPT"],
    "coverImage": "works/goutie-cloud-automation/web-kpi.jpg",
    "preview": [
      { "type": "image", "src": "works/goutie-cloud-automation/web-kpi.jpg", "alt": "網頁儀表板：年月日篩選與營運關鍵指標", "caption": "網頁儀表板：年／月／日篩選與營運關鍵指標" },
      { "type": "image", "src": "works/goutie-cloud-automation/web-products.jpg", "alt": "網頁儀表板：商品毛利率比較與商品銷售排行", "caption": "商品銷售分析：毛利率比較與銷售排行" },
      { "type": "image", "src": "works/goutie-cloud-automation/web-channels.jpg", "alt": "網頁儀表板：各通路營收占比甜甜圈圖與通路營運分析", "caption": "銷售通路分析：營收占比與通路排行" },
      { "type": "image", "src": "works/goutie-cloud-automation/web-inventory.jpg", "alt": "網頁儀表板：庫存健康度監控與庫存異常品項", "caption": "庫存健康度監控：缺料優先排在最前面" },
      { "type": "image", "src": "works/goutie-cloud-automation/web-add-sale.jpg", "alt": "網頁儀表板的新增銷售表單：日期、商品、數量、折扣、通路與備註", "caption": "新增銷售：在網頁填表，直接寫回 Google 試算表" },
      { "type": "image", "src": "works/goutie-excel-data-system/architecture.svg", "alt": "鍋貼店營運系統架構圖：Excel 資料架構、VBA 巨集、Google 試算表、Apps Script 後端與網頁儀表板", "caption": "系統架構：Excel 本機自動化與雲端儀表板" },
      { "type": "image", "src": "works/goutie-cloud-automation/macro-buttons.jpg", "alt": "Excel 巨集按鈕清單：產生銷售日報、產出叫貨單、產出營業月報", "caption": "VBA 巨集按鈕清單" },
      { "type": "image", "src": "works/goutie-cloud-automation/macro-daily-report.jpg", "alt": "巨集產出的鍋貼店營業日報：當日 KPI、各通路小計、熱銷商品排行與銷售明細", "caption": "一鍵產出：營業日報（另存新檔）" },
      { "type": "image", "src": "works/goutie-cloud-automation/macro-purchase-order.jpg", "alt": "巨集產出的鍋貼店叫貨單：依供應商分組的叫貨訊息、聯絡人與電話", "caption": "一鍵產出：叫貨單，依供應商分組、可直接複製傳送" },
      { "type": "image", "src": "works/goutie-cloud-automation/low-stock-email.jpg", "alt": "每晚自動寄出的缺料通知 Email：列出缺料與低於安全庫存的品項", "caption": "缺料自動 Email 通知" },
      { "type": "image", "src": "works/goutie-cloud-automation/low-stock-trigger.jpg", "alt": "Apps Script 執行記錄：已建立每天晚上 9 點執行缺料通知的觸發器", "caption": "Apps Script 觸發器：每天晚上 9 點自動執行" }
    ],
    "links": [
      { "label": "開啟線上儀表板", "url": "https://script.google.com/macros/s/AKfycbxGdaLpxrFnsJVx-AeuZD-wm_eUSsAx6GSIpQQT7tg62XFbKymWLrruz9OSCDrwAKY7mw/exec" }
    ],
    "completedAt": "2026-11-11"
  }
];
