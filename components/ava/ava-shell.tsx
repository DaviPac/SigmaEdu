'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import AvaTopbar from './ava-topbar';
import AvaSidebar from './ava-sidebar';

type AvaLayoutContextType = {
  isGlobalSidebarOpen: boolean;
  toggleGlobalSidebar: () => void;
};

export const AvaLayoutContext = createContext<AvaLayoutContextType>({
  isGlobalSidebarOpen: true,
  toggleGlobalSidebar: () => {},
});

export const useAvaLayout = () => useContext(AvaLayoutContext);

/** Componente shell do AVA — gerencia layout e trava o scroll do documento. */
export default function AvaShell({ children }: { children: React.ReactNode }) {
  const [isGlobalSidebarOpen, setIsGlobalSidebarOpen] = useState(true);

  // Adiciona classe no <html> que trava overflow via CSS (antes da pintura, sem flash)
  useEffect(() => {
    document.documentElement.classList.add('ava-shell-page');
    return () => {
      document.documentElement.classList.remove('ava-shell-page');
    };
  }, []);

  return (
    <AvaLayoutContext.Provider value={{ isGlobalSidebarOpen, toggleGlobalSidebar: () => setIsGlobalSidebarOpen((prev) => !prev) }}>
      <div className="h-screen flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-950">
        <AvaTopbar />
        <div className="flex flex-1 overflow-hidden min-h-0 relative">
          <div
            className={`flex-shrink-0 transition-all duration-300 overflow-hidden border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 ${
              isGlobalSidebarOpen ? 'w-[176px]' : 'w-0 border-r-0'
            }`}
          >
            <div className="w-[176px] h-full flex flex-col">
              <AvaSidebar />
            </div>
          </div>
          <main className="flex-1 overflow-y-auto p-4 min-h-0 bg-gray-100 dark:bg-gray-950">{children}</main>
        </div>
      </div>
    </AvaLayoutContext.Provider>
  );
}
