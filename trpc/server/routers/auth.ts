import { publicProcedure, privateProcedure, router } from '../trpc';
import {z} from 'zod'
import { TRPCError } from '@trpc/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { sendForgotPassword } from '@/actions/sendForgotPassword';
import { sendResetPassword } from '@/actions/sendResetPassword';

const ONE_SECOND = 1000
const ONE_MINUTE = ONE_SECOND * 60
const ONE_HOUR = ONE_MINUTE * 60
const ONE_DAY = ONE_HOUR * 24

export const authRouter = router({
  signUp: publicProcedure.input(
    z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string()
    })
  )
  .mutation(async({input}) => {
    try {
      const {name, email, password} = input
      const user = await prisma.user.findUnique({
        where: {email}
      })
      if (user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User with this email already exists'
        })
      }
      const hashedPassword = await bcrypt.hash(password, 12)
      console.log('authRouter signUp hashedPassword', hashedPassword)
      await prisma.user.create({
        data: {
          email, 
          name, 
          hashedPassword
        }
      })
    } catch(error) {
      console.log('authRouter signUp error', error)
      if (error instanceof TRPCError && error.code === 'BAD_REQUEST') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message
        })
      } else {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong'
        })
      }
    }
  }),
  changePassword: privateProcedure.input(
    z.object({
      currentPassword: z.string(),
      newPassword: z.string()
    })
  ).mutation(async({input, ctx}) => {
    try {
      const {currentPassword, newPassword} = input
      const userId = ctx.user.id
      const user = await prisma.user.findUnique({
        where: {id: userId}
      })
      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User not found'
        })
      }
      if (!user.hashedPassword) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User has no password'
        })
      }
      const isValidPassword = await bcrypt.compare(
        currentPassword, 
        user.hashedPassword
      )
      if (!isValidPassword) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid password'
        })
      }
      const isSamePassword = await bcrypt.compare(
        newPassword,
        user.hashedPassword
      )
      if (isSamePassword) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'New password must be different from current password'
        })
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, 12)
      console.log('authRouter changePassword hashedNewPassword', hashedNewPassword)
      await prisma.user.update({
        where: {id:userId},
        data: {
          hashedPassword: hashedNewPassword
        }
      })
    }catch(error) {
      console.log('authRouter changePassword error', error)
      if (error instanceof TRPCError && error.code === 'BAD_REQUEST') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message
        })
      } else {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong'
        })
      }
    }
  }),
  forgotPassword: publicProcedure.input(
    z.object({
      email: z.string().email()
    })
  ).mutation(async({input}) => {
    try {
      const {email} = input
      const user = await prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive'
          }
        }
      })
      if (!user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'This email address is not registered'
        })
      }
      const existingToken = await prisma.passwordResetToken.findFirst({
        where: {
          userId: user.id,
          expiry: {
            gt: new Date()
          },
          createdAt: {
            gt: new Date(Date.now() - ONE_HOUR)
          }
        }
      })
      if (existingToken) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Password reset email already sent'
        })
      }
      const token = crypto.randomBytes(18).toString('hex')
      console.log('authRouter resetPassword token', token)
      await prisma.passwordResetToken.create({
        data: {
          token,  
          expiry: new Date(Date.now() + ONE_DAY),
          userId: user.id
        }
      })
      await sendForgotPassword({
        userId: user.id
      })
    } catch(error) {
      console.log('authRouter resetPassword error', error)
      if (error instanceof TRPCError && error.code === 'BAD_REQUEST') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message
        })
      } else {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong'
        })
      }
    }
  }),
  getResetTokenValidity: publicProcedure.input(
    z.object({
      token: z.string()
    })
  ).query(async({input}) => {
    try {
      const {token} = input
      const foundToken = await prisma.passwordResetToken.findFirst({
        where: {
          token
        },
        select: {
          id: true,
          expiry: true
        }
      })
      return !!foundToken && foundToken.expiry > new Date()
    } catch(error) {
      console.log('authRouter getResetTokenValidity error', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong'
      })
    }
  }),
  resetPassword: publicProcedure.input(
    z.object({
      token: z.string(),
      password: z.string()
    })
  ).mutation(async({input}) => {
    try {
      const {token, password} = input
      const foundToken = await prisma.passwordResetToken.findFirst({
        where: {
          token
        },
        include: {
          User: true
        }
      })
      if (!foundToken) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid token. Please request a new password reset email.'
        })
      }
      const now = new Date()
      if (now > foundToken.expiry) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Token expired. Please request a new password reset email.'
        })
      }
      const isSamePassword = await bcrypt.compare(
        password,
        foundToken.User.hashedPassword || ''
      )
      if (isSamePassword) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'New password must be different from current password'
        })
      }
      const hashedPassword = await bcrypt.hash(password, 12)
      console.log('resetPassword hashedPassword', hashedPassword)
      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: foundToken.userId
          },
          data: {
            hashedPassword
          }
        }),
        prisma.passwordResetToken.deleteMany({
          where: {
            userId: foundToken.userId
          }
        })
      ])
      await sendResetPassword({userId: foundToken.userId})
    } catch(error) {
      console.log('authRouter resetPassword error', error)
      if (error instanceof TRPCError && error.code === 'BAD_REQUEST') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message
        })
      } else {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong'
        })
      }
    }
  })
})