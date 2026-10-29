import './globals.css';
import type { ReactNode } from 'react';
import { AuthProvider } from '../lib/auth';
import Nav from './nav';

export const metadata = {
  title: '모아공방 장비 대여',
  description: '공유 작업실 장비 예약과 문의',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <Nav />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
