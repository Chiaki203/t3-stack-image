import { getAuthSession } from '@/lib/nextauth'
import { redirect } from 'next/navigation'
import { trpc } from '@/trpc/client'
import Success from '@/components/subscription/Success'

const successPage = async () => {
  const user = await getAuthSession()
  if (!user) {
    redirect('/login')
  }
  const subscriptions = await trpc.subscription.getSubscriptionInfo()
  return <Success subscriptions={subscriptions.data} />
}

export default successPage
