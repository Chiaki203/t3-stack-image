'use client'

import { User, Comment, CommentLike } from '@prisma/client'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { LuPencil, LuTrash2 } from 'react-icons/lu'
import { trpc } from '@/trpc/react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import CommentLikeDetail from './CommentLikeDetail'

interface CommentItemProps {
  comment: Comment & {
    user: Pick<User, 'id' | 'name' | 'image'>
  } & {
    hasLiked: boolean
    commentLikeId: string | null
  } & { likes: CommentLike[] }
  userId?: string
}

const CommentItem = ({ comment, userId }: CommentItemProps) => {
  const router = useRouter()
  const { mutate: deleteComment, isLoading } =
    trpc.comment.deleteComment.useMutation({
      onSuccess: () => {
        toast.success('Comment deleted')
        router.refresh()
      },
      onError: (error: any) => {
        toast.error('Failed to delete comment')
        console.log('deleteComment error', error)
      },
    })
  const handleDeleteComment = () => {
    deleteComment({
      commentId: comment.id,
    })
  }
  return (
    <div>
      <div className="flex items-center justify-between p-2 sm:p-5 border-b">
        <Link href={`/author/${comment.user.id}`}>
          <div className="flex items-center space-x-1">
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image
                src={comment.user.image || '/default.png'}
                alt={comment.user.name || 'avatar'}
                className="rounded-full object-cover"
                fill
              />
            </div>
            <div className="text-sm hover:underline">{comment.user.name}</div>
          </div>
        </Link>
        <div className="text-sm">
          {format(new Date(comment.updatedAt), 'dd MMM yyyy HH:mm')}
        </div>
      </div>
      <div className="p-2 sm:p-5 leading-relaxed break-words whitespace-pre-wrap">
        <div>{comment.content}</div>
      </div>
      <div className="flex items-center justify-end space-x-1 pr-1 pb-1">
        <CommentLikeDetail comment={comment} userId={userId} />
        {userId === comment.user.id && (
          <>
            <Link href={`/comment/${comment.id}/edit`}>
              <div className="hover:bg-gray-100 p-2 rounded-full">
                <LuPencil className="w-5 h-5" />
              </div>
            </Link>
            <button
              className="hover:bg-gray-100 p-2 rounded-full"
              disabled={isLoading}
              onClick={handleDeleteComment}
            >
              <LuTrash2 className="w-5 h-5 text-red-500" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default CommentItem
