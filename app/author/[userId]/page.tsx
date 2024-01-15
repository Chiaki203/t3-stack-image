import AuthorDetail from '@/components/author/AuthorDetail'
import { userPostPerPage } from '@/lib/utils'
import { trpc } from '@/trpc/client'

interface AuthorPageProps {
  params: {
    userId: string
  }
  searchParams: {
    [key: string]: string | undefined
  }
}

const AuthorDetailPage = async ({ params, searchParams }: AuthorPageProps) => {
  const { userId } = params
  const { page, perPage } = searchParams
  console.log('params', params)
  console.log('searchParams', searchParams)
  const limit =
    typeof perPage === 'string' ? parseInt(perPage) : userPostPerPage
  const offset = typeof page === 'string' ? (parseInt(page) - 1) * limit : 0
  const { user, totalPosts } = await trpc.user.getUserByIdPost({
    userId,
    limit,
    offset,
  })
  console.log('user totalPosts', totalPosts)
  if (!user) {
    return <div className="text-center">User Not Found</div>
  }
  const pageCount = Math.ceil(totalPosts / limit)
  return (
    <AuthorDetail user={user} pageCount={pageCount} totalPosts={totalPosts} />
  )
}

export default AuthorDetailPage
