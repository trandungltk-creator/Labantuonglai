/**
 * LA BÀN TƯƠNG LAI — BỘ MÁY CHẤM ĐIỂM, PHẢN HỒI, MA TRẬN T01–T12 VÀ HỢP ĐỒNG BÁO CÁO 2.0.1
 * Nguồn sự thật bất biến:
 * - questions_database_chuan_2.0.1.json (Phiếu 2.0, Quy tắc 2.0.1)
 * - feedback_library_2.0.1.json (Thư viện phản hồi 206 mục)
 * - 03_Chi_dan_lap_trinh_va_kiem_thu.md
 * - 02_Thiet_ke_UI_UX_va_y_tuong_nhan_van.md
 *
 * CAM KẾT KỸ THUẬT:
 * - 100% Ngoại tuyến (Offline), Rule-based, Zero Runtime AI / Gemini API / Telemetry.
 * - Mọi option value là chuỗi ("0"–"5", "A"–"G", "Y", "N", "U", "X").
 * - Không sửa đổi mã câu hỏi, câu chữ, phương án, khóa, nhóm hoặc rubric.
 */

import rawQuestionsDb from '../data/questions_database_chuan_2.0.1.json';
import rawFeedbackLib from '../data/feedback_library_2.0.1.json';

// ============================================================================
// 1. KIỂU DỮ LIỆU NGUỒN (IMMUTABLE ASSET SCHEMA)
// ============================================================================

export type ModuleId =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O';

export type QuestionType =
  | 'scale'
  | 'single_choice'
  | 'multi_choice'
  | 'paired_observation'
  | 'practice_rubric'
  | 'private_reflection';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface PracticeRubric {
  level_0: string;
  level_1: string;
  level_2: string;
}

export interface QuestionItem {
  id: string;
  module: ModuleId;
  subgroup: string | null;
  content: string;
  type: QuestionType;
  options: QuestionOption[];
  exclusive_values: string[];
  answer_key: string | null;
  rubric: string | null;
}

export interface ModuleMetadata {
  id: ModuleId;
  name: string;
  item_count: number;
  instruction: string;
}

export interface QuestionsDatabase201 {
  schema_version: string;
  question_version: string;
  rule_version: string;
  total_items: number;
  modules: ModuleMetadata[];
  questions: QuestionItem[];
}

export interface FeedbackBranch {
  label: string;
  guidance: string;
}

export interface FeedbackItem {
  id: string;
  branches: FeedbackBranch[];
}

export interface FeedbackLibrary201 {
  rule_version: string;
  items: FeedbackItem[];
}

export const QUESTIONS_DB: QuestionsDatabase201 = rawQuestionsDb as QuestionsDatabase201;
export const FEEDBACK_LIB: FeedbackLibrary201 = rawFeedbackLib as FeedbackLibrary201;

// Map tra cứu nhanh theo ID
export const QUESTION_MAP: ReadonlyMap<string, QuestionItem> = new Map(
  QUESTIONS_DB.questions.map((q) => [q.id, q])
);

export const FEEDBACK_MAP: ReadonlyMap<string, FeedbackItem> = new Map(
  FEEDBACK_LIB.items.map((f) => [f.id, f])
);

// ============================================================================
// 2. HỢP ĐỒNG CÂU TRẢ LỜI & HỒ SƠ HỌC SINH (DATA CONTRACT)
// ============================================================================

export interface PairedObservationAnswer {
  self: string | null; // "Y" | "N" | "U" | "X" | null
  selfExample: string | null;
  observer: string | null; // "Y" | "N" | "U" | "X" | null
  observerExample: string | null;
  sameContext: boolean;
  mutualConsent: boolean;
}

export interface PracticeRubricAnswer {
  score: string | null; // "0" | "1" | "2" | "U" | "X" | null
  evidence: string | null;
  support: string | null;
  reviewerConfirmed: boolean;
}

export interface PrivateReflectionAnswer {
  shareConsent: boolean;
  sharedSummary: string | null;
  keepOnPaperOnly?: boolean;
  localPrivateNote?: string | null; // Không bao giờ đưa vào báo cáo hoặc tự động quét
}

export type AnswerValue =
  | string
  | string[]
  | PairedObservationAnswer
  | PracticeRubricAnswer
  | PrivateReflectionAnswer
  | null;

export interface SupportVerifications {
  confirmLowOpportunityForB?: boolean; // T01
  confirmDislikeTaskForC?: boolean; // T02
  confirmExploreTwoActivitiesForFlatB?: boolean; // T03
  confirmWantClarifyAOrH?: boolean; // T04
  confirmPrivateDialogueForJ?: boolean; // T05
  confirmFinancialDifficulty?: boolean; // T06
  confirmNeedInfoSupport?: boolean; // T07
  confirmWantProceedG?: boolean; // T08
  confirmTryVariantForN?: boolean; // T09
  confirmVoluntaryLongTermDifficulty?: boolean; // T10
  confirmConnectCounselorF05F07?: boolean; // T11
  confirmScheduleOverload?: boolean; // T12
}

export type ActionTaskStatus =
  | 'dự thảo'
  | 'đã chọn'
  | 'đang làm'
  | 'đã thử'
  | 'cần điều chỉnh'
  | 'bỏ qua';

export interface ActionPlanItem {
  id: string;
  horizonDays: 7 | 30 | 90;
  task: string;
  evidence: string;
  dueDate: string | null;
  support: string;
  adjustment: string;
  status: ActionTaskStatus;
}

export interface EvidencePassportItem {
  id: string;
  title: string;
  date: string;
  relatedCode: string;
  whatIDid: string;
  conditionsAndSupport: string;
  result: string;
  learned: string;
  nextStep: string;
}

export interface MeaningfulDayEntry {
  id: string;
  date: string;
  promptId: string;
  reflection: string;
  keepOnPaper: boolean;
}

export interface EmpathyTriangleSheet {
  studentWants: string;
  familyCares: string;
  verifiedCostAndInfo: string;
  agreedMicroStep: string;
  reviewDate: string;
  safeToShareWithFamily: boolean;
}

export interface SourceVerificationRecord {
  id: string;
  directionTitle: string;
  source1Name: string;
  source1Date: string;
  source1Scope: string;
  source2Name: string;
  source2Date: string;
  source2Scope: string;
  scenarioBaseline: string;
  scenarioTechChange: string;
  scenarioResourceChange: string;
}

export interface StudentReviewState {
  accurateParts: string;
  partsToEdit: string;
  additions: string;
  privateParts: string;
  decision: 'Đồng ý' | 'Còn phân vân' | 'Chỉnh lại' | 'Không sử dụng gợi ý' | null;
  confirmedAt: string | null;
}

export interface StudentProfileContract {
  questionVersion: '2.0';
  ruleVersion: '2.0.1';
  profileId: string;
  grade: '10' | '11' | '12' | null;
  isDemo?: boolean;
  answers: Record<string, AnswerValue>;
  valuePriorities: string[]; // Tối đa 3 mã D01..D10, không tự động sắp xếp lại
  boundary: string | null;
  confirmedSafetyPause: boolean;
  supportVerifications?: SupportVerifications;
  actionPlan?: ActionPlanItem[];
  studentReview?: StudentReviewState;
  careerChoices?: Record<string, 'Muốn thử' | 'Còn phân vân' | 'Không phù hợp' | 'Em có hướng khác'>;
  customCareerDirection?: string | null;
  laBan14CompletedIds?: number[];
  evidencePassport?: EvidencePassportItem[];
  meaningfulDays?: MeaningfulDayEntry[];
  empathyTriangle?: EmpathyTriangleSheet;
  sourceVerifications?: SourceVerificationRecord[];
}

// ============================================================================
// 3. KIỂM ĐỊNH TOÀN VẸN NGÂN HÀNG D01–D04
// ============================================================================

export interface AssetAuditResult {
  valid: boolean;
  totalUniqueIds: number;
  moduleCounts: Record<ModuleId, number>;
  substantiveChoiceCount: number; // 185 phương án A–G thực chất ở E, F, K, M
  answerKeysCount: number; // 24 khóa E và K
  rubricsCount: number; // 8 rubric N
  feedbackItemsCount: number; // 206 mục phản hồi
  errors: string[];
}

export const EXPECTED_MODULE_COUNTS: Record<ModuleId, number> = {
  A: 12,
  B: 36,
  C: 24,
  D: 10,
  E: 12,
  F: 8,
  G: 8,
  H: 16,
  I: 16,
  J: 12,
  K: 12,
  L: 12,
  M: 12,
  N: 8,
  O: 8,
};

export const CANONICAL_TEXT_CHECKS: Record<string, string> = {
  A02: 'Em nhận ra những hoạt động khiến mình muốn tiếp tục tìm hiểu.',
  A03: 'Em có thể chỉ ra điều mình cần luyện thêm mà không tự hạ thấp bản thân.',
  A04: 'Em nhận ra khi nào lựa chọn của mình chịu ảnh hưởng từ người khác.',
  A12: 'Em có thể bày tỏ mong muốn của mình với một người lớn đáng tin cậy.',
};

export function auditCanonicalAssets(): AssetAuditResult {
  const errors: string[] = [];
  const seenIds = new Set<string>();
  const moduleCounts: Record<ModuleId, number> = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
    G: 0,
    H: 0,
    I: 0,
    J: 0,
    K: 0,
    L: 0,
    M: 0,
    N: 0,
    O: 0,
  };

  let substantiveChoiceCount = 0;
  let answerKeysCount = 0;
  let rubricsCount = 0;

  if (QUESTIONS_DB.question_version !== '2.0' || QUESTIONS_DB.rule_version !== '2.0.1') {
    errors.push(`Sai phiên bản ngân hàng: ${QUESTIONS_DB.question_version} / ${QUESTIONS_DB.rule_version}`);
  }

  for (const q of QUESTIONS_DB.questions) {
    if (seenIds.has(q.id)) {
      errors.push(`Trùng mã câu hỏi: ${q.id}`);
    }
    seenIds.add(q.id);

    if (moduleCounts[q.module] !== undefined) {
      moduleCounts[q.module] += 1;
    } else {
      errors.push(`Module không hợp lệ ở câu ${q.id}: ${q.module}`);
    }

    if (!q.content || typeof q.content !== 'string' || q.content.trim() === '') {
      errors.push(`Nội dung rỗng ở câu ${q.id}`);
    }

    const optValues = new Set<string>();
    for (const opt of q.options) {
      if (typeof opt.value !== 'string' || opt.value.trim() === '') {
        errors.push(`Option value không phải chuỗi hợp lệ ở câu ${q.id}`);
      }
      if (typeof opt.label !== 'string' || opt.label.trim() === '') {
        errors.push(`Option label rỗng ở câu ${q.id} (${opt.value})`);
      }
      if (optValues.has(opt.value)) {
        errors.push(`Trùng option value ${opt.value} ở câu ${q.id}`);
      }
      optValues.add(opt.value);

      if (
        (q.module === 'E' || q.module === 'F' || q.module === 'K' || q.module === 'M') &&
        opt.value !== 'U' &&
        opt.value !== 'X'
      ) {
        substantiveChoiceCount += 1;
      }
    }

    if (q.module === 'E' || q.module === 'K') {
      if (!q.answer_key || !optValues.has(q.answer_key)) {
        errors.push(`Khóa đáp án không hợp lệ ở câu ${q.id}: ${q.answer_key}`);
      } else {
        answerKeysCount += 1;
      }
    }

    if (q.module === 'N') {
      if (typeof q.rubric !== 'string' || q.rubric.trim() === '') {
        errors.push(`Thiếu rubric ở câu ${q.id}`);
      } else {
        rubricsCount += 1;
      }
    }
  }

  for (const [mod, expected] of Object.entries(EXPECTED_MODULE_COUNTS) as [ModuleId, number][]) {
    if (moduleCounts[mod] !== expected) {
      errors.push(`Số lượng câu module ${mod} sai: ${moduleCounts[mod]} (kỳ vọng ${expected})`);
    }
  }

  for (const [qid, expectedText] of Object.entries(CANONICAL_TEXT_CHECKS)) {
    const q = QUESTION_MAP.get(qid);
    if (!q || q.content !== expectedText) {
      errors.push(`Câu ${qid} không khớp nguyên văn chuẩn 2.0.1.`);
    }
  }

  if (seenIds.size !== 206) {
    errors.push(`Tổng số mã duy nhất là ${seenIds.size}, kỳ vọng 206.`);
  }
  if (substantiveChoiceCount !== 185) {
    errors.push(`Tổng số phương án thực chất E/F/K/M là ${substantiveChoiceCount}, kỳ vọng 185.`);
  }
  if (answerKeysCount !== 24) {
    errors.push(`Tổng số khóa E/K là ${answerKeysCount}, kỳ vọng 24.`);
  }
  if (rubricsCount !== 8) {
    errors.push(`Tổng số rubric N là ${rubricsCount}, kỳ vọng 8.`);
  }
  if (FEEDBACK_LIB.items.length !== 206) {
    errors.push(`Thư viện phản hồi có ${FEEDBACK_LIB.items.length} mục, kỳ vọng 206.`);
  }

  return {
    valid: errors.length === 0,
    totalUniqueIds: seenIds.size,
    moduleCounts,
    substantiveChoiceCount,
    answerKeysCount,
    rubricsCount,
    feedbackItemsCount: FEEDBACK_LIB.items.length,
    errors,
  };
}

// ============================================================================
// 4. KIỂM TRA HỢP ĐỒNG CÂU TRẢ LỜI (VALIDATION & EXCLUSIVE VALUES)
// ============================================================================

export interface AnswerValidationResult {
  valid: boolean;
  error?: string;
  normalizedValue?: AnswerValue;
}

