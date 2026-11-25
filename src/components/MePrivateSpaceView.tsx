import React, { useState, useMemo } from 'react';
import {
  Sun,
  Moon,
  Type,
  Download,
  Trash2,
  ShieldCheck,
  Database,
  CheckCircle2,
  AlertTriangle,
  Eye,
  HeartHandshake,
} from 'lucide-react';
import {
  QUESTIONS_DB,
  DEFAULT_EXPORT_SELECTION,
  buildSelectiveExportSummary,
  validateQuestionAnswer,
  validateResearchSubmissionM,
  aggregateResearchSubmissionsM,
  type StudentProfileContract,
  type InternalReportContract,
  type ExportFieldSelection,
  type ModuleId,
  type AnonymousResearchSubmission,
} from '../utils/labanEngine';

interface MePrivateSpaceViewProps {
  profile: StudentProfileContract;
  report: InternalReportContract;
  theme: 'light' | 'dark';
  fontScale: number;
  reduceMotion: boolean;
  researchSubmissions: AnonymousResearchSubmission[];
  onToggleTheme: (theme: 'light' | 'dark') => void;
  onChangeFontScale: (scale: number) => void;
  onToggleReduceMotion: (reduce: boolean) => void;
  onClearModuleAnswers: (moduleId: ModuleId) => void;
  onDeleteEntireProfile: () => void;
  onResetToDemoProfile: () => void;
  onSubmitAnonymousResearchM: (submission: AnonymousResearchSubmission) => void;
  onClearResearchRepository: () => void;
  onOpenEmergencySupport: () => void;
}

