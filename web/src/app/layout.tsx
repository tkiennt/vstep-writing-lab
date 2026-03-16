import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { GlobalProvider } from '@/components/GlobalProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VSTEP Writing Lab - AI-Powered Writing Practice',
  description: 'Practice VSTEP writing and get instant AI feedback tailored to VSTEP scoring criteria.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalProvider>
           {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