export function validateQuestionAnswer(questionId: string, rawValue: unknown): AnswerValidationResult {
  const q = QUESTION_MAP.get(questionId);
  if (!q) {
    return { valid: false, error: `Mã câu hỏi không tồn tại trong ngân hàng 2.0.1: ${questionId}` };
  }

  // Trường hợp chưa trả lời / xóa câu trả lời
  if (rawValue === null || rawValue === undefined) {
    return { valid: true, normalizedValue: null };
  }

  const allowedOptionValues = new Set(q.options.map((o) => o.value));

  // 1. Scale hoặc Single choice (A, B, C, D, E, F01, G, H, K, L, M đơn)
  if (q.type === 'scale' || q.type === 'single_choice') {
    if (typeof rawValue !== 'string') {
      return {
        valid: false,
        error: `Câu ${questionId} chỉ nhận giá trị chuỗi (string), từ chối kiểu ${typeof rawValue}.`,
      };
    }
    if (rawValue === '') {
      return {
        valid: false,
        error: `Câu ${questionId} không nhận chuỗi rỗng; dùng null khi chưa trả lời.`,
      };
    }
    if (!allowedOptionValues.has(rawValue)) {
      return {
        valid: false,
        error: `Giá trị "${rawValue}" nằm ngoài miền hợp lệ của câu ${questionId} (${Array.from(allowedOptionValues).join(', ')}).`,
      };
    }
    return { valid: true, normalizedValue: rawValue };
  }

  // 2. Multi choice (F02–F08, M05, M06, M08, M10)
  if (q.type === 'multi_choice') {
    if (!Array.isArray(rawValue)) {
      return {
        valid: false,
        error: `Câu nhiều lựa chọn ${questionId} bắt buộc lưu dạng mảng chuỗi (string[]).`,
      };
    }
    if (rawValue.length === 0) {
      return { valid: true, normalizedValue: null };
    }
    const seen = new Set<string>();
    for (const item of rawValue) {
      if (typeof item !== 'string' || item === '') {
        return {
          valid: false,
          error: `Phần tử trong câu ${questionId} phải là chuỗi không rỗng.`,
        };
      }
      if (!allowedOptionValues.has(item)) {
        return {
          valid: false,
          error: `Lựa chọn "${item}" không hợp lệ cho câu ${questionId}.`,
        };
      }
      seen.add(item);
    }

    const uniqueSelections = Array.from(seen);
    const exclusiveSet = new Set(q.exclusive_values || []);
    const selectedExclusives = uniqueSelections.filter((v) => exclusiveSet.has(v));

    if (selectedExclusives.length > 0 && uniqueSelections.length > 1) {
      const exLabels = selectedExclusives
        .map((val) => {
          const opt = q.options.find((o) => o.value === val);
          return opt ? `${val} (${opt.label})` : val;
        })
        .join(', ');
      return {
        valid: false,
        error: `Ở câu ${questionId}, phương án loại trừ [${exLabels}] phải đứng riêng, không thể chọn kèm phương án khác.`,
      };
    }

    return { valid: true, normalizedValue: uniqueSelections };
  }

  // 3. Paired observation (J01–J12)
  if (q.type === 'paired_observation') {
    if (typeof rawValue !== 'object' || Array.isArray(rawValue)) {
      return { valid: false, error: `Câu ${questionId} yêu cầu đối tượng quan sát cặp (PairedObservationAnswer).` };
    }
    const obj = rawValue as Record<string, unknown>;
    const selfVal = obj.self === null || obj.self === undefined ? null : obj.self;
    const obsVal = obj.observer === null || obj.observer === undefined ? null : obj.observer;

    if (selfVal !== null && (typeof selfVal !== 'string' || !allowedOptionValues.has(selfVal))) {
      return { valid: false, error: `Giá trị self ở câu ${questionId} không hợp lệ.` };
    }
    if (obsVal !== null && (typeof obsVal !== 'string' || !allowedOptionValues.has(obsVal))) {
      return { valid: false, error: `Giá trị observer ở câu ${questionId} không hợp lệ.` };
    }
    if (typeof obj.sameContext !== 'boolean' || typeof obj.mutualConsent !== 'boolean') {
      return { valid: false, error: `Câu ${questionId} cần cờ boolean sameContext và mutualConsent.` };
    }

    return {
      valid: true,
      normalizedValue: {
        self: selfVal as string | null,
        selfExample: typeof obj.selfExample === 'string' && obj.selfExample.trim() !== '' ? obj.selfExample.trim() : null,
        observer: obsVal as string | null,
        observerExample:
          typeof obj.observerExample === 'string' && obj.observerExample.trim() !== ''
            ? obj.observerExample.trim()
            : null,
        sameContext: obj.sameContext,
        mutualConsent: obj.mutualConsent,
      },
    };
  }

  // 4. Practice rubric (N01–N08)
  if (q.type === 'practice_rubric') {
    if (typeof rawValue !== 'object' || Array.isArray(rawValue)) {
      return { valid: false, error: `Câu ${questionId} yêu cầu đối tượng PracticeRubricAnswer.` };
    }
    const obj = rawValue as Record<string, unknown>;
    const scoreVal = obj.score === null || obj.score === undefined ? null : obj.score;
    if (scoreVal !== null && (typeof scoreVal !== 'string' || !allowedOptionValues.has(scoreVal))) {
      return { valid: false, error: `Mức điểm "${String(scoreVal)}" không hợp lệ ở bài thử nghề ${questionId}.` };
    }
    if (typeof obj.reviewerConfirmed !== 'boolean') {
      return { valid: false, error: `Bài thử nghề ${questionId} yêu cầu trường boolean reviewerConfirmed.` };
    }
    return {
      valid: true,
      normalizedValue: {
        score: scoreVal as string | null,
        evidence: typeof obj.evidence === 'string' && obj.evidence.trim() !== '' ? obj.evidence.trim() : null,
        support: typeof obj.support === 'string' && obj.support.trim() !== '' ? obj.support.trim() : null,
        reviewerConfirmed: obj.reviewerConfirmed,
      },
    };
  }

  // 5. Private reflection (I01–I16, O01–O08)
  if (q.type === 'private_reflection') {
    if (typeof rawValue !== 'object' || Array.isArray(rawValue)) {
      return { valid: false, error: `Câu tự vấn ${questionId} yêu cầu đối tượng PrivateReflectionAnswer.` };
    }
    const obj = rawValue as Record<string, unknown>;
    if (typeof obj.shareConsent !== 'boolean') {
      return { valid: false, error: `Câu tự vấn ${questionId} yêu cầu cờ shareConsent kiểu boolean.` };
    }
    const shareConsent = obj.shareConsent;
    const rawSummary =
      typeof obj.sharedSummary === 'string' && obj.sharedSummary.trim() !== '' ? obj.sharedSummary.trim() : null;

    // Quy tắc S25: Nếu không chọn chia sẻ hoặc rút đồng ý, tuyệt đối không giữ sharedSummary
    return {
      valid: true,
      normalizedValue: {
        shareConsent,
        sharedSummary: shareConsent ? rawSummary : null,
        keepOnPaperOnly: typeof obj.keepOnPaperOnly === 'boolean' ? obj.keepOnPaperOnly : !shareConsent,
        localPrivateNote:
          typeof obj.localPrivateNote === 'string' && obj.localPrivateNote.trim() !== ''
            ? obj.localPrivateNote
            : null,
      },
    };
  }

  return { valid: false, error: `Kiểu câu hỏi không xác định: ${q.type}` };
}

/**
 * Helper thiết lập câu trả lời vào hồ sơ cá nhân (Tự động từ chối M01–M12 vì M tách kho riêng).
 */
export function setProfileAnswer(
  profile: StudentProfileContract,
  questionId: string,
  rawValue: unknown
): { success: boolean; error?: string; profile: StudentProfileContract } {
  const q = QUESTION_MAP.get(questionId);
  if (!q) {
    return { success: false, error: `Không tìm thấy mã câu hỏi ${questionId}.`, profile };
  }
  if (q.module === 'M') {
    return {
      success: false,
      error: `Phân hệ M (${questionId}) thuộc kho nghiên cứu độc lập, tuyệt đối không lưu vào hồ sơ cá nhân.`,
      profile,
    };
  }

  const validation = validateQuestionAnswer(questionId, rawValue);
  if (!validation.valid) {
    return { success: false, error: validation.error, profile };
  }

  const nextAnswers = { ...profile.answers };
  if (validation.normalizedValue === null || validation.normalizedValue === undefined) {
    delete nextAnswers[questionId];
  } else {
    nextAnswers[questionId] = validation.normalizedValue;
  }

  // Lưu ý S16: Khi đổi điểm D, tuyệt đối KHÔNG tự động thay đổi danh sách valuePriorities
  return {
    success: true,
    profile: {
      ...profile,
      answers: nextAnswers,
    },
  };
}

/**
 * Cập nhật tối đa 3 mã ưu tiên của phần D do chính học sinh tự chọn.
 */
export function setStudentValuePriorities(
  profile: StudentProfileContract,
  priorities: string[]
): { success: boolean; error?: string; profile: StudentProfileContract } {
  if (!Array.isArray(priorities) || priorities.length > 3) {
    return {
      success: false,
      error: 'Học sinh chỉ chọn tối đa 3 giá trị ưu tiên ở phần D.',
      profile,
    };
  }
  const unique = new Set<string>();
  for (const id of priorities) {
    const q = QUESTION_MAP.get(id);
    if (!q || q.module !== 'D') {
      return {
        success: false,
        error: `Mã ưu tiên "${id}" không thuộc phân hệ Giá trị sống D (D01–D10).`,
        profile,
      };
    }
    if (unique.has(id)) {
      return {
        success: false,
        error: `Mã ưu tiên "${id}" bị trùng lặp.`,
        profile,
      };
    }
    unique.add(id);
  }
  return {
    success: true,
    profile: {
      ...profile,
      valuePriorities: Array.from(unique),
    },
  };
}

// ============================================================================
// 5. BỘ MÁY TÍNH ĐIỂM CHUẨN 2.0.1 (SCORING ENGINE A–O)
// ============================================================================

export interface SubgroupScoreResult {
  subgroup: string;
  label: string;
  validCount: number;
  requiredCount: number;
  totalItems: number;
  isValid: boolean;
  rawScore: number | null; // Điểm chưa làm tròn để so sánh chính xác (vd B max-min <= 10)
  displayScore: number | null; // Làm tròn 1 chữ số thập phân
  statusText: string; // Ví dụ "75.0 (4/4)" hoặc "Chưa đủ dữ liệu (2/4)"
  itemIds: string[];
}

export interface ModuleAResult {
  subgroups: Record<'NT' | 'YN' | 'TC', SubgroupScoreResult>;
  // Tuyệt đối không có tổng điểm A
}

export interface ModuleBResult {
  subgroups: Record<'R' | 'I' | 'A' | 'S' | 'E' | 'C', SubgroupScoreResult>;
  allSixValid: boolean;
  isFlatProfile: boolean;
  leadingGroups: ('R' | 'I' | 'A' | 'S' | 'E' | 'C')[];
  spreadMaxMin: number | null;
}

export interface ModuleCResult {
  subgroups: Record<'TT' | 'TH' | 'ST' | 'GT' | 'TC' | 'SO', SubgroupScoreResult>;
  selfReportDisclaimer: string;
}

export interface ModuleDResult {
  itemValues: Record<string, string | null>;
  valuePriorities: string[];
  boundary: string | null;
}

export interface KnowledgeSubgroupResult {
  subgroup: string;
  label: string;
  validCount: number;
  totalItems: 3;
  isComplete: boolean;
  correctCount: number | null; // Chỉ báo /3 khi validCount === 3
  levelGuidance: 'Củng cố lại' | 'Củng cố' | 'Vận dụng' | 'Chưa đủ dữ liệu';
  itemIds: string[];
}

export interface ModuleEResult {
  subgroups: Record<'NG' | 'AI' | 'QĐ' | 'KH', KnowledgeSubgroupResult>;
  totalValidCount: number;
  totalComplete: boolean;
  totalScoreOutOf12: number | null; // Chỉ báo /12 khi đủ cả 12 câu hợp lệ
}

export interface ModuleKResult {
  subgroups: Record<'DL' | 'AI' | 'LC' | 'TD', KnowledgeSubgroupResult>;
  // Tuyệt đối KHÔNG tạo tổng K (S13)
}

export interface ModuleFResult {
  F01: string | null;
  multiSelections: Record<'F02' | 'F03' | 'F04' | 'F05' | 'F06' | 'F07' | 'F08', string[] | null>;
}

export interface ModuleGResult {
  countLevel2: number;
  countLevel0Or1: number;
  countUXOrEmpty: number;
  totalItems: 8;
  itemStates: Record<string, string | null>;
}

export interface ModuleHResult {
  subgroups: Record<'NT' | 'NB', SubgroupScoreResult>;
  // Tuyệt đối không có tổng H, không ngưỡng cao/thấp, không archetype
}

export type JohariCellStatus = 'Y/Y' | 'Y/N' | 'N/Y' | 'N/N' | 'Chưa đủ dữ liệu';

export interface JohariItemEvaluation {
  id: string;
  status: JohariCellStatus;
  self: string | null;
  selfExample: string | null;
  observer: string | null;
  observerExample: string | null;
  sameContext: boolean;
  mutualConsent: boolean;
}

export interface ModuleJResult {
  items: Record<string, JohariItemEvaluation>;
  validPairedCount: number;
  discrepancyIds: string[]; // Các mã có Y/N hoặc N/Y hợp lệ (kích hoạt câu hỏi xác minh T05)
}

export interface ModuleLSubgroupCount {
  subgroup: 'KT' | 'TN' | 'SN';
  label: string;
  count0: number;
  count1: number;
  count2: number;
  countU: number;
  countX: number;
  countEmpty: number;
  totalItems: 4;
}

export interface ModuleLResult {
  subgroups: Record<'KT' | 'TN' | 'SN', ModuleLSubgroupCount>;
}

export interface PracticeItemEvaluation {
  id: string;
  title: string;
  status: '0' | '1' | '2' | 'Chưa đánh giá';
  rawScore: string | null;
  evidence: string | null;
  support: string | null;
  reviewerConfirmed: boolean;
}

export interface ModuleNResult {
  items: Record<string, PracticeItemEvaluation>;
  evaluatedCount: number;
}

export interface ModuleIOResult {
  sharedSummaries: Record<string, string>; // Chỉ chứa các câu có shareConsent === true và sharedSummary khác rỗng
}

const A_GROUPS: Record<'NT' | 'YN' | 'TC', { label: string; ids: string[] }> = {
  NT: { label: 'Nhận thức điểm mạnh & ưu tiên (NT)', ids: ['A01', 'A02', 'A03', 'A04'] },
  YN: { label: 'Ý nghĩa & động lực học tập (YN)', ids: ['A05', 'A06', 'A07', 'A08'] },
  TC: { label: 'Tự chủ & thích ứng bước đi (TC)', ids: ['A09', 'A10', 'A11', 'A12'] },
};

const B_GROUPS: Record<'R' | 'I' | 'A' | 'S' | 'E' | 'C', { label: string; ids: string[] }> = {
  R: { label: 'Thực hành · Kỹ thuật (R)', ids: ['B01', 'B12', 'B17', 'B22', 'B27', 'B32'] },
  I: { label: 'Nghiên cứu · Phân tích (I)', ids: ['B02', 'B07', 'B18', 'B23', 'B28', 'B33'] },
  A: { label: 'Sáng tạo · Thiết kế (A)', ids: ['B03', 'B08', 'B13', 'B24', 'B29', 'B34'] },
  S: { label: 'Hỗ trợ · Giáo dục · Cộng đồng (S)', ids: ['B04', 'B09', 'B14', 'B19', 'B30', 'B35'] },
  E: { label: 'Tổ chức · Khởi xướng (E)', ids: ['B05', 'B10', 'B15', 'B20', 'B25', 'B36'] },
  C: { label: 'Quy trình · Dữ liệu · Nghiệp vụ (C)', ids: ['B06', 'B11', 'B16', 'B21', 'B26', 'B31'] },
};

const C_GROUPS: Record<'TT' | 'TH' | 'ST' | 'GT' | 'TC' | 'SO', { label: string; ids: string[] }> = {
  TT: { label: 'Thực thao · Lắp ráp (TT)', ids: ['C01', 'C07', 'C13', 'C19'] },
  TH: { label: 'Tìm hiểu · Xử lý dữ liệu (TH)', ids: ['C02', 'C08', 'C14', 'C20'] },
  ST: { label: 'Sáng tạo · Biểu đạt (ST)', ids: ['C03', 'C09', 'C15', 'C21'] },
  GT: { label: 'Giao tiếp · Đồng hành (GT)', ids: ['C04', 'C10', 'C16', 'C22'] },
  TC: { label: 'Tổ chức · Điều phối (TC)', ids: ['C05', 'C11', 'C17', 'C23'] },
  SO: { label: 'Số hóa · Kiểm chứng · Quy trình (SO)', ids: ['C06', 'C12', 'C18', 'C24'] },
};

const H_GROUPS: Record<'NT' | 'NB', { label: string; ids: string[] }> = {
  NT: {
    label: 'Tự nhận thức nội tại (NT)',
    ids: ['H01', 'H02', 'H03', 'H04', 'H05', 'H06', 'H07', 'H08'],
  },
  NB: {
    label: 'Nhận thức góc nhìn bên ngoài (NB)',
    ids: ['H09', 'H10', 'H11', 'H12', 'H13', 'H14', 'H15', 'H16'],
  },
};

