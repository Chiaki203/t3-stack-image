'use client'

import Link from 'next/link'
import { Button } from '../ui/button'
import { User } from '@prisma/client'
import UserNavigation from './UserNavigation'

interface NavigationProps {
  user: User | null
  isSubscribed: boolean
}

const Navigation = ({ user, isSubscribed }: NavigationProps) => {
  return (
    <header className="shadow-lg shadow-gray-100 mb-10">
      <div className="container mx-auto flex max-w-screen-md items-center justify-between px-2 py-3">
        <Link href="/" className="cursor-pointer text-xl font-bold">
          T3Stack Basic
        </Link>
        {user ? (
          <div className="flex items-center justify-center space-x-5">
            {!isSubscribed && (
              <Button asChild variant="premium">
                <Link href="/payment">Premium✨</Link>
              </Button>
            )}
            <UserNavigation user={user} />
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <Button asChild variant="ghost" className="font-bold">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="default" className="font-bold">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navigation
