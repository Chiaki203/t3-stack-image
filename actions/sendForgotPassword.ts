import { TRPCError } from '@trpc/server';
import prisma from '@/lib/prisma';
import { sendEmail } from './sendEmail';

interface SendForgotPasswordOptions {
  userId: string
}

export const sendForgotPassword = async({userId}:SendForgotPasswordOptions) => {
  const user = await prisma.user.findUnique({
    where: {id:userId},
    include: {
      PasswordResetToken: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    }
  })
  if (!user || !user.email) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'User not found'
    })
  }
  const token = user.PasswordResetToken[0].token
  const resetPasswordLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`
  const subject = 'Reset your password'
  const body = `
    <div>
      <p>Click the link below to reset your password.</p>
      <p><a href="${resetPasswordLink}">${resetPasswordLink}</a></p>
      <p>This link is valid for 24 hours.</p>
      <p>If you didn't request a password reset, you can ignore this email.</p>
    </div>
  `
  await sendEmail(subject, body, user.email)
}