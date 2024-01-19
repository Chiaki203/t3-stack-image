import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/auth/Navigation'
import { getAuthSession } from '@/lib/nextauth'
import AuthProvider from '@/components/providers/AuthProviders'
import TrpcProvider from '@/components/providers/TrpcProvider'
import ToastProvider from '@/components/providers/ToastProvider'
import { getSubscription } from '@/actions/subscription'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'T3Stack basic',
  description: 'T3Stack basic',
}

interface RootLayoutProps {
  children: React.ReactNode
}

const RootLayout = async ({ children }: RootLayoutProps) => {
  const user = await getAuthSession()
  const { isSubscribed } = await getSubscription({ userId: user?.id })
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <div className="flex min-h-screen flex-col"> */}
        <AuthProvider>
          <TrpcProvider>
            {/* <Navigation user={user} isSubscribed={isSubscribed} /> */}
            <ToastProvider />
            {/* <ModalProvider /> */}
            {/* <main className="container mx-auto max-w-screen-md flex-1 px-2"> */}
            {children}
            {/* </main> */}
            {/* <footer className="py-5 mt-20">
                <div className="text-center text-sm">
                  <a
                    href="https://github.com/Chiaki203"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    © Chiaki203
                  </a>
                </div>
              </footer> */}
          </TrpcProvider>
        </AuthProvider>
        {/* </div> */}
      </body>
    </html>
  )
}

export default RootLayout

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>{children}</body>
//     </html>
//   )
// }