export const MePrivateSpaceView: React.FC<MePrivateSpaceViewProps> = ({
  profile,
  report,
  theme,
  fontScale,
  reduceMotion,
  researchSubmissions,
  onToggleTheme,
  onChangeFontScale,
  onToggleReduceMotion,
  onClearModuleAnswers,
  onDeleteEntireProfile,
  onResetToDemoProfile,
  onSubmitAnonymousResearchM,
  onClearResearchRepository,
  onOpenEmergencySupport,
}) => {
  const [exportSelection, setExportSelection] = useState<ExportFieldSelection>(DEFAULT_EXPORT_SELECTION);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  // Chế độ nghiên cứu độc lập M (Tách biệt hoàn toàn khỏi hồ sơ cá nhân — P05)
  const [researchModeEnabled, setResearchModeEnabled] = useState(false);
  const [mDraftAnswers, setMDraftAnswers] = useState<Record<string, string | string[]>>({});
  const [mError, setMError] = useState<string | null>(null);
  const [mSuccessMsg, setMSuccessMsg] = useState<string | null>(null);

  const mQuestions = useMemo(
    () => QUESTIONS_DB.questions.filter((q) => q.module === 'M'),
    []
  );

  const mAggregates = useMemo(
    () => aggregateResearchSubmissionsM(researchSubmissions),
    [researchSubmissions]
  );

  const exportPayload = useMemo(
    () => buildSelectiveExportSummary(report, exportSelection),
    [report, exportSelection]
  );

  const handleDownloadJsonSummary = () => {
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `la-ban-tuong-lai-tom-tat-${profile.profileId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectMOption = (qId: string, qType: string, optVal: string) => {
    setMError(null);
    setMSuccessMsg(null);
    if (qType === 'single_choice') {
      const check = validateQuestionAnswer(qId, optVal);
      if (!check.valid) {
        setMError(check.error || 'Lựa chọn không hợp lệ.');
        return;
      }
      setMDraftAnswers((prev) => ({ ...prev, [qId]: optVal }));
    } else if (qType === 'multi_choice') {
      const cur = Array.isArray(mDraftAnswers[qId]) ? [...(mDraftAnswers[qId] as string[])] : [];
      const next = cur.includes(optVal) ? cur.filter((v) => v !== optVal) : [...cur, optVal];
      const check = validateQuestionAnswer(qId, next);
      if (!check.valid) {
        setMError(check.error || 'Kết hợp phương án loại trừ không hợp lệ.');
        return;
      }
      setMDraftAnswers((prev) => {
        const copy = { ...prev };
        if (next.length === 0) delete copy[qId];
        else copy[qId] = next;
        return copy;
      });
    }
  };

  const handleSubmitM = () => {
    setMError(null);
    setMSuccessMsg(null);
    const res = validateResearchSubmissionM(mDraftAnswers);
    if (!res.valid || !res.submission) {
      setMError(res.errors.join(' | '));
      return;
    }
    onSubmitAnonymousResearchM(res.submission);
    setMDraftAnswers({});
    setMSuccessMsg(
      'Đã ghi nhận phiếu M vào kho nghiên cứu ẩn danh độc lập (không gắn profileId và không liên kết với hồ sơ cá nhân).'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Không gian riêng */}
      <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--lb-primary)]">
            06 · Em / Không gian riêng & Quản lý dữ liệu cục bộ
          </span>
          <h1 className="text-xl md:text-2xl font-bold mt-0.5">
            Quyền làm chủ dữ liệu, Giao diện tiếp cận & Xuất bản tóm tắt
          </h1>
          <p className="text-xs text-[var(--lb-muted)] mt-1">
            Mã hồ sơ cục bộ: <strong>{profile.profileId}</strong> · Không lưu khóa API · Không gọi AI/Gemini · Không tự đồng bộ lên đám mây.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenEmergencySupport}
          className="min-h-[48px] px-4 py-2 rounded-xl border border-[#B42318] text-[#B42318] dark:border-[#F28B82] dark:text-[#F28B82] font-bold text-xs flex items-center gap-2"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Em cần hỗ trợ (111 / 115 / 113)</span>
        </button>
      </div>

      {/* 1. GIAO DIỆN & TIẾP CẬN (CỠ CHỮ TỚI 200%, DARK MODE, TẮT CHUYỂN ĐỘNG — U02) */}
      <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Type className="w-5 h-5 text-[var(--lb-primary)]" />
          <span>1. Giao diện & Khả năng tiếp cận (Accessibility · Hỗ trợ chữ tới 200%)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chủ đề Sáng / Tối */}
          <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-2">
            <div className="text-xs font-bold">Chủ đề màu sắc (Kiểm định tương phản chuẩn 3.0):</div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onToggleTheme('light')}
                className={`min-h-[44px] px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  theme === 'light'
                    ? 'bg-[#006B60] text-white border-transparent'
                    : 'bg-[var(--lb-card)] border-[var(--lb-border)]'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Chủ đề Sáng (#F5F8F7 / #006B60)</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleTheme('dark')}
                className={`min-h-[44px] px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-[#78D9C7] text-[#101C1A] border-transparent'
                    : 'bg-[var(--lb-card)] border-[var(--lb-border)]'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Chủ đề Tối (#101C1A / #78D9C7)</span>
              </button>
            </div>
          </div>

          {/* Cỡ chữ 100% -> 200% */}
          <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-2">
            <div className="text-xs font-bold">
              Cỡ chữ hiển thị (Hiện tại: {Math.round(fontScale * 100)}% — Hỗ trợ tới 200% không cắt chữ):
            </div>
            <div className="flex flex-wrap gap-2">
              {[1, 1.15, 1.3, 1.5, 2].map((sc) => (
                <button
                  key={sc}
                  type="button"
                  onClick={() => onChangeFontScale(sc)}
                  className={`min-h-[44px] px-3.5 py-1.5 rounded-xl border text-xs font-bold tabular-nums ${
                    Math.abs(fontScale - sc) < 0.02
                      ? 'bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] border-transparent'
                      : 'bg-[var(--lb-card)] border-[var(--lb-border)]'
                  }`}
                >
                  {Math.round(sc * 100)}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(e) => onToggleReduceMotion(e.target.checked)}
            className="w-4 h-4 accent-[#006B60]"
          />
          <span>Tắt hiệu ứng chuyển động (Reduce Motion)</span>
        </label>
      </div>

      {/* 2. XUẤT BẢN TÓM TẮT CÓ XEM TRƯỚC & CHỌN TRƯỜNG (P06 — Mặc định loại I/O và yêu cầu hỗ trợ) */}
      <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Download className="w-5 h-5 text-[var(--lb-primary)]" />
            <span>2. Xuất bản tóm tắt có xem trước và chọn lọc trường (Quy tắc P06)</span>
          </h2>
          <p className="text-xs text-[var(--lb-muted)] mt-0.5">
            Mặc định hệ thống <strong>loại trừ</strong> các tóm tắt tự vấn I/O và danh sách câu hỏi hỗ trợ T01–T12 để bảo vệ sự riêng tư của em. Lưu ý: Sau khi em xuất tệp ra ngoài ứng dụng, bản xuất đó do em tự quản lý (ứng dụng không thể xóa từ xa bản đã chia sẻ ngoài app).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <label className="flex items-center gap-2 p-3 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] cursor-pointer">
            <input
              type="checkbox"
              checked={exportSelection.includeSelfReportedAAndH}
              onChange={(e) =>
                setExportSelection({ ...exportSelection, includeSelfReportedAAndH: e.target.checked })
              }
              className="w-4 h-4 accent-[#006B60]"
            />
            <span>Bao gồm chỉ số Tự nhận thức A & H (Em tự mô tả)</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] cursor-pointer">
            <input
              type="checkbox"
              checked={exportSelection.includeInterestsBAndSkillsC}
              onChange={(e) =>
                setExportSelection({ ...exportSelection, includeInterestsBAndSkillsC: e.target.checked })
              }
              className="w-4 h-4 accent-[#006B60]"
            />
            <span>Bao gồm Sở thích B & Kỹ năng tự mô tả C</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] cursor-pointer">
            <input
              type="checkbox"
              checked={exportSelection.includeValuesDAndContextF}
              onChange={(e) =>
                setExportSelection({ ...exportSelection, includeValuesDAndContextF: e.target.checked })
              }
              className="w-4 h-4 accent-[#006B60]"
            />
            <span>Bao gồm Hướng gợi ý mềm & Giá trị ưu tiên D</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] cursor-pointer">
            <input
              type="checkbox"
              checked={exportSelection.includeVerifiedEvidenceNAndJ}
              onChange={(e) =>
                setExportSelection({ ...exportSelection, includeVerifiedEvidenceNAndJ: e.target.checked })
              }
              className="w-4 h-4 accent-[#006B60]"
            />
            <span>Bao gồm Minh chứng thực tế N, J, G</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] cursor-pointer">
            <input
              type="checkbox"
              checked={exportSelection.includeActionPlan73090}
              onChange={(e) =>
                setExportSelection({ ...exportSelection, includeActionPlan73090: e.target.checked })
              }
              className="w-4 h-4 accent-[#006B60]"
            />
            <span>Bao gồm Kế hoạch 7–30–90 ngày</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-xl bg-[#8A5A16]/10 border border-[#8A5A16]/40 cursor-pointer">
            <input
              type="checkbox"
              checked={exportSelection.includeSharedReflectionsIO}
              onChange={(e) =>
                setExportSelection({ ...exportSelection, includeSharedReflectionsIO: e.target.checked })
              }
              className="w-4 h-4 accent-[#006B60]"
            />
            <span>[Mặc định TẮT] Đưa câu tóm tắt I/O đã đồng ý vào bản xuất</span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-xl bg-[#8A5A16]/10 border border-[#8A5A16]/40 cursor-pointer">
            <input
              type="checkbox"
              checked={exportSelection.includeSupportRequests}
              onChange={(e) =>
                setExportSelection({ ...exportSelection, includeSupportRequests: e.target.checked })
              }
              className="w-4 h-4 accent-[#006B60]"
            />
            <span>[Mặc định TẮT] Đưa câu hỏi xác minh hỗ trợ T01–T12 vào bản xuất</span>
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowExportPreview((v) => !v)}
            className="min-h-[48px] px-4 py-2.5 rounded-xl border border-[var(--lb-primary)] text-[var(--lb-primary)] font-bold text-xs flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>{showExportPreview ? 'Ẩn bản xem trước' : 'Xem trước nội dung bản xuất (Preview)'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJsonSummary}
            className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] font-bold text-xs flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Tải xuống bản tóm tắt đã chọn lọc (.json)</span>
          </button>
        </div>

        {showExportPreview && (
          <pre className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] text-xs overflow-x-auto max-h-80">
            {JSON.stringify(exportPayload, null, 2)}
          </pre>
        )}
      </div>

      {/* 3. XÓA TỪNG PHÂN HỆ HOẶC XÓA TOÀN BỘ HỒ SƠ CỤC BỘ (P03) */}
      <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-[#B42318] dark:text-[#F28B82]" />
            <span>3. Quyền xóa dữ liệu từng phân hệ hoặc xóa toàn bộ hồ sơ (Quy tắc P03)</span>
          </h2>
          <p className="text-xs text-[var(--lb-muted)] mt-0.5">
            Khi em xóa hồ sơ, toàn bộ câu trả lời và bản sao nội bộ trong bộ nhớ cục bộ của thiết bị sẽ bị xóa vĩnh viễn và không tự phục hồi khi khởi động lại.
          </p>
        </div>

        {/* Xóa từng phân hệ cá nhân A–O (trừ M) */}
        <div className="space-y-2">
          <div className="text-xs font-bold">Xóa dữ liệu riêng từng phân hệ:</div>
          <div className="flex flex-wrap gap-2">
            {QUESTIONS_DB.modules
              .filter((m) => m.id !== 'M')
              .map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onClearModuleAnswers(m.id)}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl border border-[var(--lb-border)] bg-[var(--lb-bg)] text-xs font-semibold hover:border-[#B42318] hover:text-[#B42318]"
                >
                  Xóa phân hệ {m.id}
                </button>
              ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[var(--lb-border)]">
          {!confirmDeleteAll ? (
            <button
              type="button"
              onClick={() => setConfirmDeleteAll(true)}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#B42318] text-white font-bold text-xs flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa toàn bộ hồ sơ cá nhân trên thiết bị</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[#B42318]/10 border border-[#B42318]">
              <span className="text-xs font-bold text-[#B42318] dark:text-[#F28B82]">
                Xác nhận xóa vĩnh viễn toàn bộ hồ sơ cục bộ?
              </span>
              <button
                type="button"
                onClick={() => {
                  setConfirmDeleteAll(false);
                  onDeleteEntireProfile();
                }}
                className="min-h-[40px] px-4 py-1.5 rounded-lg bg-[#B42318] text-white text-xs font-bold"
              >
                Đồng ý xóa sạch
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteAll(false)}
                className="min-h-[40px] px-3 py-1.5 rounded-lg border border-[var(--lb-border)] bg-[var(--lb-card)] text-xs font-bold"
              >
                Hủy
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onResetToDemoProfile}
            className="min-h-[48px] px-4 py-2.5 rounded-xl border border-[var(--lb-primary)] text-[var(--lb-primary)] font-bold text-xs"
          >
            Nạp lại hồ sơ minh họa (DEMO)
          </button>
        </div>
      </div>

      {/* 4. KHO NGHIÊN CỨU ĐỘC LẬP M (M01–M12 — TÁCH LUỒNG, KHÔNG PROFILE_ID, ẨN Ô NHỎ < 10 — P05) */}
      <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[var(--lb-primary)]" />
              <h2 className="text-base font-bold">
                4. Chế độ Nghiên cứu độc lập — Phân hệ M (M01–M12 · Tách khỏi hồ sơ cá nhân)
              </h2>
            </div>
            <p className="text-xs text-[var(--lb-muted)] mt-1">
              Theo quy tắc 2.0.1 (P05): Phân hệ M không nằm trong hành trình cá nhân, không gắn với <code>profileId</code> hay nhật ký I/O, và chỉ mở khi có phê duyệt nghiên cứu. Thống kê tổng hợp tự động ẩn các nhóm/ô nhỏ dưới 10 phiếu (<code>&lt; 10</code>).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setResearchModeEnabled((v) => !v)}
            className={`min-h-[44px] px-4 py-2 rounded-xl border text-xs font-bold ${
              researchModeEnabled
                ? 'bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] border-transparent'
                : 'border-[var(--lb-border)] bg-[var(--lb-bg)]'
            }`}
          >
            {researchModeEnabled ? 'Đóng chế độ Nghiên cứu M' : 'Mở chế độ Nghiên cứu M (Dành cho kiểm thử kỹ thuật)'}
          </button>
        </div>

        {researchModeEnabled && (
          <div className="space-y-5 pt-4 border-t border-[var(--lb-border)]">
            {mError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-[#8A5A16]/10 border border-[#8A5A16] text-xs font-bold text-[#8A5A16] dark:text-[#E5B567] flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{mError}</span>
              </div>
            )}
            {mSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-[#006B60]/10 border border-[var(--lb-primary)] text-xs font-bold text-[var(--lb-primary)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{mSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              {mQuestions.map((q) => {
                const curAns = mDraftAnswers[q.id];
                const agg = mAggregates[q.id];
                return (
                  <div
                    key={q.id}
                    className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-3 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-sm">
                        {q.id} · {q.content}
                      </span>
                      <span className="text-[var(--lb-muted)]">
                        {q.type === 'multi_choice'
                          ? `Nhiều lựa chọn (Loại trừ: ${q.exclusive_values.join(', ')})`
                          : 'Một lựa chọn'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt) => {
                        const selected =
                          typeof curAns === 'string'
                            ? curAns === opt.value
                            : Array.isArray(curAns) && curAns.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelectMOption(q.id, q.type, opt.value)}
                            className={`min-h-[40px] p-2.5 rounded-xl border text-left font-semibold flex items-center justify-between ${
                              selected
                                ? 'border-2 border-[var(--lb-primary)] bg-[#006B60]/10 font-bold'
                                : 'border-[var(--lb-border)] bg-[var(--lb-card)]'
                            }`}
                          >
                            <span>
                              {opt.value} · {opt.label}
                            </span>
                            {selected && <CheckCircle2 className="w-4 h-4 text-[var(--lb-primary)] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Hiển thị kết quả tổng hợp ẩn danh có quy tắc ẩn ô < 10 */}
                    {agg && (
                      <div className="p-2.5 rounded-lg bg-[var(--lb-card)] border border-[var(--lb-border)] text-[11px] text-[var(--lb-muted)]">
                        <strong>Thống kê kho M ({researchSubmissions.length} phiếu):</strong> Mẫu số hợp lệ ={' '}
                        {agg.validDenominator} · U/X/trống = {agg.uxEmptyCount}.{' '}
                        {agg.suppressedTotalGroup
                          ? 'Đang ẩn số đếm chi tiết vì mẫu số hợp lệ < 10 (Quy tắc bảo vệ nhóm nhỏ 2.0.1).'
                          : agg.optionStats
                              .map((st) =>
                                st.suppressedSmallCell
                                  ? `${st.value}: <10 (ẩn)`
                                  : `${st.value}: ${st.count} (${st.percentage}%)`
                              )
                              .join(' · ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSubmitM}
                className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] font-bold text-xs"
              >
                Nộp phiếu ẩn danh vào kho Nghiên cứu M
              </button>

              {researchSubmissions.length > 0 && (
                <button
                  type="button"
                  onClick={onClearResearchRepository}
                  className="min-h-[48px] px-4 py-2.5 rounded-xl border border-[#B42318] text-[#B42318] font-bold text-xs"
                >
                  Xóa kho nghiên cứu thử nghiệm ({researchSubmissions.length} phiếu)
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. GIỚI HẠN SẢN PHẨM & THÔNG TIN PHÁP LÝ / ĐẠO ĐỨC */}
      <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-2 text-xs text-[var(--lb-muted)]">
        <div className="flex items-center gap-2 font-bold text-sm text-[var(--lb-text)]">
          <ShieldCheck className="w-5 h-5 text-[var(--lb-primary)]" />
          <span>Giới hạn sản phẩm & Tham chiếu quy định</span>
        </div>
        <p>
          • Ứng dụng là công cụ giáo dục tự định hướng dựa trên quy tắc 2.0.1, không phải công cụ chẩn đoán lâm sàng, không thay thế chuyên gia tham vấn học đường và không quyết định nghề thay học sinh.
        </p>
        <p>
          • Thiết kế tham chiếu tiêu chuẩn đạo đức tham vấn học đường (ASCA 2022, APA) và quy định Việt Nam (Thông tư 18/2025/TT-BGDĐT, Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15, Nghị định 356/2025/NĐ-CP).
        </p>
      </div>
    </div>
  );
};
