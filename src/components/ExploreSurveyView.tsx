import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  List,
  BookOpen,
  Lock,
  ArrowUp,
  ArrowDown,
  FileText,
  Users,
  Wrench,
  Eye,
  RotateCcw,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import {
  QUESTIONS_DB,
  QUESTION_MAP,
  TAY_NGUYEN_PRACTICE_SUGGESTIONS,
  validateQuestionAnswer,
  lookupItemFeedback,
  scoreModuleE,
  scoreModuleK,
  type StudentProfileContract,
  type ModuleId,
  type AnswerValue,
  type PairedObservationAnswer,
  type PracticeRubricAnswer,
  type PrivateReflectionAnswer,
} from '../utils/labanEngine';

interface ExploreSurveyViewProps {
  profile: StudentProfileContract;
  activeModule: ModuleId;
  initialQuestionId?: string | null;
  onSelectModule: (modId: ModuleId) => void;
  onUpdateAnswer: (questionId: string, value: AnswerValue) => { success: boolean; error?: string };
  onUpdateValuePriorities: (priorities: string[]) => { success: boolean; error?: string };
  onUpdateBoundary: (boundary: string | null) => void;
  onSaveAndExitToProfile: () => void;
}

interface TopicCluster {
  id: string;
  title: string;
  subtitle: string;
  modules: ModuleId[];
}

const PERSONAL_CLUSTERS: TopicCluster[] = [
  {
    id: 'self',
    title: '01. Hiểu mình',
    subtitle: 'Điểm mạnh, ý nghĩa & tự nhận thức 2 trục',
    modules: ['A', 'H', 'I'],
  },
  {
    id: 'interest_skill',
    title: '02. Sở thích & Kỹ năng',
    subtitle: 'RIASEC, kỹ năng tự mô tả & Phòng thử nghề',
    modules: ['B', 'C', 'N'],
  },
  {
    id: 'value_context',
    title: '03. Giá trị & Bối cảnh',
    subtitle: 'Giá trị ưu tiên, ranh giới & nguồn lực hỗ trợ',
    modules: ['D', 'F'],
  },
  {
    id: 'choice_info',
    title: '04. Lựa chọn & Thông tin',
    subtitle: 'Tình huống quyết định, thị trường & hành vi 30 ngày',
    modules: ['E', 'K', 'L'],
  },
  {
    id: 'connect',
    title: '05. Kết nối',
    subtitle: 'Đối sánh hành vi 2 chiều cùng bối cảnh',
    modules: ['J'],
  },
  {
    id: 'action',
    title: '06. Hành động',
    subtitle: 'Sẵn sàng hành động & nhật ký tự giữ',
    modules: ['G', 'O'],
  },
];

