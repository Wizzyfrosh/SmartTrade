-- Stock changes are immutable, idempotent inventory events.
-- Apply through the reviewed production migration process; do not run ad hoc.
CREATE TABLE IF NOT EXISTS public.inventory_adjustments (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity_delta integer NOT NULL CHECK (quantity_delta <> 0),
  reason text NOT NULL DEFAULT 'manual_adjustment'
    CHECK (reason IN ('manual_adjustment', 'correction', 'damage', 'return', 'opening_balance')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inventory_adjustments_user_product_created_idx
  ON public.inventory_adjustments (user_id, product_id, created_at DESC);

ALTER TABLE public.inventory_adjustments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inventory_adjustments_server_user_scope
  ON public.inventory_adjustments;

CREATE POLICY inventory_adjustments_server_user_scope
  ON public.inventory_adjustments
  FOR ALL TO smarttrade_app
  USING (user_id = public.smarttrade_current_user_id())
  WITH CHECK (user_id = public.smarttrade_current_user_id());

GRANT SELECT, INSERT ON public.inventory_adjustments TO smarttrade_app;
