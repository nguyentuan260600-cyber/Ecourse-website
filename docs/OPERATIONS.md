# Vận hành

- **Sao lưu**: bật Point-in-Time Recovery của Supabase (gói Pro); thêm `pg_dump` hằng ngày lưu ngoài Supabase.
- **Khôi phục**: thử khôi phục định kỳ vào project staging; kiểm tra `npm run test:db` không phụ thuộc dữ liệu.
- **Email**: `email_outbox` gửi lại với `attempts`/`next_attempt_at` — lỗi Brevo không làm hỏng giao dịch.
- **Sự cố thanh toán**: đối soát `payments` ↔ `payment_events`; mọi thao tác thủ công về tiền/quyền phải đi qua hàm có ghi `audit_logs`.
- **Giám sát**: `app/error.tsx` là điểm gắn Sentry (Milestone 6).
