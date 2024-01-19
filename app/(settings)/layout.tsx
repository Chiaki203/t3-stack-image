import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/nextauth'
import Footer from '@/components/navigation/Footer'
import Sidebar from '@/components/navigation/Sidebar'
import Navigation from '@/components/navigation/Navigation'

const SettingsLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getAuthSession()
  if (!user) {
    redirect('/login')
  }
  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-64 fixed inset-y-0 w-full z-50">
        <Navigation user={user} layout="settings" />
      </div>

      <div className="hidden md:flex h-full w-64 flex-col fixed inset-y-0 z-50">
        <Sidebar user={user} layout="settings" />
      </div>

      <div className="md:pl-64 flex flex-col h-full">
        <main className="pt-[80px] flex-1">
          <div className="max-w-[600px] mx-auto px-5 py-10">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default SettingsLayout

// import SidebarNav from '@/components/settings/SidebarNav'

// interface SettingsLayoutProps {
//   children: React.ReactNode
// }

// const SettingsLayout = ({ children }: SettingsLayoutProps) => {
//   return (
//     <div className="flex flex-col space-y-8 md:flex-row md:space-x-12 md:space-y-0">
//       <div className="md:w-1/4">
//         <SidebarNav />
//       </div>
//       <div className="flex-1 md:max-w-2xl">{children}</div>
//     </div>
//   )
// }

// export default SettingsLayout
