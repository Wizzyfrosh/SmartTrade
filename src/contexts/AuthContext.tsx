import React, { createContext, useContext } from "react";
import { authClient, AuthSession } from "../services/auth/client";

type AuthContextType = {
  user: AuthSession["user"] | null;
  session: AuthSession | null;
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
  const { data: session, isPending } = authClient.useSession();

  const value: AuthContextType = {
    user: session?.user ?? null,
    session: session ?? null,
    loading: isPending,
    isAdmin: false,
    signOut: async () => {
      const result = await authClient.signOut();
      if (result.error) throw new Error(result.error.message);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
