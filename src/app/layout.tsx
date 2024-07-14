import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';
import { ThemeProvider } from '@/app/_components/ThemeProvider';
import { ModeToggle } from '@/app/_components/ModeToggle';
import { UserId } from '@/app/_components/UserId';
import { cookies } from 'next/headers';
import { drizzle } from 'drizzle-orm/d1';
import { Users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { Toaster } from '@/components/ui/sonner';
import Script from 'next/script';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Authenticator Bingo',
  description:
    'Authenticator Bingoは、Authenticatorアプリに表示される2桁の数字を使って遊ぶ、楽しいビンゴゲームです。',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const userId = cookieStore.get('userId')?.value ?? '';
  const db = drizzle(process.env.DB);

  const user = await db
    .select()
    .from(Users)
    .where(eq(Users.user_id, userId))
    .get();

  return (
    <>
      <html lang="ja" suppressHydrationWarning>
        <body
          className={cn(
            'mb-12 min-h-screen bg-background font-sans antialiased',
            fontSans.variable,
          )}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="m-auto w-full max-w-4xl px-4">
              <div className="grid grid-flow-col items-center justify-between py-4 sm:py-6">
                <Link href="/">
                  <p className="text-lg font-bold leading-tight sm:text-2xl">
                    Authenticator Bingo
                  </p>
                </Link>
                <div className="grid grid-flow-col items-center gap-4">
                  <UserId userId={userId} user={user} />
                  <ModeToggle />
                </div>
              </div>
              {children}
            </div>
            <Toaster />
          </ThemeProvider>
          <Script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={`{"token": "${process.env.CF_BEACON_TOKEN}"}`}
          ></Script>
        </body>
      </html>
    </>
  );
}
