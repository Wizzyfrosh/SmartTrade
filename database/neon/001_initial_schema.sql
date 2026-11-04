-- SmartTrade core application schema for self-hosted Better Auth on Neon.
-- This migration creates business tables only. Better Auth tables and server-side
-- RLS policies are created by 002_better_auth_and_rls.sql.

CREATE TABLE public.products (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  name text NOT NULL,
  sku text,
  category text,
  cost_price numeric(14,2) NOT NULL CHECK (cost_price >= 0),
  selling_price numeric(14,2) NOT NULL CHECK (selling_price >= 0),
  stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  low_stock_threshold integer NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
  barcode text,
  image_url text,
  image_object_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_user_sku_unique UNIQUE (user_id, sku)
);

CREATE TABLE public.sales (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(14,2) NOT NULL CHECK (unit_price >= 0),
  cost_price numeric(14,2) NOT NULL CHECK (cost_price >= 0),
  total_revenue numeric(14,2) NOT NULL CHECK (total_revenue >= 0),
  total_cost numeric(14,2) NOT NULL CHECK (total_cost >= 0),
  profit numeric(14,2) NOT NULL,
  sale_date bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_user_created ON public.products(user_id, created_at DESC);
CREATE INDEX idx_products_user_category ON public.products(user_id, category);
CREATE INDEX idx_products_user_stock ON public.products(user_id, stock_quantity);
CREATE INDEX idx_sales_user_date ON public.sales(user_id, sale_date DESC);
CREATE INDEX idx_sales_product ON public.sales(product_id);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
