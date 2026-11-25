import React from 'react';
import {
  PhoneCall,
  ShieldAlert,
  HeartHandshake,
  ArrowLeft,
  Info,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
} from 'lucide-react';

interface EmergencySupportViewProps {
  confirmedSafetyPause: boolean;
  onToggleSafetyPause: (paused: boolean) => void;
  onClose?: () => void;
}

export const EmergencySupportView: React.FC<EmergencySupportViewProps> = ({
  confirmedSafetyPause,
  onToggleSafetyPause,
  onClose,
}) => {
  return (
    <div className="space-y-6">
      {/* Header độc lập */}
      <div className="bg-[var(--lb-card)] border-2 border-[#B42318] dark:border-[#F28B82] rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#B42318]/10 text-[#B42318] dark:text-[#F28B82] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#B42318]/10 text-[#B42318] dark:text-[#F28B82] mb-1">
                07 · Em cần hỗ trợ
              </span>
              <h1 className="text-xl md:text-2xl font-bold">
                Có những lúc em cần một người thật lắng nghe.
              </h1>
              <p className="text-sm text-[var(--lb-muted)] mt-1">
                Ứng dụng này <strong>không theo dõi nội dung em viết</strong>, không có AI quét nhật ký và không phải là dịch vụ cấp cứu trực tuyến. Nếu cảm thấy không an toàn hoặc quá nặng nề, em hãy tìm một người lớn đáng tin cậy, cán bộ tư vấn học đường hoặc nhân viên y tế phù hợp.
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-4 py-2 rounded-xl border border-[var(--lb-border)] text-sm font-semibold flex items-center gap-2 hover:bg-[var(--lb-bg)]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          )}
        </div>

        {/* Hướng dẫn khẩn cấp & Nút mở trình gọi 115 / 113 / 111 */}
        <div className="p-4 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-[#B42318] dark:text-[#F28B82]">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>Nếu có nguy hiểm tức thời:</span>
          </div>
          <p className="text-sm text-[var(--lb-text)]">
            Hãy tìm nơi an toàn ngay nếu có thể, nhờ một người lớn đáng tin cậy ở cạnh (tuyệt đối không liên hệ người gây hại) và chủ động mở trình gọi các số khẩn cấp chính thức dưới đây:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-4 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] flex flex-col justify-between gap-3">
              <div>
                <div className="text-lg font-bold tabular-nums text-[#B42318] dark:text-[#F28B82]">
                  111 — Tổng đài Quốc gia
                </div>
                <p className="text-xs text-[var(--lb-muted)] mt-1">
                  Tổng đài quốc gia bảo vệ trẻ em (miễn phí 24/7) — xin hướng dẫn và kết nối bảo vệ phù hợp.
                </p>
              </div>
              <a
                href="tel:111"
                className="min-h-[48px] px-4 py-2.5 rounded-xl bg-[#B42318] text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Mở trình gọi 111</span>
              </a>
            </div>

            <div className="p-4 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] flex flex-col justify-between gap-3">
              <div>
                <div className="text-lg font-bold tabular-nums text-[#B42318] dark:text-[#F28B82]">
                  115 — Cấp cứu Y tế
                </div>
                <p className="text-xs text-[var(--lb-muted)] mt-1">
                  Gọi cấp cứu y tế khẩn cấp khi có nguy cơ tổn thương sức khỏe hoặc tính mạng.
                </p>
              </div>
              <a
                href="tel:115"
                className="min-h-[48px] px-4 py-2.5 rounded-xl border-2 border-[#B42318] text-[#B42318] dark:border-[#F28B82] dark:text-[#F28B82] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#B42318]/5"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Mở trình gọi 115</span>
              </a>
            </div>

            <div className="p-4 rounded-xl bg-[var(--lb-card)] border border-[var(--lb-border)] flex flex-col justify-between gap-3">
              <div>
                <div className="text-lg font-bold tabular-nums text-[#B42318] dark:text-[#F28B82]">
                  113 — Công an
                </div>
                <p className="text-xs text-[var(--lb-muted)] mt-1">
                  Khi có đe dọa bạo lực, xâm hại hoặc mất an ninh trật tự tức thời tại nơi em đang ở.
                </p>
              </div>
              <a
                href="tel:113"
                className="min-h-[48px] px-4 py-2.5 rounded-xl border-2 border-[#B42318] text-[#B42318] dark:border-[#F28B82] dark:text-[#F28B82] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#B42318]/5"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Mở trình gọi 113</span>
              </a>
            </div>
          </div>

          <p className="text-xs text-[var(--lb-muted)] flex items-center gap-1.5 pt-1">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              Ứng dụng chỉ mở trình quay số khi em chủ động nhấn nút, không tự động gọi. Số và chức năng cần được nhà trường xác nhận theo địa bàn trước khi phát hành.
            </span>
          </p>
        </div>

        {/* Trạng thái Tạm dừng hướng nghiệp (confirmedSafetyPause - S32) */}
        <div className="p-5 rounded-xl bg-[var(--lb-bg)] border border-[var(--lb-border)] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold">
                Chế độ Tạm dừng gợi ý hướng nghiệp để ưu tiên an toàn (Safety Pause)
              </h2>
              <p className="text-sm text-[var(--lb-muted)] mt-0.5">
                Khi em tự báo đang không an toàn hoặc người phụ trách xác nhận cần ưu tiên hỗ trợ, hệ thống sẽ tạm dừng tạo báo cáo hướng nghiệp thông thường trong phiên này để em không bị áp lực.
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-md text-xs font-bold border ${
                confirmedSafetyPause
                  ? 'bg-[#B42318]/10 text-[#B42318] border-[#B42318] dark:text-[#F28B82]'
                  : 'bg-[#006B60]/10 text-[var(--lb-primary)] border-[var(--lb-border)]'
              }`}
            >
              {confirmedSafetyPause ? 'ĐANG TẠM DỪNG BÁO CÁO NGHỀ' : 'ĐANG HOẠT ĐỘNG BÌNH THƯỜNG'}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            {!confirmedSafetyPause ? (
              <button
                type="button"
                onClick={() => onToggleSafetyPause(true)}
                className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#B42318] text-white font-bold text-sm flex items-center gap-2 hover:opacity-95"
              >
                <PauseCircle className="w-5 h-5" />
                <span>Xác nhận tạm dừng báo cáo nghề — Em cần ưu tiên hỗ trợ</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleSafetyPause(false)}
                className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] font-bold text-sm flex items-center gap-2 hover:opacity-95"
              >
                <PlayCircle className="w-5 h-5" />
                <span>Mở lại chế độ khám phá hướng nghiệp bình thường</span>
              </button>
            )}
          </div>

          <div className="text-xs text-[var(--lb-muted)] space-y-1 pt-1">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--lb-primary)] shrink-0" />
              <span>
                Không tự động gửi thông báo cho gia đình hay bên thứ ba; không trộn hồ sơ yêu cầu trợ giúp vào báo cáo nghề nghiệp.
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--lb-primary)] shrink-0" />
              <span>
                Công cụ này không thay thế đánh giá nguy cơ trực tiếp của chuyên gia tâm lý hoặc bác sĩ.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
