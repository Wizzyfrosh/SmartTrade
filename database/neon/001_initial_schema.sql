-- SmartTrade initial Neon schema
-- Applied to Neon project raspy-glade-89903893 / branch br-red-unit-ba6pu440.
-- Keep this migration in source control. Apply only to a fresh branch/database.

CREATE TABLE public.products (
  id text PRIMARY KEY,
  user_id text NOT NULL DEFAULT auth.user_id(),
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
  user_id text NOT NULL DEFAULT auth.user_id(),
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

CREATE TABLE public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES neon_auth."user"(id) ON DELETE CASCADE,
  email text,
  full_name text,
  business_name text,
  country_code text,
  currency_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_user_created ON public.products(user_id, created_at DESC);
CREATE INDEX idx_products_user_category ON public.products(user_id, category);
CREATE INDEX idx_products_user_stock ON public.products(user_id, stock_quantity);
CREATE INDEX idx_sales_user_date ON public.sales(user_id, sale_date DESC);
CREATE INDEX idx_sales_product ON public.sales(product_id);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY products_select_own ON public.products
  FOR SELECT TO authenticated USING ((select auth.user_id()) = user_id);
CREATE POLICY products_insert_own ON public.products
  FOR INSERT TO authenticated WITH CHECK ((select auth.user_id()) = user_id);
CREATE POLICY products_update_own ON public.products
  FOR UPDATE TO authenticated USING ((select auth.user_id()) = user_id)
  WITH CHECK ((select auth.user_id()) = user_id);
CREATE POLICY products_delete_own ON public.products
  FOR DELETE TO authenticated USING ((select auth.user_id()) = user_id);

CREATE POLICY sales_select_own ON public.sales
  FOR SELECT TO authenticated USING ((select auth.user_id()) = user_id);
CREATE POLICY sales_insert_own ON public.sales
  FOR INSERT TO authenticated WITH CHECK ((select auth.user_id()) = user_id);
CREATE POLICY sales_update_own ON public.sales
  FOR UPDATE TO authenticated USING ((select auth.user_id()) = user_id)
  WITH CHECK ((select auth.user_id()) = user_id);
CREATE POLICY sales_delete_own ON public.sales
  FOR DELETE TO authenticated USING ((select auth.user_id()) = user_id);

CREATE POLICY profiles_select_own ON public.user_profiles
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY profiles_insert_own ON public.user_profiles
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY profiles_update_own ON public.user_profiles
  FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- A sale is a single transaction: lock stock row, validate ownership and
-- available quantity, decrement stock, then create the sale.
CREATE FUNCTION public.create_sale(
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
  IF auth.user_id() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '28000';
  END IF;
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than zero' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO v_product
  FROM public.products
  WHERE id = p_product_id AND user_id = auth.user_id()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found' USING ERRCODE = 'P0002';
  END IF;
  IF v_product.stock_quantity < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock' USING ERRCODE = '23514';
  END IF;

  UPDATE public.products
  SET stock_quantity = stock_quantity - p_quantity, updated_at = now()
  WHERE id = p_product_id AND user_id = auth.user_id();

  INSERT INTO public.sales (
    id, user_id, product_id, quantity, unit_price, cost_price,
    total_revenue, total_cost, profit, sale_date
  ) VALUES (
    p_id, auth.user_id(), p_product_id, p_quantity, p_unit_price, p_cost_price,
    p_total_revenue, p_total_cost, p_profit, p_sale_date
  )
  RETURNING * INTO v_sale;

  RETURN v_sale;
END;
$$;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products, public.sales TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_sale(
  text, text, integer, numeric, numeric, numeric, numeric, numeric, bigint
) TO authenticated;
