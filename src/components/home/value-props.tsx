import { Code2, Headphones, PlayCircle, ShieldCheck } from "lucide-react";
import { SectionHeading } from "./section-heading";

const values = [
  { icon: Code2, tone: "bg-brand-soft text-brand-ink", title: "Giáo trình theo dự án", body: "Mỗi chương kết thúc bằng bài thực hành sát thực tế, giúp bạn áp dụng ngay vào công việc." },
  { icon: PlayCircle, tone: "bg-accent-soft text-accent-ink", title: "Video bảo mật, học mọi lúc", body: "Phát video an toàn, tự lưu vị trí xem, học tiếp trên mọi thiết bị." },
  { icon: Headphones, tone: "bg-success-soft text-success-ink", title: "Hỏi đáp với giảng viên", body: "Thảo luận theo từng bài học, giảng viên và trợ giảng phản hồi trực tiếp." },
  { icon: ShieldCheck, tone: "bg-surface-3 text-brand-ink", title: "Chứng chỉ xác thực được", body: "Chứng chỉ hoàn thành có mã xác thực công khai để nhà tuyển dụng kiểm tra." },
];

export function ValueProps() {
  return (
    <section className="container-page py-14">
      <SectionHeading eyebrow="Giá trị cốt lõi" title="Vì sao chọn Khai Sáng?" description="Tập trung vào năng lực giải quyết vấn đề thực tế, không lý thuyết suông." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v) => (
          <div key={v.title} className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)] ring-1 ring-line/60">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${v.tone}`}>
              <v.icon size={21} aria-hidden />
            </span>
            <h3 className="text-lg font-bold text-ink">{v.title}</h3>
            <p className="text-sm leading-6 text-ink-muted">{v.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const steps = [
  { n: "01", title: "Xem video bài giảng", body: "Bài học ngắn gọn, tập trung vào bản chất và vấn đề thực tế." },
  { n: "02", title: "Luyện tập & làm dự án", body: "Quiz cuối chương, bài tập có chấm điểm và dự án đưa vào portfolio." },
  { n: "03", title: "Nhận phản hồi & chứng chỉ", body: "Hoàn thành điều kiện khoá học để nhận chứng chỉ có mã xác thực." },
];

export function HowItWorks() {
  return (
    <section className="container-page py-14">
      <SectionHeading align="center" eyebrow="Quy trình học tập" title="3 bước để làm chủ kỹ năng mới" />
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((s) => (
          <li key={s.n} className="rounded-3xl bg-card p-6 shadow-[var(--shadow-soft)] ring-1 ring-line/60">
            <span className="font-display text-5xl font-extrabold text-brand-soft" aria-hidden>
              {s.n}
            </span>
            <h3 className="mt-2 text-xl font-bold text-ink">{s.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink-muted">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
