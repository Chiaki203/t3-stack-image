import { trpc } from '@/trpc/client'
import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/nextauth'
import { getSubscription } from '@/actions/subscription'
import Sidebar from '@/components/navigation/Sidebar'
import Navigation from '@/components/navigation/Navigation'

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getAuthSession()
  if (!user) {
    redirect('/login')
  }
  const chats = await trpc.chat.getChats()
  const { isSubscribed } = await getSubscription({ userId: user.id })
  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-64 fixed inset-y-0 w-full z-50">
        <Navigation user={user} chats={chats} layout="dashboard" />
      </div>
      <div className="hidden md:flex h-full w-64 flex-col fixed inset-y-0 z-50">
        <Sidebar
          user={user}
          chats={chats}
          isSubscribed={isSubscribed}
          layout="dashboard"
        />
      </div>
      <main className="md:pl-64 pt-[80px] h-full">
        <div className="h-full">{children}</div>
      </main>
    </div>
  )
}

export default DashboardLayout
