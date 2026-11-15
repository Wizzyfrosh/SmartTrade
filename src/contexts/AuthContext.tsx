import React, { createContext, useContext } from "react";
import { authClient } from "../services/auth/client";

type AuthContextType = {
  user: typeof authClient.$Infer.Session.user | null;
  session: typeof authClient.$Infer.Session.session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending } = authClient.useSession();

  const value: AuthContextType = {
    user: data?.user ?? null,
    session: data?.session ?? null,
    loading: isPending,
    // Admin authorization must come from a server-verified role, not client metadata.
    isAdmin: false,
    signOut: async () => {
      const result = await authClient.signOut();
      if (result.error) throw new Error(result.error.message);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
