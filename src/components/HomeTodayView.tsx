import React, { useState, useMemo } from 'react';
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
  Layers,
  UserCheck,
} from 'lucide-react';
import {
  QUESTIONS_DB,
  LA_BAN_14_ACTIVITIES,
  type StudentProfileContract,
  type ModuleId,
  type MeaningfulDayEntry,
  type PairedObservationAnswer,
  type PracticeRubricAnswer,
  type PrivateReflectionAnswer,
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

  // Thống kê số mục đã ghi nhận theo 3 tầng dữ liệu độc lập
  const layerStats = useMemo(() => {
    const countModules = (mods: ModuleId[]) => {
      let answered = 0;
      let total = 0;
      for (const q of QUESTIONS_DB.questions) {
        if (!mods.includes(q.module)) continue;
        total += 1;
        const a = profile.answers[q.id];
        if (a !== null && a !== undefined) {
          if (typeof a === 'string' && a !== '') answered += 1;
          else if (Array.isArray(a) && a.length > 0) answered += 1;
          else if (typeof a === 'object' && !Array.isArray(a)) {
            if (
              q.type === 'paired_observation' &&
              ((a as PairedObservationAnswer).self || (a as PairedObservationAnswer).observer)
            ) {
              answered += 1;
            } else if (q.type === 'practice_rubric' && (a as PracticeRubricAnswer).score) {
              answered += 1;
            } else if (
              q.type === 'private_reflection' &&
              ((a as PrivateReflectionAnswer).shareConsent ||
                (a as PrivateReflectionAnswer).keepOnPaperOnly)
            ) {
              answered += 1;
            }
          }
        }
      }
      return { answered, total };
    };

    return {
      layer1: countModules(['A', 'B', 'C', 'D', 'H', 'I']),
      layer2: countModules(['N', 'J', 'E', 'K']),
      layer3: countModules(['F', 'G', 'L', 'O']),
    };
  }, [profile.answers]);

  const activePlanTasks = useMemo(() => {
    const list = profile.actionPlan || [];
    const prioritized = list.filter((p) => p.status === 'đang làm' || p.status === 'đã chọn');
    return (prioritized.length > 0 ? prioritized : list).slice(0, 2);
  }, [profile.actionPlan]);

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
      {/* HERO SPLIT: LỜI CHÀO ĐỊNH HƯỚNG + BẢN ĐỒ 3 TẦNG DỮ LIỆU ĐỘC LẬP */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* Cột trái: Lời chào & Thao tác nhanh (7 cols) */}
        <div className="xl:col-span-7 bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--lb-muted)]">
              <span className="font-bold text-[var(--lb-primary)]">01. Không gian Hôm nay</span>
              {profile.grade && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Khối {profile.grade}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{profileStatusText}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--lb-text)]">
              Chào em, hôm nay em muốn khám phá bước nhỏ nào?
            </h1>

            <p className="text-sm text-[var(--lb-muted)] leading-relaxed">
              Em không cần hoàn thành cả 206 mục trong một lần. Mỗi câu trả lời tự vấn, một bài thử trên giấy A4 hay cả quyền chọn <strong>U (Chưa rõ)</strong> và <strong>X (Giữ riêng)</strong> đều giúp bức tranh tự hiểu mình rõ nét hơn.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab('explore')}
              className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[var(--lb-primary)] text-white dark:text-[#0B1514] font-bold text-sm flex items-center gap-2 whitespace-nowrap shrink-0 hover:opacity-95 lb-transition"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Mở Khám phá 206 mục</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('profile')}
              className="min-h-[46px] px-4 py-2.5 rounded-xl border border-[var(--lb-border-strong)] bg-[var(--lb-bg)] text-[var(--lb-text)] font-bold text-sm flex items-center gap-2 whitespace-nowrap shrink-0 hover:border-[var(--lb-primary)] lb-transition"
            >
              <UserCheck className="w-4 h-4 text-[var(--lb-primary)] shrink-0" />
              <span>Xem Hồ sơ & Bản đồ lựa chọn</span>
            </button>
          </div>
        </div>

        {/* Cột phải: Kiến trúc 3 tầng dữ liệu độc lập (5 cols) */}
        <div className="xl:col-span-5 bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--lb-border)] pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--lb-primary)]" />
              <h2 className="text-sm font-bold">Ba tầng dữ liệu đối chiếu độc lập</h2>
            </div>
            <span className="text-xs font-semibold text-[var(--lb-muted)] tabular-nums">
              Tổng {totalAnsweredPersonal}/194 mục
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Tầng 1 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--lb-text)]">
                  Tầng 1 · Lời tự mô tả (A · B · C · D · H · I)
                </span>
                <span className="font-bold tabular-nums text-[var(--lb-primary)]">
                  {layerStats.layer1.answered}/{layerStats.layer1.total} mục
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--lb-surface-subtle)] overflow-hidden">
                <div
                  className="h-full bg-[var(--lb-primary)]"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((layerStats.layer1.answered / layerStats.layer1.total) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Tầng 2 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--lb-text)]">
                  Tầng 2 · Minh chứng & Tình huống (N · J · E · K)
                </span>
                <span className="font-bold tabular-nums text-[var(--lb-info)]">
                  {layerStats.layer2.answered}/{layerStats.layer2.total} mục
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--lb-surface-subtle)] overflow-hidden">
                <div
                  className="h-full bg-[var(--lb-info)]"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((layerStats.layer2.answered / layerStats.layer2.total) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Tầng 3 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--lb-text)]">
                  Tầng 3 · Bối cảnh & Hành vi 30 ngày (F · G · L · O)
                </span>
                <span className="font-bold tabular-nums text-[var(--lb-warn)]">
                  {layerStats.layer3.answered}/{layerStats.layer3.total} mục
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--lb-surface-subtle)] overflow-hidden">
                <div
                  className="h-full bg-[var(--lb-warn)]"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((layerStats.layer3.answered / layerStats.layer3.total) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[var(--lb-muted)] pt-1 border-t border-[var(--lb-border)]">
            Khi các tầng dữ liệu khác biệt nhau, hệ thống cùng em đặt câu hỏi đối thoại và thiết kế bước thử nhỏ 7 ngày để kiểm chứng.
          </p>
        </div>
      </div>

      {/* KHUNG LA BÀN 14 · HÀNH TRÌNH TỰ CHỌN 7 HOẠT ĐỘNG */}
      <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--lb-border)] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--lb-primary)]">
              <Compass className="w-4 h-4 shrink-0" />
              <span>LA BÀN 14 · HÀNH TRÌNH TỰ CHỌN (7 HOẠT ĐỘNG NHỎ)</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--lb-muted)]">
              Mỗi hoạt động chỉ cần 5–10 phút suy ngẫm hoặc phác thảo trên giấy. Không chấm điểm thắng thua, không xếp hạng.
            </p>
          </div>
          <div className="text-xs font-bold text-[var(--lb-text)] tabular-nums">
            Đã trải nghiệm: <span className="text-[var(--lb-primary)]">{completedIds.length} / 7</span> nhiệm vụ
          </div>
        </div>

        {/* Thanh chọn 7 chặng La Bàn 14 */}
        <div className="flex flex-wrap gap-2">
          {LA_BAN_14_ACTIVITIES.map((act, idx) => {
            const done = completedIds.includes(act.id);
            const active = idx === activeTaskIndex;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => setActiveTaskIndex(idx)}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold border whitespace-nowrap shrink-0 lb-transition ${
                  active
                    ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] border-transparent'
                    : done
                    ? 'bg-[var(--lb-primary-soft)] border-[var(--lb-primary)]/40 text-[var(--lb-primary)]'
                    : 'bg-[var(--lb-bg)] border-[var(--lb-border)] text-[var(--lb-muted)] hover:text-[var(--lb-text)]'
                }`}
              >
                <span>{act.dayRange}</span>
                {done && <span className="ml-1.5">✓</span>}
              </button>
            );
          })}
        </div>

        {/* Chi tiết nhiệm vụ đang chọn (2 cột cân đối) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch p-5 rounded-2xl bg-[var(--lb-bg)] border border-[var(--lb-border)]">
          <div className="lg:col-span-8 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-[var(--lb-muted)] flex-wrap">
              <span className="font-bold text-[var(--lb-primary)]">
                Hoạt động #{currentActivity.id} · {currentActivity.dayRange}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Mã câu liên kết: <strong className="text-[var(--lb-text)]">{currentActivity.linkedCodes.join(', ')}</strong>
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-[var(--lb-text)]">
              {currentActivity.title}
            </h2>

            <p className="text-sm text-[var(--lb-text)] leading-relaxed">
              {currentActivity.promptQuestion}
            </p>

            <p className="text-xs text-[var(--lb-muted)] pt-1">
              <strong className="text-[var(--lb-text)]">Sản phẩm tự nguyện gợi ý:</strong>{' '}
              {currentActivity.voluntaryProduct}
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-center gap-2.5 lg:border-l lg:border-[var(--lb-border)] lg:pl-4">
            <button
              type="button"
              onClick={() => onOpenModule(currentActivity.targetModule, currentActivity.linkedCodes[0])}
              className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[var(--lb-primary)] text-white dark:text-[#0B1514] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap shrink-0 hover:opacity-95 lb-transition"
            >
              <span>Tiếp tục ({currentActivity.linkedCodes[0]})</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onToggleLaBan14Task(currentActivity.id)}
                className={`min-h-[44px] px-3 py-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 lb-transition ${
                  isCurrentCompleted
                    ? 'border-[var(--lb-primary)] bg-[var(--lb-primary-soft)] text-[var(--lb-primary)]'
                    : 'border-[var(--lb-border)] bg-[var(--lb-card)] text-[var(--lb-text)] hover:border-[var(--lb-primary)]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{isCurrentCompleted ? 'Đã thử' : 'Đánh dấu'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTaskIndex((prev) => (prev + 1) % LA_BAN_14_ACTIVITIES.length)}
                className="min-h-[44px] px-3 py-2 rounded-xl border border-[var(--lb-border)] bg-[var(--lb-card)] font-bold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 hover:border-[var(--lb-primary)] lb-transition"
              >
                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                <span>Đổi nhiệm vụ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3 LỐI TẮT CHỦ ĐỀ KHÁM PHÁ CHÍNH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onOpenModule('A', 'A01')}
          className="text-left bg-[var(--lb-card)] border border-[var(--lb-border)] hover:border-[var(--lb-primary)] rounded-2xl p-5 flex flex-col justify-between space-y-4 lb-transition group"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[var(--lb-primary-soft)] text-[var(--lb-primary)] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[var(--lb-primary)] group-hover:translate-x-0.5 lb-transition">
                Mở phân hệ A →
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--lb-text)]">01. Hiểu mình (A · H · I)</h3>
              <p className="text-xs text-[var(--lb-muted)] mt-1 leading-relaxed">
                Nhận diện điểm mạnh có ví dụ thực tế, ý nghĩa học tập và tự nhận thức 2 trục nội tại — bên ngoài.
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-[var(--lb-border)] text-[11px] text-[var(--lb-muted)] flex items-center justify-between">
            <span>44 mục tự khảo sát</span>
            <span className="font-semibold text-[var(--lb-text)]">A01–A12 · H01–H16 · I01–I16</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onOpenModule('B', 'B01')}
          className="text-left bg-[var(--lb-card)] border border-[var(--lb-border)] hover:border-[var(--lb-info)] rounded-2xl p-5 flex flex-col justify-between space-y-4 lb-transition group"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[var(--lb-info-soft)] text-[var(--lb-info)] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[var(--lb-info)] group-hover:translate-x-0.5 lb-transition">
                Mở phân hệ B →
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--lb-text)]">02. Khám phá nghề (B · D · E · K)</h3>
              <p className="text-xs text-[var(--lb-muted)] mt-1 leading-relaxed">
                Sở thích nghề nghiệp RIASEC, 3 giá trị sống ưu tiên và các tình huống kiểm chứng thông tin nghề.
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-[var(--lb-border)] text-[11px] text-[var(--lb-muted)] flex items-center justify-between">
            <span>70 mục khảo sát</span>
            <span className="font-semibold text-[var(--lb-text)]">B01–B36 · D01–D10 · E · K</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onOpenModule('N', 'N01')}
          className="text-left bg-[var(--lb-card)] border border-[var(--lb-border)] hover:border-[var(--lb-warn)] rounded-2xl p-5 flex flex-col justify-between space-y-4 lb-transition group"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[var(--lb-warn-soft)] text-[var(--lb-warn)] flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[var(--lb-warn)] group-hover:translate-x-0.5 lb-transition">
                Mở Phòng thử nghề N →
              </span>
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--lb-text)]">03. Thử một nhiệm vụ (N · G · L)</h3>
              <p className="text-xs text-[var(--lb-muted)] mt-1 leading-relaxed">
                8 bài thử nghề chi phí thấp trên giấy A4 kèm gợi ý bối cảnh Tây Nguyên và nhật ký hành vi 30 ngày.
              </p>
            </div>
          </div>
          <div className="pt-3 border-t border-[var(--lb-border)] text-[11px] text-[var(--lb-muted)] flex items-center justify-between">
            <span>28 mục thực chứng</span>
            <span className="font-semibold text-[var(--lb-text)]">N01–N08 · G01–G08 · L01–L12</span>
          </div>
        </button>
      </div>

      {/* HÀNG DƯỚI 2 CỘT: KẾ HOẠCH 7-30-90 NGÀY + MỘT NGÀY SỐNG CÓ Ý NGHĨA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Cột trái: Việc em đã chọn trong Kế hoạch 7–30–90 ngày (5 cols) */}
        <div className="lg:col-span-5 bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--lb-border)] pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--lb-primary)]">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>VIỆC EM ĐÃ CHỌN (7–30–90 NGÀY)</span>
              </div>
              <span className="text-xs text-[var(--lb-muted)] tabular-nums">
                {(profile.actionPlan || []).length} mục
              </span>
            </div>

            {activePlanTasks.length > 0 ? (
              <div className="space-y-2.5">
                {activePlanTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 text-[var(--lb-muted)]">
                      <span className="font-bold text-[var(--lb-primary)]">
                        Mốc {task.horizonDays} ngày · {task.status}
                      </span>
                      {task.dueDate && <span className="tabular-nums">Hạn xem: {task.dueDate}</span>}
                    </div>
                    <p className="text-sm font-bold text-[var(--lb-text)]">{task.task}</p>
                    <p className="text-[var(--lb-muted)]">Minh chứng: {task.evidence}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] text-xs text-[var(--lb-muted)]">
                Em chưa chọn việc trong kế hoạch. Một bước nhỏ thực hiện trong 10–15 phút cũng rất đáng quý.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('plan')}
            className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-[var(--lb-primary)] text-[var(--lb-primary)] font-bold text-xs sm:text-sm hover:bg-[var(--lb-primary-soft)] flex items-center justify-center gap-2 whitespace-nowrap shrink-0 lb-transition"
          >
            <span>Mở Kế hoạch & Hộ chiếu minh chứng</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>

        {/* Cột phải: Một ngày sống có ý nghĩa (7 cols) */}
        <div className="lg:col-span-7 bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--lb-border)] pb-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--lb-primary-soft)] text-[var(--lb-primary)] flex items-center justify-center shrink-0">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold">Một ngày sống có ý nghĩa (Tự nguyện · Không tính điểm)</h2>
                <p className="text-xs text-[var(--lb-muted)] mt-0.5">
                  Liên kết A05, A08 & O01: Ghi nhận một việc nhỏ đáng nhớ, một lần giúp bạn hoặc nghỉ ngơi đúng lúc.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'A05' as const, label: 'A05 · Điều quan trọng ngoài điểm số' },
              { id: 'A08' as const, label: 'A08 · Khoảnh khắc có ý nghĩa hôm nay' },
              { id: 'O01' as const, label: 'O01 · Việc nhỏ đã thử hoặc nghỉ ngơi' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setMeaningfulPrompt(p.id)}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold border whitespace-nowrap shrink-0 lb-transition ${
                  meaningfulPrompt === p.id
                    ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] border-transparent'
                    : 'bg-[var(--lb-bg)] border-[var(--lb-border)] text-[var(--lb-muted)] hover:text-[var(--lb-text)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={keepMeaningfulOnPaper}
                onChange={(e) => setKeepMeaningfulOnPaper(e.target.checked)}
                className="w-4 h-4 accent-[#006B60] rounded"
              />
              <span>Em chọn viết trên sổ tay giấy (ứng dụng không lưu nội dung vào thiết bị)</span>
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
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-primary)] text-[var(--lb-primary)] font-bold text-xs sm:text-sm hover:bg-[var(--lb-primary-soft)] whitespace-nowrap shrink-0 lb-transition"
              >
                {keepMeaningfulOnPaper ? 'Xác nhận đã tự viết trên giấy' : 'Lưu vào góc riêng trên thiết bị'}
              </button>
              {meaningfulStatus && (
                <span className="text-xs text-[var(--lb-primary)] font-semibold">{meaningfulStatus}</span>
              )}
            </div>

            {(profile.meaningfulDays || []).length > 0 && (
              <div className="pt-2 border-t border-[var(--lb-border)] space-y-1.5">
                <div className="text-[11px] font-bold text-[var(--lb-muted)]">
                  Khoảnh khắc đã ghi nhận gần đây trên thiết bị:
                </div>
                {(profile.meaningfulDays || []).slice(0, 2).map((md) => (
                  <div
                    key={md.id}
                    className="p-2.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] text-xs flex items-center justify-between gap-2"
                  >
                    <span className="truncate">
                      <strong className="text-[var(--lb-primary)]">{md.promptId}:</strong> {md.reflection}
                    </span>
                    <span className="text-[11px] text-[var(--lb-muted)] tabular-nums shrink-0">{md.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HAI NÚT CUỐI TRANG HÔM NAY */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => onNavigateTab('support')}
          className="min-h-[46px] px-5 py-2.5 rounded-xl border border-[var(--lb-danger)]/40 bg-[var(--lb-danger-soft)] text-[var(--lb-danger)] font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap shrink-0 hover:bg-[#B42318] hover:text-white lb-transition"
        >
          <HeartHandshake className="w-4 h-4 shrink-0" />
          <span>Em cần hỗ trợ (111 / 115 / 113)</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('me')}
          className="min-h-[46px] px-5 py-2.5 rounded-xl border border-[var(--lb-border)] bg-[var(--lb-card)] text-[var(--lb-text)] font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap shrink-0 hover:border-[var(--lb-primary)] lb-transition"
        >
          <ShieldCheck className="w-4 h-4 text-[var(--lb-primary)] shrink-0" />
          <span>Quyền riêng tư & Quản lý dữ liệu cục bộ</span>
        </button>
      </div>
    </div>
  );
};
