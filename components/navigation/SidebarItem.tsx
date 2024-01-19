'use client'

import { LuSettings2, LuTrash2 } from 'react-icons/lu'
import { LucideIcon } from 'lucide-react'
import {
  usePathname,
  useRouter,
  useParams,
  useSearchParams,
} from 'next/navigation'
import { cn } from '@/lib/utils'
import { trpc } from '@/trpc/react'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import ChatEdit from '../chat/ChatEdit'

interface SidebarItemProps {
  icon?: LucideIcon
  name: string
  href: string
  layout: string
}

const SidebarItem = ({ icon: Icon, name, href, layout }: SidebarItemProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const isActive = pathname.split('/')[2] === href
  const { mutate: deleteChat, isLoading } = trpc.chat.deleteChat.useMutation({
    onSuccess: () => {
      toast.success('Chat deleted')
      router.push('/')
      router.refresh()
    },
    onError: (error: any) => {
      toast.error(error.message)
      console.log('SidebarItem deleteChat error', error)
    },
  })
  return (
    <Link
      href={layout === 'dashboard' ? `/chat/${href}` : `/settings/${href}`}
      className={cn(
        'text-sm px-3 transition-all hover:bg-slate-300/20',
        isActive &&
          'text-blue-700 bg-blue-300/20 hover:bg-sky-200/20 hover:text-blue-700'
      )}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-x-2 py-5 overflow-hidden">
          {Icon ? (
            <>
              <Icon
                size={22}
                className={cn('flex-shrink-0', isActive && 'text-blue-700')}
              />
              <div className="truncate max-w-[calc(100% - 30px)]">{name}</div>
            </>
          ) : (
            <div className="truncate">{name}</div>
          )}
        </div>
        {layout === 'dashboard' && isActive && (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger>
              <LuSettings2 className="h-5 w-5" />
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 space-y-2">
              <ChatEdit
                chatId={href}
                name={name}
                setPopoverOpen={setPopoverOpen}
              />
              <Button
                variant="ghost"
                className="flex items-center space-x-2 w-full text-red-500 hover:bg-red-50 hover:text-red-500"
                onClick={() => deleteChat({ chatId: href })}
                disabled={isLoading}
              >
                <LuTrash2 className="h-5 w-5" />
                <div>Delete Chat</div>
              </Button>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </Link>
  )
}

export default SidebarItem
