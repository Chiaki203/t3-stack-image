'use client'

import { LuMenu } from 'react-icons/lu'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import Sidebar from './Sidebar'
import { Chat, User } from '@prisma/client'

interface MobileSidebarProps {
  user: User
  chats?: Chat[]
  layout: string
}

const MobileSidebar = ({ user, chats, layout }: MobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger className="md:hidden pr-4 hover:opacity-75 transition">
        <LuMenu />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 bg-white">
        <Sidebar user={user} chats={chats} layout={layout} />
      </SheetContent>
    </Sheet>
  )
}

export default MobileSidebar
