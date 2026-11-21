import Image from "next/image";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <main id="main" className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
      </main>
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-strong via-brand to-[#8b7dff] lg:block" aria-hidden>
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative flex h-full flex-col justify-end gap-6 p-14 text-white">
          <div className="relative h-72 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/20">
            <Image src="/images/intro-video.jpg" alt="" fill sizes="50vw" className="object-cover" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Học từ người đã làm. Tiến bộ mỗi ngày.</h2>
          <p className="max-w-md text-white/85">Theo dõi tiến độ, học tiếp đúng chỗ đã dừng và nhận chứng chỉ khi hoàn thành.</p>
        </div>
      </aside>
    </div>
  );
}
