import { getAuthSession } from '@/lib/nextauth'
import { redirect } from 'next/navigation'
import { trpc } from '@/trpc/client'
import { getSubscription } from '@/actions/subscription'
import Payment from '@/components/subscription/Payment'

const PaymentPage = async () => {
  const user = await getAuthSession()
  if (!user) {
    redirect('/login')
  }
  const { isSubscribed } = await getSubscription({ userId: user?.id })
  if (isSubscribed) {
    redirect('/settings/billing')
  }
  const prices = await trpc.subscription.getPrices()
  return <Payment prices={prices} />
}

export default PaymentPage
