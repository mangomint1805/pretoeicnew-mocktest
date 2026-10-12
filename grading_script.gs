/**
 * TOEIC Pre (ver 3.0 – lớp mới) · Bộ nhận & chấm bài Mock test
 * Thêm đề mới: thêm một dòng vào TESTS (mã đề, tên tab, đáp án).
 * Project Apps Script riêng, ghi kết quả vào sheet "Kết quả Test TOPRE115276" (SHEET_ID bên dưới).
 * Đáp án chỉ nằm ở đây (trên Google của thầy), KHÔNG nằm trong file HTML của học viên.
 */

const TESTS = {
  'TOEIC-PRE-MOCK1-P1': { sheet: 'Kết quả - Mock Test 1 P1', key: {"1": "B", "2": "A", "3": "C", "4": "B", "5": "A", "6": "C"} },
  'TOEIC-PRE-MOCK2-P5': { sheet: 'Kết quả - Mock Test 2 P5', key: {"101": "B", "102": "A", "103": "C", "104": "D", "105": "C", "106": "A", "107": "D", "108": "A", "109": "A", "110": "C", "111": "D", "112": "A", "113": "B", "114": "C", "115": "A", "116": "C", "117": "A", "118": "B", "119": "D", "120": "C", "121": "B", "122": "A", "123": "D", "124": "B", "125": "A", "126": "A", "127": "B", "128": "D", "129": "B", "130": "A"} },
  'TOEIC-PRE-MOCK3-P6': { sheet: 'Kết quả - Mock Test 3 P6', key: {"131": "C", "132": "C", "133": "B", "134": "B", "135": "C", "136": "A", "137": "B", "138": "D", "139": "B", "140": "D", "141": "A", "142": "D", "143": "B", "144": "A", "145": "A", "146": "D"} },
  'TOEIC-PRE-MOCK4-P2': { sheet: 'Kết quả - Mock Test 4 P2', key: {"7": "A", "8": "B", "9": "B", "10": "C", "11": "B", "12": "A", "13": "B", "14": "A", "15": "A", "16": "B", "17": "A", "18": "B", "19": "A", "20": "C", "21": "C", "22": "C", "23": "A", "24": "C", "25": "A", "26": "A", "27": "C", "28": "B", "29": "A", "30": "A", "31": "B"} },
  'TOEIC-PRE-MOCK5-P3': { sheet: 'Kết quả - Mock Test 5 P3', key: {"32": "A", "33": "C", "34": "D", "35": "C", "36": "A", "37": "D", "38": "B", "39": "A", "40": "D", "41": "B", "42": "B", "43": "A", "44": "B", "45": "A", "46": "C", "47": "C", "48": "A", "49": "B", "50": "B", "51": "D", "52": "A", "53": "C", "54": "B", "55": "A", "56": "C", "57": "B", "58": "A", "59": "C", "60": "A", "61": "D", "62": "A", "63": "A", "64": "D", "65": "B", "66": "B", "67": "B", "68": "A", "69": "B", "70": "C"} },
  'TOEIC-PRE-MOCK6-P7': { sheet: 'Kết quả - Mock Test 6 P7', key: {"147": "A", "148": "D", "149": "C", "150": "C", "151": "B", "152": "A", "153": "B", "154": "D", "155": "C", "156": "B", "157": "D", "158": "A", "159": "B", "160": "C", "161": "D", "162": "B", "163": "A", "164": "D", "165": "C", "166": "A", "167": "A", "168": "A", "169": "D", "170": "B", "171": "B", "172": "C", "173": "A", "174": "B", "175": "D"} }
};
const SHEET_ID = '18TIyPnOH08RKlcPKWTiby5Nzo6btTOHm6vrulaHa7MQ';   // sheet "Kết quả Test TOPRE115276"
const NOTIFY_EMAIL = '';   // (tuỳ chọn) điền email để nhận thông báo mỗi khi có học viên nộp bài

