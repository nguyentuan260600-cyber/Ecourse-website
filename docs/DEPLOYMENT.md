# Triển khai

1. **Supabase**: tạo project → `supabase db push` → cấu hình Auth (Site URL, Redirect URLs `https://<domain>/auth/confirm`, email templates như README). Không chạy `seed.sql` ở production (seed tự từ chối khi `app.environment = 'production'`: `alter database postgres set app.environment = 'production';`).
2. **Vercel**: import repo, Node 24, đặt biến môi trường theo `.env.example` (service role/PayOS/Cloudflare/Brevo chỉ ở môi trường Server).
3. **CI**: `.github/workflows/ci.yml` chạy lint, typecheck, unit test, test chính sách DB và build.
4. Tạo super admin: `node scripts/create-admin.mjs <email>` với service role key từ máy quản trị.

Cloudflare Stream: xem README mục "Video". PayOS, Brevo: hướng dẫn sẽ bổ sung khi tích hợp (Milestone 3).
