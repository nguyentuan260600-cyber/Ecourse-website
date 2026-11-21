-- =====================================================================
-- 0003 · Commerce: carts, coupons, orders, payments, refunds
-- All money is BIGINT VND. Orders/payments are written ONLY by trusted
-- server code (service role) — users may read their own rows.
-- =====================================================================

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  coupon_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger carts_updated_at before update on public.carts
  for each row execute function public.set_updated_at();

create table public.cart_items (
  cart_id uuid not null references public.carts(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (cart_id, course_id) -- prevents duplicate cart items
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9_-]{3,40}$'),
  description text not null default '',
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value bigint not null check (discount_value > 0),
  max_discount_vnd bigint check (max_discount_vnd is null or max_discount_vnd > 0),
  min_order_vnd bigint not null default 0 check (min_order_vnd >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  max_redemptions int check (max_redemptions is null or max_redemptions > 0),
  max_redemptions_per_user int not null default 1 check (max_redemptions_per_user > 0),
  redemption_count int not null default 0 check (redemption_count >= 0),
  applies_to_all_courses boolean not null default true,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (discount_type <> 'percent' or discount_value <= 100),
  check (expires_at is null or starts_at is null or expires_at > starts_at),
  check (max_redemptions is null or redemption_count <= max_redemptions)
);
create trigger coupons_updated_at before update on public.coupons
  for each row execute function public.set_updated_at();

create table public.coupon_courses (
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  primary key (coupon_id, course_id)
);

create sequence public.order_number_seq start 100001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  order_number text not null unique default ('KS' || nextval('public.order_number_seq')),
  subtotal_vnd bigint not null check (subtotal_vnd >= 0),
  discount_vnd bigint not null default 0 check (discount_vnd >= 0),
  total_vnd bigint not null check (total_vnd >= 0),
  currency text not null default 'VND' check (currency = 'VND'),
  coupon_id uuid references public.coupons(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending','paid','cancelled','expired','refunded','partially_refunded')),
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  check (total_vnd = subtotal_vnd - discount_vnd),
  check (status <> 'paid' or paid_at is not null)
);
create index orders_user_idx on public.orders(user_id, created_at desc);
create index orders_status_idx on public.orders(status, created_at desc);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  course_title_snapshot text not null,
  original_price_vnd bigint not null check (original_price_vnd >= 0),
  discount_vnd bigint not null default 0 check (discount_vnd >= 0),
  final_price_vnd bigint not null check (final_price_vnd >= 0),
  unique (order_id, course_id),
  check (final_price_vnd = original_price_vnd - discount_vnd)
);
create index order_items_course_idx on public.order_items(course_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  provider text not null check (provider in ('payos','sandbox','free')),
  provider_order_code bigint not null,
  provider_transaction_id text,
  checkout_url text,
  amount_vnd bigint not null check (amount_vnd >= 0),
  status text not null default 'pending' check (status in ('pending','succeeded','failed','cancelled','expired','refunded')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unique (provider, provider_order_code)
);
create unique index payments_provider_txn_uidx on public.payments(provider, provider_transaction_id)
  where provider_transaction_id is not null;
create index payments_order_idx on public.payments(order_id);

-- Every webhook delivery is recorded; (provider, event_id) makes processing idempotent.
create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  payment_id uuid references public.payments(id) on delete set null,
  raw_payload jsonb not null,
  verification_status text not null check (verification_status in ('verified','invalid_signature','amount_mismatch','unknown_order','duplicate')),
  processed_at timestamptz not null default now(),
  unique (provider, event_id)
);

create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null unique references public.orders(id) on delete cascade,
  discount_vnd bigint not null check (discount_vnd >= 0),
  redeemed_at timestamptz not null default now()
);
create index coupon_redemptions_coupon_user_idx on public.coupon_redemptions(coupon_id, user_id);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  order_item_id uuid references public.order_items(id) on delete restrict,
  amount_vnd bigint not null check (amount_vnd > 0),
  reason text not null check (char_length(reason) between 3 and 1000),
  status text not null default 'requested' check (status in ('requested','approved','rejected','completed')),
  requested_by uuid references auth.users(id) on delete set null,
  processed_by uuid references auth.users(id) on delete set null,
  provider_reference text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
create index refunds_order_idx on public.refunds(order_id);
