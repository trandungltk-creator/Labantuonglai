import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Calendar,
  HeartHandshake,
  ShieldCheck,
  Sun,
  BookOpen,
  Wrench,
} from 'lucide-react';
import {
  LA_BAN_14_ACTIVITIES,
  type StudentProfileContract,
  type ModuleId,
  type MeaningfulDayEntry,
} from '../utils/labanEngine';

interface HomeTodayViewProps {
  profile: StudentProfileContract;
  totalAnsweredPersonal: number;
  onNavigateTab: (tab: 'today' | 'explore' | 'profile' | 'plan' | 'me' | 'support') => void;
  onOpenModule: (moduleId: ModuleId, initialQuestionId?: string) => void;
  onToggleLaBan14Task: (taskId: number) => void;
  onAddMeaningfulDay: (entry: MeaningfulDayEntry) => void;
}

export const HomeTodayView: React.FC<HomeTodayViewProps> = ({
  profile,
  totalAnsweredPersonal,
  onNavigateTab,
  onOpenModule,
  onToggleLaBan14Task,
  onAddMeaningfulDay,
}) => {
  const completedIds = profile.laBan14CompletedIds || [];
  const [activeTaskIndex, setActiveTaskIndex] = useState<number>(() => {
    const firstPendingIdx = LA_BAN_14_ACTIVITIES.findIndex((a) => !completedIds.includes(a.id));
    return firstPendingIdx >= 0 ? firstPendingIdx : 0;
  });

  const [meaningfulPrompt, setMeaningfulPrompt] = useState<'A05' | 'A08' | 'O01'>('A05');
  const [meaningfulText, setMeaningfulText] = useState('');
  const [keepMeaningfulOnPaper, setKeepMeaningfulOnPaper] = useState(false);
  const [meaningfulStatus, setMeaningfulStatus] = useState<string | null>(null);

  const currentActivity = LA_BAN_14_ACTIVITIES[activeTaskIndex] || LA_BAN_14_ACTIVITIES[0];
  const isCurrentCompleted = completedIds.includes(currentActivity.id);

  const activePlanTask =
    (profile.actionPlan || []).find((p) => p.status === 'đang làm' || p.status === 'đã chọn') ||
    (profile.actionPlan || [])[0] ||
    null;

  // Xác định trạng thái hồ sơ hiện tại (Không dùng phần trăm độ hoàn thiện con người)
  const profileStatusText =
    totalAnsweredPersonal === 0
      ? 'Mới bắt đầu — Em có thể chọn bất kỳ mục nào để thử'
      : totalAnsweredPersonal < 30
      ? `Đang làm (${totalAnsweredPersonal}/194 mục cá nhân đã ghi nhận, kể cả U/X)`
      : `Đã có dữ liệu cho báo cáo ảnh chụp hiện tại (${totalAnsweredPersonal}/194 mục cá nhân)`;

  const handleSaveMeaningfulDay = () => {
    if (keepMeaningfulOnPaper) {
      setMeaningfulText('');
      setMeaningfulStatus('Đã ghi nhận lựa chọn viết trên giấy của em (ứng dụng không lưu nội dung).');
      return;
    }
    if (!meaningfulText.trim()) {
      setMeaningfulStatus('Em có thể viết một vài từ hoặc chọn “Giữ riêng trên giấy”.');
      return;
    }
    onAddMeaningfulDay({
      id: `md-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      promptId: meaningfulPrompt,
      reflection: meaningfulText.trim(),
      keepOnPaper: false,
    });
    setMeaningfulText('');
    setMeaningfulStatus('Đã lưu khoảnh khắc đáng nhớ vào thiết bị cục bộ của em.');
  };

  return (
    <div className="space-y-6">
      {/* Lời chào & Trạng thái không phán xét */}
      <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--lb-primary)]">
              01 · Hôm nay {profile.grade ? `· Khối ${profile.grade}` : ''}
            </span>
            <h1 className="text-xl md:text-2xl font-bold mt-0.5">
              Chào em, hôm nay em muốn khám phá điều gì?
            </h1>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] text-xs font-medium text-[var(--lb-muted)]">
            {profileStatusText}
          </div>
        </div>
        <p className="text-sm text-[var(--lb-muted)]">
          Em không cần làm hết 206 mục trong một lần. Mỗi bước trả lời, một bài thử trên giấy hay cả lựa chọn <strong>U (Chưa rõ)</strong>, <strong>X (Giữ riêng)</strong> đều được tôn trọng.
        </p>
      </div>

      {/* Khung LA BÀN 14 · Hành trình tự chọn (Wireframe chuẩn Mục 2.01 & 3.1) */}
      <div className="bg-[var(--lb-card)] border-2 border-[var(--lb-primary)] rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[var(--lb-primary)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--lb-primary)]">
                LA BÀN 14 · Hành trình tự chọn (7 hoạt động)
              </span>
            </div>
            <p className="text-sm text-[var(--lb-muted)] mt-1">
              Một bước nhỏ cũng là một trải nghiệm. Mỗi hoạt động chỉ 5–10 phút tự vấn hoặc thử trên giấy.
            </p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] text-xs font-bold tabular-nums">
            {completedIds.length}/7 nhiệm vụ đã hoàn thành (không xếp hạng)
          </div>
        </div>

        {/* Chi tiết hoạt động đang chọn */}
        <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#006B60]/10 dark:bg-[#78D9C7]/15 text-[var(--lb-primary)]">
              Hoạt động #{currentActivity.id} · {currentActivity.dayRange}
            </span>
            <span className="text-xs text-[var(--lb-muted)]">
              Liên kết mã: <strong>{currentActivity.linkedCodes.join(', ')}</strong>
            </span>
          </div>
          <h2 className="text-base md:text-lg font-bold">{currentActivity.title}</h2>
          <p className="text-sm text-[var(--lb-text)]">{currentActivity.promptQuestion}</p>
          <p className="text-xs text-[var(--lb-muted)]">
            <strong>Sản phẩm tự nguyện:</strong> {currentActivity.voluntaryProduct}
          </p>
        </div>

        {/* Nút Tiếp tục / Đổi nhiệm vụ / Đánh dấu */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenModule(currentActivity.targetModule, currentActivity.linkedCodes[0])}
            className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] font-bold text-sm flex items-center gap-2 hover:opacity-95"
          >
            <span>Tiếp tục ({currentActivity.linkedCodes[0]})</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTaskIndex((prev) => (prev + 1) % LA_BAN_14_ACTIVITIES.length)}
            className="min-h-[48px] px-4 py-2.5 rounded-xl border border-[var(--lb-border)] bg-[var(--lb-bg)] font-semibold text-sm flex items-center gap-2 hover:border-[var(--lb-primary)]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Đổi nhiệm vụ</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleLaBan14Task(currentActivity.id)}
            className={`min-h-[48px] px-4 py-2.5 rounded-xl border font-semibold text-sm flex items-center gap-2 ${
              isCurrentCompleted
                ? 'border-[var(--lb-primary)] bg-[#006B60]/10 text-[var(--lb-primary)]'
                : 'border-[var(--lb-border)] text-[var(--lb-muted)] hover:border-[var(--lb-primary)]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isCurrentCompleted ? 'Đã đánh dấu trải nghiệm' : 'Đánh dấu đã thử'}</span>
          </button>
        </div>

        {/* Danh sách 7 nút chọn nhanh nhiệm vụ La bàn 14 */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--lb-border)]">
          {LA_BAN_14_ACTIVITIES.map((act, idx) => {
            const done = completedIds.includes(act.id);
            const active = idx === activeTaskIndex;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => setActiveTaskIndex(idx)}
                className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                  active
                    ? 'bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] border-transparent'
                    : done
                    ? 'bg-[#006B60]/10 border-[var(--lb-primary)] text-[var(--lb-primary)]'
                    : 'bg-[var(--lb-bg)] border-[var(--lb-border)] text-[var(--lb-muted)]'
                }`}
              >
                {act.dayRange} {done ? '✓' : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Lối tắt chính: [Hiểu mình] [Khám phá nghề] [Thử một nhiệm vụ] */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onOpenModule('A', 'A01')}
          className="min-h-[48px] text-left bg-[var(--lb-card)] border border-[var(--lb-border)] hover:border-[var(--lb-primary)] rounded-2xl p-5 space-y-2 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[#006B60]/10 dark:bg-[#78D9C7]/15 text-[var(--lb-primary)] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="font-bold text-base">Hiểu mình (A · H · I)</div>
          <p className="text-xs text-[var(--lb-muted)]">
            Điểm mạnh kèm ví dụ, điều có ý nghĩa và tự nhận thức nội tại — bên ngoài.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onOpenModule('B', 'B01')}
          className="min-h-[48px] text-left bg-[var(--lb-card)] border border-[var(--lb-border)] hover:border-[var(--lb-primary)] rounded-2xl p-5 space-y-2 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[#245B91]/10 text-[var(--lb-info)] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="font-bold text-base">Khám phá nghề (B · D · E · K)</div>
          <p className="text-xs text-[var(--lb-muted)]">
            Sở thích RIASEC, giá trị ưu tiên và tình huống kiểm chứng thông tin nghề.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onOpenModule('N', 'N01')}
          className="min-h-[48px] text-left bg-[var(--lb-card)] border border-[var(--lb-border)] hover:border-[var(--lb-primary)] rounded-2xl p-5 space-y-2 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-[#8A5A16]/10 text-[var(--lb-warn)] flex items-center justify-center">
            <Wrench className="w-5 h-5" />
          </div>
          <div className="font-bold text-base">Thử một nhiệm vụ (N · G · L)</div>
          <p className="text-xs text-[var(--lb-muted)]">
            Phòng thử nghề chi phí thấp trên giấy (N01–N08) kèm gợi ý thực hành Tây Nguyên.
          </p>
        </button>
      </div>

      {/* Việc em đã chọn & Xem kế hoạch */}
      <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--lb-primary)]">
            <Calendar className="w-4 h-4" />
            <span>Việc em đã chọn trong Kế hoạch 7–30–90 ngày</span>
          </div>
          {activePlanTask ? (
            <div>
              <p className="text-sm font-semibold">
                [{activePlanTask.horizonDays} ngày · {activePlanTask.status}] {activePlanTask.task}
              </p>
              <p className="text-xs text-[var(--lb-muted)]">
                Minh chứng: {activePlanTask.evidence} {activePlanTask.dueDate ? `· Hạn tự xem: ${activePlanTask.dueDate}` : ''}
              </p>
            </div>
          ) : (
            <p className="text-sm text-[var(--lb-muted)]">
              Em chưa chọn việc trong kế hoạch. Một việc nhỏ hoàn thành trong 5–15 phút cũng rất có giá trị.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('plan')}
          className="min-h-[48px] px-4 py-2.5 rounded-xl border border-[var(--lb-primary)] text-[var(--lb-primary)] font-bold text-sm shrink-0 hover:bg-[#006B60]/5"
        >
          Xem kế hoạch
        </button>
      </div>

      {/* MỘT NGÀY SỐNG CÓ Ý NGHĨA (Mục 3.3 của tài liệu 02) */}
      <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#006B60]/10 dark:bg-[#78D9C7]/15 text-[var(--lb-primary)] flex items-center justify-center shrink-0">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold">Một ngày sống có ý nghĩa (Tự nguyện · Không tính điểm)</h2>
            <p className="text-xs text-[var(--lb-muted)] mt-0.5">
              Liên kết từ A05/A08 và I/O: “Hôm nay điều gì đáng nhớ với em?” — Có thể là nghỉ ngơi đúng lúc, giúp một người bạn, hoàn thành việc nhỏ hoặc học điều mới. Không ép tích cực, không lưu nếu em không muốn.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'A05' as const, label: 'A05 · Điều quan trọng ngoài điểm số' },
            { id: 'A08' as const, label: 'A08 · Khoảnh khắc sống có ý nghĩa hôm nay' },
            { id: 'O01' as const, label: 'O01 · Việc nhỏ em đã thử hoặc nghỉ ngơi' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setMeaningfulPrompt(p.id)}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                meaningfulPrompt === p.id
                  ? 'bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] border-transparent'
                  : 'bg-[var(--lb-bg)] border-[var(--lb-border)] text-[var(--lb-muted)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={keepMeaningfulOnPaper}
              onChange={(e) => setKeepMeaningfulOnPaper(e.target.checked)}
              className="w-4 h-4 accent-[#006B60]"
            />
            <span>Em chọn viết trên sổ tay giấy (không lưu nội dung vào thiết bị)</span>
          </label>

          {!keepMeaningfulOnPaper && (
            <textarea
              value={meaningfulText}
              onChange={(e) => setMeaningfulText(e.target.value)}
              rows={2}
              placeholder="Ghi ngắn gọn điều đáng nhớ hôm nay của em (hoặc để trống nếu không muốn lưu)..."
              className="w-full rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] p-3 text-sm focus:outline-none focus:border-[var(--lb-primary)]"
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSaveMeaningfulDay}
              className="min-h-[48px] px-4 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-primary)] text-[var(--lb-primary)] font-bold text-sm hover:bg-[#006B60]/5"
            >
              {keepMeaningfulOnPaper ? 'Xác nhận đã tự viết trên giấy' : 'Lưu vào góc riêng trên thiết bị'}
            </button>
            {meaningfulStatus && (
              <span className="text-xs text-[var(--lb-primary)] font-medium">{meaningfulStatus}</span>
            )}
          </div>
        </div>
      </div>

      {/* Hai nút cuối trang Hôm nay theo wireframe: [Em cần hỗ trợ] [Quyền riêng tư] */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => onNavigateTab('support')}
          className="min-h-[48px] px-5 py-2.5 rounded-xl border border-[#B42318] text-[#B42318] dark:border-[#F28B82] dark:text-[#F28B82] font-bold text-sm flex items-center gap-2 hover:bg-[#B42318]/5"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Em cần hỗ trợ (111 / 115 / 113)</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('me')}
          className="min-h-[48px] px-5 py-2.5 rounded-xl border border-[var(--lb-border)] bg-[var(--lb-card)] text-[var(--lb-text)] font-semibold text-sm flex items-center gap-2 hover:border-[var(--lb-primary)]"
        >
          <ShieldCheck className="w-4 h-4 text-[var(--lb-primary)]" />
          <span>Quyền riêng tư & Quản lý dữ liệu</span>
        </button>
      </div>
    </div>
  );
};
