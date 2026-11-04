-- Remove the remaining Neon Managed Auth defaults.
-- SmartTrade now supplies user_id from a verified Better Auth session in the API.
ALTER TABLE public.products ALTER COLUMN user_id DROP DEFAULT;
ALTER TABLE public.sales ALTER COLUMN user_id DROP DEFAULT;
