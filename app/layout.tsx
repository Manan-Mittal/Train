import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LeaveTime',
  description: 'Find your best leave-home transit time with transfer buffers and risk analysis.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
