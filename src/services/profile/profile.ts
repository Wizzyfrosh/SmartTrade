import { apiFetch } from "../auth/api";

export interface SmartTradeProfile {
  businessName: string;
  countryCode: string;
  currencyCode: string;
  avatarObjectKey: string | null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(path, init);
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || "Profile request failed");
  return payload as T;
}

export const profileService = {
  get(): Promise<SmartTradeProfile> {
    return request<SmartTradeProfile>("/api/profile");
  },
  update(patch: Partial<Pick<SmartTradeProfile, "businessName" | "countryCode" | "currencyCode" | "avatarObjectKey">>): Promise<SmartTradeProfile> {
    return request<SmartTradeProfile>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },
  async getPrivateImageUrl(objectKey: string): Promise<string> {
    const result = await request<{ url: string }>("/api/storage/download-url?key=" + encodeURIComponent(objectKey));
    return result.url;
  },
  async createImageUpload(contentType: string, sizeBytes: number, target: "avatar" | "product", productId?: string) {
    if (!Number.isSafeInteger(sizeBytes) || sizeBytes <= 0 || sizeBytes > 5 * 1024 * 1024) {
      throw new Error("Image must be between 1 byte and 5 MB");
    }
    return request<{ uploadUrl: string; objectKey: string; expiresIn: number }>("/api/storage/upload-url", {
      method: "POST",
      body: JSON.stringify({ contentType, sizeBytes, target, productId }),
    });
  },
};
