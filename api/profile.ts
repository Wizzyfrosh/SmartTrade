import { requireAuth } from "../src/lib/require-auth";
import { withUserTransaction } from "../src/lib/db";
import { verifyPrivateImageObject } from "../src/lib/storage";

function send(res: any, status: number, body: unknown) {
  return res.status(status).json(body);
}

export default async function handler(req: any, res: any) {
  const session = await requireAuth(req, res);
  if (!session) return;
  const userId = session.user.id;

  try {
    if (req.method === "GET") {
      const profile = await withUserTransaction(userId, async (db) => {
        const result = await db.query(
          "SELECT business_name, country_code, currency_code, avatar_object_key FROM public.smarttrade_profiles WHERE user_id = $1",
          [userId],
        );
        return result.rows[0] ?? null;
      });
      return send(res, 200, {
        businessName: profile?.business_name ?? "",
        countryCode: profile?.country_code ?? "NG",
        currencyCode: profile?.currency_code ?? "NGN",
        avatarObjectKey: profile?.avatar_object_key ?? null,
      });
    }

    if (req.method === "PATCH") {
      const body = req.body ?? {};
      const businessName = body.businessName === undefined ? undefined
        : typeof body.businessName === "string" ? body.businessName.trim() : null;
      const countryCode = body.countryCode === undefined ? undefined
        : typeof body.countryCode === "string" ? body.countryCode.toUpperCase() : null;
      const currencyCode = body.currencyCode === undefined ? undefined
        : typeof body.currencyCode === "string" ? body.currencyCode.toUpperCase() : null;
      const avatarObjectKey = body.avatarObjectKey === undefined ? undefined
        : typeof body.avatarObjectKey === "string" ? body.avatarObjectKey : null;

      if (businessName === null || (businessName && businessName.length > 120))
        return send(res, 400, { error: "Business name must be 120 characters or fewer" });
      if (countryCode !== undefined && (countryCode === null || !/^[A-Z]{2}$/.test(countryCode)))
        return send(res, 400, { error: "Country code must be a two-letter code" });
      if (currencyCode !== undefined && (currencyCode === null || !/^[A-Z]{3}$/.test(currencyCode)))
        return send(res, 400, { error: "Currency code must be a three-letter code" });
      if (avatarObjectKey !== undefined && (avatarObjectKey === null || !avatarObjectKey.startsWith(`users/${userId}/avatar/`) || avatarObjectKey.length > 1024))
        return send(res, 400, { error: "Invalid avatar image key" });
      if (avatarObjectKey !== undefined && !(await verifyPrivateImageObject(avatarObjectKey, `users/${userId}/avatar/`)))
        return send(res, 400, { error: "Avatar upload is missing, invalid or exceeds 5 MB" });

      const profile = await withUserTransaction(userId, async (db) => {
        const result = await db.query(
          `INSERT INTO public.smarttrade_profiles
            (user_id, business_name, country_code, currency_code, avatar_object_key, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,NOW(),NOW())
           ON CONFLICT (user_id) DO UPDATE SET
             business_name = COALESCE(EXCLUDED.business_name, public.smarttrade_profiles.business_name),
             country_code = COALESCE(EXCLUDED.country_code, public.smarttrade_profiles.country_code),
             currency_code = COALESCE(EXCLUDED.currency_code, public.smarttrade_profiles.currency_code),
             avatar_object_key = COALESCE(EXCLUDED.avatar_object_key, public.smarttrade_profiles.avatar_object_key),
             updated_at = NOW()
           RETURNING business_name, country_code, currency_code, avatar_object_key`,
          [userId, businessName ?? null, countryCode ?? null, currencyCode ?? null, avatarObjectKey ?? null],
        );
        return result.rows[0];
      });
      return send(res, 200, {
        businessName: profile.business_name ?? "",
        countryCode: profile.country_code ?? "NG",
        currencyCode: profile.currency_code ?? "NGN",
        avatarObjectKey: profile.avatar_object_key ?? null,
      });
    }

    res.setHeader("Allow", "GET, PATCH");
    return send(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error("Profile API error", error);
    return send(res, 500, { error: "Unable to process profile request" });
  }
}
