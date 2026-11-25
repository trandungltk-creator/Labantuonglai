import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  ShieldAlert,
  Plus,
  Layers,
  X,
  Compass,
  FileText,
  MessageSquare,
} from 'lucide-react';
import {
  QUESTION_MAP,
  scoreModuleA,
  scoreModuleB,
  scoreModuleC,
  scoreModuleD,
  scoreModuleE,
  scoreModuleG,
  scoreModuleH,
  scoreModuleJ,
  scoreModuleK,
  scoreModuleL,
  scoreModuleN,
  extractSharedReflectionsIO,
  lookupItemFeedback,
  type StudentProfileContract,
  type InternalReportContract,
  type SupportVerifications,
  type StudentReviewState,
  type SourceVerificationRecord,
  type ModuleId,
} from '../utils/labanEngine';

interface ProfileReportViewProps {
  profile: StudentProfileContract;
  draftReport: InternalReportContract;
  confirmedReport: InternalReportContract | null;
  hasUnconfirmedChanges: boolean;
  onUpdateSupportVerification: (patch: Partial<SupportVerifications>) => void;
  onUpdateCareerChoice: (
    suggestionId: string,
    choice: 'Muốn thử' | 'Còn phân vân' | 'Không phù hợp' | 'Em có hướng khác'
  ) => void;
  onUpdateCustomDirection: (customTitle: string | null) => void;
  onConfirmStudentReview: (review: StudentReviewState) => void;
  onAddSourceVerification: (record: SourceVerificationRecord) => void;
  onJumpToModule: (moduleId: ModuleId, questionId?: string) => void;
  onOpenEmergencySupport: () => void;
}

type SectionFilter = 'all' | 'part1' | 'part2' | 'part3' | 'part4';

