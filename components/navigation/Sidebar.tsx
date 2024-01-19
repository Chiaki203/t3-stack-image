'use client'

import { Chat, User } from '@prisma/client'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { MAX_COUNT } from '@/lib/utils'
import { LuUser as UserIcon, LuKeyRound, LuCreditCard } from 'react-icons/lu'
// import { User as UserIcon, KeyRound, CreditCard } from 'lucide-react'
import SidebarItem from './SidebarItem'
import Link from 'next/link'

interface SidebarProps {
  user: User
  chats?: Chat[]
  isSubscribed?: boolean
  layout: string
}

const routes = [
  {
    id: 1,
    icon: UserIcon,
    name: 'Profile',
    href: 'profile',
  },
  {
    id: 2,
    icon: LuKeyRound,
    name: 'Change password',
    href: 'password',
  },
  {
    id: 3,
    icon: LuCreditCard,
    name: 'Subscription',
    href: 'billing',
  },
]

const Sidebar = ({ user, chats, isSubscribed, layout }: SidebarProps) => {
  return (
    <div className="flex flex-col h-screen border-r overflow-hidden">
      <div className="h-[80px] border-b flex items-center justify-center">
        <Link href="/">
          <div className="font-bold text-xl">T3 Stack Image</div>
        </Link>
      </div>
      <div className="overflow-y-auto flex-grow">
        <div className="flex flex-col h-full">
          {layout === 'dashboard'
            ? chats &&
              chats.map((chat) => (
                <SidebarItem
                  key={chat.id}
                  name={chat.name}
                  href={chat.id}
                  layout={layout}
                />
              ))
            : layout === 'settings'
              ? routes.map((route) => (
                  <SidebarItem
                    key={route.id}
                    icon={route.icon}
                    name={route.name}
                    href={route.href}
                    layout={layout}
                  />
                ))
              : null}
        </div>
      </div>
      {!isSubscribed && layout === 'dashboard' && (
        <div className="bg-gray-50 p-5 space-y-5">
          <div className="text-center text-sm">
            {user.count} / {MAX_COUNT} Free
          </div>
          <Progress value={(user.count / MAX_COUNT) * 100} />
          <Button className="w-full" variant="premium" onClick={() => {}}>
            Upgrade
          </Button>
        </div>
      )}
    </div>
  )
}

export default Sidebar
