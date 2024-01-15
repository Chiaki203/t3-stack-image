'use client'

import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { trpc } from '@/trpc/react'
import { LuLoader2 } from 'react-icons/lu'
import toast from 'react-hot-toast'
import Link from 'next/link'

const schema = z.object({
  content: z
    .string()
    .min(3, { message: 'Content must be at least 3 characters long' }),
})

type InputType = z.infer<typeof schema>

interface CommentNewProps {
  userId?: string
  postId: string
}

const CommentNew = ({ userId, postId }: CommentNewProps) => {
  const router = useRouter()
  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: '',
    },
  })
  const { mutate: createComment, isLoading } =
    trpc.comment.createComment.useMutation({
      onSuccess: () => {
        toast.success('Comment posted')
        form.reset()
        router.refresh()
      },
      onError: (error: any) => {
        toast.error('Failed to post comment')
        console.log('createComment error', error)
      },
    })
  const onSubmit: SubmitHandler<InputType> = (data) => {
    createComment({
      postId,
      content: data.content,
    })
  }
  return (
    <div className="border rounded-md p-2 sm:p-5 bg-gray-50">
      <div className="text-sm font-bold mb-2 sm:mb-5">Comment</div>
      {userId ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="What's on your mind?"
                      className="bg-white"
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isLoading} type="submit" className="w-full">
              {isLoading && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Comment
            </Button>
          </form>
        </Form>
      ) : (
        <div className="text-center text-sm text-gray-500 my-10">
          <Link href="/login" className="underline text-sky-500">
            Login
          </Link>
          to post a comment
        </div>
      )}
    </div>
  )
}

export default CommentNew
