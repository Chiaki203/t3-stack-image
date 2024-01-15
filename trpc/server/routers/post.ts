import { publicProcedure, privateProcedure, router } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createCloudImage, deleteCloudImage } from '@/actions/cloudImage';
import { extractPublicId } from 'cloudinary-build-url';
import prisma from '@/lib/prisma';

export const postRouter = router({
  createPost: privateProcedure.input(
    z.object({
      title: z.string(),
      content: z.string(),
      base64Image: z.string().optional(),
      premium: z.boolean()
    })
  ).mutation(async({input, ctx}) => {
    try {
      const {title, content, base64Image, premium} = input
      const userId = ctx.user.id
      if (!ctx.user.isAdmin) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are not authorized to create a post'
        })
      }
      let image_url
      if (base64Image) {
        image_url = await createCloudImage(base64Image)
      }
      const post = await prisma.post.create({
        data: {
          userId,
          title,
          content,
          image: image_url,
          premium
        }
      })
      return post
    } catch(error) {
      console.log('postRouter createPost error', error)
      if (error instanceof TRPCError && error.code === 'BAD_REQUEST') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message
        })
      } else {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create post'
        })
      }
    }
  }),
  getPosts: publicProcedure.input(
    z.object({
      limit: z.number(),
      offset: z.number()
    })
  ).query(async({input}) => {
    try {
      const {limit, offset} = input
      console.log('getPostss offset', offset)

      const posts = await prisma.post.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          updatedAt: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      })
      const totalPosts = await prisma.post.count()
      return {posts, totalPosts}
    } catch(error) {
      console.log('postRouter getPosts error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get posts'
      })
    }
  }),
  getPostById: publicProcedure.input(
    z.object({
      postId: z.string()
    })
  ).query(async({input}) => {
    try {
      const {postId} = input
      const post = await prisma.post.findUnique({
        where: {
          id: postId
        }, 
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      })
      return post
    } catch(error) {
      console.log('postRouter getPostById error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get post'
      })
    }
  }),
  updatePost: privateProcedure.input(
    z.object({
      postId: z.string(),
      title: z.string(),
      content: z.string(),
      base64Image: z.string().optional(),
      premium: z.boolean()
    })
  ).mutation(async({input, ctx}) => {
    try {
      const {postId, title, content, base64Image, premium} = input
      const userId = ctx.user.id
      let image_url 
      if (!ctx.user.isAdmin) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are not authorized to update a post'
        })
      }
      if (base64Image) {
        const post = await prisma.post.findUnique({
          where: {
            id: postId
          },
          include: {
            user: {
              select: {
                id: true
              }
            }
          }
        })
        if (!post) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Post not found'
          })
        }
        if (userId !== post.user.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You are not the author of this post'
          })
        }
        if (post.image) {
          const publicId = extractPublicId(post.image)
          console.log('updatePost publicId', publicId)
          await deleteCloudImage(publicId)
        }
        image_url = await createCloudImage(base64Image)
      }
      await prisma.post.update({
        where: {
          id: postId
        },
        data: {
          title,
          content,
          premium,
          ...(image_url && {image: image_url})
        }
      })
    } catch(error) {
      console.log('postRouter updatePost error', error)
      if (error instanceof TRPCError && error.code === 'BAD_REQUEST') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message
        })
      } else {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update post'
        })
      }
    }
  }),
  deletePost: privateProcedure.input(
    z.object({
      postId: z.string()
    })
  ).mutation(async({input, ctx}) => {
    try {
      const {postId} = input
      const userId = ctx.user.id
      const post = await prisma.post.findUnique({
        where: {id: postId},
        include: {
          user: {
            select: {
              id: true
            }
          }
        }
      })
      if (!post) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Post not found'
        })
      }
      if (userId !== post.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are not the author of this post'
        })
      }
      if (post.image) {
        const publicId = extractPublicId(post.image)
        console.log('deletePost publicId', publicId)
        await deleteCloudImage(publicId)
      }
      await prisma.post.delete({
        where: {
          id: postId
        }
      })
    } catch(error) {
      console.log('postRouter deletePost error', error)
      if (error instanceof TRPCError && error.code === 'BAD_REQUEST') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message
        })
      } else {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete post'
        })
      }
    }
  })
})