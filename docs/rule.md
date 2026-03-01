# 肝炎個管追蹤 - 專案開發規則

## 前端技術規範

### 框架與風格

- **模擬框架**：採用模擬 React 框架的開發模式
- **UI 風格**：Modern Dashboard 風格
- **實作技術**：以 **HTML、CSS、JavaScript** 建立模擬文件（mock）

### 模擬文件原則

1. **結構**：使用語意化 HTML5 標籤，模擬 React 元件結構
2. **樣式**：CSS 採用 Modern Dashboard 設計（側邊欄、卡片式區塊、表格、響應式）
3. **互動**：以原生 JavaScript 實作事件處理，模擬 React 狀態與互動行為

### Modern Dashboard 風格要點

- 簡潔的導航與側邊欄
- 卡片式內容區塊（card layout）
- 清晰的表格呈現
- 適當留白與層次感
- 一致的色彩與字體系統

### 檔案組織建議

```
docs/
  rule.md                    # 本規則文件
  肝炎個案追蹤-BDD規格.md     # BDD 規格
mock/                        # 模擬文件目錄（可選）
  index.html                 # 主頁面
  styles/
    dashboard.css            # Dashboard 樣式
  scripts/
    app.js                   # 主邏輯
```

---

## 開發時注意事項

- 模擬文件應對應 `docs/肝炎個案追蹤-BDD規格.md` 中的功能規格
- 無需引入 React 或任何框架套件，以純 HTML/CSS/JS 完成模擬
- 資料可先以靜態 JSON 或內嵌物件模擬，便於後續串接 API
