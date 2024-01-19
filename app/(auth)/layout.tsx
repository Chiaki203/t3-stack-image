import Link from 'next/link'
import Footer from '@/components/navigation/Footer'

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-[80px] border-b flex items-center justify-center">
        <Link href="/">
          <div className="font-bold text-xl">T3 Stack Image</div>
        </Link>
      </div>
      <main className="flex justify-center mt-20 flex-1">
        <div className="px-5 w-full">{children}</div>
      </main>
      <Footer />
    </div>
  )
}

export default AuthLayout
