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
} from 'lucide-react';

interface OnboardingPrivacyViewProps {
  currentGrade: '10' | '11' | '12' | null;
  onStartDemo: (grade: '10' | '11' | '12' | null) => void;
  onStartNewProfile: (grade: '10' | '11' | '12' | null) => void;
  onOpenEmergencySupport: () => void;
}

export const OnboardingPrivacyView: React.FC<OnboardingPrivacyViewProps> = ({
  currentGrade,
  onStartDemo,
  onStartNewProfile,
  onOpenEmergencySupport,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<'10' | '11' | '12' | null>(currentGrade);
  const [acknowledgedStorage, setAcknowledgedStorage] = useState(true);

  return (
    <div className="min-h-screen bg-[var(--lb-bg)] text-[var(--lb-text)] px-4 py-6 md:py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Brand + Truy cập hỗ trợ không cần đồng thuận */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold tracking-tight">LA BÀN TƯƠNG LAI</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md border border-[var(--lb-border)] text-[var(--lb-muted)]">
                  Phiếu 2.0 · Quy tắc 2.0.1
                </span>
              </div>
              <p className="text-xs text-[var(--lb-muted)]">
                Hiểu mình — Hiểu nghề — Hiểu bối cảnh — Hành động · Mỗi trải nghiệm, một bước hiểu mình.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenEmergencySupport}
            className="min-h-[48px] px-4 py-2 rounded-xl border border-[#B42318] text-[#B42318] dark:border-[#F28B82] dark:text-[#F28B82] font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Em cần hỗ trợ</span>
          </button>
        </div>

        {/* 3 Thẻ nguyên tắc nhân văn cốt lõi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#006B60]/10 dark:bg-[#78D9C7]/15 text-[var(--lb-primary)] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold">1. Hiểu mình bằng trải nghiệm</h2>
            <p className="text-sm text-[var(--lb-muted)]">
              206 mục tự khảo sát và Phòng thử nghề trên giấy giúp em quan sát sở thích, giá trị sống và bước đi thực tế.
            </p>
          </div>

          <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#245B91]/10 text-[var(--lb-info)] flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold">2. Không có điểm nào định nghĩa em</h2>
            <p className="text-sm text-[var(--lb-muted)]">
              Mọi điểm số chỉ là ảnh chụp thời điểm hiện tại để mở ra đối thoại, không phải chẩn đoán hay phán quyết nghề duy nhất.
            </p>
          </div>

          <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-5 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#8A5A16]/10 text-[var(--lb-warn)] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold">3. Quyền dừng, bỏ qua và giữ riêng</h2>
            <p className="text-sm text-[var(--lb-muted)]">
              Em luôn có lựa chọn <strong>U (Chưa rõ)</strong> và <strong>X (Không muốn trả lời)</strong>. Nhật ký tự vấn I/O mặc định em tự giữ trên giấy.
            </p>
          </div>
        </div>

        {/* Thông báo quyền riêng tư & Giới hạn sản phẩm */}
        <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-[var(--lb-primary)] shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-bold">Cam kết Quyền riêng tư & Hoạt động Ngoại tuyến (Offline 100%)</h2>
              <p className="text-sm text-[var(--lb-muted)] mt-1">
                Thiết kế tham chiếu quy định bảo vệ học sinh và dữ liệu cá nhân (Thông tư 18/2025/TT-BGDĐT, Luật 91/2025/QH15, Nghị định 356/2025/NĐ-CP):
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="p-3.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-1">
              <div className="font-semibold">Dữ liệu KHÔNG thu thập</div>
              <p className="text-[var(--lb-muted)]">
                Không hỏi họ tên, số điện thoại, ngày sinh chính xác, tên trường, vị trí GPS, danh bạ, camera hay tài khoản. Không gọi AI/Gemini lúc chạy.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-1">
              <div className="font-semibold">Dữ liệu lưu cục bộ trên thiết bị</div>
              <p className="text-[var(--lb-muted)]">
                Chỉ lưu mã hồ sơ ngẫu nhiên, khối lớp tự nguyện (10/11/12) và các câu trả lời A–O để em xem lại hoặc xóa hoàn toàn bất cứ lúc nào.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-1">
              <div className="font-semibold">Giới hạn của ứng dụng</div>
              <p className="text-[var(--lb-muted)]">
                Ứng dụng không thay thế cán bộ tham vấn hay dịch vụ cấp cứu, không tự quét nhật ký I/O và không tự liên hệ giáo viên hay cha mẹ.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-1">
              <div className="font-semibold">Khác biệt bản cá nhân & trường học</div>
              <p className="text-[var(--lb-muted)]">
                Bản thử kỹ thuật chỉ dùng dữ liệu giả lập (DEMO). Khi dùng tại trường, cần có quy trình đồng thuận và người phụ trách được phê duyệt.
              </p>
            </div>
          </div>

          {/* Chọn khối lớp tự nguyện */}
          <div className="pt-2 border-t border-[var(--lb-border)] space-y-3">
            <div>
              <label className="block text-sm font-semibold">
                Chọn khối lớp của em (Tự nguyện — có thể bỏ qua):
              </label>
              <p className="text-xs text-[var(--lb-muted)]">
                Giúp gợi ý nhiệm vụ gần gũi hơn; không bắt buộc phải chọn.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['10', '11', '12'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGrade(selectedGrade === g ? null : g)}
                  className={`min-h-[48px] px-5 py-2.5 rounded-xl border font-semibold text-sm transition-colors ${
                    selectedGrade === g
                      ? 'bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] border-transparent'
                      : 'bg-[var(--lb-bg)] border-[var(--lb-border)] text-[var(--lb-text)] hover:border-[var(--lb-primary)]'
                  }`}
                >
                  Khối {g}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedGrade(null)}
                className={`min-h-[48px] px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                  selectedGrade === null
                    ? 'border-[var(--lb-primary)] text-[var(--lb-primary)] font-semibold bg-[var(--lb-bg)]'
                    : 'border-[var(--lb-border)] text-[var(--lb-muted)]'
                }`}
              >
                Bỏ qua chọn khối
              </button>
            </div>
          </div>

          {/* Tùy chọn xác nhận lưu cục bộ riêng biệt (Không ép đồng thuận gộp) */}
          <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] flex items-start gap-3">
            <input
              id="consent-local-storage"
              type="checkbox"
              checked={acknowledgedStorage}
              onChange={(e) => setAcknowledgedStorage(e.target.checked)}
              className="mt-1 w-5 h-5 accent-[#006B60] rounded"
            />
            <label htmlFor="consent-local-storage" className="text-sm cursor-pointer">
              <span className="font-semibold">Em đã đọc giải thích về lưu dữ liệu cục bộ trên thiết bị này.</span>{' '}
              <span className="text-[var(--lb-muted)]">
                Em hiểu mình có thể xóa từng phân hệ hoặc xóa toàn bộ hồ sơ bất cứ lúc nào tại mục <strong>Em</strong>.
              </span>
            </label>
          </div>

          {/* Các nút hành động bắt đầu */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={!acknowledgedStorage}
              onClick={() => onStartDemo(selectedGrade || '11')}
              className="min-h-[48px] px-5 py-3 rounded-xl border-2 border-[var(--lb-primary)] text-[var(--lb-primary)] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#006B60]/5 disabled:opacity-40 transition-colors"
            >
              <FileCheck2 className="w-5 h-5" />
              <span>Dùng dữ liệu minh họa (DEMO)</span>
            </button>

            <button
              type="button"
              disabled={!acknowledgedStorage}
              onClick={() => onStartNewProfile(selectedGrade)}
              className="min-h-[48px] px-6 py-3 rounded-xl bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-40 transition-opacity"
            >
              <Compass className="w-5 h-5" />
              <span>Bắt đầu hồ sơ tự chọn mới</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--lb-muted)] pt-1">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              Trong bản nguyên mẫu kỹ thuật, vui lòng chỉ dùng dữ liệu giả lập (DEMO), không nhập thông tin định danh học sinh thật.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
