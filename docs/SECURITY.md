# Bảo mật

## Phân quyền
- Vai trò: guest, student, instructor, support, admin, super_admin (một người có thể nhiều vai trò) — lưu ở `user_roles`, **không** ở metadata người dùng hay cột profile.
- Ba lớp: (1) `proxy.ts` chuyển hướng lạc quan, (2) `requireUser/requireRole` trong Data Access Layer, (3) **RLS Postgres** (lớp quyết định).
- Đổi vai trò chỉ qua `assign_role()` (super_admin, có audit) hoặc `scripts/create-admin.mjs` (service role, chạy từ máy quản trị).

## Thanh toán (thiết kế cho Milestone 3)
Giá luôn tính server-side; giỏ hàng client chỉ lưu slug. Đơn/thanh toán/quyền truy cập chỉ ghi bằng service role sau khi xác thực chữ ký webhook. Không đánh dấu "đã thanh toán" từ redirect phía trình duyệt. Idempotency bằng unique constraint (`payment_events`, `access_grants` theo đơn, `enrollments`).

## Đã áp dụng
- Zod validate mọi input server action / search params (giá trị lạ bị bỏ qua, không crash).
- Chống open redirect: `safeNextPath()` (có test).
- Không lộ tồn tại tài khoản ở đăng ký/quên mật khẩu.
- Tìm kiếm: escape `%`/`_` trong ILIKE; PostgREST tham số hoá.
- JSON-LD escape `<`.
- Header bảo mật: HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy.
- Secret chỉ ở `lib/env.server.ts` (`server-only`); service role client chỉ trong `lib/supabase/admin.ts`.
- `audit_logs` append-only (trigger chặn UPDATE/DELETE).

## Còn thiếu (theo dõi trong TASKS.md)
Rate limiting (đăng nhập, newsletter, webhook), CSP nghiêm ngặt, MFA cho admin, Sentry, kiểm tra upload file.