const E_GROUPS: Record<'NG' | 'AI' | 'QĐ' | 'KH', { label: string; ids: string[] }> = {
  NG: { label: 'Kiểm chứng nguồn tin nghề (NG)', ids: ['E01', 'E05', 'E09'] },
  AI: { label: 'Sử dụng AI có kiểm chứng & bảo mật (AI)', ids: ['E02', 'E06', 'E10'] },
  QĐ: { label: 'Cân nhắc đa chiều khi ra quyết định (QĐ)', ids: ['E03', 'E07', 'E11'] },
  KH: { label: 'Lập kế hoạch & điều chỉnh thử nghiệm (KH)', ids: ['E04', 'E08', 'E12'] },
};

const K_GROUPS: Record<'DL' | 'AI' | 'LC' | 'TD', { label: string; ids: string[] }> = {
  DL: { label: 'Đọc hiểu số liệu thị trường lao động (DL)', ids: ['K01', 'K06', 'K09'] },
  AI: { label: 'Đạo đức & kiểm chứng công cụ AI (AI)', ids: ['K02', 'K05', 'K10'] },
  LC: { label: 'So sánh lộ trình & bối cảnh thực tế (LC)', ids: ['K03', 'K08', 'K11'] },
  TD: { label: 'Thích ứng kỹ năng & điều chỉnh mục tiêu (TD)', ids: ['K04', 'K07', 'K12'] },
};

const L_GROUPS: Record<'KT' | 'TN' | 'SN', { label: string; ids: string[] }> = {
  KT: { label: 'Khai thác & kiểm chứng thông tin (KT)', ids: ['L01', 'L02', 'L03', 'L04'] },
  TN: { label: 'Thử nghiệm & xin phản hồi thực tế (TN)', ids: ['L05', 'L06', 'L07', 'L08'] },
  SN: { label: 'Suy ngẫm & lập bước đi (SN)', ids: ['L09', 'L10', 'L11', 'L12'] },
};

function computeScaleSubgroup(
  subgroupKey: string,
  label: string,
  ids: string[],
  answers: Record<string, AnswerValue>,
  minRequired: number,
  allowedNumericStrings: Set<string>,
  formula: '1_to_5' | '0_to_4'
): SubgroupScoreResult {
  const validNums: number[] = [];
  for (const id of ids) {
    const val = answers[id];
    if (typeof val === 'string' && allowedNumericStrings.has(val)) {
      validNums.push(Number(val));
    }
  }

  const validCount = validNums.length;
  const totalItems = ids.length;
  const isValid = validCount >= minRequired;

  if (!isValid) {
    return {
      subgroup: subgroupKey,
      label,
      validCount,
      requiredCount: minRequired,
      totalItems,
      isValid: false,
      rawScore: null,
      displayScore: null,
      statusText: `Chưa đủ dữ liệu (${validCount}/${totalItems})`,
      itemIds: ids,
    };
  }

  const mean = validNums.reduce((acc, cur) => acc + cur, 0) / validCount;
  const rawScore = formula === '1_to_5' ? (100 * (mean - 1)) / 4 : (100 * mean) / 4;
  const displayScore = Math.round(rawScore * 10) / 10;

  return {
    subgroup: subgroupKey,
    label,
    validCount,
    requiredCount: minRequired,
    totalItems,
    isValid: true,
    rawScore,
    displayScore,
    statusText: `${displayScore.toFixed(1)} (${validCount}/${totalItems})`,
    itemIds: ids,
  };
}

const SET_1_TO_5 = new Set(['1', '2', '3', '4', '5']);
const SET_0_TO_4 = new Set(['0', '1', '2', '3', '4']);

export function scoreModuleA(answers: Record<string, AnswerValue>): ModuleAResult {
  return {
    subgroups: {
      NT: computeScaleSubgroup('NT', A_GROUPS.NT.label, A_GROUPS.NT.ids, answers, 3, SET_1_TO_5, '1_to_5'),
      YN: computeScaleSubgroup('YN', A_GROUPS.YN.label, A_GROUPS.YN.ids, answers, 3, SET_1_TO_5, '1_to_5'),
      TC: computeScaleSubgroup('TC', A_GROUPS.TC.label, A_GROUPS.TC.ids, answers, 3, SET_1_TO_5, '1_to_5'),
    },
  };
}

export function scoreModuleB(answers: Record<string, AnswerValue>): ModuleBResult {
  const keys: ('R' | 'I' | 'A' | 'S' | 'E' | 'C')[] = ['R', 'I', 'A', 'S', 'E', 'C'];
  const subgroups = {} as Record<'R' | 'I' | 'A' | 'S' | 'E' | 'C', SubgroupScoreResult>;

  for (const k of keys) {
    subgroups[k] = computeScaleSubgroup(k, B_GROUPS[k].label, B_GROUPS[k].ids, answers, 5, SET_1_TO_5, '1_to_5');
  }

  const allSixValid = keys.every((k) => subgroups[k].isValid && subgroups[k].rawScore !== null);
  if (!allSixValid) {
    return {
      subgroups,
      allSixValid: false,
      isFlatProfile: false,
      leadingGroups: [],
      spreadMaxMin: null,
    };
  }

  // Tính trên điểm CHƯA LÀM TRÒN (S08)
  const rawValues = keys.map((k) => subgroups[k].rawScore as number);
  const maxRaw = Math.max(...rawValues);
  const minRaw = Math.min(...rawValues);
  const spread = maxRaw - minRaw;
  const EPS = 1e-9;

  if (spread <= 10 + EPS) {
    return {
      subgroups,
      allSixValid: true,
      isFlatProfile: true,
      leadingGroups: [],
      spreadMaxMin: spread,
    };
  }

  const leadingGroups = keys.filter((k) => maxRaw - (subgroups[k].rawScore as number) <= 10 + EPS);
  return {
    subgroups,
    allSixValid: true,
    isFlatProfile: false,
    leadingGroups,
    spreadMaxMin: spread,
  };
}

export function scoreModuleC(answers: Record<string, AnswerValue>): ModuleCResult {
  const keys: ('TT' | 'TH' | 'ST' | 'GT' | 'TC' | 'SO')[] = ['TT', 'TH', 'ST', 'GT', 'TC', 'SO'];
  const subgroups = {} as Record<'TT' | 'TH' | 'ST' | 'GT' | 'TC' | 'SO', SubgroupScoreResult>;

  for (const k of keys) {
    subgroups[k] = computeScaleSubgroup(k, C_GROUPS[k].label, C_GROUPS[k].ids, answers, 3, SET_0_TO_4, '0_to_4');
  }

  return {
    subgroups,
    selfReportDisclaimer: 'Kỹ năng do em tự mô tả, không phải năng lực đã xác minh thực chứng.',
  };
}

export function scoreModuleD(profile: StudentProfileContract): ModuleDResult {
  const itemValues: Record<string, string | null> = {};
  for (let i = 1; i <= 10; i++) {
    const id = `D${String(i).padStart(2, '0')}`;
    const v = profile.answers[id];
    itemValues[id] = typeof v === 'string' && SET_0_TO_4.has(v) ? v : typeof v === 'string' ? v : null;
  }
  return {
    itemValues,
    valuePriorities: [...(profile.valuePriorities || [])].slice(0, 3),
    boundary: profile.boundary ?? null,
  };
}

function scoreKnowledgeSubgroup(
  subgroupKey: string,
  label: string,
  ids: string[],
  answers: Record<string, AnswerValue>
): KnowledgeSubgroupResult {
  let validCount = 0;
  let points = 0;

  for (const id of ids) {
    const q = QUESTION_MAP.get(id);
    const ans = answers[id];
    if (typeof ans === 'string' && q) {
      if (ans === 'X' || ans === '') {
        // X hoặc trống tính là thiếu (S14)
        continue;
      }
      if (ans === 'U') {
        // U tính là hợp lệ trong mẫu số với điểm 0 (S15)
        validCount += 1;
        points += 0;
      } else if (['A', 'B', 'C', 'D'].includes(ans)) {
        validCount += 1;
        if (ans === q.answer_key) {
          points += 1;
        }
      }
    }
  }

  const isComplete = validCount === 3;
  if (!isComplete) {
    return {
      subgroup: subgroupKey,
      label,
      validCount,
      totalItems: 3,
      isComplete: false,
      correctCount: null,
      levelGuidance: 'Chưa đủ dữ liệu',
      itemIds: ids,
    };
  }

  const levelGuidance = points <= 1 ? 'Củng cố lại' : points === 2 ? 'Củng cố' : 'Vận dụng';
  return {
    subgroup: subgroupKey,
    label,
    validCount: 3,
    totalItems: 3,
    isComplete: true,
    correctCount: points,
    levelGuidance,
    itemIds: ids,
  };
}

export function scoreModuleE(answers: Record<string, AnswerValue>): ModuleEResult {
  const keys: ('NG' | 'AI' | 'QĐ' | 'KH')[] = ['NG', 'AI', 'QĐ', 'KH'];
  const subgroups = {} as Record<'NG' | 'AI' | 'QĐ' | 'KH', KnowledgeSubgroupResult>;

  let totalValidCount = 0;
  let totalPoints = 0;

  for (const k of keys) {
    const res = scoreKnowledgeSubgroup(k, E_GROUPS[k].label, E_GROUPS[k].ids, answers);
    subgroups[k] = res;
    totalValidCount += res.validCount;
    if (res.correctCount !== null) {
      totalPoints += res.correctCount;
    }
  }

  const totalComplete = totalValidCount === 12;
  return {
    subgroups,
    totalValidCount,
    totalComplete,
    totalScoreOutOf12: totalComplete ? totalPoints : null,
  };
}

export function scoreModuleK(answers: Record<string, AnswerValue>): ModuleKResult {
  const keys: ('DL' | 'AI' | 'LC' | 'TD')[] = ['DL', 'AI', 'LC', 'TD'];
  const subgroups = {} as Record<'DL' | 'AI' | 'LC' | 'TD', KnowledgeSubgroupResult>;

  for (const k of keys) {
    subgroups[k] = scoreKnowledgeSubgroup(k, K_GROUPS[k].label, K_GROUPS[k].ids, answers);
  }

  // Tuyệt đối KHÔNG tạo tổng K (S13)
  return { subgroups };
}

export function scoreModuleF(answers: Record<string, AnswerValue>): ModuleFResult {
  const f01 = typeof answers.F01 === 'string' ? answers.F01 : null;
  const multiKeys: ('F02' | 'F03' | 'F04' | 'F05' | 'F06' | 'F07' | 'F08')[] = [
    'F02',
    'F03',
    'F04',
    'F05',
    'F06',
    'F07',
    'F08',
  ];
  const multiSelections = {} as Record<'F02' | 'F03' | 'F04' | 'F05' | 'F06' | 'F07' | 'F08', string[] | null>;
  for (const k of multiKeys) {
    const val = answers[k];
    multiSelections[k] = Array.isArray(val) && val.length > 0 ? [...val] : null;
  }
  return {
    F01: f01,
    multiSelections,
  };
}

export function scoreModuleG(answers: Record<string, AnswerValue>): ModuleGResult {
  let countLevel2 = 0;
  let countLevel0Or1 = 0;
  let countUXOrEmpty = 0;
  const itemStates: Record<string, string | null> = {};

  for (let i = 1; i <= 8; i++) {
    const id = `G${String(i).padStart(2, '0')}`;
    const val = answers[id];
    if (typeof val === 'string') {
      itemStates[id] = val;
      if (val === '2') {
        countLevel2 += 1;
      } else if (val === '0' || val === '1') {
        countLevel0Or1 += 1;
      } else {
        countUXOrEmpty += 1;
      }
    } else {
      itemStates[id] = null;
      countUXOrEmpty += 1;
    }
  }

  return {
    countLevel2,
    countLevel0Or1,
    countUXOrEmpty,
    totalItems: 8,
    itemStates,
  };
}

export function scoreModuleH(answers: Record<string, AnswerValue>): ModuleHResult {
  return {
    subgroups: {
      NT: computeScaleSubgroup('NT', H_GROUPS.NT.label, H_GROUPS.NT.ids, answers, 6, SET_1_TO_5, '1_to_5'),
      NB: computeScaleSubgroup('NB', H_GROUPS.NB.label, H_GROUPS.NB.ids, answers, 6, SET_1_TO_5, '1_to_5'),
    },
  };
}

export function scoreModuleJ(answers: Record<string, AnswerValue>): ModuleJResult {
  const items: Record<string, JohariItemEvaluation> = {};
  let validPairedCount = 0;
  const discrepancyIds: string[] = [];

  for (let i = 1; i <= 12; i++) {
    const id = `J${String(i).padStart(2, '0')}`;
    const raw = answers[id] as PairedObservationAnswer | undefined | null;

    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      items[id] = {
        id,
        status: 'Chưa đủ dữ liệu',
        self: null,
        selfExample: null,
        observer: null,
        observerExample: null,
        sameContext: false,
        mutualConsent: false,
      };
      continue;
    }

    const self = raw.self;
    const observer = raw.observer;
    const selfExample = raw.selfExample && raw.selfExample.trim() !== '' ? raw.selfExample.trim() : null;
    const observerExample =
      raw.observerExample && raw.observerExample.trim() !== '' ? raw.observerExample.trim() : null;
    const sameContext = Boolean(raw.sameContext);
    const mutualConsent = Boolean(raw.mutualConsent);

    const isSelfYN = self === 'Y' || self === 'N';
    const isObsYN = observer === 'Y' || observer === 'N';
    const selfHasRequiredEx = self === 'Y' ? selfExample !== null : true;
    const obsHasRequiredEx = observer === 'Y' ? observerExample !== null : true;

    if (sameContext && mutualConsent && isSelfYN && isObsYN && selfHasRequiredEx && obsHasRequiredEx) {
      const status = `${self}/${observer}` as 'Y/Y' | 'Y/N' | 'N/Y' | 'N/N';
      items[id] = {
        id,
        status,
        self,
        selfExample,
        observer,
        observerExample,
        sameContext,
        mutualConsent,
      };
      validPairedCount += 1;
      if (status === 'Y/N' || status === 'N/Y') {
        discrepancyIds.push(id);
      }
    } else {
      items[id] = {
        id,
        status: 'Chưa đủ dữ liệu',
        self: self ?? null,
        selfExample,
        observer: observer ?? null,
        observerExample,
        sameContext,
        mutualConsent,
      };
    }
  }

  return {
    items,
    validPairedCount,
    discrepancyIds,
  };
}

export function scoreModuleL(answers: Record<string, AnswerValue>): ModuleLResult {
  const keys: ('KT' | 'TN' | 'SN')[] = ['KT', 'TN', 'SN'];
  const subgroups = {} as Record<'KT' | 'TN' | 'SN', ModuleLSubgroupCount>;

  for (const k of keys) {
    let count0 = 0;
    let count1 = 0;
    let count2 = 0;
    let countU = 0;
    let countX = 0;
    let countEmpty = 0;

    for (const id of L_GROUPS[k].ids) {
      const val = answers[id];
      if (val === '0') count0 += 1;
      else if (val === '1') count1 += 1;
      else if (val === '2') count2 += 1;
      else if (val === 'U') countU += 1;
      else if (val === 'X') countX += 1;
      else countEmpty += 1;
    }

    subgroups[k] = {
      subgroup: k,
      label: L_GROUPS[k].label,
      count0,
      count1,
      count2,
      countU,
      countX,
      countEmpty,
      totalItems: 4,
    };
  }

  return { subgroups };
}

