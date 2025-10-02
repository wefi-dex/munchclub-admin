import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { SuppressHydrationWarning } from '@/components/SuppressHydrationWarning'
import { PreventExtensionModification } from '@/components/PreventExtensionModification'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Munchclub Admin Dashboard',
  description: 'Admin dashboard for The Munchclub platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body className={`${inter.className} h-full antialiased overflow-hidden`} suppressHydrationWarning>
        <SuppressHydrationWarning />
        <PreventExtensionModification />
        <div className="flex h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" suppressHydrationWarning>
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 animate-fade-in">
              <div className="max-w-9xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}