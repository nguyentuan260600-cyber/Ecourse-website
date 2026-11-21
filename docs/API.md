# API

## Route handlers
| Route | Method | Mô tả |
| --- | --- | --- |
| `/auth/confirm` | GET | Xác minh `token_hash`/`code` từ email Supabase rồi chuyển tới `next` (đã lọc open redirect) |
| `/sitemap.xml`, `/robots.txt` | GET | SEO |

## Server actions
| Action | File | Quyền |
| --- | --- | --- |
| `loginAction`, `registerAction`, `forgotPasswordAction`, `resetPasswordAction`, `logoutAction` | `features/auth/actions.ts` | Công khai / người dùng |
| `toggleWishlist(courseId)` | `features/wishlist/actions.ts` | Đã đăng nhập (RLS `wishlists_self`) |
| `quoteCart(slugs)` | `features/cart/actions.ts` | Công khai; giá lấy từ DB |
| `subscribeNewsletter` | `features/newsletter/actions.ts` | Công khai (chỉ INSERT) |

## Dự kiến
`POST /api/webhooks/payos` (đã loại khỏi matcher của proxy), `POST /api/learn/playback-token`, `POST /api/learn/progress`.
