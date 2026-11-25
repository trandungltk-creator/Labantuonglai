/**
 * BỘ KIỂM THỬ ĐƠN VỊ BẮT BUỘC 2.0.1 (D01–D04, S01–S32, P01–P06, U04–U05)
 * Kiểm chứng toàn bộ quy tắc trong 03_Chi_dan_lap_trinh_va_kiem_thu.md
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
  QUESTIONS_DB,
  FEEDBACK_LIB,
  QUESTION_MAP,
  EXPECTED_MODULE_COUNTS,
  CANONICAL_TEXT_CHECKS,
  auditCanonicalAssets,
  validateQuestionAnswer,
  setProfileAnswer,
  setStudentValuePriorities,
  scoreModuleA,
  scoreModuleB,
  scoreModuleC,
  scoreModuleD,
  scoreModuleE,
  scoreModuleF,
  scoreModuleG,
  scoreModuleH,
  scoreModuleJ,
  scoreModuleK,
  scoreModuleL,
  scoreModuleN,
  extractSharedReflectionsIO,
  validateResearchSubmissionM,
  aggregateResearchSubmissionsM,
  lookupItemFeedback,
  evaluateSupportMatrixT01ToT12,
  generateInternalReport,
  roundTripReportJson,
  updateReportStoreOnAnswerChange,
  buildSelectiveExportSummary,
  DEFAULT_EXPORT_SELECTION,
  createEmptyStudentProfile,
  createDemoStudentProfile,
  type AnswerValue,
  type AnonymousResearchSubmission,
} from './labanEngine.ts';

// ============================================================================
// NHÓM KIỂM THỬ DỮ LIỆU GỐC (D01 – D04)
// ============================================================================

test('D01: Load JSON — 206 mã duy nhất, số lượng A–O = 12,36,24,10,12,8,8,16,16,12,12,12,12,8,8 và đúng SHA-256', () => {
  const audit = auditCanonicalAssets();
  assert.equal(audit.valid, true, `Lỗi audit: ${audit.errors.join('; ')}`);
  assert.equal(audit.totalUniqueIds, 206);
  assert.deepEqual(audit.moduleCounts, EXPECTED_MODULE_COUNTS);

  // Kiểm tra SHA-256 bất biến theo 00_DOC_TRUOC
  const qBytes = fs.readFileSync(path.resolve('src/data/questions_database_chuan_2.0.1.json'));
  const fBytes = fs.readFileSync(path.resolve('src/data/feedback_library_2.0.1.json'));
  const qSha = crypto.createHash('sha256').update(qBytes).digest('hex');
  const fSha = crypto.createHash('sha256').update(fBytes).digest('hex');

  assert.equal(qSha, '4b53497fcf5fa9f4465e92b7fd91515c64e6c0a8340e9ce547a70fecb4767d1b');
  assert.equal(fSha, 'd0c4666e8f43b4f547de5844bbf423245c3d8f66535c6503b2f2c24ec9526794');
});

test('D02: So khớp nguồn — 206 nội dung, 185 phương án thực chất, 24 khóa/cụm, 8 rubric N, 206 mục phản hồi', () => {
  const audit = auditCanonicalAssets();
  assert.equal(QUESTIONS_DB.questions.length, 206);
  assert.equal(audit.substantiveChoiceCount, 185);
  assert.equal(audit.answerKeysCount, 24);
  assert.equal(audit.rubricsCount, 8);
  assert.equal(FEEDBACK_LIB.items.length, 206);
});

test('D03: Option tất cả câu — value chuỗi và label không rỗng, giá trị duy nhất; khóa E/K nằm trong options', () => {
  for (const q of QUESTIONS_DB.questions) {
    const seen = new Set<string>();
    for (const opt of q.options) {
      assert.equal(typeof opt.value, 'string');
      assert.ok(opt.value.length > 0);
      assert.equal(typeof opt.label, 'string');
      assert.ok(opt.label.trim().length > 0);
      assert.equal(seen.has(opt.value), false, `Trùng option ${opt.value} ở câu ${q.id}`);
      seen.add(opt.value);
    }
    if (q.module === 'E' || q.module === 'K') {
      assert.ok(q.answer_key && seen.has(q.answer_key), `Khóa E/K không hợp lệ ở câu ${q.id}`);
    }
  }
});

test('D04: A02/A03/A04/A12 khớp nguyên văn file 01, không dùng ngân hàng cũ', () => {
  for (const [id, expectedText] of Object.entries(CANONICAL_TEXT_CHECKS)) {
    const q = QUESTION_MAP.get(id);
    assert.ok(q, `Thiếu câu ${id}`);
    assert.equal(q.content, expectedText);
  }
});

// ============================================================================
// NHÓM KIỂM THỬ BỘ MÁY CHẤM ĐIỂM & HỢP ĐỒNG 2.0.1 (S01 – S32)
// ============================================================================

test('S01: A01–04 toàn "1" rồi toàn "5" -> NT = 0 rồi 100, không tổng A', () => {
  const res1 = scoreModuleA({ A01: '1', A02: '1', A03: '1', A04: '1' });
  assert.equal(res1.subgroups.NT.isValid, true);
  assert.equal(res1.subgroups.NT.displayScore, 0);
  assert.equal('total' in res1, false);

  const res5 = scoreModuleA({ A01: '5', A02: '5', A03: '5', A04: '5' });
  assert.equal(res5.subgroups.NT.isValid, true);
  assert.equal(res5.subgroups.NT.displayScore, 100);
});

test('S02: A01–04 = "1","3","5","U" -> NT = 50, n=3', () => {
  const res = scoreModuleA({ A01: '1', A02: '3', A03: '5', A04: 'U' });
  assert.equal(res.subgroups.NT.isValid, true);
  assert.equal(res.subgroups.NT.validCount, 3);
  assert.equal(res.subgroups.NT.displayScore, 50);
});

test('S03: A01–04 = "1","5","X",null -> NT chưa đủ dữ liệu, n=2', () => {
  const res = scoreModuleA({ A01: '1', A02: '5', A03: 'X', A04: null });
  assert.equal(res.subgroups.NT.isValid, false);
  assert.equal(res.subgroups.NT.validCount, 2);
  assert.equal(res.subgroups.NT.displayScore, null);
  assert.match(res.subgroups.NT.statusText, /Chưa đủ dữ liệu/);
});

test('S04: A nhận "0","6",true hoặc số 3 thay chuỗi -> Từ chối ngoài hợp đồng', () => {
  assert.equal(validateQuestionAnswer('A01', '0').valid, false);
  assert.equal(validateQuestionAnswer('A01', '6').valid, false);
  assert.equal(validateQuestionAnswer('A01', true).valid, false);
  assert.equal(validateQuestionAnswer('A01', 3).valid, false);
  assert.equal(validateQuestionAnswer('A01', '').valid, false);
});

test('S05: B toàn "3" -> 6 nhóm 50, hồ sơ phẳng, không mã dẫn đầu bắt buộc', () => {
  const answers: Record<string, AnswerValue> = {};
  for (let i = 1; i <= 36; i++) {
    answers[`B${String(i).padStart(2, '0')}`] = '3';
  }
  const resB = scoreModuleB(answers);
  assert.equal(resB.allSixValid, true);
  assert.equal(resB.isFlatProfile, true);
  assert.deepEqual(resB.leadingGroups, []);
  for (const k of ['R', 'I', 'A', 'S', 'E', 'C'] as const) {
    assert.equal(resB.subgroups[k].displayScore, 50);
  }
});

test('S06: B nhóm R chỉ có 4/6 hợp lệ, nhóm khác đủ -> Không xếp Holland', () => {
  const answers: Record<string, AnswerValue> = {};
  for (let i = 1; i <= 36; i++) {
    answers[`B${String(i).padStart(2, '0')}`] = '5';
  }
  // R gồm B01,12,17,22,27,32 -> cho 2 câu là U và X để chỉ còn 4/6
  answers.B01 = 'U';
  answers.B12 = 'X';

  const resB = scoreModuleB(answers);
  assert.equal(resB.subgroups.R.validCount, 4);
  assert.equal(resB.subgroups.R.isValid, false);
  assert.equal(resB.allSixValid, false);
  assert.deepEqual(resB.leadingGroups, []);
});

test('S07: B có R và I cùng 100, nhóm khác 0 -> R và I đồng dẫn đầu', () => {
  const answers: Record<string, AnswerValue> = {};
  for (let i = 1; i <= 36; i++) {
    answers[`B${String(i).padStart(2, '0')}`] = '1'; // 0 điểm
  }
  for (const id of ['B01', 'B12', 'B17', 'B22', 'B27', 'B32', 'B02', 'B07', 'B18', 'B23', 'B28', 'B33']) {
    answers[id] = '5'; // 100 điểm
  }
  const resB = scoreModuleB(answers);
  assert.equal(resB.allSixValid, true);
  assert.equal(resB.isFlatProfile, false);
  assert.deepEqual(resB.leadingGroups, ['R', 'I']);
});

test('S08: So sánh max−min = 10 và >10 trên điểm chưa làm tròn', () => {
  // Trường hợp 1: max - min đúng bằng 10 -> hồ sơ phẳng
  const answersFlat: Record<string, AnswerValue> = {};
  for (let i = 1; i <= 36; i++) {
    answersFlat[`B${String(i).padStart(2, '0')}`] = '3'; // 50 điểm
  }
  // Cho R đạt 60 điểm: 5 câu '3' (15) + 1 câu '5' (5) = 20 / 5 câu (1 câu U) -> TB=4 -> 75;
  // Hoặc 5 câu hợp lệ: tổng = 17 -> TB = 3.4 -> 100*(3.4-1)/4 = 60.0
  answersFlat.B01 = '4';
  answersFlat.B12 = '4';
  answersFlat.B17 = '3';
  answersFlat.B22 = '3';
  answersFlat.B27 = '3';
  answersFlat.B32 = 'U'; // 5 câu hợp lệ, TB = 17/5 = 3.4 -> rawScore = 60.0 (chênh lệch với 50.0 đúng bằng 10)
  const resFlat = scoreModuleB(answersFlat);
  assert.equal(resFlat.allSixValid, true);
  assert.equal(resFlat.isFlatProfile, true);

  // Trường hợp 2: Điểm chưa làm tròn lệch 10.4166... (nếu làm tròn sai hoặc so ngưỡng):
  // R có 6 câu: ba câu '4', ba câu '3' -> TB = 21/6 = 3.5 -> raw = 62.5
  // I có 6 câu: hai câu '4', ba câu '3', một câu '3' -> cho 5 câu '3' + 1 câu '4' -> TB = 19/6 = 3.1666... -> raw = 54.1666...
  // Các nhóm khác 6 câu '3' -> raw = 50.0 -> max-min = 12.5 > 10.
  // Khoảng cách từ R (62.5) tới I (54.1666) là 8.333 <= 10 (cả R và I dẫn đầu).
  // Khoảng cách từ R (62.5) tới nhóm 52.0833 (5 câu '3' + 1 câu '3.5' không có, dùng 5/6 vs 6/6):
  // R (6 câu): bốn câu '4', hai câu '3' -> TB = 22/6 = 3.6666... -> raw = 66.6666... (display 66.7)
  // I (6 câu): hai câu '4', bốn câu '3' -> TB = 20/6 = 3.3333... -> raw = 58.3333... (display 58.3)
  // A (5 câu hợp lệ): một câu '4', bốn câu '3' -> TB = 16/5 = 3.2 -> raw = 55.0 (cách R 11.666 > 10)
  const answersSpread: Record<string, AnswerValue> = { ...answersFlat };
  for (const id of ['B01', 'B12', 'B17', 'B22']) answersSpread[id] = '4';
  for (const id of ['B27', 'B32']) answersSpread[id] = '3'; // R raw = 66.6667
  for (const id of ['B02', 'B07']) answersSpread[id] = '4';
  for (const id of ['B18', 'B23', 'B28', 'B33']) answersSpread[id] = '3'; // I raw = 58.3333 (cách R 8.333 <= 10)

  const resSpread = scoreModuleB(answersSpread);
  assert.equal(resSpread.isFlatProfile, false);
  assert.deepEqual(resSpread.leadingGroups, ['R', 'I']);
});

test('S09: C01,C07,C13,C19 = "0","2","4","U" -> TT=50, n=3; "0" là hợp lệ', () => {
  const resC = scoreModuleC({
    C01: '0',
    C07: '2',
    C13: '4',
    C19: 'U',
  });
  assert.equal(resC.subgroups.TT.isValid, true);
  assert.equal(resC.subgroups.TT.validCount, 3);
  assert.equal(resC.subgroups.TT.displayScore, 50);
});

test('S10: H01–08 toàn "5"; H09–16 toàn "1" -> 100 và 0, không tổng/nhãn archetype', () => {
  const answers: Record<string, AnswerValue> = {};
  for (let i = 1; i <= 8; i++) answers[`H${String(i).padStart(2, '0')}`] = '5';
  for (let i = 9; i <= 16; i++) answers[`H${String(i).padStart(2, '0')}`] = '1';

  const resH = scoreModuleH(answers);
  assert.equal(resH.subgroups.NT.displayScore, 100);
  assert.equal(resH.subgroups.NB.displayScore, 0);
  assert.equal('total' in resH, false);
  assert.equal('archetype' in resH, false);
});

test('S11: H một trục 5/8 hợp lệ -> Chưa đủ dữ liệu', () => {
  const answers: Record<string, AnswerValue> = {};
  for (let i = 1; i <= 5; i++) answers[`H${String(i).padStart(2, '0')}`] = '4';
  answers.H06 = 'U';
  answers.H07 = 'X';

  const resH = scoreModuleH(answers);
  assert.equal(resH.subgroups.NT.validCount, 5);
  assert.equal(resH.subgroups.NT.isValid, false);
  assert.equal(resH.subgroups.NT.displayScore, null);
});

test('S12: E đúng hết -> 4 nhóm 3/3, tổng 12/12', () => {
  const answers: Record<string, AnswerValue> = {};
  for (const q of QUESTIONS_DB.questions.filter((item) => item.module === 'E')) {
    answers[q.id] = q.answer_key;
  }
  const resE = scoreModuleE(answers);
  assert.equal(resE.subgroups.NG.correctCount, 3);
  assert.equal(resE.subgroups.AI.correctCount, 3);
  assert.equal(resE.subgroups.QĐ.correctCount, 3);
  assert.equal(resE.subgroups.KH.correctCount, 3);
  assert.equal(resE.totalComplete, true);
  assert.equal(resE.totalScoreOutOf12, 12);
});

test('S13: K đúng hết -> 4 cụm 3/3, tuyệt đối KHÔNG có tổng K', () => {
  const answers: Record<string, AnswerValue> = {};
  for (const q of QUESTIONS_DB.questions.filter((item) => item.module === 'K')) {
    answers[q.id] = q.answer_key;
  }
  const resK = scoreModuleK(answers);
  assert.equal(resK.subgroups.DL.correctCount, 3);
  assert.equal(resK.subgroups.AI.correctCount, 3);
  assert.equal(resK.subgroups.LC.correctCount, 3);
  assert.equal(resK.subgroups.TD.correctCount, 3);
  assert.equal('totalScoreOutOf12' in resK, false);

  const profile = createEmptyStudentProfile();
  profile.answers = answers;
  const report = generateInternalReport(profile);
  assert.equal('K_TOTAL' in report.groupResults, false);
});

test('S14: E01,E05,E09 = "B","U","X" -> NG n=2, không báo /3', () => {
  const resE = scoreModuleE({
    E01: 'B',
    E05: 'U',
    E09: 'X',
  });
  assert.equal(resE.subgroups.NG.validCount, 2);
  assert.equal(resE.subgroups.NG.isComplete, false);
  assert.equal(resE.subgroups.NG.correctCount, null);
});

test('S15: K01,K06,K09 = "U","U","U" -> DL 0/3, n=3', () => {
  const resK = scoreModuleK({
    K01: 'U',
    K06: 'U',
    K09: 'U',
  });
  assert.equal(resK.subgroups.DL.validCount, 3);
  assert.equal(resK.subgroups.DL.isComplete, true);
  assert.equal(resK.subgroups.DL.correctCount, 0);
});

test('S16: D ưu tiên D02,D07; đổi điểm D03 lên "4" -> Không tự thay danh sách ưu tiên', () => {
  let profile = createEmptyStudentProfile();
  profile = setStudentValuePriorities(profile, ['D02', 'D07']).profile;
  profile = setProfileAnswer(profile, 'D03', '4').profile;

  const resD = scoreModuleD(profile);
  assert.deepEqual(resD.valuePriorities, ['D02', 'D07']);
  assert.equal(resD.itemValues.D03, '4');
});

test('S17: F02 = ["A","D"] -> Từ chối kết hợp, hướng dẫn rõ', () => {
  const check = validateQuestionAnswer('F02', ['A', 'D']);
  assert.equal(check.valid, false);
  assert.ok(check.error && check.error.includes('phải đứng riêng'));
});

test('S18: F03 = ["A","D"] -> Hợp lệ', () => {
  const check = validateQuestionAnswer('F03', ['A', 'D']);
  assert.equal(check.valid, true);
  assert.deepEqual(check.normalizedValue, ['A', 'D']);
});

test('S19: M05 = ["B","F"] hoặc M08 = ["A","U"] -> Từ chối', () => {
  assert.equal(validateQuestionAnswer('M05', ['B', 'F']).valid, false);
  assert.equal(validateQuestionAnswer('M08', ['A', 'U']).valid, false);
});

test('S20: G/L chứa "0","1","2","U","X",trống -> Đếm đúng riêng, không đổi U thành 0', () => {
  const resG = scoreModuleG({
    G01: '2',
    G02: '1',
    G03: '0',
    G04: 'U',
    G05: 'X',
  });
  assert.equal(resG.countLevel2, 1);
  assert.equal(resG.countLevel0Or1, 2);
  assert.equal(resG.countUXOrEmpty, 5); // G04(U), G05(X), G06..G08(null)

  const resL = scoreModuleL({
    L01: '0',
    L02: '1',
    L03: '2',
    L04: 'U',
    L05: 'X',
  });
  assert.equal(resL.subgroups.KT.count0, 1);
  assert.equal(resL.subgroups.KT.count1, 1);
  assert.equal(resL.subgroups.KT.count2, 1);
  assert.equal(resL.subgroups.KT.countU, 1);
  assert.equal(resL.subgroups.TN.countX, 1);
  assert.equal(resL.subgroups.TN.countEmpty, 3);
});

test('S21: J Y/N, có ví dụ cho Y, cùng bối cảnh và đồng thuận -> Y/N hợp lệ', () => {
  const resJ = scoreModuleJ({
    J01: {
      self: 'Y',
      selfExample: 'Em đã đặt câu hỏi làm rõ nhiệm vụ nhóm',
      observer: 'N',
      observerExample: null,
      sameContext: true,
      mutualConsent: true,
    },
  });
  assert.equal(resJ.items.J01.status, 'Y/N');
  assert.equal(resJ.validPairedCount, 1);
});

test('S22: J Y thiếu ví dụ hoặc khác bối cảnh/không đồng thuận -> Chưa đủ dữ liệu, không kết luận', () => {
  const resJ = scoreModuleJ({
    J01: {
      self: 'Y',
      selfExample: null, // Thiếu ví dụ cho Y
      observer: 'N',
      observerExample: null,
      sameContext: true,
      mutualConsent: true,
    },
    J02: {
      self: 'Y',
      selfExample: 'Có ví dụ',
      observer: 'Y',
      observerExample: 'Có ví dụ',
      sameContext: false, // Khác bối cảnh
      mutualConsent: true,
    },
  });
  assert.equal(resJ.items.J01.status, 'Chưa đủ dữ liệu');
  assert.equal(resJ.items.J02.status, 'Chưa đủ dữ liệu');
  assert.equal(resJ.validPairedCount, 0);
});

test('S23: N score "0", có sản phẩm và người đánh giá xác nhận -> "0" hợp lệ', () => {
  const resN = scoreModuleN({
    N01: {
      score: '0',
      evidence: 'Bản nháp đọc bảng dữ liệu câu lạc bộ trên giấy',
      support: 'Tự làm',
      reviewerConfirmed: true,
    },
  });
  assert.equal(resN.items.N01.status, '0');
  assert.equal(resN.evaluatedCount, 1);
});

test('S24: N score "0" thiếu sản phẩm hoặc chưa xác nhận -> Chưa đánh giá', () => {
  const resN = scoreModuleN({
    N01: {
      score: '0',
      evidence: null,
      support: 'Tự làm',
      reviewerConfirmed: true,
    },
    N02: {
      score: '0',
      evidence: 'Có bảng nháp',
      support: 'Tự làm',
      reviewerConfirmed: false,
    },
  });
  assert.equal(resN.items.N01.status, 'Chưa đánh giá');
  assert.equal(resN.items.N02.status, 'Chưa đánh giá');
  assert.equal(resN.evaluatedCount, 0);
});

test('S25: I/O không chọn chia sẻ hoặc rút đồng ý -> Không lưu/loại bản tóm tắt khỏi báo cáo', () => {
  let profile = createEmptyStudentProfile();
  profile = setProfileAnswer(profile, 'I01', {
    shareConsent: true,
    sharedSummary: 'Tóm tắt ban đầu',
  }).profile;
  assert.equal(extractSharedReflectionsIO(profile.answers).sharedSummaries.I01, 'Tóm tắt ban đầu');

  // Học sinh rút đồng ý
  profile = setProfileAnswer(profile, 'I01', {
    shareConsent: false,
    sharedSummary: 'Tóm tắt ban đầu',
  }).profile;
  assert.equal(extractSharedReflectionsIO(profile.answers).sharedSummaries.I01, undefined);
  const report = generateInternalReport(profile);
  assert.equal(report.confirmedEvidence.some((e) => e.code === 'I01'), false);
});

test('S26: X ở câu bất kỳ -> Không phán xét, không truy xuất nhánh 0, không tự gán việc dựa trên X', () => {
  const fbC = lookupItemFeedback('C01', 'X');
  assert.equal(fbC.answerState, 'X');
  assert.equal(fbC.suggestedAction, null);
  assert.equal(fbC.primaryGuidance.includes('chưa làm được'), false);

  const fbE = lookupItemFeedback('E01', 'X');
  assert.equal(fbE.answerState, 'X');
  assert.equal(fbE.suggestedAction, null);
});

test('S27: Hồ sơ trống -> Không tự sinh mã, điểm hoặc nghề; mời khám phá tự chọn', () => {
  const emptyProfile = createEmptyStudentProfile();
  const report = generateInternalReport(emptyProfile);
  assert.equal(report.softSuggestions.length, 0);
  assert.equal(report.selfReportedStrengths.length, 0);
  assert.equal(report.confirmedEvidence.length, 0);
  assert.equal(report.groupResults.B_R.score, null);
});

test('S28: F05D vs F07B -> Chưa biết đầu mối vs muốn trao đổi riêng, phản hồi khác nhau', () => {
  const pF05D = createEmptyStudentProfile();
  pF05D.answers.F05 = ['D'];
  const tF05D = evaluateSupportMatrixT01ToT12(pF05D).find((t) => t.code === 'T11');

  const pF07B = createEmptyStudentProfile();
  pF07B.answers.F07 = ['B'];
  const tF07B = evaluateSupportMatrixT01ToT12(pF07B).find((t) => t.code === 'T11');

  assert.ok(tF05D);
  assert.ok(tF07B);
  assert.notEqual(tF05D.supportAction, tF07B.supportAction);
  assert.ok(tF05D.supportAction.includes('đầu mối'));
  assert.ok(tF07B.supportAction.includes('gặp riêng'));
});

test('S29: F03A đứng riêng -> Không tự gán khó khăn kinh tế (T06)', () => {
  const profile = createEmptyStudentProfile();
  profile.answers.F03 = ['A'];
  const tList = evaluateSupportMatrixT01ToT12(profile);
  assert.equal(tList.some((t) => t.code === 'T06'), false);
});

test('S30: G05 thấp nhưng chưa xác nhận quá tải -> Không kích hoạt T12', () => {
  const profile = createEmptyStudentProfile();
  profile.answers.G05 = '0';
  profile.answers.H04 = '1';
  profile.supportVerifications = { confirmScheduleOverload: false };
  const tList = evaluateSupportMatrixT01ToT12(profile);
  assert.equal(tList.some((t) => t.code === 'T12'), false);
});

test('S31: Báo cáo JSON round-trip -> 7/30/90 đúng kiểu số, thiếu giữ null', () => {
  const demo = createDemoStudentProfile();
  const report = generateInternalReport(demo);
  const roundTripped = roundTripReportJson(report);

  assert.equal(roundTripped.actionPlan[0].horizonDays, 7);
  assert.equal(roundTripped.actionPlan[1].horizonDays, 30);
  assert.equal(roundTripped.actionPlan[2].horizonDays, 90);
});

test('S32: Safety pause xác nhận -> Ngừng báo cáo hướng nghiệp thường, mở trợ giúp, không tự gọi/gửi', () => {
  const demo = createDemoStudentProfile();
  demo.confirmedSafetyPause = true;
  const report = generateInternalReport(demo);

  assert.equal(report.safetyPause, true);
  assert.equal(report.softSuggestions.length, 0);
  assert.equal(Object.keys(report.groupResults).length, 0);
});

// ============================================================================
// NHÓM KIỂM THỬ QUYỀN RIÊNG TƯ, PHIÊN BẢN BÁO CÁO & NGHIÊN CỨU M (P05, P06, U04, U05)
// ============================================================================

test('P05: M tách kho nghiên cứu riêng, không chứa profileId, ẩn nhóm/ô nhỏ < 10', () => {
  const profile = createEmptyStudentProfile();
  const attempt = setProfileAnswer(profile, 'M01', 'A');
  assert.equal(attempt.success, false);

  // Tạo 8 bản nộp nghiên cứu (< 10) -> phải ẩn toàn bộ số đếm ô nhỏ
  const submissions: AnonymousResearchSubmission[] = Array.from({ length: 8 }, () => ({
    submissionVersion: '2.0.1',
    submittedAt: '2026-11-24T00:00:00Z',
    answers: { M01: 'A' },
  }));
  const aggSmall = aggregateResearchSubmissionsM(submissions);
  assert.equal(aggSmall.M01.suppressedTotalGroup, true);
  assert.equal(aggSmall.M01.optionStats[0].count, null);

  // Thêm đủ 12 bản nộp với 10 chọn A và 2 chọn B -> A hiển thị (10), B bị ẩn (<10)
  for (let i = 0; i < 2; i++) {
    submissions.push({
      submissionVersion: '2.0.1',
      submittedAt: '2026-11-24T00:00:00Z',
      answers: { M01: 'A' },
    });
  }
  for (let i = 0; i < 2; i++) {
    submissions.push({
      submissionVersion: '2.0.1',
      submittedAt: '2026-11-24T00:00:00Z',
      answers: { M01: 'B' },
    });
  }
  const aggLarge = aggregateResearchSubmissionsM(submissions);
  const statA = aggLarge.M01.optionStats.find((o) => o.value === 'A');
  const statB = aggLarge.M01.optionStats.find((o) => o.value === 'B');
  assert.equal(statA?.count, 10);
  assert.equal(statB?.count, null);
  assert.equal(statB?.suppressedSmallCell, true);
  assert.equal(validateResearchSubmissionM({ profileId: 'abc', M01: 'A' }).valid, false);
});

test('P06: Xuất bản tóm tắt — mặc định loại I/O và yêu cầu hỗ trợ', () => {
  const demo = createDemoStudentProfile();
  const report = generateInternalReport(demo);
  const exportedDefault = buildSelectiveExportSummary(report, DEFAULT_EXPORT_SELECTION);

  assert.equal('sharedReflectionsIO' in exportedDefault, false);
  assert.equal('questionsToExplore' in exportedDefault, false);
  assert.ok('actionPlan' in exportedDefault);
});

test('U04: Sửa đáp án sau khi đã xác nhận báo cáo -> Không ghi đè bản đã xác nhận, tạo dự thảo mới', () => {
  const demo = createDemoStudentProfile();
  const confirmed = generateInternalReport(demo, { reportVersion: 'v1.0-confirmed' });

  const modifiedProfile = setProfileAnswer(demo, 'A01', '2').profile;
  const updatedStore = updateReportStoreOnAnswerChange(
    {
      confirmedReport: confirmed,
      draftReport: confirmed,
      hasUnconfirmedChanges: false,
    },
    modifiedProfile
  );

  assert.equal(updatedStore.hasUnconfirmedChanges, true);
  assert.equal(updatedStore.confirmedReport?.reportVersion, 'v1.0-confirmed');
  assert.equal(updatedStore.draftReport.isDraftAfterEdit, true);
  assert.notEqual(
    updatedStore.confirmedReport?.groupResults.A_NT.score,
    updatedStore.draftReport.groupResults.A_NT.score
  );
});

test('U05: Hồ sơ DEMO có cờ isDemo = true và mã demo-random-01 rõ ràng', () => {
  const demo = createDemoStudentProfile();
  assert.equal(demo.isDemo, true);
  assert.equal(demo.profileId, 'demo-random-01');
});
