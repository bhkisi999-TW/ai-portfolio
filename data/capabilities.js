/*
 * 能力方向（依已完成作品內容整理）
 * ------------------------------------------------------------
 * 每一項能力都必須有 evidence（出處），指向 data/works.js 裡實際存在的作品 id。
 * 出處作品不存在時，該能力會自動隱藏，避免出現沒有作品佐證的能力。
 *
 * 欄位：
 *   id        英數 id
 *   icon      圖示：grid / search / scale / coins / gantt / cycle / pen / spark
 *   title     能力名稱
 *   summary   一句話說明
 *   points    具體展現（2–3 點，只寫作品中確實有的內容）
 *   evidence  出處：[{ "work": "作品 id", "note": "對應章節或檔案" }]
 *
 * method：從作品整理出的工作流程（同樣需要 evidence）
 */
window.PORTFOLIO_CAPABILITIES = [
  {
    "id": "business-model",
    "icon": "grid",
    "title": "商業模式分析",
    "summary": "用商業模式九宮格拆解餐飲品牌，看清客群、價值與獲利結構。",
    "points": [
      "以九宮格分析連鎖加盟門市的九個構面",
      "以 BMC 為核心建構自有鍋貼店的商業模式",
      "依時間與價格敏感度描繪客群輪廓"
    ],
    "evidence": [
      { "work": "hedeng-bmc-taipei", "note": "禾燈鍋貼九宮格" },
      { "work": "dumpling-shop-startup-pitch", "note": "募資提案簡報" }
    ]
  },
  {
    "id": "needs-analysis",
    "icon": "search",
    "title": "需求分析與目標設定",
    "summary": "從顧客痛點與營運挑戰出發，界定要解決的問題與可衡量的目標。",
    "points": [
      "SWOT 分析，並說明分析結果如何影響決策",
      "以 SMART 原則設定活動目標",
      "從「外送悶軟」與「尖峰久候」痛點推導價值主張"
    ],
    "evidence": [
      { "work": "jinyuanbao-year-end-party-2026", "note": "尾牙企畫書第 1、3、4 章" },
      { "work": "dumpling-shop-startup-pitch", "note": "募資提案簡報" }
    ]
  },
  {
    "id": "decision-making",
    "icon": "scale",
    "title": "方案評估與決策",
    "summary": "以加權評分、比較表與取捨分析，把選擇變成可說明的判斷。",
    "points": [
      "三種創意主題以五個構面加權評分後選定",
      "比較兩處候選場址的租金、人流與法規條件",
      "分析透氣紙盒與一般 PP 盒的成本與品質取捨"
    ],
    "evidence": [
      { "work": "jinyuanbao-year-end-party-2026", "note": "尾牙企畫書第 5、7、12 章" },
      { "work": "dumpling-shop-startup-pitch", "note": "募資提案簡報" }
    ]
  },
  {
    "id": "budgeting",
    "icon": "coins",
    "title": "財務規劃與成本分析",
    "summary": "從單份成本、損平點到募資需求，評估投入是否合理。",
    "points": [
      "編列三種預算方案並試算營業機會成本",
      "拆解平價版與品質版的單份直接成本，試算損平點",
      "整理募資需求與資金用途清單"
    ],
    "evidence": [
      { "work": "jinyuanbao-year-end-party-2026", "note": "尾牙企畫書第 6、12 章" },
      { "work": "dumpling-shop-startup-pitch", "note": "募資提案簡報" }
    ]
  },
  {
    "id": "project-risk",
    "icon": "gantt",
    "title": "專案管理與風險控管",
    "summary": "把計畫拆解為可追蹤的工作，並事先規劃風險與應變。",
    "points": [
      "WBS、八週甘特圖、RACI 責任矩陣與 30 天關鍵路徑",
      "5×5 風險矩陣，登錄 8 項風險並規劃預防與應變",
      "以食材價格與外送抽成做財務敏感度壓力測試"
    ],
    "evidence": [
      { "work": "jinyuanbao-year-end-party-2026", "note": "尾牙企畫書第 13、14 章" },
      { "work": "dumpling-shop-startup-pitch", "note": "募資提案簡報" }
    ]
  },
  {
    "id": "kpi-pdca",
    "icon": "cycle",
    "title": "成效評估與持續改善",
    "summary": "事先定義成功標準，讓結果能被檢核、回饋到下一次。",
    "points": [
      "從參與、體驗、認知、財務、後續管理五個構面設定 KPI",
      "設計活動後問卷",
      "以 PDCA 規劃後續改善與 2027 年管理展望"
    ],
    "evidence": [{ "work": "jinyuanbao-year-end-party-2026", "note": "尾牙企畫書第 15 章、簡報" }]
  },
  {
    "id": "brand-identity",
    "icon": "pen",
    "title": "品牌識別與視覺延伸",
    "summary": "從 Logo 出發，把品牌形象延伸到宣傳圖與實際應用場景。",
    "points": [
      "設計居酒屋品牌 Logo（扇形外框結合鍋貼褶紋）",
      "製作招牌、啤酒杯、服裝三款動態品牌樣張",
      "製作開幕行銷海報、餐點宣傳圖與兩款尾牙活動主視覺"
    ],
    "evidence": [
      { "work": "wasen-izakaya-brand", "note": "和煎品牌視覺" },
      { "work": "jinyuanbao-year-end-party-2026", "note": "尾牙主視覺" }
    ]
  },
  {
    "id": "ai-multiformat",
    "icon": "spark",
    "title": "AI 協作與多格式產出",
    "summary": "運用 AI 工具，把想法延伸成文件、圖像、簡報、音訊與影片。",
    "points": [
      "ChatGPT：企畫書、商業模式九宮格、Logo 與品牌樣張",
      "Gemini Notebook：尾牙簡報、16 頁募資簡報與約 17 分鐘 Podcast",
      "ChatGPT、Claude、Google Flow、Google Vids：從腳本、分鏡到成片的品牌短影音"
    ],
    "evidence": [
      { "work": "jinyuanbao-year-end-party-2026", "note": "尾牙企畫" },
      { "work": "dumpling-shop-startup-pitch", "note": "募資提案" },
      { "work": "wasen-izakaya-brand", "note": "和煎品牌" },
      { "work": "lixianchong-product-ad", "note": "理線充短影音" }
    ]
  }
];

/*
 * 「從需求到檢核的規劃流程」區塊已於 2026-11-08 移除（內容與上方能力卡重複）。
 * 原始資料備份在 _舊版備份/method-20261108/capabilities.js，
 * 要加回來時，把那段 window.PORTFOLIO_METHOD = {...} 貼回這裡即可。
 */
window.PORTFOLIO_METHOD = null;