export const ExploreSurveyView: React.FC<ExploreSurveyViewProps> = ({
  profile,
  activeModule,
  initialQuestionId,
  onSelectModule,
  onUpdateAnswer,
  onUpdateValuePriorities,
  onUpdateBoundary,
  onSaveAndExitToProfile,
}) => {
  const safeModule: ModuleId = activeModule === 'M' ? 'A' : activeModule;

  const [selectedClusterId, setSelectedClusterId] = useState<string>('all');

  const moduleMeta = useMemo(
    () => QUESTIONS_DB.modules.find((m) => m.id === safeModule) || QUESTIONS_DB.modules[0],
    [safeModule]
  );

  const moduleQuestions = useMemo(
    () => QUESTIONS_DB.questions.filter((q) => q.module === safeModule),
    [safeModule]
  );

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'single' | 'list' | 'ek_review' | 'd_priority'>('single');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setValidationError(null);
    setViewMode('single');
    if (initialQuestionId) {
      const idx = moduleQuestions.findIndex((q) => q.id === initialQuestionId);
      if (idx >= 0) {
        setCurrentIndex(idx);
        return;
      }
    }
    setCurrentIndex(0);
  }, [safeModule, initialQuestionId, moduleQuestions]);

  const currentQuestion = moduleQuestions[currentIndex] || moduleQuestions[0];
  const currentAnswer = profile.answers[currentQuestion.id] ?? null;

  const getModuleAnsweredCount = (modId: ModuleId): number => {
    const qs = QUESTIONS_DB.questions.filter((q) => q.module === modId);
    let count = 0;
    for (const q of qs) {
      const a = profile.answers[q.id];
      if (a !== null && a !== undefined) {
        if (typeof a === 'string' && a !== '') count += 1;
        else if (Array.isArray(a) && a.length > 0) count += 1;
        else if (typeof a === 'object' && !Array.isArray(a)) {
          if (
            q.type === 'paired_observation' &&
            ((a as PairedObservationAnswer).self || (a as PairedObservationAnswer).observer)
          ) {
            count += 1;
          } else if (q.type === 'practice_rubric' && (a as PracticeRubricAnswer).score) {
            count += 1;
          } else if (
            q.type === 'private_reflection' &&
            ((a as PrivateReflectionAnswer).shareConsent ||
              (a as PrivateReflectionAnswer).keepOnPaperOnly)
          ) {
            count += 1;
          }
        }
      }
    }
    return count;
  };

  const handleSelectSingle = (val: string) => {
    setValidationError(null);
    const res = onUpdateAnswer(currentQuestion.id, val);
    if (!res.success) {
      setValidationError(res.error || 'Lựa chọn không hợp lệ.');
    }
  };

  const handleClearCurrentAnswer = () => {
    setValidationError(null);
    onUpdateAnswer(currentQuestion.id, null);
  };

  const handleToggleMultiOption = (optValue: string) => {
    setValidationError(null);
    const currentArr = Array.isArray(currentAnswer) ? [...currentAnswer] : [];
    const exists = currentArr.includes(optValue);
    const nextArr = exists ? currentArr.filter((v) => v !== optValue) : [...currentArr, optValue];

    const check = validateQuestionAnswer(currentQuestion.id, nextArr);
    if (!check.valid) {
      setValidationError(check.error || 'Kết hợp lựa chọn không hợp lệ.');
      return;
    }
    onUpdateAnswer(currentQuestion.id, nextArr.length > 0 ? nextArr : null);
  };

  const currentJ: PairedObservationAnswer =
    currentQuestion.type === 'paired_observation' &&
    currentAnswer &&
    typeof currentAnswer === 'object' &&
    !Array.isArray(currentAnswer)
      ? (currentAnswer as PairedObservationAnswer)
      : {
          self: null,
          selfExample: null,
          observer: null,
          observerExample: null,
          sameContext: false,
          mutualConsent: false,
        };

  const handleUpdateJ = (patch: Partial<PairedObservationAnswer>) => {
    setValidationError(null);
    const nextJ: PairedObservationAnswer = { ...currentJ, ...patch };
    const res = onUpdateAnswer(currentQuestion.id, nextJ);
    if (!res.success) {
      setValidationError(res.error || 'Dữ liệu J không hợp lệ.');
    }
  };

  const currentN: PracticeRubricAnswer =
    currentQuestion.type === 'practice_rubric' &&
    currentAnswer &&
    typeof currentAnswer === 'object' &&
    !Array.isArray(currentAnswer)
      ? (currentAnswer as PracticeRubricAnswer)
      : {
          score: null,
          evidence: null,
          support: null,
          reviewerConfirmed: false,
        };

  const handleUpdateN = (patch: Partial<PracticeRubricAnswer>) => {
    setValidationError(null);
    const nextN: PracticeRubricAnswer = { ...currentN, ...patch };
    const res = onUpdateAnswer(currentQuestion.id, nextN);
    if (!res.success) {
      setValidationError(res.error || 'Dữ liệu N không hợp lệ.');
    }
  };

  const currentIO: PrivateReflectionAnswer =
    currentQuestion.type === 'private_reflection' &&
    currentAnswer &&
    typeof currentAnswer === 'object' &&
    !Array.isArray(currentAnswer)
      ? (currentAnswer as PrivateReflectionAnswer)
      : {
          shareConsent: false,
          sharedSummary: null,
          keepOnPaperOnly: true,
          localPrivateNote: null,
        };

  const handleUpdateIO = (patch: Partial<PrivateReflectionAnswer>) => {
    setValidationError(null);
    const nextIO: PrivateReflectionAnswer = { ...currentIO, ...patch };
    if (!nextIO.shareConsent) {
      nextIO.sharedSummary = null;
    }
    const res = onUpdateAnswer(currentQuestion.id, nextIO);
    if (!res.success) {
      setValidationError(res.error || 'Dữ liệu I/O không hợp lệ.');
    }
  };

  const handleTogglePriorityD = (dId: string) => {
    setValidationError(null);
    const current = profile.valuePriorities || [];
    if (current.includes(dId)) {
      onUpdateValuePriorities(current.filter((id) => id !== dId));
    } else {
      if (current.length >= 3) {
        setValidationError(
          'Em chỉ chọn tối đa 3 giá trị ưu tiên ở phần D. Hãy bỏ chọn một mã trước khi thêm mã mới.'
        );
        return;
      }
      onUpdateValuePriorities([...current, dId]);
    }
  };

  const handleMovePriorityD = (index: number, direction: -1 | 1) => {
    const current = [...(profile.valuePriorities || [])];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= current.length) return;
    const temp = current[index];
    current[index] = current[targetIdx];
    current[targetIdx] = temp;
    onUpdateValuePriorities(current);
  };

  const isEKModule = safeModule === 'E' || safeModule === 'K';
  const itemFeedback = lookupItemFeedback(currentQuestion.id, currentAnswer);

  const visibleClusters = useMemo(() => {
    if (selectedClusterId === 'all') return PERSONAL_CLUSTERS;
    return PERSONAL_CLUSTERS.filter((c) => c.id === selectedClusterId);
  }, [selectedClusterId]);

  const primaryOptions = useMemo(() => {
    if (currentQuestion.type !== 'scale' && currentQuestion.type !== 'single_choice') {
      return currentQuestion.options;
    }
    return currentQuestion.options.filter((o) => o.value !== 'U' && o.value !== 'X');
  }, [currentQuestion]);

  const autonomyOptions = useMemo(() => {
    if (currentQuestion.type !== 'scale' && currentQuestion.type !== 'single_choice') {
      return [];
    }
    return currentQuestion.options.filter((o) => o.value === 'U' || o.value === 'X');
  }, [currentQuestion]);

  return (
    <div className="space-y-6">
      {/* 1. BỘ LỌC MẠCH KHÁM PHÁ & DANH SÁCH 14 PHÂN HỆ CÁ NHÂN (A–O, TÁCH M) */}
      <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--lb-border)] pb-4">
          <div>
            <div className="text-xs font-bold text-[var(--lb-primary)] flex items-center gap-2">
              <span>02. Khám phá Ngân hàng chuẩn 2.0.1</span>
              <span aria-hidden="true">·</span>
              <span>14 phân hệ cá nhân (194 mục)</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold mt-0.5">
              Chọn chủ đề & phân hệ em muốn khảo sát (Tôn trọng quyền chọn U / X ở mọi câu)
            </h1>
          </div>

          <button
            type="button"
            onClick={onSaveAndExitToProfile}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[var(--lb-primary)] text-white dark:text-[#0B1514] font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap shrink-0 hover:opacity-95 lb-transition"
          >
            <UserCheck className="w-4 h-4 shrink-0" />
            <span>Lưu và xem Hồ sơ</span>
          </button>
        </div>

        {/* Thanh lọc 6 mạch chủ đề */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedClusterId('all')}
            className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap shrink-0 lb-transition ${
              selectedClusterId === 'all'
                ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] border-transparent'
                : 'bg-[var(--lb-bg)] border-[var(--lb-border)] text-[var(--lb-muted)] hover:text-[var(--lb-text)]'
            }`}
          >
            Tất cả 6 mạch (14 phân hệ)
          </button>
          {PERSONAL_CLUSTERS.map((cluster) => {
            const active = selectedClusterId === cluster.id;
            return (
              <button
                key={cluster.id}
                type="button"
                onClick={() => setSelectedClusterId(cluster.id)}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap shrink-0 lb-transition ${
                  active
                    ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] border-transparent'
                    : 'bg-[var(--lb-bg)] border-[var(--lb-border)] text-[var(--lb-muted)] hover:text-[var(--lb-text)]'
                }`}
              >
                {cluster.title} ({cluster.modules.join('·')})
              </button>
            );
          })}
        </div>

        {/* Lưới phân hệ theo mạch đã chọn */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleClusters.map((cluster) => (
            <div
              key={cluster.id}
              className="p-3.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-[var(--lb-text)]">{cluster.title}</div>
                <span className="text-[11px] text-[var(--lb-muted)] truncate">{cluster.subtitle}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {cluster.modules.map((mId) => {
                  const meta = QUESTIONS_DB.modules.find((m) => m.id === mId)!;
                  const ansCount = getModuleAnsweredCount(mId);
                  const active = safeModule === mId;
                  return (
                    <button
                      key={mId}
                      type="button"
                      onClick={() => onSelectModule(mId)}
                      className={`min-h-[42px] px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 whitespace-nowrap shrink-0 lb-transition ${
                        active
                          ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] border-transparent'
                          : 'bg-[var(--lb-card)] border-[var(--lb-border)] text-[var(--lb-text)] hover:border-[var(--lb-primary)]'
                      }`}
                    >
                      <span>Phân hệ {mId}</span>
                      <span className="opacity-85 tabular-nums">
                        ({ansCount}/{meta.item_count})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. THANH TIÊU ĐỀ PHÂN HỆ ĐANG MỞ & CHẾ ĐỘ XEM */}
      <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-extrabold text-[var(--lb-primary)]">
                Phân hệ {moduleMeta.id} · {moduleMeta.name}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[var(--lb-muted)] tabular-nums">
                Đã ghi nhận: {getModuleAnsweredCount(safeModule)} / {moduleMeta.item_count} mục
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--lb-muted)] leading-relaxed">
              <strong className="text-[var(--lb-text)]">Chỉ dẫn:</strong> {moduleMeta.instruction}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'list' ? 'single' : 'list')}
              className="min-h-[42px] px-3.5 py-2 rounded-xl border border-[var(--lb-border)] bg-[var(--lb-bg)] text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 hover:border-[var(--lb-primary)] lb-transition"
            >
              <List className="w-4 h-4 shrink-0" />
              <span>
                {viewMode === 'list' ? 'Quay lại từng câu' : `Danh sách ${moduleMeta.item_count} câu`}
              </span>
            </button>

            {safeModule === 'D' && (
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'd_priority' ? 'single' : 'd_priority')}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 lb-transition ${
                  viewMode === 'd_priority'
                    ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] border-transparent'
                    : 'border-[var(--lb-primary)] text-[var(--lb-primary)] hover:bg-[var(--lb-primary-soft)]'
                }`}
              >
                <span>Chọn tối đa 3 ưu tiên D ({profile.valuePriorities?.length || 0}/3)</span>
              </button>
            )}

            {isEKModule && (
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'ek_review' ? 'single' : 'ek_review')}
                className={`min-h-[42px] px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 lb-transition ${
                  viewMode === 'ek_review'
                    ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] border-transparent'
                    : 'border-[var(--lb-primary)] text-[var(--lb-primary)] hover:bg-[var(--lb-primary-soft)]'
                }`}
              >
                <Eye className="w-4 h-4 shrink-0" />
                <span>
                  {viewMode === 'ek_review'
                    ? 'Quay lại chế độ đo'
                    : 'Kết thúc phiên đo & Xem củng cố'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Chế độ mở danh sách toàn bộ câu hỏi */}
        {viewMode === 'list' && (
          <div className="pt-3 border-t border-[var(--lb-border)] grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {moduleQuestions.map((q, idx) => {
              const ans = profile.answers[q.id];
              const hasAns =
                ans !== null &&
                ans !== undefined &&
                ans !== '' &&
                !(Array.isArray(ans) && ans.length === 0);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setViewMode('single');
                  }}
                  className={`min-h-[42px] p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between lb-transition ${
                    idx === currentIndex
                      ? 'border-2 border-[var(--lb-primary)] bg-[var(--lb-primary-soft)]'
                      : hasAns
                      ? 'border-[var(--lb-primary)]/40 bg-[var(--lb-bg)]'
                      : 'border-[var(--lb-border)] bg-[var(--lb-bg)] text-[var(--lb-muted)]'
                  }`}
                >
                  <span className="font-bold">{q.id}</span>
                  <span className="text-[11px] font-bold tabular-nums">
                    {typeof ans === 'string'
                      ? ans
                      : Array.isArray(ans)
                      ? ans.join(',')
                      : hasAns
                      ? 'Đã ghi'
                      : 'Trống'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. MÀN HÌNH CHỌN TỐI ĐA 3 MÃ ƯU TIÊN D & RANH GIỚI */}
      {safeModule === 'D' && viewMode === 'd_priority' && (
        <div className="bg-[var(--lb-card)] border border-[var(--lb-primary)] rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-lg font-bold">
              Chọn tối đa 3 giá trị ưu tiên theo thứ tự của riêng em (Phân hệ D)
            </h3>
            <p className="text-xs sm:text-sm text-[var(--lb-muted)] mt-1">
              Hệ thống không tự động chọn hộ hay tự động thay đổi danh sách ưu tiên khi em sửa điểm D01–D10 (Quy tắc S16). Em dùng nút Lên/Xuống để sắp xếp thứ tự.
            </p>
          </div>

          {validationError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-[var(--lb-warn-soft)] border border-[var(--lb-warn)] text-sm font-semibold text-[var(--lb-warn)] flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-3">
            <div className="text-sm font-bold">
              Thứ tự ưu tiên em đã chọn ({profile.valuePriorities?.length || 0}/3):
            </div>
            {!profile.valuePriorities || profile.valuePriorities.length === 0 ? (
              <p className="text-xs text-[var(--lb-muted)]">
                Chưa chọn mã ưu tiên nào. Em hãy nhấn vào các thẻ D01–D10 bên dưới để chọn tối đa 3 giá trị.
              </p>
            ) : (
              <div className="space-y-2">
                {profile.valuePriorities.map((dId, idx) => {
                  const q = QUESTION_MAP.get(dId);
                  return (
                    <div
                      key={dId}
                      className="p-3 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-primary)] flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="text-sm">
                        <span className="font-bold text-[var(--lb-primary)]">
                          Ưu tiên #{idx + 1} · {dId}:
                        </span>{' '}
                        <span>{q?.content}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMovePriorityD(idx, -1)}
                          aria-label={`Đưa ${dId} lên`}
                          className="min-h-[38px] px-2.5 py-1 rounded-lg border border-[var(--lb-border)] disabled:opacity-30"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === profile.valuePriorities.length - 1}
                          onClick={() => handleMovePriorityD(idx, 1)}
                          aria-label={`Đưa ${dId} xuống`}
                          className="min-h-[38px] px-2.5 py-1 rounded-lg border border-[var(--lb-border)] disabled:opacity-30"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTogglePriorityD(dId)}
                          className="min-h-[38px] px-3 py-1 rounded-lg border border-[var(--lb-border)] text-xs font-semibold"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {moduleQuestions.map((q) => {
              const selected = (profile.valuePriorities || []).includes(q.id);
              const val = profile.answers[q.id];
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => handleTogglePriorityD(q.id)}
                  className={`min-h-[48px] p-3.5 rounded-xl border text-left flex items-start justify-between gap-2 lb-transition ${
                    selected
                      ? 'border-2 border-[var(--lb-primary)] bg-[var(--lb-primary-soft)]'
                      : 'border-[var(--lb-border)] bg-[var(--lb-bg)] hover:border-[var(--lb-primary)]'
                  }`}
                >
                  <div className="text-xs space-y-1">
                    <div className="font-bold">
                      {q.id} {typeof val === 'string' ? `(Mức đã chọn: ${val})` : '(Chưa chấm mức)'}
                    </div>
                    <div className="text-[var(--lb-text)]">{q.content}</div>
                  </div>
                  <span className="text-xs font-bold text-[var(--lb-primary)] shrink-0">
                    {selected ? 'Đã chọn ✓' : '+ Chọn'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--lb-border)]">
            <label htmlFor="d-boundary-input" className="block text-sm font-bold">
              Ranh giới / Điều em không muốn đánh đổi khi chọn nghề hoặc môi trường học (Tự nguyện):
            </label>
            <input
              id="d-boundary-input"
              type="text"
              value={profile.boundary || ''}
              onChange={(e) => onUpdateBoundary(e.target.value ? e.target.value : null)}
              placeholder="Ví dụ: Không đánh đổi sức khỏe, sự minh bạch hoặc thời gian hỗ trợ gia đình..."
              className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] text-sm focus:outline-none focus:border-[var(--lb-primary)]"
            />
          </div>
        </div>
      )}

      {/* 4. TRANG CỦNG CỐ SAU PHIÊN ĐO CHO PHÂN HỆ E & K */}
      {isEKModule && viewMode === 'ek_review' && (
        <div className="bg-[var(--lb-card)] border border-[var(--lb-primary)] rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-[var(--lb-primary)]">
                Trang củng cố sau phiên đo · Phân hệ {safeModule}
              </span>
              <h3 className="text-lg font-bold mt-0.5">
                Đối chiếu kết quả tình huống & Bài tập củng cố (Không đo chỉ số IQ)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className="min-h-[42px] px-4 py-2 rounded-xl border border-[var(--lb-border)] text-xs font-bold"
            >
              Quay lại làm câu hỏi
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {safeModule === 'E'
              ? Object.values(scoreModuleE(profile.answers).subgroups).map((sg) => (
                  <div
                    key={sg.subgroup}
                    className="p-3.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-1"
                  >
                    <div className="text-xs font-bold text-[var(--lb-muted)]">{sg.label}</div>
                    <div className="text-base font-bold tabular-nums">
                      {sg.isComplete
                        ? `${sg.correctCount}/3 · ${sg.levelGuidance}`
                        : `Chưa đủ dữ liệu (${sg.validCount}/3)`}
                    </div>
                  </div>
                ))
              : Object.values(scoreModuleK(profile.answers).subgroups).map((sg) => (
                  <div
                    key={sg.subgroup}
                    className="p-3.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-1"
                  >
                    <div className="text-xs font-bold text-[var(--lb-muted)]">{sg.label}</div>
                    <div className="text-base font-bold tabular-nums">
                      {sg.isComplete
                        ? `${sg.correctCount}/3 · ${sg.levelGuidance}`
                        : `Chưa đủ dữ liệu (${sg.validCount}/3)`}
                    </div>
                  </div>
                ))}
          </div>

          {safeModule === 'E' && (
            <div className="text-sm font-semibold text-[var(--lb-primary)]">
              Tổng E (chỉ báo khi đủ 12/12 câu):{' '}
              {scoreModuleE(profile.answers).totalComplete
                ? `${scoreModuleE(profile.answers).totalScoreOutOf12}/12`
                : `Chưa đủ dữ liệu (${scoreModuleE(profile.answers).totalValidCount}/12)`}
            </div>
          )}
          {safeModule === 'K' && (
            <div className="text-xs text-[var(--lb-muted)]">
              Quy tắc 2.0.1: Phân hệ K chỉ báo riêng 4 cụm (/3 khi đủ), không tạo điểm tổng K.
            </div>
          )}

          <div className="space-y-3">
            {moduleQuestions.map((q) => {
              const ans = profile.answers[q.id];
              const fb = lookupItemFeedback(q.id, ans);
              const isAnsweredABCD =
                typeof ans === 'string' && ['A', 'B', 'C', 'D'].includes(ans);
              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-2 text-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold">
                      {q.id} (Cụm {q.subgroup})
                    </span>
                    <span className="text-xs font-semibold text-[var(--lb-muted)]">
                      Lựa chọn của em: <strong className="text-[var(--lb-text)]">{typeof ans === 'string' ? ans : 'Chưa trả lời'}</strong>
                    </span>
                  </div>
                  <p className="text-[var(--lb-text)]">{q.content}</p>
                  <div className="p-3 rounded-lg bg-[var(--lb-card)] border border-[var(--lb-border)] space-y-1.5 text-xs">
                    <div>
                      <strong>Phản hồi quy chuẩn:</strong> {fb.primaryGuidance}
                    </div>
                    {(isAnsweredABCD || ans === 'U') && q.answer_key && (
                      <div className="text-[var(--lb-primary)] font-semibold">
                        Phương án chuẩn theo dữ kiện đề: {q.answer_key} (
                        {q.options.find((o) => o.value === q.answer_key)?.label})
                      </div>
                    )}
                    {fb.reinforcementExercise && (
                      <div className="text-[var(--lb-muted)]">
                        <strong>Bài tập củng cố:</strong> {fb.reinforcementExercise}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. KHÔNG GIAN LÀM CÂU HỎI 2 CỘT: KHUNG CÂU HỎI CHÍNH (8 COLS) + BẢNG ĐIỀU HƯỚNG NHANH (4 COLS) */}
      {viewMode === 'single' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Cột trái: Thẻ câu hỏi tương tác chính (8 cols) */}
          <div className="xl:col-span-8 bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-6">
            {/* Thanh tiến độ câu hỏi */}
            <div className="space-y-3 pb-4 border-b border-[var(--lb-border)]">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[var(--lb-primary)] tabular-nums">
                    Mã câu: {currentQuestion.id}
                  </span>
                  {currentQuestion.subgroup && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-[var(--lb-muted)]">
                        Nhóm {currentQuestion.subgroup}
                      </span>
                    </>
                  )}
                </div>
                <span className="font-bold text-[var(--lb-muted)] tabular-nums">
                  Mục {currentIndex + 1} / {moduleQuestions.length}
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-[var(--lb-surface-subtle)] overflow-hidden">
                <div
                  className="h-full bg-[var(--lb-primary)] lb-transition"
                  style={{
                    width: `${Math.round(((currentIndex + 1) / moduleQuestions.length) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Nội dung câu hỏi nguyên văn 100% */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold leading-relaxed text-[var(--lb-text)]">
                {currentQuestion.content}
              </h3>
              {isEKModule && (
                <p className="text-xs text-[var(--lb-muted)]">
                  Chế độ đo: Khóa đáp án đang được ẩn để em tự suy nghĩ theo dữ kiện đề. Sau khi chọn xong, em nhấn “Kết thúc phiên đo & Xem củng cố” để xem giải thích.
                </p>
              )}
            </div>

            {/* Cảnh báo lỗi ràng buộc */}
            {validationError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-[var(--lb-warn-soft)] border border-[var(--lb-warn)] text-sm font-semibold text-[var(--lb-warn)] flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* WIDGET 1: SCALE & SINGLE_CHOICE (Tách rõ nhóm đáp án chính và 2 lựa chọn quyền tự chủ U/X) */}
            {(currentQuestion.type === 'scale' || currentQuestion.type === 'single_choice') && (
              <div className="space-y-4" role="radiogroup" aria-label={currentQuestion.content}>
                <div className="space-y-2.5">
                  {primaryOptions.map((opt) => {
                    const isSelected = currentAnswer === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => handleSelectSingle(opt.value)}
                        className={`w-full min-h-[52px] p-3.5 sm:p-4 rounded-xl border text-left flex items-center justify-between gap-3 lb-transition ${
                          isSelected
                            ? 'border-2 border-[var(--lb-primary)] bg-[var(--lb-primary-soft)] font-bold'
                            : 'border-[var(--lb-border)] bg-[var(--lb-bg)] hover:border-[var(--lb-primary)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 tabular-nums ${
                              isSelected
                                ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514]'
                                : 'bg-[var(--lb-card)] border border-[var(--lb-border)] text-[var(--lb-text)]'
                            }`}
                          >
                            {opt.value}
                          </span>
                          <span className="text-sm sm:text-base">{opt.label}</span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-[var(--lb-primary)] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Hàng lựa chọn quyền tự chủ U & X */}
                {autonomyOptions.length > 0 && (
                  <div className="pt-3 border-t border-[var(--lb-border)] space-y-2">
                    <div className="text-[11px] font-bold text-[var(--lb-muted)]">
                      Quyền tự chủ của người học (Không bao giờ bị ép quy về 0 điểm):
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {autonomyOptions.map((opt) => {
                        const isSelected = currentAnswer === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => handleSelectSingle(opt.value)}
                            className={`min-h-[48px] p-3 rounded-xl border text-left flex items-center justify-between gap-2 lb-transition ${
                              isSelected
                                ? 'border-2 border-[var(--lb-primary)] bg-[var(--lb-primary-soft)] font-bold'
                                : 'border-[var(--lb-border)] bg-[var(--lb-surface-subtle)] hover:border-[var(--lb-primary)]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isSelected
                                    ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514]'
                                    : 'bg-[var(--lb-card)] border border-[var(--lb-border)]'
                                }`}
                              >
                                {opt.value}
                              </span>
                              <span className="text-xs sm:text-sm">{opt.label}</span>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-[var(--lb-primary)] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* WIDGET 2: MULTI_CHOICE (F02–F08) */}
            {currentQuestion.type === 'multi_choice' && (
              <div className="space-y-3">
                <p className="text-xs text-[var(--lb-muted)]">
                  Câu hỏi nhiều lựa chọn: Các phương án loại trừ ({currentQuestion.exclusive_values.join(', ')}) luôn đứng riêng, không chọn kèm phương án khác.
                </p>
                <div className="space-y-2.5">
                  {currentQuestion.options.map((opt) => {
                    const selectedArr = Array.isArray(currentAnswer) ? currentAnswer : [];
                    const isChecked = selectedArr.includes(opt.value);
                    const isExclusive = currentQuestion.exclusive_values.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="checkbox"
                        aria-checked={isChecked}
                        onClick={() => handleToggleMultiOption(opt.value)}
                        className={`w-full min-h-[48px] p-4 rounded-xl border text-left flex items-center justify-between gap-3 lb-transition ${
                          isChecked
                            ? 'border-2 border-[var(--lb-primary)] bg-[var(--lb-primary-soft)] font-bold'
                            : 'border-[var(--lb-border)] bg-[var(--lb-bg)] hover:border-[var(--lb-primary)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              isChecked
                                ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514]'
                                : 'bg-[var(--lb-card)] border border-[var(--lb-border)]'
                            }`}
                          >
                            {opt.value}
                          </span>
                          <div>
                            <div className="text-sm sm:text-base">{opt.label}</div>
                            {isExclusive && (
                              <div className="text-[11px] text-[var(--lb-muted)] font-normal">
                                Phương án đứng riêng (không đi kèm lựa chọn khác)
                              </div>
                            )}
                          </div>
                        </div>
                        {isChecked && (
                          <CheckCircle2 className="w-5 h-5 text-[var(--lb-primary)] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* WIDGET 3: PAIRED_OBSERVATION (J01–J12) */}
            {currentQuestion.type === 'paired_observation' && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-2 text-xs text-[var(--lb-muted)]">
                  <div className="flex items-center gap-2 font-bold text-sm text-[var(--lb-text)]">
                    <Users className="w-4 h-4 text-[var(--lb-primary)]" />
                    <span>Quy tắc Đối sánh hành vi J (2 lượt độc lập):</span>
                  </div>
                  <p>
                    Chỉ phân loại Y/Y, Y/N, N/Y, N/N khi cả hai người tự nguyện ghi nhận trong <strong>cùng bối cảnh</strong> và mỗi lựa chọn <strong>Y (Đã thấy rõ)</strong> đều có ví dụ cụ thể. Lựa chọn <strong>N</strong> chỉ có nghĩa là “chưa thấy dù có cơ hội”, không phải yếu kém.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lượt 1: Self */}
                  <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-3">
                    <div className="font-bold text-sm">Lượt 1 · Tự quan sát của em (Self)</div>
                    <div className="space-y-2">
                      {currentQuestion.options.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleUpdateJ({ self: opt.value })}
                          className={`w-full min-h-[44px] px-3 py-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between lb-transition ${
                            currentJ.self === opt.value
                              ? 'border-2 border-[var(--lb-primary)] bg-[var(--lb-primary-soft)] font-bold'
                              : 'border-[var(--lb-border)] bg-[var(--lb-card)]'
                          }`}
                        >
                          <span>
                            {opt.value} · {opt.label}
                          </span>
                          {currentJ.self === opt.value && (
                            <CheckCircle2 className="w-4 h-4 text-[var(--lb-primary)]" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold">
                        Ví dụ cụ thể của em {currentJ.self === 'Y' ? '(Bắt buộc khi chọn Y)' : '(Tùy chọn)'}:
                      </label>
                      <input
                        type="text"
                        value={currentJ.selfExample || ''}
                        onChange={(e) => handleUpdateJ({ selfExample: e.target.value || null })}
                        placeholder="Nêu tình huống và hành động cụ thể..."
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] text-xs"
                      />
                    </div>
                  </div>

                  {/* Lượt 2: Observer */}
                  <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-3">
                    <div className="font-bold text-sm">Lượt 2 · Người quan sát cùng bối cảnh (Observer)</div>
                    <div className="space-y-2">
                      {currentQuestion.options.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleUpdateJ({ observer: opt.value })}
                          className={`w-full min-h-[44px] px-3 py-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between lb-transition ${
                            currentJ.observer === opt.value
                              ? 'border-2 border-[var(--lb-primary)] bg-[var(--lb-primary-soft)] font-bold'
                              : 'border-[var(--lb-border)] bg-[var(--lb-card)]'
                          }`}
                        >
                          <span>
                            {opt.value} · {opt.label}
                          </span>
                          {currentJ.observer === opt.value && (
                            <CheckCircle2 className="w-4 h-4 text-[var(--lb-primary)]" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold">
                        Ví dụ cụ thể người quan sát thấy {currentJ.observer === 'Y' ? '(Bắt buộc khi chọn Y)' : '(Tùy chọn)'}:
                      </label>
                      <input
                        type="text"
                        value={currentJ.observerExample || ''}
                        onChange={(e) => handleUpdateJ({ observerExample: e.target.value || null })}
                        placeholder="Ví dụ hành vi người quan sát trực tiếp thấy..."
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-2.5 text-sm">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentJ.sameContext}
                      onChange={(e) => handleUpdateJ({ sameContext: e.target.checked })}
                      className="w-5 h-5 accent-[#006B60]"
                    />
                    <span>
                      Hai người quan sát trong <strong>cùng một bối cảnh hoạt động cụ thể</strong> (sameContext)
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentJ.mutualConsent}
                      onChange={(e) => handleUpdateJ({ mutualConsent: e.target.checked })}
                      className="w-5 h-5 accent-[#006B60]"
                    />
                    <span>
                      Cả hai bên <strong>hoàn toàn tự nguyện đồng thuận</strong> chia sẻ quan sát (mutualConsent)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* WIDGET 4: PRACTICE_RUBRIC (N01–N08) */}
            {currentQuestion.type === 'practice_rubric' && (
              <div className="space-y-5">
                {TAY_NGUYEN_PRACTICE_SUGGESTIONS[currentQuestion.id] && (
                  <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--lb-primary)]">
                      <Wrench className="w-4 h-4" />
                      <span>
                        {TAY_NGUYEN_PRACTICE_SUGGESTIONS[currentQuestion.id].contextTitle} (Gợi ý luyện tập mở rộng)
                      </span>
                    </div>
                    <p className="text-xs text-[var(--lb-text)]">
                      {TAY_NGUYEN_PRACTICE_SUGGESTIONS[currentQuestion.id].practicePrompt}
                    </p>
                    <p className="text-xs text-[var(--lb-muted)]">
                      <strong>Vật liệu giấy dễ tìm:</strong>{' '}
                      {TAY_NGUYEN_PRACTICE_SUGGESTIONS[currentQuestion.id].paperMaterials}
                    </p>
                  </div>
                )}

                {currentQuestion.rubric && (
                  <div className="p-4 rounded-xl bg-[var(--lb-info-soft)] border border-[var(--lb-info)]/30 text-xs space-y-1">
                    <div className="font-bold text-[var(--lb-info)]">
                      Tiêu chí Rubric chuẩn (Dành cho người tư vấn / giáo viên xác nhận):
                    </div>
                    <p className="text-[var(--lb-text)]">{currentQuestion.rubric}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold">
                      1. Mô tả sản phẩm minh chứng em đã làm trên giấy (evidence):
                    </label>
                    <textarea
                      rows={3}
                      value={currentN.evidence || ''}
                      onChange={(e) => handleUpdateN({ evidence: e.target.value || null })}
                      placeholder="Ghi rõ sản phẩm em đã tạo ra (ví dụ: bảng tính trên giấy A4, sơ đồ 5 bước)..."
                      className="w-full p-3 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold">
                      2. Mức hỗ trợ khi thực hiện (support):
                    </label>
                    <textarea
                      rows={3}
                      value={currentN.support || ''}
                      onChange={(e) => handleUpdateN({ support: e.target.value || null })}
                      placeholder="Ví dụ: Tự làm độc lập / Có khung gợi ý / Làm cùng thầy cô hướng dẫn..."
                      className="w-full p-3 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold">
                    3. Chọn mức ghi nhận (Mức 0/1/2 chỉ tính là đã đánh giá khi có sản phẩm minh chứng và người đánh giá xác nhận — Quy tắc S23, S24):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentQuestion.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleUpdateN({ score: opt.value })}
                        className={`min-h-[48px] p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between lb-transition ${
                          currentN.score === opt.value
                            ? 'border-2 border-[var(--lb-primary)] bg-[var(--lb-primary-soft)] font-bold'
                            : 'border-[var(--lb-border)] bg-[var(--lb-bg)]'
                        }`}
                      >
                        <span>
                          Mức {opt.value} · {opt.label}
                        </span>
                        {currentN.score === opt.value && (
                          <CheckCircle2 className="w-4 h-4 text-[var(--lb-primary)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]">
                  <label className="flex items-start gap-2.5 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={currentN.reviewerConfirmed}
                      onChange={(e) => handleUpdateN({ reviewerConfirmed: e.target.checked })}
                      className="mt-1 w-5 h-5 accent-[#006B60]"
                    />
                    <div>
                      <span className="font-bold">
                        Người đánh giá được giao quyền đã xem sản phẩm và xác nhận mức Rubric này (reviewerConfirmed)
                      </span>
                      <p className="text-xs text-[var(--lb-muted)] mt-0.5">
                        Học sinh không tự chấm điểm thay nếu chưa có người đánh giá xác nhận sản phẩm thực tế.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* WIDGET 5: PRIVATE_REFLECTION (I01–I16, O01–O08) */}
            {currentQuestion.type === 'private_reflection' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[var(--lb-primary)]">
                    <Lock className="w-4 h-4" />
                    <span>Không gian tự vấn riêng tư (Mặc định giữ trên giấy / không đưa vào báo cáo)</span>
                  </div>
                  <p className="text-xs text-[var(--lb-muted)]">
                    Ứng dụng <strong>không chấm điểm</strong> và <strong>không bao giờ tự động đọc hay quét</strong> nội dung tự vấn I/O của em. Chỉ khi em chủ động bật đồng ý chia sẻ bên dưới, một câu tóm tắt ngắn do em tự viết mới được đưa vào báo cáo để trao đổi với người tư vấn.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateIO({
                        keepOnPaperOnly: true,
                        shareConsent: false,
                        sharedSummary: null,
                      })
                    }
                    className={`min-h-[48px] px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 lb-transition ${
                      !currentIO.shareConsent
                        ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] border-transparent'
                        : 'border-[var(--lb-border)] bg-[var(--lb-bg)]'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Giữ riêng trên giấy / Không chia sẻ vào báo cáo (Mặc định)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateIO({
                        keepOnPaperOnly: false,
                        shareConsent: true,
                      })
                    }
                    className={`min-h-[48px] px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 lb-transition ${
                      currentIO.shareConsent
                        ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] border-transparent'
                        : 'border-[var(--lb-border)] bg-[var(--lb-bg)]'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Em chủ động đồng ý chia sẻ 1 câu tóm tắt vào báo cáo</span>
                  </button>
                </div>

                {currentIO.shareConsent && (
                  <div className="space-y-2 p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-primary)]">
                    <label className="block text-xs font-bold">
                      Bản tóm tắt ngắn em đồng ý đưa vào báo cáo để trao đổi với người tư vấn:
                    </label>
                    <textarea
                      rows={3}
                      value={currentIO.sharedSummary || ''}
                      onChange={(e) => handleUpdateIO({ sharedSummary: e.target.value || null })}
                      placeholder="Viết 1–2 câu tóm tắt điều em muốn chia sẻ với thầy/cô tư vấn..."
                      className="w-full p-3 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] text-sm"
                    />
                    <p className="text-[11px] text-[var(--lb-muted)]">
                      Nếu em chuyển lại sang “Giữ riêng trên giấy”, bản tóm tắt này sẽ lập tức bị xóa khỏi báo cáo (Quy tắc S25).
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Gợi ý phản hồi tức thời từ feedback_library_2.0.1.json */}
            {!isEKModule && currentAnswer !== null && (
              <div className="p-4 rounded-xl bg-[var(--lb-primary-soft)] border border-[var(--lb-primary)]/30 space-y-1.5 text-xs">
                <div className="font-bold text-[var(--lb-primary)] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Gợi ý đối thoại từ Thư viện phản hồi 2.0.1 ({currentQuestion.id}):</span>
                </div>
                <p className="text-[var(--lb-text)] leading-relaxed">{itemFeedback.primaryGuidance}</p>
                {itemFeedback.suggestedAction && (
                  <p className="text-[var(--lb-muted)]">
                    <strong className="text-[var(--lb-text)]">Việc gợi ý thử:</strong> {itemFeedback.suggestedAction}
                  </p>
                )}
                {itemFeedback.evidenceToReview && (
                  <p className="text-[var(--lb-muted)]">
                    <strong className="text-[var(--lb-text)]">Minh chứng xem lại:</strong> {itemFeedback.evidenceToReview}
                  </p>
                )}
              </div>
            )}

            {/* Thanh điều hướng Trước / Để trống / Sau */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--lb-border)]">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => {
                  setValidationError(null);
                  setCurrentIndex((i) => Math.max(0, i - 1));
                }}
                className="min-h-[46px] px-4 py-2.5 rounded-xl border border-[var(--lb-border)] font-bold text-sm flex items-center gap-1.5 disabled:opacity-40 whitespace-nowrap shrink-0 lb-transition"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span>Câu trước</span>
              </button>

              <button
                type="button"
                onClick={handleClearCurrentAnswer}
                className="min-h-[46px] px-3.5 py-2 rounded-xl border border-[var(--lb-border)] text-xs font-bold text-[var(--lb-muted)] flex items-center gap-1.5 hover:border-[var(--lb-primary)] hover:text-[var(--lb-text)] whitespace-nowrap shrink-0 lb-transition"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Để trống câu này</span>
              </button>

              {currentIndex < moduleQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setValidationError(null);
                    setCurrentIndex((i) => Math.min(moduleQuestions.length - 1, i + 1));
                  }}
                  className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[var(--lb-primary)] text-white dark:text-[#0B1514] font-bold text-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 hover:opacity-95 lb-transition"
                >
                  <span>Câu tiếp theo</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (isEKModule) {
                      setViewMode('ek_review');
                    } else if (safeModule === 'D') {
                      setViewMode('d_priority');
                    } else {
                      onSaveAndExitToProfile();
                    }
                  }}
                  className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[var(--lb-primary)] text-white dark:text-[#0B1514] font-bold text-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 hover:opacity-95 lb-transition"
                >
                  <span>
                    {isEKModule
                      ? 'Xem trang củng cố sau đo'
                      : safeModule === 'D'
                      ? 'Chọn 3 ưu tiên D'
                      : 'Hoàn tất phân hệ & Xem Hồ sơ'}
                  </span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* Cột phải: Bảng điều hướng câu hỏi trực quan trong phân hệ (4 cols) */}
          <div className="xl:col-span-4 bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--lb-border)] pb-3">
              <div>
                <h4 className="text-sm font-bold">Bản đồ câu hỏi Phân hệ {safeModule}</h4>
                <p className="text-[11px] text-[var(--lb-muted)]">
                  Chạm vào bất kỳ mã nào để chuyển nhanh tới câu đó
                </p>
              </div>
              <span className="text-xs font-bold text-[var(--lb-primary)] tabular-nums">
                {getModuleAnsweredCount(safeModule)}/{moduleQuestions.length}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 xl:grid-cols-4 gap-2">
              {moduleQuestions.map((q, idx) => {
                const ans = profile.answers[q.id];
                const hasAns =
                  ans !== null &&
                  ans !== undefined &&
                  ans !== '' &&
                  !(Array.isArray(ans) && ans.length === 0);
                const isCurrent = idx === currentIndex;
                const badgeText =
                  typeof ans === 'string'
                    ? ans
                    : Array.isArray(ans)
                    ? `${ans.length} mục`
                    : hasAns
                    ? '✓'
                    : '·';
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      setValidationError(null);
                      setCurrentIndex(idx);
                    }}
                    className={`min-h-[42px] px-2 py-1.5 rounded-xl border text-xs flex flex-col items-center justify-center lb-transition ${
                      isCurrent
                        ? 'border-2 border-[var(--lb-primary)] bg-[var(--lb-primary-soft)] font-extrabold text-[var(--lb-primary)]'
                        : hasAns
                        ? 'border-[var(--lb-primary)]/40 bg-[var(--lb-bg)] text-[var(--lb-text)] font-bold'
                        : 'border-[var(--lb-border)] bg-[var(--lb-bg)] text-[var(--lb-muted)] hover:border-[var(--lb-border-strong)]'
                    }`}
                  >
                    <span className="tabular-nums">{q.id}</span>
                    <span className="text-[10px] opacity-80 tabular-nums truncate max-w-full">
                      {badgeText}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[var(--lb-border)] space-y-2 text-[11px] text-[var(--lb-muted)]">
              <div className="flex items-center justify-between">
                <span>U · Chưa rõ / Chưa có cơ hội</span>
                <span className="font-semibold text-[var(--lb-text)]">Không tính vào mẫu số</span>
              </div>
              <div className="flex items-center justify-between">
                <span>X · Giữ riêng / Không trả lời</span>
                <span className="font-semibold text-[var(--lb-text)]">Bảo vệ quyền riêng tư</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
