import React, { useState } from 'react';
import {
  Calendar,
  Award,
  Users,
  TrendingUp,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import {
  type StudentProfileContract,
  type ActionPlanItem,
  type ActionTaskStatus,
  type EvidencePassportItem,
  type EmpathyTriangleSheet,
  type InternalReportContract,
} from '../utils/labanEngine';

interface ActionPlanViewProps {
  profile: StudentProfileContract;
  draftReport: InternalReportContract;
  confirmedReport: InternalReportContract | null;
  onAddActionItem: (item: ActionPlanItem) => void;
  onUpdateActionStatus: (id: string, status: ActionTaskStatus) => void;
  onDeleteActionItem: (id: string) => void;
  onAddEvidencePassport: (item: EvidencePassportItem) => void;
  onDeleteEvidencePassport: (id: string) => void;
  onUpdateEmpathyTriangle: (sheet: EmpathyTriangleSheet) => void;
}

const ALL_STATUSES: ActionTaskStatus[] = [
  'dự thảo',
  'đã chọn',
  'đang làm',
  'đã thử',
  'cần điều chỉnh',
  'bỏ qua',
];

export const ActionPlanView: React.FC<ActionPlanViewProps> = ({
  profile,
  draftReport,
  confirmedReport,
  onAddActionItem,
  onUpdateActionStatus,
  onDeleteActionItem,
  onAddEvidencePassport,
  onDeleteEvidencePassport,
  onUpdateEmpathyTriangle,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'passport' | 'empathy' | 'growth'>('timeline');

  // Form thêm hành động 7-30-90 ngày
  const [newTask, setNewTask] = useState<{
    horizonDays: 7 | 30 | 90;
    task: string;
    evidence: string;
    dueDate: string;
    support: string;
    adjustment: string;
    status: ActionTaskStatus;
  }>({
    horizonDays: 7,
    task: '',
    evidence: '',
    dueDate: '',
    support: '',
    adjustment: '',
    status: 'đã chọn',
  });

  // Form thêm thẻ Hộ chiếu minh chứng
  const [newPassport, setNewPassport] = useState<Omit<EvidencePassportItem, 'id'>>({
    title: '',
    date: new Date().toISOString().slice(0, 10),
    relatedCode: 'N01',
    whatIDid: '',
    conditionsAndSupport: '',
    result: '',
    learned: '',
    nextStep: '',
  });

  // Form Tam giác thấu cảm
  const [triangleForm, setTriangleForm] = useState<EmpathyTriangleSheet>(
    profile.empathyTriangle || {
      studentWants: '',
      familyCares: '',
      verifiedCostAndInfo: '',
      agreedMicroStep: '',
      reviewDate: '',
      safeToShareWithFamily: false,
    }
  );
  const [triangleSavedMsg, setTriangleSavedMsg] = useState<string | null>(null);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.task.trim() || !newTask.evidence.trim()) return;
    onAddActionItem({
      id: `plan-${Date.now()}`,
      horizonDays: newTask.horizonDays,
      task: newTask.task.trim(),
      evidence: newTask.evidence.trim(),
      dueDate: newTask.dueDate ? newTask.dueDate : null,
      support: newTask.support.trim() || 'Tự thực hiện',
      adjustment: newTask.adjustment.trim() || 'Có thể chia nhỏ thành 10 phút',
      status: newTask.status,
    });
    setNewTask({
      horizonDays: 7,
      task: '',
      evidence: '',
      dueDate: '',
      support: '',
      adjustment: '',
      status: 'đã chọn',
    });
  };

  const handleCreatePassport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassport.title.trim() || !newPassport.whatIDid.trim()) return;
    onAddEvidencePassport({
      id: `ev-${Date.now()}`,
      ...newPassport,
    });
    setNewPassport({
      title: '',
      date: new Date().toISOString().slice(0, 10),
      relatedCode: 'N01',
      whatIDid: '',
      conditionsAndSupport: '',
      result: '',
      learned: '',
      nextStep: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-navigation */}
      <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--lb-primary)]">
            05 · Kế hoạch hành động & Minh chứng trải nghiệm
          </span>
          <h1 className="text-xl md:text-2xl font-bold mt-0.5">
            Kế hoạch 7–30–90 ngày · Hộ chiếu minh chứng · Tam giác thấu cảm
          </h1>
          <p className="text-xs text-[var(--lb-muted)] mt-1">
            Một việc có thể hoàn thành trong 5–15 phút cũng là một bước đi có giá trị. Hệ thống không ép hoàn thành, không phạt lùi ngày và không coi trạng thái “bỏ qua” là thất bại.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'timeline' as const, label: 'Kế hoạch 7–30–90 ngày', icon: Calendar },
            { id: 'passport' as const, label: 'Hộ chiếu minh chứng', icon: Award },
            { id: 'empathy' as const, label: 'Tam giác thấu cảm', icon: Users },
            { id: 'growth' as const, label: 'Bản đồ phát triển theo thời gian', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`min-h-[48px] px-4 py-2.5 rounded-xl border font-bold text-xs md:text-sm flex items-center gap-2 transition-colors ${
                  active
                    ? 'bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] border-transparent'
                    : 'bg-[var(--lb-bg)] border-[var(--lb-border)] hover:border-[var(--lb-primary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: TIMELINE KẾ HOẠCH 7–30–90 NGÀY */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          {/* Form thêm việc mới */}
          <form
            onSubmit={handleCreateTask}
            className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-base font-bold">Thêm một bước thử nghiệm mới do em tự chọn</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Khung thời gian (horizonDays):</label>
                <select
                  value={newTask.horizonDays}
                  onChange={(e) =>
                    setNewTask({ ...newTask, horizonDays: Number(e.target.value) as 7 | 30 | 90 })
                  }
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
                >
                  <option value={7}>7 ngày tới (Bước nhỏ 10–15 phút)</option>
                  <option value={30}>30 ngày tới (Trải nghiệm & đối chiếu nguồn)</option>
                  <option value={90}>90 ngày tới (Tổng hợp & xem lại lộ trình)</option>
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Trạng thái ban đầu:</label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value as ActionTaskStatus })}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold block mb-1">Ngày tự xem lại (Không bắt buộc):</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Hành động cụ thể em chọn (task) *:</label>
                <input
                  type="text"
                  required
                  value={newTask.task}
                  onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                  placeholder="Ví dụ: Làm bài thử N01 trên giấy trong 15 phút..."
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Sản phẩm / Minh chứng quan sát được (evidence) *:</label>
                <input
                  type="text"
                  required
                  value={newTask.evidence}
                  onChange={(e) => setNewTask({ ...newTask, evidence: e.target.value })}
                  placeholder="Ví dụ: 1 tờ giấy A4 ghi 2 nhận xét và 1 câu hỏi..."
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Nguồn hỗ trợ (support):</label>
                <input
                  type="text"
                  value={newTask.support}
                  onChange={(e) => setNewTask({ ...newTask, support: e.target.value })}
                  placeholder="Ví dụ: Tổ tư vấn học đường / Bạn cùng nhóm..."
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Cách điều chỉnh khi bận / thiếu nguồn lực (adjustment):</label>
                <input
                  type="text"
                  value={newTask.adjustment}
                  onChange={(e) => setNewTask({ ...newTask, adjustment: e.target.value })}
                  placeholder="Ví dụ: Thu nhỏ thành 10 phút hoặc dời sang cuối tuần..."
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] font-bold text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm vào Kế hoạch 7–30–90 ngày</span>
            </button>
          </form>

          {/* 3 Mốc 7 / 30 / 90 ngày */}
          {([7, 30, 90] as const).map((horizon) => {
            const items = (profile.actionPlan || []).filter((p) => p.horizonDays === horizon);
            return (
              <div
                key={horizon}
                className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[var(--lb-border)] pb-2">
                  <h3 className="text-base font-bold">
                    Mốc {horizon} ngày ({items.length} mục)
                  </h3>
                  <span className="text-xs text-[var(--lb-muted)]">
                    horizonDays: {horizon}
                  </span>
                </div>

                {items.length === 0 ? (
                  <p className="text-xs text-[var(--lb-muted)]">
                    Chưa có mục nào ở mốc {horizon} ngày. Em có thể thêm một bước nhỏ ở khung trên.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-2.5 text-xs"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="text-sm font-bold">{item.task}</div>
                          <button
                            type="button"
                            onClick={() => onDeleteActionItem(item.id)}
                            aria-label="Xóa mục kế hoạch"
                            className="p-1.5 rounded-lg border border-[var(--lb-border)] text-[var(--lb-muted)] hover:text-[#B42318]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[var(--lb-muted)]">
                          <div>
                            <strong>Minh chứng:</strong> {item.evidence}
                          </div>
                          <div>
                            <strong>Hỗ trợ:</strong> {item.support}
                          </div>
                          <div>
                            <strong>Cách điều chỉnh:</strong> {item.adjustment}{' '}
                            {item.dueDate ? `· Hạn tự xem: ${item.dueDate}` : ''}
                          </div>
                        </div>

                        {/* Chọn trạng thái 6 mức chuẩn */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="font-semibold mr-1">Trạng thái:</span>
                          {ALL_STATUSES.map((st) => {
                            const active = item.status === st;
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => onUpdateActionStatus(item.id, st)}
                                className={`min-h-[36px] px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                                  active
                                    ? 'bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] border-transparent'
                                    : 'bg-[var(--lb-card)] border-[var(--lb-border)]'
                                }`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: HỘ CHIẾU MINH CHỨNG — "NHỮNG ĐIỀU EM ĐÃ THỬ" (Mục 3.2) */}
      {activeSubTab === 'passport' && (
        <div className="space-y-6">
          <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold">Hộ chiếu minh chứng — “Những điều em đã thử”</h2>
              <p className="text-xs text-[var(--lb-muted)] mt-0.5">
                Ghi nhận các sản phẩm trên giấy hoặc hoạt động em đã thử (liên kết mã N/C). Không yêu cầu ảnh khuôn mặt, giấy tờ hay tên người khác. Không suy diễn năng lực từ số lượng thẻ.
              </p>
            </div>

            <form onSubmit={handleCreatePassport} className="space-y-3 pt-2 border-t border-[var(--lb-border)] text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={newPassport.title}
                  onChange={(e) => setNewPassport({ ...newPassport, title: e.target.value })}
                  placeholder="Tiêu đề trải nghiệm / sản phẩm *"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
                />
                <input
                  type="date"
                  value={newPassport.date}
                  onChange={(e) => setNewPassport({ ...newPassport, date: e.target.value })}
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
                />
                <input
                  type="text"
                  value={newPassport.relatedCode}
                  onChange={(e) => setNewPassport({ ...newPassport, relatedCode: e.target.value })}
                  placeholder="Mã liên quan (VD: N01, N04, C_TH)"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={newPassport.whatIDid}
                  onChange={(e) => setNewPassport({ ...newPassport, whatIDid: e.target.value })}
                  placeholder="Em đã làm gì cụ thể? *"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
                />
                <input
                  type="text"
                  value={newPassport.conditionsAndSupport}
                  onChange={(e) => setNewPassport({ ...newPassport, conditionsAndSupport: e.target.value })}
                  placeholder="Điều kiện thực hiện và mức hỗ trợ"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
                />
                <input
                  type="text"
                  value={newPassport.result}
                  onChange={(e) => setNewPassport({ ...newPassport, result: e.target.value })}
                  placeholder="Kết quả / Sản phẩm thu được"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
                />
                <input
                  type="text"
                  value={newPassport.learned}
                  onChange={(e) => setNewPassport({ ...newPassport, learned: e.target.value })}
                  placeholder="Điều em học được về bản thân hoặc nhiệm vụ"
                  className="min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
                />
              </div>
              <input
                type="text"
                value={newPassport.nextStep}
                onChange={(e) => setNewPassport({ ...newPassport, nextStep: e.target.value })}
                placeholder="Bước thử tiếp theo (nếu em muốn)"
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
              />
              <button
                type="submit"
                className="min-h-[48px] px-5 py-2 rounded-xl bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] font-bold text-xs flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Lưu thẻ Hộ chiếu minh chứng</span>
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(profile.evidencePassport || []).map((ev) => (
              <div
                key={ev.id}
                className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-5 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-[#006B60]/10 text-[var(--lb-primary)] font-bold">
                      {ev.relatedCode} · {ev.date}
                    </span>
                    <h3 className="text-base font-bold mt-1">{ev.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteEvidencePassport(ev.id)}
                    aria-label="Xóa thẻ minh chứng"
                    className="p-1.5 rounded-lg border border-[var(--lb-border)] text-[var(--lb-muted)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p>
                  <strong>Em đã làm:</strong> {ev.whatIDid}
                </p>
                <p>
                  <strong>Điều kiện & Hỗ trợ:</strong> {ev.conditionsAndSupport || 'Tự thực hiện'}
                </p>
                <p>
                  <strong>Kết quả:</strong> {ev.result || 'Đã hoàn thành bản nháp'}
                </p>
                <p>
                  <strong>Điều học được:</strong> {ev.learned || 'Chưa ghi'}
                </p>
                <p className="text-[var(--lb-primary)] font-semibold">
                  <strong>Bước thử tiếp:</strong> {ev.nextStep || 'Tự chọn sau'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TAM GIÁC THẤU CẢM (Mục 3.4) */}
      {activeSubTab === 'empathy' && (
        <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold">Tam giác thấu cảm (Học sinh — Người chăm sóc — Người tư vấn)</h2>
            <p className="text-xs text-[var(--lb-muted)] mt-0.5">
              Bản phiếu tùy chọn dành cho cuộc trao đổi an toàn: Đích đến là thống nhất <strong>một bước khám phá nhỏ tiếp theo</strong>, không ép phải thống nhất nghề ngay. Ứng dụng không tự động chia sẻ kết quả và không mời gia đình nếu em thấy chưa an toàn.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold block mb-1">1. Điều em đang mong muốn thử hoặc tìm hiểu:</label>
              <textarea
                rows={2}
                value={triangleForm.studentWants}
                onChange={(e) => setTriangleForm({ ...triangleForm, studentWants: e.target.value })}
                className="w-full p-3 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">2. Điều gia đình / người chăm sóc đang quan tâm hoặc lo lắng:</label>
              <textarea
                rows={2}
                value={triangleForm.familyCares}
                onChange={(e) => setTriangleForm({ ...triangleForm, familyCares: e.target.value })}
                className="w-full p-3 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">3. Thông tin và chi phí đã kiểm chứng (liên kết N02 / F03):</label>
              <textarea
                rows={2}
                value={triangleForm.verifiedCostAndInfo}
                onChange={(e) => setTriangleForm({ ...triangleForm, verifiedCostAndInfo: e.target.value })}
                className="w-full p-3 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-bold block mb-1">4. Bước thử nhỏ cả ba bên cùng đồng ý thực hiện:</label>
                <input
                  type="text"
                  value={triangleForm.agreedMicroStep}
                  onChange={(e) => setTriangleForm({ ...triangleForm, agreedMicroStep: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">5. Ngày hẹn cùng xem lại kết quả thử nghiệm:</label>
                <input
                  type="date"
                  value={triangleForm.reviewDate}
                  onChange={(e) => setTriangleForm({ ...triangleForm, reviewDate: e.target.value })}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={triangleForm.safeToShareWithFamily}
                onChange={(e) =>
                  setTriangleForm({ ...triangleForm, safeToShareWithFamily: e.target.checked })
                }
                className="w-4 h-4 accent-[#006B60]"
              />
              <span>
                Em xác nhận bối cảnh trao đổi an toàn và em chủ động quyết định phần nội dung chia sẻ này.
              </span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateEmpathyTriangle(triangleForm);
                  setTriangleSavedMsg('Đã lưu phiếu Tam giác thấu cảm trên thiết bị cục bộ.');
                }}
                className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] font-bold text-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Lưu phiếu Tam giác thấu cảm</span>
              </button>
              {triangleSavedMsg && (
                <span className="text-xs font-semibold text-[var(--lb-primary)]">{triangleSavedMsg}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BẢN ĐỒ PHÁT TRIỂN THEO THỜI GIAN (Mục 3.5) */}
      {activeSubTab === 'growth' && (
        <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold">Bản đồ phát triển theo thời gian (Cùng phiên bản 2.0 · Quy tắc 2.0.1)</h2>
            <p className="text-xs text-[var(--lb-muted)] mt-0.5">
              So sánh cùng chỉ báo và số câu hợp lệ giữa các bản chụp của riêng em. Không cần điểm tăng mới là tiến bộ — việc hiểu rõ hơn mình không thích điều gì cũng là một bước trưởng thành. Tuyệt đối không so sánh giữa các học sinh và không nối đồ thị nếu khác phiên bản câu hỏi.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--lb-border)] text-[var(--lb-muted)]">
                  <th className="py-2 pr-3">Chỉ báo (Phiếu 2.0)</th>
                  <th className="py-2 px-3">
                    Bản đã xác nhận ({confirmedReport ? confirmedReport.reportVersion : 'Chưa chốt'})
                  </th>
                  <th className="py-2 pl-3">Bản hiện tại ({draftReport.reportVersion})</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(draftReport.groupResults).map(([key, curVal]) => {
                  const prevVal = confirmedReport?.groupResults[key];
                  return (
                    <tr key={key} className="border-b border-[var(--lb-border)]/60">
                      <td className="py-2 pr-3 font-bold">{key}</td>
                      <td className="py-2 px-3 tabular-nums">
                        {prevVal ? prevVal.statusText : 'Chưa có bản chốt trước'}
                      </td>
                      <td className="py-2 pl-3 font-semibold tabular-nums text-[var(--lb-primary)]">
                        {curVal.statusText}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
