'use client'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormItem,
  FormMessage,
} from '../ui/form'
import { Button } from '../ui/button'
import { trpc } from '@/trpc/react'
import { LuLoader2 } from 'react-icons/lu'
import { useState } from 'react'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z
    .string()
    .min(3, 'Name has to be at least 3 characters long')
    .max(20, 'Name can be at most 20 characters long'),
})

type InputType = z.infer<typeof schema>

const ChatNew = () => {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
    },
  })
  const { mutate: createChat, isLoading } = trpc.chat.createChat.useMutation({
    onSuccess: (chatId) => {
      toast.success('Chat created')
      setDialogOpen(false)
      router.push(`/chat/${chatId}`)
      form.reset()
      router.refresh()
    },
    onError: (error: any) => {
      toast.error(error.message)
      console.log('ChatNew createChat error', error)
    },
  })
  const onSubmit: SubmitHandler<InputType> = async (data) => {
    createChat(data)
  }
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">New Chat</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
          <DialogDescription>Enter the chat name</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full mb-5">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Chat name"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  disabled={isLoading}
                  type="submit"
                  className="w-full"
                  onClick={form.handleSubmit(onSubmit)}
                >
                  {isLoading && (
                    <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ChatNew
