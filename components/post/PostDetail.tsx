'use client'

import { Post, User, Comment, CommentLike } from '@prisma/client'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { LuPencil, LuTrash2 } from 'react-icons/lu'
import { trpc } from '@/trpc/react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import CommentDetail from '../comment/CommentDetail'

interface PostDetailProps {
  post: Post & {
    user: Pick<User, 'id' | 'name' | 'image'>
  }
  userId?: string
  comments: (Comment & {
    user: Pick<User, 'id' | 'name' | 'image'>
  } & {
    hasLiked: boolean
    commentLikeId: string | null
  } & {
    likes: CommentLike[]
  })[]
  pageCount: number
  totalComments: number
  isSubscribed: boolean
}

const PostDetail = ({
  post,
  userId,
  comments,
  pageCount,
  totalComments,
  isSubscribed,
}: PostDetailProps) => {
  const router = useRouter()
  const isSubscribedPost =
    post.premium && !isSubscribed && post.userId !== userId
  const content =
    isSubscribedPost && post.content.length > 200
      ? post.content.slice(0, 400) + '...'
      : post.content
  const { mutate: deletePost, isLoading } = trpc.post.deletePost.useMutation({
    onSuccess: () => {
      toast.success('Post deleted')
      router.push('/')
      router.refresh()
    },
    onError: (error: any) => {
      toast.error(error.message)
      console.log('deletePost error', error)
    },
  })
  const handleDeletePost = () => {
    if (post.user.id !== userId) {
      toast.error('You are not authorized to delete this post')
      return
    }
    deletePost({
      postId: post.id,
    })
  }
  return (
    <div className="space-y-5">
      {post.premium && (
        <div className="bg-gradient-radial from-blue-500 to-sky-500 rounded-md text-white font-semibold px-3 py-2 text-xs inline-block">
          Premium Post
        </div>
      )}
      <div className="font-bold text-2xl break-words">{post.title}</div>
      <div>
        <Link href={`/author/${post.user.id}`}>
          <div className="flex items-center space-x-1">
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image
                src={post.user.image || '/default.png'}
                alt={post.user.name || 'avatar'}
                className="rounded-full object-cover"
                fill
              />
            </div>
            <div className="text-sm hover:underline break-words min-w-0">
              {post.user.name} |{' '}
              {format(new Date(post.updatedAt), 'dd MMM yyyy HH:mm')}
            </div>
          </div>
        </Link>
      </div>
      <div className="aspect-[16/9] relative">
        <Image
          src={post.image || '/noImage.png'}
          alt="post image"
          className="object-cover rounded-lg"
          fill
        />
      </div>
      <div className="leading-relaxed break-words ">{content}</div>
      {userId === post.user.id && (
        <div className="flex items-center justify-end space-x-1">
          <Link href={`/post/${post.id}/edit`}>
            <div className="hover:bg-gray-100 p-2 rounded-full">
              <LuPencil className="w-5 h-5" />
            </div>
          </Link>
          <button
            className="hover:bg-gray-100 p-2 rounded-full"
            disabled={isLoading}
            onClick={handleDeletePost}
          >
            <LuTrash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}
      {isSubscribedPost && (
        <div className="bg-gradient-radial from-blue-500 to-sky-500 text-white rounded-md p-5 sm:p-10 text-center space-y-5">
          <div>
            You can read the full content of this post by subscribing to premium
          </div>
          <div className="inline-block">
            {userId ? (
              <Link href="/payment">
                <div className="w-[300px] bg-white text-blue-500 hover:bg-white/90 font-bold shadow rounded-md py-2">
                  Subscribe to Premium
                </div>
              </Link>
            ) : (
              <Link href="/login">
                <div className="w-[300px] bg-white text-blue-500 hover:bg-white/90 font-bold shadow rounded-md py-2">
                  Login
                </div>
              </Link>
            )}
          </div>
          <div className="text-xs">You can unsubscribe anytime.</div>
          <div className="font-bold">Premium member benefits</div>
          <div className="text-sm">Unlimited access to the premium posts</div>
        </div>
      )}
      <CommentDetail
        userId={userId}
        postId={post.id}
        comments={comments}
        pageCount={pageCount}
        totalComments={totalComments}
      />
    </div>
  )
}

export default PostDetail