export function scoreModuleN(answers: Record<string, AnswerValue>): ModuleNResult {
  const items: Record<string, PracticeItemEvaluation> = {};
  let evaluatedCount = 0;

  for (let i = 1; i <= 8; i++) {
    const id = `N${String(i).padStart(2, '0')}`;
    const q = QUESTION_MAP.get(id);
    const raw = answers[id] as PracticeRubricAnswer | undefined | null;

    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      items[id] = {
        id,
        title: q?.content ?? id,
        status: 'Chưa đánh giá',
        rawScore: null,
        evidence: null,
        support: null,
        reviewerConfirmed: false,
      };
      continue;
    }

    const score = raw.score;
    const evidence = raw.evidence && raw.evidence.trim() !== '' ? raw.evidence.trim() : null;
    const support = raw.support && raw.support.trim() !== '' ? raw.support.trim() : null;
    const reviewerConfirmed = Boolean(raw.reviewerConfirmed);

    // Quy tắc S23 & S24: Điểm 0, 1, 2 chỉ hợp lệ khi có sản phẩm minh chứng VÀ người đánh giá xác nhận
    if (
      (score === '0' || score === '1' || score === '2') &&
      evidence !== null &&
      reviewerConfirmed === true
    ) {
      items[id] = {
        id,
        title: q?.content ?? id,
        status: score,
        rawScore: score,
        evidence,
        support,
        reviewerConfirmed: true,
      };
      evaluatedCount += 1;
    } else {
      items[id] = {
        id,
        title: q?.content ?? id,
        status: 'Chưa đánh giá',
        rawScore: score ?? null,
        evidence,
        support,
        reviewerConfirmed,
      };
    }
  }

  return { items, evaluatedCount };
}

export function extractSharedReflectionsIO(answers: Record<string, AnswerValue>): ModuleIOResult {
  const sharedSummaries: Record<string, string> = {};
  const ioIds = [
    ...Array.from({ length: 16 }, (_, i) => `I${String(i + 1).padStart(2, '0')}`),
    ...Array.from({ length: 8 }, (_, i) => `O${String(i + 1).padStart(2, '0')}`),
  ];

  for (const id of ioIds) {
    const raw = answers[id] as PrivateReflectionAnswer | undefined | null;
    if (
      raw &&
      typeof raw === 'object' &&
      !Array.isArray(raw) &&
      raw.shareConsent === true &&
      typeof raw.sharedSummary === 'string' &&
      raw.sharedSummary.trim() !== ''
    ) {
      sharedSummaries[id] = raw.sharedSummary.trim();
    }
  }

  return { sharedSummaries };
}

// ============================================================================
// 6. KHO NGHIÊN CỨU ĐỘC LẬP M (M01–M12, ẨN Ô NHỎ < 10)
// ============================================================================

export interface AnonymousResearchSubmission {
  submissionVersion: '2.0.1';
  submittedAt: string;
  answers: Record<string, string | string[]>; // Chỉ chứa M01..M12, tuyệt đối không có profileId
}

export interface ResearchAggregateOptionStat {
  value: string;
  label: string;
  count: number | null; // null nếu bị ẩn do nhóm nhỏ < 10
  percentage: number | null;
  suppressedSmallCell: boolean;
}

export interface ResearchQuestionAggregate {
  questionId: string;
  content: string;
  validDenominator: number;
  uxEmptyCount: number;
  suppressedTotalGroup: boolean;
  optionStats: ResearchAggregateOptionStat[];
}

