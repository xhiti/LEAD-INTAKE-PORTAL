import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Lead Intake Portal',
  description: 'AI-powered business lead intake and management portal',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning className={cn('antialiased font-sans h-full overflow-hidden', poppins.variable)}>
      <body className="font-sans antialiased h-full overflow-hidden">{children}</body>
    </html>
  )
}
