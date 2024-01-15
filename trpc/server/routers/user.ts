import {publicProcedure, privateProcedure, router} from '../trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import {extractPublicId} from 'cloudinary-build-url'
import prisma from '@/lib/prisma'
import { createCloudImage, deleteCloudImage } from '@/actions/cloudImage'

export const userRouter = router({
  updateUser: privateProcedure.input(
    z.object({
      name: z.string(),
      introduction: z.string().optional(),
      base64Image: z.string().optional()
    })
  )
  .mutation(async({input, ctx}) => {
    try {
      const {name, introduction, base64Image} = input
      const userId = ctx.user.id
      let image_url
      if (base64Image) {
        const user = await prisma.user.findUnique({
          where: {id: userId}
        })
        if (!user) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User not found'
          })
        }
        if (user.image) {
          const publicId = extractPublicId(user.image)
          await deleteCloudImage(publicId)
        }
        image_url = await createCloudImage(base64Image)
      }
      await prisma.user.update({
        where: {
          id: userId
        }, 
        data: {
          name,
          introduction,
          ...(image_url && {image: image_url})
        }
      })
    } catch(error) {
      console.log('userRouter updateUser error', error)
      if (error instanceof TRPCError && error.code === 'BAD_REQUEST') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message
        })
      } else {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user'
        })
      }
    }
  }),
  getUserByIdPost:publicProcedure.input(
    z.object({
      userId: z.string().optional(),
      limit: z.number(),
      offset: z.number()
    })
  ).query(async({input}) => {
    try {
      const {userId, limit, offset} = input
      if (!userId) {
        return {user: null, totalPosts: 0}
      }
      console.log('getUserPosts offset', offset)
      const user = await prisma.user.findUnique({
        where: {id: userId},
        include: {
          posts: {
            skip: offset,
            take: limit,
            orderBy: {
              updatedAt: 'desc'
            }
          }
        }
      })
      if (!user) {
        return {user: null, totalPosts: 0}
      }
      const totalPosts = await prisma.post.count({
        where: {userId}
      })
      return {user, totalPosts}
    }catch(error) {
      console.log('userRouter getUserByIdPost error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get user'
      })
    }
  })
})