export function validateResearchSubmissionM(
  rawAnswers: Record<string, unknown>
): { valid: boolean; errors: string[]; submission?: AnonymousResearchSubmission } {
  const errors: string[] = [];
  const cleanAnswers: Record<string, string | string[]> = {};

  for (const [key, val] of Object.entries(rawAnswers)) {
    if (key === 'profileId' || !key.startsWith('M')) {
      errors.push(`Kho nghiên cứu M từ chối trường định danh hoặc ngoài M: ${key}`);
      continue;
    }
    const check = validateQuestionAnswer(key, val);
    if (!check.valid) {
      errors.push(check.error || `Lỗi ở câu ${key}`);
    } else if (check.normalizedValue !== null && check.normalizedValue !== undefined) {
      cleanAnswers[key] = check.normalizedValue as string | string[];
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    submission: {
      submissionVersion: '2.0.1',
      submittedAt: new Date().toISOString(),
      answers: cleanAnswers,
    },
  };
}

export function aggregateResearchSubmissionsM(
  submissions: AnonymousResearchSubmission[]
): Record<string, ResearchQuestionAggregate> {
  const result: Record<string, ResearchQuestionAggregate> = {};
  const mQuestions = QUESTIONS_DB.questions.filter((q) => q.module === 'M');

  for (const q of mQuestions) {
    let validDenominator = 0;
    let uxEmptyCount = 0;
    const counts: Record<string, number> = {};
    for (const opt of q.options) {
      if (opt.value !== 'U' && opt.value !== 'X') {
        counts[opt.value] = 0;
      }
    }

    for (const sub of submissions) {
      const ans = sub.answers[q.id];
      if (!ans) {
        uxEmptyCount += 1;
        continue;
      }
      if (typeof ans === 'string') {
        if (ans === 'U' || ans === 'X') {
          uxEmptyCount += 1;
        } else if (counts[ans] !== undefined) {
          validDenominator += 1;
          counts[ans] += 1;
        }
      } else if (Array.isArray(ans)) {
        if (ans.length === 0 || ans.includes('U') || ans.includes('X')) {
          uxEmptyCount += 1;
        } else {
          validDenominator += 1;
          for (const v of ans) {
            if (counts[v] !== undefined) {
              counts[v] += 1;
            }
          }
        }
      }
    }

    const suppressedTotalGroup = validDenominator > 0 && validDenominator < 10;
    const optionStats: ResearchAggregateOptionStat[] = q.options
      .filter((o) => o.value !== 'U' && o.value !== 'X')
      .map((opt) => {
        const c = counts[opt.value] || 0;
        // Quy tắc 2.0.1: Ẩn nhóm hoặc ô nhỏ dưới 10
        const suppressed = suppressedTotalGroup || (c > 0 && c < 10);
        return {
          value: opt.value,
          label: opt.label,
          count: suppressed ? null : c,
          percentage:
            suppressed || validDenominator === 0
              ? null
              : Math.round(((c * 100) / validDenominator) * 10) / 10,
          suppressedSmallCell: suppressed,
        };
      });

    result[q.id] = {
      questionId: q.id,
      content: q.content,
      validDenominator,
      uxEmptyCount,
      suppressedTotalGroup,
      optionStats,
    };
  }

  return result;
}

// ============================================================================
// 7. TRA CỨU THƯ VIỆN PHẢN HỒI 206 MỤC (FEEDBACK ENGINE)
// ============================================================================

export interface ItemFeedbackLookup {
  questionId: string;
  answerState: 'answered' | 'U' | 'X' | 'empty';
  primaryGuidance: string;
  suggestedAction: string | null;
  evidenceToReview: string | null;
  reinforcementExercise: string | null;
}

export function lookupItemFeedback(questionId: string, answer: AnswerValue): ItemFeedbackLookup {
  const q = QUESTION_MAP.get(questionId);
  const f = FEEDBACK_MAP.get(questionId);

  if (!q || !f) {
    return {
      questionId,
      answerState: 'empty',
      primaryGuidance: 'Chưa có dữ liệu cho mục này.',
      suggestedAction: null,
      evidenceToReview: null,
      reinforcementExercise: null,
    };
  }

  const getBranchContains = (prefix: string): string | null => {
    const found = f.branches.find((b) => b.label === prefix || b.label.startsWith(`${prefix} ·`));
    return found ? found.guidance : null;
  };

  const suggestedAction = getBranchContains('Việc gợi ý') || getBranchContains('Hướng luyện');
  const evidenceToReview = getBranchContains('Minh chứng xem lại');
  const reinforcementExercise = getBranchContains('Bài tập củng cố');

  // Xử lý X hoặc trống: Tuyệt đối KHÔNG truy xuất nhánh 0, không phán xét, không tự gán việc dựa trên X (S26)
  if (answer === null || answer === undefined || answer === '') {
    return {
      questionId,
      answerState: 'empty',
      primaryGuidance: 'Mục này đang để trống. Em có toàn quyền làm sau hoặc bỏ qua mà không ảnh hưởng quyền sử dụng.',
      suggestedAction: null,
      evidenceToReview: null,
      reinforcementExercise: null,
    };
  }

  if (answer === 'X' || (Array.isArray(answer) && answer.includes('X'))) {
    return {
      questionId,
      answerState: 'X',
      primaryGuidance:
        'Tôn trọng quyền giữ riêng (X) của em. Hệ thống không chấm điểm, không phán xét và không tự gán nhiệm vụ từ mục em chọn giữ riêng.',
      suggestedAction: null,
      evidenceToReview: null,
      reinforcementExercise: null,
    };
  }

  if (answer === 'U' || (Array.isArray(answer) && answer.includes('U'))) {
    const isEK = q.module === 'E' || q.module === 'K';
    return {
      questionId,
      answerState: 'U',
      primaryGuidance: isEK
        ? 'Em chọn “Chưa rõ (U)”: Đây là cơ hội củng cố thêm thông tin và khái niệm, không phải đo chỉ số thông minh (IQ).'
        : 'Em chọn “Chưa rõ / Chưa có cơ hội trải nghiệm (U)”: Thiếu cơ hội trải nghiệm không phải là thiếu năng lực. Em có thể thử một hoạt động nhỏ an toàn nếu muốn.',
      suggestedAction,
      evidenceToReview,
      reinforcementExercise,
    };
  }

  // Trường hợp A/B/C/D/E/F/G/H/K/L/M (string hoặc string[])
  if (typeof answer === 'string') {
    const branch = getBranchContains(answer);
    return {
      questionId,
      answerState: 'answered',
      primaryGuidance: branch || 'Đã ghi nhận phản hồi của em.',
      suggestedAction,
      evidenceToReview,
      reinforcementExercise,
    };
  }

  if (Array.isArray(answer)) {
    const guidances = answer
      .map((val) => {
        const g = getBranchContains(val);
        return g ? `[${val}] ${g}` : null;
      })
      .filter(Boolean) as string[];
    return {
      questionId,
      answerState: 'answered',
      primaryGuidance: guidances.join(' | ') || 'Đã ghi nhận các lựa chọn của em.',
      suggestedAction: getBranchContains('Chốt hỗ trợ') || suggestedAction,
      evidenceToReview,
      reinforcementExercise,
    };
  }

  // Trường hợp J (PairedObservationAnswer)
  if (q.type === 'paired_observation') {
    const jEval = scoreModuleJ({ [questionId]: answer }).items[questionId];
    const branch =
      jEval.status === 'Chưa đủ dữ liệu'
        ? getBranchContains('U/X/trống hoặc khác bối cảnh')
        : getBranchContains(jEval.status);
    return {
      questionId,
      answerState: jEval.self === 'X' || jEval.observer === 'X' ? 'X' : 'answered',
      primaryGuidance: branch || 'Đã ghi nhận quan sát đối sánh hành vi.',
      suggestedAction: jEval.self === 'X' ? null : suggestedAction,
      evidenceToReview: jEval.self === 'X' ? null : evidenceToReview,
      reinforcementExercise: null,
    };
  }

  // Trường hợp N (PracticeRubricAnswer)
  if (q.type === 'practice_rubric') {
    const nEval = scoreModuleN({ [questionId]: answer }).items[questionId];
    if (nEval.rawScore === 'X') {
      return {
        questionId,
        answerState: 'X',
        primaryGuidance: 'Tôn trọng quyền giữ riêng (X) của em.',
        suggestedAction: null,
        evidenceToReview: null,
        reinforcementExercise: null,
      };
    }
    const branch =
      nEval.status === 'Chưa đánh giá'
        ? getBranchContains('U/X/trống')
        : getBranchContains(nEval.status);
    return {
      questionId,
      answerState: nEval.status === 'Chưa đánh giá' ? 'U' : 'answered',
      primaryGuidance: branch || 'Chưa đánh giá; ghi riêng cơ hội và loại hỗ trợ, không quy 0.',
      suggestedAction,
      evidenceToReview: getBranchContains('Bài làm minh họa'),
      reinforcementExercise: null,
    };
  }

  // Trường hợp I/O (PrivateReflectionAnswer)
  if (q.type === 'private_reflection') {
    const ioAns = answer as PrivateReflectionAnswer;
    const skipBranch = getBranchContains('Nếu bỏ qua');
    return {
      questionId,
      answerState: ioAns.shareConsent ? 'answered' : 'X',
      primaryGuidance: ioAns.shareConsent
        ? 'Em đã chủ động chọn chia sẻ bản tóm tắt này vào cuộc đối thoại với người tư vấn.'
        : skipBranch || 'Tôn trọng quyền riêng tư, không suy diễn; mặc định em tự giữ trên giấy.',
      suggestedAction: null,
      evidenceToReview: null,
      reinforcementExercise: null,
    };
  }

  return {
    questionId,
    answerState: 'empty',
    primaryGuidance: 'Chưa có dữ liệu.',
    suggestedAction: null,
    evidenceToReview: null,
    reinforcementExercise: null,
  };
}

// ============================================================================
// 8. MA TRẬN 12 NHU CẦU HỖ TRỢ T01–T12 (KHÔNG TỰ GÁN KHI CHƯA XÁC MINH)
// ============================================================================

export type SupportCode =
  | 'T01'
  | 'T02'
  | 'T03'
  | 'T04'
  | 'T05'
  | 'T06'
  | 'T07'
  | 'T08'
  | 'T09'
  | 'T10'
  | 'T11'
  | 'T12';

export interface QuestionToExploreItem {
  code: SupportCode;
  title: string;
  sourceIds: string[];
  questionToAsk: string;
  supportAction: string;
  verificationStatus: 'Cần xác minh cùng em' | 'Em đã xác nhận cần hỗ trợ';
}

const B_TO_C_MAP: Record<'R' | 'I' | 'A' | 'S' | 'E' | 'C', 'TT' | 'TH' | 'ST' | 'GT' | 'TC' | 'SO'> = {
  R: 'TT',
  I: 'TH',
  A: 'ST',
  S: 'GT',
  E: 'TC',
  C: 'SO',
};

const C_TO_N_MAP: Record<'TT' | 'TH' | 'ST' | 'GT' | 'TC' | 'SO', string[]> = {
  TT: ['N03'],
  TH: ['N01', 'N06'],
  ST: ['N04'],
  GT: ['N05'],
  TC: ['N07', 'N08'],
  SO: ['N02', 'N06'],
};

export function evaluateSupportMatrixT01ToT12(profile: StudentProfileContract): QuestionToExploreItem[] {
  const answers = profile.answers;
  const verifications = profile.supportVerifications || {};
  const resA = scoreModuleA(answers);
  const resB = scoreModuleB(answers);
  const resC = scoreModuleC(answers);
  const resE = scoreModuleE(answers);
  const resF = scoreModuleF(answers);
  const resG = scoreModuleG(answers);
  const resJ = scoreModuleJ(answers);
  const resK = scoreModuleK(answers);
  const resL = scoreModuleL(answers);
  const resN = scoreModuleN(answers);

  const items: QuestionToExploreItem[] = [];

  // T01: B dẫn đầu; C liên quan thấp (<50) hoặc thiếu/U
  if (resB.allSixValid && !resB.isFlatProfile && resB.leadingGroups.length > 0) {
    const lowOrMissingC: string[] = [];
    for (const bKey of resB.leadingGroups) {
      const cKey = B_TO_C_MAP[bKey];
      const cSub = resC.subgroups[cKey];
      if (!cSub.isValid || (cSub.rawScore !== null && cSub.rawScore < 50)) {
        lowOrMissingC.push(`${bKey}→${cKey}`);
      }
    }
    if (lowOrMissingC.length > 0) {
      items.push({
        code: 'T01',
        title: 'Sở thích dẫn đầu nhưng kỹ năng tự báo cáo liên quan còn thấp hoặc chưa có cơ hội',
        sourceIds: [...resB.leadingGroups.map((k) => `B_${k}`), ...lowOrMissingC],
        questionToAsk:
          'Em khá hứng thú với nhóm hoạt động này nhưng tự mô tả kỹ năng liên quan còn thấp/chưa rõ. Có phải em chưa có cơ hội thử an toàn không?',
        supportAction:
          'Hỏi cơ hội trải nghiệm trước đây và mời thử một bài Phòng thử nghề N tương ứng; tuyệt đối không kết luận em thiếu năng khiếu.',
        verificationStatus: verifications.confirmLowOpportunityForB
          ? 'Em đã xác nhận cần hỗ trợ'
          : 'Cần xác minh cùng em',
      });
    }
  }

  // T02: C tự báo cáo khá rõ (>=60); B liên quan ít thích (<40)
  const highCButLowB: string[] = [];
  for (const [bKey, cKey] of Object.entries(B_TO_C_MAP) as [
    'R' | 'I' | 'A' | 'S' | 'E' | 'C',
    'TT' | 'TH' | 'ST' | 'GT' | 'TC' | 'SO'
  ][]) {
    const cSub = resC.subgroups[cKey];
    const bSub = resB.subgroups[bKey];
    if (
      cSub.isValid &&
      cSub.rawScore !== null &&
      cSub.rawScore >= 60 &&
      bSub.isValid &&
      bSub.rawScore !== null &&
      bSub.rawScore < 40
    ) {
      highCButLowB.push(`${cKey} (${cSub.displayScore}) vs B_${bKey} (${bSub.displayScore})`);
    }
  }
  if (highCButLowB.length > 0) {
    items.push({
      code: 'T02',
      title: 'Kỹ năng tự mô tả khá rõ nhưng mức hứng thú B liên quan thấp',
      sourceIds: highCButLowB,
      questionToAsk:
        'Em tự mô tả làm được nhóm kỹ năng này nhưng lại ít hứng thú. Phần nhiệm vụ nào em vẫn thích, và giá trị D nào quan trọng với em?',
      supportAction: 'Hỏi nhiệm vụ cụ thể em thích, đối chiếu giá trị D và mở rộng trải nghiệm khác.',
      verificationStatus: verifications.confirmDislikeTaskForC
        ? 'Em đã xác nhận cần hỗ trợ'
        : 'Cần xác minh cùng em',
    });
  }

  // T03: B đủ sáu nhóm và max-min <= 10 (hồ sơ phẳng). Thiếu nhóm tuyệt đối không T03.
  if (resB.allSixValid && resB.isFlatProfile) {
    const avgB =
      Object.values(resB.subgroups).reduce((acc, s) => acc + (s.rawScore || 0), 0) / 6;
    const flatType = avgB < 40 ? 'toàn thấp' : avgB >= 70 ? 'toàn cao' : 'đồng đều mức giữa';
    items.push({
      code: 'T03',
      title: `Hồ sơ sở thích RIASEC phẳng (${flatType}, chênh lệch ≤ 10 điểm)`,
      sourceIds: ['B_R', 'B_I', 'B_A', 'B_S', 'B_E', 'B_C'],
      questionToAsk:
        'Các nhóm sở thích của em hiện khá đồng đều nhau. Em có muốn thử 2 hoạt động thuộc hai nhóm khác nhau để cảm nhận rõ hơn không?',
      supportAction: `Phân biệt hồ sơ phẳng (${flatType}); mời thử hai hoạt động đối lập nhau trong 7 ngày, không ép gán mã dẫn đầu.`,
      verificationStatus: verifications.confirmExploreTwoActivitiesForFlatB
        ? 'Em đã xác nhận cần hỗ trợ'
        : 'Cần xác minh cùng em',
    });
  }

  // T04: A thấp theo quy ước (<40) hoặc H có mục em muốn làm rõ (1, 2, U)
  const lowASubgroups = (['NT', 'YN', 'TC'] as const).filter(
    (k) => resA.subgroups[k].isValid && (resA.subgroups[k].rawScore as number) < 40
  );
  const unclearHIds = Array.from({ length: 16 }, (_, i) => `H${String(i + 1).padStart(2, '0')}`).filter(
    (id) => answers[id] === '1' || answers[id] === '2' || answers[id] === 'U'
  );
  if (lowASubgroups.length > 0 || unclearHIds.length > 0) {
    items.push({
      code: 'T04',
      title: 'Làm rõ thêm về tự nhận thức A hoặc góc nhìn H',
      sourceIds: [...lowASubgroups.map((k) => `A_${k}`), ...unclearHIds.slice(0, 4)],
      questionToAsk:
        'Có một số mục tự nhận thức em chọn mức thấp hoặc chưa rõ. Em có muốn cùng xem lại một ví dụ cụ thể gần đây không?',
      supportAction:
        'Hỏi ví dụ thực tế và phản hồi nếu em đồng ý; tuyệt đối không kết luận em tự ti hay gán nhãn tâm lý.',
      verificationStatus: verifications.confirmWantClarifyAOrH
        ? 'Em đã xác nhận cần hỗ trợ'
        : 'Cần xác minh cùng em',
    });
  }

  // T05: J đủ điều kiện, có Y/N hoặc N/Y
  if (resJ.discrepancyIds.length > 0) {
    items.push({
      code: 'T05',
      title: 'Khác biệt góc nhìn quan sát hành vi (Y/N hoặc N/Y)',
      sourceIds: resJ.discrepancyIds,
      questionToAsk:
        'Ở phần đối sánh hành vi J, góc nhìn của em và người quan sát có điểm khác nhau. Em có muốn đối thoại riêng để xem lại các ví dụ không?',
      supportAction:
        'Đối thoại riêng, kiểm chứng ví dụ cụ thể của từng bên; không kết luận ai đúng ai sai, không tính điểm vùng mù.',
      verificationStatus: verifications.confirmPrivateDialogueForJ
        ? 'Em đã xác nhận cần hỗ trợ'
        : 'Cần xác minh cùng em',
    });
  }

  // T06: D03 nằm trong ưu tiên VÀ học sinh xác nhận khó khăn chi phí.
  // Quy tắc S29: F03A đứng riêng KHÔNG đồng nghĩa nghèo/khó khăn kinh tế.
  const d03Prioritized = (profile.valuePriorities || []).includes('D03');
  if (d03Prioritized) {
    items.push({
      code: 'T06',
      title: 'Ưu tiên thu nhập/ổn định chi phí (D03) & tìm hiểu nguồn lực tài chính',
      sourceIds: ['D03'],
      questionToAsk:
        'Em chọn D03 trong nhóm giá trị ưu tiên. Em có đang băn khoăn về chi phí học tập và muốn cùng lập bảng dự toán N02 hoặc tìm thông tin học bổng không?',
      supportAction:
        'Thực hành bài N02 (dự toán 2 lộ trình) và tìm nguồn học bổng/hỗ trợ chính thức. Lưu ý: Quan tâm F03A không tự động gán là khó khăn kinh tế.',
      verificationStatus: verifications.confirmFinancialDifficulty
        ? 'Em đã xác nhận cần hỗ trợ'
        : 'Cần xác minh cùng em',
    });
  }

  // T07: E/K có cụm đủ 0–1/3 hoặc L có U hoặc F02D
  const lowEKSubgroups: string[] = [];
  for (const [k, v] of Object.entries(resE.subgroups)) {
    if (v.isComplete && v.correctCount !== null && v.correctCount <= 1) {
      lowEKSubgroups.push(`E_${k}`);
    }
  }
  for (const [k, v] of Object.entries(resK.subgroups)) {
    if (v.isComplete && v.correctCount !== null && v.correctCount <= 1) {
      lowEKSubgroups.push(`K_${k}`);
    }
  }
  const lWithU = Array.from({ length: 12 }, (_, i) => `L${String(i + 1).padStart(2, '0')}`).filter(
    (id) => answers[id] === 'U'
  );
  const hasF02D = Array.isArray(answers.F02) && answers.F02.includes('D');
  if (lowEKSubgroups.length > 0 || lWithU.length > 0 || hasF02D) {
    items.push({
      code: 'T07',
      title: 'Bổ sung thông tin kiểm chứng và cơ hội trải nghiệm thực tế',
      sourceIds: [...lowEKSubgroups, ...lWithU.slice(0, 3), ...(hasF02D ? ['F02D'] : [])],
      questionToAsk:
        'Em có một số mục chưa có cơ hội trải nghiệm hoặc cần củng cố cách kiểm chứng nguồn tin. Em muốn nhà trường hỗ trợ thông tin hay mô phỏng nào trước?',
      supportAction: 'Củng cố kỹ năng kiểm chứng nguồn tin và tạo cơ hội trải nghiệm tại trường; không suy diễn IQ.',
      verificationStatus: verifications.confirmNeedInfoSupport
        ? 'Em đã xác nhận cần hỗ trợ'
        : 'Cần xác minh cùng em',
    });
  }

  // T08: G có 0 hoặc 1 và em xác nhận muốn tiến hành
  const g01Ids = Array.from({ length: 8 }, (_, i) => `G${String(i + 1).padStart(2, '0')}`).filter(
    (id) => answers[id] === '0' || answers[id] === '1'
  );
  if (g01Ids.length > 0) {
    items.push({
      code: 'T08',
      title: 'Chuyển mục đang chuẩn bị ở phần G thành một bước thử nhỏ',
      sourceIds: g01Ids,
      questionToAsk:
        'Ở phần Sẵn sàng hành động G, có một số sản phẩm em chưa có hoặc đang làm dở. Em có muốn chọn 1 việc nhỏ nhất để làm trong 7 ngày tới không?',
      supportAction: 'Chọn đúng một việc vừa sức, thống nhất sản phẩm minh chứng và ngày tự xem lại.',
      verificationStatus: verifications.confirmWantProceedG
        ? 'Em đã xác nhận cần hỗ trợ'
        : 'Cần xác minh cùng em',
    });
  }

  // T09: C tự báo cáo rõ (>=75); N liên quan có sản phẩm đạt mức 0 hoặc 1
  const cVsNGap: string[] = [];
  for (const [cKey, nIds] of Object.entries(C_TO_N_MAP) as [
    'TT' | 'TH' | 'ST' | 'GT' | 'TC' | 'SO',
    string[]
  ][]) {
    const cSub = resC.subgroups[cKey];
    if (cSub.isValid && cSub.rawScore !== null && cSub.rawScore >= 75) {
      for (const nid of nIds) {
        const nItem = resN.items[nid];
        if (nItem && (nItem.status === '0' || nItem.status === '1')) {
          cVsNGap.push(`C_${cKey} vs ${nid}(mức ${nItem.status})`);
        }
      }
    }
  }
  if (cVsNGap.length > 0) {
    items.push({
      code: 'T09',
      title: 'Kỹ năng tự mô tả cao nhưng sản phẩm thử nghề N mới đạt mức 0 hoặc 1',
      sourceIds: cVsNGap,
      questionToAsk:
        'Em tự đánh giá kỹ năng khá tốt nhưng ở bài thử N sản phẩm cần bổ sung thêm tiêu chí. Điều kiện làm bài hoặc hướng dẫn có điểm nào chưa thuận lợi với em?',
      supportAction:
        'Hỏi điều kiện thực hiện và mời thử một biến thể có hướng dẫn từng bước; tuyệt đối không kết luận em ngộ nhận năng lực.',
      verificationStatus: verifications.confirmTryVariantForN
        ? 'Em đã xác nhận cần hỗ trợ'
        : 'Cần xác minh cùng em',
    });
  }

  // T10: Em tự nguyện chia sẻ khó khăn kéo dài hoặc yêu cầu hỗ trợ (Tuyệt đối không quét I/O)
  if (verifications.confirmVoluntaryLongTermDifficulty) {
    items.push({
      code: 'T10',
      title: 'Em chủ động yêu cầu gặp riêng để chia sẻ khó khăn kéo dài',
      sourceIds: ['Voluntary_Request'],
      questionToAsk:
        'Em đã chủ động đánh dấu mong muốn được lắng nghe về khó khăn kéo dài. Em muốn đặt lịch gặp riêng thầy/cô phụ trách tư vấn vào khung giờ nào?',
      supportAction: 'Mời gặp riêng kín đáo, xem xét an toàn và kết nối người hỗ trợ; tuyệt đối không tự quét nhật ký I/O.',
      verificationStatus: 'Em đã xác nhận cần hỗ trợ',
    });
  }

  // T11: F05D ("Chưa biết tìm ai") hoặc F07B ("Trao đổi riêng với giáo viên") — phân biệt rõ 2 phản hồi (S28)
  const hasF05D = Array.isArray(resF.multiSelections.F05) && resF.multiSelections.F05.includes('D');
  const hasF07B = Array.isArray(resF.multiSelections.F07) && resF.multiSelections.F07.includes('B');
  if (hasF05D || hasF07B) {
    const sourceIds: string[] = [];
    const guidanceParts: string[] = [];
    if (hasF05D) {
      sourceIds.push('F05D');
      guidanceParts.push('F05D (Chưa biết đầu mối hỗ trợ): Giới thiệu rõ đầu mối tư vấn tại trường và cách liên hệ kín đáo.');
    }
    if (hasF07B) {
      sourceIds.push('F07B');
      guidanceParts.push(
        'F07B (Muốn trao đổi riêng với giáo viên): Sắp xếp cuộc gặp riêng theo yêu cầu của em, giải thích rõ giới hạn bảo mật, không tự ý liên hệ gia đình.'
      );
    }
    items.push({
      code: 'T11',
      title: hasF05D && hasF07B
        ? 'Chưa biết đầu mối hỗ trợ (F05D) & Mong muốn trao đổi riêng với giáo viên (F07B)'
        : hasF05D
        ? 'Chưa biết đầu mối hỗ trợ khi cần (F05D)'
        : 'Mong muốn trao đổi riêng với giáo viên tư vấn (F07B)',
      sourceIds,
      questionToAsk: hasF05D
        ? 'Em chọn “Chưa biết tìm ai” khi băn khoăn (F05D). Em có muốn xem danh sách đầu mối tư vấn của trường và cách đặt lịch kín đáo không?'
        : 'Em chọn “Trao đổi riêng với giáo viên” (F07B). Em muốn hẹn khung giờ nào thuận tiện và an toàn cho em?',
      supportAction: guidanceParts.join(' '),
      verificationStatus: verifications.confirmConnectCounselorF05F07
        ? 'Em đã xác nhận cần hỗ trợ'
        : 'Cần xác minh cùng em',
    });
  }

  // T12: H04 chưa rõ/thấp ('1', '2', 'U') VÀ em xác nhận lịch quá tải.
  // Quy tắc S30: G05 thấp nhưng chưa xác nhận quá tải thì KHÔNG kích hoạt T12.
  const h04Val = answers.H04;
  const isH04LowOrUnclear = h04Val === '1' || h04Val === '2' || h04Val === 'U';
  if (isH04LowOrUnclear && verifications.confirmScheduleOverload === true) {
    items.push({
      code: 'T12',
      title: 'Điều chỉnh lịch học tập & nghỉ ngơi khi em xác nhận quá tải (H04)',
      sourceIds: ['H04'],
      questionToAsk:
        'Em nhận thấy dấu hiệu mệt/quá tải (H04) và xác nhận lịch hiện tại đang quá sức. Em có muốn cùng điều chỉnh lại khối lượng việc nhỏ hơn không?',
      supportAction:
        'Cùng em giảm khối lượng mục tiêu, ưu tiên giờ nghỉ ngơi và sức khỏe. (G05 chỉ là bối cảnh mục tiêu, không dùng G05 để đo quá tải).',
      verificationStatus: 'Em đã xác nhận cần hỗ trợ',
    });
  }

  return items;
}

// ============================================================================
// 9. BẢN ĐỒ LỰA CHỌN — GỢI Ý MỀM (SOFT SUGGESTIONS)
// ============================================================================

export interface SoftSuggestionCard {
  id: string;
  directionGroup: 'R' | 'I' | 'A' | 'S' | 'E' | 'C' | 'CUSTOM';
  title: string;
  exampleTasks: string;
  sourceIds: string[];
  reason: string;
  unknowns: string;
  microExperiment: string;
  conditionsToVerify: string;
  studentChoice: 'Muốn thử' | 'Còn phân vân' | 'Không phù hợp' | 'Em có hướng khác' | null;
}

const DIRECTION_CATALOG: Record<
  'R' | 'I' | 'A' | 'S' | 'E' | 'C',
  {
    title: string;
    exampleTasks: string;
    relatedC: 'TT' | 'TH' | 'ST' | 'GT' | 'TC' | 'SO';
    relatedN: string;
    microExperiment: string;
  }
> = {
  R: {
    title: 'Hướng thực hành · Kỹ thuật · Nông nghiệp ứng dụng (Nhóm R)',
    exampleTasks: 'Vận hành thiết bị, tạo mẫu vật lý, chăm sóc cây trồng/môi trường, sửa chữa quy trình kỹ thuật.',
    relatedC: 'TT',
    relatedN: 'N03',
    microExperiment: 'Thực hiện bài thử nghề N03 (viết quy trình kỹ thuật an toàn 5 bước trên giấy) trong 7 ngày.',
  },
  I: {
    title: 'Hướng nghiên cứu · Phân tích dữ liệu · Khoa học (Nhóm I)',
    exampleTasks: 'Đặt câu hỏi khảo sát, đọc bảng số liệu, kiểm chứng giả thuyết khoa học, phân tích môi trường/y sinh.',
    relatedC: 'TH',
    relatedN: 'N01',
    microExperiment: 'Thực hiện bài thử nghề N01 (đọc bảng dữ liệu và rút nhận xét có căn cứ) hoặc kiểm chứng 2 nguồn tin trong 7 ngày.',
  },
  A: {
    title: 'Hướng sáng tạo · Thiết kế · Truyền thông (Nhóm A)',
    exampleTasks: 'Thiết kế thông điệp trực quan, viết kịch bản/nội dung, bố cục không gian, truyền thông cộng đồng.',
    relatedC: 'ST',
    relatedN: 'N04',
    microExperiment: 'Thực hiện bài thử nghề N04 (phác thảo áp phích/thông điệp cộng đồng trên giấy A4) trong 7 ngày.',
  },
  S: {
    title: 'Hướng giáo dục · Tham vấn · Dịch vụ hỗ trợ cộng đồng (Nhóm S)',
    exampleTasks: 'Hướng dẫn học tập, giải thích khái niệm dễ hiểu, hỗ trợ cộng đồng, chăm sóc sức khỏe/xã hội.',
    relatedC: 'GT',
    relatedN: 'N05',
    microExperiment: 'Thực hiện bài thử nghề N05 (giải thích một khái niệm khó cho học sinh lớp dưới kèm câu hỏi kiểm tra) trong 7 ngày.',
  },
  E: {
    title: 'Hướng tổ chức dự án · Khởi xướng · Kinh doanh có trách nhiệm (Nhóm E)',
    exampleTasks: 'Lập kế hoạch sự kiện nhỏ, phân công nhóm, điều phối nguồn lực, kết nối dịch vụ/du lịch địa phương.',
    relatedC: 'TC',
    relatedN: 'N07',
    microExperiment: 'Thực hiện bài thử nghề N07 (lập kế hoạch 45 phút cho nhóm 4 người kèm phương án dự phòng) trong 7 ngày.',
  },
  C: {
    title: 'Hướng dữ liệu · Quy trình · Tài chính · Nghiệp vụ (Nhóm C)',
    exampleTasks: 'Lập bảng ngân sách, kiểm tra lỗi dữ liệu, chuẩn hóa hồ sơ, quản lý quy trình và bảo mật thông tin.',
    relatedC: 'SO',
    relatedN: 'N02',
    microExperiment: 'Thực hiện bài thử nghề N02 (lập bảng dự toán chi phí học tập cho 2 phương án từ nguồn chính thức) trong 7 ngày.',
  },
};

export function generateSoftSuggestions(profile: StudentProfileContract): SoftSuggestionCard[] {
  const resB = scoreModuleB(profile.answers);
  const resC = scoreModuleC(profile.answers);
  const resD = scoreModuleD(profile);
  const resN = scoreModuleN(profile.answers);

  // Quy tắc S27: Hồ sơ trống hoặc chưa đủ dữ liệu B/C thì KHÔNG tự sinh nghề
  const candidateGroups: ('R' | 'I' | 'A' | 'S' | 'E' | 'C')[] = [];

  if (resB.allSixValid && !resB.isFlatProfile && resB.leadingGroups.length > 0) {
    candidateGroups.push(...resB.leadingGroups.slice(0, 3));
  } else {
    // Nếu B chưa đủ hoặc hồ sơ phẳng, chỉ gợi ý khi có nhóm C tự báo cáo >= 65
    const validCGroups = (['R', 'I', 'A', 'S', 'E', 'C'] as const).filter((bKey) => {
      const cSub = resC.subgroups[DIRECTION_CATALOG[bKey].relatedC];
      return cSub.isValid && (cSub.rawScore as number) >= 65;
    });
    candidateGroups.push(...validCGroups.slice(0, 2));
  }

  const cards: SoftSuggestionCard[] = candidateGroups.map((gKey) => {
    const cat = DIRECTION_CATALOG[gKey];
    const bSub = resB.subgroups[gKey];
    const cSub = resC.subgroups[cat.relatedC];
    const nItem = resN.items[cat.relatedN];

    const sourceIds: string[] = [`B_${gKey}`, `C_${cat.relatedC}`];
    if (resD.valuePriorities.length > 0) {
      sourceIds.push(...resD.valuePriorities);
    }
    if (nItem && nItem.status !== 'Chưa đánh giá') {
      sourceIds.push(cat.relatedN);
    }

    const reasonParts: string[] = [];
    if (bSub.isValid) {
      reasonParts.push(`Nhóm sở thích ${gKey} đạt ${bSub.displayScore?.toFixed(1)} (${bSub.validCount}/6)`);
    }
    if (cSub.isValid) {
      reasonParts.push(`kỹ năng em tự mô tả ${cat.relatedC} đạt ${cSub.displayScore?.toFixed(1)} (${cSub.validCount}/4)`);
    }
    if (resD.valuePriorities.length > 0) {
      reasonParts.push(`đối chiếu với giá trị ưu tiên em chọn (${resD.valuePriorities.join(', ')})`);
    }

    const unknowns =
      !nItem || nItem.status === 'Chưa đánh giá'
        ? `Chưa có sản phẩm thực chứng được xác nhận ở bài thử nghề ${cat.relatedN}.`
        : `Đã có sản phẩm ${cat.relatedN} (mức ${nItem.status}); cần kiểm chứng thêm điều kiện đào tạo và thực tế địa phương.`;

    return {
      id: `SUGGEST_${gKey}`,
      directionGroup: gKey,
      title: cat.title,
      exampleTasks: cat.exampleTasks,
      sourceIds,
      reason: reasonParts.join('; ') || 'Giả thuyết khám phá từ các mục em đã chọn.',
      unknowns,
      microExperiment: cat.microExperiment,
      conditionsToVerify:
        'Lộ trình đào tạo (ĐH/CĐ/nghề), chi phí học tập, cơ hội tiếp cận tại địa phương và ít nhất 2 nguồn thông tin độc lập.',
      studentChoice: profile.careerChoices?.[`SUGGEST_${gKey}`] ?? null,
    };
  });

  if (profile.customCareerDirection && profile.customCareerDirection.trim() !== '') {
    cards.push({
      id: 'SUGGEST_CUSTOM',
      directionGroup: 'CUSTOM',
      title: `Hướng do em tự đề xuất: ${profile.customCareerDirection.trim()}`,
      exampleTasks: 'Nhiệm vụ nghề do em chủ động tìm hiểu và ghi nhận từ nguồn thực tế.',
      sourceIds: [...resD.valuePriorities],
      reason: 'Em chủ động đề xuất hướng khảo sát riêng theo quyền tự chủ.',
      unknowns: 'Cần bổ sung 2 nguồn thông tin độc lập (ghi rõ ngày và phạm vi) cùng 1 sản phẩm thử nghiệm nhỏ.',
      microExperiment: 'Lập phiếu kiểm chứng 2 nguồn độc lập và thử 1 bài Phòng thử nghề N gần nhất trong 7 ngày.',
      conditionsToVerify: 'Yêu cầu đầu vào, chi phí, cơ hội việc làm thực tế và điều không muốn đánh đổi.',
      studentChoice: profile.careerChoices?.['SUGGEST_CUSTOM'] ?? 'Muốn thử',
    });
  }

  return cards;
}

// ============================================================================
// 10. HỢP ĐỒNG BÁO CÁO NỘI BỘ 2.0.1 (INTERNAL REPORT CONTRACT & ROUND-TRIP)
// ============================================================================

export interface GroupResultSummary {
  score: number | null;
  validCount: number;
  totalItems: number;
  statusText: string;
}

export interface InternalReportContract {
  reportVersion: string;
  questionVersion: '2.0';
  ruleVersion: '2.0.1';
  generatedAt: string;
  profileId: string;
  grade: '10' | '11' | '12' | null;
  isDemo: boolean;
  isDraftAfterEdit: boolean;
  snapshotDisclaimer: string;
  dataCompleteness: Record<ModuleId, { answeredCount: number; totalCount: number; isSufficient: boolean }>;
  groupResults: Record<string, GroupResultSummary>;
  selfReportedStrengths: Array<{ code: string; label: string; score: number; disclaimer: string }>;
  confirmedEvidence: Array<{
    code: string;
    type: 'practice_rubric' | 'paired_observation' | 'readiness_product' | 'shared_reflection';
    summary: string;
    supportOrContext: string | null;
  }>;
  questionsToExplore: QuestionToExploreItem[];
  softSuggestions: SoftSuggestionCard[];
  actionPlan: ActionPlanItem[];
  studentReview: StudentReviewState;
  safetyPause: boolean;
}

export function generateInternalReport(
  profile: StudentProfileContract,
  options?: { reportVersion?: string; isDraftAfterEdit?: boolean; generatedAt?: string }
): InternalReportContract {
  const answers = profile.answers || {};
  const safetyPause = Boolean(profile.confirmedSafetyPause);
  const generatedAt = options?.generatedAt || new Date().toISOString();

  // Tính mức hoàn thành dữ liệu cho A–O (trừ M luôn để 0 vì tách kho riêng)
  const dataCompleteness = {} as Record<
    ModuleId,
    { answeredCount: number; totalCount: number; isSufficient: boolean }
  >;

  for (const mod of QUESTIONS_DB.modules) {
    const modQuestions = QUESTIONS_DB.questions.filter((q) => q.module === mod.id);
    let answeredCount = 0;
    for (const q of modQuestions) {
      const a = answers[q.id];
      if (a !== null && a !== undefined) {
        if (typeof a === 'string' && a !== '') answeredCount += 1;
        else if (Array.isArray(a) && a.length > 0) answeredCount += 1;
        else if (typeof a === 'object' && !Array.isArray(a)) {
          if (q.type === 'paired_observation' && ((a as PairedObservationAnswer).self || (a as PairedObservationAnswer).observer)) {
            answeredCount += 1;
          } else if (q.type === 'practice_rubric' && (a as PracticeRubricAnswer).score) {
            answeredCount += 1;
          } else if (q.type === 'private_reflection' && (a as PrivateReflectionAnswer).shareConsent) {
            answeredCount += 1;
          }
        }
      }
    }
    dataCompleteness[mod.id] = {
      answeredCount: mod.id === 'M' ? 0 : answeredCount,
      totalCount: mod.item_count,
      isSufficient: mod.id === 'M' ? false : answeredCount > 0,
    };
  }

  const defaultReview: StudentReviewState = profile.studentReview || {
    accurateParts: '',
    partsToEdit: '',
    additions: '',
    privateParts: '',
    decision: null,
    confirmedAt: null,
  };

  // Quy tắc S32: Khi safetyPause = true, ngừng tạo/hiển thị báo cáo hướng nghiệp thông thường cho phiên
  if (safetyPause) {
    return {
      reportVersion: options?.reportVersion || 'v1.0-safety-pause',
      questionVersion: '2.0',
      ruleVersion: '2.0.1',
      generatedAt,
      profileId: profile.profileId,
      grade: profile.grade,
      isDemo: Boolean(profile.isDemo),
      isDraftAfterEdit: Boolean(options?.isDraftAfterEdit),
      snapshotDisclaimer:
        'Phiên báo cáo hướng nghiệp đang tạm dừng để ưu tiên kết nối hỗ trợ an toàn cho em.',
      dataCompleteness,
      groupResults: {},
      selfReportedStrengths: [],
      confirmedEvidence: [],
      questionsToExplore: [],
      softSuggestions: [],
      actionPlan: (profile.actionPlan || []).map((item) => ({ ...item })),
      studentReview: defaultReview,
      safetyPause: true,
    };
  }

  const resA = scoreModuleA(answers);
  const resB = scoreModuleB(answers);
  const resC = scoreModuleC(answers);
  const resE = scoreModuleE(answers);
  const resG = scoreModuleG(answers);
  const resH = scoreModuleH(answers);
  const resJ = scoreModuleJ(answers);
  const resK = scoreModuleK(answers);
  const resN = scoreModuleN(answers);
  const resIO = extractSharedReflectionsIO(answers);

  const groupResults: Record<string, GroupResultSummary> = {};

  for (const [k, v] of Object.entries(resA.subgroups)) {
    groupResults[`A_${k}`] = {
      score: v.displayScore,
      validCount: v.validCount,
      totalItems: v.totalItems,
      statusText: v.statusText,
    };
  }
  for (const [k, v] of Object.entries(resB.subgroups)) {
    groupResults[`B_${k}`] = {
      score: v.displayScore,
      validCount: v.validCount,
      totalItems: v.totalItems,
      statusText: v.statusText,
    };
  }
  for (const [k, v] of Object.entries(resC.subgroups)) {
    groupResults[`C_${k}`] = {
      score: v.displayScore,
      validCount: v.validCount,
      totalItems: v.totalItems,
      statusText: v.statusText,
    };
  }
  for (const [k, v] of Object.entries(resH.subgroups)) {
    groupResults[`H_${k}`] = {
      score: v.displayScore,
      validCount: v.validCount,
      totalItems: v.totalItems,
      statusText: v.statusText,
    };
  }
  for (const [k, v] of Object.entries(resE.subgroups)) {
    groupResults[`E_${k}`] = {
      score: v.correctCount,
      validCount: v.validCount,
      totalItems: 3,
      statusText: v.isComplete ? `${v.correctCount}/3 (${v.levelGuidance})` : `Chưa đủ dữ liệu (${v.validCount}/3)`,
    };
  }
  groupResults['E_TOTAL'] = {
    score: resE.totalScoreOutOf12,
    validCount: resE.totalValidCount,
    totalItems: 12,
    statusText: resE.totalComplete ? `${resE.totalScoreOutOf12}/12` : `Chưa đủ dữ liệu (${resE.totalValidCount}/12)`,
  };
  for (const [k, v] of Object.entries(resK.subgroups)) {
    groupResults[`K_${k}`] = {
      score: v.correctCount,
      validCount: v.validCount,
      totalItems: 3,
      statusText: v.isComplete ? `${v.correctCount}/3 (${v.levelGuidance})` : `Chưa đủ dữ liệu (${v.validCount}/3)`,
    };
  }
  // Tuyệt đối không có A_TOTAL, H_TOTAL, K_TOTAL

  // 1. Điều em đã mô tả (Self-reported strengths)
  const selfReportedStrengths: Array<{ code: string; label: string; score: number; disclaimer: string }> = [];
  for (const [k, v] of Object.entries(resC.subgroups)) {
    if (v.isValid && v.displayScore !== null && v.displayScore >= 50) {
      selfReportedStrengths.push({
        code: `C_${k}`,
        label: v.label,
        score: v.displayScore,
        disclaimer: 'Em tự mô tả (chưa phải năng lực đã xác minh thực chứng)',
      });
    }
  }
  for (const [k, v] of Object.entries(resA.subgroups)) {
    if (v.isValid && v.displayScore !== null && v.displayScore >= 50) {
      selfReportedStrengths.push({
        code: `A_${k}`,
        label: v.label,
        score: v.displayScore,
        disclaimer: 'Em tự mô tả',
      });
    }
  }

  // 2. Minh chứng em đã có (Confirmed evidence: N đã xác nhận, J đủ điều kiện Y/Y, G mức 2, I/O đồng ý chia sẻ)
  const confirmedEvidence: InternalReportContract['confirmedEvidence'] = [];
  for (const [id, nItem] of Object.entries(resN.items)) {
    if (nItem.status !== 'Chưa đánh giá') {
      confirmedEvidence.push({
        code: id,
        type: 'practice_rubric',
        summary: `Sản phẩm thử nghề ${id} (Mức ${nItem.status}/2): ${nItem.evidence}`,
        supportOrContext: nItem.support,
      });
    }
  }
  for (const [id, jItem] of Object.entries(resJ.items)) {
    if (jItem.status !== 'Chưa đủ dữ liệu') {
      confirmedEvidence.push({
        code: id,
        type: 'paired_observation',
        summary: `Đối sánh hành vi ${id} [${jItem.status}] — Ví dụ của em: ${jItem.selfExample || 'Chưa thấy'} | Ví dụ quan sát: ${jItem.observerExample || 'Chưa thấy'}`,
        supportOrContext: 'Cùng bối cảnh & có đồng thuận hai bên',
      });
    }
  }
  for (const [id, state] of Object.entries(resG.itemStates)) {
    if (state === '2') {
      const q = QUESTION_MAP.get(id);
      confirmedEvidence.push({
        code: id,
        type: 'readiness_product',
        summary: `Đã có sản phẩm/bước chuẩn bị (${id}): ${q?.content || id}`,
        supportOrContext: 'Em báo đã có sản phẩm (mức 2)',
      });
    }
  }
  for (const [id, summary] of Object.entries(resIO.sharedSummaries)) {
    confirmedEvidence.push({
      code: id,
      type: 'shared_reflection',
      summary: `Tóm tắt em chủ động chọn chia sẻ (${id}): ${summary}`,
      supportOrContext: 'Có sự đồng ý chia sẻ riêng của em',
    });
  }

  const questionsToExplore = evaluateSupportMatrixT01ToT12(profile);
  const softSuggestions = generateSoftSuggestions(profile);

  return {
    reportVersion: options?.reportVersion || 'v1.0',
    questionVersion: '2.0',
    ruleVersion: '2.0.1',
    generatedAt,
    profileId: profile.profileId,
    grade: profile.grade,
    isDemo: Boolean(profile.isDemo),
    isDraftAfterEdit: Boolean(options?.isDraftAfterEdit),
    snapshotDisclaimer: 'Đây là ảnh chụp ở thời điểm hiện tại, không phải kết luận về con người em.',
    dataCompleteness,
    groupResults,
    selfReportedStrengths,
    confirmedEvidence,
    questionsToExplore,
    softSuggestions,
    actionPlan: (profile.actionPlan || []).map((item) => ({ ...item })),
    studentReview: defaultReview,
    safetyPause: false,
  };
}

/**
 * Kiểm tra JSON Round-Trip của báo cáo nội bộ (S31):
 * Đảm bảo horizonDays 7/30/90 giữ đúng kiểu số và các trường thiếu giữ nguyên null.
 */
export function roundTripReportJson(report: InternalReportContract): InternalReportContract {
  const serialized = JSON.stringify(report);
  const parsed = JSON.parse(serialized) as InternalReportContract;

  if (!Array.isArray(parsed.actionPlan)) {
    throw new Error('actionPlan bị mất cấu trúc mảng sau JSON round-trip');
  }
  for (const item of parsed.actionPlan) {
    if (item.horizonDays !== 7 && item.horizonDays !== 30 && item.horizonDays !== 90) {
      throw new Error(`horizonDays không đúng kiểu 7 | 30 | 90: ${String(item.horizonDays)}`);
    }
  }
  return parsed;
}

/**
 * Quản lý phiên bản báo cáo đã xác nhận vs bản dự thảo mới khi học sinh sửa đáp án (U04).
 */
export interface ReportVersionStore {
  confirmedReport: InternalReportContract | null;
  draftReport: InternalReportContract;
  hasUnconfirmedChanges: boolean;
}

export function updateReportStoreOnAnswerChange(
  currentStore: ReportVersionStore,
  updatedProfile: StudentProfileContract
): ReportVersionStore {
  const nextDraft = generateInternalReport(updatedProfile, {
    reportVersion: currentStore.confirmedReport
      ? `${currentStore.confirmedReport.reportVersion}-draft`
      : 'v1.0-draft',
    isDraftAfterEdit: currentStore.confirmedReport !== null,
  });

  // Tuyệt đối không ghi đè confirmedReport và kế hoạch đã xác nhận trong confirmedReport
  return {
    confirmedReport: currentStore.confirmedReport,
    draftReport: nextDraft,
    hasUnconfirmedChanges: currentStore.confirmedReport !== null,
  };
}

// ============================================================================
// 11. XUẤT BẢN TÓM TẮT CÓ XEM TRƯỚC & CHỌN TRƯỜNG (P06)
// ============================================================================

export interface ExportFieldSelection {
  includeSelfReportedAAndH: boolean;
  includeInterestsBAndSkillsC: boolean;
  includeValuesDAndContextF: boolean;
  includeVerifiedEvidenceNAndJ: boolean;
  includeActionPlan73090: boolean;
  includeSharedReflectionsIO: boolean; // Mặc định FALSE
  includeSupportRequests: boolean; // Mặc định FALSE
}

export const DEFAULT_EXPORT_SELECTION: ExportFieldSelection = {
  includeSelfReportedAAndH: true,
  includeInterestsBAndSkillsC: true,
  includeValuesDAndContextF: true,
  includeVerifiedEvidenceNAndJ: true,
  includeActionPlan73090: true,
  includeSharedReflectionsIO: false,
  includeSupportRequests: false,
};

export function buildSelectiveExportSummary(
  report: InternalReportContract,
  selection: ExportFieldSelection = DEFAULT_EXPORT_SELECTION
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    exportNotice:
      'Bản tóm tắt do học sinh chủ động xem trước và chọn trường xuất. Đây là ảnh chụp thời điểm hiện tại, không phải kết luận về con người học sinh.',
    reportVersion: report.reportVersion,
    questionVersion: report.questionVersion,
    ruleVersion: report.ruleVersion,
    generatedAt: report.generatedAt,
    profileId: report.profileId,
    grade: report.grade,
  };

  if (selection.includeSelfReportedAAndH) {
    payload.selfAwarenessAAndH = Object.fromEntries(
      Object.entries(report.groupResults).filter(([k]) => k.startsWith('A_') || k.startsWith('H_'))
    );
  }

  if (selection.includeInterestsBAndSkillsC) {
    payload.interestsBAndSelfReportedSkillsC = Object.fromEntries(
      Object.entries(report.groupResults).filter(([k]) => k.startsWith('B_') || k.startsWith('C_'))
    );
    payload.selfReportedStrengths = report.selfReportedStrengths;
  }

  if (selection.includeValuesDAndContextF) {
    payload.softSuggestions = report.softSuggestions;
  }

  if (selection.includeVerifiedEvidenceNAndJ) {
    payload.confirmedEvidence = report.confirmedEvidence.filter((e) => e.type !== 'shared_reflection');
  }

  if (selection.includeActionPlan73090) {
    payload.actionPlan = report.actionPlan;
  }

  // Mặc định loại I/O và yêu cầu hỗ trợ trừ khi học sinh chủ động bật
  if (selection.includeSharedReflectionsIO) {
    payload.sharedReflectionsIO = report.confirmedEvidence.filter((e) => e.type === 'shared_reflection');
  }

  if (selection.includeSupportRequests) {
    payload.questionsToExplore = report.questionsToExplore;
  }

  return payload;
}

