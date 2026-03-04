/**
 * 肝炎個案追蹤 - 模擬應用邏輯
 * 依 docs/肝炎個案追蹤-BDD規格.md 實作
 */

(function () {
  'use strict';

  // ========== 模擬資料 ==========

  // 項目分類
  const ITEM_GROUPS = {
    hbv: ['HBsAg', 'HBeAg', 'HBV DNA', 'Anti-HBc', 'Anti-HBs', 'Anti-HBe'],
    hcv: ['Anti-HCV', 'HCV RNA', 'HCV Genotype'],
    hepatitis: ['AST', 'ALT', 'AFP', '腹部超音波'],
    other: ['CBC', 'DC', 'BUN', 'Creatinine', 'Total bilirubin', 'Direct bilirubin', 'PT', 'APTT', 'Albumin']
  };

  // 按鈕模式對應收攬狀態: { groupId: open/close }
  const FILTER_MODE_STATE = {
    general: { hbv: false, hcv: false, hepatitis: true, other: false },
    hbv: { hbv: true, hcv: false, hepatitis: true, other: false },
    hcv: { hbv: false, hcv: true, hepatitis: true, other: false }
  };

  // 肝炎追蹤項目設定
  const HEPATITIS_ITEM_CONFIG = {
    'AST': { label: 'AST (U/L)', ref: '0-40', type: 'numeric', max: 40, orderCode: '09025' },
    'ALT': { label: 'ALT (U/L)', ref: '0-40', type: 'numeric', max: 40, orderCode: '09026' },
    'Total bilirubin': { label: 'Total bilirubin (mg/dL)', ref: '0.1-1.2', type: 'numeric', min: 0.1, max: 1.2, orderCode: '09029' },
    'Direct bilirubin': { label: 'Direct bilirubin (mg/dL)', ref: '0-0.3', type: 'numeric', max: 0.3, orderCode: '09030' },
    'Albumin': { label: 'Albumin (g/dL)', ref: '3.5-5.5', type: 'numeric', min: 3.5, max: 5.5, orderCode: '09038' },
    'AFP': { label: 'AFP (ng/mL)', ref: '0-20', type: 'numeric', max: 20, orderCode: '12007' },
    'HBsAg': { label: 'HBsAg', ref: '陰性', type: 'qualitative', abnormalValues: ['陽性'], orderCode: '14032' },
    'HBeAg': { label: 'HBeAg', ref: '陰性', type: 'qualitative', abnormalValues: ['陽性'], orderCode: '14035' },
    'HBV DNA': { label: 'HBV DNA', ref: '-', type: 'numeric', orderCode: '12184HBV' },
    'Anti-HBc': { label: 'Anti-HBc', ref: '-', type: 'qualitative', orderCode: '14037' },
    'Anti-HBs': { label: 'Anti-HBs', ref: '-', type: 'qualitative', orderCode: '14033' },
    'Anti-HBe': { label: 'Anti-HBe', ref: '-', type: 'qualitative', orderCode: '14036' },
    'Anti-HCV': { label: 'Anti-HCV', ref: '陰性', type: 'qualitative', abnormalValues: ['陽性'], orderCode: '14051' },
    'HCV RNA': { label: 'HCV RNA', ref: '無異常', type: 'qualitative', abnormalValues: ['有異常值'], orderCode: '12185HCV' },
    'HCV Genotype': { label: 'HCV Genotype', ref: '-', type: 'qualitative', orderCode: '12202' },
    'PT': { label: 'PT (sec)', ref: '10-14', type: 'numeric', min: 10, max: 14, orderCode: '08026' },
    'APTT': { label: 'APTT (sec)', ref: '25-35', type: 'numeric', min: 25, max: 35, orderCode: '08036' },
    'CBC': { label: 'CBC 全套血液檢查I', ref: '-', type: 'detail', orderCode: '08011' },
    'DC': { label: 'DC(分類計數)', ref: '-', type: 'detail', orderCode: '08013' },
    'BUN': { label: 'BUN (mg/dL)', ref: '7-20', type: 'numeric', min: 7, max: 20, orderCode: '09002' },
    'Creatinine': { label: 'Creatinine (mg/dL)', ref: '0.7-1.0', type: 'numeric', min: 0.7, max: 1.0, orderCode: '09015' },
    '腹部超音波': { label: '腹部超音波', ref: '-', type: 'report', orderCodes: ['19001B', '19001F', '19009', '19009A'] }
  };

  // 腹部影像醫令代碼對應
  const IMAGING_ORDER_CODES = {
    '19001B': '腹超放射',
    '19001F': '腹超腸胃科',
    '19009': '腹超追蹤腸胃科',
    '19009A': '腹超追蹤放射',
    '33070C1': 'CT /s Abd+Pelvis(無造影)',
    '33072C1': 'CT /s+c Abd+Pelvis(造影)',
    '33084D': 'MRI/s abdomen',
    '33085H': 'MRI/c abdomen'
  };

  const MOCK_PATIENTS = {
    'A123456789': {
      idNo: 'A123456789',
      medicalRecordNo: 'MR20240001',
      name: '王小明',
      gender: '男',
      birthday: '1985-06-15',
      age: 39,
      address: '台北市信義區信義路五段7號',
      phoneMobile: '0912-345678',
      phoneHome: '02-23456789',
      phoneWork: '02-87654321',
      firstVisitDate: '2020-03-10',
      hepatitisTracking: {
        'AST': [{ value: '28', date: '2024-11-20' }, { value: '32', date: '2024-08-15' }, { value: '25', date: '2024-05-10' }],
        'ALT': [{ value: '35', date: '2024-11-20' }, { value: '42', date: '2024-08-15' }, { value: '38', date: '2024-05-10' }],
        'Total bilirubin': [{ value: '0.8', date: '2024-11-20' }],
        'Direct bilirubin': [{ value: '0.2', date: '2024-11-20' }],
        'Albumin': [{ value: '4.2', date: '2024-11-20' }],
        'AFP': [{ value: '5.3', date: '2024-11-20' }],
        'HBsAg': [{ value: '陽性', date: '2024-11-20' }],
        'HBeAg': [{ value: '陰性', date: '2024-11-20' }],
        'HBV DNA': [{ value: '1200', date: '2024-11-20' }],
        'Anti-HBc': [{ value: '陽性', date: '2024-11-20' }],
        'Anti-HBs': [{ value: '陰性', date: '2024-11-20' }],
        'Anti-HBe': [{ value: '陽性', date: '2024-11-20' }],
        'Anti-HCV': [{ value: '陽性', date: '2024-11-20' }],
        'HCV RNA': [{ value: '有異常值', date: '2024-11-20' }],
        'HCV Genotype': [{ value: '1b', date: '2024-11-20' }],
        'PT': [{ value: '12.5', date: '2024-11-20' }],
        'APTT': [{ value: '32', date: '2024-11-20' }],
        'PLT': [{ value: '185', date: '2024-11-20' }],
        'CBC': [{ value: 'detail', date: '2024-11-20', detail: { WBC: '5.2', RBC: '4.8', Hb: '14.2', Hct: '42', PLT: '185', MCV: '88', MCH: '29', MCHC: '33' } }],
        'DC': [{ value: 'detail', date: '2024-11-20', detail: { Neut: '55%', Lymph: '35%', Mono: '6%', Eos: '3%', Baso: '1%' } }],
        'BUN': [{ value: '12', date: '2024-11-20' }],
        'Creatinine': [{ value: '0.9', date: '2024-11-20' }],
        '腹部超音波': [
          { value: '輕度脂肪肝', date: '2024-11-15', orderCode: '19001F' },
          { value: '輕度脂肪肝', date: '2024-08-10', orderCode: '19009' }
        ]
      },
      imagingReports: [
        { item: '腹超腸胃科', orderCode: '19001F', date: '2024-11-15', content: '腹部超音波檢查報告\n\n檢查日期：2024-11-15\n醫令代碼：19001F\n\n檢查所見：\n- 肝臟：輕度脂肪肝，肝實質回音稍增，未見明顯佔位性病灶\n- 膽囊：未見結石，膽囊壁光滑\n- 脾臟：大小正常\n- 胰臟：未見異常\n- 腎臟：雙側未見明顯異常\n\n結論：輕度脂肪肝，建議追蹤。' },
        { item: '腹超追蹤腸胃科', orderCode: '19009', date: '2024-08-10', content: '腹部超音波檢查報告\n\n檢查日期：2024-08-10\n醫令代碼：19009\n\n檢查所見：\n- 肝臟：輕度脂肪肝\n- 膽囊、脾臟、胰臟、腎臟：未見明顯異常\n\n結論：輕度脂肪肝。' },
        { item: 'CT /s Abd+Pelvis(無造影)', orderCode: '33070C1', date: '2024-06-01', content: '腹部電腦斷層檢查報告\n\n檢查日期：2024-06-01\n醫令代碼：33070C1\n\n檢查所見：肝臟實質未見明顯異常。膽囊、脾臟、胰臟、腎臟未見明顯異常。\n\n結論：未見明顯異常。' }
      ],
      codeHistory: [
        { code: 'p4201', openDate: '2024-05-20', doctor: '陳大明', department: '肝膽腸胃科', session: '上午' }
      ]
    },
    'MR20240001': null, // 以病歷號查詢時會映射到 A123456789
    'B987654321': {
      idNo: 'B987654321',
      medicalRecordNo: 'MR20240002',
      name: '李小華',
      gender: '女',
      birthday: '1990-02-28',
      age: 35,
      address: '新北市板橋區文化路一段188號',
      phoneMobile: '0922-111222',
      phoneHome: '-',
      phoneWork: '-',
      firstVisitDate: '2024-01-05',
      hepatitisTracking: {
        'HBsAg': [{ value: '陽性', date: '2024-10-01' }],
        'Anti-HCV': [{ value: '陰性', date: '2024-10-01' }],
        'HCV RNA': [{ value: '無異常', date: '2024-10-01' }],
        'AST': [{ value: '28', date: '2024-10-01' }],
        'ALT': [{ value: '30', date: '2024-10-01' }],
        'PLT': [{ value: '220', date: '2024-10-01' }]
      },
      imagingReports: [],
      codeHistory: []
    }
  };

  // 病歷號對應身分證
  MOCK_PATIENTS['MR20240001'] = MOCK_PATIENTS['A123456789'];

  // ========== DOM 元素 ==========

  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const searchMessage = document.getElementById('searchMessage');
  const patientInfo = document.getElementById('patientInfo');
  const hepatitisTableBody = document.getElementById('hepatitisTableBody');
  const abdominalTableBody = document.getElementById('abdominalTableBody');
  const codeTableBody = document.getElementById('codeTableBody');
  const historyPanel = document.getElementById('historyPanel');
  const historyPanelContent = document.getElementById('historyPanelContent');
  const historyPanelTitle = document.getElementById('historyPanelTitle');
  const closeHistoryPanel = document.getElementById('closeHistoryPanel');
  const reportPanel = document.getElementById('reportPanel');
  const reportContent = document.getElementById('reportContent');
  const closeReportPanel = document.getElementById('closeReportPanel');
  const logicPrompt = document.getElementById('logicPrompt');
  const promptCard = document.getElementById('promptCard');
  const fib4Age = document.getElementById('fib4Age');
  const fib4AST = document.getElementById('fib4AST');
  const fib4ALT = document.getElementById('fib4ALT');
  const fib4PLT = document.getElementById('fib4PLT');
  const fib4Result = document.getElementById('fib4Result');
  const fib4Desc = document.getElementById('fib4Desc');

  let currentFilterMode = 'general';
  let groupCollapseState = { hbv: false, hcv: false, hepatitis: true, other: false };

  // ========== 工具函式 ==========

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    return dateStr;
  }

  function parseDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }

  function monthsBetween(dateStr, fromDate) {
    const d = parseDate(dateStr);
    const from = fromDate || new Date();
    if (!d) return 0;
    return (from.getFullYear() - d.getFullYear()) * 12 + (from.getMonth() - d.getMonth());
  }

  function addYears(dateStr, years) {
    const d = parseDate(dateStr);
    if (!d) return '-';
    d.setFullYear(d.getFullYear() + years);
    return d.toISOString().slice(0, 10);
  }

  /** 判斷檢驗值是否異常（超過參考值或陽性/有異常值） */
  function isValueAbnormal(itemKey, value) {
    if (!value || value === '-') return false;
    const config = HEPATITIS_ITEM_CONFIG[itemKey];
    if (!config) return false;
    if (config.type === 'report' || config.type === 'detail') return false;
    if (config.type === 'qualitative') {
      return (config.abnormalValues || []).includes(value);
    }
    if (config.type === 'numeric') {
      const num = parseFloat(value);
      if (isNaN(num)) return false;
      if (config.min !== undefined && num < config.min) return true;
      if (config.max !== undefined && num > config.max) return true;
    }
    return false;
  }

  // ========== 檢索邏輯 ==========

  function searchPatient(query) {
    const key = String(query).trim().toUpperCase();
    if (!key) return null;
    return MOCK_PATIENTS[key] || null;
  }

  // ========== 渲染病人基本資料 ==========

  function renderPatientInfo(patient) {
    if (!patient) {
      patientInfo.innerHTML = '<p class="empty-state">請輸入身分證字號或病歷號進行查詢</p>';
      return;
    }
    patientInfo.innerHTML = `
      <div class="info-item"><span class="info-label">姓名</span><span class="info-value">${patient.name}</span></div>
      <div class="info-item"><span class="info-label">性別</span><span class="info-value">${patient.gender}</span></div>
      <div class="info-item"><span class="info-label">身分證號碼</span><span class="info-value">${patient.idNo}</span></div>
      <div class="info-item"><span class="info-label">病歷號</span><span class="info-value">${patient.medicalRecordNo}</span></div>
      <div class="info-item"><span class="info-label">生日</span><span class="info-value">${formatDate(patient.birthday)}</span></div>
      <div class="info-item"><span class="info-label">年齡</span><span class="info-value">${patient.age}</span></div>
      <div class="info-item"><span class="info-label">地址</span><span class="info-value">${patient.address}</span></div>
      <div class="info-item"><span class="info-label">連絡電話-手機</span><span class="info-value">${patient.phoneMobile}</span></div>
      <div class="info-item"><span class="info-label">連絡電話-住家</span><span class="info-value">${patient.phoneHome}</span></div>
      <div class="info-item"><span class="info-label">連絡電話-公司</span><span class="info-value">${patient.phoneWork}</span></div>
      <div class="info-item"><span class="info-label">初診日期</span><span class="info-value">${formatDate(patient.firstVisitDate)}</span></div>
    `;
  }

  // ========== 渲染肝炎追蹤項目 ==========

  function renderHepatitisTable(patient) {
    const tracking = patient ? patient.hepatitisTracking || {} : {};
    const imagingReports = patient && patient.imagingReports ? patient.imagingReports : [];
    const abdomenReports = imagingReports.filter(r => ['19001B', '19001F', '19009', '19009A'].includes(r.orderCode));

    const GROUP_LABELS = { hbv: 'HBV 相關', hcv: 'HCV 相關', hepatitis: '肝炎追蹤', other: '其他檢驗項目' };
    let html = '';

    for (const [groupId, items] of Object.entries(ITEM_GROUPS)) {
      const isOpen = groupCollapseState[groupId];
      html += `<tr class="tr-group-header" data-group="${groupId}">
        <td colspan="5"><span class="toggle-icon">▼</span>${GROUP_LABELS[groupId]}</td>
      </tr>`;
      for (const item of items) {
        const config = HEPATITIS_ITEM_CONFIG[item];
        if (!config) continue;
        const records = tracking[item] || [];
        const latest = records.length > 0 ? records[0] : null;

        let displayValue, date, hasHistory, historyHtml, valueClick;
        if (item === '腹部超音波') {
          displayValue = abdomenReports.length > 0 ? '檢視報告' : '-';
          date = records.length > 0 ? records[0].date : '-';
          hasHistory = records.length > 0;
          valueClick = abdomenReports.length > 0 ? 'data-view-report="1"' : '';
          historyHtml = hasHistory
            ? '<span class="link-cell" data-item="' + item + '" data-type="history">檢驗歷程</span>'
            : '-';
        } else if (item === 'CBC' || item === 'DC') {
          displayValue = records.length > 0 ? '詳細內容' : '-';
          date = latest ? latest.date : '-';
          hasHistory = records.length > 0;
          valueClick = records.length > 0 ? 'data-item="' + item + '" data-type="detail"' : '';
          historyHtml = hasHistory
            ? '<span class="link-cell" data-item="' + item + '" data-type="history">檢驗歷程</span>'
            : '-';
        } else {
          displayValue = latest ? (latest.value === 'detail' ? '-' : latest.value) : '-';
          date = latest ? latest.date : '-';
          hasHistory = records.length > 0;
          valueClick = '';
          historyHtml = hasHistory
            ? '<span class="link-cell" data-item="' + item + '" data-type="history">檢驗歷程</span>'
            : '-';
        }

        const valueClass = (!['腹部超音波', 'CBC', 'DC'].includes(item) && isValueAbnormal(item, displayValue)) ? ' value-abnormal' : '';
        const refDisplay = config.ref || '-';
        const valueCell = valueClick
          ? `<td class="link-cell ${valueClass}" ${valueClick}>${displayValue}</td>`
          : `<td class="${valueClass}">${displayValue}</td>`;

        html += `<tr class="tr-group-row" data-group="${groupId}">
          <td>${config.label}</td>
          ${valueCell}
          <td>${refDisplay}</td>
          <td>${date}</td>
          <td>${historyHtml}</td>
        </tr>`;
      }
    }

    hepatitisTableBody.innerHTML = html;

    // 綁定群組收攬
    hepatitisTableBody.querySelectorAll('.tr-group-header').forEach(el => {
      el.addEventListener('click', function () {
        const g = this.dataset.group;
        groupCollapseState[g] = !groupCollapseState[g];
        this.classList.toggle('collapsed', !groupCollapseState[g]);
        hepatitisTableBody.querySelectorAll('.tr-group-row[data-group="' + g + '"]').forEach(r => {
          r.classList.toggle('collapsed', !groupCollapseState[g]);
        });
      });
      const g = el.dataset.group;
      el.classList.toggle('collapsed', !groupCollapseState[g]);
    });
    hepatitisTableBody.querySelectorAll('.tr-group-row').forEach(el => {
      el.classList.toggle('collapsed', !groupCollapseState[el.dataset.group]);
    });

    // 綁定值/歷程點擊
    hepatitisTableBody.querySelectorAll('.link-cell[data-item], .link-cell[data-view-report]').forEach(el => {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        const item = this.dataset.item;
        const type = this.dataset.type;
        const viewReport = this.dataset.viewReport;
        if (viewReport === '1') {
          const latest = abdomenReports[0];
          showReportInHistoryPanel(latest);
        } else if (type === 'detail' && (item === 'CBC' || item === 'DC')) {
          const rec = (tracking[item] || [])[0];
          showDetailPanel(item, rec ? rec.detail : null);
        } else if (type === 'history') {
          const recs = (tracking[item] || []);
          if (item === '腹部超音波') {
            showAbdomenHistoryPanel(recs);
          } else {
            showHistoryPanel(item, recs);
          }
        }
      });
    });

  }

  function showAbdomenHistoryPanel(records) {
    historyPanelTitle.textContent = '腹部超音波 - 檢驗歷程';
    if (!records || records.length === 0) {
      historyPanelContent.innerHTML = '<p class="empty-state">無歷程資料</p>';
    } else {
      historyPanelContent.innerHTML = `
        <ul class="history-list">
          ${records.map(r => `
            <li>
              <span class="history-value">${r.value}</span>
              <span class="history-date">${r.date}</span>
              <span class="history-ref">醫令: ${r.orderCode || '-'}</span>
            </li>
          `).join('')}
        </ul>
      `;
    }
  }

  function showDetailPanel(itemName, detail) {
    historyPanelTitle.textContent = HEPATITIS_ITEM_CONFIG[itemName]?.label + ' - 詳細內容';
    if (!detail || Object.keys(detail).length === 0) {
      historyPanelContent.innerHTML = '<p class="empty-state">無詳細資料</p>';
    } else {
      historyPanelContent.innerHTML = `
        <ul class="history-list">
          ${Object.entries(detail).map(([k, v]) => `
            <li>
              <span class="history-value">${k}: ${v}</span>
            </li>
          `).join('')}
        </ul>
      `;
    }
  }

  function showHistoryPanel(itemName, records) {
    historyPanelTitle.textContent = HEPATITIS_ITEM_CONFIG[itemName]?.label + ' - 檢驗歷程';
    if (records.length === 0) {
      historyPanelContent.innerHTML = '<p class="empty-state">無歷程資料</p>';
    } else {
      const config = HEPATITIS_ITEM_CONFIG[itemName];
      const refDisplay = config ? config.ref : '-';
      const isCbcOrDc = itemName === 'CBC' || itemName === 'DC';
      historyPanelContent.innerHTML = `
        <ul class="history-list">
          ${records.map((r, idx) => {
            const abnormalClass = !isCbcOrDc && isValueAbnormal(itemName, r.value) ? ' value-abnormal' : '';
            const valueDisplay = isCbcOrDc
              ? '<span class="link-cell history-view-detail" data-index="' + idx + '">點擊檢視</span>'
              : '<span class="history-value' + abnormalClass + '">' + r.value + '</span>';
            return `
            <li>
              ${valueDisplay}
              <span class="history-date">${r.date}</span>
              <span class="history-ref">參考值: ${refDisplay}</span>
            </li>`;
          }).join('')}
        </ul>
      `;
      if (isCbcOrDc) {
        historyPanelContent.querySelectorAll('.history-view-detail').forEach(el => {
          el.addEventListener('click', function () {
            const idx = parseInt(this.dataset.index, 10);
            const rec = records[idx];
            showDetailPanel(itemName, rec && rec.detail ? rec.detail : null);
          });
        });
      }
    }
  }

  function showReportInHistoryPanel(report) {
    historyPanelTitle.textContent = '腹部超音波 - 報告內容';
    if (!report) {
      historyPanelContent.innerHTML = '<p class="empty-state">無報告資料</p>';
    } else {
      const ta = document.createElement('textarea');
      ta.className = 'report-textarea';
      ta.readOnly = true;
      ta.value = report.content;
      historyPanelContent.innerHTML = '';
      historyPanelContent.appendChild(ta);
    }
  }

  // ========== 渲染腹部影像報告 ==========

  function renderImagingReports(patient) {
    const reports = patient && patient.imagingReports ? patient.imagingReports : [];
    if (reports.length === 0) {
      abdominalTableBody.innerHTML = '<tr><td colspan="3">無資料</td></tr>';
    } else {
      abdominalTableBody.innerHTML = reports.map((r, i) => `
        <tr class="clickable-row" data-index="${i}">
          <td>${r.item}</td>
          <td>${r.orderCode || '-'}</td>
          <td>${r.date}</td>
        </tr>
      `).join('');

      abdominalTableBody.querySelectorAll('.clickable-row').forEach(el => {
        el.addEventListener('click', function () {
          const idx = parseInt(this.dataset.index, 10);
          const report = reports[idx];
          showReportPanel(report);
        });
      });
    }
  }

  function showReportPanel(report) {
    reportContent.value = report ? report.content : '';
  }

  // ========== 渲染個案管理代碼開立歷程 ==========

  function renderCodeTable(patient) {
    const codes = patient && patient.codeHistory ? patient.codeHistory : [];
    if (codes.length === 0) {
      codeTableBody.innerHTML = '<tr><td colspan="5">無資料</td></tr>';
    } else {
      codeTableBody.innerHTML = codes.map(c => `
        <tr>
          <td>${c.code}</td>
          <td>${c.openDate}</td>
          <td>${c.doctor}</td>
          <td>${c.department}</td>
          <td>${c.session}</td>
        </tr>
      `).join('');
    }
  }

  // ========== 個案管理邏輯提示 ==========

  function evaluateLogicPrompt(patient) {
    if (!patient) {
      logicPrompt.textContent = '';
      logicPrompt.className = 'logic-prompt';
      promptCard.style.display = 'none';
      return;
    }

    const tracking = patient.hepatitisTracking || {};
    const codes = patient.codeHistory || [];
    const latestCode = codes.length > 0 ? codes[codes.length - 1] : null;

    const getLatest = (item) => {
      const rec = (tracking[item] || [])[0];
      return rec ? rec.value : null;
    };

    const hbsag = getLatest('HBsAg');
    const antiHcv = getLatest('Anti-HCV');
    const hcvRna = getLatest('HCV RNA');

    const isHbsagPositive = hbsag === '陽性';
    const isAntiHcvPositive = antiHcv === '陽性';
    const isHcvRnaAbnormal = hcvRna === '有異常值';

    const needEnroll = codes.length === 0 && (isHbsagPositive || isAntiHcvPositive || isHcvRnaAbnormal);

    let message = '';
    let promptClass = 'logic-prompt';

    if (needEnroll) {
      message = '個案未曾在本院收案，建議收案';
      promptClass += ' prompt-warn';
    } else if (latestCode) {
      const months = monthsBetween(latestCode.openDate);
      if (latestCode.code === 'p4201') {
        if (months > 6) {
          const nextDate = addYears(latestCode.openDate, 1);
          message = '初次追蹤個案逾期追蹤, 下次可從新收案時間為 (初次開立1年之後) ' + nextDate;
          promptClass += ' prompt-warn';
        } else if (months >= 3) {
          message = '初次追蹤個案，建議返診追蹤';
          promptClass += ' prompt-info';
        }
      } else if (latestCode.code === 'p4202') {
        if (months > 12) {
          const nextDate = addYears(latestCode.openDate, 1);
          message = '長期追蹤個案於期追蹤, 下次可能新收案時間為 (最後一次開立1年之後) ' + nextDate;
          promptClass += ' prompt-warn';
        } else if (months >= 6) {
          message = '長期追蹤個案, 建議返診追蹤';
          promptClass += ' prompt-info';
        }
      }
    }

    logicPrompt.textContent = message;
    logicPrompt.className = promptClass;
    promptCard.style.display = message ? 'block' : 'none';
  }

  // ========== 主流程：載入病人資料 ==========

  function loadPatient(patient) {
    renderPatientInfo(patient);
    applyFilterMode(currentFilterMode);
    renderHepatitisTable(patient);
    renderImagingReports(patient);
    renderCodeTable(patient);
    evaluateLogicPrompt(patient);
    updateFib4(patient);
    historyPanelContent.innerHTML = '<p class="empty-state">點擊「檢驗歷程」或「檢視報告」查看內容</p>';
    historyPanelTitle.textContent = '檢驗歷程 / 報告內容';
    reportContent.value = '';
  }

  function applyFilterMode(mode) {
    currentFilterMode = mode;
    groupCollapseState = Object.assign({}, FILTER_MODE_STATE[mode]);
    document.querySelectorAll('.btn-filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
  }

  // ========== FIB-4 計算 ==========

  function updateFib4(patient) {
    if (!patient) {
      fib4Age.value = fib4AST.value = fib4ALT.value = fib4PLT.value = '';
      fib4Result.textContent = '-';
      fib4Desc.textContent = '';
      return;
    }
    const t = patient.hepatitisTracking || {};
    const age = patient.age;
    const astRec = t['AST'] && t['AST'][0] ? t['AST'][0].value : '';
    const altRec = t['ALT'] && t['ALT'][0] ? t['ALT'][0].value : '';
    let pltVal = '';
    if (t['PLT'] && t['PLT'][0]) pltVal = t['PLT'][0].value;
    else if (t['CBC'] && t['CBC'][0] && t['CBC'][0].detail && t['CBC'][0].detail.PLT) pltVal = t['CBC'][0].detail.PLT;
    fib4Age.value = age != null ? age : '';
    fib4AST.value = astRec;
    fib4ALT.value = altRec;
    fib4PLT.value = pltVal;
    calcFib4();
  }

  function calcFib4() {
    const age = parseFloat(fib4Age.value);
    const ast = parseFloat(fib4AST.value);
    const alt = parseFloat(fib4ALT.value);
    const plt = parseFloat(fib4PLT.value);
    if (isNaN(age) || isNaN(ast) || isNaN(alt) || isNaN(plt) || age <= 0 || ast < 0 || alt <= 0 || plt <= 0) {
      fib4Result.textContent = '-';
      fib4Desc.textContent = '';
      return;
    }
    const sqrtAlt = Math.sqrt(alt);
    const fib4 = (age * ast) / (sqrtAlt * plt);
    fib4Result.textContent = fib4.toFixed(2);
    if (fib4 < 1.3) {
      fib4Desc.textContent = '<1.3: 肝纖維化低度風險';
    } else if (fib4 <= 2.67) {
      fib4Desc.textContent = '1.3 ~ 2.67: 肝纖維化中度風險';
    } else {
      fib4Desc.textContent = '> 2.67: 肝纖維化高度風險';
    }
  }

  function handleSearch() {
    const query = searchInput.value.trim();
    searchMessage.textContent = '';
    searchMessage.className = 'search-message';

    if (!query) {
      searchMessage.textContent = '請輸入身分證字號或病歷號';
      searchMessage.classList.add('error');
      return;
    }

    const patient = searchPatient(query);
    if (patient) {
      searchMessage.textContent = '查詢成功';
      searchMessage.classList.add('success');
      loadPatient(patient);
    } else {
      searchMessage.textContent = '查無此病人資料';
      searchMessage.classList.add('error');
      loadPatient(null);
    }
  }

  // ========== 事件綁定 ==========

  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleSearch();
  });

  document.querySelectorAll('.btn-filter').forEach(btn => {
    btn.addEventListener('click', function () {
      const mode = this.dataset.mode;
      applyFilterMode(mode);
      const patient = searchPatient(searchInput.value.trim());
      if (patient) renderHepatitisTable(patient);
    });
  });

  [fib4Age, fib4AST, fib4ALT, fib4PLT].forEach(input => {
    input.addEventListener('input', calcFib4);
    input.addEventListener('change', calcFib4);
  });

  closeHistoryPanel.addEventListener('click', function () {
    historyPanelContent.innerHTML = '<p class="empty-state">點擊「檢驗歷程」或「檢視報告」查看內容</p>';
    historyPanelTitle.textContent = '檢驗歷程 / 報告內容';
  });

  closeReportPanel.addEventListener('click', function () {
    reportContent.value = '';
  });

  // ========== 初始化 ==========

  loadPatient(null);
})();
