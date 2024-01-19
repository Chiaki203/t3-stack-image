import { redirect } from 'next/navigation'
import { getAuthSession } from '@/lib/nextauth'
import { getSubscription } from '@/actions/subscription'
import Billing from '@/components/settings/Billing'

const BillingPage = async () => {
  const user = await getAuthSession()
  if (!user) {
    redirect('/login')
  }
  const { subscription, isSubscribed } = await getSubscription({
    userId: user.id,
  })
  return <Billing subscription={subscription} isSubscribed={isSubscribed} />
}

export default BillingPage
