import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/nextauth'
import { trpc } from '@/trpc/client'
import ResetPassword from '@/components/auth/ResetPassword'

interface ResetPasswordProps {
  params: {
    token: string
  }
}

const ResetPasswordPage = async ({ params }: ResetPasswordProps) => {
  const { token } = params
  const user = await getAuthSession()
  if (user) {
    redirect('/')
  }
  const isValid = await trpc.auth.getResetTokenValidity({ token })
  if (!isValid) {
    redirect('/reset-password')
  }
  return <ResetPassword token={token} />
}

export default ResetPasswordPage
