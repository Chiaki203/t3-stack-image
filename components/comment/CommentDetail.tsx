'use client'

import { User, Comment, CommentLike } from '@prisma/client'
import { commentPerPage } from '@/lib/utils'
import CommentNew from './CommentNew'
import CommentItem from './CommentItem'
import PaginationButton from '../pagers/PaginationButton'

interface CommentDetailProps {
  userId?: string
  postId: string
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
}

const CommentDetail = ({
  userId,
  postId,
  comments,
  pageCount,
  totalComments,
}: CommentDetailProps) => {
  return (
    <div className="space-y-5">
      <CommentNew userId={userId} postId={postId} />
      <div className="border rounded-md">
        <div className="border-b bg-gray-50 rounded-t-xl p-2 sm:p-5 text-sm font-bold">
          {totalComments} comments
        </div>
        {comments.length === 0 ? (
          <div className="text-center text-sm text-gray-500 my-10">
            No comments yet
          </div>
        ) : (
          <div>
            {comments.map((comment, index) => (
              <div
                key={comment.id}
                className={index !== comments.length - 1 ? 'border-b' : ''}
              >
                <CommentItem comment={comment} userId={userId} />
              </div>
            ))}
          </div>
        )}
      </div>
      {comments.length !== 0 && (
        <PaginationButton
          pageCount={pageCount}
          displayPerPage={commentPerPage}
        />
      )}
    </div>
  )
}

export default CommentDetail
