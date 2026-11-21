# Kiến trúc

**Modular monolith** trên Next.js 16 App Router. Không microservice.

```
src/
├── app/                    # Route (presentation)
│   ├── (marketing)/        # Trang công khai: /, /courses, /courses/[slug], /categories, /instructors, /cart, /certificates/verify
│   ├── (auth)/             # /login, /register, /forgot-password, /reset-password
│   ├── (student)/          # /dashboard (bảo vệ phía server)
│   ├── auth/confirm/       # Route handler xác nhận email / khôi phục mật khẩu
│   ├── sitemap.ts, robots.ts
├── components/             # UI thuần: ui/ (design system), layout/, home/, catalog/, courses/, cart/, auth/
├── features/               # Nghiệp vụ theo domain
│   ├── auth/               # session.ts (Data Access Layer), actions.ts (server actions), schemas.ts (Zod)
│   ├── courses/            # types.ts, repository.ts (adapter Supabase | demo), filter.ts, fixtures.ts (dev)
│   ├── cart/               # guest-cart (client, chỉ lưu slug), actions.ts (báo giá server-side), pricing.ts
│   ├── wishlist/, newsletter/
├── lib/                    # supabase/ (server, browser, admin, proxy-session), security/, utils/, env
├── config/site.ts
└── proxy.ts                # (Next 16: thay middleware) làm mới phiên Supabase + chuyển hướng lạc quan
supabase/
├── migrations/             # 6 migration: identity, catalog, commerce, learning, community/admin, RLS
├── seed.sql                # CHỈ cho dev (sinh từ fixtures)
└── tests/                  # stub Supabase + policy_test.sql
```

## Phân lớp

| Lớp | Nơi | Quy tắc |
| --- | --- | --- |
| Presentation | `app/`, `components/` | Không truy vấn DB trực tiếp (trừ trang dashboard dùng client RLS) |
| Application | `features/*/actions.ts` | Server Action: validate Zod → gọi repository → trả state |
| Domain | `features/*/types.ts`, `filter.ts`, `pricing.ts` | Hàm thuần, có unit test |
| Persistence | `features/*/repository.ts`, `lib/supabase` | Một interface, hai adapter |

## Nguồn dữ liệu

`features/courses/repository.ts` chọn adapter lúc khởi động:
- **supabase** khi có `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` — đọc view `course_cards` (một truy vấn cho mọi thẻ khoá học, không N+1), RLS áp dụng.
- **demo** khi thiếu cấu hình — chỉ có khung danh mục từ `fixtures.ts` (không có khoá học, giảng viên, đánh giá), banner "Dữ liệu mẫu" luôn hiển thị. Không bao giờ dùng trong production.

## Rendering

`cacheComponents` đang **tắt** (Next 16 bật mặc định khi scaffold). Lý do: phần lớn trang đọc phiên Supabase (cookie) hoặc bộ lọc URL lúc request. Trang công khai được prerender khi có thể; trang bảo vệ gọi `connection()` trong `requireUser()` để luôn render theo request. Có thể bật lại Cache Components sau khi tách phần đọc phiên vào `<Suspense>` (header đã làm vậy).

## Luồng xác thực

1. Server Action `loginAction` → `supabase.auth.signInWithPassword` → cookie phiên (qua `@supabase/ssr`).
2. `proxy.ts` gọi `getClaims()` mỗi request để làm mới token; chuyển hướng lạc quan khỏi trang riêng tư.
3. Trang riêng tư gọi `requireUser()` / `requireRole()` (DAL) — **kiểm tra thật sự** ở server, vai trò đọc từ `user_roles`.
4. Postgres RLS là lớp bảo vệ cuối cùng.

## Luồng sắp triển khai (thiết kế đã chốt trong schema)

- **Thanh toán**: tạo `orders` + `order_items` (giá snapshot, tính server) → `payments` (PayOS) → webhook xác thực chữ ký → ghi `payment_events` (unique `provider,event_id` ⇒ idempotent) → trong một transaction: `orders.status='paid'`, insert `access_grants` (unique theo đơn) + `enrollments` (unique user/course) + `email_outbox`.
- **Video**: server kiểm `has_course_access` + bài thuộc khoá → ký token Bunny ngắn hạn. `lessons.bunny_video_id` không đọc được qua API.
