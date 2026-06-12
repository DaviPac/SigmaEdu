import { ThemeProvider } from '@/lib/hooks/use-theme';
import { AvaProvider } from '@/components/ava/ava-context';
import AvaShell from '@/components/ava/ava-shell';

export default function AvaLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AvaProvider>
        <AvaShell>{children}</AvaShell>
      </AvaProvider>
    </ThemeProvider>
  );
}