// ============================================================================
// 12. HỒ SƠ MỚI & HỒ SƠ GIẢ LẬP MINH HỌA (DEMO PROFILE - U05)
// ============================================================================

export function createEmptyStudentProfile(grade: '10' | '11' | '12' | null = null): StudentProfileContract {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return {
    questionVersion: '2.0',
    ruleVersion: '2.0.1',
    profileId: `local-${randomSuffix}`,
    grade,
    isDemo: false,
    answers: {},
    valuePriorities: [],
    boundary: null,
    confirmedSafetyPause: false,
    supportVerifications: {},
    actionPlan: [],
    studentReview: {
      accurateParts: '',
      partsToEdit: '',
      additions: '',
      privateParts: '',
      decision: null,
      confirmedAt: null,
    },
    careerChoices: {},
    customCareerDirection: null,
    laBan14CompletedIds: [],
    evidencePassport: [],
    meaningfulDays: [],
    empathyTriangle: {
      studentWants: '',
      familyCares: '',
      verifiedCostAndInfo: '',
      agreedMicroStep: '',
      reviewDate: '',
      safeToShareWithFamily: false,
    },
    sourceVerifications: [],
  };
}

export function createDemoStudentProfile(): StudentProfileContract {
  const answers: Record<string, AnswerValue> = {
    // A (12 câu)
    A01: '4',
    A02: '4',
    A03: '3',
    A04: '4',
    A05: '4',
    A06: '5',
    A07: '4',
    A08: '4',
    A09: '3',
    A10: '4',
    A11: '3',
    A12: '4',
    // B (36 câu: I và A cao, R trung bình khá)
    B01: '3',
    B12: '3',
    B17: '4',
    B22: '3',
    B27: '3',
    B32: '3', // R
    B02: '5',
    B07: '4',
    B18: '5',
    B23: '4',
    B28: '5',
    B33: '4', // I dẫn đầu
    B03: '4',
    B08: '5',
    B13: '4',
    B24: '4',
    B29: '5',
    B34: '4', // A đồng dẫn đầu
    B04: '3',
    B09: '4',
    B14: '3',
    B19: '3',
    B30: '4',
    B35: '3', // S
    B05: '2',
    B10: '3',
    B15: '2',
    B20: '3',
    B25: '2',
    B36: '3', // E
    B06: '3',
    B11: '4',
    B16: '3',
    B21: '3',
    B26: '4',
    B31: '3', // C
    // C (24 câu: 0-4)
    C01: '2',
    C07: '2',
    C13: '1',
    C19: '2', // TT
    C02: '3',
    C08: '3',
    C14: '2',
    C20: '3', // TH
    C03: '1',
    C09: '1',
    C15: 'U',
    C21: '1', // ST thấp -> kích hoạt câu hỏi T01 với B_A dẫn đầu
    C04: '3',
    C10: '2',
    C16: '3',
    C22: '2', // GT
    C05: '2',
    C11: '2',
    C17: '1',
    C23: '2', // TC
    C06: '3',
    C12: '3',
    C18: '2',
    C24: '3', // SO
    // D (10 câu: 0-4)
    D01: '3',
    D02: '4',
    D03: '4',
    D04: '3',
    D05: '3',
    D06: '2',
    D07: '4',
    D08: '3',
    D09: '2',
    D10: '4',
    // E (12 câu)
    E01: 'B',
    E02: 'D',
    E03: 'A',
    E04: 'C',
    E05: 'C',
    E06: 'A',
    E07: 'D',
    E08: 'B',
    E09: 'D',
    E10: 'B',
    E11: 'C',
    E12: 'A',
    // F (8 câu)
    F01: 'B',
    F02: ['A', 'C'],
    F03: ['A', 'D'],
    F04: ['A', 'B'],
    F05: ['A'],
    F06: ['C'],
    F07: ['B'],
    F08: ['A', 'B'],
    // G (8 câu)
    G01: '2',
    G02: '2',
    G03: '1',
    G04: '1',
    G05: '2',
    G06: '1',
    G07: '0',
    G08: '1',
    // H (16 câu)
    H01: '4',
    H02: '4',
    H03: '3',
    H04: '3',
    H05: '4',
    H06: '3',
    H07: '4',
    H08: '4',
    H09: '3',
    H10: '4',
    H11: '3',
    H12: '4',
    H13: '3',
    H14: '3',
    H15: '4',
    H16: '3',
    // I (mặc định không lưu trừ câu đồng ý chia sẻ tóm tắt)
    I01: {
      shareConsent: true,
      sharedSummary: 'Em nhận ra mình tập trung nhất khi phân tích số liệu môi trường và vẽ sơ đồ giải thích (DEMO).',
      keepOnPaperOnly: false,
    },
    I02: {
      shareConsent: false,
      sharedSummary: null,
      keepOnPaperOnly: true,
    },
    // J (Đối sánh hành vi)
    J01: {
      self: 'Y',
      selfExample: 'Đặt 2 câu hỏi làm rõ tiêu chí trong buổi làm dự án Sinh học (DEMO).',
      observer: 'Y',
      observerExample: 'Bạn chủ động hỏi lại nhóm về phân công bảng số liệu (DEMO).',
      sameContext: true,
      mutualConsent: true,
    },
    J02: {
      self: 'Y',
      selfExample: 'Báo sớm cho nhóm trước 1 ngày khi cần đổi lịch nộp bài (DEMO).',
      observer: 'N',
      observerExample: null,
      sameContext: true,
      mutualConsent: true,
    },
    // K (12 câu)
    K01: 'A',
    K02: 'C',
    K03: 'B',
    K04: 'D',
    K05: 'B',
    K06: 'A',
    K07: 'D',
    K08: 'C',
    K09: 'A',
    K10: 'D',
    K11: 'B',
    K12: 'C',
    // L (12 câu)
    L01: '2',
    L02: '1',
    L03: '1',
    L04: '2',
    L05: '1',
    L06: '2',
    L07: '1',
    L08: 'U',
    L09: '2',
    L10: '1',
    L11: '1',
    L12: '1',
    // N (Phòng thử nghề trên giấy)
    N01: {
      score: '2',
      evidence: 'Phiếu đọc bảng dữ liệu câu lạc bộ kèm 2 nhận xét đúng mẫu số và 1 câu hỏi mở (DEMO).',
      support: 'Tự làm trên giấy, đối chiếu cùng giáo viên tư vấn',
      reviewerConfirmed: true,
    },
    N02: {
      score: '1',
      evidence: 'Bảng dự toán 2 lộ trình học tập (đã có học phí, còn bổ sung chi phí sinh hoạt) (DEMO).',
      support: 'Có hướng dẫn mẫu khung bảng',
      reviewerConfirmed: true,
    },
  };

  return {
    questionVersion: '2.0',
    ruleVersion: '2.0.1',
    profileId: 'demo-random-01',
    grade: '11',
    isDemo: true,
    answers,
    valuePriorities: ['D02', 'D10', 'D03'],
    boundary: 'Không đánh đổi thời gian nghỉ ngơi tối thiểu và sự minh bạch thông tin (DEMO).',
    confirmedSafetyPause: false,
    supportVerifications: {},
    actionPlan: [
      {
        id: 'plan-7d-demo',
        horizonDays: 7,
        task: 'Thực hiện bài thử nghề N04 trên giấy A4 (phác thảo thông điệp tiết kiệm nước tại trường)',
        evidence: '1 bản phác thảo A4 có mục tiêu, đối tượng và thông điệp chính',
        dueDate: '2026-12-01',
        support: 'Giáo viên tư vấn hoặc bạn cùng nhóm nhận xét thử',
        adjustment: 'Nếu bận lịch kiểm tra, thu gọn thành khung dàn ý 3 ý chính trong 15 phút',
        status: 'đang làm',
      },
      {
        id: 'plan-30d-demo',
        horizonDays: 30,
        task: 'Tra cứu và đối chiếu 2 nguồn độc lập về chương trình Khoa học môi trường & Thiết kế truyền thông',
        evidence: 'Phiếu ghi 2 nguồn chính thức kèm ngày công bố và học phí dự kiến (N02)',
        dueDate: '2026-12-24',
        support: 'Tổ tư vấn học đường hướng dẫn cách đọc đề án tuyển sinh',
        adjustment: 'Có thể bổ sung thêm phương án Cao đẳng thực hành gần nhà',
        status: 'đã chọn',
      },
      {
        id: 'plan-90d-demo',
        horizonDays: 90,
        task: 'Tổng hợp 3 sản phẩm trong Hộ chiếu minh chứng và xem lại bản đồ lựa chọn cùng người tư vấn',
        evidence: '3 thẻ Hộ chiếu minh chứng (N01, N02, N04) và ghi chú điều học được',
        dueDate: '2027-02-24',
        support: 'Buổi trao đổi Tam giác thấu cảm tự nguyện',
        adjustment: 'Giữ quyền đổi hướng thử nghiệm nếu phát hiện nhiệm vụ thực tế khác kỳ vọng',
        status: 'dự thảo',
      },
    ],
    studentReview: {
      accurateParts: 'Nhóm sở thích I (Nghiên cứu) và A (Sáng tạo) phản ánh đúng các hoạt động em thích làm (DEMO).',
      partsToEdit: 'Em muốn thử thêm bài N04 trước khi đánh giá kỹ năng ST (DEMO).',
      additions: 'Em quan tâm thêm đến bối cảnh nông nghiệp – môi trường tại Tây Nguyên (DEMO).',
      privateParts: 'Các câu tự vấn I02–I16 em giữ riêng trên sổ tay giấy (DEMO).',
      decision: 'Đồng ý',
      confirmedAt: '2026-11-24T08:00:00.000Z',
    },
    careerChoices: {
      SUGGEST_I: 'Muốn thử',
      SUGGEST_A: 'Còn phân vân',
    },
    customCareerDirection: 'Khoa học môi trường & Truyền thông bền vững (DEMO)',
    laBan14CompletedIds: [1, 3],
    evidencePassport: [
      {
        id: 'ev-demo-1',
        title: 'Đọc bảng dữ liệu hoạt động CLB (N01 - DEMO)',
        date: '2026-11-20',
        relatedCode: 'N01 / C_TH',
        whatIDid: 'Đọc bảng số liệu 3 hoạt động, đối chiếu tỷ lệ tham gia và rút ra 2 nhận xét.',
        conditionsAndSupport: 'Làm trên giấy trong 15 phút, có thầy/cô xác nhận rubric.',
        result: 'Đạt mức 2/2 — phân biệt được số lượng tuyệt đối và tỷ lệ.',
        learned: 'Em thích việc tìm nguyên nhân đằng sau con số hơn là chỉ đọc kết luận.',
        nextStep: 'Thử đọc một bảng số liệu về nguồn nước hoặc nông nghiệp địa phương.',
      },
      {
        id: 'ev-demo-2',
        title: 'Lập dự toán 2 phương án học tập (N02 - DEMO)',
        date: '2026-11-22',
        relatedCode: 'N02 / F03',
        whatIDid: 'So sánh chi phí học phí và đi lại giữa một trường xa và một trường gần nhà.',
        conditionsAndSupport: 'Tra cứu thông báo học phí năm gần nhất.',
        result: 'Đạt mức 1/2 — đã có nguồn học phí, cần ghi thêm khoản phát sinh.',
        learned: 'Biết cách chia nhỏ khoản chi giúp em bớt lo lắng mơ hồ.',
        nextStep: 'Hỏi thêm tổ tư vấn về điều kiện học bổng hỗ trợ.',
      },
    ],
    meaningfulDays: [
      {
        id: 'md-demo-1',
        date: '2026-11-24',
        promptId: 'A05',
        reflection: 'Hôm nay em đã giải thích được một bảng số liệu khó cho bạn cùng bàn và nghỉ ngơi đúng giờ (DEMO).',
        keepOnPaper: false,
      },
    ],
    empathyTriangle: {
      studentWants: 'Thử nghiệm song song hướng Khoa học môi trường (I) và Thiết kế thông điệp (A) trong học kỳ này (DEMO).',
      familyCares: 'Gia đình mong muốn rõ lộ trình học phí, độ an toàn khi đi học xa và cơ hội việc làm (DEMO).',
      verifiedCostAndInfo: 'Đã lập bảng dự toán sơ bộ N02 từ 2 nguồn thông báo tuyển sinh chính thức (DEMO).',
      agreedMicroStep: 'Trong 14 ngày tới, hoàn thành 2 sản phẩm thử nghề trên giấy (N01, N04) rồi cùng xem lại (DEMO).',
      reviewDate: '2026-12-15',
      safeToShareWithFamily: true,
    },
    sourceVerifications: [
      {
        id: 'sv-demo-1',
        directionTitle: 'Khoa học môi trường ứng dụng (DEMO)',
        source1Name: 'Đề án tuyển sinh chính thức trường ĐH/CĐ công lập (DEMO)',
        source1Date: '2026-05-15',
        source1Scope: 'Toàn quốc / Khu vực miền Trung - Tây Nguyên',
        source2Name: 'Báo cáo nhu cầu nhân lực môi trường & nông nghiệp bền vững (DEMO)',
        source2Date: '2026-03-10',
        source2Scope: 'Địa phương & doanh nghiệp chế biến nông sản',
        scenarioBaseline: 'Theo học chương trình chuẩn, thực tập tại trạm quan trắc hoặc dự án nông nghiệp.',
        scenarioTechChange: 'Kết hợp thêm kỹ năng sử dụng cảm biến dữ liệu và kiểm chứng công cụ AI (K04, N06).',
        scenarioResourceChange: 'Chọn chương trình gần nhà hoặc vừa học vừa thực hành có học bổng hỗ trợ (F03B, K08).',
      },
    ],
  };
}

