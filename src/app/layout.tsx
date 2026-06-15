import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'Tra cứu Lịch sử Tiêm chủng - CDC Đà Nẵng',
  description: 'Hệ thống tra cứu lịch sử tiêm chủng của khách hàng tại Trung tâm Kiểm soát bệnh tật (CDC) Đà Nẵng.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900 selection:bg-blue-200 selection:text-blue-900 min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