export const ProfileReportView: React.FC<ProfileReportViewProps> = ({
  profile,
  draftReport,
  confirmedReport,
  hasUnconfirmedChanges,
  onUpdateSupportVerification,
  onUpdateCareerChoice,
  onUpdateCustomDirection,
  onConfirmStudentReview,
  onAddSourceVerification,
  onJumpToModule,
  onOpenEmergencySupport,
}) => {
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all');
  const [viewingConfirmedVersion, setViewingConfirmedVersion] = useState(false);
  const [whyModalItemIds, setWhyModalItemIds] = useState<{ title: string; ids: string[] } | null>(
    null
  );
  const [customDirInput, setCustomDirInput] = useState(profile.customCareerDirection || '');

  const [reviewForm, setReviewForm] = useState<StudentReviewState>(
    profile.studentReview || {
      accurateParts: '',
      partsToEdit: '',
      additions: '',
      privateParts: '',
      decision: null,
      confirmedAt: null,
    }
  );

  const [sourceForm, setSourceForm] = useState<Omit<SourceVerificationRecord, 'id'>>({
    directionTitle: '',
    source1Name: '',
    source1Date: '',
    source1Scope: '',
    source2Name: '',
    source2Date: '',
    source2Scope: '',
    scenarioBaseline: '',
    scenarioTechChange: '',
    scenarioResourceChange: '',
  });

  const activeReport =
    viewingConfirmedVersion && confirmedReport ? confirmedReport : draftReport;

  // Quy tắc S32: Khi safetyPause = true, không hiển thị báo cáo hướng nghiệp thông thường
  if (profile.confirmedSafetyPause || activeReport.safetyPause) {
    return (
      <div className="bg-[var(--lb-card)] border-2 border-[#B42318] dark:border-[#F28B82] rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 text-[#B42318] dark:text-[#F28B82]">
          <ShieldAlert className="w-7 h-7 shrink-0" />
          <h1 className="text-xl font-bold">
            Phiên báo cáo hướng nghiệp đang tạm dừng để ưu tiên hỗ trợ an toàn cho em
          </h1>
        </div>
        <p className="text-sm text-[var(--lb-muted)]">
          Theo quy tắc bảo vệ học sinh 2.0.1 (S32), khi trạng thái tạm dừng an toàn được bật, ứng dụng không hiển thị điểm số hay gợi ý nghề nghiệp để tránh gây áp lực. Em luôn có quyền truy cập thông tin kết nối người hỗ trợ thật hoặc tắt chế độ tạm dừng khi đã sẵn sàng.
        </p>
        <button
          type="button"
          onClick={onOpenEmergencySupport}
          className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#B42318] text-white font-bold text-sm"
        >
          Mở màn hình Em cần hỗ trợ (111 / 115 / 113)
        </button>
      </div>
    );
  }

  const resA = scoreModuleA(profile.answers);
  const resB = scoreModuleB(profile.answers);
  const resC = scoreModuleC(profile.answers);
  const resD = scoreModuleD(profile);
  const resE = scoreModuleE(profile.answers);
  const resG = scoreModuleG(profile.answers);
  const resH = scoreModuleH(profile.answers);
  const resJ = scoreModuleJ(profile.answers);
  const resK = scoreModuleK(profile.answers);
  const resL = scoreModuleL(profile.answers);
  const resN = scoreModuleN(profile.answers);
  const resIO = extractSharedReflectionsIO(profile.answers);

  const handleSaveSourceVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !sourceForm.directionTitle.trim() ||
      !sourceForm.source1Name.trim() ||
      !sourceForm.source2Name.trim()
    ) {
      return;
    }
    onAddSourceVerification({
      id: `sv-${Date.now()}`,
      ...sourceForm,
    });
    setSourceForm({
      directionTitle: '',
      source1Name: '',
      source1Date: '',
      source1Scope: '',
      source2Name: '',
      source2Date: '',
      source2Scope: '',
      scenarioBaseline: '',
      scenarioTechChange: '',
      scenarioResourceChange: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* ĐẦU TRANG: NGÀY, PHIÊN BẢN, TUYÊN BỐ ẢNH CHỤP HIỆN TẠI & BỘ LỌC 4 PHẦN */}
      <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap text-xs text-[var(--lb-muted)]">
              <span className="font-bold text-[var(--lb-primary)]">
                03 & 04. Hồ sơ cá nhân & Bản đồ lựa chọn
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                Phiếu {activeReport.questionVersion} · Quy tắc {activeReport.ruleVersion} · Bản{' '}
                {activeReport.reportVersion}
              </span>
              {profile.isDemo && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-bold text-[var(--lb-warn)]">DỮ LIỆU GIẢ LẬP (DEMO)</span>
                </>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--lb-text)]">
              “Đây là ảnh chụp ở thời điểm hiện tại, không phải kết luận về con người em.”
            </h1>

            <p className="text-xs text-[var(--lb-muted)] tabular-nums">
              Thời điểm tạo bản chụp: {new Date(activeReport.generatedAt).toLocaleString('vi-VN')} ·
              Mã hồ sơ cục bộ: <strong className="text-[var(--lb-text)]">{activeReport.profileId}</strong>{' '}
              {activeReport.grade ? `· Khối ${activeReport.grade}` : ''}
            </p>
          </div>
        </div>

        {/* Cảnh báo U04: Khi học sinh sửa đáp án sau khi đã xác nhận báo cáo */}
        {hasUnconfirmedChanges && confirmedReport && (
          <div className="p-4 rounded-xl bg-[var(--lb-info-soft)] border border-[var(--lb-info)]/40 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold text-[var(--lb-info)]">
                Thông báo phiên bản (U04): Em vừa thay đổi một số câu trả lời sau khi đã xác nhận báo cáo trước đó. Hệ thống giữ nguyên bản đã xác nhận ({confirmedReport.reportVersion}) và tạo bản dự thảo mới để em đối chiếu.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingConfirmedVersion(false)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold border whitespace-nowrap shrink-0 lb-transition ${
                    !viewingConfirmedVersion
                      ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] border-transparent'
                      : 'bg-[var(--lb-card)] border-[var(--lb-border)]'
                  }`}
                >
                  Xem bản Dự thảo mới
                </button>
                <button
                  type="button"
                  onClick={() => setViewingConfirmedVersion(true)}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold border whitespace-nowrap shrink-0 lb-transition ${
                    viewingConfirmedVersion
                      ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] border-transparent'
                      : 'bg-[var(--lb-card)] border-[var(--lb-border)]'
                  }`}
                >
                  Xem bản Đã xác nhận ({confirmedReport.reportVersion})
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Thanh chuyển nhanh giữa 4 phần báo cáo */}
        <div className="pt-3 border-t border-[var(--lb-border)] flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all' as const, label: 'Toàn cảnh 4 phần' },
            { id: 'part1' as const, label: '01. Điều em đã mô tả (A·B·C·D·H)' },
            { id: 'part2' as const, label: '02. Minh chứng em đã có (N·J·E·K·G·L)' },
            { id: 'part3' as const, label: `03. Câu hỏi mở (${activeReport.questionsToExplore.length})` },
            { id: 'part4' as const, label: `04. Hướng thử tiếp (${activeReport.softSuggestions.length})` },
          ].map((tab) => {
            const active = sectionFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSectionFilter(tab.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap shrink-0 lb-transition ${
                  active
                    ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] border-transparent'
                    : 'bg-[var(--lb-bg)] border-[var(--lb-border)] text-[var(--lb-muted)] hover:text-[var(--lb-text)]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PHẦN I: ĐIỀU EM ĐÃ MÔ TẢ (SELF-REPORTED DATA: A, B, C, D, H) */}
      {(sectionFilter === 'all' || sectionFilter === 'part1') && (
        <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--lb-border)] pb-4">
            <div>
              <span className="text-xs font-bold text-[var(--lb-primary)]">
                Phần 1 / 4 · Tự mô tả (Không phải năng lực đã xác minh)
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold mt-0.5">1. Điều em đã mô tả</h2>
              <p className="text-xs text-[var(--lb-muted)] mt-0.5">
                Mọi chỉ số dưới đây đều kèm số câu hợp lệ (n/tổng) và bảng số để đọc màn hình dễ dàng. Nếu thiếu dữ liệu, hệ thống ghi “Chưa đủ dữ liệu”, tuyệt đối không quy về 0.
              </p>
            </div>
            <FileText className="w-5 h-5 text-[var(--lb-primary)] shrink-0 hidden sm:block" />
          </div>

          {/* 1.1 Phân hệ A: 3 nhóm riêng, không tổng A */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold">
                A · Hiểu mình và điều có ý nghĩa (3 nhóm độc lập · Không tính điểm tổng A)
              </h3>
              <button
                type="button"
                onClick={() =>
                  setWhyModalItemIds({
                    title: 'Căn cứ mã câu hỏi Phân hệ A (A01–A12)',
                    ids: [
                      'A01',
                      'A02',
                      'A03',
                      'A04',
                      'A05',
                      'A06',
                      'A07',
                      'A08',
                      'A09',
                      'A10',
                      'A11',
                      'A12',
                    ],
                  })
                }
                className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[var(--lb-border)] bg-[var(--lb-bg)] text-xs font-bold text-[var(--lb-primary)] flex items-center gap-1.5 whitespace-nowrap shrink-0 hover:border-[var(--lb-primary)] lb-transition"
              >
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Vì sao có kết quả này?</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--lb-border)] text-xs text-[var(--lb-muted)]">
                    <th className="py-2.5 pr-3">Nhóm A (Yêu cầu ≥ 3/4 câu)</th>
                    <th className="py-2.5 px-3">Số câu hợp lệ</th>
                    <th className="py-2.5 px-3">Điểm quy đổi (0–100)</th>
                    <th className="py-2.5 pl-3">Thanh trực quan</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(resA.subgroups).map((sg) => (
                    <tr key={sg.subgroup} className="border-b border-[var(--lb-border)]/60">
                      <td className="py-3 pr-3 font-semibold">{sg.label}</td>
                      <td className="py-3 px-3 tabular-nums text-[var(--lb-muted)]">
                        {sg.validCount}/{sg.totalItems}
                      </td>
                      <td className="py-3 px-3 font-bold tabular-nums">
                        {sg.isValid && sg.displayScore !== null
                          ? sg.displayScore.toFixed(1)
                          : 'Chưa đủ dữ liệu'}
                      </td>
                      <td className="py-3 pl-3 w-52">
                        {sg.isValid && sg.displayScore !== null ? (
                          <div className="w-full h-2.5 rounded-full bg-[var(--lb-surface-subtle)] overflow-hidden">
                            <div
                              className="h-full bg-[var(--lb-primary)]"
                              style={{ width: `${Math.min(100, Math.max(0, sg.displayScore))}%` }}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--lb-muted)]">Không vẽ thanh khi thiếu</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 1.2 Phân hệ B: 6 nhóm RIASEC */}
          <div className="space-y-3 pt-4 border-t border-[var(--lb-border)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold">
                  B · Sở thích nghề nghiệp RIASEC (Em tự mô tả · Yêu cầu ≥ 5/6 câu mỗi nhóm)
                </h3>
                <p className="text-xs text-[var(--lb-muted)] mt-0.5">
                  {!resB.allSixValid
                    ? 'Chưa đủ cả 6 nhóm hợp lệ (≥ 5/6 câu mỗi nhóm) nên hệ thống chưa xác định nhóm dẫn đầu (Quy tắc S06).'
                    : resB.isFlatProfile
                    ? 'Hồ sơ phẳng (chênh lệch cao nhất – thấp nhất ≤ 10 điểm chưa làm tròn): Không ép mã dẫn đầu bắt buộc (Quy tắc S05, S08).'
                    : `Nhóm sở thích dẫn đầu (cách điểm cao nhất ≤ 10 điểm chưa làm tròn): ${resB.leadingGroups.join(', ')}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setWhyModalItemIds({
                    title: 'Căn cứ mã câu hỏi Sở thích B (B01–B36)',
                    ids: Array.from({ length: 36 }, (_, i) => `B${String(i + 1).padStart(2, '0')}`),
                  })
                }
                className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[var(--lb-border)] bg-[var(--lb-bg)] text-xs font-bold text-[var(--lb-primary)] flex items-center gap-1.5 whitespace-nowrap shrink-0 hover:border-[var(--lb-primary)] lb-transition"
              >
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Vì sao có kết quả này?</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--lb-border)] text-xs text-[var(--lb-muted)]">
                    <th className="py-2.5 pr-3">Nhóm RIASEC</th>
                    <th className="py-2.5 px-3">Hợp lệ (n/6)</th>
                    <th className="py-2.5 px-3">Điểm (0–100)</th>
                    <th className="py-2.5 pl-3">Thanh trực quan</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(resB.subgroups).map((sg) => {
                    const isLeading = resB.leadingGroups.includes(
                      sg.subgroup as 'R' | 'I' | 'A' | 'S' | 'E' | 'C'
                    );
                    return (
                      <tr key={sg.subgroup} className="border-b border-[var(--lb-border)]/60">
                        <td className="py-3 pr-3 font-semibold">
                          <span>{sg.label}</span>
                          {isLeading && (
                            <span className="ml-2 text-xs font-extrabold text-[var(--lb-primary)]">
                              · Dẫn đầu
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 tabular-nums text-[var(--lb-muted)]">
                          {sg.validCount}/{sg.totalItems}
                        </td>
                        <td className="py-3 px-3 font-bold tabular-nums">
                          {sg.isValid && sg.displayScore !== null
                            ? sg.displayScore.toFixed(1)
                            : 'Chưa đủ dữ liệu'}
                        </td>
                        <td className="py-3 pl-3 w-52">
                          {sg.isValid && sg.displayScore !== null ? (
                            <div className="w-full h-2.5 rounded-full bg-[var(--lb-surface-subtle)] overflow-hidden">
                              <div
                                className={`h-full ${
                                  isLeading ? 'bg-[var(--lb-primary)]' : 'bg-[var(--lb-info)]'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(0, sg.displayScore))}%` }}
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--lb-muted)]">Không vẽ thanh khi thiếu</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 1.3 Phân hệ C: 6 nhóm kỹ năng tự báo cáo */}
          <div className="space-y-3 pt-4 border-t border-[var(--lb-border)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold">
                  C · Kỹ năng hiện có do em tự mô tả (Thang 0–4 · Yêu cầu ≥ 3/4 câu mỗi nhóm)
                </h3>
                <p className="text-xs text-[var(--lb-muted)] mt-0.5">{resC.selfReportDisclaimer}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setWhyModalItemIds({
                    title: 'Căn cứ mã câu hỏi Kỹ năng tự mô tả C (C01–C24)',
                    ids: Array.from({ length: 24 }, (_, i) => `C${String(i + 1).padStart(2, '0')}`),
                  })
                }
                className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[var(--lb-border)] bg-[var(--lb-bg)] text-xs font-bold text-[var(--lb-primary)] flex items-center gap-1.5 whitespace-nowrap shrink-0 hover:border-[var(--lb-primary)] lb-transition"
              >
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Vì sao có kết quả này?</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--lb-border)] text-xs text-[var(--lb-muted)]">
                    <th className="py-2.5 pr-3">Nhóm kỹ năng (Em tự mô tả)</th>
                    <th className="py-2.5 px-3">Hợp lệ (n/4)</th>
                    <th className="py-2.5 px-3">Điểm tự báo cáo</th>
                    <th className="py-2.5 pl-3">Thanh trực quan</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(resC.subgroups).map((sg) => (
                    <tr key={sg.subgroup} className="border-b border-[var(--lb-border)]/60">
                      <td className="py-3 pr-3 font-semibold">{sg.label}</td>
                      <td className="py-3 px-3 tabular-nums text-[var(--lb-muted)]">
                        {sg.validCount}/{sg.totalItems}
                      </td>
                      <td className="py-3 px-3 font-bold tabular-nums">
                        {sg.isValid && sg.displayScore !== null
                          ? sg.displayScore.toFixed(1)
                          : 'Chưa đủ dữ liệu'}
                      </td>
                      <td className="py-3 pl-3 w-52">
                        {sg.isValid && sg.displayScore !== null ? (
                          <div className="w-full h-2.5 rounded-full bg-[var(--lb-surface-subtle)] overflow-hidden">
                            <div
                              className="h-full bg-[var(--lb-primary)]"
                              style={{ width: `${Math.min(100, Math.max(0, sg.displayScore))}%` }}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--lb-muted)]">Không vẽ thanh khi thiếu</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 1.4 Phân hệ H (2 trục độc lập) & Phân hệ D (3 ưu tiên) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--lb-border)]">
            <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold">
                  H · Tự nhận thức 2 trục riêng (Yêu cầu ≥ 6/8 mỗi trục · Không tổng · Không gán nhãn)
                </h4>
                <button
                  type="button"
                  onClick={() =>
                    setWhyModalItemIds({
                      title: 'Căn cứ mã câu hỏi Tự nhận thức H (H01–H16)',
                      ids: Array.from({ length: 16 }, (_, i) => `H${String(i + 1).padStart(2, '0')}`),
                    })
                  }
                  className="text-xs font-bold text-[var(--lb-primary)] underline shrink-0"
                >
                  Xem mã
                </button>
              </div>
              <div className="text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[var(--lb-muted)]">{resH.subgroups.NT.label}:</span>
                  <strong className="tabular-nums">{resH.subgroups.NT.statusText}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--lb-muted)]">{resH.subgroups.NB.label}:</span>
                  <strong className="tabular-nums">{resH.subgroups.NB.statusText}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold">D · Ba giá trị ưu tiên do em tự chọn & Ranh giới</h4>
                <button
                  type="button"
                  onClick={() => onJumpToModule('D')}
                  className="text-xs font-bold text-[var(--lb-primary)] underline shrink-0"
                >
                  Chỉnh ưu tiên D
                </button>
              </div>
              {resD.valuePriorities.length === 0 ? (
                <p className="text-xs text-[var(--lb-muted)]">
                  Em chưa chọn danh sách 3 mã ưu tiên phần D.
                </p>
              ) : (
                <ol className="list-decimal list-inside text-xs space-y-1">
                  {resD.valuePriorities.map((dId) => (
                    <li key={dId}>
                      <strong>{dId}:</strong> {QUESTION_MAP.get(dId)?.content} (Mức đã chọn:{' '}
                      {resD.itemValues[dId] ?? 'Chưa chọn'})
                    </li>
                  ))}
                </ol>
              )}
              {resD.boundary && (
                <p className="text-xs text-[var(--lb-muted)] pt-1 border-t border-[var(--lb-border)]">
                  <strong className="text-[var(--lb-text)]">Điều không muốn đánh đổi:</strong>{' '}
                  {resD.boundary}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PHẦN II: MINH CHỨNG EM ĐÃ CÓ (CONFIRMED EVIDENCE: N, J, E, K, G, L, I/O ĐỒNG Ý) */}
      {(sectionFilter === 'all' || sectionFilter === 'part2') && (
        <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-6">
          <div className="border-b border-[var(--lb-border)] pb-4">
            <span className="text-xs font-bold text-[var(--lb-primary)]">
              Phần 2 / 4 · Sản phẩm thực chứng, quan sát hành vi & kiến thức kiểm chứng
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold mt-0.5">2. Minh chứng em đã có</h2>
          </div>

          {/* 2.1 Phòng thử nghề N (N01–N08) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-bold">
                N · Sản phẩm Phòng thử nghề trên giấy (Chỉ công nhận 0/1/2 khi có sản phẩm & người đánh giá xác nhận)
              </h3>
              <button
                type="button"
                onClick={() => onJumpToModule('N', 'N01')}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-[var(--lb-primary)] text-xs font-bold text-[var(--lb-primary)] hover:bg-[var(--lb-primary-soft)] whitespace-nowrap shrink-0 lb-transition"
              >
                Cập nhật bài thử N
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.values(resN.items).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-1.5 text-xs flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{item.id}</span>
                      <span
                        className={`font-bold tabular-nums ${
                          item.status !== 'Chưa đánh giá'
                            ? 'text-[var(--lb-primary)]'
                            : 'text-[var(--lb-muted)]'
                        }`}
                      >
                        {item.status !== 'Chưa đánh giá'
                          ? `Mức ${item.status}/2 ✓`
                          : 'Chưa đánh giá'}
                      </span>
                    </div>
                    {item.evidence ? (
                      <p className="text-[var(--lb-text)]">
                        <strong>Sản phẩm:</strong> {item.evidence}
                      </p>
                    ) : (
                      <p className="text-[var(--lb-muted)]">Chưa ghi nhận sản phẩm minh chứng.</p>
                    )}
                  </div>
                  {item.support && (
                    <p className="text-[11px] text-[var(--lb-muted)] pt-1 border-t border-[var(--lb-border)]">
                      <strong>Hỗ trợ:</strong> {item.support}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2.2 Đối sánh hành vi J (J01–J12) */}
          <div className="space-y-3 pt-4 border-t border-[var(--lb-border)]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold">
                  J · Các cặp đối sánh hành vi đủ điều kiện ({resJ.validPairedCount}/12 cặp hợp lệ)
                </h3>
                <p className="text-xs text-[var(--lb-muted)]">
                  Chỉ hiển thị Y/Y, Y/N, N/Y, N/N khi cùng bối cảnh, đồng thuận 2 bên và có ví dụ cho Y. Tuyệt đối không tính tỷ lệ vùng mù.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onJumpToModule('J', 'J01')}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-[var(--lb-border)] bg-[var(--lb-bg)] text-xs font-bold whitespace-nowrap shrink-0 hover:border-[var(--lb-primary)] lb-transition"
              >
                Mở phân hệ J
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {Object.values(resJ.items).map((jItem) => (
                <div
                  key={jItem.id}
                  className="p-3.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{jItem.id}</span>
                    <span className="text-[var(--lb-primary)]">{jItem.status}</span>
                  </div>
                  {jItem.status !== 'Chưa đủ dữ liệu' && (
                    <div className="text-[var(--lb-muted)] space-y-0.5 pt-1 border-t border-[var(--lb-border)]">
                      <div>Em: {jItem.selfExample || 'Chưa thấy (N)'}</div>
                      <div>Quan sát: {jItem.observerExample || 'Chưa thấy (N)'}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 2.3 Kiến thức tình huống E & K + Việc đã làm G & L + Tóm tắt I/O chủ động chia sẻ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--lb-border)]">
            <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-2.5 text-xs">
              <h4 className="font-bold text-sm">
                E & K · Kiến thức ra quyết định & thị trường (Không đo IQ · Không tạo tổng K)
              </h4>
              <div className="space-y-1.5">
                {Object.values(resE.subgroups).map((sg) => (
                  <div key={sg.subgroup} className="flex justify-between">
                    <span className="text-[var(--lb-muted)]">E · {sg.label}:</span>
                    <strong className="tabular-nums">
                      {sg.isComplete
                        ? `${sg.correctCount}/3 (${sg.levelGuidance})`
                        : `Chưa đủ (${sg.validCount}/3)`}
                    </strong>
                  </div>
                ))}
                <div className="flex justify-between pt-1.5 border-t border-[var(--lb-border)] text-[var(--lb-primary)]">
                  <span>Tổng E (chỉ báo khi đủ 12/12):</span>
                  <strong className="tabular-nums">
                    {resE.totalComplete
                      ? `${resE.totalScoreOutOf12}/12`
                      : `Chưa đủ (${resE.totalValidCount}/12)`}
                  </strong>
                </div>
                <div className="pt-2 space-y-1.5">
                  {Object.values(resK.subgroups).map((sg) => (
                    <div key={sg.subgroup} className="flex justify-between">
                      <span className="text-[var(--lb-muted)]">K · {sg.label}:</span>
                      <strong className="tabular-nums">
                        {sg.isComplete
                          ? `${sg.correctCount}/3 (${sg.levelGuidance})`
                          : `Chưa đủ (${sg.validCount}/3)`}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-2.5 text-xs">
              <h4 className="font-bold text-sm">
                G & L · Tiến độ chuẩn bị (G) và Việc đã thực sự làm trong 30 ngày (L)
              </h4>
              <p>
                <strong>Phân hệ G (8 mục):</strong> Đã có sản phẩm (mức 2):{' '}
                <strong className="tabular-nums">{resG.countLevel2}</strong> · Đang làm/chưa có (mức 0–1):{' '}
                <strong className="tabular-nums">{resG.countLevel0Or1}</strong> · U/X/trống:{' '}
                <strong className="tabular-nums">{resG.countUXOrEmpty}</strong>
              </p>
              <div className="space-y-1.5 pt-1.5 border-t border-[var(--lb-border)]">
                {Object.values(resL.subgroups).map((lg) => (
                  <div key={lg.subgroup} className="tabular-nums">
                    <strong>L · {lg.label}:</strong> Mức 2 ({lg.count2}) · Mức 1 ({lg.count1}) · Mức 0 (
                    {lg.count0}) · U ({lg.countU}) · X ({lg.countX}) · Trống ({lg.countEmpty})
                  </div>
                ))}
              </div>
              {Object.keys(resIO.sharedSummaries).length > 0 && (
                <div className="pt-2 border-t border-[var(--lb-border)] space-y-1">
                  <div className="font-bold text-[var(--lb-primary)]">
                    Tóm tắt I/O em đã chủ động đồng ý chia sẻ:
                  </div>
                  {Object.entries(resIO.sharedSummaries).map(([id, text]) => (
                    <div key={id}>
                      <strong>{id}:</strong> {text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PHẦN III: ĐIỀU CÒN CHƯA RÕ — MA TRẬN 12 NHU CẦU HỖ TRỢ T01–T12 */}
      {(sectionFilter === 'all' || sectionFilter === 'part3') && (
        <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--lb-border)] pb-4">
            <div>
              <span className="text-xs font-bold text-[var(--lb-primary)]">
                Phần 3 / 4 · Câu hỏi xác minh tự nguyện (T01–T12 · Không phải chẩn đoán)
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold mt-0.5">
                3. Điều còn chưa rõ & Câu hỏi mở đối thoại
              </h2>
              <p className="text-xs text-[var(--lb-muted)] mt-0.5">
                Hệ thống không tự động gán nhu cầu hỗ trợ khi chưa được em xác nhận. Em có thể đánh dấu xác nhận các câu hỏi em muốn trao đổi thêm bên dưới.
              </p>
            </div>
            <MessageSquare className="w-5 h-5 text-[var(--lb-info)] shrink-0 hidden sm:block" />
          </div>

          {/* Các nút xác nhận điều kiện cần xác minh (S28, S29, S30) */}
          <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-3 text-xs">
            <div className="font-bold text-sm">
              Xác nhận tự nguyện của em cho các điều kiện T06, T10, T12:
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(profile.supportVerifications?.confirmFinancialDifficulty)}
                onChange={(e) =>
                  onUpdateSupportVerification({ confirmFinancialDifficulty: e.target.checked })
                }
                className="mt-0.5 w-4 h-4 accent-[#006B60]"
              />
              <span>
                <strong>T06:</strong> Em xác nhận đang có khó khăn về chi phí và muốn cùng tìm hiểu học bổng / lập bảng N02 (Lưu ý: chọn F03A một mình không tự động gán khó khăn kinh tế — S29).
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(profile.supportVerifications?.confirmScheduleOverload)}
                onChange={(e) =>
                  onUpdateSupportVerification({ confirmScheduleOverload: e.target.checked })
                }
                className="mt-0.5 w-4 h-4 accent-[#006B60]"
              />
              <span>
                <strong>T12:</strong> Em xác nhận lịch học tập/sinh hoạt hiện tại đang quá tải cần cùng điều chỉnh (Khi H04 thấp/chưa rõ; G05 không dùng để đo quá tải — S30).
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(profile.supportVerifications?.confirmVoluntaryLongTermDifficulty)}
                onChange={(e) =>
                  onUpdateSupportVerification({
                    confirmVoluntaryLongTermDifficulty: e.target.checked,
                  })
                }
                className="mt-0.5 w-4 h-4 accent-[#006B60]"
              />
              <span>
                <strong>T10:</strong> Em tự nguyện chia sẻ đang có khó khăn kéo dài và muốn đặt lịch gặp riêng người tư vấn (Hệ thống tuyệt đối không tự quét nhật ký I/O).
              </span>
            </label>
          </div>

          {activeReport.questionsToExplore.length === 0 ? (
            <p className="text-sm text-[var(--lb-muted)]">
              Hiện chưa có câu hỏi đối chiếu nào phát sinh từ dữ liệu đã nhập. Em có thể tiếp tục khám phá thêm các phân hệ A–O.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeReport.questionsToExplore.map((qItem) => (
                <div
                  key={qItem.code}
                  className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-extrabold text-[var(--lb-info)]">
                        {qItem.code} · {qItem.title}
                      </span>
                      <span className="text-[var(--lb-muted)] font-semibold">
                        {qItem.verificationStatus}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--lb-text)] leading-relaxed">
                      <strong>Câu hỏi gợi mở:</strong> {qItem.questionToAsk}
                    </p>
                  </div>
                  <p className="text-xs text-[var(--lb-muted)] pt-2 border-t border-[var(--lb-border)]">
                    <strong>Hướng hỗ trợ quy chuẩn:</strong> {qItem.supportAction} ·{' '}
                    <span>Căn cứ mã: {qItem.sourceIds.join(', ')}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PHẦN IV: HƯỚNG THỬ TIẾP THEO — BẢN ĐỒ LỰA CHỌN (GỢI Ý MỀM 04) */}
      {(sectionFilter === 'all' || sectionFilter === 'part4') && (
        <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--lb-border)] pb-4">
            <div>
              <span className="text-xs font-bold text-[var(--lb-primary)]">
                Phần 4 / 4 · Bản đồ lựa chọn (04 — Giả thuyết cần khảo sát, không phải phán quyết)
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold mt-0.5">4. Hướng thử tiếp theo</h2>
              <p className="text-xs text-[var(--lb-muted)] mt-0.5">
                Mỗi hướng nghề dưới đây chỉ là một giả thuyết để em thử nghiệm bằng nhiệm vụ nhỏ và kiểm chứng từ ít nhất 2 nguồn độc lập. Không dùng tỷ lệ “phù hợp %” hay dự báo khả năng thành công.
              </p>
            </div>
            <Compass className="w-5 h-5 text-[var(--lb-primary)] shrink-0 hidden sm:block" />
          </div>

          {activeReport.softSuggestions.length === 0 ? (
            <div className="p-5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-3">
              <p className="text-sm font-semibold">
                Hiện chưa đủ dữ liệu ở phân hệ Sở thích B hoặc Kỹ năng tự mô tả C để đề xuất hướng tự động (Quy tắc S27 — không bịa nghề từ hồ sơ trống).
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onJumpToModule('B', 'B01')}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[var(--lb-primary)] text-white dark:text-[#0B1514] text-xs font-bold"
                >
                  Khám phá Sở thích B (36 câu)
                </button>
                <button
                  type="button"
                  onClick={() => onJumpToModule('N', 'N01')}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-[var(--lb-primary)] text-[var(--lb-primary)] text-xs font-bold"
                >
                  Thử Phòng thử nghề N (8 bài)
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeReport.softSuggestions.map((card, idx) => (
                <div
                  key={card.id}
                  className="p-5 rounded-2xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[var(--lb-border)] pb-3">
                    <div>
                      <span className="text-xs font-bold text-[var(--lb-primary)]">
                        Giả thuyết thử nghiệm #{idx + 1} · Nhóm {card.directionGroup}
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold mt-0.5">{card.title}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setWhyModalItemIds({
                          title: `Căn cứ mã gợi ý: ${card.title}`,
                          ids:
                            card.directionGroup === 'R'
                              ? ['B01', 'B12', 'B17', 'B22', 'B27', 'B32', 'C01', 'N03']
                              : card.directionGroup === 'I'
                              ? ['B02', 'B07', 'B18', 'B23', 'B28', 'B33', 'C02', 'N01']
                              : card.directionGroup === 'A'
                              ? ['B03', 'B08', 'B13', 'B24', 'B29', 'B34', 'C03', 'N04']
                              : card.directionGroup === 'S'
                              ? ['B04', 'B09', 'B14', 'B19', 'B30', 'B35', 'C04', 'N05']
                              : card.directionGroup === 'E'
                              ? ['B05', 'B10', 'B15', 'B20', 'B25', 'B36', 'C05', 'N07']
                              : ['B06', 'B11', 'B16', 'B21', 'B26', 'B31', 'C06', 'N02'],
                        })
                      }
                      className="text-xs font-bold text-[var(--lb-primary)] underline shrink-0"
                    >
                      Xem mã căn cứ ({card.sourceIds.join(', ')})
                    </button>
                  </div>

                  {/* Bố cục 2 cột rõ ràng để dễ đọc */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="space-y-2">
                      <p>
                        <strong>Ví dụ nhiệm vụ nghề:</strong> {card.exampleTasks}
                      </p>
                      <p>
                        <strong>Vì sao đề xuất khảo sát:</strong> {card.reason}
                      </p>
                      <p className="text-[var(--lb-primary)] font-semibold">
                        <strong>Việc thử nhỏ (7 ngày):</strong> {card.microExperiment}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p>
                        <strong>Điều còn chưa rõ:</strong> {card.unknowns}
                      </p>
                      <p className="text-xs text-[var(--lb-muted)]">
                        <strong>Điều kiện cần kiểm tra:</strong> {card.conditionsToVerify}
                      </p>
                    </div>
                  </div>

                  {/* 4 nút phản hồi của học sinh */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--lb-border)]">
                    {(
                      ['Muốn thử', 'Còn phân vân', 'Không phù hợp', 'Em có hướng khác'] as const
                    ).map((choice) => {
                      const active = card.studentChoice === choice;
                      return (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => onUpdateCareerChoice(card.id, choice)}
                          className={`min-h-[42px] px-4 py-2 rounded-xl border text-xs font-bold whitespace-nowrap shrink-0 lb-transition ${
                            active
                              ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] border-transparent'
                              : 'bg-[var(--lb-card)] border-[var(--lb-border)] hover:border-[var(--lb-primary)]'
                          }`}
                        >
                          {choice} {active ? '✓' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Thêm hướng khảo sát riêng */}
          <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-2.5">
            <label className="block text-sm font-bold">
              Em luôn có quyền tự thêm hướng khảo sát riêng (hoặc chưa chọn hướng nào):
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customDirInput}
                onChange={(e) => setCustomDirInput(e.target.value)}
                placeholder="Nhập tên lĩnh vực hoặc công việc em muốn tự tìm hiểu..."
                className="flex-1 min-h-[46px] px-4 py-2 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] text-sm"
              />
              <button
                type="button"
                onClick={() => onUpdateCustomDirection(customDirInput.trim() || null)}
                className="min-h-[46px] px-5 py-2 rounded-xl bg-[var(--lb-primary)] text-white dark:text-[#0B1514] text-xs font-bold whitespace-nowrap shrink-0"
              >
                Lưu hướng tự chọn
              </button>
            </div>
          </div>

          {/* PHIẾU KIỂM CHỨNG 2 NGUỒN ĐỘC LẬP & 3 KỊCH BẢN */}
          <div className="p-5 rounded-2xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-4">
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-[var(--lb-primary)]" />
                <span>Phiếu ghi 2 nguồn thông tin độc lập & 3 kịch bản thích ứng</span>
              </h3>
              <p className="text-xs text-[var(--lb-muted)] mt-0.5">
                Ứng dụng không tự sinh số lương, học phí hay điểm chuẩn để tránh thông tin sai lệch. Em hãy ghi lại ít nhất 2 nguồn chính thức kèm ngày công bố, phạm vi và 3 kịch bản (cơ sở, công nghệ thay đổi, nguồn lực thay đổi).
              </p>
            </div>

            {(profile.sourceVerifications || []).length > 0 && (
              <div className="space-y-3">
                {(profile.sourceVerifications || []).map((sv) => (
                  <div
                    key={sv.id}
                    className="p-4 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] text-xs space-y-1.5"
                  >
                    <div className="font-bold text-sm text-[var(--lb-primary)]">
                      Hướng kiểm chứng: {sv.directionTitle}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <strong>Nguồn 1:</strong> {sv.source1Name} (Ngày:{' '}
                        {sv.source1Date || 'Chưa ghi'} · Phạm vi: {sv.source1Scope || 'Chưa ghi'})
                      </div>
                      <div>
                        <strong>Nguồn 2:</strong> {sv.source2Name} (Ngày:{' '}
                        {sv.source2Date || 'Chưa ghi'} · Phạm vi: {sv.source2Scope || 'Chưa ghi'})
                      </div>
                    </div>
                    <div className="pt-1 border-t border-[var(--lb-border)] space-y-1">
                      <div>
                        <strong>1. Kịch bản cơ sở:</strong> {sv.scenarioBaseline || 'Chưa ghi'}
                      </div>
                      <div>
                        <strong>2. Khi công nghệ/AI thay đổi:</strong>{' '}
                        {sv.scenarioTechChange || 'Chưa ghi'}
                      </div>
                      <div>
                        <strong>3. Khi nguồn lực/điều kiện thay đổi:</strong>{' '}
                        {sv.scenarioResourceChange || 'Chưa ghi'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={handleSaveSourceVerification}
              className="space-y-3 pt-2 border-t border-[var(--lb-border)]"
            >
              <input
                type="text"
                value={sourceForm.directionTitle}
                onChange={(e) => setSourceForm({ ...sourceForm, directionTitle: e.target.value })}
                placeholder="Tên hướng học tập / nghề nghiệp em đang kiểm chứng..."
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] text-xs"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={sourceForm.source1Name}
                  onChange={(e) => setSourceForm({ ...sourceForm, source1Name: e.target.value })}
                  placeholder="Nguồn độc lập 1 (Tên văn bản/trang chính thức)"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] text-xs"
                />
                <input
                  type="text"
                  value={sourceForm.source1Date}
                  onChange={(e) => setSourceForm({ ...sourceForm, source1Date: e.target.value })}
                  placeholder="Ngày công bố nguồn 1 (VD: 2026-05)"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] text-xs"
                />
                <input
                  type="text"
                  value={sourceForm.source1Scope}
                  onChange={(e) => setSourceForm({ ...sourceForm, source1Scope: e.target.value })}
                  placeholder="Phạm vi nguồn 1 (Địa bàn/nhóm đối tượng)"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] text-xs"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={sourceForm.source2Name}
                  onChange={(e) => setSourceForm({ ...sourceForm, source2Name: e.target.value })}
                  placeholder="Nguồn độc lập 2 (Để đối chiếu chéo)"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] text-xs"
                />
                <input
                  type="text"
                  value={sourceForm.source2Date}
                  onChange={(e) => setSourceForm({ ...sourceForm, source2Date: e.target.value })}
                  placeholder="Ngày công bố nguồn 2"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] text-xs"
                />
                <input
                  type="text"
                  value={sourceForm.source2Scope}
                  onChange={(e) => setSourceForm({ ...sourceForm, source2Scope: e.target.value })}
                  placeholder="Phạm vi nguồn 2"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] text-xs"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={sourceForm.scenarioBaseline}
                  onChange={(e) =>
                    setSourceForm({ ...sourceForm, scenarioBaseline: e.target.value })
                  }
                  placeholder="Kịch bản 1: Cơ sở (Thuận lợi theo lộ trình)"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] text-xs"
                />
                <input
                  type="text"
                  value={sourceForm.scenarioTechChange}
                  onChange={(e) =>
                    setSourceForm({ ...sourceForm, scenarioTechChange: e.target.value })
                  }
                  placeholder="Kịch bản 2: Khi công nghệ/AI thay đổi nhiệm vụ"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] text-xs"
                />
                <input
                  type="text"
                  value={sourceForm.scenarioResourceChange}
                  onChange={(e) =>
                    setSourceForm({ ...sourceForm, scenarioResourceChange: e.target.value })
                  }
                  placeholder="Kịch bản 3: Khi nguồn lực/chi phí thay đổi"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] text-xs"
                />
              </div>
              <button
                type="submit"
                className="min-h-[44px] px-4 py-2 rounded-xl border border-[var(--lb-primary)] text-[var(--lb-primary)] font-bold text-xs flex items-center gap-1.5 hover:bg-[var(--lb-primary-soft)] lb-transition"
              >
                <Plus className="w-4 h-4" />
                <span>Lưu phiếu kiểm chứng 2 nguồn & 3 kịch bản</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PHIẾU XÁC NHẬN & PHẢN BIỆN BÁO CÁO CỦA HỌC SINH (Mục 03) */}
      <div className="bg-[var(--lb-card)] border border-[var(--lb-primary)] rounded-2xl p-6 space-y-4">
        <div>
          <span className="text-xs font-bold text-[var(--lb-primary)]">
            Quyền tiếng nói của người học · Phiếu xác nhận báo cáo
          </span>
          <h2 className="text-lg font-extrabold mt-0.5">
            Em đánh giá thế nào về bản chụp báo cáo này?
          </h2>
          <p className="text-xs text-[var(--lb-muted)]">
            Khi em xác nhận, hệ thống lưu bản đã xác nhận riêng để không bị ghi đè nếu sau này em thử sửa đáp án (Quy tắc U04).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="font-bold block">1. Phần nào đúng với em?</label>
            <textarea
              rows={2}
              value={reviewForm.accurateParts}
              onChange={(e) => setReviewForm({ ...reviewForm, accurateParts: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
              placeholder="Ghi nhận những điểm em thấy phản ánh đúng..."
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold block">2. Phần nào em muốn sửa hoặc thử lại?</label>
            <textarea
              rows={2}
              value={reviewForm.partsToEdit}
              onChange={(e) => setReviewForm({ ...reviewForm, partsToEdit: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
              placeholder="Những mục em muốn trải nghiệm thêm trước khi kết luận..."
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold block">3. Có điều gì cần bổ sung về bối cảnh của em?</label>
            <textarea
              rows={2}
              value={reviewForm.additions}
              onChange={(e) => setReviewForm({ ...reviewForm, additions: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
              placeholder="Điều kiện thực tế hoặc sở thích ngoài phiếu..."
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold block">4. Em muốn giữ riêng phần nào khi trao đổi?</label>
            <textarea
              rows={2}
              value={reviewForm.privateParts}
              onChange={(e) => setReviewForm({ ...reviewForm, privateParts: e.target.value })}
              className="w-full p-2.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
              placeholder="Những mục em chỉ giữ cho riêng mình..."
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-2">
          {(['Đồng ý', 'Còn phân vân', 'Chỉnh lại', 'Không sử dụng gợi ý'] as const).map((dec) => {
            const active = reviewForm.decision === dec;
            return (
              <button
                key={dec}
                type="button"
                onClick={() => {
                  const updated: StudentReviewState = {
                    ...reviewForm,
                    decision: dec,
                    confirmedAt: new Date().toISOString(),
                  };
                  setReviewForm(updated);
                  onConfirmStudentReview(updated);
                }}
                className={`min-h-[46px] px-5 py-2.5 rounded-xl border font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap shrink-0 lb-transition ${
                  active
                    ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] border-transparent'
                    : 'bg-[var(--lb-bg)] border-[var(--lb-border)] hover:border-[var(--lb-primary)]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{dec}</span>
              </button>
            );
          })}
        </div>

        {reviewForm.confirmedAt && (
          <p className="text-xs text-[var(--lb-primary)] font-semibold tabular-nums">
            Đã lưu xác nhận của em ({reviewForm.decision}) lúc{' '}
            {new Date(reviewForm.confirmedAt).toLocaleString('vi-VN')}.
          </p>
        )}
      </div>

      {/* MODAL "VÌ SAO CÓ KẾT QUẢ NÀY?" */}
      {whyModalItemIds && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[var(--lb-border)] flex items-center justify-between">
              <h3 className="font-bold text-base">{whyModalItemIds.title}</h3>
              <button
                type="button"
                onClick={() => setWhyModalItemIds(null)}
                className="min-h-[38px] px-3 py-1 rounded-xl border border-[var(--lb-border)] text-xs font-bold flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                <span>Đóng</span>
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              {whyModalItemIds.ids.map((id) => {
                const q = QUESTION_MAP.get(id);
                const ans = profile.answers[id];
                const fb = lookupItemFeedback(id, ans);
                return (
                  <div
                    key={id}
                    className="p-3 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>
                        {id} {q?.subgroup ? `(Nhóm ${q.subgroup})` : ''}
                      </span>
                      <span className="text-[var(--lb-primary)]">
                        Đáp án: {typeof ans === 'string' ? ans : ans ? 'Đã ghi' : 'Chưa trả lời'}
                      </span>
                    </div>
                    <p className="text-[var(--lb-text)]">{q?.content}</p>
                    <p className="text-[var(--lb-muted)]">
                      <strong>Gợi ý phản hồi:</strong> {fb.primaryGuidance}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
