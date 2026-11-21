import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { getCurrentUser } from "@/features/auth/session";
import { Avatar } from "@/components/ui/avatar";
import { buttonClass } from "@/components/ui/button";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Quản trị cấp cao",
  admin: "Quản trị viên",
  instructor: "Giảng viên",
  support: "Hỗ trợ",
  student: "Học viên",
};

export async function UserMenu() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className={buttonClass("ghost", "sm", "hidden sm:inline-flex")}>
          Đăng nhập
        </Link>
        <Link href="/register" className={buttonClass("primary", "sm")}>
          Đăng ký
        </Link>
      </div>
    );
  }
  const top = ["super_admin", "admin", "instructor", "support", "student"].find((r) => user.roles.includes(r as never)) ?? "student";
  return (
    <Link href="/dashboard" className="flex items-center gap-2 rounded-xl py-1 pr-2 pl-1 hover:bg-surface-2" aria-label="Bảng điều khiển của tôi">
      <Avatar src={user.avatarUrl} name={user.displayName} size={32} />
      <span className="hidden flex-col text-left leading-tight lg:flex">
        <span className="font-display text-sm font-semibold text-ink">{user.displayName}</span>
        <span className="text-[11px] text-ink-subtle">{ROLE_LABEL[top]}</span>
      </span>
      <LayoutDashboard size={16} className="text-ink-subtle lg:hidden" aria-hidden />
    </Link>
  );
}