/** Thông tin của một đề: danh sách câu, số câu Nghe / Đọc. */
function cfg_(id) {
  const t = TESTS[id];
  if (!t) return null;
  const all = Object.keys(t.key).map(Number).sort((a, b) => a - b);
  return { id: id, sheet: t.sheet, key: t.key, all: all,
           lisN: all.filter(n => n <= 100).length, reaN: all.filter(n => n > 100).length };
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'score' && p.id && p.callback) {
    const cb = String(p.callback).replace(/[^\w$]/g, '');
    const r = findScore_(p.id);
    const out = r ? { ok: true, lis: r[1], rea: r[2], total: r[3] } : { ok: false };
    return ContentService.createTextOutput(cb + '(' + JSON.stringify(out) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput('OK - bộ nhận bài đang hoạt động: ' + Object.keys(TESTS).join(', '));
}

/** Sheet ẩn lưu điểm theo mã bài nộp, để trang thi lấy điểm hiển thị cho học viên. */
function scoreSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName('_scores');
  if (!sh) {
    sh = ss.insertSheet('_scores');
    sh.appendRow(['Mã bài nộp', 'Nghe', 'Đọc', 'Tổng', 'Thời gian']);
    sh.hideSheet();
  }
  return sh;
}
function findScore_(id) {
  const sh = scoreSheet_();
  if (sh.getLastRow() < 2) return null;
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues();
  return rows.find(r => String(r[0]) === String(id)) || null;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const d = JSON.parse(e.postData.contents);
    const T = cfg_(d.testId);
    if (!T) throw new Error('Sai mã đề: ' + d.testId);
    if (d.sid && findScore_(d.sid)) {   // bài này đã được ghi rồi (gửi lại) → không ghi trùng
      return ContentService.createTextOutput(JSON.stringify({ ok: true, dup: true })).setMimeType(ContentService.MimeType.JSON);
    }
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sh = getResultSheet_(ss, T);

    let lis = 0, rea = 0;
    const cells = [], colors = [];
    T.all.forEach(n => {
      const a = (d.answers || {})[n] || '';
      const k = T.key[n];
      const ok = a === k;
      if (ok) { if (n <= 100) lis++; else rea++; }
      cells.push(ok ? a + ' ✓' : (a || '—') + ' ✗ (' + k + ')');
      colors.push(ok ? '#e1f4ec' : '#fbe6e2');
    });

    const who = norm_(d.name) + '|' + norm_(d.cls);
    const prev = sh.getLastRow() > 1
      ? sh.getRange(2, 3, sh.getLastRow() - 1, 2).getValues().filter(r => norm_(r[0]) + '|' + norm_(r[1]) === who).length
      : 0;

    const mins = d.startedAt && d.submittedAt
      ? Math.round((new Date(d.submittedAt) - new Date(d.startedAt)) / 6000) / 10 : '';
    const vio = (d.violations || []).map(v => fmtTime_(v.t) + ' ' + v.type).join('\n');
    const notes = (d.notes || []).map(v => fmtTime_(v.t) + ' ' + v.type).join('\n');

    const head = [
      new Date(d.submittedAt || Date.now()), T.id, d.name, d.cls,
      lis, rea, lis + rea, Math.round((lis + rea) / T.all.length * 100) / 10,
      (d.violations || []).length, vio, d.reloads || 0,
      d.autoSubmitted ? 'CÓ – ' + d.reason : 'Không',
      mins, prev + 1, notes, d.userAgent || ''
    ];
    const row = sh.getLastRow() + 1;
    sh.getRange(row, 1, 1, head.length + cells.length).setValues([head.concat(cells)]);
    sh.getRange(row, head.length + 1, 1, cells.length).setBackgrounds([colors]);
    if ((d.violations || []).length > 0) sh.getRange(row, 9).setBackground('#fbe6e2');
    if (prev > 0) sh.getRange(row, 14).setBackground('#fbe6e2');

    if (d.sid) scoreSheet_().appendRow([d.sid, lis, rea, lis + rea, new Date()]);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, '[' + T.id + '] ' + d.name + ' đã nộp bài: ' + (lis + rea) + '/' + T.all.length,
        d.name + ' (' + d.cls + ')\nNghe: ' + lis + '/' + T.lisN + ' · Đọc: ' + rea + '/' + T.reaN + ' · Tổng: ' + (lis + rea) + '/' + T.all.length + '\n' +
        'Vi phạm: ' + (d.violations || []).length + (vio ? '\n' + vio : '') +
        '\nTự động nộp: ' + (d.autoSubmitted ? d.reason : 'Không'));
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    SpreadsheetApp.openById(SHEET_ID).getSheetByName('Lỗi') ||
      SpreadsheetApp.openById(SHEET_ID).insertSheet('Lỗi');
    SpreadsheetApp.openById(SHEET_ID).getSheetByName('Lỗi')
      .appendRow([new Date(), String(err), e && e.postData ? e.postData.contents : '']);
    return ContentService.createTextOutput(JSON.stringify({ ok: false })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function getResultSheet_(ss, T) {
  let sh = ss.getSheetByName(T.sheet);
  if (!sh) {
    sh = ss.insertSheet(T.sheet);
    const header = ['Thời gian nộp', 'Mã đề', 'Họ tên', 'Lớp', 'Nghe /' + T.lisN, 'Đọc /' + T.reaN, 'Tổng /' + T.all.length, 'Điểm /10',
      'Số vi phạm', 'Chi tiết vi phạm', 'Số lần tải lại', 'Tự động nộp', 'Thời gian làm (phút)',
      'Lần nộp thứ', 'Ghi chú (thao tác bị chặn)', 'Thiết bị']
      .concat(T.all.map(n => 'Câu ' + n));
    sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold').setBackground('#f2e2c4');
    sh.setFrozenRows(1);
    sh.setFrozenColumns(4);
  }
  return sh;
}

function norm_(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }
function fmtTime_(t) { return Utilities.formatDate(new Date(t), 'Asia/Ho_Chi_Minh', 'HH:mm:ss'); }

/** Chạy hàm này một lần trong trình soạn thảo để cấp quyền & tạo sheet "Kết quả". */
function setup() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  Object.keys(TESTS).forEach(id => getResultSheet_(ss, cfg_(id)));
  scoreSheet_();
  // Xoá tab trống ban đầu (chỉ có dòng tiêu đề) nếu không thuộc đề nào
  const keep = Object.keys(TESTS).map(id => TESTS[id].sheet).concat(['_scores', 'Lỗi']);
  ss.getSheets().forEach(s => { if (keep.indexOf(s.getName()) < 0 && s.getLastRow() <= 1 && ss.getSheets().length > 1) ss.deleteSheet(s); });
}
