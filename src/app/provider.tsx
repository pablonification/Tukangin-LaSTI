'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { ModalProvider } from '@/app/components/ModalProvider';
import { NotificationProvider } from '@/app/components/NotificationProvider';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ModalProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ModalProvider>
    </SessionProvider>
  );
}
