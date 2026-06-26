import { ThemeProvider } from '@/lib/hooks/use-theme';
import { AvaProvider } from '@/components/ava/ava-context';
import { AvaAuthProvider } from '@/components/ava/ava-auth-context';
import { AvaLayoutManager } from '@/components/ava/ava-layout-manager';

export default function AvaLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AvaAuthProvider>
        <AvaProvider>
          <AvaLayoutManager>{children}</AvaLayoutManager>
        </AvaProvider>
      </AvaAuthProvider>
    </ThemeProvider>
  );
}
