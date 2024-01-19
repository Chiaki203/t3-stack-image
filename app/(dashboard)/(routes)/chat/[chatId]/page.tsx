import { trpc } from '@/trpc/client'
import MessageNew from '@/components/message/MessageNew'
import MessageItem from '@/components/message/MessageItem'
import MessageScroll from '@/components/message/MessageScroll'

interface ChatDetailPageProps {
  params: {
    chatId: string
  }
}

const ChatDetailPage = async ({ params }: ChatDetailPageProps) => {
  const { chatId } = params
  const messages = await trpc.chat.getMessages({ chatId })
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5 max-w-[1000px] mx-auto p-5">
          {messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </div>
        <MessageScroll messages={messages} />
      </div>
      <div className="p-5">
        <MessageNew chatId={chatId} />
      </div>
    </div>
  )
}

export default ChatDetailPage
