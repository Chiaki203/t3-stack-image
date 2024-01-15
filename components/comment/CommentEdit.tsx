'use client'

import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Comment } from '@prisma/client'
import { trpc } from '@/trpc/react'
import { LuLoader2 } from 'react-icons/lu'
import toast from 'react-hot-toast'

const schema = z.object({
  content: z
    .string()
    .min(3, { message: 'Comment must be at least 3 characters long' })
    .max(1000, { message: 'Comment must be less than 1000 characters long' }),
})

type InputType = z.infer<typeof schema>

interface CommentEditProps {
  comment: Comment
}

const CommentEdit = ({ comment }: CommentEditProps) => {
  const router = useRouter()
  const form = useForm<InputType>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: comment.content || '',
    },
  })
  const { mutate: updateComment, isLoading } =
    trpc.comment.updateComment.useMutation({
      onSuccess: ({ postId }) => {
        toast.success('Comment updated')
        router.push(`/post/${postId}`)
        // router.push(`/post/${comment.postId}`)
        router.refresh()
      },
      onError: (error: any) => {
        toast.error('Comment update failed')
        console.log('updateComment error', error)
      },
    })
  const onSubmit: SubmitHandler<InputType> = (data) => {
    updateComment({
      commentId: comment.id,
      content: data.content,
    })
  }
  return (
    <div>
      <div className="text-2xl font-bold text-center mb-5">Edit Comment</div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comment</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={10} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading && <LuLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            Edit Comment
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default CommentEdit
