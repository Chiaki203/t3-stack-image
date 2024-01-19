'use client'

import { Message } from '@prisma/client'
import { useCallback, useEffect, useRef } from 'react'

interface MessageScrollProps {
  messages: Message[]
}

const MessageScroll = ({ messages }: MessageScrollProps) => {
  const messageEndRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = useCallback(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])
  return <div ref={messageEndRef} />
}

export default MessageScroll
