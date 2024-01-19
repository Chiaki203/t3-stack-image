'use client'

import {
  Dialog,
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
import { LuLoader2, LuPencil } from 'react-icons/lu'
import { useState } from 'react'
import toast from 'react-hot-toast'

const schema = z.object({
  name: z
    .string()
    .min(3, 'Name has to be at least 3 characters long')
    .max(20, 'Name can be at most 20 characters long'),
})

type InputType = z.infer<typeof schema>

interface ChatEditProps {
  chatId: string
  name: string
  setPopoverOpen: (value: boolean) => void
}

const ChatEdit = ({ chatId, name, setPopoverOpen }: ChatEditProps) => {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: name,
    },
  })
  const { mutate: editChat, isLoading } = trpc.chat.editChat.useMutation({
    onSuccess: () => {
      toast.success('Chat name edited')
      router.refresh()
      setDialogOpen(false)
      setPopoverOpen(false)
      form.reset()
    },
    onError: (error: any) => {
      toast.error(error.message)
      console.log('ChatEdit editChat error', error)
    },
  })
  const onSubmit: SubmitHandler<InputType> = async (data) => {
    editChat({
      chatId,
      name: data.name,
    })
  }
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2 w-full">
          <LuPencil className="h-5 w-5" />
          <div>Rename</div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
          <DialogDescription>Edit the chat name</DialogDescription>
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
              <Button
                disabled={isLoading}
                className="w-full"
                onClick={form.handleSubmit(onSubmit)}
              >
                {isLoading && (
                  <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ChatEdit
