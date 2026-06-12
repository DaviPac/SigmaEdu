'use client';

import { createContext, useContext } from 'react';

type AvaContextValue = Record<string, never>;

const AvaContext = createContext<AvaContextValue>({});

export function AvaProvider({ children }: { children: React.ReactNode }) {
  return <AvaContext.Provider value={{}}>{children}</AvaContext.Provider>;
}

export function useAva() {
  return useContext(AvaContext);
}