// ============================================================================
// 13. DANH SÁCH 7 HOẠT ĐỘNG TỰ CHỌN "LA BÀN 14" & BỐI CẢNH TÂY NGUYÊN
// ============================================================================

export interface LaBan14Activity {
  id: number;
  dayRange: string;
  title: string;
  voluntaryProduct: string;
  linkedCodes: string[];
  targetModule: ModuleId;
  promptQuestion: string;
}

export const LA_BAN_14_ACTIVITIES: LaBan14Activity[] = [
  {
    id: 1,
    dayRange: 'Ngày 1–2',
    title: 'Hai việc em từng làm và ba điều quan trọng',
    voluntaryProduct: 'Thẻ thế mạnh có ví dụ + tối đa 3 giá trị ưu tiên',
    linkedCodes: ['A01', 'D01', 'H01'],
    targetModule: 'A',
    promptQuestion: 'Trong 1–2 tháng qua, việc nhỏ nào em đã hoàn thành và điều gì quan trọng nhất với em khi làm việc đó?',
  },
  {
    id: 2,
    dayRange: 'Ngày 3–4',
    title: 'Hỏi một người em tin cậy về một hành vi cụ thể',
    voluntaryProduct: 'Một ví dụ hành vi cùng bối cảnh (không bình chọn tính cách)',
    linkedCodes: ['H09', 'J01'],
    targetModule: 'J',
    promptQuestion: 'Khi làm việc nhóm ở lớp, hành vi cụ thể nào của em mà bạn cùng nhóm từng quan sát thấy?',
  },
  {
    id: 3,
    dayRange: 'Ngày 5–6',
    title: 'Thử một nhiệm vụ vừa sức trong Phòng thử nghề',
    voluntaryProduct: 'Một sản phẩm trên giấy và cảm nhận sau khi làm',
    linkedCodes: ['B01', 'C01', 'N01'],
    targetModule: 'N',
    promptQuestion: 'Khi trực tiếp làm thử một sản phẩm ngắn trên giấy, bước nào khiến em hứng thú và bước nào cần thêm hướng dẫn?',
  },
  {
    id: 4,
    dayRange: 'Ngày 7–8',
    title: 'Kiểm chứng lời quảng cáo hoặc lời khuyên AI giả định',
    voluntaryProduct: 'Phiếu đối chiếu hai nguồn độc lập và giới hạn dữ liệu',
    linkedCodes: ['E01', 'K02', 'N06'],
    targetModule: 'E',
    promptQuestion: 'Nhận định nào trong lời quảng cáo/gợi ý AI cần được kiểm tra lại theo năm, địa bàn và thông báo chính thức?',
  },
  {
    id: 5,
    dayRange: 'Ngày 9–10',
    title: 'Tưởng tượng các lựa chọn và điều kiện thay đổi',
    voluntaryProduct: 'Hai hướng khảo sát kèm ba kịch bản (cơ sở, công nghệ, nguồn lực)',
    linkedCodes: ['I14', 'D03', 'F01'],
    targetModule: 'D',
    promptQuestion: 'Nếu nguồn lực hoặc công nghệ thay đổi, kỹ năng chuyển đổi nào vẫn giúp em thích ứng ở cả hai hướng?',
  },
  {
    id: 6,
    dayRange: 'Ngày 11–12',
    title: 'Tìm một nguồn lực, so sánh chi phí học tập',
    voluntaryProduct: 'Phiếu dự toán N02 hoặc kế hoạch tiếp cận đầu mối hỗ trợ',
    linkedCodes: ['F03', 'L02', 'N02'],
    targetModule: 'F',
    promptQuestion: 'Những khoản chi phí nào đã có nguồn chính thức và đầu mối nào ở trường có thể cùng em rà soát học bổng?',
  },
  {
    id: 7,
    dayRange: 'Ngày 13–14',
    title: 'Chọn việc nhỏ sẽ làm tiếp theo',
    voluntaryProduct: 'Kế hoạch 7–30–90 ngày có minh chứng và ngày tự xem lại',
    linkedCodes: ['G05', 'O08'],
    targetModule: 'G',
    promptQuestion: 'Việc nhỏ nào trong 7 ngày tới (chỉ 10–15 phút) em có thể bắt đầu ngay mà không gây quá tải?',
  },
];

