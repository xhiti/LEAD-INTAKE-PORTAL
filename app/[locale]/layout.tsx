import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { notFound } from 'next/navigation'
import { Poppins } from 'next/font/google'
import { cn } from '@/lib/utils'
import '../globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

const locales = ['en', 'fr', 'es', 'sq']

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const { locale } = await Promise.resolve(params)

  if (!locales.includes(locale)) notFound()

  const messages = await getMessages()

  return (
    <html lang={locale} className={cn('antialiased font-sans h-full overflow-hidden', poppins.variable)} suppressHydrationWarning>
      <body className="font-sans antialiased h-full overflow-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
