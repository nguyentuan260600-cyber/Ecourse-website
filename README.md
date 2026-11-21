# Khai Sáng — Nền tảng bán khoá học & LMS

Marketplace khoá học trực tuyến + hệ thống quản lý học tập (LMS) bằng tiếng Việt.
Next.js 16 (App Router) · TypeScript strict · Tailwind CSS 4 · Supabase (Postgres, Auth, RLS).
Giao diện dựa trên dự án Stitch **"Premium EdTech Marketplace & LMS"**.

> Tiến độ và phạm vi chi tiết: xem [TASKS.md](TASKS.md). Hiện xong Milestone 0–1 và phần lớn Milestone 2.

## Chạy nhanh (không cần Supabase)

```bash
npm install
npm run dev
```

Khi chưa có biến môi trường Supabase, website chạy ở **chế độ phát triển** (banner vàng ở đầu trang): chỉ có 6 danh mục mẫu, chưa có khoá học, giảng viên hay đánh giá; đăng nhập/đăng ký báo chưa cấu hình.

## Chạy với Supabase

1. Tạo dự án Supabase, sao chép `.env.example` → `.env.local` và điền `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
2. Tạo CSDL: mở **SQL Editor** của dự án mới, dán toàn bộ `supabase/setup.sql` (migration + 6 danh mục và 1 mã giảm giá mẫu cho dev) rồi Run.
   Production: `npm run db:bundle -- --no-seed` rồi dùng `supabase/setup.production.sql`. Hoặc dùng Supabase CLI `supabase db push`.
4. Trong Supabase Auth → URL Configuration: thêm `http://localhost:3000/auth/confirm` vào Redirect URLs.
   Trong Email Templates, dùng liên kết dạng `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`
   (với "Reset password": `type=recovery`).
5. Đăng ký một tài khoản trên website rồi cấp quyền quản trị:
   ```bash
   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-admin.mjs ban@email.com
   ```

## Video (Cloudflare Stream)

1. Cloudflare Dashboard → **Stream**: bật Stream cho tài khoản.
2. **My Profile → API Tokens → Create Token → Custom token**, quyền **Account › Stream › Edit**, giới hạn vào tài khoản của bạn.
3. Điền vào `.env.local`: `CLOUDFLARE_ACCOUNT_ID` (Dashboard → bên phải trang Overview) và `CLOUDFLARE_STREAM_API_TOKEN`, rồi khởi động lại.
4. Đăng nhập bằng tài khoản admin/giảng viên → **/admin/videos** → tải video (tus, tiếp tục được khi rớt mạng, tới 30 GB).
5. Khi video "Sẵn sàng", sao chép UID vào `lessons.video_uid` (hoặc `courses.preview_video_uid` cho video giới thiệu) trong Supabase.

Mọi video tạo với `requireSignedURLs`: chỉ phát được qua liên kết có chữ ký 1 giờ do máy chủ cấp sau khi kiểm tra quyền
(`/api/lessons/[id]/playback` → `get_lesson_content`). Token qua API giới hạn ~1.000/ngày — khi lượng học viên lớn, chuyển sang khoá ký riêng (signing key).

## Lệnh

| Lệnh | Mô tả |
| --- | --- |
| `npm run dev` | Chạy dev server |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm test` | Unit test (Vitest) |
| `npm run test:db` | Chạy toàn bộ migration + seed + **kiểm thử chính sách RLS** trên Postgres nhúng (PGlite) |
| `npm run db:seed:generate` | Sinh lại `supabase/seed.sql` (danh mục + mã giảm giá mẫu) |
| `npm run check` | Chạy tất cả các bước trên + build |

## Tài liệu

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — cấu trúc, luồng dữ liệu, rendering
- [docs/DATABASE.md](docs/DATABASE.md) — lược đồ, ERD, RLS
- [docs/SECURITY.md](docs/SECURITY.md) — mô hình phân quyền và các biện pháp bảo mật
- [docs/API.md](docs/API.md) — route handler & server action
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — triển khai Vercel + Supabase
- [docs/OPERATIONS.md](docs/OPERATIONS.md) — vận hành, sao lưu, khôi phục

## Giới hạn hiện tại

- Chưa có thanh toán PayOS, mã giảm giá, trang học bài (/learn), quiz/chứng chỉ PDF, khu vực soạn khoá học (Milestone 3–5). Video: đã có tải lên + phát qua Cloudflare Stream (xem bên dưới). Nút "Tiến hành thanh toán" đang tắt có chủ đích.
- Luồng đăng nhập/đăng ký đã viết theo chuẩn Supabase SSR nhưng **chưa được kiểm thử với một dự án Supabase thật**.
