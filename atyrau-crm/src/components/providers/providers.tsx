'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { NotificationProvider } from '@/components/providers/NotificationProvider';
import NotificationContainer from '@/components/organisms/NotificationContainer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <NotificationProvider>
          {children}
          <NotificationContainer />
        </NotificationProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

