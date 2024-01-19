'use client'

import { Chat, User } from '@prisma/client'
import ChatNew from '../chat/ChatNew'
import MobileSidebar from './MobileSidebar'
import UserNavigation from '../auth/UserNavigation'

interface NavigationProps {
  user: User
  chats?: Chat[]
  layout: string
}

const Navigation = ({ user, chats, layout }: NavigationProps) => {
  return (
    <div className="p-4 border-b h-full flex items-center justify-between bg-white">
      <div>
        <MobileSidebar user={user} chats={chats} layout={layout} />
      </div>
      <div className="flex items-center space-x-5">
        <ChatNew />
        <UserNavigation user={user} />
      </div>
    </div>
  )
}

export default Navigation
