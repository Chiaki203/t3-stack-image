'use client'

import { Message, User } from '@prisma/client'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card'
import { LuInfo, LuArrowDownToLine } from 'react-icons/lu'
import Image from 'next/image'

interface MessageItemProps {
  message: Message & {
    user: Pick<User, 'id' | 'name' | 'image'>
  }
}

const MessageItem = ({ message }: MessageItemProps) => {
  return (
    <div>
      {message.role === 'user' ? (
        <div>
          <div className="flex items-center space-x-2">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src={message.user.image || '/default.png'}
                alt={message.user.name || 'avatar'}
                className="rounded-full object-cover"
                fill
              />
            </div>
            <div className="font-bold text-sm">{message.user.name}</div>
          </div>
          {message.image && (
            <div className="ml-10 aspect-[16/9] relative mb-2">
              <Image
                src={message.image || '/noImage.png'}
                alt="user image"
                className="object-cover rounded-md"
                fill
              />
              <div className="cursor-pointer absolute top-2 left-2">
                <a href={message.image} target="_blank">
                  <LuArrowDownToLine className="h-8 w-8 text-white drop-shadow" />
                </a>
              </div>
            </div>
          )}
          <div className="ml-10 break-words whitespace-pre-wrap">
            {message.prompt}
          </div>
        </div>
      ) : message.role === 'assistant' ? (
        <div>
          <div className="flex items-center space-x-2">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src="/chatgpt.png"
                alt="ChatGPT"
                className="rounded-full object-cover"
                fill
              />
            </div>
            <div className="font-bold text-sm">ChatGPT</div>
          </div>
          <div className="ml-10 aspect-[16/9] relative mb-2">
            <Image
              src={message.image || '/noImage.png'}
              alt="generated image"
              className="object-cover rounded-md"
              fill
            />
            <HoverCard>
              <HoverCardTrigger className="cursor-pointer absolute top-2 right-2">
                <div className="rounded-full p-1">
                  <LuInfo className="h-8 w-8 text-white drop-shadow" />
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-[300px] sm:w-[500px]" align="end">
                {message.prompt}
              </HoverCardContent>
            </HoverCard>
            {message.image && (
              <div className="cursor-pointer absolute top-2 left-2">
                <a href={message.image} target="_blank">
                  <LuArrowDownToLine className="h-8 w-8 text-white drop-shadow" />
                </a>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default MessageItem
