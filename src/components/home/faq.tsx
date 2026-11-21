import { ChevronDown } from "lucide-react";
import { SectionHeading } from "./section-heading";

export const faqs = [
  { q: "Tôi có sở hữu khoá học vĩnh viễn không?", a: "Có. Khoá học đã mua được truy cập trọn đời theo chính sách của nền tảng, bao gồm cả các bản cập nhật nội dung sau này." },
  { q: "Tôi thanh toán bằng cách nào?", a: "Bạn thanh toán qua PayOS bằng mã VietQR hoặc chuyển khoản ngân hàng. Khoá học được kích hoạt tự động ngay khi thanh toán được xác nhận." },
  { q: "Tôi có được xem thử trước khi mua?", a: "Mỗi khoá học có các bài học xem thử miễn phí được đánh dấu rõ trong giáo trình." },
  { q: "Chứng chỉ được cấp khi nào?", a: "Khi bạn hoàn thành tất cả bài học bắt buộc và đạt các bài kiểm tra yêu cầu. Mỗi chứng chỉ có mã xác thực công khai." },
  { q: "Nếu gặp sự cố thanh toán hoặc truy cập thì sao?", a: "Hãy gửi yêu cầu hỗ trợ từ trang cá nhân. Đội ngũ hỗ trợ sẽ kiểm tra giao dịch và phản hồi sớm nhất." },
];

export function Faq() {
  return (
    <section id="faq" className="container-page scroll-mt-24 py-14">
      <SectionHeading align="center" eyebrow="Giải đáp thắc mắc" title="Câu hỏi thường gặp" />
      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        {faqs.map((f) => (
          <details key={f.q} className="group rounded-2xl bg-card shadow-[var(--shadow-soft)] ring-1 ring-line/60 open:ring-brand/40">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-display font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown size={18} className="shrink-0 text-ink-subtle transition group-open:rotate-180" aria-hidden />
            </summary>
            <p className="px-6 pb-5 text-[15px] leading-7 text-ink-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
