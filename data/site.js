/*
 * 網站設定與作品分類定義
 * ------------------------------------------------------------
 * - site：網站標題與簡介文字。
 * - categories：所有「可能用到」的分類。網站只會顯示「至少有一件作品」的分類，
 *   沒有作品的分類會自動隱藏，不會出現在畫面上。
 * - 分類順序 = 網站上顯示的順序。可自由修改 label / description。
 * - 作品的 category 欄位必須填這裡的 id。
 */
window.PORTFOLIO_SITE = {
  brand: "AI 實戰作品集",
  brandEn: "AI Practice Portfolio",
  tagline: "把商業想法做成看得見的提案，從企畫、品牌視覺到短影音。",
  footerNote: "作品持續更新中"
};

window.PORTFOLIO_CATEGORIES = [
  { id: "ai-workflow",      label: "AI 工作流與任務委派", description: "Prompt、GPTs / Gems、任務地圖" },
  { id: "pitch-deck",       label: "商業提案與簡報",     description: "募資簡報、活動簡報、提案稿" },
  { id: "brand-visual",     label: "品牌視覺",           description: "Logo、產品 DM、名片" },
  { id: "short-video",      label: "短影音與剪輯",       description: "品牌短影音、精華影片" },
  { id: "social-content",   label: "AI 社群內容",        description: "社群貼文、排程發布流程" },
  { id: "data-schema",      label: "營運資料架構",       description: "可自動化資料表、欄位規範" },
  { id: "smart-sheet",      label: "智慧營運試算表",     description: "排班、薪資、成本、庫存、儀表板" },
  { id: "prototype-uiux",   label: "產品原型與 UI/UX",   description: "草圖、前端原型、Style Guide" },
  { id: "product-planning", label: "需求分析與產品規劃", description: "商業模式分析、需求文件、PRD" },
  { id: "ops-automation",   label: "營運自動化流程",     description: "LINE OA 通知、資料同步、缺料通知" },
  { id: "automation-engine",label: "Automation Engine",  description: "通知、庫存管理 Workflow、營運機器人" },
  { id: "product-demo",     label: "產品發布與 Demo",    description: "網站、回饋表單、Demo" },
  { id: "brand-ops",        label: "AI 品牌營運整合",    description: "端到端流程、異常處理、成果交接" },
  { id: "blog",             label: "知識發布與 Blog",    description: "個人 Blog、About 頁、文章" },
  { id: "ai-agent",         label: "AI Agent 與決策輔助", description: "Agent、決策摘要、操作入口" },
  { id: "showcase",         label: "成果發表",           description: "成果簡報與 Demo" }
];
