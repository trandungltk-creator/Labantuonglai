import React, { useState } from 'react';
import {
  Compass,
  ShieldCheck,
  HeartHandshake,
  Lock,
  Sparkles,
  FileCheck2,
  PhoneCall,
  Info,
  Sun,
  Moon,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface OnboardingPrivacyViewProps {
  currentGrade: '10' | '11' | '12' | null;
  theme?: 'light' | 'dark';
  onToggleTheme?: (theme: 'light' | 'dark') => void;
  onStartDemo: (grade: '10' | '11' | '12' | null) => void;
  onStartNewProfile: (grade: '10' | '11' | '12' | null) => void;
  onOpenEmergencySupport: () => void;
}

export const OnboardingPrivacyView: React.FC<OnboardingPrivacyViewProps> = ({
  currentGrade,
  theme = 'light',
  onToggleTheme,
  onStartDemo,
  onStartNewProfile,
  onOpenEmergencySupport,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<'10' | '11' | '12' | null>(currentGrade);
  const [acknowledgedStorage, setAcknowledgedStorage] = useState(true);

  return (
    <div className="min-h-screen bg-[var(--lb-bg)] text-[var(--lb-text)] flex flex-col">
      {/* Top Bar Contract: 3 zones */}
      <header className="bg-[var(--lb-card)] border-b border-[var(--lb-border)] px-4 sm:px-6 py-3.5">
        <div className="max-w-[1320px] mx-auto flex items-center justify-between gap-8">
          <span className="text-lg font-extrabold tracking-tight whitespace-nowrap shrink-0">
            La Bàn Tương Lai
          </span>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[var(--lb-muted)]">
            <span className="whitespace-nowrap shrink-0">00. Giới thiệu & Quyền riêng tư</span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap shrink-0">Phiếu chuẩn 2.0</span>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap shrink-0">Quy tắc chấm 2.0.1 Offline</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onToggleTheme && (
              <button
                type="button"
                onClick={() => onToggleTheme(theme === 'light' ? 'dark' : 'light')}
                className="min-h-[42px] px-3 py-2 rounded-xl border border-[var(--lb-border)] bg-[var(--lb-bg)] text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 lb-transition"
              >
                {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                <span>{theme === 'light' ? 'Giao diện Tối' : 'Giao diện Sáng'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenEmergencySupport}
              className="min-h-[42px] px-4 py-2 rounded-xl bg-[var(--lb-danger-soft)] text-[var(--lb-danger)] border border-[var(--lb-danger)]/30 hover:bg-[#B42318] hover:text-white font-bold text-xs flex items-center gap-2 whitespace-nowrap shrink-0 lb-transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Em cần hỗ trợ (111 / 115 / 113)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Split-Hero Onboarding Workspace */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Value Proposition & Humane Philosophy (7 cols) */}
          <div className="lg:col-span-7 bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="text-xs font-semibold text-[var(--lb-primary)] flex items-center gap-2 flex-wrap">
                <span>Hệ thống tham vấn học đường & tự định hướng THPT (15–18 tuổi)</span>
                <span aria-hidden="true">·</span>
                <span>Offline 100%</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--lb-text)]">
                Mỗi trải nghiệm nhỏ hôm nay là một bước hiểu mình rõ hơn.
              </h1>

              <p className="text-sm sm:text-base text-[var(--lb-muted)] leading-relaxed max-w-2xl">
                La Bàn Tương Lai giúp em tự quan sát sở thích, giá trị sống, sản phẩm thực chứng trên giấy và bối cảnh gia đình qua <strong>206 mục chuẩn hóa</strong>. Không có bất kỳ con số hay thuật toán nào được phép phán quyết tương lai thay em.
              </p>
            </div>

            {/* 3 Core Pillars inside Left Hero */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[var(--lb-border)]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--lb-text)]">
                  <Sparkles className="w-4 h-4 text-[var(--lb-primary)] shrink-0" />
                  <span>01. Hiểu qua trải nghiệm</span>
                </div>
                <p className="text-xs text-[var(--lb-muted)]">
                  Kết hợp tự mô tả (A, B, C, D) với Phòng thử nghề trên giấy (N01–N08) và đối sánh hành vi (J).
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--lb-text)]">
                  <HeartHandshake className="w-4 h-4 text-[var(--lb-info)] shrink-0" />
                  <span>02. Không dán nhãn</span>
                </div>
                <p className="text-xs text-[var(--lb-muted)]">
                  Báo cáo chỉ là ảnh chụp thời điểm hiện tại để mở đối thoại, tuyệt đối không gán nhãn tính cách cố định.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-bold text-[var(--lb-text)]">
                  <Lock className="w-4 h-4 text-[var(--lb-warn)] shrink-0" />
                  <span>03. Tôn trọng U & X</span>
                </div>
                <p className="text-xs text-[var(--lb-muted)]">
                  Quyền chọn <strong>U (Chưa rõ)</strong>, <strong>X (Giữ riêng)</strong> ở mọi câu mà không bao giờ bị ép về 0 điểm.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Quick-Start Control Panel (5 cols) */}
          <div className="lg:col-span-5 bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[var(--lb-border)] pb-3">
                <div>
                  <h2 className="text-lg font-bold">Thiết lập phiên làm việc cục bộ</h2>
                  <p className="text-xs text-[var(--lb-muted)]">
                    Dữ liệu chỉ lưu trên trình duyệt của thiết bị này, không gửi lên máy chủ.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[var(--lb-primary-soft)] text-[var(--lb-primary)] flex items-center justify-center shrink-0">
                  <Compass className="w-5 h-5" />
                </div>
              </div>

              {/* Bước 1: Chọn khối lớp */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[var(--lb-text)]">
                  Bước 1 · Chọn khối lớp hiện tại của em (Tự nguyện — có thể bỏ qua):
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['10', '11', '12'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGrade(selectedGrade === g ? null : g)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl border font-bold text-xs whitespace-nowrap shrink-0 lb-transition ${
                        selectedGrade === g
                          ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] border-transparent'
                          : 'bg-[var(--lb-bg)] border-[var(--lb-border)] text-[var(--lb-text)] hover:border-[var(--lb-primary)]'
                      }`}
                    >
                      Khối {g}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedGrade(null)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 lb-transition ${
                      selectedGrade === null
                        ? 'border-[var(--lb-primary)] text-[var(--lb-primary)] bg-[var(--lb-primary-soft)] font-bold'
                        : 'bg-[var(--lb-bg)] border-[var(--lb-border)] text-[var(--lb-muted)]'
                    }`}
                  >
                    Bỏ qua
                  </button>
                </div>
              </div>

              {/* Bước 2: Xác nhận hiểu quyền lưu & xóa cục bộ */}
              <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)]">
                <label htmlFor="consent-local-storage" className="flex items-start gap-3 cursor-pointer">
                  <input
                    id="consent-local-storage"
                    type="checkbox"
                    checked={acknowledgedStorage}
                    onChange={(e) => setAcknowledgedStorage(e.target.checked)}
                    className="mt-0.5 w-5 h-5 accent-[#006B60] rounded shrink-0"
                  />
                  <span className="text-xs leading-relaxed">
                    <strong className="text-[var(--lb-text)]">
                      Em đã đọc giải thích về quyền lưu dữ liệu cục bộ trên thiết bị này.
                    </strong>{' '}
                    <span className="text-[var(--lb-muted)]">
                      Em hiểu mình có thể xóa từng phân hệ hoặc xóa sạch toàn bộ hồ sơ bất cứ lúc nào tại mục <strong>Em</strong>.
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* Bước 3: Chọn chế độ khởi tạo */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={!acknowledgedStorage}
                onClick={() => onStartDemo(selectedGrade || '11')}
                className="w-full min-h-[50px] px-5 py-3 rounded-xl bg-[var(--lb-primary)] text-white dark:text-[#0B1514] font-bold text-sm flex items-center justify-between gap-3 hover:opacity-95 disabled:opacity-40 lb-transition"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-5 h-5 shrink-0" />
                  <span>Khám phá ngay với dữ liệu minh họa (DEMO)</span>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <button
                type="button"
                disabled={!acknowledgedStorage}
                onClick={() => onStartNewProfile(selectedGrade)}
                className="w-full min-h-[48px] px-5 py-3 rounded-xl border border-[var(--lb-primary)] bg-[var(--lb-bg)] text-[var(--lb-primary)] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[var(--lb-primary-soft)] disabled:opacity-40 lb-transition"
              >
                <Compass className="w-4 h-4 shrink-0" />
                <span>Bắt đầu hồ sơ trống mới từ đầu</span>
              </button>

              <div className="flex items-center gap-2 text-[11px] text-[var(--lb-muted)] pt-1">
                <Info className="w-3.5 h-3.5 shrink-0 text-[var(--lb-primary)]" />
                <span>
                  Trong bản thử nghiệm kỹ thuật, khuyến nghị dùng hồ sơ DEMO (không nhập định danh cá nhân thật).
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 4-Column Privacy & Compliance Strip */}
        <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--lb-border)] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--lb-primary)]" />
              <h2 className="text-base font-bold">
                Cam kết Bảo vệ Dữ liệu Cá nhân & Đạo đức Tham vấn Học đường
              </h2>
            </div>
            <span className="text-xs text-[var(--lb-muted)]">
              Tham chiếu Thông tư 18/2025/TT-BGDĐT · Luật 91/2025/QH15 · Nghị định 356/2025/NĐ-CP · ASCA 2022
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-1.5">
              <div className="font-bold text-[var(--lb-text)] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--lb-primary)] shrink-0" />
                <span>Không thu thập định danh</span>
              </div>
              <p className="text-[var(--lb-muted)]">
                Không hỏi họ tên, số điện thoại, ngày sinh, tên trường, GPS, camera hay tài khoản mạng xã hội.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-1.5">
              <div className="font-bold text-[var(--lb-text)] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--lb-primary)] shrink-0" />
                <span>Không gọi AI lúc chạy</span>
              </div>
              <p className="text-[var(--lb-muted)]">
                Toàn bộ điểm số và gợi ý đối thoại vận hành bằng tập quy tắc tất định 2.0.1 ngay trên thiết bị.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-1.5">
              <div className="font-bold text-[var(--lb-text)] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--lb-primary)] shrink-0" />
                <span>Nhật ký I/O ưu tiên trên giấy</span>
              </div>
              <p className="text-[var(--lb-muted)]">
                Ứng dụng không tự động đọc hay quét nhật ký tự vấn I/O, không tự gửi cảnh báo cho gia đình hay giáo viên.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-1.5">
              <div className="font-bold text-[var(--lb-text)] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--lb-primary)] shrink-0" />
                <span>Tách kho nghiên cứu M</span>
              </div>
              <p className="text-[var(--lb-muted)]">
                Phân hệ M (M01–M12) hoàn toàn tách khỏi hồ sơ cá nhân, không gắn mã hồ sơ và tự ẩn mọi ô thống kê dưới 10 phiếu.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
