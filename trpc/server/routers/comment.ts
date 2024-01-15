import { publicProcedure, privateProcedure, router } from '../trpc';
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import prisma from '@/lib/prisma';

export const commentRouter = router({
  createComment: privateProcedure.input(
    z.object({
      postId: z.string(),
      content: z.string()
    })
  ).mutation(async({input, ctx}) => {
    try {
      const {postId, content} = input
      const userId = ctx.user.id
      const comment = await prisma.comment.create({
        data: {
          userId,
          postId,
          content
        }
      })
      return comment
    } catch(error) {
      console.log('commentRouter createComment error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create comment'
      })
    }
  }),
  getComments: publicProcedure.input(
    z.object({
      userId: z.string().optional(),
      postId: z.string(),
      limit: z.number(),
      offset: z.number()
    })
  ).query(async({input}) => {
    try {
      const {userId, postId, limit, offset} = input
      console.log('getComments offset', offset)
      const comments = await prisma.comment.findMany({
        where: {postId},
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
          },
          likes: true
        }
      })
      const commentsWithLikesStatus = comments.map(comment => {
        const userLike = userId ? comment.likes.find(like => like.userId === userId) : null
        console.log('userLike', userLike)
        return {
          ...comment,
          hasLiked: !!userLike,
          commentLikeId: userLike ? userLike.id : null
        }
      })
      const totalComments = await prisma.comment.count({
        where: {postId}
      })
      return {comments: commentsWithLikesStatus, totalComments}
    } catch(error) {
      console.log('commentRouter getComments error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get comments'
      })
    }
  }),
  getCommentById: publicProcedure.input(
    z.object({
      commentId: z.string()
    })
  ).query(async({input}) => {
    try {
      const {commentId} = input
      const comment = await prisma.comment.findUnique({
        where: {id: commentId},
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
      return comment
    } catch(error) {
      console.log('commentRouter getCommentById error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get comment'
      })
    }
  }),
  updateComment: privateProcedure.input(
    z.object({
      commentId: z.string(),
      content: z.string()
    })
  ).mutation(async({input, ctx}) => {
    try {
      const {commentId, content} = input
      const userId = ctx.user.id
      const comment = await prisma.comment.findUnique({
        where: {id: commentId}
      })
      if (!comment) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Comment not found'
        })
      }
      if (userId !== comment.userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are not authorized to update this comment'
        })
      }
      await prisma.comment.update({
        where: {id: commentId},
        data: {content}
      })
      return comment
    } catch(error) {
      console.log('commentRouter updateComment error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update comment'
      })
    }
  }),
  deleteComment: privateProcedure.input(
    z.object({
      commentId: z.string()
    })
  ).mutation(async({input, ctx}) => {
    try {
      const {commentId} = input
      const userId = ctx.user.id
      const comment = await prisma.comment.findUnique({
        where: {id: commentId}
      })
      if (!comment) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Comment not found'
        })
      }
      if (userId !== comment.userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You are not authorized to delete this comment'
        })
      }
      await prisma.comment.delete({
        where: {id: commentId}
      })
    } catch(error) {
      console.log('commentRouter deleteComment error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete comment'
      })
    }
  }),
  createCommentLike: privateProcedure.input(
    z.object({
      commentId: z.string()
    })
  ).mutation(async({input, ctx}) => {
    try {
      const {commentId} = input
      const userId = ctx.user.id
      await prisma.commentLike.create({
        data: {
          userId,
          commentId
        }
      })
    } catch(error) {
      console.log('commentRouter createCommentLike error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create comment like'
      })
    }
  }),
  deleteCommentLike: privateProcedure.input(
    z.object({
      commentLikeId: z.string()
    })
  ).mutation(async({input}) => {
    try {
      const {commentLikeId} = input
      await prisma.commentLike.delete({
        where: {id:commentLikeId}
      })
    } catch(error) {
      console.log('commentRouter deleteCommentLike error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete comment like'
      })
    }
  })
})