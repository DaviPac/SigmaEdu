'use client';

import AvaTopbar from './ava-topbar';
import AvaSidebar from './ava-sidebar';

export default function AvaShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-950">
      <AvaTopbar />
      <div className="flex flex-1 overflow-hidden" style={{ display: 'grid', gridTemplateColumns: '176px 1fr' }}>
        <AvaSidebar />
        <main className="overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
