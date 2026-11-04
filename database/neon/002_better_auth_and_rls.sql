-- SmartTrade Better Auth + API-owned row-level security
-- Run after 001_initial_schema.sql. Does not remove existing Supabase-era tables.

CREATE TABLE IF NOT EXISTS public."user" (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  image text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."session" (
  id text PRIMARY KEY,
  "expiresAt" timestamptz NOT NULL,
  token text NOT NULL UNIQUE,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public."account" (
  id text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."verification" (
  id text PRIMARY KEY,
  identifier text NOT NULL,
  value text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_user_id ON public."session"("userId");
CREATE INDEX IF NOT EXISTS idx_account_user_id ON public."account"("userId");
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON public."verification"(identifier);

CREATE TABLE IF NOT EXISTS public.smarttrade_profiles (
  user_id text PRIMARY KEY REFERENCES public."user"(id) ON DELETE CASCADE,
  business_name text,
  country_code text,
  currency_code text,
  avatar_object_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- API requests set this transaction-local value only after Better Auth validates
-- the session cookie. It is intentionally not accepted from request JSON.
CREATE OR REPLACE FUNCTION public.smarttrade_current_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.user_id', true), '')
$$;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smarttrade_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY products_server_user_scope ON public.products
  FOR ALL TO smarttrade_app
  USING (user_id = public.smarttrade_current_user_id())
  WITH CHECK (user_id = public.smarttrade_current_user_id());

CREATE POLICY sales_server_user_scope ON public.sales
  FOR ALL TO smarttrade_app
  USING (user_id = public.smarttrade_current_user_id())
  WITH CHECK (user_id = public.smarttrade_current_user_id());

CREATE POLICY profiles_server_user_scope ON public.smarttrade_profiles
  FOR ALL TO smarttrade_app
  USING (user_id = public.smarttrade_current_user_id())
  WITH CHECK (user_id = public.smarttrade_current_user_id());

CREATE OR REPLACE FUNCTION public.create_sale_for_user(
  p_user_id text,
  p_id text,
  p_product_id text,
  p_quantity integer,
  p_unit_price numeric,
  p_cost_price numeric,
  p_total_revenue numeric,
  p_total_cost numeric,
  p_profit numeric,
  p_sale_date bigint
) RETURNS public.sales
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_product public.products%ROWTYPE;
  v_sale public.sales%ROWTYPE;
BEGIN
  IF p_user_id IS NULL OR p_user_id <> public.smarttrade_current_user_id() THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than zero' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_product
  FROM public.products
  WHERE id = p_product_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_product.stock_quantity < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock' USING ERRCODE = '23514';
  END IF;

  UPDATE public.products
  SET stock_quantity = stock_quantity - p_quantity, updated_at = now()
  WHERE id = p_product_id AND user_id = p_user_id;

  INSERT INTO public.sales (
    id, user_id, product_id, quantity, unit_price, cost_price,
    total_revenue, total_cost, profit, sale_date
  ) VALUES (
    p_id, p_user_id, p_product_id, p_quantity, p_unit_price, p_cost_price,
    p_total_revenue, p_total_cost, p_profit, p_sale_date
  )
  RETURNING * INTO v_sale;

  RETURN v_sale;
END;
$$;

GRANT USAGE ON SCHEMA public TO smarttrade_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON public."user", public."session",
  public."account", public."verification", public.smarttrade_profiles,
  public.products, public.sales TO smarttrade_app;
GRANT EXECUTE ON FUNCTION public.smarttrade_current_user_id() TO smarttrade_app;
GRANT EXECUTE ON FUNCTION public.create_sale_for_user(
  text, text, text, integer, numeric, numeric, numeric, numeric, numeric, bigint
) TO smarttrade_app;
