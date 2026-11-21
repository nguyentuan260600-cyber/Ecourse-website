# Khai Sáng — Kế hoạch triển khai (TASKS.md)

Nền tảng bán khoá học trực tuyến + LMS. Kiến trúc: **modular monolith** trên Next.js 16 (App Router) + Supabase.
Thiết kế lấy từ dự án Stitch "Premium EdTech Marketplace & LMS" (3 màn: Trang chủ, Danh mục, Chi tiết khoá học).

Trạng thái: `[x]` xong & đã kiểm tra · `[~]` có code, chưa kiểm chứng với dịch vụ thật · `[ ]` chưa làm

## Milestone 0 — Khảo sát & kiến trúc
- [x] Khảo sát repo: `englishhub` là ứng dụng Vite khác → dựng dự án mới tại `~/Downloads/khaisang`
- [x] Tải thiết kế Stitch (HTML + ảnh) và trích design tokens
- [x] TASKS.md, docs/ARCHITECTURE.md, docs/DATABASE.md

## Milestone 1 — Design system & website công khai
- [x] Design tokens (màu, chữ, bo góc, bóng) + dark mode
- [x] Component UI dùng chung: Button, Badge, Input, Select, Card, Progress, Skeleton, EmptyState, Pagination, Rating, Accordion
- [x] Header dính (sticky) + menu mobile, Footer
- [x] Trang chủ: hero, tìm kiếm, danh mục bento, khoá học nổi bật (tab), lộ trình, lý do chọn, quy trình, FAQ, newsletter
- [x] Danh mục khoá học: tìm kiếm, lọc cấp độ/giá/miễn phí/đánh giá/thời lượng/danh mục, sắp xếp, phân trang (server-side, theo URL)
- [x] Chi tiết khoá học: tổng quan, mục tiêu, giáo trình (accordion), giảng viên, đánh giá, giá/giảm giá, khoá liên quan, CTA
- [x] Trang giảng viên, trang danh mục, xác thực chứng chỉ (khung)
- [x] SEO: metadata động, canonical, sitemap.xml, robots.txt, JSON-LD Course
- [x] Trạng thái loading / not-found / error

## Milestone 2 — Cơ sở dữ liệu & xác thực
- [x] Migration lõi: identity, roles, catalog, commerce, learning, assessments, certificates, community, admin
- [x] RLS cho mọi bảng; role lấy từ `user_roles` (không phải cột client sửa được)
- [x] seed.sql chỉ cho môi trường dev
- [~] Supabase Auth (SSR): đăng ký, đăng nhập, đăng xuất, quên/đặt lại mật khẩu, xác thực email — cần dự án Supabase để kiểm tra end-to-end
- [~] `proxy.ts` làm mới phiên; bảo vệ trang riêng tư phía server
- [ ] Google OAuth (cần cấu hình provider)
- [ ] MFA cho admin
- [~] Script tạo Super Admin đầu tiên (`scripts/create-admin.mjs`) — cần chạy với service role thật

## Milestone 3 — Thương mại
- [x] Giỏ hàng khách (localStorage chỉ lưu slug; giá báo lại server-side, chặn trùng)
- [ ] Giỏ hàng DB cho người dùng đăng nhập + gộp giỏ khách khi đăng nhập
- [ ] Coupon (kiểm tra server-side)
- [ ] Tạo đơn hàng, giá tính server-side
- [ ] PayOS checkout + webhook xác thực chữ ký, idempotent
- [ ] Cấp `access_grants` + `enrollments` nguyên tử khi thanh toán xác nhận
- [ ] Lịch sử đơn hàng, hoàn tiền

## Milestone 4 — LMS
- [ ] Dashboard học viên (dữ liệu thật)
- [ ] Bunny Stream: token phát video ngắn hạn sau khi kiểm tra quyền
- [ ] Trình phát + giáo trình + lưu tiến độ (debounce)
- [ ] Ghi chú, quiz, bài tập, chứng chỉ PDF + trang xác thực

## Milestone 5 — Giảng viên & Admin
- [ ] Soạn khoá học, sắp xếp chương/bài, upload video
- [ ] Duyệt khoá học, quản lý học viên, đơn hàng, hoàn tiền, coupon
- [ ] Analytics (Recharts), hỗ trợ, audit log UI

## Milestone 6 — Production hardening
- [x] Test chính sách DB (20 ca, PGlite) + unit test (26 ca) + GitHub Actions CI
- [ ] Playwright E2E, test webhook
- [ ] Rate limiting, Sentry, CSP
- [ ] Tài liệu triển khai đầy đủ

## Bước tiếp theo chính xác
- [x] Dự án Supabase `khaisang` (ap-southeast-1) đã tạo, chạy 7 migration + dữ liệu mẫu; website đọc dữ liệu thật.
1. Cấu hình Auth trên dashboard: Redirect URLs, SMTP (Brevo) để gửi email xác nhận cho mọi địa chỉ.
2. Đăng ký tài khoản thật → cấp super_admin.
3. Bắt đầu Milestone 3: giỏ hàng DB, coupon, PayOS.
