import { NewsletterForm } from "./newsletter-form";

export function CtaNewsletter() {
  return (
    <section className="container-page py-14">
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-strong via-brand to-[#8b7dff] px-6 py-14 text-white sm:px-14">
        <div aria-hidden className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative max-w-2xl">
          <span className="rounded-full bg-white/15 px-3 py-1 font-display text-[11px] font-bold tracking-wider uppercase">Bắt đầu hành trình</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Sẵn sàng khai phóng tiềm năng của bạn?</h2>
          <p className="mt-3 text-white/85">Nhận lộ trình học gợi ý và thông tin ưu đãi mới nhất qua email. Huỷ đăng ký bất cứ lúc nào.</p>
          <div className="mt-6 max-w-xl">
            <NewsletterForm dark />
          </div>
        </div>
      </div>
    </section>
  );
}
