'use client'

import { Post, User } from '@prisma/client'
import { formatDistance } from 'date-fns'
import { de } from 'date-fns/locale'
import { enGB } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'

interface PostItemProps {
  post: Post & {
    user: Pick<User, 'id' | 'name' | 'image'>
  }
}

const PostItem = ({ post }: PostItemProps) => {
  const content =
    post.content.length > 100
      ? post.content.slice(0, 100) + '...'
      : post.content
  const updatedAt = new Date(post.updatedAt ?? 0)
  console.log('PostItem updatedAt', updatedAt)
  const now = new Date()
  const date = formatDistance(updatedAt, now, { addSuffix: true, locale: enGB })
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 sm:gap-5 space-y-3 sm:space-y-0">
      <Link href={`/post/${post.id}`} className="relative">
        {post.premium && (
          <div className="absolute top-0 z-10 bg-gradient-radial from-blue-500 to-sky-500 rounded-md text-white font-semibold px-3 py-1 text-xs">
            Premium Content
          </div>
        )}
        <div className="aspect-[16/9] relative col-span-3 sm:col-span-1 overflow-hidden rounded-md">
          <Image
            src={post.image || '/noImage.png'}
            alt="post image"
            className="object-cover rounded-md transition-all hover:scale-105"
            fill
          />
        </div>
      </Link>
      <div className="col-span-1 sm:col-span-2 space-y-3 break-words">
        <div className="font-bold text-lg hover:underline">
          <Link href={`/post/${post.id}`}>{post.title}</Link>
        </div>
        <div className="hover:underline">
          <Link href={`/post/${post.id}`}>{content}</Link>
        </div>
        <div>
          <Link href={`/author/${post.user.id}`}>
            <div className="flex items-center space-x-1">
              <div className="relative w-6 h-6 flex-shrink-0">
                <Image
                  src={post.user.image || '/default.png'}
                  className="rounded-full object-cover"
                  alt={post.user.name || 'avatar'}
                  fill
                />
              </div>
              <div className="text-sm hover:underline break-words min-w-0">
                {post.user.name} | {date}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PostItem
