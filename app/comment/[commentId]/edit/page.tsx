import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/nextauth'
import { trpc } from '@/trpc/client'
import CommentEdit from '@/components/comment/CommentEdit'

interface CommentEditPageProps {
  params: {
    commentId: string
  }
}

const CommentEditPage = async ({ params }: CommentEditPageProps) => {
  const { commentId } = params
  const user = await getAuthSession()
  if (!user) {
    redirect('/login')
  }
  const comment = await trpc.comment.getCommentById({ commentId })
  if (!comment) {
    return (
      <div className="text-center text-sm text-gray-500">No Comment Found</div>
    )
  }
  if (comment.userId !== user.id) {
    return (
      <div className="text center">
        You are not authorized to edit this comment
      </div>
    )
  }
  return <CommentEdit comment={comment} />
}

export default CommentEditPage
