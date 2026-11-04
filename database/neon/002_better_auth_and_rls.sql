-- SmartTrade self-hosted Better Auth schema and API-enforced row-level security.
-- Run after 001_initial_schema.sql on a fresh Neon database.

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
CREATE UNIQUE INDEX IF NOT EXISTS account_provider_account_unique
  ON public."account"("providerId", "accountId");
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

-- The API sets this transaction-local value only after Better Auth validates
-- the session. It is never accepted from request JSON or client input.
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

DROP POLICY IF EXISTS products_server_user_scope ON public.products;
CREATE POLICY products_server_user_scope ON public.products
  FOR ALL TO smarttrade_app
  USING (user_id = public.smarttrade_current_user_id())
  WITH CHECK (user_id = public.smarttrade_current_user_id());

DROP POLICY IF EXISTS sales_server_user_scope ON public.sales;
CREATE POLICY sales_server_user_scope ON public.sales
  FOR ALL TO smarttrade_app
  USING (user_id = public.smarttrade_current_user_id())
  WITH CHECK (user_id = public.smarttrade_current_user_id());

DROP POLICY IF EXISTS profiles_server_user_scope ON public.smarttrade_profiles;
CREATE POLICY profiles_server_user_scope ON public.smarttrade_profiles
  FOR ALL TO smarttrade_app
  USING (user_id = public.smarttrade_current_user_id())
  WITH CHECK (user_id = public.smarttrade_current_user_id());

GRANT USAGE ON SCHEMA public TO smarttrade_app, smarttrade_auth;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products, public.sales,
  public.smarttrade_profiles TO smarttrade_app;
GRANT EXECUTE ON FUNCTION public.smarttrade_current_user_id() TO smarttrade_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON public."user", public."session",
  public."account", public."verification" TO smarttrade_auth;