export interface LocalPracticeSuggestion {
  nCode: string;
  contextTitle: string;
  practicePrompt: string;
  paperMaterials: string;
}

export const TAY_NGUYEN_PRACTICE_SUGGESTIONS: Record<string, LocalPracticeSuggestion> = {
  N01: {
    nCode: 'N01',
    contextTitle: 'Bối cảnh gợi ý luyện tập: Nông nghiệp & Môi trường Tây Nguyên',
    practicePrompt:
      'Đọc bảng số liệu giả định về lượng nước tưới tiết kiệm cho vườn cà phê/hồ tiêu hoặc lượng rác thải nhựa tại điểm du lịch sinh thái, rút ra 2 nhận xét và 1 câu hỏi cần kiểm chứng thêm.',
    paperMaterials: 'Giấy A4, bút chì, bảng số liệu in sẵn (không cần máy tính hay mạng).',
  },
  N02: {
    nCode: 'N02',
    contextTitle: 'Bối cảnh gợi ý luyện tập: So sánh lộ trình học tập từ địa phương',
    practicePrompt:
      'Lập bảng so sánh chi phí giữa phương án học Cao đẳng/ĐH tại tỉnh (hoặc vùng lân cận) và phương án đi thành phố xa, ghi rõ chi phí đi lại, ký túc xá và nguồn học bổng địa phương.',
    paperMaterials: 'Phiếu kẻ bảng 2 cột trên giấy, thông báo tuyển sinh bản in tại phòng tư vấn.',
  },
  N03: {
    nCode: 'N03',
    contextTitle: 'Bối cảnh gợi ý luyện tập: Quy trình kỹ thuật chế biến / bảo quản nông sản an toàn',
    practicePrompt:
      'Viết hướng dẫn 5 bước phân loại hoặc bảo quản mẫu nông sản/dụng cụ thí nghiệm tại trường sao cho học sinh khác đọc là thực hiện được an toàn.',
    paperMaterials: 'Giấy ghi chú 5 bước, sơ đồ mũi tên tay.',
  },
  N04: {
    nCode: 'N04',
    contextTitle: 'Bối cảnh gợi ý luyện tập: Truyền thông du lịch cộng đồng & bảo vệ rừng',
    practicePrompt:
      'Phác thảo áp phích trên giấy A4 giới thiệu một nét văn hóa/du lịch cộng đồng hoặc thông điệp phân loại rác tại trường học địa phương.',
    paperMaterials: 'Giấy A4, bút màu hoặc bút bi (chấm theo bố cục và thông điệp, không chấm hoa tay).',
  },
  N05: {
    nCode: 'N05',
    contextTitle: 'Bối cảnh gợi ý luyện tập: Giải thích kiến thức cho học sinh lớp dưới',
    practicePrompt:
      'Viết đoạn giải thích ngắn (100–150 từ) về chu trình nước, cách phòng tránh tin giả hoặc một khái niệm học tập kèm 1 ví dụ gần gũi với đời sống buôn làng/khu phố.',
    paperMaterials: 'Giấy viết tay và 1 câu hỏi kiểm tra mức hiểu của người nghe.',
  },
  N06: {
    nCode: 'N06',
    contextTitle: 'Bối cảnh gợi ý luyện tập: Kiểm chứng lời khuyên AI về nghề nghiệp địa phương',
    practicePrompt:
      'Đánh dấu các nhận định chưa kiểm chứng khi một đoạn văn AI nói về “ngành chắc chắn lương cao tại địa phương” và nêu 2 nguồn chính thức cần đối chiếu.',
    paperMaterials: 'Đoạn văn mẫu trên giấy, bút gạch chân 3 nhận định cần kiểm chứng.',
  },
  N07: {
    nCode: 'N07',
    contextTitle: 'Bối cảnh gợi ý luyện tập: Tổ chức góc trải nghiệm nghề tại trường THPT',
    practicePrompt:
      'Lập kế hoạch 45 phút cho nhóm 4 học sinh tổ chức góc trưng bày sản phẩm nông nghiệp/khoa học/văn hóa tại lớp kèm phương án dự phòng.',
    paperMaterials: 'Sơ đồ dòng thời gian 45 phút và bảng phân vai 4 người.',
  },
  N08: {
    nCode: 'N08',
    contextTitle: 'Bối cảnh gợi ý luyện tập: Thích ứng đa kịch bản',
    practicePrompt:
      'Xác định 1 kỹ năng chuyển đổi dùng được cả khi học tiếp lên bậc cao hơn hoặc khi tham gia dự án dịch vụ – kỹ thuật tại địa phương.',
    paperMaterials: 'Phiếu 2 kịch bản và 1 hành động 7 ngày.',
  },
};
