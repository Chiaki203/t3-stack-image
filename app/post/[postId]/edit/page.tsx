import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/nextauth'
import { trpc } from '@/trpc/client'
import PostEdit from '@/components/post/PostEdit'

interface PostEditPageProps {
  params: {
    postId: string
  }
}

const PostEditPage = async ({ params }: PostEditPageProps) => {
  const { postId } = params
  const user = await getAuthSession()
  if (!user) {
    redirect('/login')
  }
  const post = await trpc.post.getPostById({ postId })
  if (!post) {
    return (
      <div className="text-center text-sm text-gray-500">No Post Found</div>
    )
  }
  if (post.userId !== user.id) {
    return (
      <div className="text-center">
        You are not authorized to edit this post
      </div>
    )
  }
  return <PostEdit post={post} />
}

export default PostEditPage
