/**
 * 肝炎個案追蹤 - 模擬應用邏輯
 * 依 docs/肝炎個案追蹤-BDD規格.md 實作
 */

(function () {
  'use strict';

  // ========== 模擬資料 ==========

  // 肝炎追蹤項目設定：key, 顯示名稱（含單位）, 參考值
  const HEPATITIS_ITEM_CONFIG = {
    'AST': { label: 'AST (U/L)', ref: '0-40', type: 'numeric', max: 40 },
    'ALT': { label: 'ALT (U/L)', ref: '0-40', type: 'numeric', max: 40 },
    'Total bilirubin': { label: 'Total bilirubin (mg/dL)', ref: '0.1-1.2', type: 'numeric', min: 0.1, max: 1.2 },
    'Direct bilirubin': { label: 'Direct bilirubin (mg/dL)', ref: '0-0.3', type: 'numeric', max: 0.3 },
    'Albumin': { label: 'Albumin (g/dL)', ref: '3.5-5.5', type: 'numeric', min: 3.5, max: 5.5 },
    'AFP': { label: 'AFP (ng/mL)', ref: '0-20', type: 'numeric', max: 20 },
    'HBsAg': { label: 'HBsAg', ref: '陰性', type: 'qualitative', abnormalValues: ['陽性'] },
    'HBeAg': { label: 'HBeAg', ref: '陰性', type: 'qualitative', abnormalValues: ['陽性'] },
    'Anti-HCV': { label: 'Anti-HCV', ref: '陰性', type: 'qualitative', abnormalValues: ['陽性'] },
    'HCV RNA': { label: 'HCV RNA', ref: '無異常', type: 'qualitative', abnormalValues: ['有異常值'] },
    'PT': { label: 'PT (sec)', ref: '10-14', type: 'numeric', min: 10, max: 14 },
    'APTT': { label: 'APTT (sec)', ref: '25-35', type: 'numeric', min: 25, max: 35 },
    '腹部超音波': { label: '腹部超音波', ref: '-', type: 'report' }
  };

  const HEPATITIS_ITEMS = Object.keys(HEPATITIS_ITEM_CONFIG);

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
        'Anti-HCV': [{ value: '陽性', date: '2024-11-20' }],
        'HCV RNA': [{ value: '有異常值', date: '2024-11-20' }],
        'PT': [{ value: '12.5', date: '2024-11-20' }],
        'APTT': [{ value: '32', date: '2024-11-20' }],
        '腹部超音波': [{ value: '輕度脂肪肝', date: '2024-11-15' }]
      },
      abdominalReports: [
        { item: '腹部超音波', date: '2024-11-15', content: '腹部超音波檢查報告\n\n檢查日期：2024-11-15\n\n檢查所見：\n- 肝臟：輕度脂肪肝，肝實質回音稍增，未見明顯佔位性病灶\n- 膽囊：未見結石，膽囊壁光滑\n- 脾臟：大小正常\n- 胰臟：未見異常\n- 腎臟：雙側未見明顯異常\n\n結論：輕度脂肪肝，建議追蹤。' },
        { item: '腹部超音波', date: '2024-08-10', content: '腹部超音波檢查報告\n\n檢查日期：2024-08-10\n\n檢查所見：\n- 肝臟：輕度脂肪肝\n- 膽囊、脾臟、胰臟、腎臟：未見明顯異常\n\n結論：輕度脂肪肝。' }
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
        'HCV RNA': [{ value: '無異常', date: '2024-10-01' }]
      },
      abdominalReports: [],
      codeHistory: []  // 空白，且 HBsAg 陽性 → 建議收案
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
    if (config.type === 'report') return false;
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
    const abdominalReports = patient && patient.abdominalReports ? patient.abdominalReports : [];

    hepatitisTableBody.innerHTML = HEPATITIS_ITEMS.map(item => {
      const config = HEPATITIS_ITEM_CONFIG[item];
      const records = tracking[item] || [];
      const latest = records.length > 0 ? records[0] : null;

      let displayValue, date, hasHistory, historyHtml;
      if (item === '腹部超音波') {
        displayValue = abdominalReports.length > 0 ? '檢視報告' : '-';
        date = latest ? latest.date : '-';
        hasHistory = abdominalReports.length > 0;
        historyHtml = hasHistory
          ? '<span class="link-cell link-view-report" data-item="abdominal">檢視報告</span>'
          : '-';
      } else {
        displayValue = latest ? latest.value : '-';
        date = latest ? latest.date : '-';
        hasHistory = records.length > 0;
        historyHtml = hasHistory
          ? '<span class="link-cell" data-item="' + item + '">檢驗歷程</span>'
          : '-';
      }

      const valueClass = (item !== '腹部超音波' && isValueAbnormal(item, displayValue)) ? ' value-abnormal' : '';
      const refDisplay = config.ref || '-';

      return `<tr>
        <td>${config.label}</td>
        <td class="${valueClass}">${displayValue}</td>
        <td>${refDisplay}</td>
        <td>${date}</td>
        <td>${historyHtml}</td>
      </tr>`;
    }).join('');

    // 綁定檢驗歷程點擊
    hepatitisTableBody.querySelectorAll('.link-cell[data-item]').forEach(el => {
      el.addEventListener('click', function () {
        const dataItem = this.dataset.item;
        if (dataItem === 'abdominal') {
          const latestReport = abdominalReports[0];
          showReportInHistoryPanel(latestReport);
        } else {
          const records = (patient.hepatitisTracking || {})[dataItem] || [];
          showHistoryPanel(dataItem, records);
        }
      });
    });
  }

  function showHistoryPanel(itemName, records) {
    historyPanelTitle.textContent = HEPATITIS_ITEM_CONFIG[itemName]?.label + ' - 檢驗歷程';
    if (records.length === 0) {
      historyPanelContent.innerHTML = '<p class="empty-state">無歷程資料</p>';
    } else {
      const config = HEPATITIS_ITEM_CONFIG[itemName];
      const refDisplay = config ? config.ref : '-';
      historyPanelContent.innerHTML = `
        <ul class="history-list">
          ${records.map(r => {
            const abnormalClass = isValueAbnormal(itemName, r.value) ? ' value-abnormal' : '';
            return `
            <li>
              <span class="history-value${abnormalClass}">${r.value}</span>
              <span class="history-date">${r.date}</span>
              <span class="history-ref">參考值: ${refDisplay}</span>
            </li>`;
          }).join('')}
        </ul>
      `;
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

  // ========== 渲染腹部檢驗報告 ==========

  function renderAbdominalTable(patient) {
    const reports = patient && patient.abdominalReports ? patient.abdominalReports : [];
    if (reports.length === 0) {
      abdominalTableBody.innerHTML = '<tr><td colspan="2">無資料</td></tr>';
    } else {
      abdominalTableBody.innerHTML = reports.map((r, i) => `
        <tr class="clickable-row" data-index="${i}">
          <td>${r.item}</td>
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
    renderHepatitisTable(patient);
    renderAbdominalTable(patient);
    renderCodeTable(patient);
    evaluateLogicPrompt(patient);
    historyPanelContent.innerHTML = '<p class="empty-state">點擊「檢驗歷程」或「檢視報告」查看內容</p>';
    historyPanelTitle.textContent = '檢驗歷程 / 報告內容';
    reportContent.value = '';
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
