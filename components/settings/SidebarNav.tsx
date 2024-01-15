'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { buttonVariants } from '../ui/button'
import Link from 'next/link'

const items = [
  {
    title: 'Profile',
    href: '/settings/profile',
  },
  {
    title: 'Billing',
    href: '/settings/billing',
  },
  {
    title: 'Change Password',
    href: '/settings/password',
  },
]

const SidebarNav = () => {
  const pathname = usePathname()
  return (
    <nav className={cn('flex space-x-2 md:flex-col md:space-x-0 md:space-y-1')}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            pathname === item.href
              ? 'bg-mutated hover:bg-muted'
              : 'hover:bg-transparent hover:underline',
            'justify-start'
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}

export default SidebarNav
