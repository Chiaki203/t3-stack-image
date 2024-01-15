'use client'

import { User } from '@prisma/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

interface UserNavigationProps {
  user: User
}

const UserNavigation = ({ user }: UserNavigationProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="relative w-10 h-10 flex-shrink-0">
          <Image
            src={user.image || '/default.png'}
            className="rounded-full object-cover"
            alt={user.name || 'avatar'}
            fill
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white p-2 w-[300px]" align="end">
        <Link href={`/author/${user.id}`}>
          <DropdownMenuItem className="cursor-pointer">
            <div className="break-words min-w-0">
              <div className="mb-2">{user.name || ''}</div>
              <div className="text-gray-500">{user.email || ''}</div>
            </div>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        {user.isAdmin && (
          <Link href="/post/new">
            <DropdownMenuItem className="cursor-pointer">
              Create New Post
            </DropdownMenuItem>
          </Link>
        )}
        <Link href="/settings/profile">
          <DropdownMenuItem className="cursor-pointer">
            Account Setting
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          onSelect={async (event) => {
            event.preventDefault()
            await signOut({ callbackUrl: '/' })
          }}
          className="text-red-600 cursor-pointer"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserNavigation
