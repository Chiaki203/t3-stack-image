import { TRPCError } from '@trpc/server';
import prisma from '@/lib/prisma';
import { sendEmail } from './sendEmail';

interface SendResetPasswordOptions {
  userId: string
}

export const sendResetPassword = async({userId}:SendResetPasswordOptions) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })
  if (!user || !user.email) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'User not found'
    })
  }
  const subject = 'Password reset successful'
  const body = `
    <div>
      <p>Your password has been reset successfully.</p>
      <p>If you didn't request a password reset, please contact us.</p>
    </div>
  `
  await sendEmail(subject, body, user.email)
}