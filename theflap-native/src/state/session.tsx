import React, { createContext, useContext, useEffect, useState } from 'react';
import { FlapUser, restoreSession, logout as doLogout } from '../lib/auth';

type Ctx = {
  user: FlapUser | null;
  loading: boolean;
  setUser: (u: FlapUser | null) => void;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<Ctx>({
  user: null,
  loading: true,
  setUser: () => {},
  signOut: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FlapUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession()
      .then((u) => setUser(u))
      .finally(() => setLoading(false));
  }, []);

  const signOut = async () => {
    await doLogout();
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ user, loading, setUser, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
